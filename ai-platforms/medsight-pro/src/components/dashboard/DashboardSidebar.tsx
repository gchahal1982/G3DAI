'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UserGroupIcon, 
  CogIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ClockIcon,
  BellIcon,
  HeartIcon,
  EyeIcon,
  CpuChipIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  StarIcon,
  FolderIcon,
  CameraIcon,
  BeakerIcon,
  CloudIcon,
  LockClosedIcon,
  AcademicCapIcon,
  UserIcon,
  MagnifyingGlassIcon,
  CommandLineIcon,
  CircleStackIcon,
  BoltIcon,
  CubeIcon,
  PhoneIcon,
  LifebuoyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as TimeIcon,
  DocumentDuplicateIcon,
  ChartPieIcon,
  PlayIcon,
  PauseIcon,
  FireIcon,
  RocketLaunchIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  SwatchIcon,
  FilmIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
  ArchiveBoxIcon,
  ServerIcon,
  WifiIcon,
  SignalIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  PresentationChartBarIcon,
  NewspaperIcon,
  MapIcon,
  GlobeAmericasIcon,
  AdjustmentsHorizontalIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  TvIcon,
  PrinterIcon,
  MicrophoneIcon as MicIcon,
  SpeakerXMarkIcon,
  RadioIcon,
  BugAntIcon,
  CodeBracketIcon,
  WindowIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid,
  BellIcon as BellIconSolid,
  StarIcon as StarIconSolid,
  EyeIcon as EyeIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  LockClosedIcon as LockClosedIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  FireIcon as FireIconSolid,
  SparklesIcon as SparklesIconSolid,
  BoltIcon as BoltIconSolid
} from '@heroicons/react/24/solid';
import type { MedicalUser } from '@/types/medical-user';

// Sidebar props
interface DashboardSidebarProps {
  user: MedicalUser;
  collapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
}

// Navigation item interface
interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  iconActive?: React.ComponentType<any>;
  href?: string;
  onClick?: () => void;
  children?: NavigationItem[];
  badge?: {
    text: string;
    color: 'success' | 'warning' | 'error' | 'info';
  };
  status?: 'active' | 'inactive' | 'warning' | 'error';
  requiredRole?: string[];
  requiredPermission?: string[];
  isActive?: boolean;
  isNew?: boolean;
  isEmergency?: boolean;
  medicalCategory?: 'clinical' | 'administrative' | 'technical' | 'compliance';
}

// Medical status interface
interface MedicalStatus {
  id: string;
  type: 'patient' | 'system' | 'ai' | 'device' | 'compliance';
  status: 'normal' | 'abnormal' | 'critical' | 'pending';
  count: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  lastUpdate: Date;
}

// Quick action interface
interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  category: 'medical' | 'system' | 'admin';
  color: string;
  enabled: boolean;
}

export function DashboardSidebar({ user, collapsed, onToggleCollapse }: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [medicalStatus, setMedicalStatus] = useState<MedicalStatus[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Initialize sidebar
  useEffect(() => {
    initializeSidebar();
    loadMedicalStatus();
    loadQuickActions();
    loadUserPreferences();
  }, [user]);

  // Initialize sidebar
  const initializeSidebar = () => {
    // Load collapsed state from localStorage
    const savedCollapsed = localStorage.getItem('medical_nav_collapsed');
    if (savedCollapsed !== null) {
      onToggleCollapse(JSON.parse(savedCollapsed));
    }

    // Load expanded groups
    const savedGroups = localStorage.getItem('medical_nav_expanded');
    if (savedGroups) {
      setExpandedGroups(JSON.parse(savedGroups));
    }
  };

  // Load medical status
  const loadMedicalStatus = () => {
    // Mock medical status data
    const statusData: MedicalStatus[] = [
      {
        id: 'active_cases',
        type: 'patient',
        status: 'normal',
        count: 24,
        urgency: 'medium',
        lastUpdate: new Date()
      },
      {
        id: 'pending_reviews',
        type: 'ai',
        status: 'pending',
        count: 8,
        urgency: 'high',
        lastUpdate: new Date()
      },
      {
        id: 'critical_findings',
        type: 'patient',
        status: 'critical',
        count: 3,
        urgency: 'critical',
        lastUpdate: new Date()
      },
      {
        id: 'system_health',
        type: 'system',
        status: 'normal',
        count: 1,
        urgency: 'low',
        lastUpdate: new Date()
      }
    ];

    setMedicalStatus(statusData);
  };

  // Load quick actions
  const loadQuickActions = () => {
    const actions: QuickAction[] = [
      {
        id: 'new_study',
        label: 'New Study',
        icon: PlusIcon,
        onClick: () => router.push('/workspace/medical-imaging/new'),
        category: 'medical',
        color: 'bg-blue-500',
        enabled: true
      },
      {
        id: 'emergency_case',
        label: 'Emergency',
        icon: HeartIconSolid,
        onClick: () => router.push('/emergency'),
        category: 'medical',
        color: 'bg-red-500',
        enabled: true
      },
      {
        id: 'ai_analysis',
        label: 'AI Analysis',
        icon: SparklesIconSolid,
        onClick: () => router.push('/workspace/ai-analysis'),
        category: 'medical',
        color: 'bg-purple-500',
        enabled: true
      },
      {
        id: 'collaboration',
        label: 'Collaborate',
        icon: UserGroupIcon,
        onClick: () => router.push('/workspace/collaboration'),
        category: 'medical',
        color: 'bg-green-500',
        enabled: true
      }
    ];

    setQuickActions(actions);
  };

  // Load user preferences
  const loadUserPreferences = () => {
    const savedRecent = localStorage.getItem('medical_nav_recent');
    if (savedRecent) {
      setRecentItems(JSON.parse(savedRecent));
    }

    const savedFavorites = localStorage.getItem('medical_nav_favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  // Navigation items configuration
  const navigationItems: NavigationItem[] = [
    // Medical Dashboard
    {
      id: 'medical_dashboard',
      label: 'Medical Dashboard',
      icon: HomeIcon,
      href: '/dashboard/medical',
      medicalCategory: 'clinical',
      isActive: pathname.startsWith('/dashboard/medical')
    },
    
    // Medical Workspaces
    {
      id: 'medical_workspaces',
      label: 'Medical Workspaces',
      icon: CubeIcon,
      medicalCategory: 'clinical',
      children: [
        {
          id: 'imaging_workspace',
          label: 'Medical Imaging',
          icon: EyeIcon,
          iconActive: EyeIconSolid,
          href: '/workspace/medical-imaging',
          badge: { text: '24', color: 'info' },
          isActive: pathname.startsWith('/workspace/medical-imaging')
        },
        {
          id: 'ai_workspace',
          label: 'AI Analysis',
          icon: SparklesIcon,
          iconActive: SparklesIconSolid,
          href: '/workspace/ai-analysis',
          badge: { text: '8', color: 'warning' },
          isActive: pathname.startsWith('/workspace/ai-analysis')
        },
        {
          id: 'collaboration_workspace',
          label: 'Collaboration',
          icon: UserGroupIcon,
          href: '/workspace/collaboration',
          badge: { text: '3', color: 'success' },
          isActive: pathname.startsWith('/workspace/collaboration')
        },
        {
          id: 'performance_workspace',
          label: 'Performance',
          icon: ChartBarIcon,
          href: '/workspace/performance',
          isActive: pathname.startsWith('/workspace/performance')
        },
        {
          id: 'security_workspace',
          label: 'Security',
          icon: ShieldCheckIcon,
          iconActive: ShieldCheckIconSolid,
          href: '/workspace/security',
          isActive: pathname.startsWith('/workspace/security')
        }
      ]
    },

    // Medical Operations
    {
      id: 'medical_operations',
      label: 'Medical Operations',
      icon: HeartIcon,
      iconActive: HeartIconSolid,
      medicalCategory: 'clinical',
      children: [
        {
          id: 'studies',
          label: 'Medical Studies',
          icon: DocumentTextIcon,
          href: '/medical/studies',
          badge: { text: '24', color: 'info' },
          isActive: pathname.startsWith('/medical/studies')
        },
        {
          id: 'patients',
          label: 'Patient Cases',
          icon: UserIcon,
          href: '/medical/patients',
          badge: { text: '12', color: 'success' },
          isActive: pathname.startsWith('/medical/patients')
        },
        {
          id: 'workflow',
          label: 'Clinical Workflow',
          icon: PlayIcon,
          href: '/medical/workflow',
          isActive: pathname.startsWith('/medical/workflow')
        },
        {
          id: 'devices',
          label: 'Medical Devices',
          icon: ComputerDesktopIcon,
          href: '/medical/devices',
          status: 'active',
          isActive: pathname.startsWith('/medical/devices')
        },
        {
          id: 'analytics',
          label: 'Medical Analytics',
          icon: ChartPieIcon,
          href: '/medical/analytics',
          isActive: pathname.startsWith('/medical/analytics')
        }
      ]
    },

    // System Administration (Admin roles only)
    ...(user.role === 'administrator' || user.role === 'super-admin' ? [{
      id: 'system-admin',
      label: 'System Admin',
      icon: ServerIcon,
      href: '/dashboard/admin',
      medicalCategory: 'administrative' as const
    }] : []),

    // Enterprise (Enterprise roles only)
    ...(user.role === 'super-admin' || user.role === 'administrator' ? [{
      id: 'enterprise-admin',
      label: 'Enterprise',
      icon: BuildingOfficeIcon,
      href: '/dashboard/enterprise',
      medicalCategory: 'administrative' as const
    }] : []),

    // Analytics Dashboard
    {
      id: 'analytics_dashboard',
      label: 'Analytics',
      icon: ChartPieIcon,
      href: '/dashboard/analytics',
      medicalCategory: 'administrative' as const,
      isActive: pathname.startsWith('/dashboard/analytics')
    },

    // Compliance & Security
    {
      id: 'compliance_security',
      label: 'Compliance & Security',
      icon: ShieldCheckIcon,
      iconActive: ShieldCheckIconSolid,
      medicalCategory: 'compliance' as const,
      children: [
        {
          id: 'hipaa_compliance',
          label: 'HIPAA Compliance',
          icon: LockClosedIcon,
          iconActive: LockClosedIconSolid,
          href: '/compliance/hipaa',
          status: 'active',
          isActive: pathname.startsWith('/compliance/hipaa')
        },
        {
          id: 'audit_logs',
          label: 'Audit Logs',
          icon: DocumentDuplicateIcon,
          href: '/compliance/audit-logs',
          isActive: pathname.startsWith('/compliance/audit-logs')
        },
        {
          id: 'data_security',
          label: 'Data Security',
          icon: LockClosedIcon,
          href: '/compliance/data-security',
          isActive: pathname.startsWith('/compliance/data-security')
        },
        {
          id: 'risk_management',
          label: 'Risk Management',
          icon: ExclamationTriangleIcon,
          href: '/compliance/risk-management',
          badge: { text: '2', color: 'warning' },
          isActive: pathname.startsWith('/compliance/risk-management')
        }
      ]
    },

    // Support & Training
    {
      id: 'support_training',
      label: 'Support & Training',
      icon: AcademicCapIcon,
      medicalCategory: 'administrative' as const,
      children: [
        {
          id: 'help_center',
          label: 'Help Center',
          icon: LifebuoyIcon,
          href: '/support/help-center',
          isActive: pathname.startsWith('/support/help-center')
        },
        {
          id: 'training_modules',
          label: 'Training Modules',
          icon: BookOpenIcon,
          href: '/support/training',
          isActive: pathname.startsWith('/support/training')
        },
        {
          id: 'contact_support',
          label: 'Contact Support',
          icon: PhoneIcon,
          href: '/support/contact',
          isActive: pathname.startsWith('/support/contact')
        }
      ]
    }
  ];

  // Handle navigation item click
  const handleNavigationClick = (item: NavigationItem) => {
    if (item.href) {
      router.push(item.href);
      
      // Add to recent items
      const newRecent = [item.id, ...recentItems.filter(id => id !== item.id)].slice(0, 5);
      setRecentItems(newRecent);
      localStorage.setItem('medical_nav_recent', JSON.stringify(newRecent));
    }
    
    if (item.onClick) {
      item.onClick();
    }
  };

  // Handle group expansion
  const handleGroupToggle = (groupId: string) => {
    const newExpanded = expandedGroups.includes(groupId)
      ? expandedGroups.filter(id => id !== groupId)
      : [...expandedGroups, groupId];
    
    setExpandedGroups(newExpanded);
    localStorage.setItem('medical_nav_expanded', JSON.stringify(newExpanded));
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (itemId: string) => {
    const newFavorites = favorites.includes(itemId)
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];
    
    setFavorites(newFavorites);
    localStorage.setItem('medical_nav_favorites', JSON.stringify(newFavorites));
  };

  // Filter items based on search
  const filteredItems = navigationItems.filter(item => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const matchesItem = item.label.toLowerCase().includes(query);
    const matchesChildren = item.children?.some(child => 
      child.label.toLowerCase().includes(query)
    );
    
    return matchesItem || matchesChildren;
  });

  // Render navigation item
  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isExpanded = expandedGroups.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isFavorite = favorites.includes(item.id);
    const IconComponent = item.isActive && item.iconActive ? item.iconActive : item.icon;
    
    return (
      <div key={item.id} className="relative">
        <div
          className={`
            flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
            ${level > 0 ? 'ml-4' : ''}
            ${item.isActive 
              ? 'bg-medsight-primary-100 text-medsight-primary-700 border-l-4 border-medsight-primary-500' 
              : 'text-slate-600 hover:bg-medsight-primary-50 hover:text-medsight-primary-600'
            }
            ${item.isEmergency ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : ''}
          `}
          onClick={() => {
            if (hasChildren) {
              handleGroupToggle(item.id);
            } else {
              handleNavigationClick(item);
            }
          }}
        >
          {/* Icon */}
          <IconComponent 
            className={`
              ${collapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'}
              ${item.isActive ? 'text-medsight-primary-600' : 'text-slate-500'}
              ${item.isEmergency ? 'text-red-600' : ''}
            `} 
          />
          
          {/* Label and badges */}
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center">
                <span 
                  className={`
                    font-medium text-sm
                    ${item.isActive ? 'text-medsight-primary-700' : 'text-slate-700'}
                    ${item.isEmergency ? 'text-red-700' : ''}
                  `}
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  {item.label}
                </span>
                
                {/* New badge */}
                {item.isNew && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    New
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Status badge */}
                {item.badge && (
                  <span 
                    className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${item.badge.color === 'success' ? 'bg-green-100 text-green-700' :
                        item.badge.color === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        item.badge.color === 'error' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }
                    `}
                  >
                    {item.badge.text}
                  </span>
                )}
                
                {/* Status indicator */}
                {item.status && (
                  <div 
                    className={`
                      w-2 h-2 rounded-full
                      ${item.status === 'active' ? 'bg-green-500' :
                        item.status === 'warning' ? 'bg-yellow-500' :
                        item.status === 'error' ? 'bg-red-500' :
                        'bg-slate-300'
                      }
                    `}
                  />
                )}
                
                {/* Favorite star */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteToggle(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {isFavorite ? (
                    <StarIconSolid className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <StarIcon className="w-4 h-4 text-slate-400 hover:text-yellow-500" />
                  )}
                </button>
                
                {/* Expand/collapse icon */}
                {hasChildren && (
                  <ChevronRightIcon 
                    className={`
                      w-4 h-4 text-slate-400 transition-transform duration-200
                      ${isExpanded ? 'transform rotate-90' : ''}
                    `}
                  />
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Children */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`
        fixed left-0 top-0 h-full z-40 transition-all duration-300
        ${collapsed ? 'w-20' : 'w-80'}
        medsight-glass backdrop-blur-lg border-r border-white/20
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-medsight-primary-500 rounded-xl flex items-center justify-center">
                <HeartIconSolid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 
                  className="text-lg font-bold text-medsight-primary-700"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  MedSight Pro
                </h1>
                <p 
                  className="text-xs text-slate-500"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  Medical Platform
                </p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => onToggleCollapse(!collapsed)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {collapsed ? (
              <ChevronRightIcon className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Search (when expanded) */}
      {!collapsed && (
        <div className="p-4 border-b border-white/20">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-medsight-primary-500 focus:border-transparent"
              style={{ 
                fontFamily: 'var(--font-primary)',
                letterSpacing: '0.01em'
              }}
            />
          </div>
        </div>
      )}

      {/* Medical Status Summary (when expanded) */}
      {!collapsed && (
        <div className="p-4 border-b border-white/20">
          <h3 
            className="text-sm font-semibold text-slate-700 mb-3"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            Medical Status
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {medicalStatus.map(status => (
              <div 
                key={status.id}
                className={`
                  p-2 rounded-lg border
                  ${status.status === 'critical' ? 'bg-red-50 border-red-200' :
                    status.status === 'abnormal' ? 'bg-yellow-50 border-yellow-200' :
                    status.status === 'pending' ? 'bg-blue-50 border-blue-200' :
                    'bg-green-50 border-green-200'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className={`
                      w-2 h-2 rounded-full
                      ${status.status === 'critical' ? 'bg-red-500' :
                        status.status === 'abnormal' ? 'bg-yellow-500' :
                        status.status === 'pending' ? 'bg-blue-500' :
                        'bg-green-500'
                      }
                    `}
                  />
                  <span 
                    className={`
                      text-xs font-medium
                      ${status.status === 'critical' ? 'text-red-700' :
                        status.status === 'abnormal' ? 'text-yellow-700' :
                        status.status === 'pending' ? 'text-blue-700' :
                        'text-green-700'
                      }
                    `}
                  >
                    {status.count}
                  </span>
                </div>
                <p 
                  className={`
                    text-xs mt-1
                    ${status.status === 'critical' ? 'text-red-600' :
                      status.status === 'abnormal' ? 'text-yellow-600' :
                      status.status === 'pending' ? 'text-blue-600' :
                      'text-green-600'
                    }
                  `}
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  {status.id === 'active_cases' ? 'Active' :
                   status.id === 'pending_reviews' ? 'Pending' :
                   status.id === 'critical_findings' ? 'Critical' :
                   'System'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions (when expanded) */}
      {!collapsed && (
        <div className="p-4 border-b border-white/20">
          <h3 
            className="text-sm font-semibold text-slate-700 mb-3"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={action.onClick}
                disabled={!action.enabled}
                className={`
                  p-3 rounded-lg border text-left transition-all duration-200
                  ${action.enabled 
                    ? 'hover:bg-white/50 border-white/20 text-slate-700' 
                    : 'opacity-50 cursor-not-allowed border-white/10 text-slate-400'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span 
                    className="text-xs font-medium"
                    style={{ 
                      fontFamily: 'var(--font-primary)',
                      letterSpacing: '0.01em'
                    }}
                  >
                    {action.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredItems.map(item => renderNavigationItem(item))}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-medsight-primary-500 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          
          {!collapsed && (
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
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
                    {user.medicalLicense}
                  </p>
                </div>
                
                <button
                  onClick={() => router.push('/logout')}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compliance Status */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center space-x-2">
          <CheckCircleIconSolid className="w-4 h-4 text-green-500" />
          
          {!collapsed && (
            <div>
              <p 
                className="text-xs font-medium text-green-700"
                style={{ 
                  fontFamily: 'var(--font-primary)',
                  letterSpacing: '0.01em'
                }}
              >
                HIPAA Compliant
              </p>
              <p 
                className="text-xs text-slate-500"
                style={{ 
                  fontFamily: 'var(--font-primary)',
                  letterSpacing: '0.01em'
                }}
              >
                All systems secure
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 