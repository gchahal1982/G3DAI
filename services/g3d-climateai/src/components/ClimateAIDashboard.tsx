/**
 * G3D ClimateAI - Environmental Modeling Dashboard
 * Advanced climate simulation and environmental analysis platform
 */

import React, { useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    GlassCard,
    GlassButton,
    GlassInput,
    GlassModal,
    baseGlassmorphismTheme
} from '../../../../shared/ui/src/components/index';

// Climate Theme (Green/Blue earth theme)
const climateTheme = {
    ...baseGlassmorphismTheme,
    primary: '#059669',
    secondary: '#0ea5e9',
    accent: '#06b6d4',
    glass: {
        background: 'rgba(5, 150, 105, 0.1)',
        border: 'rgba(5, 150, 105, 0.2)',
        blur: '12px'
    }
};

// Climate Animations
const earthRotation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const weatherFlow = keyframes`
  0%, 100% { transform: translateX(-10px) translateY(0px); }
  50% { transform: translateX(10px) translateY(-5px); }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0c1f17 0%, #064e3b 50%, #0c4a6e 100%);
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
    background: linear-gradient(135deg, #059669, #0ea5e9);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #059669, #0ea5e9);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: ${earthRotation} 10s infinite linear;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr 300px;
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

const ClimateMap = styled.div`
  position: relative;
  min-height: 500px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  
  .map-display {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(14, 165, 233, 0.1));
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    .earth-visualization {
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: linear-gradient(135deg, #059669, #0ea5e9);
      position: relative;
      animation: ${earthRotation} 20s infinite linear;
      
      .weather-pattern {
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        animation: ${weatherFlow} 3s infinite;
        
        &:nth-child(1) { top: 20%; left: 30%; animation-delay: 0s; }
        &:nth-child(2) { top: 40%; left: 60%; animation-delay: 1s; }
        &:nth-child(3) { top: 70%; left: 20%; animation-delay: 2s; }
        &:nth-child(4) { top: 60%; left: 80%; animation-delay: 1.5s; }
      }
    }
  }
`;

const ModelingControls = styled.div`
  .control-section {
    margin-bottom: 1.5rem;
    
    .section-title {
      font-weight: 600;
      color: #059669;
      margin-bottom: 0.75rem;
    }
    
    .control-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.5rem;
      
      .control-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        
        .control-label {
          font-size: 0.9rem;
          color: #d1d5db;
        }
        
        .control-value {
          font-weight: 600;
          color: #059669;
        }
      }
    }
  }
`;

const MetricsPanel = styled.div`
  .metrics-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    
    .metric-card {
      background: rgba(5, 150, 105, 0.1);
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      
      .metric-value {
        font-size: 1.8rem;
        font-weight: 700;
        color: #059669;
        margin-bottom: 0.25rem;
      }
      
      .metric-label {
        font-size: 0.8rem;
        color: #a1a1aa;
        margin-bottom: 0.5rem;
      }
      
      .metric-trend {
        font-size: 0.7rem;
        padding: 0.25rem 0.5rem;
        border-radius: 10px;
        
        &.up {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        
        &.down {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }
        
        &.stable {
          background: rgba(156, 163, 175, 0.2);
          color: #9ca3af;
        }
      }
    }
  }
`;

const ScenarioBuilder = styled.div`
  .scenario-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    
    .scenario-item {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(5, 150, 105, 0.1);
      }
      
      &.active {
        background: rgba(5, 150, 105, 0.2);
        border: 1px solid #059669;
      }
      
      .scenario-name {
        font-weight: 600;
        color: #059669;
        margin-bottom: 0.25rem;
      }
      
      .scenario-description {
        font-size: 0.8rem;
        color: #a1a1aa;
        margin-bottom: 0.5rem;
      }
      
      .scenario-params {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        
        .param-tag {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          background: rgba(14, 165, 233, 0.2);
          color: #0ea5e9;
          border-radius: 10px;
        }
      }
    }
  }
`;

export const ClimateAIDashboard: React.FC = () => {
    const [activeScenario, setActiveScenario] = useState<string>('baseline');
    const [isSimulating, setIsSimulating] = useState(false);

    const scenarios = [
        {
            id: 'baseline',
            name: 'Current Trajectory',
            description: 'Business-as-usual emissions scenario',
            params: ['CO2: 415ppm', 'Temp: +1.1°C', 'Sea Level: +21cm']
        },
        {
            id: 'paris',
            name: 'Paris Agreement',
            description: '1.5°C warming limit scenario',
            params: ['CO2: 450ppm', 'Temp: +1.5°C', 'Sea Level: +43cm']
        },
        {
            id: 'aggressive',
            name: 'Net Zero 2030',
            description: 'Aggressive mitigation scenario',
            params: ['CO2: 380ppm', 'Temp: +1.2°C', 'Sea Level: +35cm']
        }
    ];

    const metrics = [
        { label: 'Global Temperature', value: '+1.1°C', trend: 'up' },
        { label: 'CO2 Concentration', value: '415ppm', trend: 'up' },
        { label: 'Sea Level Rise', value: '+3.3mm/yr', trend: 'up' },
        { label: 'Arctic Ice', value: '-13%/decade', trend: 'down' },
        { label: 'Forest Cover', value: '-0.8%/yr', trend: 'down' },
        { label: 'Renewable Energy', value: '29%', trend: 'up' }
    ];

    const handleRunSimulation = useCallback(async () => {
        setIsSimulating(true);
        setTimeout(() => {
            setIsSimulating(false);
        }, 3000);
    }, []);

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">🌍</div>
                    <h1>G3D ClimateAI</h1>
                </Logo>
                <GlassButton
                    variant="primary"
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                >
                    {isSimulating ? 'Simulating...' : 'Run Climate Model'}
                </GlassButton>
            </Header>

            <MainGrid>
                <LeftPanel>
                    <GlassCard>
                        <h3>Climate Scenarios</h3>
                        <ScenarioBuilder>
                            <div className="scenario-list">
                                {scenarios.map(scenario => (
                                    <div
                                        key={scenario.id}
                                        className={`scenario-item ${activeScenario === scenario.id ? 'active' : ''}`}
                                        onClick={() => setActiveScenario(scenario.id)}
                                    >
                                        <div className="scenario-name">{scenario.name}</div>
                                        <div className="scenario-description">{scenario.description}</div>
                                        <div className="scenario-params">
                                            {scenario.params.map((param, index) => (
                                                <div key={index} className="param-tag">{param}</div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScenarioBuilder>
                    </GlassCard>

                    <GlassCard>
                        <h3>Model Parameters</h3>
                        <ModelingControls>
                            <div className="control-section">
                                <div className="section-title">Emissions</div>
                                <div className="control-grid">
                                    <div className="control-item">
                                        <span className="control-label">CO2 Emissions</span>
                                        <span className="control-value">36.8 Gt/yr</span>
                                    </div>
                                    <div className="control-item">
                                        <span className="control-label">CH4 Emissions</span>
                                        <span className="control-value">570 Mt/yr</span>
                                    </div>
                                </div>
                            </div>

                            <div className="control-section">
                                <div className="section-title">Climate Sensitivity</div>
                                <div className="control-grid">
                                    <div className="control-item">
                                        <span className="control-label">ECS</span>
                                        <span className="control-value">3.1°C</span>
                                    </div>
                                    <div className="control-item">
                                        <span className="control-label">TCR</span>
                                        <span className="control-value">1.8°C</span>
                                    </div>
                                </div>
                            </div>
                        </ModelingControls>
                    </GlassCard>
                </LeftPanel>

                <CenterPanel>
                    <GlassCard>
                        <h3>Global Climate Visualization</h3>
                        <ClimateMap>
                            <div className="map-display">
                                <div className="earth-visualization">
                                    <div className="weather-pattern"></div>
                                    <div className="weather-pattern"></div>
                                    <div className="weather-pattern"></div>
                                    <div className="weather-pattern"></div>
                                </div>
                            </div>
                        </ClimateMap>
                    </GlassCard>
                </CenterPanel>

                <RightPanel>
                    <GlassCard>
                        <h3>Climate Metrics</h3>
                        <MetricsPanel>
                            <div className="metrics-grid">
                                {metrics.map((metric, index) => (
                                    <div key={index} className="metric-card">
                                        <div className="metric-value">{metric.value}</div>
                                        <div className="metric-label">{metric.label}</div>
                                        <div className={`metric-trend ${metric.trend}`}>
                                            {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                                            {metric.trend === 'up' ? 'Increasing' : metric.trend === 'down' ? 'Decreasing' : 'Stable'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </MetricsPanel>
                    </GlassCard>
                </RightPanel>
            </MainGrid>
        </DashboardContainer>
    );
};