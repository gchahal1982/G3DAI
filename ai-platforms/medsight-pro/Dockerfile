# MedSight Pro - Multi-stage Dockerfile
# Medical Imaging & AI Analysis Platform

# ==============================================================================
# Stage 1: Base Image with Common Dependencies
# ==============================================================================
FROM ubuntu:22.04 as base

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production
ENV TZ=UTC

# Set working directory
WORKDIR /app

# Install system dependencies with retry logic
RUN apt-get update && apt-get install -y software-properties-common && \
    add-apt-repository universe && \
    for i in $(seq 1 5); do apt-get update && apt-get install -y \
    # System essentials
    curl \
    wget \
    git \
    build-essential \
    ca-certificates \
    gnupg \
    lsb-release \
    # Python dependencies
    python3.10 \
    python3.10-dev \
    python3-pip \
    python3.10-venv \
    # Medical imaging libraries
    libgdcm-dev \
    libinsighttoolkit-dev \
    libvtk9-dev \
    # Image processing libraries
    libopencv-dev \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libgif-dev \
    # Database clients
    postgresql-client \
    redis-tools \
    # Security and encryption
    libssl-dev \
    libffi-dev \
    # Medical device integration
    libudev-dev \
    libusb-1.0-0-dev \
    # Networking
    netcat \
    iputils-ping \
    && break || sleep 2; done \
    # Cleanup
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install Node.js 18.x
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Create application user for security
RUN groupadd -r medsight && useradd -r -g medsight -m -d /app -s /sbin/nologin medsight

# ==============================================================================
# Stage 2: Python Dependencies and AI Models
# ==============================================================================
FROM base as python-deps

# Install Poetry for Python dependency management
RUN pip3 install --upgrade pip setuptools wheel
RUN pip3 install poetry==1.7.1

# Configure Poetry
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VENV_IN_PROJECT=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

# Copy Python dependency files
COPY pyproject.toml poetry.lock* requirements.txt ./

# Install Python dependencies
RUN poetry install --only=main --no-root && rm -rf $POETRY_CACHE_DIR

# Alternative: Install from requirements.txt if Poetry is not preferred
# RUN pip3 install -r requirements.txt

# Create virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install medical-specific Python packages
RUN pip3 install --no-cache-dir \
    torch==2.1.0 \
    torchvision==0.16.0 \
    tensorflow==2.13.0 \
    pydicom==2.4.3 \
    simpleitk==2.3.1 \
    vtk==9.3.0 \
    monai==1.3.0 \
    fastapi==0.104.1 \
    uvicorn==0.24.0

# ==============================================================================
# Stage 3: Node.js Dependencies and Frontend Build
# ==============================================================================
FROM base as node-deps

# Copy package files
COPY package.json package-lock.json* ./

# Install Node.js dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ src/
COPY public/ public/
COPY next.config.js ./
COPY tailwind.config.js ./
COPY tsconfig.json ./
COPY postcss.config.js ./

# Build Next.js application
RUN npm run build

# ==============================================================================
# Stage 4: AI Models and Medical Data
# ==============================================================================
FROM python-deps as ai-models

# Create directories for AI models and medical data
RUN mkdir -p /opt/medsight/models \
    /opt/medsight/dicom-storage \
    /opt/medsight/temp \
    /opt/medsight/logs \
    /opt/medsight/backups

# Copy AI model files (placeholder - replace with actual models)
# COPY models/ /opt/medsight/models/

# Set up model directories with proper permissions
RUN chown -R medsight:medsight /opt/medsight

# ==============================================================================
# Stage 5: Production Image
# ==============================================================================
FROM base as production

# Copy Python virtual environment
COPY --from=python-deps /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy Node.js build
COPY --from=node-deps /app/node_modules ./node_modules
COPY --from=node-deps /app/.next ./.next
COPY --from=node-deps /app/public ./public

# Copy AI models and data directories
COPY --from=ai-models /opt/medsight /opt/medsight

# Copy application source code
COPY src/ src/
COPY server.js ./
COPY package.json ./

# Copy configuration files
COPY next.config.js ./
COPY tailwind.config.js ./
COPY tsconfig.json ./
COPY prisma/ prisma/

# Copy medical configuration files
COPY configs/ configs/
COPY scripts/ scripts/

# Create necessary directories
RUN mkdir -p \
    /app/uploads \
    /app/logs \
    /app/temp \
    /var/log/medsight \
    /etc/medsight

# Copy medical compliance and security configurations
COPY docker/security/ /etc/medsight/security/
COPY docker/compliance/ /etc/medsight/compliance/

# Set up proper permissions
RUN chown -R medsight:medsight /app /opt/medsight /var/log/medsight /etc/medsight

# Install security and monitoring tools
RUN apt-get update && apt-get install -y \
    # Security monitoring
    auditd \
    fail2ban \
    # Medical device compliance
    openssl \
    # Performance monitoring
    htop \
    iotop \
    # Network tools
    tcpdump \
    netstat-nat \
    && rm -rf /var/lib/apt/lists/*

# Configure audit logging for HIPAA compliance
RUN echo "# HIPAA Audit Rules" >> /etc/audit/rules.d/hipaa.rules \
    && echo "-w /app -p rwxa -k medsight-access" >> /etc/audit/rules.d/hipaa.rules \
    && echo "-w /opt/medsight -p rwxa -k medical-data-access" >> /etc/audit/rules.d/hipaa.rules

# Expose ports
EXPOSE 3000 5000 8042 104

# Health check for medical platform
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Set user for security
USER medsight

# Set up environment variables
ENV NODE_ENV=production
ENV PYTHONPATH=/app/src
ENV MEDICAL_DEVICE_MODE=true
ENV HIPAA_COMPLIANCE=true
ENV FDA_VALIDATION=true

# Volume mounts for persistent data
VOLUME ["/opt/medsight/dicom-storage", "/opt/medsight/logs", "/opt/medsight/backups"]

# Start command using supervisor for multi-process management
CMD ["sh", "-c", "npm run migrate && npm start & python3 src/ai/ai_service.py"]

# ==============================================================================
# Alternative: Development Image
# ==============================================================================
FROM base as development

# Install development dependencies
RUN apt-get update && apt-get install -y \
    vim \
    less \
    tmux \
    && rm -rf /var/lib/apt/lists/*

# Copy Python virtual environment
COPY --from=python-deps /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy everything for development
COPY . .

# Install all Node.js dependencies (including dev)
RUN npm install

# Install development Python packages
RUN pip3 install \
    jupyter \
    ipython \
    pytest \
    black \
    mypy \
    flake8

# Set development environment
ENV NODE_ENV=development
ENV DEBUG=true

# Expose additional ports for development
EXPOSE 3000 5000 8042 104 8888 9090

USER medsight

CMD ["npm", "run", "dev"]

# ==============================================================================
# Alternative: AI-Only Image for Microservices
# ==============================================================================
FROM python-deps as ai-service

# Copy only AI-related code
COPY src/ai/ src/ai/
COPY src/core/ src/core/
COPY configs/ai/ configs/ai/

# Set up AI service environment
ENV PYTHONPATH=/app/src
ENV AI_SERVICE_MODE=true

# Expose AI service port
EXPOSE 5000

USER medsight

CMD ["python3", "src/ai/ai_service.py"]

# ==============================================================================
# Docker Build Commands:
# ==============================================================================
# Build production image:
# docker build --target production -t medsight-pro:latest .
#
# Build development image:
# docker build --target development -t medsight-pro:dev .
#
# Build AI-only service:
# docker build --target ai-service -t medsight-ai:latest .
#
# Build with BuildKit for better caching:
# DOCKER_BUILDKIT=1 docker build --target production -t medsight-pro:latest .
# ============================================================================== 