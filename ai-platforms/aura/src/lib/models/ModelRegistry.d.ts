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
export interface ModelCapabilities {
    codeCompletion: number;
    refactoring: number;
    debugging: number;
    architecture: number;
    documentation: number;
    agenticTasks: number;
    reasoning: number;
    contextLength: number;
    speed: number;
    costPerMillion: number;
}
export interface TaskContext {
    type: 'completion' | 'refactor' | 'debug' | 'architect' | 'document' | 'agentic' | 'reason';
    complexity: 'low' | 'medium' | 'high';
    contextSize: number;
    requiresToolUse: boolean;
    multiStep: boolean;
    needsLongContext: boolean;
}
export interface HardwareProfile {
    totalRam: number;
    availableRam: number;
    gpuAvailable: boolean;
    gpuVram?: number;
    gpuModel?: string;
    cpuCores: number;
    platform: 'darwin' | 'win32' | 'linux';
    arch: 'x64' | 'arm64';
}
export interface ModelProfile {
    id: string;
    family: 'qwen3-coder' | 'phi-4-mini' | 'gemma-3' | 'mistral-devstral' | 'llama-3.3' | 'starcoder2' | 'deepseek-coder-v2' | 'kimi-k2' | 'deepseek-r1' | 'openai' | 'anthropic' | 'google' | 'xai' | 'meta' | 'custom';
    variant?: string;
    type: 'local' | 'cloud' | 'hybrid';
    capabilities: ModelCapabilities;
    requirements: {
        minRam: number;
        recommendedRam: number;
        minVram?: number;
        diskSpace: number;
    };
    status: 'available' | 'downloading' | 'not-installed' | 'cloud-only' | 'byo-key';
    endpoint?: string;
    isCoreModel?: boolean;
    requiresApiKey?: boolean;
}
export interface RoutingDecision {
    modelId: string;
    reason: string;
    confidence: number;
    fallbacks: string[];
    estimatedLatency: number;
    estimatedCost: number;
}
export declare class ModelRegistry extends EventEmitter {
    private models;
    private hardwareProfile?;
    private routingHistory;
    private performanceMetrics;
    constructor();
    private initializeModels;
    private detectHardware;
    private detectGPU;
    /**
     * Get all registered models
     */
    getModels(): ModelProfile[];
    /**
     * Get model by ID
     */
    getModel(modelId: string): ModelProfile | undefined;
    /**
     * Update model status
     */
    updateModelStatus(modelId: string, status: ModelProfile['status']): void;
    /**
     * Get hardware profile
     */
    getHardwareProfile(): HardwareProfile | undefined;
    /**
     * Classify task for optimal model routing
     */
    classifyTask(context: Partial<TaskContext>): TaskContext;
    /**
     * Route task to optimal model based on context and hardware
     */
    routeTask(context: TaskContext): RoutingDecision;
    /**
     * Get models available on current hardware and API keys
     */
    private getAvailableModels;
    /**
     * Check if API key is available for a provider family
     */
    private hasApiKey;
    /**
     * Explain routing decision
     */
    private explainRouting;
    /**
     * Estimate latency for a task
     */
    private estimateLatency;
    /**
     * Estimate cost for a task
     */
    private estimateCost;
    /**
     * Estimate output tokens based on task type
     */
    private estimateOutputTokens;
    /**
     * Get optimal model for hardware profile
     */
    getOptimalModelForHardware(): string;
    /**
     * Get routing statistics
     */
    getRoutingStats(): Map<string, {
        model: string;
        count: number;
    }[]>;
    /**
     * Update performance metrics for a model
     */
    updatePerformanceMetric(modelId: string, latency: number): void;
    /**
     * Get average performance for a model
     */
    getAveragePerformance(modelId: string): number | null;
}
//# sourceMappingURL=ModelRegistry.d.ts.map