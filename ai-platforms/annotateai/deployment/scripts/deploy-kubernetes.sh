#!/bin/bash

# AnnotateAI Kubernetes Deployment Script
# This script deploys the complete AnnotateAI platform to Kubernetes

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="annotateai"
DEPLOYMENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KUBECTL_TIMEOUT="300s"
HELM_TIMEOUT="600s"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    # Check if helm is installed
    if ! command -v helm &> /dev/null; then
        error "helm is not installed. Please install helm first."
        exit 1
    fi
    
    # Check kubectl connectivity
    if ! kubectl cluster-info &> /dev/null; then
        error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
    
    # Check if cert-manager is installed
    if ! kubectl get namespace cert-manager &> /dev/null; then
        warning "cert-manager namespace not found. Installing cert-manager..."
        install_cert_manager
    fi
    
    # Check if ingress-nginx is installed
    if ! kubectl get namespace ingress-nginx &> /dev/null; then
        warning "ingress-nginx namespace not found. Installing ingress-nginx..."
        install_ingress_nginx
    fi
    
    log "Prerequisites check completed"
}

# Install cert-manager
install_cert_manager() {
    log "Installing cert-manager..."
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
    kubectl wait --for=condition=Available deployment/cert-manager -n cert-manager --timeout=$KUBECTL_TIMEOUT
    kubectl wait --for=condition=Available deployment/cert-manager-cainjector -n cert-manager --timeout=$KUBECTL_TIMEOUT
    kubectl wait --for=condition=Available deployment/cert-manager-webhook -n cert-manager --timeout=$KUBECTL_TIMEOUT
    log "cert-manager installed successfully"
}

# Install ingress-nginx
install_ingress_nginx() {
    log "Installing ingress-nginx..."
    helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
    helm repo update
    helm install ingress-nginx ingress-nginx/ingress-nginx \
        --namespace ingress-nginx \
        --create-namespace \
        --set controller.service.type=LoadBalancer \
        --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"=nlb \
        --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-cross-zone-load-balancing-enabled"=true \
        --set controller.metrics.enabled=true \
        --set controller.podAnnotations."prometheus\.io/scrape"=true \
        --set controller.podAnnotations."prometheus\.io/port"=10254 \
        --timeout=$HELM_TIMEOUT
    
    kubectl wait --for=condition=Available deployment/ingress-nginx-controller -n ingress-nginx --timeout=$KUBECTL_TIMEOUT
    log "ingress-nginx installed successfully"
}

# Wait for deployment to be ready
wait_for_deployment() {
    local deployment=$1
    local namespace=${2:-$NAMESPACE}
    local timeout=${3:-$KUBECTL_TIMEOUT}
    
    info "Waiting for deployment $deployment in namespace $namespace to be ready..."
    kubectl wait --for=condition=Available deployment/$deployment -n $namespace --timeout=$timeout
    log "Deployment $deployment is ready"
}

# Wait for statefulset to be ready
wait_for_statefulset() {
    local statefulset=$1
    local namespace=${2:-$NAMESPACE}
    local timeout=${3:-$KUBECTL_TIMEOUT}
    
    info "Waiting for statefulset $statefulset in namespace $namespace to be ready..."
    kubectl wait --for=condition=Ready statefulset/$statefulset -n $namespace --timeout=$timeout
    log "StatefulSet $statefulset is ready"
}

# Create namespace
create_namespace() {
    log "Creating namespace $NAMESPACE..."
    kubectl apply -f "$DEPLOYMENT_DIR/kubernetes/namespace.yaml"
    log "Namespace created successfully"
}

# Apply storage configuration
apply_storage() {
    log "Applying storage configuration..."
    kubectl apply -f "$DEPLOYMENT_DIR/kubernetes/storage.yaml"
    
    # Wait for storage classes to be available
    kubectl wait --for=condition=Ready storageclass/annotateai-ssd --timeout=60s || true
    kubectl wait --for=condition=Ready storageclass/annotateai-hdd --timeout=60s || true
    kubectl wait --for=condition=Ready storageclass/annotateai-nvme --timeout=60s || true
    
    log "Storage configuration applied successfully"
}

# Apply secrets
apply_secrets() {
    log "Applying secrets configuration..."
    warning "IMPORTANT: Update secrets with actual values before production deployment!"
    kubectl apply -f "$DEPLOYMENT_DIR/kubernetes/secrets.yaml"
    log "Secrets applied successfully"
}

# Apply configmaps
apply_configmaps() {
    log "Applying configmaps..."
    kubectl apply -f "$DEPLOYMENT_DIR/kubernetes/configmaps.yaml"
    log "ConfigMaps applied successfully"
}

# Deploy infrastructure services
deploy_infrastructure() {
    log "Deploying infrastructure services..."
    kubectl apply -f "$DEPLOYMENT_DIR/kubernetes/infrastructure.yaml"
    
    # Wait for database to be ready
    wait_for_statefulset "postgres"
    
    # Wait for Redis to be ready
    wait_for_statefulset "redis"
    
    # Wait for monitoring services
    wait_for_deployment "prometheus"
    wait_for_deployment "grafana"
    wait_for_statefulset "elasticsearch"
    wait_for_deployment "minio"
    
    log "Infrastructure services deployed successfully"
}

# Deploy AI services
deploy_ai_services() {
    log "Deploying AI services..."
    kubectl apply -f "$DEPLOYMENT_DIR/kubernetes/ai-model-service.yaml"
    
    # Wait for AI model service to be ready
    wait_for_deployment "ai-model-service"
    
    log "AI services deployed successfully"
}

# Apply ingress configuration
apply_ingress() {
    log "Applying ingress configuration..."
    kubectl apply -f "$DEPLOYMENT_DIR/kubernetes/ingress.yaml"
    
    # Wait for certificate issuers to be ready
    sleep 30
    kubectl wait --for=condition=Ready clusterissuer/letsencrypt-prod --timeout=60s || true
    kubectl wait --for=condition=Ready clusterissuer/letsencrypt-staging --timeout=60s || true
    
    log "Ingress configuration applied successfully"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check all pods are running
    info "Checking pod status..."
    kubectl get pods -n $NAMESPACE
    
    # Check services
    info "Checking services..."
    kubectl get services -n $NAMESPACE
    
    # Check ingress
    info "Checking ingress..."
    kubectl get ingress -n $NAMESPACE
    
    # Check persistent volumes
    info "Checking persistent volumes..."
    kubectl get pv
    
    # Check if all deployments are ready
    local failed_deployments=()
    
    for deployment in $(kubectl get deployments -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}'); do
        if ! kubectl rollout status deployment/$deployment -n $NAMESPACE --timeout=60s; then
            failed_deployments+=($deployment)
        fi
    done
    
    if [ ${#failed_deployments[@]} -ne 0 ]; then
        error "The following deployments are not ready: ${failed_deployments[*]}"
        return 1
    fi
    
    log "All deployments are ready"
    
    # Get external IP of load balancer
    info "Getting external IP..."
    kubectl get service nginx-ingress-controller -n ingress-nginx
    
    log "Deployment verification completed successfully"
}

# Show connection information
show_connection_info() {
    log "Deployment completed successfully!"
    
    echo ""
    echo "====================================="
    echo "    AnnotateAI Platform Deployed    "
    echo "====================================="
    echo ""
    
    # Get external IP
    external_ip=$(kubectl get service nginx-ingress-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Pending...")
    if [ "$external_ip" = "Pending..." ]; then
        external_ip=$(kubectl get service nginx-ingress-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "Pending...")
    fi
    
    echo "External IP/Hostname: $external_ip"
    echo ""
    echo "Services:"
    echo "  - Main Application:    https://annotateai.com"
    echo "  - API:                 https://api.annotateai.com"
    echo "  - Admin Dashboard:     https://admin.annotateai.com"
    echo "  - Monitoring:          https://monitoring.annotateai.com"
    echo ""
    echo "Monitoring URLs:"
    echo "  - Grafana:            https://monitoring.annotateai.com/grafana/"
    echo "  - Prometheus:         https://monitoring.annotateai.com/prometheus/"
    echo "  - Elasticsearch:      https://monitoring.annotateai.com/elasticsearch/"
    echo "  - MinIO Console:      https://monitoring.annotateai.com/minio/"
    echo ""
    echo "Next Steps:"
    echo "  1. Update DNS records to point to: $external_ip"
    echo "  2. Wait for SSL certificates to be issued (5-10 minutes)"
    echo "  3. Update secrets with production values"
    echo "  4. Configure monitoring alerts"
    echo "  5. Set up backup procedures"
    echo ""
    echo "====================================="
}

# Cleanup function
cleanup_on_error() {
    error "Deployment failed. Cleaning up..."
    
    # Optionally remove namespace (uncomment if needed)
    # kubectl delete namespace $NAMESPACE --ignore-not-found=true
    
    exit 1
}

# Main deployment function
main() {
    # Set trap for error handling
    trap cleanup_on_error ERR
    
    log "Starting AnnotateAI Kubernetes deployment..."
    
    # Check prerequisites
    check_prerequisites
    
    # Create namespace
    create_namespace
    
    # Apply storage configuration
    apply_storage
    
    # Apply secrets
    apply_secrets
    
    # Apply configmaps
    apply_configmaps
    
    # Deploy infrastructure services
    deploy_infrastructure
    
    # Deploy AI services
    deploy_ai_services
    
    # Apply ingress configuration
    apply_ingress
    
    # Wait a bit for everything to settle
    info "Waiting for services to settle..."
    sleep 30
    
    # Verify deployment
    verify_deployment
    
    # Show connection information
    show_connection_info
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "verify")
        verify_deployment
        ;;
    "cleanup")
        log "Cleaning up AnnotateAI deployment..."
        kubectl delete namespace $NAMESPACE --ignore-not-found=true
        log "Cleanup completed"
        ;;
    "status")
        kubectl get all -n $NAMESPACE
        ;;
    "logs")
        service=${2:-"ai-model-service"}
        kubectl logs -f deployment/$service -n $NAMESPACE
        ;;
    *)
        echo "Usage: $0 {deploy|verify|cleanup|status|logs [service]}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy the complete AnnotateAI platform"
        echo "  verify  - Verify the deployment status"
        echo "  cleanup - Remove the AnnotateAI deployment"
        echo "  status  - Show status of all resources"
        echo "  logs    - Show logs for a service (default: ai-model-service)"
        exit 1
        ;;
esac 