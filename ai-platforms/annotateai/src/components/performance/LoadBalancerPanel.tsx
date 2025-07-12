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
  Server, 
  Network, 
  Heart, 
  Settings, 
  BarChart3, 
  LineChart, 
  Users, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  GitBranch, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw 
} from 'lucide-react';

// Load Balancer Types
interface BackendServer {
  id: string;
  name: string;
  address: string;
  port: number;
  status: 'healthy' | 'unhealthy' | 'draining';
  weight: number;
  connections: number;
  latency: number;
  cpu: number;
  memory: number;
}

interface ServerPool {
  id: string;
  name: string;
  algorithm: 'round_robin' | 'least_connections' | 'ip_hash' | 'weighted_round_robin';
  servers: BackendServer[];
  healthCheck: HealthCheckConfig;
  stickySession: StickySessionConfig;
}

interface HealthCheckConfig {
  enabled: boolean;
  type: 'http' | 'tcp' | 'ping';
  path: string;
  interval: number;
  timeout: number;
  healthyThreshold: number;
  unhealthyThreshold: number;
}

interface StickySessionConfig {
  enabled: boolean;
  type: 'cookie' | 'source_ip';
  cookieName?: string;
  timeout?: number;
}

interface LoadBalancerStats {
  activeConnections: number;
  totalRequests: number;
  throughput: number; // req/s
  errorRate: number; // %
  healthyServers: number;
  unhealthyServers: number;
  trafficIn: number; // MB
  trafficOut: number; // MB
}

interface LoadBalancerConfig {
  globalAlgorithm: string;
  failoverPolicy: 'redirect' | 'drop' | 'retry';
  sslTermination: boolean;
  http2Enabled: boolean;
  websocketsEnabled: boolean;
}

export default function LoadBalancerPanel() {
  const [pools, setPools] = useState<ServerPool[]>([]);
  const [stats, setStats] = useState<LoadBalancerStats | null>(null);
  const [config, setConfig] = useState<LoadBalancerConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBalancerRef = useRef<any>(null);

  useEffect(() => {
    const initializeLoadBalancer = async () => {
      try {
        loadBalancerRef.current = {
          getPools: async () => generateMockPools(),
          getStats: async () => generateMockStats(),
          getConfig: async () => generateMockConfig(),
          updatePool: async (id: string, newConfig: Partial<ServerPool>) => {
            setPools(prev => prev.map(p => p.id === id ? { ...p, ...newConfig } : p));
          },
          addServer: async (poolId: string, server: Partial<BackendServer>) => {
            const newServer = {
              ...server,
              id: `server_${Date.now()}`,
              status: 'healthy' as const,
              connections: 0,
              latency: 0,
              cpu: 0,
              memory: 0
            };
            setPools(prev => prev.map(p => 
              p.id === poolId ? { ...p, servers: [...p.servers, newServer as BackendServer] } : p
            ));
          }
        };

        const [poolsData, statsData, configData] = await Promise.all([
          loadBalancerRef.current.getPools(),
          loadBalancerRef.current.getStats(),
          loadBalancerRef.current.getConfig()
        ]);

        setPools(poolsData);
        setStats(statsData);
        setConfig(configData);
      } catch (err) {
        setError('Failed to initialize load balancer');
      }
    };
    initializeLoadBalancer();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'unhealthy': return 'bg-red-500';
      case 'draining': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const generateMockPools = (): ServerPool[] => [
    {
      id: 'pool-1',
      name: 'Web Servers',
      algorithm: 'round_robin',
      servers: [
        { id: 'server-1', name: 'web-1', address: '10.0.1.10', port: 80, status: 'healthy', weight: 100, connections: 150, latency: 45, cpu: 60, memory: 75 },
        { id: 'server-2', name: 'web-2', address: '10.0.1.11', port: 80, status: 'healthy', weight: 100, connections: 145, latency: 48, cpu: 58, memory: 72 },
        { id: 'server-3', name: 'web-3', address: '10.0.1.12', port: 80, status: 'unhealthy', weight: 100, connections: 0, latency: 0, cpu: 0, memory: 0 }
      ],
      healthCheck: { enabled: true, type: 'http', path: '/health', interval: 5, timeout: 2, healthyThreshold: 2, unhealthyThreshold: 2 },
      stickySession: { enabled: true, type: 'cookie', cookieName: 'JSESSIONID', timeout: 3600 }
    }
  ];

  const generateMockStats = (): LoadBalancerStats => ({
    activeConnections: 295,
    totalRequests: 12580,
    throughput: 150,
    errorRate: 0.2,
    healthyServers: 2,
    unhealthyServers: 1,
    trafficIn: 120,
    trafficOut: 450
  });

  const generateMockConfig = (): LoadBalancerConfig => ({
    globalAlgorithm: 'round_robin',
    failoverPolicy: 'retry',
    sslTermination: true,
    http2Enabled: true,
websocketsEnabled: true,
  });

  if (!pools || !stats || !config) {
    return (
      <div className="text-center p-12">
        <Network className="h-12 w-12 text-gray-400 mx-auto" />
        <p>Loading Load Balancer Panel...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Network className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Load Balancer</h2>
            <p className="text-gray-600">Distribute traffic across your backend services</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle>Active Connections</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.activeConnections}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Throughput</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.throughput} req/s</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Healthy Servers</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.healthyServers} / {stats.healthyServers + stats.unhealthyServers}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Error Rate</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.errorRate}%</p></CardContent>
        </Card>
      </div>

      <div>
        {pools.map(pool => (
          <Card key={pool.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{pool.name}</CardTitle>
                <Badge>{pool.algorithm.replace('_', ' ')}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pool.servers.map(server => (
                  <div key={server.id} className="p-3 border rounded flex justify-between items-center">
                    <div>
                      <p className="font-medium">{server.name} ({server.address}:{server.port})</p>
                      <p className="text-sm text-gray-500">
                        Connections: {server.connections} | Latency: {server.latency}ms
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(server.status)}>{server.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 