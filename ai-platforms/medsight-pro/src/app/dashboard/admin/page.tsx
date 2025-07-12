import React from 'react';
import { Shield, Server, Users, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import SystemHealth from '@/components/admin/SystemHealth';
import UserManagement from '@/components/admin/UserManagement';
import MedicalCompliance from '@/components/admin/MedicalCompliance';
import SystemMetrics from '@/components/admin/SystemMetrics';
import SecurityStatus from '@/components/admin/SecurityStatus';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-medsight-primary mb-2">
                System Administration
              </h1>
              <p className="text-slate-600">
                Comprehensive system management and monitoring dashboard
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-medsight-secondary rounded-full animate-pulse"></div>
                <span className="text-sm text-medsight-secondary font-medium">
                  System Online
                </span>
              </div>
              <div className="medsight-control-glass px-3 py-1 rounded-lg">
                <span className="text-sm text-slate-700">
                  Last Updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">System Health</p>
                <p className="text-2xl font-bold text-medsight-secondary">98.7%</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-medsight-secondary" />
              </div>
            </div>
          </div>

          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Active Users</p>
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
                <p className="text-sm text-slate-600 mb-1">Security Score</p>
                <p className="text-2xl font-bold text-medsight-ai-high">A+</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <Shield className="w-6 h-6 text-medsight-ai-high" />
              </div>
            </div>
          </div>

          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Alerts</p>
                <p className="text-2xl font-bold text-medsight-pending">3</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-medsight-pending" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - System Health & Metrics */}
          <div className="lg:col-span-2 space-y-6">
            <SystemHealth />
            <SystemMetrics />
          </div>

          {/* Right Column - User Management & Security */}
          <div className="space-y-6">
            <UserManagement />
            <SecurityStatus />
          </div>
        </div>

        {/* Bottom Row - Medical Compliance */}
        <div className="grid grid-cols-1 gap-6">
          <MedicalCompliance />
        </div>

        {/* Quick Actions */}
        <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button className="btn-medsight flex items-center justify-center space-x-2 p-3">
              <Server className="w-4 h-4" />
              <span className="text-sm">System Restart</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-3">
              <Users className="w-4 h-4" />
              <span className="text-sm">Add User</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-3">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Security Scan</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-3">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Performance Check</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-3">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">View Logs</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-3">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Compliance Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 