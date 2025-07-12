import React from 'react';
import { 
  Users, UserPlus, UserCheck, UserX, 
  Shield, Clock, Activity, Search,
  Filter, MoreVertical, Edit, Trash2
} from 'lucide-react';

interface UserManagementProps {
  className?: string;
}

export default function UserManagement({ className = '' }: UserManagementProps) {
  const userStats = [
    {
      label: 'Total Users',
      value: '1,247',
      change: '+12',
      period: 'this week',
      icon: Users,
      color: 'text-medsight-primary'
    },
    {
      label: 'Active Users',
      value: '987',
      change: '+8',
      period: 'today',
      icon: UserCheck,
      color: 'text-medsight-secondary'
    },
    {
      label: 'Pending',
      value: '23',
      change: '-3',
      period: 'this week',
      icon: Clock,
      color: 'text-medsight-pending'
    },
    {
      label: 'Inactive',
      value: '237',
      change: '+7',
      period: 'this month',
      icon: UserX,
      color: 'text-slate-500'
    }
  ];

  const recentUsers = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Radiologist',
      organization: 'Metro General Hospital',
      lastActive: '2 min ago',
      status: 'online',
      avatar: 'SC'
    },
    {
      name: 'Dr. Michael Rodriguez',
      role: 'Cardiologist',
      organization: 'Heart Center',
      lastActive: '5 min ago',
      status: 'online',
      avatar: 'MR'
    },
    {
      name: 'Dr. Emily Johnson',
      role: 'Neurologist',
      organization: 'Brain Institute',
      lastActive: '1 hour ago',
      status: 'away',
      avatar: 'EJ'
    },
    {
      name: 'Dr. James Wilson',
      role: 'Orthopedic Surgeon',
      organization: 'Orthopedic Center',
      lastActive: '3 hours ago',
      status: 'offline',
      avatar: 'JW'
    },
    {
      name: 'Dr. Lisa Park',
      role: 'Pediatrician',
      organization: 'Children\'s Hospital',
      lastActive: '12 hours ago',
      status: 'offline',
      avatar: 'LP'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-medsight-secondary';
      case 'away': return 'bg-medsight-pending';
      case 'offline': return 'bg-slate-400';
      default: return 'bg-slate-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'text-medsight-secondary';
      case 'away': return 'text-medsight-pending';
      case 'offline': return 'text-slate-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <Users className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">User Management</h3>
            <p className="text-sm text-slate-600">User overview and management</p>
          </div>
        </div>
        <button className="btn-medsight flex items-center space-x-2 px-3 py-2">
          <UserPlus className="w-4 h-4" />
          <span className="text-sm">Add User</span>
        </button>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {userStats.map((stat, index) => (
          <div key={index} className="medsight-control-glass rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className={`text-xs ${stat.change.startsWith('+') ? 'text-medsight-secondary' : 'text-medsight-abnormal'}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-600">{stat.label}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.period}</p>
            </div>
          </div>
        ))}
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

      {/* Recent Users */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Recent Users</h4>
        <div className="space-y-3">
          {recentUsers.map((user, index) => (
            <div key={index} className="medsight-control-glass rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-medsight-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-medsight-primary">
                        {user.avatar}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-slate-800">{user.name}</h5>
                      <span className={`text-xs ${getStatusText(user.status)}`}>
                        {user.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{user.role} • {user.organization}</p>
                    <p className="text-xs text-slate-500">Last active: {user.lastActive}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 hover:bg-slate-100 rounded">
                    <Edit className="w-4 h-4 text-slate-500" />
                  </button>
                  <button className="p-1 hover:bg-slate-100 rounded">
                    <MoreVertical className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm text-slate-700">User Actions</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-xs px-3 py-1">
              <Activity className="w-3 h-3 mr-1" />
              View All
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <UserPlus className="w-3 h-3 mr-1" />
              Bulk Import
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Shield className="w-3 h-3 mr-1" />
              Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 