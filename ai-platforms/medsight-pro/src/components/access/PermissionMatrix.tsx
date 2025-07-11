'use client';

import React, { useState, useEffect } from 'react';
import { 
  LockClosedIcon,
  LockOpenIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  DocumentIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  CpuChipIcon,
  HeartIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Permission Types
interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'medical_data' | 'patient_access' | 'procedures' | 'system_admin' | 'emergency' | 'audit_compliance';
  subcategory?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresApproval: boolean;
  requiresSupervision: boolean;
  auditRequired: boolean;
  hipaaProtected: boolean;
  emergencyOverride: boolean;
  timeRestricted: boolean;
  locationRestricted: boolean;
  icon: React.ComponentType<any>;
  color: string;
}

interface RolePermission {
  roleId: string;
  roleName: string;
  roleHierarchy: number;
  permissions: {
    [permissionId: string]: {
      granted: boolean;
      inherited: boolean;
      restrictedBy?: string[];
      conditions?: string[];
      approvedBy?: string;
      approvedAt?: Date;
    };
  };
}

interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  permissions: Permission[];
}

// Medical Permission Definitions
const MEDICAL_PERMISSIONS: Permission[] = [
  // Medical Data Access
  {
    id: 'read_patient_demographics',
    name: 'Read Patient Demographics',
    description: 'Access patient basic information (name, DOB, MRN)',
    category: 'patient_access',
    subcategory: 'demographics',
    riskLevel: 'medium',
    requiresApproval: false,
    requiresSupervision: false,
    auditRequired: true,
    hipaaProtected: true,
    emergencyOverride: true,
    timeRestricted: false,
    locationRestricted: false,
    icon: UserIcon,
    color: '#0ea5e9'
  },
  {
    id: 'read_patient_medical_history',
    name: 'Read Patient Medical History',
    description: 'Access patient medical history and diagnoses',
    category: 'patient_access',
    subcategory: 'medical_history',
    riskLevel: 'high',
    requiresApproval: false,
    requiresSupervision: false,
    auditRequired: true,
    hipaaProtected: true,
    emergencyOverride: true,
    timeRestricted: false,
    locationRestricted: false,
    icon: ClipboardDocumentListIcon,
    color: '#ef4444'
  },
  {
    id: 'write_patient_notes',
    name: 'Write Patient Notes',
    description: 'Create and modify patient clinical notes',
    category: 'patient_access',
    subcategory: 'clinical_notes',
    riskLevel: 'high',
    requiresApproval: false,
    requiresSupervision: true,
    auditRequired: true,
    hipaaProtected: true,
    emergencyOverride: true,
    timeRestricted: false,
    locationRestricted: false,
    icon: PencilIcon,
    color: '#f59e0b'
  },
  {
    id: 'read_dicom_images',
    name: 'Read DICOM Images',
    description: 'Access and view medical imaging studies',
    category: 'medical_data',
    subcategory: 'imaging',
    riskLevel: 'medium',
    requiresApproval: false,
    requiresSupervision: false,
    auditRequired: true,
    hipaaProtected: true,
    emergencyOverride: true,
    timeRestricted: false,
    locationRestricted: false,
    icon: CpuChipIcon,
    color: '#10b981'
  },
  {
    id: 'modify_dicom_images',
    name: 'Modify DICOM Images',
    description: 'Edit and annotate medical imaging studies',
    category: 'medical_data',
    subcategory: 'imaging',
    riskLevel: 'high',
    requiresApproval: true,
    requiresSupervision: true,
    auditRequired: true,
    hipaaProtected: true,
    emergencyOverride: false,
    timeRestricted: false,
    locationRestricted: true,
    icon: PencilIcon,
    color: '#ef4444'
  },
  {
    id: 'create_radiology_reports',
    name: 'Create Radiology Reports',
    description: 'Generate and finalize radiology reports',
    category: 'procedures',
    subcategory: 'radiology',
    riskLevel: 'high',
    requiresApproval: false,
    requiresSupervision: false,
    auditRequired: true,
    hipaaProtected: true,
    emergencyOverride: true,
    timeRestricted: false,
    locationRestricted: false,
    icon: DocumentIcon,
    color: '#0ea5e9'
  },
  {
    id: 'approve_radiology_reports',
    name: 'Approve Radiology Reports',
    description: 'Sign and approve radiology reports',
    category: 'procedures',
    subcategory: 'radiology',
    riskLevel: 'critical',
    requiresApproval: false,
    requiresSupervision: false,
    auditRequired: true,
    hipaaProtected: true,
    emergencyOverride: true,
    timeRestricted: false,
    locationRestricted: false,
    icon: CheckCircleIcon,
    color: '#10b981'
  },
  {
    id: 'run_ai_analysis',
    name: 'Run AI Analysis',
    description: 'Execute AI-powered medical analysis',
    category: 'procedures',
    subcategory: 'ai_analysis',
    riskLevel: 'medium',
    requiresApproval: false,
    requiresSupervision: false,
    auditRequired: true,
    hipaaProtected: true,
    emergencyOverride: true,
    timeRestricted: false,
    locationRestricted: false,
    icon: BeakerIcon,
    color: '#7c3aed'
  },
  {
    id: 'manage_users',
    name: 'Manage Users',
    description: 'Create, modify, and delete user accounts',
    category: 'system_admin',
    subcategory: 'user_management',
    riskLevel: 'critical',
    requiresApproval: true,
    requiresSupervision: false,
    auditRequired: true,
    hipaaProtected: false,
    emergencyOverride: false,
    timeRestricted: false,
    locationRestricted: true,
    icon: UserIcon,
    color: '#dc2626'
  },
  {
    id: 'manage_roles',
    name: 'Manage Roles',
    description: 'Create and modify user roles and permissions',
    category: 'system_admin',
    subcategory: 'role_management',
    riskLevel: 'critical',
    requiresApproval: true,
    requiresSupervision: false,
    auditRequired: true,
    hipaaProtected: false,
    emergencyOverride: false,
    timeRestricted: false,
    locationRestricted: true,
    icon: ShieldCheckIcon,
    color: '#dc2626'
  },
  {
    id: 'system_configuration',
    name: 'System Configuration',
    description: 'Modify system settings and configurations',
    category: 'system_admin',
    subcategory: 'configuration',
    riskLevel: 'critical',
    requiresApproval: true,
    requiresSupervision: false,
    auditRequired: true,
    hipaaProtected: false,
    emergencyOverride: false,
    timeRestricted: false,
    locationRestricted: true,
    icon: CogIcon,
    color: '#dc2626'
  },
  {
    id: 'emergency_access_override',
    name: 'Emergency Access Override',
    description: 'Override access restrictions in emergency situations',
    category: 'emergency',
    subcategory: 'override',
    riskLevel: 'critical',
    requiresApproval: true,
    requiresSupervision: true,
    auditRequired: true,
    hipaaProtected: true,
    emergencyOverride: false,
    timeRestricted: true,
    locationRestricted: false,
    icon: ExclamationTriangleIcon,
    color: '#dc2626'
  },
  {
    id: 'view_audit_logs',
    name: 'View Audit Logs',
    description: 'Access system and user audit logs',
    category: 'audit_compliance',
    subcategory: 'audit_logs',
    riskLevel: 'high',
    requiresApproval: false,
    requiresSupervision: false,
    auditRequired: true,
    hipaaProtected: false,
    emergencyOverride: false,
    timeRestricted: false,
    locationRestricted: true,
    icon: EyeIcon,
    color: '#059669'
  },
  {
    id: 'export_compliance_reports',
    name: 'Export Compliance Reports',
    description: 'Generate and export compliance reports',
    category: 'audit_compliance',
    subcategory: 'reporting',
    riskLevel: 'high',
    requiresApproval: true,
    requiresSupervision: false,
    auditRequired: true,
    hipaaProtected: false,
    emergencyOverride: false,
    timeRestricted: false,
    locationRestricted: true,
    icon: ChartBarIcon,
    color: '#059669'
  },
  {
    id: 'cardiac_procedures',
    name: 'Cardiac Procedures',
    description: 'Access cardiac imaging and procedures',
    category: 'procedures',
    subcategory: 'cardiology',
    riskLevel: 'high',
    requiresApproval: false,
    requiresSupervision: false,
    auditRequired: true,
    hipaaProtected: true,
    emergencyOverride: true,
    timeRestricted: false,
    locationRestricted: false,
    icon: HeartIcon,
    color: '#ef4444'
  }
];

// Permission Groups
const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'patient_access',
    name: 'Patient Access',
    description: 'Patient demographic and medical record access',
    icon: UserIcon,
    color: '#0ea5e9',
    permissions: MEDICAL_PERMISSIONS.filter(p => p.category === 'patient_access')
  },
  {
    id: 'medical_data',
    name: 'Medical Data',
    description: 'Medical imaging and clinical data access',
    icon: CpuChipIcon,
    color: '#10b981',
    permissions: MEDICAL_PERMISSIONS.filter(p => p.category === 'medical_data')
  },
  {
    id: 'procedures',
    name: 'Medical Procedures',
    description: 'Medical procedures and clinical workflows',
    icon: BeakerIcon,
    color: '#7c3aed',
    permissions: MEDICAL_PERMISSIONS.filter(p => p.category === 'procedures')
  },
  {
    id: 'system_admin',
    name: 'System Administration',
    description: 'System configuration and user management',
    icon: CogIcon,
    color: '#dc2626',
    permissions: MEDICAL_PERMISSIONS.filter(p => p.category === 'system_admin')
  },
  {
    id: 'emergency',
    name: 'Emergency Access',
    description: 'Emergency override and critical access',
    icon: ExclamationTriangleIcon,
    color: '#dc2626',
    permissions: MEDICAL_PERMISSIONS.filter(p => p.category === 'emergency')
  },
  {
    id: 'audit_compliance',
    name: 'Audit & Compliance',
    description: 'Audit logs and compliance reporting',
    icon: ShieldCheckIcon,
    color: '#059669',
    permissions: MEDICAL_PERMISSIONS.filter(p => p.category === 'audit_compliance')
  }
];

// Mock roles
const MOCK_ROLES: RolePermission[] = [
  {
    roleId: 'chief-radiology',
    roleName: 'Chief of Radiology',
    roleHierarchy: 7,
    permissions: {
      'read_patient_demographics': { granted: true, inherited: false },
      'read_patient_medical_history': { granted: true, inherited: false },
      'write_patient_notes': { granted: true, inherited: false },
      'read_dicom_images': { granted: true, inherited: false },
      'modify_dicom_images': { granted: true, inherited: false },
      'create_radiology_reports': { granted: true, inherited: false },
      'approve_radiology_reports': { granted: true, inherited: false },
      'run_ai_analysis': { granted: true, inherited: false },
      'manage_users': { granted: true, inherited: false, restrictedBy: ['department'] },
      'view_audit_logs': { granted: true, inherited: false },
      'emergency_access_override': { granted: true, inherited: false }
    }
  },
  {
    roleId: 'attending-radiologist',
    roleName: 'Attending Radiologist',
    roleHierarchy: 4,
    permissions: {
      'read_patient_demographics': { granted: true, inherited: false },
      'read_patient_medical_history': { granted: true, inherited: false },
      'write_patient_notes': { granted: true, inherited: false },
      'read_dicom_images': { granted: true, inherited: false },
      'create_radiology_reports': { granted: true, inherited: false },
      'approve_radiology_reports': { granted: true, inherited: false },
      'run_ai_analysis': { granted: true, inherited: false }
    }
  },
  {
    roleId: 'radiology-resident',
    roleName: 'Radiology Resident',
    roleHierarchy: 2,
    permissions: {
      'read_patient_demographics': { granted: true, inherited: false },
      'read_patient_medical_history': { granted: true, inherited: false },
      'write_patient_notes': { granted: true, inherited: false, conditions: ['requires_supervision'] },
      'read_dicom_images': { granted: true, inherited: false },
      'create_radiology_reports': { granted: true, inherited: false, conditions: ['requires_supervision'] },
      'run_ai_analysis': { granted: true, inherited: false }
    }
  },
  {
    roleId: 'system-admin',
    roleName: 'System Administrator',
    roleHierarchy: 8,
    permissions: {
      'manage_users': { granted: true, inherited: false },
      'manage_roles': { granted: true, inherited: false },
      'system_configuration': { granted: true, inherited: false },
      'view_audit_logs': { granted: true, inherited: false },
      'export_compliance_reports': { granted: true, inherited: false }
    }
  }
];

export default function PermissionMatrix() {
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(MOCK_ROLES);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyGranted, setShowOnlyGranted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Filter permissions based on search and filters
  const filteredPermissions = MEDICAL_PERMISSIONS.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || permission.category === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const getRiskLevelColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'low': return 'text-medsight-secondary';
      case 'medium': return 'text-medsight-accent';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-medsight-critical';
      default: return 'text-gray-500';
    }
  };

  const getRiskLevelBg = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'low': return 'bg-medsight-secondary/10';
      case 'medium': return 'bg-medsight-accent/10';
      case 'high': return 'bg-orange-600/10';
      case 'critical': return 'bg-medsight-critical/10';
      default: return 'bg-gray-100';
    }
  };

  const getPermissionStatus = (roleId: string, permissionId: string) => {
    const role = rolePermissions.find(r => r.roleId === roleId);
    if (!role) return null;
    return role.permissions[permissionId] || null;
  };

  const togglePermission = (roleId: string, permissionId: string) => {
    setRolePermissions(prevRoles => 
      prevRoles.map(role => {
        if (role.roleId === roleId) {
          const currentStatus = role.permissions[permissionId];
          return {
            ...role,
            permissions: {
              ...role.permissions,
              [permissionId]: {
                granted: !currentStatus?.granted,
                inherited: false,
                conditions: currentStatus?.conditions || []
              }
            }
          };
        }
        return role;
      })
    );
  };

  const getRolePermissionCount = (roleId: string) => {
    const role = rolePermissions.find(r => r.roleId === roleId);
    if (!role) return 0;
    return Object.values(role.permissions).filter(p => p.granted).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-medsight-primary mb-2">
              Medical Permission Matrix
            </h2>
            <p className="text-gray-600">
              Manage medical data access permissions and role-based access control
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`btn-medsight ${showDetails ? 'bg-medsight-primary text-white' : ''}`}
            >
              <InformationCircleIcon className="w-4 h-4 mr-2" />
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            <button className="btn-medsight flex items-center gap-2">
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-medsight pl-10 w-full"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="input-medsight"
          >
            <option value="">All Roles</option>
            {rolePermissions.map(role => (
              <option key={role.roleId} value={role.roleId}>
                {role.roleName}
              </option>
            ))}
          </select>

          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="input-medsight"
          >
            <option value="all">All Categories</option>
            {PERMISSION_GROUPS.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>

          {/* View Options */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlyGranted}
                onChange={(e) => setShowOnlyGranted(e.target.checked)}
                className="rounded border-medsight-primary/20"
              />
              <span className="text-sm text-gray-700">Granted Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Permission Groups Overview */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">
          Permission Categories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PERMISSION_GROUPS.map(group => {
            const Icon = group.icon;
            return (
              <div key={group.id} className="medsight-control-glass p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5" style={{ color: group.color }} />
                  <h4 className="font-semibold text-medsight-primary">
                    {group.name}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {group.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {group.permissions.length} permissions
                  </span>
                  <span className="text-medsight-primary">
                    {group.permissions.filter(p => p.riskLevel === 'critical').length} critical
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="medsight-glass rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-medsight-primary">
              Permission Matrix ({filteredPermissions.length} permissions)
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {rolePermissions.length} roles
              </span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission
                </th>
                {rolePermissions.map(role => (
                  <th key={role.roleId} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                    <div className="flex flex-col items-center">
                      <span className="mb-1">{role.roleName}</span>
                      <span className="text-xs text-medsight-primary">
                        Level {role.roleHierarchy}
                      </span>
                      <span className="text-xs text-gray-400">
                        {getRolePermissionCount(role.roleId)} perms
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPermissions.map(permission => {
                const Icon = permission.icon;
                return (
                  <tr key={permission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: permission.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {permission.name}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelBg(permission.riskLevel)} ${getRiskLevelColor(permission.riskLevel)}`}>
                              {permission.riskLevel}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {permission.description}
                          </div>
                          {showDetails && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {permission.hipaaProtected && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  HIPAA
                                </span>
                              )}
                              {permission.requiresApproval && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                  Approval Required
                                </span>
                              )}
                              {permission.requiresSupervision && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                  Supervision Required
                                </span>
                              )}
                              {permission.emergencyOverride && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                  Emergency Override
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {rolePermissions.map(role => {
                      const status = getPermissionStatus(role.roleId, permission.id);
                      return (
                        <td key={role.roleId} className="px-3 py-4 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => togglePermission(role.roleId, permission.id)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                status?.granted
                                  ? 'bg-medsight-secondary text-white'
                                  : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                              }`}
                            >
                              {status?.granted ? (
                                <CheckCircleIcon className="w-4 h-4" />
                              ) : (
                                <XCircleIcon className="w-4 h-4" />
                              )}
                            </button>
                            {showDetails && status && (
                              <div className="flex flex-col items-center gap-1 text-xs">
                                {status.inherited && (
                                  <span className="text-blue-600">Inherited</span>
                                )}
                                {status.conditions && status.conditions.length > 0 && (
                                  <span className="text-orange-600">Conditional</span>
                                )}
                                {status.restrictedBy && status.restrictedBy.length > 0 && (
                                  <span className="text-red-600">Restricted</span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="medsight-glass p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="w-8 h-8 text-medsight-primary" />
            <div>
              <div className="text-2xl font-bold text-medsight-primary">
                {MEDICAL_PERMISSIONS.length}
              </div>
              <div className="text-sm text-gray-600">Total Permissions</div>
            </div>
          </div>
        </div>

        <div className="medsight-glass p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-8 h-8 text-medsight-critical" />
            <div>
              <div className="text-2xl font-bold text-medsight-critical">
                {MEDICAL_PERMISSIONS.filter(p => p.riskLevel === 'critical').length}
              </div>
              <div className="text-sm text-gray-600">Critical Risk</div>
            </div>
          </div>
        </div>

        <div className="medsight-glass p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <LockClosedIcon className="w-8 h-8 text-medsight-accent" />
            <div>
              <div className="text-2xl font-bold text-medsight-accent">
                {MEDICAL_PERMISSIONS.filter(p => p.hipaaProtected).length}
              </div>
              <div className="text-sm text-gray-600">HIPAA Protected</div>
            </div>
          </div>
        </div>

        <div className="medsight-glass p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <EyeIcon className="w-8 h-8 text-medsight-secondary" />
            <div>
              <div className="text-2xl font-bold text-medsight-secondary">
                {MEDICAL_PERMISSIONS.filter(p => p.requiresSupervision).length}
              </div>
              <div className="text-sm text-gray-600">Require Supervision</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 