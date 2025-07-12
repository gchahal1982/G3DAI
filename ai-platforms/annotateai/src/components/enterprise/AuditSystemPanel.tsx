'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Badge, 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger, 
  Input, 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  Switch, 
  Alert, 
  AlertDescription 
} from '../../../../../shared/components/ui';
import { 
  FileText, 
  Activity, 
  Users, 
  Shield, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Database, 
  Calendar, 
  BarChart3, 
  Settings, 
  RefreshCw, 
  Play, 
  Pause, 
  Square, 
  Archive, 
  Lock, 
  Unlock, 
  Key, 
  Globe, 
  Monitor, 
  Server, 
  Network, 
  HardDrive, 
  UserCheck, 
  UserX, 
  LogIn, 
  LogOut, 
  Edit, 
  Trash2, 
  Plus 
} from 'lucide-react';

// Audit System Types
interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: 'login' | 'logout' | 'access' | 'change' | 'admin' | 'security' | 'system' | 'data';
  category: string;
  action: string;
  actor: AuditActor;
  target: AuditTarget;
  source: AuditSource;
  outcome: 'success' | 'failure' | 'warning' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: AuditDetails;
  metadata: AuditMetadata;
  correlation: AuditCorrelation;
  retention: RetentionInfo;
}

interface AuditActor {
  type: 'user' | 'system' | 'api' | 'service' | 'admin';
  id: string;
  name: string;
  email?: string;
  role: string;
  session?: string;
  impersonation?: boolean;
  authentication: AuthenticationInfo;
}

interface AuthenticationInfo {
  method: 'password' | 'sso' | 'api_key' | 'certificate' | 'mfa' | 'token';
  strength: 'weak' | 'moderate' | 'strong';
  verified: boolean;
  factors: string[];
}

interface AuditTarget {
  type: 'file' | 'user' | 'system' | 'database' | 'api' | 'configuration' | 'policy';
  id: string;
  name: string;
  path?: string;
  resource: string;
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  classification: string[];
}

interface AuditSource {
  ip: string;
  userAgent: string;
  location: GeographicLocation;
  device: DeviceInfo;
  network: NetworkInfo;
  application: string;
  version: string;
}

interface GeographicLocation {
  country: string;
  region: string;
  city: string;
  coordinates: [number, number];
  timezone: string;
}

interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'server' | 'iot' | 'unknown';
  os: string;
  browser: string;
  fingerprint: string;
  trusted: boolean;
}

interface NetworkInfo {
  domain: string;
  proxy: boolean;
  vpn: boolean;
  tor: boolean;
  reputation: 'good' | 'suspicious' | 'bad' | 'unknown';
}

interface AuditDetails {
  description: string;
  before?: any;
  after?: any;
  changes: ChangeRecord[];
  context: Record<string, any>;
  evidence: EvidenceRecord[];
}

interface ChangeRecord {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'create' | 'update' | 'delete' | 'access';
}

interface EvidenceRecord {
  type: 'screenshot' | 'log' | 'file' | 'hash' | 'signature';
  reference: string;
  integrity: IntegrityInfo;
}

interface IntegrityInfo {
  hash: string;
  algorithm: string;
  verified: boolean;
  signature?: string;
}

interface AuditMetadata {
  requestId: string;
  sessionId: string;
  transactionId?: string;
  tags: string[];
  classification: string[];
  compliance: string[];
  custom: Record<string, any>;
}

interface AuditCorrelation {
  parentId?: string;
  childIds: string[];
  related: string[];
  chain: string[];
  pattern: string;
}

interface RetentionInfo {
  policy: string;
  duration: number;
  encrypted: boolean;
  immutable: boolean;
  archived: boolean;
  deleteDate?: Date;
}

interface AuditConfiguration {
  enabled: boolean;
  eventTypes: EventTypeConfig[];
  retention: RetentionConfig;
  storage: StorageConfig;
  alerting: AlertingConfig;
  reporting: ReportingConfig;
  encryption: EncryptionConfig;
  compliance: ComplianceConfig;
  performance: PerformanceConfig;
}

interface EventTypeConfig {
  type: string;
  enabled: boolean;
  level: 'all' | 'important' | 'critical';
  retention: number;
  realtime: boolean;
  alerting: boolean;
}

interface RetentionConfig {
  defaultDuration: number;
  policies: RetentionPolicy[];
  archiving: ArchivingConfig;
  deletion: DeletionConfig;
}

interface RetentionPolicy {
  name: string;
  eventTypes: string[];
  duration: number;
  conditions: string[];
  actions: string[];
}

interface ArchivingConfig {
  enabled: boolean;
  threshold: number;
  destination: string;
  compression: boolean;
  encryption: boolean;
}

interface DeletionConfig {
  enabled: boolean;
  verification: boolean;
  approval: boolean;
  secure: boolean;
}

interface StorageConfig {
  primary: StorageBackend;
  backup: StorageBackend;
  replication: ReplicationConfig;
  integrity: IntegrityConfig;
}

interface StorageBackend {
  type: 'database' | 'file' | 'cloud' | 'siem';
  configuration: Record<string, any>;
  capacity: number;
  availability: number;
}

interface ReplicationConfig {
  enabled: boolean;
  replicas: number;
  consistency: 'eventual' | 'strong';
  crossRegion: boolean;
}

interface IntegrityConfig {
  hashing: boolean;
  signing: boolean;
  verification: boolean;
  frequency: string;
}

interface AlertingConfig {
  enabled: boolean;
  rules: AlertRule[];
  channels: AlertChannel[];
  escalation: EscalationPolicy[];
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

interface AlertChannel {
  type: 'email' | 'sms' | 'slack' | 'webhook' | 'siem';
  configuration: Record<string, any>;
  enabled: boolean;
}

interface EscalationPolicy {
  level: number;
  delay: number;
  channels: string[];
  conditions: string[];
}

interface ReportingConfig {
  enabled: boolean;
  automated: boolean;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'html' | 'pdf' | 'csv' | 'json';
  templates: ReportTemplate[];
}

interface ReportTemplate {
  id: string;
  name: string;
  type: 'summary' | 'detailed' | 'compliance' | 'security' | 'custom';
  content: string[];
  filters: Record<string, any>;
}

interface EncryptionConfig {
  atRest: boolean;
  inTransit: boolean;
  algorithm: string;
  keyManagement: string;
  rotation: boolean;
  rotationFrequency: number;
}

interface ComplianceConfig {
  frameworks: string[];
  mapping: ComplianceMapping[];
  validation: ValidationRule[];
  reporting: ComplianceReporting;
}

interface ComplianceMapping {
  framework: string;
  requirement: string;
  eventTypes: string[];
  evidence: string[];
}

interface ValidationRule {
  id: string;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: string;
}

interface ComplianceReporting {
  automated: boolean;
  frequency: string;
  frameworks: string[];
  recipients: string[];
}

interface PerformanceConfig {
  indexing: boolean;
  compression: boolean;
  caching: boolean;
  partitioning: boolean;
  optimization: OptimizationConfig;
}

interface OptimizationConfig {
  enabled: boolean;
  strategies: string[];
  thresholds: Record<string, number>;
  automation: boolean;
}

interface AuditStatistics {
  totalEvents: number;
  eventsToday: number;
  criticalEvents: number;
  failedEvents: number;
  uniqueUsers: number;
  topEventTypes: EventTypeStat[];
  hourlyTrends: HourlyTrend[];
  severityDistribution: SeverityDistribution[];
  complianceStatus: ComplianceStatus;
}

interface EventTypeStat {
  type: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface HourlyTrend {
  hour: number;
  events: number;
  critical: number;
  failed: number;
}

interface SeverityDistribution {
  severity: string;
  count: number;
  percentage: number;
}

interface ComplianceStatus {
  covered: number;
  total: number;
  percentage: number;
  gaps: string[];
}

export default function AuditSystemPanel() {
  // State management
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [configuration, setConfiguration] = useState<AuditConfiguration | null>(null);
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEventType, setFilterEventType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('24h');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  // Backend connection
  const auditSystemRef = useRef<any>(null);

  // Initialize
  useEffect(() => {
    const initializeAuditSystem = async () => {
      try {
        auditSystemRef.current = {
          getEvents: async (filters: any) => generateMockEvents(),
          getConfiguration: async () => generateMockConfiguration(),
          getStatistics: async () => generateMockStatistics(),
          updateConfiguration: async (config: Partial<AuditConfiguration>) => {
            setConfiguration(prev => prev ? { ...prev, ...config } : null);
          },
          exportEvents: async (format: string, filters: any) => {
            return { url: `/exports/audit-events.${format}`, filename: `audit-events-${Date.now()}.${format}` };
          }
        };

        const [events, config, stats] = await Promise.all([
          auditSystemRef.current.getEvents({}),
          auditSystemRef.current.getConfiguration(),
          auditSystemRef.current.getStatistics()
        ]);

        setAuditEvents(events);
        setConfiguration(config);
        setStatistics(stats);

      } catch (error) {
        console.error('Failed to initialize audit system:', error);
        setError('Failed to initialize audit system');
      }
    };

    initializeAuditSystem();

    // Set up real-time updates
    let interval: NodeJS.Timeout;
    if (realTimeEnabled) {
      interval = setInterval(async () => {
        if (auditSystemRef.current) {
          const stats = await auditSystemRef.current.getStatistics();
          setStatistics(stats);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realTimeEnabled]);

  // Actions
  const exportEvents = useCallback(async (format: string) => {
    try {
      const result = await auditSystemRef.current?.exportEvents(format, {
        eventType: filterEventType,
        severity: filterSeverity,
        dateRange
      });
      // Trigger download
      window.open(result.url, '_blank');
    } catch (error) {
      console.error('Failed to export events:', error);
      setError('Failed to export audit events');
    }
  }, [filterEventType, filterSeverity, dateRange]);

  const updateConfig = useCallback(async (config: Partial<AuditConfiguration>) => {
    try {
      await auditSystemRef.current?.updateConfiguration(config);
    } catch (error) {
      console.error('Failed to update configuration:', error);
      setError('Failed to update audit configuration');
    }
  }, []);

  // Utilities
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': case 'enabled': case 'active': return 'bg-green-500';
      case 'warning': case 'partial': return 'bg-yellow-500';
      case 'failure': case 'error': case 'critical': return 'bg-red-500';
      case 'unknown': case 'disabled': case 'inactive': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'login': case 'logout': return <LogIn className="h-4 w-4" />;
      case 'access': return <Eye className="h-4 w-4" />;
      case 'change': return <Edit className="h-4 w-4" />;
      case 'admin': return <Settings className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'system': return <Server className="h-4 w-4" />;
      case 'data': return <Database className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  // Filter events
  const filteredEvents = auditEvents.filter(event => {
    const matchesSearch = event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.target.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEventType = filterEventType === 'all' || event.eventType === filterEventType;
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    
    // Date range filtering
    const now = new Date();
    const eventDate = event.timestamp;
    let inRange = true;
    
    switch (dateRange) {
      case '1h':
        inRange = (now.getTime() - eventDate.getTime()) <= 60 * 60 * 1000;
        break;
      case '24h':
        inRange = (now.getTime() - eventDate.getTime()) <= 24 * 60 * 60 * 1000;
        break;
      case '7d':
        inRange = (now.getTime() - eventDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        inRange = (now.getTime() - eventDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
        break;
    }
    
    return matchesSearch && matchesEventType && matchesSeverity && inRange;
  });

  // Mock data generators
  const generateMockEvents = (): AuditEvent[] => {
    const eventTypes = ['login', 'logout', 'access', 'change', 'admin', 'security', 'system', 'data'];
    const severities = ['low', 'medium', 'high', 'critical'];
    const outcomes = ['success', 'failure', 'warning'];
    
    return Array.from({ length: 50 }, (_, i) => {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as any;
      const severity = severities[Math.floor(Math.random() * severities.length)] as any;
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)] as any;
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      return {
        id: `event_${i + 1}`,
        timestamp,
        eventType,
        category: 'User Activity',
        action: `User ${eventType}`,
        actor: {
          type: 'user',
          id: `user_${Math.floor(Math.random() * 100)}`,
          name: `User ${Math.floor(Math.random() * 100)}`,
          email: `user${Math.floor(Math.random() * 100)}@company.com`,
          role: 'user',
          authentication: {
            method: 'sso',
            strength: 'strong',
            verified: true,
            factors: ['password', 'mfa']
          }
        },
        target: {
          type: 'system',
          id: 'system_1',
          name: 'AnnotateAI Platform',
          resource: '/api/v1/projects',
          sensitivity: 'internal',
          classification: ['business']
        },
        source: {
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          location: {
            country: 'United States',
            region: 'California',
            city: 'San Francisco',
            coordinates: [37.7749, -122.4194],
            timezone: 'America/Los_Angeles'
          },
          device: {
            type: 'desktop',
            os: 'Windows 10',
            browser: 'Chrome',
            fingerprint: 'abc123def456',
            trusted: true
          },
          network: {
            domain: 'company.com',
            proxy: false,
            vpn: false,
            tor: false,
            reputation: 'good'
          },
          application: 'AnnotateAI Web',
          version: '2.1.0'
        },
        outcome,
        severity,
        details: {
          description: `User performed ${eventType} action`,
          changes: [],
          context: { sessionId: `session_${i}` },
          evidence: []
        },
        metadata: {
          requestId: `req_${i}`,
          sessionId: `session_${i}`,
          tags: [eventType, 'user_activity'],
          classification: ['internal'],
          compliance: ['SOC2', 'GDPR'],
          custom: {}
        },
        correlation: {
          childIds: [],
          related: [],
          chain: [`event_${i}`],
          pattern: 'user_session'
        },
        retention: {
          policy: 'default',
          duration: 2555, // 7 years in days
          encrypted: true,
          immutable: true,
          archived: false
        }
      };
    });
  };

  const generateMockConfiguration = (): AuditConfiguration => ({
    enabled: true,
    eventTypes: [
      { type: 'login', enabled: true, level: 'all', retention: 2555, realtime: true, alerting: false },
      { type: 'logout', enabled: true, level: 'all', retention: 2555, realtime: true, alerting: false },
      { type: 'access', enabled: true, level: 'important', retention: 1095, realtime: true, alerting: false },
      { type: 'change', enabled: true, level: 'all', retention: 2555, realtime: true, alerting: true },
      { type: 'admin', enabled: true, level: 'all', retention: 2555, realtime: true, alerting: true },
      { type: 'security', enabled: true, level: 'critical', retention: 2555, realtime: true, alerting: true },
      { type: 'system', enabled: true, level: 'important', retention: 365, realtime: false, alerting: false },
      { type: 'data', enabled: true, level: 'all', retention: 2555, realtime: true, alerting: true }
    ],
    retention: {
      defaultDuration: 2555,
      policies: [
        { name: 'Security Events', eventTypes: ['security', 'admin'], duration: 2555, conditions: [], actions: [] },
        { name: 'System Events', eventTypes: ['system'], duration: 365, conditions: [], actions: [] }
      ],
      archiving: { enabled: true, threshold: 90, destination: 's3://audit-archive', compression: true, encryption: true },
      deletion: { enabled: true, verification: true, approval: true, secure: true }
    },
    storage: {
      primary: { type: 'database', configuration: {}, capacity: 1000000, availability: 99.9 },
      backup: { type: 'cloud', configuration: {}, capacity: 10000000, availability: 99.99 },
      replication: { enabled: true, replicas: 3, consistency: 'eventual', crossRegion: true },
      integrity: { hashing: true, signing: true, verification: true, frequency: 'daily' }
    },
    alerting: {
      enabled: true,
      rules: [
        { id: 'failed_logins', name: 'Multiple Failed Logins', condition: 'failed_login_count > 5', threshold: 5, severity: 'high', enabled: true },
        { id: 'admin_actions', name: 'Administrative Actions', condition: 'event_type == "admin"', threshold: 1, severity: 'medium', enabled: true }
      ],
      channels: [
        { type: 'email', configuration: { recipients: ['security@company.com'] }, enabled: true },
        { type: 'slack', configuration: { webhook: 'https://hooks.slack.com/...' }, enabled: true }
      ],
      escalation: [
        { level: 1, delay: 5, channels: ['email'], conditions: ['severity >= "high"'] },
        { level: 2, delay: 15, channels: ['email', 'slack'], conditions: ['severity == "critical"'] }
      ]
    },
    reporting: {
      enabled: true,
      automated: true,
      frequency: 'daily',
      recipients: ['compliance@company.com', 'security@company.com'],
      format: 'pdf',
      templates: [
        { id: 'daily_summary', name: 'Daily Security Summary', type: 'summary', content: ['events', 'alerts', 'failures'], filters: {} },
        { id: 'compliance_report', name: 'Compliance Report', type: 'compliance', content: ['frameworks', 'evidence', 'gaps'], filters: {} }
      ]
    },
    encryption: {
      atRest: true,
      inTransit: true,
      algorithm: 'AES-256',
      keyManagement: 'AWS KMS',
      rotation: true,
      rotationFrequency: 90
    },
    compliance: {
      frameworks: ['SOC2', 'GDPR', 'HIPAA', 'PCI-DSS'],
      mapping: [
        { framework: 'SOC2', requirement: 'CC6.1', eventTypes: ['access', 'change'], evidence: ['logs', 'reports'] },
        { framework: 'GDPR', requirement: 'Article 30', eventTypes: ['data', 'access'], evidence: ['logs', 'consent'] }
      ],
      validation: [
        { id: 'data_access', name: 'Data Access Validation', condition: 'event_type == "data"', severity: 'high', action: 'alert' }
      ],
      reporting: { automated: true, frequency: 'monthly', frameworks: ['SOC2', 'GDPR'], recipients: ['compliance@company.com'] }
    },
    performance: {
      indexing: true,
      compression: true,
      caching: true,
      partitioning: true,
      optimization: { enabled: true, strategies: ['indexing', 'partitioning'], thresholds: { cpu: 80, memory: 85 }, automation: true }
    }
  });

  const generateMockStatistics = (): AuditStatistics => ({
    totalEvents: 156324,
    eventsToday: 2847,
    criticalEvents: 12,
    failedEvents: 89,
    uniqueUsers: 1245,
    topEventTypes: [
      { type: 'access', count: 8940, percentage: 31.4, trend: 'stable' },
      { type: 'login', count: 6780, percentage: 23.8, trend: 'up' },
      { type: 'change', count: 4560, percentage: 16.0, trend: 'down' },
      { type: 'logout', count: 3240, percentage: 11.4, trend: 'stable' },
      { type: 'admin', count: 2180, percentage: 7.7, trend: 'up' }
    ],
    hourlyTrends: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      events: 80 + Math.floor(Math.random() * 40),
      critical: Math.floor(Math.random() * 3),
      failed: Math.floor(Math.random() * 8)
    })),
    severityDistribution: [
      { severity: 'low', count: 18945, percentage: 66.6 },
      { severity: 'medium', count: 7890, percentage: 27.7 },
      { severity: 'high', count: 1456, percentage: 5.1 },
      { severity: 'critical', count: 156, percentage: 0.5 }
    ],
    complianceStatus: { covered: 127, total: 145, percentage: 87.6, gaps: ['GDPR Article 25', 'SOC2 CC7.2'] }
  });

  if (!statistics || !configuration) {
    return (
      <div className="audit-system-panel p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Loading Audit System</h3>
          <p className="text-gray-600">Initializing audit logging and monitoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-system-panel p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Audit System</h2>
            <p className="text-gray-600">Enterprise audit logging and compliance monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Real-time</Label>
            <Switch checked={realTimeEnabled} onCheckedChange={setRealTimeEnabled} />
          </div>
          <Button variant="outline" onClick={() => exportEvents('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.totalEvents.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Events Today</p>
                <p className="text-2xl font-bold text-green-600">{statistics.eventsToday.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Events</p>
                <p className="text-2xl font-bold text-red-600">{statistics.criticalEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold text-purple-600">{statistics.uniqueUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Event Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Event Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.topEventTypes.map((eventType) => (
                  <div key={eventType.type} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getEventTypeIcon(eventType.type)}
                      <div>
                        <div className="font-medium capitalize">{eventType.type}</div>
                        <div className="text-sm text-gray-600">{eventType.count.toLocaleString()} events</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{eventType.percentage.toFixed(1)}%</span>
                      <span className="text-xs">{eventType.trend === 'up' ? '📈' : eventType.trend === 'down' ? '📉' : '➡️'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{statistics.complianceStatus.percentage.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">
                    {statistics.complianceStatus.covered} of {statistics.complianceStatus.total} requirements covered
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Coverage Gaps</Label>
                  <div className="space-y-1">
                    {statistics.complianceStatus.gaps.map((gap, index) => (
                      <div key={index} className="text-sm text-red-600">{gap}</div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {/* Event Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterEventType} onValueChange={setFilterEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="access">Access</SelectItem>
                    <SelectItem value="change">Change</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="data">Data</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Events ({filteredEvents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(event.severity)}
                      {getEventTypeIcon(event.eventType)}
                      <div>
                        <div className="font-medium">{event.action}</div>
                        <div className="text-sm text-gray-600">
                          {event.actor.name} • {event.target.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {event.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(event.outcome)} text-white text-xs`}>
                        {event.outcome}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Severity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.severityDistribution.map((severity) => (
                  <div key={severity.severity} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(severity.severity)}
                      <div>
                        <div className="font-medium capitalize">{severity.severity}</div>
                        <div className="text-sm text-gray-600">{severity.count.toLocaleString()} events</div>
                      </div>
                    </div>
                    <span className="text-sm">{severity.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Frameworks */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Frameworks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {configuration.compliance.frameworks.map((framework) => (
                  <div key={framework} className="p-4 border rounded">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{framework}</div>
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Audit logging configured for compliance requirements
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          {/* Audit Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Event Types Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {configuration.eventTypes.map((eventType) => (
                  <div key={eventType.type} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getEventTypeIcon(eventType.type)}
                      <div>
                        <div className="font-medium capitalize">{eventType.type}</div>
                        <div className="text-sm text-gray-600">
                          Level: {eventType.level} • Retention: {eventType.retention} days
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Enabled</Label>
                        <Switch checked={eventType.enabled} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Real-time</Label>
                        <Switch checked={eventType.realtime} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Alerting</Label>
                        <Switch checked={eventType.alerting} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Storage Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Storage Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Primary Storage</Label>
                    <Badge variant="outline">{configuration.storage.primary.type}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Backup Storage</Label>
                    <Badge variant="outline">{configuration.storage.backup.type}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Replication</Label>
                    <Switch checked={configuration.storage.replication.enabled} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Encryption at Rest</Label>
                    <Switch checked={configuration.encryption.atRest} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Encryption in Transit</Label>
                    <Switch checked={configuration.encryption.inTransit} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Integrity Checking</Label>
                    <Switch checked={configuration.storage.integrity.hashing} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 