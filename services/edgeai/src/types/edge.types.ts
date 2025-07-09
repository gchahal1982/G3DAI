export interface AIModel {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'detection' | 'segmentation' | 'custom';
  framework: 'tensorflow' | 'onnx' | 'tflite' | 'custom';
  size: number;
  inputShape: number[];
  outputShape: number[];
  metadata: ModelMetadata;
}

export interface ModelMetadata {
  accuracy: number;
  latency: number;
  description: string;
  labels?: string[];
}

export interface EdgeDevice {
  id: string;
  name: string;
  type: 'raspberry-pi' | 'jetson' | 'coral' | 'mobile' | 'custom';
  capabilities: DeviceCapabilities;
  status: DeviceStatus;
  location?: DeviceLocation;
}

export interface DeviceCapabilities {
  cpu: string;
  memory: number;
  storage: number;
  accelerator?: 'gpu' | 'tpu' | 'npu';
  connectivity: string[];
}

export interface DeviceStatus {
  online: boolean;
  lastSeen: Date;
  cpuUsage: number;
  memoryUsage: number;
  temperature?: number;
}

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  zone: string;
}

export interface EdgeDeploymentConfig {
  maxModelSize: number;
  quantizationLevel: 'int8' | 'int16' | 'float16' | 'dynamic';
  pruningRatio: number;
  redundancy: number;
  loadBalancing: boolean;
  rolloutStrategy: 'immediate' | 'canary' | 'blue-green';
}

export interface EdgeDeployment {
  id: string;
  modelId: string;
  devices: string[];
  status: DeploymentStatus;
  metrics: DeploymentMetrics;
  created: Date;
  updated: Date;
}

export interface DeploymentStatus {
  phase: 'pending' | 'deploying' | 'active' | 'failed';
  progress: number;
  message: string;
}

export interface DeploymentMetrics {
  inferenceCount: number;
  averageLatency: number;
  errorRate: number;
  throughput: number;
}
