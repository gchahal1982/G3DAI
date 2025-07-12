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
  Progress, 
  Alert, 
  AlertDescription, 
  ScrollArea, 
  Switch, 
  Slider, 
  Input, 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  Textarea, 
  Separator 
} from '../../../../../shared/components/ui';
import { 
  Cloud, 
  Server, 
  Database, 
  Network, 
  Monitor, 
  Settings, 
  Activity, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Zap, 
  Globe, 
  MapPin, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  RefreshCw, 
  Plus, 
  Minus, 
  Edit, 
  Trash2, 
  Save, 
  Copy, 
  Download, 
  Upload, 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  Calendar, 
  Timer, 
  Target, 
  Award, 
  Shield, 
  Lock, 
  Key, 
  Gauge, 
  Package, 
  Layers, 
  Box, 
  Archive, 
  FileText, 
  Folder, 
  ExternalLink, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  FastForward, 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  ArrowRight, 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react';

// Enhanced types for cloud integration
interface CloudProviderConfig {
  id: string;
  name: string;
  type: 'aws' | 'azure' | 'gcp' | 'alibaba' | 'private';
  status: 'connected' | 'disconnected' | 'error' | 'configuring' | 'syncing';
  credentials: CloudCredentials;
  regions: CloudRegion[];
  services: CloudServiceConfig[];
  billing: CloudBillingConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
  automation: AutomationConfig;
  quotas: QuotaConfig;
  metadata: CloudMetadata;
}

interface CloudCredentials {
  type: 'api_key' | 'service_account' | 'iam_role' | 'certificate' | 'oauth';
  configured: boolean;
  lastUpdated: Date;
  expiresAt?: Date;
  rotationPolicy: {
    enabled: boolean;
    interval: number; // days
    lastRotation?: Date;
  };
  permissions: Permission[];
  validation: {
    status: 'valid' | 'invalid' | 'expired' | 'unknown';
    lastChecked: Date;
    errors: string[];
  };
}

interface Permission {
  service: string;
  actions: string[];
  resources: string[];
  conditions?: Record<string, any>;
}

interface CloudRegion {
  id: string;
  name: string;
  displayName: string;
  location: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
  available: boolean;
  status: 'active' | 'maintenance' | 'degraded' | 'unavailable';
  latency: number;
  cost: {
    compute: number;
    storage: number;
    network: number;
  };
  services: string[];
  compliance: string[];
  capacity: {
    current: number;
    limit: number;
    unit: string;
  };
}

interface CloudServiceConfig {
  id: string;
  name: string;
  type: 'compute' | 'storage' | 'database' | 'network' | 'ai' | 'analytics' | 'security' | 'management';
  category: string;
  enabled: boolean;
  status: 'running' | 'stopped' | 'error' | 'pending' | 'configuring';
  region: string;
  configuration: ServiceConfiguration;
  instances: CloudInstance[];
  metrics: CloudMetrics;
  billing: ServiceBilling;
  scaling: ScalingConfig;
  backup: BackupConfig;
  monitoring: ServiceMonitoring;
}

interface ServiceConfiguration {
  version: string;
  parameters: Record<string, any>;
  environment: 'development' | 'staging' | 'production';
  tags: Record<string, string>;
  dependencies: string[];
  customConfig: Record<string, any>;
}

interface CloudInstance {
  id: string;
  name: string;
  type: string;
  size: string;
  status: 'running' | 'stopped' | 'terminated' | 'pending' | 'rebooting';
  region: string;
  zone: string;
  created: Date;
  lastStarted?: Date;
  uptime: number;
  specifications: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };
  utilization: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };
  cost: {
    hourly: number;
    monthly: number;
    total: number;
  };
  tags: Record<string, string>;
  securityGroups: string[];
  backup: {
    enabled: boolean;
    lastBackup?: Date;
    frequency: string;
  };
}

interface CloudMetrics {
  period: string;
  data: MetricData[];
  aggregated: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
    requests: number;
    errors: number;
    latency: number;
  };
  trends: {
    cpu: 'up' | 'down' | 'stable';
    memory: 'up' | 'down' | 'stable';
    storage: 'up' | 'down' | 'stable';
    network: 'up' | 'down' | 'stable';
  };
}

interface MetricData {
  timestamp: Date;
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  requests: number;
  errors: number;
  latency: number;
}

interface ServiceBilling {
  currentCost: number;
  projectedCost: number;
  billingPeriod: string;
  costBreakdown: CostItem[];
  optimization: {
    potential: number;
    recommendations: OptimizationRecommendation[];
  };
}

interface CostItem {
  category: string;
  amount: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

interface OptimizationRecommendation {
  type: 'rightsizing' | 'scheduling' | 'storage' | 'reserved_instances' | 'spot_instances';
  description: string;
  savings: number;
  effort: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
}

interface ScalingConfig {
  enabled: boolean;
  type: 'manual' | 'auto' | 'scheduled';
  minInstances: number;
  maxInstances: number;
  targetUtilization: number;
  cooldown: number;
  metrics: string[];
  policies: ScalingPolicy[];
}

interface ScalingPolicy {
  id: string;
  name: string;
  condition: string;
  action: 'scale_up' | 'scale_down';
  amount: number;
  cooldown: number;
}

interface BackupConfig {
  enabled: boolean;
  frequency: string;
  retention: number;
  encryption: boolean;
  compression: boolean;
  verification: boolean;
  destinations: BackupDestination[];
}

interface BackupDestination {
  type: 'local' | 'remote' | 'cross_region';
  location: string;
  encryption: boolean;
}

interface ServiceMonitoring {
  enabled: boolean;
  healthChecks: HealthCheck[];
  alerts: MonitoringAlert[];
  logs: LogConfig;
  metrics: MetricConfig[];
}

interface HealthCheck {
  id: string;
  name: string;
  type: 'http' | 'tcp' | 'ping' | 'script';
  endpoint: string;
  interval: number;
  timeout: number;
  retries: number;
  status: 'healthy' | 'unhealthy' | 'unknown';
}

interface MonitoringAlert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actions: string[];
  enabled: boolean;
}

interface LogConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  retention: number;
  compression: boolean;
  exportDestinations: string[];
}

interface MetricConfig {
  name: string;
  type: 'gauge' | 'counter' | 'histogram';
  unit: string;
  retention: number;
  aggregation: string[];
}

interface CloudBillingConfig {
  enabled: boolean;
  currency: string;
  billingPeriod: 'hourly' | 'daily' | 'monthly';
  costTracking: CostTrackingConfig;
  budgets: BudgetConfig[];
  optimization: CostOptimizationConfig;
  reporting: BillingReportConfig;
}

interface CostTrackingConfig {
  granularity: 'service' | 'resource' | 'tag';
  allocation: AllocationRule[];
  forecasting: {
    enabled: boolean;
    horizon: number; // days
    accuracy: number;
  };
}

interface AllocationRule {
  id: string;
  name: string;
  condition: string;
  allocation: string;
  percentage: number;
}

interface BudgetConfig {
  id: string;
  name: string;
  amount: number;
  period: string;
  scope: string;
  alerts: BudgetAlert[];
  actions: BudgetAction[];
}

interface BudgetAlert {
  threshold: number;
  type: 'actual' | 'forecasted';
  recipients: string[];
}

interface BudgetAction {
  trigger: number;
  action: 'stop_instances' | 'scale_down' | 'notification';
  parameters: Record<string, any>;
}

interface CostOptimizationConfig {
  enabled: boolean;
  automated: boolean;
  recommendations: {
    rightsizing: boolean;
    reservedInstances: boolean;
    spotInstances: boolean;
    storageOptimization: boolean;
    networkOptimization: boolean;
  };
  thresholds: {
    utilization: number;
    waste: number;
    efficiency: number;
  };
}

interface BillingReportConfig {
  automated: boolean;
  frequency: string;
  recipients: string[];
  format: 'pdf' | 'csv' | 'json';
  includeForecasts: boolean;
  includeRecommendations: boolean;
}

interface MonitoringConfig {
  enabled: boolean;
  realTime: boolean;
  retention: number; // days
  collection: {
    metrics: boolean;
    logs: boolean;
    traces: boolean;
    events: boolean;
  };
  alerting: AlertingConfig;
  dashboards: DashboardConfig[];
  integration: IntegrationConfig;
}

interface AlertingConfig {
  enabled: boolean;
  channels: AlertChannel[];
  rules: AlertRule[];
  escalation: EscalationPolicy[];
}

interface AlertChannel {
  type: 'email' | 'sms' | 'slack' | 'webhook' | 'pagerduty';
  configuration: Record<string, any>;
  enabled: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency: number;
  channels: string[];
}

interface EscalationPolicy {
  id: string;
  name: string;
  levels: EscalationLevel[];
}

interface EscalationLevel {
  delay: number;
  channels: string[];
  conditions: string[];
}

interface DashboardConfig {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  shared: boolean;
  autoRefresh: number;
}

interface DashboardWidget {
  type: 'metric' | 'chart' | 'table' | 'alert' | 'map';
  configuration: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
}

interface IntegrationConfig {
  external: ExternalIntegration[];
  apis: ApiConfiguration[];
  webhooks: WebhookConfiguration[];
}

interface ExternalIntegration {
  type: string;
  enabled: boolean;
  configuration: Record<string, any>;
  lastSync?: Date;
}

interface ApiConfiguration {
  version: string;
  authentication: string;
  rateLimit: number;
  endpoints: string[];
}

interface WebhookConfiguration {
  url: string;
  events: string[];
  authentication: Record<string, any>;
  retries: number;
}

interface SecurityConfig {
  encryption: EncryptionConfig;
  access: AccessConfig;
  networking: NetworkSecurityConfig;
  compliance: ComplianceConfig;
  auditing: AuditConfig;
}

interface EncryptionConfig {
  atRest: {
    enabled: boolean;
    algorithm: string;
    keyManagement: string;
  };
  inTransit: {
    enabled: boolean;
    protocols: string[];
    certificates: CertificateConfig[];
  };
}

interface CertificateConfig {
  type: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  autoRenewal: boolean;
}

interface AccessConfig {
  authentication: {
    methods: string[];
    mfa: boolean;
    sso: boolean;
  };
  authorization: {
    rbac: boolean;
    policies: PolicyConfig[];
  };
  sessions: {
    timeout: number;
    maxConcurrent: number;
  };
}

interface PolicyConfig {
  id: string;
  name: string;
  rules: PolicyRule[];
  subjects: string[];
}

interface PolicyRule {
  effect: 'allow' | 'deny';
  actions: string[];
  resources: string[];
  conditions?: Record<string, any>;
}

interface NetworkSecurityConfig {
  firewalls: FirewallRule[];
  vpn: VpnConfig;
  isolation: IsolationConfig;
}

interface FirewallRule {
  id: string;
  direction: 'inbound' | 'outbound';
  protocol: string;
  ports: string;
  sources: string[];
  destinations: string[];
  action: 'allow' | 'deny';
}

interface VpnConfig {
  enabled: boolean;
  type: string;
  endpoints: VpnEndpoint[];
}

interface VpnEndpoint {
  name: string;
  address: string;
  protocol: string;
  status: 'connected' | 'disconnected';
}

interface IsolationConfig {
  networkSegmentation: boolean;
  microSegmentation: boolean;
  zeroTrust: boolean;
}

interface ComplianceConfig {
  frameworks: string[];
  policies: CompliancePolicy[];
  assessments: ComplianceAssessment[];
}

interface CompliancePolicy {
  framework: string;
  controls: string[];
  status: 'compliant' | 'non_compliant' | 'partial';
}

interface ComplianceAssessment {
  id: string;
  framework: string;
  date: Date;
  score: number;
  findings: ComplianceFinding[];
}

interface ComplianceFinding {
  control: string;
  status: 'pass' | 'fail' | 'manual';
  description: string;
  remediation: string;
}

interface AuditConfig {
  enabled: boolean;
  events: string[];
  retention: number;
  encryption: boolean;
  immutable: boolean;
}

interface AutomationConfig {
  enabled: boolean;
  workflows: WorkflowConfig[];
  triggers: TriggerConfig[];
  actions: ActionConfig[];
}

interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  actions: string[];
  conditions: string[];
  enabled: boolean;
}

interface TriggerConfig {
  id: string;
  type: 'event' | 'schedule' | 'metric' | 'webhook';
  configuration: Record<string, any>;
  workflows: string[];
}

interface ActionConfig {
  id: string;
  type: 'instance' | 'service' | 'notification' | 'scaling' | 'backup';
  configuration: Record<string, any>;
  rollback: boolean;
}

interface QuotaConfig {
  limits: QuotaLimit[];
  usage: QuotaUsage[];
  alerts: QuotaAlert[];
  requests: QuotaRequest[];
}

interface QuotaLimit {
  resource: string;
  limit: number;
  unit: string;
  scope: string;
}

interface QuotaUsage {
  resource: string;
  used: number;
  limit: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface QuotaAlert {
  resource: string;
  threshold: number;
  enabled: boolean;
  channels: string[];
}

interface QuotaRequest {
  id: string;
  resource: string;
  currentLimit: number;
  requestedLimit: number;
  justification: string;
  status: 'pending' | 'approved' | 'denied';
  submittedAt: Date;
}

interface CloudMetadata {
  createdAt: Date;
  lastUpdated: Date;
  lastSync: Date;
  version: string;
  tags: Record<string, string>;
  documentation: string;
  contacts: Contact[];
}

interface Contact {
  role: string;
  name: string;
  email: string;
  phone?: string;
}

export default function CloudIntegrationPanel() {
  // State management
  const [providers, setProviders] = useState<CloudProviderConfig[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<CloudProviderConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  // Backend connection
  const cloudIntegrationRef = useRef<any>(null);

  // Initialize
  useEffect(() => {
    const initializeCloudIntegration = async () => {
      try {
        cloudIntegrationRef.current = {
          getProviders: async () => generateMockProviders(),
          updateProvider: async (id: string, config: Partial<CloudProviderConfig>) => {
            setProviders(prev => prev.map(p => p.id === id ? { ...p, ...config } : p));
          },
          syncProvider: async (id: string) => {
            setProviders(prev => prev.map(p => 
              p.id === id ? { ...p, status: 'syncing' as const, metadata: { ...p.metadata, lastSync: new Date() } } : p
            ));
            
            // Simulate sync completion
            setTimeout(() => {
              setProviders(prev => prev.map(p => 
                p.id === id ? { ...p, status: 'connected' as const } : p
              ));
            }, 3000);
          },
          getMetrics: async (providerId: string, timeRange: string) => {
            return generateMockMetrics(timeRange);
          }
        };

        const data = await cloudIntegrationRef.current.getProviders();
        setProviders(data);
        setSelectedProvider(data[0] || null);

      } catch (error) {
        console.error('Failed to initialize cloud integration:', error);
        setError('Failed to initialize cloud integration');
      }
    };

    initializeCloudIntegration();
  }, []);

  // Actions
  const syncProvider = useCallback(async (providerId: string) => {
    try {
      await cloudIntegrationRef.current?.syncProvider(providerId);
    } catch (error) {
      console.error('Failed to sync provider:', error);
      setError('Failed to sync provider');
    }
  }, []);

  const updateProviderConfig = useCallback(async (providerId: string, config: Partial<CloudProviderConfig>) => {
    try {
      await cloudIntegrationRef.current?.updateProvider(providerId, config);
    } catch (error) {
      console.error('Failed to update provider:', error);
      setError('Failed to update provider configuration');
    }
  }, []);

  // Utilities
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': case 'running': case 'healthy': return 'bg-green-500';
      case 'syncing': case 'pending': case 'configuring': return 'bg-blue-500';
      case 'error': case 'unhealthy': case 'critical': return 'bg-red-500';
      case 'disconnected': case 'stopped': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const getProviderIcon = (type: string) => {
    const icons = { aws: '🟠', azure: '🔵', gcp: '🟡', alibaba: '🟢', private: '🏢' };
    return icons[type as keyof typeof icons] || '☁️';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable': return <ArrowRight className="h-4 w-4 text-gray-500" />;
      default: return <ArrowRight className="h-4 w-4 text-gray-500" />;
    }
  };

  // Mock data generator
  const generateMockProviders = (): CloudProviderConfig[] => {
    return [
      {
        id: 'aws-prod',
        name: 'AWS Production',
        type: 'aws',
        status: 'connected',
        credentials: {
          type: 'iam_role',
          configured: true,
          lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          rotationPolicy: { enabled: true, interval: 90 },
          permissions: [
            { service: 'ec2', actions: ['*'], resources: ['*'] },
            { service: 's3', actions: ['GetObject', 'PutObject'], resources: ['arn:aws:s3:::my-bucket/*'] }
          ],
          validation: { status: 'valid', lastChecked: new Date(), errors: [] }
        },
        regions: [
          {
            id: 'us-east-1',
            name: 'us-east-1',
            displayName: 'US East (N. Virginia)',
            location: { country: 'USA', city: 'Virginia', coordinates: [39.0458, -77.4575] },
            available: true,
            status: 'active',
            latency: 45,
            cost: { compute: 0.10, storage: 0.023, network: 0.09 },
            services: ['ec2', 's3', 'rds', 'lambda'],
            compliance: ['SOC2', 'HIPAA', 'PCI'],
            capacity: { current: 75, limit: 100, unit: 'vCPUs' }
          }
        ],
        services: [
          {
            id: 'ec2-service',
            name: 'Elastic Compute Cloud',
            type: 'compute',
            category: 'Virtual Machines',
            enabled: true,
            status: 'running',
            region: 'us-east-1',
            configuration: {
              version: '2023.1',
              parameters: { instanceType: 't3.large', amiId: 'ami-12345' },
              environment: 'production',
              tags: { Environment: 'prod', Team: 'backend' },
              dependencies: ['vpc-service'],
              customConfig: { autoScaling: true }
            },
            instances: [
              {
                id: 'i-1234567890',
                name: 'web-server-1',
                type: 't3.large',
                size: 'Large',
                status: 'running',
                region: 'us-east-1',
                zone: 'us-east-1a',
                created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                lastStarted: new Date(Date.now() - 24 * 60 * 60 * 1000),
                uptime: 99.9,
                specifications: { cpu: 2, memory: 8, storage: 100, network: 1000 },
                utilization: { cpu: 45, memory: 60, storage: 75, network: 30 },
                cost: { hourly: 0.083, monthly: 60.22, total: 1844.52 },
                tags: { Name: 'web-server-1', Environment: 'prod' },
                securityGroups: ['sg-web', 'sg-default'],
                backup: { enabled: true, lastBackup: new Date(), frequency: 'daily' }
              }
            ],
            metrics: {
              period: '24h',
              data: Array.from({ length: 24 }, (_, i) => ({
                timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
                cpu: 40 + Math.random() * 20,
                memory: 55 + Math.random() * 15,
                storage: 70 + Math.random() * 10,
                network: 25 + Math.random() * 20,
                requests: 1000 + Math.random() * 500,
                errors: Math.random() * 5,
                latency: 200 + Math.random() * 100
              })),
              aggregated: { cpu: 45, memory: 60, storage: 75, network: 30, requests: 1250, errors: 2, latency: 245 },
              trends: { cpu: 'up', memory: 'stable', storage: 'up', network: 'down' }
            },
            billing: {
              currentCost: 1844.52,
              projectedCost: 2100.00,
              billingPeriod: 'monthly',
              costBreakdown: [
                { category: 'Compute', amount: 1200.00, unit: 'USD', trend: 'up' },
                { category: 'Storage', amount: 344.52, unit: 'USD', trend: 'stable' },
                { category: 'Network', amount: 300.00, unit: 'USD', trend: 'down' }
              ],
              optimization: {
                potential: 420.00,
                recommendations: [
                  { type: 'rightsizing', description: 'Downsize underutilized instances', savings: 250.00, effort: 'low', risk: 'low' },
                  { type: 'reserved_instances', description: 'Purchase reserved instances', savings: 170.00, effort: 'medium', risk: 'low' }
                ]
              }
            },
            scaling: {
              enabled: true,
              type: 'auto',
              minInstances: 2,
              maxInstances: 10,
              targetUtilization: 70,
              cooldown: 300,
              metrics: ['cpu', 'memory'],
              policies: [
                { id: 'scale-up', name: 'Scale Up', condition: 'cpu > 80%', action: 'scale_up', amount: 2, cooldown: 300 }
              ]
            },
            backup: {
              enabled: true,
              frequency: 'daily',
              retention: 30,
              encryption: true,
              compression: true,
              verification: true,
              destinations: [
                { type: 'cross_region', location: 'us-west-2', encryption: true }
              ]
            },
            monitoring: {
              enabled: true,
              healthChecks: [
                { id: 'http-check', name: 'HTTP Health Check', type: 'http', endpoint: '/health', interval: 60, timeout: 10, retries: 3, status: 'healthy' }
              ],
              alerts: [
                { id: 'cpu-alert', name: 'High CPU', condition: 'cpu > 80%', threshold: 80, severity: 'high', actions: ['email', 'slack'], enabled: true }
              ],
              logs: { enabled: true, level: 'info', retention: 30, compression: true, exportDestinations: ['cloudwatch'] },
              metrics: [
                { name: 'cpu_utilization', type: 'gauge', unit: 'percent', retention: 90, aggregation: ['avg', 'max'] }
              ]
            }
          }
        ],
        billing: {
          enabled: true,
          currency: 'USD',
          billingPeriod: 'monthly',
          costTracking: {
            granularity: 'service',
            allocation: [],
            forecasting: { enabled: true, horizon: 30, accuracy: 85 }
          },
          budgets: [
            {
              id: 'monthly-budget',
              name: 'Monthly Budget',
              amount: 5000,
              period: 'monthly',
              scope: 'account',
              alerts: [{ threshold: 80, type: 'actual', recipients: ['admin@company.com'] }],
              actions: [{ trigger: 100, action: 'notification', parameters: {} }]
            }
          ],
          optimization: {
            enabled: true,
            automated: false,
            recommendations: {
              rightsizing: true,
              reservedInstances: true,
              spotInstances: true,
              storageOptimization: true,
              networkOptimization: true
            },
            thresholds: { utilization: 70, waste: 20, efficiency: 80 }
          },
          reporting: {
            automated: true,
            frequency: 'monthly',
            recipients: ['finance@company.com'],
            format: 'pdf',
            includeForecasts: true,
            includeRecommendations: true
          }
        },
        monitoring: {
          enabled: true,
          realTime: true,
          retention: 90,
          collection: { metrics: true, logs: true, traces: true, events: true },
          alerting: {
            enabled: true,
            channels: [
              { type: 'email', configuration: { recipients: ['ops@company.com'] }, enabled: true },
              { type: 'slack', configuration: { webhook: 'https://hooks.slack.com/...' }, enabled: true }
            ],
            rules: [
              { id: 'high-cpu', name: 'High CPU Usage', condition: 'cpu > 80%', severity: 'high', frequency: 300, channels: ['email', 'slack'] }
            ],
            escalation: []
          },
          dashboards: [
            {
              id: 'overview',
              name: 'Overview Dashboard',
              widgets: [
                { type: 'metric', configuration: { metric: 'cpu', aggregation: 'avg' }, position: { x: 0, y: 0, width: 6, height: 4 } }
              ],
              shared: true,
              autoRefresh: 30
            }
          ],
          integration: {
            external: [],
            apis: [{ version: 'v1', authentication: 'api_key', rateLimit: 1000, endpoints: ['/metrics', '/logs'] }],
            webhooks: []
          }
        },
        security: {
          encryption: {
            atRest: { enabled: true, algorithm: 'AES-256', keyManagement: 'AWS KMS' },
            inTransit: {
              enabled: true,
              protocols: ['TLS 1.2', 'TLS 1.3'],
              certificates: [
                { type: 'SSL', issuer: 'LetsEncrypt', validFrom: new Date(), validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), autoRenewal: true }
              ]
            }
          },
          access: {
            authentication: { methods: ['iam', 'mfa'], mfa: true, sso: true },
            authorization: {
              rbac: true,
              policies: [
                { id: 'admin-policy', name: 'Admin Policy', rules: [{ effect: 'allow', actions: ['*'], resources: ['*'] }], subjects: ['admin-group'] }
              ]
            },
            sessions: { timeout: 3600, maxConcurrent: 3 }
          },
          networking: {
            firewalls: [
              { id: 'web-sg', direction: 'inbound', protocol: 'tcp', ports: '80,443', sources: ['0.0.0.0/0'], destinations: ['web-servers'], action: 'allow' }
            ],
            vpn: { enabled: true, type: 'site-to-site', endpoints: [{ name: 'office-vpn', address: '1.2.3.4', protocol: 'IPSec', status: 'connected' }] },
            isolation: { networkSegmentation: true, microSegmentation: false, zeroTrust: true }
          },
          compliance: {
            frameworks: ['SOC2', 'HIPAA'],
            policies: [
              { framework: 'SOC2', controls: ['CC1.1', 'CC2.1'], status: 'compliant' }
            ],
            assessments: []
          },
          auditing: { enabled: true, events: ['login', 'resource_access', 'configuration_change'], retention: 365, encryption: true, immutable: true }
        },
        automation: {
          enabled: true,
          workflows: [
            {
              id: 'auto-scale',
              name: 'Auto Scaling Workflow',
              description: 'Automatically scale instances based on CPU usage',
              triggers: ['cpu-threshold'],
              actions: ['scale-instances'],
              conditions: ['business-hours'],
              enabled: true
            }
          ],
          triggers: [
            { id: 'cpu-threshold', type: 'metric', configuration: { metric: 'cpu', threshold: 80 }, workflows: ['auto-scale'] }
          ],
          actions: [
            { id: 'scale-instances', type: 'scaling', configuration: { action: 'scale_up', amount: 1 }, rollback: true }
          ]
        },
        quotas: {
          limits: [
            { resource: 'vpc', limit: 5, unit: 'count', scope: 'region' },
            { resource: 'ec2_instances', limit: 20, unit: 'count', scope: 'region' }
          ],
          usage: [
            { resource: 'vpc', used: 3, limit: 5, percentage: 60, trend: 'stable' },
            { resource: 'ec2_instances', used: 15, limit: 20, percentage: 75, trend: 'up' }
          ],
          alerts: [
            { resource: 'ec2_instances', threshold: 90, enabled: true, channels: ['email'] }
          ],
          requests: []
        },
        metadata: {
          createdAt: new Date(2023, 0, 15),
          lastUpdated: new Date(),
          lastSync: new Date(Date.now() - 5 * 60 * 1000),
          version: '2.1.0',
          tags: { Environment: 'production', Team: 'infrastructure' },
          documentation: 'https://docs.company.com/aws-setup',
          contacts: [
            { role: 'Technical Lead', name: 'John Doe', email: 'john.doe@company.com' },
            { role: 'Operations', name: 'Jane Smith', email: 'jane.smith@company.com', phone: '+1-555-0123' }
          ]
        }
      }
    ];
  };

  const generateMockMetrics = (timeRange: string): MetricData[] => {
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    return Array.from({ length: hours }, (_, i) => ({
      timestamp: new Date(Date.now() - (hours - i) * 60 * 60 * 1000),
      cpu: 40 + Math.random() * 30,
      memory: 50 + Math.random() * 25,
      storage: 60 + Math.random() * 20,
      network: 30 + Math.random() * 40,
      requests: 1000 + Math.random() * 1000,
      errors: Math.random() * 10,
      latency: 200 + Math.random() * 150
    }));
  };

  if (!selectedProvider) {
    return (
      <div className="cloud-integration-panel p-6">
        <div className="text-center py-12">
          <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Cloud Provider Selected</h3>
          <p className="text-gray-600">Select a cloud provider to view detailed configuration and metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cloud-integration-panel p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getProviderIcon(selectedProvider.type)}</span>
          <div>
            <h2 className="text-2xl font-bold">{selectedProvider.name}</h2>
            <p className="text-gray-600">{selectedProvider.type.toUpperCase()} Cloud Integration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(selectedProvider.status)} text-white`}>
            {selectedProvider.status}
          </Badge>
          <Button variant="outline" onClick={() => syncProvider(selectedProvider.id)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync
          </Button>
          <Button variant="outline" onClick={() => setShowConfigModal(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configure
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Services</p>
                <p className="text-2xl font-bold">{selectedProvider.services.length}</p>
              </div>
              <Server className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Regions</p>
                <p className="text-2xl font-bold">{selectedProvider.regions.length}</p>
              </div>
              <Globe className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                <p className="text-2xl font-bold">
                  ${selectedProvider.services.reduce((sum, service) => sum + service.billing.currentCost, 0).toFixed(0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold">
                  {selectedProvider.services.length > 0 ? 
                    (selectedProvider.services.reduce((sum, service) => 
                      sum + service.instances.reduce((instanceSum, instance) => instanceSum + instance.uptime, 0)
                    , 0) / selectedProvider.services.reduce((sum, service) => sum + service.instances.length, 0)).toFixed(1)
                    : '0'
                  }%
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Provider Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Provider Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {selectedProvider.services.filter(s => s.status === 'running').length}
                  </div>
                  <div className="text-sm text-gray-600">Running Services</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {selectedProvider.regions.filter(r => r.available).length}
                  </div>
                  <div className="text-sm text-gray-600">Available Regions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {selectedProvider.quotas.usage.reduce((sum, quota) => sum + quota.percentage, 0) / selectedProvider.quotas.usage.length}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Quota Usage</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resource Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedProvider.services[0]?.metrics.aggregated && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>CPU Usage</span>
                        <span>{selectedProvider.services[0].metrics.aggregated.cpu.toFixed(1)}%</span>
                      </div>
                      <Progress value={selectedProvider.services[0].metrics.aggregated.cpu} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Memory Usage</span>
                        <span>{selectedProvider.services[0].metrics.aggregated.memory.toFixed(1)}%</span>
                      </div>
                      <Progress value={selectedProvider.services[0].metrics.aggregated.memory} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Storage Usage</span>
                        <span>{selectedProvider.services[0].metrics.aggregated.storage.toFixed(1)}%</span>
                      </div>
                      <Progress value={selectedProvider.services[0].metrics.aggregated.storage} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Network Usage</span>
                        <span>{selectedProvider.services[0].metrics.aggregated.network.toFixed(1)}%</span>
                      </div>
                      <Progress value={selectedProvider.services[0].metrics.aggregated.network} className="h-2" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedProvider.services[0]?.billing.costBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.category}</span>
                        {getTrendIcon(item.trend)}
                      </div>
                      <span className="font-bold">${item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          {/* Service Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {selectedProvider.regions.map(region => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="compute">Compute</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="network">Network</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Services List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedProvider.services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{service.name}</CardTitle>
                      <p className="text-sm text-gray-600">{service.category} • {service.region}</p>
                    </div>
                    <Badge className={`${getStatusColor(service.status)} text-white`}>
                      {service.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Instances:</span>
                      <span className="ml-2 font-medium">{service.instances.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cost:</span>
                      <span className="ml-2 font-medium">${service.billing.currentCost.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">CPU:</span>
                      <span className="ml-2 font-medium">{service.metrics.aggregated.cpu.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Memory:</span>
                      <span className="ml-2 font-medium">{service.metrics.aggregated.memory.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Resource Utilization</Label>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>CPU</span>
                        <span>{service.metrics.aggregated.cpu.toFixed(1)}%</span>
                      </div>
                      <Progress value={service.metrics.aggregated.cpu} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Memory</span>
                        <span>{service.metrics.aggregated.memory.toFixed(1)}%</span>
                      </div>
                      <Progress value={service.metrics.aggregated.memory} className="h-1" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Metrics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Monitoring Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Real-time Monitoring
                </CardTitle>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="24h">24 Hours</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedProvider.services[0]?.metrics.aggregated.requests.toFixed(0) || '0'}
                  </div>
                  <div className="text-sm text-gray-600">Requests/sec</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {selectedProvider.services[0]?.metrics.aggregated.errors.toFixed(0) || '0'}
                  </div>
                  <div className="text-sm text-gray-600">Errors/sec</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedProvider.services[0]?.metrics.aggregated.latency.toFixed(0) || '0'}ms
                  </div>
                  <div className="text-sm text-gray-600">Avg Latency</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-purple-600">99.9%</div>
                  <div className="text-sm text-gray-600">Availability</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedProvider.services[0]?.monitoring.alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(alert.severity)} text-white`}>
                        {alert.severity}
                      </Badge>
                      <div>
                        <div className="font-medium">{alert.name}</div>
                        <div className="text-sm text-gray-600">{alert.condition}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={alert.enabled} />
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {/* Billing Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  ${selectedProvider.services.reduce((sum, service) => sum + service.billing.currentCost, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <TrendingUp className="h-4 w-4 inline mr-1" />
                  +5.2% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Projected Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  ${selectedProvider.services.reduce((sum, service) => sum + service.billing.projectedCost, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <TrendingUp className="h-4 w-4 inline mr-1" />
                  Based on current usage
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Optimization Potential</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ${selectedProvider.services.reduce((sum, service) => sum + service.billing.optimization.potential, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <Target className="h-4 w-4 inline mr-1" />
                  Potential monthly savings
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Optimization */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Optimization Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedProvider.services[0]?.billing.optimization.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{rec.description}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Badge variant="outline">{rec.effort} effort</Badge>
                          <Badge variant="outline">{rec.risk} risk</Badge>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">${rec.savings.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">monthly savings</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Security Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Encryption Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">At Rest</span>
                    {selectedProvider.security.encryption.atRest.enabled ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">In Transit</span>
                    {selectedProvider.security.encryption.inTransit.enabled ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Access Control</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">MFA Required</span>
                    {selectedProvider.security.access.authentication.mfa ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">RBAC Enabled</span>
                    {selectedProvider.security.access.authorization.rbac ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedProvider.security.compliance.frameworks.map((framework, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {framework}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Policies */}
          <Card>
            <CardHeader>
              <CardTitle>Security Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedProvider.security.access.authorization.policies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{policy.name}</div>
                      <div className="text-sm text-gray-600">
                        {policy.rules.length} rules • {policy.subjects.length} subjects
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          {/* Automation Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automation Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedProvider.automation.workflows.length}
                  </div>
                  <div className="text-sm text-gray-600">Active Workflows</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedProvider.automation.triggers.length}
                  </div>
                  <div className="text-sm text-gray-600">Configured Triggers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedProvider.automation.actions.length}
                  </div>
                  <div className="text-sm text-gray-600">Available Actions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflows */}
          <Card>
            <CardHeader>
              <CardTitle>Automation Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedProvider.automation.workflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{workflow.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{workflow.description}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{workflow.triggers.length} triggers</Badge>
                        <Badge variant="outline">{workflow.actions.length} actions</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={workflow.enabled} />
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 