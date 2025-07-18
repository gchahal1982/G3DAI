import { EventEmitter } from 'events';
import * as os from 'os';
import { performance } from 'perf_hooks';

// Type definitions (would be imported from other modules in real implementation)
interface ModelCapabilities {
  maxContextLength: number;
  multimodal: boolean;
  thinkingMode: boolean;
  visibleThinking: boolean;
  reasoning: 'basic' | 'advanced' | 'expert';
  [key: string]: any;
}

interface EnhancedModelMetadata {
  id: string;
  name: string;
  version: string;
  contextLength: number;
  capabilities: ModelCapabilities;
  [key: string]: any;
}

interface LoadedModel {
  metadata: EnhancedModelMetadata;
  handle: any;
  [key: string]: any;
}

enum QuantizationType {
  F16 = 'f16',
  Q4_0 = 'q4_0',
  Q4_1 = 'q4_1',
  Q4_K_M = 'q4_k_m',
  Q4_K_S = 'q4_k_s',
  Q5_0 = 'q5_0',
  Q5_1 = 'q5_1',
  Q5_K_M = 'q5_k_m',
  Q5_K_S = 'q5_k_s',
  Q6_K = 'q6_k',
  Q8_0 = 'q8_0'
}

// GPU acceleration types
export enum GPUType {
  NONE = 'none',
  CUDA = 'cuda',
  METAL = 'metal',
  ROCM = 'rocm',
  OPENCL = 'opencl',
  VULKAN = 'vulkan'
}

// Inference request interface
export interface InferenceRequest {
  id: string;
  prompt: string;
  modelId: string;
  options: InferenceOptions;
  timestamp: number;
  priority: 'low' | 'normal' | 'high';
  context?: InferenceContext;
  multimodal?: MultimodalInput;
}

// Enhanced inference options for 2025 models
export interface InferenceOptions {
  maxTokens: number;
  temperature: number;
  topP?: number;
  topK?: number;
  repeatPenalty?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  stopSequences?: string[];
  stream?: boolean;
  batchSize?: number;
  contextWindow?: number; // Override model default
  enableThinking?: boolean; // For thinking mode models
  visibleThinking?: boolean; // Show thinking process
  reasoningDepth?: 'shallow' | 'normal' | 'deep'; // For reasoning models
  multimodalMode?: 'text' | 'vision' | 'audio' | 'combined';
  memoryOptimization?: boolean;
  gpuLayers?: number; // Override auto-detection
  quantization?: QuantizationType;
  timeout?: number;
  cachingEnabled?: boolean;
}

// Inference context for long conversations
export interface InferenceContext {
  conversationId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    tokens?: number;
  }>;
  totalTokens: number;
  maxContextTokens: number;
  compressionStrategy?: 'truncate' | 'summarize' | 'sliding-window';
}

// Multimodal input support
export interface MultimodalInput {
  images?: Array<{
    data: Buffer | string; // Base64 or buffer
    format: 'png' | 'jpg' | 'webp';
    resolution?: { width: number; height: number };
  }>;
  audio?: Array<{
    data: Buffer;
    format: 'wav' | 'mp3' | 'flac';
    sampleRate?: number;
  }>;
  documents?: Array<{
    content: string;
    type: 'text' | 'markdown' | 'code';
    language?: string;
  }>;
}

// Inference result
export interface InferenceResult {
  id: string;
  text: string;
  tokens: number;
  finishReason: 'length' | 'stop' | 'timeout' | 'error';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  performance: {
    latency: number; // ms
    tokensPerSecond: number;
    memoryUsed: number; // bytes
    gpuMemoryUsed?: number; // bytes
  };
  thinking?: string; // Thinking process for reasoning models
  confidence?: number; // Model confidence score
  alternatives?: Array<{ text: string; probability: number }>; // Alternative completions
  metadata: {
    modelUsed: string;
    quantization: QuantizationType;
    gpuAccelerated: boolean;
    batchProcessed: boolean;
    cacheHit: boolean;
  };
}

// Streaming token
export interface StreamingToken {
  token: string;
  logProb?: number;
  isSpecial: boolean;
  position: number;
  thinking?: boolean; // If this token is part of thinking
}

// GPU detection result
export interface GPUInfo {
  type: GPUType;
  name: string;
  memory: number; // MB
  computeCapability?: string;
  driverVersion?: string;
  available: boolean;
  recommendedLayers: number;
}

// Performance metrics
export interface PerformanceMetrics {
  requestsPerSecond: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  totalRequests: number;
  failedRequests: number;
  memoryUsage: {
    current: number;
    peak: number;
    average: number;
  };
  gpuUtilization?: number;
  cacheHitRate: number;
  modelLoadTime: Map<string, number>;
}

// Batch processing
interface BatchRequest {
  requests: InferenceRequest[];
  startTime: number;
  priority: number;
}

// Task 1: Support for 7 local model families with Q4_K_M quantization:
// - Qwen3-Coder (4B/8B/14B/32B) - Primary coding model
// - Phi-4-mini (3.8B) - Local agentic capabilities with function calling
// - Gemma 3 (4B/12B/27B) - Google's multimodal model  
// - Mistral Devstral Small (24B) - Long context SWE agents
// - Llama 3.3-70B (70B) - General reasoning for workstations
// - Starcoder2-15B (15B) - Polyglot programming (600+ languages)
// - DeepSeek-Coder V2 Lite (16B) - Efficient MoE architecture
export class LocalInference extends EventEmitter {
  private loadedModels: Map<string, LoadedModel> = new Map();
  private requestQueue: InferenceRequest[] = [];
  private batchQueue: BatchRequest[] = [];
  private processingQueue: Map<string, Promise<InferenceResult>> = new Map();
  private contexts: Map<string, InferenceContext> = new Map();
  private gpuInfo: GPUInfo | null = null;
  private performanceMetrics: PerformanceMetrics;
  private llamaCppBinding: any = null;
  private isInitialized: boolean = false;
  
  // Configuration
  private readonly MAX_CONCURRENT_REQUESTS = 20; // 20 req/s target
  private readonly BATCH_SIZE = 4;
  private readonly BATCH_TIMEOUT = 100; // ms
  private readonly CONTEXT_CACHE_SIZE = 50;
  private readonly MAX_MEMORY_USAGE = 0.8; // 80% of available RAM

  constructor() {
    super();
    
    this.performanceMetrics = {
      requestsPerSecond: 0,
      averageLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      totalRequests: 0,
      failedRequests: 0,
      memoryUsage: { current: 0, peak: 0, average: 0 },
      cacheHitRate: 0,
      modelLoadTime: new Map()
    };
    
    this.initializeInferenceEngine();
  }

  private async initializeInferenceEngine(): Promise<void> {
    try {
      // Task 6: Add GPU acceleration detection
      await this.detectGPUCapabilities();
      
      // Task 5: Implement llama.cpp bindings
      await this.initializeLlamaCppBindings();
      
      // Start batch processor
      this.startBatchProcessor();
      
      // Start performance monitoring
      this.startPerformanceMonitoring();
      
      this.isInitialized = true;
      this.emit('engineInitialized', { gpuInfo: this.gpuInfo });
      
         } catch (error) {
       console.error('Failed to initialize inference engine:', error);
       throw new Error(`Inference engine initialization failed: ${(error as Error).message || error}`);
     }
  }

  // Task 6: GPU acceleration detection (CUDA/Metal/ROCm)
  private async detectGPUCapabilities(): Promise<void> {
    const platform = os.platform();
    const arch = os.arch();
    
    try {
      // Detect NVIDIA CUDA
      if (await this.detectCUDA()) {
        const cudaInfo = await this.getCUDAInfo();
        this.gpuInfo = {
          type: GPUType.CUDA,
          name: cudaInfo.name,
          memory: cudaInfo.memory,
          computeCapability: cudaInfo.computeCapability,
          driverVersion: cudaInfo.driverVersion,
          available: true,
          recommendedLayers: this.calculateRecommendedLayers(cudaInfo.memory, 'cuda')
        };
        return;
      }
      
      // Detect Apple Metal (macOS)
      if (platform === 'darwin' && await this.detectMetal()) {
        const metalInfo = await this.getMetalInfo();
        this.gpuInfo = {
          type: GPUType.METAL,
          name: metalInfo.name,
          memory: metalInfo.memory,
          available: true,
          recommendedLayers: this.calculateRecommendedLayers(metalInfo.memory, 'metal')
        };
        return;
      }
      
      // Detect AMD ROCm (Linux)
      if (platform === 'linux' && await this.detectROCm()) {
        const rocmInfo = await this.getROCmInfo();
        this.gpuInfo = {
          type: GPUType.ROCM,
          name: rocmInfo.name,
          memory: rocmInfo.memory,
          driverVersion: rocmInfo.driverVersion,
          available: true,
          recommendedLayers: this.calculateRecommendedLayers(rocmInfo.memory, 'rocm')
        };
        return;
      }
      
      // Fallback to CPU-only
      this.gpuInfo = {
        type: GPUType.NONE,
        name: 'CPU-only',
        memory: Math.floor(os.totalmem() / (1024 * 1024)), // Total RAM in MB
        available: true,
        recommendedLayers: 0
      };
      
    } catch (error) {
      console.error('GPU detection failed:', error);
      this.gpuInfo = {
        type: GPUType.NONE,
        name: 'CPU-only (detection failed)',
        memory: Math.floor(os.totalmem() / (1024 * 1024)),
        available: true,
        recommendedLayers: 0
      };
    }
  }

  // Task 5: Implement llama.cpp bindings
  private async initializeLlamaCppBindings(): Promise<void> {
    try {
      // Dynamic import of llama.cpp bindings based on platform
      const platform = os.platform();
      const arch = os.arch();
      
      let bindingPath: string;
      
      if (platform === 'darwin') {
        bindingPath = arch === 'arm64' ? 'llamacpp-darwin-arm64' : 'llamacpp-darwin-x64';
      } else if (platform === 'win32') {
        bindingPath = 'llamacpp-win32-x64';
      } else {
        bindingPath = 'llamacpp-linux-x64';
      }
      
      // Load native bindings
      this.llamaCppBinding = await this.loadNativeBinding(bindingPath);
      
      if (!this.llamaCppBinding) {
        throw new Error('Failed to load llama.cpp bindings');
      }
      
      // Initialize with GPU support if available
      const initOptions = {
        gpuEnabled: this.gpuInfo?.type !== GPUType.NONE,
        gpuType: this.gpuInfo?.type || GPUType.NONE,
        memoryBudget: Math.floor(os.totalmem() * this.MAX_MEMORY_USAGE)
      };
      
      await this.llamaCppBinding.initialize(initOptions);
      
    } catch (error) {
      console.error('Failed to initialize llama.cpp bindings:', error);
      throw error;
    }
  }

  // Task 1 & 2: Load and run inference on all 7 local model families
  // Supports: Qwen3-Coder, Phi-4-mini, Gemma 3, Mistral Devstral, Llama 3.3-70B, Starcoder2, DeepSeek-Coder V2
  async runInference(request: InferenceRequest): Promise<InferenceResult> {
    if (!this.isInitialized) {
      throw new Error('Inference engine not initialized');
    }
    
    const startTime = performance.now();
    
    try {
      // Validate request
      this.validateInferenceRequest(request);
      
      // Load model if not already loaded
      const model = await this.ensureModelLoaded(request.modelId);
      
      // Task 3: Update context window management for new model capabilities
      const contextWindow = request.options.contextWindow || model.metadata.contextLength;
      const processedContext = await this.processContext(request, contextWindow);
      
      // Check if this should be batched
      if (this.shouldBatchRequest(request)) {
        return await this.addToBatch(request);
      }
      
      // Task 4: Add support for multimodal local models
      const processedInput = await this.processMultimodalInput(request, model);
      
      // Run inference
      const result = await this.executeInference(request, model, processedInput, processedContext);
      
      // Task 12: Add performance profiling
      this.updatePerformanceMetrics(startTime, result);
      
      return result;
      
         } catch (error) {
       this.performanceMetrics.failedRequests++;
       this.emit('inferenceError', { requestId: request.id, error: (error as Error).message || String(error) });
       throw error;
     }
  }

  // Task 3: Context window management for 256k-10M tokens
  private async processContext(request: InferenceRequest, contextWindow: number): Promise<string> {
    let finalPrompt = request.prompt;
    
    // Handle conversation context
    if (request.context) {
      const context = request.context;
      let totalTokens = this.estimateTokens(request.prompt);
      
      // Add conversation history
      const messages = [...context.messages];
      
      // For ultra-long context models (Llama 4 Scout with 10M context)
      if (contextWindow >= 10000000) {
        // Can include very large context
        for (const message of messages.reverse()) {
          const messageTokens = message.tokens || this.estimateTokens(message.content);
          if (totalTokens + messageTokens <= contextWindow * 0.9) { // Leave 10% for response
            finalPrompt = `${message.role}: ${message.content}\n${finalPrompt}`;
            totalTokens += messageTokens;
          } else {
            break;
          }
        }
      } else if (contextWindow >= 256000) {
        // Large context models (256k tokens)
        const maxContextTokens = Math.floor(contextWindow * 0.8);
        
        // Use sliding window approach
        const recentMessages = messages.slice(-20); // Keep recent messages
        for (const message of recentMessages.reverse()) {
          const messageTokens = message.tokens || this.estimateTokens(message.content);
          if (totalTokens + messageTokens <= maxContextTokens) {
            finalPrompt = `${message.role}: ${message.content}\n${finalPrompt}`;
            totalTokens += messageTokens;
          } else {
            break;
          }
        }
      } else {
        // Standard context models (4k-128k tokens)
        const maxContextTokens = Math.floor(contextWindow * 0.7);
        
        // Compression strategy
        switch (context.compressionStrategy) {
          case 'summarize':
            finalPrompt = await this.summarizeContext(messages, maxContextTokens) + '\n' + finalPrompt;
            break;
          case 'sliding-window':
            finalPrompt = this.slidingWindowContext(messages, maxContextTokens) + '\n' + finalPrompt;
            break;
          default: // truncate
            finalPrompt = this.truncateContext(messages, maxContextTokens) + '\n' + finalPrompt;
        }
      }
    }
    
    return finalPrompt;
  }

  // Task 4: Multimodal input processing
  private async processMultimodalInput(request: InferenceRequest, model: LoadedModel): Promise<any> {
    if (!request.multimodal || !model.metadata.capabilities.multimodal) {
      return { text: request.prompt };
    }
    
    const input: any = { text: request.prompt };
    
    // Process images
    if (request.multimodal.images && request.multimodal.images.length > 0) {
      input.images = [];
      
      for (const image of request.multimodal.images) {
        const processedImage = await this.processImage(image, model);
        input.images.push(processedImage);
      }
    }
    
    // Process audio
    if (request.multimodal.audio && request.multimodal.audio.length > 0) {
      input.audio = [];
      
      for (const audio of request.multimodal.audio) {
        const processedAudio = await this.processAudio(audio, model);
        input.audio.push(processedAudio);
      }
    }
    
    // Process documents
    if (request.multimodal.documents && request.multimodal.documents.length > 0) {
      input.documents = request.multimodal.documents.map(doc => ({
        content: doc.content,
        type: doc.type,
        language: doc.language
      }));
    }
    
    return input;
  }

  // Task 8: Token streaming implementation
  async runStreamingInference(request: InferenceRequest): Promise<AsyncIterableIterator<StreamingToken>> {
    if (!this.isInitialized) {
      throw new Error('Inference engine not initialized');
    }
    
    const model = await this.ensureModelLoaded(request.modelId);
    const processedContext = await this.processContext(request, request.options.contextWindow || model.metadata.contextLength);
    const processedInput = await this.processMultimodalInput(request, model);
    
    return this.streamTokens(request, model, processedInput, processedContext);
  }

  private async *streamTokens(
    request: InferenceRequest,
    model: LoadedModel,
    input: any,
    context: string
  ): AsyncIterableIterator<StreamingToken> {
    
         try {
       const streamingOptions: any = {
         ...request.options,
         stream: true,
         model: model.handle,
         prompt: context,
         maxTokens: request.options.maxTokens,
         temperature: request.options.temperature,
         topP: request.options.topP,
         topK: request.options.topK,
         stopSequences: request.options.stopSequences
       };
       
       // Enable thinking mode for compatible models
       if (request.options.enableThinking && model.metadata.capabilities.thinkingMode) {
         streamingOptions.thinkingMode = true;
         streamingOptions.visibleThinking = request.options.visibleThinking || false;
       }
      
      const stream = await this.llamaCppBinding.createStream(streamingOptions);
      
      let position = 0;
      let inThinking = false;
      
      for await (const chunk of stream) {
        // Detect thinking mode tokens
        if (chunk.special && chunk.token === '<thinking>') {
          inThinking = true;
          continue;
        }
        
        if (chunk.special && chunk.token === '</thinking>') {
          inThinking = false;
          continue;
        }
        
        const token: StreamingToken = {
          token: chunk.token,
          logProb: chunk.logProb,
          isSpecial: chunk.special,
          position: position++,
          thinking: inThinking
        };
        
        yield token;
        
        // Check for stop sequences
        if (request.options.stopSequences?.some(stop => chunk.token.includes(stop))) {
          break;
        }
      }
      
         } catch (error) {
       this.emit('streamingError', { requestId: request.id, error: (error as Error).message || String(error) });
       throw error;
     }
  }

  // Task 9: Batch inference with 20 req/s target
  private async addToBatch(request: InferenceRequest): Promise<InferenceResult> {
    return new Promise((resolve, reject) => {
      // Add timeout handling
      const timeout = setTimeout(() => {
        reject(new Error('Batch request timeout'));
      }, request.options.timeout || 30000);
      
      // Store resolve/reject for later
      (request as any).resolve = (result: InferenceResult) => {
        clearTimeout(timeout);
        resolve(result);
      };
      (request as any).reject = (error: Error) => {
        clearTimeout(timeout);
        reject(error);
      };
      
      this.requestQueue.push(request);
    });
  }

  private startBatchProcessor(): void {
    setInterval(async () => {
      if (this.requestQueue.length === 0) return;
      
      // Group requests by model and priority
      const batches = this.groupRequestsIntoBatches();
      
      for (const batch of batches) {
        if (this.processingQueue.size < this.MAX_CONCURRENT_REQUESTS) {
          this.processBatch(batch);
        }
      }
    }, this.BATCH_TIMEOUT);
  }

  private groupRequestsIntoBatches(): BatchRequest[] {
    const batches: BatchRequest[] = [];
    const modelGroups = new Map<string, InferenceRequest[]>();
    
    // Group by model
    for (const request of this.requestQueue) {
      if (!modelGroups.has(request.modelId)) {
        modelGroups.set(request.modelId, []);
      }
      modelGroups.get(request.modelId)!.push(request);
    }
    
    // Create batches
    for (const [modelId, requests] of modelGroups) {
      // Sort by priority
      requests.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      
      // Create batches of optimal size
      for (let i = 0; i < requests.length; i += this.BATCH_SIZE) {
        const batchRequests = requests.slice(i, i + this.BATCH_SIZE);
        batches.push({
          requests: batchRequests,
          startTime: Date.now(),
          priority: Math.max(...batchRequests.map(r => ({ high: 3, normal: 2, low: 1 })[r.priority]))
        });
      }
    }
    
    // Clear processed requests from queue
    this.requestQueue = [];
    
    return batches.sort((a, b) => b.priority - a.priority);
  }

  private async processBatch(batch: BatchRequest): Promise<void> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const promises = batch.requests.map(async (request) => {
        try {
          const result = await this.executeSingleInference(request);
          (request as any).resolve(result);
          return result;
        } catch (error) {
          (request as any).reject(error);
          throw error;
        }
      });
      
      this.processingQueue.set(batchId, Promise.all(promises).then(() => ({} as InferenceResult)));
      
      await Promise.all(promises);
      
    } catch (error) {
      console.error(`Batch processing failed for ${batchId}:`, error);
    } finally {
      this.processingQueue.delete(batchId);
    }
  }

  // Task 10 & 11: Memory optimization and quantization
  private async executeSingleInference(request: InferenceRequest): Promise<InferenceResult> {
    const model = await this.ensureModelLoaded(request.modelId);
    const startTime = performance.now();
    
    // Task 10: Memory optimization with 4-bit quantization
    const optimizedOptions = await this.optimizeMemoryUsage(request.options, model);
    
    try {
      const inferenceOptions = {
        model: model.handle,
        prompt: await this.processContext(request, optimizedOptions.contextWindow || model.metadata.contextLength),
        maxTokens: optimizedOptions.maxTokens,
        temperature: optimizedOptions.temperature,
        topP: optimizedOptions.topP,
        topK: optimizedOptions.topK,
        repeatPenalty: optimizedOptions.repeatPenalty,
        stopSequences: optimizedOptions.stopSequences,
        
        // Memory optimization settings
        batchSize: optimizedOptions.batchSize || this.BATCH_SIZE,
        contextWindow: optimizedOptions.contextWindow,
        quantization: optimizedOptions.quantization || QuantizationType.Q4_K_M,
        gpuLayers: optimizedOptions.gpuLayers || this.gpuInfo?.recommendedLayers || 0,
        memoryOptimization: optimizedOptions.memoryOptimization !== false,
        
        // Thinking mode for compatible models
        thinkingMode: optimizedOptions.enableThinking && model.metadata.capabilities.thinkingMode,
        visibleThinking: optimizedOptions.visibleThinking,
        reasoningDepth: optimizedOptions.reasoningDepth || 'normal'
      };
      
      const result = await this.llamaCppBinding.runInference(inferenceOptions);
      
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      return {
        id: request.id,
        text: result.text,
        tokens: result.tokens,
        finishReason: result.finishReason,
        usage: {
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          totalTokens: result.promptTokens + result.completionTokens
        },
        performance: {
          latency,
          tokensPerSecond: result.completionTokens / (latency / 1000),
          memoryUsed: result.memoryUsed,
          gpuMemoryUsed: result.gpuMemoryUsed
        },
        thinking: result.thinking,
        confidence: result.confidence,
        alternatives: result.alternatives,
        metadata: {
          modelUsed: model.metadata.id,
          quantization: optimizedOptions.quantization || QuantizationType.Q4_K_M,
          gpuAccelerated: (optimizedOptions.gpuLayers || 0) > 0,
          batchProcessed: false,
          cacheHit: false
        }
      };
      
    } catch (error) {
      throw new Error(`Inference failed: ${error}`);
    }
  }

  // Memory optimization
  private async optimizeMemoryUsage(options: InferenceOptions, model: LoadedModel): Promise<InferenceOptions> {
    const currentMemoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const memoryUsageRatio = currentMemoryUsage.heapUsed / totalMemory;
    
    const optimized = { ...options };
    
    // Aggressive optimization if memory usage is high
    if (memoryUsageRatio > this.MAX_MEMORY_USAGE) {
      // Use more aggressive quantization
      optimized.quantization = QuantizationType.Q4_0;
      
      // Reduce batch size
      optimized.batchSize = Math.max(1, (optimized.batchSize || this.BATCH_SIZE) / 2);
      
      // Reduce context window if possible
      if (optimized.contextWindow && optimized.contextWindow > 4096) {
        optimized.contextWindow = Math.min(optimized.contextWindow, 8192);
      }
      
      // Reduce GPU layers if using too much VRAM
      if (this.gpuInfo && this.gpuInfo.type !== GPUType.NONE) {
        optimized.gpuLayers = Math.floor((optimized.gpuLayers || this.gpuInfo.recommendedLayers) * 0.7);
      }
    }
    
    return optimized;
  }

  // Task 12: Performance profiling
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 1000); // Update every second
  }

  private updatePerformanceMetrics(startTime?: number, result?: InferenceResult): void {
    if (startTime && result) {
      const latency = performance.now() - startTime;
      
      // Update latency metrics
      this.performanceMetrics.totalRequests++;
      this.performanceMetrics.averageLatency = 
        (this.performanceMetrics.averageLatency * (this.performanceMetrics.totalRequests - 1) + latency) / 
        this.performanceMetrics.totalRequests;
      
      // Update memory metrics
      const memoryUsage = process.memoryUsage();
      this.performanceMetrics.memoryUsage.current = memoryUsage.heapUsed;
      this.performanceMetrics.memoryUsage.peak = Math.max(
        this.performanceMetrics.memoryUsage.peak,
        memoryUsage.heapUsed
      );
    }
    
    // Calculate requests per second
    const now = Date.now();
    const timeWindow = 1000; // 1 second
    const recentRequests = this.performanceMetrics.totalRequests; // Simplified
    this.performanceMetrics.requestsPerSecond = recentRequests;
    
    // Emit performance update
    this.emit('performanceUpdate', this.performanceMetrics);
  }

  // Helper methods
  private shouldBatchRequest(request: InferenceRequest): boolean {
    return !request.options.stream && request.priority !== 'high' && this.requestQueue.length > 0;
  }

  private async ensureModelLoaded(modelId: string): Promise<LoadedModel> {
    const model = this.loadedModels.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not loaded`);
    }
    return model;
  }

  private validateInferenceRequest(request: InferenceRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }
    
    if (request.options.maxTokens <= 0) {
      throw new Error('maxTokens must be positive');
    }
    
    if (request.options.temperature < 0 || request.options.temperature > 2) {
      throw new Error('temperature must be between 0 and 2');
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English
    return Math.ceil(text.length / 4);
  }

  // GPU detection helper methods
  private async detectCUDA(): Promise<boolean> {
    try {
      // Check for nvidia-smi or CUDA runtime
      const { execSync } = require('child_process');
      const result = execSync('nvidia-smi --query-gpu=name --format=csv,noheader,nounits', { encoding: 'utf8' });
      return result.trim().length > 0;
    } catch {
      return false;
    }
  }

  private async detectMetal(): Promise<boolean> {
    try {
      // Check for Metal support on macOS
      const { execSync } = require('child_process');
      const result = execSync('system_profiler SPDisplaysDataType', { encoding: 'utf8' });
      return result.includes('Metal');
    } catch {
      return false;
    }
  }

  private async detectROCm(): Promise<boolean> {
    try {
      // Check for ROCm installation
      const { execSync } = require('child_process');
      const result = execSync('rocm-smi --showproductname', { encoding: 'utf8' });
      return result.trim().length > 0;
    } catch {
      return false;
    }
  }

  private async getCUDAInfo(): Promise<any> {
    // Implementation would query CUDA device info
    return { name: 'NVIDIA GPU', memory: 8192, computeCapability: '8.6', driverVersion: '535.54' };
  }

  private async getMetalInfo(): Promise<any> {
    // Implementation would query Metal device info
    return { name: 'Apple M3 Pro', memory: 18432 };
  }

  private async getROCmInfo(): Promise<any> {
    // Implementation would query ROCm device info
    return { name: 'AMD GPU', memory: 16384, driverVersion: '5.7.0' };
  }

  private calculateRecommendedLayers(memoryMB: number, gpuType: string): number {
    // Calculate recommended GPU layers based on available VRAM
    const memoryGB = memoryMB / 1024;
    
    if (gpuType === 'cuda') {
      return Math.floor(memoryGB * 3); // Conservative estimate
    } else if (gpuType === 'metal') {
      return Math.floor(memoryGB * 2.5); // Metal is slightly less efficient
    } else if (gpuType === 'rocm') {
      return Math.floor(memoryGB * 2); // ROCm is less mature
    }
    
    return 0;
  }

  private async loadNativeBinding(bindingPath: string): Promise<any> {
    // Implementation would load platform-specific native bindings
    return null; // Placeholder
  }

  private async processImage(image: any, model: LoadedModel): Promise<any> {
    // Implementation would process images for multimodal models
    return image;
  }

  private async processAudio(audio: any, model: LoadedModel): Promise<any> {
    // Implementation would process audio for multimodal models
    return audio;
  }

  private async summarizeContext(messages: any[], maxTokens: number): Promise<string> {
    // Implementation would summarize long conversations
    return messages.map(m => `${m.role}: ${m.content}`).join('\n');
  }

  private slidingWindowContext(messages: any[], maxTokens: number): string {
    // Implementation would use sliding window approach
    return messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');
  }

  private truncateContext(messages: any[], maxTokens: number): string {
    // Implementation would truncate to fit in context
    return messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
  }

  // Main inference execution
  private async executeInference(
    request: InferenceRequest,
    model: LoadedModel,
    input: any,
    context: string
  ): Promise<InferenceResult> {
    
    if (request.options.stream) {
      throw new Error('Use runStreamingInference for streaming requests');
    }
    
    return await this.executeSingleInference(request);
  }

  // Public API methods
  public registerModel(model: LoadedModel): void {
    this.loadedModels.set(model.metadata.id, model);
    this.emit('modelRegistered', { modelId: model.metadata.id });
  }

  public unregisterModel(modelId: string): void {
    this.loadedModels.delete(modelId);
    this.emit('modelUnregistered', { modelId });
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  public getGPUInfo(): GPUInfo | null {
    return this.gpuInfo;
  }

  public getLoadedModels(): string[] {
    return Array.from(this.loadedModels.keys());
  }

  public async dispose(): Promise<void> {
    // Cleanup resources
    this.loadedModels.clear();
    this.requestQueue = [];
    this.contexts.clear();
    
    if (this.llamaCppBinding) {
      await this.llamaCppBinding.dispose();
    }
    
    this.removeAllListeners();
  }
} 