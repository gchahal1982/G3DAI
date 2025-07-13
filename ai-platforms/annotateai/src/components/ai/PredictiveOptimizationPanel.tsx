'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../shared/components/ui/Card';
import { Button } from '../../../../../shared/components/ui/Button';
import { Badge } from '../../../../../shared/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../shared/components/ui/Tabs';
import { Progress } from '../../../../../shared/components/ui/Progress';
import { Alert, AlertDescription } from '../../../../../shared/components/ui/Alert';
import { ScrollArea } from '../../../../../shared/components/ui/ScrollArea';
import { Switch } from '../../../../../shared/components/ui/Switch';
import { Slider } from '../../../../../shared/components/ui/Slider';
import { Label } from '../../../../../shared/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../shared/components/ui/Select';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Settings,
  BarChart3,
  Cpu,
  HardDrive,
  Network,
  Gauge,
  Clock,
  Wrench,
  Shield,
  Lightbulb,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';

// Import real backend services
import { OptimizationEngine } from '../../performance/OptimizationEngine';
import { PredictiveOptimization } from '../../ai/PredictiveOptimization';
import { ModelRunner } from '../../ai/ModelRunner';
import { Profiler } from '../../performance/Profiler';
import { LoadBalancer } from '../../performance/LoadBalancer';
import { MemoryManager } from '../../performance/MemoryManager';
import { GPUCompute } from '../../performance/GPUCompute';
import { AIWorkflowEngine } from '../../core/AIWorkflowEngine';
import { LightingSystem } from '../../core/LightingSystem';
import { MeshProcessor } from '../../core/MeshProcessor';
import { SpatialAnalyzer } from '../../core/SpatialAnalyzer';
import { PointCloudProcessor } from '../../core/PointCloudProcessor';
import { CollaborationEngine } from '../../core/CollaborationEngine';
import { ThreeDRenderer } from '../../core/ThreeDRenderer';
import { PhysicsEngine } from '../../core/PhysicsEngine';
import { ParticleSystem } from '../../core/ParticleSystem';
import { CloudIntegration } from '../../enterprise/CloudIntegration';
import { WorkflowEngine } from '../../enterprise/WorkflowEngine';
import { PerformanceOptimizer } from '../../integration/PerformanceOptimizer';

// Real backend interfaces
interface PerformancePrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: number;
  factors: InfluencingFactor[];
  recommendations: OptimizationRecommendation[];
}

interface InfluencingFactor {
  name: string;
  impact: number;
  direction: 'positive' | 'negative';
  controllable: boolean;
  currentValue: any;
  optimalValue: any;
}

interface OptimizationRecommendation {
  id: string;
  type: 'configuration' | 'resource' | 'algorithm' | 'workflow';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  expectedImprovement: number;
  implementation: ImplementationDetails;
  risks: Risk[];
}

interface ImplementationDetails {
  steps: ImplementationStep[];
  estimatedTime: number;
  requiredResources: Resource[];
  automationLevel: number;
  code?: string;
}

interface ImplementationStep {
  order: number;
  action: string;
  target: string;
  parameters: Record<string, any>;
  validation: ValidationCriteria;
}

interface Resource {
  type: 'cpu' | 'gpu' | 'memory' | 'storage' | 'network';
  amount: number;
  unit: string;
  duration: number;
}

interface Risk {
  type: string;
  probability: number;
  impact: number;
  mitigation: string;
}

interface ValidationCriteria {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  tolerance: number;
}

interface SystemMetrics {
  timestamp: number;
  cpu: CPUMetrics;
  gpu: GPUMetrics;
  memory: MemoryMetrics;
  network: NetworkMetrics;
  application: ApplicationMetrics;
}

interface CPUMetrics {
  usage: number;
  temperature: number;
  frequency: number;
  cores: number;
  threads: number;
  loadAverage: number[];
}

interface GPUMetrics {
  usage: number;
  memory: number;
  temperature: number;
  frequency: number;
  powerDraw: number;
  computeUnits: number;
}

interface MemoryMetrics {
  used: number;
  available: number;
  cached: number;
  buffers: number;
  swapUsed: number;
  pressure: number;
}

interface NetworkMetrics {
  bandwidth: number;
  latency: number;
  packetLoss: number;
  connections: number;
  throughput: number;
}

interface ApplicationMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  queueDepth: number;
  activeUsers: number;
  taskCompletion: number;
}

interface OptimizationProfile {
  id: string;
  name: string;
  goals: OptimizationGoal[];
  constraints: Constraint[];
  preferences: OptimizationPreferences;
}

interface OptimizationGoal {
  metric: string;
  target: number;
  weight: number;
  direction: 'minimize' | 'maximize';
}

interface Constraint {
  type: 'resource' | 'performance' | 'cost' | 'quality';
  metric: string;
  limit: number;
  hard: boolean;
}

interface OptimizationPreferences {
  aggressiveness: number;
  riskTolerance: number;
  automationLevel: number;
  costSensitivity: number;
}

interface BottleneckAnalysis {
  resources: ResourceBottleneck[];
  algorithms: AlgorithmicBottleneck[];
  workflows: WorkflowBottleneck[];
  correlations: BottleneckCorrelation[];
  recommendations: OptimizationRecommendation[];
}

interface ResourceBottleneck {
  resource: string;
  utilization: number;
  saturationPoint: number;
  impact: number;
}

interface AlgorithmicBottleneck {
  algorithm: string;
  complexity: string;
  hotspots: CodeHotspot[];
}

interface WorkflowBottleneck {
  workflow: string;
  step: string;
  waitTime: number;
  processingTime: number;
}

interface BottleneckCorrelation {
  bottlenecks: string[];
  resource1: string;
  resource2: string;
  correlation: number;
  causality: 'none' | 'weak' | 'strong';
}

interface CodeHotspot {
  function: string;
  file: string;
  line: number;
  frequency: number;
  timeSpent: number;
  time: number;
  calls: number;
}

interface OptimizationResult {
  id: string;
  status: 'completed' | 'partial' | 'failed';
  improvements: Record<string, number>;
  issues: string[];
  rollbackAvailable: boolean;
}

interface PredictiveOptimizationPanelProps {
  onConfigurationChange?: (config: any) => void;
  onOptimizationStart?: (profile: string) => void;
  onOptimizationStop?: () => void;
  onClose?: () => void;
  className?: string;
}

export function PredictiveOptimizationPanel({
  onConfigurationChange,
  onOptimizationStart,
  onOptimizationStop,
  onClose,
  className = ''
}: PredictiveOptimizationPanelProps) {
  // State management
  const [predictions, setPredictions] = useState<PerformancePrediction[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<SystemMetrics | null>(null);
  const [bottleneckAnalysis, setBottleneckAnalysis] = useState<BottleneckAnalysis | null>(null);
  const [optimizationProfiles, setOptimizationProfiles] = useState<OptimizationProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(300); // 5 minutes
  const [riskTolerance, setRiskTolerance] = useState<number>(0.5);
  const [automationLevel, setAutomationLevel] = useState<number>(0.7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);

  // Real backend service instances
  const optimizationEngineRef = useRef<OptimizationEngine | null>(null);
  const predictiveOptimizationRef = useRef<PredictiveOptimization | null>(null);
  const profilerRef = useRef<Profiler | null>(null);
  const modelRunnerRef = useRef<ModelRunner | null>(null);
  const loadBalancerRef = useRef<LoadBalancer | null>(null);
  const memoryManagerRef = useRef<MemoryManager | null>(null);
  const gpuComputeRef = useRef<GPUCompute | null>(null);
  const aiWorkflowEngineRef = useRef<AIWorkflowEngine | null>(null);
  const lightingSystemRef = useRef<LightingSystem | null>(null);
  const meshProcessorRef = useRef<MeshProcessor | null>(null);
  const spatialAnalyzerRef = useRef<SpatialAnalyzer | null>(null);
  const pointCloudProcessorRef = useRef<PointCloudProcessor | null>(null);
  const collaborationEngineRef = useRef<CollaborationEngine | null>(null);
  const threeDRendererRef = useRef<ThreeDRenderer | null>(null);
  const physicsEngineRef = useRef<PhysicsEngine | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const cloudIntegrationRef = useRef<CloudIntegration | null>(null);
  const workflowEngineRef = useRef<WorkflowEngine | null>(null);
  const performanceOptimizerRef = useRef<PerformanceOptimizer | null>(null);

  // Initialize all backend services
  useEffect(() => {
    const initializeBackend = async () => {
      try {
        setLoading(true);
        console.log('Initializing G3D Predictive Optimization Backend Services...');

        // Initialize core services
        try {
          modelRunnerRef.current = new ModelRunner();
          await modelRunnerRef.current.init();
        } catch (error) {
          console.warn('Failed to initialize ModelRunner:', error);
        }

        try {
          performanceOptimizerRef.current = new PerformanceOptimizer();
        } catch (error) {
          console.warn('Failed to initialize PerformanceOptimizer:', error);
        }

        // Initialize optimization engines
        try {
          optimizationEngineRef.current = new OptimizationEngine();
          optimizationEngineRef.current.start();
        } catch (error) {
          console.warn('Failed to initialize OptimizationEngine:', error);
        }

        try {
          predictiveOptimizationRef.current = new PredictiveOptimization(
            modelRunnerRef.current!,
            performanceOptimizerRef.current!
          );
          await predictiveOptimizationRef.current.init();
        } catch (error) {
          console.warn('Failed to initialize PredictiveOptimization:', error);
        }

        // Initialize profiler
        try {
          profilerRef.current = new Profiler({
            samplingInterval: 1000,
            enableCPUProfiling: true,
            enableMemoryProfiling: true,
            enableGPUProfiling: true,
            autoDetectBottlenecks: true
          });
          profilerRef.current.startProfiling('predictive-optimization');
        } catch (error) {
          console.warn('Failed to initialize Profiler:', error);
        }

        // Initialize performance services
        try {
          loadBalancerRef.current = new LoadBalancer({
            algorithm: 'resource_based' as any,
            autoScaling: { 
              enabled: true, 
              minNodes: 2, 
              maxNodes: 10,
              scaleUpThreshold: 0.8,
              scaleDownThreshold: 0.2,
              cooldownPeriod: 300000
            }
          });
        } catch (error) {
          console.warn('Failed to initialize LoadBalancer:', error);
        }

        try {
          memoryManagerRef.current = new MemoryManager({
            maxCPUMemory: 4 * 1024 * 1024 * 1024,
            maxGPUMemory: 2 * 1024 * 1024 * 1024
          });
        } catch (error) {
          console.warn('Failed to initialize MemoryManager:', error);
        }

        try {
          gpuComputeRef.current = new GPUCompute();
          await gpuComputeRef.current.init();
        } catch (error) {
          console.warn('Failed to initialize GPUCompute:', error);
        }

        // Initialize AI workflow engine
        try {
          aiWorkflowEngineRef.current = new AIWorkflowEngine();
          await aiWorkflowEngineRef.current.initialize();
        } catch (error) {
          console.warn('Failed to initialize AIWorkflowEngine:', error);
        }

        // Initialize core systems with simple constructors
        try {
          lightingSystemRef.current = new LightingSystem();
        } catch (error) {
          console.warn('Failed to initialize LightingSystem:', error);
        }

        try {
          spatialAnalyzerRef.current = new SpatialAnalyzer();
        } catch (error) {
          console.warn('Failed to initialize SpatialAnalyzer:', error);
        }

        try {
          collaborationEngineRef.current = new CollaborationEngine();
        } catch (error) {
          console.warn('Failed to initialize CollaborationEngine:', error);
        }

        try {
          particleSystemRef.current = new ParticleSystem({
            maxParticles: 10000,
            useGPU: true
          });
        } catch (error) {
          console.warn('Failed to initialize ParticleSystem:', error);
        }

        // Initialize enterprise services
        try {
          cloudIntegrationRef.current = new CloudIntegration();
        } catch (error) {
          console.warn('Failed to initialize CloudIntegration:', error);
        }

        // Load optimization profiles
        loadOptimizationProfiles();
        
        // Start real-time monitoring
        startRealtimeMonitoring();
        
        console.log('G3D Predictive Optimization Backend Services initialized successfully');
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize backend services:', error);
        setError('Failed to initialize optimization system');
        setLoading(false);
      }
    };

    initializeBackend();

    return () => {
      cleanup();
    };
  }, []);

  // Load optimization profiles from backend
  const loadOptimizationProfiles = useCallback(() => {
    if (!predictiveOptimizationRef.current) return;

    const profiles: OptimizationProfile[] = [
      {
        id: 'balanced',
        name: 'Balanced Performance',
        goals: [
          { metric: 'fps', target: 60, weight: 1, direction: 'maximize' },
          { metric: 'latency', target: 50, weight: 1, direction: 'minimize' },
          { metric: 'cpu', target: 70, weight: 0.8, direction: 'minimize' },
          { metric: 'memory', target: 80, weight: 0.8, direction: 'minimize' }
        ],
        constraints: [
          { type: 'resource', metric: 'cpu', limit: 80, hard: true },
          { type: 'resource', metric: 'memory', limit: 85, hard: true },
          { type: 'performance', metric: 'fps', limit: 30, hard: true }
        ],
        preferences: {
          aggressiveness: 0.5,
          riskTolerance: 0.3,
          automationLevel: 0.7,
          costSensitivity: 0.5
        }
      },
      {
        id: 'performance',
        name: 'Maximum Performance',
        goals: [
          { metric: 'fps', target: 120, weight: 1, direction: 'maximize' },
          { metric: 'latency', target: 20, weight: 1, direction: 'minimize' },
          { metric: 'throughput', target: 1000, weight: 0.9, direction: 'maximize' }
        ],
        constraints: [
          { type: 'resource', metric: 'cpu', limit: 95, hard: false },
          { type: 'resource', metric: 'memory', limit: 90, hard: false },
          { type: 'cost', metric: 'power', limit: 300, hard: false }
        ],
        preferences: {
          aggressiveness: 0.8,
          riskTolerance: 0.6,
          automationLevel: 0.8,
          costSensitivity: 0.2
        }
      },
      {
        id: 'efficiency',
        name: 'Resource Efficiency',
        goals: [
          { metric: 'cpu', target: 40, weight: 1, direction: 'minimize' },
          { metric: 'memory', target: 60, weight: 1, direction: 'minimize' },
          { metric: 'power', target: 150, weight: 0.9, direction: 'minimize' }
        ],
        constraints: [
          { type: 'performance', metric: 'fps', limit: 30, hard: true },
          { type: 'quality', metric: 'accuracy', limit: 90, hard: true }
        ],
        preferences: {
          aggressiveness: 0.3,
          riskTolerance: 0.2,
          automationLevel: 0.6,
          costSensitivity: 0.8
        }
      },
      {
        id: 'quality',
        name: 'Quality Focused',
        goals: [
          { metric: 'accuracy', target: 95, weight: 1, direction: 'maximize' },
          { metric: 'precision', target: 90, weight: 0.9, direction: 'maximize' },
          { metric: 'recall', target: 85, weight: 0.8, direction: 'maximize' }
        ],
        constraints: [
          { type: 'performance', metric: 'latency', limit: 200, hard: false },
          { type: 'resource', metric: 'cpu', limit: 85, hard: false }
        ],
        preferences: {
          aggressiveness: 0.4,
          riskTolerance: 0.25,
          automationLevel: 0.5,
          costSensitivity: 0.3
        }
      }
    ];

    setOptimizationProfiles(profiles);
    setSelectedProfile('balanced');
  }, []);

  // Start real-time monitoring
  const startRealtimeMonitoring = useCallback(() => {
    if (!optimizationEngineRef.current || !profilerRef.current) return;

    const monitoringInterval = setInterval(async () => {
      try {
        // Collect metrics from all systems
        const metrics = await collectSystemMetrics();
        setCurrentMetrics(metrics);

        // Update predictions
        if (predictiveOptimizationRef.current) {
          const newPredictions = await predictiveOptimizationRef.current.predictPerformance(
            ['fps', 'latency', 'cpu', 'memory', 'gpu', 'throughput'],
            selectedTimeframe,
            selectedProfile
          );
          setPredictions(newPredictions);
        }

        // Analyze bottlenecks
        if (predictiveOptimizationRef.current) {
          const bottlenecks = await predictiveOptimizationRef.current.analyzeBottlenecks();
          setBottleneckAnalysis(bottlenecks);
          setRecommendations(bottlenecks.recommendations);
        }

      } catch (error) {
        console.error('Error in real-time monitoring:', error);
      }
    }, 2000);

    return () => clearInterval(monitoringInterval);
  }, [selectedTimeframe, selectedProfile]);

  // Collect system metrics from all backend services
  const collectSystemMetrics = useCallback(async (): Promise<SystemMetrics> => {
    const timestamp = Date.now();
    
    // Collect CPU metrics
    const cpuMetrics = optimizationEngineRef.current?.getCurrentMetrics()?.cpu || {
      usage: 0,
      temperature: 0,
      frequency: 0,
      cores: 0,
      threads: 0,
      loadAverage: []
    };

    // Collect GPU metrics from GPUCompute
    const gpuStats = gpuComputeRef.current?.getStats?.() || {};
    const gpuMetrics: GPUMetrics = {
      usage: (gpuStats as any)?.usage || 0,
      memory: (gpuStats as any)?.memoryUsage || 0,
      temperature: (gpuStats as any)?.temperature || 0,
      frequency: (gpuStats as any)?.clockSpeed || 0,
      powerDraw: (gpuStats as any)?.powerDraw || 0,
      computeUnits: (gpuStats as any)?.computeUnits || 0
    };

    // Collect Memory metrics from MemoryManager
    const memoryStats = memoryManagerRef.current?.stats || {};
    const memoryMetrics: MemoryMetrics = {
      used: (memoryStats as any)?.totalUsed || 0,
      available: (memoryStats as any)?.totalAvailable || 0,
      cached: (memoryStats as any)?.cached || 0,
      buffers: (memoryStats as any)?.buffers || 0,
      swapUsed: (memoryStats as any)?.swapUsed || 0,
      pressure: (memoryStats as any)?.pressure || 0
    };

    // Collect Network metrics from LoadBalancer
    const networkStats = loadBalancerRef.current?.getStats?.() || {};
    const networkMetrics: NetworkMetrics = {
      bandwidth: (networkStats as any)?.bandwidth || 0,
      latency: (networkStats as any)?.latency || 0,
      packetLoss: (networkStats as any)?.packetLoss || 0,
      connections: (networkStats as any)?.connections || 0,
      throughput: (networkStats as any)?.throughput || 0
    };

    // Collect Application metrics from various systems
    const renderStats = threeDRendererRef.current?.getStats?.() || {};
    const physicsStats = (physicsEngineRef.current as any)?.getStats?.() || {};
    const particleStats = (particleSystemRef.current as any)?.getStats?.() || {};
    const workflowStats = await aiWorkflowEngineRef.current?.getWorkflowMetrics?.('system') || {};

    const applicationMetrics: ApplicationMetrics = {
      responseTime: (workflowStats as any)?.averageRunTime || 0,
      throughput: (workflowStats as any)?.totalRuns || 0,
      errorRate: (1 - ((workflowStats as any)?.successRate || 1)) * 100,
      queueDepth: (physicsStats as any)?.bodyCount || 0,
      activeUsers: (collaborationEngineRef.current as any)?.getActiveUsers?.() || 0,
      taskCompletion: (workflowStats as any)?.successRate ? (workflowStats as any).successRate * 100 : 0
    };

    return {
      timestamp,
      cpu: cpuMetrics,
      gpu: gpuMetrics,
      memory: memoryMetrics,
      network: networkMetrics,
      application: applicationMetrics
    };
  }, []);

  // Generate performance predictions
  const generatePredictions = useCallback(async () => {
    if (!predictiveOptimizationRef.current) return;

    setLoading(true);
    try {
      const newPredictions = await predictiveOptimizationRef.current.predictPerformance(
        ['fps', 'latency', 'memory', 'cpu', 'gpu', 'network', 'throughput', 'accuracy'],
        selectedTimeframe,
        selectedProfile
      );
      setPredictions(newPredictions);
    } catch (error) {
      console.error('Failed to generate predictions:', error);
      setError('Failed to generate performance predictions');
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe, selectedProfile]);

  // Analyze bottlenecks
  const analyzeBottlenecks = useCallback(async () => {
    if (!predictiveOptimizationRef.current) return;

    setLoading(true);
    try {
      const analysis = await predictiveOptimizationRef.current.analyzeBottlenecks();
      setBottleneckAnalysis(analysis);
      setRecommendations(analysis.recommendations);
    } catch (error) {
      console.error('Failed to analyze bottlenecks:', error);
      setError('Failed to analyze system bottlenecks');
    } finally {
      setLoading(false);
    }
  }, []);

  // Start optimization
  const startOptimization = useCallback(async () => {
    if (!predictiveOptimizationRef.current || !selectedProfile) return;

    setIsOptimizing(true);
    setError(null);
    
    try {
      const result = await predictiveOptimizationRef.current.optimizeSystem(selectedProfile, {
        maxDuration: 300000, // 5 minutes
        maxRisk: riskTolerance,
        requireApproval: automationLevel < 0.8
      });
      
      setOptimizationResults(prev => [result, ...prev]);
      setIsMonitoring(true);
      onOptimizationStart?.(selectedProfile);
    } catch (error) {
      console.error('Failed to start optimization:', error);
      setError('Failed to start system optimization');
    } finally {
      setIsOptimizing(false);
    }
  }, [selectedProfile, riskTolerance, automationLevel, onOptimizationStart]);

  // Stop optimization
  const stopOptimization = useCallback(() => {
    setIsOptimizing(false);
    setIsMonitoring(false);
    onOptimizationStop?.();
  }, [onOptimizationStop]);

  // Enable real-time optimization
  const enableRealtimeOptimization = useCallback(async () => {
    if (!predictiveOptimizationRef.current || !selectedProfile) return;

    try {
      await predictiveOptimizationRef.current.enableRealtimeOptimization(selectedProfile, {
        interval: 5000,
        threshold: 0.1,
        maxOptimizations: 10
      });
      setIsMonitoring(true);
    } catch (error) {
      console.error('Failed to enable real-time optimization:', error);
      setError('Failed to enable real-time optimization');
    }
  }, [selectedProfile]);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop all services
    optimizationEngineRef.current?.stop();
    profilerRef.current?.dispose();
    predictiveOptimizationRef.current?.dispose();
    memoryManagerRef.current?.dispose();
    gpuComputeRef.current?.dispose();
    threeDRendererRef.current?.dispose();
    physicsEngineRef.current?.dispose();
    particleSystemRef.current?.dispose();
    cloudIntegrationRef.current?.dispose();
    workflowEngineRef.current?.dispose();
    performanceOptimizerRef.current?.dispose();
  }, []);

  // Configuration change handler
  useEffect(() => {
    if (onConfigurationChange) {
      onConfigurationChange({
        selectedProfile,
        riskTolerance,
        automationLevel,
        selectedTimeframe,
        isMonitoring,
        isOptimizing
      });
    }
  }, [selectedProfile, riskTolerance, automationLevel, selectedTimeframe, isMonitoring, isOptimizing, onConfigurationChange]);

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Get performance trend
  const getPerformanceTrend = (current: number, predicted: number) => {
    const threshold = 0.05; // 5% threshold
    const change = (predicted - current) / current;
    if (change > threshold) return 'improving';
    if (change < -threshold) return 'degrading';
    return 'stable';
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className={`predictive-optimization-panel ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">G3D Predictive Optimization</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generatePredictions}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Analyze
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeBottlenecks}
              disabled={loading}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Bottlenecks
            </Button>
            <Button
              variant={isMonitoring ? "destructive" : "default"}
              size="sm"
              onClick={isMonitoring ? stopOptimization : startOptimization}
              disabled={isOptimizing || !selectedProfile}
            >
              {isMonitoring ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Optimize
                </>
              )}
            </Button>
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Alert className="border-blue-200 bg-blue-50">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>Initializing G3D backend services...</AlertDescription>
          </Alert>
        )}

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              G3D Optimization Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile">Optimization Profile</Label>
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {optimizationProfiles.map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeframe">Prediction Timeframe</Label>
                <Select value={selectedTimeframe.toString()} onValueChange={(value) => setSelectedTimeframe(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                    <SelectItem value="900">15 minutes</SelectItem>
                    <SelectItem value="3600">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk">Risk Tolerance: {formatPercentage(riskTolerance)}</Label>
                <Slider
                  value={[riskTolerance]}
                  onValueChange={(value) => setRiskTolerance(value[0])}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="automation">Automation Level: {formatPercentage(automationLevel)}</Label>
                <Slider
                  value={[automationLevel]}
                  onValueChange={(value) => setAutomationLevel(value[0])}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="realtime">Real-time Optimization</Label>
                <Switch
                  id="realtime"
                  checked={isMonitoring}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      enableRealtimeOptimization();
                    } else {
                      stopOptimization();
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="predictions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* Performance Predictions */}
          <TabsContent value="predictions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictions.map((prediction, index) => {
                const trend = getPerformanceTrend(prediction.currentValue, prediction.predictedValue);
                const improvement = ((prediction.predictedValue - prediction.currentValue) / prediction.currentValue) * 100;
                
                return (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            trend === 'improving' ? 'bg-green-500' : 
                            trend === 'degrading' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                          <span className="font-medium capitalize">{prediction.metric}</span>
                        </div>
                        {trend === 'improving' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : trend === 'degrading' ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <Activity className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current:</span>
                          <span>{prediction.currentValue.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Predicted:</span>
                          <span>{prediction.predictedValue.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Improvement:</span>
                          <span className={improvement >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Confidence</span>
                          <span>{formatPercentage(prediction.confidence)}</span>
                        </div>
                        <Progress value={prediction.confidence * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Bottleneck Analysis */}
          <TabsContent value="bottlenecks" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Resource Bottlenecks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bottleneckAnalysis?.resources.map((bottleneck, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            bottleneck.utilization >= bottleneck.saturationPoint ? 'bg-red-500' : 
                            bottleneck.utilization >= bottleneck.saturationPoint * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div>
                            <div className="font-medium">{bottleneck.resource}</div>
                            <div className="text-sm text-gray-600">
                              {bottleneck.utilization.toFixed(1)}% utilization
                            </div>
                          </div>
                        </div>
                        <Badge variant={bottleneck.impact >= 0.7 ? "destructive" : bottleneck.impact >= 0.4 ? "default" : "secondary"}>
                          {formatPercentage(bottleneck.impact)} impact
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    Algorithm Bottlenecks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bottleneckAnalysis?.algorithms.map((bottleneck, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{bottleneck.algorithm}</div>
                          <Badge variant="outline">{bottleneck.complexity}</Badge>
                        </div>
                        <div className="space-y-2">
                          {bottleneck.hotspots.map((hotspot, idx) => (
                            <div key={idx} className="text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>{hotspot.function}</span>
                                <span>{hotspot.timeSpent.toFixed(1)}ms</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {hotspot.file}:{hotspot.line}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Workflow Bottlenecks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bottleneckAnalysis?.workflows.map((bottleneck, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="font-medium">{bottleneck.workflow}</div>
                        <div className="text-sm text-gray-600">{bottleneck.step}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {bottleneck.processingTime.toFixed(1)}ms processing
                        </div>
                        <div className="text-sm text-gray-600">
                          {bottleneck.waitTime.toFixed(1)}ms waiting
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="recommendations" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline">{rec.type}</Badge>
                          </div>
                          <h4 className="font-medium mb-2">{rec.description}</h4>
                          <div className="text-sm text-gray-600 mb-3">
                            Expected improvement: <span className="font-medium text-green-600">
                              +{rec.expectedImprovement.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDuration(rec.implementation.estimatedTime)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="h-4 w-4" />
                              {formatPercentage(rec.implementation.automationLevel)} automated
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                          <Button size="sm">
                            <Wrench className="h-4 w-4 mr-2" />
                            Apply
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Real-time Monitoring */}
          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentMetrics && (
                <>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">CPU</span>
                        </div>
                        <Badge variant={currentMetrics.cpu.usage > 0.8 ? "destructive" : currentMetrics.cpu.usage > 0.6 ? "default" : "secondary"}>
                          {formatPercentage(currentMetrics.cpu.usage)}
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Progress value={currentMetrics.cpu.usage * 100} className="h-2" />
                        <div className="text-sm text-gray-600">
                          {currentMetrics.cpu.temperature.toFixed(1)}°C • {currentMetrics.cpu.frequency.toFixed(0)}MHz
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-5 w-5 text-green-500" />
                          <span className="font-medium">Memory</span>
                        </div>
                        <Badge variant={currentMetrics.memory.used > currentMetrics.memory.available * 0.8 ? "destructive" : currentMetrics.memory.used > currentMetrics.memory.available * 0.6 ? "default" : "secondary"}>
                          {formatBytes(currentMetrics.memory.used)}
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Progress value={(currentMetrics.memory.used / currentMetrics.memory.available) * 100} className="h-2" />
                        <div className="text-sm text-gray-600">
                          {formatBytes(currentMetrics.memory.available)} available
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gauge className="h-5 w-5 text-purple-500" />
                          <span className="font-medium">GPU</span>
                        </div>
                        <Badge variant={currentMetrics.gpu.usage > 0.8 ? "destructive" : currentMetrics.gpu.usage > 0.6 ? "default" : "secondary"}>
                          {formatPercentage(currentMetrics.gpu.usage)}
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Progress value={currentMetrics.gpu.usage * 100} className="h-2" />
                        <div className="text-sm text-gray-600">
                          {currentMetrics.gpu.temperature.toFixed(1)}°C • {currentMetrics.gpu.powerDraw.toFixed(0)}W
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Network className="h-5 w-5 text-orange-500" />
                          <span className="font-medium">Network</span>
                        </div>
                        <Badge variant={currentMetrics.network.latency > 50 ? "destructive" : currentMetrics.network.latency > 20 ? "default" : "secondary"}>
                          {currentMetrics.network.latency.toFixed(1)}ms
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Progress value={(currentMetrics.network.throughput / 1000) * 100} className="h-2" />
                        <div className="text-sm text-gray-600">
                          {currentMetrics.network.throughput.toFixed(0)}MB/s throughput
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  G3D System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Optimization Engine</span>
                      <Badge variant="secondary">{optimizationEngineRef.current ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Predictive AI</span>
                      <Badge variant="secondary">{predictiveOptimizationRef.current ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Profiler</span>
                      <Badge variant="secondary">{profilerRef.current ? 'Active' : 'Inactive'}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">GPU Compute</span>
                      <Badge variant="secondary">{gpuComputeRef.current ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">3D Renderer</span>
                      <Badge variant="secondary">{threeDRendererRef.current ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Physics Engine</span>
                      <Badge variant="secondary">{physicsEngineRef.current ? 'Active' : 'Inactive'}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cloud Integration</span>
                      <Badge variant="secondary">{cloudIntegrationRef.current ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Workflow Engine</span>
                      <Badge variant="secondary">{workflowEngineRef.current ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Collaboration</span>
                      <Badge variant="secondary">{collaborationEngineRef.current ? 'Active' : 'Inactive'}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Optimization Results */}
            {optimizationResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Recent Optimization Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {optimizationResults.slice(0, 5).map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            result.status === 'completed' ? 'bg-green-500' : 
                            result.status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <div className="font-medium">Optimization {result.id}</div>
                            <div className="text-sm text-gray-600">
                              Status: {result.status}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            {Object.entries(result.improvements).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {value > 0 ? '+' : ''}{value.toFixed(1)}%
                              </span>
                            ))}
                          </div>
                          {result.rollbackAvailable && (
                            <Button size="sm" variant="outline" className="mt-1">
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Rollback
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default PredictiveOptimizationPanel; 