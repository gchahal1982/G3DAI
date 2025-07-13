#!/bin/bash
# AnnotateAI Platform Setup Script
# This script helps you install and configure the AnnotateAI platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}   AnnotateAI Platform Setup Script   ${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check if running on Linux or macOS
    if [[ "$OSTYPE" != "linux-gnu"* ]] && [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "This script is designed for Linux and macOS systems."
        exit 1
    fi
    
    # Check for Python 3.9+
    if command_exists python3; then
        PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        if python3 -c 'import sys; exit(0 if sys.version_info >= (3, 9) else 1)'; then
            print_status "Python $PYTHON_VERSION found ✓"
        else
            print_error "Python 3.9+ is required. Found Python $PYTHON_VERSION"
            exit 1
        fi
    else
        print_error "Python 3 is not installed. Please install Python 3.9+ first."
        exit 1
    fi
    
    # Check available memory (minimum 8GB recommended)
    if command_exists free; then
        MEMORY_GB=$(free -g | awk '/^Mem:/{print $2}')
        if [ "$MEMORY_GB" -lt 8 ]; then
            print_warning "Less than 8GB RAM detected. AnnotateAI may run slowly."
        else
            print_status "Memory: ${MEMORY_GB}GB ✓"
        fi
    fi
    
    # Check disk space (minimum 50GB recommended)
    DISK_SPACE=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$DISK_SPACE" -lt 50 ]; then
        print_warning "Less than 50GB free disk space. You may need more space for models and data."
    else
        print_status "Disk space: ${DISK_SPACE}GB available ✓"
    fi
}

# Install Poetry
install_poetry() {
    if command_exists poetry; then
        print_status "Poetry is already installed ✓"
    else
        print_status "Installing Poetry..."
        curl -sSL https://install.python-poetry.org | python3 -
        export PATH="$HOME/.local/bin:$PATH"
        
        if command_exists poetry; then
            print_status "Poetry installed successfully ✓"
        else
            print_error "Failed to install Poetry. Please install manually: https://python-poetry.org/docs/#installation"
            exit 1
        fi
    fi
}

# Install Docker
install_docker() {
    if command_exists docker; then
        print_status "Docker is already installed ✓"
    else
        print_status "Installing Docker..."
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux installation
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            sudo usermod -aG docker $USER
            rm get-docker.sh
            print_warning "Please log out and back in for Docker group membership to take effect."
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS installation
            print_warning "Please install Docker Desktop for Mac from: https://docs.docker.com/desktop/mac/install/"
            print_warning "After installation, restart this script."
            exit 1
        fi
    fi
    
    # Check Docker Compose
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        print_status "Docker Compose is available ✓"
    else
        print_error "Docker Compose is not available. Please install Docker Desktop or docker-compose-plugin."
        exit 1
    fi
}

# Install NVIDIA Docker (for GPU support)
install_nvidia_docker() {
    if command_exists nvidia-smi; then
        print_status "NVIDIA GPU detected"
        
        if docker run --rm --gpus all nvidia/cuda:12.1-runtime-ubuntu22.04 nvidia-smi >/dev/null 2>&1; then
            print_status "NVIDIA Docker runtime is working ✓"
        else
            print_status "Installing NVIDIA Docker runtime..."
            
            # Install NVIDIA Docker
            distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
            curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
            curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
            
            sudo apt-get update && sudo apt-get install -y nvidia-docker2
            sudo systemctl restart docker
            
            print_status "NVIDIA Docker runtime installed ✓"
        fi
    else
        print_warning "No NVIDIA GPU detected. GPU-accelerated features will not be available."
    fi
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file..."
        cat > .env << EOF
# AnnotateAI Environment Configuration
ENVIRONMENT=development
DEBUG=true

# Database
DATABASE_URL=postgresql://annotateai:password@localhost:5432/annotateai
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET_KEY=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(python3 -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())')

# Storage
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=annotateai
MINIO_SECRET_KEY=annotateai123

# ML Services
MLFLOW_TRACKING_URI=http://localhost:5000
MODEL_CACHE_DIR=./models
OUTPUT_DIR=./outputs

# Monitoring
PROMETHEUS_URL=http://localhost:9090
GRAFANA_URL=http://localhost:3000
ELASTICSEARCH_HOSTS=http://localhost:9200
INFLUXDB_URL=http://localhost:8086

# External APIs (optional)
OPENAI_API_KEY=your-openai-api-key
HUGGINGFACE_API_KEY=your-huggingface-api-key
EOF
        print_status ".env file created ✓"
    else
        print_status ".env file already exists ✓"
    fi
    
    # Create necessary directories
    mkdir -p data models logs uploads experiments 3d_outputs video_outputs synthetic_outputs pipeline_outputs xr_sessions
    print_status "Data directories created ✓"
}

# Choose installation method
choose_installation_method() {
    echo ""
    echo "Choose your installation method:"
    echo "1) Poetry (Recommended for development)"
    echo "2) Docker (Recommended for production)"
    echo "3) pip (Simple installation)"
    echo "4) Exit"
    echo ""
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            install_with_poetry
            ;;
        2)
            install_with_docker
            ;;
        3)
            install_with_pip
            ;;
        4)
            echo "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please enter 1, 2, 3, or 4."
            choose_installation_method
            ;;
    esac
}

# Install with Poetry
install_with_poetry() {
    print_status "Installing with Poetry..."
    
    # Install dependencies
    poetry install
    
    # Install additional packages from GitHub
    poetry run pip install git+https://github.com/facebookresearch/segment-anything.git
    poetry run pip install git+https://github.com/openai/whisper.git
    
    print_status "Dependencies installed with Poetry ✓"
    
    echo ""
    echo -e "${GREEN}Installation complete! To start the development server:${NC}"
    echo "1. Activate virtual environment: poetry shell"
    echo "2. Start services: docker-compose up -d postgres redis minio"
    echo "3. Run the application: poetry run uvicorn ai-platforms.annotateai.src.app.main:app --reload"
    echo ""
}

# Install with Docker
install_with_docker() {
    print_status "Installing with Docker..."
    
    # Build and start services
    docker-compose build
    docker-compose up -d
    
    print_status "Services started with Docker ✓"
    
    echo ""
    echo -e "${GREEN}Installation complete! Services are running:${NC}"
    echo "- Main Application: http://localhost:8000"
    echo "- AI Model Service: http://localhost:8001"
    echo "- 3D Processing: http://localhost:8002"
    echo "- Video Processing: http://localhost:8003"
    echo "- Training Service: http://localhost:8004"
    echo "- XR Service: http://localhost:8005"
    echo "- Grafana: http://localhost:3000 (admin/annotateai123)"
    echo "- MLflow: http://localhost:5000"
    echo ""
    echo "To stop services: docker-compose down"
    echo "To view logs: docker-compose logs -f"
    echo ""
}

# Install with pip
install_with_pip() {
    print_status "Installing with pip..."
    
    # Create virtual environment
    python3 -m venv venv
    source venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    
    # Install additional packages from GitHub
    pip install git+https://github.com/facebookresearch/segment-anything.git
    pip install git+https://github.com/openai/whisper.git
    
    print_status "Dependencies installed with pip ✓"
    
    echo ""
    echo -e "${GREEN}Installation complete! To start the development server:${NC}"
    echo "1. Activate virtual environment: source venv/bin/activate"
    echo "2. Start services: docker-compose up -d postgres redis minio"
    echo "3. Run the application: uvicorn ai-platforms.annotateai.src.app.main:app --reload"
    echo ""
}

# Main execution
main() {
    check_requirements
    install_poetry
    install_docker
    
    # Install NVIDIA Docker if on Linux
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        install_nvidia_docker
    fi
    
    setup_environment
    choose_installation_method
}

# Run main function
main "$@" 