// Medical User Types for MedSight-Pro
import { User, UserRole } from '../../../../shared/auth/types';

export interface MedicalUser extends User {
  // Medical-specific fields
  licenseNumber: string;
  licenseState: string;
  licenseExpiry?: Date;
  npiNumber?: string;
  medicalFacility: string;
  specialty: string;
  boardCertifications?: string[];
  
  // Professional information
  department?: string;
  position?: string;
  experienceYears?: number;
  
  // Compliance and verification
  isLicenseVerified: boolean;
  complianceStatus: ComplianceStatus;
  lastComplianceCheck: Date;
  hipaaTrainingCompleted: boolean;
  hipaaTrainingExpiry?: Date;
  
  // Security
  mfaEnabled: boolean;
  lastSecurityAudit?: Date;
  
  // Medical permissions
  medicalPermissions: MedicalPermission[];
  
  // PHI access controls
  phiAccessLevel: PHIAccessLevel;
  dataRetentionPolicy: DataRetentionPolicy;
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  PENDING_REVIEW = 'pending_review',
  NON_COMPLIANT = 'non_compliant',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended'
}

export enum MedicalPermission {
  // PHI Permissions
  READ_PHI = 'read_phi',
  WRITE_PHI = 'write_phi',
  DELETE_PHI = 'delete_phi',
  EXPORT_PHI = 'export_phi',
  
  // Clinical Permissions
  VIEW_PATIENT_DATA = 'view_patient_data',
  EDIT_PATIENT_DATA = 'edit_patient_data',
  VIEW_MEDICAL_IMAGES = 'view_medical_images',
  ANNOTATE_MEDICAL_IMAGES = 'annotate_medical_images',
  
  // Administrative Permissions
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_USERS = 'manage_users',
  CONFIGURE_SYSTEM = 'configure_system',
  ACCESS_AUDIT_LOGS = 'access_audit_logs',
  
  // Research Permissions
  ACCESS_RESEARCH_DATA = 'access_research_data',
  EXPORT_ANONYMIZED_DATA = 'export_anonymized_data',
  
  // Quality Assurance
  REVIEW_ANNOTATIONS = 'review_annotations',
  APPROVE_STUDIES = 'approve_studies',
  
  // Training and Education
  ACCESS_TRAINING_MATERIALS = 'access_training_materials',
  CREATE_TRAINING_CONTENT = 'create_training_content'
}

export enum PHIAccessLevel {
  NONE = 'none',
  LIMITED = 'limited',       // Can view anonymized data only
  STANDARD = 'standard',     // Can view PHI for assigned patients
  EXTENDED = 'extended',     // Can view PHI for department patients
  FULL = 'full',            // Can view all PHI (admin level)
  EMERGENCY = 'emergency'    // Temporary elevated access
}

export interface DataRetentionPolicy {
  retentionPeriod: number; // in days
  autoDeleteEnabled: boolean;
  archiveBeforeDelete: boolean;
  notifyBeforeExpiry: boolean;
}

export interface MedicalUserProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    title?: string; // Dr., RN, etc.
    phoneNumber?: string;
    alternateEmail?: string;
    profileImage?: string;
  };
  
  medicalCredentials: {
    licenseNumber: string;
    licenseState: string;
    licenseExpiry?: Date;
    npiNumber?: string;
    deaNumber?: string;
    boardCertifications: BoardCertification[];
    medicalSchool?: string;
    graduationYear?: number;
  };
  
  professionalInfo: {
    medicalFacility: string;
    facilityNPI?: string;
    department: string;
    position: string;
    specialty: string;
    subspecialties?: string[];
    experienceYears: number;
    languages?: string[];
  };
  
  preferences: {
    notifications: NotificationPreferences;
    privacy: PrivacyPreferences;
    interface: InterfacePreferences;
    clinical: ClinicalPreferences;
  };
}

export interface BoardCertification {
  board: string;
  certification: string;
  dateIssued: Date;
  expiryDate?: Date;
  certificateNumber?: string;
  isActive: boolean;
}

export interface NotificationPreferences {
  email: {
    newStudies: boolean;
    urgentFindings: boolean;
    systemAlerts: boolean;
    complianceReminders: boolean;
    trainingReminders: boolean;
  };
  
  sms: {
    emergencyAlerts: boolean;
    criticalFindings: boolean;
  };
  
  inApp: {
    newAssignments: boolean;
    reviewRequests: boolean;
    systemUpdates: boolean;
    chatMessages: boolean;
  };
}

export interface PrivacyPreferences {
  shareDataForResearch: boolean;
  allowAnalytics: boolean;
  shareActivityStatus: boolean;
  allowDirectMessages: boolean;
  profileVisibility: 'private' | 'department' | 'facility' | 'network';
}

export interface InterfacePreferences {
  theme: 'light' | 'dark' | 'high-contrast' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  defaultDashboard: string;
  sidebarCollapsed: boolean;
}

export interface ClinicalPreferences {
  defaultImageWindowing: {
    window: number;
    level: number;
  };
  
  annotationDefaults: {
    toolType: 'rectangle' | 'circle' | 'polygon' | 'freehand';
    lineWidth: number;
    opacity: number;
    showMeasurements: boolean;
  };
  
  reportingDefaults: {
    template: string;
    autoSave: boolean;
    spellCheck: boolean;
    voiceToText: boolean;
  };
  
  workflowPreferences: {
    autoAdvanceStudies: boolean;
    confirmBeforeSubmit: boolean;
    showPriorStudies: boolean;
    defaultImageLayout: 'single' | 'dual' | 'quad';
  };
}

// Session and activity tracking
export interface MedicalUserSession {
  sessionId: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location?: GeoLocation;
  loginTime: Date;
  lastActivity: Date;
  isActive: boolean;
  
  // Medical-specific session data
  accessedPHI: PHIAccessRecord[];
  complianceViolations: ComplianceViolation[];
  auditTrail: AuditEvent[];
}

export interface DeviceInfo {
  deviceId: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  operatingSystem: string;
  browser: string;
  isPersonalDevice: boolean;
  isTrustedDevice: boolean;
  lastSecurityScan?: Date;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  facility?: string;
  isApprovedLocation: boolean;
}

export interface PHIAccessRecord {
  patientId: string;
  studyId: string;
  accessTime: Date;
  accessType: 'view' | 'edit' | 'export' | 'print';
  purpose: string;
  dataElements: string[];
}

export interface ComplianceViolation {
  violationId: string;
  type: ComplianceViolationType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export enum ComplianceViolationType {
  UNAUTHORIZED_PHI_ACCESS = 'unauthorized_phi_access',
  EXCESSIVE_LOGIN_ATTEMPTS = 'excessive_login_attempts',
  UNUSUAL_ACCESS_PATTERN = 'unusual_access_pattern',
  UNTRUSTED_DEVICE_ACCESS = 'untrusted_device_access',
  POLICY_VIOLATION = 'policy_violation',
  DATA_BREACH_RISK = 'data_breach_risk'
}

export interface AuditEvent {
  eventId: string;
  eventType: AuditEventType;
  timestamp: Date;
  userId: string;
  sessionId: string;
  resourceId?: string;
  resourceType?: string;
  action: string;
  outcome: 'success' | 'failure' | 'partial';
  details: Record<string, any>;
}

export enum AuditEventType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PHI_ACCESS = 'phi_access',
  DATA_EXPORT = 'data_export',
  CONFIGURATION_CHANGE = 'configuration_change',
  USER_MANAGEMENT = 'user_management',
  SECURITY_EVENT = 'security_event',
  COMPLIANCE_CHECK = 'compliance_check'
} 