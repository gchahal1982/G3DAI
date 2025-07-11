'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Activity, 
  Search, 
  Filter,
  UserPlus,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  UserCheck,
  UserX,
  Crown,
  Stethoscope,
  Building
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'technician' | 'staff';
  department: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastLogin: Date;
  loginCount: number;
  createdAt: Date;
  permissions: string[];
  compliance: {
    hipaaTraining: boolean;
    backgroundCheck: boolean;
    medicalLicense: boolean;
    expirationDate?: Date;
  };
  sessions: {
    current: number;
    total: number;
    devices: string[];
  };
  activity: {
    patientsAccessed: number;
    recordsModified: number;
    loginAttempts: number;
    failedLogins: number;
  };
}

interface UserManagementProps {
  className?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ className = '' }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<string>('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    // Mock data - replace with actual API call
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        role: 'doctor',
        department: 'Cardiology',
        status: 'active',
        lastLogin: new Date(Date.now() - 1000 * 60 * 30),
        loginCount: 1247,
        createdAt: new Date('2023-01-15'),
        permissions: ['read_patients', 'write_patients', 'prescribe', 'view_analytics'],
        compliance: {
          hipaaTraining: true,
          backgroundCheck: true,
          medicalLicense: true,
          expirationDate: new Date('2025-06-30')
        },
        sessions: {
          current: 2,
          total: 1247,
          devices: ['Desktop-Chrome', 'Mobile-iOS']
        },
        activity: {
          patientsAccessed: 342,
          recordsModified: 89,
          loginAttempts: 1247,
          failedLogins: 3
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
        permissions: ['admin_all', 'user_management', 'system_config', 'reports'],
        compliance: {
          hipaaTraining: true,
          backgroundCheck: true,
          medicalLicense: false
        },
        sessions: {
          current: 1,
          total: 892,
          devices: ['Desktop-Chrome']
        },
        activity: {
          patientsAccessed: 0,
          recordsModified: 156,
          loginAttempts: 892,
          failedLogins: 1
        }
      },
      {
        id: '3',
        name: 'Nurse Amanda Rodriguez',
        email: 'amanda.rodriguez@hospital.com',
        role: 'nurse',
        department: 'Emergency',
        status: 'active',
        lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2),
        loginCount: 1856,
        createdAt: new Date('2022-11-20'),
        permissions: ['read_patients', 'write_notes', 'view_charts'],
        compliance: {
          hipaaTraining: true,
          backgroundCheck: true,
          medicalLicense: true,
          expirationDate: new Date('2024-12-31')
        },
        sessions: {
          current: 1,
          total: 1856,
          devices: ['Tablet-iPad']
        },
        activity: {
          patientsAccessed: 567,
          recordsModified: 234,
          loginAttempts: 1856,
          failedLogins: 7
        }
      },
      {
        id: '4',
        name: 'Dr. Robert Kim',
        email: 'robert.kim@hospital.com',
        role: 'doctor',
        department: 'Neurology',
        status: 'suspended',
        lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        loginCount: 445,
        createdAt: new Date('2023-05-10'),
        permissions: ['read_patients', 'write_patients'],
        compliance: {
          hipaaTraining: false,
          backgroundCheck: true,
          medicalLicense: true,
          expirationDate: new Date('2024-03-15')
        },
        sessions: {
          current: 0,
          total: 445,
          devices: []
        },
        activity: {
          patientsAccessed: 123,
          recordsModified: 45,
          loginAttempts: 445,
          failedLogins: 15
        }
      },
      {
        id: '5',
        name: 'Jessica Thompson',
        email: 'jessica.thompson@hospital.com',
        role: 'technician',
        department: 'Radiology',
        status: 'pending',
        lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        loginCount: 0,
        createdAt: new Date('2024-01-15'),
        permissions: ['read_patients', 'equipment_access'],
        compliance: {
          hipaaTraining: false,
          backgroundCheck: false,
          medicalLicense: false
        },
        sessions: {
          current: 0,
          total: 0,
          devices: []
        },
        activity: {
          patientsAccessed: 0,
          recordsModified: 0,
          loginAttempts: 0,
          failedLogins: 0
        }
      }
    ];

    setUsers(mockUsers);
    setLoading(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-amber-600" />;
      case 'doctor': return <Stethoscope className="w-4 h-4 text-blue-600" />;
      case 'nurse': return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'technician': return <Settings className="w-4 h-4 text-purple-600" />;
      case 'staff': return <Building className="w-4 h-4 text-gray-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>;
      case 'inactive':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Clock className="w-3 h-3 mr-1" />
          Inactive
        </span>;
      case 'suspended':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Suspended
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
      default:
        return null;
    }
  };

  const getComplianceScore = (compliance: User['compliance']) => {
    let score = 0;
    if (compliance.hipaaTraining) score += 33;
    if (compliance.backgroundCheck) score += 33;
    if (compliance.medicalLicense) score += 34;
    return score;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserAction = (userId: string, action: string) => {
    // Mock action handling - replace with actual API calls
    console.log(`Action: ${action} for user: ${userId}`);
    // Update user status, permissions, etc.
  };

  const handleBulkAction = () => {
    if (bulkAction && selectedUsers.length > 0) {
      console.log(`Bulk action: ${bulkAction} for users:`, selectedUsers);
      // Handle bulk actions
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          </div>
          <button
            onClick={() => setShowAddUser(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="technician">Technician</option>
              <option value="staff">Staff</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedUsers.length} users selected
            </span>
            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-blue-300 rounded text-sm"
              >
                <option value="">Select Action</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="suspend">Suspend</option>
                <option value="delete">Delete</option>
              </select>
              <button
                onClick={handleBulkAction}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(filteredUsers.map(u => u.id));
                    } else {
                      setSelectedUsers([]);
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role & Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compliance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
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
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getRoleIcon(user.role)}
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900 capitalize">{user.role}</div>
                      <div className="text-sm text-gray-500">{user.department}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          getComplianceScore(user.compliance) >= 80 ? 'bg-green-600' :
                          getComplianceScore(user.compliance) >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${getComplianceScore(user.compliance)}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {getComplianceScore(user.compliance)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTimeAgo(user.lastLogin)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <span className="ml-1 text-sm text-gray-600">{user.sessions.current}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="ml-1 text-sm text-gray-600">{user.activity.patientsAccessed}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowUserDetails(user.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUserAction(user.id, 'edit')}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUserAction(user.id, 'delete')}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="p-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.status === 'active').length}</div>
            <div className="text-sm text-blue-600">Active Users</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => getComplianceScore(u.compliance) >= 80).length}
            </div>
            <div className="text-sm text-green-600">Compliant Users</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{users.filter(u => u.status === 'pending').length}</div>
            <div className="text-sm text-yellow-600">Pending Users</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{users.filter(u => u.status === 'suspended').length}</div>
            <div className="text-sm text-red-600">Suspended Users</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 