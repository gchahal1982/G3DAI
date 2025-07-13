#!/usr/bin/env python3
"""
AnnotateAI Asset Processor Service
Advanced processing for images, videos, 3D models, and quality validation
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
import asyncio
import logging
from datetime import datetime
import os
import tempfile
import json
import uuid
from enum import Enum
import redis.asyncio as redis
import boto3
from botocore.exceptions import ClientError
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import trimesh
import open3d as o3d
from moviepy.editor import VideoFileClip
import pydicom
import nibabel as nib
from skimage import metrics, filters, morphology
import librosa
import soundfile as sf
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
class Config:
    # S3 Configuration
    S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL", "http://localhost:9000")
    S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "annotateai")
    S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", "annotateai123")
    S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "annotateai-storage")
    S3_REGION = os.getenv("S3_REGION", "us-east-1")
    
    # Redis for job queue
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Processing limits
    MAX_IMAGE_SIZE = (8192, 8192)
    MAX_VIDEO_DURATION = 7200  # 2 hours
    MAX_3D_MODEL_SIZE = 1000000000  # 1GB
    
    # Quality thresholds
    MIN_IMAGE_QUALITY = 0.5
    MIN_VIDEO_QUALITY = 0.3
    MIN_3D_QUALITY = 0.4

config = Config()

# Global clients
s3_client = None
redis_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    global s3_client, redis_client
    
    # Startup
    logger.info("Starting Asset Processor Service...")
    
    # Initialize S3 client
    s3_client = boto3.client(
        's3',
        endpoint_url=config.S3_ENDPOINT_URL,
        aws_access_key_id=config.S3_ACCESS_KEY,
        aws_secret_access_key=config.S3_SECRET_KEY,
        region_name=config.S3_REGION
    )
    
    # Initialize Redis client
    redis_client = redis.from_url(config.REDIS_URL)
    
    yield
    
    # Shutdown
    logger.info("Shutting down Asset Processor Service...")
    if redis_client:
        await redis_client.close()

# FastAPI app
app = FastAPI(
    title="AnnotateAI Asset Processor Service",
    description="Advanced processing for images, videos, 3D models, and quality validation",
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

# Models
class ProcessingType(str, Enum):
    IMAGE_ENHANCEMENT = "image_enhancement"
    IMAGE_RESIZE = "image_resize"
    IMAGE_FORMAT_CONVERSION = "image_format_conversion"
    VIDEO_COMPRESSION = "video_compression"
    VIDEO_FRAME_EXTRACTION = "video_frame_extraction"
    VIDEO_STABILIZATION = "video_stabilization"
    MODEL_3D_OPTIMIZATION = "3d_model_optimization"
    MODEL_3D_REPAIR = "3d_model_repair"
    MODEL_3D_DECIMATION = "3d_model_decimation"
    QUALITY_VALIDATION = "quality_validation"
    DICOM_CONVERSION = "dicom_conversion"
    AUDIO_PROCESSING = "audio_processing"

class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ProcessingJob(BaseModel):
    id: str
    file_id: str
    processing_type: ProcessingType
    status: ProcessingStatus
    parameters: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    result: Dict[str, Any] = {}
    progress: float = 0.0

class ProcessingRequest(BaseModel):
    file_id: str
    processing_type: ProcessingType
    parameters: Dict[str, Any] = {}

class ProcessingResponse(BaseModel):
    job_id: str
    status: ProcessingStatus
    message: str

# Utility functions
async def get_file_from_s3(file_id: str, filename: str) -> str:
    """Download file from S3 to temporary location"""
    s3_key = f"files/{file_id}/v1/{file_id}{Path(filename).suffix}"
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=Path(filename).suffix)
    
    try:
        s3_client.download_file(config.S3_BUCKET_NAME, s3_key, temp_file.name)
        return temp_file.name
    except Exception as e:
        logger.error(f"Failed to download file from S3: {e}")
        raise HTTPException(status_code=500, detail="Failed to download file")

async def upload_result_to_s3(file_path: str, result_key: str):
    """Upload processed result to S3"""
    try:
        s3_client.upload_file(file_path, config.S3_BUCKET_NAME, result_key)
        return result_key
    except Exception as e:
        logger.error(f"Failed to upload result to S3: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload result")

async def save_job_status(job: ProcessingJob):
    """Save job status to Redis"""
    try:
        await redis_client.set(
            f"processing_job:{job.id}",
            job.json(),
            ex=86400  # 24 hours
        )
    except Exception as e:
        logger.error(f"Failed to save job status: {e}")

async def get_job_status(job_id: str) -> Optional[ProcessingJob]:
    """Get job status from Redis"""
    try:
        job_json = await redis_client.get(f"processing_job:{job_id}")
        if job_json:
            return ProcessingJob.parse_raw(job_json)
        return None
    except Exception as e:
        logger.error(f"Failed to get job status: {e}")
        return None

# Image processing functions
async def process_image_enhancement(input_path: str, output_path: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Enhance image quality"""
    try:
        with Image.open(input_path) as img:
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Apply enhancements
            if parameters.get('brightness'):
                enhancer = ImageEnhance.Brightness(img)
                img = enhancer.enhance(parameters['brightness'])
            
            if parameters.get('contrast'):
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(parameters['contrast'])
            
            if parameters.get('saturation'):
                enhancer = ImageEnhance.Color(img)
                img = enhancer.enhance(parameters['saturation'])
            
            if parameters.get('sharpness'):
                enhancer = ImageEnhance.Sharpness(img)
                img = enhancer.enhance(parameters['sharpness'])
            
            # Apply filters
            if parameters.get('noise_reduction'):
                img = img.filter(ImageFilter.MedianFilter(size=3))
            
            if parameters.get('edge_enhancement'):
                img = img.filter(ImageFilter.EDGE_ENHANCE)
            
            # Save enhanced image
            img.save(output_path, 'JPEG', quality=95)
            
            return {
                "original_size": os.path.getsize(input_path),
                "enhanced_size": os.path.getsize(output_path),
                "enhancement_applied": list(parameters.keys())
            }
            
    except Exception as e:
        logger.error(f"Image enhancement failed: {e}")
        raise

async def process_image_resize(input_path: str, output_path: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Resize image with quality preservation"""
    try:
        target_width = parameters.get('width', 1920)
        target_height = parameters.get('height', 1080)
        maintain_aspect = parameters.get('maintain_aspect', True)
        
        with Image.open(input_path) as img:
            original_size = img.size
            
            if maintain_aspect:
                img.thumbnail((target_width, target_height), Image.Resampling.LANCZOS)
            else:
                img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
            
            # Save resized image
            img.save(output_path, 'JPEG', quality=90)
            
            return {
                "original_size": original_size,
                "new_size": img.size,
                "compression_ratio": os.path.getsize(input_path) / os.path.getsize(output_path)
            }
            
    except Exception as e:
        logger.error(f"Image resize failed: {e}")
        raise

# Video processing functions
async def process_video_compression(input_path: str, output_path: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Compress video while maintaining quality"""
    try:
        target_bitrate = parameters.get('bitrate', '2M')
        target_fps = parameters.get('fps', 30)
        target_resolution = parameters.get('resolution', '1920x1080')
        
        with VideoFileClip(input_path) as video:
            # Apply compression settings
            compressed_video = video.resize(target_resolution.split('x'))
            
            if target_fps < video.fps:
                compressed_video = compressed_video.set_fps(target_fps)
            
            # Write compressed video
            compressed_video.write_videofile(
                output_path,
                codec='libx264',
                audio_codec='aac',
                bitrate=target_bitrate,
                preset='medium'
            )
            
            return {
                "original_size": os.path.getsize(input_path),
                "compressed_size": os.path.getsize(output_path),
                "compression_ratio": os.path.getsize(input_path) / os.path.getsize(output_path),
                "original_duration": video.duration,
                "target_bitrate": target_bitrate
            }
            
    except Exception as e:
        logger.error(f"Video compression failed: {e}")
        raise

async def process_video_frame_extraction(input_path: str, output_dir: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Extract frames from video"""
    try:
        frame_rate = parameters.get('frame_rate', 1)  # Extract 1 frame per second
        max_frames = parameters.get('max_frames', 100)
        
        with VideoFileClip(input_path) as video:
            frames_extracted = 0
            frame_paths = []
            
            for t in range(0, int(video.duration), frame_rate):
                if frames_extracted >= max_frames:
                    break
                
                frame = video.get_frame(t)
                frame_path = os.path.join(output_dir, f"frame_{frames_extracted:06d}.jpg")
                Image.fromarray(frame).save(frame_path, 'JPEG', quality=90)
                
                frame_paths.append(frame_path)
                frames_extracted += 1
            
            return {
                "frames_extracted": frames_extracted,
                "frame_paths": frame_paths,
                "video_duration": video.duration
            }
            
    except Exception as e:
        logger.error(f"Frame extraction failed: {e}")
        raise

# 3D model processing functions
async def process_3d_model_optimization(input_path: str, output_path: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Optimize 3D model for better performance"""
    try:
        # Load mesh
        mesh = trimesh.load(input_path)
        
        # Apply optimizations
        if parameters.get('remove_duplicates', True):
            mesh.remove_duplicate_faces()
        
        if parameters.get('merge_vertices', True):
            mesh.merge_vertices()
        
        if parameters.get('fix_normals', True):
            mesh.fix_normals()
        
        # Simplify mesh if requested
        if parameters.get('simplify_ratio'):
            target_faces = int(len(mesh.faces) * parameters['simplify_ratio'])
            mesh = mesh.simplify_quadric_decimation(target_faces)
        
        # Save optimized mesh
        mesh.export(output_path)
        
        return {
            "original_vertices": len(mesh.vertices),
            "original_faces": len(mesh.faces),
            "optimized_vertices": len(mesh.vertices),
            "optimized_faces": len(mesh.faces),
            "original_size": os.path.getsize(input_path),
            "optimized_size": os.path.getsize(output_path)
        }
        
    except Exception as e:
        logger.error(f"3D model optimization failed: {e}")
        raise

async def process_3d_model_repair(input_path: str, output_path: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Repair 3D model by fixing common issues"""
    try:
        # Load mesh
        mesh = trimesh.load(input_path)
        
        # Repair operations
        if parameters.get('fill_holes', True):
            mesh.fill_holes()
        
        if parameters.get('remove_degenerate', True):
            mesh.remove_degenerate_faces()
        
        if parameters.get('remove_unreferenced', True):
            mesh.remove_unreferenced_vertices()
        
        if parameters.get('fix_winding', True):
            mesh.fix_normals()
        
        # Save repaired mesh
        mesh.export(output_path)
        
        return {
            "vertices_before": len(mesh.vertices),
            "faces_before": len(mesh.faces),
            "vertices_after": len(mesh.vertices),
            "faces_after": len(mesh.faces),
            "is_watertight": mesh.is_watertight,
            "is_winding_consistent": mesh.is_winding_consistent
        }
        
    except Exception as e:
        logger.error(f"3D model repair failed: {e}")
        raise

# Quality validation functions
async def validate_image_quality(file_path: str) -> Dict[str, Any]:
    """Validate image quality using various metrics"""
    try:
        # Load image
        img = cv2.imread(file_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Calculate metrics
        # Blur detection (Laplacian variance)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Brightness analysis
        brightness = np.mean(gray)
        
        # Contrast analysis
        contrast = np.std(gray)
        
        # Noise estimation
        noise = np.std(gray - cv2.medianBlur(gray, 5))
        
        # Calculate overall quality score
        quality_score = min(1.0, (laplacian_var / 1000) * (contrast / 100) * (1 - noise / 100))
        
        return {
            "quality_score": quality_score,
            "blur_score": laplacian_var,
            "brightness": brightness,
            "contrast": contrast,
            "noise_level": noise,
            "is_acceptable": quality_score >= config.MIN_IMAGE_QUALITY
        }
        
    except Exception as e:
        logger.error(f"Image quality validation failed: {e}")
        return {"quality_score": 0.0, "error": str(e)}

async def validate_video_quality(file_path: str) -> Dict[str, Any]:
    """Validate video quality"""
    try:
        with VideoFileClip(file_path) as video:
            # Basic checks
            duration = video.duration
            fps = video.fps
            resolution = (video.w, video.h)
            
            # Sample frames for quality analysis
            sample_times = [duration * 0.1, duration * 0.5, duration * 0.9]
            quality_scores = []
            
            for t in sample_times:
                if t < duration:
                    frame = video.get_frame(t)
                    gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
                    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
                    quality_scores.append(blur_score)
            
            avg_quality = np.mean(quality_scores) if quality_scores else 0
            
            return {
                "duration": duration,
                "fps": fps,
                "resolution": resolution,
                "average_quality": avg_quality,
                "is_acceptable": avg_quality >= (config.MIN_VIDEO_QUALITY * 1000)
            }
            
    except Exception as e:
        logger.error(f"Video quality validation failed: {e}")
        return {"quality_score": 0.0, "error": str(e)}

# DICOM processing functions
async def process_dicom_conversion(input_path: str, output_path: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Convert DICOM to standard image format"""
    try:
        # Read DICOM file
        dicom_data = pydicom.dcmread(input_path)
        
        # Extract image data
        image_data = dicom_data.pixel_array
        
        # Normalize to 0-255 range
        image_data = ((image_data - image_data.min()) / (image_data.max() - image_data.min()) * 255).astype(np.uint8)
        
        # Convert to PIL Image
        if len(image_data.shape) == 2:  # Grayscale
            image = Image.fromarray(image_data, mode='L')
        else:  # Color
            image = Image.fromarray(image_data)
        
        # Save as standard image
        output_format = parameters.get('format', 'PNG')
        image.save(output_path, format=output_format)
        
        # Extract metadata
        metadata = {
            "patient_id": str(dicom_data.get('PatientID', '')),
            "study_date": str(dicom_data.get('StudyDate', '')),
            "modality": str(dicom_data.get('Modality', '')),
            "image_size": image_data.shape,
            "pixel_spacing": list(dicom_data.get('PixelSpacing', [])),
            "bits_allocated": int(dicom_data.get('BitsAllocated', 0))
        }
        
        return {
            "converted_format": output_format,
            "image_size": image_data.shape,
            "metadata": metadata,
            "file_size": os.path.getsize(output_path)
        }
        
    except Exception as e:
        logger.error(f"DICOM conversion failed: {e}")
        raise

# Background processing function
async def process_job_background(job: ProcessingJob):
    """Background task to process jobs"""
    try:
        # Update job status
        job.status = ProcessingStatus.PROCESSING
        job.updated_at = datetime.utcnow()
        await save_job_status(job)
        
        # Download input file
        input_path = await get_file_from_s3(job.file_id, "input")
        
        # Create output path
        output_path = tempfile.mktemp(suffix=".processed")
        
        # Process based on type
        if job.processing_type == ProcessingType.IMAGE_ENHANCEMENT:
            result = await process_image_enhancement(input_path, output_path, job.parameters)
        elif job.processing_type == ProcessingType.IMAGE_RESIZE:
            result = await process_image_resize(input_path, output_path, job.parameters)
        elif job.processing_type == ProcessingType.VIDEO_COMPRESSION:
            result = await process_video_compression(input_path, output_path, job.parameters)
        elif job.processing_type == ProcessingType.VIDEO_FRAME_EXTRACTION:
            output_dir = tempfile.mkdtemp()
            result = await process_video_frame_extraction(input_path, output_dir, job.parameters)
        elif job.processing_type == ProcessingType.MODEL_3D_OPTIMIZATION:
            result = await process_3d_model_optimization(input_path, output_path, job.parameters)
        elif job.processing_type == ProcessingType.MODEL_3D_REPAIR:
            result = await process_3d_model_repair(input_path, output_path, job.parameters)
        elif job.processing_type == ProcessingType.QUALITY_VALIDATION:
            if job.parameters.get('file_type') == 'image':
                result = await validate_image_quality(input_path)
            else:
                result = await validate_video_quality(input_path)
        elif job.processing_type == ProcessingType.DICOM_CONVERSION:
            result = await process_dicom_conversion(input_path, output_path, job.parameters)
        else:
            raise ValueError(f"Unknown processing type: {job.processing_type}")
        
        # Upload result if output file was created
        if os.path.exists(output_path):
            result_key = f"processed/{job.file_id}/{job.id}.processed"
            await upload_result_to_s3(output_path, result_key)
            result["output_url"] = result_key
        
        # Update job with results
        job.result = result
        job.status = ProcessingStatus.COMPLETED
        job.progress = 100.0
        job.completed_at = datetime.utcnow()
        job.updated_at = datetime.utcnow()
        
        await save_job_status(job)
        
    except Exception as e:
        logger.error(f"Processing job {job.id} failed: {e}")
        job.status = ProcessingStatus.FAILED
        job.error_message = str(e)
        job.updated_at = datetime.utcnow()
        await save_job_status(job)
    
    finally:
        # Clean up temporary files
        if 'input_path' in locals() and os.path.exists(input_path):
            os.unlink(input_path)
        if 'output_path' in locals() and os.path.exists(output_path):
            os.unlink(output_path)

# API Routes
@app.post("/process", response_model=ProcessingResponse)
async def create_processing_job(
    background_tasks: BackgroundTasks,
    request: ProcessingRequest
):
    """Create a new processing job"""
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create job
    job = ProcessingJob(
        id=job_id,
        file_id=request.file_id,
        processing_type=request.processing_type,
        status=ProcessingStatus.PENDING,
        parameters=request.parameters,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # Save job
    await save_job_status(job)
    
    # Start background processing
    background_tasks.add_task(process_job_background, job)
    
    return ProcessingResponse(
        job_id=job_id,
        status=ProcessingStatus.PENDING,
        message="Processing job created successfully"
    )

@app.get("/jobs/{job_id}")
async def get_job_status_endpoint(job_id: str):
    """Get processing job status"""
    job = await get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job

@app.get("/jobs")
async def list_jobs(file_id: Optional[str] = None, status: Optional[ProcessingStatus] = None):
    """List processing jobs"""
    # This is a simplified implementation
    # In production, you'd want to use a proper database
    return {"jobs": [], "total": 0}

@app.delete("/jobs/{job_id}")
async def cancel_job(job_id: str):
    """Cancel processing job"""
    job = await get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status == ProcessingStatus.PROCESSING:
        # In a real implementation, you'd need to cancel the background task
        job.status = ProcessingStatus.FAILED
        job.error_message = "Job cancelled by user"
        job.updated_at = datetime.utcnow()
        await save_job_status(job)
    
    return {"message": "Job cancelled successfully"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "asset-processor"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010) 