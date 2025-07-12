import React from 'react';
import { 
  Users, UserCheck, Search, Filter, 
  MoreVertical, Shield, Key, Edit,
  ArrowRight, Save
} from 'lucide-react';
import { medicalRoles } from '@/lib/access-control/medical-roles';

interface UserRoleAssignmentProps {
  className?: string;
}

export default function UserRoleAssignment({ className = '' }: UserRoleAssignmentProps) {
  const users = [
    { name: 'Dr. Sarah Chen', role: 'Radiologist', lastLogin: '2 hours ago', avatar: 'SC' },
    { name: 'Dr. Michael Rodriguez', role: 'Cardiologist', lastLogin: '5 hours ago', avatar: 'MR' },
    { name: 'Dr. Emily Johnson', role: 'Neurologist', lastLogin: '1 day ago', avatar: 'EJ' },
    { name: 'Dr. James Wilson', role: 'Surgeon', lastLogin: '3 days ago', avatar: 'JW' },
    { name: 'Dr. Lisa Park', role: 'Resident Physician', lastLogin: '1 week ago', avatar: 'LP' },
    { name: 'David Miller', role: 'Radiology Technician', lastLogin: '2 weeks ago', avatar: 'DM' },
  ];

  const getRoleColor = (role: string) => {
    if (role.includes('Admin')) return 'text-medsight-abnormal bg-medsight-abnormal/10';
    if (role.includes('Radiologist') || role.includes('Surgeon')) return 'text-medsight-primary bg-medsight-primary/10';
    if (role.includes('Physician') || role.includes('Cardiologist') || role.includes('Neurologist')) return 'text-medsight-ai-high bg-medsight-ai-high/10';
    if (role.includes('Resident') || role.includes('Technician')) return 'text-medsight-pending bg-medsight-pending/10';
    return 'text-slate-500 bg-slate-100';
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <UserCheck className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">User Role Assignment</h3>
            <p className="text-sm text-slate-600">Assign and manage user roles</p>
          </div>
        </div>
        <button className="btn-medsight flex items-center space-x-2 px-3 py-2">
          <Save className="w-4 h-4" />
          <span className="text-sm">Save All</span>
        </button>
      </div>

      {/* User Search and Filters */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="input-medsight pl-10 w-full text-sm"
          />
        </div>
        <button className="btn-medsight flex items-center space-x-2 px-3 py-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filter</span>
        </button>
      </div>

      {/* User Role Assignment List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {users.map((user, index) => (
          <div key={index} className="medsight-control-glass rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-medsight-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-medsight-primary">
                    {user.avatar}
                  </span>
                </div>
                <div>
                  <h5 className="font-medium text-slate-800">{user.name}</h5>
                  <p className="text-xs text-slate-600">Last login: {user.lastLogin}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-48">
                  <select 
                    defaultValue={user.role}
                    className="input-medsight w-full text-sm py-2"
                  >
                    <option disabled>Select a role</option>
                    {medicalRoles.map(role => (
                      <option key={role.name} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="p-1 hover:bg-slate-100 rounded">
                  <MoreVertical className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Assignment Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm text-slate-700">Total Users: {users.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-xs px-3 py-1">
              <Shield className="w-3 h-3 mr-1" />
              Manage Roles
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Key className="w-3 h-3 mr-1" />
              Manage Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 