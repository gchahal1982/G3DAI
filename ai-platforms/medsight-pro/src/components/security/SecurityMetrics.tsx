'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface SecurityMetricsProps {
  data?: any;
}

interface SecurityMetric {
  id: string;
  name: string;
  category: 'performance' | 'compliance' | 'threats' | 'access' | 'incidents';
  value: number;
  unit: string;
  target: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  lastUpdated: Date;
}

interface ComplianceMetric {
  standard: string;
  score: number;
  requirements: {
    name: string;
    status: 'compliant' | 'partial' | 'non-compliant';
    score: number;
    lastAudit: Date;
  }[];
}

interface ThreatMetric {
  type: string;
  count: number;
  resolved: number;
  pending: number;
  avgResponseTime: number; // minutes
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export function SecurityMetrics({ data = {} }: SecurityMetricsProps) {
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([]);
  const [threatMetrics, setThreatMetrics] = useState<ThreatMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSecurityMetrics();
  }, [data, timeRange]);

  const loadSecurityMetrics = async () => {
    try {
      setLoading(true);
      
      // Mock security metrics
      const mockMetrics: SecurityMetric[] = [
        {
          id: 'metric-001',
          name: 'Security Incident Response Time',
          category: 'performance',
          value: 18.5,
          unit: 'minutes',
          target: 30,
          trend: 'down',
          trendPercentage: 12.3,
          status: 'good',
          description: 'Average time from incident detection to initial response',
          lastUpdated: new Date()
        },
        {
          id: 'metric-002',
          name: 'Failed Authentication Attempts',
          category: 'access',
          value: 234,
          unit: 'attempts',
          target: 100,
          trend: 'up',
          trendPercentage: 45.2,
          status: 'warning',
          description: 'Number of failed login attempts in the selected time period',
          lastUpdated: new Date()
        },
        {
          id: 'metric-003',
          name: 'HIPAA Compliance Score',
          category: 'compliance',
          value: 97.5,
          unit: '%',
          target: 95,
          trend: 'stable',
          trendPercentage: 0.2,
          status: 'good',
          description: 'Overall HIPAA compliance rating based on technical safeguards',
          lastUpdated: new Date()
        },
        {
          id: 'metric-004',
          name: 'Active Security Threats',
          category: 'threats',
          value: 3,
          unit: 'threats',
          target: 0,
          trend: 'up',
          trendPercentage: 50,
          status: 'critical',
          description: 'Number of active security threats requiring attention',
          lastUpdated: new Date()
        },
        {
          id: 'metric-005',
          name: 'System Uptime',
          category: 'performance',
          value: 99.97,
          unit: '%',
          target: 99.9,
          trend: 'stable',
          trendPercentage: 0.05,
          status: 'good',
          description: 'Security system availability and uptime percentage',
          lastUpdated: new Date()
        },
        {
          id: 'metric-006',
          name: 'Vulnerability Scan Coverage',
          category: 'performance',
          value: 94.2,
          unit: '%',
          target: 100,
          trend: 'up',
          trendPercentage: 3.1,
          status: 'warning',
          description: 'Percentage of systems covered by vulnerability scanning',
          lastUpdated: new Date()
        },
        {
          id: 'metric-007',
          name: 'Critical Vulnerabilities',
          category: 'threats',
          value: 2,
          unit: 'vulnerabilities',
          target: 0,
          trend: 'down',
          trendPercentage: 66.7,
          status: 'warning',
          description: 'Number of unpatched critical vulnerabilities',
          lastUpdated: new Date()
        },
        {
          id: 'metric-008',
          name: 'Security Training Completion',
          category: 'compliance',
          value: 87.3,
          unit: '%',
          target: 100,
          trend: 'up',
          trendPercentage: 8.2,
          status: 'warning',
          description: 'Percentage of staff who completed mandatory security training',
          lastUpdated: new Date()
        }
      ];

      const mockComplianceMetrics: ComplianceMetric[] = [
        {
          standard: 'HIPAA',
          score: 97.5,
          requirements: [
            { name: 'Access Control', status: 'compliant', score: 98, lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            { name: 'Audit Controls', status: 'compliant', score: 100, lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            { name: 'Integrity', status: 'compliant', score: 95, lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            { name: 'Person or Entity Authentication', status: 'compliant', score: 99, lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            { name: 'Transmission Security', status: 'partial', score: 92, lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          ]
        },
        {
          standard: 'SOX',
          score: 94.2,
          requirements: [
            { name: 'IT General Controls', status: 'compliant', score: 96, lastAudit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
            { name: 'Data Access Controls', status: 'compliant', score: 98, lastAudit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
            { name: 'Change Management', status: 'partial', score: 88, lastAudit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }
          ]
        },
        {
          standard: 'ISO 27001',
          score: 89.7,
          requirements: [
            { name: 'Information Security Policy', status: 'compliant', score: 95, lastAudit: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
            { name: 'Risk Management', status: 'partial', score: 85, lastAudit: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
            { name: 'Asset Management', status: 'compliant', score: 92, lastAudit: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
            { name: 'Incident Management', status: 'partial', score: 87, lastAudit: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
          ]
        }
      ];

      const mockThreatMetrics: ThreatMetric[] = [
        { type: 'Malware', count: 45, resolved: 42, pending: 3, avgResponseTime: 15, riskLevel: 'medium' },
        { type: 'Phishing', count: 67, resolved: 65, pending: 2, avgResponseTime: 8, riskLevel: 'medium' },
        { type: 'Intrusion Attempts', count: 23, resolved: 20, pending: 3, avgResponseTime: 25, riskLevel: 'high' },
        { type: 'Data Breaches', count: 2, resolved: 2, pending: 0, avgResponseTime: 120, riskLevel: 'critical' },
        { type: 'Insider Threats', count: 8, resolved: 6, pending: 2, avgResponseTime: 180, riskLevel: 'high' }
      ];

      setMetrics(mockMetrics);
      setComplianceMetrics(mockComplianceMetrics);
      setThreatMetrics(mockThreatMetrics);
    } catch (error) {
      console.error('Failed to load security metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshMetrics = async () => {
    setRefreshing(true);
    await loadSecurityMetrics();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'medsight-normal';
      case 'warning': return 'medsight-pending';
      case 'critical': return 'medsight-critical';
      default: return 'medsight-primary';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="w-4 h-4" />;
      case 'down': return <ArrowTrendingDownIcon className="w-4 h-4" />;
      default: return <ArrowPathIcon className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: string, category: string) => {
    if (trend === 'stable') return 'medsight-secondary';
    
    // For threats and incidents, down is good, up is bad
    if (category === 'threats' || category === 'incidents') {
      return trend === 'down' ? 'medsight-normal' : 'medsight-critical';
    }
    
    // For performance and compliance, up is generally good
    return trend === 'up' ? 'medsight-normal' : 'medsight-critical';
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'medsight-normal';
      case 'partial': return 'medsight-pending';
      case 'non-compliant': return 'medsight-critical';
      default: return 'medsight-primary';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'medsight-normal';
      case 'medium': return 'medsight-secondary';
      case 'high': return 'medsight-pending';
      case 'critical': return 'medsight-critical';
      default: return 'medsight-primary';
    }
  };

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(metric => metric.category === selectedCategory);

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
      {/* Security Metrics Overview */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-medsight-ai-high/10 rounded-full flex items-center justify-center">
              <ChartBarIcon className="w-4 h-4 text-medsight-ai-high" />
            </div>
            <h2 className="text-lg font-semibold text-medsight-primary">
              Security Performance Metrics
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input-medsight min-w-32"
            >
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={refreshMetrics}
              className="btn-medsight px-3 py-1 text-sm"
              disabled={refreshing}
            >
              <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 mb-6">
          {['all', 'performance', 'compliance', 'threats', 'access', 'incidents'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-medsight-primary/10 text-medsight-primary border border-medsight-primary/20'
                  : 'text-medsight-primary/70 hover:text-medsight-primary hover:bg-medsight-primary/5'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Security Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredMetrics.map(metric => (
            <div key={metric.id} className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-medsight-primary mb-1">{metric.name}</h4>
                  <p className="text-xs text-medsight-primary/70">{metric.description}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(metric.status)}/10 text-${getStatusColor(metric.status)}`}>
                  {metric.status.toUpperCase()}
                </div>
              </div>
              
              <div className="flex items-end justify-between mb-2">
                <div className="text-2xl font-bold text-medsight-primary">
                  {metric.value.toLocaleString()}{metric.unit}
                </div>
                <div className={`flex items-center space-x-1 text-xs text-${getTrendColor(metric.trend, metric.category)}`}>
                  {getTrendIcon(metric.trend)}
                  <span>{metric.trendPercentage.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-medsight-primary/70">
                <span>Target: {metric.target}{metric.unit}</span>
                <span>Updated: {metric.lastUpdated.toLocaleTimeString()}</span>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 w-full bg-medsight-primary/20 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all bg-${getStatusColor(metric.status)}`}
                  style={{ 
                    width: `${Math.min(100, (metric.value / metric.target) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance Metrics */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">Compliance Standards</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {complianceMetrics.map(compliance => (
              <div key={compliance.standard} className="medsight-control-glass p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-medsight-primary">{compliance.standard}</h4>
                  <div className="text-2xl font-bold text-medsight-primary">
                    {compliance.score}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  {compliance.requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-medsight-primary">{req.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-medsight-primary">{req.score}%</span>
                        <div className={`w-3 h-3 rounded-full bg-${getComplianceStatusColor(req.status)}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 w-full bg-medsight-primary/20 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-medsight-normal transition-all"
                    style={{ width: `${compliance.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Metrics */}
        <div>
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">Threat Analysis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {threatMetrics.map(threat => (
              <div key={threat.type} className="medsight-control-glass p-4 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-medsight-primary">{threat.type}</h4>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 bg-${getRiskLevelColor(threat.riskLevel)}/10 text-${getRiskLevelColor(threat.riskLevel)} inline-block`}>
                      {threat.riskLevel.toUpperCase()} RISK
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-medsight-primary">{threat.count}</div>
                    <div className="text-xs text-medsight-primary/70">Total</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-medsight-normal">{threat.resolved}</div>
                    <div className="text-xs text-medsight-normal/70">Resolved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-medsight-pending">{threat.pending}</div>
                    <div className="text-xs text-medsight-pending/70">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-medsight-secondary">{threat.avgResponseTime}m</div>
                    <div className="text-xs text-medsight-secondary/70">Avg Response</div>
                  </div>
                </div>
                
                <div className="mt-3 w-full bg-medsight-primary/20 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-medsight-normal transition-all"
                    style={{ width: `${(threat.resolved / threat.count) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
 