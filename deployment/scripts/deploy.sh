#!/bin/bash

# G3D AI Services Production Deployment Script
# This script builds and deploys all 16 AI services to Kubernetes

set -e

# Configuration
DOCKER_REGISTRY="g3d-registry.io"
KUBERNETES_NAMESPACE="g3d-ai-services"
VERSION=${1:-"latest"}
ENVIRONMENT=${2:-"production"}

# Color codes for output
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

# Service configurations
declare -A SERVICES=(
    ["api-gateway"]="3000:production"
    ["vision-pro"]="3001:gpu-production"
    ["aura"]="3002:production"
    ["creative-studio"]="3003:gpu-production"
    ["dataforge"]="3004:production"
    ["secureai"]="3005:production"
    ["automl"]="3006:gpu-production"
    ["chatbuilder"]="3007:production"
    ["videoai"]="3008:gpu-production"
    ["financeai"]="3009:production"
    ["healthai"]="3010:production"
    ["voiceai"]="3011:production"
    ["translateai"]="3012:production"
    ["documind"]="3013:production"
    ["mesh3d"]="3014:gpu-production"
    ["edgeai"]="3015:production"
    ["legalai"]="3016:production"
)

# Pre-deployment checks
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running"
        exit 1
    fi
    
    # Check if kubectl is installed and configured
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        log_error "kubectl is not configured or cluster is not accessible"
        exit 1
    fi
    
    # Check if required environment variables are set
    if [[ -z "${DOCKER_USERNAME}" || -z "${DOCKER_PASSWORD}" ]]; then
        log_error "Docker registry credentials not set (DOCKER_USERNAME, DOCKER_PASSWORD)"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Build Docker images
build_images() {
    log_info "Building Docker images for all services..."
    
    # Login to Docker registry
    echo "${DOCKER_PASSWORD}" | docker login "${DOCKER_REGISTRY}" -u "${DOCKER_USERNAME}" --password-stdin
    
    for service in "${!SERVICES[@]}"; do
        IFS=':' read -r port stage <<< "${SERVICES[$service]}"
        
        log_info "Building ${service} (port: ${port}, stage: ${stage})"
        
        # Build the Docker image
        docker build \
            --build-arg SERVICE_NAME="${service}" \
            --build-arg SERVICE_PORT="${port}" \
            --target "${stage}" \
            -t "${DOCKER_REGISTRY}/${service}:${VERSION}" \
            -t "${DOCKER_REGISTRY}/${service}:latest" \
            -f deployment/docker/Dockerfile.multi-service \
            .
        
        # Push to registry
        docker push "${DOCKER_REGISTRY}/${service}:${VERSION}"
        docker push "${DOCKER_REGISTRY}/${service}:latest"
        
        log_success "Built and pushed ${service}"
    done
    
    log_success "All Docker images built and pushed"
}

# Deploy to Kubernetes
deploy_to_kubernetes() {
    log_info "Deploying to Kubernetes..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace "${KUBERNETES_NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply Kubernetes manifests
    kubectl apply -f deployment/kubernetes/g3d-services.yaml
    
    # Wait for deployments to be ready
    log_info "Waiting for deployments to be ready..."
    
    for service in "${!SERVICES[@]}"; do
        log_info "Waiting for ${service} deployment..."
        kubectl rollout status deployment/"${service}" -n "${KUBERNETES_NAMESPACE}" --timeout=300s
        log_success "${service} deployment ready"
    done
    
    log_success "All deployments are ready"
}

# Health checks
run_health_checks() {
    log_info "Running health checks..."
    
    # Get the API Gateway external IP
    log_info "Waiting for API Gateway LoadBalancer..."
    kubectl wait --for=condition=ready service/api-gateway-service -n "${KUBERNETES_NAMESPACE}" --timeout=300s
    
    GATEWAY_IP=$(kubectl get service api-gateway-service -n "${KUBERNETES_NAMESPACE}" -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [[ -z "${GATEWAY_IP}" ]]; then
        log_warning "LoadBalancer IP not available, using NodePort"
        GATEWAY_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}')
        GATEWAY_PORT=$(kubectl get service api-gateway-service -n "${KUBERNETES_NAMESPACE}" -o jsonpath='{.spec.ports[0].nodePort}')
        GATEWAY_URL="http://${GATEWAY_IP}:${GATEWAY_PORT}"
    else
        GATEWAY_URL="http://${GATEWAY_IP}"
    fi
    
    log_info "API Gateway URL: ${GATEWAY_URL}"
    
    # Test API Gateway health
    for i in {1..10}; do
        if curl -f "${GATEWAY_URL}/health" &> /dev/null; then
            log_success "API Gateway health check passed"
            break
        else
            log_warning "API Gateway health check failed, retrying in 30s... (${i}/10)"
            sleep 30
        fi
        
        if [[ $i -eq 10 ]]; then
            log_error "API Gateway health check failed after 10 attempts"
            exit 1
        fi
    done
    
    # Test individual services through API Gateway
    for service in "${!SERVICES[@]}"; do
        if [[ "${service}" != "api-gateway" ]]; then
            log_info "Testing ${service} through API Gateway..."
            
            if curl -f "${GATEWAY_URL}/api/${service}/health" &> /dev/null; then
                log_success "${service} health check passed"
            else
                log_warning "${service} health check failed"
            fi
        fi
    done
    
    log_success "Health checks completed"
}

# Monitoring setup
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Apply monitoring configurations
    kubectl apply -f deployment/monitoring/prometheus.yaml
    kubectl apply -f deployment/monitoring/grafana.yaml
    
    log_success "Monitoring setup completed"
}

# Cleanup old deployments
cleanup_old_deployments() {
    log_info "Cleaning up old deployments..."
    
    # Remove old Docker images
    docker image prune -a -f --filter "until=24h"
    
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting G3D AI Services deployment..."
    log_info "Version: ${VERSION}"
    log_info "Environment: ${ENVIRONMENT}"
    log_info "Namespace: ${KUBERNETES_NAMESPACE}"
    
    # Run deployment steps
    check_prerequisites
    build_images
    deploy_to_kubernetes
    run_health_checks
    setup_monitoring
    cleanup_old_deployments
    
    log_success "Deployment completed successfully!"
    log_info "API Gateway URL: ${GATEWAY_URL}"
    log_info "Services deployed: ${#SERVICES[@]}"
    
    # Display service status
    echo ""
    log_info "Service Status:"
    kubectl get pods -n "${KUBERNETES_NAMESPACE}" -o wide
    
    echo ""
    log_info "Service URLs:"
    for service in "${!SERVICES[@]}"; do
        IFS=':' read -r port stage <<< "${SERVICES[$service]}"
        echo "  ${service}: ${GATEWAY_URL}/api/${service}"
    done
    
    echo ""
    log_info "Monitoring URLs:"
    echo "  Prometheus: ${GATEWAY_URL}/prometheus"
    echo "  Grafana: ${GATEWAY_URL}/grafana"
    
    echo ""
    log_success "G3D AI Services Platform is now live!"
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"