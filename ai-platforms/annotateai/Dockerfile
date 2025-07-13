# Multi-stage Dockerfile for AnnotateAI Platform
# Optimized for development deployment

# Stage 1: Base image with system dependencies
FROM python:3.10-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    TZ=UTC

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Build tools
    build-essential \
    cmake \
    ninja-build \
    # System libraries for computer vision and 3D processing
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    # Audio processing
    libsndfile1 \
    ffmpeg \
    portaudio19-dev \
    alsa-utils \
    # Network and security
    curl \
    wget \
    git \
    openssh-client \
    ca-certificates \
    # Database clients
    postgresql-client \
    redis-tools \
    # Utilities
    unzip \
    vim \
    htop \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd --create-home --shell /bin/bash app
WORKDIR /app
RUN chown app:app /app

# Stage 2: Development environment
FROM base AS development

# Copy requirements and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=app:app . /app/

# Switch to app user
USER app

# Expose ports for development
EXPOSE 8000

# Development command
CMD ["uvicorn", "src.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Stage 3: Production environment
FROM base AS production

# Copy requirements and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=app:app . /app/

# Create necessary directories
RUN mkdir -p /app/data /app/models /app/logs /app/uploads && \
    chown -R app:app /app

# Switch to app user
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Production command
CMD ["uvicorn", "src.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"] 