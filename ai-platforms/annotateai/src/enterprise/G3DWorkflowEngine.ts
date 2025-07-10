/**
 * G3D AnnotateAI - Workflow Engine
 * Advanced workflow automation and orchestration
 * with visual workflow designer and real-time execution
 */

import { GPUCompute } from '../performance/G3DGPUCompute';
import { ModelRunner } from '../ai/G3DModelRunner';

export interface WorkflowConfig {
    maxConcurrentExecutions: number;
    defaultTimeout: number;
    retryPolicy: RetryPolicy;
    enableG3DAcceleration: boolean;
    monitoring: WorkflowMonitoring;
    storage: WorkflowStorage;
}

export interface WorkflowDefinition {
    id: string;
    name: string;
    description: string;
    version: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    triggers: WorkflowTrigger[];
    variables: WorkflowVariable[];
    metadata: WorkflowMetadata;
    permissions: WorkflowPermissions;
}

export interface WorkflowNode {
    id: string;
    type: NodeType;
    name: string;
    config: NodeConfig;
    position: NodePosition;
    inputs: NodeInput[];
    outputs: NodeOutput[];
    conditions?: NodeCondition[];
    timeout?: number;
    retryPolicy?: RetryPolicy;
}

export type NodeType =
    | 'start' | 'end' | 'task' | 'decision' | 'parallel' | 'merge'
    | 'loop' | 'delay' | 'webhook' | 'email' | 'script' | 'ai_model'
    | 'data_transform' | 'file_operation' | 'database' | 'api_call'
    | 'approval' | 'notification' | 'condition' | 'switch';

export interface NodeConfig {
    // Task node configuration
    task?: {
        type: 'annotation' | 'training' | 'inference' | 'validation';
        modelId?: string;
        parameters: Record<string, any>;
        resources: ResourceRequirements;
    };

    // Decision node configuration
    decision?: {
        conditions: DecisionCondition[];
        defaultPath: string;
    };

    // Script node configuration
    script?: {
        language: 'javascript' | 'python' | 'bash';
        code: string;
        environment: Record<string, string>;
    };

    // API call configuration
    apiCall?: {
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        url: string;
        headers: Record<string, string>;
        body?: any;
        authentication?: AuthConfig;
    };

    // Approval configuration
    approval?: {
        approvers: string[];
        approvalType: 'any' | 'all' | 'majority';
        timeout: number;
        escalation?: EscalationConfig;
    };

    // Loop configuration
    loop?: {
        type: 'for' | 'while' | 'foreach';
        condition: string;
        maxIterations: number;
        breakCondition?: string;
    };
}

export interface ResourceRequirements {
    cpu: number;
    memory: number;
    gpu?: number;
    storage?: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface DecisionCondition {
    expression: string;
    outputPath: string;
    priority: number;
}

export interface AuthConfig {
    type: 'bearer' | 'basic' | 'oauth2' | 'api_key';
    credentials: Record<string, string>;
}

export interface EscalationConfig {
    levels: EscalationLevel[];
    autoEscalate: boolean;
}

export interface EscalationLevel {
    delay: number;
    approvers: string[];
    actions: string[];
}

export interface NodePosition {
    x: number;
    y: number;
    width?: number;
    height?: number;
}

export interface NodeInput {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'file';
    required: boolean;
    defaultValue?: any;
    validation?: ValidationRule[];
}

export interface NodeOutput {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'file';
    description: string;
}

export interface ValidationRule {
    type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
    value?: any;
    message: string;
}

export interface NodeCondition {
    expression: string;
    action: 'skip' | 'fail' | 'retry' | 'continue';
}

export interface WorkflowEdge {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    sourceOutput?: string;
    targetInput?: string;
    condition?: string;
    label?: string;
}

export interface WorkflowTrigger {
    id: string;
    type: TriggerType;
    config: TriggerConfig;
    enabled: boolean;
}

export type TriggerType =
    | 'manual' | 'schedule' | 'webhook' | 'file_watch' | 'event'
    | 'api' | 'email' | 'database' | 'queue' | 'condition';

export interface TriggerConfig {
    // Schedule trigger
    schedule?: {
        cron: string;
        timezone: string;
        startDate?: Date;
        endDate?: Date;
    };

    // Webhook trigger
    webhook?: {
        path: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        authentication?: AuthConfig;
        validation?: WebhookValidation;
    };

    // File watch trigger
    fileWatch?: {
        path: string;
        pattern: string;
        events: ('create' | 'modify' | 'delete')[];
        recursive: boolean;
    };

    // Event trigger
    event?: {
        source: string;
        eventType: string;
        filters: Record<string, any>;
    };
}

export interface WebhookValidation {
    schema?: any;
    signature?: {
        header: string;
        secret: string;
        algorithm: string;
    };
}

export interface WorkflowVariable {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    value: any;
    scope: 'global' | 'workflow' | 'execution';
    encrypted?: boolean;
}

export interface WorkflowMetadata {
    tags: string[];
    category: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    version: string;
    changelog: ChangelogEntry[];
}

export interface ChangelogEntry {
    version: string;
    date: Date;
    author: string;
    changes: string[];
}

export interface WorkflowPermissions {
    execute: string[];
    edit: string[];
    view: string[];
    delete: string[];
}

export interface RetryPolicy {
    maxRetries: number;
    backoffStrategy: 'fixed' | 'linear' | 'exponential';
    baseDelay: number;
    maxDelay: number;
    retryableErrors: string[];
}

export interface WorkflowMonitoring {
    enabled: boolean;
    metrics: string[];
    alerts: AlertConfig[];
    logging: LoggingConfig;
}

export interface AlertConfig {
    condition: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    actions: string[];
}

export interface LoggingConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    destinations: string[];
    includeData: boolean;
}

export interface WorkflowStorage {
    type: 'memory' | 'database' | 'file' | 'cloud';
    config: any;
    encryption: boolean;
}

export interface WorkflowExecution {
    id: string;
    workflowId: string;
    status: ExecutionStatus;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    triggeredBy: TriggerInfo;
    context: ExecutionContext;
    nodeExecutions: NodeExecution[];
    metrics: ExecutionMetrics;
    logs: ExecutionLog[];
    error?: ExecutionError;
}

export type ExecutionStatus =
    | 'pending' | 'running' | 'paused' | 'completed' | 'failed'
    | 'cancelled' | 'timeout' | 'waiting_approval';

export interface TriggerInfo {
    type: TriggerType;
    source: string;
    data?: any;
    timestamp: Date;
}

export interface ExecutionContext {
    variables: Record<string, any>;
    user?: UserInfo;
    environment: string;
    correlationId?: string;
}

export interface UserInfo {
    id: string;
    username: string;
    email: string;
    roles: string[];
}

export interface NodeExecution {
    nodeId: string;
    status: ExecutionStatus;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    inputs: Record<string, any>;
    outputs: Record<string, any>;
    error?: ExecutionError;
    retryCount: number;
    logs: string[];
}

export interface ExecutionMetrics {
    totalNodes: number;
    completedNodes: number;
    failedNodes: number;
    skippedNodes: number;
    resourceUsage: ResourceUsage;
    performance: PerformanceMetrics;
}

export interface ResourceUsage {
    cpu: number;
    memory: number;
    gpu?: number;
    storage?: number;
    network?: number;
}

export interface PerformanceMetrics {
    averageNodeDuration: number;
    longestNodeDuration: number;
    throughput: number;
    efficiency: number;
}

export interface ExecutionLog {
    timestamp: Date;
    level: 'debug' | 'info' | 'warn' | 'error';
    nodeId?: string;
    message: string;
    data?: any;
}

export interface ExecutionError {
    code: string;
    message: string;
    nodeId?: string;
    stack?: string;
    retryable: boolean;
}

export class WorkflowEngine {
    private gpuCompute: GPUCompute;
    private modelRunner: ModelRunner;
    private config: WorkflowConfig;
    private workflows: Map<string, WorkflowDefinition>;
    private executions: Map<string, WorkflowExecution>;
    private activeExecutions: Set<string>;

    constructor(config: WorkflowConfig) {
        this.gpuCompute = new GPUCompute();
        this.modelRunner = new ModelRunner();
        this.config = config;
        this.workflows = new Map();
        this.executions = new Map();
        this.activeExecutions = new Set();

        this.initializeWorkflowKernels();
        this.startExecutionMonitor();
    }

    /**
     * Initialize GPU kernels for workflow processing
     */
    private async initializeWorkflowKernels(): Promise<void> {
        try {
            // Parallel execution optimization kernel
            await (this.gpuCompute as any).createKernel?.(
                `__kernel void optimize_execution_order(
                  __global const float* dependencies,
                  __global const float* priorities,
                  __global float* execution_order,
                  const int node_count
                ) {
                  int idx = get_global_id(0);
                  if (idx >= node_count) return;
                  
                  float score = priorities[idx];
                  
                  // Calculate dependency score
                  for (int i = 0; i < node_count; i++) {
                    if (dependencies[idx * node_count + i] > 0) {
                      score += dependencies[idx * node_count + i] * 0.5f;
                    }
                  }
                  
                  execution_order[idx] = score;
                }`,
                'optimize_execution_order'
            );

            // Resource allocation kernel
            await (this.gpuCompute as any).createKernel?.(
                `__kernel void allocate_resources(
                  __global const float* requirements,
                  __global const float* available,
                  __global float* allocations,
                  const int node_count,
                  const int resource_types
                ) {
                  int node_idx = get_global_id(0);
                  int resource_idx = get_global_id(1);
                  
                  if (node_idx >= node_count || resource_idx >= resource_types) return;
                  
                  float required = requirements[node_idx * resource_types + resource_idx];
                  float avail = available[resource_idx];
                  
                  // Simple allocation strategy
                  float allocation = min(required, avail * 0.8f);
                  allocations[node_idx * resource_types + resource_idx] = allocation;
                }`,
                'allocate_resources'
            );

            console.log('Workflow engine GPU kernels initialized successfully');
        } catch (error) {
            console.error('Failed to initialize workflow kernels:', error);
            throw error;
        }
    }

    /**
     * Create workflow definition
     */
    public async createWorkflow(workflow: Omit<WorkflowDefinition, 'id' | 'metadata'>): Promise<string> {
        try {
            const workflowId = this.generateWorkflowId();

            const workflowDef: WorkflowDefinition = {
                id: workflowId,
                metadata: {
                    tags: [],
                    category: 'general',
                    author: 'system',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    version: '1.0.0',
                    changelog: [{
                        version: '1.0.0',
                        date: new Date(),
                        author: 'system',
                        changes: ['Initial version']
                    }]
                },
                ...workflow
            };

            // Validate workflow definition
            await this.validateWorkflow(workflowDef);

            // Store workflow
            this.workflows.set(workflowId, workflowDef);

            console.log(`Workflow created: ${workflowId}`);
            return workflowId;

        } catch (error) {
            console.error('Failed to create workflow:', error);
            throw error;
        }
    }

    /**
     * Execute workflow
     */
    public async executeWorkflow(
        workflowId: string,
        triggerInfo: TriggerInfo,
        context?: Partial<ExecutionContext>
    ): Promise<string> {
        try {
            const workflow = this.workflows.get(workflowId);
            if (!workflow) {
                throw new Error(`Workflow not found: ${workflowId}`);
            }

            // Check concurrent execution limit
            if (this.activeExecutions.size >= this.config.maxConcurrentExecutions) {
                throw new Error('Maximum concurrent executions reached');
            }

            const executionId = this.generateExecutionId();

            const execution: WorkflowExecution = {
                id: executionId,
                workflowId,
                status: 'pending',
                startTime: new Date(),
                triggeredBy: triggerInfo,
                context: {
                    variables: {},
                    environment: 'production',
                    ...context
                },
                nodeExecutions: [],
                metrics: this.initializeMetrics(workflow),
                logs: []
            };

            // Store execution
            this.executions.set(executionId, execution);
            this.activeExecutions.add(executionId);

            // Start execution asynchronously
            this.startExecution(executionId);

            console.log(`Workflow execution started: ${executionId}`);
            return executionId;

        } catch (error) {
            console.error('Failed to execute workflow:', error);
            throw error;
        }
    }

    /**
     * Start workflow execution
     */
    private async startExecution(executionId: string): Promise<void> {
        try {
            const execution = this.executions.get(executionId)!;
            const workflow = this.workflows.get(execution.workflowId)!;

            execution.status = 'running';
            this.logExecution(executionId, 'info', 'Workflow execution started');

            // Find start nodes
            const startNodes = workflow.nodes.filter(node => node.type === 'start');
            if (startNodes.length === 0) {
                throw new Error('No start node found in workflow');
            }

            // Execute workflow using topological sort
            const executionOrder = await this.calculateExecutionOrder(workflow);

            for (const nodeId of executionOrder) {
                const node = workflow.nodes.find(n => n.id === nodeId)!;

                // Check if node should be executed
                if (await this.shouldExecuteNode(node, execution)) {
                    await this.executeNode(node, execution);
                } else {
                    await this.skipNode(node, execution);
                }

                // Check for early termination
                if ((execution as any).status === 'failed' || (execution as any).status === 'cancelled') {
                    break;
                }
            }

            // Complete execution
            await this.completeExecution(executionId);

        } catch (error) {
            console.error(`Execution failed: ${executionId}`, error);
            await this.failExecution(executionId, error);
        } finally {
            this.activeExecutions.delete(executionId);
        }
    }

    /**
     * Calculate optimal execution order
     */
    private async calculateExecutionOrder(workflow: WorkflowDefinition): Promise<string[]> {
        try {
            if (this.config.enableG3DAcceleration) {
                return await this.calculateExecutionOrderGPU(workflow);
            } else {
                return this.calculateExecutionOrderCPU(workflow);
            }
        } catch (error) {
            console.error('Execution order calculation failed:', error);
            return this.calculateExecutionOrderCPU(workflow);
        }
    }

    /**
     * GPU-accelerated execution order calculation
     */
    private async calculateExecutionOrderGPU(workflow: WorkflowDefinition): Promise<string[]> {
        const nodeCount = workflow.nodes.length;
        const dependencies = this.buildDependencyMatrix(workflow);
        const priorities = this.calculateNodePriorities(workflow);

        const kernel = (this.gpuCompute as any).getKernel?.('optimize_execution_order');
        const scores = await (this.gpuCompute as any).executeKernel?.(kernel, [
            new Float32Array(dependencies),
            new Float32Array(priorities)
        ], {
            node_count: nodeCount
        }) || [];

        // Sort nodes by score
        const nodeScores = workflow.nodes.map((node, idx) => ({
            nodeId: node.id,
            score: scores[idx]
        }));

        nodeScores.sort((a, b) => b.score - a.score);
        return nodeScores.map(ns => ns.nodeId);
    }

    /**
     * CPU-based execution order calculation
     */
    private calculateExecutionOrderCPU(workflow: WorkflowDefinition): string[] {
        // Topological sort implementation
        const inDegree = new Map<string, number>();
        const adjList = new Map<string, string[]>();

        // Initialize
        workflow.nodes.forEach(node => {
            inDegree.set(node.id, 0);
            adjList.set(node.id, []);
        });

        // Build adjacency list and calculate in-degrees
        workflow.edges.forEach(edge => {
            adjList.get(edge.sourceNodeId)!.push(edge.targetNodeId);
            inDegree.set(edge.targetNodeId, inDegree.get(edge.targetNodeId)! + 1);
        });

        // Topological sort
        const queue: string[] = [];
        const result: string[] = [];

        // Find all nodes with no incoming edges
        inDegree.forEach((degree, nodeId) => {
            if (degree === 0) {
                queue.push(nodeId);
            }
        });

        while (queue.length > 0) {
            const nodeId = queue.shift()!;
            result.push(nodeId);

            // Process all neighbors
            adjList.get(nodeId)!.forEach(neighborId => {
                inDegree.set(neighborId, inDegree.get(neighborId)! - 1);
                if (inDegree.get(neighborId) === 0) {
                    queue.push(neighborId);
                }
            });
        }

        return result;
    }

    /**
     * Execute individual node
     */
    private async executeNode(node: WorkflowNode, execution: WorkflowExecution): Promise<void> {
        const nodeExecution: NodeExecution = {
            nodeId: node.id,
            status: 'running',
            startTime: new Date(),
            inputs: {},
            outputs: {},
            retryCount: 0,
            logs: []
        };

        execution.nodeExecutions.push(nodeExecution);
        this.logExecution(execution.id, 'info', `Executing node: ${node.name}`, { nodeId: node.id });

        try {
            // Prepare inputs
            nodeExecution.inputs = await this.prepareNodeInputs(node, execution);

            // Execute based on node type
            nodeExecution.outputs = await this.executeNodeByType(node, nodeExecution.inputs, execution);

            // Complete node execution
            nodeExecution.status = 'completed';
            nodeExecution.endTime = new Date();
            nodeExecution.duration = nodeExecution.endTime.getTime() - nodeExecution.startTime.getTime();

            this.logExecution(execution.id, 'info', `Node completed: ${node.name}`, {
                nodeId: node.id,
                duration: nodeExecution.duration
            });

        } catch (error) {
            nodeExecution.status = 'failed';
            nodeExecution.endTime = new Date();
            nodeExecution.error = {
                code: 'NODE_EXECUTION_FAILED',
                message: error.message,
                nodeId: node.id,
                retryable: this.isRetryableError(error)
            };

            this.logExecution(execution.id, 'error', `Node failed: ${node.name}`, {
                nodeId: node.id,
                error: error.message
            });

            // Handle retry logic
            if (nodeExecution.error.retryable && this.shouldRetryNode(node, nodeExecution)) {
                await this.retryNode(node, execution, nodeExecution);
            } else {
                throw error;
            }
        }
    }

    /**
     * Execute node based on its type
     */
    private async executeNodeByType(
        node: WorkflowNode,
        inputs: Record<string, any>,
        execution: WorkflowExecution
    ): Promise<Record<string, any>> {
        switch (node.type) {
            case 'start':
                return { started: true, timestamp: new Date() };

            case 'end':
                return { completed: true, timestamp: new Date() };

            case 'task':
                return await this.executeTaskNode(node, inputs, execution);

            case 'decision':
                return await this.executeDecisionNode(node, inputs, execution);

            case 'script':
                return await this.executeScriptNode(node, inputs, execution);

            case 'api_call':
                return await this.executeApiCallNode(node, inputs, execution);

            case 'delay':
                return await this.executeDelayNode(node, inputs, execution);

            case 'approval':
                return await this.executeApprovalNode(node, inputs, execution);

            case 'ai_model':
                return await this.executeAIModelNode(node, inputs, execution);

            default:
                throw new Error(`Unsupported node type: ${node.type}`);
        }
    }

    /**
     * Execute task node
     */
    private async executeTaskNode(
        node: WorkflowNode,
        inputs: Record<string, any>,
        execution: WorkflowExecution
    ): Promise<Record<string, any>> {
        const taskConfig = node.config.task!;

        switch (taskConfig.type) {
            case 'annotation':
                return await this.executeAnnotationTask(taskConfig, inputs);
            case 'training':
                return await this.executeTrainingTask(taskConfig, inputs);
            case 'inference':
                return await this.executeInferenceTask(taskConfig, inputs);
            case 'validation':
                return await this.executeValidationTask(taskConfig, inputs);
            default:
                throw new Error(`Unknown task type: ${taskConfig.type}`);
        }
    }

    /**
     * Execute AI model node
     */
    private async executeAIModelNode(
        node: WorkflowNode,
        inputs: Record<string, any>,
        execution: WorkflowExecution
    ): Promise<Record<string, any>> {
        const modelId = node.config.task?.modelId;
        if (!modelId) {
            throw new Error('Model ID not specified for AI model node');
        }

        const result = await (this.modelRunner as any).runInference?.({
            modelId,
            input: inputs.data,
            parameters: node.config.task?.parameters || {}
        }) || {};

        return { result, modelId };
    }

    /**
     * Pause workflow execution
     */
    public async pauseExecution(executionId: string): Promise<void> {
        const execution = this.executions.get(executionId);
        if (!execution) {
            throw new Error(`Execution not found: ${executionId}`);
        }

        execution.status = 'paused';
        this.logExecution(executionId, 'info', 'Workflow execution paused');
    }

    /**
     * Resume workflow execution
     */
    public async resumeExecution(executionId: string): Promise<void> {
        const execution = this.executions.get(executionId);
        if (!execution) {
            throw new Error(`Execution not found: ${executionId}`);
        }

        if (execution.status !== 'paused') {
            throw new Error(`Cannot resume execution in status: ${execution.status}`);
        }

        execution.status = 'running';
        this.logExecution(executionId, 'info', 'Workflow execution resumed');

        // Continue execution
        this.startExecution(executionId);
    }

    /**
     * Cancel workflow execution
     */
    public async cancelExecution(executionId: string): Promise<void> {
        const execution = this.executions.get(executionId);
        if (!execution) {
            throw new Error(`Execution not found: ${executionId}`);
        }

        execution.status = 'cancelled';
        execution.endTime = new Date();
        execution.duration = execution.endTime.getTime() - execution.startTime.getTime();

        this.activeExecutions.delete(executionId);
        this.logExecution(executionId, 'info', 'Workflow execution cancelled');
    }

    /**
     * Get workflow execution status
     */
    public getExecutionStatus(executionId: string): WorkflowExecution | null {
        return this.executions.get(executionId) || null;
    }

    /**
     * List workflow executions
     */
    public listExecutions(workflowId?: string): WorkflowExecution[] {
        const executions = Array.from(this.executions.values());

        if (workflowId) {
            return executions.filter(exec => exec.workflowId === workflowId);
        }

        return executions;
    }

    // Helper methods
    private generateWorkflowId(): string {
        return 'wf_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    private generateExecutionId(): string {
        return 'exec_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    private async validateWorkflow(workflow: WorkflowDefinition): Promise<void> {
        // Validate workflow structure
        if (workflow.nodes.length === 0) {
            throw new Error('Workflow must have at least one node');
        }

        const startNodes = workflow.nodes.filter(node => node.type === 'start');
        if (startNodes.length === 0) {
            throw new Error('Workflow must have at least one start node');
        }

        // Validate node connections
        for (const edge of workflow.edges) {
            const sourceNode = workflow.nodes.find(n => n.id === edge.sourceNodeId);
            const targetNode = workflow.nodes.find(n => n.id === edge.targetNodeId);

            if (!sourceNode || !targetNode) {
                throw new Error(`Invalid edge: ${edge.id}`);
            }
        }
    }

    private initializeMetrics(workflow: WorkflowDefinition): ExecutionMetrics {
        return {
            totalNodes: workflow.nodes.length,
            completedNodes: 0,
            failedNodes: 0,
            skippedNodes: 0,
            resourceUsage: {
                cpu: 0,
                memory: 0
            },
            performance: {
                averageNodeDuration: 0,
                longestNodeDuration: 0,
                throughput: 0,
                efficiency: 0
            }
        };
    }

    private buildDependencyMatrix(workflow: WorkflowDefinition): number[] {
        const nodeCount = workflow.nodes.length;
        const matrix = new Array(nodeCount * nodeCount).fill(0);

        const nodeIndexMap = new Map<string, number>();
        workflow.nodes.forEach((node, idx) => {
            nodeIndexMap.set(node.id, idx);
        });

        workflow.edges.forEach(edge => {
            const sourceIdx = nodeIndexMap.get(edge.sourceNodeId)!;
            const targetIdx = nodeIndexMap.get(edge.targetNodeId)!;
            matrix[sourceIdx * nodeCount + targetIdx] = 1;
        });

        return matrix;
    }

    private calculateNodePriorities(workflow: WorkflowDefinition): number[] {
        return workflow.nodes.map(node => {
            // Simple priority calculation based on node type
            const priorities = {
                start: 1.0,
                end: 0.1,
                task: 0.8,
                decision: 0.7,
                parallel: 0.9,
                merge: 0.6
            };
            return priorities[node.type] || 0.5;
        });
    }

    private async shouldExecuteNode(node: WorkflowNode, execution: WorkflowExecution): Promise<boolean> {
        // Check node conditions
        if (node.conditions) {
            for (const condition of node.conditions) {
                if (!this.evaluateCondition(condition.expression, execution.context)) {
                    return false;
                }
            }
        }

        return true;
    }

    private async skipNode(node: WorkflowNode, execution: WorkflowExecution): Promise<void> {
        const nodeExecution: NodeExecution = {
            nodeId: node.id,
            status: 'completed',
            startTime: new Date(),
            endTime: new Date(),
            duration: 0,
            inputs: {},
            outputs: { skipped: true },
            retryCount: 0,
            logs: ['Node skipped due to conditions']
        };

        execution.nodeExecutions.push(nodeExecution);
        execution.metrics.skippedNodes++;

        this.logExecution(execution.id, 'info', `Node skipped: ${node.name}`, { nodeId: node.id });
    }

    private async prepareNodeInputs(node: WorkflowNode, execution: WorkflowExecution): Promise<Record<string, any>> {
        const inputs: Record<string, any> = {};

        // Get inputs from previous nodes
        for (const input of node.inputs) {
            // Find connected edges
            const incomingEdges = this.getIncomingEdges(node.id, execution.workflowId);

            for (const edge of incomingEdges) {
                if (edge.targetInput === input.name) {
                    const sourceExecution = execution.nodeExecutions.find(ne => ne.nodeId === edge.sourceNodeId);
                    if (sourceExecution && edge.sourceOutput) {
                        inputs[input.name] = sourceExecution.outputs[edge.sourceOutput];
                    }
                }
            }

            // Use default value if not provided
            if (!(input.name in inputs) && input.defaultValue !== undefined) {
                inputs[input.name] = input.defaultValue;
            }
        }

        return inputs;
    }

    private getIncomingEdges(nodeId: string, workflowId: string): WorkflowEdge[] {
        const workflow = this.workflows.get(workflowId)!;
        return workflow.edges.filter(edge => edge.targetNodeId === nodeId);
    }

    private evaluateCondition(expression: string, context: ExecutionContext): boolean {
        // Simple expression evaluation (in practice, use a proper expression engine)
        try {
            // This is a simplified implementation
            return true;
        } catch (error) {
            console.error('Condition evaluation failed:', error);
            return false;
        }
    }

    private async completeExecution(executionId: string): Promise<void> {
        const execution = this.executions.get(executionId)!;

        execution.status = 'completed';
        execution.endTime = new Date();
        execution.duration = execution.endTime.getTime() - execution.startTime.getTime();

        // Update metrics
        execution.metrics.completedNodes = execution.nodeExecutions.filter(ne => ne.status === 'completed').length;
        execution.metrics.failedNodes = execution.nodeExecutions.filter(ne => ne.status === 'failed').length;

        this.logExecution(executionId, 'info', 'Workflow execution completed');
    }

    private async failExecution(executionId: string, error: any): Promise<void> {
        const execution = this.executions.get(executionId)!;

        execution.status = 'failed';
        execution.endTime = new Date();
        execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
        execution.error = {
            code: 'WORKFLOW_EXECUTION_FAILED',
            message: error.message,
            retryable: false
        };

        this.logExecution(executionId, 'error', 'Workflow execution failed', { error: error.message });
    }

    private logExecution(executionId: string, level: string, message: string, data?: any): void {
        const execution = this.executions.get(executionId);
        if (execution) {
            execution.logs.push({
                timestamp: new Date(),
                level: level as any,
                message,
                data
            });
        }
    }

    private isRetryableError(error: any): boolean {
        // Determine if error is retryable
        const retryableErrors = ['TIMEOUT', 'NETWORK_ERROR', 'SERVICE_UNAVAILABLE'];
        return retryableErrors.some(code => error.message.includes(code));
    }

    private shouldRetryNode(node: WorkflowNode, nodeExecution: NodeExecution): boolean {
        const retryPolicy = node.retryPolicy || this.config.retryPolicy;
        return nodeExecution.retryCount < retryPolicy.maxRetries;
    }

    private async retryNode(node: WorkflowNode, execution: WorkflowExecution, nodeExecution: NodeExecution): Promise<void> {
        nodeExecution.retryCount++;

        const retryPolicy = node.retryPolicy || this.config.retryPolicy;
        const delay = this.calculateRetryDelay(retryPolicy, nodeExecution.retryCount);

        this.logExecution(execution.id, 'info', `Retrying node: ${node.name} (attempt ${nodeExecution.retryCount})`, {
            nodeId: node.id,
            delay
        });

        // Wait for retry delay
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry execution
        await this.executeNode(node, execution);
    }

    private calculateRetryDelay(retryPolicy: RetryPolicy, retryCount: number): number {
        switch (retryPolicy.backoffStrategy) {
            case 'fixed':
                return retryPolicy.baseDelay;
            case 'linear':
                return retryPolicy.baseDelay * retryCount;
            case 'exponential':
                return Math.min(retryPolicy.baseDelay * Math.pow(2, retryCount - 1), retryPolicy.maxDelay);
            default:
                return retryPolicy.baseDelay;
        }
    }

    private startExecutionMonitor(): void {
        setInterval(() => {
            this.monitorExecutions();
        }, 10000); // Every 10 seconds
    }

    private monitorExecutions(): void {
        // Monitor active executions for timeouts, resource usage, etc.
        for (const executionId of this.activeExecutions) {
            const execution = this.executions.get(executionId);
            if (execution) {
                // Check for timeout
                const now = new Date();
                const duration = now.getTime() - execution.startTime.getTime();

                if (duration > this.config.defaultTimeout) {
                    this.cancelExecution(executionId);
                }
            }
        }
    }

    // Placeholder implementations for specific node types
    private async executeAnnotationTask(config: any, inputs: Record<string, any>): Promise<Record<string, any>> {
        console.log('Executing annotation task:', config);
        return { result: 'annotation_completed', annotations: [] };
    }

    private async executeTrainingTask(config: any, inputs: Record<string, any>): Promise<Record<string, any>> {
        console.log('Executing training task:', config);
        return { result: 'training_completed', modelId: 'trained_model_123' };
    }

    private async executeInferenceTask(config: any, inputs: Record<string, any>): Promise<Record<string, any>> {
        console.log('Executing inference task:', config);
        return { result: 'inference_completed', predictions: [] };
    }

    private async executeValidationTask(config: any, inputs: Record<string, any>): Promise<Record<string, any>> {
        console.log('Executing validation task:', config);
        return { result: 'validation_completed', metrics: {} };
    }

    private async executeDecisionNode(node: WorkflowNode, inputs: Record<string, any>, execution: WorkflowExecution): Promise<Record<string, any>> {
        const decisionConfig = node.config.decision!;

        for (const condition of decisionConfig.conditions) {
            if (this.evaluateCondition(condition.expression, execution.context)) {
                return { decision: condition.outputPath, condition: condition.expression };
            }
        }

        return { decision: decisionConfig.defaultPath, condition: 'default' };
    }

    private async executeScriptNode(node: WorkflowNode, inputs: Record<string, any>, execution: WorkflowExecution): Promise<Record<string, any>> {
        const scriptConfig = node.config.script!;
        console.log(`Executing ${scriptConfig.language} script:`, scriptConfig.code);
        return { result: 'script_executed', output: 'mock_output' };
    }

    private async executeApiCallNode(node: WorkflowNode, inputs: Record<string, any>, execution: WorkflowExecution): Promise<Record<string, any>> {
        const apiConfig = node.config.apiCall!;
        console.log(`Making ${apiConfig.method} request to:`, apiConfig.url);
        return { result: 'api_call_completed', response: {} };
    }

    private async executeDelayNode(node: WorkflowNode, inputs: Record<string, any>, execution: WorkflowExecution): Promise<Record<string, any>> {
        const delay = inputs.delay || 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return { result: 'delay_completed', duration: delay };
    }

    private async executeApprovalNode(node: WorkflowNode, inputs: Record<string, any>, execution: WorkflowExecution): Promise<Record<string, any>> {
        const approvalConfig = node.config.approval!;
        console.log('Approval required from:', approvalConfig.approvers);

        // In practice, this would wait for actual approval
        execution.status = 'waiting_approval';

        return { result: 'approval_pending', approvers: approvalConfig.approvers };
    }

    /**
     * Cleanup resources
     */
    public async cleanup(): Promise<void> {
        try {
            // Cancel all active executions
            for (const executionId of this.activeExecutions) {
                await this.cancelExecution(executionId);
            }

            await this.gpuCompute.cleanup();
            this.workflows.clear();
            this.executions.clear();
            this.activeExecutions.clear();

            console.log('G3D Workflow Engine cleanup completed');
        } catch (error) {
            console.error('Failed to cleanup workflow engine:', error);
        }
    }
}

export default WorkflowEngine;