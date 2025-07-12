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
} from '../../../../../shared/components/ui';
import { 
  Settings, 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  Download, 
  Upload, 
  Save, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  Plus, 
  Minus, 
  BarChart3, 
  Activity, 
  Clock, 
  Zap, 
  Target, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Wand2, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Database, 
  Image, 
  Box, 
  Layers, 
  Palette, 
  Gauge, 
  Timer, 
  TrendingUp, 
  TrendingDown, 
  Monitor, 
  Camera, 
  Video, 
  Globe, 
  Sun, 
  Moon, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Thermometer, 
  Sliders, 
  Wrench, 
  Beaker, 
  FlaskConical, 
  TestTube, 
  Microscope, 
  Cog, 
  Settings2, 
  Maximize, 
  Minimize, 
  ArrowRight, 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown 
} from 'lucide-react';

// Types from backend services
interface GenerationConfig {
  id: string;
  name: string;
  description: string;
  type: 'diffusion' | '3d-scene' | 'hybrid';
  parameters: GenerationParameters;
  schedule: GenerationSchedule;
  monitoring: MonitoringConfig;
  output: OutputConfig;
  quality: QualityConfig;
}

interface GenerationParameters {
  // Diffusion parameters
  diffusion?: {
    modelType: 'stable-diffusion' | 'dalle3' | 'midjourney' | 'custom';
    resolution: number;
    steps: number;
    guidanceScale: number;
    strength: number;
    batchSize: number;
    seed?: number;
    conditioning: {
      text?: string;
      image?: string;
      style?: string;
    };
  };
  
  // 3D scene parameters
  scene?: {
    sceneType: 'indoor' | 'outdoor' | 'urban' | 'natural' | 'industrial';
    complexity: 'low' | 'medium' | 'high' | 'ultra';
    lighting: 'natural' | 'artificial' | 'mixed' | 'dramatic';
    weather: 'clear' | 'cloudy' | 'rainy' | 'foggy' | 'snowy';
    timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night';
    objectDensity: number;
    enablePhysics: boolean;
    outputFormat: '3d-mesh' | 'point-cloud' | 'voxel' | 'multi-view';
  };
  
  // Advanced parameters
  enableG3DAcceleration: boolean;
  optimization: {
    memoryOptimization: boolean;
    gpuOptimization: boolean;
    parallelGeneration: boolean;
    cacheResults: boolean;
  };
}

interface GenerationSchedule {
  mode: 'manual' | 'scheduled' | 'continuous';
  interval?: number; // minutes
  startTime?: Date;
  endTime?: Date;
  maxGenerations?: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface MonitoringConfig {
  enableRealTimeMonitoring: boolean;
  metricsCollection: boolean;
  alerting: {
    enabled: boolean;
    thresholds: {
      failureRate: number;
      avgGenerationTime: number;
      memoryUsage: number;
      gpuUtilization: number;
    };
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    includeMetrics: boolean;
    includeParameters: boolean;
  };
}

interface OutputConfig {
  format: 'jpg' | 'png' | 'webp' | 'obj' | 'gltf' | 'ply' | 'json';
  quality: number;
  compression: boolean;
  watermark: boolean;
  metadata: {
    includeGenerationParams: boolean;
    includeTimestamp: boolean;
    includeQualityScore: boolean;
  };
  storage: {
    location: 'local' | 'cloud' | 'hybrid';
    backup: boolean;
    encryption: boolean;
  };
}

interface QualityConfig {
  enableAutoQualityCheck: boolean;
  metrics: QualityMetric[];
  thresholds: {
    minQualityScore: number;
    maxRetries: number;
    autoRegenerate: boolean;
  };
}

interface QualityMetric {
  name: string;
  enabled: boolean;
  threshold: number;
  weight: number;
}

interface GenerationTask {
  id: string;
  configId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  progress: number;
  currentStep: string;
  results: GenerationResult[];
  errors: string[];
  metrics: TaskMetrics;
}

interface GenerationResult {
  id: string;
  type: 'image' | '3d-scene' | 'point-cloud';
  data: any;
  metadata: {
    generationTime: number;
    qualityScore: number;
    parameters: any;
  };
}

interface TaskMetrics {
  totalTime: number;
  avgGenerationTime: number;
  successRate: number;
  failureRate: number;
  memoryUsage: number;
  gpuUtilization: number;
  diskUsage: number;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  gpu: number;
  disk: number;
  network: number;
  temperature: number;
}

export default function DataGenerationPanel() {
  // State management
  const [configs, setConfigs] = useState<GenerationConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<GenerationConfig | null>(null);
  const [activeTasks, setActiveTasks] = useState<GenerationTask[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 0, memory: 0, gpu: 0, disk: 0, network: 0, temperature: 0
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Configuration state
  const [currentConfig, setCurrentConfig] = useState<GenerationConfig>({
    id: '',
    name: '',
    description: '',
    type: 'diffusion',
    parameters: {
      diffusion: {
        modelType: 'stable-diffusion',
        resolution: 512,
        steps: 20,
        guidanceScale: 7.5,
        strength: 1.0,
        batchSize: 4,
        conditioning: {}
      },
      enableG3DAcceleration: true,
      optimization: {
        memoryOptimization: true,
        gpuOptimization: true,
        parallelGeneration: false,
        cacheResults: true
      }
    },
    schedule: {
      mode: 'manual',
      priority: 'normal'
    },
    monitoring: {
      enableRealTimeMonitoring: true,
      metricsCollection: true,
      alerting: {
        enabled: true,
        thresholds: {
          failureRate: 0.1,
          avgGenerationTime: 30000,
          memoryUsage: 0.8,
          gpuUtilization: 0.9
        }
      },
      logging: {
        level: 'info',
        includeMetrics: true,
        includeParameters: true
      }
    },
    output: {
      format: 'png',
      quality: 95,
      compression: true,
      watermark: false,
      metadata: {
        includeGenerationParams: true,
        includeTimestamp: true,
        includeQualityScore: true
      },
      storage: {
        location: 'cloud',
        backup: true,
        encryption: true
      }
    },
    quality: {
      enableAutoQualityCheck: true,
      metrics: [
        { name: 'FID', enabled: true, threshold: 30, weight: 1.0 },
        { name: 'IS', enabled: true, threshold: 3.0, weight: 0.8 },
        { name: 'LPIPS', enabled: true, threshold: 0.3, weight: 0.7 },
        { name: 'SSIM', enabled: true, threshold: 0.7, weight: 0.6 }
      ],
      thresholds: {
        minQualityScore: 0.7,
        maxRetries: 3,
        autoRegenerate: true
      }
    }
  });

  // Backend references
  const diffusionGeneratorRef = useRef<any>(null);
  const sceneGeneratorRef = useRef<any>(null);
  const qualityMetricsRef = useRef<any>(null);
  const monitoringRef = useRef<any>(null);

  // Initialize backend connections
  useEffect(() => {
    const initializeBackends = async () => {
      try {
        // Initialize mock backends
        diffusionGeneratorRef.current = {
          generateSyntheticData: async (config: any) => {
            await new Promise(resolve => setTimeout(resolve, 3000));
            return {
              images: Array.from({ length: config.batchSize }, (_, i) => ({
                data: `generated_image_${i}.png`,
                metadata: { seed: Math.floor(Math.random() * 1000000) }
              }))
            };
          }
        };

        sceneGeneratorRef.current = {
          generateScene: async (config: any) => {
            await new Promise(resolve => setTimeout(resolve, 5000));
            return {
              objects: Array.from({ length: 20 }, (_, i) => ({
                id: `object_${i}`,
                type: 'building',
                position: [Math.random() * 100, 0, Math.random() * 100]
              }))
            };
          }
        };

        qualityMetricsRef.current = {
          evaluateQuality: async (data: any[], config: any) => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return {
              overallScore: 0.75 + Math.random() * 0.2,
              metrics: config.metrics.map((m: any) => ({
                name: m.name,
                value: Math.random(),
                score: 70 + Math.random() * 25
              }))
            };
          }
        };

        // Load sample configurations
        setConfigs(generateSampleConfigs());

      } catch (error) {
        console.error('Failed to initialize backends:', error);
        setError('Failed to initialize generation backends');
      }
    };

    initializeBackends();

    // Start metrics monitoring
    const metricsInterval = setInterval(() => {
      setSystemMetrics({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        gpu: Math.random() * 100,
        disk: Math.random() * 100,
        network: Math.random() * 100,
        temperature: 60 + Math.random() * 20
      });
    }, 1000);

    return () => clearInterval(metricsInterval);
  }, []);

  // Start generation
  const startGeneration = useCallback(async () => {
    if (!selectedConfig || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const taskId = `task_${Date.now()}`;
      const task: GenerationTask = {
        id: taskId,
        configId: selectedConfig.id,
        status: 'running',
        startTime: new Date(),
        progress: 0,
        currentStep: 'Initializing...',
        results: [],
        errors: [],
        metrics: {
          totalTime: 0,
          avgGenerationTime: 0,
          successRate: 0,
          failureRate: 0,
          memoryUsage: 0,
          gpuUtilization: 0,
          diskUsage: 0
        }
      };

      setActiveTasks(prev => [...prev, task]);

      // Simulate generation progress
      const steps = ['Initializing...', 'Loading model...', 'Generating...', 'Post-processing...', 'Quality check...'];
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setActiveTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, progress: (i + 1) / steps.length * 100, currentStep: steps[i] } : t
        ));
      }

      // Generate results
      let results: GenerationResult[] = [];
      if (selectedConfig.type === 'diffusion') {
        const data = await diffusionGeneratorRef.current?.generateSyntheticData(selectedConfig.parameters.diffusion);
        results = data.images.map((img: any, index: number) => ({
          id: `result_${index}`,
          type: 'image' as const,
          data: img,
          metadata: {
            generationTime: 3000 + Math.random() * 2000,
            qualityScore: 0.7 + Math.random() * 0.25,
            parameters: selectedConfig.parameters.diffusion
          }
        }));
      } else if (selectedConfig.type === '3d-scene') {
        const data = await sceneGeneratorRef.current?.generateScene(selectedConfig.parameters.scene);
        results = [{
          id: 'scene_result',
          type: '3d-scene' as const,
          data,
          metadata: {
            generationTime: 5000 + Math.random() * 3000,
            qualityScore: 0.8 + Math.random() * 0.15,
            parameters: selectedConfig.parameters.scene
          }
        }];
      }

      // Quality check if enabled
      if (selectedConfig.quality.enableAutoQualityCheck) {
        const qualityReport = await qualityMetricsRef.current?.evaluateQuality(
          results.map(r => r.data), 
          selectedConfig.quality
        );
        results.forEach(r => {
          r.metadata.qualityScore = qualityReport.overallScore;
        });
      }

      // Complete task
      setActiveTasks(prev => prev.map(t => 
        t.id === taskId ? { 
          ...t, 
          status: 'completed' as const,
          endTime: new Date(),
          progress: 100,
          currentStep: 'Completed',
          results,
          metrics: {
            ...t.metrics,
            totalTime: Date.now() - t.startTime.getTime(),
            avgGenerationTime: results.reduce((sum, r) => sum + r.metadata.generationTime, 0) / results.length,
            successRate: 1.0,
            failureRate: 0.0,
            memoryUsage: systemMetrics.memory,
            gpuUtilization: systemMetrics.gpu,
            diskUsage: systemMetrics.disk
          }
        } : t
      ));

    } catch (error) {
      console.error('Generation failed:', error);
      setError('Generation failed. Please check your configuration and try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedConfig, isGenerating, systemMetrics]);

  // Stop generation
  const stopGeneration = useCallback(() => {
    setIsGenerating(false);
    setActiveTasks(prev => prev.map(t => 
      t.status === 'running' ? { ...t, status: 'cancelled' as const } : t
    ));
  }, []);

  // Save configuration
  const saveConfiguration = useCallback(() => {
    const config: GenerationConfig = {
      ...currentConfig,
      id: currentConfig.id || `config_${Date.now()}`,
      name: currentConfig.name || `Configuration ${Date.now()}`
    };

    if (currentConfig.id) {
      setConfigs(prev => prev.map(c => c.id === config.id ? config : c));
    } else {
      setConfigs(prev => [...prev, config]);
    }

    setSelectedConfig(config);
    setCurrentConfig(config);
  }, [currentConfig]);

  // Load configuration
  const loadConfiguration = useCallback((config: GenerationConfig) => {
    setCurrentConfig(config);
    setSelectedConfig(config);
  }, []);

  // Delete configuration
  const deleteConfiguration = useCallback((configId: string) => {
    setConfigs(prev => prev.filter(c => c.id !== configId));
    if (selectedConfig?.id === configId) {
      setSelectedConfig(null);
    }
  }, [selectedConfig]);

  // Generate sample configurations
  const generateSampleConfigs = (): GenerationConfig[] => {
    return [
      {
        id: 'config_1',
        name: 'High Quality Images',
        description: 'High-resolution image generation with quality optimization',
        type: 'diffusion',
        parameters: {
          diffusion: {
            modelType: 'stable-diffusion',
            resolution: 1024,
            steps: 50,
            guidanceScale: 8.0,
            strength: 1.0,
            batchSize: 2,
            conditioning: { text: 'high quality, detailed' }
          },
          enableG3DAcceleration: true,
          optimization: {
            memoryOptimization: true,
            gpuOptimization: true,
            parallelGeneration: false,
            cacheResults: true
          }
        },
        schedule: { mode: 'manual', priority: 'high' },
        monitoring: {
          enableRealTimeMonitoring: true,
          metricsCollection: true,
          alerting: { enabled: true, thresholds: { failureRate: 0.1, avgGenerationTime: 30000, memoryUsage: 0.8, gpuUtilization: 0.9 } },
          logging: { level: 'info', includeMetrics: true, includeParameters: true }
        },
        output: {
          format: 'png',
          quality: 100,
          compression: false,
          watermark: false,
          metadata: { includeGenerationParams: true, includeTimestamp: true, includeQualityScore: true },
          storage: { location: 'cloud', backup: true, encryption: true }
        },
        quality: {
          enableAutoQualityCheck: true,
          metrics: [
            { name: 'FID', enabled: true, threshold: 20, weight: 1.0 },
            { name: 'IS', enabled: true, threshold: 4.0, weight: 0.8 }
          ],
          thresholds: { minQualityScore: 0.8, maxRetries: 3, autoRegenerate: true }
        }
      },
      {
        id: 'config_2',
        name: 'Fast Batch Generation',
        description: 'Optimized for speed with batch processing',
        type: 'diffusion',
        parameters: {
          diffusion: {
            modelType: 'stable-diffusion',
            resolution: 512,
            steps: 20,
            guidanceScale: 7.5,
            strength: 1.0,
            batchSize: 8,
            conditioning: { text: 'fast generation' }
          },
          enableG3DAcceleration: true,
          optimization: {
            memoryOptimization: false,
            gpuOptimization: true,
            parallelGeneration: true,
            cacheResults: false
          }
        },
        schedule: { mode: 'manual', priority: 'normal' },
        monitoring: {
          enableRealTimeMonitoring: true,
          metricsCollection: true,
          alerting: { enabled: true, thresholds: { failureRate: 0.15, avgGenerationTime: 15000, memoryUsage: 0.9, gpuUtilization: 0.95 } },
          logging: { level: 'warn', includeMetrics: true, includeParameters: false }
        },
        output: {
          format: 'jpg',
          quality: 85,
          compression: true,
          watermark: false,
          metadata: { includeGenerationParams: false, includeTimestamp: true, includeQualityScore: false },
          storage: { location: 'local', backup: false, encryption: false }
        },
        quality: {
          enableAutoQualityCheck: false,
          metrics: [],
          thresholds: { minQualityScore: 0.6, maxRetries: 1, autoRegenerate: false }
        }
      },
      {
        id: 'config_3',
        name: '3D Environment Generation',
        description: 'Complex 3D scene generation with physics simulation',
        type: '3d-scene',
        parameters: {
          scene: {
            sceneType: 'urban',
            complexity: 'high',
            lighting: 'mixed',
            weather: 'clear',
            timeOfDay: 'afternoon',
            objectDensity: 0.8,
            enablePhysics: true,
            outputFormat: 'multi-view'
          },
          enableG3DAcceleration: true,
          optimization: {
            memoryOptimization: true,
            gpuOptimization: true,
            parallelGeneration: false,
            cacheResults: true
          }
        },
        schedule: { mode: 'manual', priority: 'high' },
        monitoring: {
          enableRealTimeMonitoring: true,
          metricsCollection: true,
          alerting: { enabled: true, thresholds: { failureRate: 0.05, avgGenerationTime: 60000, memoryUsage: 0.85, gpuUtilization: 0.9 } },
          logging: { level: 'debug', includeMetrics: true, includeParameters: true }
        },
        output: {
          format: 'gltf',
          quality: 95,
          compression: true,
          watermark: false,
          metadata: { includeGenerationParams: true, includeTimestamp: true, includeQualityScore: true },
          storage: { location: 'cloud', backup: true, encryption: true }
        },
        quality: {
          enableAutoQualityCheck: true,
          metrics: [
            { name: 'Geometry Quality', enabled: true, threshold: 0.8, weight: 1.0 },
            { name: 'Texture Quality', enabled: true, threshold: 0.7, weight: 0.8 },
            { name: 'Lighting Quality', enabled: true, threshold: 0.75, weight: 0.7 }
          ],
          thresholds: { minQualityScore: 0.75, maxRetries: 2, autoRegenerate: true }
        }
      }
    ];
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // Get metric status color
  const getMetricStatusColor = (value: number, threshold: number) => {
    if (value < threshold * 0.5) return 'text-green-600';
    if (value < threshold * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="data-generation-panel space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Generation Panel</h2>
          <p className="text-gray-600">Advanced controls for synthetic data generation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}>
            <Settings className="h-4 w-4 mr-2" />
            {showAdvancedSettings ? 'Hide' : 'Show'} Advanced
          </Button>
          <Button onClick={saveConfiguration} disabled={!currentConfig.name}>
            <Save className="h-4 w-4 mr-2" />
            Save Config
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

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{systemMetrics.cpu.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">CPU</div>
              <Progress value={systemMetrics.cpu} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemMetrics.memory.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Memory</div>
              <Progress value={systemMetrics.memory} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{systemMetrics.gpu.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">GPU</div>
              <Progress value={systemMetrics.gpu} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{systemMetrics.disk.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Disk</div>
              <Progress value={systemMetrics.disk} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{systemMetrics.network.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Network</div>
              <Progress value={systemMetrics.network} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{systemMetrics.temperature.toFixed(1)}°C</div>
              <div className="text-sm text-gray-600">Temperature</div>
              <Progress value={systemMetrics.temperature} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Generation Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="parameters">Parameters</TabsTrigger>
                  <TabsTrigger value="quality">Quality</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Configuration Name</Label>
                      <Input
                        value={currentConfig.name}
                        onChange={(e) => setCurrentConfig(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter configuration name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Generation Type</Label>
                      <Select
                        value={currentConfig.type}
                        onValueChange={(value: any) => setCurrentConfig(prev => ({ ...prev, type: value }))}
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
                    <Label>Description</Label>
                    <Textarea
                      value={currentConfig.description}
                      onChange={(e) => setCurrentConfig(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this configuration..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Enable G3D Acceleration</Label>
                    <Switch
                      checked={currentConfig.parameters.enableG3DAcceleration}
                      onCheckedChange={(checked) => setCurrentConfig(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, enableG3DAcceleration: checked }
                      }))}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="parameters" className="space-y-4">
                  {currentConfig.type === 'diffusion' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Model Type</Label>
                          <Select
                            value={currentConfig.parameters.diffusion?.modelType || 'stable-diffusion'}
                            onValueChange={(value: any) => setCurrentConfig(prev => ({
                              ...prev,
                              parameters: {
                                ...prev.parameters,
                                diffusion: { ...prev.parameters.diffusion, modelType: value }
                              }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="stable-diffusion">Stable Diffusion</SelectItem>
                              <SelectItem value="dalle3">DALL-E 3</SelectItem>
                              <SelectItem value="midjourney">Midjourney</SelectItem>
                              <SelectItem value="custom">Custom Model</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Resolution</Label>
                          <Select
                            value={currentConfig.parameters.diffusion?.resolution.toString() || '512'}
                            onValueChange={(value) => setCurrentConfig(prev => ({
                              ...prev,
                              parameters: {
                                ...prev.parameters,
                                diffusion: { ...prev.parameters.diffusion, resolution: parseInt(value) }
                              }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="256">256x256</SelectItem>
                              <SelectItem value="512">512x512</SelectItem>
                              <SelectItem value="768">768x768</SelectItem>
                              <SelectItem value="1024">1024x1024</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Steps: {currentConfig.parameters.diffusion?.steps || 20}</Label>
                        <Slider
                          value={[currentConfig.parameters.diffusion?.steps || 20]}
                          onValueChange={(value) => setCurrentConfig(prev => ({
                            ...prev,
                            parameters: {
                              ...prev.parameters,
                              diffusion: { ...prev.parameters.diffusion, steps: value[0] }
                            }
                          }))}
                          min={10}
                          max={100}
                          step={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Guidance Scale: {currentConfig.parameters.diffusion?.guidanceScale || 7.5}</Label>
                        <Slider
                          value={[currentConfig.parameters.diffusion?.guidanceScale || 7.5]}
                          onValueChange={(value) => setCurrentConfig(prev => ({
                            ...prev,
                            parameters: {
                              ...prev.parameters,
                              diffusion: { ...prev.parameters.diffusion, guidanceScale: value[0] }
                            }
                          }))}
                          min={1}
                          max={20}
                          step={0.5}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Batch Size: {currentConfig.parameters.diffusion?.batchSize || 4}</Label>
                        <Slider
                          value={[currentConfig.parameters.diffusion?.batchSize || 4]}
                          onValueChange={(value) => setCurrentConfig(prev => ({
                            ...prev,
                            parameters: {
                              ...prev.parameters,
                              diffusion: { ...prev.parameters.diffusion, batchSize: value[0] }
                            }
                          }))}
                          min={1}
                          max={16}
                          step={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Conditioning Text</Label>
                        <Textarea
                          value={currentConfig.parameters.diffusion?.conditioning.text || ''}
                          onChange={(e) => setCurrentConfig(prev => ({
                            ...prev,
                            parameters: {
                              ...prev.parameters,
                              diffusion: {
                                ...prev.parameters.diffusion,
                                conditioning: { ...prev.parameters.diffusion?.conditioning, text: e.target.value }
                              }
                            }
                          }))}
                          placeholder="Enter conditioning text..."
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  {currentConfig.type === '3d-scene' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Scene Type</Label>
                          <Select
                            value={currentConfig.parameters.scene?.sceneType || 'outdoor'}
                            onValueChange={(value: any) => setCurrentConfig(prev => ({
                              ...prev,
                              parameters: {
                                ...prev.parameters,
                                scene: { ...prev.parameters.scene, sceneType: value }
                              }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="indoor">Indoor</SelectItem>
                              <SelectItem value="outdoor">Outdoor</SelectItem>
                              <SelectItem value="urban">Urban</SelectItem>
                              <SelectItem value="natural">Natural</SelectItem>
                              <SelectItem value="industrial">Industrial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Complexity</Label>
                          <Select
                            value={currentConfig.parameters.scene?.complexity || 'medium'}
                            onValueChange={(value: any) => setCurrentConfig(prev => ({
                              ...prev,
                              parameters: {
                                ...prev.parameters,
                                scene: { ...prev.parameters.scene, complexity: value }
                              }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="ultra">Ultra</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Object Density: {(currentConfig.parameters.scene?.objectDensity || 0.5).toFixed(2)}</Label>
                        <Slider
                          value={[currentConfig.parameters.scene?.objectDensity || 0.5]}
                          onValueChange={(value) => setCurrentConfig(prev => ({
                            ...prev,
                            parameters: {
                              ...prev.parameters,
                              scene: { ...prev.parameters.scene, objectDensity: value[0] }
                            }
                          }))}
                          min={0}
                          max={1}
                          step={0.1}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Enable Physics</Label>
                        <Switch
                          checked={currentConfig.parameters.scene?.enablePhysics || false}
                          onCheckedChange={(checked) => setCurrentConfig(prev => ({
                            ...prev,
                            parameters: {
                              ...prev.parameters,
                              scene: { ...prev.parameters.scene, enablePhysics: checked }
                            }
                          }))}
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="quality" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Auto Quality Check</Label>
                    <Switch
                      checked={currentConfig.quality.enableAutoQualityCheck}
                      onCheckedChange={(checked) => setCurrentConfig(prev => ({
                        ...prev,
                        quality: { ...prev.quality, enableAutoQualityCheck: checked }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Min Quality Score: {currentConfig.quality.thresholds.minQualityScore}</Label>
                    <Slider
                      value={[currentConfig.quality.thresholds.minQualityScore]}
                      onValueChange={(value) => setCurrentConfig(prev => ({
                        ...prev,
                        quality: {
                          ...prev.quality,
                          thresholds: { ...prev.quality.thresholds, minQualityScore: value[0] }
                        }
                      }))}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Retries: {currentConfig.quality.thresholds.maxRetries}</Label>
                    <Slider
                      value={[currentConfig.quality.thresholds.maxRetries]}
                      onValueChange={(value) => setCurrentConfig(prev => ({
                        ...prev,
                        quality: {
                          ...prev.quality,
                          thresholds: { ...prev.quality.thresholds, maxRetries: value[0] }
                        }
                      }))}
                      min={0}
                      max={10}
                      step={1}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Auto Regenerate</Label>
                    <Switch
                      checked={currentConfig.quality.thresholds.autoRegenerate}
                      onCheckedChange={(checked) => setCurrentConfig(prev => ({
                        ...prev,
                        quality: {
                          ...prev.quality,
                          thresholds: { ...prev.quality.thresholds, autoRegenerate: checked }
                        }
                      }))}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Quality Metrics</Label>
                    {currentConfig.quality.metrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={metric.enabled}
                            onCheckedChange={(checked) => {
                              const newMetrics = [...currentConfig.quality.metrics];
                              newMetrics[index].enabled = checked;
                              setCurrentConfig(prev => ({
                                ...prev,
                                quality: { ...prev.quality, metrics: newMetrics }
                              }));
                            }}
                          />
                          <span className="font-medium">{metric.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Threshold:</span>
                          <span className="font-medium">{metric.threshold}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Optimization Settings</Label>
                      <div className="mt-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Memory Optimization</Label>
                          <Switch
                            checked={currentConfig.parameters.optimization.memoryOptimization}
                            onCheckedChange={(checked) => setCurrentConfig(prev => ({
                              ...prev,
                              parameters: {
                                ...prev.parameters,
                                optimization: { ...prev.parameters.optimization, memoryOptimization: checked }
                              }
                            }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>GPU Optimization</Label>
                          <Switch
                            checked={currentConfig.parameters.optimization.gpuOptimization}
                            onCheckedChange={(checked) => setCurrentConfig(prev => ({
                              ...prev,
                              parameters: {
                                ...prev.parameters,
                                optimization: { ...prev.parameters.optimization, gpuOptimization: checked }
                              }
                            }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Parallel Generation</Label>
                          <Switch
                            checked={currentConfig.parameters.optimization.parallelGeneration}
                            onCheckedChange={(checked) => setCurrentConfig(prev => ({
                              ...prev,
                              parameters: {
                                ...prev.parameters,
                                optimization: { ...prev.parameters.optimization, parallelGeneration: checked }
                              }
                            }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Cache Results</Label>
                          <Switch
                            checked={currentConfig.parameters.optimization.cacheResults}
                            onCheckedChange={(checked) => setCurrentConfig(prev => ({
                              ...prev,
                              parameters: {
                                ...prev.parameters,
                                optimization: { ...prev.parameters.optimization, cacheResults: checked }
                              }
                            }))}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base font-medium">Output Settings</Label>
                      <div className="mt-2 space-y-3">
                        <div className="space-y-2">
                          <Label>Output Format</Label>
                          <Select
                            value={currentConfig.output.format}
                            onValueChange={(value: any) => setCurrentConfig(prev => ({
                              ...prev,
                              output: { ...prev.output, format: value }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="jpg">JPG</SelectItem>
                              <SelectItem value="png">PNG</SelectItem>
                              <SelectItem value="webp">WebP</SelectItem>
                              <SelectItem value="obj">OBJ</SelectItem>
                              <SelectItem value="gltf">GLTF</SelectItem>
                              <SelectItem value="ply">PLY</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Quality: {currentConfig.output.quality}%</Label>
                          <Slider
                            value={[currentConfig.output.quality]}
                            onValueChange={(value) => setCurrentConfig(prev => ({
                              ...prev,
                              output: { ...prev.output, quality: value[0] }
                            }))}
                            min={50}
                            max={100}
                            step={5}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Compression</Label>
                          <Switch
                            checked={currentConfig.output.compression}
                            onCheckedChange={(checked) => setCurrentConfig(prev => ({
                              ...prev,
                              output: { ...prev.output, compression: checked }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <div className="space-y-4">
          {/* Configuration List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Saved Configurations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {configs.map((config) => (
                    <div
                      key={config.id}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        selectedConfig?.id === config.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => loadConfiguration(config)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{config.name}</div>
                          <div className="text-sm text-gray-600">{config.type}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConfiguration(config.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Generation Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Generation Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={startGeneration}
                    disabled={!selectedConfig || isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Generation
                      </>
                    )}
                  </Button>
                  
                  {isGenerating && (
                    <Button
                      onClick={stopGeneration}
                      variant="outline"
                      className="w-full"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop Generation
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Quick Actions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Tasks */}
          {activeTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Active Tasks ({activeTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {activeTasks.map((task) => (
                      <div key={task.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${getStatusColor(task.status)} text-white`}>
                            {task.status}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {task.startTime.toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium">{task.currentStep}</div>
                          <Progress value={task.progress} className="h-2" />
                          <div className="text-xs text-gray-600">
                            {task.progress.toFixed(1)}% complete
                          </div>
                        </div>

                        {task.results.length > 0 && (
                          <div className="mt-2 text-sm text-green-600">
                            {task.results.length} results generated
                          </div>
                        )}

                        {task.errors.length > 0 && (
                          <div className="mt-2 text-sm text-red-600">
                            {task.errors.length} errors occurred
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 