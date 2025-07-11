'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserCheck, 
  UserX, 
  Shield, 
  Clock, 
  Mail, 
  Phone, 
  Award, 
  Building,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Key,
  Activity
} from 'lucide-react';

interface MedicalUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  medicalLicense: string;
  npiNumber: string;
  specialization: string[];
  department: string;
  role: string;
  roleTitle: string;
  hierarchy: number;
  hospitalAffiliation: string;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  sessionCount: number;
  emergencyAccess: boolean;
  complianceStatus: 'compliant' | 'warning' | 'non-compliant';
  licenseExpiry: Date;
  trainingStatus: 'current' | 'due' | 'overdue';
  profilePicture?: string;
}

interface UserListProps {
  onUserSelect?: (user: MedicalUser) => void;
  selectedUsers?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  showActions?: boolean;
  showFilters?: boolean;
  maxHeight?: string;
}

export default function UserList({ 
  onUserSelect, 
  selectedUsers = [], 
  onSelectionChange, 
  showActions = true, 
  showFilters = true,
  maxHeight = "600px"
}: UserListProps) {
  const [users, setUsers] = useState<MedicalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'department' | 'lastLogin'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MedicalUser | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/users/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Medical-Context': 'user-management',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Users loading error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      // Mock data for development
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockUsers: MedicalUser[] = [
      {
        id: 'user-001',
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@hospital.com',
        phone: '+1 (555) 123-4567',
        medicalLicense: 'MD-CA-12345',
        npiNumber: '1234567890',
        specialization: ['Radiology', 'Nuclear Medicine'],
        department: 'Radiology',
        role: 'radiologist',
        roleTitle: 'Senior Radiologist',
        hierarchy: 7,
        hospitalAffiliation: 'Metro General Hospital',
        isActive: true,
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        sessionCount: 342,
        emergencyAccess: false,
        complianceStatus: 'compliant',
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        trainingStatus: 'current'
      },
      {
        id: 'user-002',
        firstName: 'Michael',
        lastName: 'Rodriguez',
        email: 'michael.rodriguez@hospital.com',
        phone: '+1 (555) 234-5678',
        medicalLicense: 'MD-CA-23456',
        npiNumber: '2345678901',
        specialization: ['Emergency Medicine', 'Trauma'],
        department: 'Emergency Medicine',
        role: 'emergency-physician',
        roleTitle: 'Emergency Physician',
        hierarchy: 8,
        hospitalAffiliation: 'Metro General Hospital',
        isActive: true,
        lastLogin: new Date(Date.now() - 30 * 60 * 1000),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        sessionCount: 156,
        emergencyAccess: true,
        complianceStatus: 'compliant',
        licenseExpiry: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        trainingStatus: 'current'
      },
      {
        id: 'user-003',
        firstName: 'Emily',
        lastName: 'Johnson',
        email: 'emily.johnson@hospital.com',
        phone: '+1 (555) 345-6789',
        medicalLicense: 'MD-CA-34567',
        npiNumber: '3456789012',
        specialization: ['Internal Medicine'],
        department: 'Internal Medicine',
        role: 'resident',
        roleTitle: 'Medical Resident',
        hierarchy: 4,
        hospitalAffiliation: 'Metro General Hospital',
        isActive: true,
        lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        sessionCount: 89,
        emergencyAccess: false,
        complianceStatus: 'warning',
        licenseExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        trainingStatus: 'due'
      },
      {
        id: 'user-004',
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.kim@hospital.com',
        phone: '+1 (555) 456-7890',
        medicalLicense: 'MD-CA-45678',
        npiNumber: '4567890123',
        specialization: ['Cardiology', 'Interventional Cardiology'],
        department: 'Cardiology',
        role: 'attending-physician',
        roleTitle: 'Attending Cardiologist',
        hierarchy: 8,
        hospitalAffiliation: 'Metro General Hospital',
        isActive: false,
        lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        sessionCount: 234,
        emergencyAccess: false,
        complianceStatus: 'non-compliant',
        licenseExpiry: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        trainingStatus: 'overdue'
      },
      {
        id: 'user-005',
        firstName: 'Jessica',
        lastName: 'Williams',
        email: 'jessica.williams@hospital.com',
        phone: '+1 (555) 567-8901',
        medicalLicense: 'MD-CA-56789',
        npiNumber: '5678901234',
        specialization: ['Anesthesiology'],
        department: 'Anesthesiology',
        role: 'attending-physician',
        roleTitle: 'Chief of Anesthesiology',
        hierarchy: 9,
        hospitalAffiliation: 'Metro General Hospital',
        isActive: true,
        lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000),
        sessionCount: 567,
        emergencyAccess: true,
        complianceStatus: 'compliant',
        licenseExpiry: new Date(Date.now() + 500 * 24 * 60 * 60 * 1000),
        trainingStatus: 'current'
      }
    ];

    setUsers(mockUsers);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-medsight-normal';
      case 'warning': return 'text-medsight-pending';
      case 'non-compliant': return 'text-medsight-critical';
      default: return 'text-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4 text-medsight-normal" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-medsight-pending" />;
      case 'non-compliant': return <XCircle className="w-4 h-4 text-medsight-critical" />;
      default: return <CheckCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRoleColor = (hierarchy: number) => {
    if (hierarchy >= 8) return 'text-medsight-critical';
    if (hierarchy >= 6) return 'text-medsight-pending';
    if (hierarchy >= 4) return 'text-medsight-secondary';
    return 'text-medsight-normal';
  };

  const formatLastLogin = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.medicalLicense.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && user.isActive) ||
        (filterStatus === 'inactive' && !user.isActive);

      return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case 'role':
          aValue = a.roleTitle;
          bValue = b.roleTitle;
          break;
        case 'department':
          aValue = a.department;
          bValue = b.department;
          break;
        case 'lastLogin':
          aValue = a.lastLogin.getTime();
          bValue = b.lastLogin.getTime();
          break;
        default:
          aValue = a.firstName;
          bValue = b.firstName;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleUserSelect = (user: MedicalUser) => {
    setSelectedUser(user);
    onUserSelect?.(user);
  };

  const handleSelectionToggle = (userId: string) => {
    const newSelection = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];
    onSelectionChange?.(newSelection);
  };

  const handleSelectAll = () => {
    const allIds = filteredAndSortedUsers.map(user => user.id);
    onSelectionChange?.(selectedUsers.length === allIds.length ? [] : allIds);
  };

  if (loading) {
    return (
      <div className="medsight-glass p-8 rounded-xl">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-medsight-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-4 text-medsight-primary">Loading medical professionals...</span>
        </div>
      </div>
    );
  }

  if (error && !users.length) {
    return (
      <div className="medsight-glass p-8 rounded-xl border-medsight-critical/20">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-medsight-critical mx-auto mb-4" />
          <div className="text-lg font-medium text-medsight-critical mb-2">
            Error Loading Users
          </div>
          <div className="text-sm text-medsight-critical/70 mb-4">
            {error}
          </div>
          <button onClick={loadUsers} className="btn-medsight">
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {showFilters && (
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search medical professionals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-medsight pl-10 w-full"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="input-medsight min-w-[200px]"
            >
              <option value="all">All Roles</option>
              <option value="attending-physician">Attending Physician</option>
              <option value="radiologist">Radiologist</option>
              <option value="emergency-physician">Emergency Physician</option>
              <option value="resident">Resident</option>
              <option value="medical-admin">Medical Admin</option>
            </select>

            {/* Department Filter */}
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="input-medsight min-w-[200px]"
            >
              <option value="all">All Departments</option>
              <option value="Radiology">Radiology</option>
              <option value="Emergency Medicine">Emergency Medicine</option>
              <option value="Internal Medicine">Internal Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Anesthesiology">Anesthesiology</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-medsight min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-medsight text-sm"
              >
                <option value="name">Name</option>
                <option value="role">Role</option>
                <option value="department">Department</option>
                <option value="lastLogin">Last Login</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="btn-medsight text-sm"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
            <div className="text-sm text-slate-600">
              {filteredAndSortedUsers.length} of {users.length} users
            </div>
          </div>
        </div>
      )}

      {/* User List */}
      <div className="medsight-glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight }}>
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {onSelectionChange && (
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                  </th>
                )}
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Professional</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Role & Department</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Credentials</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Last Activity</th>
                {showActions && (
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAndSortedUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => handleUserSelect(user)}
                >
                  {onSelectionChange && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectionToggle(user.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-slate-300 text-medsight-primary"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-medsight-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-medsight-primary font-medium">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-slate-600">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className={`font-medium ${getRoleColor(user.hierarchy)}`}>
                        {user.roleTitle}
                      </div>
                      <div className="text-sm text-slate-600">{user.department}</div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-slate-500">Level {user.hierarchy}</div>
                        {user.emergencyAccess && (
                          <div className="px-2 py-1 rounded-full text-xs bg-medsight-critical/10 text-medsight-critical">
                            Emergency Access
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-900">{user.medicalLicense}</div>
                      <div className="text-sm text-slate-600">NPI: {user.npiNumber}</div>
                      <div className="text-xs text-slate-500">
                        {user.specialization.join(', ')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {user.isActive ? (
                          <UserCheck className="w-4 h-4 text-medsight-normal" />
                        ) : (
                          <UserX className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-sm font-medium">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(user.complianceStatus)}
                        <span className={`text-sm ${getStatusColor(user.complianceStatus)}`}>
                          {user.complianceStatus}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm text-slate-900">{formatLastLogin(user.lastLogin)}</div>
                      <div className="text-xs text-slate-500">{user.sessionCount} sessions</div>
                    </div>
                  </td>
                  {showActions && (
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            // setShowUserModal(true); // This state is not defined in the new code
                          }}
                          className="p-2 text-slate-400 hover:text-medsight-primary rounded-lg hover:bg-medsight-primary/10"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle edit user
                          }}
                          className="p-2 text-slate-400 hover:text-medsight-secondary rounded-lg hover:bg-medsight-secondary/10"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle assign role
                          }}
                          className="p-2 text-slate-400 hover:text-medsight-pending rounded-lg hover:bg-medsight-pending/10"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredAndSortedUsers.length === 0 && (
        <div className="medsight-glass p-8 rounded-xl text-center">
          <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <div className="text-lg font-medium text-slate-600 mb-2">
            No medical professionals found
          </div>
          <div className="text-sm text-slate-500">
            Try adjusting your search criteria or filters
          </div>
        </div>
      )}
    </div>
  );
} 