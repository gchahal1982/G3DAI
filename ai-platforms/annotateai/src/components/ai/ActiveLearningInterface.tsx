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
import { Input } from '../../../../../shared/components/ui/Input';
import { Label } from '../../../../../shared/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../shared/components/ui/Select';
import { Separator } from '../../../../../shared/components/ui/Separator';
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
  Lightbulb
} from 'lucide-react';

// Import types from backend
interface ActiveLearningConfig {
  strategy: SamplingStrategy;
  batchSize: number;
  uncertaintyThreshold: number;
  diversityWeight: number;
  modelEnsemble: ModelEnsembleConfig;
  iterativeConfig: IterativeConfig;
  budgetConstraints: BudgetConstraints;
  qualityMetrics: QualityMetrics;
  enableGPUAcceleration?: boolean;
}

type SamplingStrategy =
  | 'uncertainty' | 'diversity' | 'hybrid' | 'entropy' | 'margin'
  | 'least_confidence' | 'committee_disagreement' | 'query_by_committee'
  | 'expected_model_change' | 'variance_reduction' | 'information_density';

interface ModelEnsembleConfig {
  models: ModelConfig[];
  votingStrategy: 'majority' | 'weighted' | 'soft' | 'stacking';
  disagreementThreshold: number;
  confidenceAggregation: 'mean' | 'max' | 'min' | 'weighted_mean';
}

interface ModelConfig {
  id: string;
  type: 'classification' | 'regression' | 'segmentation' | 'detection';
  weight: number;
  uncertaintyMethod: UncertaintyMethod;
  enabled: boolean;
}

type UncertaintyMethod =
  | 'entropy' | 'variance' | 'mutual_information' | 'epistemic'
  | 'aleatoric' | 'predictive_variance' | 'monte_carlo_dropout';

interface IterativeConfig {
  maxIterations: number;
  convergenceThreshold: number;
  retrainingFrequency: number;
  validationSplit: number;
  earlyStoppingPatience: number;
}

interface BudgetConstraints {
  maxSamples: number;
  maxAnnotationCost: number;
  timeConstraints: TimeConstraints;
  resourceLimits: ResourceLimits;
}

interface TimeConstraints {
  maxIterationTime: number;
  totalTimeLimit: number;
  annotationTimePerSample: number;
}

interface ResourceLimits {
  maxMemoryUsage: number;
  maxGPUMemory: number;
  maxCPUCores: number;
  maxNetworkBandwidth: number;
}

interface QualityMetrics {
  targetAccuracy: number;
  minPrecision: number;
  minRecall: number;
  maxFalsePositiveRate: number;
  convergenceMetrics: ConvergenceMetrics;
}

interface ConvergenceMetrics {
  accuracyThreshold: number;
  lossThreshold: number;
  stabilityWindow: number;
  improvementThreshold: number;
}

interface SampleCandidate {
  id: string;
  data: any;
  features: Float32Array;
  metadata: SampleMetadata;
  uncertaintyScore: number;
  diversityScore: number;
  combinedScore: number;
  predictions: ModelPrediction[];
}

interface SampleMetadata {
  source: string;
  timestamp: Date;
  difficulty: 'easy' | 'medium' | 'hard' | 'unknown';
  domain: string;
  tags: string[];
  cost: number;
}

interface ModelPrediction {
  modelId: string;
  prediction: any;
  confidence: number;
  uncertainty: number;
  features: Float32Array;
}

interface ActiveLearningResult {
  selectedSamples: SampleCandidate[];
  iterationMetrics: IterationMetrics;
  modelPerformance: ModelPerformance;
  recommendations: string[];
  nextIterationConfig: Partial<ActiveLearningConfig>;
}

interface IterationMetrics {
  iteration: number;
  samplesSelected: number;
  totalAnnotated: number;
  avgUncertainty: number;
  avgDiversity: number;
  selectionTime: number;
  trainingTime: number;
}

interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  loss: number;
  convergenceStatus: 'converged' | 'improving' | 'stagnant' | 'diverging';
}

interface UncertaintyAnalysis {
  method: UncertaintyMethod;
  scores: Float32Array;
  statistics: UncertaintyStatistics;
  distribution: DistributionInfo;
}

interface UncertaintyStatistics {
  mean: number;
  std: number;
  min: number;
  max: number;
  median: number;
  percentiles: number[];
}

interface DistributionInfo {
  histogram: number[];
  bins: number[];
  skewness: number;
  kurtosis: number;
}

interface DiversityAnalysis {
  method: 'euclidean' | 'cosine' | 'manhattan' | 'mahalanobis';
  distances: Float32Array;
  clusters: ClusterInfo[];
  coverage: CoverageMetrics;
}

interface ClusterInfo {
  id: number;
  center: Float32Array;
  samples: string[];
  density: number;
  radius: number;
}

interface CoverageMetrics {
  featureSpaceCoverage: number;
  clusterCoverage: number;
  boundaryDensity: number;
  noveltyScore: number;
}

interface ActiveLearningStatistics {
  totalSamples: number;
  annotatedSamples: number;
  currentIteration: number;
  iterationHistory: IterationMetrics[];
  convergenceStatus: 'converged' | 'improving' | 'stagnant' | 'diverging';
}

interface ActiveLearningInterfaceProps {
  onSampleSelect?: (samples: SampleCandidate[]) => void;
  onIterationComplete?: (result: ActiveLearningResult) => void;
  onConfigChange?: (config: ActiveLearningConfig) => void;
  className?: string;
}

export function ActiveLearningInterface({
  onSampleSelect,
  onIterationComplete,
  onConfigChange,
  className = ''
}: ActiveLearningInterfaceProps) {
  // State management
  const [config, setConfig] = useState<ActiveLearningConfig>({
    strategy: 'uncertainty',
    batchSize: 10,
    uncertaintyThreshold: 0.7,
    diversityWeight: 0.3,
    modelEnsemble: {
      models: [],
      votingStrategy: 'weighted',
      disagreementThreshold: 0.5,
      confidenceAggregation: 'weighted_mean'
    },
    iterativeConfig: {
      maxIterations: 10,
      convergenceThreshold: 0.95,
      retrainingFrequency: 5,
      validationSplit: 0.2,
      earlyStoppingPatience: 3
    },
    budgetConstraints: {
      maxSamples: 1000,
      maxAnnotationCost: 10000,
      timeConstraints: {
        maxIterationTime: 300000,
        totalTimeLimit: 3600000,
        annotationTimePerSample: 30000
      },
      resourceLimits: {
        maxMemoryUsage: 8192,
        maxGPUMemory: 4096,
        maxCPUCores: 8,
        maxNetworkBandwidth: 1000
      }
    },
    qualityMetrics: {
      targetAccuracy: 0.95,
      minPrecision: 0.9,
      minRecall: 0.9,
      maxFalsePositiveRate: 0.05,
      convergenceMetrics: {
        accuracyThreshold: 0.95,
        lossThreshold: 0.1,
        stabilityWindow: 3,
        improvementThreshold: 0.01
      }
    },
    enableGPUAcceleration: true
  });

  const [samplePool, setSamplePool] = useState<SampleCandidate[]>([]);
  const [selectedSamples, setSelectedSamples] = useState<SampleCandidate[]>([]);
  const [iterationHistory, setIterationHistory] = useState<IterationMetrics[]>([]);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance | null>(null);
  const [uncertaintyAnalysis, setUncertaintyAnalysis] = useState<UncertaintyAnalysis | null>(null);
  const [diversityAnalysis, setDiversityAnalysis] = useState<DiversityAnalysis | null>(null);
  const [statistics, setStatistics] = useState<ActiveLearningStatistics | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSampleIds, setSelectedSampleIds] = useState<Set<string>>(new Set());

  // Mock backend connection
  const activeLearningRef = useRef<any>(null);

  // Initialize active learning backend
  useEffect(() => {
    const initializeActiveLearning = async () => {
      try {
        // Mock initialization - replace with actual backend
        activeLearningRef.current = {
          initialize: async (initialSamples: any[]) => {
            setIsInitialized(true);
            const mockSamples = generateMockSamplePool(100);
            setSamplePool(mockSamples);
            setStatistics(generateMockStatistics());
          },
          runIteration: async () => {
            return generateMockIterationResult();
          },
          addAnnotatedSamples: async (samples: SampleCandidate[]) => {
            console.log(`Adding ${samples.length} annotated samples`);
          },
          getStatistics: () => {
            return generateMockStatistics();
          }
        };

        // Initialize with mock data
        await activeLearningRef.current.initialize([]);
        
        // Set up mock model ensemble
        setConfig(prev => ({
          ...prev,
          modelEnsemble: {
            ...prev.modelEnsemble,
            models: generateMockModels()
          }
        }));

        // Generate initial analyses
        setUncertaintyAnalysis(generateMockUncertaintyAnalysis());
        setDiversityAnalysis(generateMockDiversityAnalysis());
        setModelPerformance(generateMockModelPerformance());
        
      } catch (error) {
        console.error('Failed to initialize active learning:', error);
        setError('Failed to initialize active learning system');
      }
    };

    initializeActiveLearning();
  }, []);

  // Run active learning iteration
  const runIteration = useCallback(async () => {
    if (!activeLearningRef.current || !isInitialized) return;

    setIsRunning(true);
    setError(null);

    try {
      const result = await activeLearningRef.current.runIteration();
      
      setSelectedSamples(result.selectedSamples);
      setIterationHistory(prev => [...prev, result.iterationMetrics]);
      setModelPerformance(result.modelPerformance);
      setRecommendations(result.recommendations);
      setCurrentIteration(prev => prev + 1);
      
      // Update analyses
      setUncertaintyAnalysis(generateMockUncertaintyAnalysis());
      setDiversityAnalysis(generateMockDiversityAnalysis());
      setStatistics(activeLearningRef.current.getStatistics());
      
      onIterationComplete?.(result);
      onSampleSelect?.(result.selectedSamples);
      
    } catch (error) {
      console.error('Failed to run iteration:', error);
      setError('Failed to run active learning iteration');
    } finally {
      setIsRunning(false);
    }
  }, [isInitialized, onIterationComplete, onSampleSelect]);

  // Add annotated samples
  const addAnnotatedSamples = useCallback(async (samples: SampleCandidate[]) => {
    if (!activeLearningRef.current) return;

    try {
      await activeLearningRef.current.addAnnotatedSamples(samples);
      
      // Remove from sample pool
      setSamplePool(prev => prev.filter(s => !samples.some(as => as.id === s.id)));
      
      // Update statistics
      setStatistics(activeLearningRef.current.getStatistics());
      
    } catch (error) {
      console.error('Failed to add annotated samples:', error);
      setError('Failed to add annotated samples');
    }
  }, []);

  // Update configuration
  const updateConfig = useCallback((updates: Partial<ActiveLearningConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  }, [config, onConfigChange]);

  // Toggle sample selection
  const toggleSampleSelection = useCallback((sampleId: string) => {
    setSelectedSampleIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sampleId)) {
        newSet.delete(sampleId);
      } else {
        newSet.add(sampleId);
      }
      return newSet;
    });
  }, []);

  // Select high uncertainty samples
  const selectHighUncertaintySamples = useCallback(() => {
    const sortedSamples = [...samplePool].sort((a, b) => b.uncertaintyScore - a.uncertaintyScore);
    const topSamples = sortedSamples.slice(0, config.batchSize);
    setSelectedSampleIds(new Set(topSamples.map(s => s.id)));
  }, [samplePool, config.batchSize]);

  // Get strategy icon
  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'uncertainty': return <Target className="h-4 w-4" />;
      case 'diversity': return <GitBranch className="h-4 w-4" />;
      case 'hybrid': return <Network className="h-4 w-4" />;
      case 'entropy': return <BarChart3 className="h-4 w-4" />;
      case 'margin': return <Gauge className="h-4 w-4" />;
      case 'least_confidence': return <TrendingDown className="h-4 w-4" />;
      case 'committee_disagreement': return <Users className="h-4 w-4" />;
      case 'query_by_committee': return <Users className="h-4 w-4" />;
      case 'expected_model_change': return <TrendingUp className="h-4 w-4" />;
      case 'variance_reduction': return <Activity className="h-4 w-4" />;
      case 'information_density': return <Database className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  // Get convergence status color
  const getConvergenceStatusColor = (status: string) => {
    switch (status) {
      case 'converged': return 'bg-green-500';
      case 'improving': return 'bg-blue-500';
      case 'stagnant': return 'bg-yellow-500';
      case 'diverging': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      case 'unknown': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // Mock data generators
  const generateMockSamplePool = (count: number): SampleCandidate[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `sample_${i + 1}`,
      data: { image: `image_${i + 1}.jpg` },
      features: new Float32Array(128).map(() => Math.random()),
      metadata: {
        source: `dataset_${Math.floor(i / 20) + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        difficulty: ['easy', 'medium', 'hard', 'unknown'][Math.floor(Math.random() * 4)] as any,
        domain: ['medical', 'automotive', 'industrial', 'natural'][Math.floor(Math.random() * 4)],
        tags: [`tag_${Math.floor(Math.random() * 10) + 1}`],
        cost: Math.floor(Math.random() * 100) + 10
      },
      uncertaintyScore: Math.random(),
      diversityScore: Math.random(),
      combinedScore: Math.random(),
      predictions: generateMockPredictions()
    }));
  };

  const generateMockPredictions = (): ModelPrediction[] => {
    return Array.from({ length: 3 }, (_, i) => ({
      modelId: `model_${i + 1}`,
      prediction: { class: Math.floor(Math.random() * 10), probability: Math.random() },
      confidence: Math.random(),
      uncertainty: Math.random(),
      features: new Float32Array(64).map(() => Math.random())
    }));
  };

  const generateMockIterationResult = (): ActiveLearningResult => {
    const selectedSamples = samplePool.slice(0, config.batchSize);
    
    return {
      selectedSamples,
      iterationMetrics: {
        iteration: currentIteration + 1,
        samplesSelected: selectedSamples.length,
        totalAnnotated: 50 + currentIteration * 10,
        avgUncertainty: 0.6 + Math.random() * 0.3,
        avgDiversity: 0.5 + Math.random() * 0.3,
        selectionTime: 1000 + Math.random() * 5000,
        trainingTime: 5000 + Math.random() * 10000
      },
      modelPerformance: generateMockModelPerformance(),
      recommendations: [
        'Consider increasing batch size for better coverage',
        'Model performance is improving steadily',
        'High uncertainty samples are being selected effectively'
      ],
      nextIterationConfig: {
        batchSize: config.batchSize + 2,
        uncertaintyThreshold: Math.max(0.5, config.uncertaintyThreshold - 0.05)
      }
    };
  };

  const generateMockModelPerformance = (): ModelPerformance => {
    const accuracy = 0.7 + Math.random() * 0.25;
    return {
      accuracy,
      precision: accuracy + Math.random() * 0.1,
      recall: accuracy + Math.random() * 0.1,
      f1Score: accuracy + Math.random() * 0.1,
      loss: 0.5 - accuracy * 0.4,
      convergenceStatus: ['converged', 'improving', 'stagnant', 'diverging'][Math.floor(Math.random() * 4)] as any
    };
  };

  const generateMockUncertaintyAnalysis = (): UncertaintyAnalysis => {
    const scores = new Float32Array(samplePool.length).map(() => Math.random());
    const histogram = Array.from({ length: 10 }, () => Math.floor(Math.random() * 20));
    
    return {
      method: 'entropy',
      scores,
      statistics: {
        mean: 0.5,
        std: 0.2,
        min: 0.1,
        max: 0.9,
        median: 0.5,
        percentiles: [0.1, 0.25, 0.5, 0.75, 0.9]
      },
      distribution: {
        histogram,
        bins: histogram.map((_, i) => i / 10),
        skewness: 0.2,
        kurtosis: 2.1
      }
    };
  };

  const generateMockDiversityAnalysis = (): DiversityAnalysis => {
    const distances = new Float32Array(samplePool.length).map(() => Math.random());
    
    return {
      method: 'euclidean',
      distances,
      clusters: Array.from({ length: 5 }, (_, i) => ({
        id: i,
        center: new Float32Array(128).map(() => Math.random()),
        samples: samplePool.slice(i * 20, (i + 1) * 20).map(s => s.id),
        density: 0.1 + Math.random() * 0.3,
        radius: 0.5 + Math.random() * 0.5
      })),
      coverage: {
        featureSpaceCoverage: 0.6 + Math.random() * 0.3,
        clusterCoverage: 0.7 + Math.random() * 0.2,
        boundaryDensity: 0.4 + Math.random() * 0.4,
        noveltyScore: 0.3 + Math.random() * 0.4
      }
    };
  };

  const generateMockStatistics = (): ActiveLearningStatistics => {
    return {
      totalSamples: samplePool.length,
      annotatedSamples: 50 + currentIteration * 10,
      currentIteration,
      iterationHistory,
      convergenceStatus: ['converged', 'improving', 'stagnant', 'diverging'][Math.floor(Math.random() * 4)] as any
    };
  };

  const generateMockModels = (): ModelConfig[] => {
    return [
      {
        id: 'model_1',
        type: 'classification',
        weight: 0.4,
        uncertaintyMethod: 'entropy',
        enabled: true
      },
      {
        id: 'model_2',
        type: 'classification',
        weight: 0.3,
        uncertaintyMethod: 'variance',
        enabled: true
      },
      {
        id: 'model_3',
        type: 'classification',
        weight: 0.3,
        uncertaintyMethod: 'mutual_information',
        enabled: true
      }
    ];
  };

  return (
    <div className={`active-learning-interface ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Active Learning Interface</h2>
            {statistics && (
              <Badge variant="outline">
                Iteration {statistics.currentIteration} • {statistics.annotatedSamples} annotated
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectHighUncertaintySamples}
              disabled={!isInitialized}
            >
              <Crosshair className="h-4 w-4 mr-2" />
              Auto-Select
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSampleIds(new Set())}
              disabled={selectedSampleIds.size === 0}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Selection
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={runIteration}
              disabled={isRunning || !isInitialized}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Iteration
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

        {/* Main Content */}
        <Tabs defaultValue="samples" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="samples">Samples</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="uncertainty">Uncertainty</TabsTrigger>
            <TabsTrigger value="diversity">Diversity</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="iterations">Iterations</TabsTrigger>
          </TabsList>

          {/* Samples Tab */}
          <TabsContent value="samples" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  {samplePool.length} samples • {selectedSampleIds.size} selected
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="sample-filter">Filter:</Label>
                  <Select defaultValue="all">
                    <SelectTrigger  className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="high_uncertainty">High Uncertainty</SelectItem>
                      <SelectItem value="high_diversity">High Diversity</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addAnnotatedSamples(
                    samplePool.filter(s => selectedSampleIds.has(s.id))
                  )}
                  disabled={selectedSampleIds.size === 0}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Annotated ({selectedSampleIds.size})
                </Button>
              </div>
            </div>

            {/* Sample Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {samplePool.slice(0, 20).map((sample) => (
                <Card 
                  key={sample.id}
                  className={`cursor-pointer transition-all ${
                    selectedSampleIds.has(sample.id) ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => toggleSampleSelection(sample.id)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{sample.id}</span>
                      <Badge 
                        className={`${getDifficultyColor(sample.metadata.difficulty)} text-white text-xs`}
                      >
                        {sample.metadata.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Uncertainty:</span>
                        <span className="font-medium">{sample.uncertaintyScore.toFixed(3)}</span>
                      </div>
                      <Progress value={sample.uncertaintyScore * 100} className="h-1" />
                      
                      <div className="flex justify-between text-xs">
                        <span>Diversity:</span>
                        <span className="font-medium">{sample.diversityScore.toFixed(3)}</span>
                      </div>
                      <Progress value={sample.diversityScore * 100} className="h-1" />
                      
                      <div className="flex justify-between text-xs">
                        <span>Combined:</span>
                        <span className="font-medium">{sample.combinedScore.toFixed(3)}</span>
                      </div>
                      <Progress value={sample.combinedScore * 100} className="h-1" />
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                      <span>{sample.metadata.domain}</span>
                      <span>${sample.metadata.cost}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Sampling Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="strategy">Strategy</Label>
                    <Select
                      value={config.strategy}
                      onValueChange={(value) => updateConfig({ strategy: value as SamplingStrategy })}
                    >
                      <SelectTrigger >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uncertainty">Uncertainty Sampling</SelectItem>
                        <SelectItem value="diversity">Diversity Sampling</SelectItem>
                        <SelectItem value="hybrid">Hybrid Sampling</SelectItem>
                        <SelectItem value="entropy">Entropy Sampling</SelectItem>
                        <SelectItem value="margin">Margin Sampling</SelectItem>
                        <SelectItem value="least_confidence">Least Confidence</SelectItem>
                        <SelectItem value="committee_disagreement">Committee Disagreement</SelectItem>
                        <SelectItem value="query_by_committee">Query by Committee</SelectItem>
                        <SelectItem value="expected_model_change">Expected Model Change</SelectItem>
                        <SelectItem value="variance_reduction">Variance Reduction</SelectItem>
                        <SelectItem value="information_density">Information Density</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batch-size">Batch Size: {config.batchSize}</Label>
                    <Slider
                      
                      value={[config.batchSize]}
                      onValueChange={(value) => updateConfig({ batchSize: value[0] })}
                      max={50}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="uncertainty-threshold">
                      Uncertainty Threshold: {config.uncertaintyThreshold.toFixed(2)}
                    </Label>
                    <Slider
                      
                      value={[config.uncertaintyThreshold]}
                      onValueChange={(value) => updateConfig({ uncertaintyThreshold: value[0] })}
                      max={1}
                      min={0}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diversity-weight">
                      Diversity Weight: {config.diversityWeight.toFixed(2)}
                    </Label>
                    <Slider
                      
                      value={[config.diversityWeight]}
                      onValueChange={(value) => updateConfig({ diversityWeight: value[0] })}
                      max={1}
                      min={0}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="gpu-acceleration">GPU Acceleration</Label>
                    <Switch
                      
                      checked={config.enableGPUAcceleration}
                      onCheckedChange={(checked) => updateConfig({ enableGPUAcceleration: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Budget Constraints
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-samples">Max Samples: {config.budgetConstraints.maxSamples}</Label>
                    <Slider
                      
                      value={[config.budgetConstraints.maxSamples]}
                      onValueChange={(value) => updateConfig({
                        budgetConstraints: {
                          ...config.budgetConstraints,
                          maxSamples: value[0]
                        }
                      })}
                      max={10000}
                      min={100}
                      step={100}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-cost">Max Cost: ${config.budgetConstraints.maxAnnotationCost}</Label>
                    <Slider
                      
                      value={[config.budgetConstraints.maxAnnotationCost]}
                      onValueChange={(value) => updateConfig({
                        budgetConstraints: {
                          ...config.budgetConstraints,
                          maxAnnotationCost: value[0]
                        }
                      })}
                      max={50000}
                      min={1000}
                      step={1000}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-iterations">
                      Max Iterations: {config.iterativeConfig.maxIterations}
                    </Label>
                    <Slider
                      
                      value={[config.iterativeConfig.maxIterations]}
                      onValueChange={(value) => updateConfig({
                        iterativeConfig: {
                          ...config.iterativeConfig,
                          maxIterations: value[0]
                        }
                      })}
                      max={50}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-accuracy">
                      Target Accuracy: {Math.round(config.qualityMetrics.targetAccuracy * 100)}%
                    </Label>
                    <Slider
                      
                      value={[config.qualityMetrics.targetAccuracy]}
                      onValueChange={(value) => updateConfig({
                        qualityMetrics: {
                          ...config.qualityMetrics,
                          targetAccuracy: value[0]
                        }
                      })}
                      max={0.99}
                      min={0.7}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Uncertainty Tab */}
          <TabsContent value="uncertainty" className="space-y-4">
            {uncertaintyAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Uncertainty Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Mean</div>
                          <div className="font-medium">{uncertaintyAnalysis.statistics.mean.toFixed(3)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Std Dev</div>
                          <div className="font-medium">{uncertaintyAnalysis.statistics.std.toFixed(3)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Min</div>
                          <div className="font-medium">{uncertaintyAnalysis.statistics.min.toFixed(3)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Max</div>
                          <div className="font-medium">{uncertaintyAnalysis.statistics.max.toFixed(3)}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Histogram</div>
                        <div className="flex items-end gap-1 h-20">
                          {uncertaintyAnalysis.distribution.histogram.map((count, i) => (
                            <div
                              key={i}
                              className="bg-blue-500 rounded-t flex-1"
                              style={{
                                height: `${(count / Math.max(...uncertaintyAnalysis.distribution.histogram)) * 100}%`
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>0</span>
                          <span>1</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Distribution Properties
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Skewness</span>
                          <span className="font-medium">{uncertaintyAnalysis.distribution.skewness.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Kurtosis</span>
                          <span className="font-medium">{uncertaintyAnalysis.distribution.kurtosis.toFixed(3)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Percentiles</div>
                        {uncertaintyAnalysis.statistics.percentiles.map((p, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>{[10, 25, 50, 75, 90][i]}th</span>
                            <span className="font-medium">{p.toFixed(3)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Diversity Tab */}
          <TabsContent value="diversity" className="space-y-4">
            {diversityAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5" />
                      Feature Space Coverage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Coverage</span>
                          <span className="font-medium">
                            {Math.round(diversityAnalysis.coverage.featureSpaceCoverage * 100)}%
                          </span>
                        </div>
                        <Progress value={diversityAnalysis.coverage.featureSpaceCoverage * 100} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Cluster Coverage</span>
                          <span className="font-medium">
                            {Math.round(diversityAnalysis.coverage.clusterCoverage * 100)}%
                          </span>
                        </div>
                        <Progress value={diversityAnalysis.coverage.clusterCoverage * 100} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Boundary Density</span>
                          <span className="font-medium">
                            {Math.round(diversityAnalysis.coverage.boundaryDensity * 100)}%
                          </span>
                        </div>
                        <Progress value={diversityAnalysis.coverage.boundaryDensity * 100} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Novelty Score</span>
                          <span className="font-medium">
                            {Math.round(diversityAnalysis.coverage.noveltyScore * 100)}%
                          </span>
                        </div>
                        <Progress value={diversityAnalysis.coverage.noveltyScore * 100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-5 w-5" />
                      Clusters ({diversityAnalysis.clusters.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {diversityAnalysis.clusters.map((cluster) => (
                          <div key={cluster.id} className="p-2 rounded border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">Cluster {cluster.id}</span>
                              <Badge variant="outline">{cluster.samples.length} samples</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Density:</span>
                                <span className="font-medium ml-1">{cluster.density.toFixed(3)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Radius:</span>
                                <span className="font-medium ml-1">{cluster.radius.toFixed(3)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            {modelPerformance && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Accuracy</span>
                      </div>
                      <Badge variant="outline">
                        {Math.round(modelPerformance.accuracy * 100)}%
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <Progress value={modelPerformance.accuracy * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Precision</span>
                      </div>
                      <Badge variant="outline">
                        {Math.round(modelPerformance.precision * 100)}%
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <Progress value={modelPerformance.precision * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-purple-500" />
                        <span className="font-medium">Recall</span>
                      </div>
                      <Badge variant="outline">
                        {Math.round(modelPerformance.recall * 100)}%
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <Progress value={modelPerformance.recall * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">F1 Score</span>
                      </div>
                      <Badge variant="outline">
                        {Math.round(modelPerformance.f1Score * 100)}%
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <Progress value={modelPerformance.f1Score * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-red-500" />
                        <span className="font-medium">Loss</span>
                      </div>
                      <Badge variant="outline">
                        {modelPerformance.loss.toFixed(3)}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <Progress value={Math.max(0, 100 - modelPerformance.loss * 100)} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-teal-500" />
                        <span className="font-medium">Convergence</span>
                      </div>
                      <Badge 
                        className={`${getConvergenceStatusColor(modelPerformance.convergenceStatus)} text-white`}
                      >
                        {modelPerformance.convergenceStatus}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-600">
                        Status: {modelPerformance.convergenceStatus}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 rounded border">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Iterations Tab */}
          <TabsContent value="iterations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Iteration History ({iterationHistory.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {iterationHistory.map((iteration) => (
                      <div key={iteration.iteration} className="p-3 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Iteration {iteration.iteration}</Badge>
                            <span className="text-sm text-gray-600">
                              {iteration.samplesSelected} samples selected
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {iteration.selectionTime.toFixed(0)}ms
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-gray-600">Total Annotated</div>
                            <div className="font-medium">{iteration.totalAnnotated}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Avg Uncertainty</div>
                            <div className="font-medium">{iteration.avgUncertainty.toFixed(3)}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Avg Diversity</div>
                            <div className="font-medium">{iteration.avgDiversity.toFixed(3)}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Training Time</div>
                            <div className="font-medium">{(iteration.trainingTime / 1000).toFixed(1)}s</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default ActiveLearningInterface; 