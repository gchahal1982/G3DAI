#!/usr/bin/env python3
"""
AnnotateAI Storage Service
S3-compatible storage with file processing, versioning, and CDN integration
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from contextlib import asynccontextmanager
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
import boto3
from botocore.exceptions import ClientError
import asyncio
import logging
from datetime import datetime, timedelta
import os
import hashlib
import mimetypes
from PIL import Image
import cv2
import numpy as np
from pathlib import Path
import tempfile
import json
import uuid
from enum import Enum
import redis.asyncio as redis
from urllib.parse import urlparse
import aiofiles
from moviepy.editor import VideoFileClip
import magic

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
    
    # CDN Configuration
    CDN_ENDPOINT = os.getenv("CDN_ENDPOINT", "")
    CDN_ENABLED = os.getenv("CDN_ENABLED", "false").lower() == "true"
    
    # Redis for caching
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # File processing
    MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "1000000000"))  # 1GB
    ALLOWED_EXTENSIONS = set(os.getenv("ALLOWED_EXTENSIONS", ".jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.obj,.ply,.stl,.pcd,.dcm").split(","))
    
    # Image processing
    THUMBNAIL_SIZES = [(150, 150), (300, 300), (600, 600)]
    MAX_IMAGE_SIZE = (4096, 4096)
    
    # Video processing
    MAX_VIDEO_DURATION = int(os.getenv("MAX_VIDEO_DURATION", "3600"))  # 1 hour
    VIDEO_PREVIEW_LENGTH = int(os.getenv("VIDEO_PREVIEW_LENGTH", "30"))  # 30 seconds
    
    # Encryption
    ENCRYPTION_ENABLED = os.getenv("ENCRYPTION_ENABLED", "true").lower() == "true"
    ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "your-encryption-key-here")

config = Config()

# Global clients
s3_client = None
redis_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    global s3_client, redis_client
    
    # Startup
    logger.info("Starting Storage Service...")
    
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
    
    # Create bucket if it doesn't exist
    try:
        s3_client.create_bucket(Bucket=config.S3_BUCKET_NAME)
        logger.info(f"Created S3 bucket: {config.S3_BUCKET_NAME}")
    except ClientError as e:
        if e.response['Error']['Code'] != 'BucketAlreadyOwnedByYou':
            logger.error(f"Failed to create S3 bucket: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Storage Service...")
    if redis_client:
        await redis_client.close()

# FastAPI app
app = FastAPI(
    title="AnnotateAI Storage Service",
    description="S3-compatible storage with file processing and CDN integration",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class FileType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    MODEL_3D = "3d_model"
    DOCUMENT = "document"
    ANNOTATION = "annotation"
    OTHER = "other"

class FileStatus(str, Enum):
    UPLOADING = "uploading"
    PROCESSING = "processing"
    READY = "ready"
    ERROR = "error"

class FileMetadata(BaseModel):
    id: str
    filename: str
    content_type: str
    file_type: FileType
    size: int
    checksum: str
    status: FileStatus
    created_at: datetime
    updated_at: datetime
    tags: List[str] = []
    metadata: Dict[str, Any] = {}
    versions: List[str] = []
    thumbnails: List[str] = []
    cdn_url: Optional[str] = None

class UploadResponse(BaseModel):
    file_id: str
    filename: str
    size: int
    content_type: str
    checksum: str
    status: FileStatus
    upload_url: Optional[str] = None
    message: str

class FileListResponse(BaseModel):
    files: List[FileMetadata]
    total: int
    page: int
    per_page: int

# Utility functions
def get_file_type(content_type: str, filename: str) -> FileType:
    """Determine file type from content type and filename"""
    if content_type.startswith("image/"):
        return FileType.IMAGE
    elif content_type.startswith("video/"):
        return FileType.VIDEO
    elif content_type.startswith("audio/"):
        return FileType.AUDIO
    elif filename.lower().endswith(('.obj', '.ply', '.stl', '.pcd', '.3ds', '.dae', '.fbx')):
        return FileType.MODEL_3D
    elif content_type.startswith("application/") or content_type.startswith("text/"):
        return FileType.DOCUMENT
    else:
        return FileType.OTHER

def calculate_checksum(file_path: str) -> str:
    """Calculate MD5 checksum of file"""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def generate_s3_key(file_id: str, filename: str, version: str = "v1") -> str:
    """Generate S3 key for file"""
    ext = Path(filename).suffix
    return f"files/{file_id}/{version}/{file_id}{ext}"

def generate_thumbnail_key(file_id: str, size: tuple) -> str:
    """Generate S3 key for thumbnail"""
    return f"thumbnails/{file_id}/{size[0]}x{size[1]}.jpg"

async def save_file_metadata(file_id: str, metadata: FileMetadata):
    """Save file metadata to Redis"""
    try:
        await redis_client.set(
            f"file_metadata:{file_id}",
            metadata.json(),
            ex=86400  # 24 hours
        )
    except Exception as e:
        logger.error(f"Failed to save metadata: {e}")

async def get_file_metadata(file_id: str) -> Optional[FileMetadata]:
    """Get file metadata from Redis"""
    try:
        metadata_json = await redis_client.get(f"file_metadata:{file_id}")
        if metadata_json:
            return FileMetadata.parse_raw(metadata_json)
        return None
    except Exception as e:
        logger.error(f"Failed to get metadata: {e}")
        return None

async def process_image(file_path: str, file_id: str) -> Dict[str, Any]:
    """Process image file - create thumbnails and extract metadata"""
    try:
        with Image.open(file_path) as img:
            # Extract metadata
            metadata = {
                "width": img.width,
                "height": img.height,
                "format": img.format,
                "mode": img.mode,
                "has_transparency": img.mode in ('RGBA', 'LA') or 'transparency' in img.info
            }
            
            # Get EXIF data if available
            if hasattr(img, '_getexif') and img._getexif():
                metadata["exif"] = img._getexif()
            
            # Create thumbnails
            thumbnails = []
            for size in config.THUMBNAIL_SIZES:
                thumbnail = img.copy()
                thumbnail.thumbnail(size, Image.Resampling.LANCZOS)
                
                # Save thumbnail to temporary file
                with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
                    thumbnail.save(tmp.name, 'JPEG', quality=85)
                    
                    # Upload thumbnail to S3
                    thumbnail_key = generate_thumbnail_key(file_id, size)
                    s3_client.upload_file(tmp.name, config.S3_BUCKET_NAME, thumbnail_key)
                    
                    thumbnails.append(thumbnail_key)
                    
                    # Clean up
                    os.unlink(tmp.name)
            
            return {
                "metadata": metadata,
                "thumbnails": thumbnails
            }
            
    except Exception as e:
        logger.error(f"Image processing failed: {e}")
        return {"metadata": {}, "thumbnails": []}

async def process_video(file_path: str, file_id: str) -> Dict[str, Any]:
    """Process video file - extract metadata and create preview"""
    try:
        with VideoFileClip(file_path) as video:
            # Extract metadata
            metadata = {
                "width": video.w,
                "height": video.h,
                "duration": video.duration,
                "fps": video.fps,
                "format": Path(file_path).suffix[1:].lower()
            }
            
            # Create preview thumbnail
            if video.duration > 0:
                # Get frame at 10% of video duration
                frame_time = min(video.duration * 0.1, 10)
                frame = video.get_frame(frame_time)
                
                # Save frame as thumbnail
                thumbnail_key = generate_thumbnail_key(file_id, (600, 400))
                with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
                    Image.fromarray(frame).save(tmp.name, 'JPEG', quality=85)
                    s3_client.upload_file(tmp.name, config.S3_BUCKET_NAME, thumbnail_key)
                    os.unlink(tmp.name)
                
                # Create short preview if video is long
                if video.duration > 60:
                    preview_clip = video.subclip(0, min(config.VIDEO_PREVIEW_LENGTH, video.duration))
                    preview_key = f"previews/{file_id}/preview.mp4"
                    
                    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp:
                        preview_clip.write_videofile(tmp.name, codec='libx264', audio_codec='aac')
                        s3_client.upload_file(tmp.name, config.S3_BUCKET_NAME, preview_key)
                        os.unlink(tmp.name)
                    
                    metadata["preview_url"] = preview_key
                
                return {
                    "metadata": metadata,
                    "thumbnails": [thumbnail_key]
                }
            
    except Exception as e:
        logger.error(f"Video processing failed: {e}")
        return {"metadata": {}, "thumbnails": []}

async def process_3d_model(file_path: str, file_id: str) -> Dict[str, Any]:
    """Process 3D model file - extract metadata"""
    try:
        # Basic file info
        file_size = os.path.getsize(file_path)
        file_ext = Path(file_path).suffix.lower()
        
        metadata = {
            "format": file_ext[1:],
            "size_bytes": file_size,
            "processing_note": "3D model processing requires specialized libraries"
        }
        
        # TODO: Add specialized 3D processing with Open3D, trimesh, etc.
        # For now, just return basic metadata
        
        return {
            "metadata": metadata,
            "thumbnails": []
        }
        
    except Exception as e:
        logger.error(f"3D model processing failed: {e}")
        return {"metadata": {}, "thumbnails": []}

async def process_file_background(file_path: str, file_id: str, file_type: FileType, metadata: FileMetadata):
    """Background task to process uploaded file"""
    try:
        # Update status to processing
        metadata.status = FileStatus.PROCESSING
        await save_file_metadata(file_id, metadata)
        
        # Process based on file type
        if file_type == FileType.IMAGE:
            result = await process_image(file_path, file_id)
        elif file_type == FileType.VIDEO:
            result = await process_video(file_path, file_id)
        elif file_type == FileType.MODEL_3D:
            result = await process_3d_model(file_path, file_id)
        else:
            result = {"metadata": {}, "thumbnails": []}
        
        # Update metadata
        metadata.metadata.update(result["metadata"])
        metadata.thumbnails = result["thumbnails"]
        metadata.status = FileStatus.READY
        metadata.updated_at = datetime.utcnow()
        
        # Save updated metadata
        await save_file_metadata(file_id, metadata)
        
    except Exception as e:
        logger.error(f"File processing failed: {e}")
        metadata.status = FileStatus.ERROR
        metadata.metadata["error"] = str(e)
        await save_file_metadata(file_id, metadata)
    
    finally:
        # Clean up temporary file
        if os.path.exists(file_path):
            os.unlink(file_path)

# API Routes

@app.post("/upload", response_model=UploadResponse)
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    tags: Optional[str] = Form(None),
    metadata: Optional[str] = Form(None)
):
    """Upload a file to storage"""
    
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in config.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not allowed. Allowed types: {', '.join(config.ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    if file.size and file.size > config.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size {file.size} exceeds maximum allowed size {config.MAX_FILE_SIZE}"
        )
    
    # Generate unique file ID
    file_id = str(uuid.uuid4())
    
    # Determine content type
    content_type = file.content_type or mimetypes.guess_type(file.filename)[0] or "application/octet-stream"
    
    # Determine file type
    file_type = get_file_type(content_type, file.filename)
    
    # Save file to temporary location
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    # Calculate checksum
    checksum = calculate_checksum(tmp_path)
    
    # Create S3 key
    s3_key = generate_s3_key(file_id, file.filename)
    
    # Upload to S3
    try:
        s3_client.upload_file(tmp_path, config.S3_BUCKET_NAME, s3_key)
    except Exception as e:
        os.unlink(tmp_path)
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {e}")
    
    # Parse tags and metadata
    file_tags = tags.split(",") if tags else []
    file_metadata = json.loads(metadata) if metadata else {}
    
    # Create file metadata
    file_meta = FileMetadata(
        id=file_id,
        filename=file.filename,
        content_type=content_type,
        file_type=file_type,
        size=len(content),
        checksum=checksum,
        status=FileStatus.UPLOADING,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        tags=file_tags,
        metadata=file_metadata,
        versions=["v1"]
    )
    
    # Add CDN URL if enabled
    if config.CDN_ENABLED and config.CDN_ENDPOINT:
        file_meta.cdn_url = f"{config.CDN_ENDPOINT}/{s3_key}"
    
    # Save metadata
    await save_file_metadata(file_id, file_meta)
    
    # Start background processing
    background_tasks.add_task(process_file_background, tmp_path, file_id, file_type, file_meta)
    
    return UploadResponse(
        file_id=file_id,
        filename=file.filename,
        size=len(content),
        content_type=content_type,
        checksum=checksum,
        status=FileStatus.UPLOADING,
        message="File uploaded successfully, processing started"
    )

@app.get("/files/{file_id}")
async def get_file_info(file_id: str):
    """Get file metadata"""
    metadata = await get_file_metadata(file_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="File not found")
    
    return metadata

@app.get("/files/{file_id}/download")
async def download_file(file_id: str):
    """Download file"""
    metadata = await get_file_metadata(file_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="File not found")
    
    if metadata.status != FileStatus.READY:
        raise HTTPException(status_code=400, detail="File not ready for download")
    
    # Generate S3 key
    s3_key = generate_s3_key(file_id, metadata.filename)
    
    # Generate pre-signed URL
    try:
        download_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': config.S3_BUCKET_NAME, 'Key': s3_key},
            ExpiresIn=3600  # 1 hour
        )
        
        return {"download_url": download_url}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate download URL: {e}")

@app.get("/files/{file_id}/thumbnail")
async def get_thumbnail(file_id: str, size: str = "300x300"):
    """Get file thumbnail"""
    metadata = await get_file_metadata(file_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Parse size
    try:
        width, height = map(int, size.split('x'))
        size_tuple = (width, height)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid size format. Use 'WIDTHxHEIGHT'")
    
    # Find matching thumbnail
    thumbnail_key = generate_thumbnail_key(file_id, size_tuple)
    
    # Generate pre-signed URL
    try:
        thumbnail_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': config.S3_BUCKET_NAME, 'Key': thumbnail_key},
            ExpiresIn=3600  # 1 hour
        )
        
        return {"thumbnail_url": thumbnail_url}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate thumbnail URL: {e}")

@app.get("/files", response_model=FileListResponse)
async def list_files(
    page: int = 1,
    per_page: int = 20,
    file_type: Optional[FileType] = None,
    status: Optional[FileStatus] = None
):
    """List files with pagination and filtering"""
    # This is a simplified implementation
    # In production, you'd want to use a proper database
    
    # For now, return empty response
    return FileListResponse(
        files=[],
        total=0,
        page=page,
        per_page=per_page
    )

@app.delete("/files/{file_id}")
async def delete_file(file_id: str):
    """Delete file"""
    metadata = await get_file_metadata(file_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        # Delete from S3
        s3_key = generate_s3_key(file_id, metadata.filename)
        s3_client.delete_object(Bucket=config.S3_BUCKET_NAME, Key=s3_key)
        
        # Delete thumbnails
        for thumbnail_key in metadata.thumbnails:
            s3_client.delete_object(Bucket=config.S3_BUCKET_NAME, Key=thumbnail_key)
        
        # Delete metadata
        await redis_client.delete(f"file_metadata:{file_id}")
        
        return {"message": "File deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "storage-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8009) 