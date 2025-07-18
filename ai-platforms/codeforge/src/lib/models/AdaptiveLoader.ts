/**
 * CodeForge Adaptive Model Loader
 * Intelligently selects and loads models based on task complexity and performance requirements
 * 
 * Features:
 * - Progressive model switching based on complexity analysis
 * - Automatic fallback chains for reliability
 * - Performance-based model selection
 * - Context-aware model routing
 * - Dynamic model scaling
 * - Resource utilization optimization
 * - Learning from usage patterns
 */

import { EventEmitter } from 'events';
import ModelLoader, { ModelDescriptor } from './ModelLoader';

interface ModelCapability {
  type: 'code-completion' | 'chat' | 'refactoring' | 'documentation' | 'debugging' | 'translation';
  complexity: 'simple' | 'medium' | 'complex' | 'expert';
  languages: string[];
  maxContextLength: number;
  performance: {
    accuracy: number;
    latency: number;
    throughput: number;
  };
}

interface TaskComplexity {
  score: number; // 0-100
  factors: {
    codeLength: number;
    syntaxComplexity: number;
    semanticDepth: number;
    contextRequirement: number;
    domainSpecificity: number;
  };
  category: 'simple' | 'medium' | 'complex' | 'expert';
}

interface ModelSelection {
  primary: ModelDescriptor;
  fallbacks: ModelDescriptor[];
  reasoning: string;
  confidenceScore: number;
  expectedPerformance: {
    accuracy: number;
    latency: number;
    resourceUsage: number;
  };
}

interface AdaptiveConfig {
  performanceThresholds: {
    maxLatency: number;
    minAccuracy: number;
    maxMemoryUsage: number;
  };
  fallbackStrategy: 'cascade' | 'parallel' | 'hybrid';
  learningEnabled: boolean;
  cacheSelections: boolean;
}

const DEFAULT_CONFIG: AdaptiveConfig = {
  performanceThresholds: {
    maxLatency: 2000, // ms
    minAccuracy: 0.8,
    maxMemoryUsage: 8192 // MB
  },
  fallbackStrategy: 'cascade',
  learningEnabled: true,
  cacheSelections: true
};

export class AdaptiveLoader extends EventEmitter {
  private config: AdaptiveConfig;
  private modelLoader: ModelLoader;
  private availableModels: Map<string, ModelDescriptor & { capabilities: ModelCapability[] }> = new Map();
  private performanceHistory: Map<string, number[]> = new Map();
  private selectionCache: Map<string, ModelSelection> = new Map();
  private currentModel: string | null = null;
  
  constructor(config?: Partial<AdaptiveConfig>) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.modelLoader = new ModelLoader();
    this.initializeAdaptiveLoader();
  }

  private async initializeAdaptiveLoader(): Promise<void> {
    await this.loadAvailableModels();
    this.emit('adaptive_loader_initialized');
  }

  // Main adaptive loading method
  async selectAndLoadModel(
    task: string,
    context: string,
    requirements?: {
      maxLatency?: number;
      minAccuracy?: number;
      preferredLanguages?: string[];
    }
  ): Promise<{ model: string; filePath: string; selection: ModelSelection }> {
    
    // Analyze task complexity
    const complexity = this.analyzeTaskComplexity(task, context);
    
    // Select optimal model
    const selection = await this.selectOptimalModel(complexity, requirements);
    
    // Load selected model with fallback handling
    const result = await this.loadModelWithFallback(selection);
    
    // Update performance tracking
    this.updatePerformanceHistory(selection.primary.id, complexity);
    
    return result;
  }

  // Task complexity analysis
  private analyzeTaskComplexity(task: string, context: string): TaskComplexity {
    const factors = {
      codeLength: this.analyzeCodeLength(context),
      syntaxComplexity: this.analyzeSyntaxComplexity(context),
      semanticDepth: this.analyzeSemanticDepth(task, context),
      contextRequirement: this.analyzeContextRequirement(task),
      domainSpecificity: this.analyzeDomainSpecificity(context)
    };
    
    // Calculate weighted complexity score
    const weights = {
      codeLength: 0.15,
      syntaxComplexity: 0.25,
      semanticDepth: 0.30,
      contextRequirement: 0.20,
      domainSpecificity: 0.10
    };
    
    const score = Object.entries(factors).reduce((sum, [key, value]) => {
      return sum + (value * weights[key as keyof typeof weights]);
    }, 0);
    
    const category = this.categorizeComplexity(score);
    
    return { score, factors, category };
  }

  private analyzeCodeLength(context: string): number {
    const lines = context.split('\n').length;
    if (lines < 10) return 20;
    if (lines < 50) return 40;
    if (lines < 200) return 60;
    if (lines < 500) return 80;
    return 100;
  }

  private analyzeSyntaxComplexity(context: string): number {
    // Analyze syntax patterns
    const complexPatterns = [
      /class\s+\w+/g,
      /interface\s+\w+/g,
      /function\s*\*/g,
      /async\s+function/g,
      /=>\s*{/g,
      /<[A-Z]\w*>/g,
             /\?\.|[?][?]|[?][?]=/g
    ];
    
    let complexity = 0;
    complexPatterns.forEach(pattern => {
      const matches = context.match(pattern);
      complexity += matches ? matches.length * 10 : 0;
    });
    
    return Math.min(100, complexity);
  }

  private analyzeSemanticDepth(task: string, context: string): number {
    // Analyze semantic complexity
    const semanticKeywords = [
      'algorithm', 'optimization', 'refactor', 'architecture',
      'design pattern', 'performance', 'scalability', 'security',
      'database', 'api', 'framework', 'library', 'integration'
    ];
    
    const taskLower = task.toLowerCase();
    const contextLower = context.toLowerCase();
    
    let depth = 0;
    semanticKeywords.forEach(keyword => {
      if (taskLower.includes(keyword) || contextLower.includes(keyword)) {
        depth += 15;
      }
    });
    
    // Check for complex operations
    if (taskLower.includes('explain') || taskLower.includes('understand')) depth += 20;
    if (taskLower.includes('debug') || taskLower.includes('fix')) depth += 25;
    if (taskLower.includes('optimize') || taskLower.includes('improve')) depth += 30;
    if (taskLower.includes('design') || taskLower.includes('architect')) depth += 35;
    
    return Math.min(100, depth);
  }

  private analyzeContextRequirement(task: string): number {
    // Analyze how much context the task needs
    const taskLower = task.toLowerCase();
    
    if (taskLower.includes('complete this')) return 30;
    if (taskLower.includes('continue')) return 40;
    if (taskLower.includes('refactor')) return 60;
    if (taskLower.includes('explain')) return 70;
    if (taskLower.includes('analyze')) return 80;
    if (taskLower.includes('understand the entire')) return 90;
    
    return 50; // Default
  }

  private analyzeDomainSpecificity(context: string): number {
    // Check for domain-specific patterns
    const domains = {
      'machine learning': /tensorflow|pytorch|sklearn|numpy|pandas/gi,
      'web development': /react|vue|angular|express|fastapi/gi,
      'systems programming': /unsafe|malloc|free|kernel|driver/gi,
      'database': /sql|query|database|mongodb|postgresql/gi,
      'cryptography': /encrypt|decrypt|hash|cipher|crypto/gi,
      'game development': /unity|unreal|opengl|vulkan|directx/gi
    };
    
    for (const [domain, pattern] of Object.entries(domains)) {
      const matches = context.match(pattern);
      if (matches && matches.length > 2) {
        return 80; // High domain specificity
      }
    }
    
    return 30; // General purpose
  }

  private categorizeComplexity(score: number): TaskComplexity['category'] {
    if (score < 25) return 'simple';
    if (score < 50) return 'medium';
    if (score < 75) return 'complex';
    return 'expert';
  }

  // Model selection logic
  private async selectOptimalModel(
    complexity: TaskComplexity,
    requirements?: {
      maxLatency?: number;
      minAccuracy?: number;
      preferredLanguages?: string[];
    }
  ): Promise<ModelSelection> {
    
    // Check cache first
    const cacheKey = this.generateCacheKey(complexity, requirements);
    if (this.config.cacheSelections && this.selectionCache.has(cacheKey)) {
      return this.selectionCache.get(cacheKey)!;
    }
    
    // Filter models by capabilities
    const candidateModels = this.filterModelsByCapability(complexity, requirements);
    
    // Score and rank models
    const rankedModels = this.rankModelsByPerformance(candidateModels, complexity);
    
    if (rankedModels.length === 0) {
      throw new Error('No suitable models found for the given requirements');
    }
    
    // Select primary and fallback models
    const primary = rankedModels[0].model;
    const fallbacks = rankedModels.slice(1, 4).map(r => r.model); // Top 3 fallbacks
    
    const selection: ModelSelection = {
      primary,
      fallbacks,
      reasoning: this.generateSelectionReasoning(rankedModels[0], complexity),
      confidenceScore: rankedModels[0].score,
      expectedPerformance: {
        accuracy: rankedModels[0].expectedAccuracy,
        latency: rankedModels[0].expectedLatency,
        resourceUsage: rankedModels[0].expectedResourceUsage
      }
    };
    
    // Cache selection
    if (this.config.cacheSelections) {
      this.selectionCache.set(cacheKey, selection);
    }
    
    this.emit('model_selected', { complexity, selection });
    return selection;
  }

  private filterModelsByCapability(
    complexity: TaskComplexity,
    requirements?: { maxLatency?: number; minAccuracy?: number; preferredLanguages?: string[] }
  ): Array<ModelDescriptor & { capabilities: ModelCapability[] }> {
    
    return Array.from(this.availableModels.values()).filter(model => {
      // Check if model can handle the complexity
      const hasMatchingCapability = model.capabilities.some(cap => 
        this.complexityMatches(cap.complexity, complexity.category)
      );
      
      if (!hasMatchingCapability) return false;
      
      // Check performance requirements
      if (requirements?.maxLatency) {
        const avgLatency = model.capabilities.reduce((sum, cap) => sum + cap.performance.latency, 0) / model.capabilities.length;
        if (avgLatency > requirements.maxLatency) return false;
      }
      
      if (requirements?.minAccuracy) {
        const avgAccuracy = model.capabilities.reduce((sum, cap) => sum + cap.performance.accuracy, 0) / model.capabilities.length;
        if (avgAccuracy < requirements.minAccuracy) return false;
      }
      
      // Check language preferences
      if (requirements?.preferredLanguages) {
        const hasPreferredLanguage = model.capabilities.some(cap =>
          requirements.preferredLanguages!.some(lang => cap.languages.includes(lang))
        );
        if (!hasPreferredLanguage) return false;
      }
      
      return true;
    });
  }

  private complexityMatches(modelComplexity: string, taskComplexity: string): boolean {
    const complexityLevels = ['simple', 'medium', 'complex', 'expert'];
    const modelLevel = complexityLevels.indexOf(modelComplexity);
    const taskLevel = complexityLevels.indexOf(taskComplexity);
    
    // Model should be able to handle task complexity or higher
    return modelLevel >= taskLevel;
  }

  private rankModelsByPerformance(
    models: Array<ModelDescriptor & { capabilities: ModelCapability[] }>,
    complexity: TaskComplexity
  ): Array<{
    model: ModelDescriptor;
    score: number;
    expectedAccuracy: number;
    expectedLatency: number;
    expectedResourceUsage: number;
  }> {
    
    return models.map(model => {
      const score = this.calculateModelScore(model, complexity);
      const capabilities = model.capabilities[0]; // Use primary capability
      
      return {
        model,
        score,
        expectedAccuracy: capabilities.performance.accuracy,
        expectedLatency: capabilities.performance.latency,
        expectedResourceUsage: this.estimateResourceUsage(model)
      };
    }).sort((a, b) => b.score - a.score);
  }

  private calculateModelScore(
    model: ModelDescriptor & { capabilities: ModelCapability[] },
    complexity: TaskComplexity
  ): number {
    let score = 0;
    
    // Base capability score
    const matchingCapabilities = model.capabilities.filter(cap =>
      this.complexityMatches(cap.complexity, complexity.category)
    );
    
    if (matchingCapabilities.length === 0) return 0;
    
    const bestCapability = matchingCapabilities.reduce((best, cap) =>
      cap.performance.accuracy > best.performance.accuracy ? cap : best
    );
    
    // Performance score (0-40 points)
    score += bestCapability.performance.accuracy * 40;
    score += Math.max(0, 20 - (bestCapability.performance.latency / 100)); // Latency penalty
    score += bestCapability.performance.throughput * 10;
    
    // Historical performance (0-30 points)
    const history = this.performanceHistory.get(model.id);
    if (history && history.length > 0) {
      const avgHistoryScore = history.reduce((sum, h) => sum + h, 0) / history.length;
      score += avgHistoryScore * 30;
    } else {
      score += 15; // Neutral score for new models
    }
    
    // Resource efficiency (0-20 points)
    const resourceScore = Math.max(0, 20 - (this.estimateResourceUsage(model) / 1000));
    score += resourceScore;
    
    // Complexity match bonus (0-10 points)
    if (bestCapability.complexity === complexity.category) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  private estimateResourceUsage(model: ModelDescriptor): number {
    // Estimate memory usage in MB based on model size and type
    const baseMemory = model.size / (1024 * 1024); // Convert to MB
    
    // Add overhead based on model type
    const overhead = {
      'gguf': 1.2, // 20% overhead
      'onnx': 1.3, // 30% overhead
      'tensorrt': 1.1, // 10% overhead
      'safetensors': 1.15 // 15% overhead
    };
    
    return baseMemory * (overhead[model.format] || 1.2);
  }

  // Model loading with fallback
  private async loadModelWithFallback(selection: ModelSelection): Promise<{
    model: string;
    filePath: string;
    selection: ModelSelection;
  }> {
    
    const modelsToTry = [selection.primary, ...selection.fallbacks];
    
    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];
      
      try {
        this.emit('loading_model', { modelId: model.id, attempt: i + 1, total: modelsToTry.length });
        
        const filePath = await this.modelLoader.loadModel(model.id);
        this.currentModel = model.id;
        
        this.emit('model_loaded_successfully', { 
          modelId: model.id, 
          filePath,
          isPrimary: i === 0,
          fallbackLevel: i
        });
        
        return { model: model.id, filePath, selection };
        
      } catch (error) {
        console.warn(`Failed to load model ${model.id} (attempt ${i + 1}):`, error);
        
        this.emit('model_load_failed', { 
          modelId: model.id, 
          error, 
          attempt: i + 1,
          hasMoreFallbacks: i < modelsToTry.length - 1
        });
        
        // If this was the primary model, update performance history negatively
        if (i === 0) {
          this.updatePerformanceHistory(model.id, null, false);
        }
      }
    }
    
    throw new Error('Failed to load any model from the selection');
  }

  // Performance tracking and learning
  private updatePerformanceHistory(
    modelId: string, 
    complexity: TaskComplexity | null, 
    success: boolean = true
  ): void {
    
    if (!this.config.learningEnabled) return;
    
    if (!this.performanceHistory.has(modelId)) {
      this.performanceHistory.set(modelId, []);
    }
    
    const history = this.performanceHistory.get(modelId)!;
    
    // Calculate performance score based on success and complexity
    let score = success ? 1.0 : 0.0;
    
    if (complexity && success) {
      // Bonus for handling complex tasks
      const complexityMultiplier = {
        'simple': 1.0,
        'medium': 1.1,
        'complex': 1.2,
        'expert': 1.3
      };
      score *= complexityMultiplier[complexity.category];
    }
    
    history.push(score);
    
    // Keep only recent history (last 100 entries)
    if (history.length > 100) {
      history.shift();
    }
    
    this.emit('performance_updated', { modelId, score, historyLength: history.length });
  }

  // Utility methods
  private generateCacheKey(
    complexity: TaskComplexity,
    requirements?: { maxLatency?: number; minAccuracy?: number; preferredLanguages?: string[] }
  ): string {
    const key = {
      category: complexity.category,
      score: Math.floor(complexity.score / 10) * 10, // Round to nearest 10
      requirements: requirements || {}
    };
    
    return btoa(JSON.stringify(key));
  }

  private generateSelectionReasoning(
    rankedModel: {
      model: ModelDescriptor;
      score: number;
      expectedAccuracy: number;
      expectedLatency: number;
    },
    complexity: TaskComplexity
  ): string {
    
    const reasons = [];
    
    if (rankedModel.expectedAccuracy > 0.9) {
      reasons.push('high accuracy');
    }
    
    if (rankedModel.expectedLatency < 1000) {
      reasons.push('low latency');
    }
    
    if (complexity.category === 'expert') {
      reasons.push('capable of handling expert-level tasks');
    }
    
    const history = this.performanceHistory.get(rankedModel.model.id);
    if (history && history.length > 0) {
      const avgScore = history.reduce((sum, h) => sum + h, 0) / history.length;
      if (avgScore > 0.8) {
        reasons.push('proven track record');
      }
    }
    
    return `Selected for ${reasons.join(', ')} (score: ${rankedModel.score.toFixed(1)})`;
  }

  private async loadAvailableModels(): Promise<void> {
    // In a real implementation, this would load from a model registry
    const mockModels = [
      {
        id: 'qwen3-coder-8b',
        name: 'Qwen3 Coder 8B',
        version: '1.0.0',
        type: 'local' as const,
        format: 'gguf' as const,
        size: 8 * 1024 * 1024 * 1024,
        sha256: 'mock_hash',
        downloadUrl: 'https://example.com/qwen3-coder-8b.gguf',
        dependencies: [],
        metadata: {
          architecture: 'transformer',
          parameters: 8000000000,
          contextLength: 8192,
          license: 'Apache-2.0',
          description: 'Code-focused model',
          tags: ['coding'],
          capabilities: ['code-completion']
        },
        capabilities: [{
          type: 'code-completion' as const,
          complexity: 'complex' as const,
          languages: ['typescript', 'javascript', 'python', 'rust'],
          maxContextLength: 8192,
          performance: {
            accuracy: 0.92,
            latency: 800,
            throughput: 50
          }
        }]
      }
      // More models would be added here
    ];
    
    mockModels.forEach(model => {
      this.availableModels.set(model.id, model);
    });
  }

  // Public API methods
  getCurrentModel(): string | null {
    return this.currentModel;
  }

  getAvailableModels(): Array<ModelDescriptor & { capabilities: ModelCapability[] }> {
    return Array.from(this.availableModels.values());
  }

  getPerformanceHistory(modelId: string): number[] {
    return this.performanceHistory.get(modelId) || [];
  }

  clearCache(): void {
    this.selectionCache.clear();
    this.emit('cache_cleared');
  }

  updateConfig(config: Partial<AdaptiveConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('config_updated', this.config);
  }
}

// Singleton instance for global usage
export const adaptiveLoader = new AdaptiveLoader();

// Export types and main class
export type { TaskComplexity, ModelSelection, ModelCapability, AdaptiveConfig };
export default AdaptiveLoader; 