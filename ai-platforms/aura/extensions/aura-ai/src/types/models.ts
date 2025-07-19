/**
 * Model types and interfaces for Aura AI Extension
 */

export interface TaskContext {
  language: string;
  framework?: string;
  taskType: 'completion' | 'refactor' | 'debug' | 'explain' | 'generate';
  complexity: 'simple' | 'moderate' | 'complex';
  codeContext: string;
  userIntent: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  contextSize: number;
  isLocal: boolean;
  isAvailable: boolean;
}

export class ModelLoader {
  constructor(private modelsDir: string) {}

  async loadModel(modelId: string): Promise<any> {
    // Stub implementation - to be moved from core
    throw new Error('ModelLoader functionality needs to be implemented in extension');
  }

  async isModelAvailable(modelId: string): Promise<boolean> {
    return false;
  }
}

export class ModelRegistry {
  private models: Map<string, ModelInfo> = new Map();

  registerModel(model: ModelInfo): void {
    this.models.set(model.id, model);
  }

  getModel(id: string): ModelInfo | undefined {
    return this.models.get(id);
  }

  getAvailableModels(): ModelInfo[] {
    return Array.from(this.models.values()).filter(m => m.isAvailable);
  }

  getBestModelForTask(context: TaskContext): ModelInfo | undefined {
    // Stub implementation - to be moved from core
    const available = this.getAvailableModels();
    return available[0]; // Simple fallback
  }

  routeTask(context: TaskContext): ModelInfo | undefined {
    return this.getBestModelForTask(context);
  }
} 