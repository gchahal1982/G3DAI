'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Badge, 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger, 
  Progress, 
  Alert, 
  AlertDescription, 
  ScrollArea, 
  Switch, 
  Slider, 
  Input, 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  Textarea, 
  Separator 
} from '../../../../../../shared/components/ui';
import { 
  Target, 
  Brain, 
  Zap, 
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Square,
  RefreshCw,
  Settings,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Info,
  HelpCircle,
  Timer,
  Gauge,
  Network,
  GitBranch,
  ArrowRight,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  Save,
  Download,
  Upload,
  Filter,
  Search,
  X,
  Lock,
  Unlock,
  Sparkles,
  Database,
  FileText,
  PieChart,
  BarChart,
  LineChart,
  Layers,
  Users,
  Clock,
  DollarSign,
  Cpu,
  MemoryStick,
  MousePointer,
  Crosshair,
  Maximize,
  Minimize,
  RotateCcw,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Lightbulb,
  Star,
  Heart,
  Bookmark,
  Flag,
  Bell,
  Calendar,
  Globe,
  MapPin,
  Building,
  Briefcase,
  GraduationCap,
  Folder,
  Archive,
  ExternalLink,
  Share,
  Copy,
  Edit,
  Trash2,
  MoreHorizontal,
  Package,
  Box,
  Image,
  Video,
  Monitor,
  Smartphone,
  Camera,
  Mic,
  Speaker,
  Headphones
} from 'lucide-react';

// Types for pre-annotation workspace
interface PreAnnotationProject {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'training' | 'ready' | 'deployed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  modelConfig: ModelConfiguration;
  dataset: DatasetInfo;
  performance: ModelPerformance;
  deployment: DeploymentInfo;
  owner: string;
  tags: string[];
  shared: boolean;
}

interface ModelConfiguration {
  modelType: 'yolo' | 'rcnn' | 'ssd' | 'efficientdet' | 'detr' | 'custom';
  architecture: string;
  inputSize: { width: number; height: number };
  classes: ClassDefinition[];
  confidenceThreshold: number;
  nmsThreshold: number;
  maxDetections: number;
  batchSize: number;
  epochs: number;
  learningRate: number;
  augmentation: AugmentationConfig;
  optimization: OptimizationConfig;
}

interface ClassDefinition {
  id: number;
  name: string;
  color: string;
  description: string;
  examples: number;
  priority: 'high' | 'medium' | 'low';
}

interface AugmentationConfig {
  enabled: boolean;
  rotation: { min: number; max: number };
  scale: { min: number; max: number };
  brightness: { min: number; max: number };
  contrast: { min: number; max: number };
  saturation: { min: number; max: number };
  hue: { min: number; max: number };
  blur: { kernel: number; probability: number };
  noise: { sigma: number; probability: number };
  flipHorizontal: boolean;
  flipVertical: boolean;
}

interface OptimizationConfig {
  optimizer: 'adam' | 'sgd' | 'rmsprop' | 'adamw';
  weightDecay: number;
  momentum: number;
  scheduler: 'cosine' | 'step' | 'exponential' | 'plateau';
  warmupEpochs: number;
  mixedPrecision: boolean;
  gradientClipping: number;
}

interface DatasetInfo {
  id: string;
  name: string;
  totalImages: number;
  annotatedImages: number;
  classes: number;
  format: 'coco' | 'yolo' | 'pascal' | 'custom';
  splits: {
    train: number;
    validation: number;
    test: number;
  };
  statistics: DatasetStatistics;
}

interface DatasetStatistics {
  imageResolutions: { width: number; height: number; count: number }[];
  classDistribution: { className: string; count: number; percentage: number }[];
  annotationDensity: { avg: number; min: number; max: number };
  qualityMetrics: QualityMetrics;
}

interface QualityMetrics {
  completeness: number;
  consistency: number;
  accuracy: number;
  coverage: number;
  balance: number;
  redundancy: number;
}

interface ModelPerformance {
  trainingMetrics: TrainingMetrics;
  validationMetrics: ValidationMetrics;
  benchmarkResults: BenchmarkResult[];
  convergenceStatus: 'converged' | 'improving' | 'stagnant' | 'diverging';
}

interface TrainingMetrics {
  loss: number[];
  accuracy: number[];
  precision: number[];
  recall: number[];
  f1Score: number[];
  mAP: number[];
  learningRate: number[];
  epochs: number;
}

interface ValidationMetrics {
  loss: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mAP: number;
  mAP50: number;
  mAP75: number;
  confusionMatrix: number[][];
}

interface BenchmarkResult {
  dataset: string;
  metric: string;
  value: number;
  rank: number;
  comparison: 'better' | 'worse' | 'similar';
}

interface DeploymentInfo {
  status: 'not_deployed' | 'deploying' | 'deployed' | 'failed';
  endpoint?: string;
  version: string;
  instances: number;
  performance: DeploymentPerformance;
  monitoring: MonitoringInfo;
}

interface DeploymentPerformance {
  latency: number;
  throughput: number;
  cpuUsage: number;
  memoryUsage: number;
  gpuUsage: number;
  errorRate: number;
}

interface MonitoringInfo {
  enabled: boolean;
  alerts: AlertRule[];
  logs: LogEntry[];
  metrics: MetricPoint[];
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  metadata: Record<string, any>;
}

interface MetricPoint {
  timestamp: Date;
  metric: string;
  value: number;
  tags: Record<string, string>;
}

interface WorkflowAutomation {
  id: string;
  name: string;
  description: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  enabled: boolean;
  schedule?: ScheduleConfig;
  conditions: WorkflowCondition[];
}

interface WorkflowTrigger {
  type: 'dataset_update' | 'model_ready' | 'performance_threshold' | 'schedule' | 'manual';
  config: Record<string, any>;
}

interface WorkflowAction {
  type: 'train_model' | 'deploy_model' | 'send_notification' | 'backup_data' | 'run_evaluation';
  config: Record<string, any>;
  order: number;
}

interface ScheduleConfig {
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time: string;
  timezone: string;
  enabled: boolean;
}

interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  components: ComponentHealth[];
  resources: ResourceUsage;
  issues: SystemIssue[];
  recommendations: string[];
}

interface ComponentHealth {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime: number;
  lastCheck: Date;
  metrics: Record<string, number>;
}

interface ResourceUsage {
  cpu: number;
  memory: number;
  disk: number;
  gpu: number;
  network: number;
}

interface SystemIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  description: string;
  firstSeen: Date;
  lastSeen: Date;
  occurrences: number;
  resolved: boolean;
  resolution?: string;
}

export default function PreAnnotationWorkspace() {
  // State management
  const [projects, setProjects] = useState<PreAnnotationProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<PreAnnotationProject | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowAutomation[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [activeTab, setActiveTab] = useState('projects');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'training' | 'ready' | 'deployed' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'performance'>('updated');
  
  // Project creation state
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProject, setNewProject] = useState<Partial<PreAnnotationProject>>({
    name: '',
    description: '',
    tags: [],
    shared: false
  });

  // Backend references
  const preAnnotationEngineRef = useRef<any>(null);

  // Initialize workspace
  useEffect(() => {
    const initializeWorkspace = async () => {
      try {
        // Mock initialization - replace with actual backend
        preAnnotationEngineRef.current = {
          createProject: async (config: any) => {
            return generateMockProject(config);
          },
          trainModel: async (projectId: string) => {
            return generateMockTrainingResult();
          },
          deployModel: async (projectId: string) => {
            return generateMockDeploymentResult();
          },
          getSystemHealth: () => {
            return generateMockSystemHealth();
          }
        };

        // Load initial data
        setProjects(generateMockProjects());
        setWorkflows(generateMockWorkflows());
        setSystemHealth(generateMockSystemHealth());
        
      } catch (error) {
        console.error('Failed to initialize pre-annotation workspace:', error);
        setError('Failed to initialize workspace');
      }
    };

    initializeWorkspace();
  }, []);

  // Create new project
  const createProject = useCallback(async () => {
    if (!newProject.name) return;

    setLoading(true);
    try {
      const project = await preAnnotationEngineRef.current?.createProject(newProject);
      setProjects(prev => [project, ...prev]);
      setNewProject({ name: '', description: '', tags: [], shared: false });
      setShowNewProjectDialog(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      setError('Failed to create project');
    } finally {
      setLoading(false);
    }
  }, [newProject]);

  // Start model training
  const startTraining = useCallback(async (project: PreAnnotationProject) => {
    setLoading(true);
    try {
      setProjects(prev => prev.map(p => 
        p.id === project.id ? { ...p, status: 'training' as const, updatedAt: new Date() } : p
      ));

      // Simulate training
      setTimeout(() => {
        setProjects(prev => prev.map(p => 
          p.id === project.id ? { 
            ...p, 
            status: 'ready' as const, 
            updatedAt: new Date(),
            performance: generateMockPerformance()
          } : p
        ));
      }, 5000);

    } catch (error) {
      console.error('Failed to start training:', error);
      setError('Failed to start training');
    } finally {
      setLoading(false);
    }
  }, []);

  // Deploy model
  const deployModel = useCallback(async (project: PreAnnotationProject) => {
    setLoading(true);
    try {
      const deployment = await preAnnotationEngineRef.current?.deployModel(project.id);
      setProjects(prev => prev.map(p => 
        p.id === project.id ? { 
          ...p, 
          status: 'deployed' as const, 
          deployment,
          updatedAt: new Date()
        } : p
      ));
    } catch (error) {
      console.error('Failed to deploy model:', error);
      setError('Failed to deploy model');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'updated':
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      case 'performance':
        const aPerf = a.performance?.validationMetrics?.mAP || 0;
        const bPerf = b.performance?.validationMetrics?.mAP || 0;
        return bPerf - aPerf;
      default:
        return 0;
    }
  });

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'training': return 'bg-blue-500 animate-pulse';
      case 'ready': return 'bg-green-500';
      case 'deployed': return 'bg-purple-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Mock data generators
  const generateMockProjects = (): PreAnnotationProject[] => {
    return [
      {
        id: 'proj_1',
        name: 'Object Detection Model',
        description: 'General purpose object detection for common objects',
        status: 'deployed',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        modelConfig: generateMockModelConfig(),
        dataset: generateMockDataset(),
        performance: generateMockPerformance(),
        deployment: generateMockDeployment(),
        owner: 'current-user',
        tags: ['object-detection', 'general'],
        shared: true
      },
      {
        id: 'proj_2',
        name: 'Medical Image Classifier',
        description: 'Specialized classifier for medical imaging',
        status: 'training',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        modelConfig: generateMockModelConfig(),
        dataset: generateMockDataset(),
        performance: generateMockPerformance(),
        deployment: generateMockDeployment(),
        owner: 'current-user',
        tags: ['medical', 'classification'],
        shared: false
      }
    ];
  };

  const generateMockModelConfig = (): ModelConfiguration => ({
    modelType: 'yolo',
    architecture: 'YOLOv8',
    inputSize: { width: 640, height: 640 },
    classes: [
      { id: 0, name: 'person', color: '#ff0000', description: 'Human person', examples: 1000, priority: 'high' },
      { id: 1, name: 'car', color: '#00ff00', description: 'Motor vehicle', examples: 800, priority: 'high' }
    ],
    confidenceThreshold: 0.5,
    nmsThreshold: 0.4,
    maxDetections: 100,
    batchSize: 16,
    epochs: 100,
    learningRate: 0.001,
    augmentation: {
      enabled: true,
      rotation: { min: -15, max: 15 },
      scale: { min: 0.8, max: 1.2 },
      brightness: { min: 0.8, max: 1.2 },
      contrast: { min: 0.8, max: 1.2 },
      saturation: { min: 0.8, max: 1.2 },
      hue: { min: -10, max: 10 },
      blur: { kernel: 3, probability: 0.1 },
      noise: { sigma: 0.01, probability: 0.1 },
      flipHorizontal: true,
      flipVertical: false
    },
    optimization: {
      optimizer: 'adam',
      weightDecay: 0.0005,
      momentum: 0.9,
      scheduler: 'cosine',
      warmupEpochs: 5,
      mixedPrecision: true,
      gradientClipping: 10.0
    }
  });

  const generateMockDataset = (): DatasetInfo => ({
    id: 'dataset_1',
    name: 'COCO Training Set',
    totalImages: 118287,
    annotatedImages: 117266,
    classes: 80,
    format: 'coco',
    splits: { train: 0.8, validation: 0.1, test: 0.1 },
    statistics: {
      imageResolutions: [
        { width: 640, height: 480, count: 45000 },
        { width: 1920, height: 1080, count: 35000 },
        { width: 1280, height: 720, count: 38287 }
      ],
      classDistribution: [
        { className: 'person', count: 15000, percentage: 25.5 },
        { className: 'car', count: 12000, percentage: 20.4 }
      ],
      annotationDensity: { avg: 3.2, min: 1, max: 15 },
      qualityMetrics: {
        completeness: 0.92,
        consistency: 0.88,
        accuracy: 0.95,
        coverage: 0.86,
        balance: 0.73,
        redundancy: 0.15
      }
    }
  });

  const generateMockPerformance = (): ModelPerformance => ({
    trainingMetrics: {
      loss: Array.from({ length: 100 }, (_, i) => 0.8 - (i * 0.007) + Math.random() * 0.1),
      accuracy: Array.from({ length: 100 }, (_, i) => 0.6 + (i * 0.003) + Math.random() * 0.05),
      precision: Array.from({ length: 100 }, (_, i) => 0.65 + (i * 0.0025) + Math.random() * 0.05),
      recall: Array.from({ length: 100 }, (_, i) => 0.62 + (i * 0.0028) + Math.random() * 0.05),
      f1Score: Array.from({ length: 100 }, (_, i) => 0.63 + (i * 0.0026) + Math.random() * 0.05),
      mAP: Array.from({ length: 100 }, (_, i) => 0.45 + (i * 0.004) + Math.random() * 0.05),
      learningRate: Array.from({ length: 100 }, (_, i) => 0.001 * Math.cos(i * Math.PI / 100)),
      epochs: 100
    },
    validationMetrics: {
      loss: 0.25,
      accuracy: 0.89,
      precision: 0.87,
      recall: 0.85,
      f1Score: 0.86,
      mAP: 0.82,
      mAP50: 0.91,
      mAP75: 0.78,
      confusionMatrix: [
        [850, 50, 25, 75],
        [45, 920, 15, 20],
        [30, 20, 890, 60],
        [65, 25, 45, 865]
      ]
    },
    benchmarkResults: [
      { dataset: 'COCO', metric: 'mAP', value: 0.82, rank: 3, comparison: 'better' },
      { dataset: 'Open Images', metric: 'mAP50', value: 0.91, rank: 2, comparison: 'better' }
    ],
    convergenceStatus: 'converged'
  });

  const generateMockDeployment = (): DeploymentInfo => ({
    status: 'deployed',
    endpoint: 'https://api.annotateai.com/models/pre-annotation/v1',
    version: '1.2.3',
    instances: 3,
    performance: {
      latency: 45,
      throughput: 120,
      cpuUsage: 65,
      memoryUsage: 2.8,
      gpuUsage: 78,
      errorRate: 0.02
    },
    monitoring: {
      enabled: true,
      alerts: [
        { id: 'alert_1', name: 'High Latency', condition: 'latency > 100ms', threshold: 100, severity: 'medium', enabled: true },
        { id: 'alert_2', name: 'Error Rate', condition: 'error_rate > 5%', threshold: 0.05, severity: 'high', enabled: true }
      ],
      logs: [
        { timestamp: new Date(), level: 'info', message: 'Model inference completed successfully', metadata: {} },
        { timestamp: new Date(Date.now() - 60000), level: 'warning', message: 'Elevated response time detected', metadata: {} }
      ],
      metrics: [
        { timestamp: new Date(), metric: 'latency', value: 45, tags: { instance: 'prod-1' } },
        { timestamp: new Date(), metric: 'throughput', value: 120, tags: { instance: 'prod-1' } }
      ]
    }
  });

  const generateMockWorkflows = (): WorkflowAutomation[] => [
    {
      id: 'workflow_1',
      name: 'Auto Retrain on Data Update',
      description: 'Automatically retrain model when new annotated data is available',
      triggers: [{ type: 'dataset_update', config: { threshold: 1000 } }],
      actions: [
        { type: 'train_model', config: { auto_deploy: false }, order: 1 },
        { type: 'send_notification', config: { channels: ['email', 'slack'] }, order: 2 }
      ],
      enabled: true,
      conditions: [{ field: 'data_quality', operator: 'greater_than', value: 0.8 }]
    }
  ];

  const generateMockSystemHealth = (): SystemHealth => ({
    overall: 'healthy',
    components: [
      { name: 'Training Service', status: 'healthy', uptime: 99.9, lastCheck: new Date(), metrics: { response_time: 45 } },
      { name: 'Inference API', status: 'healthy', uptime: 99.8, lastCheck: new Date(), metrics: { response_time: 12 } },
      { name: 'Data Pipeline', status: 'warning', uptime: 98.5, lastCheck: new Date(), metrics: { response_time: 120 } }
    ],
    resources: { cpu: 65, memory: 78, disk: 45, gpu: 82, network: 23 },
    issues: [
      {
        id: 'issue_1',
        severity: 'medium',
        component: 'Data Pipeline',
        description: 'Occasional timeout in data processing',
        firstSeen: new Date(Date.now() - 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
        occurrences: 3,
        resolved: false
      }
    ],
    recommendations: [
      'Consider scaling up GPU instances for faster training',
      'Optimize data pipeline for better performance',
      'Review alert thresholds for reduced noise'
    ]
  });

  const generateMockProject = (config: any): PreAnnotationProject => ({
    id: `proj_${Date.now()}`,
    name: config.name,
    description: config.description || '',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    modelConfig: generateMockModelConfig(),
    dataset: generateMockDataset(),
    performance: generateMockPerformance(),
    deployment: generateMockDeployment(),
    owner: 'current-user',
    tags: config.tags || [],
    shared: config.shared || false
  });

  const generateMockTrainingResult = () => ({
    success: true,
    duration: 300000,
    epochs: 100,
    finalMetrics: { mAP: 0.85, accuracy: 0.91 }
  });

  const generateMockDeploymentResult = () => ({
    success: true,
    endpoint: 'https://api.annotateai.com/models/pre-annotation/v2',
    version: '2.0.0'
  });

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            Pre-Annotation Workspace
          </h1>
          <p className="text-gray-600 mt-1">
            Manage AI models for automated pre-annotation and quality control
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowNewProjectDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* System Health Alert */}
      {systemHealth && systemHealth.overall !== 'healthy' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            System health: {systemHealth.overall}. Check the System Health tab for details.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Training
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="deployed">Deployed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">Last Updated</SelectItem>
                    <SelectItem value="created">Created Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedProjects.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    </div>
                    <Badge className={`${getStatusColor(project.status)} text-white`}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Dataset Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dataset:</span>
                      <span className="font-medium">{project.dataset.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Images:</span>
                      <span className="font-medium">{project.dataset.totalImages.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Classes:</span>
                      <span className="font-medium">{project.dataset.classes}</span>
                    </div>
                  </div>

                  {/* Performance */}
                  {project.performance && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">mAP:</span>
                        <span className="font-medium">
                          {(project.performance.validationMetrics.mAP * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={project.performance.validationMetrics.mAP * 100} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Tags */}
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {project.status === 'draft' && (
                      <Button 
                        size="sm" 
                        onClick={() => startTraining(project)}
                        disabled={loading}
                        className="flex-1"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Train
                      </Button>
                    )}
                    {project.status === 'ready' && (
                      <Button 
                        size="sm" 
                        onClick={() => deployModel(project)}
                        disabled={loading}
                        className="flex-1"
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Deploy
                      </Button>
                    )}
                    {project.status === 'deployed' && (
                      <Button size="sm" variant="outline" className="flex-1">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Monitor
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Model Training Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Training Center</h3>
                <p className="text-gray-600 mb-4">Configure and manage model training parameters</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Training
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Training Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average mAP</span>
                    <span className="font-bold text-green-600">82.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Best Model</span>
                    <span className="font-bold">YOLOv8-L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Training Time</span>
                    <span className="font-bold">4.2h avg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deployment Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Models</span>
                    <span className="font-bold text-blue-600">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Latency</span>
                    <span className="font-bold">45ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Throughput</span>
                    <span className="font-bold">120 req/s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data Quality</span>
                    <span className="font-bold text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coverage</span>
                    <span className="font-bold">86%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consistency</span>
                    <span className="font-bold">88%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Workflow Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{workflow.name}</h3>
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={workflow.enabled ? 'bg-green-500' : 'bg-gray-500'}>
                        {workflow.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                      <Switch 
                        checked={workflow.enabled}
                        onCheckedChange={(checked) => {
                          setWorkflows(prev => prev.map(w => 
                            w.id === workflow.id ? { ...w, enabled: checked } : w
                          ));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="health" className="space-y-6">
          {systemHealth && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className={`h-5 w-5 ${getHealthColor(systemHealth.overall)}`} />
                    System Health Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{systemHealth.resources.cpu}%</div>
                      <div className="text-sm text-gray-600">CPU</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{systemHealth.resources.memory}%</div>
                      <div className="text-sm text-gray-600">Memory</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{systemHealth.resources.gpu}%</div>
                      <div className="text-sm text-gray-600">GPU</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{systemHealth.resources.disk}%</div>
                      <div className="text-sm text-gray-600">Disk</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-600">{systemHealth.resources.network}%</div>
                      <div className="text-sm text-gray-600">Network</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Component Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {systemHealth.components.map((component) => (
                        <div key={component.name} className="flex items-center justify-between">
                          <span className="font-medium">{component.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{component.uptime}%</span>
                            <Badge className={getHealthColor(component.status).replace('text-', 'bg-')}>
                              {component.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {systemHealth.issues.map((issue) => (
                        <div key={issue.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{issue.component}</span>
                            <Badge className={`text-xs ${
                              issue.severity === 'critical' ? 'bg-red-500' :
                              issue.severity === 'high' ? 'bg-orange-500' :
                              issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{issue.description}</p>
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Occurrences: {issue.occurrences}</span>
                            <span>Last seen: {issue.lastSeen.toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* New Project Dialog */}
      {showNewProjectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  value={newProject.name || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  value={newProject.description || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Project description (optional)"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newProject.shared || false}
                  onCheckedChange={(checked) => setNewProject(prev => ({ ...prev, shared: checked }))}
                />
                <Label htmlFor="project-shared">Share with team</Label>
              </div>
            </CardContent>
            <div className="flex justify-end gap-3 p-6 pt-0">
              <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createProject} disabled={!newProject.name || loading}>
                Create Project
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 