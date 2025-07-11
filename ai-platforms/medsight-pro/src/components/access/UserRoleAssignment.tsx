'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserIcon,
  ShieldCheckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  UserGroupIcon,
  EyeIcon,
  CalendarIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  CheckIcon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  IdentificationIcon,
  GlobeAltIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

// User and Role Types
interface MedicalUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  medicalLicenseNumber: string;
  npiNumber: string;
  specializations: string[];
  department: string;
  organization: string;
  location: string;
  currentRoles: AssignedRole[];
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastLogin: Date;
  licenseExpiry: Date;
  employmentStatus: 'full_time' | 'part_time' | 'contract' | 'locum';
  profilePicture?: string;
  createdAt: Date;
  lastModified: Date;
}

interface AssignedRole {
  roleId: string;
  roleName: string;
  roleHierarchy: number;
  assignedAt: Date;
  assignedBy: string;
  expiresAt?: Date;
  isActive: boolean;
  isTemporary: boolean;
  conditions?: string[];
  approvedBy?: string;
  approvalRequired: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

interface RoleAssignmentHistory {
  id: string;
  userId: string;
  roleId: string;
  action: 'assigned' | 'removed' | 'modified';
  performedBy: string;
  performedAt: Date;
  reason: string;
  previousData?: any;
  newData?: any;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

interface Role {
  id: string;
  name: string;
  hierarchy: number;
  category: 'clinical' | 'administrative' | 'technical' | 'emergency';
  department?: string;
  description: string;
  requiresApproval: boolean;
  maxDuration?: number; // in days
  isActive: boolean;
}

// Mock data
const MOCK_USERS: MedicalUser[] = [
  {
    id: 'user-001',
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@medcenter.com',
    phone: '(555) 123-4567',
    medicalLicenseNumber: 'MD-12345',
    npiNumber: '1234567890',
    specializations: ['Radiology', 'Diagnostic Imaging'],
    department: 'Radiology',
    organization: 'Metro Medical Center',
    location: 'New York, NY',
    currentRoles: [
      {
        roleId: 'attending-radiologist',
        roleName: 'Attending Radiologist',
        roleHierarchy: 4,
        assignedAt: new Date('2024-01-15'),
        assignedBy: 'Dr. Michael Chen',
        isActive: true,
        isTemporary: false,
        approvedBy: 'Dr. Michael Chen',
        approvalRequired: false,
        approvalStatus: 'approved'
      }
    ],
    status: 'active',
    lastLogin: new Date('2024-01-20'),
    licenseExpiry: new Date('2025-12-31'),
    employmentStatus: 'full_time',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-15')
  },
  {
    id: 'user-002',
    firstName: 'Dr. Michael',
    lastName: 'Chen',
    email: 'michael.chen@medcenter.com',
    phone: '(555) 234-5678',
    medicalLicenseNumber: 'MD-67890',
    npiNumber: '0987654321',
    specializations: ['Radiology', 'Interventional Radiology'],
    department: 'Radiology',
    organization: 'Metro Medical Center',
    location: 'New York, NY',
    currentRoles: [
      {
        roleId: 'chief-radiology',
        roleName: 'Chief of Radiology',
        roleHierarchy: 7,
        assignedAt: new Date('2024-01-01'),
        assignedBy: 'System Admin',
        isActive: true,
        isTemporary: false,
        approvedBy: 'System Admin',
        approvalRequired: true,
        approvalStatus: 'approved'
      }
    ],
    status: 'active',
    lastLogin: new Date('2024-01-21'),
    licenseExpiry: new Date('2025-06-30'),
    employmentStatus: 'full_time',
    createdAt: new Date('2023-12-01'),
    lastModified: new Date('2024-01-01')
  },
  {
    id: 'user-003',
    firstName: 'Dr. Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@medcenter.com',
    phone: '(555) 345-6789',
    medicalLicenseNumber: 'MD-11111',
    npiNumber: '1111111111',
    specializations: ['Radiology'],
    department: 'Radiology',
    organization: 'Metro Medical Center',
    location: 'New York, NY',
    currentRoles: [
      {
        roleId: 'radiology-resident',
        roleName: 'Radiology Resident',
        roleHierarchy: 2,
        assignedAt: new Date('2024-01-10'),
        assignedBy: 'Dr. Michael Chen',
        isActive: true,
        isTemporary: true,
        expiresAt: new Date('2025-01-10'),
        approvedBy: 'Dr. Michael Chen',
        approvalRequired: false,
        approvalStatus: 'approved'
      }
    ],
    status: 'active',
    lastLogin: new Date('2024-01-19'),
    licenseExpiry: new Date('2025-03-31'),
    employmentStatus: 'full_time',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-10')
  },
  {
    id: 'user-004',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@medcenter.com',
    phone: '(555) 456-7890',
    medicalLicenseNumber: 'RT-22222',
    npiNumber: '2222222222',
    specializations: ['Radiology Technology'],
    department: 'Radiology',
    organization: 'Metro Medical Center',
    location: 'New York, NY',
    currentRoles: [
      {
        roleId: 'radiology-tech',
        roleName: 'Radiology Technician',
        roleHierarchy: 1,
        assignedAt: new Date('2024-01-05'),
        assignedBy: 'Dr. Michael Chen',
        isActive: true,
        isTemporary: false,
        approvedBy: 'Dr. Sarah Johnson',
        approvalRequired: false,
        approvalStatus: 'approved'
      }
    ],
    status: 'active',
    lastLogin: new Date('2024-01-18'),
    licenseExpiry: new Date('2025-09-30'),
    employmentStatus: 'part_time',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-05')
  },
  {
    id: 'user-005',
    firstName: 'Dr. Lisa',
    lastName: 'Wang',
    email: 'lisa.wang@medcenter.com',
    phone: '(555) 567-8901',
    medicalLicenseNumber: 'MD-33333',
    npiNumber: '3333333333',
    specializations: ['Cardiology'],
    department: 'Cardiology',
    organization: 'Metro Medical Center',
    location: 'New York, NY',
    currentRoles: [
      {
        roleId: 'attending-cardiologist',
        roleName: 'Attending Cardiologist',
        roleHierarchy: 4,
        assignedAt: new Date('2024-01-12'),
        assignedBy: 'Dr. Robert Kim',
        isActive: false,
        isTemporary: false,
        approvedBy: 'Dr. Robert Kim',
        approvalRequired: false,
        approvalStatus: 'pending'
      }
    ],
    status: 'pending',
    lastLogin: new Date('2024-01-16'),
    licenseExpiry: new Date('2025-11-30'),
    employmentStatus: 'full_time',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-12')
  }
];

const MOCK_ROLES: Role[] = [
  {
    id: 'chief-radiology',
    name: 'Chief of Radiology',
    hierarchy: 7,
    category: 'clinical',
    department: 'Radiology',
    description: 'Department head for radiology services',
    requiresApproval: true,
    isActive: true
  },
  {
    id: 'attending-radiologist',
    name: 'Attending Radiologist',
    hierarchy: 4,
    category: 'clinical',
    department: 'Radiology',
    description: 'Board-certified radiologist',
    requiresApproval: false,
    isActive: true
  },
  {
    id: 'radiology-resident',
    name: 'Radiology Resident',
    hierarchy: 2,
    category: 'clinical',
    department: 'Radiology',
    description: 'Radiology resident in training',
    requiresApproval: false,
    maxDuration: 365,
    isActive: true
  },
  {
    id: 'radiology-tech',
    name: 'Radiology Technician',
    hierarchy: 1,
    category: 'technical',
    department: 'Radiology',
    description: 'Radiology technician',
    requiresApproval: false,
    isActive: true
  },
  {
    id: 'system-admin',
    name: 'System Administrator',
    hierarchy: 8,
    category: 'administrative',
    description: 'System administrator with full access',
    requiresApproval: true,
    isActive: true
  }
];

export default function UserRoleAssignment() {
  const [users, setUsers] = useState<MedicalUser[]>(MOCK_USERS);
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);
  const [bulkAssignMode, setBulkAssignMode] = useState(false);
  const [assignmentReason, setAssignmentReason] = useState('');
  const [temporaryAssignment, setTemporaryAssignment] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.medicalLicenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    const matchesRole = filterRole === 'all' || user.currentRoles.some(role => role.roleId === filterRole);
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesRole;
  });

  const departments = Array.from(new Set(users.map(u => u.department)));

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'text-medsight-secondary';
      case 'pending': return 'text-medsight-accent';
      case 'suspended': return 'text-medsight-critical';
      case 'inactive': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBg = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-medsight-secondary/10';
      case 'pending': return 'bg-medsight-accent/10';
      case 'suspended': return 'bg-medsight-critical/10';
      case 'inactive': return 'bg-gray-100';
      default: return 'bg-gray-100';
    }
  };

  const getRoleHierarchyColor = (hierarchy: number): string => {
    if (hierarchy >= 7) return 'text-medsight-critical';
    if (hierarchy >= 4) return 'text-medsight-primary';
    if (hierarchy >= 2) return 'text-medsight-accent';
    return 'text-medsight-secondary';
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkRoleAssignment = () => {
    if (selectedUsers.length === 0 || !selectedRole) return;
    
    const role = roles.find(r => r.id === selectedRole);
    if (!role) return;

    const newAssignment: AssignedRole = {
      roleId: role.id,
      roleName: role.name,
      roleHierarchy: role.hierarchy,
      assignedAt: new Date(),
      assignedBy: 'Current User', // Replace with actual user
      isActive: true,
      isTemporary: temporaryAssignment,
      expiresAt: temporaryAssignment && expiryDate ? new Date(expiryDate) : undefined,
      approvalRequired: role.requiresApproval,
      approvalStatus: role.requiresApproval ? 'pending' : 'approved'
    };

    setUsers(prevUsers => 
      prevUsers.map(user => 
        selectedUsers.includes(user.id)
          ? { ...user, currentRoles: [...user.currentRoles, newAssignment] }
          : user
      )
    );

    setSelectedUsers([]);
    setSelectedRole('');
    setAssignmentReason('');
    setTemporaryAssignment(false);
    setExpiryDate('');
    setShowAssignModal(false);
  };

  const handleRemoveRole = (userId: string, roleId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId
          ? { ...user, currentRoles: user.currentRoles.filter(role => role.roleId !== roleId) }
          : user
      )
    );
  };

  const isLicenseExpiringSoon = (expiryDate: Date): boolean => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate < thirtyDaysFromNow;
  };

  const getUserFullName = (user: MedicalUser): string => {
    return `${user.firstName} ${user.lastName}`;
  };

  const getHighestRole = (user: MedicalUser): AssignedRole | null => {
    if (user.currentRoles.length === 0) return null;
    return user.currentRoles.reduce((highest, current) => 
      current.roleHierarchy > highest.roleHierarchy ? current : highest
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-medsight-primary mb-2">
              User Role Assignment
            </h2>
            <p className="text-gray-600">
              Assign and manage medical professional roles and permissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBulkAssignMode(!bulkAssignMode)}
              className={`btn-medsight ${bulkAssignMode ? 'bg-medsight-primary text-white' : ''}`}
            >
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Bulk Assign
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="btn-medsight flex items-center gap-2"
              disabled={selectedUsers.length === 0}
            >
              <PlusIcon className="w-4 h-4" />
              Assign Role
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-medsight pl-10 w-full"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-medsight"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="input-medsight"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="input-medsight"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="btn-medsight p-2">
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            <button className="btn-medsight p-2">
              <FunnelIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkAssignMode && (
        <div className="medsight-glass p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-medsight-primary">
                Bulk Assignment Mode
              </span>
              <span className="text-sm text-gray-600">
                {selectedUsers.length} users selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedUsers([])}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Selection
              </button>
              <button
                onClick={() => setBulkAssignMode(false)}
                className="text-sm text-medsight-primary hover:text-medsight-primary/80"
              >
                Exit Bulk Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="medsight-glass rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-medsight-primary">
            Medical Professionals ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {bulkAssignMode && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length}
                      onChange={(e) => 
                        setSelectedUsers(e.target.checked ? filteredUsers.map(u => u.id) : [])
                      }
                      className="rounded border-medsight-primary/20"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medical Professional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => {
                const highestRole = getHighestRole(user);
                const licenseExpiring = isLicenseExpiringSoon(user.licenseExpiry);
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    {bulkAssignMode && (
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                          className="rounded border-medsight-primary/20"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-medsight-primary/10 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-medsight-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getUserFullName(user)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <EnvelopeIcon className="w-3 h-3" />
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <IdentificationIcon className="w-3 h-3" />
                            {user.medicalLicenseNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {user.currentRoles.length > 0 ? (
                          user.currentRoles.map(role => (
                            <div key={role.roleId} className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-medsight-primary/10 ${getRoleHierarchyColor(role.roleHierarchy)}`}>
                                {role.roleName}
                              </span>
                              {role.isTemporary && (
                                <ClockIcon className="w-3 h-3 text-medsight-accent" />
                              )}
                              {role.approvalStatus === 'pending' && (
                                <ExclamationTriangleIcon className="w-3 h-3 text-medsight-accent" />
                              )}
                              <button
                                onClick={() => handleRemoveRole(user.id, role.roleId)}
                                className="text-medsight-critical hover:text-medsight-critical/80"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No roles assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <BuildingOfficeIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-900">{user.department}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.specializations.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(user.status)} ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Last login: {user.lastLogin.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.licenseExpiry.toLocaleDateString()}
                      </div>
                      {licenseExpiring && (
                        <div className="flex items-center gap-1 text-xs text-medsight-critical">
                          <ExclamationTriangleIcon className="w-3 h-3" />
                          Expires Soon
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowUserDetails(user.id)}
                          className="text-medsight-primary hover:text-medsight-primary/80"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUsers([user.id]);
                            setShowAssignModal(true);
                          }}
                          className="text-medsight-primary hover:text-medsight-primary/80"
                        >
                          <PlusIcon className="w-4 h-4" />
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

      {/* Role Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-medsight-primary">
                Assign Role to {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-medsight-primary/70 hover:text-medsight-primary"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-medsight-primary mb-2">
                  Select Role *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="input-medsight w-full"
                >
                  <option value="">Select a role...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} (Level {role.hierarchy})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-medsight-primary mb-2">
                  Assignment Reason *
                </label>
                <textarea
                  value={assignmentReason}
                  onChange={(e) => setAssignmentReason(e.target.value)}
                  className="input-medsight w-full h-20"
                  placeholder="Provide a reason for this role assignment..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="temporary"
                  checked={temporaryAssignment}
                  onChange={(e) => setTemporaryAssignment(e.target.checked)}
                  className="rounded border-medsight-primary/20"
                />
                <label htmlFor="temporary" className="text-sm text-medsight-primary">
                  Temporary Assignment
                </label>
              </div>

              {temporaryAssignment && (
                <div>
                  <label className="block text-sm font-medium text-medsight-primary mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="input-medsight w-full"
                  />
                </div>
              )}

              {selectedRole && roles.find(r => r.id === selectedRole)?.requiresApproval && (
                <div className="medsight-control-glass p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-medsight-accent">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Approval Required</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    This role requires approval from a supervisor before activation.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-medsight-primary/70 hover:text-medsight-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkRoleAssignment}
                className="btn-medsight"
                disabled={!selectedRole || !assignmentReason}
              >
                Assign Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="medsight-glass p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="w-8 h-8 text-medsight-primary" />
            <div>
              <div className="text-2xl font-bold text-medsight-primary">
                {users.length}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </div>
        </div>

        <div className="medsight-glass p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-8 h-8 text-medsight-secondary" />
            <div>
              <div className="text-2xl font-bold text-medsight-secondary">
                {users.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
          </div>
        </div>

        <div className="medsight-glass p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-8 h-8 text-medsight-accent" />
            <div>
              <div className="text-2xl font-bold text-medsight-accent">
                {users.filter(u => u.currentRoles.some(r => r.approvalStatus === 'pending')).length}
              </div>
              <div className="text-sm text-gray-600">Pending Approvals</div>
            </div>
          </div>
        </div>

        <div className="medsight-glass p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-8 h-8 text-medsight-critical" />
            <div>
              <div className="text-2xl font-bold text-medsight-critical">
                {users.filter(u => isLicenseExpiringSoon(u.licenseExpiry)).length}
              </div>
              <div className="text-sm text-gray-600">License Expiring</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 