/**
 * MedSight Pro - Navigation Configuration & Routing System
 * Medical-specific routing with role-based access control and workflow optimization
 * Optimized for clinical workflows and HIPAA compliance
 */

// Medical route interface
interface MedicalRoute {
  id: string;
  path: string;
  name: string;
  icon?: string;
  description?: string;
  roles: string[];
  type: 'public' | 'protected' | 'admin' | 'emergency';
  category: 'auth' | 'dashboard' | 'workspace' | 'admin' | 'emergency' | 'support';
  children?: MedicalRoute[];
  metadata?: {
    requiresMFA?: boolean;
    requiresLicense?: boolean;
    emergencyAccess?: boolean;
    auditLevel?: 'basic' | 'detailed' | 'comprehensive';
    complianceRequired?: string[];
  };
}

// Medical user roles
export const MEDICAL_USER_ROLES = {
  // System Roles
  SYSTEM_ADMIN: 'system-admin',
  ADMIN: 'admin',
  
  // Medical Professional Roles
  MEDICAL_PROFESSIONAL: 'medical-professional',
  RADIOLOGIST: 'radiologist',
  ATTENDING_PHYSICIAN: 'attending',
  RESIDENT: 'resident',
  TECHNICIAN: 'technician',
  NURSE: 'nurse',
  
  // Specialized Roles
  CHIEF_RADIOLOGIST: 'chief-radiologist',
  DEPARTMENT_HEAD: 'department-head',
  CLINICAL_COORDINATOR: 'clinical-coordinator',
  
  // Guest/Limited Access
  VIEWER: 'viewer',
  GUEST: 'guest'
} as const;

// Medical route categories
export const MEDICAL_ROUTE_CATEGORIES = {
  AUTH: 'auth',
  DASHBOARD: 'dashboard',
  WORKSPACE: 'workspace',
  ADMIN: 'admin',
  EMERGENCY: 'emergency',
  SUPPORT: 'support'
} as const;

// Medical navigation configuration
export const MEDICAL_NAVIGATION_CONFIG: MedicalRoute[] = [
  // Authentication Routes (Public)
  {
    id: 'auth',
    path: '/auth',
    name: 'Authentication',
    icon: '🔐',
    description: 'Medical professional authentication',
    roles: [],
    type: 'public',
    category: 'auth',
    children: [
      {
        id: 'login',
        path: '/login',
        name: 'Login',
        icon: '🔑',
        description: 'Medical professional login',
        roles: [],
        type: 'public',
        category: 'auth',
        metadata: {
          requiresMFA: true,
          requiresLicense: true,
          auditLevel: 'comprehensive'
        }
      },
      {
        id: 'signup',
        path: '/signup',
        name: 'Sign Up',
        icon: '📝',
        description: 'New medical professional registration',
        roles: [],
        type: 'public',
        category: 'auth',
        metadata: {
          requiresLicense: true,
          auditLevel: 'comprehensive',
          complianceRequired: ['HIPAA', 'Medical_License']
        }
      },
      {
        id: 'reset-password',
        path: '/reset-password',
        name: 'Password Reset',
        icon: '🔄',
        description: 'Secure password recovery',
        roles: [],
        type: 'public',
        category: 'auth',
        metadata: {
          auditLevel: 'detailed'
        }
      },
      {
        id: 'verify-account',
        path: '/verify-account',
        name: 'Account Verification',
        icon: '✅',
        description: 'Email and license verification',
        roles: [],
        type: 'public',
        category: 'auth'
      },
      {
        id: 'mfa',
        path: '/mfa',
        name: 'Multi-Factor Authentication',
        icon: '🔐',
        description: 'Two-factor authentication',
        roles: [],
        type: 'public',
        category: 'auth',
        metadata: {
          requiresMFA: true,
          auditLevel: 'comprehensive'
        }
      }
    ]
  },

  // Dashboard Routes (Protected)
  {
    id: 'dashboard',
    path: '/dashboard',
    name: 'Dashboard',
    icon: '📊',
    description: 'Medical dashboard system',
    roles: [MEDICAL_USER_ROLES.MEDICAL_PROFESSIONAL],
    type: 'protected',
    category: 'dashboard',
    metadata: {
      requiresMFA: true,
      requiresLicense: true,
      auditLevel: 'basic'
    },
    children: [
      {
        id: 'medical-dashboard',
        path: '/dashboard/medical',
        name: 'Medical Dashboard',
        icon: '🏥',
        description: 'Primary clinical workspace',
        roles: [MEDICAL_USER_ROLES.MEDICAL_PROFESSIONAL, MEDICAL_USER_ROLES.RADIOLOGIST, MEDICAL_USER_ROLES.ATTENDING_PHYSICIAN],
        type: 'protected',
        category: 'dashboard',
        metadata: {
          requiresLicense: true,
          auditLevel: 'detailed'
        }
      },
      {
        id: 'admin-dashboard',
        path: '/dashboard/admin',
        name: 'Admin Dashboard',
        icon: '⚙️',
        description: 'System administration',
        roles: [MEDICAL_USER_ROLES.ADMIN, MEDICAL_USER_ROLES.SYSTEM_ADMIN],
        type: 'admin',
        category: 'dashboard',
        metadata: {
          auditLevel: 'comprehensive'
        }
      },
      {
        id: 'enterprise-dashboard',
        path: '/dashboard/enterprise',
        name: 'Enterprise Dashboard',
        icon: '🏢',
        description: 'Multi-tenant management',
        roles: [MEDICAL_USER_ROLES.SYSTEM_ADMIN, MEDICAL_USER_ROLES.DEPARTMENT_HEAD],
        type: 'admin',
        category: 'dashboard'
      },
      {
        id: 'analytics-dashboard',
        path: '/dashboard/analytics',
        name: 'Analytics Dashboard',
        icon: '📈',
        description: 'Medical analytics and insights',
        roles: [MEDICAL_USER_ROLES.RADIOLOGIST, MEDICAL_USER_ROLES.ATTENDING_PHYSICIAN, MEDICAL_USER_ROLES.ADMIN],
        type: 'protected',
        category: 'dashboard'
      }
    ]
  },

  // Workspace Routes (Protected)
  {
    id: 'workspace',
    path: '/workspace',
    name: 'Medical Workspace',
    icon: '🔬',
    description: 'Specialized medical workspaces',
    roles: [MEDICAL_USER_ROLES.MEDICAL_PROFESSIONAL],
    type: 'protected',
    category: 'workspace',
    metadata: {
      requiresLicense: true,
      auditLevel: 'detailed'
    },
    children: [
      {
        id: 'imaging-workspace',
        path: '/workspace/imaging',
        name: 'Medical Imaging',
        icon: '📱',
        description: 'DICOM imaging and analysis',
        roles: [MEDICAL_USER_ROLES.RADIOLOGIST, MEDICAL_USER_ROLES.ATTENDING_PHYSICIAN, MEDICAL_USER_ROLES.TECHNICIAN],
        type: 'protected',
        category: 'workspace',
        metadata: {
          requiresLicense: true,
          auditLevel: 'comprehensive',
          complianceRequired: ['DICOM', 'HIPAA']
        }
      },
      {
        id: 'ai-analysis-workspace',
        path: '/workspace/ai-analysis',
        name: 'AI Analysis',
        icon: '🤖',
        description: 'AI-powered medical analysis',
        roles: [MEDICAL_USER_ROLES.RADIOLOGIST, MEDICAL_USER_ROLES.ATTENDING_PHYSICIAN],
        type: 'protected',
        category: 'workspace',
        metadata: {
          requiresLicense: true,
          auditLevel: 'comprehensive'
        }
      },
      {
        id: 'collaboration-workspace',
        path: '/workspace/collaboration',
        name: 'Collaboration',
        icon: '👥',
        description: 'Multi-user collaboration tools',
        roles: [MEDICAL_USER_ROLES.MEDICAL_PROFESSIONAL],
        type: 'protected',
        category: 'workspace',
        metadata: {
          auditLevel: 'detailed'
        }
      },
      {
        id: 'performance-workspace',
        path: '/workspace/performance',
        name: 'Performance Monitoring',
        icon: '⚡',
        description: 'System performance monitoring',
        roles: [MEDICAL_USER_ROLES.ADMIN, MEDICAL_USER_ROLES.SYSTEM_ADMIN],
        type: 'admin',
        category: 'workspace'
      },
      {
        id: 'xr-workspace',
        path: '/workspace/xr',
        name: 'Medical XR',
        icon: '🥽',
        description: 'Virtual and augmented reality',
        roles: [MEDICAL_USER_ROLES.RADIOLOGIST, MEDICAL_USER_ROLES.ATTENDING_PHYSICIAN],
        type: 'protected',
        category: 'workspace',
        metadata: {
          requiresLicense: true
        }
      }
    ]
  },

  // Admin Routes (Admin Only)
  {
    id: 'admin',
    path: '/admin',
    name: 'Administration',
    icon: '⚙️',
    description: 'System administration',
    roles: [MEDICAL_USER_ROLES.ADMIN, MEDICAL_USER_ROLES.SYSTEM_ADMIN],
    type: 'admin',
    category: 'admin',
    metadata: {
      auditLevel: 'comprehensive'
    },
    children: [
      {
        id: 'user-management',
        path: '/admin/users',
        name: 'User Management',
        icon: '👤',
        description: 'Medical professional management',
        roles: [MEDICAL_USER_ROLES.ADMIN, MEDICAL_USER_ROLES.SYSTEM_ADMIN],
        type: 'admin',
        category: 'admin'
      },
      {
        id: 'organization-management',
        path: '/admin/organizations',
        name: 'Organization Management',
        icon: '🏢',
        description: 'Hospital and clinic management',
        roles: [MEDICAL_USER_ROLES.SYSTEM_ADMIN],
        type: 'admin',
        category: 'admin'
      },
      {
        id: 'system-health',
        path: '/admin/health',
        name: 'System Health',
        icon: '💚',
        description: 'System monitoring and health',
        roles: [MEDICAL_USER_ROLES.ADMIN, MEDICAL_USER_ROLES.SYSTEM_ADMIN],
        type: 'admin',
        category: 'admin'
      },
      {
        id: 'compliance-management',
        path: '/admin/compliance',
        name: 'Medical Compliance',
        icon: '🛡️',
        description: 'HIPAA and regulatory compliance',
        roles: [MEDICAL_USER_ROLES.ADMIN, MEDICAL_USER_ROLES.SYSTEM_ADMIN],
        type: 'admin',
        category: 'admin',
        metadata: {
          auditLevel: 'comprehensive',
          complianceRequired: ['HIPAA', 'DICOM', 'FDA']
        }
      }
    ]
  },

  // Emergency Routes (Emergency Access)
  {
    id: 'emergency',
    path: '/emergency',
    name: 'Emergency',
    icon: '🚨',
    description: 'Emergency medical protocols',
    roles: [MEDICAL_USER_ROLES.MEDICAL_PROFESSIONAL],
    type: 'emergency',
    category: 'emergency',
    metadata: {
      emergencyAccess: true,
      auditLevel: 'comprehensive'
    },
    children: [
      {
        id: 'emergency-alert',
        path: '/emergency/alert',
        name: 'Emergency Alert',
        icon: '🚨',
        description: 'Activate emergency alert',
        roles: [MEDICAL_USER_ROLES.MEDICAL_PROFESSIONAL],
        type: 'emergency',
        category: 'emergency',
        metadata: {
          emergencyAccess: true,
          auditLevel: 'comprehensive'
        }
      },
      {
        id: 'emergency-consult',
        path: '/emergency/consult',
        name: 'Emergency Consultation',
        icon: '📞',
        description: 'Request emergency consultation',
        roles: [MEDICAL_USER_ROLES.MEDICAL_PROFESSIONAL],
        type: 'emergency',
        category: 'emergency'
      }
    ]
  },

  // Support Routes (All Users)
  {
    id: 'support',
    path: '/support',
    name: 'Support',
    icon: '💡',
    description: 'Clinical support and training',
    roles: [MEDICAL_USER_ROLES.MEDICAL_PROFESSIONAL],
    type: 'protected',
    category: 'support',
    children: [
      {
        id: 'clinical-support',
        path: '/support/clinical',
        name: 'Clinical Support',
        icon: '💬',
        description: '24/7 clinical support',
        roles: [MEDICAL_USER_ROLES.MEDICAL_PROFESSIONAL],
        type: 'protected',
        category: 'support'
      },
      {
        id: 'training',
        path: '/training',
        name: 'Medical Training',
        icon: '🎓',
        description: 'Medical professional training',
        roles: [MEDICAL_USER_ROLES.MEDICAL_PROFESSIONAL],
        type: 'protected',
        category: 'support'
      },
      {
        id: 'documentation',
        path: '/docs',
        name: 'Documentation',
        icon: '📚',
        description: 'Clinical documentation',
        roles: [MEDICAL_USER_ROLES.MEDICAL_PROFESSIONAL],
        type: 'protected',
        category: 'support'
      }
    ]
  }
];

// Navigation utilities
export class MedicalNavigationManager {
  
  // Check if user has access to route
  static hasRouteAccess(route: MedicalRoute, userRoles: string[]): boolean {
    if (route.roles.length === 0) return true; // Public route
    return route.roles.some(role => userRoles.includes(role));
  }

  // Get filtered routes based on user roles
  static getFilteredRoutes(routes: MedicalRoute[], userRoles: string[]): MedicalRoute[] {
    return routes.filter(route => {
      if (!this.hasRouteAccess(route, userRoles)) return false;
      
      if (route.children) {
        route.children = this.getFilteredRoutes(route.children, userRoles);
      }
      
      return true;
    });
  }

  // Find route by path
  static findRouteByPath(routes: MedicalRoute[], path: string): MedicalRoute | null {
    for (const route of routes) {
      if (route.path === path) return route;
      
      if (route.children) {
        const found = this.findRouteByPath(route.children, path);
        if (found) return found;
      }
    }
    return null;
  }

  // Get breadcrumb trail for path
  static getBreadcrumbTrail(routes: MedicalRoute[], path: string): MedicalRoute[] {
    const trail: MedicalRoute[] = [];
    
    const findTrail = (routes: MedicalRoute[], targetPath: string, currentTrail: MedicalRoute[]): boolean => {
      for (const route of routes) {
        const newTrail = [...currentTrail, route];
        
        if (route.path === targetPath) {
          trail.push(...newTrail);
          return true;
        }
        
        if (route.children && targetPath.startsWith(route.path)) {
          if (findTrail(route.children, targetPath, newTrail)) {
            return true;
          }
        }
      }
      return false;
    };
    
    findTrail(routes, path, []);
    return trail;
  }

  // Get routes by category
  static getRoutesByCategory(routes: MedicalRoute[], category: string): MedicalRoute[] {
    const result: MedicalRoute[] = [];
    
    for (const route of routes) {
      if (route.category === category) {
        result.push(route);
      }
      
      if (route.children) {
        result.push(...this.getRoutesByCategory(route.children, category));
      }
    }
    
    return result;
  }

  // Validate route access with metadata
  static validateRouteAccess(route: MedicalRoute, user: any): {
    allowed: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let allowed = true;

    // Check role access
    if (!this.hasRouteAccess(route, user.roles || [])) {
      allowed = false;
      reasons.push('Insufficient role permissions');
    }

    // Check metadata requirements
    if (route.metadata) {
      if (route.metadata.requiresMFA && !user.mfaVerified) {
        allowed = false;
        reasons.push('Multi-factor authentication required');
      }

      if (route.metadata.requiresLicense && !user.medicalLicense) {
        allowed = false;
        reasons.push('Valid medical license required');
      }

      if (route.metadata.complianceRequired) {
        const missingCompliance = route.metadata.complianceRequired.filter(
          comp => !user.compliance?.includes(comp)
        );
        if (missingCompliance.length > 0) {
          allowed = false;
          reasons.push(`Missing compliance: ${missingCompliance.join(', ')}`);
        }
      }
    }

    return { allowed, reasons };
  }
}

// Export navigation configuration
export default MEDICAL_NAVIGATION_CONFIG; 