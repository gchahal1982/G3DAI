"""
AnnotateAI YOLO Object Detection Service
Phase 3.2 Production AI Deployment - Real Object Detection

This service provides real YOLOv8/v9 object detection to replace
mock detection calls in the annotation workbench.

Features:
- YOLOv8/v9 real-time object detection
- Confidence thresholding and NMS
- Multiple model variants (nano, small, medium, large, extra-large)
- Custom class filtering
- Batch processing
- GPU acceleration
- Performance monitoring

Replaces: Mock detection in annotation workbench components
"""

import os
import time
import logging
from typing import List, Dict, Optional, Tuple, Any
from dataclasses import dataclass
from pathlib import Path

import torch
import numpy as np
import cv2
from ultralytics import YOLO
from PIL import Image
import redis
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# Data Models
# ============================================================================

@dataclass
class Detection:
    """Object detection result"""
    bbox: List[float]  # [x1, y1, x2, y2]
    confidence: float
    class_id: int
    class_name: str
    mask: Optional[List[List[float]]] = None
    keypoints: Optional[List[List[float]]] = None
    track_id: Optional[int] = None

@dataclass
class YOLOConfig:
    """YOLO model configuration"""
    model_variant: str = "yolov8n"  # n, s, m, l, x
    confidence_threshold: float = 0.5
    iou_threshold: float = 0.45
    max_detections: int = 1000
    device: str = "auto"  # auto, cpu, cuda
    half_precision: bool = False
    augment: bool = False
    classes: Optional[List[int]] = None
    agnostic_nms: bool = False
    retina_masks: bool = False

@dataclass
class DetectionResult:
    """Complete detection result"""
    detections: List[Detection]
    processing_time: float
    model_name: str
    image_shape: Tuple[int, int, int]
    total_detections: int
    confidence_threshold: float
    metadata: Dict[str, Any]

# ============================================================================
# YOLO Service Class
# ============================================================================

class YOLOService:
    """
    Production YOLO object detection service
    
    Provides real-time object detection using YOLOv8/v9 models
    to replace mock detection calls in AnnotateAI.
    """
    
    def __init__(self, config: Optional[YOLOConfig] = None):
        self.config = config or YOLOConfig()
        self.models: Dict[str, YOLO] = {}
        self.device = self._get_optimal_device()
        self.redis_client = self._init_redis()
        self.model_cache = {}
        
        # Performance tracking
        self.stats = {
            'total_inferences': 0,
            'total_time': 0.0,
            'cache_hits': 0,
            'cache_misses': 0,
            'average_inference_time': 0.0
        }
        
        # Initialize default models
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
            client.ping()  # Test connection
            return client
        except Exception as e:
            logger.warning(f"Redis initialization failed: {e}")
            return None
    
    def _initialize_models(self):
        """Initialize YOLO models"""
        try:
            # Load different YOLO variants
            model_variants = {
                'yolov8n': 'yolov8n.pt',
                'yolov8s': 'yolov8s.pt',
                'yolov8m': 'yolov8m.pt',
                'yolov8l': 'yolov8l.pt',
                'yolov8x': 'yolov8x.pt',
                'yolov9c': 'yolov9c.pt',
                'yolov9e': 'yolov9e.pt',
            }
            
            # Load primary model
            primary_model = self.config.model_variant
            if primary_model in model_variants:
                self._load_model(primary_model, model_variants[primary_model])
                logger.info(f"Loaded primary YOLO model: {primary_model}")
            
            # Load additional models for ensemble (optional)
            if os.getenv("ENABLE_MODEL_ENSEMBLE", "false").lower() == "true":
                for variant, weights in model_variants.items():
                    if variant != primary_model:
                        try:
                            self._load_model(variant, weights)
                        except Exception as e:
                            logger.warning(f"Failed to load ensemble model {variant}: {e}")
            
        except Exception as e:
            logger.error(f"Failed to initialize YOLO models: {e}")
            raise
    
    def _load_model(self, variant: str, weights: str):
        """Load a specific YOLO model"""
        try:
            start_time = time.time()
            
            # Create model
            model = YOLO(weights)
            
            # Configure model
            model.to(self.device)
            if self.config.half_precision and self.device != "cpu":
                model.half()
            
            # Store model
            self.models[variant] = model
            
            loading_time = time.time() - start_time
            logger.info(f"Loaded {variant} in {loading_time:.2f}s on {self.device}")
            
        except Exception as e:
            logger.error(f"Failed to load model {variant}: {e}")
            raise
    
    def get_model(self, variant: Optional[str] = None) -> YOLO:
        """Get YOLO model by variant"""
        variant = variant or self.config.model_variant
        
        if variant not in self.models:
            # Try to load model on demand
            model_weights = {
                'yolov8n': 'yolov8n.pt',
                'yolov8s': 'yolov8s.pt',
                'yolov8m': 'yolov8m.pt',
                'yolov8l': 'yolov8l.pt',
                'yolov8x': 'yolov8x.pt',
                'yolov9c': 'yolov9c.pt',
                'yolov9e': 'yolov9e.pt',
            }
            
            if variant in model_weights:
                self._load_model(variant, model_weights[variant])
            else:
                raise ValueError(f"Unknown model variant: {variant}")
        
        return self.models[variant]
    
    async def detect(self, image_path: str, config: Optional[YOLOConfig] = None) -> List[Detection]:
        """
        Run object detection on image file
        
        Args:
            image_path: Path to image file
            config: Optional detection configuration
            
        Returns:
            List of Detection objects
        """
        # Use provided config or default
        detection_config = config or self.config
        
        # Load image
        image = self._load_image(image_path)
        
        # Run detection
        return await self.detect_image(image, detection_config)
    
    async def detect_image(self, image: np.ndarray, config: Optional[YOLOConfig] = None) -> List[Detection]:
        """
        Run object detection on image array
        
        Args:
            image: Image as numpy array (H, W, C)
            config: Optional detection configuration
            
        Returns:
            List of Detection objects
        """
        start_time = time.time()
        detection_config = config or self.config
        
        try:
            # Check cache
            cache_key = self._get_cache_key(image, detection_config)
            cached_result = self._get_cached_result(cache_key)
            
            if cached_result:
                self.stats['cache_hits'] += 1
                logger.debug("Returning cached detection result")
                return cached_result
            
            # Get model
            model = self.get_model(detection_config.model_variant)
            
            # Prepare inference parameters
            inference_params = {
                'conf': detection_config.confidence_threshold,
                'iou': detection_config.iou_threshold,
                'max_det': detection_config.max_detections,
                'augment': detection_config.augment,
                'agnostic_nms': detection_config.agnostic_nms,
                'retina_masks': detection_config.retina_masks,
                'device': self.device,
                'half': detection_config.half_precision
            }
            
            # Add class filtering if specified
            if detection_config.classes:
                inference_params['classes'] = detection_config.classes
            
            # Run inference
            results = model(image, **inference_params)
            
            # Process results
            detections = self._process_results(results, detection_config)
            
            # Cache result
            self._cache_result(cache_key, detections)
            self.stats['cache_misses'] += 1
            
            # Update stats
            processing_time = time.time() - start_time
            self._update_stats(processing_time)
            
            logger.info(f"Detected {len(detections)} objects in {processing_time:.3f}s")
            return detections
            
        except Exception as e:
            logger.error(f"Object detection failed: {e}")
            raise
    
    async def detect_batch(self, images: List[np.ndarray], 
                         config: Optional[YOLOConfig] = None) -> List[List[Detection]]:
        """
        Run batch object detection on multiple images
        
        Args:
            images: List of images as numpy arrays
            config: Optional detection configuration
            
        Returns:
            List of detection lists (one per image)
        """
        detection_config = config or self.config
        results = []
        
        # Process images in batches for efficiency
        batch_size = min(len(images), 8)  # Optimal batch size for most GPUs
        
        for i in range(0, len(images), batch_size):
            batch = images[i:i + batch_size]
            batch_results = []
            
            for image in batch:
                detections = await self.detect_image(image, detection_config)
                batch_results.append(detections)
            
            results.extend(batch_results)
        
        return results
    
    def _load_image(self, image_path: str) -> np.ndarray:
        """Load image from file path"""
        try:
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Image not found: {image_path}")
            
            # Load with OpenCV (BGR format)
            image = cv2.imread(image_path)
            
            if image is None:
                # Try with PIL
                pil_image = Image.open(image_path).convert('RGB')
                image = np.array(pil_image)
                # Convert RGB to BGR for OpenCV compatibility
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            return image
            
        except Exception as e:
            logger.error(f"Failed to load image {image_path}: {e}")
            raise
    
    def _process_results(self, results, config: YOLOConfig) -> List[Detection]:
        """Process YOLO inference results"""
        detections = []
        
        for result in results:
            boxes = result.boxes
            
            if boxes is not None:
                # Extract box data
                xyxy = boxes.xyxy.cpu().numpy()
                conf = boxes.conf.cpu().numpy()
                cls = boxes.cls.cpu().numpy()
                
                # Get class names
                class_names = result.names
                
                # Process each detection
                for i in range(len(xyxy)):
                    detection = Detection(
                        bbox=[float(xyxy[i][0]), float(xyxy[i][1]), 
                             float(xyxy[i][2]), float(xyxy[i][3])],
                        confidence=float(conf[i]),
                        class_id=int(cls[i]),
                        class_name=class_names[int(cls[i])]
                    )
                    
                    # Add segmentation mask if available
                    if hasattr(result, 'masks') and result.masks is not None:
                        mask = result.masks.data[i].cpu().numpy()
                        detection.mask = mask.tolist()
                    
                    # Add keypoints if available
                    if hasattr(result, 'keypoints') and result.keypoints is not None:
                        keypoints = result.keypoints.data[i].cpu().numpy()
                        detection.keypoints = keypoints.tolist()
                    
                    detections.append(detection)
        
        return detections
    
    def _get_cache_key(self, image: np.ndarray, config: YOLOConfig) -> str:
        """Generate cache key for detection result"""
        image_hash = hash(image.tobytes())
        config_hash = hash(f"{config.model_variant}_{config.confidence_threshold}_{config.iou_threshold}")
        return f"yolo_detection:{image_hash}_{config_hash}"
    
    def _get_cached_result(self, cache_key: str) -> Optional[List[Detection]]:
        """Get cached detection result"""
        if not self.redis_client:
            return None
        
        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                data = json.loads(cached_data)
                return [Detection(**det) for det in data]
        except Exception as e:
            logger.warning(f"Cache retrieval failed: {e}")
        
        return None
    
    def _cache_result(self, cache_key: str, detections: List[Detection]):
        """Cache detection result"""
        if not self.redis_client:
            return
        
        try:
            # Convert detections to serializable format
            serializable_data = [
                {
                    'bbox': det.bbox,
                    'confidence': det.confidence,
                    'class_id': det.class_id,
                    'class_name': det.class_name,
                    'mask': det.mask,
                    'keypoints': det.keypoints,
                    'track_id': det.track_id
                }
                for det in detections
            ]
            
            # Cache for 1 hour
            self.redis_client.setex(cache_key, 3600, json.dumps(serializable_data))
            
        except Exception as e:
            logger.warning(f"Cache storage failed: {e}")
    
    def _update_stats(self, processing_time: float):
        """Update performance statistics"""
        self.stats['total_inferences'] += 1
        self.stats['total_time'] += processing_time
        self.stats['average_inference_time'] = (
            self.stats['total_time'] / self.stats['total_inferences']
        )
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        return {
            'total_inferences': self.stats['total_inferences'],
            'total_time': self.stats['total_time'],
            'average_inference_time': self.stats['average_inference_time'],
            'cache_hits': self.stats['cache_hits'],
            'cache_misses': self.stats['cache_misses'],
            'cache_hit_rate': (
                self.stats['cache_hits'] / 
                (self.stats['cache_hits'] + self.stats['cache_misses'])
                if (self.stats['cache_hits'] + self.stats['cache_misses']) > 0 else 0
            ),
            'device': self.device,
            'loaded_models': list(self.models.keys())
        }
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models"""
        info = {}
        
        for variant, model in self.models.items():
            info[variant] = {
                'task': model.task,
                'device': str(model.device),
                'classes': model.names,
                'num_classes': len(model.names) if model.names else 0,
                'input_size': getattr(model, 'imgsz', 'unknown'),
                'model_size': self._get_model_size(model)
            }
        
        return info
    
    def _get_model_size(self, model) -> str:
        """Get model size in MB"""
        try:
            param_count = sum(p.numel() for p in model.model.parameters())
            size_mb = param_count * 4 / (1024 * 1024)  # Assuming float32
            return f"{size_mb:.1f} MB"
        except:
            return "unknown"
    
    def update_config(self, config: YOLOConfig):
        """Update detection configuration"""
        self.config = config
        logger.info(f"Updated YOLO config: {config}")
    
    def warmup(self, num_iterations: int = 3):
        """Warm up models for consistent performance"""
        logger.info(f"Warming up YOLO models with {num_iterations} iterations...")
        
        # Create dummy image
        dummy_image = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)
        
        for variant, model in self.models.items():
            logger.info(f"Warming up {variant}...")
            
            for i in range(num_iterations):
                start_time = time.time()
                _ = model(dummy_image, conf=0.5, verbose=False)
                warmup_time = time.time() - start_time
                logger.debug(f"Warmup {i+1}/{num_iterations}: {warmup_time:.3f}s")
        
        logger.info("Model warmup completed")

# ============================================================================
# Utility Functions
# ============================================================================

def create_yolo_service(model_variant: str = "yolov8n", 
                       confidence_threshold: float = 0.5,
                       device: str = "auto") -> YOLOService:
    """Create and configure YOLO service"""
    config = YOLOConfig(
        model_variant=model_variant,
        confidence_threshold=confidence_threshold,
        device=device
    )
    
    service = YOLOService(config)
    service.warmup()
    
    return service

def benchmark_yolo_models(image_path: str, iterations: int = 10) -> Dict[str, float]:
    """Benchmark different YOLO model variants"""
    results = {}
    test_image = cv2.imread(image_path)
    
    if test_image is None:
        raise ValueError(f"Could not load test image: {image_path}")
    
    variants = ['yolov8n', 'yolov8s', 'yolov8m', 'yolov8l']
    
    for variant in variants:
        try:
            logger.info(f"Benchmarking {variant}...")
            
            config = YOLOConfig(model_variant=variant, confidence_threshold=0.5)
            service = YOLOService(config)
            
            # Warmup
            service.warmup(3)
            
            # Benchmark
            times = []
            for i in range(iterations):
                start_time = time.time()
                asyncio.run(service.detect_image(test_image, config))
                inference_time = time.time() - start_time
                times.append(inference_time)
            
            avg_time = sum(times) / len(times)
            results[variant] = avg_time
            
            logger.info(f"{variant}: {avg_time:.3f}s average")
            
        except Exception as e:
            logger.error(f"Benchmark failed for {variant}: {e}")
            results[variant] = -1
    
    return results

# ============================================================================
# Main Function for Testing
# ============================================================================

if __name__ == "__main__":
    import asyncio
    
    async def test_yolo_service():
        """Test YOLO service functionality"""
        
        # Create service
        config = YOLOConfig(
            model_variant="yolov8n",
            confidence_threshold=0.5,
            device="auto"
        )
        
        service = YOLOService(config)
        
        # Test with dummy image
        test_image = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)
        
        # Run detection
        detections = await service.detect_image(test_image)
        
        print(f"Detected {len(detections)} objects")
        print(f"Performance stats: {service.get_performance_stats()}")
        print(f"Model info: {service.get_model_info()}")
    
    # Run test
    asyncio.run(test_yolo_service()) 