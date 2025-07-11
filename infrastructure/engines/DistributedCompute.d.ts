import { EventEmitter } from 'events';
interface ComputeNode {
    id: string;
    hostname: string;
    ip: string;
    port: number;
    region: string;
    zone: string;
    type: 'edge' | 'cloud' | 'hybrid' | 'mobile';
    status: 'online' | 'offline' | 'busy' | 'maintenance' | 'error';
    capabilities: NodeCapabilities;
    resources: NodeResources;
    workload: NodeWorkload;
    lastHeartbeat: Date;
    metadata: Record<string, any>;
}
interface NodeCapabilities {
    cpu: {
        cores: number;
        frequency: number;
        architecture: string;
        features: string[];
    };
    memory: {
        total: number;
        available: number;
        type: string;
    };
    gpu: {
        count: number;
        memory: number;
        compute: string;
        architecture: string;
    };
    storage: {
        total: number;
        available: number;
        type: 'ssd' | 'hdd' | 'nvme';
        iops: number;
    };
    network: {
        bandwidth: number;
        latency: number;
        protocols: string[];
    };
    specialized: {
        ai: boolean;
        ml: boolean;
        vision: boolean;
        audio: boolean;
        edge: boolean;
    };
}
interface NodeResources {
    cpuUsage: number;
    memoryUsage: number;
    gpuUsage: number;
    storageUsage: number;
    networkUsage: number;
    temperature: number;
    powerConsumption: number;
    batteryLevel?: number;
}
interface NodeWorkload {
    activeTasks: number;
    queuedTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageTaskTime: number;
    throughput: number;
    efficiency: number;
}
interface ComputeTask {
    id: string;
    type: 'ml_inference' | 'data_processing' | 'image_analysis' | 'video_processing' | 'custom';
    priority: number;
    requirements: TaskRequirements;
    payload: TaskPayload;
    dependencies: string[];
    constraints: TaskConstraints;
    status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed' | 'cancelled';
    assignedNodeId?: string;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    result?: any;
    error?: string;
    progress: number;
    metrics: TaskMetrics;
}
interface TaskRequirements {
    minCpuCores: number;
    minMemory: number;
    minGpuMemory: number;
    maxLatency: number;
    requiredFeatures: string[];
    preferredRegion?: string;
    preferredZone?: string;
    exclusiveAccess: boolean;
    estimatedDuration: number;
}
interface TaskPayload {
    data: any;
    model?: string;
    parameters: Record<string, any>;
    inputFormat: string;
    outputFormat: string;
    checksum: string;
}
interface TaskConstraints {
    maxRetries: number;
    timeout: number;
    deadline?: Date;
    dataLocality: boolean;
    securityLevel: 'low' | 'medium' | 'high' | 'critical';
    complianceRequirements: string[];
}
interface TaskMetrics {
    executionTime: number;
    resourceUsage: {
        cpu: number;
        memory: number;
        gpu: number;
        network: number;
    };
    dataTransfer: {
        input: number;
        output: number;
    };
    cost: number;
    efficiency: number;
}
interface EdgeCluster {
    id: string;
    name: string;
    region: string;
    nodeIds: string[];
    coordinator: string;
    loadBalancer: LoadBalancingConfig;
    replicationFactor: number;
    consistencyLevel: 'eventual' | 'strong' | 'bounded';
    metrics: ClusterMetrics;
}
interface LoadBalancingConfig {
    algorithm: 'round_robin' | 'least_connections' | 'weighted' | 'geographic';
    weights: Record<string, number>;
    healthCheckInterval: number;
    failoverEnabled: boolean;
}
interface ClusterMetrics {
    totalNodes: number;
    activeNodes: number;
    totalCapacity: NodeCapabilities;
    utilization: NodeResources;
    throughput: number;
    latency: number;
    availability: number;
    cost: number;
}
interface DistributedJob {
    id: string;
    name: string;
    type: 'batch' | 'stream' | 'interactive';
    tasks: string[];
    dependencies: JobDependency[];
    schedule?: JobSchedule;
    priority: number;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    metrics: JobMetrics;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}
interface JobDependency {
    jobId: string;
    type: 'sequential' | 'parallel' | 'conditional';
    condition?: string;
}
interface JobSchedule {
    type: 'immediate' | 'delayed' | 'recurring';
    startTime?: Date;
    interval?: number;
    cron?: string;
    timezone: string;
}
interface JobMetrics {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageTaskTime: number;
    totalExecutionTime: number;
    resourceUsage: NodeResources;
    cost: number;
}
export declare class DistributedCompute extends EventEmitter {
    private nodes;
    private tasks;
    private jobs;
    private clusters;
    private taskQueue;
    private runningTasks;
    private completedTasks;
    private distributionStrategy;
    private isRunning;
    private schedulerInterval;
    private heartbeatInterval;
    private metricsInterval;
    private cleanupInterval;
    constructor();
    private initializeDistributedCompute;
    private setupDistributionStrategy;
    private setupEventHandlers;
    registerNode(nodeInfo: Partial<ComputeNode>): string;
    unregisterNode(nodeId: string): void;
    updateNodeResources(nodeId: string, resources: Partial<NodeResources>): void;
    submitTask(taskInfo: Partial<ComputeTask>): string;
    cancelTask(taskId: string): void;
    getTaskStatus(taskId: string): ComputeTask | null;
    submitJob(jobInfo: Partial<DistributedJob>): string;
    createCluster(clusterInfo: Partial<EdgeCluster>): string;
    addNodeToCluster(clusterId: string, nodeId: string): void;
    removeNodeFromCluster(clusterId: string, nodeId: string): void;
    startDistributedCompute(): void;
    stopDistributedCompute(): void;
    private scheduleNextTasks;
    private assignTaskToNode;
    private migrateTask;
    private migrateTasksFromNode;
    private sendNodeCommand;
    private handleNodeJoined;
    private handleNodeLeft;
    private handleTaskCompleted;
    private handleTaskFailed;
    private handleNodeOverloaded;
    private handleClusterRebalance;
    private handleTaskError;
    private nodeCanHandleTask;
    private calculateNodeScore;
    private canAcceptTasks;
    private areDependenciesMet;
    private performHeartbeatCheck;
    private updateAllMetrics;
    private updateNodeMetrics;
    private updateClusterMetrics;
    private updateJobMetrics;
    private performCleanup;
    private rebalanceWorkload;
    private rebalanceCluster;
    private getDefaultCapabilities;
    private getDefaultResources;
    private getDefaultRequirements;
    private getDefaultPayload;
    private getDefaultConstraints;
    private generateNodeId;
    private generateTaskId;
    private generateJobId;
    private generateClusterId;
    getComputeStatus(): {
        nodes: number;
        activeNodes: number;
        totalTasks: number;
        runningTasks: number;
        queuedTasks: number;
        clusters: number;
        jobs: number;
    };
    getNodeDetails(nodeId: string): ComputeNode | null;
    getClusterDetails(clusterId: string): EdgeCluster | null;
    getJobDetails(jobId: string): DistributedJob | null;
    scaleCluster(clusterId: string, targetNodes: number): void;
}
export {};
//# sourceMappingURL=DistributedCompute.d.ts.map