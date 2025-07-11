/**
 * Medical Authentication Adapter
 * Integrates with shared AuthService and provides medical-specific functionality
 */

import { AuthService } from '../../../../../shared/auth/AuthService';

// Medical-specific authentication requirements
export interface MedicalCredentials {
  email: string;
  password: string;
  licenseNumber: string;
  medicalFacility?: string;
  npiNumber?: string;
  mfaToken?: string;
}

export interface MedicalLoginCredentials {
  email: string;
  password: string;
  mfaToken?: string;
  rememberDevice?: boolean;
  rememberMe?: boolean;
  medicalLicense?: string;
}

export interface MedicalUser {
  id: string;
  email: string;
  name: string;
  licenseNumber: string;
  licenseState: string;
  npiNumber?: string;
  medicalFacility: string;
  specialty: string;
  role: MedicalRole;
  isVerified: boolean;
  lastLogin: Date;
  complianceStatus: ComplianceStatus;
  permissions: MedicalPermission[];
  
  // Additional properties for login flow
  requiresMFA?: boolean;
  mfaToken?: string;
  requiresLicenseVerification?: boolean;
  verificationToken?: string;
  requiresProfileSetup?: boolean;
}

export enum MedicalRole {
  PHYSICIAN = 'physician',
  RADIOLOGIST = 'radiologist',
  TECHNICIAN = 'technician',
  NURSE = 'nurse',
  ADMIN = 'admin',
  RESEARCHER = 'researcher'
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  PENDING_REVIEW = 'pending_review',
  NON_COMPLIANT = 'non_compliant',
  EXPIRED = 'expired'
}

export enum MedicalPermission {
  READ_PHI = 'read_phi',
  WRITE_PHI = 'write_phi',
  DELETE_PHI = 'delete_phi',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_USERS = 'manage_users',
  CONFIGURE_SYSTEM = 'configure_system',
  ACCESS_AUDIT_LOGS = 'access_audit_logs',
  EXPORT_DATA = 'export_data'
}

export class MedicalAuthAdapter {
  private static instance: MedicalAuthAdapter | null = null;
  private authService: AuthService;
  private complianceCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.authService = new AuthService();
    this.startComplianceMonitoring();
  }

  static getInstance(): MedicalAuthAdapter {
    if (!MedicalAuthAdapter.instance) {
      MedicalAuthAdapter.instance = new MedicalAuthAdapter();
    }
    return MedicalAuthAdapter.instance;
  }

  // Medical-specific login with enhanced security
  async login(credentials: MedicalLoginCredentials): Promise<MedicalUser> {
    try {
      // Additional medical validation
      await this.validateMedicalCredentials(credentials);

      // Log the login attempt for audit purposes
      await this.logAuditEvent('LOGIN_ATTEMPT', {
        email: credentials.email,
        timestamp: new Date(),
        ipAddress: this.getClientIP(),
        userAgent: this.getUserAgent()
      });

      // Standard authentication
      const user = await this.authService.login(credentials);

      // Medical-specific post-login checks
      const medicalUser = await this.enhanceWithMedicalData(user);
      
      // Verify compliance status
      await this.verifyComplianceStatus(medicalUser);

      // Log successful login
      await this.logAuditEvent('LOGIN_SUCCESS', {
        userId: medicalUser.id,
        timestamp: new Date()
      });

      return medicalUser;
    } catch (error) {
      // Log failed login attempt
      await this.logAuditEvent('LOGIN_FAILED', {
        email: credentials.email,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw error;
    }
  }

  // Medical license verification
  async verifyMedicalLicense(licenseNumber: string, state: string): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with state medical boards
      const response = await fetch(`/api/medical/verify-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseNumber, state })
      });

      if (!response.ok) {
        throw new Error('License verification failed');
      }

      const result = await response.json();
      return result.isValid;
    } catch (error) {
      console.error('License verification error:', error);
      return false;
    }
  }

  // NPI number validation
  async validateNPI(npiNumber: string): Promise<boolean> {
    // Basic NPI format validation (10 digits)
    if (!/^\d{10}$/.test(npiNumber)) {
      return false;
    }

    try {
      // In a real implementation, this would check against NPPES database
      const response = await fetch(`/api/medical/validate-npi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npiNumber })
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.isValid;
    } catch (error) {
      console.error('NPI validation error:', error);
      return false;
    }
  }

  // HIPAA compliance check
  async checkHIPAACompliance(userId: string): Promise<ComplianceStatus> {
    try {
      const response = await fetch(`/api/medical/compliance-check/${userId}`);
      
      if (!response.ok) {
        return ComplianceStatus.NON_COMPLIANT;
      }

      const result = await response.json();
      return result.status as ComplianceStatus;
    } catch (error) {
      console.error('HIPAA compliance check error:', error);
      return ComplianceStatus.NON_COMPLIANT;
    }
  }

  // Enhanced logout with audit logging
  async logout(userId: string): Promise<void> {
    try {
      await this.logAuditEvent('LOGOUT', {
        userId,
        timestamp: new Date()
      });

      await this.authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Private helper methods
  private async validateMedicalCredentials(credentials: MedicalLoginCredentials): Promise<void> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    // Check if email is from approved medical domain (optional)
    // This could be configured based on organizational requirements
  }

  private async enhanceWithMedicalData(user: any): Promise<MedicalUser> {
    // Fetch additional medical-specific data
    const medicalProfile = await this.fetchMedicalProfile(user.id);
    
    return {
      ...user,
      ...medicalProfile,
      complianceStatus: await this.checkHIPAACompliance(user.id)
    };
  }

  private async fetchMedicalProfile(userId: string): Promise<Partial<MedicalUser>> {
    try {
      const response = await fetch(`/api/medical/profile/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch medical profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching medical profile:', error);
      // Return default values if profile fetch fails
      return {
        licenseNumber: '',
        licenseState: '',
        medicalFacility: '',
        specialty: '',
        role: MedicalRole.PHYSICIAN,
        isVerified: false,
        permissions: []
      };
    }
  }

  private async verifyComplianceStatus(user: MedicalUser): Promise<void> {
    if (user.complianceStatus !== ComplianceStatus.COMPLIANT) {
      throw new Error(`User compliance status: ${user.complianceStatus}. Access denied.`);
    }
  }

  private async logAuditEvent(eventType: string, data: any): Promise<void> {
    try {
      await fetch('/api/medical/audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          data,
          timestamp: new Date()
        })
      });
    } catch (error) {
      // Audit logging failures should not break the main flow
      console.error('Audit logging error:', error);
    }
  }

  private getClientIP(): string {
    // In a real implementation, this would extract the client IP
    return 'unknown';
  }

  private getUserAgent(): string {
    return typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown';
  }

  private startComplianceMonitoring(): void {
    // Check compliance status every 24 hours
    this.complianceCheckInterval = setInterval(async () => {
      // In a real implementation, this would check all active sessions
      console.log('Running compliance monitoring check...');
    }, 24 * 60 * 60 * 1000);
  }

  destroy(): void {
    if (this.complianceCheckInterval) {
      clearInterval(this.complianceCheckInterval);
    }
  }
}

// Export singleton instance
export const medicalAuth = new MedicalAuthAdapter(); 