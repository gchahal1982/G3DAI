/**
 * G3D VideoAI - Video Intelligence Dashboard
 * Complete enterprise video analysis platform with AI-powered content understanding
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    GlassCard,
    GlassButton,
    GlassInput,
    GlassModal,
    baseGlassmorphismTheme,
    serviceThemeOverrides
} from '../../../shared/ui/src/components/GlassCard';
import {
    VideoAnalysis,
    VideoMetrics,
    ObjectDetection,
    FaceRecognition,
    ActivityRecognition,
    VideoSummary,
    ContentModeration
} from '../types/videoai.types';
import { VideoIntelligenceEngine } from '../services/VideoIntelligenceEngine';

// VideoAI Theme (Purple/Pink video theme)
const videoaiTheme = {
    ...baseGlassmorphismTheme,
    primary: '#a855f7',
    secondary: '#ec4899',
    accent: '#f59e0b',
    glass: {
        background: 'rgba(168, 85, 247, 0.1)',
        border: 'rgba(168, 85, 247, 0.2)',
        blur: '12px'
    }
};

// Animations
const videoProcessing = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

const frameAnalysis = keyframes`
  0%, 100% { border-color: rgba(168, 85, 247, 0.3); }
  50% { border-color: rgba(168, 85, 247, 0.8); }
`;

const recordingPulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.8); }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #2d1b69 0%, #4c1d95 50%, #6b21a8 100%);
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
    background: linear-gradient(135deg, #a855f7, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #a855f7, #ec4899);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
`;

const ProcessingStatus = styled.div`
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
    
    &.idle {
      background: rgba(107, 114, 128, 0.2);
      color: #9ca3af;
    }
    
    &.processing {
      background: rgba(168, 85, 247, 0.2);
      color: #a855f7;
      animation: ${recordingPulse} 2s infinite;
    }
    
    &.analyzing {
      background: rgba(236, 72, 153, 0.2);
      color: #ec4899;
    }
    
    &.completed {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
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

const VideoPlayer = styled.div`
  position: relative;
  min-height: 400px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  overflow: hidden;
  
  .video-container {
    width: 100%;
    height: 100%;
    position: relative;
    
    .video-frame {
      width: 100%;
      height: 350px;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      border: 2px solid rgba(168, 85, 247, 0.3);
      animation: ${frameAnalysis} 3s infinite;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, transparent, #a855f7, transparent);
        animation: ${videoProcessing} 4s infinite;
      }
      
      .video-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .detection-boxes {
          position: absolute;
          inset: 0;
          
          .detection-box {
            position: absolute;
            border: 2px solid #ec4899;
            border-radius: 4px;
            
            &.person { top: 20%; left: 30%; width: 100px; height: 150px; }
            &.vehicle { top: 60%; left: 60%; width: 120px; height: 80px; }
            &.object { top: 40%; left: 10%; width: 60px; height: 60px; }
            
            .label {
              position: absolute;
              top: -25px;
              left: 0;
              background: rgba(236, 72, 153, 0.9);
              color: white;
              padding: 0.25rem 0.5rem;
              border-radius: 4px;
              font-size: 0.8rem;
              font-weight: 600;
            }
          }
        }
      }
    }
    
    .video-controls {
      padding: 1rem;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 1rem;
      
      .play-button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #a855f7, #ec4899);
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
      }
      
      .progress-bar {
        flex: 1;
        height: 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #a855f7, #ec4899);
          width: 35%;
          border-radius: 3px;
        }
      }
      
      .time-display {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
`;

const VideoLibrary = styled.div`
  .video-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(168, 85, 247, 0.1);
    }
    
    &.selected {
      background: rgba(168, 85, 247, 0.2);
      border: 1px solid #a855f7;
    }
    
    .video-thumbnail {
      width: 60px;
      height: 40px;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      position: relative;
      
      .duration {
        position: absolute;
        bottom: 2px;
        right: 2px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 0.6rem;
        padding: 0.1rem 0.3rem;
        border-radius: 2px;
      }
    }
    
    .video-info {
      flex: 1;
      
      .video-title {
        font-weight: 600;
        margin-bottom: 0.25rem;
        font-size: 0.9rem;
      }
      
      .video-details {
        font-size: 0.7rem;
        opacity: 0.7;
        display: flex;
        gap: 0.75rem;
      }
    }
    
    .analysis-status {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.6rem;
      
      &.completed { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
      &.processing { background: rgba(168, 85, 247, 0.2); color: #a855f7; }
      &.pending { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }
    }
  }
`;

const AnalysisResults = styled.div`
  .analysis-section {
    margin-bottom: 1.5rem;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      
      h4 {
        margin: 0;
        font-size: 1rem;
        color: #a855f7;
      }
      
      .confidence-score {
        font-size: 0.8rem;
        color: #22c55e;
        font-weight: 600;
      }
    }
    
    .detection-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      .detection-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        
        .detection-label {
          font-size: 0.9rem;
        }
        
        .detection-confidence {
          font-size: 0.8rem;
          color: #22c55e;
        }
      }
    }
    
    .activity-timeline {
      .timeline-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        margin-bottom: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        
        .timestamp {
          font-size: 0.8rem;
          color: #a855f7;
          font-weight: 600;
          min-width: 60px;
        }
        
        .activity-description {
          flex: 1;
          font-size: 0.9rem;
        }
      }
    }
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  .metric-card {
    padding: 1.5rem;
    background: rgba(168, 85, 247, 0.1);
    border-radius: 8px;
    text-align: center;
    
    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: #a855f7;
      margin-bottom: 0.5rem;
    }
    
    .metric-label {
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    .metric-change {
      font-size: 0.8rem;
      margin-top: 0.25rem;
      
      &.positive { color: #22c55e; }
      &.negative { color: #ef4444; }
    }
  }
`;

const ProcessingQueue = styled.div`
  .queue-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    margin-bottom: 0.5rem;
    
    .queue-icon {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      background: rgba(168, 85, 247, 0.2);
    }
    
    .queue-info {
      flex: 1;
      
      .queue-title {
        font-weight: 600;
        margin-bottom: 0.25rem;
        font-size: 0.9rem;
      }
      
      .queue-progress {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #a855f7, #ec4899);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
      }
    }
    
    .queue-status {
      font-size: 0.8rem;
      color: #a855f7;
    }
  }
`;

// Main Component
export const VideoIntelligenceDashboard: React.FC = () => {
    // State Management
    const [selectedVideo, setSelectedVideo] = useState<string>('');
    const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'analyzing' | 'completed'>('idle');
    const [isPlaying, setIsPlaying] = useState(false);
    const [analysisResults, setAnalysisResults] = useState<VideoAnalysis | null>(null);
    const [metrics, setMetrics] = useState<VideoMetrics | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Refs
    const videoEngine = useRef(new VideoIntelligenceEngine());

    // Sample videos
    const videos = [
        {
            id: 'video-001',
            title: 'Security Camera Feed #1',
            duration: '2:45',
            size: '125 MB',
            type: 'Security',
            uploaded: '2 hours ago',
            status: 'completed' as const
        },
        {
            id: 'video-002',
            title: 'Product Demo Video',
            duration: '5:20',
            size: '340 MB',
            type: 'Marketing',
            uploaded: '4 hours ago',
            status: 'completed' as const
        },
        {
            id: 'video-003',
            title: 'Training Session Recording',
            duration: '45:12',
            size: '2.1 GB',
            type: 'Training',
            uploaded: '1 day ago',
            status: 'processing' as const
        },
        {
            id: 'video-004',
            title: 'Customer Interview',
            duration: '12:30',
            size: '560 MB',
            type: 'Interview',
            uploaded: '2 days ago',
            status: 'pending' as const
        }
    ];

    // Event Handlers
    const handleAnalyzeVideo = useCallback(async () => {
        if (!selectedVideo || processingStatus === 'processing') return;

        setProcessingStatus('processing');

        try {
            const analysis = await videoEngine.current.analyzeVideo({
                videoId: selectedVideo,
                analysisTypes: ['objects', 'faces', 'activities', 'content']
            });

            setAnalysisResults(analysis);
            setProcessingStatus('completed');

        } catch (error) {
            console.error('Video analysis failed:', error);
            setProcessingStatus('idle');
        }
    }, [selectedVideo, processingStatus]);

    // Load video metrics
    useEffect(() => {
        const loadMetrics = async () => {
            try {
                const videoMetrics = await videoEngine.current.getVideoMetrics();
                setMetrics(videoMetrics);
            } catch (error) {
                console.error('Failed to load video metrics:', error);
            }
        };

        loadMetrics();
        const interval = setInterval(loadMetrics, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">🎥</div>
                    <h1>G3D VideoAI Intelligence</h1>
                </Logo>
                <ProcessingStatus>
                    <div className={`status-indicator ${processingStatus}`}>
                        <div className="dot" />
                        <span>Status: {processingStatus.toUpperCase()}</span>
                    </div>
                    <GlassButton
                        variant="secondary"
                        onClick={() => setShowUploadModal(true)}
                        theme={videoaiTheme}
                    >
                        📁 Upload Video
                    </GlassButton>
                    <GlassButton
                        variant="primary"
                        onClick={handleAnalyzeVideo}
                        disabled={processingStatus === 'processing' || !selectedVideo}
                        theme={videoaiTheme}
                    >
                        {processingStatus === 'processing' ? '⏳ Analyzing...' : '🔍 Analyze Video'}
                    </GlassButton>
                </ProcessingStatus>
            </Header>

            <MainGrid>
                {/* Left Panel - Video Library */}
                <LeftPanel>
                    <GlassCard size="lg" theme={videoaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Video Library</h3>
                        <VideoLibrary>
                            {videos.map(video => (
                                <div
                                    key={video.id}
                                    className={`video-item ${selectedVideo === video.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedVideo(video.id)}
                                >
                                    <div className="video-thumbnail">
                                        🎥
                                        <div className="duration">{video.duration}</div>
                                    </div>
                                    <div className="video-info">
                                        <div className="video-title">{video.title}</div>
                                        <div className="video-details">
                                            <span>{video.type}</span>
                                            <span>{video.size}</span>
                                            <span>{video.uploaded}</span>
                                        </div>
                                    </div>
                                    <div className={`analysis-status ${video.status}`}>
                                        {video.status}
                                    </div>
                                </div>
                            ))}
                        </VideoLibrary>
                    </GlassCard>

                    <GlassCard size="lg" theme={videoaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Processing Queue</h3>
                        <ProcessingQueue>
                            <div className="queue-item">
                                <div className="queue-icon">🎬</div>
                                <div className="queue-info">
                                    <div className="queue-title">Training Session Analysis</div>
                                    <div className="queue-progress">
                                        <div className="progress-fill" style={{ width: '75%' }}></div>
                                    </div>
                                </div>
                                <div className="queue-status">75%</div>
                            </div>
                            <div className="queue-item">
                                <div className="queue-icon">📹</div>
                                <div className="queue-info">
                                    <div className="queue-title">Customer Interview Processing</div>
                                    <div className="queue-progress">
                                        <div className="progress-fill" style={{ width: '0%' }}></div>
                                    </div>
                                </div>
                                <div className="queue-status">Queued</div>
                            </div>
                        </ProcessingQueue>
                    </GlassCard>

                    <GlassCard size="lg" theme={videoaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Video Analytics</h3>
                        <MetricsGrid>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.totalVideos || '156'}</div>
                                <div className="metric-label">Total Videos</div>
                                <div className="metric-change positive">+23</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.hoursProcessed || '1,247'}h</div>
                                <div className="metric-label">Hours Processed</div>
                                <div className="metric-change positive">+89h</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.objectsDetected || '15.2K'}</div>
                                <div className="metric-label">Objects Detected</div>
                                <div className="metric-change positive">+2.1K</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.accuracy || '94.8'}%</div>
                                <div className="metric-label">Detection Accuracy</div>
                                <div className="metric-change positive">+1.2%</div>
                            </div>
                        </MetricsGrid>
                    </GlassCard>
                </LeftPanel>

                {/* Center Panel - Video Player */}
                <CenterPanel>
                    <GlassCard size="lg" theme={videoaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Video Player & Analysis</h3>
                        <VideoPlayer>
                            <div className="video-container">
                                <div className="video-frame">
                                    <div className="video-overlay">
                                        <div className="detection-boxes">
                                            <div className="detection-box person">
                                                <div className="label">Person (94%)</div>
                                            </div>
                                            <div className="detection-box vehicle">
                                                <div className="label">Vehicle (87%)</div>
                                            </div>
                                            <div className="detection-box object">
                                                <div className="label">Object (76%)</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center', opacity: 0.6, zIndex: 1 }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎥</div>
                                            <div style={{ fontSize: '1.2rem' }}>Real-time Video Analysis</div>
                                            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                                AI-powered object detection and activity recognition
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="video-controls">
                                    <button
                                        className="play-button"
                                        onClick={() => setIsPlaying(!isPlaying)}
                                    >
                                        {isPlaying ? '⏸️' : '▶️'}
                                    </button>
                                    <div className="progress-bar">
                                        <div className="progress-fill"></div>
                                    </div>
                                    <div className="time-display">01:23 / 02:45</div>
                                </div>
                            </div>
                        </VideoPlayer>
                    </GlassCard>

                    <GlassCard size="lg" theme={videoaiTheme}>
                        <h3 style={{ marginTop: 0 }}>AI Analysis Tools</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            <GlassButton variant="ghost" fullWidth theme={videoaiTheme}>
                                👥 Face Recognition
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={videoaiTheme}>
                                🚗 Object Detection
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={videoaiTheme}>
                                🏃 Activity Recognition
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={videoaiTheme}>
                                🔍 Content Analysis
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={videoaiTheme}>
                                📝 Auto Transcription
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={videoaiTheme}>
                                🏷️ Auto Tagging
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={videoaiTheme}>
                                📊 Scene Analysis
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={videoaiTheme}>
                                🛡️ Content Moderation
                            </GlassButton>
                        </div>
                    </GlassCard>
                </CenterPanel>

                {/* Right Panel - Analysis Results */}
                <RightPanel>
                    <GlassCard size="lg" theme={videoaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Analysis Results</h3>
                        <AnalysisResults>
                            <div className="analysis-section">
                                <div className="section-header">
                                    <h4>Object Detection</h4>
                                    <span className="confidence-score">Avg: 89.2%</span>
                                </div>
                                <div className="detection-list">
                                    <div className="detection-item">
                                        <span className="detection-label">👥 People</span>
                                        <span className="detection-confidence">94%</span>
                                    </div>
                                    <div className="detection-item">
                                        <span className="detection-label">🚗 Vehicles</span>
                                        <span className="detection-confidence">87%</span>
                                    </div>
                                    <div className="detection-item">
                                        <span className="detection-label">📱 Electronics</span>
                                        <span className="detection-confidence">76%</span>
                                    </div>
                                    <div className="detection-item">
                                        <span className="detection-label">🪑 Furniture</span>
                                        <span className="detection-confidence">82%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="analysis-section">
                                <div className="section-header">
                                    <h4>Activity Timeline</h4>
                                    <span className="confidence-score">Real-time</span>
                                </div>
                                <div className="activity-timeline">
                                    <div className="timeline-item">
                                        <span className="timestamp">00:15</span>
                                        <span className="activity-description">Person enters frame</span>
                                    </div>
                                    <div className="timeline-item">
                                        <span className="timestamp">00:42</span>
                                        <span className="activity-description">Object interaction detected</span>
                                    </div>
                                    <div className="timeline-item">
                                        <span className="timestamp">01:23</span>
                                        <span className="activity-description">Vehicle movement detected</span>
                                    </div>
                                    <div className="timeline-item">
                                        <span className="timestamp">02:01</span>
                                        <span className="activity-description">Multiple people detected</span>
                                    </div>
                                </div>
                            </div>

                            <div className="analysis-section">
                                <div className="section-header">
                                    <h4>Content Summary</h4>
                                    <span className="confidence-score">AI Generated</span>
                                </div>
                                <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.4 }}>
                                        Security footage showing normal office activity. Multiple people entering and
                                        exiting the frame, with typical workplace interactions. No suspicious activities
                                        detected. Overall scene classification: Normal workplace environment.
                                    </p>
                                </div>
                            </div>
                        </AnalysisResults>
                    </GlassCard>

                    <GlassCard size="lg" theme={videoaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="primary" fullWidth theme={videoaiTheme}>
                                📤 Export Analysis
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth theme={videoaiTheme}>
                                📊 Generate Report
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={videoaiTheme}>
                                🔗 Share Results
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={videoaiTheme}>
                                ⚙️ Analysis Settings
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={videoaiTheme}>
                                📋 Create Highlights
                            </GlassButton>
                        </div>
                    </GlassCard>
                </RightPanel>
            </MainGrid>

            {/* Upload Modal */}
            <GlassModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                title="Upload Video"
                size="lg"
                theme={videoaiTheme}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <h4>Upload Video for Analysis</h4>
                        <p>Select video files to upload and analyze with AI-powered intelligence.</p>
                    </div>

                    <div style={{
                        border: '2px dashed rgba(168, 85, 247, 0.3)',
                        borderRadius: '8px',
                        padding: '2rem',
                        textAlign: 'center',
                        background: 'rgba(168, 85, 247, 0.05)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                        <div style={{ marginBottom: '0.5rem' }}>Drag and drop video files here</div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                            Supported formats: MP4, MOV, AVI, MKV (Max 2GB)
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" defaultChecked />
                            Enable object detection
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" defaultChecked />
                            Enable face recognition
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" />
                            Enable activity recognition
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" />
                            Enable content moderation
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <GlassButton
                            variant="ghost"
                            onClick={() => setShowUploadModal(false)}
                            theme={videoaiTheme}
                        >
                            Cancel
                        </GlassButton>
                        <GlassButton
                            variant="primary"
                            onClick={() => setShowUploadModal(false)}
                            theme={videoaiTheme}
                        >
                            Upload & Analyze
                        </GlassButton>
                    </div>
                </div>
            </GlassModal>
        </DashboardContainer>
    );
};

export default VideoIntelligenceDashboard;