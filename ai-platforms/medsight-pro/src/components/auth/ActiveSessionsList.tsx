'use client';

import { useState, useEffect } from 'react';
import { 
  UserIcon, 
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  XCircleIcon,
  CheckCircleIcon,
  SignalIcon,
  WifiIcon,
  LockClosedIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ChartBarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  BellIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { 
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid
} from '@heroicons/react/24/solid';
import React from 'react';

interface ActiveSession {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  userLicense: string;
  userDepartment: string;
  userOrganization: string;
  ipAddress: string;
  location: string;
  device: string;
  deviceId: string;
  browser: string;
  os: string;
  startTime: string;
  lastActivity: string;
  duration: number;
  status: 'active' | 'idle' | 'timeout_warning' | 'emergency_access';
  securityLevel: 'high' | 'medium' | 'low';
  complianceStatus: 'compliant' | 'warning' | 'violation';
  mfaStatus: boolean;
  emergencyAccess: boolean;
  medicalActivity: string;
  currentPage: string;
  dataAccessed: string[];
  permissions: string[];
  riskScore: number;
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
  connectionType: 'ethernet' | 'wifi' | 'cellular';
  sessionData: {
    bytesTransferred: number;
    requestsCount: number;
    errorsCount: number;
    averageResponseTime: number;
  };
  medicalData: {
    studiesAccessed: number;
    patientsAccessed: number;
    imagesViewed: number;
    reportsGenerated: number;
  };
  complianceMetrics: {
    auditLogsGenerated: number;
    dataRetentionCompliance: boolean;
    encryptionStatus: boolean;
    backupStatus: boolean;
  };
}

interface SessionFilters {
  search: string;
  role: string;
  status: string;
  location: string;
  device: string;
  securityLevel: string;
  riskLevel: string;
}

export default function ActiveSessionsList() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [filters, setFilters] = useState<SessionFilters>({
    search: '',
    role: 'all',
    status: 'all',
    location: 'all',
    device: 'all',
    securityLevel: 'all',
    riskLevel: 'all'
  });
  const [sortBy, setSortBy] = useState<string>('lastActivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 seconds

  useEffect(() => {
    loadActiveSessions();
    const interval = setInterval(loadActiveSessions, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadActiveSessions = async () => {
    try {
      // Mock data - in production, this would connect to backend session-management.ts
      const mockSessions: ActiveSession[] = [
        {
          id: 'sess_active_001',
          userId: 'user_001',
          userName: 'Dr. Sarah Johnson',
          userRole: 'Radiologist',
          userLicense: 'MD-12345',
          userDepartment: 'Radiology',
          userOrganization: 'General Hospital',
          ipAddress: '192.168.1.100',
          location: 'New York, NY',
          device: 'Desktop',
          deviceId: 'WS-RAD-001',
          browser: 'Chrome 118.0',
          os: 'Windows 11',
          startTime: '2024-01-15T08:30:00Z',
          lastActivity: '2024-01-15T09:15:00Z',
          duration: 2700000, // 45 minutes
          status: 'active',
          securityLevel: 'high',
          complianceStatus: 'compliant',
          mfaStatus: true,
          emergencyAccess: false,
          medicalActivity: 'Reviewing CT Scans',
          currentPage: '/workspace/imaging/dicom-viewer',
          dataAccessed: ['CT_Study_001', 'CT_Study_002', 'Patient_Record_123'],
          permissions: ['read_medical_data', 'write_reports', 'access_imaging'],
          riskScore: 15,
          networkQuality: 'excellent',
          connectionType: 'ethernet',
          sessionData: {
            bytesTransferred: 2547832,
            requestsCount: 156,
            errorsCount: 2,
            averageResponseTime: 245
          },
          medicalData: {
            studiesAccessed: 8,
            patientsAccessed: 5,
            imagesViewed: 24,
            reportsGenerated: 3
          },
          complianceMetrics: {
            auditLogsGenerated: 23,
            dataRetentionCompliance: true,
            encryptionStatus: true,
            backupStatus: true
          }
        },
        {
          id: 'sess_active_002',
          userId: 'user_002',
          userName: 'Dr. Michael Chen',
          userRole: 'Cardiologist',
          userLicense: 'MD-67890',
          userDepartment: 'Cardiology',
          userOrganization: 'Heart Center',
          ipAddress: '10.0.1.50',
          location: 'Los Angeles, CA',
          device: 'Tablet',
          deviceId: 'iPad-CARD-005',
          browser: 'Safari 17.0',
          os: 'iOS 17.1',
          startTime: '2024-01-15T07:00:00Z',
          lastActivity: '2024-01-15T08:45:00Z',
          duration: 6300000, // 1h 45m
          status: 'idle',
          securityLevel: 'medium',
          complianceStatus: 'warning',
          mfaStatus: true,
          emergencyAccess: false,
          medicalActivity: 'Cardiac Analysis',
          currentPage: '/workspace/ai-analysis/cardiac-ai',
          dataAccessed: ['Echo_Study_002', 'EKG_Report_456', 'Patient_Record_789'],
          permissions: ['read_medical_data', 'write_reports', 'access_cardiology'],
          riskScore: 35,
          networkQuality: 'good',
          connectionType: 'wifi',
          sessionData: {
            bytesTransferred: 1256794,
            requestsCount: 89,
            errorsCount: 5,
            averageResponseTime: 412
          },
          medicalData: {
            studiesAccessed: 12,
            patientsAccessed: 7,
            imagesViewed: 18,
            reportsGenerated: 5
          },
          complianceMetrics: {
            auditLogsGenerated: 34,
            dataRetentionCompliance: true,
            encryptionStatus: true,
            backupStatus: false
          }
        },
        {
          id: 'sess_active_003',
          userId: 'user_003',
          userName: 'Dr. Emily Rodriguez',
          userRole: 'Emergency Physician',
          userLicense: 'MD-11111',
          userDepartment: 'Emergency Medicine',
          userOrganization: 'Trauma Center',
          ipAddress: '172.16.0.25',
          location: 'Chicago, IL',
          device: 'Mobile',
          deviceId: 'iPhone-EM-012',
          browser: 'Chrome Mobile 118.0',
          os: 'iOS 17.1',
          startTime: '2024-01-15T06:15:00Z',
          lastActivity: '2024-01-15T09:20:00Z',
          duration: 10800000, // 3 hours
          status: 'emergency_access',
          securityLevel: 'high',
          complianceStatus: 'compliant',
          mfaStatus: true,
          emergencyAccess: true,
          medicalActivity: 'Emergency Case Review',
          currentPage: '/workspace/emergency/trauma-cases',
          dataAccessed: ['Xray_Study_003', 'Trauma_Case_789', 'Patient_Record_456'],
          permissions: ['read_medical_data', 'write_reports', 'emergency_access', 'override_restrictions'],
          riskScore: 25,
          networkQuality: 'fair',
          connectionType: 'cellular',
          sessionData: {
            bytesTransferred: 3892156,
            requestsCount: 234,
            errorsCount: 8,
            averageResponseTime: 678
          },
          medicalData: {
            studiesAccessed: 15,
            patientsAccessed: 12,
            imagesViewed: 42,
            reportsGenerated: 8
          },
          complianceMetrics: {
            auditLogsGenerated: 67,
            dataRetentionCompliance: true,
            encryptionStatus: true,
            backupStatus: true
          }
        }
      ];

      setSessions(mockSessions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading active sessions:', error);
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      // Mock termination - in production, this would call backend API
      setSessions(sessions.filter(session => session.id !== sessionId));
      setSelectedSessions(selectedSessions.filter(id => id !== sessionId));
      // Show success notification
      console.log(`Session ${sessionId} terminated successfully`);
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  const terminateSelectedSessions = async () => {
    try {
      // Mock bulk termination
      setSessions(sessions.filter(session => !selectedSessions.includes(session.id)));
      setSelectedSessions([]);
      console.log(`${selectedSessions.length} sessions terminated successfully`);
    } catch (error) {
      console.error('Error terminating selected sessions:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-medsight-normal';
      case 'idle': return 'text-medsight-pending';
      case 'timeout_warning': return 'text-medsight-abnormal';
      case 'emergency_access': return 'text-medsight-critical';
      default: return 'text-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'idle': return <ClockIcon className="w-4 h-4" />;
      case 'timeout_warning': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'emergency_access': return <ExclamationTriangleIconSolid className="w-4 h-4" />;
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

  const getNetworkQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-medsight-normal';
      case 'good': return 'text-medsight-ai-high';
      case 'fair': return 'text-medsight-pending';
      case 'poor': return 'text-medsight-abnormal';
      default: return 'text-slate-600';
    }
  };

  const getRiskLevelColor = (score: number) => {
    if (score <= 20) return 'text-medsight-ai-high';
    if (score <= 40) return 'text-medsight-ai-medium';
    return 'text-medsight-ai-low';
  };

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
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

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
                         session.userLicense.toLowerCase().includes(filters.search.toLowerCase()) ||
                         session.ipAddress.includes(filters.search);
    const matchesRole = filters.role === 'all' || session.userRole.toLowerCase().includes(filters.role.toLowerCase());
    const matchesStatus = filters.status === 'all' || session.status === filters.status;
    const matchesLocation = filters.location === 'all' || session.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesDevice = filters.device === 'all' || session.device.toLowerCase() === filters.device.toLowerCase();
    const matchesSecurityLevel = filters.securityLevel === 'all' || session.securityLevel === filters.securityLevel;
    const matchesRiskLevel = filters.riskLevel === 'all' || 
                           (filters.riskLevel === 'low' && session.riskScore <= 20) ||
                           (filters.riskLevel === 'medium' && session.riskScore > 20 && session.riskScore <= 40) ||
                           (filters.riskLevel === 'high' && session.riskScore > 40);

    return matchesSearch && matchesRole && matchesStatus && matchesLocation && 
           matchesDevice && matchesSecurityLevel && matchesRiskLevel;
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
          <h2 className="text-2xl font-bold text-medsight-primary">Active Sessions</h2>
          <p className="text-slate-600 mt-1">Real-time monitoring of active medical professional sessions</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setRefreshInterval(refreshInterval === 5000 ? 10000 : 5000)}
            className="btn-medsight"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Auto-refresh: {refreshInterval / 1000}s
          </button>
          {selectedSessions.length > 0 && (
            <button 
              onClick={terminateSelectedSessions}
              className="btn-medsight bg-medsight-abnormal text-white"
            >
              <XCircleIcon className="w-4 h-4 mr-2" />
              Terminate Selected ({selectedSessions.length})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-medsight-primary">Filters</h3>
          <button 
            onClick={() => setFilters({
              search: '',
              role: 'all',
              status: 'all',
              location: 'all',
              device: 'all',
              securityLevel: 'all',
              riskLevel: 'all'
            })}
            className="btn-medsight text-sm"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="User, license, or IP..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="input-medsight pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select 
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
              className="input-medsight"
            >
              <option value="all">All Roles</option>
              <option value="radiologist">Radiologist</option>
              <option value="cardiologist">Cardiologist</option>
              <option value="emergency">Emergency Physician</option>
              <option value="surgeon">Surgeon</option>
              <option value="resident">Resident</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="input-medsight"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="timeout_warning">Timeout Warning</option>
              <option value="emergency_access">Emergency Access</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Security Level</label>
            <select 
              value={filters.securityLevel}
              onChange={(e) => setFilters({...filters, securityLevel: e.target.value})}
              className="input-medsight"
            >
              <option value="all">All Levels</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-medsight-primary">
            Active Sessions ({filteredSessions.length})
          </h3>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">
              {filteredSessions.length} of {sessions.length} sessions
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedSessions.length === filteredSessions.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSessions(filteredSessions.map(s => s.id));
                      } else {
                        setSelectedSessions([]);
                      }
                    }}
                    className="rounded border-slate-300 text-medsight-primary"
                  />
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Device</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Location</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Duration</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Activity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Security</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Risk</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => (
                <tr key={session.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedSessions.includes(session.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSessions([...selectedSessions, session.id]);
                        } else {
                          setSelectedSessions(selectedSessions.filter(id => id !== session.id));
                        }
                      }}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-medsight-primary/10 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-medsight-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{session.userName}</p>
                        <p className="text-xs text-slate-500">{session.userRole} • {session.userLicense}</p>
                        <p className="text-xs text-slate-500">{session.userOrganization}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center space-x-2 ${getStatusColor(session.status)}`}>
                      {getStatusIcon(session.status)}
                      <span className="text-sm font-medium capitalize">{session.status.replace('_', ' ')}</span>
                    </div>
                    {session.emergencyAccess && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-medsight-critical/10 text-medsight-critical mt-1">
                        Emergency Access
                      </span>
                    )}
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
                    <div className={`flex items-center space-x-1 mt-1 ${getNetworkQualityColor(session.networkQuality)}`}>
                      <WifiIcon className="w-3 h-3" />
                      <span className="text-xs capitalize">{session.networkQuality}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-600">{session.location}</p>
                        <p className="text-xs text-slate-500">{session.ipAddress}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-slate-600">{formatDuration(session.duration)}</p>
                      <p className="text-xs text-slate-500">
                        Last: {formatTimestamp(session.lastActivity)}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-slate-600">{session.medicalActivity}</p>
                      <p className="text-xs text-slate-500">
                        {session.medicalData.studiesAccessed} studies • {session.medicalData.imagesViewed} images
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getSecurityLevelColor(session.securityLevel)} bg-current`}></div>
                      <span className={`text-xs font-medium ${getSecurityLevelColor(session.securityLevel)}`}>
                        {session.securityLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      {session.mfaStatus && (
                        <LockClosedIcon className="w-3 h-3 text-medsight-normal" />
                      )}
                      {session.complianceMetrics.encryptionStatus && (
                        <ShieldCheckIconSolid className="w-3 h-3 text-medsight-normal" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`text-sm font-medium ${getRiskLevelColor(session.riskScore)}`}>
                      {session.riskScore}
                    </div>
                    <div className="w-16 bg-slate-200 rounded-full h-1 mt-1">
                      <div 
                        className={`h-1 rounded-full ${getRiskLevelColor(session.riskScore)} bg-current`}
                        style={{ width: `${Math.min(session.riskScore, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setShowDetails(showDetails === session.id ? null : session.id)}
                        className="btn-medsight text-xs"
                      >
                        <EyeIcon className="w-3 h-3 mr-1" />
                        {showDetails === session.id ? 'Hide' : 'Details'}
                      </button>
                      <button 
                        onClick={() => terminateSession(session.id)}
                        className="btn-medsight text-xs bg-medsight-abnormal text-white"
                      >
                        <XCircleIcon className="w-3 h-3 mr-1" />
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

      {/* Session Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            {(() => {
              const session = sessions.find(s => s.id === showDetails);
              if (!session) return null;
              
              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-medsight-primary">Session Details</h3>
                    <button 
                      onClick={() => setShowDetails(null)}
                      className="btn-medsight text-sm"
                    >
                      Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User Information */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-medsight-primary">User Information</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {session.userName}</p>
                        <p><span className="font-medium">Role:</span> {session.userRole}</p>
                        <p><span className="font-medium">License:</span> {session.userLicense}</p>
                        <p><span className="font-medium">Department:</span> {session.userDepartment}</p>
                        <p><span className="font-medium">Organization:</span> {session.userOrganization}</p>
                      </div>
                    </div>

                    {/* Session Information */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-medsight-primary">Session Information</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Session ID:</span> {session.id}</p>
                        <p><span className="font-medium">Started:</span> {formatTimestamp(session.startTime)}</p>
                        <p><span className="font-medium">Duration:</span> {formatDuration(session.duration)}</p>
                        <p><span className="font-medium">Last Activity:</span> {formatTimestamp(session.lastActivity)}</p>
                        <p><span className="font-medium">Current Page:</span> {session.currentPage}</p>
                      </div>
                    </div>

                    {/* Technical Details */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-medsight-primary">Technical Details</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">IP Address:</span> {session.ipAddress}</p>
                        <p><span className="font-medium">Device:</span> {session.device} ({session.deviceId})</p>
                        <p><span className="font-medium">Browser:</span> {session.browser}</p>
                        <p><span className="font-medium">OS:</span> {session.os}</p>
                        <p><span className="font-medium">Connection:</span> {session.connectionType}</p>
                        <p><span className="font-medium">Network Quality:</span> {session.networkQuality}</p>
                      </div>
                    </div>

                    {/* Medical Activity */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-medsight-primary">Medical Activity</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Current Activity:</span> {session.medicalActivity}</p>
                        <p><span className="font-medium">Studies Accessed:</span> {session.medicalData.studiesAccessed}</p>
                        <p><span className="font-medium">Patients Accessed:</span> {session.medicalData.patientsAccessed}</p>
                        <p><span className="font-medium">Images Viewed:</span> {session.medicalData.imagesViewed}</p>
                        <p><span className="font-medium">Reports Generated:</span> {session.medicalData.reportsGenerated}</p>
                      </div>
                    </div>

                    {/* Session Metrics */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-medsight-primary">Session Metrics</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Data Transferred:</span> {formatBytes(session.sessionData.bytesTransferred)}</p>
                        <p><span className="font-medium">Requests:</span> {session.sessionData.requestsCount}</p>
                        <p><span className="font-medium">Errors:</span> {session.sessionData.errorsCount}</p>
                        <p><span className="font-medium">Avg Response Time:</span> {session.sessionData.averageResponseTime}ms</p>
                        <p><span className="font-medium">Risk Score:</span> {session.riskScore}</p>
                      </div>
                    </div>

                    {/* Compliance Status */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-medsight-primary">Compliance Status</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Audit Logs:</span> {session.complianceMetrics.auditLogsGenerated}</p>
                        <p><span className="font-medium">Data Retention:</span> {session.complianceMetrics.dataRetentionCompliance ? 'Compliant' : 'Non-compliant'}</p>
                        <p><span className="font-medium">Encryption:</span> {session.complianceMetrics.encryptionStatus ? 'Enabled' : 'Disabled'}</p>
                        <p><span className="font-medium">Backup:</span> {session.complianceMetrics.backupStatus ? 'Active' : 'Inactive'}</p>
                        <p><span className="font-medium">MFA:</span> {session.mfaStatus ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Data Access Log */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-medsight-primary">Data Access Log</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="space-y-2">
                        {session.dataAccessed.map((data, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">{data}</span>
                            <span className="text-xs text-slate-500">Accessed</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-medsight-primary">Permissions</h4>
                    <div className="flex flex-wrap gap-2">
                      {session.permissions.map((permission) => (
                        <span key={permission} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-medsight-ai-high/10 text-medsight-ai-high">
                          {permission.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
} 