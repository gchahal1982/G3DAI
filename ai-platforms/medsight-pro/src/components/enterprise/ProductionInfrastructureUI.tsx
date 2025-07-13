'use client';

import React, { useState, useEffect } from 'react';
import { 
  ServerIcon, CpuChipIcon, CircleStackIcon, CloudIcon,
  WifiIcon, SignalIcon, BoltIcon, FireIcon,
  ChartBarIcon, ChartLineIcon, ArrowTrendingUpIcon,
  ArrowTrendingDownIcon, ExclamationTriangleIcon,
  CheckCircleIcon, XCircleIcon, ClockIcon,
  ArrowPathIcon, PlayIcon, PauseIcon, StopIcon,
  Cog6ToothIcon, ShieldCheckIcon, LockClosedIcon,
  EyeIcon, PencilIcon, TrashIcon, PlusIcon,
  ComputerDesktopIcon, DevicePhoneMobileIcon,
  BuildingOfficeIcon, GlobeAltIcon, MapPinIcon,
  InformationCircleIcon, ExclamationCircleIcon,
  HeartIcon, BeakerIcon, AcademicCapIcon,
  UsersIcon, DocumentTextIcon, FolderOpenIcon,
  TagIcon, StarIcon, HomeIcon, PhoneIcon,
  EnvelopeIcon, ChatBubbleLeftEllipsisIcon,
  MagnifyingGlassIcon, FunnelIcon, AdjustmentsHorizontalIcon,
  CalendarIcon, ClipboardDocumentCheckIcon,
  Square3Stack3DIcon, RectangleGroupIcon, TableCellsIcon,
  ListBulletIcon, ViewColumnsIcon, WindowIcon,
  PhotoIcon, VideoCameraIcon, MicrophoneIcon,
  SpeakerWaveIcon, DeviceTabletIcon, CubeIcon,
  ArchiveBoxIcon, BanknotesIcon, CreditCardIcon,
  ScaleIcon, GavelIcon, HandRaisedIcon,
  KeyIcon, LightBulbIcon, SparklesIcon
} from '@heroicons/react/24/outline';

interface InfrastructureServer {
  id: string;
  name: string;
  type: 'web' | 'api' | 'database' | 'cache' | 'ml' | 'dicom' | 'analytics';
  environment: 'production' | 'staging' | 'development';
  status: 'healthy' | 'warning' | 'critical' | 'offline' | 'maintenance';
  region: string;
  zone: string;
  specs: {
    cpu: {
      cores: number;
      usage: number;
      model: string;
    };
    memory: {
      total: number;
      used: number;
      usage: number;
    };
    disk: {
      total: number;
      used: number;
      usage: number;
      type: 'SSD' | 'HDD' | 'NVMe';
    };
    network: {
      bandwidth: number;
      usage: number;
      latency: number;
    };
  };
  services: {
    name: string;
    status: 'running' | 'stopped' | 'error';
    port: number;
    health: number;
  }[];
  metrics: {
    uptime: number;
    responseTime: number;
    requests: number;
    errors: number;
    load: number;
  };
  medical: {
    hipaaCompliant: boolean;
    encryptionEnabled: boolean;
    dataResidency: boolean;
    auditLogging: boolean;
    patientData: boolean;
  };
  deployment: {
    version: string;
    lastDeployed: string;
    deployedBy: string;
    branch: string;
    commit: string;
  };
  monitoring: {
    alertsEnabled: boolean;
    backupEnabled: boolean;
    monitoringAgent: boolean;
    logShipping: boolean;
  };
}

interface DatabaseCluster {
  id: string;
  name: string;
  type: 'postgresql' | 'mongodb' | 'redis' | 'elasticsearch';
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  environment: 'production' | 'staging' | 'development';
  cluster: {
    primary: string;
    replicas: string[];
    shards: number;
    replication: boolean;
  };
  performance: {
    connections: {
      active: number;
      max: number;
      usage: number;
    };
    queries: {
      total: number;
      slow: number;
      avgTime: number;
      qps: number;
    };
    storage: {
      size: number;
      used: number;
      growth: number;
    };
    memory: {
      cache: number;
      buffer: number;
      usage: number;
    };
  };
  medical: {
    patientRecords: number;
    studyData: number;
    aiModels: number;
    auditLogs: number;
    backupRetention: number;
  };
  backup: {
    lastBackup: string;
    frequency: string;
    retention: string;
    encrypted: boolean;
    verified: boolean;
  };
  security: {
    ssl: boolean;
    encryption: boolean;
    authentication: boolean;
    authorization: boolean;
    firewall: boolean;
  };
}

interface NetworkMetrics {
  global: {
    totalBandwidth: number;
    usedBandwidth: number;
    latency: number;
    packetLoss: number;
    uptime: number;
  };
  regions: {
    region: string;
    bandwidth: number;
    latency: number;
    connections: number;
    errors: number;
  }[];
  cdn: {
    hitRate: number;
    missRate: number;
    bandwidth: number;
    requests: number;
    origin: number;
  };
  security: {
    ddosBlocked: number;
    maliciousIPs: number;
    securityRules: number;
    firewallHits: number;
  };
}

interface InfrastructureAlert {
  id: string;
  type: 'server' | 'database' | 'network' | 'security' | 'performance';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  impact: 'low' | 'medium' | 'high' | 'critical';
  medicalImpact: boolean;
  assignee?: string;
}

const ProductionInfrastructureUI: React.FC = () => {
  const [servers, setServers] = useState<InfrastructureServer[]>([]);
  const [databases, setDatabases] = useState<DatabaseCluster[]>([]);
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics | null>(null);
  const [infrastructureAlerts, setInfrastructureAlerts] = useState<InfrastructureAlert[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [viewMode, setViewMode] = useState<'overview' | 'servers' | 'databases' | 'network'>('overview');
  const [filterEnvironment, setFilterEnvironment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');

  // Initialize infrastructure data
  useEffect(() => {
    const mockServers: InfrastructureServer[] = [
      {
        id: 'server-001',
        name: 'medical-web-01',
        type: 'web',
        environment: 'production',
        status: 'healthy',
        region: 'us-east-1',
        zone: 'us-east-1a',
        specs: {
          cpu: {
            cores: 16,
            usage: 65.4,
            model: 'Intel Xeon E5-2686 v4'
          },
          memory: {
            total: 64,
            used: 46.1,
            usage: 72.0
          },
          disk: {
            total: 1000,
            used: 458,
            usage: 45.8,
            type: 'SSD'
          },
          network: {
            bandwidth: 10000,
            usage: 2340,
            latency: 12
          }
        },
        services: [
          { name: 'nginx', status: 'running', port: 80, health: 100 },
          { name: 'node-app', status: 'running', port: 3000, health: 98 },
          { name: 'redis', status: 'running', port: 6379, health: 99 }
        ],
        metrics: {
          uptime: 99.9,
          responseTime: 95,
          requests: 156780,
          errors: 23,
          load: 2.45
        },
        medical: {
          hipaaCompliant: true,
          encryptionEnabled: true,
          dataResidency: true,
          auditLogging: true,
          patientData: true
        },
        deployment: {
          version: '2.4.1',
          lastDeployed: '2024-01-15T08:00:00Z',
          deployedBy: 'DevOps Team',
          branch: 'main',
          commit: '7a8b9c2d'
        },
        monitoring: {
          alertsEnabled: true,
          backupEnabled: true,
          monitoringAgent: true,
          logShipping: true
        }
      },
      {
        id: 'server-002',
        name: 'medical-api-01',
        type: 'api',
        environment: 'production',
        status: 'warning',
        region: 'us-east-1',
        zone: 'us-east-1b',
        specs: {
          cpu: {
            cores: 8,
            usage: 82.1,
            model: 'Intel Xeon E5-2686 v4'
          },
          memory: {
            total: 32,
            used: 28.4,
            usage: 88.7
          },
          disk: {
            total: 500,
            used: 267,
            usage: 53.4,
            type: 'SSD'
          },
          network: {
            bandwidth: 10000,
            usage: 4560,
            latency: 18
          }
        },
        services: [
          { name: 'api-server', status: 'running', port: 8080, health: 95 },
          { name: 'auth-service', status: 'running', port: 8081, health: 92 },
          { name: 'medical-service', status: 'error', port: 8082, health: 0 }
        ],
        metrics: {
          uptime: 99.7,
          responseTime: 142,
          requests: 234567,
          errors: 156,
          load: 4.23
        },
        medical: {
          hipaaCompliant: true,
          encryptionEnabled: true,
          dataResidency: true,
          auditLogging: true,
          patientData: true
        },
        deployment: {
          version: '2.4.1',
          lastDeployed: '2024-01-15T08:30:00Z',
          deployedBy: 'DevOps Team',
          branch: 'main',
          commit: '7a8b9c2d'
        },
        monitoring: {
          alertsEnabled: true,
          backupEnabled: true,
          monitoringAgent: true,
          logShipping: true
        }
      },
      {
        id: 'server-003',
        name: 'medical-db-01',
        type: 'database',
        environment: 'production',
        status: 'healthy',
        region: 'us-east-1',
        zone: 'us-east-1c',
        specs: {
          cpu: {
            cores: 32,
            usage: 58.9,
            model: 'Intel Xeon Platinum 8175M'
          },
          memory: {
            total: 128,
            used: 89.6,
            usage: 70.0
          },
          disk: {
            total: 4000,
            used: 2340,
            usage: 58.5,
            type: 'NVMe'
          },
          network: {
            bandwidth: 25000,
            usage: 8900,
            latency: 8
          }
        },
        services: [
          { name: 'postgresql', status: 'running', port: 5432, health: 100 },
          { name: 'pgbouncer', status: 'running', port: 6432, health: 99 },
          { name: 'backup-agent', status: 'running', port: 9001, health: 98 }
        ],
        metrics: {
          uptime: 99.95,
          responseTime: 8,
          requests: 567890,
          errors: 12,
          load: 3.67
        },
        medical: {
          hipaaCompliant: true,
          encryptionEnabled: true,
          dataResidency: true,
          auditLogging: true,
          patientData: true
        },
        deployment: {
          version: 'PostgreSQL 15.4',
          lastDeployed: '2024-01-10T12:00:00Z',
          deployedBy: 'Database Team',
          branch: 'stable',
          commit: 'db-v15.4'
        },
        monitoring: {
          alertsEnabled: true,
          backupEnabled: true,
          monitoringAgent: true,
          logShipping: true
        }
      },
      {
        id: 'server-004',
        name: 'medical-dicom-01',
        type: 'dicom',
        environment: 'production',
        status: 'healthy',
        region: 'us-east-1',
        zone: 'us-east-1a',
        specs: {
          cpu: {
            cores: 24,
            usage: 71.2,
            model: 'Intel Xeon Gold 6154'
          },
          memory: {
            total: 96,
            used: 67.8,
            usage: 70.6
          },
          disk: {
            total: 8000,
            used: 5640,
            usage: 70.5,
            type: 'SSD'
          },
          network: {
            bandwidth: 40000,
            usage: 15600,
            latency: 5
          }
        },
        services: [
          { name: 'dicom-server', status: 'running', port: 11112, health: 99 },
          { name: 'dicom-processor', status: 'running', port: 8083, health: 97 },
          { name: 'image-cache', status: 'running', port: 6380, health: 100 }
        ],
        metrics: {
          uptime: 99.8,
          responseTime: 156,
          requests: 89012,
          errors: 8,
          load: 5.12
        },
        medical: {
          hipaaCompliant: true,
          encryptionEnabled: true,
          dataResidency: true,
          auditLogging: true,
          patientData: true
        },
        deployment: {
          version: '3.1.2',
          lastDeployed: '2024-01-12T14:00:00Z',
          deployedBy: 'Medical Team',
          branch: 'medical-v3',
          commit: 'med-3.1.2'
        },
        monitoring: {
          alertsEnabled: true,
          backupEnabled: true,
          monitoringAgent: true,
          logShipping: true
        }
      }
    ];
    setServers(mockServers);

    const mockDatabases: DatabaseCluster[] = [
      {
        id: 'db-cluster-001',
        name: 'medical-primary',
        type: 'postgresql',
        status: 'healthy',
        environment: 'production',
        cluster: {
          primary: 'medical-db-01',
          replicas: ['medical-db-02', 'medical-db-03'],
          shards: 1,
          replication: true
        },
        performance: {
          connections: {
            active: 156,
            max: 400,
            usage: 39.0
          },
          queries: {
            total: 2345678,
            slow: 23,
            avgTime: 12.5,
            qps: 456
          },
          storage: {
            size: 2340,
            used: 1876,
            growth: 4.2
          },
          memory: {
            cache: 45.6,
            buffer: 23.4,
            usage: 69.0
          }
        },
        medical: {
          patientRecords: 1234567,
          studyData: 2345678,
          aiModels: 156,
          auditLogs: 5678901,
          backupRetention: 7
        },
        backup: {
          lastBackup: '2024-01-15T06:00:00Z',
          frequency: 'daily',
          retention: '30 days',
          encrypted: true,
          verified: true
        },
        security: {
          ssl: true,
          encryption: true,
          authentication: true,
          authorization: true,
          firewall: true
        }
      },
      {
        id: 'db-cluster-002',
        name: 'medical-cache',
        type: 'redis',
        status: 'healthy',
        environment: 'production',
        cluster: {
          primary: 'redis-01',
          replicas: ['redis-02', 'redis-03'],
          shards: 3,
          replication: true
        },
        performance: {
          connections: {
            active: 89,
            max: 1000,
            usage: 8.9
          },
          queries: {
            total: 12345678,
            slow: 5,
            avgTime: 0.8,
            qps: 2340
          },
          storage: {
            size: 156,
            used: 89,
            growth: 1.2
          },
          memory: {
            cache: 89.0,
            buffer: 0,
            usage: 89.0
          }
        },
        medical: {
          patientRecords: 0,
          studyData: 0,
          aiModels: 0,
          auditLogs: 0,
          backupRetention: 1
        },
        backup: {
          lastBackup: '2024-01-15T12:00:00Z',
          frequency: 'hourly',
          retention: '7 days',
          encrypted: true,
          verified: true
        },
        security: {
          ssl: true,
          encryption: true,
          authentication: true,
          authorization: true,
          firewall: true
        }
      }
    ];
    setDatabases(mockDatabases);

    const mockNetworkMetrics: NetworkMetrics = {
      global: {
        totalBandwidth: 100000,
        usedBandwidth: 34567,
        latency: 85,
        packetLoss: 0.02,
        uptime: 99.9
      },
      regions: [
        {
          region: 'us-east-1',
          bandwidth: 40000,
          latency: 12,
          connections: 15678,
          errors: 23
        },
        {
          region: 'eu-west-1',
          bandwidth: 30000,
          latency: 18,
          connections: 12345,
          errors: 18
        },
        {
          region: 'ap-southeast-1',
          bandwidth: 20000,
          latency: 25,
          connections: 8901,
          errors: 12
        }
      ],
      cdn: {
        hitRate: 89.2,
        missRate: 10.8,
        bandwidth: 45000,
        requests: 2345678,
        origin: 234567
      },
      security: {
        ddosBlocked: 156,
        maliciousIPs: 234,
        securityRules: 1245,
        firewallHits: 5678
      }
    };
    setNetworkMetrics(mockNetworkMetrics);

    const mockAlerts: InfrastructureAlert[] = [
      {
        id: 'alert-001',
        type: 'server',
        severity: 'warning',
        title: 'High CPU Usage',
        message: 'Server medical-api-01 CPU usage exceeded 80% threshold',
        source: 'medical-api-01',
        timestamp: '2024-01-15T14:25:00Z',
        acknowledged: false,
        resolved: false,
        impact: 'medium',
        medicalImpact: true,
        assignee: 'Infrastructure Team'
      },
      {
        id: 'alert-002',
        type: 'database',
        severity: 'critical',
        title: 'Slow Query Alert',
        message: 'Database queries exceeding 5 second timeout threshold',
        source: 'medical-primary',
        timestamp: '2024-01-15T13:45:00Z',
        acknowledged: true,
        resolved: false,
        impact: 'high',
        medicalImpact: true,
        assignee: 'Database Team'
      },
      {
        id: 'alert-003',
        type: 'network',
        severity: 'info',
        title: 'Bandwidth Usage High',
        message: 'Network bandwidth usage approaching 80% capacity',
        source: 'us-east-1',
        timestamp: '2024-01-15T12:30:00Z',
        acknowledged: false,
        resolved: false,
        impact: 'low',
        medicalImpact: false
      }
    ];
    setInfrastructureAlerts(mockAlerts);
  }, []);

  const handleServerSelect = (serverId: string) => {
    setSelectedServer(serverId);
  };

  const handleAlertAcknowledge = (alertId: string) => {
    setInfrastructureAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'offline': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'maintenance': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon className="w-4 h-4" />;
      case 'warning': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'critical': return <XCircleIcon className="w-4 h-4" />;
      case 'offline': return <StopIcon className="w-4 h-4" />;
      case 'maintenance': return <Cog6ToothIcon className="w-4 h-4" />;
      default: return <InformationCircleIcon className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web': return <ComputerDesktopIcon className="w-5 h-5 text-blue-600" />;
      case 'api': return <CpuChipIcon className="w-5 h-5 text-green-600" />;
      case 'database': return <CircleStackIcon className="w-5 h-5 text-purple-600" />;
      case 'cache': return <BoltIcon className="w-5 h-5 text-yellow-600" />;
      case 'ml': return <BeakerIcon className="w-5 h-5 text-orange-600" />;
      case 'dicom': return <HeartIcon className="w-5 h-5 text-red-600" />;
      case 'analytics': return <ChartBarIcon className="w-5 h-5 text-indigo-600" />;
      default: return <ServerIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'text-red-600';
    if (usage >= 80) return 'text-orange-600';
    if (usage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} TB`;
    return `${bytes} GB`;
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const filteredServers = servers.filter(server => {
    const matchesEnvironment = filterEnvironment === 'all' || server.environment === filterEnvironment;
    const matchesStatus = filterStatus === 'all' || server.status === filterStatus;
    return matchesEnvironment && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <ServerIcon className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-medsight-primary">Production Infrastructure</h2>
              <p className="text-gray-600">Medical-grade system management and monitoring</p>
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

        {/* Infrastructure Status */}
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ServerIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Infrastructure Status: Operational - {servers.filter(s => s.status === 'healthy').length}/{servers.length} Servers Healthy
            </span>
            <span className="ml-auto text-xs text-green-600">
              {infrastructureAlerts.filter(a => !a.acknowledged && a.severity === 'critical').length} Critical Alerts
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
            onClick={() => setViewMode('servers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'servers'
                ? 'bg-medsight-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ServerIcon className="w-4 h-4 mr-2 inline" />
            Servers ({servers.length})
          </button>
          <button
            onClick={() => setViewMode('databases')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'databases'
                ? 'bg-medsight-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <CircleStackIcon className="w-4 h-4 mr-2 inline" />
            Databases ({databases.length})
          </button>
          <button
            onClick={() => setViewMode('network')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'network'
                ? 'bg-medsight-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <WifiIcon className="w-4 h-4 mr-2 inline" />
            Network
          </button>
        </div>
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <>
          {/* Infrastructure Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Servers</p>
                  <p className="text-2xl font-bold text-medsight-primary">
                    {servers.length}
                  </p>
                  <p className="text-sm text-medsight-normal">
                    {servers.filter(s => s.status === 'healthy').length} healthy
                  </p>
                </div>
                <ServerIcon className="w-8 h-8 text-medsight-primary" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Database Clusters</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {databases.length}
                  </p>
                  <p className="text-sm text-purple-600">
                    {databases.filter(d => d.status === 'healthy').length} healthy
                  </p>
                </div>
                <CircleStackIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Network Uptime</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {networkMetrics?.global.uptime}%
                  </p>
                  <p className="text-sm text-blue-600">
                    {networkMetrics?.global.latency}ms latency
                  </p>
                </div>
                <WifiIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical Alerts</p>
                  <p className="text-2xl font-bold text-red-600">
                    {infrastructureAlerts.filter(a => a.severity === 'critical' && !a.resolved).length}
                  </p>
                  <p className="text-sm text-red-600">
                    {infrastructureAlerts.filter(a => a.medicalImpact && !a.resolved).length} medical impact
                  </p>
                </div>
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Infrastructure Alerts</h3>
              <span className="text-sm text-gray-600">
                {infrastructureAlerts.filter(alert => !alert.acknowledged).length} unacknowledged
              </span>
            </div>
            <div className="space-y-3">
              {infrastructureAlerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.severity === 'critical' ? 'text-red-600 bg-red-50 border-red-200' :
                    alert.severity === 'warning' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                    'text-blue-600 bg-blue-50 border-blue-200'
                  } ${alert.acknowledged ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {alert.severity === 'critical' ? <ExclamationTriangleIcon className="w-5 h-5 mt-0.5" /> :
                       alert.severity === 'warning' ? <ExclamationCircleIcon className="w-5 h-5 mt-0.5" /> :
                       <InformationCircleIcon className="w-5 h-5 mt-0.5" />}
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm mt-1">{alert.message}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs">
                          <span>Source: {alert.source}</span>
                          <span>Type: {alert.type}</span>
                          <span>Impact: {alert.impact}</span>
                          {alert.medicalImpact && (
                            <span className="flex items-center space-x-1 text-red-600">
                              <HeartIcon className="w-3 h-3" />
                              <span>Medical Impact</span>
                            </span>
                          )}
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

      {/* Servers View */}
      {viewMode === 'servers' && (
        <>
          {/* Filters */}
          <div className="medsight-glass p-4 rounded-xl">
            <div className="flex items-center space-x-4">
              <select
                value={filterEnvironment}
                onChange={(e) => setFilterEnvironment(e.target.value)}
                className="input-medsight"
              >
                <option value="all">All Environments</option>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-medsight"
              >
                <option value="all">All Status</option>
                <option value="healthy">Healthy</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
                <option value="offline">Offline</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Servers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredServers.map((server) => (
              <div 
                key={server.id}
                className={`medsight-glass p-6 rounded-xl border cursor-pointer transition-colors ${
                  selectedServer === server.id
                    ? 'border-medsight-primary bg-medsight-primary/5'
                    : 'border-gray-200 hover:border-medsight-primary/50'
                }`}
                onClick={() => handleServerSelect(server.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(server.type)}
                    <div>
                      <h3 className="font-semibold text-lg">{server.name}</h3>
                      <p className="text-sm text-gray-600">{server.region} - {server.zone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(server.status)}`}>
                      {getStatusIcon(server.status)}
                      <span className="font-medium capitalize">{server.status}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      server.environment === 'production' ? 'bg-green-100 text-green-800' :
                      server.environment === 'staging' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {server.environment}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium mb-2">CPU & Memory</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">CPU:</span>
                        <span className={`font-medium ${getUsageColor(server.specs.cpu.usage)}`}>
                          {server.specs.cpu.usage}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Memory:</span>
                        <span className={`font-medium ${getUsageColor(server.specs.memory.usage)}`}>
                          {server.specs.memory.usage}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Disk:</span>
                        <span className={`font-medium ${getUsageColor(server.specs.disk.usage)}`}>
                          {server.specs.disk.usage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Performance</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Uptime:</span>
                        <span className="font-medium">{server.metrics.uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Response:</span>
                        <span className="font-medium">{server.metrics.responseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Load:</span>
                        <span className="font-medium">{server.metrics.load}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Services ({server.services.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {server.services.map((service) => (
                      <span 
                        key={service.name}
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          service.status === 'running' ? 'bg-green-100 text-green-800' :
                          service.status === 'stopped' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {service.name}:{service.port}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs">
                  {server.medical.hipaaCompliant && (
                    <span className="flex items-center space-x-1 text-green-600">
                      <ShieldCheckIcon className="w-3 h-3" />
                      <span>HIPAA</span>
                    </span>
                  )}
                  {server.medical.encryptionEnabled && (
                    <span className="flex items-center space-x-1 text-blue-600">
                      <LockClosedIcon className="w-3 h-3" />
                      <span>Encrypted</span>
                    </span>
                  )}
                  {server.medical.auditLogging && (
                    <span className="flex items-center space-x-1 text-purple-600">
                      <DocumentTextIcon className="w-3 h-3" />
                      <span>Audit</span>
                    </span>
                  )}
                  <span className="text-gray-600">v{server.deployment.version}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Databases View */}
      {viewMode === 'databases' && (
        <div className="space-y-6">
          {databases.map((database) => (
            <div key={database.id} className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <CircleStackIcon className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-xl">{database.name}</h3>
                    <p className="text-gray-600">{database.type} - {database.environment}</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${getStatusColor(database.status)}`}>
                  {getStatusIcon(database.status)}
                  <span className="font-medium capitalize">{database.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Cluster Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Primary:</span>
                      <span className="font-medium">{database.cluster.primary}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Replicas:</span>
                      <span className="font-medium">{database.cluster.replicas.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shards:</span>
                      <span className="font-medium">{database.cluster.shards}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Replication:</span>
                      <span className={`font-medium ${database.cluster.replication ? 'text-green-600' : 'text-red-600'}`}>
                        {database.cluster.replication ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Connections:</span>
                      <span className="font-medium">{database.performance.connections.active}/{database.performance.connections.max}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">QPS:</span>
                      <span className="font-medium">{database.performance.queries.qps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Query:</span>
                      <span className="font-medium">{database.performance.queries.avgTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Slow Queries:</span>
                      <span className={`font-medium ${database.performance.queries.slow > 50 ? 'text-red-600' : 'text-green-600'}`}>
                        {database.performance.queries.slow}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Storage</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{formatBytes(database.performance.storage.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Used:</span>
                      <span className="font-medium">{formatBytes(database.performance.storage.used)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Growth:</span>
                      <span className="font-medium">{database.performance.storage.growth}% daily</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cache Hit:</span>
                      <span className="font-medium">{database.performance.memory.cache}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Medical Data</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patients:</span>
                      <span className="font-medium">{formatNumber(database.medical.patientRecords)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Studies:</span>
                      <span className="font-medium">{formatNumber(database.medical.studyData)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">AI Models:</span>
                      <span className="font-medium">{database.medical.aiModels}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Audit Logs:</span>
                      <span className="font-medium">{formatNumber(database.medical.auditLogs)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">
                      Last Backup: {new Date(database.backup.lastBackup).toLocaleString()}
                    </span>
                    <span className="text-gray-600">Frequency: {database.backup.frequency}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-xs">
                      {database.security.ssl && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          SSL
                        </span>
                      )}
                      {database.security.encryption && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Encrypted
                        </span>
                      )}
                      {database.backup.verified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Verified
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

      {/* Network View */}
      {viewMode === 'network' && networkMetrics && (
        <>
          {/* Global Network Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Global Bandwidth</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {((networkMetrics.global.usedBandwidth / networkMetrics.global.totalBandwidth) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatNumber(networkMetrics.global.usedBandwidth)} / {formatNumber(networkMetrics.global.totalBandwidth)} Mbps
                  </p>
                </div>
                <WifiIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Global Latency</p>
                  <p className="text-2xl font-bold text-green-600">
                    {networkMetrics.global.latency}ms
                  </p>
                  <p className="text-sm text-gray-600">
                    {networkMetrics.global.packetLoss}% packet loss
                  </p>
                </div>
                <SignalIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">CDN Hit Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {networkMetrics.cdn.hitRate}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatNumber(networkMetrics.cdn.requests)} requests
                  </p>
                </div>
                <CloudIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Security Events</p>
                  <p className="text-2xl font-bold text-red-600">
                    {networkMetrics.security.ddosBlocked}
                  </p>
                  <p className="text-sm text-gray-600">
                    DDoS attacks blocked
                  </p>
                </div>
                <ShieldCheckIcon className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Regional Network Performance */}
          <div className="medsight-glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-medsight-primary mb-4">Regional Network Performance</h3>
            <div className="space-y-4">
              {networkMetrics.regions.map((region) => (
                <div key={region.region} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{region.region}</h4>
                    <div className="flex items-center space-x-4 text-sm">
                      <span>Bandwidth: {formatNumber(region.bandwidth)} Mbps</span>
                      <span>Latency: {region.latency}ms</span>
                      <span>Connections: {formatNumber(region.connections)}</span>
                      <span className={`font-medium ${region.errors > 100 ? 'text-red-600' : 'text-green-600'}`}>
                        Errors: {region.errors}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Bandwidth Usage</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min((region.bandwidth / 50000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Latency</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            region.latency > 50 ? 'bg-red-600' : 
                            region.latency > 25 ? 'bg-yellow-600' : 'bg-green-600'
                          }`}
                          style={{ width: `${Math.min((region.latency / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Connections</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${Math.min((region.connections / 20000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Error Rate</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            region.errors > 100 ? 'bg-red-600' : 
                            region.errors > 50 ? 'bg-yellow-600' : 'bg-green-600'
                          }`}
                          style={{ width: `${Math.min((region.errors / 200) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Medical Compliance Footer */}
      <div className="medsight-glass p-4 rounded-xl border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-medsight-normal" />
            <span className="text-sm font-medium text-medsight-normal">Production Infrastructure Compliance</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-medsight-normal">Medical-Grade Infrastructure</span>
            <span className="text-medsight-normal">99.9% SLA</span>
            <span className="text-medsight-normal">24/7 Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionInfrastructureUI; 