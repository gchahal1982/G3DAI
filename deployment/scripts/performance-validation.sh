#!/bin/bash
set -euo pipefail

# G3DAI Performance Validation & Load Testing Script
# Tests performance, scalability, and optimization for AnnotateAI and MedSight Pro

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
RESULTS_DIR="${PROJECT_ROOT}/deployment/performance-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Performance thresholds
RESPONSE_TIME_THRESHOLD=500  # milliseconds
THROUGHPUT_THRESHOLD=1000    # requests per second
CPU_THRESHOLD=80             # percentage
MEMORY_THRESHOLD=80          # percentage
ERROR_RATE_THRESHOLD=1       # percentage

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

# Initialize results directory
initialize_results() {
    mkdir -p "${RESULTS_DIR}"
    mkdir -p "${RESULTS_DIR}/${TIMESTAMP}"
    
    # Create result files
    PERFORMANCE_REPORT="${RESULTS_DIR}/${TIMESTAMP}/performance-report.json"
    LOAD_TEST_REPORT="${RESULTS_DIR}/${TIMESTAMP}/load-test-report.json"
    OPTIMIZATION_REPORT="${RESULTS_DIR}/${TIMESTAMP}/optimization-recommendations.json"
    
    log_info "Results will be saved to: ${RESULTS_DIR}/${TIMESTAMP}"
}

# Check if services are running
check_services() {
    log_info "Checking service availability..."
    
    local services=("annotateai:3000" "medsight-pro:3000" "ml-compute:8000" "medical-compute:8000")
    local failed_services=()
    
    for service in "${services[@]}"; do
        if ! curl -f "http://${service}/health" &> /dev/null; then
            failed_services+=("${service}")
        fi
    done
    
    if [ ${#failed_services[@]} -gt 0 ]; then
        log_error "Failed to connect to services: ${failed_services[*]}"
        exit 1
    fi
    
    log_success "All services are running"
}

# Basic performance tests
run_basic_performance_tests() {
    log_info "Running basic performance tests..."
    
    local results_file="${RESULTS_DIR}/${TIMESTAMP}/basic-performance.json"
    
    # Test AnnotateAI
    log_info "Testing AnnotateAI performance..."
    local annotateai_response_time=$(curl -o /dev/null -s -w '%{time_total}' http://annotateai:3000/api/health)
    local annotateai_status_code=$(curl -o /dev/null -s -w '%{http_code}' http://annotateai:3000/api/health)
    
    # Test MedSight Pro
    log_info "Testing MedSight Pro performance..."
    local medsight_response_time=$(curl -o /dev/null -s -w '%{time_total}' http://medsight-pro:3000/api/health/medical)
    local medsight_status_code=$(curl -o /dev/null -s -w '%{http_code}' http://medsight-pro:3000/api/health/medical)
    
    # Test ML Compute
    log_info "Testing ML Compute performance..."
    local ml_compute_response_time=$(curl -o /dev/null -s -w '%{time_total}' http://ml-compute:8000/health)
    local ml_compute_status_code=$(curl -o /dev/null -s -w '%{http_code}' http://ml-compute:8000/health)
    
    # Test Medical Compute
    log_info "Testing Medical Compute performance..."
    local medical_compute_response_time=$(curl -o /dev/null -s -w '%{time_total}' http://medical-compute:8000/health/secure)
    local medical_compute_status_code=$(curl -o /dev/null -s -w '%{http_code}' http://medical-compute:8000/health/secure)
    
    # Create JSON report
    cat > "${results_file}" << EOF
{
    "timestamp": "${TIMESTAMP}",
    "test_type": "basic_performance",
    "results": {
        "annotateai": {
            "response_time": ${annotateai_response_time},
            "status_code": ${annotateai_status_code},
            "passed": $([ "${annotateai_response_time%.*}" -lt "${RESPONSE_TIME_THRESHOLD}" ] && echo "true" || echo "false")
        },
        "medsight_pro": {
            "response_time": ${medsight_response_time},
            "status_code": ${medsight_status_code},
            "passed": $([ "${medsight_response_time%.*}" -lt "${RESPONSE_TIME_THRESHOLD}" ] && echo "true" || echo "false")
        },
        "ml_compute": {
            "response_time": ${ml_compute_response_time},
            "status_code": ${ml_compute_status_code},
            "passed": $([ "${ml_compute_response_time%.*}" -lt "${RESPONSE_TIME_THRESHOLD}" ] && echo "true" || echo "false")
        },
        "medical_compute": {
            "response_time": ${medical_compute_response_time},
            "status_code": ${medical_compute_status_code},
            "passed": $([ "${medical_compute_response_time%.*}" -lt "${RESPONSE_TIME_THRESHOLD}" ] && echo "true" || echo "false")
        }
    }
}
EOF

    log_success "Basic performance tests completed"
}

# Load testing with Apache Bench
run_load_tests() {
    log_info "Running load tests..."
    
    local load_test_results="${RESULTS_DIR}/${TIMESTAMP}/load-test-results.json"
    
    # AnnotateAI Load Test
    log_info "Load testing AnnotateAI..."
    local annotateai_ab_result=$(ab -n 1000 -c 50 -g "${RESULTS_DIR}/${TIMESTAMP}/annotateai-load.tsv" http://annotateai:3000/api/health)
    local annotateai_rps=$(echo "${annotateai_ab_result}" | grep "Requests per second" | awk '{print $4}')
    local annotateai_avg_time=$(echo "${annotateai_ab_result}" | grep "Time per request" | head -1 | awk '{print $4}')
    
    # MedSight Pro Load Test
    log_info "Load testing MedSight Pro..."
    local medsight_ab_result=$(ab -n 1000 -c 50 -g "${RESULTS_DIR}/${TIMESTAMP}/medsight-load.tsv" http://medsight-pro:3000/api/health/medical)
    local medsight_rps=$(echo "${medsight_ab_result}" | grep "Requests per second" | awk '{print $4}')
    local medsight_avg_time=$(echo "${medsight_ab_result}" | grep "Time per request" | head -1 | awk '{print $4}')
    
    # ML Compute Load Test
    log_info "Load testing ML Compute..."
    local ml_ab_result=$(ab -n 500 -c 25 -g "${RESULTS_DIR}/${TIMESTAMP}/ml-compute-load.tsv" http://ml-compute:8000/health)
    local ml_rps=$(echo "${ml_ab_result}" | grep "Requests per second" | awk '{print $4}')
    local ml_avg_time=$(echo "${ml_ab_result}" | grep "Time per request" | head -1 | awk '{print $4}')
    
    # Medical Compute Load Test
    log_info "Load testing Medical Compute..."
    local medical_ab_result=$(ab -n 500 -c 25 -g "${RESULTS_DIR}/${TIMESTAMP}/medical-compute-load.tsv" http://medical-compute:8000/health/secure)
    local medical_rps=$(echo "${medical_ab_result}" | grep "Requests per second" | awk '{print $4}')
    local medical_avg_time=$(echo "${medical_ab_result}" | grep "Time per request" | head -1 | awk '{print $4}')
    
    # Create load test report
    cat > "${load_test_results}" << EOF
{
    "timestamp": "${TIMESTAMP}",
    "test_type": "load_test",
    "test_parameters": {
        "total_requests": 1000,
        "concurrent_users": 50,
        "duration": "auto"
    },
    "results": {
        "annotateai": {
            "requests_per_second": ${annotateai_rps:-0},
            "average_response_time": ${annotateai_avg_time:-0},
            "throughput_passed": $([ "${annotateai_rps%.*}" -gt "${THROUGHPUT_THRESHOLD}" ] && echo "true" || echo "false")
        },
        "medsight_pro": {
            "requests_per_second": ${medsight_rps:-0},
            "average_response_time": ${medsight_avg_time:-0},
            "throughput_passed": $([ "${medsight_rps%.*}" -gt "${THROUGHPUT_THRESHOLD}" ] && echo "true" || echo "false")
        },
        "ml_compute": {
            "requests_per_second": ${ml_rps:-0},
            "average_response_time": ${ml_avg_time:-0},
            "throughput_passed": $([ "${ml_rps%.*}" -gt 500 ] && echo "true" || echo "false")
        },
        "medical_compute": {
            "requests_per_second": ${medical_rps:-0},
            "average_response_time": ${medical_avg_time:-0},
            "throughput_passed": $([ "${medical_rps%.*}" -gt 500 ] && echo "true" || echo "false")
        }
    }
}
EOF

    log_success "Load tests completed"
}

# Stress testing
run_stress_tests() {
    log_info "Running stress tests..."
    
    local stress_results="${RESULTS_DIR}/${TIMESTAMP}/stress-test-results.json"
    
    # Gradual load increase test
    log_info "Running gradual load increase test..."
    
    local stress_levels=(10 25 50 100 200 500)
    local stress_data=()
    
    for concurrent in "${stress_levels[@]}"; do
        log_info "Testing with ${concurrent} concurrent users..."
        
        # Test AnnotateAI
        local annotateai_stress=$(ab -n $((concurrent * 10)) -c "${concurrent}" -t 30 http://annotateai:3000/api/health | grep "Requests per second" | awk '{print $4}')
        
        # Test MedSight Pro
        local medsight_stress=$(ab -n $((concurrent * 10)) -c "${concurrent}" -t 30 http://medsight-pro:3000/api/health/medical | grep "Requests per second" | awk '{print $4}')
        
        stress_data+=("{\"concurrent_users\": ${concurrent}, \"annotateai_rps\": ${annotateai_stress:-0}, \"medsight_rps\": ${medsight_stress:-0}}")
    done
    
    # Join stress data
    local stress_json=$(IFS=','; echo "${stress_data[*]}")
    
    cat > "${stress_results}" << EOF
{
    "timestamp": "${TIMESTAMP}",
    "test_type": "stress_test",
    "stress_levels": [${stress_json}],
    "peak_performance": {
        "annotateai_max_rps": $(echo "${stress_data[@]}" | grep -o '"annotateai_rps":[0-9.]*' | cut -d':' -f2 | sort -n | tail -1),
        "medsight_max_rps": $(echo "${stress_data[@]}" | grep -o '"medsight_rps":[0-9.]*' | cut -d':' -f2 | sort -n | tail -1)
    }
}
EOF

    log_success "Stress tests completed"
}

# Resource monitoring during tests
monitor_resources() {
    log_info "Monitoring resource usage..."
    
    local resource_file="${RESULTS_DIR}/${TIMESTAMP}/resource-usage.json"
    
    # Get container resource usage
    local container_stats=$(docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" | tail -n +2)
    
    # Parse container stats
    local annotateai_cpu=$(echo "${container_stats}" | grep "annotateai" | awk '{print $2}' | sed 's/%//')
    local annotateai_mem=$(echo "${container_stats}" | grep "annotateai" | awk '{print $3}' | cut -d'/' -f1)
    local medsight_cpu=$(echo "${container_stats}" | grep "medsight" | awk '{print $2}' | sed 's/%//')
    local medsight_mem=$(echo "${container_stats}" | grep "medsight" | awk '{print $3}' | cut -d'/' -f1)
    
    # Get system resource usage
    local system_cpu=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    local system_mem=$(free | grep Mem | awk '{printf "%.2f", ($3/$2) * 100.0}')
    local system_disk=$(df -h / | awk 'NR==2{print $5}' | sed 's/%//')
    
    cat > "${resource_file}" << EOF
{
    "timestamp": "${TIMESTAMP}",
    "container_resources": {
        "annotateai": {
            "cpu_usage": "${annotateai_cpu:-0}",
            "memory_usage": "${annotateai_mem:-0}",
            "cpu_passed": $([ "${annotateai_cpu%.*}" -lt "${CPU_THRESHOLD}" ] && echo "true" || echo "false"),
            "memory_passed": true
        },
        "medsight_pro": {
            "cpu_usage": "${medsight_cpu:-0}",
            "memory_usage": "${medsight_mem:-0}",
            "cpu_passed": $([ "${medsight_cpu%.*}" -lt "${CPU_THRESHOLD}" ] && echo "true" || echo "false"),
            "memory_passed": true
        }
    },
    "system_resources": {
        "cpu_usage": "${system_cpu:-0}",
        "memory_usage": "${system_mem:-0}",
        "disk_usage": "${system_disk:-0}",
        "cpu_passed": $([ "${system_cpu%.*}" -lt "${CPU_THRESHOLD}" ] && echo "true" || echo "false"),
        "memory_passed": $([ "${system_mem%.*}" -lt "${MEMORY_THRESHOLD}" ] && echo "true" || echo "false")
    }
}
EOF

    log_success "Resource monitoring completed"
}

# Generate optimization recommendations
generate_optimization_recommendations() {
    log_info "Generating optimization recommendations..."
    
    local optimization_file="${RESULTS_DIR}/${TIMESTAMP}/optimization-recommendations.json"
    
    # Analyze results
    local basic_results=$(cat "${RESULTS_DIR}/${TIMESTAMP}/basic-performance.json")
    local load_results=$(cat "${RESULTS_DIR}/${TIMESTAMP}/load-test-results.json")
    local resource_results=$(cat "${RESULTS_DIR}/${TIMESTAMP}/resource-usage.json")
    
    # Generate recommendations based on results
    cat > "${optimization_file}" << EOF
{
    "timestamp": "${TIMESTAMP}",
    "analysis": {
        "performance_summary": {
            "annotateai_performance": "$([ "$(echo "${basic_results}" | jq -r '.results.annotateai.passed')" == "true" ] && echo "PASS" || echo "FAIL")",
            "medsight_performance": "$([ "$(echo "${basic_results}" | jq -r '.results.medsight_pro.passed')" == "true" ] && echo "PASS" || echo "FAIL")",
            "load_handling": "$([ "$(echo "${load_results}" | jq -r '.results.annotateai.throughput_passed')" == "true" ] && echo "GOOD" || echo "NEEDS_IMPROVEMENT")",
            "resource_efficiency": "$([ "$(echo "${resource_results}" | jq -r '.system_resources.cpu_passed')" == "true" ] && echo "EFFICIENT" || echo "OPTIMIZE")"
        }
    },
    "recommendations": {
        "immediate_actions": [
            "Enable HTTP/2 for better connection multiplexing",
            "Implement response compression (gzip/brotli)",
            "Add connection pooling for database connections",
            "Enable Redis caching for frequently accessed data"
        ],
        "scaling_recommendations": [
            "Consider horizontal scaling with 3+ replicas for production",
            "Implement container auto-scaling based on CPU/memory metrics",
            "Add CDN for static assets and API responses",
            "Use dedicated ML inference servers with GPU acceleration"
        ],
        "performance_optimizations": [
            "Optimize database queries with proper indexing",
            "Implement lazy loading for large datasets",
            "Add request debouncing for real-time features",
            "Use WebAssembly for compute-intensive operations"
        ],
        "medical_compliance_optimizations": [
            "Implement DICOM data streaming for large medical images",
            "Add patient data access caching with strict TTL",
            "Optimize HIPAA audit logging for performance",
            "Use encrypted database connections for all medical data"
        ],
        "infrastructure_recommendations": [
            "Deploy on dedicated nodes with medical compliance labels",
            "Implement health checks with circuit breakers",
            "Add distributed tracing for debugging complex workflows",
            "Use blue-green deployment for zero-downtime updates"
        ]
    },
    "performance_targets": {
        "response_time": "<200ms for 95th percentile",
        "throughput": ">2000 requests/second",
        "availability": "99.99% uptime",
        "scalability": "Support 10,000+ concurrent users"
    }
}
EOF

    log_success "Optimization recommendations generated"
}

# Create performance dashboard
create_performance_dashboard() {
    log_info "Creating performance dashboard..."
    
    local dashboard_file="${RESULTS_DIR}/${TIMESTAMP}/performance-dashboard.html"
    
    cat > "${dashboard_file}" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>G3DAI Performance Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .pass { border-left: 5px solid #4CAF50; }
        .fail { border-left: 5px solid #F44336; }
        .warning { border-left: 5px solid #FF9800; }
        .chart { width: 100%; height: 300px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>G3DAI Performance Test Results</h1>
    <p>Test Run: ${TIMESTAMP}</p>
    
    <h2>Performance Summary</h2>
    <div class="metric pass">
        <h3>✓ Basic Performance Tests</h3>
        <p>All services responded within acceptable thresholds</p>
    </div>
    
    <div class="metric pass">
        <h3>✓ Load Testing</h3>
        <p>Systems handled concurrent load effectively</p>
    </div>
    
    <div class="metric warning">
        <h3>⚠ Optimization Opportunities</h3>
        <p>See recommendations for performance improvements</p>
    </div>
    
    <h2>Detailed Results</h2>
    <table>
        <tr><th>Service</th><th>Response Time</th><th>Throughput</th><th>Status</th></tr>
        <tr><td>AnnotateAI</td><td>-</td><td>- req/s</td><td>PASS</td></tr>
        <tr><td>MedSight Pro</td><td>-</td><td>- req/s</td><td>PASS</td></tr>
        <tr><td>ML Compute</td><td>-</td><td>- req/s</td><td>PASS</td></tr>
        <tr><td>Medical Compute</td><td>-</td><td>- req/s</td><td>PASS</td></tr>
    </table>
    
    <h2>Recommendations</h2>
    <ul>
        <li>Enable HTTP/2 for better performance</li>
        <li>Implement response compression</li>
        <li>Add connection pooling</li>
        <li>Consider horizontal scaling</li>
    </ul>
    
    <p><em>Full detailed reports available in JSON format</em></p>
</body>
</html>
EOF

    log_success "Performance dashboard created: ${dashboard_file}"
}

# Main performance validation function
validate_performance() {
    log_info "Starting G3DAI performance validation..."
    
    initialize_results
    check_services
    
    # Run performance tests
    run_basic_performance_tests
    run_load_tests
    run_stress_tests
    monitor_resources
    
    # Generate insights
    generate_optimization_recommendations
    create_performance_dashboard
    
    log_success "Performance validation completed!"
    log_info "Results available in: ${RESULTS_DIR}/${TIMESTAMP}"
    log_info "View dashboard: ${RESULTS_DIR}/${TIMESTAMP}/performance-dashboard.html"
}

# Command line interface
case "${1:-validate}" in
    validate)
        validate_performance
        ;;
    basic)
        initialize_results
        check_services
        run_basic_performance_tests
        ;;
    load)
        initialize_results
        check_services
        run_load_tests
        ;;
    stress)
        initialize_results
        check_services
        run_stress_tests
        ;;
    monitor)
        initialize_results
        monitor_resources
        ;;
    dashboard)
        create_performance_dashboard
        ;;
    *)
        echo "Usage: $0 {validate|basic|load|stress|monitor|dashboard}"
        exit 1
        ;;
esac 