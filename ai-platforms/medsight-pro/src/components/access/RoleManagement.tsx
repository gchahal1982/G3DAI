import React from 'react';
import { 
  Users, Key, Shield, UserPlus, 
  Settings, Search, Filter, MoreVertical,
  Eye, Edit, Trash2
} from 'lucide-react';
import { medicalRoles } from '@/lib/access-control/medical-roles';
import { medicalPermissions } from '@/lib/access-control/medical-permissions';

interface RoleManagementProps {
  className?: string;
}

export default function RoleManagement({ className = '' }: RoleManagementProps) {

  const getRoleColor = (role: string) => {
    if (role.includes('Admin')) return 'text-medsight-abnormal bg-medsight-abnormal/10';
    if (role.includes('Radiologist') || role.includes('Surgeon')) return 'text-medsight-primary bg-medsight-primary/10';
    if (role.includes('Physician') || role.includes('Cardiologist') || role.includes('Neurologist')) return 'text-medsight-ai-high bg-medsight-ai-high/10';
    if (role.includes('Resident') || role.includes('Technician')) return 'text-medsight-pending bg-medsight-pending/10';
    return 'text-slate-500 bg-slate-100';
  };

  const getPermissionCountColor = (count: number) => {
    if (count >= 50) return 'text-medsight-abnormal';
    if (count >= 20) return 'text-medsight-primary';
    if (count >= 10) return 'text-medsight-pending';
    return 'text-medsight-secondary';
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <Shield className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">Role Management</h3>
            <p className="text-sm text-slate-600">Define and manage medical professional roles</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn-medsight flex items-center space-x-2 px-3 py-2">
            <UserPlus className="w-4 h-4" />
            <span className="text-sm">Add Role</span>
          </button>
        </div>
      </div>

      {/* Role Search and Filters */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search roles..."
            className="input-medsight pl-10 w-full text-sm"
          />
        </div>
        <button className="btn-medsight flex items-center space-x-2 px-3 py-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filter</span>
        </button>
      </div>

      {/* Roles Table */}
      <div className="medsight-control-glass rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/10">
              <tr>
                <th className="px-6 py-3 font-medium text-slate-600">Role Name</th>
                <th className="px-6 py-3 font-medium text-slate-600">Description</th>
                <th className="px-6 py-3 font-medium text-slate-600 text-center">Users</th>
                <th className="px-6 py-3 font-medium text-slate-600 text-center">Permissions</th>
                <th className="px-6 py-3 font-medium text-slate-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {medicalRoles.map((role, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role.name)}`}>
                      {role.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{role.description}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-800">{role.userCount}</td>
                  <td className="px-6 py-4 text-center font-medium">
                    <span className={getPermissionCountColor(role.permissionCount)}>
                      {role.permissionCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button className="p-1 hover:bg-slate-100 rounded">
                        <Eye className="w-4 h-4 text-slate-500" />
                      </button>
                      <button className="p-1 hover:bg-slate-100 rounded">
                        <Edit className="w-4 h-4 text-slate-500" />
                      </button>
                      <button className="p-1 hover:bg-slate-100 rounded">
                        <Trash2 className="w-4 h-4 text-medsight-abnormal" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Management Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm text-slate-700">Total Roles: {medicalRoles.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-xs px-3 py-1">
              <Key className="w-3 h-3 mr-1" />
              Manage Permissions
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Settings className="w-3 h-3 mr-1" />
              Role Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 