/**
 * G3D AI Services - Authentication Controller
 * Comprehensive authentication and authorization with enterprise features
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { User, IUser } from './models/User';
import { Organization, IOrganization } from './models/Organization';

// Types
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        roles: string[];
        scopes: string[];
        organizationId: string;
        subscription: any;
    };
    requestId?: string;
}

interface LoginRequest {
    email: string;
    password: string;
    mfaCode?: string;
    rememberMe?: boolean;
}

interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
    inviteToken?: string;
}

interface MFASetupResponse {
    secret: string;
    qrCode: string;
    backupCodes: string[];
}

// Rate limiting configurations
const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        error: 'Too many login attempts, please try again later.',
        retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false
});

const registerRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour per IP
    message: {
        error: 'Too many registration attempts, please try again later.',
        retryAfter: 60 * 60
    }
});

const passwordResetRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset attempts per hour
    message: {
        error: 'Too many password reset attempts, please try again later.',
        retryAfter: 60 * 60
    }
});

export class AuthController {
    private securityService: any;
    private emailService: any;
    private auditLogger: any;

    constructor() {
        // Initialize services as stubs
        this.securityService = {
            validatePassword: (password: string) => ({ isValid: true, requirements: [] }),
            validateInviteToken: async (token: string) => ({ organizationId: 'org123' })
        };
        this.emailService = {
            sendVerificationEmail: async (email: string, token: string, name: string) => {}
        };
        this.auditLogger = {
            log: async (data: any) => {}
        };
    }

    /**
     * User Registration
     */
    register = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array()
                });
                return;
            }

            const { email, password, firstName, lastName, organizationName, inviteToken }: RegisterRequest = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(409).json({
                    error: 'User already exists with this email'
                });
                return;
            }

            // Validate password strength
            const passwordValidation = this.securityService.validatePassword(password);
            if (!passwordValidation.isValid) {
                res.status(400).json({
                    error: 'Password does not meet security requirements',
                    requirements: passwordValidation.requirements
                });
                return;
            }

            let organization;
            let isNewOrganization = false;

            // Handle organization creation or invitation
            if (inviteToken) {
                // Process invitation
                const invitation = await this.securityService.validateInviteToken(inviteToken);
                if (!invitation) {
                    res.status(400).json({
                        error: 'Invalid or expired invitation token'
                    });
                    return;
                }
                organization = await Organization.findById(invitation.organizationId);
            } else {
                // Create new organization
                if (!organizationName) {
                    res.status(400).json({
                        error: 'Organization name is required for new registrations'
                    });
                    return;
                }

                const orgSlug = organizationName.toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');

                organization = await Organization.create({
                    name: organizationName,
                    slug: orgSlug,
                    billingEmail: email,
                    owner: null, // Will be set after user creation
                    members: [],
                    admins: []
                });

                await organization.save();
                isNewOrganization = true;
            }

            // Create user
            const user = new User({
                email,
                password,
                firstName,
                lastName,
                organizationId: organization._id,
                roles: isNewOrganization ? ['admin'] : ['user'],
                scopes: isNewOrganization ? [
                    'medical:read', 'medical:write', 'code:read', 'code:write',
                    'creative:read', 'creative:write', 'data:read', 'data:write'
                ] : ['chat:read', 'translate:read'],
                serviceAccess: isNewOrganization ? {
                    visionPro: true, codeForge: true, creativeStudio: true,
                    dataForge: true, secureAI: true, autoML: true,
                    chatBuilder: true, videoAI: true, financeAI: true,
                    healthAI: true, voiceAI: true, translateAI: true,
                    documind: true, mesh3d: true, edgeAI: true, legalAI: true
                } : {
                    visionPro: false, codeForge: false, creativeStudio: false,
                    dataForge: false, secureAI: false, autoML: false,
                    chatBuilder: true, videoAI: false, financeAI: false,
                    healthAI: false, voiceAI: false, translateAI: true,
                    documind: false, mesh3d: false, edgeAI: false, legalAI: false
                },
                subscription: {
                    plan: isNewOrganization ? 'professional' : 'free',
                    status: 'trialing',
                    features: isNewOrganization ? [
                        'all-services', 'advanced-analytics', 'priority-support',
                        'custom-integrations', 'white-label'
                    ] : ['basic-access'],
                    limits: isNewOrganization ? {
                        requests: 50000,
                        storage: 100000000000, // 100GB
                        users: 50,
                        projects: 100,
                        apiCalls: 500000
                    } : {
                        requests: 1000,
                        storage: 1000000000, // 1GB
                        users: 1,
                        projects: 3,
                        apiCalls: 10000
                    },
                    usage: {
                        requests: 0,
                        storage: 0,
                        apiCalls: 0,
                        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    },
                    billingCycle: 'monthly',
                    trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                },
                compliance: {
                    gdprConsent: true,
                    gdprConsentDate: new Date(),
                    ccpaOptOut: false,
                    termsAccepted: true,
                    termsAcceptedDate: new Date(),
                    privacyPolicyAccepted: true,
                    privacyPolicyAcceptedDate: new Date()
                }
            });

            await user.save();

            // Update organization with owner/member
            if (isNewOrganization) {
                organization.owner = user._id;
                organization.admins = [user._id];
            }
            organization.members.push(user._id);
            await organization.save();

            // Generate email verification token
            const verificationToken = user.generateEmailVerificationToken();
            await user.save();

            // Send verification email
            await this.emailService.sendVerificationEmail(user.email, verificationToken, user.firstName);

            // Log registration
            await this.auditLogger.log({
                action: 'user_registered',
                userId: user._id,
                organizationId: organization._id,
                metadata: {
                    email: user.email,
                    isNewOrganization,
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                }
            });

            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailVerified: !!user.emailVerifiedAt,
                    organization: {
                        id: organization._id,
                        name: organization.name,
                        slug: organization.slug
                    },
                    subscriptionId: user.subscriptionId
                },
                requiresEmailVerification: true
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                error: 'Registration failed',
                message: 'An unexpected error occurred'
            });
        }
    };

    /**
     * User Login
     */
    login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array()
                });
                return;
            }

            const { email, password, mfaCode, rememberMe }: LoginRequest = req.body;

            // Find user and include password field
            const user = await User.findOne({ email, isActive: true }).select('+password');
            if (!user) {
                res.status(401).json({
                    error: 'Invalid credentials'
                });
                return;
            }

            // Check if account is locked
            if (user.isLocked()) {
                res.status(423).json({
                    error: 'Account temporarily locked due to too many failed login attempts',
                    lockUntil: user.lockUntil
                });
                return;
            }

            // Verify password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                await user.incrementLoginAttempts();

                await this.auditLogger.log({
                    action: 'login_failed',
                    userId: user._id,
                    metadata: {
                        reason: 'invalid_password',
                        ip: req.ip,
                        userAgent: req.get('User-Agent')
                    }
                });

                res.status(401).json({
                    error: 'Invalid credentials'
                });
                return;
            }

            // Check MFA if enabled
            if (user.mfaEnabled) {
                if (!mfaCode) {
                    res.status(200).json({
                        requiresMFA: true,
                        message: 'MFA code required'
                    });
                    return;
                }

                const isMFAValid = speakeasy.totp.verify({
                    secret: user.mfaSecret!,
                    encoding: 'base32',
                    token: mfaCode,
                    window: 2
                });

                if (!isMFAValid) {
                    // Check backup codes
                    const isBackupCodeValid = user.mfaBackupCodes.includes(mfaCode);
                    if (isBackupCodeValid) {
                        // Remove used backup code
                        user.mfaBackupCodes = user.mfaBackupCodes.filter(code => code !== mfaCode);
                        await user.save();
                    } else {
                        await user.incrementLoginAttempts();

                        await this.auditLogger.log({
                            action: 'login_failed',
                            userId: user._id,
                            metadata: {
                                reason: 'invalid_mfa',
                                ip: req.ip,
                                userAgent: req.get('User-Agent')
                            }
                        });

                        res.status(401).json({
                            error: 'Invalid MFA code'
                        });
                        return;
                    }
                }
            }

            // Check email verification
            if (!user.emailVerifiedAt) {
                res.status(403).json({
                    error: 'Email verification required',
                    message: 'Please verify your email address before logging in'
                });
                return;
            }

            // Reset login attempts and update last login
            await user.resetLoginAttempts();
            await user.updateLastLogin();

            // Generate tokens
            const accessToken = user.generateAuthToken();
            const refreshToken = user.generateRefreshToken();

            // Get organization details
            const organization = await Organization.findById(user.organizationId);

            // Set refresh token cookie
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict' as const,
                maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 7 days or 1 day
            };

            res.cookie('refreshToken', refreshToken, cookieOptions);

            // Log successful login
            await this.auditLogger.log({
                action: 'login_success',
                userId: user._id,
                organizationId: user.organizationId,
                metadata: {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    mfaUsed: user.mfaEnabled
                }
            });

            res.json({
                message: 'Login successful',
                accessToken,
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    displayName: user.displayName || `${user.firstName} ${user.lastName}`,
                    avatar: user.avatar,
                    roles: user.roles,
                    scopes: user.scopes,
                    serviceAccess: user.serviceAccess,
                    preferences: user.preferences,
                    subscriptionId: user.subscriptionId,
                    organization: organization ? {
                        id: organization._id,
                        name: organization.name,
                        slug: organization.slug,
                        settings: organization.settings
                    } : null
                },
                expiresIn: '24h'
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                error: 'Login failed',
                message: 'An unexpected error occurred'
            });
        }
    };

    /**
     * Refresh Access Token
     */
    refreshToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                res.status(401).json({
                    error: 'Refresh token not provided'
                });
                return;
            }

            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret') as any;

            if (decoded.type !== 'refresh') {
                res.status(401).json({
                    error: 'Invalid token type'
                });
                return;
            }

            // Find user
            const user = await User.findById(decoded.userId);
            if (!user || !user.isActive) {
                res.status(401).json({
                    error: 'User not found or inactive'
                });
                return;
            }

            // Generate new access token
            const accessToken = user.generateAuthToken();

            res.json({
                accessToken,
                expiresIn: '24h'
            });

        } catch (error) {
            console.error('Token refresh error:', error);
            res.status(401).json({
                error: 'Invalid refresh token'
            });
        }
    };

    /**
     * Logout
     */
    logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            // Clear refresh token cookie
            res.clearCookie('refreshToken');

            // Log logout
            if (req.user) {
                await this.auditLogger.log({
                    action: 'logout',
                    userId: req.user.id,
                    metadata: {
                        ip: req.ip,
                        userAgent: req.get('User-Agent')
                    }
                });
            }

            res.json({
                message: 'Logged out successfully'
            });

        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                error: 'Logout failed'
            });
        }
    };

    /**
     * Setup Multi-Factor Authentication
     */
    setupMFA = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    error: 'Authentication required'
                });
                return;
            }

            const user = await User.findById(req.user.id);
            if (!user) {
                res.status(404).json({
                    error: 'User not found'
                });
                return;
            }

            if (user.mfaEnabled) {
                res.status(400).json({
                    error: 'MFA is already enabled'
                });
                return;
            }

            // Generate MFA secret
            const secret = speakeasy.generateSecret({
                name: `G3D AI Services (${user.email})`,
                length: 32
            });

            // Generate backup codes
            const backupCodes = Array.from({ length: 10 }, () =>
                crypto.randomBytes(4).toString('hex').toUpperCase()
            );

            // Generate QR code
            const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

            // Store secret temporarily (not enabled until verified)
            user.mfaSecret = secret.base32;
            user.mfaBackupCodes = backupCodes;
            await user.save();

            res.json({
                secret: secret.base32,
                qrCode,
                backupCodes,
                message: 'MFA setup initiated. Please verify with a code to complete setup.'
            });

        } catch (error) {
            console.error('MFA setup error:', error);
            res.status(500).json({
                error: 'MFA setup failed'
            });
        }
    };

    /**
     * Verify and Enable MFA
     */
    verifyMFA = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    error: 'Authentication required'
                });
                return;
            }

            const { code } = req.body;

            if (!code) {
                res.status(400).json({
                    error: 'MFA code is required'
                });
                return;
            }

            const user = await User.findById(req.user.id);
            if (!user || !user.mfaSecret) {
                res.status(400).json({
                    error: 'MFA setup not initiated'
                });
                return;
            }

            // Verify the code
            const isValid = speakeasy.totp.verify({
                secret: user.mfaSecret,
                encoding: 'base32',
                token: code,
                window: 2
            });

            if (!isValid) {
                res.status(400).json({
                    error: 'Invalid MFA code'
                });
                return;
            }

            // Enable MFA
            user.mfaEnabled = true;
            await user.save();

            // Log MFA enablement
            await this.auditLogger.log({
                action: 'mfa_enabled',
                userId: user._id,
                metadata: {
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                }
            });

            res.json({
                message: 'MFA enabled successfully',
                backupCodes: user.mfaBackupCodes
            });

        } catch (error) {
            console.error('MFA verification error:', error);
            res.status(500).json({
                error: 'MFA verification failed'
            });
        }
    };

    /**
     * Disable MFA
     */
    disableMFA = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    error: 'Authentication required'
                });
                return;
            }

            const { password, mfaCode } = req.body;

            const user = await User.findById(req.user.id).select('+password');
            if (!user) {
                res.status(404).json({
                    error: 'User not found'
                });
                return;
            }

            // Verify password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                res.status(401).json({
                    error: 'Invalid password'
                });
                return;
            }

            // Verify MFA code if MFA is currently enabled
            if (user.mfaEnabled) {
                if (!mfaCode) {
                    res.status(400).json({
                        error: 'MFA code is required'
                    });
                    return;
                }

                const isMFAValid = speakeasy.totp.verify({
                    secret: user.mfaSecret!,
                    encoding: 'base32',
                    token: mfaCode,
                    window: 2
                });

                if (!isMFAValid) {
                    res.status(401).json({
                        error: 'Invalid MFA code'
                    });
                    return;
                }
            }

            // Disable MFA
            user.mfaEnabled = false;
            user.mfaSecret = undefined;
            user.mfaBackupCodes = [];
            await user.save();

            // Log MFA disablement
            await this.auditLogger.log({
                action: 'mfa_disabled',
                userId: user._id,
                metadata: {
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                }
            });

            res.json({
                message: 'MFA disabled successfully'
            });

        } catch (error) {
            console.error('MFA disable error:', error);
            res.status(500).json({
                error: 'MFA disable failed'
            });
        }
    };

    /**
     * Request Password Reset
     */
    requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;

            if (!email) {
                res.status(400).json({
                    error: 'Email is required'
                });
                return;
            }

            const user = await User.findOne({ email, isActive: true });

            // Always return success to prevent email enumeration
            res.json({
                message: 'If an account with that email exists, a password reset link has been sent.'
            });

            if (!user) {
                return;
            }

            // Generate reset token
            const resetToken = user.generatePasswordResetToken();
            await user.save();

            // Send reset email
            await this.emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName);

            // Log password reset request
            await this.auditLogger.log({
                action: 'password_reset_requested',
                userId: user._id,
                metadata: {
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                }
            });

        } catch (error) {
            console.error('Password reset request error:', error);
            res.status(500).json({
                error: 'Password reset request failed'
            });
        }
    };

    /**
     * Reset Password
     */
    resetPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const { token, password } = req.body;

            if (!token || !password) {
                res.status(400).json({
                    error: 'Token and password are required'
                });
                return;
            }

            // Hash the token to compare with stored hash
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

            const user = await User.findOne({
                passwordResetToken: hashedToken,
                passwordResetExpires: { $gt: new Date() },
                isActive: true
            });

            if (!user) {
                res.status(400).json({
                    error: 'Invalid or expired reset token'
                });
                return;
            }

            // Validate new password
            const passwordValidation = this.securityService.validatePassword(password);
            if (!passwordValidation.isValid) {
                res.status(400).json({
                    error: 'Password does not meet security requirements',
                    requirements: passwordValidation.requirements
                });
                return;
            }

            // Update password and clear reset token
            user.password = password;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();

            // Log password reset
            await this.auditLogger.log({
                action: 'password_reset_completed',
                userId: user._id,
                metadata: {
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                }
            });

            res.json({
                message: 'Password reset successfully'
            });

        } catch (error) {
            console.error('Password reset error:', error);
            res.status(500).json({
                error: 'Password reset failed'
            });
        }
    };

    /**
     * Verify Email
     */
    verifyEmail = async (req: Request, res: Response): Promise<void> => {
        try {
            const { token } = req.params;

            if (!token) {
                res.status(400).json({
                    error: 'Verification token is required'
                });
                return;
            }

            // Hash the token to compare with stored hash
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

            const user = await User.findOne({
                emailVerificationToken: hashedToken,
                isActive: true
            });

            if (!user) {
                res.status(400).json({
                    error: 'Invalid or expired verification token'
                });
                return;
            }

            // Verify email
            user.emailVerifiedAt = new Date();
            user.emailVerificationToken = undefined;
            await user.save();

            // Log email verification
            await this.auditLogger.log({
                action: 'email_verified',
                userId: user._id,
                metadata: {
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                }
            });

            res.json({
                message: 'Email verified successfully'
            });

        } catch (error) {
            console.error('Email verification error:', error);
            res.status(500).json({
                error: 'Email verification failed'
            });
        }
    };

    /**
     * Get Current User Profile
     */
    getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    error: 'Authentication required'
                });
                return;
            }

            const user = await User.findById(req.user.id).populate('organizationId');
            if (!user) {
                res.status(404).json({
                    error: 'User not found'
                });
                return;
            }

            res.json({
                user: user.toJSON()
            });

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                error: 'Failed to get profile'
            });
        }
    };

    // Rate limiting middleware exports
    static loginRateLimit = loginRateLimit;
    static registerRateLimit = registerRateLimit;
    static passwordResetRateLimit = passwordResetRateLimit;
}

export default AuthController;