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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Code, 
  Lightbulb, 
  Zap, 
  Bot,
  User,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Download,
  Upload,
  Settings,
  BarChart3,
  Clock,
  Target,
  Brain,
  Wand2,
  FileCode,
  GitBranch,
  Workflow,
  Activity,
  Eye,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Save,
  Copy,
  ArrowRight,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  Cpu,
  Gauge,
  Users,
  MessageSquare,
  Sparkles
} from 'lucide-react';

// Import types from backend
interface WorkflowStep {
  id: string;
  type: 'annotation' | 'review' | 'validation' | 'export' | 'training';
  name: string;
  description: string;
  inputs: WorkflowInput[];
  outputs: WorkflowOutput[];
  parameters: WorkflowParameters;
  aiAssistance: AIAssistanceConfig;
  performance: PerformanceMetrics;
}

interface WorkflowInput {
  name: string;
  type: 'image' | 'video' | 'pointcloud' | 'annotation' | 'model';
  required: boolean;
  validation: ValidationRule[];
}

interface WorkflowOutput {
  name: string;
  type: 'annotation' | 'model' | 'report' | 'dataset';
  format: string;
  destination: string;
}

interface WorkflowParameters {
  autoSave: boolean;
  batchSize: number;
  parallelism: number;
  qualityThreshold: number;
  confidenceThreshold: number;
  reviewRequired: boolean;
}

interface AIAssistanceConfig {
  enabled: boolean;
  models: string[];
  preAnnotation: boolean;
  smartSuggestions: boolean;
  errorCorrection: boolean;
  qualityAssurance: boolean;
  adaptiveLearning: boolean;
}

interface PerformanceMetrics {
  averageTime: number;
  throughput: number;
  accuracy: number;
  errorRate: number;
  userSatisfaction: number;
}

interface WorkflowOptimization {
  type: 'reorder' | 'parallelize' | 'automate' | 'eliminate' | 'enhance';
  targetStep: string;
  improvement: number;
  confidence: number;
  implementation: OptimizationImplementation;
}

interface OptimizationImplementation {
  code: string;
  dependencies: string[];
  estimatedTime: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface AnnotationPattern {
  id: string;
  pattern: string;
  frequency: number;
  timeSpent: number;
  errorRate: number;
  automationPotential: number;
}

interface UserBehavior {
  userId: string;
  patterns: AnnotationPattern[];
  preferences: UserPreferences;
  performance: UserPerformance;
  learningCurve: LearningMetric[];
}

interface UserPreferences {
  annotationTools: string[];
  shortcuts: Map<string, string>;
  viewSettings: ViewSettings;
  aiAssistanceLevel: 'minimal' | 'moderate' | 'maximum';
}

interface UserPerformance {
  speed: number;
  accuracy: number;
  consistency: number;
  errorPatterns: ErrorPattern[];
}

interface LearningMetric {
  timestamp: number;
  metric: string;
  value: number;
  improvement: number;
}

interface ErrorPattern {
  type: string;
  frequency: number;
  context: string[];
  suggestedFix: string;
}

interface ViewSettings {
  zoom: number;
  brightness: number;
  contrast: number;
  gridEnabled: boolean;
  snapEnabled: boolean;
}

interface ValidationRule {
  type: 'required' | 'format' | 'range' | 'custom';
  value: any;
  message: string;
}

interface WorkflowResult {
  workflowId: string;
  results: StepResult[];
  performance: WorkflowPerformance;
  suggestions: Suggestion[];
}

interface StepResult {
  stepId: string;
  status: 'completed' | 'failed' | 'skipped';
  output?: any;
  error?: string;
  duration: number;
  automated: boolean;
  confidence: number;
}

interface WorkflowPerformance {
  totalDuration: number;
  averageStepDuration: number;
  automationRate: number;
  successRate: number;
  throughput: number;
  efficiency: number;
}

interface AIAssistance {
  suggestions: Suggestion[];
  predictions: Prediction[];
  corrections: Correction[];
  shortcuts: Shortcut[];
}

interface Suggestion {
  id: string;
  type: string;
  description: string;
  confidence: number;
  action: () => void;
}

interface Prediction {
  type: string;
  value: any;
  confidence: number;
}

interface Correction {
  issue: string;
  suggestion: string;
  autoApply: boolean;
}

interface Shortcut {
  key: string;
  action: string;
  description: string;
}

interface SessionData {
  userId: string;
  actions: UserAction[];
  duration: number;
  timestamp: number;
}

interface UserAction {
  type: string;
  timestamp: number;
  duration: number;
  data: any;
}

interface AIAssistedCodingPanelProps {
  onWorkflowCreate?: (workflowId: string) => void;
  onWorkflowExecute?: (workflowId: string, results: WorkflowResult) => void;
  onAutomationToggle?: (enabled: boolean) => void;
  className?: string;
}

export function AIAssistedCodingPanel({
  onWorkflowCreate,
  onWorkflowExecute,
  onAutomationToggle,
  className = ''
}: AIAssistedCodingPanelProps) {
  // State management
  const [workflows, setWorkflows] = useState<Map<string, WorkflowStep[]>>(new Map());
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [userBehavior, setUserBehavior] = useState<UserBehavior | null>(null);
  const [aiAssistance, setAiAssistance] = useState<AIAssistance | null>(null);
  const [optimizations, setOptimizations] = useState<WorkflowOptimization[]>([]);
  const [patterns, setPatterns] = useState<AnnotationPattern[]>([]);
  const [workflowResults, setWorkflowResults] = useState<WorkflowResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Workflow builder state
  const [workflowName, setWorkflowName] = useState('');
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // Mock backend connection
  const aiAssistedCodingRef = useRef<any>(null);

  // Initialize backend connection
  useEffect(() => {
    const initializeBackend = async () => {
      try {
        // Mock initialization - replace with actual backend
        aiAssistedCodingRef.current = {
          createWorkflow: async (name: string, steps: WorkflowStep[]) => {
            const workflowId = `workflow_${Date.now()}`;
            setWorkflows(prev => new Map(prev).set(workflowId, steps));
            return workflowId;
          },
          executeWorkflow: async (workflowId: string, inputs: Map<string, any>, userId: string) => {
            return generateMockWorkflowResult(workflowId);
          },
          analyzeUserBehavior: async (userId: string, sessionData: SessionData) => {
            const behavior = generateMockUserBehavior(userId);
            setUserBehavior(behavior);
            return behavior;
          },
          generateSmartSuggestions: async (step: WorkflowStep, inputs: Map<string, any>) => {
            return generateMockSuggestions();
          },
          generateWorkflowCode: (steps: WorkflowStep[]) => {
            return generateMockWorkflowCode(steps);
          }
        };

        // Load initial data
        await loadInitialData();
        
      } catch (error) {
        console.error('Failed to initialize AI-assisted coding backend:', error);
        setError('Failed to initialize AI coding system');
      }
    };

    initializeBackend();
  }, []);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setPatterns(generateMockPatterns());
      setOptimizations(generateMockOptimizations());
      setAiAssistance(generateMockAIAssistance());
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }, []);

  // Create new workflow
  const createWorkflow = useCallback(async () => {
    if (!workflowName || workflowSteps.length === 0) {
      setError('Please provide workflow name and at least one step');
      return;
    }

    setLoading(true);
    try {
      const workflowId = await aiAssistedCodingRef.current?.createWorkflow(workflowName, workflowSteps);
      
      if (workflowId) {
        setSelectedWorkflow(workflowId);
        onWorkflowCreate?.(workflowId);
        
        // Generate code for the workflow
        const code = aiAssistedCodingRef.current?.generateWorkflowCode(workflowSteps);
        setGeneratedCode(code || '');
        
        // Clear form
        setWorkflowName('');
        setWorkflowSteps([]);
        setEditingStep(null);
      }
    } catch (error) {
      console.error('Failed to create workflow:', error);
      setError('Failed to create workflow');
    } finally {
      setLoading(false);
    }
  }, [workflowName, workflowSteps, onWorkflowCreate]);

  // Execute workflow
  const executeWorkflow = useCallback(async () => {
    if (!selectedWorkflow) return;

    setIsExecuting(true);
    setError(null);

    try {
      const result = await aiAssistedCodingRef.current?.executeWorkflow(
        selectedWorkflow,
        new Map([['input', 'test']]),
        'user123'
      );

      if (result) {
        setWorkflowResults(prev => [result, ...prev]);
        onWorkflowExecute?.(selectedWorkflow, result);
      }
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      setError('Failed to execute workflow');
    } finally {
      setIsExecuting(false);
    }
  }, [selectedWorkflow, onWorkflowExecute]);

  // Analyze user behavior
  const analyzeUserBehavior = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const sessionData = generateMockSessionData();
      await aiAssistedCodingRef.current?.analyzeUserBehavior('user123', sessionData);
      
      // Update patterns based on analysis
      setPatterns(generateMockPatterns());
      setOptimizations(generateMockOptimizations());
    } catch (error) {
      console.error('Failed to analyze user behavior:', error);
      setError('Failed to analyze user behavior');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Toggle automation
  const toggleAutomation = useCallback((enabled: boolean) => {
    setAutomationEnabled(enabled);
    onAutomationToggle?.(enabled);
  }, [onAutomationToggle]);

  // Add new workflow step
  const addWorkflowStep = useCallback(() => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: 'annotation',
      name: 'New Step',
      description: 'Description for new step',
      inputs: [],
      outputs: [],
      parameters: {
        autoSave: true,
        batchSize: 10,
        parallelism: 1,
        qualityThreshold: 0.8,
        confidenceThreshold: 0.7,
        reviewRequired: false
      },
      aiAssistance: {
        enabled: true,
        models: ['default'],
        preAnnotation: true,
        smartSuggestions: true,
        errorCorrection: true,
        qualityAssurance: true,
        adaptiveLearning: true
      },
      performance: {
        averageTime: 0,
        throughput: 0,
        accuracy: 0,
        errorRate: 0,
        userSatisfaction: 0
      }
    };
    
    setWorkflowSteps(prev => [...prev, newStep]);
    setEditingStep(newStep);
  }, []);

  // Remove workflow step
  const removeWorkflowStep = useCallback((stepId: string) => {
    setWorkflowSteps(prev => prev.filter(step => step.id !== stepId));
    if (editingStep?.id === stepId) {
      setEditingStep(null);
    }
  }, [editingStep]);

  // Save editing step
  const saveEditingStep = useCallback(() => {
    if (!editingStep) return;
    
    setWorkflowSteps(prev => 
      prev.map(step => step.id === editingStep.id ? editingStep : step)
    );
    setEditingStep(null);
  }, [editingStep]);

  // Toggle step expansion
  const toggleStepExpansion = useCallback((stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  }, []);

  // Copy generated code
  const copyGeneratedCode = useCallback(() => {
    navigator.clipboard.writeText(generatedCode);
  }, [generatedCode]);

  // Get step type icon
  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'annotation': return <Edit className="h-4 w-4" />;
      case 'review': return <Eye className="h-4 w-4" />;
      case 'validation': return <CheckCircle className="h-4 w-4" />;
      case 'export': return <Download className="h-4 w-4" />;
      case 'training': return <Brain className="h-4 w-4" />;
      default: return <Workflow className="h-4 w-4" />;
    }
  };

  // Get automation potential color
  const getAutomationPotentialColor = (potential: number) => {
    if (potential >= 0.8) return 'bg-green-500';
    if (potential >= 0.6) return 'bg-yellow-500';
    if (potential >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Get optimization type icon
  const getOptimizationTypeIcon = (type: string) => {
    switch (type) {
      case 'reorder': return <ArrowRight className="h-4 w-4" />;
      case 'parallelize': return <GitBranch className="h-4 w-4" />;
      case 'automate': return <Bot className="h-4 w-4" />;
      case 'eliminate': return <Trash2 className="h-4 w-4" />;
      case 'enhance': return <Sparkles className="h-4 w-4" />;
      default: return <Wand2 className="h-4 w-4" />;
    }
  };

  // Mock data generators
  const generateMockWorkflowResult = (workflowId: string): WorkflowResult => {
    return {
      workflowId,
      results: [
        {
          stepId: 'step1',
          status: 'completed',
          output: { annotations: 150 },
          duration: 5000,
          automated: true,
          confidence: 0.92
        },
        {
          stepId: 'step2',
          status: 'completed',
          output: { validated: 145 },
          duration: 2000,
          automated: false,
          confidence: 0.88
        }
      ],
      performance: {
        totalDuration: 7000,
        averageStepDuration: 3500,
        automationRate: 0.5,
        successRate: 1.0,
        throughput: 120,
        efficiency: 0.85
      },
      suggestions: generateMockSuggestions()
    };
  };

  const generateMockUserBehavior = (userId: string): UserBehavior => {
    return {
      userId,
      patterns: generateMockPatterns(),
      preferences: {
        annotationTools: ['polygon', 'rectangle', 'circle'],
        shortcuts: new Map([
          ['ctrl+s', 'save'],
          ['ctrl+z', 'undo'],
          ['ctrl+y', 'redo']
        ]),
        viewSettings: {
          zoom: 100,
          brightness: 50,
          contrast: 50,
          gridEnabled: true,
          snapEnabled: true
        },
        aiAssistanceLevel: 'moderate'
      },
      performance: {
        speed: 85,
        accuracy: 92,
        consistency: 88,
        errorPatterns: [
          {
            type: 'boundary_precision',
            frequency: 12,
            context: ['edge_detection', 'fine_detail'],
            suggestedFix: 'Use zoom tool for better precision'
          }
        ]
      },
      learningCurve: [
        {
          timestamp: Date.now() - 86400000,
          metric: 'accuracy',
          value: 88,
          improvement: 0.02
        },
        {
          timestamp: Date.now(),
          metric: 'accuracy',
          value: 92,
          improvement: 0.04
        }
      ]
    };
  };

  const generateMockPatterns = (): AnnotationPattern[] => {
    return [
      {
        id: 'pattern1',
        pattern: 'Rectangle annotation sequence',
        frequency: 45,
        timeSpent: 1200,
        errorRate: 0.08,
        automationPotential: 0.85
      },
      {
        id: 'pattern2',
        pattern: 'Quality review cycle',
        frequency: 32,
        timeSpent: 800,
        errorRate: 0.12,
        automationPotential: 0.65
      },
      {
        id: 'pattern3',
        pattern: 'Batch export workflow',
        frequency: 28,
        timeSpent: 600,
        errorRate: 0.05,
        automationPotential: 0.92
      }
    ];
  };

  const generateMockOptimizations = (): WorkflowOptimization[] => {
    return [
      {
        type: 'automate',
        targetStep: 'annotation',
        improvement: 35.2,
        confidence: 0.88,
        implementation: {
          code: 'async function automateAnnotation() { /* automation code */ }',
          dependencies: ['tensorflow', 'opencv'],
          estimatedTime: 120,
          riskLevel: 'low'
        }
      },
      {
        type: 'parallelize',
        targetStep: 'validation',
        improvement: 28.7,
        confidence: 0.75,
        implementation: {
          code: 'async function parallelizeValidation() { /* parallel code */ }',
          dependencies: ['worker-threads'],
          estimatedTime: 180,
          riskLevel: 'medium'
        }
      }
    ];
  };

  const generateMockSuggestions = (): Suggestion[] => {
    return [
      {
        id: 'suggestion1',
        type: 'automation',
        description: 'Automate repetitive polygon annotations',
        confidence: 0.89,
        action: () => console.log('Apply automation suggestion')
      },
      {
        id: 'suggestion2',
        type: 'optimization',
        description: 'Reduce batch size for better performance',
        confidence: 0.76,
        action: () => console.log('Apply optimization suggestion')
      },
      {
        id: 'suggestion3',
        type: 'quality',
        description: 'Enable quality assurance checks',
        confidence: 0.82,
        action: () => console.log('Apply quality suggestion')
      }
    ];
  };

  const generateMockAIAssistance = (): AIAssistance => {
    return {
      suggestions: generateMockSuggestions(),
      predictions: [
        {
          type: 'annotation_type',
          value: 'polygon',
          confidence: 0.91
        },
        {
          type: 'quality_score',
          value: 0.87,
          confidence: 0.78
        }
      ],
      corrections: [
        {
          issue: 'Boundary too rough',
          suggestion: 'Use smoothing tool',
          autoApply: false
        },
        {
          issue: 'Missing annotation',
          suggestion: 'Add object detection',
          autoApply: true
        }
      ],
      shortcuts: [
        {
          key: 'Ctrl+A',
          action: 'auto_annotate',
          description: 'Auto-annotate visible objects'
        },
        {
          key: 'Ctrl+Q',
          action: 'quality_check',
          description: 'Run quality check'
        }
      ]
    };
  };

  const generateMockSessionData = (): SessionData => {
    return {
      userId: 'user123',
      actions: [
        {
          type: 'annotation_create',
          timestamp: Date.now() - 30000,
          duration: 5000,
          data: { type: 'polygon', points: 4 }
        },
        {
          type: 'annotation_edit',
          timestamp: Date.now() - 25000,
          duration: 3000,
          data: { type: 'polygon', changes: 2 }
        }
      ],
      duration: 45000,
      timestamp: Date.now()
    };
  };

  const generateMockWorkflowCode = (steps: WorkflowStep[]): string => {
    return `
// Auto-generated workflow code
import { WorkflowStep, StepResult } from './types';

export class GeneratedWorkflow {
  private steps: WorkflowStep[] = [
    ${steps.map(step => `
    {
      id: '${step.id}',
      type: '${step.type}',
      name: '${step.name}',
      description: '${step.description}',
      // ... step configuration
    }`).join(',\n')}
  ];

  async execute(inputs: Map<string, any>): Promise<StepResult[]> {
    const results: StepResult[] = [];
    
    for (const step of this.steps) {
      try {
        const result = await this.executeStep(step, inputs);
        results.push(result);
      } catch (error) {
        results.push({
          stepId: step.id,
          status: 'failed',
          error: error.message,
          duration: 0,
          automated: false,
          confidence: 0
        });
      }
    }
    
    return results;
  }

  private async executeStep(step: WorkflowStep, inputs: Map<string, any>): Promise<StepResult> {
    // Step execution logic
    return {
      stepId: step.id,
      status: 'completed',
      output: inputs,
      duration: 1000,
      automated: step.aiAssistance.enabled,
      confidence: 0.8
    };
  }
}`;
  };

  return (
    <div className={`ai-assisted-coding-panel ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">AI-Assisted Coding</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={automationEnabled}
                onCheckedChange={toggleAutomation}
                id="automation"
              />
              <Label htmlFor="automation">Automation</Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeUserBehavior}
              disabled={isAnalyzing}
            >
              <Activity className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              Analyze Behavior
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={executeWorkflow}
              disabled={isExecuting || !selectedWorkflow}
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Executing
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute
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
        <Tabs defaultValue="workflow" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>

          {/* Workflow Builder */}
          <TabsContent value="workflow" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    Workflow Builder
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workflow-name">Workflow Name</Label>
                    <Input
                      id="workflow-name"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="Enter workflow name"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Steps ({workflowSteps.length})</Label>
                      <Button size="sm" variant="outline" onClick={addWorkflowStep}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Step
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {workflowSteps.map((step, index) => (
                          <div
                            key={step.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              editingStep?.id === step.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                            }`}
                            onClick={() => setEditingStep(step)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleStepExpansion(step.id);
                                  }}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  {expandedSteps.has(step.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                                {getStepTypeIcon(step.type)}
                                <span className="font-medium">{step.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{step.type}</Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeWorkflowStep(step.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {expandedSteps.has(step.id) && (
                              <div className="mt-2 text-sm text-gray-600">
                                <p>{step.description}</p>
                                <div className="mt-1 flex items-center gap-2">
                                  <span>Batch Size: {step.parameters.batchSize}</span>
                                  <span>•</span>
                                  <span>AI Assisted: {step.aiAssistance.enabled ? 'Yes' : 'No'}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <Button
                    onClick={createWorkflow}
                    disabled={loading || !workflowName || workflowSteps.length === 0}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Workflow
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Step Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editingStep ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="step-name">Step Name</Label>
                        <Input
                          id="step-name"
                          value={editingStep.name}
                          onChange={(e) => setEditingStep({
                            ...editingStep,
                            name: e.target.value
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="step-type">Step Type</Label>
                        <Select
                          value={editingStep.type}
                          onValueChange={(value) => setEditingStep({
                            ...editingStep,
                            type: value as any
                          })}
                        >
                          <SelectTrigger id="step-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="annotation">Annotation</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="validation">Validation</SelectItem>
                            <SelectItem value="export">Export</SelectItem>
                            <SelectItem value="training">Training</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="step-description">Description</Label>
                        <Textarea
                          id="step-description"
                          value={editingStep.description}
                          onChange={(e) => setEditingStep({
                            ...editingStep,
                            description: e.target.value
                          })}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>AI Assistance</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Enabled</span>
                            <Switch
                              checked={editingStep.aiAssistance.enabled}
                              onCheckedChange={(enabled) => setEditingStep({
                                ...editingStep,
                                aiAssistance: {
                                  ...editingStep.aiAssistance,
                                  enabled
                                }
                              })}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Smart Suggestions</span>
                            <Switch
                              checked={editingStep.aiAssistance.smartSuggestions}
                              onCheckedChange={(smartSuggestions) => setEditingStep({
                                ...editingStep,
                                aiAssistance: {
                                  ...editingStep.aiAssistance,
                                  smartSuggestions
                                }
                              })}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Error Correction</span>
                            <Switch
                              checked={editingStep.aiAssistance.errorCorrection}
                              onCheckedChange={(errorCorrection) => setEditingStep({
                                ...editingStep,
                                aiAssistance: {
                                  ...editingStep.aiAssistance,
                                  errorCorrection
                                }
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={saveEditingStep} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={() => setEditingStep(null)} size="sm" variant="outline">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Select a step to configure its properties
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Workflow Results */}
            {workflowResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Execution Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workflowResults.slice(0, 3).map((result, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{result.workflowId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {Math.round(result.performance.automationRate * 100)}% automated
                            </Badge>
                            <Badge variant="outline">
                              {result.performance.efficiency.toFixed(1)}% efficiency
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Duration</div>
                            <div className="font-medium">{(result.performance.totalDuration / 1000).toFixed(1)}s</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Throughput</div>
                            <div className="font-medium">{result.performance.throughput}/min</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Success Rate</div>
                            <div className="font-medium">{Math.round(result.performance.successRate * 100)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Steps</div>
                            <div className="font-medium">{result.results.length}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Patterns */}
          <TabsContent value="patterns" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patterns.map((pattern, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{pattern.pattern}</h4>
                      <Badge 
                        className={`${getAutomationPotentialColor(pattern.automationPotential)} text-white`}
                      >
                        {Math.round(pattern.automationPotential * 100)}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Frequency:</span>
                        <span className="font-medium">{pattern.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Spent:</span>
                        <span className="font-medium">{(pattern.timeSpent / 1000).toFixed(1)}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error Rate:</span>
                        <span className="font-medium">{Math.round(pattern.errorRate * 100)}%</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-sm mb-1">Automation Potential</div>
                      <Progress value={pattern.automationPotential * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Suggestions */}
          <TabsContent value="suggestions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Smart Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiAssistance?.suggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{suggestion.type}</Badge>
                          <Badge variant="secondary">
                            {Math.round(suggestion.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                        <Button size="sm" variant="outline" onClick={suggestion.action}>
                          Apply Suggestion
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    AI Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiAssistance?.predictions.map((prediction, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{prediction.type}</span>
                          <Badge variant="outline">
                            {Math.round(prediction.confidence * 100)}%
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Predicted: <span className="font-medium">{prediction.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Error Corrections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiAssistance?.corrections.map((correction, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <Badge variant={correction.autoApply ? "default" : "outline"}>
                            {correction.autoApply ? 'Auto-apply' : 'Manual'}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-red-600">{correction.issue}</div>
                          <div className="text-gray-600 mt-1">{correction.suggestion}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Smart Shortcuts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiAssistance?.shortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="font-medium">{shortcut.key}</div>
                          <div className="text-sm text-gray-600">{shortcut.description}</div>
                        </div>
                        <Badge variant="outline">{shortcut.action}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Optimizations */}
          <TabsContent value="optimizations" className="space-y-4">
            <div className="space-y-3">
              {optimizations.map((optimization, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getOptimizationTypeIcon(optimization.type)}
                        <span className="font-medium capitalize">{optimization.type}</span>
                        <Badge variant="outline">{optimization.targetStep}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          +{optimization.improvement.toFixed(1)}%
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(optimization.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Estimated Time</div>
                        <div className="font-medium">{optimization.implementation.estimatedTime}s</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Risk Level</div>
                        <div className="font-medium capitalize">{optimization.implementation.riskLevel}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Dependencies</div>
                        <div className="font-medium">{optimization.implementation.dependencies.length}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Code
                      </Button>
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* User Behavior */}
          <TabsContent value="behavior" className="space-y-4">
            {userBehavior && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Speed</span>
                          <span>{userBehavior.performance.speed}%</span>
                        </div>
                        <Progress value={userBehavior.performance.speed} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Accuracy</span>
                          <span>{userBehavior.performance.accuracy}%</span>
                        </div>
                        <Progress value={userBehavior.performance.accuracy} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Consistency</span>
                          <span>{userBehavior.performance.consistency}%</span>
                        </div>
                        <Progress value={userBehavior.performance.consistency} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Learning Curve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userBehavior.learningCurve.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded border">
                          <div className="flex items-center gap-2">
                            <span className="capitalize">{metric.metric}</span>
                            <Badge variant="outline">{metric.value}%</Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            {metric.improvement > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={metric.improvement > 0 ? 'text-green-600' : 'text-red-600'}>
                              {metric.improvement > 0 ? '+' : ''}{(metric.improvement * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Error Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userBehavior.performance.errorPatterns.map((error, index) => (
                        <div key={index} className="p-3 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{error.type}</span>
                            <Badge variant="outline">{error.frequency} times</Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <div>Context: {error.context.join(', ')}</div>
                            <div className="mt-1">Fix: {error.suggestedFix}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium mb-1">Annotation Tools</div>
                        <div className="flex flex-wrap gap-1">
                          {userBehavior.preferences.annotationTools.map((tool, index) => (
                            <Badge key={index} variant="outline">{tool}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">AI Assistance Level</div>
                        <Badge variant="default" className="capitalize">
                          {userBehavior.preferences.aiAssistanceLevel}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">View Settings</div>
                        <div className="text-sm text-gray-600">
                          <div>Zoom: {userBehavior.preferences.viewSettings.zoom}%</div>
                          <div>Grid: {userBehavior.preferences.viewSettings.gridEnabled ? 'On' : 'Off'}</div>
                          <div>Snap: {userBehavior.preferences.viewSettings.snapEnabled ? 'On' : 'Off'}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Generated Code */}
          <TabsContent value="code" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  Generated Workflow Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={copyGeneratedCode}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm overflow-x-auto">
                      <code>{generatedCode || 'No code generated yet. Create a workflow to see the generated code.'}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AIAssistedCodingPanel; 