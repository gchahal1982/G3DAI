/**
 * G3D MedSight Pro - Parallel Processing System
 * Advanced parallel processing for medical 3D applications
 */

export interface ParallelConfig {
    maxWorkers: number;
    enableGPUCompute: boolean;
    enableWebWorkers: boolean;
    enableSharedArrayBuffer: boolean;
    workerPoolSize: number;
    taskQueueSize: number;
    enableLoadBalancing: boolean;
    enableTaskPrioritization: boolean;
}

export interface ParallelTask {
    id: string;
    type: 'medical-analysis' | 'image-processing' | 'volume-rendering' | 'segmentation' | 'registration' | 'computation';
    priority: 'low' | 'medium' | 'high' | 'critical';
    data: any;
    medicalContext?: MedicalTaskContext;
    estimatedDuration: number;
    dependencies: string[];
    callback?: (result: any) => void;
    onProgress?: (progress: number) => void;
    onError?: (error: Error) => void;
}

export interface MedicalTaskContext {
    patientId: string;
    studyId: string;
    modality: string;
    bodyPart: string;
    urgency: 'routine' | 'urgent' | 'stat' | 'emergency';
    clinicalPurpose: string;
    dataSize: number;
    complexity: 'low' | 'medium' | 'high' | 'critical';
}

export interface WorkerInfo {
    id: string;
    worker: Worker;
    busy: boolean;
    currentTask: string | null;
    tasksCompleted: number;
    totalProcessingTime: number;
    capabilities: string[];
}

export interface TaskResult {
    taskId: string;
    success: boolean;
    result: any;
    error?: Error;
    processingTime: number;
    workerId: string;
}

export interface ParallelStats {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageProcessingTime: number;
    totalProcessingTime: number;
    workerUtilization: number;
    queueLength: number;
    throughput: number; // tasks per second
}

export class ParallelProcessing {
    private config: ParallelConfig;
    private workers: Map<string, WorkerInfo> = new Map();
    private taskQueue: ParallelTask[] = [];
    private activeTasks: Map<string, ParallelTask> = new Map();
    private completedTasks: Map<string, TaskResult> = new Map();
    private taskDependencies: Map<string, Set<string>> = new Map();

    private isInitialized: boolean = false;
    private stats: ParallelStats = {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        averageProcessingTime: 0,
        totalProcessingTime: 0,
        workerUtilization: 0,
        queueLength: 0,
        throughput: 0
    };

    constructor(config: Partial<ParallelConfig> = {}) {
        this.config = {
            maxWorkers: navigator.hardwareConcurrency || 4,
            enableGPUCompute: true,
            enableWebWorkers: true,
            enableSharedArrayBuffer: 'SharedArrayBuffer' in window,
            workerPoolSize: Math.min(navigator.hardwareConcurrency || 4, 8),
            taskQueueSize: 1000,
            enableLoadBalancing: true,
            enableTaskPrioritization: true,
            ...config
        };
    }

    async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D Parallel Processing System...');

            if (this.config.enableWebWorkers) {
                await this.initializeWorkerPool();
            }

            this.isInitialized = true;
            console.log('G3D Parallel Processing System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Parallel Processing System:', error);
            throw error;
        }
    }

    private async initializeWorkerPool(): Promise<void> {
        const workerScript = this.createWorkerScript();
        const blob = new Blob([workerScript], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);

        for (let i = 0; i < this.config.workerPoolSize; i++) {
            const workerId = `worker_${i}`;
            const worker = new Worker(workerUrl);

            const workerInfo: WorkerInfo = {
                id: workerId,
                worker,
                busy: false,
                currentTask: null,
                tasksCompleted: 0,
                totalProcessingTime: 0,
                capabilities: ['general', 'medical', 'image-processing', 'computation']
            };

            // Set up worker message handling
            worker.onmessage = (event) => {
                this.handleWorkerMessage(workerId, event);
            };

            worker.onerror = (error) => {
                this.handleWorkerError(workerId, error);
            };

            this.workers.set(workerId, workerInfo);
        }

        console.log(`Initialized ${this.config.workerPoolSize} workers`);
    }

    private createWorkerScript(): string {
        return `
      // G3D Medical Worker Script
      let currentTask = null;
      
      self.onmessage = function(event) {
        const { type, taskId, data } = event.data;
        
        if (type === 'execute') {
          currentTask = taskId;
          executeTask(data)
            .then(result => {
              self.postMessage({
                type: 'result',
                taskId: taskId,
                success: true,
                result: result
              });
            })
            .catch(error => {
              self.postMessage({
                type: 'result',
                taskId: taskId,
                success: false,
                error: error.message
              });
            });
        }
      };
      
      async function executeTask(taskData) {
        const { taskType, payload, medicalContext } = taskData;
        
        switch (taskType) {
          case 'medical-analysis':
            return await executeMedicalAnalysis(payload, medicalContext);
          case 'image-processing':
            return await executeImageProcessing(payload);
          case 'volume-rendering':
            return await executeVolumeRendering(payload);
          case 'segmentation':
            return await executeSegmentation(payload);
          case 'registration':
            return await executeRegistration(payload);
          case 'computation':
            return await executeComputation(payload);
          default:
            throw new Error('Unknown task type: ' + taskType);
        }
      }
      
      async function executeMedicalAnalysis(payload, context) {
        // Simulate medical analysis processing
        const { imageData, analysisType } = payload;
        
        if (analysisType === 'histogram') {
          return calculateHistogram(imageData);
        } else if (analysisType === 'statistics') {
          return calculateStatistics(imageData);
        } else if (analysisType === 'measurements') {
          return calculateMeasurements(imageData, context);
        }
        
        return { analysis: 'completed', context };
      }
      
      async function executeImageProcessing(payload) {
        const { imageData, operation, parameters } = payload;
        
        switch (operation) {
          case 'filter':
            return applyFilter(imageData, parameters);
          case 'enhance':
            return enhanceImage(imageData, parameters);
          case 'denoise':
            return denoiseImage(imageData, parameters);
          default:
            return imageData;
        }
      }
      
      async function executeVolumeRendering(payload) {
        const { volumeData, renderParams } = payload;
        
        // Simulate volume rendering
        return {
          renderedVolume: 'volume_rendered',
          parameters: renderParams,
          timestamp: Date.now()
        };
      }
      
      async function executeSegmentation(payload) {
        const { imageData, segmentationType, parameters } = payload;
        
        if (segmentationType === 'threshold') {
          return performThresholding(imageData, parameters.threshold);
        } else if (segmentationType === 'region-growing') {
          return performRegionGrowing(imageData, parameters);
        }
        
        return { segmentation: 'completed' };
      }
      
      async function executeRegistration(payload) {
        const { fixedImage, movingImage, registrationType } = payload;
        
        // Simulate image registration
        return {
          transform: generateTransformMatrix(),
          registrationType,
          similarity: Math.random()
        };
      }
      
      async function executeComputation(payload) {
        const { operation, data, parameters } = payload;
        
        switch (operation) {
          case 'matrix-multiply':
            return multiplyMatrices(data.a, data.b);
          case 'convolution':
            return performConvolution(data.image, data.kernel);
          case 'fft':
            return performFFT(data.signal);
          default:
            return data;
        }
      }
      
      // Helper functions
      function calculateHistogram(imageData) {
        const histogram = new Array(256).fill(0);
        for (let i = 0; i < imageData.length; i++) {
          const value = Math.floor(imageData[i] * 255);
          histogram[value]++;
        }
        return { histogram, bins: 256 };
      }
      
      function calculateStatistics(imageData) {
        let sum = 0;
        let sumSquared = 0;
        let min = Infinity;
        let max = -Infinity;
        
        for (let i = 0; i < imageData.length; i++) {
          const value = imageData[i];
          sum += value;
          sumSquared += value * value;
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
        
        const mean = sum / imageData.length;
        const variance = (sumSquared / imageData.length) - (mean * mean);
        const stddev = Math.sqrt(variance);
        
        return { mean, stddev, min, max, count: imageData.length };
      }
      
      function calculateMeasurements(imageData, context) {
        const stats = calculateStatistics(imageData);
        
        return {
          ...stats,
          volume: imageData.length * (context?.voxelSize || 1),
          modality: context?.modality || 'unknown',
          timestamp: Date.now()
        };
      }
      
      function applyFilter(imageData, parameters) {
        const { filterType, kernelSize } = parameters;
        const filtered = new Float32Array(imageData.length);
        
        // Simplified filtering
        for (let i = 0; i < imageData.length; i++) {
          filtered[i] = imageData[i] * (filterType === 'sharpen' ? 1.2 : 0.8);
        }
        
        return filtered;
      }
      
      function enhanceImage(imageData, parameters) {
        const { contrast, brightness } = parameters;
        const enhanced = new Float32Array(imageData.length);
        
        for (let i = 0; i < imageData.length; i++) {
          enhanced[i] = Math.max(0, Math.min(1, 
            (imageData[i] * contrast) + brightness
          ));
        }
        
        return enhanced;
      }
      
      function denoiseImage(imageData, parameters) {
        const { strength } = parameters;
        const denoised = new Float32Array(imageData.length);
        
        // Simplified denoising
        for (let i = 0; i < imageData.length; i++) {
          denoised[i] = imageData[i] + (Math.random() - 0.5) * strength;
        }
        
        return denoised;
      }
      
      function performThresholding(imageData, threshold) {
        const segmented = new Uint8Array(imageData.length);
        
        for (let i = 0; i < imageData.length; i++) {
          segmented[i] = imageData[i] > threshold ? 255 : 0;
        }
        
        return segmented;
      }
      
      function performRegionGrowing(imageData, parameters) {
        const { seedPoints, threshold } = parameters;
        const segmented = new Uint8Array(imageData.length);
        
        // Simplified region growing
        for (let i = 0; i < imageData.length; i++) {
          segmented[i] = Math.random() > 0.5 ? 255 : 0;
        }
        
        return segmented;
      }
      
      function generateTransformMatrix() {
        return [
          [1, 0, 0, Math.random() * 10],
          [0, 1, 0, Math.random() * 10],
          [0, 0, 1, Math.random() * 10],
          [0, 0, 0, 1]
        ];
      }
      
      function multiplyMatrices(a, b) {
        const result = [];
        for (let i = 0; i < a.length; i++) {
          result[i] = [];
          for (let j = 0; j < b[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < b.length; k++) {
              sum += a[i][k] * b[k][j];
            }
            result[i][j] = sum;
          }
        }
        return result;
      }
      
      function performConvolution(image, kernel) {
        // Simplified convolution
        const result = new Float32Array(image.length);
        for (let i = 0; i < image.length; i++) {
          result[i] = image[i] * kernel[0];
        }
        return result;
      }
      
      function performFFT(signal) {
        // Simplified FFT placeholder
        return signal.map((value, index) => ({
          real: value * Math.cos(index),
          imag: value * Math.sin(index)
        }));
      }
    `;
    }

    private handleWorkerMessage(workerId: string, event: MessageEvent): void {
        const { type, taskId, success, result, error } = event.data;

        if (type === 'result') {
            this.handleTaskCompletion(workerId, taskId, success, result, error);
        }
    }

    private handleWorkerError(workerId: string, error: ErrorEvent): void {
        console.error(`Worker ${workerId} error:`, error);

        const workerInfo = this.workers.get(workerId);
        if (workerInfo && workerInfo.currentTask) {
            this.handleTaskCompletion(workerId, workerInfo.currentTask, false, null, new Error(error.message));
        }
    }

    private handleTaskCompletion(
        workerId: string,
        taskId: string,
        success: boolean,
        result: any,
        error?: Error
    ): void {
        const workerInfo = this.workers.get(workerId);
        const task = this.activeTasks.get(taskId);

        if (!workerInfo || !task) return;

        const processingTime = Date.now() - (task as any).startTime;

        // Update worker info
        workerInfo.busy = false;
        workerInfo.currentTask = null;
        workerInfo.tasksCompleted++;
        workerInfo.totalProcessingTime += processingTime;

        // Create task result
        const taskResult: TaskResult = {
            taskId,
            success,
            result,
            error,
            processingTime,
            workerId
        };

        // Store result
        this.completedTasks.set(taskId, taskResult);
        this.activeTasks.delete(taskId);

        // Update statistics
        this.updateStats(taskResult);

        // Call task callback
        if (success && task.callback) {
            task.callback(result);
        } else if (!success && task.onError) {
            task.onError(error || new Error('Task failed'));
        }

        // Process dependent tasks
        this.processDependentTasks(taskId);

        // Schedule next task
        this.scheduleNextTask();
    }

    private updateStats(taskResult: TaskResult): void {
        if (taskResult.success) {
            this.stats.completedTasks++;
        } else {
            this.stats.failedTasks++;
        }

        this.stats.totalProcessingTime += taskResult.processingTime;
        this.stats.averageProcessingTime =
            this.stats.totalProcessingTime / (this.stats.completedTasks + this.stats.failedTasks);

        // Calculate worker utilization
        let totalWorkerTime = 0;
        let busyWorkerTime = 0;

        for (const worker of this.workers.values()) {
            totalWorkerTime += worker.totalProcessingTime;
            if (worker.busy) {
                busyWorkerTime += worker.totalProcessingTime;
            }
        }

        this.stats.workerUtilization = totalWorkerTime > 0 ? busyWorkerTime / totalWorkerTime : 0;
        this.stats.queueLength = this.taskQueue.length;

        // Calculate throughput (tasks per second)
        const currentTime = Date.now();
        this.stats.throughput = this.stats.completedTasks / (currentTime / 1000);
    }

    private processDependentTasks(completedTaskId: string): void {
        const dependents = this.taskDependencies.get(completedTaskId);
        if (!dependents) return;

        for (const dependentTaskId of dependents) {
            const dependentTask = this.taskQueue.find(task => task.id === dependentTaskId);
            if (dependentTask) {
                // Remove completed dependency
                const depIndex = dependentTask.dependencies.indexOf(completedTaskId);
                if (depIndex !== -1) {
                    dependentTask.dependencies.splice(depIndex, 1);
                }
            }
        }

        this.taskDependencies.delete(completedTaskId);
    }

    // Public API
    public submitTask(task: Omit<ParallelTask, 'id'>): string {
        if (!this.isInitialized) {
            throw new Error('Parallel processing system not initialized');
        }

        const taskId = this.generateTaskId();
        const fullTask: ParallelTask = {
            id: taskId,
            ...task
        };

        // Add to queue
        this.taskQueue.push(fullTask);
        this.stats.totalTasks++;

        // Set up dependencies
        if (fullTask.dependencies.length > 0) {
            for (const depId of fullTask.dependencies) {
                if (!this.taskDependencies.has(depId)) {
                    this.taskDependencies.set(depId, new Set());
                }
                this.taskDependencies.get(depId)!.add(taskId);
            }
        }

        // Sort queue by priority if enabled
        if (this.config.enableTaskPrioritization) {
            this.prioritizeTaskQueue();
        }

        // Try to schedule immediately
        this.scheduleNextTask();

        return taskId;
    }

    private prioritizeTaskQueue(): void {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

        this.taskQueue.sort((a, b) => {
            // First by priority
            const aPriority = priorityOrder[a.priority];
            const bPriority = priorityOrder[b.priority];

            if (aPriority !== bPriority) {
                return bPriority - aPriority; // Higher priority first
            }

            // Then by medical urgency if available
            if (a.medicalContext && b.medicalContext) {
                const urgencyOrder = { emergency: 4, stat: 3, urgent: 2, routine: 1 };
                const aUrgency = urgencyOrder[a.medicalContext.urgency];
                const bUrgency = urgencyOrder[b.medicalContext.urgency];

                if (aUrgency !== bUrgency) {
                    return bUrgency - aUrgency;
                }
            }

            // Finally by estimated duration (shorter first)
            return a.estimatedDuration - b.estimatedDuration;
        });
    }

    private scheduleNextTask(): void {
        if (this.taskQueue.length === 0) return;

        // Find available worker
        const availableWorker = this.findAvailableWorker();
        if (!availableWorker) return;

        // Find next executable task (no pending dependencies)
        const taskIndex = this.taskQueue.findIndex(task => task.dependencies.length === 0);
        if (taskIndex === -1) return;

        const task = this.taskQueue.splice(taskIndex, 1)[0];

        // Execute task
        this.executeTask(availableWorker, task);
    }

    private findAvailableWorker(): WorkerInfo | null {
        if (this.config.enableLoadBalancing) {
            // Find worker with least load
            let bestWorker: WorkerInfo | null = null;
            let minLoad = Infinity;

            for (const worker of this.workers.values()) {
                if (!worker.busy) {
                    const load = worker.totalProcessingTime / (worker.tasksCompleted || 1);
                    if (load < minLoad) {
                        minLoad = load;
                        bestWorker = worker;
                    }
                }
            }

            return bestWorker;
        } else {
            // Find first available worker
            for (const worker of this.workers.values()) {
                if (!worker.busy) {
                    return worker;
                }
            }
        }

        return null;
    }

    private executeTask(worker: WorkerInfo, task: ParallelTask): void {
        worker.busy = true;
        worker.currentTask = task.id;

        this.activeTasks.set(task.id, task);
        (task as any).startTime = Date.now();

        // Send task to worker
        worker.worker.postMessage({
            type: 'execute',
            taskId: task.id,
            data: {
                taskType: task.type,
                payload: task.data,
                medicalContext: task.medicalContext
            }
        });
    }

    // Medical-specific methods
    public submitMedicalAnalysisTask(
        imageData: ArrayBuffer,
        analysisType: string,
        medicalContext: MedicalTaskContext,
        priority: ParallelTask['priority'] = 'medium'
    ): string {
        return this.submitTask({
            type: 'medical-analysis',
            priority,
            data: { imageData, analysisType },
            medicalContext,
            estimatedDuration: this.estimateAnalysisDuration(analysisType, imageData.byteLength),
            dependencies: []
        });
    }

    public submitVolumeRenderingTask(
        volumeData: ArrayBuffer,
        renderParams: any,
        priority: ParallelTask['priority'] = 'high'
    ): string {
        return this.submitTask({
            type: 'volume-rendering',
            priority,
            data: { volumeData, renderParams },
            estimatedDuration: this.estimateRenderingDuration(volumeData.byteLength),
            dependencies: []
        });
    }

    public submitSegmentationTask(
        imageData: ArrayBuffer,
        segmentationType: string,
        parameters: any,
        medicalContext?: MedicalTaskContext
    ): string {
        return this.submitTask({
            type: 'segmentation',
            priority: 'high',
            data: { imageData, segmentationType, parameters },
            medicalContext,
            estimatedDuration: this.estimateSegmentationDuration(segmentationType, imageData.byteLength),
            dependencies: []
        });
    }

    private estimateAnalysisDuration(analysisType: string, dataSize: number): number {
        const baseTime = 100; // ms
        const sizeMultiplier = dataSize / (1024 * 1024); // per MB

        const typeMultipliers = {
            'histogram': 1,
            'statistics': 1.5,
            'measurements': 2,
            'complex-analysis': 5
        };

        const multiplier = typeMultipliers[analysisType as keyof typeof typeMultipliers] || 2;
        return baseTime * multiplier * sizeMultiplier;
    }

    private estimateRenderingDuration(dataSize: number): number {
        return Math.max(500, dataSize / (1024 * 1024) * 200); // 200ms per MB
    }

    private estimateSegmentationDuration(segmentationType: string, dataSize: number): number {
        const typeMultipliers = {
            'threshold': 1,
            'region-growing': 3,
            'watershed': 5,
            'deep-learning': 10
        };

        const multiplier = typeMultipliers[segmentationType as keyof typeof typeMultipliers] || 3;
        return Math.max(200, dataSize / (1024 * 1024) * 100 * multiplier);
    }

    // Utility methods
    public getTaskResult(taskId: string): TaskResult | null {
        return this.completedTasks.get(taskId) || null;
    }

    public getStats(): ParallelStats {
        return { ...this.stats };
    }

    public getWorkerInfo(): WorkerInfo[] {
        return Array.from(this.workers.values());
    }

    public cancelTask(taskId: string): boolean {
        // Remove from queue
        const queueIndex = this.taskQueue.findIndex(task => task.id === taskId);
        if (queueIndex !== -1) {
            this.taskQueue.splice(queueIndex, 1);
            return true;
        }

        // Cannot cancel active tasks in this implementation
        return false;
    }

    public clearCompletedTasks(): void {
        this.completedTasks.clear();
    }

    private generateTaskId(): string {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    public dispose(): void {
        console.log('Disposing G3D Parallel Processing System...');

        // Terminate all workers
        for (const workerInfo of this.workers.values()) {
            workerInfo.worker.terminate();
        }

        this.workers.clear();
        this.taskQueue = [];
        this.activeTasks.clear();
        this.completedTasks.clear();
        this.taskDependencies.clear();

        this.isInitialized = false;

        console.log('G3D Parallel Processing System disposed');
    }
}

export default ParallelProcessing;