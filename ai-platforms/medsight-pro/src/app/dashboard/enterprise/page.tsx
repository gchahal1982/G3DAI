'use client';

import React, { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon, UsersIcon, ChartBarIcon, ShieldCheckIcon,
  GlobeAltIcon, CpuChipIcon, CloudIcon, BanknotesIcon,
  CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon,
  InformationCircleIcon, Cog6ToothIcon, UserGroupIcon,
  DocumentTextIcon, HeartIcon, AcademicCapIcon, BeakerIcon,
  ServerIcon, CircleStackIcon as DatabaseIcon, LockClosedIcon, KeyIcon,
  ChartPieIcon, PresentationChartLineIcon, MapIcon,
  ClockIcon, BellIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  PlayIcon, PauseIcon, StopIcon, ArrowPathIcon,
  EyeIcon, HandRaisedIcon, CubeIcon, SparklesIcon,
  FireIcon, BoltIcon, SignalIcon, WifiIcon,
  PhotoIcon, VideoCameraIcon, MicrophoneIcon, SpeakerWaveIcon,
  TagIcon, StarIcon, HomeIcon, BuildingStorefrontIcon,
  UserPlusIcon, UserMinusIcon, UserIcon, DevicePhoneMobileIcon,
  ComputerDesktopIcon, DeviceTabletIcon, WindowIcon,
  CircleStackIcon, RectangleStackIcon, SquaresPlusIcon,
  Square3Stack3DIcon, QueueListIcon, ListBulletIcon,
  TableCellsIcon, RectangleGroupIcon, ViewColumnsIcon
} from '@heroicons/react/24/outline';

interface Organization {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'research' | 'university' | 'enterprise';
  status: 'active' | 'suspended' | 'trial' | 'inactive';
  tier: 'basic' | 'professional' | 'enterprise' | 'academic';
  location: {
    country: string;
    region: string;
    city: string;
    timezone: string;
  };
  users: {
    total: number;
    active: number;
    doctors: number;
    nurses: number;
    students: number;
    admins: number;
  };
  subscription: {
    plan: string;
    startDate: string;
    endDate: string;
    monthlyCost: number;
    features: string[];
    usage: {
      storage: number;
      bandwidth: number;
      sessions: number;
      aiAnalyses: number;
    };
  };
  compliance: {
    hipaa: boolean;
    gdpr: boolean;
    fda: boolean;
    iso27001: boolean;
    lastAudit: string;
    certifications: string[];
  };
  medicalStats: {
    totalPatients: number;
    totalStudies: number;
    totalProcedures: number;
    aiAnalyses: number;
    collaborativeSessions: number;
    averageSessionDuration: string;
  };
  performance: {
    uptime: number;
    avgResponseTime: number;
    errorRate: number;
    satisfactionScore: number;
  };
  lastActivity: string;
  createdDate: string;
}

interface GlobalMetrics {
  organizations: {
    total: number;
    active: number;
    trial: number;
    enterprise: number;
  };
  users: {
    total: number;
    active: number;
    monthlyActive: number;
    newThisMonth: number;
  };
  medical: {
    totalPatients: number;
    totalStudies: number;
    totalProcedures: number;
    aiAnalyses: number;
    xrSessions: number;
  };
  financial: {
    monthlyRevenue: number;
    annualRevenue: number;
    growthRate: number;
    churnRate: number;
  };
  system: {
    globalUptime: number;
    avgResponseTime: number;
    totalStorage: string;
    totalBandwidth: string;
  };
  compliance: {
    hipaaCompliant: number;
    gdprCompliant: number;
    fdaApproved: number;
    iso27001Certified: number;
  };
}

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'security' | 'performance' | 'compliance' | 'financial' | 'medical';
  title: string;
  message: string;
  organizationId?: string;
  organizationName?: string;
  timestamp: string;
  acknowledged: boolean;
  actionRequired: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const EnterpriseDashboard: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics | null>(null);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d');

  // Initialize enterprise data
  useEffect(() => {
    const mockOrganizations: Organization[] = [
      {
        id: 'org-001',
        name: 'Johns Hopkins Medical Center',
        type: 'hospital',
        status: 'active',
        tier: 'enterprise',
        location: {
          country: 'United States',
          region: 'Maryland',
          city: 'Baltimore',
          timezone: 'EST'
        },
        users: {
          total: 1247,
          active: 892,
          doctors: 342,
          nurses: 456,
          students: 289,
          admins: 12
        },
        subscription: {
          plan: 'Enterprise Medical',
          startDate: '2023-01-15',
          endDate: '2024-01-15',
          monthlyCost: 15000,
          features: ['AI Analysis', 'XR Integration', 'Enterprise Support', 'HIPAA Compliance'],
          usage: {
            storage: 2500,
            bandwidth: 890,
            sessions: 1247,
            aiAnalyses: 5632
          }
        },
        compliance: {
          hipaa: true,
          gdpr: false,
          fda: true,
          iso27001: true,
          lastAudit: '2024-01-10',
          certifications: ['HIPAA', 'FDA Class II', 'ISO 27001', 'SOC 2']
        },
        medicalStats: {
          totalPatients: 45672,
          totalStudies: 89234,
          totalProcedures: 12456,
          aiAnalyses: 23789,
          collaborativeSessions: 1456,
          averageSessionDuration: '45m'
        },
        performance: {
          uptime: 99.9,
          avgResponseTime: 120,
          errorRate: 0.01,
          satisfactionScore: 4.8
        },
        lastActivity: '2024-01-15T14:30:00Z',
        createdDate: '2023-01-15'
      },
      {
        id: 'org-002',
        name: 'Stanford Medical School',
        type: 'university',
        status: 'active',
        tier: 'academic',
        location: {
          country: 'United States',
          region: 'California',
          city: 'Stanford',
          timezone: 'PST'
        },
        users: {
          total: 892,
          active: 645,
          doctors: 156,
          nurses: 89,
          students: 567,
          admins: 8
        },
        subscription: {
          plan: 'Academic Pro',
          startDate: '2023-08-15',
          endDate: '2024-08-15',
          monthlyCost: 8500,
          features: ['AI Analysis', 'Educational Tools', 'Collaboration', 'Research Analytics'],
          usage: {
            storage: 1800,
            bandwidth: 645,
            sessions: 892,
            aiAnalyses: 3421
          }
        },
        compliance: {
          hipaa: true,
          gdpr: false,
          fda: false,
          iso27001: true,
          lastAudit: '2024-01-08',
          certifications: ['HIPAA', 'ISO 27001', 'Academic Compliance']
        },
        medicalStats: {
          totalPatients: 23450,
          totalStudies: 45678,
          totalProcedures: 6789,
          aiAnalyses: 12345,
          collaborativeSessions: 2345,
          averageSessionDuration: '32m'
        },
        performance: {
          uptime: 99.7,
          avgResponseTime: 95,
          errorRate: 0.005,
          satisfactionScore: 4.9
        },
        lastActivity: '2024-01-15T13:45:00Z',
        createdDate: '2023-08-15'
      },
      {
        id: 'org-003',
        name: 'Mayo Clinic Research',
        type: 'research',
        status: 'active',
        tier: 'professional',
        location: {
          country: 'United States',
          region: 'Minnesota',
          city: 'Rochester',
          timezone: 'CST'
        },
        users: {
          total: 456,
          active: 398,
          doctors: 189,
          nurses: 67,
          students: 123,
          admins: 6
        },
        subscription: {
          plan: 'Research Professional',
          startDate: '2023-05-20',
          endDate: '2024-05-20',
          monthlyCost: 6500,
          features: ['Research Analytics', 'AI Analysis', 'Data Export', 'Compliance'],
          usage: {
            storage: 1200,
            bandwidth: 423,
            sessions: 567,
            aiAnalyses: 2789
          }
        },
        compliance: {
          hipaa: true,
          gdpr: true,
          fda: true,
          iso27001: true,
          lastAudit: '2024-01-12',
          certifications: ['HIPAA', 'GDPR', 'FDA Class II', 'ISO 27001', 'GCP']
        },
        medicalStats: {
          totalPatients: 12345,
          totalStudies: 23456,
          totalProcedures: 3456,
          aiAnalyses: 8901,
          collaborativeSessions: 789,
          averageSessionDuration: '52m'
        },
        performance: {
          uptime: 99.8,
          avgResponseTime: 110,
          errorRate: 0.008,
          satisfactionScore: 4.7
        },
        lastActivity: '2024-01-15T12:20:00Z',
        createdDate: '2023-05-20'
      },
      {
        id: 'org-004',
        name: 'City Medical Clinic',
        type: 'clinic',
        status: 'trial',
        tier: 'basic',
        location: {
          country: 'United States',
          region: 'Texas',
          city: 'Houston',
          timezone: 'CST'
        },
        users: {
          total: 67,
          active: 45,
          doctors: 23,
          nurses: 34,
          students: 5,
          admins: 2
        },
        subscription: {
          plan: 'Basic Trial',
          startDate: '2024-01-01',
          endDate: '2024-02-01',
          monthlyCost: 0,
          features: ['Basic DICOM', 'Limited AI', 'Trial Support'],
          usage: {
            storage: 150,
            bandwidth: 89,
            sessions: 78,
            aiAnalyses: 234
          }
        },
        compliance: {
          hipaa: true,
          gdpr: false,
          fda: false,
          iso27001: false,
          lastAudit: '2024-01-05',
          certifications: ['HIPAA']
        },
        medicalStats: {
          totalPatients: 2345,
          totalStudies: 4567,
          totalProcedures: 567,
          aiAnalyses: 890,
          collaborativeSessions: 123,
          averageSessionDuration: '28m'
        },
        performance: {
          uptime: 99.5,
          avgResponseTime: 145,
          errorRate: 0.02,
          satisfactionScore: 4.5
        },
        lastActivity: '2024-01-15T11:30:00Z',
        createdDate: '2024-01-01'
      }
    ];
    setOrganizations(mockOrganizations);

    // Mock global metrics
    const mockGlobalMetrics: GlobalMetrics = {
      organizations: {
        total: 247,
        active: 189,
        trial: 23,
        enterprise: 45
      },
      users: {
        total: 45672,
        active: 34567,
        monthlyActive: 28945,
        newThisMonth: 1234
      },
      medical: {
        totalPatients: 1234567,
        totalStudies: 2345678,
        totalProcedures: 345678,
        aiAnalyses: 456789,
        xrSessions: 23456
      },
      financial: {
        monthlyRevenue: 2340000,
        annualRevenue: 28080000,
        growthRate: 15.2,
        churnRate: 2.8
      },
      system: {
        globalUptime: 99.8,
        avgResponseTime: 115,
        totalStorage: '45.7TB',
        totalBandwidth: '12.3TB'
      },
      compliance: {
        hipaaCompliant: 189,
        gdprCompliant: 67,
        fdaApproved: 123,
        iso27001Certified: 156
      }
    };
    setGlobalMetrics(mockGlobalMetrics);

    // Mock system alerts
    const mockAlerts: SystemAlert[] = [
      {
        id: 'alert-001',
        type: 'critical',
        category: 'security',
        title: 'Security Breach Attempt',
        message: 'Multiple failed login attempts detected from suspicious IP addresses',
        organizationId: 'org-001',
        organizationName: 'Johns Hopkins Medical Center',
        timestamp: '2024-01-15T14:25:00Z',
        acknowledged: false,
        actionRequired: true,
        severity: 'critical'
      },
      {
        id: 'alert-002',
        type: 'warning',
        category: 'performance',
        title: 'High Response Time',
        message: 'Average response time exceeded threshold (>200ms) for the past hour',
        organizationId: 'org-002',
        organizationName: 'Stanford Medical School',
        timestamp: '2024-01-15T13:45:00Z',
        acknowledged: true,
        actionRequired: false,
        severity: 'medium'
      },
      {
        id: 'alert-003',
        type: 'info',
        category: 'compliance',
        title: 'Certification Renewal',
        message: 'ISO 27001 certification expires in 30 days',
        organizationId: 'org-003',
        organizationName: 'Mayo Clinic Research',
        timestamp: '2024-01-15T12:00:00Z',
        acknowledged: false,
        actionRequired: true,
        severity: 'low'
      },
      {
        id: 'alert-004',
        type: 'success',
        category: 'financial',
        title: 'Trial Conversion',
        message: 'City Medical Clinic has upgraded to Professional plan',
        organizationId: 'org-004',
        organizationName: 'City Medical Clinic',
        timestamp: '2024-01-15T11:30:00Z',
        acknowledged: true,
        actionRequired: false,
        severity: 'low'
      }
    ];
    setSystemAlerts(mockAlerts);
  }, []);

  const handleOrganizationSelect = (orgId: string) => {
    setSelectedOrganization(orgId);
  };

  const handleAlertAcknowledge = (alertId: string) => {
    setSystemAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-medsight-normal';
      case 'trial': return 'text-medsight-accent';
      case 'suspended': return 'text-red-500';
      case 'inactive': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'trial': return <ClockIcon className="w-4 h-4" />;
      case 'suspended': return <XCircleIcon className="w-4 h-4" />;
      case 'inactive': return <XCircleIcon className="w-4 h-4" />;
      default: return <XCircleIcon className="w-4 h-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'academic': return 'bg-green-100 text-green-800';
      case 'basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'info': return <InformationCircleIcon className="w-5 h-5" />;
      case 'success': return <CheckCircleIcon className="w-5 h-5" />;
      default: return <InformationCircleIcon className="w-5 h-5" />;
    }
  };

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || org.status === filterStatus;
    const matchesType = filterType === 'all' || org.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl mb-6 border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-medsight-primary/10 rounded-xl">
              <BuildingOfficeIcon className="w-8 h-8 text-medsight-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-medsight-primary">Enterprise Dashboard</h1>
              <p className="text-gray-600">Multi-tenant medical platform management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="w-5 h-5 text-medsight-normal" />
              <span className="text-sm font-medium text-medsight-normal">
                {globalMetrics?.organizations.active} Active Organizations
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5 text-medsight-accent" />
              <span className="text-sm font-medium text-medsight-accent">
                {globalMetrics?.users.active.toLocaleString()} Active Users
              </span>
            </div>
          </div>
        </div>

        {/* System Health Alert */}
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Enterprise System Operational - {globalMetrics?.system.globalUptime}% Uptime
            </span>
            <span className="ml-auto text-xs text-green-600">
              Avg Response: {globalMetrics?.system.avgResponseTime}ms
            </span>
          </div>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Organizations Metric */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Organizations</p>
              <p className="text-2xl font-bold text-medsight-primary">
                {globalMetrics?.organizations.total}
              </p>
              <p className="text-sm text-medsight-normal">
                {globalMetrics?.organizations.active} active
              </p>
            </div>
            <BuildingOfficeIcon className="w-8 h-8 text-medsight-primary" />
          </div>
        </div>

        {/* Users Metric */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-medsight-secondary">
                {globalMetrics?.users.total.toLocaleString()}
              </p>
              <p className="text-sm text-medsight-normal">
                +{globalMetrics?.users.newThisMonth} this month
              </p>
            </div>
            <UsersIcon className="w-8 h-8 text-medsight-secondary" />
          </div>
        </div>

        {/* Revenue Metric */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-medsight-accent">
                ${globalMetrics?.financial.monthlyRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-medsight-normal">
                +{globalMetrics?.financial.growthRate}% growth
              </p>
            </div>
            <BanknotesIcon className="w-8 h-8 text-medsight-accent" />
          </div>
        </div>

        {/* Medical Activity Metric */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">AI Analyses</p>
              <p className="text-2xl font-bold text-purple-600">
                {globalMetrics?.medical.aiAnalyses.toLocaleString()}
              </p>
              <p className="text-sm text-medsight-normal">
                {globalMetrics?.medical.xrSessions.toLocaleString()} XR sessions
              </p>
            </div>
            <BeakerIcon className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="medsight-glass p-4 rounded-xl mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-medsight w-64"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-medsight"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-medsight"
            >
              <option value="all">All Types</option>
              <option value="hospital">Hospital</option>
              <option value="clinic">Clinic</option>
              <option value="university">University</option>
              <option value="research">Research</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-medsight-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <Square3Stack3DIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-medsight-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <TableCellsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Organizations Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {filteredOrganizations.map((org) => (
            <div 
              key={org.id}
              className={`medsight-glass p-6 rounded-xl cursor-pointer transition-all border-2 ${
                selectedOrganization === org.id
                  ? 'border-medsight-primary bg-medsight-primary/5'
                  : 'border-transparent hover:border-medsight-primary/50'
              }`}
              onClick={() => handleOrganizationSelect(org.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    org.type === 'hospital' ? 'bg-red-100' :
                    org.type === 'clinic' ? 'bg-blue-100' :
                    org.type === 'university' ? 'bg-green-100' :
                    org.type === 'research' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    {org.type === 'hospital' ? <HeartIcon className="w-5 h-5 text-red-600" /> :
                     org.type === 'clinic' ? <BuildingStorefrontIcon className="w-5 h-5 text-blue-600" /> :
                     org.type === 'university' ? <AcademicCapIcon className="w-5 h-5 text-green-600" /> :
                     org.type === 'research' ? <BeakerIcon className="w-5 h-5 text-purple-600" /> :
                     <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{org.name}</h3>
                    <p className="text-sm text-gray-600">{org.location.city}, {org.location.region}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className={`flex items-center space-x-1 ${getStatusColor(org.status)}`}>
                    {getStatusIcon(org.status)}
                    <span className="text-sm font-medium capitalize">{org.status}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTierColor(org.tier)}`}>
                    {org.tier}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Users:</span>
                    <span className="font-medium ml-2">{org.users.total}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Active:</span>
                    <span className="font-medium ml-2">{org.users.active}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium ml-2">${org.subscription.monthlyCost.toLocaleString()}/mo</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Uptime:</span>
                    <span className="font-medium ml-2">{org.performance.uptime}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Storage Usage:</span>
                    <span className="font-medium">{org.subscription.usage.storage} GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-medsight-primary h-2 rounded-full"
                      style={{ width: `${Math.min((org.subscription.usage.storage / 5000) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs">
                  <div className={`flex items-center space-x-1 ${org.compliance.hipaa ? 'text-medsight-normal' : 'text-gray-400'}`}>
                    <ShieldCheckIcon className="w-3 h-3" />
                    <span>HIPAA</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${org.compliance.fda ? 'text-medsight-normal' : 'text-gray-400'}`}>
                    <CheckCircleIcon className="w-3 h-3" />
                    <span>FDA</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${org.compliance.iso27001 ? 'text-medsight-normal' : 'text-gray-400'}`}>
                    <LockClosedIcon className="w-3 h-3" />
                    <span>ISO 27001</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium">{org.medicalStats.totalPatients.toLocaleString()}</div>
                      <div className="text-gray-600">Patients</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{org.medicalStats.totalStudies.toLocaleString()}</div>
                      <div className="text-gray-600">Studies</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{org.medicalStats.aiAnalyses.toLocaleString()}</div>
                      <div className="text-gray-600">AI Analyses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="medsight-glass rounded-xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compliance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrganizations.map((org) => (
                  <tr 
                    key={org.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedOrganization === org.id ? 'bg-medsight-primary/5' : ''
                    }`}
                    onClick={() => handleOrganizationSelect(org.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${
                          org.type === 'hospital' ? 'bg-red-100' :
                          org.type === 'clinic' ? 'bg-blue-100' :
                          org.type === 'university' ? 'bg-green-100' :
                          org.type === 'research' ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                          {org.type === 'hospital' ? <HeartIcon className="w-4 h-4 text-red-600" /> :
                           org.type === 'clinic' ? <BuildingStorefrontIcon className="w-4 h-4 text-blue-600" /> :
                           org.type === 'university' ? <AcademicCapIcon className="w-4 h-4 text-green-600" /> :
                           org.type === 'research' ? <BeakerIcon className="w-4 h-4 text-purple-600" /> :
                           <BuildingOfficeIcon className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{org.name}</div>
                          <div className="text-sm text-gray-500">{org.location.city}, {org.location.region}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className={`flex items-center space-x-1 ${getStatusColor(org.status)}`}>
                          {getStatusIcon(org.status)}
                          <span className="text-sm font-medium capitalize">{org.status}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTierColor(org.tier)}`}>
                          {org.tier}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{org.users.total} total</div>
                      <div className="text-gray-500">{org.users.active} active</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${org.subscription.monthlyCost.toLocaleString()}/mo
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {org.compliance.hipaa && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            HIPAA
                          </span>
                        )}
                        {org.compliance.fda && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            FDA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{org.performance.uptime}% uptime</div>
                      <div className="text-gray-500">{org.performance.avgResponseTime}ms avg</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Alerts */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-medsight-primary">System Alerts</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {systemAlerts.filter(alert => !alert.acknowledged).length} unacknowledged
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {systemAlerts.map((alert) => (
            <div 
              key={alert.id}
              className={`p-4 rounded-lg border ${getAlertColor(alert.type)} ${
                alert.acknowledged ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm mt-1">{alert.message}</p>
                    {alert.organizationName && (
                      <p className="text-xs mt-2 opacity-75">
                        Organization: {alert.organizationName}
                      </p>
                    )}
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {alert.severity}
                  </span>
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
            </div>
          ))}
        </div>
      </div>

      {/* Medical Compliance Footer */}
      <div className="mt-6 medsight-glass p-4 rounded-xl border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-medsight-normal" />
            <span className="text-sm font-medium text-medsight-normal">Enterprise Medical Compliance</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-medsight-normal">
              {globalMetrics?.compliance.hipaaCompliant} HIPAA Compliant
            </span>
            <span className="text-medsight-normal">
              {globalMetrics?.compliance.fdaApproved} FDA Approved
            </span>
            <span className="text-medsight-normal">
              {globalMetrics?.compliance.iso27001Certified} ISO 27001 Certified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseDashboard; 