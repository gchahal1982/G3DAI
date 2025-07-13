'use client';

/**
 * MedSight Pro - Uptime Monitoring Dashboard
 * Comprehensive uptime monitoring with system health visualization
 * 
 * Features:
 * - Real-time uptime monitoring
 * - System health visualization
 * - Alert management
 * - Performance metrics display
 * - Medical service status
 * - SLA compliance tracking
 * - Incident management
 * - Emergency protocols
 * 
 * Medical Standards: FDA Class II, HIPAA, DICOM, HL7 FHIR
 * @version 1.0.0
 * @author MedSight Pro Development Team
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  HeartIcon,
  ShieldCheckIcon,
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon as DatabaseIcon,
  CloudIcon,
  BellIcon,
  EyeIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// Types
interface UptimeMetrics {
  overallUptime: number;
  slaCompliance: boolean;
  lastIncident: Date | null;
  currentStatus: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  totalServices: number;
  healthyServices: number;
  degradedServices: number;
  unhealthyServices: number;
  criticalAlerts: number;
  totalDowntime: number; // minutes this month
  maxAllowedDowntime: number; // minutes per month
}

interface ServiceStatus {
  id: string;
  name: string;
  type: 'api' | 'database' | 'storage' | 'compute' | 'dicom' | 'ai' | 'streaming';
  status: 'healthy' | 'degraded' | 'unhealthy' | 'offline' | 'maintenance';
  uptime: number; // percentage
  responseTime: number; // milliseconds
  lastHealthCheck: Date;
  medicalCritical: boolean;
  hipaaCompliant: boolean;
  healthScore: number; // 0-100
  issues: string[];
}

interface IncidentInfo {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  startTime: Date;
  endTime?: Date;
  affectedServices: string[];
  medicalImpact: boolean;
  description: string;
}

interface AlertInfo {
  id: string;
  type: 'performance' | 'availability' | 'medical' | 'compliance' | 'security';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  medicalImpact: boolean;
  patientSafety: boolean;
}

const UptimeDashboard: React.FC = () => {
  const [uptimeMetrics, setUptimeMetrics] = useState<UptimeMetrics | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [incidents, setIncidents] = useState<IncidentInfo[]>([]);
  const [alerts, setAlerts] = useState<AlertInfo[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'incidents' | 'alerts' | 'metrics'>('overview');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const initializeMockData = () => {
      // Mock uptime metrics
      const mockMetrics: UptimeMetrics = {
        overallUptime: 99.87,
        slaCompliance: true,
        lastIncident: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        currentStatus: 'healthy',
        totalServices: 12,
        healthyServices: 10,
        degradedServices: 2,
        unhealthyServices: 0,
        criticalAlerts: 1,
        totalDowntime: 5.2, // minutes this month
        maxAllowedDowntime: 43.2 // 99.9% SLA allows ~43 minutes per month
      };
      setUptimeMetrics(mockMetrics);

      // Mock services
      const mockServices: ServiceStatus[] = [
        {
          id: 'api-primary',
          name: 'Primary API Server',
          type: 'api',
          status: 'healthy',
          uptime: 99.95,
          responseTime: 145,
          lastHealthCheck: new Date(),
          medicalCritical: true,
          hipaaCompliant: true,
          healthScore: 98,
          issues: []
        },
        {
          id: 'db-primary',
          name: 'Medical Database',
          type: 'database',
          status: 'healthy',
          uptime: 99.92,
          responseTime: 85,
          lastHealthCheck: new Date(),
          medicalCritical: true,
          hipaaCompliant: true,
          healthScore: 97,
          issues: []
        },
        {
          id: 'dicom-server',
          name: 'DICOM Server',
          type: 'dicom',
          status: 'degraded',
          uptime: 99.45,
          responseTime: 850,
          lastHealthCheck: new Date(Date.now() - 30000),
          medicalCritical: true,
          hipaaCompliant: true,
          healthScore: 78,
          issues: ['High response time', 'Memory usage elevated']
        },
        {
          id: 'ai-engine',
          name: 'Medical AI Engine',
          type: 'ai',
          status: 'healthy',
          uptime: 99.88,
          responseTime: 320,
          lastHealthCheck: new Date(),
          medicalCritical: true,
          hipaaCompliant: true,
          healthScore: 94,
          issues: []
        },
        {
          id: 'storage-primary',
          name: 'Medical Storage',
          type: 'storage',
          status: 'healthy',
          uptime: 99.98,
          responseTime: 45,
          lastHealthCheck: new Date(),
          medicalCritical: true,
          hipaaCompliant: true,
          healthScore: 99,
          issues: []
        },
        {
          id: 'streaming-service',
          name: 'Medical Streaming',
          type: 'streaming',
          status: 'degraded',
          uptime: 99.12,
          responseTime: 1200,
          lastHealthCheck: new Date(Date.now() - 45000),
          medicalCritical: false,
          hipaaCompliant: true,
          healthScore: 72,
          issues: ['Bandwidth limitations', 'Connection timeouts']
        }
      ];
      setServices(mockServices);

      // Mock incidents
      const mockIncidents: IncidentInfo[] = [
        {
          id: 'incident-1',
          title: 'DICOM Server Performance Degradation',
          severity: 'medium',
          status: 'monitoring',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          affectedServices: ['dicom-server'],
          medicalImpact: true,
          description: 'DICOM server experiencing elevated response times due to high memory usage'
        },
        {
          id: 'incident-2',
          title: 'Streaming Service Intermittent Issues',
          severity: 'low',
          status: 'identified',
          startTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          affectedServices: ['streaming-service'],
          medicalImpact: false,
          description: 'Intermittent connection timeouts affecting medical video streaming'
        }
      ];
      setIncidents(mockIncidents);

      // Mock alerts
      const mockAlerts: AlertInfo[] = [
        {
          id: 'alert-1',
          type: 'performance',
          severity: 'warning',
          message: 'DICOM server response time above threshold (850ms)',
          timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          acknowledged: false,
          medicalImpact: true,
          patientSafety: false
        },
        {
          id: 'alert-2',
          type: 'availability',
          severity: 'info',
          message: 'Streaming service experiencing intermittent connectivity',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          acknowledged: true,
          medicalImpact: false,
          patientSafety: false
        },
        {
          id: 'alert-3',
          type: 'medical',
          severity: 'critical',
          message: 'Medical database connection pool near capacity',
          timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
          acknowledged: false,
          medicalImpact: true,
          patientSafety: true
        }
      ];
      setAlerts(mockAlerts);

      setLoading(false);
    };

    initializeMockData();
  }, []);

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setServices(prev => prev.map(service => ({
        ...service,
        responseTime: service.responseTime + (Math.random() - 0.5) * 20,
        lastHealthCheck: new Date(),
        healthScore: Math.max(0, Math.min(100, service.healthScore + (Math.random() - 0.5) * 5))
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-5 h-5 text-medsight-normal" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="w-5 h-5 text-medsight-pending" />;
      case 'unhealthy':
        return <XCircleIcon className="w-5 h-5 text-medsight-abnormal" />;
      case 'offline':
        return <XCircleIcon className="w-5 h-5 text-medsight-critical" />;
      case 'maintenance':
        return <Cog6ToothIcon className="w-5 h-5 text-medsight-pending" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getServiceIcon = (type: ServiceStatus['type']) => {
    switch (type) {
      case 'api':
        return <ServerIcon className="w-6 h-6" />;
      case 'database':
        return <DatabaseIcon className="w-6 h-6" />;
      case 'storage':
        return <CloudIcon className="w-6 h-6" />;
      case 'compute':
        return <CpuChipIcon className="w-6 h-6" />;
      case 'dicom':
        return <HeartIcon className="w-6 h-6" />;
      case 'ai':
        return <CpuChipIcon className="w-6 h-6" />;
      case 'streaming':
        return <ArrowPathIcon className="w-6 h-6" />;
      default:
        return <ServerIcon className="w-6 h-6" />;
    }
  };

  const getSeverityColor = (severity: AlertInfo['severity']) => {
    switch (severity) {
      case 'info':
        return 'text-blue-400';
      case 'warning':
        return 'text-medsight-pending';
      case 'critical':
        return 'text-medsight-abnormal';
      case 'emergency':
        return 'text-medsight-critical';
      default:
        return 'text-gray-400';
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const formatResponseTime = (time: number) => {
    return `${Math.round(time)}ms`;
  };

  const formatDuration = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  if (loading) {
    return (
      <div className="medsight-glass p-8 rounded-xl animate-pulse">
        <div className="space-y-4">
          <div className="h-8 bg-medsight-primary/20 rounded w-1/3"></div>
          <div className="h-64 bg-medsight-primary/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-medsight-primary">
            Uptime Monitoring Dashboard
          </h1>
          <p className="text-medsight-primary/70 mt-2">
            Real-time system health and availability monitoring
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`btn-medsight px-4 py-2 rounded-lg flex items-center space-x-2 ${
              autoRefresh ? 'bg-medsight-normal/20' : 'bg-gray-500/20'
            }`}
          >
            <ArrowPathIcon className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>Auto Refresh</span>
          </button>
          
          <div className="flex items-center space-x-2 text-sm text-medsight-primary/70">
            <ClockIcon className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      {uptimeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-medsight-primary/70 text-sm font-medium">Overall Uptime</h3>
                <p className="text-2xl font-bold text-medsight-primary mt-1">
                  {formatUptime(uptimeMetrics.overallUptime)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                uptimeMetrics.slaCompliance ? 'bg-medsight-normal/20' : 'bg-medsight-abnormal/20'
              }`}>
                <CheckCircleIcon className={`w-6 h-6 ${
                  uptimeMetrics.slaCompliance ? 'text-medsight-normal' : 'text-medsight-abnormal'
                }`} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  uptimeMetrics.slaCompliance 
                    ? 'bg-medsight-normal/20 text-medsight-normal' 
                    : 'bg-medsight-abnormal/20 text-medsight-abnormal'
                }`}>
                  {uptimeMetrics.slaCompliance ? 'SLA Compliant' : 'SLA Violation'}
                </span>
              </div>
            </div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-medsight-primary/70 text-sm font-medium">System Status</h3>
                <p className="text-lg font-semibold text-medsight-primary mt-1 capitalize">
                  {uptimeMetrics.currentStatus}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                uptimeMetrics.currentStatus === 'healthy' ? 'bg-medsight-normal/20' :
                uptimeMetrics.currentStatus === 'degraded' ? 'bg-medsight-pending/20' :
                'bg-medsight-abnormal/20'
              }`}>
                {uptimeMetrics.currentStatus === 'healthy' ? (
                  <CheckCircleIcon className="w-6 h-6 text-medsight-normal" />
                ) : uptimeMetrics.currentStatus === 'degraded' ? (
                  <ExclamationTriangleIcon className="w-6 h-6 text-medsight-pending" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-medsight-abnormal" />
                )}
              </div>
            </div>
            <div className="mt-4 text-sm text-medsight-primary/70">
              <span>{uptimeMetrics.healthyServices}/{uptimeMetrics.totalServices} services healthy</span>
            </div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-medsight-primary/70 text-sm font-medium">Downtime This Month</h3>
                <p className="text-2xl font-bold text-medsight-primary mt-1">
                  {uptimeMetrics.totalDowntime.toFixed(1)}m
                </p>
              </div>
              <div className="p-3 rounded-lg bg-medsight-primary/20">
                <ClockIcon className="w-6 h-6 text-medsight-primary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-medsight-primary/70">
                <span>Budget: {uptimeMetrics.maxAllowedDowntime.toFixed(1)}m</span>
                <span>{((1 - uptimeMetrics.totalDowntime / uptimeMetrics.maxAllowedDowntime) * 100).toFixed(0)}% remaining</span>
              </div>
              <div className="w-full bg-medsight-primary/10 rounded-full h-2 mt-2">
                <div 
                  className="bg-medsight-primary h-2 rounded-full"
                  style={{ width: `${Math.min(100, (uptimeMetrics.totalDowntime / uptimeMetrics.maxAllowedDowntime) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-medsight-primary/70 text-sm font-medium">Critical Alerts</h3>
                <p className="text-2xl font-bold text-medsight-primary mt-1">
                  {uptimeMetrics.criticalAlerts}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                uptimeMetrics.criticalAlerts === 0 ? 'bg-medsight-normal/20' : 'bg-medsight-abnormal/20'
              }`}>
                <BellIcon className={`w-6 h-6 ${
                  uptimeMetrics.criticalAlerts === 0 ? 'text-medsight-normal' : 'text-medsight-abnormal'
                }`} />
              </div>
            </div>
            <div className="mt-4">
              {uptimeMetrics.lastIncident ? (
                <p className="text-sm text-medsight-primary/70">
                  Last incident: {formatDuration(uptimeMetrics.lastIncident)}
                </p>
              ) : (
                <p className="text-sm text-medsight-normal">No recent incidents</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="medsight-glass rounded-xl">
        <div className="flex border-b border-medsight-primary/10">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'services', label: 'Services', icon: ServerIcon },
            { id: 'incidents', label: 'Incidents', icon: ExclamationTriangleIcon },
            { id: 'alerts', label: 'Alerts', icon: BellIcon },
            { id: 'metrics', label: 'Metrics', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-medsight-primary text-medsight-primary'
                  : 'border-transparent text-medsight-primary/70 hover:text-medsight-primary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-medsight-primary">Service Health Status</h3>
                <div className="flex space-x-2">
                  <span className="text-sm text-medsight-primary/70">
                    {services.filter(s => s.status === 'healthy').length} healthy,{' '}
                    {services.filter(s => s.status === 'degraded').length} degraded,{' '}
                    {services.filter(s => s.status === 'unhealthy').length} unhealthy
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`medsight-control-glass p-4 rounded-lg cursor-pointer transition-all ${
                      selectedService === service.id ? 'ring-2 ring-medsight-primary' : ''
                    }`}
                    onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-medsight-primary/20 rounded-lg">
                          {getServiceIcon(service.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-medsight-primary">{service.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusIcon(service.status)}
                            <span className="text-sm text-medsight-primary/70 capitalize">
                              {service.status}
                            </span>
                            {service.medicalCritical && (
                              <span className="px-2 py-1 bg-medsight-abnormal/20 text-medsight-abnormal text-xs rounded-full">
                                Critical
                              </span>
                            )}
                            {service.hipaaCompliant && (
                              <ShieldCheckIcon className="w-4 h-4 text-medsight-normal" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-medsight-primary">
                          {formatUptime(service.uptime)}
                        </div>
                        <div className="text-sm text-medsight-primary/70">
                          {formatResponseTime(service.responseTime)}
                        </div>
                      </div>
                    </div>
                    
                    {selectedService === service.id && (
                      <div className="mt-4 pt-4 border-t border-medsight-primary/10">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-medsight-primary/70">Health Score:</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex-1 bg-medsight-primary/10 rounded-full h-2">
                                <div 
                                  className="bg-medsight-primary h-2 rounded-full"
                                  style={{ width: `${service.healthScore}%` }}
                                ></div>
                              </div>
                              <span className="text-medsight-primary font-medium">{service.healthScore}/100</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-medsight-primary/70">Last Check:</span>
                            <p className="text-medsight-primary mt-1">{formatDuration(service.lastHealthCheck)}</p>
                          </div>
                        </div>
                        
                        {service.issues.length > 0 && (
                          <div className="mt-4">
                            <span className="text-medsight-primary/70 text-sm">Current Issues:</span>
                            <ul className="mt-2 space-y-1">
                              {service.issues.map((issue, index) => (
                                <li key={index} className="text-sm text-medsight-pending flex items-center space-x-2">
                                  <ExclamationTriangleIcon className="w-4 h-4" />
                                  <span>{issue}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incidents Tab */}
          {activeTab === 'incidents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-medsight-primary">Active Incidents</h3>
                <span className="text-sm text-medsight-primary/70">{incidents.length} incidents</span>
              </div>
              
              {incidents.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-12 h-12 text-medsight-normal mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-medsight-primary">No Active Incidents</h4>
                  <p className="text-medsight-primary/70">All systems are operating normally</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="medsight-control-glass p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              incident.severity === 'emergency' ? 'bg-medsight-critical/20 text-medsight-critical' :
                              incident.severity === 'critical' ? 'bg-medsight-abnormal/20 text-medsight-abnormal' :
                              incident.severity === 'high' ? 'bg-medsight-pending/20 text-medsight-pending' :
                              incident.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-blue-500/20 text-blue-500'
                            }`}>
                              {incident.severity.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              incident.status === 'resolved' ? 'bg-medsight-normal/20 text-medsight-normal' :
                              incident.status === 'monitoring' ? 'bg-medsight-pending/20 text-medsight-pending' :
                              'bg-medsight-primary/20 text-medsight-primary'
                            }`}>
                              {incident.status.toUpperCase()}
                            </span>
                            {incident.medicalImpact && (
                              <span className="px-2 py-1 bg-medsight-abnormal/20 text-medsight-abnormal text-xs rounded-full">
                                Medical Impact
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-medsight-primary mb-2">{incident.title}</h4>
                          <p className="text-sm text-medsight-primary/70 mb-3">{incident.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-medsight-primary/70">
                            <span>Started: {formatDuration(incident.startTime)}</span>
                            <span>Affected: {incident.affectedServices.join(', ')}</span>
                          </div>
                        </div>
                        <button className="btn-medsight px-3 py-1 text-sm">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-medsight-primary">System Alerts</h3>
                <div className="flex space-x-2">
                  <span className="text-sm text-medsight-primary/70">
                    {alerts.filter(a => !a.acknowledged).length} unacknowledged
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`medsight-control-glass p-4 rounded-lg ${
                    !alert.acknowledged ? 'ring-1 ring-medsight-pending/30' : ''
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          alert.severity === 'emergency' ? 'bg-medsight-critical/20' :
                          alert.severity === 'critical' ? 'bg-medsight-abnormal/20' :
                          alert.severity === 'warning' ? 'bg-medsight-pending/20' :
                          'bg-blue-500/20'
                        }`}>
                          <BellIcon className={`w-4 h-4 ${getSeverityColor(alert.severity)}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.severity === 'emergency' ? 'bg-medsight-critical/20 text-medsight-critical' :
                              alert.severity === 'critical' ? 'bg-medsight-abnormal/20 text-medsight-abnormal' :
                              alert.severity === 'warning' ? 'bg-medsight-pending/20 text-medsight-pending' :
                              'bg-blue-500/20 text-blue-500'
                            }`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="px-2 py-1 bg-medsight-primary/20 text-medsight-primary text-xs rounded-full">
                              {alert.type.toUpperCase()}
                            </span>
                            {alert.medicalImpact && (
                              <HeartIcon className="w-4 h-4 text-medsight-abnormal" />
                            )}
                            {alert.patientSafety && (
                              <ShieldCheckIcon className="w-4 h-4 text-medsight-critical" />
                            )}
                          </div>
                          <p className="text-medsight-primary mt-1">{alert.message}</p>
                          <p className="text-sm text-medsight-primary/70 mt-1">
                            {formatDuration(alert.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!alert.acknowledged && (
                          <button className="btn-medsight px-3 py-1 text-sm">
                            Acknowledge
                          </button>
                        )}
                        <button className="btn-medsight px-3 py-1 text-sm">
                          <DocumentTextIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-medsight-primary">System Overview</h3>
              
              {/* Service Status Grid */}
              <div>
                <h4 className="text-lg font-medium text-medsight-primary mb-4">Service Health</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {services.map((service) => (
                    <div key={service.id} className="medsight-control-glass p-3 rounded-lg text-center">
                      <div className="flex justify-center mb-2">
                        {getServiceIcon(service.type)}
                      </div>
                      <h5 className="text-sm font-medium text-medsight-primary mb-1">
                        {service.name.split(' ')[0]}
                      </h5>
                      <div className="flex justify-center mb-1">
                        {getStatusIcon(service.status)}
                      </div>
                      <p className="text-xs text-medsight-primary/70">
                        {formatUptime(service.uptime)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="text-lg font-medium text-medsight-primary mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {[...incidents, ...alerts.slice(0, 2)].sort((a, b) => 
                    ('startTime' in a ? a.startTime : a.timestamp).getTime() - 
                    ('startTime' in b ? b.startTime : b.timestamp).getTime()
                  ).slice(0, 5).map((item, index) => (
                    <div key={index} className="medsight-control-glass p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-medsight-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-medsight-primary">
                            {'title' in item ? item.title : item.message}
                          </p>
                          <p className="text-xs text-medsight-primary/70">
                            {formatDuration('startTime' in item ? item.startTime : item.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-medsight-primary">Performance Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="medsight-control-glass p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-medsight-primary mb-4">Response Times</h4>
                  <div className="space-y-3">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between">
                        <span className="text-sm text-medsight-primary/70">{service.name}</span>
                        <span className="text-sm font-medium text-medsight-primary">
                          {formatResponseTime(service.responseTime)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="medsight-control-glass p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-medsight-primary mb-4">Health Scores</h4>
                  <div className="space-y-3">
                    {services.map((service) => (
                      <div key={service.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-medsight-primary/70">{service.name}</span>
                          <span className="text-sm font-medium text-medsight-primary">
                            {service.healthScore}/100
                          </span>
                        </div>
                        <div className="w-full bg-medsight-primary/10 rounded-full h-2">
                          <div 
                            className="bg-medsight-primary h-2 rounded-full"
                            style={{ width: `${service.healthScore}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UptimeDashboard; 