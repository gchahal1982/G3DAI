'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  BookOpenIcon,
  AcademicCapIcon,
  BellIcon,
  EyeIcon,
  LockClosedIcon,
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
  WifiIcon,
  SignalIcon,
  CloudIcon,
  ArrowTopRightOnSquareIcon,
  LinkIcon,
  ShareIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  FolderIcon,
  ArchiveBoxIcon,
  TagIcon,
  StarIcon,
  FireIcon,
  SparklesIcon,
  BoltIcon,
  RocketLaunchIcon,
  TrophyIcon,
  GiftIcon,
  MegaphoneIcon,
  NewspaperIcon,
  RadioIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
  CameraIcon,
  PhotoIcon,
  FilmIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerXMarkIcon,
  MusicalNoteIcon,
  QueueListIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ListBulletIcon,
  NumberedListIcon,
  HashtagIcon,
  AtSymbolIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  EqualsIcon,
  DivideIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  CalculatorIcon,
  ScaleIcon,
  ClipboardIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  DocumentIcon,
  DocumentDuplicateIcon,
  DocumentPlusIcon,
  DocumentMinusIcon,
  DocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  DocumentTextIcon as DocumentTextIconOutline,
  DocumentChartBarIcon,
  PresentationChartBarIcon,
  PresentationChartLineIcon,
  ChartPieIcon,
  ChartBarIcon as ChartBarIconOutline,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassCircleIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  AdjustmentsVerticalIcon,
  PaintBrushIcon,
  SwatchIcon,
  PencilIcon,
  PencilSquareIcon,
  BeakerIcon,
  EyeDropperIcon,
  HeartIcon as HeartIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  LockClosedIcon as LockClosedIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
  BellIcon as BellIconSolid,
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid,
  SparklesIcon as SparklesIconSolid,
  BoltIcon as BoltIconSolid
} from '@heroicons/react/24/outline';
import type { MedicalUser } from '@/types/medical-user';
import { medicalSessionManager } from '@/lib/auth/session-management';

// Footer props
interface DashboardFooterProps {
  user: MedicalUser;
  className?: string;
  showSystemStatus?: boolean;
  showComplianceInfo?: boolean;
  showQuickLinks?: boolean;
  showSessionInfo?: boolean;
  showBuildInfo?: boolean;
}

// System status interface
interface SystemStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance' | 'warning' | 'error';
  uptime: string;
  performance: number;
  lastCheck: Date;
  message?: string;
}

// Compliance indicator interface
interface ComplianceIndicator {
  id: string;
  name: string;
  status: 'compliant' | 'warning' | 'non-compliant' | 'pending';
  lastAudit: Date;
  expiryDate?: Date;
  description: string;
  icon: React.ComponentType<any>;
}

// Quick link interface
interface QuickLink {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  category: 'support' | 'documentation' | 'compliance' | 'system' | 'social';
  external?: boolean;
}

// Build info interface
interface BuildInfo {
  version: string;
  buildNumber: string;
  buildDate: Date;
  environment: 'development' | 'staging' | 'production';
  branch?: string;
  commit?: string;
}

// Session info interface
interface SessionInfo {
  id: string;
  startTime: Date;
  lastActivity: Date;
  location: {
    hospital: string;
    department: string;
    workstation: string;
  };
  emergencyAccess: boolean;
  extendedSession: boolean;
  remainingTime: number;
  totalSessions: number;
}

export function DashboardFooter({
  user,
  className = '',
  showSystemStatus = true,
  showComplianceInfo = true,
  showQuickLinks = true,
  showSessionInfo = true,
  showBuildInfo = true
}: DashboardFooterProps) {
  const router = useRouter();
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [complianceIndicators, setComplianceIndicators] = useState<ComplianceIndicator[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Initialize footer
  useEffect(() => {
    loadSystemStatus();
    loadComplianceIndicators();
    loadQuickLinks();
    loadSessionInfo();
    loadBuildInfo();

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  // Load system status
  const loadSystemStatus = () => {
    const mockStatus: SystemStatus[] = [
      {
        id: 'dicom_server',
        name: 'DICOM Server',
        status: 'online',
        uptime: '99.9%',
        performance: 95,
        lastCheck: new Date(),
        message: 'All DICOM services operational'
      },
      {
        id: 'ai_engine',
        name: 'AI Engine',
        status: 'online',
        uptime: '99.8%',
        performance: 92,
        lastCheck: new Date(),
        message: 'AI processing running normally'
      },
      {
        id: 'medical_database',
        name: 'Medical Database',
        status: 'online',
        uptime: '99.95%',
        performance: 98,
        lastCheck: new Date(),
        message: 'Database performance optimal'
      },
      {
        id: 'backup_system',
        name: 'Backup System',
        status: 'warning',
        uptime: '98.5%',
        performance: 85,
        lastCheck: new Date(),
        message: 'Backup schedule running behind'
      },
      {
        id: 'integration_services',
        name: 'Integration Services',
        status: 'online',
        uptime: '99.7%',
        performance: 94,
        lastCheck: new Date(),
        message: 'All integrations active'
      }
    ];

    setSystemStatus(mockStatus);
  };

  // Load compliance indicators
  const loadComplianceIndicators = () => {
    const mockCompliance: ComplianceIndicator[] = [
      {
        id: 'hipaa',
        name: 'HIPAA Compliance',
        status: 'compliant',
        lastAudit: new Date(2024, 0, 15),
        expiryDate: new Date(2024, 11, 31),
        description: 'All HIPAA requirements met',
        icon: ShieldCheckIconSolid
      },
      {
        id: 'dicom',
        name: 'DICOM Conformance',
        status: 'compliant',
        lastAudit: new Date(2024, 0, 10),
        expiryDate: new Date(2024, 11, 31),
        description: 'DICOM conformance statement current',
        icon: DocumentTextIcon
      },
      {
        id: 'fda',
        name: 'FDA Class II',
        status: 'compliant',
        lastAudit: new Date(2024, 0, 5),
        expiryDate: new Date(2024, 11, 31),
        description: 'FDA medical device compliance',
        icon: HeartIconSolid
      },
      {
        id: 'hl7_fhir',
        name: 'HL7 FHIR',
        status: 'compliant',
        lastAudit: new Date(2024, 0, 20),
        expiryDate: new Date(2024, 11, 31),
        description: 'HL7 FHIR R4 compliance',
        icon: ShareIcon
      },
      {
        id: 'iso_27001',
        name: 'ISO 27001',
        status: 'compliant',
        lastAudit: new Date(2024, 0, 12),
        expiryDate: new Date(2024, 11, 31),
        description: 'Information security management',
        icon: LockClosedIconSolid
      },
      {
        id: 'sox_compliance',
        name: 'SOX Compliance',
        status: 'compliant',
        lastAudit: new Date(2024, 0, 8),
        expiryDate: new Date(2024, 11, 31),
        description: 'Sarbanes-Oxley compliance',
        icon: DocumentCheckIcon
      }
    ];

    setComplianceIndicators(mockCompliance);
  };

  // Load quick links
  const loadQuickLinks = () => {
    const mockQuickLinks: QuickLink[] = [
      // Support Links
      {
        id: 'help_center',
        label: 'Help Center',
        href: '/support/help-center',
        icon: QuestionMarkCircleIcon,
        category: 'support'
      },
      {
        id: 'contact_support',
        label: 'Contact Support',
        href: '/support/contact',
        icon: PhoneIcon,
        category: 'support'
      },
      {
        id: 'live_chat',
        label: 'Live Chat',
        href: '/support/chat',
        icon: ChatBubbleLeftRightIcon,
        category: 'support'
      },
      {
        id: 'emergency_support',
        label: 'Emergency Support',
        href: '/support/emergency',
        icon: HeartIconSolid,
        category: 'support'
      },

      // Documentation Links
      {
        id: 'user_guide',
        label: 'User Guide',
        href: '/docs/user-guide',
        icon: BookOpenIcon,
        category: 'documentation'
      },
      {
        id: 'api_docs',
        label: 'API Documentation',
        href: '/docs/api',
        icon: DocumentTextIcon,
        category: 'documentation'
      },
      {
        id: 'training_materials',
        label: 'Training Materials',
        href: '/support/training',
        icon: AcademicCapIcon,
        category: 'documentation'
      },
      {
        id: 'video_tutorials',
        label: 'Video Tutorials',
        href: '/support/tutorials',
        icon: VideoCameraIcon,
        category: 'documentation'
      },

      // Compliance Links
      {
        id: 'hipaa_policy',
        label: 'HIPAA Policy',
        href: '/compliance/hipaa',
        icon: ShieldCheckIcon,
        category: 'compliance'
      },
      {
        id: 'privacy_policy',
        label: 'Privacy Policy',
        href: '/legal/privacy',
        icon: LockClosedIcon,
        category: 'compliance'
      },
      {
        id: 'terms_of_service',
        label: 'Terms of Service',
        href: '/legal/terms',
        icon: DocumentIcon,
        category: 'compliance'
      },
      {
        id: 'audit_logs',
        label: 'Audit Logs',
        href: '/compliance/audit-logs',
        icon: DocumentDuplicateIcon,
        category: 'compliance'
      },

      // System Links
      {
        id: 'system_status',
        label: 'System Status',
        href: '/status',
        icon: ServerIcon,
        category: 'system',
        external: true
      },
      {
        id: 'service_updates',
        label: 'Service Updates',
        href: '/updates',
        icon: BellIcon,
        category: 'system'
      },
      {
        id: 'maintenance_schedule',
        label: 'Maintenance Schedule',
        href: '/maintenance',
        icon: ClockIcon,
        category: 'system'
      },
      {
        id: 'performance_metrics',
        label: 'Performance Metrics',
        href: '/metrics',
        icon: ChartBarIcon,
        category: 'system'
      },

      // Social Links
      {
        id: 'community',
        label: 'Community Forum',
        href: 'https://community.medsight.pro',
        icon: UserGroupIcon,
        category: 'social',
        external: true
      },
      {
        id: 'blog',
        label: 'Blog',
        href: 'https://blog.medsight.pro',
        icon: NewspaperIcon,
        category: 'social',
        external: true
      },
      {
        id: 'twitter',
        label: 'Twitter',
        href: 'https://twitter.com/medsightpro',
        icon: ShareIcon,
        category: 'social',
        external: true
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        href: 'https://linkedin.com/company/medsight-pro',
        icon: LinkIcon,
        category: 'social',
        external: true
      }
    ];

    setQuickLinks(mockQuickLinks);
  };

  // Load session info
  const loadSessionInfo = async () => {
    try {
      const session = await medicalSessionManager.getCurrentSession();
      if (session) {
        const mockSessionInfo: SessionInfo = {
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
          remainingTime: new Date(session.expiresAt).getTime() - Date.now(),
          totalSessions: 1
        };

        setSessionInfo(mockSessionInfo);
      }
    } catch (error) {
      console.error('Error loading session info:', error);
    }
  };

  // Load build info
  const loadBuildInfo = () => {
    const mockBuildInfo: BuildInfo = {
      version: '2.1.0',
      buildNumber: '2024.01.15.001',
      buildDate: new Date(2024, 0, 15),
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      branch: 'main',
      commit: 'a1b2c3d4'
    };

    setBuildInfo(mockBuildInfo);
  };

  // Handle quick link click
  const handleQuickLinkClick = (link: QuickLink) => {
    if (link.external) {
      window.open(link.href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(link.href);
    }
  };

  // Handle section toggle
  const handleSectionToggle = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Format duration
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  // Get overall system health
  const getSystemHealth = (): { status: string; color: string; icon: React.ComponentType<any> } => {
    const criticalSystems = systemStatus.filter(s => s.status === 'error');
    const warningSystems = systemStatus.filter(s => s.status === 'warning');
    const offlineSystems = systemStatus.filter(s => s.status === 'offline');

    if (criticalSystems.length > 0 || offlineSystems.length > 0) {
      return { status: 'Critical', color: 'text-red-600', icon: ExclamationTriangleIconSolid };
    }
    if (warningSystems.length > 0) {
      return { status: 'Warning', color: 'text-yellow-600', icon: ExclamationTriangleIcon };
    }
    return { status: 'Healthy', color: 'text-green-600', icon: CheckCircleIconSolid };
  };

  // Get compliance status
  const getComplianceStatus = (): { compliant: number; total: number; color: string } => {
    const compliantCount = complianceIndicators.filter(c => c.status === 'compliant').length;
    const total = complianceIndicators.length;
    const percentage = (compliantCount / total) * 100;

    return {
      compliant: compliantCount,
      total,
      color: percentage >= 100 ? 'text-green-600' : percentage >= 80 ? 'text-yellow-600' : 'text-red-600'
    };
  };

  const systemHealth = getSystemHealth();
  const complianceStatus = getComplianceStatus();

  return (
    <footer 
      className={`
        mt-auto border-t border-white/20 backdrop-blur-lg
        medsight-glass
        ${className}
      `}
    >
      {/* Main Footer Content */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* System Status Section */}
          {showSystemStatus && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 
                  className="text-sm font-semibold text-slate-700"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  System Status
                </h3>
                <button
                  onClick={() => handleSectionToggle('system')}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  {expandedSection === 'system' ? 'Hide' : 'Show'}
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <systemHealth.icon className={`w-4 h-4 ${systemHealth.color}`} />
                <span 
                  className={`text-sm font-medium ${systemHealth.color}`}
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  {systemHealth.status}
                </span>
              </div>

              {expandedSection === 'system' && (
                <div className="space-y-2">
                  {systemStatus.map(system => (
                    <div key={system.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className={`
                            w-2 h-2 rounded-full
                            ${system.status === 'online' ? 'bg-green-500' :
                              system.status === 'warning' ? 'bg-yellow-500' :
                              system.status === 'maintenance' ? 'bg-blue-500' :
                              'bg-red-500'
                            }
                          `}
                        />
                        <span 
                          className="text-xs text-slate-600"
                          style={{ 
                            fontFamily: 'var(--font-primary)',
                            letterSpacing: '0.01em'
                          }}
                        >
                          {system.name}
                        </span>
                      </div>
                      <span 
                        className="text-xs text-slate-500"
                        style={{ 
                          fontFamily: 'var(--font-primary)',
                          letterSpacing: '0.01em'
                        }}
                      >
                        {system.uptime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Compliance Section */}
          {showComplianceInfo && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 
                  className="text-sm font-semibold text-slate-700"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  Compliance
                </h3>
                <button
                  onClick={() => handleSectionToggle('compliance')}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  {expandedSection === 'compliance' ? 'Hide' : 'Show'}
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <ShieldCheckIconSolid className={`w-4 h-4 ${complianceStatus.color}`} />
                <span 
                  className={`text-sm font-medium ${complianceStatus.color}`}
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  {complianceStatus.compliant}/{complianceStatus.total} Compliant
                </span>
              </div>

              {expandedSection === 'compliance' && (
                <div className="space-y-2">
                  {complianceIndicators.map(indicator => (
                    <div key={indicator.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <indicator.icon 
                          className={`
                            w-3 h-3
                            ${indicator.status === 'compliant' ? 'text-green-500' :
                              indicator.status === 'warning' ? 'text-yellow-500' :
                              indicator.status === 'pending' ? 'text-blue-500' :
                              'text-red-500'
                            }
                          `}
                        />
                        <span 
                          className="text-xs text-slate-600"
                          style={{ 
                            fontFamily: 'var(--font-primary)',
                            letterSpacing: '0.01em'
                          }}
                        >
                          {indicator.name}
                        </span>
                      </div>
                      <span 
                        className={`
                          text-xs font-medium
                          ${indicator.status === 'compliant' ? 'text-green-600' :
                            indicator.status === 'warning' ? 'text-yellow-600' :
                            indicator.status === 'pending' ? 'text-blue-600' :
                            'text-red-600'
                          }
                        `}
                        style={{ 
                          fontFamily: 'var(--font-primary)',
                          letterSpacing: '0.01em'
                        }}
                      >
                        {indicator.status === 'compliant' ? '✓' :
                         indicator.status === 'warning' ? '⚠' :
                         indicator.status === 'pending' ? '⏳' :
                         '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Links Section */}
          {showQuickLinks && (
            <div className="space-y-3">
              <h3 
                className="text-sm font-semibold text-slate-700"
                style={{ 
                  fontFamily: 'var(--font-primary)',
                  letterSpacing: '0.01em'
                }}
              >
                Quick Links
              </h3>
              
              <div className="space-y-2">
                {quickLinks.slice(0, 6).map(link => (
                  <button
                    key={link.id}
                    onClick={() => handleQuickLinkClick(link)}
                    className="flex items-center space-x-2 text-xs text-slate-600 hover:text-medsight-primary-600 transition-colors"
                  >
                    <link.icon className="w-3 h-3" />
                    <span 
                      style={{ 
                        fontFamily: 'var(--font-primary)',
                        letterSpacing: '0.01em'
                      }}
                    >
                      {link.label}
                    </span>
                    {link.external && (
                      <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleSectionToggle('links')}
                className="text-xs text-medsight-primary-600 hover:text-medsight-primary-700 font-medium"
              >
                {expandedSection === 'links' ? 'Show Less' : 'Show More'}
              </button>

              {expandedSection === 'links' && (
                <div className="space-y-2 pt-2 border-t border-white/20">
                  {quickLinks.slice(6).map(link => (
                    <button
                      key={link.id}
                      onClick={() => handleQuickLinkClick(link)}
                      className="flex items-center space-x-2 text-xs text-slate-600 hover:text-medsight-primary-600 transition-colors"
                    >
                      <link.icon className="w-3 h-3" />
                      <span 
                        style={{ 
                          fontFamily: 'var(--font-primary)',
                          letterSpacing: '0.01em'
                        }}
                      >
                        {link.label}
                      </span>
                      {link.external && (
                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Session & Build Info Section */}
          <div className="space-y-3">
            {/* Session Info */}
            {showSessionInfo && sessionInfo && (
              <div>
                <h3 
                  className="text-sm font-semibold text-slate-700 mb-2"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  Session Info
                </h3>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-3 h-3 text-slate-500" />
                    <span 
                      className="text-xs text-slate-600"
                      style={{ 
                        fontFamily: 'var(--font-primary)',
                        letterSpacing: '0.01em'
                      }}
                    >
                      {formatDuration(Date.now() - sessionInfo.startTime.getTime())}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-3 h-3 text-slate-500" />
                    <span 
                      className="text-xs text-slate-600"
                      style={{ 
                        fontFamily: 'var(--font-primary)',
                        letterSpacing: '0.01em'
                      }}
                    >
                      {sessionInfo.location.hospital}
                    </span>
                  </div>
                  {sessionInfo.emergencyAccess && (
                    <div className="flex items-center space-x-2">
                      <HeartIconSolid className="w-3 h-3 text-red-500" />
                      <span 
                        className="text-xs text-red-600 font-medium"
                        style={{ 
                          fontFamily: 'var(--font-primary)',
                          letterSpacing: '0.01em'
                        }}
                      >
                        Emergency Access
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Build Info */}
            {showBuildInfo && buildInfo && (
              <div>
                <h3 
                  className="text-sm font-semibold text-slate-700 mb-2"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  Build Info
                </h3>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <TagIcon className="w-3 h-3 text-slate-500" />
                    <span 
                      className="text-xs text-slate-600"
                      style={{ 
                        fontFamily: 'var(--font-primary)',
                        letterSpacing: '0.01em'
                      }}
                    >
                      v{buildInfo.version}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CogIcon className="w-3 h-3 text-slate-500" />
                    <span 
                      className="text-xs text-slate-600"
                      style={{ 
                        fontFamily: 'var(--font-primary)',
                        letterSpacing: '0.01em'
                      }}
                    >
                      {buildInfo.environment}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-3 h-3 text-slate-500" />
                    <span 
                      className="text-xs text-slate-600"
                      style={{ 
                        fontFamily: 'var(--font-primary)',
                        letterSpacing: '0.01em'
                      }}
                    >
                      {buildInfo.buildDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-white/20 px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
          {/* Copyright */}
          <div className="flex items-center space-x-4">
            <p 
              className="text-xs text-slate-500"
              style={{ 
                fontFamily: 'var(--font-primary)',
                letterSpacing: '0.01em'
              }}
            >
              © 2024 MedSight Pro. All rights reserved.
            </p>
            <div className="flex items-center space-x-2">
              <ShieldCheckIconSolid className="w-4 h-4 text-green-500" />
              <span 
                className="text-xs text-green-600 font-medium"
                style={{ 
                  fontFamily: 'var(--font-primary)',
                  letterSpacing: '0.01em'
                }}
              >
                HIPAA Compliant
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <HeartIconSolid className="w-4 h-4 text-red-500" />
              <span 
                className="text-xs text-red-600 font-medium"
                style={{ 
                  fontFamily: 'var(--font-primary)',
                  letterSpacing: '0.01em'
                }}
              >
                FDA Class II
              </span>
            </div>
          </div>

          {/* Status Summary */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span 
                className="text-xs text-slate-600"
                style={{ 
                  fontFamily: 'var(--font-primary)',
                  letterSpacing: '0.01em'
                }}
              >
                All Systems Operational
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <WifiIcon className="w-4 h-4 text-green-500" />
              <span 
                className="text-xs text-slate-600"
                style={{ 
                  fontFamily: 'var(--font-primary)',
                  letterSpacing: '0.01em'
                }}
              >
                Connected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-slate-500" />
              <span 
                className="text-xs text-slate-600"
                style={{ 
                  fontFamily: 'var(--font-primary)',
                  letterSpacing: '0.01em'
                }}
              >
                {currentTime.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 