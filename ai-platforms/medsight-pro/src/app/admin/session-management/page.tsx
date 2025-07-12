import React from 'react';
import { Shield, Activity, Clock, Users, AlertTriangle, CheckCircle, Settings, Eye } from 'lucide-react';
import SessionMonitoring from '@/components/auth/SessionMonitoring';

export default function SessionManagementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-medsight-primary mb-2">
                Enhanced Session Management
              </h1>
              <p className="text-slate-600">
                Comprehensive medical session monitoring, security, and compliance management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="medsight-glass p-3 rounded-lg">
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Security Status</div>
                <div className="text-lg font-semibold text-medsight-primary">
                  Medical Grade
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Management Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-primary/10">
              </div>
            </div>
            <div className="text-2xl font-bold text-medsight-primary mb-1">
              Real-time Monitoring
            </div>
            <div className="text-sm text-slate-600">
              Live session tracking with instant alerts and compliance monitoring
            </div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-secondary/10">
              </div>
            </div>
            <div className="text-2xl font-bold text-medsight-secondary mb-1">
              HIPAA Compliance
            </div>
            <div className="text-sm text-slate-600">
              Automated compliance checking and audit trail management
            </div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-accent/10">
              </div>
            </div>
            <div className="text-2xl font-bold text-medsight-accent mb-1">
              Timeout Management
            </div>
            <div className="text-sm text-slate-600">
              Medical-grade session timeout with emergency access protocols
            </div>
          </div>
        </div>

        {/* Session Configuration */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-medsight-primary">
                Session Configuration
              </h2>
              <p className="text-slate-600 mt-1">
                Configure medical session policies and security settings
              </p>
            </div>
            <button className="btn-medsight">
              Configure Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Session Timeout Settings */}
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <h3 className="font-semibold text-medsight-primary">Session Timeout</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Standard Timeout</span>
                  <span className="text-sm font-medium text-medsight-primary">30 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Emergency Timeout</span>
                  <span className="text-sm font-medium text-medsight-critical">15 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Resident Timeout</span>
                  <span className="text-sm font-medium text-medsight-secondary">20 min</span>
                </div>
              </div>
            </div>

            {/* Concurrent Sessions */}
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <h3 className="font-semibold text-medsight-primary">Concurrent Sessions</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Chief Physician</span>
                  <span className="text-sm font-medium text-medsight-primary">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Attending</span>
                  <span className="text-sm font-medium text-medsight-secondary">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Resident</span>
                  <span className="text-sm font-medium text-medsight-pending">1</span>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <h3 className="font-semibold text-medsight-primary">Security Settings</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">IP Validation</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Device Verification</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Audit Logging</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Monitoring Component */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-medsight-primary">
                Active Session Monitoring
              </h2>
              <p className="text-slate-600 mt-1">
                Real-time session tracking and security monitoring
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-medsight-normal rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600">Live Monitoring</span>
              </div>
              <button className="btn-medsight">
                View Details
              </button>
            </div>
          </div>

        </div>

        {/* Security Alerts */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-medsight-primary">
                Security Alerts & Notifications
              </h2>
              <p className="text-slate-600 mt-1">
                Recent security events and compliance alerts
              </p>
            </div>
            <button className="btn-medsight">
              View All Alerts
            </button>
          </div>

          <div className="space-y-4">
            {/* Alert Items */}
            <div className="medsight-control-glass p-4 rounded-lg border-l-4 border-medsight-critical">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="font-medium text-medsight-critical">
                      Suspicious Login Detected
                    </div>
                    <div className="text-sm text-slate-600">
                      Dr. David Kim - Unknown location access attempt
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  2 minutes ago
                </div>
              </div>
            </div>

            <div className="medsight-control-glass p-4 rounded-lg border-l-4 border-medsight-pending">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="font-medium text-medsight-pending">
                      Session Timeout Warning
                    </div>
                    <div className="text-sm text-slate-600">
                      Multiple sessions expiring in 5 minutes
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  5 minutes ago
                </div>
              </div>
            </div>

            <div className="medsight-control-glass p-4 rounded-lg border-l-4 border-medsight-normal">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="font-medium text-medsight-normal">
                      Compliance Check Passed
                    </div>
                    <div className="text-sm text-slate-600">
                      All active sessions HIPAA compliant
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  10 minutes ago
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Dashboard */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-medsight-primary">
                Compliance Dashboard
              </h2>
              <p className="text-slate-600 mt-1">
                Medical regulatory compliance monitoring and reporting
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-slate-500">Compliance Score</div>
                <div className="text-lg font-semibold text-medsight-normal">
                  96.8%
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="medsight-control-glass p-4 rounded-lg text-center">
              <div className="text-sm font-medium text-medsight-normal">HIPAA Compliant</div>
              <div className="text-xs text-slate-500">All requirements met</div>
            </div>

            <div className="medsight-control-glass p-4 rounded-lg text-center">
              <div className="text-sm font-medium text-medsight-normal">Audit Trail</div>
              <div className="text-xs text-slate-500">Complete logging</div>
            </div>

            <div className="medsight-control-glass p-4 rounded-lg text-center">
              <div className="text-sm font-medium text-medsight-normal">Access Control</div>
              <div className="text-xs text-slate-500">Role-based verified</div>
            </div>

            <div className="medsight-control-glass p-4 rounded-lg text-center">
              <div className="text-sm font-medium text-medsight-pending">Data Protection</div>
              <div className="text-xs text-slate-500">Minor issues detected</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 