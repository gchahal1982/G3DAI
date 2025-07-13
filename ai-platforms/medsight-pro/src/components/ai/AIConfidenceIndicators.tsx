'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  StarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  BeakerIcon,
  CpuChipIcon,
  ScaleIcon,
  EyeIcon,
  LightBulbIcon,
  BoltIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  DocumentChartBarIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TagIcon,
  UserIcon,
  UsersIcon,
  GlobeAltIcon,
  FingerPrintIcon,
  ClockIcon,
  CalendarIcon,
  HeartIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  MicrophoneIcon,
  PhoneIcon,
  VideoCameraIcon,
  ChatBubbleLeftEllipsisIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  Cog6ToothIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  PresentationChartLineIcon,
  PresentationChartBarIcon,
  CameraIcon,
  PhotoIcon,
  CubeIcon,
  Square3Stack3DIcon,
  CircleStackIcon,
  RectangleStackIcon,
  Bars3Icon,
  Bars4Icon,
  ChartPieIcon,
  CalculatorIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  FolderOpenIcon,
  ArchiveBoxIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
  CpuChipIcon as CpuChipIconSolid,
} from '@heroicons/react/24/solid';

// Types for confidence indicators
interface ConfidenceLevel {
  id: string;
  name: string;
  value: number;
  range: {
    min: number;
    max: number;
  };
  color: string;
  description: string;
  interpretation: string;
  recommendations: string[];
}

interface ConfidenceMetric {
  id: string;
  modelId: string;
  modelName: string;
  predictionType: string;
  overallConfidence: number;
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  accuracyMetrics: {
    sensitivity: number;
    specificity: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
  };
  reliabilityScore: number;
  uncertainty: number;
  calibration: number;
  timestamp: string;
}

interface ConfidenceVisualization {
  id: string;
  type: 'gauge' | 'bar' | 'distribution' | 'trend' | 'calibration';
  data: any[];
  threshold: number;
  alertLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

interface QualityAssessment {
  id: string;
  category: 'data_quality' | 'model_performance' | 'clinical_validation' | 'user_feedback';
  score: number;
  factors: {
    name: string;
    value: number;
    weight: number;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
  recommendations: string[];
  lastUpdated: string;
}

// Mock data for confidence levels
const confidenceLevels: ConfidenceLevel[] = [
  {
    id: 'very-high',
    name: 'Very High Confidence',
    value: 95,
    range: { min: 95, max: 100 },
    color: 'medsight-ai-high',
    description: 'Excellent model performance with clinical validation',
    interpretation: 'High reliability for clinical decision support',
    recommendations: ['Use for primary decision support', 'Minimal manual review required', 'Suitable for automated workflows']
  },
  {
    id: 'high',
    name: 'High Confidence',
    value: 85,
    range: { min: 85, max: 94 },
    color: 'medsight-ai-medium',
    description: 'Good model performance with consistent accuracy',
    interpretation: 'Reliable for most clinical applications',
    recommendations: ['Use with standard review process', 'Monitor for edge cases', 'Regular validation recommended']
  },
  {
    id: 'medium',
    name: 'Medium Confidence',
    value: 70,
    range: { min: 70, max: 84 },
    color: 'medsight-pending',
    description: 'Moderate performance requiring careful interpretation',
    interpretation: 'Use with increased clinical oversight',
    recommendations: ['Require expert review', 'Consider additional testing', 'Use as screening tool only']
  },
  {
    id: 'low',
    name: 'Low Confidence',
    value: 50,
    range: { min: 50, max: 69 },
    color: 'medsight-abnormal',
    description: 'Limited reliability requiring significant oversight',
    interpretation: 'High uncertainty in predictions',
    recommendations: ['Manual verification required', 'Consider alternative models', 'Use only with expert interpretation']
  },
  {
    id: 'very-low',
    name: 'Very Low Confidence',
    value: 30,
    range: { min: 0, max: 49 },
    color: 'medsight-critical',
    description: 'Poor performance not suitable for clinical use',
    interpretation: 'Results not clinically reliable',
    recommendations: ['Do not use for decisions', 'Model retraining required', 'Manual analysis only']
  }
];

const mockMetrics: ConfidenceMetric[] = [
  {
    id: 'metric-001',
    modelId: 'resnet-lung',
    modelName: 'ResNet-50 Lung Detection',
    predictionType: 'Pathology Detection',
    overallConfidence: 94.2,
    confidenceDistribution: {
      high: 78,
      medium: 18,
      low: 4
    },
    accuracyMetrics: {
      sensitivity: 94.8,
      specificity: 96.2,
      precision: 91.7,
      recall: 94.8,
      f1Score: 93.2,
      auc: 97.1
    },
    reliabilityScore: 92.5,
    uncertainty: 5.8,
    calibration: 91.3,
    timestamp: '2024-01-15 14:30:00'
  },
  {
    id: 'metric-002',
    modelId: 'unet-brain',
    modelName: 'U-Net Brain Segmentation',
    predictionType: 'Organ Segmentation',
    overallConfidence: 87.6,
    confidenceDistribution: {
      high: 65,
      medium: 28,
      low: 7
    },
    accuracyMetrics: {
      sensitivity: 89.3,
      specificity: 92.1,
      precision: 88.4,
      recall: 89.3,
      f1Score: 88.8,
      auc: 93.7
    },
    reliabilityScore: 86.2,
    uncertainty: 12.4,
    calibration: 84.9,
    timestamp: '2024-01-15 14:25:00'
  }
];

const mockQualityAssessments: QualityAssessment[] = [
  {
    id: 'qa-001',
    category: 'model_performance',
    score: 92.3,
    factors: [
      { name: 'Cross-validation accuracy', value: 94.5, weight: 0.3, impact: 'positive' },
      { name: 'External validation', value: 89.7, weight: 0.25, impact: 'positive' },
      { name: 'Calibration quality', value: 91.2, weight: 0.2, impact: 'positive' },
      { name: 'Uncertainty estimation', value: 87.8, weight: 0.15, impact: 'positive' },
      { name: 'Robustness testing', value: 88.3, weight: 0.1, impact: 'positive' }
    ],
    recommendations: [
      'Continue current model performance monitoring',
      'Implement regular recalibration schedule',
      'Expand uncertainty quantification methods'
    ],
    lastUpdated: '2024-01-15 14:30:00'
  },
  {
    id: 'qa-002',
    category: 'clinical_validation',
    score: 88.7,
    factors: [
      { name: 'Clinical accuracy', value: 91.2, weight: 0.4, impact: 'positive' },
      { name: 'Expert agreement', value: 87.5, weight: 0.3, impact: 'positive' },
      { name: 'Real-world performance', value: 85.9, weight: 0.2, impact: 'positive' },
      { name: 'User acceptance', value: 89.1, weight: 0.1, impact: 'positive' }
    ],
    recommendations: [
      'Increase clinical validation cohort size',
      'Enhance expert reviewer training',
      'Implement user feedback collection system'
    ],
    lastUpdated: '2024-01-15 14:25:00'
  }
];

interface AIConfidenceIndicatorsProps {
  className?: string;
  metrics?: ConfidenceMetric[];
  showDetailed?: boolean;
  onMetricSelect?: (metric: ConfidenceMetric) => void;
  onThresholdChange?: (threshold: number) => void;
}

export default function AIConfidenceIndicators({ 
  className = '', 
  metrics = mockMetrics,
  showDetailed = true,
  onMetricSelect,
  onThresholdChange 
}: AIConfidenceIndicatorsProps) {
  const [selectedMetric, setSelectedMetric] = useState<ConfidenceMetric | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'quality' | 'calibration'>('overview');
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [qualityAssessments, setQualityAssessments] = useState<QualityAssessment[]>(mockQualityAssessments);

  const getConfidenceLevel = (confidence: number): ConfidenceLevel => {
    return confidenceLevels.find(level => 
      confidence >= level.range.min && confidence <= level.range.max
    ) || confidenceLevels[confidenceLevels.length - 1];
  };

  const getConfidenceColor = (confidence: number) => {
    const level = getConfidenceLevel(confidence);
    switch (level.color) {
      case 'medsight-ai-high': return 'text-medsight-ai-high';
      case 'medsight-ai-medium': return 'text-medsight-ai-medium';
      case 'medsight-pending': return 'text-medsight-pending';
      case 'medsight-abnormal': return 'text-medsight-abnormal';
      case 'medsight-critical': return 'text-medsight-critical';
      default: return 'text-gray-500';
    }
  };

  const getConfidenceBg = (confidence: number) => {
    const level = getConfidenceLevel(confidence);
    switch (level.color) {
      case 'medsight-ai-high': return 'bg-medsight-ai-high/20 border-medsight-ai-high/30';
      case 'medsight-ai-medium': return 'bg-medsight-ai-medium/20 border-medsight-ai-medium/30';
      case 'medsight-pending': return 'bg-medsight-pending/20 border-medsight-pending/30';
      case 'medsight-abnormal': return 'bg-medsight-abnormal/20 border-medsight-abnormal/30';
      case 'medsight-critical': return 'bg-medsight-critical/20 border-medsight-critical/30';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getAlertIcon = (confidence: number) => {
    if (confidence >= 95) return CheckCircleIconSolid;
    if (confidence >= 85) return ShieldCheckIconSolid;
    if (confidence >= 70) return InformationCircleIconSolid;
    if (confidence >= 50) return ExclamationTriangleIconSolid;
    return ExclamationTriangleIconSolid;
  };

  const getAlertColor = (confidence: number) => {
    if (confidence >= 95) return 'text-medsight-normal';
    if (confidence >= 85) return 'text-medsight-ai-high';
    if (confidence >= 70) return 'text-medsight-pending';
    if (confidence >= 50) return 'text-medsight-abnormal';
    return 'text-medsight-critical';
  };

  const handleMetricClick = (metric: ConfidenceMetric) => {
    setSelectedMetric(metric);
    onMetricSelect?.(metric);
  };

  const handleThresholdChange = (newThreshold: number) => {
    setConfidenceThreshold(newThreshold);
    onThresholdChange?.(newThreshold);
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-medsight-ai-high';
    if (score >= 80) return 'text-medsight-ai-medium';
    if (score >= 70) return 'text-medsight-pending';
    return 'text-medsight-abnormal';
  };

  return (
    <div className={`medsight-ai-glass p-6 rounded-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-medsight-primary flex items-center">
          <StarIcon className="w-6 h-6 mr-2" />
          AI Confidence Indicators
        </h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 medsight-glass px-3 py-2 rounded-lg">
            <ShieldCheckIconSolid className="w-5 h-5 text-medsight-ai-high" />
            <span className="text-sm font-medium">
              {Math.round(metrics.reduce((acc, m) => acc + m.overallConfidence, 0) / metrics.length)}% Avg Confidence
            </span>
          </div>
          
          <button
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            className={`btn-medsight ${alertsEnabled ? 'bg-medsight-ai-high/20 text-medsight-ai-high' : ''}`}
          >
            <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
            Alerts: {alertsEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Confidence Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'overview', label: 'Confidence Overview', icon: StarIcon },
          { id: 'metrics', label: 'Detailed Metrics', icon: ChartBarIcon },
          { id: 'quality', label: 'Quality Assessment', icon: ShieldCheckIcon },
          { id: 'calibration', label: 'Model Calibration', icon: ScaleIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'medsight-ai-glass text-medsight-ai-high border-medsight-ai-high/30'
                : 'medsight-glass text-gray-600 hover:text-medsight-primary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Global Confidence Threshold */}
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confidence Threshold: {confidenceThreshold}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={confidenceThreshold}
                  onChange={(e) => handleThresholdChange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low (50%)</span>
                  <span>Medium (75%)</span>
                  <span>High (100%)</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="input-medsight text-sm"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>

              <div className="flex items-end">
                <button className="btn-medsight text-sm">
                  <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Confidence Level Guide */}
          <div className="medsight-glass p-6 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2" />
              Confidence Level Guide
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {confidenceLevels.map((level) => (
                <div
                  key={level.id}
                  className={`p-4 rounded-lg border ${getConfidenceBg(level.value)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${getConfidenceColor(level.value)}`}>
                      {level.name}
                    </h4>
                    <span className={`text-sm font-bold ${getConfidenceColor(level.value)}`}>
                      {level.range.min}-{level.range.max}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{level.description}</p>
                  <div className="text-xs text-gray-600">
                    <strong>Interpretation:</strong> {level.interpretation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Confidence Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {metrics.map((metric) => {
              const level = getConfidenceLevel(metric.overallConfidence);
              const AlertIconComponent = getAlertIcon(metric.overallConfidence);
              
              return (
                <div
                  key={metric.id}
                  className={`medsight-glass p-6 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedMetric?.id === metric.id ? 'ring-2 ring-medsight-ai-high' : ''
                  }`}
                  onClick={() => handleMetricClick(metric)}
                >
                  {/* Model Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">{metric.modelName}</h3>
                      <p className="text-sm text-gray-600">{metric.predictionType}</p>
                    </div>
                    <AlertIconComponent className={`w-6 h-6 ${getAlertColor(metric.overallConfidence)}`} />
                  </div>

                  {/* Main Confidence Display */}
                  <div className="text-center mb-4">
                    <div className={`text-3xl font-bold mb-1 ${getConfidenceColor(metric.overallConfidence)}`}>
                      {metric.overallConfidence}%
                    </div>
                    <div className={`text-sm font-medium ${getConfidenceColor(metric.overallConfidence)}`}>
                      {level.name}
                    </div>
                  </div>

                  {/* Confidence Distribution */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Confidence Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-medsight-ai-high">High (≥85%):</span>
                        <span className="font-medium">{metric.confidenceDistribution.high}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-medsight-ai-medium">Medium (70-84%):</span>
                        <span className="font-medium">{metric.confidenceDistribution.medium}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-medsight-abnormal">Low (&lt;70%):</span>
                        <span className="font-medium">{metric.confidenceDistribution.low}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Reliability:</span>
                      <div className={`font-semibold ${getConfidenceColor(metric.reliabilityScore)}`}>
                        {metric.reliabilityScore}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Uncertainty:</span>
                      <div className="font-semibold text-gray-800">{metric.uncertainty}%</div>
                    </div>
                    <div>
                      <span className="text-gray-600">AUC Score:</span>
                      <div className={`font-semibold ${getConfidenceColor(metric.accuracyMetrics.auc)}`}>
                        {metric.accuracyMetrics.auc}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Calibration:</span>
                      <div className={`font-semibold ${getConfidenceColor(metric.calibration)}`}>
                        {metric.calibration}%
                      </div>
                    </div>
                  </div>

                  {/* Alert if below threshold */}
                  {metric.overallConfidence < confidenceThreshold && alertsEnabled && (
                    <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="text-sm text-yellow-800">
                          Below confidence threshold ({confidenceThreshold}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'metrics' && selectedMetric && (
        <div className="space-y-6">
          <div className="medsight-viewer-glass p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Detailed Metrics: {selectedMetric.modelName}
              </h3>
              <button
                onClick={() => setSelectedMetric(null)}
                className="text-white/70 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Accuracy Metrics */}
              <div className="medsight-ai-glass p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">Accuracy Metrics</h4>
                <div className="space-y-3">
                  {Object.entries(selectedMetric.accuracyMetrics).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className={`font-semibold ${getConfidenceColor(value)}`}>
                        {value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Summary */}
              <div className="medsight-ai-glass p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">Performance Summary</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overall Confidence:</span>
                    <span className={`font-semibold ${getConfidenceColor(selectedMetric.overallConfidence)}`}>
                      {selectedMetric.overallConfidence}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reliability Score:</span>
                    <span className={`font-semibold ${getConfidenceColor(selectedMetric.reliabilityScore)}`}>
                      {selectedMetric.reliabilityScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Uncertainty Level:</span>
                    <span className="font-semibold text-gray-800">{selectedMetric.uncertainty}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Calibration Quality:</span>
                    <span className={`font-semibold ${getConfidenceColor(selectedMetric.calibration)}`}>
                      {selectedMetric.calibration}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quality' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <ShieldCheckIcon className="w-5 h-5 mr-2" />
            Quality Assessment
          </h3>

          {qualityAssessments.map((assessment) => (
            <div key={assessment.id} className="medsight-glass p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-800 capitalize">
                  {assessment.category.replace(/_/g, ' ')} Assessment
                </h4>
                <div className={`text-2xl font-bold ${getQualityColor(assessment.score)}`}>
                  {assessment.score}%
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quality Factors */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">Contributing Factors</h5>
                  <div className="space-y-2">
                    {assessment.factors.map((factor, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{factor.name}:</span>
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${getConfidenceColor(factor.value)}`}>
                            {factor.value}%
                          </span>
                          <span className="text-xs text-gray-500">
                            (weight: {Math.round(factor.weight * 100)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">Recommendations</h5>
                  <ul className="space-y-2">
                    {assessment.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="text-medsight-ai-high mr-2 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-200">
                Last updated: {new Date(assessment.lastUpdated).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'calibration' && (
        <div className="space-y-6">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <ScaleIcon className="w-5 h-5 mr-2" />
            Model Calibration Analysis
          </h3>

          {/* Calibration Chart Placeholder */}
          <div className="medsight-viewer-glass p-12 rounded-lg">
            <div className="text-center text-white">
              <PresentationChartLineIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Model Calibration Curves</h3>
              <p className="text-sm opacity-75 mb-4">
                Reliability diagrams showing prediction calibration across confidence ranges
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {metrics.map((metric) => (
                  <div key={metric.id} className="bg-white/10 p-4 rounded-lg">
                    <div className="text-lg font-bold mb-1">{metric.calibration}%</div>
                    <div className="text-sm opacity-75">{metric.modelName}</div>
                    <div className="text-xs opacity-60 mt-1">
                      {getConfidenceLevel(metric.calibration).name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 