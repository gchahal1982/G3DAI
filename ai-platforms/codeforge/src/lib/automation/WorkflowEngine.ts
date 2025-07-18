import { EventEmitter } from 'events';
import { SwarmOrchestrator, SwarmTask, SwarmResult, TaskType } from '../swarm/SwarmOrchestrator';
import { GhostBranchManager, UserIntent, IntentType } from '../git/GhostBranch';

// Workflow definition types
export interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  variables: Record<string, any>;
  metadata: WorkflowMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowTrigger {
  type: TriggerType;
  conditions: TriggerCondition[];
  schedule?: Schedule;
  events?: string[];
  manual: boolean;
}

export enum TriggerType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  EVENT = 'event',
  FILE_CHANGE = 'file_change',
  PULL_REQUEST = 'pull_request',
  PUSH = 'push',
  ISSUE = 'issue',
  WEBHOOK = 'webhook'
}

export interface TriggerCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  optional: boolean;
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  REGEX_MATCH = 'regex_match',
  IN = 'in',
  NOT_IN = 'not_in'
}

export interface Schedule {
  cron: string;
  timezone: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  action: StepAction;
  inputs: Record<string, any>;
  outputs: Record<string, string>;
  conditions: StepCondition[];
  retry: RetryConfig;
  timeout: number;
  parallel: boolean;
  dependencies: string[];
  continueOnError: boolean;
}

export enum StepType {
  ACTION = 'action',
  CONDITION = 'condition',
  LOOP = 'loop',
  PARALLEL = 'parallel',
  SEQUENTIAL = 'sequential',
  AI_AGENT = 'ai_agent',
  GHOST_BRANCH = 'ghost_branch',
  SCRIPT = 'script',
  HTTP_REQUEST = 'http_request',
  FILE_OPERATION = 'file_operation',
  NOTIFICATION = 'notification',
  APPROVAL = 'approval'
}

export interface StepAction {
  type: string;
  config: Record<string, any>;
  script?: string;
  agentId?: string;
  endpoint?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface StepCondition {
  expression: string;
  onTrue?: string; // Next step ID
  onFalse?: string; // Next step ID
}

export interface RetryConfig {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  baseDelay: number;
  maxDelay: number;
  retryOnErrors: string[];
}

export interface WorkflowMetadata {
  author: string;
  tags: string[];
  category: string;
  public: boolean;
  documentation: string;
  examples: WorkflowExample[];
  usageCount: number;
  successRate: number;
  averageExecutionTime: number;
}

export interface WorkflowExample {
  title: string;
  description: string;
  trigger: any;
  expectedOutput: any;
}

// Execution types
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  trigger: ExecutionTrigger;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  stepExecutions: StepExecution[];
  variables: Record<string, any>;
  outputs: Record<string, any>;
  errors: ExecutionError[];
  metadata: ExecutionMetadata;
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
  WAITING_APPROVAL = 'waiting_approval'
}

export interface ExecutionTrigger {
  type: TriggerType;
  source: string;
  payload: any;
  timestamp: Date;
}

export interface StepExecution {
  stepId: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  error?: ExecutionError;
  retryCount: number;
  logs: ExecutionLog[];
}

export interface ExecutionError {
  stepId?: string;
  type: string;
  message: string;
  stack?: string;
  timestamp: Date;
  retryable: boolean;
}

export interface ExecutionLog {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface ExecutionMetadata {
  userId?: string;
  environment: string;
  version: string;
  context: Record<string, any>;
}

// Built-in action types
export interface ActionRegistry {
  [key: string]: ActionHandler;
}

export interface ActionHandler {
  name: string;
  description: string;
  inputs: ActionInput[];
  outputs: ActionOutput[];
  execute: (inputs: Record<string, any>, context: ExecutionContext) => Promise<Record<string, any>>;
}

export interface ActionInput {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: any;
  validation?: string;
}

export interface ActionOutput {
  name: string;
  type: string;
  description: string;
}

export interface ExecutionContext {
  execution: WorkflowExecution;
  workflow: Workflow;
  variables: Record<string, any>;
  logger: ExecutionLogger;
  swarm: SwarmOrchestrator;
  ghostBranch: GhostBranchManager;
}

export interface ExecutionLogger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
}

// Variable resolver for dynamic values
class VariableResolver {
  resolve(value: any, context: Record<string, any>): any {
    if (typeof value === 'string') {
      return this.resolveString(value, context);
    } else if (Array.isArray(value)) {
      return value.map(item => this.resolve(item, context));
    } else if (typeof value === 'object' && value !== null) {
      const resolved: Record<string, any> = {};
      for (const [key, val] of Object.entries(value)) {
        resolved[key] = this.resolve(val, context);
      }
      return resolved;
    }
    return value;
  }

  private resolveString(value: string, context: Record<string, any>): any {
    // Replace variables like ${variable.name} or ${steps.stepId.outputs.result}
    return value.replace(/\$\{([^}]+)\}/g, (match, path) => {
      return this.getNestedValue(context, path) || match;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}

// Condition evaluator
class ConditionEvaluator {
  evaluate(condition: TriggerCondition, context: Record<string, any>): boolean {
    const fieldValue = this.getFieldValue(condition.field, context);
    
    switch (condition.operator) {
      case ConditionOperator.EQUALS:
        return fieldValue === condition.value;
      case ConditionOperator.NOT_EQUALS:
        return fieldValue !== condition.value;
      case ConditionOperator.CONTAINS:
        return String(fieldValue).includes(String(condition.value));
      case ConditionOperator.NOT_CONTAINS:
        return !String(fieldValue).includes(String(condition.value));
      case ConditionOperator.STARTS_WITH:
        return String(fieldValue).startsWith(String(condition.value));
      case ConditionOperator.ENDS_WITH:
        return String(fieldValue).endsWith(String(condition.value));
      case ConditionOperator.GREATER_THAN:
        return Number(fieldValue) > Number(condition.value);
      case ConditionOperator.LESS_THAN:
        return Number(fieldValue) < Number(condition.value);
      case ConditionOperator.REGEX_MATCH:
        return new RegExp(condition.value).test(String(fieldValue));
      case ConditionOperator.IN:
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case ConditionOperator.NOT_IN:
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  private getFieldValue(field: string, context: Record<string, any>): any {
    return field.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, context);
  }

  evaluateExpression(expression: string, context: Record<string, any>): boolean {
    try {
      // Simple expression evaluator for conditions like "outputs.result === 'success'"
      const resolver = new VariableResolver();
      const resolvedExpression = resolver.resolve(expression, context);
      
      // For safety, only allow simple comparisons
      const safeExpression = this.sanitizeExpression(resolvedExpression);
      return Boolean(eval(safeExpression));
    } catch (error) {
      console.warn('Failed to evaluate expression:', expression, error);
      return false;
    }
  }

  private sanitizeExpression(expression: string): string {
    // Remove potentially dangerous operations
    const forbidden = ['require', 'import', 'eval', 'Function', 'setTimeout', 'setInterval'];
    
    for (const term of forbidden) {
      if (expression.includes(term)) {
        throw new Error(`Forbidden operation: ${term}`);
      }
    }

    return expression;
  }
}

// Execution engine
class ExecutionEngine {
  private variableResolver = new VariableResolver();
  private conditionEvaluator = new ConditionEvaluator();

  async executeWorkflow(
    workflow: Workflow, 
    trigger: ExecutionTrigger,
    actionRegistry: ActionRegistry,
    context: Omit<ExecutionContext, 'execution' | 'variables' | 'logger'>
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      workflowId: workflow.id,
      status: ExecutionStatus.RUNNING,
      trigger,
      startTime: new Date(),
      stepExecutions: [],
      variables: { ...workflow.variables, ...trigger.payload },
      outputs: {},
      errors: [],
      metadata: {
        environment: 'development',
        version: workflow.version,
        context: {}
      }
    };

    const executionContext: ExecutionContext = {
      ...context,
      execution,
      workflow,
      variables: execution.variables,
      logger: this.createLogger(execution)
    };

    try {
      // Execute steps
      await this.executeSteps(workflow.steps, executionContext, actionRegistry);
      
      execution.status = ExecutionStatus.COMPLETED;
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();

    } catch (error) {
      execution.status = ExecutionStatus.FAILED;
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      
      execution.errors.push({
        type: 'workflow_error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date(),
        retryable: false
      });
    }

    return execution;
  }

  private async executeSteps(
    steps: WorkflowStep[],
    context: ExecutionContext,
    actionRegistry: ActionRegistry
  ): Promise<void> {
    const executedSteps = new Set<string>();
    const stepQueue: WorkflowStep[] = [];

    // Find steps with no dependencies
    const addReadySteps = () => {
      for (const step of steps) {
        if (!executedSteps.has(step.id) && 
            !stepQueue.some(s => s.id === step.id) &&
            step.dependencies.every(dep => executedSteps.has(dep))) {
          stepQueue.push(step);
        }
      }
    };

    addReadySteps();

    while (stepQueue.length > 0 || executedSteps.size < steps.length) {
      if (stepQueue.length === 0) {
        throw new Error('Circular dependency or missing step detected');
      }

      // Group parallel steps
      const parallelSteps: WorkflowStep[] = [];
      const sequentialSteps: WorkflowStep[] = [];

      for (const step of stepQueue) {
        if (step.parallel) {
          parallelSteps.push(step);
        } else {
          sequentialSteps.push(step);
          break; // Only execute one sequential step at a time
        }
      }

      // Remove from queue
      parallelSteps.forEach(step => {
        const index = stepQueue.indexOf(step);
        if (index > -1) stepQueue.splice(index, 1);
      });
      sequentialSteps.forEach(step => {
        const index = stepQueue.indexOf(step);
        if (index > -1) stepQueue.splice(index, 1);
      });

      // Execute parallel steps
      if (parallelSteps.length > 0) {
        await Promise.all(
          parallelSteps.map(step => this.executeStep(step, context, actionRegistry))
        );
        parallelSteps.forEach(step => executedSteps.add(step.id));
      }

      // Execute sequential steps
      for (const step of sequentialSteps) {
        await this.executeStep(step, context, actionRegistry);
        executedSteps.add(step.id);
      }

      // Add newly ready steps
      addReadySteps();
    }
  }

  private async executeStep(
    step: WorkflowStep,
    context: ExecutionContext,
    actionRegistry: ActionRegistry
  ): Promise<void> {
    const stepExecution: StepExecution = {
      stepId: step.id,
      status: ExecutionStatus.RUNNING,
      startTime: new Date(),
      inputs: this.variableResolver.resolve(step.inputs, context.variables),
      outputs: {},
      retryCount: 0,
      logs: []
    };

    context.execution.stepExecutions.push(stepExecution);
    context.logger.info(`Starting step: ${step.name}`, { stepId: step.id });

    // Check step conditions
    if (!this.checkStepConditions(step, context)) {
      stepExecution.status = ExecutionStatus.COMPLETED;
      stepExecution.endTime = new Date();
      stepExecution.duration = stepExecution.endTime.getTime() - stepExecution.startTime.getTime();
      context.logger.info(`Step skipped due to conditions: ${step.name}`);
      return;
    }

    let lastError: Error | null = null;

    // Retry loop
    for (let attempt = 0; attempt <= step.retry.maxAttempts; attempt++) {
      try {
        // Set timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Step timeout')), step.timeout);
        });

        const executionPromise = this.executeStepAction(step, stepExecution, context, actionRegistry);

        stepExecution.outputs = await Promise.race([executionPromise, timeoutPromise]) as Record<string, any>;
        
        stepExecution.status = ExecutionStatus.COMPLETED;
        stepExecution.endTime = new Date();
        stepExecution.duration = stepExecution.endTime.getTime() - stepExecution.startTime.getTime();

        // Update context variables with step outputs
        if (step.outputs) {
          const stepOutputs: Record<string, any> = {};
          for (const [outputName, outputPath] of Object.entries(step.outputs)) {
            stepOutputs[outputName] = this.variableResolver.resolve(outputPath, { 
              outputs: stepExecution.outputs 
            });
          }
          
          if (!context.variables.steps) context.variables.steps = {};
          context.variables.steps[step.id] = { outputs: stepOutputs };
        }

        context.logger.info(`Step completed: ${step.name}`, { 
          stepId: step.id, 
          duration: stepExecution.duration 
        });
        return;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        stepExecution.retryCount = attempt;

        const isRetryable = step.retry.enabled && 
                           attempt < step.retry.maxAttempts &&
                           this.isRetryableError(lastError, step.retry);

        if (isRetryable) {
          const delay = this.calculateRetryDelay(attempt, step.retry);
          context.logger.warn(`Step failed, retrying in ${delay}ms: ${step.name}`, { 
            stepId: step.id, 
            attempt: attempt + 1,
            error: lastError.message 
          });
          
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }

    // Step failed
    stepExecution.status = ExecutionStatus.FAILED;
    stepExecution.endTime = new Date();
    stepExecution.duration = stepExecution.endTime.getTime() - stepExecution.startTime.getTime();
    stepExecution.error = {
      stepId: step.id,
      type: 'step_error',
      message: lastError?.message || 'Unknown error',
      stack: lastError?.stack,
      timestamp: new Date(),
      retryable: false
    };

    context.logger.error(`Step failed: ${step.name}`, { 
      stepId: step.id, 
      error: stepExecution.error 
    });

    if (!step.continueOnError) {
      throw lastError;
    }
  }

  private checkStepConditions(step: WorkflowStep, context: ExecutionContext): boolean {
    if (step.conditions.length === 0) return true;

    return step.conditions.every(condition => {
      return this.conditionEvaluator.evaluateExpression(condition.expression, context.variables);
    });
  }

  private async executeStepAction(
    step: WorkflowStep,
    stepExecution: StepExecution,
    context: ExecutionContext,
    actionRegistry: ActionRegistry
  ): Promise<Record<string, any>> {
    switch (step.type) {
      case StepType.ACTION:
        return this.executeAction(step, stepExecution, context, actionRegistry);
      case StepType.CONDITION:
        return this.executeCondition(step, context);
      case StepType.AI_AGENT:
        return this.executeAIAgent(step, stepExecution, context);
      case StepType.GHOST_BRANCH:
        return this.executeGhostBranch(step, stepExecution, context);
      case StepType.HTTP_REQUEST:
        return this.executeHttpRequest(step, stepExecution, context);
      case StepType.SCRIPT:
        return this.executeScript(step, stepExecution, context);
      case StepType.FILE_OPERATION:
        return this.executeFileOperation(step, stepExecution, context);
      case StepType.NOTIFICATION:
        return this.executeNotification(step, stepExecution, context);
      default:
        throw new Error(`Unsupported step type: ${step.type}`);
    }
  }

  private async executeAction(
    step: WorkflowStep,
    stepExecution: StepExecution,
    context: ExecutionContext,
    actionRegistry: ActionRegistry
  ): Promise<Record<string, any>> {
    const actionHandler = actionRegistry[step.action.type];
    if (!actionHandler) {
      throw new Error(`Unknown action type: ${step.action.type}`);
    }

    return actionHandler.execute(stepExecution.inputs, context);
  }

  private async executeCondition(
    step: WorkflowStep,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const condition = step.conditions[0];
    if (!condition) {
      throw new Error('Condition step requires a condition');
    }

    const result = this.conditionEvaluator.evaluateExpression(condition.expression, context.variables);
    
    return {
      result,
      nextStep: result ? condition.onTrue : condition.onFalse
    };
  }

  private async executeAIAgent(
    step: WorkflowStep,
    stepExecution: StepExecution,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const { agentId, taskType, description, contextData } = stepExecution.inputs;

    const task: SwarmTask = {
      id: `task-${step.id}-${Date.now()}`,
      type: taskType as TaskType || TaskType.CODE,
      description: description || step.name,
      priority: 5,
      context: {
        workflowId: context.execution.workflowId,
        stepId: step.id,
        ...contextData
      }
    };

    const result = await context.swarm.executeTask(task);
    
    return {
      success: result.success,
      output: result.output,
      quality: result.quality,
      reasoning: result.reasoning,
      executionTime: result.executionTime
    };
  }

  private async executeGhostBranch(
    step: WorkflowStep,
    stepExecution: StepExecution,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const { intent, changes } = stepExecution.inputs;

    const userIntent: UserIntent = {
      id: `intent-${step.id}-${Date.now()}`,
      description: intent.description,
      type: intent.type as IntentType || IntentType.FEATURE,
      priority: intent.priority || 5,
      requirements: intent.requirements || [],
      acceptanceCriteria: intent.acceptanceCriteria || [],
      context: intent.context || {
        relatedFiles: [],
        dependencies: [],
        affectedComponents: [],
        estimatedEffort: 1,
        risks: []
      },
      owner: intent.owner || 'workflow-engine'
    };

    const ghostBranch = await context.ghostBranch.createAutomatedPR(userIntent, changes);
    
    return {
      branchId: ghostBranch.id,
      branchName: ghostBranch.name,
      pullRequestId: ghostBranch.pullRequest?.id,
      status: ghostBranch.status
    };
  }

  private async executeHttpRequest(
    step: WorkflowStep,
    stepExecution: StepExecution,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const { url, method = 'GET', headers = {}, body } = stepExecution.inputs;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const responseData = await response.text();
    let parsedData: any = responseData;

    try {
      parsedData = JSON.parse(responseData);
    } catch {
      // Keep as text if not JSON
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: parsedData
    };
  }

  private async executeScript(
    step: WorkflowStep,
    stepExecution: StepExecution,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const { script, language = 'javascript' } = stepExecution.inputs;

    if (language !== 'javascript') {
      throw new Error(`Unsupported script language: ${language}`);
    }

    // Create a sandboxed environment
    const sandbox = {
      inputs: stepExecution.inputs,
      variables: context.variables,
      console: {
        log: (...args: any[]) => context.logger.info(args.join(' '), { stepId: step.id })
      },
      fetch: globalThis.fetch,
      setTimeout: globalThis.setTimeout,
      clearTimeout: globalThis.clearTimeout
    };

    const sandboxKeys = Object.keys(sandbox);
    const sandboxValues = Object.values(sandbox);

    const scriptFunction = new Function(...sandboxKeys, `return (async () => { ${script} })()`);
    const result = await scriptFunction(...sandboxValues);

    return { result };
  }

  private async executeFileOperation(
    step: WorkflowStep,
    stepExecution: StepExecution,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const { operation, path, content, encoding = 'utf8' } = stepExecution.inputs;

    switch (operation) {
      case 'read':
        // In a real implementation, use fs.readFile
        return { content: 'file content', size: 100 };
      
      case 'write':
        // In a real implementation, use fs.writeFile
        return { success: true, bytesWritten: content?.length || 0 };
      
      case 'delete':
        // In a real implementation, use fs.unlink
        return { success: true };
      
      case 'exists':
        // In a real implementation, use fs.exists
        return { exists: true };
      
      default:
        throw new Error(`Unsupported file operation: ${operation}`);
    }
  }

  private async executeNotification(
    step: WorkflowStep,
    stepExecution: StepExecution,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const { type, recipient, subject, message, channel } = stepExecution.inputs;

    // In a real implementation, integrate with notification services
    context.logger.info(`Notification sent: ${type}`, {
      recipient,
      subject,
      channel
    });

    return {
      success: true,
      notificationId: `notif-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  private isRetryableError(error: Error, retryConfig: RetryConfig): boolean {
    if (retryConfig.retryOnErrors.length === 0) return true;
    
    return retryConfig.retryOnErrors.some(errorType => 
      error.message.includes(errorType) || error.name.includes(errorType)
    );
  }

  private calculateRetryDelay(attempt: number, retryConfig: RetryConfig): number {
    switch (retryConfig.backoffStrategy) {
      case 'linear':
        return Math.min(retryConfig.baseDelay * (attempt + 1), retryConfig.maxDelay);
      case 'exponential':
        return Math.min(retryConfig.baseDelay * Math.pow(2, attempt), retryConfig.maxDelay);
      case 'fixed':
      default:
        return retryConfig.baseDelay;
    }
  }

  private createLogger(execution: WorkflowExecution): ExecutionLogger {
    return {
      debug: (message: string, data?: any) => this.addLog(execution, LogLevel.DEBUG, message, data),
      info: (message: string, data?: any) => this.addLog(execution, LogLevel.INFO, message, data),
      warn: (message: string, data?: any) => this.addLog(execution, LogLevel.WARN, message, data),
      error: (message: string, data?: any) => this.addLog(execution, LogLevel.ERROR, message, data)
    };
  }

  private addLog(execution: WorkflowExecution, level: LogLevel, message: string, data?: any): void {
    const log: ExecutionLog = {
      timestamp: new Date(),
      level,
      message,
      data
    };

    // Add to current step if exists
    const currentStep = execution.stepExecutions[execution.stepExecutions.length - 1];
    if (currentStep && currentStep.status === ExecutionStatus.RUNNING) {
      currentStep.logs.push(log);
    }
  }
}

// Main WorkflowEngine class
export class WorkflowEngine extends EventEmitter {
  private workflows = new Map<string, Workflow>();
  private executions = new Map<string, WorkflowExecution>();
  private scheduledJobs = new Map<string, NodeJS.Timeout>();
  private actionRegistry: ActionRegistry = {};
  private executionEngine = new ExecutionEngine();
  private swarmOrchestrator: SwarmOrchestrator;
  private ghostBranchManager: GhostBranchManager;

  constructor(swarmOrchestrator: SwarmOrchestrator, ghostBranchManager: GhostBranchManager) {
    super();
    this.swarmOrchestrator = swarmOrchestrator;
    this.ghostBranchManager = ghostBranchManager;
    this.initializeBuiltinActions();
    this.startScheduler();
  }

  // Workflow management
  async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    const newWorkflow: Workflow = {
      ...workflow,
      id: `workflow-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workflows.set(newWorkflow.id, newWorkflow);
    this.setupScheduledWorkflow(newWorkflow);
    this.emit('workflowCreated', newWorkflow);

    return newWorkflow;
  }

  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    const existing = this.workflows.get(id);
    if (!existing) {
      throw new Error(`Workflow not found: ${id}`);
    }

    const updated: Workflow = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve ID
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: new Date()
    };

    this.workflows.set(id, updated);
    this.setupScheduledWorkflow(updated);
    this.emit('workflowUpdated', updated);

    return updated;
  }

  async deleteWorkflow(id: string): Promise<void> {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      throw new Error(`Workflow not found: ${id}`);
    }

    this.workflows.delete(id);
    this.clearScheduledWorkflow(id);
    this.emit('workflowDeleted', { id, workflow });
  }

  getWorkflow(id: string): Workflow | null {
    return this.workflows.get(id) || null;
  }

  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  // Execution
  async executeWorkflow(workflowId: string, trigger: ExecutionTrigger): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Check trigger conditions
    if (!this.checkTriggerConditions(workflow.trigger, trigger)) {
      throw new Error('Trigger conditions not met');
    }

    const execution = await this.executionEngine.executeWorkflow(
      workflow,
      trigger,
      this.actionRegistry,
      {
        swarm: this.swarmOrchestrator,
        ghostBranch: this.ghostBranchManager
      }
    );

    this.executions.set(execution.id, execution);
    this.emit('executionStarted', execution);

    // Update workflow metrics
    this.updateWorkflowMetrics(workflow, execution);

    if (execution.status === ExecutionStatus.COMPLETED) {
      this.emit('executionCompleted', execution);
    } else if (execution.status === ExecutionStatus.FAILED) {
      this.emit('executionFailed', execution);
    }

    return execution;
  }

  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    if (execution.status === ExecutionStatus.RUNNING) {
      execution.status = ExecutionStatus.CANCELLED;
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      
      this.emit('executionCancelled', execution);
    }
  }

  getExecution(id: string): WorkflowExecution | null {
    return this.executions.get(id) || null;
  }

  getWorkflowExecutions(workflowId: string): WorkflowExecution[] {
    return Array.from(this.executions.values()).filter(exec => exec.workflowId === workflowId);
  }

  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }

  // Action registry
  registerAction(action: ActionHandler): void {
    this.actionRegistry[action.name] = action;
    this.emit('actionRegistered', action);
  }

  unregisterAction(name: string): void {
    delete this.actionRegistry[name];
    this.emit('actionUnregistered', { name });
  }

  getRegisteredActions(): ActionHandler[] {
    return Object.values(this.actionRegistry);
  }

  // Trigger handling
  async handleTrigger(trigger: ExecutionTrigger): Promise<WorkflowExecution[]> {
    const executions: WorkflowExecution[] = [];

    for (const workflow of this.workflows.values()) {
      if (this.shouldTriggerWorkflow(workflow, trigger)) {
        try {
          const execution = await this.executeWorkflow(workflow.id, trigger);
          executions.push(execution);
        } catch (error) {
          this.emit('triggerError', { workflow, trigger, error });
        }
      }
    }

    return executions;
  }

  // Private methods
  private checkTriggerConditions(workflowTrigger: WorkflowTrigger, executionTrigger: ExecutionTrigger): boolean {
    if (workflowTrigger.type !== executionTrigger.type && workflowTrigger.type !== TriggerType.MANUAL) {
      return false;
    }

    const conditionEvaluator = new ConditionEvaluator();
    return workflowTrigger.conditions.every(condition => {
      const result = conditionEvaluator.evaluate(condition, executionTrigger.payload);
      return condition.optional || result;
    });
  }

  private shouldTriggerWorkflow(workflow: Workflow, trigger: ExecutionTrigger): boolean {
    if (workflow.trigger.type === TriggerType.MANUAL) return false;
    return this.checkTriggerConditions(workflow.trigger, trigger);
  }

  private setupScheduledWorkflow(workflow: Workflow): void {
    this.clearScheduledWorkflow(workflow.id);

    if (workflow.trigger.type === TriggerType.SCHEDULED && workflow.trigger.schedule) {
      // In a real implementation, use a proper cron scheduler
      const interval = this.parseCronToInterval(workflow.trigger.schedule.cron);
      
      if (interval > 0) {
        const job = setInterval(async () => {
          const trigger: ExecutionTrigger = {
            type: TriggerType.SCHEDULED,
            source: 'scheduler',
            payload: {},
            timestamp: new Date()
          };

          try {
            await this.executeWorkflow(workflow.id, trigger);
          } catch (error) {
            this.emit('scheduledExecutionError', { workflow, error });
          }
        }, interval);

        this.scheduledJobs.set(workflow.id, job);
      }
    }
  }

  private clearScheduledWorkflow(workflowId: string): void {
    const job = this.scheduledJobs.get(workflowId);
    if (job) {
      clearInterval(job);
      this.scheduledJobs.delete(workflowId);
    }
  }

  private parseCronToInterval(cron: string): number {
    // Simple cron parser - in real implementation use a proper cron library
    if (cron === '* * * * *') return 60000; // Every minute
    if (cron === '0 * * * *') return 3600000; // Every hour
    if (cron === '0 0 * * *') return 86400000; // Every day
    return 0; // Invalid or unsupported
  }

  private startScheduler(): void {
    // Start periodic cleanup and maintenance
    setInterval(() => {
      this.cleanupOldExecutions();
    }, 300000); // Every 5 minutes
  }

  private cleanupOldExecutions(): void {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    const cutoff = new Date(Date.now() - maxAge);

    for (const [id, execution] of this.executions.entries()) {
      if (execution.endTime && execution.endTime < cutoff) {
        this.executions.delete(id);
      }
    }
  }

  private updateWorkflowMetrics(workflow: Workflow, execution: WorkflowExecution): void {
    workflow.metadata.usageCount++;
    
    if (execution.status === ExecutionStatus.COMPLETED) {
      const successCount = workflow.metadata.successRate * (workflow.metadata.usageCount - 1) + 1;
      workflow.metadata.successRate = successCount / workflow.metadata.usageCount;
    } else {
      const successCount = workflow.metadata.successRate * (workflow.metadata.usageCount - 1);
      workflow.metadata.successRate = successCount / workflow.metadata.usageCount;
    }

    if (execution.duration) {
      const totalTime = workflow.metadata.averageExecutionTime * (workflow.metadata.usageCount - 1) + execution.duration;
      workflow.metadata.averageExecutionTime = totalTime / workflow.metadata.usageCount;
    }

    workflow.updatedAt = new Date();
  }

  private initializeBuiltinActions(): void {
    // Log action
    this.registerAction({
      name: 'log',
      description: 'Log a message',
      inputs: [
        { name: 'message', type: 'string', required: true, description: 'Message to log' },
        { name: 'level', type: 'string', required: false, description: 'Log level', default: 'info' }
      ],
      outputs: [
        { name: 'timestamp', type: 'string', description: 'Log timestamp' }
      ],
      execute: async (inputs, context) => {
        const { message, level = 'info' } = inputs;
        const logger = context.logger;
        
        switch (level) {
          case 'debug': logger.debug(message); break;
          case 'warn': logger.warn(message); break;
          case 'error': logger.error(message); break;
          default: logger.info(message); break;
        }

        return { timestamp: new Date().toISOString() };
      }
    });

    // Delay action
    this.registerAction({
      name: 'delay',
      description: 'Wait for a specified amount of time',
      inputs: [
        { name: 'duration', type: 'number', required: true, description: 'Delay in milliseconds' }
      ],
      outputs: [
        { name: 'startTime', type: 'string', description: 'Start timestamp' },
        { name: 'endTime', type: 'string', description: 'End timestamp' }
      ],
      execute: async (inputs) => {
        const { duration } = inputs;
        const startTime = new Date().toISOString();
        
        await new Promise(resolve => setTimeout(resolve, duration));
        
        return {
          startTime,
          endTime: new Date().toISOString()
        };
      }
    });

    // Variable set action
    this.registerAction({
      name: 'set_variable',
      description: 'Set a workflow variable',
      inputs: [
        { name: 'name', type: 'string', required: true, description: 'Variable name' },
        { name: 'value', type: 'any', required: true, description: 'Variable value' }
      ],
      outputs: [
        { name: 'success', type: 'boolean', description: 'Operation success' }
      ],
      execute: async (inputs, context) => {
        const { name, value } = inputs;
        context.variables[name] = value;
        return { success: true };
      }
    });
  }

  // Analytics and monitoring
  getWorkflowAnalytics(): any {
    const workflows = this.getAllWorkflows();
    const executions = this.getAllExecutions();

    return {
      totalWorkflows: workflows.length,
      totalExecutions: executions.length,
      successRate: executions.length > 0 
        ? executions.filter(e => e.status === ExecutionStatus.COMPLETED).length / executions.length
        : 0,
      averageExecutionTime: executions.length > 0
        ? executions.reduce((sum, e) => sum + (e.duration || 0), 0) / executions.length
        : 0,
      mostUsedWorkflows: workflows
        .sort((a, b) => b.metadata.usageCount - a.metadata.usageCount)
        .slice(0, 5)
        .map(w => ({ id: w.id, name: w.name, usageCount: w.metadata.usageCount })),
      recentExecutions: executions
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
        .slice(0, 10)
    };
  }
}

export default WorkflowEngine; 