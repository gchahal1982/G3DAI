'use client';
import React, { useState } from 'react';
import { 
  Key, Shield, Users, Lock, 
  CheckCircle, XCircle, MoreVertical
} from 'lucide-react';
import { medicalRoles } from '@/lib/access-control/medical-roles';
import { medicalPermissions, permissionCategories } from '@/lib/access-control/medical-permissions';

interface PermissionMatrixProps {
  className?: string;
}

export default function PermissionMatrix({ className = '' }: PermissionMatrixProps) {
  const [selectedCategory, setSelectedCategory] = useState(permissionCategories[0]);

  const filteredPermissions = medicalPermissions.filter(p => p.category === selectedCategory);

  const hasPermission = (role: any, permissionId: string) => {
    if (role.permissions.includes('*')) return true;
    if (role.permissions.includes(`${permissionId.split(':')[0]}:*:*`)) return true;
    if (role.permissions.includes(`${permissionId.split(':')[0]}:${permissionId.split(':')[1]}:*`)) return true;
    return role.permissions.includes(permissionId);
  };

  const getRoleColor = (role: string) => {
    if (role.includes('Admin')) return 'text-medsight-abnormal';
    if (role.includes('Radiologist') || role.includes('Surgeon')) return 'text-medsight-primary';
    if (role.includes('Physician') || role.includes('Cardiologist') || role.includes('Neurologist')) return 'text-medsight-ai-high';
    if (role.includes('Resident') || role.includes('Technician')) return 'text-medsight-pending';
    return 'text-slate-500';
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <Key className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">Permission Matrix</h3>
            <p className="text-sm text-slate-600">Detailed role-based permission management</p>
          </div>
        </div>
      </div>

      {/* Permission Category Filter */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {permissionCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${selectedCategory === category 
                  ? 'btn-medsight shadow-md' 
                  : 'bg-white/50 hover:bg-white/80'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="medsight-control-glass rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/10">
              <tr>
                <th className="px-6 py-3 font-medium text-slate-600 text-left sticky left-0 bg-white/10 z-10 w-1/4">Permission</th>
                {medicalRoles.map((role) => (
                  <th key={role.name} className="px-6 py-3 font-medium text-slate-600 text-center">
                    <span className={getRoleColor(role.name)}>{role.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {filteredPermissions.map((permission) => (
                <tr key={permission.id}>
                  <td className="px-6 py-4 sticky left-0 bg-white/50 z-10 w-1/4">
                    <p className="font-medium text-slate-800">{permission.id}</p>
                    <p className="text-xs text-slate-600">{permission.description}</p>
                  </td>
                  {medicalRoles.map((role) => (
                    <td key={`${role.name}-${permission.id}`} className="px-6 py-4 text-center">
                      {hasPermission(role, permission.id) ? (
                        <CheckCircle className="w-5 h-5 text-medsight-secondary mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {/* Permission Matrix Actions */}
       <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm text-slate-700">
              Showing {filteredPermissions.length} permissions for {selectedCategory}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-xs px-3 py-1">
              Save Changes
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              Reset Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 