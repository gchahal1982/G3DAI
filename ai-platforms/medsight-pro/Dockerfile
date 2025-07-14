# Multi-stage build for faster development and smaller production image
FROM node:18-alpine AS node-deps

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
RUN npm install --only=production

# Python build stage
FROM python:3.10-slim AS python-deps

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Final production stage
FROM python:3.10-slim AS production

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -s /bin/bash medsight

# Set working directory
WORKDIR /app

# Copy Python dependencies from build stage
COPY --from=python-deps /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=python-deps /usr/local/bin /usr/local/bin

# Copy Node.js dependencies from build stage
COPY --from=node-deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs data uploads temp && \
    chown -R medsight:medsight /app

# Switch to non-root user
USER medsight

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"] 