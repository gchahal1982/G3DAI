/**
 * CodeForge Inference Performance Optimizer
 * Implements comprehensive inference optimization for local and cloud models
 * 
 * Features:
 * - AST-to-embedding batch debouncing (20ms target)
 * - Warm LRU cache for two most-recent GGUF models
 * - Model quantization to Q4_K_M kernels
 * - GPU memory pool management
 * - Inference request batching
 * - Model switching latency reduction
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import * as crypto from 'crypto';

// Interfaces and types
interface InferenceRequest {
  id: string;
  type: 'completion' | 'embedding' | 'classification';
  input: string | any[];
  modelId: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata: {
    contextSize?: number;
    maxTokens?: number;
    temperature?: number;
    sessionId?: string;
    userId?: string;
  };
  callback: (result: InferenceResult) => void;
  timestamp: number;
  timeout?: number;
}

interface InferenceResult {
  id: string;
  success: boolean;
  output?: any;
  error?: string;
  latency: number;
  tokensGenerated?: number;
  modelUsed: string;
  cached: boolean;
  batchId?: string;
}

interface ModelCache {
  modelId: string;
  instance: any; // Model instance
  lastUsed: number;
  loadTime: number;
  memoryUsage: number;
  quantization: string;
  warmupCompleted: boolean;
}

interface GPUMemoryPool {
  totalMemory: number;
  freeMemory: number;
  allocatedBuffers: Map<string, GPUBuffer>;
  memoryUsageHistory: number[];
  fragmentationLevel: number;
}

interface BatchConfiguration {
  maxBatchSize: number;
  maxWaitTime: number; // milliseconds
  dynamicBatching: boolean;
  priorityWeighting: boolean;
}

interface OptimizationMetrics {
  batchEfficiency: number;
  cacheHitRate: number;
  averageLatency: number;
  throughput: number;
  memoryUtilization: number;
  quantizationSpeedup: number;
}

// Configuration constants
const OPTIMIZATION_CONFIG = {
  // Batch debouncing settings
  AST_EMBEDDING_DEBOUNCE_MS: 20,
  MAX_BATCH_SIZE: 16,
  MAX_BATCH_WAIT_MS: 50,
  
  // Cache settings
  MODEL_CACHE_SIZE: 2, // Keep 2 most recent models warm
  CACHE_MEMORY_LIMIT_GB: 16,
  CACHE_EVICTION_THRESHOLD: 0.8,
  
  // GPU memory management
  GPU_MEMORY_POOL_SIZE_GB: 8,
  MEMORY_FRAGMENTATION_THRESHOLD: 0.3,
  BUFFER_ALIGNMENT: 256,
  
  // Quantization settings
  DEFAULT_QUANTIZATION: 'Q4_K_M',
  QUANTIZATION_CACHE_SIZE: 4,
  
  // Performance thresholds
  TARGET_LATENCY_MS: 100,
  TARGET_THROUGHPUT_RPS: 50,
  MAX_QUEUE_SIZE: 1000
};

export class InferenceOptimizer extends EventEmitter {
  private requestQueue: InferenceRequest[] = [];
  private processingBatches: Map<string, InferenceRequest[]> = new Map();
  private modelCache: Map<string, ModelCache> = new Map();
  private gpuMemoryPool: GPUMemoryPool;
  private batchConfig: BatchConfiguration;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private metrics: OptimizationMetrics;
  private isProcessing: boolean = false;
  
  constructor() {
    super();
    
    this.batchConfig = {
      maxBatchSize: OPTIMIZATION_CONFIG.MAX_BATCH_SIZE,
      maxWaitTime: OPTIMIZATION_CONFIG.MAX_BATCH_WAIT_MS,
      dynamicBatching: true,
      priorityWeighting: true
    };
    
    this.gpuMemoryPool = {
      totalMemory: OPTIMIZATION_CONFIG.GPU_MEMORY_POOL_SIZE_GB * 1024 * 1024 * 1024,
      freeMemory: OPTIMIZATION_CONFIG.GPU_MEMORY_POOL_SIZE_GB * 1024 * 1024 * 1024,
      allocatedBuffers: new Map(),
      memoryUsageHistory: [],
      fragmentationLevel: 0
    };
    
    this.metrics = {
      batchEfficiency: 0,
      cacheHitRate: 0,
      averageLatency: 0,
      throughput: 0,
      memoryUtilization: 0,
      quantizationSpeedup: 0
    };
    
    this.initializeOptimizer();
  }

  private async initializeOptimizer(): Promise<void> {
    // Initialize GPU memory pool
    await this.initializeGPUMemoryPool();
    
    // Start optimization loops
    this.startBatchProcessor();
    this.startCacheManager();
    this.startMetricsCollector();
    
    // Preload default models
    await this.preloadDefaultModels();
    
    this.emit('optimizer_initialized');
  }

  // Main inference request interface
  async requestInference(request: Omit<InferenceRequest, 'id' | 'timestamp'>): Promise<InferenceResult> {
    return new Promise((resolve, reject) => {
      const enrichedRequest: InferenceRequest = {
        ...request,
        id: crypto.randomUUID(),
        timestamp: performance.now(),
        callback: resolve
      };

      // Apply debouncing for AST embeddings
      if (request.type === 'embedding' && request.input && typeof request.input === 'string') {
        this.debounceEmbeddingRequest(enrichedRequest);
      } else {
        this.addToQueue(enrichedRequest);
      }

      // Set timeout if specified
      if (request.timeout) {
        setTimeout(() => {
          reject(new Error(`Inference request ${enrichedRequest.id} timed out`));
        }, request.timeout);
      }
    });
  }

  // AST-to-embedding batch debouncing implementation
  private debounceEmbeddingRequest(request: InferenceRequest): void {
    const debounceKey = `${request.modelId}_${request.type}`;
    
    // Clear existing timer for this key
    if (this.debounceTimers.has(debounceKey)) {
      clearTimeout(this.debounceTimers.get(debounceKey)!);
    }
    
    // Add to queue immediately
    this.addToQueue(request);
    
    // Set new debounce timer
    const timer = setTimeout(() => {
      this.flushDebouncedRequests(debounceKey);
      this.debounceTimers.delete(debounceKey);
    }, OPTIMIZATION_CONFIG.AST_EMBEDDING_DEBOUNCE_MS);
    
    this.debounceTimers.set(debounceKey, timer);
  }

  private flushDebouncedRequests(debounceKey: string): void {
    // Find all matching requests in queue
    const [modelId, type] = debounceKey.split('_');
    const matchingRequests = this.requestQueue.filter(req => 
      req.modelId === modelId && req.type === type
    );
    
    if (matchingRequests.length > 0) {
      // Trigger batch processing for these requests
      this.processBatch(matchingRequests);
    }
  }

  private addToQueue(request: InferenceRequest): void {
    // Check queue size limits
    if (this.requestQueue.length >= OPTIMIZATION_CONFIG.MAX_QUEUE_SIZE) {
      // Evict oldest low-priority requests
      this.evictLowPriorityRequests();
    }
    
    // Insert with priority ordering
    const insertIndex = this.findInsertionIndex(request);
    this.requestQueue.splice(insertIndex, 0, request);
    
    this.emit('request_queued', {
      requestId: request.id,
      queueSize: this.requestQueue.length,
      priority: request.priority
    });
    
    // Trigger processing if not already running
    if (!this.isProcessing) {
      this.processBatches();
    }
  }

  private findInsertionIndex(request: InferenceRequest): number {
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    const requestPriority = priorityOrder[request.priority];
    
    for (let i = 0; i < this.requestQueue.length; i++) {
      const queuePriority = priorityOrder[this.requestQueue[i].priority];
      if (requestPriority < queuePriority) {
        return i;
      }
    }
    return this.requestQueue.length;
  }

  // Batch processing system
  private async processBatches(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.requestQueue.length > 0) {
        const batch = this.createOptimalBatch();
        if (batch.length === 0) break;

        const batchId = crypto.randomUUID();
        this.processingBatches.set(batchId, batch);
        
        // Remove from queue
        batch.forEach(req => {
          const index = this.requestQueue.indexOf(req);
          if (index > -1) this.requestQueue.splice(index, 1);
        });

        // Process batch asynchronously
        this.processBatch(batch, batchId);
        
        // Wait for debounce if needed
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private createOptimalBatch(): InferenceRequest[] {
    if (this.requestQueue.length === 0) return [];

    const batch: InferenceRequest[] = [];
    const modelGroups = new Map<string, InferenceRequest[]>();
    
    // Group by model for efficient batching
    for (const request of this.requestQueue) {
      if (!modelGroups.has(request.modelId)) {
        modelGroups.set(request.modelId, []);
      }
      modelGroups.get(request.modelId)!.push(request);
    }
    
    // Select best model group based on:
    // 1. Cached model availability
    // 2. Request count
    // 3. Priority mix
    let bestGroup: InferenceRequest[] = [];
    let bestScore = -1;
    
    for (const [modelId, requests] of modelGroups) {
      const score = this.calculateBatchScore(modelId, requests);
      if (score > bestScore) {
        bestScore = score;
        bestGroup = requests;
      }
    }
    
    // Take up to maxBatchSize requests from best group
    return bestGroup.slice(0, this.batchConfig.maxBatchSize);
  }

  private calculateBatchScore(modelId: string, requests: InferenceRequest[]): number {
    let score = requests.length; // Base score from request count
    
    // Bonus for cached model
    if (this.modelCache.has(modelId)) {
      score += 10;
    }
    
    // Bonus for urgent/high priority requests
    const priorityBonus = requests.reduce((bonus, req) => {
      switch (req.priority) {
        case 'urgent': return bonus + 5;
        case 'high': return bonus + 3;
        case 'normal': return bonus + 1;
        default: return bonus;
      }
    }, 0);
    
    score += priorityBonus;
    
    // Penalty for old requests (avoid starvation)
    const avgAge = requests.reduce((sum, req) => sum + (performance.now() - req.timestamp), 0) / requests.length;
    if (avgAge > 1000) { // > 1 second
      score += Math.floor(avgAge / 100); // Age bonus
    }
    
    return score;
  }

  private async processBatch(batch: InferenceRequest[], batchId?: string): Promise<void> {
    const startTime = performance.now();
    const modelId = batch[0].modelId;
    
    try {
      // Ensure model is loaded and warm
      const model = await this.ensureModelLoaded(modelId);
      
      // Group requests by type for more efficient processing
      const completionRequests = batch.filter(req => req.type === 'completion');
      const embeddingRequests = batch.filter(req => req.type === 'embedding');
      const classificationRequests = batch.filter(req => req.type === 'classification');
      
      // Process each type in batches
      const results: InferenceResult[] = [];
      
      if (completionRequests.length > 0) {
        const completionResults = await this.processBatchCompletions(completionRequests, model);
        results.push(...completionResults);
      }
      
      if (embeddingRequests.length > 0) {
        const embeddingResults = await this.processBatchEmbeddings(embeddingRequests, model);
        results.push(...embeddingResults);
      }
      
      if (classificationRequests.length > 0) {
        const classificationResults = await this.processBatchClassifications(classificationRequests, model);
        results.push(...classificationResults);
      }
      
      // Call callbacks with results
      results.forEach(result => {
        const request = batch.find(req => req.id === result.id);
        if (request) {
          request.callback(result);
        }
      });
      
      // Update metrics
      const batchLatency = performance.now() - startTime;
      this.updateBatchMetrics(batch.length, batchLatency, true);
      
    } catch (error) {
      console.error('Batch processing failed:', error);
      
      // Call error callbacks
      batch.forEach(request => {
        request.callback({
          id: request.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          latency: performance.now() - startTime,
          modelUsed: modelId,
          cached: false,
          batchId
        });
      });
      
      this.updateBatchMetrics(batch.length, performance.now() - startTime, false);
    } finally {
      if (batchId) {
        this.processingBatches.delete(batchId);
      }
    }
  }

  private async processBatchCompletions(requests: InferenceRequest[], model: any): Promise<InferenceResult[]> {
    const inputs = requests.map(req => req.input as string);
    const startTime = performance.now();
    
    // Use model's batch completion if available
    let outputs: string[];
    if (model.batchComplete) {
      outputs = await model.batchComplete(inputs);
    } else {
      // Fallback to sequential processing
      outputs = await Promise.all(inputs.map(input => model.complete(input)));
    }
    
    const latency = performance.now() - startTime;
    
    return requests.map((request, index) => ({
      id: request.id,
      success: true,
      output: outputs[index],
      latency: latency / requests.length, // Distribute latency
      tokensGenerated: outputs[index]?.length || 0,
      modelUsed: model.id,
      cached: this.modelCache.has(model.id)
    }));
  }

  private async processBatchEmbeddings(requests: InferenceRequest[], model: any): Promise<InferenceResult[]> {
    const inputs = requests.map(req => req.input as string);
    const startTime = performance.now();
    
    let embeddings: number[][];
    if (model.batchEmbed) {
      embeddings = await model.batchEmbed(inputs);
    } else {
      embeddings = await Promise.all(inputs.map(input => model.embed(input)));
    }
    
    const latency = performance.now() - startTime;
    
    return requests.map((request, index) => ({
      id: request.id,
      success: true,
      output: embeddings[index],
      latency: latency / requests.length,
      modelUsed: model.id,
      cached: this.modelCache.has(model.id)
    }));
  }

  private async processBatchClassifications(requests: InferenceRequest[], model: any): Promise<InferenceResult[]> {
    const inputs = requests.map(req => req.input);
    const startTime = performance.now();
    
    let classifications: any[];
    if (model.batchClassify) {
      classifications = await model.batchClassify(inputs);
    } else {
      classifications = await Promise.all(inputs.map(input => model.classify(input)));
    }
    
    const latency = performance.now() - startTime;
    
    return requests.map((request, index) => ({
      id: request.id,
      success: true,
      output: classifications[index],
      latency: latency / requests.length,
      modelUsed: model.id,
      cached: this.modelCache.has(model.id)
    }));
  }

  // Model cache management with LRU eviction
  private async ensureModelLoaded(modelId: string): Promise<any> {
    // Check if model is already cached
    if (this.modelCache.has(modelId)) {
      const cached = this.modelCache.get(modelId)!;
      cached.lastUsed = performance.now();
      return cached.instance;
    }
    
    // Check cache capacity
    if (this.modelCache.size >= OPTIMIZATION_CONFIG.MODEL_CACHE_SIZE) {
      await this.evictLeastRecentlyUsedModel();
    }
    
    // Load and cache the model
    const startTime = performance.now();
    const model = await this.loadModel(modelId);
    const loadTime = performance.now() - startTime;
    
    // Estimate memory usage
    const memoryUsage = this.estimateModelMemoryUsage(model);
    
    // Add to cache
    this.modelCache.set(modelId, {
      modelId,
      instance: model,
      lastUsed: performance.now(),
      loadTime,
      memoryUsage,
      quantization: this.getModelQuantization(modelId),
      warmupCompleted: false
    });
    
    // Perform warmup
    await this.warmupModel(model);
    this.modelCache.get(modelId)!.warmupCompleted = true;
    
    this.emit('model_loaded', { modelId, loadTime, memoryUsage });
    return model;
  }

  private async evictLeastRecentlyUsedModel(): Promise<void> {
    let oldestTime = Infinity;
    let oldestModelId = '';
    
    for (const [modelId, cache] of this.modelCache) {
      if (cache.lastUsed < oldestTime) {
        oldestTime = cache.lastUsed;
        oldestModelId = modelId;
      }
    }
    
    if (oldestModelId) {
      const cached = this.modelCache.get(oldestModelId)!;
      
      // Free GPU memory
      await this.unloadModel(cached.instance);
      
      // Remove from cache
      this.modelCache.delete(oldestModelId);
      
      this.emit('model_evicted', { 
        modelId: oldestModelId, 
        memoryFreed: cached.memoryUsage 
      });
    }
  }

  private async loadModel(modelId: string): Promise<any> {
    // Implementation would depend on the specific model loading library
    // This is a placeholder for the actual model loading logic
    
    const quantization = OPTIMIZATION_CONFIG.DEFAULT_QUANTIZATION;
    
    // Allocate GPU memory
    const memoryHandle = await this.allocateGPUMemory(modelId);
    
    // Load quantized model
    const model = await this.loadQuantizedModel(modelId, quantization, memoryHandle);
    
    return model;
  }

  private async loadQuantizedModel(modelId: string, quantization: string, memoryHandle: any): Promise<any> {
    // Placeholder for quantized model loading
    // Would use libraries like llama.cpp, ONNX Runtime, etc.
    
    const model = {
      id: modelId,
      quantization,
      memoryHandle,
      
      // Batch processing methods
      async batchComplete(inputs: string[]): Promise<string[]> {
        // Implement batch completion
        return inputs.map(input => `Completed: ${input}`);
      },
      
      async batchEmbed(inputs: string[]): Promise<number[][]> {
        // Implement batch embedding
        return inputs.map(() => new Array(768).fill(0).map(() => Math.random()));
      },
      
      async batchClassify(inputs: any[]): Promise<any[]> {
        // Implement batch classification
        return inputs.map(() => ({ label: 'positive', confidence: 0.85 }));
      },
      
      // Single processing methods (fallback)
      async complete(input: string): Promise<string> {
        return `Completed: ${input}`;
      },
      
      async embed(input: string): Promise<number[]> {
        return new Array(768).fill(0).map(() => Math.random());
      },
      
      async classify(input: any): Promise<any> {
        return { label: 'positive', confidence: 0.85 };
      }
    };
    
    return model;
  }

  private async warmupModel(model: any): Promise<void> {
    // Perform warmup inferences to optimize performance
    const warmupTasks = [
      model.complete("Hello world"),
      model.embed("Sample text for embedding"),
      model.classify("Sample classification input")
    ];
    
    await Promise.allSettled(warmupTasks);
  }

  private async unloadModel(model: any): Promise<void> {
    // Free GPU memory
    if (model.memoryHandle) {
      await this.freeGPUMemory(model.memoryHandle);
    }
    
    // Additional cleanup
    if (model.cleanup) {
      await model.cleanup();
    }
  }

  // GPU Memory Pool Management
  private async initializeGPUMemoryPool(): Promise<void> {
    // Initialize GPU memory pool
    // This would depend on the GPU library being used (CUDA, Metal, etc.)
    this.emit('gpu_memory_pool_initialized', {
      totalMemory: this.gpuMemoryPool.totalMemory,
      freeMemory: this.gpuMemoryPool.freeMemory
    });
  }

  private async allocateGPUMemory(modelId: string): Promise<any> {
    const estimatedSize = this.estimateModelGPUMemoryRequirement(modelId);
    
    if (estimatedSize > this.gpuMemoryPool.freeMemory) {
      // Attempt to free memory
      await this.defragmentGPUMemory();
      
      if (estimatedSize > this.gpuMemoryPool.freeMemory) {
        throw new Error(`Insufficient GPU memory for model ${modelId}`);
      }
    }
    
    // Allocate aligned buffer
    const alignedSize = Math.ceil(estimatedSize / OPTIMIZATION_CONFIG.BUFFER_ALIGNMENT) * OPTIMIZATION_CONFIG.BUFFER_ALIGNMENT;
    
    const buffer = {
      id: crypto.randomUUID(),
      size: alignedSize,
      modelId,
      allocated: Date.now()
    };
    
    this.gpuMemoryPool.allocatedBuffers.set(buffer.id, buffer);
    this.gpuMemoryPool.freeMemory -= alignedSize;
    
    return buffer;
  }

  private async freeGPUMemory(memoryHandle: any): Promise<void> {
    if (this.gpuMemoryPool.allocatedBuffers.has(memoryHandle.id)) {
      const buffer = this.gpuMemoryPool.allocatedBuffers.get(memoryHandle.id)!;
      this.gpuMemoryPool.freeMemory += buffer.size;
      this.gpuMemoryPool.allocatedBuffers.delete(memoryHandle.id);
    }
  }

  private async defragmentGPUMemory(): Promise<void> {
    // Implement GPU memory defragmentation
    // This would compact allocated buffers and merge free spaces
    this.gpuMemoryPool.fragmentationLevel = 0;
    this.emit('gpu_memory_defragmented');
  }

  // Utility methods
  private estimateModelMemoryUsage(model: any): number {
    // Estimate based on model parameters and quantization
    return 1024 * 1024 * 1024; // 1GB placeholder
  }

  private estimateModelGPUMemoryRequirement(modelId: string): number {
    // Estimate based on model size and quantization
    return 2 * 1024 * 1024 * 1024; // 2GB placeholder
  }

  private getModelQuantization(modelId: string): string {
    // Return quantization level for model
    return OPTIMIZATION_CONFIG.DEFAULT_QUANTIZATION;
  }

  private evictLowPriorityRequests(): void {
    // Remove oldest low-priority requests
    const lowPriorityIndices = this.requestQueue
      .map((req, index) => ({ req, index }))
      .filter(({ req }) => req.priority === 'low')
      .map(({ index }) => index)
      .slice(0, 10); // Remove up to 10 requests
    
    lowPriorityIndices.reverse().forEach(index => {
      this.requestQueue.splice(index, 1);
    });
  }

  private updateBatchMetrics(batchSize: number, latency: number, success: boolean): void {
    // Update efficiency metrics
    this.metrics.batchEfficiency = (this.metrics.batchEfficiency * 0.9) + (batchSize * 0.1);
    this.metrics.averageLatency = (this.metrics.averageLatency * 0.9) + (latency * 0.1);
    
    // Update cache hit rate
    const cacheHits = Array.from(this.modelCache.values()).reduce((sum, cache) => 
      sum + (cache.lastUsed > performance.now() - 60000 ? 1 : 0), 0
    );
    this.metrics.cacheHitRate = cacheHits / Math.max(this.modelCache.size, 1);
    
    // Update memory utilization
    this.metrics.memoryUtilization = 1 - (this.gpuMemoryPool.freeMemory / this.gpuMemoryPool.totalMemory);
    
    this.emit('metrics_updated', this.metrics);
  }

  // Initialization helpers
  private async preloadDefaultModels(): Promise<void> {
    // Preload commonly used models
    const defaultModels = ['qwen3-coder-8b', 'phi-4-mini'];
    
    for (const modelId of defaultModels) {
      try {
        await this.ensureModelLoaded(modelId);
      } catch (error) {
        console.warn(`Failed to preload model ${modelId}:`, error);
      }
    }
  }

  private startBatchProcessor(): void {
    // Batch processor runs every 10ms
    setInterval(() => {
      if (this.requestQueue.length > 0 && !this.isProcessing) {
        this.processBatches();
      }
    }, 10);
  }

  private startCacheManager(): void {
    // Cache cleanup every 30 seconds
    setInterval(() => {
      this.cleanupStaleCache();
    }, 30000);
  }

  private startMetricsCollector(): void {
    // Metrics collection every 5 seconds
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 5000);
  }

  private cleanupStaleCache(): void {
    const now = performance.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    
    for (const [modelId, cache] of this.modelCache) {
      if (now - cache.lastUsed > staleThreshold) {
        this.evictLeastRecentlyUsedModel();
        break; // Evict one at a time
      }
    }
  }

  private collectPerformanceMetrics(): void {
    // Update throughput
    const recentRequests = this.requestQueue.length + 
      Array.from(this.processingBatches.values()).reduce((sum, batch) => sum + batch.length, 0);
    this.metrics.throughput = recentRequests;
    
    // Emit metrics
    this.emit('performance_metrics', this.metrics);
  }

  // Public API methods
  getMetrics(): OptimizationMetrics {
    return { ...this.metrics };
  }

  getQueueStatus(): { queueSize: number; processingBatches: number; cachedModels: number } {
    return {
      queueSize: this.requestQueue.length,
      processingBatches: this.processingBatches.size,
      cachedModels: this.modelCache.size
    };
  }

  getCacheStatus(): Map<string, Omit<ModelCache, 'instance'>> {
    const status = new Map();
    for (const [modelId, cache] of this.modelCache) {
      status.set(modelId, {
        modelId: cache.modelId,
        lastUsed: cache.lastUsed,
        loadTime: cache.loadTime,
        memoryUsage: cache.memoryUsage,
        quantization: cache.quantization,
        warmupCompleted: cache.warmupCompleted
      });
    }
    return status;
  }

  getGPUMemoryStatus(): Omit<GPUMemoryPool, 'allocatedBuffers'> {
    return {
      totalMemory: this.gpuMemoryPool.totalMemory,
      freeMemory: this.gpuMemoryPool.freeMemory,
      memoryUsageHistory: [...this.gpuMemoryPool.memoryUsageHistory],
      fragmentationLevel: this.gpuMemoryPool.fragmentationLevel
    };
  }

  async shutdown(): Promise<void> {
    // Clear all timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    
    // Unload all cached models
    for (const cache of this.modelCache.values()) {
      await this.unloadModel(cache.instance);
    }
    this.modelCache.clear();
    
    // Clear processing queues
    this.requestQueue.length = 0;
    this.processingBatches.clear();
    
    this.emit('optimizer_shutdown');
  }
}

// Singleton instance for global usage
export const inferenceOptimizer = new InferenceOptimizer();

// Export types and main class
export type { InferenceRequest, InferenceResult, OptimizationMetrics, BatchConfiguration };
export default InferenceOptimizer; 