'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  FireIcon,
  BellIcon,
  UserIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  CogIcon,
  InformationCircleIcon,
  ChartBarIcon,
  EyeIcon,
  DocumentCheckIcon,
  UsersIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  SignalIcon,
  WifiIcon
} from '@heroicons/react/24/outline';
import { 
  ClockIcon as ClockIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  FireIcon as FireIconSolid,
  BellIcon as BellIconSolid
} from '@heroicons/react/24/solid';
import React from 'react';

interface SessionTimeout {
  sessionId: string;
  userId: string;
  userName: string;
  userRole: string;
  userLicense: string;
  startTime: string;
  lastActivity: string;
  idleTime: number; // milliseconds
  timeoutDuration: number; // milliseconds
  warningTime: number; // milliseconds
  remainingTime: number; // milliseconds
  status: 'active' | 'idle' | 'warning' | 'expired' | 'emergency_override';
  emergencyOverride: boolean;
  emergencyReason: string;
  emergencyApprover: string;
  medicalActivity: string;
  currentPage: string;
  location: string;
  device: string;
  ipAddress: string;
  riskScore: number;
  complianceStatus: 'compliant' | 'warning' | 'violation';
  canExtend: boolean;
  extensionsUsed: number;
  maxExtensions: number;
}

interface TimeoutSettings {
  globalTimeout: number; // milliseconds
  warningTime: number; // milliseconds
  emergencyTimeout: number; // milliseconds
  maxExtensions: number;
  extensionDuration: number; // milliseconds
  autoExtendOnActivity: boolean;
  emergencyOverrideEnabled: boolean;
  supervisorApprovalRequired: boolean;
  auditLogging: boolean;
}

interface TimeoutAction {
  type: 'extend' | 'override' | 'terminate' | 'warning_sent' | 'expired';
  sessionId: string;
  userId: string;
  userName: string;
  reason: string;
  approver?: string;
  timestamp: string;
  duration?: number;
}

export default function SessionTimeoutManager() {
  const [sessions, setSessions] = useState<SessionTimeout[]>([]);
  const [settings, setSettings] = useState<TimeoutSettings>({
    globalTimeout: 900000, // 15 minutes
    warningTime: 300000, // 5 minutes
    emergencyTimeout: 1800000, // 30 minutes
    maxExtensions: 3,
    extensionDuration: 900000, // 15 minutes
    autoExtendOnActivity: true,
    emergencyOverrideEnabled: true,
    supervisorApprovalRequired: false,
    auditLogging: true
  });
  const [actions, setActions] = useState<TimeoutAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [emergencyOverrideReason, setEmergencyOverrideReason] = useState('');
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  useEffect(() => {
    loadSessionTimeouts();
    const interval = setInterval(loadSessionTimeouts, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSessionTimeouts = async () => {
    try {
      // Mock data - in production, this would connect to backend session-management.ts
      const mockSessions: SessionTimeout[] = [
        {
          sessionId: 'sess_timeout_001',
          userId: 'user_001',
          userName: 'Dr. Sarah Johnson',
          userRole: 'Radiologist',
          userLicense: 'MD-12345',
          startTime: '2024-01-15T08:30:00Z',
          lastActivity: '2024-01-15T09:05:00Z',
          idleTime: 600000, // 10 minutes idle
          timeoutDuration: 900000, // 15 minutes total
          warningTime: 300000, // 5 minutes warning
          remainingTime: 300000, // 5 minutes remaining
          status: 'warning',
          emergencyOverride: false,
          emergencyReason: '',
          emergencyApprover: '',
          medicalActivity: 'Reviewing CT Scans',
          currentPage: '/workspace/imaging/dicom-viewer',
          location: 'New York, NY',
          device: 'Desktop',
          ipAddress: '192.168.1.100',
          riskScore: 25,
          complianceStatus: 'compliant',
          canExtend: true,
          extensionsUsed: 1,
          maxExtensions: 3
        },
        {
          sessionId: 'sess_timeout_002',
          userId: 'user_002',
          userName: 'Dr. Michael Chen',
          userRole: 'Cardiologist',
          userLicense: 'MD-67890',
          startTime: '2024-01-15T07:00:00Z',
          lastActivity: '2024-01-15T08:45:00Z',
          idleTime: 1200000, // 20 minutes idle
          timeoutDuration: 900000, // 15 minutes total
          warningTime: 300000, // 5 minutes warning
          remainingTime: -300000, // Expired 5 minutes ago
          status: 'expired',
          emergencyOverride: false,
          emergencyReason: '',
          emergencyApprover: '',
          medicalActivity: 'Cardiac Analysis',
          currentPage: '/workspace/ai-analysis/cardiac-ai',
          location: 'Los Angeles, CA',
          device: 'Tablet',
          ipAddress: '10.0.1.50',
          riskScore: 45,
          complianceStatus: 'violation',
          canExtend: false,
          extensionsUsed: 3,
          maxExtensions: 3
        },
        {
          sessionId: 'sess_timeout_003',
          userId: 'user_003',
          userName: 'Dr. Emily Rodriguez',
          userRole: 'Emergency Physician',
          userLicense: 'MD-11111',
          startTime: '2024-01-15T06:15:00Z',
          lastActivity: '2024-01-15T09:20:00Z',
          idleTime: 0, // Currently active
          timeoutDuration: 1800000, // 30 minutes (emergency)
          warningTime: 300000, // 5 minutes warning
          remainingTime: 1500000, // 25 minutes remaining
          status: 'emergency_override',
          emergencyOverride: true,
          emergencyReason: 'Critical patient case - trauma surgery',
          emergencyApprover: 'Dr. James Wilson (Chief of Surgery)',
          medicalActivity: 'Emergency Case Review',
          currentPage: '/workspace/emergency/trauma-cases',
          location: 'Chicago, IL',
          device: 'Mobile',
          ipAddress: '172.16.0.25',
          riskScore: 15,
          complianceStatus: 'compliant',
          canExtend: true,
          extensionsUsed: 0,
          maxExtensions: 5
        }
      ];

      // Update remaining time based on current time
      const now = new Date().getTime();
      const updatedSessions = mockSessions.map(session => {
        const lastActivity = new Date(session.lastActivity).getTime();
        const currentIdleTime = now - lastActivity;
        const remainingTime = session.timeoutDuration - currentIdleTime;
        
        let status = session.status;
        if (remainingTime <= 0 && !session.emergencyOverride) {
          status = 'expired';
        } else if (remainingTime <= session.warningTime && !session.emergencyOverride) {
          status = 'warning';
        } else if (currentIdleTime < 60000) { // Less than 1 minute idle
          status = 'active';
        } else if (!session.emergencyOverride) {
          status = 'idle';
        }

        return {
          ...session,
          idleTime: currentIdleTime,
          remainingTime: Math.max(0, remainingTime),
          status
        };
      });

      setSessions(updatedSessions);

      // Mock recent actions
      const mockActions: TimeoutAction[] = [
        {
          type: 'warning_sent',
          sessionId: 'sess_timeout_001',
          userId: 'user_001',
          userName: 'Dr. Sarah Johnson',
          reason: 'Session timeout warning - 5 minutes remaining',
          timestamp: '2024-01-15T09:10:00Z'
        },
        {
          type: 'override',
          sessionId: 'sess_timeout_003',
          userId: 'user_003',
          userName: 'Dr. Emily Rodriguez',
          reason: 'Critical patient case - trauma surgery',
          approver: 'Dr. James Wilson',
          timestamp: '2024-01-15T08:00:00Z',
          duration: 1800000
        },
        {
          type: 'extend',
          sessionId: 'sess_timeout_001',
          userId: 'user_001',
          userName: 'Dr. Sarah Johnson',
          reason: 'User requested extension',
          timestamp: '2024-01-15T08:50:00Z',
          duration: 900000
        }
      ];

      setActions(mockActions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading session timeouts:', error);
      setLoading(false);
    }
  };

  const extendSession = async (sessionId: string, duration: number = settings.extensionDuration) => {
    try {
      setSessions(prev => prev.map(session => 
        session.sessionId === sessionId 
          ? { 
              ...session, 
              remainingTime: session.remainingTime + duration,
              extensionsUsed: session.extensionsUsed + 1,
              canExtend: session.extensionsUsed + 1 < session.maxExtensions
            }
          : session
      ));

      // Log action
      const session = sessions.find(s => s.sessionId === sessionId);
      if (session) {
        const action: TimeoutAction = {
          type: 'extend',
          sessionId,
          userId: session.userId,
          userName: session.userName,
          reason: 'Administrator extension',
          timestamp: new Date().toISOString(),
          duration
        };
        setActions(prev => [action, ...prev]);
      }
    } catch (error) {
      console.error('Error extending session:', error);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.sessionId === sessionId);
      if (session) {
        const action: TimeoutAction = {
          type: 'terminate',
          sessionId,
          userId: session.userId,
          userName: session.userName,
          reason: 'Administrator termination',
          timestamp: new Date().toISOString()
        };
        setActions(prev => [action, ...prev]);
      }

      setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  const emergencyOverride = async (sessionId: string, reason: string) => {
    try {
      setSessions(prev => prev.map(session => 
        session.sessionId === sessionId 
          ? { 
              ...session, 
              emergencyOverride: true,
              emergencyReason: reason,
              emergencyApprover: 'System Administrator', // In production, use current user
              status: 'emergency_override',
              timeoutDuration: settings.emergencyTimeout,
              remainingTime: settings.emergencyTimeout
            }
          : session
      ));

      // Log action
      const session = sessions.find(s => s.sessionId === sessionId);
      if (session) {
        const action: TimeoutAction = {
          type: 'override',
          sessionId,
          userId: session.userId,
          userName: session.userName,
          reason,
          approver: 'System Administrator',
          timestamp: new Date().toISOString(),
          duration: settings.emergencyTimeout
        };
        setActions(prev => [action, ...prev]);
      }

      setShowEmergencyDialog(false);
      setEmergencyOverrideReason('');
      setSelectedSession(null);
    } catch (error) {
      console.error('Error applying emergency override:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-medsight-normal';
      case 'idle': return 'text-medsight-ai-medium';
      case 'warning': return 'text-medsight-pending';
      case 'expired': return 'text-medsight-abnormal';
      case 'emergency_override': return 'text-medsight-critical';
      default: return 'text-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'idle': return <ClockIcon className="w-4 h-4" />;
      case 'warning': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'expired': return <XCircleIcon className="w-4 h-4" />;
      case 'emergency_override': return <FireIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-medsight-normal/10 text-medsight-normal';
      case 'idle': return 'bg-medsight-ai-medium/10 text-medsight-ai-medium';
      case 'warning': return 'bg-medsight-pending/10 text-medsight-pending';
      case 'expired': return 'bg-medsight-abnormal/10 text-medsight-abnormal';
      case 'emergency_override': return 'bg-medsight-critical/10 text-medsight-critical';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDuration = (milliseconds: number) => {
    const minutes = Math.floor(Math.abs(milliseconds) / 60000);
    const seconds = Math.floor((Math.abs(milliseconds) % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
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
          <h2 className="text-2xl font-bold text-medsight-primary">Session Timeout Manager</h2>
          <p className="text-slate-600 mt-1">Monitor and manage medical session timeouts and extensions</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowSettingsDialog(true)}
            className="btn-medsight"
          >
            <CogIcon className="w-4 h-4 mr-2" />
            Settings
          </button>
          <button 
            onClick={loadSessionTimeouts}
            className="btn-medsight"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Sessions</p>
              <p className="text-2xl font-bold text-medsight-normal">
                {sessions.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-medsight-normal/10 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-medsight-normal" />
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Warning Status</p>
              <p className="text-2xl font-bold text-medsight-pending">
                {sessions.filter(s => s.status === 'warning').length}
              </p>
            </div>
            <div className="p-3 bg-medsight-pending/10 rounded-lg">
              <ExclamationTriangleIconSolid className="w-6 h-6 text-medsight-pending" />
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Expired Sessions</p>
              <p className="text-2xl font-bold text-medsight-abnormal">
                {sessions.filter(s => s.status === 'expired').length}
              </p>
            </div>
            <div className="p-3 bg-medsight-abnormal/10 rounded-lg">
              <XCircleIcon className="w-6 h-6 text-medsight-abnormal" />
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Emergency Overrides</p>
              <p className="text-2xl font-bold text-medsight-critical">
                {sessions.filter(s => s.status === 'emergency_override').length}
              </p>
            </div>
            <div className="p-3 bg-medsight-critical/10 rounded-lg">
              <FireIconSolid className="w-6 h-6 text-medsight-critical" />
            </div>
          </div>
        </div>
      </div>

      {/* Session Timeout Table */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-medsight-primary">Session Timeouts</h3>
          <div className="flex items-center space-x-2">
            <BellIconSolid className="w-4 h-4 text-medsight-pending" />
            <span className="text-sm text-slate-600">
              {sessions.filter(s => s.status === 'warning' || s.status === 'expired').length} sessions need attention
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Activity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Idle Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Remaining</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Extensions</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Risk</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.sessionId} className="border-b border-slate-100 hover:bg-slate-50">
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
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(session.status)}`}>
                        {getStatusIcon(session.status)}
                        <span className="ml-1 capitalize">{session.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    {session.emergencyOverride && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-medsight-critical/10 text-medsight-critical">
                          <FireIcon className="w-3 h-3 mr-1" />
                          Emergency Override
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-slate-600">{session.medicalActivity}</p>
                      <p className="text-xs text-slate-500">
                        {session.location} • {session.device}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`text-sm ${session.idleTime > 600000 ? 'text-medsight-pending' : 'text-slate-600'}`}>
                      {formatDuration(session.idleTime)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`text-sm font-medium ${
                      session.remainingTime <= 0 ? 'text-medsight-abnormal' :
                      session.remainingTime <= 300000 ? 'text-medsight-pending' :
                      'text-medsight-normal'
                    }`}>
                      {session.remainingTime <= 0 ? 'EXPIRED' : formatDuration(session.remainingTime)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-slate-600">
                      {session.extensionsUsed}/{session.maxExtensions}
                    </div>
                    <div className="w-16 bg-slate-200 rounded-full h-1 mt-1">
                      <div 
                        className="bg-medsight-ai-medium h-1 rounded-full"
                        style={{ width: `${(session.extensionsUsed / session.maxExtensions) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`text-sm font-medium ${
                      session.riskScore <= 20 ? 'text-medsight-ai-high' :
                      session.riskScore <= 40 ? 'text-medsight-ai-medium' :
                      'text-medsight-ai-low'
                    }`}>
                      {session.riskScore}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {session.canExtend && (
                        <button 
                          onClick={() => extendSession(session.sessionId)}
                          className="btn-medsight text-xs"
                        >
                          <PlayIcon className="w-3 h-3 mr-1" />
                          Extend
                        </button>
                      )}
                      {settings.emergencyOverrideEnabled && !session.emergencyOverride && (
                        <button 
                          onClick={() => {
                            setSelectedSession(session.sessionId);
                            setShowEmergencyDialog(true);
                          }}
                          className="btn-medsight text-xs bg-medsight-critical text-white"
                        >
                          <FireIcon className="w-3 h-3 mr-1" />
                          Override
                        </button>
                      )}
                      <button 
                        onClick={() => terminateSession(session.sessionId)}
                        className="btn-medsight text-xs bg-medsight-abnormal text-white"
                      >
                        <StopIcon className="w-3 h-3 mr-1" />
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

      {/* Recent Actions */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">Recent Actions</h3>
        <div className="space-y-3">
          {actions.slice(0, 5).map((action, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  action.type === 'override' ? 'bg-medsight-critical/10 text-medsight-critical' :
                  action.type === 'extend' ? 'bg-medsight-ai-high/10 text-medsight-ai-high' :
                  action.type === 'terminate' ? 'bg-medsight-abnormal/10 text-medsight-abnormal' :
                  'bg-medsight-pending/10 text-medsight-pending'
                }`}>
                  {action.type === 'override' && <FireIcon className="w-4 h-4" />}
                  {action.type === 'extend' && <PlayIcon className="w-4 h-4" />}
                  {action.type === 'terminate' && <StopIcon className="w-4 h-4" />}
                  {action.type === 'warning_sent' && <BellIcon className="w-4 h-4" />}
                  {action.type === 'expired' && <XCircleIcon className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{action.userName}</p>
                  <p className="text-xs text-slate-600">{action.reason}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">{formatTimestamp(action.timestamp)}</p>
                {action.approver && (
                  <p className="text-xs text-slate-500">Approved by: {action.approver}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Override Dialog */}
      {showEmergencyDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-critical">Emergency Override</h3>
              <button 
                onClick={() => setShowEmergencyDialog(false)}
                className="btn-medsight text-sm"
              >
                Cancel
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-medsight-critical/10 rounded-lg">
                <ExclamationTriangleIconSolid className="w-5 h-5 text-medsight-critical" />
                <div>
                  <p className="text-sm font-medium text-medsight-critical">Emergency Override Warning</p>
                  <p className="text-xs text-slate-600">This action will extend the session timeout and will be audited</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for Emergency Override
                </label>
                <textarea
                  value={emergencyOverrideReason}
                  onChange={(e) => setEmergencyOverrideReason(e.target.value)}
                  className="input-medsight resize-none h-24"
                  placeholder="Enter detailed reason for emergency override..."
                  required
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowEmergencyDialog(false)}
                  className="btn-medsight flex-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => emergencyOverride(selectedSession!, emergencyOverrideReason)}
                  className="btn-medsight flex-1 bg-medsight-critical text-white"
                  disabled={!emergencyOverrideReason.trim()}
                >
                  Apply Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      {showSettingsDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Timeout Settings</h3>
              <button 
                onClick={() => setShowSettingsDialog(false)}
                className="btn-medsight text-sm"
              >
                Close
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Global Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.globalTimeout / 60000}
                    onChange={(e) => setSettings({...settings, globalTimeout: parseInt(e.target.value) * 60000})}
                    className="input-medsight"
                    min="5"
                    max="60"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Warning Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.warningTime / 60000}
                    onChange={(e) => setSettings({...settings, warningTime: parseInt(e.target.value) * 60000})}
                    className="input-medsight"
                    min="1"
                    max="15"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Emergency Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.emergencyTimeout / 60000}
                    onChange={(e) => setSettings({...settings, emergencyTimeout: parseInt(e.target.value) * 60000})}
                    className="input-medsight"
                    min="15"
                    max="120"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Extensions
                  </label>
                  <input
                    type="number"
                    value={settings.maxExtensions}
                    onChange={(e) => setSettings({...settings, maxExtensions: parseInt(e.target.value)})}
                    className="input-medsight"
                    min="1"
                    max="10"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.autoExtendOnActivity}
                    onChange={(e) => setSettings({...settings, autoExtendOnActivity: e.target.checked})}
                    className="rounded border-slate-300 text-medsight-primary"
                  />
                  <span className="text-sm text-slate-700">Auto-extend on activity</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.emergencyOverrideEnabled}
                    onChange={(e) => setSettings({...settings, emergencyOverrideEnabled: e.target.checked})}
                    className="rounded border-slate-300 text-medsight-primary"
                  />
                  <span className="text-sm text-slate-700">Enable emergency override</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.supervisorApprovalRequired}
                    onChange={(e) => setSettings({...settings, supervisorApprovalRequired: e.target.checked})}
                    className="rounded border-slate-300 text-medsight-primary"
                  />
                  <span className="text-sm text-slate-700">Require supervisor approval</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.auditLogging}
                    onChange={(e) => setSettings({...settings, auditLogging: e.target.checked})}
                    className="rounded border-slate-300 text-medsight-primary"
                  />
                  <span className="text-sm text-slate-700">Enable audit logging</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 