'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Threat,
    Incident,
    SecurityMetrics,
    Infrastructure,
    ThreatAnalysis,
    SecurityRecommendations
} from '@/types/secureai.types';
import { AISecurityEngine } from '@/services/AISecurityEngine';

// Icons
const ThreatIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const ShieldIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const NetworkIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
);

// Styled components
const SOCContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900">
        <div className="backdrop-blur-3xl">
            {children}
        </div>
    </div>
);

const ThreatMap = ({ children }: { children: React.ReactNode }) => (
    <div className="relative h-96 overflow-hidden">
        {children}
    </div>
);

interface GlobalThreatVisualizationProps {
    threats: Threat[];
    infrastructure: Infrastructure;
    glassmorphism: {
        map: string;
        threatNodes: string;
        connections: string;
    };
}

const GlobalThreatVisualization: React.FC<GlobalThreatVisualizationProps> = ({
    threats,
    infrastructure,
    glassmorphism
}) => (
    <div
        className="absolute inset-0"
        style={{ background: glassmorphism.map }}
    >
        {/* World map background */}
        <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 1000 500" className="w-full h-full">
                {/* Simplified world map paths */}
                <path
                    d="M200,200 Q400,150 600,200 T800,250"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                />
            </svg>
        </div>

        {/* Threat nodes */}
        {threats.map((threat, index) => (
            <div
                key={threat.id}
                className="absolute animate-pulse"
                style={{
                    left: `${20 + (index * 15) % 60}%`,
                    top: `${30 + (index * 20) % 40}%`,
                    width: '40px',
                    height: '40px',
                    background: glassmorphism.threatNodes,
                    borderRadius: '50%',
                    border: '2px solid rgba(239, 68, 68, 0.5)'
                }}
            >
                <div className="w-full h-full flex items-center justify-center">
                    <ThreatIcon />
                </div>
            </div>
        ))}

        {/* Threat connections */}
        <svg className="absolute inset-0 pointer-events-none">
            {threats.map((threat, i) =>
                threats.slice(i + 1).map((threat2, j) => (
                    <line
                        key={`${threat.id}-${threat2.id}`}
                        x1={`${20 + (i * 15) % 60}%`}
                        y1={`${30 + (i * 20) % 40}%`}
                        x2={`${20 + ((i + j + 1) * 15) % 60}%`}
                        y2={`${30 + ((i + j + 1) * 20) % 40}%`}
                        stroke={glassmorphism.connections}
                        strokeWidth="1"
                        strokeDasharray="5,5"
                        className="animate-pulse"
                    />
                ))
            )}
        </svg>
    </div>
);

const IncidentPanel = ({ children }: { children: React.ReactNode }) => (
    <div className="container mx-auto px-4 py-6">
        <div
            className="rounded-xl p-6"
            style={{
                background: 'rgba(20, 20, 30, 0.60)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
        >
            {children}
        </div>
    </div>
);

const IncidentQueue = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {children}
    </div>
);

interface IncidentCardProps {
    incident: Incident;
    glassmorphism: {
        background: string;
    };
    children: React.ReactNode;
}

const IncidentCard: React.FC<IncidentCardProps> = ({
    incident,
    glassmorphism,
    children
}) => (
    <div
        className="rounded-lg p-6 transition-all hover:scale-[1.02]"
        style={{
            background: glassmorphism.background,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
    >
        {children}
    </div>
);

const IncidentHeader = ({ children }: { children: React.ReactNode }) => (
    <div className="flex justify-between items-start mb-4">
        {children}
    </div>
);

const ThreatType = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-lg font-semibold text-white">{children}</h3>
);

const ConfidenceScore = ({ score }: { score: number }) => (
    <div className="flex items-center gap-2">
        <span className="text-sm text-white/60">Confidence:</span>
        <span className={`text-sm font-bold ${score > 0.9 ? 'text-red-400' :
                score > 0.7 ? 'text-yellow-400' :
                    'text-blue-400'
            }`}>
            {(score * 100).toFixed(0)}%
        </span>
    </div>
);

const AttackTimeline = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-4">
        {children}
    </div>
);

interface TimelineVisualizationProps {
    events: any[];
    currentPhase: string;
}

const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({
    events,
    currentPhase
}) => {
    const phases = ['reconnaissance', 'initial-access', 'execution', 'persistence', 'exfiltration'];
    const currentIndex = phases.indexOf(currentPhase);

    return (
        <div className="relative h-16">
            {/* Timeline line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-white/20" />

            {/* Phase markers */}
            {phases.map((phase, index) => (
                <div
                    key={phase}
                    className="absolute top-4"
                    style={{ left: `${index * 25}%` }}
                >
                    <div className={`w-4 h-4 rounded-full ${index <= currentIndex ? 'bg-red-500' : 'bg-white/20'
                        } ${index === currentIndex ? 'animate-pulse' : ''}`} />
                    <div className="text-xs text-white/60 mt-1 -ml-6 w-16 text-center">
                        {phase.replace('-', ' ')}
                    </div>
                </div>
            ))}
        </div>
    );
};

const ResponseActions = ({ children }: { children: React.ReactNode }) => (
    <div className="flex gap-2 mb-4">
        {children}
    </div>
);

const ActionButton = ({
    onClick,
    variant,
    children
}: {
    onClick: () => void;
    variant: 'critical' | 'warning' | 'info';
    children: React.ReactNode;
}) => {
    const variants = {
        critical: 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30',
        warning: 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-500/30',
        info: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30'
    };

    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${variants[variant]}`}
        >
            {children}
        </button>
    );
};

const AIRecommendations = ({ children }: { children: React.ReactNode }) => (
    <div>
        <h4 className="text-sm font-medium text-white/60 mb-2">AI Recommendations</h4>
        {children}
    </div>
);

const RecommendationList = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2">
        {children}
    </div>
);

interface RecommendationProps {
    recommendation: any;
    onApply: () => void;
}

const Recommendation: React.FC<RecommendationProps> = ({
    recommendation,
    onApply
}) => (
    <div className="flex items-center justify-between p-2 rounded bg-white/5">
        <span className="text-sm text-white/80">{recommendation.title}</span>
        <button
            onClick={onApply}
            className="text-xs px-2 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
        >
            Apply
        </button>
    </div>
);

const MetricsPanel = ({ children }: { children: React.ReactNode }) => (
    <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {children}
        </div>
    </div>
);

interface SecurityMetricsProps {
    mttr: number;
    mttd: number;
    falsePositiveRate: number;
    threatsBlocked: number;
}

const SecurityMetrics: React.FC<SecurityMetricsProps> = ({
    mttr,
    mttd,
    falsePositiveRate,
    threatsBlocked
}) => (
    <>
        <MetricCard
            title="MTTR"
            value={`${mttr}m`}
            subtitle="Mean Time to Respond"
            trend="down"
            trendValue={-12}
        />
        <MetricCard
            title="MTTD"
            value={`${mttd}m`}
            subtitle="Mean Time to Detect"
            trend="down"
            trendValue={-8}
        />
        <MetricCard
            title="False Positive Rate"
            value={`${falsePositiveRate}%`}
            subtitle="Last 24 hours"
            trend="down"
            trendValue={-5}
        />
        <MetricCard
            title="Threats Blocked"
            value={threatsBlocked.toLocaleString()}
            subtitle="Last 7 days"
            trend="up"
            trendValue={23}
        />
    </>
);

interface MetricCardProps {
    title: string;
    value: string;
    subtitle: string;
    trend?: 'up' | 'down';
    trendValue?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    subtitle,
    trend,
    trendValue
}) => (
    <div
        className="rounded-lg p-4"
        style={{
            background: 'rgba(30, 30, 40, 0.60)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
    >
        <div className="text-sm text-white/60 mb-1">{title}</div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-white/40">{subtitle}</div>
        {trend && trendValue && (
            <div className={`text-xs mt-2 ${trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                {trend === 'up' ? '↑' : '↓'} {Math.abs(trendValue)}%
            </div>
        )}
    </div>
);

// Main component
export const SecurityOperationsCenter: React.FC = () => {
    const [threats, setThreats] = useState<Threat[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [metrics, setMetrics] = useState<SecurityMetrics>({
        mttd: 5.2,
        mttr: 12.8,
        threatsCaught: 1247,
        falsePositiveRate: 2.3,
        coverage: 94.5,
        compliance: 98.2
    });

    const [infrastructure, setInfrastructure] = useState<Infrastructure>({
        networks: [],
        endpoints: [],
        applications: [],
        cloudResources: [],
        users: [],
        assets: []
    });

    const engineRef = useRef<AISecurityEngine>();

    useEffect(() => {
        // Initialize security engine
        const config = {
            aiModels: {
                threatDetection: '/models/threat-detection-v2',
                behaviorAnalysis: '/models/behavior-analysis-v2',
                responseAutomation: '/models/response-automation-v2',
                forensics: '/models/forensics-v2'
            },
            infrastructure: {
                networkSegments: ['dmz', 'internal', 'management'],
                endpoints: [],
                applications: [],
                cloudProviders: ['aws', 'gcp', 'azure']
            },
            policies: {
                responseThresholds: {
                    critical: 0.95,
                    high: 0.85,
                    medium: 0.70,
                    low: 0.50
                },
                complianceStandards: ['SOC2', 'ISO27001', 'HIPAA', 'PCI-DSS'],
                retentionPeriod: 90 * 24 * 60 * 60 * 1000 // 90 days
            }
        };

        engineRef.current = new AISecurityEngine(config);

        // Simulate threats
        const threatInterval = setInterval(() => {
            const newThreat: Threat = {
                id: `threat-${Date.now()}`,
                timestamp: new Date(),
                type: ['malware', 'phishing', 'ddos', 'insider-threat'][Math.floor(Math.random() * 4)],
                source: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
                target: 'web-server-01',
                severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
                confidence: 0.7 + Math.random() * 0.3,
                indicators: ['suspicious-process', 'abnormal-traffic'],
                metadata: {}
            };

            setThreats(prev => [newThreat, ...prev].slice(0, 10));
        }, 10000);

        // Simulate incidents
        setIncidents([
            {
                id: 'inc-001',
                timestamp: new Date(),
                type: 'ransomware',
                severity: 'critical',
                status: 'investigating',
                assignee: 'security-team',
                description: 'Ransomware detected on multiple endpoints',
                affectedAssets: ['endpoint-01', 'endpoint-02', 'endpoint-03'],
                timeline: [],
                artifacts: [],
                notes: [],
                aiConfidence: 0.96,
                currentPhase: 'execution',
                aiRecommendations: [
                    { id: '1', title: 'Isolate affected endpoints immediately' },
                    { id: '2', title: 'Block C2 communication at firewall' },
                    { id: '3', title: 'Initiate backup restoration procedure' }
                ]
            } as any,
            {
                id: 'inc-002',
                timestamp: new Date(Date.now() - 3600000),
                type: 'data-exfiltration',
                severity: 'high',
                status: 'contained',
                assignee: 'security-team',
                description: 'Unusual data transfer detected to external IP',
                affectedAssets: ['database-01'],
                timeline: [],
                artifacts: [],
                notes: [],
                aiConfidence: 0.88,
                currentPhase: 'exfiltration',
                aiRecommendations: [
                    { id: '1', title: 'Review database access logs' },
                    { id: '2', title: 'Check for compromised credentials' }
                ]
            } as any
        ]);

        return () => {
            clearInterval(threatInterval);
        };
    }, []);

    const isolateSystem = (incident: Incident) => {
        console.log('Isolating system for incident:', incident.id);
        // Implementation would trigger actual isolation
    };

    const blockAttacker = (incident: Incident) => {
        console.log('Blocking attacker for incident:', incident.id);
        // Implementation would update firewall rules
    };

    const collectForensics = (incident: Incident) => {
        console.log('Collecting forensics for incident:', incident.id);
        // Implementation would trigger forensic collection
    };

    const applyRecommendation = (recommendation: any) => {
        console.log('Applying recommendation:', recommendation);
        // Implementation would execute the recommendation
    };

    return (
        <SOCContainer>
            <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/20">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldIcon />
                            <h1 className="text-2xl font-bold text-white">G3D SecureAI Operations Center</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-white/60">
                                Active Threats: <span className="text-red-400 font-bold">{threats.length}</span>
                            </div>
                            <div className="text-sm text-white/60">
                                Open Incidents: <span className="text-yellow-400 font-bold">
                                    {incidents.filter(i => i.status !== 'closed').length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <ThreatMap>
                <GlobalThreatVisualization
                    threats={threats}
                    infrastructure={infrastructure}
                    glassmorphism={{
                        map: 'rgba(20, 20, 30, 0.95)',
                        threatNodes: 'rgba(239, 68, 68, 0.3)',
                        connections: 'rgba(239, 68, 68, 0.2)'
                    }}
                />
            </ThreatMap>

            <IncidentPanel>
                <h2 className="text-xl font-semibold text-white mb-4">Active Incidents</h2>
                <IncidentQueue>
                    {incidents.map((incident: any) => (
                        <IncidentCard
                            key={incident.id}
                            incident={incident}
                            glassmorphism={{
                                background: incident.severity === 'critical'
                                    ? 'rgba(239, 68, 68, 0.08)'
                                    : incident.severity === 'high'
                                        ? 'rgba(251, 191, 36, 0.08)'
                                        : 'rgba(59, 130, 246, 0.08)'
                            }}
                        >
                            <IncidentHeader>
                                <ThreatType>{incident.type.toUpperCase()}</ThreatType>
                                <ConfidenceScore score={incident.aiConfidence} />
                            </IncidentHeader>

                            <div className="text-sm text-white/60 mb-4">
                                {incident.description}
                            </div>

                            <AttackTimeline>
                                <TimelineVisualization
                                    events={incident.timeline}
                                    currentPhase={incident.currentPhase}
                                />
                            </AttackTimeline>

                            <ResponseActions>
                                <ActionButton
                                    onClick={() => isolateSystem(incident)}
                                    variant="critical"
                                >
                                    Isolate System
                                </ActionButton>
                                <ActionButton
                                    onClick={() => blockAttacker(incident)}
                                    variant="warning"
                                >
                                    Block Attacker
                                </ActionButton>
                                <ActionButton
                                    onClick={() => collectForensics(incident)}
                                    variant="info"
                                >
                                    Collect Evidence
                                </ActionButton>
                            </ResponseActions>

                            <AIRecommendations>
                                <RecommendationList>
                                    {incident.aiRecommendations.map((rec: any) => (
                                        <Recommendation
                                            key={rec.id}
                                            recommendation={rec}
                                            onApply={() => applyRecommendation(rec)}
                                        />
                                    ))}
                                </RecommendationList>
                            </AIRecommendations>
                        </IncidentCard>
                    ))}
                </IncidentQueue>
            </IncidentPanel>

            <MetricsPanel>
                <SecurityMetrics
                    mttr={metrics.mttr}
                    mttd={metrics.mttd}
                    falsePositiveRate={metrics.falsePositiveRate}
                    threatsBlocked={metrics.threatsCaught}
                />
            </MetricsPanel>
        </SOCContainer>
    );
};

export default SecurityOperationsCenter;