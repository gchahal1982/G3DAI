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
  Sparkles, 
  Image, 
  Box, 
  Database, 
  Settings,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  BarChart3,
  Target,
  Activity,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Trash2,
  Edit,
  Save,
  Copy,
  Share,
  FileText,
  Folder,
  FolderPlus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Users,
  Tag,
  Star,
  Heart,
  Zap,
  Brain,
  Wand2,
  Palette,
  Camera,
  Video,
  Layers,
  Grid,
  Map as MapIcon,
  Globe,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Gauge,
  Timer,
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  LineChart,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Shield,
  Lock,
  Unlock,
  ExternalLink,
  Maximize,
  Minimize,
  RotateCcw,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack
} from 'lucide-react';

// Import types from backends
interface DiffusionConfig {
  modelType: 'stable-diffusion' | 'dalle3' | 'midjourney' | 'custom';
  resolution: number;
  steps: number;
  guidanceScale: number;
  strength: number;
  seed?: number;
  batchSize: number;
  enableG3DAcceleration: boolean;
  conditioning: {
    text?: string;
    image?: ImageData;
    mask?: ImageData;
    controlNet?: ControlNetConfig;
    style?: StyleConfig;
  };
}

interface ControlNetConfig {
  type: 'canny' | 'depth' | 'pose' | 'segmentation' | 'normal';
  image: ImageData;
  strength: number;
  processingParams: Record<string, any>;
}

interface StyleConfig {
  artisticStyle: string;
  colorPalette: string[];
  composition: 'portrait' | 'landscape' | 'square' | 'panoramic';
  lighting: 'natural' | 'studio' | 'dramatic' | 'soft';
  mood: string;
}

interface SceneConfig {
  sceneType: 'indoor' | 'outdoor' | 'urban' | 'natural' | 'industrial';
  complexity: 'low' | 'medium' | 'high' | 'ultra';
  lighting: 'natural' | 'artificial' | 'mixed' | 'dramatic';
  weather: 'clear' | 'cloudy' | 'rainy' | 'foggy' | 'snowy';
  timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night';
  objectDensity: number;
  enablePhysics: boolean;
  enableG3DAcceleration: boolean;
  outputFormat: '3d-mesh' | 'point-cloud' | 'voxel' | 'multi-view';
}

interface QualityConfig {
  metrics: QualityMetricType[];
  enableG3DAcceleration: boolean;
  batchSize: number;
  referenceDataset?: any[];
  thresholds: QualityThresholds;
}

type QualityMetricType =
  | 'fid' | 'is' | 'lpips' | 'ssim' | 'psnr' | 'ms_ssim'
  | 'diversity' | 'coverage' | 'precision' | 'recall'
  | 'authenticity' | 'memorization' | 'bias' | 'fairness';

interface QualityThresholds {
  fid: { excellent: number; good: number; poor: number };
  is: { excellent: number; good: number; poor: number };
  lpips: { excellent: number; good: number; poor: number };
  ssim: { excellent: number; good: number; poor: number };
  diversity: { excellent: number; good: number; poor: number };
  coverage: { excellent: number; good: number; poor: number };
}

interface GenerationProject {
  id: string;
  name: string;
  description: string;
  type: 'diffusion' | '3d-scene' | 'hybrid';
  status: 'draft' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  config: DiffusionConfig | SceneConfig;
  results: GenerationResult[];
  qualityReport?: QualityReport;
  tags: string[];
  owner: string;
  shared: boolean;
}

interface GenerationResult {
  id: string;
  projectId: string;
  timestamp: Date;
  type: 'image' | '3d-scene' | 'point-cloud';
  data: any;
  metadata: {
    generationTime: number;
    qualityScore?: number;
    annotations?: any;
  };
  status: 'generating' | 'completed' | 'failed';
}

interface QualityReport {
  overallScore: number;
  metrics: QualityMetricResult[];
  summary: QualitySummary;
  recommendations: string[];
  metadata: {
    evaluationTime: number;
    datasetSize: number;
    metricsComputed: string[];
  };
}

interface QualityMetricResult {
  name: string;
  value: number;
  score: number;
  grade: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
  details?: Record<string, any>;
}

interface QualitySummary {
  strengths: string[];
  weaknesses: string[];
  overallGrade: 'excellent' | 'good' | 'fair' | 'poor';
  confidence: number;
}

interface SyntheticDataStats {
  totalProjects: number;
  activeGenerations: number;
  totalGenerated: number;
  storageUsed: string;
  avgQualityScore: number;
  topPerformingModels: string[];
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: 'generation' | 'quality_check' | 'export' | 'share';
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
}

export default function SyntheticDataStudio() {
  // State management
  const [projects, setProjects] = useState<GenerationProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<GenerationProject | null>(null);
  const [activeGenerations, setActiveGenerations] = useState<Map<string, GenerationResult>>(new Map());
  const [stats, setStats] = useState<SyntheticDataStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Project creation state
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProject, setNewProject] = useState<Partial<GenerationProject>>({
    name: '',
    description: '',
    type: 'diffusion',
    tags: [],
    shared: false
  });

  // Generation configuration state
  const [diffusionConfig, setDiffusionConfig] = useState<DiffusionConfig>({
    modelType: 'stable-diffusion',
    resolution: 512,
    steps: 20,
    guidanceScale: 7.5,
    strength: 1.0,
    batchSize: 4,
    enableG3DAcceleration: true,
    conditioning: {}
  });

  const [sceneConfig, setSceneConfig] = useState<SceneConfig>({
    sceneType: 'outdoor',
    complexity: 'medium',
    lighting: 'natural',
    weather: 'clear',
    timeOfDay: 'noon',
    objectDensity: 0.5,
    enablePhysics: true,
    enableG3DAcceleration: true,
    outputFormat: 'multi-view'
  });

  const [qualityConfig, setQualityConfig] = useState<QualityConfig>({
    metrics: ['fid', 'is', 'diversity'],
    enableG3DAcceleration: true,
    batchSize: 16,
    thresholds: {
      fid: { excellent: 10, good: 30, poor: 100 },
      is: { excellent: 5, good: 3, poor: 1 },
      lpips: { excellent: 0.1, good: 0.3, poor: 0.7 },
      ssim: { excellent: 0.9, good: 0.7, poor: 0.5 },
      diversity: { excellent: 0.8, good: 0.6, poor: 0.3 },
      coverage: { excellent: 0.8, good: 0.6, poor: 0.3 }
    }
  });

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'diffusion' | '3d-scene' | 'hybrid'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'running' | 'completed' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'quality'>('updated');

  // Backend connections
  const diffusionGeneratorRef = useRef<any>(null);
  const sceneGeneratorRef = useRef<any>(null);
  const qualityMetricsRef = useRef<any>(null);

  // Initialize backends
  useEffect(() => {
    const initializeBackends = async () => {
      try {
        // Mock initialization - replace with actual backends
        diffusionGeneratorRef.current = {
          generateSyntheticData: async (config: DiffusionConfig) => {
            return generateMockDiffusionResult(config);
          }
        };

        sceneGeneratorRef.current = {
          generateScene: async (config: SceneConfig) => {
            return generateMock3DSceneResult(config);
          }
        };

        qualityMetricsRef.current = {
          evaluateQuality: async (data: any[], config: QualityConfig) => {
            return generateMockQualityReport(config);
          }
        };

        // Load initial data
        setProjects(generateMockProjects());
        setStats(generateMockStats());
        
      } catch (error) {
        console.error('Failed to initialize synthetic data backends:', error);
        setError('Failed to initialize synthetic data studio');
      }
    };

    initializeBackends();
  }, []);

  // Create new project
  const createProject = useCallback(async () => {
    if (!newProject.name) return;

    setLoading(true);
    try {
      const project: GenerationProject = {
        id: `project_${Date.now()}`,
        name: newProject.name,
        description: newProject.description || '',
        type: newProject.type || 'diffusion',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        config: newProject.type === '3d-scene' ? sceneConfig : diffusionConfig,
        results: [],
        tags: newProject.tags || [],
        owner: 'current-user',
        shared: newProject.shared || false
      };

      setProjects(prev => [project, ...prev]);
      setSelectedProject(project);
      setNewProject({ name: '', description: '', type: 'diffusion', tags: [], shared: false });
      setShowNewProjectDialog(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      setError('Failed to create project');
    } finally {
      setLoading(false);
    }
  }, [newProject, diffusionConfig, sceneConfig]);

  // Start generation
  const startGeneration = useCallback(async (project: GenerationProject) => {
    if (!project) return;

    setLoading(true);
    try {
      const generationId = `gen_${Date.now()}`;
      
      // Create generation result placeholder
      const result: GenerationResult = {
        id: generationId,
        projectId: project.id,
        timestamp: new Date(),
        type: project.type === '3d-scene' ? '3d-scene' : 'image',
        data: null,
        metadata: { generationTime: 0 },
        status: 'generating'
      };

      setActiveGenerations(prev => {
        const newMap = new Map(prev);
        newMap.set(generationId, result);
        return newMap;
      });

      // Update project status
      setProjects(prev => prev.map(p => 
        p.id === project.id ? { ...p, status: 'running' as const, updatedAt: new Date() } : p
      ));

      // Simulate generation
      setTimeout(async () => {
        try {
          let generatedData;
          if (project.type === '3d-scene') {
            generatedData = await sceneGeneratorRef.current?.generateScene(project.config);
          } else {
            generatedData = await diffusionGeneratorRef.current?.generateSyntheticData(project.config);
          }

          const completedResult: GenerationResult = {
            ...result,
            data: generatedData,
            metadata: {
              generationTime: 5000 + Math.random() * 10000,
              qualityScore: 0.7 + Math.random() * 0.25
            },
            status: 'completed'
          };

          // Update project with result
          setProjects(prev => prev.map(p => 
            p.id === project.id ? { 
              ...p, 
              status: 'completed' as const, 
              results: [...p.results, completedResult],
              updatedAt: new Date()
            } : p
          ));

          setActiveGenerations(prev => {
            const newMap = new Map(prev);
            newMap.delete(generationId);
            return newMap;
          });

        } catch (error) {
          console.error('Generation failed:', error);
          setActiveGenerations(prev => {
            const newMap = new Map(prev);
            newMap.delete(generationId);
            return newMap;
          });
        }
      }, 3000);

    } catch (error) {
      console.error('Failed to start generation:', error);
      setError('Failed to start generation');
    } finally {
      setLoading(false);
    }
  }, []);

  // Run quality assessment
  const runQualityAssessment = useCallback(async (project: GenerationProject) => {
    if (!project.results.length) return;

    setLoading(true);
    try {
      const data = project.results.map(r => r.data).filter(Boolean);
      const report = await qualityMetricsRef.current?.evaluateQuality(data, qualityConfig);
      
      setProjects(prev => prev.map(p => 
        p.id === project.id ? { ...p, qualityReport: report, updatedAt: new Date() } : p
      ));
    } catch (error) {
      console.error('Quality assessment failed:', error);
      setError('Failed to run quality assessment');
    } finally {
      setLoading(false);
    }
  }, [qualityConfig]);

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || project.type === filterType;
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
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
      case 'quality':
        const aQuality = a.qualityReport?.overallScore || 0;
        const bQuality = b.qualityReport?.overallScore || 0;
        return bQuality - aQuality;
      default:
        return 0;
    }
  });

  // Get project type icon
  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'diffusion': return <Image className="h-4 w-4" />;
      case '3d-scene': return <Box className="h-4 w-4" />;
      case 'hybrid': return <Layers className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get quality grade color
  const getQualityGradeColor = (grade: string) => {
    switch (grade) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Mock data generators
  const generateMockProjects = (): GenerationProject[] => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: `project_${i + 1}`,
      name: `Project ${i + 1}`,
      description: `Description for project ${i + 1}`,
      type: ['diffusion', '3d-scene', 'hybrid'][i % 3] as any,
      status: ['draft', 'running', 'completed', 'failed'][i % 4] as any,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      config: diffusionConfig,
      results: Array.from({ length: Math.floor(Math.random() * 5) }, (_, j) => ({
        id: `result_${i}_${j}`,
        projectId: `project_${i + 1}`,
        timestamp: new Date(),
        type: 'image' as const,
        data: { images: [`image_${j}.jpg`] },
        metadata: { generationTime: 5000 + Math.random() * 10000 },
        status: 'completed' as const
      })),
      qualityReport: i % 3 === 0 ? generateMockQualityReport(qualityConfig) : undefined,
      tags: [`tag${i % 3 + 1}`, `category${i % 2 + 1}`],
      owner: 'current-user',
      shared: i % 4 === 0
    }));
  };

  const generateMockStats = (): SyntheticDataStats => {
    return {
      totalProjects: 24,
      activeGenerations: 3,
      totalGenerated: 1250,
      storageUsed: '2.3 GB',
      avgQualityScore: 85.2,
      topPerformingModels: ['Stable Diffusion XL', 'Midjourney v6', 'DALL-E 3'],
      recentActivity: Array.from({ length: 10 }, (_, i) => ({
        id: `activity_${i}`,
        type: ['generation', 'quality_check', 'export', 'share'][i % 4] as any,
        description: `Activity ${i + 1} description`,
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
        status: ['success', 'warning', 'error'][i % 3] as any
      }))
    };
  };

  const generateMockDiffusionResult = (config: DiffusionConfig) => {
    return {
      images: Array.from({ length: config.batchSize }, (_, i) => ({
        data: `generated_image_${i}.jpg`,
        metadata: { seed: Math.floor(Math.random() * 1000000) }
      })),
      metadata: {
        prompt: config.conditioning.text || 'Generated image',
        seed: config.seed || Math.floor(Math.random() * 1000000),
        steps: config.steps,
        guidanceScale: config.guidanceScale,
        generationTime: 3000 + Math.random() * 5000,
        qualityScore: 0.7 + Math.random() * 0.25,
        diversityScore: 0.6 + Math.random() * 0.3
      }
    };
  };

  const generateMock3DSceneResult = (config: SceneConfig) => {
    return {
      objects: Array.from({ length: 20 }, (_, i) => ({
        id: `object_${i}`,
        type: ['building', 'vehicle', 'tree', 'furniture'][i % 4],
        position: [Math.random() * 100, 0, Math.random() * 100],
        category: `category_${i % 5}`
      })),
      metadata: {
        sceneType: config.sceneType,
        complexity: config.complexity,
        objectCount: 20,
        triangleCount: 50000 + Math.random() * 100000,
        generationTime: 5000 + Math.random() * 10000
      },
      renderTargets: [
        { type: 'color', width: 512, height: 512 },
        { type: 'depth', width: 512, height: 512 },
        { type: 'semantic', width: 512, height: 512 }
      ]
    };
  };

  const generateMockQualityReport = (config: QualityConfig): QualityReport => {
    const metrics = config.metrics.map(metric => ({
      name: metric.toUpperCase(),
      value: Math.random(),
      score: 60 + Math.random() * 35,
      grade: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)] as any,
      description: `${metric} quality assessment result`
    }));

    return {
      overallScore: 75 + Math.random() * 20,
      metrics,
      summary: {
        strengths: ['High diversity', 'Good visual quality'],
        weaknesses: ['Some artifacts', 'Limited pose variation'],
        overallGrade: 'good',
        confidence: 0.85
      },
      recommendations: [
        'Increase generation steps for better quality',
        'Use different random seeds for more diversity',
        'Consider fine-tuning on domain-specific data'
      ],
      metadata: {
        evaluationTime: 2000 + Math.random() * 3000,
        datasetSize: 100,
        metricsComputed: config.metrics
      }
    };
  };

  return (
    <div className="synthetic-data-studio p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Synthetic Data Studio</h1>
            <p className="text-gray-600">Generate high-quality synthetic training data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Dataset
          </Button>
          <Button onClick={() => setShowNewProjectDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold">{stats.totalProjects}</p>
                </div>
                <Folder className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Generations</p>
                  <p className="text-2xl font-bold">{stats.activeGenerations}</p>
                </div>
                <Activity className="h-8 w-8 text-green-500 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Generated</p>
                  <p className="text-2xl font-bold">{stats.totalGenerated.toLocaleString()}</p>
                </div>
                <Database className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Storage Used</p>
                  <p className="text-2xl font-bold">{stats.storageUsed}</p>
                </div>
                <HardDrive className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Quality</p>
                  <p className="text-2xl font-bold">{stats.avgQualityScore.toFixed(1)}%</p>
                </div>
                <Target className="h-8 w-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <Users className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="diffusion">Diffusion</SelectItem>
                      <SelectItem value="3d-scene">3D Scene</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updated">Updated</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="quality">Quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedProjects.map((project) => (
              <Card 
                key={project.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedProject?.id === project.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedProject(project)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getProjectTypeIcon(project.type)}
                      <div>
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{project.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(project.status)} text-white`}>
                        {project.status}
                      </Badge>
                      {project.shared && <Share className="h-4 w-4 text-gray-400" />}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Results:</span>
                      <span className="font-medium">{project.results.length}</span>
                    </div>
                    
                    {project.qualityReport && (
                      <div className="flex justify-between text-sm">
                        <span>Quality Score:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{project.qualityReport.overallScore.toFixed(1)}%</span>
                          <Badge 
                            className={`${getQualityGradeColor(project.qualityReport.summary.overallGrade)} text-white text-xs`}
                          >
                            {project.qualityReport.summary.overallGrade}
                          </Badge>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Updated:</span>
                      <span>{project.updatedAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {project.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Active Generations */}
          {activeGenerations.size > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active Generations ({activeGenerations.size})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(activeGenerations.values()).map((generation) => (
                    <div key={generation.id} className="flex items-center gap-3 p-2 rounded border">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{generation.type}</div>
                        <div className="text-xs text-gray-600">
                          {generation.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setShowNewProjectDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Diffusion Project
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setShowNewProjectDialog(true)}
                >
                  <Box className="h-4 w-4 mr-2" />
                  New 3D Scene Project
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Reference Data
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Quality Benchmark
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm">{activity.description}</div>
                          <div className="text-xs text-gray-600">
                            {activity.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Selected Project Detail */}
      {selectedProject && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getProjectTypeIcon(selectedProject.type)}
                {selectedProject.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runQualityAssessment(selectedProject)}
                  disabled={!selectedProject.results.length || loading}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Quality Check
                </Button>
                <Button
                  size="sm"
                  onClick={() => startGeneration(selectedProject)}
                  disabled={selectedProject.status === 'running' || loading}
                >
                  {selectedProject.status === 'running' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="results">Results ({selectedProject.results.length})</TabsTrigger>
                <TabsTrigger value="quality">Quality Report</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Project Type</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getProjectTypeIcon(selectedProject.type)}
                      <span className="capitalize">{selectedProject.type}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      <Badge className={`${getStatusColor(selectedProject.status)} text-white`}>
                        {selectedProject.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Results Generated</Label>
                    <div className="text-lg font-semibold mt-1">{selectedProject.results.length}</div>
                  </div>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <p className="mt-1 text-gray-600">{selectedProject.description || 'No description'}</p>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedProject.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedProject.results.map((result) => (
                    <Card key={result.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{result.type}</Badge>
                          <Badge className={`${getStatusColor(result.status)} text-white`}>
                            {result.status}
                          </Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <div>Generated: {result.timestamp.toLocaleString()}</div>
                          <div>Time: {(result.metadata.generationTime / 1000).toFixed(1)}s</div>
                          {result.metadata.qualityScore && (
                            <div>Quality: {Math.round(result.metadata.qualityScore * 100)}%</div>
                          )}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="quality" className="space-y-4">
                {selectedProject.qualityReport ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{selectedProject.qualityReport.overallScore.toFixed(1)}%</div>
                            <div className="text-sm text-gray-600">Overall Score</div>
                            <Badge 
                              className={`${getQualityGradeColor(selectedProject.qualityReport.summary.overallGrade)} text-white mt-2`}
                            >
                              {selectedProject.qualityReport.summary.overallGrade}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div>
                            <Label className="text-sm font-medium">Strengths</Label>
                            <ul className="mt-2 space-y-1">
                              {selectedProject.qualityReport.summary.strengths.map((strength, index) => (
                                <li key={index} className="text-sm text-green-600 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div>
                            <Label className="text-sm font-medium">Weaknesses</Label>
                            <ul className="mt-2 space-y-1">
                              {selectedProject.qualityReport.summary.weaknesses.map((weakness, index) => (
                                <li key={index} className="text-sm text-red-600 flex items-center gap-1">
                                  <XCircle className="h-3 w-3" />
                                  {weakness}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Quality Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedProject.qualityReport.metrics.map((metric, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded border">
                              <div>
                                <div className="font-medium">{metric.name}</div>
                                <div className="text-sm text-gray-600">{metric.description}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{metric.score.toFixed(1)}%</div>
                                <Badge 
                                  className={`${getQualityGradeColor(metric.grade)} text-white text-xs`}
                                >
                                  {metric.grade}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedProject.qualityReport.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 rounded border">
                              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                              <span className="text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Quality Report</h3>
                    <p className="text-gray-600 mb-4">Run quality assessment to see detailed metrics</p>
                    <Button onClick={() => runQualityAssessment(selectedProject)}>
                      <Target className="h-4 w-4 mr-2" />
                      Run Quality Assessment
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="config" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Generation Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                      {JSON.stringify(selectedProject.config, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* New Project Dialog */}
      {showNewProjectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    
                    value={newProject.name || ''}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-type">Type</Label>
                  <Select
                    value={newProject.type || 'diffusion'}
                    onValueChange={(value) => setNewProject(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diffusion">Diffusion Models</SelectItem>
                      <SelectItem value="3d-scene">3D Scene Generation</SelectItem>
                      <SelectItem value="hybrid">Hybrid Approach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  
                  value={newProject.description || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project goals and requirements"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="project-shared">Shared Project</Label>
                <Switch
                  checked={newProject.shared || false}
                  onCheckedChange={(checked) => setNewProject(prev => ({ ...prev, shared: checked }))}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowNewProjectDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createProject}
                  disabled={!newProject.name || loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 