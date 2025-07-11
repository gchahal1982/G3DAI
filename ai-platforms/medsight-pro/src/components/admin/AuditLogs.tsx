'use client';

import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserIcon,
  CogIcon,
  KeyIcon,
  CircleStackIcon,
  ClockIcon,
  CalendarIcon,
  ChartBarIcon,
  BellIcon,
  LockClosedIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  CubeIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  FireIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';

interface AuditLog {
  id: string;
  timestamp: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
  activity: {
    type: 'login' | 'logout' | 'data_access' | 'data_export' | 'config_change' | 'user_management' | 'system_action' | 'security_event' | 'file_operation' | 'api_call';
    category: 'authentication' | 'authorization' | 'data_access' | 'system_config' | 'user_activity' | 'security' | 'compliance' | 'performance';
    action: string;
    description: string;
    details: Record<string, any>;
  };
  resource: {
    type: string;
    id: string;
    name: string;
    path?: string;
  };
  security: {
    level: 'info' | 'warning' | 'error' | 'critical';
    riskScore: number;
    threatCategory?: string;
    compliance: string[];
  };
  session: {
    id: string;
    ipAddress: string;
    userAgent: string;
    location: string;
    device: string;
  };
  result: {
    status: 'success' | 'failure' | 'partial' | 'blocked';
    message: string;
    errorCode?: string;
    duration?: number;
  };
  metadata: {
    source: string;
    version: string;
    traceId: string;
    correlationId: string;
    tags: string[];
  };
}

interface AuditSummary {
  totalEvents: number;
  securityEvents: number;
  failedLogins: number;
  dataExports: number;
  configChanges: number;
  riskScore: number;
  complianceScore: number;
  activeUsers: number;
  timeRange: {
    start: Date;
    end: Date;
  };
}

interface LogFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  users: string[];
  activities: string[];
  securityLevels: string[];
  resources: string[];
  status: string[];
  searchTerm: string;
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'table' | 'security' | 'compliance'>('timeline');
  const [filters, setFilters] = useState<LogFilter>({
    dateRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date()
    },
    users: [],
    activities: [],
    securityLevels: [],
    resources: [],
    status: [],
    searchTerm: ''
  });

  useEffect(() => {
    loadAuditLogs();
  }, [filters]);

  const loadAuditLogs = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockLogs: AuditLog[] = [
      {
        id: 'log-001',
        timestamp: new Date(),
        user: {
          id: 'user-001',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@hospital.com',
          role: 'Radiologist',
          department: 'Radiology'
        },
        activity: {
          type: 'data_access',
          category: 'data_access',
          action: 'VIEW_PATIENT_STUDY',
          description: 'Accessed patient DICOM study for review',
          details: {
            studyId: 'ST-2023-001',
            patientId: 'PT-2023-456',
            modality: 'CT',
            bodyPart: 'Chest'
          }
        },
        resource: {
          type: 'dicom_study',
          id: 'ST-2023-001',
          name: 'Chest CT - Patient 456',
          path: '/studies/2023/001'
        },
        security: {
          level: 'info',
          riskScore: 2,
          compliance: ['HIPAA', 'GDPR']
        },
        session: {
          id: 'sess-001',
          ipAddress: '192.168.1.45',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          location: 'Hospital Network',
          device: 'Desktop'
        },
        result: {
          status: 'success',
          message: 'Study accessed successfully',
          duration: 250
        },
        metadata: {
          source: 'dicom_viewer',
          version: '2.1.0',
          traceId: 'trace-001',
          correlationId: 'corr-001',
          tags: ['medical_imaging', 'patient_care']
        }
      },
      {
        id: 'log-002',
        timestamp: new Date(Date.now() - 300000),
        user: {
          id: 'user-002',
          name: 'John Smith',
          email: 'john.smith@external.com',
          role: 'Guest',
          department: 'External'
        },
        activity: {
          type: 'login',
          category: 'authentication',
          action: 'FAILED_LOGIN',
          description: 'Failed login attempt with invalid credentials',
          details: {
            attemptCount: 3,
            lastAttempt: new Date(Date.now() - 300000),
            reason: 'Invalid password'
          }
        },
        resource: {
          type: 'authentication',
          id: 'auth-system',
          name: 'MedSight Pro Login'
        },
        security: {
          level: 'error',
          riskScore: 8,
          threatCategory: 'brute_force',
          compliance: ['Security Policy']
        },
        session: {
          id: 'sess-002',
          ipAddress: '203.0.113.45',
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
          location: 'External Network',
          device: 'Desktop'
        },
        result: {
          status: 'blocked',
          message: 'Login blocked due to multiple failed attempts',
          errorCode: 'AUTH_FAILED_MULTIPLE'
        },
        metadata: {
          source: 'auth_service',
          version: '1.5.2',
          traceId: 'trace-002',
          correlationId: 'corr-002',
          tags: ['security', 'authentication']
        }
      },
      {
        id: 'log-003',
        timestamp: new Date(Date.now() - 600000),
        user: {
          id: 'user-003',
          name: 'Admin User',
          email: 'admin@hospital.com',
          role: 'System Administrator',
          department: 'IT'
        },
        activity: {
          type: 'config_change',
          category: 'system_config',
          action: 'UPDATE_SYSTEM_SETTINGS',
          description: 'Updated system configuration settings',
          details: {
            settingsChanged: ['backup_schedule', 'security_policy'],
            oldValues: { backup_schedule: 'daily', security_policy: 'standard' },
            newValues: { backup_schedule: 'hourly', security_policy: 'strict' }
          }
        },
        resource: {
          type: 'system_config',
          id: 'config-001',
          name: 'System Settings',
          path: '/admin/settings'
        },
        security: {
          level: 'warning',
          riskScore: 5,
          compliance: ['Change Management', 'Security Policy']
        },
        session: {
          id: 'sess-003',
          ipAddress: '192.168.1.10',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          location: 'Hospital Network',
          device: 'Desktop'
        },
        result: {
          status: 'success',
          message: 'Configuration updated successfully',
          duration: 1200
        },
        metadata: {
          source: 'admin_panel',
          version: '2.0.1',
          traceId: 'trace-003',
          correlationId: 'corr-003',
          tags: ['system_admin', 'configuration']
        }
      },
      {
        id: 'log-004',
        timestamp: new Date(Date.now() - 900000),
        user: {
          id: 'user-004',
          name: 'Dr. Michael Chen',
          email: 'michael.chen@hospital.com',
          role: 'Cardiologist',
          department: 'Cardiology'
        },
        activity: {
          type: 'data_export',
          category: 'data_access',
          action: 'EXPORT_PATIENT_DATA',
          description: 'Exported patient data for research purposes',
          details: {
            exportType: 'anonymized',
            patientCount: 150,
            dataTypes: ['demographics', 'imaging', 'reports'],
            purpose: 'Clinical Research'
          }
        },
        resource: {
          type: 'patient_data',
          id: 'export-001',
          name: 'Cardiology Research Dataset',
          path: '/exports/research/cardiology'
        },
        security: {
          level: 'critical',
          riskScore: 9,
          compliance: ['HIPAA', 'Research Ethics', 'Data Protection']
        },
        session: {
          id: 'sess-004',
          ipAddress: '192.168.1.75',
          userAgent: 'Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7)',
          location: 'Hospital Network',
          device: 'MacBook Pro'
        },
        result: {
          status: 'success',
          message: 'Data exported with proper anonymization',
          duration: 45000
        },
        metadata: {
          source: 'data_export_service',
          version: '1.8.0',
          traceId: 'trace-004',
          correlationId: 'corr-004',
          tags: ['data_export', 'research', 'compliance']
        }
      },
      {
        id: 'log-005',
        timestamp: new Date(Date.now() - 1200000),
        user: {
          id: 'system',
          name: 'System Process',
          email: 'system@hospital.com',
          role: 'System',
          department: 'System'
        },
        activity: {
          type: 'system_action',
          category: 'security',
          action: 'SECURITY_SCAN',
          description: 'Automated security vulnerability scan completed',
          details: {
            scanType: 'vulnerability',
            targetsScanned: 45,
            vulnerabilitiesFound: 2,
            highRiskFindings: 0,
            mediumRiskFindings: 2
          }
        },
        resource: {
          type: 'security_system',
          id: 'scan-001',
          name: 'Vulnerability Scanner',
          path: '/security/scans'
        },
        security: {
          level: 'info',
          riskScore: 3,
          compliance: ['Security Policy', 'Vulnerability Management']
        },
        session: {
          id: 'sess-system',
          ipAddress: '127.0.0.1',
          userAgent: 'SecurityScanner/2.0',
          location: 'Internal System',
          device: 'Server'
        },
        result: {
          status: 'success',
          message: 'Security scan completed successfully',
          duration: 3600000
        },
        metadata: {
          source: 'security_scanner',
          version: '2.0.0',
          traceId: 'trace-005',
          correlationId: 'corr-005',
          tags: ['security', 'vulnerability', 'automated']
        }
      }
    ];

    const mockSummary: AuditSummary = {
      totalEvents: 1247,
      securityEvents: 23,
      failedLogins: 8,
      dataExports: 4,
      configChanges: 12,
      riskScore: 6.2,
      complianceScore: 94,
      activeUsers: 87,
      timeRange: {
        start: filters.dateRange.start,
        end: filters.dateRange.end
      }
    };

    setLogs(mockLogs);
    setSummary(mockSummary);
    setLoading(false);
  };

  const getActivityIcon = (type: AuditLog['activity']['type']) => {
    switch (type) {
      case 'login': return UserIcon;
      case 'logout': return UserIcon;
      case 'data_access': return CircleStackIcon;
      case 'data_export': return DocumentArrowUpIcon;
      case 'config_change': return CogIcon;
      case 'user_management': return UserIcon;
      case 'system_action': return ComputerDesktopIcon;
      case 'security_event': return ShieldCheckIcon;
      case 'file_operation': return DocumentTextIcon;
      case 'api_call': return GlobeAltIcon;
      default: return InformationCircleIcon;
    }
  };

  const getSecurityIcon = (level: AuditLog['security']['level']) => {
    switch (level) {
      case 'critical': return FireIcon;
      case 'error': return ExclamationCircleIcon;
      case 'warning': return ExclamationTriangleIcon;
      case 'info': return InformationCircleIcon;
      default: return InformationCircleIcon;
    }
  };

  const getSecurityColor = (level: AuditLog['security']['level']) => {
    switch (level) {
      case 'critical': return 'text-medsight-critical';
      case 'error': return 'text-medsight-critical';
      case 'warning': return 'text-medsight-pending';
      case 'info': return 'text-medsight-normal';
      default: return 'text-medsight-primary';
    }
  };

  const getStatusIcon = (status: AuditLog['result']['status']) => {
    switch (status) {
      case 'success': return CheckCircleIcon;
      case 'failure': return XCircleIcon;
      case 'partial': return ExclamationCircleIcon;
      case 'blocked': return LockClosedIcon;
      default: return InformationCircleIcon;
    }
  };

  const getStatusColor = (status: AuditLog['result']['status']) => {
    switch (status) {
      case 'success': return 'text-medsight-normal';
      case 'failure': return 'text-medsight-critical';
      case 'partial': return 'text-medsight-pending';
      case 'blocked': return 'text-medsight-critical';
      default: return 'text-medsight-primary';
    }
  };

  const toggleStreaming = () => {
    setStreaming(!streaming);
  };

  const exportLogs = () => {
    console.log('Exporting logs...');
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = filters.searchTerm === '' || 
      log.user.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      log.activity.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      log.resource.name.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const matchesDateRange = log.timestamp >= filters.dateRange.start && 
      log.timestamp <= filters.dateRange.end;

    const matchesUsers = filters.users.length === 0 || 
      filters.users.includes(log.user.id);

    const matchesActivities = filters.activities.length === 0 || 
      filters.activities.includes(log.activity.type);

    const matchesSecurityLevels = filters.securityLevels.length === 0 || 
      filters.securityLevels.includes(log.security.level);

    const matchesStatus = filters.status.length === 0 || 
      filters.status.includes(log.result.status);

    return matchesSearch && matchesDateRange && matchesUsers && 
           matchesActivities && matchesSecurityLevels && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="medsight-glass p-8 rounded-xl">
          <div className="w-8 h-8 border-4 border-medsight-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-sm text-medsight-primary">Loading audit logs...</div>
        </div>
      </div>
    );
  }

  const renderSummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="medsight-control-glass p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="w-6 h-6 text-medsight-primary" />
          <div>
            <div className="text-2xl font-bold text-medsight-primary">{summary?.totalEvents}</div>
            <div className="text-sm text-medsight-primary/70">Total Events</div>
            <div className="text-xs text-medsight-primary/50">Last 24 hours</div>
          </div>
        </div>
      </div>
      
      <div className="medsight-control-glass p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className="w-6 h-6 text-medsight-secondary" />
          <div>
            <div className="text-2xl font-bold text-medsight-secondary">{summary?.securityEvents}</div>
            <div className="text-sm text-medsight-secondary/70">Security Events</div>
            <div className="text-xs text-medsight-secondary/50">{summary?.failedLogins} failed logins</div>
          </div>
        </div>
      </div>
      
      <div className="medsight-control-glass p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="w-6 h-6 text-medsight-pending" />
          <div>
            <div className="text-2xl font-bold text-medsight-pending">{summary?.riskScore.toFixed(1)}</div>
            <div className="text-sm text-medsight-pending/70">Risk Score</div>
            <div className="text-xs text-medsight-pending/50">Out of 10</div>
          </div>
        </div>
      </div>
      
      <div className="medsight-control-glass p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <CheckCircleIcon className="w-6 h-6 text-medsight-normal" />
          <div>
            <div className="text-2xl font-bold text-medsight-normal">{summary?.complianceScore}%</div>
            <div className="text-sm text-medsight-normal/70">Compliance Score</div>
            <div className="text-xs text-medsight-normal/50">{summary?.activeUsers} active users</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-4">
      {filteredLogs.map(log => {
        const ActivityIcon = getActivityIcon(log.activity.type);
        const SecurityIcon = getSecurityIcon(log.security.level);
        const StatusIcon = getStatusIcon(log.result.status);
        
        return (
          <div key={log.id} className="medsight-glass p-4 rounded-xl hover:bg-medsight-primary/5 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className={`p-2 rounded-lg ${getSecurityColor(log.security.level).replace('text-', 'bg-')}/10`}>
                  <ActivityIcon className={`w-5 h-5 ${getSecurityColor(log.security.level)}`} />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-medsight-primary">{log.activity.description}</h4>
                    <p className="text-xs text-medsight-primary/60 mt-1">
                      {log.user.name} • {log.user.department} • {log.timestamp.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <SecurityIcon className={`w-4 h-4 ${getSecurityColor(log.security.level)}`} />
                    <StatusIcon className={`w-4 h-4 ${getStatusColor(log.result.status)}`} />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mt-2 text-xs text-medsight-primary/50">
                  <span>Risk: {log.security.riskScore}/10</span>
                  <span>•</span>
                  <span>{log.session.ipAddress}</span>
                  <span>•</span>
                  <span>{log.resource.name}</span>
                  {log.result.duration && (
                    <>
                      <span>•</span>
                      <span>{log.result.duration}ms</span>
                    </>
                  )}
                </div>
                
                {log.security.compliance.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {log.security.compliance.map(compliance => (
                      <span key={compliance} className="px-2 py-1 bg-medsight-primary/10 text-medsight-primary text-xs rounded">
                        {compliance}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedLog(log.id)}
                className="flex-shrink-0 p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTable = () => (
    <div className="medsight-glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-medsight-primary/10">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-medsight-primary">Timestamp</th>
              <th className="text-left p-4 text-sm font-medium text-medsight-primary">User</th>
              <th className="text-left p-4 text-sm font-medium text-medsight-primary">Activity</th>
              <th className="text-left p-4 text-sm font-medium text-medsight-primary">Resource</th>
              <th className="text-left p-4 text-sm font-medium text-medsight-primary">Status</th>
              <th className="text-left p-4 text-sm font-medium text-medsight-primary">Risk</th>
              <th className="text-left p-4 text-sm font-medium text-medsight-primary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-medsight-primary/10">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-medsight-primary/5">
                <td className="p-4 text-sm text-medsight-primary">
                  {log.timestamp.toLocaleString()}
                </td>
                <td className="p-4 text-sm text-medsight-primary">
                  <div>
                    <div className="font-medium">{log.user.name}</div>
                    <div className="text-xs text-medsight-primary/60">{log.user.department}</div>
                  </div>
                </td>
                <td className="p-4 text-sm text-medsight-primary">
                  <div>
                    <div className="font-medium">{log.activity.action}</div>
                    <div className="text-xs text-medsight-primary/60">{log.activity.category}</div>
                  </div>
                </td>
                <td className="p-4 text-sm text-medsight-primary">
                  <div>
                    <div className="font-medium">{log.resource.name}</div>
                    <div className="text-xs text-medsight-primary/60">{log.resource.type}</div>
                  </div>
                </td>
                <td className="p-4 text-sm">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.result.status).replace('text-', 'bg-')}/10 ${getStatusColor(log.result.status)}`}>
                    {log.result.status}
                  </span>
                </td>
                <td className="p-4 text-sm">
                  <span className={`font-medium ${getSecurityColor(log.security.level)}`}>
                    {log.security.riskScore}/10
                  </span>
                </td>
                <td className="p-4 text-sm">
                  <button
                    onClick={() => setSelectedLog(log.id)}
                    className="text-medsight-primary hover:text-medsight-primary/70"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="medsight-control-glass p-2 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-medsight-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-medsight-primary">Audit Logs</h2>
              <p className="text-sm text-medsight-primary/70">
                {filteredLogs.length} events • Risk Score: {summary?.riskScore.toFixed(1)}/10 • Compliance: {summary?.complianceScore}%
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleStreaming}
              className={`p-2 rounded-lg ${streaming ? 'bg-medsight-critical/10 text-medsight-critical' : 'text-medsight-primary hover:bg-medsight-primary/10'}`}
            >
              {streaming ? <StopIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            </button>
            <button onClick={exportLogs} className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg">
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
            <button onClick={loadAuditLogs} className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg">
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex space-x-2 bg-medsight-primary/10 rounded-lg p-1">
          {[
            { id: 'timeline', label: 'Timeline', icon: ClockIcon },
            { id: 'table', label: 'Table', icon: DocumentTextIcon },
            { id: 'security', label: 'Security', icon: ShieldCheckIcon },
            { id: 'compliance', label: 'Compliance', icon: CheckCircleIcon }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setViewMode(id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-all ${
                viewMode === id 
                  ? 'bg-medsight-primary text-white' 
                  : 'text-medsight-primary hover:bg-medsight-primary/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {summary && renderSummary()}

      {/* Filters */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medsight-primary/50" />
            <input
              type="text"
              placeholder="Search logs..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="input-medsight pl-10 w-full"
            />
          </div>
          
          <input
            type="datetime-local"
            value={filters.dateRange.start.toISOString().slice(0, 16)}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              dateRange: { ...prev.dateRange, start: new Date(e.target.value) }
            }))}
            className="input-medsight"
          />
          
          <input
            type="datetime-local"
            value={filters.dateRange.end.toISOString().slice(0, 16)}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              dateRange: { ...prev.dateRange, end: new Date(e.target.value) }
            }))}
            className="input-medsight"
          />
          
          <select
            value={filters.activities[0] || ''}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              activities: e.target.value ? [e.target.value] : []
            }))}
            className="input-medsight"
          >
            <option value="">All Activities</option>
            <option value="login">Login</option>
            <option value="data_access">Data Access</option>
            <option value="data_export">Data Export</option>
            <option value="config_change">Config Change</option>
            <option value="security_event">Security Event</option>
          </select>
          
          <select
            value={filters.securityLevels[0] || ''}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              securityLevels: e.target.value ? [e.target.value] : []
            }))}
            className="input-medsight"
          >
            <option value="">All Levels</option>
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          
          <select
            value={filters.status[0] || ''}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              status: e.target.value ? [e.target.value] : []
            }))}
            className="input-medsight"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="blocked">Blocked</option>
            <option value="partial">Partial</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'timeline' && renderTimeline()}
      {viewMode === 'table' && renderTable()}
      {viewMode === 'security' && (
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">Security Analysis</h3>
          <p className="text-medsight-primary/70">Security analysis dashboard coming soon...</p>
        </div>
      )}
      {viewMode === 'compliance' && (
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">Compliance Reports</h3>
          <p className="text-medsight-primary/70">Compliance reporting dashboard coming soon...</p>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="medsight-glass p-6 rounded-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-medsight-primary hover:text-medsight-primary/70"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            {(() => {
              const log = logs.find(l => l.id === selectedLog);
              if (!log) return null;
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-medsight-primary mb-2">User Information</h4>
                      <div className="text-sm text-medsight-primary/70 space-y-1">
                        <p><strong>Name:</strong> {log.user.name}</p>
                        <p><strong>Email:</strong> {log.user.email}</p>
                        <p><strong>Role:</strong> {log.user.role}</p>
                        <p><strong>Department:</strong> {log.user.department}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-medsight-primary mb-2">Session Information</h4>
                      <div className="text-sm text-medsight-primary/70 space-y-1">
                        <p><strong>IP Address:</strong> {log.session.ipAddress}</p>
                        <p><strong>Location:</strong> {log.session.location}</p>
                        <p><strong>Device:</strong> {log.session.device}</p>
                        <p><strong>Session ID:</strong> {log.session.id}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-medsight-primary mb-2">Activity Details</h4>
                    <div className="text-sm text-medsight-primary/70 space-y-1">
                      <p><strong>Action:</strong> {log.activity.action}</p>
                      <p><strong>Description:</strong> {log.activity.description}</p>
                      <p><strong>Category:</strong> {log.activity.category}</p>
                      <p><strong>Type:</strong> {log.activity.type}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-medsight-primary mb-2">Additional Details</h4>
                    <pre className="bg-medsight-primary/5 p-3 rounded text-xs text-medsight-primary overflow-x-auto">
                      {JSON.stringify(log.activity.details, null, 2)}
                    </pre>
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