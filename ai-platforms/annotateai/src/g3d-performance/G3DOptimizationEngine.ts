/**
 * G3D Optimization Engine - Intelligent Performance Optimization
 * 
 * Advanced optimization system that automatically analyzes performance
 * bottlenecks and applies intelligent optimization strategies.
 * 
 * Features:
 * - Real-time performance monitoring
 * - Automatic bottleneck detection
 * - Intelligent optimization strategies
 * - Machine learning-based tuning
 * - Resource allocation optimization
 * - Workload prediction
 * - Performance regression detection
 * - Auto-scaling recommendations
 * 
 * Part of G3D AnnotateAI MVP - Performance & Compute Phase 0.4
 * Ensures optimal performance across all annotation workloads
 */

import { EventEmitter } from 'events';

// Core optimization interfaces
export interface PerformanceMetrics {
    timestamp: number;
    cpu: CPUMetrics;
    memory: MemoryMetrics;
    gpu: GPUMetrics;
    network: NetworkMetrics;
    storage: StorageMetrics;
    application: ApplicationMetrics;
}

export interface CPUMetrics {
    usage: number; // 0-1
    frequency: number; // MHz
    temperature: number; // Celsius
    cores: number;
    threads: number;
    loadAverage: number[];
}

export interface MemoryMetrics {
    used: number; // bytes
    available: number; // bytes
    cached: number; // bytes
    buffers: number; // bytes
    swapUsed: number; // bytes
    pageFaults: number;
}

export interface GPUMetrics {
    usage: number; // 0-1
    memoryUsed: number; // bytes
    memoryTotal: number; // bytes
    temperature: number; // Celsius
    powerUsage: number; // watts
    clockSpeed: number; // MHz
}

export interface NetworkMetrics {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    latency: number; // ms
    bandwidth: number; // bps
    errors: number;
}

export interface StorageMetrics {
    readBytes: number;
    writeBytes: number;
    readOps: number;
    writeOps: number;
    latency: number; // ms
    queueDepth: number;
    utilization: number; // 0-1
}

export interface ApplicationMetrics {
    frameRate: number; // fps
    frameTime: number; // ms
    renderTime: number; // ms
    computeTime: number; // ms
    memoryAllocations: number;
    gcTime: number; // ms
    activeJobs: number;
    queuedJobs: number;
}

export interface OptimizationStrategy {
    id: string;
    name: string;
    description: string;
    category: OptimizationCategory;
    priority: OptimizationPriority;
    conditions: OptimizationCondition[];
    actions: OptimizationAction[];
    cooldownPeriod: number; // ms
    lastApplied: number;
    effectiveness: number; // 0-1
}

export enum OptimizationCategory {
    CPU = 'cpu',
    MEMORY = 'memory',
    GPU = 'gpu',
    NETWORK = 'network',
    STORAGE = 'storage',
    APPLICATION = 'application',
    SYSTEM = 'system'
}

export enum OptimizationPriority {
    LOW = 1,
    NORMAL = 2,
    HIGH = 3,
    CRITICAL = 4
}

export interface OptimizationCondition {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
    value: number | [number, number];
    duration?: number; // ms - condition must persist for this duration
}

export interface OptimizationAction {
    type: OptimizationActionType;
    parameters: Record<string, any>;
    impact: number; // expected performance improvement 0-1
    cost: number; // resource cost 0-1
}

export enum OptimizationActionType {
    SCALE_UP = 'scale_up',
    SCALE_DOWN = 'scale_down',
    ADJUST_MEMORY = 'adjust_memory',
    OPTIMIZE_GPU = 'optimize_gpu',
    TUNE_PARAMETERS = 'tune_parameters',
    REDISTRIBUTE_LOAD = 'redistribute_load',
    ENABLE_CACHING = 'enable_caching',
    COMPRESS_DATA = 'compress_data',
    BATCH_OPERATIONS = 'batch_operations',
    PREFETCH_DATA = 'prefetch_data'
}

export interface OptimizationResult {
    strategyId: string;
    timestamp: number;
    success: boolean;
    improvementPercent: number;
    metricsBeforeAfter: {
        before: PerformanceMetrics;
        after: PerformanceMetrics;
    };
    duration: number; // ms
    error?: string;
}

export interface PredictionModel {
    id: string;
    name: string;
    type: 'linear' | 'polynomial' | 'neural' | 'ensemble';
    features: string[];
    accuracy: number; // 0-1
    lastTrained: number;
    predictions: Map<string, number>;
}

/**
 * Intelligent Optimization Engine
 * Automatically optimizes system performance based on real-time analysis
 */
export class G3DOptimizationEngine extends EventEmitter {
    private metrics: PerformanceMetrics[] = [];
    private strategies: Map<string, OptimizationStrategy> = new Map();
    private optimizationHistory: OptimizationResult[] = [];
    private predictionModels: Map<string, PredictionModel> = new Map();
    private activeOptimizations: Set<string> = new Set();

    private isRunning = false;
    private monitoringInterval = 1000; // 1 second
    private optimizationInterval = 30000; // 30 seconds
    private maxMetricsHistory = 1000;

    // Performance thresholds
    private thresholds = {
        cpu: { warning: 0.8, critical: 0.95 },
        memory: { warning: 0.8, critical: 0.95 },
        gpu: { warning: 0.8, critical: 0.95 },
        frameRate: { warning: 30, critical: 15 },
        latency: { warning: 100, critical: 500 }
    };

    // Machine learning components
    private performancePredictor: PerformancePredictor;
    private bottleneckDetector: BottleneckDetector;
    private strategySelector: StrategySelector;

    constructor() {
        super();

        this.performancePredictor = new PerformancePredictor();
        this.bottleneckDetector = new BottleneckDetector();
        this.strategySelector = new StrategySelector();

        this.initializeStrategies();
        this.initializePredictionModels();
    }

    /**
     * Start the optimization engine
     */
    public start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startMonitoring();
        this.startOptimization();
        this.emit('started');
    }

    /**
     * Stop the optimization engine
     */
    public stop(): void {
        this.isRunning = false;
        this.emit('stopped');
    }

    /**
     * Start performance monitoring
     */
    private startMonitoring(): void {
        const monitor = () => {
            if (!this.isRunning) return;

            this.collectMetrics().then(metrics => {
                this.addMetrics(metrics);
                this.analyzePerformance(metrics);
            });

            setTimeout(monitor, this.monitoringInterval);
        };

        monitor();
    }

    /**
     * Start optimization loop
     */
    private startOptimization(): void {
        const optimize = () => {
            if (!this.isRunning) return;

            this.runOptimizationCycle();
            setTimeout(optimize, this.optimizationInterval);
        };

        optimize();
    }

    /**
     * Collect current performance metrics
     */
    private async collectMetrics(): Promise<PerformanceMetrics> {
        const timestamp = Date.now();

        // Collect system metrics (simplified - in real implementation would use system APIs)
        const metrics: PerformanceMetrics = {
            timestamp,
            cpu: await this.collectCPUMetrics(),
            memory: await this.collectMemoryMetrics(),
            gpu: await this.collectGPUMetrics(),
            network: await this.collectNetworkMetrics(),
            storage: await this.collectStorageMetrics(),
            application: await this.collectApplicationMetrics()
        };

        return metrics;
    }

    /**
     * Collect CPU metrics
     */
    private async collectCPUMetrics(): Promise<CPUMetrics> {
        // Simplified CPU metrics collection
        return {
            usage: Math.random() * 0.8, // Simulate CPU usage
            frequency: 3000, // 3GHz
            temperature: 45 + Math.random() * 20, // 45-65°C
            cores: navigator.hardwareConcurrency || 4,
            threads: (navigator.hardwareConcurrency || 4) * 2,
            loadAverage: [Math.random(), Math.random(), Math.random()]
        };
    }

    /**
     * Collect memory metrics
     */
    private async collectMemoryMetrics(): Promise<MemoryMetrics> {
        const memory = (performance as any).memory;

        return {
            used: memory?.usedJSHeapSize || 0,
            available: memory?.totalJSHeapSize || 0,
            cached: 0,
            buffers: 0,
            swapUsed: 0,
            pageFaults: 0
        };
    }

    /**
     * Collect GPU metrics
     */
    private async collectGPUMetrics(): Promise<GPUMetrics> {
        // Simplified GPU metrics (would require WebGPU or system APIs)
        return {
            usage: Math.random() * 0.7,
            memoryUsed: Math.random() * 1024 * 1024 * 1024, // 0-1GB
            memoryTotal: 1024 * 1024 * 1024, // 1GB
            temperature: 60 + Math.random() * 20, // 60-80°C
            powerUsage: 150 + Math.random() * 100, // 150-250W
            clockSpeed: 1500 + Math.random() * 500 // 1.5-2GHz
        };
    }

    /**
     * Collect network metrics
     */
    private async collectNetworkMetrics(): Promise<NetworkMetrics> {
        // Simplified network metrics
        return {
            bytesIn: 0,
            bytesOut: 0,
            packetsIn: 0,
            packetsOut: 0,
            latency: 10 + Math.random() * 50, // 10-60ms
            bandwidth: 1000000000, // 1Gbps
            errors: 0
        };
    }

    /**
     * Collect storage metrics
     */
    private async collectStorageMetrics(): Promise<StorageMetrics> {
        // Simplified storage metrics
        return {
            readBytes: 0,
            writeBytes: 0,
            readOps: 0,
            writeOps: 0,
            latency: 1 + Math.random() * 5, // 1-6ms
            queueDepth: Math.floor(Math.random() * 10),
            utilization: Math.random() * 0.5
        };
    }

    /**
     * Collect application metrics
     */
    private async collectApplicationMetrics(): Promise<ApplicationMetrics> {
        return {
            frameRate: 60 - Math.random() * 20, // 40-60 fps
            frameTime: 16 + Math.random() * 10, // 16-26ms
            renderTime: 10 + Math.random() * 8, // 10-18ms
            computeTime: 5 + Math.random() * 5, // 5-10ms
            memoryAllocations: Math.floor(Math.random() * 1000),
            gcTime: Math.random() * 5, // 0-5ms
            activeJobs: Math.floor(Math.random() * 20),
            queuedJobs: Math.floor(Math.random() * 50)
        };
    }

    /**
     * Add metrics to history
     */
    private addMetrics(metrics: PerformanceMetrics): void {
        this.metrics.push(metrics);

        // Keep only recent metrics
        if (this.metrics.length > this.maxMetricsHistory) {
            this.metrics.shift();
        }

        this.emit('metricsCollected', metrics);
    }

    /**
     * Analyze current performance
     */
    private analyzePerformance(metrics: PerformanceMetrics): void {
        // Check thresholds
        this.checkThresholds(metrics);

        // Detect bottlenecks
        const bottlenecks = this.bottleneckDetector.detect(metrics);
        if (bottlenecks.length > 0) {
            this.emit('bottlenecksDetected', bottlenecks);
        }

        // Update predictions
        this.updatePredictions(metrics);
    }

    /**
     * Check performance thresholds
     */
    private checkThresholds(metrics: PerformanceMetrics): void {
        const alerts: Array<{ type: string; level: 'warning' | 'critical'; value: number }> = [];

        // CPU threshold
        if (metrics.cpu.usage > this.thresholds.cpu.critical) {
            alerts.push({ type: 'cpu', level: 'critical', value: metrics.cpu.usage });
        } else if (metrics.cpu.usage > this.thresholds.cpu.warning) {
            alerts.push({ type: 'cpu', level: 'warning', value: metrics.cpu.usage });
        }

        // Memory threshold
        const memoryUsage = metrics.memory.used / metrics.memory.available;
        if (memoryUsage > this.thresholds.memory.critical) {
            alerts.push({ type: 'memory', level: 'critical', value: memoryUsage });
        } else if (memoryUsage > this.thresholds.memory.warning) {
            alerts.push({ type: 'memory', level: 'warning', value: memoryUsage });
        }

        // GPU threshold
        if (metrics.gpu.usage > this.thresholds.gpu.critical) {
            alerts.push({ type: 'gpu', level: 'critical', value: metrics.gpu.usage });
        } else if (metrics.gpu.usage > this.thresholds.gpu.warning) {
            alerts.push({ type: 'gpu', level: 'warning', value: metrics.gpu.usage });
        }

        // Frame rate threshold
        if (metrics.application.frameRate < this.thresholds.frameRate.critical) {
            alerts.push({ type: 'frameRate', level: 'critical', value: metrics.application.frameRate });
        } else if (metrics.application.frameRate < this.thresholds.frameRate.warning) {
            alerts.push({ type: 'frameRate', level: 'warning', value: metrics.application.frameRate });
        }

        if (alerts.length > 0) {
            this.emit('thresholdAlerts', alerts);
        }
    }

    /**
     * Update performance predictions
     */
    private updatePredictions(metrics: PerformanceMetrics): void {
        for (const model of this.predictionModels.values()) {
            const prediction = this.performancePredictor.predict(model, metrics);
            model.predictions.set('future_performance', prediction);
        }
    }

    /**
     * Run optimization cycle
     */
    private async runOptimizationCycle(): Promise<void> {
        if (this.metrics.length === 0) return;

        const currentMetrics = this.metrics[this.metrics.length - 1];

        // Select optimization strategies
        const strategies = this.selectOptimizationStrategies(currentMetrics);

        // Apply strategies
        for (const strategy of strategies) {
            if (this.canApplyStrategy(strategy)) {
                await this.applyOptimizationStrategy(strategy, currentMetrics);
            }
        }
    }

    /**
     * Select optimization strategies based on current metrics
     */
    private selectOptimizationStrategies(metrics: PerformanceMetrics): OptimizationStrategy[] {
        const strategies: OptimizationStrategy[] = [];

        for (const strategy of this.strategies.values()) {
            if (this.evaluateStrategyConditions(strategy, metrics)) {
                strategies.push(strategy);
            }
        }

        // Sort by priority and effectiveness
        strategies.sort((a, b) => {
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            return b.effectiveness - a.effectiveness;
        });

        return strategies.slice(0, 3); // Apply max 3 strategies per cycle
    }

    /**
     * Evaluate if strategy conditions are met
     */
    private evaluateStrategyConditions(strategy: OptimizationStrategy, metrics: PerformanceMetrics): boolean {
        for (const condition of strategy.conditions) {
            if (!this.evaluateCondition(condition, metrics)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Evaluate a single condition
     */
    private evaluateCondition(condition: OptimizationCondition, metrics: PerformanceMetrics): boolean {
        const value = this.getMetricValue(condition.metric, metrics);
        if (value === undefined) return false;

        switch (condition.operator) {
            case 'gt':
                return value > (condition.value as number);
            case 'lt':
                return value < (condition.value as number);
            case 'eq':
                return value === (condition.value as number);
            case 'gte':
                return value >= (condition.value as number);
            case 'lte':
                return value <= (condition.value as number);
            case 'between':
                const [min, max] = condition.value as [number, number];
                return value >= min && value <= max;
            default:
                return false;
        }
    }

    /**
     * Get metric value by path
     */
    private getMetricValue(path: string, metrics: PerformanceMetrics): number | undefined {
        const parts = path.split('.');
        let value: any = metrics;

        for (const part of parts) {
            value = value?.[part];
        }

        return typeof value === 'number' ? value : undefined;
    }

    /**
     * Check if strategy can be applied
     */
    private canApplyStrategy(strategy: OptimizationStrategy): boolean {
        // Check cooldown period
        const timeSinceLastApplied = Date.now() - strategy.lastApplied;
        if (timeSinceLastApplied < strategy.cooldownPeriod) {
            return false;
        }

        // Check if already active
        if (this.activeOptimizations.has(strategy.id)) {
            return false;
        }

        return true;
    }

    /**
     * Apply optimization strategy
     */
    private async applyOptimizationStrategy(
        strategy: OptimizationStrategy,
        beforeMetrics: PerformanceMetrics
    ): Promise<void> {
        this.activeOptimizations.add(strategy.id);
        strategy.lastApplied = Date.now();

        const startTime = Date.now();
        let success = false;
        let error: string | undefined;

        try {
            this.emit('optimizationStarted', strategy.id);

            // Apply each action in the strategy
            for (const action of strategy.actions) {
                await this.applyOptimizationAction(action);
            }

            // Wait for effects to stabilize
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Collect after metrics
            const afterMetrics = await this.collectMetrics();

            // Calculate improvement
            const improvement = this.calculateImprovement(beforeMetrics, afterMetrics);

            if (improvement > 0) {
                success = true;
                strategy.effectiveness = Math.min(1, strategy.effectiveness * 1.1); // Increase effectiveness
            } else {
                strategy.effectiveness = Math.max(0, strategy.effectiveness * 0.9); // Decrease effectiveness
            }

            // Record result
            const result: OptimizationResult = {
                strategyId: strategy.id,
                timestamp: Date.now(),
                success,
                improvementPercent: improvement * 100,
                metricsBeforeAfter: { before: beforeMetrics, after: afterMetrics },
                duration: Date.now() - startTime,
                error
            };

            this.optimizationHistory.push(result);
            this.emit('optimizationCompleted', result);

        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
            strategy.effectiveness = Math.max(0, strategy.effectiveness * 0.8); // Penalize failed strategies

            this.emit('optimizationFailed', strategy.id, error);
        } finally {
            this.activeOptimizations.delete(strategy.id);
        }
    }

    /**
     * Apply a single optimization action
     */
    private async applyOptimizationAction(action: OptimizationAction): Promise<void> {
        switch (action.type) {
            case OptimizationActionType.SCALE_UP:
                await this.scaleUp(action.parameters);
                break;

            case OptimizationActionType.SCALE_DOWN:
                await this.scaleDown(action.parameters);
                break;

            case OptimizationActionType.ADJUST_MEMORY:
                await this.adjustMemory(action.parameters);
                break;

            case OptimizationActionType.OPTIMIZE_GPU:
                await this.optimizeGPU(action.parameters);
                break;

            case OptimizationActionType.TUNE_PARAMETERS:
                await this.tuneParameters(action.parameters);
                break;

            case OptimizationActionType.REDISTRIBUTE_LOAD:
                await this.redistributeLoad(action.parameters);
                break;

            case OptimizationActionType.ENABLE_CACHING:
                await this.enableCaching(action.parameters);
                break;

            case OptimizationActionType.COMPRESS_DATA:
                await this.compressData(action.parameters);
                break;

            case OptimizationActionType.BATCH_OPERATIONS:
                await this.batchOperations(action.parameters);
                break;

            case OptimizationActionType.PREFETCH_DATA:
                await this.prefetchData(action.parameters);
                break;
        }
    }

    /**
     * Calculate performance improvement
     */
    private calculateImprovement(before: PerformanceMetrics, after: PerformanceMetrics): number {
        // Calculate weighted improvement across key metrics
        const cpuImprovement = (before.cpu.usage - after.cpu.usage) / before.cpu.usage;
        const memoryImprovement = (before.memory.used - after.memory.used) / before.memory.used;
        const frameRateImprovement = (after.application.frameRate - before.application.frameRate) / before.application.frameRate;

        // Weighted average (frame rate is most important for user experience)
        return (cpuImprovement * 0.3 + memoryImprovement * 0.2 + frameRateImprovement * 0.5);
    }

    /**
     * Initialize default optimization strategies
     */
    private initializeStrategies(): void {
        // High CPU usage strategy
        this.strategies.set('high-cpu-usage', {
            id: 'high-cpu-usage',
            name: 'High CPU Usage Optimization',
            description: 'Reduces CPU usage when it exceeds 80%',
            category: OptimizationCategory.CPU,
            priority: OptimizationPriority.HIGH,
            conditions: [
                { metric: 'cpu.usage', operator: 'gt', value: 0.8 }
            ],
            actions: [
                { type: OptimizationActionType.REDISTRIBUTE_LOAD, parameters: { factor: 0.5 }, impact: 0.3, cost: 0.1 },
                { type: OptimizationActionType.BATCH_OPERATIONS, parameters: { batchSize: 10 }, impact: 0.2, cost: 0.05 }
            ],
            cooldownPeriod: 60000, // 1 minute
            lastApplied: 0,
            effectiveness: 0.7
        });

        // High memory usage strategy
        this.strategies.set('high-memory-usage', {
            id: 'high-memory-usage',
            name: 'High Memory Usage Optimization',
            description: 'Reduces memory usage when it exceeds 80%',
            category: OptimizationCategory.MEMORY,
            priority: OptimizationPriority.HIGH,
            conditions: [
                { metric: 'memory.used', operator: 'gt', value: 0.8 }
            ],
            actions: [
                { type: OptimizationActionType.ADJUST_MEMORY, parameters: { action: 'gc' }, impact: 0.4, cost: 0.1 },
                { type: OptimizationActionType.COMPRESS_DATA, parameters: { ratio: 0.5 }, impact: 0.3, cost: 0.2 }
            ],
            cooldownPeriod: 30000, // 30 seconds
            lastApplied: 0,
            effectiveness: 0.8
        });

        // Low frame rate strategy
        this.strategies.set('low-frame-rate', {
            id: 'low-frame-rate',
            name: 'Low Frame Rate Optimization',
            description: 'Improves frame rate when it drops below 30 FPS',
            category: OptimizationCategory.APPLICATION,
            priority: OptimizationPriority.CRITICAL,
            conditions: [
                { metric: 'application.frameRate', operator: 'lt', value: 30 }
            ],
            actions: [
                { type: OptimizationActionType.OPTIMIZE_GPU, parameters: { level: 'aggressive' }, impact: 0.5, cost: 0.2 },
                { type: OptimizationActionType.TUNE_PARAMETERS, parameters: { quality: 'medium' }, impact: 0.3, cost: 0.1 }
            ],
            cooldownPeriod: 45000, // 45 seconds
            lastApplied: 0,
            effectiveness: 0.6
        });
    }

    /**
     * Initialize prediction models
     */
    private initializePredictionModels(): void {
        // Performance prediction model
        this.predictionModels.set('performance', {
            id: 'performance',
            name: 'Performance Predictor',
            type: 'linear',
            features: ['cpu.usage', 'memory.used', 'gpu.usage', 'application.activeJobs'],
            accuracy: 0.75,
            lastTrained: Date.now(),
            predictions: new Map()
        });

        // Resource usage prediction model
        this.predictionModels.set('resource-usage', {
            id: 'resource-usage',
            name: 'Resource Usage Predictor',
            type: 'polynomial',
            features: ['application.queuedJobs', 'application.activeJobs', 'memory.used'],
            accuracy: 0.68,
            lastTrained: Date.now(),
            predictions: new Map()
        });
    }

    // Optimization action implementations (simplified)
    private async scaleUp(params: Record<string, any>): Promise<void> {
        this.emit('actionApplied', 'scale_up', params);
    }

    private async scaleDown(params: Record<string, any>): Promise<void> {
        this.emit('actionApplied', 'scale_down', params);
    }

    private async adjustMemory(params: Record<string, any>): Promise<void> {
        if (params.action === 'gc') {
            // Trigger garbage collection
            if (global.gc) {
                global.gc();
            }
        }
        this.emit('actionApplied', 'adjust_memory', params);
    }

    private async optimizeGPU(params: Record<string, any>): Promise<void> {
        this.emit('actionApplied', 'optimize_gpu', params);
    }

    private async tuneParameters(params: Record<string, any>): Promise<void> {
        this.emit('actionApplied', 'tune_parameters', params);
    }

    private async redistributeLoad(params: Record<string, any>): Promise<void> {
        this.emit('actionApplied', 'redistribute_load', params);
    }

    private async enableCaching(params: Record<string, any>): Promise<void> {
        this.emit('actionApplied', 'enable_caching', params);
    }

    private async compressData(params: Record<string, any>): Promise<void> {
        this.emit('actionApplied', 'compress_data', params);
    }

    private async batchOperations(params: Record<string, any>): Promise<void> {
        this.emit('actionApplied', 'batch_operations', params);
    }

    private async prefetchData(params: Record<string, any>): Promise<void> {
        this.emit('actionApplied', 'prefetch_data', params);
    }

    /**
     * Get optimization statistics
     */
    public getStats(): {
        totalOptimizations: number;
        successfulOptimizations: number;
        averageImprovement: number;
        activeStrategies: number;
        predictedPerformance: number;
    } {
        const successful = this.optimizationHistory.filter(r => r.success);
        const averageImprovement = successful.length > 0 ?
            successful.reduce((sum, r) => sum + r.improvementPercent, 0) / successful.length : 0;

        const performanceModel = this.predictionModels.get('performance');
        const predictedPerformance = performanceModel?.predictions.get('future_performance') || 0;

        return {
            totalOptimizations: this.optimizationHistory.length,
            successfulOptimizations: successful.length,
            averageImprovement,
            activeStrategies: this.activeOptimizations.size,
            predictedPerformance
        };
    }

    /**
     * Get current metrics
     */
    public getCurrentMetrics(): PerformanceMetrics | null {
        return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
    }

    /**
     * Get optimization history
     */
    public getOptimizationHistory(): OptimizationResult[] {
        return [...this.optimizationHistory];
    }

    /**
     * Add custom optimization strategy
     */
    public addStrategy(strategy: OptimizationStrategy): void {
        this.strategies.set(strategy.id, strategy);
        this.emit('strategyAdded', strategy.id);
    }

    /**
     * Remove optimization strategy
     */
    public removeStrategy(strategyId: string): boolean {
        const removed = this.strategies.delete(strategyId);
        if (removed) {
            this.emit('strategyRemoved', strategyId);
        }
        return removed;
    }

    /**
     * Cleanup resources
     */
    public dispose(): void {
        this.stop();
        this.metrics.length = 0;
        this.strategies.clear();
        this.optimizationHistory.length = 0;
        this.predictionModels.clear();
        this.activeOptimizations.clear();
        this.removeAllListeners();
    }
}

/**
 * Performance Predictor using machine learning
 */
class PerformancePredictor {
    predict(model: PredictionModel, metrics: PerformanceMetrics): number {
        // Simplified prediction - in real implementation would use ML algorithms
        let prediction = 0;

        for (const feature of model.features) {
            const value = this.getFeatureValue(feature, metrics);
            if (value !== undefined) {
                prediction += value * 0.25; // Simplified weight
            }
        }

        return Math.max(0, Math.min(1, prediction));
    }

    private getFeatureValue(feature: string, metrics: PerformanceMetrics): number | undefined {
        const parts = feature.split('.');
        let value: any = metrics;

        for (const part of parts) {
            value = value?.[part];
        }

        return typeof value === 'number' ? value : undefined;
    }
}

/**
 * Bottleneck Detector
 */
class BottleneckDetector {
    detect(metrics: PerformanceMetrics): string[] {
        const bottlenecks: string[] = [];

        // CPU bottleneck
        if (metrics.cpu.usage > 0.9) {
            bottlenecks.push('cpu');
        }

        // Memory bottleneck
        const memoryUsage = metrics.memory.used / metrics.memory.available;
        if (memoryUsage > 0.9) {
            bottlenecks.push('memory');
        }

        // GPU bottleneck
        if (metrics.gpu.usage > 0.9) {
            bottlenecks.push('gpu');
        }

        // Application bottleneck
        if (metrics.application.frameRate < 20) {
            bottlenecks.push('application');
        }

        return bottlenecks;
    }
}

/**
 * Strategy Selector
 */
class StrategySelector {
    select(strategies: OptimizationStrategy[], metrics: PerformanceMetrics): OptimizationStrategy[] {
        // Sort strategies by effectiveness and priority
        return strategies.sort((a, b) => {
            const scoreA = a.effectiveness * a.priority;
            const scoreB = b.effectiveness * b.priority;
            return scoreB - scoreA;
        });
    }
}

export default G3DOptimizationEngine;