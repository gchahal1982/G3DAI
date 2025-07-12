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
  Input, 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  Textarea, 
  Separator 
} from '../../../../../../shared/components/ui';
import { 
  Building2, 
  Cloud, 
  Shield, 
  Users, 
  Settings, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity, 
  Database, 
  Server, 
  Globe, 
  Lock, 
  Unlock, 
  Key, 
  UserCheck, 
  UserX, 
  Plus, 
  Minus, 
  Edit, 
  Trash2, 
  Save, 
  Copy, 
  Download, 
  Upload, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Network, 
  Gauge, 
  Timer, 
  DollarSign, 
  CreditCard, 
  PieChart, 
  LineChart, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Zap, 
  Target, 
  Award, 
  Star, 
  Heart, 
  Bookmark, 
  Flag, 
  Bell, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon, 
  FileText, 
  Folder, 
  Archive, 
  Package, 
  Truck, 
  Plane, 
  Ship, 
  Home, 
  Building, 
  Factory, 
  Store, 
  Briefcase, 
  GraduationCap, 
  Stethoscope 
} from 'lucide-react';

// Types from CloudIntegration backend
interface CloudProvider {
  id: string;
  name: string;
  type: 'aws' | 'azure' | 'gcp' | 'alibaba' | 'private';
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  regions: CloudRegion[];
  services: CloudService[];
  credentials: CloudCredentials;
  billing: CloudBilling;
  quotas: CloudQuotas;
  lastSync: Date;
}

interface CloudRegion {
  id: string;
  name: string;
  location: string;
  available: boolean;
  latency: number;
  cost: number;
  services: string[];
}

interface CloudService {
  id: string;
  name: string;
  type: 'compute' | 'storage' | 'database' | 'network' | 'ai' | 'analytics';
  status: 'running' | 'stopped' | 'error' | 'pending';
  region: string;
  instances: CloudInstance[];
  metrics: CloudMetrics;
  cost: number;
}

interface CloudInstance {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'terminated' | 'pending';
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  uptime: number;
  cost: number;
}

interface CloudMetrics {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  requests: number;
  errors: number;
  latency: number;
}

interface CloudCredentials {
  type: 'api_key' | 'service_account' | 'iam_role' | 'certificate';
  configured: boolean;
  lastUpdated: Date;
  expiresAt?: Date;
  permissions: string[];
}

interface CloudBilling {
  currentCost: number;
  projectedCost: number;
  lastBill: number;
  billingPeriod: 'monthly' | 'yearly';
  costBreakdown: CostBreakdown[];
  alerts: BillingAlert[];
}

interface CostBreakdown {
  service: string;
  cost: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface BillingAlert {
  id: string;
  type: 'budget' | 'spike' | 'forecast';
  threshold: number;
  current: number;
  severity: 'low' | 'medium' | 'high';
  triggered: Date;
}

interface CloudQuotas {
  compute: QuotaLimit;
  storage: QuotaLimit;
  network: QuotaLimit;
  apis: QuotaLimit;
}

interface QuotaLimit {
  used: number;
  limit: number;
  percentage: number;
  unit: string;
}

interface Organization {
  id: string;
  name: string;
  domain: string;
  tier: 'starter' | 'professional' | 'enterprise' | 'custom';
  status: 'active' | 'suspended' | 'trial' | 'expired';
  users: OrganizationUser[];
  settings: OrganizationSettings;
  billing: OrganizationBilling;
  compliance: ComplianceStatus;
  createdAt: Date;
  lastActivity: Date;
}

interface OrganizationUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'manager' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  lastLogin: Date;
  permissions: string[];
  groups: string[];
}

interface OrganizationSettings {
  sso: SSOConfiguration;
  security: SecuritySettings;
  features: FeatureFlags;
  branding: BrandingSettings;
  notifications: NotificationSettings;
}

interface SSOConfiguration {
  enabled: boolean;
  provider: 'azure_ad' | 'okta' | 'google' | 'saml' | 'oidc' | 'custom';
  domain: string;
  autoProvisioning: boolean;
  groupMapping: Record<string, string>;
  attributes: SSOAttributes;
  lastSync: Date;
}

interface SSOAttributes {
  email: string;
  name: string;
  groups: string;
  department: string;
  title: string;
}

interface SecuritySettings {
  mfa: {
    required: boolean;
    methods: string[];
    grace_period: number;
  };
  passwordPolicy: {
    minLength: number;
    requireSymbols: boolean;
    requireNumbers: boolean;
    requireUppercase: boolean;
    expirationDays: number;
  };
  sessionManagement: {
    timeout: number;
    maxSessions: number;
    concurrentSessions: boolean;
  };
  ipWhitelist: string[];
  apiRateLimit: number;
}

interface FeatureFlags {
  advanced_analytics: boolean;
  ai_workflows: boolean;
  custom_integrations: boolean;
  priority_support: boolean;
  white_labeling: boolean;
  audit_logs: boolean;
  compliance_reporting: boolean;
  custom_roles: boolean;
}

interface BrandingSettings {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain: string;
  favicon: string;
  customCSS: string;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  slack: boolean;
  webhook: string;
  alerts: string[];
}

interface OrganizationBilling {
  plan: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  nextBilling: Date;
  paymentMethod: PaymentMethod;
  usage: UsageMetrics;
  invoices: Invoice[];
}

interface PaymentMethod {
  type: 'card' | 'bank' | 'invoice';
  last4: string;
  brand: string;
  expiresAt: Date;
}

interface UsageMetrics {
  users: number;
  storage: number;
  apiCalls: number;
  computeHours: number;
  dataTransfer: number;
}

interface Invoice {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'failed';
  dueDate: Date;
  paidAt?: Date;
}

interface ComplianceStatus {
  frameworks: ComplianceFramework[];
  certifications: Certification[];
  audits: AuditRecord[];
  policies: PolicyDocument[];
  lastAssessment: Date;
  score: number;
}

interface ComplianceFramework {
  name: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
  requirements: ComplianceRequirement[];
  lastCheck: Date;
}

interface ComplianceRequirement {
  id: string;
  description: string;
  status: 'met' | 'not_met' | 'partial' | 'not_applicable';
  evidence: string[];
  lastVerified: Date;
}

interface Certification {
  name: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  status: 'valid' | 'expired' | 'pending' | 'revoked';
  document: string;
}

interface AuditRecord {
  id: string;
  type: 'internal' | 'external' | 'automated';
  auditor: string;
  startDate: Date;
  endDate: Date;
  status: 'completed' | 'in_progress' | 'scheduled';
  findings: AuditFinding[];
  report: string;
}

interface AuditFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted';
}

interface PolicyDocument {
  id: string;
  name: string;
  version: string;
  category: string;
  status: 'active' | 'draft' | 'archived';
  lastUpdated: Date;
  approvedBy: string;
  content: string;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  uptime: number;
  performance: PerformanceMetrics;
  security: SecurityMetrics;
  compliance: ComplianceMetrics;
  lastCheck: Date;
}

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
}

interface SecurityMetrics {
  vulnerabilities: number;
  threats: number;
  incidents: number;
  lastSecurityScan: Date;
}

interface ComplianceMetrics {
  score: number;
  violations: number;
  controls: number;
  lastAssessment: Date;
}

export default function EnterpriseDashboard() {
  // State management
  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Backend connections
  const cloudIntegrationRef = useRef<any>(null);
  const enterpriseSSORef = useRef<any>(null);
  const complianceRef = useRef<any>(null);

  // Initialize backend connections
  useEffect(() => {
    const initializeBackends = async () => {
      try {
        // Initialize cloud integration service
        cloudIntegrationRef.current = {
          getCloudProviders: async () => {
            return generateMockCloudProviders();
          },
          addCloudProvider: async (provider: Partial<CloudProvider>) => {
            const newProvider = {
              ...provider,
              id: `provider_${Date.now()}`,
              status: 'configuring' as const,
              lastSync: new Date()
            };
            setCloudProviders(prev => [...prev, newProvider as CloudProvider]);
            return newProvider;
          },
          syncCloudProvider: async (providerId: string) => {
            setCloudProviders(prev => prev.map(p => 
              p.id === providerId ? { ...p, lastSync: new Date(), status: 'connected' as const } : p
            ));
          },
          getSystemHealth: async () => {
            return generateMockSystemHealth();
          }
        };

        // Initialize enterprise SSO service
        enterpriseSSORef.current = {
          getOrganizations: async () => {
            return generateMockOrganizations();
          },
          createOrganization: async (org: Partial<Organization>) => {
            const newOrg = {
              ...org,
              id: `org_${Date.now()}`,
              status: 'active' as const,
              createdAt: new Date(),
              lastActivity: new Date()
            };
            setOrganizations(prev => [...prev, newOrg as Organization]);
            return newOrg;
          },
          updateSSOConfiguration: async (orgId: string, ssoConfig: Partial<SSOConfiguration>) => {
            setOrganizations(prev => prev.map(org => 
              org.id === orgId ? {
                ...org,
                settings: {
                  ...org.settings,
                  sso: { ...org.settings.sso, ...ssoConfig }
                }
              } : org
            ));
          }
        };

        // Initialize compliance service
        complianceRef.current = {
          getComplianceStatus: async (orgId: string) => {
            return generateMockComplianceStatus();
          },
          runComplianceCheck: async (orgId: string, framework: string) => {
            return {
              score: 85 + Math.random() * 10,
              violations: Math.floor(Math.random() * 5),
              newFindings: Math.floor(Math.random() * 3)
            };
          }
        };

        // Load initial data
        const [providersData, orgsData, healthData] = await Promise.all([
          cloudIntegrationRef.current.getCloudProviders(),
          enterpriseSSORef.current.getOrganizations(),
          cloudIntegrationRef.current.getSystemHealth()
        ]);

        setCloudProviders(providersData);
        setOrganizations(orgsData);
        setSelectedOrg(orgsData[0] || null);
        setSystemHealth(healthData);

      } catch (error) {
        console.error('Failed to initialize enterprise backends:', error);
        setError('Failed to initialize enterprise dashboard');
      }
    };

    initializeBackends();

    // Set up real-time updates
    const interval = setInterval(async () => {
      if (cloudIntegrationRef.current) {
        const healthData = await cloudIntegrationRef.current.getSystemHealth();
        setSystemHealth(healthData);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Add cloud provider
  const addCloudProvider = useCallback(async (providerData: Partial<CloudProvider>) => {
    setLoading(true);
    try {
      await cloudIntegrationRef.current?.addCloudProvider(providerData);
      setShowCloudModal(false);
    } catch (error) {
      console.error('Failed to add cloud provider:', error);
      setError('Failed to add cloud provider');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create organization
  const createOrganization = useCallback(async (orgData: Partial<Organization>) => {
    setLoading(true);
    try {
      await enterpriseSSORef.current?.createOrganization(orgData);
      setShowAddOrgModal(false);
    } catch (error) {
      console.error('Failed to create organization:', error);
      setError('Failed to create organization');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync cloud provider
  const syncCloudProvider = useCallback(async (providerId: string) => {
    try {
      await cloudIntegrationRef.current?.syncCloudProvider(providerId);
    } catch (error) {
      console.error('Failed to sync cloud provider:', error);
      setError('Failed to sync cloud provider');
    }
  }, []);

  // Update SSO configuration
  const updateSSO = useCallback(async (orgId: string, ssoConfig: Partial<SSOConfiguration>) => {
    try {
      await enterpriseSSORef.current?.updateSSOConfiguration(orgId, ssoConfig);
    } catch (error) {
      console.error('Failed to update SSO configuration:', error);
      setError('Failed to update SSO configuration');
    }
  }, []);

  // Filter organizations
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || org.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'running':
      case 'healthy': return 'bg-green-500';
      case 'warning':
      case 'pending':
      case 'trial': return 'bg-yellow-500';
      case 'error':
      case 'critical':
      case 'suspended':
      case 'disconnected': return 'bg-red-500';
      case 'inactive':
      case 'stopped':
      case 'expired': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  // Get provider icon
  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'aws': return '🟠';
      case 'azure': return '🔵';
      case 'gcp': return '🟡';
      case 'alibaba': return '🟢';
      case 'private': return '🏢';
      default: return '☁️';
    }
  };

  // Mock data generators
  const generateMockCloudProviders = (): CloudProvider[] => {
    return [
      {
        id: 'aws-1',
        name: 'AWS Production',
        type: 'aws',
        status: 'connected',
        regions: [
          { id: 'us-east-1', name: 'US East (N. Virginia)', location: 'Virginia, USA', available: true, latency: 45, cost: 0.10, services: ['ec2', 's3', 'rds'] },
          { id: 'us-west-2', name: 'US West (Oregon)', location: 'Oregon, USA', available: true, latency: 78, cost: 0.11, services: ['ec2', 's3', 'lambda'] }
        ],
        services: [
          {
            id: 'ec2-prod',
            name: 'EC2 Production',
            type: 'compute',
            status: 'running',
            region: 'us-east-1',
            instances: [
              { id: 'i-1234567890', name: 'web-server-1', type: 't3.large', status: 'running', cpu: 45, memory: 60, storage: 80, network: 30, uptime: 99.9, cost: 156.50 },
              { id: 'i-0987654321', name: 'api-server-1', type: 'm5.xlarge', status: 'running', cpu: 62, memory: 75, storage: 45, network: 55, uptime: 99.8, cost: 289.30 }
            ],
            metrics: { cpu: 53, memory: 67, storage: 62, network: 42, requests: 15430, errors: 12, latency: 245 },
            cost: 445.80
          }
        ],
        credentials: {
          type: 'iam_role',
          configured: true,
          lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          permissions: ['ec2:*', 's3:*', 'rds:*']
        },
        billing: {
          currentCost: 1284.50,
          projectedCost: 1420.00,
          lastBill: 1156.80,
          billingPeriod: 'monthly',
          costBreakdown: [
            { service: 'EC2', cost: 685.30, percentage: 53.4, trend: 'up' },
            { service: 'S3', cost: 234.20, percentage: 18.2, trend: 'stable' },
            { service: 'RDS', cost: 365.00, percentage: 28.4, trend: 'down' }
          ],
          alerts: [
            { id: 'alert-1', type: 'budget', threshold: 1500, current: 1284.50, severity: 'medium', triggered: new Date() }
          ]
        },
        quotas: {
          compute: { used: 145, limit: 200, percentage: 72.5, unit: 'vCPUs' },
          storage: { used: 2.3, limit: 5.0, percentage: 46.0, unit: 'TB' },
          network: { used: 850, limit: 1000, percentage: 85.0, unit: 'GB/month' },
          apis: { used: 95000, limit: 100000, percentage: 95.0, unit: 'requests/hour' }
        },
        lastSync: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: 'azure-1',
        name: 'Azure Development',
        type: 'azure',
        status: 'connected',
        regions: [
          { id: 'east-us', name: 'East US', location: 'Virginia, USA', available: true, latency: 52, cost: 0.12, services: ['vm', 'storage', 'sql'] }
        ],
        services: [
          {
            id: 'vm-dev',
            name: 'Virtual Machines',
            type: 'compute',
            status: 'running',
            region: 'east-us',
            instances: [
              { id: 'vm-dev-1', name: 'dev-server-1', type: 'Standard_B2s', status: 'running', cpu: 35, memory: 50, storage: 70, network: 25, uptime: 98.5, cost: 87.60 }
            ],
            metrics: { cpu: 35, memory: 50, storage: 70, network: 25, requests: 3420, errors: 5, latency: 185 },
            cost: 87.60
          }
        ],
        credentials: {
          type: 'service_account',
          configured: true,
          lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          permissions: ['Contributor', 'Storage Account Contributor']
        },
        billing: {
          currentCost: 234.80,
          projectedCost: 250.00,
          lastBill: 218.90,
          billingPeriod: 'monthly',
          costBreakdown: [
            { service: 'Virtual Machines', cost: 156.30, percentage: 66.6, trend: 'up' },
            { service: 'Storage', cost: 45.20, percentage: 19.3, trend: 'stable' },
            { service: 'Networking', cost: 33.30, percentage: 14.1, trend: 'stable' }
          ],
          alerts: []
        },
        quotas: {
          compute: { used: 32, limit: 100, percentage: 32.0, unit: 'vCPUs' },
          storage: { used: 0.8, limit: 2.0, percentage: 40.0, unit: 'TB' },
          network: { used: 150, limit: 500, percentage: 30.0, unit: 'GB/month' },
          apis: { used: 15000, limit: 50000, percentage: 30.0, unit: 'requests/hour' }
        },
        lastSync: new Date(Date.now() - 10 * 60 * 1000)
      }
    ];
  };

  const generateMockOrganizations = (): Organization[] => {
    return [
      {
        id: 'org-1',
        name: 'Acme Corporation',
        domain: 'acme.com',
        tier: 'enterprise',
        status: 'active',
        users: [
          { id: 'user-1', email: 'admin@acme.com', name: 'John Admin', role: 'owner', status: 'active', lastLogin: new Date(), permissions: ['*'], groups: ['admins'] },
          { id: 'user-2', email: 'manager@acme.com', name: 'Jane Manager', role: 'manager', status: 'active', lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), permissions: ['read', 'write'], groups: ['managers'] }
        ],
        settings: {
          sso: {
            enabled: true,
            provider: 'azure_ad',
            domain: 'acme.com',
            autoProvisioning: true,
            groupMapping: { 'Engineering': 'engineers', 'Sales': 'sales' },
            attributes: { email: 'mail', name: 'displayName', groups: 'groups', department: 'department', title: 'jobTitle' },
            lastSync: new Date(Date.now() - 30 * 60 * 1000)
          },
          security: {
            mfa: { required: true, methods: ['totp', 'sms'], grace_period: 30 },
            passwordPolicy: { minLength: 12, requireSymbols: true, requireNumbers: true, requireUppercase: true, expirationDays: 90 },
            sessionManagement: { timeout: 480, maxSessions: 3, concurrentSessions: true },
            ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
            apiRateLimit: 1000
          },
          features: {
            advanced_analytics: true,
            ai_workflows: true,
            custom_integrations: true,
            priority_support: true,
            white_labeling: true,
            audit_logs: true,
            compliance_reporting: true,
            custom_roles: true
          },
          branding: {
            logo: '/logos/acme-logo.png',
            primaryColor: '#007acc',
            secondaryColor: '#333333',
            customDomain: 'annotation.acme.com',
            favicon: '/favicon/acme.ico',
            customCSS: '.header { background: #007acc; }'
          },
          notifications: {
            email: true,
            sms: false,
            slack: true,
            webhook: 'https://hooks.slack.com/services/...',
            alerts: ['security', 'billing', 'downtime']
          }
        },
        billing: {
          plan: 'Enterprise Pro',
          price: 2499.99,
          billingCycle: 'monthly',
          nextBilling: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          paymentMethod: { type: 'card', last4: '4242', brand: 'Visa', expiresAt: new Date(2025, 11, 31) },
          usage: { users: 125, storage: 2.8, apiCalls: 45000, computeHours: 1850, dataTransfer: 890 },
          invoices: [
            { id: 'inv-001', amount: 2499.99, status: 'paid', dueDate: new Date(), paidAt: new Date() },
            { id: 'inv-002', amount: 2499.99, status: 'paid', dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), paidAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) }
          ]
        },
        compliance: {
          frameworks: [
            {
              name: 'SOC 2 Type II',
              status: 'compliant',
              requirements: [
                { id: 'cc1.1', description: 'Control Environment', status: 'met', evidence: ['policy-doc.pdf'], lastVerified: new Date() }
              ],
              lastCheck: new Date()
            }
          ],
          certifications: [
            { name: 'ISO 27001', issuer: 'BSI', validFrom: new Date(2023, 0, 1), validTo: new Date(2026, 0, 1), status: 'valid', document: 'iso27001-cert.pdf' }
          ],
          audits: [
            { id: 'audit-1', type: 'external', auditor: 'KPMG', startDate: new Date(2023, 6, 1), endDate: new Date(2023, 6, 30), status: 'completed', findings: [], report: 'audit-report-2023.pdf' }
          ],
          policies: [
            { id: 'pol-1', name: 'Information Security Policy', version: '2.1', category: 'Security', status: 'active', lastUpdated: new Date(), approvedBy: 'CISO', content: '...' }
          ],
          lastAssessment: new Date(),
          score: 94.2
        },
        createdAt: new Date(2023, 0, 15),
        lastActivity: new Date()
      }
    ];
  };

  const generateMockSystemHealth = (): SystemHealth => {
    return {
      overall: 'healthy',
      uptime: 99.97,
      performance: {
        responseTime: 245,
        throughput: 15430,
        errorRate: 0.08,
        availability: 99.97
      },
      security: {
        vulnerabilities: 0,
        threats: 2,
        incidents: 0,
        lastSecurityScan: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      compliance: {
        score: 94.2,
        violations: 0,
        controls: 127,
        lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      lastCheck: new Date()
    };
  };

  const generateMockComplianceStatus = (): ComplianceStatus => {
    return generateMockOrganizations()[0].compliance;
  };

  return (
    <div className="enterprise-dashboard p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Enterprise Management</h1>
            <p className="text-gray-600">Multi-cloud infrastructure and organization management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCloudModal(true)}>
            <Cloud className="h-4 w-4 mr-2" />
            Add Cloud Provider
          </Button>
          <Button onClick={() => setShowAddOrgModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Organization
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

      {/* System Health Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
              <Badge className={`${getStatusColor(systemHealth.overall)} text-white`}>
                {systemHealth.overall}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemHealth.uptime}%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{systemHealth.performance.responseTime}ms</div>
                <div className="text-sm text-gray-600">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{systemHealth.security.vulnerabilities}</div>
                <div className="text-sm text-gray-600">Vulnerabilities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">{systemHealth.compliance.score}%</div>
                <div className="text-sm text-gray-600">Compliance Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cloud">Cloud Providers</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="billing">Billing & Usage</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Organizations</p>
                    <p className="text-2xl font-bold">{organizations.length}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cloud Providers</p>
                    <p className="text-2xl font-bold">{cloudProviders.length}</p>
                  </div>
                  <Cloud className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">
                      {organizations.reduce((sum, org) => sum + org.users.length, 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                    <p className="text-2xl font-bold">
                      ${cloudProviders.reduce((sum, provider) => sum + provider.billing.currentCost, 0).toFixed(0)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                  <Plus className="h-6 w-6" />
                  <span className="text-sm">Add Organization</span>
                </Button>
                <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                  <Cloud className="h-6 w-6" />
                  <span className="text-sm">Setup Cloud</span>
                </Button>
                <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                  <Shield className="h-6 w-6" />
                  <span className="text-sm">Security Audit</span>
                </Button>
                <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">View Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cloud" className="space-y-6">
          {/* Cloud Providers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cloudProviders.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getProviderIcon(provider.type)}</span>
                      <div>
                        <CardTitle>{provider.name}</CardTitle>
                        <p className="text-sm text-gray-600">{provider.type.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(provider.status)} text-white`}>
                        {provider.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => syncCloudProvider(provider.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Regions:</span>
                      <span className="ml-2 font-medium">{provider.regions.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Services:</span>
                      <span className="ml-2 font-medium">{provider.services.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Monthly Cost:</span>
                      <span className="ml-2 font-medium">${provider.billing.currentCost.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Sync:</span>
                      <span className="ml-2 font-medium">{provider.lastSync.toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Resource Quotas</Label>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Compute ({provider.quotas.compute.used}/{provider.quotas.compute.limit} {provider.quotas.compute.unit})</span>
                        <span>{provider.quotas.compute.percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={provider.quotas.compute.percentage} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Storage ({provider.quotas.storage.used}/{provider.quotas.storage.limit} {provider.quotas.storage.unit})</span>
                        <span>{provider.quotas.storage.percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={provider.quotas.storage.percentage} className="h-2" />
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

        <TabsContent value="organizations" className="space-y-6">
          {/* Organization Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search organizations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Organizations List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrganizations.map((org) => (
              <Card key={org.id} className={`cursor-pointer transition-all hover:shadow-md ${
                selectedOrg?.id === org.id ? 'ring-2 ring-primary' : ''
              }`} onClick={() => setSelectedOrg(org)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{org.name}</CardTitle>
                      <p className="text-sm text-gray-600">{org.domain}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{org.tier}</Badge>
                      <Badge className={`${getStatusColor(org.status)} text-white`}>
                        {org.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Users:</span>
                      <span className="ml-2 font-medium">{org.users.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Plan:</span>
                      <span className="ml-2 font-medium">{org.billing.plan}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">SSO:</span>
                      <span className="ml-2">
                        {org.settings.sso.enabled ? (
                          <CheckCircle className="h-4 w-4 text-green-500 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 inline" />
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Compliance:</span>
                      <span className="ml-2 font-medium">{org.compliance.score.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Feature Usage</Label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(org.settings.features).slice(0, 4).map(([feature, enabled]) => (
                        <div key={feature} className={`flex items-center gap-1 ${enabled ? 'text-green-600' : 'text-gray-400'}`}>
                          {enabled ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span className="capitalize">{feature.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Users className="h-4 w-4 mr-2" />
                      Users
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {/* Billing Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ${organizations.reduce((sum, org) => sum + org.billing.price, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <TrendingUp className="h-4 w-4 inline mr-1" />
                  +12.5% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Infrastructure Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  ${cloudProviders.reduce((sum, provider) => sum + provider.billing.currentCost, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <TrendingDown className="h-4 w-4 inline mr-1" />
                  -3.2% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Net Profit Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {(((organizations.reduce((sum, org) => sum + org.billing.price, 0) - 
                     cloudProviders.reduce((sum, provider) => sum + provider.billing.currentCost, 0)) / 
                     organizations.reduce((sum, org) => sum + org.billing.price, 0)) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <TrendingUp className="h-4 w-4 inline mr-1" />
                  +8.1% from last month
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Billing Breakdown by Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {organizations.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{org.name}</div>
                        <div className="text-sm text-gray-600">{org.billing.plan}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${org.billing.price.toFixed(2)}/month</div>
                      <div className="text-sm text-gray-600">
                        Next billing: {org.billing.nextBilling.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Overview */}
          {selectedOrg && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Overview - {selectedOrg.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{selectedOrg.compliance.score.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Compliance Score</div>
                    <Progress value={selectedOrg.compliance.score} className="mt-2" />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{selectedOrg.compliance.frameworks.length}</div>
                    <div className="text-sm text-gray-600">Active Frameworks</div>
                    <div className="mt-2 space-y-1">
                      {selectedOrg.compliance.frameworks.map((framework, index) => (
                        <Badge key={index} className={`${getStatusColor(framework.status)} text-white mr-1`}>
                          {framework.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{selectedOrg.compliance.certifications.length}</div>
                    <div className="text-sm text-gray-600">Certifications</div>
                    <div className="mt-2 space-y-1">
                      {selectedOrg.compliance.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="mr-1">
                          {cert.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Audits */}
          {selectedOrg && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Audits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedOrg.compliance.audits.map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <div className="font-medium">{audit.type} Audit by {audit.auditor}</div>
                        <div className="text-sm text-gray-600">
                          {audit.startDate.toLocaleDateString()} - {audit.endDate.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(audit.status)} text-white`}>
                          {audit.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          View Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Organization Modal */}
      {showAddOrgModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Create New Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input placeholder="Enter organization name" />
                </div>
                <div className="space-y-2">
                  <Label>Domain</Label>
                  <Input placeholder="company.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter - $99/month</SelectItem>
                    <SelectItem value="professional">Professional - $299/month</SelectItem>
                    <SelectItem value="enterprise">Enterprise - $999/month</SelectItem>
                    <SelectItem value="custom">Custom - Contact Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddOrgModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => createOrganization({ name: 'New Organization' })}>
                  Create Organization
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Cloud Provider Modal */}
      {showCloudModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Add Cloud Provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Provider Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cloud provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aws">Amazon Web Services (AWS)</SelectItem>
                    <SelectItem value="azure">Microsoft Azure</SelectItem>
                    <SelectItem value="gcp">Google Cloud Platform</SelectItem>
                    <SelectItem value="alibaba">Alibaba Cloud</SelectItem>
                    <SelectItem value="private">Private Cloud</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Configuration Name</Label>
                <Input placeholder="Production AWS" />
              </div>

              <div className="space-y-2">
                <Label>Credentials</Label>
                <Textarea placeholder="Enter API credentials or configuration" rows={3} />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCloudModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => addCloudProvider({ name: 'New Provider', type: 'aws' })}>
                  Add Provider
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 