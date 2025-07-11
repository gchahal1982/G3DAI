'use client';

import React, { useState, useEffect } from 'react';
import { 
  UsersIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'radiologist' | 'technician' | 'nurse' | 'physician' | 'student';
  department: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'locked';
  lastLogin?: Date;
  loginCount: number;
  createdAt: Date;
  modifiedAt?: Date;
  permissions: string[];
  medicalLicense?: {
    number: string;
    state: string;
    expirationDate: Date;
    verified: boolean;
  };
  compliance: {
    hipaaTraining: boolean;
    hipaaTrainingDate?: Date;
    backgroundCheck: boolean;
    backgroundCheckDate?: Date;
    credentialsVerified: boolean;
    credentialsVerifiedDate?: Date;
  };
  sessions: {
    current: number;
    maxAllowed: number;
    devices: string[];
    lastIP?: string;
  };
  activity: {
    studiesViewed: number;
    reportsGenerated: number;
    aiAnalysesRequested: number;
    collaborations: number;
    lastActivity?: Date;
  };
  preferences: {
    emailNotifications: boolean;
    systemAlerts: boolean;
    securityAlerts: boolean;
    maintenanceAlerts: boolean;
  };
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'lastLogin' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<string>('');

  // Mock data
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        role: 'radiologist',
        department: 'Radiology',
        status: 'active',
        lastLogin: new Date(Date.now() - 1000 * 60 * 30),
        loginCount: 1247,
        createdAt: new Date('2023-01-15'),
        permissions: ['view_studies', 'create_reports', 'ai_analysis', 'collaboration'],
        medicalLicense: {
          number: 'MD123456',
          state: 'CA',
          expirationDate: new Date('2025-06-30'),
          verified: true
        },
        compliance: {
          hipaaTraining: true,
          hipaaTrainingDate: new Date('2024-01-15'),
          backgroundCheck: true,
          backgroundCheckDate: new Date('2023-01-10'),
          credentialsVerified: true,
          credentialsVerifiedDate: new Date('2023-01-12')
        },
        sessions: {
          current: 2,
          maxAllowed: 3,
          devices: ['Desktop-Chrome', 'Mobile-iOS'],
          lastIP: '192.168.1.100'
        },
        activity: {
          studiesViewed: 342,
          reportsGenerated: 89,
          aiAnalysesRequested: 156,
          collaborations: 23,
          lastActivity: new Date(Date.now() - 1000 * 60 * 15)
        },
        preferences: {
          emailNotifications: true,
          systemAlerts: true,
          securityAlerts: true,
          maintenanceAlerts: false
        }
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@hospital.com',
        role: 'admin',
        department: 'IT Administration',
        status: 'active',
        lastLogin: new Date(Date.now() - 1000 * 60 * 15),
        loginCount: 892,
        createdAt: new Date('2023-03-01'),
        permissions: ['admin_all', 'user_management', 'system_config', 'reports', 'security'],
        compliance: {
          hipaaTraining: true,
          hipaaTrainingDate: new Date('2024-01-10'),
          backgroundCheck: true,
          backgroundCheckDate: new Date('2023-02-25'),
          credentialsVerified: true,
          credentialsVerifiedDate: new Date('2023-02-28')
        },
        sessions: {
          current: 1,
          maxAllowed: 5,
          devices: ['Desktop-Chrome'],
          lastIP: '192.168.1.101'
        },
        activity: {
          studiesViewed: 0,
          reportsGenerated: 0,
          aiAnalysesRequested: 0,
          collaborations: 0,
          lastActivity: new Date(Date.now() - 1000 * 60 * 10)
        },
        preferences: {
          emailNotifications: true,
          systemAlerts: true,
          securityAlerts: true,
          maintenanceAlerts: true
        }
      },
      {
        id: '3',
        name: 'Amanda Rodriguez',
        email: 'amanda.rodriguez@hospital.com',
        role: 'technician',
        department: 'Imaging',
        status: 'active',
        lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2),
        loginCount: 1856,
        createdAt: new Date('2022-11-20'),
        permissions: ['view_studies', 'upload_images', 'equipment_control'],
        compliance: {
          hipaaTraining: true,
          hipaaTrainingDate: new Date('2024-01-05'),
          backgroundCheck: true,
          backgroundCheckDate: new Date('2022-11-15'),
          credentialsVerified: true,
          credentialsVerifiedDate: new Date('2022-11-18')
        },
        sessions: {
          current: 1,
          maxAllowed: 2,
          devices: ['Tablet-iPad'],
          lastIP: '192.168.1.102'
        },
        activity: {
          studiesViewed: 567,
          reportsGenerated: 0,
          aiAnalysesRequested: 45,
          collaborations: 12,
          lastActivity: new Date(Date.now() - 1000 * 60 * 60)
        },
        preferences: {
          emailNotifications: true,
          systemAlerts: false,
          securityAlerts: true,
          maintenanceAlerts: false
        }
      },
      {
        id: '4',
        name: 'Dr. Robert Kim',
        email: 'robert.kim@hospital.com',
        role: 'radiologist',
        department: 'Neuroradiology',
        status: 'suspended',
        lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        loginCount: 445,
        createdAt: new Date('2023-05-10'),
        permissions: ['view_studies', 'create_reports'],
        medicalLicense: {
          number: 'MD654321',
          state: 'NY',
          expirationDate: new Date('2024-03-15'),
          verified: false
        },
        compliance: {
          hipaaTraining: false,
          backgroundCheck: true,
          backgroundCheckDate: new Date('2023-05-05'),
          credentialsVerified: false
        },
        sessions: {
          current: 0,
          maxAllowed: 3,
          devices: [],
          lastIP: '192.168.1.103'
        },
        activity: {
          studiesViewed: 123,
          reportsGenerated: 45,
          aiAnalysesRequested: 23,
          collaborations: 5,
          lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8)
        },
        preferences: {
          emailNotifications: false,
          systemAlerts: false,
          securityAlerts: true,
          maintenanceAlerts: false
        }
      },
      {
        id: '5',
        name: 'Jessica Thompson',
        email: 'jessica.thompson@hospital.com',
        role: 'student',
        department: 'Radiology',
        status: 'pending',
        loginCount: 0,
        createdAt: new Date('2024-01-15'),
        permissions: ['view_studies'],
        compliance: {
          hipaaTraining: false,
          backgroundCheck: false,
          credentialsVerified: false
        },
        sessions: {
          current: 0,
          maxAllowed: 1,
          devices: []
        },
        activity: {
          studiesViewed: 0,
          reportsGenerated: 0,
          aiAnalysesRequested: 0,
          collaborations: 0
        },
        preferences: {
          emailNotifications: true,
          systemAlerts: true,
          securityAlerts: true,
          maintenanceAlerts: false
        }
      }
    ];
    
    setUsers(mockUsers);
    setLoading(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-medsight-critical';
      case 'radiologist': return 'text-medsight-primary';
      case 'physician': return 'text-medsight-secondary';
      case 'technician': return 'text-medsight-ai-high';
      case 'nurse': return 'text-medsight-normal';
      case 'student': return 'text-medsight-pending';
      default: return 'text-medsight-primary';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'radiologist': return '🩺';
      case 'physician': return '⚕️';
      case 'technician': return '🔧';
      case 'nurse': return '👩‍⚕️';
      case 'student': return '🎓';
      default: return '👤';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-medsight-normal';
      case 'inactive': return 'text-medsight-primary/50';
      case 'suspended': return 'text-medsight-critical';
      case 'pending': return 'text-medsight-pending';
      case 'locked': return 'text-medsight-critical';
      default: return 'text-medsight-primary';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-medsight-normal/10 border-medsight-normal/20';
      case 'inactive': return 'bg-medsight-primary/10 border-medsight-primary/20';
      case 'suspended': return 'bg-medsight-critical/10 border-medsight-critical/20';
      case 'pending': return 'bg-medsight-pending/10 border-medsight-pending/20';
      case 'locked': return 'bg-medsight-critical/10 border-medsight-critical/20';
      default: return 'bg-medsight-primary/10 border-medsight-primary/20';
    }
  };

  const getComplianceScore = (compliance: User['compliance']) => {
    let score = 0;
    if (compliance.hipaaTraining) score += 33;
    if (compliance.backgroundCheck) score += 33;
    if (compliance.credentialsVerified) score += 34;
    return score;
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
      return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'lastLogin':
          aValue = a.lastLogin?.getTime() || 0;
          bValue = b.lastLogin?.getTime() || 0;
          break;
        case 'created':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

  const formatTimeAgo = (date?: Date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const handleUserAction = (userId: string, action: string) => {
    console.log(`Action: ${action} for user: ${userId}`);
    // Implement user actions
  };

  const handleBulkAction = () => {
    if (bulkAction && selectedUsers.length > 0) {
      console.log(`Bulk action: ${bulkAction} for users:`, selectedUsers);
      // Implement bulk actions
    }
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const uniqueDepartments = [...new Set(users.map(u => u.department))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="medsight-glass p-8 rounded-xl">
          <div className="w-8 h-8 border-4 border-medsight-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-sm text-medsight-primary">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="medsight-control-glass p-2 rounded-lg">
              <UsersIcon className="w-6 h-6 text-medsight-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-medsight-primary">User Management</h2>
              <p className="text-sm text-medsight-primary/70">{users.length} total users</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddUser(true)}
              className="btn-medsight"
            >
              <UserPlusIcon className="w-4 h-4 mr-2" />
              Add User
            </button>
            <button className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg">
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medsight-primary/50" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-medsight pl-10 w-full"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="input-medsight"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="radiologist">Radiologist</option>
            <option value="physician">Physician</option>
            <option value="technician">Technician</option>
            <option value="nurse">Nurse</option>
            <option value="student">Student</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-medsight"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
            <option value="locked">Locked</option>
          </select>
          
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="input-medsight"
          >
            <option value="all">All Departments</option>
            {uniqueDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="input-medsight"
          >
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="role">Sort by Role</option>
            <option value="lastLogin">Sort by Last Login</option>
            <option value="created">Sort by Created</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-3 bg-medsight-primary/10 rounded-lg flex items-center justify-between">
            <span className="text-sm text-medsight-primary">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="input-medsight text-sm"
              >
                <option value="">Select Action</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="suspend">Suspend</option>
                <option value="unlock">Unlock</option>
                <option value="reset_password">Reset Password</option>
                <option value="delete">Delete</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="btn-medsight text-sm disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="medsight-glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-medsight-primary/5">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded border-medsight-primary/20 text-medsight-primary focus:ring-medsight-primary"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-medsight-primary uppercase tracking-wider cursor-pointer hover:bg-medsight-primary/10"
                  onClick={() => handleSort('name')}
                >
                  User {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-medsight-primary uppercase tracking-wider cursor-pointer hover:bg-medsight-primary/10"
                  onClick={() => handleSort('role')}
                >
                  Role {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-medsight-primary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-medsight-primary uppercase tracking-wider">
                  Compliance
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-medsight-primary uppercase tracking-wider cursor-pointer hover:bg-medsight-primary/10"
                  onClick={() => handleSort('lastLogin')}
                >
                  Last Login {sortBy === 'lastLogin' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-medsight-primary uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-medsight-primary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-medsight-primary/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-medsight-primary/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                      className="rounded border-medsight-primary/20 text-medsight-primary focus:ring-medsight-primary"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-medsight-primary/10 flex items-center justify-center">
                          <span className="text-medsight-primary font-medium text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-medsight-primary">{user.name}</div>
                        <div className="text-sm text-medsight-primary/70">{user.email}</div>
                        <div className="text-xs text-medsight-primary/50">{user.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getRoleIcon(user.role)}</span>
                      <div>
                        <div className={`text-sm font-medium capitalize ${getRoleColor(user.role)}`}>
                          {user.role}
                        </div>
                        <div className="text-xs text-medsight-primary/60">
                          {user.permissions.length} permissions
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBg(user.status)}`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(user.status).replace('text-', 'bg-')}`}></span>
                      <span className={getStatusColor(user.status)}>{user.status.toUpperCase()}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-medsight-primary/20 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            getComplianceScore(user.compliance) >= 80 ? 'bg-medsight-normal' :
                            getComplianceScore(user.compliance) >= 60 ? 'bg-medsight-pending' : 
                            'bg-medsight-critical'
                          }`}
                          style={{ width: `${getComplianceScore(user.compliance)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-medsight-primary">
                        {getComplianceScore(user.compliance)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-medsight-primary">
                      {formatTimeAgo(user.lastLogin)}
                    </div>
                    <div className="text-xs text-medsight-primary/60">
                      {user.sessions.current}/{user.sessions.maxAllowed} sessions
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-medsight-primary">
                      {user.activity.studiesViewed} studies
                    </div>
                    <div className="text-xs text-medsight-primary/60">
                      {user.activity.reportsGenerated} reports
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowUserDetails(user.id)}
                        className="p-1 text-medsight-primary hover:text-medsight-primary/70"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, 'edit')}
                        className="p-1 text-medsight-secondary hover:text-medsight-secondary/70"
                        title="Edit User"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, 'delete')}
                        className="p-1 text-medsight-critical hover:text-medsight-critical/70"
                        title="Delete User"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-6 h-6 text-medsight-normal" />
            <div>
              <div className="text-2xl font-bold text-medsight-normal">
                {users.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-medsight-normal/70">Active Users</div>
            </div>
          </div>
        </div>
        
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="w-6 h-6 text-medsight-primary" />
            <div>
              <div className="text-2xl font-bold text-medsight-primary">
                {users.filter(u => getComplianceScore(u.compliance) >= 80).length}
              </div>
              <div className="text-sm text-medsight-primary/70">Compliant</div>
            </div>
          </div>
        </div>
        
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-6 h-6 text-medsight-pending" />
            <div>
              <div className="text-2xl font-bold text-medsight-pending">
                {users.filter(u => u.status === 'pending').length}
              </div>
              <div className="text-sm text-medsight-pending/70">Pending</div>
            </div>
          </div>
        </div>
        
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-medsight-critical" />
            <div>
              <div className="text-2xl font-bold text-medsight-critical">
                {users.filter(u => u.status === 'suspended' || u.status === 'locked').length}
              </div>
              <div className="text-sm text-medsight-critical/70">Suspended</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 