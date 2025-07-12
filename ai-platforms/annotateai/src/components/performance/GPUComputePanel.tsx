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
  Input, 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../../../shared/components/ui';
import { 
  Cpu, 
  Layers, 
  Thermometer, 
  Zap, 
  Activity, 
  Settings, 
  BarChart3, 
  LineChart, 
  Server, 
  Info, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';

// GPU Compute Types
interface GPU {
  id: number;
  name: string;
  driverVersion: string;
  cudaVersion: string;
  status: 'online' | 'offline' | 'error';
  utilization: {
    gpu: number;
    memory: number;
    encoder: number;
    decoder: number;
  };
  memory: {
    used: number;
    total: number;
    unit: 'MB' | 'GB';
  };
  temperature: number;
  power: {
    usage: number;
    limit: number;
  };
  clocks: {
    graphics: number;
    sm: number;
    memory: number;
  };
  processes: GPUProcess[];
}

interface GPUProcess {
  pid: number;
  command: string;
  gpuMemoryUsage: number;
  user: string;
}

interface GPUJob {
  id: string;
  name: string;
  user: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  gpuIds: number[];
  submittedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  priority: 'low' | 'normal' | 'high';
}

interface GPUConfig {
  scheduler: 'fifo' | 'fair_share' | 'priority';
  preemption: boolean;
  exclusiveMode: boolean;
}

export default function GPUComputePanel() {
  const [gpus, setGpus] = useState<GPU[]>([]);
  const [jobs, setJobs] = useState<GPUJob[]>([]);
  const [config, setConfig] = useState<GPUConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const gpuComputeRef = useRef<any>(null);

  useEffect(() => {
    const initializeGPUCompute = async () => {
      gpuComputeRef.current = {
        getGPUs: async () => generateMockGPUs(),
        getJobs: async () => generateMockJobs(),
        getConfig: async () => generateMockConfig(),
      };

      const [gpusData, jobsData, configData] = await Promise.all([
        gpuComputeRef.current.getGPUs(),
        gpuComputeRef.current.getJobs(),
        gpuComputeRef.current.getConfig(),
      ]);

      setGpus(gpusData);
      setJobs(jobsData);
      setConfig(configData);
    };
    initializeGPUCompute();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'error': return 'bg-yellow-500';
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'queued': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };
  
  const generateMockGPUs = (): GPU[] => [
    {
      id: 0,
      name: 'NVIDIA GeForce RTX 4090',
      driverVersion: '535.104.05',
      cudaVersion: '12.2',
      status: 'online',
      utilization: { gpu: 75, memory: 60, encoder: 0, decoder: 10 },
      memory: { used: 14745, total: 24576, unit: 'MB' },
      temperature: 72,
      power: { usage: 350, limit: 450 },
      clocks: { graphics: 2520, sm: 2235, memory: 1313 },
      processes: [
        { pid: 2345, command: 'python train.py', gpuMemoryUsage: 12288, user: 'app' },
      ],
    },
  ];

  const generateMockJobs = (): GPUJob[] => [
    { id: 'job-1', name: 'Model Training A', user: 'user1', status: 'running', gpuIds: [0], submittedAt: new Date(), startedAt: new Date(), priority: 'high' },
    { id: 'job-2', name: 'Inference Batch', user: 'user2', status: 'queued', gpuIds: [0], submittedAt: new Date(), priority: 'normal' },
  ];

  const generateMockConfig = (): GPUConfig => ({
    scheduler: 'fair_share',
    preemption: true,
    exclusiveMode: false,
  });

  if (!gpus.length || !config) {
    return <div className="p-6">Loading GPU data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Layers className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">GPU Compute</h2>
            <p className="text-gray-600">Monitor and manage GPU resources and jobs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {gpus.map(gpu => (
          <Card key={gpu.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>GPU {gpu.id}: {gpu.name}</CardTitle>
                <Badge className={getStatusColor(gpu.status)}>{gpu.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>GPU Utilization</Label>
                  <Progress value={gpu.utilization.gpu} />
                </div>
                <div>
                  <Label>Memory Utilization</Label>
                  <Progress value={(gpu.memory.used / gpu.memory.total) * 100} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <p>Temp: {gpu.temperature}°C</p>
                <p>Power: {gpu.power.usage}W / {gpu.power.limit}W</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>GPU Job Queue</CardTitle></CardHeader>
        <CardContent>
          {jobs.map(job => (
            <div key={job.id} className="p-3 border rounded mb-2 flex justify-between items-center">
              <div>
                <p className="font-medium">{job.name} ({job.user})</p>
                <p className="text-sm text-gray-500">Submitted: {job.submittedAt.toLocaleTimeString()}</p>
              </div>
              <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
} 