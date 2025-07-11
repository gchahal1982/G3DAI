'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Database,
  Server,
  Network,
  Key,
  Download,
  Filter,
  Search,
  Calendar,
  Activity,
  Bell,
  Target,
  Award,
  Zap,
  Globe,
  Settings,
  RefreshCw,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Archive,
  Flag
} from 'lucide-react';

interface EnterpriseMetrics {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  systemUptime: number;
  complianceScore: number;
  securityScore: number;
  performanceScore: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
}

interface TenantSummary {
  id: string;
  name: string;
  organization: string;
  users: number;
  status: 'active' | 'inactive' | 'suspended';
  tier: 'basic' | 'professional' | 'enterprise';
  usage: {
    storage: number;
    compute: number;
    bandwidth: number;
  };
  compliance: number;
  lastActivity: Date;
}

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  requirements: ComplianceRequirement[];
  overallScore: number;
  lastAssessment: Date;
  nextDue: Date;
  status: 'compliant' | 'partial' | 'non_compliant' | 'pending';
  certifications: string[];
}

interface ComplianceRequirement {
  id: string;
  category: string;
  title: string;
  description: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable';
  evidence: string[];
  lastChecked: Date;
  responsible: string;
  priority: 'high' | 'medium' | 'low';
  automatedCheck: boolean;
}

interface AuditEvent {
  id: string;
  timestamp: Date;
  type: 'access' | 'modification' | 'deletion' | 'creation' | 'login' | 'logout' | 'configuration';
  severity: 'info' | 'warning' | 'error' | 'critical';
  user: {
    id: string;
    name: string;
    role: string;
    tenantId?: string;
  };
  resource: {
    type: string;
    id: string;
    name: string;
  };
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  outcome: 'success' | 'failure' | 'blocked';
}

interface SecurityAssessment {
  id: string;
  name: string;
  type: 'vulnerability' | 'penetration' | 'compliance' | 'access_review';
  status: 'completed' | 'in_progress' | 'scheduled' | 'failed';
  score: number;
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  startDate: Date;
  completionDate?: Date;
  nextScheduled: Date;
  assessor: string;
}

interface ComplianceDashboardProps {
  metrics: EnterpriseMetrics;
  tenants: TenantSummary[];
  className?: string;
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  metrics,
  tenants,
  className = ''
}) => {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [assessments, setAssessments] = useState<SecurityAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [auditFilter, setAuditFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setLoading(true);
    
    // Mock data - replace with actual API calls
    const mockFrameworks: ComplianceFramework[] = [
      {
        id: '1',
        name: 'HIPAA',
        description: 'Health Insurance Portability and Accountability Act',
        version: '2013 Final Rule',
        overallScore: 96.8,
        lastAssessment: new Date('2024-01-10'),
        nextDue: new Date('2024-07-10'),
        status: 'compliant',
        certifications: ['Administrative Safeguards', 'Physical Safeguards', 'Technical Safeguards'],
        requirements: [
          {
            id: '1.1',
            category: 'Administrative Safeguards',
            title: 'Security Officer',
            description: 'Assign security responsibilities to an individual',
            status: 'compliant',
            evidence: ['Security Officer Assignment', 'Quarterly Reviews'],
            lastChecked: new Date('2024-01-15'),
            responsible: 'CISO',
            priority: 'high',
            automatedCheck: false
          },
          {
            id: '1.2',
            category: 'Administrative Safeguards',
            title: 'Workforce Training',
            description: 'Implement procedures for workforce training',
            status: 'compliant',
            evidence: ['Training Records', 'Completion Certificates'],
            lastChecked: new Date('2024-01-12'),
            responsible: 'HR',
            priority: 'high',
            automatedCheck: true
          },
          {
            id: '1.3',
            category: 'Technical Safeguards',
            title: 'Access Control',
            description: 'Unique user identification and access management',
            status: 'compliant',
            evidence: ['Access Control Policies', 'User Access Reviews'],
            lastChecked: new Date('2024-01-14'),
            responsible: 'IT Security',
            priority: 'high',
            automatedCheck: true
          }
        ]
      },
      {
        id: '2',
        name: 'SOC 2 Type II',
        description: 'Service Organization Control 2',
        version: '2017',
        overallScore: 94.2,
        lastAssessment: new Date('2023-12-15'),
        nextDue: new Date('2024-12-15'),
        status: 'compliant',
        certifications: ['Security', 'Availability', 'Confidentiality'],
        requirements: [
          {
            id: '2.1',
            category: 'Security',
            title: 'Information Security Program',
            description: 'Documented information security program',
            status: 'compliant',
            evidence: ['Security Policies', 'Risk Assessments'],
            lastChecked: new Date('2023-12-20'),
            responsible: 'CISO',
            priority: 'high',
            automatedCheck: false
          }
        ]
      },
      {
        id: '3',
        name: 'GDPR',
        description: 'General Data Protection Regulation',
        version: '2018',
        overallScore: 89.5,
        lastAssessment: new Date('2024-01-05'),
        nextDue: new Date('2024-07-05'),
        status: 'partial',
        certifications: ['Data Protection Officer', 'Privacy Impact Assessments'],
        requirements: [
          {
            id: '3.1',
            category: 'Data Protection',
            title: 'Data Subject Rights',
            description: 'Procedures for handling data subject requests',
            status: 'partial',
            evidence: ['Request Tracking System'],
            lastChecked: new Date('2024-01-08'),
            responsible: 'DPO',
            priority: 'medium',
            automatedCheck: true
          }
        ]
      }
    ];

    const mockAuditEvents: AuditEvent[] = [
      {
        id: '1',
        timestamp: new Date('2024-01-16T14:30:00Z'),
        type: 'access',
        severity: 'info',
        user: {
          id: 'u1',
          name: 'Dr. Sarah Johnson',
          role: 'doctor',
          tenantId: 't1'
        },
        resource: {
          type: 'patient_record',
          id: 'p12345',
          name: 'Patient: John Doe'
        },
        action: 'view_medical_record',
        details: 'Accessed patient medical history for consultation',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        outcome: 'success'
      },
      {
        id: '2',
        timestamp: new Date('2024-01-16T14:25:00Z'),
        type: 'modification',
        severity: 'warning',
        user: {
          id: 'u2',
          name: 'Michael Chen',
          role: 'admin'
        },
        resource: {
          type: 'system_configuration',
          id: 'config_security',
          name: 'Security Configuration'
        },
        action: 'update_security_policy',
        details: 'Modified password policy requirements',
        ipAddress: '10.0.0.50',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        outcome: 'success'
      },
      {
        id: '3',
        timestamp: new Date('2024-01-16T13:45:00Z'),
        type: 'login',
        severity: 'error',
        user: {
          id: 'unknown',
          name: 'Unknown User',
          role: 'unknown'
        },
        resource: {
          type: 'system',
          id: 'login_system',
          name: 'Authentication System'
        },
        action: 'failed_login_attempt',
        details: 'Multiple failed login attempts detected',
        ipAddress: '185.220.101.42',
        userAgent: 'automated-scanner',
        outcome: 'blocked'
      }
    ];

    const mockAssessments: SecurityAssessment[] = [
      {
        id: '1',
        name: 'Q1 2024 Vulnerability Assessment',
        type: 'vulnerability',
        status: 'completed',
        score: 92.5,
        findings: {
          critical: 0,
          high: 2,
          medium: 5,
          low: 8
        },
        startDate: new Date('2024-01-01'),
        completionDate: new Date('2024-01-15'),
        nextScheduled: new Date('2024-04-01'),
        assessor: 'Internal Security Team'
      },
      {
        id: '2',
        name: 'HIPAA Compliance Review',
        type: 'compliance',
        status: 'in_progress',
        score: 0,
        findings: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        },
        startDate: new Date('2024-01-10'),
        nextScheduled: new Date('2024-07-10'),
        assessor: 'External Auditor'
      },
      {
        id: '3',
        name: 'Penetration Testing',
        type: 'penetration',
        status: 'scheduled',
        score: 0,
        findings: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        },
        startDate: new Date('2024-02-01'),
        nextScheduled: new Date('2024-02-01'),
        assessor: 'Third-party Security Firm'
      }
    ];

    setFrameworks(mockFrameworks);
    setAuditEvents(mockAuditEvents);
    setAssessments(mockAssessments);
    setLoading(false);
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getComplianceBgColor = (score: number) => {
    if (score >= 95) return 'bg-green-600';
    if (score >= 85) return 'bg-yellow-600';
    if (score >= 70) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Compliant
        </span>;
      case 'partial':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Partial
        </span>;
      case 'non_compliant':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Non-Compliant
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Critical
        </span>;
      case 'error':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Error
        </span>;
      case 'warning':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Warning
        </span>;
      case 'info':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Info
        </span>;
      default:
        return null;
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Success
        </span>;
      case 'failure':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Failure
        </span>;
      case 'blocked':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Blocked
        </span>;
      default:
        return null;
    }
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const filteredAuditEvents = auditEvents.filter(event => {
    const matchesFilter = auditFilter === 'all' || event.type === auditFilter;
    const matchesSearch = event.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.resource.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const overallComplianceScore = frameworks.reduce((avg, f) => avg + f.overallScore, 0) / frameworks.length;

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Compliance Dashboard</h3>
          <p className="text-sm text-gray-600">
            Monitor compliance status across all frameworks and regulations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-1" />
            Export Report
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            New Assessment
          </button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Compliance</p>
              <p className={`text-2xl font-bold ${getComplianceColor(overallComplianceScore)}`}>
                {formatPercentage(overallComplianceScore)}
              </p>
              <p className="text-sm text-gray-500">{frameworks.length} frameworks</p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Assessments</p>
              <p className="text-2xl font-bold text-gray-900">
                {assessments.filter(a => a.status === 'in_progress').length}
              </p>
              <p className="text-sm text-gray-500">
                {assessments.filter(a => a.status === 'scheduled').length} scheduled
              </p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Events</p>
              <p className="text-2xl font-bold text-gray-900">
                {auditEvents.filter(e => e.severity === 'error' || e.severity === 'critical').length}
              </p>
              <p className="text-sm text-red-600">Requiring attention</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Audit Trail</p>
              <p className="text-2xl font-bold text-gray-900">{auditEvents.length}</p>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'frameworks', label: 'Frameworks', icon: Shield },
              { id: 'audit', label: 'Audit Trail', icon: FileText },
              { id: 'assessments', label: 'Assessments', icon: Target },
              { id: 'tenants', label: 'Tenant Compliance', icon: Building2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-4">Compliance Status by Framework</h5>
                  <div className="space-y-4">
                    {frameworks.map((framework) => (
                      <div key={framework.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Shield className="w-5 h-5 text-blue-600 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{framework.name}</div>
                            <div className="text-sm text-gray-500">{framework.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getComplianceColor(framework.overallScore)}`}>
                            {formatPercentage(framework.overallScore)}
                          </div>
                          {getStatusBadge(framework.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-4">Recent Security Events</h5>
                  <div className="space-y-3">
                    {auditEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          {event.severity === 'error' || event.severity === 'critical' ? (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900">{event.action}</div>
                          <div className="text-sm text-gray-500">{event.user.name} • {formatTimeAgo(event.timestamp)}</div>
                        </div>
                        <div className="flex-shrink-0">
                          {getSeverityBadge(event.severity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'frameworks' && (
            <div className="space-y-6">
              {frameworks.map((framework) => (
                <div key={framework.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Shield className="w-6 h-6 text-blue-600 mr-3" />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{framework.name}</h4>
                        <p className="text-sm text-gray-500">{framework.description} • Version {framework.version}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getComplianceColor(framework.overallScore)}`}>
                        {formatPercentage(framework.overallScore)}
                      </div>
                      {getStatusBadge(framework.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="text-sm">
                      <span className="text-gray-600">Last Assessment:</span>
                      <span className="ml-2 font-medium">{framework.lastAssessment.toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Next Due:</span>
                      <span className="ml-2 font-medium">{framework.nextDue.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Certifications</h5>
                    <div className="flex flex-wrap gap-2">
                      {framework.certifications.map((cert, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Award className="w-3 h-3 mr-1" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Requirements</h5>
                    <div className="space-y-2">
                      {framework.requirements.map((req) => (
                        <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-3">
                              {req.status === 'compliant' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : req.status === 'partial' ? (
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{req.title}</div>
                              <div className="text-sm text-gray-500">{req.category}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(req.status)}
                            <div className="text-xs text-gray-500 mt-1">
                              {req.responsible}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">Audit Trail</h4>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search audit events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={auditFilter}
                    onChange={(e) => setAuditFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Events</option>
                    <option value="access">Access</option>
                    <option value="modification">Modification</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="configuration">Configuration</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Outcome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAuditEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(event.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{event.user.name}</div>
                          <div className="text-sm text-gray-500">{event.user.role}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.action}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{event.resource.name}</div>
                          <div className="text-sm text-gray-500">{event.resource.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getSeverityBadge(event.severity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getOutcomeBadge(event.outcome)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.ipAddress}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'assessments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">Security Assessments</h4>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Schedule Assessment
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h5 className="text-lg font-medium text-gray-900">{assessment.name}</h5>
                        <p className="text-sm text-gray-500 capitalize">{assessment.type} Assessment</p>
                      </div>
                      <div className="text-right">
                        {assessment.status === 'completed' && (
                          <div className={`text-2xl font-bold ${getComplianceColor(assessment.score)}`}>
                            {formatPercentage(assessment.score)}
                          </div>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          assessment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          assessment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          assessment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {assessment.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-600">Start Date:</span>
                        <div className="font-medium">{assessment.startDate.toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Completion:</span>
                        <div className="font-medium">
                          {assessment.completionDate ? assessment.completionDate.toLocaleDateString() : 'Pending'}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Next Scheduled:</span>
                        <div className="font-medium">{assessment.nextScheduled.toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Assessor:</span>
                        <div className="font-medium">{assessment.assessor}</div>
                      </div>
                    </div>

                    {assessment.status === 'completed' && (
                      <div>
                        <h6 className="font-medium text-gray-900 mb-2">Findings</h6>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{assessment.findings.critical}</div>
                            <div className="text-sm text-gray-600">Critical</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{assessment.findings.high}</div>
                            <div className="text-sm text-gray-600">High</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{assessment.findings.medium}</div>
                            <div className="text-sm text-gray-600">Medium</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{assessment.findings.low}</div>
                            <div className="text-sm text-gray-600">Low</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tenants' && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900">Tenant Compliance Status</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Compliance Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        HIPAA Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Audit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-sm text-gray-500">{tenant.organization}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            tenant.tier === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                            tenant.tier === 'professional' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {tenant.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${getComplianceColor(tenant.compliance)}`}>
                            {formatPercentage(tenant.compliance)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {tenant.compliance >= 95 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Compliant
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Review Required
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTimeAgo(tenant.lastActivity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            View Details
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            Generate Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard; 