#!/usr/bin/env python3
"""
AnnotateAI CLIP Service
CLIP (Contrastive Language-Image Pre-training) for image-text understanding and multimodal search
"""

import torch
import clip
import numpy as np
from PIL import Image
import asyncio
import logging
from typing import List, Dict, Any, Optional, Tuple
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager
import tempfile
import os
import redis.asyncio as redis
import json
import hashlib
from pathlib import Path
import io
import base64
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
class Config:
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    MODEL_NAME = os.getenv("CLIP_MODEL_NAME", "ViT-B/32")  # or ViT-L/14, RN50, etc.
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    BATCH_SIZE = int(os.getenv("CLIP_BATCH_SIZE", "32"))
    CACHE_EMBEDDINGS = os.getenv("CACHE_EMBEDDINGS", "true").lower() == "true"
    EMBEDDING_DIM = 512  # for ViT-B/32

config = Config()

# Global variables
model = None
preprocess = None
redis_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    global model, preprocess, redis_client
    
    # Startup
    logger.info("Starting CLIP Service...")
    logger.info(f"Using device: {config.DEVICE}")
    logger.info(f"Loading CLIP model: {config.MODEL_NAME}")
    
    # Load CLIP model
    model, preprocess = clip.load(config.MODEL_NAME, device=config.DEVICE)
    model.eval()
    
    # Initialize Redis client
    redis_client = redis.from_url(config.REDIS_URL)
    
    logger.info("CLIP Service started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down CLIP Service...")
    if redis_client:
        await redis_client.close()

# FastAPI app
app = FastAPI(
    title="AnnotateAI CLIP Service",
    description="CLIP model for image-text understanding and multimodal search",
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
class TextEmbeddingRequest(BaseModel):
    texts: List[str] = Field(..., description="List of text strings to encode")

class ImageTextSimilarityRequest(BaseModel):
    texts: List[str] = Field(..., description="List of text descriptions")
    image_base64: Optional[str] = Field(None, description="Base64 encoded image")

class TextSimilarityRequest(BaseModel):
    query_text: str = Field(..., description="Query text")
    candidate_texts: List[str] = Field(..., description="List of candidate texts")

class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    search_type: str = Field("semantic", description="Type of search: 'semantic', 'exact', 'hybrid'")
    top_k: int = Field(10, description="Number of results to return")

class EmbeddingResponse(BaseModel):
    embeddings: List[List[float]]
    model_name: str
    embedding_dim: int

class SimilarityResponse(BaseModel):
    similarities: List[float]
    best_match_index: int
    best_match_score: float

class SearchResult(BaseModel):
    item_id: str
    score: float
    text: Optional[str] = None
    metadata: Dict[str, Any] = {}

class SearchResponse(BaseModel):
    results: List[SearchResult]
    query: str
    total_results: int
    search_time_ms: float

# Utility functions
def get_cache_key(content: str, prefix: str = "clip") -> str:
    """Generate cache key for content"""
    content_hash = hashlib.md5(content.encode()).hexdigest()
    return f"{prefix}:embedding:{content_hash}"

async def get_cached_embedding(cache_key: str) -> Optional[np.ndarray]:
    """Get cached embedding from Redis"""
    if not config.CACHE_EMBEDDINGS:
        return None
    
    try:
        cached = await redis_client.get(cache_key)
        if cached:
            embedding_data = json.loads(cached)
            return np.array(embedding_data['embedding'])
    except Exception as e:
        logger.warning(f"Failed to get cached embedding: {e}")
    
    return None

async def cache_embedding(cache_key: str, embedding: np.ndarray, ttl: int = 3600):
    """Cache embedding in Redis"""
    if not config.CACHE_EMBEDDINGS:
        return
    
    try:
        embedding_data = {
            'embedding': embedding.tolist(),
            'model': config.MODEL_NAME,
            'created_at': datetime.utcnow().isoformat()
        }
        await redis_client.setex(cache_key, ttl, json.dumps(embedding_data))
    except Exception as e:
        logger.warning(f"Failed to cache embedding: {e}")

def encode_texts(texts: List[str]) -> np.ndarray:
    """Encode texts to embeddings using CLIP"""
    with torch.no_grad():
        # Tokenize texts
        text_tokens = clip.tokenize(texts, truncate=True).to(config.DEVICE)
        
        # Encode texts
        text_features = model.encode_text(text_tokens)
        text_features = text_features / text_features.norm(dim=-1, keepdim=True)
        
        return text_features.cpu().numpy()

def encode_image(image: Image.Image) -> np.ndarray:
    """Encode image to embedding using CLIP"""
    with torch.no_grad():
        # Preprocess image
        image_tensor = preprocess(image).unsqueeze(0).to(config.DEVICE)
        
        # Encode image
        image_features = model.encode_image(image_tensor)
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)
        
        return image_features.cpu().numpy()

def compute_similarity(embeddings1: np.ndarray, embeddings2: np.ndarray) -> np.ndarray:
    """Compute cosine similarity between embeddings"""
    # Normalize embeddings
    embeddings1 = embeddings1 / np.linalg.norm(embeddings1, axis=1, keepdims=True)
    embeddings2 = embeddings2 / np.linalg.norm(embeddings2, axis=1, keepdims=True)
    
    # Compute similarity
    similarity = np.dot(embeddings1, embeddings2.T)
    return similarity

def process_image_from_upload(upload_file: UploadFile) -> Image.Image:
    """Process uploaded image file"""
    try:
        # Read image
        image_data = upload_file.file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        return image
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {e}")

def process_image_from_base64(base64_string: str) -> Image.Image:
    """Process base64 encoded image"""
    try:
        # Decode base64
        if base64_string.startswith('data:image'):
            base64_string = base64_string.split(',')[1]
        
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        return image
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 image: {e}")

# API Endpoints
@app.post("/embed/text", response_model=EmbeddingResponse)
async def embed_text(request: TextEmbeddingRequest):
    """Generate embeddings for text strings"""
    try:
        embeddings_list = []
        
        for text in request.texts:
            # Check cache first
            cache_key = get_cache_key(text, "clip_text")
            cached_embedding = await get_cached_embedding(cache_key)
            
            if cached_embedding is not None:
                embeddings_list.append(cached_embedding)
            else:
                # Encode text
                embedding = encode_texts([text])[0]
                embeddings_list.append(embedding)
                
                # Cache embedding
                await cache_embedding(cache_key, embedding)
        
        # Convert to list of lists for JSON serialization
        embeddings = [emb.tolist() for emb in embeddings_list]
        
        return EmbeddingResponse(
            embeddings=embeddings,
            model_name=config.MODEL_NAME,
            embedding_dim=config.EMBEDDING_DIM
        )
        
    except Exception as e:
        logger.error(f"Text embedding failed: {e}")
        raise HTTPException(status_code=500, detail=f"Text embedding failed: {e}")

@app.post("/embed/image")
async def embed_image(file: UploadFile = File(...)):
    """Generate embedding for uploaded image"""
    try:
        # Process image
        image = process_image_from_upload(file)
        
        # Generate cache key based on image hash
        image_bytes = io.BytesIO()
        image.save(image_bytes, format='PNG')
        image_hash = hashlib.md5(image_bytes.getvalue()).hexdigest()
        cache_key = get_cache_key(image_hash, "clip_image")
        
        # Check cache
        cached_embedding = await get_cached_embedding(cache_key)
        if cached_embedding is not None:
            embedding = cached_embedding
        else:
            # Encode image
            embedding = encode_image(image)[0]
            
            # Cache embedding
            await cache_embedding(cache_key, embedding)
        
        return {
            "embedding": embedding.tolist(),
            "model_name": config.MODEL_NAME,
            "embedding_dim": config.EMBEDDING_DIM,
            "image_size": image.size
        }
        
    except Exception as e:
        logger.error(f"Image embedding failed: {e}")
        raise HTTPException(status_code=500, detail=f"Image embedding failed: {e}")

@app.post("/similarity/image-text", response_model=SimilarityResponse)
async def compute_image_text_similarity(request: ImageTextSimilarityRequest):
    """Compute similarity between image and text descriptions"""
    try:
        # Encode texts
        text_embeddings = encode_texts(request.texts)
        
        # Handle image
        if request.image_base64:
            image = process_image_from_base64(request.image_base64)
            image_embedding = encode_image(image)[0]
        else:
            raise HTTPException(status_code=400, detail="No image provided")
        
        # Compute similarities
        similarities = compute_similarity(
            image_embedding.reshape(1, -1),
            text_embeddings
        )[0]
        
        # Find best match
        best_match_index = int(np.argmax(similarities))
        best_match_score = float(similarities[best_match_index])
        
        return SimilarityResponse(
            similarities=similarities.tolist(),
            best_match_index=best_match_index,
            best_match_score=best_match_score
        )
        
    except Exception as e:
        logger.error(f"Image-text similarity computation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Similarity computation failed: {e}")

@app.post("/similarity/text", response_model=SimilarityResponse)
async def compute_text_similarity(request: TextSimilarityRequest):
    """Compute similarity between query text and candidate texts"""
    try:
        # Encode query text
        query_embedding = encode_texts([request.query_text])[0]
        
        # Encode candidate texts
        candidate_embeddings = encode_texts(request.candidate_texts)
        
        # Compute similarities
        similarities = compute_similarity(
            query_embedding.reshape(1, -1),
            candidate_embeddings
        )[0]
        
        # Find best match
        best_match_index = int(np.argmax(similarities))
        best_match_score = float(similarities[best_match_index])
        
        return SimilarityResponse(
            similarities=similarities.tolist(),
            best_match_index=best_match_index,
            best_match_score=best_match_score
        )
        
    except Exception as e:
        logger.error(f"Text similarity computation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Similarity computation failed: {e}")

@app.post("/classify/image")
async def classify_image_with_text(
    file: UploadFile = File(...),
    labels: List[str] = None
):
    """Classify image using text labels (zero-shot classification)"""
    if not labels:
        # Default labels for demo
        labels = [
            "a photo of a cat",
            "a photo of a dog", 
            "a photo of a car",
            "a photo of a person",
            "a photo of a building",
            "a photo of nature",
            "a photo of food",
            "a photo of an animal"
        ]
    
    try:
        # Process image
        image = process_image_from_upload(file)
        
        # Encode image and labels
        image_embedding = encode_image(image)[0]
        label_embeddings = encode_texts(labels)
        
        # Compute similarities (which are classification scores)
        similarities = compute_similarity(
            image_embedding.reshape(1, -1),
            label_embeddings
        )[0]
        
        # Apply softmax to get probabilities
        probabilities = torch.softmax(torch.tensor(similarities * 100), dim=0).numpy()
        
        # Create results
        results = []
        for i, (label, prob) in enumerate(zip(labels, probabilities)):
            results.append({
                "label": label,
                "confidence": float(prob),
                "similarity": float(similarities[i])
            })
        
        # Sort by confidence
        results.sort(key=lambda x: x['confidence'], reverse=True)
        
        return {
            "results": results,
            "image_size": image.size,
            "model_name": config.MODEL_NAME
        }
        
    except Exception as e:
        logger.error(f"Image classification failed: {e}")
        raise HTTPException(status_code=500, detail=f"Classification failed: {e}")

@app.post("/search/semantic", response_model=SearchResponse)
async def semantic_search(request: SearchRequest):
    """Perform semantic search using CLIP embeddings"""
    import time
    start_time = time.time()
    
    try:
        # This is a simplified implementation
        # In production, you'd have a vector database with precomputed embeddings
        
        # For demo, we'll create some sample data
        sample_texts = [
            "A red car driving on the highway",
            "A person walking in the park",
            "A cat sitting on a windowsill",
            "A beautiful sunset over mountains",
            "Children playing in the playground",
            "A delicious pizza with cheese",
            "A modern office building",
            "A dog running on the beach"
        ]
        
        # Encode query
        query_embedding = encode_texts([request.query])[0]
        
        # Encode sample texts
        sample_embeddings = encode_texts(sample_texts)
        
        # Compute similarities
        similarities = compute_similarity(
            query_embedding.reshape(1, -1),
            sample_embeddings
        )[0]
        
        # Create results
        results = []
        for i, (text, similarity) in enumerate(zip(sample_texts, similarities)):
            results.append(SearchResult(
                item_id=f"item_{i}",
                score=float(similarity),
                text=text,
                metadata={"index": i}
            ))
        
        # Sort by score and take top_k
        results.sort(key=lambda x: x.score, reverse=True)
        results = results[:request.top_k]
        
        search_time = (time.time() - start_time) * 1000
        
        return SearchResponse(
            results=results,
            query=request.query,
            total_results=len(results),
            search_time_ms=search_time
        )
        
    except Exception as e:
        logger.error(f"Semantic search failed: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {e}")

@app.get("/model/info")
async def get_model_info():
    """Get information about the loaded CLIP model"""
    return {
        "model_name": config.MODEL_NAME,
        "device": config.DEVICE,
        "embedding_dimension": config.EMBEDDING_DIM,
        "batch_size": config.BATCH_SIZE,
        "cache_enabled": config.CACHE_EMBEDDINGS,
        "available_models": clip.available_models()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "clip-service",
        "model": config.MODEL_NAME,
        "device": config.DEVICE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8012) 