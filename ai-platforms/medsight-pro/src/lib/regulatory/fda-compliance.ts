'use client';

/**
 * FDA Class II Medical Device Software Compliance Framework
 * 
 * Implements FDA requirements for Class II medical device software including:
 * - 21 CFR Part 820 (Quality System Regulation)
 * - ISO 13485 (Quality Management Systems for Medical Devices)
 * - IEC 62304 (Medical Device Software - Software Life Cycle Processes)
 * - ISO 14971 (Risk Management for Medical Devices)
 * - FDA 510(k) Premarket Submission Requirements
 * - FDA Software as Medical Device (SaMD) Guidelines
 */

interface FDAClassification {
  deviceClass: 'I' | 'II' | 'III';
  riskLevel: 'low' | 'moderate' | 'high';
  predicate510k: string;
  productCode: string;
  regulationNumber: string;
  deviceName: string;
  intendedUse: string;
  indicationsForUse: string;
  contraindications: string[];
  warnings: string[];
  precautions: string[];
}

interface SoftwareLifecycleProcess {
  planning: {
    completed: boolean;
    documentation: string[];
    responsibleParty: string;
    approvalDate?: string;
  };
  requirements: {
    analysis: boolean;
    specification: boolean;
    verification: boolean;
    documentation: string[];
    traceability: boolean;
  };
  architecture: {
    design: boolean;
    verification: boolean;
    documentation: string[];
    riskAnalysis: boolean;
  };
  detailedDesign: {
    implementation: boolean;
    verification: boolean;
    documentation: string[];
    codeReview: boolean;
  };
  integration: {
    testing: boolean;
    verification: boolean;
    documentation: string[];
    bugTracking: boolean;
  };
  systemTesting: {
    verification: boolean;
    validation: boolean;
    documentation: string[];
    clinicalEvaluation: boolean;
  };
  release: {
    approval: boolean;
    documentation: string[];
    postMarketSurveillance: boolean;
    maintenance: boolean;
  };
}

interface RiskManagement {
  riskAnalysis: {
    hazards: FDARisk[];
    riskAcceptability: boolean;
    residualRisk: number;
    benefitRiskAnalysis: boolean;
  };
  riskControl: {
    measures: RiskControlMeasure[];
    verification: boolean;
    validation: boolean;
    effectiveness: number;
  };
  postMarketSurveillance: {
    monitoring: boolean;
    reporting: boolean;
    riskBenefitReassessment: boolean;
    correctiveActions: CorrectiveAction[];
  };
}

interface FDARisk {
  id: string;
  category: 'safety' | 'efficacy' | 'cybersecurity' | 'usability' | 'interoperability';
  description: string;
  hazard: string;
  harmSequence: string[];
  severity: 'negligible' | 'marginal' | 'critical' | 'catastrophic';
  probability: 'improbable' | 'remote' | 'occasional' | 'probable' | 'frequent';
  riskLevel: 'low' | 'medium' | 'high' | 'unacceptable';
  detectability: 'high' | 'medium' | 'low';
  riskNumber: number;
  mitigationRequired: boolean;
  status: 'identified' | 'analyzed' | 'controlled' | 'verified' | 'accepted';
}

interface RiskControlMeasure {
  id: string;
  riskId: string;
  type: 'design' | 'protective' | 'information';
  description: string;
  implementation: string;
  verification: {
    method: string;
    criteria: string;
    evidence: string[];
    completed: boolean;
  };
  validation: {
    method: string;
    criteria: string;
    evidence: string[];
    completed: boolean;
  };
  effectiveness: number; // 0-100%
  residualRisk: number;
}

interface CorrectiveAction {
  id: string;
  issueDescription: string;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  implementation: {
    responsible: string;
    targetDate: string;
    completionDate?: string;
    status: 'planned' | 'in-progress' | 'completed' | 'verified';
  };
  effectiveness: {
    verified: boolean;
    evidence: string[];
    followUpRequired: boolean;
  };
}

interface ClinicalEvaluation {
  clinicalData: {
    source: 'literature' | 'clinical-investigation' | 'post-market';
    studies: ClinicalStudy[];
    adequacy: boolean;
    relevance: boolean;
  };
  clinicalInvestigation: {
    required: boolean;
    protocol: string;
    ethics: boolean;
    informed: boolean;
    gcp: boolean; // Good Clinical Practice
  };
  benefitRiskAssessment: {
    benefits: string[];
    risks: string[];
    assessment: 'positive' | 'negative' | 'inconclusive';
    justification: string;
  };
  postMarketClinicalFollowUp: {
    required: boolean;
    plan: string;
    timeline: string;
  };
}

interface ClinicalStudy {
  id: string;
  title: string;
  objective: string;
  design: string;
  population: {
    size: number;
    inclusion: string[];
    exclusion: string[];
    demographics: any;
  };
  endpoints: {
    primary: string[];
    secondary: string[];
  };
  results: {
    efficacy: any;
    safety: any;
    conclusions: string;
  };
  limitations: string[];
  relevance: number; // 0-100%
}

interface QualityManagement {
  management: {
    responsibility: boolean;
    policy: boolean;
    objectives: boolean;
    review: boolean;
  };
  resource: {
    provision: boolean;
    humanResources: boolean;
    infrastructure: boolean;
    workEnvironment: boolean;
  };
  productRealization: {
    planning: boolean;
    customerProcesses: boolean;
    design: boolean;
    purchasing: boolean;
    production: boolean;
  };
  measurement: {
    monitoring: boolean;
    controlNonconforming: boolean;
    dataAnalysis: boolean;
    improvement: boolean;
  };
}

interface PostMarketSurveillance {
  vigilance: {
    adverseEvents: MedicalDeviceReport[];
    trending: boolean;
    reporting: boolean;
    investigation: boolean;
  };
  performanceStudies: {
    required: boolean;
    ongoing: boolean;
    results: any[];
  };
  fieldSafety: {
    notices: FieldSafetyNotice[];
    recalls: Recall[];
    corrections: Correction[];
  };
  periodicReporting: {
    frequency: string;
    nextReport: string;
    submissions: string[];
  };
}

interface MedicalDeviceReport {
  id: string;
  reportNumber: string;
  type: 'malfunction' | 'injury' | 'death' | 'other';
  description: string;
  deviceInformation: {
    manufacturer: string;
    model: string;
    serialNumber: string;
    version: string;
  };
  patientInformation: {
    age?: number;
    gender?: string;
    relevantHistory?: string;
    outcome: string;
  };
  investigation: {
    completed: boolean;
    findings: string;
    rootCause: string;
    correctiveActions: string[];
  };
  reportingTimeline: {
    occurrence: string;
    awareness: string;
    initialReport: string;
    followUpReports: string[];
  };
  regulatoryActions: {
    fdaNotified: boolean;
    notificationDate?: string;
    additionalReporting: boolean;
  };
}

interface FieldSafetyNotice {
  id: string;
  type: 'fsn' | 'recall' | 'correction';
  classification: 'I' | 'II' | 'III';
  reason: string;
  affectedDevices: string[];
  actions: string[];
  timeline: string;
  effectiveness: number;
}

interface Recall {
  id: string;
  recallNumber: string;
  classification: 'I' | 'II' | 'III';
  reason: string;
  affectedProducts: string[];
  distributionPattern: string;
  recommendedActions: string[];
  effectiveness: {
    checked: number;
    returned: number;
    percentage: number;
  };
}

interface Correction {
  id: string;
  issue: string;
  correctionAction: string;
  affectedProducts: string[];
  implementation: {
    method: string;
    timeline: string;
    verification: boolean;
  };
}

class FDAComplianceFramework {
  private static instance: FDAComplianceFramework;
  private classification: FDAClassification;
  private lifecycle: SoftwareLifecycleProcess;
  private riskManagement: RiskManagement;
  private qualityManagement: QualityManagement;
  private clinicalEvaluation: ClinicalEvaluation;
  private postMarketSurveillance: PostMarketSurveillance;

  private constructor() {
    this.initializeClassification();
    this.initializeLifecycle();
    this.initializeRiskManagement();
    this.initializeQualityManagement();
    this.initializeClinicalEvaluation();
    this.initializePostMarketSurveillance();
  }

  public static getInstance(): FDAComplianceFramework {
    if (!FDAComplianceFramework.instance) {
      FDAComplianceFramework.instance = new FDAComplianceFramework();
    }
    return FDAComplianceFramework.instance;
  }

  /**
   * 510(k) Premarket Submission Validation
   */
  public async validate510kSubmission(): Promise<{
    ready: boolean;
    completedSections: string[];
    missingRequirements: string[];
    complianceScore: number;
  }> {
    const requirements = [
      { section: 'Device Description', completed: this.validateDeviceDescription() },
      { section: 'Indications for Use', completed: this.validateIndicationsForUse() },
      { section: 'Substantial Equivalence', completed: this.validateSubstantialEquivalence() },
      { section: 'Performance Data', completed: this.validatePerformanceData() },
      { section: 'Software Documentation', completed: this.validateSoftwareDocumentation() },
      { section: 'Risk Analysis', completed: this.validateRiskAnalysis() },
      { section: 'Clinical Data', completed: this.validateClinicalData() },
      { section: 'Labeling', completed: this.validateLabeling() },
      { section: 'Quality System', completed: this.validateQualitySystem() },
      { section: 'Cybersecurity', completed: this.validateCybersecurity() }
    ];

    const completedSections = requirements.filter(req => req.completed).map(req => req.section);
    const missingRequirements = requirements.filter(req => !req.completed).map(req => req.section);
    const complianceScore = Math.round((completedSections.length / requirements.length) * 100);

    return {
      ready: missingRequirements.length === 0,
      completedSections,
      missingRequirements,
      complianceScore
    };
  }

  /**
   * IEC 62304 Software Lifecycle Compliance
   */
  public async validateSoftwareLifecycle(): Promise<{
    processCompliance: boolean;
    completedPhases: string[];
    missingActivities: string[];
    documentationComplete: boolean;
  }> {
    const phases = [
      { name: 'Planning', completed: this.lifecycle.planning.completed },
      { name: 'Requirements Analysis', completed: this.lifecycle.requirements.analysis },
      { name: 'Architecture Design', completed: this.lifecycle.architecture.design },
      { name: 'Detailed Design', completed: this.lifecycle.detailedDesign.implementation },
      { name: 'Integration Testing', completed: this.lifecycle.integration.testing },
      { name: 'System Testing', completed: this.lifecycle.systemTesting.verification },
      { name: 'Release', completed: this.lifecycle.release.approval }
    ];

    const completedPhases = phases.filter(phase => phase.completed).map(phase => phase.name);
    const missingActivities = phases.filter(phase => !phase.completed).map(phase => phase.name);

    const documentationComplete = this.validateLifecycleDocumentation();

    return {
      processCompliance: missingActivities.length === 0,
      completedPhases,
      missingActivities,
      documentationComplete
    };
  }

  /**
   * ISO 14971 Risk Management Compliance
   */
  public async validateRiskManagement(): Promise<{
    riskAnalysisComplete: boolean;
    acceptableRisk: boolean;
    controlMeasuresImplemented: boolean;
    residualRiskAcceptable: boolean;
    postMarketMonitoring: boolean;
    complianceScore: number;
  }> {
    const riskAnalysisComplete = this.riskManagement.riskAnalysis.hazards.length > 0 &&
                                this.riskManagement.riskAnalysis.riskAcceptability;

    const acceptableRisk = this.riskManagement.riskAnalysis.residualRisk <= 5; // Threshold

    const controlMeasuresImplemented = this.riskManagement.riskControl.measures.every(
      measure => measure.verification.completed && measure.validation.completed
    );

    const residualRiskAcceptable = this.riskManagement.riskControl.effectiveness >= 95;

    const postMarketMonitoring = this.riskManagement.postMarketSurveillance.monitoring;

    const criteria = [
      riskAnalysisComplete,
      acceptableRisk,
      controlMeasuresImplemented,
      residualRiskAcceptable,
      postMarketMonitoring
    ];

    const complianceScore = Math.round((criteria.filter(Boolean).length / criteria.length) * 100);

    return {
      riskAnalysisComplete,
      acceptableRisk,
      controlMeasuresImplemented,
      residualRiskAcceptable,
      postMarketMonitoring,
      complianceScore
    };
  }

  /**
   * Medical Device Reporting (MDR) Implementation
   */
  public async reportMedicalDeviceEvent(event: {
    type: 'malfunction' | 'injury' | 'death' | 'other';
    description: string;
    deviceInfo: any;
    patientInfo: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<{ reportId: string; reportingRequired: boolean; timeline: string }> {
    const reportId = this.generateReportId();
    
    // Determine reporting requirements based on event type and severity
    const reportingRequired = this.determineReportingRequirement(event.type, event.severity);
    
    // Calculate reporting timeline
    const timeline = this.getReportingTimeline(event.type, event.severity);

    const mdr: MedicalDeviceReport = {
      id: reportId,
      reportNumber: reportId,
      type: event.type,
      description: event.description,
      deviceInformation: event.deviceInfo,
      patientInformation: event.patientInfo,
      investigation: {
        completed: false,
        findings: '',
        rootCause: '',
        correctiveActions: []
      },
      reportingTimeline: {
        occurrence: new Date().toISOString(),
        awareness: new Date().toISOString(),
        initialReport: '',
        followUpReports: []
      },
      regulatoryActions: {
        fdaNotified: false,
        additionalReporting: false
      }
    };

    // Add to surveillance system
    this.postMarketSurveillance.vigilance.adverseEvents.push(mdr);

    // Trigger investigation if required
    if (reportingRequired) {
      await this.initiateEventInvestigation(reportId);
    }

    return { reportId, reportingRequired, timeline };
  }

  /**
   * Software Change Control (21 CFR 820.70)
   */
  public async implementChangeControl(change: {
    description: string;
    reason: string;
    impact: 'minor' | 'major';
    affectedModules: string[];
    testingRequired: boolean;
  }): Promise<{ approved: boolean; changeId: string; requirements: string[] }> {
    const changeId = this.generateChangeId();
    
    const requirements = [];

    // Determine change control requirements based on impact
    if (change.impact === 'major') {
      requirements.push('Risk analysis update required');
      requirements.push('Clinical evaluation required');
      requirements.push('510(k) modification may be required');
      requirements.push('Full verification and validation');
    } else {
      requirements.push('Impact assessment required');
      requirements.push('Verification testing required');
      requirements.push('Documentation update required');
    }

    // Assess if change affects device safety or effectiveness
    const safetyImpact = this.assessSafetyImpact(change);
    if (safetyImpact) {
      requirements.push('FDA notification required');
      requirements.push('Risk-benefit analysis update');
    }

    // Automated approval for minor changes with proper documentation
    const approved = change.impact === 'minor' && change.testingRequired;

    return { approved, changeId, requirements };
  }

  /**
   * Cybersecurity Requirements (FDA Guidance)
   */
  public async validateCybersecurityRequirements(): Promise<{
    designControls: boolean;
    riskAssessment: boolean;
    securityUpdates: boolean;
    incidentResponse: boolean;
    userAccess: boolean;
    dataProtection: boolean;
    complianceScore: number;
  }> {
    const cybersecurityControls = {
      designControls: this.validateSecurityByDesign(),
      riskAssessment: this.validateCybersecurityRiskAssessment(),
      securityUpdates: this.validateSecurityUpdateProcess(),
      incidentResponse: this.validateIncidentResponsePlan(),
      userAccess: this.validateUserAccessControls(),
      dataProtection: this.validateDataProtectionMeasures()
    };

    const scores = Object.values(cybersecurityControls);
    const complianceScore = Math.round((scores.filter(Boolean).length / scores.length) * 100);

    return { ...cybersecurityControls, complianceScore };
  }

  /**
   * Quality Management System Validation (ISO 13485)
   */
  public async validateQualityManagementSystem(): Promise<{
    managementResponsibility: boolean;
    resourceManagement: boolean;
    productRealization: boolean;
    measurementAnalysis: boolean;
    overallCompliance: number;
  }> {
    const qmsElements = {
      managementResponsibility: this.qualityManagement.management.responsibility &&
                               this.qualityManagement.management.policy &&
                               this.qualityManagement.management.objectives,
      resourceManagement: this.qualityManagement.resource.provision &&
                          this.qualityManagement.resource.humanResources &&
                          this.qualityManagement.resource.infrastructure,
      productRealization: this.qualityManagement.productRealization.planning &&
                         this.qualityManagement.productRealization.design &&
                         this.qualityManagement.productRealization.production,
      measurementAnalysis: this.qualityManagement.measurement.monitoring &&
                          this.qualityManagement.measurement.dataAnalysis &&
                          this.qualityManagement.measurement.improvement
    };

    const scores = Object.values(qmsElements);
    const overallCompliance = Math.round((scores.filter(Boolean).length / scores.length) * 100);

    return { ...qmsElements, overallCompliance };
  }

  // Helper methods for validation
  private validateDeviceDescription(): boolean {
    return this.classification.deviceName !== '' && this.classification.intendedUse !== '';
  }

  private validateIndicationsForUse(): boolean {
    return this.classification.indicationsForUse !== '';
  }

  private validateSubstantialEquivalence(): boolean {
    return this.classification.predicate510k !== '';
  }

  private validatePerformanceData(): boolean {
    return this.lifecycle.systemTesting.verification && this.lifecycle.systemTesting.validation;
  }

  private validateSoftwareDocumentation(): boolean {
    return this.lifecycle.planning.documentation.length > 0 &&
           this.lifecycle.requirements.documentation.length > 0 &&
           this.lifecycle.architecture.documentation.length > 0;
  }

  private validateRiskAnalysis(): boolean {
    return this.riskManagement.riskAnalysis.hazards.length > 0;
  }

  private validateClinicalData(): boolean {
    return this.clinicalEvaluation.clinicalData.adequacy;
  }

  private validateLabeling(): boolean {
    return this.classification.warnings.length > 0 && this.classification.precautions.length > 0;
  }

  private validateQualitySystem(): boolean {
    return this.qualityManagement.management.responsibility;
  }

  private validateCybersecurity(): boolean {
    return this.validateSecurityByDesign() && this.validateCybersecurityRiskAssessment();
  }

  private validateLifecycleDocumentation(): boolean {
    return this.lifecycle.planning.documentation.length > 0 &&
           this.lifecycle.requirements.documentation.length > 0 &&
           this.lifecycle.architecture.documentation.length > 0 &&
           this.lifecycle.detailedDesign.documentation.length > 0;
  }

  private validateSecurityByDesign(): boolean {
    // Implementation would validate security controls are built into the design
    return true;
  }

  private validateCybersecurityRiskAssessment(): boolean {
    // Implementation would validate cybersecurity risk assessment
    return true;
  }

  private validateSecurityUpdateProcess(): boolean {
    // Implementation would validate security update process
    return true;
  }

  private validateIncidentResponsePlan(): boolean {
    // Implementation would validate incident response plan
    return true;
  }

  private validateUserAccessControls(): boolean {
    // Implementation would validate user access controls
    return true;
  }

  private validateDataProtectionMeasures(): boolean {
    // Implementation would validate data protection measures
    return true;
  }

  private determineReportingRequirement(type: string, severity: string): boolean {
    // Death or serious injury always requires reporting
    if (type === 'death' || type === 'injury') return true;
    
    // Malfunction that could lead to death or serious injury
    if (type === 'malfunction' && (severity === 'high' || severity === 'critical')) return true;
    
    return false;
  }

  private getReportingTimeline(type: string, severity: string): string {
    if (type === 'death') return '24 hours';
    if (type === 'injury' && severity === 'critical') return '24 hours';
    if (type === 'malfunction' && severity === 'critical') return '24 hours';
    return '30 days';
  }

  private assessSafetyImpact(change: any): boolean {
    // Implementation would assess if change impacts safety or effectiveness
    return change.impact === 'major';
  }

  private async initiateEventInvestigation(reportId: string): Promise<void> {
    // Implementation would initiate investigation process
    console.log(`Initiating investigation for report ${reportId}`);
  }

  private generateReportId(): string {
    return `MDR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChangeId(): string {
    return `CHG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialization methods
  private initializeClassification(): void {
    this.classification = {
      deviceClass: 'II',
      riskLevel: 'moderate',
      predicate510k: 'K123456',
      productCode: 'MUK',
      regulationNumber: '892.2050',
      deviceName: 'Medical Image Analysis Software',
      intendedUse: 'Computer-aided detection and analysis of medical images',
      indicationsForUse: 'For use by qualified healthcare professionals for analysis of medical images',
      contraindications: ['Not for use in emergency situations', 'Not for pediatric patients under 2 years'],
      warnings: ['Device output should not be the sole basis for clinical decisions'],
      precautions: ['Requires appropriate training', 'Regular calibration required']
    };
  }

  private initializeLifecycle(): void {
    this.lifecycle = {
      planning: {
        completed: true,
        documentation: ['Software Development Plan', 'Risk Management Plan'],
        responsibleParty: 'Software Team Lead',
        approvalDate: '2024-01-01'
      },
      requirements: {
        analysis: true,
        specification: true,
        verification: true,
        documentation: ['Software Requirements Specification'],
        traceability: true
      },
      architecture: {
        design: true,
        verification: true,
        documentation: ['Software Architecture Document'],
        riskAnalysis: true
      },
      detailedDesign: {
        implementation: true,
        verification: true,
        documentation: ['Detailed Design Document'],
        codeReview: true
      },
      integration: {
        testing: true,
        verification: true,
        documentation: ['Integration Test Plan', 'Integration Test Report'],
        bugTracking: true
      },
      systemTesting: {
        verification: true,
        validation: true,
        documentation: ['System Test Plan', 'System Test Report'],
        clinicalEvaluation: true
      },
      release: {
        approval: false,
        documentation: ['Release Notes', 'Installation Guide'],
        postMarketSurveillance: true,
        maintenance: true
      }
    };
  }

  private initializeRiskManagement(): void {
    this.riskManagement = {
      riskAnalysis: {
        hazards: [],
        riskAcceptability: false,
        residualRisk: 5,
        benefitRiskAnalysis: false
      },
      riskControl: {
        measures: [],
        verification: false,
        validation: false,
        effectiveness: 90
      },
      postMarketSurveillance: {
        monitoring: true,
        reporting: true,
        riskBenefitReassessment: false,
        correctiveActions: []
      }
    };
  }

  private initializeQualityManagement(): void {
    this.qualityManagement = {
      management: {
        responsibility: true,
        policy: true,
        objectives: true,
        review: true
      },
      resource: {
        provision: true,
        humanResources: true,
        infrastructure: true,
        workEnvironment: true
      },
      productRealization: {
        planning: true,
        customerProcesses: true,
        design: true,
        purchasing: true,
        production: true
      },
      measurement: {
        monitoring: true,
        controlNonconforming: true,
        dataAnalysis: true,
        improvement: true
      }
    };
  }

  private initializeClinicalEvaluation(): void {
    this.clinicalEvaluation = {
      clinicalData: {
        source: 'literature',
        studies: [],
        adequacy: false,
        relevance: false
      },
      clinicalInvestigation: {
        required: false,
        protocol: '',
        ethics: true,
        informed: true,
        gcp: true
      },
      benefitRiskAssessment: {
        benefits: [],
        risks: [],
        assessment: 'inconclusive',
        justification: ''
      },
      postMarketClinicalFollowUp: {
        required: false,
        plan: '',
        timeline: ''
      }
    };
  }

  private initializePostMarketSurveillance(): void {
    this.postMarketSurveillance = {
      vigilance: {
        adverseEvents: [],
        trending: true,
        reporting: true,
        investigation: true
      },
      performanceStudies: {
        required: false,
        ongoing: false,
        results: []
      },
      fieldSafety: {
        notices: [],
        recalls: [],
        corrections: []
      },
      periodicReporting: {
        frequency: 'annual',
        nextReport: '2025-01-01',
        submissions: []
      }
    };
  }
}

export default FDAComplianceFramework;
export type { 
  FDAClassification, 
  SoftwareLifecycleProcess, 
  RiskManagement, 
  FDARisk, 
  MedicalDeviceReport,
  QualityManagement 
}; 