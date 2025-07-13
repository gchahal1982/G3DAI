#!/usr/bin/env python3
"""
Quality Filtering Service for AnnotateAI Synthetic Data Generation
Advanced quality assessment and filtering for synthetic data
"""

import logging
import time
import math
from typing import Dict, List, Optional, Any, Union, Tuple
from enum import Enum
from dataclasses import dataclass, field
import asyncio
from concurrent.futures import ThreadPoolExecutor
import io
import base64
import json
from datetime import datetime

import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from torchvision.models import inception_v3, vgg16, resnet50
import numpy as np
from PIL import Image, ImageStat, ImageFilter
import cv2
from scipy import ndimage, spatial
from scipy.stats import entropy
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import silhouette_score, calinski_harabasz_score
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import lpips
import pandas as pd
from skimage import feature, measure, filters, morphology
from skimage.metrics import structural_similarity as ssim
import matplotlib.pyplot as plt
import seaborn as sns

# Configure logging
logger = logging.getLogger(__name__)

class QualityMetric(str, Enum):
    """Quality metrics for synthetic data"""
    SHARPNESS = "sharpness"
    CONTRAST = "contrast"
    BRIGHTNESS = "brightness"
    SATURATION = "saturation"
    NOISE_LEVEL = "noise_level"
    BLUR_LEVEL = "blur_level"
    AESTHETIC_SCORE = "aesthetic_score"
    TECHNICAL_QUALITY = "technical_quality"
    SEMANTIC_CONSISTENCY = "semantic_consistency"
    DIVERSITY_SCORE = "diversity_score"
    NATURALNESS = "naturalness"
    ARTIFACT_LEVEL = "artifact_level"
    RESOLUTION_QUALITY = "resolution_quality"
    COLOR_HARMONY = "color_harmony"
    COMPOSITION_SCORE = "composition_score"

class FilteringStrategy(str, Enum):
    """Filtering strategies"""
    THRESHOLD_BASED = "threshold_based"
    PERCENTILE_BASED = "percentile_based"
    CLUSTERING_BASED = "clustering_based"
    ENSEMBLE_BASED = "ensemble_based"
    ADAPTIVE = "adaptive"
    HIERARCHICAL = "hierarchical"

class DiversityMetric(str, Enum):
    """Diversity metrics"""
    LPIPS_DISTANCE = "lpips_distance"
    FEATURE_DIVERSITY = "feature_diversity"
    COLOR_DIVERSITY = "color_diversity"
    TEXTURE_DIVERSITY = "texture_diversity"
    SEMANTIC_DIVERSITY = "semantic_diversity"
    SPATIAL_DIVERSITY = "spatial_diversity"

@dataclass
class QualityThresholds:
    """Quality thresholds for filtering"""
    sharpness_min: float = 0.3
    sharpness_max: float = 1.0
    contrast_min: float = 0.2
    contrast_max: float = 0.9
    brightness_min: float = 0.1
    brightness_max: float = 0.9
    saturation_min: float = 0.1
    saturation_max: float = 0.8
    noise_level_max: float = 0.3
    blur_level_max: float = 0.4
    aesthetic_score_min: float = 0.5
    technical_quality_min: float = 0.6
    semantic_consistency_min: float = 0.7
    diversity_score_min: float = 0.4
    naturalness_min: float = 0.5
    artifact_level_max: float = 0.3
    resolution_quality_min: float = 0.7
    color_harmony_min: float = 0.4
    composition_score_min: float = 0.5

@dataclass
class FilteringConfig:
    """Configuration for quality filtering"""
    enabled_metrics: List[QualityMetric] = field(default_factory=lambda: [
        QualityMetric.SHARPNESS,
        QualityMetric.CONTRAST,
        QualityMetric.BRIGHTNESS,
        QualityMetric.AESTHETIC_SCORE,
        QualityMetric.TECHNICAL_QUALITY,
        QualityMetric.DIVERSITY_SCORE
    ])
    thresholds: QualityThresholds = field(default_factory=QualityThresholds)
    filtering_strategy: FilteringStrategy = FilteringStrategy.THRESHOLD_BASED
    diversity_metrics: List[DiversityMetric] = field(default_factory=lambda: [
        DiversityMetric.LPIPS_DISTANCE,
        DiversityMetric.FEATURE_DIVERSITY,
        DiversityMetric.COLOR_DIVERSITY
    ])
    max_images_per_cluster: int = 10
    min_diversity_distance: float = 0.1
    quality_weight: float = 0.7
    diversity_weight: float = 0.3
    batch_size: int = 32
    use_gpu: bool = True
    save_reports: bool = True

class QualityAssessmentNetwork(nn.Module):
    """Neural network for quality assessment"""
    
    def __init__(self, backbone='resnet50'):
        super(QualityAssessmentNetwork, self).__init__()
        
        if backbone == 'resnet50':
            self.backbone = resnet50(pretrained=True)
            self.backbone.fc = nn.Identity()
            feature_dim = 2048
        elif backbone == 'vgg16':
            self.backbone = vgg16(pretrained=True)
            self.backbone.classifier = nn.Identity()
            feature_dim = 4096
        else:
            raise ValueError(f"Unsupported backbone: {backbone}")
        
        # Freeze backbone parameters
        for param in self.backbone.parameters():
            param.requires_grad = False
        
        # Quality prediction head
        self.quality_head = nn.Sequential(
            nn.Linear(feature_dim, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 1),
            nn.Sigmoid()
        )
        
        # Aesthetic prediction head
        self.aesthetic_head = nn.Sequential(
            nn.Linear(feature_dim, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 1),
            nn.Sigmoid()
        )
        
        # Naturalness prediction head
        self.naturalness_head = nn.Sequential(
            nn.Linear(feature_dim, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        features = self.backbone(x)
        
        if len(features.shape) > 2:
            features = F.adaptive_avg_pool2d(features, 1).flatten(1)
        
        quality_score = self.quality_head(features)
        aesthetic_score = self.aesthetic_head(features)
        naturalness_score = self.naturalness_head(features)
        
        return {
            'quality': quality_score,
            'aesthetic': aesthetic_score,
            'naturalness': naturalness_score,
            'features': features
        }

class QualityFilteringService:
    """Main quality filtering service"""
    
    def __init__(self, device='cuda'):
        self.device = device if torch.cuda.is_available() else 'cpu'
        self.quality_network = None
        self.lpips_model = None
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.filtering_history = []
        self.quality_cache = {}
        
        # Initialize models
        asyncio.create_task(self._initialize_models())
    
    async def _initialize_models(self):
        """Initialize quality assessment models"""
        logger.info("Initializing quality filtering models...")
        
        try:
            # Load quality assessment network
            self.quality_network = QualityAssessmentNetwork().to(self.device)
            self.quality_network.eval()
            
            # Load LPIPS model for perceptual similarity
            self.lpips_model = lpips.LPIPS(net='alex').to(self.device)
            self.lpips_model.eval()
            
            logger.info("Quality filtering models initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize quality filtering models: {e}")
            raise
    
    async def filter_images(
        self,
        images: List[Dict[str, Any]],
        config: FilteringConfig
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Filter images based on quality metrics"""
        
        logger.info(f"Filtering {len(images)} images with strategy: {config.filtering_strategy}")
        
        start_time = time.time()
        
        # Assess quality of all images
        quality_scores = await self._assess_image_quality(images, config)
        
        # Apply filtering strategy
        if config.filtering_strategy == FilteringStrategy.THRESHOLD_BASED:
            filtered_images, report = await self._threshold_based_filtering(
                images, quality_scores, config
            )
        elif config.filtering_strategy == FilteringStrategy.PERCENTILE_BASED:
            filtered_images, report = await self._percentile_based_filtering(
                images, quality_scores, config
            )
        elif config.filtering_strategy == FilteringStrategy.CLUSTERING_BASED:
            filtered_images, report = await self._clustering_based_filtering(
                images, quality_scores, config
            )
        elif config.filtering_strategy == FilteringStrategy.ENSEMBLE_BASED:
            filtered_images, report = await self._ensemble_based_filtering(
                images, quality_scores, config
            )
        elif config.filtering_strategy == FilteringStrategy.ADAPTIVE:
            filtered_images, report = await self._adaptive_filtering(
                images, quality_scores, config
            )
        else:
            # Default to threshold-based filtering
            filtered_images, report = await self._threshold_based_filtering(
                images, quality_scores, config
            )
        
        # Apply diversity optimization
        if config.diversity_weight > 0:
            filtered_images = await self._optimize_diversity(filtered_images, config)
        
        # Update report
        filtering_time = time.time() - start_time
        report.update({
            'filtering_time': filtering_time,
            'original_count': len(images),
            'filtered_count': len(filtered_images),
            'retention_rate': len(filtered_images) / len(images) if images else 0,
            'filtering_config': config.__dict__
        })
        
        # Log filtering results
        self.filtering_history.append({
            'timestamp': datetime.now(),
            'report': report
        })
        
        logger.info(f"Filtering completed in {filtering_time:.2f} seconds. "
                   f"Retained {len(filtered_images)}/{len(images)} images "
                   f"({report['retention_rate']:.2%})")
        
        return filtered_images, report
    
    async def _assess_image_quality(
        self,
        images: List[Dict[str, Any]],
        config: FilteringConfig
    ) -> Dict[str, Dict[str, float]]:
        """Assess quality of images"""
        
        logger.info(f"Assessing quality for {len(images)} images")
        
        quality_scores = {}
        
        for i, image_data in enumerate(images):
            image_id = image_data.get('id', f'image_{i}')
            
            # Check cache first
            if image_id in self.quality_cache:
                quality_scores[image_id] = self.quality_cache[image_id]
                continue
            
            # Decode image
            image = self._decode_base64_image(image_data['data'])
            
            # Calculate quality metrics
            scores = await self._calculate_quality_metrics(image, config)
            
            # Cache results
            self.quality_cache[image_id] = scores
            quality_scores[image_id] = scores
        
        return quality_scores
    
    async def _calculate_quality_metrics(
        self,
        image: Image.Image,
        config: FilteringConfig
    ) -> Dict[str, float]:
        """Calculate quality metrics for a single image"""
        
        scores = {}
        
        # Convert image to different formats for analysis
        image_np = np.array(image)
        image_gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY) if len(image_np.shape) == 3 else image_np
        
        # Basic quality metrics
        if QualityMetric.SHARPNESS in config.enabled_metrics:
            scores[QualityMetric.SHARPNESS] = await self._calculate_sharpness(image_gray)
        
        if QualityMetric.CONTRAST in config.enabled_metrics:
            scores[QualityMetric.CONTRAST] = await self._calculate_contrast(image_gray)
        
        if QualityMetric.BRIGHTNESS in config.enabled_metrics:
            scores[QualityMetric.BRIGHTNESS] = await self._calculate_brightness(image_gray)
        
        if QualityMetric.SATURATION in config.enabled_metrics:
            scores[QualityMetric.SATURATION] = await self._calculate_saturation(image_np)
        
        if QualityMetric.NOISE_LEVEL in config.enabled_metrics:
            scores[QualityMetric.NOISE_LEVEL] = await self._calculate_noise_level(image_gray)
        
        if QualityMetric.BLUR_LEVEL in config.enabled_metrics:
            scores[QualityMetric.BLUR_LEVEL] = await self._calculate_blur_level(image_gray)
        
        if QualityMetric.ARTIFACT_LEVEL in config.enabled_metrics:
            scores[QualityMetric.ARTIFACT_LEVEL] = await self._calculate_artifact_level(image_np)
        
        if QualityMetric.RESOLUTION_QUALITY in config.enabled_metrics:
            scores[QualityMetric.RESOLUTION_QUALITY] = await self._calculate_resolution_quality(image_np)
        
        if QualityMetric.COLOR_HARMONY in config.enabled_metrics:
            scores[QualityMetric.COLOR_HARMONY] = await self._calculate_color_harmony(image_np)
        
        if QualityMetric.COMPOSITION_SCORE in config.enabled_metrics:
            scores[QualityMetric.COMPOSITION_SCORE] = await self._calculate_composition_score(image_np)
        
        # Neural network-based metrics
        if (QualityMetric.AESTHETIC_SCORE in config.enabled_metrics or
            QualityMetric.TECHNICAL_QUALITY in config.enabled_metrics or
            QualityMetric.NATURALNESS in config.enabled_metrics):
            
            neural_scores = await self._calculate_neural_metrics(image)
            scores.update(neural_scores)
        
        return scores
    
    async def _calculate_sharpness(self, image_gray: np.ndarray) -> float:
        """Calculate image sharpness using Laplacian variance"""
        laplacian = cv2.Laplacian(image_gray, cv2.CV_64F)
        sharpness = laplacian.var()
        return min(sharpness / 1000.0, 1.0)  # Normalize to [0, 1]
    
    async def _calculate_contrast(self, image_gray: np.ndarray) -> float:
        """Calculate image contrast using RMS contrast"""
        mean_intensity = np.mean(image_gray)
        rms_contrast = np.sqrt(np.mean((image_gray - mean_intensity) ** 2))
        return min(rms_contrast / 127.5, 1.0)  # Normalize to [0, 1]
    
    async def _calculate_brightness(self, image_gray: np.ndarray) -> float:
        """Calculate image brightness"""
        brightness = np.mean(image_gray) / 255.0
        return brightness
    
    async def _calculate_saturation(self, image_np: np.ndarray) -> float:
        """Calculate image saturation"""
        if len(image_np.shape) != 3:
            return 0.0
        
        # Convert to HSV
        hsv = cv2.cvtColor(image_np, cv2.COLOR_RGB2HSV)
        saturation = np.mean(hsv[:, :, 1]) / 255.0
        return saturation
    
    async def _calculate_noise_level(self, image_gray: np.ndarray) -> float:
        """Calculate noise level using high-pass filtering"""
        # Apply high-pass filter
        kernel = np.array([[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]])
        filtered = cv2.filter2D(image_gray, -1, kernel)
        
        # Calculate noise as standard deviation of filtered image
        noise_level = np.std(filtered) / 255.0
        return min(noise_level, 1.0)
    
    async def _calculate_blur_level(self, image_gray: np.ndarray) -> float:
        """Calculate blur level using gradient magnitude"""
        # Calculate gradients
        grad_x = cv2.Sobel(image_gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(image_gray, cv2.CV_64F, 0, 1, ksize=3)
        
        # Calculate gradient magnitude
        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
        
        # Blur is inverse of gradient magnitude
        blur_level = 1.0 - min(np.mean(gradient_magnitude) / 100.0, 1.0)
        return blur_level
    
    async def _calculate_artifact_level(self, image_np: np.ndarray) -> float:
        """Calculate artifact level using edge detection"""
        # Convert to grayscale
        if len(image_np.shape) == 3:
            gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
        else:
            gray = image_np
        
        # Detect edges
        edges = cv2.Canny(gray, 50, 150)
        
        # Calculate artifact level as ratio of edge pixels
        artifact_level = np.sum(edges > 0) / edges.size
        return min(artifact_level * 5, 1.0)  # Scale and clamp
    
    async def _calculate_resolution_quality(self, image_np: np.ndarray) -> float:
        """Calculate resolution quality"""
        height, width = image_np.shape[:2]
        
        # Simple resolution quality based on dimensions
        min_dimension = min(height, width)
        
        if min_dimension >= 1024:
            return 1.0
        elif min_dimension >= 512:
            return 0.8
        elif min_dimension >= 256:
            return 0.6
        else:
            return 0.4
    
    async def _calculate_color_harmony(self, image_np: np.ndarray) -> float:
        """Calculate color harmony using color distribution"""
        if len(image_np.shape) != 3:
            return 0.5
        
        # Calculate color histograms
        hist_r = cv2.calcHist([image_np], [0], None, [256], [0, 256])
        hist_g = cv2.calcHist([image_np], [1], None, [256], [0, 256])
        hist_b = cv2.calcHist([image_np], [2], None, [256], [0, 256])
        
        # Normalize histograms
        hist_r = hist_r.flatten() / np.sum(hist_r)
        hist_g = hist_g.flatten() / np.sum(hist_g)
        hist_b = hist_b.flatten() / np.sum(hist_b)
        
        # Calculate entropy (lower entropy = better harmony)
        entropy_r = entropy(hist_r + 1e-10)
        entropy_g = entropy(hist_g + 1e-10)
        entropy_b = entropy(hist_b + 1e-10)
        
        avg_entropy = (entropy_r + entropy_g + entropy_b) / 3
        
        # Convert to harmony score (inverse of entropy, normalized)
        harmony_score = 1.0 - (avg_entropy / 8.0)  # 8 is approximate max entropy
        return max(0.0, min(1.0, harmony_score))
    
    async def _calculate_composition_score(self, image_np: np.ndarray) -> float:
        """Calculate composition score using rule of thirds"""
        height, width = image_np.shape[:2]
        
        # Convert to grayscale
        if len(image_np.shape) == 3:
            gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
        else:
            gray = image_np
        
        # Calculate rule of thirds points
        third_h = height // 3
        third_w = width // 3
        
        # Define rule of thirds lines
        lines = [
            (0, third_h, width, third_h),  # Horizontal lines
            (0, 2 * third_h, width, 2 * third_h),
            (third_w, 0, third_w, height),  # Vertical lines
            (2 * third_w, 0, 2 * third_w, height)
        ]
        
        # Calculate gradient magnitude
        grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
        
        # Calculate composition score based on gradient distribution
        total_gradient = np.sum(gradient_magnitude)
        if total_gradient == 0:
            return 0.5
        
        # Calculate gradient near rule of thirds lines
        line_gradient = 0
        for x1, y1, x2, y2 in lines:
            if x1 == x2:  # Vertical line
                line_gradient += np.sum(gradient_magnitude[:, max(0, x1-5):min(width, x1+5)])
            else:  # Horizontal line
                line_gradient += np.sum(gradient_magnitude[max(0, y1-5):min(height, y1+5), :])
        
        composition_score = line_gradient / total_gradient
        return min(composition_score * 2, 1.0)  # Scale and clamp
    
    async def _calculate_neural_metrics(self, image: Image.Image) -> Dict[str, float]:
        """Calculate neural network-based quality metrics"""
        if self.quality_network is None:
            return {}
        
        # Prepare image for neural network
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        image_tensor = transform(image).unsqueeze(0).to(self.device)
        
        # Forward pass
        with torch.no_grad():
            outputs = self.quality_network(image_tensor)
        
        return {
            QualityMetric.AESTHETIC_SCORE: outputs['aesthetic'].item(),
            QualityMetric.TECHNICAL_QUALITY: outputs['quality'].item(),
            QualityMetric.NATURALNESS: outputs['naturalness'].item()
        }
    
    async def _threshold_based_filtering(
        self,
        images: List[Dict[str, Any]],
        quality_scores: Dict[str, Dict[str, float]],
        config: FilteringConfig
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Apply threshold-based filtering"""
        
        filtered_images = []
        rejection_reasons = {}
        
        for i, image_data in enumerate(images):
            image_id = image_data.get('id', f'image_{i}')
            scores = quality_scores.get(image_id, {})
            
            # Check thresholds
            passed = True
            reasons = []
            
            for metric, score in scores.items():
                threshold_min = getattr(config.thresholds, f"{metric}_min", None)
                threshold_max = getattr(config.thresholds, f"{metric}_max", None)
                
                if threshold_min is not None and score < threshold_min:
                    passed = False
                    reasons.append(f"{metric} below threshold ({score:.3f} < {threshold_min})")
                
                if threshold_max is not None and score > threshold_max:
                    passed = False
                    reasons.append(f"{metric} above threshold ({score:.3f} > {threshold_max})")
            
            if passed:
                filtered_images.append({
                    **image_data,
                    'quality_scores': scores,
                    'quality_passed': True
                })
            else:
                rejection_reasons[image_id] = reasons
        
        report = {
            'filtering_method': 'threshold_based',
            'rejection_reasons': rejection_reasons,
            'quality_statistics': self._calculate_quality_statistics(quality_scores)
        }
        
        return filtered_images, report
    
    async def _percentile_based_filtering(
        self,
        images: List[Dict[str, Any]],
        quality_scores: Dict[str, Dict[str, float]],
        config: FilteringConfig
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Apply percentile-based filtering"""
        
        # Calculate percentiles for each metric
        metric_percentiles = {}
        for metric in config.enabled_metrics:
            metric_scores = [scores.get(metric, 0) for scores in quality_scores.values()]
            if metric_scores:
                metric_percentiles[metric] = {
                    'p25': np.percentile(metric_scores, 25),
                    'p50': np.percentile(metric_scores, 50),
                    'p75': np.percentile(metric_scores, 75),
                    'p90': np.percentile(metric_scores, 90)
                }
        
        # Filter images based on percentiles
        filtered_images = []
        rejection_reasons = {}
        
        for i, image_data in enumerate(images):
            image_id = image_data.get('id', f'image_{i}')
            scores = quality_scores.get(image_id, {})
            
            # Calculate overall score based on percentiles
            overall_score = 0
            for metric, score in scores.items():
                if metric in metric_percentiles:
                    percentiles = metric_percentiles[metric]
                    if score >= percentiles['p75']:
                        overall_score += 1.0
                    elif score >= percentiles['p50']:
                        overall_score += 0.75
                    elif score >= percentiles['p25']:
                        overall_score += 0.5
                    else:
                        overall_score += 0.25
            
            # Normalize by number of metrics
            if len(scores) > 0:
                overall_score /= len(scores)
            
            # Filter based on overall score
            if overall_score >= 0.6:  # Keep top 60% quality images
                filtered_images.append({
                    **image_data,
                    'quality_scores': scores,
                    'overall_quality_score': overall_score
                })
            else:
                rejection_reasons[image_id] = [f"Overall quality score too low ({overall_score:.3f})"]
        
        report = {
            'filtering_method': 'percentile_based',
            'metric_percentiles': metric_percentiles,
            'rejection_reasons': rejection_reasons,
            'quality_statistics': self._calculate_quality_statistics(quality_scores)
        }
        
        return filtered_images, report
    
    async def _clustering_based_filtering(
        self,
        images: List[Dict[str, Any]],
        quality_scores: Dict[str, Dict[str, float]],
        config: FilteringConfig
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Apply clustering-based filtering"""
        
        # Prepare feature matrix
        feature_matrix = []
        image_ids = []
        
        for i, image_data in enumerate(images):
            image_id = image_data.get('id', f'image_{i}')
            scores = quality_scores.get(image_id, {})
            
            # Create feature vector
            feature_vector = []
            for metric in config.enabled_metrics:
                feature_vector.append(scores.get(metric, 0))
            
            feature_matrix.append(feature_vector)
            image_ids.append(image_id)
        
        if not feature_matrix:
            return images, {'filtering_method': 'clustering_based', 'error': 'No features available'}
        
        # Standardize features
        scaler = StandardScaler()
        feature_matrix_scaled = scaler.fit_transform(feature_matrix)
        
        # Apply clustering
        n_clusters = min(5, len(images) // 2)  # Adaptive number of clusters
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        cluster_labels = kmeans.fit_predict(feature_matrix_scaled)
        
        # Calculate cluster quality
        cluster_quality = {}
        for cluster_id in range(n_clusters):
            cluster_indices = np.where(cluster_labels == cluster_id)[0]
            cluster_scores = [feature_matrix[i] for i in cluster_indices]
            
            if cluster_scores:
                cluster_quality[cluster_id] = np.mean(cluster_scores)
        
        # Select best clusters
        best_clusters = sorted(cluster_quality.keys(), 
                              key=lambda x: np.mean(cluster_quality[x]), 
                              reverse=True)[:3]  # Keep top 3 clusters
        
        # Filter images
        filtered_images = []
        rejection_reasons = {}
        
        for i, image_data in enumerate(images):
            image_id = image_ids[i]
            cluster_id = cluster_labels[i]
            
            if cluster_id in best_clusters:
                filtered_images.append({
                    **image_data,
                    'quality_scores': quality_scores.get(image_id, {}),
                    'cluster_id': int(cluster_id),
                    'cluster_quality': cluster_quality.get(cluster_id, 0)
                })
            else:
                rejection_reasons[image_id] = [f"Assigned to low-quality cluster {cluster_id}"]
        
        report = {
            'filtering_method': 'clustering_based',
            'n_clusters': n_clusters,
            'cluster_quality': cluster_quality,
            'best_clusters': best_clusters,
            'rejection_reasons': rejection_reasons,
            'quality_statistics': self._calculate_quality_statistics(quality_scores)
        }
        
        return filtered_images, report
    
    async def _ensemble_based_filtering(
        self,
        images: List[Dict[str, Any]],
        quality_scores: Dict[str, Dict[str, float]],
        config: FilteringConfig
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Apply ensemble-based filtering"""
        
        # Apply multiple filtering methods
        threshold_results, threshold_report = await self._threshold_based_filtering(
            images, quality_scores, config
        )
        
        percentile_results, percentile_report = await self._percentile_based_filtering(
            images, quality_scores, config
        )
        
        clustering_results, clustering_report = await self._clustering_based_filtering(
            images, quality_scores, config
        )
        
        # Find intersection of all methods
        threshold_ids = {img.get('id', f'image_{i}') for i, img in enumerate(threshold_results)}
        percentile_ids = {img.get('id', f'image_{i}') for i, img in enumerate(percentile_results)}
        clustering_ids = {img.get('id', f'image_{i}') for i, img in enumerate(clustering_results)}
        
        # Ensemble voting
        ensemble_ids = threshold_ids & percentile_ids & clustering_ids
        
        # Select images that passed all methods
        filtered_images = []
        for i, image_data in enumerate(images):
            image_id = image_data.get('id', f'image_{i}')
            if image_id in ensemble_ids:
                filtered_images.append({
                    **image_data,
                    'quality_scores': quality_scores.get(image_id, {}),
                    'ensemble_passed': True
                })
        
        report = {
            'filtering_method': 'ensemble_based',
            'threshold_count': len(threshold_results),
            'percentile_count': len(percentile_results),
            'clustering_count': len(clustering_results),
            'ensemble_count': len(filtered_images),
            'individual_reports': {
                'threshold': threshold_report,
                'percentile': percentile_report,
                'clustering': clustering_report
            },
            'quality_statistics': self._calculate_quality_statistics(quality_scores)
        }
        
        return filtered_images, report
    
    async def _adaptive_filtering(
        self,
        images: List[Dict[str, Any]],
        quality_scores: Dict[str, Dict[str, float]],
        config: FilteringConfig
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Apply adaptive filtering based on data characteristics"""
        
        # Analyze data characteristics
        data_stats = self._analyze_data_characteristics(quality_scores)
        
        # Choose filtering method based on data characteristics
        if data_stats['diversity'] > 0.7:
            # High diversity - use clustering
            return await self._clustering_based_filtering(images, quality_scores, config)
        elif data_stats['quality_variance'] > 0.5:
            # High quality variance - use percentile
            return await self._percentile_based_filtering(images, quality_scores, config)
        else:
            # Standard case - use threshold
            return await self._threshold_based_filtering(images, quality_scores, config)
    
    def _analyze_data_characteristics(self, quality_scores: Dict[str, Dict[str, float]]) -> Dict[str, float]:
        """Analyze characteristics of the data"""
        if not quality_scores:
            return {'diversity': 0, 'quality_variance': 0}
        
        # Calculate diversity
        all_scores = []
        for scores in quality_scores.values():
            all_scores.extend(scores.values())
        
        diversity = np.std(all_scores) if all_scores else 0
        
        # Calculate quality variance
        quality_variance = 0
        if quality_scores:
            first_scores = list(quality_scores.values())[0]
            if first_scores:
                quality_variance = np.var(list(first_scores.values()))
        
        return {
            'diversity': min(diversity, 1.0),
            'quality_variance': min(quality_variance, 1.0)
        }
    
    async def _optimize_diversity(
        self,
        images: List[Dict[str, Any]],
        config: FilteringConfig
    ) -> List[Dict[str, Any]]:
        """Optimize diversity of filtered images"""
        
        if len(images) <= config.max_images_per_cluster:
            return images
        
        logger.info(f"Optimizing diversity for {len(images)} images")
        
        # Calculate diversity features
        diversity_features = []
        for image_data in images:
            features = await self._extract_diversity_features(image_data, config)
            diversity_features.append(features)
        
        if not diversity_features:
            return images
        
        # Apply clustering for diversity
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(diversity_features)
        
        # Use DBSCAN for adaptive clustering
        dbscan = DBSCAN(eps=config.min_diversity_distance, min_samples=2)
        cluster_labels = dbscan.fit_predict(features_scaled)
        
        # Select diverse representatives
        diverse_images = []
        unique_clusters = set(cluster_labels)
        
        for cluster_id in unique_clusters:
            if cluster_id == -1:  # Noise points
                continue
            
            cluster_indices = np.where(cluster_labels == cluster_id)[0]
            cluster_images = [images[i] for i in cluster_indices]
            
            # Select best images from each cluster
            max_per_cluster = min(config.max_images_per_cluster, len(cluster_images))
            
            # Sort by quality score
            cluster_images.sort(
                key=lambda x: x.get('overall_quality_score', 0.5),
                reverse=True
            )
            
            diverse_images.extend(cluster_images[:max_per_cluster])
        
        # Add noise points if needed
        noise_indices = np.where(cluster_labels == -1)[0]
        if len(diverse_images) < len(images) * 0.8:  # If we filtered too aggressively
            noise_images = [images[i] for i in noise_indices]
            diverse_images.extend(noise_images[:len(images) - len(diverse_images)])
        
        logger.info(f"Diversity optimization: {len(images)} -> {len(diverse_images)} images")
        
        return diverse_images
    
    async def _extract_diversity_features(
        self,
        image_data: Dict[str, Any],
        config: FilteringConfig
    ) -> List[float]:
        """Extract features for diversity analysis"""
        
        # Decode image
        image = self._decode_base64_image(image_data['data'])
        image_np = np.array(image)
        
        features = []
        
        # Color features
        if DiversityMetric.COLOR_DIVERSITY in config.diversity_metrics:
            color_hist = cv2.calcHist([image_np], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
            features.extend(color_hist.flatten()[:64])  # Use first 64 bins
        
        # Texture features
        if DiversityMetric.TEXTURE_DIVERSITY in config.diversity_metrics:
            gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
            
            # LBP features
            lbp = feature.local_binary_pattern(gray, 8, 1, method='uniform')
            lbp_hist, _ = np.histogram(lbp.ravel(), bins=10, range=(0, 10))
            features.extend(lbp_hist)
            
            # Gabor features
            gabor_responses = []
            for theta in [0, 45, 90, 135]:
                gabor_real, _ = filters.gabor(gray, frequency=0.1, theta=np.radians(theta))
                gabor_responses.append(np.mean(gabor_real))
            features.extend(gabor_responses)
        
        # Spatial features
        if DiversityMetric.SPATIAL_DIVERSITY in config.diversity_metrics:
            # Calculate spatial moments
            moments = cv2.moments(cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY))
            features.extend([
                moments.get('m10', 0) / (moments.get('m00', 1) + 1e-7),
                moments.get('m01', 0) / (moments.get('m00', 1) + 1e-7),
                moments.get('m20', 0) / (moments.get('m00', 1) + 1e-7),
                moments.get('m11', 0) / (moments.get('m00', 1) + 1e-7),
                moments.get('m02', 0) / (moments.get('m00', 1) + 1e-7)
            ])
        
        # Normalize features
        features = np.array(features)
        features = features / (np.linalg.norm(features) + 1e-7)
        
        return features.tolist()
    
    def _calculate_quality_statistics(self, quality_scores: Dict[str, Dict[str, float]]) -> Dict[str, Any]:
        """Calculate quality statistics"""
        if not quality_scores:
            return {}
        
        stats = {}
        
        # Calculate statistics for each metric
        for metric in QualityMetric:
            metric_scores = [scores.get(metric, 0) for scores in quality_scores.values()]
            metric_scores = [s for s in metric_scores if s > 0]  # Filter out zeros
            
            if metric_scores:
                stats[metric] = {
                    'mean': np.mean(metric_scores),
                    'std': np.std(metric_scores),
                    'min': np.min(metric_scores),
                    'max': np.max(metric_scores),
                    'median': np.median(metric_scores)
                }
        
        return stats
    
    def _decode_base64_image(self, base64_string: str) -> Image.Image:
        """Decode base64 string to PIL Image"""
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        return image
    
    def get_filtering_history(self) -> List[Dict[str, Any]]:
        """Get filtering history"""
        return self.filtering_history
    
    def get_quality_cache_stats(self) -> Dict[str, Any]:
        """Get quality cache statistics"""
        return {
            'cache_size': len(self.quality_cache),
            'cache_keys': list(self.quality_cache.keys())[:10]  # Show first 10 keys
        }
    
    def clear_quality_cache(self):
        """Clear quality cache"""
        self.quality_cache.clear()
        logger.info("Quality cache cleared")
    
    def get_supported_metrics(self) -> List[QualityMetric]:
        """Get supported quality metrics"""
        return list(QualityMetric)
    
    def get_supported_strategies(self) -> List[FilteringStrategy]:
        """Get supported filtering strategies"""
        return list(FilteringStrategy)
    
    def get_default_config(self) -> FilteringConfig:
        """Get default filtering configuration"""
        return FilteringConfig() 