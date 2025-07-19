import { EventEmitter } from 'events';
import Queue, { Job } from 'bull';
import { Redis } from 'ioredis';
import { performance } from 'perf_hooks';
import { createHash } from 'crypto';
import { promisify } from 'util';

// Types and interfaces
interface AIRequest {
  id: string;
  type: 'completion' | 'chat' | 'refactor' | 'explain' | 'test' | 'doc';
  prompt: string;
  context?: string;
  model: string;
  parameters: {
    temperature: number;
    maxTokens: number;
    topP?: number;
    topK?: number;
    stream?: boolean;
  };
  metadata: {
    userId: string;
    sessionId: string;
    timestamp: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    retryCount: number;
  };
}

interface AIResponse {
  id: string;
  success: boolean;
  result?: {
    text: string;
    confidence: number;
    reasoning?: string;
    suggestions?: string[];
    metadata: {
      model: string;
      tokensUsed: {
        prompt: number;
        completion: number;
        total: number;
      };
      latency: number;
      cost?: number;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  cached: boolean;
  processingTime: number;
}

interface ModelInstance {
  id: string;
  name: string;
  type: 'local' | 'cloud';
  provider: string;
  status: 'loading' | 'ready' | 'busy' | 'error' | 'maintenance';
  capabilities: string[];
  performance: {
    latency: number;
    throughput: number;
    memoryUsage: number;
    gpuUsage?: number;
    errorRate: number;
  };
  config: {
    endpoint?: string;
    apiKey?: string;
    maxConcurrent: number;
    timeout: number;
    retryPolicy: {
      maxRetries: number;
      backoffMs: number;
    };
  };
  health: {
    lastCheck: number;
    isHealthy: boolean;
    consecutiveFailures: number;
  };
}

interface BatchRequest {
  id: string;
  requests: AIRequest[];
  maxBatchSize: number;
  maxWaitMs: number;
  createdAt: number;
}

interface CacheEntry {
  key: string;
  value: AIResponse;
  ttl: number;
  hitCount: number;
  lastAccessed: number;
}

interface ServiceMetrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    cached: number;
  };
  latency: {
    p50: number;
    p95: number;
    p99: number;
    average: number;
  };
  throughput: {
    requestsPerSecond: number;
    tokensPerSecond: number;
  };
  models: {
    [modelId: string]: {
      requests: number;
      latency: number;
      errorRate: number;
      utilization: number;
    };
  };
  cache: {
    hitRate: number;
    size: number;
    evictions: number;
  };
  system: {
    memoryUsage: number;
    cpuUsage: number;
    uptime: number;
  };
}

// Task 1: Create FastAPI microservice structure
export class AIService extends EventEmitter {
  private models: Map<string, ModelInstance>;
  private requestQueue!: Queue.Queue;
  private batchQueue!: Queue.Queue;
  private cache!: Redis;
  private metrics!: ServiceMetrics;
  private isShuttingDown: boolean;
  private healthCheckInterval!: NodeJS.Timeout;
  private metricsInterval!: NodeJS.Timeout;
  private activeBatches: Map<string, BatchRequest>;
  private loadBalancer!: LoadBalancer;

  constructor(config: AIServiceConfig) {
    super();
    this.models = new Map();
    this.activeBatches = new Map();
    this.isShuttingDown = false;
    
    this.initializeQueues(config);
    this.initializeCache(config);
    this.initializeMetrics();
    this.initializeLoadBalancer();
    this.setupHealthChecks();
    this.setupModels(config.models);
  }

  // Task 1: Initialize queue system
  private initializeQueues(config: AIServiceConfig): void {
    // Task 4: Create async processing queue
    this.requestQueue = new Queue('ai-requests', {
      redis: config.redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    });

    // Task 3: Add request batching
    this.batchQueue = new Queue('ai-batches', {
      redis: config.redis,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 25,
        attempts: 2
      }
    });

    // Process individual requests
    this.requestQueue.process('single-request', config.concurrency || 10, async (job) => {
      return this.processRequest(job.data as AIRequest);
    });

    // Process batch requests
    this.batchQueue.process('batch-request', 5, async (job) => {
      return this.processBatch(job.data as BatchRequest);
    });

    // Event handlers
    this.requestQueue.on('completed', (job, result) => {
      this.updateMetrics('request_completed', { result, duration: job.processedOn! - job.timestamp });
    });

    this.requestQueue.on('failed', (job, err) => {
      this.updateMetrics('request_failed', { error: err.message, duration: job.processedOn! - job.timestamp });
      this.emit('request_failed', { jobId: job.id, error: err });
    });
  }

  // Task 5: Implement result caching
  private initializeCache(config: AIServiceConfig): void {
    this.cache = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.cache?.db || 1,
      keyPrefix: 'ai-cache:',
      maxRetriesPerRequest: 3
    });

    this.cache.on('error', (err) => {
      console.error('Cache error:', err);
      this.updateMetrics('cache_error', { error: err.message });
    });
  }

  // Task 6: Add performance monitoring
  private initializeMetrics(): void {
    this.metrics = {
      requests: { total: 0, successful: 0, failed: 0, cached: 0 },
      latency: { p50: 0, p95: 0, p99: 0, average: 0 },
      throughput: { requestsPerSecond: 0, tokensPerSecond: 0 },
      models: {},
      cache: { hitRate: 0, size: 0, evictions: 0 },
      system: { memoryUsage: 0, cpuUsage: 0, uptime: 0 }
    };

    this.metricsInterval = setInterval(() => {
      this.calculateMetrics();
      this.emit('metrics_updated', this.metrics);
    }, 30000); // Update every 30 seconds
  }

  // Task 8: Implement load balancing
  private initializeLoadBalancer(): void {
    this.loadBalancer = new LoadBalancer(this.models);
    
    this.loadBalancer.on('model_overloaded', (modelId) => {
      console.warn(`Model ${modelId} is overloaded, routing to alternatives`);
      this.updateModelStatus(modelId, 'busy');
    });

    this.loadBalancer.on('model_recovered', (modelId) => {
      console.info(`Model ${modelId} has recovered, resuming normal routing`);
      this.updateModelStatus(modelId, 'ready');
    });
  }

  // Task 7: Create health check endpoints
  private setupHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, 60000); // Check every minute

    // Immediate health check
    setTimeout(() => this.performHealthChecks(), 1000);
  }

  // Task 2: Implement model serving endpoints
  private setupModels(modelConfigs: ModelConfig[]): void {
    for (const config of modelConfigs) {
      const model: ModelInstance = {
        id: config.id,
        name: config.name,
        type: config.type,
        provider: config.provider,
        status: 'loading',
        capabilities: config.capabilities,
        performance: {
          latency: 0,
          throughput: 0,
          memoryUsage: 0,
          gpuUsage: config.type === 'local' ? 0 : undefined,
          errorRate: 0
        },
        config: {
          endpoint: config.endpoint,
          apiKey: config.apiKey,
          maxConcurrent: config.maxConcurrent || 10,
          timeout: config.timeout || 30000,
          retryPolicy: {
            maxRetries: config.maxRetries || 3,
            backoffMs: config.backoffMs || 1000
          }
        },
        health: {
          lastCheck: 0,
          isHealthy: false,
          consecutiveFailures: 0
        }
      };

      this.models.set(config.id, model);
      this.initializeModel(model);
    }
  }

  // Initialize individual model
  private async initializeModel(model: ModelInstance): Promise<void> {
    try {
      console.log(`Initializing model: ${model.name}`);
      
      if (model.type === 'local') {
        await this.loadLocalModel(model);
      } else {
        await this.testCloudModel(model);
      }

      model.status = 'ready';
      model.health.isHealthy = true;
      model.health.consecutiveFailures = 0;
      
      console.log(`Model ${model.name} initialized successfully`);
      this.emit('model_ready', model.id);
      
    } catch (error) {
      console.error(`Failed to initialize model ${model.name}:`, error);
      model.status = 'error';
      model.health.isHealthy = false;
      model.health.consecutiveFailures++;
      this.emit('model_error', { modelId: model.id, error });
    }
  }

  // Load local model (mock implementation)
  private async loadLocalModel(model: ModelInstance): Promise<void> {
    // Simulate model loading time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock loading process
    console.log(`Loading local model: ${model.name}`);
    console.log(`Model size: ${model.config.endpoint || 'unknown'}`);
    
    // Update performance metrics
    model.performance.memoryUsage = Math.random() * 2000 + 1000; // MB
    model.performance.gpuUsage = Math.random() * 80 + 10; // %
  }

  // Test cloud model connection
  private async testCloudModel(model: ModelInstance): Promise<void> {
    const testPrompt = "Hello, this is a test prompt.";
    
    try {
      const startTime = performance.now();
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = { text: "Test response", tokens: 10 };
      
      const latency = performance.now() - startTime;
      model.performance.latency = latency;
      
      console.log(`Cloud model ${model.name} test successful. Latency: ${latency.toFixed(2)}ms`);
      
    } catch (error) {
      throw new Error(`Cloud model test failed: ${error}`);
    }
  }

  // Main request processing method
  public async processRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = performance.now();
    
    try {
      // Check cache first
      const cachedResult = await this.checkCache(request);
      if (cachedResult) {
        this.updateMetrics('cache_hit', { request });
        return cachedResult;
      }

      // Select best model for request
      const modelId = await this.loadBalancer.selectModel(request);
      const model = this.models.get(modelId);
      
      if (!model || model.status !== 'ready') {
        throw new Error(`Model ${modelId} not available`);
      }

      // Process with selected model
      const result = await this.executeModelRequest(model, request);
      
      // Cache the result
      await this.cacheResult(request, result);
      
      // Update metrics
      const processingTime = performance.now() - startTime;
      this.updateModelMetrics(modelId, processingTime, true);
      
      return {
        id: request.id,
        success: true,
        result: {
          text: result.text,
          confidence: result.confidence,
          reasoning: result.reasoning,
          suggestions: result.suggestions,
          metadata: {
            model: modelId,
            tokensUsed: result.tokensUsed,
            latency: processingTime,
            cost: result.cost
          }
        },
        cached: false,
        processingTime
      };

    } catch (error) {
      const processingTime = performance.now() - startTime;
      const err = error as Error;
      this.updateMetrics('request_error', { error: err.message, processingTime });
      
      return {
        id: request.id,
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message: err.message,
          details: err.stack
        },
        cached: false,
        processingTime
      };
    }
  }

  // Execute request on specific model
  private async executeModelRequest(model: ModelInstance, request: AIRequest): Promise<any> {
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), model.config.timeout);
    });

    const execution = new Promise(async (resolve, reject) => {
      try {
        let result;
        
        if (model.type === 'local') {
          result = await this.executeLocalModel(model, request);
        } else {
          result = await this.executeCloudModel(model, request);
        }
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    return Promise.race([execution, timeout]);
  }

  // Execute local model (mock implementation)
  private async executeLocalModel(model: ModelInstance, request: AIRequest): Promise<any> {
    // Simulate processing time based on prompt length
    const processingTime = Math.max(100, request.prompt.length * 2);
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Mock response generation
    const tokens = Math.floor(request.prompt.length / 4);
    return {
      text: `Generated response for: ${request.prompt.substring(0, 50)}...`,
      confidence: 0.85 + Math.random() * 0.1,
      reasoning: `Processed using ${model.name} with ${request.parameters.temperature} temperature`,
      suggestions: [`Suggestion 1`, `Suggestion 2`],
      tokensUsed: {
        prompt: tokens,
        completion: Math.floor(tokens * 1.5),
        total: Math.floor(tokens * 2.5)
      },
      cost: 0 // Local models have no cost
    };
  }

  // Execute cloud model (mock implementation)
  private async executeCloudModel(model: ModelInstance, request: AIRequest): Promise<any> {
    // Simulate API call
    const apiLatency = 200 + Math.random() * 300;
    await new Promise(resolve => setTimeout(resolve, apiLatency));

    // Mock cloud response
    const tokens = Math.floor(request.prompt.length / 4);
    const costPerToken = 0.00002; // Mock cost
    
    return {
      text: `Cloud-generated response for: ${request.prompt.substring(0, 50)}...`,
      confidence: 0.90 + Math.random() * 0.05,
      reasoning: `Generated by ${model.provider} ${model.name}`,
      suggestions: [`Cloud suggestion 1`, `Cloud suggestion 2`],
      tokensUsed: {
        prompt: tokens,
        completion: Math.floor(tokens * 1.5),
        total: Math.floor(tokens * 2.5)
      },
      cost: Math.floor(tokens * 2.5) * costPerToken
    };
  }

  // Task 3: Process batch requests
  public async processBatch(batch: BatchRequest): Promise<AIResponse[]> {
    console.log(`Processing batch ${batch.id} with ${batch.requests.length} requests`);
    
    const results: AIResponse[] = [];
    const startTime = performance.now();

    try {
      // Group requests by model for optimal batching
      const requestsByModel = this.groupRequestsByModel(batch.requests);
      
      // Process each model group concurrently
      const batchPromises = Array.from(requestsByModel.entries()).map(
        async ([modelId, requests]) => {
          const model = this.models.get(modelId);
          if (!model || model.status !== 'ready') {
            throw new Error(`Model ${modelId} not available for batch processing`);
          }
          
          return this.executeBatchForModel(model, requests);
        }
      );

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(modelResults => results.push(...modelResults));

      const processingTime = performance.now() - startTime;
      this.updateMetrics('batch_completed', { 
        batchSize: batch.requests.length, 
        processingTime 
      });

      return results;
      
    } catch (error) {
      console.error(`Batch processing failed:`, error);
      const err = error as Error;
      
      // Return error responses for all requests in batch
      return batch.requests.map(request => ({
        id: request.id,
        success: false,
        error: {
          code: 'BATCH_ERROR',
          message: err.message
        },
        cached: false,
        processingTime: performance.now() - startTime
      }));
    }
  }

  // Group requests by optimal model
  private groupRequestsByModel(requests: AIRequest[]): Map<string, AIRequest[]> {
    const groups = new Map<string, AIRequest[]>();
    
    for (const request of requests) {
      const modelId = this.loadBalancer.selectModelSync(request);
      
      if (!groups.has(modelId)) {
        groups.set(modelId, []);
      }
      groups.get(modelId)!.push(request);
    }
    
    return groups;
  }

  // Execute batch for specific model
  private async executeBatchForModel(model: ModelInstance, requests: AIRequest[]): Promise<AIResponse[]> {
    // For local models, we can potentially optimize batch processing
    if (model.type === 'local' && requests.length > 1) {
      return this.executeLocalBatch(model, requests);
    }
    
    // For cloud models or small batches, process individually
    const results = await Promise.all(
      requests.map(request => this.processRequest(request))
    );
    
    return results;
  }

  // Execute batch on local model (optimized)
  private async executeLocalBatch(model: ModelInstance, requests: AIRequest[]): Promise<AIResponse[]> {
    // Mock batch processing optimization
    const batchProcessingTime = Math.max(200, requests.length * 50);
    await new Promise(resolve => setTimeout(resolve, batchProcessingTime));
    
    return requests.map((request, index) => {
      const tokens = Math.floor(request.prompt.length / 4);
      const processingTime = batchProcessingTime / requests.length;
      
      return {
        id: request.id,
        success: true,
        result: {
          text: `Batch response ${index + 1} for: ${request.prompt.substring(0, 30)}...`,
          confidence: 0.85 + Math.random() * 0.1,
          metadata: {
            model: model.id,
            tokensUsed: {
              prompt: tokens,
              completion: Math.floor(tokens * 1.5),
              total: Math.floor(tokens * 2.5)
            },
            latency: processingTime,
            cost: 0
          }
        },
        cached: false,
        processingTime
      };
    });
  }

  // Cache management
  private async checkCache(request: AIRequest): Promise<AIResponse | null> {
    const cacheKey = this.generateCacheKey(request);
    
    try {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        const result = JSON.parse(cached) as AIResponse;
        await this.cache.hincrby('cache:stats', 'hits', 1);
        return result;
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    
    await this.cache.hincrby('cache:stats', 'misses', 1);
    return null;
  }

  private async cacheResult(request: AIRequest, result: AIResponse): Promise<void> {
    const cacheKey = this.generateCacheKey(request);
    const ttl = this.calculateCacheTTL(request);
    
    try {
      await this.cache.setex(cacheKey, ttl, JSON.stringify(result));
      await this.cache.hincrby('cache:stats', 'writes', 1);
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  private generateCacheKey(request: AIRequest): string {
    const key = {
      type: request.type,
      prompt: request.prompt,
      model: request.model,
      parameters: request.parameters
    };
    
    return createHash('md5').update(JSON.stringify(key)).digest('hex');
  }

  private calculateCacheTTL(request: AIRequest): number {
    // Cache TTL based on request type and parameters
    const baseTTL = 3600; // 1 hour
    
    // Longer cache for stable requests (low temperature)
    const tempMultiplier = 1 + (0.5 - request.parameters.temperature);
    
    // Shorter cache for user-specific requests
    const typeMultiplier = request.type === 'completion' ? 0.5 : 1.0;
    
    return Math.floor(baseTTL * tempMultiplier * typeMultiplier);
  }

  // Health check implementation
  private async performHealthChecks(): Promise<void> {
    const checkPromises = Array.from(this.models.values()).map(async (model) => {
      try {
        const startTime = performance.now();
        
        if (model.type === 'local') {
          await this.checkLocalModelHealth(model);
        } else {
          await this.checkCloudModelHealth(model);
        }
        
        const latency = performance.now() - startTime;
        model.performance.latency = latency;
        model.health.lastCheck = Date.now();
        model.health.isHealthy = true;
        model.health.consecutiveFailures = 0;
        
        if (model.status === 'error') {
          model.status = 'ready';
          this.emit('model_recovered', model.id);
        }
        
      } catch (error) {
        const err = error as Error;
        model.health.lastCheck = Date.now();
        model.health.isHealthy = false;
        model.health.consecutiveFailures++;
        
        if (model.health.consecutiveFailures >= 3) {
          model.status = 'error';
          this.emit('model_unhealthy', { modelId: model.id, error: err });
        }
        
        console.error(`Health check failed for ${model.name}:`, err.message);
      }
    });

    await Promise.allSettled(checkPromises);
    this.emit('health_check_completed', this.getHealthSummary());
  }

  private async checkLocalModelHealth(model: ModelInstance): Promise<void> {
    // Mock local model health check
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Simulate occasional failures
    if (Math.random() < 0.05) {
      throw new Error('Local model health check failed');
    }
  }

  private async checkCloudModelHealth(model: ModelInstance): Promise<void> {
    // Mock cloud model health check
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate network issues
    if (Math.random() < 0.02) {
      throw new Error('Cloud model health check timeout');
    }
  }

  // Metrics and monitoring
  private updateMetrics(event: string, data: any): void {
    switch (event) {
      case 'request_completed':
        this.metrics.requests.total++;
        this.metrics.requests.successful++;
        break;
      case 'request_failed':
        this.metrics.requests.total++;
        this.metrics.requests.failed++;
        break;
      case 'cache_hit':
        this.metrics.requests.cached++;
        break;
      case 'batch_completed':
        this.metrics.requests.total += data.batchSize;
        this.metrics.requests.successful += data.batchSize;
        break;
    }
  }

  private updateModelMetrics(modelId: string, latency: number, success: boolean): void {
    if (!this.metrics.models[modelId]) {
      this.metrics.models[modelId] = {
        requests: 0,
        latency: 0,
        errorRate: 0,
        utilization: 0
      };
    }

    const modelMetrics = this.metrics.models[modelId];
    modelMetrics.requests++;
    modelMetrics.latency = (modelMetrics.latency + latency) / 2; // Simple average
    
    if (!success) {
      modelMetrics.errorRate = (modelMetrics.errorRate * 0.9) + 0.1; // Exponential moving average
    } else {
      modelMetrics.errorRate *= 0.95;
    }
  }

  private calculateMetrics(): void {
    // Update system metrics
    const memUsage = process.memoryUsage();
    this.metrics.system.memoryUsage = memUsage.heapUsed / 1024 / 1024; // MB
    this.metrics.system.uptime = process.uptime();
    
    // Calculate cache hit rate
    this.cache.hmget('cache:stats', 'hits', 'misses').then(([hits, misses]) => {
      const totalRequests = parseInt(hits || '0') + parseInt(misses || '0');
      this.metrics.cache.hitRate = totalRequests > 0 ? parseInt(hits || '0') / totalRequests : 0;
    });
  }

  // Public API methods
  public async queueRequest(request: AIRequest): Promise<string> {
    if (this.isShuttingDown) {
      throw new Error('Service is shutting down');
    }

    const job = await this.requestQueue.add('single-request', request, {
      priority: this.getPriority(request.metadata.priority),
      delay: 0,
      attempts: 3
    });

    return job.id as string;
  }

  public async queueBatch(requests: AIRequest[], options: { maxWaitMs?: number } = {}): Promise<string> {
    const batch: BatchRequest = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      requests,
      maxBatchSize: 20,
      maxWaitMs: options.maxWaitMs || 5000,
      createdAt: Date.now()
    };

    const job = await this.batchQueue.add('batch-request', batch);
    return job.id as string;
  }

  public getHealth(): object {
    return this.getHealthSummary();
  }

  public getMetrics(): ServiceMetrics {
    return { ...this.metrics };
  }

  public getModelStatus(): ModelInstance[] {
    return Array.from(this.models.values());
  }

  // Utility methods
  private getPriority(priority: AIRequest['metadata']['priority']): number {
    const priorities = { urgent: 1, high: 5, medium: 10, low: 15 };
    return priorities[priority] || 10;
  }

  private updateModelStatus(modelId: string, status: ModelInstance['status']): void {
    const model = this.models.get(modelId);
    if (model) {
      model.status = status;
      this.emit('model_status_changed', { modelId, status });
    }
  }

  private getHealthSummary(): object {
    const models = Array.from(this.models.values());
    const healthyModels = models.filter(m => m.health.isHealthy).length;
    
    return {
      status: healthyModels === models.length ? 'healthy' : 'degraded',
      models: {
        total: models.length,
        healthy: healthyModels,
        unhealthy: models.length - healthyModels
      },
      queues: {
        requests: {
          waiting: (this.requestQueue as any).waiting || 0,
          active: (this.requestQueue as any).active || 0,
          completed: (this.requestQueue as any).completed || 0,
          failed: (this.requestQueue as any).failed || 0
        },
        batches: {
          waiting: (this.batchQueue as any).waiting || 0,
          active: (this.batchQueue as any).active || 0
        }
      },
      uptime: process.uptime(),
      timestamp: Date.now()
    };
  }

  // Graceful shutdown
  public async shutdown(): Promise<void> {
    console.log('AI Service shutting down...');
    this.isShuttingDown = true;

    // Clear intervals
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    if (this.metricsInterval) clearInterval(this.metricsInterval);

    // Close queues
    await this.requestQueue.close();
    await this.batchQueue.close();

    // Close cache connection
    await this.cache.quit();

    console.log('AI Service shutdown complete');
  }
}

// Load balancer implementation
class LoadBalancer extends EventEmitter {
  private models: Map<string, ModelInstance>;
  private requestCounts: Map<string, number>;
  private lastRequestTime: Map<string, number>;

  constructor(models: Map<string, ModelInstance>) {
    super();
    this.models = models;
    this.requestCounts = new Map();
    this.lastRequestTime = new Map();
  }

  public async selectModel(request: AIRequest): Promise<string> {
    const availableModels = Array.from(this.models.values())
      .filter(model => 
        model.status === 'ready' && 
        model.health.isHealthy &&
        model.capabilities.includes(request.type)
      );

    if (availableModels.length === 0) {
      throw new Error('No available models for request type: ' + request.type);
    }

    if (availableModels.length === 1) {
      return availableModels[0].id;
    }

    // Select based on weighted round-robin with performance factors
    return this.selectOptimalModel(availableModels, request);
  }

  public selectModelSync(request: AIRequest): string {
    const availableModels = Array.from(this.models.values())
      .filter(model => 
        model.status === 'ready' && 
        model.capabilities.includes(request.type)
      );

    if (availableModels.length === 0) {
      throw new Error('No available models');
    }

    return availableModels[0].id; // Simple fallback for sync operation
  }

  private selectOptimalModel(models: ModelInstance[], request: AIRequest): string {
    // Score each model based on multiple factors
    const scores = models.map(model => {
      let score = 100; // Base score

      // Latency factor (lower is better)
      score -= model.performance.latency / 10;

      // Error rate factor
      score -= model.performance.errorRate * 50;

      // Load balancing factor
      const requestCount = this.requestCounts.get(model.id) || 0;
      score -= requestCount * 2;

      // Model type preference (local models preferred for small requests)
      if (model.type === 'local' && request.prompt.length < 1000) {
        score += 20;
      }

      // Temperature matching
      if (request.parameters.temperature < 0.3 && model.type === 'local') {
        score += 10; // Local models better for deterministic requests
      }

      return { model, score };
    });

    // Select model with highest score
    scores.sort((a, b) => b.score - a.score);
    const selectedModel = scores[0].model;

    // Update request count
    this.requestCounts.set(selectedModel.id, (this.requestCounts.get(selectedModel.id) || 0) + 1);
    this.lastRequestTime.set(selectedModel.id, Date.now());

    // Check for overload
    const currentLoad = this.requestCounts.get(selectedModel.id) || 0;
    if (currentLoad > selectedModel.config.maxConcurrent * 0.8) {
      this.emit('model_overloaded', selectedModel.id);
    }

    return selectedModel.id;
  }
}

// Configuration interfaces
interface AIServiceConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  cache?: {
    db?: number;
    ttl?: number;
  };
  concurrency?: number;
  models: ModelConfig[];
}

interface ModelConfig {
  id: string;
  name: string;
  type: 'local' | 'cloud';
  provider: string;
  capabilities: string[];
  endpoint?: string;
  apiKey?: string;
  maxConcurrent?: number;
  timeout?: number;
  maxRetries?: number;
  backoffMs?: number;
}

export type { AIServiceConfig, ModelConfig, AIRequest, AIResponse };
export default AIService; 