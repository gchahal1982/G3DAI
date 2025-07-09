/**
 * G3D Unified Authentication System - Type Definitions
 * Shared across all 24 AI services
 */

// Core User Types
export interface User {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: UserRole;
    status: UserStatus;
    emailVerified: boolean;
    phoneNumber?: string;
    phoneVerified: boolean;
    preferences: UserPreferences;
    metadata: UserMetadata;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
}

export type UserRole = 'user' | 'admin' | 'super_admin' | 'service_admin';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    notifications: NotificationPreferences;
    privacy: PrivacyPreferences;
    accessibility: AccessibilityPreferences;
}

export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
    security: boolean;
    updates: boolean;
    digest: 'daily' | 'weekly' | 'monthly' | 'never';
}

export interface PrivacyPreferences {
    profileVisibility: 'public' | 'private' | 'team_only';
    dataSharing: boolean;
    analytics: boolean;
    thirdPartyIntegrations: boolean;
}

export interface AccessibilityPreferences {
    highContrast: boolean;
    largeText: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
}

export interface UserMetadata {
    registrationSource: string;
    referralCode?: string;
    lastActiveService?: string;
    totalLoginCount: number;
    failedLoginAttempts: number;
    securityFlags: string[];
    complianceFlags: string[];
}

// Authentication Types
export interface AuthRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
    captchaToken?: string;
    deviceInfo?: DeviceInfo;
}

export interface AuthResponse {
    success: boolean;
    user?: User;
    tokens?: AuthTokens;
    mfaRequired?: boolean;
    mfaToken?: string;
    error?: AuthError;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
    scope: string[];
}

export interface DeviceInfo {
    userAgent: string;
    ipAddress: string;
    deviceId: string;
    platform: string;
    browser: string;
    location?: GeoLocation;
}

export interface GeoLocation {
    country: string;
    region: string;
    city: string;
    latitude?: number;
    longitude?: number;
}

// Multi-Factor Authentication
export interface MFASetup {
    id: string;
    userId: string;
    type: MFAType;
    enabled: boolean;
    backupCodes: string[];
    createdAt: Date;
    lastUsedAt?: Date;
}

export type MFAType = 'totp' | 'sms' | 'email' | 'hardware_key' | 'biometric';

export interface MFAChallenge {
    token: string;
    type: MFAType;
    expiresAt: Date;
    attempts: number;
    maxAttempts: number;
}

export interface MFAVerification {
    token: string;
    code: string;
    deviceInfo?: DeviceInfo;
}

// Session Management
export interface UserSession {
    id: string;
    userId: string;
    deviceInfo: DeviceInfo;
    createdAt: Date;
    lastActivityAt: Date;
    expiresAt: Date;
    status: SessionStatus;
    services: ServiceAccess[];
}

export type SessionStatus = 'active' | 'expired' | 'revoked' | 'suspicious';

export interface ServiceAccess {
    serviceId: string;
    serviceName: string;
    permissions: Permission[];
    lastAccessAt: Date;
    accessCount: number;
}

// Permissions and Access Control
export interface Permission {
    resource: string;
    action: string;
    conditions?: PermissionCondition[];
}

export interface PermissionCondition {
    field: string;
    operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'lt' | 'gte' | 'lte';
    value: any;
}

// Organization and Team Management
export interface Organization {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    website?: string;
    industry?: string;
    size: OrganizationSize;
    plan: SubscriptionPlan;
    settings: OrganizationSettings;
    billing: BillingInfo;
    members: OrganizationMember[];
    teams: Team[];
    createdAt: Date;
    updatedAt: Date;
}

export type OrganizationSize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';

export interface OrganizationMember {
    userId: string;
    organizationId: string;
    role: OrganizationRole;
    permissions: Permission[];
    joinedAt: Date;
    invitedBy?: string;
    status: MemberStatus;
}

export type OrganizationRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

export type MemberStatus = 'active' | 'invited' | 'suspended' | 'removed';

export interface Team {
    id: string;
    organizationId: string;
    name: string;
    description?: string;
    members: TeamMember[];
    permissions: Permission[];
    services: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface TeamMember {
    userId: string;
    teamId: string;
    role: TeamRole;
    joinedAt: Date;
}

export type TeamRole = 'lead' | 'member' | 'viewer';

// Subscription and Billing
export interface SubscriptionPlan {
    id: string;
    name: string;
    type: PlanType;
    price: number;
    currency: string;
    billing: BillingCycle;
    features: PlanFeature[];
    limits: PlanLimits;
    trial?: TrialInfo;
}

export type PlanType = 'free' | 'starter' | 'professional' | 'enterprise' | 'custom';

export type BillingCycle = 'monthly' | 'yearly' | 'custom';

export interface PlanFeature {
    name: string;
    description: string;
    included: boolean;
    limit?: number;
    unit?: string;
}

export interface PlanLimits {
    users: number;
    storage: number; // GB
    apiCalls: number;
    services: string[];
    support: SupportLevel;
}

export type SupportLevel = 'community' | 'email' | 'priority' | 'dedicated';

export interface TrialInfo {
    duration: number; // days
    features: string[];
    autoUpgrade: boolean;
}

export interface BillingInfo {
    customerId: string;
    subscriptionId?: string;
    paymentMethod?: PaymentMethod;
    billingAddress?: Address;
    taxInfo?: TaxInfo;
    invoices: Invoice[];
    usage: UsageMetrics;
}

export interface PaymentMethod {
    id: string;
    type: PaymentType;
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
}

export type PaymentType = 'card' | 'bank_account' | 'paypal' | 'wire_transfer';

export interface Address {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface TaxInfo {
    taxId?: string;
    taxExempt: boolean;
    taxRate: number;
}

export interface Invoice {
    id: string;
    number: string;
    amount: number;
    currency: string;
    status: InvoiceStatus;
    dueDate: Date;
    paidAt?: Date;
    items: InvoiceItem[];
    downloadUrl?: string;
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    service: string;
    period: DateRange;
}

export interface DateRange {
    start: Date;
    end: Date;
}

export interface UsageMetrics {
    period: DateRange;
    services: ServiceUsage[];
    totalCost: number;
    projectedCost: number;
}

export interface ServiceUsage {
    serviceId: string;
    serviceName: string;
    usage: number;
    unit: string;
    cost: number;
    limit?: number;
}

// OAuth and SSO
export interface OAuthProvider {
    id: string;
    name: string;
    type: OAuthProviderType;
    clientId: string;
    enabled: boolean;
    scopes: string[];
    configuration: OAuthConfiguration;
}

export type OAuthProviderType = 'google' | 'microsoft' | 'github' | 'slack' | 'custom';

export interface OAuthConfiguration {
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    revokeUrl?: string;
    additionalParams?: Record<string, string>;
}

export interface SSOConfiguration {
    id: string;
    organizationId: string;
    provider: SSOProvider;
    enabled: boolean;
    configuration: SSOProviderConfiguration;
    attributeMapping: AttributeMapping;
}

export type SSOProvider = 'saml' | 'oidc' | 'ldap' | 'active_directory';

export interface SSOProviderConfiguration {
    entityId?: string;
    ssoUrl?: string;
    certificate?: string;
    issuer?: string;
    audience?: string;
    [key: string]: any;
}

export interface AttributeMapping {
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    department?: string;
    [key: string]: string | undefined;
}

// Security and Audit
export interface SecurityEvent {
    id: string;
    type: SecurityEventType;
    severity: SecuritySeverity;
    userId?: string;
    organizationId?: string;
    description: string;
    metadata: SecurityEventMetadata;
    resolved: boolean;
    resolvedBy?: string;
    resolvedAt?: Date;
    createdAt: Date;
}

export type SecurityEventType =
    | 'login_success' | 'login_failure' | 'password_change' | 'mfa_enabled' | 'mfa_disabled'
    | 'suspicious_activity' | 'account_locked' | 'permission_escalation' | 'data_access'
    | 'api_key_created' | 'api_key_revoked' | 'session_hijack' | 'brute_force_attempt';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEventMetadata {
    ipAddress?: string;
    userAgent?: string;
    location?: GeoLocation;
    deviceInfo?: DeviceInfo;
    additionalContext?: Record<string, any>;
}

export interface AuditLog {
    id: string;
    userId?: string;
    organizationId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    changes?: AuditChange[];
    metadata: AuditMetadata;
    timestamp: Date;
}

export interface AuditChange {
    field: string;
    oldValue: any;
    newValue: any;
}

export interface AuditMetadata {
    ipAddress: string;
    userAgent: string;
    sessionId: string;
    requestId: string;
    service: string;
    endpoint: string;
    method: string;
}

// API Keys and Integration
export interface APIKey {
    id: string;
    name: string;
    key: string; // hashed
    prefix: string; // visible prefix
    userId: string;
    organizationId?: string;
    permissions: Permission[];
    services: string[];
    rateLimit?: RateLimit;
    expiresAt?: Date;
    lastUsedAt?: Date;
    createdAt: Date;
    status: APIKeyStatus;
}

export type APIKeyStatus = 'active' | 'revoked' | 'expired';

export interface RateLimit {
    requests: number;
    period: number; // seconds
    burst?: number;
}

// Error Handling
export interface AuthError {
    code: AuthErrorCode;
    message: string;
    details?: Record<string, any>;
    timestamp: Date;
}

export type AuthErrorCode =
    | 'INVALID_CREDENTIALS'
    | 'ACCOUNT_LOCKED'
    | 'EMAIL_NOT_VERIFIED'
    | 'MFA_REQUIRED'
    | 'MFA_INVALID'
    | 'TOKEN_EXPIRED'
    | 'TOKEN_INVALID'
    | 'INSUFFICIENT_PERMISSIONS'
    | 'RATE_LIMITED'
    | 'SERVICE_UNAVAILABLE'
    | 'ORGANIZATION_SUSPENDED'
    | 'SUBSCRIPTION_EXPIRED'
    | 'UNKNOWN_ERROR';

// Service Integration
export interface ServiceDefinition {
    id: string;
    name: string;
    displayName: string;
    description: string;
    version: string;
    category: ServiceCategory;
    icon: string;
    color: string;
    endpoints: ServiceEndpoint[];
    permissions: ServicePermission[];
    pricing: ServicePricing;
    status: ServiceStatus;
    dependencies: string[];
}

export type ServiceCategory =
    | 'computer_vision' | 'nlp' | 'generative_ai' | 'enterprise_ai'
    | 'quantum' | 'bio' | 'climate' | 'space' | 'neuro' | 'metaverse';

export interface ServiceEndpoint {
    path: string;
    method: string;
    description: string;
    permissions: string[];
    rateLimit?: RateLimit;
}

export interface ServicePermission {
    name: string;
    description: string;
    required: boolean;
}

export interface ServicePricing {
    model: PricingModel;
    tiers: PricingTier[];
    usage: UsagePricing[];
}

export type PricingModel = 'subscription' | 'usage' | 'hybrid';

export interface PricingTier {
    name: string;
    price: number;
    currency: string;
    billing: BillingCycle;
    features: string[];
    limits: Record<string, number>;
}

export interface UsagePricing {
    metric: string;
    unit: string;
    price: number;
    currency: string;
    includedAmount?: number;
}

export type ServiceStatus = 'active' | 'beta' | 'deprecated' | 'maintenance';

// Organization Settings
export interface OrganizationSettings {
    general: GeneralSettings;
    security: SecuritySettings;
    billing: BillingSettings;
    integrations: IntegrationSettings;
    compliance: ComplianceSettings;
}

export interface GeneralSettings {
    allowMemberInvites: boolean;
    defaultRole: OrganizationRole;
    requireEmailVerification: boolean;
    sessionTimeout: number; // minutes
    dataRetention: number; // days
}

export interface SecuritySettings {
    enforceSSO: boolean;
    requireMFA: boolean;
    allowedDomains: string[];
    ipWhitelist: string[];
    passwordPolicy: PasswordPolicy;
    sessionPolicy: SessionPolicy;
}

export interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    preventReuse: number;
    maxAge: number; // days
}

export interface SessionPolicy {
    maxConcurrentSessions: number;
    idleTimeout: number; // minutes
    absoluteTimeout: number; // hours
    requireReauth: boolean;
}

export interface BillingSettings {
    autoUpgrade: boolean;
    usageAlerts: boolean;
    alertThreshold: number; // percentage
    invoiceEmails: string[];
    paymentFailureRetries: number;
}

export interface IntegrationSettings {
    allowedServices: string[];
    webhookUrl?: string;
    webhookSecret?: string;
    apiRateLimit: RateLimit;
}

export interface ComplianceSettings {
    dataProcessingAgreement: boolean;
    gdprCompliance: boolean;
    hipaaCompliance: boolean;
    soc2Compliance: boolean;
    auditRetention: number; // days
    dataLocation: string[];
}

// Webhooks and Events
export interface Webhook {
    id: string;
    url: string;
    events: WebhookEvent[];
    secret: string;
    active: boolean;
    createdAt: Date;
    lastTriggeredAt?: Date;
    failureCount: number;
}

export type WebhookEvent =
    | 'user.created' | 'user.updated' | 'user.deleted'
    | 'organization.created' | 'organization.updated'
    | 'subscription.created' | 'subscription.updated' | 'subscription.cancelled'
    | 'invoice.paid' | 'invoice.failed'
    | 'security.alert' | 'usage.threshold';

export interface WebhookPayload {
    id: string;
    event: WebhookEvent;
    timestamp: Date;
    data: any;
    organizationId?: string;
}

// Export all types
export * from './auth.types';