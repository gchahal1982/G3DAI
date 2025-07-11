'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserIcon,
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CogIcon,
  InformationCircleIcon,
  BellIcon,
  KeyIcon,
  XMarkIcon,
  StarIcon,
  GlobeAltIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

// Types
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
  roles: string[];
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'pending_verification';
  lastLogin: Date;
  licenseExpiry: Date;
  employmentStatus: 'full_time' | 'part_time' | 'contract' | 'locum' | 'resident';
  profilePicture?: string;
  createdAt: Date;
  lastModified: Date;
  ipaaCompliance: boolean;
  mfaEnabled: boolean;
  loginCount: number;
  lastPasswordChange: Date;
  accountLocked: boolean;
  notes: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface UserActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  details: string;
  ipAddress: string;
  userAgent: string;
}

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  licensesExpiring: number;
  newUsersThisWeek: number;
  loginToday: number;
  mfaEnabled: number;
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
    roles: ['Attending Radiologist'],
    status: 'active',
    lastLogin: new Date('2024-01-20T10:30:00'),
    licenseExpiry: new Date('2025-12-31'),
    employmentStatus: 'full_time',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-15'),
    ipaaCompliance: true,
    mfaEnabled: true,
    loginCount: 145,
    lastPasswordChange: new Date('2024-01-01'),
    accountLocked: false,
    notes: 'Senior attending radiologist with excellent performance record.',
    emergencyContact: {
      name: 'John Johnson',
      phone: '(555) 123-4568',
      relationship: 'Spouse'
    }
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
    roles: ['Chief of Radiology'],
    status: 'active',
    lastLogin: new Date('2024-01-21T09:15:00'),
    licenseExpiry: new Date('2025-06-30'),
    employmentStatus: 'full_time',
    createdAt: new Date('2023-12-01'),
    lastModified: new Date('2024-01-01'),
    ipaaCompliance: true,
    mfaEnabled: true,
    loginCount: 298,
    lastPasswordChange: new Date('2023-12-01'),
    accountLocked: false,
    notes: 'Department chief with administrative responsibilities.'
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
    roles: ['Radiology Resident'],
    status: 'active',
    lastLogin: new Date('2024-01-19T14:20:00'),
    licenseExpiry: new Date('2025-03-31'),
    employmentStatus: 'resident',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-10'),
    ipaaCompliance: true,
    mfaEnabled: false,
    loginCount: 89,
    lastPasswordChange: new Date('2024-01-01'),
    accountLocked: false,
    notes: 'First year radiology resident, progressing well.'
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
    roles: ['Radiology Technician'],
    status: 'active',
    lastLogin: new Date('2024-01-18T16:45:00'),
    licenseExpiry: new Date('2025-09-30'),
    employmentStatus: 'part_time',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-05'),
    ipaaCompliance: true,
    mfaEnabled: true,
    loginCount: 67,
    lastPasswordChange: new Date('2024-01-01'),
    accountLocked: false,
    notes: 'Part-time technician, very reliable.'
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
    roles: ['Attending Cardiologist'],
    status: 'pending_verification',
    lastLogin: new Date('2024-01-16T11:30:00'),
    licenseExpiry: new Date('2025-11-30'),
    employmentStatus: 'full_time',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-12'),
    ipaaCompliance: false,
    mfaEnabled: false,
    loginCount: 12,
    lastPasswordChange: new Date('2024-01-01'),
    accountLocked: false,
    notes: 'New hire, pending license verification.'
  },
  {
    id: 'user-006',
    firstName: 'Dr. Robert',
    lastName: 'Kim',
    email: 'robert.kim@medcenter.com',
    phone: '(555) 678-9012',
    medicalLicenseNumber: 'MD-44444',
    npiNumber: '4444444444',
    specializations: ['Emergency Medicine'],
    department: 'Emergency',
    organization: 'Metro Medical Center',
    location: 'New York, NY',
    roles: ['Emergency Physician'],
    status: 'suspended',
    lastLogin: new Date('2024-01-10T08:15:00'),
    licenseExpiry: new Date('2024-02-15'),
    employmentStatus: 'full_time',
    createdAt: new Date('2023-11-01'),
    lastModified: new Date('2024-01-10'),
    ipaaCompliance: true,
    mfaEnabled: true,
    loginCount: 234,
    lastPasswordChange: new Date('2023-11-01'),
    accountLocked: true,
    notes: 'Account suspended due to license expiry.'
  }
];

const MOCK_METRICS: UserMetrics = {
  totalUsers: 156,
  activeUsers: 142,
  pendingUsers: 8,
  suspendedUsers: 6,
  licensesExpiring: 12,
  newUsersThisWeek: 3,
  loginToday: 89,
  mfaEnabled: 134
};

export default function UserManagementDashboard() {
  const [users, setUsers] = useState<MedicalUser[]>(MOCK_USERS);
  const [metrics, setMetrics] = useState<UserMetrics>(MOCK_METRICS);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterEmployment, setFilterEmployment] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [selectedBulkAction, setSelectedBulkAction] = useState('');
  const [sortBy, setSortBy] = useState<string>('lastName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.medicalLicenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.npiNumber.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    const matchesEmployment = filterEmployment === 'all' || user.employmentStatus === filterEmployment;
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesEmployment;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'lastName':
        aValue = a.lastName.toLowerCase();
        bValue = b.lastName.toLowerCase();
        break;
      case 'email':
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
        break;
      case 'department':
        aValue = a.department.toLowerCase();
        bValue = b.department.toLowerCase();
        break;
      case 'lastLogin':
        aValue = a.lastLogin.getTime();
        bValue = b.lastLogin.getTime();
        break;
      case 'licenseExpiry':
        aValue = a.licenseExpiry.getTime();
        bValue = b.licenseExpiry.getTime();
        break;
      default:
        aValue = a.lastName.toLowerCase();
        bValue = b.lastName.toLowerCase();
    }
    
    if (typeof aValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const departments = Array.from(new Set(users.map(u => u.department)));

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'text-medsight-secondary';
      case 'pending': return 'text-medsight-accent';
      case 'pending_verification': return 'text-medsight-accent';
      case 'suspended': return 'text-medsight-critical';
      case 'inactive': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBg = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-medsight-secondary/10';
      case 'pending': return 'bg-medsight-accent/10';
      case 'pending_verification': return 'bg-medsight-accent/10';
      case 'suspended': return 'bg-medsight-critical/10';
      case 'inactive': return 'bg-gray-100';
      default: return 'bg-gray-100';
    }
  };

  const isLicenseExpiringSoon = (expiryDate: Date): boolean => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate < thirtyDaysFromNow;
  };

  const getUserFullName = (user: MedicalUser): string => {
    return `${user.firstName} ${user.lastName}`;
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = () => {
    if (selectedUsers.length === 0 || !selectedBulkAction) return;
    
    switch (selectedBulkAction) {
      case 'activate':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'active' as const } : user
        ));
        break;
      case 'suspend':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'suspended' as const } : user
        ));
        break;
      case 'enable_mfa':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.id) ? { ...user, mfaEnabled: true } : user
        ));
        break;
      case 'reset_password':
        // Would trigger password reset emails
        console.log('Password reset triggered for users:', selectedUsers);
        break;
    }
    
    setSelectedUsers([]);
    setSelectedBulkAction('');
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' as const }
        : user
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-medsight-primary mb-2">
              User Management Dashboard
            </h1>
            <p className="text-gray-600">
              Manage medical professional accounts, credentials, and system access
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBulkActionMode(!bulkActionMode)}
              className={`btn-medsight ${bulkActionMode ? 'bg-medsight-primary text-white' : ''}`}
            >
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Bulk Actions
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-medsight flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Create User
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="w-10 h-10 text-medsight-primary" />
            <div>
              <div className="text-2xl font-bold text-medsight-primary">
                {metrics.totalUsers}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-10 h-10 text-medsight-secondary" />
            <div>
              <div className="text-2xl font-bold text-medsight-secondary">
                {metrics.activeUsers}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-10 h-10 text-medsight-accent" />
            <div>
              <div className="text-2xl font-bold text-medsight-accent">
                {metrics.pendingUsers}
              </div>
              <div className="text-sm text-gray-600">Pending Users</div>
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-10 h-10 text-medsight-critical" />
            <div>
              <div className="text-2xl font-bold text-medsight-critical">
                {metrics.licensesExpiring}
              </div>
              <div className="text-sm text-gray-600">Licenses Expiring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-medsight-primary">
                {metrics.newUsersThisWeek}
              </div>
              <div className="text-sm text-gray-600">New This Week</div>
            </div>
            <StarIcon className="w-6 h-6 text-medsight-accent" />
          </div>
        </div>

        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-medsight-primary">
                {metrics.loginToday}
              </div>
              <div className="text-sm text-gray-600">Logins Today</div>
            </div>
            <GlobeAltIcon className="w-6 h-6 text-medsight-secondary" />
          </div>
        </div>

        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-medsight-primary">
                {metrics.mfaEnabled}
              </div>
              <div className="text-sm text-gray-600">MFA Enabled</div>
            </div>
            <ShieldCheckIcon className="w-6 h-6 text-medsight-secondary" />
          </div>
        </div>

        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-medsight-primary">
                {metrics.suspendedUsers}
              </div>
              <div className="text-sm text-gray-600">Suspended</div>
            </div>
            <XCircleIcon className="w-6 h-6 text-medsight-critical" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
          {/* Search */}
          <div className="relative md:col-span-2">
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
            <option value="pending_verification">Pending Verification</option>
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

          {/* Employment Filter */}
          <select
            value={filterEmployment}
            onChange={(e) => setFilterEmployment(e.target.value)}
            className="input-medsight"
          >
            <option value="all">All Employment</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="locum">Locum</option>
            <option value="resident">Resident</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="input-medsight"
          >
            <option value="lastName-asc">Name (A-Z)</option>
            <option value="lastName-desc">Name (Z-A)</option>
            <option value="email-asc">Email (A-Z)</option>
            <option value="department-asc">Department (A-Z)</option>
            <option value="lastLogin-desc">Last Login (Recent)</option>
            <option value="licenseExpiry-asc">License Expiry (Soon)</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {bulkActionMode && selectedUsers.length > 0 && (
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-medsight-primary">
                {selectedUsers.length} users selected
              </span>
              <select
                value={selectedBulkAction}
                onChange={(e) => setSelectedBulkAction(e.target.value)}
                className="input-medsight"
              >
                <option value="">Select Action...</option>
                <option value="activate">Activate Users</option>
                <option value="suspend">Suspend Users</option>
                <option value="enable_mfa">Enable MFA</option>
                <option value="reset_password">Reset Passwords</option>
              </select>
              <button
                onClick={handleBulkAction}
                className="btn-medsight"
                disabled={!selectedBulkAction}
              >
                Execute Action
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="medsight-glass rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-medsight-primary">
            Medical Professionals ({sortedUsers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {bulkActionMode && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === sortedUsers.length && sortedUsers.length > 0}
                      onChange={(e) => 
                        setSelectedUsers(e.target.checked ? sortedUsers.map(u => u.id) : [])
                      }
                      className="rounded border-medsight-primary/20"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medical Professional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact & Credentials
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department & Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Security
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity & License
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUsers.map(user => {
                const licenseExpiring = isLicenseExpiringSoon(user.licenseExpiry);
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    {bulkActionMode && (
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
                        <div className="flex-shrink-0 w-12 h-12 bg-medsight-primary/10 rounded-full flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-medsight-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getUserFullName(user)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.employmentStatus.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {user.id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <EnvelopeIcon className="w-3 h-3 text-gray-400" />
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <PhoneIcon className="w-3 h-3 text-gray-400" />
                          {user.phone}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <IdentificationIcon className="w-3 h-3 text-gray-400" />
                          {user.medicalLicenseNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <BuildingOfficeIcon className="w-3 h-3 text-gray-400" />
                          {user.department}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.roles.join(', ')}
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.specializations.join(', ')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(user.status)} ${getStatusColor(user.status)}`}>
                          {user.status.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          {user.mfaEnabled ? (
                            <ShieldCheckIcon className="w-4 h-4 text-medsight-secondary" title="MFA Enabled" />
                          ) : (
                            <ShieldCheckIcon className="w-4 h-4 text-gray-300" title="MFA Disabled" />
                          )}
                          {user.ipaaCompliance ? (
                            <ClipboardDocumentCheckIcon className="w-4 h-4 text-medsight-secondary" title="HIPAA Compliant" />
                          ) : (
                            <ClipboardDocumentCheckIcon className="w-4 h-4 text-medsight-critical" title="HIPAA Non-compliant" />
                          )}
                          {user.accountLocked && (
                            <XCircleIcon className="w-4 h-4 text-medsight-critical" title="Account Locked" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          Last: {user.lastLogin.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Logins: {user.loginCount}
                        </div>
                        <div className={`text-sm ${licenseExpiring ? 'text-medsight-critical' : 'text-gray-500'}`}>
                          License: {user.licenseExpiry.toLocaleDateString()}
                          {licenseExpiring && (
                            <ExclamationTriangleIcon className="w-3 h-3 inline ml-1" />
                          )}
                        </div>
                      </div>
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
                          className="text-medsight-primary hover:text-medsight-primary/80"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={user.status === 'active' ? 'text-medsight-critical hover:text-medsight-critical/80' : 'text-medsight-secondary hover:text-medsight-secondary/80'}
                        >
                          {user.status === 'active' ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
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

      {/* Quick Actions Panel */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="medsight-control-glass p-4 rounded-lg text-left hover:bg-medsight-primary/5 transition-colors">
            <div className="flex items-center gap-3">
              <BellIcon className="w-6 h-6 text-medsight-accent" />
              <div>
                <div className="font-medium text-gray-900">Send Notifications</div>
                <div className="text-sm text-gray-600">Notify users about system updates</div>
              </div>
            </div>
          </button>
          
          <button className="medsight-control-glass p-4 rounded-lg text-left hover:bg-medsight-primary/5 transition-colors">
            <div className="flex items-center gap-3">
              <KeyIcon className="w-6 h-6 text-medsight-critical" />
              <div>
                <div className="font-medium text-gray-900">Password Reset</div>
                <div className="text-sm text-gray-600">Force password reset for users</div>
              </div>
            </div>
          </button>
          
          <button className="medsight-control-glass p-4 rounded-lg text-left hover:bg-medsight-primary/5 transition-colors">
            <div className="flex items-center gap-3">
              <DocumentTextIcon className="w-6 h-6 text-medsight-secondary" />
              <div>
                <div className="font-medium text-gray-900">Export Users</div>
                <div className="text-sm text-gray-600">Download user list as CSV</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
} 