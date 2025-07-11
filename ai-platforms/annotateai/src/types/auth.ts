export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  organization?: Organization;
  preferences: UserPreferences;
  subscription: SubscriptionDetails;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  twoFactorEnabled: boolean;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  teamSize: number;
  settings: OrganizationSettings;
  members: User[];
  subscription: SubscriptionDetails;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  ANNOTATOR = 'annotator',
  VIEWER = 'viewer'
}

export enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

export interface SubscriptionDetails {
  id: string;
  plan: SubscriptionPlan;
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: Date;
  usage: {
    projects: number;
    storage: number;
    apiCalls: number;
    annotations: number;
    teamMembers: number;
    modelTraining: number;
    exports: number;
  };
  limits: {
    projects: number | 'unlimited';
    storage: number | 'unlimited';
    apiCalls: number | 'unlimited';
    annotations: number | 'unlimited';
    teamMembers: number | 'unlimited';
    modelTraining: number | 'unlimited';
    exports: number | 'unlimited';
    supportLevel: 'basic' | 'priority' | 'dedicated';
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: {
      projectUpdates: boolean;
      teamInvites: boolean;
      billingAlerts: boolean;
      securityAlerts: boolean;
      productUpdates: boolean;
      weeklyDigest: boolean;
    };
    browser: boolean;
    mobile: boolean;
    push: {
      projectUpdates: boolean;
      mentions: boolean;
      deadlines: boolean;
      systemAlerts: boolean;
    };
    inApp: {
      projectUpdates: boolean;
      teamActivity: boolean;
      systemNotifications: boolean;
    };
  };
  language: string;
  timezone: string;
  privacy: {
    analyticsEnabled: boolean;
    crashReportingEnabled: boolean;
    dataSharingEnabled: boolean;
    activityLogging: boolean;
    profileVisibility: 'public' | 'private' | 'organization' | 'team';
  };
  workspace: {
    defaultExportFormat: 'json' | 'xml' | 'csv' | 'coco';
    autoSaveInterval: number;
    keyboardShortcuts: boolean;
    showTutorials: boolean;
    gridSnapping: boolean;
    darkModeAnnotations: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
    keyboardNavigation: boolean;
    screenReader: boolean;
  };
}

export interface OrganizationSettings {
  allowInvites: boolean;
  requireApproval: boolean;
  defaultRole: UserRole;
  ssoEnabled: boolean;
  auditLogging: boolean;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

// Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  organizationSize?: string;
  industry?: string;
  plan?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptMarketing?: boolean;
  inviteToken?: string;
}

export interface AuthResponse {
  user: User;
  organization?: Organization;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// JWT Types
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  iat: number;
  exp: number;
}

// Protected Route Types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPlan?: SubscriptionPlan;
  requiredFeature?: string;
  fallback?: React.ReactNode;
}

export interface AuthGuardProps extends ProtectedRouteProps {
  redirectTo?: string;
}

// Higher Order Component Types
export interface WithAuthProps {
  user: User;
  organization?: Organization;
  isAuthenticated: boolean;
}

export interface AuthComponentProps {
  user?: User;
  organization?: Organization;
  isLoading?: boolean;
} 