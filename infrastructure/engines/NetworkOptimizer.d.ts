import { EventEmitter } from 'events';
interface NetworkNode {
    id: string;
    hostname: string;
    ip: string;
    port: number;
    region: string;
    status: 'online' | 'offline' | 'degraded' | 'maintenance';
    capabilities: NodeCapabilities;
    metrics: NodeMetrics;
    connections: Map<string, Connection>;
    lastSeen: Date;
    metadata: Record<string, any>;
}
interface NodeCapabilities {
    maxBandwidth: number;
    maxConnections: number;
    protocols: string[];
    compression: string[];
    encryption: string[];
    features: string[];
}
interface NodeMetrics {
    latency: number;
    bandwidth: number;
    packetLoss: number;
    jitter: number;
    throughput: number;
    errorRate: number;
    uptime: number;
    loadAverage: number;
}
interface Connection {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    protocol: string;
    status: 'active' | 'idle' | 'closed' | 'error';
    bandwidth: number;
    latency: number;
    quality: number;
    createdAt: Date;
    lastActivity: Date;
    bytesTransferred: number;
    packetsTransferred: number;
    errors: number;
    metadata: Record<string, any>;
}
interface TopologyMetrics {
    totalNodes: number;
    activeConnections: number;
    averageLatency: number;
    totalBandwidth: number;
    packetLoss: number;
    networkEfficiency: number;
    congestionLevel: number;
}
interface QoSPolicy {
    name: string;
    priority: number;
    maxBandwidth: number;
    maxLatency: number;
    guaranteedBandwidth: number;
    trafficShaping: boolean;
    compressionEnabled: boolean;
    encryptionRequired: boolean;
}
export declare class NetworkOptimizer extends EventEmitter {
    private topology;
    private qosPolicies;
    private loadBalancer;
    private routingAlgorithm;
    private packetQueue;
    private activeTransfers;
    private routingTable;
    private optimizationInterval;
    private metricsInterval;
    private topologyUpdateInterval;
    private isRunning;
    private compressionEnabled;
    private encryptionEnabled;
    private adaptiveQoS;
    constructor();
    private initializeNetworkOptimizer;
    private setupEventHandlers;
    private setupTopology;
    private setupLoadBalancer;
    private setupRoutingAlgorithm;
    private setupQoSPolicies;
    registerNode(nodeInfo: Partial<NetworkNode>): string;
    unregisterNode(nodeId: string): void;
    establishConnection(sourceNodeId: string, targetNodeId: string, protocol?: string): string | null;
    closeConnection(connectionId: string): void;
    sendData(sourceNodeId: string, targetNodeId: string, data: any, options?: {
        priority?: number;
        qosPolicy?: string;
        compression?: boolean;
        encryption?: boolean;
    }): string | null;
    startOptimization(): void;
    stopOptimization(): void;
    private processPacketQueue;
    private transferPacket;
    private optimizeRoutes;
    private balanceLoad;
    private handleNodeJoined;
    private handleNodeLeft;
    private handleConnectionEstablished;
    private handleConnectionLost;
    private handleCongestionDetected;
    private handleQualityDegraded;
    private calculateLatency;
    private calculateTransferTime;
    private processData;
    private compressData;
    private encryptData;
    private applyQoSPolicy;
    private updateConnectionMetrics;
    private handleTransferError;
    private updateNodeMetrics;
    private updateTopologyMetrics;
    private calculateNetworkEfficiency;
    private calculateCongestionLevel;
    private estimateDataSize;
    private formatBytes;
    private updateTopology;
    private cleanupStaleRoutes;
    private detectCongestion;
    private discoverConnections;
    private redistributeConnections;
    private updateRoutingTable;
    private reroute;
    private applyCongestionControl;
    private optimizeConnection;
    private findNodeCluster;
    private redistributeLoad;
    private generateNodeId;
    private generateConnectionId;
    private generatePacketId;
    private generateRouteId;
    private getDefaultCapabilities;
    private getDefaultMetrics;
    getNetworkStatus(): {
        topology: TopologyMetrics;
        nodes: number;
        connections: number;
        activeTransfers: number;
        queueLength: number;
    };
    getNodeDetails(nodeId: string): NetworkNode | null;
    getConnectionDetails(connectionId: string): Connection | null;
    createCluster(name: string, region: string, nodeIds: string[]): string;
    setQoSPolicy(policyName: string, policy: QoSPolicy): void;
}
export {};
//# sourceMappingURL=NetworkOptimizer.d.ts.map