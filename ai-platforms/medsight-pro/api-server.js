const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3033;

// Middleware
app.use(cors());
app.use(express.json());

// Medical dashboard API endpoint
app.get('/api/medical/dashboard', (req, res) => {
  console.log('📋 Medical dashboard API called');
  
  const dashboardData = {
    user: {
      name: 'Dr. Development User',
      role: 'Radiologist',
      specialization: 'Diagnostic Imaging',
      licenseNumber: 'MD-2024-001'
    },
    metrics: {
      totalCases: 1247,
      pendingReviews: 23,
      completedToday: 8,
      criticalFindings: 3,
      aiAccuracy: 94.2,
      averageReviewTime: '4.2 min'
    },
    systemStatus: {
      dicomProcessor: 'online',
      aiEngine: 'online',
      database: 'connected'
    }
  };
  
  res.json(dashboardData);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'medsight-pro-api'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏥 MedSight Pro API Server running on http://localhost:${PORT}`);
  console.log(`📋 Medical Dashboard API: http://localhost:${PORT}/api/medical/dashboard`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
}); 