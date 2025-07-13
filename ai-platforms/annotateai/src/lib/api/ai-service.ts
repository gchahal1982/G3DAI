/**
 * AnnotateAI Frontend AI Service Client
 * Phase 3.2 Production AI Deployment - Real AI Integration
 * 
 * This client connects the frontend to the real Python FastAPI AI service,
 * replacing all mock AI calls in annotation workbench and other components.
 * 
 * Features:
 * - Real YOLO object detection integration
 * - Real SAM image segmentation integration
 * - Batch inference for multiple images
 * - Real-time inference with WebSocket streaming
 * - Error handling and retry logic
 * - Performance monitoring and caching
 * - Progress tracking for long operations
 * 
 * Replaces: All mock AI calls in frontend components
 */

import { apiClient } from '../auth/api';

// ============================================================================
// Type Definitions
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
  class_id: number;
  class_name: string;
}

export interface Detection {
  bbox: BoundingBox;
  confidence: number;
  class_id: number;
  class_name: string;
  mask?: number[][];
}

export interface SegmentationResult {
  masks: number[][][];
  scores: number[];
  confidence: number;
  processing_time: number;
}

export interface InferenceResponse {
  success: boolean;
  model_type: string;
  processing_time: number;
  detections?: Detection[];
  segmentation?: SegmentationResult;
  error?: string;
  metadata: Record<string, any>;
}

export interface BatchInferenceResult {
  success: boolean;
  results: Array<{
    filename: string;
    detections?: Detection[];
    segmentation?: SegmentationResult;
    success: boolean;
    error?: string;
  }>;
  total_processed: number;
}

export interface ModelStatus {
  model_name: string;
  status: string;
  version: string;
  loaded_at: string;
  inference_count: number;
  average_inference_time: number;
  gpu_memory_used: number;
}

export interface AIServiceConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableCaching: boolean;
  enableBatching: boolean;
  maxBatchSize: number;
}

export interface PreAnnotationConfig {
  yolo_model: string;
  sam_model: string;
  confidence_threshold: number;
  annotation_strategy: 'detect_only' | 'segment_only' | 'detect_and_segment';
  max_annotations_per_image: number;
  batch_size: number;
}

export interface PreAnnotationResult {
  dataset_id: string;
  project_id: string;
  total_images: number;
  processed_images: number;
  total_annotations: number;
  average_confidence: number;
  processing_time: number;
  quality_metrics: Record<string, number>;
  images: Array<{
    image_id: string;
    image_path: string;
    annotations: Detection[];
    confidence_score: number;
    processing_time: number;
  }>;
}

// ============================================================================
// AI Service Client Class
// ============================================================================

export class AIServiceClient {
  private config: AIServiceConfig;
  private cache: Map<string, any> = new Map();
  private batchQueue: Array<{
    file: File;
    resolve: (result: any) => void;
    reject: (error: any) => void;
  }> = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  constructor(config?: Partial<AIServiceConfig>) {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000',
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000, // 1 second
      enableCaching: true,
      enableBatching: false,
      maxBatchSize: 8,
      ...config
    };
    
    console.log('AI Service Client initialized:', {
      baseUrl: this.config.baseUrl,
      caching: this.config.enableCaching,
      batching: this.config.enableBatching
    });
  }

  // ============================================================================
  // Object Detection Methods
  // ============================================================================

  /**
   * Detect objects in image using YOLO
   * Replaces: Mock detection calls in annotation workbench
   */
  async detectObjects(
    imageFile: File,
    options: {
      model_name?: string;
      confidence_threshold?: number;
      max_detections?: number;
    } = {}
  ): Promise<Detection[]> {
    try {
      // Check cache first
      if (this.config.enableCaching) {
        const cacheKey = this._getCacheKey('detection', imageFile.name, options);
        const cachedResult = this.cache.get(cacheKey);
        if (cachedResult) {
          console.log('Returning cached detection result');
          return cachedResult;
        }
      }

      // Check if batching is enabled
      if (this.config.enableBatching) {
        return new Promise((resolve, reject) => {
          this.batchQueue.push({ file: imageFile, resolve, reject });
          this._processBatchQueue();
        });
      }

      // Single inference
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('model_name', options.model_name || 'yolov8n');
      formData.append('confidence_threshold', (options.confidence_threshold || 0.5).toString());
      formData.append('max_detections', (options.max_detections || 100).toString());

      const response = await this._makeRequest('/api/v1/inference/detect', {
        method: 'POST',
        body: formData
      });

      if (!response.success) {
        throw new Error(response.error || 'Detection failed');
      }

      const detections = response.detections || [];

      // Cache result
      if (this.config.enableCaching) {
        const cacheKey = this._getCacheKey('detection', imageFile.name, options);
        this.cache.set(cacheKey, detections);
      }

      console.log(`Detected ${detections.length} objects in ${response.processing_time}ms`);
      return detections;

    } catch (error) {
      console.error('Object detection failed:', error);
      throw new Error(`Detection service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect objects in multiple images (batch processing)
   */
  async detectObjectsBatch(
    imageFiles: File[],
    options: {
      model_name?: string;
      confidence_threshold?: number;
    } = {}
  ): Promise<BatchInferenceResult> {
    try {
      const formData = new FormData();
      
      // Add files
      imageFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // Add options
      formData.append('model_type', 'detection');
      formData.append('model_name', options.model_name || 'yolov8n');
      formData.append('confidence_threshold', (options.confidence_threshold || 0.5).toString());

      const response = await this._makeRequest('/api/v1/inference/batch', {
        method: 'POST',
        body: formData
      });

      if (!response.success) {
        throw new Error(response.error || 'Batch detection failed');
      }

      console.log(`Batch detection completed: ${response.total_processed} images processed`);
      return response;

    } catch (error) {
      console.error('Batch detection failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // Image Segmentation Methods
  // ============================================================================

  /**
   * Segment image using SAM
   * Replaces: Mock segmentation calls in src/ai/SegmentationModel.ts
   */
  async segmentImage(
    imageFile: File,
    points: Point[],
    options: {
      model_name?: string;
    } = {}
  ): Promise<SegmentationResult> {
    try {
      // Check cache
      if (this.config.enableCaching) {
        const cacheKey = this._getCacheKey('segmentation', imageFile.name, { points, ...options });
        const cachedResult = this.cache.get(cacheKey);
        if (cachedResult) {
          console.log('Returning cached segmentation result');
          return cachedResult;
        }
      }

      const requestBody = {
        points: points,
        model_name: options.model_name || 'sam_vit_h'
      };

      // Convert image to base64
      const imageBase64 = await this._fileToBase64(imageFile);
      
      const response = await this._makeRequest('/api/v1/inference/segment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...requestBody,
          image: imageBase64
        })
      });

      if (!response.success) {
        throw new Error(response.error || 'Segmentation failed');
      }

      const segmentationResult = response.segmentation;

      // Cache result
      if (this.config.enableCaching) {
        const cacheKey = this._getCacheKey('segmentation', imageFile.name, { points, ...options });
        this.cache.set(cacheKey, segmentationResult);
      }

      console.log(`Segmentation completed with ${segmentationResult.masks.length} masks in ${segmentationResult.processing_time}ms`);
      return segmentationResult;

    } catch (error) {
      console.error('Image segmentation failed:', error);
      throw new Error(`Segmentation service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate automatic masks for entire image
   */
  async generateAutomaticMasks(
    imageFile: File,
    options: {
      model_name?: string;
    } = {}
  ): Promise<SegmentationResult> {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('model_name', options.model_name || 'sam_vit_h');
      formData.append('automatic', 'true');

      const response = await this._makeRequest('/api/v1/inference/segment/automatic', {
        method: 'POST',
        body: formData
      });

      if (!response.success) {
        throw new Error(response.error || 'Automatic mask generation failed');
      }

      console.log(`Generated ${response.segmentation.masks.length} automatic masks`);
      return response.segmentation;

    } catch (error) {
      console.error('Automatic mask generation failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // Pre-annotation Methods
  // ============================================================================

  /**
   * Pre-annotate dataset
   * Replaces: Mock pre-annotation in src/PreAnnotationEngine.ts
   */
  async preAnnotateDataset(
    datasetId: string,
    projectId: string,
    imagePaths: string[],
    config: PreAnnotationConfig,
    onProgress?: (progress: number) => void
  ): Promise<PreAnnotationResult> {
    try {
      const requestBody = {
        dataset_id: datasetId,
        project_id: projectId,
        image_paths: imagePaths,
        config: config
      };

      // For large datasets, use streaming endpoint
      if (imagePaths.length > 100) {
        return this._preAnnotateDatasetStreaming(requestBody, onProgress);
      }

      const response = await this._makeRequest('/api/v1/pre-annotate/dataset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.success) {
        throw new Error(response.error || 'Pre-annotation failed');
      }

      console.log(`Pre-annotation completed: ${response.total_annotations} annotations for ${response.processed_images} images`);
      return response;

    } catch (error) {
      console.error('Dataset pre-annotation failed:', error);
      throw error;
    }
  }

  /**
   * Pre-annotate dataset with streaming progress updates
   */
  private async _preAnnotateDatasetStreaming(
    requestBody: any,
    onProgress?: (progress: number) => void
  ): Promise<PreAnnotationResult> {
    return new Promise((resolve, reject) => {
      // Use WebSocket for streaming
      const wsUrl = this.config.baseUrl.replace('http', 'ws') + '/ws/pre-annotate';
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Pre-annotation WebSocket connected');
        ws.send(JSON.stringify(requestBody));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'progress') {
          const progress = (data.processed / data.total) * 100;
          onProgress?.(progress);
        } else if (data.type === 'complete') {
          ws.close();
          resolve(data.result);
        } else if (data.type === 'error') {
          ws.close();
          reject(new Error(data.message));
        }
      };

      ws.onerror = (error) => {
        console.error('Pre-annotation WebSocket error:', error);
        reject(new Error('WebSocket connection failed'));
      };

      ws.onclose = () => {
        console.log('Pre-annotation WebSocket closed');
      };
    });
  }

  // ============================================================================
  // Model Management Methods
  // ============================================================================

  /**
   * Get status of all loaded AI models
   */
  async getModelStatus(): Promise<ModelStatus[]> {
    try {
      const response = await this._makeRequest('/models/status', {
        method: 'GET'
      });

      return response.models || [];

    } catch (error) {
      console.error('Failed to get model status:', error);
      throw error;
    }
  }

  /**
   * Get health status of AI service
   */
  async getHealthStatus(): Promise<{
    status: string;
    models_loaded: number;
    device: string;
    gpu_available: boolean;
  }> {
    try {
      const response = await this._makeRequest('/health', {
        method: 'GET'
      });

      return response;

    } catch (error) {
      console.error('Failed to get health status:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  async getMetrics(): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/metrics`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();

    } catch (error) {
      console.error('Failed to get metrics:', error);
      throw error;
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Make authenticated request to AI service
   */
  private async _makeRequest(
    endpoint: string,
    options: RequestInit,
    retryCount: number = 0
  ): Promise<any> {
    try {
      // Get auth token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      // Prepare headers
      const headers = new Headers(options.headers);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      // Make request
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      // Retry logic
      if (retryCount < this.config.retryAttempts) {
        console.warn(`Request failed, retrying (${retryCount + 1}/${this.config.retryAttempts}):`, error);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (retryCount + 1)));
        
        return this._makeRequest(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Convert file to base64 string
   */
  private async _fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Generate cache key for results
   */
  private _getCacheKey(operation: string, fileName: string, options: any): string {
    const optionsHash = btoa(JSON.stringify(options));
    return `${operation}:${fileName}:${optionsHash}`;
  }

  /**
   * Process batch queue for efficient inference
   */
  private _processBatchQueue() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(async () => {
      if (this.batchQueue.length === 0) return;

      const batch = this.batchQueue.splice(0, this.config.maxBatchSize);
      const files = batch.map(item => item.file);

      try {
        const results = await this.detectObjectsBatch(files);
        
        // Resolve individual promises
        batch.forEach((item, index) => {
          const result = results.results[index];
          if (result.success) {
            item.resolve(result.detections || []);
          } else {
            item.reject(new Error(result.error || 'Batch inference failed'));
          }
        });

      } catch (error) {
        // Reject all promises in batch
        batch.forEach(item => item.reject(error));
      }

      // Process remaining queue
      if (this.batchQueue.length > 0) {
        this._processBatchQueue();
      }
    }, 100); // 100ms batch delay
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('AI service cache cleared');
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('AI service config updated:', newConfig);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

// Create singleton instance
let aiServiceInstance: AIServiceClient | null = null;

export const getAIService = (): AIServiceClient => {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIServiceClient();
  }
  return aiServiceInstance;
};

// ============================================================================
// React Hooks
// ============================================================================

/**
 * React hook for object detection
 */
export function useAIDetection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectObjects = async (imageFile: File, options?: any): Promise<Detection[]> => {
    setLoading(true);
    setError(null);

    try {
      const aiService = getAIService();
      const detections = await aiService.detectObjects(imageFile, options);
      return detections;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Detection failed';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { detectObjects, loading, error };
}

/**
 * React hook for image segmentation
 */
export function useAISegmentation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const segmentImage = async (
    imageFile: File, 
    points: Point[], 
    options?: any
  ): Promise<SegmentationResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const aiService = getAIService();
      const result = await aiService.segmentImage(imageFile, points, options);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Segmentation failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { segmentImage, loading, error };
}

/**
 * React hook for pre-annotation
 */
export function usePreAnnotation() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const preAnnotateDataset = async (
    datasetId: string,
    projectId: string,
    imagePaths: string[],
    config: PreAnnotationConfig
  ): Promise<PreAnnotationResult | null> => {
    setLoading(true);
    setProgress(0);
    setError(null);

    try {
      const aiService = getAIService();
      const result = await aiService.preAnnotateDataset(
        datasetId,
        projectId,
        imagePaths,
        config,
        setProgress
      );
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Pre-annotation failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  return { preAnnotateDataset, loading, progress, error };
}

// ============================================================================
// Export Default
// ============================================================================

export default AIServiceClient;

// React import for hooks
import { useState } from 'react'; 