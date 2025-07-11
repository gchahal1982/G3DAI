'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert } from '@/components/ui/Alert';
import { 
  Shield, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  AlertTriangle,
  Download,
  RefreshCw,
  Grid,
  List,
  Users,
  Lock,
  Settings,
  FileText,
  Activity
} from 'lucide-react';

// Mock UI components for missing imports
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { className?: string }>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
);
Input.displayName = 'Input';

const Select = ({ value, onValueChange, children, ...props }: any) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {children}
    </select>
  </div>
);

const SelectTrigger = ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>;
const SelectValue = ({ placeholder }: any) => <option value="">{placeholder}</option>;
const SelectContent = ({ children }: any) => <>{children}</>;
const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>;

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { 
  className?: string; 
  onCheckedChange?: (checked: boolean) => void;
}>(
  ({ className, onCheckedChange, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={`peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  )
);
Checkbox.displayName = 'Checkbox';

const AlertDescription = ({ children, ...props }: any) => (
  <div className="text-sm [&_p]:leading-relaxed" {...props}>
    {children}
  </div>
);

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
  status: 'active' | 'inactive' | 'deprecated';
  color: string;
}

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  isRequired: boolean;
  dependencies: string[];
}

interface PermissionConflict {
  roleId: string;
  permissionId: string;
  conflictType: 'missing_dependency' | 'risk_combination' | 'deprecated_permission';
  description: string;
}

const PermissionMatrix: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [conflicts, setConflicts] = useState<PermissionConflict[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatrixData = async () => {
      try {
        // Mock data - replace with actual API calls
        const mockRoles: Role[] = [
          {
            id: '1',
            name: 'Senior Radiologist',
            description: 'Full access to all medical imaging and diagnostic tools',
            permissions: ['read_all_studies', 'create_reports', 'approve_reports', 'manage_protocols', 'ai_analysis', 'audit_logs'],
            isSystem: false,
            userCount: 12,
            status: 'active',
            color: 'bg-blue-500'
          },
          {
            id: '2',
            name: 'Radiologist',
            description: 'Standard radiologist access with reporting capabilities',
            permissions: ['read_assigned_studies', 'create_reports', 'use_ai_tools', 'view_analytics', 'basic_measurements'],
            isSystem: false,
            userCount: 25,
            status: 'active',
            color: 'bg-green-500'
          },
          {
            id: '3',
            name: 'Radiology Technician',
            description: 'Technical staff with limited diagnostic access',
            permissions: ['upload_studies', 'view_protocols', 'basic_measurements', 'schedule_studies', 'view_tutorials'],
            isSystem: false,
            userCount: 18,
            status: 'active',
            color: 'bg-purple-500'
          },
          {
            id: '4',
            name: 'Medical Student',
            description: 'Educational access with supervision requirements',
            permissions: ['read_educational_studies', 'practice_tools', 'view_tutorials', 'basic_viewing'],
            isSystem: false,
            userCount: 8,
            status: 'active',
            color: 'bg-yellow-500'
          },
          {
            id: '5',
            name: 'System Administrator',
            description: 'Full system access and configuration management',
            permissions: ['system_admin', 'user_management', 'role_management', 'system_config', 'audit_logs', 'read_all_studies'],
            isSystem: true,
            userCount: 3,
            status: 'active',
            color: 'bg-red-500'
          },
          {
            id: '6',
            name: 'Quality Assurance',
            description: 'Quality control and compliance monitoring',
            permissions: ['view_analytics', 'audit_logs', 'manage_protocols', 'create_reports', 'quality_control'],
            isSystem: false,
            userCount: 5,
            status: 'active',
            color: 'bg-indigo-500'
          },
          {
            id: '7',
            name: 'Legacy Viewer',
            description: 'Deprecated role for old system compatibility',
            permissions: ['basic_viewing'],
            isSystem: false,
            userCount: 2,
            status: 'deprecated',
            color: 'bg-gray-500'
          }
        ];

        const mockPermissions: Permission[] = [
          // Critical System Permissions
          { id: 'system_admin', name: 'System Administration', category: 'System', description: 'Full system administration access', riskLevel: 'critical', isRequired: false, dependencies: [] },
          { id: 'user_management', name: 'User Management', category: 'System', description: 'Create and manage user accounts', riskLevel: 'high', isRequired: false, dependencies: [] },
          { id: 'role_management', name: 'Role Management', category: 'System', description: 'Manage roles and permissions', riskLevel: 'critical', isRequired: false, dependencies: ['user_management'] },
          { id: 'system_config', name: 'System Configuration', category: 'System', description: 'Configure system settings', riskLevel: 'high', isRequired: false, dependencies: [] },
          { id: 'audit_logs', name: 'Audit Logs', category: 'System', description: 'Access audit and security logs', riskLevel: 'high', isRequired: false, dependencies: [] },
          
          // Patient Data Access
          { id: 'read_all_studies', name: 'Read All Studies', category: 'Patient Data', description: 'Access to all medical studies', riskLevel: 'high', isRequired: false, dependencies: [] },
          { id: 'read_assigned_studies', name: 'Read Assigned Studies', category: 'Patient Data', description: 'Access to assigned studies only', riskLevel: 'medium', isRequired: true, dependencies: [] },
          { id: 'read_educational_studies', name: 'Read Educational Studies', category: 'Patient Data', description: 'Access to de-identified educational content', riskLevel: 'low', isRequired: false, dependencies: [] },
          
          // Clinical Operations
          { id: 'create_reports', name: 'Create Reports', category: 'Clinical', description: 'Create and edit medical reports', riskLevel: 'high', isRequired: false, dependencies: ['read_assigned_studies'] },
          { id: 'approve_reports', name: 'Approve Reports', category: 'Clinical', description: 'Final approval of medical reports', riskLevel: 'critical', isRequired: false, dependencies: ['create_reports'] },
          { id: 'manage_protocols', name: 'Manage Protocols', category: 'Clinical', description: 'Manage imaging protocols', riskLevel: 'medium', isRequired: false, dependencies: [] },
          { id: 'view_protocols', name: 'View Protocols', category: 'Clinical', description: 'View imaging protocols', riskLevel: 'low', isRequired: false, dependencies: [] },
          { id: 'quality_control', name: 'Quality Control', category: 'Clinical', description: 'Quality assurance and control', riskLevel: 'medium', isRequired: false, dependencies: [] },
          
          // AI and Analytics
          { id: 'ai_analysis', name: 'AI Analysis', category: 'AI Tools', description: 'Full access to AI diagnostic tools', riskLevel: 'high', isRequired: false, dependencies: ['read_all_studies'] },
          { id: 'use_ai_tools', name: 'Use AI Tools', category: 'AI Tools', description: 'Standard AI tool access', riskLevel: 'medium', isRequired: false, dependencies: ['read_assigned_studies'] },
          { id: 'practice_tools', name: 'Practice Tools', category: 'AI Tools', description: 'Educational AI tools', riskLevel: 'low', isRequired: false, dependencies: [] },
          { id: 'view_analytics', name: 'View Analytics', category: 'Analytics', description: 'Access to system analytics', riskLevel: 'medium', isRequired: false, dependencies: [] },
          
          // Technical Operations
          { id: 'upload_studies', name: 'Upload Studies', category: 'Technical', description: 'Upload medical studies', riskLevel: 'medium', isRequired: false, dependencies: [] },
          { id: 'schedule_studies', name: 'Schedule Studies', category: 'Technical', description: 'Schedule imaging studies', riskLevel: 'medium', isRequired: false, dependencies: [] },
          { id: 'basic_measurements', name: 'Basic Measurements', category: 'Technical', description: 'Basic measurement tools', riskLevel: 'low', isRequired: false, dependencies: [] },
          
          // Educational
          { id: 'view_tutorials', name: 'View Tutorials', category: 'Educational', description: 'Access training materials', riskLevel: 'low', isRequired: false, dependencies: [] },
          { id: 'basic_viewing', name: 'Basic Viewing', category: 'Educational', description: 'Basic image viewing capabilities', riskLevel: 'low', isRequired: false, dependencies: [] }
        ];

        // Calculate permission conflicts
        const mockConflicts: PermissionConflict[] = [];
        
        mockRoles.forEach(role => {
          role.permissions.forEach(permissionId => {
            const permission = mockPermissions.find(p => p.id === permissionId);
            if (permission) {
              // Check for missing dependencies
              permission.dependencies.forEach(depId => {
                if (!role.permissions.includes(depId)) {
                  mockConflicts.push({
                    roleId: role.id,
                    permissionId: permissionId,
                    conflictType: 'missing_dependency',
                    description: `Missing required dependency: ${mockPermissions.find(p => p.id === depId)?.name}`
                  });
                }
              });
            }
          });
        });

        setRoles(mockRoles);
        setPermissions(mockPermissions);
        setConflicts(mockConflicts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching matrix data:', error);
        setLoading(false);
      }
    };

    fetchMatrixData();
  }, []);

  const filteredRoles = roles.filter(role => {
    if (!showInactive && role.status !== 'active') return false;
    if (selectedRoles.length > 0 && !selectedRoles.includes(role.id)) return false;
    return role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           role.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredPermissions = permissions.filter(permission => {
    if (filterCategory !== 'all' && permission.category !== filterCategory) return false;
    if (filterRiskLevel !== 'all' && permission.riskLevel !== filterRiskLevel) return false;
    if (selectedPermissions.length > 0 && !selectedPermissions.includes(permission.id)) return false;
    return permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           permission.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const categories = [...new Set(permissions.map(p => p.category))];
  const riskLevels = ['low', 'medium', 'high', 'critical'];

  const hasPermission = (roleId: string, permissionId: string): boolean => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.permissions.includes(permissionId) : false;
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConflictIcon = (roleId: string, permissionId: string) => {
    const conflict = conflicts.find(c => c.roleId === roleId && c.permissionId === permissionId);
    if (conflict) {
      return <AlertTriangle className="w-3 h-3 text-red-500" />;
    }
    return null;
  };

  const toggleRoleSelection = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const togglePermissionSelection = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const exportMatrix = () => {
    // Implementation for exporting the permission matrix
    console.log('Exporting permission matrix...');
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
          <h1 className="text-3xl font-bold text-gray-900">Permission Matrix</h1>
          <p className="text-gray-600 mt-1">Visual overview of roles and their assigned permissions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="w-4 h-4 mr-2" /> : <Grid className="w-4 h-4 mr-2" />}
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          <Button variant="outline" onClick={exportMatrix}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search roles and permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterRiskLevel} onValueChange={setFilterRiskLevel}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by risk level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            {riskLevels.map(level => (
              <SelectItem key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={(checked) => setShowInactive(checked as boolean)}
          />
          <label htmlFor="show-inactive" className="text-sm font-medium">
            Show inactive roles
          </label>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">{filteredRoles.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Permissions</p>
                <p className="text-2xl font-bold text-gray-900">{filteredPermissions.length}</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Permission Conflicts</p>
                <p className="text-2xl font-bold text-red-600">{conflicts.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
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
      </div>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Grid className="w-5 h-5 mr-2" />
            Permission Matrix
          </CardTitle>
          <CardDescription>
            Interactive matrix showing which roles have which permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 font-medium text-gray-900 sticky left-0 bg-white border-r">
                      Permission
                    </th>
                    {filteredRoles.map(role => (
                      <th key={role.id} className="text-center p-2 min-w-32">
                        <div className="flex flex-col items-center space-y-1">
                          <div className={`w-4 h-4 rounded-full ${role.color}`}></div>
                          <span className="text-xs font-medium truncate max-w-24" title={role.name}>
                            {role.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {role.userCount}
                          </Badge>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPermissions.map(permission => (
                    <tr key={permission.id} className="border-t hover:bg-gray-50">
                      <td className="p-2 sticky left-0 bg-white border-r">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{permission.name}</div>
                            <div className="text-xs text-gray-500">{permission.category}</div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Badge className={getRiskColor(permission.riskLevel)} variant="secondary">
                              {permission.riskLevel}
                            </Badge>
                            {permission.isRequired && (
                              <Badge variant="outline" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      {filteredRoles.map(role => (
                        <td key={role.id} className="p-2 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {hasPermission(role.id, permission.id) ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <X className="w-4 h-4 text-gray-300" />
                            )}
                            {getConflictIcon(role.id, permission.id)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRoles.map(role => (
                <div key={role.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${role.color}`}></div>
                      <div>
                        <h3 className="font-medium">{role.name}</h3>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{role.userCount} users</Badge>
                      {role.isSystem && <Lock className="w-4 h-4 text-orange-500" />}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {role.permissions.map(permissionId => {
                      const permission = permissions.find(p => p.id === permissionId);
                      if (!permission) return null;
                      
                      const hasConflict = conflicts.some(c => c.roleId === role.id && c.permissionId === permissionId);
                      
                      return (
                        <div key={permissionId} className={`flex items-center space-x-2 p-2 rounded ${hasConflict ? 'bg-red-50' : 'bg-gray-50'}`}>
                          <Check className="w-3 h-3 text-green-500" />
                          <span className="text-sm">{permission.name}</span>
                          <Badge className={getRiskColor(permission.riskLevel)} variant="secondary">
                            {permission.riskLevel}
                          </Badge>
                          {hasConflict && <AlertTriangle className="w-3 h-3 text-red-500" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Permission Conflicts Detected:</strong> {conflicts.length} conflicts found in the permission matrix.
            These may indicate missing dependencies or security risks that need to be addressed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PermissionMatrix; 