'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { 
  Shield, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  UserCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
  status: 'active' | 'inactive' | 'deprecated';
  createdAt: Date;
  updatedAt: Date;
}

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  targetRole: string;
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [templates, setTemplates] = useState<RoleTemplate[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'deprecated'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoleData = async () => {
      try {
        // Mock data - replace with actual API calls
        const mockRoles: Role[] = [
          {
            id: '1',
            name: 'Senior Radiologist',
            description: 'Full access to all medical imaging and diagnostic tools',
            permissions: ['read_all_studies', 'create_reports', 'approve_reports', 'manage_protocols', 'ai_analysis'],
            isSystem: false,
            userCount: 12,
            status: 'active',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15')
          },
          {
            id: '2',
            name: 'Radiologist',
            description: 'Standard radiologist access with reporting capabilities',
            permissions: ['read_assigned_studies', 'create_reports', 'use_ai_tools', 'view_analytics'],
            isSystem: false,
            userCount: 25,
            status: 'active',
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-20')
          },
          {
            id: '3',
            name: 'Radiology Technician',
            description: 'Technical staff with limited diagnostic access',
            permissions: ['upload_studies', 'view_protocols', 'basic_measurements', 'schedule_studies'],
            isSystem: false,
            userCount: 18,
            status: 'active',
            createdAt: new Date('2024-01-08'),
            updatedAt: new Date('2024-01-12')
          },
          {
            id: '4',
            name: 'Medical Student',
            description: 'Educational access with supervision requirements',
            permissions: ['read_educational_studies', 'practice_tools', 'view_tutorials'],
            isSystem: false,
            userCount: 8,
            status: 'active',
            createdAt: new Date('2024-01-05'),
            updatedAt: new Date('2024-01-10')
          },
          {
            id: '5',
            name: 'System Administrator',
            description: 'Full system access and configuration management',
            permissions: ['system_admin', 'user_management', 'role_management', 'system_config', 'audit_logs'],
            isSystem: true,
            userCount: 3,
            status: 'active',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-25')
          },
          {
            id: '6',
            name: 'Legacy Viewer',
            description: 'Deprecated role for old system compatibility',
            permissions: ['basic_viewing'],
            isSystem: false,
            userCount: 2,
            status: 'deprecated',
            createdAt: new Date('2023-12-01'),
            updatedAt: new Date('2023-12-01')
          }
        ];

        const mockPermissions: Permission[] = [
          // Patient Data Access
          { id: 'read_all_studies', name: 'Read All Studies', category: 'Patient Data', description: 'Access to all medical studies', riskLevel: 'high' },
          { id: 'read_assigned_studies', name: 'Read Assigned Studies', category: 'Patient Data', description: 'Access to assigned studies only', riskLevel: 'medium' },
          { id: 'read_educational_studies', name: 'Read Educational Studies', category: 'Patient Data', description: 'Access to de-identified educational content', riskLevel: 'low' },
          
          // Reporting & Documentation
          { id: 'create_reports', name: 'Create Reports', category: 'Reporting', description: 'Create and edit medical reports', riskLevel: 'high' },
          { id: 'approve_reports', name: 'Approve Reports', category: 'Reporting', description: 'Final approval of medical reports', riskLevel: 'critical' },
          { id: 'view_analytics', name: 'View Analytics', category: 'Reporting', description: 'Access to system analytics', riskLevel: 'medium' },
          
          // AI & Advanced Tools
          { id: 'ai_analysis', name: 'AI Analysis', category: 'AI Tools', description: 'Full access to AI diagnostic tools', riskLevel: 'high' },
          { id: 'use_ai_tools', name: 'Use AI Tools', category: 'AI Tools', description: 'Standard AI tool access', riskLevel: 'medium' },
          { id: 'practice_tools', name: 'Practice Tools', category: 'AI Tools', description: 'Educational AI tools', riskLevel: 'low' },
          
          // System Management
          { id: 'system_admin', name: 'System Administration', category: 'System', description: 'Full system administration', riskLevel: 'critical' },
          { id: 'user_management', name: 'User Management', category: 'System', description: 'Manage user accounts', riskLevel: 'high' },
          { id: 'role_management', name: 'Role Management', category: 'System', description: 'Manage roles and permissions', riskLevel: 'critical' },
          { id: 'system_config', name: 'System Configuration', category: 'System', description: 'Configure system settings', riskLevel: 'high' },
          { id: 'audit_logs', name: 'Audit Logs', category: 'System', description: 'Access audit and security logs', riskLevel: 'high' },
          
          // Technical Operations
          { id: 'upload_studies', name: 'Upload Studies', category: 'Technical', description: 'Upload medical studies', riskLevel: 'medium' },
          { id: 'manage_protocols', name: 'Manage Protocols', category: 'Technical', description: 'Manage imaging protocols', riskLevel: 'medium' },
          { id: 'view_protocols', name: 'View Protocols', category: 'Technical', description: 'View imaging protocols', riskLevel: 'low' },
          { id: 'basic_measurements', name: 'Basic Measurements', category: 'Technical', description: 'Basic measurement tools', riskLevel: 'low' },
          { id: 'schedule_studies', name: 'Schedule Studies', category: 'Technical', description: 'Schedule imaging studies', riskLevel: 'medium' },
          
          // Educational
          { id: 'view_tutorials', name: 'View Tutorials', category: 'Educational', description: 'Access training materials', riskLevel: 'low' },
          { id: 'basic_viewing', name: 'Basic Viewing', category: 'Educational', description: 'Basic image viewing', riskLevel: 'low' }
        ];

        const mockTemplates: RoleTemplate[] = [
          {
            id: '1',
            name: 'New Radiologist',
            description: 'Standard permissions for newly hired radiologists',
            permissions: ['read_assigned_studies', 'create_reports', 'use_ai_tools', 'view_analytics'],
            targetRole: 'radiologist'
          },
          {
            id: '2',
            name: 'Emergency Radiologist',
            description: 'Enhanced permissions for emergency department radiologists',
            permissions: ['read_all_studies', 'create_reports', 'ai_analysis', 'view_analytics'],
            targetRole: 'emergency_radiologist'
          },
          {
            id: '3',
            name: 'Research Radiologist',
            description: 'Permissions for research-focused radiologists',
            permissions: ['read_all_studies', 'create_reports', 'ai_analysis', 'view_analytics', 'manage_protocols'],
            targetRole: 'research_radiologist'
          }
        ];

        setRoles(mockRoles);
        setPermissions(mockPermissions);
        setTemplates(mockTemplates);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching role data:', error);
        setLoading(false);
      }
    };

    fetchRoleData();
  }, []);

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || role.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: Role['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskLevel: Permission['riskLevel']) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPermissionsByCategory = (categoryName: string) => {
    return permissions.filter(permission => permission.category === categoryName);
  };

  const categories = [...new Set(permissions.map(p => p.category))];

  const handleCreateRole = () => {
    setIsCreating(true);
    setEditingRole(null);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsCreating(false);
  };

  const handleSaveRole = (roleData: Partial<Role>) => {
    if (editingRole) {
      // Update existing role
      setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...roleData, updatedAt: new Date() } : r));
    } else {
      // Create new role
      const newRole: Role = {
        id: Date.now().toString(),
        name: roleData.name || '',
        description: roleData.description || '',
        permissions: roleData.permissions || [],
        isSystem: false,
        userCount: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setRoles([...roles, newRole]);
    }
    setIsCreating(false);
    setEditingRole(null);
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role && !role.isSystem && role.userCount === 0) {
      setRoles(roles.filter(r => r.id !== roleId));
    }
  };

  const handleToggleRoleStatus = (roleId: string) => {
    setRoles(roles.map(r => 
      r.id === roleId 
        ? { ...r, status: r.status === 'active' ? 'inactive' : 'active', updatedAt: new Date() }
        : r
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-1">Manage user roles and permissions for medical professionals</p>
        </div>
        <Button onClick={handleCreateRole} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="deprecated">Deprecated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          {/* Roles Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Roles</p>
                    <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                  </div>
                  <Shield className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Roles</p>
                    <p className="text-2xl font-bold text-green-600">{roles.filter(r => r.status === 'active').length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Roles</p>
                    <p className="text-2xl font-bold text-orange-600">{roles.filter(r => r.isSystem).length}</p>
                  </div>
                  <Settings className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-purple-600">{roles.reduce((sum, r) => sum + r.userCount, 0)}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Roles List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRoles.map((role) => (
              <Card key={role.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{role.name}</span>
                        {role.isSystem && <Lock className="w-4 h-4 text-orange-500" />}
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(role.status)} variant="secondary">
                        {role.status}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                          disabled={role.isSystem}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleRoleStatus(role.id)}
                          disabled={role.isSystem}
                        >
                          {role.status === 'active' ? 
                            <EyeOff className="w-4 h-4" /> : 
                            <Eye className="w-4 h-4" />
                          }
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                          disabled={role.isSystem || role.userCount > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Users assigned:</span>
                      <span className="font-medium">{role.userCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Permissions:</span>
                      <span className="font-medium">{role.permissions.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last updated:</span>
                      <span className="font-medium">{role.updatedAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {role.permissions.slice(0, 3).map((permissionId) => {
                        const permission = permissions.find(p => p.id === permissionId);
                        return permission ? (
                          <Badge key={permissionId} variant="outline" className="text-xs">
                            {permission.name}
                          </Badge>
                        ) : null;
                      })}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          {/* Permissions by Category */}
          {categories.map((category) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
                <CardDescription>
                  Permissions related to {category.toLowerCase()} operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getPermissionsByCategory(category).map((permission) => (
                    <div key={permission.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{permission.name}</h4>
                        <Badge className={getRiskColor(permission.riskLevel)} variant="secondary">
                          {permission.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{permission.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        Used in {roles.filter(r => r.permissions.includes(permission.id)).length} roles
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {/* Role Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-gray-600">Permissions included:</span>
                      <span className="font-medium ml-2">{template.permissions.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.permissions.slice(0, 3).map((permissionId) => {
                        const permission = permissions.find(p => p.id === permissionId);
                        return permission ? (
                          <Badge key={permissionId} variant="outline" className="text-xs">
                            {permission.name}
                          </Badge>
                        ) : null;
                      })}
                      {template.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" className="w-full mt-3">
                      <Plus className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Alerts */}
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> Role changes may take up to 5 minutes to propagate across all systems.
            Users will need to log out and log back in for changes to take effect.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default RoleManagement; 