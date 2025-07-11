'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  BuildingOfficeIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon,
  HeartIcon,
  BeakerIcon,
  CpuChipIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// Medical Role Types
interface MedicalRole {
  id: string;
  name: string;
  category: 'clinical' | 'administrative' | 'technical' | 'emergency';
  hierarchy: number; // 1-10 scale, 10 being highest
  department?: string;
  permissions: string[];
  description: string;
  requirements: string[];
  isActive: boolean;
  isEmergencyAccess: boolean;
  supervisorRequired: boolean;
  auditLevel: 'standard' | 'enhanced' | 'maximum';
  createdAt: Date;
  lastModified: Date;
}

interface RoleHierarchy {
  level: number;
  title: string;
  description: string;
  departments: string[];
  minYearsExperience: number;
  requiresSupervision: boolean;
}

interface Department {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  specializations: string[];
  chiefRole?: string;
  attendingRoles?: string[];
  residentRoles?: string[];
}

// Medical Role Hierarchy Definition
const MEDICAL_HIERARCHY: RoleHierarchy[] = [
  {
    level: 1,
    title: 'Medical Student',
    description: 'Medical students in clinical rotations',
    departments: ['All'],
    minYearsExperience: 0,
    requiresSupervision: true
  },
  {
    level: 2,
    title: 'Resident',
    description: 'Medical residents in training',
    departments: ['All'],
    minYearsExperience: 0,
    requiresSupervision: true
  },
  {
    level: 3,
    title: 'Fellow',
    description: 'Fellowship-trained specialists',
    departments: ['Radiology', 'Cardiology', 'Oncology', 'Neurology'],
    minYearsExperience: 3,
    requiresSupervision: false
  },
  {
    level: 4,
    title: 'Attending Physician',
    description: 'Board-certified attending physicians',
    departments: ['All'],
    minYearsExperience: 3,
    requiresSupervision: false
  },
  {
    level: 5,
    title: 'Senior Attending',
    description: 'Senior attending physicians with supervisory responsibilities',
    departments: ['All'],
    minYearsExperience: 5,
    requiresSupervision: false
  },
  {
    level: 6,
    title: 'Section Chief',
    description: 'Section chiefs and department leaders',
    departments: ['All'],
    minYearsExperience: 7,
    requiresSupervision: false
  },
  {
    level: 7,
    title: 'Department Chair',
    description: 'Department chairs and directors',
    departments: ['All'],
    minYearsExperience: 10,
    requiresSupervision: false
  },
  {
    level: 8,
    title: 'Chief Medical Officer',
    description: 'Chief Medical Officers and VP Medical Affairs',
    departments: ['Administration'],
    minYearsExperience: 15,
    requiresSupervision: false
  }
];

// Medical Departments
const MEDICAL_DEPARTMENTS: Department[] = [
  {
    id: 'radiology',
    name: 'Radiology',
    icon: CpuChipIcon,
    color: '#0ea5e9',
    specializations: ['Diagnostic Radiology', 'Interventional Radiology', 'Nuclear Medicine', 'Neuroradiology'],
    chiefRole: 'Chief of Radiology',
    attendingRoles: ['Radiologist', 'Interventional Radiologist', 'Nuclear Medicine Physician'],
    residentRoles: ['Radiology Resident', 'Nuclear Medicine Resident']
  },
  {
    id: 'cardiology',
    name: 'Cardiology',
    icon: HeartIcon,
    color: '#ef4444',
    specializations: ['Interventional Cardiology', 'Electrophysiology', 'Heart Failure', 'Preventive Cardiology'],
    chiefRole: 'Chief of Cardiology',
    attendingRoles: ['Cardiologist', 'Interventional Cardiologist', 'Electrophysiologist'],
    residentRoles: ['Cardiology Fellow', 'EP Fellow']
  },
  {
    id: 'oncology',
    name: 'Oncology',
    icon: BeakerIcon,
    color: '#7c3aed',
    specializations: ['Medical Oncology', 'Radiation Oncology', 'Surgical Oncology', 'Hematology'],
    chiefRole: 'Chief of Oncology',
    attendingRoles: ['Medical Oncologist', 'Radiation Oncologist', 'Hematologist'],
    residentRoles: ['Oncology Fellow', 'Hematology Fellow']
  },
  {
    id: 'neurology',
    name: 'Neurology',
    icon: CpuChipIcon,
    color: '#059669',
    specializations: ['Neurology', 'Neurosurgery', 'Neurointensive Care', 'Neuroradiology'],
    chiefRole: 'Chief of Neurology',
    attendingRoles: ['Neurologist', 'Neurosurgeon', 'Neurointensivist'],
    residentRoles: ['Neurology Resident', 'Neurosurgery Resident']
  },
  {
    id: 'emergency',
    name: 'Emergency Medicine',
    icon: ExclamationTriangleIcon,
    color: '#dc2626',
    specializations: ['Emergency Medicine', 'Trauma', 'Critical Care', 'Toxicology'],
    chiefRole: 'Chief of Emergency Medicine',
    attendingRoles: ['Emergency Physician', 'Trauma Surgeon', 'Critical Care Physician'],
    residentRoles: ['Emergency Medicine Resident', 'Trauma Surgery Resident']
  },
  {
    id: 'administration',
    name: 'Administration',
    icon: BuildingOfficeIcon,
    color: '#f59e0b',
    specializations: ['Medical Administration', 'Quality', 'Compliance', 'IT'],
    chiefRole: 'Chief Medical Officer',
    attendingRoles: ['Medical Director', 'Quality Director', 'Compliance Officer'],
    residentRoles: []
  }
];

// Mock data for existing roles
const MOCK_ROLES: MedicalRole[] = [
  {
    id: 'chief-radiology',
    name: 'Chief of Radiology',
    category: 'clinical',
    hierarchy: 7,
    department: 'Radiology',
    permissions: ['read_all_studies', 'write_all_studies', 'admin_department', 'supervise_residents'],
    description: 'Department head for radiology services',
    requirements: ['Board certification in Radiology', '10+ years experience', 'Administrative training'],
    isActive: true,
    isEmergencyAccess: false,
    supervisorRequired: false,
    auditLevel: 'enhanced',
    createdAt: new Date('2024-01-15'),
    lastModified: new Date('2024-01-15')
  },
  {
    id: 'attending-radiologist',
    name: 'Attending Radiologist',
    category: 'clinical',
    hierarchy: 4,
    department: 'Radiology',
    permissions: ['read_assigned_studies', 'write_reports', 'supervise_residents'],
    description: 'Board-certified radiologist',
    requirements: ['Board certification in Radiology', '3+ years experience'],
    isActive: true,
    isEmergencyAccess: false,
    supervisorRequired: false,
    auditLevel: 'standard',
    createdAt: new Date('2024-01-15'),
    lastModified: new Date('2024-01-15')
  },
  {
    id: 'radiology-resident',
    name: 'Radiology Resident',
    category: 'clinical',
    hierarchy: 2,
    department: 'Radiology',
    permissions: ['read_assigned_studies', 'write_preliminary_reports'],
    description: 'Radiology resident in training',
    requirements: ['Medical degree', 'Radiology residency enrollment'],
    isActive: true,
    isEmergencyAccess: false,
    supervisorRequired: true,
    auditLevel: 'enhanced',
    createdAt: new Date('2024-01-15'),
    lastModified: new Date('2024-01-15')
  },
  {
    id: 'emergency-access',
    name: 'Emergency Access',
    category: 'emergency',
    hierarchy: 6,
    permissions: ['read_all_studies', 'emergency_override'],
    description: 'Emergency access for critical cases',
    requirements: ['Active medical license', 'Emergency authorization'],
    isActive: true,
    isEmergencyAccess: true,
    supervisorRequired: true,
    auditLevel: 'maximum',
    createdAt: new Date('2024-01-15'),
    lastModified: new Date('2024-01-15')
  },
  {
    id: 'system-admin',
    name: 'System Administrator',
    category: 'administrative',
    hierarchy: 8,
    department: 'Administration',
    permissions: ['admin_all', 'user_management', 'system_config'],
    description: 'System administrator with full access',
    requirements: ['IT certification', 'Medical informatics training'],
    isActive: true,
    isEmergencyAccess: false,
    supervisorRequired: false,
    auditLevel: 'maximum',
    createdAt: new Date('2024-01-15'),
    lastModified: new Date('2024-01-15')
  }
];

export default function RoleManagement() {
  const [roles, setRoles] = useState<MedicalRole[]>(MOCK_ROLES);
  const [selectedRole, setSelectedRole] = useState<MedicalRole | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterHierarchy, setFilterHierarchy] = useState<string>('all');

  // Filter roles based on search and filters
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || role.category === filterCategory;
    const matchesDepartment = filterDepartment === 'all' || role.department === filterDepartment;
    const matchesHierarchy = filterHierarchy === 'all' || role.hierarchy.toString() === filterHierarchy;
    
    return matchesSearch && matchesCategory && matchesDepartment && matchesHierarchy;
  });

  const getRoleHierarchyName = (level: number): string => {
    const hierarchy = MEDICAL_HIERARCHY.find(h => h.level === level);
    return hierarchy ? hierarchy.title : `Level ${level}`;
  };

  const getRoleCategoryColor = (category: string): string => {
    switch (category) {
      case 'clinical': return 'text-medsight-primary';
      case 'administrative': return 'text-medsight-accent';
      case 'technical': return 'text-medsight-secondary';
      case 'emergency': return 'text-medsight-critical';
      default: return 'text-gray-500';
    }
  };

  const getDepartmentIcon = (department: string) => {
    const dept = MEDICAL_DEPARTMENTS.find(d => d.name === department);
    return dept ? dept.icon : UserIcon;
  };

  const handleCreateRole = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditRole = (role: MedicalRole) => {
    setSelectedRole(role);
    setIsEditModalOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      setRoles(roles.filter(role => role.id !== roleId));
    }
  };

  const handleToggleRoleStatus = (roleId: string) => {
    setRoles(roles.map(role => 
      role.id === roleId ? { ...role, isActive: !role.isActive } : role
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-medsight-primary mb-2">
              Medical Role Management
            </h2>
            <p className="text-gray-600">
              Manage medical professional roles, permissions, and hierarchies
            </p>
          </div>
          <button
            onClick={handleCreateRole}
            className="btn-medsight flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Create New Role
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-medsight pl-10 w-full"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-medsight"
          >
            <option value="all">All Categories</option>
            <option value="clinical">Clinical</option>
            <option value="administrative">Administrative</option>
            <option value="technical">Technical</option>
            <option value="emergency">Emergency</option>
          </select>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="input-medsight"
          >
            <option value="all">All Departments</option>
            {MEDICAL_DEPARTMENTS.map(dept => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>

          {/* Hierarchy Filter */}
          <select
            value={filterHierarchy}
            onChange={(e) => setFilterHierarchy(e.target.value)}
            className="input-medsight"
          >
            <option value="all">All Levels</option>
            {MEDICAL_HIERARCHY.map(level => (
              <option key={level.level} value={level.level.toString()}>
                {level.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Role Hierarchy Overview */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">
          Medical Role Hierarchy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MEDICAL_HIERARCHY.slice().reverse().map(level => (
            <div key={level.level} className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Level {level.level}</span>
                <AcademicCapIcon className="w-4 h-4 text-medsight-primary" />
              </div>
              <h4 className="font-semibold text-medsight-primary mb-1">
                {level.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {level.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{level.minYearsExperience}+ years</span>
                {level.requiresSupervision && (
                  <span className="text-medsight-accent">Supervised</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Departments */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">
          Medical Departments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MEDICAL_DEPARTMENTS.map(dept => {
            const Icon = dept.icon;
            return (
              <div key={dept.id} className="medsight-control-glass p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5" style={{ color: dept.color }} />
                  <h4 className="font-semibold text-medsight-primary">
                    {dept.name}
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Chief:</span> {dept.chiefRole}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Specializations:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dept.specializations.map(spec => (
                        <span key={spec} className="px-2 py-1 bg-medsight-primary/10 text-medsight-primary rounded text-xs">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roles Table */}
      <div className="medsight-glass rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-medsight-primary">
            Medical Roles ({filteredRoles.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hierarchy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles.map(role => {
                const DeptIcon = getDepartmentIcon(role.department || '');
                return (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <DeptIcon className="w-5 h-5 text-medsight-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {role.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {role.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getRoleCategoryColor(role.category)}`}>
                        {role.category}
                      </span>
                      {role.isEmergencyAccess && (
                        <div className="flex items-center gap-1 mt-1">
                          <ExclamationTriangleIcon className="w-3 h-3 text-medsight-critical" />
                          <span className="text-xs text-medsight-critical">Emergency</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {role.department || 'All Departments'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-medsight-primary">
                          {role.hierarchy}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getRoleHierarchyName(role.hierarchy)}
                        </span>
                      </div>
                      {role.supervisorRequired && (
                        <div className="flex items-center gap-1 mt-1">
                          <EyeIcon className="w-3 h-3 text-medsight-accent" />
                          <span className="text-xs text-medsight-accent">Supervised</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleRoleStatus(role.id)}
                          className="flex items-center gap-1"
                        >
                          {role.isActive ? (
                            <CheckCircleIcon className="w-4 h-4 text-medsight-secondary" />
                          ) : (
                            <XCircleIcon className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={`text-sm ${role.isActive ? 'text-medsight-secondary' : 'text-gray-400'}`}>
                            {role.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="text-medsight-primary hover:text-medsight-primary/80"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-medsight-critical hover:text-medsight-critical/80"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="medsight-glass p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="w-8 h-8 text-medsight-primary" />
            <div>
              <div className="text-2xl font-bold text-medsight-primary">
                {roles.length}
              </div>
              <div className="text-sm text-gray-600">Total Roles</div>
            </div>
          </div>
        </div>

        <div className="medsight-glass p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-8 h-8 text-medsight-secondary" />
            <div>
              <div className="text-2xl font-bold text-medsight-secondary">
                {roles.filter(r => r.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Roles</div>
            </div>
          </div>
        </div>

        <div className="medsight-glass p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-8 h-8 text-medsight-critical" />
            <div>
              <div className="text-2xl font-bold text-medsight-critical">
                {roles.filter(r => r.isEmergencyAccess).length}
              </div>
              <div className="text-sm text-gray-600">Emergency Access</div>
            </div>
          </div>
        </div>

        <div className="medsight-glass p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <EyeIcon className="w-8 h-8 text-medsight-accent" />
            <div>
              <div className="text-2xl font-bold text-medsight-accent">
                {roles.filter(r => r.supervisorRequired).length}
              </div>
              <div className="text-sm text-gray-600">Supervised</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 