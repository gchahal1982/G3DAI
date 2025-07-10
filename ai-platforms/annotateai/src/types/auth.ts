export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  organizationId?: string;
  subscription?: UserSubscription;
  preferences: UserPreferences;
  profile: UserProfile;
}

export interface UserProfile {
  bio?: string;
  location?: string;
  timezone: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  phoneNumber?: string;
  website?: string;
  company?: string;
  jobTitle?: string;
}

export interface UserPreferences {
  emailNotifications: EmailNotificationSettings;
  pushNotifications: PushNotificationSettings;
  annotationSettings: AnnotationPreferences;
  privacy: PrivacySettings;
}

export interface EmailNotificationSettings {
  projectUpdates: boolean;
  collaborationInvites: boolean;
  weeklyDigest: boolean;
  systemAlerts: boolean;
  billingNotifications: boolean;
  marketingEmails: boolean;
}

export interface PushNotificationSettings {
  enabled: boolean;
  annotations: boolean;
  mentions: boolean;
  projectDeadlines: boolean;
  systemMaintenance: boolean;
}

export interface AnnotationPreferences {
  defaultTool: AnnotationTool;
  keyboardShortcuts: KeyboardShortcuts;
  autoSave: boolean;
  qualityThreshold: number;
  showAiSuggestions: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'organization' | 'private';
  showEmail: boolean;
  showActivity: boolean;
  allowMentions: boolean;
}

export interface KeyboardShortcuts {
  [key: string]: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ANNOTATOR = 'annotator',
  REVIEWER = 'reviewer',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export interface UserSubscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  usage: UsageMetrics;
}

export enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  TRIALING = 'trialing',
}

export interface UsageMetrics {
  annotationsCount: number;
  storageUsed: number; // in bytes
  apiCalls: number;
  aiInferenceMinutes: number;
  collaboratorsCount: number;
  projectsCount: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  company?: string;
  jobTitle?: string;
  agreeToTerms: boolean;
  subscribeToNewsletter?: boolean;
  referralCode?: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
  isAuthenticated: boolean;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  token: string;
  backupCode?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  description?: string;
  website?: string;
  settings: OrganizationSettings;
  subscription: OrganizationSubscription;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  allowPublicProjects: boolean;
  requireTwoFactor: boolean;
  ssoEnabled: boolean;
  ssoProvider?: SSOProvider;
  dataRetentionDays: number;
  allowedDomains?: string[];
  ipWhitelist?: string[];
}

export interface OrganizationSubscription {
  plan: SubscriptionPlan;
  seats: number;
  usage: OrganizationUsage;
}

export interface OrganizationUsage extends UsageMetrics {
  activeUsers: number;
  totalUsers: number;
}

export enum SSOProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  OKTA = 'okta',
  SAML = 'saml',
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  status: MemberStatus;
  invitedAt: Date;
  joinedAt?: Date;
  invitedBy: string;
}

export enum OrganizationRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

export enum MemberStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  role: OrganizationRole;
  token: string;
  expiresAt: Date;
  invitedBy: string;
  createdAt: Date;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // days
  preventReuse: number; // number of previous passwords
}

export interface SecurityEvent {
  id: string;
  userId: string;
  type: SecurityEventType;
  description: string;
  ipAddress: string;
  userAgent: string;
  location?: GeoLocation;
  createdAt: Date;
}

export enum SecurityEventType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  FAILED_LOGIN = 'failed_login',
  ACCOUNT_LOCKED = 'account_locked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface SessionInfo {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location?: GeoLocation;
  isCurrentSession: boolean;
  lastActiveAt: Date;
  createdAt: Date;
}

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  isMobile: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  USER_NOT_FOUND = 'user_not_found',
  EMAIL_NOT_VERIFIED = 'email_not_verified',
  ACCOUNT_SUSPENDED = 'account_suspended',
  TOO_MANY_ATTEMPTS = 'too_many_attempts',
  INVALID_TOKEN = 'invalid_token',
  TOKEN_EXPIRED = 'token_expired',
  TWO_FACTOR_REQUIRED = 'two_factor_required',
  INVALID_TWO_FACTOR = 'invalid_two_factor',
  WEAK_PASSWORD = 'weak_password',
  EMAIL_ALREADY_EXISTS = 'email_already_exists',
  ORGANIZATION_NOT_FOUND = 'organization_not_found',
  INSUFFICIENT_PERMISSIONS = 'insufficient_permissions',
}

export type AnnotationTool = 
  | 'bounding-box'
  | 'polygon'
  | 'keypoint'
  | 'semantic-segmentation'
  | 'instance-segmentation'
  | 'point-cloud'
  | '3d-object'
  | 'video-tracking';