'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { 
  Users, 
  UserPlus, 
  UserX, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Building2, 
  Calendar, 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Download,
  RefreshCw,
  Settings,
  Activity,
  Lock,
  Unlock
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  department: string;
  licenseNumber: string;
  licenseState: string;
  specialization: string;
  phone: string;
  address: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  profilePicture?: string;
}

interface Role {
  id: string;
  name: string;
  color: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingVerification: number;
  recentLogins: number;
  newUsersThisMonth: number;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    pendingVerification: 0,
    recentLogins: 0,
    newUsersThisMonth: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'department' | 'lastLogin' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Mock data - replace with actual API calls
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'sarah.johnson@hospital.com',
            firstName: 'Sarah',
            lastName: 'Johnson',
            roles: ['1', '2'],
            department: 'Radiology',
            licenseNumber: 'MD123456',
            licenseState: 'CA',
            specialization: 'Diagnostic Radiology',
            phone: '(555) 123-4567',
            address: '123 Medical Center Dr, San Francisco, CA 94102',
            isActive: true,
            isVerified: true,
            lastLogin: new Date('2024-01-25T10:30:00Z'),
            createdAt: new Date('2024-01-01T00:00:00Z'),
            updatedAt: new Date('2024-01-25T10:30:00Z')
          },
          {
            id: '2',
            email: 'mark.chen@hospital.com',
            firstName: 'Mark',
            lastName: 'Chen',
            roles: ['2'],
            department: 'Radiology',
            licenseNumber: 'MD789012',
            licenseState: 'NY',
            specialization: 'Interventional Radiology',
            phone: '(555) 234-5678',
            address: '456 Hospital Ave, New York, NY 10001',
            isActive: true,
            isVerified: true,
            lastLogin: new Date('2024-01-24T15:45:00Z'),
            createdAt: new Date('2024-01-05T00:00:00Z'),
            updatedAt: new Date('2024-01-24T15:45:00Z')
          },
          {
            id: '3',
            email: 'lisa.rodriguez@hospital.com',
            firstName: 'Lisa',
            lastName: 'Rodriguez',
            roles: ['3'],
            department: 'Radiology',
            licenseNumber: 'RT345678',
            licenseState: 'TX',
            specialization: 'Radiologic Technology',
            phone: '(555) 345-6789',
            address: '789 Healthcare Blvd, Houston, TX 77001',
            isActive: true,
            isVerified: true,
            lastLogin: new Date('2024-01-25T08:15:00Z'),
            createdAt: new Date('2024-01-10T00:00:00Z'),
            updatedAt: new Date('2024-01-25T08:15:00Z')
          },
          {
            id: '4',
            email: 'john.smith@hospital.com',
            firstName: 'John',
            lastName: 'Smith',
            roles: ['4'],
            department: 'Education',
            licenseNumber: 'MS901234',
            licenseState: 'FL',
            specialization: 'Medical Student',
            phone: '(555) 456-7890',
            address: '101 University St, Miami, FL 33101',
            isActive: true,
            isVerified: false,
            lastLogin: new Date('2024-01-23T14:20:00Z'),
            createdAt: new Date('2024-01-15T00:00:00Z'),
            updatedAt: new Date('2024-01-23T14:20:00Z')
          },
          {
            id: '5',
            email: 'admin@hospital.com',
            firstName: 'System',
            lastName: 'Administrator',
            roles: ['5'],
            department: 'IT',
            licenseNumber: 'IT567890',
            licenseState: 'CA',
            specialization: 'System Administration',
            phone: '(555) 567-8901',
            address: '123 Medical Center Dr, San Francisco, CA 94102',
            isActive: true,
            isVerified: true,
            lastLogin: new Date('2024-01-25T11:00:00Z'),
            createdAt: new Date('2024-01-01T00:00:00Z'),
            updatedAt: new Date('2024-01-25T11:00:00Z')
          },
          {
            id: '6',
            email: 'jane.doe@hospital.com',
            firstName: 'Jane',
            lastName: 'Doe',
            roles: ['6'],
            department: 'Quality',
            licenseNumber: 'QA123456',
            licenseState: 'IL',
            specialization: 'Quality Assurance',
            phone: '(555) 678-9012',
            address: '456 Medical Plaza, Chicago, IL 60601',
            isActive: false,
            isVerified: true,
            lastLogin: new Date('2024-01-20T09:30:00Z'),
            createdAt: new Date('2024-01-08T00:00:00Z'),
            updatedAt: new Date('2024-01-20T09:30:00Z')
          },
          {
            id: '7',
            email: 'mike.wilson@hospital.com',
            firstName: 'Mike',
            lastName: 'Wilson',
            roles: ['2'],
            department: 'Emergency',
            licenseNumber: 'MD111222',
            licenseState: 'WA',
            specialization: 'Emergency Medicine',
            phone: '(555) 789-0123',
            address: '789 Emergency Ave, Seattle, WA 98101',
            isActive: true,
            isVerified: false,
            lastLogin: new Date('2024-01-22T12:00:00Z'),
            createdAt: new Date('2024-01-20T00:00:00Z'),
            updatedAt: new Date('2024-01-22T12:00:00Z')
          },
          {
            id: '8',
            email: 'anna.kim@hospital.com',
            firstName: 'Anna',
            lastName: 'Kim',
            roles: ['3'],
            department: 'Cardiology',
            licenseNumber: 'RT444555',
            licenseState: 'OR',
            specialization: 'Cardiac Imaging',
            phone: '(555) 890-1234',
            address: '321 Heart Center Dr, Portland, OR 97201',
            isActive: true,
            isVerified: true,
            lastLogin: new Date('2024-01-25T09:45:00Z'),
            createdAt: new Date('2024-01-12T00:00:00Z'),
            updatedAt: new Date('2024-01-25T09:45:00Z')
          }
        ];

        const mockRoles: Role[] = [
          { id: '1', name: 'Senior Radiologist', color: 'bg-blue-500' },
          { id: '2', name: 'Radiologist', color: 'bg-green-500' },
          { id: '3', name: 'Radiology Technician', color: 'bg-purple-500' },
          { id: '4', name: 'Medical Student', color: 'bg-yellow-500' },
          { id: '5', name: 'System Administrator', color: 'bg-red-500' },
          { id: '6', name: 'Quality Assurance', color: 'bg-indigo-500' }
        ];

        const mockStats: UserStats = {
          totalUsers: mockUsers.length,
          activeUsers: mockUsers.filter(u => u.isActive).length,
          inactiveUsers: mockUsers.filter(u => !u.isActive).length,
          pendingVerification: mockUsers.filter(u => !u.isVerified).length,
          recentLogins: mockUsers.filter(u => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return u.lastLogin > yesterday;
          }).length,
          newUsersThisMonth: mockUsers.filter(u => {
            const thisMonth = new Date();
            thisMonth.setDate(1);
            return u.createdAt > thisMonth;
          }).length
        };

        setUsers(mockUsers);
        setRoles(mockRoles);
        setStats(mockStats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    const matchesRole = filterRole === 'all' || user.roles.includes(filterRole);
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive) ||
      (filterStatus === 'verified' && user.isVerified) ||
      (filterStatus === 'unverified' && !user.isVerified);
    
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];
    
    if (sortBy === 'name') {
      aValue = `${a.firstName} ${a.lastName}`;
      bValue = `${b.firstName} ${b.lastName}`;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const departments = [...new Set(users.map(u => u.department))];

  const getUserRoles = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return [];
    return user.roles.map(roleId => roles.find(r => r.id === roleId)).filter(Boolean) as Role[];
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, isActive: !u.isActive, updatedAt: new Date() }
        : u
    ));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleVerifyUser = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, isVerified: true, updatedAt: new Date() }
        : u
    ));
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === sortedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(sortedUsers.map(u => u.id));
    }
  };

  const exportUsers = () => {
    // Implementation for exporting users
    console.log('Exporting users...');
  };

  const getStatusIcon = (user: User) => {
    if (!user.isActive) return <XCircle className="w-4 h-4 text-red-500" />;
    if (!user.isVerified) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = (user: User) => {
    if (!user.isActive) return 'Inactive';
    if (!user.isVerified) return 'Pending Verification';
    return 'Active';
  };

  const getStatusColor = (user: User) => {
    if (!user.isActive) return 'bg-red-100 text-red-800';
    if (!user.isVerified) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage medical professionals and their accounts</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactiveUsers}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingVerification}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Logins</p>
                <p className="text-2xl font-bold text-purple-600">{stats.recentLogins}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.newUsersThisMonth}</p>
              </div>
              <Calendar className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map(role => (
              <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Users ({sortedUsers.length})</CardTitle>
              <CardDescription>
                Manage user accounts and their details
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllUsers}
              >
                {selectedUsers.length === sortedUsers.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedUsers.length > 0 && (
                <Badge variant="secondary">
                  {selectedUsers.length} selected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">
                    <Checkbox
                      checked={selectedUsers.length === sortedUsers.length && sortedUsers.length > 0}
                      onCheckedChange={selectAllUsers}
                    />
                  </th>
                  <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center space-x-1">
                      <span>User</span>
                      {sortBy === 'name' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('department')}>
                    <div className="flex items-center space-x-1">
                      <span>Department</span>
                      {sortBy === 'department' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th className="text-left p-2">License</th>
                  <th className="text-left p-2">Roles</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('lastLogin')}>
                    <div className="flex items-center space-x-1">
                      <span>Last Login</span>
                      {sortBy === 'lastLogin' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                      />
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-1">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span>{user.department}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{user.licenseNumber}</span>
                        <Badge variant="outline" className="ml-1">
                          {user.licenseState}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {getUserRoles(user.id).slice(0, 2).map(role => (
                          <Badge key={role.id} variant="secondary" className="text-xs">
                            {role.name}
                          </Badge>
                        ))}
                        {getUserRoles(user.id).length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{getUserRoles(user.id).length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(user)}
                        <Badge className={getStatusColor(user)} variant="secondary">
                          {getStatusText(user)}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{user.lastLogin.toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id)}
                        >
                          {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                        {!user.isVerified && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerifyUser(user.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <div className="space-y-4">
        {stats.pendingVerification > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{stats.pendingVerification} users pending verification.</strong> 
              Review and verify new user accounts to ensure proper access controls.
            </AlertDescription>
          </Alert>
        )}
        
        {selectedUsers.length > 0 && (
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              <strong>{selectedUsers.length} users selected.</strong> 
              Bulk actions are available for selected users.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default UserList; 