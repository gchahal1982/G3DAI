'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ServerIcon,
  SignalIcon,
  BugAntIcon,
  DocumentMagnifyingGlassIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { SecurityMonitoring } from '@/components/security/SecurityMonitoring';
import ThreatDetection from '@/components/security/ThreatDetection';
import StreamMonitoring from '@/components/security/StreamMonitoring';
import { SecurityIncidents } from '@/components/security/SecurityIncidents';
import { SecurityAuditTrail } from '@/components/security/SecurityAuditTrail';
import { SecurityMetrics } from '@/components/security/SecurityMetrics';

interface SecurityDashboardData {
  user: {
    name: string;
    role: string;
    securityClearance: string;
    lastLogin: Date;
  };
  securityStatus: {
    overall: 'secure' | 'monitoring' | 'alert' | 'critical';
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    lastThreatDetected: Date;
    systemsMonitored: number;
    activeThreats: number;
    blockedAttempts: number;
  };
  streamProcessing: {
    status: 'healthy' | 'degraded' | 'error';
    throughput: number; // events/sec
    latency: number; // ms
    errorRate: number; // percentage
    activeStreams: number;
    processedEvents: number;
    queueDepth: number;
  };
  securityMetrics: {
    authenticationAttempts: number;
    successfulLogins: number;
    failedLogins: number;
    suspiciousActivity: number;
    vulnerabilityScans: number;
    patchesApplied: number;
    complianceScore: number; // percentage
    encryptionStatus: 'active' | 'partial' | 'degraded';
  };
  incidents: {
    id: string;
    type: 'security' | 'privacy' | 'compliance' | 'breach' | 'suspicious';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    timestamp: Date;
    status: 'open' | 'investigating' | 'resolved' | 'closed';
    assignedTo: string;
    affectedSystems: string[];
    responseTime: number; // minutes
  }[];
  auditEvents: {
    id: string;
    userId: string;
    userName: string;
    action: string;
    resource: string;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    outcome: 'success' | 'failure' | 'blocked';
    riskLevel: 'low' | 'medium' | 'high';
  }[];
}

export default function SecurityDashboardPage() {
  const [securityData, setSecurityData] = useState<SecurityDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'threats' | 'streams' | 'incidents' | 'audit' | 'metrics'>('overview');
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 seconds for security monitoring

  useEffect(() => {
    loadSecurityDashboard();
    
    // Set up real-time security monitoring
    const interval = setInterval(loadSecurityDashboard, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadSecurityDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Connect to backend HybridSecurityManager.ts and HybridStreamProcessor.ts
      const [securityResponse, streamResponse] = await Promise.all([
        fetch('/api/security/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Security-Token': 'verified',
          },
        }),
        fetch('/api/security/streams', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Security-Token': 'verified',
          },
        })
      ]);

      if (!securityResponse.ok || !streamResponse.ok) {
        throw new Error('Failed to load security dashboard');
      }

      const securityData = await securityResponse.json();
      const streamData = await streamResponse.json();
      
      setSecurityData({
        ...securityData,
        streamProcessing: streamData
      });
    } catch (error) {
      console.error('Security dashboard loading error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      // Use mock data for development
      setSecurityData({
        user: {
          name: 'Security Administrator',
          role: 'Security Officer',
          securityClearance: 'Level 3',
          lastLogin: new Date(Date.now() - 30 * 60 * 1000)
        },
        securityStatus: {
          overall: 'secure',
          threatLevel: 'low',
          lastThreatDetected: new Date(Date.now() - 2 * 60 * 60 * 1000),
          systemsMonitored: 47,
          activeThreats: 0,
          blockedAttempts: 234
        },
        streamProcessing: {
          status: 'healthy',
          throughput: 1547,
          latency: 12,
          errorRate: 0.02,
          activeStreams: 15,
          processedEvents: 2847329,
          queueDepth: 23
        },
        securityMetrics: {
          authenticationAttempts: 3247,
          successfulLogins: 3013,
          failedLogins: 234,
          suspiciousActivity: 12,
          vulnerabilityScans: 45,
          patchesApplied: 23,
          complianceScore: 97.5,
          encryptionStatus: 'active'
        },
        incidents: [
          {
            id: 'INC-2024-001',
            type: 'suspicious',
            severity: 'medium',
            title: 'Multiple failed login attempts',
            description: 'Multiple failed login attempts detected from IP 192.168.1.45',
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            status: 'investigating',
            assignedTo: 'Security Team',
            affectedSystems: ['Authentication Service'],
            responseTime: 15
          },
          {
            id: 'INC-2024-002',
            type: 'security',
            severity: 'low',
            title: 'Unusual access pattern',
            description: 'User accessing system outside normal hours',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'resolved',
            assignedTo: 'John Smith',
            affectedSystems: ['Medical Dashboard'],
            responseTime: 30
          }
        ],
        auditEvents: [
          {
            id: 'AUD-2024-001',
            userId: 'user-123',
            userName: 'Dr. Sarah Johnson',
            action: 'Access medical record',
            resource: 'Patient Record PT-789234',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            outcome: 'success',
            riskLevel: 'low'
          },
          {
            id: 'AUD-2024-002',
            userId: 'user-456',
            userName: 'Admin User',
            action: 'System configuration change',
            resource: 'Security Settings',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            ipAddress: '192.168.1.50',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            outcome: 'success',
            riskLevel: 'medium'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getSecurityStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'medsight-normal';
      case 'monitoring': return 'medsight-secondary';
      case 'alert': return 'medsight-pending';
      case 'critical': return 'medsight-critical';
      default: return 'medsight-primary';
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'medsight-normal';
      case 'medium': return 'medsight-secondary';
      case 'high': return 'medsight-pending';
      case 'critical': return 'medsight-critical';
      default: return 'medsight-primary';
    }
  };

  const getStreamStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'medsight-normal';
      case 'degraded': return 'medsight-pending';
      case 'error': return 'medsight-critical';
      default: return 'medsight-primary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="medsight-glass p-8 rounded-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-medsight-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-lg font-medium text-medsight-primary mb-2">
              Loading Security Dashboard
            </div>
            <div className="text-sm text-medsight-primary/70">
              Connecting to security monitoring systems...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !securityData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="medsight-glass p-8 rounded-xl max-w-md w-full mx-4 border-medsight-critical/20">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-medsight-critical mx-auto mb-4"/>
            <div className="text-lg font-medium text-medsight-critical mb-2">
              Security Dashboard Error
            </div>
            <div className="text-sm text-medsight-critical/70 mb-4">
              {error}
            </div>
            <button 
              onClick={loadSecurityDashboard}
              className="btn-medsight"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Security Welcome Header */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="medsight-control-glass p-3 rounded-full">
              <ShieldCheckIcon className="w-8 h-8 text-medsight-primary"/>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-medsight-primary">
                Security & Monitoring Dashboard
              </h1>
              <p className="text-medsight-primary/70">
                Welcome back, {securityData?.user?.name} - Security Operations Center
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-medsight-primary/60">
                  Role: {securityData?.user?.role}
                </span>
                <span className="text-xs text-medsight-primary/60">
                  Clearance: {securityData?.user?.securityClearance}
                </span>
                <span className="text-xs text-medsight-primary/60">
                  Last Login: {securityData?.user?.lastLogin.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
              securityData?.securityStatus.overall === 'secure' ? 'bg-medsight-normal/10 border border-medsight-normal/20' :
              securityData?.securityStatus.overall === 'monitoring' ? 'bg-medsight-secondary/10 border border-medsight-secondary/20' :
              securityData?.securityStatus.overall === 'alert' ? 'bg-medsight-pending/10 border border-medsight-pending/20' :
              'bg-medsight-critical/10 border border-medsight-critical/20'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                securityData?.securityStatus.overall === 'secure' ? 'bg-medsight-normal' :
                securityData?.securityStatus.overall === 'monitoring' ? 'bg-medsight-secondary' :
                securityData?.securityStatus.overall === 'alert' ? 'bg-medsight-pending' :
                'bg-medsight-critical'
              } animate-pulse`}></div>
              <span className={`text-sm font-medium ${getSecurityStatusColor(securityData?.securityStatus.overall || '')}`}>
                {securityData?.securityStatus.overall?.toUpperCase()}
              </span>
            </div>
            <div className="text-sm text-medsight-primary/60">
              {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Security Alerts */}
      {securityData?.securityStatus.activeThreats > 0 && (
        <div className="medsight-glass p-4 rounded-xl border-medsight-critical/20">
          <div className="flex items-center space-x-2 mb-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-medsight-critical"/>
            <h3 className="text-sm font-semibold text-medsight-critical">Active Security Threats</h3>
          </div>
          <div className="text-sm text-medsight-critical">
            {securityData.securityStatus.activeThreats} active threats detected requiring immediate attention
          </div>
        </div>
      )}

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="w-6 h-6 text-medsight-primary"/>
            <div>
              <div className="text-2xl font-bold text-medsight-primary">
                {securityData?.securityStatus.systemsMonitored}
              </div>
              <div className="text-sm text-medsight-primary/70">Systems Monitored</div>
              <div className={`text-xs ${getThreatLevelColor(securityData?.securityStatus.threatLevel || '')}`}>
                Threat Level: {securityData?.securityStatus.threatLevel?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <LockClosedIcon className="w-6 h-6 text-medsight-secondary"/>
            <div>
              <div className="text-2xl font-bold text-medsight-secondary">
                {securityData?.securityStatus.blockedAttempts}
              </div>
              <div className="text-sm text-medsight-secondary/70">Blocked Attempts</div>
              <div className="text-xs text-medsight-secondary">
                Last 24 hours
              </div>
            </div>
          </div>
        </div>
        
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <SignalIcon className="w-6 h-6 text-medsight-ai-high"/>
            <div>
              <div className="text-2xl font-bold text-medsight-ai-high">
                {securityData?.streamProcessing.throughput.toLocaleString()}
              </div>
              <div className="text-sm text-medsight-ai-high/70">Events/sec</div>
              <div className={`text-xs ${getStreamStatusColor(securityData?.streamProcessing.status || '')}`}>
                Status: {securityData?.streamProcessing.status?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <DocumentMagnifyingGlassIcon className="w-6 h-6 text-medsight-pending"/>
            <div>
              <div className="text-2xl font-bold text-medsight-pending">
                {securityData?.securityMetrics.complianceScore.toFixed(1)}%
              </div>
              <div className="text-sm text-medsight-pending/70">Compliance Score</div>
              <div className={`text-xs ${
                securityData?.securityMetrics.encryptionStatus === 'active' ? 'text-medsight-normal' :
                securityData?.securityMetrics.encryptionStatus === 'partial' ? 'text-medsight-pending' :
                'text-medsight-critical'
              }`}>
                Encryption: {securityData?.securityMetrics.encryptionStatus?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Processing Status */}
      <div className="medsight-glass p-4 rounded-xl">
        <h3 className="text-sm font-semibold text-medsight-primary mb-4">Stream Processing Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="medsight-control-glass p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-medsight-primary">Active Streams</span>
              <span className="text-lg font-bold text-medsight-primary">
                {securityData?.streamProcessing.activeStreams}
              </span>
            </div>
          </div>
          <div className="medsight-control-glass p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-medsight-primary">Avg Latency</span>
              <span className="text-lg font-bold text-medsight-primary">
                {securityData?.streamProcessing.latency}ms
              </span>
            </div>
          </div>
          <div className="medsight-control-glass p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-medsight-primary">Error Rate</span>
              <span className="text-lg font-bold text-medsight-primary">
                {securityData?.streamProcessing.errorRate.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="medsight-glass p-4 rounded-xl">
          <h4 className="text-sm font-semibold text-medsight-primary mb-4">Recent Security Incidents</h4>
          <div className="space-y-3">
            {securityData?.incidents.slice(0, 3).map(incident => (
              <div key={incident.id} className="medsight-control-glass p-3 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        incident.severity === 'critical' ? 'bg-medsight-critical/10 text-medsight-critical' :
                        incident.severity === 'high' ? 'bg-medsight-pending/10 text-medsight-pending' :
                        incident.severity === 'medium' ? 'bg-medsight-secondary/10 text-medsight-secondary' :
                        'bg-medsight-normal/10 text-medsight-normal'
                      }`}>
                        {incident.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-medsight-primary/60">
                        {incident.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-medsight-primary mb-1">
                      {incident.title}
                    </div>
                    <div className="text-xs text-medsight-primary/70">
                      {incident.description}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    incident.status === 'resolved' ? 'bg-medsight-normal/10 text-medsight-normal' :
                    incident.status === 'investigating' ? 'bg-medsight-pending/10 text-medsight-pending' :
                    'bg-medsight-primary/10 text-medsight-primary'
                  }`}>
                    {incident.status.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="medsight-glass p-4 rounded-xl">
          <h4 className="text-sm font-semibold text-medsight-primary mb-4">Recent Audit Events</h4>
          <div className="space-y-3">
            {securityData?.auditEvents.slice(0, 3).map(event => (
              <div key={event.id} className="medsight-control-glass p-3 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.riskLevel === 'high' ? 'bg-medsight-pending/10 text-medsight-pending' :
                        event.riskLevel === 'medium' ? 'bg-medsight-secondary/10 text-medsight-secondary' :
                        'bg-medsight-normal/10 text-medsight-normal'
                      }`}>
                        {event.riskLevel.toUpperCase()}
                      </span>
                      <span className="text-xs text-medsight-primary/60">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-medsight-primary mb-1">
                      {event.userName} - {event.action}
                    </div>
                    <div className="text-xs text-medsight-primary/70">
                      {event.resource} from {event.ipAddress}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    event.outcome === 'success' ? 'bg-medsight-normal/10 text-medsight-normal' :
                    event.outcome === 'blocked' ? 'bg-medsight-critical/10 text-medsight-critical' :
                    'bg-medsight-pending/10 text-medsight-pending'
                  }`}>
                    {event.outcome.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6 min-h-screen">
      {/* Navigation Tabs */}
      <div className="medsight-glass p-2 rounded-xl">
        <div className="flex space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'threats', label: 'Threat Detection', icon: BugAntIcon },
            { id: 'streams', label: 'Stream Monitoring', icon: SignalIcon },
            { id: 'incidents', label: 'Security Incidents', icon: ExclamationTriangleIcon },
            { id: 'audit', label: 'Audit Trail', icon: DocumentMagnifyingGlassIcon },
            { id: 'metrics', label: 'Security Metrics', icon: ChartBarIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === tab.id 
                  ? 'bg-medsight-primary/10 text-medsight-primary border border-medsight-primary/20' 
                  : 'text-medsight-primary/70 hover:text-medsight-primary hover:bg-medsight-primary/5'
              }`}
            >
              <tab.icon className="w-4 h-4"/>
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {activeView === 'overview' && renderOverview()}
      {activeView === 'threats' && <ThreatDetection />}
      {activeView === 'streams' && <StreamMonitoring />}
      {activeView === 'incidents' && <SecurityIncidents />}
      {activeView === 'audit' && <SecurityAuditTrail />}
      {activeView === 'metrics' && <SecurityMetrics />}
    </div>
  );
} 