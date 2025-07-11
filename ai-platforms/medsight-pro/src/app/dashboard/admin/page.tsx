import React from 'react';
import { 
  Shield, 
  Users, 
  Activity, 
  Database, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  TrendingUp,
  Clock,
  Server,
  Monitor,
  Zap,
  Lock,
  FileText,
  Bell
} from 'lucide-react';
import SystemHealth from '@/components/admin/SystemHealth';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-medsight-primary mb-2">
                Medical System Administration
              </h1>
              <p className="text-slate-600">
                Comprehensive management and monitoring of the MedSight Pro platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="medsight-glass p-3 rounded-lg">
                <Shield className="w-6 h-6 text-medsight-primary" />
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Admin Access</div>
                <div className="text-lg font-semibold text-medsight-primary">
                  Full Control
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
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
            <div className="text-xs text-slate-500">
              12 logged in now
            </div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-secondary/10">
                <Activity className="w-6 h-6 text-medsight-secondary" />
              </div>
              <TrendingUp className="w-5 h-5 text-medsight-normal" />
            </div>
            <div className="text-2xl font-bold text-medsight-secondary mb-1">
              99.9%
            </div>
            <div className="text-sm text-slate-600">System Uptime</div>
            <div className="text-xs text-slate-500">
              3 days, 14 hours
            </div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-accent/10">
                <Database className="w-6 h-6 text-medsight-accent" />
              </div>
              <CheckCircle className="w-5 h-5 text-medsight-normal" />
            </div>
            <div className="text-2xl font-bold text-medsight-accent mb-1">
              2,847
            </div>
            <div className="text-sm text-slate-600">DICOM Studies</div>
            <div className="text-xs text-slate-500">
              156 processed today
            </div>
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
            <div className="text-sm text-slate-600">Security Alerts</div>
            <div className="text-xs text-slate-500">
              Requires attention
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-medsight-primary">
                Administrative Actions
              </h2>
              <p className="text-slate-600 mt-1">
                Quick access to common administrative tasks
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="medsight-control-glass p-4 rounded-lg hover:bg-medsight-primary/5 transition-colors text-left">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="w-5 h-5 text-medsight-primary" />
                <h3 className="font-medium text-medsight-primary">User Management</h3>
              </div>
              <p className="text-sm text-slate-600">
                Manage medical professional accounts and permissions
              </p>
            </button>

            <button className="medsight-control-glass p-4 rounded-lg hover:bg-medsight-secondary/5 transition-colors text-left">
              <div className="flex items-center space-x-3 mb-3">
                <Settings className="w-5 h-5 text-medsight-secondary" />
                <h3 className="font-medium text-medsight-secondary">System Configuration</h3>
              </div>
              <p className="text-sm text-slate-600">
                Configure medical system settings and parameters
              </p>
            </button>

            <button className="medsight-control-glass p-4 rounded-lg hover:bg-medsight-accent/5 transition-colors text-left">
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="w-5 h-5 text-medsight-accent" />
                <h3 className="font-medium text-medsight-accent">Security Center</h3>
              </div>
              <p className="text-sm text-slate-600">
                Monitor security events and compliance status
              </p>
            </button>

            <button className="medsight-control-glass p-4 rounded-lg hover:bg-medsight-ai-high/5 transition-colors text-left">
              <div className="flex items-center space-x-3 mb-3">
                <FileText className="w-5 h-5 text-medsight-ai-high" />
                <h3 className="font-medium text-medsight-ai-high">Audit Reports</h3>
              </div>
              <p className="text-sm text-slate-600">
                Generate and review medical audit reports
              </p>
            </button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-medsight-primary">
                System Health Overview
              </h2>
              <p className="text-slate-600 mt-1">
                Real-time monitoring of medical system infrastructure
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-medsight-normal rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600">Live Monitoring</span>
              </div>
              <button className="btn-medsight">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
            </div>
          </div>

          <SystemHealth compactView={false} showDetails={true} />
        </div>

        {/* System Services Status */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-medsight-primary">
                Critical Medical Services
              </h2>
              <p className="text-slate-600 mt-1">
                Status of essential medical platform services
              </p>
            </div>
            <button className="btn-medsight">
              <Settings className="w-4 h-4 mr-2" />
              Manage Services
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Authentication Service */}
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-medsight-primary" />
                  <h3 className="font-medium text-medsight-primary">Authentication</h3>
                </div>
                <CheckCircle className="w-4 h-4 text-medsight-normal" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className="text-sm font-medium text-medsight-normal">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Response Time</span>
                  <span className="text-sm font-medium">34ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Active Sessions</span>
                  <span className="text-sm font-medium">47</span>
                </div>
              </div>
            </div>

            {/* Medical API */}
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Server className="w-5 h-5 text-medsight-primary" />
                  <h3 className="font-medium text-medsight-primary">Medical API</h3>
                </div>
                <CheckCircle className="w-4 h-4 text-medsight-normal" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className="text-sm font-medium text-medsight-normal">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Requests/min</span>
                  <span className="text-sm font-medium">342</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Error Rate</span>
                  <span className="text-sm font-medium">0.02%</span>
                </div>
              </div>
            </div>

            {/* AI Processing */}
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-medsight-primary" />
                  <h3 className="font-medium text-medsight-primary">AI Processing</h3>
                </div>
                <CheckCircle className="w-4 h-4 text-medsight-normal" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className="text-sm font-medium text-medsight-normal">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Queue Size</span>
                  <span className="text-sm font-medium">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Processed Today</span>
                  <span className="text-sm font-medium">156</span>
                </div>
              </div>
            </div>

            {/* File Storage */}
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-medsight-primary" />
                  <h3 className="font-medium text-medsight-primary">File Storage</h3>
                </div>
                <CheckCircle className="w-4 h-4 text-medsight-normal" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className="text-sm font-medium text-medsight-normal">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Usage</span>
                  <span className="text-sm font-medium">2.4TB / 10TB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Available</span>
                  <span className="text-sm font-medium">7.6TB</span>
                </div>
              </div>
            </div>

            {/* Monitoring */}
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-medsight-primary" />
                  <h3 className="font-medium text-medsight-primary">Monitoring</h3>
                </div>
                <CheckCircle className="w-4 h-4 text-medsight-normal" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className="text-sm font-medium text-medsight-normal">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Metrics/sec</span>
                  <span className="text-sm font-medium">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Alerts</span>
                  <span className="text-sm font-medium">0</span>
                </div>
              </div>
            </div>

            {/* Backup System */}
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-medsight-primary" />
                  <h3 className="font-medium text-medsight-primary">Backup System</h3>
                </div>
                <CheckCircle className="w-4 h-4 text-medsight-normal" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className="text-sm font-medium text-medsight-normal">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Last Backup</span>
                  <span className="text-sm font-medium">2h ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Next Backup</span>
                  <span className="text-sm font-medium">In 22h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-medsight-primary">
                  Recent Activity
                </h2>
                <p className="text-slate-600 mt-1">
                  Latest administrative actions and system events
                </p>
              </div>
              <button className="btn-medsight">
                <Eye className="w-4 h-4 mr-2" />
                View All
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-slate-50">
                <div className="w-2 h-2 bg-medsight-primary rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">
                    User account created: Dr. Sarah Chen
                  </div>
                  <div className="text-xs text-slate-500">
                    5 minutes ago • Admin action
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-lg bg-slate-50">
                <div className="w-2 h-2 bg-medsight-secondary rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">
                    DICOM server maintenance completed
                  </div>
                  <div className="text-xs text-slate-500">
                    12 minutes ago • System event
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-lg bg-slate-50">
                <div className="w-2 h-2 bg-medsight-accent rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">
                    AI model updated: Chest X-ray analysis
                  </div>
                  <div className="text-xs text-slate-500">
                    1 hour ago • System update
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-lg bg-slate-50">
                <div className="w-2 h-2 bg-medsight-ai-high rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">
                    Security audit completed successfully
                  </div>
                  <div className="text-xs text-slate-500">
                    2 hours ago • Security event
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Alerts */}
          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-medsight-primary">
                  System Alerts
                </h2>
                <p className="text-slate-600 mt-1">
                  Important notifications and warnings
                </p>
              </div>
              <button className="btn-medsight">
                <Bell className="w-4 h-4 mr-2" />
                View All
              </button>
            </div>

            <div className="space-y-4">
              <div className="medsight-control-glass p-4 rounded-lg border-l-4 border-medsight-critical">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-medsight-critical" />
                    <div>
                      <div className="font-medium text-medsight-critical">
                        Suspicious Login Detected
                      </div>
                      <div className="text-sm text-slate-600">
                        Unusual access pattern from Dr. Kim's account
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    5 min ago
                  </div>
                </div>
              </div>

              <div className="medsight-control-glass p-4 rounded-lg border-l-4 border-medsight-pending">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-medsight-pending" />
                    <div>
                      <div className="font-medium text-medsight-pending">
                        License Expiry Warning
                      </div>
                      <div className="text-sm text-slate-600">
                        3 medical licenses expire within 30 days
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    1 hour ago
                  </div>
                </div>
              </div>

              <div className="medsight-control-glass p-4 rounded-lg border-l-4 border-medsight-normal">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-medsight-normal" />
                    <div>
                      <div className="font-medium text-medsight-normal">
                        Backup Completed Successfully
                      </div>
                      <div className="text-sm text-slate-600">
                        All medical data backed up successfully
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    2 hours ago
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Status */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-medsight-primary">
                Medical Compliance Status
              </h2>
              <p className="text-slate-600 mt-1">
                Regulatory compliance monitoring and reporting
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-slate-500">Overall Score</div>
                <div className="text-lg font-semibold text-medsight-normal">
                  96.8%
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="medsight-control-glass p-4 rounded-lg text-center">
              <CheckCircle className="w-8 h-8 text-medsight-normal mx-auto mb-2" />
              <div className="text-sm font-medium text-medsight-normal">HIPAA Compliant</div>
              <div className="text-xs text-slate-500">All requirements met</div>
            </div>

            <div className="medsight-control-glass p-4 rounded-lg text-center">
              <CheckCircle className="w-8 h-8 text-medsight-normal mx-auto mb-2" />
              <div className="text-sm font-medium text-medsight-normal">DICOM Conformance</div>
              <div className="text-xs text-slate-500">Fully compliant</div>
            </div>

            <div className="medsight-control-glass p-4 rounded-lg text-center">
              <CheckCircle className="w-8 h-8 text-medsight-normal mx-auto mb-2" />
              <div className="text-sm font-medium text-medsight-normal">FDA Class II</div>
              <div className="text-xs text-slate-500">Approved</div>
            </div>

            <div className="medsight-control-glass p-4 rounded-lg text-center">
              <AlertTriangle className="w-8 h-8 text-medsight-pending mx-auto mb-2" />
              <div className="text-sm font-medium text-medsight-pending">HL7 FHIR</div>
              <div className="text-xs text-slate-500">Minor issues</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 