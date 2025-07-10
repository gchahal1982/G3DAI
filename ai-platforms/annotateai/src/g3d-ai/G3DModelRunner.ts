/**
 * G3D Model Runner - Advanced AI model execution with GPU acceleration
 * Provides high-performance inference for multiple AI models simultaneously
 */

import { mat4, vec3, vec4 } from 'gl-matrix';

// Model types supported
export enum G3DModelType {
    ONNX = 'onnx',
    TENSORFLOW = 'tensorflow',
    PYTORCH = 'pytorch',
    CUSTOM = 'custom'
}

// Model precision modes
export enum G3DPrecision {
    FP32 = 'fp32',
    FP16 = 'fp16',
    INT8 = 'int8',
    MIXED = 'mixed'
}

// Model execution backend
export enum G3DBackend {
    WEBGL = 'webgl',
    WEBGPU = 'webgpu',
    WASM = 'wasm',
    CPU = 'cpu'
}

// Model configuration
export interface G3DModelConfig {
    id: string;
    name: string;
    version: string;
    type?: G3DModelType;
    modelPath?: string;
    modelId?: string;
    architecture?: string;
    precision?: G3DPrecision;
    memoryRequirement?: string;
    inputShape?: number[];
    warmupRuns?: number;
    preprocessing?: G3DPreprocessConfig;
    postprocessing?: G3DPostprocessConfig;
    [key: string]: any; // Allow additional properties
}

// Preprocessing configuration
export interface G3DPreprocessConfig {
    normalize: boolean;
    mean?: number[];
    std?: number[];
    resize?: [number, number];
    centerCrop?: boolean;
    format?: 'NCHW' | 'NHWC';
}

// Postprocessing configuration
export interface G3DPostprocessConfig {
    activation?: 'softmax' | 'sigmoid' | 'none';
    threshold?: number;
    topK?: number;
    nms?: {
        iouThreshold: number;
        scoreThreshold: number;
        maxBoxes: number;
    };
}

// Model input/output tensors
export interface G3DTensor {
    data: Float32Array | Int32Array | Uint8Array;
    shape: number[];
    dtype: 'float32' | 'int32' | 'uint8';
}

// Inference result
export interface G3DInferenceResult {
    data: Float32Array | Int32Array | Uint8Array;
    shape: number[];
    predictions?: any;
    confidence?: number;
    processingTime?: number;
    modelId?: string;
    outputs?: Map<string, any>;
    inferenceTime?: number;
    preprocessTime?: number;
    postprocessTime?: number;
    totalTime?: number;
    
    // Make it iterable
    [Symbol.iterator](): Iterator<any>;
    slice(start: number, end: number): any;
}

// Model instance
export interface G3DModelInstance {
    config: G3DModelConfig;
    model: any;  // Actual model object (ONNX Runtime, TF.js, etc.)
    session?: any;  // Inference session
    loaded: boolean;
    lastUsed: number;
    inferenceCount: number;
    totalInferenceTime: number;
}

// Batch processing
export interface G3DBatch {
    inputs: G3DTensor[];
    modelId: string;
    priority: number;
    callback: (results: G3DInferenceResult[]) => void;
}

// GPU device interface for TypeScript compatibility
interface GPUAdapter {
    requestDevice(): Promise<GPUDevice>;
}

interface GPUDevice {
    // GPU device properties
    label: string;
    destroy(): void;
}

// Navigator GPU interface for TypeScript compatibility
interface NavigatorGPU {
    requestAdapter(options?: any): Promise<GPUAdapter | null>;
}

// Extend navigator interface
declare global {
    interface Navigator {
        gpu?: NavigatorGPU;
    }
}

// Main G3D Model Runner Class
export class G3DModelRunner {
    private models: Map<string, G3DModelInstance> = new Map();
    private batchQueue: G3DBatch[] = [];
    private isProcessing: boolean = false;
    private gpuDevice: GPUDevice | null = null;
    private webglContext: WebGL2RenderingContext | null = null;

    // Performance tracking
    private stats = {
        totalInferences: 0,
        totalBatches: 0,
        averageInferenceTime: 0,
        averageBatchSize: 0,
        cacheHits: 0,
        cacheMisses: 0
    };

    // Model cache
    private modelCache: Map<string, ArrayBuffer> = new Map();
    private maxCacheSize: number = 1024 * 1024 * 1024; // 1GB
    private currentCacheSize: number = 0;

    constructor() {
        this.initializeBackends();
    }

    private async initializeBackends(): Promise<void> {
        // Initialize WebGPU if available
        if (navigator.gpu) {
            try {
                const adapter = await navigator.gpu.requestAdapter({
                    powerPreference: 'high-performance'
                });
                if (adapter) {
                    this.gpuDevice = await adapter.requestDevice() as any;
                    console.log('G3D ModelRunner: WebGPU initialized');
                }
            } catch (e) {
                console.warn('G3D ModelRunner: WebGPU initialization failed', e);
            }
        }

        // Initialize WebGL2 as fallback
        const canvas = document.createElement('canvas');
        this.webglContext = canvas.getContext('webgl2', {
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false
        });

        if (this.webglContext) {
            console.log('G3D ModelRunner: WebGL2 initialized');
        }
    }

    // Model loading and management

    async loadModel(config: G3DModelConfig): Promise<void> {
        if (this.models.has(config.id)) {
            console.warn(`Model ${config.id} already loaded`);
            return;
        }

        // Provide defaults for missing properties
        const normalizedConfig: G3DModelConfig = {
            ...config,
            type: config.type || G3DModelType.CUSTOM,
            modelPath: config.modelPath || config.id,
            modelId: config.modelId || config.id,
            architecture: config.architecture || 'default',
            precision: config.precision || G3DPrecision.FP32,
            memoryRequirement: config.memoryRequirement || '1GB',
            inputShape: config.inputShape || [1, 224, 224, 3],
            warmupRuns: config.warmupRuns || 0,
            preprocessing: config.preprocessing,
            postprocessing: config.postprocessing,
        };

        const instance: G3DModelInstance = {
            config: normalizedConfig,
            model: null,
            session: null,
            loaded: false,
            lastUsed: Date.now(),
            inferenceCount: 0,
            totalInferenceTime: 0
        };

        try {
            // Check cache first
            let modelData = this.modelCache.get(normalizedConfig.modelPath);
            if (!modelData) {
                if (normalizedConfig.modelPath && normalizedConfig.modelPath !== config.id) {
                    modelData = await this.fetchModel(normalizedConfig.modelPath);
                    this.cacheModel(normalizedConfig.modelPath, modelData);
                    this.stats.cacheMisses++;
                } else {
                    // Create dummy model data for non-path models
                    modelData = new ArrayBuffer(0);
                    this.stats.cacheMisses++;
                }
            } else {
                this.stats.cacheHits++;
            }

            // Load model based on type
            switch (normalizedConfig.type) {
                case G3DModelType.ONNX:
                    await this.loadONNXModel(instance, modelData);
                    break;
                case G3DModelType.TENSORFLOW:
                    await this.loadTensorFlowModel(instance, modelData);
                    break;
                case G3DModelType.PYTORCH:
                    await this.loadPyTorchModel(instance, modelData);
                    break;
                case G3DModelType.CUSTOM:
                    await this.loadCustomModel(instance, modelData);
                    break;
            }

            instance.loaded = true;
            this.models.set(config.id, instance);

            // Warmup if specified
            if (normalizedConfig.warmupRuns && normalizedConfig.warmupRuns > 0) {
                await this.warmupModel(instance);
            }

        } catch (error) {
            console.error(`Failed to load model ${config.id}:`, error);
            throw error;
        }
    }

    private async fetchModel(path: string): Promise<ArrayBuffer> {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to fetch model: ${response.statusText}`);
        }
        return response.arrayBuffer();
    }

    private cacheModel(path: string, data: ArrayBuffer): void {
        const size = data.byteLength;

        // Check if we need to evict old models
        while (this.currentCacheSize + size > this.maxCacheSize && this.modelCache.size > 0) {
            // Evict oldest model (simple LRU)
            const firstKey = this.modelCache.keys().next().value;
            const evictedData = this.modelCache.get(firstKey);
            if (evictedData) {
                const evictedSize = evictedData.byteLength;
                this.modelCache.delete(firstKey);
                this.currentCacheSize -= evictedSize;
            }
        }

        this.modelCache.set(path, data);
        this.currentCacheSize += size;
    }

    private async loadONNXModel(instance: G3DModelInstance, data: ArrayBuffer): Promise<void> {
        // In a real implementation, this would use ONNX Runtime Web
        // For now, we'll simulate the loading
        console.log(`Loading ONNX model ${instance.config.id}`);

        // Simulate model loading
        instance.model = {
            inputNames: ['input'],
            outputNames: ['output'],
            run: async (inputs: any) => {
                // Simulate inference
                return this.simulateInference(instance, inputs);
            }
        };
    }

    private async loadTensorFlowModel(instance: G3DModelInstance, data: ArrayBuffer): Promise<void> {
        // In a real implementation, this would use TensorFlow.js
        console.log(`Loading TensorFlow model ${instance.config.id}`);

        instance.model = {
            predict: async (inputs: any) => {
                return this.simulateInference(instance, inputs);
            }
        };
    }

    private async loadPyTorchModel(instance: G3DModelInstance, data: ArrayBuffer): Promise<void> {
        // PyTorch models would need to be converted to ONNX or another format
        console.log(`Loading PyTorch model ${instance.config.id}`);

        instance.model = {
            forward: async (inputs: any) => {
                return this.simulateInference(instance, inputs);
            }
        };
    }

    private async loadCustomModel(instance: G3DModelInstance, data: ArrayBuffer): Promise<void> {
        // Custom model loading logic
        console.log(`Loading custom model ${instance.config.id}`);

        instance.model = {
            execute: async (inputs: any) => {
                return this.simulateInference(instance, inputs);
            }
        };
    }

    // Model warmup

    private async warmupModel(instance: G3DModelInstance): Promise<void> {
        const config = instance.config;
        if (!config.inputShape || !config.precision) {
            console.warn(`Cannot warmup model ${config.id}: missing inputShape or precision`);
            return;
        }

        const dummyInput = this.createDummyInput(config.inputShape, config.precision);

        console.log(`Warming up model ${config.id} with ${config.warmupRuns} runs`);

        for (let i = 0; i < config.warmupRuns!; i++) {
            await this.runInference(config.id, dummyInput);
        }
    }

    private createDummyInput(shape: number[], precision: G3DPrecision): G3DTensor {
        const size = shape.reduce((a, b) => a * b, 1);
        const data = new Float32Array(size);

        // Fill with random data
        for (let i = 0; i < size; i++) {
            data[i] = Math.random();
        }

        return {
            data,
            shape,
            dtype: 'float32'
        };
    }

    // Inference execution

    async runInference(modelId: string, input?: G3DTensor | any, options?: any): Promise<G3DInferenceResult> {
        const instance = this.models.get(modelId);
        if (!instance || !instance.loaded) {
            throw new Error(`Model ${modelId} not loaded`);
        }

        const startTime = Date.now();
        let preprocessTime = 0;
        let inferenceTime = 0;
        let postprocessTime = 0;

        try {
            // Preprocessing
            const preprocessStart = Date.now();
            const processedInput = await this.preprocess(input, instance.config);
            preprocessTime = Date.now() - preprocessStart;

            // Inference
            const inferenceStart = Date.now();
            const rawOutput = await this.executeModel(instance, processedInput);
            inferenceTime = Date.now() - inferenceStart;

            // Postprocessing
            const postprocessStart = Date.now();
            const output = await this.postprocess(rawOutput, instance.config);
            postprocessTime = Date.now() - postprocessStart;

            const totalTime = Date.now() - startTime;

            // Update stats
            instance.inferenceCount++;
            instance.totalInferenceTime += inferenceTime;
            instance.lastUsed = Date.now();
            this.stats.totalInferences++;

            return {
                modelId,
                outputs: new Map([['output', output]]),
                inferenceTime,
                preprocessTime,
                postprocessTime,
                totalTime,
                data: output.data,
                shape: output.shape,
                [Symbol.iterator]: function* () {
                    for (const value of this.data) {
                        yield value;
                    }
                },
                slice: function(start: number, end: number) {
                    return this.data.slice(start, end);
                }
            };

        } catch (error) {
            console.error(`Inference failed for model ${modelId}:`, error);
            throw error;
        }
    }

    /**
     * Evaluate confidence of model predictions
     */
    evaluateConfidence(results: any): number {
        if (!results || !results.data) {
            return 0;
        }

        // Calculate confidence based on prediction variance
        const predictions = results.data;
        if (Array.isArray(predictions)) {
            const confidences = predictions.map(p => p.confidence || 0);
            return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
        }

        // For single prediction
        return results.confidence || 0.5;
    }

    /**
     * Run a model with given inputs
     */
    async runModel(modelId: string, inputs: any): Promise<any> {
        try {
            return await this.runInference(modelId, inputs);
        } catch (error) {
            console.error(`Failed to run model ${modelId}:`, error);
            throw error;
        }
    }

    /**
     * Predict using a model with given inputs
     * This method provides a consistent interface for model predictions
     */
    async predict(input: any): Promise<any> {
        // For now, we'll use the first available model
        const modelIds = Array.from(this.models.keys());
        if (modelIds.length === 0) {
            throw new Error('No models loaded');
        }
        
        const modelId = modelIds[0];
        return await this.runInference(modelId, input);
    }

    // Batch processing

    async runBatch(modelId: string, inputs: G3DTensor[]): Promise<G3DInferenceResult[]> {
        return new Promise((resolve) => {
            const batch: G3DBatch = {
                inputs,
                modelId,
                priority: 0,
                callback: resolve
            };

            this.batchQueue.push(batch);
            this.processBatchQueue();
        });
    }

    private async processBatchQueue(): Promise<void> {
        if (this.isProcessing || this.batchQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        // Sort by priority
        this.batchQueue.sort((a, b) => b.priority - a.priority);

        // Process batches
        while (this.batchQueue.length > 0) {
            const batch = this.batchQueue.shift()!;

            try {
                const results: G3DInferenceResult[] = [];

                // Process each input in the batch
                for (const input of batch.inputs) {
                    const result = await this.runInference(batch.modelId, input);
                    results.push(result);
                }

                batch.callback(results);
                this.stats.totalBatches++;
                this.stats.averageBatchSize =
                    (this.stats.averageBatchSize * (this.stats.totalBatches - 1) + batch.inputs.length) /
                    this.stats.totalBatches;

            } catch (error) {
                console.error('Batch processing failed:', error);
                batch.callback([]);
            }
        }

        this.isProcessing = false;
    }

    // Preprocessing

    private async preprocess(input: G3DTensor, config: G3DModelConfig): Promise<G3DTensor> {
        if (!config.preprocessing) {
            return input;
        }

        let data = input.data as Float32Array;
        let shape = [...input.shape];

        const preproc = config.preprocessing;

        // Resize if needed
        if (preproc.resize) {
            data = await this.resizeTensor(data, shape, preproc.resize);
            shape = [shape[0], preproc.resize[0], preproc.resize[1], shape[3]];
        }

        // Normalize
        if (preproc.normalize && preproc.mean && preproc.std) {
            data = this.normalizeTensor(data, preproc.mean, preproc.std);
        }

        // Format conversion (NHWC to NCHW or vice versa)
        if (preproc.format === 'NCHW' && shape.length === 4) {
            data = this.transposeNHWCtoNCHW(data, shape);
            shape = [shape[0], shape[3], shape[1], shape[2]];
        }

        return {
            data,
            shape,
            dtype: 'float32'
        };
    }

    private async resizeTensor(
        data: Float32Array,
        shape: number[],
        targetSize: [number, number]
    ): Promise<Float32Array> {
        // Simplified resize implementation
        // In a real implementation, this would use proper image resizing algorithms
        const [batch, height, width, channels] = shape;
        const [targetHeight, targetWidth] = targetSize;

        const resized = new Float32Array(batch * targetHeight * targetWidth * channels);

        const scaleY = height / targetHeight;
        const scaleX = width / targetWidth;

        for (let b = 0; b < batch; b++) {
            for (let y = 0; y < targetHeight; y++) {
                for (let x = 0; x < targetWidth; x++) {
                    const srcY = Math.floor(y * scaleY);
                    const srcX = Math.floor(x * scaleX);

                    for (let c = 0; c < channels; c++) {
                        const srcIdx = b * height * width * channels + srcY * width * channels + srcX * channels + c;
                        const dstIdx = b * targetHeight * targetWidth * channels + y * targetWidth * channels + x * channels + c;

                        if (srcIdx < data.length) {
                            resized[dstIdx] = data[srcIdx];
                        }
                    }
                }
            }
        }

        return resized;
    }

    private normalizeTensor(data: Float32Array, mean: number[], std: number[]): Float32Array {
        const normalized = new Float32Array(data.length);
        const channels = mean.length;

        for (let i = 0; i < data.length; i++) {
            const channel = i % channels;
            normalized[i] = (data[i] - mean[channel]) / std[channel];
        }

        return normalized;
    }

    private transposeNHWCtoNCHW(data: Float32Array, shape: number[]): Float32Array {
        const [batch, height, width, channels] = shape;
        const transposed = new Float32Array(data.length);

        for (let b = 0; b < batch; b++) {
            for (let c = 0; c < channels; c++) {
                for (let h = 0; h < height; h++) {
                    for (let w = 0; w < width; w++) {
                        const srcIdx = b * height * width * channels + h * width * channels + w * channels + c;
                        const dstIdx = b * channels * height * width + c * height * width + h * width + w;
                        transposed[dstIdx] = data[srcIdx];
                    }
                }
            }
        }

        return transposed;
    }

    private async executeModel(instance: G3DModelInstance, input: G3DTensor): Promise<G3DTensor> {
        // Execute the model based on its type
        return await this.simulateInference(instance, input);
    }

    private async simulateInference(instance: G3DModelInstance, input: G3DTensor): Promise<G3DTensor> {
        // Simulate model inference
        const outputSize = 1000; // Simulate classification output
        const output = new Float32Array(outputSize);

        // Generate random predictions
        for (let i = 0; i < outputSize; i++) {
            output[i] = Math.random();
        }

        // Apply softmax normalization
        const sum = output.reduce((a, b) => a + Math.exp(b), 0);
        for (let i = 0; i < outputSize; i++) {
            output[i] = Math.exp(output[i]) / sum;
        }

        return {
            data: output,
            shape: [1, outputSize],
            dtype: 'float32'
        };
    }

    private async postprocess(output: G3DTensor, config: G3DModelConfig): Promise<G3DTensor> {
        if (!config.postprocessing) {
            return output;
        }

        let data = output.data as Float32Array;
        const postproc = config.postprocessing;

        // Apply activation function
        if (postproc.activation) {
            switch (postproc.activation) {
                case 'softmax':
                    data = this.softmax(data);
                    break;
                case 'sigmoid':
                    data = this.sigmoid(data);
                    break;
                case 'none':
                default:
                    break;
            }
        }

        // Apply threshold
        if (postproc.threshold !== undefined) {
            data = this.threshold(data, postproc.threshold);
        }

        // Select top-K predictions
        if (postproc.topK) {
            const topK = this.selectTopK(data, postproc.topK);
            data = topK.values;
        }

        return {
            data,
            shape: output.shape,
            dtype: output.dtype
        };
    }

    private softmax(data: Float32Array): Float32Array {
        const result = new Float32Array(data.length);
        const max = Math.max(...data);
        let sum = 0;

        // Subtract max for numerical stability
        for (let i = 0; i < data.length; i++) {
            result[i] = Math.exp(data[i] - max);
            sum += result[i];
        }

        // Normalize
        for (let i = 0; i < data.length; i++) {
            result[i] /= sum;
        }

        return result;
    }

    private sigmoid(data: Float32Array): Float32Array {
        const result = new Float32Array(data.length);
        for (let i = 0; i < data.length; i++) {
            result[i] = 1 / (1 + Math.exp(-data[i]));
        }
        return result;
    }

    private threshold(data: Float32Array, threshold: number): Float32Array {
        const result = new Float32Array(data.length);
        for (let i = 0; i < data.length; i++) {
            result[i] = data[i] > threshold ? data[i] : 0;
        }
        return result;
    }

    private selectTopK(data: Float32Array, k: number): { values: Float32Array; indices: Int32Array } {
        const indexed = Array.from(data).map((value, index) => ({ value, index }));
        indexed.sort((a, b) => b.value - a.value);

        const topK = indexed.slice(0, k);
        const values = new Float32Array(topK.map(item => item.value));
        const indices = new Int32Array(topK.map(item => item.index));

        return { values, indices };
    }

    // Model management

    unloadModel(modelId: string): void {
        const instance = this.models.get(modelId);
        if (instance) {
            // Clean up model resources
            instance.model = null;
            instance.session = null;
            instance.loaded = false;
            this.models.delete(modelId);
            console.log(`Model ${modelId} unloaded`);
        }
    }

    getModel(modelId: string): G3DModelInstance | undefined {
        return this.models.get(modelId);
    }

    getAllModels(): G3DModelInstance[] {
        return Array.from(this.models.values());
    }

    // Performance monitoring

    getStats(): typeof this.stats {
        // Calculate average inference time
        let totalTime = 0;
        let totalInferences = 0;

        for (const instance of this.models.values()) {
            totalTime += instance.totalInferenceTime;
            totalInferences += instance.inferenceCount;
        }

        this.stats.averageInferenceTime = totalInferences > 0 ? totalTime / totalInferences : 0;

        return { ...this.stats };
    }

    // Memory management

    async optimizeMemory(): Promise<void> {
        // Unload least recently used models if memory is low
        const instances = Array.from(this.models.values());
        instances.sort((a, b) => a.lastUsed - b.lastUsed);

        // Unload oldest models if we have too many
        while (instances.length > 10) {
            const oldest = instances.shift()!;
            this.unloadModel(oldest.config.id);
        }

        // Clear old cache entries
        if (this.currentCacheSize > this.maxCacheSize * 0.8) {
            this.modelCache.clear();
            this.currentCacheSize = 0;
        }
    }

    // Lifecycle methods

    async init(): Promise<void> {
        console.log('G3D ModelRunner initialized');
    }

    async cleanup(): Promise<void> {
        // Clean up all models
        for (const modelId of this.models.keys()) {
            this.unloadModel(modelId);
        }

        // Clear cache
        this.modelCache.clear();
        this.currentCacheSize = 0;

        // Clean up GPU resources
        if (this.gpuDevice) {
            this.gpuDevice.destroy();
            this.gpuDevice = null;
        }

        console.log('G3D ModelRunner cleaned up');
    }

    // Additional methods for compatibility

    async createModel(config: any): Promise<any> {
        await this.loadModel(config);
        return this.getModel(config.id);
    }

    async updateModel(model: any, optimizer: any, loss: any): Promise<void> {
        console.log('Model update not supported in inference mode');
    }

    async saveModel(model: any, path: string): Promise<void> {
        console.log(`Model save not supported in inference mode`);
    }

    async createOptimizer(config: any): Promise<any> {
        console.log('Optimizer creation not supported in inference mode');
        return null;
    }


}

export function createG3DModelRunner(): G3DModelRunner {
    return new G3DModelRunner();
}