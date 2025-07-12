import React from 'react';
import { 
  Users, Search, Filter, MoreVertical, 
  Eye, Edit, Trash2, CheckCircle, 
  Clock, AlertTriangle, UserPlus, Download
} from 'lucide-react';

interface UserListProps {
  className?: string;
}

export default function UserList({ className = '' }: UserListProps) {
  const users = [
    { name: 'Dr. Sarah Chen', role: 'Radiologist', email: 'sarah.chen@hospital.com', lastActive: '2 min ago', status: 'online', avatar: 'SC' },
    { name: 'Dr. Michael Rodriguez', role: 'Cardiologist', email: 'michael.r@hospital.com', lastActive: '5 min ago', status: 'online', avatar: 'MR' },
    { name: 'Dr. Emily Johnson', role: 'Neurologist', email: 'emily.j@hospital.com', lastActive: '1 hour ago', status: 'away', avatar: 'EJ' },
    { name: 'Dr. James Wilson', role: 'Surgeon', email: 'james.w@hospital.com', lastActive: '3 hours ago', status: 'offline', avatar: 'JW' },
    { name: 'Dr. Lisa Park', role: 'Resident Physician', email: 'lisa.p@hospital.com', lastActive: '12 hours ago', status: 'offline', avatar: 'LP' },
    { name: 'David Miller', role: 'Radiology Technician', email: 'david.m@hospital.com', lastActive: '1 day ago', status: 'offline', avatar: 'DM' },
    { name: 'Dr. William Brown', role: 'System Administrator', email: 'william.b@hospital.com', lastActive: '2 days ago', status: 'offline', avatar: 'WB' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-medsight-secondary';
      case 'away': return 'bg-medsight-pending';
      case 'offline': return 'bg-slate-400';
      default: return 'bg-slate-400';
    }
  };

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
            <Users className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">All Users</h3>
            <p className="text-sm text-slate-600">Browse and manage all medical professionals</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn-medsight flex items-center space-x-2 px-3 py-2">
            <UserPlus className="w-4 h-4" />
            <span className="text-sm">Add User</span>
          </button>
          <button className="btn-medsight flex items-center space-x-2 px-3 py-2">
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* User Search and Filters */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, role, or email..."
            className="input-medsight pl-10 w-full text-sm"
          />
        </div>
        <button className="btn-medsight flex items-center space-x-2 px-3 py-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filters</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="medsight-control-glass rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/10">
              <tr>
                <th className="px-6 py-3 font-medium text-slate-600">Name</th>
                <th className="px-6 py-3 font-medium text-slate-600">Role</th>
                <th className="px-6 py-3 font-medium text-slate-600">Last Active</th>
                <th className="px-6 py-3 font-medium text-slate-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {users.map((user, index) => (
                <tr key={index} className="hover:bg-white/5 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-medsight-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-medsight-primary">
                            {user.avatar}
                          </span>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}></div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-600">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.lastActive}</td>
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

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing 1 to {users.length} of {users.length} users
        </p>
        <div className="flex items-center space-x-2">
          <button className="btn-medsight text-xs px-3 py-1" disabled>Previous</button>
          <button className="btn-medsight text-xs px-3 py-1">Next</button>
        </div>
      </div>
    </div>
  );
} 