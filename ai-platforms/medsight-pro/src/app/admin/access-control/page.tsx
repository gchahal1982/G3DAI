'use client';

import React, { useState } from 'react';
import { 
  Shield, Users, Lock, Key, 
  Settings, BarChart, Eye, Edit, Trash2 
} from 'lucide-react';
import RoleManagement from '@/components/access/RoleManagement';
import PermissionMatrix from '@/components/access/PermissionMatrix';
import UserRoleAssignment from '@/components/access/UserRoleAssignment';

export default function AccessControlDashboard() {
  const [roles, setRoles] = useState([
    { id: 'admin', name: 'System Administrator', permissions: ['*'] },
    { id: 'radiologist', name: 'Radiologist', permissions: ['study:read', 'viewer:annotate'] },
    { id: 'technician', name: 'Technician', permissions: ['study:upload'] },
  ]);

  const [users, setUsers] = useState([
    { id: 'user1', name: 'Dr. Alice', email: 'alice@hospital.com', currentRole: 'radiologist' },
    { id: 'user2', name: 'Bob', email: 'bob@hospital.com', currentRole: 'technician' },
    { id: 'user3', name: 'Charlie', email: 'charlie@hospital.com', currentRole: 'technician' },
  ]);

  const allPermissions = [
      { id: 'patient:read', name: 'View Patient Data', category: 'Patient Data' },
      { id: 'study:read', name: 'View Studies', category: 'Imaging' },
      { id: 'study:upload', name: 'Upload New Studies', category: 'Imaging' },
      { id: 'viewer:annotate', name: 'Create Annotations', category: 'Imaging' },
  ];

  const handlePermissionChange = (roleId: string, permissionId: string, hasPermission: boolean) => {
    setRoles(roles.map(role => {
      if (role.id === roleId) {
        const newPermissions = hasPermission
          ? [...role.permissions, permissionId]
          : role.permissions.filter(p => p !== permissionId);
        return { ...role, permissions: newPermissions };
      }
      return role;
    }));
  };

  const handleAssignRole = (userId: string, roleId: string): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        setUsers(users.map(u => u.id === userId ? { ...u, currentRole: roleId } : u));
        resolve();
      }, 500);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Access Control</h1>
        <div className="flex space-x-2">
          {/* Add actions here */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RoleManagement />
          <PermissionMatrix roles={roles} permissions={allPermissions} onPermissionChange={handlePermissionChange} />
        </div>
        <div className="space-y-6">
          <UserRoleAssignment users={users} roles={roles} onAssignRole={handleAssignRole} />
        </div>
      </div>
    </div>
  );
} 
 