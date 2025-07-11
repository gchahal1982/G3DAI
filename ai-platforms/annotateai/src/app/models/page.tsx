'use client';

import React, { useState, useEffect } from 'react';
import { CpuChipIcon, CloudIcon, ChartBarIcon, PlayIcon, PauseIcon, StopIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { SparklesIcon, BoltIcon, FireIcon } from '@heroicons/react/24/solid';

interface AIModel {
  id: string;
  name: string;
  description: string;
  type: 'classification' | 'detection' | 'segmentation' | 'keypoint' | 'tracking';
  framework: 'tensorflow' | 'pytorch' | 'onnx' | 'custom';
  status: 'training' | 'ready' | 'deployed' | 'failed' | 'deprecated';
  version: string;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  mAP?: number;
  deploymentUrl?: string;
  inferenceCount: number;
  lastUsedAt?: string;
  createdAt: string;
  createdBy: string;
  projectId: string;
  trainingProgress?: number;
  trainingLogs?: string[];
  modelSize?: number;
  inferenceTime?: number;
  gpuMemory?: number;
}

interface ModelTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  framework: string;
  pretrainedWeights: boolean;
  estimatedTrainingTime: string;
  recommendedDataSize: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
}

export default function ModelsPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'models' | 'training' | 'templates'>('models');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const modelTemplates: ModelTemplate[] = [
    {
      id: 'yolov8',
      name: 'YOLOv8 Object Detection',
      description: 'State-of-the-art real-time object detection model',
      type: 'detection',
      framework: 'pytorch',
      pretrainedWeights: true,
      estimatedTrainingTime: '2-6 hours',
      recommendedDataSize: '1000+ images',
      complexity: 'intermediate'
    },
    {
      id: 'efficientnet',
      name: 'EfficientNet Classification',
      description: 'Efficient and accurate image classification model',
      type: 'classification',
      framework: 'tensorflow',
      pretrainedWeights: true,
      estimatedTrainingTime: '1-3 hours',
      recommendedDataSize: '500+ images per class',
      complexity: 'beginner'
    },
    {
      id: 'unet',
      name: 'U-Net Segmentation',
      description: 'Medical image segmentation specialist',
      type: 'segmentation',
      framework: 'pytorch',
      pretrainedWeights: true,
      estimatedTrainingTime: '4-12 hours',
      recommendedDataSize: '200+ annotated images',
      complexity: 'advanced'
    }
  ];

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockModels: AIModel[] = [
        {
          id: 'model-1',
          name: 'Medical X-ray Classifier',
          description: 'Classifies chest X-rays for pneumonia detection',
          type: 'classification',
          framework: 'tensorflow',
          status: 'deployed',
          version: 'v2.1.0',
          accuracy: 0.94,
          precision: 0.92,
          recall: 0.89,
          f1Score: 0.90,
          deploymentUrl: 'https://api.annotateai.com/models/medical-xray/v2.1.0',
          inferenceCount: 12847,
          lastUsedAt: '2024-01-20T15:30:00Z',
          createdAt: '2024-01-10T09:00:00Z',
          createdBy: 'Dr. Sarah Johnson',
          projectId: 'proj-medical-1',
          modelSize: 45.2,
          inferenceTime: 150,
          gpuMemory: 1024
        },
        {
          id: 'model-2',
          name: 'Vehicle Detection YOLOv8',
          description: 'Real-time vehicle detection for traffic monitoring',
          type: 'detection',
          framework: 'pytorch',
          status: 'training',
          version: 'v1.0.0',
          trainingProgress: 75,
          createdAt: '2024-01-18T14:20:00Z',
          createdBy: 'Alex Chen',
          projectId: 'proj-traffic-1',
          inferenceCount: 0,
          modelSize: 89.6
        },
        {
          id: 'model-3',
          name: 'Product Segmentation U-Net',
          description: 'Precise product segmentation for e-commerce',
          type: 'segmentation',
          framework: 'pytorch',
          status: 'ready',
          version: 'v1.2.0',
          accuracy: 0.91,
          precision: 0.88,
          recall: 0.93,
          f1Score: 0.90,
          inferenceCount: 5230,
          lastUsedAt: '2024-01-19T11:45:00Z',
          createdAt: '2024-01-15T16:30:00Z',
          createdBy: 'Maria Rodriguez',
          projectId: 'proj-ecommerce-1',
          modelSize: 67.8,
          inferenceTime: 320,
          gpuMemory: 2048
        }
      ];
      setModels(mockModels);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'deployed':
        return 'text-annotate-accent-green';
      case 'ready':
        return 'text-blue-400';
      case 'training':
        return 'text-annotate-accent-orange';
      case 'failed':
        return 'text-red-500';
      case 'deprecated':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed':
        return <CloudIcon className="w-4 h-4" />;
      case 'ready':
        return <PlayIcon className="w-4 h-4" />;
      case 'training':
        return <Cog6ToothIcon className="w-4 h-4 animate-spin" />;
      case 'failed':
        return <StopIcon className="w-4 h-4" />;
      default:
        return <PauseIcon className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'classification':
        return '🏷️';
      case 'detection':
        return '🎯';
      case 'segmentation':
        return '✂️';
      case 'keypoint':
        return '📍';
      case 'tracking':
        return '👀';
      default:
        return '🤖';
    }
  };

  const getComplexityColor = (complexity: string): string => {
    switch (complexity) {
      case 'beginner':
        return 'text-green-400';
      case 'intermediate':
        return 'text-yellow-400';
      case 'advanced':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatFileSize = (mb: number): string => {
    if (mb < 1024) {
      return `${mb.toFixed(1)} MB`;
    }
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || model.type === filterType;
    const matchesStatus = filterStatus === 'all' || model.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <SparklesIcon className="w-8 h-8 text-annotate-primary-500" />
                AI Models
              </h1>
              <p className="text-gray-400">Train, deploy, and manage your AI models</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTrainingModal(true)}
                className="px-6 py-3 bg-annotate-accent-purple hover:bg-purple-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <BoltIcon className="w-5 h-5" />
                Train Model
              </button>
              <button
                onClick={() => setShowDeployModal(true)}
                className="px-6 py-3 bg-annotate-primary-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <CloudIcon className="w-5 h-5" />
                Deploy Model
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-xl w-fit">
            {(['models', 'training', 'templates'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-medium transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-annotate-primary-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-annotate-primary-500 backdrop-blur-sm"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-annotate-primary-500 backdrop-blur-sm"
            >
              <option value="all">All Types</option>
              <option value="classification">Classification</option>
              <option value="detection">Detection</option>
              <option value="segmentation">Segmentation</option>
              <option value="keypoint">Keypoint</option>
              <option value="tracking">Tracking</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-annotate-primary-500 backdrop-blur-sm"
            >
              <option value="all">All Status</option>
              <option value="training">Training</option>
              <option value="ready">Ready</option>
              <option value="deployed">Deployed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'models' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Models List */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-4">
                {filteredModels.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className={`annotate-glass p-6 rounded-2xl cursor-pointer transition-all duration-200 ${
                      selectedModel?.id === model.id
                        ? 'ring-2 ring-annotate-primary-500'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTypeIcon(model.type)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                          <p className="text-sm text-gray-400">{model.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 ${getStatusColor(model.status)}`}>
                          {getStatusIcon(model.status)}
                          <span className="text-sm font-medium capitalize">{model.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Framework</p>
                        <p className="text-sm text-white capitalize">{model.framework}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Version</p>
                        <p className="text-sm text-white">{model.version}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Inference Count</p>
                        <p className="text-sm text-white">{model.inferenceCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Model Size</p>
                        <p className="text-sm text-white">{model.modelSize ? formatFileSize(model.modelSize) : 'N/A'}</p>
                      </div>
                    </div>

                    {model.accuracy && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Accuracy</p>
                          <p className="text-sm text-annotate-accent-green">{(model.accuracy * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Precision</p>
                          <p className="text-sm text-annotate-accent-cyan">{model.precision ? (model.precision * 100).toFixed(1) + '%' : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Recall</p>
                          <p className="text-sm text-annotate-accent-orange">{model.recall ? (model.recall * 100).toFixed(1) + '%' : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">F1 Score</p>
                          <p className="text-sm text-white">{model.f1Score ? (model.f1Score * 100).toFixed(1) + '%' : 'N/A'}</p>
                        </div>
                      </div>
                    )}

                    {model.status === 'training' && model.trainingProgress && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-400">Training Progress</p>
                          <p className="text-sm text-annotate-accent-orange">{model.trainingProgress}%</p>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-annotate-primary-500 to-annotate-accent-purple h-2 rounded-full transition-all duration-300"
                            style={{ width: `${model.trainingProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created {formatDate(model.createdAt)}</span>
                      <span>by {model.createdBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Details */}
            <div className="lg:col-span-1">
              {selectedModel ? (
                <div className="annotate-glass p-6 rounded-2xl sticky top-6">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">{getTypeIcon(selectedModel.type)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedModel.name}</h3>
                      <p className="text-sm text-gray-400">{selectedModel.version}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Status</p>
                      <div className={`flex items-center gap-2 ${getStatusColor(selectedModel.status)}`}>
                        {getStatusIcon(selectedModel.status)}
                        <span className="capitalize">{selectedModel.status}</span>
                      </div>
                    </div>

                    {selectedModel.deploymentUrl && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Deployment URL</p>
                        <p className="text-xs text-blue-400 font-mono bg-black/20 p-2 rounded break-all">
                          {selectedModel.deploymentUrl}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-400 mb-2">Performance</p>
                      <div className="space-y-2">
                        {selectedModel.inferenceTime && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-300">Inference Time:</span>
                            <span className="text-sm text-white">{selectedModel.inferenceTime}ms</span>
                          </div>
                        )}
                        {selectedModel.gpuMemory && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-300">GPU Memory:</span>
                            <span className="text-sm text-white">{selectedModel.gpuMemory}MB</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {selectedModel.status === 'ready' && (
                      <button className="w-full px-4 py-2 bg-annotate-primary-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
                        Deploy Model
                      </button>
                    )}
                    {selectedModel.status === 'deployed' && (
                      <button className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                        Stop Deployment
                      </button>
                    )}
                    <button className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                      View Logs
                    </button>
                    <button className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                      Test Model
                    </button>
                  </div>
                </div>
              ) : (
                <div className="annotate-glass p-12 rounded-2xl text-center">
                  <CpuChipIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Select a Model</h3>
                  <p className="text-gray-400">Choose a model to view details and manage deployment</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modelTemplates.map((template) => (
              <div key={template.id} className="annotate-glass p-6 rounded-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(template.type)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{template.framework} • {template.type}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${getComplexityColor(template.complexity)} bg-current/10`}>
                    {template.complexity}
                  </span>
                </div>

                <p className="text-sm text-gray-300 mb-4">{template.description}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Training Time:</span>
                    <span className="text-sm text-white">{template.estimatedTrainingTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Data Required:</span>
                    <span className="text-sm text-white">{template.recommendedDataSize}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Pretrained:</span>
                    <span className={`text-sm ${template.pretrainedWeights ? 'text-annotate-accent-green' : 'text-gray-400'}`}>
                      {template.pretrainedWeights ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-annotate-primary-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
                  Use Template
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 