import { EventEmitter } from 'events';
interface ComputeNode {
    id: string;
    hostname: string;
    ip: string;
    port: number;
    status: 'online' | 'offline' | 'busy' | 'maintenance';
    capabilities: NodeCapabilities;
    resources: NodeResources;
    currentLoad: number;
    lastHeartbeat: Date;
    metadata: Record<string, any>;
}
interface NodeCapabilities {
    gpu: {
        count: number;
        memory: number;
        compute: string;
        architecture: string;
    };
    cpu: {
        cores: number;
        threads: number;
        frequency: number;
        architecture: string;
    };
    memory: {
        total: number;
        available: number;
    };
    storage: {
        total: number;
        available: number;
        type: 'ssd' | 'hdd' | 'nvme';
    };
    network: {
        bandwidth: number;
        latency: number;
    };
    specialized: string[];
}
interface NodeResources {
    cpuUsage: number;
    memoryUsage: number;
    gpuUsage: number;
    storageUsage: number;
    networkUsage: number;
    temperature: number;
    powerConsumption: number;
}
interface ComputeTask {
    id: string;
    type: string;
    priority: number;
    requirements: TaskRequirements;
    payload: any;
    dependencies: string[];
    timeout: number;
    retries: number;
    status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed' | 'cancelled';
    assignedNode?: string;
    startTime?: Date;
    endTime?: Date;
    result?: any;
    error?: string;
    progress?: number;
}
interface TaskRequirements {
    minCpuCores: number;
    minMemory: number;
    minGpuMemory: number;
    requiredCapabilities: string[];
    preferredNode?: string;
    exclusiveAccess: boolean;
    estimatedDuration: number;
}
interface ClusterMetrics {
    totalNodes: number;
    activeNodes: number;
    totalTasks: number;
    runningTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageTaskTime: number;
    clusterUtilization: number;
    throughput: number;
    errorRate: number;
}
export declare class ComputeCluster extends EventEmitter {
    private nodes;
    private tasks;
    private taskQueue;
    private runningTasks;
    private completedTasks;
    private failedTasks;
    private loadBalancer;
    private scheduler;
    private metrics;
    private isRunning;
    private heartbeatInterval;
    private schedulerInterval;
    private metricsInterval;
    private logger;
    private metricsCollector;
    private config;
    constructor();
    private initializeCluster;
    private setupEventHandlers;
    private setupLoadBalancer;
    private setupScheduler;
    private initializeMetrics;
    registerNode(nodeInfo: Partial<ComputeNode>): Promise<string>;
    unregisterNode(nodeId: string): Promise<void>;
    updateNodeResources(nodeId: string, resources: Partial<NodeResources>): void;
    submitTask(taskInfo: Partial<ComputeTask>): Promise<string>;
    cancelTask(taskId: string, reason?: string): Promise<void>;
    getTaskStatus(taskId: string): ComputeTask | null;
    getTaskHistory(limit?: number): ComputeTask[];
    startCluster(): Promise<void>;
    stopCluster(): Promise<void>;
    private scheduleNextTasks;
    private assignTaskToNode;
    private sendNodeCommand;
    private handleNodeJoined;
    private handleNodeLeft;
    private handleTaskCompleted;
    private handleTaskFailed;
    private handleNodeHealthCheck;
    private performHeartbeatCheck;
    private updateMetrics;
    private nodeCanHandleTask;
    private calculateNodeScore;
    private calculateNodeLoad;
    private canAcceptTasks;
    private areDependenciesMet;
    private handleTaskFailure;
    private calculateAverageTaskTime;
    private calculateClusterUtilization;
    private calculateThroughput;
    private calculateErrorRate;
    private generateNodeId;
    private generateTaskId;
    private getDefaultCapabilities;
    private getDefaultResources;
    private getDefaultRequirements;
    getClusterStatus(): {
        isRunning: boolean;
        metrics: ClusterMetrics;
        nodes: ComputeNode[];
        queueLength: number;
    };
    getNodeDetails(nodeId: string): ComputeNode | null;
    scaleCluster(targetNodes: number): Promise<void>;
    drainNode(nodeId: string): Promise<void>;
}
export {};
//# sourceMappingURL=ComputeCluster.d.ts.map