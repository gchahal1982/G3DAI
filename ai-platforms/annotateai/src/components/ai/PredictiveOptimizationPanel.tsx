'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  RefreshCw
} from 'lucide-react';

// Import types from backend
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
  className?: string;
}

export function PredictiveOptimizationPanel({
  onConfigurationChange,
  onOptimizationStart,
  onOptimizationStop,
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

  // Mock backend connection - replace with actual backend calls
  const predictiveOptimizationRef = useRef<any>(null);

  // Initialize backend connection
  useEffect(() => {
    const initializeBackend = async () => {
      try {
        // Mock initialization - replace with actual backend initialization
        predictiveOptimizationRef.current = {
          predictPerformance: async (metrics: string[], timeframe: number) => {
            return generateMockPredictions(metrics, timeframe);
          },
          optimizeSystem: async (profile: string, options: any) => {
            return generateMockOptimizationResult(profile, options);
          },
          enableRealtimeOptimization: async (profile: string, options: any) => {
            setIsMonitoring(true);
            startRealtimeMonitoring();
          },
          analyzeBottlenecks: async () => {
            return generateMockBottleneckAnalysis();
          }
        };

        // Load default profiles
        setOptimizationProfiles(getDefaultProfiles());
        setSelectedProfile('balanced');
        
        // Start initial monitoring
        startMetricsCollection();
        
      } catch (error) {
        console.error('Failed to initialize predictive optimization backend:', error);
        setError('Failed to initialize optimization system');
      }
    };

    initializeBackend();

    return () => {
      stopMetricsCollection();
    };
  }, []);

  // Start metrics collection
  const startMetricsCollection = useCallback(() => {
    const interval = setInterval(() => {
      setCurrentMetrics(generateMockMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Stop metrics collection
  const stopMetricsCollection = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Start real-time monitoring
  const startRealtimeMonitoring = useCallback(() => {
    const interval = setInterval(async () => {
      if (predictiveOptimizationRef.current) {
        try {
          const newPredictions = await predictiveOptimizationRef.current.predictPerformance(
            ['fps', 'latency', 'memory', 'cpu'],
            selectedTimeframe
          );
          setPredictions(newPredictions);
        } catch (error) {
          console.error('Failed to update predictions:', error);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  // Generate performance predictions
  const generatePredictions = useCallback(async () => {
    if (!predictiveOptimizationRef.current) return;

    setLoading(true);
    try {
      const newPredictions = await predictiveOptimizationRef.current.predictPerformance(
        ['fps', 'latency', 'memory', 'cpu', 'gpu', 'network'],
        selectedTimeframe
      );
      setPredictions(newPredictions);
    } catch (error) {
      console.error('Failed to generate predictions:', error);
      setError('Failed to generate performance predictions');
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe]);

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
    if (predicted > current) return 'improving';
    if (predicted < current) return 'degrading';
    return 'stable';
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Mock data generators
  const generateMockPredictions = (metrics: string[], timeframe: number): PerformancePrediction[] => {
    return metrics.map(metric => ({
      metric,
      currentValue: Math.random() * 100,
      predictedValue: Math.random() * 100,
      confidence: 0.7 + Math.random() * 0.3,
      timeframe,
      factors: [
        {
          name: 'CPU Usage',
          impact: Math.random() * 0.5,
          direction: Math.random() > 0.5 ? 'positive' : 'negative',
          controllable: true,
          currentValue: Math.random() * 100,
          optimalValue: Math.random() * 100
        }
      ],
      recommendations: []
    }));
  };

  const generateMockOptimizationResult = (profile: string, options: any): OptimizationResult => {
    return {
      id: `opt-${Date.now()}`,
      status: 'completed',
      improvements: {
        'fps': 15.3,
        'latency': -23.7,
        'memory': -12.1
      },
      issues: [],
      rollbackAvailable: true
    };
  };

  const generateMockBottleneckAnalysis = (): BottleneckAnalysis => {
    return {
      resources: [
        {
          resource: 'CPU',
          utilization: 85.2,
          saturationPoint: 90,
          impact: 0.7
        },
        {
          resource: 'Memory',
          utilization: 78.5,
          saturationPoint: 85,
          impact: 0.5
        }
      ],
      algorithms: [
        {
          algorithm: 'Annotation Processing',
          complexity: 'O(n²)',
          hotspots: [
            {
              function: 'processAnnotations',
              file: 'annotation.ts',
              line: 245,
              frequency: 1000,
              timeSpent: 120.5,
              time: 120.5,
              calls: 1000
            }
          ]
        }
      ],
      workflows: [
        {
          workflow: 'Image Processing',
          step: 'Feature Extraction',
          waitTime: 45.2,
          processingTime: 89.7
        }
      ],
      correlations: [
        {
          bottlenecks: ['CPU', 'Memory'],
          resource1: 'CPU',
          resource2: 'Memory',
          correlation: 0.85,
          causality: 'strong'
        }
      ],
      recommendations: [
        {
          id: 'rec-1',
          type: 'configuration',
          priority: 'high',
          description: 'Optimize CPU-intensive operations',
          expectedImprovement: 25.3,
          implementation: {
            steps: [],
            estimatedTime: 120,
            requiredResources: [],
            automationLevel: 0.8
          },
          risks: []
        }
      ]
    };
  };

  const generateMockMetrics = (): SystemMetrics => {
    return {
      timestamp: Date.now(),
      cpu: {
        usage: 45 + Math.random() * 20,
        temperature: 65 + Math.random() * 15,
        frequency: 2400 + Math.random() * 400,
        cores: 8,
        threads: 16,
        loadAverage: [1.2, 1.5, 1.8]
      },
      gpu: {
        usage: 60 + Math.random() * 25,
        memory: 70 + Math.random() * 20,
        temperature: 70 + Math.random() * 10,
        frequency: 1800 + Math.random() * 200,
        powerDraw: 180 + Math.random() * 40,
        computeUnits: 64
      },
      memory: {
        used: 6.2 + Math.random() * 2,
        available: 16 - (6.2 + Math.random() * 2),
        cached: 2.1 + Math.random() * 0.5,
        buffers: 0.8 + Math.random() * 0.3,
        swapUsed: 0.1 + Math.random() * 0.2,
        pressure: Math.random() * 0.3
      },
      network: {
        bandwidth: 1000,
        latency: 10 + Math.random() * 5,
        packetLoss: Math.random() * 0.01,
        connections: 50 + Math.random() * 20,
        throughput: 150 + Math.random() * 50
      },
      application: {
        responseTime: 120 + Math.random() * 50,
        throughput: 1000 + Math.random() * 200,
        errorRate: Math.random() * 0.001,
        queueDepth: Math.random() * 10,
        activeUsers: 25 + Math.random() * 15,
        taskCompletion: 85 + Math.random() * 10
      }
    };
  };

  const getDefaultProfiles = (): OptimizationProfile[] => {
    return [
      {
        id: 'balanced',
        name: 'Balanced Performance',
        goals: [
          { metric: 'fps', target: 60, weight: 1, direction: 'maximize' },
          { metric: 'latency', target: 50, weight: 1, direction: 'minimize' }
        ],
        constraints: [
          { type: 'resource', metric: 'cpu', limit: 80, hard: true },
          { type: 'resource', metric: 'memory', limit: 85, hard: true }
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
          { metric: 'latency', target: 20, weight: 1, direction: 'minimize' }
        ],
        constraints: [
          { type: 'resource', metric: 'cpu', limit: 95, hard: false },
          { type: 'resource', metric: 'memory', limit: 90, hard: false }
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
          { metric: 'memory', target: 60, weight: 1, direction: 'minimize' }
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
      }
    ];
  };

  return (
    <div className={`predictive-optimization-panel ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Predictive Optimization</h2>
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
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Optimization Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile">Optimization Profile</Label>
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger id="profile">
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
                  <SelectTrigger id="timeframe">
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
                <Label htmlFor="risk">Risk Tolerance: {Math.round(riskTolerance * 100)}%</Label>
                <Slider
                  id="risk"
                  value={[riskTolerance]}
                  onValueChange={(value) => setRiskTolerance(value[0])}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="automation">Automation Level: {Math.round(automationLevel * 100)}%</Label>
                <Slider
                  id="automation"
                  value={[automationLevel]}
                  onValueChange={(value) => setAutomationLevel(value[0])}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
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
                          <span>{Math.round(prediction.confidence * 100)}%</span>
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
                          {Math.round(bottleneck.impact * 100)}% impact
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
                              {Math.round(rec.implementation.automationLevel * 100)}% automated
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
                        <Badge variant={currentMetrics.cpu.usage > 80 ? "destructive" : currentMetrics.cpu.usage > 60 ? "default" : "secondary"}>
                          {currentMetrics.cpu.usage.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Progress value={currentMetrics.cpu.usage} className="h-2" />
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
                        <Badge variant={currentMetrics.memory.used > 12 ? "destructive" : currentMetrics.memory.used > 8 ? "default" : "secondary"}>
                          {currentMetrics.memory.used.toFixed(1)}GB
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Progress value={(currentMetrics.memory.used / 16) * 100} className="h-2" />
                        <div className="text-sm text-gray-600">
                          {currentMetrics.memory.available.toFixed(1)}GB available
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
                        <Badge variant={currentMetrics.gpu.usage > 80 ? "destructive" : currentMetrics.gpu.usage > 60 ? "default" : "secondary"}>
                          {currentMetrics.gpu.usage.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Progress value={currentMetrics.gpu.usage} className="h-2" />
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

            {/* Optimization Results */}
            {optimizationResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Optimization Results
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