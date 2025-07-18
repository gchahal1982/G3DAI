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
} from '@heroicons/react/24/outline';
import {
  CpuChipIcon as CpuChipIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';

// Mock data for AI analysis
const mockAIAnalyses = [
  {
    id: 'ai-001',
    patientId: 'P-2024-001',
    studyType: 'Chest CT',
    aiModel: 'ResNet-50 Lung Detection',
    status: 'completed',
    confidence: 95.6,
    findings: [
      { type: 'normal', description: 'Normal lung parenchyma', confidence: 97.2 },
      { type: 'abnormal', description: 'Small nodule detected - right upper lobe', confidence: 89.4 },
      { type: 'pending', description: 'Requires radiologist review', confidence: 85.1 }
    ],
    processingTime: '2.3s',
    timestamp: '2024-01-15 14:30:00',
    priority: 'high'
  },
  {
    id: 'ai-002', 
    patientId: 'P-2024-002',
    studyType: 'Brain MRI',
    aiModel: 'U-Net Brain Segmentation',
    status: 'processing',
    confidence: 0,
    findings: [],
    processingTime: '0.8s',
    timestamp: '2024-01-15 14:28:00',
    priority: 'medium'
  }
];

const mockPredictiveData = [
  {
    prediction: 'Treatment Response',
    value: 87.3,
    trend: 'improving',
    timeframe: '30 days',
    confidence: 'high'
  },
  {
    prediction: 'Disease Progression',
    value: 12.5,
    trend: 'stable', 
    timeframe: '90 days',
    confidence: 'medium'
  },
  {
    prediction: 'Readmission Risk',
    value: 8.2,
    trend: 'decreasing',
    timeframe: '30 days',
    confidence: 'high'
  }
];

const mockKnowledgeItems = [
  {
    topic: 'Lung Nodule Guidelines',
    relevance: 98.5,
    source: 'Fleischner Society',
    summary: 'Management guidelines for incidental pulmonary nodules'
  },
  {
    topic: 'AI Diagnostic Accuracy',
    relevance: 94.2,
    source: 'Radiology AI Research',
    summary: 'Meta-analysis of AI performance in chest imaging'
  }
];

interface AIAnalysisWorkspaceProps {
  className?: string;
}

export default function AIAnalysisWorkspace({ className = '' }: AIAnalysisWorkspaceProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [aiProcessingStatus, setAIProcessingStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'inference' | 'vision' | 'assistant' | 'analytics'>('inference');
  const [assistantQuery, setAssistantQuery] = useState('');
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>(['ResNet-50', 'U-Net', 'YOLO-v8']);

  const analysisResults = mockAIAnalyses;
  const predictiveAnalytics = mockPredictiveData;
  const knowledgeGraph = mockKnowledgeItems;

  const handleStartAnalysis = useCallback(() => {
    setAIProcessingStatus('processing');
    setTimeout(() => {
      setAIProcessingStatus('completed');
    }, 3000);
  }, []);

  const handleStopAnalysis = useCallback(() => {
    setAIProcessingStatus('idle');
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-medsight-ai-high';
    if (confidence >= 70) return 'text-medsight-ai-medium'; 
    return 'text-medsight-ai-low';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-medsight-normal';
      case 'processing': return 'text-medsight-pending';
      case 'error': return 'text-medsight-abnormal';
      default: return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-medsight-critical';
      case 'medium': return 'text-medsight-pending';
      case 'low': return 'text-medsight-normal';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`min-h-screen bg-gray-100 ${className}`}>
      {/* Medical Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <CpuChipIconSolid className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">AI Analysis Workspace</h1>
                <p className="text-sm text-gray-600">Advanced Medical AI Analysis and Decision Support</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* AI Status Indicator */}
            <div className="flex items-center space-x-2 glass-card-secondary px-3 py-2 rounded-lg">
              <CpuChipIconSolid className={`w-5 h-5 ${aiProcessingStatus === 'processing' ? 'text-warning animate-pulse' : 'text-success'}`} />
              <span className="text-sm font-medium text-gray-800">
                {aiProcessingStatus === 'processing' ? 'AI Processing...' : 'AI Ready'}
              </span>
            </div>

            {/* Emergency Protocol */}
            <button className="btn-medical bg-danger/10 text-danger border-danger/30 hover:bg-danger/20">
              <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
              Emergency Analysis
            </button>

            {/* Real-time Toggle */}
            <button 
              onClick={() => setIsRealTimeMode(!isRealTimeMode)}
              className={`btn-medical ${isRealTimeMode ? 'bg-primary/20 text-primary border-primary/30' : 'btn-secondary'}`}
            >
              <BoltIcon className="w-4 h-4 mr-2" />
              Real-time: {isRealTimeMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* AI Workspace Tabs */}
        <div className="flex space-x-1 mt-6">
          {[
            { id: 'inference', label: 'AI Inference', icon: CpuChipIcon },
            { id: 'vision', label: 'Computer Vision', icon: EyeIcon },
            { id: 'assistant', label: 'Medical Assistant', icon: ChatBubbleLeftEllipsisIcon },
            { id: 'analytics', label: 'Predictive Analytics', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'glass-card-secondary text-primary border border-primary/30'
                  : 'glass-card text-gray-600 hover:text-gray-800 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main AI Analysis Panel */}
        <div className="col-span-8">
          {activeTab === 'inference' && (
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <CpuChipIcon className="w-6 h-6 mr-2 text-primary" />
                  AI Inference Engine
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleStartAnalysis}
                    disabled={aiProcessingStatus === 'processing'}
                    className="btn-medsight bg-medsight-ai-high/20 text-medsight-ai-high"
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Start Analysis
                  </button>
                  <button
                    onClick={handleStopAnalysis}
                    className="btn-medsight bg-medsight-abnormal/20 text-medsight-abnormal"
                  >
                    <StopIcon className="w-4 h-4 mr-2" />
                    Stop
                  </button>
                </div>
              </div>

              {/* AI Model Selection */}
              <div className="medsight-control-glass p-4 rounded-lg mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Active AI Models</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['ResNet-50', 'U-Net', 'YOLO-v8', 'BERT-Clinical', 'Transformer-Med', 'GPT-Medical'].map((model) => (
                    <label key={model} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedModels([...selectedModels, model]);
                          } else {
                            setSelectedModels(selectedModels.filter(m => m !== model));
                          }
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{model}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Confidence Threshold */}
              <div className="glass-card-secondary p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-800">Confidence Threshold</h3>
                  <span className={`font-semibold ${getConfidenceColor(confidenceThreshold)}`}>
                    {confidenceThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low (50%)</span>
                  <span>Medium (75%)</span>
                  <span>High (100%)</span>
                </div>
              </div>

              {/* AI Analysis Results */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <BeakerIcon className="w-5 h-5 mr-2" />
                  Recent AI Analyses
                </h3>
                {analysisResults.map((analysis) => (
                  <div
                    key={analysis.id}
                    className={`glass-card-secondary p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 ${
                      selectedAnalysis === analysis.id ? 'ring-2 ring-primary border-primary/30' : ''
                    }`}
                    onClick={() => setSelectedAnalysis(analysis.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-800">{analysis.studyType}</span>
                        <span className="text-sm text-gray-600">Patient: {analysis.patientId}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-medium ${getStatusColor(analysis.status)}`}>
                          {analysis.status}
                        </span>
                        <span className={`text-sm font-medium ${getPriorityColor(analysis.priority)}`}>
                          {analysis.priority} priority
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">Model: {analysis.aiModel}</span>
                      <div className="flex items-center space-x-2">
                        {analysis.confidence > 0 && (
                          <span className={`text-sm font-semibold ${getConfidenceColor(analysis.confidence)}`}>
                            {analysis.confidence}% confidence
                          </span>
                        )}
                        <span className="text-sm text-gray-500">{analysis.processingTime}</span>
                      </div>
                    </div>

                    {analysis.findings.length > 0 && (
                      <div className="space-y-2">
                        {analysis.findings.map((finding, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className={`${finding.type === 'normal' ? 'text-medsight-normal' : finding.type === 'abnormal' ? 'text-medsight-abnormal' : 'text-medsight-pending'}`}>
                              {finding.description}
                            </span>
                            <span className={`font-medium ${getConfidenceColor(finding.confidence)}`}>
                              {finding.confidence}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vision' && (
            <div className="medsight-ai-glass p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-medsight-primary flex items-center mb-6">
                <EyeIcon className="w-6 h-6 mr-2" />
                Computer Vision Analysis
              </h2>
              
              {/* Vision Analysis Panel */}
              <div className="glass-card-secondary p-6 rounded-lg mb-6 border border-primary/20">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <EyeIcon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Medical Image Analysis</h3>
                  <p className="text-sm text-gray-600 mb-4">Upload or select medical images for AI-powered analysis</p>
                  <button className="btn-medical btn-primary">
                    <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                    Upload Images
                  </button>
                </div>
              </div>

              {/* Detection Results */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card-secondary p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Object Detection</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Lung Nodules</span>
                      <span className="text-sm font-medium text-danger">2 detected</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Anatomical Structures</span>
                      <span className="text-sm font-medium text-success">Complete</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pathological Changes</span>
                      <span className="text-sm font-medium text-warning">Analyzing...</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card-secondary p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Segmentation</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Organ Segmentation</span>
                      <span className="text-sm font-medium text-success">96.8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tissue Classification</span>
                      <span className="text-sm font-medium text-primary">87.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Boundary Detection</span>
                      <span className="text-sm font-medium text-success">94.1%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assistant' && (
            <div className="glass-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-6">
                <ChatBubbleLeftEllipsisIcon className="w-6 h-6 mr-2 text-primary" />
                Medical AI Assistant
              </h2>

              {/* Chat Interface */}
              <div className="glass-card-secondary p-6 rounded-lg mb-4 min-h-[300px]">
                                 <div className="space-y-4">
                   <div className="flex items-start space-x-3">
                     <CpuChipIconSolid className="w-8 h-8 text-primary mt-1" />
                     <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg max-w-[80%]">
                       <p className="text-sm text-gray-800">
                         Hello! I'm your Medical AI Assistant. I can help with clinical decision support, 
                         differential diagnosis, treatment recommendations, and medical literature review. 
                         How can I assist you today?
                       </p>
                     </div>
                   </div>

                  <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-primary/10 backdrop-blur-sm p-3 rounded-lg max-w-[80%]">
                      <p className="text-sm text-gray-800">
                        Can you help me interpret the lung nodule findings from the recent CT scan?
                      </p>
                    </div>
                    <UserIcon className="w-8 h-8 text-gray-400 mt-1" />
                  </div>

                                     <div className="flex items-start space-x-3">
                     <CpuChipIconSolid className="w-8 h-8 text-primary mt-1" />
                     <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg max-w-[80%]">
                       <p className="text-sm text-gray-800 mb-2">
                         Based on the AI analysis, I found a small nodule in the right upper lobe. 
                         Here's my assessment:
                       </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span className="font-medium">8.5mm diameter</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Density:</span>
                          <span className="font-medium">Solid</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Malignancy Risk:</span>
                          <span className="font-medium text-warning">Moderate (65%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recommendation:</span>
                          <span className="font-medium">Follow-up CT in 3-6 months</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Query Input */}
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={assistantQuery}
                  onChange={(e) => setAssistantQuery(e.target.value)}
                  placeholder="Ask about clinical findings, treatment options, or medical literature..."
                  className="input-medsight flex-1"
                />
                <button className="btn-medsight bg-medsight-ai-high/20 text-medsight-ai-high">
                  <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-2" />
                  Send
                </button>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="medsight-ai-glass p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-medsight-primary flex items-center mb-6">
                <ChartBarIcon className="w-6 h-6 mr-2" />
                Predictive Analytics
              </h2>

              {/* Predictive Models */}
              <div className="grid grid-cols-2 gap-6">
                {predictiveAnalytics.map((prediction, idx) => (
                  <div key={idx} className="medsight-control-glass p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-800">{prediction.prediction}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        prediction.confidence === 'high' ? 'bg-medsight-ai-high/20 text-medsight-ai-high' :
                        prediction.confidence === 'medium' ? 'bg-medsight-ai-medium/20 text-medsight-ai-medium' :
                        'bg-medsight-ai-low/20 text-medsight-ai-low'
                      }`}>
                        {prediction.confidence} confidence
                      </span>
                    </div>
                    
                    <div className="text-2xl font-bold text-gray-800 mb-2">
                      {prediction.value}%
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{prediction.timeframe}</span>
                      <span className={`font-medium ${
                        prediction.trend === 'improving' ? 'text-medsight-normal' :
                        prediction.trend === 'stable' ? 'text-medsight-pending' :
                        'text-medsight-abnormal'
                      }`}>
                        {prediction.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Analytics Chart Placeholder */}
              <div className="glass-card-secondary p-8 rounded-lg mt-6 border border-success/20">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-success/10 rounded-full flex items-center justify-center">
                    <ChartBarIcon className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Predictive Analytics Dashboard</h3>
                  <p className="text-sm text-gray-600">Advanced medical outcome prediction and trend analysis</p>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="bg-warning/10 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-warning">87.3%</div>
                      <div className="text-xs text-gray-600">Treatment Response</div>
                    </div>
                    <div className="bg-danger/10 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-danger">12.5%</div>
                      <div className="text-xs text-gray-600">Disease Progression</div>
                    </div>
                    <div className="bg-success/10 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-success">8.2%</div>
                      <div className="text-xs text-gray-600">Readmission Risk</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="col-span-4 space-y-6">
          {/* AI Performance Metrics */}
          <div className="glass-card p-6 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <TrophyIcon className="w-5 h-5 mr-2 text-warning" />
              AI Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overall Accuracy</span>
                <span className="font-semibold text-success">96.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Processing Speed</span>
                <span className="font-semibold text-primary">2.3s avg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Models Active</span>
                <span className="font-semibold text-gray-800">{selectedModels.length}/6</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Queue Length</span>
                <span className="font-semibold text-gray-800">3 studies</span>
              </div>
            </div>
          </div>

          {/* Knowledge Graph */}
          <div className="glass-card p-6 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <AcademicCapIcon className="w-5 h-5 mr-2 text-primary" />
              Medical Knowledge
            </h3>
            <div className="space-y-3">
              {knowledgeGraph.map((item, idx) => (
                <div key={idx} className="glass-card-secondary p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800">{item.topic}</span>
                    <span className="text-xs text-primary">{item.relevance}%</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{item.summary}</p>
                  <span className="text-xs text-gray-500">{item.source}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <BoltIcon className="w-5 h-5 mr-2 text-primary" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="btn-medical w-full justify-start btn-secondary">
                <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                Batch Analysis
              </button>
              <button className="btn-medical w-full justify-start btn-secondary">
                <DocumentChartBarIcon className="w-4 h-4 mr-2" />
                Generate Report
              </button>
              <button className="btn-medical w-full justify-start btn-secondary">
                <ShareIcon className="w-4 h-4 mr-2" />
                Share Results
              </button>
              <button className="btn-medical w-full justify-start btn-secondary">
                <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                Model Settings
              </button>
            </div>
          </div>

          {/* Compliance & Security */}
          <div className="glass-card p-6 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-success" />
              Compliance
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">HIPAA Compliance</span>
                <CheckCircleIconSolid className="w-4 h-4 text-success" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">FDA Validation</span>
                <CheckCircleIconSolid className="w-4 h-4 text-success" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Audit Trail</span>
                <CheckCircleIconSolid className="w-4 h-4 text-success" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Encryption</span>
                <LockClosedIcon className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Footer */}
      <div className="glass-card p-4 mt-6">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <HeartIcon className="w-4 h-4 mr-1 text-success" />
              AI Analysis System Active
            </span>
            <span className="flex items-center">
              <FingerPrintIcon className="w-4 h-4 mr-1 text-primary" />
              Session: {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>MedSight Pro AI Analysis v2.4.1</span>
            <span className="flex items-center">
              <GlobeAltIcon className="w-4 h-4 mr-1 text-success" />
              Connected to Medical AI Cloud
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 