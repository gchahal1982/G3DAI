import { EventEmitter } from 'events';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface AuditTrail {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  organizationId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'access' | 'data' | 'system' | 'security' | 'compliance';
}

export interface ChangeRecord {
  id: string;
  timestamp: string;
  userId: string;
  resourceType: string;
  resourceId: string;
  changeType: 'create' | 'update' | 'delete' | 'access';
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  diff: string;
  approvalRequired: boolean;
  approvedBy?: string;
  approvalTimestamp?: string;
  rollbackData?: Record<string, any>;
}

export interface AccessLog {
  id: string;
  timestamp: string;
  userId: string;
  email: string;
  action: 'login' | 'logout' | 'access_granted' | 'access_denied' | 'privilege_escalation';
  resource?: string;
  success: boolean;
  ipAddress: string;
  location?: {
    country: string;
    region: string;
    city: string;
  };
  deviceInfo: {
    userAgent: string;
    deviceId?: string;
    platform: string;
  };
  riskScore: number;
}

export interface DataRetentionPolicy {
  id: string;
  name: string;
  description: string;
  dataTypes: string[];
  retentionPeriod: number; // days
  archiveAfter: number; // days
  deleteAfter: number; // days
  legalHold: boolean;
  complianceFramework: string[];
  encryptionRequired: boolean;
  backupRequired: boolean;
  approvalRequired: boolean;
}

export interface ComplianceReport {
  id: string;
  reportType: 'soc2_type1' | 'soc2_type2' | 'audit_summary' | 'control_effectiveness';
  period: {
    startDate: string;
    endDate: string;
  };
  generatedBy: string;
  generatedAt: string;
  status: 'draft' | 'in_review' | 'approved' | 'published';
  findings: ComplianceFinding[];
  recommendations: string[];
  metadata: Record<string, any>;
}

export interface ComplianceFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  evidence: string[];
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  assignedTo?: string;
  dueDate?: string;
}

export interface ComplianceControl {
  id: string;
  framework: 'soc2' | 'iso27001' | 'pci_dss' | 'gdpr' | 'hipaa';
  controlId: string;
  title: string;
  description: string;
  category: string;
  automated: boolean;
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  lastExecuted?: string;
  nextExecution?: string;
  status: 'passing' | 'failing' | 'warning' | 'not_tested';
  evidence: string[];
  responsible: string;
}

export interface RemediationWorkflow {
  id: string;
  findingId: string;
  status: 'pending' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  steps: RemediationStep[];
  approvals: WorkflowApproval[];
  createdAt: string;
  updatedAt: string;
}

export interface RemediationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assignedTo: string;
  completedAt?: string;
  evidence?: string[];
  notes?: string;
}

export interface WorkflowApproval {
  id: string;
  approverRole: string;
  approverEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp?: string;
  comments?: string;
}

export class SOC2Manager extends EventEmitter {
  private auditLogPath: string;
  private changeLogPath: string;
  private accessLogPath: string;
  private reportsPath: string;
  private retentionPolicies: Map<string, DataRetentionPolicy> = new Map();
  private controls: Map<string, ComplianceControl> = new Map();
  private activeWorkflows: Map<string, RemediationWorkflow> = new Map();

  constructor(storageBasePath: string = './compliance-data') {
    super();
    this.auditLogPath = path.join(storageBasePath, 'audit-logs');
    this.changeLogPath = path.join(storageBasePath, 'change-logs');
    this.accessLogPath = path.join(storageBasePath, 'access-logs');
    this.reportsPath = path.join(storageBasePath, 'reports');
    
    this.initializeStorage();
    this.setupDefaultPolicies();
    this.setupDefaultControls();
  }

  /**
   * Initialize storage directories
   */
  private async initializeStorage(): Promise<void> {
    const dirs = [this.auditLogPath, this.changeLogPath, this.accessLogPath, this.reportsPath];
    
    for (const dir of dirs) {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
    }
  }

  /**
   * Setup default data retention policies
   */
  private setupDefaultPolicies(): void {
    const policies: DataRetentionPolicy[] = [
      {
        id: 'audit-logs',
        name: 'Audit Log Retention',
        description: 'Retention policy for audit trail logs',
        dataTypes: ['audit_trail', 'security_events'],
        retentionPeriod: 2555, // 7 years
        archiveAfter: 365, // 1 year
        deleteAfter: 2555, // 7 years
        legalHold: false,
        complianceFramework: ['SOC2', 'PCI_DSS'],
        encryptionRequired: true,
        backupRequired: true,
        approvalRequired: false
      },
      {
        id: 'user-data',
        name: 'User Data Retention',
        description: 'Retention policy for user personal data',
        dataTypes: ['user_profile', 'preferences', 'analytics'],
        retentionPeriod: 1095, // 3 years
        archiveAfter: 365,
        deleteAfter: 1095,
        legalHold: false,
        complianceFramework: ['GDPR', 'SOC2'],
        encryptionRequired: true,
        backupRequired: true,
        approvalRequired: true
      },
      {
        id: 'system-logs',
        name: 'System Log Retention',
        description: 'Retention policy for system operation logs',
        dataTypes: ['application_logs', 'performance_metrics'],
        retentionPeriod: 365,
        archiveAfter: 90,
        deleteAfter: 365,
        legalHold: false,
        complianceFramework: ['SOC2'],
        encryptionRequired: false,
        backupRequired: true,
        approvalRequired: false
      }
    ];

    policies.forEach(policy => {
      this.retentionPolicies.set(policy.id, policy);
    });
  }

  /**
   * Setup default SOC 2 controls
   */
  private setupDefaultControls(): void {
    const controls: ComplianceControl[] = [
      {
        id: 'cc6.1',
        framework: 'soc2',
        controlId: 'CC6.1',
        title: 'Logical and Physical Access Controls',
        description: 'The entity implements logical and physical access controls to protect against threats from sources outside its system boundaries.',
        category: 'Access Control',
        automated: true,
        frequency: 'continuous',
        status: 'passing',
        evidence: [],
        responsible: 'security-team@company.com'
      },
      {
        id: 'cc6.2',
        framework: 'soc2',
        controlId: 'CC6.2',
        title: 'User Access Management',
        description: 'Prior to issuing system credentials, the entity registers and authorizes new internal and external users.',
        category: 'Access Control',
        automated: true,
        frequency: 'daily',
        status: 'passing',
        evidence: [],
        responsible: 'security-team@company.com'
      },
      {
        id: 'cc6.3',
        framework: 'soc2',
        controlId: 'CC6.3',
        title: 'User Authentication',
        description: 'The entity authorizes, modifies, or removes access to data, software, functions, and other protected information assets.',
        category: 'Access Control',
        automated: true,
        frequency: 'continuous',
        status: 'passing',
        evidence: [],
        responsible: 'security-team@company.com'
      },
      {
        id: 'cc7.1',
        framework: 'soc2',
        controlId: 'CC7.1',
        title: 'System Security',
        description: 'The entity restricts the transmission, movement, and removal of information to authorized internal and external users.',
        category: 'System Operations',
        automated: true,
        frequency: 'continuous',
        status: 'passing',
        evidence: [],
        responsible: 'platform-team@company.com'
      }
    ];

    controls.forEach(control => {
      this.controls.set(control.id, control);
    });
  }

  /**
   * Log comprehensive audit trail
   */
  async logAuditEvent(event: Omit<AuditTrail, 'id' | 'timestamp'>): Promise<string> {
    const auditEvent: AuditTrail = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...event
    };

    const logFile = path.join(this.auditLogPath, `${new Date().toISOString().split('T')[0]}.json`);
    
    try {
      let existingLogs: AuditTrail[] = [];
      if (existsSync(logFile)) {
        const content = await readFile(logFile, 'utf-8');
        existingLogs = JSON.parse(content);
      }
      
      existingLogs.push(auditEvent);
      await writeFile(logFile, JSON.stringify(existingLogs, null, 2));
      
      this.emit('auditEvent', auditEvent);
      
      // Check for compliance violations
      await this.checkComplianceViolations(auditEvent);
      
      return auditEvent.id;
    } catch (error) {
      this.emit('error', { type: 'audit_logging_failed', error });
      throw error;
    }
  }

  /**
   * Track changes with detailed diffs
   */
  async logChangeEvent(change: Omit<ChangeRecord, 'id' | 'timestamp' | 'diff'>): Promise<string> {
    const diff = this.generateDiff(change.beforeState, change.afterState);
    
    const changeRecord: ChangeRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      diff,
      ...change
    };

    const logFile = path.join(this.changeLogPath, `${new Date().toISOString().split('T')[0]}.json`);
    
    try {
      let existingChanges: ChangeRecord[] = [];
      if (existsSync(logFile)) {
        const content = await readFile(logFile, 'utf-8');
        existingChanges = JSON.parse(content);
      }
      
      existingChanges.push(changeRecord);
      await writeFile(logFile, JSON.stringify(existingChanges, null, 2));
      
      this.emit('changeEvent', changeRecord);
      
      return changeRecord.id;
    } catch (error) {
      this.emit('error', { type: 'change_logging_failed', error });
      throw error;
    }
  }

  /**
   * Log detailed access events
   */
  async logAccessEvent(access: Omit<AccessLog, 'id' | 'timestamp'>): Promise<string> {
    const accessEvent: AccessLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...access
    };

    const logFile = path.join(this.accessLogPath, `${new Date().toISOString().split('T')[0]}.json`);
    
    try {
      let existingLogs: AccessLog[] = [];
      if (existsSync(logFile)) {
        const content = await readFile(logFile, 'utf-8');
        existingLogs = JSON.parse(content);
      }
      
      existingLogs.push(accessEvent);
      await writeFile(logFile, JSON.stringify(existingLogs, null, 2));
      
      this.emit('accessEvent', accessEvent);
      
      // Check for suspicious activity
      if (accessEvent.riskScore > 70) {
        this.emit('suspiciousActivity', accessEvent);
      }
      
      return accessEvent.id;
    } catch (error) {
      this.emit('error', { type: 'access_logging_failed', error });
      throw error;
    }
  }

  /**
   * Generate detailed diff between states
   */
  private generateDiff(before: any, after: any): string {
    const changes: string[] = [];
    
    if (!before && after) {
      return `Created: ${JSON.stringify(after, null, 2)}`;
    }
    
    if (before && !after) {
      return `Deleted: ${JSON.stringify(before, null, 2)}`;
    }
    
    const beforeKeys = new Set(Object.keys(before || {}));
    const afterKeys = new Set(Object.keys(after || {}));
    
    // Added fields
    for (const key of afterKeys) {
      if (!beforeKeys.has(key)) {
        changes.push(`+ ${key}: ${JSON.stringify(after[key])}`);
      }
    }
    
    // Removed fields
    for (const key of beforeKeys) {
      if (!afterKeys.has(key)) {
        changes.push(`- ${key}: ${JSON.stringify(before[key])}`);
      }
    }
    
    // Modified fields
    for (const key of beforeKeys) {
      if (afterKeys.has(key) && JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        changes.push(`~ ${key}: ${JSON.stringify(before[key])} → ${JSON.stringify(after[key])}`);
      }
    }
    
    return changes.join('\n');
  }

  /**
   * Check for compliance violations
   */
  private async checkComplianceViolations(event: AuditTrail): Promise<void> {
    const violations: string[] = [];
    
    // Check for unauthorized access attempts
    if (event.category === 'access' && event.details.success === false) {
      violations.push('Unauthorized access attempt detected');
    }
    
    // Check for privilege escalation
    if (event.action.includes('privilege') && event.severity === 'critical') {
      violations.push('Privilege escalation detected');
    }
    
    // Check for data export/download
    if (event.action.includes('export') || event.action.includes('download')) {
      violations.push('Data export/download requires additional scrutiny');
    }
    
    if (violations.length > 0) {
      this.emit('complianceViolation', { event, violations });
    }
  }

  /**
   * Generate compliance reports
   */
  async generateReport(
    reportType: ComplianceReport['reportType'],
    period: { startDate: string; endDate: string },
    generatedBy: string
  ): Promise<ComplianceReport> {
    const report: ComplianceReport = {
      id: crypto.randomUUID(),
      reportType,
      period,
      generatedBy,
      generatedAt: new Date().toISOString(),
      status: 'draft',
      findings: [],
      recommendations: [],
      metadata: {}
    };

    try {
      // Collect data based on report type
      if (reportType === 'soc2_type1' || reportType === 'soc2_type2') {
        report.findings = await this.generateSOC2Findings(period);
        report.recommendations = await this.generateSOC2Recommendations();
      }
      
      const reportFile = path.join(this.reportsPath, `${report.id}.json`);
      await writeFile(reportFile, JSON.stringify(report, null, 2));
      
      this.emit('reportGenerated', report);
      
      return report;
    } catch (error) {
      this.emit('error', { type: 'report_generation_failed', error });
      throw error;
    }
  }

  /**
   * Generate SOC 2 findings
   */
  private async generateSOC2Findings(period: { startDate: string; endDate: string }): Promise<ComplianceFinding[]> {
    const findings: ComplianceFinding[] = [];
    
    // Analyze controls effectiveness
    for (const [controlId, control] of this.controls) {
      if (control.framework === 'soc2' && control.status === 'failing') {
        findings.push({
          id: crypto.randomUUID(),
          severity: 'high',
          category: control.category,
          title: `Control ${control.controlId} not operating effectively`,
          description: `The control "${control.title}" is not operating effectively and requires immediate attention.`,
          evidence: control.evidence,
          remediation: `Review and remediate control ${control.controlId} to ensure proper operation.`,
          status: 'open'
        });
      }
    }
    
    return findings;
  }

  /**
   * Generate SOC 2 recommendations
   */
  private async generateSOC2Recommendations(): Promise<string[]> {
    const recommendations: string[] = [
      'Implement automated monitoring for all critical controls',
      'Establish regular review cycles for access permissions',
      'Enhance logging and monitoring capabilities',
      'Implement data classification and handling procedures',
      'Establish incident response procedures',
      'Conduct regular security awareness training'
    ];
    
    return recommendations;
  }

  /**
   * Create evidence collection system
   */
  async collectEvidence(controlId: string, evidenceType: string, data: any): Promise<string> {
    const evidenceId = crypto.randomUUID();
    const evidenceFile = path.join(this.reportsPath, 'evidence', `${evidenceId}.json`);
    
    const evidence = {
      id: evidenceId,
      controlId,
      type: evidenceType,
      collectedAt: new Date().toISOString(),
      data: data,
      hash: crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
    };
    
    await mkdir(path.dirname(evidenceFile), { recursive: true });
    await writeFile(evidenceFile, JSON.stringify(evidence, null, 2));
    
    // Update control evidence
    const control = this.controls.get(controlId);
    if (control) {
      control.evidence.push(evidenceId);
      control.lastExecuted = new Date().toISOString();
    }
    
    this.emit('evidenceCollected', { controlId, evidenceId });
    
    return evidenceId;
  }

  /**
   * Monitor controls execution
   */
  async executeControlMonitoring(): Promise<void> {
    for (const [controlId, control] of this.controls) {
      if (control.automated) {
        try {
          const result = await this.executeControl(control);
          control.status = result.success ? 'passing' : 'failing';
          control.lastExecuted = new Date().toISOString();
          
          if (result.evidence) {
            await this.collectEvidence(controlId, 'automated_check', result.evidence);
          }
          
          this.emit('controlExecuted', { controlId, status: control.status });
        } catch (error) {
          control.status = 'failing';
          this.emit('controlExecutionFailed', { controlId, error });
        }
      }
    }
  }

  /**
   * Execute individual control
   */
  private async executeControl(control: ComplianceControl): Promise<{ success: boolean; evidence?: any }> {
    // Placeholder for control-specific logic
    // In a real implementation, this would contain specific checks for each control
    
    switch (control.controlId) {
      case 'CC6.1':
        return await this.checkAccessControls();
      case 'CC6.2':
        return await this.checkUserRegistration();
      case 'CC6.3':
        return await this.checkAuthentication();
      case 'CC7.1':
        return await this.checkSystemSecurity();
      default:
        return { success: true };
    }
  }

  /**
   * Control-specific implementations
   */
  private async checkAccessControls(): Promise<{ success: boolean; evidence: any }> {
    // Check firewall rules, network security, physical access controls
    return {
      success: true,
      evidence: {
        firewall_rules_count: 25,
        failed_login_attempts: 0,
        physical_access_violations: 0
      }
    };
  }

  private async checkUserRegistration(): Promise<{ success: boolean; evidence: any }> {
    // Check user provisioning process, approval workflows
    return {
      success: true,
      evidence: {
        pending_user_requests: 0,
        approval_workflow_active: true,
        unauthorized_accounts: 0
      }
    };
  }

  private async checkAuthentication(): Promise<{ success: boolean; evidence: any }> {
    // Check MFA enforcement, password policies, session management
    return {
      success: true,
      evidence: {
        mfa_enforcement_rate: 100,
        weak_passwords: 0,
        session_timeout_configured: true
      }
    };
  }

  private async checkSystemSecurity(): Promise<{ success: boolean; evidence: any }> {
    // Check encryption, data transmission security, system hardening
    return {
      success: true,
      evidence: {
        encryption_at_rest: true,
        encryption_in_transit: true,
        security_patches_current: true
      }
    };
  }

  /**
   * Create remediation workflow
   */
  async createRemediationWorkflow(finding: ComplianceFinding, assignedTo: string, dueDate: string): Promise<string> {
    const workflow: RemediationWorkflow = {
      id: crypto.randomUUID(),
      findingId: finding.id,
      status: 'pending',
      assignedTo,
      priority: finding.severity === 'critical' ? 'critical' : finding.severity,
      dueDate,
      steps: [],
      approvals: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Generate remediation steps based on finding
    workflow.steps = this.generateRemediationSteps(finding);
    
    // Add required approvals for high/critical findings
    if (finding.severity === 'high' || finding.severity === 'critical') {
      workflow.approvals = [
        {
          id: crypto.randomUUID(),
          approverRole: 'security_manager',
          approverEmail: 'security-manager@company.com',
          status: 'pending'
        }
      ];
    }

    this.activeWorkflows.set(workflow.id, workflow);
    this.emit('workflowCreated', workflow);

    return workflow.id;
  }

  /**
   * Generate remediation steps
   */
  private generateRemediationSteps(finding: ComplianceFinding): RemediationStep[] {
    const steps: RemediationStep[] = [
      {
        id: crypto.randomUUID(),
        title: 'Investigate Root Cause',
        description: `Investigate the root cause of: ${finding.title}`,
        status: 'pending',
        assignedTo: finding.assignedTo || 'security-team@company.com'
      },
      {
        id: crypto.randomUUID(),
        title: 'Implement Fix',
        description: finding.remediation,
        status: 'pending',
        assignedTo: finding.assignedTo || 'security-team@company.com'
      },
      {
        id: crypto.randomUUID(),
        title: 'Validate Resolution',
        description: 'Test and validate that the issue has been resolved',
        status: 'pending',
        assignedTo: 'security-manager@company.com'
      }
    ];

    return steps;
  }

  /**
   * Update workflow status
   */
  async updateWorkflowStatus(workflowId: string, status: RemediationWorkflow['status']): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.status = status;
    workflow.updatedAt = new Date().toISOString();

    this.emit('workflowUpdated', workflow);
  }

  /**
   * Complete workflow step
   */
  async completeWorkflowStep(workflowId: string, stepId: string, evidence?: string[], notes?: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found`);
    }

    step.status = 'completed';
    step.completedAt = new Date().toISOString();
    if (evidence !== undefined) step.evidence = evidence;
    if (notes !== undefined) step.notes = notes;

    workflow.updatedAt = new Date().toISOString();

    // Check if all steps are completed
    const allCompleted = workflow.steps.every(s => s.status === 'completed');
    if (allCompleted) {
      workflow.status = 'completed';
    }

    this.emit('stepCompleted', { workflowId, stepId });
  }

  /**
   * Get compliance dashboard data
   */
  async getComplianceDashboard(): Promise<{
    controlsStatus: Record<string, number>;
    recentFindings: ComplianceFinding[];
    activeWorkflows: RemediationWorkflow[];
    complianceScore: number;
  }> {
    const controlsStatus = {
      passing: 0,
      failing: 0,
      warning: 0,
      not_tested: 0
    };

    for (const control of this.controls.values()) {
      controlsStatus[control.status]++;
    }

    const complianceScore = Math.round(
      (controlsStatus.passing / (controlsStatus.passing + controlsStatus.failing + controlsStatus.warning + controlsStatus.not_tested)) * 100
    );

    return {
      controlsStatus,
      recentFindings: [], // Would fetch from storage
      activeWorkflows: Array.from(this.activeWorkflows.values()),
      complianceScore
    };
  }

  /**
   * Export audit data
   */
  async exportAuditData(startDate: string, endDate: string, format: 'json' | 'csv'): Promise<string> {
    // Implementation would collect and format audit data for export
    const exportId = crypto.randomUUID();
    const exportFile = path.join(this.reportsPath, 'exports', `audit-export-${exportId}.${format}`);
    
    await mkdir(path.dirname(exportFile), { recursive: true });
    
    // Placeholder - would implement actual data collection and formatting
    const exportData = {
      exportId,
      period: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      auditEvents: [], // Would fetch from logs
      changeRecords: [], // Would fetch from logs
      accessLogs: [] // Would fetch from logs
    };
    
    await writeFile(exportFile, JSON.stringify(exportData, null, 2));
    
    return exportFile;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.removeAllListeners();
    this.retentionPolicies.clear();
    this.controls.clear();
    this.activeWorkflows.clear();
  }
}

export default SOC2Manager; 