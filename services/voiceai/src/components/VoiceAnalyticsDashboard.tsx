'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Call,
    VoiceAnalytics,
    CallAnalytics,
    EmotionAnalysis,
    Utterance,
    Suggestion,
    KeyMoment,
    AgentPerformance
} from '@/types/voice.types';
// @ts-ignore
import WaveSurfer from 'wavesurfer.js';
// @ts-ignore
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Styled components
const DashboardContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="backdrop-blur-3xl">
            {children}
        </div>
    </div>
);

const DashboardHeader = ({ children }: { children: React.ReactNode }) => (
    <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">G3D VoiceAI Analytics</h1>
                {children}
            </div>
        </div>
    </header>
);

const LiveCallMonitor = ({ children }: { children: React.ReactNode }) => (
    <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
            {children}
        </div>
    </div>
);

interface CallVisualizationProps {
    waveform?: any;
    glassmorphism: {
        background: string;
        border: string;
    };
}

const CallVisualization: React.FC<CallVisualizationProps> = ({ waveform, glassmorphism }) => {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);

    useEffect(() => {
        if (waveformRef.current && !wavesurferRef.current) {
            wavesurferRef.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#10b981',
                progressColor: '#059669',
                cursorColor: '#34d399',
                barWidth: 2,
                barRadius: 3,
                cursorWidth: 1,
                height: 100,
                barGap: 3
            });
        }

        return () => {
            wavesurferRef.current?.destroy();
        };
    }, []);

    return (
        <div className="col-span-12">
            <div
                className="rounded-xl p-6"
                style={{
                    background: glassmorphism.background,
                    backdropFilter: 'blur(10px)',
                    border: glassmorphism.border
                }}
            >
                <h3 className="text-lg font-semibold text-white mb-4">Live Call Waveform</h3>
                <div ref={waveformRef} className="w-full" />
            </div>
        </div>
    );
};

const TranscriptPanel = ({ children }: { children: React.ReactNode }) => (
    <div className="col-span-6">
        <div
            className="rounded-xl p-6 h-[400px] overflow-y-auto"
            style={{
                background: 'rgba(30, 30, 40, 0.60)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
        >
            <h3 className="text-lg font-semibold text-white mb-4 sticky top-0 bg-black/20 py-2">
                Live Transcript
            </h3>
            {children}
        </div>
    </div>
);

interface LiveTranscriptProps {
    speakers?: any[];
    utterances?: Utterance[];
    emotions?: EmotionAnalysis[];
}

const LiveTranscript: React.FC<LiveTranscriptProps> = ({ speakers, utterances, emotions }) => (
    <div className="space-y-3">
        {utterances?.map((utterance, index) => (
            <div
                key={utterance.id}
                className="p-3 rounded-lg"
                style={{
                    background: utterance.speakerId === 'agent'
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-medium text-white/60">
                        {utterance.speakerId === 'agent' ? 'Agent' : 'Customer'}
                    </span>
                    {utterance.emotion && (
                        <EmotionBadge emotion={utterance.emotion.primary} />
                    )}
                </div>
                <p className="text-sm text-white/90">{utterance.text}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/40">
                        {new Date(utterance.startTime * 1000).toISOString().substr(14, 5)}
                    </span>
                    <span className="text-xs text-white/40">•</span>
                    <span className="text-xs text-white/40">
                        {Math.round(utterance.confidence * 100)}% confidence
                    </span>
                </div>
            </div>
        ))}
    </div>
);

const EmotionBadge = ({ emotion }: { emotion: string }) => {
    const colors: Record<string, string> = {
        happy: 'bg-green-500/20 text-green-300',
        sad: 'bg-blue-500/20 text-blue-300',
        angry: 'bg-red-500/20 text-red-300',
        neutral: 'bg-gray-500/20 text-gray-300',
        confused: 'bg-yellow-500/20 text-yellow-300'
    };

    return (
        <span className={`px-2 py-1 rounded text-xs ${colors[emotion] || colors.neutral}`}>
            {emotion}
        </span>
    );
};

const SuggestionPanel = ({ children }: { children: React.ReactNode }) => (
    <div className="col-span-6">
        <div
            className="rounded-xl p-6 h-[400px] overflow-y-auto"
            style={{
                background: 'rgba(30, 30, 40, 0.60)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
        >
            <h3 className="text-lg font-semibold text-white mb-4">
                Real-Time Suggestions
            </h3>
            {children}
        </div>
    </div>
);

interface RealTimeSuggestionsProps {
    suggestions?: Suggestion[];
    urgency?: string;
}

const RealTimeSuggestions: React.FC<RealTimeSuggestionsProps> = ({ suggestions }) => (
    <div className="space-y-3">
        {suggestions?.map((suggestion) => (
            <div
                key={suggestion.id}
                className="p-4 rounded-lg"
                style={{
                    background: suggestion.urgency === 'critical'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : suggestion.urgency === 'high'
                            ? 'rgba(251, 191, 36, 0.1)'
                            : 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
            >
                <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-white">
                        {suggestion.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <UrgencyBadge urgency={suggestion.urgency} />
                </div>
                <p className="text-sm text-white/80 mb-2">{suggestion.text}</p>
                <p className="text-xs text-white/60">{suggestion.reason}</p>
            </div>
        ))}
    </div>
);

const UrgencyBadge = ({ urgency }: { urgency: string }) => {
    const colors: Record<string, string> = {
        critical: 'bg-red-500/20 text-red-300',
        high: 'bg-amber-500/20 text-amber-300',
        medium: 'bg-blue-500/20 text-blue-300',
        low: 'bg-gray-500/20 text-gray-300'
    };

    return (
        <span className={`px-2 py-1 rounded text-xs ${colors[urgency] || colors.low}`}>
            {urgency}
        </span>
    );
};

const AnalyticsGrid = ({ children }: { children: React.ReactNode }) => (
    <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {children}
        </div>
    </div>
);

interface MetricCardProps {
    title: string;
    value?: number | string;
    trend?: number;
    chart?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, chart }) => (
    <div
        className="rounded-xl p-6"
        style={{
            background: 'rgba(30, 30, 40, 0.60)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
    >
        <h4 className="text-sm font-medium text-white/60 mb-2">{title}</h4>
        <div className="flex items-end justify-between mb-4">
            <span className="text-2xl font-bold text-white">{value || '0'}</span>
            {trend !== undefined && (
                <span className={`text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        {chart}
    </div>
);

const AgentPerformanceGrid = ({ agents }: { agents?: AgentPerformance[] }) => (
    <div className="container mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold text-white mb-6">Agent Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents?.map((agent) => (
                <AgentCard key={agent.agentId} agent={agent} />
            ))}
        </div>
    </div>
);

const AgentCard = ({ agent }: { agent: AgentPerformance }) => (
    <div
        className="rounded-xl p-6"
        style={{
            background: 'rgba(30, 30, 40, 0.60)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
    >
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">{agent.agentName}</h3>
            {agent.coachingNeeded && (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded">
                    Coaching Needed
                </span>
            )}
        </div>
        <div className="space-y-3">
            <MetricRow label="Calls Handled" value={agent.callsHandled} />
            <MetricRow label="Avg Handle Time" value={`${Math.round(agent.averageHandleTime)}s`} />
            <MetricRow label="Sentiment Score" value={`${Math.round(agent.sentimentScore * 100)}%`} />
            <MetricRow label="Compliance Score" value={`${Math.round(agent.complianceScore)}%`} />
        </div>
    </div>
);

const MetricRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">{label}</span>
        <span className="text-sm font-medium text-white">{value}</span>
    </div>
);

// Main component
export const VoiceAnalyticsDashboard: React.FC = () => {
    const [activeCall, setActiveCall] = useState<Call | null>(null);
    const [analytics, setAnalytics] = useState<VoiceAnalytics>();

    // Mock data for demonstration
    useEffect(() => {
        // In production, this would connect to real-time data streams
        const mockCall: Call = {
            id: 'call-123',
            startTime: new Date(),
            participants: [
                { id: 'agent', role: 'agent' },
                { id: 'customer', role: 'customer' }
            ],
            status: 'active',
            transcript: {
                utterances: [
                    {
                        id: '1',
                        speakerId: 'agent',
                        text: 'Thank you for calling G3D Support. How can I help you today?',
                        startTime: 0,
                        endTime: 3,
                        confidence: 0.95,
                        emotion: {
                            primary: 'happy',
                            valence: 0.7,
                            arousal: 0.5,
                            confidence: 0.9,
                            timestamp: 0
                        }
                    },
                    {
                        id: '2',
                        speakerId: 'customer',
                        text: 'I\'m having trouble with my voice processing API integration.',
                        startTime: 4,
                        endTime: 7,
                        confidence: 0.92,
                        emotion: {
                            primary: 'confused',
                            valence: -0.2,
                            arousal: 0.6,
                            confidence: 0.85,
                            timestamp: 4
                        }
                    }
                ],
                speakers: [],
                language: 'en',
                confidence: 0.93,
                metadata: {
                    duration: 7,
                    wordCount: 20,
                    sentenceCount: 2,
                    languageConfidence: 0.98
                }
            }
        };

        setActiveCall(mockCall);

        // Mock analytics
        const mockAnalytics: VoiceAnalytics = {
            period: {
                start: new Date(),
                end: new Date(),
                granularity: 'day'
            },
            calls: 156,
            averageDuration: 245,
            sentimentScore: 0.75,
            complianceScore: 94,
            qualityMetrics: {
                averageScore: 87,
                firstCallResolution: 78,
                customerSatisfaction: 4.2,
                scriptAdherence: 91
            },
            agentPerformance: [
                {
                    agentId: '1',
                    agentName: 'Sarah Johnson',
                    callsHandled: 42,
                    averageHandleTime: 210,
                    sentimentScore: 0.82,
                    complianceScore: 96,
                    coachingNeeded: false
                },
                {
                    agentId: '2',
                    agentName: 'Mike Chen',
                    callsHandled: 38,
                    averageHandleTime: 185,
                    sentimentScore: 0.78,
                    complianceScore: 92,
                    coachingNeeded: false
                },
                {
                    agentId: '3',
                    agentName: 'Alex Rivera',
                    callsHandled: 35,
                    averageHandleTime: 298,
                    sentimentScore: 0.65,
                    complianceScore: 88,
                    coachingNeeded: true
                }
            ],
            trends: []
        };

        setAnalytics(mockAnalytics);
    }, []);

    const mockSuggestions: Suggestion[] = [
        {
            id: '1',
            type: 'empathy',
            text: 'Acknowledge the customer\'s frustration and assure them you\'ll help resolve the issue.',
            reason: 'Customer emotion detected as confused/frustrated',
            urgency: 'high',
            timestamp: Date.now()
        },
        {
            id: '2',
            type: 'clarification',
            text: 'Ask for specific error messages or steps to reproduce the issue.',
            reason: 'Insufficient technical details provided',
            urgency: 'medium',
            timestamp: Date.now()
        }
    ];

    return (
        <DashboardContainer>
            <DashboardHeader>
                <div className="flex items-center gap-4">
                    <select className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white">
                        <option>Today</option>
                        <option>This Week</option>
                        <option>This Month</option>
                    </select>
                    <button className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg border border-emerald-500/30 transition-all">
                        Export Report
                    </button>
                </div>
            </DashboardHeader>

            <LiveCallMonitor>
                <CallVisualization
                    waveform={activeCall?.recording}
                    glassmorphism={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.25)'
                    }}
                />

                <TranscriptPanel>
                    <LiveTranscript
                        speakers={activeCall?.participants}
                        utterances={activeCall?.transcript?.utterances}
                        emotions={activeCall?.analytics?.emotionTimeline}
                    />
                </TranscriptPanel>

                <SuggestionPanel>
                    <RealTimeSuggestions
                        suggestions={mockSuggestions}
                    />
                </SuggestionPanel>
            </LiveCallMonitor>

            <AnalyticsGrid>
                <MetricCard
                    title="Sentiment Score"
                    value={analytics ? `${Math.round(analytics.sentimentScore * 100)}%` : '0%'}
                    trend={5}
                />
                <MetricCard
                    title="Talk Ratio"
                    value="60/40"
                    trend={-2}
                />
                <MetricCard
                    title="Compliance Score"
                    value={analytics ? `${analytics.complianceScore}%` : '0%'}
                    trend={3}
                />
            </AnalyticsGrid>

            <AgentPerformanceGrid agents={analytics?.agentPerformance} />
        </DashboardContainer>
    );
};

export default VoiceAnalyticsDashboard;