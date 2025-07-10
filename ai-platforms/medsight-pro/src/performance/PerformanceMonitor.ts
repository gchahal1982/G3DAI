/**
 * G3D MedSight Pro - Performance Monitoring System
 * Comprehensive performance tracking and optimization for medical applications
 */

export interface PerformanceConfig {
    enableGPUProfiling: boolean;
    enableCPUProfiling: boolean;
    enableMemoryTracking: boolean;
    enableNetworkMonitoring: boolean;
    samplingInterval: number;
    maxHistorySize: number;
    enableAutoOptimization: boolean;
    performanceTargets: PerformanceTargets;
}

export interface PerformanceTargets {
    targetFPS: number;
    maxFrameTime: number;
    maxMemoryUsage: number;
    maxGPUUtilization: number;
    maxCPUUtilization: number;
}

export interface PerformanceMetrics {
    timestamp: number;
    frameRate: number;
    frameTime: number;
    cpuUsage: number;
    memoryUsage: number;
    gpuUtilization: number;
    renderTime: number;
    computeTime: number;
    networkLatency: number;
    medicalOperationTime: number;
}

export interface MedicalPerformanceContext {
    operationType: 'rendering' | 'segmentation' | 'registration' | 'measurement' | 'analysis';
    modality: string;
    dataSize: number;
    complexity: 'low' | 'medium' | 'high' | 'critical';
    priority: number;
    clinicalRelevance: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceAlert {
    id: string;
    type: 'warning' | 'error' | 'critical';
    message: string;
    metric: keyof PerformanceMetrics;
    threshold: number;
    currentValue: number;
    timestamp: number;
    medicalContext?: MedicalPerformanceContext;
    suggestions: string[];
}

export interface OptimizationRecommendation {
    id: string;
    category: 'rendering' | 'compute' | 'memory' | 'network' | 'medical';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    implementation: string;
    estimatedImprovement: number;
}

export class PerformanceMonitor {
    private config: PerformanceConfig;
    private isRunning: boolean = false;
    private metricsHistory: PerformanceMetrics[] = [];
    private currentMetrics: PerformanceMetrics;
    private alerts: PerformanceAlert[] = [];
    private recommendations: OptimizationRecommendation[] = [];

    private performanceObserver: PerformanceObserver | null = null;
    private intervalId: number | null = null;
    private frameCount: number = 0;
    private lastFrameTime: number = 0;
    private medicalOperationStack: MedicalPerformanceContext[] = [];

    constructor(config: Partial<PerformanceConfig> = {}) {
        this.config = {
            enableGPUProfiling: true,
            enableCPUProfiling: true,
            enableMemoryTracking: true,
            enableNetworkMonitoring: true,
            samplingInterval: 1000, // 1 second
            maxHistorySize: 3600, // 1 hour of data
            enableAutoOptimization: false,
            performanceTargets: {
                targetFPS: 60,
                maxFrameTime: 16.67, // ~60 FPS
                maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
                maxGPUUtilization: 80,
                maxCPUUtilization: 70
            },
            ...config
        };

        this.currentMetrics = this.createEmptyMetrics();
    }

    async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D Performance Monitor...');

            // Initialize Performance Observer
            if ('PerformanceObserver' in window) {
                this.performanceObserver = new PerformanceObserver((list) => {
                    this.handlePerformanceEntries(list.getEntries());
                });

                this.performanceObserver.observe({
                    entryTypes: ['measure', 'navigation', 'resource', 'paint']
                });
            }

            console.log('G3D Performance Monitor initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Performance Monitor:', error);
            throw error;
        }
    }

    public start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastFrameTime = Date.now();

        // Start monitoring interval
        this.intervalId = window.setInterval(() => {
            this.collectMetrics();
        }, this.config.samplingInterval);

        // Start frame monitoring
        this.startFrameMonitoring();

        console.log('Performance monitoring started');
    }

    public stop(): void {
        if (!this.isRunning) return;

        this.isRunning = false;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        console.log('Performance monitoring stopped');
    }

    private startFrameMonitoring(): void {
        const frameCallback = (timestamp: number) => {
            if (!this.isRunning) return;

            const frameTime = timestamp - this.lastFrameTime;
            this.lastFrameTime = timestamp;
            this.frameCount++;

            // Update frame metrics
            this.currentMetrics.frameTime = frameTime;
            this.currentMetrics.frameRate = 1000 / frameTime;

            // Check for performance issues
            this.checkPerformanceThresholds();

            requestAnimationFrame(frameCallback);
        };

        requestAnimationFrame(frameCallback);
    }

    private async collectMetrics(): Promise<void> {
        const timestamp = Date.now();

        // Collect CPU metrics
        const cpuUsage = await this.getCPUUsage();

        // Collect memory metrics
        const memoryUsage = this.getMemoryUsage();

        // Collect GPU metrics (if available)
        const gpuUtilization = await this.getGPUUtilization();

        // Collect network metrics
        const networkLatency = await this.getNetworkLatency();

        // Update current metrics
        this.currentMetrics = {
            timestamp,
            frameRate: this.currentMetrics.frameRate,
            frameTime: this.currentMetrics.frameTime,
            cpuUsage,
            memoryUsage,
            gpuUtilization,
            renderTime: this.currentMetrics.renderTime,
            computeTime: this.currentMetrics.computeTime,
            networkLatency,
            medicalOperationTime: this.currentMetrics.medicalOperationTime
        };

        // Add to history
        this.metricsHistory.push({ ...this.currentMetrics });

        // Trim history if needed
        if (this.metricsHistory.length > this.config.maxHistorySize) {
            this.metricsHistory.shift();
        }

        // Generate recommendations if auto-optimization is enabled
        if (this.config.enableAutoOptimization) {
            this.generateOptimizationRecommendations();
        }
    }

    private async getCPUUsage(): Promise<number> {
        // Simplified CPU usage estimation
        // In a real implementation, this would use more sophisticated methods
        const start = Date.now();

        // Perform a small computational task
        let sum = 0;
        for (let i = 0; i < 10000; i++) {
            sum += Math.random();
        }

        const duration = Date.now() - start;

        // Estimate CPU usage based on task duration
        return Math.min(100, duration * 10);
    }

    private getMemoryUsage(): number {
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            return memory.usedJSHeapSize;
        }

        // Fallback estimation
        return 0;
    }

    private async getGPUUtilization(): Promise<number> {
        // GPU utilization would require WebGPU or specialized APIs
        // This is a placeholder implementation
        return Math.random() * 100;
    }

    private async getNetworkLatency(): Promise<number> {
        try {
            const start = Date.now();
            await fetch('/api/ping', { method: 'HEAD' });
            return Date.now() - start;
        } catch {
            return 0;
        }
    }

    private handlePerformanceEntries(entries: PerformanceEntry[]): void {
        for (const entry of entries) {
            switch (entry.entryType) {
                case 'measure':
                    this.handleMeasureEntry(entry as PerformanceMeasure);
                    break;
                case 'navigation':
                    this.handleNavigationEntry(entry as PerformanceNavigationTiming);
                    break;
                case 'resource':
                    this.handleResourceEntry(entry as PerformanceResourceTiming);
                    break;
                case 'paint':
                    this.handlePaintEntry(entry as PerformancePaintTiming);
                    break;
            }
        }
    }

    private handleMeasureEntry(entry: PerformanceMeasure): void {
        // Handle custom performance measurements
        if (entry.name.startsWith('g3d-render')) {
            this.currentMetrics.renderTime = entry.duration;
        } else if (entry.name.startsWith('g3d-compute')) {
            this.currentMetrics.computeTime = entry.duration;
        } else if (entry.name.startsWith('g3d-medical')) {
            this.currentMetrics.medicalOperationTime = entry.duration;
        }
    }

    private handleNavigationEntry(entry: PerformanceNavigationTiming): void {
        // Handle navigation timing
        const loadTime = entry.loadEventEnd - entry.fetchStart;
        console.log(`Page load time: ${loadTime}ms`);
    }

    private handleResourceEntry(entry: PerformanceResourceTiming): void {
        // Handle resource loading timing
        if (entry.name.includes('medical') || entry.name.includes('dicom')) {
            const loadTime = entry.responseEnd - entry.requestStart;
            console.log(`Medical resource load time: ${loadTime}ms for ${entry.name}`);
        }
    }

    private handlePaintEntry(entry: PerformancePaintTiming): void {
        // Handle paint timing
        console.log(`${entry.name}: ${entry.startTime}ms`);
    }

    private checkPerformanceThresholds(): void {
        const targets = this.config.performanceTargets;
        const metrics = this.currentMetrics;

        // Check frame rate
        if (metrics.frameRate < targets.targetFPS * 0.8) {
            this.createAlert('warning', 'Low frame rate detected', 'frameRate', targets.targetFPS, metrics.frameRate, [
                'Reduce rendering quality',
                'Enable LOD system',
                'Optimize shaders'
            ]);
        }

        // Check frame time
        if (metrics.frameTime > targets.maxFrameTime * 1.5) {
            this.createAlert('error', 'High frame time detected', 'frameTime', targets.maxFrameTime, metrics.frameTime, [
                'Profile rendering pipeline',
                'Reduce polygon count',
                'Optimize compute shaders'
            ]);
        }

        // Check memory usage
        if (metrics.memoryUsage > targets.maxMemoryUsage) {
            this.createAlert('critical', 'High memory usage detected', 'memoryUsage', targets.maxMemoryUsage, metrics.memoryUsage, [
                'Clear unused textures',
                'Implement memory pooling',
                'Reduce texture resolution'
            ]);
        }

        // Check GPU utilization
        if (metrics.gpuUtilization > targets.maxGPUUtilization) {
            this.createAlert('warning', 'High GPU utilization detected', 'gpuUtilization', targets.maxGPUUtilization, metrics.gpuUtilization, [
                'Reduce shader complexity',
                'Implement GPU-based culling',
                'Optimize compute kernels'
            ]);
        }

        // Check CPU utilization
        if (metrics.cpuUsage > targets.maxCPUUtilization) {
            this.createAlert('warning', 'High CPU utilization detected', 'cpuUsage', targets.maxCPUUtilization, metrics.cpuUsage, [
                'Move computations to GPU',
                'Implement worker threads',
                'Optimize algorithms'
            ]);
        }
    }

    private createAlert(
        type: 'warning' | 'error' | 'critical',
        message: string,
        metric: keyof PerformanceMetrics,
        threshold: number,
        currentValue: number,
        suggestions: string[]
    ): void {
        const alert: PerformanceAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            message,
            metric,
            threshold,
            currentValue,
            timestamp: Date.now(),
            suggestions
        };

        // Add medical context if available
        if (this.medicalOperationStack.length > 0) {
            alert.medicalContext = this.medicalOperationStack[this.medicalOperationStack.length - 1];
        }

        this.alerts.push(alert);

        // Limit alert history
        if (this.alerts.length > 100) {
            this.alerts.shift();
        }

        console.warn(`Performance Alert [${type}]: ${message}`, alert);
    }

    private generateOptimizationRecommendations(): void {
        const metrics = this.currentMetrics;
        const targets = this.config.performanceTargets;

        // Clear old recommendations
        this.recommendations = [];

        // Frame rate optimization
        if (metrics.frameRate < targets.targetFPS) {
            this.recommendations.push({
                id: 'framerate_optimization',
                category: 'rendering',
                priority: 'high',
                description: 'Optimize rendering pipeline for better frame rate',
                impact: 'Improved user experience and smoother interactions',
                implementation: 'Implement LOD system, reduce draw calls, optimize shaders',
                estimatedImprovement: 30
            });
        }

        // Memory optimization
        if (metrics.memoryUsage > targets.maxMemoryUsage * 0.8) {
            this.recommendations.push({
                id: 'memory_optimization',
                category: 'memory',
                priority: 'medium',
                description: 'Reduce memory usage to prevent out-of-memory errors',
                impact: 'Prevent crashes and improve stability',
                implementation: 'Implement texture compression, memory pooling, and garbage collection optimization',
                estimatedImprovement: 25
            });
        }

        // GPU optimization
        if (metrics.gpuUtilization > targets.maxGPUUtilization * 0.9) {
            this.recommendations.push({
                id: 'gpu_optimization',
                category: 'compute',
                priority: 'high',
                description: 'Optimize GPU utilization for better performance',
                impact: 'Reduced GPU bottlenecks and improved parallel processing',
                implementation: 'Optimize compute shaders, implement GPU-based culling, reduce shader complexity',
                estimatedImprovement: 35
            });
        }

        // Medical-specific optimizations
        if (this.medicalOperationStack.length > 0) {
            const context = this.medicalOperationStack[this.medicalOperationStack.length - 1];

            if (context.complexity === 'high' || context.complexity === 'critical') {
                this.recommendations.push({
                    id: 'medical_optimization',
                    category: 'medical',
                    priority: context.clinicalRelevance === 'critical' ? 'critical' : 'high',
                    description: `Optimize ${context.operationType} for ${context.modality} data`,
                    impact: 'Faster medical analysis and improved clinical workflow',
                    implementation: 'Implement specialized algorithms, use GPU acceleration, optimize data structures',
                    estimatedImprovement: 40
                });
            }
        }
    }

    // Medical Operation Tracking
    public startMedicalOperation(context: MedicalPerformanceContext): string {
        const operationId = `medical_op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.medicalOperationStack.push(context);

        // Start performance measurement
        performance.mark(`g3d-medical-${operationId}-start`);

        return operationId;
    }

    public endMedicalOperation(operationId: string): void {
        if (this.medicalOperationStack.length > 0) {
            this.medicalOperationStack.pop();
        }

        // End performance measurement
        performance.mark(`g3d-medical-${operationId}-end`);
        performance.measure(
            `g3d-medical-${operationId}`,
            `g3d-medical-${operationId}-start`,
            `g3d-medical-${operationId}-end`
        );
    }

    // Public API
    public getCurrentMetrics(): PerformanceMetrics {
        return { ...this.currentMetrics };
    }

    public getMetricsHistory(duration?: number): PerformanceMetrics[] {
        if (!duration) {
            return [...this.metricsHistory];
        }

        const cutoff = Date.now() - duration;
        return this.metricsHistory.filter(metric => metric.timestamp >= cutoff);
    }

    public getAlerts(severity?: 'warning' | 'error' | 'critical'): PerformanceAlert[] {
        if (!severity) {
            return [...this.alerts];
        }

        return this.alerts.filter(alert => alert.type === severity);
    }

    public getRecommendations(category?: string): OptimizationRecommendation[] {
        if (!category) {
            return [...this.recommendations];
        }

        return this.recommendations.filter(rec => rec.category === category);
    }

    public clearAlerts(): void {
        this.alerts = [];
    }

    public getPerformanceSummary(): {
        averageFrameRate: number;
        averageFrameTime: number;
        averageMemoryUsage: number;
        peakMemoryUsage: number;
        alertCount: number;
        recommendationCount: number;
    } {
        if (this.metricsHistory.length === 0) {
            return {
                averageFrameRate: 0,
                averageFrameTime: 0,
                averageMemoryUsage: 0,
                peakMemoryUsage: 0,
                alertCount: this.alerts.length,
                recommendationCount: this.recommendations.length
            };
        }

        const history = this.metricsHistory;
        const averageFrameRate = history.reduce((sum, m) => sum + m.frameRate, 0) / history.length;
        const averageFrameTime = history.reduce((sum, m) => sum + m.frameTime, 0) / history.length;
        const averageMemoryUsage = history.reduce((sum, m) => sum + m.memoryUsage, 0) / history.length;
        const peakMemoryUsage = Math.max(...history.map(m => m.memoryUsage));

        return {
            averageFrameRate,
            averageFrameTime,
            averageMemoryUsage,
            peakMemoryUsage,
            alertCount: this.alerts.length,
            recommendationCount: this.recommendations.length
        };
    }

    public exportMetrics(): string {
        return JSON.stringify({
            config: this.config,
            currentMetrics: this.currentMetrics,
            metricsHistory: this.metricsHistory,
            alerts: this.alerts,
            recommendations: this.recommendations,
            summary: this.getPerformanceSummary(),
            exportTimestamp: new Date().toISOString()
        }, null, 2);
    }

    private createEmptyMetrics(): PerformanceMetrics {
        return {
            timestamp: 0,
            frameRate: 0,
            frameTime: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            gpuUtilization: 0,
            renderTime: 0,
            computeTime: 0,
            networkLatency: 0,
            medicalOperationTime: 0
        };
    }

    public dispose(): void {
        this.stop();

        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
            this.performanceObserver = null;
        }

        this.metricsHistory = [];
        this.alerts = [];
        this.recommendations = [];
        this.medicalOperationStack = [];

        console.log('G3D Performance Monitor disposed');
    }
}

export default PerformanceMonitor;