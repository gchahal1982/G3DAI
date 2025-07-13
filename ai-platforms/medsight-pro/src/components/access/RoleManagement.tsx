'use client';

import { useState } from 'react';
import { 
  UsersIcon, 
  ShieldCheckIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  CheckIcon,
  XMarkIcon, 
  ChevronDownIcon, 
  ChevronRightIcon 
} from '@heroicons/react/24/outline';

interface Permission {
  id: string;
  name: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
}

const allPermissions: Permission[] = [
  // Patient Data
  { id: 'patient:read', name: 'View Patient Data', category: 'Patient Data' },
  { id: 'patient:write', name: 'Edit Patient Data', category: 'Patient Data' },
  { id: 'patient:anonymize', name: 'Anonymize Patient Data', category: 'Patient Data' },
  
  // Study & Imaging
  { id: 'study:read', name: 'View Studies', category: 'Imaging' },
  { id: 'study:upload', name: 'Upload New Studies', category: 'Imaging' },
  { id: 'study:delete', name: 'Delete Studies', category: 'Imaging' },
  { id: 'study:export', name: 'Export Studies', category: 'Imaging' },
  { id: 'viewer:annotate', name: 'Create Annotations', category: 'Imaging' },
  { id: 'viewer:measure', name: 'Use Measurement Tools', category: 'Imaging' },

  // AI & Analytics
  { id: 'ai:run', name: 'Run AI Analysis', category: 'AI & Analytics' },
  { id: 'ai:validate', name: 'Validate AI Results', category: 'AI & Analytics' },
  { id: 'analytics:read', name: 'View Analytics Dashboards', category: 'AI & Analytics' },

  // User Management
  { id: 'user:manage', name: 'Manage Users', category: 'Admin' },
  { id: 'roles:manage', name: 'Manage Roles & Permissions', category: 'Admin' },

  // System
  { id: 'system:health', name: 'View System Health', category: 'System' },
  { id: 'system:config', name: 'Configure System Settings', category: 'System' },
  { id: 'audit:read', name: 'View Audit Logs', category: 'System' },
];

const initialRoles: Role[] = [
  { id: 'admin', name: 'System Administrator', description: 'Full access to all system features and settings.', permissions: allPermissions.map(p => p.id), isSystemRole: true },
  { id: 'radiologist', name: 'Radiologist', description: 'Can view, analyze, and report on studies.', permissions: ['patient:read', 'study:read', 'study:export', 'viewer:annotate', 'viewer:measure', 'ai:run', 'ai:validate'], isSystemRole: true },
  { id: 'technician', name: 'Technician', description: 'Can upload and manage studies.', permissions: ['study:upload', 'study:read'], isSystemRole: false },
  { id: 'researcher', name: 'Researcher', description: 'Access to anonymized data for research purposes.', permissions: ['patient:read', 'patient:anonymize', 'study:read', 'analytics:read'], isSystemRole: false },
];

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set(['admin', 'radiologist']));

  const handleEdit = (role: Role) => {
    setEditingRole({ ...role });
  };

  const handleSave = () => {
    if (!editingRole) return;
    
    if (isCreating) {
      setRoles([...roles, { ...editingRole, id: `role_${Date.now()}` }]);
    } else {
      setRoles(roles.map(r => r.id === editingRole.id ? editingRole : r));
    }
    
    setEditingRole(null);
    setIsCreating(false);
  };
  
  const handleCancel = () => {
    setEditingRole(null);
    setIsCreating(false);
  };
  
  const handleCreate = () => {
    setIsCreating(true);
    setEditingRole({ id: '', name: '', description: '', permissions: [], isSystemRole: false });
  };
  
  const handleDelete = (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(r => r.id !== roleId));
    }
  };

  const togglePermission = (permissionId: string) => {
    if (!editingRole) return;
    
    const newPermissions = editingRole.permissions.includes(permissionId)
      ? editingRole.permissions.filter(p => p !== permissionId)
      : [...editingRole.permissions, permissionId];
      
    setEditingRole({ ...editingRole, permissions: newPermissions });
  };

  const toggleExpandRole = (roleId: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  const groupedPermissions = allPermissions.reduce((acc, p) => {
    acc[p.category] = acc[p.category] || [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  const renderRoleForm = () => (
    <div className="medsight-glass p-6 rounded-xl mt-4 space-y-4">
      <h3 className="text-lg font-medium">{isCreating ? 'Create New Role' : `Editing: ${editingRole?.name}`}</h3>
      <div>
        <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">Role Name</label>
        <input
          type="text"
          id="roleName"
          value={editingRole?.name || ''}
          onChange={(e) => setEditingRole({ ...editingRole!, name: e.target.value })}
          className="input-medsight mt-1 block w-full"
        />
      </div>
      <div>
        <label htmlFor="roleDescription" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="roleDescription"
          rows={3}
          value={editingRole?.description || ''}
          onChange={(e) => setEditingRole({ ...editingRole!, description: e.target.value })}
          className="input-medsight mt-1 block w-full"
        />
      </div>
      <div>
        <h4 className="text-md font-medium">Permissions</h4>
        <div className="mt-2 space-y-2">
          {Object.entries(groupedPermissions).map(([category, permissions]) => (
            <div key={category}>
              <h5 className="font-semibold text-gray-800">{category}</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
                {permissions.map(p => (
                  <label key={p.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingRole?.permissions.includes(p.id)}
                      onChange={() => togglePermission(p.id)}
                      className="h-4 w-4 rounded border-gray-300 text-medsight-primary focus:ring-medsight-primary"
                    />
                    <span className="text-sm">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <button onClick={handleCancel} className="btn-medsight-secondary">Cancel</button>
        <button onClick={handleSave} className="btn-medsight">
          <CheckIcon className="w-4 h-4 mr-2" />
          Save Role
        </button>
      </div>
    </div>
  );

  return (
    <div className="medsight-glass p-6 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className="w-6 h-6 text-medsight-primary" />
          <h2 className="text-xl font-semibold">Role Management</h2>
        </div>
        <button onClick={handleCreate} className="btn-medsight">
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Role
        </button>
      </div>

      {editingRole && renderRoleForm()}

      <div className="mt-6 space-y-2">
        {roles.map(role => (
          <div key={role.id} className="border rounded-lg">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => toggleExpandRole(role.id)}>
              <div className="flex items-center space-x-3">
                {expandedRoles.has(role.id) ? (
                  <ChevronDownIcon className="w-5 h-5" />
                ) : (
                  <ChevronRightIcon className="w-5 h-5" />
                )}
                <h3 className="font-medium text-lg">{role.name}</h3>
                {role.isSystemRole && <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">System Role</span>}
              </div>
              <div className="flex items-center space-x-3">
                <p className="text-sm text-gray-600">{role.description}</p>
                <button onClick={(e) => { e.stopPropagation(); handleEdit(role); }} className="p-1 text-gray-500 hover:text-blue-600">
                  <PencilIcon className="w-4 h-4" />
                </button>
                {!role.isSystemRole && (
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(role.id); }} className="p-1 text-gray-500 hover:text-red-600">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {expandedRoles.has(role.id) && (
              <div className="p-4 border-t">
                <h4 className="font-semibold mb-2">Permissions ({role.permissions.length}/{allPermissions.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {allPermissions.map(p => (
                    <div key={p.id} className={`flex items-center space-x-2 p-1 rounded ${role.permissions.includes(p.id) ? 'text-green-700' : 'text-gray-400'}`}>
                      {role.permissions.includes(p.id) ? <ShieldCheckIcon className="w-4 h-4" /> : <ShieldCheckIcon className="w-4 h-4" />}
                      <span className="text-sm">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
