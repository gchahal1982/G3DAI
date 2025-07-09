'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    RealTimeMetrics,
    Anomaly,
    DataFlowNode,
    DataFlowEdge,
    NodeMetrics,
    EdgeMetrics,
    ThroughputMetrics,
    LatencyMetrics,
    QualityIssue
} from '@/types/dataforge.types';
import { DataProcessingEngine } from '@/services/DataProcessingEngine';

// Placeholder for DataFlowVisualization component
const DataFlowVisualization = ({ nodes, edges, metrics, glassmorphism }: any) => (
    <div className="w-full h-full flex items-center justify-center">
        <div className="text-white/60">Data Flow Visualization</div>
    </div>
);

// Icons
const AlertIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

// Styled components
const DashboardContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="backdrop-blur-3xl">
            {children}
        </div>
    </div>
);

const DashboardHeader = ({ children }: { children: React.ReactNode }) => (
    <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            {children}
        </div>
    </header>
);

const MetricsGrid = ({ children }: { children: React.ReactNode }) => (
    <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {children}
        </div>
    </div>
);

interface MetricCardProps {
    title: string;
    value: string | number | undefined;
    trend?: number;
    status?: 'good' | 'warning' | 'critical';
    glassmorphism: {
        background: string;
        border?: string;
    };
    children?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    trend,
    status,
    glassmorphism,
    children
}) => (
    <div
        className="rounded-xl p-6 transition-all"
        style={{
            background: glassmorphism.background,
            border: glassmorphism.border || '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
        }}
    >
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-white/80">{title}</h3>
            {status && (
                <StatusIndicator status={status} />
            )}
        </div>

        <div className="mb-4">
            <div className="text-3xl font-bold text-white">
                {value ?? 'N/A'}
            </div>
            {trend !== undefined && (
                <div className={`text-sm mt-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </div>
            )}
        </div>

        {children}
    </div>
);

const StatusIndicator = ({ status }: { status: 'good' | 'warning' | 'critical' }) => {
    const colors = {
        good: 'bg-green-500',
        warning: 'bg-yellow-500',
        critical: 'bg-red-500'
    };

    return (
        <div className={`w-3 h-3 rounded-full ${colors[status]} animate-pulse`} />
    );
};

const VisualizationArea = ({ children }: { children: React.ReactNode }) => (
    <div className="container mx-auto px-4 py-6">
        <div
            className="rounded-xl p-6 h-96"
            style={{
                background: 'rgba(30, 30, 40, 0.60)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
        >
            {children}
        </div>
    </div>
);

const AnomalyPanel = ({ children }: { children: React.ReactNode }) => (
    <div className="container mx-auto px-4 py-6">
        <div
            className="rounded-xl p-6"
            style={{
                background: 'rgba(25, 25, 35, 0.60)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
        >
            {children}
        </div>
    </div>
);

const PanelTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-xl font-semibold text-white mb-4">{children}</h2>
);

const AnomalyList = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
        {children}
    </div>
);

interface AnomalyCardProps {
    anomaly: Anomaly;
    onInvestigate: () => void;
    glassmorphism: {
        background: string;
    };
    children: React.ReactNode;
}

const AnomalyCard: React.FC<AnomalyCardProps> = ({
    anomaly,
    onInvestigate,
    glassmorphism,
    children
}) => (
    <div
        className="rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
        style={{
            background: glassmorphism.background,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        onClick={onInvestigate}
    >
        {children}
    </div>
);

const AnomalyTimeline = ({ data }: { data: any }) => (
    <div className="h-16 mb-3">
        {/* Placeholder for timeline visualization */}
        <div className="h-full bg-white/5 rounded" />
    </div>
);

const AnomalyDetails = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2 mb-3">
        {children}
    </div>
);

const DetailRow = ({ children }: { children: React.ReactNode }) => (
    <div className="flex justify-between text-sm">
        {children}
    </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
    <span className="text-white/60">{children}</span>
);

interface ValueProps {
    children: React.ReactNode;
    className?: string;
}

const Value = ({ children, className = "text-white" }: ValueProps) => (
    <span className={className}>{children}</span>
);

const AnomalyActions = ({ children }: { children: React.ReactNode }) => (
    <div className="flex gap-2">
        {children}
    </div>
);

const Button = ({
    size = 'medium',
    variant = 'secondary',
    onClick,
    children
}: {
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary';
    onClick: () => void;
    children: React.ReactNode;
}) => {
    const sizeClasses = {
        small: 'px-3 py-1 text-xs',
        medium: 'px-4 py-2 text-sm',
        large: 'px-6 py-3 text-base'
    };

    const variantClasses = {
        primary: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300',
        secondary: 'bg-white/10 hover:bg-white/20 text-white'
    };

    return (
        <button
            className={`rounded-lg transition-colors ${sizeClasses[size]} ${variantClasses[variant]}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

// Chart components
const VolumeChart = ({ data }: { data: any }) => (
    <div className="h-32">
        <svg className="w-full h-full" viewBox="0 0 300 100">
            <path
                d="M0,50 L50,40 L100,45 L150,30 L200,35 L250,25 L300,30"
                fill="none"
                stroke="rgba(59, 130, 246, 0.5)"
                strokeWidth="2"
            />
            <path
                d="M0,50 L50,40 L100,45 L150,30 L200,35 L250,25 L300,30 L300,100 L0,100"
                fill="url(#volumeGradient)"
                opacity="0.2"
            />
            <defs>
                <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)" />
                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

const LatencyHistogram = ({ data }: { data: number[] | undefined }) => {
    const values = data || [10, 25, 50, 75, 90];
    const max = Math.max(...values);

    return (
        <div className="h-32 flex items-end gap-2">
            {values.map((value, i) => (
                <div
                    key={i}
                    className="flex-1 bg-blue-500/30 rounded-t"
                    style={{ height: `${(value / max) * 100}%` }}
                />
            ))}
        </div>
    );
};

const QualityBreakdown = ({ issues }: { issues: QualityIssue[] | undefined }) => {
    if (!issues || issues.length === 0) {
        return <div className="text-green-400 text-sm">No quality issues detected</div>;
    }

    return (
        <div className="space-y-2">
            {issues.slice(0, 3).map((issue, i) => (
                <div key={i} className="flex justify-between text-sm">
                    <span className="text-white/60">{issue.type}</span>
                    <span className="text-red-400">{issue.percentage.toFixed(1)}%</span>
                </div>
            ))}
        </div>
    );
};

// Selector components
const DataSourceSelector = () => (
    <select className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white">
        <option>All Sources</option>
        <option>Kafka Stream</option>
        <option>Database CDC</option>
        <option>API Gateway</option>
    </select>
);

const TimeRangeSelector = () => (
    <select className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white">
        <option>Last 1 Hour</option>
        <option>Last 24 Hours</option>
        <option>Last 7 Days</option>
        <option>Last 30 Days</option>
    </select>
);

const AlertsIndicator = ({ count }: { count: number }) => (
    <div className="flex items-center gap-2">
        <AlertIcon />
        <span className="text-white">{count} Active Alerts</span>
    </div>
);

// Main Dashboard Component
export const DataIntelligenceDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<RealTimeMetrics>();
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [dataFlowNodes, setDataFlowNodes] = useState<DataFlowNode[]>([]);
    const [dataFlowEdges, setDataFlowEdges] = useState<DataFlowEdge[]>([]);
    const [flowMetrics, setFlowMetrics] = useState<any>({});

    // Initialize data processing engine
    const engineRef = useRef<DataProcessingEngine>();

    useEffect(() => {
        // Initialize engine
        const config = {
            kafka: {
                brokers: ['localhost:9092'],
                clientId: 'dataforge-dashboard',
                groupId: 'dataforge-consumer'
            },
            storage: {
                type: 's3' as const,
                bucket: 'dataforge-data',
                prefix: 'processed/'
            },
            processing: {
                defaultParallelism: 16,
                maxRetries: 3,
                checkpointInterval: 1000,
                windowDuration: 60000
            },
            monitoring: {
                metricsEndpoint: '/api/metrics',
                logsEndpoint: '/api/logs',
                tracingEndpoint: '/api/traces'
            }
        };

        engineRef.current = new DataProcessingEngine(config, console as any);

        // Start real-time metrics collection
        const metricsInterval = setInterval(async () => {
            if (engineRef.current) {
                const realTimeMetrics = await engineRef.current.getRealTimeMetrics();
                if (!Array.isArray(realTimeMetrics)) {
                    setMetrics(realTimeMetrics);
                }
            }
        }, 1000);

        // Simulate data flow
        setDataFlowNodes([
            {
                id: 'source-1',
                type: 'source',
                name: 'Kafka Stream',
                status: { state: 'running', health: 'healthy', lastUpdate: new Date() },
                metrics: {
                    throughput: 1500,
                    latency: 25,
                    errorRate: 0.01,
                    queueSize: 100,
                    cpuUsage: 45,
                    memoryUsage: 60
                },
                position: { x: 100, y: 200 },
                connections: { inputs: [], outputs: ['processor-1'] }
            },
            {
                id: 'processor-1',
                type: 'processor',
                name: 'ML Enrichment',
                status: { state: 'running', health: 'healthy', lastUpdate: new Date() },
                metrics: {
                    throughput: 1450,
                    latency: 50,
                    errorRate: 0.02,
                    queueSize: 50,
                    cpuUsage: 75,
                    memoryUsage: 80
                },
                position: { x: 300, y: 200 },
                connections: { inputs: ['source-1'], outputs: ['sink-1'] }
            },
            {
                id: 'sink-1',
                type: 'sink',
                name: 'Data Lake',
                status: { state: 'running', health: 'healthy', lastUpdate: new Date() },
                metrics: {
                    throughput: 1400,
                    latency: 10,
                    errorRate: 0,
                    queueSize: 0,
                    cpuUsage: 30,
                    memoryUsage: 40
                },
                position: { x: 500, y: 200 },
                connections: { inputs: ['processor-1'], outputs: [] }
            }
        ]);

        setDataFlowEdges([
            {
                id: 'edge-1',
                source: 'source-1',
                target: 'processor-1',
                metrics: {
                    dataRate: 15000000, // 15 MB/s
                    recordCount: 1500,
                    avgRecordSize: 10000,
                    backpressure: 0.1
                },
                status: 'active'
            },
            {
                id: 'edge-2',
                source: 'processor-1',
                target: 'sink-1',
                metrics: {
                    dataRate: 14000000, // 14 MB/s
                    recordCount: 1400,
                    avgRecordSize: 10000,
                    backpressure: 0.05
                },
                status: 'active'
            }
        ]);

        // Simulate anomalies
        setAnomalies([
            {
                id: 'anomaly-1',
                timestamp: new Date(),
                type: 'latency-spike',
                severity: 'high',
                confidence: 0.92,
                affectedMetrics: ['processing_latency', 'queue_depth'],
                description: 'Processing latency increased by 150% in the last 5 minutes',
                context: {
                    baseline: { latency: 50 },
                    current: { latency: 125 },
                    deviation: 150,
                    timeWindow: {
                        start: new Date(Date.now() - 300000),
                        end: new Date(),
                        duration: { value: 5, unit: 'm' }
                    },
                    relatedAnomalies: []
                },
                suggestedActions: ['auto-scale', 'investigate-bottleneck'],
                status: {
                    acknowledged: false
                }
            },
            {
                id: 'anomaly-2',
                timestamp: new Date(Date.now() - 600000),
                type: 'data-drift',
                severity: 'medium',
                confidence: 0.85,
                affectedMetrics: ['data_distribution'],
                description: 'Significant change in data distribution detected',
                context: {
                    baseline: { distribution: 'normal' },
                    current: { distribution: 'skewed' },
                    deviation: 35,
                    timeWindow: {
                        start: new Date(Date.now() - 3600000),
                        end: new Date(),
                        duration: { value: 1, unit: 'h' }
                    },
                    relatedAnomalies: []
                },
                suggestedActions: ['review-model', 'update-baseline'],
                status: {
                    acknowledged: true,
                    assignedTo: 'data-team'
                }
            }
        ]);

        return () => {
            clearInterval(metricsInterval);
        };
    }, []);

    const investigateAnomaly = (anomaly: Anomaly) => {
        console.log('Investigating anomaly:', anomaly);
        // Implementation would open detailed investigation view
    };

    const dismissAnomaly = (anomaly: Anomaly) => {
        setAnomalies(anomalies.filter(a => a.id !== anomaly.id));
    };

    const createAlert = (anomaly: Anomaly) => {
        console.log('Creating alert for anomaly:', anomaly);
        // Implementation would create monitoring alert
    };

    return (
        <DashboardContainer>
            <DashboardHeader>
                <DataSourceSelector />
                <TimeRangeSelector />
                <AlertsIndicator count={anomalies.filter(a => !a.status.acknowledged).length} />
            </DashboardHeader>

            <MetricsGrid>
                <MetricCard
                    title="Data Volume"
                    value={metrics?.volume ? `${(metrics.volume / 1000000).toFixed(1)}M` : undefined}
                    trend={metrics?.volumeTrend}
                    glassmorphism={{
                        background: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.25)'
                    }}
                >
                    <VolumeChart data={metrics?.throughput} />
                </MetricCard>

                <MetricCard
                    title="Processing Latency"
                    value={metrics?.latency ? `${metrics.latency.toFixed(0)}ms` : undefined}
                    status={metrics && metrics.latency < 100 ? 'good' : 'warning'}
                    glassmorphism={{
                        background: metrics && metrics.latency < 100
                            ? 'rgba(34, 197, 94, 0.08)'
                            : 'rgba(251, 191, 36, 0.08)'
                    }}
                >
                    <LatencyHistogram data={metrics?.latencyDistribution} />
                </MetricCard>

                <MetricCard
                    title="Data Quality"
                    value={metrics?.quality ? `${metrics.quality.toFixed(0)}%` : undefined}
                    glassmorphism={{
                        background: 'rgba(99, 102, 241, 0.08)'
                    }}
                >
                    <QualityBreakdown issues={metrics?.qualityIssues} />
                </MetricCard>
            </MetricsGrid>

            <VisualizationArea>
                <DataFlowVisualization
                    nodes={dataFlowNodes}
                    edges={dataFlowEdges}
                    metrics={flowMetrics}
                    glassmorphism={{
                        nodes: 'rgba(30, 30, 40, 0.85)',
                        edges: 'rgba(99, 102, 241, 0.3)',
                        activeNode: 'rgba(99, 102, 241, 0.15)'
                    }}
                />
            </VisualizationArea>

            <AnomalyPanel>
                <PanelTitle>Detected Anomalies</PanelTitle>
                <AnomalyList>
                    {anomalies.map((anomaly) => (
                        <AnomalyCard
                            key={anomaly.id}
                            anomaly={anomaly}
                            onInvestigate={() => investigateAnomaly(anomaly)}
                            glassmorphism={{
                                background: anomaly.severity === 'critical'
                                    ? 'rgba(239, 68, 68, 0.08)'
                                    : anomaly.severity === 'high'
                                        ? 'rgba(251, 191, 36, 0.08)'
                                        : 'rgba(59, 130, 246, 0.08)'
                            }}
                        >
                            <AnomalyTimeline data={anomaly.context} />
                            <AnomalyDetails>
                                <DetailRow>
                                    <Label>Type:</Label>
                                    <Value>{anomaly.type.replace('-', ' ').toUpperCase()}</Value>
                                </DetailRow>
                                <DetailRow>
                                    <Label>Confidence:</Label>
                                    <Value>{(anomaly.confidence * 100).toFixed(0)}%</Value>
                                </DetailRow>
                                <DetailRow>
                                    <Label>Severity:</Label>
                                    <Value className={`capitalize ${anomaly.severity === 'critical' ? 'text-red-400' :
                                        anomaly.severity === 'high' ? 'text-yellow-400' :
                                            'text-blue-400'
                                        }`}>
                                        {anomaly.severity}
                                    </Value>
                                </DetailRow>
                            </AnomalyDetails>
                            <div className="text-sm text-white/60 mb-3">
                                {anomaly.description}
                            </div>
                            <AnomalyActions>
                                <Button size="small" onClick={() => dismissAnomaly(anomaly)}>
                                    Dismiss
                                </Button>
                                <Button size="small" variant="primary" onClick={() => createAlert(anomaly)}>
                                    Create Alert
                                </Button>
                            </AnomalyActions>
                        </AnomalyCard>
                    ))}
                </AnomalyList>
            </AnomalyPanel>
        </DashboardContainer>
    );
};

export default DataIntelligenceDashboard;