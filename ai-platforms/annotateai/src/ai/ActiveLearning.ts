/**
 * G3D AnnotateAI - Active Learning System
 * Intelligent sample selection for annotation optimization
 * Uncertainty-based sampling and active learning strategies
 */

import { ModelRunner } from './ModelRunner';
import { ComputeShaders } from './ComputeShaders';

export interface ActiveLearningConfig {
    strategy: SamplingStrategy;
    batchSize: number;
    uncertaintyThreshold: number;
    diversityWeight: number;
    modelEnsemble: ModelEnsembleConfig;
    iterativeConfig: IterativeConfig;
    budgetConstraints: BudgetConstraints;
    qualityMetrics: QualityMetrics;
    enableGPUAcceleration?: boolean;
}

export type SamplingStrategy =
    | 'uncertainty' | 'diversity' | 'hybrid' | 'entropy' | 'margin'
    | 'least_confidence' | 'committee_disagreement' | 'query_by_committee'
    | 'expected_model_change' | 'variance_reduction' | 'information_density';

export interface ModelEnsembleConfig {
    models: ModelConfig[];
    votingStrategy: 'majority' | 'weighted' | 'soft' | 'stacking';
    disagreementThreshold: number;
    confidenceAggregation: 'mean' | 'max' | 'min' | 'weighted_mean';
}

export interface ModelConfig {
    id: string;
    type: 'classification' | 'regression' | 'segmentation' | 'detection';
    weight: number;
    uncertaintyMethod: UncertaintyMethod;
    enabled: boolean;
}

export type UncertaintyMethod =
    | 'entropy' | 'variance' | 'mutual_information' | 'epistemic'
    | 'aleatoric' | 'predictive_variance' | 'monte_carlo_dropout';

export interface IterativeConfig {
    maxIterations: number;
    convergenceThreshold: number;
    retrainingFrequency: number;
    validationSplit: number;
    earlyStoppingPatience: number;
}

export interface BudgetConstraints {
    maxSamples: number;
    maxAnnotationCost: number;
    timeConstraints: TimeConstraints;
    resourceLimits: ResourceLimits;
}

export interface TimeConstraints {
    maxIterationTime: number;
    totalTimeLimit: number;
    annotationTimePerSample: number;
}

export interface ResourceLimits {
    maxMemoryUsage: number;
    maxGPUMemory: number;
    maxCPUCores: number;
    maxNetworkBandwidth: number;
}

export interface QualityMetrics {
    targetAccuracy: number;
    minPrecision: number;
    minRecall: number;
    maxFalsePositiveRate: number;
    convergenceMetrics: ConvergenceMetrics;
}

export interface ConvergenceMetrics {
    accuracyThreshold: number;
    lossThreshold: number;
    stabilityWindow: number;
    improvementThreshold: number;
}

export interface SampleCandidate {
    id: string;
    data: any;
    features: Float32Array;
    metadata: SampleMetadata;
    uncertaintyScore: number;
    diversityScore: number;
    combinedScore: number;
    predictions: ModelPrediction[];
}

export interface SampleMetadata {
    source: string;
    timestamp: Date;
    difficulty: 'easy' | 'medium' | 'hard' | 'unknown';
    domain: string;
    tags: string[];
    cost: number;
}

export interface ModelPrediction {
    modelId: string;
    prediction: any;
    confidence: number;
    uncertainty: number;
    features: Float32Array;
}

export interface ActiveLearningResult {
    selectedSamples: SampleCandidate[];
    iterationMetrics: IterationMetrics;
    modelPerformance: ModelPerformance;
    recommendations: string[];
    nextIterationConfig: Partial<ActiveLearningConfig>;
}

export interface IterationMetrics {
    iteration: number;
    samplesSelected: number;
    totalAnnotated: number;
    avgUncertainty: number;
    avgDiversity: number;
    selectionTime: number;
    trainingTime: number;
}

export interface ModelPerformance {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    loss: number;
    convergenceStatus: 'converged' | 'improving' | 'stagnant' | 'diverging';
}

export interface UncertaintyAnalysis {
    method: UncertaintyMethod;
    scores: Float32Array;
    statistics: UncertaintyStatistics;
    distribution: DistributionInfo;
}

export interface UncertaintyStatistics {
    mean: number;
    std: number;
    min: number;
    max: number;
    median: number;
    percentiles: number[];
}

export interface DistributionInfo {
    histogram: number[];
    bins: number[];
    skewness: number;
    kurtosis: number;
}

export interface DiversityAnalysis {
    method: 'euclidean' | 'cosine' | 'manhattan' | 'mahalanobis';
    distances: Float32Array;
    clusters: ClusterInfo[];
    coverage: CoverageMetrics;
}

export interface ClusterInfo {
    id: number;
    center: Float32Array;
    samples: string[];
    density: number;
    radius: number;
}

export interface CoverageMetrics {
    featureSpaceCoverage: number;
    clusterCoverage: number;
    boundaryDensity: number;
    noveltyScore: number;
}

export class ActiveLearning {
    private config: ActiveLearningConfig;
    private modelRunner: ModelRunner;
    private computeShaders: ComputeShaders;
    private samplePool: Map<string, SampleCandidate>;
    private annotatedSamples: Map<string, SampleCandidate>;
    private iterationHistory: IterationMetrics[];
    private currentIteration: number;

    constructor(config: ActiveLearningConfig) {
        this.config = config;
        this.modelRunner = new ModelRunner();
        if (this.config.enableGPUAcceleration) {
            this.computeShaders = new ComputeShaders({
                backend: 'webgpu',
                device: {
                    preferredDevice: 'gpu',
                    minComputeUnits: 4,
                    minMemorySize: 256 * 1024 * 1024,
                    features: ['fp16', 'subgroups', 'shared_memory']
                },
                memory: {
                    maxBufferSize: 1024 * 1024 * 1024,
                    alignment: 256,
                    caching: 'lru',
                    pooling: { enabled: true, initialSize: 64, maxSize: 512, growthFactor: 2 },
                    compression: { enabled: false, algorithm: 'lz4', level: 1 }
                },
                optimization: {
                    autoTuning: true,
                    workGroupOptimization: true,
                    memoryCoalescing: true,
                    loopUnrolling: true,
                    constantFolding: true,
                    deadCodeElimination: true
                },
                debugging: {
                    enabled: false,
                    profiling: true,
                    validation: false,
                    verboseLogging: false
                },
                kernels: []
            });
        }
        this.samplePool = new Map();
        this.annotatedSamples = new Map();
        this.iterationHistory = [];
        this.currentIteration = 0;
    }

    /**
     * Initialize active learning with initial sample pool
     */
    public async initialize(initialSamples: any[]): Promise<void> {
        try {
            console.log(`Initializing active learning with ${initialSamples.length} samples`);

            // Process initial samples
            for (const sample of initialSamples) {
                const candidate = await this.createSampleCandidate(sample);
                this.samplePool.set(candidate.id, candidate);
            }

            // Initialize models
            await this.modelRunner.init();

            console.log('Active learning system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize active learning:', error);
            throw error;
        }
    }

    /**
     * Run active learning iteration
     */
    public async runIteration(): Promise<ActiveLearningResult> {
        try {
            const startTime = Date.now();

            console.log(`Running active learning iteration ${this.currentIteration + 1}`);

            // Update model predictions for all samples
            await this.updatePredictions();

            // Calculate uncertainty scores
            await this.calculateUncertaintyScores();

            // Calculate diversity scores
            await this.calculateDiversityScores();

            // Combine scores and select samples
            const selectedSamples = await this.selectSamples();

            // Calculate metrics
            const iterationMetrics = this.calculateIterationMetrics(startTime, selectedSamples);
            const modelPerformance = await this.evaluateModelPerformance();

            // Generate recommendations
            const recommendations = this.generateRecommendations(modelPerformance);

            // Update iteration history
            this.iterationHistory.push(iterationMetrics);
            this.currentIteration++;

            const result: ActiveLearningResult = {
                selectedSamples,
                iterationMetrics,
                modelPerformance,
                recommendations,
                nextIterationConfig: this.generateNextIterationConfig(modelPerformance)
            };

            console.log(`Iteration completed: selected ${selectedSamples.length} samples`);
            return result;

        } catch (error) {
            console.error('Active learning iteration failed:', error);
            throw error;
        }
    }

    /**
     * Add annotated samples to training set
     */
    public async addAnnotatedSamples(annotatedSamples: SampleCandidate[]): Promise<void> {
        try {
            console.log(`Adding ${annotatedSamples.length} annotated samples`);

            for (const sample of annotatedSamples) {
                this.annotatedSamples.set(sample.id, sample);
                this.samplePool.delete(sample.id);
            }

            // Retrain models if enough new samples
            if (annotatedSamples.length >= this.config.iterativeConfig.retrainingFrequency) {
                await this.retrainModels();
            }

            console.log(`Total annotated samples: ${this.annotatedSamples.size}`);
        } catch (error) {
            console.error('Failed to add annotated samples:', error);
            throw error;
        }
    }

    /**
     * Calculate uncertainty scores for all samples
     */
    private async calculateUncertaintyScores(): Promise<void> {
        const samples = Array.from(this.samplePool.values());

        for (const sample of samples) {
            let uncertaintyScore = 0;

            switch (this.config.strategy) {
                case 'uncertainty':
                case 'entropy':
                    uncertaintyScore = this.calculateEntropyUncertainty(sample);
                    break;
                case 'margin':
                    uncertaintyScore = this.calculateMarginUncertainty(sample);
                    break;
                case 'least_confidence':
                    uncertaintyScore = this.calculateLeastConfidenceUncertainty(sample);
                    break;
                case 'committee_disagreement':
                    uncertaintyScore = this.calculateCommitteeDisagreement(sample);
                    break;
                case 'variance_reduction':
                    uncertaintyScore = await this.calculateVarianceReduction(sample);
                    break;
                default:
                    uncertaintyScore = this.calculateEntropyUncertainty(sample);
            }

            sample.uncertaintyScore = uncertaintyScore;
        }
    }

    /**
     * Calculate diversity scores for samples
     */
    private async calculateDiversityScores(): Promise<void> {
        const samples = Array.from(this.samplePool.values());
        const annotatedFeatures = Array.from(this.annotatedSamples.values())
            .map(s => s.features);

        for (const sample of samples) {
            let diversityScore = 0;

            if (annotatedFeatures.length > 0) {
                // Calculate minimum distance to annotated samples
                let minDistance = Infinity;

                for (const annotatedFeature of annotatedFeatures) {
                    const distance = this.calculateDistance(sample.features, annotatedFeature);
                    minDistance = Math.min(minDistance, distance);
                }

                diversityScore = minDistance;
            } else {
                // If no annotated samples, use distance to centroid
                diversityScore = this.calculateDistanceToCentroid(sample.features, samples);
            }

            sample.diversityScore = diversityScore;
        }
    }

    /**
     * Select samples based on combined uncertainty and diversity scores
     */
    private async selectSamples(): Promise<SampleCandidate[]> {
        const samples = Array.from(this.samplePool.values());

        // Normalize scores
        this.normalizeScores(samples);

        // Calculate combined scores
        for (const sample of samples) {
            sample.combinedScore =
                (1 - this.config.diversityWeight) * sample.uncertaintyScore +
                this.config.diversityWeight * sample.diversityScore;
        }

        // Sort by combined score (descending)
        samples.sort((a, b) => b.combinedScore - a.combinedScore);

        // Apply budget constraints
        const selectedSamples = this.applyBudgetConstraints(samples);

        return selectedSamples.slice(0, this.config.batchSize);
    }

    /**
     * Calculate entropy-based uncertainty
     */
    private calculateEntropyUncertainty(sample: SampleCandidate): number {
        let totalEntropy = 0;
        let totalWeight = 0;

        for (const prediction of sample.predictions) {
            const model = this.config.modelEnsemble.models.find(m => m.id === prediction.modelId);
            if (!model || !model.enabled) continue;

            const entropy = this.calculateEntropy(prediction.prediction);
            totalEntropy += entropy * model.weight;
            totalWeight += model.weight;
        }

        return totalWeight > 0 ? totalEntropy / totalWeight : 0;
    }

    /**
     * Calculate margin-based uncertainty
     */
    private calculateMarginUncertainty(sample: SampleCandidate): number {
        let totalMargin = 0;
        let totalWeight = 0;

        for (const prediction of sample.predictions) {
            const model = this.config.modelEnsemble.models.find(m => m.id === prediction.modelId);
            if (!model || !model.enabled) continue;

            const margin = this.calculateMargin(prediction.prediction);
            totalMargin += (1 - margin) * model.weight; // Lower margin = higher uncertainty
            totalWeight += model.weight;
        }

        return totalWeight > 0 ? totalMargin / totalWeight : 0;
    }

    /**
     * Calculate least confidence uncertainty
     */
    private calculateLeastConfidenceUncertainty(sample: SampleCandidate): number {
        let totalUncertainty = 0;
        let totalWeight = 0;

        for (const prediction of sample.predictions) {
            const model = this.config.modelEnsemble.models.find(m => m.id === prediction.modelId);
            if (!model || !model.enabled) continue;

            const uncertainty = 1 - prediction.confidence;
            totalUncertainty += uncertainty * model.weight;
            totalWeight += model.weight;
        }

        return totalWeight > 0 ? totalUncertainty / totalWeight : 0;
    }

    /**
     * Calculate committee disagreement
     */
    private calculateCommitteeDisagreement(sample: SampleCandidate): number {
        if (sample.predictions.length < 2) return 0;

        const predictions = sample.predictions
            .filter(p => {
                const model = this.config.modelEnsemble.models.find(m => m.id === p.modelId);
                return model && model.enabled;
            });

        if (predictions.length < 2) return 0;

        // Calculate pairwise disagreement
        let totalDisagreement = 0;
        let pairCount = 0;

        for (let i = 0; i < predictions.length; i++) {
            for (let j = i + 1; j < predictions.length; j++) {
                const disagreement = this.calculatePredictionDisagreement(
                    predictions[i].prediction,
                    predictions[j].prediction
                );
                totalDisagreement += disagreement;
                pairCount++;
            }
        }

        return pairCount > 0 ? totalDisagreement / pairCount : 0;
    }

    /**
     * Calculate variance reduction uncertainty
     */
    private async calculateVarianceReduction(sample: SampleCandidate): Promise<number> {
        // Simulate adding this sample to training set and calculate expected variance reduction
        const currentVariance = await this.estimateModelVariance();
        const expectedVariance = await this.estimateVarianceWithSample(sample);

        return Math.max(0, currentVariance - expectedVariance);
    }

    /**
     * Calculate entropy of prediction
     */
    private calculateEntropy(prediction: any): number {
        if (Array.isArray(prediction)) {
            // Classification probabilities
            let entropy = 0;
            for (const prob of prediction) {
                if (prob > 0) {
                    entropy -= prob * Math.log2(prob);
                }
            }
            return entropy;
        } else {
            // For regression, use prediction variance as proxy
            return prediction.variance || 0;
        }
    }

    /**
     * Calculate margin between top two predictions
     */
    private calculateMargin(prediction: any): number {
        if (Array.isArray(prediction)) {
            const sorted = [...prediction].sort((a, b) => b - a);
            return sorted.length >= 2 ? sorted[0] - sorted[1] : 0;
        } else {
            return prediction.confidence || 0;
        }
    }

    /**
     * Calculate prediction disagreement
     */
    private calculatePredictionDisagreement(pred1: any, pred2: any): number {
        if (Array.isArray(pred1) && Array.isArray(pred2)) {
            // Classification: KL divergence or L2 distance
            let distance = 0;
            for (let i = 0; i < Math.min(pred1.length, pred2.length); i++) {
                distance += Math.pow(pred1[i] - pred2[i], 2);
            }
            return Math.sqrt(distance);
        } else {
            // Regression: absolute difference
            return Math.abs(pred1.value - pred2.value);
        }
    }

    /**
     * Calculate distance between feature vectors
     */
    private calculateDistance(features1: Float32Array, features2: Float32Array): number {
        let distance = 0;
        const length = Math.min(features1.length, features2.length);

        for (let i = 0; i < length; i++) {
            distance += Math.pow(features1[i] - features2[i], 2);
        }

        return Math.sqrt(distance);
    }

    /**
     * Calculate distance to centroid
     */
    private calculateDistanceToCentroid(features: Float32Array, samples: SampleCandidate[]): number {
        if (samples.length === 0) return 0;

        const centroid = new Float32Array(features.length);

        // Calculate centroid
        for (const sample of samples) {
            for (let i = 0; i < centroid.length; i++) {
                centroid[i] += sample.features[i];
            }
        }

        for (let i = 0; i < centroid.length; i++) {
            centroid[i] /= samples.length;
        }

        return this.calculateDistance(features, centroid);
    }

    /**
     * Normalize uncertainty and diversity scores
     */
    private normalizeScores(samples: SampleCandidate[]): void {
        if (samples.length === 0) return;

        // Normalize uncertainty scores
        const uncertaintyScores = samples.map(s => s.uncertaintyScore);
        const minUncertainty = Math.min(...uncertaintyScores);
        const maxUncertainty = Math.max(...uncertaintyScores);
        const uncertaintyRange = maxUncertainty - minUncertainty;

        if (uncertaintyRange > 0) {
            for (const sample of samples) {
                sample.uncertaintyScore = (sample.uncertaintyScore - minUncertainty) / uncertaintyRange;
            }
        }

        // Normalize diversity scores
        const diversityScores = samples.map(s => s.diversityScore);
        const minDiversity = Math.min(...diversityScores);
        const maxDiversity = Math.max(...diversityScores);
        const diversityRange = maxDiversity - minDiversity;

        if (diversityRange > 0) {
            for (const sample of samples) {
                sample.diversityScore = (sample.diversityScore - minDiversity) / diversityRange;
            }
        }
    }

    /**
     * Apply budget constraints to sample selection
     */
    private applyBudgetConstraints(samples: SampleCandidate[]): SampleCandidate[] {
        let selectedSamples: SampleCandidate[] = [];
        let totalCost = 0;
        let totalTime = 0;

        for (const sample of samples) {
            const sampleCost = sample.metadata.cost || 1;
            const sampleTime = this.config.budgetConstraints.timeConstraints.annotationTimePerSample;

            if (selectedSamples.length >= this.config.budgetConstraints.maxSamples) break;
            if (totalCost + sampleCost > this.config.budgetConstraints.maxAnnotationCost) break;
            if (totalTime + sampleTime > this.config.budgetConstraints.timeConstraints.totalTimeLimit) break;

            selectedSamples.push(sample);
            totalCost += sampleCost;
            totalTime += sampleTime;
        }

        return selectedSamples;
    }

    /**
     * Update predictions for all samples
     */
    private async updatePredictions(): Promise<void> {
        const samples = Array.from(this.samplePool.values());
        const batchData = samples.map(s => s.data);

        try {
            const predictions = await (this.modelRunner as any).runInference?.(batchData) || [];

            for (let i = 0; i < samples.length; i++) {
                samples[i].predictions = predictions[i] || [];
            }
        } catch (error) {
            console.error('Failed to update predictions:', error);
            throw error;
        }
    }

    /**
     * Create sample candidate from raw data
     */
    private async createSampleCandidate(data: any): Promise<SampleCandidate> {
        const features = await this.extractFeatures(data);

        return {
            id: this.generateSampleId(),
            data,
            features,
            metadata: this.extractMetadata(data),
            uncertaintyScore: 0,
            diversityScore: 0,
            combinedScore: 0,
            predictions: []
        };
    }

    /**
     * Extract features from sample data
     */
    private async extractFeatures(data: any): Promise<Float32Array> {
        // This would typically use a feature extraction model
        // For now, return dummy features
        return new Float32Array(512).fill(Math.random());
    }

    /**
     * Extract metadata from sample data
     */
    private extractMetadata(data: any): SampleMetadata {
        return {
            source: data.source || 'unknown',
            timestamp: new Date(),
            difficulty: data.difficulty || 'unknown',
            domain: data.domain || 'general',
            tags: data.tags || [],
            cost: data.cost || 1
        };
    }

    /**
     * Calculate iteration metrics
     */
    private calculateIterationMetrics(startTime: number, selectedSamples: SampleCandidate[]): IterationMetrics {
        const avgUncertainty = selectedSamples.reduce((sum, s) => sum + s.uncertaintyScore, 0) / selectedSamples.length;
        const avgDiversity = selectedSamples.reduce((sum, s) => sum + s.diversityScore, 0) / selectedSamples.length;

        return {
            iteration: this.currentIteration + 1,
            samplesSelected: selectedSamples.length,
            totalAnnotated: this.annotatedSamples.size,
            avgUncertainty,
            avgDiversity,
            selectionTime: Date.now() - startTime,
            trainingTime: 0 // Would be updated after retraining
        };
    }

    /**
     * Evaluate model performance
     */
    private async evaluateModelPerformance(): Promise<ModelPerformance> {
        // This would evaluate on validation set
        // For now, return mock performance
        return {
            accuracy: Math.random() * 0.3 + 0.7,
            precision: Math.random() * 0.3 + 0.7,
            recall: Math.random() * 0.3 + 0.7,
            f1Score: Math.random() * 0.3 + 0.7,
            loss: Math.random() * 0.5,
            convergenceStatus: 'improving'
        };
    }

    /**
     * Generate recommendations for next iteration
     */
    private generateRecommendations(performance: ModelPerformance): string[] {
        const recommendations: string[] = [];

        if (performance.accuracy < this.config.qualityMetrics.targetAccuracy) {
            recommendations.push('Consider increasing batch size for faster convergence');
        }

        if (performance.convergenceStatus === 'stagnant') {
            recommendations.push('Try different sampling strategy or increase diversity weight');
        }

        if (this.iterationHistory.length > 3) {
            const recentAvgUncertainty = this.iterationHistory.slice(-3)
                .reduce((sum, m) => sum + m.avgUncertainty, 0) / 3;

            if (recentAvgUncertainty < this.config.uncertaintyThreshold) {
                recommendations.push('Consider stopping active learning - low uncertainty achieved');
            }
        }

        return recommendations;
    }

    /**
     * Generate configuration for next iteration
     */
    private generateNextIterationConfig(performance: ModelPerformance): Partial<ActiveLearningConfig> {
        const config: Partial<ActiveLearningConfig> = {};

        if (performance.convergenceStatus === 'stagnant') {
            config.diversityWeight = Math.min(0.8, this.config.diversityWeight + 0.1);
        }

        if (performance.accuracy > this.config.qualityMetrics.targetAccuracy * 0.9) {
            config.batchSize = Math.max(5, Math.floor(this.config.batchSize * 0.8));
        }

        return config;
    }

    /**
     * Retrain models with new annotated data
     */
    private async retrainModels(): Promise<void> {
        console.log('Retraining models with new annotated data');

        const trainingData = Array.from(this.annotatedSamples.values());

        try {
            await (this.modelRunner as any).retrain?.(trainingData);
            console.log('Model retraining completed');
        } catch (error) {
            console.error('Model retraining failed:', error);
        }
    }

    /**
     * Estimate current model variance
     */
    private async estimateModelVariance(): Promise<number> {
        // This would calculate model variance on validation set
        return Math.random() * 0.1;
    }

    /**
     * Estimate variance with additional sample
     */
    private async estimateVarianceWithSample(sample: SampleCandidate): Promise<number> {
        // This would estimate variance reduction if sample was added
        return Math.random() * 0.08;
    }

    /**
     * Generate unique sample ID
     */
    private generateSampleId(): string {
        return 'sample_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    /**
     * Get active learning statistics
     */
    public getStatistics(): ActiveLearningStatistics {
        return {
            totalSamples: this.samplePool.size,
            annotatedSamples: this.annotatedSamples.size,
            currentIteration: this.currentIteration,
            iterationHistory: [...this.iterationHistory],
            convergenceStatus: this.assessConvergenceStatus()
        };
    }

    /**
     * Assess convergence status
     */
    private assessConvergenceStatus(): 'converged' | 'improving' | 'stagnant' | 'diverging' {
        if (this.iterationHistory.length < 3) return 'improving';

        const recent = this.iterationHistory.slice(-3);
        const avgUncertainty = recent.reduce((sum, m) => sum + m.avgUncertainty, 0) / 3;

        if (avgUncertainty < this.config.uncertaintyThreshold) {
            return 'converged';
        }

        // Check if uncertainty is decreasing
        const uncertaintyTrend = recent.map(m => m.avgUncertainty);
        const isDecreasing = uncertaintyTrend[0] > uncertaintyTrend[1] && uncertaintyTrend[1] > uncertaintyTrend[2];

        return isDecreasing ? 'improving' : 'stagnant';
    }

    /**
     * Cleanup resources
     */
    public async cleanup(): Promise<void> {
        try {
            await this.modelRunner.cleanup();
            this.samplePool.clear();
            this.annotatedSamples.clear();
            this.iterationHistory = [];

            console.log('G3D Active Learning cleanup completed');
        } catch (error) {
            console.error('Failed to cleanup active learning:', error);
        }
    }
}

// Additional interfaces
interface ActiveLearningStatistics {
    totalSamples: number;
    annotatedSamples: number;
    currentIteration: number;
    iterationHistory: IterationMetrics[];
    convergenceStatus: 'converged' | 'improving' | 'stagnant' | 'diverging';
}

export default ActiveLearning;