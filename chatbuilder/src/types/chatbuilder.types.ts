// G3D ChatBuilder - Comprehensive Type Definitions
// Conversational AI Platform Types

export interface Chatbot {
    id: string;
    name: string;
    description?: string;
    version: string;
    status: ChatbotStatus;
    configuration: ChatbotConfiguration;
    conversationFlow: ConversationFlow;
    intents: Intent[];
    entities: Entity[];
    responses: ResponseTemplate[];
    integrations: PlatformIntegration[];
    analytics: ChatbotAnalytics;
    training: TrainingData;
    deployment: DeploymentConfig;
    metadata: ChatbotMetadata;
    createdAt: Date;
    updatedAt: Date;
}

export type ChatbotStatus = 'draft' | 'training' | 'testing' | 'deployed' | 'archived';

export interface ChatbotConfiguration {
    language: string;
    fallbackEnabled: boolean;
    fallbackMessage: string;
    confidenceThreshold: number;
    maxTurns: number;
    sessionTimeout: number;
    enableSmallTalk: boolean;
    enableSpellCheck: boolean;
    enableSentimentAnalysis: boolean;
    personality: PersonalityConfig;
    security: SecurityConfig;
}

export interface PersonalityConfig {
    tone: 'formal' | 'casual' | 'friendly' | 'professional' | 'playful';
    verbosity: 'concise' | 'normal' | 'detailed';
    empathy: 'low' | 'medium' | 'high';
    humor: boolean;
    customTraits: Record<string, any>;
}

export interface SecurityConfig {
    enableProfanityFilter: boolean;
    enablePIIDetection: boolean;
    dataRetention: number; // days
    encryptConversations: boolean;
    allowedDomains?: string[];
    rateLimiting: RateLimitConfig;
}

export interface RateLimitConfig {
    enabled: boolean;
    maxRequestsPerMinute: number;
    maxRequestsPerHour: number;
    maxRequestsPerDay: number;
}

// Conversation Flow
export interface ConversationFlow {
    id: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    startNodeId: string;
    variables: FlowVariable[];
    metadata: FlowMetadata;
}

export interface FlowNode {
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: NodeData;
    style?: NodeStyle;
}

export type NodeType =
    | 'start'
    | 'message'
    | 'question'
    | 'condition'
    | 'action'
    | 'api_call'
    | 'human_handoff'
    | 'end';

export interface NodeData {
    label: string;
    content?: string;
    conditions?: Condition[];
    actions?: Action[];
    apiConfig?: APICallConfig;
    validation?: ValidationRule[];
    metadata?: Record<string, any>;
}

export interface NodeStyle {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    width?: number;
    height?: number;
}

export interface FlowEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    condition?: Condition;
    style?: EdgeStyle;
}

export interface EdgeStyle {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
}

export interface Condition {
    type: 'intent' | 'entity' | 'variable' | 'expression';
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex';
    value: any;
    field?: string;
}

export interface Action {
    type: 'set_variable' | 'api_call' | 'send_message' | 'trigger_event' | 'end_conversation';
    parameters: Record<string, any>;
}

export interface APICallConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    timeout: number;
    retries: number;
    authentication?: AuthenticationConfig;
}

export interface AuthenticationConfig {
    type: 'none' | 'api_key' | 'bearer' | 'basic' | 'oauth';
    credentials: Record<string, string>;
}

export interface FlowVariable {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    defaultValue?: any;
    required: boolean;
    description?: string;
}

export interface ValidationRule {
    type: 'required' | 'min_length' | 'max_length' | 'pattern' | 'custom';
    value?: any;
    message: string;
}

export interface FlowMetadata {
    version: string;
    lastModified: Date;
    author: string;
    tags: string[];
}

// Intent Recognition
export interface Intent {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    trainingPhrases: TrainingPhrase[];
    parameters: IntentParameter[];
    responses: IntentResponse[];
    webhookEnabled: boolean;
    priority: number;
    contexts: Context[];
    metadata: IntentMetadata;
}

export interface TrainingPhrase {
    id: string;
    text: string;
    entities: EntityAnnotation[];
    language: string;
}

export interface EntityAnnotation {
    entityType: string;
    startIndex: number;
    endIndex: number;
    value: string;
    alias?: string;
}

export interface IntentParameter {
    name: string;
    displayName: string;
    entityType: string;
    required: boolean;
    prompts: string[];
    defaultValue?: any;
}

export interface IntentResponse {
    text: string;
    language: string;
    platform?: string;
    conditions?: Condition[];
}

export interface Context {
    name: string;
    lifespanCount: number;
    parameters?: Record<string, any>;
}

export interface IntentMetadata {
    confidence: number;
    trainingCount: number;
    lastTrained: Date;
    performance: IntentPerformance;
}

export interface IntentPerformance {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix?: ConfusionMatrix;
}

export interface ConfusionMatrix {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
}

// Entity Recognition
export interface Entity {
    id: string;
    name: string;
    displayName: string;
    type: EntityType;
    values: EntityValue[];
    fuzzyMatching: boolean;
    automaticExpansion: boolean;
    metadata: EntityMetadata;
}

export type EntityType = 'system' | 'developer' | 'regexp' | 'composite';

export interface EntityValue {
    value: string;
    synonyms: string[];
    language: string;
}

export interface EntityMetadata {
    usage: number;
    lastUpdated: Date;
    performance: EntityPerformance;
}

export interface EntityPerformance {
    extractionAccuracy: number;
    recognitionRate: number;
    falsePositiveRate: number;
}

// Response Templates
export interface ResponseTemplate {
    id: string;
    name: string;
    type: ResponseType;
    content: ResponseContent;
    conditions?: Condition[];
    platforms: string[];
    metadata: ResponseMetadata;
}

export type ResponseType =
    | 'text'
    | 'quick_reply'
    | 'card'
    | 'carousel'
    | 'image'
    | 'audio'
    | 'video'
    | 'file'
    | 'custom';

export interface ResponseContent {
    text?: string;
    quickReplies?: QuickReply[];
    cards?: Card[];
    media?: MediaContent;
    customPayload?: any;
}

export interface QuickReply {
    title: string;
    payload: string;
    imageUrl?: string;
}

export interface Card {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    buttons: Button[];
}

export interface Button {
    type: 'postback' | 'web_url' | 'phone_number';
    title: string;
    payload?: string;
    url?: string;
}

export interface MediaContent {
    type: 'image' | 'audio' | 'video' | 'file';
    url: string;
    caption?: string;
    duration?: number;
    size?: number;
}

export interface ResponseMetadata {
    usage: number;
    performance: ResponsePerformance;
    lastUsed: Date;
}

export interface ResponsePerformance {
    clickThroughRate?: number;
    engagementRate: number;
    userSatisfaction: number;
}

// Platform Integrations
export interface PlatformIntegration {
    id: string;
    platform: Platform;
    status: IntegrationStatus;
    configuration: PlatformConfiguration;
    credentials: PlatformCredentials;
    features: PlatformFeature[];
    webhooks: WebhookConfig[];
    metadata: IntegrationMetadata;
}

export type Platform =
    | 'web'
    | 'facebook'
    | 'whatsapp'
    | 'telegram'
    | 'slack'
    | 'discord'
    | 'teams'
    | 'twilio'
    | 'voice'
    | 'custom';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'testing';

export interface PlatformConfiguration {
    customization: PlatformCustomization;
    features: Record<string, boolean>;
    limits: PlatformLimits;
    settings: Record<string, any>;
}

export interface PlatformCustomization {
    theme: ThemeConfig;
    branding: BrandingConfig;
    layout: LayoutConfig;
}

export interface ThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    borderRadius: number;
}

export interface BrandingConfig {
    logo?: string;
    name: string;
    tagline?: string;
    avatar?: string;
}

export interface LayoutConfig {
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
    size: 'small' | 'medium' | 'large';
    expandable: boolean;
}

export interface PlatformLimits {
    maxMessageLength: number;
    maxAttachmentSize: number;
    rateLimits: RateLimitConfig;
}

export interface PlatformCredentials {
    apiKey?: string;
    accessToken?: string;
    secretKey?: string;
    webhookUrl?: string;
    verifyToken?: string;
    additional?: Record<string, string>;
}

export interface PlatformFeature {
    name: string;
    enabled: boolean;
    configuration?: Record<string, any>;
}

export interface WebhookConfig {
    url: string;
    events: string[];
    secret?: string;
    headers?: Record<string, string>;
}

export interface IntegrationMetadata {
    connectedAt: Date;
    lastSync: Date;
    messageCount: number;
    errorCount: number;
    performance: IntegrationPerformance;
}

export interface IntegrationPerformance {
    uptime: number;
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
}

// Training Data
export interface TrainingData {
    conversations: TrainingConversation[];
    intents: TrainingIntent[];
    entities: TrainingEntity[];
    evaluation: TrainingEvaluation;
    augmentation: DataAugmentation;
    metadata: TrainingMetadata;
}

export interface TrainingConversation {
    id: string;
    messages: TrainingMessage[];
    context: ConversationContext;
    outcome: ConversationOutcome;
    quality: number;
}

export interface TrainingMessage {
    role: 'user' | 'assistant';
    content: string;
    intent?: string;
    entities?: EntityAnnotation[];
    confidence?: number;
    timestamp: Date;
}

export interface ConversationContext {
    platform: string;
    userType: string;
    sessionId: string;
    variables: Record<string, any>;
}

export interface ConversationOutcome {
    resolved: boolean;
    satisfaction: number;
    handoffRequired: boolean;
    goalAchieved: boolean;
}

export interface TrainingIntent {
    name: string;
    examples: string[];
    counterExamples: string[];
    weight: number;
}

export interface TrainingEntity {
    name: string;
    examples: EntityExample[];
    patterns: string[];
}

export interface EntityExample {
    text: string;
    value: string;
    synonyms: string[];
}

export interface TrainingEvaluation {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    crossValidation: CrossValidationResults;
    testResults: TestResults;
}

export interface CrossValidationResults {
    folds: number;
    averageAccuracy: number;
    standardDeviation: number;
    results: number[];
}

export interface TestResults {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    testCases: TestCase[];
}

export interface TestCase {
    input: string;
    expectedIntent: string;
    actualIntent: string;
    confidence: number;
    passed: boolean;
}

export interface DataAugmentation {
    enabled: boolean;
    techniques: AugmentationTechnique[];
    multiplier: number;
}

export interface AugmentationTechnique {
    type: 'synonym_replacement' | 'paraphrasing' | 'back_translation' | 'noise_injection';
    parameters: Record<string, any>;
    enabled: boolean;
}

export interface TrainingMetadata {
    modelVersion: string;
    trainedAt: Date;
    trainingDuration: number;
    datasetSize: number;
    iterations: number;
}

// Analytics and Monitoring
export interface ChatbotAnalytics {
    overview: AnalyticsOverview;
    conversations: ConversationAnalytics;
    intents: IntentAnalytics;
    users: UserAnalytics;
    performance: PerformanceAnalytics;
    satisfaction: SatisfactionAnalytics;
}

export interface AnalyticsOverview {
    totalConversations: number;
    totalMessages: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    resolutionRate: number;
    handoffRate: number;
    period: AnalyticsPeriod;
}

export interface AnalyticsPeriod {
    start: Date;
    end: Date;
    granularity: 'hour' | 'day' | 'week' | 'month';
}

export interface ConversationAnalytics {
    volumeOverTime: TimeSeriesPoint[];
    averageLength: number;
    completionRate: number;
    dropoffPoints: DropoffPoint[];
    popularFlows: FlowUsage[];
}

export interface TimeSeriesPoint {
    timestamp: Date;
    value: number;
}

export interface DropoffPoint {
    nodeId: string;
    nodeName: string;
    dropoffRate: number;
    count: number;
}

export interface FlowUsage {
    flowId: string;
    flowName: string;
    usage: number;
    completionRate: number;
}

export interface IntentAnalytics {
    distribution: IntentDistribution[];
    confidence: ConfidenceDistribution;
    misclassifications: Misclassification[];
    trending: TrendingIntent[];
}

export interface IntentDistribution {
    intentName: string;
    count: number;
    percentage: number;
    averageConfidence: number;
}

export interface ConfidenceDistribution {
    high: number; // > 0.8
    medium: number; // 0.5 - 0.8
    low: number; // < 0.5
}

export interface Misclassification {
    actualIntent: string;
    predictedIntent: string;
    count: number;
    examples: string[];
}

export interface TrendingIntent {
    intentName: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
}

export interface UserAnalytics {
    demographics: UserDemographics;
    behavior: UserBehavior;
    retention: UserRetention;
    satisfaction: UserSatisfaction;
}

export interface UserDemographics {
    totalUsers: number;
    newUsers: number;
    returningUsers: number;
    platforms: PlatformUsage[];
    locations: LocationUsage[];
}

export interface PlatformUsage {
    platform: string;
    users: number;
    percentage: number;
}

export interface LocationUsage {
    country: string;
    users: number;
    percentage: number;
}

export interface UserBehavior {
    averageSessionsPerUser: number;
    averageMessagesPerSession: number;
    peakUsageHours: number[];
    commonQueries: QueryFrequency[];
}

export interface QueryFrequency {
    query: string;
    count: number;
    intent: string;
}

export interface UserRetention {
    day1: number;
    day7: number;
    day30: number;
    cohortAnalysis: CohortData[];
}

export interface CohortData {
    cohort: string;
    retention: number[];
}

export interface UserSatisfaction {
    averageRating: number;
    ratingDistribution: RatingDistribution;
    feedback: FeedbackSummary;
}

export interface RatingDistribution {
    [rating: number]: number;
}

export interface FeedbackSummary {
    positive: number;
    negative: number;
    neutral: number;
    commonThemes: string[];
}

export interface PerformanceAnalytics {
    responseTime: ResponseTimeMetrics;
    availability: AvailabilityMetrics;
    errors: ErrorMetrics;
    throughput: ThroughputMetrics;
}

export interface ResponseTimeMetrics {
    average: number;
    p50: number;
    p95: number;
    p99: number;
    trend: TimeSeriesPoint[];
}

export interface AvailabilityMetrics {
    uptime: number;
    downtime: number;
    incidents: Incident[];
}

export interface Incident {
    id: string;
    startTime: Date;
    endTime?: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    resolved: boolean;
}

export interface ErrorMetrics {
    totalErrors: number;
    errorRate: number;
    errorTypes: ErrorType[];
    topErrors: TopError[];
}

export interface ErrorType {
    type: string;
    count: number;
    percentage: number;
}

export interface TopError {
    message: string;
    count: number;
    lastOccurred: Date;
}

export interface ThroughputMetrics {
    messagesPerSecond: number;
    messagesPerMinute: number;
    messagesPerHour: number;
    trend: TimeSeriesPoint[];
}

export interface SatisfactionAnalytics {
    overallScore: number;
    trend: TimeSeriesPoint[];
    byIntent: IntentSatisfaction[];
    byPlatform: PlatformSatisfaction[];
    factors: SatisfactionFactor[];
}

export interface IntentSatisfaction {
    intentName: string;
    score: number;
    sampleSize: number;
}

export interface PlatformSatisfaction {
    platform: string;
    score: number;
    sampleSize: number;
}

export interface SatisfactionFactor {
    factor: string;
    impact: number;
    correlation: number;
}

// Deployment Configuration
export interface DeploymentConfig {
    id: string;
    environment: 'development' | 'staging' | 'production';
    regions: DeploymentRegion[];
    scaling: ScalingConfig;
    monitoring: MonitoringConfig;
    security: SecurityConfig;
    backup: BackupConfig;
}

export interface DeploymentRegion {
    name: string;
    primary: boolean;
    endpoints: RegionEndpoint[];
    capacity: RegionCapacity;
}

export interface RegionEndpoint {
    type: 'api' | 'webhook' | 'websocket';
    url: string;
    healthCheck: string;
}

export interface RegionCapacity {
    maxConcurrentSessions: number;
    maxRequestsPerSecond: number;
    storage: string;
}

export interface ScalingConfig {
    autoScaling: boolean;
    minInstances: number;
    maxInstances: number;
    targetUtilization: number;
    scaleUpThreshold: number;
    scaleDownThreshold: number;
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
    labels: string[];
    retention: string;
}

export interface AlertRule {
    name: string;
    condition: string;
    severity: 'info' | 'warning' | 'critical';
    channels: string[];
    cooldown: number;
}

export interface LoggingConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    retention: number;
    structured: boolean;
    sampling: number;
}

export interface BackupConfig {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly';
    retention: number;
    encryption: boolean;
    destinations: BackupDestination[];
}

export interface BackupDestination {
    type: 's3' | 'gcs' | 'azure' | 'local';
    configuration: Record<string, any>;
}

// Conversation Management
export interface Conversation {
    id: string;
    sessionId: string;
    userId: string;
    chatbotId: string;
    platform: string;
    status: ConversationStatus;
    messages: Message[];
    context: ConversationContext;
    metadata: ConversationMetadata;
    startedAt: Date;
    endedAt?: Date;
}

export type ConversationStatus = 'active' | 'ended' | 'transferred' | 'abandoned';

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: MessageContent;
    intent?: RecognizedIntent;
    entities?: RecognizedEntity[];
    confidence?: number;
    timestamp: Date;
    metadata?: MessageMetadata;
}

export interface MessageContent {
    type: 'text' | 'image' | 'audio' | 'video' | 'file' | 'quick_reply' | 'postback';
    text?: string;
    media?: MediaContent;
    payload?: any;
}

export interface RecognizedIntent {
    name: string;
    confidence: number;
    parameters: Record<string, any>;
}

export interface RecognizedEntity {
    type: string;
    value: string;
    confidence: number;
    startIndex: number;
    endIndex: number;
}

export interface MessageMetadata {
    processingTime: number;
    modelVersion: string;
    debugInfo?: any;
}

export interface ConversationMetadata {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    tags: string[];
    customData: Record<string, any>;
}

// Testing and Quality Assurance
export interface TestSuite {
    id: string;
    name: string;
    description?: string;
    testCases: TestCase[];
    schedule: TestSchedule;
    results: TestResult[];
    configuration: TestConfiguration;
}

export interface TestSchedule {
    enabled: boolean;
    frequency: 'manual' | 'daily' | 'weekly' | 'on_deploy';
    time?: string;
    timezone?: string;
}

export interface TestResult {
    id: string;
    executedAt: Date;
    duration: number;
    status: 'passed' | 'failed' | 'error';
    summary: TestSummary;
    details: TestCaseResult[];
}

export interface TestSummary {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    errorTests: number;
    successRate: number;
}

export interface TestCaseResult {
    testCaseId: string;
    status: 'passed' | 'failed' | 'error';
    expectedResult: any;
    actualResult: any;
    errorMessage?: string;
    duration: number;
}

export interface TestConfiguration {
    timeout: number;
    retries: number;
    parallelExecution: boolean;
    environment: string;
}

// Metadata and Versioning
export interface ChatbotMetadata {
    version: string;
    author: string;
    collaborators: Collaborator[];
    tags: string[];
    category: string;
    industry: string;
    language: string;
    complexity: 'simple' | 'medium' | 'complex';
    changeLog: ChangeLogEntry[];
}

export interface Collaborator {
    userId: string;
    role: 'owner' | 'editor' | 'viewer';
    permissions: Permission[];
    addedAt: Date;
}

export interface Permission {
    resource: string;
    actions: string[];
}

export interface ChangeLogEntry {
    version: string;
    changes: string[];
    author: string;
    timestamp: Date;
    breaking: boolean;
}

// API Interfaces
export interface ChatBuilderAPI {
    // Chatbot management
    createChatbot(config: Partial<Chatbot>): Promise<Chatbot>;
    getChatbots(): Promise<Chatbot[]>;
    getChatbot(id: string): Promise<Chatbot>;
    updateChatbot(id: string, updates: Partial<Chatbot>): Promise<Chatbot>;
    deleteChatbot(id: string): Promise<void>;

    // Training and deployment
    trainChatbot(id: string): Promise<TrainingResult>;
    deployeChatbot(id: string, config: DeploymentConfig): Promise<DeploymentResult>;
    testChatbot(id: string, testSuite: TestSuite): Promise<TestResult>;

    // Conversation handling
    sendMessage(chatbotId: string, message: Message): Promise<Message>;
    getConversations(chatbotId: string, filters?: ConversationFilters): Promise<Conversation[]>;
    getConversation(id: string): Promise<Conversation>;

    // Analytics
    getAnalytics(chatbotId: string, period: AnalyticsPeriod): Promise<ChatbotAnalytics>;
    exportAnalytics(chatbotId: string, format: 'csv' | 'json' | 'pdf'): Promise<Blob>;

    // Integration management
    createIntegration(chatbotId: string, integration: PlatformIntegration): Promise<PlatformIntegration>;
    getIntegrations(chatbotId: string): Promise<PlatformIntegration[]>;
    updateIntegration(id: string, updates: Partial<PlatformIntegration>): Promise<PlatformIntegration>;
    deleteIntegration(id: string): Promise<void>;
}

export interface TrainingResult {
    success: boolean;
    duration: number;
    metrics: TrainingEvaluation;
    modelVersion: string;
    warnings?: string[];
    errors?: string[];
}

export interface DeploymentResult {
    success: boolean;
    deploymentId: string;
    endpoints: RegionEndpoint[];
    status: string;
    errors?: string[];
}

export interface ConversationFilters {
    platform?: string;
    status?: ConversationStatus;
    dateRange?: [Date, Date];
    userId?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
}