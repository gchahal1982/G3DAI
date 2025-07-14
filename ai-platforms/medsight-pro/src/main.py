"""
MedSight Pro - Main FastAPI Application
Medical Imaging & AI Analysis Platform
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="MedSight Pro API",
    description="Medical Imaging & AI Analysis Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint for Docker and load balancers"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "MedSight Pro",
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "MedSight Pro API",
        "status": "running",
        "docs": "/api/docs"
    }

@app.get("/api/status")
async def api_status():
    """API status endpoint"""
    return {
        "api_status": "online",
        "medical_imaging": "ready",
        "ai_analysis": "ready",
        "dicom_processing": "ready",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/medical/dicom/status")
async def dicom_status():
    """DICOM processing status"""
    return {
        "dicom_parser": "ready",
        "storage": "connected",
        "processing_queue": "empty",
        "compliance": "HIPAA-ready"
    }

@app.get("/api/ai/models/status")
async def ai_models_status():
    """AI models status"""
    return {
        "computer_vision": "loaded",
        "neural_networks": "ready",
        "medical_ai": "initialized",
        "gpu_acceleration": "available" if os.environ.get("CUDA_VISIBLE_DEVICES") else "cpu-only"
    }

@app.get("/api/medical/dashboard")
async def get_medical_dashboard():
    """Medical dashboard data endpoint"""
    return {
        "user": {
            "name": "Dr. Demo User",
            "role": "Physician",
            "specialization": "Radiology",
            "licenseNumber": "MD123456"
        },
        "metrics": {
            "totalCases": 1247,
            "pendingReviews": 45,
            "completedToday": 128,
            "criticalFindings": 8,
            "aiAccuracy": 0.97,
            "averageReviewTime": "12.5 minutes"
        },
        "systemStatus": {
            "dicomProcessor": "online",
            "aiEngine": "online",
            "database": "connected"
        }
    }

@app.post("/api/medical/audit-log")
async def create_audit_log(audit_data: dict | None = None):
    """Medical audit log endpoint"""
    if audit_data is None:
        audit_data = {}
    
    logger.info(f"Audit log entry: {audit_data}")
    
    return {
        "status": "success",
        "message": "Audit log entry created",
        "audit_id": f"audit_{datetime.utcnow().timestamp()}",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/medical/audit-log")
async def get_audit_logs():
    """Get medical audit logs"""
    return {
        "status": "success",
        "logs": [
            {
                "id": "audit_001",
                "action": "LOGIN_SUCCESS",
                "user": "testuser",
                "timestamp": datetime.utcnow().isoformat(),
                "details": "Demo user login successful"
            }
        ],
        "total": 1,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 