import http from 'k6/http';
import ws from 'k6/ws';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('error_rate');
export const aiInferenceTime = new Trend('ai_inference_time');
export const collaborationLatency = new Trend('collaboration_latency');
export const uploadRate = new Counter('file_uploads');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 50 },    // Ramp-up to 50 users
    { duration: '5m', target: 100 },   // Ramp-up to 100 users
    { duration: '10m', target: 200 },  // Stay at 200 users
    { duration: '5m', target: 500 },   // Ramp-up to 500 users
    { duration: '10m', target: 500 },  // Stay at 500 users
    { duration: '5m', target: 0 },     // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.05'],    // Error rate must be below 5%
    error_rate: ['rate<0.05'],
    ai_inference_time: ['p(95)<5000'], // AI inference under 5s
    collaboration_latency: ['p(95)<500'], // Collaboration updates under 500ms
  },
};

// Test configuration
const BASE_URL = __ENV.BASE_URL || 'https://api.annotateai.com';
const WS_URL = __ENV.WS_URL || 'wss://api.annotateai.com/ws';

// Test data
const testUsers = [
  { email: 'user1@example.com', password: 'password123' },
  { email: 'user2@example.com', password: 'password123' },
  { email: 'user3@example.com', password: 'password123' },
];

const testImages = [
  'https://via.placeholder.com/640x480.jpg',
  'https://via.placeholder.com/1024x768.jpg',
  'https://via.placeholder.com/1920x1080.jpg',
];

// Authentication helper
function authenticate() {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  const response = http.post(`${BASE_URL}/auth/login`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(response, {
    'login successful': (r) => r.status === 200,
    'token received': (r) => r.json('token') !== undefined,
  });
  
  return response.json('token');
}

// Main test scenario
export default function () {
  // Authentication
  group('Authentication', () => {
    const token = authenticate();
    if (!token) {
      errorRate.add(1);
      return;
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    
    // Test API endpoints
    group('API Tests', () => {
      // Get user profile
      let response = http.get(`${BASE_URL}/api/user/profile`, { headers });
      check(response, {
        'profile retrieved': (r) => r.status === 200,
        'response time OK': (r) => r.timings.duration < 1000,
      });
      
      // Get projects
      response = http.get(`${BASE_URL}/api/projects`, { headers });
      check(response, {
        'projects retrieved': (r) => r.status === 200,
        'projects is array': (r) => Array.isArray(r.json()),
      });
      
      // Create project
      const projectData = {
        name: `Test Project ${Math.random()}`,
        description: 'Load test project',
        type: 'object_detection',
      };
      
      response = http.post(`${BASE_URL}/api/projects`, JSON.stringify(projectData), { headers });
      check(response, {
        'project created': (r) => r.status === 201,
        'project has id': (r) => r.json('id') !== undefined,
      });
      
      const projectId = response.json('id');
      
      // Upload dataset
      if (projectId) {
        const imageUrl = testImages[Math.floor(Math.random() * testImages.length)];
        const uploadData = {
          projectId: projectId,
          files: [
            { url: imageUrl, name: 'test-image.jpg' }
          ],
        };
        
        response = http.post(`${BASE_URL}/api/datasets/upload`, JSON.stringify(uploadData), { headers });
        check(response, {
          'dataset uploaded': (r) => r.status === 200,
        });
        
        uploadRate.add(1);
      }
    });
    
    // Test AI inference
    group('AI Inference Tests', () => {
      const imageUrl = testImages[Math.floor(Math.random() * testImages.length)];
      const inferenceData = {
        imageUrl: imageUrl,
        model: 'yolo-v8',
        confidence: 0.5,
      };
      
      const start = Date.now();
      const response = http.post(`${BASE_URL}/ai/detect`, JSON.stringify(inferenceData), { headers });
      const inferenceTime = Date.now() - start;
      
      check(response, {
        'inference successful': (r) => r.status === 200,
        'results returned': (r) => r.json('detections') !== undefined,
        'inference time acceptable': () => inferenceTime < 10000,
      });
      
      aiInferenceTime.add(inferenceTime);
      
      if (response.status !== 200) {
        errorRate.add(1);
      }
    });
    
    // Test segmentation
    group('Segmentation Tests', () => {
      const imageUrl = testImages[Math.floor(Math.random() * testImages.length)];
      const segmentationData = {
        imageUrl: imageUrl,
        model: 'sam',
        prompt: { x: 320, y: 240 },
      };
      
      const start = Date.now();
      const response = http.post(`${BASE_URL}/ai/segment`, JSON.stringify(segmentationData), { headers });
      const segmentationTime = Date.now() - start;
      
      check(response, {
        'segmentation successful': (r) => r.status === 200,
        'mask returned': (r) => r.json('mask') !== undefined,
      });
      
      aiInferenceTime.add(segmentationTime);
    });
    
    // Test real-time collaboration
    group('Real-time Collaboration', () => {
      const ws_url = `${WS_URL}?token=${token}`;
      const collaborationStart = Date.now();
      
      const res = ws.connect(ws_url, {}, function (socket) {
        socket.on('open', () => {
          // Join a project room
          socket.send(JSON.stringify({
            type: 'join_project',
            projectId: 'test-project-123',
          }));
        });
        
        socket.on('message', (data) => {
          const message = JSON.parse(data);
          const latency = Date.now() - collaborationStart;
          
          check(message, {
            'valid message format': (m) => m.type !== undefined,
          });
          
          collaborationLatency.add(latency);
        });
        
        // Send annotation update
        socket.send(JSON.stringify({
          type: 'annotation_update',
          data: {
            id: `annotation-${Math.random()}`,
            x: Math.random() * 640,
            y: Math.random() * 480,
            width: Math.random() * 100,
            height: Math.random() * 100,
            label: 'test',
          },
        }));
        
        sleep(2);
      });
      
      check(res, {
        'websocket connection established': (r) => r && r.status === 101,
      });
    });
    
    // Test data export
    group('Data Export Tests', () => {
      const exportData = {
        projectId: 'test-project-123',
        format: 'coco',
        includeImages: false,
      };
      
      const response = http.post(`${BASE_URL}/api/export`, JSON.stringify(exportData), { headers });
      check(response, {
        'export initiated': (r) => r.status === 202,
        'export job id returned': (r) => r.json('jobId') !== undefined,
      });
    });
    
    // Test analytics
    group('Analytics Tests', () => {
      const response = http.get(`${BASE_URL}/api/analytics/dashboard`, { headers });
      check(response, {
        'analytics retrieved': (r) => r.status === 200,
        'analytics has metrics': (r) => r.json('metrics') !== undefined,
      });
    });
  });
  
  // Random sleep between iterations
  sleep(Math.random() * 3 + 1);
}

// Setup function
export function setup() {
  // Pre-create test data if needed
  console.log('Setting up load test...');
  
  // Warm up the system
  const warmupResponse = http.get(`${BASE_URL}/health`);
  check(warmupResponse, {
    'system healthy': (r) => r.status === 200,
  });
  
  return { timestamp: Date.now() };
}

// Teardown function
export function teardown(data) {
  console.log(`Load test completed. Started at: ${new Date(data.timestamp)}`);
}

// Handle check failures
export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = `${indent}Load Test Summary\n`;
  summary += `${indent}================\n\n`;
  
  // Test duration
  const testDuration = data.state.testRunDurationMs / 1000;
  summary += `${indent}Test Duration: ${testDuration.toFixed(2)}s\n`;
  
  // HTTP metrics
  if (data.metrics.http_reqs) {
    const totalRequests = data.metrics.http_reqs.values.count;
    const requestRate = data.metrics.http_reqs.values.rate;
    summary += `${indent}Total Requests: ${totalRequests}\n`;
    summary += `${indent}Request Rate: ${requestRate.toFixed(2)} req/s\n`;
  }
  
  // Response time metrics
  if (data.metrics.http_req_duration) {
    const p95 = data.metrics.http_req_duration.values['p(95)'];
    const p99 = data.metrics.http_req_duration.values['p(99)'];
    const avg = data.metrics.http_req_duration.values.avg;
    summary += `${indent}Response Time (avg): ${avg.toFixed(2)}ms\n`;
    summary += `${indent}Response Time (p95): ${p95.toFixed(2)}ms\n`;
    summary += `${indent}Response Time (p99): ${p99.toFixed(2)}ms\n`;
  }
  
  // Error rate
  if (data.metrics.http_req_failed) {
    const errorRate = data.metrics.http_req_failed.values.rate * 100;
    summary += `${indent}Error Rate: ${errorRate.toFixed(2)}%\n`;
  }
  
  // AI inference metrics
  if (data.metrics.ai_inference_time) {
    const aiP95 = data.metrics.ai_inference_time.values['p(95)'];
    summary += `${indent}AI Inference Time (p95): ${aiP95.toFixed(2)}ms\n`;
  }
  
  // Collaboration metrics
  if (data.metrics.collaboration_latency) {
    const collabP95 = data.metrics.collaboration_latency.values['p(95)'];
    summary += `${indent}Collaboration Latency (p95): ${collabP95.toFixed(2)}ms\n`;
  }
  
  summary += '\n';
  
  // Threshold results
  summary += `${indent}Threshold Results:\n`;
  for (const [name, threshold] of Object.entries(data.thresholds || {})) {
    const passed = threshold.ok ? '✓' : '✗';
    const color = enableColors ? (threshold.ok ? '\x1b[32m' : '\x1b[31m') : '';
    const reset = enableColors ? '\x1b[0m' : '';
    summary += `${indent}  ${color}${passed}${reset} ${name}\n`;
  }
  
  return summary;
} 