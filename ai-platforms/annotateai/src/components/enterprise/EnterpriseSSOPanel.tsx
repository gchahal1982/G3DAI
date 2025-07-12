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
  Shield, 
  Users, 
  Key, 
  UserCheck, 
  UserX, 
  UserPlus, 
  Settings, 
  Activity, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  RefreshCw, 
  Plus, 
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
  Globe, 
  Lock, 
  Unlock, 
  Database, 
  Server, 
  Network, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Folder, 
  Archive, 
  ExternalLink, 
  Zap, 
  Target, 
  Award, 
  Star, 
  Heart, 
  Bookmark, 
  Flag, 
  Bell, 
  Timer, 
  Gauge, 
  Package, 
  Layers, 
  Box, 
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
  ChevronDown, 
  Link, 
  Unlink, 
  Share, 
  LogIn, 
  LogOut, 
  PowerOff, 
  Power, 
  MoreHorizontal, 
  MoreVertical 
} from 'lucide-react';

// SSO Configuration Types
interface SSOProvider {
  id: string;
  name: string;
  type: 'azure_ad' | 'okta' | 'google' | 'saml' | 'oidc' | 'ping' | 'auth0' | 'keycloak' | 'custom';
  status: 'active' | 'inactive' | 'configuring' | 'error' | 'testing';
  enabled: boolean;
  configuration: SSOConfiguration;
  statistics: SSOStatistics;
  users: SSOUser[];
  groups: SSOGroup[];
  attributes: AttributeMapping;
  protocols: ProtocolConfig;
  certificates: CertificateInfo[];
  metadata: SSOMetadata;
}

interface SSOConfiguration {
  domain: string;
  entityId: string;
  ssoUrl: string;
  sloUrl?: string;
  metadataUrl?: string;
  publicCertificate?: string;
  privateKey?: string;
  autoProvisioning: boolean;
  autoDeprovisioning: boolean;
  justInTimeProvisioning: boolean;
  defaultRole: string;
  defaultGroups: string[];
  sessionTimeout: number;
  maxSessions: number;
  allowIdpInitiated: boolean;
  requireSignedAssertion: boolean;
  requireSignedResponse: boolean;
  forceAuthentication: boolean;
  nameIdFormat: string;
  binding: 'post' | 'redirect' | 'artifact';
  encryption: EncryptionConfig;
  customAttributes: CustomAttribute[];
}

interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  keySize: number;
  encryptNameId: boolean;
  encryptAssertion: boolean;
}

interface CustomAttribute {
  name: string;
  value: string;
  type: 'static' | 'dynamic' | 'expression';
  required: boolean;
}

interface SSOStatistics {
  totalUsers: number;
  activeUsers: number;
  successfulLogins: number;
  failedLogins: number;
  lastLogin: Date;
  averageSessionDuration: number;
  peakConcurrentUsers: number;
  loginTrends: LoginTrend[];
  errorRates: ErrorRate[];
  performance: PerformanceMetrics;
}

interface LoginTrend {
  date: Date;
  successful: number;
  failed: number;
  total: number;
}

interface ErrorRate {
  type: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface PerformanceMetrics {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number;
  availability: number;
}

interface SSOUser {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'deleted';
  role: string;
  groups: string[];
  attributes: UserAttribute[];
  sessions: UserSession[];
  lastLogin: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
  provisioning: ProvisioningInfo;
}

interface UserAttribute {
  name: string;
  value: string;
  source: 'sso' | 'manual' | 'system';
  lastUpdated: Date;
}

interface UserSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  ipAddress: string;
  userAgent: string;
  location: string;
  status: 'active' | 'expired' | 'terminated';
}

interface ProvisioningInfo {
  source: 'sso' | 'manual' | 'api';
  provisionedAt: Date;
  lastSync: Date;
  syncStatus: 'success' | 'failed' | 'pending';
  errors: string[];
}

interface SSOGroup {
  id: string;
  name: string;
  displayName: string;
  description: string;
  members: string[];
  roles: string[];
  permissions: string[];
  attributes: GroupAttribute[];
  mapping: GroupMapping;
  createdAt: Date;
  updatedAt: Date;
}

interface GroupAttribute {
  name: string;
  value: string;
  inherited: boolean;
}

interface GroupMapping {
  sourceGroup: string;
  targetGroup: string;
  rules: MappingRule[];
}

interface MappingRule {
  condition: string;
  action: 'include' | 'exclude' | 'map';
  target: string;
}

interface AttributeMapping {
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  groups: string;
  department: string;
  title: string;
  phone: string;
  location: string;
  manager: string;
  employeeId: string;
  customMappings: CustomMapping[];
}

interface CustomMapping {
  sourceAttribute: string;
  targetAttribute: string;
  transformation: string;
  required: boolean;
}

interface ProtocolConfig {
  saml: SAMLConfig;
  oidc: OIDCConfig;
  oauth: OAuthConfig;
  ldap: LDAPConfig;
}

interface SAMLConfig {
  version: '2.0' | '1.1';
  binding: 'post' | 'redirect' | 'artifact';
  nameIdFormat: string;
  audienceRestriction: string;
  recipientValidation: boolean;
  clockSkew: number;
  assertionLifetime: number;
  sessionNotOnOrAfter: number;
}

interface OIDCConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;
  scope: string[];
  responseType: string;
  grantType: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  jwksUri: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
}

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  scope: string[];
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  redirectUri: string;
  state: string;
  pkce: boolean;
}

interface LDAPConfig {
  server: string;
  port: number;
  ssl: boolean;
  baseDn: string;
  bindDn: string;
  bindPassword: string;
  userSearchBase: string;
  userSearchFilter: string;
  groupSearchBase: string;
  groupSearchFilter: string;
  attributes: LDAPAttribute[];
}

interface LDAPAttribute {
  ldapAttribute: string;
  userAttribute: string;
  required: boolean;
}

interface CertificateInfo {
  id: string;
  name: string;
  type: 'signing' | 'encryption' | 'ssl';
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  fingerprint: string;
  serialNumber: string;
  algorithm: string;
  keySize: number;
  status: 'valid' | 'expired' | 'revoked' | 'pending';
  autoRenewal: boolean;
  usages: string[];
}

interface SSOMetadata {
  createdAt: Date;
  updatedAt: Date;
  lastSync: Date;
  version: string;
  configurationHash: string;
  testResults: TestResult[];
  compliance: ComplianceInfo[];
  documentation: string;
  contacts: Contact[];
}

interface TestResult {
  id: string;
  testType: 'connection' | 'authentication' | 'authorization' | 'provisioning' | 'metadata';
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  message: string;
  timestamp: Date;
  duration: number;
  details: TestDetail[];
}

interface TestDetail {
  step: string;
  result: 'passed' | 'failed' | 'warning';
  message: string;
  data?: any;
}

interface ComplianceInfo {
  framework: string;
  requirements: string[];
  status: 'compliant' | 'non_compliant' | 'partial';
  lastAssessment: Date;
  findings: string[];
}

interface Contact {
  role: string;
  name: string;
  email: string;
  phone?: string;
}

interface OrganizationSettings {
  id: string;
  name: string;
  domain: string;
  ssoProviders: SSOProvider[];
  userManagement: UserManagementSettings;
  securityPolicies: SecurityPolicy[];
  auditSettings: AuditSettings;
  integrations: Integration[];
}

interface UserManagementSettings {
  autoProvisioning: boolean;
  autoDeprovisioning: boolean;
  defaultRole: string;
  passwordPolicy: PasswordPolicy;
  sessionManagement: SessionManagement;
  accountLocking: AccountLocking;
  multifactor: MultifactorSettings;
}

interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  prohibitCommon: boolean;
  prohibitPersonal: boolean;
  expirationDays: number;
  historyCount: number;
}

interface SessionManagement {
  timeout: number;
  maxSessions: number;
  concurrentSessions: boolean;
  idleTimeout: number;
  absoluteTimeout: number;
  rememberMe: boolean;
  rememberMeDuration: number;
}

interface AccountLocking {
  enabled: boolean;
  maxAttempts: number;
  lockoutDuration: number;
  resetOnSuccess: boolean;
  notifyUser: boolean;
  notifyAdmin: boolean;
}

interface MultifactorSettings {
  required: boolean;
  methods: string[];
  gracePeriod: number;
  bypassCodes: boolean;
  rememberDevice: boolean;
  deviceTrustDuration: number;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  type: 'access' | 'password' | 'session' | 'audit' | 'data';
  rules: PolicyRule[];
  enforcement: 'strict' | 'lenient' | 'warning';
  scope: string[];
  exceptions: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface PolicyRule {
  condition: string;
  action: 'allow' | 'deny' | 'require_mfa' | 'log' | 'notify';
  parameters: Record<string, any>;
}

interface AuditSettings {
  enabled: boolean;
  events: string[];
  retention: number;
  storage: string;
  encryption: boolean;
  immutable: boolean;
  realtime: boolean;
  alerting: AuditAlerting;
}

interface AuditAlerting {
  enabled: boolean;
  rules: AuditRule[];
  channels: string[];
  escalation: EscalationLevel[];
}

interface AuditRule {
  id: string;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency: number;
  threshold: number;
}

interface EscalationLevel {
  delay: number;
  channels: string[];
  conditions: string[];
}

interface Integration {
  id: string;
  name: string;
  type: 'scim' | 'ldap' | 'api' | 'webhook' | 'file';
  enabled: boolean;
  configuration: IntegrationConfig;
  status: 'active' | 'inactive' | 'error' | 'syncing';
  lastSync: Date;
  syncResults: SyncResult[];
}

interface IntegrationConfig {
  endpoint: string;
  authentication: AuthenticationConfig;
  mapping: FieldMapping[];
  filters: SyncFilter[];
  schedule: SyncSchedule;
  errorHandling: ErrorHandling;
}

interface AuthenticationConfig {
  type: 'bearer' | 'basic' | 'oauth' | 'api_key' | 'certificate';
  credentials: Record<string, any>;
  validation: ValidationConfig;
}

interface ValidationConfig {
  validateSsl: boolean;
  timeout: number;
  retries: number;
  backoff: string;
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation: string;
  required: boolean;
  defaultValue?: string;
}

interface SyncFilter {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex';
  value: string;
  exclude: boolean;
}

interface SyncSchedule {
  enabled: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  time: string;
  timezone: string;
  retryOnFailure: boolean;
  maxRetries: number;
}

interface ErrorHandling {
  strategy: 'abort' | 'continue' | 'retry';
  notification: boolean;
  rollback: boolean;
  quarantine: boolean;
}

interface SyncResult {
  id: string;
  timestamp: Date;
  status: 'success' | 'partial' | 'failed';
  duration: number;
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  errors: SyncError[];
  summary: SyncSummary;
}

interface SyncError {
  record: string;
  field: string;
  message: string;
  code: string;
  type: 'validation' | 'transformation' | 'network' | 'authorization';
}

interface SyncSummary {
  usersCreated: number;
  usersUpdated: number;
  usersDeleted: number;
  groupsCreated: number;
  groupsUpdated: number;
  groupsDeleted: number;
}

export default function EnterpriseSSOPanel() {
  // State management
  const [ssoProviders, setSSOProviders] = useState<SSOProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null);
  const [organizationSettings, setOrganizationSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Backend connection
  const enterpriseSSORef = useRef<any>(null);

  // Initialize
  useEffect(() => {
    const initializeSSO = async () => {
      try {
        enterpriseSSORef.current = {
          getProviders: async () => generateMockProviders(),
          getOrganizationSettings: async () => generateMockOrganizationSettings(),
          updateProvider: async (id: string, config: Partial<SSOProvider>) => {
            setSSOProviders(prev => prev.map(p => p.id === id ? { ...p, ...config } : p));
          },
          testProvider: async (id: string) => {
            return {
              success: true,
              results: [
                { testType: 'connection', status: 'passed', message: 'Connection successful' },
                { testType: 'authentication', status: 'passed', message: 'Authentication working' },
                { testType: 'metadata', status: 'passed', message: 'Metadata valid' }
              ]
            };
          },
          syncUsers: async (providerId: string) => {
            setSSOProviders(prev => prev.map(p => 
              p.id === providerId ? { 
                ...p, 
                status: 'active',
                statistics: { 
                  ...p.statistics, 
                  totalUsers: p.statistics.totalUsers + Math.floor(Math.random() * 5) 
                }
              } : p
            ));
          },
          createUser: async (userData: Partial<SSOUser>) => {
            const newUser = {
              ...userData,
              id: `user_${Date.now()}`,
              status: 'active' as const,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            setSSOProviders(prev => prev.map(p => 
              p.id === selectedProvider?.id ? {
                ...p,
                users: [...p.users, newUser as SSOUser]
              } : p
            ));
            return newUser;
          }
        };

        const [providers, orgSettings] = await Promise.all([
          enterpriseSSORef.current.getProviders(),
          enterpriseSSORef.current.getOrganizationSettings()
        ]);

        setSSOProviders(providers);
        setOrganizationSettings(orgSettings);
        setSelectedProvider(providers[0] || null);

      } catch (error) {
        console.error('Failed to initialize SSO:', error);
        setError('Failed to initialize SSO management');
      }
    };

    initializeSSO();
  }, []);

  // Actions
  const testProvider = useCallback(async (providerId: string) => {
    try {
      const result = await enterpriseSSORef.current?.testProvider(providerId);
      setShowTestModal(true);
      console.log('Test results:', result);
    } catch (error) {
      console.error('Failed to test provider:', error);
      setError('Failed to test SSO provider');
    }
  }, []);

  const syncUsers = useCallback(async (providerId: string) => {
    try {
      await enterpriseSSORef.current?.syncUsers(providerId);
    } catch (error) {
      console.error('Failed to sync users:', error);
      setError('Failed to sync users');
    }
  }, []);

  const updateProviderConfig = useCallback(async (providerId: string, config: Partial<SSOProvider>) => {
    try {
      await enterpriseSSORef.current?.updateProvider(providerId, config);
    } catch (error) {
      console.error('Failed to update provider:', error);
      setError('Failed to update provider configuration');
    }
  }, []);

  const createUser = useCallback(async (userData: Partial<SSOUser>) => {
    try {
      await enterpriseSSORef.current?.createUser(userData);
      setShowUserModal(false);
    } catch (error) {
      console.error('Failed to create user:', error);
      setError('Failed to create user');
    }
  }, []);

  // Utilities
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'passed': case 'success': return 'bg-green-500';
      case 'testing': case 'configuring': case 'syncing': case 'pending': return 'bg-blue-500';
      case 'error': case 'failed': case 'expired': return 'bg-red-500';
      case 'inactive': case 'suspended': case 'deleted': return 'bg-gray-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getProviderIcon = (type: string) => {
    const icons = {
      'azure_ad': '🔵',
      'okta': '🔶',
      'google': '🔴',
      'saml': '🔒',
      'oidc': '🔑',
      'ping': '🟢',
      'auth0': '🟠',
      'keycloak': '🔐',
      'custom': '⚙️'
    };
    return icons[type as keyof typeof icons] || '🔐';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  // Filter users
  const filteredUsers = selectedProvider?.users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  // Mock data generators
  const generateMockProviders = (): SSOProvider[] => {
    return [
      {
        id: 'azure-ad-1',
        name: 'Azure Active Directory',
        type: 'azure_ad',
        status: 'active',
        enabled: true,
        configuration: {
          domain: 'company.onmicrosoft.com',
          entityId: 'urn:company:annotateai',
          ssoUrl: 'https://login.microsoftonline.com/tenant-id/saml2',
          sloUrl: 'https://login.microsoftonline.com/tenant-id/saml2/logout',
          metadataUrl: 'https://login.microsoftonline.com/tenant-id/federationmetadata/2007-06/federationmetadata.xml',
          autoProvisioning: true,
          autoDeprovisioning: false,
          justInTimeProvisioning: true,
          defaultRole: 'user',
          defaultGroups: ['users'],
          sessionTimeout: 3600,
          maxSessions: 3,
          allowIdpInitiated: true,
          requireSignedAssertion: true,
          requireSignedResponse: true,
          forceAuthentication: false,
          nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
          binding: 'post',
          encryption: {
            enabled: true,
            algorithm: 'AES256',
            keySize: 256,
            encryptNameId: false,
            encryptAssertion: true
          },
          customAttributes: [
            { name: 'Department', value: 'Engineering', type: 'dynamic', required: false }
          ]
        },
        statistics: {
          totalUsers: 145,
          activeUsers: 132,
          successfulLogins: 2847,
          failedLogins: 23,
          lastLogin: new Date(Date.now() - 5 * 60 * 1000),
          averageSessionDuration: 4.5,
          peakConcurrentUsers: 89,
          loginTrends: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
            successful: 80 + Math.floor(Math.random() * 40),
            failed: Math.floor(Math.random() * 5),
            total: 85 + Math.floor(Math.random() * 40)
          })),
          errorRates: [
            { type: 'Invalid Credentials', count: 12, percentage: 52.2, trend: 'down' },
            { type: 'Session Timeout', count: 8, percentage: 34.8, trend: 'stable' },
            { type: 'Network Error', count: 3, percentage: 13.0, trend: 'up' }
          ],
          performance: {
            averageResponseTime: 245,
            p95ResponseTime: 890,
            p99ResponseTime: 1250,
            throughput: 127.5,
            availability: 99.97
          }
        },
        users: [
          {
            id: 'user-1',
            email: 'john.doe@company.com',
            name: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
            username: 'john.doe',
            status: 'active',
            role: 'admin',
            groups: ['admins', 'engineering'],
            attributes: [
              { name: 'Department', value: 'Engineering', source: 'sso', lastUpdated: new Date() },
              { name: 'Title', value: 'Senior Engineer', source: 'sso', lastUpdated: new Date() }
            ],
            sessions: [
              {
                id: 'session-1',
                startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
                duration: 7200,
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                location: 'New York, NY',
                status: 'active'
              }
            ],
            lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
            loginCount: 87,
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
            provisioning: {
              source: 'sso',
              provisionedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
              lastSync: new Date(Date.now() - 30 * 60 * 1000),
              syncStatus: 'success',
              errors: []
            }
          },
          {
            id: 'user-2',
            email: 'jane.smith@company.com',
            name: 'Jane Smith',
            firstName: 'Jane',
            lastName: 'Smith',
            username: 'jane.smith',
            status: 'active',
            role: 'user',
            groups: ['users', 'marketing'],
            attributes: [
              { name: 'Department', value: 'Marketing', source: 'sso', lastUpdated: new Date() },
              { name: 'Title', value: 'Marketing Manager', source: 'sso', lastUpdated: new Date() }
            ],
            sessions: [],
            lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
            loginCount: 45,
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
            provisioning: {
              source: 'sso',
              provisionedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              lastSync: new Date(Date.now() - 30 * 60 * 1000),
              syncStatus: 'success',
              errors: []
            }
          }
        ],
        groups: [
          {
            id: 'group-1',
            name: 'engineering',
            displayName: 'Engineering Team',
            description: 'Software engineering team members',
            members: ['user-1'],
            roles: ['developer', 'admin'],
            permissions: ['read', 'write', 'deploy'],
            attributes: [
              { name: 'Department', value: 'Engineering', inherited: false }
            ],
            mapping: {
              sourceGroup: 'Engineering',
              targetGroup: 'engineering',
              rules: [
                { condition: 'department == "Engineering"', action: 'include', target: 'engineering' }
              ]
            },
            createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          }
        ],
        attributes: {
          email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
          firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
          lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
          username: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
          groups: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups',
          department: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/department',
          title: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/title',
          phone: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/homephone',
          location: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality',
          manager: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/manager',
          employeeId: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/employeeid',
          customMappings: [
            { sourceAttribute: 'extensionAttribute1', targetAttribute: 'costCenter', transformation: 'uppercase', required: false }
          ]
        },
        protocols: {
          saml: {
            version: '2.0',
            binding: 'post',
            nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
            audienceRestriction: 'urn:company:annotateai',
            recipientValidation: true,
            clockSkew: 300,
            assertionLifetime: 3600,
            sessionNotOnOrAfter: 7200
          },
          oidc: {
            issuer: 'https://login.microsoftonline.com/tenant-id/v2.0',
            clientId: 'client-id',
            clientSecret: 'client-secret',
            scope: ['openid', 'profile', 'email'],
            responseType: 'code',
            grantType: 'authorization_code',
            redirectUri: 'https://annotateai.company.com/auth/callback',
            postLogoutRedirectUri: 'https://annotateai.company.com/logout',
            jwksUri: 'https://login.microsoftonline.com/tenant-id/discovery/v2.0/keys',
            tokenEndpoint: 'https://login.microsoftonline.com/tenant-id/oauth2/v2.0/token',
            userInfoEndpoint: 'https://graph.microsoft.com/oidc/userinfo'
          },
          oauth: {
            clientId: 'oauth-client-id',
            clientSecret: 'oauth-client-secret',
            scope: ['user.read', 'profile'],
            authorizationEndpoint: 'https://login.microsoftonline.com/tenant-id/oauth2/v2.0/authorize',
            tokenEndpoint: 'https://login.microsoftonline.com/tenant-id/oauth2/v2.0/token',
            userInfoEndpoint: 'https://graph.microsoft.com/v1.0/me',
            redirectUri: 'https://annotateai.company.com/oauth/callback',
            state: 'random-state-value',
            pkce: true
          },
          ldap: {
            server: 'ldap://company.com',
            port: 389,
            ssl: false,
            baseDn: 'DC=company,DC=com',
            bindDn: 'CN=service-account,OU=Service Accounts,DC=company,DC=com',
            bindPassword: 'password',
            userSearchBase: 'OU=Users,DC=company,DC=com',
            userSearchFilter: '(&(objectClass=user)(sAMAccountName={username}))',
            groupSearchBase: 'OU=Groups,DC=company,DC=com',
            groupSearchFilter: '(&(objectClass=group)(member={userDn}))',
            attributes: [
              { ldapAttribute: 'sAMAccountName', userAttribute: 'username', required: true },
              { ldapAttribute: 'mail', userAttribute: 'email', required: true },
              { ldapAttribute: 'displayName', userAttribute: 'name', required: true }
            ]
          }
        },
        certificates: [
          {
            id: 'cert-1',
            name: 'Azure AD Signing Certificate',
            type: 'signing',
            issuer: 'Microsoft Azure AD',
            subject: 'CN=Microsoft Azure AD SSO Certificate',
            validFrom: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            fingerprint: 'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD',
            serialNumber: '12345678901234567890',
            algorithm: 'RSA',
            keySize: 2048,
            status: 'valid',
            autoRenewal: true,
            usages: ['digitalSignature', 'keyEncipherment']
          }
        ],
        metadata: {
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          lastSync: new Date(Date.now() - 30 * 60 * 1000),
          version: '1.2.0',
          configurationHash: 'abc123def456ghi789',
          testResults: [
            {
              id: 'test-1',
              testType: 'connection',
              status: 'passed',
              message: 'Connection test successful',
              timestamp: new Date(Date.now() - 60 * 60 * 1000),
              duration: 1250,
              details: [
                { step: 'DNS Resolution', result: 'passed', message: 'DNS resolved successfully' },
                { step: 'SSL Handshake', result: 'passed', message: 'SSL connection established' },
                { step: 'Metadata Retrieval', result: 'passed', message: 'Metadata retrieved and parsed' }
              ]
            }
          ],
          compliance: [
            {
              framework: 'SAML 2.0',
              requirements: ['Single Sign-On', 'Single Logout', 'Attribute Exchange'],
              status: 'compliant',
              lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              findings: []
            }
          ],
          documentation: 'https://docs.company.com/sso/azure-ad',
          contacts: [
            { role: 'Technical Lead', name: 'John Doe', email: 'john.doe@company.com' },
            { role: 'Security Admin', name: 'Jane Smith', email: 'jane.smith@company.com', phone: '+1-555-0123' }
          ]
        }
      }
    ];
  };

  const generateMockOrganizationSettings = (): OrganizationSettings => {
    return {
      id: 'org-1',
      name: 'Company Name',
      domain: 'company.com',
      ssoProviders: [],
      userManagement: {
        autoProvisioning: true,
        autoDeprovisioning: false,
        defaultRole: 'user',
        passwordPolicy: {
          minLength: 12,
          maxLength: 128,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: true,
          prohibitCommon: true,
          prohibitPersonal: true,
          expirationDays: 90,
          historyCount: 12
        },
        sessionManagement: {
          timeout: 3600,
          maxSessions: 3,
          concurrentSessions: true,
          idleTimeout: 1800,
          absoluteTimeout: 28800,
          rememberMe: true,
          rememberMeDuration: 2592000
        },
        accountLocking: {
          enabled: true,
          maxAttempts: 5,
          lockoutDuration: 900,
          resetOnSuccess: true,
          notifyUser: true,
          notifyAdmin: true
        },
        multifactor: {
          required: true,
          methods: ['totp', 'sms', 'email'],
          gracePeriod: 86400,
          bypassCodes: true,
          rememberDevice: true,
          deviceTrustDuration: 2592000
        }
      },
      securityPolicies: [
        {
          id: 'policy-1',
          name: 'Strong Authentication Policy',
          description: 'Requires MFA for all admin access',
          type: 'access',
          rules: [
            { condition: 'role == "admin"', action: 'require_mfa', parameters: { methods: ['totp'] } }
          ],
          enforcement: 'strict',
          scope: ['admin'],
          exceptions: [],
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      ],
      auditSettings: {
        enabled: true,
        events: ['login', 'logout', 'failed_login', 'password_change', 'role_change', 'permission_change'],
        retention: 2555,
        storage: 'encrypted',
        encryption: true,
        immutable: true,
        realtime: true,
        alerting: {
          enabled: true,
          rules: [
            { id: 'rule-1', name: 'Multiple Failed Logins', condition: 'failed_login_count > 5', severity: 'high', frequency: 300, threshold: 5 }
          ],
          channels: ['email', 'slack'],
          escalation: []
        }
      },
      integrations: [
        {
          id: 'scim-1',
          name: 'SCIM Integration',
          type: 'scim',
          enabled: true,
          configuration: {
            endpoint: 'https://api.company.com/scim/v2',
            authentication: {
              type: 'bearer',
              credentials: { token: 'bearer-token' },
              validation: { validateSsl: true, timeout: 30, retries: 3, backoff: 'exponential' }
            },
            mapping: [
              { sourceField: 'email', targetField: 'emails[0].value', transformation: 'lowercase', required: true },
              { sourceField: 'name', targetField: 'displayName', transformation: 'none', required: true }
            ],
            filters: [
              { field: 'active', operator: 'equals', value: 'true', exclude: false }
            ],
            schedule: {
              enabled: true,
              frequency: 'hourly',
              time: '0',
              timezone: 'UTC',
              retryOnFailure: true,
              maxRetries: 3
            },
            errorHandling: {
              strategy: 'continue',
              notification: true,
              rollback: false,
              quarantine: true
            }
          },
          status: 'active',
          lastSync: new Date(Date.now() - 30 * 60 * 1000),
          syncResults: [
            {
              id: 'sync-1',
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              status: 'success',
              duration: 45.2,
              recordsProcessed: 150,
              recordsSuccessful: 150,
              recordsFailed: 0,
              errors: [],
              summary: {
                usersCreated: 3,
                usersUpdated: 12,
                usersDeleted: 0,
                groupsCreated: 1,
                groupsUpdated: 2,
                groupsDeleted: 0
              }
            }
          ]
        }
      ]
    };
  };

  if (!selectedProvider) {
    return (
      <div className="enterprise-sso-panel p-6">
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No SSO Provider Selected</h3>
          <p className="text-gray-600">Select an SSO provider to view configuration and user management</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enterprise-sso-panel p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getProviderIcon(selectedProvider.type)}</span>
          <div>
            <h2 className="text-2xl font-bold">{selectedProvider.name}</h2>
            <p className="text-gray-600">{selectedProvider.type.toUpperCase()} SSO Configuration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(selectedProvider.status)} text-white`}>
            {selectedProvider.status}
          </Badge>
          <Switch 
            checked={selectedProvider.enabled} 
            onCheckedChange={(enabled) => updateProviderConfig(selectedProvider.id, { enabled })}
          />
          <Button variant="outline" onClick={() => testProvider(selectedProvider.id)}>
            <Activity className="h-4 w-4 mr-2" />
            Test Connection
          </Button>
          <Button variant="outline" onClick={() => syncUsers(selectedProvider.id)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Users
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
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{selectedProvider.statistics.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{selectedProvider.statistics.activeUsers}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">
                  {((selectedProvider.statistics.successfulLogins / 
                    (selectedProvider.statistics.successfulLogins + selectedProvider.statistics.failedLogins)) * 100).toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Session</p>
                <p className="text-2xl font-bold">{selectedProvider.statistics.averageSessionDuration.toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Authentication Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Authentication Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{selectedProvider.statistics.performance.averageResponseTime}ms</div>
                  <div className="text-sm text-gray-600">Average Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{selectedProvider.statistics.performance.throughput.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Requests/sec</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{selectedProvider.statistics.performance.availability}%</div>
                  <div className="text-sm text-gray-600">Availability</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Error Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedProvider.statistics.errorRates.map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{error.type}</span>
                        <span className="text-sm">{getTrendIcon(error.trend)}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{error.count}</div>
                        <div className="text-sm text-gray-600">{error.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">Last Login</div>
                      <div className="text-sm text-gray-600">{selectedProvider.statistics.lastLogin.toLocaleString()}</div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">Peak Concurrent Users</div>
                      <div className="text-sm text-gray-600">{selectedProvider.statistics.peakConcurrentUsers} users</div>
                    </div>
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">Configuration Update</div>
                      <div className="text-sm text-gray-600">{selectedProvider.metadata.updatedAt.toLocaleString()}</div>
                    </div>
                    <Settings className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* User Management Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => syncUsers(selectedProvider.id)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Users
                  </Button>
                  <Button onClick={() => setShowUserModal(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{user.role}</Badge>
                      <Badge className={`${getStatusColor(user.status)} text-white`}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Groups:</span>
                      <span className="ml-2 font-medium">{user.groups.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Logins:</span>
                      <span className="ml-2 font-medium">{user.loginCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Login:</span>
                      <span className="ml-2 font-medium">{user.lastLogin.toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Sessions:</span>
                      <span className="ml-2 font-medium">{user.sessions.filter(s => s.status === 'active').length}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Groups</Label>
                    <div className="flex flex-wrap gap-1">
                      {user.groups.map((group, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Attributes</Label>
                    <div className="space-y-1">
                      {user.attributes.slice(0, 2).map((attr, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-gray-600">{attr.name}:</span>
                          <span className="font-medium">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          {/* Groups List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedProvider.groups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{group.displayName}</CardTitle>
                      <p className="text-sm text-gray-600">{group.description}</p>
                    </div>
                    <Badge variant="outline">{group.members.length} members</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Members:</span>
                      <span className="ml-2 font-medium">{group.members.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Roles:</span>
                      <span className="ml-2 font-medium">{group.roles.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Permissions:</span>
                      <span className="ml-2 font-medium">{group.permissions.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2 font-medium">{group.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Roles</Label>
                    <div className="flex flex-wrap gap-1">
                      {group.roles.map((role, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Permissions</Label>
                    <div className="flex flex-wrap gap-1">
                      {group.permissions.slice(0, 3).map((permission, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                      {group.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{group.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Users className="h-4 w-4 mr-2" />
                      Members
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          {/* Configuration Overview */}
          <Card>
            <CardHeader>
              <CardTitle>SSO Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Domain</Label>
                  <Input value={selectedProvider.configuration.domain} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Entity ID</Label>
                  <Input value={selectedProvider.configuration.entityId} disabled />
                </div>
                <div className="space-y-2">
                  <Label>SSO URL</Label>
                  <Input value={selectedProvider.configuration.ssoUrl} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Name ID Format</Label>
                  <Input value={selectedProvider.configuration.nameIdFormat} disabled />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Provisioning Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Auto Provisioning</Label>
                    <Switch checked={selectedProvider.configuration.autoProvisioning} disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto Deprovisioning</Label>
                    <Switch checked={selectedProvider.configuration.autoDeprovisioning} disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>JIT Provisioning</Label>
                    <Switch checked={selectedProvider.configuration.justInTimeProvisioning} disabled />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Security Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Signed Assertions</Label>
                    <Switch checked={selectedProvider.configuration.requireSignedAssertion} disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Signed Responses</Label>
                    <Switch checked={selectedProvider.configuration.requireSignedResponse} disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Force Authentication</Label>
                    <Switch checked={selectedProvider.configuration.forceAuthentication} disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>IdP Initiated</Label>
                    <Switch checked={selectedProvider.configuration.allowIdpInitiated} disabled />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificates */}
          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedProvider.certificates.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{cert.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {cert.type} • {cert.algorithm} {cert.keySize} bit
                      </div>
                      <div className="text-sm text-gray-600">
                        Valid: {cert.validFrom.toLocaleDateString()} - {cert.validTo.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(cert.status)} text-white`}>
                        {cert.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attributes" className="space-y-6">
          {/* Attribute Mapping */}
          <Card>
            <CardHeader>
              <CardTitle>Attribute Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={selectedProvider.attributes.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={selectedProvider.attributes.name} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input value={selectedProvider.attributes.firstName} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input value={selectedProvider.attributes.lastName} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input value={selectedProvider.attributes.username} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Groups</Label>
                    <Input value={selectedProvider.attributes.groups} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input value={selectedProvider.attributes.department} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={selectedProvider.attributes.title} disabled />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Mappings */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Attribute Mappings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedProvider.attributes.customMappings.map((mapping, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm">Source</Label>
                        <div className="font-medium">{mapping.sourceAttribute}</div>
                      </div>
                      <div>
                        <Label className="text-sm">Target</Label>
                        <div className="font-medium">{mapping.targetAttribute}</div>
                      </div>
                      <div>
                        <Label className="text-sm">Transformation</Label>
                        <div className="font-medium">{mapping.transformation}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {mapping.required && <Badge variant="outline">Required</Badge>}
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedProvider.metadata.testResults.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{test.testType} Test</div>
                      <div className="text-sm text-gray-600 mt-1">{test.message}</div>
                      <div className="text-sm text-gray-600">
                        {test.timestamp.toLocaleString()} • {test.duration}ms
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(test.status)} text-white`}>
                        {test.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedProvider.metadata.compliance.map((comp, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{comp.framework}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {comp.requirements.join(', ')}
                      </div>
                      <div className="text-sm text-gray-600">
                        Last assessed: {comp.lastAssessment.toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(comp.status)} text-white`}>
                      {comp.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input placeholder="Enter first name" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input placeholder="Enter last name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="user@company.com" />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input placeholder="Enter username" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input placeholder="Enter department" />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowUserModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => createUser({ 
                  firstName: 'New', 
                  lastName: 'User', 
                  email: 'newuser@company.com' 
                })}>
                  Create User
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 