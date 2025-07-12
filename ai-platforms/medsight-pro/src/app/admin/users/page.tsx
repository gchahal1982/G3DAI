import React from 'react';
import { 
  Users, UserPlus, Shield, Activity,
  Star, Award, Briefcase, Calendar
} from 'lucide-react';
import UserList from '@/components/users/UserList';
import UserProfile from '@/components/users/UserProfile';
import MedicalCredentials from '@/components/users/MedicalCredentials';
import UserCreation from '@/components/users/UserCreation';

export default function UserManagementDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-medsight-primary mb-2">
                User Management
              </h1>
              <p className="text-slate-600">
                Manage medical professionals, credentials, and user profiles
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-medsight-secondary rounded-full animate-pulse"></div>
                <span className="text-sm text-medsight-secondary font-medium">
                  System Active
                </span>
              </div>
              <div className="medsight-control-glass px-3 py-1 rounded-lg">
                <span className="text-sm text-slate-700">
                  Last Sync: 2 min ago
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-medsight-primary">1,247</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <Users className="w-6 h-6 text-medsight-primary" />
              </div>
            </div>
          </div>
          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Verified Credentials</p>
                <p className="text-2xl font-bold text-medsight-ai-high">98.2%</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <Award className="w-6 h-6 text-medsight-ai-high" />
              </div>
            </div>
          </div>
          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Active Roles</p>
                <p className="text-2xl font-bold text-medsight-primary">23</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <Briefcase className="w-6 h-6 text-medsight-primary" />
              </div>
            </div>
          </div>
          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">New Users This Month</p>
                <p className="text-2xl font-bold text-medsight-secondary">48</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <UserPlus className="w-6 h-6 text-medsight-secondary" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - User List */}
          <div className="xl:col-span-2 space-y-6">
            <UserList />
          </div>

          {/* Right Column - User Profile & Credentials */}
          <div className="space-y-6">
            <UserProfile />
            <MedicalCredentials />
          </div>
        </div>
        
        {/* User Creation Component would likely be a modal, triggered from UserList or a quick action */}
        {/* <UserCreation /> */}

        {/* Quick Actions */}
        <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">
            User Management Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="btn-medsight flex items-center justify-center space-x-2 p-4">
              <UserPlus className="w-5 h-5" />
              <span>Add New User</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-4">
              <Users className="w-5 h-5" />
              <span>Import Users</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-4">
              <Shield className="w-5 h-5" />
              <span>Manage Roles</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-4">
              <Activity className="w-5 h-5" />
              <span>View Activity Logs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 