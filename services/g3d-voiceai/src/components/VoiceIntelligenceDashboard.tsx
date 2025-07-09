/**
 * G3D VoiceAI - Enterprise Voice Intelligence Dashboard
 * Complete voice processing platform with real-time analytics and compliance
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    VoiceAnalysis,
    CallMetrics,
    EmotionAnalysis,
    ComplianceReport,
    VoiceInsight,
    CallTranscript,
    SpeakerProfile
} from '../types/voice.types';
import { VoiceProcessingEngine } from '../services/VoiceProcessingEngine';

// VoiceAI Theme (Voice purple/blue theme)
const voiceaiTheme = {
    primary: '#7c3aed',
    secondary: '#3b82f6',
    accent: '#06b6d4',
    glass: {
        background: 'rgba(124, 58, 237, 0.1)',
        border: 'rgba(124, 58, 237, 0.2)',
        blur: '12px'
    }
};

// Animations
const voiceWave = keyframes`
  0%, 100% { transform: scaleY(1); }
  25% { transform: scaleY(1.5); }
  50% { transform: scaleY(0.8); }
  75% { transform: scaleY(1.2); }
`;

const emotionPulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(124, 58, 237, 0.3); }
  50% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.8); }
`;

const transcriptFlow = keyframes`
  0% { transform: translateY(10px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #581c87 0%, #6d28d9 50%, #7c3aed 100%);
  padding: 1.5rem;
  color: white;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #7c3aed, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #7c3aed, #3b82f6);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: ${emotionPulse} 2s infinite;
  }
`;

const CallStatus = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    
    &.live {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
      animation: ${emotionPulse} 1.5s infinite;
    }
    
    &.processing {
      background: rgba(124, 58, 237, 0.2);
      color: #7c3aed;
    }
    
    &.idle {
      background: rgba(107, 114, 128, 0.2);
      color: #9ca3af;
    }
    
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr 300px;
  gap: 1.5rem;
  height: calc(100vh - 140px);
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
`;

const CenterPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
`;

const GlassCard = styled.div<{ size?: 'sm' | 'md' | 'lg' }>`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 12px;
  padding: ${props =>
        props.size === 'sm' ? '1rem' :
            props.size === 'lg' ? '2rem' : '1.5rem'};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const VoiceVisualizer = styled.div`
  position: relative;
  min-height: 400px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  
  .voice-content {
    width: 100%;
    height: 100%;
    padding: 1rem;
    position: relative;
    
    .voice-display {
      width: 100%;
      height: 350px;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(59, 130, 246, 0.1));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      border: 2px solid rgba(124, 58, 237, 0.3);
      
      .waveform-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        height: 200px;
        
        .wave-bar {
          width: 4px;
          background: linear-gradient(to top, #7c3aed, #3b82f6);
          border-radius: 2px;
          animation: ${voiceWave} 1.5s infinite;
          
          &:nth-child(2n) { animation-delay: 0.1s; }
          &:nth-child(3n) { animation-delay: 0.2s; }
          &:nth-child(4n) { animation-delay: 0.3s; }
          &:nth-child(5n) { animation-delay: 0.4s; }
        }
      }
      
      .voice-metrics {
        position: absolute;
        top: 1rem;
        left: 1rem;
        right: 1rem;
        display: flex;
        justify-content: space-between;
        
        .metric {
          background: rgba(0, 0, 0, 0.5);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          text-align: center;
          
          .value {
            font-size: 1.2rem;
            font-weight: 700;
            color: #7c3aed;
          }
          
          .label {
            font-size: 0.8rem;
            opacity: 0.8;
          }
        }
      }
    }
  }
`;

const CallAnalytics = styled.div`
  .analytics-section {
    margin-bottom: 1.5rem;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      
      h4 {
        margin: 0;
        font-size: 1rem;
        color: #7c3aed;
      }
      
      .export-button {
        font-size: 0.8rem;
        color: #3b82f6;
        cursor: pointer;
        
        &:hover {
          color: #7c3aed;
        }
      }
    }
    
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      
      .analytics-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        
        .label {
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .value {
          font-size: 0.9rem;
          font-weight: 600;
          
          &.positive { color: #22c55e; }
          &.negative { color: #ef4444; }
          &.neutral { color: #7c3aed; }
        }
      }
    }
  }
`;

const LiveTranscript = styled.div`
  .transcript-container {
    max-height: 300px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    padding: 1rem;
    
    .transcript-line {
      margin-bottom: 1rem;
      animation: ${transcriptFlow} 0.5s ease-out;
      
      .speaker {
        font-weight: 600;
        color: #7c3aed;
        margin-bottom: 0.25rem;
      }
      
      .text {
        line-height: 1.4;
        margin-bottom: 0.5rem;
      }
      
      .metadata {
        display: flex;
        gap: 1rem;
        font-size: 0.8rem;
        opacity: 0.7;
        
        .timestamp {
          color: #06b6d4;
        }
        
        .emotion {
          color: #f59e0b;
        }
        
        .confidence {
          color: #22c55e;
        }
      }
    }
  }
`;

const EmotionAnalysis = styled.div`
  .emotion-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    
    .emotion-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      
      &.positive { background: rgba(34, 197, 94, 0.2); }
      &.neutral { background: rgba(124, 58, 237, 0.2); }
      &.negative { background: rgba(239, 68, 68, 0.2); }
    }
    
    .emotion-info {
      flex: 1;
      
      .emotion-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      .emotion-description {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
    
    .emotion-score {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
      background: rgba(124, 58, 237, 0.2);
      color: #7c3aed;
    }
  }
`;

const VoiceInsights = styled.div`
  .insight-item {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    border-left: 4px solid #7c3aed;
    
    .insight-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      
      .insight-type {
        background: rgba(124, 58, 237, 0.2);
        color: #7c3aed;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.7rem;
      }
      
      .confidence {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
    
    .insight-content {
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 0.75rem;
    }
    
    .insight-actions {
      display: flex;
      gap: 0.5rem;
      
      .action-button {
        padding: 0.25rem 0.75rem;
        background: rgba(124, 58, 237, 0.2);
        border: 1px solid rgba(124, 58, 237, 0.3);
        border-radius: 6px;
        color: #7c3aed;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(124, 58, 237, 0.3);
        }
      }
    }
  }
`;

const CallMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  .metric-card {
    padding: 1.5rem;
    background: rgba(124, 58, 237, 0.1);
    border-radius: 8px;
    text-align: center;
    
    .metric-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #7c3aed;
      margin-bottom: 0.5rem;
    }
    
    .metric-label {
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    .metric-trend {
      font-size: 0.8rem;
      margin-top: 0.25rem;
      
      &.improving { color: #22c55e; }
      &.declining { color: #ef4444; }
      &.stable { color: #06b6d4; }
    }
  }
`;

const GlassButton = styled.button<{ variant?: 'primary' | 'secondary' | 'ghost'; fullWidth?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(124, 58, 237, 0.3);
  background: ${props =>
        props.variant === 'primary' ? 'rgba(124, 58, 237, 0.2)' :
            props.variant === 'secondary' ? 'rgba(59, 130, 246, 0.2)' :
                'rgba(255, 255, 255, 0.1)'};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  &:hover {
    background: ${props =>
        props.variant === 'primary' ? 'rgba(124, 58, 237, 0.3)' :
            props.variant === 'secondary' ? 'rgba(59, 130, 246, 0.3)' :
                'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-2px);
  }
`;

// Main Component
export const VoiceIntelligenceDashboard: React.FC = () => {
    // State Management
    const [callMetrics, setCallMetrics] = useState<CallMetrics | null>(null);
    const [liveTranscript, setLiveTranscript] = useState<CallTranscript[]>([]);
    const [emotionAnalysis, setEmotionAnalysis] = useState<EmotionAnalysis[]>([]);
    const [voiceInsights, setVoiceInsights] = useState<VoiceInsight[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [showComplianceModal, setShowComplianceModal] = useState(false);

    // Refs
    const voiceEngine = useRef(new VoiceProcessingEngine());

    // Sample voice metrics
    const currentMetrics = {
        volume: 75,
        clarity: 92,
        pace: 145,
        sentiment: 'Positive'
    };

    // Sample call analytics
    const callAnalytics = {
        duration: '00:12:34',
        speakers: 2,
        words: 1247,
        talkRatio: '65/35',
        interruptions: 3,
        silencePeriods: 8,
        avgSentiment: 'Positive',
        complianceScore: 98
    };

    // Sample emotion analysis
    const emotions = [
        {
            id: 'emotion-001',
            name: 'Confidence',
            type: 'positive' as const,
            description: 'Speaker demonstrates high confidence in their statements',
            score: 87
        },
        {
            id: 'emotion-002',
            name: 'Engagement',
            type: 'positive' as const,
            description: 'High level of engagement detected throughout conversation',
            score: 92
        },
        {
            id: 'emotion-003',
            name: 'Concern',
            type: 'neutral' as const,
            description: 'Mild concern detected during pricing discussion',
            score: 34
        }
    ];

    // Sample live transcript
    const transcript = [
        {
            id: 'trans-001',
            speaker: 'Agent',
            text: 'Thank you for calling. How can I help you today?',
            timestamp: '00:00:15',
            emotion: 'Professional',
            confidence: 96
        },
        {
            id: 'trans-002',
            speaker: 'Customer',
            text: 'Hi, I\'m interested in your premium service package.',
            timestamp: '00:00:18',
            emotion: 'Interested',
            confidence: 94
        },
        {
            id: 'trans-003',
            speaker: 'Agent',
            text: 'Excellent! I\'d be happy to walk you through our premium features.',
            timestamp: '00:00:22',
            emotion: 'Enthusiastic',
            confidence: 98
        }
    ];

    // Event Handlers
    const handleStartRecording = useCallback(async () => {
        try {
            setIsRecording(true);
            await voiceEngine.current.startRecording({
                sampleRate: 44100,
                channels: 2,
                realTimeAnalysis: true
            });
        } catch (error) {
            console.error('Failed to start recording:', error);
            setIsRecording(false);
        }
    }, []);

    const handleStopRecording = useCallback(async () => {
        try {
            setIsRecording(false);
            const analysis = await voiceEngine.current.stopRecording();
            setCallMetrics(analysis.metrics);
            setEmotionAnalysis(analysis.emotions);
        } catch (error) {
            console.error('Failed to stop recording:', error);
        }
    }, []);

    const handleAnalyzeCall = useCallback(async () => {
        try {
            const analysis = await voiceEngine.current.analyzeCall({
                transcript: liveTranscript,
                emotions: emotionAnalysis,
                complianceRules: ['PCI-DSS', 'GDPR', 'CCPA']
            });

            setVoiceInsights(analysis.insights);
        } catch (error) {
            console.error('Call analysis failed:', error);
        }
    }, [liveTranscript, emotionAnalysis]);

    // Load voice data
    useEffect(() => {
        const loadVoiceData = async () => {
            try {
                const metrics = await voiceEngine.current.getCallMetrics();
                setCallMetrics(metrics);

                const insights = await voiceEngine.current.getVoiceInsights();
                setVoiceInsights(insights);
            } catch (error) {
                console.error('Failed to load voice data:', error);
            }
        };

        loadVoiceData();
    }, []);

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">🎙️</div>
                    <h1>G3D VoiceAI Intelligence</h1>
                </Logo>
                <CallStatus>
                    <div className={`status-indicator ${isRecording ? 'live' : 'idle'}`}>
                        <div className="dot" />
                        <span>{isRecording ? 'Recording Live' : 'Ready'}</span>
                    </div>
                    <GlassButton
                        variant={isRecording ? 'secondary' : 'primary'}
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                    >
                        {isRecording ? '⏹️ Stop' : '🎙️ Start Recording'}
                    </GlassButton>
                </CallStatus>
            </Header>

            <MainGrid>
                {/* Left Panel - Call Analytics & Metrics */}
                <LeftPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Call Analytics</h3>
                        <CallAnalytics>
                            <div className="analytics-section">
                                <div className="section-header">
                                    <h4>Current Call</h4>
                                    <span className="export-button">Export</span>
                                </div>
                                <div className="analytics-grid">
                                    <div className="analytics-item">
                                        <span className="label">Duration:</span>
                                        <span className="value neutral">{callAnalytics.duration}</span>
                                    </div>
                                    <div className="analytics-item">
                                        <span className="label">Speakers:</span>
                                        <span className="value neutral">{callAnalytics.speakers}</span>
                                    </div>
                                    <div className="analytics-item">
                                        <span className="label">Words:</span>
                                        <span className="value neutral">{callAnalytics.words}</span>
                                    </div>
                                    <div className="analytics-item">
                                        <span className="label">Talk Ratio:</span>
                                        <span className="value neutral">{callAnalytics.talkRatio}</span>
                                    </div>
                                    <div className="analytics-item">
                                        <span className="label">Interruptions:</span>
                                        <span className="value negative">{callAnalytics.interruptions}</span>
                                    </div>
                                    <div className="analytics-item">
                                        <span className="label">Sentiment:</span>
                                        <span className="value positive">{callAnalytics.avgSentiment}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="analytics-section">
                                <div className="section-header">
                                    <h4>Compliance</h4>
                                    <span className="export-button">View Report</span>
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Compliance Score:</span>
                                        <span style={{ color: '#22c55e', fontWeight: 600 }}>{callAnalytics.complianceScore}%</span>
                                    </div>
                                    <div style={{ padding: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                                        ✅ PCI-DSS Compliant
                                    </div>
                                    <div style={{ padding: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                                        ✅ GDPR Compliant
                                    </div>
                                    <div style={{ padding: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px', fontSize: '0.8rem' }}>
                                        ✅ No Sensitive Data Exposed
                                    </div>
                                </div>
                            </div>
                        </CallAnalytics>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Emotion Analysis</h3>
                        <EmotionAnalysis>
                            {emotions.map(emotion => (
                                <div key={emotion.id} className="emotion-item">
                                    <div className={`emotion-icon ${emotion.type}`}>
                                        {emotion.type === 'positive' && '😊'}
                                        {emotion.type === 'neutral' && '😐'}
                                        {emotion.type === 'negative' && '😟'}
                                    </div>
                                    <div className="emotion-info">
                                        <div className="emotion-name">{emotion.name}</div>
                                        <div className="emotion-description">{emotion.description}</div>
                                    </div>
                                    <div className="emotion-score">
                                        {emotion.score}%
                                    </div>
                                </div>
                            ))}
                        </EmotionAnalysis>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Performance Metrics</h3>
                        <CallMetricsGrid>
                            <div className="metric-card">
                                <div className="metric-value">{callMetrics?.avgCallDuration || '8:42'}</div>
                                <div className="metric-label">Avg Call Duration</div>
                                <div className="metric-trend improving">-12% vs last week</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{callMetrics?.resolutionRate || '94%'}</div>
                                <div className="metric-label">Resolution Rate</div>
                                <div className="metric-trend improving">+3% vs last week</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{callMetrics?.customerSatisfaction || '4.7'}</div>
                                <div className="metric-label">Customer Satisfaction</div>
                                <div className="metric-trend stable">Stable</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{callMetrics?.complianceScore || '98%'}</div>
                                <div className="metric-label">Compliance Score</div>
                                <div className="metric-trend improving">+1% vs last week</div>
                            </div>
                        </CallMetricsGrid>
                    </GlassCard>
                </LeftPanel>

                {/* Center Panel - Voice Visualizer & Live Transcript */}
                <CenterPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Voice Visualizer</h3>
                        <VoiceVisualizer>
                            <div className="voice-content">
                                <div className="voice-display">
                                    <div className="voice-metrics">
                                        <div className="metric">
                                            <div className="value">{currentMetrics.volume}%</div>
                                            <div className="label">Volume</div>
                                        </div>
                                        <div className="metric">
                                            <div className="value">{currentMetrics.clarity}%</div>
                                            <div className="label">Clarity</div>
                                        </div>
                                        <div className="metric">
                                            <div className="value">{currentMetrics.pace}</div>
                                            <div className="label">WPM</div>
                                        </div>
                                        <div className="metric">
                                            <div className="value">{currentMetrics.sentiment}</div>
                                            <div className="label">Sentiment</div>
                                        </div>
                                    </div>

                                    <div className="waveform-container">
                                        {Array.from({ length: 50 }, (_, i) => (
                                            <div
                                                key={i}
                                                className="wave-bar"
                                                style={{
                                                    height: `${Math.random() * 100 + 20}px`,
                                                    animationDelay: `${i * 0.05}s`
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </VoiceVisualizer>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Live Transcript</h3>
                        <LiveTranscript>
                            <div className="transcript-container">
                                {transcript.map(line => (
                                    <div key={line.id} className="transcript-line">
                                        <div className="speaker">{line.speaker}:</div>
                                        <div className="text">{line.text}</div>
                                        <div className="metadata">
                                            <span className="timestamp">{line.timestamp}</span>
                                            <span className="emotion">{line.emotion}</span>
                                            <span className="confidence">{line.confidence}% confidence</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </LiveTranscript>
                    </GlassCard>
                </CenterPanel>

                {/* Right Panel - Voice Insights & Actions */}
                <RightPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>AI Voice Insights</h3>
                        <VoiceInsights>
                            <div className="insight-item">
                                <div className="insight-header">
                                    <span className="insight-type">Coaching</span>
                                    <span className="confidence">91% confidence</span>
                                </div>
                                <div className="insight-content">
                                    Customer seems interested but has price concerns. Consider offering a trial or discount to close the deal.
                                </div>
                                <div className="insight-actions">
                                    <button className="action-button">Apply Suggestion</button>
                                    <button className="action-button">Set Reminder</button>
                                </div>
                            </div>

                            <div className="insight-item">
                                <div className="insight-header">
                                    <span className="insight-type">Compliance</span>
                                    <span className="confidence">99% confidence</span>
                                </div>
                                <div className="insight-content">
                                    All required disclosures have been properly communicated. Call is fully compliant with regulations.
                                </div>
                                <div className="insight-actions">
                                    <button className="action-button">View Details</button>
                                    <button className="action-button">Generate Report</button>
                                </div>
                            </div>

                            <div className="insight-item">
                                <div className="insight-header">
                                    <span className="insight-type">Quality</span>
                                    <span className="confidence">87% confidence</span>
                                </div>
                                <div className="insight-content">
                                    Excellent call quality and customer engagement. Agent demonstrated strong product knowledge.
                                </div>
                                <div className="insight-actions">
                                    <button className="action-button">Share Feedback</button>
                                    <button className="action-button">Save as Best Practice</button>
                                </div>
                            </div>
                        </VoiceInsights>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Call Management</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>Call Queue</span>
                                    <span style={{ fontSize: '0.9rem', color: '#7c3aed' }}>3 waiting</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    Average wait time: 2:15
                                </div>
                            </div>

                            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>Active Agents</span>
                                    <span style={{ fontSize: '0.9rem', color: '#22c55e' }}>12 online</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    2 on break, 15 total
                                </div>
                            </div>

                            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>Today's Calls</span>
                                    <span style={{ fontSize: '0.9rem', color: '#06b6d4' }}>247 completed</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    Target: 280 calls
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="primary" fullWidth onClick={handleAnalyzeCall}>
                                🔍 Analyze Call
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth>
                                📊 Generate Report
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📋 Compliance Check
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🎯 Coaching Insights
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📈 Performance Dashboard
                            </GlassButton>
                        </div>
                    </GlassCard>
                </RightPanel>
            </MainGrid>
        </DashboardContainer>
    );
};

export default VoiceIntelligenceDashboard;