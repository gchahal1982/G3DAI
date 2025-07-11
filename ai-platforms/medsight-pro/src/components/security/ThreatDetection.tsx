'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Eye, 
  Zap, 
  Target, 
  Search, 
  Filter, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Bell,
  Lock,
  Unlock,
  Globe,
  Server,
  Database,
  Network
} from 'lucide-react';

interface SecurityThreat {
  id: string;
  type: 'malware' | 'intrusion' | 'data_breach' | 'ddos' | 'phishing' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  title: string;
  description: string;
  sourceIP: string;
  targetSystem: string;
  detectedAt: Date;
  lastActivity: Date;
  riskScore: number;
  affectedAssets: string[];
  recommendedActions: string[];
  evidenceCount: number;
  investigator?: string;
  resolvedAt?: Date;
}

interface ThreatDetectionProps {
  refreshInterval?: number;
  showFilters?: boolean;
  compactView?: boolean;
}

export default function ThreatDetection({ 
  refreshInterval = 30000, 
  showFilters = true, 
  compactView = false 
}: ThreatDetectionProps) {
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadThreats();
    
    if (autoRefresh) {
      const interval = setInterval(loadThreats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadThreats = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/security/threats', {
        headers: {
          'Content-Type': 'application/json',
          'X-Medical-Context': 'security-monitoring',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load threat data');
      }

      const data = await response.json();
      setThreats(data);
    } catch (error) {
      console.error('Threat detection error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      // Mock data for development
      loadMockThreats();
    } finally {
      setLoading(false);
    }
  };

  const loadMockThreats = () => {
    const mockThreats: SecurityThreat[] = [
      {
        id: 'threat-001',
        type: 'unauthorized_access',
        severity: 'high',
        status: 'active',
        title: 'Suspicious Login Attempt - Medical Records',
        description: 'Multiple failed login attempts detected for medical professional account',
        sourceIP: '192.168.1.100',
        targetSystem: 'Medical Records Database',
        detectedAt: new Date(Date.now() - 5 * 60 * 1000),
        lastActivity: new Date(Date.now() - 2 * 60 * 1000),
        riskScore: 85,
        affectedAssets: ['Patient Database', 'Medical Records'],
        recommendedActions: [
          'Lock affected user account',
          'Review access logs',
          'Notify medical administration',
          'Implement additional MFA'
        ],
        evidenceCount: 12
      },
      {
        id: 'threat-002',
        type: 'data_breach',
        severity: 'critical',
        status: 'investigating',
        title: 'Potential HIPAA Data Exposure',
        description: 'Unusual data access pattern detected in patient records system',
        sourceIP: '10.0.0.45',
        targetSystem: 'HIPAA Patient Records',
        detectedAt: new Date(Date.now() - 15 * 60 * 1000),
        lastActivity: new Date(Date.now() - 8 * 60 * 1000),
        riskScore: 95,
        affectedAssets: ['Patient Records', 'Medical Images', 'Clinical Notes'],
        recommendedActions: [
          'Immediately isolate affected systems',
          'Contact HIPAA compliance officer',
          'Begin breach investigation',
          'Prepare regulatory notifications'
        ],
        evidenceCount: 24,
        investigator: 'Security Team Lead'
      },
      {
        id: 'threat-003',
        type: 'malware',
        severity: 'medium',
        status: 'resolved',
        title: 'Medical Device Malware Detected',
        description: 'Malware signatures detected on medical imaging workstation',
        sourceIP: '172.16.0.12',
        targetSystem: 'DICOM Workstation',
        detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 90 * 60 * 1000),
        riskScore: 70,
        affectedAssets: ['Medical Imaging', 'DICOM Server'],
        recommendedActions: [
          'Quarantine affected workstation',
          'Run full system scan',
          'Update antivirus definitions',
          'Review network traffic'
        ],
        evidenceCount: 8,
        investigator: 'IT Security',
        resolvedAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    ];
    setThreats(mockThreats);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-medsight-critical';
      case 'high': return 'text-medsight-pending';
      case 'medium': return 'text-medsight-secondary';
      case 'low': return 'text-medsight-normal';
      default: return 'text-slate-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-medsight-critical';
      case 'investigating': return 'text-medsight-pending';
      case 'resolved': return 'text-medsight-normal';
      case 'false_positive': return 'text-slate-500';
      default: return 'text-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="w-4 h-4 text-medsight-critical" />;
      case 'investigating': return <Search className="w-4 h-4 text-medsight-pending" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-medsight-normal" />;
      case 'false_positive': return <XCircle className="w-4 h-4 text-slate-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredThreats = threats.filter(threat => {
    const matchesType = filterType === 'all' || threat.type === filterType;
    const matchesSeverity = filterSeverity === 'all' || threat.severity === filterSeverity;
    const matchesSearch = searchQuery === '' || 
      threat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.sourceIP.includes(searchQuery) ||
      threat.targetSystem.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSeverity && matchesSearch;
  });

  if (loading) {
    return (
      <div className="medsight-glass p-8 rounded-xl">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-medsight-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-4 text-medsight-primary">Loading threat data...</span>
        </div>
      </div>
    );
  }

  if (compactView) {
    return (
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-medsight-primary" />
            <div>
              <div className="text-sm font-medium text-medsight-primary">Threat Detection</div>
              <div className="text-xs text-slate-600">
                {threats.filter(t => t.status === 'active').length} active threats
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm font-medium text-medsight-critical">
                {threats.filter(t => t.severity === 'critical').length}
              </div>
              <div className="text-xs text-slate-500">Critical</div>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg ${
                autoRefresh 
                  ? 'bg-medsight-primary/10 text-medsight-primary' 
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-medsight-primary mb-2">
              Security Threat Detection
            </h2>
            <p className="text-slate-600">
              Real-time monitoring and analysis of security threats
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg ${
                  autoRefresh 
                    ? 'bg-medsight-primary/10 text-medsight-primary' 
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>
              <span className="text-sm text-slate-600">
                {autoRefresh ? 'Auto-refresh' : 'Manual refresh'}
              </span>
            </div>
            <button onClick={loadThreats} className="btn-medsight">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Threat Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-medsight-critical/10">
              <AlertTriangle className="w-6 h-6 text-medsight-critical" />
            </div>
            <TrendingUp className="w-5 h-5 text-medsight-normal" />
          </div>
          <div className="text-2xl font-bold text-medsight-critical mb-1">
            {threats.filter(t => t.status === 'active').length}
          </div>
          <div className="text-sm text-slate-600">Active Threats</div>
          <div className="text-xs text-slate-500">
            {threats.filter(t => t.severity === 'critical' && t.status === 'active').length} critical
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-medsight-pending/10">
              <Search className="w-6 h-6 text-medsight-pending" />
            </div>
            <Activity className="w-5 h-5 text-medsight-pending" />
          </div>
          <div className="text-2xl font-bold text-medsight-pending mb-1">
            {threats.filter(t => t.status === 'investigating').length}
          </div>
          <div className="text-sm text-slate-600">Under Investigation</div>
          <div className="text-xs text-slate-500">
            Avg. response: 8 min
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-medsight-normal/10">
              <CheckCircle className="w-6 h-6 text-medsight-normal" />
            </div>
            <CheckCircle className="w-5 h-5 text-medsight-normal" />
          </div>
          <div className="text-2xl font-bold text-medsight-normal mb-1">
            {threats.filter(t => t.status === 'resolved').length}
          </div>
          <div className="text-sm text-slate-600">Resolved Today</div>
          <div className="text-xs text-slate-500">
            Avg. resolution: 45 min
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-medsight-secondary/10">
              <Target className="w-6 h-6 text-medsight-secondary" />
            </div>
            <Eye className="w-5 h-5 text-medsight-secondary" />
          </div>
          <div className="text-2xl font-bold text-medsight-secondary mb-1">
            {Math.round(threats.reduce((sum, t) => sum + t.riskScore, 0) / threats.length)}
          </div>
          <div className="text-sm text-slate-600">Avg Risk Score</div>
          <div className="text-xs text-slate-500">
            Medical systems
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="medsight-glass p-4 rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="medsight-input text-sm"
              >
                <option value="all">All Types</option>
                <option value="unauthorized_access">Unauthorized Access</option>
                <option value="data_breach">Data Breach</option>
                <option value="malware">Malware</option>
                <option value="intrusion">Intrusion</option>
                <option value="ddos">DDoS</option>
                <option value="phishing">Phishing</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="medsight-input text-sm"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search threats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="medsight-input text-sm flex-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Threats List */}
      <div className="space-y-4">
        {filteredThreats.map((threat) => (
          <div
            key={threat.id}
            className={`medsight-control-glass p-4 rounded-lg cursor-pointer transition-all ${
              selectedThreat === threat.id ? 'ring-2 ring-medsight-primary' : ''
            }`}
            onClick={() => setSelectedThreat(selectedThreat === threat.id ? null : threat.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="mt-1">
                  {getStatusIcon(threat.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-slate-900">{threat.title}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      threat.severity === 'critical' ? 'bg-medsight-critical/10 text-medsight-critical' :
                      threat.severity === 'high' ? 'bg-medsight-pending/10 text-medsight-pending' :
                      threat.severity === 'medium' ? 'bg-medsight-secondary/10 text-medsight-secondary' :
                      'bg-medsight-normal/10 text-medsight-normal'
                    }`}>
                      {threat.severity}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(threat.status)}`}>
                      {threat.status}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{threat.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>Source: {threat.sourceIP}</span>
                    <span>Target: {threat.targetSystem}</span>
                    <span>Risk Score: {threat.riskScore}</span>
                    <span>Detected: {threat.detectedAt.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-medsight-primary">
                  {threat.riskScore}
                </div>
                <div className="text-xs text-slate-500">Risk Score</div>
              </div>
            </div>

            {selectedThreat === threat.id && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">
                      Affected Assets
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {threat.affectedAssets.map((asset, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <Database className="w-3 h-3 text-medsight-primary" />
                          <span>{asset}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">
                      Recommended Actions
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {threat.recommendedActions.map((action, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-medsight-primary mt-1">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>Evidence Items: {threat.evidenceCount}</span>
                    {threat.investigator && <span>Investigator: {threat.investigator}</span>}
                    {threat.resolvedAt && <span>Resolved: {threat.resolvedAt.toLocaleString()}</span>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="btn-medsight text-xs">
                      View Details
                    </button>
                    {threat.status === 'active' && (
                      <button className="btn-medsight text-xs">
                        Investigate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredThreats.length === 0 && (
        <div className="medsight-glass p-8 rounded-xl text-center">
          <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <div className="text-lg font-medium text-slate-600 mb-2">
            No Threats Found
          </div>
          <div className="text-sm text-slate-500">
            {searchQuery || filterType !== 'all' || filterSeverity !== 'all'
              ? 'No threats match your current filters.'
              : 'No security threats detected at this time.'}
          </div>
        </div>
      )}
    </div>
  );
} 