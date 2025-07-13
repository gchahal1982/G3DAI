#!/usr/bin/env python3
"""
AnnotateAI Load Testing Suite
Comprehensive load tests for all services using Locust framework
"""

import random
import json
import time
import base64
import io
from typing import Dict, List, Any, Optional
from datetime import datetime
import tempfile
import os

from locust import HttpUser, task, between, events
from locust.contrib.fasthttp import FastHttpUser
import numpy as np
from PIL import Image
import jwt

# Configuration
LOAD_TEST_CONFIG = {
    "BASE_URL": "http://localhost:8000",
    "AUTH_URL": "http://localhost:8001", 
    "STORAGE_URL": "http://localhost:8009",
    "COLLABORATION_URL": "http://localhost:8011",
    "AI_MODELS_URL": "http://localhost:8012",
    "JWT_SECRET": "test-secret-key",
    "TEST_USERS": 100,
    "TEST_PROJECTS": 10,
    "TEST_DATASETS": 50
}

# Test data generators
class TestDataGenerator:
    """Generate test data for load testing"""
    
    @staticmethod
    def generate_user_credentials(user_id: int) -> Dict[str, str]:
        """Generate user credentials"""
        return {
            "username": f"loadtest_user_{user_id}",
            "password": f"LoadTest123_{user_id}",
            "email": f"loadtest_{user_id}@example.com",
            "role": random.choice(["annotator", "reviewer", "admin"])
        }
    
    @staticmethod
    def generate_jwt_token(user_id: int) -> str:
        """Generate JWT token for user"""
        payload = {
            "sub": f"user_{user_id}",
            "username": f"loadtest_user_{user_id}",
            "role": "annotator",
            "exp": int(time.time()) + 3600,
            "iat": int(time.time())
        }
        return jwt.encode(payload, LOAD_TEST_CONFIG["JWT_SECRET"], algorithm="HS256")
    
    @staticmethod
    def generate_test_image(width: int = 224, height: int = 224) -> bytes:
        """Generate test image"""
        # Create random RGB image
        array = np.random.randint(0, 255, (height, width, 3), dtype=np.uint8)
        image = Image.fromarray(array)
        
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        return img_byte_arr.getvalue()
    
    @staticmethod
    def generate_test_annotation() -> Dict[str, Any]:
        """Generate test annotation"""
        annotation_types = ["bounding_box", "polygon", "point", "line"]
        labels = ["cat", "dog", "car", "person", "tree", "building"]
        
        annotation_type = random.choice(annotation_types)
        
        if annotation_type == "bounding_box":
            coordinates = {
                "x": random.randint(0, 200),
                "y": random.randint(0, 200), 
                "width": random.randint(50, 150),
                "height": random.randint(50, 150)
            }
        elif annotation_type == "point":
            coordinates = {
                "x": random.randint(0, 300),
                "y": random.randint(0, 300)
            }
        else:
            # Simplified coordinates for other types
            coordinates = {
                "points": [
                    {"x": random.randint(0, 300), "y": random.randint(0, 300)}
                    for _ in range(random.randint(3, 8))
                ]
            }
        
        return {
            "type": annotation_type,
            "coordinates": coordinates,
            "label": random.choice(labels),
            "confidence": round(random.uniform(0.7, 0.99), 2),
            "metadata": {
                "created_at": datetime.utcnow().isoformat(),
                "difficulty": random.choice(["easy", "medium", "hard"])
            }
        }
    
    @staticmethod
    def generate_project_data() -> Dict[str, Any]:
        """Generate test project data"""
        project_types = ["image_classification", "object_detection", "semantic_segmentation"]
        
        return {
            "name": f"Load Test Project {random.randint(1, 1000)}",
            "description": "Auto-generated project for load testing",
            "type": random.choice(project_types),
            "labels": random.sample(["cat", "dog", "car", "person", "tree", "building", "animal", "vehicle"], 
                                  random.randint(3, 6)),
            "settings": {
                "quality_threshold": random.uniform(0.7, 0.95),
                "inter_annotator_agreement": random.uniform(0.6, 0.9),
                "max_annotations_per_image": random.randint(5, 20)
            }
        }

class APILoadTestUser(FastHttpUser):
    """Base class for API load testing"""
    
    wait_time = between(1, 3)
    
    def on_start(self):
        """Initialize user session"""
        self.user_id = random.randint(1, LOAD_TEST_CONFIG["TEST_USERS"])
        self.token = TestDataGenerator.generate_jwt_token(self.user_id)
        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.projects = []
        self.datasets = []
        self.annotations = []
    
    def authenticate(self):
        """Authenticate user"""
        credentials = TestDataGenerator.generate_user_credentials(self.user_id)
        
        with self.client.post("/auth/login", json=credentials, catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.headers = {"Authorization": f"Bearer {self.token}"}
                response.success()
            else:
                response.failure(f"Authentication failed: {response.status_code}")

class AuthServiceLoadTest(APILoadTestUser):
    """Load tests for Authentication Service"""
    
    host = LOAD_TEST_CONFIG["AUTH_URL"]
    
    @task(3)
    def login_user(self):
        """Test user login"""
        credentials = TestDataGenerator.generate_user_credentials(self.user_id)
        
        with self.client.post("/auth/login", json=credentials) as response:
            if response.status_code in [200, 401]:  # Both valid for load testing
                pass
    
    @task(1)
    def register_user(self):
        """Test user registration"""
        new_user_id = random.randint(10000, 99999)
        user_data = TestDataGenerator.generate_user_credentials(new_user_id)
        
        with self.client.post("/auth/register", json=user_data) as response:
            pass
    
    @task(2)
    def verify_token(self):
        """Test token verification"""
        with self.client.get("/auth/verify", headers=self.headers) as response:
            pass
    
    @task(1)
    def refresh_token(self):
        """Test token refresh"""
        with self.client.post("/auth/refresh", headers=self.headers) as response:
            pass
    
    @task(1)
    def health_check(self):
        """Test health endpoint"""
        with self.client.get("/health") as response:
            pass

class APIGatewayLoadTest(APILoadTestUser):
    """Load tests for API Gateway"""
    
    host = LOAD_TEST_CONFIG["BASE_URL"]
    
    @task(3)
    def create_project(self):
        """Test project creation"""
        project_data = TestDataGenerator.generate_project_data()
        
        with self.client.post("/projects", json=project_data, headers=self.headers) as response:
            if response.status_code == 201:
                project = response.json()
                self.projects.append(project["id"])
    
    @task(5)
    def list_projects(self):
        """Test project listing"""
        with self.client.get("/projects", headers=self.headers) as response:
            pass
    
    @task(2)
    def get_project_details(self):
        """Test getting project details"""
        if self.projects:
            project_id = random.choice(self.projects)
            with self.client.get(f"/projects/{project_id}", headers=self.headers) as response:
                pass
    
    @task(4)
    def create_annotation(self):
        """Test annotation creation"""
        if self.projects:
            project_id = random.choice(self.projects)
            annotation_data = TestDataGenerator.generate_test_annotation()
            annotation_data["project_id"] = project_id
            
            with self.client.post("/annotations", json=annotation_data, headers=self.headers) as response:
                if response.status_code == 201:
                    annotation = response.json()
                    self.annotations.append(annotation["id"])
    
    @task(6)
    def list_annotations(self):
        """Test annotation listing"""
        if self.projects:
            project_id = random.choice(self.projects)
            with self.client.get(f"/annotations?project_id={project_id}", headers=self.headers) as response:
                pass
    
    @task(2)
    def update_annotation(self):
        """Test annotation updates"""
        if self.annotations:
            annotation_id = random.choice(self.annotations)
            update_data = {
                "label": random.choice(["updated_cat", "updated_dog", "updated_car"]),
                "confidence": round(random.uniform(0.8, 0.99), 2)
            }
            
            with self.client.put(f"/annotations/{annotation_id}", json=update_data, headers=self.headers) as response:
                pass
    
    @task(1)
    def delete_annotation(self):
        """Test annotation deletion"""
        if self.annotations:
            annotation_id = self.annotations.pop()
            with self.client.delete(f"/annotations/{annotation_id}", headers=self.headers) as response:
                pass

class StorageServiceLoadTest(APILoadTestUser):
    """Load tests for Storage Service"""
    
    host = LOAD_TEST_CONFIG["STORAGE_URL"]
    
    @task(3)
    def upload_image(self):
        """Test image upload"""
        image_data = TestDataGenerator.generate_test_image()
        
        files = {"file": ("test_image.png", image_data, "image/png")}
        
        with self.client.post("/storage/upload", files=files, headers=self.headers) as response:
            if response.status_code == 200:
                result = response.json()
                # Store file ID for later operations
                setattr(self, 'uploaded_files', getattr(self, 'uploaded_files', []))
                self.uploaded_files.append(result.get("file_id"))
    
    @task(2)
    def download_image(self):
        """Test image download"""
        uploaded_files = getattr(self, 'uploaded_files', [])
        if uploaded_files:
            file_id = random.choice(uploaded_files)
            with self.client.get(f"/storage/download/{file_id}", headers=self.headers) as response:
                pass
    
    @task(1)
    def list_files(self):
        """Test file listing"""
        with self.client.get("/storage/files", headers=self.headers) as response:
            pass
    
    @task(1)
    def get_file_metadata(self):
        """Test file metadata retrieval"""
        uploaded_files = getattr(self, 'uploaded_files', [])
        if uploaded_files:
            file_id = random.choice(uploaded_files)
            with self.client.get(f"/storage/metadata/{file_id}", headers=self.headers) as response:
                pass

class AIModelsLoadTest(APILoadTestUser):
    """Load tests for AI Models Service"""
    
    host = LOAD_TEST_CONFIG["AI_MODELS_URL"]
    
    @task(2)
    def text_embedding(self):
        """Test text embedding"""
        texts = [
            "A cat sitting on a chair",
            "Dog running in the park", 
            "Car driving on highway",
            "Person walking on street",
            "Bird flying in sky"
        ]
        
        request_data = {
            "texts": random.sample(texts, random.randint(1, 3))
        }
        
        with self.client.post("/embed/text", json=request_data, headers=self.headers) as response:
            pass
    
    @task(3)
    def image_classification(self):
        """Test image classification"""
        image_data = TestDataGenerator.generate_test_image()
        image_b64 = base64.b64encode(image_data).decode('utf-8')
        
        files = {"file": ("test_image.png", image_data, "image/png")}
        data = {"labels": json.dumps(["cat", "dog", "car", "person"])}
        
        with self.client.post("/classify/image", files=files, data=data, headers=self.headers) as response:
            pass
    
    @task(1)
    def model_info(self):
        """Test model information endpoint"""
        with self.client.get("/model/info", headers=self.headers) as response:
            pass
    
    @task(1)
    def health_check(self):
        """Test health endpoint"""
        with self.client.get("/health") as response:
            pass

class WebSocketLoadTest(HttpUser):
    """Load tests for WebSocket connections (Collaboration)"""
    
    host = LOAD_TEST_CONFIG["COLLABORATION_URL"]
    wait_time = between(2, 5)
    
    def on_start(self):
        """Initialize WebSocket connection"""
        self.user_id = f"ws_user_{random.randint(1, 1000)}"
        # In a real implementation, we'd establish WebSocket connections here
        # For now, we'll test the HTTP endpoints
    
    @task(2)
    def get_active_sessions(self):
        """Test getting active collaboration sessions"""
        with self.client.get("/sessions") as response:
            pass
    
    @task(1)
    def get_session_info(self):
        """Test getting session information"""
        session_id = f"test_session_{random.randint(1, 100)}"
        with self.client.get(f"/sessions/{session_id}") as response:
            pass
    
    @task(1)
    def health_check(self):
        """Test health endpoint"""
        with self.client.get("/health") as response:
            pass

class DatabaseLoadTest(APILoadTestUser):
    """Load tests for database operations"""
    
    host = LOAD_TEST_CONFIG["BASE_URL"]
    
    @task(5)
    def heavy_query_simulation(self):
        """Simulate heavy database queries"""
        # Test pagination with large offsets
        offset = random.randint(0, 1000)
        limit = random.randint(10, 100)
        
        with self.client.get(f"/annotations?offset={offset}&limit={limit}", headers=self.headers) as response:
            pass
    
    @task(3)
    def complex_filter_query(self):
        """Test complex filtering queries"""
        filters = {
            "labels": random.sample(["cat", "dog", "car", "person"], random.randint(1, 3)),
            "confidence_min": random.uniform(0.5, 0.8),
            "confidence_max": random.uniform(0.8, 1.0),
            "created_after": "2023-01-01T00:00:00Z"
        }
        
        query_params = "&".join([f"{k}={v}" for k, v in filters.items()])
        with self.client.get(f"/annotations/search?{query_params}", headers=self.headers) as response:
            pass
    
    @task(2)
    def aggregation_query(self):
        """Test aggregation queries"""
        with self.client.get("/analytics/annotation-stats", headers=self.headers) as response:
            pass

# Custom events for detailed metrics
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Initialize test environment"""
    print("Starting AnnotateAI Load Tests...")
    print(f"Target URLs: {LOAD_TEST_CONFIG}")

@events.test_stop.add_listener  
def on_test_stop(environment, **kwargs):
    """Cleanup after tests"""
    print("AnnotateAI Load Tests completed!")
    
    # Print summary statistics
    stats = environment.stats
    print(f"Total requests: {stats.total.num_requests}")
    print(f"Total failures: {stats.total.num_failures}")
    print(f"Average response time: {stats.total.avg_response_time:.2f}ms")
    print(f"RPS: {stats.total.current_rps:.2f}")

# Load test scenarios
class LightLoadScenario(APILoadTestUser):
    """Light load scenario - normal usage"""
    host = LOAD_TEST_CONFIG["BASE_URL"]
    weight = 3
    
    @task(10)
    def browse_projects(self):
        with self.client.get("/projects", headers=self.headers):
            pass
    
    @task(5)
    def view_annotations(self):
        with self.client.get("/annotations", headers=self.headers):
            pass
    
    @task(2)
    def create_annotation(self):
        annotation_data = TestDataGenerator.generate_test_annotation()
        with self.client.post("/annotations", json=annotation_data, headers=self.headers):
            pass

class HeavyLoadScenario(APILoadTestUser):
    """Heavy load scenario - intensive operations"""
    host = LOAD_TEST_CONFIG["BASE_URL"]
    weight = 1
    
    @task(3)
    def bulk_annotation_creation(self):
        """Create multiple annotations in one request"""
        annotations = [TestDataGenerator.generate_test_annotation() for _ in range(10)]
        with self.client.post("/annotations/bulk", json={"annotations": annotations}, headers=self.headers):
            pass
    
    @task(2)
    def complex_search(self):
        """Perform complex search operations"""
        search_params = {
            "query": "cat OR dog",
            "filters": {
                "confidence": {"min": 0.8, "max": 1.0},
                "labels": ["cat", "dog", "animal"]
            },
            "sort": "confidence_desc",
            "limit": 100
        }
        with self.client.post("/search", json=search_params, headers=self.headers):
            pass

class StressTestScenario(APILoadTestUser):
    """Stress test scenario - pushing system limits"""
    host = LOAD_TEST_CONFIG["BASE_URL"]
    weight = 1
    wait_time = between(0.1, 0.5)  # Very frequent requests
    
    @task(5)
    def rapid_fire_requests(self):
        """Send rapid fire requests"""
        endpoints = ["/projects", "/annotations", "/datasets", "/users"]
        endpoint = random.choice(endpoints)
        with self.client.get(endpoint, headers=self.headers):
            pass
    
    @task(2)
    def large_payload_upload(self):
        """Upload large payloads"""
        large_image = TestDataGenerator.generate_test_image(1024, 1024)  # Large image
        files = {"file": ("large_image.png", large_image, "image/png")}
        with self.client.post("/storage/upload", files=files, headers=self.headers):
            pass

# Performance benchmarks
class PerformanceBenchmarks:
    """Performance benchmarks and SLA definitions"""
    
    # Response time SLAs (in milliseconds)
    SLA_RESPONSE_TIMES = {
        "authentication": 200,
        "list_projects": 500,
        "create_annotation": 300,
        "upload_image": 2000,
        "ai_inference": 5000,
        "search": 1000
    }
    
    # Throughput SLAs (requests per second)
    SLA_THROUGHPUT = {
        "total_rps": 100,
        "authentication_rps": 50,
        "annotation_rps": 30,
        "upload_rps": 10
    }
    
    # Error rate SLAs (percentage)
    SLA_ERROR_RATES = {
        "total_error_rate": 1.0,  # 1% max error rate
        "critical_error_rate": 0.1  # 0.1% max error rate for critical operations
    }

# Custom Locust tasks for specific scenarios
def run_annotation_workflow():
    """Complete annotation workflow load test"""
    # This would run a complete workflow:
    # 1. Login
    # 2. Create project
    # 3. Upload images
    # 4. Create annotations
    # 5. Review annotations
    # 6. Export results
    pass

def run_collaboration_stress_test():
    """Stress test for collaboration features"""
    # This would test:
    # 1. Multiple users joining same session
    # 2. Rapid operation broadcasting
    # 3. Conflict resolution under load
    # 4. WebSocket connection stability
    pass

def run_ai_model_performance_test():
    """Performance test for AI model inference"""
    # This would test:
    # 1. Image classification throughput
    # 2. Text embedding performance
    # 3. Batch processing capabilities
    # 4. GPU utilization under load
    pass

# Configuration for different test environments
ENVIRONMENT_CONFIGS = {
    "development": {
        "users": 10,
        "spawn_rate": 2,
        "run_time": "5m"
    },
    "staging": {
        "users": 50,
        "spawn_rate": 5,
        "run_time": "15m"
    },
    "production": {
        "users": 200,
        "spawn_rate": 10,
        "run_time": "30m"
    }
}

if __name__ == "__main__":
    # Example usage:
    # locust -f load_test_suite.py --users 100 --spawn-rate 10 --run-time 10m
    pass 