/**
 * G3D AI Services - User Model
 * Comprehensive user management with organizations, subscriptions, and RBAC
 */

import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Interfaces
export interface IUser extends Document {
    // Basic Information
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    displayName: string;
    avatar?: string;

    // Authentication
    emailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    lastLogin?: Date;
    loginAttempts: number;
    lockUntil?: Date;

    // Multi-Factor Authentication
    mfaEnabled: boolean;
    mfaSecret?: string;
    mfaBackupCodes: string[];

    // Authorization
    roles: string[];
    scopes: string[];
    permissions: Record<string, boolean>;

    // Organization & Subscription
    organizationId: Types.ObjectId;
    subscription: {
        plan: 'free' | 'basic' | 'professional' | 'enterprise' | 'custom';
        status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
        features: string[];
        limits: {
            requests: number;
            storage: number;
            users: number;
            projects: number;
            apiCalls: number;
        };
        usage: {
            requests: number;
            storage: number;
            apiCalls: number;
            resetDate: Date;
        };
        billingCycle: 'monthly' | 'yearly';
        stripeCustomerId?: string;
        stripeSubscriptionId?: string;
        trialEnds?: Date;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
    };

    // Service Access
    serviceAccess: {
        visionPro: boolean;
        aura: boolean;
        creativeStudio: boolean;
        dataForge: boolean;
        secureAI: boolean;
        autoML: boolean;
        chatBuilder: boolean;
        videoAI: boolean;
        financeAI: boolean;
        healthAI: boolean;
        voiceAI: boolean;
        translateAI: boolean;
        documind: boolean;
        mesh3d: boolean;
        edgeAI: boolean;
        legalAI: boolean;
    };

    // Preferences & Settings
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
        privacy: {
            profileVisible: boolean;
            analyticsOptOut: boolean;
            dataRetention: number; // days
        };
    };

    // Activity Tracking
    activity: {
        lastActiveService?: string;
        totalSessions: number;
        totalDuration: number; // minutes
        favoriteServices: string[];
        recentProjects: Types.ObjectId[];
    };

    // Compliance & Legal
    compliance: {
        gdprConsent: boolean;
        gdprConsentDate?: Date;
        ccpaOptOut: boolean;
        termsAccepted: boolean;
        termsAcceptedDate?: Date;
        privacyPolicyAccepted: boolean;
        privacyPolicyAcceptedDate?: Date;
    };

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    isActive: boolean;

    // Methods
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateAuthToken(): string;
    generateRefreshToken(): string;
    generatePasswordResetToken(): string;
    generateEmailVerificationToken(): string;
    isLocked(): boolean;
    incrementLoginAttempts(): Promise<void>;
    resetLoginAttempts(): Promise<void>;
    updateLastLogin(): Promise<void>;
    checkServiceAccess(service: string): boolean;
    updateUsage(type: 'requests' | 'storage' | 'apiCalls', amount: number): Promise<void>;
    isWithinLimits(type: 'requests' | 'storage' | 'apiCalls', amount?: number): boolean;
    getFullName(): string;
    toJSON(): any;
}

export interface IOrganization extends Document {
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    website?: string;
    industry?: string;
    size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';

    // Billing
    billingEmail: string;
    billingAddress: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    taxId?: string;

    // Settings
    settings: {
        allowUserInvites: boolean;
        requireEmailVerification: boolean;
        enforceMFA: boolean;
        dataRetentionDays: number;
        allowedDomains: string[];
        ssoEnabled: boolean;
        ssoProvider?: string;
        ssoConfig?: Record<string, any>;
    };

    // Members
    members: Types.ObjectId[];
    admins: Types.ObjectId[];
    owner: Types.ObjectId;

    // Subscription
    subscription: {
        plan: 'free' | 'team' | 'business' | 'enterprise' | 'custom';
        status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
        seats: number;
        usedSeats: number;
        features: string[];
        limits: {
            users: number;
            projects: number;
            storage: number;
            apiCalls: number;
            customIntegrations: number;
        };
        usage: {
            storage: number;
            apiCalls: number;
            projects: number;
            resetDate: Date;
        };
    };

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

// User Schema
const UserSchema = new Schema<IUser>({
    // Basic Information
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
        select: false
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
    displayName: {
        type: String,
        trim: true,
        maxlength: 100
    },
    avatar: {
        type: String,
        default: null
    },

    // Authentication
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,

    // Multi-Factor Authentication
    mfaEnabled: {
        type: Boolean,
        default: false
    },
    mfaSecret: String,
    mfaBackupCodes: [{
        type: String
    }],

    // Authorization
    roles: [{
        type: String,
        enum: [
            'user', 'admin', 'super_admin',
            'medical', 'developer', 'creative', 'analyst', 'security',
            'ml-engineer', 'support', 'media', 'finance', 'health',
            'voice', 'translator', 'document', 'designer', 'infrastructure', 'legal'
        ],
        default: ['user']
    }],
    scopes: [{
        type: String,
        enum: [
            'medical:read', 'medical:write',
            'code:read', 'code:write',
            'creative:read', 'creative:write',
            'data:read', 'data:write',
            'security:read', 'security:write',
            'ml:read', 'ml:write',
            'chat:read', 'chat:write',
            'video:read', 'video:write',
            'finance:read', 'finance:write',
            'health:read', 'health:write',
            'voice:read', 'voice:write',
            'translate:read', 'translate:write',
            'document:read', 'document:write',
            '3d:read', '3d:write',
            'edge:read', 'edge:write',
            'legal:read', 'legal:write'
        ]
    }],
    permissions: {
        type: Map,
        of: Boolean,
        default: new Map()
    },

    // Organization & Subscription
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'basic', 'professional', 'enterprise', 'custom'],
            default: 'free'
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'cancelled', 'past_due', 'trialing'],
            default: 'active'
        },
        features: [{
            type: String
        }],
        limits: {
            requests: { type: Number, default: 1000 },
            storage: { type: Number, default: 1000000000 }, // 1GB in bytes
            users: { type: Number, default: 1 },
            projects: { type: Number, default: 3 },
            apiCalls: { type: Number, default: 10000 }
        },
        usage: {
            requests: { type: Number, default: 0 },
            storage: { type: Number, default: 0 },
            apiCalls: { type: Number, default: 0 },
            resetDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        },
        billingCycle: {
            type: String,
            enum: ['monthly', 'yearly'],
            default: 'monthly'
        },
        stripeCustomerId: String,
        stripeSubscriptionId: String,
        trialEnds: Date,
        currentPeriodStart: { type: Date, default: Date.now },
        currentPeriodEnd: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    },

    // Service Access
    serviceAccess: {
        visionPro: { type: Boolean, default: false },
        aura: { type: Boolean, default: false },
        creativeStudio: { type: Boolean, default: false },
        dataForge: { type: Boolean, default: false },
        secureAI: { type: Boolean, default: false },
        autoML: { type: Boolean, default: false },
        chatBuilder: { type: Boolean, default: true },
        videoAI: { type: Boolean, default: false },
        financeAI: { type: Boolean, default: false },
        healthAI: { type: Boolean, default: false },
        voiceAI: { type: Boolean, default: false },
        translateAI: { type: Boolean, default: true },
        documind: { type: Boolean, default: false },
        mesh3d: { type: Boolean, default: false },
        edgeAI: { type: Boolean, default: false },
        legalAI: { type: Boolean, default: false }
    },

    // Preferences & Settings
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
        },
        privacy: {
            profileVisible: { type: Boolean, default: false },
            analyticsOptOut: { type: Boolean, default: false },
            dataRetention: { type: Number, default: 365 }
        }
    },

    // Activity Tracking
    activity: {
        lastActiveService: String,
        totalSessions: { type: Number, default: 0 },
        totalDuration: { type: Number, default: 0 },
        favoriteServices: [String],
        recentProjects: [{
            type: Schema.Types.ObjectId,
            ref: 'Project'
        }]
    },

    // Compliance & Legal
    compliance: {
        gdprConsent: { type: Boolean, default: false },
        gdprConsentDate: Date,
        ccpaOptOut: { type: Boolean, default: false },
        termsAccepted: { type: Boolean, default: false },
        termsAcceptedDate: Date,
        privacyPolicyAccepted: { type: Boolean, default: false },
        privacyPolicyAcceptedDate: Date
    },

    // Metadata
    isActive: {
        type: Boolean,
        default: true
    },
    deletedAt: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Organization Schema
const OrganizationSchema = new Schema<IOrganization>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    description: {
        type: String,
        maxlength: 500
    },
    logo: String,
    website: String,
    industry: String,
    size: {
        type: String,
        enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
        default: 'small'
    },

    // Billing
    billingEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    billingAddress: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    },
    taxId: String,

    // Settings
    settings: {
        allowUserInvites: { type: Boolean, default: true },
        requireEmailVerification: { type: Boolean, default: true },
        enforceMFA: { type: Boolean, default: false },
        dataRetentionDays: { type: Number, default: 365 },
        allowedDomains: [String],
        ssoEnabled: { type: Boolean, default: false },
        ssoProvider: String,
        ssoConfig: {
            type: Map,
            of: Schema.Types.Mixed
        }
    },

    // Members
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    admins: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Subscription
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'team', 'business', 'enterprise', 'custom'],
            default: 'free'
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'cancelled', 'past_due', 'trialing'],
            default: 'active'
        },
        seats: { type: Number, default: 1 },
        usedSeats: { type: Number, default: 1 },
        features: [String],
        limits: {
            users: { type: Number, default: 1 },
            projects: { type: Number, default: 10 },
            storage: { type: Number, default: 10000000000 }, // 10GB
            apiCalls: { type: Number, default: 100000 },
            customIntegrations: { type: Number, default: 0 }
        },
        usage: {
            storage: { type: Number, default: 0 },
            apiCalls: { type: Number, default: 0 },
            projects: { type: Number, default: 0 },
            resetDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        }
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ organizationId: 1 });
UserSchema.index({ 'subscription.status': 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

OrganizationSchema.index({ slug: 1 });
OrganizationSchema.index({ owner: 1 });
OrganizationSchema.index({ 'subscription.status': 1 });
OrganizationSchema.index({ isActive: 1 });

// Virtuals
UserSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

UserSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save middleware
UserSchema.pre('save', async function (next) {
    // Hash password if modified
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    }

    // Set display name if not provided
    if (!this.displayName) {
        this.displayName = `${this.firstName} ${this.lastName}`;
    }

    // Reset usage if period has ended
    if (this.subscription.usage.resetDate < new Date()) {
        this.subscription.usage.requests = 0;
        this.subscription.usage.storage = 0;
        this.subscription.usage.apiCalls = 0;
        this.subscription.usage.resetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    next();
});

// Methods
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generateAuthToken = function (): string {
    return jwt.sign(
        {
            userId: this._id,
            email: this.email,
            roles: this.roles,
            scopes: this.scopes,
            organizationId: this.organizationId,
            subscription: this.subscription
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
    );
};

UserSchema.methods.generateRefreshToken = function (): string {
    return jwt.sign(
        { userId: this._id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
        { expiresIn: '7d' }
    );
};

UserSchema.methods.generatePasswordResetToken = function (): string {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return resetToken;
};

UserSchema.methods.generateEmailVerificationToken = function (): string {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return verificationToken;
};

UserSchema.methods.isLocked = function (): boolean {
    return !!(this.lockUntil && this.lockUntil > new Date());
};

UserSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < new Date()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }

    const updates: any = { $inc: { loginAttempts: 1 } };

    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
        updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) };
    }

    return this.updateOne(updates);
};

UserSchema.methods.resetLoginAttempts = async function (): Promise<void> {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

UserSchema.methods.updateLastLogin = async function (): Promise<void> {
    this.lastLogin = new Date();
    this.activity.totalSessions += 1;
    return this.save();
};

UserSchema.methods.checkServiceAccess = function (service: string): boolean {
    return this.serviceAccess[service] || false;
};

UserSchema.methods.updateUsage = async function (type: 'requests' | 'storage' | 'apiCalls', amount: number): Promise<void> {
    this.subscription.usage[type] += amount;
    return this.save();
};

UserSchema.methods.isWithinLimits = function (type: 'requests' | 'storage' | 'apiCalls', amount: number = 0): boolean {
    return (this.subscription.usage[type] + amount) <= this.subscription.limits[type];
};

UserSchema.methods.getFullName = function (): string {
    return `${this.firstName} ${this.lastName}`;
};

UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.mfaSecret;
    delete user.passwordResetToken;
    delete user.emailVerificationToken;
    return user;
};

// Export models
export const User = model<IUser>('User', UserSchema);
export const Organization = model<IOrganization>('Organization', OrganizationSchema);

export default { User, Organization };