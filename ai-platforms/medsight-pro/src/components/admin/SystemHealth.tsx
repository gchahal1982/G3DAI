'use client';

import React, { useState, useEffect } from 'react';
import { 
  ServerIcon,
  CircleStackIcon,
  CloudIcon,
  WifiIcon,
  CpuChipIcon,
  BoltIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ChartBarIcon,
  EyeIcon,
  Cog6ToothIcon,
  SparklesIcon,
  HeartIcon,
  FireIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import {
  ServerIcon as ServerIconSolid,
  CircleStackIcon as CircleStackIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  CloudIcon as CloudIconSolid,
  WifiIcon as WifiIconSolid,
  EyeIcon as EyeIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  ClockIcon as ClockIconSolid,
  FireIcon as FireIconSolid,
  HeartIcon as HeartIconSolid,
  SparklesIcon as SparklesIconSolid
} from '@heroicons/react/24/solid';

interface SystemService {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance' | 'degraded';
  uptime: number;
  responseTime: number;
  lastCheck: Date;
  description: string;
  icon: React.ComponentType<any>;
  endpoint?: string;
  version?: string;
  instances?: number;
  memory?: number;
  cpu?: number;
}

interface SystemHealthData {
  overall: 'healthy' | 'warning' | 'critical';
  services: SystemService[];
  performance: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };
  uptime: string;
  lastIncident: string;
  activeIncidents: number;
  scheduledMaintenance: MaintenanceWindow[];
}

interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'in-progress' | 'completed';
  affectedServices: string[];
}

interface SystemHealthProps {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function SystemHealth({ onRefresh, refreshing = false }: SystemHealthProps) {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadSystemHealth();
  }, []);

  const loadSystemHealth = async () => {
    try {
      setLoading(true);
      
      // Mock system health data
      const mockData: SystemHealthData = {
        overall: 'healthy',
        services: [
          {
            id: 'dicom-server',
            name: 'DICOM Server',
            status: 'online',
            uptime: 99.9,
            responseTime: 45,
            lastCheck: new Date(Date.now() - 30000),
            description: 'DICOM image storage and retrieval service',
            icon: ServerIconSolid,
            endpoint: 'dicom.medsight.local:11112',
            version: '3.6.7',
            instances: 3,
            memory: 68,
            cpu: 45
          },
          {
            id: 'ai-engine',
            name: 'AI Processing Engine',
            status: 'online',
            uptime: 99.8,
            responseTime: 120,
            lastCheck: new Date(Date.now() - 15000),
            description: 'Medical AI analysis and inference service',
            icon: SparklesIconSolid,
            endpoint: 'ai.medsight.local:8080',
            version: '2.1.4',
            instances: 5,
            memory: 85,
            cpu: 72
          },
          {
            id: 'database',
            name: 'Database Cluster',
            status: 'online',
            uptime: 99.95,
            responseTime: 12,
            lastCheck: new Date(Date.now() - 10000),
            description: 'PostgreSQL database cluster for medical data',
            icon: CircleStackIconSolid,
            endpoint: 'db.medsight.local:5432',
            version: '15.4',
            instances: 3,
            memory: 78,
            cpu: 34
          },
          {
            id: 'pacs',
            name: 'PACS System',
            status: 'online',
            uptime: 99.7,
            responseTime: 89,
            lastCheck: new Date(Date.now() - 45000),
            description: 'Picture Archiving and Communication System',
            icon: CircleStackIconSolid,
            endpoint: 'pacs.medsight.local:104',
            version: '4.2.1',
            instances: 2,
            memory: 92,
            cpu: 56
          },
          {
            id: 'auth-service',
            name: 'Authentication Service',
            status: 'online',
            uptime: 99.9,
            responseTime: 34,
            lastCheck: new Date(Date.now() - 20000),
            description: 'User authentication and authorization',
            icon: ShieldCheckIconSolid,
            endpoint: 'auth.medsight.local:3000',
            version: '1.8.2',
            instances: 4,
            memory: 45,
            cpu: 28
          },
          {
            id: 'storage',
            name: 'Storage System',
            status: 'degraded',
            uptime: 98.5,
            responseTime: 234,
            lastCheck: new Date(Date.now() - 60000),
            description: 'Distributed file storage for medical images',
            icon: CloudIconSolid,
            endpoint: 'storage.medsight.local:9000',
            version: '7.0.33',
            instances: 6,
            memory: 94,
            cpu: 67
          },
          {
            id: 'network',
            name: 'Network Infrastructure',
            status: 'online',
            uptime: 99.8,
            responseTime: 8,
            lastCheck: new Date(Date.now() - 5000),
            description: 'Core network and connectivity services',
            icon: WifiIconSolid,
            endpoint: 'network.medsight.local',
            version: '2.4.1',
            instances: 8,
            memory: 23,
            cpu: 15
          },
          {
            id: 'monitoring',
            name: 'Monitoring System',
            status: 'online',
            uptime: 99.9,
            responseTime: 67,
            lastCheck: new Date(Date.now() - 25000),
            description: 'System monitoring and alerting service',
            icon: EyeIconSolid,
            endpoint: 'monitor.medsight.local:9090',
            version: '2.40.7',
            instances: 2,
            memory: 56,
            cpu: 38
          }
        ],
        performance: {
          cpu: 48,
          memory: 67,
          storage: 82,
          network: 91
        },
        uptime: '99.9%',
        lastIncident: '15 days ago',
        activeIncidents: 0,
        scheduledMaintenance: [
          {
            id: 'maint-001',
            title: 'Database Maintenance',
            description: 'Routine database optimization and index rebuilding',
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
            status: 'scheduled',
            affectedServices: ['database']
          },
          {
            id: 'maint-002',
            title: 'AI Model Update',
            description: 'Deploy new AI model version with improved accuracy',
            startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
            status: 'scheduled',
            affectedServices: ['ai-engine']
          }
        ]
      };

      setHealthData(mockData);
    } catch (error) {
      console.error('Error loading system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'maintenance': return 'text-blue-600 bg-blue-50';
      case 'offline': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return CheckCircleIconSolid;
      case 'degraded': return ExclamationTriangleIconSolid;
      case 'maintenance': return Cog6ToothIconSolid;
      case 'offline': return FireIconSolid;
      default: return ClockIconSolid;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPerformanceColor = (value: number) => {
    if (value > 80) return 'text-red-500';
    if (value > 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  const handleRefresh = () => {
    loadSystemHealth();
    if (onRefresh) onRefresh();
  };

  if (loading) {
    return (
      <div className="medsight-glass rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="medsight-glass rounded-xl p-6">
        <div className="text-center text-red-600">
          <FireIconSolid className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load System Health</h3>
          <p className="text-sm mb-4">Unable to retrieve system health data</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 
            className="text-2xl font-bold text-slate-800"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            System Health
          </h2>
          <p 
            className="text-slate-600 mt-1"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            Real-time monitoring of all system components
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              healthData.overall === 'healthy' ? 'bg-green-500 animate-pulse' :
              healthData.overall === 'warning' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium text-slate-700 capitalize">
              {healthData.overall}
            </span>
          </div>
          <div className="flex bg-white/70 border border-white/20 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-white/70 border border-white/20 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="medsight-glass rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">System Uptime</span>
            <HeartIconSolid className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">{healthData.uptime}</div>
        </div>
        <div className="medsight-glass rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Active Services</span>
            <ServerIconSolid className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {healthData.services.filter(s => s.status === 'online').length}/{healthData.services.length}
          </div>
        </div>
        <div className="medsight-glass rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Active Incidents</span>
            <ExclamationTriangleIconSolid className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{healthData.activeIncidents}</div>
        </div>
        <div className="medsight-glass rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Last Incident</span>
            <ClockIconSolid className="w-5 h-5 text-slate-500" />
          </div>
          <div className="text-sm font-medium text-slate-700">{healthData.lastIncident}</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="medsight-glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Object.entries(healthData.performance).map(([metric, value]) => (
            <div key={metric} className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-slate-200"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - value / 100)}`}
                    className={`transition-all duration-500 ${getPerformanceColor(value)}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-700">{value}%</span>
                </div>
              </div>
              <span className="text-sm text-slate-600 capitalize font-medium">{metric}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Services Status */}
      <div className="medsight-glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Service Status</h3>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthData.services.map((service) => {
              const StatusIcon = getStatusIcon(service.status);
              return (
                <div
                  key={service.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedService === service.id ? 'border-blue-500 bg-blue-50' : 'border-white/20 bg-white/50'
                  }`}
                  onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <service.icon className="w-8 h-8 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{service.name}</h4>
                        <p className="text-xs text-slate-600">{service.version}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {service.status}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Uptime</span>
                      <span className="font-medium text-slate-800">{service.uptime}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Response Time</span>
                      <span className="font-medium text-slate-800">{service.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Last Check</span>
                      <span className="font-medium text-slate-800">{formatTimeAgo(service.lastCheck)}</span>
                    </div>
                  </div>
                  
                  {selectedService === service.id && (
                    <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                      <p className="text-xs text-slate-600">{service.description}</p>
                      {service.endpoint && (
                        <div className="text-xs text-slate-600">
                          <span className="font-medium">Endpoint:</span> {service.endpoint}
                        </div>
                      )}
                      {service.instances && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Instances:</span>
                          <span className="font-medium">{service.instances}</span>
                        </div>
                      )}
                      {service.memory && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Memory Usage:</span>
                          <span className="font-medium">{service.memory}%</span>
                        </div>
                      )}
                      {service.cpu && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">CPU Usage:</span>
                          <span className="font-medium">{service.cpu}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {healthData.services.map((service) => {
              const StatusIcon = getStatusIcon(service.status);
              return (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/50 border border-white/20 hover:bg-white/70 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <service.icon className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-slate-800">{service.name}</h4>
                      <p className="text-sm text-slate-600">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-800">{service.uptime}%</div>
                      <div className="text-xs text-slate-600">Uptime</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-800">{service.responseTime}ms</div>
                      <div className="text-xs text-slate-600">Response</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-800">{formatTimeAgo(service.lastCheck)}</div>
                      <div className="text-xs text-slate-600">Last Check</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {service.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scheduled Maintenance */}
      {healthData.scheduledMaintenance.length > 0 && (
        <div className="medsight-glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Scheduled Maintenance</h3>
          <div className="space-y-4">
            {healthData.scheduledMaintenance.map((maintenance) => (
              <div key={maintenance.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <h4 className="font-semibold text-blue-800">{maintenance.title}</h4>
                  <p className="text-sm text-blue-600 mt-1">{maintenance.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
                    <span>Start: {formatDate(maintenance.startTime)}</span>
                    <span>End: {formatDate(maintenance.endTime)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {maintenance.status}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {maintenance.affectedServices.length} service(s)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 