#!/usr/bin/env python3
"""
AnnotateAI Video Processing Service
Advanced video analysis, multi-object tracking, and temporal annotation
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
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from dataclasses import dataclass
from enum import Enum
import uuid
import math
import cv2

import numpy as np
from PIL import Image, ImageDraw, ImageFont
import matplotlib.pyplot as plt
import seaborn as sns

# FastAPI and web framework
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Video processing
import ffmpeg
import imageio
from moviepy.editor import VideoFileClip
import decord
from decord import VideoReader, cpu, gpu

# Machine Learning and Computer Vision
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from torchvision.models import resnet50, mobilenet_v3_large
import clip
from ultralytics import YOLO

# Object tracking
from deep_sort_realtime import DeepSort
import motmetrics as mm

# Optical flow and motion analysis
from scipy.optimize import linear_sum_assignment
from scipy.spatial.distance import cdist
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import confusion_matrix

# Action recognition
import torch.nn.functional as F
from torch.nn import TransformerEncoder, TransformerEncoderLayer

# Database and caching
import redis
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float, Boolean, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import UUID, JSONB

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
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/annotateai")
FFMPEG_PATH = os.getenv("FFMPEG_PATH", "ffmpeg")
PROCESSING_TEMP_DIR = os.getenv("PROCESSING_TEMP_DIR", "/tmp/video_processing")
MODEL_CACHE_DIR = os.getenv("MODEL_CACHE_DIR", "/app/video_models")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "/app/video_outputs")

# Prometheus metrics
VIDEO_PROCESSING_JOBS_TOTAL = Counter('video_processing_jobs_total', 'Total video processing jobs', ['job_type'])
VIDEO_PROCESSING_DURATION = Histogram('video_processing_duration_seconds', 'Processing duration', ['job_type'])
ACTIVE_VIDEO_PROCESSING_JOBS = Gauge('active_video_processing_jobs', 'Active video processing jobs')
FRAMES_PROCESSED = Counter('video_frames_processed_total', 'Total frames processed')
OBJECTS_TRACKED = Counter('video_objects_tracked_total', 'Total objects tracked')
VIDEO_FPS_GAUGE = Gauge('video_processing_fps', 'Video processing FPS', ['job_id'])

class VideoProcessingJobType(str, Enum):
    """Types of video processing jobs"""
    OBJECT_DETECTION = "object_detection"
    OBJECT_TRACKING = "object_tracking"
    ACTION_RECOGNITION = "action_recognition"
    TEMPORAL_INTERPOLATION = "temporal_interpolation"
    VIDEO_ENHANCEMENT = "video_enhancement"
    MOTION_ANALYSIS = "motion_analysis"
    SCENE_SEGMENTATION = "scene_segmentation"
    FACE_RECOGNITION = "face_recognition"
    POSE_ESTIMATION = "pose_estimation"
    VIDEO_SUMMARIZATION = "video_summarization"

class TrackingMethod(str, Enum):
    """Object tracking methods"""
    DEEPSORT = "deepsort"
    SORT = "sort"
    BYTETRACK = "bytetrack"
    FAIRMOT = "fairmot"
    CENTROID = "centroid"
    KCF = "kcf"
    CSRT = "csrt"

class ActionRecognitionModel(str, Enum):
    """Action recognition models"""
    I3D = "i3d"
    SLOWFAST = "slowfast"
    X3D = "x3d"
    MVIT = "mvit"
    TRANSFORMER = "transformer"

# Database models
Base = declarative_base()

class VideoProcessingJob(Base):
    __tablename__ = "video_processing_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    job_type = Column(String(100), nullable=False)
    video_path = Column(String(512), nullable=False)
    config = Column(JSONB, nullable=False)
    status = Column(String(50), default="pending")
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    progress = Column(Float, default=0.0)
    results = Column(JSONB, nullable=True)
    output_path = Column(String(512), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class VideoAnnotation(Base):
    __tablename__ = "video_annotations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    video_id = Column(UUID(as_uuid=True), nullable=False)
    frame_number = Column(Integer, nullable=False)
    timestamp = Column(Float, nullable=False)
    object_id = Column(String(100), nullable=True)
    class_name = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    bbox = Column(JSONB, nullable=False)  # [x, y, width, height]
    keypoints = Column(JSONB, nullable=True)
    attributes = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic models
class VideoInfo(BaseModel):
    """Video file information"""
    duration: float
    fps: float
    frame_count: int
    width: int
    height: int
    codec: str
    bitrate: int
    file_size: int

class BoundingBox(BaseModel):
    """Bounding box representation"""
    x: float = Field(..., ge=0.0, le=1.0, description="Normalized x coordinate")
    y: float = Field(..., ge=0.0, le=1.0, description="Normalized y coordinate")
    width: float = Field(..., ge=0.0, le=1.0, description="Normalized width")
    height: float = Field(..., ge=0.0, le=1.0, description="Normalized height")

class Detection(BaseModel):
    """Object detection result"""
    class_name: str = Field(..., description="Object class name")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence")
    bbox: BoundingBox = Field(..., description="Bounding box")
    keypoints: Optional[List[List[float]]] = Field(default=None, description="Keypoints")
    attributes: Optional[Dict[str, Any]] = Field(default=None, description="Additional attributes")

class Track(BaseModel):
    """Object track information"""
    track_id: str = Field(..., description="Unique track ID")
    class_name: str = Field(..., description="Object class")
    detections: List[Tuple[int, Detection]] = Field(..., description="Frame number and detection pairs")
    start_frame: int = Field(..., description="First frame of track")
    end_frame: int = Field(..., description="Last frame of track")
    confidence: float = Field(..., description="Average track confidence")

class VideoProcessingConfig(BaseModel):
    """Video processing configuration"""
    # Detection settings
    detection_model: str = Field(default="yolov8n", description="Detection model")
    detection_threshold: float = Field(default=0.5, ge=0.0, le=1.0, description="Detection threshold")
    nms_threshold: float = Field(default=0.4, ge=0.0, le=1.0, description="NMS threshold")
    
    # Tracking settings
    tracking_method: TrackingMethod = Field(default=TrackingMethod.DEEPSORT, description="Tracking method")
    max_age: int = Field(default=70, ge=1, le=500, description="Maximum age for tracks")
    min_hits: int = Field(default=3, ge=1, le=20, description="Minimum hits to confirm track")
    iou_threshold: float = Field(default=0.3, ge=0.0, le=1.0, description="IoU threshold for tracking")
    
    # Processing settings
    frame_skip: int = Field(default=1, ge=1, le=30, description="Process every Nth frame")
    batch_size: int = Field(default=1, ge=1, le=32, description="Batch size for processing")
    max_frames: Optional[int] = Field(default=None, description="Maximum frames to process")
    
    # Output settings
    save_video: bool = Field(default=True, description="Save annotated video")
    save_frames: bool = Field(default=False, description="Save individual frames")
    video_quality: str = Field(default="medium", description="Output video quality")
    
    # Action recognition
    action_model: ActionRecognitionModel = Field(default=ActionRecognitionModel.TRANSFORMER, description="Action recognition model")
    temporal_window: int = Field(default=16, ge=4, le=64, description="Temporal window for action recognition")
    
    # Enhancement settings
    denoise: bool = Field(default=False, description="Apply denoising")
    stabilization: bool = Field(default=False, description="Apply stabilization")
    super_resolution: bool = Field(default=False, description="Apply super resolution")

class VideoProcessingRequest(BaseModel):
    """Video processing request"""
    name: str = Field(..., description="Job name")
    job_type: VideoProcessingJobType = Field(..., description="Processing job type")
    video_data: Optional[str] = Field(default=None, description="Base64 encoded video data")
    video_url: Optional[str] = Field(default=None, description="Video URL")
    config: VideoProcessingConfig = Field(default_factory=VideoProcessingConfig, description="Processing configuration")
    async_processing: bool = Field(default=True, description="Asynchronous processing")

class VideoProcessingResponse(BaseModel):
    """Video processing response"""
    job_id: str = Field(..., description="Job ID")
    status: str = Field(..., description="Job status")
    name: str = Field(..., description="Job name")
    job_type: VideoProcessingJobType = Field(..., description="Job type")
    progress: float = Field(default=0.0, description="Progress percentage")
    video_info: Optional[VideoInfo] = Field(default=None, description="Video information")
    results: Optional[Dict[str, Any]] = Field(default=None, description="Processing results")
    output_url: Optional[str] = Field(default=None, description="Output video URL")
    created_at: datetime = Field(..., description="Creation time")
    processing_time: Optional[float] = Field(default=None, description="Processing time")

class ActionRecognitionTransformer(nn.Module):
    """Transformer-based action recognition model"""
    
    def __init__(self, num_classes=400, d_model=512, nhead=8, num_layers=6, max_seq_length=64):
        super(ActionRecognitionTransformer, self).__init__()
        
        # Feature extractor (CNN backbone)
        self.backbone = mobilenet_v3_large(pretrained=True)
        self.backbone.classifier = nn.Identity()
        
        # Feature dimension
        feature_dim = 960
        
        # Projection to transformer dimension
        self.feature_projection = nn.Linear(feature_dim, d_model)
        
        # Positional encoding
        self.positional_encoding = self._create_positional_encoding(max_seq_length, d_model)
        
        # Transformer encoder
        encoder_layer = TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            dim_feedforward=2048,
            dropout=0.1,
            activation='relu',
            batch_first=True
        )
        self.transformer = TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        # Classification head
        self.classifier = nn.Sequential(
            nn.LayerNorm(d_model),
            nn.Dropout(0.1),
            nn.Linear(d_model, num_classes)
        )
        
        self.d_model = d_model
    
    def _create_positional_encoding(self, max_len, d_model):
        """Create positional encoding"""
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
        
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        
        return nn.Parameter(pe.unsqueeze(0), requires_grad=False)
    
    def forward(self, x):
        # x shape: (batch_size, sequence_length, channels, height, width)
        batch_size, seq_len = x.shape[:2]
        
        # Reshape for CNN processing
        x = x.view(-1, *x.shape[2:])  # (batch_size * seq_len, channels, height, width)
        
        # Extract features
        features = self.backbone(x)  # (batch_size * seq_len, feature_dim)
        
        # Reshape back to sequence
        features = features.view(batch_size, seq_len, -1)  # (batch_size, seq_len, feature_dim)
        
        # Project to transformer dimension
        features = self.feature_projection(features)  # (batch_size, seq_len, d_model)
        
        # Add positional encoding
        features = features + self.positional_encoding[:, :seq_len, :]
        
        # Apply transformer
        transformer_output = self.transformer(features)  # (batch_size, seq_len, d_model)
        
        # Global average pooling over sequence dimension
        pooled_features = torch.mean(transformer_output, dim=1)  # (batch_size, d_model)
        
        # Classification
        output = self.classifier(pooled_features)  # (batch_size, num_classes)
        
        return output

class VideoProcessingService:
    """Main video processing service"""
    
    def __init__(self):
        self.redis_client = redis.from_url(REDIS_URL)
        self.active_jobs = {}
        self.models = {}
        self.trackers = {}
        
        # Create directories
        Path(PROCESSING_TEMP_DIR).mkdir(parents=True, exist_ok=True)
        Path(MODEL_CACHE_DIR).mkdir(parents=True, exist_ok=True)
        Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
        
        # Initialize database
        self.engine = create_engine(DATABASE_URL)
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        
        # Initialize models
        asyncio.create_task(self._initialize_models())
    
    async def _initialize_models(self):
        """Initialize video processing models"""
        logger.info("Initializing video processing models...")
        
        try:
            # Load YOLO for object detection
            self.models['yolo'] = YOLO('yolov8n.pt')
            
            # Load action recognition model
            self.models['action_recognition'] = ActionRecognitionTransformer(num_classes=400)
            self.models['action_recognition'].to(DEVICE)
            self.models['action_recognition'].eval()
            
            # Load CLIP for scene understanding
            self.models['clip'], self.models['clip_preprocess'] = clip.load("ViT-B/32", device=DEVICE)
            
            # Initialize tracking
            self.models['deepsort'] = DeepSort(max_age=70, n_init=3)
            
            logger.info("Video processing models initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize video models: {e}")
    
    async def create_processing_job(
        self,
        request: VideoProcessingRequest,
        background_tasks: BackgroundTasks,
        video_file: Optional[UploadFile] = None
    ) -> VideoProcessingResponse:
        """Create a new video processing job"""
        
        job_id = str(uuid.uuid4())
        
        # Handle video input
        video_path = None
        if video_file:
            # Save uploaded file
            video_path = Path(PROCESSING_TEMP_DIR) / f"{job_id}_{video_file.filename}"
            with open(video_path, "wb") as f:
                content = await video_file.read()
                f.write(content)
        elif request.video_data:
            # Decode base64 video
            import base64
            video_data = base64.b64decode(request.video_data)
            video_path = Path(PROCESSING_TEMP_DIR) / f"{job_id}_video.mp4"
            with open(video_path, "wb") as f:
                f.write(video_data)
        elif request.video_url:
            # Download video from URL
            video_path = await self._download_video(request.video_url, job_id)
        else:
            raise HTTPException(status_code=400, detail="No video input provided")
        
        # Get video information
        video_info = await self._get_video_info(video_path)
        
        # Create database record
        with self.SessionLocal() as db:
            db_job = VideoProcessingJob(
                id=job_id,
                name=request.name,
                job_type=request.job_type.value,
                video_path=str(video_path),
                config=request.config.dict(),
                status="pending"
            )
            db.add(db_job)
            db.commit()
        
        # Initialize job data
        job_data = {
            'id': job_id,
            'name': request.name,
            'job_type': request.job_type,
            'video_path': str(video_path),
            'config': request.config,
            'status': 'pending',
            'progress': 0.0,
            'video_info': video_info,
            'created_at': datetime.utcnow()
        }
        
        self.active_jobs[job_id] = job_data
        
        # Queue job for execution
        if request.async_processing:
            background_tasks.add_task(self._execute_processing_job, job_id)
        else:
            await self._execute_processing_job(job_id)
        
        return VideoProcessingResponse(
            job_id=job_id,
            status="pending",
            name=request.name,
            job_type=request.job_type,
            progress=0.0,
            video_info=video_info,
            created_at=datetime.utcnow()
        )
    
    async def _download_video(self, url: str, job_id: str) -> Path:
        """Download video from URL"""
        video_path = Path(PROCESSING_TEMP_DIR) / f"{job_id}_downloaded.mp4"
        
        # Use ffmpeg to download and convert if needed
        try:
            (
                ffmpeg
                .input(url)
                .output(str(video_path), vcodec='libx264', acodec='aac')
                .overwrite_output()
                .run(quiet=True)
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to download video: {e}")
        
        return video_path
    
    async def _get_video_info(self, video_path: Path) -> VideoInfo:
        """Get video file information"""
        
        try:
            probe = ffmpeg.probe(str(video_path))
            video_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'video'), None)
            
            if not video_stream:
                raise ValueError("No video stream found")
            
            return VideoInfo(
                duration=float(video_stream.get('duration', 0)),
                fps=eval(video_stream.get('r_frame_rate', '30/1')),
                frame_count=int(video_stream.get('nb_frames', 0)),
                width=int(video_stream.get('width', 0)),
                height=int(video_stream.get('height', 0)),
                codec=video_stream.get('codec_name', ''),
                bitrate=int(video_stream.get('bit_rate', 0)),
                file_size=int(probe['format'].get('size', 0))
            )
        except Exception as e:
            logger.error(f"Failed to get video info: {e}")
            return VideoInfo(
                duration=0, fps=30, frame_count=0, width=0, height=0,
                codec='', bitrate=0, file_size=0
            )
    
    async def _execute_processing_job(self, job_id: str):
        """Execute a video processing job"""
        
        logger.info(f"Starting video processing job {job_id}")
        
        try:
            ACTIVE_VIDEO_PROCESSING_JOBS.inc()
            job_data = self.active_jobs[job_id]
            job_type = VideoProcessingJobType(job_data['job_type'])
            
            VIDEO_PROCESSING_JOBS_TOTAL.labels(job_type=job_type.value).inc()
            
            # Update job status
            job_data['status'] = 'running'
            job_data['start_time'] = datetime.utcnow()
            
            with self.SessionLocal() as db:
                db_job = db.query(VideoProcessingJob).filter(VideoProcessingJob.id == job_id).first()
                if db_job:
                    db_job.status = 'running'
                    db_job.start_time = datetime.utcnow()
                    db.commit()
            
            start_time = time.time()
            
            # Execute based on job type
            if job_type == VideoProcessingJobType.OBJECT_DETECTION:
                result = await self._execute_object_detection(job_data)
            elif job_type == VideoProcessingJobType.OBJECT_TRACKING:
                result = await self._execute_object_tracking(job_data)
            elif job_type == VideoProcessingJobType.ACTION_RECOGNITION:
                result = await self._execute_action_recognition(job_data)
            elif job_type == VideoProcessingJobType.TEMPORAL_INTERPOLATION:
                result = await self._execute_temporal_interpolation(job_data)
            elif job_type == VideoProcessingJobType.VIDEO_ENHANCEMENT:
                result = await self._execute_video_enhancement(job_data)
            elif job_type == VideoProcessingJobType.MOTION_ANALYSIS:
                result = await self._execute_motion_analysis(job_data)
            else:
                raise ValueError(f"Unsupported job type: {job_type}")
            
            # Update job with results
            processing_time = time.time() - start_time
            VIDEO_PROCESSING_DURATION.labels(job_type=job_type.value).observe(processing_time)
            
            job_data.update({
                'status': 'completed',
                'end_time': datetime.utcnow(),
                'progress': 100.0,
                'results': result,
                'processing_time': processing_time
            })
            
            # Update database
            with self.SessionLocal() as db:
                db_job = db.query(VideoProcessingJob).filter(VideoProcessingJob.id == job_id).first()
                if db_job:
                    db_job.status = 'completed'
                    db_job.end_time = datetime.utcnow()
                    db_job.progress = 100.0
                    db_job.results = result
                    db.commit()
            
            logger.info(f"Video processing job {job_id} completed in {processing_time:.2f} seconds")
            
        except Exception as e:
            logger.error(f"Video processing job {job_id} failed: {e}")
            
            job_data.update({
                'status': 'failed',
                'end_time': datetime.utcnow(),
                'error_message': str(e)
            })
            
            # Update database
            with self.SessionLocal() as db:
                db_job = db.query(VideoProcessingJob).filter(VideoProcessingJob.id == job_id).first()
                if db_job:
                    db_job.status = 'failed'
                    db_job.end_time = datetime.utcnow()
                    db_job.error_message = str(e)
                    db.commit()
            
        finally:
            ACTIVE_VIDEO_PROCESSING_JOBS.dec()
    
    async def _execute_object_detection(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute object detection on video"""
        
        logger.info("Starting object detection...")
        
        video_path = job_data['video_path']
        config = job_data['config']
        
        # Open video
        cap = cv2.VideoCapture(str(video_path))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        detections_by_frame = {}
        processed_frames = 0
        
        # Process frames
        frame_number = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Skip frames if configured
            if frame_number % config.frame_skip != 0:
                frame_number += 1
                continue
            
            # Run detection
            results = self.models['yolo'](frame, conf=config.detection_threshold)
            
            # Parse results
            frame_detections = []
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Extract detection data
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        conf = box.conf[0].cpu().numpy()
                        cls = int(box.cls[0].cpu().numpy())
                        
                        # Normalize coordinates
                        height, width = frame.shape[:2]
                        bbox = BoundingBox(
                            x=x1 / width,
                            y=y1 / height,
                            width=(x2 - x1) / width,
                            height=(y2 - y1) / height
                        )
                        
                        detection = Detection(
                            class_name=self.models['yolo'].names[cls],
                            confidence=float(conf),
                            bbox=bbox
                        )
                        
                        frame_detections.append(detection)
            
            detections_by_frame[frame_number] = frame_detections
            processed_frames += 1
            
            # Update progress
            progress = (frame_number / total_frames) * 100
            job_data['progress'] = progress
            
            FRAMES_PROCESSED.inc()
            
            frame_number += 1
            
            # Check for max frames limit
            if config.max_frames and processed_frames >= config.max_frames:
                break
        
        cap.release()
        
        # Generate summary statistics
        total_detections = sum(len(dets) for dets in detections_by_frame.values())
        class_counts = {}
        
        for frame_dets in detections_by_frame.values():
            for det in frame_dets:
                class_counts[det.class_name] = class_counts.get(det.class_name, 0) + 1
        
        # Save annotated video if requested
        output_path = None
        if config.save_video:
            output_path = await self._create_annotated_video(
                video_path, detections_by_frame, job_data['id']
            )
        
        return {
            'detections_by_frame': {k: [det.dict() for det in v] for k, v in detections_by_frame.items()},
            'summary': {
                'total_frames_processed': processed_frames,
                'total_detections': total_detections,
                'class_counts': class_counts,
                'fps': fps,
                'processing_fps': processed_frames / job_data.get('processing_time', 1)
            },
            'output_video': str(output_path) if output_path else None
        }
    
    async def _execute_object_tracking(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute multi-object tracking on video"""
        
        logger.info("Starting object tracking...")
        
        video_path = job_data['video_path']
        config = job_data['config']
        
        # Initialize tracker
        tracker = DeepSort(
            max_age=config.max_age,
            n_init=config.min_hits,
            max_iou_distance=config.iou_threshold
        )
        
        # Open video
        cap = cv2.VideoCapture(str(video_path))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        tracks_by_frame = {}
        all_tracks = {}
        processed_frames = 0
        
        frame_number = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Skip frames if configured
            if frame_number % config.frame_skip != 0:
                frame_number += 1
                continue
            
            # Run detection
            results = self.models['yolo'](frame, conf=config.detection_threshold)
            
            # Prepare detections for tracker
            detections = []
            confidences = []
            class_names = []
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        conf = box.conf[0].cpu().numpy()
                        cls = int(box.cls[0].cpu().numpy())
                        
                        detections.append([x1, y1, x2, y2])
                        confidences.append(conf)
                        class_names.append(self.models['yolo'].names[cls])
            
            # Update tracker
            if detections:
                tracks = tracker.update_tracks(
                    detections, 
                    confidences=confidences,
                    classes=class_names,
                    frame=frame
                )
            else:
                tracks = tracker.update_tracks([], frame=frame)
            
            # Process tracks
            frame_tracks = []
            for track in tracks:
                if track.is_confirmed():
                    track_id = str(track.track_id)
                    bbox = track.to_ltrb()
                    
                    # Normalize coordinates
                    height, width = frame.shape[:2]
                    normalized_bbox = BoundingBox(
                        x=bbox[0] / width,
                        y=bbox[1] / height,
                        width=(bbox[2] - bbox[0]) / width,
                        height=(bbox[3] - bbox[1]) / height
                    )
                    
                    detection = Detection(
                        class_name=track.get_det_class() or "unknown",
                        confidence=track.get_det_conf() or 0.0,
                        bbox=normalized_bbox
                    )
                    
                    frame_tracks.append((track_id, detection))
                    
                    # Update track history
                    if track_id not in all_tracks:
                        all_tracks[track_id] = {
                            'track_id': track_id,
                            'class_name': detection.class_name,
                            'detections': [],
                            'start_frame': frame_number,
                            'end_frame': frame_number,
                            'confidences': []
                        }
                    
                    all_tracks[track_id]['detections'].append((frame_number, detection))
                    all_tracks[track_id]['end_frame'] = frame_number
                    all_tracks[track_id]['confidences'].append(detection.confidence)
                    
                    OBJECTS_TRACKED.inc()
            
            tracks_by_frame[frame_number] = frame_tracks
            processed_frames += 1
            
            # Update progress
            progress = (frame_number / total_frames) * 100
            job_data['progress'] = progress
            
            frame_number += 1
            
            # Check for max frames limit
            if config.max_frames and processed_frames >= config.max_frames:
                break
        
        cap.release()
        
        # Process track statistics
        track_summary = []
        for track_id, track_data in all_tracks.items():
            track_summary.append({
                'track_id': track_id,
                'class_name': track_data['class_name'],
                'start_frame': track_data['start_frame'],
                'end_frame': track_data['end_frame'],
                'duration_frames': track_data['end_frame'] - track_data['start_frame'] + 1,
                'duration_seconds': (track_data['end_frame'] - track_data['start_frame'] + 1) / fps,
                'avg_confidence': np.mean(track_data['confidences']) if track_data['confidences'] else 0.0,
                'detection_count': len(track_data['detections'])
            })
        
        # Save annotated video if requested
        output_path = None
        if config.save_video:
            output_path = await self._create_tracking_video(
                video_path, tracks_by_frame, job_data['id']
            )
        
        return {
            'tracks_by_frame': {k: [(tid, det.dict()) for tid, det in v] for k, v in tracks_by_frame.items()},
            'track_summary': track_summary,
            'summary': {
                'total_frames_processed': processed_frames,
                'total_tracks': len(all_tracks),
                'fps': fps,
                'tracking_method': config.tracking_method.value
            },
            'output_video': str(output_path) if output_path else None
        }
    
    async def _execute_action_recognition(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute action recognition on video"""
        
        logger.info("Starting action recognition...")
        
        video_path = job_data['video_path']
        config = job_data['config']
        
        # Load video frames
        cap = cv2.VideoCapture(str(video_path))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        frames = []
        frame_number = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Convert BGR to RGB and resize
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame_resized = cv2.resize(frame_rgb, (224, 224))
            frames.append(frame_resized)
            
            frame_number += 1
            
            if config.max_frames and frame_number >= config.max_frames:
                break
        
        cap.release()
        
        # Process video in temporal windows
        window_size = config.temporal_window
        actions_detected = []
        
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        for start_idx in range(0, len(frames) - window_size + 1, window_size // 2):
            window_frames = frames[start_idx:start_idx + window_size]
            
            # Convert to tensor
            tensor_frames = []
            for frame in window_frames:
                frame_tensor = transform(frame)
                tensor_frames.append(frame_tensor)
            
            video_tensor = torch.stack(tensor_frames).unsqueeze(0).to(DEVICE)  # (1, T, C, H, W)
            
            # Run action recognition
            with torch.no_grad():
                outputs = self.models['action_recognition'](video_tensor)
                probabilities = F.softmax(outputs, dim=1)
                predicted_class = torch.argmax(probabilities, dim=1).item()
                confidence = probabilities[0, predicted_class].item()
            
            # Map to action name (simplified mapping)
            action_names = [
                "walking", "running", "sitting", "standing", "jumping",
                "waving", "clapping", "eating", "drinking", "talking"
            ]
            action_name = action_names[predicted_class % len(action_names)]
            
            actions_detected.append({
                'start_frame': start_idx,
                'end_frame': start_idx + window_size - 1,
                'start_time': start_idx / fps,
                'end_time': (start_idx + window_size - 1) / fps,
                'action': action_name,
                'confidence': confidence
            })
            
            # Update progress
            progress = (start_idx / len(frames)) * 100
            job_data['progress'] = progress
        
        # Aggregate results
        action_counts = {}
        for action in actions_detected:
            action_name = action['action']
            action_counts[action_name] = action_counts.get(action_name, 0) + 1
        
        return {
            'actions_detected': actions_detected,
            'summary': {
                'total_frames_processed': len(frames),
                'total_actions_detected': len(actions_detected),
                'action_counts': action_counts,
                'fps': fps,
                'temporal_window_size': window_size
            }
        }
    
    async def _execute_temporal_interpolation(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute temporal interpolation for sparse annotations"""
        
        logger.info("Starting temporal interpolation...")
        
        # This is a simplified implementation
        # In practice, you would have sparse annotations and interpolate between them
        
        video_path = job_data['video_path']
        config = job_data['config']
        
        # Mock sparse annotations (in practice, these would come from user input)
        sparse_annotations = {
            0: [{'class': 'person', 'bbox': [0.1, 0.1, 0.3, 0.8]}],
            30: [{'class': 'person', 'bbox': [0.4, 0.1, 0.3, 0.8]}],
            60: [{'class': 'person', 'bbox': [0.7, 0.1, 0.3, 0.8]}]
        }
        
        # Interpolate between sparse annotations
        interpolated_annotations = {}
        
        sparse_frames = sorted(sparse_annotations.keys())
        for i in range(len(sparse_frames) - 1):
            start_frame = sparse_frames[i]
            end_frame = sparse_frames[i + 1]
            
            start_annotations = sparse_annotations[start_frame]
            end_annotations = sparse_annotations[end_frame]
            
            # Simple linear interpolation
            for frame in range(start_frame, end_frame + 1):
                t = (frame - start_frame) / (end_frame - start_frame) if end_frame != start_frame else 0
                
                frame_annotations = []
                for start_ann, end_ann in zip(start_annotations, end_annotations):
                    # Interpolate bounding box
                    start_bbox = start_ann['bbox']
                    end_bbox = end_ann['bbox']
                    
                    interpolated_bbox = [
                        start_bbox[0] + t * (end_bbox[0] - start_bbox[0]),
                        start_bbox[1] + t * (end_bbox[1] - start_bbox[1]),
                        start_bbox[2] + t * (end_bbox[2] - start_bbox[2]),
                        start_bbox[3] + t * (end_bbox[3] - start_bbox[3])
                    ]
                    
                    frame_annotations.append({
                        'class': start_ann['class'],
                        'bbox': interpolated_bbox,
                        'interpolated': frame not in sparse_frames,
                        'confidence': 1.0 if frame in sparse_frames else 0.8
                    })
                
                interpolated_annotations[frame] = frame_annotations
        
        return {
            'interpolated_annotations': interpolated_annotations,
            'sparse_annotations': sparse_annotations,
            'summary': {
                'sparse_frame_count': len(sparse_frames),
                'interpolated_frame_count': len(interpolated_annotations),
                'interpolation_ratio': len(interpolated_annotations) / len(sparse_frames) if sparse_frames else 0
            }
        }
    
    async def _execute_video_enhancement(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute video enhancement (denoising, stabilization, super-resolution)"""
        
        logger.info("Starting video enhancement...")
        
        video_path = job_data['video_path']
        config = job_data['config']
        output_path = Path(OUTPUT_DIR) / f"{job_data['id']}_enhanced.mp4"
        
        # Build FFmpeg filter chain
        filters = []
        
        if config.denoise:
            filters.append("hqdn3d")  # High quality denoise
        
        if config.stabilization:
            filters.append("vidstabdetect")  # Video stabilization
        
        # Apply filters using FFmpeg
        input_stream = ffmpeg.input(str(video_path))
        
        if filters:
            filter_chain = ",".join(filters)
            output_stream = input_stream.filter_complex(filter_chain)
        else:
            output_stream = input_stream
        
        try:
            (
                output_stream
                .output(str(output_path), vcodec='libx264', acodec='aac', crf=18)
                .overwrite_output()
                .run(quiet=True)
            )
        except Exception as e:
            logger.error(f"Video enhancement failed: {e}")
            output_path = None
        
        # Get enhancement metrics
        enhancement_metrics = {}
        if output_path and output_path.exists():
            original_size = os.path.getsize(video_path)
            enhanced_size = os.path.getsize(output_path)
            
            enhancement_metrics = {
                'original_file_size': original_size,
                'enhanced_file_size': enhanced_size,
                'size_change_ratio': enhanced_size / original_size if original_size > 0 else 0,
                'filters_applied': filters
            }
        
        return {
            'enhanced_video_path': str(output_path) if output_path else None,
            'enhancement_metrics': enhancement_metrics,
            'summary': {
                'denoise_applied': config.denoise,
                'stabilization_applied': config.stabilization,
                'super_resolution_applied': config.super_resolution
            }
        }
    
    async def _execute_motion_analysis(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute motion analysis on video"""
        
        logger.info("Starting motion analysis...")
        
        video_path = job_data['video_path']
        config = job_data['config']
        
        cap = cv2.VideoCapture(str(video_path))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        # Initialize optical flow
        flow_analyzer = cv2.FarnebackOpticalFlow_create()
        
        motion_data = []
        prev_frame = None
        frame_number = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            if prev_frame is not None:
                # Calculate optical flow
                flow = cv2.calcOpticalFlowPyrLK(
                    prev_frame, gray, None, None
                )
                
                # Analyze motion
                motion_magnitude = np.mean(np.sqrt(flow[..., 0]**2 + flow[..., 1]**2))
                motion_direction = np.mean(np.arctan2(flow[..., 1], flow[..., 0]))
                
                motion_data.append({
                    'frame': frame_number,
                    'timestamp': frame_number / fps,
                    'motion_magnitude': float(motion_magnitude),
                    'motion_direction': float(motion_direction)
                })
            
            prev_frame = gray.copy()
            frame_number += 1
            
            # Update progress
            job_data['progress'] = (frame_number / cap.get(cv2.CAP_PROP_FRAME_COUNT)) * 100
            
            if config.max_frames and frame_number >= config.max_frames:
                break
        
        cap.release()
        
        # Analyze motion patterns
        motion_magnitudes = [m['motion_magnitude'] for m in motion_data]
        motion_summary = {
            'avg_motion': np.mean(motion_magnitudes) if motion_magnitudes else 0,
            'max_motion': np.max(motion_magnitudes) if motion_magnitudes else 0,
            'motion_variance': np.var(motion_magnitudes) if motion_magnitudes else 0,
            'total_frames_analyzed': len(motion_data)
        }
        
        return {
            'motion_data': motion_data,
            'motion_summary': motion_summary
        }
    
    async def _create_annotated_video(
        self,
        input_video_path: str,
        detections_by_frame: Dict[int, List[Detection]],
        job_id: str
    ) -> Path:
        """Create annotated video with detection overlays"""
        
        output_path = Path(OUTPUT_DIR) / f"{job_id}_annotated.mp4"
        
        cap = cv2.VideoCapture(input_video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Create video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))
        
        frame_number = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Draw detections if available
            if frame_number in detections_by_frame:
                for detection in detections_by_frame[frame_number]:
                    bbox = detection.bbox
                    
                    # Convert normalized coordinates to pixel coordinates
                    x1 = int(bbox.x * width)
                    y1 = int(bbox.y * height)
                    x2 = int((bbox.x + bbox.width) * width)
                    y2 = int((bbox.y + bbox.height) * height)
                    
                    # Draw bounding box
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    
                    # Draw label
                    label = f"{detection.class_name}: {detection.confidence:.2f}"
                    cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            out.write(frame)
            frame_number += 1
        
        cap.release()
        out.release()
        
        return output_path
    
    async def _create_tracking_video(
        self,
        input_video_path: str,
        tracks_by_frame: Dict[int, List[Tuple[str, Detection]]],
        job_id: str
    ) -> Path:
        """Create annotated video with tracking overlays"""
        
        output_path = Path(OUTPUT_DIR) / f"{job_id}_tracked.mp4"
        
        cap = cv2.VideoCapture(input_video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Create video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))
        
        # Color mapping for tracks
        track_colors = {}
        
        frame_number = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Draw tracks if available
            if frame_number in tracks_by_frame:
                for track_id, detection in tracks_by_frame[frame_number]:
                    # Assign color to track
                    if track_id not in track_colors:
                        color = (
                            np.random.randint(0, 255),
                            np.random.randint(0, 255),
                            np.random.randint(0, 255)
                        )
                        track_colors[track_id] = color
                    else:
                        color = track_colors[track_id]
                    
                    bbox = detection.bbox
                    
                    # Convert normalized coordinates to pixel coordinates
                    x1 = int(bbox.x * width)
                    y1 = int(bbox.y * height)
                    x2 = int((bbox.x + bbox.width) * width)
                    y2 = int((bbox.y + bbox.height) * height)
                    
                    # Draw bounding box
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    
                    # Draw track ID and label
                    label = f"ID:{track_id} {detection.class_name}: {detection.confidence:.2f}"
                    cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
            out.write(frame)
            frame_number += 1
        
        cap.release()
        out.release()
        
        return output_path
    
    async def get_job_status(self, job_id: str) -> VideoProcessingResponse:
        """Get job status"""
        
        if job_id not in self.active_jobs:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job_data = self.active_jobs[job_id]
        
        return VideoProcessingResponse(
            job_id=job_id,
            status=job_data['status'],
            name=job_data['name'],
            job_type=job_data['job_type'],
            progress=job_data.get('progress', 0.0),
            video_info=job_data.get('video_info'),
            results=job_data.get('results'),
            output_url=job_data.get('output_url'),
            created_at=job_data['created_at'],
            processing_time=job_data.get('processing_time')
        )
    
    async def list_jobs(self, limit: int = 50) -> List[VideoProcessingResponse]:
        """List processing jobs"""
        
        jobs = []
        for job_id, job_data in list(self.active_jobs.items())[-limit:]:
            jobs.append(VideoProcessingResponse(
                job_id=job_id,
                status=job_data['status'],
                name=job_data['name'],
                job_type=job_data['job_type'],
                progress=job_data.get('progress', 0.0),
                video_info=job_data.get('video_info'),
                results=job_data.get('results'),
                output_url=job_data.get('output_url'),
                created_at=job_data['created_at'],
                processing_time=job_data.get('processing_time')
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
            "ffmpeg_available": shutil.which(FFMPEG_PATH) is not None
        }

# Initialize service
service = VideoProcessingService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting AnnotateAI Video Processing Service")
    yield
    logger.info("Shutting down AnnotateAI Video Processing Service")

# Create FastAPI app
app = FastAPI(
    title="AnnotateAI Video Processing Service",
    description="Advanced video analysis, multi-object tracking, and temporal annotation",
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

# Mount static files for outputs
app.mount("/static", StaticFiles(directory=OUTPUT_DIR), name="static")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "device": DEVICE,
        "ffmpeg_available": shutil.which(FFMPEG_PATH) is not None
    }

@app.post("/video/process", response_model=VideoProcessingResponse)
async def create_video_processing_job(
    request: VideoProcessingRequest,
    background_tasks: BackgroundTasks,
    video_file: Optional[UploadFile] = File(None)
):
    """Create a new video processing job"""
    return await service.create_processing_job(request, background_tasks, video_file)

@app.get("/video/jobs/{job_id}", response_model=VideoProcessingResponse)
async def get_video_processing_job(job_id: str):
    """Get video processing job status"""
    return await service.get_job_status(job_id)

@app.get("/video/jobs", response_model=List[VideoProcessingResponse])
async def list_video_processing_jobs(limit: int = 50):
    """List video processing jobs"""
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

@app.get("/video/download/{file_path:path}")
async def download_video_file(file_path: str):
    """Download processed video files"""
    full_path = Path(OUTPUT_DIR) / file_path
    if full_path.exists() and full_path.is_file():
        return FileResponse(full_path)
    else:
        raise HTTPException(status_code=404, detail="File not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 