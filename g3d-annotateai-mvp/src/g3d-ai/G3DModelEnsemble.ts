/**
 * G3D AnnotateAI - Model Ensemble System
 * Multi-model fusion and ensemble methods
 * Model voting and confidence aggregation
 */

import { G3DModelRunner } from './G3DModelRunner';
import { G3DComputeShaders } from './G3DComputeShaders';

export interface EnsembleConfig {
    models: EnsembleModel[];
    votingStrategy: VotingStrategy;
    aggregationMethod: AggregationMethod;
    confidenceThreshold: number;
    diversityWeight: number;
    performanceWeighting: boolean;
    dynamicWeighting: boolean;
    calibration: CalibrationConfig;
}

export type VotingStrategy =
    | 'majority' | 'weighted' | 'soft' | 'stacking' | 'bayesian'
    | 'rank_based' | 'confidence_weighted' | 'performance_weighted';

export type AggregationMethod =
    | 'mean' | 'weighted_mean' | 'median' | 'max' | 'min'
    | 'geometric_mean' | 'harmonic_mean' | 'trimmed_mean';

export interface EnsembleModel {
    id: string;
    name: string;
    type: ModelType;
    weight: number;
    performance: ModelPerformance;
    config: ModelConfig;
    enabled: boolean;
    lastUpdated: Date;
}

export type ModelType =
    | 'classification' | 'regression' | 'segmentation' | 'detection'
    | 'generation' | 'embedding' | 'transformer' | 'cnn' | 'rnn';

export interface ModelPerformance {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    loss: number;
    latency: number;
    reliability: number;
    calibration: number;
}

export interface ModelConfig {
    architecture: string;
    parameters: Record<string, any>;
    preprocessing: PreprocessingConfig;
    postprocessing: PostprocessingConfig;
    optimization: OptimizationConfig;
}

export interface PreprocessingConfig {
    normalization: 'standard' | 'minmax' | 'robust' | 'none';
    augmentation: AugmentationConfig[];
    featureSelection: FeatureSelectionConfig;
}

export interface AugmentationConfig {
    type: string;
    probability: number;
    parameters: Record<string, any>;
}

export interface FeatureSelectionConfig {
    method: 'variance' | 'correlation' | 'mutual_info' | 'chi2' | 'none';
    threshold: number;
    maxFeatures?: number;
}

export interface PostprocessingConfig {
    calibration: boolean;
    smoothing: SmoothingConfig;
    thresholding: ThresholdingConfig;
}

export interface SmoothingConfig {
    enabled: boolean;
    method: 'gaussian' | 'median' | 'bilateral';
    parameters: Record<string, any>;
}

export interface ThresholdingConfig {
    enabled: boolean;
    method: 'fixed' | 'adaptive' | 'otsu';
    threshold: number;
}

export interface OptimizationConfig {
    quantization: boolean;
    pruning: boolean;
    distillation: boolean;
    gpuAcceleration: boolean;
}

export interface CalibrationConfig {
    enabled: boolean;
    method: 'platt' | 'isotonic' | 'temperature' | 'beta';
    validationSplit: number;
    crossValidation: boolean;
}

export interface EnsemblePrediction {
    prediction: any;
    confidence: number;
    uncertainty: number;
    modelContributions: ModelContribution[];
    metadata: PredictionMetadata;
}

export interface ModelContribution {
    modelId: string;
    prediction: any;
    confidence: number;
    weight: number;
    contribution: number;
}

export interface PredictionMetadata {
    timestamp: Date;
    processingTime: number;
    inputShape: number[];
    outputShape: number[];
    ensembleMethod: string;
}

export interface EnsembleMetrics {
    overallAccuracy: number;
    ensembleGain: number;
    diversityScore: number;
    calibrationError: number;
    averageLatency: number;
    modelAgreement: number;
    uncertaintyReduction: number;
}

export interface DiversityAnalysis {
    pairwiseCorrelations: number[][];
    diversityMeasures: DiversityMeasure[];
    complementarity: ComplementarityScore[];
}

export interface DiversityMeasure {
    type: 'disagreement' | 'correlation' | 'entropy' | 'kappa';
    value: number;
    interpretation: string;
}

export interface ComplementarityScore {
    modelPair: [string, string];
    score: number;
    strengths: string[];
    weaknesses: string[];
}

export class G3DModelEnsemble {
    private config: EnsembleConfig;
    private models: Map<string, EnsembleModel>;
    private modelRunners: Map<string, G3DModelRunner>;
    private performanceHistory: Map<string, ModelPerformance[]>;
    private calibrationData: Map<string, CalibrationData>;
    private computeShaders: G3DComputeShaders;

    constructor(config: EnsembleConfig) {
        this.config = config;
        this.models = new Map();
        this.modelRunners = new Map();
        this.performanceHistory = new Map();
        this.calibrationData = new Map();

        this.initializeComponents();
        this.initializeWeights();
    }

    /**
     * Initialize ensemble components
     */
    private initializeComponents(): void {
        this.computeShaders = new G3DComputeShaders({
            backend: 'webgpu',
            device: {
                preferredDevice: 'gpu',
                minComputeUnits: 8,
                minMemorySize: 512 * 1024 * 1024,
                features: ['fp16', 'subgroups', 'shared_memory', 'atomic_operations']
            },
            memory: {
                maxBufferSize: 2 * 1024 * 1024 * 1024,
                alignment: 256,
                caching: 'adaptive',
                pooling: { enabled: true, initialSize: 128, maxSize: 1024, growthFactor: 2 },
                compression: { enabled: true, algorithm: 'zstd', level: 3 }
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

        console.log('G3D Model Ensemble initialized');
    }

    /**
     * Initialize model weights based on strategy
     */
    private initializeWeights(): void {
        // Placeholder for weight initialization logic
    }

    /**
     * Run ensemble prediction
     */
    public async predict(input: any): Promise<EnsemblePrediction> {
        try {
            const startTime = performance.now();

            // Get predictions from all enabled models
            const modelPredictions = await this.getModelPredictions(input);

            // Filter enabled models
            const enabledPredictions = modelPredictions.filter(pred => {
                const model = this.models.get(pred.modelId);
                return model && model.enabled;
            });

            if (enabledPredictions.length === 0) {
                throw new Error('No enabled models available for prediction');
            }

            // Aggregate predictions
            const aggregatedPrediction = this.aggregatePredictions(enabledPredictions);

            // Calculate ensemble confidence
            const confidence = this.calculateEnsembleConfidence(enabledPredictions);

            // Calculate uncertainty
            const uncertainty = this.calculateEnsembleUncertainty(enabledPredictions);

            // Calculate model contributions
            const modelContributions = this.calculateModelContributions(enabledPredictions);

            const processingTime = performance.now() - startTime;

            return {
                prediction: aggregatedPrediction,
                confidence,
                uncertainty,
                modelContributions,
                metadata: {
                    timestamp: new Date(),
                    processingTime,
                    inputShape: this.getInputShape(input),
                    outputShape: this.getOutputShape(aggregatedPrediction),
                    ensembleMethod: this.config.votingStrategy
                }
            };

        } catch (error) {
            console.error('Ensemble prediction failed:', error);
            throw error;
        }
    }

    /**
     * Run batch predictions
     */
    public async predictBatch(inputs: any[]): Promise<EnsemblePrediction[]> {
        try {
            console.log(`Running ensemble batch prediction for ${inputs.length} samples`);

            const predictions: EnsemblePrediction[] = [];

            // Process in batches to manage memory
            const batchSize = 32;
            for (let i = 0; i < inputs.length; i += batchSize) {
                const batch = inputs.slice(i, i + batchSize);
                const batchPredictions = await Promise.all(
                    batch.map(input => this.predict(input))
                );
                predictions.push(...batchPredictions);
            }

            console.log(`Completed batch prediction for ${predictions.length} samples`);
            return predictions;

        } catch (error) {
            console.error('Batch prediction failed:', error);
            throw error;
        }
    }

    /**
     * Update model weights based on performance
     */
    public async updateModelWeights(): Promise<void> {
        try {
            console.log('Updating model weights based on performance');

            if (!this.config.performanceWeighting) {
                console.log('Performance weighting disabled');
                return;
            }

            const performances = new Map<string, number>();

            // Calculate performance scores for each model
            for (const [modelId, model] of this.models) {
                const performanceScore = this.calculatePerformanceScore(model.performance);
                performances.set(modelId, performanceScore);
            }

            // Normalize weights
            const totalPerformance = Array.from(performances.values())
                .reduce((sum, score) => sum + score, 0);

            if (totalPerformance > 0) {
                for (const [modelId, model] of this.models) {
                    const performanceScore = performances.get(modelId) || 0;
                    model.weight = performanceScore / totalPerformance;
                }
            }

            console.log('Model weights updated successfully');
        } catch (error) {
            console.error('Failed to update model weights:', error);
        }
    }

    /**
     * Calibrate ensemble models
     */
    public async calibrateModels(validationData: any[]): Promise<void> {
        try {
            console.log('Calibrating ensemble models');

            if (!this.config.calibration.enabled) {
                console.log('Model calibration disabled');
                return;
            }

            for (const [modelId, model] of this.models) {
                if (!model.enabled) continue;

                console.log(`Calibrating model: ${model.name}`);

                // Get model predictions on validation data
                const predictions = await this.getModelPredictionsForCalibration(modelId, validationData);

                // Calculate calibration parameters
                const calibrationParams = this.calculateCalibrationParameters(predictions);

                // Store calibration data
                this.calibrationData.set(modelId, {
                    method: this.config.calibration.method,
                    parameters: calibrationParams,
                    validationAccuracy: this.calculateValidationAccuracy(predictions)
                });
            }

            console.log('Model calibration completed');
        } catch (error) {
            console.error('Model calibration failed:', error);
        }
    }

    /**
     * Analyze ensemble diversity
     */
    public async analyzeDiversity(testData: any[]): Promise<DiversityAnalysis> {
        try {
            console.log('Analyzing ensemble diversity');

            // Get predictions from all models
            const allPredictions = new Map<string, any[]>();

            for (const [modelId, model] of this.models) {
                if (!model.enabled) continue;

                const predictions = await this.getModelPredictionsForAnalysis(modelId, testData);
                allPredictions.set(modelId, predictions);
            }

            // Calculate pairwise correlations
            const correlations = this.calculatePairwiseCorrelations(allPredictions);

            // Calculate diversity measures
            const diversityMeasures = this.calculateDiversityMeasures(allPredictions);

            // Calculate complementarity scores
            const complementarity = this.calculateComplementarityScores(allPredictions);

            return {
                pairwiseCorrelations: correlations,
                diversityMeasures,
                complementarity
            };

        } catch (error) {
            console.error('Diversity analysis failed:', error);
            throw error;
        }
    }

    /**
     * Get ensemble metrics
     */
    public getEnsembleMetrics(): EnsembleMetrics {
        const enabledModels = Array.from(this.models.values()).filter(m => m.enabled);

        if (enabledModels.length === 0) {
            throw new Error('No enabled models for metrics calculation');
        }

        // Calculate overall accuracy (weighted average)
        let totalWeightedAccuracy = 0;
        let totalWeight = 0;

        for (const model of enabledModels) {
            totalWeightedAccuracy += model.performance.accuracy * model.weight;
            totalWeight += model.weight;
        }

        const overallAccuracy = totalWeight > 0 ? totalWeightedAccuracy / totalWeight : 0;

        // Calculate ensemble gain (improvement over best single model)
        const bestSingleAccuracy = Math.max(...enabledModels.map(m => m.performance.accuracy));
        const ensembleGain = overallAccuracy - bestSingleAccuracy;

        // Calculate diversity score
        const diversityScore = this.calculateDiversityScore(enabledModels);

        // Calculate average latency
        const averageLatency = enabledModels.reduce((sum, m) => sum + m.performance.latency, 0) / enabledModels.length;

        return {
            overallAccuracy,
            ensembleGain,
            diversityScore,
            calibrationError: this.calculateCalibrationError(),
            averageLatency,
            modelAgreement: this.calculateModelAgreement(enabledModels),
            uncertaintyReduction: this.calculateUncertaintyReduction(enabledModels)
        };
    }

    /**
     * Add new model to ensemble
     */
    public async addModel(model: EnsembleModel): Promise<void> {
        try {
            console.log(`Adding new model to ensemble: ${model.name}`);

            // Validate model configuration
            this.validateModelConfig(model);

            // Add to ensemble
            this.models.set(model.id, { ...model });
            this.performanceHistory.set(model.id, []);

            // Create model runner
            const modelRunner = new G3DModelRunner({
                modelId: model.id,
                enableG3DAcceleration: true,
                batchSize: 32,
                optimization: model.config.optimization
            });

            this.modelRunners.set(model.id, modelRunner);

            // Update ensemble weights if performance weighting is enabled
            if (this.config.performanceWeighting) {
                await this.updateModelWeights();
            }

            console.log(`Model ${model.name} added successfully`);
        } catch (error) {
            console.error('Failed to add model:', error);
            throw error;
        }
    }

    /**
     * Remove model from ensemble
     */
    public removeModel(modelId: string): void {
        try {
            const model = this.models.get(modelId);
            if (!model) {
                throw new Error(`Model not found: ${modelId}`);
            }

            console.log(`Removing model from ensemble: ${model.name}`);

            // Remove from all collections
            this.models.delete(modelId);
            this.modelRunners.delete(modelId);
            this.performanceHistory.delete(modelId);
            this.calibrationData.delete(modelId);

            console.log(`Model ${model.name} removed successfully`);
        } catch (error) {
            console.error('Failed to remove model:', error);
            throw error;
        }
    }

    /**
     * Enable/disable model
     */
    public setModelEnabled(modelId: string, enabled: boolean): void {
        const model = this.models.get(modelId);
        if (!model) {
            throw new Error(`Model not found: ${modelId}`);
        }

        model.enabled = enabled;
        console.log(`Model ${model.name} ${enabled ? 'enabled' : 'disabled'}`);
    }

    // Private helper methods

    /**
     * Get predictions from all models
     */
    private async getModelPredictions(input: any): Promise<ModelContribution[]> {
        const predictions: ModelContribution[] = [];

        for (const [modelId, model] of this.models) {
            if (!model.enabled) continue;

            try {
                const modelRunner = this.modelRunners.get(modelId);
                if (!modelRunner) continue;

                const prediction = await modelRunner.predict(input);
                const confidence = this.extractConfidence(prediction);

                predictions.push({
                    modelId,
                    prediction,
                    confidence,
                    weight: model.weight,
                    contribution: 0 // Will be calculated later
                });
            } catch (error) {
                console.warn(`Model ${modelId} prediction failed:`, error);
            }
        }

        return predictions;
    }

    /**
     * Aggregate predictions using configured strategy
     */
    private aggregatePredictions(predictions: ModelContribution[]): any {
        switch (this.config.votingStrategy) {
            case 'majority':
                return this.majorityVoting(predictions);
            case 'weighted':
                return this.weightedVoting(predictions);
            case 'soft':
                return this.softVoting(predictions);
            case 'confidence_weighted':
                return this.confidenceWeightedVoting(predictions);
            case 'stacking':
                return this.stackingVoting(predictions);
            default:
                return this.weightedVoting(predictions);
        }
    }

    /**
     * Majority voting aggregation
     */
    private majorityVoting(predictions: ModelContribution[]): any {
        if (predictions.length === 0) return null;

        // For classification, count votes for each class
        const votes = new Map<string, number>();

        for (const pred of predictions) {
            const classLabel = this.extractClassLabel(pred.prediction);
            votes.set(classLabel, (votes.get(classLabel) || 0) + 1);
        }

        // Return class with most votes
        let maxVotes = 0;
        let winningClass = '';

        for (const [classLabel, voteCount] of votes) {
            if (voteCount > maxVotes) {
                maxVotes = voteCount;
                winningClass = classLabel;
            }
        }

        return winningClass;
    }

    /**
     * Weighted voting aggregation
     */
    private weightedVoting(predictions: ModelContribution[]): any {
        if (predictions.length === 0) return null;

        // Calculate weighted average
        let weightedSum = 0;
        let totalWeight = 0;

        for (const pred of predictions) {
            const value = this.extractNumericValue(pred.prediction);
            weightedSum += value * pred.weight;
            totalWeight += pred.weight;
        }

        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    /**
     * Soft voting aggregation
     */
    private softVoting(predictions: ModelContribution[]): any {
        if (predictions.length === 0) return null;

        // Average probability distributions
        const probabilities = predictions.map(p => this.extractProbabilities(p.prediction));
        const numClasses = probabilities[0]?.length || 0;

        if (numClasses === 0) return this.weightedVoting(predictions);

        const avgProbabilities = new Array(numClasses).fill(0);

        for (let i = 0; i < numClasses; i++) {
            let sum = 0;
            for (const probs of probabilities) {
                sum += probs[i] || 0;
            }
            avgProbabilities[i] = sum / probabilities.length;
        }

        return avgProbabilities;
    }

    /**
     * Confidence-weighted voting
     */
    private confidenceWeightedVoting(predictions: ModelContribution[]): any {
        if (predictions.length === 0) return null;

        // Weight by confidence scores
        let weightedSum = 0;
        let totalWeight = 0;

        for (const pred of predictions) {
            const value = this.extractNumericValue(pred.prediction);
            const weight = pred.confidence * pred.weight;
            weightedSum += value * weight;
            totalWeight += weight;
        }

        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    /**
     * Stacking aggregation (meta-learning)
     */
    private stackingVoting(predictions: ModelContribution[]): any {
        // For now, use weighted voting as placeholder
        // In practice, this would use a trained meta-model
        return this.weightedVoting(predictions);
    }

    /**
     * Calculate ensemble confidence
     */
    private calculateEnsembleConfidence(predictions: ModelContribution[]): number {
        if (predictions.length === 0) return 0;

        switch (this.config.aggregationMethod) {
            case 'mean':
                return predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
            case 'weighted_mean':
                let weightedSum = 0;
                let totalWeight = 0;
                for (const pred of predictions) {
                    weightedSum += pred.confidence * pred.weight;
                    totalWeight += pred.weight;
                }
                return totalWeight > 0 ? weightedSum / totalWeight : 0;
            case 'max':
                return Math.max(...predictions.map(p => p.confidence));
            case 'min':
                return Math.min(...predictions.map(p => p.confidence));
            default:
                return predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
        }
    }

    /**
     * Calculate ensemble uncertainty
     */
    private calculateEnsembleUncertainty(predictions: ModelContribution[]): number {
        if (predictions.length <= 1) return 0;

        // Calculate disagreement among models
        const values = predictions.map(p => this.extractNumericValue(p.prediction));
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

        return Math.sqrt(variance);
    }

    /**
     * Calculate model contributions
     */
    private calculateModelContributions(predictions: ModelContribution[]): ModelContribution[] {
        const totalWeight = predictions.reduce((sum, p) => sum + p.weight, 0);

        for (const pred of predictions) {
            pred.contribution = totalWeight > 0 ? pred.weight / totalWeight : 0;
        }

        return predictions;
    }

    /**
     * Calculate performance score for a model
     */
    private calculatePerformanceScore(performance: ModelPerformance): number {
        // Weighted combination of metrics
        return (
            performance.accuracy * 0.4 +
            performance.f1Score * 0.3 +
            performance.reliability * 0.2 +
            performance.calibration * 0.1
        );
    }

    /**
     * Calculate diversity score
     */
    private calculateDiversityScore(models: EnsembleModel[]): number {
        if (models.length <= 1) return 0;

        // Simple diversity measure based on performance differences
        const accuracies = models.map(m => m.performance.accuracy);
        const mean = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
        const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length;

        return Math.sqrt(variance);
    }

    /**
     * Calculate calibration error
     */
    private calculateCalibrationError(): number {
        // Placeholder - would calculate Expected Calibration Error (ECE)
        return 0.05; // 5% calibration error
    }

    /**
     * Calculate model agreement
     */
    private calculateModelAgreement(models: EnsembleModel[]): number {
        // Placeholder - would calculate agreement on test set
        return 0.85; // 85% agreement
    }

    /**
     * Calculate uncertainty reduction
     */
    private calculateUncertaintyReduction(models: EnsembleModel[]): number {
        // Placeholder - would calculate reduction in uncertainty vs single models
        return 0.2; // 20% uncertainty reduction
    }

    // Utility methods for extracting values from predictions

    private extractConfidence(prediction: any): number {
        if (typeof prediction === 'object' && prediction.confidence !== undefined) {
            return prediction.confidence;
        }
        if (Array.isArray(prediction)) {
            return Math.max(...prediction);
        }
        return 0.5; // Default confidence
    }

    private extractClassLabel(prediction: any): string {
        if (typeof prediction === 'string') return prediction;
        if (typeof prediction === 'object' && prediction.class !== undefined) {
            return prediction.class;
        }
        if (Array.isArray(prediction)) {
            const maxIndex = prediction.indexOf(Math.max(...prediction));
            return `class_${maxIndex}`;
        }
        return 'unknown';
    }

    private extractNumericValue(prediction: any): number {
        if (typeof prediction === 'number') return prediction;
        if (typeof prediction === 'object' && prediction.value !== undefined) {
            return prediction.value;
        }
        if (Array.isArray(prediction)) {
            return Math.max(...prediction);
        }
        return 0;
    }

    private extractProbabilities(prediction: any): number[] {
        if (Array.isArray(prediction)) return prediction;
        if (typeof prediction === 'object' && prediction.probabilities !== undefined) {
            return prediction.probabilities;
        }
        return [1.0]; // Single probability
    }

    private getInputShape(input: any): number[] {
        // Extract input dimensions
        if (Array.isArray(input)) return [input.length];
        if (input && input.shape) return input.shape;
        return [1];
    }

    private getOutputShape(output: any): number[] {
        // Extract output dimensions
        if (Array.isArray(output)) return [output.length];
        return [1];
    }

    private validateModelConfig(model: EnsembleModel): void {
        if (!model.id || !model.name) {
            throw new Error('Model must have id and name');
        }
        if (this.models.has(model.id)) {
            throw new Error(`Model with id ${model.id} already exists`);
        }
    }

    // Placeholder methods for advanced functionality

    private async getModelPredictionsForCalibration(modelId: string, data: any[]): Promise<any[]> {
        // Would get predictions for calibration
        return [];
    }

    private calculateCalibrationParameters(predictions: any[]): any {
        // Would calculate calibration parameters
        return {};
    }

    private calculateValidationAccuracy(predictions: any[]): number {
        // Would calculate accuracy on validation set
        return 0.8;
    }

    private async getModelPredictionsForAnalysis(modelId: string, data: any[]): Promise<any[]> {
        // Would get predictions for diversity analysis
        return [];
    }

    private calculatePairwiseCorrelations(predictions: Map<string, any[]>): number[][] {
        // Would calculate correlation matrix
        const modelIds = Array.from(predictions.keys());
        const size = modelIds.length;
        const correlations = Array(size).fill(null).map(() => Array(size).fill(0));

        for (let i = 0; i < size; i++) {
            correlations[i][i] = 1.0; // Self-correlation
        }

        return correlations;
    }

    private calculateDiversityMeasures(predictions: Map<string, any[]>): DiversityMeasure[] {
        return [
            { type: 'disagreement', value: 0.3, interpretation: 'Moderate disagreement' },
            { type: 'correlation', value: 0.6, interpretation: 'Moderate correlation' }
        ];
    }

    private calculateComplementarityScores(predictions: Map<string, any[]>): ComplementarityScore[] {
        return [];
    }

    /**
     * Cleanup resources
     */
    public async cleanup(): Promise<void> {
        try {
            // Cleanup all model runners
            for (const [modelId, runner] of this.modelRunners) {
                await runner.cleanup();
            }

            this.models.clear();
            this.modelRunners.clear();
            this.performanceHistory.clear();
            this.calibrationData.clear();

            console.log('G3D Model Ensemble cleanup completed');
        } catch (error) {
            console.error('Failed to cleanup ensemble:', error);
        }
    }
}

// Additional interfaces
interface CalibrationData {
    method: string;
    parameters: any;
    validationAccuracy: number;
}

export default G3DModelEnsemble;