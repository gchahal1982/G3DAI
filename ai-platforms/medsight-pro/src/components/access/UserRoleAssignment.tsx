'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Search, 
  Filter, 
  Shield, 
  Clock, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Building2, 
  Check, 
  X, 
  AlertTriangle, 
  History, 
  Settings,
  Eye,
  Edit,
  Save,
  RefreshCw
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
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  status: 'active' | 'inactive' | 'deprecated';
  color: string;
}

interface RoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  reason: string;
}

interface BulkAssignmentRequest {
  userIds: string[];
  roleIds: string[];
  reason: string;
  expiresAt?: Date;
}

const UserRoleAssignment: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [isBulkAssignmentOpen, setIsBulkAssignmentOpen] = useState(false);
  const [bulkAssignmentData, setBulkAssignmentData] = useState<BulkAssignmentRequest>({
    userIds: [],
    roleIds: [],
    reason: '',
    expiresAt: undefined
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data - replace with actual API calls
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'sarah.johnson@hospital.com',
            firstName: 'Sarah',
            lastName: 'Johnson',
            roles: ['1', '2'], // Senior Radiologist, Radiologist
            department: 'Radiology',
            licenseNumber: 'MD123456',
            licenseState: 'CA',
            specialization: 'Diagnostic Radiology',
            phone: '(555) 123-4567',
            isActive: true,
            lastLogin: new Date('2024-01-25T10:30:00Z'),
            createdAt: new Date('2024-01-01T00:00:00Z'),
            updatedAt: new Date('2024-01-25T10:30:00Z')
          },
          {
            id: '2',
            email: 'mark.chen@hospital.com',
            firstName: 'Mark',
            lastName: 'Chen',
            roles: ['2'], // Radiologist
            department: 'Radiology',
            licenseNumber: 'MD789012',
            licenseState: 'NY',
            specialization: 'Interventional Radiology',
            phone: '(555) 234-5678',
            isActive: true,
            lastLogin: new Date('2024-01-24T15:45:00Z'),
            createdAt: new Date('2024-01-05T00:00:00Z'),
            updatedAt: new Date('2024-01-24T15:45:00Z')
          },
          {
            id: '3',
            email: 'lisa.rodriguez@hospital.com',
            firstName: 'Lisa',
            lastName: 'Rodriguez',
            roles: ['3'], // Radiology Technician
            department: 'Radiology',
            licenseNumber: 'RT345678',
            licenseState: 'TX',
            specialization: 'Radiologic Technology',
            phone: '(555) 345-6789',
            isActive: true,
            lastLogin: new Date('2024-01-25T08:15:00Z'),
            createdAt: new Date('2024-01-10T00:00:00Z'),
            updatedAt: new Date('2024-01-25T08:15:00Z')
          },
          {
            id: '4',
            email: 'john.smith@hospital.com',
            firstName: 'John',
            lastName: 'Smith',
            roles: ['4'], // Medical Student
            department: 'Education',
            licenseNumber: 'MS901234',
            licenseState: 'FL',
            specialization: 'Medical Student',
            phone: '(555) 456-7890',
            isActive: true,
            lastLogin: new Date('2024-01-23T14:20:00Z'),
            createdAt: new Date('2024-01-15T00:00:00Z'),
            updatedAt: new Date('2024-01-23T14:20:00Z')
          },
          {
            id: '5',
            email: 'admin@hospital.com',
            firstName: 'System',
            lastName: 'Administrator',
            roles: ['5'], // System Administrator
            department: 'IT',
            licenseNumber: 'IT567890',
            licenseState: 'CA',
            specialization: 'System Administration',
            phone: '(555) 567-8901',
            isActive: true,
            lastLogin: new Date('2024-01-25T11:00:00Z'),
            createdAt: new Date('2024-01-01T00:00:00Z'),
            updatedAt: new Date('2024-01-25T11:00:00Z')
          },
          {
            id: '6',
            email: 'jane.doe@hospital.com',
            firstName: 'Jane',
            lastName: 'Doe',
            roles: ['6'], // Quality Assurance
            department: 'Quality',
            licenseNumber: 'QA123456',
            licenseState: 'IL',
            specialization: 'Quality Assurance',
            phone: '(555) 678-9012',
            isActive: false,
            lastLogin: new Date('2024-01-20T09:30:00Z'),
            createdAt: new Date('2024-01-08T00:00:00Z'),
            updatedAt: new Date('2024-01-20T09:30:00Z')
          }
        ];

        const mockRoles: Role[] = [
          {
            id: '1',
            name: 'Senior Radiologist',
            description: 'Full access to all medical imaging and diagnostic tools',
            permissions: ['read_all_studies', 'create_reports', 'approve_reports', 'manage_protocols', 'ai_analysis'],
            userCount: 12,
            isSystem: false,
            status: 'active',
            color: 'bg-blue-500'
          },
          {
            id: '2',
            name: 'Radiologist',
            description: 'Standard radiologist access with reporting capabilities',
            permissions: ['read_assigned_studies', 'create_reports', 'use_ai_tools', 'view_analytics'],
            userCount: 25,
            isSystem: false,
            status: 'active',
            color: 'bg-green-500'
          },
          {
            id: '3',
            name: 'Radiology Technician',
            description: 'Technical staff with limited diagnostic access',
            permissions: ['upload_studies', 'view_protocols', 'basic_measurements', 'schedule_studies'],
            userCount: 18,
            isSystem: false,
            status: 'active',
            color: 'bg-purple-500'
          },
          {
            id: '4',
            name: 'Medical Student',
            description: 'Educational access with supervision requirements',
            permissions: ['read_educational_studies', 'practice_tools', 'view_tutorials'],
            userCount: 8,
            isSystem: false,
            status: 'active',
            color: 'bg-yellow-500'
          },
          {
            id: '5',
            name: 'System Administrator',
            description: 'Full system access and configuration management',
            permissions: ['system_admin', 'user_management', 'role_management', 'system_config', 'audit_logs'],
            userCount: 3,
            isSystem: true,
            status: 'active',
            color: 'bg-red-500'
          },
          {
            id: '6',
            name: 'Quality Assurance',
            description: 'Quality control and compliance monitoring',
            permissions: ['view_analytics', 'audit_logs', 'manage_protocols', 'create_reports'],
            userCount: 5,
            isSystem: false,
            status: 'active',
            color: 'bg-indigo-500'
          }
        ];

        const mockAssignments: RoleAssignment[] = [
          {
            id: '1',
            userId: '1',
            roleId: '1',
            assignedBy: 'admin@hospital.com',
            assignedAt: new Date('2024-01-01T00:00:00Z'),
            isActive: true,
            reason: 'Initial role assignment'
          },
          {
            id: '2',
            userId: '2',
            roleId: '2',
            assignedBy: 'admin@hospital.com',
            assignedAt: new Date('2024-01-05T00:00:00Z'),
            isActive: true,
            reason: 'New hire assignment'
          },
          {
            id: '3',
            userId: '3',
            roleId: '3',
            assignedBy: 'admin@hospital.com',
            assignedAt: new Date('2024-01-10T00:00:00Z'),
            isActive: true,
            reason: 'Department transfer'
          }
        ];

        setUsers(mockUsers);
        setRoles(mockRoles);
        setAssignments(mockAssignments);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    const matchesRole = filterRole === 'all' || user.roles.includes(filterRole);
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const departments = [...new Set(users.map(u => u.department))];

  const getUserRoles = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return [];
    return user.roles.map(roleId => roles.find(r => r.id === roleId)).filter(Boolean) as Role[];
  };

  const handleAssignRole = (userId: string, roleId: string, reason: string) => {
    const user = users.find(u => u.id === userId);
    if (user && !user.roles.includes(roleId)) {
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, roles: [...u.roles, roleId], updatedAt: new Date() }
          : u
      ));

      const newAssignment: RoleAssignment = {
        id: Date.now().toString(),
        userId,
        roleId,
        assignedBy: 'current_user@hospital.com',
        assignedAt: new Date(),
        isActive: true,
        reason
      };
      setAssignments([...assignments, newAssignment]);
    }
  };

  const handleUnassignRole = (userId: string, roleId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && user.roles.includes(roleId)) {
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, roles: u.roles.filter(r => r !== roleId), updatedAt: new Date() }
          : u
      ));

      setAssignments(assignments.map(a => 
        a.userId === userId && a.roleId === roleId 
          ? { ...a, isActive: false }
          : a
      ));
    }
  };

  const handleBulkAssignment = () => {
    bulkAssignmentData.userIds.forEach(userId => {
      bulkAssignmentData.roleIds.forEach(roleId => {
        handleAssignRole(userId, roleId, bulkAssignmentData.reason);
      });
    });
    
    setBulkAssignmentData({
      userIds: [],
      roleIds: [],
      reason: '',
      expiresAt: undefined
    });
    setIsBulkAssignmentOpen(false);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
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
          <h1 className="text-3xl font-bold text-gray-900">User Role Assignment</h1>
          <p className="text-gray-600 mt-1">Assign and manage roles for medical professionals</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsBulkAssignmentOpen(true)}
            disabled={selectedUsers.length === 0}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Bulk Assignment ({selectedUsers.length})
          </Button>
          <Button onClick={() => setIsAssignmentDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Assign Role
          </Button>
        </div>
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

        <Button variant="outline" onClick={selectAllUsers}>
          {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive).length}</p>
              </div>
              <UserPlus className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Role Assignments</p>
                <p className="text-2xl font-bold text-purple-600">{assignments.filter(a => a.isActive).length}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selected Users</p>
                <p className="text-2xl font-bold text-orange-600">{selectedUsers.length}</p>
              </div>
              <Check className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users and Role Assignments</CardTitle>
          <CardDescription>
            Manage role assignments for medical professionals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={selectAllUsers}
                    />
                  </th>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Department</th>
                  <th className="text-left p-2">License</th>
                  <th className="text-left p-2">Current Roles</th>
                  <th className="text-left p-2">Last Login</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
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
                        <span>{user.licenseNumber}</span>
                        <Badge variant="outline" className="ml-1">
                          {user.licenseState}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {getUserRoles(user.id).map(role => (
                          <Badge key={role.id} className="text-xs" style={{ backgroundColor: role.color.replace('bg-', 'rgb(') }}>
                            {role.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{user.lastLogin.toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsAssignmentDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
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

      {/* Assignment Dialog */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Role to User</DialogTitle>
            <DialogDescription>
              Select a user and roles to assign. You can assign multiple roles at once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select User</label>
              <Select value={selectedUser?.id || ''} onValueChange={(value) => {
                const user = users.find(u => u.id === value);
                setSelectedUser(user || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} - {user.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedUser && (
              <div>
                <label className="block text-sm font-medium mb-2">Available Roles</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {roles.filter(role => !selectedUser.roles.includes(role.id)).map(role => (
                    <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${role.color}`}></div>
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-sm text-gray-500">{role.description}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAssignRole(selectedUser.id, role.id, 'Manual assignment')}
                      >
                        Assign
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Assignment Dialog */}
      <Dialog open={isBulkAssignmentOpen} onOpenChange={setIsBulkAssignmentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Role Assignment</DialogTitle>
            <DialogDescription>
              Assign roles to multiple users at once. {selectedUsers.length} users selected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Roles to Assign</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {roles.map(role => (
                  <div key={role.id} className="flex items-center space-x-2 p-2 border rounded">
                    <Checkbox
                      checked={bulkAssignmentData.roleIds.includes(role.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBulkAssignmentData({
                            ...bulkAssignmentData,
                            roleIds: [...bulkAssignmentData.roleIds, role.id]
                          });
                        } else {
                          setBulkAssignmentData({
                            ...bulkAssignmentData,
                            roleIds: bulkAssignmentData.roleIds.filter(id => id !== role.id)
                          });
                        }
                      }}
                    />
                    <div className={`w-4 h-4 rounded-full ${role.color}`}></div>
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm text-gray-500">{role.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Reason for Assignment</label>
              <Input
                placeholder="Enter reason for bulk assignment..."
                value={bulkAssignmentData.reason}
                onChange={(e) => setBulkAssignmentData({
                  ...bulkAssignmentData,
                  reason: e.target.value
                })}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsBulkAssignmentOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkAssignment}
                disabled={bulkAssignmentData.roleIds.length === 0 || !bulkAssignmentData.reason}
              >
                <Save className="w-4 h-4 mr-2" />
                Assign Roles
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alerts */}
      <div className="space-y-4">
        {selectedUsers.length > 0 && (
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              <strong>{selectedUsers.length} users selected.</strong> 
              Use the bulk assignment feature to assign roles to multiple users at once.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default UserRoleAssignment; 