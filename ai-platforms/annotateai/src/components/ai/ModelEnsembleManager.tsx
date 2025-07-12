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
import { Textarea } from '../../../../../shared/components/ui/Textarea';
import { Separator } from '../../../../../shared/components/ui/Separator';
import { 
  GitBranch, 
  Vote, 
  TrendingUp, 
  TrendingDown,
  Target,
  Users,
  Settings,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Minus,
  Trash2,
  Edit,
  Save,
  Copy,
  Info,
  HelpCircle,
  Zap,
  Shield,
  Timer,
  Gauge,
  Brain,
  Network,
  Layers,
  Cpu,
  MemoryStick,
  ArrowUpDown,
  ArrowRight,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  X,
  Lock,
  Unlock,
  Sparkles,
  Wrench,
  Database,
  FileText,
  BarChart,
  PieChart,
  LineChart,
  Grid3X3 as Grid
} from 'lucide-react';

// Import types from backend
interface EnsembleConfig {
  models: EnsembleModel[];
  votingStrategy: VotingStrategy;
  aggregationMethod: AggregationMethod;
  confidenceThreshold: number;
  diversityWeight: number;
  performanceWeighting: boolean;
  dynamicWeighting: boolean;
  calibration: CalibrationConfig;
}

type VotingStrategy =
  | 'majority' | 'weighted' | 'soft' | 'stacking' | 'bayesian'
  | 'rank_based' | 'confidence_weighted' | 'performance_weighted';

type AggregationMethod =
  | 'mean' | 'weighted_mean' | 'median' | 'max' | 'min'
  | 'geometric_mean' | 'harmonic_mean' | 'trimmed_mean';

interface EnsembleModel {
  id: string;
  name: string;
  type: ModelType;
  weight: number;
  performance: ModelPerformance;
  config: ModelConfig;
  enabled: boolean;
  lastUpdated: Date;
}

type ModelType =
  | 'classification' | 'regression' | 'segmentation' | 'detection'
  | 'generation' | 'embedding' | 'transformer' | 'cnn' | 'rnn';

interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  loss: number;
  latency: number;
  reliability: number;
  calibration: number;
}

interface ModelConfig {
  architecture: string;
  parameters: Record<string, any>;
  preprocessing: PreprocessingConfig;
  postprocessing: PostprocessingConfig;
  optimization: OptimizationConfig;
}

interface PreprocessingConfig {
  normalization: 'standard' | 'minmax' | 'robust' | 'none';
  augmentation: AugmentationConfig[];
  featureSelection: FeatureSelectionConfig;
}

interface AugmentationConfig {
  type: string;
  probability: number;
  parameters: Record<string, any>;
}

interface FeatureSelectionConfig {
  method: 'variance' | 'correlation' | 'mutual_info' | 'chi2' | 'none';
  threshold: number;
  maxFeatures?: number;
}

interface PostprocessingConfig {
  calibration: boolean;
  smoothing: SmoothingConfig;
  thresholding: ThresholdingConfig;
}

interface SmoothingConfig {
  enabled: boolean;
  method: 'gaussian' | 'median' | 'bilateral';
  parameters: Record<string, any>;
}

interface ThresholdingConfig {
  enabled: boolean;
  method: 'fixed' | 'adaptive' | 'otsu';
  threshold: number;
}

interface OptimizationConfig {
  quantization: boolean;
  pruning: boolean;
  distillation: boolean;
  gpuAcceleration: boolean;
}

interface CalibrationConfig {
  enabled: boolean;
  method: 'platt' | 'isotonic' | 'temperature' | 'beta';
  validationSplit: number;
  crossValidation: boolean;
}

interface EnsemblePrediction {
  prediction: any;
  confidence: number;
  uncertainty: number;
  modelContributions: ModelContribution[];
  metadata: PredictionMetadata;
}

interface ModelContribution {
  modelId: string;
  prediction: any;
  confidence: number;
  weight: number;
  contribution: number;
}

interface PredictionMetadata {
  timestamp: Date;
  processingTime: number;
  inputShape: number[];
  outputShape: number[];
  ensembleMethod: string;
}

interface EnsembleMetrics {
  overallAccuracy: number;
  ensembleGain: number;
  diversityScore: number;
  calibrationError: number;
  averageLatency: number;
  modelAgreement: number;
  uncertaintyReduction: number;
}

interface DiversityAnalysis {
  pairwiseCorrelations: number[][];
  diversityMeasures: DiversityMeasure[];
  complementarity: ComplementarityScore[];
}

interface DiversityMeasure {
  type: 'disagreement' | 'correlation' | 'entropy' | 'kappa';
  value: number;
  interpretation: string;
}

interface ComplementarityScore {
  modelPair: [string, string];
  score: number;
  strengths: string[];
  weaknesses: string[];
}

interface ModelEnsembleManagerProps {
  onModelAdd?: (model: EnsembleModel) => void;
  onModelRemove?: (modelId: string) => void;
  onPredictionRun?: (prediction: EnsemblePrediction) => void;
  onConfigChange?: (config: EnsembleConfig) => void;
  className?: string;
}

export function ModelEnsembleManager({
  onModelAdd,
  onModelRemove,
  onPredictionRun,
  onConfigChange,
  className = ''
}: ModelEnsembleManagerProps) {
  // State management
  const [models, setModels] = useState<Map<string, EnsembleModel>>(new Map());
  const [config, setConfig] = useState<EnsembleConfig>({
    models: [],
    votingStrategy: 'weighted',
    aggregationMethod: 'weighted_mean',
    confidenceThreshold: 0.5,
    diversityWeight: 0.3,
    performanceWeighting: true,
    dynamicWeighting: true,
    calibration: {
      enabled: true,
      method: 'platt',
      validationSplit: 0.2,
      crossValidation: true
    }
  });
  const [ensembleMetrics, setEnsembleMetrics] = useState<EnsembleMetrics | null>(null);
  const [diversityAnalysis, setDiversityAnalysis] = useState<DiversityAnalysis | null>(null);
  const [predictions, setPredictions] = useState<EnsemblePrediction[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Model creation/editing state
  const [showModelForm, setShowModelForm] = useState(false);
  const [editingModel, setEditingModel] = useState<EnsembleModel | null>(null);
  const [newModel, setNewModel] = useState<Partial<EnsembleModel>>({
    name: '',
    type: 'classification',
    weight: 1.0,
    enabled: true
  });

  // Mock backend connection
  const modelEnsembleRef = useRef<any>(null);

  // Initialize ensemble backend
  useEffect(() => {
    const initializeEnsemble = async () => {
      try {
        // Mock initialization - replace with actual backend
        modelEnsembleRef.current = {
          predict: async (input: any) => {
            return generateMockPrediction();
          },
          predictBatch: async (inputs: any[]) => {
            return inputs.map(() => generateMockPrediction());
          },
          getEnsembleMetrics: () => {
            return generateMockEnsembleMetrics();
          },
          updateModelWeights: async () => {
            console.log('Updating model weights');
          },
          calibrateModels: async (validationData: any[]) => {
            console.log('Calibrating models');
          },
          analyzeDiversity: async (testData: any[]) => {
            return generateMockDiversityAnalysis();
          },
          addModel: async (model: EnsembleModel) => {
            setModels(prev => new Map(prev).set(model.id, model));
            return model.id;
          },
          removeModel: async (modelId: string) => {
            setModels(prev => {
              const newMap = new Map(prev);
              newMap.delete(modelId);
              return newMap;
            });
          },
          setModelEnabled: (modelId: string, enabled: boolean) => {
            setModels(prev => {
              const newMap = new Map(prev);
              const model = newMap.get(modelId);
              if (model) {
                newMap.set(modelId, { ...model, enabled });
              }
              return newMap;
            });
          }
        };

        // Load default models
        await loadDefaultModels();
        
        // Load metrics
        setEnsembleMetrics(generateMockEnsembleMetrics());
        
      } catch (error) {
        console.error('Failed to initialize model ensemble:', error);
        setError('Failed to initialize ensemble system');
      }
    };

    initializeEnsemble();
  }, []);

  // Load default models
  const loadDefaultModels = useCallback(async () => {
    const defaultModels = [
      generateMockModel('ResNet-50', 'classification', 0.3),
      generateMockModel('EfficientNet-B7', 'classification', 0.4),
      generateMockModel('Vision Transformer', 'classification', 0.3),
    ];

    for (const model of defaultModels) {
      await modelEnsembleRef.current?.addModel(model);
    }
  }, []);

  // Run ensemble prediction
  const runPrediction = useCallback(async (input?: any) => {
    if (!modelEnsembleRef.current) return;

    setLoading(true);
    try {
      const testInput = input || generateMockInput();
      const prediction = await modelEnsembleRef.current.predict(testInput);
      
      setPredictions(prev => [prediction, ...prev.slice(0, 9)]);
      onPredictionRun?.(prediction);
    } catch (error) {
      console.error('Failed to run prediction:', error);
      setError('Failed to run ensemble prediction');
    } finally {
      setLoading(false);
    }
  }, [onPredictionRun]);

  // Update ensemble metrics
  const updateMetrics = useCallback(async () => {
    if (!modelEnsembleRef.current) return;

    try {
      const metrics = modelEnsembleRef.current.getEnsembleMetrics();
      setEnsembleMetrics(metrics);
      
      // Update diversity analysis
      const diversity = await modelEnsembleRef.current.analyzeDiversity([]);
      setDiversityAnalysis(diversity);
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  }, []);

  // Calibrate models
  const calibrateModels = useCallback(async () => {
    if (!modelEnsembleRef.current) return;

    setIsCalibrating(true);
    try {
      await modelEnsembleRef.current.calibrateModels([]);
      await updateMetrics();
    } catch (error) {
      console.error('Failed to calibrate models:', error);
      setError('Failed to calibrate models');
    } finally {
      setIsCalibrating(false);
    }
  }, [updateMetrics]);

  // Update model weights
  const updateModelWeights = useCallback(async () => {
    if (!modelEnsembleRef.current) return;

    setLoading(true);
    try {
      await modelEnsembleRef.current.updateModelWeights();
      await updateMetrics();
    } catch (error) {
      console.error('Failed to update weights:', error);
      setError('Failed to update model weights');
    } finally {
      setLoading(false);
    }
  }, [updateMetrics]);

  // Add new model
  const addModel = useCallback(async () => {
    if (!modelEnsembleRef.current || !newModel.name) return;

    setLoading(true);
    try {
      const model = createCompleteModel(newModel);
      await modelEnsembleRef.current.addModel(model);
      
      onModelAdd?.(model);
      setNewModel({ name: '', type: 'classification', weight: 1.0, enabled: true });
      setShowModelForm(false);
    } catch (error) {
      console.error('Failed to add model:', error);
      setError('Failed to add model');
    } finally {
      setLoading(false);
    }
  }, [newModel, onModelAdd]);

  // Remove model
  const removeModel = useCallback(async (modelId: string) => {
    if (!modelEnsembleRef.current) return;

    try {
      await modelEnsembleRef.current.removeModel(modelId);
      onModelRemove?.(modelId);
    } catch (error) {
      console.error('Failed to remove model:', error);
      setError('Failed to remove model');
    }
  }, [onModelRemove]);

  // Toggle model enabled state
  const toggleModelEnabled = useCallback((modelId: string) => {
    if (!modelEnsembleRef.current) return;

    const model = models.get(modelId);
    if (model) {
      modelEnsembleRef.current.setModelEnabled(modelId, !model.enabled);
    }
  }, [models]);

  // Update ensemble config
  const updateConfig = useCallback((updates: Partial<EnsembleConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  }, [config, onConfigChange]);

  // Get model type icon
  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'classification': return <Target className="h-4 w-4" />;
      case 'regression': return <TrendingUp className="h-4 w-4" />;
      case 'segmentation': return <Layers className="h-4 w-4" />;
      case 'detection': return <Eye className="h-4 w-4" />;
      case 'generation': return <Sparkles className="h-4 w-4" />;
      case 'embedding': return <Network className="h-4 w-4" />;
      case 'transformer': return <Brain className="h-4 w-4" />;
      case 'cnn': return <Grid className="h-4 w-4" />;
      case 'rnn': return <GitBranch className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  // Get performance color
  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 0.9) return 'bg-green-500';
    if (accuracy >= 0.8) return 'bg-blue-500';
    if (accuracy >= 0.7) return 'bg-yellow-500';
    if (accuracy >= 0.6) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Get voting strategy icon
  const getVotingStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'majority': return <Users className="h-4 w-4" />;
      case 'weighted': return <BarChart className="h-4 w-4" />;
      case 'soft': return <Activity className="h-4 w-4" />;
      case 'stacking': return <Layers className="h-4 w-4" />;
      case 'bayesian': return <Brain className="h-4 w-4" />;
      case 'rank_based': return <ArrowUpDown className="h-4 w-4" />;
      case 'confidence_weighted': return <Shield className="h-4 w-4" />;
      case 'performance_weighted': return <Target className="h-4 w-4" />;
      default: return <Vote className="h-4 w-4" />;
    }
  };

  // Mock data generators
  const generateMockModel = (name: string, type: ModelType, weight: number): EnsembleModel => {
    return {
      id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      weight,
      performance: {
        accuracy: 0.85 + Math.random() * 0.1,
        precision: 0.8 + Math.random() * 0.15,
        recall: 0.8 + Math.random() * 0.15,
        f1Score: 0.8 + Math.random() * 0.15,
        loss: 0.1 + Math.random() * 0.1,
        latency: 10 + Math.random() * 20,
        reliability: 0.9 + Math.random() * 0.1,
        calibration: 0.8 + Math.random() * 0.2
      },
      config: {
        architecture: `${name} Architecture`,
        parameters: {},
        preprocessing: {
          normalization: 'standard',
          augmentation: [],
          featureSelection: {
            method: 'variance',
            threshold: 0.1
          }
        },
        postprocessing: {
          calibration: true,
          smoothing: {
            enabled: true,
            method: 'gaussian',
            parameters: {}
          },
          thresholding: {
            enabled: false,
            method: 'fixed',
            threshold: 0.5
          }
        },
        optimization: {
          quantization: false,
          pruning: false,
          distillation: false,
          gpuAcceleration: true
        }
      },
      enabled: true,
      lastUpdated: new Date()
    };
  };

  const generateMockPrediction = (): EnsemblePrediction => {
    const contributions: ModelContribution[] = Array.from(models.values())
      .filter(m => m.enabled)
      .map(model => ({
        modelId: model.id,
        prediction: { class: 'A', probability: Math.random() },
        confidence: Math.random(),
        weight: model.weight,
        contribution: Math.random() * 0.5
      }));

    return {
      prediction: { class: 'A', probability: Math.random() },
      confidence: Math.random(),
      uncertainty: Math.random() * 0.3,
      modelContributions: contributions,
      metadata: {
        timestamp: new Date(),
        processingTime: 50 + Math.random() * 100,
        inputShape: [224, 224, 3],
        outputShape: [1000],
        ensembleMethod: config.votingStrategy
      }
    };
  };

  const generateMockEnsembleMetrics = (): EnsembleMetrics => {
    return {
      overallAccuracy: 0.92 + Math.random() * 0.05,
      ensembleGain: 0.03 + Math.random() * 0.02,
      diversityScore: 0.6 + Math.random() * 0.3,
      calibrationError: Math.random() * 0.1,
      averageLatency: 25 + Math.random() * 15,
      modelAgreement: 0.8 + Math.random() * 0.15,
      uncertaintyReduction: 0.15 + Math.random() * 0.1
    };
  };

  const generateMockDiversityAnalysis = (): DiversityAnalysis => {
    const modelIds = Array.from(models.keys());
    const correlations = modelIds.map(() => 
      modelIds.map(() => -0.5 + Math.random())
    );

    return {
      pairwiseCorrelations: correlations,
      diversityMeasures: [
        {
          type: 'disagreement',
          value: 0.3 + Math.random() * 0.4,
          interpretation: 'Moderate disagreement between models'
        },
        {
          type: 'correlation',
          value: 0.6 + Math.random() * 0.3,
          interpretation: 'Models show good diversity'
        },
        {
          type: 'entropy',
          value: 1.2 + Math.random() * 0.5,
          interpretation: 'High prediction entropy'
        }
      ],
      complementarity: modelIds.slice(0, -1).map((id, idx) => ({
        modelPair: [id, modelIds[idx + 1]] as [string, string],
        score: 0.7 + Math.random() * 0.3,
        strengths: ['High accuracy', 'Good calibration'],
        weaknesses: ['Slow inference', 'Memory intensive']
      }))
    };
  };

  const generateMockInput = () => {
    return { image: 'mock_image_data' };
  };

  const createCompleteModel = (partial: Partial<EnsembleModel>): EnsembleModel => {
    return {
      id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: partial.name || 'Unknown Model',
      type: partial.type || 'classification',
      weight: partial.weight || 1.0,
      performance: {
        accuracy: 0.8 + Math.random() * 0.15,
        precision: 0.8 + Math.random() * 0.15,
        recall: 0.8 + Math.random() * 0.15,
        f1Score: 0.8 + Math.random() * 0.15,
        loss: 0.1 + Math.random() * 0.1,
        latency: 10 + Math.random() * 20,
        reliability: 0.9 + Math.random() * 0.1,
        calibration: 0.8 + Math.random() * 0.2
      },
      config: {
        architecture: `${partial.name} Architecture`,
        parameters: {},
        preprocessing: {
          normalization: 'standard',
          augmentation: [],
          featureSelection: {
            method: 'variance',
            threshold: 0.1
          }
        },
        postprocessing: {
          calibration: true,
          smoothing: {
            enabled: true,
            method: 'gaussian',
            parameters: {}
          },
          thresholding: {
            enabled: false,
            method: 'fixed',
            threshold: 0.5
          }
        },
        optimization: {
          quantization: false,
          pruning: false,
          distillation: false,
          gpuAcceleration: true
        }
      },
      enabled: partial.enabled ?? true,
      lastUpdated: new Date()
    };
  };

  return (
    <div className={`model-ensemble-manager ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Model Ensemble Manager</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={updateMetrics}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={calibrateModels}
              disabled={isCalibrating || models.size === 0}
            >
              {isCalibrating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Calibrating
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Calibrate
                </>
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => runPrediction()}
              disabled={loading || models.size === 0}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Prediction
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
        <Tabs defaultValue="models" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="diversity">Diversity</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Ensemble Models ({models.size})</h3>
                <Badge variant="outline">
                  {Array.from(models.values()).filter(m => m.enabled).length} active
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModelForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Model
              </Button>
            </div>

            {/* Model List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(models.values()).map((model) => (
                <Card 
                  key={model.id}
                  className={`cursor-pointer transition-all ${
                    selectedModel === model.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getModelTypeIcon(model.type)}
                        <span className="font-medium">{model.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={model.enabled}
                          onCheckedChange={() => toggleModelEnabled(model.id)}
                          
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeModel(model.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{model.type}</Badge>
                        <Badge 
                          className={`${getPerformanceColor(model.performance.accuracy)} text-white`}
                        >
                          {Math.round(model.performance.accuracy * 100)}%
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Weight:</span>
                          <span className="font-medium">{model.weight.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Latency:</span>
                          <span className="font-medium">{model.performance.latency.toFixed(1)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>F1 Score:</span>
                          <span className="font-medium">{model.performance.f1Score.toFixed(3)}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-sm mb-1">Performance</div>
                        <Progress value={model.performance.accuracy * 100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Model Form */}
            {showModelForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Model
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="model-name">Model Name</Label>
                      <Input
                        
                        value={newModel.name || ''}
                        onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter model name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model-type">Model Type</Label>
                      <Select
                        value={newModel.type || 'classification'}
                        onValueChange={(value) => setNewModel(prev => ({ ...prev, type: value as ModelType }))}
                      >
                        <SelectTrigger >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classification">Classification</SelectItem>
                          <SelectItem value="regression">Regression</SelectItem>
                          <SelectItem value="segmentation">Segmentation</SelectItem>
                          <SelectItem value="detection">Detection</SelectItem>
                          <SelectItem value="generation">Generation</SelectItem>
                          <SelectItem value="embedding">Embedding</SelectItem>
                          <SelectItem value="transformer">Transformer</SelectItem>
                          <SelectItem value="cnn">CNN</SelectItem>
                          <SelectItem value="rnn">RNN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model-weight">Weight: {newModel.weight?.toFixed(2) || '1.00'}</Label>
                      <Slider
                        
                        value={[newModel.weight || 1.0]}
                        onValueChange={(value) => setNewModel(prev => ({ ...prev, weight: value[0] }))}
                        max={2}
                        min={0.1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model-enabled">Enabled</Label>
                      <Switch
                        
                        checked={newModel.enabled ?? true}
                        onCheckedChange={(enabled) => setNewModel(prev => ({ ...prev, enabled }))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={addModel} disabled={!newModel.name || loading}>
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Add Model
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setShowModelForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Ensemble Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="voting-strategy">Voting Strategy</Label>
                    <Select
                      value={config.votingStrategy}
                      onValueChange={(value) => updateConfig({ votingStrategy: value as VotingStrategy })}
                    >
                      <SelectTrigger >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="majority">Majority Voting</SelectItem>
                        <SelectItem value="weighted">Weighted Voting</SelectItem>
                        <SelectItem value="soft">Soft Voting</SelectItem>
                        <SelectItem value="stacking">Stacking</SelectItem>
                        <SelectItem value="bayesian">Bayesian</SelectItem>
                        <SelectItem value="rank_based">Rank Based</SelectItem>
                        <SelectItem value="confidence_weighted">Confidence Weighted</SelectItem>
                        <SelectItem value="performance_weighted">Performance Weighted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aggregation-method">Aggregation Method</Label>
                    <Select
                      value={config.aggregationMethod}
                      onValueChange={(value) => updateConfig({ aggregationMethod: value as AggregationMethod })}
                    >
                      <SelectTrigger >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mean">Mean</SelectItem>
                        <SelectItem value="weighted_mean">Weighted Mean</SelectItem>
                        <SelectItem value="median">Median</SelectItem>
                        <SelectItem value="max">Maximum</SelectItem>
                        <SelectItem value="min">Minimum</SelectItem>
                        <SelectItem value="geometric_mean">Geometric Mean</SelectItem>
                        <SelectItem value="harmonic_mean">Harmonic Mean</SelectItem>
                        <SelectItem value="trimmed_mean">Trimmed Mean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confidence-threshold">
                      Confidence Threshold: {config.confidenceThreshold.toFixed(2)}
                    </Label>
                    <Slider
                      
                      value={[config.confidenceThreshold]}
                      onValueChange={(value) => updateConfig({ confidenceThreshold: value[0] })}
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
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="performance-weighting">Performance Weighting</Label>
                    <Switch
                      
                      checked={config.performanceWeighting}
                      onCheckedChange={(checked) => updateConfig({ performanceWeighting: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="dynamic-weighting">Dynamic Weighting</Label>
                    <Switch
                      
                      checked={config.dynamicWeighting}
                      onCheckedChange={(checked) => updateConfig({ dynamicWeighting: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="calibration-enabled">Model Calibration</Label>
                    <Switch
                      
                      checked={config.calibration.enabled}
                      onCheckedChange={(checked) => updateConfig({
                        calibration: { ...config.calibration, enabled: checked }
                      })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={updateModelWeights}
                    disabled={loading}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Update Weights
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => console.log('Save configuration')}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            {ensembleMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Overall Accuracy</span>
                      </div>
                      <Badge variant="outline">
                        {Math.round(ensembleMetrics.overallAccuracy * 100)}%
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <Progress value={ensembleMetrics.overallAccuracy * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Ensemble Gain</span>
                      </div>
                      <Badge variant="outline">
                        +{(ensembleMetrics.ensembleGain * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <Progress value={ensembleMetrics.ensembleGain * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5 text-purple-500" />
                        <span className="font-medium">Diversity Score</span>
                      </div>
                      <Badge variant="outline">
                        {ensembleMetrics.diversityScore.toFixed(3)}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <Progress value={ensembleMetrics.diversityScore * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Timer className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">Average Latency</span>
                      </div>
                      <Badge variant="outline">
                        {ensembleMetrics.averageLatency.toFixed(1)}ms
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <Progress value={Math.min(ensembleMetrics.averageLatency, 100)} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-teal-500" />
                        <span className="font-medium">Model Agreement</span>
                      </div>
                      <Badge variant="outline">
                        {Math.round(ensembleMetrics.modelAgreement * 100)}%
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <Progress value={ensembleMetrics.modelAgreement * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-500" />
                        <span className="font-medium">Calibration Error</span>
                      </div>
                      <Badge variant="outline">
                        {(ensembleMetrics.calibrationError * 100).toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <Progress value={ensembleMetrics.calibrationError * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Diversity Tab */}
          <TabsContent value="diversity" className="space-y-4">
            {diversityAnalysis && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Diversity Measures
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {diversityAnalysis.diversityMeasures.map((measure, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <div className="font-medium capitalize">{measure.type}</div>
                            <div className="text-sm text-gray-600">{measure.interpretation}</div>
                          </div>
                          <Badge variant="outline">{measure.value.toFixed(3)}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-5 w-5" />
                      Model Complementarity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {diversityAnalysis.complementarity.map((comp, index) => (
                        <div key={index} className="p-3 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">
                              {comp.modelPair[0]} ↔ {comp.modelPair[1]}
                            </div>
                            <Badge variant="outline">{comp.score.toFixed(3)}</Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div className="mb-1">
                              <span className="font-medium">Strengths:</span> {comp.strengths.join(', ')}
                            </div>
                            <div>
                              <span className="font-medium">Weaknesses:</span> {comp.weaknesses.join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Predictions ({predictions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {predictions.map((prediction, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{prediction.metadata.ensembleMethod}</Badge>
                            <span className="text-sm text-gray-600">
                              {prediction.metadata.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={`${getPerformanceColor(prediction.confidence)} text-white`}
                            >
                              {Math.round(prediction.confidence * 100)}%
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {prediction.metadata.processingTime.toFixed(1)}ms
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Prediction:</span> {JSON.stringify(prediction.prediction)}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Uncertainty:</span> {prediction.uncertainty.toFixed(3)}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Contributors:</span> {prediction.modelContributions.length} models
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="text-sm font-medium mb-1">Model Contributions:</div>
                          <div className="space-y-1">
                            {prediction.modelContributions.map((contrib, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <span>{models.get(contrib.modelId)?.name || contrib.modelId}</span>
                                <div className="flex items-center gap-2">
                                  <span>{Math.round(contrib.contribution * 100)}%</span>
                                  <div className="w-16 bg-gray-200 rounded-full h-1">
                                    <div 
                                      className="bg-blue-500 h-1 rounded-full"
                                      style={{ width: `${contrib.contribution * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
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

export default ModelEnsembleManager; 