import React from 'react';
import { 
  Shield, Users, Lock, Key, 
  FileText, Activity, UserPlus, Settings,
  Eye, Edit, Trash2
} from 'lucide-react';
import RoleManagement from '@/components/access/RoleManagement';
import PermissionMatrix from '@/components/access/PermissionMatrix';
import UserRoleAssignment from '@/components/access/UserRoleAssignment';

export default function AccessControlDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-medsight-primary mb-2">
                Access Control Management
              </h1>
              <p className="text-slate-600">
                Manage user roles, permissions, and access policies
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-medsight-secondary rounded-full animate-pulse"></div>
                <span className="text-sm text-medsight-secondary font-medium">
                  Policies Enforced
                </span>
              </div>
              <div className="medsight-control-glass px-3 py-1 rounded-lg">
                <span className="text-sm text-slate-700">
                  Last Audit: 2 weeks ago
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Access Control Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Roles</p>
                <p className="text-2xl font-bold text-medsight-primary">23</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <Users className="w-6 h-6 text-medsight-primary" />
              </div>
            </div>
          </div>
          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Permissions</p>
                <p className="text-2xl font-bold text-medsight-primary">147</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <Key className="w-6 h-6 text-medsight-primary" />
              </div>
            </div>
          </div>
          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Access Policies</p>
                <p className="text-2xl font-bold text-medsight-primary">48</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <Lock className="w-6 h-6 text-medsight-primary" />
              </div>
            </div>
          </div>
          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Audit Events</p>
                <p className="text-2xl font-bold text-medsight-primary">12.4K</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <FileText className="w-6 h-6 text-medsight-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Access Control Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Role Management */}
          <div className="xl:col-span-2 space-y-6">
            <RoleManagement />
          </div>

          {/* Right Column - User Role Assignment */}
          <div className="space-y-6">
            <UserRoleAssignment />
          </div>
        </div>

        {/* Bottom Row - Permission Matrix */}
        <div className="grid grid-cols-1 gap-6">
          <PermissionMatrix />
        </div>

        {/* Quick Actions */}
        <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">
            Access Control Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="btn-medsight flex items-center justify-center space-x-2 p-4">
              <UserPlus className="w-5 h-5" />
              <span>Add New Role</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-4">
              <Key className="w-5 h-5" />
              <span>Create Permission</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-4">
              <Lock className="w-5 h-5" />
              <span>Define Policy</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-4">
              <Activity className="w-5 h-5" />
              <span>Run Audit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 