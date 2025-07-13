#!/usr/bin/env python3
"""
AnnotateAI API Gateway
Central API gateway with GraphQL, REST endpoints, and service routing
"""

from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import httpx
import logging
from typing import Dict, Any, Optional, List
import time
import asyncio
from datetime import datetime
import os
import redis.asyncio as redis
from pydantic import BaseModel
import json
from urllib.parse import urljoin

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
class Config:
    # Service URLs
    AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")
    AI_MODEL_SERVICE_URL = os.getenv("AI_MODEL_SERVICE_URL", "http://localhost:8002")
    PROCESSING_3D_SERVICE_URL = os.getenv("PROCESSING_3D_SERVICE_URL", "http://localhost:8003")
    VIDEO_PROCESSING_SERVICE_URL = os.getenv("VIDEO_PROCESSING_SERVICE_URL", "http://localhost:8004")
    TRAINING_SERVICE_URL = os.getenv("TRAINING_SERVICE_URL", "http://localhost:8005")
    XR_SERVICE_URL = os.getenv("XR_SERVICE_URL", "http://localhost:8006")
    SYNTHETIC_DATA_SERVICE_URL = os.getenv("SYNTHETIC_DATA_SERVICE_URL", "http://localhost:8007")
    DATA_PIPELINE_SERVICE_URL = os.getenv("DATA_PIPELINE_SERVICE_URL", "http://localhost:8008")
    
    # Redis for caching and rate limiting
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Security
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    
    # Rate limiting
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))
    
    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")
    
    # Trusted hosts
    TRUSTED_HOSTS = os.getenv("TRUSTED_HOSTS", "localhost,127.0.0.1,0.0.0.0").split(",")

config = Config()

# Service registry
SERVICE_REGISTRY = {
    "auth": config.AUTH_SERVICE_URL,
    "ai-models": config.AI_MODEL_SERVICE_URL,
    "3d-processing": config.PROCESSING_3D_SERVICE_URL,
    "video-processing": config.VIDEO_PROCESSING_SERVICE_URL,
    "training": config.TRAINING_SERVICE_URL,
    "xr": config.XR_SERVICE_URL,
    "synthetic-data": config.SYNTHETIC_DATA_SERVICE_URL,
    "data-pipeline": config.DATA_PIPELINE_SERVICE_URL,
}

# Global clients
http_client: Optional[httpx.AsyncClient] = None
redis_client: Optional[redis.Redis] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    global http_client, redis_client
    
    # Startup
    logger.info("Starting API Gateway...")
    
    # Initialize HTTP client with connection pooling
    http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(30.0),
        limits=httpx.Limits(max_keepalive_connections=100, max_connections=200),
        headers={"User-Agent": "AnnotateAI-Gateway/1.0"}
    )
    
    # Initialize Redis client
    redis_client = redis.from_url(config.REDIS_URL)
    
    # Health check all services
    await health_check_services()
    
    yield
    
    # Shutdown
    logger.info("Shutting down API Gateway...")
    if http_client:
        await http_client.aclose()
    if redis_client:
        await redis_client.close()

# FastAPI app
app = FastAPI(
    title="AnnotateAI API Gateway",
    description="Central API gateway for AnnotateAI platform services",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=config.TRUSTED_HOSTS)

# Security
security = HTTPBearer(auto_error=False)

# Models
class ServiceHealth(BaseModel):
    service: str
    status: str
    response_time: float
    timestamp: datetime

class GatewayHealth(BaseModel):
    gateway_status: str
    services: List[ServiceHealth]
    total_services: int
    healthy_services: int
    timestamp: datetime

class APIMetrics(BaseModel):
    endpoint: str
    method: str
    status_code: int
    response_time: float
    timestamp: datetime
    user_id: Optional[str] = None

# Utility functions
async def health_check_services() -> Dict[str, ServiceHealth]:
    """Check health of all registered services"""
    health_results = {}
    
    for service_name, service_url in SERVICE_REGISTRY.items():
        start_time = time.time()
        try:
            response = await http_client.get(f"{service_url}/health", timeout=5.0)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                status = "healthy"
            else:
                status = "unhealthy"
                
        except Exception as e:
            response_time = time.time() - start_time
            status = "unreachable"
            logger.warning(f"Service {service_name} health check failed: {e}")
        
        health_results[service_name] = ServiceHealth(
            service=service_name,
            status=status,
            response_time=response_time,
            timestamp=datetime.utcnow()
        )
    
    return health_results

async def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    """Get user information from auth service"""
    try:
        response = await http_client.get(
            f"{config.AUTH_SERVICE_URL}/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            return None
            
    except Exception as e:
        logger.error(f"Failed to get user from token: {e}")
        return None

async def check_rate_limit(request: Request) -> bool:
    """Check if request is within rate limits"""
    client_ip = request.client.host
    current_time = int(time.time())
    window_start = current_time - config.RATE_LIMIT_WINDOW
    
    # Use Redis to track requests
    key = f"rate_limit:{client_ip}"
    
    try:
        # Add current request
        await redis_client.zadd(key, {str(current_time): current_time})
        
        # Remove old requests outside window
        await redis_client.zremrangebyscore(key, 0, window_start)
        
        # Count requests in current window
        request_count = await redis_client.zcard(key)
        
        # Set expiration for cleanup
        await redis_client.expire(key, config.RATE_LIMIT_WINDOW)
        
        return request_count <= config.RATE_LIMIT_REQUESTS
        
    except Exception as e:
        logger.error(f"Rate limit check failed: {e}")
        return True  # Allow request if rate limiting fails

async def log_api_metrics(request: Request, response_time: float, status_code: int, user_id: Optional[str] = None):
    """Log API metrics for monitoring"""
    try:
        metrics = APIMetrics(
            endpoint=str(request.url.path),
            method=request.method,
            status_code=status_code,
            response_time=response_time,
            timestamp=datetime.utcnow(),
            user_id=user_id
        )
        
        # Store in Redis for real-time monitoring
        await redis_client.lpush("api_metrics", metrics.json())
        await redis_client.ltrim("api_metrics", 0, 1000)  # Keep last 1000 metrics
        
    except Exception as e:
        logger.error(f"Failed to log metrics: {e}")

# Middleware for request processing
@app.middleware("http")
async def process_request(request: Request, call_next):
    """Process all requests through the gateway"""
    start_time = time.time()
    
    # Check rate limiting
    if not await check_rate_limit(request):
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded"}
        )
    
    # Get user from token if present
    user_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        user_data = await get_user_from_token(token)
        if user_data:
            user_id = user_data.get("id")
    
    # Process request
    response = await call_next(request)
    
    # Log metrics
    process_time = time.time() - start_time
    await log_api_metrics(request, process_time, response.status_code, user_id)
    
    # Add performance headers
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-Gateway-Version"] = "1.0.0"
    
    return response

# Authentication dependency
async def get_current_user(request: Request) -> Optional[Dict[str, Any]]:
    """Get current user from request"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.split(" ")[1]
    return await get_user_from_token(token)

def require_auth(request: Request) -> Dict[str, Any]:
    """Require authentication"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # This will be validated by the downstream service
    return {"authenticated": True}

# Service proxy functions
async def proxy_request(
    service_name: str,
    path: str,
    method: str,
    request: Request,
    **kwargs
) -> Dict[str, Any]:
    """Proxy request to downstream service"""
    
    if service_name not in SERVICE_REGISTRY:
        raise HTTPException(
            status_code=404,
            detail=f"Service {service_name} not found"
        )
    
    service_url = SERVICE_REGISTRY[service_name]
    url = urljoin(service_url, path)
    
    # Prepare headers
    headers = dict(request.headers)
    headers.pop("host", None)  # Remove host header
    
    # Prepare request data
    request_data = {
        "method": method,
        "url": url,
        "headers": headers,
        "timeout": 30.0,
        **kwargs
    }
    
    # Add body for POST/PUT requests
    if method.upper() in ["POST", "PUT", "PATCH"]:
        try:
            body = await request.body()
            if body:
                request_data["content"] = body
        except Exception as e:
            logger.error(f"Failed to read request body: {e}")
    
    # Make request to downstream service
    try:
        response = await http_client.request(**request_data)
        
        # Return response data
        try:
            return response.json()
        except:
            return {"data": response.text, "status_code": response.status_code}
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Service timeout"
        )
    except httpx.RequestError as e:
        logger.error(f"Request to {service_name} failed: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Service {service_name} unavailable"
        )

# API Routes

# Health and monitoring
@app.get("/health", response_model=GatewayHealth)
async def health_check():
    """Comprehensive health check"""
    services = await health_check_services()
    healthy_count = sum(1 for s in services.values() if s.status == "healthy")
    
    gateway_status = "healthy" if healthy_count == len(services) else "degraded"
    
    return GatewayHealth(
        gateway_status=gateway_status,
        services=list(services.values()),
        total_services=len(services),
        healthy_services=healthy_count,
        timestamp=datetime.utcnow()
    )

@app.get("/metrics")
async def get_metrics():
    """Get API metrics"""
    try:
        metrics_data = await redis_client.lrange("api_metrics", 0, 100)
        metrics = [json.loads(m) for m in metrics_data]
        return {"metrics": metrics}
    except Exception as e:
        logger.error(f"Failed to get metrics: {e}")
        return {"metrics": []}

@app.get("/services")
async def list_services():
    """List all registered services"""
    return {
        "services": SERVICE_REGISTRY,
        "count": len(SERVICE_REGISTRY)
    }

# Authentication routes (proxy to auth service)
@app.post("/auth/register")
async def register(request: Request):
    """Register new user"""
    return await proxy_request("auth", "/auth/register", "POST", request)

@app.post("/auth/login")
async def login(request: Request):
    """User login"""
    return await proxy_request("auth", "/auth/login", "POST", request)

@app.post("/auth/logout")
async def logout(request: Request):
    """User logout"""
    return await proxy_request("auth", "/auth/logout", "POST", request)

@app.get("/auth/me")
async def get_user_info(request: Request):
    """Get current user info"""
    return await proxy_request("auth", "/auth/me", "GET", request)

@app.post("/auth/refresh")
async def refresh_token(request: Request):
    """Refresh access token"""
    return await proxy_request("auth", "/auth/refresh", "POST", request)

# AI Model routes
@app.get("/ai-models")
async def list_ai_models(request: Request):
    """List available AI models"""
    return await proxy_request("ai-models", "/models", "GET", request)

@app.post("/ai-models/inference")
async def run_inference(request: Request):
    """Run AI model inference"""
    return await proxy_request("ai-models", "/inference", "POST", request)

# 3D Processing routes
@app.post("/3d-processing/reconstruct")
async def reconstruct_3d(request: Request):
    """3D reconstruction from images"""
    return await proxy_request("3d-processing", "/reconstruct", "POST", request)

@app.post("/3d-processing/point-cloud")
async def process_point_cloud(request: Request):
    """Process point cloud data"""
    return await proxy_request("3d-processing", "/point-cloud", "POST", request)

# Video Processing routes
@app.post("/video-processing/track")
async def track_objects(request: Request):
    """Track objects in video"""
    return await proxy_request("video-processing", "/track", "POST", request)

@app.post("/video-processing/analyze")
async def analyze_video(request: Request):
    """Analyze video content"""
    return await proxy_request("video-processing", "/analyze", "POST", request)

# Training routes
@app.post("/training/jobs")
async def create_training_job(request: Request):
    """Create new training job"""
    return await proxy_request("training", "/jobs", "POST", request)

@app.get("/training/jobs")
async def list_training_jobs(request: Request):
    """List training jobs"""
    return await proxy_request("training", "/jobs", "GET", request)

# XR routes
@app.post("/xr/sessions")
async def create_xr_session(request: Request):
    """Create XR annotation session"""
    return await proxy_request("xr", "/sessions", "POST", request)

# Synthetic Data routes
@app.post("/synthetic-data/generate")
async def generate_synthetic_data(request: Request):
    """Generate synthetic data"""
    return await proxy_request("synthetic-data", "/generate", "POST", request)

# Data Pipeline routes
@app.post("/data-pipeline/jobs")
async def create_pipeline_job(request: Request):
    """Create data pipeline job"""
    return await proxy_request("data-pipeline", "/jobs", "POST", request)

# Generic service proxy
@app.api_route("/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def generic_proxy(service: str, path: str, request: Request):
    """Generic proxy for any service endpoint"""
    return await proxy_request(service, f"/{path}", request.method, request)

# WebSocket proxy (for real-time features)
@app.websocket("/ws/{service}")
async def websocket_proxy(websocket, service: str):
    """WebSocket proxy for real-time services"""
    # This would implement WebSocket proxying
    # For now, we'll just accept and close
    await websocket.accept()
    await websocket.send_text(f"WebSocket proxy for {service} not implemented yet")
    await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 