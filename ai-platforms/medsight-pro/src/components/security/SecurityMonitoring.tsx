'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ServerIcon,
  ChartBarIcon,
  ClockIcon,
  LockClosedIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface SecurityMonitoringProps {
  data: any;
}

interface SystemSecurity {
  id: string;
  name: string;
  category: 'network' | 'application' | 'database' | 'authentication' | 'encryption';
  status: 'secure' | 'warning' | 'alert' | 'critical';
  lastScan: Date;
  vulnerabilities: number;
  patchLevel: string;
  complianceScore: number;
  description: string;
}

interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'authentication' | 'authorization' | 'intrusion' | 'malware' | 'policy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  status: 'active' | 'investigating' | 'resolved';
  responseTime: number;
}

export function SecurityMonitoring({ data }: SecurityMonitoringProps) {
  const [securitySystems, setSecuritySystems] = useState<SystemSecurity[]>([]);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadSecurityMonitoring();
  }, [data]);

  const loadSecurityMonitoring = async () => {
    try {
      setLoading(true);
      
      // Mock data for security systems monitoring
      const mockSystems: SystemSecurity[] = [
        {
          id: 'sys-001',
          name: 'Authentication Service',
          category: 'authentication',
          status: 'secure',
          lastScan: new Date(Date.now() - 30 * 60 * 1000),
          vulnerabilities: 0,
          patchLevel: 'Latest',
          complianceScore: 98.5,
          description: 'Medical professional authentication system with MFA'
        },
        {
          id: 'sys-002',
          name: 'Medical Database',
          category: 'database',
          status: 'warning',
          lastScan: new Date(Date.now() - 2 * 60 * 60 * 1000),
          vulnerabilities: 1,
          patchLevel: 'Pending',
          complianceScore: 94.2,
          description: 'Primary medical records database with HIPAA compliance'
        },
        {
          id: 'sys-003',
          name: 'Network Firewall',
          category: 'network',
          status: 'secure',
          lastScan: new Date(Date.now() - 15 * 60 * 1000),
          vulnerabilities: 0,
          patchLevel: 'Latest',
          complianceScore: 99.1,
          description: 'Network perimeter security and access control'
        },
        {
          id: 'sys-004',
          name: 'DICOM Storage',
          category: 'application',
          status: 'secure',
          lastScan: new Date(Date.now() - 45 * 60 * 1000),
          vulnerabilities: 0,
          patchLevel: 'Latest',
          complianceScore: 97.8,
          description: 'Medical imaging storage with encryption'
        },
        {
          id: 'sys-005',
          name: 'Data Encryption',
          category: 'encryption',
          status: 'secure',
          lastScan: new Date(Date.now() - 20 * 60 * 1000),
          vulnerabilities: 0,
          patchLevel: 'Latest',
          complianceScore: 99.5,
          description: 'AES-256 encryption for all medical data'
        }
      ];

      const mockEvents: SecurityEvent[] = [
        {
          id: 'evt-001',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          type: 'authentication',
          severity: 'medium',
          source: '192.168.1.45',
          description: 'Multiple failed login attempts detected',
          status: 'investigating',
          responseTime: 3
        },
        {
          id: 'evt-002',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          type: 'authorization',
          severity: 'low',
          source: 'Medical Dashboard',
          description: 'Unauthorized access attempt to admin panel',
          status: 'resolved',
          responseTime: 8
        },
        {
          id: 'evt-003',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          type: 'intrusion',
          severity: 'high',
          source: '203.0.113.42',
          description: 'Suspicious network activity detected',
          status: 'resolved',
          responseTime: 12
        },
        {
          id: 'evt-004',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          type: 'policy',
          severity: 'low',
          source: 'System Policy',
          description: 'Password policy violation detected',
          status: 'resolved',
          responseTime: 5
        }
      ];

      setSecuritySystems(mockSystems);
      setRecentEvents(mockEvents);
    } catch (error) {
      console.error('Failed to load security monitoring:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'medsight-normal';
      case 'warning': return 'medsight-pending';
      case 'alert': return 'medsight-secondary';
      case 'critical': return 'medsight-critical';
      default: return 'medsight-primary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'medsight-normal';
      case 'medium': return 'medsight-secondary';
      case 'high': return 'medsight-pending';
      case 'critical': return 'medsight-critical';
      default: return 'medsight-primary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'network': return <GlobeAltIcon className="w-5 h-5" />;
      case 'application': return <ComputerDesktopIcon className="w-5 h-5" />;
      case 'database': return <ServerIcon className="w-5 h-5" />;
      case 'authentication': return <LockClosedIcon className="w-5 h-5" />;
      case 'encryption': return <ShieldCheckIcon className="w-5 h-5" />;
      default: return <ServerIcon className="w-5 h-5" />;
    }
  };

  const filteredSystems = securitySystems.filter(system => {
    const matchesCategory = filterCategory === 'all' || system.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || system.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="medsight-glass p-6 rounded-xl">
        <div className="animate-pulse">
          <div className="h-4 bg-medsight-primary/20 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-medsight-primary/20 rounded w-3/4"></div>
            <div className="h-3 bg-medsight-primary/20 rounded w-1/2"></div>
            <div className="h-3 bg-medsight-primary/20 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-medsight-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="w-4 h-4 text-medsight-primary" />
            </div>
            <h2 className="text-lg font-semibold text-medsight-primary">
              Security System Monitoring
            </h2>
          </div>
          <div className="text-sm text-medsight-primary/70">
            Last Update: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="text-2xl font-bold text-medsight-normal">
              {securitySystems.filter(s => s.status === 'secure').length}
            </div>
            <div className="text-sm text-medsight-normal/70">Secure Systems</div>
          </div>
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="text-2xl font-bold text-medsight-pending">
              {securitySystems.filter(s => s.status === 'warning').length}
            </div>
            <div className="text-sm text-medsight-pending/70">Warning Systems</div>
          </div>
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="text-2xl font-bold text-medsight-secondary">
              {securitySystems.reduce((total, s) => total + s.vulnerabilities, 0)}
            </div>
            <div className="text-sm text-medsight-secondary/70">Total Vulnerabilities</div>
          </div>
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="text-2xl font-bold text-medsight-primary">
              {Math.round(securitySystems.reduce((total, s) => total + s.complianceScore, 0) / securitySystems.length)}%
            </div>
            <div className="text-sm text-medsight-primary/70">Avg Compliance</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-medsight min-w-40"
          >
            <option value="all">All Categories</option>
            <option value="network">Network</option>
            <option value="application">Application</option>
            <option value="database">Database</option>
            <option value="authentication">Authentication</option>
            <option value="encryption">Encryption</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-medsight min-w-32"
          >
            <option value="all">All Status</option>
            <option value="secure">Secure</option>
            <option value="warning">Warning</option>
            <option value="alert">Alert</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Security Systems Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSystems.map(system => (
            <div key={system.id} className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`text-${getStatusColor(system.status)}`}>
                    {getCategoryIcon(system.category)}
                  </div>
                  <div>
                    <h4 className="font-medium text-medsight-primary">{system.name}</h4>
                    <p className="text-sm text-medsight-primary/70">{system.description}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(system.status)}/10 text-${getStatusColor(system.status)}`}>
                  {system.status.toUpperCase()}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-medsight-primary/70">Last Scan</div>
                  <div className="text-medsight-primary">{system.lastScan.toLocaleTimeString()}</div>
                </div>
                <div>
                  <div className="text-medsight-primary/70">Vulnerabilities</div>
                  <div className={`${system.vulnerabilities > 0 ? 'text-medsight-critical' : 'text-medsight-normal'}`}>
                    {system.vulnerabilities}
                  </div>
                </div>
                <div>
                  <div className="text-medsight-primary/70">Patch Level</div>
                  <div className="text-medsight-primary">{system.patchLevel}</div>
                </div>
                <div>
                  <div className="text-medsight-primary/70">Compliance</div>
                  <div className={`${system.complianceScore >= 95 ? 'text-medsight-normal' : 'text-medsight-pending'}`}>
                    {system.complianceScore}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-medsight-secondary/10 rounded-full flex items-center justify-center">
            <DocumentMagnifyingGlassIcon className="w-4 h-4 text-medsight-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-medsight-primary">
            Recent Security Events
          </h3>
        </div>

        <div className="space-y-3">
          {recentEvents.map(event => (
            <div key={event.id} className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getSeverityColor(event.severity)}/10 text-${getSeverityColor(event.severity)}`}>
                      {event.severity.toUpperCase()}
                    </span>
                    <span className="text-sm text-medsight-primary/70 capitalize">
                      {event.type}
                    </span>
                    <span className="text-sm text-medsight-primary/70">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="text-sm text-medsight-primary/70">
                      Response: {event.responseTime}min
                    </span>
                  </div>
                  <div className="text-sm font-medium text-medsight-primary mb-1">
                    {event.description}
                  </div>
                  <div className="text-xs text-medsight-primary/70">
                    Source: {event.source}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.status === 'resolved' ? 'bg-medsight-normal/10 text-medsight-normal' :
                  event.status === 'investigating' ? 'bg-medsight-pending/10 text-medsight-pending' :
                  'bg-medsight-secondary/10 text-medsight-secondary'
                }`}>
                  {event.status.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 