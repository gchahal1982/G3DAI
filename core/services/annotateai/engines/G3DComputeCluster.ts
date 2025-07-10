import { EventEmitter } from 'events';
import { Logger } from '../../../core/Logger';
import { Metrics } from '../../../core/Metrics';
import { Config } from '../../../core/Config';

// Types and Interfaces
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

interface LoadBalancingStrategy {
    name: string;
    selectNode(task: ComputeTask, availableNodes: ComputeNode[]): ComputeNode | null;
}

interface SchedulingPolicy {
    name: string;
    prioritize(tasks: ComputeTask[]): ComputeTask[];
}

export class ComputeCluster extends EventEmitter {
    private nodes: Map<string, ComputeNode> = new Map();
    private tasks: Map<string, ComputeTask> = new Map();
    private taskQueue: ComputeTask[] = [];
    private runningTasks: Map<string, ComputeTask> = new Map();
    private completedTasks: Map<string, ComputeTask> = new Map();
    private failedTasks: Map<string, ComputeTask> = new Map();

    private loadBalancer: LoadBalancingStrategy;
    private scheduler: SchedulingPolicy;
    private metrics: ClusterMetrics;
    private isRunning: boolean = false;

    private heartbeatInterval: NodeJS.Timeout | null = null;
    private schedulerInterval: NodeJS.Timeout | null = null;
    private metricsInterval: NodeJS.Timeout | null = null;

    private logger = Logger.getInstance();
    private metricsCollector = Metrics.getInstance();
    private config = Config.getInstance();

    constructor() {
        super();
        this.initializeCluster();
        this.setupLoadBalancer();
        this.setupScheduler();
        this.initializeMetrics();
    }

    private initializeCluster(): void {
        this.logger.info('Initializing G3D Compute Cluster');

        // Initialize cluster configuration
        const clusterConfig = this.config.get('cluster', {
            heartbeatInterval: 30000,
            schedulerInterval: 5000,
            metricsInterval: 60000,
            maxRetries: 3,
            taskTimeout: 3600000,
            nodeTimeout: 120000
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.on('nodeJoined', this.handleNodeJoined.bind(this));
        this.on('nodeLeft', this.handleNodeLeft.bind(this));
        this.on('taskCompleted', this.handleTaskCompleted.bind(this));
        this.on('taskFailed', this.handleTaskFailed.bind(this));
        this.on('nodeHealthCheck', this.handleNodeHealthCheck.bind(this));
    }

    private setupLoadBalancer(): void {
        this.loadBalancer = {
            name: 'weighted-round-robin',
            selectNode: (task: ComputeTask, availableNodes: ComputeNode[]): ComputeNode | null => {
                if (availableNodes.length === 0) return null;

                // Filter nodes that meet task requirements
                const suitableNodes = availableNodes.filter(node =>
                    this.nodeCanHandleTask(node, task)
                );

                if (suitableNodes.length === 0) return null;

                // Sort by weighted score (load, capabilities, performance)
                const scoredNodes = suitableNodes.map(node => ({
                    node,
                    score: this.calculateNodeScore(node, task)
                })).sort((a, b) => b.score - a.score);

                return scoredNodes[0].node;
            }
        };
    }

    private setupScheduler(): void {
        this.scheduler = {
            name: 'priority-fifo',
            prioritize: (tasks: ComputeTask[]): ComputeTask[] => {
                return tasks.sort((a, b) => {
                    if (a.priority !== b.priority) {
                        return b.priority - a.priority; // Higher priority first
                    }
                    // Same priority, FIFO
                    return new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime();
                });
            }
        };
    }

    private initializeMetrics(): void {
        this.metrics = {
            totalNodes: 0,
            activeNodes: 0,
            totalTasks: 0,
            runningTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            averageTaskTime: 0,
            clusterUtilization: 0,
            throughput: 0,
            errorRate: 0
        };
    }

    // Node Management
    public async registerNode(nodeInfo: Partial<ComputeNode>): Promise<string> {
        const nodeId = nodeInfo.id || this.generateNodeId();

        const node: ComputeNode = {
            id: nodeId,
            hostname: nodeInfo.hostname || 'unknown',
            ip: nodeInfo.ip || '127.0.0.1',
            port: nodeInfo.port || 8080,
            status: 'online',
            capabilities: nodeInfo.capabilities || this.getDefaultCapabilities(),
            resources: nodeInfo.resources || this.getDefaultResources(),
            currentLoad: 0,
            lastHeartbeat: new Date(),
            metadata: nodeInfo.metadata || {}
        };

        this.nodes.set(nodeId, node);
        this.emit('nodeJoined', node);

        this.logger.info(`Node registered: ${nodeId} (${node.hostname})`);
        return nodeId;
    }

    public async unregisterNode(nodeId: string): Promise<void> {
        const node = this.nodes.get(nodeId);
        if (!node) return;

        // Cancel running tasks on this node
        const nodeTasks = Array.from(this.runningTasks.values())
            .filter(task => task.assignedNode === nodeId);

        for (const task of nodeTasks) {
            await this.cancelTask(task.id, 'Node disconnected');
        }

        this.nodes.delete(nodeId);
        this.emit('nodeLeft', node);

        this.logger.info(`Node unregistered: ${nodeId}`);
    }

    public updateNodeResources(nodeId: string, resources: Partial<NodeResources>): void {
        const node = this.nodes.get(nodeId);
        if (!node) return;

        node.resources = { ...node.resources, ...resources };
        node.lastHeartbeat = new Date();
        node.currentLoad = this.calculateNodeLoad(node);

        this.emit('nodeHealthCheck', node);
    }

    // Task Management
    public async submitTask(taskInfo: Partial<ComputeTask>): Promise<string> {
        const taskId = taskInfo.id || this.generateTaskId();

        const task: ComputeTask = {
            id: taskId,
            type: taskInfo.type || 'generic',
            priority: taskInfo.priority || 0,
            requirements: taskInfo.requirements || this.getDefaultRequirements(),
            payload: taskInfo.payload || {},
            dependencies: taskInfo.dependencies || [],
            timeout: taskInfo.timeout || 3600000,
            retries: taskInfo.retries || 3,
            status: 'pending'
        };

        this.tasks.set(taskId, task);
        this.taskQueue.push(task);

        this.logger.info(`Task submitted: ${taskId} (${task.type})`);
        this.emit('taskSubmitted', task);

        return taskId;
    }

    public async cancelTask(taskId: string, reason?: string): Promise<void> {
        const task = this.tasks.get(taskId);
        if (!task) return;

        if (task.status === 'running' && task.assignedNode) {
            // Send cancellation to node
            await this.sendNodeCommand(task.assignedNode, 'cancelTask', { taskId });
            this.runningTasks.delete(taskId);
        }

        task.status = 'cancelled';
        task.error = reason || 'Task cancelled';
        task.endTime = new Date();

        // Remove from queue if pending
        this.taskQueue = this.taskQueue.filter(t => t.id !== taskId);

        this.logger.info(`Task cancelled: ${taskId} - ${reason}`);
        this.emit('taskCancelled', task);
    }

    public getTaskStatus(taskId: string): ComputeTask | null {
        return this.tasks.get(taskId) || null;
    }

    public getTaskHistory(limit: number = 100): ComputeTask[] {
        return Array.from(this.completedTasks.values())
            .concat(Array.from(this.failedTasks.values()))
            .sort((a, b) => (b.endTime?.getTime() || 0) - (a.endTime?.getTime() || 0))
            .slice(0, limit);
    }

    // Cluster Operations
    public async startCluster(): Promise<void> {
        if (this.isRunning) return;

        this.isRunning = true;

        // Start heartbeat monitoring
        this.heartbeatInterval = setInterval(() => {
            this.performHeartbeatCheck();
        }, 30000);

        // Start task scheduler
        this.schedulerInterval = setInterval(() => {
            this.scheduleNextTasks();
        }, 5000);

        // Start metrics collection
        this.metricsInterval = setInterval(() => {
            this.updateMetrics();
        }, 60000);

        this.logger.info('G3D Compute Cluster started');
        this.emit('clusterStarted');
    }

    public async stopCluster(): Promise<void> {
        if (!this.isRunning) return;

        this.isRunning = false;

        // Stop intervals
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.schedulerInterval = null;
        }
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = null;
        }

        // Cancel all running tasks
        const runningTaskIds = Array.from(this.runningTasks.keys());
        for (const taskId of runningTaskIds) {
            await this.cancelTask(taskId, 'Cluster shutdown');
        }

        this.logger.info('G3D Compute Cluster stopped');
        this.emit('clusterStopped');
    }

    // Scheduling and Load Balancing
    private async scheduleNextTasks(): Promise<void> {
        if (this.taskQueue.length === 0) return;

        const availableNodes = Array.from(this.nodes.values())
            .filter(node => node.status === 'online' && this.canAcceptTasks(node));

        if (availableNodes.length === 0) return;

        // Sort tasks by priority
        const prioritizedTasks = this.scheduler.prioritize([...this.taskQueue]);

        for (const task of prioritizedTasks) {
            if (availableNodes.length === 0) break;

            // Check dependencies
            if (!this.areDependenciesMet(task)) continue;

            // Select best node for task
            const selectedNode = this.loadBalancer.selectNode(task, availableNodes);
            if (!selectedNode) continue;

            // Assign task to node
            await this.assignTaskToNode(task, selectedNode);

            // Remove from queue and available nodes
            this.taskQueue = this.taskQueue.filter(t => t.id !== task.id);
            const nodeIndex = availableNodes.findIndex(n => n.id === selectedNode.id);
            if (nodeIndex !== -1) {
                availableNodes.splice(nodeIndex, 1);
            }
        }
    }

    private async assignTaskToNode(task: ComputeTask, node: ComputeNode): Promise<void> {
        task.status = 'assigned';
        task.assignedNode = node.id;
        task.startTime = new Date();

        this.runningTasks.set(task.id, task);
        node.status = 'busy';

        try {
            // Send task to node
            await this.sendNodeCommand(node.id, 'executeTask', {
                taskId: task.id,
                type: task.type,
                payload: task.payload,
                timeout: task.timeout
            });

            task.status = 'running';
            this.logger.info(`Task assigned: ${task.id} -> ${node.id}`);
            this.emit('taskAssigned', { task, node });

        } catch (error) {
            await this.handleTaskFailure(task, error as Error);
        }
    }

    // Node Communication
    private async sendNodeCommand(nodeId: string, command: string, data: any): Promise<any> {
        const node = this.nodes.get(nodeId);
        if (!node) throw new Error(`Node not found: ${nodeId}`);

        // Simulate node communication
        // In real implementation, this would use HTTP/WebSocket/gRPC
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.95) { // 95% success rate
                    resolve({ success: true, data });
                } else {
                    reject(new Error('Node communication failed'));
                }
            }, Math.random() * 1000);
        });
    }

    // Event Handlers
    private handleNodeJoined(node: ComputeNode): void {
        this.updateMetrics();
        this.logger.info(`Node joined cluster: ${node.id}`);
    }

    private handleNodeLeft(node: ComputeNode): void {
        this.updateMetrics();
        this.logger.info(`Node left cluster: ${node.id}`);
    }

    private handleTaskCompleted(task: ComputeTask): void {
        this.runningTasks.delete(task.id);
        this.completedTasks.set(task.id, task);

        // Update node status
        if (task.assignedNode) {
            const node = this.nodes.get(task.assignedNode);
            if (node) {
                node.status = 'online';
            }
        }

        this.updateMetrics();
        this.logger.info(`Task completed: ${task.id}`);
    }

    private async handleTaskFailed(task: ComputeTask): Promise<void> {
        this.runningTasks.delete(task.id);

        // Retry logic
        if (task.retries > 0) {
            task.retries--;
            task.status = 'pending';
            task.assignedNode = undefined;
            this.taskQueue.push(task);

            this.logger.warn(`Task failed, retrying: ${task.id} (${task.retries} retries left)`);
        } else {
            task.status = 'failed';
            task.endTime = new Date();
            this.failedTasks.set(task.id, task);

            this.logger.error(`Task failed permanently: ${task.id}`);
        }

        // Update node status
        if (task.assignedNode) {
            const node = this.nodes.get(task.assignedNode);
            if (node) {
                node.status = 'online';
            }
        }

        this.updateMetrics();
    }

    private handleNodeHealthCheck(node: ComputeNode): void {
        // Update node health metrics
        this.metricsCollector.gauge('cluster_node_cpu_usage', node.resources.cpuUsage, { nodeId: node.id });
        this.metricsCollector.gauge('cluster_node_memory_usage', node.resources.memoryUsage, { nodeId: node.id });
        this.metricsCollector.gauge('cluster_node_gpu_usage', node.resources.gpuUsage, { nodeId: node.id });
    }

    // Health and Monitoring
    private performHeartbeatCheck(): void {
        const now = new Date();
        const timeout = 120000; // 2 minutes

        for (const [nodeId, node] of this.nodes) {
            const timeSinceHeartbeat = now.getTime() - node.lastHeartbeat.getTime();

            if (timeSinceHeartbeat > timeout && node.status !== 'offline') {
                node.status = 'offline';
                this.logger.warn(`Node heartbeat timeout: ${nodeId}`);
                this.emit('nodeTimeout', node);

                // Cancel tasks on offline node
                const nodeTasks = Array.from(this.runningTasks.values())
                    .filter(task => task.assignedNode === nodeId);

                for (const task of nodeTasks) {
                    this.handleTaskFailure(task);
                }
            }
        }
    }

    private updateMetrics(): void {
        const activeNodes = Array.from(this.nodes.values())
            .filter(node => node.status === 'online' || node.status === 'busy');

        this.metrics = {
            totalNodes: this.nodes.size,
            activeNodes: activeNodes.length,
            totalTasks: this.tasks.size,
            runningTasks: this.runningTasks.size,
            completedTasks: this.completedTasks.size,
            failedTasks: this.failedTasks.size,
            averageTaskTime: this.calculateAverageTaskTime(),
            clusterUtilization: this.calculateClusterUtilization(),
            throughput: this.calculateThroughput(),
            errorRate: this.calculateErrorRate()
        };

        // Emit metrics
        this.metricsCollector.gauge('cluster_total_nodes', this.metrics.totalNodes);
        this.metricsCollector.gauge('cluster_active_nodes', this.metrics.activeNodes);
        this.metricsCollector.gauge('cluster_running_tasks', this.metrics.runningTasks);
        this.metricsCollector.gauge('cluster_utilization', this.metrics.clusterUtilization);
        this.metricsCollector.gauge('cluster_throughput', this.metrics.throughput);
        this.metricsCollector.gauge('cluster_error_rate', this.metrics.errorRate);

        this.emit('metricsUpdated', this.metrics);
    }

    // Utility Methods
    private nodeCanHandleTask(node: ComputeNode, task: ComputeTask): boolean {
        const req = task.requirements;
        const cap = node.capabilities;
        const res = node.resources;

        // Check basic requirements
        if (cap.cpu.cores < req.minCpuCores) return false;
        if (cap.memory.available < req.minMemory) return false;
        if (cap.gpu.memory < req.minGpuMemory) return false;

        // Check resource availability
        if (res.cpuUsage > 80) return false;
        if (res.memoryUsage > 80) return false;
        if (res.gpuUsage > 80) return false;

        // Check required capabilities
        for (const capability of req.requiredCapabilities) {
            if (!cap.specialized.includes(capability)) return false;
        }

        return true;
    }

    private calculateNodeScore(node: ComputeNode, task: ComputeTask): number {
        let score = 100;

        // Penalize high resource usage
        score -= node.resources.cpuUsage * 0.5;
        score -= node.resources.memoryUsage * 0.3;
        score -= node.resources.gpuUsage * 0.8;

        // Bonus for excess capabilities
        const req = task.requirements;
        score += Math.min(20, (node.capabilities.cpu.cores - req.minCpuCores) * 2);
        score += Math.min(15, (node.capabilities.memory.available - req.minMemory) / 1000);

        // Preferred node bonus
        if (req.preferredNode === node.id) {
            score += 50;
        }

        return Math.max(0, score);
    }

    private calculateNodeLoad(node: ComputeNode): number {
        const weights = { cpu: 0.4, memory: 0.3, gpu: 0.3 };
        return (
            node.resources.cpuUsage * weights.cpu +
            node.resources.memoryUsage * weights.memory +
            node.resources.gpuUsage * weights.gpu
        );
    }

    private canAcceptTasks(node: ComputeNode): boolean {
        return node.currentLoad < 80 && node.status === 'online';
    }

    private areDependenciesMet(task: ComputeTask): boolean {
        for (const depId of task.dependencies) {
            const depTask = this.tasks.get(depId);
            if (!depTask || depTask.status !== 'completed') {
                return false;
            }
        }
        return true;
    }

    private async handleTaskFailure(task: ComputeTask, error?: Error): Promise<void> {
        task.error = error?.message || 'Task execution failed';
        await this.handleTaskFailed(task);
    }

    private calculateAverageTaskTime(): number {
        const completed = Array.from(this.completedTasks.values());
        if (completed.length === 0) return 0;

        const totalTime = completed.reduce((sum, task) => {
            if (task.startTime && task.endTime) {
                return sum + (task.endTime.getTime() - task.startTime.getTime());
            }
            return sum;
        }, 0);

        return totalTime / completed.length;
    }

    private calculateClusterUtilization(): number {
        const activeNodes = Array.from(this.nodes.values())
            .filter(node => node.status === 'online' || node.status === 'busy');

        if (activeNodes.length === 0) return 0;

        const totalLoad = activeNodes.reduce((sum, node) => sum + node.currentLoad, 0);
        return totalLoad / activeNodes.length;
    }

    private calculateThroughput(): number {
        const lastHour = new Date(Date.now() - 3600000);
        const recentTasks = Array.from(this.completedTasks.values())
            .filter(task => task.endTime && task.endTime > lastHour);

        return recentTasks.length;
    }

    private calculateErrorRate(): number {
        const total = this.completedTasks.size + this.failedTasks.size;
        if (total === 0) return 0;
        return (this.failedTasks.size / total) * 100;
    }

    private generateNodeId(): string {
        return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateTaskId(): string {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private getDefaultCapabilities(): NodeCapabilities {
        return {
            gpu: { count: 1, memory: 8192, compute: '7.5', architecture: 'cuda' },
            cpu: { cores: 8, threads: 16, frequency: 3200, architecture: 'x64' },
            memory: { total: 32768, available: 24576 },
            storage: { total: 1000000, available: 800000, type: 'ssd' },
            network: { bandwidth: 1000, latency: 10 },
            specialized: ['annotation', 'ml', 'vision']
        };
    }

    private getDefaultResources(): NodeResources {
        return {
            cpuUsage: 20,
            memoryUsage: 30,
            gpuUsage: 10,
            storageUsage: 40,
            networkUsage: 15,
            temperature: 65,
            powerConsumption: 200
        };
    }

    private getDefaultRequirements(): TaskRequirements {
        return {
            minCpuCores: 2,
            minMemory: 4096,
            minGpuMemory: 2048,
            requiredCapabilities: [],
            exclusiveAccess: false,
            estimatedDuration: 300000
        };
    }

    // Public API
    public getClusterStatus(): {
        isRunning: boolean;
        metrics: ClusterMetrics;
        nodes: ComputeNode[];
        queueLength: number;
    } {
        return {
            isRunning: this.isRunning,
            metrics: this.metrics,
            nodes: Array.from(this.nodes.values()),
            queueLength: this.taskQueue.length
        };
    }

    public getNodeDetails(nodeId: string): ComputeNode | null {
        return this.nodes.get(nodeId) || null;
    }

    public async scaleCluster(targetNodes: number): Promise<void> {
        const currentNodes = this.metrics.activeNodes;

        if (targetNodes > currentNodes) {
            // Scale up - would typically integrate with cloud providers
            this.logger.info(`Scaling up cluster: ${currentNodes} -> ${targetNodes}`);
            this.emit('scaleUp', { current: currentNodes, target: targetNodes });
        } else if (targetNodes < currentNodes) {
            // Scale down - gracefully remove nodes
            this.logger.info(`Scaling down cluster: ${currentNodes} -> ${targetNodes}`);
            this.emit('scaleDown', { current: currentNodes, target: targetNodes });
        }
    }

    public async drainNode(nodeId: string): Promise<void> {
        const node = this.nodes.get(nodeId);
        if (!node) return;

        node.status = 'maintenance';

        // Wait for running tasks to complete
        const nodeTasks = Array.from(this.runningTasks.values())
            .filter(task => task.assignedNode === nodeId);

        await Promise.all(nodeTasks.map(task =>
            new Promise<void>(resolve => {
                const checkCompletion = () => {
                    if (!this.runningTasks.has(task.id)) {
                        resolve();
                    } else {
                        setTimeout(checkCompletion, 1000);
                    }
                };
                checkCompletion();
            })
        ));

        this.logger.info(`Node drained: ${nodeId}`);
        this.emit('nodeDrained', node);
    }
}