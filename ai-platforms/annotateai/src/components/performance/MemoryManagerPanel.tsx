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
  SelectValue 
} from '../../../../../shared/components/ui';
import { 
  MemoryStick, 
  Cpu, 
  Server, 
  Database, 
  Recycle, 
  Search, 
  Settings, 
  BarChart3, 
  LineChart, 
  PieChart, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Zap, 
  Trash2, 
  Play, 
  Filter, 
  Clock, 
  Maximize, 
  Layers, 
  Box, 
  Package, 
  Thermometer, 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal 
} from 'lucide-react';

// Memory Management Types
interface MemoryUsage {
  total: number;
  used: number;
  free: number;
  active: number;
  inactive: number;
  buffers: number;
  cached: number;
  swapTotal: number;
  swapUsed: number;
  unit: 'MB' | 'GB' | 'TB';
}

interface ProcessMemoryInfo {
  pid: number;
  name: string;
  user: string;
  rss: number; // Resident Set Size
  vms: number; // Virtual Memory Size
  cpuUsage: number;
  memoryUsage: number;
  status: 'running' | 'sleeping' | 'stopped' | 'zombie';
  command: string;
}

interface MemoryAllocation {
  service: string;
  allocated: number;
  used: number;
  limit: number;
  unit: string;
}

interface GarbageCollectionStats {
  collector: string;
  collections: number;
  totalTime: number; // ms
  avgTime: number; // ms
  maxTime: number; // ms
  lastCollection: Date;
  heapUsageBefore: number;
  heapUsageAfter: number;
}

interface MemoryLeak {
  id: string;
  service: string;
  potentialSource: string;
  growthRate: number; // MB/hour
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'resolved';
  firstDetected: Date;
  lastDetected: Date;
}

interface CacheStats {
  name: string;
  size: number;
  items: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  memoryUsage: number;
  unit: string;
}

interface MemoryManagerConfig {
  gcStrategy: 'auto' | 'manual' | 'generational' | 'concurrent';
  memoryPooling: boolean;
  leakDetection: boolean;
  profiling: boolean;
  cacheEvictionPolicy: 'lru' | 'lfu' | 'fifo' | 'random';
}

interface MemoryProfile {
  id: string;
  service: string;
  timestamp: Date;
  duration: number;
  heapSnapshotUrl?: string;
  flamegraphUrl?: string;
  status: 'running' | 'completed' | 'failed';
}

export default function MemoryManagerPanel() {
  // State management
  const [memoryUsage, setMemoryUsage] = useState<MemoryUsage | null>(null);
  const [processes, setProcesses] = useState<ProcessMemoryInfo[]>([]);
  const [allocations, setAllocations] = useState<MemoryAllocation[]>([]);
  const [gcStats, setGcStats] = useState<GarbageCollectionStats[]>([]);
  const [leaks, setLeaks] = useState<MemoryLeak[]>([]);
  const [caches, setCaches] = useState<CacheStats[]>([]);
  const [config, setConfig] = useState<MemoryManagerConfig | null>(null);
  const [profiles, setProfiles] = useState<MemoryProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('memoryUsage');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Backend connection
  const memoryManagerRef = useRef<any>(null);

  // Initialize
  useEffect(() => {
    const initializeMemoryManager = async () => {
      try {
        memoryManagerRef.current = {
          getMemoryUsage: async () => generateMockMemoryUsage(),
          getProcesses: async () => generateMockProcesses(),
          getAllocations: async () => generateMockAllocations(),
          getGcStats: async () => generateMockGcStats(),
          getLeaks: async () => generateMockLeaks(),
          getCaches: async () => generateMockCaches(),
          getConfig: async () => generateMockConfig(),
          getProfiles: async () => generateMockProfiles(),
          runGarbageCollection: async () => { /* Simulate GC */ },
          runLeakDetection: async () => { /* Simulate leak detection */ },
          runProfiling: async (service: string) => {
            const newProfile = {
              id: `profile_${Date.now()}`,
              service,
              timestamp: new Date(),
              duration: 0,
              status: 'running' as const
            };
            setProfiles(prev => [...prev, newProfile]);
          },
          updateConfig: async (newConfig: Partial<MemoryManagerConfig>) => {
            setConfig(prev => prev ? { ...prev, ...newConfig } : null);
          }
        };

        const [usage, procs, allocs, gc, lks, cachesData, cfg, profs] = await Promise.all([
          memoryManagerRef.current.getMemoryUsage(),
          memoryManagerRef.current.getProcesses(),
          memoryManagerRef.current.getAllocations(),
          memoryManagerRef.current.getGcStats(),
          memoryManagerRef.current.getLeaks(),
          memoryManagerRef.current.getCaches(),
          memoryManagerRef.current.getConfig(),
          memoryManagerRef.current.getProfiles()
        ]);

        setMemoryUsage(usage);
        setProcesses(procs);
        setAllocations(allocs);
        setGcStats(gc);
        setLeaks(lks);
        setCaches(cachesData);
        setConfig(cfg);
        setProfiles(profs);

      } catch (error) {
        console.error('Failed to initialize memory manager:', error);
        setError('Failed to initialize memory manager');
      }
    };

    initializeMemoryManager();
  }, []);

  // Actions
  const runGC = useCallback(async () => {
    await memoryManagerRef.current?.runGarbageCollection();
  }, []);

  const runLeakDetection = useCallback(async () => {
    await memoryManagerRef.current?.runLeakDetection();
  }, []);

  const runProfiling = useCallback(async (service: string) => {
    await memoryManagerRef.current?.runProfiling(service);
  }, []);

  // Sorting and filtering
  const sortedProcesses = [...processes].sort((a, b) => {
    const fieldA = a[sortField as keyof ProcessMemoryInfo];
    const fieldB = b[sortField as keyof ProcessMemoryInfo];
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredProcesses = sortedProcesses.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.command.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock data generators
  const generateMockMemoryUsage = (): MemoryUsage => ({
    total: 32768,
    used: 22118,
    free: 10650,
    active: 18000,
    inactive: 4118,
    buffers: 1200,
    cached: 8000,
    swapTotal: 16384,
    swapUsed: 1024,
    unit: 'MB'
  });

  const generateMockProcesses = (): ProcessMemoryInfo[] => [
    { pid: 1234, name: 'node', user: 'app', rss: 1200, vms: 2500, cpuUsage: 15.5, memoryUsage: 7.3, status: 'running', command: 'node /app/server.js' },
    { pid: 5678, name: 'postgres', user: 'postgres', rss: 850, vms: 1800, cpuUsage: 5.2, memoryUsage: 2.6, status: 'running', command: 'postgres -D /var/lib/postgresql/data' },
    { pid: 9101, name: 'redis-server', user: 'redis', rss: 450, vms: 900, cpuUsage: 2.1, memoryUsage: 1.4, status: 'running', command: 'redis-server *:6379' },
  ];

  const generateMockAllocations = (): MemoryAllocation[] => [
    { service: 'Backend API', allocated: 4096, used: 3200, limit: 8192, unit: 'MB' },
    { service: 'Database', allocated: 8192, used: 6500, limit: 16384, unit: 'MB' },
    { service: 'Cache', allocated: 2048, used: 1500, limit: 4096, unit: 'MB' },
  ];

  const generateMockGcStats = (): GarbageCollectionStats[] => [
    { collector: 'G1 Young Generation', collections: 152, totalTime: 4500, avgTime: 29.6, maxTime: 150, lastCollection: new Date(), heapUsageBefore: 1800, heapUsageAfter: 400 },
    { collector: 'G1 Old Generation', collections: 5, totalTime: 2500, avgTime: 500, maxTime: 800, lastCollection: new Date(Date.now() - 60 * 60 * 1000), heapUsageBefore: 3000, heapUsageAfter: 2500 },
  ];

  const generateMockLeaks = (): MemoryLeak[] => [
    { id: 'leak-1', service: 'Backend API', potentialSource: 'sessionStore', growthRate: 5.2, severity: 'medium', status: 'detected', firstDetected: new Date(Date.now() - 48 * 60 * 60 * 1000), lastDetected: new Date() },
  ];

  const generateMockCaches = (): CacheStats[] => [
    { name: 'User Sessions', size: 10000, items: 8540, hits: 150230, misses: 2345, hitRate: 98.5, evictions: 120, memoryUsage: 256, unit: 'MB' },
    { name: 'Project Data', size: 5000, items: 4210, hits: 89045, misses: 8765, hitRate: 91.0, evictions: 450, memoryUsage: 512, unit: 'MB' },
  ];

  const generateMockConfig = (): MemoryManagerConfig => ({
    gcStrategy: 'auto',
    memoryPooling: true,
    leakDetection: true,
    profiling: true,
    cacheEvictionPolicy: 'lru'
  });

  const generateMockProfiles = (): MemoryProfile[] => [
    { id: 'prof-1', service: 'Backend API', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), duration: 600, heapSnapshotUrl: '/profiles/heap-1.json', status: 'completed' },
  ];

  if (!memoryUsage || !config) {
    return (
      <div className="memory-manager-panel p-6">
        <div className="text-center py-12">
          <MemoryStick className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Loading Memory Data</h3>
          <p className="text-gray-600">Initializing memory management system...</p>
        </div>
      </div>
    );
  }

  const memoryUsagePercent = (memoryUsage.used / memoryUsage.total) * 100;
  const swapUsagePercent = (memoryUsage.swapUsed / memoryUsage.swapTotal) * 100;

  return (
    <div className="memory-manager-panel p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MemoryStick className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Memory Management</h2>
            <p className="text-gray-600">Monitor, analyze, and optimize memory usage</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={runGC}>
            <Recycle className="h-4 w-4 mr-2" />
            Run GC
          </Button>
          <Button variant="outline" onClick={runLeakDetection}>
            <Search className="h-4 w-4 mr-2" />
            Detect Leaks
          </Button>
          <Button onClick={() => setActiveTab('profiling')}>
            <Zap className="h-4 w-4 mr-2" />
            Profile Memory
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

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="processes">Processes</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
          <TabsTrigger value="gc">Garbage Collection</TabsTrigger>
          <TabsTrigger value="leaks">Leak Detection</TabsTrigger>
          <TabsTrigger value="caches">Caches</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Memory Usage Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between">
                        <span>Total Memory</span>
                        <span>{memoryUsage.used.toFixed(0)} / {memoryUsage.total.toFixed(0)} {memoryUsage.unit}</span>
                      </div>
                      <Progress value={memoryUsagePercent} className="mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span>Swap Memory</span>
                        <span>{memoryUsage.swapUsed.toFixed(0)} / {memoryUsage.swapTotal.toFixed(0)} {memoryUsage.unit}</span>
                      </div>
                      <Progress value={swapUsagePercent} className="mt-1" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-600">Active:</span> {memoryUsage.active} {memoryUsage.unit}</div>
                  <div><span className="text-gray-600">Inactive:</span> {memoryUsage.inactive} {memoryUsage.unit}</div>
                  <div><span className="text-gray-600">Buffers:</span> {memoryUsage.buffers} {memoryUsage.unit}</div>
                  <div><span className="text-gray-600">Cached:</span> {memoryUsage.cached} {memoryUsage.unit}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Processes by Memory Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredProcesses.map(p => (
                  <div key={p.pid} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{p.name} (PID: {p.pid})</p>
                      <p className="text-xs text-gray-500">{p.command}</p>
                    </div>
                    <div className="text-right">
                      <p>{p.rss} MB</p>
                      <p className="text-xs text-gray-500">{p.memoryUsage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="allocations" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Service Memory Allocations</CardTitle></CardHeader>
            <CardContent>
              {allocations.map(a => (
                <div key={a.service} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span>{a.service}</span>
                    <span>{a.used}/{a.limit} {a.unit}</span>
                  </div>
                  <Progress value={(a.used/a.limit)*100} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gc" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Garbage Collection Statistics</CardTitle></CardHeader>
            <CardContent>
              {gcStats.map(gc => (
                <div key={gc.collector} className="mb-4 p-2 border rounded">
                  <h4 className="font-medium">{gc.collector}</h4>
                  <div className="grid grid-cols-2 text-sm">
                    <p>Collections: {gc.collections}</p>
                    <p>Total Time: {gc.totalTime} ms</p>
                    <p>Avg Time: {gc.avgTime.toFixed(2)} ms</p>
                    <p>Max Time: {gc.maxTime} ms</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="leaks" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Memory Leak Detection</CardTitle></CardHeader>
            <CardContent>
              {leaks.map(leak => (
                <Alert key={leak.id} variant={leak.severity === 'critical' || leak.severity === 'high' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {leak.severity.toUpperCase()}: Potential leak in {leak.service} ({leak.potentialSource}). Growth rate: {leak.growthRate} MB/hr.
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caches" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Cache Statistics</CardTitle></CardHeader>
            <CardContent>
              {caches.map(cache => (
                <div key={cache.name} className="mb-4 p-2 border rounded">
                  <h4 className="font-medium">{cache.name}</h4>
                  <div className="grid grid-cols-2 text-sm">
                    <p>Items: {cache.items}</p>
                    <p>Memory: {cache.memoryUsage} {cache.unit}</p>
                    <p>Hit Rate: {cache.hitRate.toFixed(1)}%</p>
                    <p>Evictions: {cache.evictions}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
} 