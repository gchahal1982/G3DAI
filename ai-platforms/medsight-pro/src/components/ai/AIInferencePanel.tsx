'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CpuChipIcon,
  BeakerIcon,
  ChartBarIcon,
  LightBulbIcon,
  EyeIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  AdjustmentsHorizontalIcon,
  DocumentChartBarIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  BookmarkIcon,
  PrinterIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ChatBubbleLeftEllipsisIcon,
  BoltIcon,
  ShieldCheckIcon,
  StarIcon,
  TrophyIcon,
  AcademicCapIcon,
  HeartIcon,
  ScaleIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  FolderOpenIcon,
  TagIcon,
  CalendarIcon,
  ClockIcon as TimeIcon,
  UserIcon,
  GlobeAltIcon,
  FingerPrintIcon,
  LockClosedIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  CpuChipIcon as CpuChipIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  StarIcon as StarIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
} from '@heroicons/react/24/solid';

// Types for AI analysis data
interface AIFinding {
  id: string;
  type: 'normal' | 'abnormal' | 'critical' | 'pending';
  description: string;
  confidence: number;
  location?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  recommendation?: string;
  followUp?: string;
  timestamp: string;
}

interface AIModel {
  id: string;
  name: string;
  version: string;
  accuracy: number;
  specialty: string;
  status: 'active' | 'inactive' | 'processing';
  processingTime: number;
}

interface AIAnalysis {
  id: string;
  patientId: string;
  studyType: string;
  modality: string;
  bodyPart: string;
  aiModel: AIModel;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'review';
  overallConfidence: number;
  findings: AIFinding[];
  processingTime: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reviewRequired: boolean;
  radiologistNotes?: string;
}

// Mock data for AI analysis
const mockAIModels: AIModel[] = [
  {
    id: 'resnet-50',
    name: 'ResNet-50 Lung Detection',
    version: 'v2.1.0',
    accuracy: 97.8,
    specialty: 'Chest Imaging',
    status: 'active',
    processingTime: 2.3
  },
  {
    id: 'unet-brain',
    name: 'U-Net Brain Segmentation',
    version: 'v1.9.2',
    accuracy: 96.4,
    specialty: 'Neuroimaging',
    status: 'active',
    processingTime: 3.1
  },
  {
    id: 'yolo-detection',
    name: 'YOLO-v8 Pathology Detection',
    version: 'v3.0.1',
    accuracy: 94.7,
    specialty: 'General Pathology',
    status: 'processing',
    processingTime: 1.8
  }
];

const mockAnalyses: AIAnalysis[] = [
  {
    id: 'analysis-001',
    patientId: 'P-2024-001',
    studyType: 'Chest CT',
    modality: 'CT',
    bodyPart: 'Chest',
    aiModel: mockAIModels[0],
    status: 'completed',
    overallConfidence: 95.6,
    findings: [
      {
        id: 'finding-001',
        type: 'normal',
        description: 'Normal lung parenchyma pattern',
        confidence: 97.2,
        location: 'Bilateral lung fields',
        severity: 'low',
        recommendation: 'Routine follow-up',
        timestamp: '2024-01-15 14:30:00'
      },
      {
        id: 'finding-002',
        type: 'abnormal',
        description: 'Small pulmonary nodule detected',
        confidence: 89.4,
        location: 'Right upper lobe',
        severity: 'medium',
        recommendation: 'Follow-up CT in 3-6 months',
        followUp: 'Compare with prior imaging if available',
        timestamp: '2024-01-15 14:30:15'
      },
      {
        id: 'finding-003',
        type: 'pending',
        description: 'Requires radiologist review for final assessment',
        confidence: 85.1,
        location: 'Right upper lobe nodule',
        severity: 'medium',
        recommendation: 'Radiologist interpretation needed',
        timestamp: '2024-01-15 14:30:30'
      }
    ],
    processingTime: '2.3s',
    timestamp: '2024-01-15 14:30:00',
    priority: 'high',
    reviewRequired: true
  },
  {
    id: 'analysis-002',
    patientId: 'P-2024-002',
    studyType: 'Brain MRI',
    modality: 'MRI',
    bodyPart: 'Brain',
    aiModel: mockAIModels[1],
    status: 'processing',
    overallConfidence: 0,
    findings: [],
    processingTime: '0.0s',
    timestamp: '2024-01-15 14:28:00',
    priority: 'medium',
    reviewRequired: false
  }
];

interface AIInferencePanelProps {
  className?: string;
  onAnalysisSelect?: (analysis: AIAnalysis) => void;
  onFindingSelect?: (finding: AIFinding) => void;
  selectedAnalysisId?: string | null;
}

export default function AIInferencePanel({ 
  className = '', 
  onAnalysisSelect,
  onFindingSelect,
  selectedAnalysisId 
}: AIInferencePanelProps) {
  const [analyses, setAnalyses] = useState<AIAnalysis[]>(mockAnalyses);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysis | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'confidence' | 'priority'>('timestamp');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);

  // Update selected analysis when prop changes
  useEffect(() => {
    if (selectedAnalysisId) {
      const analysis = analyses.find(a => a.id === selectedAnalysisId);
      setSelectedAnalysis(analysis || null);
    }
  }, [selectedAnalysisId, analyses]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-medsight-ai-high';
    if (confidence >= 70) return 'text-medsight-ai-medium';
    return 'text-medsight-ai-low';
  };

  const getConfidenceBgColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-medsight-ai-high/20 border-medsight-ai-high/30';
    if (confidence >= 70) return 'bg-medsight-ai-medium/20 border-medsight-ai-medium/30';
    return 'bg-medsight-ai-low/20 border-medsight-ai-low/30';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-medsight-normal';
      case 'processing': return 'text-medsight-pending';
      case 'error': return 'text-medsight-abnormal';
      case 'review': return 'text-medsight-critical';
      default: return 'text-gray-500';
    }
  };

  const getFindingTypeColor = (type: string) => {
    switch (type) {
      case 'normal': return 'text-medsight-normal';
      case 'abnormal': return 'text-medsight-abnormal';
      case 'critical': return 'text-medsight-critical';
      case 'pending': return 'text-medsight-pending';
      default: return 'text-gray-500';
    }
  };

  const getFindingTypeBg = (type: string) => {
    switch (type) {
      case 'normal': return 'bg-medsight-normal/10 border-medsight-normal/30';
      case 'abnormal': return 'bg-medsight-abnormal/10 border-medsight-abnormal/30';
      case 'critical': return 'bg-medsight-critical/10 border-medsight-critical/30';
      case 'pending': return 'bg-medsight-pending/10 border-medsight-pending/30';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-medsight-critical';
      case 'high': return 'text-medsight-abnormal';
      case 'medium': return 'text-medsight-pending';
      case 'low': return 'text-medsight-normal';
      default: return 'text-gray-500';
    }
  };

  const handleAnalysisClick = (analysis: AIAnalysis) => {
    setSelectedAnalysis(analysis);
    onAnalysisSelect?.(analysis);
  };

  const handleFindingClick = (finding: AIFinding) => {
    onFindingSelect?.(finding);
  };

  const filteredAnalyses = analyses.filter(analysis => {
    if (filterStatus !== 'all' && analysis.status !== filterStatus) return false;
    if (filterPriority !== 'all' && analysis.priority !== filterPriority) return false;
    if (analysis.overallConfidence < confidenceThreshold && analysis.status === 'completed') return false;
    return true;
  });

  const sortedAnalyses = [...filteredAnalyses].sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return b.overallConfidence - a.overallConfidence;
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  return (
    <div className={`medsight-ai-glass p-6 rounded-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-medsight-primary flex items-center">
          <CpuChipIcon className="w-6 h-6 mr-2" />
          AI Inference Engine
        </h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 medsight-glass px-3 py-2 rounded-lg">
            <CpuChipIconSolid className={`w-5 h-5 ${isProcessing ? 'text-medsight-pending animate-pulse' : 'text-medsight-ai-high'}`} />
            <span className="text-sm font-medium">
              {isProcessing ? 'Processing...' : `${mockAIModels.filter(m => m.status === 'active').length} Models Active`}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="medsight-control-glass p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-medsight text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="review">Review Required</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="input-medsight text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-medsight text-sm"
            >
              <option value="timestamp">Most Recent</option>
              <option value="confidence">Confidence</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          {/* Confidence Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Confidence: {confidenceThreshold}%
            </label>
            <input
              type="range"
              min="50"
              max="100"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Analysis List */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <BeakerIcon className="w-5 h-5 mr-2" />
            AI Analyses ({sortedAnalyses.length})
          </h3>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-sm">
              <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
              Export
            </button>
            <button className="btn-medsight text-sm">
              <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
              Report
            </button>
          </div>
        </div>

        {sortedAnalyses.map((analysis) => (
          <div
            key={analysis.id}
            className={`medsight-glass p-4 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedAnalysis?.id === analysis.id ? 'ring-2 ring-medsight-ai-high' : ''
            }`}
            onClick={() => handleAnalysisClick(analysis)}
          >
            {/* Analysis Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-800">{analysis.studyType}</span>
                <span className="text-sm text-gray-600">Patient: {analysis.patientId}</span>
                <span className={`text-xs px-2 py-1 rounded-full border ${getFindingTypeBg(analysis.status === 'completed' && analysis.reviewRequired ? 'pending' : 'normal')}`}>
                  {analysis.modality}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium ${getStatusColor(analysis.status)}`}>
                  {analysis.status}
                </span>
                <span className={`text-sm font-medium ${getPriorityColor(analysis.priority)}`}>
                  {analysis.priority}
                </span>
                {analysis.reviewRequired && (
                  <ExclamationTriangleIconSolid className="w-4 h-4 text-medsight-critical" />
                )}
              </div>
            </div>

            {/* Analysis Details */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Model: {analysis.aiModel.name}</span>
                <span className="text-sm text-gray-600">Version: {analysis.aiModel.version}</span>
              </div>
              <div className="flex items-center space-x-3">
                {analysis.status === 'completed' && (
                  <span className={`text-sm font-semibold ${getConfidenceColor(analysis.overallConfidence)}`}>
                    {analysis.overallConfidence}% confidence
                  </span>
                )}
                <span className="text-sm text-gray-500">{analysis.processingTime}</span>
                <span className="text-sm text-gray-500">
                  {new Date(analysis.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Findings Summary */}
            {analysis.findings.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Findings ({analysis.findings.length}):
                </div>
                {analysis.findings.slice(0, 3).map((finding) => (
                  <div
                    key={finding.id}
                    className={`text-sm p-2 rounded border ${getFindingTypeBg(finding.type)} cursor-pointer hover:opacity-80`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFindingClick(finding);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${getFindingTypeColor(finding.type)}`}>
                        {finding.description}
                      </span>
                      <span className={`text-xs font-semibold ${getConfidenceColor(finding.confidence)}`}>
                        {finding.confidence}%
                      </span>
                    </div>
                    {finding.location && (
                      <div className="text-xs text-gray-600 mt-1">
                        Location: {finding.location}
                      </div>
                    )}
                    {finding.recommendation && (
                      <div className="text-xs text-gray-700 mt-1 font-medium">
                        → {finding.recommendation}
                      </div>
                    )}
                  </div>
                ))}
                {analysis.findings.length > 3 && (
                  <div className="text-xs text-gray-500 pl-2">
                    +{analysis.findings.length - 3} more findings...
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Analysis Details */}
      {selectedAnalysis && (
        <div className="medsight-viewer-glass p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Detailed Analysis: {selectedAnalysis.studyType}
            </h3>
            <button
              onClick={() => setSelectedAnalysis(null)}
              className="text-white/70 hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Model Information */}
          <div className="medsight-ai-glass p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-800 mb-2">AI Model Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Model:</span>
                <span className="ml-2 font-medium">{selectedAnalysis.aiModel.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Version:</span>
                <span className="ml-2 font-medium">{selectedAnalysis.aiModel.version}</span>
              </div>
              <div>
                <span className="text-gray-600">Accuracy:</span>
                <span className="ml-2 font-medium text-medsight-ai-high">{selectedAnalysis.aiModel.accuracy}%</span>
              </div>
              <div>
                <span className="text-gray-600">Specialty:</span>
                <span className="ml-2 font-medium">{selectedAnalysis.aiModel.specialty}</span>
              </div>
            </div>
          </div>

          {/* Detailed Findings */}
          <div className="space-y-3">
            <h4 className="font-medium text-white">Detailed Findings</h4>
            {selectedAnalysis.findings.map((finding) => (
              <div key={finding.id} className={`p-4 rounded-lg border ${getFindingTypeBg(finding.type)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${getFindingTypeColor(finding.type)}`}>
                    {finding.type.toUpperCase()}: {finding.description}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${getConfidenceColor(finding.confidence)}`}>
                      {finding.confidence}% confidence
                    </span>
                    {finding.severity && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        finding.severity === 'critical' ? 'bg-medsight-critical/20 text-medsight-critical' :
                        finding.severity === 'high' ? 'bg-medsight-abnormal/20 text-medsight-abnormal' :
                        finding.severity === 'medium' ? 'bg-medsight-pending/20 text-medsight-pending' :
                        'bg-medsight-normal/20 text-medsight-normal'
                      }`}>
                        {finding.severity}
                      </span>
                    )}
                  </div>
                </div>
                
                {finding.location && (
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Location:</strong> {finding.location}
                  </div>
                )}
                
                {finding.recommendation && (
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Recommendation:</strong> {finding.recommendation}
                  </div>
                )}
                
                {finding.followUp && (
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Follow-up:</strong> {finding.followUp}
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  Detected: {new Date(finding.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Performance Summary */}
      <div className="medsight-control-glass p-4 rounded-lg mt-6">
        <h4 className="font-medium text-gray-800 mb-3">AI Performance Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-ai-high">
              {analyses.filter(a => a.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-pending">
              {analyses.filter(a => a.status === 'processing').length}
            </div>
            <div className="text-sm text-gray-600">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-ai-medium">
              {analyses.filter(a => a.status === 'completed').reduce((acc, a) => acc + a.overallConfidence, 0) / analyses.filter(a => a.status === 'completed').length || 0}%
            </div>
            <div className="text-sm text-gray-600">Avg Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-critical">
              {analyses.filter(a => a.reviewRequired).length}
            </div>
            <div className="text-sm text-gray-600">Review Required</div>
          </div>
        </div>
      </div>
    </div>
  );
} 