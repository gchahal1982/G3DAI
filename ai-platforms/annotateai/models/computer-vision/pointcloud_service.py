#!/usr/bin/env python3
"""
AnnotateAI 3D Point Cloud Service
PointNet++, PointPillars, and other 3D models for point cloud processing and analysis
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import open3d as o3d
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
from sklearn.cluster import DBSCAN
from sklearn.neighbors import NearestNeighbors
from scipy.spatial.distance import cdist

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
class Config:
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    MAX_POINTS = int(os.getenv("MAX_POINTS", "100000"))
    SUPPORTED_FORMATS = ['.pcd', '.ply', '.las', '.xyz', '.pts', '.obj']
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
    logger.info("Starting 3D Point Cloud Service...")
    logger.info(f"Using device: {config.DEVICE}")
    
    # Initialize Redis client
    redis_client = redis.from_url(config.REDIS_URL)
    
    # Load models
    await load_models()
    
    logger.info("3D Point Cloud Service started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down 3D Point Cloud Service...")
    if redis_client:
        await redis_client.close()

# FastAPI app
app = FastAPI(
    title="AnnotateAI 3D Point Cloud Service",
    description="PointNet++, PointPillars for 3D point cloud processing and analysis",
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
class PointCloudTask(str, Enum):
    OBJECT_DETECTION = "object_detection"
    SEMANTIC_SEGMENTATION = "semantic_segmentation"
    INSTANCE_SEGMENTATION = "instance_segmentation"
    CLASSIFICATION = "classification"
    REGISTRATION = "registration"
    COMPLETION = "completion"
    DENOISING = "denoising"

class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class PointCloudRequest(BaseModel):
    task: PointCloudTask
    confidence_threshold: float = Field(0.5, ge=0.0, le=1.0)
    max_points: int = Field(50000, ge=1000, le=200000)
    voxel_size: float = Field(0.1, ge=0.01, le=1.0)
    remove_outliers: bool = True
    normalize_coordinates: bool = True

class ProcessingJob(BaseModel):
    job_id: str
    status: ProcessingStatus
    task: PointCloudTask
    progress: float = 0.0
    num_points: int = 0
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    result_url: Optional[str] = None

class ProcessingResponse(BaseModel):
    job_id: str
    status: ProcessingStatus
    message: str

@dataclass
class Detection3D:
    """3D object detection result"""
    bbox: Tuple[float, float, float, float, float, float]  # x, y, z, w, h, d
    center: Tuple[float, float, float]  # x, y, z
    rotation: Tuple[float, float, float]  # rx, ry, rz
    class_id: int
    class_name: str
    confidence: float

# PointNet++ Implementation
class PointNetSetAbstraction(nn.Module):
    """PointNet++ Set Abstraction Layer"""
    
    def __init__(self, npoint, radius, nsample, in_channel, mlp, group_all):
        super(PointNetSetAbstraction, self).__init__()
        self.npoint = npoint
        self.radius = radius
        self.nsample = nsample
        self.mlp_convs = nn.ModuleList()
        self.mlp_bns = nn.ModuleList()
        last_channel = in_channel
        for out_channel in mlp:
            self.mlp_convs.append(nn.Conv2d(last_channel, out_channel, 1))
            self.mlp_bns.append(nn.BatchNorm2d(out_channel))
            last_channel = out_channel
        self.group_all = group_all

    def forward(self, xyz, points):
        """
        Input:
            xyz: input points position data, [B, C, N]
            points: input points data, [B, D, N]
        Return:
            new_xyz: sampled points position data, [B, C, S]
            new_points_concat: sample points feature data, [B, D', S]
        """
        xyz = xyz.permute(0, 2, 1)
        if points is not None:
            points = points.permute(0, 2, 1)

        if self.group_all:
            new_xyz, new_points = self.sample_and_group_all(xyz, points)
        else:
            new_xyz, new_points = self.sample_and_group(xyz, points)
        
        # [B, 3+D, nsample, npoint] -> [B, D', npoint]
        new_points = new_points.permute(0, 3, 2, 1)
        for i, conv in enumerate(self.mlp_convs):
            bn = self.mlp_bns[i]
            new_points = F.relu(bn(conv(new_points)))

        new_points = torch.max(new_points, 2)[0]
        new_xyz = new_xyz.permute(0, 2, 1)
        return new_xyz, new_points

    def sample_and_group(self, xyz, points, returnfps=False):
        """Sample and group points"""
        B, N, C = xyz.shape
        S = self.npoint
        
        # FPS sampling (simplified version)
        fps_idx = self.farthest_point_sample(xyz, S)
        new_xyz = self.index_points(xyz, fps_idx)
        
        # Ball query (simplified)
        idx = self.query_ball_point(self.radius, self.nsample, xyz, new_xyz)
        grouped_xyz = self.index_points(xyz, idx)
        grouped_xyz_norm = grouped_xyz - new_xyz.view(B, S, 1, C)
        
        if points is not None:
            grouped_points = self.index_points(points, idx)
            new_points = torch.cat([grouped_xyz_norm, grouped_points], dim=-1)
        else:
            new_points = grouped_xyz_norm
        
        return new_xyz, new_points

    def sample_and_group_all(self, xyz, points):
        """Group all points"""
        B, N, C = xyz.shape
        new_xyz = torch.zeros(B, 1, C).to(xyz.device)
        grouped_xyz = xyz.view(B, 1, N, C)
        if points is not None:
            new_points = torch.cat([grouped_xyz, points.view(B, 1, N, -1)], dim=-1)
        else:
            new_points = grouped_xyz
        return new_xyz, new_points

    def farthest_point_sample(self, xyz, npoint):
        """Farthest point sampling"""
        B, N, C = xyz.shape
        centroids = torch.zeros(B, npoint, dtype=torch.long).to(xyz.device)
        distance = torch.ones(B, N).to(xyz.device) * 1e10
        farthest = torch.randint(0, N, (B,), dtype=torch.long).to(xyz.device)
        batch_indices = torch.arange(B, dtype=torch.long).to(xyz.device)
        
        for i in range(npoint):
            centroids[:, i] = farthest
            centroid = xyz[batch_indices, farthest, :].view(B, 1, 3)
            dist = torch.sum((xyz - centroid) ** 2, -1)
            mask = dist < distance
            distance[mask] = dist[mask]
            farthest = torch.max(distance, -1)[1]
        
        return centroids

    def index_points(self, points, idx):
        """Index points by indices"""
        device = points.device
        B = points.shape[0]
        view_shape = list(idx.shape)
        view_shape[1:] = [1] * (len(view_shape) - 1)
        repeat_shape = list(idx.shape)
        repeat_shape[0] = 1
        batch_indices = torch.arange(B, dtype=torch.long).to(device).view(view_shape).repeat(repeat_shape)
        new_points = points[batch_indices, idx, :]
        return new_points

    def query_ball_point(self, radius, nsample, xyz, new_xyz):
        """Query ball point (simplified version)"""
        B, N, C = xyz.shape
        _, S, _ = new_xyz.shape
        group_idx = torch.arange(N, dtype=torch.long).to(xyz.device).view(1, 1, N).repeat([B, S, 1])
        
        # Simplified: just take the first nsample points for each query point
        group_idx = group_idx[:, :, :nsample]
        return group_idx

class PointNetPlusPlus(nn.Module):
    """PointNet++ for point cloud classification and segmentation"""
    
    def __init__(self, num_class, normal_channel=True):
        super(PointNetPlusPlus, self).__init__()
        in_channel = 6 if normal_channel else 3
        self.normal_channel = normal_channel
        
        # Set abstraction layers
        self.sa1 = PointNetSetAbstraction(npoint=512, radius=0.2, nsample=32, in_channel=in_channel, mlp=[64, 64, 128], group_all=False)
        self.sa2 = PointNetSetAbstraction(npoint=128, radius=0.4, nsample=64, in_channel=128 + 3, mlp=[128, 128, 256], group_all=False)
        self.sa3 = PointNetSetAbstraction(npoint=None, radius=None, nsample=None, in_channel=256 + 3, mlp=[256, 512, 1024], group_all=True)
        
        # Classification head
        self.fc1 = nn.Linear(1024, 512)
        self.bn1 = nn.BatchNorm1d(512)
        self.drop1 = nn.Dropout(0.4)
        self.fc2 = nn.Linear(512, 256)
        self.bn2 = nn.BatchNorm1d(256)
        self.drop2 = nn.Dropout(0.4)
        self.fc3 = nn.Linear(256, num_class)

    def forward(self, xyz):
        B, _, _ = xyz.shape
        if self.normal_channel:
            norm = xyz[:, 3:, :]
            xyz = xyz[:, :3, :]
        else:
            norm = None
        
        l1_xyz, l1_points = self.sa1(xyz, norm)
        l2_xyz, l2_points = self.sa2(l1_xyz, l1_points)
        l3_xyz, l3_points = self.sa3(l2_xyz, l2_points)
        
        x = l3_points.view(B, 1024)
        x = self.drop1(F.relu(self.bn1(self.fc1(x))))
        x = self.drop2(F.relu(self.bn2(self.fc2(x))))
        x = self.fc3(x)
        x = F.log_softmax(x, -1)
        
        return x

class PointPillars(nn.Module):
    """Simplified PointPillars for 3D object detection"""
    
    def __init__(self, num_classes=1, max_points_per_pillar=100):
        super(PointPillars, self).__init__()
        self.max_points_per_pillar = max_points_per_pillar
        
        # Pillar feature network
        self.pillar_feature_net = nn.Sequential(
            nn.Linear(9, 64),  # x, y, z, intensity, x_c, y_c, z_c, x_p, y_p
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Linear(64, 64),
            nn.BatchNorm1d(64),
            nn.ReLU()
        )
        
        # 2D CNN backbone (simplified)
        self.backbone = nn.Sequential(
            nn.Conv2d(64, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(128, 256, 3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.MaxPool2d(2)
        )
        
        # Detection head
        self.detection_head = nn.Conv2d(256, num_classes * 7, 1)  # 7 parameters per box

    def forward(self, point_cloud):
        # Simplified forward pass
        # In a real implementation, this would involve pillar creation and feature extraction
        batch_size = point_cloud.shape[0]
        
        # Placeholder output
        output = torch.randn(batch_size, 7).to(point_cloud.device)  # [x, y, z, w, h, l, rotation]
        return output

# Model Loading and Management
async def load_models():
    """Load pre-trained 3D point cloud models"""
    global models
    
    try:
        # Create model cache directory
        os.makedirs(config.MODEL_CACHE_DIR, exist_ok=True)
        
        # Initialize models for different tasks
        models = {
            'pointnet_classification': PointNetPlusPlus(num_class=10, normal_channel=False),
            'pointnet_segmentation': PointNetPlusPlus(num_class=3, normal_channel=False),
            'pointpillars_detection': PointPillars(num_classes=5),
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
        
        logger.info(f"Loaded {len(models)} 3D point cloud models")
        
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
        models = {}

# Point Cloud Processing Functions
def load_point_cloud(file_path: str) -> Tuple[np.ndarray, Dict[str, Any]]:
    """Load point cloud from various formats"""
    try:
        file_ext = Path(file_path).suffix.lower()
        
        if file_ext == '.pcd':
            pcd = o3d.io.read_point_cloud(file_path)
            points = np.asarray(pcd.points)
            colors = np.asarray(pcd.colors) if pcd.has_colors() else None
            normals = np.asarray(pcd.normals) if pcd.has_normals() else None
        
        elif file_ext == '.ply':
            pcd = o3d.io.read_point_cloud(file_path)
            points = np.asarray(pcd.points)
            colors = np.asarray(pcd.colors) if pcd.has_colors() else None
            normals = np.asarray(pcd.normals) if pcd.has_normals() else None
        
        elif file_ext in ['.xyz', '.pts']:
            data = np.loadtxt(file_path)
            points = data[:, :3]
            colors = data[:, 3:6] if data.shape[1] >= 6 else None
            normals = None
        
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
        
        # Create metadata
        metadata = {
            'num_points': len(points),
            'bounds': {
                'min': points.min(axis=0).tolist(),
                'max': points.max(axis=0).tolist()
            },
            'has_colors': colors is not None,
            'has_normals': normals is not None,
            'file_format': file_ext
        }
        
        # Combine features
        if colors is not None and normals is not None:
            point_cloud = np.hstack([points, colors, normals])
        elif colors is not None:
            point_cloud = np.hstack([points, colors])
        elif normals is not None:
            point_cloud = np.hstack([points, normals])
        else:
            point_cloud = points
        
        return point_cloud, metadata
        
    except Exception as e:
        raise ValueError(f"Failed to load point cloud: {e}")

def preprocess_point_cloud(
    point_cloud: np.ndarray,
    max_points: int = 50000,
    voxel_size: float = 0.1,
    remove_outliers: bool = True,
    normalize_coordinates: bool = True
) -> np.ndarray:
    """Preprocess point cloud for model input"""
    
    # Sample points if too many
    if len(point_cloud) > max_points:
        indices = np.random.choice(len(point_cloud), max_points, replace=False)
        point_cloud = point_cloud[indices]
    
    # Remove outliers using statistical method
    if remove_outliers and len(point_cloud) > 100:
        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(point_cloud[:, :3])
        pcd, _ = pcd.remove_statistical_outlier(nb_neighbors=20, std_ratio=2.0)
        point_cloud = np.asarray(pcd.points)
    
    # Voxel downsampling
    if voxel_size > 0:
        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(point_cloud[:, :3])
        pcd = pcd.voxel_down_sample(voxel_size)
        downsampled_points = np.asarray(pcd.points)
        
        # If we had additional features, we need to match them
        if point_cloud.shape[1] > 3:
            # Simple nearest neighbor matching for features
            from sklearn.neighbors import NearestNeighbors
            nbrs = NearestNeighbors(n_neighbors=1).fit(point_cloud[:, :3])
            _, indices = nbrs.kneighbors(downsampled_points)
            point_cloud = point_cloud[indices.flatten()]
            point_cloud[:, :3] = downsampled_points
        else:
            point_cloud = downsampled_points
    
    # Normalize coordinates
    if normalize_coordinates:
        centroid = np.mean(point_cloud[:, :3], axis=0)
        point_cloud[:, :3] -= centroid
        scale = np.max(np.linalg.norm(point_cloud[:, :3], axis=1))
        if scale > 0:
            point_cloud[:, :3] /= scale
    
    return point_cloud

def detect_objects_3d(point_cloud: np.ndarray, model: nn.Module, confidence_threshold: float = 0.5) -> List[Detection3D]:
    """Detect 3D objects in point cloud"""
    
    # Convert to tensor
    point_tensor = torch.from_numpy(point_cloud[:, :3].T).float().unsqueeze(0).to(config.DEVICE)
    
    # Run inference
    with torch.no_grad():
        output = model(point_tensor)
    
    # Parse output (simplified)
    detections = []
    if output.shape[1] >= 7:  # x, y, z, w, h, l, rotation
        for i in range(output.shape[0]):
            detection_data = output[i].cpu().numpy()
            
            # Create detection object
            detection = Detection3D(
                bbox=tuple(detection_data[:6]),  # x, y, z, w, h, l
                center=tuple(detection_data[:3]),  # x, y, z
                rotation=(0, 0, detection_data[6] if len(detection_data) > 6 else 0),
                class_id=0,
                class_name="object",
                confidence=0.8  # Placeholder
            )
            
            if detection.confidence >= confidence_threshold:
                detections.append(detection)
    
    return detections

def segment_point_cloud(point_cloud: np.ndarray, model: nn.Module, num_classes: int = 3) -> Tuple[np.ndarray, Dict[str, Any]]:
    """Segment point cloud into semantic classes"""
    
    # Convert to tensor
    point_tensor = torch.from_numpy(point_cloud[:, :3].T).float().unsqueeze(0).to(config.DEVICE)
    
    # Run inference
    with torch.no_grad():
        output = model(point_tensor)
        predictions = torch.argmax(output, dim=1).cpu().numpy()
    
    # Calculate statistics
    unique_classes, counts = np.unique(predictions, return_counts=True)
    statistics = {
        'num_classes': len(unique_classes),
        'class_distribution': {int(cls): int(count) for cls, count in zip(unique_classes, counts)},
        'total_points': len(predictions)
    }
    
    return predictions, statistics

def classify_point_cloud(point_cloud: np.ndarray, model: nn.Module) -> Dict[str, Any]:
    """Classify entire point cloud"""
    
    # Convert to tensor
    point_tensor = torch.from_numpy(point_cloud[:, :3].T).float().unsqueeze(0).to(config.DEVICE)
    
    # Run inference
    with torch.no_grad():
        output = model(point_tensor)
        probabilities = F.softmax(output, dim=1).cpu().numpy()[0]
    
    # Get predictions
    predicted_class = np.argmax(probabilities)
    confidence = probabilities[predicted_class]
    
    return {
        'predicted_class': int(predicted_class),
        'confidence': float(confidence),
        'probabilities': probabilities.tolist(),
        'class_names': [f"class_{i}" for i in range(len(probabilities))]
    }

def select_model_for_task(task: PointCloudTask) -> str:
    """Select appropriate model based on task"""
    
    model_mapping = {
        PointCloudTask.OBJECT_DETECTION: 'pointpillars_detection',
        PointCloudTask.SEMANTIC_SEGMENTATION: 'pointnet_segmentation',
        PointCloudTask.CLASSIFICATION: 'pointnet_classification',
        PointCloudTask.INSTANCE_SEGMENTATION: 'pointnet_segmentation',
    }
    
    return model_mapping.get(task, 'pointnet_classification')

# Utility functions
async def save_job_status(job: ProcessingJob):
    """Save job status to Redis"""
    try:
        await redis_client.setex(
            f"pointcloud_job:{job.job_id}",
            3600,  # 1 hour
            job.json()
        )
    except Exception as e:
        logger.error(f"Failed to save job status: {e}")

async def get_job_status(job_id: str) -> Optional[ProcessingJob]:
    """Get job status from Redis"""
    try:
        job_data = await redis_client.get(f"pointcloud_job:{job_id}")
        if job_data:
            return ProcessingJob.parse_raw(job_data)
    except Exception as e:
        logger.error(f"Failed to get job status: {e}")
    return None

def process_point_cloud_task(
    file_path: str,
    task: PointCloudTask,
    confidence_threshold: float = 0.5,
    max_points: int = 50000,
    voxel_size: float = 0.1,
    remove_outliers: bool = True,
    normalize_coordinates: bool = True
) -> Dict[str, Any]:
    """Process point cloud for specified task"""
    
    start_time = time.time()
    
    # Load point cloud
    point_cloud, metadata = load_point_cloud(file_path)
    
    # Preprocess
    processed_cloud = preprocess_point_cloud(
        point_cloud, max_points, voxel_size, remove_outliers, normalize_coordinates
    )
    
    # Select and run model
    model_name = select_model_for_task(task)
    model = models.get(model_name)
    
    if not model:
        raise ValueError(f"Model not available: {model_name}")
    
    # Process based on task
    if task == PointCloudTask.OBJECT_DETECTION:
        detections = detect_objects_3d(processed_cloud, model, confidence_threshold)
        result = {
            'detections': [
                {
                    'bbox': detection.bbox,
                    'center': detection.center,
                    'rotation': detection.rotation,
                    'class_id': detection.class_id,
                    'class_name': detection.class_name,
                    'confidence': detection.confidence
                }
                for detection in detections
            ],
            'num_detections': len(detections)
        }
    
    elif task in [PointCloudTask.SEMANTIC_SEGMENTATION, PointCloudTask.INSTANCE_SEGMENTATION]:
        predictions, statistics = segment_point_cloud(processed_cloud, model)
        result = {
            'segmentation': predictions.tolist(),
            'statistics': statistics
        }
    
    elif task == PointCloudTask.CLASSIFICATION:
        classification_result = classify_point_cloud(processed_cloud, model)
        result = classification_result
    
    else:
        raise ValueError(f"Unsupported task: {task}")
    
    processing_time = time.time() - start_time
    
    return {
        'task': task.value,
        'result': result,
        'metadata': metadata,
        'processing_info': {
            'original_points': metadata['num_points'],
            'processed_points': len(processed_cloud),
            'processing_time': processing_time,
            'model_used': model_name
        }
    }

async def process_pointcloud_job(job_id: str, file_path: str, request: PointCloudRequest):
    """Background task to process point cloud"""
    try:
        # Update job status
        job = ProcessingJob(
            job_id=job_id,
            status=ProcessingStatus.PROCESSING,
            task=request.task,
            created_at=datetime.utcnow()
        )
        await save_job_status(job)
        
        # Process point cloud
        result = process_point_cloud_task(
            file_path,
            request.task,
            request.confidence_threshold,
            request.max_points,
            request.voxel_size,
            request.remove_outliers,
            request.normalize_coordinates
        )
        
        # Update job with results
        job.status = ProcessingStatus.COMPLETED
        job.progress = 100.0
        job.num_points = result['processing_info']['processed_points']
        job.completed_at = datetime.utcnow()
        
        # Store result in Redis
        await redis_client.setex(
            f"pointcloud_result:{job_id}",
            3600,  # 1 hour
            json.dumps(result, default=str)
        )
        
        await save_job_status(job)
        
    except Exception as e:
        logger.error(f"Point cloud processing job {job_id} failed: {e}")
        
        # Update job with error
        job = await get_job_status(job_id)
        if job:
            job.status = ProcessingStatus.FAILED
            job.error_message = str(e)
            await save_job_status(job)
    
    finally:
        # Clean up file
        if os.path.exists(file_path):
            os.unlink(file_path)

# API Endpoints
@app.post("/process", response_model=ProcessingResponse)
async def process_point_cloud(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    task: PointCloudTask = PointCloudTask.CLASSIFICATION,
    confidence_threshold: float = 0.5,
    max_points: int = 50000,
    voxel_size: float = 0.1,
    remove_outliers: bool = True,
    normalize_coordinates: bool = True
):
    """Process 3D point cloud for various tasks"""
    
    # Validate file format
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in config.SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Supported formats: {config.SUPPORTED_FORMATS}"
        )
    
    # Save uploaded file
    file_data = await file.read()
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
        tmp.write(file_data)
        file_path = tmp.name
    
    # Generate job ID
    import uuid
    job_id = str(uuid.uuid4())
    
    # Create processing request
    request = PointCloudRequest(
        task=task,
        confidence_threshold=confidence_threshold,
        max_points=max_points,
        voxel_size=voxel_size,
        remove_outliers=remove_outliers,
        normalize_coordinates=normalize_coordinates
    )
    
    # Start background processing
    background_tasks.add_task(process_pointcloud_job, job_id, file_path, request)
    
    return ProcessingResponse(
        job_id=job_id,
        status=ProcessingStatus.PENDING,
        message="Point cloud processing started successfully"
    )

@app.get("/process/{job_id}")
async def get_processing_status(job_id: str):
    """Get processing job status"""
    job = await get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job

@app.get("/process/{job_id}/result")
async def get_processing_result(job_id: str):
    """Get processing results"""
    job = await get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != ProcessingStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Job not completed yet")
    
    # Get result from Redis
    try:
        result_data = await redis_client.get(f"pointcloud_result:{job_id}")
        if result_data:
            return json.loads(result_data)
        else:
            raise HTTPException(status_code=404, detail="Result not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get result: {e}")

@app.get("/tasks")
async def list_tasks():
    """List available point cloud processing tasks"""
    return {
        "tasks": [
            {"value": "object_detection", "name": "3D Object Detection", "description": "Detect objects in 3D space"},
            {"value": "semantic_segmentation", "name": "Semantic Segmentation", "description": "Classify each point semantically"},
            {"value": "instance_segmentation", "name": "Instance Segmentation", "description": "Segment individual object instances"},
            {"value": "classification", "name": "Point Cloud Classification", "description": "Classify entire point cloud"},
            {"value": "registration", "name": "Point Cloud Registration", "description": "Align multiple point clouds"},
            {"value": "completion", "name": "Point Cloud Completion", "description": "Complete partial point clouds"},
            {"value": "denoising", "name": "Point Cloud Denoising", "description": "Remove noise from point clouds"}
        ]
    }

@app.get("/models")
async def list_models():
    """List available 3D point cloud models"""
    return {
        "models": [
            {
                "name": "PointNet++ Classification",
                "key": "pointnet_classification",
                "description": "PointNet++ for point cloud classification",
                "tasks": ["classification"]
            },
            {
                "name": "PointNet++ Segmentation",
                "key": "pointnet_segmentation",
                "description": "PointNet++ for semantic segmentation",
                "tasks": ["semantic_segmentation", "instance_segmentation"]
            },
            {
                "name": "PointPillars Detection",
                "key": "pointpillars_detection",
                "description": "PointPillars for 3D object detection",
                "tasks": ["object_detection"]
            }
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "pointcloud-service",
        "device": config.DEVICE,
        "models_loaded": len(models),
        "supported_formats": config.SUPPORTED_FORMATS,
        "max_points": config.MAX_POINTS
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8015) 