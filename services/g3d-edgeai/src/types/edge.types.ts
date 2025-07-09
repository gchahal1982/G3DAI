/**
 * G3D EdgeAI - Edge Computing TypeScript Definitions
 */

export interface EdgeDevice {
    id: string;
    name: string;
    type: 'camera' | 'sensor' | 'gateway' | 'compute' | 'storage';
    status: 'online' | 'offline' | 'maintenance' | 'error';
    location: DeviceLocation;
    specifications: DeviceSpecs;
    models: DeployedModel[];
    metrics: DeviceMetrics;
    lastSeen: Date;
}

export interface DeviceLocation {
    latitude: number;
    longitude: number;
    address: string;
    zone: string;
    building?: string;
    floor?: string;
    room?: string;
}

export interface DeviceSpecs {
    cpu: string;
    memory: number; // GB
    storage: number; // GB
    gpu?: string;
    os: string;
    architecture: 'x86_64' | 'arm64' | 'armv7';
    powerConsumption: number; // watts
    networkInterfaces: NetworkInterface[];
}

export interface NetworkInterface {
    type: 'ethernet' | 'wifi' | 'cellular' | 'bluetooth';
    speed: number; // Mbps
    latency: number; // ms
    reliability: number; // percentage
}

export interface DeployedModel {
    id: string;
    name: string;
    version: string;
    type: 'inference' | 'training' | 'preprocessing';
    framework: 'tensorflow' | 'pytorch' | 'onnx' | 'tensorrt';
    status: 'running' | 'stopped' | 'updating' | 'failed';
    performance: ModelPerformance;
    deployedAt: Date;
}

export interface ModelPerformance {
    inferenceTime: number; // ms
    throughput: number; // requests/sec
    accuracy: number; // percentage
    memoryUsage: number; // MB
    cpuUsage: number; // percentage
    gpuUsage?: number; // percentage
}

export interface DeviceMetrics {
    cpuUsage: number;
    memoryUsage: number;
    storageUsage: number;
    temperature: number;
    powerDraw: number;
    networkBandwidth: number;
    uptime: number; // seconds
    errorRate: number;
    lastUpdated: Date;
}

export interface EdgeCluster {
    id: string;
    name: string;
    description: string;
    devices: string[];
    region: string;
    status: 'healthy' | 'degraded' | 'critical' | 'offline';
    capacity: ClusterCapacity;
    utilization: ClusterUtilization;
    createdAt: Date;
}

export interface ClusterCapacity {
    totalDevices: number;
    totalCpu: number;
    totalMemory: number;
    totalStorage: number;
    totalGpu?: number;
}

export interface ClusterUtilization {
    cpuUsage: number;
    memoryUsage: number;
    storageUsage: number;
    gpuUsage?: number;
    networkBandwidth: number;
}

export interface EdgeWorkload {
    id: string;
    name: string;
    type: 'inference' | 'data-processing' | 'analytics' | 'monitoring';
    targetDevices: string[];
    requirements: WorkloadRequirements;
    status: 'pending' | 'deploying' | 'running' | 'completed' | 'failed';
    metrics: WorkloadMetrics;
    createdAt: Date;
}

export interface WorkloadRequirements {
    minCpu: number;
    minMemory: number;
    minStorage: number;
    requiresGpu: boolean;
    maxLatency: number;
    minBandwidth: number;
    constraints: string[];
}

export interface WorkloadMetrics {
    executionTime: number;
    resourceUsage: ResourceUsage;
    dataProcessed: number;
    errorsCount: number;
    successRate: number;
}

export interface ResourceUsage {
    cpu: number;
    memory: number;
    storage: number;
    gpu?: number;
    network: number;
}