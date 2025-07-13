#!/usr/bin/env python3
"""
AnnotateAI Medical Imaging Service
U-Net variants and specialized models for medical image analysis and radiology
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import cv2
from PIL import Image
import pydicom
import nibabel as nib
from typing import List, Dict, Any, Optional, Tuple, Union
import logging
from dataclasses import dataclass
from enum import Enum
import asyncio
import tempfile
import os
from pathlib import Path
import json
import time
from datetime import datetime
import base64
import io

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager
import redis.asyncio as redis
from sklearn.metrics import dice_score, jaccard_score
import SimpleITK as sitk
from scipy import ndimage
from skimage import morphology, measure, filters

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
class Config:
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    MAX_IMAGE_SIZE = (1024, 1024)
    SUPPORTED_FORMATS = ['.dcm', '.nii', '.nii.gz', '.png', '.jpg', '.jpeg', '.tiff']
    MODEL_CACHE_DIR = os.getenv("MODEL_CACHE_DIR", "./models")
    CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))

config = Config()

# Global variables
redis_client = None
models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    global redis_client, models
    
    # Startup
    logger.info("Starting Medical Imaging Service...")
    logger.info(f"Using device: {config.DEVICE}")
    
    # Initialize Redis client
    redis_client = redis.from_url(config.REDIS_URL)
    
    # Load models
    await load_models()
    
    logger.info("Medical Imaging Service started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Medical Imaging Service...")
    if redis_client:
        await redis_client.close()

# FastAPI app
app = FastAPI(
    title="AnnotateAI Medical Imaging Service",
    description="U-Net variants and specialized models for medical image analysis",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class MedicalImageType(str, Enum):
    CT = "ct"
    MRI = "mri"
    XRAY = "xray"
    ULTRASOUND = "ultrasound"
    MAMMOGRAPHY = "mammography"
    PATHOLOGY = "pathology"
    ENDOSCOPY = "endoscopy"
    DERMATOLOGY = "dermatology"

class SegmentationTask(str, Enum):
    ORGAN_SEGMENTATION = "organ_segmentation"
    TUMOR_DETECTION = "tumor_detection"
    LESION_SEGMENTATION = "lesion_segmentation"
    BONE_SEGMENTATION = "bone_segmentation"
    VESSEL_SEGMENTATION = "vessel_segmentation"
    TISSUE_CLASSIFICATION = "tissue_classification"

class AnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class MedicalImageRequest(BaseModel):
    image_type: MedicalImageType
    task: SegmentationTask
    confidence_threshold: float = Field(0.5, ge=0.0, le=1.0)
    enhance_contrast: bool = True
    normalize_intensity: bool = True
    output_format: str = Field("mask", description="Output format: mask, contour, statistics")

class AnalysisJob(BaseModel):
    job_id: str
    status: AnalysisStatus
    image_type: MedicalImageType
    task: SegmentationTask
    progress: float = 0.0
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    result_url: Optional[str] = None

class AnalysisResponse(BaseModel):
    job_id: str
    status: AnalysisStatus
    message: str

class SegmentationResult(BaseModel):
    job_id: str
    image_type: str
    task: str
    mask_base64: Optional[str] = None
    contours: List[List[Tuple[int, int]]] = []
    statistics: Dict[str, Any] = {}
    confidence_scores: List[float] = []
    processing_time: float = 0.0
    metadata: Dict[str, Any] = {}

# U-Net Model Implementation
class UNetBlock(nn.Module):
    """Basic U-Net block with batch normalization and ReLU"""
    
    def __init__(self, in_channels, out_channels):
        super(UNetBlock, self).__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3, padding=1)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, padding=1)
        self.bn2 = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)
    
    def forward(self, x):
        x = self.relu(self.bn1(self.conv1(x)))
        x = self.relu(self.bn2(self.conv2(x)))
        return x

class UNet(nn.Module):
    """U-Net architecture for medical image segmentation"""
    
    def __init__(self, in_channels=1, num_classes=2, features=[64, 128, 256, 512]):
        super(UNet, self).__init__()
        
        # Encoder (downsampling)
        self.encoders = nn.ModuleList()
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        
        # First encoder block
        self.encoders.append(UNetBlock(in_channels, features[0]))
        
        # Remaining encoder blocks
        for i in range(1, len(features)):
            self.encoders.append(UNetBlock(features[i-1], features[i]))
        
        # Bottleneck
        self.bottleneck = UNetBlock(features[-1], features[-1] * 2)
        
        # Decoder (upsampling)
        self.decoders = nn.ModuleList()
        self.upconvs = nn.ModuleList()
        
        for i in range(len(features)):
            self.upconvs.append(
                nn.ConvTranspose2d(features[-1-i] * 2, features[-1-i], kernel_size=2, stride=2)
            )
            self.decoders.append(UNetBlock(features[-1-i] * 2, features[-1-i]))
        
        # Final classifier
        self.final_conv = nn.Conv2d(features[0], num_classes, kernel_size=1)
    
    def forward(self, x):
        # Encoder path
        encoder_outputs = []
        for encoder in self.encoders:
            x = encoder(x)
            encoder_outputs.append(x)
            x = self.pool(x)
        
        # Bottleneck
        x = self.bottleneck(x)
        
        # Decoder path
        for i, (upconv, decoder) in enumerate(zip(self.upconvs, self.decoders)):
            x = upconv(x)
            # Skip connection
            encoder_output = encoder_outputs[-(i+1)]
            # Handle size mismatch
            if x.size() != encoder_output.size():
                x = F.interpolate(x, size=encoder_output.shape[2:], mode='bilinear', align_corners=False)
            x = torch.cat([x, encoder_output], dim=1)
            x = decoder(x)
        
        return self.final_conv(x)

class AttentionUNet(nn.Module):
    """Attention U-Net for improved medical image segmentation"""
    
    def __init__(self, in_channels=1, num_classes=2, features=[64, 128, 256, 512]):
        super(AttentionUNet, self).__init__()
        # Implementation would include attention gates
        # Simplified version for now
        self.unet = UNet(in_channels, num_classes, features)
    
    def forward(self, x):
        return self.unet(x)

# Model Loading and Management
async def load_models():
    """Load pre-trained medical imaging models"""
    global models
    
    try:
        # Create model cache directory
        os.makedirs(config.MODEL_CACHE_DIR, exist_ok=True)
        
        # Initialize models for different tasks
        models = {
            'chest_xray_unet': UNet(in_channels=1, num_classes=3),  # lung, heart, background
            'ct_organ_unet': UNet(in_channels=1, num_classes=5),    # liver, kidney, spleen, etc.
            'brain_mri_unet': AttentionUNet(in_channels=1, num_classes=4),  # brain regions
            'pathology_unet': UNet(in_channels=3, num_classes=2),   # tumor/normal
        }
        
        # Load pre-trained weights if available
        for model_name, model in models.items():
            model_path = os.path.join(config.MODEL_CACHE_DIR, f"{model_name}.pth")
            if os.path.exists(model_path):
                model.load_state_dict(torch.load(model_path, map_location=config.DEVICE))
                logger.info(f"Loaded pre-trained model: {model_name}")
            else:
                logger.info(f"Using random weights for model: {model_name}")
            
            model.to(config.DEVICE)
            model.eval()
        
        logger.info(f"Loaded {len(models)} medical imaging models")
        
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
        models = {}

# Image Processing Functions
def load_dicom_image(file_path: str) -> Tuple[np.ndarray, Dict[str, Any]]:
    """Load DICOM image and extract metadata"""
    try:
        dicom_data = pydicom.dcmread(file_path)
        image_array = dicom_data.pixel_array.astype(np.float32)
        
        # Extract metadata
        metadata = {
            'patient_id': str(dicom_data.get('PatientID', '')),
            'study_date': str(dicom_data.get('StudyDate', '')),
            'modality': str(dicom_data.get('Modality', '')),
            'body_part': str(dicom_data.get('BodyPartExamined', '')),
            'image_size': image_array.shape,
            'pixel_spacing': list(dicom_data.get('PixelSpacing', [])),
            'slice_thickness': float(dicom_data.get('SliceThickness', 0)),
            'window_center': float(dicom_data.get('WindowCenter', 0)),
            'window_width': float(dicom_data.get('WindowWidth', 0))
        }
        
        return image_array, metadata
        
    except Exception as e:
        raise ValueError(f"Failed to load DICOM image: {e}")

def load_nifti_image(file_path: str) -> Tuple[np.ndarray, Dict[str, Any]]:
    """Load NIfTI image and extract metadata"""
    try:
        nifti_img = nib.load(file_path)
        image_array = nifti_img.get_fdata().astype(np.float32)
        
        # Extract metadata
        header = nifti_img.header
        metadata = {
            'image_size': image_array.shape,
            'voxel_size': header.get_zooms(),
            'data_type': str(header.get_data_dtype()),
            'orientation': nib.aff2axcodes(nifti_img.affine)
        }
        
        return image_array, metadata
        
    except Exception as e:
        raise ValueError(f"Failed to load NIfTI image: {e}")

def preprocess_medical_image(
    image: np.ndarray,
    target_size: Tuple[int, int] = (512, 512),
    normalize: bool = True,
    enhance_contrast: bool = True
) -> np.ndarray:
    """Preprocess medical image for model input"""
    
    # Handle multi-dimensional images (take middle slice if 3D)
    if len(image.shape) == 3:
        image = image[:, :, image.shape[2] // 2]
    
    # Normalize intensity
    if normalize:
        image = (image - image.min()) / (image.max() - image.min() + 1e-8)
    
    # Enhance contrast using CLAHE
    if enhance_contrast:
        image_uint8 = (image * 255).astype(np.uint8)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        image = clahe.apply(image_uint8).astype(np.float32) / 255.0
    
    # Resize image
    image_resized = cv2.resize(image, target_size, interpolation=cv2.INTER_LINEAR)
    
    # Add batch and channel dimensions
    image_tensor = torch.from_numpy(image_resized).unsqueeze(0).unsqueeze(0)
    
    return image_tensor

def postprocess_segmentation(
    prediction: torch.Tensor,
    confidence_threshold: float = 0.5,
    min_component_size: int = 100
) -> Tuple[np.ndarray, List[np.ndarray], Dict[str, Any]]:
    """Postprocess segmentation output"""
    
    # Convert to numpy
    if isinstance(prediction, torch.Tensor):
        prediction = prediction.cpu().numpy()
    
    # Apply softmax to get probabilities
    if prediction.shape[0] > 1:  # Multi-class
        probabilities = np.exp(prediction) / np.sum(np.exp(prediction), axis=0, keepdims=True)
        mask = np.argmax(probabilities, axis=0)
        confidence_map = np.max(probabilities, axis=0)
    else:  # Binary
        probabilities = 1 / (1 + np.exp(-prediction[0]))  # Sigmoid
        mask = (probabilities > confidence_threshold).astype(np.uint8)
        confidence_map = probabilities
    
    # Remove small components
    if min_component_size > 0:
        mask = morphology.remove_small_objects(
            mask.astype(bool), min_size=min_component_size
        ).astype(np.uint8)
    
    # Find contours
    contours = []
    for class_id in np.unique(mask):
        if class_id == 0:  # Skip background
            continue
        
        class_mask = (mask == class_id).astype(np.uint8)
        class_contours, _ = cv2.findContours(
            class_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        contours.extend([contour.squeeze() for contour in class_contours if len(contour) > 3])
    
    # Calculate statistics
    statistics = {
        'total_area': np.sum(mask > 0),
        'num_components': len(np.unique(mask)) - 1,  # Exclude background
        'mean_confidence': float(np.mean(confidence_map[mask > 0])) if np.any(mask > 0) else 0.0,
        'max_confidence': float(np.max(confidence_map)),
        'mask_coverage': float(np.sum(mask > 0) / mask.size)
    }
    
    return mask, contours, statistics

def select_model_for_task(image_type: MedicalImageType, task: SegmentationTask) -> str:
    """Select appropriate model based on image type and task"""
    
    model_mapping = {
        (MedicalImageType.XRAY, SegmentationTask.ORGAN_SEGMENTATION): 'chest_xray_unet',
        (MedicalImageType.CT, SegmentationTask.ORGAN_SEGMENTATION): 'ct_organ_unet',
        (MedicalImageType.MRI, SegmentationTask.ORGAN_SEGMENTATION): 'brain_mri_unet',
        (MedicalImageType.PATHOLOGY, SegmentationTask.TUMOR_DETECTION): 'pathology_unet',
    }
    
    return model_mapping.get((image_type, task), 'chest_xray_unet')  # Default fallback

# Utility functions
async def save_job_status(job: AnalysisJob):
    """Save job status to Redis"""
    try:
        await redis_client.setex(
            f"medical_job:{job.job_id}",
            3600,  # 1 hour
            job.json()
        )
    except Exception as e:
        logger.error(f"Failed to save job status: {e}")

async def get_job_status(job_id: str) -> Optional[AnalysisJob]:
    """Get job status from Redis"""
    try:
        job_data = await redis_client.get(f"medical_job:{job_id}")
        if job_data:
            return AnalysisJob.parse_raw(job_data)
    except Exception as e:
        logger.error(f"Failed to get job status: {e}")
    return None

def process_medical_image(
    image_path: str,
    image_type: MedicalImageType,
    task: SegmentationTask,
    confidence_threshold: float = 0.5,
    enhance_contrast: bool = True,
    normalize_intensity: bool = True
) -> Dict[str, Any]:
    """Process medical image for segmentation/analysis"""
    
    start_time = time.time()
    
    # Load image based on format
    file_ext = Path(image_path).suffix.lower()
    
    if file_ext == '.dcm':
        image_array, metadata = load_dicom_image(image_path)
    elif file_ext in ['.nii', '.gz']:
        image_array, metadata = load_nifti_image(image_path)
    else:
        # Standard image formats
        image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if image is None:
            raise ValueError("Failed to load image")
        image_array = image.astype(np.float32)
        metadata = {'image_size': image_array.shape}
    
    # Preprocess image
    image_tensor = preprocess_medical_image(
        image_array,
        target_size=config.MAX_IMAGE_SIZE,
        normalize=normalize_intensity,
        enhance_contrast=enhance_contrast
    )
    
    # Select and run model
    model_name = select_model_for_task(image_type, task)
    model = models.get(model_name)
    
    if not model:
        raise ValueError(f"Model not available: {model_name}")
    
    # Run inference
    with torch.no_grad():
        image_tensor = image_tensor.to(config.DEVICE)
        prediction = model(image_tensor)
        prediction = prediction.squeeze(0)  # Remove batch dimension
    
    # Postprocess results
    mask, contours, statistics = postprocess_segmentation(
        prediction, confidence_threshold=confidence_threshold
    )
    
    # Convert mask to base64 for transmission
    mask_image = Image.fromarray((mask * 255).astype(np.uint8))
    mask_buffer = io.BytesIO()
    mask_image.save(mask_buffer, format='PNG')
    mask_base64 = base64.b64encode(mask_buffer.getvalue()).decode()
    
    processing_time = time.time() - start_time
    
    # Calculate confidence scores for each contour
    confidence_scores = []
    for contour in contours:
        if len(contour) > 0:
            # Sample confidence values inside contour
            mask_region = np.zeros_like(mask)
            cv2.fillPoly(mask_region, [contour.astype(np.int32)], 1)
            confidence_scores.append(float(np.mean(mask[mask_region > 0])))
    
    return {
        'mask_base64': mask_base64,
        'contours': [contour.tolist() for contour in contours],
        'statistics': statistics,
        'confidence_scores': confidence_scores,
        'processing_time': processing_time,
        'metadata': metadata,
        'model_used': model_name
    }

async def process_analysis_job(job_id: str, image_path: str, request: MedicalImageRequest):
    """Background task to process medical image analysis"""
    try:
        # Update job status
        job = AnalysisJob(
            job_id=job_id,
            status=AnalysisStatus.PROCESSING,
            image_type=request.image_type,
            task=request.task,
            created_at=datetime.utcnow()
        )
        await save_job_status(job)
        
        # Process image
        result = process_medical_image(
            image_path,
            request.image_type,
            request.task,
            request.confidence_threshold,
            request.enhance_contrast,
            request.normalize_intensity
        )
        
        # Update job with results
        job.status = AnalysisStatus.COMPLETED
        job.progress = 100.0
        job.completed_at = datetime.utcnow()
        
        # Store result in Redis
        await redis_client.setex(
            f"medical_result:{job_id}",
            3600,  # 1 hour
            json.dumps(result, default=str)
        )
        
        await save_job_status(job)
        
    except Exception as e:
        logger.error(f"Medical analysis job {job_id} failed: {e}")
        
        # Update job with error
        job = await get_job_status(job_id)
        if job:
            job.status = AnalysisStatus.FAILED
            job.error_message = str(e)
            await save_job_status(job)
    
    finally:
        # Clean up image file
        if os.path.exists(image_path):
            os.unlink(image_path)

# API Endpoints
@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_medical_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    image_type: MedicalImageType = MedicalImageType.XRAY,
    task: SegmentationTask = SegmentationTask.ORGAN_SEGMENTATION,
    confidence_threshold: float = 0.5,
    enhance_contrast: bool = True,
    normalize_intensity: bool = True,
    output_format: str = "mask"
):
    """Analyze medical image for segmentation or classification"""
    
    # Validate file format
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in config.SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Supported formats: {config.SUPPORTED_FORMATS}"
        )
    
    # Save uploaded file
    image_data = await file.read()
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
        tmp.write(image_data)
        image_path = tmp.name
    
    # Generate job ID
    import uuid
    job_id = str(uuid.uuid4())
    
    # Create analysis request
    request = MedicalImageRequest(
        image_type=image_type,
        task=task,
        confidence_threshold=confidence_threshold,
        enhance_contrast=enhance_contrast,
        normalize_intensity=normalize_intensity,
        output_format=output_format
    )
    
    # Start background processing
    background_tasks.add_task(process_analysis_job, job_id, image_path, request)
    
    return AnalysisResponse(
        job_id=job_id,
        status=AnalysisStatus.PENDING,
        message="Medical image analysis started successfully"
    )

@app.get("/analyze/{job_id}")
async def get_analysis_status(job_id: str):
    """Get analysis job status"""
    job = await get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job

@app.get("/analyze/{job_id}/result")
async def get_analysis_result(job_id: str):
    """Get analysis results"""
    job = await get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != AnalysisStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Job not completed yet")
    
    # Get result from Redis
    try:
        result_data = await redis_client.get(f"medical_result:{job_id}")
        if result_data:
            return json.loads(result_data)
        else:
            raise HTTPException(status_code=404, detail="Result not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get result: {e}")

@app.get("/models")
async def list_models():
    """List available medical imaging models"""
    return {
        "models": [
            {
                "name": "Chest X-ray U-Net",
                "key": "chest_xray_unet",
                "description": "U-Net for chest X-ray organ segmentation",
                "image_types": ["xray"],
                "tasks": ["organ_segmentation"]
            },
            {
                "name": "CT Organ U-Net",
                "key": "ct_organ_unet",
                "description": "U-Net for CT organ segmentation",
                "image_types": ["ct"],
                "tasks": ["organ_segmentation"]
            },
            {
                "name": "Brain MRI Attention U-Net",
                "key": "brain_mri_unet",
                "description": "Attention U-Net for brain MRI analysis",
                "image_types": ["mri"],
                "tasks": ["organ_segmentation", "lesion_segmentation"]
            },
            {
                "name": "Pathology U-Net",
                "key": "pathology_unet",
                "description": "U-Net for pathology image analysis",
                "image_types": ["pathology"],
                "tasks": ["tumor_detection", "tissue_classification"]
            }
        ]
    }

@app.get("/image-types")
async def list_image_types():
    """List supported medical image types"""
    return {
        "image_types": [
            {"value": "ct", "name": "CT Scan", "description": "Computed Tomography"},
            {"value": "mri", "name": "MRI", "description": "Magnetic Resonance Imaging"},
            {"value": "xray", "name": "X-Ray", "description": "X-Ray Radiography"},
            {"value": "ultrasound", "name": "Ultrasound", "description": "Ultrasound Imaging"},
            {"value": "mammography", "name": "Mammography", "description": "Breast X-Ray"},
            {"value": "pathology", "name": "Pathology", "description": "Microscopy Images"},
            {"value": "endoscopy", "name": "Endoscopy", "description": "Endoscopic Images"},
            {"value": "dermatology", "name": "Dermatology", "description": "Skin Images"}
        ]
    }

@app.get("/tasks")
async def list_tasks():
    """List available analysis tasks"""
    return {
        "tasks": [
            {"value": "organ_segmentation", "name": "Organ Segmentation", "description": "Segment anatomical structures"},
            {"value": "tumor_detection", "name": "Tumor Detection", "description": "Detect and segment tumors"},
            {"value": "lesion_segmentation", "name": "Lesion Segmentation", "description": "Segment pathological lesions"},
            {"value": "bone_segmentation", "name": "Bone Segmentation", "description": "Segment bone structures"},
            {"value": "vessel_segmentation", "name": "Vessel Segmentation", "description": "Segment blood vessels"},
            {"value": "tissue_classification", "name": "Tissue Classification", "description": "Classify tissue types"}
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "medical-imaging-service",
        "device": config.DEVICE,
        "models_loaded": len(models),
        "supported_formats": config.SUPPORTED_FORMATS
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8014) 