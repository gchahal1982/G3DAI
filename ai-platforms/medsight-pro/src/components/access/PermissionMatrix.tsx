'use client';

import { useState } from 'react';
import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface Permission {
  id: string;
  name: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

interface PermissionMatrixProps {
  roles: Role[];
  permissions: Permission[];
  onPermissionChange: (roleId: string, permissionId: string, hasPermission: boolean) => void;
}

export default function PermissionMatrix({ roles, permissions, onPermissionChange }: PermissionMatrixProps) {
  const [highlightedRole, setHighlightedRole] = useState<string | null>(null);
  const [highlightedPermission, setHighlightedPermission] = useState<string | null>(null);

  const groupedPermissions = permissions.reduce((acc, p) => {
    acc[p.category] = acc[p.category] || [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="medsight-glass p-6 rounded-xl overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Permission Matrix</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
              Permission
            </th>
            {roles.map(role => (
              <th 
                key={role.id} 
                scope="col" 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                onMouseEnter={() => setHighlightedRole(role.id)}
                onMouseLeave={() => setHighlightedRole(null)}
              >
                {role.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(groupedPermissions).map(([category, perms]) => (
            <>
              <tr key={category} className="bg-gray-50">
                <td colSpan={roles.length + 1} className="px-6 py-2 text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">
                  {category}
                </td>
              </tr>
              {perms.map((permission, pIndex) => (
                <tr 
                  key={permission.id} 
                  className={`${pIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  onMouseEnter={() => setHighlightedPermission(permission.id)}
                  onMouseLeave={() => setHighlightedPermission(null)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-inherit z-10">
                    {permission.name}
                  </td>
                  {roles.map(role => (
                    <td 
                      key={`${role.id}-${permission.id}`} 
                      className={`px-6 py-4 whitespace-nowrap text-center transition-colors ${
                        highlightedRole === role.id || highlightedPermission === permission.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-medsight-primary focus:ring-medsight-primary cursor-pointer"
                        checked={role.permissions.includes(permission.id)}
                        onChange={(e) => onPermissionChange(role.id, permission.id, e.target.checked)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
