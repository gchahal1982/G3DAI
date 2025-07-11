/**
 * MedSight Pro - Medical Authentication System
 * Medical-specific authentication logic with license validation and clinical security
 * Optimized for HIPAA compliance and medical workflow requirements
 */

import { AuthService } from '@/shared/auth/AuthService';

// Medical authentication interfaces
interface MedicalCredentials {
  email: string;
  password: string;
  medicalLicense?: string;
  mfaCode?: string;
  emergencyAccess?: boolean;
}

interface MedicalUser {
  id: string;
  email: string;
  name: string;
  medicalLicense: string;
  licenseState: string;
  licenseExpiry: Date;
  specializations: string[];
  hospital: string;
  department: string;
  role: string;
  npiNumber?: string;
  deaNumber?: string;
  boardCertifications: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  compliance: {
    hipaaTraining: Date;
    complianceAgreement: Date;
    backgroundCheck: Date;
    credentialVerification: Date;
  };
  sessionInfo: {
    lastLogin: Date;
    sessionTimeout: number;
    mfaVerified: boolean;
    deviceFingerprint: string;
  };
}

interface MedicalLicenseInfo {
  licenseNumber: string;
  state: string;
  expiryDate: Date;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  specialties: string[];
  boardCertifications: string[];
  deaRegistration?: string;
  npiNumber?: string;
}

interface MedicalAuthResponse {
  success: boolean;
  user?: MedicalUser;
  token?: string;
  requiresMFA?: boolean;
  requiresLicenseVerification?: boolean;
  requiresCompliance?: string[];
  sessionInfo?: {
    timeout: number;
    refreshToken: string;
    deviceId: string;
  };
  error?: string;
  auditLog: {
    timestamp: Date;
    action: string;
    userAgent: string;
    ipAddress: string;
    success: boolean;
    failureReason?: string;
  };
}

// Medical authentication configuration
const MEDICAL_AUTH_CONFIG = {
  session: {
    timeout: 15 * 60 * 1000, // 15 minutes in milliseconds
    extendOnActivity: true,
    maxConcurrentSessions: 2
  },
  mfa: {
    required: true,
    methods: ['sms', 'email', 'totp'],
    codeLength: 6,
    codeExpiry: 5 * 60 * 1000 // 5 minutes
  },
  license: {
    verificationRequired: true,
    allowEmergencyBypass: true,
    emergencyBypassDuration: 60 * 60 * 1000, // 1 hour
    states: [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ]
  },
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 5 * 60 * 1000, // 5 minutes
    passwordMinLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  compliance: {
    required: ['HIPAA', 'MEDICAL_LICENSE', 'BACKGROUND_CHECK'],
    hipaaRenewal: 365 * 24 * 60 * 60 * 1000, // 1 year
    licenseRenewal: 730 * 24 * 60 * 60 * 1000 // 2 years
  }
};

export class MedicalAuthenticationService {
  private authService: AuthService;
  private auditLogs: any[] = [];

  constructor() {
    this.authService = new AuthService({
      serviceId: 'medsight-pro',
      apiUrl: process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://auth.g3d.ai',
      storage: { type: 'local', encrypt: true },
      session: { 
        timeout: MEDICAL_AUTH_CONFIG.session.timeout / 1000, 
        renewThreshold: 5 * 60 // 5 minutes
      },
      logging: { level: 'info' }
    });
  }

  // Medical professional login
  async login(credentials: MedicalCredentials): Promise<MedicalAuthResponse> {
    const auditLog = {
      timestamp: new Date(),
      action: 'medical_login_attempt',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      ipAddress: await this.getClientIP(),
      success: false,
      failureReason: undefined
    };

    try {
      // Validate credentials format
      const validation = this.validateCredentials(credentials);
      if (!validation.valid) {
        auditLog.failureReason = validation.reason;
        this.logAuditEvent(auditLog);
        return {
          success: false,
          error: validation.reason,
          auditLog
        };
      }

      // Check if account is locked
      const lockStatus = await this.checkAccountLock(credentials.email);
      if (lockStatus.locked) {
        auditLog.failureReason = 'account_locked';
        this.logAuditEvent(auditLog);
        return {
          success: false,
          error: `Account locked until ${lockStatus.unlockTime.toLocaleTimeString()}`,
          auditLog
        };
      }

      // Attempt basic authentication
      const authResult = await this.authService.login({
        email: credentials.email,
        password: credentials.password
      });

      if (!authResult.success) {
        await this.handleFailedLogin(credentials.email);
        auditLog.failureReason = 'invalid_credentials';
        this.logAuditEvent(auditLog);
        return {
          success: false,
          error: 'Invalid credentials',
          auditLog
        };
      }

      // Get medical user profile
      const medicalUser = await this.getMedicalUserProfile(authResult.user.id);
      if (!medicalUser) {
        auditLog.failureReason = 'medical_profile_not_found';
        this.logAuditEvent(auditLog);
        return {
          success: false,
          error: 'Medical profile not found',
          auditLog
        };
      }

      // Validate medical license
      if (MEDICAL_AUTH_CONFIG.license.verificationRequired && !credentials.emergencyAccess) {
        const licenseValidation = await this.validateMedicalLicense(medicalUser.medicalLicense);
        if (!licenseValidation.valid) {
          auditLog.failureReason = 'invalid_medical_license';
          this.logAuditEvent(auditLog);
          return {
            success: false,
            error: 'Medical license validation failed',
            requiresLicenseVerification: true,
            auditLog
          };
        }
      }

      // Check compliance requirements
      const complianceCheck = this.checkComplianceRequirements(medicalUser);
      if (complianceCheck.missing.length > 0) {
        auditLog.failureReason = 'compliance_requirements_missing';
        this.logAuditEvent(auditLog);
        return {
          success: false,
          error: 'Compliance requirements not met',
          requiresCompliance: complianceCheck.missing,
          auditLog
        };
      }

      // Check MFA requirement
      if (MEDICAL_AUTH_CONFIG.mfa.required && !credentials.mfaCode) {
        // Send MFA code
        await this.sendMFACode(medicalUser);
        auditLog.success = true;
        auditLog.action = 'mfa_code_sent';
        this.logAuditEvent(auditLog);
        return {
          success: false,
          requiresMFA: true,
          auditLog
        };
      }

      // Verify MFA if provided
      if (credentials.mfaCode) {
        const mfaVerification = await this.verifyMFACode(medicalUser.id, credentials.mfaCode);
        if (!mfaVerification.valid) {
          auditLog.failureReason = 'invalid_mfa_code';
          this.logAuditEvent(auditLog);
          return {
            success: false,
            error: 'Invalid MFA code',
            auditLog
          };
        }
      }

      // Create medical session
      const sessionInfo = await this.createMedicalSession(medicalUser);
      
      // Clear failed login attempts
      await this.clearFailedLoginAttempts(credentials.email);

      auditLog.success = true;
      auditLog.action = 'medical_login_success';
      this.logAuditEvent(auditLog);

      return {
        success: true,
        user: medicalUser,
        token: authResult.token,
        sessionInfo,
        auditLog
      };

    } catch (error) {
      auditLog.failureReason = 'system_error';
      this.logAuditEvent(auditLog);
      return {
        success: false,
        error: 'Authentication system error',
        auditLog
      };
    }
  }

  // Validate medical credentials format
  private validateCredentials(credentials: MedicalCredentials): { valid: boolean; reason?: string } {
    if (!credentials.email || !credentials.password) {
      return { valid: false, reason: 'Email and password required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      return { valid: false, reason: 'Invalid email format' };
    }

    if (credentials.password.length < MEDICAL_AUTH_CONFIG.security.passwordMinLength) {
      return { valid: false, reason: 'Password does not meet security requirements' };
    }

    return { valid: true };
  }

  // Validate medical license
  private async validateMedicalLicense(licenseNumber: string): Promise<{ valid: boolean; info?: MedicalLicenseInfo }> {
    try {
      // Mock license validation - in production, this would call state medical board APIs
      const mockLicenseInfo: MedicalLicenseInfo = {
        licenseNumber,
        state: 'CA',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        status: 'active',
        specialties: ['Radiology', 'Nuclear Medicine'],
        boardCertifications: ['American Board of Radiology'],
        npiNumber: '1234567890'
      };

      const isValid = mockLicenseInfo.status === 'active' && 
                     mockLicenseInfo.expiryDate > new Date();

      return {
        valid: isValid,
        info: mockLicenseInfo
      };
    } catch (error) {
      return { valid: false };
    }
  }

  // Check compliance requirements
  private checkComplianceRequirements(user: MedicalUser): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    const now = new Date();

    // Check HIPAA training
    if (!user.compliance.hipaaTraining || 
        (now.getTime() - user.compliance.hipaaTraining.getTime()) > MEDICAL_AUTH_CONFIG.compliance.hipaaRenewal) {
      missing.push('HIPAA Training');
    }

    // Check compliance agreement
    if (!user.compliance.complianceAgreement) {
      missing.push('Compliance Agreement');
    }

    // Check background check
    if (!user.compliance.backgroundCheck) {
      missing.push('Background Check');
    }

    // Check license verification
    if (!user.compliance.credentialVerification) {
      missing.push('Credential Verification');
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  // Send MFA code
  private async sendMFACode(user: MedicalUser): Promise<boolean> {
    try {
      // Mock MFA code sending
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store code temporarily (in production, use secure storage)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`mfa_code_${user.id}`, code);
        sessionStorage.setItem(`mfa_code_expiry_${user.id}`, 
          (Date.now() + MEDICAL_AUTH_CONFIG.mfa.codeExpiry).toString());
      }

      console.log(`🔐 MFA Code for ${user.email}: ${code}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Verify MFA code
  private async verifyMFACode(userId: string, code: string): Promise<{ valid: boolean }> {
    try {
      if (typeof window === 'undefined') return { valid: false };

      const storedCode = sessionStorage.getItem(`mfa_code_${userId}`);
      const expiry = sessionStorage.getItem(`mfa_code_expiry_${userId}`);

      if (!storedCode || !expiry) {
        return { valid: false };
      }

      if (Date.now() > parseInt(expiry)) {
        sessionStorage.removeItem(`mfa_code_${userId}`);
        sessionStorage.removeItem(`mfa_code_expiry_${userId}`);
        return { valid: false };
      }

      const isValid = storedCode === code;
      if (isValid) {
        sessionStorage.removeItem(`mfa_code_${userId}`);
        sessionStorage.removeItem(`mfa_code_expiry_${userId}`);
      }

      return { valid: isValid };
    } catch (error) {
      return { valid: false };
    }
  }

  // Create medical session
  private async createMedicalSession(user: MedicalUser): Promise<any> {
    const sessionInfo = {
      timeout: MEDICAL_AUTH_CONFIG.session.timeout / 1000,
      refreshToken: this.generateRefreshToken(),
      deviceId: await this.getDeviceFingerprint()
    };

    // Update user session info
    user.sessionInfo = {
      lastLogin: new Date(),
      sessionTimeout: MEDICAL_AUTH_CONFIG.session.timeout,
      mfaVerified: true,
      deviceFingerprint: sessionInfo.deviceId
    };

    return sessionInfo;
  }

  // Get medical user profile
  private async getMedicalUserProfile(userId: string): Promise<MedicalUser | null> {
    try {
      // Mock medical user profile - in production, fetch from database
      return {
        id: userId,
        email: 'dr.sarah.chen@hospital.com',
        name: 'Dr. Sarah Chen',
        medicalLicense: 'MD-CA-12345',
        licenseState: 'CA',
        licenseExpiry: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2 years
        specializations: ['Radiology', 'Nuclear Medicine'],
        hospital: 'General Medical Center',
        department: 'Radiology',
        role: 'Attending Radiologist',
        npiNumber: '1234567890',
        boardCertifications: ['American Board of Radiology'],
        emergencyContact: {
          name: 'John Chen',
          phone: '+1-555-0123',
          relationship: 'Spouse'
        },
        compliance: {
          hipaaTraining: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          complianceAgreement: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
          backgroundCheck: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
          credentialVerification: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
        },
        sessionInfo: {
          lastLogin: new Date(),
          sessionTimeout: MEDICAL_AUTH_CONFIG.session.timeout,
          mfaVerified: false,
          deviceFingerprint: ''
        }
      };
    } catch (error) {
      return null;
    }
  }

  // Account lockout management
  private async checkAccountLock(email: string): Promise<{ locked: boolean; unlockTime?: Date }> {
    if (typeof window === 'undefined') return { locked: false };

    const lockKey = `account_lock_${email}`;
    const lockData = localStorage.getItem(lockKey);
    
    if (!lockData) return { locked: false };

    const { unlockTime } = JSON.parse(lockData);
    const unlockDate = new Date(unlockTime);

    if (Date.now() < unlockDate.getTime()) {
      return { locked: true, unlockTime: unlockDate };
    } else {
      localStorage.removeItem(lockKey);
      return { locked: false };
    }
  }

  private async handleFailedLogin(email: string): Promise<void> {
    if (typeof window === 'undefined') return;

    const attemptsKey = `login_attempts_${email}`;
    const attempts = parseInt(localStorage.getItem(attemptsKey) || '0') + 1;
    localStorage.setItem(attemptsKey, attempts.toString());

    if (attempts >= MEDICAL_AUTH_CONFIG.security.maxLoginAttempts) {
      const unlockTime = Date.now() + MEDICAL_AUTH_CONFIG.security.lockoutDuration;
      localStorage.setItem(`account_lock_${email}`, JSON.stringify({ unlockTime }));
      localStorage.removeItem(attemptsKey);
    }
  }

  private async clearFailedLoginAttempts(email: string): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`login_attempts_${email}`);
  }

  // Utility methods
  private async getClientIP(): Promise<string> {
    try {
      // Mock IP - in production, get from request or service
      return '192.168.1.100';
    } catch {
      return 'unknown';
    }
  }

  private generateRefreshToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private async getDeviceFingerprint(): Promise<string> {
    if (typeof window === 'undefined') return 'server';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Medical device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  }

  private logAuditEvent(auditLog: any): void {
    this.auditLogs.push(auditLog);
    console.log('🔍 Medical Audit Log:', auditLog);
    
    // In production, send to audit logging service
    // await this.sendToAuditService(auditLog);
  }

  // Get current medical user
  async getCurrentMedicalUser(): Promise<MedicalUser | null> {
    const currentUser = await this.authService.getCurrentUser();
    if (!currentUser) return null;
    
    return this.getMedicalUserProfile(currentUser.id);
  }

  // Medical logout
  async logout(): Promise<boolean> {
    try {
      const result = await this.authService.logout();
      
      // Clear medical session data
      if (typeof window !== 'undefined') {
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
          if (key.startsWith('mfa_code_') || key.startsWith('medical_')) {
            sessionStorage.removeItem(key);
          }
        });
      }

      this.logAuditEvent({
        timestamp: new Date(),
        action: 'medical_logout',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
        ipAddress: await this.getClientIP(),
        success: result
      });

      return result;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const medicalAuth = new MedicalAuthenticationService();
export default medicalAuth; 