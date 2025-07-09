// Infrastructure types
export interface Infrastructure {
    networks: NetworkSegment[];
    endpoints: Endpoint[];
    applications: Application[];
    cloudResources: CloudResource[];
    users: User[];
    assets: Asset[];
}

export interface NetworkSegment {
    id: string;
    name: string;
    subnet: string;
    vlan?: number;
    zone: 'dmz' | 'internal' | 'external' | 'management';
    assets: string[];
    securityLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface Endpoint {
    id: string;
    hostname: string;
    ip: string;
    os: string;
    type: 'workstation' | 'server' | 'mobile' | 'iot';
    owner: string;
    lastSeen: Date;
    securityAgent: boolean;
}

export interface Application {
    id: string;
    name: string;
    version: string;
    type: 'web' | 'api' | 'database' | 'service';
    criticality: 'low' | 'medium' | 'high' | 'critical';
    endpoints: string[];
    dependencies: string[];
}

export interface CloudResource {
    id: string;
    provider: 'aws' | 'gcp' | 'azure' | 'other';
    type: string;
    region: string;
    tags: Record<string, string>;
    configuration: any;
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    department: string;
    riskScore: number;
    lastActivity: Date;
}

export interface Asset {
    id: string;
    name: string;
    type: string;
    value: number;
    classification: 'public' | 'internal' | 'confidential' | 'secret';
    owner: string;
}

// Security Policies
export interface SecurityPolicies {
    threatResponse: ThreatResponsePolicy[];
    compliance: CompliancePolicy[];
    access: AccessPolicy[];
    data: DataPolicy[];
    incident: IncidentPolicy[];

    getResponsePolicy(threatType: string): ResponsePolicy;
}

export interface ThreatResponsePolicy {
    threatType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    automatedResponse: boolean;
    actions: string[];
    notifications: string[];
    escalation: EscalationPolicy;
}

export interface CompliancePolicy {
    standard: string;
    requirements: string[];
    controls: string[];
    auditFrequency: string;
}

export interface AccessPolicy {
    resource: string;
    permissions: string[];
    conditions: any;
    mfa: boolean;
}

export interface DataPolicy {
    classification: string;
    retention: number;
    encryption: boolean;
    backup: boolean;
}

export interface IncidentPolicy {
    type: string;
    sla: number;
    team: string;
    playbook: string;
}

export interface EscalationPolicy {
    levels: EscalationLevel[];
    timeout: number;
}

export interface EscalationLevel {
    level: number;
    contacts: string[];
    actions: string[];
}

// Threat types
export interface Threat {
    id: string;
    timestamp: Date;
    type: string;
    source: string;
    target: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    indicators: string[];
    metadata: any;
    sourceIPs?: string[];
    destinationIPs?: string[];
    protocols?: string[];
}

export interface ThreatAnalysis {
    id: string;
    timestamp: Date;
    threat: Threat;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    attackVector: string;
    ttps: string[]; // MITRE ATT&CK
    impactAssessment: ImpactAssessment;
    attributions: Attribution[];
    relatedIncidents: string[];
    predictedNextSteps: string[];
    timeline?: any;
}

export interface ImpactAssessment {
    confidentiality: number;
    integrity: number;
    availability: number;
    financial: number;
    reputation: number;
    overall: number;
}

export interface Attribution {
    actor: string;
    confidence: number;
    evidence: string[];
    ttps: string[];
}

// Response types
export interface SecurityResponse {
    id: string;
    timestamp: Date;
    threat: ThreatAnalysis;
    automatedActions: ResponseAction[];
    manualActions: ResponseAction[];
    effectiveness: number;
    timeToContain: number;
    timeToRemediate: number;
    collectedArtifacts: CollectedArtifacts;
    timeline: ResponseTimeline;
}

export interface ResponseAction {
    id: string;
    type: string;
    target: string;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    result?: any;
    timestamp: Date;
}

export interface CollectedArtifacts {
    networkCaptures: any[];
    memoryDumps: any[];
    logFiles: any[];
    fileSystem: any[];
    registry: any[];
}

export interface ResponseTimeline {
    detection: Date;
    containment?: Date;
    eradication?: Date;
    recovery?: Date;
    lessonsLearned?: Date;
}

// Forensics types
export interface ForensicsReport {
    id: string;
    timestamp: Date;
    threat: ThreatAnalysis;
    rootCause: string;
    attackPath: AttackPath[];
    compromisedAssets: string[];
    dataExfiltration: DataExfiltration | null;
    persistenceMechanisms: string[];
    iocs: IOC[]; // Indicators of Compromise
    evidence: Evidence[];
}

export interface AttackPath {
    step: number;
    timestamp: Date;
    action: string;
    source: string;
    target: string;
    technique: string;
}

export interface DataExfiltration {
    confirmed: boolean;
    dataTypes: string[];
    volume: number;
    destination: string;
    method: string;
}

export interface IOC {
    type: 'ip' | 'domain' | 'hash' | 'email' | 'url' | 'file';
    value: string;
    context: string;
    confidence: number;
}

export interface Evidence {
    id: string;
    type: string;
    source: string;
    hash: string;
    chainOfCustody: ChainOfCustody[];
}

export interface ChainOfCustody {
    timestamp: Date;
    action: string;
    actor: string;
    hash: string;
}

// Executive Report types
export interface ExecutiveReport {
    id: string;
    timestamp: Date;
    executiveSummary: string;
    threatOverview: any;
    responseActions: any;
    forensicFindings: any;
    recommendations: any;
    complianceImpact: any;
    costAnalysis: number;
    lessonsLearned: string[];
}

// Monitoring types
export interface MonitoringPipeline {
    addMonitor(name: string, monitor: any): void;
    on(event: string, handler: Function): void;
    start(): Promise<void>;
    getStatus(): SecurityStatus;
}

export interface MonitoringConfig {
    network?: NetworkMonitoringConfig;
    endpoints?: EndpointMonitoringConfig;
    applications?: ApplicationMonitoringConfig;
    cloud?: CloudMonitoringConfig;
}

export interface NetworkMonitoringConfig {
    deepPacketInspection: boolean;
    encryptedTrafficAnalysis: boolean;
    lateralMovementDetection: boolean;
    protocols?: string[];
    anomalyDetection?: {
        enabled: boolean;
        sensitivity: 'low' | 'medium' | 'high';
        baselineWindow: string;
    };
}

export interface EndpointMonitoringConfig {
    processAnalysis: boolean;
    memoryForensics: boolean;
    behaviorMonitoring: boolean;
    fileIntegrity?: boolean;
    registryMonitoring?: boolean;
    kernelMonitoring?: boolean;
    antivirusIntegration?: boolean;
}

export interface ApplicationMonitoringConfig {
    apiSecurityScanning: boolean;
    codeVulnerabilityDetection: boolean;
    secretsDetection: boolean;
    dependencyScanning?: boolean;
    runtimeProtection?: boolean;
    wasmSandboxing?: boolean;
}

export interface CloudMonitoringConfig {
    configurationDrift: boolean;
    accessPatternAnalysis: boolean;
    dataExfiltrationDetection: boolean;
    complianceMonitoring?: boolean;
    costAnomalyDetection?: boolean;
    multiCloudVisibility?: boolean;
}

// Status types
export interface SecurityStatus {
    state: 'initializing' | 'running' | 'degraded' | 'error';
    health: 'healthy' | 'warning' | 'critical' | 'unknown';
    lastUpdate: Date;
    activeThreats: number;
    blockedThreats: number;
    falsePositives: number;
    uptime: number;
    metrics?: SecurityMetrics;
}

export interface SecurityMetrics {
    mttd: number; // Mean Time to Detect
    mttr: number; // Mean Time to Respond
    threatsCaught: number;
    falsePositiveRate: number;
    coverage: number;
    compliance: number;
}

// Response Policy
export interface ResponsePolicy {
    id: string;
    name: string;
    threatType: string;
    actions: PolicyAction[];
    constraints: ResponseConstraints;
    approval?: ApprovalPolicy;
}

export interface PolicyAction {
    type: string;
    parameters: any;
    priority: number;
    timeout: number;
}

export interface ResponseConstraints {
    maxDowntime: number;
    preserveEvidence: boolean;
    notifyStakeholders?: boolean;
    enableRollback?: boolean;
}

export interface ApprovalPolicy {
    required: boolean;
    approvers: string[];
    timeout: number;
    escalation: string;
}

// Recommendations
export interface SecurityRecommendations {
    immediate: Recommendation[];
    shortTerm: Recommendation[];
    longTerm: Recommendation[];
    strategic: Recommendation[];
    estimatedCost?: number;
    riskReduction?: number;
}

export interface Recommendation {
    id: string;
    title: string;
    description: string;
    priority: 'immediate' | 'short-term' | 'long-term' | 'strategic';
    category: string;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    cost: number;
    resources: string[];
}

// Incident types
export interface Incident {
    id: string;
    timestamp: Date;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'new' | 'investigating' | 'contained' | 'remediated' | 'closed';
    assignee: string;
    description: string;
    affectedAssets: string[];
    timeline: IncidentTimeline[];
    artifacts: string[];
    notes: IncidentNote[];
}

export interface IncidentTimeline {
    timestamp: Date;
    action: string;
    actor: string;
    details: string;
}

export interface IncidentNote {
    timestamp: Date;
    author: string;
    content: string;
    attachments: string[];
}