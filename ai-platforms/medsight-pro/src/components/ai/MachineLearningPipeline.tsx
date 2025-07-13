'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Cpu, 
  Database, 
  Settings, 
  Play, 
  Pause, 
  Square, 
  Upload, 
  Download, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Zap, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  FileText, 
  Layers, 
  Target, 
  Brain, 
  Code, 
  Monitor, 
  Cloud, 
  Server, 
  HardDrive, 
  Gauge, 
  LineChart, 
  PieChart, 
  BarChart, 
  Eye, 
  Filter, 
  Search, 
  Calendar, 
  User, 
  Shield, 
  Lock, 
  Unlock, 
  Archive, 
  Trash2, 
  GitBranch, 
  Tag, 
  Star, 
  BookOpen, 
  FlaskConical, 
  Microscope, 
  Stethoscope, 
  Heart, 
  Dna,
  Plus
} from 'lucide-react';
import { AIAnalysisIntegration } from '@/lib/ai/ai-analysis-integration';

interface MLModel {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'detection' | 'segmentation' | 'regression' | 'generation';
  architecture: string;
  framework: 'tensorflow' | 'pytorch' | 'sklearn' | 'xgboost' | 'custom';
  status: 'training' | 'validating' | 'deployed' | 'failed' | 'archived';
  accuracy: number;
  loss: number;
  createdAt: Date;
  lastTraining: Date;
  datasetSize: number;
  parameters: number;
  trainingTime: number;
  author: string;
  description: string;
  tags: string[];
  metrics: ModelMetrics;
  deployment: DeploymentConfig;
}

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  loss: number;
  valLoss: number;
  epoch: number;
  confusionMatrix?: number[][];
  trainingHistory: TrainingHistory[];
}

interface TrainingHistory {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
  learningRate: number;
  timestamp: Date;
}

interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  replicas: number;
  resources: {
    cpu: string;
    memory: string;
    gpu?: string;
  };
  autoscaling: {
    enabled: boolean;
    minReplicas: number;
    maxReplicas: number;
    targetCPU: number;
  };
  endpoint: string;
  healthCheck: boolean;
  monitoring: boolean;
  logging: boolean;
}

interface TrainingJob {
  id: string;
  modelId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  config: TrainingConfig;
  logs: string[];
  metrics: TrainingMetrics;
  error?: string;
}

interface TrainingConfig {
  dataset: string;
  splitRatio: { train: number; validation: number; test: number };
  batchSize: number;
  epochs: number;
  learningRate: number;
  optimizer: 'adam' | 'sgd' | 'rmsprop' | 'adagrad';
  lossFunction: string;
  metrics: string[];
  callbacks: string[];
  regularization: {
    dropout: number;
    l1: number;
    l2: number;
  };
  augmentation: string[];
  preprocessing: string[];
}

interface TrainingMetrics {
  currentEpoch: number;
  totalEpochs: number;
  currentLoss: number;
  currentAccuracy: number;
  bestAccuracy: number;
  validationLoss: number;
  validationAccuracy: number;
  timePerEpoch: number;
  estimatedTimeRemaining: number;
  gpuUtilization: number;
  memoryUsage: number;
}

interface Dataset {
  id: string;
  name: string;
  description: string;
  type: 'images' | 'tabular' | 'text' | 'multimodal';
  size: number;
  samples: number;
  features: number;
  labels: string[];
  quality: 'high' | 'medium' | 'low';
  lastUpdated: Date;
  tags: string[];
  format: string;
  location: string;
  privacy: 'public' | 'private' | 'restricted';
}

const MachineLearningPipeline: React.FC = () => {
  const [models, setModels] = useState<MLModel[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [selectedJob, setSelectedJob] = useState<TrainingJob | null>(null);
  const [activeTab, setActiveTab] = useState('models');
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysisIntegration | null>(null);
  const [newModelConfig, setNewModelConfig] = useState({
    name: '',
    type: 'classification',
    architecture: 'cnn',
    framework: 'tensorflow',
    dataset: '',
    description: ''
  });
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    dataset: '',
    splitRatio: { train: 0.8, validation: 0.1, test: 0.1 },
    batchSize: 32,
    epochs: 100,
    learningRate: 0.001,
    optimizer: 'adam',
    lossFunction: 'categorical_crossentropy',
    metrics: ['accuracy'],
    callbacks: ['early_stopping', 'model_checkpoint'],
    regularization: { dropout: 0.5, l1: 0.01, l2: 0.01 },
    augmentation: ['rotation', 'flip', 'zoom'],
    preprocessing: ['normalization', 'resize']
  });
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    environment: 'development',
    replicas: 1,
    resources: { cpu: '1', memory: '2Gi', gpu: '1' },
    autoscaling: { enabled: false, minReplicas: 1, maxReplicas: 5, targetCPU: 80 },
    endpoint: '',
    healthCheck: true,
    monitoring: true,
    logging: true
  });

  useEffect(() => {
    const initializeMLPipeline = async () => {
      try {
        const ai = new AIAnalysisIntegration();
        setAIAnalysis(ai);
        await loadSampleData();
      } catch (error) {
        console.error('Failed to initialize ML pipeline:', error);
      }
    };

    initializeMLPipeline();
  }, []);

  const loadSampleData = async () => {
    // Load sample ML models
    const sampleModels: MLModel[] = [
      {
        id: 'model-1',
        name: 'Chest X-ray Classifier',
        version: '1.2.0',
        type: 'classification',
        architecture: 'ResNet50',
        framework: 'tensorflow',
        status: 'deployed',
        accuracy: 0.94,
        loss: 0.15,
        createdAt: new Date('2024-01-15'),
        lastTraining: new Date('2024-01-20'),
        datasetSize: 50000,
        parameters: 25000000,
        trainingTime: 7200,
        author: 'Dr. Smith',
        description: 'Classification model for chest X-ray pathology detection',
        tags: ['radiology', 'chest', 'classification'],
        metrics: {
          accuracy: 0.94,
          precision: 0.92,
          recall: 0.89,
          f1Score: 0.905,
          auc: 0.96,
          loss: 0.15,
          valLoss: 0.18,
          epoch: 85,
          trainingHistory: []
        },
        deployment: {
          environment: 'production',
          replicas: 3,
          resources: { cpu: '2', memory: '4Gi', gpu: '1' },
          autoscaling: { enabled: true, minReplicas: 2, maxReplicas: 10, targetCPU: 70 },
          endpoint: 'https://api.medsight.ai/models/chest-xray',
          healthCheck: true,
          monitoring: true,
          logging: true
        }
      },
      {
        id: 'model-2',
        name: 'Brain MRI Segmentation',
        version: '0.8.0',
        type: 'segmentation',
        architecture: 'U-Net',
        framework: 'pytorch',
        status: 'training',
        accuracy: 0.87,
        loss: 0.23,
        createdAt: new Date('2024-01-18'),
        lastTraining: new Date('2024-01-22'),
        datasetSize: 15000,
        parameters: 31000000,
        trainingTime: 14400,
        author: 'Dr. Johnson',
        description: 'Segmentation model for brain tumor detection in MRI scans',
        tags: ['neurology', 'mri', 'segmentation'],
        metrics: {
          accuracy: 0.87,
          precision: 0.85,
          recall: 0.88,
          f1Score: 0.865,
          auc: 0.91,
          loss: 0.23,
          valLoss: 0.25,
          epoch: 65,
          trainingHistory: []
        },
        deployment: {
          environment: 'staging',
          replicas: 1,
          resources: { cpu: '4', memory: '8Gi', gpu: '2' },
          autoscaling: { enabled: false, minReplicas: 1, maxReplicas: 3, targetCPU: 80 },
          endpoint: 'https://staging.medsight.ai/models/brain-mri',
          healthCheck: true,
          monitoring: true,
          logging: true
        }
      }
    ];

    const sampleJobs: TrainingJob[] = [
      {
        id: 'job-1',
        modelId: 'model-2',
        name: 'Brain MRI Segmentation Training',
        status: 'running',
        progress: 65,
        startTime: new Date('2024-01-22T10:00:00'),
        config: trainingConfig,
        logs: [
          'Starting training job...',
          'Loading dataset: brain_mri_dataset',
          'Dataset loaded: 15000 samples',
          'Training started with 65/100 epochs completed'
        ],
        metrics: {
          currentEpoch: 65,
          totalEpochs: 100,
          currentLoss: 0.23,
          currentAccuracy: 0.87,
          bestAccuracy: 0.89,
          validationLoss: 0.25,
          validationAccuracy: 0.85,
          timePerEpoch: 120,
          estimatedTimeRemaining: 4200,
          gpuUtilization: 85,
          memoryUsage: 6.5
        }
      }
    ];

    const sampleDatasets: Dataset[] = [
      {
        id: 'dataset-1',
        name: 'Chest X-ray Dataset',
        description: 'Large collection of chest X-ray images with pathology labels',
        type: 'images',
        size: 2500000000, // 2.5GB
        samples: 50000,
        features: 224*224*3,
        labels: ['normal', 'pneumonia', 'covid', 'tuberculosis'],
        quality: 'high',
        lastUpdated: new Date('2024-01-20'),
        tags: ['radiology', 'chest', 'xray'],
        format: 'DICOM',
        location: 's3://medsight-datasets/chest-xray',
        privacy: 'private'
      },
      {
        id: 'dataset-2',
        name: 'Brain MRI Dataset',
        description: 'Brain MRI scans with tumor segmentation masks',
        type: 'images',
        size: 1200000000, // 1.2GB
        samples: 15000,
        features: 256*256*3,
        labels: ['background', 'tumor', 'edema'],
        quality: 'high',
        lastUpdated: new Date('2024-01-18'),
        tags: ['neurology', 'mri', 'brain'],
        format: 'NIfTI',
        location: 's3://medsight-datasets/brain-mri',
        privacy: 'restricted'
      }
    ];

    setModels(sampleModels);
    setTrainingJobs(sampleJobs);
    setDatasets(sampleDatasets);
  };

  const startTraining = async () => {
    if (!newModelConfig.name || !newModelConfig.dataset) {
      console.error('Please provide model name and dataset');
      return;
    }

    setIsLoading(true);
    try {
      const newJob: TrainingJob = {
        id: `job-${Date.now()}`,
        modelId: `model-${Date.now()}`,
        name: `${newModelConfig.name} Training`,
        status: 'pending',
        progress: 0,
        startTime: new Date(),
        config: trainingConfig,
        logs: ['Training job created', 'Preparing dataset...'],
        metrics: {
          currentEpoch: 0,
          totalEpochs: trainingConfig.epochs,
          currentLoss: 0,
          currentAccuracy: 0,
          bestAccuracy: 0,
          validationLoss: 0,
          validationAccuracy: 0,
          timePerEpoch: 0,
          estimatedTimeRemaining: 0,
          gpuUtilization: 0,
          memoryUsage: 0
        }
      };

      setTrainingJobs(prev => [newJob, ...prev]);
      
      // Simulate training progress
      setTimeout(() => {
        setTrainingJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? { ...job, status: 'running', progress: 10 }
            : job
        ));
      }, 2000);

      console.log('Training started successfully');
    } catch (error) {
      console.error('Failed to start training:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deployModel = async (modelId: string) => {
    setIsLoading(true);
    try {
      // Simulate deployment
      setModels(prev => prev.map(model => 
        model.id === modelId 
          ? { ...model, status: 'deployed', deployment: { ...model.deployment, environment: deploymentConfig.environment } }
          : model
      ));
      
      console.log('Model deployed successfully');
    } catch (error) {
      console.error('Failed to deploy model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopTraining = async (jobId: string) => {
    setTrainingJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: 'cancelled', endTime: new Date() }
        : job
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'text-green-600';
      case 'training': return 'text-blue-600';
      case 'validating': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'running': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return CheckCircle;
      case 'training': return RefreshCw;
      case 'validating': return Clock;
      case 'failed': return XCircle;
      case 'running': return Play;
      case 'completed': return CheckCircle;
      case 'cancelled': return Square;
      default: return Clock;
    }
  };

  const ModelCard = ({ model }: { model: MLModel }) => {
    const StatusIcon = getStatusIcon(model.status);
    
    return (
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedModel(model)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{model.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusColor(model.status)}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {model.status}
              </Badge>
              <Badge variant="secondary">v{model.version}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">{model.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <span className="text-xs text-gray-500">Accuracy</span>
              <div className="font-semibold">{(model.accuracy * 100).toFixed(1)}%</div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Architecture</span>
              <div className="font-semibold">{model.architecture}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <span className="text-xs text-gray-500">Framework</span>
              <div className="font-semibold">{model.framework}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Parameters</span>
              <div className="font-semibold">{(model.parameters / 1000000).toFixed(1)}M</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {model.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Updated: {model.lastTraining.toLocaleDateString()}</span>
            <span>By: {model.author}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TrainingJobCard = ({ job }: { job: TrainingJob }) => {
    const StatusIcon = getStatusIcon(job.status);
    
    return (
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedJob(job)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{job.name}</CardTitle>
            <Badge variant="outline" className={getStatusColor(job.status)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {job.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {job.status === 'running' && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{job.progress}%</span>
              </div>
              <Progress value={job.progress} className="h-2" />
              <div className="text-xs text-gray-500 mt-1">
                Epoch {job.metrics.currentEpoch} / {job.metrics.totalEpochs}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <span className="text-xs text-gray-500">Accuracy</span>
              <div className="font-semibold">{(job.metrics.currentAccuracy * 100).toFixed(1)}%</div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Loss</span>
              <div className="font-semibold">{job.metrics.currentLoss.toFixed(3)}</div>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Started: {job.startTime.toLocaleString()}
          </div>
          
          {job.status === 'running' && (
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => stopTraining(job.id)}>
                <Square className="w-3 h-3 mr-1" />
                Stop
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const DatasetCard = ({ dataset }: { dataset: Dataset }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{dataset.name}</CardTitle>
          <Badge variant="outline">{dataset.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">{dataset.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <span className="text-xs text-gray-500">Samples</span>
            <div className="font-semibold">{dataset.samples.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Size</span>
            <div className="font-semibold">{(dataset.size / 1000000000).toFixed(1)}GB</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {dataset.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Quality: {dataset.quality}</span>
          <span>Updated: {dataset.lastUpdated.toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );

  const ModelsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">ML Models</h2>
        <Button onClick={() => setActiveTab('training')}>
          <Plus className="w-4 h-4 mr-2" />
          Train New Model
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}
      </div>

      {selectedModel && (
        <Card>
          <CardHeader>
            <CardTitle>Model Details - {selectedModel.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Performance Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Accuracy:</span>
                    <span className="font-semibold">{(selectedModel.metrics.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Precision:</span>
                    <span className="font-semibold">{(selectedModel.metrics.precision * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recall:</span>
                    <span className="font-semibold">{(selectedModel.metrics.recall * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>F1 Score:</span>
                    <span className="font-semibold">{(selectedModel.metrics.f1Score * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Deployment</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Environment:</span>
                    <Badge variant="outline">{selectedModel.deployment.environment}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Replicas:</span>
                    <span className="font-semibold">{selectedModel.deployment.replicas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resources:</span>
                    <span className="font-semibold text-xs">
                      {selectedModel.deployment.resources.cpu} CPU, {selectedModel.deployment.resources.memory}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => deployModel(selectedModel.id)}
                disabled={isLoading || selectedModel.status === 'deployed'}
              >
                <Cloud className="w-4 h-4 mr-2" />
                {selectedModel.status === 'deployed' ? 'Deployed' : 'Deploy'}
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline">
                <GitBranch className="w-4 h-4 mr-2" />
                Create Version
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const TrainingTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Training Jobs</h2>
        <Button onClick={startTraining} disabled={isLoading}>
          <Play className="w-4 h-4 mr-2" />
          Start Training
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>New Training Job</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model-name">Model Name</Label>
                <Input
                  id="model-name"
                  value={newModelConfig.name}
                  onChange={(e) => setNewModelConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter model name"
                />
              </div>
              <div>
                <Label htmlFor="model-type">Model Type</Label>
                <Select value={newModelConfig.type} onValueChange={(value) => setNewModelConfig(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="detection">Detection</SelectItem>
                    <SelectItem value="segmentation">Segmentation</SelectItem>
                    <SelectItem value="regression">Regression</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="architecture">Architecture</Label>
                <Select value={newModelConfig.architecture} onValueChange={(value) => setNewModelConfig(prev => ({ ...prev, architecture: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cnn">CNN</SelectItem>
                    <SelectItem value="resnet">ResNet</SelectItem>
                    <SelectItem value="vgg">VGG</SelectItem>
                    <SelectItem value="unet">U-Net</SelectItem>
                    <SelectItem value="transformer">Transformer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="framework">Framework</Label>
                <Select value={newModelConfig.framework} onValueChange={(value) => setNewModelConfig(prev => ({ ...prev, framework: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tensorflow">TensorFlow</SelectItem>
                    <SelectItem value="pytorch">PyTorch</SelectItem>
                    <SelectItem value="sklearn">Scikit-learn</SelectItem>
                    <SelectItem value="xgboost">XGBoost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="dataset">Dataset</Label>
              <Select value={newModelConfig.dataset} onValueChange={(value) => setNewModelConfig(prev => ({ ...prev, dataset: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={newModelConfig.description}
                onChange={(e) => setNewModelConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Model description"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="epochs">Epochs</Label>
                <Input
                  id="epochs"
                  type="number"
                  value={trainingConfig.epochs}
                  onChange={(e) => setTrainingConfig(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="batch-size">Batch Size</Label>
                <Input
                  id="batch-size"
                  type="number"
                  value={trainingConfig.batchSize}
                  onChange={(e) => setTrainingConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="learning-rate">Learning Rate</Label>
                <Input
                  id="learning-rate"
                  type="number"
                  step="0.001"
                  value={trainingConfig.learningRate}
                  onChange={(e) => setTrainingConfig(prev => ({ ...prev, learningRate: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="optimizer">Optimizer</Label>
                <Select value={trainingConfig.optimizer} onValueChange={(value) => setTrainingConfig(prev => ({ ...prev, optimizer: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adam">Adam</SelectItem>
                    <SelectItem value="sgd">SGD</SelectItem>
                    <SelectItem value="rmsprop">RMSprop</SelectItem>
                    <SelectItem value="adagrad">Adagrad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainingJobs.map((job) => (
          <TrainingJobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );

  const DatasetsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Datasets</h2>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Dataset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {datasets.map((dataset) => (
          <DatasetCard key={dataset.id} dataset={dataset} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="h-full backdrop-blur-sm bg-white/90 border border-white/20 rounded-xl shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">ML Pipeline</h1>
                <p className="text-gray-600">Model Training, Deployment & Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                {models.length} Models
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {trainingJobs.filter(j => j.status === 'running').length} Training
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                {datasets.length} Datasets
              </Badge>
            </div>
          </div>
        </div>

        <div className="h-[calc(100%-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="models" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Models
              </TabsTrigger>
              <TabsTrigger value="training" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Training
              </TabsTrigger>
              <TabsTrigger value="datasets" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Datasets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="models" className="h-full p-4">
              <div className="h-full overflow-auto">
                <ModelsTab />
              </div>
            </TabsContent>

            <TabsContent value="training" className="h-full p-4">
              <div className="h-full overflow-auto">
                <TrainingTab />
              </div>
            </TabsContent>

            <TabsContent value="datasets" className="h-full p-4">
              <div className="h-full overflow-auto">
                <DatasetsTab />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MachineLearningPipeline; 