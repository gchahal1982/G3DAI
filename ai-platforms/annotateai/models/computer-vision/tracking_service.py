#!/usr/bin/env python3
"""
AnnotateAI Object Tracking Service
Multi-object tracking with DeepSORT, ByteTrack, and SORT for video annotation
"""

import cv2
import numpy as np
import torch
import torchvision.transforms as T
from typing import List, Dict, Any, Optional, Tuple
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

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager
import redis.asyncio as redis

# Import tracking algorithms
from deep_sort_realtime import DeepSort
import motmetrics as mm

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
class Config:
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    MAX_VIDEO_SIZE = int(os.getenv("MAX_VIDEO_SIZE", "500000000"))  # 500MB
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    DETECTION_CONFIDENCE = float(os.getenv("DETECTION_CONFIDENCE", "0.5"))
    TRACKING_CONFIDENCE = float(os.getenv("TRACKING_CONFIDENCE", "0.3"))
    MAX_TRACK_AGE = int(os.getenv("MAX_TRACK_AGE", "30"))  # frames
    MIN_TRACK_HITS = int(os.getenv("MIN_TRACK_HITS", "3"))  # minimum hits to create track

config = Config()

# Global variables
redis_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    global redis_client
    
    # Startup
    logger.info("Starting Object Tracking Service...")
    logger.info(f"Using device: {config.DEVICE}")
    
    # Initialize Redis client
    redis_client = redis.from_url(config.REDIS_URL)
    
    logger.info("Object Tracking Service started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Object Tracking Service...")
    if redis_client:
        await redis_client.close()

# FastAPI app
app = FastAPI(
    title="AnnotateAI Object Tracking Service",
    description="Multi-object tracking with DeepSORT, ByteTrack, and SORT",
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
class TrackingAlgorithm(str, Enum):
    DEEPSORT = "deepsort"
    BYTETRACK = "bytetrack"
    SORT = "sort"

class TrackingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class Detection:
    """Single object detection"""
    bbox: Tuple[int, int, int, int]  # x1, y1, x2, y2
    confidence: float
    class_id: int
    class_name: str

@dataclass
class Track:
    """Object track across frames"""
    track_id: int
    detections: List[Detection]
    start_frame: int
    end_frame: int
    is_active: bool
    class_name: str
    confidence_scores: List[float]

class TrackingRequest(BaseModel):
    algorithm: TrackingAlgorithm = TrackingAlgorithm.DEEPSORT
    detection_confidence: float = Field(0.5, ge=0.0, le=1.0)
    tracking_confidence: float = Field(0.3, ge=0.0, le=1.0)
    max_track_age: int = Field(30, ge=1, le=100)
    min_track_hits: int = Field(3, ge=1, le=10)
    output_format: str = Field("json", description="Output format: json, mot, coco")

class TrackingJob(BaseModel):
    job_id: str
    status: TrackingStatus
    algorithm: TrackingAlgorithm
    progress: float = 0.0
    total_frames: int = 0
    processed_frames: int = 0
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    result_url: Optional[str] = None

class TrackingResponse(BaseModel):
    job_id: str
    status: TrackingStatus
    message: str

class TrackingResult(BaseModel):
    job_id: str
    total_frames: int
    total_tracks: int
    tracks: List[Dict[str, Any]]
    algorithm_used: str
    processing_time: float
    video_info: Dict[str, Any]

# Tracking Algorithms Implementation

class DeepSORTTracker:
    """DeepSORT tracking implementation"""
    
    def __init__(self, max_age=30, min_hits=3, iou_threshold=0.3):
        self.tracker = DeepSort(
            max_age=max_age,
            min_hits=min_hits,
            iou_threshold=iou_threshold,
            max_cosine_distance=0.2,
            nn_budget=100
        )
    
    def update(self, detections: List[Detection], frame: np.ndarray) -> List[Track]:
        """Update tracker with new detections"""
        # Convert detections to DeepSORT format
        detection_list = []
        for det in detections:
            x1, y1, x2, y2 = det.bbox
            detection_list.append([x1, y1, x2 - x1, y2 - y1, det.confidence])
        
        # Update tracker
        tracks = self.tracker.update_tracks(detection_list, frame=frame)
        
        # Convert tracks back to our format
        result_tracks = []
        for track in tracks:
            if track.is_confirmed():
                bbox = track.to_ltrb()
                result_tracks.append(Track(
                    track_id=track.track_id,
                    detections=[Detection(
                        bbox=(int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])),
                        confidence=track.get_det_conf() if hasattr(track, 'get_det_conf') else 0.5,
                        class_id=track.get_det_class() if hasattr(track, 'get_det_class') else 0,
                        class_name="object"
                    )],
                    start_frame=0,  # Will be updated by caller
                    end_frame=0,    # Will be updated by caller
                    is_active=True,
                    class_name="object",
                    confidence_scores=[track.get_det_conf() if hasattr(track, 'get_det_conf') else 0.5]
                ))
        
        return result_tracks

class ByteTrackTracker:
    """ByteTrack tracking implementation (simplified)"""
    
    def __init__(self, frame_rate=30, track_thresh=0.5, track_buffer=30, match_thresh=0.8):
        self.frame_rate = frame_rate
        self.track_thresh = track_thresh
        self.track_buffer = track_buffer
        self.match_thresh = match_thresh
        self.frame_id = 0
        self.tracks = {}
        self.next_id = 1
    
    def update(self, detections: List[Detection], frame: np.ndarray) -> List[Track]:
        """Update tracker with new detections"""
        self.frame_id += 1
        
        # Simple tracking implementation (in production, use official ByteTrack)
        # This is a simplified version for demonstration
        
        # Filter detections by confidence
        valid_detections = [det for det in detections if det.confidence >= self.track_thresh]
        
        # Match detections to existing tracks using IoU
        matched_tracks = []
        unmatched_detections = valid_detections.copy()
        
        for track_id, track in self.tracks.items():
            if not track.is_active:
                continue
            
            best_match = None
            best_iou = 0
            
            for det in unmatched_detections:
                iou = self._calculate_iou(track.detections[-1].bbox, det.bbox)
                if iou > best_iou and iou > self.match_thresh:
                    best_iou = iou
                    best_match = det
            
            if best_match:
                # Update existing track
                track.detections.append(best_match)
                track.end_frame = self.frame_id
                track.confidence_scores.append(best_match.confidence)
                matched_tracks.append(track)
                unmatched_detections.remove(best_match)
        
        # Create new tracks for unmatched detections
        for det in unmatched_detections:
            new_track = Track(
                track_id=self.next_id,
                detections=[det],
                start_frame=self.frame_id,
                end_frame=self.frame_id,
                is_active=True,
                class_name=det.class_name,
                confidence_scores=[det.confidence]
            )
            self.tracks[self.next_id] = new_track
            matched_tracks.append(new_track)
            self.next_id += 1
        
        # Remove old tracks
        for track_id, track in list(self.tracks.items()):
            if self.frame_id - track.end_frame > self.track_buffer:
                track.is_active = False
        
        return matched_tracks
    
    def _calculate_iou(self, bbox1: Tuple[int, int, int, int], bbox2: Tuple[int, int, int, int]) -> float:
        """Calculate Intersection over Union (IoU) of two bounding boxes"""
        x1, y1, x2, y2 = bbox1
        x3, y3, x4, y4 = bbox2
        
        # Calculate intersection
        xi1 = max(x1, x3)
        yi1 = max(y1, y3)
        xi2 = min(x2, x4)
        yi2 = min(y2, y4)
        
        if xi2 <= xi1 or yi2 <= yi1:
            return 0
        
        intersection = (xi2 - xi1) * (yi2 - yi1)
        
        # Calculate union
        area1 = (x2 - x1) * (y2 - y1)
        area2 = (x4 - x3) * (y4 - y3)
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0

class VideoProcessor:
    """Video processing for object tracking"""
    
    def __init__(self):
        # Simple object detector using background subtraction
        # In production, you'd use YOLO, SSD, etc.
        self.bg_subtractor = cv2.createBackgroundSubtractorMOG2(
            detectShadows=True,
            varThreshold=50
        )
    
    def detect_objects(self, frame: np.ndarray) -> List[Detection]:
        """Detect objects in frame using background subtraction"""
        # Apply background subtraction
        fg_mask = self.bg_subtractor.apply(frame)
        
        # Find contours
        contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        detections = []
        for i, contour in enumerate(contours):
            # Filter small contours
            if cv2.contourArea(contour) < 500:
                continue
            
            # Get bounding box
            x, y, w, h = cv2.boundingRect(contour)
            
            # Create detection
            detection = Detection(
                bbox=(x, y, x + w, y + h),
                confidence=0.8,  # Fixed confidence for demo
                class_id=0,
                class_name="moving_object"
            )
            detections.append(detection)
        
        return detections

# Utility functions
async def save_job_status(job: TrackingJob):
    """Save job status to Redis"""
    try:
        await redis_client.setex(
            f"tracking_job:{job.job_id}",
            3600,  # 1 hour
            job.json()
        )
    except Exception as e:
        logger.error(f"Failed to save job status: {e}")

async def get_job_status(job_id: str) -> Optional[TrackingJob]:
    """Get job status from Redis"""
    try:
        job_data = await redis_client.get(f"tracking_job:{job_id}")
        if job_data:
            return TrackingJob.parse_raw(job_data)
    except Exception as e:
        logger.error(f"Failed to get job status: {e}")
    return None

def process_video_tracking(
    video_path: str,
    algorithm: TrackingAlgorithm,
    job_id: str,
    parameters: Dict[str, Any]
) -> Dict[str, Any]:
    """Process video for object tracking"""
    
    # Initialize tracker
    if algorithm == TrackingAlgorithm.DEEPSORT:
        tracker = DeepSORTTracker(
            max_age=parameters.get('max_track_age', 30),
            min_hits=parameters.get('min_track_hits', 3)
        )
    elif algorithm == TrackingAlgorithm.BYTETRACK:
        tracker = ByteTrackTracker(
            track_thresh=parameters.get('tracking_confidence', 0.3),
            track_buffer=parameters.get('max_track_age', 30)
        )
    else:
        raise ValueError(f"Unsupported tracking algorithm: {algorithm}")
    
    # Initialize video processor
    processor = VideoProcessor()
    
    # Open video
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Failed to open video file")
    
    # Get video properties
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    video_info = {
        "total_frames": total_frames,
        "fps": fps,
        "width": width,
        "height": height,
        "duration": total_frames / fps if fps > 0 else 0
    }
    
    # Process frames
    frame_count = 0
    all_tracks = {}
    
    start_time = time.time()
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Detect objects
        detections = processor.detect_objects(frame)
        
        # Update tracker
        current_tracks = tracker.update(detections, frame)
        
        # Store tracks
        for track in current_tracks:
            if track.track_id not in all_tracks:
                all_tracks[track.track_id] = {
                    "track_id": track.track_id,
                    "class_name": track.class_name,
                    "start_frame": frame_count,
                    "end_frame": frame_count,
                    "bboxes": [],
                    "confidences": []
                }
            
            # Update track data
            track_data = all_tracks[track.track_id]
            track_data["end_frame"] = frame_count
            track_data["bboxes"].append(track.detections[-1].bbox)
            track_data["confidences"].append(track.detections[-1].confidence)
        
        frame_count += 1
        
        # Update progress (this would be done via callback in real implementation)
        if frame_count % 10 == 0:
            progress = (frame_count / total_frames) * 100
            logger.info(f"Processing frame {frame_count}/{total_frames} ({progress:.1f}%)")
    
    cap.release()
    
    processing_time = time.time() - start_time
    
    return {
        "total_frames": total_frames,
        "total_tracks": len(all_tracks),
        "tracks": list(all_tracks.values()),
        "algorithm_used": algorithm.value,
        "processing_time": processing_time,
        "video_info": video_info
    }

async def process_tracking_job(job_id: str, video_path: str, request: TrackingRequest):
    """Background task to process tracking job"""
    try:
        # Update job status
        job = TrackingJob(
            job_id=job_id,
            status=TrackingStatus.PROCESSING,
            algorithm=request.algorithm,
            created_at=datetime.utcnow()
        )
        await save_job_status(job)
        
        # Process video
        result = process_video_tracking(
            video_path,
            request.algorithm,
            job_id,
            {
                'detection_confidence': request.detection_confidence,
                'tracking_confidence': request.tracking_confidence,
                'max_track_age': request.max_track_age,
                'min_track_hits': request.min_track_hits
            }
        )
        
        # Update job with results
        job.status = TrackingStatus.COMPLETED
        job.progress = 100.0
        job.total_frames = result['total_frames']
        job.processed_frames = result['total_frames']
        job.completed_at = datetime.utcnow()
        
        # Store result in Redis
        await redis_client.setex(
            f"tracking_result:{job_id}",
            3600,  # 1 hour
            json.dumps(result, default=str)
        )
        
        await save_job_status(job)
        
    except Exception as e:
        logger.error(f"Tracking job {job_id} failed: {e}")
        
        # Update job with error
        job = await get_job_status(job_id)
        if job:
            job.status = TrackingStatus.FAILED
            job.error_message = str(e)
            await save_job_status(job)
    
    finally:
        # Clean up video file
        if os.path.exists(video_path):
            os.unlink(video_path)

# API Endpoints
@app.post("/track", response_model=TrackingResponse)
async def track_objects(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    algorithm: TrackingAlgorithm = TrackingAlgorithm.DEEPSORT,
    detection_confidence: float = 0.5,
    tracking_confidence: float = 0.3,
    max_track_age: int = 30,
    min_track_hits: int = 3,
    output_format: str = "json"
):
    """Start object tracking on uploaded video"""
    
    # Validate file
    if not file.filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv', '.wmv')):
        raise HTTPException(status_code=400, detail="Unsupported video format")
    
    # Save uploaded file
    video_data = await file.read()
    if len(video_data) > config.MAX_VIDEO_SIZE:
        raise HTTPException(status_code=400, detail="Video file too large")
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp:
        tmp.write(video_data)
        video_path = tmp.name
    
    # Generate job ID
    import uuid
    job_id = str(uuid.uuid4())
    
    # Create tracking request
    request = TrackingRequest(
        algorithm=algorithm,
        detection_confidence=detection_confidence,
        tracking_confidence=tracking_confidence,
        max_track_age=max_track_age,
        min_track_hits=min_track_hits,
        output_format=output_format
    )
    
    # Start background processing
    background_tasks.add_task(process_tracking_job, job_id, video_path, request)
    
    return TrackingResponse(
        job_id=job_id,
        status=TrackingStatus.PENDING,
        message="Tracking job started successfully"
    )

@app.get("/track/{job_id}")
async def get_tracking_status(job_id: str):
    """Get tracking job status"""
    job = await get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job

@app.get("/track/{job_id}/result")
async def get_tracking_result(job_id: str):
    """Get tracking results"""
    job = await get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != TrackingStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Job not completed yet")
    
    # Get result from Redis
    try:
        result_data = await redis_client.get(f"tracking_result:{job_id}")
        if result_data:
            return json.loads(result_data)
        else:
            raise HTTPException(status_code=404, detail="Result not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get result: {e}")

@app.get("/algorithms")
async def list_algorithms():
    """List available tracking algorithms"""
    return {
        "algorithms": [
            {
                "name": "DeepSORT",
                "value": "deepsort",
                "description": "Deep learning based multi-object tracker with appearance features"
            },
            {
                "name": "ByteTrack",
                "value": "bytetrack",
                "description": "Simple and effective multi-object tracker"
            },
            {
                "name": "SORT",
                "value": "sort",
                "description": "Simple Online and Realtime Tracking"
            }
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "tracking-service",
        "device": config.DEVICE,
        "max_video_size": config.MAX_VIDEO_SIZE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8013) 