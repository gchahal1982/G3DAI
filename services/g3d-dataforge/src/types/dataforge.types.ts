/**
 * G3D DataForge - Data Intelligence TypeScript Definitions
 */

// Core Data Types
export interface DataSource {
    id: string;
    name: string;
    type: DataSourceType;
    connectionString: string;
    schema: DataSchema;
    status: ConnectionStatus;
    lastSync: Date;
    metadata: DataSourceMetadata;
    owner: string;
    tags: string[];
}

export type DataSourceType =
    | 'database'
    | 'api'
    | 'file'
    | 'stream'
    | 'warehouse'
    | 'lake'
    | 'nosql'
    | 'graph'
    | 'timeseries'
    | 'blockchain';

export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'syncing' | 'idle';

export interface DataSchema {
    tables: DataTable[];
    relationships: DataRelationship[];
    indexes: DataIndex[];
    constraints: DataConstraint[];
}

export interface DataTable {
    name: string;
    columns: DataColumn[];
    rowCount: number;
    size: number;
    lastUpdated: Date;
}

export interface DataColumn {
    name: string;
    type: DataType;
    nullable: boolean;
    primaryKey: boolean;
    foreignKey?: ForeignKeyReference;
    constraints: string[];
    statistics: ColumnStatistics;
}

export type DataType =
    | 'string'
    | 'number'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'json'
    | 'binary'
    | 'uuid'
    | 'array'
    | 'object';

export interface ForeignKeyReference {
    table: string;
    column: string;
    constraint: string;
}

export interface ColumnStatistics {
    uniqueValues: number;
    nullCount: number;
    minValue?: any;
    maxValue?: any;
    avgValue?: number;
    distribution: Record<string, number>;
}

export interface DataRelationship {
    id: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
    fromTable: string;
    toTable: string;
    fromColumn: string;
    toColumn: string;
}

export interface DataIndex {
    name: string;
    table: string;
    columns: string[];
    type: 'primary' | 'unique' | 'composite' | 'partial';
    size: number;
}

export interface DataConstraint {
    name: string;
    type: 'check' | 'unique' | 'foreign_key' | 'not_null';
    table: string;
    columns: string[];
    rule: string;
}

export interface DataSourceMetadata {
    provider: string;
    version: string;
    encoding: string;
    timezone: string;
    lastBackup?: Date;
    retentionPolicy?: string;
    encryptionLevel: 'none' | 'basic' | 'advanced';
}

// Analysis Job Types
export interface AnalysisJob {
    id: string;
    name: string;
    description: string;
    type: AnalysisType;
    dataSource: string;
    query: DataQuery;
    schedule: JobSchedule;
    status: JobStatus;
    results?: AnalysisResult;
    createdAt: Date;
    lastRun?: Date;
    nextRun?: Date;
    owner: string;
}

export type AnalysisType =
    | 'descriptive'
    | 'diagnostic'
    | 'predictive'
    | 'prescriptive'
    | 'anomaly-detection'
    | 'clustering'
    | 'classification'
    | 'regression'
    | 'time-series'
    | 'nlp'
    | 'computer-vision';

export interface DataQuery {
    sql?: string;
    filters: QueryFilter[];
    aggregations: QueryAggregation[];
    joins: QueryJoin[];
    orderBy: QuerySort[];
    limit?: number;
    offset?: number;
}

export interface QueryFilter {
    column: string;
    operator: FilterOperator;
    value: any;
    logic: 'AND' | 'OR';
}

export type FilterOperator =
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'greater_equal'
    | 'less_equal'
    | 'contains'
    | 'starts_with'
    | 'ends_with'
    | 'in'
    | 'not_in'
    | 'is_null'
    | 'is_not_null';

export interface QueryAggregation {
    function: AggregationFunction;
    column: string;
    alias: string;
    groupBy?: string[];
}

export type AggregationFunction =
    | 'count'
    | 'sum'
    | 'avg'
    | 'min'
    | 'max'
    | 'median'
    | 'mode'
    | 'stddev'
    | 'variance';

export interface QueryJoin {
    type: 'inner' | 'left' | 'right' | 'full' | 'cross';
    table: string;
    on: JoinCondition[];
}

export interface JoinCondition {
    leftColumn: string;
    rightColumn: string;
    operator: '=' | '!=' | '<' | '>' | '<=' | '>=';
}

export interface QuerySort {
    column: string;
    direction: 'ASC' | 'DESC';
}

export interface JobSchedule {
    type: 'once' | 'recurring';
    startDate: Date;
    endDate?: Date;
    frequency?: ScheduleFrequency;
    timezone: string;
    enabled: boolean;
}

export type ScheduleFrequency =
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly'
    | 'custom';

export type JobStatus =
    | 'pending'
    | 'running'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'scheduled';

// Analysis Results
export interface AnalysisResult {
    id: string;
    jobId: string;
    data: ResultData;
    insights: DataInsight[];
    visualizations: Visualization[];
    statistics: ResultStatistics;
    executionTime: number;
    rowsProcessed: number;
    createdAt: Date;
}

export interface ResultData {
    columns: string[];
    rows: any[][];
    totalRows: number;
    metadata: ResultMetadata;
}

export interface ResultMetadata {
    queryExecuted: string;
    executionPlan: string;
    cacheHit: boolean;
    dataFreshness: Date;
}

export interface DataInsight {
    id: string;
    type: InsightType;
    title: string;
    description: string;
    confidence: number;
    impact: InsightImpact;
    recommendation: string;
    evidence: InsightEvidence;
}

export type InsightType =
    | 'trend'
    | 'anomaly'
    | 'correlation'
    | 'pattern'
    | 'outlier'
    | 'seasonality'
    | 'forecast'
    | 'distribution'
    | 'segment';

export type InsightImpact = 'low' | 'medium' | 'high' | 'critical';

export interface InsightEvidence {
    dataPoints: any[];
    statisticalTest?: string;
    pValue?: number;
    confidence?: number;
    supporting: string[];
}

export interface Visualization {
    id: string;
    type: VisualizationType;
    title: string;
    data: VisualizationData;
    config: VisualizationConfig;
    insights: string[];
}

export type VisualizationType =
    | 'bar'
    | 'line'
    | 'pie'
    | 'scatter'
    | 'histogram'
    | 'heatmap'
    | 'treemap'
    | 'sankey'
    | 'network'
    | 'geographic'
    | 'timeline'
    | 'funnel'
    | 'gauge'
    | 'radar';

export interface VisualizationData {
    series: DataSeries[];
    categories: string[];
    metadata: VisualizationMetadata;
}

export interface DataSeries {
    name: string;
    data: number[];
    color?: string;
    type?: string;
}

export interface VisualizationMetadata {
    xAxis: AxisConfig;
    yAxis: AxisConfig;
    legend: LegendConfig;
    tooltip: TooltipConfig;
}

export interface AxisConfig {
    title: string;
    type: 'category' | 'value' | 'time' | 'log';
    min?: number;
    max?: number;
    format?: string;
}

export interface LegendConfig {
    show: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
    align: 'start' | 'center' | 'end';
}

export interface TooltipConfig {
    show: boolean;
    format: string;
    trigger: 'item' | 'axis';
}

export interface VisualizationConfig {
    width: number;
    height: number;
    theme: 'light' | 'dark';
    interactive: boolean;
    exportable: boolean;
    responsive: boolean;
}

export interface ResultStatistics {
    totalRows: number;
    uniqueValues: Record<string, number>;
    nullValues: Record<string, number>;
    dataTypes: Record<string, DataType>;
    correlations: CorrelationMatrix;
    distributions: Record<string, Distribution>;
}

export interface CorrelationMatrix {
    columns: string[];
    matrix: number[][];
    method: 'pearson' | 'spearman' | 'kendall';
}

export interface Distribution {
    type: 'normal' | 'uniform' | 'exponential' | 'binomial' | 'poisson' | 'unknown';
    parameters: Record<string, number>;
    goodnessOfFit: number;
}

// Data Quality Types
export interface DataQualityReport {
    id: string;
    dataSourceId: string;
    overallScore: number;
    dimensions: QualityDimension[];
    issues: DataQualityIssue[];
    recommendations: QualityRecommendation[];
    generatedAt: Date;
}

export interface QualityDimension {
    name: QualityDimensionType;
    score: number;
    weight: number;
    description: string;
    metrics: QualityMetric[];
}

export type QualityDimensionType =
    | 'completeness'
    | 'accuracy'
    | 'consistency'
    | 'validity'
    | 'uniqueness'
    | 'timeliness'
    | 'relevance';

export interface QualityMetric {
    name: string;
    value: number;
    threshold: number;
    status: 'pass' | 'warning' | 'fail';
    description: string;
}

export interface DataQualityIssue {
    id: string;
    type: IssueType;
    severity: IssueSeverity;
    table: string;
    column?: string;
    description: string;
    affectedRows: number;
    examples: any[];
    suggestedFix: string;
}

export type IssueType =
    | 'missing_values'
    | 'invalid_format'
    | 'duplicate_records'
    | 'inconsistent_values'
    | 'outliers'
    | 'referential_integrity'
    | 'data_drift';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface QualityRecommendation {
    id: string;
    priority: number;
    action: RecommendationAction;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    automation: boolean;
}

export type RecommendationAction =
    | 'clean_data'
    | 'add_validation'
    | 'update_schema'
    | 'improve_collection'
    | 'add_monitoring'
    | 'train_staff';

// ML Model Types
export interface MLModel {
    id: string;
    name: string;
    type: ModelType;
    algorithm: MLAlgorithm;
    status: ModelStatus;
    performance: ModelPerformance;
    features: ModelFeature[];
    hyperparameters: Record<string, any>;
    trainingData: string;
    version: string;
    createdAt: Date;
    lastTrained: Date;
}

export type ModelType =
    | 'classification'
    | 'regression'
    | 'clustering'
    | 'anomaly-detection'
    | 'time-series'
    | 'recommendation'
    | 'nlp'
    | 'computer-vision';

export type MLAlgorithm =
    | 'linear-regression'
    | 'logistic-regression'
    | 'decision-tree'
    | 'random-forest'
    | 'svm'
    | 'neural-network'
    | 'kmeans'
    | 'dbscan'
    | 'isolation-forest'
    | 'arima'
    | 'lstm';

export type ModelStatus =
    | 'training'
    | 'trained'
    | 'deployed'
    | 'retired'
    | 'failed';

export interface ModelPerformance {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    rmse?: number;
    mae?: number;
    r2Score?: number;
    auc?: number;
    confusionMatrix?: number[][];
    featureImportance: Record<string, number>;
}

export interface ModelFeature {
    name: string;
    type: DataType;
    importance: number;
    transformation?: string;
    encoding?: string;
}

// API Response Types
export interface DataForgeResponse<T> {
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
        executionTime: number;
    };
}

// Event Types
export interface DataForgeEvent {
    type: 'job_started' | 'job_completed' | 'data_updated' | 'quality_alert';
    sourceId: string;
    jobId?: string;
    timestamp: Date;
    data?: any;
}

// Configuration Types
export interface DataForgeConfig {
    maxConcurrentJobs: number;
    defaultTimeout: number;
    cacheEnabled: boolean;
    qualityThresholds: Record<string, number>;
    retentionPeriod: number;
    encryptionEnabled: boolean;
}