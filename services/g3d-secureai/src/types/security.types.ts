/**
 * G3D SecureAI - Security Operations TypeScript Definitions
 */

// Core Security Types
export interface SecurityThreat {
    id: string;
    name: string;
    type: ThreatType;
    severity: ThreatSeverity;
    status: ThreatStatus;
    description: string;
    source: ThreatSource;
    targets: string[];
    indicators: ThreatIndicator[];
    mitigations: Mitigation[];
    detectedAt: Date;
    lastUpdated: Date;
    assignedTo?: string;
}

export type ThreatType =
    | 'malware'
    | 'phishing'
    | 'ransomware'
    | 'ddos'
    | 'insider-threat'
    | 'data-breach'
    | 'social-engineering'
    | 'zero-day'
    | 'apt'
    | 'botnet'
    | 'credential-stuffing'
    | 'sql-injection'
    | 'xss'
    | 'privilege-escalation';

export type ThreatSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ThreatStatus =
    | 'new'
    | 'investigating'
    | 'confirmed'
    | 'mitigated'
    | 'resolved'
    | 'false-positive';

export interface ThreatSource {
    type: SourceType;
    location: GeoLocation;
    reputation: number;
    confidence: number;
    attribution?: string;
}

export type SourceType =
    | 'external'
    | 'internal'
    | 'unknown'
    | 'third-party'
    | 'partner'
    | 'contractor';

export interface GeoLocation {
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    isp?: string;
    organization?: string;
}

export interface ThreatIndicator {
    id: string;
    type: IndicatorType;
    value: string;
    confidence: number;
    context: string;
    source: string;
    firstSeen: Date;
    lastSeen: Date;
}

export type IndicatorType =
    | 'ip-address'
    | 'domain'
    | 'url'
    | 'file-hash'
    | 'email'
    | 'registry-key'
    | 'mutex'
    | 'user-agent'
    | 'certificate'
    | 'asn';

export interface Mitigation {
    id: string;
    action: MitigationAction;
    description: string;
    status: MitigationStatus;
    effectiveness: number;
    implementedAt?: Date;
    implementedBy?: string;
    cost: number;
    impact: string;
}

export type MitigationAction =
    | 'block-ip'
    | 'quarantine-file'
    | 'disable-account'
    | 'update-rules'
    | 'patch-system'
    | 'isolate-network'
    | 'backup-data'
    | 'notify-users'
    | 'forensic-analysis';

export type MitigationStatus =
    | 'planned'
    | 'in-progress'
    | 'completed'
    | 'failed'
    | 'cancelled';

// Security Incident Types
export interface SecurityIncident {
    id: string;
    title: string;
    description: string;
    type: IncidentType;
    severity: IncidentSeverity;
    status: IncidentStatus;
    priority: IncidentPriority;
    category: IncidentCategory;
    affectedAssets: Asset[];
    timeline: IncidentEvent[];
    responders: Responder[];
    evidence: Evidence[];
    impact: ImpactAssessment;
    resolution: IncidentResolution;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
}

export type IncidentType =
    | 'security-breach'
    | 'data-leak'
    | 'system-compromise'
    | 'unauthorized-access'
    | 'malware-infection'
    | 'denial-of-service'
    | 'policy-violation'
    | 'physical-security';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus =
    | 'open'
    | 'investigating'
    | 'containing'
    | 'eradicating'
    | 'recovering'
    | 'resolved'
    | 'closed';

export type IncidentPriority = 'p1' | 'p2' | 'p3' | 'p4';

export type IncidentCategory =
    | 'confidentiality'
    | 'integrity'
    | 'availability'
    | 'compliance'
    | 'reputation';

export interface Asset {
    id: string;
    name: string;
    type: AssetType;
    criticality: AssetCriticality;
    owner: string;
    location: string;
    vulnerabilities: Vulnerability[];
    lastAssessed: Date;
}

export type AssetType =
    | 'server'
    | 'workstation'
    | 'mobile-device'
    | 'network-device'
    | 'application'
    | 'database'
    | 'cloud-service'
    | 'iot-device';

export type AssetCriticality = 'low' | 'medium' | 'high' | 'critical';

export interface Vulnerability {
    id: string;
    cveId?: string;
    title: string;
    description: string;
    severity: VulnerabilitySeverity;
    cvssScore: number;
    exploitability: number;
    impact: VulnerabilityImpact;
    discoveredAt: Date;
    patchAvailable: boolean;
    patchDate?: Date;
    exploitPublic: boolean;
}

export type VulnerabilitySeverity = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface VulnerabilityImpact {
    confidentiality: 'none' | 'partial' | 'complete';
    integrity: 'none' | 'partial' | 'complete';
    availability: 'none' | 'partial' | 'complete';
}

export interface IncidentEvent {
    id: string;
    timestamp: Date;
    type: EventType;
    description: string;
    actor: string;
    source: string;
    details: Record<string, any>;
}

export type EventType =
    | 'detection'
    | 'escalation'
    | 'containment'
    | 'analysis'
    | 'communication'
    | 'recovery'
    | 'lesson-learned';

export interface Responder {
    id: string;
    name: string;
    role: ResponderRole;
    team: string;
    contactInfo: ContactInfo;
    availability: ResponderAvailability;
    expertise: string[];
}

export type ResponderRole =
    | 'incident-commander'
    | 'security-analyst'
    | 'forensic-investigator'
    | 'communications-lead'
    | 'technical-lead'
    | 'legal-counsel'
    | 'executive-sponsor';

export interface ContactInfo {
    email: string;
    phone: string;
    alternatePhone?: string;
    preferredMethod: 'email' | 'phone' | 'sms' | 'teams';
}

export interface ResponderAvailability {
    status: 'available' | 'busy' | 'offline';
    timezone: string;
    workingHours: TimeRange;
    onCall: boolean;
}

export interface TimeRange {
    start: string; // HH:mm format
    end: string;   // HH:mm format
}

export interface Evidence {
    id: string;
    type: EvidenceType;
    name: string;
    description: string;
    location: string;
    hash: string;
    size: number;
    collectedAt: Date;
    collectedBy: string;
    chainOfCustody: CustodyRecord[];
}

export type EvidenceType =
    | 'log-file'
    | 'network-capture'
    | 'disk-image'
    | 'memory-dump'
    | 'screenshot'
    | 'document'
    | 'email'
    | 'database-export';

export interface CustodyRecord {
    timestamp: Date;
    action: 'collected' | 'transferred' | 'analyzed' | 'stored' | 'destroyed';
    person: string;
    location: string;
    notes: string;
}

export interface ImpactAssessment {
    businessImpact: BusinessImpact;
    technicalImpact: TechnicalImpact;
    financialImpact: FinancialImpact;
    reputationalImpact: ReputationalImpact;
    complianceImpact: ComplianceImpact;
}

export interface BusinessImpact {
    severity: 'none' | 'minimal' | 'moderate' | 'significant' | 'severe';
    affectedProcesses: string[];
    downtime: number; // minutes
    customersAffected: number;
    dataCompromised: DataCompromise;
}

export interface DataCompromise {
    type: 'none' | 'pii' | 'phi' | 'financial' | 'intellectual-property' | 'classified';
    recordsAffected: number;
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface TechnicalImpact {
    systemsAffected: string[];
    servicesDisrupted: string[];
    dataIntegrityIssues: boolean;
    performanceImpact: number; // percentage
    recoveryTime: number; // hours
}

export interface FinancialImpact {
    directCosts: number;
    indirectCosts: number;
    regulatoryFines: number;
    legalCosts: number;
    totalEstimated: number;
    currency: string;
}

export interface ReputationalImpact {
    mediaAttention: 'none' | 'local' | 'national' | 'international';
    socialMediaMentions: number;
    customerComplaints: number;
    brandDamage: 'none' | 'minimal' | 'moderate' | 'significant' | 'severe';
}

export interface ComplianceImpact {
    regulationsAffected: string[];
    notificationRequired: boolean;
    reportingDeadline?: Date;
    potentialPenalties: string[];
}

export interface IncidentResolution {
    rootCause: string;
    contributingFactors: string[];
    lessonsLearned: string[];
    preventiveMeasures: PreventiveMeasure[];
    postIncidentActions: PostIncidentAction[];
}

export interface PreventiveMeasure {
    description: string;
    priority: 'low' | 'medium' | 'high';
    owner: string;
    dueDate: Date;
    status: 'planned' | 'in-progress' | 'completed';
    cost: number;
}

export interface PostIncidentAction {
    action: string;
    assignee: string;
    dueDate: Date;
    status: 'open' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
}

// Security Monitoring Types
export interface SecurityAlert {
    id: string;
    title: string;
    description: string;
    severity: AlertSeverity;
    type: AlertType;
    source: AlertSource;
    status: AlertStatus;
    confidence: number;
    falsePositiveProbability: number;
    relatedAlerts: string[];
    artifacts: AlertArtifact[];
    timeline: AlertEvent[];
    assignee?: string;
    createdAt: Date;
    updatedAt: Date;
    acknowledgedAt?: Date;
    resolvedAt?: Date;
}

export type AlertSeverity = 'informational' | 'low' | 'medium' | 'high' | 'critical';

export type AlertType =
    | 'anomaly-detection'
    | 'signature-match'
    | 'behavioral-analysis'
    | 'threat-intelligence'
    | 'compliance-violation'
    | 'policy-violation'
    | 'system-health';

export interface AlertSource {
    system: string;
    sensor: string;
    location: string;
    version: string;
}

export type AlertStatus =
    | 'new'
    | 'acknowledged'
    | 'investigating'
    | 'resolved'
    | 'false-positive'
    | 'escalated';

export interface AlertArtifact {
    type: ArtifactType;
    value: string;
    context: string;
    enrichment?: ArtifactEnrichment;
}

export type ArtifactType =
    | 'ip-address'
    | 'domain'
    | 'url'
    | 'file-hash'
    | 'user-account'
    | 'process'
    | 'registry-key'
    | 'network-connection';

export interface ArtifactEnrichment {
    reputation: number;
    geolocation?: GeoLocation;
    whoisData?: WhoisData;
    threatIntelligence?: ThreatIntelligenceData;
    malwareAnalysis?: MalwareAnalysis;
}

export interface WhoisData {
    registrar: string;
    registrationDate: Date;
    expirationDate: Date;
    registrant: string;
    adminContact: string;
    techContact: string;
}

export interface ThreatIntelligenceData {
    isMalicious: boolean;
    categories: string[];
    firstSeen: Date;
    lastSeen: Date;
    sources: string[];
    confidence: number;
}

export interface MalwareAnalysis {
    family: string;
    type: string;
    capabilities: string[];
    yara: string[];
    signatures: string[];
    behaviorAnalysis: BehaviorAnalysis;
}

export interface BehaviorAnalysis {
    networkActivity: NetworkActivity[];
    fileActivity: FileActivity[];
    registryActivity: RegistryActivity[];
    processActivity: ProcessActivity[];
}

export interface NetworkActivity {
    protocol: string;
    sourceIp: string;
    sourcePort: number;
    destinationIp: string;
    destinationPort: number;
    direction: 'inbound' | 'outbound';
    bytes: number;
    packets: number;
}

export interface FileActivity {
    operation: 'create' | 'read' | 'write' | 'delete' | 'execute';
    path: string;
    hash: string;
    size: number;
    timestamp: Date;
}

export interface RegistryActivity {
    operation: 'create' | 'read' | 'write' | 'delete';
    key: string;
    value?: string;
    data?: string;
    timestamp: Date;
}

export interface ProcessActivity {
    operation: 'create' | 'terminate' | 'inject';
    processId: number;
    processName: string;
    commandLine: string;
    parentProcessId?: number;
    timestamp: Date;
}

export interface AlertEvent {
    timestamp: Date;
    type: 'created' | 'updated' | 'acknowledged' | 'escalated' | 'resolved';
    user: string;
    details: string;
}

// Security Dashboard Types
export interface SecurityDashboard {
    id: string;
    name: string;
    description: string;
    widgets: DashboardWidget[];
    layout: DashboardLayout;
    permissions: DashboardPermissions;
    refreshInterval: number;
    createdBy: string;
    createdAt: Date;
    lastModified: Date;
}

export interface DashboardWidget {
    id: string;
    type: WidgetType;
    title: string;
    position: WidgetPosition;
    size: WidgetSize;
    configuration: WidgetConfiguration;
    dataSource: WidgetDataSource;
}

export type WidgetType =
    | 'metric'
    | 'chart'
    | 'table'
    | 'map'
    | 'timeline'
    | 'alert-list'
    | 'threat-feed'
    | 'status-indicator';

export interface WidgetPosition {
    x: number;
    y: number;
}

export interface WidgetSize {
    width: number;
    height: number;
}

export interface WidgetConfiguration {
    timeRange: TimeRange;
    filters: WidgetFilter[];
    aggregation?: AggregationType;
    visualization?: VisualizationSettings;
}

export interface WidgetFilter {
    field: string;
    operator: FilterOperator;
    value: any;
}

export type FilterOperator =
    | 'equals'
    | 'not-equals'
    | 'contains'
    | 'not-contains'
    | 'greater-than'
    | 'less-than'
    | 'in'
    | 'not-in';

export type AggregationType = 'count' | 'sum' | 'avg' | 'min' | 'max' | 'unique';

export interface VisualizationSettings {
    chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap';
    colorScheme: string;
    showLegend: boolean;
    showDataLabels: boolean;
}

export interface WidgetDataSource {
    type: 'alerts' | 'incidents' | 'threats' | 'vulnerabilities' | 'logs' | 'metrics';
    query: string;
    parameters: Record<string, any>;
}

export interface DashboardLayout {
    columns: number;
    rowHeight: number;
    margin: number;
    containerPadding: number;
}

export interface DashboardPermissions {
    view: string[];
    edit: string[];
    share: string[];
}

// API Response Types
export interface SecurityResponse<T> {
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
    };
}

// Configuration Types
export interface SecurityConfig {
    alertThresholds: Record<string, number>;
    automationRules: AutomationRule[];
    integrations: SecurityIntegration[];
    retentionPolicies: RetentionPolicy[];
    notificationSettings: NotificationSettings;
}

export interface AutomationRule {
    id: string;
    name: string;
    description: string;
    trigger: RuleTrigger;
    conditions: RuleCondition[];
    actions: RuleAction[];
    enabled: boolean;
}

export interface RuleTrigger {
    type: 'alert' | 'incident' | 'threat' | 'schedule';
    criteria: Record<string, any>;
}

export interface RuleCondition {
    field: string;
    operator: string;
    value: any;
    logic: 'AND' | 'OR';
}

export interface RuleAction {
    type: 'email' | 'webhook' | 'ticket' | 'block' | 'quarantine';
    parameters: Record<string, any>;
}

export interface SecurityIntegration {
    id: string;
    name: string;
    type: 'siem' | 'soar' | 'threat-intel' | 'vulnerability-scanner' | 'endpoint-protection';
    configuration: Record<string, any>;
    status: 'active' | 'inactive' | 'error';
}

export interface RetentionPolicy {
    dataType: string;
    retentionPeriod: number; // days
    archiveAfter: number; // days
    deleteAfter: number; // days
}

export interface NotificationSettings {
    email: EmailSettings;
    sms: SmsSettings;
    webhook: WebhookSettings;
    inApp: InAppSettings;
}

export interface EmailSettings {
    enabled: boolean;
    smtpServer: string;
    fromAddress: string;
    templates: Record<string, string>;
}

export interface SmsSettings {
    enabled: boolean;
    provider: string;
    apiKey: string;
    fromNumber: string;
}

export interface WebhookSettings {
    enabled: boolean;
    endpoints: WebhookEndpoint[];
}

export interface WebhookEndpoint {
    url: string;
    events: string[];
    headers: Record<string, string>;
    authentication: WebhookAuth;
}

export interface WebhookAuth {
    type: 'none' | 'basic' | 'bearer' | 'api-key';
    credentials: Record<string, string>;
}

export interface InAppSettings {
    enabled: boolean;
    channels: string[];
    priority: 'low' | 'medium' | 'high';
}