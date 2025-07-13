#!/bin/bash

# AnnotateAI Blue-Green Deployment Script
# This script performs zero-downtime deployments using blue-green strategy

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE=${NAMESPACE:-"annotateai"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}
ENVIRONMENT=${ENVIRONMENT:-"production"}
DEPLOYMENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KUBECTL_TIMEOUT="600s"
HEALTH_CHECK_TIMEOUT="300"
ROLLBACK_ON_FAILURE=${ROLLBACK_ON_FAILURE:-"true"}

# Services to deploy
SERVICES=(
    "ai-model-service"
    "enterprise-services"
    "performance-optimization-service"
    "data-pipeline-service"
    "video-processing-service"
    "3d-processing-service"
    "xr-service"
    "synthetic-data-service"
    "training-service"
    "api-gateway-service"
    "frontend-service"
)

# Logging functions
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

# Get current active environment (blue or green)
get_current_environment() {
    local service=$1
    local current_env
    
    # Check if the service exists and get current environment label
    if kubectl get deployment "${service}" -n "${NAMESPACE}" &>/dev/null; then
        current_env=$(kubectl get deployment "${service}" -n "${NAMESPACE}" -o jsonpath='{.metadata.labels.environment}' 2>/dev/null || echo "blue")
    else
        # If deployment doesn't exist, start with blue
        current_env="blue"
    fi
    
    echo "${current_env}"
}

# Get target environment (opposite of current)
get_target_environment() {
    local current_env=$1
    if [ "${current_env}" = "blue" ]; then
        echo "green"
    else
        echo "blue"
    fi
}

# Wait for deployment to be ready
wait_for_deployment_ready() {
    local deployment=$1
    local namespace=$2
    local timeout=${3:-$KUBECTL_TIMEOUT}
    
    info "Waiting for deployment ${deployment} in namespace ${namespace} to be ready..."
    
    if kubectl rollout status deployment/"${deployment}" -n "${namespace}" --timeout="${timeout}"; then
        log "Deployment ${deployment} is ready"
        return 0
    else
        error "Deployment ${deployment} failed to become ready within ${timeout}"
        return 1
    fi
}

# Perform health check on a service
health_check() {
    local service=$1
    local environment=$2
    local max_attempts=${3:-30}
    local sleep_duration=${4:-10}
    
    info "Performing health check for ${service} (${environment} environment)..."
    
    # Get service endpoint
    local service_name="${service}-${environment}"
    local service_port
    
    # Get the service port
    if kubectl get service "${service_name}" -n "${NAMESPACE}" &>/dev/null; then
        service_port=$(kubectl get service "${service_name}" -n "${NAMESPACE}" -o jsonpath='{.spec.ports[0].port}')
    else
        warning "Service ${service_name} not found, skipping health check"
        return 0
    fi
    
    # Perform health check using kubectl port-forward
    local attempt=1
    while [ $attempt -le $max_attempts ]; do
        info "Health check attempt ${attempt}/${max_attempts} for ${service}..."
        
        # Use kubectl to check if pods are ready
        local ready_replicas
        ready_replicas=$(kubectl get deployment "${service}-${environment}" -n "${NAMESPACE}" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
        local desired_replicas
        desired_replicas=$(kubectl get deployment "${service}-${environment}" -n "${NAMESPACE}" -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "1")
        
        if [ "${ready_replicas}" = "${desired_replicas}" ] && [ "${ready_replicas}" != "0" ]; then
            # Additional health check via HTTP if possible
            if command -v curl &> /dev/null; then
                # Start port-forward in background
                kubectl port-forward "service/${service_name}" 8080:${service_port} -n "${NAMESPACE}" &
                local port_forward_pid=$!
                sleep 3
                
                # Perform HTTP health check
                if curl -f -s "http://localhost:8080/health" > /dev/null 2>&1; then
                    kill $port_forward_pid 2>/dev/null || true
                    log "Health check passed for ${service} (${environment})"
                    return 0
                fi
                
                kill $port_forward_pid 2>/dev/null || true
            else
                # If curl is not available, just check pod readiness
                log "Health check passed for ${service} (${environment}) - pods ready"
                return 0
            fi
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "Health check failed for ${service} after ${max_attempts} attempts"
            return 1
        fi
        
        info "Health check failed, retrying in ${sleep_duration} seconds..."
        sleep $sleep_duration
        ((attempt++))
    done
}

# Update service selector to point to new environment
switch_traffic() {
    local service=$1
    local target_env=$2
    
    info "Switching traffic for ${service} to ${target_env} environment..."
    
    # Update the main service selector to point to the new environment
    kubectl patch service "${service}" -n "${NAMESPACE}" -p "{\"spec\":{\"selector\":{\"environment\":\"${target_env}\"}}}"
    
    # Verify the switch
    local current_selector
    current_selector=$(kubectl get service "${service}" -n "${NAMESPACE}" -o jsonpath='{.spec.selector.environment}')
    
    if [ "${current_selector}" = "${target_env}" ]; then
        log "Traffic successfully switched to ${target_env} environment for ${service}"
        return 0
    else
        error "Failed to switch traffic for ${service}"
        return 1
    fi
}

# Deploy service to target environment
deploy_service() {
    local service=$1
    local target_env=$2
    
    info "Deploying ${service} to ${target_env} environment..."
    
    # Create temporary deployment manifest
    local temp_manifest="/tmp/${service}-${target_env}-deployment.yaml"
    
    # Generate deployment manifest for target environment
    cat > "${temp_manifest}" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${service}-${target_env}
  namespace: ${NAMESPACE}
  labels:
    app: ${service}
    environment: ${target_env}
    version: "${IMAGE_TAG}"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: ${service}
      environment: ${target_env}
  template:
    metadata:
      labels:
        app: ${service}
        environment: ${target_env}
        version: "${IMAGE_TAG}"
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8000"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: ${service}-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
        - name: ${service}
          image: ghcr.io/annotateai/${service}:${IMAGE_TAG}
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 8000
              protocol: TCP
          env:
            - name: ENVIRONMENT
              value: "${ENVIRONMENT}"
            - name: LOG_LEVEL
              value: "INFO"
            - name: DEPLOYMENT_ENVIRONMENT
              value: "${target_env}"
          envFrom:
            - configMapRef:
                name: annotateai-config
            - secretRef:
                name: postgres-credentials
            - secretRef:
                name: redis-credentials
          resources:
            requests:
              cpu: "500m"
              memory: "1Gi"
            limits:
              cpu: "2"
              memory: "4Gi"
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 60
            periodSeconds: 30
            timeoutSeconds: 10
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: http
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
      imagePullSecrets:
        - name: container-registry-secrets
---
apiVersion: v1
kind: Service
metadata:
  name: ${service}-${target_env}
  namespace: ${NAMESPACE}
  labels:
    app: ${service}
    environment: ${target_env}
spec:
  type: ClusterIP
  ports:
    - name: http
      port: 8000
      targetPort: http
      protocol: TCP
  selector:
    app: ${service}
    environment: ${target_env}
EOF
    
    # Apply the deployment
    kubectl apply -f "${temp_manifest}"
    
    # Wait for deployment to be ready
    if wait_for_deployment_ready "${service}-${target_env}" "${NAMESPACE}"; then
        log "Successfully deployed ${service} to ${target_env} environment"
        rm -f "${temp_manifest}"
        return 0
    else
        error "Failed to deploy ${service} to ${target_env} environment"
        rm -f "${temp_manifest}"
        return 1
    fi
}

# Cleanup old environment
cleanup_old_environment() {
    local service=$1
    local old_env=$2
    
    info "Cleaning up old ${old_env} environment for ${service}..."
    
    # Delete old deployment
    if kubectl get deployment "${service}-${old_env}" -n "${NAMESPACE}" &>/dev/null; then
        kubectl delete deployment "${service}-${old_env}" -n "${NAMESPACE}" --timeout="${KUBECTL_TIMEOUT}"
        log "Deleted old deployment ${service}-${old_env}"
    fi
    
    # Delete old service
    if kubectl get service "${service}-${old_env}" -n "${NAMESPACE}" &>/dev/null; then
        kubectl delete service "${service}-${old_env}" -n "${NAMESPACE}"
        log "Deleted old service ${service}-${old_env}"
    fi
}

# Rollback to previous environment
rollback_service() {
    local service=$1
    local rollback_env=$2
    
    warning "Rolling back ${service} to ${rollback_env} environment..."
    
    # Switch traffic back to old environment
    if switch_traffic "${service}" "${rollback_env}"; then
        log "Successfully rolled back ${service} to ${rollback_env}"
        return 0
    else
        error "Failed to rollback ${service}"
        return 1
    fi
}

# Verify deployment health
verify_deployment() {
    local service=$1
    local environment=$2
    
    info "Verifying deployment health for ${service}..."
    
    # Check deployment status
    local deployment_name="${service}-${environment}"
    local ready_replicas
    ready_replicas=$(kubectl get deployment "${deployment_name}" -n "${NAMESPACE}" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
    local desired_replicas
    desired_replicas=$(kubectl get deployment "${deployment_name}" -n "${NAMESPACE}" -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "1")
    
    if [ "${ready_replicas}" != "${desired_replicas}" ]; then
        error "Deployment verification failed: ${ready_replicas}/${desired_replicas} replicas ready"
        return 1
    fi
    
    # Perform health check
    if health_check "${service}" "${environment}"; then
        log "Deployment verification passed for ${service}"
        return 0
    else
        error "Deployment verification failed for ${service}"
        return 1
    fi
}

# Main deployment function
deploy_blue_green() {
    log "Starting blue-green deployment for AnnotateAI..."
    log "Environment: ${ENVIRONMENT}"
    log "Image Tag: ${IMAGE_TAG}"
    log "Namespace: ${NAMESPACE}"
    
    # Track deployments for rollback
    declare -A deployed_services
    declare -A current_environments
    
    # Deploy each service
    for service in "${SERVICES[@]}"; do
        log "Processing service: ${service}"
        
        # Get current and target environments
        local current_env
        current_env=$(get_current_environment "${service}")
        local target_env
        target_env=$(get_target_environment "${current_env}")
        
        # Store for potential rollback
        current_environments["${service}"]="${current_env}"
        
        info "Current environment: ${current_env}, Target environment: ${target_env}"
        
        # Deploy to target environment
        if deploy_service "${service}" "${target_env}"; then
            deployed_services["${service}"]="${target_env}"
            
            # Perform health check
            if health_check "${service}" "${target_env}"; then
                # Switch traffic to new environment
                if switch_traffic "${service}" "${target_env}"; then
                    log "Successfully deployed and switched ${service} to ${target_env}"
                    
                    # Wait a bit to ensure stability
                    sleep 10
                    
                    # Final verification
                    if verify_deployment "${service}" "${target_env}"; then
                        # Cleanup old environment
                        cleanup_old_environment "${service}" "${current_env}"
                    else
                        error "Final verification failed for ${service}"
                        if [ "${ROLLBACK_ON_FAILURE}" = "true" ]; then
                            rollback_service "${service}" "${current_env}"
                        fi
                        return 1
                    fi
                else
                    error "Failed to switch traffic for ${service}"
                    if [ "${ROLLBACK_ON_FAILURE}" = "true" ]; then
                        rollback_service "${service}" "${current_env}"
                    fi
                    return 1
                fi
            else
                error "Health check failed for ${service}"
                if [ "${ROLLBACK_ON_FAILURE}" = "true" ]; then
                    rollback_service "${service}" "${current_env}"
                fi
                return 1
            fi
        else
            error "Failed to deploy ${service}"
            return 1
        fi
    done
    
    log "Blue-green deployment completed successfully!"
    
    # Show deployment summary
    echo ""
    echo "====================================="
    echo "    Deployment Summary"
    echo "====================================="
    echo "Environment: ${ENVIRONMENT}"
    echo "Image Tag: ${IMAGE_TAG}"
    echo "Namespace: ${NAMESPACE}"
    echo ""
    echo "Services Deployed:"
    for service in "${!deployed_services[@]}"; do
        echo "  - ${service}: ${deployed_services[${service}]} environment"
    done
    echo "====================================="
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        deploy_blue_green
        ;;
    "rollback")
        service=${2:-""}
        environment=${3:-"blue"}
        if [ -z "${service}" ]; then
            error "Service name required for rollback"
            echo "Usage: $0 rollback <service> [environment]"
            exit 1
        fi
        rollback_service "${service}" "${environment}"
        ;;
    "health-check")
        service=${2:-""}
        environment=${3:-"blue"}
        if [ -z "${service}" ]; then
            error "Service name required for health check"
            echo "Usage: $0 health-check <service> [environment]"
            exit 1
        fi
        health_check "${service}" "${environment}"
        ;;
    "status")
        echo "Blue-Green Deployment Status:"
        for service in "${SERVICES[@]}"; do
            current_env=$(get_current_environment "${service}")
            echo "  ${service}: ${current_env} environment"
        done
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health-check|status}"
        echo ""
        echo "Commands:"
        echo "  deploy               - Perform blue-green deployment"
        echo "  rollback <service>   - Rollback a service to previous environment"
        echo "  health-check <service> - Check health of a service"
        echo "  status               - Show current deployment status"
        exit 1
        ;;
esac 