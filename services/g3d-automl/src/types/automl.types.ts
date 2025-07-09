/**
 * G3D AutoML - Machine Learning Automation TypeScript Definitions
 */

// Core ML Pipeline Types
export interface MLPipeline {
    id: string;
    name: string;
    description: string;
    type: PipelineType;
    status: PipelineStatus;
    steps: PipelineStep[];
    configuration: PipelineConfiguration;
    createdAt: Date;
    lastRun?: Date;
    owner: string;
}

export type PipelineType =
    | 'classification'
    | 'regression'
    | 'clustering'
    | 'anomaly-detection'
    | 'time-series'
    | 'computer-vision'
    | 'nlp'
    | 'recommendation';

export type PipelineStatus =
    | 'draft'
    | 'training'
    | 'completed'
    | 'failed'
    | 'deployed'
    | 'archived';

export interface PipelineStep {
    id: string;
    name: string;
    type: StepType;
    status: StepStatus;
    configuration: StepConfiguration;
    executionTime?: number;
    output?: StepOutput;
}

export type StepType =
    | 'data-ingestion'
    | 'data-cleaning'
    | 'feature-engineering'
    | 'feature-selection'
    | 'model-training'
    | 'model-evaluation'
    | 'hyperparameter-tuning'
    | 'model-deployment';

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface StepConfiguration {
    parameters: Record<string, any>;
    resources: ResourceRequirements;
    timeout: number;
    retries: number;
}

export interface ResourceRequirements {
    cpu: number;
    memory: number; // GB
    gpu?: number;
    storage: number; // GB
}

export interface StepOutput {
    metrics: Record<string, number>;
    artifacts: Artifact[];
    logs: string[];
}

export interface Artifact {
    id: string;
    name: string;
    type: ArtifactType;
    path: string;
    size: number;
    metadata: Record<string, any>;
}

export type ArtifactType =
    | 'model'
    | 'dataset'
    | 'feature-set'
    | 'report'
    | 'visualization'
    | 'log';

export interface PipelineConfiguration {
    targetColumn: string;
    problemType: PipelineType;
    evaluationMetric: string;
    crossValidation: CrossValidationConfig;
    featureEngineering: FeatureEngineeringConfig;
    modelSelection: ModelSelectionConfig;
    hyperparameterTuning: HyperparameterConfig;
}

export interface ModelSelectionConfig {
    algorithms: MLAlgorithm[];
    ensembleMethods: EnsembleMethod[];
    selectionCriteria: string;
    maxModels: number;
}

// Dataset Types
export interface Dataset {
    id: string;
    name: string;
    description: string;
    type: DatasetType;
    source: DataSource;
    schema: DataSchema;
    statistics: DataStatistics;
    status: DatasetStatus;
    createdAt: Date;
    lastUpdated: Date;
    size: number;
    rowCount: number;
}

export type DatasetType =
    | 'tabular'
    | 'image'
    | 'text'
    | 'audio'
    | 'video'
    | 'time-series'
    | 'graph';

export interface DataSource {
    type: 'file' | 'database' | 'api' | 'stream';
    location: string;
    credentials?: Record<string, string>;
    format: string;
}

export interface DataSchema {
    columns: DataColumn[];
    primaryKey?: string[];
    foreignKeys: ForeignKey[];
}

export interface DataColumn {
    name: string;
    type: DataType;
    nullable: boolean;
    unique: boolean;
    description?: string;
    constraints?: ColumnConstraint[];
}

export type DataType =
    | 'integer'
    | 'float'
    | 'string'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'categorical'
    | 'binary'
    | 'text'
    | 'image'
    | 'audio';

export interface ColumnConstraint {
    type: 'min' | 'max' | 'range' | 'pattern' | 'enum';
    value: any;
}

export interface ForeignKey {
    columns: string[];
    referencedTable: string;
    referencedColumns: string[];
}

export interface DataStatistics {
    rowCount: number;
    columnCount: number;
    missingValues: Record<string, number>;
    duplicateRows: number;
    dataQuality: number; // 0-100
    distribution: Record<string, ColumnDistribution>;
}

export interface ColumnDistribution {
    type: 'numerical' | 'categorical' | 'temporal';
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    mode?: any;
    standardDeviation?: number;
    uniqueValues: number;
    topValues?: Array<{ value: any; count: number }>;
}

export type DatasetStatus = 'uploading' | 'processing' | 'ready' | 'error';

// Model Types
export interface MLModel {
    id: string;
    name: string;
    type: ModelType;
    algorithm: MLAlgorithm;
    version: string;
    status: ModelStatus;
    metrics: ModelMetrics;
    hyperparameters: Record<string, any>;
    features: ModelFeature[];
    trainingConfig: TrainingConfiguration;
    deploymentConfig?: DeploymentConfig;
    createdAt: Date;
    trainedAt?: Date;
    deployedAt?: Date;
}

export type ModelType =
    | 'supervised'
    | 'unsupervised'
    | 'semi-supervised'
    | 'reinforcement';

export type MLAlgorithm =
    | 'linear-regression'
    | 'logistic-regression'
    | 'decision-tree'
    | 'random-forest'
    | 'gradient-boosting'
    | 'xgboost'
    | 'lightgbm'
    | 'catboost'
    | 'svm'
    | 'knn'
    | 'naive-bayes'
    | 'neural-network'
    | 'cnn'
    | 'rnn'
    | 'lstm'
    | 'transformer'
    | 'kmeans'
    | 'dbscan'
    | 'isolation-forest';

export type ModelStatus =
    | 'training'
    | 'trained'
    | 'evaluating'
    | 'ready'
    | 'deployed'
    | 'failed'
    | 'deprecated';

export interface ModelMetrics {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    auc?: number;
    rmse?: number;
    mae?: number;
    r2Score?: number;
    silhouetteScore?: number;
    confusionMatrix?: number[][];
    featureImportance: Record<string, number>;
    crossValidationScores: number[];
    trainingTime: number;
    inferenceTime: number;
}

export interface ModelFeature {
    name: string;
    type: DataType;
    importance: number;
    transformation?: FeatureTransformation;
    encoding?: FeatureEncoding;
}

export interface FeatureTransformation {
    type: 'scaling' | 'normalization' | 'log' | 'polynomial' | 'binning';
    parameters: Record<string, any>;
}

export interface FeatureEncoding {
    type: 'one-hot' | 'label' | 'target' | 'binary' | 'ordinal';
    mapping: Record<string, any>;
}

export interface TrainingConfiguration {
    trainTestSplit: number;
    validationSplit: number;
    randomSeed: number;
    epochs?: number;
    batchSize?: number;
    learningRate?: number;
    earlyStopping?: EarlyStoppingConfig;
    regularization?: RegularizationConfig;
}

export interface EarlyStoppingConfig {
    monitor: string;
    patience: number;
    minDelta: number;
    restoreBestWeights: boolean;
}

export interface RegularizationConfig {
    l1: number;
    l2: number;
    dropout?: number;
}

// Experiment Types
export interface AutoMLExperiment {
    id: string;
    name: string;
    description: string;
    datasetId: string;
    configuration: ExperimentConfiguration;
    status: ExperimentStatus;
    models: MLModel[];
    bestModel?: string;
    results: ExperimentResults;
    startedAt: Date;
    completedAt?: Date;
    duration?: number;
}

export interface ExperimentConfiguration {
    problemType: PipelineType;
    targetColumn: string;
    timeLimit: number; // minutes
    modelTypes: MLAlgorithm[];
    featureEngineering: FeatureEngineeringConfig;
    hyperparameterTuning: HyperparameterConfig;
    ensembleMethods: EnsembleMethod[];
}

export interface FeatureEngineeringConfig {
    enabled: boolean;
    methods: FeatureMethod[];
    maxFeatures: number;
    selectionCriteria: FeatureSelectionCriteria;
}

export type FeatureMethod =
    | 'polynomial'
    | 'interaction'
    | 'binning'
    | 'scaling'
    | 'encoding'
    | 'embedding';

export interface FeatureSelectionCriteria {
    method: 'correlation' | 'mutual-info' | 'chi2' | 'anova' | 'rfe';
    threshold: number;
    maxFeatures: number;
}

export interface HyperparameterConfig {
    enabled: boolean;
    method: 'grid-search' | 'random-search' | 'bayesian' | 'genetic';
    iterations: number;
    crossValidation: CrossValidationConfig;
    searchSpace: Record<string, ParameterSpace>;
}

export interface ParameterSpace {
    type: 'categorical' | 'integer' | 'float' | 'boolean';
    values?: any[];
    min?: number;
    max?: number;
    step?: number;
}

export interface CrossValidationConfig {
    method: 'k-fold' | 'stratified' | 'time-series' | 'group';
    folds: number;
    shuffle: boolean;
    randomState: number;
}

export type EnsembleMethod =
    | 'voting'
    | 'bagging'
    | 'boosting'
    | 'stacking'
    | 'blending';

export type ExperimentStatus =
    | 'queued'
    | 'running'
    | 'completed'
    | 'failed'
    | 'cancelled';

export interface ExperimentResults {
    bestScore: number;
    bestModel: string;
    leaderboard: ModelRanking[];
    insights: ExperimentInsight[];
    recommendations: string[];
    resourceUsage: ResourceUsage;
}

export interface ModelRanking {
    modelId: string;
    algorithm: MLAlgorithm;
    score: number;
    rank: number;
    metrics: ModelMetrics;
}

export interface ExperimentInsight {
    type: 'feature-importance' | 'data-quality' | 'model-performance' | 'recommendation';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    actionable: boolean;
}

export interface ResourceUsage {
    cpuHours: number;
    memoryUsage: number;
    gpuHours?: number;
    storageUsed: number;
    cost: number;
}

// Deployment Types
export interface DeploymentConfig {
    id: string;
    name: string;
    modelId: string;
    environment: DeploymentEnvironment;
    infrastructure: InfrastructureConfig;
    scaling: ScalingConfig;
    monitoring: MonitoringConfig;
    security: SecurityConfig;
    status: DeploymentStatus;
}

export type DeploymentEnvironment = 'development' | 'staging' | 'production';

export interface InfrastructureConfig {
    platform: 'cloud' | 'on-premise' | 'edge';
    provider?: 'aws' | 'azure' | 'gcp' | 'kubernetes';
    region?: string;
    instanceType: string;
    replicas: number;
}

export interface ScalingConfig {
    autoScaling: boolean;
    minReplicas: number;
    maxReplicas: number;
    targetUtilization: number;
    scaleUpPolicy: ScalingPolicy;
    scaleDownPolicy: ScalingPolicy;
}

export interface ScalingPolicy {
    threshold: number;
    stabilizationWindow: number;
    scalePercent: number;
}

export interface MonitoringConfig {
    enabled: boolean;
    metrics: MonitoringMetric[];
    alerts: AlertRule[];
    logging: LoggingConfig;
}

export interface MonitoringMetric {
    name: string;
    type: 'counter' | 'gauge' | 'histogram';
    unit: string;
    description: string;
}

export interface AlertRule {
    name: string;
    condition: string;
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    actions: AlertAction[];
}

export interface AlertAction {
    type: 'email' | 'webhook' | 'auto-scale' | 'rollback';
    configuration: Record<string, any>;
}

export interface LoggingConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    retention: number; // days
    structured: boolean;
}

export interface SecurityConfig {
    authentication: AuthConfig;
    authorization: AuthzConfig;
    encryption: EncryptionConfig;
    networkSecurity: NetworkSecurityConfig;
}

export interface AuthConfig {
    type: 'none' | 'api-key' | 'oauth' | 'jwt';
    configuration: Record<string, any>;
}

export interface AuthzConfig {
    enabled: boolean;
    roles: string[];
    permissions: Permission[];
}

export interface Permission {
    resource: string;
    actions: string[];
    conditions?: Record<string, any>;
}

export interface EncryptionConfig {
    inTransit: boolean;
    atRest: boolean;
    keyManagement: 'managed' | 'customer';
}

export interface NetworkSecurityConfig {
    vpc?: string;
    subnets: string[];
    securityGroups: string[];
    loadBalancer: LoadBalancerConfig;
}

export interface LoadBalancerConfig {
    type: 'application' | 'network';
    scheme: 'internal' | 'internet-facing';
    healthCheck: HealthCheckConfig;
}

export interface HealthCheckConfig {
    path: string;
    interval: number;
    timeout: number;
    healthyThreshold: number;
    unhealthyThreshold: number;
}

export type DeploymentStatus =
    | 'pending'
    | 'deploying'
    | 'deployed'
    | 'updating'
    | 'failed'
    | 'terminated';

// Feature Engineering Types
export interface FeatureEngineering {
    id: string;
    name: string;
    datasetId: string;
    transformations: FeatureTransformation[];
    generatedFeatures: GeneratedFeature[];
    status: 'pending' | 'processing' | 'completed' | 'failed';
    metrics: FeatureMetrics;
}

export interface GeneratedFeature {
    name: string;
    type: DataType;
    source: string[];
    transformation: FeatureTransformation;
    importance?: number;
    distribution: ColumnDistribution;
}

export interface FeatureMetrics {
    totalFeatures: number;
    generatedFeatures: number;
    selectedFeatures: number;
    importanceScore: number;
    correlationScore: number;
}

// Model Comparison Types
export interface ModelComparison {
    id: string;
    name: string;
    models: string[];
    metrics: ComparisonMetrics;
    visualizations: ComparisonVisualization[];
    insights: ComparisonInsight[];
    recommendation: string;
}

export interface ComparisonMetrics {
    primary: string;
    secondary: string[];
    results: Record<string, Record<string, number>>;
    rankings: Record<string, number>;
}

export interface ComparisonVisualization {
    type: 'bar' | 'radar' | 'scatter' | 'roc' | 'confusion-matrix';
    title: string;
    data: any;
    configuration: Record<string, any>;
}

export interface ComparisonInsight {
    type: 'performance' | 'efficiency' | 'robustness' | 'interpretability';
    title: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    confidence: number;
}

// API Response Types
export interface AutoMLResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    metadata: {
        timestamp: Date;
        requestId: string;
        version: string;
        executionTime: number;
    };
}

// Event Types
export interface AutoMLEvent {
    type: 'experiment_started' | 'model_trained' | 'deployment_completed' | 'pipeline_failed';
    experimentId?: string;
    modelId?: string;
    timestamp: Date;
    data?: any;
}

// Configuration Types
export interface AutoMLConfig {
    defaultTimeLimit: number;
    maxConcurrentExperiments: number;
    supportedAlgorithms: MLAlgorithm[];
    featureEngineeringEnabled: boolean;
    hyperparameterTuningEnabled: boolean;
    ensembleMethodsEnabled: boolean;
    autoDeployment: boolean;
    resourceLimits: ResourceLimits;
}

export interface ResourceLimits {
    maxCpuHours: number;
    maxMemoryGB: number;
    maxGpuHours: number;
    maxStorageGB: number;
    maxCostPerExperiment: number;
}