#!/usr/bin/env python3
"""
AnnotateAI Synthetic Data Generation Service
Production-ready FastAPI service for AI-powered synthetic data generation
"""

import asyncio
import logging
import os
import time
from contextlib import asynccontextmanager
from typing import Dict, List, Optional, Any, Union
from uuid import uuid4

import cv2
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image, ImageEnhance, ImageFilter
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from redis import Redis
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from prometheus_client.exposition import MetricsHandler
from diffusers import (
    StableDiffusionXLPipeline,
    DiffusionPipeline,
    ControlNetModel,
    StableDiffusionXLControlNetPipeline,
    EulerDiscreteScheduler,
    DDIMScheduler,
    LMSDiscreteScheduler
)
from transformers import CLIPTextModel, CLIPTokenizer
from controlnet_aux import CannyDetector, OpenposeDetector, MidasDetector
import albumentations as A
from albumentations.pytorch import ToTensorV2
import segmentation_models_pytorch as smp
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import lpips
import torch.nn as nn
from torchvision.transforms import transforms
from torchvision.models import inception_v3
from scipy.linalg import sqrtm
import pandas as pd
from datetime import datetime, timedelta
import io
import json
import base64
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment configuration
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
MODEL_CACHE_DIR = os.getenv("MODEL_CACHE_DIR", "/app/models")
HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN")

# Prometheus metrics
REQUEST_COUNT = Counter('synthetic_data_requests_total', 'Total requests', ['endpoint', 'method'])
REQUEST_DURATION = Histogram('synthetic_data_request_duration_seconds', 'Request duration', ['endpoint'])
GENERATION_COUNT = Counter('synthetic_data_generations_total', 'Total generations', ['model_type'])
GENERATION_DURATION = Histogram('synthetic_data_generation_duration_seconds', 'Generation duration', ['model_type'])
ACTIVE_GENERATIONS = Gauge('synthetic_data_active_generations', 'Active generations')
MODEL_LOAD_TIME = Histogram('synthetic_data_model_load_seconds', 'Model load time', ['model_name'])
MEMORY_USAGE = Gauge('synthetic_data_memory_usage_bytes', 'Memory usage')
GPU_UTILIZATION = Gauge('synthetic_data_gpu_utilization_percent', 'GPU utilization')

# Pydantic models
class DiffusionConfig(BaseModel):
    """Configuration for diffusion model generation"""
    model_type: str = Field(default="stable-diffusion-xl", description="Model type")
    prompt: str = Field(..., description="Generation prompt")
    negative_prompt: Optional[str] = Field(default="", description="Negative prompt")
    width: int = Field(default=1024, ge=512, le=2048, description="Image width")
    height: int = Field(default=1024, ge=512, le=2048, description="Image height")
    num_inference_steps: int = Field(default=20, ge=1, le=100, description="Inference steps")
    guidance_scale: float = Field(default=7.5, ge=1.0, le=20.0, description="Guidance scale")
    num_images_per_prompt: int = Field(default=1, ge=1, le=8, description="Images per prompt")
    seed: Optional[int] = Field(default=None, description="Random seed")
    scheduler: str = Field(default="euler", description="Scheduler type")
    strength: float = Field(default=1.0, ge=0.1, le=1.0, description="Denoising strength")
    controlnet_conditioning_scale: float = Field(default=1.0, ge=0.1, le=2.0, description="ControlNet scale")
    use_controlnet: bool = Field(default=False, description="Use ControlNet")
    controlnet_type: Optional[str] = Field(default=None, description="ControlNet type")
    control_image: Optional[str] = Field(default=None, description="Control image (base64)")

class AugmentationConfig(BaseModel):
    """Configuration for data augmentation"""
    geometric_transforms: bool = Field(default=True, description="Enable geometric transforms")
    color_transforms: bool = Field(default=True, description="Enable color transforms")
    noise_transforms: bool = Field(default=True, description="Enable noise transforms")
    blur_transforms: bool = Field(default=True, description="Enable blur transforms")
    rotation_range: float = Field(default=15.0, ge=0.0, le=90.0, description="Rotation range in degrees")
    zoom_range: float = Field(default=0.1, ge=0.0, le=0.5, description="Zoom range")
    brightness_range: float = Field(default=0.2, ge=0.0, le=1.0, description="Brightness range")
    contrast_range: float = Field(default=0.2, ge=0.0, le=1.0, description="Contrast range")
    saturation_range: float = Field(default=0.2, ge=0.0, le=1.0, description="Saturation range")
    hue_range: float = Field(default=0.1, ge=0.0, le=0.5, description="Hue range")
    noise_std: float = Field(default=0.01, ge=0.0, le=0.1, description="Noise standard deviation")
    blur_kernel_size: int = Field(default=3, ge=1, le=15, description="Blur kernel size")
    augmentation_factor: int = Field(default=1, ge=1, le=10, description="Augmentation factor")

class QualityConfig(BaseModel):
    """Configuration for quality assessment"""
    metrics: List[str] = Field(default=["fid", "is", "lpips", "ssim"], description="Quality metrics")
    fid_threshold: float = Field(default=50.0, ge=0.0, le=200.0, description="FID threshold")
    is_threshold: float = Field(default=2.0, ge=0.0, le=10.0, description="IS threshold")
    lpips_threshold: float = Field(default=0.5, ge=0.0, le=1.0, description="LPIPS threshold")
    ssim_threshold: float = Field(default=0.5, ge=0.0, le=1.0, description="SSIM threshold")
    diversity_threshold: float = Field(default=0.5, ge=0.0, le=1.0, description="Diversity threshold")
    min_resolution: int = Field(default=512, ge=256, le=2048, description="Minimum resolution")
    max_aspect_ratio: float = Field(default=3.0, ge=1.0, le=10.0, description="Maximum aspect ratio")
    filter_duplicates: bool = Field(default=True, description="Filter duplicate images")
    filter_low_quality: bool = Field(default=True, description="Filter low quality images")

class DomainAdaptationConfig(BaseModel):
    """Configuration for domain adaptation"""
    source_domain: str = Field(..., description="Source domain")
    target_domain: str = Field(..., description="Target domain")
    adaptation_method: str = Field(default="style_transfer", description="Adaptation method")
    style_weight: float = Field(default=1.0, ge=0.0, le=10.0, description="Style weight")
    content_weight: float = Field(default=1.0, ge=0.0, le=10.0, description="Content weight")
    preserve_semantics: bool = Field(default=True, description="Preserve semantic content")
    num_iterations: int = Field(default=100, ge=1, le=1000, description="Number of iterations")
    learning_rate: float = Field(default=0.01, ge=0.001, le=0.1, description="Learning rate")

class SyntheticDataRequest(BaseModel):
    """Request for synthetic data generation"""
    task_id: str = Field(default_factory=lambda: str(uuid4()), description="Task ID")
    diffusion_config: DiffusionConfig = Field(..., description="Diffusion configuration")
    augmentation_config: Optional[AugmentationConfig] = Field(default=None, description="Augmentation configuration")
    quality_config: Optional[QualityConfig] = Field(default=None, description="Quality configuration")
    domain_adaptation_config: Optional[DomainAdaptationConfig] = Field(default=None, description="Domain adaptation configuration")
    output_format: str = Field(default="png", description="Output format")
    batch_size: int = Field(default=1, ge=1, le=32, description="Batch size")
    async_processing: bool = Field(default=False, description="Async processing")

class GenerationResult(BaseModel):
    """Result of synthetic data generation"""
    task_id: str = Field(..., description="Task ID")
    status: str = Field(..., description="Generation status")
    images: List[Dict[str, Any]] = Field(default=[], description="Generated images")
    metadata: Dict[str, Any] = Field(default={}, description="Generation metadata")
    quality_report: Optional[Dict[str, Any]] = Field(default=None, description="Quality report")
    error_message: Optional[str] = Field(default=None, description="Error message")
    generation_time: float = Field(default=0.0, description="Generation time in seconds")
    created_at: datetime = Field(default_factory=datetime.now, description="Creation timestamp")

class SyntheticDataService:
    """Main synthetic data generation service"""
    
    def __init__(self):
        self.redis_client = Redis.from_url(REDIS_URL)
        self.models = {}
        self.quality_evaluator = None
        self.augmentation_pipeline = None
        self.domain_adaptor = None
        self.active_tasks = {}
        
    async def initialize(self):
        """Initialize the service"""
        logger.info("Initializing Synthetic Data Service...")
        
        # Initialize models
        await self._load_diffusion_models()
        await self._load_controlnet_models()
        await self._initialize_quality_evaluator()
        await self._initialize_augmentation_pipeline()
        await self._initialize_domain_adaptor()
        
        logger.info("Synthetic Data Service initialized successfully")
    
    async def _load_diffusion_models(self):
        """Load diffusion models"""
        logger.info("Loading diffusion models...")
        
        try:
            # Load Stable Diffusion XL
            with MODEL_LOAD_TIME.labels(model_name="stable-diffusion-xl").time():
                self.models["stable-diffusion-xl"] = StableDiffusionXLPipeline.from_pretrained(
                    "stabilityai/stable-diffusion-xl-base-1.0",
                    torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
                    use_auth_token=HUGGINGFACE_TOKEN,
                    cache_dir=MODEL_CACHE_DIR
                ).to(DEVICE)
                
            # Load additional models if available
            if DEVICE == "cuda":
                # Enable memory efficient attention
                self.models["stable-diffusion-xl"].enable_attention_slicing()
                self.models["stable-diffusion-xl"].enable_model_cpu_offload()
                
        except Exception as e:
            logger.error(f"Failed to load diffusion models: {e}")
            raise
    
    async def _load_controlnet_models(self):
        """Load ControlNet models"""
        logger.info("Loading ControlNet models...")
        
        try:
            # Load ControlNet models
            self.models["controlnet"] = {
                "canny": ControlNetModel.from_pretrained(
                    "diffusers/controlnet-canny-sdxl-1.0",
                    torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
                    use_auth_token=HUGGINGFACE_TOKEN,
                    cache_dir=MODEL_CACHE_DIR
                ).to(DEVICE),
                "openpose": ControlNetModel.from_pretrained(
                    "thibaud/controlnet-openpose-sdxl-1.0",
                    torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
                    use_auth_token=HUGGINGFACE_TOKEN,
                    cache_dir=MODEL_CACHE_DIR
                ).to(DEVICE),
                "depth": ControlNetModel.from_pretrained(
                    "diffusers/controlnet-depth-sdxl-1.0",
                    torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
                    use_auth_token=HUGGINGFACE_TOKEN,
                    cache_dir=MODEL_CACHE_DIR
                ).to(DEVICE)
            }
            
            # Load ControlNet pipeline
            self.models["controlnet-pipeline"] = StableDiffusionXLControlNetPipeline.from_pretrained(
                "stabilityai/stable-diffusion-xl-base-1.0",
                controlnet=self.models["controlnet"]["canny"],
                torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
                use_auth_token=HUGGINGFACE_TOKEN,
                cache_dir=MODEL_CACHE_DIR
            ).to(DEVICE)
            
            # Load control preprocessors
            self.models["preprocessors"] = {
                "canny": CannyDetector(),
                "openpose": OpenposeDetector.from_pretrained('lllyasviel/Annotators'),
                "depth": MidasDetector.from_pretrained('lllyasviel/Annotators')
            }
            
        except Exception as e:
            logger.error(f"Failed to load ControlNet models: {e}")
            raise
    
    async def _initialize_quality_evaluator(self):
        """Initialize quality evaluation system"""
        logger.info("Initializing quality evaluator...")
        
        try:
            # Initialize LPIPS model
            self.quality_evaluator = {
                "lpips": lpips.LPIPS(net='alex').to(DEVICE),
                "inception": inception_v3(pretrained=True, transform_input=False).to(DEVICE)
            }
            
            # Set models to evaluation mode
            for model in self.quality_evaluator.values():
                model.eval()
                
        except Exception as e:
            logger.error(f"Failed to initialize quality evaluator: {e}")
            raise
    
    async def _initialize_augmentation_pipeline(self):
        """Initialize augmentation pipeline"""
        logger.info("Initializing augmentation pipeline...")
        
        try:
            # Define augmentation transforms
            self.augmentation_pipeline = {
                "geometric": A.Compose([
                    A.Rotate(limit=15, p=0.5),
                    A.RandomScale(scale_limit=0.1, p=0.5),
                    A.HorizontalFlip(p=0.5),
                    A.VerticalFlip(p=0.2),
                    A.ShiftScaleRotate(shift_limit=0.1, scale_limit=0.1, rotate_limit=15, p=0.5),
                    A.ElasticTransform(p=0.3),
                    A.OpticalDistortion(p=0.3),
                    A.GridDistortion(p=0.3)
                ]),
                "color": A.Compose([
                    A.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1, p=0.5),
                    A.HueSaturationValue(hue_shift_limit=20, sat_shift_limit=30, val_shift_limit=20, p=0.5),
                    A.RandomGamma(gamma_limit=(80, 120), p=0.5),
                    A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.5),
                    A.CLAHE(clip_limit=2.0, p=0.3),
                    A.ChannelShuffle(p=0.2)
                ]),
                "noise": A.Compose([
                    A.GaussNoise(var_limit=(10, 50), p=0.5),
                    A.ISONoise(color_shift=(0.01, 0.05), intensity=(0.1, 0.5), p=0.3),
                    A.MultiplicativeNoise(multiplier=[0.9, 1.1], p=0.3),
                    A.Spatter(p=0.2)
                ]),
                "blur": A.Compose([
                    A.Blur(blur_limit=3, p=0.3),
                    A.GaussianBlur(blur_limit=3, p=0.3),
                    A.MotionBlur(blur_limit=3, p=0.3),
                    A.MedianBlur(blur_limit=3, p=0.2)
                ])
            }
            
        except Exception as e:
            logger.error(f"Failed to initialize augmentation pipeline: {e}")
            raise
    
    async def _initialize_domain_adaptor(self):
        """Initialize domain adaptation system"""
        logger.info("Initializing domain adaptor...")
        
        try:
            # Load pre-trained VGG for style transfer
            from torchvision.models import vgg19
            vgg = vgg19(pretrained=True).features.to(DEVICE)
            
            # Freeze VGG parameters
            for param in vgg.parameters():
                param.requires_grad_(False)
            
            self.domain_adaptor = {
                "vgg": vgg,
                "style_layers": ['conv_1', 'conv_2', 'conv_3', 'conv_4', 'conv_5'],
                "content_layers": ['conv_4']
            }
            
        except Exception as e:
            logger.error(f"Failed to initialize domain adaptor: {e}")
            raise
    
    async def generate_synthetic_data(self, request: SyntheticDataRequest) -> GenerationResult:
        """Generate synthetic data"""
        start_time = time.time()
        task_id = request.task_id
        
        try:
            ACTIVE_GENERATIONS.inc()
            GENERATION_COUNT.labels(model_type=request.diffusion_config.model_type).inc()
            
            # Store task status
            self.active_tasks[task_id] = {
                "status": "processing",
                "start_time": start_time,
                "config": request.dict()
            }
            
            # Generate images
            images = await self._generate_images(request.diffusion_config)
            
            # Apply augmentations if configured
            if request.augmentation_config:
                images = await self._apply_augmentations(images, request.augmentation_config)
            
            # Apply domain adaptation if configured
            if request.domain_adaptation_config:
                images = await self._apply_domain_adaptation(images, request.domain_adaptation_config)
            
            # Quality assessment
            quality_report = None
            if request.quality_config:
                quality_report = await self._assess_quality(images, request.quality_config)
                
                # Filter low quality images
                if request.quality_config.filter_low_quality:
                    images = await self._filter_low_quality_images(images, quality_report)
            
            # Prepare result
            generation_time = time.time() - start_time
            result = GenerationResult(
                task_id=task_id,
                status="completed",
                images=images,
                metadata={
                    "generation_time": generation_time,
                    "model_type": request.diffusion_config.model_type,
                    "num_images": len(images),
                    "device": DEVICE,
                    "config": request.dict()
                },
                quality_report=quality_report,
                generation_time=generation_time
            )
            
            # Update metrics
            GENERATION_DURATION.labels(model_type=request.diffusion_config.model_type).observe(generation_time)
            
            # Cache result
            await self._cache_result(task_id, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Generation failed for task {task_id}: {e}")
            
            result = GenerationResult(
                task_id=task_id,
                status="failed",
                error_message=str(e),
                generation_time=time.time() - start_time
            )
            
            await self._cache_result(task_id, result)
            return result
            
        finally:
            ACTIVE_GENERATIONS.dec()
            if task_id in self.active_tasks:
                del self.active_tasks[task_id]
    
    async def _generate_images(self, config: DiffusionConfig) -> List[Dict[str, Any]]:
        """Generate images using diffusion model"""
        logger.info(f"Generating {config.num_images_per_prompt} images with {config.model_type}")
        
        # Select model
        if config.use_controlnet and config.controlnet_type and config.control_image:
            pipeline = self.models["controlnet-pipeline"]
            
            # Process control image
            control_image = self._decode_base64_image(config.control_image)
            
            # Apply control preprocessing
            if config.controlnet_type in self.models["preprocessors"]:
                control_image = self.models["preprocessors"][config.controlnet_type](control_image)
            
            # Switch ControlNet if needed
            if config.controlnet_type != "canny":
                pipeline.controlnet = self.models["controlnet"][config.controlnet_type]
            
            # Generate with ControlNet
            result = pipeline(
                prompt=config.prompt,
                negative_prompt=config.negative_prompt,
                image=control_image,
                width=config.width,
                height=config.height,
                num_inference_steps=config.num_inference_steps,
                guidance_scale=config.guidance_scale,
                num_images_per_prompt=config.num_images_per_prompt,
                generator=torch.Generator(device=DEVICE).manual_seed(config.seed) if config.seed else None,
                controlnet_conditioning_scale=config.controlnet_conditioning_scale
            )
        else:
            # Generate with standard diffusion
            pipeline = self.models[config.model_type]
            
            # Set scheduler
            if config.scheduler == "ddim":
                pipeline.scheduler = DDIMScheduler.from_config(pipeline.scheduler.config)
            elif config.scheduler == "lms":
                pipeline.scheduler = LMSDiscreteScheduler.from_config(pipeline.scheduler.config)
            else:
                pipeline.scheduler = EulerDiscreteScheduler.from_config(pipeline.scheduler.config)
            
            result = pipeline(
                prompt=config.prompt,
                negative_prompt=config.negative_prompt,
                width=config.width,
                height=config.height,
                num_inference_steps=config.num_inference_steps,
                guidance_scale=config.guidance_scale,
                num_images_per_prompt=config.num_images_per_prompt,
                generator=torch.Generator(device=DEVICE).manual_seed(config.seed) if config.seed else None
            )
        
        # Process results
        images = []
        for i, image in enumerate(result.images):
            # Convert to base64
            buffer = io.BytesIO()
            image.save(buffer, format="PNG")
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            images.append({
                "index": i,
                "data": image_base64,
                "format": "png",
                "width": image.width,
                "height": image.height,
                "metadata": {
                    "prompt": config.prompt,
                    "negative_prompt": config.negative_prompt,
                    "seed": config.seed,
                    "guidance_scale": config.guidance_scale,
                    "num_inference_steps": config.num_inference_steps,
                    "scheduler": config.scheduler
                }
            })
        
        return images
    
    async def _apply_augmentations(self, images: List[Dict[str, Any]], config: AugmentationConfig) -> List[Dict[str, Any]]:
        """Apply augmentations to images"""
        logger.info(f"Applying augmentations with factor {config.augmentation_factor}")
        
        augmented_images = []
        
        for image_data in images:
            # Decode image
            image = self._decode_base64_image(image_data["data"])
            image_np = np.array(image)
            
            # Apply augmentations
            for i in range(config.augmentation_factor):
                augmented_image = image_np.copy()
                
                # Apply geometric transforms
                if config.geometric_transforms:
                    augmented_image = self.augmentation_pipeline["geometric"](image=augmented_image)["image"]
                
                # Apply color transforms
                if config.color_transforms:
                    augmented_image = self.augmentation_pipeline["color"](image=augmented_image)["image"]
                
                # Apply noise transforms
                if config.noise_transforms:
                    augmented_image = self.augmentation_pipeline["noise"](image=augmented_image)["image"]
                
                # Apply blur transforms
                if config.blur_transforms:
                    augmented_image = self.augmentation_pipeline["blur"](image=augmented_image)["image"]
                
                # Convert back to base64
                augmented_pil = Image.fromarray(augmented_image)
                buffer = io.BytesIO()
                augmented_pil.save(buffer, format="PNG")
                augmented_base64 = base64.b64encode(buffer.getvalue()).decode()
                
                augmented_images.append({
                    **image_data,
                    "data": augmented_base64,
                    "index": len(augmented_images),
                    "metadata": {
                        **image_data["metadata"],
                        "augmentation_index": i,
                        "augmentation_config": config.dict()
                    }
                })
        
        return augmented_images
    
    async def _apply_domain_adaptation(self, images: List[Dict[str, Any]], config: DomainAdaptationConfig) -> List[Dict[str, Any]]:
        """Apply domain adaptation to images"""
        logger.info(f"Applying domain adaptation from {config.source_domain} to {config.target_domain}")
        
        # This is a simplified implementation
        # In practice, you would implement more sophisticated domain adaptation techniques
        
        adapted_images = []
        
        for image_data in images:
            # Decode image
            image = self._decode_base64_image(image_data["data"])
            
            # Apply domain adaptation (simplified style transfer)
            adapted_image = await self._apply_style_transfer(image, config)
            
            # Convert back to base64
            buffer = io.BytesIO()
            adapted_image.save(buffer, format="PNG")
            adapted_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            adapted_images.append({
                **image_data,
                "data": adapted_base64,
                "metadata": {
                    **image_data["metadata"],
                    "domain_adaptation": config.dict()
                }
            })
        
        return adapted_images
    
    async def _apply_style_transfer(self, image: Image.Image, config: DomainAdaptationConfig) -> Image.Image:
        """Apply style transfer for domain adaptation"""
        # Simplified style transfer implementation
        # In practice, you would use more sophisticated methods
        
        # Convert to tensor
        transform = transforms.Compose([
            transforms.Resize((512, 512)),
            transforms.ToTensor()
        ])
        
        image_tensor = transform(image).unsqueeze(0).to(DEVICE)
        
        # Apply simple color adjustment for domain adaptation
        if config.target_domain == "medical":
            # Adjust for medical domain (grayscale, high contrast)
            image_tensor = torch.mean(image_tensor, dim=1, keepdim=True)
            image_tensor = torch.cat([image_tensor] * 3, dim=1)
            image_tensor = torch.clamp(image_tensor * 1.2, 0, 1)
        elif config.target_domain == "automotive":
            # Adjust for automotive domain (brighter, more saturation)
            image_tensor[:, 0] *= 1.1  # Red channel
            image_tensor[:, 1] *= 1.05  # Green channel
            image_tensor[:, 2] *= 0.95  # Blue channel
        
        # Convert back to PIL
        image_tensor = torch.clamp(image_tensor, 0, 1)
        image_np = image_tensor.squeeze(0).permute(1, 2, 0).cpu().numpy()
        adapted_image = Image.fromarray((image_np * 255).astype(np.uint8))
        
        return adapted_image
    
    async def _assess_quality(self, images: List[Dict[str, Any]], config: QualityConfig) -> Dict[str, Any]:
        """Assess image quality"""
        logger.info(f"Assessing quality with metrics: {config.metrics}")
        
        quality_report = {
            "overall_score": 0.0,
            "metrics": {},
            "passed_images": [],
            "failed_images": [],
            "statistics": {}
        }
        
        # Convert images to tensors
        image_tensors = []
        for image_data in images:
            image = self._decode_base64_image(image_data["data"])
            image_tensor = transforms.ToTensor()(image).unsqueeze(0).to(DEVICE)
            image_tensors.append(image_tensor)
        
        if len(image_tensors) == 0:
            return quality_report
        
        # Calculate metrics
        total_score = 0.0
        metric_count = 0
        
        if "lpips" in config.metrics and len(image_tensors) > 1:
            # Calculate LPIPS diversity
            lpips_scores = []
            for i in range(len(image_tensors)):
                for j in range(i+1, len(image_tensors)):
                    score = self.quality_evaluator["lpips"](image_tensors[i], image_tensors[j])
                    lpips_scores.append(score.item())
            
            avg_lpips = np.mean(lpips_scores)
            quality_report["metrics"]["lpips"] = {
                "value": avg_lpips,
                "threshold": config.lpips_threshold,
                "passed": avg_lpips > config.lpips_threshold
            }
            total_score += avg_lpips
            metric_count += 1
        
        if "ssim" in config.metrics and len(image_tensors) > 1:
            # Calculate SSIM
            ssim_scores = []
            for i in range(len(image_tensors)):
                for j in range(i+1, len(image_tensors)):
                    ssim_score = self._calculate_ssim(image_tensors[i], image_tensors[j])
                    ssim_scores.append(ssim_score)
            
            avg_ssim = np.mean(ssim_scores)
            quality_report["metrics"]["ssim"] = {
                "value": avg_ssim,
                "threshold": config.ssim_threshold,
                "passed": avg_ssim > config.ssim_threshold
            }
            total_score += avg_ssim
            metric_count += 1
        
        if "diversity" in config.metrics and len(image_tensors) > 1:
            # Calculate diversity using clustering
            diversity_score = await self._calculate_diversity(image_tensors)
            quality_report["metrics"]["diversity"] = {
                "value": diversity_score,
                "threshold": config.diversity_threshold,
                "passed": diversity_score > config.diversity_threshold
            }
            total_score += diversity_score
            metric_count += 1
        
        # Calculate overall score
        if metric_count > 0:
            quality_report["overall_score"] = total_score / metric_count
        
        # Identify passed/failed images
        for i, image_data in enumerate(images):
            image_score = quality_report["overall_score"]  # Simplified
            if image_score > 0.5:  # Threshold
                quality_report["passed_images"].append(i)
            else:
                quality_report["failed_images"].append(i)
        
        return quality_report
    
    def _calculate_ssim(self, img1: torch.Tensor, img2: torch.Tensor) -> float:
        """Calculate SSIM between two images"""
        # Simplified SSIM calculation
        mu1 = torch.mean(img1)
        mu2 = torch.mean(img2)
        sigma1 = torch.std(img1)
        sigma2 = torch.std(img2)
        sigma12 = torch.mean((img1 - mu1) * (img2 - mu2))
        
        c1 = 0.01 ** 2
        c2 = 0.03 ** 2
        
        ssim = ((2 * mu1 * mu2 + c1) * (2 * sigma12 + c2)) / ((mu1 ** 2 + mu2 ** 2 + c1) * (sigma1 ** 2 + sigma2 ** 2 + c2))
        return ssim.item()
    
    async def _calculate_diversity(self, image_tensors: List[torch.Tensor]) -> float:
        """Calculate diversity score using clustering"""
        # Extract features
        features = []
        for tensor in image_tensors:
            # Use average pooling to get feature vector
            feature = torch.mean(tensor, dim=(2, 3)).squeeze().cpu().numpy()
            features.append(feature)
        
        features = np.array(features)
        
        # Perform clustering
        if len(features) > 1:
            kmeans = KMeans(n_clusters=min(len(features), 5), random_state=42)
            labels = kmeans.fit_predict(features)
            
            # Calculate silhouette score as diversity metric
            if len(set(labels)) > 1:
                diversity_score = silhouette_score(features, labels)
                return max(0, (diversity_score + 1) / 2)  # Normalize to [0, 1]
        
        return 0.5  # Default diversity score
    
    async def _filter_low_quality_images(self, images: List[Dict[str, Any]], quality_report: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Filter out low quality images"""
        passed_indices = quality_report.get("passed_images", [])
        filtered_images = [images[i] for i in passed_indices if i < len(images)]
        
        logger.info(f"Filtered {len(images) - len(filtered_images)} low quality images")
        return filtered_images
    
    def _decode_base64_image(self, base64_string: str) -> Image.Image:
        """Decode base64 string to PIL Image"""
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        return image
    
    async def _cache_result(self, task_id: str, result: GenerationResult):
        """Cache generation result"""
        try:
            result_json = result.json()
            self.redis_client.setex(f"synthetic_data:{task_id}", 3600, result_json)
        except Exception as e:
            logger.error(f"Failed to cache result for task {task_id}: {e}")
    
    async def get_cached_result(self, task_id: str) -> Optional[GenerationResult]:
        """Get cached generation result"""
        try:
            cached_data = self.redis_client.get(f"synthetic_data:{task_id}")
            if cached_data:
                return GenerationResult.parse_raw(cached_data)
        except Exception as e:
            logger.error(f"Failed to get cached result for task {task_id}: {e}")
        return None

# Initialize service
service = SyntheticDataService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    await service.initialize()
    yield
    # Cleanup if needed

# Create FastAPI app
app = FastAPI(
    title="AnnotateAI Synthetic Data Service",
    description="Production-ready synthetic data generation service with Stable Diffusion XL and ControlNet",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request, call_next):
    """Add request processing time header"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # Update metrics
    REQUEST_COUNT.labels(endpoint=request.url.path, method=request.method).inc()
    REQUEST_DURATION.labels(endpoint=request.url.path).observe(process_time)
    
    return response

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "device": DEVICE,
        "models_loaded": len(service.models) > 0
    }

@app.get("/models")
async def list_models():
    """List available models"""
    return {
        "diffusion_models": list(service.models.keys()),
        "controlnet_models": list(service.models.get("controlnet", {}).keys()),
        "preprocessors": list(service.models.get("preprocessors", {}).keys())
    }

@app.post("/generate", response_model=GenerationResult)
async def generate_synthetic_data(
    request: SyntheticDataRequest,
    background_tasks: BackgroundTasks
):
    """Generate synthetic data"""
    if request.async_processing:
        # Process in background
        background_tasks.add_task(service.generate_synthetic_data, request)
        return GenerationResult(
            task_id=request.task_id,
            status="queued",
            metadata={"async": True}
        )
    else:
        # Process synchronously
        return await service.generate_synthetic_data(request)

@app.get("/task/{task_id}", response_model=GenerationResult)
async def get_task_status(task_id: str):
    """Get task status"""
    # Check active tasks
    if task_id in service.active_tasks:
        return GenerationResult(
            task_id=task_id,
            status="processing",
            metadata=service.active_tasks[task_id]
        )
    
    # Check cache
    cached_result = await service.get_cached_result(task_id)
    if cached_result:
        return cached_result
    
    raise HTTPException(status_code=404, detail="Task not found")

@app.post("/augment")
async def augment_images(
    images: List[UploadFile] = File(...),
    config: AugmentationConfig = None
):
    """Augment uploaded images"""
    if config is None:
        config = AugmentationConfig()
    
    # Process uploaded images
    image_data_list = []
    for upload_file in images:
        image_data = await upload_file.read()
        image_base64 = base64.b64encode(image_data).decode()
        image_data_list.append({
            "data": image_base64,
            "format": "png",
            "metadata": {"original_filename": upload_file.filename}
        })
    
    # Apply augmentations
    augmented_images = await service._apply_augmentations(image_data_list, config)
    
    return {
        "status": "completed",
        "original_count": len(image_data_list),
        "augmented_count": len(augmented_images),
        "images": augmented_images
    }

@app.post("/quality-assessment")
async def assess_quality(
    images: List[UploadFile] = File(...),
    config: QualityConfig = None
):
    """Assess image quality"""
    if config is None:
        config = QualityConfig()
    
    # Process uploaded images
    image_data_list = []
    for upload_file in images:
        image_data = await upload_file.read()
        image_base64 = base64.b64encode(image_data).decode()
        image_data_list.append({
            "data": image_base64,
            "format": "png",
            "metadata": {"original_filename": upload_file.filename}
        })
    
    # Assess quality
    quality_report = await service._assess_quality(image_data_list, config)
    
    return {
        "status": "completed",
        "quality_report": quality_report
    }

@app.get("/metrics")
async def get_metrics():
    """Get Prometheus metrics"""
    return StreamingResponse(generate_latest(), media_type="text/plain")

@app.get("/stats")
async def get_stats():
    """Get service statistics"""
    return {
        "active_tasks": len(service.active_tasks),
        "models_loaded": len(service.models),
        "device": DEVICE,
        "memory_usage": torch.cuda.memory_allocated() if torch.cuda.is_available() else 0,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 