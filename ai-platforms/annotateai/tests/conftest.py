#!/usr/bin/env python3
"""
AnnotateAI Testing Configuration
Comprehensive pytest configuration with fixtures for all services
"""

import pytest
import asyncio
import docker
import redis
import psycopg2
import httpx
import json
import time
import os
from typing import Dict, Any, Generator, AsyncGenerator
from unittest.mock import Mock, patch
import numpy as np
import torch
from PIL import Image
import io
import base64
from datetime import datetime
import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from minio import Minio
from minio.error import S3Error
import tempfile
import shutil
from pathlib import Path

# Test configuration
TEST_CONFIG = {
    "DATABASE_URL": "postgresql://test:test@localhost:5433/annotateai_test",
    "REDIS_URL": "redis://localhost:6380",
    "MINIO_ENDPOINT": "localhost:9001",
    "MINIO_ACCESS_KEY": "testkey",
    "MINIO_SECRET_KEY": "testsecret",
    "API_BASE_URL": "http://localhost:8000",
    "AUTH_BASE_URL": "http://localhost:8001",
    "STORAGE_BASE_URL": "http://localhost:8009",
    "COLLABORATION_BASE_URL": "http://localhost:8011",
    "CLIP_BASE_URL": "http://localhost:8012",
    "TRACKING_BASE_URL": "http://localhost:8013",
    "MEDICAL_BASE_URL": "http://localhost:8014",
    "POINTCLOUD_BASE_URL": "http://localhost:8015",
    "JWT_SECRET": "test-secret-key",
    "JWT_ALGORITHM": "HS256",
    "TEST_TIMEOUT": 30,
    "MAX_RETRIES": 3
}

# Docker client for test containers
docker_client = docker.from_env()

# Test data directories
TEST_DATA_DIR = Path(__file__).parent / "test_data"
TEST_IMAGES_DIR = TEST_DATA_DIR / "images"
TEST_VIDEOS_DIR = TEST_DATA_DIR / "videos"
TEST_POINTCLOUDS_DIR = TEST_DATA_DIR / "pointclouds"
TEST_MEDICAL_DIR = TEST_DATA_DIR / "medical"

# Ensure test data directories exist
for dir_path in [TEST_DATA_DIR, TEST_IMAGES_DIR, TEST_VIDEOS_DIR, TEST_POINTCLOUDS_DIR, TEST_MEDICAL_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# Pytest configuration
def pytest_configure(config):
    """Configure pytest settings"""
    config.addinivalue_line(
        "markers", "unit: mark test as unit test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )
    config.addinivalue_line(
        "markers", "e2e: mark test as end-to-end test"
    )
    config.addinivalue_line(
        "markers", "load: mark test as load test"
    )
    config.addinivalue_line(
        "markers", "security: mark test as security test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
    config.addinivalue_line(
        "markers", "gpu: mark test as requiring GPU"
    )
    config.addinivalue_line(
        "markers", "model: mark test as requiring AI models"
    )

def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers"""
    for item in items:
        # Add GPU marker for GPU tests
        if "gpu" in item.nodeid:
            item.add_marker(pytest.mark.gpu)
        
        # Add model marker for model tests
        if "model" in item.nodeid or "ai" in item.nodeid:
            item.add_marker(pytest.mark.model)
        
        # Add slow marker for integration/e2e tests
        if "integration" in item.nodeid or "e2e" in item.nodeid:
            item.add_marker(pytest.mark.slow)

# Event loop fixture
@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

# Test containers fixtures
@pytest.fixture(scope="session")
def test_postgres():
    """Start PostgreSQL container for testing"""
    container = docker_client.containers.run(
        "postgres:15",
        detach=True,
        ports={"5432/tcp": 5433},
        environment={
            "POSTGRES_DB": "annotateai_test",
            "POSTGRES_USER": "test",
            "POSTGRES_PASSWORD": "test"
        },
        remove=True
    )
    
    # Wait for PostgreSQL to be ready
    for _ in range(30):
        try:
            conn = psycopg2.connect(TEST_CONFIG["DATABASE_URL"])
            conn.close()
            break
        except psycopg2.OperationalError:
            time.sleep(1)
    
    yield container
    
    container.stop()

@pytest.fixture(scope="session")
def test_redis():
    """Start Redis container for testing"""
    container = docker_client.containers.run(
        "redis:7-alpine",
        detach=True,
        ports={"6379/tcp": 6380},
        remove=True
    )
    
    # Wait for Redis to be ready
    for _ in range(30):
        try:
            r = redis.Redis.from_url(TEST_CONFIG["REDIS_URL"])
            r.ping()
            break
        except redis.ConnectionError:
            time.sleep(1)
    
    yield container
    
    container.stop()

@pytest.fixture(scope="session")
def test_minio():
    """Start MinIO container for testing"""
    container = docker_client.containers.run(
        "minio/minio",
        detach=True,
        command="server /data --console-address :9001",
        ports={"9000/tcp": 9001, "9001/tcp": 9002},
        environment={
            "MINIO_ROOT_USER": TEST_CONFIG["MINIO_ACCESS_KEY"],
            "MINIO_ROOT_PASSWORD": TEST_CONFIG["MINIO_SECRET_KEY"]
        },
        remove=True
    )
    
    # Wait for MinIO to be ready
    for _ in range(30):
        try:
            client = Minio(
                TEST_CONFIG["MINIO_ENDPOINT"],
                access_key=TEST_CONFIG["MINIO_ACCESS_KEY"],
                secret_key=TEST_CONFIG["MINIO_SECRET_KEY"],
                secure=False
            )
            client.list_buckets()
            break
        except Exception:
            time.sleep(1)
    
    yield container
    
    container.stop()

# Database fixtures
@pytest.fixture
def db_engine(test_postgres):
    """Create database engine"""
    engine = create_engine(TEST_CONFIG["DATABASE_URL"])
    yield engine
    engine.dispose()

@pytest.fixture
def db_session(db_engine):
    """Create database session"""
    Session = sessionmaker(bind=db_engine)
    session = Session()
    yield session
    session.rollback()
    session.close()

@pytest.fixture
def redis_client(test_redis):
    """Create Redis client"""
    client = redis.Redis.from_url(TEST_CONFIG["REDIS_URL"])
    yield client
    client.flushdb()

@pytest.fixture
def minio_client(test_minio):
    """Create MinIO client"""
    client = Minio(
        TEST_CONFIG["MINIO_ENDPOINT"],
        access_key=TEST_CONFIG["MINIO_ACCESS_KEY"],
        secret_key=TEST_CONFIG["MINIO_SECRET_KEY"],
        secure=False
    )
    
    # Create test bucket
    bucket_name = "test-bucket"
    if not client.bucket_exists(bucket_name):
        client.make_bucket(bucket_name)
    
    yield client
    
    # Clean up test bucket
    try:
        objects = client.list_objects(bucket_name, recursive=True)
        for obj in objects:
            client.remove_object(bucket_name, obj.object_name)
        client.remove_bucket(bucket_name)
    except S3Error:
        pass

# HTTP client fixtures
@pytest.fixture
async def async_client():
    """Create async HTTP client"""
    async with httpx.AsyncClient(timeout=TEST_CONFIG["TEST_TIMEOUT"]) as client:
        yield client

@pytest.fixture
def sync_client():
    """Create sync HTTP client"""
    with httpx.Client(timeout=TEST_CONFIG["TEST_TIMEOUT"]) as client:
        yield client

# Authentication fixtures
@pytest.fixture
def test_user():
    """Create test user data"""
    return {
        "id": "test-user-123",
        "username": "testuser",
        "email": "test@example.com",
        "role": "annotator",
        "permissions": ["read", "write", "annotate"]
    }

@pytest.fixture
def admin_user():
    """Create admin user data"""
    return {
        "id": "admin-user-123",
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin",
        "permissions": ["read", "write", "annotate", "admin", "delete"]
    }

@pytest.fixture
def auth_token(test_user):
    """Create JWT token for test user"""
    payload = {
        "sub": test_user["id"],
        "username": test_user["username"],
        "email": test_user["email"],
        "role": test_user["role"],
        "permissions": test_user["permissions"],
        "exp": int(time.time()) + 3600,  # 1 hour
        "iat": int(time.time())
    }
    return jwt.encode(payload, TEST_CONFIG["JWT_SECRET"], algorithm=TEST_CONFIG["JWT_ALGORITHM"])

@pytest.fixture
def admin_token(admin_user):
    """Create JWT token for admin user"""
    payload = {
        "sub": admin_user["id"],
        "username": admin_user["username"],
        "email": admin_user["email"],
        "role": admin_user["role"],
        "permissions": admin_user["permissions"],
        "exp": int(time.time()) + 3600,  # 1 hour
        "iat": int(time.time())
    }
    return jwt.encode(payload, TEST_CONFIG["JWT_SECRET"], algorithm=TEST_CONFIG["JWT_ALGORITHM"])

@pytest.fixture
def auth_headers(auth_token):
    """Create authorization headers"""
    return {"Authorization": f"Bearer {auth_token}"}

@pytest.fixture
def admin_headers(admin_token):
    """Create admin authorization headers"""
    return {"Authorization": f"Bearer {admin_token}"}

# Test data fixtures
@pytest.fixture
def sample_image():
    """Create sample image for testing"""
    # Create a simple test image
    image = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr.getvalue()

@pytest.fixture
def sample_image_base64(sample_image):
    """Create base64 encoded sample image"""
    return base64.b64encode(sample_image).decode('utf-8')

@pytest.fixture
def sample_video():
    """Create sample video for testing"""
    # Create a simple test video (placeholder)
    video_path = TEST_VIDEOS_DIR / "test_video.mp4"
    if not video_path.exists():
        # Create a dummy video file
        with open(video_path, 'wb') as f:
            f.write(b'\x00' * 1024)  # 1KB dummy data
    
    with open(video_path, 'rb') as f:
        return f.read()

@pytest.fixture
def sample_pointcloud():
    """Create sample point cloud for testing"""
    # Generate random point cloud data
    points = np.random.rand(1000, 3) * 10  # 1000 points in 3D space
    
    # Save as PLY format
    ply_path = TEST_POINTCLOUDS_DIR / "test_pointcloud.ply"
    with open(ply_path, 'w') as f:
        f.write("ply\n")
        f.write("format ascii 1.0\n")
        f.write(f"element vertex {len(points)}\n")
        f.write("property float x\n")
        f.write("property float y\n")
        f.write("property float z\n")
        f.write("end_header\n")
        for point in points:
            f.write(f"{point[0]} {point[1]} {point[2]}\n")
    
    with open(ply_path, 'rb') as f:
        return f.read()

@pytest.fixture
def sample_medical_image():
    """Create sample medical image (DICOM-like)"""
    # Create a grayscale medical image
    image = Image.new('L', (512, 512), color=128)
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr.getvalue()

@pytest.fixture
def sample_annotation():
    """Create sample annotation data"""
    return {
        "id": "annotation-123",
        "type": "bounding_box",
        "coordinates": {
            "x": 10,
            "y": 20,
            "width": 100,
            "height": 50
        },
        "label": "test_object",
        "confidence": 0.95,
        "metadata": {
            "created_by": "test-user-123",
            "created_at": datetime.utcnow().isoformat(),
            "project_id": "test-project-123"
        }
    }

@pytest.fixture
def sample_project():
    """Create sample project data"""
    return {
        "id": "test-project-123",
        "name": "Test Project",
        "description": "A test project for annotation",
        "type": "image_classification",
        "labels": ["cat", "dog", "bird"],
        "settings": {
            "quality_threshold": 0.8,
            "inter_annotator_agreement": 0.7,
            "max_annotations_per_image": 10
        },
        "created_by": "test-user-123",
        "created_at": datetime.utcnow().isoformat()
    }

@pytest.fixture
def sample_dataset():
    """Create sample dataset data"""
    return {
        "id": "test-dataset-123",
        "name": "Test Dataset",
        "description": "A test dataset",
        "project_id": "test-project-123",
        "type": "image",
        "stats": {
            "total_items": 100,
            "annotated_items": 50,
            "reviewed_items": 25
        },
        "created_by": "test-user-123",
        "created_at": datetime.utcnow().isoformat()
    }

# Mock fixtures
@pytest.fixture
def mock_ai_model():
    """Mock AI model for testing"""
    mock_model = Mock()
    mock_model.predict.return_value = {
        "predictions": [
            {"label": "cat", "confidence": 0.95},
            {"label": "dog", "confidence": 0.85}
        ]
    }
    return mock_model

@pytest.fixture
def mock_gpu_info():
    """Mock GPU information"""
    return {
        "gpu_count": 2,
        "gpus": [
            {
                "id": 0,
                "name": "Tesla V100",
                "memory_total": 16384,
                "memory_used": 2048,
                "utilization": 25
            },
            {
                "id": 1,
                "name": "Tesla V100",
                "memory_total": 16384,
                "memory_used": 1024,
                "utilization": 15
            }
        ]
    }

# Service health check utilities
async def wait_for_service(url: str, timeout: int = 30) -> bool:
    """Wait for service to be healthy"""
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{url}/health")
                if response.status_code == 200:
                    return True
        except Exception:
            pass
        
        await asyncio.sleep(1)
    
    return False

def retry_on_failure(max_retries: int = 3, delay: float = 1.0):
    """Decorator to retry failed tests"""
    def decorator(func):
        @pytest.mark.asyncio
        async def async_wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    await asyncio.sleep(delay)
        
        def sync_wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    time.sleep(delay)
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator

# Test utilities
class TestUtils:
    """Utility class for testing"""
    
    @staticmethod
    def assert_response_structure(response: Dict[str, Any], expected_keys: list):
        """Assert that response has expected structure"""
        for key in expected_keys:
            assert key in response, f"Expected key '{key}' not found in response"
    
    @staticmethod
    def assert_status_code(response, expected_status: int):
        """Assert response status code"""
        assert response.status_code == expected_status, f"Expected status {expected_status}, got {response.status_code}"
    
    @staticmethod
    def assert_json_response(response):
        """Assert that response is valid JSON"""
        try:
            response.json()
        except ValueError:
            pytest.fail("Response is not valid JSON")
    
    @staticmethod
    def create_temp_file(content: bytes, suffix: str = ".tmp") -> str:
        """Create temporary file with content"""
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        temp_file.write(content)
        temp_file.close()
        return temp_file.name
    
    @staticmethod
    def cleanup_temp_file(file_path: str):
        """Clean up temporary file"""
        try:
            os.unlink(file_path)
        except FileNotFoundError:
            pass

@pytest.fixture
def test_utils():
    """Test utilities fixture"""
    return TestUtils

# Performance testing utilities
@pytest.fixture
def performance_monitor():
    """Monitor performance during tests"""
    start_time = time.time()
    start_memory = 0  # Would use memory profiler in real implementation
    
    yield {
        "start_time": start_time,
        "start_memory": start_memory
    }
    
    end_time = time.time()
    duration = end_time - start_time
    
    # Log performance metrics
    print(f"Test duration: {duration:.2f}s")

# Cleanup fixtures
@pytest.fixture(autouse=True)
def cleanup_test_files():
    """Clean up test files after each test"""
    yield
    
    # Clean up any temporary files
    for temp_dir in [TEST_IMAGES_DIR, TEST_VIDEOS_DIR, TEST_POINTCLOUDS_DIR, TEST_MEDICAL_DIR]:
        for file_path in temp_dir.glob("temp_*"):
            try:
                file_path.unlink()
            except FileNotFoundError:
                pass

# Test configuration fixture
@pytest.fixture
def test_config():
    """Test configuration"""
    return TEST_CONFIG.copy()

# Parametrized fixtures for different test scenarios
@pytest.fixture(params=["image", "video", "pointcloud", "medical"])
def data_type(request):
    """Parametrized fixture for different data types"""
    return request.param

@pytest.fixture(params=["cpu", "gpu"])
def compute_device(request):
    """Parametrized fixture for different compute devices"""
    return request.param

@pytest.fixture(params=["small", "medium", "large"])
def dataset_size(request):
    """Parametrized fixture for different dataset sizes"""
    sizes = {
        "small": 10,
        "medium": 100,
        "large": 1000
    }
    return sizes[request.param] 