// G3D AutoML - Comprehensive Type Definitions
// Automated Machine Learning Platform Types

export interface MLDataset {
    id: string;
    name: string;
    description?: string;
    source: DataSource;
    format: DataFormat;
    size: DataSize;
    schema: DataSchema;
    quality: DataQuality;
    splits?: DataSplits;
    metadata: DatasetMetadata;
    createdAt: Date;
    updatedAt: Date;
}

export interface DataSource {
    type: 'upload' | 'database' | 'api' | 'cloud_storage' | 'streaming';
    connection?: DatabaseConnection | APIConnection | CloudStorageConnection;
    query?: string;
    path?: string;
    credentials?: Record<string, any>;
}

export interface DatabaseConnection {
    type: 'postgresql' | 'mysql' | 'mongodb' | 'snowflake' | 'bigquery';
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
}

export interface APIConnection {
    url: string;
    method: 'GET' | 'POST';
    headers?: Record<string, string>;
    authentication?: {
        type: 'bearer' | 'api_key' | 'oauth';
        credentials: Record<string, string>;
    };
}

export interface CloudStorageConnection {
    provider: 'aws_s3' | 'gcp_storage' | 'azure_blob';
    bucket: string;
    region?: string;
    credentials: Record<string, string>;
}

export type DataFormat = 'csv' | 'json' | 'parquet' | 'excel' | 'avro' | 'orc';

export interface DataSize {
    rows: number;
    columns: number;
    sizeBytes: number;
    estimatedMemoryMB: number;
}

export interface DataSchema {
    columns: ColumnSchema[];
    primaryKey?: string[];
    foreignKeys?: ForeignKey[];
    constraints?: DataConstraint[];
}

export interface ColumnSchema {
    name: string;
    type: DataType;
    nullable: boolean;
    unique?: boolean;
    description?: string;
    statistics?: ColumnStatistics;
    categories?: string[];
    range?: [number, number];
}

export type DataType =
    | 'integer'
    | 'float'
    | 'string'
    | 'boolean'
    | 'datetime'
    | 'categorical'
    | 'text'
    | 'image'
    | 'audio'
    | 'video';

export interface ColumnStatistics {
    count: number;
    nullCount: number;
    uniqueCount: number;
    mean?: number;
    median?: number;
    std?: number;
    min?: number | string;
    max?: number | string;
    mode?: string;
    distribution?: DistributionInfo;
}

export interface DistributionInfo {
    type: 'normal' | 'uniform' | 'skewed' | 'bimodal' | 'categorical';
    parameters?: Record<string, number>;
    histogram?: HistogramBin[];
}

export interface HistogramBin {
    range: [number, number];
    count: number;
    frequency: number;
}

export interface ForeignKey {
    columns: string[];
    referencedTable: string;
    referencedColumns: string[];
}

export interface DataConstraint {
    type: 'check' | 'range' | 'pattern' | 'custom';
    columns: string[];
    condition: string;
    description?: string;
}

export interface DataQuality {
    score: number; // 0-100
    issues: DataQualityIssue[];
    completeness: number;
    consistency: number;
    accuracy: number;
    validity: number;
    recommendations: DataQualityRecommendation[];
}

export interface DataQualityIssue {
    id: string;
    type: 'missing_values' | 'duplicates' | 'outliers' | 'inconsistent_format' | 'invalid_values';
    severity: 'low' | 'medium' | 'high' | 'critical';
    columns: string[];
    count: number;
    description: string;
    examples?: any[];
    suggestedFix?: string;
}

export interface DataQualityRecommendation {
    type: 'imputation' | 'removal' | 'transformation' | 'validation';
    description: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    automated: boolean;
}

export interface DataSplits {
    train: DataSplit;
    validation?: DataSplit;
    test?: DataSplit;
    strategy: SplitStrategy;
}

export interface DataSplit {
    percentage: number;
    rowCount: number;
    indices?: number[];
}

export type SplitStrategy =
    | 'random'
    | 'stratified'
    | 'time_series'
    | 'group_based'
    | 'custom';

export interface DatasetMetadata {
    tags: string[];
    version: string;
    lineage?: DataLineage;
    privacy: PrivacyInfo;
    compliance: ComplianceInfo;
}

export interface DataLineage {
    source: string;
    transformations: DataTransformation[];
    dependencies: string[];
}

export interface DataTransformation {
    type: string;
    parameters: Record<string, any>;
    timestamp: Date;
    user: string;
}

export interface PrivacyInfo {
    containsPII: boolean;
    piiColumns?: string[];
    privacyLevel: 'public' | 'internal' | 'confidential' | 'restricted';
    dataRetentionDays?: number;
}

export interface ComplianceInfo {
    regulations: string[]; // GDPR, CCPA, HIPAA, etc.
    dataClassification: string;
    accessControls: AccessControl[];
}

export interface AccessControl {
    role: string;
    permissions: string[];
    conditions?: Record<string, any>;
}

// ML Problem Configuration
export interface MLProblemConfig {
    type: ProblemType;
    target: TargetVariable;
    features: FeatureConfig;
    objective: ObjectiveFunction;
    constraints: ModelConstraints;
    preferences: UserPreferences;
}

export type ProblemType =
    | 'binary_classification'
    | 'multiclass_classification'
    | 'regression'
    | 'time_series_forecasting'
    | 'clustering'
    | 'anomaly_detection'
    | 'ranking'
    | 'recommendation';

export interface TargetVariable {
    column: string;
    type: 'numerical' | 'categorical' | 'binary';
    distribution?: DistributionInfo;
    classBalance?: ClassBalance;
    transformations?: TargetTransformation[];
}

export interface ClassBalance {
    classes: ClassInfo[];
    imbalanceRatio: number;
    strategy?: 'none' | 'oversample' | 'undersample' | 'synthetic';
}

export interface ClassInfo {
    label: string;
    count: number;
    percentage: number;
}

export interface TargetTransformation {
    type: 'log' | 'sqrt' | 'box_cox' | 'standardize' | 'normalize';
    parameters?: Record<string, number>;
}

export interface FeatureConfig {
    included: string[];
    excluded: string[];
    engineered: FeatureEngineering;
    selection: FeatureSelection;
}

export interface FeatureEngineering {
    enabled: boolean;
    techniques: FeatureEngineeringTechnique[];
    maxFeatures?: number;
    timeLimit?: number;
}

export interface FeatureEngineeringTechnique {
    type: 'polynomial' | 'interaction' | 'binning' | 'encoding' | 'scaling' | 'text_features' | 'time_features';
    parameters?: Record<string, any>;
    applicableTypes: DataType[];
}

export interface FeatureSelection {
    enabled: boolean;
    method: 'correlation' | 'mutual_info' | 'chi2' | 'f_test' | 'recursive' | 'lasso' | 'tree_based';
    maxFeatures?: number;
    threshold?: number;
}

export interface ObjectiveFunction {
    primary: Metric;
    secondary?: Metric[];
    direction: 'maximize' | 'minimize';
    customFunction?: string;
}

export type Metric =
    | 'accuracy'
    | 'precision'
    | 'recall'
    | 'f1'
    | 'auc_roc'
    | 'auc_pr'
    | 'mse'
    | 'rmse'
    | 'mae'
    | 'r2'
    | 'mape'
    | 'log_loss'
    | 'custom';

export interface ModelConstraints {
    maxTrainingTime?: number; // minutes
    maxModelSize?: number; // MB
    maxInferenceLatency?: number; // ms
    interpretability?: 'low' | 'medium' | 'high';
    deploymentTarget?: DeploymentTarget;
    resourceLimits?: ResourceLimits;
}

export interface DeploymentTarget {
    type: 'cloud' | 'edge' | 'mobile' | 'embedded';
    specifications?: Record<string, any>;
}

export interface ResourceLimits {
    maxCPU?: number;
    maxMemoryGB?: number;
    maxGPU?: number;
    budget?: number;
}

export interface UserPreferences {
    explainability: boolean;
    ensembleMethods: boolean;
    neuralNetworks: boolean;
    traditionalML: boolean;
    experimentTracking: boolean;
    modelVersioning: boolean;
}

// AutoML Pipeline
export interface AutoMLPipeline {
    id: string;
    name: string;
    config: MLProblemConfig;
    stages: PipelineStage[];
    status: PipelineStatus;
    progress: PipelineProgress;
    results?: PipelineResults;
    experiments: Experiment[];
    createdAt: Date;
    updatedAt: Date;
}

export interface PipelineStage {
    name: string;
    type: StageType;
    status: StageStatus;
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    parameters?: Record<string, any>;
    outputs?: Record<string, any>;
    error?: ErrorInfo;
}

export type StageType =
    | 'data_validation'
    | 'data_preprocessing'
    | 'feature_engineering'
    | 'feature_selection'
    | 'model_selection'
    | 'hyperparameter_tuning'
    | 'model_training'
    | 'model_evaluation'
    | 'model_validation'
    | 'model_deployment';

export type StageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface ErrorInfo {
    type: string;
    message: string;
    stackTrace?: string;
    suggestions?: string[];
}

export type PipelineStatus = 'created' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface PipelineProgress {
    currentStage: number;
    totalStages: number;
    percentage: number;
    estimatedTimeRemaining?: number;
    stageProgress?: Record<string, number>;
}

export interface PipelineResults {
    bestModel: TrainedModel;
    leaderboard: ModelLeaderboard;
    insights: AutoMLInsights;
    recommendations: ModelRecommendation[];
    deploymentConfig?: DeploymentConfig;
}

// Model Definitions
export interface TrainedModel {
    id: string;
    name: string;
    algorithm: MLAlgorithm;
    hyperparameters: Record<string, any>;
    features: string[];
    performance: ModelPerformance;
    artifacts: ModelArtifacts;
    interpretability?: ModelInterpretability;
    metadata: ModelMetadata;
}

export interface MLAlgorithm {
    name: string;
    type: 'tree_based' | 'linear' | 'neural_network' | 'ensemble' | 'svm' | 'naive_bayes' | 'knn';
    library: 'scikit-learn' | 'xgboost' | 'lightgbm' | 'tensorflow' | 'pytorch' | 'h2o';
    version: string;
    parameters: AlgorithmParameters;
}

export interface AlgorithmParameters {
    [key: string]: any;
    tunable: string[];
    fixed: Record<string, any>;
}

export interface ModelPerformance {
    metrics: Record<Metric, number>;
    crossValidation: CrossValidationResults;
    testSet?: TestSetResults;
    confusionMatrix?: ConfusionMatrix;
    rocCurve?: ROCCurve;
    featureImportance?: FeatureImportance[];
}

export interface CrossValidationResults {
    folds: number;
    scores: number[];
    mean: number;
    std: number;
    strategy: 'kfold' | 'stratified' | 'time_series' | 'group';
}

export interface TestSetResults {
    metrics: Record<Metric, number>;
    predictions: Prediction[];
    residuals?: number[];
}

export interface Prediction {
    actual: any;
    predicted: any;
    probability?: number[];
    confidence?: number;
}

export interface ConfusionMatrix {
    matrix: number[][];
    labels: string[];
    normalized?: number[][];
}

export interface ROCCurve {
    fpr: number[];
    tpr: number[];
    thresholds: number[];
    auc: number;
}

export interface FeatureImportance {
    feature: string;
    importance: number;
    rank: number;
    type: 'permutation' | 'gain' | 'split' | 'shap';
}

export interface ModelArtifacts {
    modelFile: string;
    preprocessorFile?: string;
    featureEngineerFile?: string;
    size: number;
    format: 'pickle' | 'joblib' | 'onnx' | 'tensorflow' | 'pytorch';
    checksum: string;
}

export interface ModelInterpretability {
    globalExplanations: GlobalExplanation[];
    localExplanations?: LocalExplanation[];
    shapValues?: SHAPValues;
    limeExplanations?: LIMEExplanation[];
}

export interface GlobalExplanation {
    type: 'feature_importance' | 'partial_dependence' | 'permutation_importance';
    data: any;
    visualization?: string;
}

export interface LocalExplanation {
    instanceId: string;
    explanations: Record<string, number>;
    prediction: any;
    confidence: number;
}

export interface SHAPValues {
    values: number[][];
    baseValue: number;
    features: string[];
    instances: number;
}

export interface LIMEExplanation {
    instanceId: string;
    explanations: Record<string, number>;
    score: number;
    intercept: number;
}

export interface ModelMetadata {
    version: string;
    tags: string[];
    author: string;
    description?: string;
    trainingTime: number;
    datasetId: string;
    experimentId: string;
    parentModelId?: string;
    createdAt: Date;
}

export interface ModelLeaderboard {
    models: LeaderboardEntry[];
    sortBy: Metric;
    sortOrder: 'asc' | 'desc';
    filters?: LeaderboardFilter[];
}

export interface LeaderboardEntry {
    modelId: string;
    rank: number;
    algorithm: string;
    score: number;
    metrics: Record<Metric, number>;
    trainingTime: number;
    complexity: number;
    selected: boolean;
}

export interface LeaderboardFilter {
    field: string;
    operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
    value: any;
}

// Experiment Tracking
export interface Experiment {
    id: string;
    name: string;
    description?: string;
    status: ExperimentStatus;
    runs: ExperimentRun[];
    bestRun?: string;
    metadata: ExperimentMetadata;
    createdAt: Date;
    updatedAt: Date;
}

export type ExperimentStatus = 'active' | 'completed' | 'failed' | 'cancelled';

export interface ExperimentRun {
    id: string;
    name?: string;
    parameters: Record<string, any>;
    metrics: Record<string, number>;
    artifacts: RunArtifact[];
    logs: LogEntry[];
    status: RunStatus;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    tags: string[];
}

export type RunStatus = 'running' | 'completed' | 'failed' | 'killed';

export interface RunArtifact {
    name: string;
    path: string;
    type: 'model' | 'data' | 'plot' | 'text' | 'binary';
    size: number;
    checksum: string;
}

export interface LogEntry {
    timestamp: Date;
    level: 'debug' | 'info' | 'warning' | 'error';
    message: string;
    source?: string;
}

export interface ExperimentMetadata {
    framework: string;
    version: string;
    environment: Record<string, string>;
    gitCommit?: string;
    tags: string[];
}

// AutoML Insights
export interface AutoMLInsights {
    dataInsights: DataInsight[];
    modelInsights: ModelInsight[];
    performanceInsights: PerformanceInsight[];
    recommendations: InsightRecommendation[];
}

export interface DataInsight {
    type: 'correlation' | 'distribution' | 'outliers' | 'missing_patterns' | 'feature_importance';
    title: string;
    description: string;
    importance: 'low' | 'medium' | 'high';
    visualization?: string;
    actionable: boolean;
}

export interface ModelInsight {
    type: 'algorithm_performance' | 'hyperparameter_sensitivity' | 'overfitting' | 'bias_variance';
    title: string;
    description: string;
    models: string[];
    evidence: any;
}

export interface PerformanceInsight {
    type: 'metric_analysis' | 'error_analysis' | 'prediction_confidence' | 'feature_impact';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    recommendations: string[];
}

export interface InsightRecommendation {
    type: 'data_collection' | 'feature_engineering' | 'model_selection' | 'hyperparameter_tuning' | 'deployment';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    automated: boolean;
}

export interface ModelRecommendation {
    modelId: string;
    reason: string;
    confidence: number;
    tradeoffs: Tradeoff[];
    nextSteps: string[];
}

export interface Tradeoff {
    aspect: string;
    current: any;
    alternative: any;
    impact: string;
}

// Deployment Configuration
export interface DeploymentConfig {
    id: string;
    name: string;
    modelId: string;
    target: DeploymentTarget;
    scaling: ScalingConfig;
    monitoring: MonitoringConfig;
    security: SecurityConfig;
    environment: EnvironmentConfig;
    rollout: RolloutConfig;
}

export interface ScalingConfig {
    type: 'manual' | 'auto';
    minInstances: number;
    maxInstances: number;
    targetUtilization?: number;
    scaleUpPolicy?: ScalingPolicy;
    scaleDownPolicy?: ScalingPolicy;
}

export interface ScalingPolicy {
    metric: string;
    threshold: number;
    cooldown: number;
    stepSize: number;
}

export interface MonitoringConfig {
    enabled: boolean;
    metrics: MonitoringMetric[];
    alerts: AlertConfig[];
    dashboards: DashboardConfig[];
}

export interface MonitoringMetric {
    name: string;
    type: 'system' | 'business' | 'model';
    aggregation: 'sum' | 'avg' | 'max' | 'min' | 'count';
    interval: number;
}

export interface AlertConfig {
    name: string;
    condition: string;
    severity: 'info' | 'warning' | 'critical';
    channels: string[];
    cooldown: number;
}

export interface DashboardConfig {
    name: string;
    widgets: DashboardWidget[];
    refreshInterval: number;
}

export interface DashboardWidget {
    type: 'metric' | 'chart' | 'table' | 'text';
    title: string;
    query: string;
    visualization?: string;
}

export interface SecurityConfig {
    authentication: AuthConfig;
    authorization: AuthzConfig;
    encryption: EncryptionConfig;
    audit: AuditConfig;
}

export interface AuthConfig {
    type: 'api_key' | 'jwt' | 'oauth' | 'mtls';
    configuration: Record<string, any>;
}

export interface AuthzConfig {
    enabled: boolean;
    policies: AuthzPolicy[];
}

export interface AuthzPolicy {
    resource: string;
    actions: string[];
    conditions?: Record<string, any>;
}

export interface EncryptionConfig {
    inTransit: boolean;
    atRest: boolean;
    keyManagement: string;
}

export interface AuditConfig {
    enabled: boolean;
    events: string[];
    retention: number;
    destination: string;
}

export interface EnvironmentConfig {
    runtime: string;
    version: string;
    dependencies: Dependency[];
    resources: ResourceRequirements;
    environment: Record<string, string>;
}

export interface Dependency {
    name: string;
    version: string;
    source?: string;
}

export interface ResourceRequirements {
    cpu: string;
    memory: string;
    gpu?: string;
    storage?: string;
}

export interface RolloutConfig {
    strategy: 'blue_green' | 'canary' | 'rolling' | 'immediate';
    parameters?: Record<string, any>;
    healthChecks: HealthCheck[];
    rollbackTriggers: RollbackTrigger[];
}

export interface HealthCheck {
    type: 'http' | 'tcp' | 'command';
    configuration: Record<string, any>;
    interval: number;
    timeout: number;
    retries: number;
}

export interface RollbackTrigger {
    metric: string;
    condition: string;
    duration: number;
}

// UI State Management
export interface AutoMLState {
    datasets: MLDataset[];
    currentDataset?: MLDataset;
    pipelines: AutoMLPipeline[];
    currentPipeline?: AutoMLPipeline;
    experiments: Experiment[];
    models: TrainedModel[];
    deployments: DeploymentConfig[];
    ui: UIState;
}

export interface UIState {
    activeTab: string;
    loading: boolean;
    error?: string;
    notifications: Notification[];
    modals: ModalState;
    preferences: UserUIPreferences;
}

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    actions?: NotificationAction[];
}

export interface NotificationAction {
    label: string;
    action: string;
    primary?: boolean;
}

export interface ModalState {
    datasetUpload: boolean;
    pipelineConfig: boolean;
    modelDetails: boolean;
    deploymentConfig: boolean;
    experimentDetails: boolean;
}

export interface UserUIPreferences {
    theme: 'light' | 'dark' | 'auto';
    density: 'compact' | 'comfortable' | 'spacious';
    defaultViews: Record<string, string>;
    notifications: NotificationPreferences;
}

export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    inApp: boolean;
    frequency: 'immediate' | 'hourly' | 'daily';
}

// API Interfaces
export interface AutoMLAPI {
    // Dataset operations
    uploadDataset(file: File, metadata: Partial<MLDataset>): Promise<MLDataset>;
    getDatasets(): Promise<MLDataset[]>;
    getDataset(id: string): Promise<MLDataset>;
    deleteDataset(id: string): Promise<void>;

    // Pipeline operations
    createPipeline(config: MLProblemConfig): Promise<AutoMLPipeline>;
    getPipelines(): Promise<AutoMLPipeline[]>;
    getPipeline(id: string): Promise<AutoMLPipeline>;
    startPipeline(id: string): Promise<void>;
    stopPipeline(id: string): Promise<void>;
    deletePipeline(id: string): Promise<void>;

    // Model operations
    getModels(): Promise<TrainedModel[]>;
    getModel(id: string): Promise<TrainedModel>;
    downloadModel(id: string): Promise<Blob>;
    deleteModel(id: string): Promise<void>;

    // Experiment operations
    getExperiments(): Promise<Experiment[]>;
    getExperiment(id: string): Promise<Experiment>;
    deleteExperiment(id: string): Promise<void>;

    // Deployment operations
    deployModel(modelId: string, config: DeploymentConfig): Promise<string>;
    getDeployments(): Promise<DeploymentConfig[]>;
    getDeployment(id: string): Promise<DeploymentConfig>;
    updateDeployment(id: string, config: Partial<DeploymentConfig>): Promise<void>;
    deleteDeployment(id: string): Promise<void>;

    // Prediction operations
    predict(deploymentId: string, data: any[]): Promise<Prediction[]>;
    batchPredict(deploymentId: string, data: any[]): Promise<string>; // Returns job ID

    // Monitoring operations
    getMetrics(deploymentId: string, timeRange: [Date, Date]): Promise<any>;
    getAlerts(deploymentId: string): Promise<any[]>;
}