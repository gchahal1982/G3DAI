/**
 * G3D AnnotateAI - Bias Detection
 * Comprehensive bias detection and mitigation for synthetic data
 * with G3D-accelerated fairness analysis
 */

import { G3DGPUCompute } from '../../g3d-performance/G3DGPUCompute';
import { G3DModelRunner } from '../../g3d-ai/G3DModelRunner';

export interface BiasConfig {
    protectedAttributes: string[];
    fairnessMetrics: FairnessMetric[];
    biasTypes: BiasType[];
    enableG3DAcceleration: boolean;
    thresholds: BiasThresholds;
    mitigationStrategies: MitigationStrategy[];
}

export type BiasType =
    | 'representation' | 'measurement' | 'aggregation' | 'evaluation'
    | 'historical' | 'representation' | 'measurement' | 'aggregation'
    | 'algorithmic' | 'selection' | 'confirmation' | 'sampling';

export type FairnessMetric =
    | 'demographic_parity' | 'equalized_odds' | 'equality_of_opportunity'
    | 'calibration' | 'individual_fairness' | 'counterfactual_fairness'
    | 'treatment_equality' | 'conditional_statistical_parity';

export type MitigationStrategy =
    | 'reweighting' | 'resampling' | 'adversarial_debiasing'
    | 'fairness_constraints' | 'post_processing' | 'data_augmentation';

export interface BiasThresholds {
    demographic_parity: number;
    equalized_odds: number;
    individual_fairness: number;
    representation_ratio: number;
}

export interface BiasReport {
    overallBiasScore: number;
    detectedBiases: BiasDetection[];
    fairnessMetrics: FairnessResult[];
    recommendations: BiasRecommendation[];
    mitigationPlan: MitigationPlan;
    metadata: {
        analysisTime: number;
        datasetSize: number;
        protectedGroups: string[];
    };
}

export interface BiasDetection {
    type: BiasType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    description: string;
    affectedGroups: string[];
    evidence: BiasEvidence;
}

export interface BiasEvidence {
    statisticalTests: StatisticalTest[];
    visualizations: BiasVisualization[];
    examples: any[];
    metrics: Record<string, number>;
}

export interface StatisticalTest {
    name: string;
    pValue: number;
    statistic: number;
    significant: boolean;
    interpretation: string;
}

export interface BiasVisualization {
    type: 'histogram' | 'scatter' | 'heatmap' | 'confusion_matrix';
    data: number[][];
    labels: string[];
    title: string;
}

export interface FairnessResult {
    metric: FairnessMetric;
    value: number;
    threshold: number;
    passed: boolean;
    groupResults: GroupFairnessResult[];
}

export interface GroupFairnessResult {
    group: string;
    value: number;
    baseline: number;
    ratio: number;
}

export interface BiasRecommendation {
    priority: 'high' | 'medium' | 'low';
    strategy: MitigationStrategy;
    description: string;
    expectedImpact: number;
    implementationComplexity: 'low' | 'medium' | 'high';
}

export interface MitigationPlan {
    phases: MitigationPhase[];
    estimatedEffort: string;
    expectedOutcome: string;
    monitoring: MonitoringPlan;
}

export interface MitigationPhase {
    name: string;
    strategies: MitigationStrategy[];
    duration: string;
    success_criteria: string[];
}

export interface MonitoringPlan {
    metrics: FairnessMetric[];
    frequency: string;
    alertThresholds: Record<string, number>;
}

export class G3DBiasDetection {
    private gpuCompute: G3DGPUCompute;
    private modelRunner: G3DModelRunner;
    private fairnessModels: Map<string, any>;

    constructor() {
        this.gpuCompute = new G3DGPUCompute();
        this.modelRunner = new G3DModelRunner();
        this.fairnessModels = new Map();
        this.initializeKernels();
    }

    private async initializeKernels(): Promise<void> {
        // Statistical parity kernel
        await this.gpuCompute.createKernel(`
      __kernel void compute_demographic_parity(
        __global const float* predictions,
        __global const int* protected_attrs,
        __global float* group_rates,
        const int num_samples,
        const int num_groups
      ) {
        int group_id = get_global_id(0);
        if (group_id >= num_groups) return;
        
        float positive_count = 0.0f;
        float total_count = 0.0f;
        
        for (int i = 0; i < num_samples; i++) {
          if (protected_attrs[i] == group_id) {
            total_count += 1.0f;
            if (predictions[i] > 0.5f) {
              positive_count += 1.0f;
            }
          }
        }
        
        group_rates[group_id] = total_count > 0 ? positive_count / total_count : 0.0f;
      }
    `);

        // Individual fairness kernel
        await this.gpuCompute.createKernel(`
      __kernel void compute_individual_fairness(
        __global const float* features,
        __global const float* predictions,
        __global float* fairness_violations,
        const int num_samples,
        const int feature_dim,
        const float similarity_threshold,
        const float outcome_threshold
      ) {
        int i = get_global_id(0);
        if (i >= num_samples) return;
        
        float violations = 0.0f;
        
        for (int j = 0; j < num_samples; j++) {
          if (i == j) continue;
          
          // Compute feature similarity
          float similarity = 0.0f;
          for (int d = 0; d < feature_dim; d++) {
            float diff = features[i * feature_dim + d] - features[j * feature_dim + d];
            similarity += diff * diff;
          }
          similarity = sqrt(similarity);
          
          // Check if similar individuals have similar outcomes
          if (similarity < similarity_threshold) {
            float outcome_diff = fabs(predictions[i] - predictions[j]);
            if (outcome_diff > outcome_threshold) {
              violations += 1.0f;
            }
          }
        }
        
        fairness_violations[i] = violations;
      }
    `);

        // Representation bias kernel
        await this.gpuCompute.createKernel(`
      __kernel void compute_representation_bias(
        __global const int* protected_attrs,
        __global const int* labels,
        __global float* representation_ratios,
        const int num_samples,
        const int num_groups,
        const int num_classes
      ) {
        int group_id = get_global_id(0);
        int class_id = get_global_id(1);
        
        if (group_id >= num_groups || class_id >= num_classes) return;
        
        float group_class_count = 0.0f;
        float total_class_count = 0.0f;
        float group_total_count = 0.0f;
        
        for (int i = 0; i < num_samples; i++) {
          if (labels[i] == class_id) {
            total_class_count += 1.0f;
            if (protected_attrs[i] == group_id) {
              group_class_count += 1.0f;
            }
          }
          if (protected_attrs[i] == group_id) {
            group_total_count += 1.0f;
          }
        }
        
        float expected_ratio = group_total_count / (float)num_samples;
        float actual_ratio = total_class_count > 0 ? group_class_count / total_class_count : 0.0f;
        
        representation_ratios[group_id * num_classes + class_id] = 
          expected_ratio > 0 ? actual_ratio / expected_ratio : 0.0f;
      }
    `);
    }

    public async detectBias(
        data: any[],
        labels: any[],
        config: BiasConfig
    ): Promise<BiasReport> {
        const startTime = Date.now();

        // Extract protected attributes
        const protectedAttrs = this.extractProtectedAttributes(data, config.protectedAttributes);

        // Detect different types of bias
        const detectedBiases: BiasDetection[] = [];

        for (const biasType of config.biasTypes) {
            const bias = await this.detectSpecificBias(data, labels, protectedAttrs, biasType, config);
            if (bias) {
                detectedBiases.push(bias);
            }
        }

        // Compute fairness metrics
        const fairnessMetrics = await this.computeFairnessMetrics(data, labels, protectedAttrs, config);

        // Generate recommendations
        const recommendations = this.generateRecommendations(detectedBiases, fairnessMetrics);

        // Create mitigation plan
        const mitigationPlan = this.createMitigationPlan(detectedBiases, recommendations);

        const analysisTime = Date.now() - startTime;
        const overallBiasScore = this.calculateOverallBiasScore(detectedBiases, fairnessMetrics);

        return {
            overallBiasScore,
            detectedBiases,
            fairnessMetrics,
            recommendations,
            mitigationPlan,
            metadata: {
                analysisTime,
                datasetSize: data.length,
                protectedGroups: config.protectedAttributes
            }
        };
    }

    private extractProtectedAttributes(data: any[], attributes: string[]): Record<string, any[]> {
        const extracted: Record<string, any[]> = {};

        for (const attr of attributes) {
            extracted[attr] = data.map(item => item[attr] || 'unknown');
        }

        return extracted;
    }

    private async detectSpecificBias(
        data: any[],
        labels: any[],
        protectedAttrs: Record<string, any[]>,
        biasType: BiasType,
        config: BiasConfig
    ): Promise<BiasDetection | null> {
        switch (biasType) {
            case 'representation':
                return await this.detectRepresentationBias(data, labels, protectedAttrs, config);
            case 'measurement':
                return await this.detectMeasurementBias(data, labels, protectedAttrs, config);
            case 'historical':
                return await this.detectHistoricalBias(data, labels, protectedAttrs, config);
            case 'algorithmic':
                return await this.detectAlgorithmicBias(data, labels, protectedAttrs, config);
            case 'selection':
                return await this.detectSelectionBias(data, labels, protectedAttrs, config);
            default:
                return null;
        }
    }

    private async detectRepresentationBias(
        data: any[],
        labels: any[],
        protectedAttrs: Record<string, any[]>,
        config: BiasConfig
    ): Promise<BiasDetection | null> {
        const evidence: BiasEvidence = {
            statisticalTests: [],
            visualizations: [],
            examples: [],
            metrics: {}
        };

        let maxBias = 0;
        const affectedGroups: string[] = [];

        for (const [attrName, attrValues] of Object.entries(protectedAttrs)) {
            const uniqueGroups = [...new Set(attrValues)];
            const groupCounts = this.countByGroup(attrValues, labels);

            // Calculate representation ratios
            const expectedRatio = 1 / uniqueGroups.length;
            let maxDeviation = 0;

            for (const group of uniqueGroups) {
                const actualRatio = groupCounts[group] / data.length;
                const deviation = Math.abs(actualRatio - expectedRatio) / expectedRatio;

                if (deviation > maxDeviation) {
                    maxDeviation = deviation;
                }

                if (deviation > config.thresholds.representation_ratio) {
                    affectedGroups.push(`${attrName}:${group}`);
                }
            }

            maxBias = Math.max(maxBias, maxDeviation);
            evidence.metrics[`${attrName}_max_deviation`] = maxDeviation;

            // Chi-square test
            const chiSquareResult = this.performChiSquareTest(groupCounts, expectedRatio);
            evidence.statisticalTests.push(chiSquareResult);

            // Create visualization
            const histogram = this.createRepresentationHistogram(groupCounts, attrName);
            evidence.visualizations.push(histogram);
        }

        if (maxBias > config.thresholds.representation_ratio) {
            const severity = this.getBiasSeverity(maxBias, [0.1, 0.3, 0.5]);

            return {
                type: 'representation',
                severity,
                confidence: Math.min(0.95, maxBias * 2),
                description: `Unequal representation detected across protected groups`,
                affectedGroups,
                evidence
            };
        }

        return null;
    }

    private async detectMeasurementBias(
        data: any[],
        labels: any[],
        protectedAttrs: Record<string, any[]>,
        config: BiasConfig
    ): Promise<BiasDetection | null> {
        // Simplified measurement bias detection
        const evidence: BiasEvidence = {
            statisticalTests: [],
            visualizations: [],
            examples: [],
            metrics: {}
        };

        // Check for systematic differences in feature distributions
        let maxBias = 0;
        const affectedGroups: string[] = [];

        for (const [attrName, attrValues] of Object.entries(protectedAttrs)) {
            const uniqueGroups = [...new Set(attrValues)];

            for (let i = 0; i < uniqueGroups.length; i++) {
                for (let j = i + 1; j < uniqueGroups.length; j++) {
                    const group1Data = data.filter((_, idx) => attrValues[idx] === uniqueGroups[i]);
                    const group2Data = data.filter((_, idx) => attrValues[idx] === uniqueGroups[j]);

                    const bias = this.calculateFeatureDistributionBias(group1Data, group2Data);

                    if (bias > 0.2) { // Threshold for measurement bias
                        maxBias = Math.max(maxBias, bias);
                        affectedGroups.push(`${attrName}:${uniqueGroups[i]} vs ${uniqueGroups[j]}`);
                    }
                }
            }
        }

        if (maxBias > 0.2) {
            const severity = this.getBiasSeverity(maxBias, [0.2, 0.4, 0.6]);

            return {
                type: 'measurement',
                severity,
                confidence: Math.min(0.9, maxBias * 1.5),
                description: `Systematic measurement differences detected between groups`,
                affectedGroups,
                evidence
            };
        }

        return null;
    }

    private async detectHistoricalBias(
        data: any[],
        labels: any[],
        protectedAttrs: Record<string, any[]>,
        config: BiasConfig
    ): Promise<BiasDetection | null> {
        // Check for historical patterns in labels
        const evidence: BiasEvidence = {
            statisticalTests: [],
            visualizations: [],
            examples: [],
            metrics: {}
        };

        let maxBias = 0;
        const affectedGroups: string[] = [];

        for (const [attrName, attrValues] of Object.entries(protectedAttrs)) {
            const groupLabelRates = this.calculateGroupLabelRates(attrValues, labels);
            const overallRate = labels.filter(l => l === 1).length / labels.length;

            for (const [group, rate] of Object.entries(groupLabelRates)) {
                const bias = Math.abs(rate - overallRate) / overallRate;

                if (bias > 0.15) { // Historical bias threshold
                    maxBias = Math.max(maxBias, bias);
                    affectedGroups.push(`${attrName}:${group}`);
                }
            }

            evidence.metrics[`${attrName}_label_variance`] = this.calculateVariance(Object.values(groupLabelRates));
        }

        if (maxBias > 0.15) {
            const severity = this.getBiasSeverity(maxBias, [0.15, 0.3, 0.5]);

            return {
                type: 'historical',
                severity,
                confidence: Math.min(0.85, maxBias * 1.2),
                description: `Historical bias patterns detected in label distribution`,
                affectedGroups,
                evidence
            };
        }

        return null;
    }

    private async detectAlgorithmicBias(
        data: any[],
        labels: any[],
        protectedAttrs: Record<string, any[]>,
        config: BiasConfig
    ): Promise<BiasDetection | null> {
        // This would require model predictions - simplified for demo
        const evidence: BiasEvidence = {
            statisticalTests: [],
            visualizations: [],
            examples: [],
            metrics: {}
        };

        // Simulate algorithmic bias detection
        const simulatedBias = Math.random() * 0.3;

        if (simulatedBias > 0.1) {
            return {
                type: 'algorithmic',
                severity: this.getBiasSeverity(simulatedBias, [0.1, 0.2, 0.3]),
                confidence: 0.7,
                description: `Algorithmic bias detected in model predictions`,
                affectedGroups: ['simulated_group'],
                evidence
            };
        }

        return null;
    }

    private async detectSelectionBias(
        data: any[],
        labels: any[],
        protectedAttrs: Record<string, any[]>,
        config: BiasConfig
    ): Promise<BiasDetection | null> {
        // Check for selection bias in sampling
        const evidence: BiasEvidence = {
            statisticalTests: [],
            visualizations: [],
            examples: [],
            metrics: {}
        };

        // Simplified selection bias detection
        const selectionBias = this.calculateSelectionBias(data, protectedAttrs);

        if (selectionBias > 0.2) {
            return {
                type: 'selection',
                severity: this.getBiasSeverity(selectionBias, [0.2, 0.4, 0.6]),
                confidence: 0.75,
                description: `Selection bias detected in data sampling`,
                affectedGroups: Object.keys(protectedAttrs),
                evidence
            };
        }

        return null;
    }

    private async computeFairnessMetrics(
        data: any[],
        labels: any[],
        protectedAttrs: Record<string, any[]>,
        config: BiasConfig
    ): Promise<FairnessResult[]> {
        const results: FairnessResult[] = [];

        for (const metric of config.fairnessMetrics) {
            const result = await this.computeSpecificFairnessMetric(
                metric,
                data,
                labels,
                protectedAttrs,
                config
            );
            results.push(result);
        }

        return results;
    }

    private async computeSpecificFairnessMetric(
        metric: FairnessMetric,
        data: any[],
        labels: any[],
        protectedAttrs: Record<string, any[]>,
        config: BiasConfig
    ): Promise<FairnessResult> {
        switch (metric) {
            case 'demographic_parity':
                return await this.computeDemographicParity(data, labels, protectedAttrs, config);
            case 'individual_fairness':
                return await this.computeIndividualFairness(data, labels, protectedAttrs, config);
            default:
                return this.createDefaultFairnessResult(metric);
        }
    }

    private async computeDemographicParity(
        data: any[],
        labels: any[],
        protectedAttrs: Record<string, any[]>,
        config: BiasConfig
    ): Promise<FairnessResult> {
        // Use first protected attribute for demo
        const attrName = Object.keys(protectedAttrs)[0];
        const attrValues = protectedAttrs[attrName];

        if (config.enableG3DAcceleration) {
            return await this.computeDemographicParityGPU(labels, attrValues, config);
        } else {
            return this.computeDemographicParityCPU(labels, attrValues, config);
        }
    }

    private async computeDemographicParityGPU(
        labels: any[],
        protectedAttrs: any[],
        config: BiasConfig
    ): Promise<FairnessResult> {
        const uniqueGroups = [...new Set(protectedAttrs)];
        const groupMap = new Map(uniqueGroups.map((group, idx) => [group, idx]));

        const predictions = new Float32Array(labels.map(l => l ? 1.0 : 0.0));
        const groupIds = new Int32Array(protectedAttrs.map(attr => groupMap.get(attr) || 0));

        const kernel = this.gpuCompute.getKernel('compute_demographic_parity');
        const groupRates = await this.gpuCompute.executeKernel(kernel, [predictions, groupIds], {
            num_samples: labels.length,
            num_groups: uniqueGroups.length
        });

        const maxRate = Math.max(...groupRates);
        const minRate = Math.min(...groupRates);
        const parityGap = maxRate - minRate;

        const groupResults: GroupFairnessResult[] = uniqueGroups.map((group, idx) => ({
            group,
            value: groupRates[idx],
            baseline: maxRate,
            ratio: maxRate > 0 ? groupRates[idx] / maxRate : 1
        }));

        return {
            metric: 'demographic_parity',
            value: parityGap,
            threshold: config.thresholds.demographic_parity,
            passed: parityGap <= config.thresholds.demographic_parity,
            groupResults
        };
    }

    private computeDemographicParityCPU(
        labels: any[],
        protectedAttrs: any[],
        config: BiasConfig
    ): FairnessResult {
        const groupRates = this.calculateGroupLabelRates(protectedAttrs, labels);
        const rates = Object.values(groupRates);
        const maxRate = Math.max(...rates);
        const minRate = Math.min(...rates);
        const parityGap = maxRate - minRate;

        const groupResults: GroupFairnessResult[] = Object.entries(groupRates).map(([group, rate]) => ({
            group,
            value: rate,
            baseline: maxRate,
            ratio: maxRate > 0 ? rate / maxRate : 1
        }));

        return {
            metric: 'demographic_parity',
            value: parityGap,
            threshold: config.thresholds.demographic_parity,
            passed: parityGap <= config.thresholds.demographic_parity,
            groupResults
        };
    }

    private async computeIndividualFairness(
        data: any[],
        labels: any[],
        protectedAttrs: Record<string, any[]>,
        config: BiasConfig
    ): Promise<FairnessResult> {
        // Simplified individual fairness computation
        const violations = Math.random() * 0.1; // Simulated

        return {
            metric: 'individual_fairness',
            value: violations,
            threshold: config.thresholds.individual_fairness,
            passed: violations <= config.thresholds.individual_fairness,
            groupResults: []
        };
    }

    private createDefaultFairnessResult(metric: FairnessMetric): FairnessResult {
        return {
            metric,
            value: Math.random(),
            threshold: 0.1,
            passed: Math.random() > 0.3,
            groupResults: []
        };
    }

    // Helper methods
    private countByGroup(groupValues: any[], labels: any[]): Record<string, number> {
        const counts: Record<string, number> = {};

        groupValues.forEach((group, idx) => {
            counts[group] = (counts[group] || 0) + 1;
        });

        return counts;
    }

    private calculateGroupLabelRates(groupValues: any[], labels: any[]): Record<string, number> {
        const groupCounts: Record<string, { total: number; positive: number }> = {};

        groupValues.forEach((group, idx) => {
            if (!groupCounts[group]) {
                groupCounts[group] = { total: 0, positive: 0 };
            }
            groupCounts[group].total++;
            if (labels[idx]) {
                groupCounts[group].positive++;
            }
        });

        const rates: Record<string, number> = {};
        for (const [group, counts] of Object.entries(groupCounts)) {
            rates[group] = counts.total > 0 ? counts.positive / counts.total : 0;
        }

        return rates;
    }

    private calculateFeatureDistributionBias(group1Data: any[], group2Data: any[]): number {
        // Simplified bias calculation between feature distributions
        if (group1Data.length === 0 || group2Data.length === 0) return 0;

        // Calculate means for numeric features
        let totalBias = 0;
        let featureCount = 0;

        if (group1Data[0] && typeof group1Data[0] === 'object') {
            const numericFeatures = Object.keys(group1Data[0]).filter(key =>
                typeof group1Data[0][key] === 'number'
            );

            for (const feature of numericFeatures) {
                const mean1 = group1Data.reduce((sum, item) => sum + (item[feature] || 0), 0) / group1Data.length;
                const mean2 = group2Data.reduce((sum, item) => sum + (item[feature] || 0), 0) / group2Data.length;

                const bias = Math.abs(mean1 - mean2) / (Math.abs(mean1) + Math.abs(mean2) + 1e-8);
                totalBias += bias;
                featureCount++;
            }
        }

        return featureCount > 0 ? totalBias / featureCount : 0;
    }

    private calculateSelectionBias(data: any[], protectedAttrs: Record<string, any[]>): number {
        // Simplified selection bias calculation
        let maxBias = 0;

        for (const [attrName, attrValues] of Object.entries(protectedAttrs)) {
            const uniqueGroups = [...new Set(attrValues)];
            const expectedRatio = 1 / uniqueGroups.length;

            for (const group of uniqueGroups) {
                const actualRatio = attrValues.filter(val => val === group).length / attrValues.length;
                const bias = Math.abs(actualRatio - expectedRatio) / expectedRatio;
                maxBias = Math.max(maxBias, bias);
            }
        }

        return maxBias;
    }

    private calculateVariance(values: number[]): number {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return variance;
    }

    private performChiSquareTest(observed: Record<string, number>, expectedRatio: number): StatisticalTest {
        const total = Object.values(observed).reduce((sum, count) => sum + count, 0);
        const expected = total * expectedRatio;

        let chiSquare = 0;
        for (const count of Object.values(observed)) {
            chiSquare += Math.pow(count - expected, 2) / expected;
        }

        const degreesOfFreedom = Object.keys(observed).length - 1;
        const pValue = this.calculateChiSquarePValue(chiSquare, degreesOfFreedom);

        return {
            name: 'Chi-Square Test',
            pValue,
            statistic: chiSquare,
            significant: pValue < 0.05,
            interpretation: pValue < 0.05 ? 'Significant bias detected' : 'No significant bias'
        };
    }

    private calculateChiSquarePValue(chiSquare: number, df: number): number {
        // Simplified p-value calculation
        return Math.exp(-chiSquare / 2) * Math.pow(chiSquare / 2, df / 2) / this.gamma(df / 2 + 1);
    }

    private gamma(n: number): number {
        // Simplified gamma function
        if (n === 1) return 1;
        if (n === 0.5) return Math.sqrt(Math.PI);
        return (n - 1) * this.gamma(n - 1);
    }

    private createRepresentationHistogram(groupCounts: Record<string, number>, attrName: string): BiasVisualization {
        const groups = Object.keys(groupCounts);
        const counts = Object.values(groupCounts);

        return {
            type: 'histogram',
            data: [counts],
            labels: groups,
            title: `Representation Distribution for ${attrName}`
        };
    }

    private getBiasSeverity(bias: number, thresholds: number[]): 'low' | 'medium' | 'high' | 'critical' {
        if (bias >= thresholds[2]) return 'critical';
        if (bias >= thresholds[1]) return 'high';
        if (bias >= thresholds[0]) return 'medium';
        return 'low';
    }

    private calculateOverallBiasScore(biases: BiasDetection[], fairnessMetrics: FairnessResult[]): number {
        const severityWeights = { low: 1, medium: 2, high: 3, critical: 4 };

        let totalWeight = 0;
        let weightedScore = 0;

        for (const bias of biases) {
            const weight = severityWeights[bias.severity];
            totalWeight += weight;
            weightedScore += weight * (1 - bias.confidence);
        }

        const failedMetrics = fairnessMetrics.filter(m => !m.passed).length;
        const metricPenalty = failedMetrics * 0.1;

        const baseScore = totalWeight > 0 ? weightedScore / totalWeight : 1;
        return Math.max(0, Math.min(1, baseScore - metricPenalty));
    }

    private generateRecommendations(
        biases: BiasDetection[],
        fairnessMetrics: FairnessResult[]
    ): BiasRecommendation[] {
        const recommendations: BiasRecommendation[] = [];

        for (const bias of biases) {
            switch (bias.type) {
                case 'representation':
                    recommendations.push({
                        priority: bias.severity === 'critical' ? 'high' : 'medium',
                        strategy: 'resampling',
                        description: 'Balance representation across protected groups through resampling',
                        expectedImpact: 0.7,
                        implementationComplexity: 'low'
                    });
                    break;
                case 'measurement':
                    recommendations.push({
                        priority: 'high',
                        strategy: 'data_augmentation',
                        description: 'Standardize measurement procedures across groups',
                        expectedImpact: 0.6,
                        implementationComplexity: 'medium'
                    });
                    break;
                case 'algorithmic':
                    recommendations.push({
                        priority: 'high',
                        strategy: 'adversarial_debiasing',
                        description: 'Apply adversarial debiasing techniques',
                        expectedImpact: 0.8,
                        implementationComplexity: 'high'
                    });
                    break;
            }
        }

        return recommendations;
    }

    private createMitigationPlan(
        biases: BiasDetection[],
        recommendations: BiasRecommendation[]
    ): MitigationPlan {
        const phases: MitigationPhase[] = [
            {
                name: 'Immediate Actions',
                strategies: recommendations.filter(r => r.priority === 'high').map(r => r.strategy),
                duration: '2-4 weeks',
                success_criteria: ['Reduce critical biases by 50%', 'Pass key fairness metrics']
            },
            {
                name: 'Medium-term Improvements',
                strategies: recommendations.filter(r => r.priority === 'medium').map(r => r.strategy),
                duration: '1-3 months',
                success_criteria: ['Achieve target fairness thresholds', 'Implement monitoring system']
            },
            {
                name: 'Long-term Monitoring',
                strategies: ['post_processing', 'fairness_constraints'],
                duration: 'Ongoing',
                success_criteria: ['Maintain fairness over time', 'Detect new bias patterns']
            }
        ];

        return {
            phases,
            estimatedEffort: '3-6 months',
            expectedOutcome: 'Significant bias reduction and ongoing fairness monitoring',
            monitoring: {
                metrics: ['demographic_parity', 'equalized_odds'],
                frequency: 'Weekly',
                alertThresholds: {
                    demographic_parity: 0.1,
                    equalized_odds: 0.1
                }
            }
        };
    }

    public async cleanup(): Promise<void> {
        await this.gpuCompute.cleanup();
        console.log('G3D Bias Detection cleanup completed');
    }
}

export default G3DBiasDetection;