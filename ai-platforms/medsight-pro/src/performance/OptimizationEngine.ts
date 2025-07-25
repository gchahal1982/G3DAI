/**
 * G3D MedSight Pro - Optimization Engine
 * Intelligent optimization strategies for medical 3D applications
 */

export interface OptimizationConfig {
    enableAutoOptimization: boolean;
    optimizationInterval: number;
    performanceThresholds: PerformanceThresholds;
    medicalPriorityWeights: MedicalPriorityWeights;
    enableMachineLearning: boolean;
    enablePredictiveOptimization: boolean;
    maxOptimizationIterations: number;
}

export interface PerformanceThresholds {
    minFrameRate: number;
    maxFrameTime: number;
    maxMemoryUsage: number;
    maxGPUUtilization: number;
    maxCPUUtilization: number;
    maxNetworkLatency: number;
}

export interface MedicalPriorityWeights {
    emergency: number;
    critical: number;
    urgent: number;
    routine: number;
    diagnostic: number;
    therapeutic: number;
    research: number;
}

export interface OptimizationStrategy {
    id: string;
    name: string;
    category: 'rendering' | 'memory' | 'compute' | 'network' | 'medical';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    implementation: () => Promise<OptimizationResult>;
    conditions: OptimizationCondition[];
    estimatedImpact: number; // 0-100
    medicalSafety: 'safe' | 'caution' | 'risk';
}

export interface OptimizationCondition {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'ne';
    value: number;
    medicalContext?: string[];
}

export interface OptimizationResult {
    strategyId: string;
    success: boolean;
    performanceGain: number;
    memoryReduction: number;
    qualityImpact: number;
    medicalSafety: boolean;
    duration: number;
    error?: string;
}

export interface MedicalOptimizationContext {
    patientId: string;
    studyType: string;
    modality: string;
    urgency: 'routine' | 'urgent' | 'stat' | 'emergency';
    clinicalPurpose: 'diagnostic' | 'therapeutic' | 'research' | 'teaching';
    qualityRequirements: 'standard' | 'high' | 'ultra-high';
    timeConstraints: number; // milliseconds
}

export interface OptimizationPlan {
    id: string;
    strategies: OptimizationStrategy[];
    estimatedTotalImpact: number;
    estimatedDuration: number;
    medicalRiskAssessment: string;
    executionOrder: string[];
}

export class OptimizationEngine {
    private config: OptimizationConfig;
    private strategies: Map<string, OptimizationStrategy> = new Map();
    private optimizationHistory: OptimizationResult[] = [];
    private currentPlan: OptimizationPlan | null = null;
    private isOptimizing: boolean = false;
    private intervalId: number | null = null;

    private performanceData: any[] = [];
    private medicalContext: MedicalOptimizationContext | null = null;

    constructor(config: Partial<OptimizationConfig> = {}) {
        this.config = {
            enableAutoOptimization: true,
            optimizationInterval: 5000, // 5 seconds
            performanceThresholds: {
                minFrameRate: 30,
                maxFrameTime: 33.33, // ~30 FPS
                maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
                maxGPUUtilization: 85,
                maxCPUUtilization: 80,
                maxNetworkLatency: 100 // ms
            },
            medicalPriorityWeights: {
                emergency: 1.0,
                critical: 0.9,
                urgent: 0.7,
                routine: 0.5,
                diagnostic: 0.8,
                therapeutic: 0.9,
                research: 0.3
            },
            enableMachineLearning: false, // Disabled for MVP
            enablePredictiveOptimization: false,
            maxOptimizationIterations: 5,
            ...config
        };
    }

    async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D Optimization Engine...');

            // Initialize optimization strategies
            this.initializeOptimizationStrategies();

            // Start auto-optimization if enabled
            if (this.config.enableAutoOptimization) {
                this.startAutoOptimization();
            }

            console.log('G3D Optimization Engine initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Optimization Engine:', error);
            throw error;
        }
    }

    private initializeOptimizationStrategies(): void {
        // Rendering optimizations
        this.addStrategy({
            id: 'reduce_render_quality',
            name: 'Reduce Render Quality',
            category: 'rendering',
            priority: 'medium',
            description: 'Reduce rendering quality to improve performance',
            implementation: this.reduceRenderQuality.bind(this),
            conditions: [
                { metric: 'frameRate', operator: 'lt', value: this.config.performanceThresholds.minFrameRate }
            ],
            estimatedImpact: 40,
            medicalSafety: 'caution'
        });

        this.addStrategy({
            id: 'enable_lod',
            name: 'Enable Level of Detail',
            category: 'rendering',
            priority: 'high',
            description: 'Enable LOD system for distant objects',
            implementation: this.enableLevelOfDetail.bind(this),
            conditions: [
                { metric: 'frameTime', operator: 'gt', value: this.config.performanceThresholds.maxFrameTime }
            ],
            estimatedImpact: 35,
            medicalSafety: 'safe'
        });

        this.addStrategy({
            id: 'optimize_shaders',
            name: 'Optimize Shaders',
            category: 'rendering',
            priority: 'high',
            description: 'Switch to optimized shader variants',
            implementation: this.optimizeShaders.bind(this),
            conditions: [
                { metric: 'gpuUtilization', operator: 'gt', value: this.config.performanceThresholds.maxGPUUtilization }
            ],
            estimatedImpact: 30,
            medicalSafety: 'safe'
        });

        // Memory optimizations
        this.addStrategy({
            id: 'compress_textures',
            name: 'Compress Textures',
            category: 'memory',
            priority: 'medium',
            description: 'Apply texture compression to reduce memory usage',
            implementation: this.compressTextures.bind(this),
            conditions: [
                { metric: 'memoryUsage', operator: 'gt', value: this.config.performanceThresholds.maxMemoryUsage * 0.8 }
            ],
            estimatedImpact: 50,
            medicalSafety: 'caution'
        });

        this.addStrategy({
            id: 'enable_memory_pooling',
            name: 'Enable Memory Pooling',
            category: 'memory',
            priority: 'high',
            description: 'Enable memory pooling for better allocation',
            implementation: this.enableMemoryPooling.bind(this),
            conditions: [
                { metric: 'memoryFragmentation', operator: 'gt', value: 0.3 }
            ],
            estimatedImpact: 25,
            medicalSafety: 'safe'
        });

        this.addStrategy({
            id: 'garbage_collection',
            name: 'Force Garbage Collection',
            category: 'memory',
            priority: 'low',
            description: 'Force garbage collection to free memory',
            implementation: this.forceGarbageCollection.bind(this),
            conditions: [
                { metric: 'memoryUsage', operator: 'gt', value: this.config.performanceThresholds.maxMemoryUsage * 0.9 }
            ],
            estimatedImpact: 20,
            medicalSafety: 'safe'
        });

        // Compute optimizations
        this.addStrategy({
            id: 'enable_gpu_compute',
            name: 'Enable GPU Compute',
            category: 'compute',
            priority: 'high',
            description: 'Move computations to GPU',
            implementation: this.enableGPUCompute.bind(this),
            conditions: [
                { metric: 'cpuUtilization', operator: 'gt', value: this.config.performanceThresholds.maxCPUUtilization }
            ],
            estimatedImpact: 60,
            medicalSafety: 'safe'
        });

        this.addStrategy({
            id: 'optimize_algorithms',
            name: 'Optimize Algorithms',
            category: 'compute',
            priority: 'medium',
            description: 'Switch to optimized algorithm variants',
            implementation: this.optimizeAlgorithms.bind(this),
            conditions: [
                { metric: 'processingTime', operator: 'gt', value: 1000 }
            ],
            estimatedImpact: 45,
            medicalSafety: 'safe'
        });

        // Medical-specific optimizations
        this.addStrategy({
            id: 'prioritize_medical_data',
            name: 'Prioritize Medical Data',
            category: 'medical',
            priority: 'critical',
            description: 'Prioritize critical medical data processing',
            implementation: this.prioritizeMedicalData.bind(this),
            conditions: [
                { metric: 'medicalUrgency', operator: 'eq', value: 1, medicalContext: ['emergency', 'critical'] }
            ],
            estimatedImpact: 80,
            medicalSafety: 'safe'
        });

        this.addStrategy({
            id: 'adaptive_quality',
            name: 'Adaptive Quality Control',
            category: 'medical',
            priority: 'high',
            description: 'Adjust quality based on medical requirements',
            implementation: this.adaptiveQualityControl.bind(this),
            conditions: [
                { metric: 'qualityRequirement', operator: 'lt', value: 3 }
            ],
            estimatedImpact: 35,
            medicalSafety: 'caution'
        });

        console.log(`Initialized ${this.strategies.size} optimization strategies`);
    }

    private addStrategy(strategy: OptimizationStrategy): void {
        this.strategies.set(strategy.id, strategy);
    }

    // Strategy implementations
    private async reduceRenderQuality(): Promise<OptimizationResult> {
        const startTime = Date.now();

        try {
            // Simulate reducing render quality
            await new Promise(resolve => setTimeout(resolve, 100));

            return {
                strategyId: 'reduce_render_quality',
                success: true,
                performanceGain: 40,
                memoryReduction: 10,
                qualityImpact: -20,
                medicalSafety: this.medicalContext?.qualityRequirements !== 'ultra-high',
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                strategyId: 'reduce_render_quality',
                success: false,
                performanceGain: 0,
                memoryReduction: 0,
                qualityImpact: 0,
                medicalSafety: true,
                duration: Date.now() - startTime,
                error: (error as Error).message
            };
        }
    }

    private async enableLevelOfDetail(): Promise<OptimizationResult> {
        const startTime = Date.now();

        try {
            // Simulate enabling LOD
            await new Promise(resolve => setTimeout(resolve, 50));

            return {
                strategyId: 'enable_lod',
                success: true,
                performanceGain: 35,
                memoryReduction: 15,
                qualityImpact: -5,
                medicalSafety: true,
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                strategyId: 'enable_lod',
                success: false,
                performanceGain: 0,
                memoryReduction: 0,
                qualityImpact: 0,
                medicalSafety: true,
                duration: Date.now() - startTime,
                error: (error as Error).message
            };
        }
    }

    private async optimizeShaders(): Promise<OptimizationResult> {
        const startTime = Date.now();

        try {
            // Simulate shader optimization
            await new Promise(resolve => setTimeout(resolve, 200));

            return {
                strategyId: 'optimize_shaders',
                success: true,
                performanceGain: 30,
                memoryReduction: 5,
                qualityImpact: 0,
                medicalSafety: true,
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                strategyId: 'optimize_shaders',
                success: false,
                performanceGain: 0,
                memoryReduction: 0,
                qualityImpact: 0,
                medicalSafety: true,
                duration: Date.now() - startTime,
                error: (error as Error).message
            };
        }
    }

    private async compressTextures(): Promise<OptimizationResult> {
        const startTime = Date.now();

        try {
            // Simulate texture compression
            await new Promise(resolve => setTimeout(resolve, 300));

            return {
                strategyId: 'compress_textures',
                success: true,
                performanceGain: 15,
                memoryReduction: 50,
                qualityImpact: -10,
                medicalSafety: this.medicalContext?.qualityRequirements !== 'ultra-high',
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                strategyId: 'compress_textures',
                success: false,
                performanceGain: 0,
                memoryReduction: 0,
                qualityImpact: 0,
                medicalSafety: true,
                duration: Date.now() - startTime,
                error: (error as Error).message
            };
        }
    }

    private async enableMemoryPooling(): Promise<OptimizationResult> {
        const startTime = Date.now();

        try {
            // Simulate enabling memory pooling
            await new Promise(resolve => setTimeout(resolve, 150));

            return {
                strategyId: 'enable_memory_pooling',
                success: true,
                performanceGain: 25,
                memoryReduction: 25,
                qualityImpact: 0,
                medicalSafety: true,
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                strategyId: 'enable_memory_pooling',
                success: false,
                performanceGain: 0,
                memoryReduction: 0,
                qualityImpact: 0,
                medicalSafety: true,
                duration: Date.now() - startTime,
                error: (error as Error).message
            };
        }
    }

    private async forceGarbageCollection(): Promise<OptimizationResult> {
        const startTime = Date.now();

        try {
            // Simulate garbage collection
            if (window.gc) {
                window.gc();
            }
            await new Promise(resolve => setTimeout(resolve, 100));

            return {
                strategyId: 'garbage_collection',
                success: true,
                performanceGain: 10,
                memoryReduction: 20,
                qualityImpact: 0,
                medicalSafety: true,
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                strategyId: 'garbage_collection',
                success: false,
                performanceGain: 0,
                memoryReduction: 0,
                qualityImpact: 0,
                medicalSafety: true,
                duration: Date.now() - startTime,
                error: (error as Error).message
            };
        }
    }

    private async enableGPUCompute(): Promise<OptimizationResult> {
        const startTime = Date.now();

        try {
            // Simulate enabling GPU compute
            await new Promise(resolve => setTimeout(resolve, 250));

            return {
                strategyId: 'enable_gpu_compute',
                success: true,
                performanceGain: 60,
                memoryReduction: 0,
                qualityImpact: 0,
                medicalSafety: true,
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                strategyId: 'enable_gpu_compute',
                success: false,
                performanceGain: 0,
                memoryReduction: 0,
                qualityImpact: 0,
                medicalSafety: true,
                duration: Date.now() - startTime,
                error: (error as Error).message
            };
        }
    }

    private async optimizeAlgorithms(): Promise<OptimizationResult> {
        const startTime = Date.now();

        try {
            // Simulate algorithm optimization
            await new Promise(resolve => setTimeout(resolve, 200));

            return {
                strategyId: 'optimize_algorithms',
                success: true,
                performanceGain: 45,
                memoryReduction: 10,
                qualityImpact: 0,
                medicalSafety: true,
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                strategyId: 'optimize_algorithms',
                success: false,
                performanceGain: 0,
                memoryReduction: 0,
                qualityImpact: 0,
                medicalSafety: true,
                duration: Date.now() - startTime,
                error: (error as Error).message
            };
        }
    }

    private async prioritizeMedicalData(): Promise<OptimizationResult> {
        const startTime = Date.now();

        try {
            // Simulate medical data prioritization
            await new Promise(resolve => setTimeout(resolve, 100));

            return {
                strategyId: 'prioritize_medical_data',
                success: true,
                performanceGain: 80,
                memoryReduction: 0,
                qualityImpact: 10,
                medicalSafety: true,
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                strategyId: 'prioritize_medical_data',
                success: false,
                performanceGain: 0,
                memoryReduction: 0,
                qualityImpact: 0,
                medicalSafety: true,
                duration: Date.now() - startTime,
                error: (error as Error).message
            };
        }
    }

    private async adaptiveQualityControl(): Promise<OptimizationResult> {
        const startTime = Date.now();

        try {
            // Simulate adaptive quality control
            await new Promise(resolve => setTimeout(resolve, 150));

            const qualityImpact = this.medicalContext?.qualityRequirements === 'standard' ? -15 : -30;

            return {
                strategyId: 'adaptive_quality',
                success: true,
                performanceGain: 35,
                memoryReduction: 20,
                qualityImpact,
                medicalSafety: this.medicalContext?.clinicalPurpose !== 'diagnostic',
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                strategyId: 'adaptive_quality',
                success: false,
                performanceGain: 0,
                memoryReduction: 0,
                qualityImpact: 0,
                medicalSafety: true,
                duration: Date.now() - startTime,
                error: (error as Error).message
            };
        }
    }

    // Optimization planning and execution
    public async createOptimizationPlan(performanceMetrics: any): Promise<OptimizationPlan> {
        const applicableStrategies: OptimizationStrategy[] = [];

        // Find applicable strategies based on current conditions
        for (const strategy of this.strategies.values()) {
            if (this.evaluateConditions(strategy.conditions, performanceMetrics)) {
                // Check medical safety
                if (this.isMedicallySafe(strategy)) {
                    applicableStrategies.push(strategy);
                }
            }
        }

        // Sort strategies by priority and impact
        applicableStrategies.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority];
            const bPriority = priorityOrder[b.priority];

            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }

            return b.estimatedImpact - a.estimatedImpact;
        });

        // Calculate total impact and duration
        const totalImpact = applicableStrategies.reduce((sum, strategy) => sum + strategy.estimatedImpact, 0);
        const estimatedDuration = applicableStrategies.length * 200; // 200ms per strategy

        // Create execution order
        const executionOrder = applicableStrategies.map(strategy => strategy.id);

        const plan: OptimizationPlan = {
            id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            strategies: applicableStrategies,
            estimatedTotalImpact: Math.min(100, totalImpact),
            estimatedDuration,
            medicalRiskAssessment: this.assessMedicalRisk(applicableStrategies),
            executionOrder
        };

        return plan;
    }

    private evaluateConditions(conditions: OptimizationCondition[], metrics: any): boolean {
        for (const condition of conditions) {
            const value = metrics[condition.metric];
            if (value === undefined) continue;

            let conditionMet = false;
            switch (condition.operator) {
                case 'gt': conditionMet = value > condition.value; break;
                case 'lt': conditionMet = value < condition.value; break;
                case 'eq': conditionMet = value === condition.value; break;
                case 'gte': conditionMet = value >= condition.value; break;
                case 'lte': conditionMet = value <= condition.value; break;
                case 'ne': conditionMet = value !== condition.value; break;
            }

            if (!conditionMet) return false;

            // Check medical context if specified
            if (condition.medicalContext && this.medicalContext) {
                const contextMatch = condition.medicalContext.some(ctx =>
                    this.medicalContext!.urgency === ctx ||
                    this.medicalContext!.clinicalPurpose === ctx
                );
                if (!contextMatch) return false;
            }
        }

        return true;
    }

    private isMedicallySafe(strategy: OptimizationStrategy): boolean {
        if (!this.medicalContext) return true;

        // Critical medical contexts require safer strategies
        if (this.medicalContext.urgency === 'emergency' || this.medicalContext.urgency === 'stat') {
            return strategy.medicalSafety === 'safe';
        }

        // Diagnostic purposes require higher quality
        if (this.medicalContext.clinicalPurpose === 'diagnostic' &&
            this.medicalContext.qualityRequirements === 'ultra-high') {
            return strategy.medicalSafety === 'safe';
        }

        return strategy.medicalSafety !== 'risk';
    }

    private assessMedicalRisk(strategies: OptimizationStrategy[]): string {
        const riskStrategies = strategies.filter(s => s.medicalSafety === 'risk').length;
        const cautionStrategies = strategies.filter(s => s.medicalSafety === 'caution').length;

        if (riskStrategies > 0) {
            return 'HIGH RISK: Contains strategies that may affect medical accuracy';
        } else if (cautionStrategies > 0) {
            return 'MEDIUM RISK: Contains strategies that may reduce visual quality';
        } else {
            return 'LOW RISK: All strategies are medically safe';
        }
    }

    public async executeOptimizationPlan(plan: OptimizationPlan): Promise<OptimizationResult[]> {
        if (this.isOptimizing) {
            throw new Error('Optimization already in progress');
        }

        this.isOptimizing = true;
        this.currentPlan = plan;
        const results: OptimizationResult[] = [];

        try {
            console.log(`Executing optimization plan: ${plan.id}`);

            for (const strategyId of plan.executionOrder) {
                const strategy = this.strategies.get(strategyId);
                if (!strategy) continue;

                console.log(`Executing strategy: ${strategy.name}`);
                const result = await strategy.implementation();
                results.push(result);

                // Add to history
                this.optimizationHistory.push(result);

                // Stop if strategy failed critically
                if (!result.success && strategy.priority === 'critical') {
                    console.warn(`Critical strategy failed: ${strategy.name}`);
                    break;
                }
            }

            console.log(`Optimization plan completed. ${results.length} strategies executed.`);
        } catch (error) {
            console.error('Optimization plan execution failed:', error);
        } finally {
            this.isOptimizing = false;
            this.currentPlan = null;
        }

        return results;
    }

    // Auto-optimization
    private startAutoOptimization(): void {
        this.intervalId = window.setInterval(() => {
            this.performAutoOptimization();
        }, this.config.optimizationInterval);

        console.log('Auto-optimization started');
    }

    private async performAutoOptimization(): Promise<void> {
        if (this.isOptimizing) return;

        try {
            // Get current performance metrics (would come from performance monitor)
            const metrics = this.getCurrentPerformanceMetrics();

            // Create optimization plan
            const plan = await this.createOptimizationPlan(metrics);

            // Execute plan if strategies are available
            if (plan.strategies.length > 0) {
                console.log(`Auto-optimization: executing ${plan.strategies.length} strategies`);
                await this.executeOptimizationPlan(plan);
            }
        } catch (error) {
            console.error('Auto-optimization failed:', error);
        }
    }

    private getCurrentPerformanceMetrics(): any {
        // This would integrate with the performance monitor
        // For now, return mock data
        return {
            frameRate: 25 + Math.random() * 30,
            frameTime: 20 + Math.random() * 30,
            memoryUsage: 800 * 1024 * 1024 + Math.random() * 500 * 1024 * 1024,
            gpuUtilization: 60 + Math.random() * 30,
            cpuUtilization: 50 + Math.random() * 40,
            networkLatency: 50 + Math.random() * 100,
            memoryFragmentation: Math.random() * 0.5
        };
    }

    // Public API
    public setMedicalContext(context: MedicalOptimizationContext): void {
        this.medicalContext = context;
        console.log(`Medical context updated: ${context.urgency} ${context.clinicalPurpose}`);
    }

    public async optimizeForMedicalContext(
        context: MedicalOptimizationContext,
        performanceMetrics: any
    ): Promise<OptimizationResult[]> {
        this.setMedicalContext(context);

        const plan = await this.createOptimizationPlan(performanceMetrics);
        return await this.executeOptimizationPlan(plan);
    }

    public getOptimizationHistory(): OptimizationResult[] {
        return [...this.optimizationHistory];
    }

    public getAvailableStrategies(): OptimizationStrategy[] {
        return Array.from(this.strategies.values());
    }

    public getCurrentPlan(): OptimizationPlan | null {
        return this.currentPlan;
    }

    public isOptimizationInProgress(): boolean {
        return this.isOptimizing;
    }

    public stopAutoOptimization(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('Auto-optimization stopped');
        }
    }

    public enableAutoOptimization(): void {
        if (!this.intervalId) {
            this.startAutoOptimization();
        }
    }

    public clearOptimizationHistory(): void {
        this.optimizationHistory = [];
    }

    public getOptimizationStats(): {
        totalOptimizations: number;
        successRate: number;
        averagePerformanceGain: number;
        averageMemoryReduction: number;
        averageQualityImpact: number;
    } {
        const history = this.optimizationHistory;
        const successful = history.filter(r => r.success);

        return {
            totalOptimizations: history.length,
            successRate: history.length > 0 ? successful.length / history.length : 0,
            averagePerformanceGain: successful.length > 0 ?
                successful.reduce((sum, r) => sum + r.performanceGain, 0) / successful.length : 0,
            averageMemoryReduction: successful.length > 0 ?
                successful.reduce((sum, r) => sum + r.memoryReduction, 0) / successful.length : 0,
            averageQualityImpact: successful.length > 0 ?
                successful.reduce((sum, r) => sum + r.qualityImpact, 0) / successful.length : 0
        };
    }

    public dispose(): void {
        console.log('Disposing G3D Optimization Engine...');

        this.stopAutoOptimization();

        this.strategies.clear();
        this.optimizationHistory = [];
        this.currentPlan = null;
        this.isOptimizing = false;
        this.performanceData = [];
        this.medicalContext = null;

        console.log('G3D Optimization Engine disposed');
    }
}

// Extend Window interface for gc function
declare global {
    interface Window {
        gc?: () => void;
    }
}

export default OptimizationEngine;