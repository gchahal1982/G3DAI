'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  ClockIcon, 
  UserIcon, 
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  SignalIcon,
  LockClosedIcon,
  EyeIcon,
  BellIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  CpuChipIcon,
  WifiIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import { 
  ShieldCheckIcon as ShieldCheckIconSolid,
  ClockIcon as ClockIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';
import React from 'react';

interface SessionData {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  userLicense: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  os: string;
  startTime: string;
  lastActivity: string;
  duration: number;
  status: 'active' | 'idle' | 'timeout' | 'terminated';
  securityLevel: 'high' | 'medium' | 'low';
  complianceStatus: 'compliant' | 'warning' | 'violation';
  mfaStatus: boolean;
  emergencyAccess: boolean;
  medicalActivity: string;
  dataAccessed: string[];
  riskScore: number;
}

interface SessionMetrics {
  totalSessions: number;
  activeSessions: number;
  idleSessions: number;
  timeoutSessions: number;
  averageDuration: number;
  securityAlerts: number;
  complianceViolations: number;
  emergencyAccess: number;
  highRiskSessions: number;
  medicalDataAccess: number;
  concurrentSessions: number;
  peakSessions: number;
}

interface SecurityAlert {
  id: string;
  type: 'suspicious_location' | 'multiple_devices' | 'compliance_violation' | 'timeout_warning' | 'emergency_access';
  severity: 'critical' | 'high' | 'medium' | 'low';
  sessionId: string;
  userName: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  action: string;
}

export default function SessionMonitoring() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [metrics, setMetrics] = useState<SessionMetrics>({
    totalSessions: 0,
    activeSessions: 0,
    idleSessions: 0,
    timeoutSessions: 0,
    averageDuration: 0,
    securityAlerts: 0,
    complianceViolations: 0,
    emergencyAccess: 0,
    highRiskSessions: 0,
    medicalDataAccess: 0,
    concurrentSessions: 0,
    peakSessions: 0
  });
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadSessionData();
    const interval = setInterval(loadSessionData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const loadSessionData = async () => {
    try {
      // Mock data - in production, this would connect to backend session-management.ts
      const mockSessions: SessionData[] = [
        {
          id: 'sess_001',
          userId: 'user_001',
          userName: 'Dr. Sarah Johnson',
          userRole: 'Radiologist',
          userLicense: 'MD-12345',
          ipAddress: '192.168.1.100',
          location: 'New York, NY',
          device: 'Desktop',
          browser: 'Chrome 118.0',
          os: 'Windows 11',
          startTime: '2024-01-15T08:30:00Z',
          lastActivity: '2024-01-15T09:15:00Z',
          duration: 2700000, // 45 minutes in milliseconds
          status: 'active',
          securityLevel: 'high',
          complianceStatus: 'compliant',
          mfaStatus: true,
          emergencyAccess: false,
          medicalActivity: 'Reviewing CT Scans',
          dataAccessed: ['CT_Study_001', 'Patient_Record_123'],
          riskScore: 15
        },
        {
          id: 'sess_002',
          userId: 'user_002',
          userName: 'Dr. Michael Chen',
          userRole: 'Cardiologist',
          userLicense: 'MD-67890',
          ipAddress: '10.0.1.50',
          location: 'Los Angeles, CA',
          device: 'Tablet',
          browser: 'Safari 17.0',
          os: 'iOS 17.1',
          startTime: '2024-01-15T07:00:00Z',
          lastActivity: '2024-01-15T08:45:00Z',
          duration: 6300000, // 1h 45m in milliseconds
          status: 'idle',
          securityLevel: 'medium',
          complianceStatus: 'warning',
          mfaStatus: true,
          emergencyAccess: false,
          medicalActivity: 'Cardiac Analysis',
          dataAccessed: ['Echo_Study_002', 'EKG_Report_456'],
          riskScore: 35
        },
        {
          id: 'sess_003',
          userId: 'user_003',
          userName: 'Dr. Emily Rodriguez',
          userRole: 'Emergency Physician',
          userLicense: 'MD-11111',
          ipAddress: '172.16.0.25',
          location: 'Chicago, IL',
          device: 'Mobile',
          browser: 'Chrome Mobile 118.0',
          os: 'Android 13',
          startTime: '2024-01-15T06:15:00Z',
          lastActivity: '2024-01-15T09:20:00Z',
          duration: 10800000, // 3 hours in milliseconds
          status: 'active',
          securityLevel: 'high',
          complianceStatus: 'compliant',
          mfaStatus: true,
          emergencyAccess: true,
          medicalActivity: 'Emergency Case Review',
          dataAccessed: ['Xray_Study_003', 'Trauma_Case_789'],
          riskScore: 25
        }
      ];

      const mockMetrics: SessionMetrics = {
        totalSessions: 247,
        activeSessions: 89,
        idleSessions: 23,
        timeoutSessions: 5,
        averageDuration: 3600000, // 1 hour in milliseconds
        securityAlerts: 12,
        complianceViolations: 3,
        emergencyAccess: 7,
        highRiskSessions: 8,
        medicalDataAccess: 156,
        concurrentSessions: 89,
        peakSessions: 134
      };

      const mockAlerts: SecurityAlert[] = [
        {
          id: 'alert_001',
          type: 'suspicious_location',
          severity: 'high',
          sessionId: 'sess_004',
          userName: 'Dr. James Wilson',
          message: 'Login from unusual location detected',
          timestamp: '2024-01-15T09:00:00Z',
          resolved: false,
          action: 'Location verification required'
        },
        {
          id: 'alert_002',
          type: 'compliance_violation',
          severity: 'critical',
          sessionId: 'sess_005',
          userName: 'Dr. Lisa Park',
          message: 'Session exceeded maximum duration limit',
          timestamp: '2024-01-15T08:30:00Z',
          resolved: false,
          action: 'Force logout required'
        }
      ];

      setSessions(mockSessions);
      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
      setLoading(false);
    } catch (error) {
      console.error('Error loading session data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-medsight-normal';
      case 'idle': return 'text-medsight-pending';
      case 'timeout': return 'text-medsight-abnormal';
      case 'terminated': return 'text-slate-500';
      default: return 'text-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'idle': return <ClockIcon className="w-4 h-4" />;
      case 'timeout': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'terminated': return <XCircleIcon className="w-4 h-4" />;
      default: return <UserIcon className="w-4 h-4" />;
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-medsight-ai-high';
      case 'medium': return 'text-medsight-ai-medium';
      case 'low': return 'text-medsight-ai-low';
      default: return 'text-slate-600';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-medsight-normal';
      case 'warning': return 'text-medsight-pending';
      case 'violation': return 'text-medsight-critical';
      default: return 'text-slate-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-medsight-critical';
      case 'high': return 'text-medsight-abnormal';
      case 'medium': return 'text-medsight-pending';
      case 'low': return 'text-medsight-normal';
      default: return 'text-slate-600';
    }
  };

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medsight-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-medsight-primary">Session Monitoring</h2>
          <p className="text-slate-600 mt-1">Real-time medical session tracking and security analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="input-medsight"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button className="btn-medsight">
            <BellIcon className="w-4 h-4 mr-2" />
            Alerts ({alerts.filter(a => !a.resolved).length})
          </button>
        </div>
      </div>

      {/* Session Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Sessions</p>
              <p className="text-2xl font-bold text-medsight-normal">{metrics.activeSessions}</p>
            </div>
            <div className="p-3 bg-medsight-normal/10 rounded-lg">
              <UserIcon className="w-6 h-6 text-medsight-normal" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <SignalIcon className="w-4 h-4 text-medsight-normal mr-1" />
            <span className="text-medsight-normal">+12% from yesterday</span>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Security Alerts</p>
              <p className="text-2xl font-bold text-medsight-abnormal">{metrics.securityAlerts}</p>
            </div>
            <div className="p-3 bg-medsight-abnormal/10 rounded-lg">
              <ShieldCheckIconSolid className="w-6 h-6 text-medsight-abnormal" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ExclamationTriangleIconSolid className="w-4 h-4 text-medsight-abnormal mr-1" />
            <span className="text-medsight-abnormal">{alerts.filter(a => !a.resolved).length} unresolved</span>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Compliance Status</p>
              <p className="text-2xl font-bold text-medsight-normal">
                {Math.round(((metrics.totalSessions - metrics.complianceViolations) / metrics.totalSessions) * 100)}%
              </p>
            </div>
            <div className="p-3 bg-medsight-normal/10 rounded-lg">
              <DocumentCheckIcon className="w-6 h-6 text-medsight-normal" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <CheckCircleIcon className="w-4 h-4 text-medsight-normal mr-1" />
            <span className="text-medsight-normal">HIPAA Compliant</span>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Average Duration</p>
              <p className="text-2xl font-bold text-medsight-ai-high">{formatDuration(metrics.averageDuration)}</p>
            </div>
            <div className="p-3 bg-medsight-ai-high/10 rounded-lg">
              <ClockIconSolid className="w-6 h-6 text-medsight-ai-high" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ChartBarIcon className="w-4 h-4 text-medsight-ai-high mr-1" />
            <span className="text-medsight-ai-high">Optimal range</span>
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      {alerts.filter(a => !a.resolved).length > 0 && (
        <div className="medsight-glass p-6 rounded-xl border-l-4 border-medsight-abnormal">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-medsight-abnormal">Security Alerts</h3>
            <button className="btn-medsight text-sm">
              View All Alerts
            </button>
          </div>
          <div className="space-y-3">
            {alerts.filter(a => !a.resolved).slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)} bg-current/10`}>
                  <ExclamationTriangleIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">{alert.userName}</p>
                    <p className="text-xs text-slate-500">{formatTimestamp(alert.timestamp)}</p>
                  </div>
                  <p className="text-sm text-slate-700 mt-1">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-1">Action: {alert.action}</p>
                </div>
                <button className="btn-medsight text-xs">
                  Resolve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">Session Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Desktop Sessions</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-slate-200 rounded-full h-2">
                  <div className="bg-medsight-normal h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-sm font-medium">65%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Tablet Sessions</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-slate-200 rounded-full h-2">
                  <div className="bg-medsight-ai-medium h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <span className="text-sm font-medium">25%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Mobile Sessions</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-slate-200 rounded-full h-2">
                  <div className="bg-medsight-pending h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
                <span className="text-sm font-medium">10%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">Risk Assessment</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-medsight-ai-high rounded-full"></div>
                <span className="text-sm text-slate-600">Low Risk</span>
              </div>
              <span className="text-sm font-medium">{metrics.totalSessions - metrics.highRiskSessions}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-medsight-ai-medium rounded-full"></div>
                <span className="text-sm text-slate-600">Medium Risk</span>
              </div>
              <span className="text-sm font-medium">12</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-medsight-ai-low rounded-full"></div>
                <span className="text-sm text-slate-600">High Risk</span>
              </div>
              <span className="text-sm font-medium">{metrics.highRiskSessions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions Table */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-medsight-primary">Active Sessions</h3>
          <div className="flex items-center space-x-4">
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="input-medsight"
            >
              <option value="all">All Roles</option>
              <option value="radiologist">Radiologist</option>
              <option value="cardiologist">Cardiologist</option>
              <option value="emergency">Emergency Physician</option>
              <option value="surgeon">Surgeon</option>
            </select>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-medsight"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="timeout">Timeout</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Location</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Device</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Duration</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Activity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Security</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-medsight-primary/10 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-medsight-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{session.userName}</p>
                        <p className="text-xs text-slate-500">{session.userRole} • {session.userLicense}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center space-x-2 ${getStatusColor(session.status)}`}>
                      {getStatusIcon(session.status)}
                      <span className="text-sm font-medium capitalize">{session.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{session.location}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {session.device === 'Desktop' && <ComputerDesktopIcon className="w-4 h-4 text-slate-400" />}
                      {session.device === 'Tablet' && <DevicePhoneMobileIcon className="w-4 h-4 text-slate-400" />}
                      {session.device === 'Mobile' && <DevicePhoneMobileIcon className="w-4 h-4 text-slate-400" />}
                      <div>
                        <p className="text-sm text-slate-600">{session.device}</p>
                        <p className="text-xs text-slate-500">{session.browser}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-slate-600">{formatDuration(session.duration)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-slate-600">{session.medicalActivity}</p>
                      <p className="text-xs text-slate-500">{session.dataAccessed.length} files accessed</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getSecurityLevelColor(session.securityLevel)} bg-current`}></div>
                      <span className={`text-xs font-medium ${getSecurityLevelColor(session.securityLevel)}`}>
                        {session.securityLevel.toUpperCase()}
                      </span>
                      {session.mfaStatus && (
                        <LockClosedIcon className="w-3 h-3 text-medsight-normal" />
                      )}
                      {session.emergencyAccess && (
                        <ExclamationTriangleIcon className="w-3 h-3 text-medsight-abnormal" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="btn-medsight text-xs">
                        <EyeIcon className="w-3 h-3 mr-1" />
                        View
                      </button>
                      <button className="btn-medsight text-xs">
                        Terminate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Monitoring */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">Compliance Monitoring</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-medsight-normal/10 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <DocumentCheckIcon className="w-5 h-5 text-medsight-normal" />
              <span className="text-sm font-medium text-medsight-normal">HIPAA Compliance</span>
            </div>
            <p className="text-2xl font-bold text-medsight-normal">98.7%</p>
            <p className="text-xs text-slate-600 mt-1">3 violations this month</p>
          </div>
          <div className="p-4 bg-medsight-ai-high/10 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-5 h-5 text-medsight-ai-high" />
              <span className="text-sm font-medium text-medsight-ai-high">Session Timeouts</span>
            </div>
            <p className="text-2xl font-bold text-medsight-ai-high">{metrics.timeoutSessions}</p>
            <p className="text-xs text-slate-600 mt-1">Automatic enforcement</p>
          </div>
          <div className="p-4 bg-medsight-pending/10 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ShieldCheckIcon className="w-5 h-5 text-medsight-pending" />
              <span className="text-sm font-medium text-medsight-pending">MFA Status</span>
            </div>
            <p className="text-2xl font-bold text-medsight-pending">100%</p>
            <p className="text-xs text-slate-600 mt-1">All sessions protected</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
 