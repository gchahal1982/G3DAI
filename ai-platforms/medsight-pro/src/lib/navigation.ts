/**
 * Navigation Configuration Library
 * Medical-specific routing, permissions, and navigation utilities
 * 
 * Features:
 * - Role-based navigation configuration
 * - Medical workflow routing
 * - Permission-based access control
 * - Navigation breadcrumb generation
 * - Medical emergency navigation
 * - Compliance routing
 * - Navigation state management
 * - Medical workspace navigation
 * - Quick action routing
 * - Navigation analytics
 */

import { medicalServices } from '@/config/shared-config';

// Navigation item types
export type NavigationItemType = 'system' | 'workspace' | 'case' | 'study' | 'admin' | 'emergency' | 'compliance' | 'ai' | 'collaboration';

// Navigation item interface
export interface NavigationItem {
  id: string;
  name: string;
  path: string;
  icon: string;
  description?: string;
  type: NavigationItemType;
  badge?: {
    text: string;
    variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    count?: number;
  };
  permissions: string[];
  children?: NavigationItem[];
  isActive?: boolean;
  disabled?: boolean;
  emergency?: boolean;
  compliance?: boolean;
  metadata?: {
    workspaceType?: string;
    category?: string;
    priority?: number;
    lastAccessed?: Date;
    accessCount?: number;
  };
}

// Navigation configuration interface
export interface NavigationConfig {
  items: NavigationItem[];
  emergencyItems: NavigationItem[];
  quickActions: NavigationItem[];
  breadcrumbSeparators: Record<NavigationItemType, string>;
  icons: Record<NavigationItemType, string>;
  colors: Record<NavigationItemType, string>;
}

// Medical navigation configuration
export const MEDICAL_NAVIGATION_CONFIG: NavigationConfig = {
  items: [
    // System Navigation
    {
      id: 'dashboard',
      name: 'Medical Dashboard',
      path: '/dashboard/medical',
      icon: '🏥',
      description: 'Main clinical workspace',
      type: 'system',
      permissions: ['view-patient-data'],
      metadata: {
        workspaceType: 'primary',
        category: 'dashboard',
        priority: 1
      }
    },
    {
      id: 'admin-dashboard',
      name: 'Admin Dashboard',
      path: '/dashboard/admin',
      icon: '⚙️',
      description: 'System administration',
      type: 'admin',
      permissions: ['system-administration'],
      badge: {
        text: 'Admin',
        variant: 'warning'
      },
      metadata: {
        workspaceType: 'admin',
        category: 'dashboard',
        priority: 2
      }
    },
    {
      id: 'enterprise-dashboard',
      name: 'Enterprise Dashboard',
      path: '/dashboard/enterprise',
      icon: '🏢',
      description: 'Multi-tenant management',
      type: 'system',
      permissions: ['system-administration'],
      badge: {
        text: 'Enterprise',
        variant: 'primary'
      },
      metadata: {
        workspaceType: 'enterprise',
        category: 'dashboard',
        priority: 3
      }
    },
    {
      id: 'analytics-dashboard',
      name: 'Analytics Dashboard',
      path: '/dashboard/analytics',
      icon: '📊',
      description: 'Business intelligence',
      type: 'system',
      permissions: ['system-administration'],
      badge: {
        text: 'Analytics',
        variant: 'info'
      },
      metadata: {
        workspaceType: 'analytics',
        category: 'dashboard',
        priority: 4
      }
    },

    // Medical Workspaces
    {
      id: 'imaging-workspace',
      name: 'Medical Imaging',
      path: '/workspace/imaging',
      icon: '🔬',
      description: 'DICOM imaging workspace',
      type: 'workspace',
      permissions: ['view-dicom-images'],
      badge: {
        text: 'DICOM',
        variant: 'secondary'
      },
      metadata: {
        workspaceType: 'imaging',
        category: 'medical',
        priority: 1
      }
    },
    {
      id: 'ai-analysis-workspace',
      name: 'AI Analysis',
      path: '/workspace/ai-analysis',
      icon: '🤖',
      description: 'Medical AI tools',
      type: 'ai',
      permissions: ['access-ai-tools'],
      badge: {
        text: 'AI',
        variant: 'success'
      },
      metadata: {
        workspaceType: 'ai',
        category: 'medical',
        priority: 2
      }
    },
    {
      id: 'collaboration-workspace',
      name: 'Collaboration',
      path: '/workspace/collaboration',
      icon: '👥',
      description: 'Multi-user review',
      type: 'collaboration',
      permissions: ['view-patient-data'],
      badge: {
        text: 'Collab',
        variant: 'info'
      },
      metadata: {
        workspaceType: 'collaboration',
        category: 'medical',
        priority: 3
      }
    },
    {
      id: 'performance-workspace',
      name: 'Performance',
      path: '/workspace/performance',
      icon: '⚡',
      description: 'System performance monitoring',
      type: 'system',
      permissions: ['system-administration'],
      badge: {
        text: 'Perf',
        variant: 'warning'
      },
      metadata: {
        workspaceType: 'performance',
        category: 'system',
        priority: 4
      }
    },

    // Medical Cases and Studies
    {
      id: 'medical-cases',
      name: 'Medical Cases',
      path: '/medical/cases',
      icon: '📋',
      description: 'Patient case management',
      type: 'case',
      permissions: ['view-patient-data'],
      metadata: {
        workspaceType: 'cases',
        category: 'medical',
        priority: 1
      }
    },
    {
      id: 'medical-studies',
      name: 'Medical Studies',
      path: '/medical/studies',
      icon: '📊',
      description: 'Research studies',
      type: 'study',
      permissions: ['view-patient-data'],
      metadata: {
        workspaceType: 'studies',
        category: 'medical',
        priority: 2
      }
    },
    {
      id: 'medical-reports',
      name: 'Medical Reports',
      path: '/medical/reports',
      icon: '📄',
      description: 'Generate clinical reports',
      type: 'case',
      permissions: ['generate-reports'],
      metadata: {
        workspaceType: 'reports',
        category: 'medical',
        priority: 3
      }
    },

    // User Management
    {
      id: 'user-management',
      name: 'User Management',
      path: '/admin/users',
      icon: '👤',
      description: 'Manage medical professionals',
      type: 'admin',
      permissions: ['manage-users'],
      metadata: {
        workspaceType: 'user-management',
        category: 'admin',
        priority: 1
      }
    },

    // Compliance and Security
    {
      id: 'compliance-center',
      name: 'Compliance Center',
      path: '/admin/compliance',
      icon: '🛡️',
      description: 'HIPAA & regulatory compliance',
      type: 'compliance',
      permissions: ['compliance-access'],
      badge: {
        text: 'HIPAA',
        variant: 'success'
      },
      compliance: true,
      metadata: {
        workspaceType: 'compliance',
        category: 'admin',
        priority: 1
      }
    },
    {
      id: 'security-center',
      name: 'Security Center',
      path: '/admin/security',
      icon: '🔒',
      description: 'Security monitoring',
      type: 'admin',
      permissions: ['system-administration'],
      badge: {
        text: 'Security',
        variant: 'error'
      },
      metadata: {
        workspaceType: 'security',
        category: 'admin',
        priority: 2
      }
    },
    {
      id: 'audit-logs',
      name: 'Audit Logs',
      path: '/admin/audit',
      icon: '📋',
      description: 'Medical audit trail',
      type: 'compliance',
      permissions: ['audit-access'],
      compliance: true,
      metadata: {
        workspaceType: 'audit',
        category: 'admin',
        priority: 3
      }
    }
  ],

  emergencyItems: [
    {
      id: 'emergency-access',
      name: 'Emergency Access',
      path: '/emergency/access',
      icon: '🚨',
      description: 'Emergency patient access',
      type: 'emergency',
      permissions: ['emergency-access'],
      emergency: true,
      badge: {
        text: 'Emergency',
        variant: 'error'
      },
      metadata: {
        workspaceType: 'emergency',
        category: 'emergency',
        priority: 1
      }
    },
    {
      id: 'emergency-protocols',
      name: 'Emergency Protocols',
      path: '/emergency/protocols',
      icon: '📟',
      description: 'Medical emergency procedures',
      type: 'emergency',
      permissions: ['emergency-access'],
      emergency: true,
      metadata: {
        workspaceType: 'emergency',
        category: 'emergency',
        priority: 2
      }
    },
    {
      id: 'emergency-contacts',
      name: 'Emergency Contacts',
      path: '/emergency/contacts',
      icon: '📞',
      description: 'Emergency contact directory',
      type: 'emergency',
      permissions: ['emergency-access'],
      emergency: true,
      metadata: {
        workspaceType: 'emergency',
        category: 'emergency',
        priority: 3
      }
    }
  ],

  quickActions: [
    {
      id: 'new-case',
      name: 'New Case',
      path: '/medical/cases/new',
      icon: '➕',
      description: 'Create new medical case',
      type: 'case',
      permissions: ['view-patient-data'],
      metadata: {
        workspaceType: 'quick-action',
        category: 'medical',
        priority: 1
      }
    },
    {
      id: 'upload-dicom',
      name: 'Upload DICOM',
      path: '/workspace/imaging/upload',
      icon: '📤',
      description: 'Upload DICOM files',
      type: 'workspace',
      permissions: ['view-dicom-images'],
      metadata: {
        workspaceType: 'quick-action',
        category: 'medical',
        priority: 2
      }
    },
    {
      id: 'ai-analysis',
      name: 'AI Analysis',
      path: '/workspace/ai-analysis',
      icon: '🤖',
      description: 'Run AI analysis',
      type: 'ai',
      permissions: ['access-ai-tools'],
      metadata: {
        workspaceType: 'quick-action',
        category: 'medical',
        priority: 3
      }
    },
    {
      id: 'generate-report',
      name: 'Generate Report',
      path: '/medical/reports/generate',
      icon: '📄',
      description: 'Generate medical report',
      type: 'case',
      permissions: ['generate-reports'],
      metadata: {
        workspaceType: 'quick-action',
        category: 'medical',
        priority: 4
      }
    }
  ],

  breadcrumbSeparators: {
    system: '/',
    workspace: '→',
    case: '•',
    study: '›',
    admin: '⚙',
    emergency: '🚨',
    compliance: '🛡',
    ai: '🤖',
    collaboration: '👥'
  },

  icons: {
    system: '🏥',
    workspace: '🔬',
    case: '📋',
    study: '📊',
    admin: '⚙️',
    emergency: '🚨',
    compliance: '🛡️',
    ai: '🤖',
    collaboration: '👥'
  },

  colors: {
    system: 'text-blue-600',
    workspace: 'text-green-600',
    case: 'text-yellow-600',
    study: 'text-purple-600',
    admin: 'text-orange-600',
    emergency: 'text-red-600',
    compliance: 'text-indigo-600',
    ai: 'text-emerald-600',
    collaboration: 'text-pink-600'
  }
};

// Navigation utilities
export class NavigationUtils {
  private static instance: NavigationUtils;
  private navigationConfig: NavigationConfig;

  private constructor() {
    this.navigationConfig = MEDICAL_NAVIGATION_CONFIG;
  }

  public static getInstance(): NavigationUtils {
    if (!NavigationUtils.instance) {
      NavigationUtils.instance = new NavigationUtils();
    }
    return NavigationUtils.instance;
  }

  // Get navigation items filtered by user permissions
  public getNavigationItems(userPermissions: string[] = []): NavigationItem[] {
    return this.navigationConfig.items.filter(item => 
      this.hasPermission(item.permissions, userPermissions)
    );
  }

  // Get emergency navigation items
  public getEmergencyItems(userPermissions: string[] = []): NavigationItem[] {
    return this.navigationConfig.emergencyItems.filter(item => 
      this.hasPermission(item.permissions, userPermissions)
    );
  }

  // Get quick action items
  public getQuickActions(userPermissions: string[] = []): NavigationItem[] {
    return this.navigationConfig.quickActions.filter(item => 
      this.hasPermission(item.permissions, userPermissions)
    );
  }

  // Check if user has required permissions
  private hasPermission(requiredPermissions: string[], userPermissions: string[]): boolean {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  }

  // Get navigation item by ID
  public getNavigationItem(id: string): NavigationItem | undefined {
    const allItems = [
      ...this.navigationConfig.items,
      ...this.navigationConfig.emergencyItems,
      ...this.navigationConfig.quickActions
    ];
    return allItems.find(item => item.id === id);
  }

  // Get navigation items by type
  public getNavigationItemsByType(type: NavigationItemType, userPermissions: string[] = []): NavigationItem[] {
    return this.getNavigationItems(userPermissions).filter(item => item.type === type);
  }

  // Get navigation items by category
  public getNavigationItemsByCategory(category: string, userPermissions: string[] = []): NavigationItem[] {
    return this.getNavigationItems(userPermissions).filter(item => 
      item.metadata?.category === category
    );
  }

  // Check if navigation item is accessible
  public isNavigationItemAccessible(itemId: string, userPermissions: string[] = []): boolean {
    const item = this.getNavigationItem(itemId);
    if (!item) return false;
    return this.hasPermission(item.permissions, userPermissions);
  }

  // Get breadcrumb path for a given route
  public getBreadcrumbPath(pathname: string): NavigationItem[] {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: NavigationItem[] = [];

    // Always start with root
    breadcrumbs.push({
      id: 'root',
      name: 'MedSight Pro',
      path: '/dashboard',
      icon: '🏥',
      type: 'system',
      permissions: []
    });

    // Build breadcrumb path
    let currentPath = '';
    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      
      // Find matching navigation item
      const matchingItem = this.findNavigationItemByPath(currentPath);
      if (matchingItem) {
        breadcrumbs.push({
          ...matchingItem,
          path: currentPath
        });
      } else {
        // Create generic breadcrumb item
        breadcrumbs.push({
          id: segment,
          name: this.formatBreadcrumbName(segment),
          path: currentPath,
          icon: '📄',
          type: 'system',
          permissions: []
        });
      }
    }

    return breadcrumbs;
  }

  // Find navigation item by path
  private findNavigationItemByPath(path: string): NavigationItem | undefined {
    const allItems = [
      ...this.navigationConfig.items,
      ...this.navigationConfig.emergencyItems,
      ...this.navigationConfig.quickActions
    ];
    
    return allItems.find(item => item.path === path || item.path.startsWith(path));
  }

  // Format breadcrumb name
  private formatBreadcrumbName(segment: string): string {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Get navigation separator for breadcrumbs
  public getBreadcrumbSeparator(type: NavigationItemType): string {
    return this.navigationConfig.breadcrumbSeparators[type] || '/';
  }

  // Get navigation icon for type
  public getNavigationIcon(type: NavigationItemType): string {
    return this.navigationConfig.icons[type] || '📄';
  }

  // Get navigation color for type
  public getNavigationColor(type: NavigationItemType): string {
    return this.navigationConfig.colors[type] || 'text-gray-600';
  }

  // Update navigation item metadata
  public updateNavigationItemMetadata(itemId: string, metadata: Partial<NavigationItem['metadata']>): void {
    const item = this.getNavigationItem(itemId);
    if (item && item.metadata) {
      item.metadata = { ...item.metadata, ...metadata };
    }
  }

  // Track navigation access
  public trackNavigationAccess(itemId: string, userId: string): void {
    const item = this.getNavigationItem(itemId);
    if (item) {
      // Update access metadata
      this.updateNavigationItemMetadata(itemId, {
        lastAccessed: new Date(),
        accessCount: (item.metadata?.accessCount || 0) + 1
      });

      // Medical audit logging
      medicalServices.auditMedicalAccess(
        userId,
        'navigation',
        `NAVIGATION_ACCESS_${itemId.toUpperCase()}`
      );
    }
  }

  // Get most accessed navigation items
  public getMostAccessedItems(userPermissions: string[] = [], limit: number = 5): NavigationItem[] {
    return this.getNavigationItems(userPermissions)
      .sort((a, b) => (b.metadata?.accessCount || 0) - (a.metadata?.accessCount || 0))
      .slice(0, limit);
  }

  // Get recently accessed navigation items
  public getRecentlyAccessedItems(userPermissions: string[] = [], limit: number = 5): NavigationItem[] {
    return this.getNavigationItems(userPermissions)
      .filter(item => item.metadata?.lastAccessed)
      .sort((a, b) => {
        const aTime = a.metadata?.lastAccessed?.getTime() || 0;
        const bTime = b.metadata?.lastAccessed?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, limit);
  }

  // Check if navigation item is active
  public isNavigationItemActive(itemPath: string, currentPath: string): boolean {
    if (itemPath === currentPath) return true;
    if (itemPath === '/dashboard/medical' && currentPath === '/dashboard') return true;
    return currentPath.startsWith(itemPath + '/');
  }

  // Get navigation badge count
  public getNavigationBadgeCount(itemId: string): number {
    const item = this.getNavigationItem(itemId);
    return item?.badge?.count || 0;
  }

  // Update navigation badge count
  public updateNavigationBadgeCount(itemId: string, count: number): void {
    const item = this.getNavigationItem(itemId);
    if (item && item.badge) {
      item.badge.count = count;
    }
  }

  // Get medical compliance navigation items
  public getComplianceNavigationItems(userPermissions: string[] = []): NavigationItem[] {
    return this.getNavigationItems(userPermissions).filter(item => item.compliance);
  }

  // Get emergency navigation items
  public getEmergencyNavigationItems(userPermissions: string[] = []): NavigationItem[] {
    return this.getNavigationItems(userPermissions).filter(item => item.emergency);
  }

  // Validate navigation configuration
  public validateNavigationConfig(): boolean {
    try {
      // Check for duplicate IDs
      const allItems = [
        ...this.navigationConfig.items,
        ...this.navigationConfig.emergencyItems,
        ...this.navigationConfig.quickActions
      ];
      
      const ids = allItems.map(item => item.id);
      const uniqueIds = new Set(ids);
      
      if (ids.length !== uniqueIds.size) {
        console.error('Navigation configuration has duplicate IDs');
        return false;
      }

      // Check for invalid paths
      const invalidPaths = allItems.filter(item => !item.path.startsWith('/'));
      if (invalidPaths.length > 0) {
        console.error('Navigation configuration has invalid paths:', invalidPaths);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Navigation configuration validation failed:', error);
      return false;
    }
  }

  // Export navigation configuration
  public exportNavigationConfig(): NavigationConfig {
    return { ...this.navigationConfig };
  }

  // Import navigation configuration
  public importNavigationConfig(config: NavigationConfig): void {
    this.navigationConfig = config;
  }
}

// Navigation hooks and utilities
export const navigationUtils = NavigationUtils.getInstance();

// Medical navigation constants
export const MEDICAL_NAVIGATION_CONSTANTS = {
  DEFAULT_DASHBOARD: '/dashboard/medical',
  EMERGENCY_ACCESS: '/emergency/access',
  COMPLIANCE_CENTER: '/admin/compliance',
  IMAGING_WORKSPACE: '/workspace/imaging',
  AI_ANALYSIS: '/workspace/ai-analysis',
  COLLABORATION: '/workspace/collaboration',
  ADMIN_DASHBOARD: '/dashboard/admin',
  ENTERPRISE_DASHBOARD: '/dashboard/enterprise',
  ANALYTICS_DASHBOARD: '/dashboard/analytics'
} as const;

// Medical navigation types
export type MedicalNavigationRoute = typeof MEDICAL_NAVIGATION_CONSTANTS[keyof typeof MEDICAL_NAVIGATION_CONSTANTS];

// Navigation permissions
export const NAVIGATION_PERMISSIONS = {
  VIEW_PATIENT_DATA: 'view-patient-data',
  VIEW_DICOM_IMAGES: 'view-dicom-images',
  ACCESS_AI_TOOLS: 'access-ai-tools',
  GENERATE_REPORTS: 'generate-reports',
  MANAGE_USERS: 'manage-users',
  SYSTEM_ADMINISTRATION: 'system-administration',
  EMERGENCY_ACCESS: 'emergency-access',
  COMPLIANCE_ACCESS: 'compliance-access',
  AUDIT_ACCESS: 'audit-access'
} as const;

// Navigation roles
export const NAVIGATION_ROLES = {
  MEDICAL_STUDENT: 'medical-student',
  RESIDENT: 'resident',
  ATTENDING: 'attending',
  FELLOW: 'fellow',
  RADIOLOGIST: 'radiologist',
  TECHNOLOGIST: 'technologist',
  NURSE: 'nurse',
  ADMINISTRATOR: 'administrator',
  SYSTEM_ADMIN: 'system-admin',
  SUPER_ADMIN: 'super-admin'
} as const;

// Default export
export default navigationUtils; 