#!/usr/bin/env python3
"""
Data Augmentation Service for AnnotateAI Synthetic Data Generation
Advanced augmentation techniques for creating diverse and high-quality training data
"""

import logging
import time
import random
from typing import Dict, List, Optional, Any, Union, Tuple
from enum import Enum
from dataclasses import dataclass
import asyncio
import math

import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageDraw
import numpy as np
import cv2
from scipy import ndimage
from skimage import transform as sk_transform
from skimage import filters, morphology, segmentation
from skimage.util import random_noise
import albumentations as A
from albumentations.pytorch import ToTensorV2
import imgaug as ia
import imgaug.augmenters as iaa
from imgaug.augmenters import geometric, arithmetic, color, contrast, blur, weather
import io
import base64
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
import json

# Configure logging
logger = logging.getLogger(__name__)

class AugmentationType(str, Enum):
    """Types of augmentation"""
    GEOMETRIC = "geometric"
    PHOTOMETRIC = "photometric"
    SEMANTIC = "semantic"
    NOISE = "noise"
    BLUR = "blur"
    WEATHER = "weather"
    ARTISTIC = "artistic"
    MEDICAL = "medical"
    SYNTHETIC = "synthetic"

class GeometricTransform(str, Enum):
    """Geometric transformation types"""
    ROTATION = "rotation"
    SCALE = "scale"
    TRANSLATION = "translation"
    SHEAR = "shear"
    FLIP = "flip"
    PERSPECTIVE = "perspective"
    ELASTIC = "elastic"
    AFFINE = "affine"
    DISTORTION = "distortion"

class PhotometricTransform(str, Enum):
    """Photometric transformation types"""
    BRIGHTNESS = "brightness"
    CONTRAST = "contrast"
    SATURATION = "saturation"
    HUE = "hue"
    GAMMA = "gamma"
    HISTOGRAM_EQUALIZATION = "histogram_equalization"
    COLOR_JITTER = "color_jitter"
    CHANNEL_SHUFFLE = "channel_shuffle"

@dataclass
class AugmentationConfig:
    """Configuration for data augmentation"""
    enabled_types: List[AugmentationType] = None
    geometric_config: Dict[str, Any] = None
    photometric_config: Dict[str, Any] = None
    semantic_config: Dict[str, Any] = None
    noise_config: Dict[str, Any] = None
    blur_config: Dict[str, Any] = None
    weather_config: Dict[str, Any] = None
    artistic_config: Dict[str, Any] = None
    
    # Global settings
    probability: float = 0.5
    augmentation_factor: int = 1
    preserve_aspect_ratio: bool = True
    maintain_quality: bool = True
    target_domain: Optional[str] = None
    
    def __post_init__(self):
        if self.enabled_types is None:
            self.enabled_types = [AugmentationType.GEOMETRIC, AugmentationType.PHOTOMETRIC]
        
        if self.geometric_config is None:
            self.geometric_config = {
                "rotation_range": 15.0,
                "scale_range": (0.8, 1.2),
                "translation_range": 0.1,
                "shear_range": 10.0,
                "flip_horizontal": True,
                "flip_vertical": False,
                "perspective_distortion": 0.1,
                "elastic_alpha": 100.0,
                "elastic_sigma": 10.0
            }
        
        if self.photometric_config is None:
            self.photometric_config = {
                "brightness_range": 0.2,
                "contrast_range": 0.2,
                "saturation_range": 0.2,
                "hue_range": 0.1,
                "gamma_range": (0.8, 1.2),
                "color_jitter_strength": 0.5,
                "channel_shuffle_probability": 0.1
            }
        
        if self.noise_config is None:
            self.noise_config = {
                "gaussian_noise_std": 0.01,
                "salt_pepper_ratio": 0.01,
                "speckle_noise_std": 0.01,
                "uniform_noise_range": 0.05,
                "poisson_noise": True
            }
        
        if self.blur_config is None:
            self.blur_config = {
                "gaussian_blur_sigma": (0.1, 2.0),
                "motion_blur_size": 5,
                "defocus_blur_radius": 3,
                "lens_blur_radius": 2
            }
        
        if self.weather_config is None:
            self.weather_config = {
                "rain_intensity": 0.3,
                "snow_intensity": 0.2,
                "fog_intensity": 0.2,
                "sun_flare_intensity": 0.3,
                "cloud_density": 0.3
            }
        
        if self.artistic_config is None:
            self.artistic_config = {
                "oil_painting_intensity": 0.5,
                "watercolor_intensity": 0.3,
                "pencil_sketch_intensity": 0.4,
                "cartoon_intensity": 0.3
            }

class GeometricAugmentationEngine:
    """Engine for geometric augmentations"""
    
    def __init__(self):
        self.transforms = {
            GeometricTransform.ROTATION: self._apply_rotation,
            GeometricTransform.SCALE: self._apply_scale,
            GeometricTransform.TRANSLATION: self._apply_translation,
            GeometricTransform.SHEAR: self._apply_shear,
            GeometricTransform.FLIP: self._apply_flip,
            GeometricTransform.PERSPECTIVE: self._apply_perspective,
            GeometricTransform.ELASTIC: self._apply_elastic,
            GeometricTransform.AFFINE: self._apply_affine,
            GeometricTransform.DISTORTION: self._apply_distortion
        }
    
    async def apply_transforms(
        self,
        image: Image.Image,
        config: Dict[str, Any],
        probability: float = 0.5
    ) -> Image.Image:
        """Apply geometric transformations"""
        
        for transform_name, transform_func in self.transforms.items():
            if random.random() < probability:
                try:
                    image = await transform_func(image, config)
                except Exception as e:
                    logger.warning(f"Failed to apply {transform_name}: {e}")
        
        return image
    
    async def _apply_rotation(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply rotation transformation"""
        angle = random.uniform(-config["rotation_range"], config["rotation_range"])
        return image.rotate(angle, resample=Image.BILINEAR, expand=False)
    
    async def _apply_scale(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply scale transformation"""
        scale_range = config["scale_range"]
        scale_factor = random.uniform(scale_range[0], scale_range[1])
        
        width, height = image.size
        new_width = int(width * scale_factor)
        new_height = int(height * scale_factor)
        
        scaled = image.resize((new_width, new_height), Image.BILINEAR)
        
        # Center crop or pad to original size
        if scale_factor > 1.0:
            # Crop to original size
            left = (new_width - width) // 2
            top = (new_height - height) // 2
            scaled = scaled.crop((left, top, left + width, top + height))
        else:
            # Pad to original size
            padded = Image.new(image.mode, (width, height), (0, 0, 0))
            paste_x = (width - new_width) // 2
            paste_y = (height - new_height) // 2
            padded.paste(scaled, (paste_x, paste_y))
            scaled = padded
        
        return scaled
    
    async def _apply_translation(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply translation transformation"""
        width, height = image.size
        translation_range = config["translation_range"]
        
        dx = random.uniform(-translation_range, translation_range) * width
        dy = random.uniform(-translation_range, translation_range) * height
        
        return image.transform(
            image.size,
            Image.AFFINE,
            (1, 0, dx, 0, 1, dy),
            resample=Image.BILINEAR
        )
    
    async def _apply_shear(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply shear transformation"""
        shear_range = config["shear_range"]
        shear_x = random.uniform(-shear_range, shear_range)
        shear_y = random.uniform(-shear_range, shear_range)
        
        shear_x_rad = math.radians(shear_x)
        shear_y_rad = math.radians(shear_y)
        
        return image.transform(
            image.size,
            Image.AFFINE,
            (1, math.tan(shear_x_rad), 0, math.tan(shear_y_rad), 1, 0),
            resample=Image.BILINEAR
        )
    
    async def _apply_flip(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply flip transformation"""
        if config["flip_horizontal"] and random.random() < 0.5:
            image = image.transpose(Image.FLIP_LEFT_RIGHT)
        
        if config["flip_vertical"] and random.random() < 0.5:
            image = image.transpose(Image.FLIP_TOP_BOTTOM)
        
        return image
    
    async def _apply_perspective(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply perspective transformation"""
        width, height = image.size
        distortion = config["perspective_distortion"]
        
        # Generate perspective points
        dx = random.uniform(-distortion, distortion) * width
        dy = random.uniform(-distortion, distortion) * height
        
        # Original corners
        original_points = [(0, 0), (width, 0), (width, height), (0, height)]
        
        # Transformed corners
        transformed_points = [
            (dx, dy),
            (width - dx, dy),
            (width - dx, height - dy),
            (dx, height - dy)
        ]
        
        # Apply perspective transform
        coeffs = self._find_perspective_coefficients(original_points, transformed_points)
        return image.transform(image.size, Image.PERSPECTIVE, coeffs, resample=Image.BILINEAR)
    
    async def _apply_elastic(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply elastic deformation"""
        image_np = np.array(image)
        alpha = config["elastic_alpha"]
        sigma = config["elastic_sigma"]
        
        # Generate random displacement fields
        dx = ndimage.gaussian_filter(np.random.randn(*image_np.shape[:2]), sigma) * alpha
        dy = ndimage.gaussian_filter(np.random.randn(*image_np.shape[:2]), sigma) * alpha
        
        # Create meshgrid
        x, y = np.meshgrid(np.arange(image_np.shape[1]), np.arange(image_np.shape[0]))
        
        # Apply displacement
        x_displaced = x + dx
        y_displaced = y + dy
        
        # Clip to image bounds
        x_displaced = np.clip(x_displaced, 0, image_np.shape[1] - 1)
        y_displaced = np.clip(y_displaced, 0, image_np.shape[0] - 1)
        
        # Apply transformation
        if len(image_np.shape) == 3:
            # Color image
            transformed = np.zeros_like(image_np)
            for c in range(image_np.shape[2]):
                transformed[:, :, c] = ndimage.map_coordinates(
                    image_np[:, :, c],
                    [y_displaced, x_displaced],
                    order=1,
                    mode='reflect'
                )
        else:
            # Grayscale image
            transformed = ndimage.map_coordinates(
                image_np,
                [y_displaced, x_displaced],
                order=1,
                mode='reflect'
            )
        
        return Image.fromarray(transformed.astype(np.uint8))
    
    async def _apply_affine(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply affine transformation"""
        # Random affine parameters
        rotation = random.uniform(-config["rotation_range"], config["rotation_range"])
        scale = random.uniform(config["scale_range"][0], config["scale_range"][1])
        translation = random.uniform(-config["translation_range"], config["translation_range"])
        shear = random.uniform(-config["shear_range"], config["shear_range"])
        
        # Convert to radians
        rotation_rad = math.radians(rotation)
        shear_rad = math.radians(shear)
        
        # Build affine matrix
        cos_r = math.cos(rotation_rad)
        sin_r = math.sin(rotation_rad)
        
        # Affine transformation matrix
        a = scale * cos_r
        b = scale * -sin_r + shear_rad
        c = translation * image.size[0]
        d = scale * sin_r
        e = scale * cos_r
        f = translation * image.size[1]
        
        return image.transform(
            image.size,
            Image.AFFINE,
            (a, b, c, d, e, f),
            resample=Image.BILINEAR
        )
    
    async def _apply_distortion(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply barrel/pincushion distortion"""
        image_np = np.array(image)
        height, width = image_np.shape[:2]
        
        # Distortion parameters
        k1 = random.uniform(-0.3, 0.3)  # Barrel/pincushion strength
        k2 = random.uniform(-0.1, 0.1)  # Additional distortion
        
        # Create coordinate grids
        x, y = np.meshgrid(np.arange(width), np.arange(height))
        
        # Normalize coordinates to [-1, 1]
        x_norm = (x - width / 2) / (width / 2)
        y_norm = (y - height / 2) / (height / 2)
        
        # Calculate radial distance
        r = np.sqrt(x_norm**2 + y_norm**2)
        
        # Apply distortion
        r_distorted = r * (1 + k1 * r**2 + k2 * r**4)
        
        # Calculate new coordinates
        x_new = x_norm * r_distorted / (r + 1e-8) * (width / 2) + width / 2
        y_new = y_norm * r_distorted / (r + 1e-8) * (height / 2) + height / 2
        
        # Clip to image bounds
        x_new = np.clip(x_new, 0, width - 1)
        y_new = np.clip(y_new, 0, height - 1)
        
        # Apply transformation
        if len(image_np.shape) == 3:
            # Color image
            transformed = np.zeros_like(image_np)
            for c in range(image_np.shape[2]):
                transformed[:, :, c] = ndimage.map_coordinates(
                    image_np[:, :, c],
                    [y_new, x_new],
                    order=1,
                    mode='reflect'
                )
        else:
            # Grayscale image
            transformed = ndimage.map_coordinates(
                image_np,
                [y_new, x_new],
                order=1,
                mode='reflect'
            )
        
        return Image.fromarray(transformed.astype(np.uint8))
    
    def _find_perspective_coefficients(self, original_points, transformed_points):
        """Find perspective transformation coefficients"""
        # This is a simplified version - in practice you'd use cv2.getPerspectiveTransform
        # For now, return identity transform
        return [1, 0, 0, 0, 1, 0, 0, 0]

class PhotometricAugmentationEngine:
    """Engine for photometric augmentations"""
    
    def __init__(self):
        self.transforms = {
            PhotometricTransform.BRIGHTNESS: self._apply_brightness,
            PhotometricTransform.CONTRAST: self._apply_contrast,
            PhotometricTransform.SATURATION: self._apply_saturation,
            PhotometricTransform.HUE: self._apply_hue,
            PhotometricTransform.GAMMA: self._apply_gamma,
            PhotometricTransform.HISTOGRAM_EQUALIZATION: self._apply_histogram_equalization,
            PhotometricTransform.COLOR_JITTER: self._apply_color_jitter,
            PhotometricTransform.CHANNEL_SHUFFLE: self._apply_channel_shuffle
        }
    
    async def apply_transforms(
        self,
        image: Image.Image,
        config: Dict[str, Any],
        probability: float = 0.5
    ) -> Image.Image:
        """Apply photometric transformations"""
        
        for transform_name, transform_func in self.transforms.items():
            if random.random() < probability:
                try:
                    image = await transform_func(image, config)
                except Exception as e:
                    logger.warning(f"Failed to apply {transform_name}: {e}")
        
        return image
    
    async def _apply_brightness(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply brightness adjustment"""
        brightness_range = config["brightness_range"]
        factor = random.uniform(1 - brightness_range, 1 + brightness_range)
        enhancer = ImageEnhance.Brightness(image)
        return enhancer.enhance(factor)
    
    async def _apply_contrast(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply contrast adjustment"""
        contrast_range = config["contrast_range"]
        factor = random.uniform(1 - contrast_range, 1 + contrast_range)
        enhancer = ImageEnhance.Contrast(image)
        return enhancer.enhance(factor)
    
    async def _apply_saturation(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply saturation adjustment"""
        saturation_range = config["saturation_range"]
        factor = random.uniform(1 - saturation_range, 1 + saturation_range)
        enhancer = ImageEnhance.Color(image)
        return enhancer.enhance(factor)
    
    async def _apply_hue(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply hue adjustment"""
        hue_range = config["hue_range"]
        
        # Convert to HSV
        image_np = np.array(image)
        hsv = cv2.cvtColor(image_np, cv2.COLOR_RGB2HSV)
        
        # Adjust hue
        hue_shift = random.uniform(-hue_range, hue_range) * 180
        hsv[:, :, 0] = (hsv[:, :, 0] + hue_shift) % 180
        
        # Convert back to RGB
        rgb = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
        return Image.fromarray(rgb)
    
    async def _apply_gamma(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply gamma correction"""
        gamma_range = config["gamma_range"]
        gamma = random.uniform(gamma_range[0], gamma_range[1])
        
        # Apply gamma correction
        image_np = np.array(image, dtype=np.float32) / 255.0
        corrected = np.power(image_np, gamma)
        corrected = (corrected * 255).astype(np.uint8)
        
        return Image.fromarray(corrected)
    
    async def _apply_histogram_equalization(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply histogram equalization"""
        # Apply to luminance channel only
        if image.mode == 'RGB':
            # Convert to YUV
            yuv = image.convert('YCbCr')
            y, u, v = yuv.split()
            
            # Equalize Y channel
            y_eq = ImageOps.equalize(y)
            
            # Merge back
            yuv_eq = Image.merge('YCbCr', (y_eq, u, v))
            return yuv_eq.convert('RGB')
        else:
            return ImageOps.equalize(image)
    
    async def _apply_color_jitter(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply color jitter"""
        strength = config["color_jitter_strength"]
        
        # Apply random brightness, contrast, and saturation
        if random.random() < 0.8:
            brightness_factor = random.uniform(1 - strength * 0.2, 1 + strength * 0.2)
            image = ImageEnhance.Brightness(image).enhance(brightness_factor)
        
        if random.random() < 0.8:
            contrast_factor = random.uniform(1 - strength * 0.2, 1 + strength * 0.2)
            image = ImageEnhance.Contrast(image).enhance(contrast_factor)
        
        if random.random() < 0.8:
            saturation_factor = random.uniform(1 - strength * 0.2, 1 + strength * 0.2)
            image = ImageEnhance.Color(image).enhance(saturation_factor)
        
        return image
    
    async def _apply_channel_shuffle(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply channel shuffle"""
        if image.mode != 'RGB':
            return image
        
        probability = config["channel_shuffle_probability"]
        if random.random() < probability:
            # Split channels
            r, g, b = image.split()
            
            # Shuffle channels
            channels = [r, g, b]
            random.shuffle(channels)
            
            # Merge shuffled channels
            return Image.merge('RGB', channels)
        
        return image

class NoiseAugmentationEngine:
    """Engine for noise augmentations"""
    
    async def apply_noise(
        self,
        image: Image.Image,
        config: Dict[str, Any],
        probability: float = 0.5
    ) -> Image.Image:
        """Apply noise augmentations"""
        
        if random.random() > probability:
            return image
        
        image_np = np.array(image, dtype=np.float32) / 255.0
        
        # Apply different types of noise
        if random.random() < 0.3:
            # Gaussian noise
            std = config["gaussian_noise_std"]
            noise = np.random.normal(0, std, image_np.shape)
            image_np = np.clip(image_np + noise, 0, 1)
        
        if random.random() < 0.2:
            # Salt and pepper noise
            ratio = config["salt_pepper_ratio"]
            salt = np.random.random(image_np.shape) < ratio / 2
            pepper = np.random.random(image_np.shape) < ratio / 2
            image_np[salt] = 1.0
            image_np[pepper] = 0.0
        
        if random.random() < 0.3:
            # Speckle noise
            std = config["speckle_noise_std"]
            noise = np.random.normal(0, std, image_np.shape)
            image_np = np.clip(image_np + image_np * noise, 0, 1)
        
        if random.random() < 0.2:
            # Uniform noise
            noise_range = config["uniform_noise_range"]
            noise = np.random.uniform(-noise_range, noise_range, image_np.shape)
            image_np = np.clip(image_np + noise, 0, 1)
        
        if config["poisson_noise"] and random.random() < 0.2:
            # Poisson noise
            image_np = np.random.poisson(image_np * 255) / 255.0
            image_np = np.clip(image_np, 0, 1)
        
        return Image.fromarray((image_np * 255).astype(np.uint8))

class BlurAugmentationEngine:
    """Engine for blur augmentations"""
    
    async def apply_blur(
        self,
        image: Image.Image,
        config: Dict[str, Any],
        probability: float = 0.5
    ) -> Image.Image:
        """Apply blur augmentations"""
        
        if random.random() > probability:
            return image
        
        blur_type = random.choice(["gaussian", "motion", "defocus", "lens"])
        
        if blur_type == "gaussian":
            sigma_range = config["gaussian_blur_sigma"]
            sigma = random.uniform(sigma_range[0], sigma_range[1])
            return image.filter(ImageFilter.GaussianBlur(radius=sigma))
        
        elif blur_type == "motion":
            size = config["motion_blur_size"]
            angle = random.uniform(0, 360)
            
            # Create motion blur kernel
            kernel = np.zeros((size, size))
            kernel[size//2, :] = 1 / size
            
            # Rotate kernel
            kernel = ndimage.rotate(kernel, angle, reshape=False)
            
            # Apply convolution
            image_np = np.array(image)
            if len(image_np.shape) == 3:
                blurred = np.zeros_like(image_np)
                for c in range(image_np.shape[2]):
                    blurred[:, :, c] = ndimage.convolve(image_np[:, :, c], kernel, mode='reflect')
            else:
                blurred = ndimage.convolve(image_np, kernel, mode='reflect')
            
            return Image.fromarray(blurred.astype(np.uint8))
        
        elif blur_type == "defocus":
            radius = config["defocus_blur_radius"]
            return image.filter(ImageFilter.GaussianBlur(radius=radius))
        
        elif blur_type == "lens":
            radius = config["lens_blur_radius"]
            return image.filter(ImageFilter.GaussianBlur(radius=radius))
        
        return image

class WeatherAugmentationEngine:
    """Engine for weather augmentations"""
    
    async def apply_weather(
        self,
        image: Image.Image,
        config: Dict[str, Any],
        probability: float = 0.5
    ) -> Image.Image:
        """Apply weather augmentations"""
        
        if random.random() > probability:
            return image
        
        weather_type = random.choice(["rain", "snow", "fog", "sun_flare"])
        
        if weather_type == "rain":
            return await self._apply_rain(image, config)
        elif weather_type == "snow":
            return await self._apply_snow(image, config)
        elif weather_type == "fog":
            return await self._apply_fog(image, config)
        elif weather_type == "sun_flare":
            return await self._apply_sun_flare(image, config)
        
        return image
    
    async def _apply_rain(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply rain effect"""
        intensity = config["rain_intensity"]
        
        # Create rain overlay
        overlay = Image.new('RGBA', image.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Draw rain drops
        num_drops = int(intensity * 1000)
        for _ in range(num_drops):
            x = random.randint(0, image.size[0])
            y = random.randint(0, image.size[1])
            length = random.randint(10, 30)
            thickness = random.randint(1, 3)
            
            alpha = random.randint(50, 150)
            draw.line([(x, y), (x + 5, y + length)], fill=(200, 200, 255, alpha), width=thickness)
        
        # Blend with original image
        if image.mode != 'RGBA':
            image = image.convert('RGBA')
        
        return Image.alpha_composite(image, overlay).convert('RGB')
    
    async def _apply_snow(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply snow effect"""
        intensity = config["snow_intensity"]
        
        # Create snow overlay
        overlay = Image.new('RGBA', image.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Draw snow flakes
        num_flakes = int(intensity * 500)
        for _ in range(num_flakes):
            x = random.randint(0, image.size[0])
            y = random.randint(0, image.size[1])
            size = random.randint(2, 6)
            
            alpha = random.randint(100, 200)
            draw.ellipse([(x, y), (x + size, y + size)], fill=(255, 255, 255, alpha))
        
        # Blend with original image
        if image.mode != 'RGBA':
            image = image.convert('RGBA')
        
        return Image.alpha_composite(image, overlay).convert('RGB')
    
    async def _apply_fog(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply fog effect"""
        intensity = config["fog_intensity"]
        
        # Create fog overlay
        overlay = Image.new('RGBA', image.size, (200, 200, 200, int(intensity * 100)))
        
        # Blend with original image
        if image.mode != 'RGBA':
            image = image.convert('RGBA')
        
        return Image.alpha_composite(image, overlay).convert('RGB')
    
    async def _apply_sun_flare(self, image: Image.Image, config: Dict[str, Any]) -> Image.Image:
        """Apply sun flare effect"""
        intensity = config["sun_flare_intensity"]
        
        # Create sun flare overlay
        overlay = Image.new('RGBA', image.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Draw sun flare
        center_x = random.randint(image.size[0]//4, 3*image.size[0]//4)
        center_y = random.randint(image.size[1]//4, 3*image.size[1]//4)
        
        max_radius = min(image.size) // 3
        for radius in range(max_radius, 0, -10):
            alpha = int(intensity * 50 * (max_radius - radius) / max_radius)
            draw.ellipse(
                [(center_x - radius, center_y - radius), 
                 (center_x + radius, center_y + radius)],
                fill=(255, 255, 0, alpha)
            )
        
        # Blend with original image
        if image.mode != 'RGBA':
            image = image.convert('RGBA')
        
        return Image.alpha_composite(image, overlay).convert('RGB')

class DataAugmentationService:
    """Main data augmentation service"""
    
    def __init__(self):
        self.geometric_engine = GeometricAugmentationEngine()
        self.photometric_engine = PhotometricAugmentationEngine()
        self.noise_engine = NoiseAugmentationEngine()
        self.blur_engine = BlurAugmentationEngine()
        self.weather_engine = WeatherAugmentationEngine()
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.augmentation_history = []
    
    async def augment_images(
        self,
        images: List[Dict[str, Any]],
        config: AugmentationConfig
    ) -> List[Dict[str, Any]]:
        """Augment a list of images"""
        
        logger.info(f"Augmenting {len(images)} images with factor {config.augmentation_factor}")
        
        start_time = time.time()
        augmented_images = []
        
        for image_data in images:
            # Decode image
            image = self._decode_base64_image(image_data['data'])
            
            # Apply augmentations
            for aug_idx in range(config.augmentation_factor):
                try:
                    augmented_image = await self._augment_single_image(image, config)
                    
                    # Convert back to base64
                    augmented_base64 = self._encode_image_to_base64(augmented_image)
                    
                    # Create augmented image data
                    augmented_data = {
                        **image_data,
                        'data': augmented_base64,
                        'index': len(augmented_images),
                        'metadata': {
                            **image_data.get('metadata', {}),
                            'augmentation_index': aug_idx,
                            'original_index': image_data.get('index', 0),
                            'augmentation_config': config.__dict__,
                            'augmentation_timestamp': datetime.now().isoformat()
                        }
                    }
                    
                    augmented_images.append(augmented_data)
                    
                except Exception as e:
                    logger.error(f"Failed to augment image {image_data.get('index', 0)}: {e}")
        
        # Log augmentation
        augmentation_time = time.time() - start_time
        self.augmentation_history.append({
            "timestamp": datetime.now(),
            "original_count": len(images),
            "augmented_count": len(augmented_images),
            "augmentation_factor": config.augmentation_factor,
            "augmentation_time": augmentation_time,
            "config": config.__dict__
        })
        
        logger.info(f"Augmentation completed in {augmentation_time:.2f} seconds")
        return augmented_images
    
    async def _augment_single_image(
        self,
        image: Image.Image,
        config: AugmentationConfig
    ) -> Image.Image:
        """Augment a single image"""
        
        augmented_image = image.copy()
        
        # Apply geometric augmentations
        if AugmentationType.GEOMETRIC in config.enabled_types:
            augmented_image = await self.geometric_engine.apply_transforms(
                augmented_image, config.geometric_config, config.probability
            )
        
        # Apply photometric augmentations
        if AugmentationType.PHOTOMETRIC in config.enabled_types:
            augmented_image = await self.photometric_engine.apply_transforms(
                augmented_image, config.photometric_config, config.probability
            )
        
        # Apply noise augmentations
        if AugmentationType.NOISE in config.enabled_types:
            augmented_image = await self.noise_engine.apply_noise(
                augmented_image, config.noise_config, config.probability
            )
        
        # Apply blur augmentations
        if AugmentationType.BLUR in config.enabled_types:
            augmented_image = await self.blur_engine.apply_blur(
                augmented_image, config.blur_config, config.probability
            )
        
        # Apply weather augmentations
        if AugmentationType.WEATHER in config.enabled_types:
            augmented_image = await self.weather_engine.apply_weather(
                augmented_image, config.weather_config, config.probability
            )
        
        # Apply domain-specific augmentations
        if config.target_domain:
            augmented_image = await self._apply_domain_specific_augmentations(
                augmented_image, config.target_domain
            )
        
        return augmented_image
    
    async def _apply_domain_specific_augmentations(
        self,
        image: Image.Image,
        target_domain: str
    ) -> Image.Image:
        """Apply domain-specific augmentations"""
        
        if target_domain == "medical":
            # Medical domain augmentations
            if random.random() < 0.3:
                # Add medical-specific noise
                image = await self._add_medical_noise(image)
            
            if random.random() < 0.2:
                # Simulate medical imaging artifacts
                image = await self._add_medical_artifacts(image)
        
        elif target_domain == "automotive":
            # Automotive domain augmentations
            if random.random() < 0.4:
                # Add motion blur for vehicle movement
                image = image.filter(ImageFilter.GaussianBlur(radius=0.5))
            
            if random.random() < 0.3:
                # Add lens flare for headlights
                image = await self._add_lens_flare(image)
        
        elif target_domain == "retail":
            # Retail domain augmentations
            if random.random() < 0.3:
                # Enhance colors for product appeal
                enhancer = ImageEnhance.Color(image)
                image = enhancer.enhance(1.1)
            
            if random.random() < 0.2:
                # Add slight sharpening
                enhancer = ImageEnhance.Sharpness(image)
                image = enhancer.enhance(1.05)
        
        return image
    
    async def _add_medical_noise(self, image: Image.Image) -> Image.Image:
        """Add medical imaging noise"""
        image_np = np.array(image, dtype=np.float32) / 255.0
        
        # Add Rician noise (common in MRI)
        noise_std = 0.02
        noise_real = np.random.normal(0, noise_std, image_np.shape)
        noise_imag = np.random.normal(0, noise_std, image_np.shape)
        
        # Magnitude of complex noise
        noise_magnitude = np.sqrt(noise_real**2 + noise_imag**2)
        
        # Add to image
        noisy_image = np.sqrt((image_np + noise_real)**2 + noise_imag**2)
        noisy_image = np.clip(noisy_image, 0, 1)
        
        return Image.fromarray((noisy_image * 255).astype(np.uint8))
    
    async def _add_medical_artifacts(self, image: Image.Image) -> Image.Image:
        """Add medical imaging artifacts"""
        # Add banding artifacts
        if random.random() < 0.5:
            image_np = np.array(image)
            
            # Add horizontal banding
            for i in range(0, image_np.shape[0], 20):
                if random.random() < 0.3:
                    image_np[i:i+2, :] = image_np[i:i+2, :] * 0.9
            
            image = Image.fromarray(image_np)
        
        return image
    
    async def _add_lens_flare(self, image: Image.Image) -> Image.Image:
        """Add lens flare effect"""
        overlay = Image.new('RGBA', image.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Random flare position
        x = random.randint(0, image.size[0])
        y = random.randint(0, image.size[1])
        
        # Draw flare
        for radius in range(50, 0, -5):
            alpha = int(30 * (50 - radius) / 50)
            draw.ellipse(
                [(x - radius, y - radius), (x + radius, y + radius)],
                fill=(255, 255, 200, alpha)
            )
        
        # Blend with original
        if image.mode != 'RGBA':
            image = image.convert('RGBA')
        
        return Image.alpha_composite(image, overlay).convert('RGB')
    
    def _decode_base64_image(self, base64_string: str) -> Image.Image:
        """Decode base64 string to PIL Image"""
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        return image
    
    def _encode_image_to_base64(self, image: Image.Image) -> str:
        """Encode PIL Image to base64 string"""
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode()
    
    def get_augmentation_history(self) -> List[Dict[str, Any]]:
        """Get augmentation history"""
        return self.augmentation_history
    
    def get_supported_augmentation_types(self) -> List[AugmentationType]:
        """Get supported augmentation types"""
        return list(AugmentationType)
    
    def get_default_config(self, target_domain: Optional[str] = None) -> AugmentationConfig:
        """Get default configuration for a target domain"""
        config = AugmentationConfig()
        
        if target_domain == "medical":
            # Medical domain specific config
            config.enabled_types = [AugmentationType.GEOMETRIC, AugmentationType.NOISE]
            config.geometric_config["rotation_range"] = 5.0  # Limited rotation for medical
            config.noise_config["gaussian_noise_std"] = 0.005  # Lower noise
        
        elif target_domain == "automotive":
            # Automotive domain specific config
            config.enabled_types = [AugmentationType.GEOMETRIC, AugmentationType.PHOTOMETRIC, AugmentationType.WEATHER]
            config.geometric_config["rotation_range"] = 2.0  # Limited rotation
            config.weather_config["rain_intensity"] = 0.4  # Higher rain intensity
        
        elif target_domain == "retail":
            # Retail domain specific config
            config.enabled_types = [AugmentationType.GEOMETRIC, AugmentationType.PHOTOMETRIC]
            config.photometric_config["brightness_range"] = 0.3  # Higher brightness variation
            config.photometric_config["saturation_range"] = 0.3  # Higher saturation variation
        
        return config 