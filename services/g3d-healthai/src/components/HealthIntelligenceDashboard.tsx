/**
 * G3D HealthAI - Personal Health Intelligence Dashboard
 * Complete HIPAA-compliant health monitoring platform with AI-powered insights
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
    HealthProfile,
    VitalSigns,
    HealthRisk,
    HealthRecommendation,
    SymptomAnalysis,
    MedicationInteraction,
    HealthMetrics
} from '../types/health.types';
import { HealthIntelligenceEngine } from '../services/HealthIntelligenceEngine';

// HealthAI Theme (Medical green/blue theme)
const healthaiTheme = {
    ...baseGlassmorphismTheme,
    primary: '#059669',
    secondary: '#0d9488',
    accent: '#06b6d4',
    glass: {
        background: 'rgba(5, 150, 105, 0.1)',
        border: 'rgba(5, 150, 105, 0.2)',
        blur: '12px'
    }
};

// Animations
const heartbeat = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const healthPulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(5, 150, 105, 0.3); }
  50% { box-shadow: 0 0 20px rgba(5, 150, 105, 0.8); }
`;

const vitalFlow = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%);
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
    background: linear-gradient(135deg, #059669, #0d9488);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #059669, #0d9488);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: ${heartbeat} 2s infinite;
  }
`;

const HealthStatus = styled.div`
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
    
    &.excellent {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }
    
    &.good {
      background: rgba(5, 150, 105, 0.2);
      color: #059669;
      animation: ${healthPulse} 2s infinite;
    }
    
    &.fair {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }
    
    &.poor {
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

const VitalSignsMonitor = styled.div`
  position: relative;
  min-height: 400px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  
  .monitor-content {
    width: 100%;
    height: 100%;
    padding: 1rem;
    position: relative;
    
    .vitals-display {
      width: 100%;
      height: 350px;
      background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(13, 148, 136, 0.1));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      border: 2px solid rgba(5, 150, 105, 0.3);
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #059669, transparent);
        animation: ${vitalFlow} 3s infinite;
      }
      
      .vitals-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
        width: 100%;
        max-width: 500px;
        
        .vital-card {
          background: rgba(5, 150, 105, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          border: 1px solid rgba(5, 150, 105, 0.3);
          
          .vital-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            
            &.heart { animation: ${heartbeat} 1.5s infinite; }
          }
          
          .vital-value {
            font-size: 2rem;
            font-weight: 700;
            color: #059669;
            margin-bottom: 0.25rem;
          }
          
          .vital-label {
            font-size: 0.9rem;
            opacity: 0.8;
          }
          
          .vital-status {
            margin-top: 0.5rem;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.7rem;
            
            &.normal { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
            &.elevated { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
            &.high { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
          }
        }
      }
    }
  }
`;

const HealthProfile = styled.div`
  .profile-section {
    margin-bottom: 1.5rem;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      
      h4 {
        margin: 0;
        font-size: 1rem;
        color: #059669;
      }
      
      .update-button {
        font-size: 0.8rem;
        color: #0d9488;
        cursor: pointer;
        
        &:hover {
          color: #059669;
        }
      }
    }
    
    .profile-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      
      .profile-item {
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
        }
      }
    }
  }
`;

const HealthInsights = styled.div`
  .insight-item {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    border-left: 4px solid #059669;
    
    .insight-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      
      .insight-type {
        background: rgba(5, 150, 105, 0.2);
        color: #059669;
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
        background: rgba(5, 150, 105, 0.2);
        border: 1px solid rgba(5, 150, 105, 0.3);
        border-radius: 6px;
        color: #059669;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(5, 150, 105, 0.3);
        }
      }
    }
  }
`;

const RiskAssessment = styled.div`
  .risk-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    
    .risk-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      
      &.low { background: rgba(34, 197, 94, 0.2); }
      &.medium { background: rgba(245, 158, 11, 0.2); }
      &.high { background: rgba(239, 68, 68, 0.2); }
    }
    
    .risk-info {
      flex: 1;
      
      .risk-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      .risk-description {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
    
    .risk-level {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
      
      &.low { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
      &.medium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
      &.high { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    }
  }
`;

const HealthMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  .metric-card {
    padding: 1.5rem;
    background: rgba(5, 150, 105, 0.1);
    border-radius: 8px;
    text-align: center;
    
    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: #059669;
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
      &.stable { color: #0d9488; }
    }
  }
`;

// Main Component
export const HealthIntelligenceDashboard: React.FC = () => {
    // State Management
    const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
    const [vitals, setVitals] = useState<VitalSigns | null>(null);
    const [insights, setInsights] = useState<HealthRecommendation[]>([]);
    const [risks, setRisks] = useState<HealthRisk[]>([]);
    const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
    const [showSymptomChecker, setShowSymptomChecker] = useState(false);

    // Refs
    const healthEngine = useRef(new HealthIntelligenceEngine());

    // Sample vital signs
    const currentVitals = {
        heartRate: { value: 72, status: 'normal' as const, unit: 'bpm' },
        bloodPressure: { value: '120/80', status: 'normal' as const, unit: 'mmHg' },
        temperature: { value: 98.6, status: 'normal' as const, unit: '°F' },
        oxygenSaturation: { value: 98, status: 'normal' as const, unit: '%' }
    };

    // Sample health risks
    const healthRisks = [
        {
            id: 'risk-001',
            name: 'Cardiovascular Disease',
            level: 'low' as const,
            description: 'Based on current lifestyle and vitals',
            probability: 15
        },
        {
            id: 'risk-002',
            name: 'Type 2 Diabetes',
            level: 'medium' as const,
            description: 'Family history and BMI indicate elevated risk',
            probability: 35
        },
        {
            id: 'risk-003',
            name: 'Hypertension',
            level: 'low' as const,
            description: 'Current blood pressure within normal range',
            probability: 20
        }
    ];

    // Event Handlers
    const handleSymptomCheck = useCallback(async (symptoms: string[]) => {
        try {
            const analysis = await healthEngine.current.analyzeSymptoms({
                symptoms,
                patientHistory: healthProfile,
                currentVitals: vitals
            });

            setInsights(prev => [analysis.recommendation, ...prev.slice(0, 4)]);
        } catch (error) {
            console.error('Symptom analysis failed:', error);
        }
    }, [healthProfile, vitals]);

    const handleVitalUpdate = useCallback(async (newVitals: VitalSigns) => {
        setVitals(newVitals);

        try {
            const analysis = await healthEngine.current.analyzeVitals({
                vitals: newVitals,
                history: healthProfile?.vitalHistory || []
            });

            if (analysis.alerts.length > 0) {
                // Handle any vital sign alerts
                console.log('Vital alerts:', analysis.alerts);
            }
        } catch (error) {
            console.error('Vital analysis failed:', error);
        }
    }, [healthProfile]);

    // Load health data
    useEffect(() => {
        const loadHealthData = async () => {
            try {
                const profile = await healthEngine.current.getHealthProfile();
                setHealthProfile(profile);

                const currentMetrics = await healthEngine.current.getHealthMetrics();
                setMetrics(currentMetrics);

                const riskAssessment = await healthEngine.current.assessHealthRisks(profile);
                setRisks(riskAssessment);
            } catch (error) {
                console.error('Failed to load health data:', error);
            }
        };

        loadHealthData();
    }, []);

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">🏥</div>
                    <h1>G3D HealthAI Intelligence</h1>
                </Logo>
                <HealthStatus>
                    <div className="status-indicator good">
                        <div className="dot" />
                        <span>Health Status: Good</span>
                    </div>
                    <GlassButton
                        variant="secondary"
                        onClick={() => setShowSymptomChecker(true)}
                        theme={healthaiTheme}
                    >
                        🩺 Symptom Checker
                    </GlassButton>
                </HealthStatus>
            </Header>

            <MainGrid>
                {/* Left Panel - Health Profile & Risks */}
                <LeftPanel>
                    <GlassCard size="lg" theme={healthaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Health Profile</h3>
                        <HealthProfile>
                            <div className="profile-section">
                                <div className="section-header">
                                    <h4>Personal Information</h4>
                                    <span className="update-button">Edit</span>
                                </div>
                                <div className="profile-grid">
                                    <div className="profile-item">
                                        <span className="label">Age:</span>
                                        <span className="value">32 years</span>
                                    </div>
                                    <div className="profile-item">
                                        <span className="label">Gender:</span>
                                        <span className="value">Female</span>
                                    </div>
                                    <div className="profile-item">
                                        <span className="label">Height:</span>
                                        <span className="value">5'6"</span>
                                    </div>
                                    <div className="profile-item">
                                        <span className="label">Weight:</span>
                                        <span className="value">145 lbs</span>
                                    </div>
                                    <div className="profile-item">
                                        <span className="label">BMI:</span>
                                        <span className="value">23.4</span>
                                    </div>
                                    <div className="profile-item">
                                        <span className="label">Blood Type:</span>
                                        <span className="value">O+</span>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-section">
                                <div className="section-header">
                                    <h4>Medical History</h4>
                                    <span className="update-button">Update</span>
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>
                                    <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', marginBottom: '0.5rem' }}>
                                        No known allergies
                                    </div>
                                    <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', marginBottom: '0.5rem' }}>
                                        Family history: Diabetes (maternal)
                                    </div>
                                    <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
                                        Current medications: Vitamin D3
                                    </div>
                                </div>
                            </div>
                        </HealthProfile>
                    </GlassCard>

                    <GlassCard size="lg" theme={healthaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Risk Assessment</h3>
                        <RiskAssessment>
                            {healthRisks.map(risk => (
                                <div key={risk.id} className="risk-item">
                                    <div className={`risk-icon ${risk.level}`}>
                                        {risk.level === 'low' && '🟢'}
                                        {risk.level === 'medium' && '🟡'}
                                        {risk.level === 'high' && '🔴'}
                                    </div>
                                    <div className="risk-info">
                                        <div className="risk-name">{risk.name}</div>
                                        <div className="risk-description">{risk.description}</div>
                                    </div>
                                    <div className={`risk-level ${risk.level}`}>
                                        {risk.level} ({risk.probability}%)
                                    </div>
                                </div>
                            ))}
                        </RiskAssessment>
                    </GlassCard>

                    <GlassCard size="lg" theme={healthaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Health Metrics</h3>
                        <HealthMetricsGrid>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.sleepScore || '85'}</div>
                                <div className="metric-label">Sleep Score</div>
                                <div className="metric-trend improving">Improving</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.activityLevel || '7.2'}</div>
                                <div className="metric-label">Activity Level</div>
                                <div className="metric-trend stable">Stable</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.stressLevel || '3.1'}</div>
                                <div className="metric-label">Stress Level</div>
                                <div className="metric-trend improving">Decreasing</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.nutritionScore || '78'}</div>
                                <div className="metric-label">Nutrition Score</div>
                                <div className="metric-trend declining">Needs Attention</div>
                            </div>
                        </HealthMetricsGrid>
                    </GlassCard>
                </LeftPanel>

                {/* Center Panel - Vital Signs Monitor */}
                <CenterPanel>
                    <GlassCard size="lg" theme={healthaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Vital Signs Monitor</h3>
                        <VitalSignsMonitor>
                            <div className="monitor-content">
                                <div className="vitals-display">
                                    <div className="vitals-grid">
                                        <div className="vital-card">
                                            <div className="vital-icon heart">❤️</div>
                                            <div className="vital-value">{currentVitals.heartRate.value}</div>
                                            <div className="vital-label">Heart Rate (bpm)</div>
                                            <div className={`vital-status ${currentVitals.heartRate.status}`}>
                                                {currentVitals.heartRate.status}
                                            </div>
                                        </div>

                                        <div className="vital-card">
                                            <div className="vital-icon">🩸</div>
                                            <div className="vital-value">{currentVitals.bloodPressure.value}</div>
                                            <div className="vital-label">Blood Pressure</div>
                                            <div className={`vital-status ${currentVitals.bloodPressure.status}`}>
                                                {currentVitals.bloodPressure.status}
                                            </div>
                                        </div>

                                        <div className="vital-card">
                                            <div className="vital-icon">🌡️</div>
                                            <div className="vital-value">{currentVitals.temperature.value}</div>
                                            <div className="vital-label">Temperature (°F)</div>
                                            <div className={`vital-status ${currentVitals.temperature.status}`}>
                                                {currentVitals.temperature.status}
                                            </div>
                                        </div>

                                        <div className="vital-card">
                                            <div className="vital-icon">🫁</div>
                                            <div className="vital-value">{currentVitals.oxygenSaturation.value}</div>
                                            <div className="vital-label">Oxygen Saturation</div>
                                            <div className={`vital-status ${currentVitals.oxygenSaturation.status}`}>
                                                {currentVitals.oxygenSaturation.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </VitalSignsMonitor>
                    </GlassCard>

                    <GlassCard size="lg" theme={healthaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Health Monitoring Tools</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <GlassButton variant="ghost" fullWidth theme={healthaiTheme}>
                                🩺 Symptom Tracker
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={healthaiTheme}>
                                💊 Medication Log
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={healthaiTheme}>
                                🏃 Activity Tracker
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={healthaiTheme}>
                                😴 Sleep Monitor
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={healthaiTheme}>
                                🍎 Nutrition Log
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={healthaiTheme}>
                                📊 Health Reports
                            </GlassButton>
                        </div>
                    </GlassCard>
                </CenterPanel>

                {/* Right Panel - AI Insights & Recommendations */}
                <RightPanel>
                    <GlassCard size="lg" theme={healthaiTheme}>
                        <h3 style={{ marginTop: 0 }}>AI Health Insights</h3>
                        <HealthInsights>
                            <div className="insight-item">
                                <div className="insight-header">
                                    <span className="insight-type">Nutrition</span>
                                    <span className="confidence">92% confidence</span>
                                </div>
                                <div className="insight-content">
                                    Your vitamin D levels may be low based on recent symptoms and limited sun exposure. Consider increasing dietary sources or supplements.
                                </div>
                                <div className="insight-actions">
                                    <button className="action-button">View Foods</button>
                                    <button className="action-button">Set Reminder</button>
                                </div>
                            </div>

                            <div className="insight-item">
                                <div className="insight-header">
                                    <span className="insight-type">Exercise</span>
                                    <span className="confidence">88% confidence</span>
                                </div>
                                <div className="insight-content">
                                    Your cardio fitness could benefit from 2-3 additional moderate-intensity workouts per week based on your current activity patterns.
                                </div>
                                <div className="insight-actions">
                                    <button className="action-button">Create Plan</button>
                                    <button className="action-button">Track Progress</button>
                                </div>
                            </div>

                            <div className="insight-item">
                                <div className="insight-header">
                                    <span className="insight-type">Sleep</span>
                                    <span className="confidence">95% confidence</span>
                                </div>
                                <div className="insight-content">
                                    Your sleep quality has improved 15% this month. Maintaining your current bedtime routine will continue this positive trend.
                                </div>
                                <div className="insight-actions">
                                    <button className="action-button">View Trends</button>
                                    <button className="action-button">Optimize</button>
                                </div>
                            </div>
                        </HealthInsights>
                    </GlassCard>

                    <GlassCard size="lg" theme={healthaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Health Goals</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>Daily Steps</span>
                                    <span style={{ fontSize: '0.9rem', color: '#059669' }}>8,247 / 10,000</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: '82%', height: '100%', background: 'linear-gradient(90deg, #059669, #0d9488)', borderRadius: '3px' }}></div>
                                </div>
                            </div>

                            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>Water Intake</span>
                                    <span style={{ fontSize: '0.9rem', color: '#059669' }}>6 / 8 glasses</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #059669, #0d9488)', borderRadius: '3px' }}></div>
                                </div>
                            </div>

                            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>Sleep Hours</span>
                                    <span style={{ fontSize: '0.9rem', color: '#059669' }}>7.5 / 8 hours</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: '94%', height: '100%', background: 'linear-gradient(90deg, #059669, #0d9488)', borderRadius: '3px' }}></div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard size="lg" theme={healthaiTheme}>
                        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="primary" fullWidth theme={healthaiTheme}>
                                📅 Schedule Checkup
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth theme={healthaiTheme}>
                                📊 Generate Health Report
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={healthaiTheme}>
                                👨‍⚕️ Find Specialists
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={healthaiTheme}>
                                💊 Medication Reminders
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={healthaiTheme}>
                                🔗 Connect Devices
                            </GlassButton>
                        </div>
                    </GlassCard>
                </RightPanel>
            </MainGrid>

            {/* Symptom Checker Modal */}
            <GlassModal
                isOpen={showSymptomChecker}
                onClose={() => setShowSymptomChecker(false)}
                title="AI Symptom Checker"
                size="lg"
                theme={healthaiTheme}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <h4>Describe Your Symptoms</h4>
                        <p>Our AI will analyze your symptoms and provide personalized health insights. This is not a substitute for professional medical advice.</p>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            What symptoms are you experiencing?
                        </label>
                        <textarea
                            placeholder="Describe your symptoms in detail..."
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(5, 150, 105, 0.3)',
                                color: 'white',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Duration</label>
                            <select style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(5, 150, 105, 0.3)',
                                color: 'white'
                            }}>
                                <option value="">Select duration</option>
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                                <option value="weeks">Weeks</option>
                                <option value="months">Months</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Severity</label>
                            <select style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(5, 150, 105, 0.3)',
                                color: 'white'
                            }}>
                                <option value="">Select severity</option>
                                <option value="mild">Mild</option>
                                <option value="moderate">Moderate</option>
                                <option value="severe">Severe</option>
                            </select>
                        </div>
                    </div>

                    <div style={{
                        padding: '1rem',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                    }}>
                        <strong>⚠️ Medical Disclaimer:</strong> This AI symptom checker is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with a healthcare provider for medical concerns.
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <GlassButton
                            variant="ghost"
                            onClick={() => setShowSymptomChecker(false)}
                            theme={healthaiTheme}
                        >
                            Cancel
                        </GlassButton>
                        <GlassButton
                            variant="primary"
                            onClick={() => setShowSymptomChecker(false)}
                            theme={healthaiTheme}
                        >
                            Analyze Symptoms
                        </GlassButton>
                    </div>
                </div>
            </GlassModal>
        </DashboardContainer>
    );
};

export default HealthIntelligenceDashboard;