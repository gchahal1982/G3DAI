'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CpuChipIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PlayIcon,
  StopIcon,
  EyeIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  BoltIcon,
  BeakerIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  CloudArrowDownIcon,
  ShareIcon,
  TrashIcon,
  PlusIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SignalIcon,
  FireIcon,
  CubeIcon,
  CircleStackIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

import type { 
  AIModel, 
  AIAnalysisRequest, 
  AIAnalysisResult,
  AnalysisInput,
  AnalysisParameters,
  ClinicalContext,
  ModelPerformance 
} from '@/lib/ai/ai-analysis-integration';
import { aiAnalysisIntegration } from '@/lib/ai/ai-analysis-integration';

interface AIInferenceDashboardProps {
  className?: string;
}

type ViewMode = 'grid' | 'list';
type ActiveTab = 'models' | 'requests' | 'results' | 'performance' | 'monitoring';

const MODEL_TYPE_COLORS: Record<string, string> = {
  'classification': 'bg-blue-100 text-blue-800',
  'detection': 'bg-green-100 text-green-800',
  'segmentation': 'bg-purple-100 text-purple-800',
  'prediction': 'bg-orange-100 text-orange-800',
  'nlp': 'bg-cyan-100 text-cyan-800',
  'multimodal': 'bg-pink-100 text-pink-800'
};

const APPROVAL_STATUS_COLORS: Record<string, string> = {
  'fda_approved': 'bg-green-100 text-green-800',
  'ce_marked': 'bg-blue-100 text-blue-800',
  'experimental': 'bg-yellow-100 text-yellow-800',
  'research': 'bg-gray-100 text-gray-800'
};

const PRIORITY_COLORS: Record<string, string> = {
  'low': 'bg-gray-100 text-gray-800',
  'medium': 'bg-blue-100 text-blue-800',
  'high': 'bg-orange-100 text-orange-800',
  'urgent': 'bg-red-100 text-red-800',
  'emergency': 'bg-red-200 text-red-900'
};

export default function AIInferenceDashboard({ className = '' }: AIInferenceDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('models');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [models, setModels] = useState<AIModel[]>([]);
  const [requests, setRequests] = useState<AIAnalysisRequest[]>([]);
  const [results, setResults] = useState<AIAnalysisResult[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<Record<string, ModelPerformance>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AIAnalysisRequest | null>(null);
  const [selectedResult, setSelectedResult] = useState<AIAnalysisResult | null>(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    status: 'all',
    approvalStatus: 'all'
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
    setupEventListeners();
    
    return () => {
      cleanupEventListeners();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateActiveRequests();
      updatePerformanceMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [modelsData, requestsData, metricsData] = await Promise.all([
        aiAnalysisIntegration.getAvailableModels(),
        aiAnalysisIntegration.getActiveRequests(),
        aiAnalysisIntegration.getModelPerformanceMetrics()
      ]);

      setModels(modelsData);
      setRequests(requestsData);
      setPerformanceMetrics(metricsData);

      // Load recent results
      const recentResults = await Promise.all(
        requestsData.slice(0, 10).map(async (req) => {
          const result = await aiAnalysisIntegration.getAnalysisResult(req.id);
          return result;
        })
      );

      setResults(recentResults.filter(r => r !== null) as AIAnalysisResult[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateActiveRequests = async () => {
    try {
      const activeRequests = await aiAnalysisIntegration.getActiveRequests();
      setRequests(activeRequests);
    } catch (error) {
      console.error('Error updating active requests:', error);
    }
  };

  const updatePerformanceMetrics = async () => {
    try {
      const metrics = await aiAnalysisIntegration.getModelPerformanceMetrics();
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Error updating performance metrics:', error);
    }
  };

  const setupEventListeners = () => {
    aiAnalysisIntegration.subscribe('analysis_completed', handleAnalysisCompleted);
    aiAnalysisIntegration.subscribe('analysis_error', handleAnalysisError);
    aiAnalysisIntegration.subscribe('analysis_submitted', handleAnalysisSubmitted);
  };

  const cleanupEventListeners = () => {
    aiAnalysisIntegration.unsubscribe('analysis_completed', handleAnalysisCompleted);
    aiAnalysisIntegration.unsubscribe('analysis_error', handleAnalysisError);
    aiAnalysisIntegration.unsubscribe('analysis_submitted', handleAnalysisSubmitted);
  };

  const handleAnalysisCompleted = useCallback((event: any) => {
    // Update results
    setResults(prev => {
      const existing = prev.find(r => r.requestId === event.requestId);
      if (existing) {
        return prev.map(r => r.requestId === event.requestId ? event.result : r);
      } else {
        return [event.result, ...prev.slice(0, 9)];
      }
    });

    // Remove from active requests
    setRequests(prev => prev.filter(r => r.id !== event.requestId));
  }, []);

  const handleAnalysisError = useCallback((event: any) => {
    // Remove from active requests
    setRequests(prev => prev.filter(r => r.id !== event.requestId));
    console.error('Analysis error:', event.error);
  }, []);

  const handleAnalysisSubmitted = useCallback((event: any) => {
    // Refresh active requests
    updateActiveRequests();
  }, []);

  const filteredModels = models.filter(model => {
    const matchesSearch = searchTerm === '' || 
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filters.type === 'all' || model.type === filters.type;
    const matchesCategory = filters.category === 'all' || model.category === filters.category;
    const matchesStatus = filters.status === 'all' || model.status === filters.status;
    const matchesApproval = filters.approvalStatus === 'all' || model.approvalStatus === filters.approvalStatus;
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesApproval;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'accuracy':
        aValue = a.accuracy;
        bValue = b.accuracy;
        break;
      case 'lastUpdated':
        aValue = a.lastUpdated;
        bValue = b.lastUpdated;
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const toggleCardExpansion = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const handleRunAnalysis = async (modelId: string) => {
    // TODO: Implement analysis request modal
    setSelectedModel(models.find(m => m.id === modelId) || null);
    setShowNewRequestModal(true);
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await aiAnalysisIntegration.cancelAnalysisRequest(requestId, 'Cancelled by user');
      updateActiveRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
    }
  };

  const formatDuration = (milliseconds: number): string => {
    if (milliseconds < 1000) return `${milliseconds}ms`;
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
    return `${(milliseconds / 60000).toFixed(1)}m`;
  };

  const formatAccuracy = (accuracy: number): string => {
    return `${(accuracy * 100).toFixed(1)}%`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'training':
        return <BeakerIcon className="w-5 h-5 text-blue-600" />;
      case 'validating':
        return <ShieldCheckIcon className="w-5 h-5 text-yellow-600" />;
      case 'deprecated':
        return <XCircleIcon className="w-5 h-5 text-gray-500" />;
      case 'maintenance':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className={`medsight-glass p-6 rounded-xl ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medsight-primary"></div>
            <span className="text-medsight-primary font-medium">Loading AI Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`medsight-glass p-6 rounded-xl ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load AI Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="btn-medsight"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`medsight-glass p-6 rounded-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <CpuChipIcon className="w-6 h-6 text-medsight-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">AI Inference Dashboard</h2>
            <p className="text-sm text-gray-600">
              {models.length} models • {requests.length} active requests • {results.length} recent results
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="btn-medsight"
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? (
              <ListBulletIcon className="w-4 h-4" />
            ) : (
              <Squares2X2Icon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="btn-medsight"
            title="Submit new analysis"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
          <button
            onClick={loadData}
            className="btn-medsight"
            title="Refresh dashboard"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'models', name: 'AI Models', icon: CpuChipIcon, count: models.length },
              { id: 'requests', name: 'Active Requests', icon: ClockIcon, count: requests.length },
              { id: 'results', name: 'Recent Results', icon: ChartBarIcon, count: results.length },
              { id: 'performance', name: 'Performance', icon: SignalIcon, count: Object.keys(performanceMetrics).length },
              { id: 'monitoring', name: 'Monitoring', icon: FireIcon, count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-medsight-primary text-medsight-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-medsight-primary text-white' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Search and Filters */}
      {activeTab === 'models' && (
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search AI models by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-medsight pl-10 w-full"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-gray-500" />
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="input-medsight"
              >
                <option value="all">All Types</option>
                <option value="classification">Classification</option>
                <option value="detection">Detection</option>
                <option value="segmentation">Segmentation</option>
                <option value="prediction">Prediction</option>
                <option value="nlp">NLP</option>
                <option value="multimodal">Multimodal</option>
              </select>
            </div>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input-medsight"
            >
              <option value="all">All Categories</option>
              <option value="radiology">Radiology</option>
              <option value="pathology">Pathology</option>
              <option value="cardiology">Cardiology</option>
              <option value="neurology">Neurology</option>
              <option value="oncology">Oncology</option>
              <option value="general">General</option>
              <option value="clinical">Clinical</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-medsight"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="training">Training</option>
              <option value="validating">Validating</option>
              <option value="deprecated">Deprecated</option>
              <option value="maintenance">Maintenance</option>
            </select>

            <select
              value={filters.approvalStatus}
              onChange={(e) => setFilters({ ...filters, approvalStatus: e.target.value })}
              className="input-medsight"
            >
              <option value="all">All Approval Status</option>
              <option value="fda_approved">FDA Approved</option>
              <option value="ce_marked">CE Marked</option>
              <option value="experimental">Experimental</option>
              <option value="research">Research</option>
            </select>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-medsight"
              >
                <option value="name">Name</option>
                <option value="accuracy">Accuracy</option>
                <option value="lastUpdated">Last Updated</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="btn-medsight"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'models' && (
        <div className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModels.map((model) => (
                <div
                  key={model.id}
                  className="medsight-control-glass p-4 rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  {/* Model Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(model.status)}
                      <div>
                        <h3 className="font-medium text-gray-900 truncate" title={model.name}>
                          {model.name}
                        </h3>
                        <p className="text-sm text-gray-600">v{model.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${MODEL_TYPE_COLORS[model.type]}`}>
                        {model.type}
                      </span>
                    </div>
                  </div>

                  {/* Model Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {model.description}
                  </p>

                  {/* Model Metrics */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-lg font-semibold text-medsight-primary">
                        {formatAccuracy(model.accuracy)}
                      </div>
                      <div className="text-xs text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-lg font-semibold text-medsight-secondary">
                        {formatAccuracy(model.auc)}
                      </div>
                      <div className="text-xs text-gray-600">AUC</div>
                    </div>
                  </div>

                  {/* Approval Status */}
                  <div className="mb-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${APPROVAL_STATUS_COLORS[model.approvalStatus]}`}>
                      {model.approvalStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Model Details (Expandable) */}
                  {expandedCards.has(model.id) && (
                    <div className="mb-3 p-3 bg-gray-50 rounded text-sm space-y-2">
                      <div><strong>Category:</strong> {model.category}</div>
                      <div><strong>Modalities:</strong> {model.modalities.join(', ')}</div>
                      <div><strong>Body Parts:</strong> {model.bodyParts.join(', ')}</div>
                      <div><strong>Sensitivity:</strong> {formatAccuracy(model.sensitivity)}</div>
                      <div><strong>Specificity:</strong> {formatAccuracy(model.specificity)}</div>
                      <div><strong>Last Updated:</strong> {model.lastUpdated.toLocaleDateString()}</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleCardExpansion(model.id)}
                      className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                    >
                      {expandedCards.has(model.id) ? (
                        <>
                          <ChevronUpIcon className="w-4 h-4" />
                          <span>Less</span>
                        </>
                      ) : (
                        <>
                          <ChevronDownIcon className="w-4 h-4" />
                          <span>More</span>
                        </>
                      )}
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedModel(model)}
                        className="btn-medsight text-sm"
                        title="View details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {model.status === 'active' && (
                        <button
                          onClick={() => handleRunAnalysis(model.id)}
                          className="btn-medsight text-sm"
                          title="Run analysis"
                        >
                          <PlayIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {/* List Header */}
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                <div className="flex-1">Model</div>
                <div className="w-24">Type</div>
                <div className="w-24">Accuracy</div>
                <div className="w-32">Status</div>
                <div className="w-32">Approval</div>
                <div className="w-24">Actions</div>
              </div>

              {/* List Items */}
              {filteredModels.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center space-x-4 p-3 medsight-control-glass rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(model.status)}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {model.name}
                        </h3>
                        <div className="text-sm text-gray-600">
                          {model.category} • v{model.version}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-24">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${MODEL_TYPE_COLORS[model.type]}`}>
                      {model.type}
                    </span>
                  </div>
                  <div className="w-24 text-sm font-medium text-medsight-primary">
                    {formatAccuracy(model.accuracy)}
                  </div>
                  <div className="w-32">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      model.status === 'active' ? 'bg-green-100 text-green-800' :
                      model.status === 'training' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {model.status}
                    </span>
                  </div>
                  <div className="w-32">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${APPROVAL_STATUS_COLORS[model.approvalStatus]}`}>
                      {model.approvalStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="w-24 flex items-center space-x-1">
                    <button
                      onClick={() => setSelectedModel(model)}
                      className="btn-medsight text-sm p-1"
                      title="View details"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    {model.status === 'active' && (
                      <button
                        onClick={() => handleRunAnalysis(model.id)}
                        className="btn-medsight text-sm p-1"
                        title="Run analysis"
                      >
                        <PlayIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredModels.length === 0 && (
            <div className="text-center py-12">
              <CpuChipIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No models found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or filter settings.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="medsight-control-glass p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="medsight-ai-glass p-2 rounded">
                        <ClockIcon className="w-5 h-5 text-medsight-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Analysis Request #{request.id.slice(-8)}
                        </h3>
                        <div className="text-sm text-gray-600 space-x-2">
                          <span>Model: {models.find(m => m.id === request.modelId)?.name || request.modelId}</span>
                          <span>•</span>
                          <span>Priority: {request.priority}</span>
                          <span>•</span>
                          <span>Submitted: {request.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${PRIORITY_COLORS[request.priority]}`}>
                        {request.priority}
                      </span>
                      <button
                        onClick={() => handleCancelRequest(request.id)}
                        className="btn-medsight text-sm"
                        title="Cancel request"
                      >
                        <StopIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active requests</h3>
              <p className="text-gray-600">
                Submit a new analysis request to get started.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-4">
          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="medsight-control-glass p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`medsight-ai-glass p-2 rounded ${
                        result.status === 'completed' ? 'bg-green-50' :
                        result.status === 'failed' ? 'bg-red-50' : 'bg-gray-50'
                      }`}>
                        {result.status === 'completed' ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        ) : result.status === 'failed' ? (
                          <XCircleIcon className="w-5 h-5 text-red-600" />
                        ) : (
                          <ClockIcon className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Analysis Result #{result.id.slice(-8)}
                        </h3>
                        <div className="text-sm text-gray-600 space-x-2">
                          <span>Model: {models.find(m => m.id === result.modelId)?.name || result.modelId}</span>
                          <span>•</span>
                          <span>Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                          <span>•</span>
                          <span>Time: {formatDuration(result.processingTime)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 text-xs rounded-full font-medium ${
                        result.confidence >= 0.9 ? 'medsight-confidence-high' :
                        result.confidence >= 0.7 ? 'medsight-confidence-medium' :
                        'medsight-confidence-low'
                      }`}>
                        {(result.confidence * 100).toFixed(0)}% confidence
                      </div>
                      {result.results.findings.length > 0 && (
                        <span className="text-sm text-gray-600">
                          {result.results.findings.length} findings
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recent results</h3>
              <p className="text-gray-600">
                Analysis results will appear here once processing is complete.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(performanceMetrics).map(([modelId, metrics]) => {
            const model = models.find(m => m.id === modelId);
            return (
              <div key={modelId} className="medsight-control-glass p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="medsight-ai-glass p-2 rounded">
                    <SignalIcon className="w-5 h-5 text-medsight-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {model?.name || modelId}
                    </h3>
                    <p className="text-sm text-gray-600">Performance Metrics</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Inference Time</span>
                    <span className="text-sm font-medium">{formatDuration(metrics.inferenceTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Throughput</span>
                    <span className="text-sm font-medium">{metrics.throughput.toFixed(1)}/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Memory Usage</span>
                    <span className="text-sm font-medium">{(metrics.memoryUsage / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">GPU Usage</span>
                    <span className="text-sm font-medium">{(metrics.gpuUsage * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-medium">{(metrics.uptimePercentage * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="text-sm font-medium">{(metrics.errorRate * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="text-center py-12">
          <FireIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">System Monitoring</h3>
          <p className="text-gray-600">
            Real-time monitoring dashboard coming soon.
          </p>
        </div>
      )}
    </div>
  );
} 