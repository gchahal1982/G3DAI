# AnnotateAI Platform

Advanced AI-powered annotation platform for computer vision, 3D processing, and multimodal data annotation.

## 🚀 Quick Start

The AnnotateAI platform offers multiple installation methods to suit different needs:

### Option 1: Automated Setup (Recommended)
```bash
# Navigate to the project directory
cd ai-platforms/annotateai

# Run the setup script
./scripts/setup.sh
```

### Option 2: Manual Installation

#### Poetry (Development)
```bash
# Navigate to the project directory
cd ai-platforms/annotateai

# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Install dependencies
poetry install

# Install additional packages
poetry run pip install git+https://github.com/facebookresearch/segment-anything.git
poetry run pip install git+https://github.com/openai/whisper.git

# Start services
docker-compose up -d postgres redis minio

# Run application
poetry run uvicorn src.app.main:app --reload
```

#### Docker (Production)
```bash
# Navigate to the project directory
cd ai-platforms/annotateai

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### pip (Simple)
```bash
# Navigate to the project directory
cd ai-platforms/annotateai

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install additional packages
pip install git+https://github.com/facebookresearch/segment-anything.git
pip install git+https://github.com/openai/whisper.git

# Start services
docker-compose up -d postgres redis minio

# Run application
uvicorn src.app.main:app --reload
```

## 📋 System Requirements

### Minimum Requirements
- **OS**: Linux (Ubuntu 20.04+) or macOS (10.15+)
- **Python**: 3.9+
- **Memory**: 8GB RAM
- **Storage**: 50GB free space
- **Docker**: Latest version

### Recommended for Production
- **Memory**: 32GB RAM
- **Storage**: 500GB SSD
- **GPU**: NVIDIA GPU with 8GB+ VRAM
- **CPU**: 8+ cores

## 🔧 Configuration

### Environment Variables

The `.env` file is already created with default values. Update these settings for your environment:

```env
# Database
DATABASE_URL=postgresql://annotateai:password@localhost:5432/annotateai
REDIS_URL=redis://localhost:6379

# Security (IMPORTANT: Change these for production!)
JWT_SECRET_KEY=your-jwt-secret-key-here-change-this-in-production
ENCRYPTION_KEY=your-encryption-key-here-change-this-in-production

# External APIs (optional)
OPENAI_API_KEY=your-openai-api-key
HUGGINGFACE_API_KEY=your-huggingface-api-key
```

## 🏗️ Architecture

### Core Services
- **Main Application** (Port 8000): Primary FastAPI application
- **AI Model Service** (Port 8001): AI model inference and management
- **3D Processing Service** (Port 8002): 3D data processing and reconstruction
- **Video Processing Service** (Port 8003): Video annotation and processing
- **Training Service** (Port 8004): Model training and fine-tuning
- **XR Service** (Port 8005): AR/VR annotation capabilities
- **Synthetic Data Service** (Port 8008): Data generation and augmentation
- **Data Pipeline Service** (Port 8009): Data ingestion and processing

### Infrastructure Services
- **PostgreSQL** (Port 5432): Primary database
- **Redis** (Port 6379): Caching and task queue
- **MinIO** (Port 9000): Object storage
- **MLflow** (Port 5000): ML experiment tracking
- **Grafana** (Port 3000): Monitoring dashboard
- **Prometheus** (Port 9090): Metrics collection
- **Elasticsearch** (Port 9200): Search and analytics

## 🔍 API Documentation

Once the application is running, visit:
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 📊 Monitoring

### Access Monitoring Services
- **Grafana**: http://localhost:3000 (admin/annotateai123)
- **MLflow**: http://localhost:5000
- **Prometheus**: http://localhost:9090
- **MinIO Console**: http://localhost:9001 (annotateai/annotateai123)

### Default Credentials
- **Database**: annotateai/password
- **Admin User**: admin/admin123
- **Grafana**: admin/annotateai123
- **MinIO**: annotateai/annotateai123

## 🛠️ Development

### Running Tests
```bash
# With Poetry
poetry run pytest

# With pip
source venv/bin/activate
pytest
```

### Code Quality
```bash
# Format code
poetry run black .
poetry run isort .

# Lint code
poetry run flake8 .
poetry run mypy .
```

### Database Migrations
```bash
# Create migration
poetry run alembic revision --autogenerate -m "description"

# Run migrations
poetry run alembic upgrade head
```

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
   ```bash
   poetry install
   # or
   pip install -r requirements.txt
   ```

2. **Database Connection**: Check PostgreSQL is running
   ```bash
   docker-compose up -d postgres
   ```

3. **GPU Issues**: Ensure NVIDIA Docker is installed (Linux only)
   ```bash
   docker run --rm --gpus all nvidia/cuda:12.1-runtime-ubuntu22.04 nvidia-smi
   ```

4. **Port Conflicts**: Check if ports are already in use
   ```bash
   lsof -i :8000
   ```

### Log Files
- Application logs: `./logs/`
- Docker logs: `docker-compose logs -f [service-name]`

## 🔐 Security

### Production Security Checklist
- [ ] Change default passwords in `.env`
- [ ] Generate secure JWT secret keys
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up proper user authentication
- [ ] Enable audit logging
- [ ] Configure backup strategies

## 📈 Scaling

### Horizontal Scaling
- Use Docker Swarm or Kubernetes for orchestration
- Configure load balancers for API endpoints
- Scale databases with read replicas
- Use distributed caching with Redis Cluster

### GPU Scaling
- Multiple GPU nodes for training services
- GPU sharing for inference workloads
- Queue management for GPU resources

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check the `/docs` directory
- **Issues**: Create an issue on GitHub
- **Email**: support@annotateai.com

---

**Note**: This is a comprehensive AI annotation platform. For production use, please review security settings and scale infrastructure according to your needs.
