import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// User interface with comprehensive business features
export interface IUser extends Document {
    // Basic user information
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    fullName: string; // Virtual property
    avatar?: string;

    // Account status
    isActive: boolean;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerifiedAt?: Date;
    displayName?: string;

    // Authentication
    lastLoginAt?: Date;
    loginCount: number;
    refreshTokens: string[];
    loginAttempts: number;
    lockUntil?: Date;

    // Password management
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    passwordChangedAt?: Date;

    // Multi-factor authentication
    mfaEnabled: boolean;
    mfaSecret?: string;
    mfaBackupCodes: string[];

    // Organization and team management
    organizationId?: mongoose.Types.ObjectId;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    roles: string[]; // Legacy support for roles array
    permissions: string[];
    scopes: string[];

    // Subscription and billing
    subscriptionId?: string; // Stripe subscription ID
    customerId?: string; // Stripe customer ID
    subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | 'unpaid';
    subscriptionPlan: 'free' | 'starter' | 'professional' | 'enterprise';
    subscriptionEndsAt?: Date;
    trialEndsAt?: Date;

    // Service access and usage
    serviceAccess: Map<string, {
        enabled: boolean;
        tier: 'free' | 'starter' | 'professional' | 'enterprise';
        usageLimit: number;
        usageCount: number;
        resetDate: Date;
    }>;

    // API access
    apiKeys: {
        keyId: string;
        name: string;
        key: string; // hashed
        permissions: string[];
        lastUsedAt?: Date;
        usageCount: number;
        rateLimit: number;
        isActive: boolean;
        createdAt: Date;
    }[];

    // Preferences and settings
    preferences: {
        theme: 'light' | 'dark' | 'auto';
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
            marketing: boolean;
        };
    };

    // Analytics and tracking
    analytics: {
        totalApiCalls: number;
        totalAIInferences: number;
        totalDataProcessed: number; // in bytes
        totalCost: number; // in cents
        lastActiveAt: Date;
    };

    // Compliance and privacy
    gdprConsent: boolean;
    gdprConsentDate?: Date;
    dataRetentionPolicy: 'standard' | 'extended' | 'minimal';

    // Timestamps
    createdAt: Date;
    updatedAt: Date;

    // Methods
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateAuthToken(): string;
    generateRefreshToken(): string;
    generateApiKey(name: string, permissions: string[]): Promise<string>;
    trackUsage(serviceName: string, operation: string, cost?: number): Promise<void>;
    canAccessService(serviceName: string): boolean;
    hasPermission(permission: string): boolean;
    generateEmailVerificationToken(): string;
    generatePasswordResetToken(): string;
    isLocked(): boolean;
    incrementLoginAttempts(): Promise<void>;
    resetLoginAttempts(): Promise<void>;
    updateLastLogin(): Promise<void>;
}

// User schema with comprehensive business features
const UserSchema = new Schema<IUser>({
    // Basic user information
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false // Don't include in queries by default
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    avatar: {
        type: String,
        default: null
    },

    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerifiedAt: Date,
    displayName: String,

    // Authentication
    lastLoginAt: Date,
    loginCount: {
        type: Number,
        default: 0
    },
    refreshTokens: [{
        type: String
    }],
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,

    // Password management
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,

    // Multi-factor authentication
    mfaEnabled: {
        type: Boolean,
        default: false
    },
    mfaSecret: String,
    mfaBackupCodes: [{
        type: String
    }],

    // Organization and team management
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization'
    },
    role: {
        type: String,
        enum: ['owner', 'admin', 'member', 'viewer'],
        default: 'owner'
    },
    roles: [{
        type: String
    }],
    permissions: [{
        type: String
    }],
    scopes: [{
        type: String
    }],

    // Subscription and billing
    subscriptionId: String,
    customerId: String,
    subscriptionStatus: {
        type: String,
        enum: ['active', 'canceled', 'past_due', 'incomplete', 'trialing', 'unpaid'],
        default: 'trialing'
    },
    subscriptionPlan: {
        type: String,
        enum: ['free', 'starter', 'professional', 'enterprise'],
        default: 'free'
    },
    subscriptionEndsAt: Date,
    trialEndsAt: {
        type: Date,
        default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
    },

    // Service access and usage
    serviceAccess: {
        type: Map,
        of: {
            enabled: { type: Boolean, default: true },
            tier: {
                type: String,
                enum: ['free', 'starter', 'professional', 'enterprise'],
                default: 'free'
            },
            usageLimit: { type: Number, default: 1000 },
            usageCount: { type: Number, default: 0 },
            resetDate: { type: Date, default: Date.now }
        },
        default: () => {
            const services = [
                'vision-pro', 'aura', 'creative-studio', 'dataforge', 'secureai', 'automl',
                'chatbuilder', 'videoai', 'healthai', 'financeai', 'voiceai', 'translateai',
                'documind', 'mesh3d', 'edgeai', 'legalai'
            ];

            const serviceMap = new Map();
            services.forEach(service => {
                serviceMap.set(service, {
                    enabled: true,
                    tier: 'free',
                    usageLimit: 100, // Free tier limit
                    usageCount: 0,
                    resetDate: new Date()
                });
            });

            return serviceMap;
        }
    },

    // API access
    apiKeys: [{
        keyId: { type: String, required: true },
        name: { type: String, required: true },
        key: { type: String, required: true }, // hashed
        permissions: [{ type: String }],
        lastUsedAt: Date,
        usageCount: { type: Number, default: 0 },
        rateLimit: { type: Number, default: 1000 }, // requests per hour
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
    }],

    // Preferences and settings
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'auto'
        },
        language: {
            type: String,
            default: 'en'
        },
        timezone: {
            type: String,
            default: 'UTC'
        },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            marketing: { type: Boolean, default: false }
        }
    },

    // Analytics and tracking
    analytics: {
        totalApiCalls: { type: Number, default: 0 },
        totalAIInferences: { type: Number, default: 0 },
        totalDataProcessed: { type: Number, default: 0 },
        totalCost: { type: Number, default: 0 },
        lastActiveAt: { type: Date, default: Date.now }
    },

    // Compliance and privacy
    gdprConsent: {
        type: Boolean,
        default: false
    },
    gdprConsentDate: Date,
    dataRetentionPolicy: {
        type: String,
        enum: ['standard', 'extended', 'minimal'],
        default: 'standard'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ organizationId: 1 });
UserSchema.index({ subscriptionStatus: 1 });
UserSchema.index({ 'apiKeys.keyId': 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordChangedAt = new Date();
    next();
});

// Pre-save middleware to update analytics
UserSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.analytics.lastActiveAt = new Date();
    }
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate auth token
UserSchema.methods.generateAuthToken = function (): string {
    return jwt.sign(
        {
            userId: this._id,
            email: this.email,
            role: this.role,
            organizationId: this.organizationId
        },
        process.env.JWT_SECRET || 'default-secret',
        {
            expiresIn: '24h',
            issuer: 'g3d-ai-services',
            audience: 'g3d-users'
        } as jwt.SignOptions
    );
};

// Generate refresh token
UserSchema.methods.generateRefreshToken = function (): string {
    const refreshToken = jwt.sign(
        { userId: this._id },
        process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        {
            expiresIn: '30d',
            issuer: 'g3d-ai-services',
            audience: 'g3d-users'
        }
    );

    this.refreshTokens.push(refreshToken);
    return refreshToken;
};

// Generate API key
UserSchema.methods.generateApiKey = async function (name: string, permissions: string[]): Promise<string> {
    const crypto = require('crypto');
    const apiKey = `g3d_${crypto.randomBytes(32).toString('hex')}`;
    const hashedKey = await bcrypt.hash(apiKey, 12);

    this.apiKeys.push({
        keyId: crypto.randomBytes(16).toString('hex'),
        name,
        key: hashedKey,
        permissions,
        isActive: true,
        usageCount: 0,
        rateLimit: this.subscriptionPlan === 'enterprise' ? 10000 : 1000,
        createdAt: new Date()
    });

    await this.save();
    return apiKey; // Return unhashed key to user (only time they'll see it)
};

// Track usage method
UserSchema.methods.trackUsage = async function (serviceName: string, operation: string, cost: number = 0): Promise<void> {
    // Update service-specific usage
    const serviceAccess = this.serviceAccess.get(serviceName);
    if (serviceAccess) {
        serviceAccess.usageCount += 1;
        this.serviceAccess.set(serviceName, serviceAccess);
    }

    // Update overall analytics
    this.analytics.totalApiCalls += 1;
    if (operation.includes('ai') || operation.includes('inference')) {
        this.analytics.totalAIInferences += 1;
    }
    this.analytics.totalCost += cost;
    this.analytics.lastActiveAt = new Date();

    await this.save();
};

// Check service access
UserSchema.methods.canAccessService = function (serviceName: string): boolean {
    const serviceAccess = this.serviceAccess.get(serviceName);
    if (!serviceAccess || !serviceAccess.enabled) return false;

    // Check if user has exceeded usage limits
    if (serviceAccess.usageCount >= serviceAccess.usageLimit) {
        // Check if it's time to reset (monthly reset)
        const now = new Date();
        const resetDate = new Date(serviceAccess.resetDate);
        resetDate.setMonth(resetDate.getMonth() + 1);

        if (now > resetDate) {
            serviceAccess.usageCount = 0;
            serviceAccess.resetDate = now;
            this.serviceAccess.set(serviceName, serviceAccess);
            return true;
        }

        return false; // Usage limit exceeded
    }

    return true;
};

// Check permissions
UserSchema.methods.hasPermission = function (permission: string): boolean {
    return this.permissions.includes(permission) ||
        this.permissions.includes('*') ||
        this.role === 'owner';
};

// Generate email verification token
UserSchema.methods.generateEmailVerificationToken = function (): string {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = token;
    return token;
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function (): string {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = token;
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return token;
};

// Check if account is locked
UserSchema.methods.isLocked = function (): boolean {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
UserSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates: any = { $inc: { loginAttempts: 1 } };
    
    // After 5 failed attempts, lock for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }
    
    return this.updateOne(updates);
};

// Reset login attempts
UserSchema.methods.resetLoginAttempts = async function (): Promise<void> {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

// Update last login
UserSchema.methods.updateLastLogin = async function (): Promise<void> {
    return this.updateOne({
        $set: { lastLoginAt: new Date() },
        $inc: { loginCount: 1 }
    });
};

export const User = mongoose.model<IUser>('User', UserSchema);