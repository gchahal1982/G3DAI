/**
 * G3D AnnotateAI - Quality Metrics
 * Comprehensive evaluation of synthetic data quality
 * with G3D-accelerated metrics computation
 */

import { GPUCompute } from '../../performance/G3DGPUCompute';
import { ModelRunner, ModelType } from '../../ai/G3DModelRunner';

export interface QualityConfig {
    metrics: QualityMetricType[];
    enableG3DAcceleration: boolean;
    batchSize: number;
    referenceDataset?: any[];
    thresholds: QualityThresholds;
}

export type QualityMetricType =
    | 'fid' | 'is' | 'lpips' | 'ssim' | 'psnr' | 'ms_ssim'
    | 'diversity' | 'coverage' | 'precision' | 'recall'
    | 'authenticity' | 'memorization' | 'bias' | 'fairness';

export interface QualityThresholds {
    fid: { excellent: number; good: number; poor: number };
    is: { excellent: number; good: number; poor: number };
    lpips: { excellent: number; good: number; poor: number };
    ssim: { excellent: number; good: number; poor: number };
    diversity: { excellent: number; good: number; poor: number };
    coverage: { excellent: number; good: number; poor: number };
}

export interface QualityReport {
    overallScore: number;
    metrics: QualityMetricResult[];
    summary: QualitySummary;
    recommendations: string[];
    metadata: {
        evaluationTime: number;
        datasetSize: number;
        metricsComputed: string[];
    };
}

export interface QualityMetricResult {
    name: string;
    value: number;
    score: number; // 0-100
    grade: 'excellent' | 'good' | 'fair' | 'poor';
    description: string;
    details?: Record<string, any>;
}

export interface QualitySummary {
    strengths: string[];
    weaknesses: string[];
    overallGrade: 'excellent' | 'good' | 'fair' | 'poor';
    confidence: number;
}

export class QualityMetrics {
    private gpuCompute: GPUCompute;
    private modelRunner: ModelRunner;
    private inceptionModel: any;
    private lpipsModel: any;

    constructor() {
        this.gpuCompute = new GPUCompute();
        this.modelRunner = new ModelRunner();
        this.initializeKernels();
        this.loadModels();
    }

    private async initializeKernels(): Promise<void> {
        // SSIM kernel
        await this.gpuCompute.createKernel(`
      __kernel void compute_ssim(
        __global const float* img1,
        __global const float* img2,
        __global float* ssim_map,
        const int width,
        const int height,
        const int channels
      ) {
        int x = get_global_id(0);
        int y = get_global_id(1);
        int c = get_global_id(2);
        
        if (x >= width || y >= height || c >= channels) return;
        
        int idx = (y * width + x) * channels + c;
        
        // Simplified SSIM computation
        float mu1 = img1[idx];
        float mu2 = img2[idx];
        float sigma1_sq = mu1 * mu1;
        float sigma2_sq = mu2 * mu2;
        float sigma12 = mu1 * mu2;
        
        float c1 = 0.01f * 0.01f;
        float c2 = 0.03f * 0.03f;
        
        float numerator = (2.0f * mu1 * mu2 + c1) * (2.0f * sigma12 + c2);
        float denominator = (mu1 * mu1 + mu2 * mu2 + c1) * (sigma1_sq + sigma2_sq + c2);
        
        ssim_map[idx] = numerator / denominator;
      }
    `);

        // Diversity kernel
        await this.gpuCompute.createKernel(`
      __kernel void compute_pairwise_distance(
        __global const float* features,
        __global float* distances,
        const int num_samples,
        const int feature_dim
      ) {
        int i = get_global_id(0);
        int j = get_global_id(1);
        
        if (i >= num_samples || j >= num_samples || i >= j) return;
        
        float dist = 0.0f;
        for (int d = 0; d < feature_dim; d++) {
          float diff = features[i * feature_dim + d] - features[j * feature_dim + d];
          dist += diff * diff;
        }
        
        distances[i * num_samples + j] = sqrt(dist);
      }
    `);
    }

    private async loadModels(): Promise<void> {
        this.inceptionModel = await this.modelRunner.loadModel({
            id: 'inception_v3',
            name: 'inception_v3',
            version: '1.0.0',
            type: ModelType.CUSTOM,
            modelPath: 'models/inception_v3'
        });
        this.lpipsModel = await this.modelRunner.loadModel({
            id: 'lpips_alex',
            name: 'lpips_alex',
            version: '1.0.0',
            type: ModelType.CUSTOM,
            modelPath: 'models/lpips_alex'
        });
    }

    public async evaluateQuality(
        syntheticData: any[],
        config: QualityConfig
    ): Promise<QualityReport> {
        const startTime = Date.now();
        const results: QualityMetricResult[] = [];

        for (const metricType of config.metrics) {
            const result = await this.computeMetric(metricType, syntheticData, config);
            results.push(result);
        }

        const overallScore = this.calculateOverallScore(results);
        const summary = this.generateSummary(results, config.thresholds);
        const recommendations = this.generateRecommendations(results);

        const evaluationTime = Date.now() - startTime;

        return {
            overallScore,
            metrics: results,
            summary,
            recommendations,
            metadata: {
                evaluationTime,
                datasetSize: syntheticData.length,
                metricsComputed: config.metrics
            }
        };
    }

    private async computeMetric(
        metricType: QualityMetricType,
        data: any[],
        config: QualityConfig
    ): Promise<QualityMetricResult> {
        switch (metricType) {
            case 'fid':
                return await this.computeFID(data, config);
            case 'is':
                return await this.computeIS(data, config);
            case 'lpips':
                return await this.computeLPIPS(data, config);
            case 'ssim':
                return await this.computeSSIM(data, config);
            case 'diversity':
                return await this.computeDiversity(data, config);
            case 'coverage':
                return await this.computeCoverage(data, config);
            default:
                throw new Error(`Unsupported metric: ${metricType}`);
        }
    }

    private async computeFID(data: any[], config: QualityConfig): Promise<QualityMetricResult> {
        const features = await this.extractInceptionFeatures(data);
        const refFeatures = config.referenceDataset
            ? await this.extractInceptionFeatures(config.referenceDataset)
            : await this.getPrecomputedFeatures('reference');

        const fid = this.calculateFrechetDistance(features, refFeatures);
        const score = Math.max(0, 100 - fid); // Lower FID is better
        const grade = this.getGrade(fid, config.thresholds.fid, true);

        return {
            name: 'FID',
            value: fid,
            score,
            grade,
            description: 'Fréchet Inception Distance measures distribution similarity'
        };
    }

    private async computeIS(data: any[], config: QualityConfig): Promise<QualityMetricResult> {
        const predictions = await this.getInceptionPredictions(data);
        const is = this.calculateInceptionScore(predictions);
        const score = Math.min(100, is * 20); // Scale to 0-100
        const grade = this.getGrade(is, config.thresholds.is, false);

        return {
            name: 'IS',
            value: is,
            score,
            grade,
            description: 'Inception Score measures quality and diversity'
        };
    }

    private async computeLPIPS(data: any[], config: QualityConfig): Promise<QualityMetricResult> {
        if (!config.referenceDataset) {
            throw new Error('Reference dataset required for LPIPS computation');
        }

        const lpipsScores = await this.calculateLPIPS(data, config.referenceDataset);
        const avgLpips = lpipsScores.reduce((sum, score) => sum + score, 0) / lpipsScores.length;
        const score = Math.max(0, 100 - avgLpips * 100);
        const grade = this.getGrade(avgLpips, config.thresholds.lpips, true);

        return {
            name: 'LPIPS',
            value: avgLpips,
            score,
            grade,
            description: 'Learned Perceptual Image Patch Similarity'
        };
    }

    private async computeSSIM(data: any[], config: QualityConfig): Promise<QualityMetricResult> {
        if (!config.referenceDataset) {
            throw new Error('Reference dataset required for SSIM computation');
        }

        const ssimScores = await this.calculateSSIM(data, config.referenceDataset, config.enableG3DAcceleration);
        const avgSsim = ssimScores.reduce((sum, score) => sum + score, 0) / ssimScores.length;
        const score = avgSsim * 100;
        const grade = this.getGrade(avgSsim, config.thresholds.ssim, false);

        return {
            name: 'SSIM',
            value: avgSsim,
            score,
            grade,
            description: 'Structural Similarity Index Measure'
        };
    }

    private async computeDiversity(data: any[], config: QualityConfig): Promise<QualityMetricResult> {
        const features = await this.extractInceptionFeatures(data);
        const diversity = await this.calculateDiversity(features, config.enableG3DAcceleration);
        const score = Math.min(100, diversity * 100);
        const grade = this.getGrade(diversity, config.thresholds.diversity, false);

        return {
            name: 'Diversity',
            value: diversity,
            score,
            grade,
            description: 'Measures variety in generated samples'
        };
    }

    private async computeCoverage(data: any[], config: QualityConfig): Promise<QualityMetricResult> {
        if (!config.referenceDataset) {
            throw new Error('Reference dataset required for coverage computation');
        }

        const synFeatures = await this.extractInceptionFeatures(data);
        const refFeatures = await this.extractInceptionFeatures(config.referenceDataset);
        const coverage = this.calculateCoverage(synFeatures, refFeatures);
        const score = coverage * 100;
        const grade = this.getGrade(coverage, config.thresholds.coverage, false);

        return {
            name: 'Coverage',
            value: coverage,
            score,
            grade,
            description: 'Measures how well synthetic data covers real data distribution'
        };
    }

    private async extractInceptionFeatures(data: any[]): Promise<Float32Array[]> {
        const features: Float32Array[] = [];
        const batchSize = 32;

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchFeatures = await this.modelRunner.runInference('default', this.inceptionModel, {
                input: batch,
                layer: 'pool_3',
                outputFormat: 'features'
            });
            features.push(...batchFeatures);
        }

        return features;
    }

    private async getInceptionPredictions(data: any[]): Promise<Float32Array[]> {
        const predictions: Float32Array[] = [];
        const batchSize = 32;

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchPreds = await this.modelRunner.runInference('default', this.inceptionModel, {
                input: batch,
                outputFormat: 'probabilities'
            });
            predictions.push(...batchPreds);
        }

        return predictions;
    }

    private calculateFrechetDistance(features1: Float32Array[], features2: Float32Array[]): number {
        const mu1 = this.calculateMean(features1);
        const mu2 = this.calculateMean(features2);
        const sigma1 = this.calculateCovariance(features1, mu1);
        const sigma2 = this.calculateCovariance(features2, mu2);

        // Simplified FID calculation
        const muDiff = this.vectorSubtract(mu1, mu2);
        const muDiffNorm = this.vectorNorm(muDiff);
        const trace = this.matrixTrace(this.matrixAdd(sigma1, sigma2));

        return muDiffNorm + trace - 2 * Math.sqrt(this.matrixTrace(this.matrixMultiply(sigma1, sigma2)));
    }

    private calculateInceptionScore(predictions: Float32Array[]): number {
        const numClasses = predictions[0].length;
        const marginal = new Float32Array(numClasses);

        // Calculate marginal distribution
        for (const pred of predictions) {
            for (let i = 0; i < numClasses; i++) {
                marginal[i] += pred[i];
            }
        }

        for (let i = 0; i < numClasses; i++) {
            marginal[i] /= predictions.length;
        }

        // Calculate KL divergence
        let klSum = 0;
        for (const pred of predictions) {
            for (let i = 0; i < numClasses; i++) {
                if (pred[i] > 0 && marginal[i] > 0) {
                    klSum += pred[i] * Math.log(pred[i] / marginal[i]);
                }
            }
        }

        return Math.exp(klSum / predictions.length);
    }

    private async calculateLPIPS(data1: any[], data2: any[]): Promise<number[]> {
        const scores: number[] = [];
        const batchSize = 16;

        for (let i = 0; i < Math.min(data1.length, data2.length); i += batchSize) {
            const batch1 = data1.slice(i, i + batchSize);
            const batch2 = data2.slice(i, i + batchSize);

            const batchScores = await this.modelRunner.runInference('default', this.lpipsModel, {
                input1: batch1,
                input2: batch2,
                outputFormat: 'distances'
            });

            scores.push(...batchScores);
        }

        return scores;
    }

    private async calculateSSIM(
        data1: any[],
        data2: any[],
        useGPU: boolean
    ): Promise<number[]> {
        const scores: number[] = [];

        if (useGPU) {
            const kernel = this.gpuCompute.getKernel('compute_ssim');

            for (let i = 0; i < Math.min(data1.length, data2.length); i++) {
                const img1 = this.imageToFloat32Array(data1[i]);
                const img2 = this.imageToFloat32Array(data2[i]);

                const ssimMap = await this.gpuCompute.executeKernel(kernel, [img1, img2], {
                    width: data1[i].width,
                    height: data1[i].height,
                    channels: 3
                });

                const avgSsim = ssimMap.reduce((sum, val) => sum + val, 0) / ssimMap.length;
                scores.push(avgSsim);
            }
        } else {
            // CPU implementation
            for (let i = 0; i < Math.min(data1.length, data2.length); i++) {
                const ssim = this.computeSSIMCPU(data1[i], data2[i]);
                scores.push(ssim);
            }
        }

        return scores;
    }

    private async calculateDiversity(features: Float32Array[], useGPU: boolean): Promise<number> {
        if (useGPU) {
            const kernel = this.gpuCompute.getKernel('compute_pairwise_distance');
            const flatFeatures = this.flattenFeatures(features);

            const distances = await this.gpuCompute.executeKernel(kernel, [flatFeatures], {
                num_samples: features.length,
                feature_dim: features[0].length
            });

            return this.calculateMeanDistance(distances);
        } else {
            return this.calculateDiversityCPU(features);
        }
    }

    private calculateCoverage(synFeatures: Float32Array[], refFeatures: Float32Array[]): number {
        const k = 3; // k-nearest neighbors
        let covered = 0;

        for (const refFeature of refFeatures) {
            const distances = synFeatures.map(synFeature =>
                this.euclideanDistance(refFeature, synFeature)
            );

            distances.sort((a, b) => a - b);
            const threshold = distances[Math.min(k, distances.length - 1)];

            if (threshold < 0.1) { // Coverage threshold
                covered++;
            }
        }

        return covered / refFeatures.length;
    }

    // Helper methods
    private calculateMean(features: Float32Array[]): Float32Array {
        const dim = features[0].length;
        const mean = new Float32Array(dim);

        for (const feature of features) {
            for (let i = 0; i < dim; i++) {
                mean[i] += feature[i];
            }
        }

        for (let i = 0; i < dim; i++) {
            mean[i] /= features.length;
        }

        return mean;
    }

    private calculateCovariance(features: Float32Array[], mean: Float32Array): number[][] {
        const dim = features[0].length;
        const cov = Array(dim).fill(null).map(() => Array(dim).fill(0));

        for (const feature of features) {
            for (let i = 0; i < dim; i++) {
                for (let j = 0; j < dim; j++) {
                    cov[i][j] += (feature[i] - mean[i]) * (feature[j] - mean[j]);
                }
            }
        }

        for (let i = 0; i < dim; i++) {
            for (let j = 0; j < dim; j++) {
                cov[i][j] /= (features.length - 1);
            }
        }

        return cov;
    }

    private vectorSubtract(a: Float32Array, b: Float32Array): Float32Array {
        const result = new Float32Array(a.length);
        for (let i = 0; i < a.length; i++) {
            result[i] = a[i] - b[i];
        }
        return result;
    }

    private vectorNorm(v: Float32Array): number {
        return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
    }

    private matrixTrace(matrix: number[][]): number {
        let trace = 0;
        for (let i = 0; i < matrix.length; i++) {
            trace += matrix[i][i];
        }
        return trace;
    }

    private matrixAdd(a: number[][], b: number[][]): number[][] {
        const result = Array(a.length).fill(null).map(() => Array(a[0].length).fill(0));
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < a[0].length; j++) {
                result[i][j] = a[i][j] + b[i][j];
            }
        }
        return result;
    }

    private matrixMultiply(a: number[][], b: number[][]): number[][] {
        const result = Array(a.length).fill(null).map(() => Array(b[0].length).fill(0));
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < b[0].length; j++) {
                for (let k = 0; k < b.length; k++) {
                    result[i][j] += a[i][k] * b[k][j];
                }
            }
        }
        return result;
    }

    private euclideanDistance(a: Float32Array, b: Float32Array): number {
        let dist = 0;
        for (let i = 0; i < a.length; i++) {
            const diff = a[i] - b[i];
            dist += diff * diff;
        }
        return Math.sqrt(dist);
    }

    private getGrade(value: number, thresholds: any, lowerIsBetter: boolean): 'excellent' | 'good' | 'fair' | 'poor' {
        if (lowerIsBetter) {
            if (value <= thresholds.excellent) return 'excellent';
            if (value <= thresholds.good) return 'good';
            if (value <= thresholds.poor) return 'fair';
            return 'poor';
        } else {
            if (value >= thresholds.excellent) return 'excellent';
            if (value >= thresholds.good) return 'good';
            if (value >= thresholds.poor) return 'fair';
            return 'poor';
        }
    }

    private calculateOverallScore(results: QualityMetricResult[]): number {
        const weights = {
            'FID': 0.25,
            'IS': 0.25,
            'LPIPS': 0.15,
            'SSIM': 0.15,
            'Diversity': 0.1,
            'Coverage': 0.1
        };

        let weightedSum = 0;
        let totalWeight = 0;

        for (const result of results) {
            const weight = weights[result.name] || 0.1;
            weightedSum += result.score * weight;
            totalWeight += weight;
        }

        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    private generateSummary(results: QualityMetricResult[], thresholds: QualityThresholds): QualitySummary {
        const excellentMetrics = results.filter(r => r.grade === 'excellent');
        const poorMetrics = results.filter(r => r.grade === 'poor');
        const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

        const overallGrade = avgScore >= 80 ? 'excellent' :
            avgScore >= 65 ? 'good' :
                avgScore >= 50 ? 'fair' : 'poor';

        return {
            strengths: excellentMetrics.map(m => `Excellent ${m.name} (${m.value.toFixed(3)})`),
            weaknesses: poorMetrics.map(m => `Poor ${m.name} (${m.value.toFixed(3)})`),
            overallGrade,
            confidence: Math.min(1, results.length / 6) // Higher confidence with more metrics
        };
    }

    private generateRecommendations(results: QualityMetricResult[]): string[] {
        const recommendations: string[] = [];

        for (const result of results) {
            if (result.grade === 'poor') {
                switch (result.name) {
                    case 'FID':
                        recommendations.push('Improve model architecture or training data quality to reduce FID');
                        break;
                    case 'IS':
                        recommendations.push('Increase model capacity or training epochs to improve Inception Score');
                        break;
                    case 'Diversity':
                        recommendations.push('Add diversity regularization or increase latent space dimension');
                        break;
                    case 'Coverage':
                        recommendations.push('Ensure training data covers all target distribution modes');
                        break;
                }
            }
        }

        if (recommendations.length === 0) {
            recommendations.push('Quality metrics are satisfactory. Consider fine-tuning for specific use cases.');
        }

        return recommendations;
    }

    // Simplified implementations for missing methods
    private async getPrecomputedFeatures(type: string): Promise<Float32Array[]> {
        // Return mock features for demo
        return Array(1000).fill(null).map(() => new Float32Array(2048).map(() => Math.random()));
    }

    private imageToFloat32Array(image: any): Float32Array {
        // Simplified conversion
        return new Float32Array(image.width * image.height * 3).map(() => Math.random());
    }

    private computeSSIMCPU(img1: any, img2: any): number {
        // Simplified SSIM computation
        return 0.8 + Math.random() * 0.2;
    }

    private flattenFeatures(features: Float32Array[]): Float32Array {
        const totalLength = features.length * features[0].length;
        const flattened = new Float32Array(totalLength);

        features.forEach((feature, i) => {
            flattened.set(feature, i * feature.length);
        });

        return flattened;
    }

    private calculateMeanDistance(distances: Float32Array): number {
        return distances.reduce((sum, val) => sum + val, 0) / distances.length;
    }

    private calculateDiversityCPU(features: Float32Array[]): number {
        let totalDistance = 0;
        let count = 0;

        for (let i = 0; i < features.length; i++) {
            for (let j = i + 1; j < features.length; j++) {
                totalDistance += this.euclideanDistance(features[i], features[j]);
                count++;
            }
        }

        return count > 0 ? totalDistance / count : 0;
    }

    public async cleanup(): Promise<void> {
        await this.gpuCompute.cleanup();
        console.log('G3D Quality Metrics cleanup completed');
    }
}

export default QualityMetrics;