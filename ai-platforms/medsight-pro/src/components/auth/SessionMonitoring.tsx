'use client';

import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Users,
  Activity,
  MapPin,
  Smartphone,
  Laptop,
  Globe,
  Lock,
  Unlock,
  Eye,
  X,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Timer,
  Warning
} from 'lucide-react';

interface MedicalSession {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  department: string;
  medicalLicense: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  deviceName: string;
  browser: string;
  ipAddress: string;
  location: string;
  country: string;
  startTime: Date;
  lastActivity: Date;
  duration: number; // in minutes
  isActive: boolean;
  sessionTimeout: number; // in minutes
  remainingTime: number; // in minutes
  emergencyAccess: boolean;
  complianceStatus: 'compliant' | 'warning' | 'violation';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  activityCount: number;
  hipaaCompliant: boolean;
  auditTrail: string[];
}

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  emergencySessions: number;
  expiringSessions: number;
  suspiciousSessions: number;
  averageSessionDuration: number;
  totalUsers: number;
  complianceViolations: number;
}

interface SessionMonitoringProps {
  refreshInterval?: number;
  showFilters?: boolean;
  showControls?: boolean;
  maxHeight?: string;
}

export default function SessionMonitoring({ 
  refreshInterval = 30000, 
  showFilters = true, 
  showControls = true,
  maxHeight = "600px"
}: SessionMonitoringProps) {
  const [sessions, setSessions] = useState<MedicalSession[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [sortBy, setSortBy] = useState<'startTime' | 'lastActivity' | 'duration' | 'user'>('lastActivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedSession, setSelectedSession] = useState<MedicalSession | null>(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSessions();
    
    if (autoRefresh) {
      const interval = setInterval(loadSessions, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadSessions = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/admin/sessions/monitor', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Medical-Context': 'session-monitoring',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load session data');
      }

      const data = await response.json();
      setSessions(data.sessions);
      setStats(data.stats);
    } catch (error) {
      console.error('Session monitoring error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      // Mock data for development
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockSessions: MedicalSession[] = [
      {
        id: 'session-001',
        userId: 'user-001',
        userEmail: 'sarah.chen@hospital.com',
        userName: 'Dr. Sarah Chen',
        userRole: 'Senior Radiologist',
        department: 'Radiology',
        medicalLicense: 'MD-CA-12345',
        deviceType: 'desktop',
        deviceName: 'Radiology Workstation 1',
        browser: 'Chrome 120.0',
        ipAddress: '192.168.1.101',
        location: 'San Francisco, CA',
        country: 'United States',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 5 * 60 * 1000),
        duration: 115,
        isActive: true,
        sessionTimeout: 30,
        remainingTime: 25,
        emergencyAccess: false,
        complianceStatus: 'compliant',
        riskLevel: 'low',
        activityCount: 47,
        hipaaCompliant: true,
        auditTrail: ['Login', 'DICOM Access', 'Patient Record View', 'Report Generation']
      },
      {
        id: 'session-002',
        userId: 'user-002',
        userEmail: 'michael.rodriguez@hospital.com',
        userName: 'Dr. Michael Rodriguez',
        userRole: 'Emergency Physician',
        department: 'Emergency Medicine',
        medicalLicense: 'MD-CA-23456',
        deviceType: 'mobile',
        deviceName: 'iPhone 15 Pro',
        browser: 'Safari 17.0',
        ipAddress: '10.0.1.205',
        location: 'Emergency Room',
        country: 'United States',
        startTime: new Date(Date.now() - 45 * 60 * 1000),
        lastActivity: new Date(Date.now() - 2 * 60 * 1000),
        duration: 43,
        isActive: true,
        sessionTimeout: 15,
        remainingTime: 13,
        emergencyAccess: true,
        complianceStatus: 'compliant',
        riskLevel: 'medium',
        activityCount: 23,
        hipaaCompliant: true,
        auditTrail: ['Emergency Login', 'Patient Emergency Access', 'Medication Order', 'Lab Results']
      },
      {
        id: 'session-003',
        userId: 'user-003',
        userEmail: 'emily.johnson@hospital.com',
        userName: 'Dr. Emily Johnson',
        userRole: 'Medical Resident',
        department: 'Internal Medicine',
        medicalLicense: 'MD-CA-34567',
        deviceType: 'tablet',
        deviceName: 'iPad Pro 12.9',
        browser: 'Safari 17.0',
        ipAddress: '192.168.1.157',
        location: 'Ward 3B',
        country: 'United States',
        startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 35 * 60 * 1000),
        duration: 325,
        isActive: false,
        sessionTimeout: 30,
        remainingTime: 0,
        emergencyAccess: false,
        complianceStatus: 'warning',
        riskLevel: 'medium',
        activityCount: 78,
        hipaaCompliant: true,
        auditTrail: ['Login', 'Patient Rounds', 'Chart Review', 'Session Timeout']
      },
      {
        id: 'session-004',
        userId: 'user-004',
        userEmail: 'david.kim@hospital.com',
        userName: 'Dr. David Kim',
        userRole: 'Attending Cardiologist',
        department: 'Cardiology',
        medicalLicense: 'MD-CA-45678',
        deviceType: 'desktop',
        deviceName: 'Workstation Unknown',
        browser: 'Firefox 121.0',
        ipAddress: '203.0.113.42',
        location: 'Unknown Location',
        country: 'Unknown',
        startTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 45 * 60 * 1000),
        duration: 435,
        isActive: true,
        sessionTimeout: 45,
        remainingTime: 3,
        emergencyAccess: false,
        complianceStatus: 'violation',
        riskLevel: 'critical',
        activityCount: 156,
        hipaaCompliant: false,
        auditTrail: ['Suspicious Login', 'Multiple Failed Attempts', 'Access from Unknown Location', 'Compliance Alert']
      }
    ];

    const mockStats: SessionStats = {
      totalSessions: 4,
      activeSessions: 3,
      emergencySessions: 1,
      expiringSessions: 2,
      suspiciousSessions: 1,
      averageSessionDuration: 229,
      totalUsers: 4,
      complianceViolations: 1
    };

    setSessions(mockSessions);
    setStats(mockStats);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-medsight-normal';
      case 'medium': return 'text-medsight-pending';
      case 'high': return 'text-medsight-abnormal';
      case 'critical': return 'text-medsight-critical';
      default: return 'text-slate-600';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <CheckCircle className="w-4 h-4 text-medsight-normal" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-medsight-pending" />;
      case 'high': return <Warning className="w-4 h-4 text-medsight-abnormal" />;
      case 'critical': return <XCircle className="w-4 h-4 text-medsight-critical" />;
      default: return <Shield className="w-4 h-4 text-slate-400" />;
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

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Laptop className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}/terminate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Medical-Context': 'session-termination',
        },
      });

      if (response.ok) {
        setSessions(sessions.map(session => 
          session.id === sessionId 
            ? { ...session, isActive: false, remainingTime: 0 }
            : session
        ));
      }
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  const handleExtendSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Medical-Context': 'session-extension',
        },
        body: JSON.stringify({ extensionMinutes: 30 })
      });

      if (response.ok) {
        setSessions(sessions.map(session => 
          session.id === sessionId 
            ? { ...session, remainingTime: session.remainingTime + 30 }
            : session
        ));
      }
    } catch (error) {
      console.error('Error extending session:', error);
    }
  };

  const filteredAndSortedSessions = sessions
    .filter(session => {
      const matchesSearch = 
        session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.ipAddress.includes(searchTerm);
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && session.isActive) ||
        (filterStatus === 'inactive' && !session.isActive) ||
        (filterStatus === 'emergency' && session.emergencyAccess);
      
      const matchesDepartment = filterDepartment === 'all' || session.department === filterDepartment;
      const matchesRisk = filterRisk === 'all' || session.riskLevel === filterRisk;

      return matchesSearch && matchesStatus && matchesDepartment && matchesRisk;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'startTime':
          aValue = a.startTime.getTime();
          bValue = b.startTime.getTime();
          break;
        case 'lastActivity':
          aValue = a.lastActivity.getTime();
          bValue = b.lastActivity.getTime();
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'user':
          aValue = a.userName;
          bValue = b.userName;
          break;
        default:
          aValue = a.lastActivity.getTime();
          bValue = b.lastActivity.getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="medsight-glass p-8 rounded-xl">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-medsight-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-4 text-medsight-primary">Loading session monitoring...</span>
        </div>
      </div>
    );
  }

  if (error && !sessions.length) {
    return (
      <div className="medsight-glass p-8 rounded-xl border-medsight-critical/20">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-medsight-critical mx-auto mb-4" />
          <div className="text-lg font-medium text-medsight-critical mb-2">
            Error Loading Session Data
          </div>
          <div className="text-sm text-medsight-critical/70 mb-4">
            {error}
          </div>
          <button onClick={loadSessions} className="btn-medsight">
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-medsight-primary mb-2">
              Session Monitoring
            </h2>
            <p className="text-slate-600">
              Real-time monitoring of medical professional sessions
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg ${
                  autoRefresh 
                    ? 'bg-medsight-primary/10 text-medsight-primary' 
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>
              <span className="text-sm text-slate-600">
                {autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
              </span>
            </div>
            <button onClick={loadSessions} className="btn-medsight">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-primary/10">
                <Activity className="w-6 h-6 text-medsight-primary" />
              </div>
              <span className="text-2xl font-bold text-medsight-primary">
                {stats.activeSessions}
              </span>
            </div>
            <div className="text-sm text-slate-600">Active Sessions</div>
            <div className="text-xs text-slate-500">
              {stats.totalSessions} total
            </div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-critical/10">
                <AlertTriangle className="w-6 h-6 text-medsight-critical" />
              </div>
              <span className="text-2xl font-bold text-medsight-critical">
                {stats.emergencySessions}
              </span>
            </div>
            <div className="text-sm text-slate-600">Emergency Sessions</div>
            <div className="text-xs text-slate-500">
              Immediate access
            </div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-pending/10">
                <Timer className="w-6 h-6 text-medsight-pending" />
              </div>
              <span className="text-2xl font-bold text-medsight-pending">
                {stats.expiringSessions}
              </span>
            </div>
            <div className="text-sm text-slate-600">Expiring Soon</div>
            <div className="text-xs text-slate-500">
              Within 5 minutes
            </div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-abnormal/10">
                <Shield className="w-6 h-6 text-medsight-abnormal" />
              </div>
              <span className="text-2xl font-bold text-medsight-abnormal">
                {stats.suspiciousSessions}
              </span>
            </div>
            <div className="text-sm text-slate-600">Suspicious Sessions</div>
            <div className="text-xs text-slate-500">
              Requires attention
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-medsight pl-10 w-full"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-medsight min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="emergency">Emergency</option>
            </select>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="input-medsight min-w-[180px]"
            >
              <option value="all">All Departments</option>
              <option value="Radiology">Radiology</option>
              <option value="Emergency Medicine">Emergency Medicine</option>
              <option value="Internal Medicine">Internal Medicine</option>
              <option value="Cardiology">Cardiology</option>
            </select>

            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="input-medsight min-w-[150px]"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
            </select>
          </div>
        </div>
      )}

      {/* Sessions Table */}
      <div className="medsight-glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight }}>
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Device & Location</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Session Info</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Compliance</th>
                {showControls && (
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAndSortedSessions.map((session) => (
                <tr 
                  key={session.id} 
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => {
                    setSelectedSession(session);
                    setShowSessionDetails(true);
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-medsight-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-medsight-primary font-medium text-sm">
                          {session.userName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{session.userName}</div>
                        <div className="text-sm text-slate-600">{session.userRole}</div>
                        <div className="text-xs text-slate-500">{session.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(session.deviceType)}
                        <span className="text-sm font-medium">{session.deviceName}</span>
                      </div>
                      <div className="text-sm text-slate-600">{session.browser}</div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{session.location}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        Duration: {formatDuration(session.duration)}
                      </div>
                      <div className="text-sm text-slate-600">
                        Last activity: {formatLastActivity(session.lastActivity)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {session.activityCount} activities
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {session.isActive ? (
                          <CheckCircle className="w-4 h-4 text-medsight-normal" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-sm font-medium">
                          {session.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {session.isActive && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-medsight-pending" />
                          <span className="text-sm text-medsight-pending">
                            {session.remainingTime}m left
                          </span>
                        </div>
                      )}
                      {session.emergencyAccess && (
                        <div className="px-2 py-1 rounded-full text-xs bg-medsight-critical/10 text-medsight-critical">
                          Emergency Access
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getRiskIcon(session.riskLevel)}
                        <span className={`text-sm font-medium ${getRiskColor(session.riskLevel)}`}>
                          {session.riskLevel} risk
                        </span>
                      </div>
                      <div className={`text-sm ${getComplianceColor(session.complianceStatus)}`}>
                        {session.complianceStatus}
                      </div>
                      {session.hipaaCompliant && (
                        <div className="px-2 py-1 rounded-full text-xs bg-medsight-normal/10 text-medsight-normal">
                          HIPAA
                        </div>
                      )}
                    </div>
                  </td>
                  {showControls && (
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSession(session);
                            setShowSessionDetails(true);
                          }}
                          className="p-2 text-slate-400 hover:text-medsight-primary rounded-lg hover:bg-medsight-primary/10"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {session.isActive && (
                          <>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExtendSession(session.id);
                              }}
                              className="p-2 text-slate-400 hover:text-medsight-secondary rounded-lg hover:bg-medsight-secondary/10"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTerminateSession(session.id);
                              }}
                              className="p-2 text-slate-400 hover:text-medsight-critical rounded-lg hover:bg-medsight-critical/10"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredAndSortedSessions.length === 0 && (
        <div className="medsight-glass p-8 rounded-xl text-center">
          <Monitor className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <div className="text-lg font-medium text-slate-600 mb-2">
            No sessions found
          </div>
          <div className="text-sm text-slate-500">
            Try adjusting your search criteria or filters
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {showSessionDetails && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-medsight-primary">
                Session Details
              </h3>
              <button
                onClick={() => setShowSessionDetails(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* User Info */}
              <div className="space-y-2">
                <h4 className="font-medium text-medsight-primary">User Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Name:</span>
                    <span className="ml-2 font-medium">{selectedSession.userName}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Role:</span>
                    <span className="ml-2 font-medium">{selectedSession.userRole}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Department:</span>
                    <span className="ml-2 font-medium">{selectedSession.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">License:</span>
                    <span className="ml-2 font-medium">{selectedSession.medicalLicense}</span>
                  </div>
                </div>
              </div>

              {/* Session Info */}
              <div className="space-y-2">
                <h4 className="font-medium text-medsight-primary">Session Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Start Time:</span>
                    <span className="ml-2 font-medium">{selectedSession.startTime.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Duration:</span>
                    <span className="ml-2 font-medium">{formatDuration(selectedSession.duration)}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Last Activity:</span>
                    <span className="ml-2 font-medium">{formatLastActivity(selectedSession.lastActivity)}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Activities:</span>
                    <span className="ml-2 font-medium">{selectedSession.activityCount}</span>
                  </div>
                </div>
              </div>

              {/* Device Info */}
              <div className="space-y-2">
                <h4 className="font-medium text-medsight-primary">Device Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Device:</span>
                    <span className="ml-2 font-medium">{selectedSession.deviceName}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Browser:</span>
                    <span className="ml-2 font-medium">{selectedSession.browser}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">IP Address:</span>
                    <span className="ml-2 font-medium">{selectedSession.ipAddress}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Location:</span>
                    <span className="ml-2 font-medium">{selectedSession.location}</span>
                  </div>
                </div>
              </div>

              {/* Compliance Info */}
              <div className="space-y-2">
                <h4 className="font-medium text-medsight-primary">Compliance Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Risk Level:</span>
                    <span className={`ml-2 font-medium ${getRiskColor(selectedSession.riskLevel)}`}>
                      {selectedSession.riskLevel}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Compliance:</span>
                    <span className={`ml-2 font-medium ${getComplianceColor(selectedSession.complianceStatus)}`}>
                      {selectedSession.complianceStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">HIPAA Compliant:</span>
                    <span className={`ml-2 font-medium ${selectedSession.hipaaCompliant ? 'text-medsight-normal' : 'text-medsight-critical'}`}>
                      {selectedSession.hipaaCompliant ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Audit Trail */}
              <div className="space-y-2">
                <h4 className="font-medium text-medsight-primary">Audit Trail</h4>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    {selectedSession.auditTrail.map((event, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-medsight-primary rounded-full"></div>
                        <span>{event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedSession.isActive && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleExtendSession(selectedSession.id)}
                    className="btn-medsight"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Extend Session
                  </button>
                  <button
                    onClick={() => handleTerminateSession(selectedSession.id)}
                    className="px-4 py-2 bg-medsight-critical/10 text-medsight-critical rounded-lg hover:bg-medsight-critical/20 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Terminate Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 