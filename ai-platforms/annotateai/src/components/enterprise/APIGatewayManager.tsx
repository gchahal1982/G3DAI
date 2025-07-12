'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Input, 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  Switch 
} from '../../../../../shared/components/ui';
import { 
  Globe, 
  Server, 
  Shield, 
  Activity, 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Key, 
  Settings, 
  Monitor, 
  Zap, 
  Lock, 
  Users, 
  Database, 
  Network, 
  Timer, 
  Target, 
  Gauge 
} from 'lucide-react';

interface APIEndpoint {
  id: string;
  name: string;
  path: string;
  method: string;
  status: 'active' | 'inactive' | 'deprecated';
  version: string;
  upstream: string;
  rateLimit: number;
  authentication: boolean;
  monitoring: boolean;
  requests: number;
  errors: number;
  latency: number;
  lastUsed: Date;
}

interface APIGatewayConfig {
  id: string;
  name: string;
  endpoints: APIEndpoint[];
  rateLimiting: RateLimitConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
  loadBalancing: LoadBalancingConfig;
  caching: CachingConfig;
  logging: LoggingConfig;
  analytics: AnalyticsConfig;
}

interface RateLimitConfig {
  enabled: boolean;
  globalLimit: number;
  userLimit: number;
  ipLimit: number;
  timeWindow: number;
  enforcement: 'strict' | 'warning' | 'logging';
}

interface SecurityConfig {
  apiKeys: boolean;
  oauth: boolean;
  jwt: boolean;
  cors: boolean;
  corsOrigins: string[];
  ipWhitelist: string[];
  encryption: boolean;
  signatureValidation: boolean;
}

interface MonitoringConfig {
  enabled: boolean;
  metrics: boolean;
  alerts: boolean;
  healthChecks: boolean;
  responseTime: boolean;
  errorTracking: boolean;
}

interface LoadBalancingConfig {
  enabled: boolean;
  algorithm: 'round_robin' | 'least_connections' | 'ip_hash' | 'weighted';
  healthCheck: boolean;
  failover: boolean;
  sticky: boolean;
}

interface CachingConfig {
  enabled: boolean;
  ttl: number;
  strategy: 'memory' | 'redis' | 'memcached';
  invalidation: boolean;
}

interface LoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  destinations: string[];
  retention: number;
}

interface AnalyticsConfig {
  enabled: boolean;
  realTime: boolean;
  retention: number;
  metrics: string[];
  reports: boolean;
}

export default function APIGatewayManager() {
  const [gatewayConfig, setGatewayConfig] = useState<APIGatewayConfig | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEndpointModal, setShowEndpointModal] = useState(false);

  const apiGatewayRef = useRef<any>(null);

  useEffect(() => {
    const initializeGateway = async () => {
      try {
        apiGatewayRef.current = {
          getConfiguration: async () => generateMockConfig(),
          updateEndpoint: async (id: string, config: Partial<APIEndpoint>) => {
            setGatewayConfig(prev => prev ? {
              ...prev,
              endpoints: prev.endpoints.map(e => e.id === id ? { ...e, ...config } : e)
            } : null);
          },
          createEndpoint: async (endpoint: Partial<APIEndpoint>) => {
            const newEndpoint = {
              ...endpoint,
              id: `endpoint_${Date.now()}`,
              status: 'active' as const,
              requests: 0,
              errors: 0,
              latency: 0,
              lastUsed: new Date()
            };
            setGatewayConfig(prev => prev ? {
              ...prev,
              endpoints: [...prev.endpoints, newEndpoint as APIEndpoint]
            } : null);
          }
        };

        const config = await apiGatewayRef.current.getConfiguration();
        setGatewayConfig(config);
        setSelectedEndpoint(config.endpoints[0] || null);
      } catch (error) {
        console.error('Failed to initialize API Gateway:', error);
        setError('Failed to initialize API Gateway');
      }
    };

    initializeGateway();
  }, []);

  const generateMockConfig = (): APIGatewayConfig => ({
    id: 'gateway-1',
    name: 'Production API Gateway',
    endpoints: [
      {
        id: 'ep-1',
        name: 'User API',
        path: '/api/v1/users',
        method: 'GET',
        status: 'active',
        version: '1.0',
        upstream: 'https://users.internal.com',
        rateLimit: 1000,
        authentication: true,
        monitoring: true,
        requests: 15230,
        errors: 12,
        latency: 245,
        lastUsed: new Date()
      },
      {
        id: 'ep-2',
        name: 'Analytics API',
        path: '/api/v1/analytics',
        method: 'POST',
        status: 'active',
        version: '1.0',
        upstream: 'https://analytics.internal.com',
        rateLimit: 500,
        authentication: true,
        monitoring: true,
        requests: 8940,
        errors: 5,
        latency: 186,
        lastUsed: new Date()
      }
    ],
    rateLimiting: {
      enabled: true,
      globalLimit: 10000,
      userLimit: 1000,
      ipLimit: 100,
      timeWindow: 3600,
      enforcement: 'strict'
    },
    security: {
      apiKeys: true,
      oauth: true,
      jwt: true,
      cors: true,
      corsOrigins: ['https://app.company.com', 'https://admin.company.com'],
      ipWhitelist: ['192.168.1.0/24'],
      encryption: true,
      signatureValidation: true
    },
    monitoring: {
      enabled: true,
      metrics: true,
      alerts: true,
      healthChecks: true,
      responseTime: true,
      errorTracking: true
    },
    loadBalancing: {
      enabled: true,
      algorithm: 'round_robin',
      healthCheck: true,
      failover: true,
      sticky: false
    },
    caching: {
      enabled: true,
      ttl: 3600,
      strategy: 'redis',
      invalidation: true
    },
    logging: {
      enabled: true,
      level: 'info',
      format: 'json',
      destinations: ['file', 'elasticsearch'],
      retention: 30
    },
    analytics: {
      enabled: true,
      realTime: true,
      retention: 90,
      metrics: ['requests', 'errors', 'latency', 'throughput'],
      reports: true
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'deprecated': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  if (!gatewayConfig) {
    return (
      <div className="api-gateway-manager p-6">
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Loading API Gateway</h3>
          <p className="text-gray-600">Initializing API Gateway configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="api-gateway-manager p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Gateway Manager</h2>
          <p className="text-gray-600">Manage API endpoints, routing, and security</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowEndpointModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Endpoint
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Endpoints</p>
                <p className="text-2xl font-bold">{gatewayConfig.endpoints.length}</p>
              </div>
              <Server className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">
                  {gatewayConfig.endpoints.reduce((sum, ep) => sum + ep.requests, 0).toLocaleString()}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold">
                  {((gatewayConfig.endpoints.reduce((sum, ep) => sum + ep.errors, 0) / 
                     gatewayConfig.endpoints.reduce((sum, ep) => sum + ep.requests, 0)) * 100).toFixed(2)}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Latency</p>
                <p className="text-2xl font-bold">
                  {(gatewayConfig.endpoints.reduce((sum, ep) => sum + ep.latency, 0) / 
                    gatewayConfig.endpoints.length).toFixed(0)}ms
                </p>
              </div>
              <Timer className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gateway Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Rate Limiting</span>
                    <Badge className={gatewayConfig.rateLimiting.enabled ? 'bg-green-500' : 'bg-gray-500'}>
                      {gatewayConfig.rateLimiting.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Load Balancing</span>
                    <Badge className={gatewayConfig.loadBalancing.enabled ? 'bg-green-500' : 'bg-gray-500'}>
                      {gatewayConfig.loadBalancing.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Caching</span>
                    <Badge className={gatewayConfig.caching.enabled ? 'bg-green-500' : 'bg-gray-500'}>
                      {gatewayConfig.caching.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Monitoring</span>
                    <Badge className={gatewayConfig.monitoring.enabled ? 'bg-green-500' : 'bg-gray-500'}>
                      {gatewayConfig.monitoring.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Logging</span>
                    <Badge className={gatewayConfig.logging.enabled ? 'bg-green-500' : 'bg-gray-500'}>
                      {gatewayConfig.logging.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Analytics</span>
                    <Badge className={gatewayConfig.analytics.enabled ? 'bg-green-500' : 'bg-gray-500'}>
                      {gatewayConfig.analytics.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gatewayConfig.endpoints.map((endpoint) => (
              <Card key={endpoint.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {endpoint.method} {endpoint.path}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(endpoint.status)} text-white`}>
                      {endpoint.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Requests:</span>
                      <span className="ml-2 font-medium">{endpoint.requests.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Errors:</span>
                      <span className="ml-2 font-medium">{endpoint.errors}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Latency:</span>
                      <span className="ml-2 font-medium">{endpoint.latency}ms</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Rate Limit:</span>
                      <span className="ml-2 font-medium">{endpoint.rateLimit}/h</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      <span className="text-sm">Authentication</span>
                      <Badge variant="outline">{endpoint.authentication ? 'Required' : 'Optional'}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span className="text-sm">Monitoring</span>
                      <Badge variant="outline">{endpoint.monitoring ? 'Enabled' : 'Disabled'}</Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
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

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>API Keys</Label>
                    <Switch checked={gatewayConfig.security.apiKeys} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>OAuth 2.0</Label>
                    <Switch checked={gatewayConfig.security.oauth} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>JWT Tokens</Label>
                    <Switch checked={gatewayConfig.security.jwt} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>CORS</Label>
                    <Switch checked={gatewayConfig.security.cors} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Encryption</Label>
                    <Switch checked={gatewayConfig.security.encryption} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Signature Validation</Label>
                    <Switch checked={gatewayConfig.security.signatureValidation} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Global Limit (per hour)</Label>
                  <Input value={gatewayConfig.rateLimiting.globalLimit} />
                </div>
                <div className="space-y-2">
                  <Label>User Limit (per hour)</Label>
                  <Input value={gatewayConfig.rateLimiting.userLimit} />
                </div>
                <div className="space-y-2">
                  <Label>IP Limit (per hour)</Label>
                  <Input value={gatewayConfig.rateLimiting.ipLimit} />
                </div>
                <div className="space-y-2">
                  <Label>Enforcement</Label>
                  <Select value={gatewayConfig.rateLimiting.enforcement}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strict">Strict</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="logging">Logging Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring & Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Metrics Collection</Label>
                    <Switch checked={gatewayConfig.monitoring.metrics} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Health Checks</Label>
                    <Switch checked={gatewayConfig.monitoring.healthChecks} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Error Tracking</Label>
                    <Switch checked={gatewayConfig.monitoring.errorTracking} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Response Time Monitoring</Label>
                    <Switch checked={gatewayConfig.monitoring.responseTime} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Alerts</Label>
                    <Switch checked={gatewayConfig.monitoring.alerts} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Load Balancing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Algorithm</Label>
                  <Select value={gatewayConfig.loadBalancing.algorithm}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round_robin">Round Robin</SelectItem>
                      <SelectItem value="least_connections">Least Connections</SelectItem>
                      <SelectItem value="ip_hash">IP Hash</SelectItem>
                      <SelectItem value="weighted">Weighted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Health Check</Label>
                    <Switch checked={gatewayConfig.loadBalancing.healthCheck} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Failover</Label>
                    <Switch checked={gatewayConfig.loadBalancing.failover} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Caching</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>TTL (seconds)</Label>
                  <Input value={gatewayConfig.caching.ttl} />
                </div>
                <div className="space-y-2">
                  <Label>Strategy</Label>
                  <Select value={gatewayConfig.caching.strategy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="memory">Memory</SelectItem>
                      <SelectItem value="redis">Redis</SelectItem>
                      <SelectItem value="memcached">Memcached</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showEndpointModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Add New Endpoint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="Enter endpoint name" />
                </div>
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Path</Label>
                  <Input placeholder="/api/v1/example" />
                </div>
                <div className="space-y-2">
                  <Label>Upstream</Label>
                  <Input placeholder="https://service.internal.com" />
                </div>
                <div className="space-y-2">
                  <Label>Rate Limit</Label>
                  <Input type="number" placeholder="1000" />
                </div>
                <div className="space-y-2">
                  <Label>Version</Label>
                  <Input placeholder="1.0" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEndpointModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  apiGatewayRef.current?.createEndpoint({
                    name: 'New Endpoint',
                    path: '/api/v1/new',
                    method: 'GET',
                    upstream: 'https://service.internal.com',
                    rateLimit: 1000,
                    version: '1.0',
                    authentication: false,
                    monitoring: true
                  });
                  setShowEndpointModal(false);
                }}>
                  Create Endpoint
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 