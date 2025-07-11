/**
 * Role-Based Access Control for Medical Professionals
 * Hierarchical permission system with medical-specific access controls
 */

import { medicalServices } from '@/config/shared-config';
import { MedicalUser, MedicalRole, Permission, ROLE_PERMISSIONS } from '@/types/medical-user';

// Resource types for medical access control
export type ResourceType = 
  | 'patient-data'
  | 'dicom-images'
  | 'medical-reports'
  | 'ai-analysis'
  | 'system-config'
  | 'user-management'
  | 'audit-logs'
  | 'compliance-data'
  | 'emergency-access'
  | 'billing-data';

// Access level for resources
export type AccessLevel = 'none' | 'read' | 'write' | 'admin' | 'owner';

// Permission context for contextual access
export interface PermissionContext {
  patientId?: string;
  studyId?: string;
  departmentId?: string;
  hospitalId?: string;
  resourceType: ResourceType;
  accessLevel: AccessLevel;
  emergencyAccess?: boolean;
}

// Access control result
export interface AccessResult {
  allowed: boolean;
  reason?: string;
  conditions?: string[];
  auditRequired?: boolean;
  emergencyOverride?: boolean;
}

// Medical access control manager
export class MedicalAccessControl {
  private static instance: MedicalAccessControl;
  
  private constructor() {}

  public static getInstance(): MedicalAccessControl {
    if (!MedicalAccessControl.instance) {
      MedicalAccessControl.instance = new MedicalAccessControl();
    }
    return MedicalAccessControl.instance;
  }

  // Check if user has permission
  public hasPermission(user: MedicalUser, permission: Permission): boolean {
    return user.permissions.includes(permission);
  }

  // Check if user has role
  public hasRole(user: MedicalUser, role: MedicalRole): boolean {
    return user.role === role || this.isRoleHierarchyMet(user.role, role);
  }

  // Check if user can access resource
  public canAccessResource(user: MedicalUser, context: PermissionContext): AccessResult {
    // Check emergency override first
    if (context.emergencyAccess && user.emergencyAccess) {
      medicalServices.auditMedicalAccess(user.id, 'emergency-access', 'EMERGENCY_OVERRIDE_USED');
      return {
        allowed: true,
        emergencyOverride: true,
        auditRequired: true,
        reason: 'Emergency access override'
      };
    }

    // Check basic permissions
    const requiredPermissions = this.getRequiredPermissions(context);
    const hasRequiredPermission = requiredPermissions.some(perm => 
      this.hasPermission(user, perm)
    );

    if (!hasRequiredPermission) {
      return {
        allowed: false,
        reason: 'Insufficient permissions',
        auditRequired: true
      };
    }

    // Check role-based access
    const roleAccess = this.checkRoleAccess(user, context);
    if (!roleAccess.allowed) {
      return roleAccess;
    }

    // Check contextual access
    const contextAccess = this.checkContextualAccess(user, context);
    if (!contextAccess.allowed) {
      return contextAccess;
    }

    // Check resource-specific restrictions
    const resourceAccess = this.checkResourceAccess(user, context);
    if (!resourceAccess.allowed) {
      return resourceAccess;
    }

    return {
      allowed: true,
      auditRequired: this.isAuditRequired(context),
      conditions: this.getAccessConditions(user, context)
    };
  }

  // Get required permissions for resource access
  private getRequiredPermissions(context: PermissionContext): Permission[] {
    const permissions: Permission[] = [];

    switch (context.resourceType) {
      case 'patient-data':
        permissions.push('view-patient-data');
        if (context.accessLevel === 'write') {
          permissions.push('edit-patient-data');
        }
        break;
      
      case 'dicom-images':
        permissions.push('view-dicom-images');
        if (context.accessLevel === 'write') {
          permissions.push('annotate-images');
        }
        break;
      
      case 'medical-reports':
        permissions.push('generate-reports');
        if (context.accessLevel === 'admin') {
          permissions.push('approve-reports');
        }
        break;
      
      case 'ai-analysis':
        permissions.push('access-ai-tools');
        break;
      
      case 'system-config':
        permissions.push('system-administration');
        break;
      
      case 'user-management':
        permissions.push('manage-users');
        break;
      
      case 'audit-logs':
        permissions.push('audit-access');
        break;
      
      case 'compliance-data':
        permissions.push('compliance-access');
        break;
      
      case 'emergency-access':
        permissions.push('emergency-access');
        break;
      
      default:
        permissions.push('view-patient-data');
    }

    return permissions;
  }

  // Check role-based access
  private checkRoleAccess(user: MedicalUser, context: PermissionContext): AccessResult {
    const roleHierarchy = this.getRoleHierarchy();
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = this.getRequiredRoleLevel(context);

    if (userLevel < requiredLevel) {
      return {
        allowed: false,
        reason: `Role ${user.role} insufficient for ${context.resourceType} access`,
        auditRequired: true
      };
    }

    return { allowed: true };
  }

  // Check contextual access (department, hospital, etc.)
  private checkContextualAccess(user: MedicalUser, context: PermissionContext): AccessResult {
    // Check department access
    if (context.departmentId) {
      const userDepartments = user.affiliations.map(aff => aff.department);
      if (!userDepartments.includes(context.departmentId)) {
        return {
          allowed: false,
          reason: 'User not affiliated with required department',
          auditRequired: true
        };
      }
    }

    // Check hospital access
    if (context.hospitalId) {
      const userHospitals = user.affiliations.map(aff => aff.hospitalName);
      if (!userHospitals.includes(context.hospitalId)) {
        return {
          allowed: false,
          reason: 'User not affiliated with required hospital',
          auditRequired: true
        };
      }
    }

    // Check patient access (if patient-specific)
    if (context.patientId) {
      const patientAccess = this.checkPatientAccess(user, context.patientId);
      if (!patientAccess.allowed) {
        return patientAccess;
      }
    }

    return { allowed: true };
  }

  // Check resource-specific access
  private checkResourceAccess(user: MedicalUser, context: PermissionContext): AccessResult {
    // Check time-based restrictions
    if (this.hasTimeRestrictions(user.role)) {
      const timeAccess = this.checkTimeAccess(user, context);
      if (!timeAccess.allowed) {
        return timeAccess;
      }
    }

    // Check concurrent access limits
    if (this.hasConcurrentLimits(context.resourceType)) {
      const concurrentAccess = this.checkConcurrentAccess(user, context);
      if (!concurrentAccess.allowed) {
        return concurrentAccess;
      }
    }

    return { allowed: true };
  }

  // Check patient-specific access
  private checkPatientAccess(user: MedicalUser, patientId: string): AccessResult {
    // In a real implementation, this would check:
    // - Patient assignment to user
    // - Care team membership
    // - Consultation permissions
    // - Emergency access rights
    
    // For now, allow access if user has patient data permissions
    if (this.hasPermission(user, 'view-patient-data')) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: 'No patient access permissions',
      auditRequired: true
    };
  }

  // Check time-based access restrictions
  private checkTimeAccess(user: MedicalUser, context: PermissionContext): AccessResult {
    const now = new Date();
    const hour = now.getHours();

    // Example: Residents have restricted access during certain hours
    if (user.role === 'resident' && (hour < 6 || hour > 22)) {
      return {
        allowed: false,
        reason: 'Access restricted during off-hours for residents',
        auditRequired: true
      };
    }

    return { allowed: true };
  }

  // Check concurrent access limits
  private checkConcurrentAccess(user: MedicalUser, context: PermissionContext): AccessResult {
    // In a real implementation, this would check current sessions
    // and enforce limits based on resource type and user role
    
    return { allowed: true };
  }

  // Get role hierarchy levels
  private getRoleHierarchy(): Record<MedicalRole, number> {
    return {
      'medical-student': 1,
      'resident': 2,
      'fellow': 3,
      'attending': 4,
      'radiologist': 4,
      'nurse': 2,
      'technologist': 2,
      'administrator': 5,
      'system-admin': 6,
      'super-admin': 7
    };
  }

  // Check if role hierarchy is met
  private isRoleHierarchyMet(userRole: MedicalRole, requiredRole: MedicalRole): boolean {
    const hierarchy = this.getRoleHierarchy();
    return (hierarchy[userRole] || 0) >= (hierarchy[requiredRole] || 0);
  }

  // Get required role level for resource access
  private getRequiredRoleLevel(context: PermissionContext): number {
    switch (context.resourceType) {
      case 'system-config':
        return 6; // system-admin
      case 'user-management':
        return 5; // administrator
      case 'audit-logs':
        return 5; // administrator
      case 'compliance-data':
        return 5; // administrator
      case 'emergency-access':
        return 2; // resident and above
      case 'ai-analysis':
        return 3; // fellow and above
      case 'medical-reports':
        return context.accessLevel === 'admin' ? 4 : 2; // attending for approval
      default:
        return 1; // basic access
    }
  }

  // Check if time restrictions apply
  private hasTimeRestrictions(role: MedicalRole): boolean {
    return ['medical-student', 'resident'].includes(role);
  }

  // Check if concurrent limits apply
  private hasConcurrentLimits(resourceType: ResourceType): boolean {
    return ['ai-analysis', 'system-config'].includes(resourceType);
  }

  // Check if audit is required
  private isAuditRequired(context: PermissionContext): boolean {
    const highRiskResources: ResourceType[] = [
      'patient-data',
      'medical-reports',
      'system-config',
      'user-management',
      'audit-logs',
      'compliance-data',
      'emergency-access'
    ];

    return highRiskResources.includes(context.resourceType) || 
           context.emergencyAccess === true;
  }

  // Get access conditions
  private getAccessConditions(user: MedicalUser, context: PermissionContext): string[] {
    const conditions: string[] = [];

    // Add time-based conditions
    if (this.hasTimeRestrictions(user.role)) {
      conditions.push('Access limited to business hours');
    }

    // Add supervision conditions
    if (user.role === 'medical-student') {
      conditions.push('Supervision required for patient data access');
    }

    // Add emergency conditions
    if (context.emergencyAccess) {
      conditions.push('Emergency access - requires justification');
    }

    return conditions;
  }

  // Grant temporary permission
  public grantTemporaryPermission(
    user: MedicalUser, 
    permission: Permission, 
    duration: number, 
    reason: string
  ): boolean {
    // In a real implementation, this would store temporary permissions
    // with expiration times
    
    medicalServices.auditMedicalAccess(
      user.id, 
      'temporary-permission', 
      `GRANTED_${permission.toUpperCase()}`
    );

    console.log(`Granted temporary permission ${permission} to user ${user.id} for ${duration}ms`);
    return true;
  }

  // Revoke temporary permission
  public revokeTemporaryPermission(user: MedicalUser, permission: Permission): boolean {
    medicalServices.auditMedicalAccess(
      user.id, 
      'temporary-permission', 
      `REVOKED_${permission.toUpperCase()}`
    );

    console.log(`Revoked temporary permission ${permission} from user ${user.id}`);
    return true;
  }

  // Check if user can delegate permission
  public canDelegatePermission(
    delegator: MedicalUser, 
    delegatee: MedicalUser, 
    permission: Permission
  ): boolean {
    // Check if delegator has the permission
    if (!this.hasPermission(delegator, permission)) {
      return false;
    }

    // Check role hierarchy
    const hierarchy = this.getRoleHierarchy();
    const delegatorLevel = hierarchy[delegator.role] || 0;
    const delegateeLevel = hierarchy[delegatee.role] || 0;

    // Can only delegate to equal or lower level
    return delegatorLevel >= delegateeLevel;
  }

  // Get user's effective permissions (including temporary)
  public getEffectivePermissions(user: MedicalUser): Permission[] {
    // In a real implementation, this would combine:
    // - Base role permissions
    // - Temporary permissions
    // - Delegated permissions
    
    return [...user.permissions];
  }

  // Check bulk permissions
  public checkBulkPermissions(
    user: MedicalUser, 
    permissions: Permission[]
  ): Record<Permission, boolean> {
    const results: Record<Permission, boolean> = {} as any;
    
    permissions.forEach(permission => {
      results[permission] = this.hasPermission(user, permission);
    });

    return results;
  }

  // Get permission summary for user
  public getPermissionSummary(user: MedicalUser): {
    role: MedicalRole;
    permissions: Permission[];
    resourceAccess: Record<ResourceType, AccessLevel>;
    restrictions: string[];
  } {
    const resourceAccess: Record<ResourceType, AccessLevel> = {} as any;
    const restrictions: string[] = [];

    // Determine access level for each resource type
    const resourceTypes: ResourceType[] = [
      'patient-data', 'dicom-images', 'medical-reports', 'ai-analysis',
      'system-config', 'user-management', 'audit-logs', 'compliance-data',
      'emergency-access', 'billing-data'
    ];

    resourceTypes.forEach(resourceType => {
      resourceAccess[resourceType] = this.getResourceAccessLevel(user, resourceType);
    });

    // Add restrictions based on role
    if (this.hasTimeRestrictions(user.role)) {
      restrictions.push('Time-based access restrictions');
    }

    if (user.role === 'medical-student') {
      restrictions.push('Supervision required');
    }

    return {
      role: user.role,
      permissions: user.permissions,
      resourceAccess,
      restrictions
    };
  }

  // Get resource access level for user
  private getResourceAccessLevel(user: MedicalUser, resourceType: ResourceType): AccessLevel {
    const context: PermissionContext = {
      resourceType,
      accessLevel: 'read'
    };

    const readAccess = this.canAccessResource(user, context);
    if (!readAccess.allowed) {
      return 'none';
    }

    const writeContext: PermissionContext = {
      resourceType,
      accessLevel: 'write'
    };

    const writeAccess = this.canAccessResource(user, writeContext);
    if (!writeAccess.allowed) {
      return 'read';
    }

    const adminContext: PermissionContext = {
      resourceType,
      accessLevel: 'admin'
    };

    const adminAccess = this.canAccessResource(user, adminContext);
    if (adminAccess.allowed) {
      return 'admin';
    }

    return 'write';
  }

  // Validate permission consistency
  public validatePermissionConsistency(user: MedicalUser): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check if user has permissions consistent with role
    const expectedPermissions = ROLE_PERMISSIONS[user.role];
    const hasAllExpected = expectedPermissions.every(perm => 
      user.permissions.includes(perm)
    );

    if (!hasAllExpected) {
      issues.push('User missing expected permissions for role');
    }

    // Check for contradictory permissions
    const hasSystemAdmin = user.permissions.includes('system-administration');
    const isLowRole = ['medical-student', 'resident'].includes(user.role);

    if (hasSystemAdmin && isLowRole) {
      issues.push('User has system admin permissions but low-level role');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// Utility functions for permission checking
export const checkPermission = (user: MedicalUser, permission: Permission): boolean => {
  return MedicalAccessControl.getInstance().hasPermission(user, permission);
};

export const checkResourceAccess = (user: MedicalUser, context: PermissionContext): AccessResult => {
  return MedicalAccessControl.getInstance().canAccessResource(user, context);
};

export const checkRole = (user: MedicalUser, role: MedicalRole): boolean => {
  return MedicalAccessControl.getInstance().hasRole(user, role);
};

// Higher-order component for permission-based rendering
export const withPermission = (permission: Permission) => {
  return (user: MedicalUser | null) => {
    if (!user) return false;
    return checkPermission(user, permission);
  };
};

// Higher-order component for role-based rendering
export const withRole = (role: MedicalRole) => {
  return (user: MedicalUser | null) => {
    if (!user) return false;
    return checkRole(user, role);
  };
};

// Export singleton instance
export const medicalAccessControl = MedicalAccessControl.getInstance();
export default medicalAccessControl; 