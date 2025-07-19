/**
 * ModelRegistry - Central registry for Aura's 7-local + 2-cloud model strategy
 * 
 * Local Models (7 families):
 * - Qwen3-Coder (4B/8B/14B/32B) - Primary coding model
 * - Phi-4-mini (3.8B) - Local agentic capabilities
 * - Gemma 3 (4B/12B/27B) - Google's multimodal model
 * - Mistral Devstral Small (24B) - Long context SWE agents
 * - Llama 3.3-70B (70B) - General reasoning for workstations
 * - Starcoder2-15B (15B) - Polyglot programming
 * - DeepSeek-Coder V2 Lite (16B) - Efficient MoE architecture
 * 
 * Cloud APIs (Aura Managed):
 * - Kimi K2 - Agentic workflows ($0.60/$2.50 per M tokens)
 * - DeepSeek R1 - Complex reasoning ($0.27/$1.10 per M tokens)
 * 
 * BYO-Key Support (Optional):
 * - OpenAI (GPT-4.1, o3-mini)
 * - Anthropic (Claude 3.7 Opus/Sonnet)
 * - Google (Gemini 2.5 Pro)
 * - xAI (Grok 4)
 * - And more via BYOKey system
 * 
 * Manages model metadata, routing logic, and intelligent task classification
 * for optimal model selection based on task type and hardware capabilities.
 */

import { EventEmitter } from 'events';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Model capability definitions
export interface ModelCapabilities {
  codeCompletion: number; // 0-100 score
  refactoring: number;
  debugging: number;
  architecture: number;
  documentation: number;
  agenticTasks: number;
  reasoning: number;
  contextLength: number;
  speed: number; // tokens/sec
  costPerMillion: number; // USD per million tokens
}

// Task classification
export interface TaskContext {
  type: 'completion' | 'refactor' | 'debug' | 'architect' | 'document' | 'agentic' | 'reason';
  complexity: 'low' | 'medium' | 'high';
  contextSize: number; // in tokens
  requiresToolUse: boolean;
  multiStep: boolean;
  needsLongContext: boolean;
}

// Hardware profile
export interface HardwareProfile {
  totalRam: number; // GB
  availableRam: number; // GB
  gpuAvailable: boolean;
  gpuVram?: number; // GB
  gpuModel?: string;
  cpuCores: number;
  platform: 'darwin' | 'win32' | 'linux';
  arch: 'x64' | 'arm64';
}

// Model profile with capabilities
export interface ModelProfile {
  id: string;
  family: 'qwen3-coder' | 'phi-4-mini' | 'gemma-3' | 'mistral-devstral' | 'llama-3.3' | 
          'starcoder2' | 'deepseek-coder-v2' | 'kimi-k2' | 'deepseek-r1' |
          'openai' | 'anthropic' | 'google' | 'xai' | 'meta' | 'custom';
  variant?: string;
  type: 'local' | 'cloud' | 'hybrid';
  capabilities: ModelCapabilities;
  requirements: {
    minRam: number;
    recommendedRam: number;
    minVram?: number;
    diskSpace: number; // GB
  };
  status: 'available' | 'downloading' | 'not-installed' | 'cloud-only' | 'byo-key';
  endpoint?: string; // For cloud/API models
  isCoreModel?: boolean; // True for our 4 primary models
  requiresApiKey?: boolean; // True for BYO-Key models
}

// Routing decision
export interface RoutingDecision {
  modelId: string;
  reason: string;
  confidence: number; // 0-1
  fallbacks: string[]; // Alternative models in order
  estimatedLatency: number; // ms
  estimatedCost: number; // USD
}

export class ModelRegistry extends EventEmitter {
  private models: Map<string, ModelProfile> = new Map();
  private hardwareProfile?: HardwareProfile;
  private routingHistory: Map<string, RoutingDecision[]> = new Map();
  private performanceMetrics: Map<string, number[]> = new Map();

  constructor() {
    super();
    this.initializeModels();
    this.detectHardware();
  }

  private initializeModels(): void {
    // Qwen3-Coder variants - Primary local coding models
    const qwen3Models: ModelProfile[] = [
      {
        id: 'qwen3-coder-4b',
        family: 'qwen3-coder',
        variant: '4B',
        type: 'local',
        capabilities: {
          codeCompletion: 85,
          refactoring: 75,
          debugging: 70,
          architecture: 60,
          documentation: 80,
          agenticTasks: 40,
          reasoning: 65,
          contextLength: 32768,
          speed: 120, // tokens/sec on CPU
          costPerMillion: 0 // Free local
        },
        requirements: {
          minRam: 8,
          recommendedRam: 16,
          diskSpace: 2.1
        },
        status: 'not-installed'
      },
      {
        id: 'qwen3-coder-8b',
        family: 'qwen3-coder',
        variant: '8B',
        type: 'local',
        capabilities: {
          codeCompletion: 90,
          refactoring: 85,
          debugging: 80,
          architecture: 70,
          documentation: 85,
          agenticTasks: 50,
          reasoning: 75,
          contextLength: 32768,
          speed: 80, // tokens/sec
          costPerMillion: 0
        },
        requirements: {
          minRam: 12,
          recommendedRam: 16,
          minVram: 6,
          diskSpace: 4.3
        },
        status: 'not-installed'
      },
      {
        id: 'qwen3-coder-14b',
        family: 'qwen3-coder',
        variant: '14B',
        type: 'local',
        capabilities: {
          codeCompletion: 95, // 92.9% HumanEval
          refactoring: 90,
          debugging: 85,
          architecture: 75,
          documentation: 90,
          agenticTasks: 60,
          reasoning: 80,
          contextLength: 32768,
          speed: 50, // tokens/sec
          costPerMillion: 0
        },
        requirements: {
          minRam: 16,
          recommendedRam: 24,
          minVram: 8,
          diskSpace: 7.5
        },
        status: 'not-installed'
      }
    ];

    // Kimi K2 - Agentic specialist
    const kimiModel: ModelProfile = {
      id: 'kimi-k2',
      family: 'kimi-k2',
      variant: '32B',
      type: 'hybrid', // Can be local or API
      capabilities: {
        codeCompletion: 85,
        refactoring: 90,
        debugging: 85,
        architecture: 85,
        documentation: 80,
        agenticTasks: 95, // 65.8% SWE-bench - best for autonomous tasks
        reasoning: 90,
        contextLength: 256000,
        speed: 30, // tokens/sec local, 100+ API
        costPerMillion: 0.60 // API pricing
      },
      requirements: {
        minRam: 24,
        recommendedRam: 32,
        minVram: 12,
        diskSpace: 16
      },
      status: 'not-installed',
      endpoint: 'https://api.moonshot.ai/v1'
    };

    // DeepSeek R1 - Cloud reasoning powerhouse
    const deepseekModel: ModelProfile = {
      id: 'deepseek-r1',
      family: 'deepseek-r1',
      type: 'cloud',
      capabilities: {
        codeCompletion: 90,
        refactoring: 95,
        debugging: 90,
        architecture: 98, // Best for complex architecture
        documentation: 85,
        agenticTasks: 80,
        reasoning: 98, // 671B parameters (37B active)
        contextLength: 128000,
        speed: 40, // tokens/sec (cloud)
        costPerMillion: 0.685 // $0.27/$1.10 average
      },
      requirements: {
        minRam: 8, // Just client requirements
        recommendedRam: 16,
        diskSpace: 0
      },
      status: 'cloud-only',
      endpoint: 'https://api.deepseek.com/v1'
    };

    // Mistral Devstral - Long context specialist
    const mistralModel: ModelProfile = {
      id: 'mistral-devstral',
      family: 'mistral-devstral',
      variant: '24B',
      type: 'local',
      capabilities: {
        codeCompletion: 80,
        refactoring: 85,
        debugging: 80,
        architecture: 75,
        documentation: 85,
        agenticTasks: 70,
        reasoning: 75,
        contextLength: 256000, // Key differentiator
        speed: 25, // tokens/sec
        costPerMillion: 0
      },
      requirements: {
        minRam: 20,
        recommendedRam: 32,
        minVram: 10,
        diskSpace: 12
      },
      status: 'not-installed'
    };

    // Phi-4-mini - Local agentic capabilities
    const phi4MiniModel: ModelProfile = {
      id: 'phi-4-mini',
      family: 'phi-4-mini',
      variant: '3.8B',
      type: 'local',
      capabilities: {
        codeCompletion: 63, // 62.8% HumanEval
        refactoring: 70,
        debugging: 75,
        architecture: 65,
        documentation: 80,
        agenticTasks: 85, // Strong agentic capabilities with function calling
        reasoning: 82, // 88.6% GSM8K, 64.0% MATH - strong mathematical reasoning
        contextLength: 128000, // 128K context length
        speed: 100, // tokens/sec
        costPerMillion: 0 // Free local
      },
      requirements: {
        minRam: 8,
        recommendedRam: 12,
        minVram: 4,
        diskSpace: 2.4 // ~2.4GB for efficient deployment
      },
      status: 'not-installed'
    };

    // BYO-Key models - Optional additional providers
    const byoKeyModels: ModelProfile[] = [
      // OpenAI Models
      {
        id: 'gpt-4.1',
        family: 'openai',
        variant: 'GPT-4.1',
        type: 'cloud',
        capabilities: {
          codeCompletion: 95,
          refactoring: 95,
          debugging: 90,
          architecture: 95,
          documentation: 95,
          agenticTasks: 85,
          reasoning: 95,
          contextLength: 128000,
          speed: 50,
          costPerMillion: 5.00
        },
        requirements: {
          minRam: 8,
          recommendedRam: 16,
          diskSpace: 0
        },
        status: 'byo-key',
        endpoint: 'https://api.openai.com/v1',
        isCoreModel: false,
        requiresApiKey: true
      },
      {
        id: 'o3-mini',
        family: 'openai',
        variant: 'o3-mini',
        type: 'cloud',
        capabilities: {
          codeCompletion: 90,
          refactoring: 88,
          debugging: 92,
          architecture: 85,
          documentation: 85,
          agenticTasks: 80,
          reasoning: 92,
          contextLength: 128000,
          speed: 80,
          costPerMillion: 0.60
        },
        requirements: {
          minRam: 8,
          recommendedRam: 16,
          diskSpace: 0
        },
        status: 'byo-key',
        endpoint: 'https://api.openai.com/v1',
        isCoreModel: false,
        requiresApiKey: true
      },
      // Anthropic Models
      {
        id: 'claude-4-opus',
        family: 'anthropic',
        variant: 'Claude 4 Opus',
        type: 'cloud',
        capabilities: {
          codeCompletion: 92,
          refactoring: 96,
          debugging: 94,
          architecture: 97,
          documentation: 98,
          agenticTasks: 88,
          reasoning: 98,
          contextLength: 200000,
          speed: 35,
          costPerMillion: 15.00
        },
        requirements: {
          minRam: 8,
          recommendedRam: 16,
          diskSpace: 0
        },
        status: 'byo-key',
        endpoint: 'https://api.anthropic.com/v1',
        isCoreModel: false,
        requiresApiKey: true
      },
      {
        id: 'claude-4-sonnet',
        family: 'anthropic',
        variant: 'Claude 4 Sonnet',
        type: 'cloud',
        capabilities: {
          codeCompletion: 90,
          refactoring: 94,
          debugging: 92,
          architecture: 94,
          documentation: 96,
          agenticTasks: 85,
          reasoning: 95,
          contextLength: 200000,
          speed: 55,
          costPerMillion: 3.00
        },
        requirements: {
          minRam: 8,
          recommendedRam: 16,
          diskSpace: 0
        },
        status: 'byo-key',
        endpoint: 'https://api.anthropic.com/v1',
        isCoreModel: false,
        requiresApiKey: true
      },
      // Google Models
      {
        id: 'gemini-2.5-pro',
        family: 'google',
        variant: 'Gemini 2.5 Pro',
        type: 'cloud',
        capabilities: {
          codeCompletion: 88,
          refactoring: 90,
          debugging: 87,
          architecture: 92,
          documentation: 90,
          agenticTasks: 82,
          reasoning: 93,
          contextLength: 2000000, // 2M context window
          speed: 60,
          costPerMillion: 2.50
        },
        requirements: {
          minRam: 8,
          recommendedRam: 16,
          diskSpace: 0
        },
        status: 'byo-key',
        endpoint: 'https://generativelanguage.googleapis.com/v1',
        isCoreModel: false,
        requiresApiKey: true
      },
      // xAI Models
      {
        id: 'grok-4',
        family: 'xai',
        variant: 'Grok 4',
        type: 'cloud',
        capabilities: {
          codeCompletion: 87,
          refactoring: 89,
          debugging: 88,
          architecture: 90,
          documentation: 85,
          agenticTasks: 83,
          reasoning: 91,
          contextLength: 256000,
          speed: 45,
          costPerMillion: 3.50
        },
        requirements: {
          minRam: 8,
          recommendedRam: 16,
          diskSpace: 0
        },
        status: 'byo-key',
        endpoint: 'https://api.x.ai/v1',
        isCoreModel: false,
        requiresApiKey: true
      },
      // Meta Models
      {
        id: 'llama-4-70b',
        family: 'meta',
        variant: 'Llama 4 70B',
        type: 'cloud',
        capabilities: {
          codeCompletion: 85,
          refactoring: 87,
          debugging: 84,
          architecture: 88,
          documentation: 86,
          agenticTasks: 78,
          reasoning: 89,
          contextLength: 128000,
          speed: 70,
          costPerMillion: 0.80
        },
        requirements: {
          minRam: 8,
          recommendedRam: 16,
          diskSpace: 0
        },
        status: 'byo-key',
        endpoint: 'https://api.together.xyz/v1', // Example endpoint
        isCoreModel: false,
        requiresApiKey: true
      }
    ];

    // Mark our 5 core models
    qwen3Models.forEach(model => { model.isCoreModel = true; model.requiresApiKey = false; });
    phi4MiniModel.isCoreModel = true;
    phi4MiniModel.requiresApiKey = false;
    kimiModel.isCoreModel = true;
    kimiModel.requiresApiKey = false; // Can be local or API
    deepseekModel.isCoreModel = true;
    deepseekModel.requiresApiKey = false; // Direct API, not BYO-Key
    mistralModel.isCoreModel = true;
    mistralModel.requiresApiKey = false;

    // Register all models - core models first, then BYO-Key models
    [...qwen3Models, phi4MiniModel, kimiModel, deepseekModel, mistralModel, ...byoKeyModels].forEach(model => {
      this.models.set(model.id, model);
    });
  }

  private async detectHardware(): Promise<void> {
    const totalRam = Math.floor(os.totalmem() / (1024 * 1024 * 1024));
    const availableRam = Math.floor(os.freemem() / (1024 * 1024 * 1024));
    const cpuCores = os.cpus().length;
    const platform = os.platform() as 'darwin' | 'win32' | 'linux';
    const arch = os.arch() as 'x64' | 'arm64';

    // Detect GPU
    let gpuInfo = await this.detectGPU();

    this.hardwareProfile = {
      totalRam,
      availableRam,
      gpuAvailable: gpuInfo.available,
      ...(gpuInfo.vram !== undefined && { gpuVram: gpuInfo.vram }),
      ...(gpuInfo.model !== undefined && { gpuModel: gpuInfo.model }),
      cpuCores,
      platform,
      arch
    };

    this.emit('hardware:detected', this.hardwareProfile);
  }

  private async detectGPU(): Promise<{ available: boolean; vram?: number; model?: string }> {
    try {
      if (os.platform() === 'darwin') {
        // macOS - detect Metal GPUs
        const { stdout } = await execAsync('system_profiler SPDisplaysDataType');
        const vramMatch = stdout.match(/VRAM[^:]*:\s*(\d+)/);
        const modelMatch = stdout.match(/Chipset Model:\s*(.+)/);
        
        if (vramMatch) {
          return {
            available: true,
            vram: parseInt(vramMatch[1]) / 1024, // Convert MB to GB
            model: modelMatch ? modelMatch[1].trim() : 'Unknown'
          };
        }
      } else if (os.platform() === 'linux') {
        // Linux - detect NVIDIA GPUs
        try {
          const { stdout } = await execAsync('nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits');
          const [model, vram] = stdout.trim().split(',');
          return {
            available: true,
            vram: parseInt(vram) / 1024, // Convert MB to GB
            model: model.trim()
          };
        } catch {
          // Try AMD
          const { stdout } = await execAsync('rocm-smi --showmeminfo vram --csv');
          const lines = stdout.trim().split('\n');
          if (lines.length > 1) {
            const vram = parseInt(lines[1].split(',')[1]) / (1024 * 1024 * 1024); // Convert B to GB
            return {
              available: true,
              vram,
              model: 'AMD GPU'
            };
          }
        }
      } else if (os.platform() === 'win32') {
        // Windows - use WMIC
        const { stdout } = await execAsync('wmic path win32_VideoController get name,AdapterRAM');
        const lines = stdout.trim().split('\n').slice(1);
        if (lines.length > 0) {
          const [vramStr, ...nameParts] = lines[0].trim().split(/\s+/);
          const vram = parseInt(vramStr) / (1024 * 1024 * 1024); // Convert B to GB
          return {
            available: true,
            vram,
            model: nameParts.join(' ')
          };
        }
      }
    } catch (error) {
      // GPU detection failed
    }

    return { available: false };
  }

  /**
   * Get all registered models
   */
  public getModels(): ModelProfile[] {
    return Array.from(this.models.values());
  }

  /**
   * Get model by ID
   */
  public getModel(modelId: string): ModelProfile | undefined {
    return this.models.get(modelId);
  }

  /**
   * Update model status
   */
  public updateModelStatus(modelId: string, status: ModelProfile['status']): void {
    const model = this.models.get(modelId);
    if (model) {
      model.status = status;
      this.emit('model:status-changed', { modelId, status });
    }
  }

  /**
   * Get hardware profile
   */
  public getHardwareProfile(): HardwareProfile | undefined {
    return this.hardwareProfile;
  }

  /**
   * Classify task for optimal model routing
   */
  public classifyTask(context: Partial<TaskContext>): TaskContext {
    // Default values
    const classified: TaskContext = {
      type: context.type || 'completion',
      complexity: context.complexity || 'low',
      contextSize: context.contextSize || 1000,
      requiresToolUse: context.requiresToolUse || false,
      multiStep: context.multiStep || false,
      needsLongContext: context.needsLongContext || (context.contextSize || 0) > 32000
    };

    // Auto-detect complexity based on context
    if (classified.contextSize > 8000 || classified.multiStep) {
      classified.complexity = 'high';
    } else if (classified.contextSize > 4000 || classified.requiresToolUse) {
      classified.complexity = 'medium';
    }

    // Agentic tasks always require tool use and are multi-step
    if (classified.type === 'agentic') {
      classified.requiresToolUse = true;
      classified.multiStep = true;
      classified.complexity = 'high';
    }

    return classified;
  }

  /**
   * Route task to optimal model based on context and hardware
   */
  public routeTask(context: TaskContext): RoutingDecision {
    const availableModels = this.getAvailableModels();
    const scores = new Map<string, number>();

    // Score each model for the task
    for (const model of availableModels) {
      let score = 0;
      const caps = model.capabilities;

      // Task type matching
      switch (context.type) {
        case 'completion':
          score += caps.codeCompletion;
          break;
        case 'refactor':
          score += caps.refactoring;
          break;
        case 'debug':
          score += caps.debugging;
          break;
        case 'architect':
          score += caps.architecture;
          break;
        case 'document':
          score += caps.documentation;
          break;
        case 'agentic':
          score += caps.agenticTasks * 2; // Double weight for agentic
          break;
        case 'reason':
          score += caps.reasoning;
          break;
      }

      // Context length requirement
      if (context.needsLongContext && caps.contextLength >= 256000) {
        score += 20;
      } else if (context.contextSize > caps.contextLength) {
        score -= 50; // Penalize if can't handle context
      }

      // Speed vs quality trade-off
      if (context.complexity === 'low') {
        score += caps.speed / 10; // Prefer faster models for simple tasks
      } else if (context.complexity === 'high') {
        score += caps.reasoning / 2; // Prefer smarter models for complex tasks
      }

      // Tool use capability
      if (context.requiresToolUse && caps.agenticTasks > 80) {
        score += 30;
      }

      // Cost consideration (prefer local for non-critical tasks)
      if (model.type === 'local' && context.complexity !== 'high') {
        score += 10;
      }

      scores.set(model.id, score);
    }

    // Sort models by score
    const sortedModels = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    if (sortedModels.length === 0) {
      throw new Error('No available models for routing');
    }

    const selectedModelId = sortedModels[0];
    const selectedModel = this.models.get(selectedModelId)!;

    // Create routing decision
    const decision: RoutingDecision = {
      modelId: selectedModelId,
      reason: this.explainRouting(context, selectedModel),
      confidence: Math.min(scores.get(selectedModelId)! / 100, 1),
      fallbacks: sortedModels.slice(1, 4),
      estimatedLatency: this.estimateLatency(selectedModel, context),
      estimatedCost: this.estimateCost(selectedModel, context)
    };

    // Track routing history
    const taskKey = `${context.type}-${context.complexity}`;
    if (!this.routingHistory.has(taskKey)) {
      this.routingHistory.set(taskKey, []);
    }
    this.routingHistory.get(taskKey)!.push(decision);

    this.emit('task:routed', { context, decision });
    return decision;
  }

  /**
   * Get models available on current hardware and API keys
   */
  private getAvailableModels(): ModelProfile[] {
    if (!this.hardwareProfile) {
      // If no hardware detected, only return cloud models with API keys
      return Array.from(this.models.values()).filter(m => 
        m.type === 'cloud' && (m.isCoreModel || this.hasApiKey(m.family))
      );
    }

    return Array.from(this.models.values()).filter(model => {
      // Check if BYO-Key model has API key configured
      if (model.requiresApiKey && !this.hasApiKey(model.family)) {
        return false;
      }

      // Cloud models are available if they have API keys or are core models
      if (model.type === 'cloud') {
        return model.isCoreModel || this.hasApiKey(model.family);
      }

      // Check if local model is installed
      if (model.status !== 'available' && model.status !== 'cloud-only') {
        return false;
      }

      // Check hardware requirements for local models
      const hw = this.hardwareProfile!;
      if (model.requirements.minRam > hw.totalRam) return false;
      
      if (model.requirements.minVram && !hw.gpuAvailable) return false;
      if (model.requirements.minVram && hw.gpuVram && model.requirements.minVram > hw.gpuVram) {
        return false;
      }

      return true;
    });
  }

  /**
   * Check if API key is available for a provider family
   */
  private hasApiKey(family: string): boolean {
    // This would check the BYOKey service for configured API keys
    // For now, return false - this will be integrated with BYOKey service
    switch (family) {
      case 'kimi-k2':
      case 'deepseek-v3':
        return true; // Our core cloud models don't require BYO keys
      case 'openai':
      case 'anthropic':
      case 'google':
      case 'xai':
      case 'meta':
        return false; // Would check actual API key storage
      default:
        return false;
    }
  }

  /**
   * Explain routing decision
   */
  private explainRouting(context: TaskContext, model: ModelProfile): string {
    const reasons: string[] = [];

    // Task type
    reasons.push(`Selected for ${context.type} task`);

    // Special capabilities
    if (context.type === 'agentic' && model.id === 'kimi-k2') {
      reasons.push('Kimi K2 excels at autonomous multi-step tasks');
    } else if (context.complexity === 'high' && model.id === 'deepseek-v3') {
      reasons.push('DeepSeek R1 provides superior reasoning for complex problems');
    } else if (context.needsLongContext && model.capabilities.contextLength >= 256000) {
      reasons.push(`Supports ${model.capabilities.contextLength / 1000}K context window`);
    } else if (model.family === 'qwen3-coder') {
      reasons.push(`Qwen3-Coder ${model.variant} optimized for coding tasks`);
    }

    // Performance
    if (model.type === 'local') {
      reasons.push(`Local inference at ${model.capabilities.speed} tokens/sec`);
    } else {
      reasons.push('Cloud API for enhanced performance');
    }

    return reasons.join('. ');
  }

  /**
   * Estimate latency for a task
   */
  private estimateLatency(model: ModelProfile, context: TaskContext): number {
    const outputTokens = this.estimateOutputTokens(context);
    const tokensPerSecond = model.capabilities.speed;
    
    // Base latency
    let latency = (outputTokens / tokensPerSecond) * 1000; // Convert to ms

    // Add network latency for cloud models
    if (model.type === 'cloud' || (model.type === 'hybrid' && model.status !== 'available')) {
      latency += 200; // 200ms network overhead
    }

    // Add startup time for local models
    if (model.type === 'local') {
      latency += 50; // 50ms model loading overhead
    }

    return Math.round(latency);
  }

  /**
   * Estimate cost for a task
   */
  private estimateCost(model: ModelProfile, context: TaskContext): number {
    if (model.type === 'local') return 0;

    const inputTokens = context.contextSize;
    const outputTokens = this.estimateOutputTokens(context);
    const totalTokens = inputTokens + outputTokens;

    return (totalTokens / 1000000) * model.capabilities.costPerMillion;
  }

  /**
   * Estimate output tokens based on task type
   */
  private estimateOutputTokens(context: TaskContext): number {
    switch (context.type) {
      case 'completion':
        return 100;
      case 'refactor':
        return context.contextSize * 0.8; // 80% of input
      case 'debug':
        return 300;
      case 'architect':
        return 1000;
      case 'document':
        return context.contextSize * 0.5; // 50% of input
      case 'agentic':
        return 2000; // Multi-step tasks generate more
      case 'reason':
        return 500;
      default:
        return 200;
    }
  }

  /**
   * Get optimal model for hardware profile
   */
  public getOptimalModelForHardware(): string {
    if (!this.hardwareProfile) return 'qwen3-coder-4b';

    const hw = this.hardwareProfile;

    // High-end setup (32GB+ RAM, good GPU)
    if (hw.totalRam >= 32 && hw.gpuAvailable && hw.gpuVram && hw.gpuVram >= 12) {
      return 'kimi-k2'; // Can run Kimi locally
    }

    // Good desktop (24GB+ RAM, decent GPU)
    if (hw.totalRam >= 24 && hw.gpuAvailable && hw.gpuVram && hw.gpuVram >= 8) {
      return 'qwen3-coder-14b';
    }

    // Decent desktop (16GB+ RAM)
    if (hw.totalRam >= 16) {
      return 'qwen3-coder-8b';
    }

    // Laptop or constrained environment
    return 'qwen3-coder-4b';
  }

  /**
   * Get routing statistics
   */
  public getRoutingStats(): Map<string, { model: string; count: number }[]> {
    const stats = new Map<string, { model: string; count: number }[]>();

    for (const [taskKey, decisions] of this.routingHistory.entries()) {
      const modelCounts = new Map<string, number>();
      
      for (const decision of decisions) {
        modelCounts.set(decision.modelId, (modelCounts.get(decision.modelId) || 0) + 1);
      }

      stats.set(taskKey, Array.from(modelCounts.entries())
        .map(([model, count]) => ({ model, count }))
        .sort((a, b) => b.count - a.count));
    }

    return stats;
  }

  /**
   * Update performance metrics for a model
   */
  public updatePerformanceMetric(modelId: string, latency: number): void {
    if (!this.performanceMetrics.has(modelId)) {
      this.performanceMetrics.set(modelId, []);
    }

    const metrics = this.performanceMetrics.get(modelId)!;
    metrics.push(latency);

    // Keep last 100 metrics
    if (metrics.length > 100) {
      metrics.shift();
    }

    this.emit('performance:updated', { modelId, latency });
  }

  /**
   * Get average performance for a model
   */
  public getAveragePerformance(modelId: string): number | null {
    const metrics = this.performanceMetrics.get(modelId);
    if (!metrics || metrics.length === 0) return null;

    return metrics.reduce((a, b) => a + b, 0) / metrics.length;
  }
} 