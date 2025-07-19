/**
 * ModelRouter.ts - Intelligent model routing for Aura
 * 
 * Handles intelligent routing across 7 local models + 2 cloud APIs:
 * - Task classification logic (coding, agentic, reasoning, multimodal, etc.)
 * - Context size detection and complexity scoring
 * - Automatic model selection based on hardware and task requirements
 * - Performance tracking and cost optimization
 * - Manual override capability with fallback strategies
 */

import { EventEmitter } from 'events';
import { ModelVariant, LOCAL_MODELS } from './ModelDownloader';

export interface TaskContext {
  type: TaskType;
  content: string;
  language?: string;
  contextSize: number; // in tokens
  complexity: ComplexityLevel;
  priority: Priority;
  userPreference?: string; // specific model ID
  hardware?: HardwareProfile;
  metadata?: Record<string, any>;
}

export type TaskType = 
  | 'code_completion'
  | 'code_generation' 
  | 'refactoring'
  | 'local_agentic'
  | 'cloud_agentic'
  | 'complex_reasoning'
  | 'multimodal'
  | 'polyglot_programming'
  | 'long_context'
  | 'fast_inference'
  | 'architecture_design'
  | 'documentation'
  | 'testing'
  | 'security_analysis';

export type ComplexityLevel = 'simple' | 'medium' | 'complex' | 'architectural';
export type Priority = 'low' | 'normal' | 'high' | 'critical';

export interface HardwareProfile {
  availableVRAM: number; // GB
  totalRAM: number; // GB
  gpuModel: string;
  cpuCores: number;
  diskSpace: number; // GB
}

export interface CloudModel {
  id: string;
  name: string;
  provider: 'aura' | 'byokey';
  endpoint: string;
  costPerInputToken: number; // USD
  costPerOutputToken: number; // USD
  maxContextSize: number; // tokens
  capabilities: string[];
  useCase: string;
}

export const CLOUD_MODELS: CloudModel[] = [
  {
    id: 'kimi-k2',
    name: 'Kimi K2',
    provider: 'aura',
    endpoint: 'https://api.aura.ai/models/kimi-k2',
    costPerInputToken: 0.0000006, // $0.60 per M tokens
    costPerOutputToken: 0.0000025, // $2.50 per M tokens
    maxContextSize: 128000,
    capabilities: ['agentic', 'tool_use', 'function_calling', 'autonomous_coding'],
    useCase: 'Advanced agentic workflows and autonomous coding tasks'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'aura',
    endpoint: 'https://api.aura.ai/models/deepseek-r1',
    costPerInputToken: 0.00000027, // $0.27 per M tokens
    costPerOutputToken: 0.0000011, // $1.10 per M tokens
    maxContextSize: 128000,
    capabilities: ['reasoning', 'architecture', 'complex_analysis', 'code_understanding'],
    useCase: 'Complex reasoning and architectural decisions'
  }
];

export interface RoutingDecision {
  selectedModel: string;
  modelType: 'local' | 'cloud';
  reasoning: string;
  estimatedCost?: number; // USD
  estimatedLatency: number; // ms
  fallbackModels: string[];
  confidence: number; // 0-1
}

export interface PerformanceMetrics {
  modelId: string;
  taskType: TaskType;
  latency: number; // ms
  tokensPerSecond: number;
  accuracy?: number; // 0-1
  cost?: number; // USD
  userSatisfaction?: number; // 0-1, from feedback
  timestamp: Date;
}

export interface RoutingOptions {
  preferLocal: boolean;
  maxCost?: number; // USD
  maxLatency?: number; // ms
  requireOffline?: boolean;
  allowFallback: boolean;
  costOptimization: boolean;
}

export class ModelRouter extends EventEmitter {
  private performanceHistory: PerformanceMetrics[] = [];
  private modelAvailability: Map<string, boolean> = new Map();
  private currentHardware: HardwareProfile | null = null;
  private defaultOptions: RoutingOptions;

  constructor(options: Partial<RoutingOptions> = {}) {
    super();
    
    this.defaultOptions = {
      preferLocal: true,
      allowFallback: true,
      costOptimization: true,
      requireOffline: false,
      ...options
    };

    this.initializeModelAvailability();
  }

  /**
   * Initialize model availability tracking
   */
  private async initializeModelAvailability(): Promise<void> {
    // Check local model availability
    for (const model of LOCAL_MODELS) {
      // This would check if model is actually downloaded
      this.modelAvailability.set(model.id, false); // Placeholder
    }

    // Cloud models are always available (unless offline)
    for (const model of CLOUD_MODELS) {
      this.modelAvailability.set(model.id, true);
    }
  }

  /**
   * Set current hardware profile
   */
  setHardwareProfile(hardware: HardwareProfile): void {
    this.currentHardware = hardware;
    this.emit('hardware:updated', hardware);
  }

  /**
   * Update model availability
   */
  updateModelAvailability(modelId: string, available: boolean): void {
    this.modelAvailability.set(modelId, available);
    this.emit('availability:updated', modelId, available);
  }

  /**
   * Route task to appropriate model
   */
  async routeTask(context: TaskContext, options?: Partial<RoutingOptions>): Promise<RoutingDecision> {
    const opts = { ...this.defaultOptions, ...options };
    
    // Step 1: Classify task if not already classified
    const taskType = this.classifyTask(context);
    context.type = taskType;

    // Step 2: Determine complexity and requirements
    const complexity = this.analyzeComplexity(context);
    context.complexity = complexity;

    // Step 3: Get candidate models
    const candidates = this.getCandidateModels(context, opts);

    // Step 4: Score and rank candidates
    const scored = await this.scoreModels(candidates, context, opts);

    // Step 5: Select best model
    const decision = this.selectBestModel(scored, context, opts);

    // Step 6: Log decision
    this.logRoutingDecision(context, decision);

    return decision;
  }

  /**
   * Classify task based on content and context
   */
  private classifyTask(context: TaskContext): TaskType {
    const { content, contextSize, language } = context;
    const contentLower = content.toLowerCase();

    // Function calling and tool use patterns
    if (this.containsPatterns(contentLower, [
      'function call', 'tool use', 'api call', 'execute', 'run command',
      'autonomous', 'agent', 'workflow', 'multi-step'
    ])) {
      return contextSize > 4000 ? 'cloud_agentic' : 'local_agentic';
    }

    // Complex reasoning patterns
    if (this.containsPatterns(contentLower, [
      'architecture', 'design pattern', 'system design', 'refactor',
      'complex analysis', 'reasoning', 'explain why', 'trade-offs'
    ]) && contextSize > 4000) {
      return 'complex_reasoning';
    }

    // Multimodal patterns
    if (this.containsPatterns(contentLower, [
      'image', 'diagram', 'visual', 'chart', 'screenshot', 'ui',
      'multimodal', 'vision'
    ])) {
      return 'multimodal';
    }

    // Long context patterns
    if (contextSize > 32000) {
      return 'long_context';
    }

    // Polyglot programming
    if (language && this.isRareLanguage(language)) {
      return 'polyglot_programming';
    }

    // Refactoring
    if (this.containsPatterns(contentLower, [
      'refactor', 'restructure', 'reorganize', 'clean up', 'optimize code'
    ])) {
      return 'refactoring';
    }

    // Code generation
    if (this.containsPatterns(contentLower, [
      'generate', 'create', 'build', 'implement', 'write code'
    ])) {
      return 'code_generation';
    }

    // Default to code completion
    return 'code_completion';
  }

  /**
   * Analyze task complexity
   */
  private analyzeComplexity(context: TaskContext): ComplexityLevel {
    const { content, contextSize, type } = context;
    const contentLength = content.length;

    // Architectural complexity
    if (type === 'complex_reasoning' || 
        type === 'architecture_design' ||
        contextSize > 16000) {
      return 'architectural';
    }

    // Complex tasks
    if (type === 'cloud_agentic' ||
        type === 'multimodal' ||
        type === 'long_context' ||
        contextSize > 8000 ||
        contentLength > 2000) {
      return 'complex';
    }

    // Medium complexity
    if (type === 'local_agentic' ||
        type === 'refactoring' ||
        contextSize > 2000 ||
        contentLength > 500) {
      return 'medium';
    }

    return 'simple';
  }

  /**
   * Get candidate models for task
   */
  private getCandidateModels(context: TaskContext, options: RoutingOptions): string[] {
    const { type, complexity, contextSize } = context;
    const candidates: string[] = [];

    // Task-specific model selection
    switch (type) {
      case 'code_completion':
      case 'code_generation':
        candidates.push(...this.getQwen3Variants());
        break;

      case 'local_agentic':
        candidates.push('phi-4-mini');
        if (complexity === 'complex') {
          candidates.push(...this.getQwen3Variants());
        }
        break;

      case 'cloud_agentic':
        candidates.push('kimi-k2');
        if (options.allowFallback) {
          candidates.push('phi-4-mini');
        }
        break;

      case 'complex_reasoning':
      case 'architecture_design':
        candidates.push('deepseek-r1');
        if (options.allowFallback && this.currentHardware?.availableVRAM && this.currentHardware.availableVRAM >= 48) {
          candidates.push('llama-3.3-70b');
        }
        break;

      case 'multimodal':
        candidates.push('gemma-3-12b', 'gemma-3-27b');
        if (!options.preferLocal) {
          candidates.push('deepseek-r1'); // Cloud fallback
        }
        break;

      case 'polyglot_programming':
        candidates.push('starcoder2-15b');
        candidates.push(...this.getQwen3Variants());
        break;

      case 'long_context':
        if (contextSize > 128000) {
          candidates.push('deepseek-r1'); // Cloud only for >128K
        } else {
          candidates.push('mistral-devstral-small');
          candidates.push('deepseek-r1');
        }
        break;

      case 'fast_inference':
        candidates.push('deepseek-coder-v2-lite');
        candidates.push('phi-4-mini');
        break;

      case 'refactoring':
        if (complexity === 'architectural') {
          candidates.push('deepseek-r1');
        }
        candidates.push(...this.getQwen3Variants());
        candidates.push('phi-4-mini');
        break;

      default:
        candidates.push(...this.getQwen3Variants());
    }

    // Filter by availability and offline requirements
    return candidates.filter(modelId => {
      const available = this.modelAvailability.get(modelId);
      const isLocal = LOCAL_MODELS.some(m => m.id === modelId);
      
      if (options.requireOffline && !isLocal) return false;
      return available;
    });
  }

  /**
   * Get appropriate Qwen3 variant based on hardware
   */
  private getQwen3Variants(): string[] {
    if (!this.currentHardware) return ['qwen3-coder-14b'];

    const { availableVRAM } = this.currentHardware;

    if (availableVRAM >= 24) return ['qwen3-coder-32b', 'qwen3-coder-14b'];
    if (availableVRAM >= 12) return ['qwen3-coder-14b', 'qwen3-coder-8b'];
    if (availableVRAM >= 8) return ['qwen3-coder-8b', 'qwen3-coder-4b'];
    return ['qwen3-coder-4b'];
  }

  /**
   * Score models based on multiple factors
   */
  private async scoreModels(
    candidates: string[], 
    context: TaskContext, 
    options: RoutingOptions
  ): Promise<Array<{ modelId: string; score: number; reasoning: string[] }>> {
    const scored = [];

    for (const modelId of candidates) {
      const model = this.getModelInfo(modelId);
      if (!model) continue;

      let score = 0;
      const reasoning: string[] = [];

      // Performance history scoring (40% weight)
      const historyScore = this.getHistoryScore(modelId, context.type);
      score += historyScore * 0.4;
      if (historyScore > 0.7) reasoning.push('High historical performance');

      // Latency scoring (20% weight)
      const latencyScore = this.getLatencyScore(modelId, model);
      score += latencyScore * 0.2;
      if (latencyScore > 0.8) reasoning.push('Low latency expected');

      // Cost scoring (20% weight)
      const costScore = this.getCostScore(modelId, model, context, options);
      score += costScore * 0.2;
      if (costScore > 0.8) reasoning.push('Cost-effective option');

      // Capability matching (15% weight)
      const capabilityScore = this.getCapabilityScore(modelId, context);
      score += capabilityScore * 0.15;
      if (capabilityScore > 0.9) reasoning.push('Perfect capability match');

      // Hardware compatibility (5% weight)
      const hardwareScore = this.getHardwareScore(modelId);
      score += hardwareScore * 0.05;
      if (hardwareScore < 0.5) reasoning.push('Hardware compatibility issues');

      scored.push({ modelId, score, reasoning });
    }

    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Select best model from scored candidates
   */
  private selectBestModel(
    scored: Array<{ modelId: string; score: number; reasoning: string[] }>,
    context: TaskContext,
    options: RoutingOptions
  ): RoutingDecision {
    if (scored.length === 0) {
      throw new Error('No available models for task');
    }

    const best = scored[0];
    const fallbacks = scored.slice(1, 4).map(s => s.modelId);
    
    const model = this.getModelInfo(best.modelId);
    const isLocal = LOCAL_MODELS.some(m => m.id === best.modelId);

    return {
      selectedModel: best.modelId,
      modelType: isLocal ? 'local' : 'cloud',
      reasoning: best.reasoning.join(', '),
      estimatedCost: isLocal ? 0 : this.estimateCost(best.modelId, context),
      estimatedLatency: this.estimateLatency(best.modelId, isLocal),
      fallbackModels: fallbacks,
      confidence: best.score
    };
  }

  /**
   * Helper methods
   */
  private containsPatterns(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }

  private isRareLanguage(language: string): boolean {
    const commonLanguages = ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'cpp'];
    return !commonLanguages.includes(language.toLowerCase());
  }

  private getModelInfo(modelId: string): ModelVariant | CloudModel | null {
    return LOCAL_MODELS.find(m => m.id === modelId) || 
           CLOUD_MODELS.find(m => m.id === modelId) || 
           null;
  }

  private getHistoryScore(modelId: string, taskType: TaskType): number {
    const relevant = this.performanceHistory.filter(
      m => m.modelId === modelId && m.taskType === taskType
    );
    
    if (relevant.length === 0) return 0.5; // Default score
    
    const avgSatisfaction = relevant.reduce((sum, m) => 
      sum + (m.userSatisfaction || 0.5), 0) / relevant.length;
    
    return avgSatisfaction;
  }

  private getLatencyScore(modelId: string, model: any): number {
    const isLocal = LOCAL_MODELS.some(m => m.id === modelId);
    if (isLocal) return 0.9; // Local models are faster
    return 0.6; // Cloud models have network latency
  }

  private getCostScore(
    modelId: string, 
    model: any, 
    context: TaskContext, 
    options: RoutingOptions
  ): number {
    const isLocal = LOCAL_MODELS.some(m => m.id === modelId);
    if (isLocal) return 1.0; // Free

    const estimatedCost = this.estimateCost(modelId, context);
    if (options.maxCost && estimatedCost > options.maxCost) return 0;
    
    // Scale cost score inversely to actual cost
    return Math.max(0, 1 - (estimatedCost / 0.1)); // Penalize costs > $0.10
  }

  private getCapabilityScore(modelId: string, context: TaskContext): number {
    // This would match model capabilities to task requirements
    // Simplified scoring for now
    const optimalMatches: Record<TaskType, string[]> = {
      'code_completion': ['qwen3-coder-14b', 'qwen3-coder-8b'],
      'local_agentic': ['phi-4-mini'],
      'cloud_agentic': ['kimi-k2'],
      'complex_reasoning': ['deepseek-r1', 'llama-3.3-70b'],
      'multimodal': ['gemma-3-12b'],
      'polyglot_programming': ['starcoder2-15b'],
      'long_context': ['mistral-devstral-small'],
      'fast_inference': ['deepseek-coder-v2-lite'],
      // ... other mappings
    } as any;

    const optimal = optimalMatches[context.type] || [];
    return optimal.includes(modelId) ? 1.0 : 0.5;
  }

  private getHardwareScore(modelId: string): number {
    const model = LOCAL_MODELS.find(m => m.id === modelId);
    if (!model || !this.currentHardware) return 1.0;

    const { availableVRAM, totalRAM } = this.currentHardware;
    
    if (availableVRAM < model.vramRequired || totalRAM < model.systemRamRequired) {
      return 0.0; // Cannot run
    }
    
    // Higher score for models that fit comfortably
    const vramUtilization = model.vramRequired / availableVRAM;
    return Math.max(0, 1 - vramUtilization);
  }

  private estimateCost(modelId: string, context: TaskContext): number {
    const cloudModel = CLOUD_MODELS.find(m => m.id === modelId);
    if (!cloudModel) return 0;

    const inputTokens = Math.ceil(context.contextSize);
    const outputTokens = Math.ceil(inputTokens * 0.2); // Assume 20% output ratio

    return (inputTokens * cloudModel.costPerInputToken) + 
           (outputTokens * cloudModel.costPerOutputToken);
  }

  private estimateLatency(modelId: string, isLocal: boolean): number {
    if (isLocal) {
      // Local model latency depends on hardware and model size
      const model = LOCAL_MODELS.find(m => m.id === modelId);
      if (!model) return 100;
      
      // Rough estimation based on model parameters
      const baseLatency = model.vramRequired * 5; // ms per GB VRAM
      return Math.min(baseLatency, 200); // Cap at 200ms
    } else {
      // Cloud latency includes network roundtrip
      return 800; // ~800ms average for cloud
    }
  }

  private logRoutingDecision(context: TaskContext, decision: RoutingDecision): void {
    this.emit('routing:decision', {
      taskType: context.type,
      selectedModel: decision.selectedModel,
      modelType: decision.modelType,
      reasoning: decision.reasoning,
      confidence: decision.confidence,
      timestamp: new Date()
    });
  }

  /**
   * Record performance metrics
   */
  recordPerformance(metrics: PerformanceMetrics): void {
    this.performanceHistory.push(metrics);
    
    // Keep only last 1000 entries
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory.shift();
    }

    this.emit('performance:recorded', metrics);
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(modelId?: string, taskType?: TaskType): PerformanceMetrics[] {
    let filtered = this.performanceHistory;
    
    if (modelId) {
      filtered = filtered.filter(m => m.modelId === modelId);
    }
    
    if (taskType) {
      filtered = filtered.filter(m => m.taskType === taskType);
    }
    
    return filtered;
  }

  /**
   * Update routing options
   */
  updateOptions(options: Partial<RoutingOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
    this.emit('options:updated', this.defaultOptions);
  }
}

// Default instance
export const modelRouter = new ModelRouter({
  preferLocal: true,
  allowFallback: true,
  costOptimization: true
});

export default ModelRouter; 