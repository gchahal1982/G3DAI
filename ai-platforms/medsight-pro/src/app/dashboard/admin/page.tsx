'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheckIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon,
  CogIcon,
  ServerIcon,
  CircleStackIcon as DatabaseIcon,
  WifiIcon,
  BellIcon,
  LockClosedIcon,
  KeyIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowRightIcon,
  SparklesIcon,
  HomeIcon,
  BuildingOfficeIcon,
  UserIcon,
  HeartIcon,
  ComputerDesktopIcon,
  CloudIcon,
  BoltIcon,
  FireIcon
} from '@heroicons/react/24/outline';

import type { MedicalUser, MedicalRole } from '@/types/medical-user';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MedicalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'users' | 'system' | 'security' | 'compliance'>('overview');

  // Mock admin data
  const adminData = {
    systemHealth: {
      overall: 'healthy' as const,
      services: {
        dicom: 'online' as const,
        ai: 'online' as const,
        database: 'online' as const,
        pacs: 'online' as const,
        auth: 'online' as const,
        storage: 'online' as const
      },
      performance: {
        cpu: 68,
        memory: 74,
        storage: 82,
        network: 91
      },
      uptime: '99.9%',
      lastIncident: '15 days ago'
    },
    userStats: {
      totalUsers: 247,
      activeUsers: 189,
      newUsers: 12,
      pendingApprovals: 3,
      onlineUsers: 45,
      usersByRole: {
        radiologist: 89,
        technician: 67,
        admin: 8,
        nurse: 45,
        physician: 38
      }
    },
    securityMetrics: {
      threatsBlocked: 23,
      loginAttempts: 1547,
      failedLogins: 12,
      suspiciousActivity: 2,
      lastSecurityScan: '2 hours ago',
      complianceScore: 98.5
    },
    compliance: {
      hipaa: true,
      dicom: true,
      fda: true,
      hl7: true,
      lastAudit: new Date(2024, 0, 15),
      nextAudit: new Date(2024, 11, 15),
      issues: 0,
      certifications: ['SOC2', 'ISO 27001', 'HITECH']
    },
    user: {
      id: 'admin-001',
      name: 'Dr. Sarah Administrator',
      email: 'admin@medsight.pro',
      role: 'system-admin' as MedicalRole,
      licenseNumber: 'MD123456',
      licenseState: 'CA',
      medicalFacility: 'MedSight Pro Hospital',
      specialty: 'Administration',
      isVerified: true,
      lastLogin: new Date(),
      complianceStatus: 'compliant' as const,
      permissions: [],
      preferences: {
        theme: 'dark' as const,
        notifications: true,
        workspace: {
          layout: 'grid' as const,
          density: 'comfortable' as const
        },
        accessibility: {
          highContrast: false,
          fontSize: 'medium' as const,
          screenReader: false,
          reducedMotion: false,
          keyboardNavigation: true
        }
      }
    }
  };

  // Mock user data
  const mockUser: MedicalUser = {
    id: 'admin-001',
    email: 'admin@medsight.pro',
    firstName: 'Dr. Sarah',
    lastName: 'Administrator',
    role: 'system-admin' as MedicalRole,
    credentials: {
      medicalLicense: 'MD123456',
      licenseState: 'CA',
      npi: '1234567890',
      boardCertifications: ['Internal Medicine'],
      medicalSchool: 'Harvard Medical School',
      graduationYear: 2010,
      specializations: ['Administration']
    },
    affiliations: [],
    permissions: [],
    mfaEnabled: true,
    emergencyAccess: true,
    sessionTimeout: 15 * 60 * 1000,
    maxSessions: 3,
    currentSessions: 1,
    hipaaCompliance: true,
    preferences: {
      theme: 'dark' as const,
      language: 'en',
      timezone: 'America/New_York',
      notifications: {
        email: true,
        sms: false,
        push: true,
        emergencyAlerts: true,
        aiAlerts: true,
        reportAlerts: true,
        systemAlerts: true
      },
      workspace: {
        defaultWorkspace: '/dashboard/admin',
        hangingProtocols: [],
        windowLevelPresets: [],
        annotationDefaults: {
          defaultTool: 'arrow',
          defaultColor: '#FF0000',
          defaultFontSize: 14,
          showMeasurements: true
        },
        layout: 'grid' as const,
        density: 'comfortable' as const
      },
      accessibility: {
        highContrast: false,
        fontSize: 'medium' as const,
        screenReader: false,
        reducedMotion: false,
        keyboardNavigation: true
      }
    },
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: new Date(),
    loginAttempts: 0
  };

  // Initialize dashboard
  useEffect(() => {
    initializeAdminDashboard();
  }, []);

  const initializeAdminDashboard = async () => {
    try {
      setLoading(true);
      
      // Mock admin user
      const adminUser: MedicalUser = {
        id: 'admin_001',
        firstName: 'Alex',
        lastName: 'Rodriguez',
        email: 'alex.rodriguez@hospital.com',
        role: 'system-admin' as MedicalRole,
        credentials: {
          medicalLicense: 'ADM123456',
          licenseState: 'CA',
          npi: '1234567890',
          boardCertifications: ['System Administration'],
          medicalSchool: 'MIT',
          graduationYear: 2010,
          specializations: ['System Administration']
        },
        affiliations: [],
        permissions: [],
        mfaEnabled: true,
        emergencyAccess: true,
        sessionTimeout: 15 * 60 * 1000,
        maxSessions: 3,
        currentSessions: 1,
        hipaaCompliance: true,
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        loginAttempts: 0,
        preferences: {
          theme: 'dark' as const,
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            sms: true,
            push: true,
            emergencyAlerts: true,
            aiAlerts: true,
            reportAlerts: true,
            systemAlerts: true
          },
          workspace: {
            defaultWorkspace: '/dashboard/admin',
            hangingProtocols: [],
            windowLevelPresets: [],
            annotationDefaults: {
              defaultTool: 'arrow',
              defaultColor: '#FF0000',
              defaultFontSize: 14,
              showMeasurements: true
            },
            density: 'compact' as const
          },
          accessibility: {
            highContrast: false,
            fontSize: 'large' as const,
            screenReader: false,
            reducedMotion: false,
            keyboardNavigation: false
          }
        }
      };

      setUser(adminUser);
      console.log('🔧 Admin dashboard initialized for:', `${adminUser.firstName} ${adminUser.lastName}`);
    } catch (error) {
      console.error('Admin dashboard initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="medsight-glass p-8 rounded-2xl text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 
            className="text-xl font-semibold text-blue-300 mb-2"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em',
              lineHeight: '1.6'
            }}
          >
            Loading Admin Dashboard
          </h2>
          <p 
            className="text-white/70"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            Initializing system controls...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Admin Dashboard Header */}
      <div className="bg-gradient-to-r from-slate-800 to-blue-900 text-white p-6 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-3xl font-bold mb-2"
                style={{ 
                  fontFamily: 'var(--font-primary)',
                  letterSpacing: '0.01em',
                  lineHeight: '1.3'
                }}
              >
                Admin Dashboard
              </h1>
              <p 
                className="text-blue-200"
                style={{ 
                  fontFamily: 'var(--font-primary)',
                  letterSpacing: '0.01em'
                }}
              >
                System Administration & Management - {user.firstName} {user.lastName}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* System Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  adminData.systemHealth.overall === 'healthy' ? 'bg-green-400 animate-pulse' : 
                  adminData.systemHealth.overall === 'warning' ? 'bg-yellow-400' : 
                  'bg-red-400'
                }`}></div>
                <span className="text-sm font-medium">System {adminData.systemHealth.overall}</span>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'users', label: 'Users', icon: UserGroupIcon },
            { id: 'system', label: 'System', icon: ServerIcon },
            { id: 'security', label: 'Security', icon: ShieldCheckIcon },
            { id: 'compliance', label: 'Compliance', icon: DocumentTextIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/70 text-slate-700 hover:bg-white/90'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Dashboard */}
        {selectedView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Health Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* System Health Overview */}
              <div className="medsight-glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-800">System Health</h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">All Systems Operational</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(adminData.systemHealth.services).map(([service, status]) => (
                    <div key={service} className="p-4 bg-white/50 rounded-lg border border-white/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 capitalize">
                          {service === 'pacs' ? 'PACS' : service}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          status === 'online' ? 'bg-green-500' :
                          status === 'maintenance' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                      </div>
                      <span className={`text-xs font-medium capitalize ${
                        status === 'online' ? 'text-green-600' :
                        status === 'maintenance' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(adminData.systemHealth.performance).map(([metric, value]) => (
                    <div key={metric} className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-slate-200"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - value / 100)}`}
                            className={`transition-all duration-500 ${
                              value > 80 ? 'text-red-500' :
                              value > 60 ? 'text-yellow-500' :
                              'text-green-500'
                            }`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-slate-700">{value}%</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-600 capitalize">{metric}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="medsight-glass rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">User Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Total Users</span>
                      <span className="text-lg font-bold text-blue-600">{adminData.userStats.totalUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Active Users</span>
                      <span className="text-lg font-bold text-green-600">{adminData.userStats.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Online Now</span>
                      <span className="text-lg font-bold text-purple-600">{adminData.userStats.onlineUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Pending Approvals</span>
                      <span className="text-lg font-bold text-amber-600">{adminData.userStats.pendingApprovals}</span>
                    </div>
                  </div>
                </div>

                <div className="medsight-glass rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Security Overview</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Threats Blocked</span>
                      <span className="text-lg font-bold text-red-600">{adminData.securityMetrics.threatsBlocked}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Failed Logins</span>
                      <span className="text-lg font-bold text-yellow-600">{adminData.securityMetrics.failedLogins}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Compliance Score</span>
                      <span className="text-lg font-bold text-green-600">{adminData.securityMetrics.complianceScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Last Scan</span>
                      <span className="text-sm font-medium text-slate-700">{adminData.securityMetrics.lastSecurityScan}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* System Alerts */}
              <div className="medsight-glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">System Alerts</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-800">System Backup Complete</p>
                      <p className="text-xs text-green-600">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">High Storage Usage</p>
                      <p className="text-xs text-yellow-600">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <SparklesIcon className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">AI Model Updated</p>
                      <p className="text-xs text-blue-600">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Status */}
              <div className="medsight-glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Compliance Status</h3>
                <div className="space-y-3">
                  {[
                    { key: 'hipaa', label: 'HIPAA', status: adminData.compliance.hipaa },
                    { key: 'dicom', label: 'DICOM', status: adminData.compliance.dicom },
                    { key: 'fda', label: 'FDA Class II', status: adminData.compliance.fda },
                    { key: 'hl7', label: 'HL7 FHIR', status: adminData.compliance.hl7 }
                  ].map(({ key, label, status }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{label}</span>
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium text-green-600">Compliant</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="medsight-glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    System Backup
                  </button>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                    Security Scan
                  </button>
                  <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                    Generate Report
                  </button>
                  <button className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
                    Maintenance Mode
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other views would be implemented here */}
        {selectedView !== 'overview' && (
          <div className="medsight-glass rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Dashboard
            </h2>
            <p className="text-slate-600 mb-6">
              Advanced {selectedView} management interface coming soon.
            </p>
            <button 
              onClick={() => setSelectedView('overview')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Return to Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 