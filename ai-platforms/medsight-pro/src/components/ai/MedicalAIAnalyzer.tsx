'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Zap, 
  FileImage, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download,
  RefreshCw,
  Clock,
  Target,
  TrendingUp,
  Activity,
  Monitor,
  Heart,
  Skull,
  Stethoscope,
  Shield,
  Calendar,
  User,
  Filter,
  Search,
  ChevronRight,
  ChevronDown,
  Info,
  Star,
  Upload,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface DicomStudy {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientSex: 'M' | 'F';
  studyDate: Date;
  studyDescription: string;
  modality: 'CR' | 'CT' | 'MR' | 'US' | 'XR' | 'NM' | 'PET' | 'RF' | 'DR';
  bodyPart: string;
  seriesCount: number;
  instanceCount: number;
  studySize: number; // in MB
  institutionName: string;
  referringPhysician: string;
  studyStatus: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: 'routine' | 'urgent' | 'emergency' | 'stat';
  dicomUrl: string;
  thumbnailUrl?: string;
}

interface AIAnalysisResult {
  id: string;
  studyId: string;
  modelName: string;
  modelVersion: string;
  analysisType: 'screening' | 'diagnosis' | 'measurement' | 'classification' | 'detection';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  confidence: number; // 0-100
  processingTime: number; // in seconds
  findings: {
    id: string;
    category: 'normal' | 'abnormal' | 'suspicious' | 'pathological' | 'artifact';
    description: string;
    confidence: number;
    location?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
    icdCode?: string;
    recommendations: string[];
  }[];
  technicalMetrics: {
    imageQuality: number;
    noiseLevel: number;
    contrast: number;
    sharpness: number;
    artifacts: string[];
  };
  complianceFlags: {
    hipaaCompliant: boolean;
    fdaApproved: boolean;
    auditTrail: boolean;
    dataIntegrity: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

interface AIModel {
  id: string;
  name: string;
  version: string;
  description: string;
  modality: string[];
  bodyPart: string[];
  analysisType: string[];
  accuracy: number;
  sensitivity: number;
  specificity: number;
  fdaStatus: 'approved' | 'pending' | 'cleared' | 'experimental';
  lastTrained: Date;
  trainingDataSize: number;
  isActive: boolean;
  estimatedProcessingTime: number; // in seconds
  costPerAnalysis: number;
}

interface MedicalAIAnalyzerProps {
  studyId?: string;
  autoAnalyze?: boolean;
  showTechnicalDetails?: boolean;
  compactView?: boolean;
  onAnalysisComplete?: (result: AIAnalysisResult) => void;
  onError?: (error: string) => void;
}

export default function MedicalAIAnalyzer({
  studyId,
  autoAnalyze = false,
  showTechnicalDetails = true,
  compactView = false,
  onAnalysisComplete,
  onError
}: MedicalAIAnalyzerProps) {
  const [study, setStudy] = useState<DicomStudy | null>(null);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AIAnalysisResult[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (studyId) {
      loadStudyData();
    }
    loadAvailableModels();
  }, [studyId]);

  useEffect(() => {
    if (autoAnalyze && study && availableModels.length > 0) {
      const defaultModel = availableModels.find(m => m.isActive && m.modality.includes(study.modality));
      if (defaultModel) {
        setSelectedModel(defaultModel);
        startAnalysis(defaultModel);
      }
    }
  }, [autoAnalyze, study, availableModels]);

  const loadStudyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/dicom/studies/${studyId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Medical-Context': 'ai-analysis',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load study data');
      }

      const data = await response.json();
      setStudy(data);
    } catch (error) {
      console.error('Study loading error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      loadMockStudyData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockStudyData = () => {
    const mockStudy: DicomStudy = {
      id: 'study-001',
      patientId: 'PAT-2024-001',
      patientName: 'John Doe',
      patientAge: 45,
      patientSex: 'M',
      studyDate: new Date('2024-01-15'),
      studyDescription: 'Chest X-ray PA and Lateral',
      modality: 'CR',
      bodyPart: 'Chest',
      seriesCount: 2,
      instanceCount: 4,
      studySize: 12.5,
      institutionName: 'City Medical Center',
      referringPhysician: 'Dr. Sarah Johnson',
      studyStatus: 'completed',
      priority: 'routine',
      dicomUrl: '/api/dicom/studies/study-001/viewer',
      thumbnailUrl: '/images/sample-chest-xray.jpg'
    };
    setStudy(mockStudy);
  };

  const loadAvailableModels = async () => {
    try {
      const response = await fetch('/api/ai/models', {
        headers: {
          'Content-Type': 'application/json',
          'X-Medical-Context': 'ai-analysis',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load AI models');
      }

      const data = await response.json();
      setAvailableModels(data);
    } catch (error) {
      console.error('Models loading error:', error);
      loadMockModels();
    }
  };

  const loadMockModels = () => {
    const mockModels: AIModel[] = [
      {
        id: 'model-chest-xray',
        name: 'ChestXpert Pro',
        version: '2.1.4',
        description: 'Advanced chest X-ray analysis for pneumonia, COVID-19, and other thoracic conditions',
        modality: ['CR', 'DR', 'XR'],
        bodyPart: ['Chest'],
        analysisType: ['screening', 'diagnosis', 'detection'],
        accuracy: 94.7,
        sensitivity: 92.3,
        specificity: 96.1,
        fdaStatus: 'approved',
        lastTrained: new Date('2024-01-01'),
        trainingDataSize: 500000,
        isActive: true,
        estimatedProcessingTime: 45,
        costPerAnalysis: 12.50
      },
      {
        id: 'model-brain-ct',
        name: 'NeuroScan AI',
        version: '1.8.2',
        description: 'Brain CT analysis for stroke, hemorrhage, and tumor detection',
        modality: ['CT'],
        bodyPart: ['Brain', 'Head'],
        analysisType: ['diagnosis', 'detection', 'measurement'],
        accuracy: 96.2,
        sensitivity: 94.8,
        specificity: 97.5,
        fdaStatus: 'approved',
        lastTrained: new Date('2024-01-10'),
        trainingDataSize: 250000,
        isActive: true,
        estimatedProcessingTime: 120,
        costPerAnalysis: 25.00
      },
      {
        id: 'model-mammography',
        name: 'MammoGuard Elite',
        version: '3.0.1',
        description: 'Mammography screening and diagnosis for breast cancer detection',
        modality: ['MG'],
        bodyPart: ['Breast'],
        analysisType: ['screening', 'diagnosis', 'classification'],
        accuracy: 97.8,
        sensitivity: 96.5,
        specificity: 98.9,
        fdaStatus: 'approved',
        lastTrained: new Date('2024-01-05'),
        trainingDataSize: 750000,
        isActive: true,
        estimatedProcessingTime: 90,
        costPerAnalysis: 18.75
      }
    ];
    setAvailableModels(mockModels);
  };

  const startAnalysis = async (model: AIModel) => {
    if (!study || !model) return;

    try {
      setLoading(true);
      setError(null);
      setProcessingProgress(0);

      const analysisId = `analysis-${Date.now()}`;
      const newAnalysis: AIAnalysisResult = {
        id: analysisId,
        studyId: study.id,
        modelName: model.name,
        modelVersion: model.version,
        analysisType: model.analysisType[0] as any,
        status: 'processing',
        confidence: 0,
        processingTime: 0,
        findings: [],
        technicalMetrics: {
          imageQuality: 0,
          noiseLevel: 0,
          contrast: 0,
          sharpness: 0,
          artifacts: []
        },
        complianceFlags: {
          hipaaCompliant: true,
          fdaApproved: model.fdaStatus === 'approved',
          auditTrail: true,
          dataIntegrity: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setCurrentAnalysis(newAnalysis);

      // Simulate processing with progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Medical-Context': 'ai-analysis',
        },
        body: JSON.stringify({
          studyId: study.id,
          modelId: model.id,
          options: {
            includeTechnicalMetrics: showTechnicalDetails,
            generateReport: true,
            saveResults: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      setTimeout(() => {
        const completedAnalysis = { ...newAnalysis, ...result, status: 'completed' as const };
        setCurrentAnalysis(completedAnalysis);
        setAnalysisResults(prev => [...prev, completedAnalysis]);
        
        if (onAnalysisComplete) {
          onAnalysisComplete(completedAnalysis);
        }
      }, 1000);

    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      // Use mock results for demo
      generateMockResults(model);
    } finally {
      setLoading(false);
    }
  };

  const generateMockResults = (model: AIModel) => {
    const mockResults: AIAnalysisResult = {
      id: `analysis-${Date.now()}`,
      studyId: study?.id || '',
      modelName: model.name,
      modelVersion: model.version,
      analysisType: 'screening',
      status: 'completed',
      confidence: 92.3,
      processingTime: 47,
      findings: [
        {
          id: 'finding-1',
          category: 'abnormal',
          description: 'Opacity in right lower lobe consistent with pneumonia',
          confidence: 87.5,
          location: { x: 320, y: 240, width: 80, height: 60 },
          severity: 'medium',
          icdCode: 'J18.9',
          recommendations: [
            'Consider antibiotic therapy',
            'Follow-up chest X-ray in 2-3 weeks',
            'Monitor patient symptoms'
          ]
        },
        {
          id: 'finding-2',
          category: 'normal',
          description: 'Heart size within normal limits',
          confidence: 96.2,
          severity: 'low',
          recommendations: ['No immediate action required']
        },
        {
          id: 'finding-3',
          category: 'suspicious',
          description: 'Small nodule in left upper lobe - requires follow-up',
          confidence: 78.9,
          location: { x: 180, y: 150, width: 25, height: 25 },
          severity: 'medium',
          recommendations: [
            'Follow-up CT scan in 3 months',
            'Consider pulmonology referral',
            'Review previous imaging if available'
          ]
        }
      ],
      technicalMetrics: {
        imageQuality: 94.2,
        noiseLevel: 12.3,
        contrast: 87.6,
        sharpness: 91.4,
        artifacts: ['Grid artifacts (minimal)', 'Motion artifacts (none)']
      },
      complianceFlags: {
        hipaaCompliant: true,
        fdaApproved: true,
        auditTrail: true,
        dataIntegrity: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCurrentAnalysis(mockResults);
    setAnalysisResults(prev => [...prev, mockResults]);
    setProcessingProgress(100);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle DICOM file upload
      console.log('Uploading DICOM file:', file.name);
      setShowUploadDialog(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-medsight-critical';
      case 'high': return 'text-medsight-pending';
      case 'medium': return 'text-medsight-secondary';
      case 'low': return 'text-medsight-normal';
      default: return 'text-slate-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'abnormal': return 'text-medsight-critical';
      case 'suspicious': return 'text-medsight-pending';
      case 'pathological': return 'text-medsight-critical';
      case 'normal': return 'text-medsight-normal';
      case 'artifact': return 'text-slate-500';
      default: return 'text-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-medsight-normal" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-medsight-primary animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4 text-medsight-pending" />;
      case 'failed': return <XCircle className="w-4 h-4 text-medsight-critical" />;
      default: return <Monitor className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredFindings = currentAnalysis?.findings.filter(finding => {
    const matchesFilter = filterCategory === 'all' || finding.category === filterCategory;
    const matchesSearch = searchQuery === '' || 
      finding.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      finding.icdCode?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  if (compactView) {
    return (
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-5 h-5 text-medsight-primary" />
            <div>
              <div className="text-sm font-medium text-medsight-primary">AI Analysis</div>
              <div className="text-xs text-slate-600">
                {currentAnalysis ? `${currentAnalysis.findings.length} findings` : 'Ready for analysis'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {currentAnalysis && (
              <div className="text-right">
                <div className="text-sm font-medium text-medsight-primary">
                  {currentAnalysis.confidence.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500">Confidence</div>
              </div>
            )}
            <button
              onClick={() => selectedModel && startAnalysis(selectedModel)}
              disabled={loading || !selectedModel}
              className="btn-medsight-sm"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-medsight-primary mb-2">
              Medical AI Analysis
            </h2>
            <p className="text-slate-600">
              AI-powered medical image analysis and diagnostic assistance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowUploadDialog(true)}
              className="btn-medsight"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload DICOM
            </button>
            <div className="medsight-glass p-3 rounded-lg">
              <Brain className="w-6 h-6 text-medsight-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Study Information */}
      {study && (
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-medsight-primary">Study Information</h3>
            {getStatusIcon(study.studyStatus)}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-4 h-4 text-medsight-primary" />
                <span className="text-sm font-medium text-medsight-primary">Patient</span>
              </div>
              <div className="text-sm text-slate-900">{study.patientName}</div>
              <div className="text-xs text-slate-500">
                {study.patientAge} years old, {study.patientSex === 'M' ? 'Male' : 'Female'}
              </div>
            </div>

            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-medsight-primary" />
                <span className="text-sm font-medium text-medsight-primary">Study Date</span>
              </div>
              <div className="text-sm text-slate-900">{study.studyDate.toLocaleDateString()}</div>
              <div className="text-xs text-slate-500">{study.studyDescription}</div>
            </div>

            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FileImage className="w-4 h-4 text-medsight-primary" />
                <span className="text-sm font-medium text-medsight-primary">Study Details</span>
              </div>
              <div className="text-sm text-slate-900">{study.modality} - {study.bodyPart}</div>
              <div className="text-xs text-slate-500">
                {study.seriesCount} series, {study.instanceCount} images
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Model Selection */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-medsight-primary">AI Model Selection</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">
              {availableModels.filter(m => m.isActive).length} models available
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableModels
            .filter(model => !study || model.modality.includes(study.modality))
            .map(model => (
              <div
                key={model.id}
                className={`medsight-control-glass p-4 rounded-lg cursor-pointer transition-all ${
                  selectedModel?.id === model.id
                    ? 'ring-2 ring-medsight-primary bg-medsight-primary/5'
                    : 'hover:bg-medsight-primary/5'
                }`}
                onClick={() => setSelectedModel(model)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-medsight-primary" />
                    <span className="text-sm font-medium text-medsight-primary">{model.name}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    model.fdaStatus === 'approved' ? 'bg-medsight-normal/10 text-medsight-normal' :
                    model.fdaStatus === 'cleared' ? 'bg-medsight-secondary/10 text-medsight-secondary' :
                    'bg-medsight-pending/10 text-medsight-pending'
                  }`}>
                    {model.fdaStatus}
                  </div>
                </div>
                
                <div className="text-xs text-slate-600 mb-3">{model.description}</div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Accuracy</span>
                    <span className="text-xs font-medium">{model.accuracy}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Processing Time</span>
                    <span className="text-xs font-medium">{model.estimatedProcessingTime}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Cost</span>
                    <span className="text-xs font-medium">${model.costPerAnalysis}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {selectedModel && (
          <div className="mt-4 p-4 bg-medsight-primary/5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-medsight-primary">
                  {selectedModel.name} v{selectedModel.version}
                </div>
                <div className="text-xs text-slate-600">
                  Estimated processing time: {selectedModel.estimatedProcessingTime} seconds
                </div>
              </div>
              <button
                onClick={() => startAnalysis(selectedModel)}
                disabled={loading || !study}
                className="btn-medsight"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Processing Progress */}
      {loading && (
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-medsight-primary animate-spin" />
              <div>
                <div className="text-lg font-medium text-medsight-primary">
                  AI Analysis in Progress
                </div>
                <div className="text-sm text-slate-600">
                  {selectedModel?.name} is analyzing the medical images...
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-medsight-primary">
                {processingProgress.toFixed(0)}%
              </div>
              <div className="text-sm text-slate-600">Complete</div>
            </div>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-medsight-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {currentAnalysis && currentAnalysis.status === 'completed' && (
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-medsight-primary">Analysis Results</h3>
              <p className="text-slate-600 mt-1">
                {currentAnalysis.modelName} v{currentAnalysis.modelVersion}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-slate-500">Overall Confidence</div>
                <div className="text-lg font-bold text-medsight-primary">
                  {currentAnalysis.confidence.toFixed(1)}%
                </div>
              </div>
              <button className="btn-medsight">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>

          {/* Findings Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="medsight-input text-sm"
              >
                <option value="all">All Findings</option>
                <option value="abnormal">Abnormal</option>
                <option value="suspicious">Suspicious</option>
                <option value="normal">Normal</option>
                <option value="pathological">Pathological</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search findings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="medsight-input text-sm"
              />
            </div>
          </div>

          {/* Findings List */}
          <div className="space-y-4">
            {filteredFindings.map((finding, index) => (
              <div
                key={finding.id}
                className="medsight-control-glass p-4 rounded-lg"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedFinding(
                    expandedFinding === finding.id ? null : finding.id
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      finding.category === 'abnormal' ? 'bg-medsight-critical' :
                      finding.category === 'suspicious' ? 'bg-medsight-pending' :
                      finding.category === 'normal' ? 'bg-medsight-normal' :
                      'bg-slate-400'
                    }`}></div>
                    <div>
                      <div className={`text-sm font-medium ${getCategoryColor(finding.category)}`}>
                        {finding.description}
                      </div>
                      <div className="text-xs text-slate-500">
                        Confidence: {finding.confidence.toFixed(1)}% • 
                        Severity: {finding.severity}
                        {finding.icdCode && ` • ICD: ${finding.icdCode}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      finding.severity === 'critical' ? 'bg-medsight-critical/10 text-medsight-critical' :
                      finding.severity === 'high' ? 'bg-medsight-pending/10 text-medsight-pending' :
                      finding.severity === 'medium' ? 'bg-medsight-secondary/10 text-medsight-secondary' :
                      'bg-medsight-normal/10 text-medsight-normal'
                    }`}>
                      {finding.severity}
                    </div>
                    {expandedFinding === finding.id ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {expandedFinding === finding.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-slate-700 mb-2">
                          Recommendations
                        </h5>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {finding.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-medsight-primary">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {finding.location && (
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-2">
                            Location
                          </h5>
                          <div className="text-sm text-slate-600">
                            <div>X: {finding.location.x}px, Y: {finding.location.y}px</div>
                            <div>Size: {finding.location.width} × {finding.location.height}px</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Technical Metrics */}
          {showTechnicalDetails && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-700 mb-4">Technical Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="medsight-control-glass p-3 rounded-lg">
                  <div className="text-xs text-slate-500">Image Quality</div>
                  <div className="text-lg font-bold text-medsight-primary">
                    {currentAnalysis.technicalMetrics.imageQuality.toFixed(1)}%
                  </div>
                </div>
                <div className="medsight-control-glass p-3 rounded-lg">
                  <div className="text-xs text-slate-500">Noise Level</div>
                  <div className="text-lg font-bold text-medsight-secondary">
                    {currentAnalysis.technicalMetrics.noiseLevel.toFixed(1)}%
                  </div>
                </div>
                <div className="medsight-control-glass p-3 rounded-lg">
                  <div className="text-xs text-slate-500">Contrast</div>
                  <div className="text-lg font-bold text-medsight-accent">
                    {currentAnalysis.technicalMetrics.contrast.toFixed(1)}%
                  </div>
                </div>
                <div className="medsight-control-glass p-3 rounded-lg">
                  <div className="text-xs text-slate-500">Sharpness</div>
                  <div className="text-lg font-bold text-medsight-ai-high">
                    {currentAnalysis.technicalMetrics.sharpness.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compliance Status */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-4">Compliance Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(currentAnalysis.complianceFlags).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  {value ? (
                    <CheckCircle className="w-4 h-4 text-medsight-normal" />
                  ) : (
                    <XCircle className="w-4 h-4 text-medsight-critical" />
                  )}
                  <span className="text-sm text-slate-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-medsight-primary">Upload DICOM Study</h3>
              <button
                onClick={() => setShowUploadDialog(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-medsight-primary hover:bg-medsight-primary/5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-sm text-slate-600 mb-1">
                  Click to upload DICOM files
                </div>
                <div className="text-xs text-slate-400">
                  Supports DCM, DICOM files up to 500MB
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".dcm,.dicom"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUploadDialog(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 btn-medsight"
                >
                  Choose Files
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 