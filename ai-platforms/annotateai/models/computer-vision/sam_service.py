"""
AnnotateAI Segment Anything Model (SAM) Service
Phase 3.2 Production AI Deployment - Real Image Segmentation

This service provides real Meta Segment Anything Model (SAM) segmentation 
to replace mock segmentation calls in src/ai/SegmentationModel.ts.

Features:
- Real SAM image segmentation with prompts
- Point-based and box-based prompting
- Multiple SAM model variants (ViT-H, ViT-L, ViT-B)
- Automatic mask generation
- Interactive segmentation refinement
- GPU acceleration and optimization
- Batch processing for efficiency
- Performance monitoring and caching

Replaces: simulateInference() in src/ai/SegmentationModel.ts
"""

import os
import time
import logging
import hashlib
from typing import List, Dict, Optional, Tuple, Any, Union
from dataclasses import dataclass
from pathlib import Path

import torch
import numpy as np
import cv2
from PIL import Image
import matplotlib.pyplot as plt
import redis
import json

# SAM imports
from segment_anything import SamPredictor, SamAutomaticMaskGenerator, sam_model_registry
from segment_anything.utils.transforms import ResizeLongestSide

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# Data Models
# ============================================================================

@dataclass
class Point:
    """2D point for prompting"""
    x: float
    y: float
    label: int = 1  # 1 for foreground, 0 for background

@dataclass
class BoundingBox:
    """Bounding box for prompting"""
    x1: float
    y1: float
    x2: float
    y2: float

@dataclass
class Mask:
    """Segmentation mask result"""
    mask: np.ndarray  # Binary mask (H, W)
    score: float      # Confidence score
    stability_score: float  # Stability score
    area: int         # Mask area in pixels
    bbox: List[float] # Bounding box [x1, y1, x2, y2]
    point_coords: Optional[List[List[float]]] = None
    predicted_iou: Optional[float] = None

@dataclass
class SAMConfig:
    """SAM model configuration"""
    model_type: str = "vit_h"  # vit_h, vit_l, vit_b
    checkpoint_path: Optional[str] = None
    device: str = "auto"
    points_per_side: int = 32
    pred_iou_thresh: float = 0.88
    stability_score_thresh: float = 0.95
    crop_n_layers: int = 0
    crop_n_points_downscale_factor: int = 1
    min_mask_region_area: int = 0
    use_m2m: bool = False

@dataclass
class SegmentationResult:
    """Complete segmentation result"""
    masks: List[Mask]
    processing_time: float
    model_type: str
    image_shape: Tuple[int, int, int]
    prompt_type: str  # "points", "box", "automatic"
    confidence: float
    metadata: Dict[str, Any]

# ============================================================================
# SAM Service Class
# ============================================================================

class SAMService:
    """
    Production Segment Anything Model service
    
    Provides real image segmentation using Meta's SAM models
    to replace mock segmentation calls in AnnotateAI.
    """
    
    def __init__(self, config: Optional[SAMConfig] = None):
        self.config = config or SAMConfig()
        self.predictors: Dict[str, SamPredictor] = {}
        self.mask_generators: Dict[str, SamAutomaticMaskGenerator] = {}
        self.device = self._get_optimal_device()
        self.redis_client = self._init_redis()
        self.transform = ResizeLongestSide(1024)
        
        # Performance tracking
        self.stats = {
            'total_segmentations': 0,
            'total_time': 0.0,
            'cache_hits': 0,
            'cache_misses': 0,
            'average_processing_time': 0.0,
            'point_prompts': 0,
            'box_prompts': 0,
            'automatic_masks': 0
        }
        
        # Initialize models
        self._initialize_models()
    
    def _get_optimal_device(self) -> str:
        """Determine optimal device for inference"""
        if self.config.device == "auto":
            if torch.cuda.is_available():
                return "cuda"
            elif torch.backends.mps.is_available():
                return "mps"
            else:
                return "cpu"
        return self.config.device
    
    def _init_redis(self) -> Optional[redis.Redis]:
        """Initialize Redis connection for caching"""
        try:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
            client = redis.from_url(redis_url)
            client.ping()
            return client
        except Exception as e:
            logger.warning(f"Redis initialization failed: {e}")
            return None
    
    def _initialize_models(self):
        """Initialize SAM models"""
        try:
            # Available SAM models
            model_configs = {
                'vit_h': {
                    'checkpoint': 'sam_vit_h_4b8939.pth',
                    'url': 'https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth'
                },
                'vit_l': {
                    'checkpoint': 'sam_vit_l_0b3195.pth',
                    'url': 'https://dl.fbaipublicfiles.com/segment_anything/sam_vit_l_0b3195.pth'
                },
                'vit_b': {
                    'checkpoint': 'sam_vit_b_01ec64.pth',
                    'url': 'https://dl.fbaipublicfiles.com/segment_anything/sam_vit_b_01ec64.pth'
                }
            }
            
            # Load primary model
            primary_model = self.config.model_type
            if primary_model in model_configs:
                self._load_sam_model(primary_model, model_configs[primary_model])
                logger.info(f"Loaded primary SAM model: {primary_model}")
            
            # Load additional models if requested
            if os.getenv("LOAD_ALL_SAM_MODELS", "false").lower() == "true":
                for model_type, config in model_configs.items():
                    if model_type != primary_model:
                        try:
                            self._load_sam_model(model_type, config)
                        except Exception as e:
                            logger.warning(f"Failed to load SAM model {model_type}: {e}")
            
        except Exception as e:
            logger.error(f"Failed to initialize SAM models: {e}")
            raise
    
    def _load_sam_model(self, model_type: str, model_config: Dict[str, str]):
        """Load a specific SAM model"""
        try:
            start_time = time.time()
            
            # Download checkpoint if needed
            checkpoint_path = self._get_checkpoint_path(model_config['checkpoint'])
            if not os.path.exists(checkpoint_path):
                logger.info(f"Downloading SAM checkpoint: {model_config['checkpoint']}")
                self._download_checkpoint(model_config['url'], checkpoint_path)
            
            # Load model
            sam = sam_model_registry[model_type](checkpoint=checkpoint_path)
            sam.to(device=self.device)
            
            # Create predictor
            predictor = SamPredictor(sam)
            self.predictors[model_type] = predictor
            
            # Create automatic mask generator
            mask_generator = SamAutomaticMaskGenerator(
                model=sam,
                points_per_side=self.config.points_per_side,
                pred_iou_thresh=self.config.pred_iou_thresh,
                stability_score_thresh=self.config.stability_score_thresh,
                crop_n_layers=self.config.crop_n_layers,
                crop_n_points_downscale_factor=self.config.crop_n_points_downscale_factor,
                min_mask_region_area=self.config.min_mask_region_area,
            )
            self.mask_generators[model_type] = mask_generator
            
            loading_time = time.time() - start_time
            logger.info(f"Loaded SAM {model_type} in {loading_time:.2f}s on {self.device}")
            
        except Exception as e:
            logger.error(f"Failed to load SAM model {model_type}: {e}")
            raise
    
    def _get_checkpoint_path(self, checkpoint_filename: str) -> str:
        """Get path for SAM checkpoint"""
        # Create models directory if it doesn't exist
        models_dir = Path("models/sam")
        models_dir.mkdir(parents=True, exist_ok=True)
        return str(models_dir / checkpoint_filename)
    
    def _download_checkpoint(self, url: str, checkpoint_path: str):
        """Download SAM checkpoint from URL"""
        try:
            import urllib.request
            logger.info(f"Downloading {url} to {checkpoint_path}")
            urllib.request.urlretrieve(url, checkpoint_path)
            logger.info("Download completed")
        except Exception as e:
            logger.error(f"Failed to download checkpoint: {e}")
            raise
    
    async def segment(self, image_path: str, points: List[Point], 
                     model_type: Optional[str] = None) -> SegmentationResult:
        """
        Run point-based segmentation on image file
        
        Args:
            image_path: Path to image file
            points: List of Point objects for prompting
            model_type: SAM model variant to use
            
        Returns:
            SegmentationResult object
        """
        # Load image
        image = self._load_image(image_path)
        
        # Run segmentation
        return await self.segment_image(image, points=points, model_type=model_type)
    
    async def segment_image(self, image: np.ndarray, 
                          points: Optional[List[Point]] = None,
                          box: Optional[BoundingBox] = None,
                          model_type: Optional[str] = None,
                          multimask_output: bool = True) -> SegmentationResult:
        """
        Run segmentation on image array with prompts
        
        Args:
            image: Image as numpy array (H, W, C) in RGB format
            points: List of Point objects for prompting
            box: BoundingBox object for prompting
            model_type: SAM model variant to use
            multimask_output: Whether to output multiple masks
            
        Returns:
            SegmentationResult object
        """
        start_time = time.time()
        model_type = model_type or self.config.model_type
        
        try:
            # Check cache
            cache_key = self._get_cache_key(image, points, box, model_type)
            cached_result = self._get_cached_result(cache_key)
            
            if cached_result:
                self.stats['cache_hits'] += 1
                logger.debug("Returning cached segmentation result")
                return cached_result
            
            # Get predictor
            if model_type not in self.predictors:
                raise ValueError(f"Model {model_type} not loaded")
            
            predictor = self.predictors[model_type]
            
            # Set image
            predictor.set_image(image)
            
            # Prepare prompts
            input_points = None
            input_labels = None
            input_box = None
            
            if points:
                input_points = np.array([[p.x, p.y] for p in points])
                input_labels = np.array([p.label for p in points])
                self.stats['point_prompts'] += 1
                prompt_type = "points"
            
            if box:
                input_box = np.array([box.x1, box.y1, box.x2, box.y2])
                self.stats['box_prompts'] += 1
                prompt_type = "box"
            
            if points and box:
                prompt_type = "points_and_box"
            elif not points and not box:
                prompt_type = "automatic"
            
            # Run prediction
            masks, scores, logits = predictor.predict(
                point_coords=input_points,
                point_labels=input_labels,
                box=input_box,
                multimask_output=multimask_output
            )
            
            # Process results
            result_masks = []
            for i, (mask, score) in enumerate(zip(masks, scores)):
                # Calculate additional metrics
                area = int(np.sum(mask))
                stability_score = self._calculate_stability_score(mask, logits[i] if logits is not None else None)
                bbox = self._mask_to_bbox(mask)
                
                result_mask = Mask(
                    mask=mask,
                    score=float(score),
                    stability_score=stability_score,
                    area=area,
                    bbox=bbox,
                    point_coords=input_points.tolist() if input_points is not None else None,
                    predicted_iou=float(score)  # SAM returns IoU prediction as score
                )
                result_masks.append(result_mask)
            
            # Create result
            processing_time = time.time() - start_time
            confidence = float(np.max(scores)) if len(scores) > 0 else 0.0
            
            result = SegmentationResult(
                masks=result_masks,
                processing_time=processing_time,
                model_type=model_type,
                image_shape=image.shape,
                prompt_type=prompt_type,
                confidence=confidence,
                metadata={
                    'num_masks': len(result_masks),
                    'multimask_output': multimask_output,
                    'device': self.device,
                    'num_points': len(points) if points else 0,
                    'has_box': box is not None
                }
            )
            
            # Cache result
            self._cache_result(cache_key, result)
            self.stats['cache_misses'] += 1
            
            # Update stats
            self._update_stats(processing_time)
            
            logger.info(f"Generated {len(result_masks)} masks in {processing_time:.3f}s")
            return result
            
        except Exception as e:
            logger.error(f"SAM segmentation failed: {e}")
            raise
    
    async def generate_masks(self, image: np.ndarray, 
                           model_type: Optional[str] = None) -> SegmentationResult:
        """
        Generate automatic masks for entire image
        
        Args:
            image: Image as numpy array (H, W, C) in RGB format
            model_type: SAM model variant to use
            
        Returns:
            SegmentationResult with automatically generated masks
        """
        start_time = time.time()
        model_type = model_type or self.config.model_type
        
        try:
            # Check cache
            cache_key = self._get_cache_key(image, None, None, model_type, automatic=True)
            cached_result = self._get_cached_result(cache_key)
            
            if cached_result:
                self.stats['cache_hits'] += 1
                return cached_result
            
            # Get mask generator
            if model_type not in self.mask_generators:
                raise ValueError(f"Mask generator for {model_type} not loaded")
            
            mask_generator = self.mask_generators[model_type]
            
            # Generate masks
            masks_data = mask_generator.generate(image)
            
            # Convert to our format
            result_masks = []
            for mask_data in masks_data:
                result_mask = Mask(
                    mask=mask_data['segmentation'],
                    score=float(mask_data['predicted_iou']),
                    stability_score=float(mask_data['stability_score']),
                    area=int(mask_data['area']),
                    bbox=mask_data['bbox'],
                    predicted_iou=float(mask_data['predicted_iou'])
                )
                result_masks.append(result_mask)
            
            # Create result
            processing_time = time.time() - start_time
            confidence = float(np.mean([m.score for m in result_masks])) if result_masks else 0.0
            
            result = SegmentationResult(
                masks=result_masks,
                processing_time=processing_time,
                model_type=model_type,
                image_shape=image.shape,
                prompt_type="automatic",
                confidence=confidence,
                metadata={
                    'num_masks': len(result_masks),
                    'automatic_generation': True,
                    'device': self.device,
                    'points_per_side': self.config.points_per_side
                }
            )
            
            # Cache result
            self._cache_result(cache_key, result)
            self.stats['cache_misses'] += 1
            self.stats['automatic_masks'] += 1
            
            # Update stats
            self._update_stats(processing_time)
            
            logger.info(f"Generated {len(result_masks)} automatic masks in {processing_time:.3f}s")
            return result
            
        except Exception as e:
            logger.error(f"Automatic mask generation failed: {e}")
            raise
    
    def _load_image(self, image_path: str) -> np.ndarray:
        """Load image from file path"""
        try:
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Image not found: {image_path}")
            
            # Load with PIL and convert to RGB
            pil_image = Image.open(image_path).convert('RGB')
            image = np.array(pil_image)
            
            return image
            
        except Exception as e:
            logger.error(f"Failed to load image {image_path}: {e}")
            raise
    
    def _calculate_stability_score(self, mask: np.ndarray, logits: Optional[np.ndarray] = None) -> float:
        """Calculate stability score for mask"""
        if logits is None:
            # Simple stability based on mask smoothness
            kernel = np.ones((3, 3), np.uint8)
            eroded = cv2.erode(mask.astype(np.uint8), kernel, iterations=1)
            dilated = cv2.dilate(mask.astype(np.uint8), kernel, iterations=1)
            stability = 1.0 - np.mean(np.abs(dilated - eroded))
            return max(0.0, min(1.0, stability))
        else:
            # Use logits to calculate stability
            # This is a simplified version of SAM's stability calculation
            threshold_offset = 1.0
            masks_pos = logits > threshold_offset
            masks_neg = logits < -threshold_offset
            stability_score = (masks_pos.sum() + masks_neg.sum()) / logits.size
            return float(stability_score)
    
    def _mask_to_bbox(self, mask: np.ndarray) -> List[float]:
        """Convert mask to bounding box"""
        rows = np.any(mask, axis=1)
        cols = np.any(mask, axis=0)
        
        if not np.any(rows) or not np.any(cols):
            return [0.0, 0.0, 0.0, 0.0]
        
        rmin, rmax = np.where(rows)[0][[0, -1]]
        cmin, cmax = np.where(cols)[0][[0, -1]]
        
        return [float(cmin), float(rmin), float(cmax), float(rmax)]
    
    def _get_cache_key(self, image: np.ndarray, 
                      points: Optional[List[Point]], 
                      box: Optional[BoundingBox],
                      model_type: str,
                      automatic: bool = False) -> str:
        """Generate cache key for segmentation result"""
        # Create image hash
        image_hash = hashlib.md5(image.tobytes()).hexdigest()[:16]
        
        # Create prompt hash
        prompt_str = f"{model_type}"
        if automatic:
            prompt_str += "_automatic"
        elif points:
            points_str = "_".join([f"{p.x:.1f},{p.y:.1f},{p.label}" for p in points])
            prompt_str += f"_points_{points_str}"
        if box:
            prompt_str += f"_box_{box.x1:.1f},{box.y1:.1f},{box.x2:.1f},{box.y2:.1f}"
        
        prompt_hash = hashlib.md5(prompt_str.encode()).hexdigest()[:16]
        
        return f"sam_segment:{image_hash}_{prompt_hash}"
    
    def _get_cached_result(self, cache_key: str) -> Optional[SegmentationResult]:
        """Get cached segmentation result"""
        if not self.redis_client:
            return None
        
        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                data = json.loads(cached_data)
                
                # Reconstruct masks
                masks = []
                for mask_data in data['masks']:
                    mask = Mask(
                        mask=np.array(mask_data['mask'], dtype=bool),
                        score=mask_data['score'],
                        stability_score=mask_data['stability_score'],
                        area=mask_data['area'],
                        bbox=mask_data['bbox'],
                        point_coords=mask_data.get('point_coords'),
                        predicted_iou=mask_data.get('predicted_iou')
                    )
                    masks.append(mask)
                
                return SegmentationResult(
                    masks=masks,
                    processing_time=data['processing_time'],
                    model_type=data['model_type'],
                    image_shape=tuple(data['image_shape']),
                    prompt_type=data['prompt_type'],
                    confidence=data['confidence'],
                    metadata=data['metadata']
                )
        except Exception as e:
            logger.warning(f"Cache retrieval failed: {e}")
        
        return None
    
    def _cache_result(self, cache_key: str, result: SegmentationResult):
        """Cache segmentation result"""
        if not self.redis_client:
            return
        
        try:
            # Convert to serializable format
            serializable_data = {
                'masks': [
                    {
                        'mask': mask.mask.tolist(),
                        'score': mask.score,
                        'stability_score': mask.stability_score,
                        'area': mask.area,
                        'bbox': mask.bbox,
                        'point_coords': mask.point_coords,
                        'predicted_iou': mask.predicted_iou
                    }
                    for mask in result.masks
                ],
                'processing_time': result.processing_time,
                'model_type': result.model_type,
                'image_shape': list(result.image_shape),
                'prompt_type': result.prompt_type,
                'confidence': result.confidence,
                'metadata': result.metadata
            }
            
            # Cache for 1 hour
            self.redis_client.setex(cache_key, 3600, json.dumps(serializable_data))
            
        except Exception as e:
            logger.warning(f"Cache storage failed: {e}")
    
    def _update_stats(self, processing_time: float):
        """Update performance statistics"""
        self.stats['total_segmentations'] += 1
        self.stats['total_time'] += processing_time
        self.stats['average_processing_time'] = (
            self.stats['total_time'] / self.stats['total_segmentations']
        )
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        return {
            'total_segmentations': self.stats['total_segmentations'],
            'total_time': self.stats['total_time'],
            'average_processing_time': self.stats['average_processing_time'],
            'cache_hits': self.stats['cache_hits'],
            'cache_misses': self.stats['cache_misses'],
            'cache_hit_rate': (
                self.stats['cache_hits'] / 
                (self.stats['cache_hits'] + self.stats['cache_misses'])
                if (self.stats['cache_hits'] + self.stats['cache_misses']) > 0 else 0
            ),
            'point_prompts': self.stats['point_prompts'],
            'box_prompts': self.stats['box_prompts'],
            'automatic_masks': self.stats['automatic_masks'],
            'device': self.device,
            'loaded_models': list(self.predictors.keys())
        }
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models"""
        info = {}
        
        for model_type in self.predictors.keys():
            info[model_type] = {
                'type': 'segment_anything',
                'device': self.device,
                'model_type': model_type,
                'supports_points': True,
                'supports_boxes': True,
                'supports_automatic': True,
                'image_encoder': f'ViT-{model_type.split("_")[1].upper()}',
                'checkpoint_size': self._get_checkpoint_size(model_type)
            }
        
        return info
    
    def _get_checkpoint_size(self, model_type: str) -> str:
        """Get checkpoint file size"""
        checkpoint_files = {
            'vit_h': 'sam_vit_h_4b8939.pth',
            'vit_l': 'sam_vit_l_0b3195.pth',
            'vit_b': 'sam_vit_b_01ec64.pth'
        }
        
        if model_type in checkpoint_files:
            checkpoint_path = self._get_checkpoint_path(checkpoint_files[model_type])
            if os.path.exists(checkpoint_path):
                size_bytes = os.path.getsize(checkpoint_path)
                size_mb = size_bytes / (1024 * 1024)
                return f"{size_mb:.1f} MB"
        
        return "unknown"
    
    def update_config(self, config: SAMConfig):
        """Update SAM configuration"""
        self.config = config
        logger.info(f"Updated SAM config: {config}")
    
    def warmup(self, num_iterations: int = 3):
        """Warm up models for consistent performance"""
        logger.info(f"Warming up SAM models with {num_iterations} iterations...")
        
        # Create dummy image
        dummy_image = np.random.randint(0, 255, (1024, 1024, 3), dtype=np.uint8)
        dummy_points = [Point(512, 512, 1)]
        
        for model_type, predictor in self.predictors.items():
            logger.info(f"Warming up SAM {model_type}...")
            
            for i in range(num_iterations):
                start_time = time.time()
                
                predictor.set_image(dummy_image)
                input_points = np.array([[p.x, p.y] for p in dummy_points])
                input_labels = np.array([p.label for p in dummy_points])
                
                _ = predictor.predict(
                    point_coords=input_points,
                    point_labels=input_labels,
                    multimask_output=True
                )
                
                warmup_time = time.time() - start_time
                logger.debug(f"Warmup {i+1}/{num_iterations}: {warmup_time:.3f}s")
        
        logger.info("SAM model warmup completed")

# ============================================================================
# Utility Functions
# ============================================================================

def create_sam_service(model_type: str = "vit_h", 
                      device: str = "auto") -> SAMService:
    """Create and configure SAM service"""
    config = SAMConfig(
        model_type=model_type,
        device=device
    )
    
    service = SAMService(config)
    service.warmup()
    
    return service

def visualize_segmentation(image: np.ndarray, result: SegmentationResult, 
                         save_path: Optional[str] = None) -> None:
    """Visualize segmentation results"""
    fig, axes = plt.subplots(1, min(4, len(result.masks) + 1), figsize=(16, 4))
    if len(result.masks) == 0:
        axes = [axes]
    
    # Show original image
    axes[0].imshow(image)
    axes[0].set_title('Original Image')
    axes[0].axis('off')
    
    # Show top 3 masks
    for i, mask in enumerate(result.masks[:3]):
        ax_idx = i + 1
        if ax_idx >= len(axes):
            break
            
        # Create colored mask
        colored_mask = np.zeros_like(image)
        colored_mask[mask.mask] = [255, 0, 0]  # Red mask
        
        # Overlay on image
        overlay = image.copy()
        overlay[mask.mask] = overlay[mask.mask] * 0.7 + colored_mask[mask.mask] * 0.3
        
        axes[ax_idx].imshow(overlay.astype(np.uint8))
        axes[ax_idx].set_title(f'Mask {i+1} (Score: {mask.score:.3f})')
        axes[ax_idx].axis('off')
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
    else:
        plt.show()

# ============================================================================
# Main Function for Testing
# ============================================================================

if __name__ == "__main__":
    import asyncio
    
    async def test_sam_service():
        """Test SAM service functionality"""
        
        # Create service
        config = SAMConfig(
            model_type="vit_b",  # Use smaller model for testing
            device="auto"
        )
        
        service = SAMService(config)
        
        # Test with dummy image
        test_image = np.random.randint(0, 255, (1024, 1024, 3), dtype=np.uint8)
        test_points = [Point(512, 512, 1), Point(256, 256, 1)]
        
        # Run point-based segmentation
        result = await service.segment_image(test_image, points=test_points)
        
        print(f"Generated {len(result.masks)} masks")
        print(f"Confidence: {result.confidence:.3f}")
        print(f"Processing time: {result.processing_time:.3f}s")
        print(f"Performance stats: {service.get_performance_stats()}")
        
        # Test automatic mask generation
        auto_result = await service.generate_masks(test_image)
        print(f"Automatic masks: {len(auto_result.masks)}")
    
    # Run test
    asyncio.run(test_sam_service()) 