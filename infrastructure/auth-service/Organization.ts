import mongoose, { Schema, Document } from 'mongoose';

// Organization interface
export interface IOrganization extends Document {
    name: string;
    slug: string;
    billingEmail: string;
    owner: mongoose.Types.ObjectId | null;
    members: mongoose.Types.ObjectId[];
    admins: mongoose.Types.ObjectId[];
    settings: {
        general: {
            allowMemberInvites: boolean;
            defaultRole: string;
            requireEmailVerification: boolean;
            sessionTimeout: number;
            dataRetention: number;
        };
        security: {
            enforceSSO: boolean;
            requireMFA: boolean;
            allowedDomains: string[];
            ipWhitelist: string[];
        };
        billing: {
            autoUpgrade: boolean;
            usageAlerts: boolean;
            alertThreshold: number;
            invoiceEmails: string[];
        };
    };
    createdAt: Date;
    updatedAt: Date;
}

// Organization schema
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
        match: /^[a-z0-9-]+$/
    },
    billingEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    admins: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    settings: {
        general: {
            allowMemberInvites: { type: Boolean, default: true },
            defaultRole: { type: String, default: 'member' },
            requireEmailVerification: { type: Boolean, default: true },
            sessionTimeout: { type: Number, default: 60 }, // minutes
            dataRetention: { type: Number, default: 365 } // days
        },
        security: {
            enforceSSO: { type: Boolean, default: false },
            requireMFA: { type: Boolean, default: false },
            allowedDomains: [{ type: String }],
            ipWhitelist: [{ type: String }]
        },
        billing: {
            autoUpgrade: { type: Boolean, default: false },
            usageAlerts: { type: Boolean, default: true },
            alertThreshold: { type: Number, default: 80 }, // percentage
            invoiceEmails: [{ type: String }]
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
OrganizationSchema.index({ slug: 1 });
OrganizationSchema.index({ billingEmail: 1 });
OrganizationSchema.index({ owner: 1 });
OrganizationSchema.index({ createdAt: -1 });

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema); 