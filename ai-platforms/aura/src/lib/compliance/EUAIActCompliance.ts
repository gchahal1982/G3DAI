import { EventEmitter } from 'events';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface AISystem {
  id: string;
  name: string;
  description: string;
  riskCategory: 'unacceptable' | 'high' | 'limited' | 'minimal';
  purpose: string;
  dataTypes: string[];
  deployment: 'development' | 'testing' | 'production';
  provider: string;
  deployer: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskAssessment {
  id: string;
  systemId: string;
  assessmentDate: string;
  assessor: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigationMeasures: MitigationMeasure[];
  conclusion: string;
  nextReviewDate: string;
  approved: boolean;
  approvedBy?: string;
  approvalDate?: string;
}

export interface RiskFactor {
  id: string;
  category: 'bias' | 'discrimination' | 'manipulation' | 'safety' | 'privacy' | 'accuracy';
  description: string;
  likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  impact: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  riskScore: number;
  evidence: string[];
}

export interface MitigationMeasure {
  id: string;
  riskFactorId: string;
  title: string;
  description: string;
  type: 'technical' | 'organizational' | 'legal';
  status: 'planned' | 'implemented' | 'tested' | 'verified';
  effectivenessScore: number;
  implementationDate?: string;
  responsible: string;
  cost?: number;
}

export interface ModelCard {
  id: string;
  systemId: string;
  modelName: string;
  modelVersion: string;
  modelType: string;
  trainingData: {
    description: string;
    sources: string[];
    size: number;
    characteristics: Record<string, any>;
    biasAnalysis: string;
  };
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    fairnessMetrics: Record<string, number>;
    performanceByGroup: Record<string, any>;
  };
  limitations: string[];
  ethicalConsiderations: string[];
  intendedUse: string[];
  prohibitedUse: string[];
  environmentalImpact: {
    carbonFootprint: number;
    energyConsumption: number;
    computeHours: number;
  };
  generatedAt: string;
  validUntil: string;
}

export interface TransparencyReport {
  id: string;
  systemId: string;
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  systemDescription: string;
  riskCategory: string;
  userInteractions: {
    totalInteractions: number;
    userDemographics: Record<string, any>;
    feedbackReceived: number;
    complaintsReceived: number;
  };
  performanceMetrics: {
    accuracy: number;
    errorRate: number;
    biasMetrics: Record<string, number>;
    adversarialTestResults: Record<string, any>;
  };
  incidentsReported: number;
  correctiveActions: string[];
  humanOversight: {
    oversightLevel: 'human_in_loop' | 'human_on_loop' | 'human_out_loop';
    interventions: number;
    overrideRate: number;
  };
  dataGovernance: {
    dataRetentionPolicy: string;
    dataMinimization: boolean;
    consentManagement: boolean;
    rightsOfDataSubjects: string[];
  };
  generatedBy: string;
  generatedAt: string;
}

export interface BiasDetection {
  id: string;
  systemId: string;
  testDate: string;
  testType: 'demographic_parity' | 'equalized_odds' | 'calibration' | 'counterfactual';
  protectedAttributes: string[];
  results: {
    overallBiasScore: number;
    groupSpecificResults: Record<string, {
      bias_score: number;
      statistical_significance: number;
      confidence_interval: [number, number];
    }>;
    recommendations: string[];
  };
  methodology: string;
  tools: string[];
  reviewer: string;
}

export interface UserRights {
  id: string;
  userId: string;
  systemId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'object' | 'explanation';
  requestDate: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  responseDate?: string;
  response?: string;
  escalated: boolean;
  legalBasis?: string;
}

export interface RegulatoryReport {
  id: string;
  reportType: 'annual_transparency' | 'incident_report' | 'bias_audit' | 'conformity_assessment';
  reportingPeriod: {
    startDate: string;
    endDate: string;
  };
  systems: string[]; // System IDs
  findings: {
    complianceLevel: 'compliant' | 'partially_compliant' | 'non_compliant';
    violations: string[];
    riskAssessments: number;
    incidentsReported: number;
    correctiveActions: string[];
  };
  recommendations: string[];
  nextReportDue: string;
  submittedTo: string[];
  submissionDate?: string;
  generatedBy: string;
  generatedAt: string;
}

export class EUAIActCompliance extends EventEmitter {
  private storageBasePath: string;
  private systems: Map<string, AISystem> = new Map();
  private riskAssessments: Map<string, RiskAssessment> = new Map();
  private modelCards: Map<string, ModelCard> = new Map();
  private biasDetections: Map<string, BiasDetection> = new Map();
  private userRights: Map<string, UserRights> = new Map();
  private transparencyReports: Map<string, TransparencyReport> = new Map();

  constructor(storageBasePath: string = './eu-ai-act-data') {
    super();
    this.storageBasePath = storageBasePath;
    this.initializeStorage();
  }

  /**
   * Initialize storage directories
   */
  private async initializeStorage(): Promise<void> {
    const dirs = [
      'systems',
      'risk-assessments',
      'model-cards',
      'transparency-reports',
      'bias-detections',
      'user-rights',
      'regulatory-reports'
    ].map(dir => path.join(this.storageBasePath, dir));

    for (const dir of dirs) {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
    }
  }

  /**
   * Register AI system
   */
  async registerAISystem(systemData: Omit<AISystem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const system: AISystem = {
      id: crypto.randomUUID(),
      ...systemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.systems.set(system.id, system);
    
    const systemFile = path.join(this.storageBasePath, 'systems', `${system.id}.json`);
    await writeFile(systemFile, JSON.stringify(system, null, 2));

    this.emit('systemRegistered', system);

    // Trigger mandatory compliance checks
    if (system.riskCategory === 'high') {
      await this.triggerMandatoryAssessments(system.id);
    }

    return system.id;
  }

  /**
   * Conduct risk assessment
   */
  async conductRiskAssessment(
    systemId: string,
    assessmentData: Omit<RiskAssessment, 'id' | 'systemId' | 'assessmentDate'>
  ): Promise<string> {
    const system = this.systems.get(systemId);
    if (!system) {
      throw new Error(`System ${systemId} not found`);
    }

    const assessment: RiskAssessment = {
      id: crypto.randomUUID(),
      systemId,
      assessmentDate: new Date().toISOString(),
      ...assessmentData
    };

    // Calculate overall risk score
    const overallRisk = this.calculateOverallRisk(assessment.riskFactors);
    
    // Update system risk category if assessment indicates higher risk
    if (overallRisk > 75 && system.riskCategory !== 'high') {
      system.riskCategory = 'high';
      system.updatedAt = new Date().toISOString();
      await this.updateSystem(system);
    }

    this.riskAssessments.set(assessment.id, assessment);
    
    const assessmentFile = path.join(this.storageBasePath, 'risk-assessments', `${assessment.id}.json`);
    await writeFile(assessmentFile, JSON.stringify(assessment, null, 2));

    this.emit('riskAssessmentCompleted', assessment);

    return assessment.id;
  }

  /**
   * Calculate overall risk score
   */
  private calculateOverallRisk(riskFactors: RiskFactor[]): number {
    if (riskFactors.length === 0) return 0;

    const totalRisk = riskFactors.reduce((sum, factor) => sum + factor.riskScore, 0);
    return totalRisk / riskFactors.length;
  }

  /**
   * Generate model card
   */
  async generateModelCard(
    systemId: string,
    modelData: Omit<ModelCard, 'id' | 'systemId' | 'generatedAt' | 'validUntil'>
  ): Promise<string> {
    const system = this.systems.get(systemId);
    if (!system) {
      throw new Error(`System ${systemId} not found`);
    }

    const modelCard: ModelCard = {
      id: crypto.randomUUID(),
      systemId,
      ...modelData,
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // Valid for 1 year
    };

    this.modelCards.set(modelCard.id, modelCard);
    
    const cardFile = path.join(this.storageBasePath, 'model-cards', `${modelCard.id}.json`);
    await writeFile(cardFile, JSON.stringify(modelCard, null, 2));

    this.emit('modelCardGenerated', modelCard);

    return modelCard.id;
  }

  /**
   * Perform bias detection
   */
  async performBiasDetection(
    systemId: string,
    testData: Omit<BiasDetection, 'id' | 'systemId' | 'testDate'>
  ): Promise<string> {
    const system = this.systems.get(systemId);
    if (!system) {
      throw new Error(`System ${systemId} not found`);
    }

    const biasTest: BiasDetection = {
      id: crypto.randomUUID(),
      systemId,
      testDate: new Date().toISOString(),
      ...testData
    };

    this.biasDetections.set(biasTest.id, biasTest);
    
    const testFile = path.join(this.storageBasePath, 'bias-detections', `${biasTest.id}.json`);
    await writeFile(testFile, JSON.stringify(biasTest, null, 2));

    // Check for significant bias and trigger alerts
    if (biasTest.results.overallBiasScore > 0.1) {
      this.emit('biasDetected', {
        systemId,
        testId: biasTest.id,
        biasScore: biasTest.results.overallBiasScore,
        severity: biasTest.results.overallBiasScore > 0.2 ? 'high' : 'medium'
      });
    }

    this.emit('biasTestCompleted', biasTest);

    return biasTest.id;
  }

  /**
   * Handle user rights requests
   */
  async handleUserRightsRequest(
    requestData: Omit<UserRights, 'id' | 'requestDate' | 'status' | 'escalated'>
  ): Promise<string> {
    const request: UserRights = {
      id: crypto.randomUUID(),
      requestDate: new Date().toISOString(),
      status: 'pending',
      escalated: false,
      ...requestData
    };

    this.userRights.set(request.id, request);
    
    const requestFile = path.join(this.storageBasePath, 'user-rights', `${request.id}.json`);
    await writeFile(requestFile, JSON.stringify(request, null, 2));

    this.emit('userRightsRequest', request);

    // Auto-escalate explanation requests for high-risk systems
    const system = this.systems.get(request.systemId);
    if (system?.riskCategory === 'high' && request.requestType === 'explanation') {
      request.escalated = true;
      await this.updateUserRightsRequest(request.id, { escalated: true });
    }

    return request.id;
  }

  /**
   * Update user rights request
   */
  async updateUserRightsRequest(
    requestId: string,
    updates: Partial<Pick<UserRights, 'status' | 'response' | 'responseDate' | 'escalated'>>
  ): Promise<void> {
    const request = this.userRights.get(requestId);
    if (!request) {
      throw new Error(`User rights request ${requestId} not found`);
    }

    Object.assign(request, updates);
    
    const requestFile = path.join(this.storageBasePath, 'user-rights', `${request.id}.json`);
    await writeFile(requestFile, JSON.stringify(request, null, 2));

    this.emit('userRightsRequestUpdated', request);
  }

  /**
   * Generate transparency report
   */
  async generateTransparencyReport(
    systemId: string,
    reportData: Omit<TransparencyReport, 'id' | 'systemId' | 'generatedAt'>
  ): Promise<string> {
    const system = this.systems.get(systemId);
    if (!system) {
      throw new Error(`System ${systemId} not found`);
    }

    const report: TransparencyReport = {
      id: crypto.randomUUID(),
      systemId,
      ...reportData,
      generatedAt: new Date().toISOString()
    };

    this.transparencyReports.set(report.id, report);
    
    const reportFile = path.join(this.storageBasePath, 'transparency-reports', `${report.id}.json`);
    await writeFile(reportFile, JSON.stringify(report, null, 2));

    this.emit('transparencyReportGenerated', report);

    return report.id;
  }

  /**
   * Generate regulatory report
   */
  async generateRegulatoryReport(
    reportType: RegulatoryReport['reportType'],
    systemIds: string[],
    reportingPeriod: { startDate: string; endDate: string },
    generatedBy: string
  ): Promise<string> {
    const report: RegulatoryReport = {
      id: crypto.randomUUID(),
      reportType,
      reportingPeriod,
      systems: systemIds,
      findings: await this.analyzeComplianceFindings(systemIds, reportingPeriod),
      recommendations: await this.generateComplianceRecommendations(systemIds),
      nextReportDue: this.calculateNextReportDate(reportType),
      submittedTo: this.getRequiredRegulatoryBodies(reportType),
      generatedBy,
      generatedAt: new Date().toISOString()
    };

    const reportFile = path.join(this.storageBasePath, 'regulatory-reports', `${report.id}.json`);
    await writeFile(reportFile, JSON.stringify(report, null, 2));

    this.emit('regulatoryReportGenerated', report);

    return report.id;
  }

  /**
   * Analyze compliance findings
   */
  private async analyzeComplianceFindings(
    systemIds: string[],
    period: { startDate: string; endDate: string }
  ): Promise<RegulatoryReport['findings']> {
    const findings: RegulatoryReport['findings'] = {
      complianceLevel: 'compliant',
      violations: [],
      riskAssessments: 0,
      incidentsReported: 0,
      correctiveActions: []
    };

    for (const systemId of systemIds) {
      const system = this.systems.get(systemId);
      if (!system) continue;

      // Check for recent risk assessments
      const assessments = Array.from(this.riskAssessments.values())
        .filter(a => a.systemId === systemId && 
                     a.assessmentDate >= period.startDate && 
                     a.assessmentDate <= period.endDate);
      
      findings.riskAssessments += assessments.length;

      // Check for high-risk systems without recent assessments
      if (system.riskCategory === 'high' && assessments.length === 0) {
        findings.violations.push(`High-risk system ${systemId} lacks required risk assessment`);
        findings.complianceLevel = 'partially_compliant';
      }

      // Check for bias detection
      const biasTests = Array.from(this.biasDetections.values())
        .filter(b => b.systemId === systemId && 
                     b.testDate >= period.startDate && 
                     b.testDate <= period.endDate);

      if (biasTests.some(test => test.results.overallBiasScore > 0.2)) {
        findings.violations.push(`System ${systemId} shows significant bias`);
        findings.correctiveActions.push(`Implement bias mitigation for system ${systemId}`);
      }
    }

    return findings;
  }

  /**
   * Generate compliance recommendations
   */
  private async generateComplianceRecommendations(systemIds: string[]): Promise<string[]> {
    const recommendations: string[] = [];

    for (const systemId of systemIds) {
      const system = this.systems.get(systemId);
      if (!system) continue;

      // Check for missing model cards
      const hasModelCard = Array.from(this.modelCards.values())
        .some(card => card.systemId === systemId);
      
      if (!hasModelCard && system.riskCategory === 'high') {
        recommendations.push(`Generate model card for high-risk system ${systemId}`);
      }

      // Check for outdated risk assessments
      const latestAssessment = Array.from(this.riskAssessments.values())
        .filter(a => a.systemId === systemId)
        .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime())[0];

      if (!latestAssessment || 
          new Date(latestAssessment.assessmentDate).getTime() < Date.now() - 365 * 24 * 60 * 60 * 1000) {
        recommendations.push(`Conduct updated risk assessment for system ${systemId}`);
      }

      // Check for pending user rights requests
      const pendingRequests = Array.from(this.userRights.values())
        .filter(r => r.systemId === systemId && r.status === 'pending');

      if (pendingRequests.length > 0) {
        recommendations.push(`Address ${pendingRequests.length} pending user rights requests for system ${systemId}`);
      }
    }

    return recommendations;
  }

  /**
   * Calculate next report date
   */
  private calculateNextReportDate(reportType: RegulatoryReport['reportType']): string {
    const now = new Date();
    switch (reportType) {
      case 'annual_transparency':
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString();
      case 'incident_report':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
      case 'bias_audit':
        return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(); // 6 months
      case 'conformity_assessment':
        return new Date(now.getFullYear() + 2, now.getMonth(), now.getDate()).toISOString(); // 2 years
      default:
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString();
    }
  }

  /**
   * Get required regulatory bodies
   */
  private getRequiredRegulatoryBodies(reportType: RegulatoryReport['reportType']): string[] {
    switch (reportType) {
      case 'annual_transparency':
        return ['European Commission', 'National AI Authority'];
      case 'incident_report':
        return ['National AI Authority', 'Data Protection Authority'];
      case 'bias_audit':
        return ['Equality Authority', 'National AI Authority'];
      case 'conformity_assessment':
        return ['Notified Body', 'European Commission'];
      default:
        return ['National AI Authority'];
    }
  }

  /**
   * Trigger mandatory assessments for high-risk systems
   */
  private async triggerMandatoryAssessments(systemId: string): Promise<void> {
    this.emit('mandatoryAssessmentRequired', {
      systemId,
      assessments: [
        'risk_assessment',
        'bias_detection',
        'model_card_generation',
        'transparency_reporting'
      ],
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
    });
  }

  /**
   * Update system information
   */
  private async updateSystem(system: AISystem): Promise<void> {
    this.systems.set(system.id, system);
    const systemFile = path.join(this.storageBasePath, 'systems', `${system.id}.json`);
    await writeFile(systemFile, JSON.stringify(system, null, 2));
    this.emit('systemUpdated', system);
  }

  /**
   * Get compliance dashboard data
   */
  async getComplianceDashboard(): Promise<{
    totalSystems: number;
    systemsByRisk: Record<string, number>;
    pendingAssessments: number;
    overdueReports: number;
    userRightsRequests: number;
    complianceScore: number;
  }> {
    const systemsByRisk = {
      unacceptable: 0,
      high: 0,
      limited: 0,
      minimal: 0
    };

    for (const system of this.systems.values()) {
      systemsByRisk[system.riskCategory]++;
    }

    const pendingRequests = Array.from(this.userRights.values())
      .filter(r => r.status === 'pending').length;

    // Calculate compliance score based on various factors
    const totalSystems = this.systems.size;
    const compliantSystems = Array.from(this.systems.values()).filter(system => {
      const hasRecentAssessment = Array.from(this.riskAssessments.values())
        .some(a => a.systemId === system.id && 
                   new Date(a.assessmentDate).getTime() > Date.now() - 365 * 24 * 60 * 60 * 1000);
      
      return hasRecentAssessment || system.riskCategory === 'minimal';
    }).length;

    const complianceScore = totalSystems > 0 ? Math.round((compliantSystems / totalSystems) * 100) : 100;

    return {
      totalSystems,
      systemsByRisk,
      pendingAssessments: 0, // Would calculate based on requirements
      overdueReports: 0, // Would calculate based on report due dates
      userRightsRequests: pendingRequests,
      complianceScore
    };
  }

  /**
   * Export compliance data
   */
  async exportComplianceData(format: 'json' | 'xml'): Promise<string> {
    const exportData = {
      systems: Array.from(this.systems.values()),
      riskAssessments: Array.from(this.riskAssessments.values()),
      modelCards: Array.from(this.modelCards.values()),
      biasDetections: Array.from(this.biasDetections.values()),
      userRights: Array.from(this.userRights.values()),
      transparencyReports: Array.from(this.transparencyReports.values()),
      exportedAt: new Date().toISOString()
    };

    const exportId = crypto.randomUUID();
    const exportFile = path.join(this.storageBasePath, `export-${exportId}.${format}`);

    if (format === 'json') {
      await writeFile(exportFile, JSON.stringify(exportData, null, 2));
    } else {
      // Would implement XML serialization
      await writeFile(exportFile, JSON.stringify(exportData, null, 2));
    }

    return exportFile;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.removeAllListeners();
    this.systems.clear();
    this.riskAssessments.clear();
    this.modelCards.clear();
    this.biasDetections.clear();
    this.userRights.clear();
    this.transparencyReports.clear();
  }
}

export default EUAIActCompliance; 