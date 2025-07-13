import { ApiClient } from '../core/ApiClient';
import { Logger } from '../core/Logger';
import { AnalyticsService } from '../core/AnalyticsService';
import { CacheService } from '../performance/CacheService';

// Types for AI backend integration
export interface AIInferenceRequest {
  modelId: string;
  inputData: {
    imageData?: string | File;
    textData?: string;
    metadata?: Record<string, any>;
  };
  parameters?: {
    confidenceThreshold?: number;
    maxResults?: number;
    includeExplanations?: boolean;
    outputFormat?: 'json' | 'dicom' | 'image';
  };
  context?: {
    patientId?: string;
    studyId?: string;
    modalityType?: string;
    clinicalContext?: string;
  };
}

export interface AIInferenceResponse {
  inferenceId: string;
  modelId: string;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  results?: {
    predictions: Array<{
      class: string;
      confidence: number;
      boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      metadata?: Record<string, any>;
    }>;
    segmentations?: Array<{
      class: string;
      mask: string;
      confidence: number;
      area: number;
    }>;
    features?: Record<string, any>;
    explanations?: Array<{
      type: 'gradient' | 'attention' | 'saliency';
      data: string;
      importance: number;
    }>;
  };
  confidence: number;
  processingTime: number;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  type: 'classification' | 'detection' | 'segmentation' | 'nlp' | 'multimodal';
  version: string;
  status: 'available' | 'loading' | 'maintenance' | 'offline';
  capabilities: string[];
  inputTypes: string[];
  outputTypes: string[];
  performance: {
    accuracy: number;
    sensitivity: number;
    specificity: number;
    auc: number;
    latency: number;
  };
  resources: {
    gpuMemory: number;
    cpuCores: number;
    estimatedLatency: number;
  };
  lastUpdated: string;
}

export interface PredictiveAnalyticsRequest {
  patientData: {
    demographics: Record<string, any>;
    vitals: Record<string, any>;
    labResults: Record<string, any>;
    medicalHistory: string[];
    medications: string[];
    imaging?: string[];
  };
  predictionType: 'outcome' | 'risk' | 'treatment_response' | 'progression' | 'survival';
  timeHorizon: string;
  includedFactors?: string[];
  confidenceLevel?: number;
}

export interface PredictiveAnalyticsResponse {
  predictionId: string;
  predictions: Array<{
    type: string;
    value: number;
    confidence: number;
    timeframe: string;
    factors: {
      positive: string[];
      negative: string[];
      neutral: string[];
    };
    recommendations: string[];
  }>;
  riskFactors: Array<{
    factor: string;
    impact: number;
    modifiable: boolean;
    evidence: string;
  }>;
  modelExplanation: {
    primaryFactors: string[];
    methodology: string;
    limitations: string[];
  };
  timestamp: string;
}

export interface KnowledgeGraphQuery {
  query: string;
  queryType: 'search' | 'path' | 'similarity' | 'recommendations';
  nodeTypes?: string[];
  edgeTypes?: string[];
  maxResults?: number;
  confidenceThreshold?: number;
  includeEvidence?: boolean;
}

export interface KnowledgeGraphResponse {
  queryId: string;
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    properties: Record<string, any>;
    confidence: number;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type: string;
    properties: Record<string, any>;
    confidence: number;
  }>;
  metadata: {
    totalResults: number;
    executionTime: number;
    relevanceScore: number;
  };
}

/**
 * AI Backend Integration Service
 * Provides unified interface for all AI operations in MedSight Pro
 */
export class AIBackendIntegration {
  private apiClient: ApiClient;
  private logger: Logger;
  private analytics: AnalyticsService;
  private cache: CacheService;
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.apiClient = new ApiClient();
    this.logger = new Logger('AIBackendIntegration');
    this.analytics = new AnalyticsService();
    this.cache = new CacheService();
    this.baseUrl = process.env.NEXT_PUBLIC_AI_API_URL || '/api/ai';
    this.timeout = 300000; // 5 minutes for AI operations
    this.retryAttempts = 3;
  }

  /**
   * Initialize AI backend connection and verify service health
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing AI backend integration');
      
      const healthCheck = await this.apiClient.get(`${this.baseUrl}/health`, {
        timeout: 10000
      });
      
      if (healthCheck.status !== 'healthy') {
        throw new Error(`AI backend unhealthy: ${healthCheck.message}`);
      }
      
      this.logger.info('AI backend integration initialized successfully');
      this.analytics.track('ai_backend_initialized');
    } catch (error) {
      this.logger.error('Failed to initialize AI backend integration', error);
      throw error;
    }
  }

  /**
   * Get available AI models and their current status
   */
  async getAvailableModels(): Promise<ModelInfo[]> {
    try {
      const cacheKey = 'ai_models_list';
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      const response = await this.apiClient.get(`${this.baseUrl}/models`, {
        timeout: this.timeout
      });
      
      const models: ModelInfo[] = response.models;
      
      // Cache for 5 minutes
      await this.cache.set(cacheKey, models, 300);
      
      this.analytics.track('ai_models_fetched', { count: models.length });
      return models;
    } catch (error) {
      this.logger.error('Failed to fetch AI models', error);
      throw new Error('Unable to fetch available AI models');
    }
  }

  /**
   * Submit inference request to AI backend
   */
  async submitInference(request: AIInferenceRequest): Promise<AIInferenceResponse> {
    try {
      this.logger.info('Submitting AI inference request', { 
        modelId: request.modelId,
        hasImageData: !!request.inputData.imageData,
        hasTextData: !!request.inputData.textData
      });

      // Validate request
      await this.validateInferenceRequest(request);

      // Prepare request data
      const formData = new FormData();
      formData.append('modelId', request.modelId);
      formData.append('parameters', JSON.stringify(request.parameters || {}));
      formData.append('context', JSON.stringify(request.context || {}));

      if (request.inputData.imageData) {
        if (request.inputData.imageData instanceof File) {
          formData.append('image', request.inputData.imageData);
        } else {
          formData.append('imageData', request.inputData.imageData);
        }
      }

      if (request.inputData.textData) {
        formData.append('textData', request.inputData.textData);
      }

      if (request.inputData.metadata) {
        formData.append('metadata', JSON.stringify(request.inputData.metadata));
      }

      const response = await this.apiClient.post(`${this.baseUrl}/inference`, formData, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      this.analytics.track('ai_inference_submitted', {
        modelId: request.modelId,
        success: response.status === 'completed',
        processingTime: response.processingTime
      });

      return response;
    } catch (error) {
      this.logger.error('AI inference request failed', error);
      this.analytics.track('ai_inference_failed', {
        modelId: request.modelId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get inference status and results
   */
  async getInferenceStatus(inferenceId: string): Promise<AIInferenceResponse> {
    try {
      const response = await this.apiClient.get(`${this.baseUrl}/inference/${inferenceId}`, {
        timeout: 30000
      });
      
      return response;
    } catch (error) {
      this.logger.error('Failed to get inference status', error);
      throw error;
    }
  }

  /**
   * Submit predictive analytics request
   */
  async submitPredictiveAnalytics(request: PredictiveAnalyticsRequest): Promise<PredictiveAnalyticsResponse> {
    try {
      this.logger.info('Submitting predictive analytics request', {
        predictionType: request.predictionType,
        timeHorizon: request.timeHorizon
      });

      const response = await this.apiClient.post(`${this.baseUrl}/predictive-analytics`, request, {
        timeout: this.timeout
      });

      this.analytics.track('predictive_analytics_submitted', {
        predictionType: request.predictionType,
        success: true
      });

      return response;
    } catch (error) {
      this.logger.error('Predictive analytics request failed', error);
      this.analytics.track('predictive_analytics_failed', {
        predictionType: request.predictionType,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Query medical knowledge graph
   */
  async queryKnowledgeGraph(query: KnowledgeGraphQuery): Promise<KnowledgeGraphResponse> {
    try {
      this.logger.info('Querying knowledge graph', {
        queryType: query.queryType,
        queryLength: query.query.length
      });

      const cacheKey = `knowledge_graph_${JSON.stringify(query)}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      const response = await this.apiClient.post(`${this.baseUrl}/knowledge-graph/query`, query, {
        timeout: 60000
      });

      // Cache for 1 hour
      await this.cache.set(cacheKey, response, 3600);

      this.analytics.track('knowledge_graph_queried', {
        queryType: query.queryType,
        resultsCount: response.nodes.length + response.edges.length
      });

      return response;
    } catch (error) {
      this.logger.error('Knowledge graph query failed', error);
      this.analytics.track('knowledge_graph_query_failed', {
        queryType: query.queryType,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get AI confidence metrics for models
   */
  async getConfidenceMetrics(modelIds?: string[]): Promise<any> {
    try {
      const params = modelIds ? { models: modelIds.join(',') } : {};
      
      const response = await this.apiClient.get(`${this.baseUrl}/metrics/confidence`, {
        params,
        timeout: 30000
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to get confidence metrics', error);
      throw error;
    }
  }

  /**
   * Submit feedback for AI predictions
   */
  async submitFeedback(data: {
    inferenceId: string;
    feedback: 'correct' | 'incorrect' | 'partially_correct';
    corrections?: any;
    comments?: string;
    expertId?: string;
  }): Promise<void> {
    try {
      await this.apiClient.post(`${this.baseUrl}/feedback`, data, {
        timeout: 30000
      });

      this.analytics.track('ai_feedback_submitted', {
        inferenceId: data.inferenceId,
        feedback: data.feedback
      });
    } catch (error) {
      this.logger.error('Failed to submit AI feedback', error);
      throw error;
    }
  }

  /**
   * Cancel ongoing inference request
   */
  async cancelInference(inferenceId: string): Promise<void> {
    try {
      await this.apiClient.delete(`${this.baseUrl}/inference/${inferenceId}`, {
        timeout: 30000
      });

      this.analytics.track('ai_inference_cancelled', { inferenceId });
    } catch (error) {
      this.logger.error('Failed to cancel inference', error);
      throw error;
    }
  }

  /**
   * Get AI system metrics and performance
   */
  async getSystemMetrics(): Promise<any> {
    try {
      const response = await this.apiClient.get(`${this.baseUrl}/metrics/system`, {
        timeout: 30000
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to get system metrics', error);
      throw error;
    }
  }

  /**
   * Validate inference request before submission
   */
  private async validateInferenceRequest(request: AIInferenceRequest): Promise<void> {
    if (!request.modelId) {
      throw new Error('Model ID is required');
    }

    if (!request.inputData.imageData && !request.inputData.textData) {
      throw new Error('Either image data or text data must be provided');
    }

    // Check model availability
    const models = await this.getAvailableModels();
    const model = models.find(m => m.id === request.modelId);
    
    if (!model) {
      throw new Error(`Model ${request.modelId} not found`);
    }

    if (model.status !== 'available') {
      throw new Error(`Model ${request.modelId} is not available (status: ${model.status})`);
    }

    // Validate input types
    if (request.inputData.imageData && !model.inputTypes.includes('image')) {
      throw new Error(`Model ${request.modelId} does not support image input`);
    }

    if (request.inputData.textData && !model.inputTypes.includes('text')) {
      throw new Error(`Model ${request.modelId} does not support text input`);
    }
  }

  /**
   * Handle API errors and provide user-friendly messages
   */
  private handleError(error: any): never {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      switch (status) {
        case 400:
          throw new Error(`Invalid request: ${message}`);
        case 401:
          throw new Error('Authentication required');
        case 403:
          throw new Error('Access denied');
        case 404:
          throw new Error('AI service not found');
        case 429:
          throw new Error('Too many requests. Please try again later.');
        case 500:
          throw new Error('AI service error. Please try again.');
        case 503:
          throw new Error('AI service temporarily unavailable');
        default:
          throw new Error(`AI service error (${status}): ${message}`);
      }
    } else if (error.request) {
      throw new Error('Unable to connect to AI service');
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }

  /**
   * Retry mechanism for failed requests
   */
  private async withRetry<T>(operation: () => Promise<T>, attempts: number = this.retryAttempts): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === attempts - 1) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        this.logger.warn(`Retrying operation (attempt ${i + 2}/${attempts})`, error);
      }
    }
    
    throw new Error('Max retry attempts exceeded');
  }

  /**
   * Cleanup resources and close connections
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up AI backend integration');
      await this.cache.clear();
      this.analytics.track('ai_backend_cleanup');
    } catch (error) {
      this.logger.error('Error during AI backend cleanup', error);
    }
  }
}

// Singleton instance
export const aiBackendIntegration = new AIBackendIntegration(); 