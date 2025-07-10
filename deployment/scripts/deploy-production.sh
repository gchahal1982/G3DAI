#!/bin/bash
set -euo pipefail

# G3DAI Production Deployment Script
# Deploys AnnotateAI and MedSight Pro with full monitoring and validation

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DEPLOYMENT_DIR="${PROJECT_ROOT}/deployment"
DOCKER_COMPOSE_FILE="${DEPLOYMENT_DIR}/docker/docker-compose.production.yml"
ENV_FILE="${DEPLOYMENT_DIR}/.env.production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    # Check environment file
    if [ ! -f "${ENV_FILE}" ]; then
        log_error "Environment file not found: ${ENV_FILE}"
        log_info "Please copy .env.production.example to .env.production and configure"
        exit 1
    fi
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Validate environment variables
validate_environment() {
    log_info "Validating environment variables..."
    
    # Source environment file
    set -a
    source "${ENV_FILE}"
    set +a
    
    # Required variables
    REQUIRED_VARS=(
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
        "ANNOTATEAI_DB_PASSWORD"
        "MEDSIGHT_DB_PASSWORD"
        "GRAFANA_PASSWORD"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var:-}" ]; then
            log_error "Required environment variable ${var} is not set"
            exit 1
        fi
    done
    
    log_success "Environment validation passed"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    
    # Build AnnotateAI
    log_info "Building AnnotateAI image..."
    docker build -t g3dai/annotateai:latest "${PROJECT_ROOT}/ai-platforms/annotateai"
    
    # Build MedSight Pro
    log_info "Building MedSight Pro image..."
    docker build -t g3dai/medsight-pro:latest "${PROJECT_ROOT}/ai-platforms/medsight-pro"
    
    # Build ML Compute Service
    log_info "Building ML Compute Service..."
    docker build -t g3dai/ml-compute:latest "${PROJECT_ROOT}/infrastructure/engines"
    
    # Build Medical Compute Service
    log_info "Building Medical Compute Service..."
    docker build -t g3dai/medical-compute:latest "${PROJECT_ROOT}/infrastructure/engines" \
        --build-arg MEDICAL_COMPLIANCE=true
    
    log_success "Docker images built successfully"
}

# Initialize databases
initialize_databases() {
    log_info "Initializing databases..."
    
    # Start PostgreSQL temporarily
    docker-compose -f "${DOCKER_COMPOSE_FILE}" up -d postgres
    
    # Wait for PostgreSQL to be ready
    log_info "Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Create databases
    docker-compose -f "${DOCKER_COMPOSE_FILE}" exec postgres psql -U postgres -c "
        CREATE DATABASE IF NOT EXISTS annotateai;
        CREATE DATABASE IF NOT EXISTS medsight;
        CREATE USER IF NOT EXISTS annotateai WITH PASSWORD '${ANNOTATEAI_DB_PASSWORD}';
        CREATE USER IF NOT EXISTS medsight WITH PASSWORD '${MEDSIGHT_DB_PASSWORD}';
        GRANT ALL PRIVILEGES ON DATABASE annotateai TO annotateai;
        GRANT ALL PRIVILEGES ON DATABASE medsight TO medsight;
    "
    
    log_success "Databases initialized"
}

# Deploy services
deploy_services() {
    log_info "Deploying services..."
    
    # Deploy with Docker Compose
    docker-compose -f "${DOCKER_COMPOSE_FILE}" up -d
    
    log_success "Services deployed"
}

# Health checks
perform_health_checks() {
    log_info "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check AnnotateAI health
    log_info "Checking AnnotateAI health..."
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        log_success "AnnotateAI is healthy"
    else
        log_error "AnnotateAI health check failed"
        return 1
    fi
    
    # Check MedSight Pro health
    log_info "Checking MedSight Pro health..."
    if curl -f http://localhost:3000/api/health/medical &> /dev/null; then
        log_success "MedSight Pro is healthy"
    else
        log_error "MedSight Pro health check failed"
        return 1
    fi
    
    # Check monitoring services
    log_info "Checking monitoring services..."
    if curl -f http://localhost:9090/-/healthy &> /dev/null; then
        log_success "Prometheus is healthy"
    else
        log_warning "Prometheus health check failed"
    fi
    
    if curl -f http://localhost:3001/api/health &> /dev/null; then
        log_success "Grafana is healthy"
    else
        log_warning "Grafana health check failed"
    fi
    
    log_success "Health checks completed"
}

# Performance validation
validate_performance() {
    log_info "Validating performance..."
    
    # Test AnnotateAI performance
    log_info "Testing AnnotateAI performance..."
    response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3000/api/health)
    if (( $(echo "$response_time < 1.0" | bc -l) )); then
        log_success "AnnotateAI response time: ${response_time}s"
    else
        log_warning "AnnotateAI response time is slow: ${response_time}s"
    fi
    
    # Test MedSight Pro performance
    log_info "Testing MedSight Pro performance..."
    response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3000/api/health/medical)
    if (( $(echo "$response_time < 1.0" | bc -l) )); then
        log_success "MedSight Pro response time: ${response_time}s"
    else
        log_warning "MedSight Pro response time is slow: ${response_time}s"
    fi
    
    # Check resource usage
    log_info "Checking resource usage..."
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
        $(docker-compose -f "${DOCKER_COMPOSE_FILE}" ps -q)
    
    log_success "Performance validation completed"
}

# Setup monitoring dashboards
setup_monitoring() {
    log_info "Setting up monitoring dashboards..."
    
    # Wait for Grafana to be ready
    sleep 15
    
    # Import dashboards
    log_info "Importing Grafana dashboards..."
    
    # AnnotateAI Dashboard
    curl -X POST \
        -H "Content-Type: application/json" \
        -d @"${DEPLOYMENT_DIR}/monitoring/dashboards/annotateai-dashboard.json" \
        http://admin:${GRAFANA_PASSWORD}@localhost:3001/api/dashboards/db
    
    # MedSight Pro Dashboard
    curl -X POST \
        -H "Content-Type: application/json" \
        -d @"${DEPLOYMENT_DIR}/monitoring/dashboards/medsight-dashboard.json" \
        http://admin:${GRAFANA_PASSWORD}@localhost:3001/api/dashboards/db
    
    # Infrastructure Dashboard
    curl -X POST \
        -H "Content-Type: application/json" \
        -d @"${DEPLOYMENT_DIR}/monitoring/dashboards/infrastructure-dashboard.json" \
        http://admin:${GRAFANA_PASSWORD}@localhost:3001/api/dashboards/db
    
    log_success "Monitoring dashboards configured"
}

# Rollback function
rollback_deployment() {
    log_warning "Rolling back deployment..."
    
    # Stop current services
    docker-compose -f "${DOCKER_COMPOSE_FILE}" down
    
    # Restore previous version if exists
    if [ -f "${DEPLOYMENT_DIR}/backup/docker-compose.backup.yml" ]; then
        docker-compose -f "${DEPLOYMENT_DIR}/backup/docker-compose.backup.yml" up -d
        log_success "Rollback completed"
    else
        log_error "No backup found for rollback"
    fi
}

# Backup current deployment
backup_deployment() {
    log_info "Backing up current deployment..."
    
    # Create backup directory
    mkdir -p "${DEPLOYMENT_DIR}/backup"
    
    # Backup Docker Compose file
    if [ -f "${DOCKER_COMPOSE_FILE}" ]; then
        cp "${DOCKER_COMPOSE_FILE}" "${DEPLOYMENT_DIR}/backup/docker-compose.backup.yml"
    fi
    
    # Backup environment file
    if [ -f "${ENV_FILE}" ]; then
        cp "${ENV_FILE}" "${DEPLOYMENT_DIR}/backup/.env.backup"
    fi
    
    log_success "Backup completed"
}

# Main deployment function
deploy() {
    log_info "Starting G3DAI production deployment..."
    
    # Set trap for rollback on failure
    trap 'log_error "Deployment failed. Rolling back..."; rollback_deployment; exit 1' ERR
    
    # Deployment steps
    check_prerequisites
    validate_environment
    backup_deployment
    build_images
    initialize_databases
    deploy_services
    perform_health_checks
    validate_performance
    setup_monitoring
    
    log_success "G3DAI production deployment completed successfully!"
    log_info "Access points:"
    log_info "  - AnnotateAI: http://localhost:3000"
    log_info "  - MedSight Pro: http://localhost:3000"
    log_info "  - Grafana: http://localhost:3001"
    log_info "  - Prometheus: http://localhost:9090"
    log_info "  - Kibana: http://localhost:5601"
    log_info "  - Traefik Dashboard: http://localhost:8080"
}

# Command line interface
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    rollback)
        rollback_deployment
        ;;
    health)
        perform_health_checks
        ;;
    monitor)
        setup_monitoring
        ;;
    backup)
        backup_deployment
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health|monitor|backup}"
        exit 1
        ;;
esac 