/**
 * Medical User Type Definitions
 * Comprehensive type system for medical professionals and authentication
 */

// Base user interface
export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  isVerified: boolean;
}

// Medical credentials interface
export interface MedicalCredentials {
  medicalLicense: string;
  licenseState: string;
  npi: string;
  deaNumber?: string;
  boardCertifications: string[];
  medicalSchool: string;
  graduationYear: number;
  residencyProgram?: string;
  fellowshipProgram?: string;
  specializations: string[];
  subspecialties?: string[];
}

// Hospital affiliation interface
export interface HospitalAffiliation {
  hospitalName: string;
  department: string;
  role: string;
  startDate: Date;
  endDate: Date | null;
  isPrimary: boolean;
}

// Medical user interface
export interface MedicalUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  name?: string; // Computed property: firstName + lastName
  role: MedicalRole;
  medicalLicense?: string; // Direct access to license
  credentials: MedicalCredentials;
  affiliations: HospitalAffiliation[];
  permissions: Permission[];
  mfaEnabled: boolean;
  emergencyAccess: boolean;
  sessionTimeout: number;
  maxSessions: number;
  currentSessions: number;
  hipaaCompliance: boolean;
  preferences: UserPreferences;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
  loginAttempts: number;
}

// Medical roles
export type MedicalRole = 
  | 'medical-student'
  | 'resident'
  | 'attending'
  | 'fellow'
  | 'radiologist'
  | 'technologist'
  | 'nurse'
  | 'administrator'
  | 'system-admin'
  | 'super-admin';

// Permissions
export type Permission = 
  | 'view-patient-data'
  | 'edit-patient-data'
  | 'view-dicom-images'
  | 'annotate-images'
  | 'generate-reports'
  | 'approve-reports'
  | 'access-ai-tools'
  | 'manage-users'
  | 'system-administration'
  | 'emergency-access'
  | 'audit-access'
  | 'compliance-access';

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  workspace: WorkspacePreferences;
  accessibility: AccessibilityPreferences;
}

// Notification preferences
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  emergencyAlerts: boolean;
  aiAlerts: boolean;
  reportAlerts: boolean;
  systemAlerts: boolean;
}

// Workspace preferences
export interface WorkspacePreferences {
  defaultWorkspace: string;
  hangingProtocols: string[];
  windowLevelPresets: WindowLevelPreset[];
  annotationDefaults: AnnotationDefaults;
  layout?: 'grid' | 'list' | 'default';
  density?: 'compact' | 'comfortable' | 'spacious';
  showTips?: boolean;
}

// Window level preset
export interface WindowLevelPreset {
  id: string;
  name: string;
  window: number;
  level: number;
  modality: string;
}

// Annotation defaults
export interface AnnotationDefaults {
  defaultTool: string;
  defaultColor: string;
  defaultFontSize: number;
  showMeasurements: boolean;
}

// Accessibility preferences
export interface AccessibilityPreferences {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

// Emergency contact
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// Session interface
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  deviceInfo?: DeviceInfo;
}

// Device info
export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  location?: string;
}

// Authentication request
export interface AuthRequest {
  email: string;
  password: string;
  mfaCode?: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

// Authentication response
export interface AuthResponse {
  success: boolean;
  user?: MedicalUser;
  token?: string;
  refreshToken?: string;
  expiresAt?: Date;
  requiresMFA?: boolean;
  requiresLicense?: boolean;
  error?: string;
}

// Registration request
export interface RegistrationRequest {
  // Personal info
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  
  // Medical credentials
  medicalLicense: string;
  licenseState: string;
  npi: string;
  deaNumber?: string;
  boardCertifications: string[];
  medicalSchool: string;
  graduationYear: number;
  specializations: string[];
  
  // Hospital affiliation
  hospitalName: string;
  department: string;
  position: string;
  
  // Compliance
  hipaaCompliance: boolean;
  
  // Emergency contact
  emergencyContact?: EmergencyContact;
}

// Password reset request
export interface PasswordResetRequest {
  email: string;
  medicalLicense?: string;
  npi?: string;
}

// MFA setup request
export interface MFASetupRequest {
  userId: string;
  method: 'sms' | 'email' | 'app';
  phoneNumber?: string;
  email?: string;
}

// Role-based access control
export interface RolePermissions {
  role: MedicalRole;
  permissions: Permission[];
  description: string;
  level: number;
}

// Audit log entry
export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Medical specializations
export const MEDICAL_SPECIALIZATIONS = [
  'Radiology',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Oncology',
  'Pathology',
  'Emergency Medicine',
  'Internal Medicine',
  'Surgery',
  'Pediatrics',
  'Obstetrics & Gynecology',
  'Anesthesiology',
  'Dermatology',
  'Psychiatry',
  'Ophthalmology',
  'Other'
] as const;

// Medical positions
export const MEDICAL_POSITIONS = [
  'Attending Physician',
  'Resident',
  'Fellow',
  'Medical Student',
  'Radiologic Technologist',
  'Registered Nurse',
  'Physician Assistant',
  'Nurse Practitioner',
  'Clinical Coordinator',
  'Department Head',
  'Administrator',
  'System Administrator'
] as const;

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<MedicalRole, Permission[]> = {
  'medical-student': ['view-patient-data', 'view-dicom-images'],
  'resident': ['view-patient-data', 'view-dicom-images', 'annotate-images', 'generate-reports'],
  'attending': ['view-patient-data', 'edit-patient-data', 'view-dicom-images', 'annotate-images', 'generate-reports', 'approve-reports', 'access-ai-tools'],
  'fellow': ['view-patient-data', 'edit-patient-data', 'view-dicom-images', 'annotate-images', 'generate-reports', 'access-ai-tools'],
  'radiologist': ['view-patient-data', 'edit-patient-data', 'view-dicom-images', 'annotate-images', 'generate-reports', 'approve-reports', 'access-ai-tools'],
  'technologist': ['view-patient-data', 'view-dicom-images', 'annotate-images'],
  'nurse': ['view-patient-data', 'view-dicom-images'],
  'administrator': ['view-patient-data', 'view-dicom-images', 'manage-users', 'audit-access'],
  'system-admin': ['view-patient-data', 'view-dicom-images', 'manage-users', 'system-administration', 'audit-access', 'compliance-access'],
  'super-admin': ['view-patient-data', 'edit-patient-data', 'view-dicom-images', 'annotate-images', 'generate-reports', 'approve-reports', 'access-ai-tools', 'manage-users', 'system-administration', 'emergency-access', 'audit-access', 'compliance-access']
};

// Type guards
export const isMedicalUser = (user: any): user is MedicalUser => {
  return user && typeof user === 'object' && 'credentials' in user && 'affiliations' in user;
};

export const isValidRole = (role: string): role is MedicalRole => {
  return Object.keys(ROLE_PERMISSIONS).includes(role);
};

export const isValidPermission = (permission: string): permission is Permission => {
  return Object.values(ROLE_PERMISSIONS).flat().includes(permission as Permission);
};

// Utility types
export type CreateMedicalUserRequest = Omit<MedicalUser, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>;
export type UpdateMedicalUserRequest = Partial<Pick<MedicalUser, 'firstName' | 'lastName' | 'email' | 'preferences'>>;
export type MedicalUserSummary = Pick<MedicalUser, 'id' | 'firstName' | 'lastName' | 'email' | 'role' | 'credentials' | 'affiliations'>;
export type SessionSummary = Pick<UserSession, 'id' | 'createdAt' | 'lastActivity' | 'ipAddress' | 'deviceInfo'>;

// Default values
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
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
};

export const DEFAULT_SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
export const DEFAULT_MAX_SESSIONS = 3;
export const DEFAULT_MAX_LOGIN_ATTEMPTS = 5;
export const DEFAULT_LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes 