/**
 * G3D CodeForge - Code Generation TypeScript Definitions
 */

// Core Code Project Types
export interface CodeProject {
    id: string;
    name: string;
    description: string;
    language: ProgrammingLanguage;
    framework?: string;
    files: CodeFile[];
    dependencies: Dependency[];
    createdAt: Date;
    updatedAt: Date;
    owner: string;
    isPublic: boolean;
    tags: string[];
}

export interface CodeFile {
    id: string;
    name: string;
    path: string;
    content: string;
    language: ProgrammingLanguage;
    size: number;
    lastModified: Date;
    isGenerated: boolean;
    generationMetadata?: {
        modelUsed: string;
        prompt: string;
        confidence: number;
        timestamp: Date;
    };
}

export type ProgrammingLanguage =
    | 'javascript'
    | 'typescript'
    | 'python'
    | 'java'
    | 'cpp'
    | 'csharp'
    | 'go'
    | 'rust'
    | 'php'
    | 'ruby'
    | 'swift'
    | 'kotlin'
    | 'scala'
    | 'html'
    | 'css'
    | 'sql'
    | 'shell'
    | 'yaml'
    | 'json'
    | 'markdown';

export interface Dependency {
    name: string;
    version: string;
    type: 'runtime' | 'development' | 'peer';
    description?: string;
}

// Code Generation Types
export interface CodeGenerationRequest {
    id: string;
    prompt: string;
    language: ProgrammingLanguage;
    framework?: string;
    context?: CodeContext;
    requirements: string[];
    constraints: CodeConstraints;
    userId: string;
    timestamp: Date;
    priority: 'low' | 'medium' | 'high';
}

export interface CodeContext {
    existingFiles: CodeFile[];
    projectStructure: string;
    dependencies: Dependency[];
    codeStyle: CodeStylePreferences;
    businessLogic?: string;
}

export interface CodeConstraints {
    maxLines: number;
    maxComplexity: number;
    requireTests: boolean;
    requireDocumentation: boolean;
    securityLevel: 'standard' | 'high' | 'enterprise';
    performanceRequirements?: PerformanceRequirements;
}

export interface PerformanceRequirements {
    maxExecutionTime: number; // milliseconds
    maxMemoryUsage: number; // MB
    targetThroughput?: number; // requests per second
}

export interface CodeStylePreferences {
    indentation: 'tabs' | 'spaces';
    indentSize: number;
    lineLength: number;
    namingConvention: 'camelCase' | 'snake_case' | 'PascalCase' | 'kebab-case';
    bracketStyle: 'same-line' | 'new-line';
    semicolons: boolean;
    quotes: 'single' | 'double';
}

// AI Model Types
export interface AIModel {
    id: string;
    name: string;
    provider: 'openai' | 'anthropic' | 'cohere' | 'huggingface' | 'local';
    version: string;
    capabilities: ModelCapability[];
    supportedLanguages: ProgrammingLanguage[];
    maxTokens: number;
    costPerToken: number;
    averageResponseTime: number; // milliseconds
    accuracy: number; // percentage
    isActive: boolean;
    lastUpdated: Date;
}

export type ModelCapability =
    | 'code-generation'
    | 'code-review'
    | 'bug-fixing'
    | 'optimization'
    | 'documentation'
    | 'testing'
    | 'refactoring'
    | 'security-analysis';

// Code Review Types
export interface CodeReviewResult {
    id: string;
    fileId: string;
    modelUsed: string;
    issues: CodeIssue[];
    suggestions: CodeSuggestion[];
    overallScore: number;
    metrics: CodeMetrics;
    timestamp: Date;
    reviewTime: number; // milliseconds
}

export interface CodeIssue {
    id: string;
    type: IssueType;
    severity: 'info' | 'warning' | 'error' | 'critical';
    line: number;
    column?: number;
    message: string;
    description: string;
    suggestedFix?: string;
    ruleId?: string;
    category: IssueCategory;
}

export type IssueType =
    | 'syntax-error'
    | 'logic-error'
    | 'security-vulnerability'
    | 'performance-issue'
    | 'code-smell'
    | 'style-violation'
    | 'best-practice'
    | 'accessibility'
    | 'maintainability';

export type IssueCategory =
    | 'bugs'
    | 'security'
    | 'performance'
    | 'maintainability'
    | 'reliability'
    | 'style'
    | 'documentation';

export interface CodeSuggestion {
    id: string;
    type: 'improvement' | 'optimization' | 'refactoring' | 'alternative';
    title: string;
    description: string;
    originalCode: string;
    suggestedCode: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    effort: 'minimal' | 'moderate' | 'significant';
    benefits: string[];
    line?: number;
    column?: number;
}

// Code Metrics Types
export interface CodeMetrics {
    linesOfCode: number;
    cyclomaticComplexity: number;
    maintainabilityIndex: number;
    technicalDebt: number; // hours
    testCoverage: number; // percentage
    duplicateCodePercentage: number;
    securityScore: number;
    performanceScore: number;
    documentationCoverage: number;
    codeSmells: number;
    bugProbability: number;
}

// Security Scan Types
export interface SecurityScan {
    id: string;
    fileId: string;
    vulnerabilities: SecurityVulnerability[];
    riskScore: number;
    scanTime: Date;
    scanDuration: number; // milliseconds
    toolsUsed: string[];
}

export interface SecurityVulnerability {
    id: string;
    type: VulnerabilityType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    location: {
        file: string;
        line: number;
        column?: number;
    };
    cwe?: string; // Common Weakness Enumeration
    cvss?: number; // Common Vulnerability Scoring System
    remediation: string;
    references: string[];
}

export type VulnerabilityType =
    | 'injection'
    | 'broken-authentication'
    | 'sensitive-data-exposure'
    | 'xml-external-entities'
    | 'broken-access-control'
    | 'security-misconfiguration'
    | 'cross-site-scripting'
    | 'insecure-deserialization'
    | 'vulnerable-components'
    | 'insufficient-logging';

// Test Generation Types
export interface TestGenerationResult {
    id: string;
    sourceFileId: string;
    testFiles: TestFile[];
    coverage: TestCoverage;
    generationTime: number; // milliseconds
    modelUsed: string;
    timestamp: Date;
}

export interface TestFile {
    id: string;
    name: string;
    content: string;
    framework: TestFramework;
    testCases: TestCase[];
    setupCode?: string;
    teardownCode?: string;
}

export type TestFramework =
    | 'jest'
    | 'mocha'
    | 'jasmine'
    | 'vitest'
    | 'pytest'
    | 'unittest'
    | 'junit'
    | 'testng'
    | 'gtest'
    | 'catch2'
    | 'go-test'
    | 'cargo-test';

export interface TestCase {
    id: string;
    name: string;
    description: string;
    type: 'unit' | 'integration' | 'functional' | 'performance' | 'security';
    expectedResult: string;
    mockData?: any;
    assertions: string[];
}

export interface TestCoverage {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
    overall: number;
}

// API Response Types
export interface CodeGenerationResponse {
    success: boolean;
    data?: {
        generatedCode: string;
        explanation: string;
        suggestions: CodeSuggestion[];
        metrics: CodeMetrics;
        tests?: TestFile[];
    };
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    metadata: {
        modelUsed: string;
        processingTime: number;
        tokensUsed: number;
        cost: number;
    };
}

// Event Types
export interface CodeForgeEvent {
    type: 'generation_started' | 'generation_completed' | 'review_completed' | 'test_generated';
    projectId: string;
    fileId?: string;
    timestamp: Date;
    data?: any;
}

// Configuration Types
export interface CodeForgeConfig {
    defaultModel: string;
    autoReview: boolean;
    autoTest: boolean;
    securityScanLevel: 'basic' | 'standard' | 'comprehensive';
    maxFileSize: number;
    supportedLanguages: ProgrammingLanguage[];
    rateLimits: {
        requestsPerMinute: number;
        tokensPerHour: number;
    };
}

// User Preferences
export interface UserPreferences {
    userId: string;
    preferredModels: string[];
    codeStyle: CodeStylePreferences;
    autoSave: boolean;
    keyboardShortcuts: Record<string, string>;
    theme: 'dark' | 'light' | 'auto';
    notifications: NotificationSettings;
}

export interface NotificationSettings {
    email: boolean;
    inApp: boolean;
    desktop: boolean;
    types: {
        generationComplete: boolean;
        reviewComplete: boolean;
        securityAlert: boolean;
        quotaWarning: boolean;
    };
}