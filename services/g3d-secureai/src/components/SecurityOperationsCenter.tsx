/**
 * G3D SecureAI - Security Operations Center (SOC)
 * Complete enterprise cybersecurity dashboard with AI-powered threat detection
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
} from '../../../../shared/ui/src/components/index';
import {
    SecurityThreat,
    SecurityIncident,
    SecurityMetrics,
    ThreatIntelligence,
    VulnerabilityAssessment,
    ComplianceStatus,
    SecurityAlert
} from '../types/secureai.types';
import { AISecurityEngine } from '../services/AISecurityEngine';

// SecureAI Theme (Red/Orange security theme)
const secureaiTheme = {
    ...baseGlassmorphismTheme,
    ...serviceThemeOverrides['secureai']
};

// Animations
const threatPulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.8); }
`;

const scanningAnimation = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
`;

const alertBlink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
`;

// Styled Components
const SOCContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a0a0a 0%, #2d1b1b 50%, #1f1f1f 100%);
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
    background: linear-gradient(135deg, #ef4444, #f97316);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #ef4444, #f97316);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
`;

const ThreatLevel = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  .threat-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    
    &.low {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }
    
    &.medium {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }
    
    &.high {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      animation: ${threatPulse} 2s infinite;
    }
    
    &.critical {
      background: rgba(153, 27, 27, 0.3);
      color: #dc2626;
      animation: ${alertBlink} 1s infinite;
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

const ThreatMap = styled.div`
  position: relative;
  min-height: 400px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  overflow: hidden;
  
  .map-content {
    width: 100%;
    height: 100%;
    padding: 1rem;
    position: relative;
    
    .world-map {
      width: 100%;
      height: 350px;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, #ef4444, transparent);
        animation: ${scanningAnimation} 4s infinite;
      }
      
      .threat-markers {
        position: absolute;
        inset: 0;
        
        .marker {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          animation: ${threatPulse} 2s infinite;
          
          &.high { background: #ef4444; top: 30%; left: 20%; }
          &.medium { background: #f59e0b; top: 60%; left: 70%; }
          &.low { background: #22c55e; top: 40%; left: 50%; }
        }
      }
    }
  }
`;

const IncidentsList = styled.div`
  .incident-item {
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
      background: rgba(239, 68, 68, 0.1);
    }
    
    &.critical {
      border-left: 4px solid #dc2626;
      background: rgba(153, 27, 27, 0.1);
    }
    
    &.high {
      border-left: 4px solid #ef4444;
    }
    
    &.medium {
      border-left: 4px solid #f59e0b;
    }
    
    &.low {
      border-left: 4px solid #22c55e;
    }
    
    .incident-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      
      &.malware { background: rgba(239, 68, 68, 0.2); }
      &.intrusion { background: rgba(249, 115, 22, 0.2); }
      &.ddos { background: rgba(245, 158, 11, 0.2); }
      &.phishing { background: rgba(168, 85, 247, 0.2); }
    }
    
    .incident-info {
      flex: 1;
      
      .incident-title {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      .incident-details {
        font-size: 0.8rem;
        opacity: 0.7;
        display: flex;
        gap: 1rem;
      }
    }
    
    .incident-status {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
      
      &.open { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
      &.investigating { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
      &.resolved { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    }
  }
`;

const SecurityMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  .metric-card {
    padding: 1.5rem;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 8px;
    text-align: center;
    
    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: #ef4444;
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

const AlertsList = styled.div`
  .alert-item {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    
    .alert-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      
      .alert-severity {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.7rem;
        
        &.critical { background: rgba(153, 27, 27, 0.3); color: #dc2626; }
        &.high { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        &.medium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        &.low { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
      }
      
      .alert-time {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
    
    .alert-content {
      font-size: 0.9rem;
      line-height: 1.4;
    }
  }
`;

const ComplianceOverview = styled.div`
  .compliance-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    
    .compliance-name {
      font-weight: 600;
    }
    
    .compliance-score {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      .score-bar {
        width: 100px;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
        
        .score-fill {
          height: 100%;
          border-radius: 3px;
          
          &.excellent { background: #22c55e; }
          &.good { background: #84cc16; }
          &.fair { background: #f59e0b; }
          &.poor { background: #ef4444; }
        }
      }
      
      .score-text {
        font-size: 0.9rem;
        font-weight: 600;
      }
    }
  }
`;

// Main Component
export const SecurityOperationsCenter: React.FC = () => {
    // State Management
    const [selectedIncident, setSelectedIncident] = useState<string>('');
    const [threatLevel, setThreatLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
    const [isScanning, setIsScanning] = useState(false);
    const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
    const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
    const [showIncidentDetails, setShowIncidentDetails] = useState(false);

    // Refs
    const securityEngine = useRef(new AISecurityEngine());

    // Sample incidents
    const incidents = [
        {
            id: 'inc-001',
            title: 'Malware Detection - Trojan.Win32.Agent',
            type: 'malware' as const,
            severity: 'critical' as const,
            status: 'open' as const,
            timestamp: '2 minutes ago',
            affected: '15 endpoints'
        },
        {
            id: 'inc-002',
            title: 'Suspicious Network Activity',
            type: 'intrusion' as const,
            severity: 'high' as const,
            status: 'investigating' as const,
            timestamp: '12 minutes ago',
            affected: 'DMZ network'
        },
        {
            id: 'inc-003',
            title: 'DDoS Attack Detected',
            type: 'ddos' as const,
            severity: 'high' as const,
            status: 'investigating' as const,
            timestamp: '25 minutes ago',
            affected: 'Web servers'
        },
        {
            id: 'inc-004',
            title: 'Phishing Email Campaign',
            type: 'phishing' as const,
            severity: 'medium' as const,
            status: 'resolved' as const,
            timestamp: '1 hour ago',
            affected: '245 users'
        }
    ];

    // Event Handlers
    const handleStartScan = useCallback(async () => {
        setIsScanning(true);

        try {
            await securityEngine.current.performSecurityScan();
            // Update metrics and alerts after scan
            const newMetrics = await securityEngine.current.getSecurityMetrics();
            setMetrics(newMetrics);
        } catch (error) {
            console.error('Security scan failed:', error);
        } finally {
            setIsScanning(false);
        }
    }, []);

    // Load security data
    useEffect(() => {
        const loadSecurityData = async () => {
            try {
                const securityMetrics = await securityEngine.current.getSecurityMetrics();
                setMetrics(securityMetrics);

                const recentAlerts = await securityEngine.current.getRecentAlerts();
                setAlerts(recentAlerts);
            } catch (error) {
                console.error('Failed to load security data:', error);
            }
        };

        loadSecurityData();
        const interval = setInterval(loadSecurityData, 15000); // Update every 15 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <SOCContainer>
            <Header>
                <Logo>
                    <div className="icon">🛡️</div>
                    <h1>G3D SecureAI SOC</h1>
                </Logo>
                <ThreatLevel>
                    <div className={`threat-indicator ${threatLevel}`}>
                        <div className="dot" />
                        <span>Threat Level: {threatLevel.toUpperCase()}</span>
                    </div>
                    <GlassButton
                        variant="primary"
                        onClick={handleStartScan}
                        disabled={isScanning}
                        theme={secureaiTheme}
                    >
                        {isScanning ? '🔍 Scanning...' : '🔍 Start Scan'}
                    </GlassButton>
                </ThreatLevel>
            </Header>

            <MainGrid>
                {/* Left Panel - Incidents & Metrics */}
                <LeftPanel>
                    <GlassCard size="lg" theme={secureaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Active Security Incidents</h3>
                        <IncidentsList>
                            {incidents.map(incident => (
                                <div
                                    key={incident.id}
                                    className={`incident-item ${incident.severity}`}
                                    onClick={() => {
                                        setSelectedIncident(incident.id);
                                        setShowIncidentDetails(true);
                                    }}
                                >
                                    <div className={`incident-icon ${incident.type}`}>
                                        {incident.type === 'malware' && '🦠'}
                                        {incident.type === 'intrusion' && '🚨'}
                                        {incident.type === 'ddos' && '⚡'}
                                        {incident.type === 'phishing' && '🎣'}
                                    </div>
                                    <div className="incident-info">
                                        <div className="incident-title">{incident.title}</div>
                                        <div className="incident-details">
                                            <span>{incident.timestamp}</span>
                                            <span>{incident.affected}</span>
                                        </div>
                                    </div>
                                    <div className={`incident-status ${incident.status}`}>
                                        {incident.status}
                                    </div>
                                </div>
                            ))}
                        </IncidentsList>
                    </GlassCard>

                    <GlassCard size="lg" theme={secureaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Security Metrics</h3>
                        <SecurityMetricsGrid>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.threatsBlocked || '1,247'}</div>
                                <div className="metric-label">Threats Blocked</div>
                                <div className="metric-change positive">+15.3%</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.vulnerabilities || '23'}</div>
                                <div className="metric-label">Vulnerabilities</div>
                                <div className="metric-change negative">-8.2%</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.securityScore || '94'}%</div>
                                <div className="metric-label">Security Score</div>
                                <div className="metric-change positive">+2.1%</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.incidentsResolved || '156'}</div>
                                <div className="metric-label">Incidents Resolved</div>
                                <div className="metric-change positive">+12.7%</div>
                            </div>
                        </SecurityMetricsGrid>
                    </GlassCard>
                </LeftPanel>

                {/* Center Panel - Threat Map & Analysis */}
                <CenterPanel>
                    <GlassCard size="lg" theme={secureaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Global Threat Intelligence Map</h3>
                        <ThreatMap>
                            <div className="map-content">
                                <div className="world-map">
                                    <div className="threat-markers">
                                        <div className="marker high" title="High threat activity - Russia"></div>
                                        <div className="marker medium" title="Medium threat activity - China"></div>
                                        <div className="marker low" title="Low threat activity - Europe"></div>
                                    </div>
                                    <div style={{ textAlign: 'center', opacity: 0.6 }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
                                        <div style={{ fontSize: '1.2rem' }}>Real-time Global Threat Map</div>
                                        <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                            Monitoring threats from {metrics?.monitoredRegions || '127'} regions worldwide
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ThreatMap>
                    </GlassCard>

                    <GlassCard size="lg" theme={secureaiTheme}>
                        <h3 style={{ marginTop: 0 }}>AI Security Analysis</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <GlassButton variant="ghost" fullWidth theme={secureaiTheme}>
                                🔍 Threat Hunting
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={secureaiTheme}>
                                🧠 Behavioral Analysis
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={secureaiTheme}>
                                📊 Risk Assessment
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={secureaiTheme}>
                                🔐 Vulnerability Scan
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={secureaiTheme}>
                                📈 Predictive Analytics
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={secureaiTheme}>
                                🚨 Incident Response
                            </GlassButton>
                        </div>
                    </GlassCard>
                </CenterPanel>

                {/* Right Panel - Alerts & Compliance */}
                <RightPanel>
                    <GlassCard size="lg" theme={secureaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Security Alerts</h3>
                        <AlertsList>
                            <div className="alert-item">
                                <div className="alert-header">
                                    <span className="alert-severity critical">CRITICAL</span>
                                    <span className="alert-time">Just now</span>
                                </div>
                                <div className="alert-content">
                                    Advanced persistent threat detected on executive workstation. Immediate isolation recommended.
                                </div>
                            </div>
                            <div className="alert-item">
                                <div className="alert-header">
                                    <span className="alert-severity high">HIGH</span>
                                    <span className="alert-time">3 min ago</span>
                                </div>
                                <div className="alert-content">
                                    Unusual data exfiltration pattern detected from database server.
                                </div>
                            </div>
                            <div className="alert-item">
                                <div className="alert-header">
                                    <span className="alert-severity medium">MEDIUM</span>
                                    <span className="alert-time">8 min ago</span>
                                </div>
                                <div className="alert-content">
                                    Multiple failed login attempts from suspicious IP addresses.
                                </div>
                            </div>
                            <div className="alert-item">
                                <div className="alert-header">
                                    <span className="alert-severity low">LOW</span>
                                    <span className="alert-time">15 min ago</span>
                                </div>
                                <div className="alert-content">
                                    Software update available for security patch deployment.
                                </div>
                            </div>
                        </AlertsList>
                    </GlassCard>

                    <GlassCard size="lg" theme={secureaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Compliance Status</h3>
                        <ComplianceOverview>
                            <div className="compliance-item">
                                <div className="compliance-name">SOC 2 Type II</div>
                                <div className="compliance-score">
                                    <div className="score-bar">
                                        <div className="score-fill excellent" style={{ width: '96%' }}></div>
                                    </div>
                                    <span className="score-text">96%</span>
                                </div>
                            </div>
                            <div className="compliance-item">
                                <div className="compliance-name">ISO 27001</div>
                                <div className="compliance-score">
                                    <div className="score-bar">
                                        <div className="score-fill good" style={{ width: '89%' }}></div>
                                    </div>
                                    <span className="score-text">89%</span>
                                </div>
                            </div>
                            <div className="compliance-item">
                                <div className="compliance-name">GDPR</div>
                                <div className="compliance-score">
                                    <div className="score-bar">
                                        <div className="score-fill excellent" style={{ width: '98%' }}></div>
                                    </div>
                                    <span className="score-text">98%</span>
                                </div>
                            </div>
                            <div className="compliance-item">
                                <div className="compliance-name">HIPAA</div>
                                <div className="compliance-score">
                                    <div className="score-bar">
                                        <div className="score-fill good" style={{ width: '92%' }}></div>
                                    </div>
                                    <span className="score-text">92%</span>
                                </div>
                            </div>
                        </ComplianceOverview>
                    </GlassCard>

                    <GlassCard size="lg" theme={secureaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="primary" fullWidth theme={secureaiTheme}>
                                🚨 Emergency Lockdown
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth theme={secureaiTheme}>
                                📧 Send Security Alert
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={secureaiTheme}>
                                📋 Generate Report
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={secureaiTheme}>
                                ⚙️ Update Policies
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={secureaiTheme}>
                                👥 Contact CERT Team
                            </GlassButton>
                        </div>
                    </GlassCard>
                </RightPanel>
            </MainGrid>

            {/* Incident Details Modal */}
            <GlassModal
                isOpen={showIncidentDetails}
                onClose={() => setShowIncidentDetails(false)}
                title="Security Incident Details"
                size="lg"
                theme={secureaiTheme}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <h4>Incident ID: {selectedIncident}</h4>
                        <p>Detailed analysis and response actions for the selected security incident.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <div>
                            <strong>Severity:</strong> Critical
                        </div>
                        <div>
                            <strong>Status:</strong> Under Investigation
                        </div>
                        <div>
                            <strong>Affected Systems:</strong> 15 endpoints
                        </div>
                        <div>
                            <strong>First Detected:</strong> 2 minutes ago
                        </div>
                    </div>

                    <div>
                        <strong>Recommended Actions:</strong>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                            <li>Isolate affected endpoints immediately</li>
                            <li>Run full system malware scan</li>
                            <li>Update antivirus definitions</li>
                            <li>Monitor network traffic for anomalies</li>
                        </ul>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <GlassButton
                            variant="ghost"
                            onClick={() => setShowIncidentDetails(false)}
                            theme={secureaiTheme}
                        >
                            Close
                        </GlassButton>
                        <GlassButton
                            variant="primary"
                            theme={secureaiTheme}
                        >
                            Take Action
                        </GlassButton>
                    </div>
                </div>
            </GlassModal>
        </SOCContainer>
    );
};

export default SecurityOperationsCenter;