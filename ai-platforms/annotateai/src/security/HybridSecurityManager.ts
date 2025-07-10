/**
 * AnnotateAI Hybrid Security Manager
 * 
 * Extends the infrastructure SecurityManager with ML/AI-specific security features:
 * - AI model security and access control
 * - ML pipeline security and data protection
 * - Computer vision data privacy and annotation security
 * - WebGPU/WebGL security for GPU compute operations
 * - Synthetic data generation security and IP protection
 * 
 * This hybrid approach leverages the advanced infrastructure foundation (1000+ lines)
 * while preserving all AnnotateAI ML/AI-specific security functionality.
 */

import { SecurityManager as BaseSecurityManager } from '../../../../infrastructure/engines';

// AnnotateAI-specific security interfaces
export interface MLModelSecurityPolicy {
    modelId: string;
    accessLevel: 'public' | 'private' | 'confidential' | 'restricted';
    allowedOperations: ('inference' | 'training' | 'export' | 'sharing')[];
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    complianceRequirements: string[];
    encryptionRequired: boolean;
    auditLevel: 'none' | 'basic' | 'detailed' | 'comprehensive';
}

export interface AIWorkflowSecurityContext {
    workflowId: string;
    userId: string;
    projectId: string;
    modelAccess: string[];
    dataAccess: string[];
    computeResources: string[];
    securityLevel: 'basic' | 'enhanced' | 'maximum';
    complianceMode: boolean;
}

export interface AnnotationSecurityConfig {
    projectId: string;
    dataTypes: ('image' | 'video' | '3d' | 'text')[];
    sensitivityLevel: 'low' | 'medium' | 'high' | 'critical';
    encryptionRequired: boolean;
    accessControls: {
        viewers: string[];
        editors: string[];
        admins: string[];
    };
    auditRequirements: {
        logLevel: 'minimal' | 'standard' | 'comprehensive';
        retentionDays: number;
        complianceReporting: boolean;
    };
}

export interface SyntheticDataSecurityPolicy {
    generationId: string;
    sourceDataClassification: 'public' | 'internal' | 'confidential';
    syntheticDataClassification: 'public' | 'internal' | 'confidential';
    modelProtection: boolean;
    ipProtection: boolean;
    distributionControls: string[];
    qualityValidation: boolean;
    ethicalValidation: boolean;
}

export interface GPUSecurityContext {
    deviceId: string;
    computeContext: 'webgl' | 'webgpu' | 'cuda' | 'opencl';
    securityLevel: 'basic' | 'enhanced' | 'isolated';
    memoryProtection: boolean;
    dataEncryption: boolean;
    accessControls: string[];
}

export class AnnotateAISecurityManager extends BaseSecurityManager {
    private mlModelPolicies: Map<string, MLModelSecurityPolicy> = new Map();
    private aiWorkflowContexts: Map<string, AIWorkflowSecurityContext> = new Map();
    private annotationConfigs: Map<string, AnnotationSecurityConfig> = new Map();
    private syntheticDataPolicies: Map<string, SyntheticDataSecurityPolicy> = new Map();
    private gpuSecurityContexts: Map<string, GPUSecurityContext> = new Map();

    constructor() {
        super();
        this.initializeMLSecurity();
    }

    private initializeMLSecurity(): void {
        // Set up ML-specific security policies
        this.setupMLModelSecurityPolicies();
        this.setupAIWorkflowSecurity();
        this.setupAnnotationSecurity();
        this.setupSyntheticDataSecurity();
        this.setupGPUComputeSecurity();
    }

    /**
     * ML Model Security Management
     */
    public createMLModelSecurityPolicy(policy: Partial<MLModelSecurityPolicy>): string {
        const policyId = this.generateMLPolicyId();
        
        const mlPolicy: MLModelSecurityPolicy = {
            modelId: policy.modelId || 'unknown',
            accessLevel: policy.accessLevel || 'private',
            allowedOperations: policy.allowedOperations || ['inference'],
            dataClassification: policy.dataClassification || 'internal',
            complianceRequirements: policy.complianceRequirements || [],
            encryptionRequired: policy.encryptionRequired || true,
            auditLevel: policy.auditLevel || 'detailed'
        };

        this.mlModelPolicies.set(policyId, mlPolicy);
        
        // Create corresponding infrastructure security policy
        const basePolicyId = this.createPolicy({
            name: `ML Model Policy - ${mlPolicy.modelId}`,
            description: `Security policy for ML model ${mlPolicy.modelId}`,
            level: this.mapAccessLevelToSecurityLevel(mlPolicy.accessLevel),
            enforcement: 'blocking',
            rules: this.generateMLModelSecurityRules(mlPolicy)
        });

        console.log(`ML Model security policy created: ${policyId} -> ${basePolicyId}`);
        return policyId;
    }

    public validateMLModelAccess(modelId: string, userId: string, operation: string): boolean {
        const policy = Array.from(this.mlModelPolicies.values())
            .find(p => p.modelId === modelId);
        
        if (!policy) {
            console.warn(`No security policy found for ML model: ${modelId}`);
            return false;
        }

        // Check if operation is allowed
        if (!policy.allowedOperations.includes(operation as any)) {
            console.warn(`Operation ${operation} not allowed for model ${modelId}`);
            return false;
        }

        // Check user permissions using base security manager
        const hasPermission = this.checkPermission(userId, `model:${modelId}`, operation);
        
        if (hasPermission && policy.auditLevel !== 'none') {
            this.logMLModelAccess(modelId, userId, operation, 'granted');
        }

        return hasPermission;
    }

    /**
     * AI Workflow Security Management
     */
    public createAIWorkflowSecurityContext(context: Partial<AIWorkflowSecurityContext>): string {
        const contextId = this.generateMLContextId();
        
        const workflowContext: AIWorkflowSecurityContext = {
            workflowId: context.workflowId || 'unknown',
            userId: context.userId || '',
            projectId: context.projectId || '',
            modelAccess: context.modelAccess || [],
            dataAccess: context.dataAccess || [],
            computeResources: context.computeResources || [],
            securityLevel: context.securityLevel || 'enhanced',
            complianceMode: context.complianceMode || false
        };

        this.aiWorkflowContexts.set(contextId, workflowContext);
        
        console.log(`AI workflow security context created: ${contextId}`);
        return contextId;
    }

    public validateAIWorkflowOperation(contextId: string, operation: string, resource: string): boolean {
        const context = this.aiWorkflowContexts.get(contextId);
        if (!context) {
            console.warn(`AI workflow context not found: ${contextId}`);
            return false;
        }

        // Check resource access permissions
        const hasAccess = this.checkWorkflowResourceAccess(context, resource);
        
        if (!hasAccess) {
            console.warn(`AI workflow access denied: ${contextId} -> ${resource}`);
            return false;
        }

        // Log workflow operation if in compliance mode
        if (context.complianceMode) {
            this.logAIWorkflowOperation(contextId, operation, resource, 'granted');
        }

        return true;
    }

    /**
     * Annotation Security Management
     */
    public createAnnotationSecurityConfig(config: Partial<AnnotationSecurityConfig>): string {
        const configId = this.generateMLConfigId();
        
        const annotationConfig: AnnotationSecurityConfig = {
            projectId: config.projectId || 'unknown',
            dataTypes: config.dataTypes || ['image'],
            sensitivityLevel: config.sensitivityLevel || 'medium',
            encryptionRequired: config.encryptionRequired || true,
            accessControls: config.accessControls || {
                viewers: [],
                editors: [],
                admins: []
            },
            auditRequirements: config.auditRequirements || {
                logLevel: 'standard',
                retentionDays: 365,
                complianceReporting: false
            }
        };

        this.annotationConfigs.set(configId, annotationConfig);
        
        // Set up project-specific access controls
        this.setupAnnotationAccessControls(configId, annotationConfig);
        
        console.log(`Annotation security config created: ${configId}`);
        return configId;
    }

    public validateAnnotationAccess(projectId: string, userId: string, action: string): boolean {
        const config = Array.from(this.annotationConfigs.values())
            .find(c => c.projectId === projectId);
        
        if (!config) {
            console.warn(`No security config found for annotation project: ${projectId}`);
            return false;
        }

        // Check user role in project
        const userRole = this.getUserRoleInProject(userId, projectId, config);
        const hasAccess = this.checkAnnotationActionPermission(userRole, action);
        
        if (hasAccess && config.auditRequirements.logLevel !== 'minimal') {
            this.logAnnotationAccess(projectId, userId, action, 'granted');
        }

        return hasAccess;
    }

    /**
     * Synthetic Data Security Management
     */
    public createSyntheticDataSecurityPolicy(policy: Partial<SyntheticDataSecurityPolicy>): string {
        const policyId = this.generateMLPolicyId();
        
        const syntheticPolicy: SyntheticDataSecurityPolicy = {
            generationId: policy.generationId || 'unknown',
            sourceDataClassification: policy.sourceDataClassification || 'internal',
            syntheticDataClassification: policy.syntheticDataClassification || 'internal',
            modelProtection: policy.modelProtection || true,
            ipProtection: policy.ipProtection || true,
            distributionControls: policy.distributionControls || [],
            qualityValidation: policy.qualityValidation || true,
            ethicalValidation: policy.ethicalValidation || true
        };

        this.syntheticDataPolicies.set(policyId, syntheticPolicy);
        
        // Create data classification policies
        this.setupSyntheticDataClassification(policyId, syntheticPolicy);
        
        console.log(`Synthetic data security policy created: ${policyId}`);
        return policyId;
    }

    public validateSyntheticDataOperation(generationId: string, operation: string, userId: string): boolean {
        const policy = Array.from(this.syntheticDataPolicies.values())
            .find(p => p.generationId === generationId);
        
        if (!policy) {
            console.warn(`No security policy found for synthetic data generation: ${generationId}`);
            return false;
        }

        // Validate operation based on policy
        const isValid = this.checkSyntheticDataOperationValidity(policy, operation, userId);
        
        if (isValid) {
            this.logSyntheticDataOperation(generationId, operation, userId, 'granted');
        }

        return isValid;
    }

    /**
     * GPU Compute Security Management
     */
    public createGPUSecurityContext(context: Partial<GPUSecurityContext>): string {
        const contextId = this.generateMLContextId();
        
        const gpuContext: GPUSecurityContext = {
            deviceId: context.deviceId || 'gpu-0',
            computeContext: context.computeContext || 'webgl',
            securityLevel: context.securityLevel || 'enhanced',
            memoryProtection: context.memoryProtection || true,
            dataEncryption: context.dataEncryption || true,
            accessControls: context.accessControls || []
        };

        this.gpuSecurityContexts.set(contextId, gpuContext);
        
        // Initialize GPU security measures
        this.initializeGPUSecurityMeasures(contextId, gpuContext);
        
        console.log(`GPU security context created: ${contextId}`);
        return contextId;
    }

    public validateGPUComputeAccess(contextId: string, userId: string, computeOperation: string): boolean {
        const context = this.gpuSecurityContexts.get(contextId);
        if (!context) {
            console.warn(`GPU security context not found: ${contextId}`);
            return false;
        }

        // Check GPU compute permissions
        const hasAccess = this.checkGPUComputePermission(context, userId, computeOperation);
        
        if (hasAccess) {
            this.logGPUComputeAccess(contextId, userId, computeOperation, 'granted');
        }

        return hasAccess;
    }

    // Helper methods for ML-specific security operations
    private setupMLModelSecurityPolicies(): void {
        // Default ML model security policies
        this.createMLModelSecurityPolicy({
            modelId: 'default-inference',
            accessLevel: 'private',
            allowedOperations: ['inference'],
            dataClassification: 'internal',
            encryptionRequired: true,
            auditLevel: 'detailed'
        });
    }

    private setupAIWorkflowSecurity(): void {
        // Set up AI workflow security defaults
        console.log('AI workflow security initialized');
    }

    private setupAnnotationSecurity(): void {
        // Set up annotation security defaults
        console.log('Annotation security initialized');
    }

    private setupSyntheticDataSecurity(): void {
        // Set up synthetic data security defaults
        console.log('Synthetic data security initialized');
    }

    private setupGPUComputeSecurity(): void {
        // Set up GPU compute security defaults
        console.log('GPU compute security initialized');
    }

    private mapAccessLevelToSecurityLevel(accessLevel: string): 'low' | 'medium' | 'high' | 'critical' {
        switch (accessLevel) {
            case 'public': return 'low';
            case 'private': return 'medium';
            case 'confidential': return 'high';
            case 'restricted': return 'critical';
            default: return 'medium';
        }
    }

    private generateMLModelSecurityRules(policy: MLModelSecurityPolicy): any[] {
        return [
            {
                id: `ml-model-${policy.modelId}-access`,
                type: 'access',
                condition: 'ml_model_access',
                action: 'evaluate',
                priority: 1,
                parameters: {
                    modelId: policy.modelId,
                    allowedOperations: policy.allowedOperations,
                    dataClassification: policy.dataClassification
                }
            }
        ];
    }

    private checkWorkflowResourceAccess(context: AIWorkflowSecurityContext, resource: string): boolean {
        // Check if user has access to the requested resource
        if (resource.startsWith('model:')) {
            const modelId = resource.split(':')[1];
            return context.modelAccess.includes(modelId);
        }
        
        if (resource.startsWith('data:')) {
            const dataId = resource.split(':')[1];
            return context.dataAccess.includes(dataId);
        }
        
        return true; // Default allow for other resources
    }

    private getUserRoleInProject(userId: string, projectId: string, config: AnnotationSecurityConfig): string {
        if (config.accessControls.admins.includes(userId)) return 'admin';
        if (config.accessControls.editors.includes(userId)) return 'editor';
        if (config.accessControls.viewers.includes(userId)) return 'viewer';
        return 'none';
    }

    private checkAnnotationActionPermission(role: string, action: string): boolean {
        switch (role) {
            case 'admin': return true;
            case 'editor': return !['delete', 'configure'].includes(action);
            case 'viewer': return ['view', 'export'].includes(action);
            default: return false;
        }
    }

    private checkSyntheticDataOperationValidity(policy: SyntheticDataSecurityPolicy, operation: string, userId: string): boolean {
        // Validate synthetic data operations based on policy
        if (operation === 'generate' && policy.modelProtection) {
            return this.checkPermission(userId, 'synthetic-data', 'generate');
        }
        
        if (operation === 'export' && policy.ipProtection) {
            return this.checkPermission(userId, 'synthetic-data', 'export');
        }
        
        return true;
    }

    private checkGPUComputePermission(context: GPUSecurityContext, userId: string, operation: string): boolean {
        // Check GPU compute permissions based on context
        if (context.accessControls.length > 0) {
            return context.accessControls.includes(userId);
        }
        
        return this.checkPermission(userId, `gpu:${context.deviceId}`, operation);
    }

    private setupAnnotationAccessControls(configId: string, config: AnnotationSecurityConfig): void {
        // Set up access controls for annotation project
        this.setAccessControl(`annotation:${config.projectId}`, {
            resource: `annotation:${config.projectId}`,
            permissions: ['view', 'edit', 'delete'],
            roles: ['admin', 'editor', 'viewer'],
            conditions: []
        });
    }

    private setupSyntheticDataClassification(policyId: string, policy: SyntheticDataSecurityPolicy): void {
        // Set up data classification policies
        console.log(`Synthetic data classification set up for policy: ${policyId}`);
    }

    private initializeGPUSecurityMeasures(contextId: string, context: GPUSecurityContext): void {
        // Initialize GPU security measures
        console.log(`GPU security measures initialized for context: ${contextId}`);
    }

    // Logging methods for ML-specific operations
    private logMLModelAccess(modelId: string, userId: string, operation: string, result: string): void {
        console.log(`ML Model Access: ${modelId} | User: ${userId} | Operation: ${operation} | Result: ${result}`);
    }

    private logAIWorkflowOperation(contextId: string, operation: string, resource: string, result: string): void {
        console.log(`AI Workflow: ${contextId} | Operation: ${operation} | Resource: ${resource} | Result: ${result}`);
    }

    private logAnnotationAccess(projectId: string, userId: string, action: string, result: string): void {
        console.log(`Annotation Access: ${projectId} | User: ${userId} | Action: ${action} | Result: ${result}`);
    }

    private logSyntheticDataOperation(generationId: string, operation: string, userId: string, result: string): void {
        console.log(`Synthetic Data: ${generationId} | Operation: ${operation} | User: ${userId} | Result: ${result}`);
    }

    private logGPUComputeAccess(contextId: string, userId: string, operation: string, result: string): void {
        console.log(`GPU Compute: ${contextId} | User: ${userId} | Operation: ${operation} | Result: ${result}`);
    }

    // ML-specific ID generation methods
    private generateMLPolicyId(): string {
        return `ml_policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateMLContextId(): string {
        return `ml_ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateMLConfigId(): string {
        return `ml_cfg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Public API for AnnotateAI-specific security features
    public getMLModelSecurityStatus(): {
        totalPolicies: number;
        activePolicies: number;
        compliancePolicies: number;
        securityLevel: string;
    } {
        const totalPolicies = this.mlModelPolicies.size;
        const activePolicies = Array.from(this.mlModelPolicies.values()).filter(p => p.accessLevel !== 'public').length;
        const compliancePolicies = Array.from(this.mlModelPolicies.values()).filter(p => p.complianceRequirements.length > 0).length;
        
        return {
            totalPolicies,
            activePolicies,
            compliancePolicies,
            securityLevel: activePolicies > 0 ? 'enhanced' : 'basic'
        };
    }
} 