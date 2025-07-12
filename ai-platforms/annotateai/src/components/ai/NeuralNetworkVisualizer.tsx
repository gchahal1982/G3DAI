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
import { Separator } from '../../../../../shared/components/ui/Separator';
import { 
  Brain, 
  Layers, 
  Zap, 
  Network,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Square,
  RotateCcw,
  Download,
  Upload,
  Settings,
  BarChart3,
  Activity,
  Target,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  Grid,
  RefreshCw,
  MousePointer,
  Cpu,
  Gauge,
  Timer,
  Sparkles,
  GitBranch,
  ArrowRight,
  ArrowDown,
  CircleDot,
  Workflow,
  HelpCircle,
  Info,
  Camera,
  Video,
  FileText,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Lock,
  Unlock,
  Filter,
  Search,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

// Import types from backend
interface NeuralLayer {
  id: string;
  type: 'input' | 'hidden' | 'output' | 'conv' | 'pool' | 'dense' | 'lstm' | 'attention';
  neurons: Neuron[];
  weights: WeightConnection[];
  activation: ActivationFunction;
  position: Vector3;
  dimensions: { width: number; height: number; depth: number };
  metadata: LayerMetadata;
}

interface Neuron {
  id: string;
  layerId: string;
  position: Vector3;
  activation: number;
  gradient: number;
  bias: number;
  connections: Connection[];
  visualState: NeuronVisualState;
}

interface WeightConnection {
  id: string;
  sourceNeuron: string;
  targetNeuron: string;
  weight: number;
  gradient: number;
  momentum: number;
  visualState: ConnectionVisualState;
}

interface ActivationFunction {
  type: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'leaky_relu' | 'elu' | 'gelu';
  parameters: Record<string, number>;
}

interface LayerMetadata {
  inputShape: number[];
  outputShape: number[];
  parameters: number;
  flops: number;
  memory: number;
  activationStats: ActivationStats;
}

interface ActivationStats {
  mean: number;
  std: number;
  min: number;
  max: number;
  sparsity: number;
  histogram: number[];
}

interface NeuronVisualState {
  color: Color;
  size: number;
  opacity: number;
  glowIntensity: number;
  pulsePhase: number;
}

interface ConnectionVisualState {
  color: Color;
  width: number;
  opacity: number;
  flowSpeed: number;
  particleCount: number;
}

interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  learningRate: number;
  gradientNorm: number;
  updateMagnitude: number;
  convergenceRate: number;
}

interface VisualizationConfig {
  layout: 'layered' | '3d' | 'circular' | 'force' | 'hierarchical';
  colorScheme: 'activation' | 'gradient' | 'weight' | 'flow' | 'custom';
  animationSpeed: number;
  particleEffects: boolean;
  glowEffects: boolean;
  connectionFlow: boolean;
  showLabels: boolean;
  showMetrics: boolean;
  focusLayer?: string;
  highlightPath?: string[];
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  weight: number;
  type?: string;
  from?: Vector3;
  to?: Vector3;
  connectedNeuron?: string;
}

interface ActivationHistory {
  timestamp: number;
  layerId: string;
  activations: Map<string, number>;
}

interface NeuralNetworkVisualizerProps {
  onLayerSelect?: (layerId: string) => void;
  onNeuronSelect?: (neuronId: string) => void;
  onTrainingStart?: () => void;
  onTrainingStop?: () => void;
  onExport?: (format: string, data: any) => void;
  className?: string;
}

export function NeuralNetworkVisualizer({
  onLayerSelect,
  onNeuronSelect,
  onTrainingStart,
  onTrainingStop,
  onExport,
  className = ''
}: NeuralNetworkVisualizerProps) {
  // State management
  const [layers, setLayers] = useState<Map<string, NeuralLayer>>(new Map());
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [selectedNeuron, setSelectedNeuron] = useState<string | null>(null);
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics[]>([]);
  const [activationHistory, setActivationHistory] = useState<ActivationHistory[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [config, setConfig] = useState<VisualizationConfig>({
    layout: 'layered',
    colorScheme: 'activation',
    animationSpeed: 1.0,
    particleEffects: true,
    glowEffects: true,
    connectionFlow: true,
    showLabels: true,
    showMetrics: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkStats, setNetworkStats] = useState<any>(null);
  const [highlightedElements, setHighlightedElements] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [showDetailsPanel, setShowDetailsPanel] = useState(true);
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());

  // Refs
  const visualizationRef = useRef<HTMLDivElement>(null);
  const neuralNetworkVizRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize neural network visualization
  useEffect(() => {
    const initializeVisualization = async () => {
      try {
        // Mock initialization - replace with actual backend
        neuralNetworkVizRef.current = {
          addLayer: async (layer: Omit<NeuralLayer, 'neurons' | 'weights'>) => {
            const newLayer = await generateMockLayer(layer);
            setLayers(prev => new Map(prev).set(newLayer.id, newLayer));
            return newLayer.id;
          },
          updateActivations: (activations: Map<string, number>) => {
            setActivationHistory(prev => [...prev, {
              timestamp: Date.now(),
              layerId: 'mock',
              activations
            }]);
          },
          updateTrainingMetrics: (metrics: TrainingMetrics) => {
            setTrainingMetrics(prev => [...prev, metrics]);
          },
          exportVisualization: (format: string) => {
            return new Blob(['mock export data'], { type: 'text/plain' });
          }
        };

        // Load initial network
        await loadDefaultNetwork();
        
        // Start animation loop
        startAnimationLoop();
        
      } catch (error) {
        console.error('Failed to initialize neural network visualization:', error);
        setError('Failed to initialize neural network visualization');
      }
    };

    initializeVisualization();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Load default network
  const loadDefaultNetwork = useCallback(async () => {
    try {
      const defaultLayers = [
        { id: 'input', type: 'input' as const, position: { x: 0, y: 0, z: 0 } },
        { id: 'hidden1', type: 'hidden' as const, position: { x: 200, y: 0, z: 0 } },
        { id: 'hidden2', type: 'hidden' as const, position: { x: 400, y: 0, z: 0 } },
        { id: 'output', type: 'output' as const, position: { x: 600, y: 0, z: 0 } }
      ];

      for (const layer of defaultLayers) {
        await neuralNetworkVizRef.current?.addLayer(layer);
      }

      // Generate mock training data
      setTrainingMetrics(generateMockTrainingMetrics());
      setNetworkStats(generateMockNetworkStats());
      
    } catch (error) {
      console.error('Failed to load default network:', error);
    }
  }, []);

  // Start animation loop
  const startAnimationLoop = useCallback(() => {
    const animate = () => {
      if (isPlaying) {
        // Update visualizations
        updateVisualization();
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
  }, [isPlaying]);

  // Update visualization
  const updateVisualization = useCallback(() => {
    if (!neuralNetworkVizRef.current) return;

    // Simulate activation updates
    const mockActivations = new Map();
    layers.forEach((layer, layerId) => {
      layer.neurons.forEach(neuron => {
        mockActivations.set(neuron.id, Math.random());
      });
    });

    neuralNetworkVizRef.current.updateActivations(mockActivations);
  }, [layers]);

  // Toggle training
  const toggleTraining = useCallback(() => {
    if (isTraining) {
      setIsTraining(false);
      setIsPlaying(false);
      onTrainingStop?.();
    } else {
      setIsTraining(true);
      setIsPlaying(true);
      onTrainingStart?.();
      
      // Simulate training metrics updates
      const interval = setInterval(() => {
        if (!isTraining) {
          clearInterval(interval);
          return;
        }
        
        const newMetrics = generateMockTrainingMetrics(trainingMetrics.length);
        setTrainingMetrics(prev => [...prev, ...newMetrics]);
      }, 1000);
    }
  }, [isTraining, onTrainingStart, onTrainingStop, trainingMetrics.length]);

  // Toggle animation playback
  const togglePlayback = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Update visualization config
  const updateConfig = useCallback((updates: Partial<VisualizationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Export visualization
  const exportVisualization = useCallback(async (format: 'image' | 'video' | 'data') => {
    if (!neuralNetworkVizRef.current) return;

    try {
      const exportData = await neuralNetworkVizRef.current.exportVisualization(format);
      onExport?.(format, exportData);
    } catch (error) {
      console.error('Failed to export visualization:', error);
      setError('Failed to export visualization');
    }
  }, [onExport]);

  // Select layer
  const selectLayer = useCallback((layerId: string) => {
    setSelectedLayer(layerId);
    setSelectedNeuron(null);
    onLayerSelect?.(layerId);
  }, [onLayerSelect]);

  // Select neuron
  const selectNeuron = useCallback((neuronId: string) => {
    setSelectedNeuron(neuronId);
    onNeuronSelect?.(neuronId);
  }, [onNeuronSelect]);

  // Toggle layer expansion
  const toggleLayerExpansion = useCallback((layerId: string) => {
    setExpandedLayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(layerId)) {
        newSet.delete(layerId);
      } else {
        newSet.add(layerId);
      }
      return newSet;
    });
  }, []);

  // Get layer type icon
  const getLayerTypeIcon = (type: string) => {
    switch (type) {
      case 'input': return <CircleDot className="h-4 w-4" />;
      case 'hidden': return <Layers className="h-4 w-4" />;
      case 'output': return <Target className="h-4 w-4" />;
      case 'conv': return <Grid className="h-4 w-4" />;
      case 'pool': return <Minimize className="h-4 w-4" />;
      case 'dense': return <Network className="h-4 w-4" />;
      case 'lstm': return <GitBranch className="h-4 w-4" />;
      case 'attention': return <Eye className="h-4 w-4" />;
      default: return <Layers className="h-4 w-4" />;
    }
  };

  // Get activation function color
  const getActivationColor = (activation: number) => {
    if (activation > 0.7) return 'bg-green-500';
    if (activation > 0.4) return 'bg-yellow-500';
    if (activation > 0.2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Mock data generators
  const generateMockLayer = async (layer: Omit<NeuralLayer, 'neurons' | 'weights'>): Promise<NeuralLayer> => {
    const neuronCount = layer.type === 'input' ? 784 : layer.type === 'output' ? 10 : 128;
    const neurons: Neuron[] = [];
    
    for (let i = 0; i < neuronCount; i++) {
      neurons.push({
        id: `${layer.id}_neuron_${i}`,
        layerId: layer.id,
        position: { x: i * 20, y: 0, z: 0 },
        activation: Math.random(),
        gradient: Math.random() * 0.1,
        bias: Math.random() * 0.1,
        connections: [],
        visualState: {
          color: { r: 0.2, g: 0.6, b: 1.0, a: 1.0 },
          size: 1.0,
          opacity: 1.0,
          glowIntensity: 0.5,
          pulsePhase: 0
        }
      });
    }

    return {
      ...layer,
      neurons,
      weights: [],
      activation: {
        type: 'relu',
        parameters: {}
      },
      dimensions: { width: 100, height: 100, depth: 10 },
      metadata: {
        inputShape: [neuronCount],
        outputShape: [neuronCount],
        parameters: neuronCount * 128,
        flops: neuronCount * 128,
        memory: neuronCount * 4,
        activationStats: {
          mean: 0.5,
          std: 0.2,
          min: 0,
          max: 1,
          sparsity: 0.3,
          histogram: Array(10).fill(0).map(() => Math.random())
        }
      }
    };
  };

  const generateMockTrainingMetrics = (startEpoch: number = 0): TrainingMetrics[] => {
    const metrics: TrainingMetrics[] = [];
    for (let i = 0; i < 5; i++) {
      metrics.push({
        epoch: startEpoch + i,
        loss: Math.max(0.1, 2.0 - (startEpoch + i) * 0.1 + Math.random() * 0.2),
        accuracy: Math.min(0.99, 0.5 + (startEpoch + i) * 0.02 + Math.random() * 0.05),
        learningRate: Math.max(0.0001, 0.001 - (startEpoch + i) * 0.0001),
        gradientNorm: 0.1 + Math.random() * 0.05,
        updateMagnitude: 0.01 + Math.random() * 0.005,
        convergenceRate: Math.random() * 0.1
      });
    }
    return metrics;
  };

  const generateMockNetworkStats = () => {
    return {
      totalLayers: 4,
      totalNeurons: 1050,
      totalConnections: 135000,
      totalParameters: 135000,
      memoryUsage: 540, // MB
      flops: 270000000,
      latency: 15.2, // ms
      throughput: 65.8 // samples/sec
    };
  };

  return (
    <div className={`neural-network-visualizer ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Neural Network Visualizer</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === '2d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('2d')}
              >
                2D
              </Button>
              <Button
                variant={viewMode === '3d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('3d')}
              >
                3D
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayback}
              disabled={isTraining}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </>
              )}
            </Button>
            <Button
              variant={isTraining ? "destructive" : "default"}
              size="sm"
              onClick={toggleTraining}
            >
              {isTraining ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Stop Training
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Training
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Visualization Canvas */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  ref={visualizationRef}
                  className="w-full h-96 bg-gray-900 rounded-lg relative overflow-hidden"
                >
                  {/* Mock 2D Network Visualization */}
                  <div className="absolute inset-0 p-4">
                    <div className="flex items-center justify-center h-full">
                      <div className="flex items-center gap-8">
                        {Array.from(layers.values()).map((layer, index) => (
                          <div
                            key={layer.id}
                            className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${
                              selectedLayer === layer.id ? 'scale-110' : ''
                            }`}
                            onClick={() => selectLayer(layer.id)}
                          >
                            <div className="text-white text-sm font-medium">{layer.type}</div>
                            <div className="flex flex-col gap-1">
                              {layer.neurons.slice(0, 8).map((neuron, neuronIndex) => (
                                <div
                                  key={neuron.id}
                                  className={`w-4 h-4 rounded-full transition-all cursor-pointer ${
                                    getActivationColor(neuron.activation)
                                  } ${selectedNeuron === neuron.id ? 'ring-2 ring-white' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectNeuron(neuron.id);
                                  }}
                                />
                              ))}
                              {layer.neurons.length > 8 && (
                                <div className="text-white text-xs">+{layer.neurons.length - 8}</div>
                              )}
                            </div>
                            {index < Array.from(layers.values()).length - 1 && (
                              <ArrowRight className="h-4 w-4 text-white absolute right-0 top-1/2 transform translate-x-6 -translate-y-1/2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Visualization Controls */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportVisualization('image')}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportVisualization('video')}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDetailsPanel(!showDetailsPanel)}
                    >
                      {showDetailsPanel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Training Status */}
                  {isTraining && (
                    <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 animate-pulse" />
                        <span>Training in progress...</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Training Metrics */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Training Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trainingMetrics.length > 0 && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {trainingMetrics[trainingMetrics.length - 1].epoch}
                        </div>
                        <div className="text-sm text-gray-600">Epoch</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {trainingMetrics[trainingMetrics.length - 1].loss.toFixed(3)}
                        </div>
                        <div className="text-sm text-gray-600">Loss</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {(trainingMetrics[trainingMetrics.length - 1].accuracy * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {trainingMetrics[trainingMetrics.length - 1].learningRate.toFixed(4)}
                        </div>
                        <div className="text-sm text-gray-600">Learning Rate</div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Training Progress */}
                {trainingMetrics.length > 1 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Training Progress</span>
                      <span>{trainingMetrics[trainingMetrics.length - 1].epoch} / 100</span>
                    </div>
                    <Progress value={trainingMetrics[trainingMetrics.length - 1].epoch} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Visualization Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="layout">Layout</Label>
                  <Select value={config.layout} onValueChange={(value) => updateConfig({ layout: value as any })}>
                    <SelectTrigger >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="layered">Layered</SelectItem>
                      <SelectItem value="3d">3D</SelectItem>
                      <SelectItem value="circular">Circular</SelectItem>
                      <SelectItem value="force">Force-Directed</SelectItem>
                      <SelectItem value="hierarchical">Hierarchical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorScheme">Color Scheme</Label>
                  <Select value={config.colorScheme} onValueChange={(value) => updateConfig({ colorScheme: value as any })}>
                    <SelectTrigger >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activation">Activation</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="flow">Flow</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animationSpeed">Animation Speed: {config.animationSpeed.toFixed(1)}x</Label>
                  <Slider
                    
                    value={[config.animationSpeed]}
                    onValueChange={(value) => updateConfig({ animationSpeed: value[0] })}
                    max={3}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="particles">Particle Effects</Label>
                    <Switch
                      
                      checked={config.particleEffects}
                      onCheckedChange={(checked) => updateConfig({ particleEffects: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="glow">Glow Effects</Label>
                    <Switch
                      
                      checked={config.glowEffects}
                      onCheckedChange={(checked) => updateConfig({ glowEffects: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="flow">Connection Flow</Label>
                    <Switch
                      
                      checked={config.connectionFlow}
                      onCheckedChange={(checked) => updateConfig({ connectionFlow: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="labels">Show Labels</Label>
                    <Switch
                      
                      checked={config.showLabels}
                      onCheckedChange={(checked) => updateConfig({ showLabels: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Statistics */}
            {networkStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Network Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Layers:</span>
                      <span className="font-medium">{networkStats.totalLayers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Neurons:</span>
                      <span className="font-medium">{networkStats.totalNeurons.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connections:</span>
                      <span className="font-medium">{networkStats.totalConnections.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Parameters:</span>
                      <span className="font-medium">{networkStats.totalParameters.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span>Memory:</span>
                      <span className="font-medium">{networkStats.memoryUsage} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>FLOPs:</span>
                      <span className="font-medium">{(networkStats.flops / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Latency:</span>
                      <span className="font-medium">{networkStats.latency} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Throughput:</span>
                      <span className="font-medium">{networkStats.throughput} samples/s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Layer Details */}
            {showDetailsPanel && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Layer Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {Array.from(layers.values()).map((layer) => (
                        <div
                          key={layer.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedLayer === layer.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                          }`}
                          onClick={() => selectLayer(layer.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLayerExpansion(layer.id);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {expandedLayers.has(layer.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                              {getLayerTypeIcon(layer.type)}
                              <span className="font-medium">{layer.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{layer.type}</Badge>
                              <Badge variant="secondary">{layer.neurons.length}</Badge>
                            </div>
                          </div>
                          
                          {expandedLayers.has(layer.id) && (
                            <div className="mt-2 text-sm text-gray-600 space-y-1">
                              <div>Neurons: {layer.neurons.length}</div>
                              <div>Parameters: {layer.metadata.parameters.toLocaleString()}</div>
                              <div>Memory: {(layer.metadata.memory / 1024).toFixed(1)} KB</div>
                              <div>Activation: {layer.activation.type}</div>
                              <div className="mt-2">
                                <div className="text-xs mb-1">Activation Stats:</div>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  <div>Mean: {layer.metadata.activationStats.mean.toFixed(3)}</div>
                                  <div>Std: {layer.metadata.activationStats.std.toFixed(3)}</div>
                                  <div>Min: {layer.metadata.activationStats.min.toFixed(3)}</div>
                                  <div>Max: {layer.metadata.activationStats.max.toFixed(3)}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Export Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => exportVisualization('image')}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Export Image
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => exportVisualization('video')}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Export Video
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => exportVisualization('data')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NeuralNetworkVisualizer; 