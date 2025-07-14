/**
 * Medical Authentication Adapter
 * Integrates with shared AuthService and provides medical-specific functionality
 */

import { AuthService } from '../../../../../shared/auth/AuthService';
import { getMedSightProConfig } from '../../config/shared-config';

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
  clientInfo?: {
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    platform?: string;
    timestamp?: string;
  };
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
  
  // Additional medical user properties
  licenseExpiry?: Date;
  medicalLicense?: string;
  departmentAffiliations?: Array<{
    hospitalName: string;
    departmentName: string;
    role: string;
  }>;
  compliance?: {
    hipaaTraining?: {
      expiryDate: Date;
      completedDate: Date;
    };
  };
  boardCertifications?: Array<{
    id: string;
    specialty: string;
    expiryDate: Date;
    issuingBoard: string;
  }>;
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

  // Get current user method
  async getCurrentUser(): Promise<MedicalUser> {
    try {
      const user = await this.authService.getCurrentUser();
      return await this.enhanceWithMedicalData(user);
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  // Update compliance agreements
  async updateComplianceAgreements(data: any): Promise<void> {
    try {
      await fetch('/api/medical/compliance-agreements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Error updating compliance agreements:', error);
      throw error;
    }
  }

  // Get MFA methods
  async getMFAMethods(data: any): Promise<any> {
    try {
      const response = await fetch('/api/medical/mfa-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting MFA methods:', error);
      throw error;
    }
  }

  // Verify MFA
  async verifyMFA(data: any): Promise<any> {
    try {
      const response = await fetch('/api/medical/verify-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error verifying MFA:', error);
      throw error;
    }
  }

  // Set auth token
  async setAuthToken(token: string): Promise<void> {
    try {
      // Assuming AuthService has a setToken method or similar
      // Since we can't modify the shared AuthService, we'll store it locally
      localStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
      throw error;
    }
  }

  // Request MFA code
  async requestMFACode(data: any): Promise<any> {
    try {
      const response = await fetch('/api/medical/request-mfa-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error requesting MFA code:', error);
      throw error;
    }
  }

  // Organization invitation methods
  async getOrganizationInvitation(data: any): Promise<any> {
    try {
      const response = await fetch('/api/medical/organization-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting organization invitation:', error);
      throw error;
    }
  }

  async acceptOrganizationInvitation(data: any): Promise<any> {
    try {
      const response = await fetch('/api/medical/accept-organization-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error accepting organization invitation:', error);
      throw error;
    }
  }

  async declineOrganizationInvitation(data: any): Promise<void> {
    try {
      await fetch('/api/medical/decline-organization-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Error declining organization invitation:', error);
      throw error;
    }
  }

  // Update medical profile
  async updateMedicalProfile(profile: any): Promise<void> {
    try {
      await fetch('/api/medical/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
    } catch (error) {
      console.error('Error updating medical profile:', error);
      throw error;
    }
  }

  // Password reset methods
  async requestPasswordReset(data: any): Promise<any> {
    try {
      const response = await fetch('/api/medical/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  async verifySecurityAnswer(data: any): Promise<any> {
    try {
      const response = await fetch('/api/medical/verify-security-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error verifying security answer:', error);
      throw error;
    }
  }

  async sendVerificationCode(data: any): Promise<void> {
    try {
      await fetch('/api/medical/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Error sending verification code:', error);
      throw error;
    }
  }

  async resetPassword(data: any): Promise<any> {
    try {
      const response = await fetch('/api/medical/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Registration method
  async register(data: any): Promise<any> {
    try {
      const response = await fetch('/api/medical/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  // Account verification methods
  async verifyAccountToken(data: any): Promise<any> {
    try {
      const response = await fetch('/api/medical/verify-account-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error verifying account token:', error);
      throw error;
    }
  }

  async verifyAccountCode(data: any): Promise<any> {
    try {
      const response = await fetch('/api/medical/verify-account-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error verifying account code:', error);
      throw error;
    }
  }

  async resendVerificationCode(data: any): Promise<any> {
    try {
      const response = await fetch('/api/medical/resend-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error resending verification code:', error);
      throw error;
    }
  }

  // Medical-specific login with enhanced security
  async login(credentials: MedicalLoginCredentials): Promise<MedicalUser> {
    try {
      // Handle demo credentials FIRST before any API calls
      if (credentials.email === 'testuser' && credentials.password === 'testpass') {
        console.log('🎯 Demo login detected, bypassing API calls');
        
        // Return demo medical user immediately
        const demoUser: MedicalUser = {
          id: 'demo-user-001',
          email: 'testuser@medsightpro.com',
          name: 'Dr. Demo User',
          licenseNumber: 'MD123456',
          licenseState: 'CA',
          npiNumber: '1234567890',
          medicalFacility: 'Demo Medical Center',
          specialty: 'Radiology',
          role: MedicalRole.PHYSICIAN,
          isVerified: true,
          lastLogin: new Date(),
          complianceStatus: ComplianceStatus.COMPLIANT,
          permissions: [
            MedicalPermission.READ_PHI,
            MedicalPermission.WRITE_PHI,
            MedicalPermission.VIEW_ANALYTICS
          ]
        };
        
        console.log('✅ Demo login successful:', demoUser);
        
        // Set authentication token for middleware
        const demoToken = `demo-token-${demoUser.id}-${Date.now()}`;
        
        // Set token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('medsight-auth-token', demoToken);
          localStorage.setItem('medsight-user', JSON.stringify(demoUser));
          
          // Set cookie for middleware
          document.cookie = `medsight-token=${demoToken}; path=/; max-age=86400; SameSite=Lax`;
          
          console.log('🔑 Demo authentication token set');
        }
        
        // Log successful demo login (non-blocking)
        this.logAuditEvent('LOGIN_SUCCESS', {
          userId: demoUser.id,
          timestamp: new Date(),
          isDemoUser: true
        }).catch(err => console.warn('Audit logging failed (non-critical):', err));
        
        return demoUser;
      }

      // Additional medical validation for non-demo users
      await this.validateMedicalCredentials(credentials);

      // Log the login attempt for audit purposes (non-blocking)
      this.logAuditEvent('LOGIN_ATTEMPT', {
        email: credentials.email,
        timestamp: new Date(),
        ipAddress: this.getClientIP(),
        userAgent: this.getUserAgent()
      }).catch(err => console.warn('Audit logging failed (non-critical):', err));

      // Standard authentication for real users
      const user = await this.authService.login(credentials);

      // Medical-specific post-login checks
      const medicalUser = await this.enhanceWithMedicalData(user);
      
      // Verify compliance status
      await this.verifyComplianceStatus(medicalUser);

      // Log successful login (non-blocking)
      this.logAuditEvent('LOGIN_SUCCESS', {
        userId: medicalUser.id,
        timestamp: new Date()
      }).catch(err => console.warn('Audit logging failed (non-critical):', err));

      return medicalUser;
    } catch (error) {
      // Log failed login attempt (non-blocking)
      this.logAuditEvent('LOGIN_FAILED', {
        email: credentials.email,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }).catch(err => console.warn('Audit logging failed (non-critical):', err));
      
      throw error;
    }
  }

  // Medical license verification - Fixed signature
  async verifyMedicalLicense(data: any): Promise<any> {
    try {
      const response = await fetch(`/api/medical/verify-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('License verification failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('License verification error:', error);
      throw error;
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
      // For demo mode, just log to console instead of making API calls
      if (data.isDemoUser) {
        console.log(`📋 [DEMO AUDIT] ${eventType}:`, data);
        return;
      }

      // Get the correct API URL from configuration
      const config = getMedSightProConfig();
      const apiUrl = `${config.environment.apiUrl}/api/medical/audit-log`;

      await fetch(apiUrl, {
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
      console.warn('⚠️  Audit logging error (non-critical):', error);
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