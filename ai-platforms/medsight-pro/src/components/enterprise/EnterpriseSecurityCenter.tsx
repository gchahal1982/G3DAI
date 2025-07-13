'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, LockClosedIcon, KeyIcon, ExclamationTriangleIcon,
  BellIcon, EyeIcon, FireIcon, BoltIcon, SparklesIcon,
  UserGroupIcon, ServerIcon, GlobeAltIcon, WifiIcon,
  DocumentCheckIcon, ClipboardDocumentCheckIcon, ChartBarIcon,
  CheckCircleIcon, XCircleIcon, InformationCircleIcon,
  ArrowPathIcon, ClockIcon, CalendarIcon, MapPinIcon,
  ComputerDesktopIcon, DevicePhoneMobileIcon, DeviceTabletIcon,
  CpuChipIcon, CircleStackIcon, CloudIcon, BuildingOfficeIcon,
  HeartIcon, BeakerIcon, AcademicCapIcon, UserIcon,
  MagnifyingGlassIcon, FunnelIcon, AdjustmentsHorizontalIcon,
  ArrowTrendingUpIcon, ArrowTrendingDownIcon, SignalIcon,
  ExclamationCircleIcon, HandRaisedIcon, CubeIcon,
  ArchiveBoxIcon, DocumentTextIcon, FolderOpenIcon,
  TagIcon, StarIcon, HomeIcon, PhoneIcon,
  EnvelopeIcon, ChatBubbleLeftEllipsisIcon, VideoCameraIcon,
  MicrophoneIcon, SpeakerWaveIcon, WindowIcon,
  Square3Stack3DIcon, RectangleGroupIcon, TableCellsIcon,
  ListBulletIcon, ViewColumnsIcon, PresentationChartLineIcon
} from '@heroicons/react/24/outline';

interface SecurityThreat {
  id: string;
  type: 'malware' | 'phishing' | 'unauthorized-access' | 'data-breach' | 'ddos' | 'insider-threat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'contained' | 'resolved' | 'false-positive';
  title: string;
  description: string;
  source: {
    ip: string;
    location: string;
    country: string;
    userAgent?: string;
  };
  target: {
    system: string;
    organization: string;
    user?: string;
    asset: string;
  };
  timeline: {
    detected: string;
    firstSeen: string;
    lastSeen: string;
    resolved?: string;
  };
  impact: {
    affected: number;
    data: string[];
    systems: string[];
    users: string[];
  };
  response: {
    actions: string[];
    containment: string[];
    remediation: string[];
  };
  riskScore: number;
  confidence: number;
}

interface SecurityMetrics {
  threats: {
    total: number;
    active: number;
    resolved: number;
    critical: number;
    thisWeek: number;
  };
  compliance: {
    hipaa: number;
    gdpr: number;
    sox: number;
    iso27001: number;
    overallScore: number;
  };
  access: {
    totalUsers: number;
    activeUsers: number;
    failedLogins: number;
    suspiciousActivity: number;
    mfaEnabled: number;
  };
  data: {
    encryptedData: number;
    dataAtRest: number;
    dataInTransit: number;
    backupEncryption: number;
    retention: number;
  };
  infrastructure: {
    secureEndpoints: number;
    patchCompliance: number;
    networkSecurity: number;
    serverHardening: number;
    monitoring: number;
  };
}

interface SecurityAlert {
  id: string;
  type: 'security' | 'compliance' | 'access' | 'data' | 'infrastructure';
  priority: 'info' | 'warning' | 'high' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
  assignee?: string;
  organization?: string;
  category: 'medical' | 'financial' | 'operational' | 'technical';
}

interface ComplianceStatus {
  framework: 'HIPAA' | 'GDPR' | 'SOX' | 'ISO27001' | 'FDA' | 'NIST';
  status: 'compliant' | 'non-compliant' | 'pending' | 'review-required';
  score: number;
  lastAudit: string;
  nextAudit: string;
  requirements: {
    total: number;
    compliant: number;
    pending: number;
    failed: number;
  };
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  remediation: {
    inProgress: number;
    planned: number;
    overdue: number;
  };
}

interface SecurityIncident {
  id: string;
  type: 'breach' | 'attack' | 'violation' | 'system-failure' | 'human-error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  title: string;
  description: string;
  reportedBy: string;
  assignedTo: string;
  organization: string;
  timeline: {
    reported: string;
    acknowledged: string;
    contained?: string;
    resolved?: string;
  };
  impact: {
    scope: 'localized' | 'department' | 'organization' | 'enterprise';
    affectedUsers: number;
    dataLoss: boolean;
    systemDowntime: number;
    estimatedCost: number;
  };
  response: {
    containmentActions: string[];
    investigationNotes: string[];
    remediationSteps: string[];
    lessonsLearned: string[];
  };
  compliance: {
    reportingRequired: boolean;
    regulatorsNotified: boolean;
    customersNotified: boolean;
    timelineCompliance: boolean;
  };
}

const EnterpriseSecurityCenter: React.FC = () => {
  const [securityThreats, setSecurityThreats] = useState<SecurityThreat[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus[]>([]);
  const [securityIncidents, setSecurityIncidents] = useState<SecurityIncident[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'threats' | 'compliance' | 'incidents'>('overview');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Initialize security data
  useEffect(() => {
    const mockThreats: SecurityThreat[] = [
      {
        id: 'threat-001',
        type: 'unauthorized-access',
        severity: 'critical',
        status: 'investigating',
        title: 'Suspicious Login Activity',
        description: 'Multiple failed login attempts detected from suspicious IP addresses targeting administrative accounts',
        source: {
          ip: '185.234.219.157',
          location: 'Moscow, Russia',
          country: 'RU',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        target: {
          system: 'Medical Platform',
          organization: 'Johns Hopkins Medical Center',
          user: 'admin@johns-hopkins.edu',
          asset: 'Authentication Server'
        },
        timeline: {
          detected: '2024-01-15T14:25:00Z',
          firstSeen: '2024-01-15T13:45:00Z',
          lastSeen: '2024-01-15T14:30:00Z'
        },
        impact: {
          affected: 1,
          data: ['User credentials'],
          systems: ['Authentication system'],
          users: ['admin@johns-hopkins.edu']
        },
        response: {
          actions: ['Account locked', 'IP blocked', 'Security team notified'],
          containment: ['Firewall rules updated', 'Rate limiting enabled'],
          remediation: ['Password reset required', 'MFA enforcement', 'Security awareness training']
        },
        riskScore: 95,
        confidence: 98
      },
      {
        id: 'threat-002',
        type: 'data-breach',
        severity: 'high',
        status: 'contained',
        title: 'Medical Data Access Anomaly',
        description: 'Unauthorized access attempt to medical patient records detected',
        source: {
          ip: '192.168.1.157',
          location: 'Internal Network',
          country: 'US'
        },
        target: {
          system: 'DICOM Server',
          organization: 'Stanford Medical School',
          asset: 'Patient Database'
        },
        timeline: {
          detected: '2024-01-15T11:30:00Z',
          firstSeen: '2024-01-15T11:25:00Z',
          lastSeen: '2024-01-15T11:35:00Z',
          resolved: '2024-01-15T12:00:00Z'
        },
        impact: {
          affected: 247,
          data: ['Patient records', 'Medical images'],
          systems: ['DICOM server', 'Database'],
          users: ['medical-staff@stanford.edu']
        },
        response: {
          actions: ['Access revoked', 'Audit trail reviewed', 'Incident reported'],
          containment: ['Database access restricted', 'Network segment isolated'],
          remediation: ['Access controls updated', 'Audit logging enhanced', 'Staff training']
        },
        riskScore: 87,
        confidence: 94
      },
      {
        id: 'threat-003',
        type: 'phishing',
        severity: 'medium',
        status: 'resolved',
        title: 'Medical Phishing Campaign',
        description: 'Phishing emails targeting medical professionals with fake COVID-19 research attachments',
        source: {
          ip: '45.123.187.92',
          location: 'Frankfurt, Germany',
          country: 'DE',
          userAgent: 'Email Campaign Bot'
        },
        target: {
          system: 'Email Server',
          organization: 'Mayo Clinic Research',
          asset: 'Email Infrastructure'
        },
        timeline: {
          detected: '2024-01-14T09:15:00Z',
          firstSeen: '2024-01-14T08:30:00Z',
          lastSeen: '2024-01-14T10:00:00Z',
          resolved: '2024-01-14T12:00:00Z'
        },
        impact: {
          affected: 56,
          data: ['Email addresses'],
          systems: ['Email server'],
          users: ['research-staff@mayo.edu']
        },
        response: {
          actions: ['Emails quarantined', 'Links blocked', 'Staff notified'],
          containment: ['Sender blocked', 'Email filtering updated'],
          remediation: ['Security awareness training', 'Email security enhanced']
        },
        riskScore: 65,
        confidence: 92
      }
    ];
    setSecurityThreats(mockThreats);

    const mockMetrics: SecurityMetrics = {
      threats: {
        total: 1247,
        active: 23,
        resolved: 1201,
        critical: 8,
        thisWeek: 45
      },
      compliance: {
        hipaa: 98.7,
        gdpr: 96.4,
        sox: 94.2,
        iso27001: 97.8,
        overallScore: 96.8
      },
      access: {
        totalUsers: 45672,
        activeUsers: 34567,
        failedLogins: 234,
        suspiciousActivity: 12,
        mfaEnabled: 98.5
      },
      data: {
        encryptedData: 99.2,
        dataAtRest: 100,
        dataInTransit: 99.8,
        backupEncryption: 100,
        retention: 97.3
      },
      infrastructure: {
        secureEndpoints: 96.8,
        patchCompliance: 94.5,
        networkSecurity: 98.2,
        serverHardening: 97.6,
        monitoring: 99.1
      }
    };
    setSecurityMetrics(mockMetrics);

    const mockAlerts: SecurityAlert[] = [
      {
        id: 'alert-001',
        type: 'security',
        priority: 'critical',
        title: 'Critical Security Breach Detected',
        message: 'Unauthorized access to medical patient database detected. Immediate action required.',
        source: 'Medical Security Monitor',
        timestamp: '2024-01-15T14:30:00Z',
        acknowledged: false,
        assignee: 'Security Team Lead',
        organization: 'Johns Hopkins Medical Center',
        category: 'medical'
      },
      {
        id: 'alert-002',
        type: 'compliance',
        priority: 'high',
        title: 'HIPAA Compliance Violation',
        message: 'Potential HIPAA violation detected in data access logs. Review required.',
        source: 'Compliance Monitor',
        timestamp: '2024-01-15T13:45:00Z',
        acknowledged: true,
        assignee: 'Compliance Officer',
        organization: 'Stanford Medical School',
        category: 'medical'
      },
      {
        id: 'alert-003',
        type: 'access',
        priority: 'warning',
        title: 'Unusual Login Pattern',
        message: 'User logged in from multiple geographic locations within short timeframe.',
        source: 'Access Control System',
        timestamp: '2024-01-15T12:20:00Z',
        acknowledged: false,
        organization: 'Mayo Clinic Research',
        category: 'operational'
      }
    ];
    setSecurityAlerts(mockAlerts);

    const mockCompliance: ComplianceStatus[] = [
      {
        framework: 'HIPAA',
        status: 'compliant',
        score: 98.7,
        lastAudit: '2024-01-01',
        nextAudit: '2024-07-01',
        requirements: {
          total: 164,
          compliant: 162,
          pending: 2,
          failed: 0
        },
        findings: {
          critical: 0,
          high: 1,
          medium: 3,
          low: 8
        },
        remediation: {
          inProgress: 2,
          planned: 1,
          overdue: 0
        }
      },
      {
        framework: 'GDPR',
        status: 'compliant',
        score: 96.4,
        lastAudit: '2023-12-15',
        nextAudit: '2024-06-15',
        requirements: {
          total: 99,
          compliant: 95,
          pending: 3,
          failed: 1
        },
        findings: {
          critical: 0,
          high: 2,
          medium: 5,
          low: 12
        },
        remediation: {
          inProgress: 3,
          planned: 2,
          overdue: 1
        }
      },
      {
        framework: 'ISO27001',
        status: 'compliant',
        score: 97.8,
        lastAudit: '2024-01-10',
        nextAudit: '2024-04-10',
        requirements: {
          total: 114,
          compliant: 111,
          pending: 2,
          failed: 1
        },
        findings: {
          critical: 0,
          high: 1,
          medium: 4,
          low: 7
        },
        remediation: {
          inProgress: 2,
          planned: 1,
          overdue: 0
        }
      }
    ];
    setComplianceStatus(mockCompliance);

    const mockIncidents: SecurityIncident[] = [
      {
        id: 'incident-001',
        type: 'breach',
        severity: 'critical',
        status: 'investigating',
        title: 'Medical Data Unauthorized Access',
        description: 'Unauthorized access to patient medical records through compromised user account',
        reportedBy: 'Dr. Sarah Johnson',
        assignedTo: 'Security Incident Response Team',
        organization: 'Johns Hopkins Medical Center',
        timeline: {
          reported: '2024-01-15T14:25:00Z',
          acknowledged: '2024-01-15T14:30:00Z'
        },
        impact: {
          scope: 'organization',
          affectedUsers: 247,
          dataLoss: true,
          systemDowntime: 0,
          estimatedCost: 250000
        },
        response: {
          containmentActions: ['Account suspended', 'Access logs reviewed', 'Network isolated'],
          investigationNotes: ['Forensic analysis initiated', 'Law enforcement contacted'],
          remediationSteps: ['Password reset mandatory', 'MFA enforcement', 'Security training'],
          lessonsLearned: []
        },
        compliance: {
          reportingRequired: true,
          regulatorsNotified: true,
          customersNotified: false,
          timelineCompliance: true
        }
      }
    ];
    setSecurityIncidents(mockIncidents);
  }, []);

  const handleAlertAcknowledge = (alertId: string) => {
    setSecurityAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'high': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'medium': return <ExclamationCircleIcon className="w-5 h-5" />;
      case 'low': return <InformationCircleIcon className="w-5 h-5" />;
      default: return <InformationCircleIcon className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50 border-green-200';
      case 'non-compliant': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'review-required': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getThreatTypeIcon = (type: string) => {
    switch (type) {
      case 'malware': return <BoltIcon className="w-5 h-5 text-red-600" />;
      case 'phishing': return <EnvelopeIcon className="w-5 h-5 text-orange-600" />;
      case 'unauthorized-access': return <LockClosedIcon className="w-5 h-5 text-purple-600" />;
      case 'data-breach': return <ShieldCheckIcon className="w-5 h-5 text-red-600" />;
      case 'ddos': return <ServerIcon className="w-5 h-5 text-blue-600" />;
      case 'insider-threat': return <UserIcon className="w-5 h-5 text-yellow-600" />;
      default: return <ExclamationTriangleIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredThreats = securityThreats.filter(threat => {
    const matchesSeverity = filterSeverity === 'all' || threat.severity === filterSeverity;
    const matchesSearch = threat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <ShieldCheckIcon className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-medsight-primary">Enterprise Security Center</h2>
              <p className="text-gray-600">Medical data protection and security monitoring</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="input-medsight"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button className="btn-medsight">
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Security Status */}
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Security Status: Operational - {securityMetrics?.compliance.overallScore}% Compliance Score
            </span>
            <span className="ml-auto text-xs text-green-600">
              {securityMetrics?.threats.active} Active Threats | {securityMetrics?.threats.critical} Critical
            </span>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'overview'
                ? 'bg-medsight-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ChartBarIcon className="w-4 h-4 mr-2 inline" />
            Overview
          </button>
          <button
            onClick={() => setViewMode('threats')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'threats'
                ? 'bg-medsight-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ExclamationTriangleIcon className="w-4 h-4 mr-2 inline" />
            Threats ({securityMetrics?.threats.active})
          </button>
          <button
            onClick={() => setViewMode('compliance')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'compliance'
                ? 'bg-medsight-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <DocumentCheckIcon className="w-4 h-4 mr-2 inline" />
            Compliance
          </button>
          <button
            onClick={() => setViewMode('incidents')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'incidents'
                ? 'bg-medsight-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FireIcon className="w-4 h-4 mr-2 inline" />
            Incidents ({securityIncidents.length})
          </button>
        </div>
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && securityMetrics && (
        <>
          {/* Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Threats</p>
                  <p className="text-2xl font-bold text-red-600">
                    {securityMetrics.threats.active}
                  </p>
                  <p className="text-sm text-gray-600">
                    {securityMetrics.threats.critical} critical
                  </p>
                </div>
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Compliance Score</p>
                  <p className="text-2xl font-bold text-medsight-normal">
                    {securityMetrics.compliance.overallScore}%
                  </p>
                  <p className="text-sm text-green-600">
                    HIPAA: {securityMetrics.compliance.hipaa}%
                  </p>
                </div>
                <ShieldCheckIcon className="w-8 h-8 text-medsight-normal" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Data Encryption</p>
                  <p className="text-2xl font-bold text-medsight-primary">
                    {securityMetrics.data.encryptedData}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {securityMetrics.data.dataAtRest}% at rest
                  </p>
                </div>
                <LockClosedIcon className="w-8 h-8 text-medsight-primary" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">MFA Enabled</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {securityMetrics.access.mfaEnabled}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {securityMetrics.access.activeUsers.toLocaleString()} users
                  </p>
                </div>
                <KeyIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Security Alerts */}
          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Critical Security Alerts</h3>
              <span className="text-sm text-gray-600">
                {securityAlerts.filter(alert => !alert.acknowledged).length} unacknowledged
              </span>
            </div>
            <div className="space-y-3">
              {securityAlerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.priority === 'critical' ? 'text-red-600 bg-red-50 border-red-200' :
                    alert.priority === 'high' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                    alert.priority === 'warning' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                    'text-blue-600 bg-blue-50 border-blue-200'
                  } ${alert.acknowledged ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {alert.priority === 'critical' ? <ExclamationTriangleIcon className="w-5 h-5 mt-0.5" /> :
                       alert.priority === 'high' ? <ExclamationCircleIcon className="w-5 h-5 mt-0.5" /> :
                       <InformationCircleIcon className="w-5 h-5 mt-0.5" />}
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm mt-1">{alert.message}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs">
                          <span>Source: {alert.source}</span>
                          {alert.organization && <span>Org: {alert.organization}</span>}
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <button 
                        onClick={() => handleAlertAcknowledge(alert.id)}
                        className="text-sm bg-white px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {complianceStatus.map((compliance) => (
              <div key={compliance.framework} className="medsight-glass p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{compliance.framework}</h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(compliance.status)}`}>
                    {compliance.status.replace('-', ' ')}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Compliance Score</span>
                      <span className="font-medium">{compliance.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-medsight-primary h-2 rounded-full"
                        style={{ width: `${compliance.score}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Compliant:</span>
                      <span className="font-medium ml-2">{compliance.requirements.compliant}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pending:</span>
                      <span className="font-medium ml-2">{compliance.requirements.pending}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-600">Next Audit:</span>
                    <span className="font-medium ml-2">
                      {new Date(compliance.nextAudit).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Threats View */}
      {viewMode === 'threats' && (
        <>
          {/* Filters */}
          <div className="medsight-glass p-4 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search threats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-medsight pl-10"
                />
              </div>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="input-medsight"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Threats List */}
          <div className="space-y-4">
            {filteredThreats.map((threat) => (
              <div key={threat.id} className="medsight-glass p-6 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {getThreatTypeIcon(threat.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{threat.title}</h3>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getSeverityColor(threat.severity)}`}>
                          {getSeverityIcon(threat.severity)}
                          <span className="font-medium capitalize">{threat.severity}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          threat.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          threat.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                          threat.status === 'contained' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {threat.status.replace('-', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{threat.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Source</h4>
                          <div className="text-sm space-y-1">
                            <div>IP: {threat.source.ip}</div>
                            <div>Location: {threat.source.location}</div>
                            <div>Country: {threat.source.country}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Target</h4>
                          <div className="text-sm space-y-1">
                            <div>System: {threat.target.system}</div>
                            <div>Organization: {threat.target.organization}</div>
                            <div>Asset: {threat.target.asset}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Impact</h4>
                          <div className="text-sm space-y-1">
                            <div>Affected: {threat.impact.affected}</div>
                            <div>Risk Score: {threat.riskScore}/100</div>
                            <div>Confidence: {threat.confidence}%</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Detected: {new Date(threat.timeline.detected).toLocaleString()}</span>
                          <span>Duration: {threat.timeline.lastSeen} - {threat.timeline.firstSeen}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-600 hover:text-medsight-primary">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600">
                      <XCircleIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Medical Compliance Footer */}
      <div className="medsight-glass p-4 rounded-xl border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-medsight-normal" />
            <span className="text-sm font-medium text-medsight-normal">Enterprise Security Compliance</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-medsight-normal">HIPAA Compliant Security</span>
            <span className="text-medsight-normal">Medical Data Protection</span>
            <span className="text-medsight-normal">24/7 Threat Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseSecurityCenter; 