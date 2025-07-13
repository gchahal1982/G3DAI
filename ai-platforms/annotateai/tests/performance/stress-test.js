import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics for stress testing
export const errorRate = new Rate('stress_error_rate');
export const recoveryTime = new Trend('recovery_time');
export const systemBreakpoint = new Counter('system_breakpoint');
export const concurrentUsers = new Counter('concurrent_users');

// Stress test configuration - aggressive ramp-up to find breaking point
export const options = {
  stages: [
    { duration: '1m', target: 100 },    // Quick ramp to baseline
    { duration: '2m', target: 500 },    // Moderate stress
    { duration: '3m', target: 1000 },   // High stress
    { duration: '5m', target: 2000 },   // Very high stress
    { duration: '5m', target: 3000 },   // Extreme stress
    { duration: '10m', target: 5000 },  // Maximum stress - find breaking point
    { duration: '5m', target: 2000 },   // Recovery phase 1
    { duration: '3m', target: 500 },    // Recovery phase 2
    { duration: '2m', target: 100 },    // Recovery phase 3
    { duration: '1m', target: 0 },      // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(99)<10000'], // Allow higher latency under stress
    http_req_failed: ['rate<0.25'],     // Allow higher error rate for stress test
    stress_error_rate: ['rate<0.30'],   // Monitor stress-specific errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://api.annotateai.com';

// Heavy payload for stress testing
const heavyPayloads = {
  largeImageUpload: {
    size: '10MB',
    format: 'PNG',
    resolution: '4096x4096',
  },
  batchInference: {
    images: Array(50).fill().map((_, i) => `https://via.placeholder.com/2048x2048.jpg?text=Image${i}`),
    model: 'yolo-v8',
    batchSize: 50,
  },
  complexAnnotations: Array(1000).fill().map((_, i) => ({
    id: `annotation-${i}`,
    type: 'polygon',
    points: Array(20).fill().map(() => [Math.random() * 2048, Math.random() * 2048]),
    label: `complex-object-${i}`,
    metadata: {
      confidence: Math.random(),
      timestamp: Date.now(),
      user: `stress-user-${Math.floor(Math.random() * 100)}`,
    },
  })),
};

let systemBroken = false;
let breakpointReached = false;

export default function () {
  const vuId = __VU;
  const iteration = __ITER;
  
  // Track concurrent users
  concurrentUsers.add(1);
  
  group('Stress Test Scenarios', () => {
    // Scenario 1: Heavy API load
    group('Heavy API Load', () => {
      const responses = [];
      
      // Rapid-fire requests
      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        const response = http.get(`${BASE_URL}/api/projects`, {
          timeout: '30s',
        });
        responses.push(response);
        
        const success = check(response, {
          'request completed': (r) => r.status !== 0,
          'not timeout': (r) => r.status !== 408,
        });
        
        if (!success) {
          errorRate.add(1);
          if (response.status === 0 || response.status >= 500) {
            systemBroken = true;
            if (!breakpointReached) {
              systemBreakpoint.add(1);
              breakpointReached = true;
              console.log(`System breakpoint reached at VU: ${vuId}, Iteration: ${iteration}`);
            }
          }
        }
        
        // No sleep - maximum pressure
      }
    });
    
    // Scenario 2: Memory-intensive operations
    group('Memory Stress Test', () => {
      const largeData = {
        annotations: heavyPayloads.complexAnnotations,
        metadata: {
          timestamp: Date.now(),
          user: `stress-user-${vuId}`,
          session: `session-${iteration}`,
        },
      };
      
      const response = http.post(`${BASE_URL}/api/annotations/batch`, JSON.stringify(largeData), {
        headers: { 'Content-Type': 'application/json' },
        timeout: '60s',
      });
      
      check(response, {
        'batch annotation processed': (r) => r.status === 200 || r.status === 202,
        'memory not exhausted': (r) => r.status !== 413 && r.status !== 507,
      });
      
      if (response.status >= 500) {
        errorRate.add(1);
      }
    });
    
    // Scenario 3: AI inference stress
    group('AI Inference Stress', () => {
      const batchInferenceData = {
        images: heavyPayloads.batchInference.images.slice(0, Math.min(10, Math.floor(Math.random() * 20) + 1)),
        model: 'yolo-v8',
        priority: 'low', // Use low priority to avoid blocking normal traffic
      };
      
      const start = Date.now();
      const response = http.post(`${BASE_URL}/ai/batch-detect`, JSON.stringify(batchInferenceData), {
        headers: { 'Content-Type': 'application/json' },
        timeout: '120s',
      });
      const duration = Date.now() - start;
      
      const success = check(response, {
        'batch inference completed': (r) => r.status === 200 || r.status === 202,
        'reasonable processing time': () => duration < 60000,
      });
      
      if (!success && response.status >= 500) {
        errorRate.add(1);
      }
    });
    
    // Scenario 4: Database stress
    group('Database Stress Test', () => {
      // Simulate complex queries
      const complexQuery = {
        filters: {
          dateRange: { start: '2023-01-01', end: '2024-12-31' },
          labels: Array(20).fill().map((_, i) => `label-${i}`),
          confidence: { min: 0.5, max: 1.0 },
          users: Array(10).fill().map((_, i) => `user-${i}`),
        },
        pagination: { page: Math.floor(Math.random() * 100), limit: 100 },
        sort: { field: 'created_at', order: 'desc' },
      };
      
      const response = http.post(`${BASE_URL}/api/search/annotations`, JSON.stringify(complexQuery), {
        headers: { 'Content-Type': 'application/json' },
        timeout: '30s',
      });
      
      check(response, {
        'complex query executed': (r) => r.status === 200,
        'database responsive': (r) => r.timings.duration < 5000,
      });
      
      if (response.status >= 500) {
        errorRate.add(1);
      }
    });
    
    // Scenario 5: Storage stress
    group('Storage Stress Test', () => {
      // Simulate file operations
      const fileOps = Array(5).fill().map((_, i) => ({
        operation: 'upload',
        size: Math.floor(Math.random() * 50) + 10, // 10-60 MB
        type: 'image/jpeg',
        name: `stress-test-${vuId}-${iteration}-${i}.jpg`,
      }));
      
      fileOps.forEach(op => {
        const response = http.post(`${BASE_URL}/api/storage/simulate-upload`, JSON.stringify(op), {
          headers: { 'Content-Type': 'application/json' },
          timeout: '45s',
        });
        
        check(response, {
          'file operation completed': (r) => r.status === 200 || r.status === 202,
          'storage not full': (r) => r.status !== 507,
        });
        
        if (response.status >= 500) {
          errorRate.add(1);
        }
      });
    });
    
    // Scenario 6: Network stress (WebSocket connections)
    group('Network Stress Test', () => {
      // Simulate multiple concurrent connections per user
      for (let i = 0; i < 3; i++) {
        const wsResponse = http.get(`${BASE_URL}/ws/health`, {
          timeout: '10s',
        });
        
        check(wsResponse, {
          'websocket endpoint available': (r) => r.status === 200,
          'connection slots available': (r) => r.status !== 503,
        });
        
        if (wsResponse.status >= 500) {
          errorRate.add(1);
        }
      }
    });
  });
  
  // Recovery monitoring
  if (systemBroken) {
    group('Recovery Monitoring', () => {
      const start = Date.now();
      
      // Test basic health endpoint
      const healthResponse = http.get(`${BASE_URL}/health`, {
        timeout: '10s',
      });
      
      if (healthResponse.status === 200) {
        const recoveryDuration = Date.now() - start;
        recoveryTime.add(recoveryDuration);
        systemBroken = false;
        console.log(`System recovered in ${recoveryDuration}ms`);
      }
    });
  }
  
  // Adaptive sleep based on system health
  const sleepDuration = systemBroken ? 2 : Math.random() * 0.5;
  sleep(sleepDuration);
}

export function setup() {
  console.log('Starting stress test...');
  console.log('Target: Find system breaking point and test recovery');
  
  // Warm up
  const warmupResponse = http.get(`${BASE_URL}/health`);
  check(warmupResponse, {
    'system healthy before stress test': (r) => r.status === 200,
  });
  
  return { 
    startTime: Date.now(),
    initialHealth: warmupResponse.status === 200,
  };
}

export function teardown(data) {
  console.log(`Stress test completed. Duration: ${(Date.now() - data.startTime) / 1000}s`);
  
  // Final health check
  const finalHealthResponse = http.get(`${BASE_URL}/health`);
  const recovered = finalHealthResponse.status === 200;
  
  console.log(`System health: ${recovered ? 'RECOVERED' : 'DEGRADED'}`);
  console.log(`Initial health: ${data.initialHealth ? 'HEALTHY' : 'UNHEALTHY'}`);
  
  if (breakpointReached) {
    console.log('✅ Breaking point successfully identified');
  } else {
    console.log('ℹ️  System withstood maximum stress - consider increasing load');
  }
}

export function handleSummary(data) {
  const stressReport = {
    testType: 'stress',
    timestamp: new Date().toISOString(),
    duration: data.state.testRunDurationMs,
    breakpointReached: breakpointReached,
    systemRecovered: !systemBroken,
    metrics: {
      maxConcurrentUsers: data.metrics.concurrent_users?.values?.max || 0,
      errorRate: data.metrics.stress_error_rate?.values?.rate || 0,
      recoveryTime: data.metrics.recovery_time?.values?.avg || 0,
      totalRequests: data.metrics.http_reqs?.values?.count || 0,
      failedRequests: data.metrics.http_req_failed?.values?.count || 0,
    },
    thresholds: data.thresholds,
  };
  
  return {
    'stress-test-results.json': JSON.stringify(stressReport, null, 2),
    stdout: generateStressReport(stressReport, data),
  };
}

function generateStressReport(stressReport, data) {
  let report = '\n' + '='.repeat(60) + '\n';
  report += '           STRESS TEST REPORT\n';
  report += '='.repeat(60) + '\n\n';
  
  report += `Test Duration: ${(stressReport.duration / 1000).toFixed(2)}s\n`;
  report += `Breaking Point Reached: ${stressReport.breakpointReached ? '✅ YES' : '❌ NO'}\n`;
  report += `System Recovered: ${stressReport.systemRecovered ? '✅ YES' : '❌ NO'}\n\n`;
  
  report += 'PERFORMANCE METRICS:\n';
  report += '-'.repeat(30) + '\n';
  report += `Max Concurrent Users: ${stressReport.metrics.maxConcurrentUsers}\n`;
  report += `Total Requests: ${stressReport.metrics.totalRequests}\n`;
  report += `Failed Requests: ${stressReport.metrics.failedRequests}\n`;
  report += `Error Rate: ${(stressReport.metrics.errorRate * 100).toFixed(2)}%\n`;
  
  if (stressReport.metrics.recoveryTime > 0) {
    report += `Average Recovery Time: ${stressReport.metrics.recoveryTime.toFixed(2)}ms\n`;
  }
  
  report += '\nTHRESHOLD RESULTS:\n';
  report += '-'.repeat(30) + '\n';
  for (const [name, threshold] of Object.entries(stressReport.thresholds || {})) {
    const status = threshold.ok ? '✅ PASS' : '❌ FAIL';
    report += `${name}: ${status}\n`;
  }
  
  report += '\nRECOMMENDations:\n';
  report += '-'.repeat(30) + '\n';
  
  if (!stressReport.breakpointReached) {
    report += '• System handled maximum load well - consider increasing stress levels\n';
    report += '• Current infrastructure appears well-dimensioned\n';
  } else {
    report += '• Breaking point identified - monitor these metrics in production\n';
    report += '• Consider horizontal scaling for peak loads\n';
  }
  
  if (stressReport.metrics.errorRate > 0.1) {
    report += '• High error rate under stress - investigate error handling\n';
  }
  
  if (stressReport.metrics.recoveryTime > 5000) {
    report += '• Slow recovery time - optimize health check and restart procedures\n';
  }
  
  report += '\n' + '='.repeat(60) + '\n';
  
  return report;
} 