/**
 * MedSight Pro - Role-Based Access Control System
 * Medical professional role and permission management with HIPAA compliance
 * Comprehensive access control for clinical workflows and medical data
 */

// Medical permission interface
interface MedicalPermission {
  id: string;
  name: string;
  description: string;
  category: 'medical_data' | 'system_admin' | 'clinical_workflow' | 'emergency' | 'compliance';
  level: 'read' | 'write' | 'admin' | 'emergency';
  hipaaLevel?: 'basic' | 'phi' | 'sensitive';
  auditRequired: boolean;
}

// Medical role interface
interface MedicalRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  hierarchy: number; // 1 = highest authority
  permissions: string[]; // Permission IDs
  inheritsFrom?: string[]; // Role IDs to inherit permissions from
  restrictions?: {
    timeRestrictions?: {
      allowedHours?: { start: number; end: number }[];
      emergencyOverride?: boolean;
    };
    locationRestrictions?: {
      allowedDepartments?: string[];
      emergencyOverride?: boolean;
    };
    dataRestrictions?: {
      maxPatientAccess?: number;
      auditFrequency?: 'real-time' | 'daily' | 'weekly';
    };
  };
  complianceRequirements: {
    hipaaTraining: boolean;
    medicalLicense: boolean;
    backgroundCheck: boolean;
    continuingEducation?: boolean;
  };
}

// Medical access context interface
interface MedicalAccessContext {
  userId: string;
  roles: string[];
  permissions: string[];
  currentDepartment?: string;
  currentShift?: 'day' | 'evening' | 'night' | 'weekend';
  emergencyMode?: boolean;
  supervisionLevel?: 'independent' | 'supervised' | 'trainee';
  complianceStatus: {
    hipaaValid: boolean;
    licenseValid: boolean;
    backgroundValid: boolean;
  };
}

// Medical access request interface
interface MedicalAccessRequest {
  resource: string;
  action: string;
  context: MedicalAccessContext;
  metadata?: {
    patientId?: string;
    studyId?: string;
    emergencyJustification?: string;
    supervisorApproval?: string;
  };
}

// Medical access response interface
interface MedicalAccessResponse {
  granted: boolean;
  reason?: string;
  conditions?: string[];
  auditRequired: boolean;
  timeLimit?: number;
  supervisorNotification?: boolean;
}

// Medical permissions registry
export const MEDICAL_PERMISSIONS: Record<string, MedicalPermission> = {
  // Medical Data Permissions
  PATIENT_DATA_READ: {
    id: 'patient_data_read',
    name: 'Read Patient Data',
    description: 'View patient demographic and basic medical information',
    category: 'medical_data',
    level: 'read',
    hipaaLevel: 'phi',
    auditRequired: true
  },
  PATIENT_DATA_WRITE: {
    id: 'patient_data_write',
    name: 'Write Patient Data',
    description: 'Create and modify patient medical records',
    category: 'medical_data',
    level: 'write',
    hipaaLevel: 'phi',
    auditRequired: true
  },
  MEDICAL_IMAGING_READ: {
    id: 'medical_imaging_read',
    name: 'Read Medical Images',
    description: 'View DICOM images and medical studies',
    category: 'medical_data',
    level: 'read',
    hipaaLevel: 'phi',
    auditRequired: true
  },
  MEDICAL_IMAGING_WRITE: {
    id: 'medical_imaging_write',
    name: 'Write Medical Images',
    description: 'Upload, modify, and annotate medical images',
    category: 'medical_data',
    level: 'write',
    hipaaLevel: 'phi',
    auditRequired: true
  },
  MEDICAL_REPORTS_READ: {
    id: 'medical_reports_read',
    name: 'Read Medical Reports',
    description: 'View radiology and clinical reports',
    category: 'medical_data',
    level: 'read',
    hipaaLevel: 'phi',
    auditRequired: true
  },
  MEDICAL_REPORTS_WRITE: {
    id: 'medical_reports_write',
    name: 'Write Medical Reports',
    description: 'Create and modify medical reports',
    category: 'medical_data',
    level: 'write',
    hipaaLevel: 'phi',
    auditRequired: true
  },
  SENSITIVE_DATA_ACCESS: {
    id: 'sensitive_data_access',
    name: 'Sensitive Data Access',
    description: 'Access to highly sensitive medical data',
    category: 'medical_data',
    level: 'read',
    hipaaLevel: 'sensitive',
    auditRequired: true
  },

  // Clinical Workflow Permissions
  AI_ANALYSIS_USE: {
    id: 'ai_analysis_use',
    name: 'Use AI Analysis',
    description: 'Run AI-powered medical analysis tools',
    category: 'clinical_workflow',
    level: 'write',
    auditRequired: true
  },
  COLLABORATION_ACCESS: {
    id: 'collaboration_access',
    name: 'Collaboration Access',
    description: 'Participate in multi-user medical collaboration',
    category: 'clinical_workflow',
    level: 'read',
    auditRequired: false
  },
  WORKFLOW_MANAGEMENT: {
    id: 'workflow_management',
    name: 'Workflow Management',
    description: 'Manage clinical workflows and case assignments',
    category: 'clinical_workflow',
    level: 'admin',
    auditRequired: true
  },
  PEER_REVIEW: {
    id: 'peer_review',
    name: 'Peer Review',
    description: 'Review and approve colleague work',
    category: 'clinical_workflow',
    level: 'write',
    auditRequired: true
  },

  // Emergency Permissions
  EMERGENCY_ACCESS: {
    id: 'emergency_access',
    name: 'Emergency Access',
    description: 'Access medical data in emergency situations',
    category: 'emergency',
    level: 'emergency',
    hipaaLevel: 'phi',
    auditRequired: true
  },
  EMERGENCY_OVERRIDE: {
    id: 'emergency_override',
    name: 'Emergency Override',
    description: 'Override normal access restrictions in emergencies',
    category: 'emergency',
    level: 'emergency',
    auditRequired: true
  },

  // System Administration Permissions
  USER_MANAGEMENT: {
    id: 'user_management',
    name: 'User Management',
    description: 'Manage medical professional accounts',
    category: 'system_admin',
    level: 'admin',
    auditRequired: true
  },
  SYSTEM_CONFIGURATION: {
    id: 'system_configuration',
    name: 'System Configuration',
    description: 'Configure medical system settings',
    category: 'system_admin',
    level: 'admin',
    auditRequired: true
  },
  AUDIT_LOG_ACCESS: {
    id: 'audit_log_access',
    name: 'Audit Log Access',
    description: 'View system audit logs and compliance reports',
    category: 'compliance',
    level: 'read',
    auditRequired: true
  },
  COMPLIANCE_MANAGEMENT: {
    id: 'compliance_management',
    name: 'Compliance Management',
    description: 'Manage HIPAA and regulatory compliance',
    category: 'compliance',
    level: 'admin',
    auditRequired: true
  }
};

// Medical roles registry
export const MEDICAL_ROLES: Record<string, MedicalRole> = {
  // System Roles
  SYSTEM_ADMIN: {
    id: 'system_admin',
    name: 'system_admin',
    displayName: 'System Administrator',
    description: 'Full system access and administration',
    hierarchy: 1,
    permissions: Object.keys(MEDICAL_PERMISSIONS),
    complianceRequirements: {
      hipaaTraining: true,
      medicalLicense: false,
      backgroundCheck: true,
      continuingEducation: true
    }
  },
  ADMIN: {
    id: 'admin',
    name: 'admin',
    displayName: 'Administrator',
    description: 'Hospital/clinic system administration',
    hierarchy: 2,
    permissions: [
      'patient_data_read', 'patient_data_write',
      'medical_imaging_read', 'medical_imaging_write',
      'medical_reports_read', 'medical_reports_write',
      'user_management', 'workflow_management',
      'audit_log_access', 'compliance_management'
    ],
    complianceRequirements: {
      hipaaTraining: true,
      medicalLicense: false,
      backgroundCheck: true,
      continuingEducation: true
    }
  },

  // Medical Professional Roles
  CHIEF_RADIOLOGIST: {
    id: 'chief_radiologist',
    name: 'chief_radiologist',
    displayName: 'Chief Radiologist',
    description: 'Senior radiologist with administrative responsibilities',
    hierarchy: 3,
    permissions: [
      'patient_data_read', 'patient_data_write',
      'medical_imaging_read', 'medical_imaging_write',
      'medical_reports_read', 'medical_reports_write',
      'sensitive_data_access', 'ai_analysis_use',
      'collaboration_access', 'workflow_management',
      'peer_review', 'emergency_access'
    ],
    complianceRequirements: {
      hipaaTraining: true,
      medicalLicense: true,
      backgroundCheck: true,
      continuingEducation: true
    }
  },
  ATTENDING_RADIOLOGIST: {
    id: 'attending_radiologist',
    name: 'attending_radiologist',
    displayName: 'Attending Radiologist',
    description: 'Board-certified radiologist with full clinical privileges',
    hierarchy: 4,
    permissions: [
      'patient_data_read', 'patient_data_write',
      'medical_imaging_read', 'medical_imaging_write',
      'medical_reports_read', 'medical_reports_write',
      'ai_analysis_use', 'collaboration_access',
      'peer_review', 'emergency_access'
    ],
    complianceRequirements: {
      hipaaTraining: true,
      medicalLicense: true,
      backgroundCheck: true,
      continuingEducation: true
    }
  },
  RADIOLOGIST: {
    id: 'radiologist',
    name: 'radiologist',
    displayName: 'Radiologist',
    description: 'Licensed radiologist with clinical privileges',
    hierarchy: 5,
    permissions: [
      'patient_data_read', 'medical_imaging_read', 'medical_imaging_write',
      'medical_reports_read', 'medical_reports_write',
      'ai_analysis_use', 'collaboration_access'
    ],
    complianceRequirements: {
      hipaaTraining: true,
      medicalLicense: true,
      backgroundCheck: true,
      continuingEducation: true
    }
  },
  RADIOLOGY_RESIDENT: {
    id: 'radiology_resident',
    name: 'radiology_resident',
    displayName: 'Radiology Resident',
    description: 'Radiology resident in training',
    hierarchy: 6,
    permissions: [
      'patient_data_read', 'medical_imaging_read',
      'medical_reports_read', 'ai_analysis_use',
      'collaboration_access'
    ],
    restrictions: {
      dataRestrictions: {
        maxPatientAccess: 50,
        auditFrequency: 'real-time'
      }
    },
    complianceRequirements: {
      hipaaTraining: true,
      medicalLicense: true,
      backgroundCheck: true
    }
  },
  ATTENDING_PHYSICIAN: {
    id: 'attending_physician',
    name: 'attending_physician',
    displayName: 'Attending Physician',
    description: 'Board-certified physician with clinical privileges',
    hierarchy: 4,
    permissions: [
      'patient_data_read', 'patient_data_write',
      'medical_imaging_read', 'medical_reports_read',
      'collaboration_access', 'emergency_access'
    ],
    complianceRequirements: {
      hipaaTraining: true,
      medicalLicense: true,
      backgroundCheck: true,
      continuingEducation: true
    }
  },
  RESIDENT: {
    id: 'resident',
    name: 'resident',
    displayName: 'Medical Resident',
    description: 'Medical resident in training',
    hierarchy: 7,
    permissions: [
      'patient_data_read', 'medical_imaging_read',
      'medical_reports_read', 'collaboration_access'
    ],
    restrictions: {
      dataRestrictions: {
        maxPatientAccess: 25,
        auditFrequency: 'real-time'
      }
    },
    complianceRequirements: {
      hipaaTraining: true,
      medicalLicense: true,
      backgroundCheck: true
    }
  },

  // Technical Roles
  MEDICAL_TECHNOLOGIST: {
    id: 'medical_technologist',
    name: 'medical_technologist',
    displayName: 'Medical Technologist',
    description: 'Medical imaging technologist',
    hierarchy: 8,
    permissions: [
      'patient_data_read', 'medical_imaging_read',
      'medical_imaging_write', 'collaboration_access'
    ],
    complianceRequirements: {
      hipaaTraining: true,
      medicalLicense: false,
      backgroundCheck: true
    }
  },
  TECHNICIAN: {
    id: 'technician',
    name: 'technician',
    displayName: 'Medical Technician',
    description: 'Medical equipment technician',
    hierarchy: 9,
    permissions: [
      'medical_imaging_read', 'collaboration_access'
    ],
    complianceRequirements: {
      hipaaTraining: true,
      medicalLicense: false,
      backgroundCheck: true
    }
  },

  // Support Roles
  CLINICAL_COORDINATOR: {
    id: 'clinical_coordinator',
    name: 'clinical_coordinator',
    displayName: 'Clinical Coordinator',
    description: 'Clinical workflow coordinator',
    hierarchy: 8,
    permissions: [
      'patient_data_read', 'workflow_management',
      'collaboration_access'
    ],
    complianceRequirements: {
      hipaaTraining: true,
      medicalLicense: false,
      backgroundCheck: true
    }
  },
  VIEWER: {
    id: 'viewer',
    name: 'viewer',
    displayName: 'Medical Viewer',
    description: 'Read-only access to assigned cases',
    hierarchy: 10,
    permissions: [
      'patient_data_read', 'medical_imaging_read',
      'medical_reports_read'
    ],
    restrictions: {
      dataRestrictions: {
        maxPatientAccess: 10,
        auditFrequency: 'real-time'
      }
    },
    complianceRequirements: {
      hipaaTraining: true,
      medicalLicense: false,
      backgroundCheck: true
    }
  }
};

export class MedicalAccessControlManager {
  
  // Check if user has permission
  static hasPermission(context: MedicalAccessContext, permissionId: string): boolean {
    return context.permissions.includes(permissionId);
  }

  // Check if user has role
  static hasRole(context: MedicalAccessContext, roleId: string): boolean {
    return context.roles.includes(roleId);
  }

  // Get user permissions from roles
  static getUserPermissions(roles: string[]): string[] {
    const permissions = new Set<string>();
    
    for (const roleId of roles) {
      const role = MEDICAL_ROLES[roleId.toUpperCase()];
      if (role) {
        role.permissions.forEach(perm => permissions.add(perm));
        
        // Add inherited permissions
        if (role.inheritsFrom) {
          const inheritedPerms = this.getUserPermissions(role.inheritsFrom);
          inheritedPerms.forEach(perm => permissions.add(perm));
        }
      }
    }
    
    return Array.from(permissions);
  }

  // Validate access request
  static validateAccess(request: MedicalAccessRequest): MedicalAccessResponse {
    const { resource, action, context, metadata } = request;
    
    // Check compliance status
    if (!context.complianceStatus.hipaaValid) {
      return {
        granted: false,
        reason: 'HIPAA training required',
        auditRequired: true
      };
    }

    // Determine required permission
    const requiredPermission = this.getRequiredPermission(resource, action);
    if (!requiredPermission) {
      return {
        granted: false,
        reason: 'Invalid resource or action',
        auditRequired: true
      };
    }

    // Check if user has permission
    if (!this.hasPermission(context, requiredPermission)) {
      return {
        granted: false,
        reason: `Permission '${requiredPermission}' required`,
        auditRequired: true
      };
    }

    // Check role restrictions
    const restrictionCheck = this.checkRoleRestrictions(context, metadata);
    if (!restrictionCheck.allowed) {
      return {
        granted: false,
        reason: restrictionCheck.reason,
        auditRequired: true
      };
    }

    // Check emergency access
    if (context.emergencyMode) {
      return this.handleEmergencyAccess(request);
    }

    // Check time restrictions
    const timeCheck = this.checkTimeRestrictions(context);
    if (!timeCheck.allowed) {
      return {
        granted: false,
        reason: timeCheck.reason,
        auditRequired: true
      };
    }

    // Grant access
    const permission = MEDICAL_PERMISSIONS[requiredPermission];
    return {
      granted: true,
      auditRequired: permission.auditRequired,
      conditions: this.getAccessConditions(context, permission),
      supervisorNotification: this.requiresSupervisorNotification(context, permission)
    };
  }

  // Get required permission for resource/action
  private static getRequiredPermission(resource: string, action: string): string {
    const permissionMap: Record<string, Record<string, string>> = {
      'patient_data': {
        'read': 'patient_data_read',
        'write': 'patient_data_write'
      },
      'medical_imaging': {
        'read': 'medical_imaging_read',
        'write': 'medical_imaging_write'
      },
      'medical_reports': {
        'read': 'medical_reports_read',
        'write': 'medical_reports_write'
      },
      'ai_analysis': {
        'use': 'ai_analysis_use'
      },
      'collaboration': {
        'access': 'collaboration_access'
      },
      'emergency': {
        'access': 'emergency_access',
        'override': 'emergency_override'
      },
      'admin': {
        'user_management': 'user_management',
        'system_config': 'system_configuration',
        'audit_logs': 'audit_log_access'
      }
    };

    return permissionMap[resource]?.[action] || '';
  }

  // Check role restrictions
  private static checkRoleRestrictions(context: MedicalAccessContext, metadata?: any): {
    allowed: boolean;
    reason?: string;
  } {
    for (const roleId of context.roles) {
      const role = MEDICAL_ROLES[roleId.toUpperCase()];
      if (!role?.restrictions) continue;

      // Check data restrictions
      if (role.restrictions.dataRestrictions?.maxPatientAccess && metadata?.patientId) {
        // In production, check actual patient access count
        // For now, assume under limit
      }

      // Check location restrictions
      if (role.restrictions.locationRestrictions?.allowedDepartments) {
        if (context.currentDepartment && 
            !role.restrictions.locationRestrictions.allowedDepartments.includes(context.currentDepartment)) {
          if (!role.restrictions.locationRestrictions.emergencyOverride || !context.emergencyMode) {
            return {
              allowed: false,
              reason: `Access restricted to departments: ${role.restrictions.locationRestrictions.allowedDepartments.join(', ')}`
            };
          }
        }
      }
    }

    return { allowed: true };
  }

  // Check time restrictions
  private static checkTimeRestrictions(context: MedicalAccessContext): {
    allowed: boolean;
    reason?: string;
  } {
    const currentHour = new Date().getHours();
    
    for (const roleId of context.roles) {
      const role = MEDICAL_ROLES[roleId.toUpperCase()];
      if (!role?.restrictions?.timeRestrictions?.allowedHours) continue;

      const allowedHours = role.restrictions.timeRestrictions.allowedHours;
      const isAllowed = allowedHours.some(period => 
        currentHour >= period.start && currentHour <= period.end
      );

      if (!isAllowed) {
        if (!role.restrictions.timeRestrictions.emergencyOverride || !context.emergencyMode) {
          return {
            allowed: false,
            reason: `Access restricted to hours: ${allowedHours.map(p => `${p.start}:00-${p.end}:00`).join(', ')}`
          };
        }
      }
    }

    return { allowed: true };
  }

  // Handle emergency access
  private static handleEmergencyAccess(request: MedicalAccessRequest): MedicalAccessResponse {
    const { context, metadata } = request;
    
    // Check if user has emergency access permission
    if (!this.hasPermission(context, 'emergency_access')) {
      return {
        granted: false,
        reason: 'Emergency access permission required',
        auditRequired: true
      };
    }

    // Require emergency justification
    if (!metadata?.emergencyJustification) {
      return {
        granted: false,
        reason: 'Emergency justification required',
        auditRequired: true
      };
    }

    return {
      granted: true,
      reason: 'Emergency access granted',
      conditions: [
        'Emergency access mode',
        'Limited time access (1 hour)',
        'Supervisor notification required',
        'Detailed audit trail'
      ],
      auditRequired: true,
      timeLimit: 60 * 60 * 1000, // 1 hour
      supervisorNotification: true
    };
  }

  // Get access conditions
  private static getAccessConditions(context: MedicalAccessContext, permission: MedicalPermission): string[] {
    const conditions: string[] = [];

    if (permission.hipaaLevel === 'sensitive') {
      conditions.push('Sensitive data access - enhanced audit trail');
    }

    if (context.supervisionLevel === 'trainee') {
      conditions.push('Trainee access - supervisor oversight required');
    }

    if (permission.category === 'emergency') {
      conditions.push('Emergency access - time limited');
    }

    return conditions;
  }

  // Check if supervisor notification required
  private static requiresSupervisorNotification(context: MedicalAccessContext, permission: MedicalPermission): boolean {
    return context.supervisionLevel === 'trainee' || 
           permission.hipaaLevel === 'sensitive' ||
           permission.category === 'emergency';
  }

  // Get user role hierarchy level
  static getUserHierarchyLevel(roles: string[]): number {
    let highestLevel = 999; // Lower number = higher authority
    
    for (const roleId of roles) {
      const role = MEDICAL_ROLES[roleId.toUpperCase()];
      if (role && role.hierarchy < highestLevel) {
        highestLevel = role.hierarchy;
      }
    }
    
    return highestLevel;
  }

  // Check if user can supervise another user
  static canSupervise(supervisorRoles: string[], superviseeRoles: string[]): boolean {
    const supervisorLevel = this.getUserHierarchyLevel(supervisorRoles);
    const superviseeLevel = this.getUserHierarchyLevel(superviseeRoles);
    
    return supervisorLevel < superviseeLevel; // Lower number = higher authority
  }

  // Validate medical compliance
  static validateMedicalCompliance(context: MedicalAccessContext): {
    compliant: boolean;
    missing: string[];
  } {
    const missing: string[] = [];

    if (!context.complianceStatus.hipaaValid) {
      missing.push('HIPAA Training');
    }

    if (!context.complianceStatus.licenseValid) {
      missing.push('Medical License');
    }

    if (!context.complianceStatus.backgroundValid) {
      missing.push('Background Check');
    }

    return {
      compliant: missing.length === 0,
      missing
    };
  }
}

// Export for use in other modules
export default MedicalAccessControlManager; 