export interface OrchestratorConfig {
    openai: {
        enterpriseKey: string;
        orgId: string;
    };
    anthropic: {
        enterpriseKey: string;
    };
    selfHosted: {
        llamaEndpoint: string;
        starcoderEndpoint: string;
    };
    security: SecurityConfig;
    compliance: ComplianceConfig;
    quality: QualityConfig;
}

export interface SecurityConfig {
    scanners: string[];
    sensitivityLevels: Record<string, number>;
    customRules?: SecurityRule[];
}

export interface ComplianceConfig {
    standards: string[];
    industrySpecific: Record<string, string[]>;
    regionSpecific: Record<string, string[]>;
}

export interface QualityConfig {
    metrics: string[];
    thresholds: Record<string, number>;
    styleGuides: Record<string, any>;
}

export interface SecurityRule {
    id: string;
    name: string;
    pattern: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    fix?: string;
}

export interface EnterpriseCodeRequest {
    userId: string;
    organizationId?: string;
    prompt: string;
    language: string;
    framework?: string;
    requirements?: any;
    features?: string[];
    integrations?: string[];
    securityLevel?: 'critical' | 'high' | 'medium' | 'low';
    complianceStandards?: string[];
    industry?: string;
    region?: string;
    codingStyle?: string;
    performanceTarget?: string;
    testFramework?: string;
    deploymentTarget?: string;
    projectLicense?: string;
    customSecurityRules?: SecurityRule[];
}

export interface EnterpriseCodeResponse {
    code: string;
    language: string;
    framework?: string;
    providers: string[];
    security: SecurityReport;
    compliance: ComplianceReport;
    quality: QualityMetrics;
    documentation: string;
    tests: string;
    deployment: any;
    licenseCompatibility: any;
    metadata: {
        generatedAt: Date;
        version: string;
        requestId: string;
    };
    cost: {
        tokens: number;
        estimatedCost: number;
        currency: string;
        breakdown: any;
    };
}

export interface CodeComplexity {
    score: number;
    factors: {
        language: number;
        framework: number;
        features: number;
        integrations: number;
        security: number;
        compliance: number;
        scale: number;
    };
    category: 'high' | 'medium' | 'low';
    estimatedLOC: number;
    estimatedTime: number;
}

export interface SecurityReport {
    totalIssues: number;
    criticalIssues: SecurityIssue[];
    highIssues: SecurityIssue[];
    mediumIssues: SecurityIssue[];
    lowIssues: SecurityIssue[];
    issues: SecurityIssue[];
    scannedAt?: Date;
    scannerVersion?: string;
    complianceMapping?: Record<string, number>;
    remediationApplied?: boolean;
    postRemediationIssues?: SecurityIssue[];
}

export interface SecurityIssue {
    id: string;
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    line: number;
    column?: number;
    file?: string;
    recommendation: string;
    cwe?: string;
    owasp?: string;
}

export interface ComplianceReport {
    compliant: boolean;
    score: number;
    standards: ComplianceStandard[];
    violations: ComplianceViolation[];
    warnings: ComplianceWarning[];
}

export interface ComplianceStandard {
    name: string;
    version: string;
    compliant: boolean;
    coverage: number;
    findings: number;
}

export interface ComplianceViolation {
    standard: string;
    rule: string;
    description: string;
    severity: 'critical' | 'high' | 'medium';
    location: string;
    remediation: string;
}

export interface ComplianceWarning {
    standard: string;
    description: string;
    recommendation: string;
}

export interface QualityMetrics {
    overallScore: number;
    complexity: number;
    maintainability: number;
    readability: number;
    testability: number;
    performance: number;
    security: number;
    suggestedCoverage: number;
    duplications: number;
    codeSmells: CodeSmell[];
    metrics: {
        loc: number;
        cyclomaticComplexity: number;
        cognitiveComplexity: number;
        technicalDebt: number;
    };
}

export interface CodeSmell {
    type: string;
    description: string;
    location: string;
    severity: 'high' | 'medium' | 'low';
    effort: string;
}

export interface EnterpriseProvider {
    name: string;
    generate(options: GenerateOptions): Promise<GenerateResult>;
}

export interface GenerateOptions {
    prompt: string;
    temperature: number;
    maxTokens: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string[];
}

export interface GenerateResult {
    code: string;
    usage: {
        totalTokens: number;
        promptTokens?: number;
        completionTokens?: number;
    };
    confidence?: number;
}

// UI Component Props
export interface AISuggestion {
    id: string;
    code: string;
    providers: string[];
    quality: QualityMetrics;
    confidence: number;
    explanation?: string;
}

export interface EditorTheme {
    name: string;
    base: 'vs' | 'vs-dark' | 'hc-black';
    inherit: boolean;
    rules: any[];
    colors: Record<string, string>;
}