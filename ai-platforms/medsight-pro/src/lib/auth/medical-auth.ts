/**
 * Medical Authentication Logic
 * Medical-specific authentication with credential validation and HIPAA compliance
 */

import { medicalServices } from '@/config/shared-config';
import { MedicalUser, AuthRequest, AuthResponse, RegistrationRequest, PasswordResetRequest, MFASetupRequest, ROLE_PERMISSIONS } from '@/types/medical-user';
import { MedicalSessionManager } from './session-management';

// Medical authentication service
export class MedicalAuthService {
  private static instance: MedicalAuthService;
  private sessionManager: MedicalSessionManager;

  constructor() {
    this.sessionManager = MedicalSessionManager.getInstance();
  }

  public static getInstance(): MedicalAuthService {
    if (!MedicalAuthService.instance) {
      MedicalAuthService.instance = new MedicalAuthService();
    }
    return MedicalAuthService.instance;
  }

  // Get current user method
  async getCurrentUser(): Promise<MedicalUser | null> {
    try {
      const session = await this.sessionManager.getCurrentSession();
      if (!session) return null;

      // Mock user data - in real app this would come from the session/token
      const mockUser: MedicalUser = {
        id: session.userId,
        firstName: 'Dr. John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'radiologist',
        credentials: {
          medicalLicense: 'MD123456',
          licenseState: 'CA',
          npi: '1234567890',
          boardCertifications: ['Radiology', 'Nuclear Medicine'],
          medicalSchool: 'Harvard Medical School',
          graduationYear: 2010,
          specializations: ['Diagnostic Radiology']
        },
        affiliations: [],
        permissions: [],
        mfaEnabled: true,
        emergencyAccess: false,
        sessionTimeout: 15 * 60 * 1000,
        maxSessions: 3,
        currentSessions: 1,
        hipaaCompliance: true,
        preferences: {
          theme: 'dark',
          language: 'en',
          timezone: 'America/New_York',
          notifications: {
            email: true,
            sms: false,
            push: true,
            emergencyAlerts: true,
            aiAlerts: true,
            reportAlerts: true,
            systemAlerts: true
          },
          workspace: {
            defaultWorkspace: '/dashboard/medical',
            hangingProtocols: [],
            windowLevelPresets: [],
            annotationDefaults: {
              defaultTool: 'arrow',
              defaultColor: '#FF0000',
              defaultFontSize: 14,
              showMeasurements: true
            },
            layout: 'grid',
            density: 'comfortable',
            showTips: false
          },
          accessibility: {
            highContrast: false,
            fontSize: 'medium',
            screenReader: false,
            reducedMotion: false,
            keyboardNavigation: true
          }
        },
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        loginAttempts: 0
      };

      return mockUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Medical user authentication
  public async authenticate(request: AuthRequest): Promise<AuthResponse> {
    try {
      // Validate medical license if provided
      if (request.email.includes('@')) {
        const licenseValid = await this.validateMedicalLicense(request.email);
        if (!licenseValid) {
          return {
            success: false,
            error: 'Invalid medical license or credentials',
            requiresLicense: true
          };
        }
      }

      // Simulate authentication
      const user = await this.getMedicalUser(request.email);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Check password
      const passwordValid = await this.validatePassword(request.password, user.id);
      if (!passwordValid) {
        await this.incrementLoginAttempts(user.id);
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Check MFA if enabled
      if (user.mfaEnabled && !request.mfaCode) {
        return {
          success: false,
          requiresMFA: true,
          error: 'MFA code required'
        };
      }

      if (user.mfaEnabled && request.mfaCode) {
        const mfaValid = await this.validateMFACode(user.id, request.mfaCode);
        if (!mfaValid) {
          return {
            success: false,
            error: 'Invalid MFA code'
          };
        }
      }

      // Generate tokens
      const token = this.generateJWT(user);
      const refreshToken = this.generateRefreshToken(user);

      // Update last login
      await this.updateLastLogin(user.id);

      // Medical audit logging
      medicalServices.auditMedicalAccess(user.id, 'authentication', 'LOGIN_SUCCESS');

      return {
        success: true,
        user,
        token,
        refreshToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  // Medical professional registration
  public async register(request: RegistrationRequest): Promise<AuthResponse> {
    try {
      // Validate medical credentials
      const credentialsValid = await this.validateMedicalCredentials(request);
      if (!credentialsValid) {
        return {
          success: false,
          error: 'Invalid medical credentials'
        };
      }

      // Check if user already exists
      const existingUser = await this.getMedicalUser(request.email);
      if (existingUser) {
        return {
          success: false,
          error: 'User already exists'
        };
      }

      // Create medical user
      const user = await this.createMedicalUser(request);

      // Generate verification token
      const verificationToken = this.generateVerificationToken(user.id);

      // Send verification email
      await this.sendVerificationEmail(user.email, verificationToken);

      // Medical audit logging
      medicalServices.auditMedicalAccess(user.id, 'registration', 'REGISTRATION_SUCCESS');

      return {
        success: true,
        user,
        requiresLicense: true
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed'
      };
    }
  }

  // Password reset
  public async resetPassword(request: PasswordResetRequest): Promise<boolean> {
    try {
      const user = await this.getMedicalUser(request.email);
      if (!user) {
        return false;
      }

      // Validate medical license if provided
      if (request.medicalLicense) {
        if (user.credentials.medicalLicense !== request.medicalLicense) {
          return false;
        }
      }

      // Generate reset token
      const resetToken = this.generatePasswordResetToken(user.id);

      // Send reset email
      await this.sendPasswordResetEmail(user.email, resetToken);

      // Medical audit logging
      medicalServices.auditMedicalAccess(user.id, 'password-reset', 'RESET_REQUESTED');

      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  }

  // MFA setup
  public async setupMFA(request: MFASetupRequest): Promise<{ secret?: string; qrCode?: string }> {
    try {
      const user = await this.getMedicalUser(request.userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (request.method === 'app') {
        const secret = this.generateMFASecret();
        const qrCode = this.generateMFAQRCode(user.email, secret);
        
        // Store secret
        await this.storeMFASecret(user.id, secret);

        return { secret, qrCode };
      }

      // For SMS/Email MFA
      const code = this.generateMFACode();
      await this.storeMFACode(user.id, code);

      if (request.method === 'sms' && request.phoneNumber) {
        await this.sendSMSCode(request.phoneNumber, code);
      } else if (request.method === 'email') {
        await this.sendEmailCode(user.email, code);
      }

      return {};
    } catch (error) {
      console.error('MFA setup error:', error);
      throw error;
    }
  }

  // Validate medical license
  private async validateMedicalLicense(email: string): Promise<boolean> {
    // This would integrate with medical board APIs
    // For now, simulate validation
    return true;
  }

  // Validate medical credentials
  private async validateMedicalCredentials(request: RegistrationRequest): Promise<boolean> {
    // Validate medical license format
    if (!medicalServices.validateMedicalLicense(request.medicalLicense, 'CA')) {
      throw new Error('Invalid medical license');
    }

    // Validate NPI number
    if (!medicalServices.validateNPI(request.npi)) {
      return false;
    }

    // Validate specialization
    if (!medicalServices.validateSpecialization(request.specializations[0])) {
      return false;
    }

    // Additional validation would go here
    return true;
  }

  // Get medical user
  private async getMedicalUser(emailOrId: string): Promise<MedicalUser | null> {
    // Mock implementation - would query database
    return null;
  }

  // Create medical user
  private async createMedicalUser(request: RegistrationRequest): Promise<MedicalUser> {
    // Mock implementation - would create in database
    const user: MedicalUser = {
      id: 'user-' + Date.now(),
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(), // Add missing lastLogin property
      isActive: true,
      isVerified: false,
      credentials: {
        medicalLicense: request.medicalLicense,
        licenseState: request.licenseState,
        npi: request.npi,
        deaNumber: request.deaNumber,
        boardCertifications: request.boardCertifications,
        medicalSchool: request.medicalSchool,
        graduationYear: request.graduationYear,
        specializations: request.specializations,
        subspecialties: []
      },
      affiliations: [{
        hospitalName: 'Mock Hospital',
        department: 'Radiology',
        role: 'Staff Radiologist',
        startDate: new Date(),
        endDate: null,
        isPrimary: true
      }],
      role: 'attending',
      permissions: ROLE_PERMISSIONS.attending,
      mfaEnabled: false,
      emergencyAccess: false,
      sessionTimeout: 15 * 60 * 1000,
      maxSessions: 3,
      currentSessions: 0,
      hipaaCompliance: request.hipaaCompliance,
      preferences: {
        theme: 'system',
        language: 'en',
        timezone: 'America/New_York',
        notifications: {
          email: true,
          sms: false,
          push: true,
          emergencyAlerts: true,
          aiAlerts: true,
          reportAlerts: true,
          systemAlerts: true
        },
        workspace: {
          defaultWorkspace: '/dashboard/medical',
          hangingProtocols: [],
          windowLevelPresets: [],
          annotationDefaults: {
            defaultTool: 'arrow',
            defaultColor: '#FF0000',
            defaultFontSize: 14,
            showMeasurements: true
          }
        },
        accessibility: {
          highContrast: false,
          fontSize: 'medium',
          reducedMotion: false,
          screenReader: false,
          keyboardNavigation: false
        }
      },
      loginAttempts: 0
    };

    return user;
  }

  // Validate password
  private async validatePassword(password: string, userId: string): Promise<boolean> {
    // Mock implementation - would validate against stored hash
    return password.length >= 8;
  }

  // Validate MFA code
  private async validateMFACode(userId: string, code: string): Promise<boolean> {
    // Mock implementation - would validate against stored code/secret
    return code.length === 6;
  }

  // Generate JWT token
  private generateJWT(user: MedicalUser): string {
    // Mock implementation - would use proper JWT library
    return 'jwt-token-' + user.id + '-' + Date.now();
  }

  // Generate refresh token
  private generateRefreshToken(user: MedicalUser): string {
    // Mock implementation - would use proper token generation
    return 'refresh-token-' + user.id + '-' + Date.now();
  }

  // Generate verification token
  private generateVerificationToken(userId: string): string {
    return 'verify-token-' + userId + '-' + Date.now();
  }

  // Generate password reset token
  private generatePasswordResetToken(userId: string): string {
    return 'reset-token-' + userId + '-' + Date.now();
  }

  // Generate MFA secret
  private generateMFASecret(): string {
    return 'mfa-secret-' + Date.now();
  }

  // Generate MFA QR code
  private generateMFAQRCode(email: string, secret: string): string {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  }

  // Generate MFA code
  private generateMFACode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store MFA secret
  private async storeMFASecret(userId: string, secret: string): Promise<void> {
    // Mock implementation - would store in database
    console.log('Storing MFA secret for user:', userId);
  }

  // Store MFA code
  private async storeMFACode(userId: string, code: string): Promise<void> {
    // Mock implementation - would store in database
    console.log('Storing MFA code for user:', userId);
  }

  // Send verification email
  private async sendVerificationEmail(email: string, token: string): Promise<void> {
    // Mock implementation - would send actual email
    console.log('Sending verification email to:', email);
  }

  // Send password reset email
  private async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // Mock implementation - would send actual email
    console.log('Sending password reset email to:', email);
  }

  // Send SMS code
  private async sendSMSCode(phoneNumber: string, code: string): Promise<void> {
    // Mock implementation - would send actual SMS
    console.log('Sending SMS code to:', phoneNumber);
  }

  // Send email code
  private async sendEmailCode(email: string, code: string): Promise<void> {
    // Mock implementation - would send actual email
    console.log('Sending email code to:', email);
  }

  // Update last login
  private async updateLastLogin(userId: string): Promise<void> {
    // Mock implementation - would update database
    console.log('Updating last login for user:', userId);
  }

  // Increment login attempts
  private async incrementLoginAttempts(userId: string): Promise<void> {
    // Mock implementation - would update database
    console.log('Incrementing login attempts for user:', userId);
  }

  // Refresh token
  public async refreshToken(token: string): Promise<AuthResponse> {
    try {
      // Validate refresh token
      const userId = this.validateRefreshToken(token);
      if (!userId) {
        return {
          success: false,
          error: 'Invalid refresh token'
        };
      }

      const user = await this.getMedicalUser(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Generate new tokens
      const newToken = this.generateJWT(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        success: true,
        user,
        token: newToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Token refresh failed'
      };
    }
  }

  // Validate refresh token
  private validateRefreshToken(token: string): string | null {
    // Mock implementation - would validate JWT
    if (token.startsWith('refresh-token-')) {
      return token.split('-')[2];
    }
    return null;
  }

  // Logout
  public async logout(userId: string, token: string): Promise<boolean> {
    try {
      // Invalidate token
      await this.invalidateToken(token);

      // Medical audit logging
      medicalServices.auditMedicalAccess(userId, 'authentication', 'LOGOUT_SUCCESS');

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  // Invalidate token
  private async invalidateToken(token: string): Promise<void> {
    // Mock implementation - would add to blacklist
    console.log('Invalidating token:', token.substring(0, 10) + '...');
  }

  // Emergency access
  public async requestEmergencyAccess(userId: string, reason: string): Promise<boolean> {
    try {
      const user = await this.getMedicalUser(userId);
      if (!user) {
        return false;
      }

      // Check if user has emergency access permission
      if (!user.emergencyAccess) {
        return false;
      }

      // Log emergency access
      medicalServices.auditMedicalAccess(userId, 'emergency-access', 'EMERGENCY_ACCESS_REQUESTED');

      // Grant temporary elevated permissions
      await this.grantEmergencyPermissions(userId);

      return true;
    } catch (error) {
      console.error('Emergency access error:', error);
      return false;
    }
  }

  // Grant emergency permissions
  private async grantEmergencyPermissions(userId: string): Promise<void> {
    // Mock implementation - would grant temporary permissions
    console.log('Granting emergency permissions to user:', userId);
  }

  // Verify account
  public async verifyAccount(token: string): Promise<boolean> {
    try {
      const userId = this.validateVerificationToken(token);
      if (!userId) {
        return false;
      }

      // Update user verification status
      await this.updateVerificationStatus(userId, true);

      // Medical audit logging
      medicalServices.auditMedicalAccess(userId, 'verification', 'ACCOUNT_VERIFIED');

      return true;
    } catch (error) {
      console.error('Account verification error:', error);
      return false;
    }
  }

  // Validate verification token
  private validateVerificationToken(token: string): string | null {
    // Mock implementation
    if (token.startsWith('verify-token-')) {
      return token.split('-')[2];
    }
    return null;
  }

  // Update verification status
  private async updateVerificationStatus(userId: string, verified: boolean): Promise<void> {
    // Mock implementation
    console.log('Updating verification status for user:', userId, 'to:', verified);
  }
}

// Export singleton instance
export const medicalAuthService = MedicalAuthService.getInstance();
export default medicalAuthService; 