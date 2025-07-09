// DataForge Type Definitions

export interface DataStream {
    id: string;
    name: string;
    type: DataStreamType;
    source: DataSource;
    schema: DataSchema;
    status: StreamStatus;
    metadata: StreamMetadata;
    createdAt: Date;
    updatedAt: Date;
}

export type DataStreamType =
    | 'real-time'
    | 'batch'
    | 'micro-batch'
    | 'change-data-capture'
    | 'event-stream';

export interface DataSource {
    type: SourceType;
    connectionString?: string;
    credentials?: SourceCredentials;
    config: Record<string, any>;
    healthCheck?: HealthCheckConfig;
}

export type SourceType =
    | 'kafka'
    | 'kinesis'
    | 'pubsub'
    | 'database'
    | 'api'
    | 'file'
    | 'websocket'
    | 's3'
    | 'azure-blob'
    | 'gcs';

export interface DataSchema {
    fields: SchemaField[];
    version: string;
    format?: 'json' | 'avro' | 'parquet' | 'arrow' | 'csv';
    compression?: 'none' | 'gzip' | 'snappy' | 'lz4' | 'zstd';
    partitioning?: PartitioningStrategy;
}

export interface SchemaField {
    name: string;
    type: FieldType;
    nullable: boolean;
    metadata?: Record<string, any>;
    constraints?: FieldConstraints;
}

export type FieldType =
    | 'string'
    | 'integer'
    | 'long'
    | 'float'
    | 'double'
    | 'boolean'
    | 'timestamp'
    | 'date'
    | 'binary'
    | 'array'
    | 'struct'
    | 'map';

export interface ProcessingConfig {
    pipeline: PipelineStage[];
    parallelism: number;
    checkpointing: CheckpointConfig;
    errorHandling: ErrorHandlingStrategy;
    monitoring: MonitoringConfig;
    optimization: OptimizationSettings;
}

export interface PipelineStage {
    id: string;
    name: string;
    type: StageType;
    processor: ProcessorConfig;
    inputs: string[];
    outputs: string[];
    config: Record<string, any>;
}

export type StageType =
    | 'source'
    | 'transform'
    | 'filter'
    | 'aggregate'
    | 'join'
    | 'window'
    | 'ml-inference'
    | 'sink';

export interface ProcessingResult {
    streamId: string;
    pipelineId: string;
    status: ProcessingStatus;
    metrics: ProcessingMetrics;
    errors: ProcessingError[];
    checkpoints: Checkpoint[];
    outputLocations: OutputLocation[];
}

export interface ProcessingMetrics {
    recordsProcessed: number;
    recordsFiltered: number;
    recordsErrored: number;
    bytesProcessed: number;
    processingTime: number;
    throughput: ThroughputMetrics;
    latency: LatencyMetrics;
    resourceUsage: ResourceMetrics;
}

export interface ThroughputMetrics {
    recordsPerSecond: number;
    bytesPerSecond: number;
    avgBatchSize: number;
    peakThroughput: number;
}

export interface LatencyMetrics {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
    p999: number;
}

export interface Anomaly {
    id: string;
    timestamp: Date;
    type: AnomalyType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    affectedMetrics: string[];
    description: string;
    context: AnomalyContext;
    suggestedActions: string[];
    status: AnomalyStatus;
}

export type AnomalyType =
    | 'data-drift'
    | 'schema-change'
    | 'volume-spike'
    | 'latency-spike'
    | 'error-rate'
    | 'missing-data'
    | 'duplicate-data'
    | 'outlier'
    | 'pattern-change';

export interface AnomalyContext {
    baseline: Record<string, any>;
    current: Record<string, any>;
    deviation: number;
    timeWindow: TimeWindow;
    relatedAnomalies: string[];
}

export interface RealTimeMetrics {
    timestamp: Date;
    volume: number;
    volumeTrend: number;
    latency: number;
    latencyDistribution: number[];
    quality: number;
    qualityIssues: QualityIssue[];
    throughput: ThroughputMetrics;
    errorRate: number;
    activeStreams: number;
    queueDepth: number;
}

export interface QualityIssue {
    type: 'missing-field' | 'type-mismatch' | 'constraint-violation' | 'format-error';
    field?: string;
    count: number;
    percentage: number;
    samples: any[];
}

export interface DataComplianceConfig {
    regulations: Regulation[];
    dataClassification: DataClassification;
    retentionPolicies: RetentionPolicy[];
    encryptionRequirements: EncryptionConfig;
    accessControls: AccessControlConfig;
    auditRequirements: AuditConfig;
}

export interface Regulation {
    type: 'GDPR' | 'CCPA' | 'HIPAA' | 'SOX' | 'PCI-DSS' | 'CUSTOM';
    requirements: ComplianceRequirement[];
    validationRules: ValidationRule[];
}

export interface DataClassification {
    levels: ClassificationLevel[];
    rules: ClassificationRule[];
    defaultLevel: string;
}

export interface ClassificationLevel {
    id: string;
    name: string;
    description: string;
    color: string;
    restrictions: string[];
    requiredControls: string[];
}

export interface RetentionPolicy {
    id: string;
    name: string;
    dataType: string;
    retentionPeriod: Duration;
    deleteAfter: boolean;
    archiveLocation?: string;
    legalHold?: boolean;
}

export interface MLPipelineConfig {
    models: MLModel[];
    featureEngineering: FeatureEngineeringConfig;
    inference: InferenceConfig;
    monitoring: MLMonitoringConfig;
    retraining: RetrainingConfig;
}

export interface MLModel {
    id: string;
    name: string;
    type: ModelType;
    version: string;
    framework: 'tensorflow' | 'pytorch' | 'scikit-learn' | 'xgboost' | 'custom';
    endpoint?: string;
    artifacts: ModelArtifacts;
    performance: ModelPerformance;
}

export type ModelType =
    | 'classification'
    | 'regression'
    | 'clustering'
    | 'anomaly-detection'
    | 'time-series'
    | 'nlp'
    | 'recommendation';

export interface DataFlowNode {
    id: string;
    type: 'source' | 'processor' | 'sink' | 'branch' | 'join';
    name: string;
    status: NodeStatus;
    metrics: NodeMetrics;
    position: { x: number; y: number };
    connections: {
        inputs: string[];
        outputs: string[];
    };
}

export interface DataFlowEdge {
    id: string;
    source: string;
    target: string;
    metrics: EdgeMetrics;
    status: 'active' | 'idle' | 'error';
}

export interface NodeMetrics {
    throughput: number;
    latency: number;
    errorRate: number;
    queueSize: number;
    cpuUsage: number;
    memoryUsage: number;
}

export interface EdgeMetrics {
    dataRate: number;
    recordCount: number;
    avgRecordSize: number;
    backpressure: number;
}

export interface AlertConfiguration {
    id: string;
    name: string;
    description?: string;
    enabled: boolean;
    conditions: AlertCondition[];
    actions: AlertAction[];
    schedule?: AlertSchedule;
    severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface AlertCondition {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
    threshold: number;
    duration?: Duration;
    aggregation?: AggregationType;
}

export interface AlertAction {
    type: 'email' | 'slack' | 'webhook' | 'pagerduty' | 'sns' | 'custom';
    config: Record<string, any>;
    throttle?: Duration;
}

export interface DataQualityRule {
    id: string;
    name: string;
    type: QualityRuleType;
    field?: string;
    condition: QualityCondition;
    severity: 'info' | 'warning' | 'error';
    action: 'flag' | 'filter' | 'transform' | 'reject';
}

export type QualityRuleType =
    | 'completeness'
    | 'uniqueness'
    | 'validity'
    | 'accuracy'
    | 'consistency'
    | 'timeliness';

export interface TransformationConfig {
    id: string;
    name: string;
    type: TransformationType;
    input: TransformInput;
    operations: TransformOperation[];
    output: TransformOutput;
    errorHandling: ErrorHandlingConfig;
}

export type TransformationType =
    | 'map'
    | 'filter'
    | 'aggregate'
    | 'join'
    | 'window'
    | 'pivot'
    | 'unpivot'
    | 'custom';

export interface TransformOperation {
    type: string;
    config: Record<string, any>;
    condition?: string;
}

// Supporting interfaces
export interface StreamStatus {
    state: 'active' | 'paused' | 'stopped' | 'error' | 'initializing';
    health: 'healthy' | 'degraded' | 'unhealthy';
    lastHealthCheck: Date;
    errors: StreamError[];
}

export interface StreamMetadata {
    owner: string;
    team: string;
    tags: string[];
    description?: string;
    sla?: SLAConfig;
    cost?: CostEstimate;
}

export interface SourceCredentials {
    type: 'basic' | 'oauth' | 'api-key' | 'certificate' | 'iam-role';
    encrypted: boolean;
    value?: string;
    secretRef?: string;
}

export interface HealthCheckConfig {
    interval: Duration;
    timeout: Duration;
    retries: number;
    endpoint?: string;
}

export interface PartitioningStrategy {
    type: 'time' | 'hash' | 'range' | 'list';
    columns: string[];
    granularity?: string;
}

export interface FieldConstraints {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
    unique?: boolean;
    references?: ForeignKeyReference;
}

export interface ForeignKeyReference {
    table: string;
    column: string;
    onDelete?: 'cascade' | 'restrict' | 'set-null';
    onUpdate?: 'cascade' | 'restrict';
}

export interface CheckpointConfig {
    enabled: boolean;
    interval: Duration;
    storage: 'memory' | 'disk' | 's3' | 'hdfs';
    retention: Duration;
}

export interface ErrorHandlingStrategy {
    onError: 'fail' | 'skip' | 'retry' | 'dead-letter';
    maxRetries?: number;
    retryDelay?: Duration;
    deadLetterQueue?: string;
}

export interface MonitoringConfig {
    metrics: MetricConfig[];
    logs: LogConfig;
    traces: TraceConfig;
    alerts: string[]; // Alert IDs
}

export interface OptimizationSettings {
    autoScaling: AutoScalingConfig;
    caching: CachingConfig;
    compression: CompressionConfig;
    partitioning: PartitioningConfig;
}

export interface ProcessorConfig {
    className: string;
    jarPath?: string;
    config: Record<string, any>;
    resources: ResourceRequirements;
}

export interface ProcessingStatus {
    state: 'running' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    startTime: Date;
    endTime?: Date;
    currentStage?: string;
}

export interface ProcessingError {
    timestamp: Date;
    stage: string;
    errorType: string;
    message: string;
    stackTrace?: string;
    affectedRecords: number;
}

export interface Checkpoint {
    id: string;
    timestamp: Date;
    offset: string;
    metadata: Record<string, any>;
}

export interface OutputLocation {
    type: 'file' | 'database' | 'stream' | 'api';
    path: string;
    format: string;
    size?: number;
    recordCount?: number;
}

export interface ResourceMetrics {
    cpu: CPUMetrics;
    memory: MemoryMetrics;
    network: NetworkMetrics;
    disk: DiskMetrics;
}

export interface CPUMetrics {
    usage: number;
    cores: number;
    throttling: number;
}

export interface MemoryMetrics {
    used: number;
    available: number;
    gcTime: number;
    gcCount: number;
}

export interface NetworkMetrics {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    errors: number;
}

export interface DiskMetrics {
    readBytes: number;
    writeBytes: number;
    readOps: number;
    writeOps: number;
    queueDepth: number;
}

export interface AnomalyStatus {
    acknowledged: boolean;
    assignedTo?: string;
    resolution?: string;
    resolvedAt?: Date;
}

export interface TimeWindow {
    start: Date;
    end: Date;
    duration: Duration;
}

export interface Duration {
    value: number;
    unit: 'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y';
}

export interface NodeStatus {
    state: 'running' | 'idle' | 'error' | 'initializing';
    health: 'healthy' | 'warning' | 'critical';
    lastUpdate: Date;
}

export interface ValidationRule {
    id: string;
    name: string;
    expression: string;
    errorMessage: string;
}

export interface ClassificationRule {
    pattern: string;
    level: string;
    priority: number;
}

export interface EncryptionConfig {
    atRest: boolean;
    inTransit: boolean;
    algorithm: string;
    keyManagement: 'managed' | 'customer' | 'hsm';
}

export interface AccessControlConfig {
    authentication: AuthenticationMethod;
    authorization: AuthorizationModel;
    rbac: RBACConfig;
}

export interface AuditConfig {
    enabled: boolean;
    events: string[];
    retention: Duration;
    storage: string;
}

export interface ModelArtifacts {
    location: string;
    size: number;
    checksum: string;
    dependencies: string[];
}

export interface ModelPerformance {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    latency: LatencyMetrics;
    throughput: number;
}

export interface FeatureEngineeringConfig {
    features: FeatureDefinition[];
    transformations: FeatureTransformation[];
    validation: FeatureValidation[];
}

export interface InferenceConfig {
    batchSize: number;
    timeout: Duration;
    retries: number;
    caching: boolean;
}

export interface MLMonitoringConfig {
    drift: DriftDetectionConfig;
    performance: PerformanceMonitoringConfig;
    fairness: FairnessMonitoringConfig;
}

export interface RetrainingConfig {
    schedule: string; // Cron expression
    trigger: RetrainingTrigger;
    dataRequirements: DataRequirements;
}

export interface ComplianceRequirement {
    id: string;
    description: string;
    controls: string[];
}

export interface MetricConfig {
    name: string;
    type: 'counter' | 'gauge' | 'histogram' | 'summary';
    labels: string[];
}

export interface LogConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    destination: string;
}

export interface TraceConfig {
    enabled: boolean;
    samplingRate: number;
    exporter: string;
}

export interface AutoScalingConfig {
    enabled: boolean;
    minInstances: number;
    maxInstances: number;
    targetCPU?: number;
    targetMemory?: number;
    targetThroughput?: number;
}

export interface CachingConfig {
    enabled: boolean;
    ttl: Duration;
    maxSize: number;
    evictionPolicy: 'lru' | 'lfu' | 'fifo';
}

export interface CompressionConfig {
    enabled: boolean;
    algorithm: string;
    level: number;
}

export interface PartitioningConfig {
    enabled: boolean;
    strategy: PartitioningStrategy;
    pruning: boolean;
}

export interface ResourceRequirements {
    cpu: string;
    memory: string;
    disk?: string;
    gpu?: string;
}

export interface CostEstimate {
    compute: number;
    storage: number;
    network: number;
    total: number;
    currency: string;
}

export interface SLAConfig {
    availability: number;
    latency: LatencyRequirement;
    throughput: ThroughputRequirement;
}

export interface LatencyRequirement {
    p50: number;
    p95: number;
    p99: number;
}

export interface ThroughputRequirement {
    min: number;
    target: number;
}

export interface StreamError {
    timestamp: Date;
    code: string;
    message: string;
    severity: 'warning' | 'error' | 'critical';
}

export interface QualityCondition {
    expression: string;
    parameters?: Record<string, any>;
}

export interface TransformInput {
    streams: string[];
    format: string;
    schema?: DataSchema;
}

export interface TransformOutput {
    stream: string;
    format: string;
    schema?: DataSchema;
    partitioning?: PartitioningStrategy;
}

export interface ErrorHandlingConfig {
    strategy: ErrorHandlingStrategy;
    deadLetterStream?: string;
    alerting?: boolean;
}

export interface AggregationType {
    function: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'stddev';
    window?: Duration;
}

export interface AlertSchedule {
    type: 'cron' | 'interval';
    expression: string;
}

export interface AuthenticationMethod {
    type: 'basic' | 'oauth2' | 'saml' | 'ldap' | 'certificate';
    config: Record<string, any>;
}

export interface AuthorizationModel {
    type: 'rbac' | 'abac' | 'pbac';
    config: Record<string, any>;
}

export interface RBACConfig {
    roles: Role[];
    permissions: Permission[];
    assignments: RoleAssignment[];
}

export interface Role {
    id: string;
    name: string;
    permissions: string[];
}

export interface Permission {
    id: string;
    resource: string;
    action: string;
}

export interface RoleAssignment {
    userId: string;
    roleId: string;
    scope?: string;
}

export interface FeatureDefinition {
    name: string;
    type: FieldType;
    source: string;
    expression?: string;
}

export interface FeatureTransformation {
    input: string;
    output: string;
    type: string;
    config: Record<string, any>;
}

export interface FeatureValidation {
    feature: string;
    rule: ValidationRule;
}

export interface DriftDetectionConfig {
    enabled: boolean;
    baseline: string;
    threshold: number;
    window: Duration;
}

export interface PerformanceMonitoringConfig {
    metrics: string[];
    thresholds: Record<string, number>;
    alerting: boolean;
}

export interface FairnessMonitoringConfig {
    enabled: boolean;
    protectedAttributes: string[];
    metrics: string[];
}

export interface RetrainingTrigger {
    type: 'schedule' | 'drift' | 'performance' | 'manual';
    config: Record<string, any>;
}

export interface DataRequirements {
    minSamples: number;
    timeRange: Duration;
    quality: QualityRequirement;
}

export interface QualityRequirement {
    completeness: number;
    accuracy: number;
    freshness: Duration;
}