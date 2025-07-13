'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheckIcon, 
  DocumentTextIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  LockClosedIcon,
  KeyIcon,
  BellIcon,
  CalendarIcon,
  ChartBarIcon,
  TableCellsIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  PlusIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  PrinterIcon,
  EnvelopeIcon,
  CloudArrowUpIcon,
  ArchiveBoxIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  FingerPrintIcon,
  ShieldExclamationIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  MapPinIcon,
  AtSymbolIcon,
  HashtagIcon,
  LinkIcon,
  ServerIcon,
  CpuChipIcon,
  WifiIcon,
  SignalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ArrowsUpDownIcon,
  ArrowsRightLeftIcon,
  Bars3Icon,
  Bars4Icon,
  Squares2X2Icon,
  ListBulletIcon,
  ViewfinderCircleIcon,
  AdjustmentsHorizontalIcon,
  AdjustmentsVerticalIcon,
  FlagIcon,
  TagIcon,
  StarIcon,
  HeartIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftRightIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  CameraIcon,
  PhotoIcon,
  FilmIcon,
  MusicalNoteIcon,
  RadioIcon,
  TvIcon,
  PhoneIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  DeviceTabletIcon,
  InboxIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  DocumentIcon,
  DocumentDuplicateIcon,
  DocumentPlusIcon,
  DocumentMinusIcon,
  DocumentCheckIcon,
  DocumentChartBarIcon,
  DocumentMagnifyingGlassIcon,
  DocumentArrowUpIcon,
  ClipboardIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  FolderIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  FolderMinusIcon,
  ArchiveBoxArrowDownIcon,
  ArchiveBoxXMarkIcon,
  InboxArrowDownIcon,
  InboxStackIcon,
  QueueListIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3CenterLeftIcon,
  ViewColumnsIcon,
  ChartPieIcon,
  PresentationChartBarIcon,
  PresentationChartLineIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  BeakerIcon,
  AcademicCapIcon,
  NewspaperIcon,
  MegaphoneIcon,
  ChatBubbleOvalLeftIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ChatBubbleBottomCenterIcon,
  ChatBubbleBottomCenterTextIcon,
  QuestionMarkCircleIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  StopCircleIcon,
  HandRaisedIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  UserGroupIcon,
  UsersIcon,
  UserPlusIcon,
  UserMinusIcon,
  UserCircleIcon,
  IdentificationIcon,
  CreditCardIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  CurrencyEuroIcon,
  CurrencyPoundIcon,
  CurrencyYenIcon,
  ReceiptPercentIcon,
  ReceiptRefundIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  TruckIcon,
  RocketLaunchIcon,
  HomeIcon,
  HomeModernIcon,
  BuildingOffice2Icon,
  BuildingLibraryIcon,
  BuildingStorefrontIcon,
  MapIcon,
  GlobeAmericasIcon,
  GlobeAsiaAustraliaIcon,
  GlobeEuropeAfricaIcon,
  SunIcon,
  MoonIcon,
  CloudIcon,
  CloudArrowDownIcon,
  RssIcon,
  ServerStackIcon,
  CircleStackIcon,
  CommandLineIcon,
  CodeBracketIcon,
  CodeBracketSquareIcon,
  BugAntIcon,
  WrenchIcon,
  Cog8ToothIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  EyeSlashIcon,
  LockOpenIcon,
  NoSymbolIcon,
  BellAlertIcon,
  BellSlashIcon,
  BellSnoozeIcon,
  CalendarDaysIcon,
  CalendarDateRangeIcon,
  SparklesIcon,
  TrophyIcon,
  GiftIcon,
  CakeIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';

interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: 'view' | 'create' | 'update' | 'delete' | 'export' | 'print' | 'share' | 'login' | 'logout' | 'access_denied';
  resource: string;
  resourceType: 'patient' | 'study' | 'report' | 'user' | 'system' | 'configuration';
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  sessionId: string;
  outcome: 'success' | 'failure' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  complianceFlags: ComplianceFlag[];
  metadata: { [key: string]: any };
}

interface ComplianceFlag {
  type: 'hipaa' | 'gdpr' | 'hitech' | 'sox' | 'pci' | 'custom';
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  requiresAction: boolean;
  actionTaken?: string;
  resolvedAt?: Date;
}

interface ComplianceReport {
  id: string;
  title: string;
  type: 'hipaa' | 'gdpr' | 'hitech' | 'sox' | 'pci' | 'custom' | 'comprehensive';
  period: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
  generatedBy: string;
  status: 'draft' | 'pending' | 'approved' | 'submitted' | 'archived';
  summary: {
    totalEvents: number;
    complianceScore: number;
    criticalIssues: number;
    resolvedIssues: number;
    pendingIssues: number;
  };
  sections: ReportSection[];
  recommendations: string[];
  actionItems: ActionItem[];
  attachments: string[];
  submissionDeadline?: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

interface ReportSection {
  id: string;
  title: string;
  content: string;
  charts: ChartData[];
  tables: TableData[];
  findings: Finding[];
}

interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  data: any[];
  labels: string[];
}

interface TableData {
  headers: string[];
  rows: any[][];
}

interface Finding {
  type: 'compliance' | 'violation' | 'risk' | 'improvement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  recommendation: string;
  deadline?: Date;
}

interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: Date;
  notes: string;
}

interface CompliancePolicy {
  id: string;
  name: string;
  type: 'hipaa' | 'gdpr' | 'hitech' | 'sox' | 'pci' | 'custom';
  description: string;
  rules: PolicyRule[];
  applicableRoles: string[];
  effectiveDate: Date;
  expirationDate?: Date;
  isActive: boolean;
  lastReviewDate: Date;
  nextReviewDate: Date;
  version: string;
  approvedBy: string;
  approvedAt: Date;
}

interface PolicyRule {
  id: string;
  name: string;
  description: string;
  conditions: string[];
  actions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
}

interface ComplianceAuditTrailProps {
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  onAuditEvent?: (entry: AuditEntry) => void;
  onComplianceViolation?: (violation: ComplianceFlag) => void;
  className?: string;
}

export default function ComplianceAuditTrail({
  userId,
  resourceType,
  resourceId,
  onAuditEvent,
  onComplianceViolation,
  className = ''
}: ComplianceAuditTrailProps) {
  const [activeTab, setActiveTab] = useState<'audit' | 'compliance' | 'reports' | 'policies'>('audit');
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [compliancePolicies, setCompliancePolicies] = useState<CompliancePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<'all' | AuditEntry['action']>('all');
  const [filterOutcome, setFilterOutcome] = useState<'all' | AuditEntry['outcome']>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | AuditEntry['severity']>('all');
  const [dateRange, setDateRange] = useState<'1h' | '24h' | '7d' | '30d' | '90d' | 'custom'>('24h');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  // Mock data
  const mockAuditEntries: AuditEntry[] = [
    {
      id: 'audit-001',
      timestamp: new Date(Date.now() - 300000),
      userId: 'user-001',
      userName: 'Dr. Sarah Johnson',
      action: 'view',
      resource: 'Patient Record',
      resourceType: 'patient',
      resourceId: 'pat-001',
      details: 'Viewed patient demographics and medical history',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Main Hospital - Cardiology',
      sessionId: 'session-001',
      outcome: 'success',
      severity: 'low',
      complianceFlags: [],
      metadata: {
        patientName: 'John Doe',
        accessReason: 'Routine Care',
        accessDuration: 120
      }
    },
    {
      id: 'audit-002',
      timestamp: new Date(Date.now() - 600000),
      userId: 'user-002',
      userName: 'Nurse Jennifer Davis',
      action: 'update',
      resource: 'Patient Vitals',
      resourceType: 'patient',
      resourceId: 'pat-001',
      details: 'Updated patient vital signs and medications',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      location: 'ICU - Station 3',
      sessionId: 'session-002',
      outcome: 'success',
      severity: 'medium',
      complianceFlags: [
        {
          type: 'hipaa',
          description: 'Patient accessed from mobile device',
          severity: 'info',
          requiresAction: false
        }
      ],
      metadata: {
        patientName: 'John Doe',
        accessReason: 'Patient Care',
        updatedFields: ['blood_pressure', 'heart_rate', 'medication_dosage']
      }
    },
    {
      id: 'audit-003',
      timestamp: new Date(Date.now() - 1800000),
      userId: 'user-003',
      userName: 'Admin User',
      action: 'access_denied',
      resource: 'VIP Patient Record',
      resourceType: 'patient',
      resourceId: 'pat-002',
      details: 'Attempted access to restricted patient record',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Admin Office',
      sessionId: 'session-003',
      outcome: 'failure',
      severity: 'high',
      complianceFlags: [
        {
          type: 'hipaa',
          description: 'Unauthorized access attempt to VIP patient record',
          severity: 'warning',
          requiresAction: true
        }
      ],
      metadata: {
        patientName: 'VIP Patient',
        accessReason: 'Not Authorized',
        attemptCount: 3
      }
    }
  ];

  const mockComplianceReports: ComplianceReport[] = [
    {
      id: 'report-001',
      title: 'Monthly HIPAA Compliance Report',
      type: 'hipaa',
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      generatedAt: new Date(),
      generatedBy: 'System',
      status: 'draft',
      summary: {
        totalEvents: 1247,
        complianceScore: 94.2,
        criticalIssues: 2,
        resolvedIssues: 18,
        pendingIssues: 3
      },
      sections: [
        {
          id: 'section-001',
          title: 'Access Control Summary',
          content: 'Overview of patient data access patterns and compliance metrics',
          charts: [
            {
              type: 'bar',
              title: 'Access by User Role',
              data: [45, 32, 28, 15, 8],
              labels: ['Physicians', 'Nurses', 'Technicians', 'Administrators', 'Students']
            }
          ],
          tables: [
            {
              headers: ['User Role', 'Total Access', 'Violations', 'Compliance %'],
              rows: [
                ['Physicians', '456', '2', '99.6%'],
                ['Nurses', '342', '1', '99.7%'],
                ['Technicians', '178', '0', '100%'],
                ['Administrators', '89', '3', '96.6%'],
                ['Students', '45', '1', '97.8%']
              ]
            }
          ],
          findings: [
            {
              type: 'violation',
              severity: 'medium',
              description: 'Unauthorized access attempts detected',
              evidence: ['audit-003', 'audit-005'],
              recommendation: 'Review access controls and user permissions',
              deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          ]
        }
      ],
      recommendations: [
        'Implement additional access controls for VIP patients',
        'Conduct mandatory privacy training for all staff',
        'Review and update user access permissions quarterly'
      ],
      actionItems: [
        {
          id: 'action-001',
          description: 'Review access controls for VIP patients',
          assignedTo: 'Security Team',
          priority: 'high',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'pending',
          notes: 'Follow up on recent unauthorized access attempts'
        }
      ],
      attachments: []
    }
  ];

  const mockPolicies: CompliancePolicy[] = [
    {
      id: 'policy-001',
      name: 'HIPAA Patient Access Policy',
      type: 'hipaa',
      description: 'Defines access controls and audit requirements for patient data',
      rules: [
        {
          id: 'rule-001',
          name: 'Minimum Necessary Access',
          description: 'Users should only access minimum necessary patient information',
          conditions: ['user_role', 'patient_relation', 'access_reason'],
          actions: ['log_access', 'validate_necessity', 'time_limit'],
          severity: 'high',
          isActive: true
        },
        {
          id: 'rule-002',
          name: 'VIP Patient Protection',
          description: 'Additional protections for VIP and celebrity patients',
          conditions: ['patient_vip_status', 'user_authorization'],
          actions: ['require_additional_auth', 'log_access', 'alert_security'],
          severity: 'critical',
          isActive: true
        }
      ],
      applicableRoles: ['physician', 'nurse', 'technician', 'administrator'],
      effectiveDate: new Date('2023-01-01'),
      isActive: true,
      lastReviewDate: new Date('2023-06-01'),
      nextReviewDate: new Date('2024-06-01'),
      version: '2.1',
      approvedBy: 'Chief Compliance Officer',
      approvedAt: new Date('2023-06-01')
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setAuditEntries(mockAuditEntries);
      setComplianceReports(mockComplianceReports);
      setCompliancePolicies(mockPolicies);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (realTimeEnabled) {
      const interval = setInterval(() => {
        // Simulate real-time audit entries
        const newEntry: AuditEntry = {
          id: `audit-${Date.now()}`,
          timestamp: new Date(),
          userId: 'user-001',
          userName: 'Dr. Sarah Johnson',
          action: 'view',
          resource: 'Patient Record',
          resourceType: 'patient',
          resourceId: 'pat-001',
          details: 'Viewed patient lab results',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'Main Hospital - Cardiology',
          sessionId: 'session-001',
          outcome: 'success',
          severity: 'low',
          complianceFlags: [],
          metadata: {
            patientName: 'John Doe',
            accessReason: 'Routine Care'
          }
        };
        
        setAuditEntries(prev => [newEntry, ...prev].slice(0, 100));
        onAuditEvent?.(newEntry);
      }, 30000); // Add new entry every 30 seconds

      return () => clearInterval(interval);
    }
  }, [realTimeEnabled, onAuditEvent]);

  const filteredAuditEntries = useMemo(() => {
    let filtered = auditEntries;

    // Filter by action
    if (filterAction !== 'all') {
      filtered = filtered.filter(entry => entry.action === filterAction);
    }

    // Filter by outcome
    if (filterOutcome !== 'all') {
      filtered = filtered.filter(entry => entry.outcome === filterOutcome);
    }

    // Filter by severity
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(entry => entry.severity === filterSeverity);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange !== 'custom') {
      const now = Date.now();
      let cutoff: number;

      switch (dateRange) {
        case '1h':
          cutoff = now - (60 * 60 * 1000);
          break;
        case '24h':
          cutoff = now - (24 * 60 * 60 * 1000);
          break;
        case '7d':
          cutoff = now - (7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          cutoff = now - (30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          cutoff = now - (90 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoff = 0;
      }

      filtered = filtered.filter(entry => entry.timestamp.getTime() >= cutoff);
    }

    return filtered;
  }, [auditEntries, filterAction, filterOutcome, filterSeverity, searchTerm, dateRange]);

  const getActionColor = (action: AuditEntry['action']) => {
    switch (action) {
      case 'view': return 'text-blue-600 bg-blue-100';
      case 'create': return 'text-green-600 bg-green-100';
      case 'update': return 'text-yellow-600 bg-yellow-100';
      case 'delete': return 'text-red-600 bg-red-100';
      case 'export': return 'text-purple-600 bg-purple-100';
      case 'print': return 'text-orange-600 bg-orange-100';
      case 'share': return 'text-pink-600 bg-pink-100';
      case 'login': return 'text-green-600 bg-green-100';
      case 'logout': return 'text-gray-600 bg-gray-100';
      case 'access_denied': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOutcomeColor = (outcome: AuditEntry['outcome']) => {
    switch (outcome) {
      case 'success': return 'text-green-600';
      case 'failure': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: AuditEntry['severity']) => {
    switch (severity) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getComplianceColor = (flag: ComplianceFlag) => {
    switch (flag.severity) {
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'critical': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleExportReport = (reportId: string) => {
    // Simulate export
    console.log('Exporting report:', reportId);
  };

  const handleCreateReport = (reportData: Partial<ComplianceReport>) => {
    const newReport: ComplianceReport = {
      id: `report-${Date.now()}`,
      title: reportData.title || 'New Compliance Report',
      type: reportData.type || 'comprehensive',
      period: reportData.period || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      generatedAt: new Date(),
      generatedBy: 'Current User',
      status: 'draft',
      summary: {
        totalEvents: 0,
        complianceScore: 0,
        criticalIssues: 0,
        resolvedIssues: 0,
        pendingIssues: 0
      },
      sections: [],
      recommendations: [],
      actionItems: [],
      attachments: []
    };

    setComplianceReports(prev => [...prev, newReport]);
    setShowCreateReport(false);
  };

  if (isLoading) {
    return (
      <div className={`medsight-glass p-6 rounded-xl ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-medsight-primary/20 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-medsight-primary/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`medsight-glass p-6 rounded-xl ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-medsight-primary mb-2">
              Compliance Audit Trail
            </h1>
            <p className="text-gray-600">HIPAA compliance, audit logging, and regulatory reporting</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Real-time</span>
              <button
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                className={`w-10 h-6 rounded-full p-1 transition-colors ${
                  realTimeEnabled ? 'bg-medsight-primary' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  realTimeEnabled ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
            
            <button
              onClick={() => setShowCreateReport(true)}
              className="btn-medsight bg-medsight-primary text-white"
            >
              <PlusIcon className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'audit', label: 'Audit Trail', icon: ClipboardDocumentListIcon },
            { id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon },
            { id: 'reports', label: 'Reports', icon: DocumentTextIcon },
            { id: 'policies', label: 'Policies', icon: BookOpenIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-medsight-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Audit Trail Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value as any)}
                  className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                >
                  <option value="all">All Actions</option>
                  <option value="view">View</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="export">Export</option>
                  <option value="print">Print</option>
                  <option value="share">Share</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="access_denied">Access Denied</option>
                </select>
                
                <select
                  value={filterOutcome}
                  onChange={(e) => setFilterOutcome(e.target.value as any)}
                  className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                >
                  <option value="all">All Outcomes</option>
                  <option value="success">Success</option>
                  <option value="failure">Failure</option>
                  <option value="warning">Warning</option>
                </select>
                
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value as any)}
                  className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                >
                  <option value="all">All Severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="custom">Custom</option>
                </select>
                
                <div className="col-span-2 relative">
                  <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search audit entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {filteredAuditEntries.length} entries found
                </span>
                <button
                  onClick={() => window.print()}
                  className="btn-medsight text-sm"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Audit Entries */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Outcome
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Compliance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAuditEntries.map(entry => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {entry.timestamp.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{entry.userName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(entry.action)}`}>
                            {entry.action.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {entry.resource}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getOutcomeColor(entry.outcome)}`}>
                            {entry.outcome}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getSeverityColor(entry.severity)}`}>
                            {entry.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {entry.complianceFlags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {entry.complianceFlags.map((flag, index) => (
                                <span key={index} className={`px-2 py-1 rounded text-xs font-medium ${getComplianceColor(flag)}`}>
                                  {flag.type.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedEntry(entry)}
                            className="text-medsight-primary hover:text-medsight-primary/80"
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
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            {/* Compliance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                    <p className="text-2xl font-bold text-medsight-primary">94.2%</p>
                  </div>
                  <ShieldCheckIcon className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                    <p className="text-2xl font-bold text-red-600">2</p>
                  </div>
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Resolved Issues</p>
                    <p className="text-2xl font-bold text-green-600">18</p>
                  </div>
                  <CheckCircleIcon className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Issues</p>
                    <p className="text-2xl font-bold text-yellow-600">3</p>
                  </div>
                  <ClockIcon className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Recent Violations */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Recent Compliance Issues</h3>
              <div className="space-y-3">
                {auditEntries
                  .filter(entry => entry.complianceFlags.length > 0)
                  .slice(0, 5)
                  .map(entry => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">{entry.details}</p>
                          <p className="text-sm text-gray-600">
                            {entry.userName} • {entry.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.complianceFlags.map((flag, index) => (
                          <span key={index} className={`px-2 py-1 rounded text-xs font-medium ${getComplianceColor(flag)}`}>
                            {flag.type.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {complianceReports.map(report => (
              <div key={report.id} className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{report.title}</h3>
                    <p className="text-sm text-gray-600">
                      {report.period.start.toLocaleDateString()} - {report.period.end.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      report.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      report.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {report.status}
                    </span>
                    <button
                      onClick={() => handleExportReport(report.id)}
                      className="btn-medsight"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-medsight-primary">{report.summary.totalEvents}</div>
                    <div className="text-sm text-gray-600">Total Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{report.summary.complianceScore}%</div>
                    <div className="text-sm text-gray-600">Compliance Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{report.summary.criticalIssues}</div>
                    <div className="text-sm text-gray-600">Critical Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{report.summary.resolvedIssues}</div>
                    <div className="text-sm text-gray-600">Resolved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{report.summary.pendingIssues}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Key Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {report.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <div className="space-y-6">
            {compliancePolicies.map(policy => (
              <div key={policy.id} className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{policy.name}</h3>
                    <p className="text-sm text-gray-600">{policy.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      policy.type === 'hipaa' ? 'bg-blue-100 text-blue-800' :
                      policy.type === 'gdpr' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {policy.type.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      policy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Version:</span>
                    <p className="font-medium">{policy.version}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Effective Date:</span>
                    <p className="font-medium">{policy.effectiveDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Review:</span>
                    <p className="font-medium">{policy.lastReviewDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Next Review:</span>
                    <p className="font-medium">{policy.nextReviewDate.toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Policy Rules ({policy.rules.length})</h4>
                  <div className="space-y-2">
                    {policy.rules.slice(0, 3).map(rule => (
                      <div key={rule.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                          {rule.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Entry Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Audit Entry Details</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Timestamp:</span>
                  <p className="text-sm">{selectedEntry.timestamp.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">User:</span>
                  <p className="text-sm">{selectedEntry.userName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Action:</span>
                  <p className="text-sm">{selectedEntry.action}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Resource:</span>
                  <p className="text-sm">{selectedEntry.resource}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Outcome:</span>
                  <p className="text-sm">{selectedEntry.outcome}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Severity:</span>
                  <p className="text-sm">{selectedEntry.severity}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">IP Address:</span>
                  <p className="text-sm">{selectedEntry.ipAddress}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Location:</span>
                  <p className="text-sm">{selectedEntry.location}</p>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Details:</span>
                <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedEntry.details}</p>
              </div>
              
              {selectedEntry.complianceFlags.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Compliance Flags:</span>
                  <div className="space-y-2 mt-1">
                    {selectedEntry.complianceFlags.map((flag, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getComplianceColor(flag)}`}>
                            {flag.type.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">{flag.severity}</span>
                        </div>
                        <p className="text-sm mt-1">{flag.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Generate Compliance Report</h3>
              <button
                onClick={() => setShowCreateReport(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleCreateReport({
                title: formData.get('title') as string,
                type: formData.get('type') as any,
                period: {
                  start: new Date(formData.get('startDate') as string),
                  end: new Date(formData.get('endDate') as string)
                }
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    placeholder="Enter report title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Type
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                  >
                    <option value="comprehensive">Comprehensive</option>
                    <option value="hipaa">HIPAA</option>
                    <option value="gdpr">GDPR</option>
                    <option value="hitech">HITECH</option>
                    <option value="sox">SOX</option>
                    <option value="pci">PCI</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      required
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      required
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateReport(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-medsight-primary text-white rounded-md hover:bg-medsight-primary/90"
                >
                  Generate Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 