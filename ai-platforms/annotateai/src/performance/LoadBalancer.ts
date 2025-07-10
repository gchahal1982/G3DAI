/**
 * G3D Load Balancer - Intelligent Compute Load Distribution
 * 
 * Advanced load balancing system for distributed annotation processing
 * with intelligent resource allocation, auto-scaling, and failover.
 * 
 * Features:
 * - Dynamic load distribution algorithms
 * - Real-time resource monitoring
 * - Auto-scaling based on demand
 * - Health checking and failover
 * - Geographic load balancing
 * - Cost optimization
 * - Performance analytics
 * - Multi-cloud support
 * 
 * Part of G3D AnnotateAI MVP - Performance & Compute Phase 0.4
 * Ensures optimal resource utilization across distributed infrastructure
 */

import { EventEmitter } from 'events';

// Core load balancing interfaces
export interface ComputeNode {
    id: string;
    name: string;
    endpoint: string;
    region: string;
    zone: string;
    capacity: NodeCapacity;
    currentLoad: NodeLoad;
    health: NodeHealth;
    cost: NodeCost;
    tags: Map<string, string>;
    lastUpdated: number;
}

export interface NodeCapacity {
    cpu: number; // cores
    memory: number; // GB
    gpu: number; // count
    storage: number; // GB
    network: number; // Mbps
}

export interface NodeLoad {
    cpu: number; // 0-1
    memory: number; // 0-1
    gpu: number; // 0-1
    storage: number; // 0-1
    network: number; // 0-1
    activeJobs: number;
    queuedJobs: number;
}

export interface NodeHealth {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
    uptime: number; // seconds
    responseTime: number; // ms
    errorRate: number; // 0-1
    lastHealthCheck: number;
    issues: string[];
}

export interface NodeCost {
    hourlyRate: number; // USD per hour
    computeRate: number; // USD per compute unit
    storageRate: number; // USD per GB-hour
    networkRate: number; // USD per GB transferred
    spotPrice?: number; // USD per hour for spot instances
}

export interface LoadBalancingJob {
    id: string;
    type: string;
    priority: JobPriority;
    requirements: JobRequirements;
    constraints: JobConstraints;
    estimatedDuration: number; // seconds
    deadline?: number; // timestamp
    retryCount: number;
    maxRetries: number;
}

export interface JobRequirements {
    cpu: number;
    memory: number;
    gpu: number;
    storage: number;
    network: number;
    region?: string;
    zone?: string;
}

export interface JobConstraints {
    allowedNodes?: string[];
    blockedNodes?: string[];
    requiresGPU?: boolean;
    maxLatency?: number; // ms
    costLimit?: number; // USD
    spotInstancesAllowed?: boolean;
}

export enum JobPriority {
    LOW = 1,
    NORMAL = 2,
    HIGH = 3,
    CRITICAL = 4
}

export enum LoadBalancingAlgorithm {
    ROUND_ROBIN = 'round_robin',
    LEAST_CONNECTIONS = 'least_connections',
    WEIGHTED_ROUND_ROBIN = 'weighted_round_robin',
    LEAST_RESPONSE_TIME = 'least_response_time',
    RESOURCE_BASED = 'resource_based',
    COST_OPTIMIZED = 'cost_optimized',
    GEOGRAPHIC = 'geographic'
}

export interface LoadBalancerConfig {
    algorithm: LoadBalancingAlgorithm;
    healthCheckInterval: number; // ms
    maxUnhealthyNodes: number;
    autoScaling: {
        enabled: boolean;
        minNodes: number;
        maxNodes: number;
        scaleUpThreshold: number; // 0-1
        scaleDownThreshold: number; // 0-1
        cooldownPeriod: number; // ms
    };
    costOptimization: {
        enabled: boolean;
        maxHourlyCost: number;
        preferSpotInstances: boolean;
        costVsPerformanceRatio: number; // 0-1
    };
}

/**
 * Intelligent Load Balancer
 * Distributes compute workloads across available nodes
 */
export class LoadBalancer extends EventEmitter {
    private nodes: Map<string, ComputeNode> = new Map();
    private jobQueue: LoadBalancingJob[] = [];
    private runningJobs: Map<string, { job: LoadBalancingJob; nodeId: string }> = new Map();
    private completedJobs: Map<string, { job: LoadBalancingJob; nodeId: string; duration: number }> = new Map();

    private config: LoadBalancerConfig;
    private currentAlgorithm: LoadBalancingAlgorithm;
    private roundRobinIndex = 0;
    private lastScalingAction = 0;

    // Performance tracking
    private metrics = {
        totalJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        averageResponseTime: 0,
        totalCost: 0,
        resourceUtilization: {
            cpu: 0,
            memory: 0,
            gpu: 0,
            storage: 0,
            network: 0
        }
    };

    constructor(config: Partial<LoadBalancerConfig> = {}) {
        super();

        this.config = {
            algorithm: LoadBalancingAlgorithm.RESOURCE_BASED,
            healthCheckInterval: 30000, // 30 seconds
            maxUnhealthyNodes: 2,
            autoScaling: {
                enabled: true,
                minNodes: 2,
                maxNodes: 20,
                scaleUpThreshold: 0.8,
                scaleDownThreshold: 0.2,
                cooldownPeriod: 300000 // 5 minutes
            },
            costOptimization: {
                enabled: true,
                maxHourlyCost: 100,
                preferSpotInstances: true,
                costVsPerformanceRatio: 0.7
            },
            ...config
        };

        this.currentAlgorithm = this.config.algorithm;
        this.startHealthChecking();
        this.startJobProcessor();
        this.startAutoScaler();
    }

    /**
     * Register a compute node
     */
    public registerNode(node: ComputeNode): void {
        this.nodes.set(node.id, node);
        this.emit('nodeRegistered', node.id);
        this.updateResourceUtilization();
    }

    /**
     * Unregister a compute node
     */
    public unregisterNode(nodeId: string): void {
        // Reassign jobs from this node
        this.reassignJobsFromNode(nodeId);
        this.nodes.delete(nodeId);
        this.emit('nodeUnregistered', nodeId);
        this.updateResourceUtilization();
    }

    /**
     * Submit a job for load balancing
     */
    public async submitJob(job: LoadBalancingJob): Promise<string> {
        // Validate job
        this.validateJob(job);

        // Add to queue with priority ordering
        this.jobQueue.push(job);
        this.jobQueue.sort((a, b) => b.priority - a.priority);

        this.emit('jobSubmitted', job.id);
        this.processJobQueue();

        return job.id;
    }

    /**
     * Select the best node for a job
     */
    public selectNode(job: LoadBalancingJob): ComputeNode | null {
        const availableNodes = this.getAvailableNodes(job);

        if (availableNodes.length === 0) {
            return null;
        }

        switch (this.currentAlgorithm) {
            case LoadBalancingAlgorithm.ROUND_ROBIN:
                return this.selectRoundRobin(availableNodes);

            case LoadBalancingAlgorithm.LEAST_CONNECTIONS:
                return this.selectLeastConnections(availableNodes);

            case LoadBalancingAlgorithm.WEIGHTED_ROUND_ROBIN:
                return this.selectWeightedRoundRobin(availableNodes);

            case LoadBalancingAlgorithm.LEAST_RESPONSE_TIME:
                return this.selectLeastResponseTime(availableNodes);

            case LoadBalancingAlgorithm.RESOURCE_BASED:
                return this.selectResourceBased(availableNodes, job);

            case LoadBalancingAlgorithm.COST_OPTIMIZED:
                return this.selectCostOptimized(availableNodes, job);

            case LoadBalancingAlgorithm.GEOGRAPHIC:
                return this.selectGeographic(availableNodes, job);

            default:
                return this.selectResourceBased(availableNodes, job);
        }
    }

    /**
     * Get available nodes that can handle the job
     */
    private getAvailableNodes(job: LoadBalancingJob): ComputeNode[] {
        const available: ComputeNode[] = [];

        for (const node of this.nodes.values()) {
            if (this.canNodeHandleJob(node, job)) {
                available.push(node);
            }
        }

        return available;
    }

    /**
     * Check if a node can handle a specific job
     */
    private canNodeHandleJob(node: ComputeNode, job: LoadBalancingJob): boolean {
        // Health check
        if (node.health.status !== 'healthy' && node.health.status !== 'degraded') {
            return false;
        }

        // Resource requirements
        const availableResources = this.getAvailableResources(node);
        if (availableResources.cpu < job.requirements.cpu ||
            availableResources.memory < job.requirements.memory ||
            availableResources.gpu < job.requirements.gpu ||
            availableResources.storage < job.requirements.storage) {
            return false;
        }

        // Constraints
        if (job.constraints.allowedNodes &&
            !job.constraints.allowedNodes.includes(node.id)) {
            return false;
        }

        if (job.constraints.blockedNodes &&
            job.constraints.blockedNodes.includes(node.id)) {
            return false;
        }

        if (job.constraints.requiresGPU && node.capacity.gpu === 0) {
            return false;
        }

        if (job.requirements.region && node.region !== job.requirements.region) {
            return false;
        }

        if (job.requirements.zone && node.zone !== job.requirements.zone) {
            return false;
        }

        if (job.constraints.maxLatency &&
            node.health.responseTime > job.constraints.maxLatency) {
            return false;
        }

        // Cost constraints
        if (job.constraints.costLimit) {
            const estimatedCost = this.estimateJobCost(node, job);
            if (estimatedCost > job.constraints.costLimit) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get available resources on a node
     */
    private getAvailableResources(node: ComputeNode): NodeCapacity {
        return {
            cpu: node.capacity.cpu * (1 - node.currentLoad.cpu),
            memory: node.capacity.memory * (1 - node.currentLoad.memory),
            gpu: node.capacity.gpu * (1 - node.currentLoad.gpu),
            storage: node.capacity.storage * (1 - node.currentLoad.storage),
            network: node.capacity.network * (1 - node.currentLoad.network)
        };
    }

    /**
     * Round robin selection
     */
    private selectRoundRobin(nodes: ComputeNode[]): ComputeNode {
        const node = nodes[this.roundRobinIndex % nodes.length];
        this.roundRobinIndex++;
        return node;
    }

    /**
     * Least connections selection
     */
    private selectLeastConnections(nodes: ComputeNode[]): ComputeNode {
        return nodes.reduce((best, current) =>
            current.currentLoad.activeJobs < best.currentLoad.activeJobs ? current : best
        );
    }

    /**
     * Weighted round robin selection
     */
    private selectWeightedRoundRobin(nodes: ComputeNode[]): ComputeNode {
        // Weight based on available capacity
        const weights = nodes.map(node => {
            const available = this.getAvailableResources(node);
            return available.cpu + available.memory + available.gpu;
        });

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < nodes.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return nodes[i];
            }
        }

        return nodes[0];
    }

    /**
     * Least response time selection
     */
    private selectLeastResponseTime(nodes: ComputeNode[]): ComputeNode {
        return nodes.reduce((best, current) =>
            current.health.responseTime < best.health.responseTime ? current : best
        );
    }

    /**
     * Resource-based selection
     */
    private selectResourceBased(nodes: ComputeNode[], job: LoadBalancingJob): ComputeNode {
        let bestNode = nodes[0];
        let bestScore = -1;

        for (const node of nodes) {
            const score = this.calculateResourceScore(node, job);
            if (score > bestScore) {
                bestScore = score;
                bestNode = node;
            }
        }

        return bestNode;
    }

    /**
     * Calculate resource utilization score
     */
    private calculateResourceScore(node: ComputeNode, job: LoadBalancingJob): number {
        const available = this.getAvailableResources(node);

        // Score based on how well resources match requirements
        const cpuScore = Math.min(available.cpu / job.requirements.cpu, 1);
        const memoryScore = Math.min(available.memory / job.requirements.memory, 1);
        const gpuScore = job.requirements.gpu > 0 ?
            Math.min(available.gpu / job.requirements.gpu, 1) : 1;

        // Penalty for over-provisioning
        const overProvisionPenalty = 1 - Math.max(0,
            (available.cpu / job.requirements.cpu - 1) * 0.1);

        // Health factor
        const healthFactor = node.health.status === 'healthy' ? 1 : 0.5;

        return (cpuScore + memoryScore + gpuScore) / 3 * overProvisionPenalty * healthFactor;
    }

    /**
     * Cost-optimized selection
     */
    private selectCostOptimized(nodes: ComputeNode[], job: LoadBalancingJob): ComputeNode {
        let bestNode = nodes[0];
        let bestCostEfficiency = 0;

        for (const node of nodes) {
            const cost = this.estimateJobCost(node, job);
            const performance = this.estimateJobPerformance(node, job);
            const efficiency = performance / cost;

            if (efficiency > bestCostEfficiency) {
                bestCostEfficiency = efficiency;
                bestNode = node;
            }
        }

        return bestNode;
    }

    /**
     * Geographic selection (closest to user/data)
     */
    private selectGeographic(nodes: ComputeNode[], job: LoadBalancingJob): ComputeNode {
        // For now, prefer nodes in the same region
        const preferredRegion = job.requirements.region;

        if (preferredRegion) {
            const sameRegionNodes = nodes.filter(node => node.region === preferredRegion);
            if (sameRegionNodes.length > 0) {
                return this.selectResourceBased(sameRegionNodes, job);
            }
        }

        return this.selectResourceBased(nodes, job);
    }

    /**
     * Estimate job cost on a node
     */
    private estimateJobCost(node: ComputeNode, job: LoadBalancingJob): number {
        const durationHours = job.estimatedDuration / 3600;

        let cost = 0;

        // Compute cost
        cost += node.cost.computeRate * job.requirements.cpu * durationHours;

        // Memory cost (if separate)
        cost += node.cost.computeRate * job.requirements.memory * 0.1 * durationHours;

        // Storage cost
        cost += node.cost.storageRate * job.requirements.storage * durationHours;

        // Use spot pricing if available and allowed
        if (node.cost.spotPrice && job.constraints.spotInstancesAllowed) {
            cost *= 0.3; // Spot instances are typically 70% cheaper
        }

        return cost;
    }

    /**
     * Estimate job performance on a node
     */
    private estimateJobPerformance(node: ComputeNode, job: LoadBalancingJob): number {
        const available = this.getAvailableResources(node);

        // Simple performance model based on resource availability
        const cpuPerf = Math.min(available.cpu / job.requirements.cpu, 2);
        const memoryPerf = Math.min(available.memory / job.requirements.memory, 2);
        const gpuPerf = job.requirements.gpu > 0 ?
            Math.min(available.gpu / job.requirements.gpu, 2) : 1;

        return (cpuPerf + memoryPerf + gpuPerf) / 3;
    }

    /**
     * Start health checking loop
     */
    private startHealthChecking(): void {
        setInterval(() => {
            this.performHealthChecks();
        }, this.config.healthCheckInterval);
    }

    /**
     * Perform health checks on all nodes
     */
    private async performHealthChecks(): Promise<void> {
        const healthPromises = Array.from(this.nodes.values()).map(node =>
            this.checkNodeHealth(node)
        );

        await Promise.allSettled(healthPromises);
        this.handleUnhealthyNodes();
    }

    /**
     * Check health of a single node
     */
    private async checkNodeHealth(node: ComputeNode): Promise<void> {
        const startTime = Date.now();

        try {
            // Simulate health check (in real implementation, this would be HTTP request)
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

            const responseTime = Date.now() - startTime;

            node.health.responseTime = responseTime;
            node.health.lastHealthCheck = Date.now();

            if (responseTime > 5000) {
                node.health.status = 'degraded';
            } else {
                node.health.status = 'healthy';
            }

        } catch (error) {
            node.health.status = 'unhealthy';
            node.health.issues.push(`Health check failed: ${error}`);
            this.emit('nodeUnhealthy', node.id, error);
        }
    }

    /**
     * Handle unhealthy nodes
     */
    private handleUnhealthyNodes(): void {
        const unhealthyNodes = Array.from(this.nodes.values())
            .filter(node => node.health.status === 'unhealthy' || node.health.status === 'offline');

        if (unhealthyNodes.length > this.config.maxUnhealthyNodes) {
            this.emit('criticalHealthIssue', unhealthyNodes.map(n => n.id));

            // Trigger emergency scaling
            this.triggerEmergencyScaling();
        }

        // Reassign jobs from unhealthy nodes
        for (const node of unhealthyNodes) {
            this.reassignJobsFromNode(node.id);
        }
    }

    /**
     * Start job processing loop
     */
    private startJobProcessor(): void {
        setInterval(() => {
            this.processJobQueue();
        }, 1000);
    }

    /**
     * Process pending jobs
     */
    private async processJobQueue(): Promise<void> {
        while (this.jobQueue.length > 0) {
            const job = this.jobQueue[0];
            const selectedNode = this.selectNode(job);

            if (selectedNode) {
                // Remove from queue and assign to node
                this.jobQueue.shift();
                await this.assignJobToNode(job, selectedNode);
            } else {
                // No available nodes, trigger scaling if enabled
                if (this.config.autoScaling.enabled) {
                    this.triggerScaleUp();
                }
                break;
            }
        }
    }

    /**
     * Assign job to a specific node
     */
    private async assignJobToNode(job: LoadBalancingJob, node: ComputeNode): Promise<void> {
        try {
            // Update node load
            this.updateNodeLoad(node, job, 'add');

            // Track running job
            this.runningJobs.set(job.id, { job, nodeId: node.id });

            // Simulate job execution (in real implementation, this would be API call)
            setTimeout(() => {
                this.completeJob(job.id, true);
            }, job.estimatedDuration * 1000);

            this.emit('jobAssigned', job.id, node.id);

        } catch (error) {
            this.emit('jobFailed', job.id, node.id, error);
            this.handleJobFailure(job);
        }
    }

    /**
     * Complete a job
     */
    private completeJob(jobId: string, success: boolean): void {
        const runningJob = this.runningJobs.get(jobId);
        if (!runningJob) return;

        const { job, nodeId } = runningJob;
        const node = this.nodes.get(nodeId);

        if (node) {
            this.updateNodeLoad(node, job, 'remove');
        }

        this.runningJobs.delete(jobId);

        if (success) {
            this.completedJobs.set(jobId, {
                job,
                nodeId,
                duration: job.estimatedDuration
            });
            this.metrics.completedJobs++;
            this.emit('jobCompleted', jobId, nodeId);
        } else {
            this.handleJobFailure(job);
        }

        this.updateMetrics();
    }

    /**
     * Handle job failure
     */
    private handleJobFailure(job: LoadBalancingJob): void {
        job.retryCount++;

        if (job.retryCount < job.maxRetries) {
            // Retry with higher priority
            job.priority = Math.min(job.priority + 1, JobPriority.CRITICAL);
            this.jobQueue.unshift(job);
            this.emit('jobRetry', job.id, job.retryCount);
        } else {
            this.metrics.failedJobs++;
            this.emit('jobFailed', job.id, 'max_retries_exceeded');
        }
    }

    /**
     * Update node load when job is added/removed
     */
    private updateNodeLoad(node: ComputeNode, job: LoadBalancingJob, action: 'add' | 'remove'): void {
        const multiplier = action === 'add' ? 1 : -1;

        node.currentLoad.cpu += (job.requirements.cpu / node.capacity.cpu) * multiplier;
        node.currentLoad.memory += (job.requirements.memory / node.capacity.memory) * multiplier;
        node.currentLoad.gpu += (job.requirements.gpu / node.capacity.gpu) * multiplier;
        node.currentLoad.storage += (job.requirements.storage / node.capacity.storage) * multiplier;

        if (action === 'add') {
            node.currentLoad.activeJobs++;
        } else {
            node.currentLoad.activeJobs--;
        }

        // Clamp values
        node.currentLoad.cpu = Math.max(0, Math.min(1, node.currentLoad.cpu));
        node.currentLoad.memory = Math.max(0, Math.min(1, node.currentLoad.memory));
        node.currentLoad.gpu = Math.max(0, Math.min(1, node.currentLoad.gpu));
        node.currentLoad.storage = Math.max(0, Math.min(1, node.currentLoad.storage));
        node.currentLoad.activeJobs = Math.max(0, node.currentLoad.activeJobs);
    }

    /**
     * Start auto-scaling loop
     */
    private startAutoScaler(): void {
        if (!this.config.autoScaling.enabled) return;

        setInterval(() => {
            this.evaluateScaling();
        }, 60000); // Check every minute
    }

    /**
     * Evaluate if scaling is needed
     */
    private evaluateScaling(): void {
        const now = Date.now();

        // Check cooldown period
        if (now - this.lastScalingAction < this.config.autoScaling.cooldownPeriod) {
            return;
        }

        const healthyNodes = Array.from(this.nodes.values())
            .filter(node => node.health.status === 'healthy');

        const averageLoad = this.calculateAverageLoad(healthyNodes);
        const queuedJobs = this.jobQueue.length;

        // Scale up conditions
        if ((averageLoad > this.config.autoScaling.scaleUpThreshold || queuedJobs > 10) &&
            healthyNodes.length < this.config.autoScaling.maxNodes) {
            this.triggerScaleUp();
        }

        // Scale down conditions
        else if (averageLoad < this.config.autoScaling.scaleDownThreshold &&
            queuedJobs === 0 &&
            healthyNodes.length > this.config.autoScaling.minNodes) {
            this.triggerScaleDown();
        }
    }

    /**
     * Calculate average load across nodes
     */
    private calculateAverageLoad(nodes: ComputeNode[]): number {
        if (nodes.length === 0) return 0;

        const totalLoad = nodes.reduce((sum, node) => {
            return sum + (node.currentLoad.cpu + node.currentLoad.memory + node.currentLoad.gpu) / 3;
        }, 0);

        return totalLoad / nodes.length;
    }

    /**
     * Trigger scale up
     */
    private triggerScaleUp(): void {
        this.lastScalingAction = Date.now();
        this.emit('scaleUp', this.nodes.size);

        // In real implementation, this would provision new compute instances
        console.log('Triggering scale up...');
    }

    /**
     * Trigger scale down
     */
    private triggerScaleDown(): void {
        this.lastScalingAction = Date.now();

        // Find least utilized node
        const healthyNodes = Array.from(this.nodes.values())
            .filter(node => node.health.status === 'healthy')
            .sort((a, b) => a.currentLoad.activeJobs - b.currentLoad.activeJobs);

        if (healthyNodes.length > 0) {
            const nodeToRemove = healthyNodes[0];
            this.emit('scaleDown', nodeToRemove.id);

            // In real implementation, this would terminate the instance
            console.log(`Triggering scale down for node ${nodeToRemove.id}...`);
        }
    }

    /**
     * Trigger emergency scaling
     */
    private triggerEmergencyScaling(): void {
        this.emit('emergencyScaling', this.nodes.size);

        // Immediately provision emergency capacity
        console.log('Triggering emergency scaling...');
    }

    /**
     * Reassign jobs from a specific node
     */
    private reassignJobsFromNode(nodeId: string): void {
        const jobsToReassign: LoadBalancingJob[] = [];

        for (const [jobId, { job, nodeId: assignedNodeId }] of this.runningJobs) {
            if (assignedNodeId === nodeId) {
                jobsToReassign.push(job);
                this.runningJobs.delete(jobId);
            }
        }

        // Add jobs back to queue with higher priority
        for (const job of jobsToReassign) {
            job.priority = Math.min(job.priority + 1, JobPriority.CRITICAL);
            this.jobQueue.unshift(job);
        }

        if (jobsToReassign.length > 0) {
            this.emit('jobsReassigned', nodeId, jobsToReassign.length);
        }
    }

    /**
     * Validate job requirements
     */
    private validateJob(job: LoadBalancingJob): void {
        if (job.requirements.cpu <= 0 || job.requirements.memory <= 0) {
            throw new Error('Invalid job requirements');
        }

        if (job.estimatedDuration <= 0) {
            throw new Error('Invalid estimated duration');
        }

        if (job.deadline && job.deadline < Date.now()) {
            throw new Error('Job deadline has already passed');
        }
    }

    /**
     * Update resource utilization metrics
     */
    private updateResourceUtilization(): void {
        const nodes = Array.from(this.nodes.values());

        if (nodes.length === 0) {
            this.metrics.resourceUtilization = {
                cpu: 0, memory: 0, gpu: 0, storage: 0, network: 0
            };
            return;
        }

        const totalLoad = nodes.reduce((acc, node) => ({
            cpu: acc.cpu + node.currentLoad.cpu,
            memory: acc.memory + node.currentLoad.memory,
            gpu: acc.gpu + node.currentLoad.gpu,
            storage: acc.storage + node.currentLoad.storage,
            network: acc.network + node.currentLoad.network
        }), { cpu: 0, memory: 0, gpu: 0, storage: 0, network: 0 });

        this.metrics.resourceUtilization = {
            cpu: totalLoad.cpu / nodes.length,
            memory: totalLoad.memory / nodes.length,
            gpu: totalLoad.gpu / nodes.length,
            storage: totalLoad.storage / nodes.length,
            network: totalLoad.network / nodes.length
        };
    }

    /**
     * Update performance metrics
     */
    private updateMetrics(): void {
        this.metrics.totalJobs = this.metrics.completedJobs + this.metrics.failedJobs;

        // Calculate average response time
        const completedJobs = Array.from(this.completedJobs.values());
        if (completedJobs.length > 0) {
            const totalTime = completedJobs.reduce((sum, job) => sum + job.duration, 0);
            this.metrics.averageResponseTime = totalTime / completedJobs.length;
        }

        this.updateResourceUtilization();
    }

    /**
     * Get load balancer statistics
     */
    public getStats(): {
        nodes: number;
        healthyNodes: number;
        queuedJobs: number;
        runningJobs: number;
        metrics: typeof this.metrics;
        algorithm: LoadBalancingAlgorithm;
    } {
        const healthyNodes = Array.from(this.nodes.values())
            .filter(node => node.health.status === 'healthy').length;

        return {
            nodes: this.nodes.size,
            healthyNodes,
            queuedJobs: this.jobQueue.length,
            runningJobs: this.runningJobs.size,
            metrics: this.metrics,
            algorithm: this.currentAlgorithm
        };
    }

    /**
     * Change load balancing algorithm
     */
    public setAlgorithm(algorithm: LoadBalancingAlgorithm): void {
        this.currentAlgorithm = algorithm;
        this.emit('algorithmChanged', algorithm);
    }

    /**
     * Cleanup resources
     */
    public dispose(): void {
        this.nodes.clear();
        this.jobQueue.length = 0;
        this.runningJobs.clear();
        this.completedJobs.clear();
        this.removeAllListeners();
    }
}

export default LoadBalancer;