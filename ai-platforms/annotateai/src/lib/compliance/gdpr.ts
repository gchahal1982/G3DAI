export interface GDPRDataRequest {
  id: string;
  userId: string;
  type: 'export' | 'delete' | 'rectification' | 'portability';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  processingNotes?: string;
  verificationMethod: 'email' | 'identity_document' | 'security_questions';
  verificationCompleted: boolean;
  legalBasis?: string;
  dataCategories: string[];
  retentionPeriod?: number;
  autoProcessing: boolean;
  priority: 'normal' | 'urgent';
}

export interface UserConsent {
  id: string;
  userId: string;
  purpose: 'analytics' | 'marketing' | 'functional' | 'performance' | 'necessary';
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  version: string;
  ipAddress: string;
  userAgent: string;
  method: 'explicit' | 'implicit' | 'opt_in' | 'opt_out';
  evidence: {
    consentText: string;
    checkboxes: Record<string, boolean>;
    timestamp: string;
  };
}

export interface DataProcessingRecord {
  id: string;
  userId: string;
  dataType: 'personal' | 'sensitive' | 'biometric' | 'location' | 'annotation';
  processingPurpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  dataSource: 'user_input' | 'automated' | 'third_party' | 'inferred';
  recipients: string[];
  retentionPeriod: number;
  securityMeasures: string[];
  transferredOutsideEU: boolean;
  transferMechanism?: string;
  timestamp: string;
  processedBy: string;
}

export interface PrivacySettings {
  userId: string;
  dataMinimization: boolean;
  analyticsOptOut: boolean;
  marketingOptOut: boolean;
  dataRetentionCustom?: number;
  pseudonymization: boolean;
  rightToBeIndexed: boolean;
  profileVisible: boolean;
  activityTracking: boolean;
  locationTracking: boolean;
  updatedAt: string;
}

export class GDPRComplianceManager {
  private dataRetentionPolicies: Map<string, number> = new Map();
  private consentVersions: Map<string, string> = new Map();
  private dataProcessingLog: DataProcessingRecord[] = [];
  private pendingRequests: Map<string, GDPRDataRequest> = new Map();

  constructor() {
    this.initializeRetentionPolicies();
    this.initializeConsentVersions();
  }

  private initializeRetentionPolicies(): void {
    // Data retention periods in days
    this.dataRetentionPolicies.set('user_profiles', 2555); // 7 years
    this.dataRetentionPolicies.set('annotations', 1825); // 5 years
    this.dataRetentionPolicies.set('projects', 1825); // 5 years
    this.dataRetentionPolicies.set('audit_logs', 2555); // 7 years
    this.dataRetentionPolicies.set('analytics_data', 730); // 2 years
    this.dataRetentionPolicies.set('marketing_data', 365); // 1 year
    this.dataRetentionPolicies.set('session_data', 90); // 3 months
    this.dataRetentionPolicies.set('temporary_files', 30); // 1 month
  }

  private initializeConsentVersions(): void {
    this.consentVersions.set('privacy_policy', '2024.1.0');
    this.consentVersions.set('cookie_policy', '2024.1.0');
    this.consentVersions.set('terms_of_service', '2024.1.0');
    this.consentVersions.set('data_processing', '2024.1.0');
  }

  // Right to Access (Article 15)
  public async exportUserData(userId: string, requestId: string): Promise<any> {
    const request = this.pendingRequests.get(requestId);
    if (!request || !request.verificationCompleted) {
      throw new Error('Request not found or verification not completed');
    }

    this.updateRequestStatus(requestId, 'processing');

    try {
      const userData = await this.collectUserData(userId, request.dataCategories);
      const exportData = {
        exportDate: new Date().toISOString(),
        userId,
        requestId,
        dataCategories: request.dataCategories,
        data: userData,
        metadata: {
          retentionPolicies: this.getApplicableRetentionPolicies(userId),
          consentHistory: await this.getConsentHistory(userId),
          processingActivities: this.getProcessingActivities(userId),
          dataFlows: await this.getDataFlows(userId)
        }
      };

      this.updateRequestStatus(requestId, 'completed');
      this.logDataProcessing({
        userId,
        dataType: 'personal',
        processingPurpose: 'data_export_gdpr_article_15',
        legalBasis: 'legal_obligation',
        dataSource: 'user_input',
        recipients: ['data_subject'],
        retentionPeriod: 30,
        securityMeasures: ['encryption', 'access_logging'],
        transferredOutsideEU: false,
        processedBy: 'gdpr_compliance_system'
      });

      return exportData;
    } catch (error) {
      this.updateRequestStatus(requestId, 'failed', `Export failed: ${error}`);
      throw error;
    }
  }

  // Right to Erasure (Article 17)
  public async deleteUserData(userId: string, requestId: string, retainLegal: boolean = true): Promise<void> {
    const request = this.pendingRequests.get(requestId);
    if (!request || !request.verificationCompleted) {
      throw new Error('Request not found or verification not completed');
    }

    this.updateRequestStatus(requestId, 'processing');

    try {
      // Check for legal obligations to retain data
      const legalRetentionRequirements = await this.checkLegalRetentionRequirements(userId);
      
      if (legalRetentionRequirements.length > 0 && retainLegal) {
        await this.pseudonymizeUserData(userId, legalRetentionRequirements);
      } else {
        await this.deleteUserDataCompletely(userId);
      }

      // Notify all systems about data deletion
      await this.broadcastDataDeletion(userId);

      this.updateRequestStatus(requestId, 'completed');
      this.logDataProcessing({
        userId,
        dataType: 'personal',
        processingPurpose: 'data_deletion_gdpr_article_17',
        legalBasis: 'legal_obligation',
        dataSource: 'user_input',
        recipients: ['internal_systems'],
        retentionPeriod: 2555, // Keep deletion log for 7 years
        securityMeasures: ['secure_deletion', 'audit_logging'],
        transferredOutsideEU: false,
        processedBy: 'gdpr_compliance_system'
      });

    } catch (error) {
      this.updateRequestStatus(requestId, 'failed', `Deletion failed: ${error}`);
      throw error;
    }
  }

  // Right to Rectification (Article 16)
  public async rectifyUserData(userId: string, corrections: Record<string, any>, requestId: string): Promise<void> {
    const request = this.pendingRequests.get(requestId);
    if (!request || !request.verificationCompleted) {
      throw new Error('Request not found or verification not completed');
    }

    this.updateRequestStatus(requestId, 'processing');

    try {
      const auditTrail = {
        userId,
        corrections,
        requestId,
        timestamp: new Date().toISOString(),
        previousValues: await this.getCurrentUserData(userId, Object.keys(corrections))
      };

      await this.updateUserData(userId, corrections);
      await this.logRectification(auditTrail);

      this.updateRequestStatus(requestId, 'completed');
      this.logDataProcessing({
        userId,
        dataType: 'personal',
        processingPurpose: 'data_rectification_gdpr_article_16',
        legalBasis: 'legal_obligation',
        dataSource: 'user_input',
        recipients: ['internal_systems'],
        retentionPeriod: 2555,
        securityMeasures: ['audit_logging', 'version_control'],
        transferredOutsideEU: false,
        processedBy: 'gdpr_compliance_system'
      });

    } catch (error) {
      this.updateRequestStatus(requestId, 'failed', `Rectification failed: ${error}`);
      throw error;
    }
  }

  // Right to Data Portability (Article 20)
  public async exportPortableData(userId: string, format: 'json' | 'csv' | 'xml' = 'json'): Promise<any> {
    const portableData = await this.collectPortableUserData(userId);
    
    switch (format) {
      case 'csv':
        return this.convertToCSV(portableData);
      case 'xml':
        return this.convertToXML(portableData);
      default:
        return portableData;
    }
  }

  // Consent Management
  public async recordConsent(consent: Omit<UserConsent, 'id'>): Promise<string> {
    const consentId = this.generateId();
    const consentRecord: UserConsent = {
      id: consentId,
      ...consent,
      version: this.consentVersions.get('data_processing') || '1.0.0'
    };

    await this.storeConsent(consentRecord);
    
    this.logDataProcessing({
      userId: consent.userId,
      dataType: 'personal',
      processingPurpose: 'consent_management',
      legalBasis: 'consent',
      dataSource: 'user_input',
      recipients: ['internal_systems'],
      retentionPeriod: 2555,
      securityMeasures: ['encryption', 'integrity_protection'],
      transferredOutsideEU: false,
      processedBy: 'consent_management_system'
    });

    return consentId;
  }

  public async revokeConsent(userId: string, purpose: string): Promise<void> {
    const consent = await this.getActiveConsent(userId, purpose);
    if (consent) {
      consent.granted = false;
      consent.revokedAt = new Date().toISOString();
      await this.storeConsent(consent);

      // Stop processing based on revoked consent
      await this.processConsentRevocation(userId, purpose);
    }
  }

  public async getConsentStatus(userId: string): Promise<Record<string, UserConsent | null>> {
    const purposes = ['analytics', 'marketing', 'functional', 'performance', 'necessary'];
    const consentStatus: Record<string, UserConsent | null> = {};

    for (const purpose of purposes) {
      consentStatus[purpose] = await this.getActiveConsent(userId, purpose);
    }

    return consentStatus;
  }

  // Data Retention Management
  public async checkDataRetention(): Promise<any[]> {
    const retentionActions = [];
    
    for (const [dataType, retentionDays] of this.dataRetentionPolicies) {
      const expiredData = await this.findExpiredData(dataType, retentionDays);
      
      if (expiredData.length > 0) {
        retentionActions.push({
          dataType,
          expiredCount: expiredData.length,
          action: 'delete_or_anonymize',
          data: expiredData
        });
      }
    }

    return retentionActions;
  }

  public async enforceDataRetention(): Promise<void> {
    const retentionActions = await this.checkDataRetention();
    
    for (const action of retentionActions) {
      switch (action.dataType) {
        case 'analytics_data':
        case 'marketing_data':
          await this.deleteData(action.data);
          break;
        case 'audit_logs':
          await this.archiveData(action.data);
          break;
        default:
          await this.anonymizeData(action.data);
      }
    }
  }

  // Privacy Settings Management
  public async updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): Promise<void> {
    const currentSettings = await this.getPrivacySettings(userId);
    const updatedSettings: PrivacySettings = {
      ...currentSettings,
      ...settings,
      userId,
      updatedAt: new Date().toISOString()
    };

    await this.storePrivacySettings(updatedSettings);
    await this.applyPrivacySettings(userId, updatedSettings);
  }

  public async getPrivacySettings(userId: string): Promise<PrivacySettings> {
    // Default privacy-first settings
    const defaultSettings: PrivacySettings = {
      userId,
      dataMinimization: true,
      analyticsOptOut: false,
      marketingOptOut: false,
      pseudonymization: false,
      rightToBeIndexed: true,
      profileVisible: true,
      activityTracking: true,
      locationTracking: false,
      updatedAt: new Date().toISOString()
    };

    return await this.loadPrivacySettings(userId) || defaultSettings;
  }

  // Cookie Consent Management
  public generateCookieConsentBanner(): any {
    return {
      version: this.consentVersions.get('cookie_policy'),
      categories: {
        necessary: {
          name: 'Strictly Necessary',
          description: 'Essential for the website to function',
          required: true,
          cookies: ['session_id', 'csrf_token', 'auth_token']
        },
        functional: {
          name: 'Functional',
          description: 'Remember your preferences and settings',
          required: false,
          cookies: ['user_preferences', 'language', 'theme']
        },
        analytics: {
          name: 'Analytics',
          description: 'Help us understand how you use our website',
          required: false,
          cookies: ['_ga', '_gid', 'analytics_session']
        },
        marketing: {
          name: 'Marketing',
          description: 'Show you relevant ads and content',
          required: false,
          cookies: ['marketing_id', 'ad_preferences', 'campaign_tracking']
        }
      },
      consentMethods: ['explicit', 'banner', 'settings_page'],
      retentionPeriod: 365, // Cookie consent valid for 1 year
      withdrawalMethods: ['settings_page', 'email_link']
    };
  }

  // Breach Notification
  public async reportDataBreach(breach: {
    description: string;
    affectedUsers: string[];
    dataTypes: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    containmentActions: string[];
    notificationRequired: boolean;
  }): Promise<void> {
    const breachId = this.generateId();
    const breachRecord = {
      id: breachId,
      ...breach,
      detectedAt: new Date().toISOString(),
      reportedAt: new Date().toISOString(),
      status: 'reported'
    };

    await this.storeBreachRecord(breachRecord);

    // Notify authorities within 72 hours if required
    if (breach.notificationRequired) {
      await this.scheduleAuthorityNotification(breachId);
    }

    // Notify affected users without undue delay
    if (breach.severity === 'high' || breach.severity === 'critical') {
      await this.notifyAffectedUsers(breach.affectedUsers, breachRecord);
    }
  }

  // Data Processing Impact Assessment (DPIA)
  public async conductDPIA(processing: {
    purpose: string;
    dataTypes: string[];
    subjects: string[];
    recipients: string[];
    retentionPeriod: number;
    securityMeasures: string[];
  }): Promise<any> {
    const riskAssessment = await this.assessPrivacyRisks(processing);
    const mitigationMeasures = await this.identifyMitigationMeasures(riskAssessment);
    
    return {
      processing,
      riskAssessment,
      mitigationMeasures,
      recommendation: riskAssessment.overallRisk === 'high' ? 'consultation_required' : 'proceed_with_measures',
      conductedAt: new Date().toISOString(),
      reviewer: 'data_protection_officer'
    };
  }

  // Private helper methods
  private async collectUserData(userId: string, categories: string[]): Promise<any> {
    const data: any = {};
    
    for (const category of categories) {
      switch (category) {
        case 'profile':
          data.profile = await this.getUserProfile(userId);
          break;
        case 'annotations':
          data.annotations = await this.getUserAnnotations(userId);
          break;
        case 'projects':
          data.projects = await this.getUserProjects(userId);
          break;
        case 'activity':
          data.activity = await this.getUserActivity(userId);
          break;
        case 'preferences':
          data.preferences = await this.getUserPreferences(userId);
          break;
      }
    }
    
    return data;
  }

  private async deleteUserDataCompletely(userId: string): Promise<void> {
    // Implementation would delete all user data across all systems
    await this.deleteFromDatabase(userId);
    await this.deleteFromFileStorage(userId);
    await this.deleteFromCache(userId);
    await this.deleteFromSearchIndexes(userId);
    await this.deleteFromAnalytics(userId);
  }

  private async pseudonymizeUserData(userId: string, exceptions: string[]): Promise<void> {
    // Replace personal identifiers with pseudonyms while preserving data utility
    const pseudonym = this.generatePseudonym(userId);
    await this.replacePii(userId, pseudonym, exceptions);
  }

  private updateRequestStatus(requestId: string, status: GDPRDataRequest['status'], notes?: string): void {
    const request = this.pendingRequests.get(requestId);
    if (request) {
      request.status = status;
      if (notes) request.processingNotes = notes;
      if (status === 'completed') request.completedAt = new Date().toISOString();
      this.pendingRequests.set(requestId, request);
    }
  }

  private logDataProcessing(record: Omit<DataProcessingRecord, 'id' | 'timestamp'>): void {
    const processingRecord: DataProcessingRecord = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...record
    };
    this.dataProcessingLog.push(processingRecord);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Placeholder methods for actual database/storage operations
  private async getUserProfile(userId: string): Promise<any> { return {}; }
  private async getUserAnnotations(userId: string): Promise<any> { return []; }
  private async getUserProjects(userId: string): Promise<any> { return []; }
  private async getUserActivity(userId: string): Promise<any> { return []; }
  private async getUserPreferences(userId: string): Promise<any> { return {}; }
  private async deleteFromDatabase(userId: string): Promise<void> { }
  private async deleteFromFileStorage(userId: string): Promise<void> { }
  private async deleteFromCache(userId: string): Promise<void> { }
  private async deleteFromSearchIndexes(userId: string): Promise<void> { }
  private async deleteFromAnalytics(userId: string): Promise<void> { }
  private async storeConsent(consent: UserConsent): Promise<void> { }
  private async getActiveConsent(userId: string, purpose: string): Promise<UserConsent | null> { return null; }
  private async storePrivacySettings(settings: PrivacySettings): Promise<void> { }
  private async loadPrivacySettings(userId: string): Promise<PrivacySettings | null> { return null; }
  private async findExpiredData(dataType: string, retentionDays: number): Promise<any[]> { return []; }
  private async deleteData(data: any[]): Promise<void> { }
  private async archiveData(data: any[]): Promise<void> { }
  private async anonymizeData(data: any[]): Promise<void> { }
  private generatePseudonym(userId: string): string { return `pseudo_${this.generateId()}`; }
  private async replacePii(userId: string, pseudonym: string, exceptions: string[]): Promise<void> { }
  private async checkLegalRetentionRequirements(userId: string): Promise<string[]> { return []; }
  private async broadcastDataDeletion(userId: string): Promise<void> { }
  private async getCurrentUserData(userId: string, fields: string[]): Promise<any> { return {}; }
  private async updateUserData(userId: string, corrections: Record<string, any>): Promise<void> { }
  private async logRectification(auditTrail: any): Promise<void> { }
  private async collectPortableUserData(userId: string): Promise<any> { return {}; }
  private convertToCSV(data: any): string { return ''; }
  private convertToXML(data: any): string { return ''; }
  private async processConsentRevocation(userId: string, purpose: string): Promise<void> { }
  private async applyPrivacySettings(userId: string, settings: PrivacySettings): Promise<void> { }
  private async storeBreachRecord(breach: any): Promise<void> { }
  private async scheduleAuthorityNotification(breachId: string): Promise<void> { }
  private async notifyAffectedUsers(userIds: string[], breach: any): Promise<void> { }
  private async assessPrivacyRisks(processing: any): Promise<any> { return { overallRisk: 'medium' }; }
  private async identifyMitigationMeasures(risks: any): Promise<any> { return []; }
  private async getConsentHistory(userId: string): Promise<any[]> { return []; }
  private getProcessingActivities(userId: string): DataProcessingRecord[] { 
    return this.dataProcessingLog.filter(record => record.userId === userId); 
  }
  private async getDataFlows(userId: string): Promise<any[]> { return []; }
  private getApplicableRetentionPolicies(userId: string): Record<string, number> {
    return Object.fromEntries(this.dataRetentionPolicies);
  }
}

// Factory function
export function createGDPRManager(): GDPRComplianceManager {
  return new GDPRComplianceManager();
}

// Utility functions for GDPR compliance
export const gdprUtils = {
  validateEmailForDeletion: (email: string): boolean => {
    // Validate email format and check against deletion patterns
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  hashPersonalData: (data: string, salt: string): string => {
    // Simple hash function - in production use proper cryptographic hashing
    return btoa(data + salt);
  },

  isPersonalData: (fieldName: string): boolean => {
    const personalDataFields = [
      'email', 'name', 'firstName', 'lastName', 'phone', 'address', 
      'ipAddress', 'userId', 'biography', 'avatar', 'location'
    ];
    return personalDataFields.some(field => 
      fieldName.toLowerCase().includes(field.toLowerCase())
    );
  },

  generateDataSubjectRequest: (type: GDPRDataRequest['type']): Partial<GDPRDataRequest> => {
    return {
      type,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      verificationCompleted: false,
      autoProcessing: type === 'export',
      priority: 'normal',
      dataCategories: ['profile', 'annotations', 'projects', 'activity']
    };
  },

  calculateRetentionExpiry: (createdAt: string, retentionDays: number): Date => {
    const created = new Date(createdAt);
    created.setDate(created.getDate() + retentionDays);
    return created;
  },

  anonymizeText: (text: string, preserveLength: boolean = true): string => {
    if (preserveLength) {
      return text.replace(/[a-zA-Z]/g, 'X').replace(/[0-9]/g, '0');
    }
    return '[REDACTED]';
  }
}; 