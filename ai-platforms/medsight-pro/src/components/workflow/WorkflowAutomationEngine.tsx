'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlayIcon,
  PauseIcon,
  StopIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserIcon,
  Cog6ToothIcon,
  Cog8ToothIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  KeyIcon,
  EyeSlashIcon,
  BugAntIcon,
  CodeBracketIcon,
  CommandLineIcon,
  CircleStackIcon,
  ServerIcon,
  CpuChipIcon,
  WifiIcon,
  SignalIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  SpeakerWaveIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  CameraIcon,
  PhotoIcon,
  FilmIcon,
  MusicalNoteIcon,
  SpeakerXMarkIcon,
  PrinterIcon,
  DocumentIcon,
  DocumentDuplicateIcon,
  DocumentPlusIcon,
  DocumentMinusIcon,
  DocumentCheckIcon,
  FolderIcon,
  FolderOpenIcon,
  ArchiveBoxIcon,
  InboxIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  AtSymbolIcon,
  HashtagIcon,
  QrCodeIcon,
  ScaleIcon,
  CalculatorIcon,
  AcademicCapIcon,
  BookOpenIcon,
  NewspaperIcon,
  MegaphoneIcon,
  ChatBubbleOvalLeftIcon,
  QuestionMarkCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  PlusCircleIcon,
  MinusCircleIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  StopCircleIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  HeartIcon,
  StarIcon as StarIconSolid,
  FlagIcon as FlagIconSolid,
  BookmarkIcon,
  UserGroupIcon,
  UsersIcon,
  UserPlusIcon,
  UserMinusIcon,
  UserCircleIcon,
  IdentificationIcon,
  FingerPrintIcon,
  CreditCardIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  GiftIcon,
  TrophyIcon,
  CakeIcon,
  PuzzlePieceIcon,
  RadioIcon,
  TvIcon,
  DeviceTabletIcon,
  InboxArrowDownIcon,
  InboxStackIcon,
  QueueListIcon,
  Bars3Icon,
  Bars4Icon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3CenterLeftIcon,
  ViewColumnsIcon,
  ViewfinderCircleIcon,
  EyeDropperIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  CursorArrowRaysIcon,
  CursorArrowRippleIcon,
  PaintBrushIcon,
  SwatchIcon,
  NoSymbolIcon,
  BellAlertIcon,
  BellSlashIcon,
  BellSnoozeIcon,
  CalendarDaysIcon,
  ClockIcon as ClockIconSolid,
  SunIcon,
  MoonIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  RssIcon,
  ServerStackIcon,
  CircleStackIcon as CircleStackIconSolid,
  ServerIcon as ServerIconSolid,
  CpuChipIcon as CpuChipIconSolid,
  WifiIcon as WifiIconSolid,
  SignalIcon as SignalIconSolid,
  SignalSlashIcon,
  GlobeAltIcon as GlobeAltIconSolid,
  ComputerDesktopIcon as ComputerDesktopIconSolid,
  DevicePhoneMobileIcon as DevicePhoneMobileIconSolid,
  PhoneIcon as PhoneIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  SpeakerWaveIcon as SpeakerWaveIconSolid,
  MicrophoneIcon as MicrophoneIconSolid,
  VideoCameraIcon as VideoCameraIconSolid,
  CameraIcon as CameraIconSolid,
  PhotoIcon as PhotoIconSolid,
  FilmIcon as FilmIconSolid,
  MusicalNoteIcon as MusicalNoteIconSolid,
  SpeakerXMarkIcon as SpeakerXMarkIconSolid,
  PrinterIcon as PrinterIconSolid,
  DocumentIcon as DocumentIconSolid,
  DocumentDuplicateIcon as DocumentDuplicateIconSolid,
  DocumentPlusIcon as DocumentPlusIconSolid,
  DocumentMinusIcon as DocumentMinusIconSolid,
  DocumentCheckIcon as DocumentCheckIconSolid,
  FolderIcon as FolderIconSolid,
  FolderOpenIcon as FolderOpenIconSolid,
  ArchiveBoxIcon as ArchiveBoxIconSolid,
  InboxIcon as InboxIconSolid,
  PaperAirplaneIcon as PaperAirplaneIconSolid,
  PaperClipIcon as PaperClipIconSolid,
  AtSymbolIcon as AtSymbolIconSolid,
  HashtagIcon as HashtagIconSolid,
  QrCodeIcon as QrCodeIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ChartPieIcon as ChartPieIconSolid,
  ArrowTrendingUpIcon as ArrowTrendingUpIconSolid,
  ArrowTrendingDownIcon as ArrowTrendingDownIconSolid,
  ScaleIcon as ScaleIconSolid,
  CalculatorIcon as CalculatorIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  NewspaperIcon as NewspaperIconSolid,
  MegaphoneIcon as MegaphoneIconSolid,
  ChatBubbleOvalLeftIcon as ChatBubbleOvalLeftIconSolid,
  QuestionMarkCircleIcon as QuestionMarkCircleIconSolid,
  ExclamationCircleIcon as ExclamationCircleIconSolid,
  PlayCircleIcon as PlayCircleIconSolid,
  PauseCircleIcon as PauseCircleIconSolid,
  StopCircleIcon as StopCircleIconSolid,
  FaceSmileIcon as FaceSmileIconSolid,
  FaceFrownIcon as FaceFrownIconSolid,
  HandThumbUpIcon as HandThumbUpIconSolid,
  HandThumbDownIcon as HandThumbDownIconSolid,
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  UsersIcon as UsersIconSolid,
  UserPlusIcon as UserPlusIconSolid,
  UserMinusIcon as UserMinusIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  IdentificationIcon as IdentificationIconSolid,
  FingerPrintIcon as FingerPrintIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  BanknotesIcon as BanknotesIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  GiftIcon as GiftIconSolid,
  TrophyIcon as TrophyIconSolid,
  CakeIcon as CakeIconSolid,
  PuzzlePieceIcon as PuzzlePieceIconSolid,
  ComputerDesktopIcon as ComputerDesktopIconSolid2,
  DeviceTabletIcon as DeviceTabletIconSolid,
  RadioIcon as RadioIconSolid,
  TvIcon as TvIconSolid,
  MegaphoneIcon as MegaphoneIconSolid2,
  InboxArrowDownIcon as InboxArrowDownIconSolid,
  InboxStackIcon as InboxStackIconSolid,
  QueueListIcon as QueueListIconSolid,
  Bars3Icon as Bars3IconSolid,
  Bars4Icon as Bars4IconSolid,
  Bars3BottomLeftIcon as Bars3BottomLeftIconSolid,
  Bars3BottomRightIcon as Bars3BottomRightIconSolid,
  Bars3CenterLeftIcon as Bars3CenterLeftIconSolid,
  ViewColumnsIcon as ViewColumnsIconSolid,
  ViewfinderCircleIcon as ViewfinderCircleIconSolid,
  EyeDropperIcon as EyeDropperIconSolid,
  MagnifyingGlassPlusIcon as MagnifyingGlassPlusIconSolid,
  MagnifyingGlassMinusIcon as MagnifyingGlassMinusIconSolid,
  CursorArrowRaysIcon as CursorArrowRaysIconSolid,
  CursorArrowRippleIcon as CursorArrowRippleIconSolid,
  PaintBrushIcon as PaintBrushIconSolid,
  SwatchIcon as SwatchIconSolid,
  NoSymbolIcon as NoSymbolIconSolid,
  BellAlertIcon as BellAlertIconSolid,
  BellSlashIcon as BellSlashIconSolid,
  BellSnoozeIcon as BellSnoozeIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  ClockIcon as ClockIconSolidAlt,
  SunIcon as SunIconSolid,
  MoonIcon as MoonIconSolid,
  CloudArrowUpIcon as CloudArrowUpIconSolid,
  CloudArrowDownIcon as CloudArrowDownIconSolid,
  RssIcon as RssIconSolid,
  ServerStackIcon as ServerStackIconSolid
} from '@heroicons/react/24/outline';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  type: 'trigger' | 'condition' | 'action' | 'notification';
  enabled: boolean;
  trigger: {
    type: 'schedule' | 'event' | 'condition' | 'manual';
    schedule?: {
      frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
      time: string;
      days?: string[];
      date?: Date;
    };
    event?: {
      source: string;
      eventType: string;
      filters: { [key: string]: any };
    };
    condition?: {
      field: string;
      operator: string;
      value: any;
    };
  };
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  tags: string[];
  metadata: { [key: string]: any };
}

interface AutomationCondition {
  id: string;
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'exists' | 'not_exists';
  value: any;
  logicalOperator: 'AND' | 'OR';
  group?: string;
}

interface AutomationAction {
  id: string;
  type: 'email' | 'sms' | 'webhook' | 'database' | 'workflow' | 'notification' | 'assignment' | 'escalation' | 'report';
  name: string;
  description: string;
  configuration: { [key: string]: any };
  timeout: number;
  retryCount: number;
  retryDelay: number;
  onError: 'stop' | 'continue' | 'retry' | 'escalate';
  dependencies: string[];
  enabled: boolean;
}

interface AutomationExecution {
  id: string;
  ruleId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  triggeredBy: string;
  triggerEvent: string;
  context: { [key: string]: any };
  steps: ExecutionStep[];
  logs: ExecutionLog[];
  error?: string;
  result?: any;
  metadata: { [key: string]: any };
}

interface ExecutionStep {
  id: string;
  actionId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  input?: any;
  output?: any;
  error?: string;
  retryCount: number;
}

interface ExecutionLog {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  category: string;
  context?: { [key: string]: any };
}

interface AutomationMetrics {
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  executionsToday: number;
  executionsThisWeek: number;
  executionsThisMonth: number;
  topRules: {
    id: string;
    name: string;
    executionCount: number;
    successRate: number;
  }[];
  recentExecutions: AutomationExecution[];
}

interface WorkflowAutomationEngineProps {
  onRuleExecuted?: (execution: AutomationExecution) => void;
  onRuleCreated?: (rule: AutomationRule) => void;
  onRuleUpdated?: (rule: AutomationRule) => void;
  onRuleDeleted?: (ruleId: string) => void;
  className?: string;
}

export default function WorkflowAutomationEngine({
  onRuleExecuted,
  onRuleCreated,
  onRuleUpdated,
  onRuleDeleted,
  className = ''
}: WorkflowAutomationEngineProps) {
  const [activeTab, setActiveTab] = useState<'rules' | 'executions' | 'metrics' | 'logs'>('rules');
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [filterType, setFilterType] = useState<'all' | AutomationRule['type']>('all');
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<AutomationExecution | null>(null);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [engineStatus, setEngineStatus] = useState<'running' | 'stopped' | 'paused'>('running');
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // Mock data
  const mockRules: AutomationRule[] = [
    {
      id: 'rule-001',
      name: 'Report Turnaround Alert',
      description: 'Send alert when report turnaround time exceeds 24 hours',
      type: 'trigger',
      enabled: true,
      trigger: {
        type: 'condition',
        condition: {
          field: 'report_turnaround_time',
          operator: '>',
          value: 24
        }
      },
      conditions: [
        {
          id: 'cond-001',
          field: 'report_status',
          operator: '=',
          value: 'pending',
          logicalOperator: 'AND'
        }
      ],
      actions: [
        {
          id: 'action-001',
          type: 'email',
          name: 'Send Alert Email',
          description: 'Send email notification to supervisors',
          configuration: {
            recipients: ['supervisor@hospital.com'],
            subject: 'Report Turnaround Alert',
            template: 'report_turnaround_alert'
          },
          timeout: 30,
          retryCount: 3,
          retryDelay: 5,
          onError: 'retry',
          dependencies: [],
          enabled: true
        },
        {
          id: 'action-002',
          type: 'workflow',
          name: 'Escalate to Manager',
          description: 'Create escalation workflow for manager review',
          configuration: {
            workflowType: 'escalation',
            assignTo: 'manager',
            priority: 'high'
          },
          timeout: 60,
          retryCount: 2,
          retryDelay: 10,
          onError: 'escalate',
          dependencies: ['action-001'],
          enabled: true
        }
      ],
      priority: 'high',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-10-15'),
      createdBy: 'System Admin',
      lastExecuted: new Date(Date.now() - 3600000),
      executionCount: 247,
      successRate: 96.3,
      averageExecutionTime: 12.5,
      tags: ['reports', 'turnaround', 'quality'],
      metadata: {
        department: 'radiology',
        criticality: 'high'
      }
    },
    {
      id: 'rule-002',
      name: 'Patient Registration Workflow',
      description: 'Automatically trigger patient onboarding workflow',
      type: 'trigger',
      enabled: true,
      trigger: {
        type: 'event',
        event: {
          source: 'patient_registration',
          eventType: 'patient_created',
          filters: {
            status: 'active'
          }
        }
      },
      conditions: [
        {
          id: 'cond-002',
          field: 'patient_type',
          operator: '=',
          value: 'new',
          logicalOperator: 'AND'
        }
      ],
      actions: [
        {
          id: 'action-003',
          type: 'workflow',
          name: 'Start Onboarding',
          description: 'Initialize patient onboarding workflow',
          configuration: {
            workflowType: 'patient_onboarding',
            assignTo: 'registration_team',
            priority: 'medium'
          },
          timeout: 120,
          retryCount: 3,
          retryDelay: 15,
          onError: 'escalate',
          dependencies: [],
          enabled: true
        },
        {
          id: 'action-004',
          type: 'notification',
          name: 'Notify Care Team',
          description: 'Send notification to assigned care team',
          configuration: {
            notificationType: 'push',
            recipients: ['care_team'],
            message: 'New patient registered and requires attention'
          },
          timeout: 10,
          retryCount: 2,
          retryDelay: 5,
          onError: 'continue',
          dependencies: ['action-003'],
          enabled: true
        }
      ],
      priority: 'medium',
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2023-11-01'),
      createdBy: 'Registration Admin',
      lastExecuted: new Date(Date.now() - 1800000),
      executionCount: 1834,
      successRate: 98.7,
      averageExecutionTime: 8.2,
      tags: ['patient', 'registration', 'onboarding'],
      metadata: {
        department: 'registration',
        criticality: 'medium'
      }
    },
    {
      id: 'rule-003',
      name: 'Daily Quality Metrics Report',
      description: 'Generate and distribute daily quality metrics report',
      type: 'trigger',
      enabled: true,
      trigger: {
        type: 'schedule',
        schedule: {
          frequency: 'daily',
          time: '06:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
      },
      conditions: [],
      actions: [
        {
          id: 'action-005',
          type: 'report',
          name: 'Generate Quality Report',
          description: 'Generate comprehensive quality metrics report',
          configuration: {
            reportType: 'quality_metrics',
            period: 'daily',
            format: 'pdf',
            includeCharts: true
          },
          timeout: 300,
          retryCount: 2,
          retryDelay: 30,
          onError: 'retry',
          dependencies: [],
          enabled: true
        },
        {
          id: 'action-006',
          type: 'email',
          name: 'Distribute Report',
          description: 'Email report to stakeholders',
          configuration: {
            recipients: ['quality@hospital.com', 'admin@hospital.com'],
            subject: 'Daily Quality Metrics Report',
            attachReport: true
          },
          timeout: 60,
          retryCount: 3,
          retryDelay: 10,
          onError: 'escalate',
          dependencies: ['action-005'],
          enabled: true
        }
      ],
      priority: 'medium',
      createdAt: new Date('2023-03-01'),
      updatedAt: new Date('2023-09-15'),
      createdBy: 'Quality Admin',
      lastExecuted: new Date(Date.now() - 18000000),
      executionCount: 156,
      successRate: 94.2,
      averageExecutionTime: 245.7,
      tags: ['reporting', 'quality', 'scheduled'],
      metadata: {
        department: 'quality',
        criticality: 'medium'
      }
    }
  ];

  const mockExecutions: AutomationExecution[] = [
    {
      id: 'exec-001',
      ruleId: 'rule-001',
      status: 'completed',
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() - 3540000),
      duration: 60,
      triggeredBy: 'System',
      triggerEvent: 'report_turnaround_exceeded',
      context: {
        reportId: 'report-001',
        patientId: 'pat-001',
        turnaroundTime: 26.5
      },
      steps: [
        {
          id: 'step-001',
          actionId: 'action-001',
          name: 'Send Alert Email',
          status: 'completed',
          startTime: new Date(Date.now() - 3600000),
          endTime: new Date(Date.now() - 3580000),
          duration: 20,
          input: {
            recipients: ['supervisor@hospital.com'],
            subject: 'Report Turnaround Alert'
          },
          output: {
            emailId: 'email-001',
            status: 'sent'
          },
          retryCount: 0
        },
        {
          id: 'step-002',
          actionId: 'action-002',
          name: 'Escalate to Manager',
          status: 'completed',
          startTime: new Date(Date.now() - 3580000),
          endTime: new Date(Date.now() - 3540000),
          duration: 40,
          input: {
            workflowType: 'escalation',
            assignTo: 'manager'
          },
          output: {
            workflowId: 'workflow-001',
            status: 'created'
          },
          retryCount: 0
        }
      ],
      logs: [
        {
          id: 'log-001',
          timestamp: new Date(Date.now() - 3600000),
          level: 'info',
          message: 'Rule execution started',
          category: 'execution'
        },
        {
          id: 'log-002',
          timestamp: new Date(Date.now() - 3580000),
          level: 'info',
          message: 'Email sent successfully',
          category: 'action'
        },
        {
          id: 'log-003',
          timestamp: new Date(Date.now() - 3540000),
          level: 'info',
          message: 'Escalation workflow created',
          category: 'action'
        }
      ],
      result: {
        success: true,
        message: 'All actions completed successfully'
      },
      metadata: {
        reportId: 'report-001',
        patientId: 'pat-001'
      }
    }
  ];

  const mockMetrics: AutomationMetrics = {
    totalRules: 15,
    activeRules: 12,
    totalExecutions: 2847,
    successfulExecutions: 2698,
    failedExecutions: 149,
    averageExecutionTime: 32.7,
    executionsToday: 47,
    executionsThisWeek: 312,
    executionsThisMonth: 1256,
    topRules: [
      {
        id: 'rule-002',
        name: 'Patient Registration Workflow',
        executionCount: 1834,
        successRate: 98.7
      },
      {
        id: 'rule-001',
        name: 'Report Turnaround Alert',
        executionCount: 247,
        successRate: 96.3
      },
      {
        id: 'rule-003',
        name: 'Daily Quality Metrics Report',
        executionCount: 156,
        successRate: 94.2
      }
    ],
    recentExecutions: mockExecutions
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setAutomationRules(mockRules);
      setExecutions(mockExecutions);
      setMetrics(mockMetrics);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (realTimeUpdates && engineStatus === 'running') {
      const interval = setInterval(() => {
        // Simulate real-time execution updates
        const newExecution: AutomationExecution = {
          id: `exec-${Date.now()}`,
          ruleId: 'rule-002',
          status: 'completed',
          startTime: new Date(Date.now() - 30000),
          endTime: new Date(),
          duration: 30,
          triggeredBy: 'Event',
          triggerEvent: 'patient_registered',
          context: {
            patientId: `pat-${Date.now()}`,
            eventType: 'new_patient'
          },
          steps: [
            {
              id: 'step-001',
              actionId: 'action-003',
              name: 'Start Onboarding',
              status: 'completed',
              startTime: new Date(Date.now() - 30000),
              endTime: new Date(Date.now() - 10000),
              duration: 20,
              retryCount: 0
            }
          ],
          logs: [],
          result: {
            success: true,
            message: 'Patient onboarding initiated'
          },
          metadata: {}
        };
        
        setExecutions(prev => [newExecution, ...prev].slice(0, 50));
        onRuleExecuted?.(newExecution);
      }, 60000); // Add new execution every minute

      return () => clearInterval(interval);
    }
  }, [realTimeUpdates, engineStatus, onRuleExecuted]);

  const filteredRules = useMemo(() => {
    return automationRules.filter(rule => {
      if (filterStatus === 'enabled' && !rule.enabled) return false;
      if (filterStatus === 'disabled' && rule.enabled) return false;
      if (filterType !== 'all' && rule.type !== filterType) return false;
      if (searchTerm && !rule.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [automationRules, filterStatus, filterType, searchTerm]);

  const handleRuleToggle = (ruleId: string) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const handleRuleDelete = (ruleId: string) => {
    setAutomationRules(prev => prev.filter(rule => rule.id !== ruleId));
    onRuleDeleted?.(ruleId);
  };

  const handleEngineControl = (action: 'start' | 'stop' | 'pause') => {
    switch (action) {
      case 'start':
        setEngineStatus('running');
        break;
      case 'stop':
        setEngineStatus('stopped');
        break;
      case 'pause':
        setEngineStatus('paused');
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': case 'stopped': return 'text-red-600';
      case 'paused': return 'text-gray-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <PlayIcon className="w-4 h-4 text-green-600" />;
      case 'completed': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'pending': return <ClockIcon className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <XCircleIcon className="w-4 h-4 text-red-600" />;
      case 'stopped': return <StopIcon className="w-4 h-4 text-red-600" />;
      case 'paused': return <PauseIcon className="w-4 h-4 text-gray-600" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className={`medsight-glass p-6 rounded-xl ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-medsight-primary/20 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-medsight-primary/10 rounded"></div>
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
              Workflow Automation Engine
            </h1>
            <p className="text-gray-600">Automated task scheduling, notifications, and workflow orchestration</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Engine Status */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border">
              {getStatusIcon(engineStatus)}
              <span className={`text-sm font-medium ${getStatusColor(engineStatus)}`}>
                {engineStatus.toUpperCase()}
              </span>
            </div>
            
            {/* Engine Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEngineControl('start')}
                disabled={engineStatus === 'running'}
                className="btn-medsight bg-green-500 text-white disabled:opacity-50"
              >
                <PlayIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEngineControl('pause')}
                disabled={engineStatus !== 'running'}
                className="btn-medsight bg-yellow-500 text-white disabled:opacity-50"
              >
                <PauseIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEngineControl('stop')}
                disabled={engineStatus === 'stopped'}
                className="btn-medsight bg-red-500 text-white disabled:opacity-50"
              >
                <StopIcon className="w-4 h-4" />
              </button>
            </div>
            
            {/* Real-time Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Real-time</span>
              <button
                onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                className={`w-10 h-6 rounded-full p-1 transition-colors ${
                  realTimeUpdates ? 'bg-medsight-primary' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  realTimeUpdates ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
            
            <button
              onClick={() => setShowCreateRule(true)}
              className="btn-medsight bg-medsight-primary text-white"
            >
              <PlusIcon className="w-4 h-4" />
              Create Rule
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'rules', label: 'Automation Rules', icon: Cog6ToothIcon },
            { id: 'executions', label: 'Executions', icon: PlayIcon },
            { id: 'metrics', label: 'Metrics', icon: ChartBarIcon },
            { id: 'logs', label: 'Logs', icon: DocumentTextIcon }
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
        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="trigger">Trigger</option>
                  <option value="condition">Condition</option>
                  <option value="action">Action</option>
                  <option value="notification">Notification</option>
                </select>
                
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search rules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Rules List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRules.map(rule => (
                <div key={rule.id} className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-lg">{rule.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(rule.priority)}`}>
                        {rule.priority}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRuleToggle(rule.id)}
                          className={`w-8 h-5 rounded-full p-0.5 transition-colors ${
                            rule.enabled ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            rule.enabled ? 'translate-x-3' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{rule.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{rule.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Executions:</span>
                      <span className="font-medium">{rule.executionCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium">{rule.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Duration:</span>
                      <span className="font-medium">{rule.averageExecutionTime}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Executed:</span>
                      <span className="font-medium">
                        {rule.lastExecuted ? rule.lastExecuted.toLocaleString() : 'Never'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRule(rule)}
                        className="btn-medsight text-xs"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRule(rule);
                          setShowRuleEditor(true);
                        }}
                        className="btn-medsight text-xs"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleRuleDelete(rule.id)}
                        className="btn-medsight text-xs text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Executions Tab */}
        {activeTab === 'executions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Execution ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Rule
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Started
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Duration
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Triggered By
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {executions.map(execution => (
                      <tr key={execution.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">
                          {execution.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {automationRules.find(r => r.id === execution.ruleId)?.name || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(execution.status)}
                            <span className={`text-sm font-medium ${getStatusColor(execution.status)}`}>
                              {execution.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {execution.startTime.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {execution.duration ? `${execution.duration}s` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {execution.triggeredBy}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          <button
                            onClick={() => setSelectedExecution(execution)}
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

        {/* Metrics Tab */}
        {activeTab === 'metrics' && metrics && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Rules</p>
                    <p className="text-2xl font-bold text-medsight-primary">{metrics.totalRules}</p>
                  </div>
                  <Cog6ToothIcon className="w-8 h-8 text-medsight-primary/30" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Rules</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.activeRules}</p>
                  </div>
                  <PlayIcon className="w-8 h-8 text-green-500/30" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-medsight-primary">
                      {Math.round((metrics.successfulExecutions / metrics.totalExecutions) * 100)}%
                    </p>
                  </div>
                  <CheckCircleIcon className="w-8 h-8 text-green-500/30" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                    <p className="text-2xl font-bold text-medsight-primary">{metrics.averageExecutionTime}s</p>
                  </div>
                  <ClockIcon className="w-8 h-8 text-medsight-primary/30" />
                </div>
              </div>
            </div>

            {/* Top Performing Rules */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Top Performing Rules</h3>
              <div className="space-y-3">
                {metrics.topRules.map(rule => (
                  <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-gray-600">{rule.executionCount} executions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{rule.successRate}%</p>
                      <p className="text-sm text-gray-600">success rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Execution Logs</h3>
            <div className="space-y-2">
              {executions.flatMap(exec => exec.logs).slice(0, 20).map(log => (
                <div key={log.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded text-sm">
                  <span className="text-gray-500">{log.timestamp.toLocaleTimeString()}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.level === 'error' ? 'bg-red-100 text-red-800' :
                    log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-gray-700">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Rule Modal */}
      {showCreateRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create Automation Rule</h3>
              <button
                onClick={() => setShowCreateRule(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const newRule: AutomationRule = {
                id: `rule-${Date.now()}`,
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                type: formData.get('type') as any,
                enabled: true,
                trigger: {
                  type: 'event',
                  event: {
                    source: 'system',
                    eventType: 'test',
                    filters: {}
                  }
                },
                conditions: [],
                actions: [],
                priority: formData.get('priority') as any,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 'Current User',
                executionCount: 0,
                successRate: 0,
                averageExecutionTime: 0,
                tags: [],
                metadata: {}
              };
              
              setAutomationRules(prev => [...prev, newRule]);
              setShowCreateRule(false);
              onRuleCreated?.(newRule);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    placeholder="Enter rule name"
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
                    placeholder="Enter rule description"
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
                      <option value="trigger">Trigger</option>
                      <option value="condition">Condition</option>
                      <option value="action">Action</option>
                      <option value="notification">Notification</option>
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
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateRule(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-medsight-primary text-white rounded-md hover:bg-medsight-primary/90"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 