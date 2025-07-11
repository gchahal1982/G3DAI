'use client';

import React, { useState } from 'react';
import { 
  Brain, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Activity,
  FileText,
  Camera,
  Zap,
  TrendingUp,
  TrendingDown,
  Search,
  Award,
  Shield,
  Eye,
  Microscope,
  Stethoscope,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';

interface DiagnosticMetrics {
  imagingStudies: number;
  labResults: number;
  pathologyReports: number;
  radiologyTurnaround: number;
  criticalValueAlerts: number;
  aiDetectionRate: number;
  falsePositiveRate: number;
  qualityScore: number;
}

interface DiagnosticAnalyticsProps {
  metrics: DiagnosticMetrics;
  timeRange: string;
}

interface ImagingBreakdown {
  modality: string;
  count: number;
  percentage: number;
  avgProcessingTime: number;
  aiAccuracy: number;
  criticalFindings: number;
}

interface AIPerformance {
  overallAccuracy: number;
  sensitivityRate: number;
  specificityRate: number;
  confidenceScore: number;
  processingSpeed: number;
  categories: {
    category: string;
    accuracy: number;
    volume: number;
    improvement: number;
  }[];
}

interface QualityMetrics {
  imageQuality: number;
  reportCompleteness: number;
  diagnosticAccuracy: number;
  turnaroundTime: number;
  patientSafety: number;
  complianceScore: number;
}

const DiagnosticAnalytics: React.FC<DiagnosticAnalyticsProps> = ({ metrics, timeRange }) => {
  const [selectedView, setSelectedView] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [selectedModality, setSelectedModality] = useState('all');

  // Mock data for comprehensive diagnostics
  const imagingBreakdown: ImagingBreakdown[] = [
    {
      modality: 'CT Scan',
      count: 1247,
      percentage: 32.1,
      avgProcessingTime: 2.3,
      aiAccuracy: 94.2,
      criticalFindings: 89
    },
    {
      modality: 'MRI',
      count: 987,
      percentage: 25.4,
      avgProcessingTime: 3.1,
      aiAccuracy: 96.1,
      criticalFindings: 67
    },
    {
      modality: 'X-Ray',
      count: 1534,
      percentage: 39.5,
      avgProcessingTime: 1.2,
      aiAccuracy: 91.8,
      criticalFindings: 45
    },
    {
      modality: 'Ultrasound',
      count: 234,
      percentage: 6.0,
      avgProcessingTime: 1.8,
      aiAccuracy: 88.5,
      criticalFindings: 23
    },
    {
      modality: 'Mammography',
      count: 345,
      percentage: 8.9,
      avgProcessingTime: 2.1,
      aiAccuracy: 95.7,
      criticalFindings: 34
    }
  ];

  const aiPerformance: AIPerformance = {
    overallAccuracy: metrics.aiDetectionRate,
    sensitivityRate: 92.4,
    specificityRate: 89.7,
    confidenceScore: 87.2,
    processingSpeed: 1.8,
    categories: [
      { category: 'Pulmonary', accuracy: 95.2, volume: 456, improvement: 3.2 },
      { category: 'Cardiac', accuracy: 93.1, volume: 234, improvement: 2.8 },
      { category: 'Neurological', accuracy: 91.8, volume: 345, improvement: 4.1 },
      { category: 'Musculoskeletal', accuracy: 89.4, volume: 567, improvement: 2.3 },
      { category: 'Oncology', accuracy: 96.7, volume: 189, improvement: 5.2 }
    ]
  };

  const qualityMetrics: QualityMetrics = {
    imageQuality: metrics.qualityScore,
    reportCompleteness: 98.4,
    diagnosticAccuracy: 94.7,
    turnaroundTime: 96.2,
    patientSafety: 99.1,
    complianceScore: 97.8
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => `${num.toFixed(1)}%`;

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 95) return 'bg-green-50 border-green-200';
    if (score >= 85) return 'bg-yellow-50 border-yellow-200';
    if (score >= 70) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getTrendIcon = (improvement: number) => {
    return improvement > 0 ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const refreshData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Diagnostic Analytics</h2>
          <p className="text-sm text-gray-600">AI-powered diagnostic insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <select
            value={selectedModality}
            onChange={(e) => setSelectedModality(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Modalities</option>
            <option value="ct">CT Scan</option>
            <option value="mri">MRI</option>
            <option value="xray">X-Ray</option>
            <option value="ultrasound">Ultrasound</option>
            <option value="mammography">Mammography</option>
          </select>
          <select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="overview">Overview</option>
            <option value="imaging">Imaging Analysis</option>
            <option value="ai-performance">AI Performance</option>
            <option value="quality">Quality Metrics</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Studies</p>
              <p className="text-2xl font-bold text-blue-600">{formatNumber(metrics.imagingStudies)}</p>
              <p className="text-sm text-gray-500">+{formatNumber(metrics.labResults)} lab results</p>
            </div>
            <Camera className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI Detection Rate</p>
              <p className={`text-2xl font-bold ${getScoreColor(metrics.aiDetectionRate)}`}>
                {formatPercentage(metrics.aiDetectionRate)}
              </p>
              <p className="text-sm text-gray-500">
                {formatPercentage(metrics.falsePositiveRate)} false positive
              </p>
            </div>
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Turnaround</p>
              <p className="text-2xl font-bold text-green-600">{metrics.radiologyTurnaround}h</p>
              <p className="text-sm text-gray-500">Target: &lt;2h</p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600">{metrics.criticalValueAlerts}</p>
              <p className="text-sm text-gray-500">Requiring immediate attention</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Main Content Based on Selected View */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {selectedView === 'overview' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Diagnostic Overview</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Study Types Distribution */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Study Types</h4>
                <div className="space-y-3">
                  {imagingBreakdown.map((study) => (
                    <div key={study.modality} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                        <span className="text-sm font-medium">{study.modality}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{formatNumber(study.count)}</span>
                        <span className="text-sm text-gray-500">({formatPercentage(study.percentage)})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Summary */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Performance Summary</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Target className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Overall Accuracy</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {formatPercentage(aiPerformance.overallAccuracy)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium">Processing Speed</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">
                      {aiPerformance.processingSpeed}s
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium">Quality Score</span>
                    </div>
                    <span className={`text-lg font-bold ${getScoreColor(metrics.qualityScore)}`}>
                      {formatPercentage(metrics.qualityScore)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'imaging' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Imaging Analysis</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Modality Performance */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Modality Performance</h4>
                <div className="space-y-3">
                  {imagingBreakdown.map((modality) => (
                    <div key={modality.modality} className={`p-4 rounded-lg border ${getScoreBackground(modality.aiAccuracy)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-gray-800">{modality.modality}</h5>
                        <span className={`text-lg font-bold ${getScoreColor(modality.aiAccuracy)}`}>
                          {formatPercentage(modality.aiAccuracy)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-gray-600">Studies</div>
                          <div className="font-medium">{formatNumber(modality.count)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Avg Time</div>
                          <div className="font-medium">{modality.avgProcessingTime}s</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Critical</div>
                          <div className="font-medium text-red-600">{modality.criticalFindings}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processing Timeline */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Processing Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Image Acquisition</span>
                    </div>
                    <span className="text-sm text-blue-600">0.5s avg</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-600 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">AI Analysis</span>
                    </div>
                    <span className="text-sm text-purple-600">1.2s avg</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Report Generation</span>
                    </div>
                    <span className="text-sm text-green-600">0.8s avg</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Quality Check</span>
                    </div>
                    <span className="text-sm text-yellow-600">0.3s avg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'ai-performance' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">AI Performance Analysis</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Core Metrics</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Sensitivity (True Positive Rate)</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatPercentage(aiPerformance.sensitivityRate)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${aiPerformance.sensitivityRate}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Specificity (True Negative Rate)</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatPercentage(aiPerformance.specificityRate)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${aiPerformance.specificityRate}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                      <span className="text-lg font-bold text-purple-600">
                        {formatPercentage(aiPerformance.confidenceScore)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${aiPerformance.confidenceScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Performance */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Category Performance</h4>
                <div className="space-y-3">
                  {aiPerformance.categories.map((category) => (
                    <div key={category.category} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{category.category}</span>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(category.improvement)}
                          <span className={`text-sm font-medium ${getScoreColor(category.accuracy)}`}>
                            {formatPercentage(category.accuracy)}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-600">Volume</div>
                          <div className="font-medium">{formatNumber(category.volume)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Improvement</div>
                          <div className="font-medium text-green-600">+{formatPercentage(category.improvement)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'quality' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Quality Metrics</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quality Scores */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Quality Assessment</h4>
                <div className="space-y-3">
                  {Object.entries(qualityMetrics).map(([metric, score]) => (
                    <div key={metric} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {metric.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              score >= 95 ? 'bg-green-600' :
                              score >= 85 ? 'bg-yellow-600' :
                              score >= 70 ? 'bg-orange-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                          {formatPercentage(score)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality Trends */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Quality Trends</h4>
                <div className="space-y-3">
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">Excellent Performance</span>
                      </div>
                      <span className="text-sm text-green-600">↑ 2.3%</span>
                    </div>
                    <p className="text-xs text-green-700">
                      Quality scores have improved consistently over the past month
                    </p>
                  </div>
                  
                  <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                        <span className="text-sm font-medium text-yellow-800">Monitor Required</span>
                      </div>
                      <span className="text-sm text-yellow-600">↓ 0.5%</span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      Turnaround time slightly increased due to higher volume
                    </p>
                  </div>
                  
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Activity className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">Optimization Active</span>
                      </div>
                      <span className="text-sm text-blue-600">↑ 1.8%</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      Continuous learning algorithms improving detection accuracy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticAnalytics; 