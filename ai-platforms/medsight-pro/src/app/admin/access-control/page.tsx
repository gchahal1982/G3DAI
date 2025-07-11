'use client';

import React from 'react';
import { Shield, Users, Lock, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import RoleManagement from '@/components/access/RoleManagement';
import PermissionMatrix from '@/components/access/PermissionMatrix';
import UserRoleAssignment from '@/components/access/UserRoleAssignment';

export default function AccessControlDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-medsight-primary mb-2">
                Access Control Dashboard
              </h1>
              <p className="text-slate-600">
                Manage medical professional roles, permissions, and access control
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="medsight-glass p-3 rounded-lg">
                <Shield className="w-6 h-6 text-medsight-primary" />
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Security Level</div>
                <div className="text-lg font-semibold text-medsight-primary">
                  HIPAA Compliant
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-primary/10">
                <Users className="w-6 h-6 text-medsight-primary" />
              </div>
              <CheckCircle className="w-5 h-5 text-medsight-normal" />
            </div>
            <div className="text-2xl font-bold text-medsight-primary mb-1">
              247
            </div>
            <div className="text-sm text-slate-600">Active Users</div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-secondary/10">
                <Shield className="w-6 h-6 text-medsight-secondary" />
              </div>
              <CheckCircle className="w-5 h-5 text-medsight-normal" />
            </div>
            <div className="text-2xl font-bold text-medsight-secondary mb-1">
              12
            </div>
            <div className="text-sm text-slate-600">Medical Roles</div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-accent/10">
                <Lock className="w-6 h-6 text-medsight-accent" />
              </div>
              <CheckCircle className="w-5 h-5 text-medsight-normal" />
            </div>
            <div className="text-2xl font-bold text-medsight-accent mb-1">
              45
            </div>
            <div className="text-sm text-slate-600">Permissions</div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-critical/10">
                <AlertTriangle className="w-6 h-6 text-medsight-critical" />
              </div>
              <AlertTriangle className="w-5 h-5 text-medsight-pending" />
            </div>
            <div className="text-2xl font-bold text-medsight-critical mb-1">
              3
            </div>
            <div className="text-sm text-slate-600">Access Violations</div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="border-b border-slate-200 mb-6">
            <nav className="flex space-x-8">
              <button className="py-2 px-1 border-b-2 border-medsight-primary text-medsight-primary font-medium">
                Role Management
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-slate-500 hover:text-medsight-primary">
                Permission Matrix
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-slate-500 hover:text-medsight-primary">
                User Assignment
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-slate-500 hover:text-medsight-primary">
                Security Audit
              </button>
            </nav>
          </div>

          {/* Role Management Section */}
          <div className="space-y-6">
            <RoleManagement />
          </div>
        </div>

        {/* Permission Matrix Section */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-medsight-primary">
                Medical Permission Matrix
              </h2>
              <p className="text-slate-600 mt-1">
                Configure access permissions for medical data and system functions
              </p>
            </div>
            <button className="btn-medsight">
              <Settings className="w-4 h-4 mr-2" />
              Configure Permissions
            </button>
          </div>
          <PermissionMatrix />
        </div>

        {/* User Role Assignment Section */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-medsight-primary">
                User Role Assignment
              </h2>
              <p className="text-slate-600 mt-1">
                Assign and manage medical professional roles
              </p>
            </div>
            <button className="btn-medsight">
              <Users className="w-4 h-4 mr-2" />
              Assign Roles
            </button>
          </div>
          <UserRoleAssignment />
        </div>

        {/* Security Compliance Footer */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-medsight-normal/10">
                <CheckCircle className="w-6 h-6 text-medsight-normal" />
              </div>
              <div>
                <div className="font-semibold text-medsight-primary">
                  HIPAA Compliance Active
                </div>
                <div className="text-sm text-slate-600">
                  All access controls meet medical regulatory requirements
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-slate-500">Last Audit</div>
                <div className="font-semibold text-medsight-primary">
                  2024-01-15
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-500">Next Review</div>
                <div className="font-semibold text-medsight-pending">
                  2024-02-15
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 