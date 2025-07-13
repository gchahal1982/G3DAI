/**
 * Clinical Workflow Integration Library - MedSight Pro
 * Connects frontend to backend ClinicalWorkflowEngine.ts for medical workflow management
 * 
 * Features:
 * - Clinical workflow orchestration
 * - Patient journey management
 * - Task automation and routing
 * - Medical decision support integration
 * - Real-time workflow monitoring
 * - Compliance and audit trail integration
 */

import { ClinicalWorkflowEngine } from '@/core/ClinicalWorkflowEngine';
import { MedicalAuthService } from '@/lib/auth/medical-auth';
import { ComplianceAuditTrail } from '@/lib/compliance/audit-trail';

// Clinical Workflow Data Structures
export interface ClinicalWorkflow {
  id: string;
  name: string;
  description: string;
  version: string;
  type: 'diagnostic' | 'therapeutic' | 'preventive' | 'emergency' | 'surgical' | 'administrative';
  category: string;
  specialty: string;
  status: 'draft' | 'active' | 'suspended' | 'retired';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  outcomes: WorkflowOutcome[];
  metrics: WorkflowMetrics;
  compliance: ComplianceRequirements;
  assignedRoles: string[];
  estimatedDuration: number;
  isTemplate: boolean;
  createdBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  validFrom: Date;
  validTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'automated' | 'decision' | 'parallel' | 'sequential' | 'conditional';
  order: number;
  requiredRole: string;
  estimatedDuration: number;
  dependencies: string[];
  conditions: StepCondition[];
  actions: StepAction[];
  forms?: FormTemplate[];
  documentation: DocumentationRequirement[];
  qualityChecks: QualityCheck[];
  isOptional: boolean;
  canSkip: boolean;
  canDelegate: boolean;
  timeoutAction?: string;
  escalationRules: EscalationRule[];
}

export interface WorkflowTrigger {
  id: string;
  type: 'event' | 'schedule' | 'condition' | 'manual' | 'external';
  name: string;
  description: string;
  eventType?: string;
  scheduleExpression?: string;
  conditions: TriggerCondition[];
  priority: number;
  isActive: boolean;
}

export interface WorkflowCondition {
  id: string;
  type: 'patient' | 'clinical' | 'temporal' | 'resource' | 'external';
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'exists';
  value: any;
  logicalOperator?: 'and' | 'or' | 'not';
  groupId?: string;
}

export interface WorkflowOutcome {
  id: string;
  type: 'success' | 'failure' | 'cancelled' | 'timeout' | 'escalated';
  name: string;
  description: string;
  nextWorkflow?: string;
  notifications: NotificationRule[];
  documentation: string[];
  reportGeneration: boolean;
}

export interface WorkflowMetrics {
  totalExecutions: number;
  averageDuration: number;
  successRate: number;
  escalationRate: number;
  timeoutRate: number;
  patientSatisfactionScore?: number;
  clinicalOutcomeScore?: number;
  costEfficiency: number;
  lastExecuted?: Date;
  performanceTrend: 'improving' | 'stable' | 'declining';
}

export interface ComplianceRequirements {
  standards: string[];
  regulations: string[];
  certifications: string[];
  auditTrail: boolean;
  dataRetention: number;
  privacyLevel: 'standard' | 'high' | 'maximum';
  consentRequired: boolean;
  approvalRequired: boolean;
}

// Workflow Execution Data Structures
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  patientId: string;
  studyId?: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentStepId: string;
  currentStepStatus: 'waiting' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  assignedTo: string;
  context: WorkflowContext;
  variables: Record<string, any>;
  executionHistory: ExecutionHistoryEntry[];
  metrics: ExecutionMetrics;
  notifications: ExecutionNotification[];
  startedAt: Date;
  expectedCompletionAt: Date;
  completedAt?: Date;
  lastUpdated: Date;
}

export interface WorkflowContext {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    medicalHistory: string[];
    allergies: string[];
    currentMedications: string[];
  };
  clinical: {
    diagnosis?: string;
    symptoms: string[];
    vitalSigns?: Record<string, number>;
    labResults?: Record<string, any>;
    imagingResults?: string[];
  };
  operational: {
    location: string;
    department: string;
    equipment: string[];
    staffAvailable: string[];
    urgency: string;
  };
  external: {
    insurance?: string;
    referralSource?: string;
    appointment?: string;
    externalSystems?: Record<string, any>;
  };
}

export interface ExecutionHistoryEntry {
  id: string;
  stepId: string;
  stepName: string;
  status: 'started' | 'completed' | 'failed' | 'skipped' | 'delegated';
  assignedTo: string;
  actualDuration: number;
  notes?: string;
  attachments: string[];
  qualityScore?: number;
  timestamp: Date;
}

export interface ExecutionMetrics {
  totalDuration: number;
  stepDurations: Record<string, number>;
  delayCount: number;
  escalationCount: number;
  errorCount: number;
  qualityScore: number;
  patientWaitTime: number;
  resourceUtilization: Record<string, number>;
}

export interface ExecutionNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'reminder' | 'escalation';
  message: string;
  recipientRole: string;
  recipientId?: string;
  channel: 'email' | 'sms' | 'push' | 'dashboard' | 'pager';
  urgent: boolean;
  sent: boolean;
  sentAt?: Date;
  readAt?: Date;
}

// Supporting Data Structures
export interface StepCondition {
  field: string;
  operator: string;
  value: any;
  required: boolean;
}

export interface StepAction {
  type: 'form' | 'api_call' | 'notification' | 'document' | 'schedule' | 'measure';
  configuration: Record<string, any>;
  timeout?: number;
  retryCount?: number;
}

export interface FormTemplate {
  id: string;
  name: string;
  fields: FormField[];
  validation: ValidationRule[];
  conditional: ConditionalLogic[];
}

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'file';
  label: string;
  required: boolean;
  options?: string[];
  validation?: string;
  defaultValue?: any;
}

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ConditionalLogic {
  condition: string;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
  targetFields: string[];
}

export interface DocumentationRequirement {
  type: 'text' | 'image' | 'file' | 'measurement' | 'observation';
  name: string;
  description: string;
  required: boolean;
  template?: string;
  validationRules: string[];
}

export interface QualityCheck {
  id: string;
  name: string;
  description: string;
  type: 'automatic' | 'manual' | 'peer_review';
  criteria: QualityCriteria[];
  threshold: number;
  required: boolean;
}

export interface QualityCriteria {
  name: string;
  description: string;
  weight: number;
  measurement: string;
  target: number;
}

export interface EscalationRule {
  condition: string;
  delay: number;
  targetRole: string;
  targetUser?: string;
  notificationTemplate: string;
  priority: 'normal' | 'urgent' | 'critical';
}

export interface TriggerCondition {
  type: string;
  field: string;
  operator: string;
  value: any;
}

export interface NotificationRule {
  recipientRole: string;
  template: string;
  channel: string;
  timing: 'immediate' | 'delayed' | 'scheduled';
  delay?: number;
}

// Clinical Workflow Integration Class
export class ClinicalWorkflowIntegration {
  private engine: ClinicalWorkflowEngine;
  private auth: MedicalAuthService;
  private auditTrail: ComplianceAuditTrail;
  private workflowCache: Map<string, ClinicalWorkflow> = new Map();
  private executionCache: Map<string, WorkflowExecution> = new Map();
  private activeExecutions: Set<string> = new Set();
  private subscriptions: Map<string, Set<(event: WorkflowEvent) => void>> = new Map();

  constructor() {
    this.engine = new ClinicalWorkflowEngine();
    this.auth = MedicalAuthService.getInstance();
    this.auditTrail = new ComplianceAuditTrail();
    this.initializeEventListeners();
  }

  // Workflow Definition Management
  async createWorkflow(workflow: Omit<ClinicalWorkflow, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<ClinicalWorkflow | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required for workflow creation');
    }

    // Check permissions
    if (!await this.auth.hasPermission(user.id, 'workflow:create')) {
      throw new Error('Insufficient permissions to create workflows');
    }

    try {
      const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newWorkflow: ClinicalWorkflow = {
        ...workflow,
        id: workflowId,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const success = await this.engine.createWorkflow(newWorkflow);
      
      if (success) {
        // Cache the workflow
        this.workflowCache.set(workflowId, newWorkflow);
        
        // Log creation
        await this.auditTrail.logActivity({
          action: 'clinical_workflow_create',
          resourceType: 'clinical_workflow',
          resourceId: workflowId,
          userId: user.id,
          details: {
            workflowName: workflow.name,
            workflowType: workflow.type,
            specialty: workflow.specialty,
            stepCount: workflow.steps.length
          }
        });
        
        return newWorkflow;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating clinical workflow:', error);
      return null;
    }
  }

  async getWorkflow(workflowId: string): Promise<ClinicalWorkflow | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check cache first
    if (this.workflowCache.has(workflowId)) {
      return this.workflowCache.get(workflowId)!;
    }

    try {
      const workflow = await this.engine.getWorkflow(workflowId);
      
      if (workflow) {
        // Cache the workflow
        this.workflowCache.set(workflowId, workflow);
        
        // Log access
        await this.auditTrail.logActivity({
          action: 'clinical_workflow_access',
          resourceType: 'clinical_workflow',
          resourceId: workflowId,
          userId: user.id,
          details: {
            workflowName: workflow.name,
            workflowType: workflow.type
          }
        });
      }
      
      return workflow;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      return null;
    }
  }

  async getWorkflows(filters?: {
    type?: string;
    specialty?: string;
    status?: string;
    assignedRole?: string;
  }): Promise<ClinicalWorkflow[]> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const workflows = await this.engine.getWorkflows(filters);
      
      // Cache workflows
      workflows.forEach(workflow => {
        this.workflowCache.set(workflow.id, workflow);
      });
      
      // Log query
      await this.auditTrail.logActivity({
        action: 'clinical_workflow_query',
        resourceType: 'clinical_workflow_list',
        resourceId: 'query',
        userId: user.id,
        details: {
          filters,
          resultCount: workflows.length
        }
      });
      
      return workflows;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }
  }

  async updateWorkflow(workflowId: string, updates: Partial<ClinicalWorkflow>): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check permissions
    if (!await this.auth.hasPermission(user.id, 'workflow:update')) {
      throw new Error('Insufficient permissions to update workflows');
    }

    try {
      const success = await this.engine.updateWorkflow(workflowId, {
        ...updates,
        updatedAt: new Date()
      });
      
      if (success) {
        // Update cache
        const cachedWorkflow = this.workflowCache.get(workflowId);
        if (cachedWorkflow) {
          const updatedWorkflow = { ...cachedWorkflow, ...updates, updatedAt: new Date() };
          this.workflowCache.set(workflowId, updatedWorkflow);
        }
        
        // Log update
        await this.auditTrail.logActivity({
          action: 'clinical_workflow_update',
          resourceType: 'clinical_workflow',
          resourceId: workflowId,
          userId: user.id,
          details: {
            updatedFields: Object.keys(updates)
          }
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error updating workflow:', error);
      return false;
    }
  }

  async deleteWorkflow(workflowId: string): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check permissions
    if (!await this.auth.hasPermission(user.id, 'workflow:delete')) {
      throw new Error('Insufficient permissions to delete workflows');
    }

    try {
      const success = await this.engine.deleteWorkflow(workflowId);
      
      if (success) {
        // Remove from cache
        this.workflowCache.delete(workflowId);
        
        // Log deletion
        await this.auditTrail.logActivity({
          action: 'clinical_workflow_delete',
          resourceType: 'clinical_workflow',
          resourceId: workflowId,
          userId: user.id,
          details: {}
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      return false;
    }
  }

  // Workflow Execution Management
  async startWorkflow(
    workflowId: string, 
    context: WorkflowContext,
    options?: {
      priority?: string;
      assignedTo?: string;
      variables?: Record<string, any>;
    }
  ): Promise<WorkflowExecution | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required for workflow execution');
    }

    // Check permissions
    if (!await this.auth.hasPermission(user.id, 'workflow:execute')) {
      throw new Error('Insufficient permissions to execute workflows');
    }

    try {
      const executionId = `execution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const execution = await this.engine.startWorkflow(
        workflowId, 
        context, 
        {
          ...options,
          executionId,
          startedBy: user.id
        }
      );
      
      if (execution) {
        // Cache the execution
        this.executionCache.set(executionId, execution);
        this.activeExecutions.add(executionId);
        
        // Log start
        await this.auditTrail.logActivity({
          action: 'clinical_workflow_start',
          resourceType: 'workflow_execution',
          resourceId: executionId,
          userId: user.id,
          details: {
            workflowId,
            patientId: context.patient.id,
            priority: execution.priority,
            assignedTo: execution.assignedTo
          }
        });
        
        // Emit event
        this.emitEvent('workflow_started', {
          type: 'workflow_started',
          executionId,
          workflowId,
          patientId: context.patient.id,
          timestamp: new Date()
        });
        
        return execution;
      }
      
      return null;
    } catch (error) {
      console.error('Error starting workflow:', error);
      return null;
    }
  }

  async getExecution(executionId: string): Promise<WorkflowExecution | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check cache first
    if (this.executionCache.has(executionId)) {
      return this.executionCache.get(executionId)!;
    }

    try {
      const execution = await this.engine.getExecution(executionId);
      
      if (execution) {
        // Cache the execution
        this.executionCache.set(executionId, execution);
        
        // Log access
        await this.auditTrail.logActivity({
          action: 'workflow_execution_access',
          resourceType: 'workflow_execution',
          resourceId: executionId,
          userId: user.id,
          details: {
            workflowId: execution.workflowId,
            patientId: execution.patientId,
            status: execution.status
          }
        });
      }
      
      return execution;
    } catch (error) {
      console.error('Error fetching execution:', error);
      return null;
    }
  }

  async getExecutions(filters?: {
    workflowId?: string;
    patientId?: string;
    status?: string;
    assignedTo?: string;
    dateRange?: { from: Date; to: Date };
  }): Promise<WorkflowExecution[]> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const executions = await this.engine.getExecutions(filters);
      
      // Cache executions
      executions.forEach(execution => {
        this.executionCache.set(execution.id, execution);
        if (execution.status === 'running' || execution.status === 'paused') {
          this.activeExecutions.add(execution.id);
        }
      });
      
      // Log query
      await this.auditTrail.logActivity({
        action: 'workflow_execution_query',
        resourceType: 'workflow_execution_list',
        resourceId: 'query',
        userId: user.id,
        details: {
          filters,
          resultCount: executions.length
        }
      });
      
      return executions;
    } catch (error) {
      console.error('Error fetching executions:', error);
      return [];
    }
  }

  async advanceStep(executionId: string, stepData?: Record<string, any>): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const success = await this.engine.advanceStep(executionId, stepData, user.id);
      
      if (success) {
        // Update cache
        const execution = await this.engine.getExecution(executionId);
        if (execution) {
          this.executionCache.set(executionId, execution);
        }
        
        // Log step advancement
        await this.auditTrail.logActivity({
          action: 'workflow_step_advance',
          resourceType: 'workflow_execution',
          resourceId: executionId,
          userId: user.id,
          details: {
            stepData: stepData ? Object.keys(stepData) : []
          }
        });
        
        // Emit event
        this.emitEvent('step_completed', {
          type: 'step_completed',
          executionId,
          stepData,
          timestamp: new Date()
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error advancing step:', error);
      return false;
    }
  }

  async pauseExecution(executionId: string, reason?: string): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const success = await this.engine.pauseExecution(executionId, reason, user.id);
      
      if (success) {
        // Update cache
        const execution = this.executionCache.get(executionId);
        if (execution) {
          execution.status = 'paused';
          execution.lastUpdated = new Date();
          this.executionCache.set(executionId, execution);
        }
        
        // Log pause
        await this.auditTrail.logActivity({
          action: 'workflow_execution_pause',
          resourceType: 'workflow_execution',
          resourceId: executionId,
          userId: user.id,
          details: { reason }
        });
        
        // Emit event
        this.emitEvent('execution_paused', {
          type: 'execution_paused',
          executionId,
          reason,
          timestamp: new Date()
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error pausing execution:', error);
      return false;
    }
  }

  async resumeExecution(executionId: string): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const success = await this.engine.resumeExecution(executionId, user.id);
      
      if (success) {
        // Update cache
        const execution = this.executionCache.get(executionId);
        if (execution) {
          execution.status = 'running';
          execution.lastUpdated = new Date();
          this.executionCache.set(executionId, execution);
        }
        
        this.activeExecutions.add(executionId);
        
        // Log resume
        await this.auditTrail.logActivity({
          action: 'workflow_execution_resume',
          resourceType: 'workflow_execution',
          resourceId: executionId,
          userId: user.id,
          details: {}
        });
        
        // Emit event
        this.emitEvent('execution_resumed', {
          type: 'execution_resumed',
          executionId,
          timestamp: new Date()
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error resuming execution:', error);
      return false;
    }
  }

  async cancelExecution(executionId: string, reason?: string): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const success = await this.engine.cancelExecution(executionId, reason, user.id);
      
      if (success) {
        // Update cache
        const execution = this.executionCache.get(executionId);
        if (execution) {
          execution.status = 'cancelled';
          execution.completedAt = new Date();
          execution.lastUpdated = new Date();
          this.executionCache.set(executionId, execution);
        }
        
        this.activeExecutions.delete(executionId);
        
        // Log cancellation
        await this.auditTrail.logActivity({
          action: 'workflow_execution_cancel',
          resourceType: 'workflow_execution',
          resourceId: executionId,
          userId: user.id,
          details: { reason }
        });
        
        // Emit event
        this.emitEvent('execution_cancelled', {
          type: 'execution_cancelled',
          executionId,
          reason,
          timestamp: new Date()
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error cancelling execution:', error);
      return false;
    }
  }

  // Event Management
  subscribe(eventType: string, callback: (event: WorkflowEvent) => void): void {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }
    this.subscriptions.get(eventType)!.add(callback);
  }

  unsubscribe(eventType: string, callback: (event: WorkflowEvent) => void): void {
    const callbacks = this.subscriptions.get(eventType);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emitEvent(eventType: string, event: WorkflowEvent): void {
    const callbacks = this.subscriptions.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  private initializeEventListeners(): void {
    // Set up real-time event listeners from the backend
    this.engine.onWorkflowEvent((event) => {
      this.handleBackendEvent(event);
    });
  }

  private handleBackendEvent(event: any): void {
    // Handle events from the backend engine
    switch (event.type) {
      case 'execution_completed':
        this.activeExecutions.delete(event.executionId);
        break;
      case 'execution_failed':
        this.activeExecutions.delete(event.executionId);
        break;
      case 'step_timeout':
        // Handle step timeout
        break;
      case 'escalation_triggered':
        // Handle escalation
        break;
    }
    
    // Forward event to subscribers
    this.emitEvent(event.type, event);
  }

  // Metrics and Analytics
  async getWorkflowMetrics(workflowId: string, dateRange?: { from: Date; to: Date }): Promise<WorkflowMetrics | null> {
    try {
      return await this.engine.getWorkflowMetrics(workflowId, dateRange);
    } catch (error) {
      console.error('Error fetching workflow metrics:', error);
      return null;
    }
  }

  async getExecutionMetrics(executionId: string): Promise<ExecutionMetrics | null> {
    try {
      return await this.engine.getExecutionMetrics(executionId);
    } catch (error) {
      console.error('Error fetching execution metrics:', error);
      return null;
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    try {
      await this.engine.cleanup();
      this.workflowCache.clear();
      this.executionCache.clear();
      this.activeExecutions.clear();
      this.subscriptions.clear();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Getters
  getActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.activeExecutions)
      .map(id => this.executionCache.get(id))
      .filter(execution => execution !== undefined) as WorkflowExecution[];
  }

  getCachedWorkflows(): ClinicalWorkflow[] {
    return Array.from(this.workflowCache.values());
  }

  getCachedExecutions(): WorkflowExecution[] {
    return Array.from(this.executionCache.values());
  }
}

// Event interfaces
export interface WorkflowEvent {
  type: string;
  executionId?: string;
  workflowId?: string;
  patientId?: string;
  stepData?: any;
  reason?: string;
  timestamp: Date;
}

// Export singleton instance
export const clinicalWorkflowIntegration = new ClinicalWorkflowIntegration();
export default clinicalWorkflowIntegration; 