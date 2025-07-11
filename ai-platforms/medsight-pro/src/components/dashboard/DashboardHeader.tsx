'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BellIcon, 
  UserIcon, 
  CogIcon, 
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  EyeIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  AdjustmentsHorizontalIcon,
  QuestionMarkCircleIcon,
  PhoneIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  BoltIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EllipsisVerticalIcon,
  WifiIcon,
  SignalIcon,
  Battery50Icon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon as TimeIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  StarIcon,
  FireIcon,
  SparklesIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  ChatBubbleBottomCenterIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  FolderIcon,
  PhotoIcon,
  FilmIcon,
  PresentationChartBarIcon,
  ChartBarIcon,
  TableCellsIcon,
  ListBulletIcon,
  Squares2X2Icon,
  RectangleStackIcon,
  RectangleGroupIcon,
  WindowIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  TvIcon,
  PrinterIcon,
  CloudIcon,
  ServerIcon,
  CpuChipIcon,
  CommandLineIcon,
  CodeBracketIcon,
  BugAntIcon,
  CubeIcon,
  BeakerIcon,
  MagnifyingGlassCircleIcon,
  FunnelIcon,
  AdjustmentsVerticalIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ShareIcon,
  LinkIcon,
  PaperClipIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  FolderArrowDownIcon,
  BookmarkIcon,
  TagIcon,
  FlagIcon,
  HandRaisedIcon,
  LockClosedIcon,
  LockOpenIcon,
  KeyIcon,
  FingerPrintIcon,
  IdentificationIcon,
  CreditCardIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  ScaleIcon,
  TruckIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  InboxIcon,
  ChatBubbleLeftIcon,
  AtSymbolIcon,
  HashtagIcon,
  NumberedListIcon,
  CheckIcon,
  PlusIcon,
  MinusIcon,
  EqualsIcon,
  DivideIcon,
  CursorArrowRaysIcon,
  CursorArrowRippleIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  HeartIcon as HeartIconSolid,
  FireIcon as FireIconSolid,
  SparklesIcon as SparklesIconSolid,
  BoltIcon as BoltIconSolid,
  StarIcon as StarIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  LockClosedIcon as LockClosedIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationCircleIcon as ExclamationCircleIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
  BellIcon as BellIconSolid,
  UserIcon as UserIconSolid,
  CogIcon as CogIconSolid
} from '@heroicons/react/24/outline';
import type { MedicalUser } from '@/types/medical-user';
import medicalAuth from '@/lib/auth/medical-auth';
import { medicalSessionManager } from '@/lib/auth/session-management';

// Header props
interface DashboardHeaderProps {
  user: MedicalUser;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  className?: string;
  onMenuToggle?: () => void;
  onSearch?: (query: string) => void;
}

// Notification interface
interface MedicalNotification {
  id: string;
  type: 'emergency' | 'alert' | 'info' | 'success' | 'warning' | 'critical';
  category: 'clinical' | 'system' | 'compliance' | 'social' | 'security';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionRequired: boolean;
  actions?: {
    label: string;
    onClick: () => void;
    variant: 'primary' | 'secondary' | 'danger';
  }[];
  metadata?: {
    patientId?: string;
    studyId?: string;
    userId?: string;
    systemId?: string;
    severity?: string;
  };
}

// User menu item interface
interface UserMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  divider?: boolean;
  disabled?: boolean;
  badge?: string;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

// Search result interface
interface SearchResult {
  id: string;
  type: 'patient' | 'study' | 'user' | 'document' | 'system';
  title: string;
  subtitle?: string;
  metadata?: string;
  href?: string;
  onClick?: () => void;
}

// System status interface
interface SystemStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance' | 'warning' | 'error';
  uptime: string;
  performance: number;
  lastUpdate: Date;
}

export function DashboardHeader({
  user,
  title = 'Medical Dashboard',
  subtitle,
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  className = '',
  onMenuToggle,
  onSearch
}: DashboardHeaderProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<MedicalNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showUserMenuPanel, setShowUserMenuPanel] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [quickAccessItems, setQuickAccessItems] = useState<any[]>([]);

  // Initialize header
  useEffect(() => {
    initializeHeader();
    loadNotifications();
    loadSystemStatus();
    loadSessionInfo();
    loadQuickAccess();
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Initialize header
  const initializeHeader = async () => {
    // Load theme preference
    const savedTheme = localStorage.getItem('medical_theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }

    // Check for emergency mode
    try {
      const emergencySession = await medicalSessionManager.getCurrentSession();
      if (emergencySession && emergencySession.deviceInfo?.location === 'emergency') {
        setEmergencyMode(true);
      }
    } catch (error) {
      console.error('Error checking emergency mode:', error);
    }
  };

  // Load notifications
  const loadNotifications = () => {
    // Mock medical notifications
    const mockNotifications: MedicalNotification[] = [
      {
        id: 'critical_finding_1',
        type: 'emergency',
        category: 'clinical',
        title: 'Critical Finding Detected',
        message: 'AI analysis has detected a critical finding in Study #12345 that requires immediate attention.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        read: false,
        priority: 'urgent',
        actionRequired: true,
        actions: [
          {
            label: 'Review Study',
            onClick: () => router.push('/workspace/medical-imaging/study/12345'),
            variant: 'primary'
          },
          {
            label: 'Acknowledge',
            onClick: () => handleNotificationAction('critical_finding_1', 'acknowledge'),
            variant: 'secondary'
          }
        ],
        metadata: {
          patientId: 'P001',
          studyId: '12345',
          severity: 'critical'
        }
      },
      {
        id: 'collaboration_request_1',
        type: 'info',
        category: 'social',
        title: 'Collaboration Request',
        message: 'Dr. Smith has requested a consultation on Case #67890.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        priority: 'medium',
        actionRequired: true,
        actions: [
          {
            label: 'Accept',
            onClick: () => handleNotificationAction('collaboration_request_1', 'accept'),
            variant: 'primary'
          },
          {
            label: 'Decline',
            onClick: () => handleNotificationAction('collaboration_request_1', 'decline'),
            variant: 'secondary'
          }
        ],
        metadata: {
          userId: 'dr_smith',
          patientId: 'P002'
        }
      },
      {
        id: 'system_maintenance_1',
        type: 'warning',
        category: 'system',
        title: 'Scheduled Maintenance',
        message: 'The system will undergo maintenance tonight from 2:00 AM to 4:00 AM.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        priority: 'low',
        actionRequired: false,
        metadata: {
          systemId: 'main_server'
        }
      },
      {
        id: 'compliance_update_1',
        type: 'info',
        category: 'compliance',
        title: 'HIPAA Training Update',
        message: 'Your HIPAA training certification expires in 30 days. Please complete the renewal course.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: true,
        priority: 'medium',
        actionRequired: true,
        actions: [
          {
            label: 'Complete Training',
            onClick: () => router.push('/support/training/hipaa'),
            variant: 'primary'
          }
        ]
      },
      {
        id: 'ai_analysis_complete_1',
        type: 'success',
        category: 'clinical',
        title: 'AI Analysis Complete',
        message: 'AI analysis has been completed for 5 pending studies.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        read: true,
        priority: 'low',
        actionRequired: false,
        metadata: {
          studyId: 'batch_001'
        }
      }
    ];

    setNotifications(mockNotifications);
  };

  // Load system status
  const loadSystemStatus = () => {
    const mockStatus: SystemStatus[] = [
      {
        id: 'dicom_server',
        name: 'DICOM Server',
        status: 'online',
        uptime: '99.9%',
        performance: 95,
        lastUpdate: new Date()
      },
      {
        id: 'ai_engine',
        name: 'AI Engine',
        status: 'online',
        uptime: '99.8%',
        performance: 92,
        lastUpdate: new Date()
      },
      {
        id: 'database',
        name: 'Medical Database',
        status: 'online',
        uptime: '99.95%',
        performance: 98,
        lastUpdate: new Date()
      },
      {
        id: 'backup_system',
        name: 'Backup System',
        status: 'warning',
        uptime: '98.5%',
        performance: 85,
        lastUpdate: new Date()
      }
    ];

    setSystemStatus(mockStatus);
  };

  // Load session info
  const loadSessionInfo = async () => {
    try {
      const session = await medicalSessionManager.getCurrentSession();
      if (session) {
        setSessionInfo({
          id: session.id,
          startTime: session.createdAt,
          lastActivity: session.lastActivity,
          location: {
            hospital: 'General Hospital',
            department: 'Radiology',
            workstation: 'WS-001'
          },
          emergencyAccess: false,
          extendedSession: false,
          remainingTime: new Date(session.expiresAt).getTime() - Date.now()
        });
      }
    } catch (error) {
      console.error('Error loading session info:', error);
    }
  };

  // Load quick access items
  const loadQuickAccess = () => {
    const quickItems = [
      {
        id: 'new_study',
        label: 'New Study',
        icon: PlusIcon,
        onClick: () => router.push('/workspace/medical-imaging/new'),
        color: 'bg-blue-500'
      },
      {
        id: 'emergency_case',
        label: 'Emergency',
        icon: HeartIconSolid,
        onClick: () => router.push('/emergency'),
        color: 'bg-red-500'
      },
      {
        id: 'ai_analysis',
        label: 'AI Analysis',
        icon: SparklesIconSolid,
        onClick: () => router.push('/workspace/ai-analysis'),
        color: 'bg-purple-500'
      },
      {
        id: 'collaboration',
        label: 'Collaborate',
        icon: ChatBubbleLeftRightIcon,
        onClick: () => router.push('/workspace/collaboration'),
        color: 'bg-green-500'
      }
    ];

    setQuickAccessItems(quickItems);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.length > 2) {
      // Mock search results
      const mockResults: SearchResult[] = [
        {
          id: 'patient_001',
          type: 'patient' as const,
          title: 'John Doe',
          subtitle: 'Patient ID: P001',
          metadata: 'Last visit: 2024-01-15',
          href: '/medical/patients/P001'
        },
        {
          id: 'study_12345',
          type: 'study' as const,
          title: 'CT Chest Study',
          subtitle: 'Study ID: 12345',
          metadata: 'Date: 2024-01-15',
          href: '/workspace/medical-imaging/study/12345'
        },
        {
          id: 'user_dr_smith',
          type: 'user' as const,
          title: 'Dr. Sarah Smith',
          subtitle: 'Radiologist',
          metadata: 'Department: Radiology',
          href: '/admin/users/dr_smith'
        }
      ].filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle?.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }

    if (onSearch) {
      onSearch(query);
    }
  };

  // Handle notification action
  const handleNotificationAction = (notificationId: string, action: string) => {
    console.log(`Notification ${notificationId} action: ${action}`);
    
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, read: true }
          : n
      )
    );
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await medicalAuth.logout(user.id, 'current-token');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('medical_theme', newDarkMode ? 'dark' : 'light');
    
    // Apply theme to document
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // User menu items
  const userMenuItems: UserMenuItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: UserIcon,
      onClick: () => router.push('/profile')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: CogIcon,
      onClick: () => router.push('/settings')
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: AdjustmentsHorizontalIcon,
      onClick: () => router.push('/settings/preferences')
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: QuestionMarkCircleIcon,
      onClick: () => router.push('/support/help-center'),
      divider: true
    },
    {
      id: 'emergency',
      label: 'Emergency Access',
      icon: HeartIconSolid,
      onClick: () => router.push('/emergency'),
      color: 'danger'
    },
    {
      id: 'theme',
      label: darkMode ? 'Light Mode' : 'Dark Mode',
      icon: darkMode ? SunIcon : MoonIcon,
      onClick: handleThemeToggle
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: ArrowRightOnRectangleIcon,
      onClick: handleLogout,
      color: 'danger',
      divider: true
    }
  ];

  // Get unread notification count
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const urgentNotifications = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  return (
    <header 
      className={`
        sticky top-0 z-30 border-b border-white/20 backdrop-blur-lg
        medsight-glass
        ${emergencyMode ? 'bg-red-500/10 border-red-500/30' : ''}
        ${className}
      `}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Menu Toggle (Mobile) */}
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Bars3Icon className="w-6 h-6 text-slate-600" />
              </button>
            )}

            {/* Title Section */}
            <div>
              <h1 
                className={`
                  text-2xl font-bold
                  ${emergencyMode ? 'text-red-700' : 'text-medsight-primary-700'}
                `}
                style={{ 
                  fontFamily: 'var(--font-primary)',
                  letterSpacing: '0.01em',
                  lineHeight: '1.3'
                }}
              >
                {title}
                {emergencyMode && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                    EMERGENCY MODE
                  </span>
                )}
              </h1>
              {subtitle && (
                <p 
                  className="text-sm text-slate-600 mt-1"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Center Section - Search */}
          {showSearch && (
            <div className="flex-1 max-w-md mx-8 relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patients, studies, users..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/70 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-medsight-primary-500 focus:border-transparent focus:bg-white/90"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                />
              </div>

              {/* Search Results */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.map(result => (
                    <button
                      key={result.id}
                      onClick={() => {
                        if (result.href) {
                          router.push(result.href);
                        }
                        if (result.onClick) {
                          result.onClick();
                        }
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-medsight-primary-50 transition-colors border-b border-white/10 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium
                          ${result.type === 'patient' ? 'bg-blue-500' :
                            result.type === 'study' ? 'bg-green-500' :
                            result.type === 'user' ? 'bg-purple-500' :
                            result.type === 'document' ? 'bg-orange-500' :
                            'bg-slate-500'
                          }
                        `}>
                          {result.type === 'patient' ? 'P' :
                           result.type === 'study' ? 'S' :
                           result.type === 'user' ? 'U' :
                           result.type === 'document' ? 'D' :
                           'S'}
                        </div>
                        <div className="flex-1">
                          <p 
                            className="text-sm font-medium text-slate-900"
                            style={{ 
                              fontFamily: 'var(--font-primary)',
                              letterSpacing: '0.01em'
                            }}
                          >
                            {result.title}
                          </p>
                          {result.subtitle && (
                            <p 
                              className="text-xs text-slate-600"
                              style={{ 
                                fontFamily: 'var(--font-primary)',
                                letterSpacing: '0.01em'
                              }}
                            >
                              {result.subtitle}
                            </p>
                          )}
                          {result.metadata && (
                            <p 
                              className="text-xs text-slate-500"
                              style={{ 
                                fontFamily: 'var(--font-primary)',
                                letterSpacing: '0.01em'
                              }}
                            >
                              {result.metadata}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Current Time */}
            <div className="hidden md:block text-right">
              <p 
                className="text-sm font-medium text-slate-700"
                style={{ 
                  fontFamily: 'var(--font-primary)',
                  letterSpacing: '0.01em'
                }}
              >
                {currentTime.toLocaleTimeString()}
              </p>
              <p 
                className="text-xs text-slate-500"
                style={{ 
                  fontFamily: 'var(--font-primary)',
                  letterSpacing: '0.01em'
                }}
              >
                {currentTime.toLocaleDateString()}
              </p>
            </div>

            {/* Quick Access */}
            <div className="hidden lg:flex items-center space-x-2">
              {quickAccessItems.map(item => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`
                    p-2 rounded-lg ${item.color} text-white hover:opacity-90 transition-opacity
                    ${item.id === 'emergency_case' ? 'animate-pulse' : ''}
                  `}
                  title={item.label}
                >
                  <item.icon className="w-5 h-5" />
                </button>
              ))}
            </div>

            {/* Notifications */}
            {showNotifications && (
              <div className="relative">
                <button
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <BellIcon className="w-6 h-6 text-slate-600" />
                  {unreadNotifications > 0 && (
                    <span 
                      className={`
                        absolute -top-1 -right-1 w-5 h-5 text-xs font-bold text-white rounded-full flex items-center justify-center
                        ${urgentNotifications > 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}
                      `}
                    >
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Notification Panel */}
                {showNotificationPanel && (
                  <div className="absolute top-full right-0 mt-2 w-96 bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                    <div className="p-4 border-b border-white/20">
                      <h3 
                        className="text-lg font-semibold text-slate-900"
                        style={{ 
                          fontFamily: 'var(--font-primary)',
                          letterSpacing: '0.01em'
                        }}
                      >
                        Medical Notifications
                      </h3>
                      <p 
                        className="text-sm text-slate-600"
                        style={{ 
                          fontFamily: 'var(--font-primary)',
                          letterSpacing: '0.01em'
                        }}
                      >
                        {unreadNotifications} unread notifications
                      </p>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`
                            p-4 border-b border-white/10 last:border-b-0
                            ${!notification.read ? 'bg-blue-50/50' : ''}
                            ${notification.priority === 'urgent' ? 'bg-red-50/50 border-l-4 border-red-500' : ''}
                          `}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`
                              w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0
                              ${notification.type === 'emergency' ? 'bg-red-500' :
                                notification.type === 'warning' ? 'bg-yellow-500' :
                                notification.type === 'success' ? 'bg-green-500' :
                                notification.type === 'critical' ? 'bg-red-600' :
                                'bg-blue-500'
                              }
                            `}>
                              {notification.type === 'emergency' ? (
                                <HeartIconSolid className="w-4 h-4" />
                              ) : notification.type === 'warning' ? (
                                <ExclamationTriangleIcon className="w-4 h-4" />
                              ) : notification.type === 'success' ? (
                                <CheckCircleIcon className="w-4 h-4" />
                              ) : notification.type === 'critical' ? (
                                <ExclamationCircleIcon className="w-4 h-4" />
                              ) : (
                                <InformationCircleIcon className="w-4 h-4" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 
                                  className="text-sm font-medium text-slate-900"
                                  style={{ 
                                    fontFamily: 'var(--font-primary)',
                                    letterSpacing: '0.01em'
                                  }}
                                >
                                  {notification.title}
                                </h4>
                                <span 
                                  className="text-xs text-slate-500"
                                  style={{ 
                                    fontFamily: 'var(--font-primary)',
                                    letterSpacing: '0.01em'
                                  }}
                                >
                                  {notification.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <p 
                                className="text-sm text-slate-600 mt-1"
                                style={{ 
                                  fontFamily: 'var(--font-primary)',
                                  letterSpacing: '0.01em'
                                }}
                              >
                                {notification.message}
                              </p>
                              
                              {notification.actions && (
                                <div className="flex items-center space-x-2 mt-2">
                                  {notification.actions.map(action => (
                                    <button
                                      key={action.label}
                                      onClick={action.onClick}
                                      className={`
                                        px-3 py-1 text-xs font-medium rounded-md transition-colors
                                        ${action.variant === 'primary' ? 'bg-medsight-primary-500 text-white hover:bg-medsight-primary-600' :
                                          action.variant === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' :
                                          'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }
                                      `}
                                    >
                                      {action.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-white/20">
                      <button
                        onClick={() => router.push('/notifications')}
                        className="w-full text-center text-sm text-medsight-primary-600 hover:text-medsight-primary-700 font-medium"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* System Status Indicator */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span 
                  className="text-xs text-slate-600"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  System Healthy
                </span>
              </div>
            </div>

            {/* User Menu */}
            {showUserMenu && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenuPanel(!showUserMenuPanel)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 bg-medsight-primary-500 rounded-full flex items-center justify-center">
                    <UserIconSolid className="w-6 h-6 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p 
                      className="text-sm font-medium text-slate-700"
                      style={{ 
                        fontFamily: 'var(--font-primary)',
                        letterSpacing: '0.01em'
                      }}
                    >
                      {user.name}
                    </p>
                    <p 
                      className="text-xs text-slate-500"
                      style={{ 
                        fontFamily: 'var(--font-primary)',
                        letterSpacing: '0.01em'
                      }}
                    >
                      {user.role}
                    </p>
                  </div>
                  <ChevronDownIcon className="w-4 h-4 text-slate-500" />
                </button>

                {/* User Menu Panel */}
                {showUserMenuPanel && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-medsight-primary-500 rounded-full flex items-center justify-center">
                          <UserIconSolid className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p 
                            className="text-sm font-medium text-slate-900"
                            style={{ 
                              fontFamily: 'var(--font-primary)',
                              letterSpacing: '0.01em'
                            }}
                          >
                            {user.name}
                          </p>
                          <p 
                            className="text-xs text-slate-600"
                            style={{ 
                              fontFamily: 'var(--font-primary)',
                              letterSpacing: '0.01em'
                            }}
                          >
                            {user.email}
                          </p>
                          <p 
                            className="text-xs text-slate-500"
                            style={{ 
                              fontFamily: 'var(--font-primary)',
                              letterSpacing: '0.01em'
                            }}
                          >
                            {user.medicalLicense}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      {userMenuItems.map(item => (
                        <div key={item.id}>
                          {item.divider && <div className="my-2 border-t border-white/20" />}
                          <button
                            onClick={() => {
                              item.onClick();
                              setShowUserMenuPanel(false);
                            }}
                            disabled={item.disabled}
                            className={`
                              w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-white/50 transition-colors
                              ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                              ${item.color === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-slate-700'}
                            `}
                          >
                            <item.icon className="w-5 h-5" />
                            <span 
                              className="text-sm"
                              style={{ 
                                fontFamily: 'var(--font-primary)',
                                letterSpacing: '0.01em'
                              }}
                            >
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Info Bar */}
      {sessionInfo && (
        <div className="px-6 py-2 border-t border-white/20 bg-white/20">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4" />
                <span 
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  Session: {Math.floor((Date.now() - sessionInfo.startTime.getTime()) / (1000 * 60))}m
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-4 h-4" />
                <span 
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  {sessionInfo.location?.hospital || 'Unknown Location'}
                </span>
              </div>
              {sessionInfo.emergencyAccess && (
                <div className="flex items-center space-x-2 text-red-600">
                  <HeartIconSolid className="w-4 h-4" />
                  <span 
                    style={{ 
                      fontFamily: 'var(--font-primary)',
                      letterSpacing: '0.01em'
                    }}
                  >
                    Emergency Access Active
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ShieldCheckIconSolid className="w-4 h-4 text-green-600" />
                <span 
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  HIPAA Compliant
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <WifiIcon className="w-4 h-4" />
                <span 
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 