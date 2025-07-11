'use client';

import React, { useState, useEffect } from 'react';
import { 
  BeakerIcon,
  CpuChipIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  StarIcon,
  BoltIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export interface AIModel {
  id: string;
  name: string;
  version: string;
  type: 'detection' | 'segmentation' | 'classification' | 'prediction';
  specialty: string;
  description: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingData: {
    samples: number;
    lastUpdated: Date;
    institutions: string[];
  };
  approvals: {
    fda: boolean;
    ce: boolean;
    other: string[];
  };
  processingTime: {
    average: number;
    min: number;
    max: number;
  };
}

export interface AIInferenceResult {
  id: string;
  studyId: string;
  imageId: string;
  modelId: string;
  model: AIModel;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reviewing';
  progress: number;
  startTime: Date;
  endTime?: Date;
  processingTime?: number;
  confidence: number;
  overallScore: number;
  findings: {
    id: string;
    type: 'normal' | 'abnormal' | 'suspicious' | 'critical';
    label: string;
    description: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    location?: {
      coordinates: Array<{ x: number; y: number }>;
      slice?: number;
      organ?: string;
    };
    measurements?: {
      size: number;
      volume?: number;
      density?: number;
      unit: string;
    };
    differential: string[];
    references: string[];
  }[];
  recommendations: {
    id: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'followup' | 'referral' | 'treatment' | 'imaging' | 'consultation';
    text: string;
    timeframe?: string;
    specialist?: string;
    evidence: string[];
  }[];
  qualityMetrics: {
    imageQuality: number;
    artifactLevel: number;
    signalToNoise: number;
    diagnosticQuality: 'excellent' | 'good' | 'adequate' | 'poor';
  };
  comparison?: {
    priorStudyId?: string;
    changeType?: 'improved' | 'stable' | 'worsened' | 'new';
    changeDescription?: string;
    changeConfidence?: number;
  };
  reviewStatus: {
    reviewed: boolean;
    reviewedBy?: string;
    reviewedAt?: Date;
    approved: boolean;
    comments?: string;
    modifications?: string[];
  };
}

export interface AIInferencePanelProps {
  result?: AIInferenceResult;
  isProcessing?: boolean;
  onStartAnalysis?: (modelId: string) => void;
  onStopAnalysis?: () => void;
  onApproveResult?: (resultId: string) => void;
  onRejectResult?: (resultId: string, reason: string) => void;
  onExportResult?: (resultId: string, format: 'pdf' | 'json' | 'dicom') => void;
  onShareResult?: (resultId: string, recipients: string[]) => void;
  onModelChange?: (modelId: string) => void;
  availableModels?: AIModel[];
  showTechnicalDetails?: boolean;
  readOnly?: boolean;
}

export function AIInferencePanel({
  result,
  isProcessing = false,
  onStartAnalysis,
  onStopAnalysis,
  onApproveResult,
  onRejectResult,
  onExportResult,
  onShareResult,
  onModelChange,
  availableModels = [],
  showTechnicalDetails = false,
  readOnly = false
}: AIInferencePanelProps) {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['findings']));
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'severity' | 'location'>('confidence');

  useEffect(() => {
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0].id);
    }
  }, [availableModels]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-medsight-ai-high';
    if (confidence >= 0.7) return 'text-medsight-ai-medium';
    return 'text-medsight-ai-low';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-medsight-ai-high';
    if (confidence >= 0.7) return 'bg-medsight-ai-medium';
    return 'bg-medsight-ai-low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-medsight-critical';
      case 'high': return 'text-medsight-pending';
      case 'medium': return 'text-medsight-secondary';
      case 'low': return 'text-medsight-normal';
      default: return 'text-medsight-primary';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-medsight-critical';
      case 'high': return 'bg-medsight-pending';
      case 'medium': return 'bg-medsight-secondary';
      case 'low': return 'bg-medsight-normal';
      default: return 'bg-medsight-primary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-medsight-normal';
      case 'processing': return 'text-medsight-ai-high';
      case 'pending': return 'text-medsight-pending';
      case 'failed': return 'text-medsight-critical';
      case 'reviewing': return 'text-medsight-secondary';
      default: return 'text-medsight-primary';
    }
  };

  const filteredFindings = result?.findings.filter(finding => 
    filterSeverity === 'all' || finding.severity === filterSeverity
  ).sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return b.confidence - a.confidence;
      case 'severity':
        const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      default:
        return a.label.localeCompare(b.label);
    }
  });

  const criticalFindings = result?.findings.filter(f => f.severity === 'critical').length || 0;
  const highFindings = result?.findings.filter(f => f.severity === 'high').length || 0;

  const handleStartAnalysis = () => {
    if (selectedModel && onStartAnalysis) {
      onStartAnalysis(selectedModel);
    }
  };

  const handleApprove = () => {
    if (result && onApproveResult) {
      onApproveResult(result.id);
    }
  };

  const handleReject = () => {
    if (result && onRejectResult) {
      onRejectResult(result.id, reviewComment);
      setShowReviewDialog(false);
      setReviewComment('');
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Analysis Header */}
      <div className="medsight-ai-glass p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="medsight-control-glass p-2 rounded-lg">
              <BeakerIcon className="w-5 h-5 text-medsight-ai-high" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-medsight-ai-high">
                AI Analysis Results
              </h3>
              <div className="text-xs text-medsight-ai-high/70">
                {result ? `Model: ${result.model.name} v${result.model.version}` : 'No analysis available'}
              </div>
            </div>
          </div>
          
          {result && (
            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                {result.status.toUpperCase()}
              </div>
              {result.confidence && (
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(result.confidence)}`}>
                  {(result.confidence * 100).toFixed(1)}% Confidence
                </div>
              )}
            </div>
          )}
        </div>

        {/* Model Selection & Controls */}
        {!result && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  onModelChange?.(e.target.value);
                }}
                className="input-medsight"
                disabled={isProcessing}
              >
                <option value="">Select AI Model</option>
                {availableModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.specialty}
                  </option>
                ))}
              </select>
              
              <div className="flex space-x-2">
                {!isProcessing ? (
                  <button
                    onClick={handleStartAnalysis}
                    disabled={!selectedModel || readOnly}
                    className="btn-medsight flex-1 disabled:opacity-50"
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Start Analysis
                  </button>
                ) : (
                  <button
                    onClick={onStopAnalysis}
                    className="btn-medsight flex-1 bg-medsight-critical/10 border-medsight-critical/20 text-medsight-critical"
                  >
                    <PauseIcon className="w-4 h-4 mr-2" />
                    Stop Analysis
                  </button>
                )}
              </div>
            </div>

            {selectedModel && availableModels.find(m => m.id === selectedModel) && (
              <div className="medsight-control-glass p-3 rounded-lg">
                {(() => {
                  const model = availableModels.find(m => m.id === selectedModel)!;
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-medsight-ai-high">{model.name}</span>
                        <div className="flex space-x-2">
                          {model.approvals.fda && (
                            <span className="px-2 py-1 bg-medsight-normal/10 text-medsight-normal text-xs rounded">FDA</span>
                          )}
                          {model.approvals.ce && (
                            <span className="px-2 py-1 bg-medsight-normal/10 text-medsight-normal text-xs rounded">CE</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-medsight-ai-high/70">{model.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-medsight-ai-high/70">Accuracy:</span>
                          <span className="ml-2 font-medium text-medsight-ai-high">{(model.accuracy * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-medsight-ai-high/70">Avg Processing:</span>
                          <span className="ml-2 font-medium text-medsight-ai-high">{model.processingTime.average}s</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-medsight-ai-high border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-medsight-ai-high">AI Analysis in Progress...</span>
            </div>
            <div className="w-full bg-medsight-ai-high/20 rounded-full h-2">
              <div 
                className="bg-medsight-ai-high h-2 rounded-full transition-all duration-500"
                style={{ width: `${result?.progress || 0}%` }}
              ></div>
            </div>
            <div className="text-xs text-medsight-ai-high/70">
              {result?.progress ? `${result.progress.toFixed(1)}% complete` : 'Initializing...'}
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {result && result.status === 'completed' && (
        <>
          {/* Critical Alerts */}
          {(criticalFindings > 0 || highFindings > 0) && (
            <div className="medsight-glass p-4 rounded-xl border-medsight-critical/20">
              <div className="flex items-center space-x-2 mb-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-medsight-critical" />
                <h4 className="text-sm font-semibold text-medsight-critical">Critical Findings Alert</h4>
              </div>
              <div className="space-y-2">
                {criticalFindings > 0 && (
                  <div className="p-2 bg-medsight-critical/10 rounded-lg">
                    <span className="text-sm text-medsight-critical font-medium">
                      {criticalFindings} Critical Finding{criticalFindings > 1 ? 's' : ''} Detected
                    </span>
                  </div>
                )}
                {highFindings > 0 && (
                  <div className="p-2 bg-medsight-pending/10 rounded-lg">
                    <span className="text-sm text-medsight-pending font-medium">
                      {highFindings} High Priority Finding{highFindings > 1 ? 's' : ''} Detected
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="medsight-control-glass p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="w-4 h-4 text-medsight-ai-high" />
                <div>
                  <div className="text-lg font-bold text-medsight-ai-high">
                    {(result.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-medsight-ai-high/70">Overall Confidence</div>
                </div>
              </div>
            </div>
            
            <div className="medsight-control-glass p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-medsight-primary" />
                <div>
                  <div className="text-lg font-bold text-medsight-primary">
                    {result.processingTime ? `${result.processingTime.toFixed(1)}s` : 'N/A'}
                  </div>
                  <div className="text-xs text-medsight-primary/70">Processing Time</div>
                </div>
              </div>
            </div>
            
            <div className="medsight-control-glass p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="w-4 h-4 text-medsight-secondary" />
                <div>
                  <div className="text-lg font-bold text-medsight-secondary">
                    {result.findings.length}
                  </div>
                  <div className="text-xs text-medsight-secondary/70">Findings</div>
                </div>
              </div>
            </div>
          </div>

          {/* Findings Section */}
          <div className="medsight-glass p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => toggleSection('findings')}
                className="flex items-center space-x-2 text-medsight-primary hover:text-medsight-primary/80"
              >
                <DocumentTextIcon className="w-5 h-5" />
                <h4 className="text-sm font-semibold">AI Findings ({result.findings.length})</h4>
                <span className="text-xs">
                  {expandedSections.has('findings') ? '▼' : '▶'}
                </span>
              </button>
              
              {expandedSections.has('findings') && (
                <div className="flex items-center space-x-2">
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="text-xs border border-medsight-primary/20 rounded px-2 py-1 bg-medsight-glass"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs border border-medsight-primary/20 rounded px-2 py-1 bg-medsight-glass"
                  >
                    <option value="confidence">Sort by Confidence</option>
                    <option value="severity">Sort by Severity</option>
                    <option value="location">Sort by Location</option>
                  </select>
                </div>
              )}
            </div>

            {expandedSections.has('findings') && (
              <div className="space-y-3">
                {filteredFindings?.map((finding) => (
                  <div key={finding.id} className="medsight-control-glass p-3 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="text-sm font-medium text-medsight-primary">{finding.label}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                            {finding.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-medsight-primary/70 mb-2">{finding.description}</p>
                        
                        {finding.measurements && (
                          <div className="text-xs text-medsight-secondary mb-2">
                            Size: {finding.measurements.size}{finding.measurements.unit}
                            {finding.measurements.volume && ` • Volume: ${finding.measurements.volume}${finding.measurements.unit}³`}
                            {finding.measurements.density && ` • Density: ${finding.measurements.density} HU`}
                          </div>
                        )}
                        
                        {finding.location && (
                          <div className="text-xs text-medsight-primary/60">
                            Location: {finding.location.organ || 'Specified coordinates'}
                            {finding.location.slice && ` • Slice: ${finding.location.slice}`}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-sm font-bold ${getConfidenceColor(finding.confidence)}`}>
                          {(finding.confidence * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-medsight-primary/60">Confidence</div>
                      </div>
                    </div>
                    
                    {finding.differential.length > 0 && (
                      <div className="mt-2 p-2 bg-medsight-primary/5 rounded">
                        <div className="text-xs font-medium text-medsight-primary mb-1">Differential Diagnosis:</div>
                        <div className="text-xs text-medsight-primary/70">
                          {finding.differential.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations Section */}
          {result.recommendations.length > 0 && (
            <div className="medsight-glass p-4 rounded-xl">
              <button
                onClick={() => toggleSection('recommendations')}
                className="flex items-center space-x-2 text-medsight-primary hover:text-medsight-primary/80 mb-4"
              >
                <InformationCircleIcon className="w-5 h-5" />
                <h4 className="text-sm font-semibold">Recommendations ({result.recommendations.length})</h4>
                <span className="text-xs">
                  {expandedSections.has('recommendations') ? '▼' : '▶'}
                </span>
              </button>

              {expandedSections.has('recommendations') && (
                <div className="space-y-3">
                  {result.recommendations.map((rec) => (
                    <div key={rec.id} className="medsight-control-glass p-3 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityBg(rec.priority)}`}></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-medsight-primary">{rec.category.toUpperCase()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(rec.priority)}`}>
                              {rec.priority}
                            </span>
                          </div>
                          <p className="text-xs text-medsight-primary/70 mb-1">{rec.text}</p>
                          {rec.timeframe && (
                            <p className="text-xs text-medsight-secondary">Timeframe: {rec.timeframe}</p>
                          )}
                          {rec.specialist && (
                            <p className="text-xs text-medsight-secondary">Specialist: {rec.specialist}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quality Metrics */}
          {showTechnicalDetails && (
            <div className="medsight-glass p-4 rounded-xl">
              <button
                onClick={() => toggleSection('quality')}
                className="flex items-center space-x-2 text-medsight-primary hover:text-medsight-primary/80 mb-4"
              >
                <ChartBarIcon className="w-5 h-5" />
                <h4 className="text-sm font-semibold">Quality Metrics</h4>
                <span className="text-xs">
                  {expandedSections.has('quality') ? '▼' : '▶'}
                </span>
              </button>

              {expandedSections.has('quality') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-medsight-primary">Image Quality</span>
                      <span className="text-xs font-medium text-medsight-primary">
                        {(result.qualityMetrics.imageQuality * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-medsight-primary/20 rounded-full h-1">
                      <div 
                        className="bg-medsight-primary h-1 rounded-full"
                        style={{ width: `${result.qualityMetrics.imageQuality * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-medsight-primary">Signal to Noise</span>
                      <span className="text-xs font-medium text-medsight-primary">
                        {result.qualityMetrics.signalToNoise.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full bg-medsight-primary/20 rounded-full h-1">
                      <div 
                        className="bg-medsight-primary h-1 rounded-full"
                        style={{ width: `${Math.min(100, (result.qualityMetrics.signalToNoise / 50) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Review & Actions */}
          {!readOnly && (
            <div className="medsight-glass p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="text-medsight-primary">Review Status:</span>
                    <span className={`ml-2 font-medium ${result.reviewStatus.reviewed ? 'text-medsight-normal' : 'text-medsight-pending'}`}>
                      {result.reviewStatus.reviewed ? 'Reviewed' : 'Pending Review'}
                    </span>
                  </div>
                  {result.reviewStatus.reviewedBy && (
                    <div className="text-xs text-medsight-primary/70">
                      by {result.reviewStatus.reviewedBy}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onExportResult?.(result.id, 'pdf')}
                    className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg"
                    title="Export PDF"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => onShareResult?.(result.id, [])}
                    className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg"
                    title="Share Results"
                  >
                    <ShareIcon className="w-4 h-4" />
                  </button>
                  
                  {!result.reviewStatus.approved && (
                    <>
                      <button
                        onClick={handleApprove}
                        className="btn-medsight text-sm bg-medsight-normal/10 border-medsight-normal/20 text-medsight-normal"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      
                      <button
                        onClick={() => setShowReviewDialog(true)}
                        className="btn-medsight text-sm bg-medsight-critical/10 border-medsight-critical/20 text-medsight-critical"
                      >
                        <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Review Dialog */}
      {showReviewDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-medsight-primary mb-4">Reject Analysis Results</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-medsight-primary mb-2">
                  Reason for rejection:
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="input-medsight w-full h-24 resize-none"
                  placeholder="Please provide a detailed reason for rejecting these results..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReviewDialog(false)}
                  className="btn-medsight flex-1 bg-medsight-primary/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!reviewComment.trim()}
                  className="btn-medsight flex-1 bg-medsight-critical/10 border-medsight-critical/20 text-medsight-critical disabled:opacity-50"
                >
                  Reject Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 