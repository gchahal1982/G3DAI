'use client';

import { useState, useEffect } from 'react';
import { 
  ComputerDesktopIcon, 
  DevicePhoneMobileIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  ClockIcon,
  LockClosedIcon,
  EyeIcon,
  CogIcon,
  ChartBarIcon,
  SignalIcon,
  WifiIcon,
  GlobeAltIcon,
  BellIcon,
  FireIcon,
  UsersIcon,
  DocumentCheckIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { 
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  ComputerDesktopIcon as ComputerDesktopIconSolid
} from '@heroicons/react/24/solid';
import React from 'react';

interface ConcurrentSession {
  sessionId: string;
  userId: string;
  userName: string;
  userRole: string;
  userLicense: string;
  userDepartment: string;
  deviceId: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  startTime: string;
  lastActivity: string;
  status: 'active' | 'idle' | 'terminated';
  medicalActivity: string;
  currentPage: string;
  dataAccessed: string[];
  securityLevel: 'high' | 'medium' | 'low';
  riskScore: number;
  complianceStatus: 'compliant' | 'warning' | 'violation';
  emergencyAccess: boolean;
  mfaVerified: boolean;
  trustedDevice: boolean;
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
  sessionMetrics: {
    bytesTransferred: number;
    requestsCount: number;
    errorsCount: number;
    averageResponseTime: number;
  };
}

interface UserSessionLimits {
  userId: string;
  userName: string;
  userRole: string;
  currentSessions: number;
  maxSessions: number;
  allowedDeviceTypes: string[];
  sessions: ConcurrentSession[];
  violations: SessionViolation[];
  lastViolation?: string;
  complianceStatus: 'compliant' | 'warning' | 'violation';
  emergencyOverride: boolean;
  overrideReason?: string;
  overrideApprover?: string;
  overrideExpiry?: string;
}

interface SessionViolation {
  id: string;
  type: 'max_sessions_exceeded' | 'device_limit_exceeded' | 'suspicious_activity' | 'concurrent_location';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  action: string;
  sessionId: string;
  userId: string;
}

interface SessionLimitPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rules: {
    maxSessionsPerUser: number;
    maxSessionsPerRole: { [role: string]: number };
    allowedDeviceTypes: string[];
    maxSessionsPerDevice: number;
    maxSessionsPerLocation: number;
    suspiciousActivityThreshold: number;
    emergencyOverrideEnabled: boolean;
    supervisorApprovalRequired: boolean;
    auditLogging: boolean;
  };
}

export default function ConcurrentSessionLimits() {
  const [userSessions, setUserSessions] = useState<UserSessionLimits[]>([]);
  const [violations, setViolations] = useState<SessionViolation[]>([]);
  const [policies, setPolicies] = useState<SessionLimitPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [showViolationDialog, setShowViolationDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterViolations, setFilterViolations] = useState('all');

  useEffect(() => {
    loadConcurrentSessions();
    const interval = setInterval(loadConcurrentSessions, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadConcurrentSessions = async () => {
    try {
      // Mock data - in production, this would connect to backend session-management.ts
      const mockUserSessions: UserSessionLimits[] = [
        {
          userId: 'user_001',
          userName: 'Dr. Sarah Johnson',
          userRole: 'Radiologist',
          currentSessions: 3,
          maxSessions: 5,
          allowedDeviceTypes: ['desktop', 'tablet', 'mobile'],
          sessions: [
            {
              sessionId: 'sess_001_1',
              userId: 'user_001',
              userName: 'Dr. Sarah Johnson',
              userRole: 'Radiologist',
              userLicense: 'MD-12345',
              userDepartment: 'Radiology',
              deviceId: 'WS-RAD-001',
              deviceType: 'desktop',
              deviceName: 'Radiology Workstation 1',
              browser: 'Chrome 118.0',
              os: 'Windows 11',
              ipAddress: '192.168.1.100',
              location: 'New York, NY',
              startTime: '2024-01-15T08:30:00Z',
              lastActivity: '2024-01-15T09:15:00Z',
              status: 'active',
              medicalActivity: 'Reviewing CT Scans',
              currentPage: '/workspace/imaging/dicom-viewer',
              dataAccessed: ['CT_Study_001', 'CT_Study_002'],
              securityLevel: 'high',
              riskScore: 15,
              complianceStatus: 'compliant',
              emergencyAccess: false,
              mfaVerified: true,
              trustedDevice: true,
              networkQuality: 'excellent',
              sessionMetrics: {
                bytesTransferred: 2547832,
                requestsCount: 156,
                errorsCount: 2,
                averageResponseTime: 245
              }
            },
            {
              sessionId: 'sess_001_2',
              userId: 'user_001',
              userName: 'Dr. Sarah Johnson',
              userRole: 'Radiologist',
              userLicense: 'MD-12345',
              userDepartment: 'Radiology',
              deviceId: 'iPad-RAD-005',
              deviceType: 'tablet',
              deviceName: 'iPad Pro 12.9"',
              browser: 'Safari 17.0',
              os: 'iOS 17.1',
              ipAddress: '192.168.1.150',
              location: 'New York, NY',
              startTime: '2024-01-15T09:00:00Z',
              lastActivity: '2024-01-15T09:10:00Z',
              status: 'idle',
              medicalActivity: 'Case Review',
              currentPage: '/dashboard/medical',
              dataAccessed: ['Patient_Record_123'],
              securityLevel: 'medium',
              riskScore: 25,
              complianceStatus: 'compliant',
              emergencyAccess: false,
              mfaVerified: true,
              trustedDevice: true,
              networkQuality: 'good',
              sessionMetrics: {
                bytesTransferred: 845623,
                requestsCount: 45,
                errorsCount: 1,
                averageResponseTime: 412
              }
            }
          ],
          violations: [],
          complianceStatus: 'compliant',
          emergencyOverride: false
        },
        {
          userId: 'user_002',
          userName: 'Dr. Michael Chen',
          userRole: 'Cardiologist',
          currentSessions: 6,
          maxSessions: 4,
          allowedDeviceTypes: ['desktop', 'tablet'],
          sessions: [
            {
              sessionId: 'sess_002_1',
              userId: 'user_002',
              userName: 'Dr. Michael Chen',
              userRole: 'Cardiologist',
              userLicense: 'MD-67890',
              userDepartment: 'Cardiology',
              deviceId: 'WS-CARD-001',
              deviceType: 'desktop',
              deviceName: 'Cardiology Workstation',
              browser: 'Chrome 118.0',
              os: 'Windows 11',
              ipAddress: '10.0.1.50',
              location: 'Los Angeles, CA',
              startTime: '2024-01-15T07:00:00Z',
              lastActivity: '2024-01-15T09:20:00Z',
              status: 'active',
              medicalActivity: 'Cardiac Analysis',
              currentPage: '/workspace/ai-analysis/cardiac-ai',
              dataAccessed: ['Echo_Study_002', 'EKG_Report_456'],
              securityLevel: 'high',
              riskScore: 20,
              complianceStatus: 'compliant',
              emergencyAccess: false,
              mfaVerified: true,
              trustedDevice: true,
              networkQuality: 'excellent',
              sessionMetrics: {
                bytesTransferred: 3245678,
                requestsCount: 234,
                errorsCount: 3,
                averageResponseTime: 298
              }
            }
          ],
          violations: [
            {
              id: 'violation_001',
              type: 'max_sessions_exceeded',
              severity: 'high',
              message: 'User has 6 active sessions, exceeding limit of 4',
              timestamp: '2024-01-15T09:00:00Z',
              resolved: false,
              action: 'Terminate oldest sessions',
              sessionId: 'sess_002_1',
              userId: 'user_002'
            }
          ],
          lastViolation: '2024-01-15T09:00:00Z',
          complianceStatus: 'violation',
          emergencyOverride: false
        }
      ];

      const mockViolations: SessionViolation[] = [
        {
          id: 'violation_001',
          type: 'max_sessions_exceeded',
          severity: 'high',
          message: 'Dr. Michael Chen has 6 active sessions, exceeding limit of 4',
          timestamp: '2024-01-15T09:00:00Z',
          resolved: false,
          action: 'Terminate oldest sessions',
          sessionId: 'sess_002_1',
          userId: 'user_002'
        },
        {
          id: 'violation_002',
          type: 'concurrent_location',
          severity: 'medium',
          message: 'Dr. Sarah Johnson has sessions from multiple locations simultaneously',
          timestamp: '2024-01-15T08:45:00Z',
          resolved: true,
          action: 'Verified legitimate use',
          sessionId: 'sess_001_2',
          userId: 'user_001'
        }
      ];

      const mockPolicies: SessionLimitPolicy[] = [
        {
          id: 'policy_001',
          name: 'Standard Session Limits',
          description: 'Default session limits for medical professionals',
          enabled: true,
          rules: {
            maxSessionsPerUser: 5,
            maxSessionsPerRole: {
              'Radiologist': 5,
              'Cardiologist': 4,
              'Emergency Physician': 3,
              'Surgeon': 4,
              'Resident': 2
            },
            allowedDeviceTypes: ['desktop', 'tablet', 'mobile'],
            maxSessionsPerDevice: 1,
            maxSessionsPerLocation: 10,
            suspiciousActivityThreshold: 3,
            emergencyOverrideEnabled: true,
            supervisorApprovalRequired: false,
            auditLogging: true
          }
        }
      ];

      setUserSessions(mockUserSessions);
      setViolations(mockViolations);
      setPolicies(mockPolicies);
      setLoading(false);
    } catch (error) {
      console.error('Error loading concurrent sessions:', error);
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      // Mock termination - in production, this would call backend API
      setUserSessions(prev => prev.map(user => ({
        ...user,
        sessions: user.sessions.filter(session => session.sessionId !== sessionId),
        currentSessions: user.sessions.filter(session => session.sessionId !== sessionId).length
      })));
      console.log(`Session ${sessionId} terminated successfully`);
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  const adjustSessionLimit = async (userId: string, newLimit: number) => {
    try {
      setUserSessions(prev => prev.map(user => 
        user.userId === userId 
          ? { ...user, maxSessions: newLimit }
          : user
      ));
      console.log(`Session limit for ${userId} adjusted to ${newLimit}`);
    } catch (error) {
      console.error('Error adjusting session limit:', error);
    }
  };

  const resolveViolation = async (violationId: string) => {
    try {
      setViolations(prev => prev.map(violation => 
        violation.id === violationId 
          ? { ...violation, resolved: true }
          : violation
      ));
      console.log(`Violation ${violationId} resolved`);
    } catch (error) {
      console.error('Error resolving violation:', error);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop': return <ComputerDesktopIcon className="w-4 h-4" />;
      case 'tablet': return <DevicePhoneMobileIcon className="w-4 h-4" />;
      case 'mobile': return <DevicePhoneMobileIcon className="w-4 h-4" />;
      default: return <ComputerDesktopIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-medsight-normal';
      case 'idle': return 'text-medsight-pending';
      case 'terminated': return 'text-slate-500';
      default: return 'text-slate-600';
    }
  };

  const getViolationSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-medsight-critical';
      case 'high': return 'text-medsight-abnormal';
      case 'medium': return 'text-medsight-pending';
      case 'low': return 'text-medsight-normal';
      default: return 'text-slate-600';
    }
  };

  const getViolationSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-medsight-critical/10';
      case 'high': return 'bg-medsight-abnormal/10';
      case 'medium': return 'bg-medsight-pending/10';
      case 'low': return 'bg-medsight-normal/10';
      default: return 'bg-slate-100';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-medsight-normal';
      case 'warning': return 'text-medsight-pending';
      case 'violation': return 'text-medsight-abnormal';
      default: return 'text-slate-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredUsers = userSessions.filter(user => 
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userRole.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredViolations = violations.filter(violation => {
    if (filterViolations === 'all') return true;
    if (filterViolations === 'unresolved') return !violation.resolved;
    if (filterViolations === 'resolved') return violation.resolved;
    return violation.severity === filterViolations;
  });

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
          <h2 className="text-2xl font-bold text-medsight-primary">Concurrent Session Limits</h2>
          <p className="text-slate-600 mt-1">Manage multiple simultaneous sessions per medical professional</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowPolicyDialog(true)}
            className="btn-medsight"
          >
            <CogIcon className="w-4 h-4 mr-2" />
            Policies
          </button>
          <button 
            onClick={() => setShowViolationDialog(true)}
            className="btn-medsight"
          >
            <BellIcon className="w-4 h-4 mr-2" />
            Violations ({violations.filter(v => !v.resolved).length})
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Users</p>
              <p className="text-2xl font-bold text-medsight-primary">{userSessions.length}</p>
            </div>
            <div className="p-3 bg-medsight-primary/10 rounded-lg">
              <UsersIcon className="w-6 h-6 text-medsight-primary" />
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Sessions</p>
              <p className="text-2xl font-bold text-medsight-normal">
                {userSessions.reduce((sum, user) => sum + user.currentSessions, 0)}
              </p>
            </div>
            <div className="p-3 bg-medsight-normal/10 rounded-lg">
              <ComputerDesktopIconSolid className="w-6 h-6 text-medsight-normal" />
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Violations</p>
              <p className="text-2xl font-bold text-medsight-abnormal">
                {violations.filter(v => !v.resolved).length}
              </p>
            </div>
            <div className="p-3 bg-medsight-abnormal/10 rounded-lg">
              <ExclamationTriangleIconSolid className="w-6 h-6 text-medsight-abnormal" />
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Compliance Rate</p>
              <p className="text-2xl font-bold text-medsight-normal">
                {Math.round((userSessions.filter(u => u.complianceStatus === 'compliant').length / userSessions.length) * 100)}%
              </p>
            </div>
            <div className="p-3 bg-medsight-normal/10 rounded-lg">
              <ShieldCheckIconSolid className="w-6 h-6 text-medsight-normal" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-medsight pl-10"
            />
          </div>
          <button className="btn-medsight">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* User Sessions Table */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-medsight-primary">User Session Limits</h3>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">
              {filteredUsers.length} users
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Sessions</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Devices</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Compliance</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Last Activity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.userId} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-medsight-primary/10 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-medsight-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{user.userName}</p>
                        <p className="text-xs text-slate-500">{user.userRole}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className={`text-sm font-medium ${
                        user.currentSessions > user.maxSessions ? 'text-medsight-abnormal' : 'text-medsight-normal'
                      }`}>
                        {user.currentSessions}/{user.maxSessions}
                      </div>
                      {user.currentSessions > user.maxSessions && (
                        <ExclamationTriangleIconSolid className="w-4 h-4 text-medsight-abnormal" />
                      )}
                    </div>
                    <div className="w-20 bg-slate-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          user.currentSessions > user.maxSessions ? 'bg-medsight-abnormal' : 'bg-medsight-normal'
                        }`}
                        style={{ width: `${Math.min((user.currentSessions / user.maxSessions) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {user.sessions.slice(0, 3).map((session, index) => (
                        <div key={index} className="flex items-center space-x-1">
                          {getDeviceIcon(session.deviceType)}
                          <span className={`text-xs ${getStatusColor(session.status)}`}>
                            {session.deviceType}
                          </span>
                        </div>
                      ))}
                      {user.sessions.length > 3 && (
                        <span className="text-xs text-slate-500">+{user.sessions.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getComplianceColor(user.complianceStatus)} bg-current`}></div>
                      <span className={`text-sm font-medium ${getComplianceColor(user.complianceStatus)}`}>
                        {user.complianceStatus}
                      </span>
                    </div>
                    {user.violations.length > 0 && (
                      <div className="text-xs text-slate-500 mt-1">
                        {user.violations.filter(v => !v.resolved).length} violations
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      {user.sessions.length > 0 && (
                        <div className="text-sm text-slate-600">
                          {formatTimestamp(user.sessions[0].lastActivity)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setSelectedUser(selectedUser === user.userId ? null : user.userId)}
                        className="btn-medsight text-xs"
                      >
                        <EyeIcon className="w-3 h-3 mr-1" />
                        {selectedUser === user.userId ? 'Hide' : 'Details'}
                      </button>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => adjustSessionLimit(user.userId, Math.max(1, user.maxSessions - 1))}
                          className="btn-medsight text-xs p-1"
                        >
                          <MinusIcon className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-slate-600 px-2">{user.maxSessions}</span>
                        <button 
                          onClick={() => adjustSessionLimit(user.userId, user.maxSessions + 1)}
                          className="btn-medsight text-xs p-1"
                        >
                          <PlusIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Details */}
      {selectedUser && (
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">Session Details</h3>
          {(() => {
            const user = userSessions.find(u => u.userId === selectedUser);
            if (!user) return null;
            
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.sessions.map((session) => (
                    <div key={session.sessionId} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getDeviceIcon(session.deviceType)}
                          <span className="text-sm font-medium text-slate-900">{session.deviceName}</span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === 'active' ? 'bg-medsight-normal/10 text-medsight-normal' :
                          session.status === 'idle' ? 'bg-medsight-pending/10 text-medsight-pending' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {session.status}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{session.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <GlobeAltIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{session.ipAddress}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{formatTimestamp(session.lastActivity)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DocumentCheckIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{session.medicalActivity}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {session.mfaVerified && (
                            <LockClosedIcon className="w-4 h-4 text-medsight-normal" />
                          )}
                          {session.trustedDevice && (
                            <ShieldCheckIcon className="w-4 h-4 text-medsight-normal" />
                          )}
                          {session.emergencyAccess && (
                            <FireIcon className="w-4 h-4 text-medsight-critical" />
                          )}
                        </div>
                        <button 
                          onClick={() => terminateSession(session.sessionId)}
                          className="btn-medsight text-xs bg-medsight-abnormal text-white"
                        >
                          <TrashIcon className="w-3 h-3 mr-1" />
                          Terminate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Violations Dialog */}
      {showViolationDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Session Violations</h3>
              <button 
                onClick={() => setShowViolationDialog(false)}
                className="btn-medsight text-sm"
              >
                Close
              </button>
            </div>
            
            <div className="mb-4">
              <select 
                value={filterViolations}
                onChange={(e) => setFilterViolations(e.target.value)}
                className="input-medsight"
              >
                <option value="all">All Violations</option>
                <option value="unresolved">Unresolved</option>
                <option value="resolved">Resolved</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredViolations.map((violation) => (
                <div key={violation.id} className={`border rounded-lg p-4 ${
                  violation.resolved ? 'border-slate-200 bg-slate-50' : 'border-medsight-abnormal/20 bg-medsight-abnormal/5'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getViolationSeverityBg(violation.severity)} ${getViolationSeverityColor(violation.severity)}`}>
                        {violation.severity.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{violation.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {violation.resolved ? (
                        <CheckCircleIcon className="w-4 h-4 text-medsight-normal" />
                      ) : (
                        <button 
                          onClick={() => resolveViolation(violation.id)}
                          className="btn-medsight text-xs"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-700 mb-2">{violation.message}</p>
                  <div className="text-xs text-slate-500">
                    <p>Action: {violation.action}</p>
                    <p>Time: {formatTimestamp(violation.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 