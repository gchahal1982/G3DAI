'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlobeAltIcon, MapPinIcon, ServerIcon, CloudIcon,
  ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  CpuChipIcon, CircleStackIcon, WifiIcon, SignalIcon,
  UsersIcon, HeartIcon, BuildingOfficeIcon, AcademicCapIcon,
  CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon,
  ClockIcon, ArrowPathIcon, PlayIcon, PauseIcon,
  StopIcon, BeakerIcon, SparklesIcon, FireIcon,
  BoltIcon, LightBulbIcon, EyeIcon, Cog6ToothIcon,
  ArrowRightIcon, ArrowUpIcon, ArrowDownIcon,
  InformationCircleIcon, ShieldCheckIcon, LockClosedIcon,
  DocumentTextIcon, ChartPieIcon, PresentationChartLineIcon,
  TableCellsIcon, Square3Stack3DIcon, ViewColumnsIcon,
  MagnifyingGlassIcon, FunnelIcon, AdjustmentsHorizontalIcon,
  CalendarIcon, ClipboardDocumentCheckIcon, TagIcon,
  StarIcon, HomeIcon, PhoneIcon, DevicePhoneMobileIcon,
  ComputerDesktopIcon, DeviceTabletIcon, WindowIcon,
  PhotoIcon, VideoCameraIcon, MicrophoneIcon,
  SpeakerWaveIcon, ChatBubbleLeftEllipsisIcon,
  EnvelopeIcon, RectangleGroupIcon, ListBulletIcon
} from '@heroicons/react/24/outline';

interface RegionalDeployment {
  id: string;
  region: string;
  name: string;
  code: string;
  country: string;
  timezone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'deploying' | 'maintenance' | 'offline' | 'error';
  version: string;
  lastDeployed: string;
  environment: 'production' | 'staging' | 'development';
  infrastructure: {
    servers: number;
    activeServers: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
  medical: {
    organizations: number;
    users: number;
    patients: number;
    studies: number;
    aiAnalyses: number;
    xrSessions: number;
  };
  performance: {
    uptime: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
    successRate: number;
  };
  compliance: {
    hipaa: boolean;
    gdpr: boolean;
    localRegulations: string[];
    dataResidency: boolean;
    certifications: string[];
  };
  scaling: {
    autoScaling: boolean;
    minInstances: number;
    maxInstances: number;
    currentInstances: number;
    targetUtilization: number;
    scalingEvents: number;
  };
  costs: {
    monthly: number;
    daily: number;
    perUser: number;
    storage: number;
    compute: number;
    network: number;
  };
}

interface GlobalMetrics {
  totalRegions: number;
  activeRegions: number;
  totalServers: number;
  totalUsers: number;
  totalPatients: number;
  globalUptime: number;
  avgResponseTime: number;
  totalCosts: number;
  dataTransfer: number;
  aiAnalyses: number;
  medicalCompliance: number;
}

interface ScalingEvent {
  id: string;
  type: 'scale-up' | 'scale-down' | 'auto-scale' | 'manual-scale' | 'failover';
  region: string;
  timestamp: string;
  reason: string;
  action: string;
  oldCapacity: number;
  newCapacity: number;
  duration: number;
  status: 'completed' | 'in-progress' | 'failed';
  impact: {
    users: number;
    performance: number;
    cost: number;
  };
  trigger: 'cpu' | 'memory' | 'network' | 'requests' | 'manual' | 'scheduled';
}

interface GlobalAlert {
  id: string;
  type: 'performance' | 'scaling' | 'compliance' | 'cost' | 'medical';
  severity: 'info' | 'warning' | 'critical';
  region: string;
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  metric: string;
  threshold: number;
  currentValue: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

const GlobalScalingMonitor: React.FC = () => {
  const [regionalDeployments, setRegionalDeployments] = useState<RegionalDeployment[]>([]);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics | null>(null);
  const [scalingEvents, setScalingEvents] = useState<ScalingEvent[]>([]);
  const [globalAlerts, setGlobalAlerts] = useState<GlobalAlert[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [viewMode, setViewMode] = useState<'overview' | 'regions' | 'scaling' | 'costs'>('overview');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [mapView, setMapView] = useState<'world' | 'performance' | 'medical'>('world');

  // Initialize global scaling data
  useEffect(() => {
    const mockDeployments: RegionalDeployment[] = [
      {
        id: 'us-east-1',
        region: 'US East',
        name: 'North America East',
        code: 'USE1',
        country: 'United States',
        timezone: 'EST',
        coordinates: { lat: 39.0458, lng: -76.6413 },
        status: 'active',
        version: '2.4.1',
        lastDeployed: '2024-01-15T08:00:00Z',
        environment: 'production',
        infrastructure: {
          servers: 24,
          activeServers: 23,
          cpuUsage: 65.4,
          memoryUsage: 72.1,
          diskUsage: 45.8,
          networkLatency: 12
        },
        medical: {
          organizations: 89,
          users: 12456,
          patients: 456789,
          studies: 234567,
          aiAnalyses: 123456,
          xrSessions: 5678
        },
        performance: {
          uptime: 99.9,
          responseTime: 95,
          throughput: 5670,
          errorRate: 0.01,
          successRate: 99.99
        },
        compliance: {
          hipaa: true,
          gdpr: false,
          localRegulations: ['HITECH', 'SOX'],
          dataResidency: true,
          certifications: ['HIPAA', 'SOC 2', 'FedRAMP']
        },
        scaling: {
          autoScaling: true,
          minInstances: 8,
          maxInstances: 32,
          currentInstances: 24,
          targetUtilization: 70,
          scalingEvents: 45
        },
        costs: {
          monthly: 48500,
          daily: 1617,
          perUser: 3.89,
          storage: 12500,
          compute: 28900,
          network: 7100
        }
      },
      {
        id: 'eu-west-1',
        region: 'EU West',
        name: 'Europe West',
        code: 'EUW1',
        country: 'Ireland',
        timezone: 'GMT',
        coordinates: { lat: 53.4084, lng: -6.1917 },
        status: 'active',
        version: '2.4.1',
        lastDeployed: '2024-01-15T08:30:00Z',
        environment: 'production',
        infrastructure: {
          servers: 18,
          activeServers: 18,
          cpuUsage: 58.2,
          memoryUsage: 64.7,
          diskUsage: 52.3,
          networkLatency: 18
        },
        medical: {
          organizations: 67,
          users: 8934,
          patients: 234567,
          studies: 156789,
          aiAnalyses: 89012,
          xrSessions: 3456
        },
        performance: {
          uptime: 99.8,
          responseTime: 108,
          throughput: 4230,
          errorRate: 0.02,
          successRate: 99.98
        },
        compliance: {
          hipaa: false,
          gdpr: true,
          localRegulations: ['GDPR', 'MDR'],
          dataResidency: true,
          certifications: ['GDPR', 'ISO 27001', 'ISO 13485']
        },
        scaling: {
          autoScaling: true,
          minInstances: 6,
          maxInstances: 24,
          currentInstances: 18,
          targetUtilization: 70,
          scalingEvents: 32
        },
        costs: {
          monthly: 36700,
          daily: 1223,
          perUser: 4.11,
          storage: 9800,
          compute: 21900,
          network: 5000
        }
      },
      {
        id: 'ap-southeast-1',
        region: 'Asia Pacific',
        name: 'Asia Pacific Southeast',
        code: 'APS1',
        country: 'Singapore',
        timezone: 'SGT',
        coordinates: { lat: 1.3521, lng: 103.8198 },
        status: 'active',
        version: '2.4.0',
        lastDeployed: '2024-01-14T14:00:00Z',
        environment: 'production',
        infrastructure: {
          servers: 12,
          activeServers: 12,
          cpuUsage: 71.8,
          memoryUsage: 68.4,
          diskUsage: 38.9,
          networkLatency: 25
        },
        medical: {
          organizations: 34,
          users: 5678,
          patients: 123456,
          studies: 89012,
          aiAnalyses: 45678,
          xrSessions: 2134
        },
        performance: {
          uptime: 99.7,
          responseTime: 125,
          throughput: 2890,
          errorRate: 0.03,
          successRate: 99.97
        },
        compliance: {
          hipaa: false,
          gdpr: false,
          localRegulations: ['PDPA', 'PIPEDA'],
          dataResidency: true,
          certifications: ['PDPA', 'ISO 27001']
        },
        scaling: {
          autoScaling: true,
          minInstances: 4,
          maxInstances: 20,
          currentInstances: 12,
          targetUtilization: 70,
          scalingEvents: 28
        },
        costs: {
          monthly: 25600,
          daily: 853,
          perUser: 4.51,
          storage: 6800,
          compute: 15200,
          network: 3600
        }
      },
      {
        id: 'ca-central-1',
        region: 'Canada Central',
        name: 'Canada Central',
        code: 'CAC1',
        country: 'Canada',
        timezone: 'EST',
        coordinates: { lat: 43.6532, lng: -79.3832 },
        status: 'deploying',
        version: '2.4.1',
        lastDeployed: '2024-01-15T10:00:00Z',
        environment: 'production',
        infrastructure: {
          servers: 8,
          activeServers: 6,
          cpuUsage: 45.2,
          memoryUsage: 52.8,
          diskUsage: 28.4,
          networkLatency: 15
        },
        medical: {
          organizations: 23,
          users: 3456,
          patients: 67890,
          studies: 34567,
          aiAnalyses: 23456,
          xrSessions: 1234
        },
        performance: {
          uptime: 98.5,
          responseTime: 98,
          throughput: 1890,
          errorRate: 0.05,
          successRate: 99.95
        },
        compliance: {
          hipaa: true,
          gdpr: false,
          localRegulations: ['PIPEDA', 'PHIPA'],
          dataResidency: true,
          certifications: ['PIPEDA', 'SOC 2']
        },
        scaling: {
          autoScaling: true,
          minInstances: 3,
          maxInstances: 16,
          currentInstances: 8,
          targetUtilization: 70,
          scalingEvents: 15
        },
        costs: {
          monthly: 18900,
          daily: 630,
          perUser: 5.47,
          storage: 4800,
          compute: 11200,
          network: 2900
        }
      }
    ];
    setRegionalDeployments(mockDeployments);

    const mockGlobalMetrics: GlobalMetrics = {
      totalRegions: 4,
      activeRegions: 3,
      totalServers: 62,
      totalUsers: 30524,
      totalPatients: 882702,
      globalUptime: 99.7,
      avgResponseTime: 106,
      totalCosts: 129700,
      dataTransfer: 45.7,
      aiAnalyses: 281602,
      medicalCompliance: 96.8
    };
    setGlobalMetrics(mockGlobalMetrics);

    const mockScalingEvents: ScalingEvent[] = [
      {
        id: 'event-001',
        type: 'scale-up',
        region: 'US East',
        timestamp: '2024-01-15T13:45:00Z',
        reason: 'High CPU utilization (>80%) detected',
        action: 'Added 3 instances',
        oldCapacity: 21,
        newCapacity: 24,
        duration: 180,
        status: 'completed',
        impact: {
          users: 0,
          performance: 15,
          cost: 450
        },
        trigger: 'cpu'
      },
      {
        id: 'event-002',
        type: 'auto-scale',
        region: 'EU West',
        timestamp: '2024-01-15T11:20:00Z',
        reason: 'Scheduled peak hours scaling',
        action: 'Increased capacity to handle peak load',
        oldCapacity: 15,
        newCapacity: 18,
        duration: 240,
        status: 'completed',
        impact: {
          users: 0,
          performance: 12,
          cost: 320
        },
        trigger: 'scheduled'
      },
      {
        id: 'event-003',
        type: 'failover',
        region: 'Asia Pacific',
        timestamp: '2024-01-15T09:15:00Z',
        reason: 'Server failure in primary zone',
        action: 'Failed over to secondary zone',
        oldCapacity: 12,
        newCapacity: 12,
        duration: 45,
        status: 'completed',
        impact: {
          users: 156,
          performance: -5,
          cost: 0
        },
        trigger: 'manual'
      }
    ];
    setScalingEvents(mockScalingEvents);

    const mockAlerts: GlobalAlert[] = [
      {
        id: 'alert-001',
        type: 'performance',
        severity: 'warning',
        region: 'Asia Pacific',
        title: 'High Response Time',
        message: 'Average response time exceeded 150ms threshold',
        timestamp: '2024-01-15T14:20:00Z',
        acknowledged: false,
        metric: 'Response Time',
        threshold: 150,
        currentValue: 165,
        impact: 'medium'
      },
      {
        id: 'alert-002',
        type: 'scaling',
        severity: 'info',
        region: 'Canada Central',
        title: 'Deployment In Progress',
        message: 'New version 2.4.1 deployment is currently in progress',
        timestamp: '2024-01-15T13:00:00Z',
        acknowledged: true,
        metric: 'Deployment Status',
        threshold: 100,
        currentValue: 75,
        impact: 'low'
      },
      {
        id: 'alert-003',
        type: 'cost',
        severity: 'warning',
        region: 'US East',
        title: 'Cost Increase',
        message: 'Monthly costs projected to exceed budget by 15%',
        timestamp: '2024-01-15T12:30:00Z',
        acknowledged: false,
        metric: 'Monthly Cost',
        threshold: 45000,
        currentValue: 48500,
        impact: 'medium'
      }
    ];
    setGlobalAlerts(mockAlerts);
  }, []);

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId);
  };

  const handleAlertAcknowledge = (alertId: string) => {
    setGlobalAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'deploying': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'offline': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'deploying': return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
      case 'maintenance': return <Cog6ToothIcon className="w-4 h-4" />;
      case 'offline': return <StopIcon className="w-4 h-4" />;
      case 'error': return <XCircleIcon className="w-4 h-4" />;
      default: return <InformationCircleIcon className="w-4 h-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <GlobeAltIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-medsight-primary">Global Scaling Monitor</h2>
              <p className="text-gray-600">Multi-region medical deployment management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="input-medsight"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            <button className="btn-medsight">
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Global Status */}
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <GlobeAltIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Global Infrastructure: Operational - {globalMetrics?.activeRegions}/{globalMetrics?.totalRegions} Regions Active
            </span>
            <span className="ml-auto text-xs text-green-600">
              {globalMetrics?.globalUptime}% Uptime | {globalMetrics?.avgResponseTime}ms Avg Response
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
            onClick={() => setViewMode('regions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'regions'
                ? 'bg-medsight-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MapPinIcon className="w-4 h-4 mr-2 inline" />
            Regions ({regionalDeployments.length})
          </button>
          <button
            onClick={() => setViewMode('scaling')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'scaling'
                ? 'bg-medsight-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ArrowTrendingUpIcon className="w-4 h-4 mr-2 inline" />
            Scaling Events
          </button>
          <button
            onClick={() => setViewMode('costs')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'costs'
                ? 'bg-medsight-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ChartPieIcon className="w-4 h-4 mr-2 inline" />
            Cost Analysis
          </button>
        </div>
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && globalMetrics && (
        <>
          {/* Global Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Regions</p>
                  <p className="text-2xl font-bold text-medsight-primary">
                    {globalMetrics.activeRegions}/{globalMetrics.totalRegions}
                  </p>
                  <p className="text-sm text-medsight-normal">
                    {globalMetrics.totalServers} servers
                  </p>
                </div>
                <GlobeAltIcon className="w-8 h-8 text-medsight-primary" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Global Users</p>
                  <p className="text-2xl font-bold text-medsight-secondary">
                    {formatNumber(globalMetrics.totalUsers)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatNumber(globalMetrics.totalPatients)} patients
                  </p>
                </div>
                <UsersIcon className="w-8 h-8 text-medsight-secondary" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Costs</p>
                  <p className="text-2xl font-bold text-medsight-accent">
                    {formatCurrency(globalMetrics.totalCosts)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {globalMetrics.dataTransfer}TB transfer
                  </p>
                </div>
                <CloudIcon className="w-8 h-8 text-medsight-accent" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AI Analyses</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatNumber(globalMetrics.aiAnalyses)}
                  </p>
                  <p className="text-sm text-purple-600">
                    {globalMetrics.medicalCompliance}% compliance
                  </p>
                </div>
                <BeakerIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Regional Status Map */}
          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Regional Deployments</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setMapView('world')}
                  className={`px-3 py-1 text-sm rounded ${
                    mapView === 'world' ? 'bg-medsight-primary text-white' : 'bg-gray-100'
                  }`}
                >
                  World View
                </button>
                <button
                  onClick={() => setMapView('performance')}
                  className={`px-3 py-1 text-sm rounded ${
                    mapView === 'performance' ? 'bg-medsight-primary text-white' : 'bg-gray-100'
                  }`}
                >
                  Performance
                </button>
                <button
                  onClick={() => setMapView('medical')}
                  className={`px-3 py-1 text-sm rounded ${
                    mapView === 'medical' ? 'bg-medsight-primary text-white' : 'bg-gray-100'
                  }`}
                >
                  Medical
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {regionalDeployments.map((deployment) => (
                <div 
                  key={deployment.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedRegion === deployment.id
                      ? 'border-medsight-primary bg-medsight-primary/5'
                      : 'border-gray-200 hover:border-medsight-primary/50'
                  }`}
                  onClick={() => handleRegionSelect(deployment.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{deployment.region}</h4>
                      <p className="text-sm text-gray-600">{deployment.country}</p>
                    </div>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(deployment.status)}`}>
                      {getStatusIcon(deployment.status)}
                      <span className="font-medium capitalize">{deployment.status}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="font-medium">{deployment.performance.uptime}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response:</span>
                      <span className="font-medium">{deployment.performance.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Users:</span>
                      <span className="font-medium">{formatNumber(deployment.medical.users)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost:</span>
                      <span className="font-medium">{formatCurrency(deployment.costs.monthly)}/mo</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-xs">
                      {deployment.compliance.hipaa && (
                        <span className="flex items-center space-x-1 text-green-600">
                          <ShieldCheckIcon className="w-3 h-3" />
                          <span>HIPAA</span>
                        </span>
                      )}
                      {deployment.compliance.gdpr && (
                        <span className="flex items-center space-x-1 text-blue-600">
                          <LockClosedIcon className="w-3 h-3" />
                          <span>GDPR</span>
                        </span>
                      )}
                      <span className="text-gray-600">v{deployment.version}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Alerts */}
          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Global Alerts</h3>
              <span className="text-sm text-gray-600">
                {globalAlerts.filter(alert => !alert.acknowledged).length} unacknowledged
              </span>
            </div>
            <div className="space-y-3">
              {globalAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getAlertColor(alert.severity)} ${
                    alert.acknowledged ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {alert.severity === 'critical' ? <ExclamationTriangleIcon className="w-5 h-5 mt-0.5" /> :
                       alert.severity === 'warning' ? <ExclamationTriangleIcon className="w-5 h-5 mt-0.5" /> :
                       <InformationCircleIcon className="w-5 h-5 mt-0.5" />}
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm mt-1">{alert.message}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs">
                          <span>Region: {alert.region}</span>
                          <span>Metric: {alert.metric}</span>
                          <span>Current: {alert.currentValue}</span>
                          <span>Threshold: {alert.threshold}</span>
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
        </>
      )}

      {/* Regions View */}
      {viewMode === 'regions' && (
        <div className="space-y-6">
          {regionalDeployments.map((deployment) => (
            <div key={deployment.id} className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <MapPinIcon className="w-6 h-6 text-medsight-primary" />
                  <div>
                    <h3 className="font-semibold text-xl">{deployment.region}</h3>
                    <p className="text-gray-600">{deployment.name} - {deployment.country}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${getStatusColor(deployment.status)}`}>
                    {getStatusIcon(deployment.status)}
                    <span className="font-medium capitalize">{deployment.status}</span>
                  </div>
                  <span className="text-sm text-gray-600">v{deployment.version}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Infrastructure */}
                <div>
                  <h4 className="font-medium mb-3">Infrastructure</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Servers:</span>
                      <span className="font-medium">{deployment.infrastructure.activeServers}/{deployment.infrastructure.servers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CPU:</span>
                      <span className="font-medium">{deployment.infrastructure.cpuUsage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Memory:</span>
                      <span className="font-medium">{deployment.infrastructure.memoryUsage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disk:</span>
                      <span className="font-medium">{deployment.infrastructure.diskUsage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Latency:</span>
                      <span className="font-medium">{deployment.infrastructure.networkLatency}ms</span>
                    </div>
                  </div>
                </div>

                {/* Medical Stats */}
                <div>
                  <h4 className="font-medium mb-3">Medical Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Organizations:</span>
                      <span className="font-medium">{deployment.medical.organizations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Users:</span>
                      <span className="font-medium">{formatNumber(deployment.medical.users)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patients:</span>
                      <span className="font-medium">{formatNumber(deployment.medical.patients)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Studies:</span>
                      <span className="font-medium">{formatNumber(deployment.medical.studies)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">AI Analyses:</span>
                      <span className="font-medium">{formatNumber(deployment.medical.aiAnalyses)}</span>
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div>
                  <h4 className="font-medium mb-3">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="font-medium">{deployment.performance.uptime}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response:</span>
                      <span className="font-medium">{deployment.performance.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Throughput:</span>
                      <span className="font-medium">{formatNumber(deployment.performance.throughput)}/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Error Rate:</span>
                      <span className="font-medium">{deployment.performance.errorRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success:</span>
                      <span className="font-medium">{deployment.performance.successRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Costs */}
                <div>
                  <h4 className="font-medium mb-3">Costs</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly:</span>
                      <span className="font-medium">{formatCurrency(deployment.costs.monthly)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily:</span>
                      <span className="font-medium">{formatCurrency(deployment.costs.daily)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Per User:</span>
                      <span className="font-medium">{formatCurrency(deployment.costs.perUser)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Compute:</span>
                      <span className="font-medium">{formatCurrency(deployment.costs.compute)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Storage:</span>
                      <span className="font-medium">{formatCurrency(deployment.costs.storage)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">
                      Last Deployed: {new Date(deployment.lastDeployed).toLocaleString()}
                    </span>
                    <span className="text-gray-600">Timezone: {deployment.timezone}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-xs">
                      {deployment.compliance.hipaa && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          HIPAA
                        </span>
                      )}
                      {deployment.compliance.gdpr && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          GDPR
                        </span>
                      )}
                      {deployment.compliance.dataResidency && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Data Residency
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scaling Events View */}
      {viewMode === 'scaling' && (
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">Recent Scaling Events</h3>
          <div className="space-y-4">
            {scalingEvents.map((event) => (
              <div key={event.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {event.type === 'scale-up' ? <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 mt-0.5" /> :
                     event.type === 'scale-down' ? <ArrowTrendingDownIcon className="w-5 h-5 text-orange-600 mt-0.5" /> :
                     event.type === 'failover' ? <ArrowPathIcon className="w-5 h-5 text-red-600 mt-0.5" /> :
                     <CpuChipIcon className="w-5 h-5 text-blue-600 mt-0.5" />}
                    <div>
                      <h4 className="font-medium">{event.action}</h4>
                      <p className="text-sm text-gray-600 mt-1">{event.reason}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Region: {event.region}</span>
                        <span>Type: {event.type.replace('-', ' ')}</span>
                        <span>Trigger: {event.trigger}</span>
                        <span>Duration: {event.duration}s</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{event.oldCapacity} → {event.newCapacity}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'completed' ? 'bg-green-100 text-green-800' :
                      event.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.status.replace('-', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Compliance Footer */}
      <div className="medsight-glass p-4 rounded-xl border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-medsight-normal" />
            <span className="text-sm font-medium text-medsight-normal">Global Medical Compliance</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-medsight-normal">Multi-Region Data Residency</span>
            <span className="text-medsight-normal">Global Medical Standards</span>
            <span className="text-medsight-normal">24/7 Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalScalingMonitor; 