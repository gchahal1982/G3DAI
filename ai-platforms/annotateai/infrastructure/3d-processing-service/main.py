#!/usr/bin/env python3
"""
AnnotateAI 3D Processing Service
Advanced 3D reconstruction, point cloud processing, and mesh operations
"""

import asyncio
import logging
import os
import time
import json
import subprocess
import tempfile
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime
from contextlib import asynccontextmanager
from dataclasses import dataclass
from enum import Enum
import uuid
import math

import numpy as np
import open3d as o3d
import cv2
from PIL import Image
import matplotlib.pyplot as plt
import trimesh
import pymeshlab
from scipy.spatial import ConvexHull, distance_matrix
from scipy.spatial.transform import Rotation as R
from sklearn.cluster import DBSCAN, KMeans
from sklearn.decomposition import PCA
from sklearn.neighbors import NearestNeighbors

# FastAPI and web framework
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Point cloud processing
import pandas as pd
import laspy
from plyfile import PlyData, PlyElement

# Machine Learning for 3D
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.data import Data, Batch
from torch_geometric.nn import PointConv, global_max_pool, global_mean_pool
import pytorch3d
from pytorch3d.structures import Meshes, Pointclouds
from pytorch3d.renderer import (
    FoVPerspectiveCameras, RasterizationSettings, MeshRenderer,
    MeshRasterizer, SoftPhongShader, TexturesVertex
)

# Photogrammetry and SfM
import pycolmap
from hloc import extract_features, match_features, reconstruction, triangulation

# Redis for caching
import redis

# Monitoring
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import psutil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment configuration
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
COLMAP_PATH = os.getenv("COLMAP_PATH", "/usr/local/bin/colmap")
PROCESSING_TEMP_DIR = os.getenv("PROCESSING_TEMP_DIR", "/tmp/3d_processing")
MODEL_CACHE_DIR = os.getenv("MODEL_CACHE_DIR", "/app/3d_models")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "/app/3d_outputs")

# Prometheus metrics
PROCESSING_JOBS_TOTAL = Counter('processing_3d_jobs_total', 'Total 3D processing jobs', ['job_type'])
PROCESSING_DURATION = Histogram('processing_3d_duration_seconds', 'Processing duration', ['job_type'])
ACTIVE_PROCESSING_JOBS = Gauge('active_processing_3d_jobs', 'Active 3D processing jobs')
POINT_CLOUD_SIZE = Gauge('point_cloud_size', 'Point cloud size', ['job_id'])
MESH_VERTICES = Gauge('mesh_vertices_count', 'Mesh vertices count', ['job_id'])

class ProcessingJobType(str, Enum):
    """Types of 3D processing jobs"""
    SFM_RECONSTRUCTION = "sfm_reconstruction"
    MVS_RECONSTRUCTION = "mvs_reconstruction"
    POINT_CLOUD_PROCESSING = "point_cloud_processing"
    MESH_PROCESSING = "mesh_processing"
    LIDAR_PROCESSING = "lidar_processing"
    OBJECT_DETECTION_3D = "object_detection_3d"
    SEMANTIC_SEGMENTATION_3D = "semantic_segmentation_3d"
    SCENE_RECONSTRUCTION = "scene_reconstruction"
    TEXTURE_MAPPING = "texture_mapping"
    MESH_SIMPLIFICATION = "mesh_simplification"

class PointCloudFormat(str, Enum):
    """Supported point cloud formats"""
    PLY = "ply"
    PCD = "pcd"
    LAS = "las"
    LAZ = "laz"
    XYZ = "xyz"
    NPZ = "npz"

class MeshFormat(str, Enum):
    """Supported mesh formats"""
    PLY = "ply"
    OBJ = "obj"
    STL = "stl"
    GLTF = "gltf"
    GLB = "glb"
    X3D = "x3d"

# Pydantic models
class SfMConfig(BaseModel):
    """Structure-from-Motion configuration"""
    feature_type: str = Field(default="sift", description="Feature detector type")
    matcher_type: str = Field(default="exhaustive", description="Feature matcher type")
    max_image_size: int = Field(default=1600, ge=512, le=4096, description="Maximum image size")
    max_num_features: int = Field(default=8192, ge=1000, le=32768, description="Maximum features per image")
    min_focal_length_ratio: float = Field(default=0.1, ge=0.01, le=1.0, description="Minimum focal length ratio")
    max_focal_length_ratio: float = Field(default=10.0, ge=1.0, le=100.0, description="Maximum focal length ratio")
    max_extra_param: float = Field(default=1.0, ge=0.0, le=10.0, description="Maximum extra parameters")
    camera_model: str = Field(default="PINHOLE", description="Camera model")
    multiple_models: bool = Field(default=False, description="Allow multiple models")
    min_model_size: int = Field(default=10, ge=3, le=100, description="Minimum model size")
    max_reproj_error: float = Field(default=4.0, ge=1.0, le=16.0, description="Maximum reprojection error")

class MvsConfig(BaseModel):
    """Multi-View Stereo configuration"""
    max_image_size: int = Field(default=3200, ge=1024, le=8192, description="Maximum image size")
    patch_match_iterations: int = Field(default=5, ge=1, le=20, description="PatchMatch iterations")
    geom_consistency_regularizer: float = Field(default=0.3, ge=0.0, le=1.0, description="Geometric consistency regularizer")
    geom_consistency_max_cost: float = Field(default=3.0, ge=0.1, le=10.0, description="Max geometric consistency cost")
    photometric_consistency_regularizer: float = Field(default=1.0, ge=0.0, le=10.0, description="Photometric consistency regularizer")
    filter_method: str = Field(default="photometric", description="Filtering method")
    filter_min_ncc: float = Field(default=0.1, ge=0.0, le=1.0, description="Minimum NCC for filtering")
    filter_min_triangulation_angle: float = Field(default=1.0, ge=0.1, le=10.0, description="Minimum triangulation angle")
    filter_min_num_consistent: int = Field(default=5, ge=2, le=20, description="Minimum consistent views")
    filter_geom_consistency_max_cost: float = Field(default=1.0, ge=0.1, le=10.0, description="Max geometric consistency cost for filtering")

class PointCloudProcessingConfig(BaseModel):
    """Point cloud processing configuration"""
    voxel_size: float = Field(default=0.01, ge=0.001, le=1.0, description="Voxel size for downsampling")
    outlier_removal_method: str = Field(default="statistical", description="Outlier removal method")
    outlier_nb_neighbors: int = Field(default=20, ge=5, le=100, description="Number of neighbors for outlier removal")
    outlier_std_ratio: float = Field(default=2.0, ge=0.5, le=5.0, description="Standard deviation ratio for outlier removal")
    normal_estimation_radius: float = Field(default=0.1, ge=0.01, le=1.0, description="Radius for normal estimation")
    normal_estimation_max_nn: int = Field(default=30, ge=10, le=100, description="Max neighbors for normal estimation")
    clustering_method: str = Field(default="dbscan", description="Clustering method")
    clustering_eps: float = Field(default=0.02, ge=0.001, le=1.0, description="DBSCAN epsilon")
    clustering_min_points: int = Field(default=10, ge=3, le=100, description="DBSCAN minimum points")
    plane_detection_threshold: float = Field(default=0.01, ge=0.001, le=0.1, description="Plane detection threshold")
    plane_detection_ransac_n: int = Field(default=3, ge=3, le=10, description="RANSAC points for plane detection")
    plane_detection_num_iterations: int = Field(default=1000, ge=100, le=10000, description="RANSAC iterations")

class MeshProcessingConfig(BaseModel):
    """Mesh processing configuration"""
    simplification_method: str = Field(default="quadric", description="Mesh simplification method")
    target_face_count: int = Field(default=10000, ge=100, le=1000000, description="Target face count for simplification")
    smoothing_iterations: int = Field(default=5, ge=0, le=50, description="Smoothing iterations")
    smoothing_lambda: float = Field(default=0.5, ge=0.0, le=1.0, description="Smoothing lambda parameter")
    repair_holes: bool = Field(default=True, description="Repair holes in mesh")
    remove_duplicates: bool = Field(default=True, description="Remove duplicate vertices")
    remove_degenerate: bool = Field(default=True, description="Remove degenerate faces")
    texture_resolution: int = Field(default=1024, ge=256, le=4096, description="Texture resolution")
    unwrap_method: str = Field(default="angle_based", description="UV unwrapping method")

class ProcessingJobRequest(BaseModel):
    """3D processing job request"""
    job_type: ProcessingJobType = Field(..., description="Type of processing job")
    name: str = Field(..., description="Job name")
    input_data: Dict[str, Any] = Field(..., description="Input data configuration")
    config: Optional[Dict[str, Any]] = Field(default={}, description="Processing configuration")
    output_format: str = Field(default="ply", description="Output format")
    async_processing: bool = Field(default=True, description="Asynchronous processing")

class ProcessingJobResponse(BaseModel):
    """3D processing job response"""
    job_id: str = Field(..., description="Job ID")
    status: str = Field(..., description="Job status")
    name: str = Field(..., description="Job name")
    job_type: ProcessingJobType = Field(..., description="Job type")
    created_at: datetime = Field(..., description="Creation time")
    start_time: Optional[datetime] = Field(default=None, description="Start time")
    end_time: Optional[datetime] = Field(default=None, description="End time")
    progress: float = Field(default=0.0, description="Progress percentage")
    result_data: Optional[Dict[str, Any]] = Field(default=None, description="Processing results")
    output_files: Optional[List[str]] = Field(default=None, description="Output file paths")
    error_message: Optional[str] = Field(default=None, description="Error message")

class PointNet3D(nn.Module):
    """PointNet for 3D point cloud processing"""
    
    def __init__(self, num_classes=10, num_points=1024):
        super(PointNet3D, self).__init__()
        self.num_points = num_points
        
        # Feature extraction layers
        self.conv1 = nn.Conv1d(3, 64, 1)
        self.conv2 = nn.Conv1d(64, 128, 1)
        self.conv3 = nn.Conv1d(128, 1024, 1)
        
        # Classification layers
        self.fc1 = nn.Linear(1024, 512)
        self.fc2 = nn.Linear(512, 256)
        self.fc3 = nn.Linear(256, num_classes)
        
        # Normalization layers
        self.bn1 = nn.BatchNorm1d(64)
        self.bn2 = nn.BatchNorm1d(128)
        self.bn3 = nn.BatchNorm1d(1024)
        self.bn4 = nn.BatchNorm1d(512)
        self.bn5 = nn.BatchNorm1d(256)
        
        # Dropout
        self.dropout = nn.Dropout(0.3)
    
    def forward(self, x):
        batch_size = x.size(0)
        
        # Feature extraction
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.relu(self.bn2(self.conv2(x)))
        x = self.bn3(self.conv3(x))
        
        # Global feature
        x = torch.max(x, 2, keepdim=True)[0]
        x = x.view(batch_size, -1)
        
        # Classification
        x = F.relu(self.bn4(self.fc1(x)))
        x = self.dropout(x)
        x = F.relu(self.bn5(self.fc2(x)))
        x = self.dropout(x)
        x = self.fc3(x)
        
        return F.log_softmax(x, dim=1)

class ThreeDProcessingService:
    """Main 3D processing service"""
    
    def __init__(self):
        self.redis_client = redis.from_url(REDIS_URL)
        self.active_jobs = {}
        self.models = {}
        
        # Create directories
        Path(PROCESSING_TEMP_DIR).mkdir(parents=True, exist_ok=True)
        Path(MODEL_CACHE_DIR).mkdir(parents=True, exist_ok=True)
        Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
        
        # Initialize models
        asyncio.create_task(self._initialize_models())
    
    async def _initialize_models(self):
        """Initialize 3D processing models"""
        logger.info("Initializing 3D processing models...")
        
        try:
            # Load PointNet for 3D object classification
            self.models['pointnet'] = PointNet3D(num_classes=40).to(DEVICE)
            self.models['pointnet'].eval()
            
            # Load PyTorch3D renderer
            self.models['renderer'] = self._create_pytorch3d_renderer()
            
            logger.info("3D processing models initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize 3D models: {e}")
    
    def _create_pytorch3d_renderer(self):
        """Create PyTorch3D renderer"""
        cameras = FoVPerspectiveCameras(device=DEVICE)
        
        raster_settings = RasterizationSettings(
            image_size=512,
            blur_radius=0.0,
            faces_per_pixel=1,
        )
        
        renderer = MeshRenderer(
            rasterizer=MeshRasterizer(
                cameras=cameras,
                raster_settings=raster_settings
            ),
            shader=SoftPhongShader(
                device=DEVICE,
                cameras=cameras
            )
        )
        
        return renderer
    
    async def create_processing_job(
        self,
        request: ProcessingJobRequest,
        background_tasks: BackgroundTasks
    ) -> ProcessingJobResponse:
        """Create a new 3D processing job"""
        
        job_id = str(uuid.uuid4())
        
        # Initialize job
        job_data = {
            'id': job_id,
            'name': request.name,
            'job_type': request.job_type,
            'status': 'pending',
            'created_at': datetime.utcnow(),
            'progress': 0.0,
            'input_data': request.input_data,
            'config': request.config,
            'output_format': request.output_format
        }
        
        self.active_jobs[job_id] = job_data
        
        # Queue job for execution
        if request.async_processing:
            background_tasks.add_task(self._execute_processing_job, job_id)
        else:
            await self._execute_processing_job(job_id)
        
        return ProcessingJobResponse(
            job_id=job_id,
            status="pending",
            name=request.name,
            job_type=request.job_type,
            created_at=datetime.utcnow(),
            progress=0.0
        )
    
    async def _execute_processing_job(self, job_id: str):
        """Execute a 3D processing job"""
        
        logger.info(f"Starting 3D processing job {job_id}")
        
        try:
            ACTIVE_PROCESSING_JOBS.inc()
            job_data = self.active_jobs[job_id]
            job_type = ProcessingJobType(job_data['job_type'])
            
            PROCESSING_JOBS_TOTAL.labels(job_type=job_type).inc()
            
            # Update job status
            job_data['status'] = 'running'
            job_data['start_time'] = datetime.utcnow()
            
            start_time = time.time()
            
            # Execute based on job type
            if job_type == ProcessingJobType.SFM_RECONSTRUCTION:
                result = await self._execute_sfm_reconstruction(job_data)
            elif job_type == ProcessingJobType.MVS_RECONSTRUCTION:
                result = await self._execute_mvs_reconstruction(job_data)
            elif job_type == ProcessingJobType.POINT_CLOUD_PROCESSING:
                result = await self._execute_point_cloud_processing(job_data)
            elif job_type == ProcessingJobType.MESH_PROCESSING:
                result = await self._execute_mesh_processing(job_data)
            elif job_type == ProcessingJobType.LIDAR_PROCESSING:
                result = await self._execute_lidar_processing(job_data)
            elif job_type == ProcessingJobType.OBJECT_DETECTION_3D:
                result = await self._execute_3d_object_detection(job_data)
            elif job_type == ProcessingJobType.SEMANTIC_SEGMENTATION_3D:
                result = await self._execute_3d_semantic_segmentation(job_data)
            else:
                raise ValueError(f"Unsupported job type: {job_type}")
            
            # Update job with results
            processing_time = time.time() - start_time
            PROCESSING_DURATION.labels(job_type=job_type).observe(processing_time)
            
            job_data.update({
                'status': 'completed',
                'end_time': datetime.utcnow(),
                'progress': 100.0,
                'result_data': result,
                'processing_time': processing_time
            })
            
            logger.info(f"3D processing job {job_id} completed in {processing_time:.2f} seconds")
            
        except Exception as e:
            logger.error(f"3D processing job {job_id} failed: {e}")
            
            job_data.update({
                'status': 'failed',
                'end_time': datetime.utcnow(),
                'error_message': str(e)
            })
            
        finally:
            ACTIVE_PROCESSING_JOBS.dec()
    
    async def _execute_sfm_reconstruction(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute Structure-from-Motion reconstruction"""
        
        logger.info("Starting SfM reconstruction")
        
        # Parse configuration
        config = SfMConfig(**job_data.get('config', {}))
        input_images = job_data['input_data'].get('images', [])
        
        if not input_images:
            raise ValueError("No input images provided for SfM reconstruction")
        
        # Create temporary workspace
        workspace_dir = Path(PROCESSING_TEMP_DIR) / job_data['id']
        workspace_dir.mkdir(parents=True, exist_ok=True)
        
        images_dir = workspace_dir / "images"
        images_dir.mkdir(exist_ok=True)
        
        # Copy/download input images
        image_paths = []
        for i, image_data in enumerate(input_images):
            if isinstance(image_data, str):
                # Image path
                image_path = Path(image_data)
                if image_path.exists():
                    dest_path = images_dir / f"image_{i:04d}{image_path.suffix}"
                    shutil.copy2(image_path, dest_path)
                    image_paths.append(dest_path)
            else:
                # Base64 image data
                from io import BytesIO
                import base64
                
                image_bytes = base64.b64decode(image_data['data'])
                image = Image.open(BytesIO(image_bytes))
                dest_path = images_dir / f"image_{i:04d}.jpg"
                image.save(dest_path)
                image_paths.append(dest_path)
        
        job_data['progress'] = 20.0
        
        # Run COLMAP SfM
        database_path = workspace_dir / "database.db"
        sparse_dir = workspace_dir / "sparse"
        sparse_dir.mkdir(exist_ok=True)
        
        # Feature extraction
        logger.info("Extracting features...")
        feature_extractor_cmd = [
            COLMAP_PATH, "feature_extractor",
            "--database_path", str(database_path),
            "--image_path", str(images_dir),
            "--ImageReader.camera_model", config.camera_model,
            "--SiftExtraction.max_image_size", str(config.max_image_size),
            "--SiftExtraction.max_num_features", str(config.max_num_features)
        ]
        
        result = subprocess.run(feature_extractor_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"Feature extraction failed: {result.stderr}")
        
        job_data['progress'] = 40.0
        
        # Feature matching
        logger.info("Matching features...")
        matcher_cmd = [
            COLMAP_PATH, "exhaustive_matcher",
            "--database_path", str(database_path),
            "--SiftMatching.guided_matching", "true"
        ]
        
        result = subprocess.run(matcher_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"Feature matching failed: {result.stderr}")
        
        job_data['progress'] = 60.0
        
        # Bundle adjustment / mapper
        logger.info("Running bundle adjustment...")
        mapper_cmd = [
            COLMAP_PATH, "mapper",
            "--database_path", str(database_path),
            "--image_path", str(images_dir),
            "--output_path", str(sparse_dir),
            "--Mapper.min_model_size", str(config.min_model_size),
            "--Mapper.max_reproj_error", str(config.max_reproj_error)
        ]
        
        result = subprocess.run(mapper_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"Bundle adjustment failed: {result.stderr}")
        
        job_data['progress'] = 80.0
        
        # Export results
        logger.info("Exporting SfM results...")
        model_dirs = list(sparse_dir.iterdir())
        if not model_dirs:
            raise RuntimeError("No 3D models generated")
        
        best_model_dir = max(model_dirs, key=lambda d: len(list(d.glob("*.bin"))))
        
        # Export to PLY
        output_path = Path(OUTPUT_DIR) / f"{job_data['id']}_sfm_points.ply"
        export_cmd = [
            COLMAP_PATH, "model_converter",
            "--input_path", str(best_model_dir),
            "--output_path", str(output_path),
            "--output_type", "PLY"
        ]
        
        result = subprocess.run(export_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            logger.warning(f"PLY export failed: {result.stderr}")
        
        # Load and analyze results
        cameras_file = best_model_dir / "cameras.bin"
        images_file = best_model_dir / "images.bin"
        points_file = best_model_dir / "points3D.bin"
        
        reconstruction_stats = {
            'num_cameras': 0,
            'num_images': 0,
            'num_points': 0,
            'mean_reprojection_error': 0.0,
            'coverage': 0.0
        }
        
        if cameras_file.exists() and images_file.exists() and points_file.exists():
            # Read COLMAP binary files
            try:
                reconstruction = pycolmap.Reconstruction(str(best_model_dir))
                
                reconstruction_stats.update({
                    'num_cameras': len(reconstruction.cameras),
                    'num_images': len(reconstruction.images),
                    'num_points': len(reconstruction.points3D),
                    'mean_reprojection_error': reconstruction.compute_mean_reprojection_error(),
                    'coverage': len(reconstruction.reg_image_ids()) / len(image_paths) if image_paths else 0
                })
                
                POINT_CLOUD_SIZE.labels(job_id=job_data['id']).set(reconstruction_stats['num_points'])
                
            except Exception as e:
                logger.warning(f"Failed to read reconstruction stats: {e}")
        
        job_data['progress'] = 100.0
        
        return {
            'reconstruction_stats': reconstruction_stats,
            'output_files': [str(output_path)] if output_path.exists() else [],
            'workspace_dir': str(workspace_dir),
            'sparse_model_dir': str(best_model_dir)
        }
    
    async def _execute_mvs_reconstruction(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute Multi-View Stereo reconstruction"""
        
        logger.info("Starting MVS reconstruction")
        
        # Parse configuration
        config = MvsConfig(**job_data.get('config', {}))
        sparse_model_dir = job_data['input_data'].get('sparse_model_dir')
        images_dir = job_data['input_data'].get('images_dir')
        
        if not sparse_model_dir or not images_dir:
            raise ValueError("Sparse model directory and images directory required for MVS")
        
        # Create workspace
        workspace_dir = Path(PROCESSING_TEMP_DIR) / job_data['id']
        workspace_dir.mkdir(parents=True, exist_ok=True)
        
        dense_dir = workspace_dir / "dense"
        dense_dir.mkdir(exist_ok=True)
        
        # Undistort images
        logger.info("Undistorting images...")
        undistort_cmd = [
            COLMAP_PATH, "image_undistorter",
            "--image_path", str(images_dir),
            "--input_path", str(sparse_model_dir),
            "--output_path", str(dense_dir),
            "--max_image_size", str(config.max_image_size)
        ]
        
        result = subprocess.run(undistort_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"Image undistortion failed: {result.stderr}")
        
        job_data['progress'] = 25.0
        
        # Dense stereo matching
        logger.info("Computing stereo depth maps...")
        stereo_cmd = [
            COLMAP_PATH, "patch_match_stereo",
            "--workspace_path", str(dense_dir),
            "--PatchMatchStereo.max_image_size", str(config.max_image_size),
            "--PatchMatchStereo.patch_match_iterations", str(config.patch_match_iterations),
            "--PatchMatchStereo.geom_consistency_regularizer", str(config.geom_consistency_regularizer),
            "--PatchMatchStereo.geom_consistency_max_cost", str(config.geom_consistency_max_cost)
        ]
        
        result = subprocess.run(stereo_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"Stereo matching failed: {result.stderr}")
        
        job_data['progress'] = 60.0
        
        # Stereo fusion
        logger.info("Fusing stereo depth maps...")
        fusion_cmd = [
            COLMAP_PATH, "stereo_fusion",
            "--workspace_path", str(dense_dir),
            "--StereoFusion.min_num_pixels", "5",
            "--StereoFusion.max_num_pixels", "10000",
            "--StereoFusion.max_traversal_depth", "100",
            "--StereoFusion.max_reproj_error", "2.0",
            "--StereoFusion.max_depth_error", "0.01",
            "--StereoFusion.max_normal_error", "10"
        ]
        
        result = subprocess.run(fusion_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"Stereo fusion failed: {result.stderr}")
        
        job_data['progress'] = 80.0
        
        # Meshing (optional)
        logger.info("Generating mesh...")
        mesh_cmd = [
            COLMAP_PATH, "poisson_mesher",
            "--input_path", str(dense_dir / "fused.ply"),
            "--output_path", str(dense_dir / "meshed-poisson.ply"),
            "--PoissonMeshing.point_weight", "1.0",
            "--PoissonMeshing.depth", "13",
            "--PoissonMeshing.color", "32",
            "--PoissonMeshing.trim", "7"
        ]
        
        result = subprocess.run(mesh_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            logger.warning(f"Poisson meshing failed: {result.stderr}")
        
        # Copy results to output directory
        output_files = []
        
        fused_ply = dense_dir / "fused.ply"
        meshed_ply = dense_dir / "meshed-poisson.ply"
        
        if fused_ply.exists():
            dest_path = Path(OUTPUT_DIR) / f"{job_data['id']}_dense_points.ply"
            shutil.copy2(fused_ply, dest_path)
            output_files.append(str(dest_path))
        
        if meshed_ply.exists():
            dest_path = Path(OUTPUT_DIR) / f"{job_data['id']}_mesh.ply"
            shutil.copy2(meshed_ply, dest_path)
            output_files.append(str(dest_path))
        
        # Analyze results
        mvs_stats = {
            'dense_point_count': 0,
            'mesh_vertices': 0,
            'mesh_faces': 0,
            'processing_time': 0
        }
        
        if fused_ply.exists():
            try:
                pcd = o3d.io.read_point_cloud(str(fused_ply))
                mvs_stats['dense_point_count'] = len(pcd.points)
                POINT_CLOUD_SIZE.labels(job_id=job_data['id']).set(mvs_stats['dense_point_count'])
            except Exception as e:
                logger.warning(f"Failed to read dense point cloud: {e}")
        
        if meshed_ply.exists():
            try:
                mesh = o3d.io.read_triangle_mesh(str(meshed_ply))
                mvs_stats['mesh_vertices'] = len(mesh.vertices)
                mvs_stats['mesh_faces'] = len(mesh.triangles)
                MESH_VERTICES.labels(job_id=job_data['id']).set(mvs_stats['mesh_vertices'])
            except Exception as e:
                logger.warning(f"Failed to read mesh: {e}")
        
        job_data['progress'] = 100.0
        
        return {
            'mvs_stats': mvs_stats,
            'output_files': output_files,
            'workspace_dir': str(workspace_dir),
            'dense_dir': str(dense_dir)
        }
    
    async def _execute_point_cloud_processing(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute point cloud processing"""
        
        logger.info("Starting point cloud processing")
        
        # Parse configuration
        config = PointCloudProcessingConfig(**job_data.get('config', {}))
        input_file = job_data['input_data'].get('point_cloud_file')
        
        if not input_file:
            raise ValueError("Point cloud file required for processing")
        
        # Load point cloud
        pcd = o3d.io.read_point_cloud(input_file)
        if len(pcd.points) == 0:
            raise ValueError("Empty point cloud loaded")
        
        job_data['progress'] = 10.0
        
        original_size = len(pcd.points)
        logger.info(f"Loaded point cloud with {original_size} points")
        
        processing_results = {
            'original_point_count': original_size,
            'operations_applied': []
        }
        
        # Voxel downsampling
        if config.voxel_size > 0:
            logger.info(f"Downsampling with voxel size {config.voxel_size}")
            pcd = pcd.voxel_down_sample(config.voxel_size)
            processing_results['operations_applied'].append('voxel_downsampling')
            processing_results['downsampled_point_count'] = len(pcd.points)
        
        job_data['progress'] = 25.0
        
        # Outlier removal
        if config.outlier_removal_method == "statistical":
            logger.info("Removing statistical outliers")
            pcd, outlier_indices = pcd.remove_statistical_outlier(
                nb_neighbors=config.outlier_nb_neighbors,
                std_ratio=config.outlier_std_ratio
            )
            processing_results['operations_applied'].append('statistical_outlier_removal')
            processing_results['outliers_removed'] = len(outlier_indices)
        elif config.outlier_removal_method == "radius":
            logger.info("Removing radius outliers")
            pcd, outlier_indices = pcd.remove_radius_outlier(
                nb_points=config.outlier_nb_neighbors,
                radius=config.outlier_std_ratio
            )
            processing_results['operations_applied'].append('radius_outlier_removal')
            processing_results['outliers_removed'] = len(outlier_indices)
        
        job_data['progress'] = 40.0
        
        # Normal estimation
        logger.info("Estimating normals")
        pcd.estimate_normals(
            search_param=o3d.geometry.KDTreeSearchParamHybrid(
                radius=config.normal_estimation_radius,
                max_nn=config.normal_estimation_max_nn
            )
        )
        processing_results['operations_applied'].append('normal_estimation')
        
        job_data['progress'] = 55.0
        
        # Clustering
        if config.clustering_method == "dbscan":
            logger.info("Applying DBSCAN clustering")
            labels = np.array(pcd.cluster_dbscan(
                eps=config.clustering_eps,
                min_points=config.clustering_min_points,
                print_progress=False
            ))
            
            max_label = labels.max()
            processing_results['operations_applied'].append('dbscan_clustering')
            processing_results['num_clusters'] = int(max_label + 1)
            processing_results['noise_points'] = int(np.sum(labels == -1))
            
            # Color clusters
            colors = plt.get_cmap("tab20")(labels / (max_label if max_label > 0 else 1))
            colors[labels < 0] = 0  # Black for noise
            pcd.colors = o3d.utility.Vector3dVector(colors[:, :3])
        
        job_data['progress'] = 70.0
        
        # Plane detection using RANSAC
        logger.info("Detecting planes")
        planes = []
        temp_pcd = pcd
        
        for i in range(3):  # Detect up to 3 planes
            if len(temp_pcd.points) < config.plane_detection_ransac_n * 10:
                break
            
            plane_model, inliers = temp_pcd.segment_plane(
                distance_threshold=config.plane_detection_threshold,
                ransac_n=config.plane_detection_ransac_n,
                num_iterations=config.plane_detection_num_iterations
            )
            
            if len(inliers) > len(temp_pcd.points) * 0.1:  # At least 10% of points
                planes.append({
                    'equation': plane_model,
                    'inlier_count': len(inliers),
                    'inlier_ratio': len(inliers) / len(temp_pcd.points)
                })
                
                # Remove inliers for next iteration
                temp_pcd = temp_pcd.select_by_index(inliers, invert=True)
        
        processing_results['planes_detected'] = len(planes)
        processing_results['plane_details'] = planes
        processing_results['operations_applied'].append('plane_detection')
        
        job_data['progress'] = 85.0
        
        # Save processed point cloud
        output_path = Path(OUTPUT_DIR) / f"{job_data['id']}_processed.ply"
        o3d.io.write_point_cloud(str(output_path), pcd)
        
        processing_results['final_point_count'] = len(pcd.points)
        processing_results['output_file'] = str(output_path)
        
        # Generate visualization
        vis_path = Path(OUTPUT_DIR) / f"{job_data['id']}_visualization.png"
        self._create_point_cloud_visualization(pcd, vis_path)
        processing_results['visualization_file'] = str(vis_path)
        
        job_data['progress'] = 100.0
        
        POINT_CLOUD_SIZE.labels(job_id=job_data['id']).set(processing_results['final_point_count'])
        
        return processing_results
    
    async def _execute_mesh_processing(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute mesh processing"""
        
        logger.info("Starting mesh processing")
        
        # Parse configuration
        config = MeshProcessingConfig(**job_data.get('config', {}))
        input_file = job_data['input_data'].get('mesh_file')
        
        if not input_file:
            raise ValueError("Mesh file required for processing")
        
        # Load mesh using PyMeshLab
        ms = pymeshlab.MeshSet()
        ms.load_new_mesh(input_file)
        
        if ms.number_meshes() == 0:
            raise ValueError("No mesh loaded")
        
        job_data['progress'] = 10.0
        
        mesh_stats = ms.get_geometric_measures()
        original_vertices = mesh_stats['vertex_num']
        original_faces = mesh_stats['face_num']
        
        processing_results = {
            'original_vertex_count': original_vertices,
            'original_face_count': original_faces,
            'operations_applied': []
        }
        
        logger.info(f"Loaded mesh with {original_vertices} vertices and {original_faces} faces")
        
        # Remove duplicate vertices
        if config.remove_duplicates:
            logger.info("Removing duplicate vertices")
            ms.apply_filter('meshing_remove_duplicate_vertices')
            processing_results['operations_applied'].append('remove_duplicates')
        
        job_data['progress'] = 20.0
        
        # Remove degenerate faces
        if config.remove_degenerate:
            logger.info("Removing degenerate faces")
            ms.apply_filter('meshing_remove_null_faces')
            ms.apply_filter('meshing_remove_duplicate_faces')
            processing_results['operations_applied'].append('remove_degenerate')
        
        job_data['progress'] = 30.0
        
        # Repair holes
        if config.repair_holes:
            logger.info("Repairing holes")
            try:
                ms.apply_filter('meshing_close_holes', maxholesize=30)
                processing_results['operations_applied'].append('hole_repair')
            except Exception as e:
                logger.warning(f"Hole repair failed: {e}")
        
        job_data['progress'] = 45.0
        
        # Mesh smoothing
        if config.smoothing_iterations > 0:
            logger.info(f"Smoothing mesh ({config.smoothing_iterations} iterations)")
            ms.apply_filter(
                'apply_coord_laplacian_smoothing',
                stepsmoothnum=config.smoothing_iterations,
                lambda_=config.smoothing_lambda
            )
            processing_results['operations_applied'].append('laplacian_smoothing')
        
        job_data['progress'] = 60.0
        
        # Mesh simplification
        if config.target_face_count < original_faces:
            logger.info(f"Simplifying mesh to {config.target_face_count} faces")
            
            if config.simplification_method == "quadric":
                ms.apply_filter(
                    'meshing_decimation_quadric_edge_collapse',
                    targetfacenum=config.target_face_count,
                    preserveboundary=True,
                    preservenormal=True,
                    preservetopology=True
                )
            elif config.simplification_method == "clustering":
                ms.apply_filter(
                    'meshing_decimation_clustering',
                    threshold=0.1
                )
            
            processing_results['operations_applied'].append(f'{config.simplification_method}_simplification')
        
        job_data['progress'] = 75.0
        
        # UV unwrapping and texture generation
        if config.unwrap_method:
            logger.info("Generating UV coordinates")
            try:
                if config.unwrap_method == "angle_based":
                    ms.apply_filter('compute_texcoord_parametrization_triangle_trivial_per_wedge')
                elif config.unwrap_method == "conformal":
                    ms.apply_filter('compute_texcoord_parametrization_triangle_trivial_per_wedge')
                
                processing_results['operations_applied'].append('uv_unwrapping')
            except Exception as e:
                logger.warning(f"UV unwrapping failed: {e}")
        
        job_data['progress'] = 90.0
        
        # Save processed mesh
        output_path = Path(OUTPUT_DIR) / f"{job_data['id']}_processed.{config.output_format or 'ply'}"
        ms.save_current_mesh(str(output_path))
        
        # Get final statistics
        final_stats = ms.get_geometric_measures()
        processing_results.update({
            'final_vertex_count': final_stats['vertex_num'],
            'final_face_count': final_stats['face_num'],
            'bbox_diagonal': final_stats['bbox_diagonal'],
            'surface_area': final_stats['surface_area'],
            'mesh_volume': final_stats['mesh_volume'],
            'output_file': str(output_path)
        })
        
        # Generate wireframe visualization
        vis_path = Path(OUTPUT_DIR) / f"{job_data['id']}_mesh_visualization.png"
        self._create_mesh_visualization(input_file, vis_path)
        processing_results['visualization_file'] = str(vis_path)
        
        job_data['progress'] = 100.0
        
        MESH_VERTICES.labels(job_id=job_data['id']).set(processing_results['final_vertex_count'])
        
        return processing_results
    
    async def _execute_lidar_processing(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute LiDAR point cloud processing"""
        
        logger.info("Starting LiDAR processing")
        
        input_file = job_data['input_data'].get('lidar_file')
        
        if not input_file:
            raise ValueError("LiDAR file required for processing")
        
        # Load LAS/LAZ file
        if input_file.endswith(('.las', '.laz')):
            las_file = laspy.read(input_file)
            
            # Extract points
            points = np.vstack((las_file.x, las_file.y, las_file.z)).transpose()
            
            # Extract additional attributes if available
            attributes = {}
            if hasattr(las_file, 'intensity'):
                attributes['intensity'] = las_file.intensity
            if hasattr(las_file, 'classification'):
                attributes['classification'] = las_file.classification
            if hasattr(las_file, 'return_number'):
                attributes['return_number'] = las_file.return_number
            
        else:
            raise ValueError("Unsupported LiDAR file format")
        
        job_data['progress'] = 20.0
        
        # Create Open3D point cloud
        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(points)
        
        processing_results = {
            'original_point_count': len(points),
            'attributes': list(attributes.keys()),
            'operations_applied': []
        }
        
        # Ground plane detection
        logger.info("Detecting ground plane")
        plane_model, inliers = pcd.segment_plane(
            distance_threshold=0.2,
            ransac_n=3,
            num_iterations=1000
        )
        
        ground_pcd = pcd.select_by_index(inliers)
        non_ground_pcd = pcd.select_by_index(inliers, invert=True)
        
        processing_results['ground_points'] = len(inliers)
        processing_results['non_ground_points'] = len(non_ground_pcd.points)
        processing_results['ground_plane_equation'] = plane_model
        processing_results['operations_applied'].append('ground_plane_detection')
        
        job_data['progress'] = 50.0
        
        # Object clustering on non-ground points
        logger.info("Clustering objects")
        labels = np.array(non_ground_pcd.cluster_dbscan(eps=0.5, min_points=10))
        
        max_label = labels.max()
        num_clusters = max_label + 1
        
        processing_results['num_objects'] = int(num_clusters)
        processing_results['noise_points'] = int(np.sum(labels == -1))
        processing_results['operations_applied'].append('object_clustering')
        
        # Analyze each cluster
        objects = []
        for i in range(num_clusters):
            cluster_indices = np.where(labels == i)[0]
            if len(cluster_indices) > 50:  # Minimum object size
                cluster_pcd = non_ground_pcd.select_by_index(cluster_indices)
                
                # Calculate object properties
                bbox = cluster_pcd.get_axis_aligned_bounding_box()
                extent = bbox.get_extent()
                
                objects.append({
                    'id': i,
                    'point_count': len(cluster_indices),
                    'center': bbox.get_center().tolist(),
                    'dimensions': extent.tolist(),
                    'volume': extent[0] * extent[1] * extent[2]
                })
        
        processing_results['objects'] = objects
        
        job_data['progress'] = 75.0
        
        # Color point cloud by classification
        colors = np.zeros((len(points), 3))
        colors[inliers] = [0.5, 0.3, 0.1]  # Brown for ground
        
        # Color non-ground clusters
        non_ground_colors = plt.get_cmap("tab20")(labels / (max_label if max_label > 0 else 1))
        non_ground_colors[labels < 0] = [0.5, 0.5, 0.5]  # Gray for noise
        
        non_ground_indices = np.setdiff1d(np.arange(len(points)), inliers)
        colors[non_ground_indices] = non_ground_colors[:, :3]
        
        pcd.colors = o3d.utility.Vector3dVector(colors)
        
        # Save results
        output_path = Path(OUTPUT_DIR) / f"{job_data['id']}_lidar_processed.ply"
        o3d.io.write_point_cloud(str(output_path), pcd)
        
        processing_results['output_file'] = str(output_path)
        
        # Generate visualization
        vis_path = Path(OUTPUT_DIR) / f"{job_data['id']}_lidar_visualization.png"
        self._create_point_cloud_visualization(pcd, vis_path)
        processing_results['visualization_file'] = str(vis_path)
        
        job_data['progress'] = 100.0
        
        return processing_results
    
    async def _execute_3d_object_detection(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute 3D object detection"""
        
        logger.info("Starting 3D object detection")
        
        input_file = job_data['input_data'].get('point_cloud_file')
        
        if not input_file:
            raise ValueError("Point cloud file required for 3D object detection")
        
        # Load point cloud
        pcd = o3d.io.read_point_cloud(input_file)
        points = np.asarray(pcd.points)
        
        if len(points) == 0:
            raise ValueError("Empty point cloud")
        
        job_data['progress'] = 20.0
        
        # Preprocess point cloud
        # Subsample to fixed number of points for neural network
        target_points = 1024
        if len(points) > target_points:
            indices = np.random.choice(len(points), target_points, replace=False)
            points = points[indices]
        elif len(points) < target_points:
            # Pad with zeros or repeat points
            padding_needed = target_points - len(points)
            padding = np.zeros((padding_needed, 3))
            points = np.vstack([points, padding])
        
        # Normalize points
        points = points - np.mean(points, axis=0)
        scale = np.max(np.linalg.norm(points, axis=1))
        if scale > 0:
            points = points / scale
        
        job_data['progress'] = 40.0
        
        # Prepare input for PointNet
        points_tensor = torch.FloatTensor(points).unsqueeze(0).transpose(2, 1).to(DEVICE)
        
        # Run inference
        with torch.no_grad():
            if 'pointnet' in self.models:
                logits = self.models['pointnet'](points_tensor)
                predicted_class = torch.argmax(logits, dim=1).item()
                confidence = torch.softmax(logits, dim=1).max().item()
            else:
                # Fallback classification
                predicted_class = 0
                confidence = 0.5
        
        job_data['progress'] = 70.0
        
        # Object class mapping (simplified)
        object_classes = [
            'airplane', 'bathtub', 'bed', 'bench', 'bookshelf', 'bottle',
            'bowl', 'car', 'chair', 'cone', 'cup', 'curtain', 'desk',
            'door', 'dresser', 'flower_pot', 'glass_box', 'guitar',
            'keyboard', 'lamp', 'laptop', 'mantel', 'monitor', 'night_stand',
            'person', 'piano', 'plant', 'radio', 'range_hood', 'sink',
            'sofa', 'stairs', 'stool', 'table', 'tent', 'toilet',
            'tv_stand', 'vase', 'wardrobe', 'xbox'
        ]
        
        predicted_label = object_classes[predicted_class] if predicted_class < len(object_classes) else 'unknown'
        
        # Bounding box estimation
        original_points = np.asarray(pcd.points)
        if len(original_points) > 0:
            bbox_min = np.min(original_points, axis=0)
            bbox_max = np.max(original_points, axis=0)
            bbox_center = (bbox_min + bbox_max) / 2
            bbox_extent = bbox_max - bbox_min
        else:
            bbox_min = bbox_max = bbox_center = bbox_extent = np.zeros(3)
        
        detection_results = {
            'detected_objects': [{
                'class': predicted_label,
                'confidence': float(confidence),
                'bounding_box': {
                    'center': bbox_center.tolist(),
                    'extent': bbox_extent.tolist(),
                    'min': bbox_min.tolist(),
                    'max': bbox_max.tolist()
                }
            }],
            'point_cloud_stats': {
                'total_points': len(original_points),
                'processed_points': len(points)
            }
        }
        
        job_data['progress'] = 90.0
        
        # Visualize detection
        vis_path = Path(OUTPUT_DIR) / f"{job_data['id']}_detection_visualization.png"
        self._create_detection_visualization(pcd, detection_results['detected_objects'], vis_path)
        detection_results['visualization_file'] = str(vis_path)
        
        job_data['progress'] = 100.0
        
        return detection_results
    
    async def _execute_3d_semantic_segmentation(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute 3D semantic segmentation"""
        
        logger.info("Starting 3D semantic segmentation")
        
        input_file = job_data['input_data'].get('point_cloud_file')
        
        if not input_file:
            raise ValueError("Point cloud file required for 3D semantic segmentation")
        
        # Load point cloud
        pcd = o3d.io.read_point_cloud(input_file)
        points = np.asarray(pcd.points)
        
        if len(points) == 0:
            raise ValueError("Empty point cloud")
        
        job_data['progress'] = 20.0
        
        # Simple semantic segmentation using geometric features
        # In practice, you would use a trained segmentation network
        
        # Compute normals
        pcd.estimate_normals()
        normals = np.asarray(pcd.normals)
        
        # Height-based segmentation
        z_coords = points[:, 2]
        z_min, z_max = np.min(z_coords), np.max(z_coords)
        z_range = z_max - z_min
        
        # Segment into classes based on height and normal direction
        labels = np.zeros(len(points), dtype=int)
        
        # Ground (low height, horizontal normal)
        ground_mask = (z_coords < z_min + 0.1 * z_range) & (normals[:, 2] > 0.8)
        labels[ground_mask] = 1  # Ground
        
        # Walls (vertical normals)
        wall_mask = np.abs(normals[:, 2]) < 0.3
        labels[wall_mask] = 2  # Wall
        
        # Ceiling (high height, horizontal normal pointing down)
        ceiling_mask = (z_coords > z_max - 0.1 * z_range) & (normals[:, 2] < -0.8)
        labels[ceiling_mask] = 3  # Ceiling
        
        # Objects (everything else)
        object_mask = labels == 0
        labels[object_mask] = 4  # Objects
        
        job_data['progress'] = 60.0
        
        # Refine segmentation using clustering
        for class_id in range(1, 5):
            class_mask = labels == class_id
            if np.sum(class_mask) > 10:
                class_points = points[class_mask]
                class_pcd = o3d.geometry.PointCloud()
                class_pcd.points = o3d.utility.Vector3dVector(class_points)
                
                # Cluster within class
                cluster_labels = np.array(class_pcd.cluster_dbscan(eps=0.1, min_points=5))
                
                # Update labels
                labels[class_mask] = class_id * 100 + cluster_labels + 1
        
        job_data['progress'] = 80.0
        
        # Color point cloud by semantic class
        semantic_classes = {
            1: 'ground',
            2: 'wall', 
            3: 'ceiling',
            4: 'object'
        }
        
        class_colors = {
            1: [0.5, 0.3, 0.1],  # Brown for ground
            2: [0.8, 0.8, 0.8],  # Gray for walls
            3: [0.9, 0.9, 0.9],  # White for ceiling
            4: [0.2, 0.8, 0.2]   # Green for objects
        }
        
        colors = np.zeros((len(points), 3))
        for i, label in enumerate(labels):
            base_class = label // 100 if label >= 100 else label
            if base_class in class_colors:
                colors[i] = class_colors[base_class]
            else:
                colors[i] = [0.5, 0.5, 0.5]  # Default gray
        
        pcd.colors = o3d.utility.Vector3dVector(colors)
        
        # Compute segmentation statistics
        unique_labels, counts = np.unique(labels, return_counts=True)
        class_stats = {}
        
        for class_id in semantic_classes:
            class_mask = (labels // 100 == class_id) if class_id in [1, 2, 3, 4] else (labels == class_id)
            class_stats[semantic_classes[class_id]] = {
                'point_count': int(np.sum(class_mask)),
                'percentage': float(np.sum(class_mask) / len(labels) * 100)
            }
        
        segmentation_results = {
            'total_points': len(points),
            'num_segments': len(unique_labels),
            'class_statistics': class_stats,
            'semantic_classes': semantic_classes
        }
        
        # Save segmented point cloud
        output_path = Path(OUTPUT_DIR) / f"{job_data['id']}_segmented.ply"
        o3d.io.write_point_cloud(str(output_path), pcd)
        segmentation_results['output_file'] = str(output_path)
        
        # Generate visualization
        vis_path = Path(OUTPUT_DIR) / f"{job_data['id']}_segmentation_visualization.png"
        self._create_point_cloud_visualization(pcd, vis_path)
        segmentation_results['visualization_file'] = str(vis_path)
        
        job_data['progress'] = 100.0
        
        return segmentation_results
    
    def _create_point_cloud_visualization(self, pcd: o3d.geometry.PointCloud, output_path: Path):
        """Create point cloud visualization"""
        try:
            vis = o3d.visualization.Visualizer()
            vis.create_window(visible=False, width=800, height=600)
            vis.add_geometry(pcd)
            
            # Set view parameters
            ctr = vis.get_view_control()
            ctr.set_front([0.5, 0.5, 0.5])
            ctr.set_lookat([0, 0, 0])
            ctr.set_up([0, 0, 1])
            ctr.set_zoom(0.8)
            
            # Capture image
            vis.poll_events()
            vis.update_renderer()
            vis.capture_screen_image(str(output_path))
            vis.destroy_window()
            
        except Exception as e:
            logger.warning(f"Failed to create point cloud visualization: {e}")
    
    def _create_mesh_visualization(self, mesh_path: str, output_path: Path):
        """Create mesh visualization"""
        try:
            mesh = o3d.io.read_triangle_mesh(mesh_path)
            mesh.compute_vertex_normals()
            
            vis = o3d.visualization.Visualizer()
            vis.create_window(visible=False, width=800, height=600)
            vis.add_geometry(mesh)
            
            # Set view parameters
            ctr = vis.get_view_control()
            ctr.set_front([0.5, 0.5, 0.5])
            ctr.set_lookat([0, 0, 0])
            ctr.set_up([0, 0, 1])
            ctr.set_zoom(0.8)
            
            # Capture image
            vis.poll_events()
            vis.update_renderer()
            vis.capture_screen_image(str(output_path))
            vis.destroy_window()
            
        except Exception as e:
            logger.warning(f"Failed to create mesh visualization: {e}")
    
    def _create_detection_visualization(self, pcd: o3d.geometry.PointCloud, detections: List[Dict], output_path: Path):
        """Create detection visualization with bounding boxes"""
        try:
            vis = o3d.visualization.Visualizer()
            vis.create_window(visible=False, width=800, height=600)
            vis.add_geometry(pcd)
            
            # Add bounding boxes for detections
            for detection in detections:
                bbox_info = detection['bounding_box']
                center = np.array(bbox_info['center'])
                extent = np.array(bbox_info['extent'])
                
                # Create bounding box
                bbox = o3d.geometry.AxisAlignedBoundingBox(
                    min_bound=center - extent/2,
                    max_bound=center + extent/2
                )
                bbox.color = [1, 0, 0]  # Red
                
                # Convert to line set for visualization
                bbox_lines = o3d.geometry.LineSet.create_from_axis_aligned_bounding_box(bbox)
                vis.add_geometry(bbox_lines)
            
            # Set view parameters
            ctr = vis.get_view_control()
            ctr.set_front([0.5, 0.5, 0.5])
            ctr.set_lookat([0, 0, 0])
            ctr.set_up([0, 0, 1])
            ctr.set_zoom(0.8)
            
            # Capture image
            vis.poll_events()
            vis.update_renderer()
            vis.capture_screen_image(str(output_path))
            vis.destroy_window()
            
        except Exception as e:
            logger.warning(f"Failed to create detection visualization: {e}")
    
    async def get_job_status(self, job_id: str) -> ProcessingJobResponse:
        """Get job status"""
        
        if job_id not in self.active_jobs:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job_data = self.active_jobs[job_id]
        
        return ProcessingJobResponse(
            job_id=job_id,
            status=job_data['status'],
            name=job_data['name'],
            job_type=job_data['job_type'],
            created_at=job_data['created_at'],
            start_time=job_data.get('start_time'),
            end_time=job_data.get('end_time'),
            progress=job_data.get('progress', 0.0),
            result_data=job_data.get('result_data'),
            output_files=job_data.get('result_data', {}).get('output_files', []),
            error_message=job_data.get('error_message')
        )
    
    async def list_jobs(self, limit: int = 50) -> List[ProcessingJobResponse]:
        """List processing jobs"""
        
        jobs = []
        for job_id, job_data in list(self.active_jobs.items())[-limit:]:
            jobs.append(ProcessingJobResponse(
                job_id=job_id,
                status=job_data['status'],
                name=job_data['name'],
                job_type=job_data['job_type'],
                created_at=job_data['created_at'],
                start_time=job_data.get('start_time'),
                end_time=job_data.get('end_time'),
                progress=job_data.get('progress', 0.0),
                result_data=job_data.get('result_data'),
                output_files=job_data.get('result_data', {}).get('output_files', []),
                error_message=job_data.get('error_message')
            ))
        
        return jobs
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Get system statistics"""
        
        return {
            "active_jobs": len([j for j in self.active_jobs.values() if j['status'] == 'running']),
            "total_jobs": len(self.active_jobs),
            "cpu_usage": psutil.cpu_percent(),
            "memory_usage": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent,
            "gpu_available": torch.cuda.is_available(),
            "gpu_count": torch.cuda.device_count() if torch.cuda.is_available() else 0,
            "colmap_available": Path(COLMAP_PATH).exists()
        }

# Initialize service
service = ThreeDProcessingService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting AnnotateAI 3D Processing Service")
    yield
    logger.info("Shutting down AnnotateAI 3D Processing Service")

# Create FastAPI app
app = FastAPI(
    title="AnnotateAI 3D Processing Service",
    description="Advanced 3D reconstruction, point cloud processing, and mesh operations",
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

# Mount static files for visualizations
app.mount("/static", StaticFiles(directory=OUTPUT_DIR), name="static")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "device": DEVICE,
        "colmap_available": Path(COLMAP_PATH).exists()
    }

@app.post("/processing/jobs", response_model=ProcessingJobResponse)
async def create_processing_job(
    request: ProcessingJobRequest,
    background_tasks: BackgroundTasks
):
    """Create a new 3D processing job"""
    return await service.create_processing_job(request, background_tasks)

@app.get("/processing/jobs/{job_id}", response_model=ProcessingJobResponse)
async def get_processing_job(job_id: str):
    """Get processing job status"""
    return await service.get_job_status(job_id)

@app.get("/processing/jobs", response_model=List[ProcessingJobResponse])
async def list_processing_jobs(limit: int = 50):
    """List processing jobs"""
    return await service.list_jobs(limit)

@app.get("/system/stats")
async def get_system_stats():
    """Get system statistics"""
    return service.get_system_stats()

@app.get("/metrics")
async def get_metrics():
    """Get Prometheus metrics"""
    from fastapi.responses import Response
    return Response(generate_latest(), media_type="text/plain")

@app.get("/files/{file_path:path}")
async def get_output_file(file_path: str):
    """Download output files"""
    full_path = Path(OUTPUT_DIR) / file_path
    if full_path.exists() and full_path.is_file():
        return FileResponse(full_path)
    else:
        raise HTTPException(status_code=404, detail="File not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 