'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../shared/components/ui/Card';
import { Button } from '../../../../../shared/components/ui/Button';
import { Badge } from '../../../../../shared/components/ui/Badge';
import { Progress } from '../../../../../shared/components/ui/Progress';
import { Input } from '../../../../../shared/components/ui/Input';
import { Label } from '../../../../../shared/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../shared/components/ui/Select';
import { Slider } from '../../../../../shared/components/ui/Slider';
import { Switch } from '../../../../../shared/components/ui/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../shared/components/ui/Tabs';
import { 
  Brain, Bot, Play, Pause, Settings, BarChart3, Eye, 
  TrendingUp, Target, CheckCircle, AlertCircle, Clock, Users,
  Image, FileText, Video, Cpu, Zap, Activity, Database, 
  RefreshCw, Download, Upload, Plus, Filter, Search
} from 'lucide-react';
import React from 'react';

interface AIModel {
  id: string;
  name: string;
  type: 'object_detection' | 'segmentation' | 'classification' | 'ocr' | 'custom';
  version: string;
  accuracy: number;
  speed: number;
  status: 'active' | 'inactive' | 'training' | 'error';
  description: string;
  supportedFormats: string[];
  lastUpdated: string;
  usageCount: number;
  confidenceThreshold: number;
  modelSize: number;
  trainingData: string;
}

interface PreAnnotationJob {
  id: string;
  name: string;
  modelId: string;
  modelName: string;
  dataset: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalImages: number;
  processedImages: number;
  annotationsGenerated: number;
  confidenceThreshold: number;
  qualityScore: number;
  startTime: string;
  endTime?: string;
  duration: number;
  errors: string[];
  createdBy: string;
}

const mockAIModels: AIModel[] = [
  {
    id: 'MODEL-001',
    name: 'YOLOv8 Object Detection',
    type: 'object_detection',
    version: '8.0.0',
    accuracy: 94.2,
    speed: 85,
    status: 'active',
    description: 'High-performance object detection model for general use',
    supportedFormats: ['jpg', 'png', 'bmp', 'tiff'],
    lastUpdated: '2024-01-15T10:00:00Z',
    usageCount: 1250,
    confidenceThreshold: 0.75,
    modelSize: 45.2,
    trainingData: 'COCO Dataset + Custom Medical Images'
  },
  {
    id: 'MODEL-002',
    name: 'Mask R-CNN Segmentation',
    type: 'segmentation',
    version: '2.1.0',
    accuracy: 91.8,
    speed: 65,
    status: 'active',
    description: 'Instance segmentation model for precise object boundaries',
    supportedFormats: ['jpg', 'png', 'tiff'],
    lastUpdated: '2024-01-14T15:30:00Z',
    usageCount: 890,
    confidenceThreshold: 0.80,
    modelSize: 78.5,
    trainingData: 'Medical Segmentation Dataset'
  },
  {
    id: 'MODEL-003',
    name: 'Medical OCR Specialist',
    type: 'ocr',
    version: '1.5.2',
    accuracy: 97.5,
    speed: 92,
    status: 'active',
    description: 'Specialized OCR for medical documents and forms',
    supportedFormats: ['jpg', 'png', 'pdf', 'tiff'],
    lastUpdated: '2024-01-13T12:00:00Z',
    usageCount: 456,
    confidenceThreshold: 0.85,
    modelSize: 32.8,
    trainingData: 'Medical Text Recognition Dataset'
  },
  {
    id: 'MODEL-004',
    name: 'Custom Vision Classifier',
    type: 'classification',
    version: '3.2.1',
    accuracy: 89.3,
    speed: 78,
    status: 'training',
    description: 'Custom image classification model being trained',
    supportedFormats: ['jpg', 'png'],
    lastUpdated: '2024-01-15T08:00:00Z',
    usageCount: 234,
    confidenceThreshold: 0.70,
    modelSize: 56.7,
    trainingData: 'Custom Dataset - Batch 001'
  }
];

const mockPreAnnotationJobs: PreAnnotationJob[] = [
  {
    id: 'JOB-001',
    name: 'Medical Images Batch 1',
    modelId: 'MODEL-001',
    modelName: 'YOLOv8 Object Detection',
    dataset: 'medical_images_01',
    status: 'running',
    progress: 67,
    totalImages: 1500,
    processedImages: 1005,
    annotationsGenerated: 15670,
    confidenceThreshold: 0.75,
    qualityScore: 92.3,
    startTime: '2024-01-15T09:00:00Z',
    duration: 3600,
    errors: [],
    createdBy: 'annotator@company.com'
  },
  {
    id: 'JOB-002',
    name: 'Document Processing',
    modelId: 'MODEL-003',
    modelName: 'Medical OCR Specialist',
    dataset: 'documents_batch_02',
    status: 'completed',
    progress: 100,
    totalImages: 850,
    processedImages: 850,
    annotationsGenerated: 12450,
    confidenceThreshold: 0.85,
    qualityScore: 96.8,
    startTime: '2024-01-15T07:00:00Z',
    endTime: '2024-01-15T09:30:00Z',
    duration: 9000,
    errors: [],
    createdBy: 'admin@company.com'
  },
  {
    id: 'JOB-003',
    name: 'Segmentation Task',
    modelId: 'MODEL-002',
    modelName: 'Mask R-CNN Segmentation',
    dataset: 'segmentation_data',
    status: 'failed',
    progress: 23,
    totalImages: 600,
    processedImages: 138,
    annotationsGenerated: 890,
    confidenceThreshold: 0.80,
    qualityScore: 0,
    startTime: '2024-01-15T10:30:00Z',
    duration: 1800,
    errors: ['Model timeout', 'Insufficient memory'],
    createdBy: 'user@company.com'
  }
];

export default function PreAnnotationPanel() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [models, setModels] = useState<AIModel[]>(mockAIModels);
  const [jobs, setJobs] = useState<PreAnnotationJob[]>(mockPreAnnotationJobs);
  const [selectedModel, setSelectedModel] = useState<string>('MODEL-001');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.75);
  const [batchSize, setBatchSize] = useState(100);
  const [autoProcessing, setAutoProcessing] = useState(false);
  const [qualityCheck, setQualityCheck] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Real-time job updates
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prev => prev.map(job => {
        if (job.status === 'running') {
          const newProgress = Math.min(100, job.progress + Math.random() * 2);
          const newProcessed = Math.floor((newProgress / 100) * job.totalImages);
          return {
            ...job,
            progress: newProgress,
            processedImages: newProcessed,
            annotationsGenerated: job.annotationsGenerated + Math.floor(Math.random() * 10),
            duration: job.duration + 5
          };
        }
        return job;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || model.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || model.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const metrics = {
    totalModels: models.length,
    activeModels: models.filter(m => m.status === 'active').length,
    runningJobs: jobs.filter(j => j.status === 'running').length,
    completedJobs: jobs.filter(j => j.status === 'completed').length,
    totalAnnotations: jobs.reduce((sum, j) => sum + j.annotationsGenerated, 0),
    avgAccuracy: Math.round(models.reduce((sum, m) => sum + m.accuracy, 0) / models.length),
    avgQuality: Math.round(jobs.filter(j => j.status === 'completed').reduce((sum, j) => sum + j.qualityScore, 0) / jobs.filter(j => j.status === 'completed').length)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'training': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'object_detection': return <Target className="w-4 h-4" />;
      case 'segmentation': return <Image className="w-4 h-4" />;
      case 'classification': return <CheckCircle className="w-4 h-4" />;
      case 'ocr': return <FileText className="w-4 h-4" />;
      case 'custom': return <Bot className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const handleStartJob = () => {
    const newJob: PreAnnotationJob = {
      id: `JOB-${Date.now()}`,
      name: `Pre-annotation Job ${Date.now()}`,
      modelId: selectedModel,
      modelName: models.find(m => m.id === selectedModel)?.name || 'Unknown',
      dataset: 'new_dataset',
      status: 'pending',
      progress: 0,
      totalImages: batchSize,
      processedImages: 0,
      annotationsGenerated: 0,
      confidenceThreshold: confidenceThreshold,
      qualityScore: 0,
      startTime: new Date().toISOString(),
      duration: 0,
      errors: [],
      createdBy: 'current_user@company.com'
    };
    setJobs([newJob, ...jobs]);
  };

  const handleJobAction = (jobId: string, action: 'cancel' | 'retry' | 'delete') => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: action === 'cancel' ? 'cancelled' : job.status }
        : job
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pre-Annotation Engine</h2>
          <p className="text-gray-600">AI-powered automatic annotation system</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch checked={autoProcessing} onCheckedChange={setAutoProcessing} />
            <Label>Auto Processing</Label>
          </div>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Dataset
          </Button>
          <Button size="sm" onClick={handleStartJob}>
            <Play className="w-4 h-4 mr-2" />
            Start Job
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="object_detection">Object Detection</SelectItem>
              <SelectItem value="segmentation">Segmentation</SelectItem>
              <SelectItem value="classification">Classification</SelectItem>
              <SelectItem value="ocr">OCR</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="configure">Configure</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeModels}</div>
                <p className="text-xs text-green-600">
                  <Brain className="h-3 w-3 inline mr-1" />
                  {metrics.activeModels} of {metrics.totalModels} models
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Running Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.runningJobs}</div>
                <p className="text-xs text-blue-600">
                  <Activity className="h-3 w-3 inline mr-1" />
                  Currently processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Annotations Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalAnnotations.toLocaleString()}</div>
                <p className="text-xs text-purple-600">
                  <Target className="h-3 w-3 inline mr-1" />
                  Total annotations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.avgQuality}%</div>
                <p className="text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  Quality score
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
                <CardDescription>Configure and start a new pre-annotation job</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="quick-model">Select Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {models.filter(m => m.status === 'active').map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.accuracy}% accuracy)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Confidence Threshold: {confidenceThreshold}</Label>
                  <Slider
                    value={[confidenceThreshold]}
                    onValueChange={(value) => setConfidenceThreshold(value[0])}
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(parseInt(e.target.value))}
                    min="1"
                    max="1000"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={qualityCheck} onCheckedChange={setQualityCheck} />
                  <Label>Quality Check</Label>
                </div>
                <Button onClick={handleStartJob} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Start Pre-Annotation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobs.slice(0, 5).map(job => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div>
                          <div className="font-medium text-sm">{job.name}</div>
                          <div className="text-xs text-gray-500">
                            {job.modelName} • {job.processedImages}/{job.totalImages} images
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        {job.status === 'running' && (
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(job.progress)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Models</CardTitle>
              <CardDescription>Available models for pre-annotation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredModels.map(model => (
                  <div key={model.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(model.type)}
                        <h3 className="font-semibold">{model.name}</h3>
                      </div>
                      <Badge className={getStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Accuracy:</span>
                        <span className="ml-2 font-medium">{model.accuracy}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Speed:</span>
                        <span className="ml-2 font-medium">{model.speed}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Version:</span>
                        <span className="ml-2 font-medium">{model.version}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <span className="ml-2 font-medium">{model.modelSize}MB</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center space-x-2">
                      <Progress value={model.accuracy} className="flex-1 h-2" />
                      <span className="text-xs text-gray-500">{model.usageCount} uses</span>
                    </div>
                    <div className="mt-3 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Annotation Jobs</CardTitle>
              <CardDescription>Monitor and manage annotation jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{job.name}</h3>
                        <p className="text-sm text-gray-600">
                          {job.modelName} • Dataset: {job.dataset}
                        </p>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Progress:</span>
                        <span className="ml-2 font-medium">{Math.round(job.progress)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Images:</span>
                        <span className="ml-2 font-medium">{job.processedImages}/{job.totalImages}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Annotations:</span>
                        <span className="ml-2 font-medium">{job.annotationsGenerated}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Quality:</span>
                        <span className="ml-2 font-medium">{job.qualityScore}%</span>
                      </div>
                    </div>

                    {job.status === 'running' && (
                      <div className="mb-3">
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}

                    {job.errors.length > 0 && (
                      <div className="mb-3">
                        <div className="bg-red-50 border border-red-200 rounded p-2">
                          <div className="text-sm font-medium text-red-800">Errors:</div>
                          {job.errors.map((error, index) => (
                            <div key={index} className="text-sm text-red-700">• {error}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Started: {new Date(job.startTime).toLocaleString()}
                        {job.endTime && ` • Completed: ${new Date(job.endTime).toLocaleString()}`}
                      </div>
                      <div className="flex space-x-2">
                        {job.status === 'running' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleJobAction(job.id, 'cancel')}
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {job.status === 'failed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleJobAction(job.id, 'retry')}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configure Tab */}
        <TabsContent value="configure" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="default-model">Default Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {models.filter(m => m.status === 'active').map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Default Confidence Threshold: {confidenceThreshold}</Label>
                  <Slider
                    value={[confidenceThreshold]}
                    onValueChange={(value) => setConfidenceThreshold(value[0])}
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="default-batch">Default Batch Size</Label>
                  <Input
                    id="default-batch"
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(parseInt(e.target.value))}
                    min="1"
                    max="1000"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={autoProcessing} onCheckedChange={setAutoProcessing} />
                  <Label>Auto Processing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={qualityCheck} onCheckedChange={setQualityCheck} />
                  <Label>Quality Check</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="max-jobs">Max Concurrent Jobs</Label>
                  <Input
                    id="max-jobs"
                    type="number"
                    placeholder="5"
                    min="1"
                    max="20"
                  />
                </div>
                <div>
                  <Label htmlFor="timeout">Job Timeout (minutes)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    placeholder="60"
                    min="1"
                    max="1440"
                  />
                </div>
                <div>
                  <Label htmlFor="retry-limit">Retry Limit</Label>
                  <Input
                    id="retry-limit"
                    type="number"
                    placeholder="3"
                    min="0"
                    max="10"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Default Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {models.map(model => (
                    <div key={model.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{model.name}</h4>
                        <Badge variant="outline">{model.type}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Accuracy:</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={model.accuracy} className="flex-1 h-2" />
                            <span className="text-xs">{model.accuracy}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Speed:</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={model.speed} className="flex-1 h-2" />
                            <span className="text-xs">{model.speed}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Used {model.usageCount} times
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{metrics.completedJobs}</div>
                      <div className="text-sm text-gray-600">Completed Jobs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{metrics.runningJobs}</div>
                      <div className="text-sm text-gray-600">Running Jobs</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span className="font-medium">
                        {Math.round((metrics.completedJobs / jobs.length) * 100)}%
                      </span>
                    </div>
                    <Progress value={(metrics.completedJobs / jobs.length) * 100} className="h-2" />
                  </div>
                  <div className="text-center pt-4">
                    <div className="text-lg font-bold text-purple-600">
                      {metrics.totalAnnotations.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Annotations Generated</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 