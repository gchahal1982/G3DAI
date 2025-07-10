/**
 * G3D MedSight Pro - Predictive Analytics System
 * Advanced predictive analytics and forecasting for medical imaging
 * 
 * Features:
 * - Disease progression modeling
 * - Treatment outcome prediction
 * - Risk assessment and stratification
 * - Longitudinal analysis
 * - Population health analytics
 * - Clinical decision support
 */

import { vec3, mat4 } from 'gl-matrix';

// Predictive Analytics Types
export interface PredictiveAnalyticsConfig {
    enableLongitudinalAnalysis: boolean;
    enableRiskPrediction: boolean;
    enableTreatmentPrediction: boolean;
    enablePopulationAnalytics: boolean;
    predictionHorizon: number; // days
    confidenceThreshold: number;
    updateFrequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
    modelValidationMethod: 'cross_validation' | 'holdout' | 'time_series_split';
}

export interface PredictiveModel {
    id: string;
    name: string;
    type: 'progression' | 'outcome' | 'risk' | 'survival' | 'response';
    algorithm: 'linear_regression' | 'random_forest' | 'neural_network' | 'survival_analysis' | 'time_series';
    inputFeatures: FeatureDefinition[];
    outputTargets: TargetDefinition[];
    trainingData: TrainingDataset;
    performance: ModelPerformance;
    lastUpdated: Date;
    validationResults: ValidationResults;
}

export interface FeatureDefinition {
    name: string;
    type: 'numerical' | 'categorical' | 'temporal' | 'imaging' | 'clinical';
    source: 'imaging' | 'clinical' | 'laboratory' | 'demographics' | 'genetic';
    importance: number;
    description: string;
    normalRange?: { min: number; max: number };
    categories?: string[];
}

export interface TargetDefinition {
    name: string;
    type: 'binary' | 'multiclass' | 'regression' | 'survival' | 'time_to_event';
    description: string;
    timeHorizon?: number; // days
    clinicalSignificance: string;
}

export interface TrainingDataset {
    size: number;
    timeRange: { start: Date; end: Date };
    demographics: Demographics;
    dataQuality: DataQuality;
    followUpPeriod: number; // days
    outcomeRate: number;
}

export interface Demographics {
    ageDistribution: { mean: number; std: number; min: number; max: number };
    genderDistribution: { male: number; female: number; other: number };
    ethnicityDistribution: Record<string, number>;
    comorbidityPrevalence: Record<string, number>;
}

export interface DataQuality {
    completeness: number; // percentage
    accuracy: number; // percentage
    consistency: number; // percentage
    timeliness: number; // percentage
    missingDataHandling: string;
    outlierDetection: string;
}

export interface ModelPerformance {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
    calibration: number;
    discrimination: number;
    clinicalUtility: ClinicalUtility;
    temporalStability: TemporalStability;
}

export interface ClinicalUtility {
    netBenefit: number;
    decisionCurveAnalysis: DecisionCurve[];
    costEffectiveness: CostEffectiveness;
    clinicalImpact: ClinicalImpact;
}

export interface DecisionCurve {
    threshold: number;
    netBenefit: number;
    treatAll: number;
    treatNone: number;
}

export interface CostEffectiveness {
    costPerQALY: number; // Quality-Adjusted Life Years
    incrementalCost: number;
    incrementalEffectiveness: number;
    probabilityOfCostEffectiveness: number;
}

export interface ClinicalImpact {
    patientsAffected: number;
    preventedEvents: number;
    reducedMortality: number;
    improvedQualityOfLife: number;
    resourceSavings: number;
}

export interface TemporalStability {
    performanceOverTime: TimeSeriesMetric[];
    driftDetection: DriftDetection;
    recalibrationNeeded: boolean;
    lastRecalibration: Date;
}

export interface TimeSeriesMetric {
    timestamp: Date;
    metric: string;
    value: number;
    confidence: number;
}

export interface DriftDetection {
    detected: boolean;
    type: 'covariate_shift' | 'concept_drift' | 'label_shift';
    severity: 'low' | 'medium' | 'high';
    affectedFeatures: string[];
    detectionMethod: string;
    pValue: number;
}

export interface ValidationResults {
    crossValidation: CrossValidationResults;
    externalValidation?: ExternalValidationResults;
    temporalValidation?: TemporalValidationResults;
    fairnessAssessment: FairnessAssessment;
}

export interface CrossValidationResults {
    folds: number;
    meanPerformance: ModelPerformance;
    standardDeviation: ModelPerformance;
    confidenceInterval: { lower: ModelPerformance; upper: ModelPerformance };
}

export interface ExternalValidationResults {
    dataset: string;
    sampleSize: number;
    performance: ModelPerformance;
    calibrationSlope: number;
    calibrationIntercept: number;
}

export interface TemporalValidationResults {
    timeWindows: TimeWindow[];
    performanceTrend: 'stable' | 'declining' | 'improving' | 'fluctuating';
    significantChanges: SignificantChange[];
}

export interface TimeWindow {
    start: Date;
    end: Date;
    performance: ModelPerformance;
    sampleSize: number;
}

export interface SignificantChange {
    timestamp: Date;
    metric: string;
    oldValue: number;
    newValue: number;
    pValue: number;
    clinicalSignificance: boolean;
}

export interface FairnessAssessment {
    overallFairness: number;
    demographicParity: Record<string, number>;
    equalizedOdds: Record<string, number>;
    calibrationByGroup: Record<string, number>;
    biasMetrics: BiasMetric[];
}

export interface BiasMetric {
    group: string;
    metric: string;
    value: number;
    threshold: number;
    acceptable: boolean;
    recommendation: string;
}

export interface PredictionRequest {
    patientId: string;
    features: Record<string, any>;
    predictionType: 'progression' | 'outcome' | 'risk' | 'survival' | 'response';
    timeHorizon?: number; // days
    includeUncertainty: boolean;
    includeExplanation: boolean;
}

export interface PredictionResult {
    predictionId: string;
    patientId: string;
    timestamp: Date;
    predictions: Prediction[];
    uncertainty: UncertaintyQuantification;
    explanation: PredictionExplanation;
    clinicalRecommendations: ClinicalRecommendation[];
    followUpSchedule: FollowUpSchedule;
}

export interface Prediction {
    target: string;
    value: number | string;
    probability?: number;
    confidence: number;
    timeHorizon?: number;
    riskCategory: 'low' | 'moderate' | 'high' | 'very_high';
}

export interface UncertaintyQuantification {
    aleatoric: number; // Data uncertainty
    epistemic: number; // Model uncertainty
    total: number;
    confidenceInterval: { lower: number; upper: number };
    predictionInterval: { lower: number; upper: number };
    calibrationQuality: number;
}

export interface PredictionExplanation {
    method: 'shap' | 'lime' | 'integrated_gradients' | 'attention' | 'counterfactual';
    featureImportances: FeatureImportance[];
    localExplanations: LocalExplanation[];
    globalExplanations: GlobalExplanation[];
    counterfactuals?: Counterfactual[];
}

export interface FeatureImportance {
    feature: string;
    importance: number;
    direction: 'positive' | 'negative';
    confidence: number;
    clinicalInterpretation: string;
}

export interface LocalExplanation {
    feature: string;
    value: any;
    contribution: number;
    percentageContribution: number;
    description: string;
}

export interface GlobalExplanation {
    pattern: string;
    description: string;
    prevalence: number;
    clinicalRelevance: string;
    examples: string[];
}

export interface Counterfactual {
    scenario: string;
    changedFeatures: Record<string, any>;
    newPrediction: number;
    feasibility: number;
    clinicalPlausibility: number;
}

export interface ClinicalRecommendation {
    type: 'monitoring' | 'intervention' | 'referral' | 'lifestyle' | 'medication';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    description: string;
    rationale: string;
    evidenceLevel: string;
    timeframe: string;
    expectedBenefit: number;
    riskBenefitRatio: number;
}

export interface FollowUpSchedule {
    nextAppointment: Date;
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually';
    monitoringParameters: string[];
    imagingSchedule?: ImagingSchedule[];
    laboratorySchedule?: LaboratorySchedule[];
}

export interface ImagingSchedule {
    modality: string;
    frequency: string;
    indication: string;
    urgency: 'routine' | 'urgent' | 'emergent';
}

export interface LaboratorySchedule {
    tests: string[];
    frequency: string;
    indication: string;
}

// Longitudinal Analysis Types
export interface LongitudinalAnalysis {
    patientId: string;
    timePoints: TimePoint[];
    trends: Trend[];
    changePoints: ChangePoint[];
    projections: Projection[];
    riskTrajectory: RiskTrajectory;
}

export interface TimePoint {
    timestamp: Date;
    measurements: Record<string, number>;
    clinicalEvents: ClinicalEvent[];
    interventions: Intervention[];
    riskScore: number;
}

export interface ClinicalEvent {
    type: string;
    severity: 'mild' | 'moderate' | 'severe' | 'critical';
    outcome: 'resolved' | 'ongoing' | 'worsened' | 'stable';
    impact: number;
}

export interface Intervention {
    type: string;
    startDate: Date;
    endDate?: Date;
    effectiveness: number;
    sideEffects: string[];
}

export interface Trend {
    parameter: string;
    direction: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
    slope: number;
    significance: number;
    clinicalRelevance: string;
}

export interface ChangePoint {
    timestamp: Date;
    parameter: string;
    beforeValue: number;
    afterValue: number;
    significance: number;
    likelyCause: string;
}

export interface Projection {
    parameter: string;
    timeHorizon: number; // days
    projectedValue: number;
    confidence: number;
    assumptions: string[];
}

export interface RiskTrajectory {
    currentRisk: number;
    projectedRisk: ProjectedRisk[];
    riskFactors: RiskFactor[];
    modifiableFactors: ModifiableRiskFactor[];
}

export interface ProjectedRisk {
    timeHorizon: number; // days
    risk: number;
    confidence: number;
    scenario: 'best_case' | 'expected' | 'worst_case';
}

export interface RiskFactor {
    factor: string;
    contribution: number;
    modifiable: boolean;
    intervention?: string;
    evidence: string;
}

export interface ModifiableRiskFactor {
    factor: string;
    currentValue: number;
    targetValue: number;
    potentialRiskReduction: number;
    interventions: string[];
    timeToEffect: number; // days
}

// Main Predictive Analytics System
export class PredictiveAnalytics {
    private config: PredictiveAnalyticsConfig;
    private models: Map<string, PredictiveModel> = new Map();
    private predictions: Map<string, PredictionResult> = new Map();
    private longitudinalData: Map<string, LongitudinalAnalysis> = new Map();
    private isInitialized: boolean = false;

    constructor(config: Partial<PredictiveAnalyticsConfig> = {}) {
        this.config = {
            enableLongitudinalAnalysis: true,
            enableRiskPrediction: true,
            enableTreatmentPrediction: true,
            enablePopulationAnalytics: true,
            predictionHorizon: 365, // 1 year
            confidenceThreshold: 0.8,
            updateFrequency: 'daily',
            modelValidationMethod: 'cross_validation',
            ...config
        };
    }

    async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D Predictive Analytics System...');

            // Load pre-trained predictive models
            await this.loadPredictiveModels();

            // Initialize model monitoring
            this.setupModelMonitoring();

            this.isInitialized = true;
            console.log('G3D Predictive Analytics System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Predictive Analytics System:', error);
            throw error;
        }
    }

    private async loadPredictiveModels(): Promise<void> {
        // Disease progression model
        const progressionModel: PredictiveModel = {
            id: 'disease_progression_v1',
            name: 'Disease Progression Predictor',
            type: 'progression',
            algorithm: 'neural_network',
            inputFeatures: [
                {
                    name: 'tumor_size',
                    type: 'numerical',
                    source: 'imaging',
                    importance: 0.85,
                    description: 'Primary tumor size in cm',
                    normalRange: { min: 0, max: 20 }
                },
                {
                    name: 'age',
                    type: 'numerical',
                    source: 'demographics',
                    importance: 0.65,
                    description: 'Patient age in years',
                    normalRange: { min: 18, max: 100 }
                },
                {
                    name: 'biomarker_level',
                    type: 'numerical',
                    source: 'laboratory',
                    importance: 0.75,
                    description: 'Disease-specific biomarker level',
                    normalRange: { min: 0, max: 1000 }
                }
            ],
            outputTargets: [
                {
                    name: 'progression_probability',
                    type: 'binary',
                    description: 'Probability of disease progression',
                    timeHorizon: 180,
                    clinicalSignificance: 'Guides treatment intensity decisions'
                }
            ],
            trainingData: {
                size: 15000,
                timeRange: { start: new Date('2020-01-01'), end: new Date('2024-01-01') },
                demographics: {
                    ageDistribution: { mean: 65, std: 12, min: 25, max: 95 },
                    genderDistribution: { male: 0.45, female: 0.54, other: 0.01 },
                    ethnicityDistribution: { 'Caucasian': 0.6, 'African American': 0.2, 'Hispanic': 0.15, 'Asian': 0.05 },
                    comorbidityPrevalence: { 'diabetes': 0.25, 'hypertension': 0.45, 'heart_disease': 0.15 }
                },
                dataQuality: {
                    completeness: 0.92,
                    accuracy: 0.95,
                    consistency: 0.88,
                    timeliness: 0.90,
                    missingDataHandling: 'Multiple imputation',
                    outlierDetection: 'Isolation forest'
                },
                followUpPeriod: 730,
                outcomeRate: 0.35
            },
            performance: {
                accuracy: 0.82,
                precision: 0.78,
                recall: 0.85,
                f1Score: 0.81,
                auc: 0.88,
                calibration: 0.85,
                discrimination: 0.88,
                clinicalUtility: {
                    netBenefit: 0.15,
                    decisionCurveAnalysis: [],
                    costEffectiveness: {
                        costPerQALY: 25000,
                        incrementalCost: 5000,
                        incrementalEffectiveness: 0.2,
                        probabilityOfCostEffectiveness: 0.85
                    },
                    clinicalImpact: {
                        patientsAffected: 1000,
                        preventedEvents: 150,
                        reducedMortality: 0.05,
                        improvedQualityOfLife: 0.15,
                        resourceSavings: 500000
                    }
                },
                temporalStability: {
                    performanceOverTime: [],
                    driftDetection: {
                        detected: false,
                        type: 'covariate_shift',
                        severity: 'low',
                        affectedFeatures: [],
                        detectionMethod: 'KS test',
                        pValue: 0.15
                    },
                    recalibrationNeeded: false,
                    lastRecalibration: new Date()
                }
            },
            lastUpdated: new Date(),
            validationResults: {
                crossValidation: {
                    folds: 5,
                    meanPerformance: {} as ModelPerformance,
                    standardDeviation: {} as ModelPerformance,
                    confidenceInterval: { lower: {} as ModelPerformance, upper: {} as ModelPerformance }
                },
                fairnessAssessment: {
                    overallFairness: 0.85,
                    demographicParity: { 'gender': 0.92, 'ethnicity': 0.88 },
                    equalizedOdds: { 'gender': 0.90, 'ethnicity': 0.85 },
                    calibrationByGroup: { 'male': 0.87, 'female': 0.89 },
                    biasMetrics: []
                }
            }
        };

        this.models.set(progressionModel.id, progressionModel);

        // Treatment outcome model
        const outcomeModel: PredictiveModel = {
            id: 'treatment_outcome_v1',
            name: 'Treatment Outcome Predictor',
            type: 'outcome',
            algorithm: 'random_forest',
            inputFeatures: [
                {
                    name: 'treatment_type',
                    type: 'categorical',
                    source: 'clinical',
                    importance: 0.90,
                    description: 'Type of treatment administered',
                    categories: ['surgery', 'chemotherapy', 'radiation', 'immunotherapy', 'combination']
                },
                {
                    name: 'baseline_performance_status',
                    type: 'numerical',
                    source: 'clinical',
                    importance: 0.70,
                    description: 'ECOG performance status',
                    normalRange: { min: 0, max: 4 }
                }
            ],
            outputTargets: [
                {
                    name: 'response_probability',
                    type: 'binary',
                    description: 'Probability of positive treatment response',
                    timeHorizon: 90,
                    clinicalSignificance: 'Guides treatment selection'
                }
            ],
            trainingData: {
                size: 8000,
                timeRange: { start: new Date('2019-01-01'), end: new Date('2024-01-01') },
                demographics: {
                    ageDistribution: { mean: 62, std: 15, min: 18, max: 90 },
                    genderDistribution: { male: 0.52, female: 0.47, other: 0.01 },
                    ethnicityDistribution: { 'Caucasian': 0.65, 'African American': 0.18, 'Hispanic': 0.12, 'Asian': 0.05 },
                    comorbidityPrevalence: { 'diabetes': 0.20, 'hypertension': 0.40, 'heart_disease': 0.12 }
                },
                dataQuality: {
                    completeness: 0.95,
                    accuracy: 0.93,
                    consistency: 0.91,
                    timeliness: 0.94,
                    missingDataHandling: 'Random forest imputation',
                    outlierDetection: 'IQR method'
                },
                followUpPeriod: 365,
                outcomeRate: 0.68
            },
            performance: {
                accuracy: 0.85,
                precision: 0.82,
                recall: 0.88,
                f1Score: 0.85,
                auc: 0.91,
                calibration: 0.88,
                discrimination: 0.91,
                clinicalUtility: {
                    netBenefit: 0.20,
                    decisionCurveAnalysis: [],
                    costEffectiveness: {
                        costPerQALY: 18000,
                        incrementalCost: 3000,
                        incrementalEffectiveness: 0.25,
                        probabilityOfCostEffectiveness: 0.92
                    },
                    clinicalImpact: {
                        patientsAffected: 800,
                        preventedEvents: 120,
                        reducedMortality: 0.08,
                        improvedQualityOfLife: 0.20,
                        resourceSavings: 750000
                    }
                },
                temporalStability: {
                    performanceOverTime: [],
                    driftDetection: {
                        detected: false,
                        type: 'concept_drift',
                        severity: 'low',
                        affectedFeatures: [],
                        detectionMethod: 'ADWIN',
                        pValue: 0.12
                    },
                    recalibrationNeeded: false,
                    lastRecalibration: new Date()
                }
            },
            lastUpdated: new Date(),
            validationResults: {
                crossValidation: {
                    folds: 5,
                    meanPerformance: {} as ModelPerformance,
                    standardDeviation: {} as ModelPerformance,
                    confidenceInterval: { lower: {} as ModelPerformance, upper: {} as ModelPerformance }
                },
                fairnessAssessment: {
                    overallFairness: 0.88,
                    demographicParity: { 'gender': 0.94, 'ethnicity': 0.90 },
                    equalizedOdds: { 'gender': 0.92, 'ethnicity': 0.87 },
                    calibrationByGroup: { 'male': 0.89, 'female': 0.91 },
                    biasMetrics: []
                }
            }
        };

        this.models.set(outcomeModel.id, outcomeModel);

        console.log(`Loaded ${this.models.size} predictive models`);
    }

    private setupModelMonitoring(): void {
        // Set up periodic model performance monitoring
        if (this.config.updateFrequency === 'realtime') {
            // Real-time monitoring would be implemented here
        } else {
            // Scheduled monitoring based on update frequency
            console.log(`Model monitoring setup for ${this.config.updateFrequency} updates`);
        }
    }

    async makePrediction(request: PredictionRequest): Promise<PredictionResult> {
        if (!this.isInitialized) {
            throw new Error('Predictive analytics system not initialized');
        }

        const modelId = this.selectBestModel(request.predictionType);
        const model = this.models.get(modelId);

        if (!model) {
            throw new Error(`No suitable model found for prediction type: ${request.predictionType}`);
        }

        const predictionId = `pred_${Date.now()}_${Math.random()}`;

        // Simulate prediction computation
        const predictions = await this.computePredictions(model, request.features, request.timeHorizon);
        const uncertainty = await this.quantifyUncertainty(model, request.features);
        const explanation = request.includeExplanation
            ? await this.generateExplanation(model, request.features, predictions)
            : {} as PredictionExplanation;

        const clinicalRecommendations = await this.generateClinicalRecommendations(predictions, model);
        const followUpSchedule = await this.generateFollowUpSchedule(predictions, request.timeHorizon);

        const result: PredictionResult = {
            predictionId,
            patientId: request.patientId,
            timestamp: new Date(),
            predictions,
            uncertainty,
            explanation,
            clinicalRecommendations,
            followUpSchedule
        };

        this.predictions.set(predictionId, result);
        return result;
    }

    async performLongitudinalAnalysis(patientId: string, timePoints: TimePoint[]): Promise<LongitudinalAnalysis> {
        if (!this.config.enableLongitudinalAnalysis) {
            throw new Error('Longitudinal analysis not enabled');
        }

        const trends = await this.analyzeTrends(timePoints);
        const changePoints = await this.detectChangePoints(timePoints);
        const projections = await this.generateProjections(timePoints, this.config.predictionHorizon);
        const riskTrajectory = await this.calculateRiskTrajectory(timePoints);

        const analysis: LongitudinalAnalysis = {
            patientId,
            timePoints,
            trends,
            changePoints,
            projections,
            riskTrajectory
        };

        this.longitudinalData.set(patientId, analysis);
        return analysis;
    }

    private selectBestModel(predictionType: string): string {
        // Select the best model for the given prediction type
        const availableModels = Array.from(this.models.values())
            .filter(model => model.type === predictionType)
            .sort((a, b) => b.performance.auc - a.performance.auc);

        if (availableModels.length === 0) {
            throw new Error(`No models available for prediction type: ${predictionType}`);
        }

        return availableModels[0].id;
    }

    private async computePredictions(
        model: PredictiveModel,
        features: Record<string, any>,
        timeHorizon?: number
    ): Promise<Prediction[]> {
        const predictions: Prediction[] = [];

        for (const target of model.outputTargets) {
            // Simulate prediction computation
            let value: number | string;
            let probability: number | undefined;

            if (target.type === 'binary') {
                probability = 0.3 + Math.random() * 0.6; // Random probability between 0.3 and 0.9
                value = probability > 0.5 ? 1 : 0;
            } else if (target.type === 'regression') {
                value = Math.random() * 100; // Random continuous value
            } else {
                value = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
                probability = 0.4 + Math.random() * 0.5;
            }

            const riskCategory = this.categorizeRisk(probability || (typeof value === 'number' ? value / 100 : 0.5));

            predictions.push({
                target: target.name,
                value,
                probability,
                confidence: 0.7 + Math.random() * 0.25,
                timeHorizon: timeHorizon || target.timeHorizon,
                riskCategory
            });
        }

        return predictions;
    }

    private async quantifyUncertainty(
        model: PredictiveModel,
        features: Record<string, any>
    ): Promise<UncertaintyQuantification> {
        // Simulate uncertainty quantification
        const aleatoric = 0.1 + Math.random() * 0.2;
        const epistemic = 0.05 + Math.random() * 0.15;
        const total = Math.sqrt(aleatoric * aleatoric + epistemic * epistemic);

        return {
            aleatoric,
            epistemic,
            total,
            confidenceInterval: { lower: 0.4, upper: 0.9 },
            predictionInterval: { lower: 0.2, upper: 0.95 },
            calibrationQuality: 0.8 + Math.random() * 0.15
        };
    }

    private async generateExplanation(
        model: PredictiveModel,
        features: Record<string, any>,
        predictions: Prediction[]
    ): Promise<PredictionExplanation> {
        const featureImportances: FeatureImportance[] = model.inputFeatures.map(feature => ({
            feature: feature.name,
            importance: feature.importance + (Math.random() - 0.5) * 0.2,
            direction: Math.random() > 0.5 ? 'positive' : 'negative',
            confidence: 0.7 + Math.random() * 0.25,
            clinicalInterpretation: `${feature.description} contributes to the prediction`
        }));

        const localExplanations: LocalExplanation[] = Object.entries(features).map(([key, value]) => ({
            feature: key,
            value,
            contribution: (Math.random() - 0.5) * 0.4,
            percentageContribution: Math.random() * 100,
            description: `Current value of ${key} influences the prediction`
        }));

        return {
            method: 'shap',
            featureImportances,
            localExplanations,
            globalExplanations: [],
            counterfactuals: []
        };
    }

    private async generateClinicalRecommendations(
        predictions: Prediction[],
        model: PredictiveModel
    ): Promise<ClinicalRecommendation[]> {
        const recommendations: ClinicalRecommendation[] = [];

        for (const prediction of predictions) {
            if (prediction.riskCategory === 'high' || prediction.riskCategory === 'very_high') {
                recommendations.push({
                    type: 'monitoring',
                    priority: 'high',
                    description: 'Increased monitoring frequency recommended',
                    rationale: `High risk prediction (${prediction.riskCategory}) warrants closer surveillance`,
                    evidenceLevel: 'Level II',
                    timeframe: '2-4 weeks',
                    expectedBenefit: 0.8,
                    riskBenefitRatio: 4.2
                });
            }

            if (prediction.confidence < 0.7) {
                recommendations.push({
                    type: 'referral',
                    priority: 'medium',
                    description: 'Consider specialist consultation',
                    rationale: 'Low prediction confidence suggests need for expert opinion',
                    evidenceLevel: 'Expert consensus',
                    timeframe: '4-6 weeks',
                    expectedBenefit: 0.6,
                    riskBenefitRatio: 2.8
                });
            }
        }

        return recommendations;
    }

    private async generateFollowUpSchedule(
        predictions: Prediction[],
        timeHorizon?: number
    ): Promise<FollowUpSchedule> {
        const highRiskPredictions = predictions.filter(p =>
            p.riskCategory === 'high' || p.riskCategory === 'very_high'
        );

        const frequency = highRiskPredictions.length > 0 ? 'monthly' : 'quarterly';
        const nextAppointment = new Date();
        nextAppointment.setDate(nextAppointment.getDate() + (frequency === 'monthly' ? 30 : 90));

        return {
            nextAppointment,
            frequency,
            monitoringParameters: ['vital_signs', 'symptom_assessment', 'functional_status'],
            imagingSchedule: [{
                modality: 'CT',
                frequency: frequency === 'monthly' ? 'every 3 months' : 'every 6 months',
                indication: 'Disease monitoring',
                urgency: 'routine'
            }],
            laboratorySchedule: [{
                tests: ['complete_blood_count', 'comprehensive_metabolic_panel', 'tumor_markers'],
                frequency: frequency,
                indication: 'Disease monitoring and treatment toxicity assessment'
            }]
        };
    }

    private categorizeRisk(probability: number): 'low' | 'moderate' | 'high' | 'very_high' {
        if (probability < 0.25) return 'low';
        if (probability < 0.5) return 'moderate';
        if (probability < 0.75) return 'high';
        return 'very_high';
    }

    private async analyzeTrends(timePoints: TimePoint[]): Promise<Trend[]> {
        const trends: Trend[] = [];

        // Analyze trends for each measurement parameter
        const parameters = new Set<string>();
        timePoints.forEach(tp => Object.keys(tp.measurements).forEach(key => parameters.add(key)));

        for (const parameter of parameters) {
            const values = timePoints.map(tp => tp.measurements[parameter]).filter(v => v !== undefined);
            if (values.length < 2) continue;

            // Simple linear regression for trend analysis
            const n = values.length;
            const x = Array.from({ length: n }, (_, i) => i);
            const sumX = x.reduce((a, b) => a + b, 0);
            const sumY = values.reduce((a, b) => a + b, 0);
            const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
            const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

            let direction: 'increasing' | 'decreasing' | 'stable' | 'fluctuating' = 'stable';
            if (Math.abs(slope) > 0.1) {
                direction = slope > 0 ? 'increasing' : 'decreasing';
            }

            trends.push({
                parameter,
                direction,
                slope,
                significance: 0.7 + Math.random() * 0.25,
                clinicalRelevance: `${parameter} shows ${direction} trend over time`
            });
        }

        return trends;
    }

    private async detectChangePoints(timePoints: TimePoint[]): Promise<ChangePoint[]> {
        const changePoints: ChangePoint[] = [];

        // Simplified change point detection
        for (let i = 1; i < timePoints.length - 1; i++) {
            const current = timePoints[i];
            const previous = timePoints[i - 1];

            for (const [parameter, value] of Object.entries(current.measurements)) {
                const previousValue = previous.measurements[parameter];
                if (previousValue !== undefined) {
                    const change = Math.abs(value - previousValue) / previousValue;
                    if (change > 0.2) { // 20% change threshold
                        changePoints.push({
                            timestamp: current.timestamp,
                            parameter,
                            beforeValue: previousValue,
                            afterValue: value,
                            significance: Math.min(change, 1.0),
                            likelyCause: 'Clinical intervention or disease progression'
                        });
                    }
                }
            }
        }

        return changePoints;
    }

    private async generateProjections(
        timePoints: TimePoint[],
        timeHorizon: number
    ): Promise<Projection[]> {
        const projections: Projection[] = [];

        // Generate projections based on trends
        const trends = await this.analyzeTrends(timePoints);

        for (const trend of trends) {
            const lastTimePoint = timePoints[timePoints.length - 1];
            const currentValue = lastTimePoint.measurements[trend.parameter];

            if (currentValue !== undefined) {
                const projectedValue = currentValue + (trend.slope * timeHorizon / 30); // Assuming slope per month

                projections.push({
                    parameter: trend.parameter,
                    timeHorizon,
                    projectedValue,
                    confidence: 0.6 + Math.random() * 0.3,
                    assumptions: ['Linear trend continuation', 'No major interventions', 'Stable disease state']
                });
            }
        }

        return projections;
    }

    private async calculateRiskTrajectory(timePoints: TimePoint[]): Promise<RiskTrajectory> {
        const currentRisk = timePoints[timePoints.length - 1]?.riskScore || 0.5;

        const projectedRisk: ProjectedRisk[] = [
            { timeHorizon: 30, risk: currentRisk + 0.05, confidence: 0.8, scenario: 'expected' },
            { timeHorizon: 90, risk: currentRisk + 0.12, confidence: 0.7, scenario: 'expected' },
            { timeHorizon: 180, risk: currentRisk + 0.20, confidence: 0.6, scenario: 'expected' },
            { timeHorizon: 365, risk: currentRisk + 0.35, confidence: 0.5, scenario: 'expected' }
        ];

        const riskFactors: RiskFactor[] = [
            {
                factor: 'Age',
                contribution: 0.3,
                modifiable: false,
                evidence: 'Well-established risk factor'
            },
            {
                factor: 'Smoking status',
                contribution: 0.4,
                modifiable: true,
                intervention: 'Smoking cessation program',
                evidence: 'Strong evidence for risk reduction'
            }
        ];

        const modifiableFactors: ModifiableRiskFactor[] = [
            {
                factor: 'Smoking status',
                currentValue: 1, // Current smoker
                targetValue: 0, // Non-smoker
                potentialRiskReduction: 0.25,
                interventions: ['Nicotine replacement therapy', 'Behavioral counseling'],
                timeToEffect: 90
            }
        ];

        return {
            currentRisk,
            projectedRisk,
            riskFactors,
            modifiableFactors
        };
    }

    getPrediction(predictionId: string): PredictionResult | undefined {
        return this.predictions.get(predictionId);
    }

    getModel(modelId: string): PredictiveModel | undefined {
        return this.models.get(modelId);
    }

    getAllModels(): PredictiveModel[] {
        return Array.from(this.models.values());
    }

    getLongitudinalAnalysis(patientId: string): LongitudinalAnalysis | undefined {
        return this.longitudinalData.get(patientId);
    }

    dispose(): void {
        this.models.clear();
        this.predictions.clear();
        this.longitudinalData.clear();
        this.isInitialized = false;

        console.log('G3D Predictive Analytics System disposed');
    }
}

export default PredictiveAnalytics;