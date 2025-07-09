/**
 * G3D EdgeAI - Edge Computing Dashboard
 * Complete edge computing platform with distributed AI inference and device management
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

// EdgeAI Theme (Edge computing cyan/blue theme)
const edgeaiTheme = {
    primary: '#06b6d4',
    secondary: '#0891b2',
    accent: '#67e8f9',
    glass: {
        background: 'rgba(6, 182, 212, 0.1)',
        border: 'rgba(6, 182, 212, 0.2)',
        blur: '12px'
    }
};

// Animations
const edgeNetwork = keyframes`
  0% { transform: scale(1) rotate(0deg); opacity: 0.7; }
  50% { transform: scale(1.1) rotate(180deg); opacity: 1; }
  100% { transform: scale(1) rotate(360deg); opacity: 0.7; }
`;

const dataFlow = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

const computePulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(6, 182, 212, 0.3); }
  50% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.8); }
`;

const nodeConnection = keyframes`
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #164e63 0%, #0c4a6e 50%, #06b6d4 100%);
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
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: ${edgeNetwork} 6s infinite;
  }
`;

const NetworkStatus = styled.div`
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
    
    &.computing {
      background: rgba(6, 182, 212, 0.2);
      color: #06b6d4;
      animation: ${computePulse} 2s infinite;
    }
    
    &.online {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }
    
    &.offline {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
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
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 12px;
  padding: ${props =>
        props.size === 'sm' ? '1rem' :
            props.size === 'lg' ? '2rem' : '1.5rem'};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const NetworkTopology = styled.div`
  position: relative;
  min-height: 400px;
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5));
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(6, 182, 212, 0.3);
  
  .topology-content {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 1rem;
    
    .network-visualization {
      width: 100%;
      height: 350px;
      position: relative;
      
      .edge-node {
        position: absolute;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(8, 145, 178, 0.3));
        border: 2px solid rgba(6, 182, 212, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.1);
          border-color: #06b6d4;
        }
        
        &.active {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.5), rgba(8, 145, 178, 0.5));
          animation: ${computePulse} 2s infinite;
        }
        
        &.cloud {
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(124, 58, 237, 0.3));
          border-color: rgba(147, 51, 234, 0.5);
        }
        
        &.edge-1 { top: 45%; left: 15%; }
        &.edge-2 { top: 45%; right: 15%; }
        &.edge-3 { bottom: 20%; left: 25%; }
        &.edge-4 { bottom: 20%; right: 25%; }
        &.edge-5 { top: 65%; left: 50%; transform: translateX(-50%); }
        
        .node-icon {
          font-size: 1.2rem;
          color: #06b6d4;
        }
        
        .node-label {
          position: absolute;
          bottom: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7rem;
          white-space: nowrap;
          background: rgba(0, 0, 0, 0.5);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }
        
        .node-status {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          
          &.online { background: #22c55e; }
          &.computing { background: #06b6d4; animation: ${computePulse} 1s infinite; }
          &.offline { background: #ef4444; }
        }
      }
      
      .connection-line {
        position: absolute;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent);
        transform-origin: left center;
        
        &.data-flowing {
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -20px;
            width: 20px;
            height: 100%;
            background: linear-gradient(90deg, transparent, #06b6d4);
            animation: ${dataFlow} 2s infinite;
          }
        }
      }
    }
    
    .topology-controls {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      gap: 0.5rem;
      
      .control-button {
        width: 36px;
        height: 36px;
        background: rgba(6, 182, 212, 0.2);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 6px;
        color: #06b6d4;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(6, 182, 212, 0.3);
        }
      }
    }
  }
`;

const EdgeDevices = styled.div`
  .device-item {
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
      background: rgba(6, 182, 212, 0.1);
      transform: translateX(4px);
    }
    
    .device-icon {
      width: 45px;
      height: 45px;
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(8, 145, 178, 0.3));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      color: #06b6d4;
      animation: ${edgeNetwork} 4s infinite;
    }
    
    .device-info {
      flex: 1;
      
      .device-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
        color: #06b6d4;
      }
      
      .device-details {
        font-size: 0.8rem;
        opacity: 0.7;
        display: flex;
        gap: 1rem;
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
      }
    }
    
    .device-metrics {
      display: flex;
      flex-direction: column;
      align-items: end;
      gap: 0.25rem;
      
      .metric-value {
        font-size: 0.9rem;
        font-weight: 600;
        
        &.high { color: #ef4444; }
        &.medium { color: #f59e0b; }
        &.low { color: #22c55e; }
      }
      
      .metric-label {
        font-size: 0.7rem;
        opacity: 0.7;
      }
    }
  }
`;

const ComputeMetrics = styled.div`
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
    
    .metric-card {
      padding: 1rem;
      background: rgba(6, 182, 212, 0.1);
      border-radius: 8px;
      text-align: center;
      
      .metric-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #06b6d4;
        margin-bottom: 0.25rem;
      }
      
      .metric-label {
        font-size: 0.8rem;
        opacity: 0.8;
      }
      
      .metric-trend {
        font-size: 0.7rem;
        margin-top: 0.25rem;
        
        &.improving { color: #22c55e; }
        &.declining { color: #ef4444; }
        &.stable { color: #67e8f9; }
      }
    }
  }
  
  .performance-chart {
    height: 120px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    
    .chart-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 60%;
      background: linear-gradient(to right, 
        rgba(6, 182, 212, 0.3) 0%,
        rgba(6, 182, 212, 0.5) 25%,
        rgba(6, 182, 212, 0.4) 50%,
        rgba(6, 182, 212, 0.6) 75%,
        rgba(6, 182, 212, 0.3) 100%);
      clip-path: polygon(
        0% 100%, 0% 70%, 10% 65%, 20% 80%, 30% 60%, 40% 75%, 
        50% 55%, 60% 70%, 70% 50%, 80% 65%, 90% 45%, 100% 60%, 100% 100%
      );
    }
    
    .chart-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .chart-label {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
  }
`;

const AIInference = styled.div`
  .inference-item {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    border-left: 4px solid #06b6d4;
    
    .inference-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      
      .model-name {
        font-weight: 600;
        color: #06b6d4;
      }
      
      .inference-status {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.7rem;
        
        &.running {
          background: rgba(6, 182, 212, 0.2);
          color: #06b6d4;
        }
        
        &.idle {
          background: rgba(156, 163, 175, 0.2);
          color: #9ca3af;
        }
        
        &.error {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
      }
    }
    
    .inference-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      font-size: 0.8rem;
      
      .metric-item {
        display: flex;
        justify-content: space-between;
        
        .metric-label {
          opacity: 0.7;
        }
        
        .metric-value {
          font-weight: 600;
          color: #06b6d4;
        }
      }
    }
    
    .inference-progress {
      margin-top: 0.75rem;
      
      .progress-bar {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #06b6d4, #67e8f9);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
      }
    }
  }
`;

const ResourceMonitoring = styled.div`
  .resource-section {
    margin-bottom: 1.5rem;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      
      h4 {
        margin: 0;
        font-size: 1rem;
        color: #06b6d4;
      }
      
      .view-all {
        font-size: 0.8rem;
        color: #67e8f9;
        cursor: pointer;
        
        &:hover {
          color: #06b6d4;
        }
      }
    }
    
    .resource-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      margin-bottom: 0.5rem;
      
      .resource-label {
        font-size: 0.9rem;
        opacity: 0.8;
      }
      
      .resource-usage {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        .usage-bar {
          width: 60px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          
          .usage-fill {
            height: 100%;
            border-radius: 3px;
            transition: width 0.3s ease;
            
            &.low { background: #22c55e; }
            &.medium { background: #f59e0b; }
            &.high { background: #ef4444; }
          }
        }
        
        .usage-value {
          font-size: 0.8rem;
          font-weight: 600;
          min-width: 40px;
          text-align: right;
          
          &.low { color: #22c55e; }
          &.medium { color: #f59e0b; }
          &.high { color: #ef4444; }
        }
      }
    }
  }
`;

const GlassButton = styled.button<{ variant?: 'primary' | 'secondary' | 'ghost'; fullWidth?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(6, 182, 212, 0.3);
  background: ${props =>
        props.variant === 'primary' ? 'rgba(6, 182, 212, 0.2)' :
            props.variant === 'secondary' ? 'rgba(8, 145, 178, 0.2)' :
                'rgba(255, 255, 255, 0.1)'};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  &:hover {
    background: ${props =>
        props.variant === 'primary' ? 'rgba(6, 182, 212, 0.3)' :
            props.variant === 'secondary' ? 'rgba(8, 145, 178, 0.3)' :
                'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-2px);
  }
`;

// Main Component
export const EdgeAIComputingDashboard: React.FC = () => {
    // State Management
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [networkStatus, setNetworkStatus] = useState('computing');
    const [edgeDevices, setEdgeDevices] = useState([
        {
            id: 'edge-001',
            name: 'Edge Node Alpha',
            type: 'GPU Cluster',
            status: 'online',
            cpu: 78,
            gpu: 85,
            memory: 67,
            latency: '12ms',
            throughput: '1.2K/s',
            icon: '🖥️'
        },
        {
            id: 'edge-002',
            name: 'Edge Node Beta',
            type: 'IoT Gateway',
            status: 'computing',
            cpu: 45,
            gpu: 0,
            memory: 34,
            latency: '8ms',
            throughput: '850/s',
            icon: '📡'
        },
        {
            id: 'edge-003',
            name: 'Mobile Edge',
            type: 'Mobile Device',
            status: 'online',
            cpu: 23,
            gpu: 56,
            memory: 45,
            latency: '15ms',
            throughput: '420/s',
            icon: '📱'
        },
        {
            id: 'edge-004',
            name: 'Edge Node Gamma',
            type: 'Embedded System',
            status: 'offline',
            cpu: 0,
            gpu: 0,
            memory: 0,
            latency: '∞',
            throughput: '0/s',
            icon: '🔧'
        }
    ]);

    // Sample AI inference jobs
    const inferenceJobs = [
        {
            id: 'job-001',
            modelName: 'YOLOv8 Object Detection',
            status: 'running',
            progress: 75,
            latency: '23ms',
            accuracy: '94.2%',
            throughput: '45 FPS'
        },
        {
            id: 'job-002',
            modelName: 'BERT Text Classification',
            status: 'running',
            progress: 60,
            latency: '18ms',
            accuracy: '97.8%',
            throughput: '120 req/s'
        },
        {
            id: 'job-003',
            modelName: 'ResNet Image Recognition',
            status: 'idle',
            progress: 0,
            latency: '-',
            accuracy: '96.5%',
            throughput: '0 req/s'
        }
    ];

    // Compute metrics
    const computeMetrics = {
        totalNodes: 12,
        activeNodes: 9,
        totalInferences: 47832,
        avgLatency: '15ms'
    };

    // Event Handlers
    const handleNodeSelect = useCallback((nodeId: string) => {
        setSelectedNode(nodeId);
    }, []);

    const handleDeployModel = useCallback(() => {
        console.log('Deploying AI model to edge nodes...');
    }, []);

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">🌐</div>
                    <h1>G3D EdgeAI Computing</h1>
                </Logo>
                <NetworkStatus>
                    <div className={`status-indicator ${networkStatus}`}>
                        <div className="dot" />
                        <span>{networkStatus === 'computing' ? 'Computing' : 'Online'}</span>
                    </div>
                    <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                        {computeMetrics.activeNodes}/{computeMetrics.totalNodes} nodes active
                    </span>
                    <GlassButton
                        variant="primary"
                        onClick={handleDeployModel}
                    >
                        🚀 Deploy Model
                    </GlassButton>
                </NetworkStatus>
            </Header>

            <MainGrid>
                {/* Left Panel - Edge Devices & Metrics */}
                <LeftPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Edge Devices</h3>
                        <EdgeDevices>
                            {edgeDevices.map(device => (
                                <div
                                    key={device.id}
                                    className="device-item"
                                    onClick={() => handleNodeSelect(device.id)}
                                >
                                    <div className="device-icon">
                                        {device.icon}
                                    </div>
                                    <div className="device-info">
                                        <div className="device-name">{device.name}</div>
                                        <div className="device-details">
                                            <div className="detail-item">
                                                <span>📊</span>
                                                <span>{device.type}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span>⚡</span>
                                                <span>{device.latency}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="device-metrics">
                                        <div className={`metric-value ${device.cpu > 70 ? 'high' : device.cpu > 40 ? 'medium' : 'low'}`}>
                                            {device.cpu}%
                                        </div>
                                        <div className="metric-label">CPU</div>
                                    </div>
                                </div>
                            ))}
                        </EdgeDevices>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Compute Metrics</h3>
                        <ComputeMetrics>
                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-value">{computeMetrics.totalNodes}</div>
                                    <div className="metric-label">Total Nodes</div>
                                    <div className="metric-trend stable">Stable</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-value">{computeMetrics.activeNodes}</div>
                                    <div className="metric-label">Active Nodes</div>
                                    <div className="metric-trend improving">+2 today</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-value">{computeMetrics.totalInferences.toLocaleString()}</div>
                                    <div className="metric-label">Total Inferences</div>
                                    <div className="metric-trend improving">+15% this hour</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-value">{computeMetrics.avgLatency}</div>
                                    <div className="metric-label">Avg Latency</div>
                                    <div className="metric-trend improving">-3ms today</div>
                                </div>
                            </div>

                            <div className="performance-chart">
                                <div className="chart-line" />
                                <div className="chart-overlay">
                                    <div className="chart-label">Network Performance (24h)</div>
                                </div>
                            </div>
                        </ComputeMetrics>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="secondary" fullWidth>
                                📤 Upload Model
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🔧 Configure Nodes
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📊 View Analytics
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                ⚙️ Network Settings
                            </GlassButton>
                        </div>
                    </GlassCard>
                </LeftPanel>

                {/* Center Panel - Network Topology */}
                <CenterPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Network Topology</h3>
                        <NetworkTopology>
                            <div className="topology-content">
                                <div className="network-visualization">
                                    {/* Cloud Node */}
                                    <div className="edge-node cloud">
                                        <div className="node-icon">☁️</div>
                                        <div className="node-label">Cloud Hub</div>
                                        <div className="node-status online" />
                                    </div>

                                    {/* Edge Nodes */}
                                    <div className="edge-node edge-1 active">
                                        <div className="node-icon">🖥️</div>
                                        <div className="node-label">Edge Alpha</div>
                                        <div className="node-status computing" />
                                    </div>

                                    <div className="edge-node edge-2">
                                        <div className="node-icon">📡</div>
                                        <div className="node-label">Edge Beta</div>
                                        <div className="node-status online" />
                                    </div>

                                    <div className="edge-node edge-3">
                                        <div className="node-icon">📱</div>
                                        <div className="node-label">Mobile Edge</div>
                                        <div className="node-status online" />
                                    </div>

                                    <div className="edge-node edge-4">
                                        <div className="node-icon">🔧</div>
                                        <div className="node-label">Edge Gamma</div>
                                        <div className="node-status offline" />
                                    </div>

                                    <div className="edge-node edge-5">
                                        <div className="node-icon">🌐</div>
                                        <div className="node-label">IoT Gateway</div>
                                        <div className="node-status computing" />
                                    </div>

                                    {/* Connection Lines */}
                                    <div
                                        className="connection-line data-flowing"
                                        style={{
                                            top: '35%',
                                            left: '50%',
                                            width: '150px',
                                            transform: 'translateX(-50%) rotate(45deg)'
                                        }}
                                    />
                                    <div
                                        className="connection-line"
                                        style={{
                                            top: '35%',
                                            right: '50%',
                                            width: '150px',
                                            transform: 'translateX(50%) rotate(-45deg)'
                                        }}
                                    />
                                </div>

                                <div className="topology-controls">
                                    <div className="control-button" title="Refresh">🔄</div>
                                    <div className="control-button" title="Zoom">🔍</div>
                                    <div className="control-button" title="Layout">📐</div>
                                </div>
                            </div>
                        </NetworkTopology>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>AI Inference Jobs</h3>
                        <AIInference>
                            {inferenceJobs.map(job => (
                                <div key={job.id} className="inference-item">
                                    <div className="inference-header">
                                        <span className="model-name">{job.modelName}</span>
                                        <span className={`inference-status ${job.status}`}>
                                            {job.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="inference-metrics">
                                        <div className="metric-item">
                                            <span className="metric-label">Latency:</span>
                                            <span className="metric-value">{job.latency}</span>
                                        </div>
                                        <div className="metric-item">
                                            <span className="metric-label">Accuracy:</span>
                                            <span className="metric-value">{job.accuracy}</span>
                                        </div>
                                        <div className="metric-item">
                                            <span className="metric-label">Throughput:</span>
                                            <span className="metric-value">{job.throughput}</span>
                                        </div>
                                    </div>
                                    {job.status === 'running' && (
                                        <div className="inference-progress">
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${job.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </AIInference>
                    </GlassCard>
                </CenterPanel>

                {/* Right Panel - Resource Monitoring */}
                <RightPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Resource Monitoring</h3>
                        <ResourceMonitoring>
                            <div className="resource-section">
                                <div className="section-header">
                                    <h4>System Resources</h4>
                                    <span className="view-all">View All</span>
                                </div>
                                <div className="resource-item">
                                    <span className="resource-label">CPU Usage</span>
                                    <div className="resource-usage">
                                        <div className="usage-bar">
                                            <div className="usage-fill high" style={{ width: '78%' }} />
                                        </div>
                                        <span className="usage-value high">78%</span>
                                    </div>
                                </div>
                                <div className="resource-item">
                                    <span className="resource-label">GPU Usage</span>
                                    <div className="resource-usage">
                                        <div className="usage-bar">
                                            <div className="usage-fill medium" style={{ width: '65%' }} />
                                        </div>
                                        <span className="usage-value medium">65%</span>
                                    </div>
                                </div>
                                <div className="resource-item">
                                    <span className="resource-label">Memory</span>
                                    <div className="resource-usage">
                                        <div className="usage-bar">
                                            <div className="usage-fill low" style={{ width: '42%' }} />
                                        </div>
                                        <span className="usage-value low">42%</span>
                                    </div>
                                </div>
                                <div className="resource-item">
                                    <span className="resource-label">Network I/O</span>
                                    <div className="resource-usage">
                                        <div className="usage-bar">
                                            <div className="usage-fill medium" style={{ width: '56%' }} />
                                        </div>
                                        <span className="usage-value medium">56%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="resource-section">
                                <div className="section-header">
                                    <h4>Edge Performance</h4>
                                    <span className="view-all">Details</span>
                                </div>
                                <div className="resource-item">
                                    <span className="resource-label">Inference Rate</span>
                                    <div className="resource-usage">
                                        <div className="usage-bar">
                                            <div className="usage-fill low" style={{ width: '85%' }} />
                                        </div>
                                        <span className="usage-value low">1.2K/s</span>
                                    </div>
                                </div>
                                <div className="resource-item">
                                    <span className="resource-label">Model Accuracy</span>
                                    <div className="resource-usage">
                                        <div className="usage-bar">
                                            <div className="usage-fill low" style={{ width: '96%' }} />
                                        </div>
                                        <span className="usage-value low">96%</span>
                                    </div>
                                </div>
                                <div className="resource-item">
                                    <span className="resource-label">Cache Hit Rate</span>
                                    <div className="resource-usage">
                                        <div className="usage-bar">
                                            <div className="usage-fill low" style={{ width: '88%' }} />
                                        </div>
                                        <span className="usage-value low">88%</span>
                                    </div>
                                </div>
                            </div>
                        </ResourceMonitoring>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Model Repository</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>Available Models</span>
                                    <span style={{ fontSize: '0.9rem', color: '#06b6d4' }}>24 models</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    Ready for deployment
                                </div>
                            </div>

                            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>Deployed Models</span>
                                    <span style={{ fontSize: '0.9rem', color: '#22c55e' }}>8 active</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    Currently running
                                </div>
                            </div>

                            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>Model Updates</span>
                                    <span style={{ fontSize: '0.9rem', color: '#f59e0b' }}>3 pending</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    Requires attention
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Edge Management</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="primary" fullWidth>
                                🔄 Auto-Scale Nodes
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth>
                                📊 Performance Report
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🛠️ Node Configuration
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📈 Capacity Planning
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🔐 Security Audit
                            </GlassButton>
                        </div>
                    </GlassCard>
                </RightPanel>
            </MainGrid>
        </DashboardContainer>
    );
};

export default EdgeAIComputingDashboard;