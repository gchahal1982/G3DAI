#!/bin/bash

set -euo pipefail

# AnnotateAI Production Deployment Script
# This script automates the complete production deployment process

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NAMESPACE="annotateai-prod"
CLUSTER_NAME="annotateai-production"
REGION="us-west-2"
TIMEOUT=600

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

# Error handling
cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "Deployment failed with exit code $exit_code"
        log_info "Initiating rollback..."
        rollback_deployment
    fi
}

trap cleanup EXIT

# Dependency checks
check_dependencies() {
    log_info "Checking dependencies..."
    
    local required_tools=(kubectl helm aws docker)
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "$tool is required but not installed"
            exit 1
        fi
    done
    
    log_success "All dependencies are available"
}

# AWS and Kubernetes configuration
configure_aws() {
    log_info "Configuring AWS CLI..."
    
    if [ -z "${AWS_ACCESS_KEY_ID:-}" ] || [ -z "${AWS_SECRET_ACCESS_KEY:-}" ]; then
        log_error "AWS credentials not set"
        exit 1
    fi
    
    aws eks update-kubeconfig --region "$REGION" --name "$CLUSTER_NAME"
    
    # Test kubectl connectivity
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "AWS and Kubernetes configured"
}

# Validate environment
validate_environment() {
    log_info "Validating production environment..."
    
    # Check cluster health
    local node_status
    node_status=$(kubectl get nodes --no-headers | awk '{print $2}' | grep -v Ready | wc -l)
    if [ "$node_status" -gt 0 ]; then
        log_error "$node_status nodes are not ready"
        exit 1
    fi
    
    # Check resource availability
    local cpu_capacity
    cpu_capacity=$(kubectl top nodes | tail -n +2 | awk '{sum += $3} END {print sum}')
    if [ "${cpu_capacity:-0}" -gt 80 ]; then
        log_warning "High CPU usage detected: ${cpu_capacity}%"
    fi
    
    # Check namespace
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_info "Creating namespace $NAMESPACE"
        kubectl create namespace "$NAMESPACE"
    fi
    
    log_success "Environment validation completed"
}

# Build and push images
build_images() {
    log_info "Building and pushing Docker images..."
    
    local services=(
        "api-gateway"
        "auth-service" 
        "ai-model-service"
        "collaboration-service"
        "storage-service"
        "asset-processor"
        "clip-service"
        "tracking-service"
        "medical-imaging-service"
        "pointcloud-service"
    )
    
    local image_tag="${1:-latest}"
    local registry="${DOCKER_REGISTRY:-ghcr.io/annotateai}"
    
    for service in "${services[@]}"; do
        log_info "Building $service..."
        
        docker build \
            -t "$registry/$service:$image_tag" \
            -f "$PROJECT_ROOT/infrastructure/$service/Dockerfile" \
            "$PROJECT_ROOT"
        
        docker push "$registry/$service:$image_tag"
        
        log_success "Built and pushed $service:$image_tag"
    done
}

# Database migration
run_migrations() {
    log_info "Running database migrations..."
    
    # Create migration job
    kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration-$(date +%s)
  namespace: $NAMESPACE
spec:
  template:
    spec:
      containers:
      - name: migration
        image: ghcr.io/annotateai/api-gateway:${IMAGE_TAG:-latest}
        command: ["python", "manage.py", "migrate"]
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: annotateai-secrets
              key: database-url
      restartPolicy: Never
  backoffLimit: 3
EOF
    
    # Wait for migration to complete
    local job_name
    job_name=$(kubectl get jobs -n "$NAMESPACE" --sort-by=.metadata.creationTimestamp -o name | tail -1)
    kubectl wait --for=condition=complete "$job_name" -n "$NAMESPACE" --timeout=300s
    
    log_success "Database migrations completed"
}

# Deploy application
deploy_application() {
    log_info "Deploying application to production..."
    
    local image_tag="${1:-latest}"
    
    # Substitute environment variables in deployment manifests
    export IMAGE_TAG="$image_tag"
    export NAMESPACE="$NAMESPACE"
    export ENVIRONMENT="production"
    
    # Apply Kubernetes manifests
    envsubst < "$PROJECT_ROOT/deployment/kubernetes/production/annotateai-production.yaml" | kubectl apply -f -
    
    # Wait for deployments to be ready
    local deployments=(
        "api-gateway"
        "auth-service"
        "ai-model-service" 
        "collaboration-service"
        "storage-service"
    )
    
    for deployment in "${deployments[@]}"; do
        log_info "Waiting for $deployment to be ready..."
        kubectl rollout status "deployment/$deployment" -n "$NAMESPACE" --timeout="${TIMEOUT}s"
        log_success "$deployment is ready"
    done
    
    log_success "Application deployment completed"
}

# Health checks
run_health_checks() {
    log_info "Running comprehensive health checks..."
    
    # Wait for services to stabilize
    sleep 60
    
    # Get load balancer URL
    local lb_url
    lb_url=$(kubectl get svc api-gateway -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    
    if [ -z "$lb_url" ]; then
        log_error "Load balancer URL not available"
        return 1
    fi
    
    # Health check endpoints
    local endpoints=(
        "/health"
        "/ready"
        "/metrics"
    )
    
    for endpoint in "${endpoints[@]}"; do
        log_info "Checking $endpoint..."
        
        local response_code
        response_code=$(curl -s -o /dev/null -w "%{http_code}" "http://$lb_url$endpoint" || echo "000")
        
        if [ "$response_code" != "200" ]; then
            log_error "Health check failed for $endpoint (HTTP $response_code)"
            return 1
        fi
        
        log_success "$endpoint is healthy"
    done
    
    # Check database connectivity
    kubectl exec -n "$NAMESPACE" deployment/api-gateway -- python -c "
import os
import psycopg2
try:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.close()
    print('Database connection successful')
except Exception as e:
    print(f'Database connection failed: {e}')
    exit(1)
" > /dev/null
    
    log_success "Database connectivity verified"
    
    # Check Redis connectivity
    kubectl exec -n "$NAMESPACE" deployment/api-gateway -- python -c "
import os
import redis
try:
    r = redis.from_url(os.environ['REDIS_URL'])
    r.ping()
    print('Redis connection successful')
except Exception as e:
    print(f'Redis connection failed: {e}')
    exit(1)
" > /dev/null
    
    log_success "Redis connectivity verified"
    
    log_success "All health checks passed"
}

# Performance validation
validate_performance() {
    log_info "Validating performance metrics..."
    
    # Get metrics from Prometheus
    local prometheus_url="http://prometheus.annotateai.com:9090"
    
    # Check response time (95th percentile should be < 2000ms)
    local response_time
    response_time=$(curl -s "$prometheus_url/api/v1/query?query=histogram_quantile(0.95,rate(http_request_duration_seconds_bucket[5m]))" | jq -r '.data.result[0].value[1]' 2>/dev/null || echo "0")
    
    if (( $(echo "$response_time > 2" | bc -l) )); then
        log_warning "High response time detected: ${response_time}s"
    else
        log_success "Response time within acceptable range: ${response_time}s"
    fi
    
    # Check error rate (should be < 1%)
    local error_rate
    error_rate=$(curl -s "$prometheus_url/api/v1/query?query=rate(http_requests_total{status=~\"5..\"}[5m])/rate(http_requests_total[5m])" | jq -r '.data.result[0].value[1]' 2>/dev/null || echo "0")
    
    if (( $(echo "$error_rate > 0.01" | bc -l) )); then
        log_warning "High error rate detected: ${error_rate}"
    else
        log_success "Error rate within acceptable range: ${error_rate}"
    fi
    
    log_success "Performance validation completed"
}

# Backup current deployment
backup_deployment() {
    log_info "Creating deployment backup..."
    
    local backup_dir="$PROJECT_ROOT/backups/$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup Kubernetes resources
    kubectl get all -n "$NAMESPACE" -o yaml > "$backup_dir/kubernetes-resources.yaml"
    
    # Backup database
    kubectl exec -n "$NAMESPACE" postgres-0 -- pg_dump -U annotateai annotateai > "$backup_dir/database-backup.sql"
    
    # Store backup metadata
    cat > "$backup_dir/metadata.json" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git_commit": "$(git rev-parse HEAD)",
  "git_branch": "$(git rev-parse --abbrev-ref HEAD)",
  "kubernetes_version": "$(kubectl version --short | grep Server)",
  "namespace": "$NAMESPACE"
}
EOF
    
    log_success "Backup created at $backup_dir"
    echo "$backup_dir" > /tmp/annotateai-backup-path
}

# Rollback deployment
rollback_deployment() {
    log_info "Rolling back deployment..."
    
    local deployments=(
        "api-gateway"
        "auth-service"
        "ai-model-service"
        "collaboration-service"
        "storage-service"
    )
    
    for deployment in "${deployments[@]}"; do
        log_info "Rolling back $deployment..."
        kubectl rollout undo "deployment/$deployment" -n "$NAMESPACE"
    done
    
    # Wait for rollback to complete
    for deployment in "${deployments[@]}"; do
        kubectl rollout status "deployment/$deployment" -n "$NAMESPACE" --timeout=300s
    done
    
    log_success "Rollback completed"
}

# Setup monitoring and alerting
setup_monitoring() {
    log_info "Setting up monitoring and alerting..."
    
    # Apply monitoring manifests
    kubectl apply -f "$PROJECT_ROOT/deployment/monitoring/"
    
    # Configure Grafana dashboards
    if command -v curl &> /dev/null && [ -n "${GRAFANA_API_KEY:-}" ]; then
        curl -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $GRAFANA_API_KEY" \
            -d @"$PROJECT_ROOT/deployment/monitoring/grafana-dashboard.json" \
            "https://grafana.annotateai.com/api/dashboards/db"
    fi
    
    log_success "Monitoring and alerting configured"
}

# Send notifications
send_notifications() {
    local status="$1"
    local message="$2"
    
    # Slack notification
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
    
    # Email notification (if configured)
    if [ -n "${EMAIL_RECIPIENTS:-}" ] && command -v mail &> /dev/null; then
        echo "$message" | mail -s "AnnotateAI Deployment $status" "$EMAIL_RECIPIENTS"
    fi
    
    log_info "Notifications sent"
}

# Main deployment function
main() {
    local image_tag="${1:-latest}"
    local skip_build="${2:-false}"
    
    log_info "Starting AnnotateAI production deployment..."
    log_info "Image tag: $image_tag"
    log_info "Namespace: $NAMESPACE"
    log_info "Cluster: $CLUSTER_NAME"
    
    # Pre-deployment checks
    check_dependencies
    configure_aws
    validate_environment
    
    # Create backup
    backup_deployment
    
    # Build and push images (unless skipped)
    if [ "$skip_build" != "true" ]; then
        build_images "$image_tag"
    fi
    
    # Run database migrations
    run_migrations
    
    # Deploy application
    deploy_application "$image_tag"
    
    # Health checks
    run_health_checks
    
    # Performance validation
    validate_performance
    
    # Setup monitoring
    setup_monitoring
    
    # Success notification
    send_notifications "SUCCESS" "✅ AnnotateAI $image_tag successfully deployed to production!"
    
    log_success "🎉 Production deployment completed successfully!"
    log_info "Dashboard: https://grafana.annotateai.com"
    log_info "API Endpoint: https://api.annotateai.com"
    log_info "Documentation: https://docs.annotateai.com"
    
    # Cleanup trap
    trap - EXIT
}

# Script usage
usage() {
    echo "Usage: $0 [IMAGE_TAG] [SKIP_BUILD]"
    echo ""
    echo "Arguments:"
    echo "  IMAGE_TAG   Docker image tag to deploy (default: latest)"
    echo "  SKIP_BUILD  Skip building images (true/false, default: false)"
    echo ""
    echo "Environment variables:"
    echo "  AWS_ACCESS_KEY_ID     AWS access key"
    echo "  AWS_SECRET_ACCESS_KEY AWS secret key"
    echo "  DOCKER_REGISTRY       Docker registry URL"
    echo "  SLACK_WEBHOOK_URL     Slack webhook for notifications"
    echo "  GRAFANA_API_KEY       Grafana API key"
    echo "  EMAIL_RECIPIENTS      Email recipients for notifications"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy latest images"
    echo "  $0 v1.2.3            # Deploy specific version"
    echo "  $0 latest true       # Deploy without building"
}

# Handle command line arguments
case "${1:-}" in
    -h|--help)
        usage
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac 