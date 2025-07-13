'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChartBarIcon, 
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  AcademicCapIcon,
  BellIcon,
  CogIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartPieIcon,
  TableCellsIcon,
  ArrowRightIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  InformationCircleIcon,
  LightBulbIcon,
  FlagIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PrinterIcon,
  ShareIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
  Squares2X2Icon,
  ListBulletIcon,
  Bars3Icon,
  EllipsisVerticalIcon,
  QuestionMarkCircleIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  TrophyIcon,
  GiftIcon,
  HeartIcon,
  BeakerIcon,
  CpuChipIcon,
  CommandLineIcon,
  CodeBracketIcon,
  BugAntIcon,
  WrenchIcon,
  Cog6ToothIcon,
  PaintBrushIcon,
  SwatchIcon,
  EyeDropperIcon,
  PhotoIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  MusicalNoteIcon,
  FilmIcon,
  CameraIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  TvIcon,
  RadioIcon,
  MegaphoneIcon,
  ChatBubbleOvalLeftIcon,
  PhoneIcon,
  AtSymbolIcon,
  HashtagIcon,
  LinkIcon,
  GlobeAltIcon,
  MapIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  HomeIcon,
  UserIcon,
  UsersIcon,
  UserPlusIcon,
  UserMinusIcon,
  UserCircleIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  HandRaisedIcon,
  FingerPrintIcon,
  KeyIcon,
  LockClosedIcon,
  ShieldExclamationIcon,
  EyeSlashIcon,
  NoSymbolIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleUpIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  XCircleIcon as XCircleIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationCircleIcon as ExclamationCircleIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
  QuestionMarkCircleIcon as QuestionMarkCircleIconSolid,
  LightBulbIcon as LightBulbIconSolid,
  BellIcon as BellIconSolid,
  BellAlertIcon,
  BellSlashIcon,
  BellSnoozeIcon,
  FlagIcon as FlagIconSolid,
  BookmarkIcon,
  BookmarkSlashIcon,
  BookOpenIcon,
  NewspaperIcon,
  DocumentIcon,
  DocumentDuplicateIcon,
  DocumentPlusIcon,
  DocumentMinusIcon,
  DocumentCheckIcon,
  DocumentTextIcon as DocumentTextIconSolid,
  DocumentChartBarIcon,
  DocumentMagnifyingGlassIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon as DocumentArrowDownIconSolid,
  ClipboardIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconSolid,
  FolderIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  FolderMinusIcon,
  ArchiveBoxIcon,
  ArchiveBoxArrowDownIcon,
  ArchiveBoxXMarkIcon,
  InboxIcon,
  InboxArrowDownIcon,
  InboxStackIcon,
  EnvelopeIcon as EnvelopeIconSolid,
  EnvelopeOpenIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  TagIcon,
  HashtagIcon as HashtagIconSolid,
  AtSymbolIcon as AtSymbolIconSolid,
  LinkIcon as LinkIconSolid,
  GlobeAltIcon as GlobeAltIconSolid,
  WifiIcon,
  SignalIcon,
  SignalSlashIcon,
  RssIcon,
  CloudIcon,
  CloudArrowUpIcon as CloudArrowUpIconSolid,
  CloudArrowDownIcon,
  ServerIcon,
  ServerStackIcon,
  CircleStackIcon,
  CpuChipIcon as CpuChipIconSolid,
  QueueListIcon,
  TableCellsIcon as TableCellsIconSolid,
  ViewColumnsIcon,
  ViewfinderCircleIcon,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  AdjustmentsHorizontalIcon,
  AdjustmentsVerticalIcon,
  FunnelIcon as FunnelIconSolid,
  Bars2Icon,
  Bars3Icon as Bars3IconSolid,
  Bars4Icon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3CenterLeftIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

interface QualityMetric {
  id: string;
  name: string;
  category: 'clinical' | 'operational' | 'financial' | 'patient_satisfaction' | 'safety' | 'compliance';
  description: string;
  value: number;
  target: number;
  threshold: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  unit: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
  dataSource: string;
  frequency: 'real-time' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  benchmarks: {
    internal: number;
    external: number;
    industry: number;
  };
}

interface PeerReview {
  id: string;
  type: 'case_review' | 'report_review' | 'procedure_review' | 'medication_review' | 'imaging_review';
  title: string;
  description: string;
  patientId: string;
  revieweeId: string;
  reviewerId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate: Date;
  completedDate?: Date;
  reviewCriteria: ReviewCriteria[];
  findings: ReviewFinding[];
  recommendations: string[];
  rating: {
    overall: number;
    clinical: number;
    documentation: number;
    communication: number;
    timeliness: number;
  };
  feedback: string;
  actionItems: ActionItem[];
  followUpRequired: boolean;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewCriteria {
  id: string;
  category: string;
  description: string;
  weight: number;
  score: number;
  maxScore: number;
  comments: string;
  evidence: string[];
}

interface ReviewFinding {
  id: string;
  type: 'strength' | 'improvement' | 'concern' | 'critical';
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  resources: string[];
}

interface ActionItem {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedDate?: Date;
  notes: string;
}

interface PerformanceAlert {
  id: string;
  type: 'quality_threshold' | 'peer_review_overdue' | 'metric_decline' | 'benchmark_miss' | 'compliance_issue';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  metric?: string;
  threshold?: number;
  currentValue?: number;
  affectedUsers: string[];
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolution?: string;
}

interface QualityReport {
  id: string;
  title: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'ad_hoc';
  period: {
    start: Date;
    end: Date;
  };
  metrics: QualityMetric[];
  peerReviews: PeerReview[];
  alerts: PerformanceAlert[];
  summary: {
    overallScore: number;
    trends: { [key: string]: 'improving' | 'stable' | 'declining' };
    achievements: string[];
    challenges: string[];
    recommendations: string[];
  };
  generatedAt: Date;
  generatedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
}

interface QualityAssuranceSystemProps {
  departmentId?: string;
  userId?: string;
  onMetricUpdated?: (metric: QualityMetric) => void;
  onReviewCompleted?: (review: PeerReview) => void;
  onAlertGenerated?: (alert: PerformanceAlert) => void;
  className?: string;
}

export default function QualityAssuranceSystem({
  departmentId,
  userId,
  onMetricUpdated,
  onReviewCompleted,
  onAlertGenerated,
  className = ''
}: QualityAssuranceSystemProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'metrics' | 'reviews' | 'alerts' | 'reports'>('dashboard');
  const [metrics, setMetrics] = useState<QualityMetric[]>([]);
  const [peerReviews, setPeerReviews] = useState<PeerReview[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [reports, setReports] = useState<QualityReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | QualityMetric['category']>('all');
  const [showCreateReview, setShowCreateReview] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PeerReview | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock data
  const mockMetrics: QualityMetric[] = [
    {
      id: 'metric-001',
      name: 'Report Turnaround Time',
      category: 'operational',
      description: 'Average time from study completion to report finalization',
      value: 18.5,
      target: 24,
      threshold: {
        excellent: 12,
        good: 18,
        fair: 24,
        poor: 30
      },
      unit: 'hours',
      trend: 'up',
      lastUpdated: new Date(),
      dataSource: 'RIS/PACS',
      frequency: 'daily',
      benchmarks: {
        internal: 20.2,
        external: 22.1,
        industry: 26.8
      }
    },
    {
      id: 'metric-002',
      name: 'Diagnostic Accuracy Rate',
      category: 'clinical',
      description: 'Percentage of correct diagnoses confirmed by follow-up',
      value: 94.2,
      target: 95,
      threshold: {
        excellent: 98,
        good: 95,
        fair: 90,
        poor: 85
      },
      unit: '%',
      trend: 'stable',
      lastUpdated: new Date(),
      dataSource: 'Quality Database',
      frequency: 'monthly',
      benchmarks: {
        internal: 93.8,
        external: 94.5,
        industry: 92.3
      }
    },
    {
      id: 'metric-003',
      name: 'Patient Satisfaction Score',
      category: 'patient_satisfaction',
      description: 'Overall patient satisfaction rating',
      value: 4.6,
      target: 4.5,
      threshold: {
        excellent: 4.8,
        good: 4.5,
        fair: 4.0,
        poor: 3.5
      },
      unit: '/5',
      trend: 'up',
      lastUpdated: new Date(),
      dataSource: 'Patient Surveys',
      frequency: 'weekly',
      benchmarks: {
        internal: 4.4,
        external: 4.3,
        industry: 4.1
      }
    },
    {
      id: 'metric-004',
      name: 'Peer Review Completion Rate',
      category: 'compliance',
      description: 'Percentage of peer reviews completed on time',
      value: 87.3,
      target: 90,
      threshold: {
        excellent: 95,
        good: 90,
        fair: 85,
        poor: 80
      },
      unit: '%',
      trend: 'down',
      lastUpdated: new Date(),
      dataSource: 'QA System',
      frequency: 'weekly',
      benchmarks: {
        internal: 89.1,
        external: 91.2,
        industry: 88.7
      }
    }
  ];

  const mockPeerReviews: PeerReview[] = [
    {
      id: 'review-001',
      type: 'case_review',
      title: 'Chest CT Interpretation Review',
      description: 'Review of chest CT interpretation for quality assurance',
      patientId: 'pat-001',
      revieweeId: 'doc-001',
      reviewerId: 'doc-002',
      status: 'pending',
      priority: 'medium',
      scheduledDate: new Date(Date.now() + 86400000),
      reviewCriteria: [
        {
          id: 'criteria-001',
          category: 'Technical Quality',
          description: 'Image quality and technical parameters',
          weight: 0.3,
          score: 0,
          maxScore: 5,
          comments: '',
          evidence: []
        },
        {
          id: 'criteria-002',
          category: 'Diagnostic Accuracy',
          description: 'Accuracy of interpretation and diagnosis',
          weight: 0.5,
          score: 0,
          maxScore: 5,
          comments: '',
          evidence: []
        },
        {
          id: 'criteria-003',
          category: 'Report Quality',
          description: 'Clarity and completeness of report',
          weight: 0.2,
          score: 0,
          maxScore: 5,
          comments: '',
          evidence: []
        }
      ],
      findings: [],
      recommendations: [],
      rating: {
        overall: 0,
        clinical: 0,
        documentation: 0,
        communication: 0,
        timeliness: 0
      },
      feedback: '',
      actionItems: [],
      followUpRequired: false,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000)
    }
  ];

  const mockAlerts: PerformanceAlert[] = [
    {
      id: 'alert-001',
      type: 'quality_threshold',
      severity: 'warning',
      title: 'Report Turnaround Time Above Target',
      description: 'Average report turnaround time has exceeded the target threshold',
      metric: 'Report Turnaround Time',
      threshold: 24,
      currentValue: 26.8,
      affectedUsers: ['doc-001', 'doc-002'],
      createdAt: new Date(Date.now() - 3600000),
      acknowledged: false,
      resolved: false
    },
    {
      id: 'alert-002',
      type: 'peer_review_overdue',
      severity: 'error',
      title: 'Overdue Peer Reviews',
      description: 'Multiple peer reviews are overdue and require immediate attention',
      affectedUsers: ['doc-003', 'doc-004'],
      createdAt: new Date(Date.now() - 7200000),
      acknowledged: false,
      resolved: false
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setMetrics(mockMetrics);
      setPeerReviews(mockPeerReviews);
      setAlerts(mockAlerts);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredMetrics = useMemo(() => {
    return metrics.filter(metric => {
      if (filterCategory !== 'all' && metric.category !== filterCategory) return false;
      if (searchTerm && !metric.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [metrics, filterCategory, searchTerm]);

  const getMetricColor = (metric: QualityMetric) => {
    if (metric.value >= metric.threshold.excellent) return 'text-green-600';
    if (metric.value >= metric.threshold.good) return 'text-blue-600';
    if (metric.value >= metric.threshold.fair) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricBackground = (metric: QualityMetric) => {
    if (metric.value >= metric.threshold.excellent) return 'bg-green-100';
    if (metric.value >= metric.threshold.good) return 'bg-blue-100';
    if (metric.value >= metric.threshold.fair) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />;
      case 'stable': return <ArrowRightIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: PerformanceAlert['severity']) => {
    switch (severity) {
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'critical': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: PeerReview['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-600';
      case 'in_progress': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleCreateReview = (reviewData: Partial<PeerReview>) => {
    const newReview: PeerReview = {
      id: `review-${Date.now()}`,
      type: reviewData.type || 'case_review',
      title: reviewData.title || 'New Review',
      description: reviewData.description || '',
      patientId: reviewData.patientId || 'unknown',
      revieweeId: reviewData.revieweeId || 'unknown',
      reviewerId: 'current-user',
      status: 'pending',
      priority: reviewData.priority || 'medium',
      scheduledDate: reviewData.scheduledDate || new Date(),
      reviewCriteria: [],
      findings: [],
      recommendations: [],
      rating: {
        overall: 0,
        clinical: 0,
        documentation: 0,
        communication: 0,
        timeliness: 0
      },
      feedback: '',
      actionItems: [],
      followUpRequired: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPeerReviews(prev => [...prev, newReview]);
    setShowCreateReview(false);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true, acknowledgedBy: 'current-user', acknowledgedAt: new Date() }
        : alert
    ));
  };

  if (isLoading) {
    return (
      <div className={`medsight-glass p-6 rounded-xl ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-medsight-primary/20 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-medsight-primary/10 rounded"></div>
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
              Quality Assurance System
            </h1>
            <p className="text-gray-600">Peer review, quality metrics, and performance monitoring</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <BellIcon className="w-6 h-6 text-gray-500" />
              {alerts.filter(a => !a.acknowledged).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {alerts.filter(a => !a.acknowledged).length}
                </span>
              )}
            </div>
            
            <button
              onClick={() => setShowCreateReview(true)}
              className="btn-medsight bg-medsight-primary text-white"
            >
              <PlusIcon className="w-4 h-4" />
              New Review
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
            { id: 'metrics', label: 'Metrics', icon: PresentationChartLineIcon },
            { id: 'reviews', label: 'Peer Reviews', icon: ClipboardDocumentCheckIcon },
            { id: 'alerts', label: 'Alerts', icon: BellIcon },
            { id: 'reports', label: 'Reports', icon: DocumentTextIcon }
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
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.slice(0, 4).map(metric => (
                <div key={metric.id} className={`p-4 rounded-lg border ${getMetricBackground(metric)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{metric.name}</h3>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getMetricColor(metric)}`}>
                      {metric.value}{metric.unit}
                    </span>
                    <span className="text-sm text-gray-500">
                      Target: {metric.target}{metric.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Alerts */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Recent Alerts</h3>
              {alerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    disabled={alert.acknowledged}
                    className="btn-medsight text-sm disabled:opacity-50"
                  >
                    {alert.acknowledged ? 'Acknowledged' : 'Acknowledge'}
                  </button>
                </div>
              ))}
            </div>

            {/* Pending Reviews */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Pending Reviews</h3>
              {peerReviews.filter(r => r.status === 'pending').map(review => (
                <div key={review.id} className="flex items-center justify-between p-3 bg-gray-50 rounded mb-2">
                  <div>
                    <p className="font-medium">{review.title}</p>
                    <p className="text-sm text-gray-600">
                      Scheduled: {review.scheduledDate.toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedReview(review)}
                    className="btn-medsight bg-medsight-primary text-white"
                  >
                    Start Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="clinical">Clinical</option>
                <option value="operational">Operational</option>
                <option value="financial">Financial</option>
                <option value="patient_satisfaction">Patient Satisfaction</option>
                <option value="safety">Safety</option>
                <option value="compliance">Compliance</option>
              </select>
              
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search metrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Metrics List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMetrics.map(metric => (
                <div key={metric.id} className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">{metric.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getMetricColor(metric)} ${getMetricBackground(metric)}`}>
                      {metric.category.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{metric.description}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-3xl font-bold ${getMetricColor(metric)}`}>
                      {metric.value}{metric.unit}
                    </span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Target:</span>
                      <span className="font-medium">{metric.target}{metric.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Industry Benchmark:</span>
                      <span className="font-medium">{metric.benchmarks.industry}{metric.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span className="font-medium">{metric.lastUpdated.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {peerReviews.map(review => (
                <div key={review.id} className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">{review.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(review.status)}`}>
                      {review.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{review.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{review.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Priority:</span>
                      <span className="font-medium">{review.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scheduled:</span>
                      <span className="font-medium">{review.scheduledDate.toLocaleDateString()}</span>
                    </div>
                    {review.completedDate && (
                      <div className="flex justify-between">
                        <span>Completed:</span>
                        <span className="font-medium">{review.completedDate.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="btn-medsight bg-medsight-primary text-white"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div key={alert.id} className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <h3 className="font-medium">{alert.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {alert.createdAt.toLocaleDateString()}
                    </span>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="btn-medsight text-sm"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{alert.description}</p>
                
                {alert.metric && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm">
                      <span className="font-medium">Metric:</span> {alert.metric}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Current Value:</span> {alert.currentValue}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Threshold:</span> {alert.threshold}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Quality Reports</h3>
            <div className="text-center text-gray-500 py-8">
              <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No reports available yet</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Review Modal */}
      {showCreateReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New Peer Review</h3>
              <button
                onClick={() => setShowCreateReview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleCreateReview({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                type: formData.get('type') as any,
                priority: formData.get('priority') as any,
                patientId: formData.get('patientId') as string,
                revieweeId: formData.get('revieweeId') as string,
                scheduledDate: new Date(formData.get('scheduledDate') as string)
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    placeholder="Enter review title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    placeholder="Enter review description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    >
                      <option value="case_review">Case Review</option>
                      <option value="report_review">Report Review</option>
                      <option value="procedure_review">Procedure Review</option>
                      <option value="medication_review">Medication Review</option>
                      <option value="imaging_review">Imaging Review</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      required
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    name="patientId"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    placeholder="Enter patient ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reviewee ID
                  </label>
                  <input
                    type="text"
                    name="revieweeId"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    placeholder="Enter reviewee ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateReview(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-medsight-primary text-white rounded-md hover:bg-medsight-primary/90"
                >
                  Create Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 