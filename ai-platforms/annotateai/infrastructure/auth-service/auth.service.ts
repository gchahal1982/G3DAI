/**
 * AnnotateAI Production Authentication Service
 * Phase 3 Production AI Deployment - Real Authentication System
 * 
 * Replaces: ai-platforms/annotateai/src/lib/auth/AuthService.ts (mock implementation)
 * 
 * Features:
 * - JWT authentication with refresh tokens
 * - Multi-tenant organization support with data isolation
 * - Enterprise SSO integration (SAML, OAuth2, OIDC)
 * - Multi-factor authentication (MFA)
 * - Session management and security
 * - Role-based access control (RBAC)
 * - Audit logging and compliance
 */

import { Injectable, UnauthorizedException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../email/email.service';
import { SSOService } from '../sso/sso.service';
import { MFAService } from '../mfa/mfa.service';
import { SecurityService } from '../security/security.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EnableMFADto } from './dto/enable-mfa.dto';
import { VerifyMFADto } from './dto/verify-mfa.dto';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { UserRole } from './enums/user-role.enum';
import { AuthResult } from './interfaces/auth-result.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { SessionInfo } from './interfaces/session-info.interface';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly JWT_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly JWT_REFRESH_EXPIRES_IN: string;
  private readonly BCRYPT_ROUNDS: number = 12;
  private readonly MAX_LOGIN_ATTEMPTS: number = 5;
  private readonly LOCKOUT_DURATION: number = 900; // 15 minutes

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService,
    private readonly ssoService: SSOService,
    private readonly mfaService: MFAService,
    private readonly securityService: SecurityService,
  ) {
    this.JWT_SECRET = this.configService.get<string>('JWT_SECRET');
    this.JWT_REFRESH_SECRET = this.configService.get<string>('JWT_REFRESH_SECRET');
    this.JWT_EXPIRES_IN = this.configService.get<string>('JWT_EXPIRES_IN', '1h');
    this.JWT_REFRESH_EXPIRES_IN = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    
    if (!this.JWT_SECRET || !this.JWT_REFRESH_SECRET) {
      throw new Error('JWT secrets must be configured');
    }
  }

  /**
   * Authenticate user with email and password
   * Replaces mock authentication in src/lib/auth/AuthService.ts
   */
  async login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<AuthResult> {
    const { email, password, rememberMe, organizationId } = loginDto;

    try {
      // Check for account lockout
      await this.checkAccountLockout(email);

      // Find user by email
      const user = await this.prismaService.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          organization: true,
        },
      });

      if (!user) {
        await this.handleFailedLogin(email, ipAddress, 'invalid_credentials');
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        await this.handleFailedLogin(email, ipAddress, 'invalid_password');
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user is active
      if (user.status !== 'active') {
        await this.handleFailedLogin(email, ipAddress, 'inactive_account');
        throw new UnauthorizedException('Account is not active');
      }

      // Multi-tenant validation
      if (organizationId && user.organizationId !== organizationId) {
        await this.handleFailedLogin(email, ipAddress, 'organization_mismatch');
        throw new UnauthorizedException('Invalid organization');
      }

      // Check if MFA is required
      if (user.mfaEnabled) {
        // Return partial auth result requiring MFA
        return {
          requiresMFA: true,
          mfaToken: await this.generateMFAToken(user.id),
          user: this.sanitizeUser(user),
        };
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Create session
      const session = await this.createSession(user, tokens.refreshToken, ipAddress, userAgent, rememberMe);

      // Update last login
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Clear failed login attempts
      await this.clearFailedLoginAttempts(email);

      // Audit log
      await this.auditService.log({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'auth.login',
        resourceType: 'user',
        resourceId: user.id,
        ipAddress,
        userAgent,
        metadata: { 
          method: 'email_password',
          rememberMe,
          sessionId: session.id,
        },
      });

      return {
        user: this.sanitizeUser(user),
        organization: user.organization,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        sessionId: session.id,
      };
    } catch (error) {
      this.logger.error(`Login failed for email: ${email}`, error);
      throw error;
    }
  }

  /**
   * Register new user account
   */
  async register(registerDto: RegisterDto, ipAddress: string, userAgent: string): Promise<AuthResult> {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      organizationName, 
      organizationId,
      inviteToken,
      acceptTerms,
      acceptPrivacy,
    } = registerDto;

    try {
      // Check if user already exists
      const existingUser = await this.prismaService.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Validate password strength
      await this.securityService.validatePasswordStrength(password);

      // Hash password
      const passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);

      // Handle organization
      let organization: Organization;
      if (organizationId) {
        // Join existing organization
        organization = await this.prismaService.organization.findUnique({
          where: { id: organizationId },
        });
        if (!organization) {
          throw new BadRequestException('Organization not found');
        }
      } else if (organizationName) {
        // Create new organization
        organization = await this.prismaService.organization.create({
          data: {
            name: organizationName,
            slug: this.generateSlug(organizationName),
            subscriptionTier: 'starter',
            settings: {},
          },
        });
      } else {
        throw new BadRequestException('Organization name or ID required');
      }

      // Create user
      const user = await this.prismaService.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          firstName,
          lastName,
          organizationId: organization.id,
          role: organization.id === organizationId ? 'annotator' : 'owner', // Owner if creating new org
          status: 'active',
          isEmailVerified: false,
          emailVerificationToken: crypto.randomBytes(32).toString('hex'),
          emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          preferences: {
            theme: 'system',
            language: 'en',
            timezone: 'UTC',
            notifications: {
              email: true,
              push: true,
              projectUpdates: true,
              annotationAlerts: true,
            },
          },
          usageQuota: this.getDefaultQuota(organization.subscriptionTier),
          usageCurrent: this.getEmptyUsage(),
        },
        include: {
          organization: true,
        },
      });

      // Send verification email
      await this.emailService.sendVerificationEmail(
        user.email,
        user.firstName,
        user.emailVerificationToken,
      );

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Create session
      const session = await this.createSession(user, tokens.refreshToken, ipAddress, userAgent, false);

      // Audit log
      await this.auditService.log({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'auth.register',
        resourceType: 'user',
        resourceId: user.id,
        ipAddress,
        userAgent,
        metadata: { 
          method: 'email_password',
          organizationCreated: !organizationId,
          sessionId: session.id,
        },
      });

      return {
        user: this.sanitizeUser(user),
        organization: user.organization,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        sessionId: session.id,
        requiresEmailVerification: true,
      };
    } catch (error) {
      this.logger.error(`Registration failed for email: ${email}`, error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto, ipAddress: string, userAgent: string): Promise<AuthResult> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.JWT_REFRESH_SECRET,
      }) as JwtPayload;

      // Find session
      const session = await this.prismaService.userSession.findUnique({
        where: { refreshToken },
        include: {
          user: {
            include: {
              organization: true,
            },
          },
        },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if user is still active
      if (session.user.status !== 'active') {
        throw new UnauthorizedException('Account is not active');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(session.user);

      // Update session
      await this.prismaService.userSession.update({
        where: { id: session.id },
        data: {
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          lastUsedAt: new Date(),
          ipAddress,
          userAgent,
        },
      });

      // Audit log
      await this.auditService.log({
        userId: session.user.id,
        organizationId: session.user.organizationId,
        action: 'auth.refresh_token',
        resourceType: 'user',
        resourceId: session.user.id,
        ipAddress,
        userAgent,
        metadata: { sessionId: session.id },
      });

      return {
        user: this.sanitizeUser(session.user),
        organization: session.user.organization,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        sessionId: session.id,
      };
    } catch (error) {
      this.logger.error('Token refresh failed', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout user and invalidate session
   */
  async logout(userId: string, sessionId: string, ipAddress: string): Promise<void> {
    try {
      // Delete session
      await this.prismaService.userSession.delete({
        where: { id: sessionId },
      });

      // Blacklist any active tokens for this session
      await this.redisService.set(
        `blacklist:session:${sessionId}`,
        'true',
        60 * 60 * 24 * 7, // 7 days
      );

      // Audit log
      await this.auditService.log({
        userId,
        action: 'auth.logout',
        resourceType: 'user',
        resourceId: userId,
        ipAddress,
        metadata: { sessionId },
      });
    } catch (error) {
      this.logger.error(`Logout failed for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Verify MFA token and complete login
   */
  async verifyMFA(verifyMFADto: VerifyMFADto, ipAddress: string, userAgent: string): Promise<AuthResult> {
    const { mfaToken, code } = verifyMFADto;

    try {
      // Verify MFA token
      const decoded = this.jwtService.verify(mfaToken, { secret: this.JWT_SECRET }) as any;
      const userId = decoded.sub;

      // Get user
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: { organization: true },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid MFA token');
      }

      // Verify MFA code
      const isValidCode = await this.mfaService.verifyCode(user.mfaSecret, code);
      if (!isValidCode) {
        await this.handleFailedLogin(user.email, ipAddress, 'invalid_mfa');
        throw new UnauthorizedException('Invalid MFA code');
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Create session
      const session = await this.createSession(user, tokens.refreshToken, ipAddress, userAgent, false);

      // Update last login
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Clear failed login attempts
      await this.clearFailedLoginAttempts(user.email);

      // Audit log
      await this.auditService.log({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'auth.mfa_verified',
        resourceType: 'user',
        resourceId: user.id,
        ipAddress,
        userAgent,
        metadata: { sessionId: session.id },
      });

      return {
        user: this.sanitizeUser(user),
        organization: user.organization,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        sessionId: session.id,
      };
    } catch (error) {
      this.logger.error('MFA verification failed', error);
      throw error;
    }
  }

  /**
   * Enable MFA for user
   */
  async enableMFA(userId: string, enableMFADto: EnableMFADto): Promise<{ backupCodes: string[] }> {
    const { code } = enableMFADto;

    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate MFA secret if not exists
      let mfaSecret = user.mfaSecret;
      if (!mfaSecret) {
        mfaSecret = this.mfaService.generateSecret();
      }

      // Verify setup code
      const isValidCode = this.mfaService.verifyCode(mfaSecret, code);
      if (!isValidCode) {
        throw new BadRequestException('Invalid MFA code');
      }

      // Generate backup codes
      const backupCodes = this.mfaService.generateBackupCodes();

      // Update user
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          mfaEnabled: true,
          mfaSecret,
          mfaBackupCodes: backupCodes,
        },
      });

      // Audit log
      await this.auditService.log({
        userId,
        organizationId: user.organizationId,
        action: 'auth.mfa_enabled',
        resourceType: 'user',
        resourceId: userId,
      });

      return { backupCodes };
    } catch (error) {
      this.logger.error(`Failed to enable MFA for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Validate JWT token and return user info
   */
  async validateToken(token: string): Promise<User> {
    try {
      const decoded = this.jwtService.verify(token, { secret: this.JWT_SECRET }) as JwtPayload;
      
      // Check if token is blacklisted
      const isBlacklisted = await this.redisService.get(`blacklist:session:${decoded.sessionId}`);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Get user
      const user = await this.prismaService.user.findUnique({
        where: { id: decoded.sub },
        include: { organization: true },
      });

      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('User not found or inactive');
      }

      return user;
    } catch (error) {
      this.logger.error('Token validation failed', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Don't reveal if user exists
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update user
      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
        },
      });

      // Send reset email
      await this.emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);

      // Audit log
      await this.auditService.log({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'auth.password_reset_requested',
        resourceType: 'user',
        resourceId: user.id,
      });
    } catch (error) {
      this.logger.error(`Password reset request failed for email: ${email}`, error);
      // Don't throw error to avoid revealing user existence
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;

    try {
      // Find user by reset token
      const user = await this.prismaService.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { gt: new Date() },
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Validate password strength
      await this.securityService.validatePasswordStrength(newPassword);

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

      // Update user
      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

      // Invalidate all sessions
      await this.prismaService.userSession.deleteMany({
        where: { userId: user.id },
      });

      // Audit log
      await this.auditService.log({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'auth.password_reset_completed',
        resourceType: 'user',
        resourceId: user.id,
      });
    } catch (error) {
      this.logger.error('Password reset failed', error);
      throw error;
    }
  }

  // Private helper methods

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      sessionId: uuidv4(),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.JWT_SECRET,
      expiresIn: this.JWT_EXPIRES_IN,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.JWT_REFRESH_SECRET,
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
    });

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour for access token

    return { accessToken, refreshToken, expiresAt };
  }

  private async createSession(
    user: User,
    refreshToken: string,
    ipAddress: string,
    userAgent: string,
    rememberMe: boolean,
  ): Promise<any> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7)); // 30 days if remember me, 7 days otherwise

    return await this.prismaService.userSession.create({
      data: {
        userId: user.id,
        token: refreshToken,
        refreshToken,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  }

  private async generateMFAToken(userId: string): Promise<string> {
    return this.jwtService.sign(
      { sub: userId, type: 'mfa' },
      { secret: this.JWT_SECRET, expiresIn: '10m' },
    );
  }

  private async checkAccountLockout(email: string): Promise<void> {
    const lockoutKey = `lockout:${email}`;
    const lockoutTime = await this.redisService.get(lockoutKey);
    
    if (lockoutTime) {
      const unlockTime = new Date(parseInt(lockoutTime));
      if (unlockTime > new Date()) {
        const remainingTime = Math.ceil((unlockTime.getTime() - Date.now()) / 1000 / 60);
        throw new UnauthorizedException(`Account locked. Try again in ${remainingTime} minutes.`);
      }
    }
  }

  private async handleFailedLogin(email: string, ipAddress: string, reason: string): Promise<void> {
    const attemptsKey = `attempts:${email}`;
    const attempts = await this.redisService.incr(attemptsKey);
    
    if (attempts === 1) {
      await this.redisService.expire(attemptsKey, 900); // 15 minutes
    }
    
    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      const lockoutKey = `lockout:${email}`;
      const unlockTime = Date.now() + (this.LOCKOUT_DURATION * 1000);
      await this.redisService.set(lockoutKey, unlockTime.toString(), this.LOCKOUT_DURATION);
      
      // Send security alert email
      await this.emailService.sendSecurityAlert(email, {
        type: 'account_lockout',
        ipAddress,
        timestamp: new Date(),
        reason,
      });
    }
  }

  private async clearFailedLoginAttempts(email: string): Promise<void> {
    const attemptsKey = `attempts:${email}`;
    const lockoutKey = `lockout:${email}`;
    
    await this.redisService.del(attemptsKey);
    await this.redisService.del(lockoutKey);
  }

  private sanitizeUser(user: any): User {
    const { passwordHash, mfaSecret, mfaBackupCodes, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private getDefaultQuota(subscriptionTier: string): any {
    const quotas = {
      free: { projects: 1, storage: 1000, apiCalls: 1000, annotations: 1000 },
      starter: { projects: 10, storage: 10000, apiCalls: 10000, annotations: 10000 },
      professional: { projects: 100, storage: 100000, apiCalls: 100000, annotations: 100000 },
      enterprise: { projects: -1, storage: -1, apiCalls: -1, annotations: -1 },
    };
    return quotas[subscriptionTier] || quotas.free;
  }

  private getEmptyUsage(): any {
    return { projects: 0, storage: 0, apiCalls: 0, annotations: 0 };
  }
} 