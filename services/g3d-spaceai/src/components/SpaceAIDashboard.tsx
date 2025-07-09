/**
 * G3D SpaceAI - Aerospace Intelligence Dashboard
 * Advanced space exploration and satellite analysis platform
 */

import React, { useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    GlassCard,
    GlassButton,
    baseGlassmorphismTheme
} from '../../../../shared/ui/src/components/index';

// Space Theme (Deep blue/purple space theme)
const spaceTheme = {
    ...baseGlassmorphismTheme,
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    glass: {
        background: 'rgba(59, 130, 246, 0.1)',
        border: 'rgba(59, 130, 246, 0.2)',
        blur: '12px'
    }
};

// Space Animations
const satelliteOrbit = keyframes`
  0% { transform: rotate(0deg) translateX(150px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
`;

const starTwinkle = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
  padding: 1.5rem;
  color: white;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(2px 2px at 20px 30px, white, transparent),
      radial-gradient(2px 2px at 40px 70px, white, transparent),
      radial-gradient(1px 1px at 90px 40px, white, transparent),
      radial-gradient(1px 1px at 130px 80px, white, transparent),
      radial-gradient(2px 2px at 160px 30px, white, transparent);
    background-repeat: repeat;
    background-size: 200px 100px;
    animation: ${starTwinkle} 4s infinite;
    opacity: 0.3;
    pointer-events: none;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 10;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 1.5rem;
  height: calc(100vh - 140px);
  position: relative;
  z-index: 10;
`;

const SpaceVisualization = styled.div`
  position: relative;
  min-height: 500px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  
  .space-display {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    .earth {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      position: relative;
      
      .continent {
        position: absolute;
        background: rgba(34, 197, 94, 0.8);
        border-radius: 50%;
        
        &:nth-child(1) {
          width: 30px;
          height: 20px;
          top: 20px;
          left: 15px;
        }
        
        &:nth-child(2) {
          width: 25px;
          height: 35px;
          top: 30px;
          right: 20px;
        }
        
        &:nth-child(3) {
          width: 20px;
          height: 15px;
          bottom: 25px;
          left: 25px;
        }
      }
    }
    
    .satellite {
      position: absolute;
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #8b5cf6, #06b6d4);
      border-radius: 4px;
      animation: ${satelliteOrbit} 10s infinite linear;
      
      &:nth-child(2) {
        animation-duration: 15s;
        animation-delay: -5s;
      }
      
      &:nth-child(3) {
        animation-duration: 8s;
        animation-delay: -2s;
      }
    }
  }
`;

const MissionControl = styled.div`
  .mission-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    
    .mission-item {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(59, 130, 246, 0.1);
      }
      
      &.active {
        background: rgba(59, 130, 246, 0.2);
        border: 1px solid #3b82f6;
      }
      
      .mission-name {
        font-weight: 600;
        color: #3b82f6;
        margin-bottom: 0.25rem;
      }
      
      .mission-status {
        font-size: 0.8rem;
        color: #a1a1aa;
        margin-bottom: 0.5rem;
      }
      
      .mission-progress {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
      }
    }
  }
`;

const SatelliteTracking = styled.div`
  .satellite-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    
    .satellite-card {
      background: rgba(59, 130, 246, 0.1);
      border-radius: 8px;
      padding: 1rem;
      
      .satellite-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
        
        .satellite-name {
          font-weight: 600;
          color: #3b82f6;
        }
        
        .satellite-status {
          font-size: 0.8rem;
          padding: 0.25rem 0.5rem;
          border-radius: 10px;
          
          &.operational {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
          }
          
          &.maintenance {
            background: rgba(245, 158, 11, 0.2);
            color: #f59e0b;
          }
        }
      }
      
      .satellite-metrics {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        
        .metric {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          
          .label {
            color: #a1a1aa;
          }
          
          .value {
            color: #8b5cf6;
            font-weight: 600;
          }
        }
      }
    }
  }
`;

export const SpaceAIDashboard: React.FC = () => {
    const [activeMission, setActiveMission] = useState<string>('artemis');
    const [isTracking, setIsTracking] = useState(false);

    const missions = [
        {
            id: 'artemis',
            name: 'Artemis III',
            status: 'Launch Preparation',
            progress: 75
        },
        {
            id: 'mars',
            name: 'Mars Sample Return',
            status: 'In Transit',
            progress: 45
        },
        {
            id: 'webb',
            name: 'James Webb Telescope',
            status: 'Operational',
            progress: 100
        },
        {
            id: 'europa',
            name: 'Europa Clipper',
            status: 'Mission Planning',
            progress: 30
        }
    ];

    const satellites = [
        {
            name: 'ISS',
            status: 'operational',
            altitude: '408 km',
            speed: '7.66 km/s',
            orbit: '92.68 min',
            crew: '7'
        },
        {
            name: 'Hubble',
            status: 'operational',
            altitude: '547 km',
            speed: '7.59 km/s',
            orbit: '95.47 min',
            crew: '0'
        },
        {
            name: 'Starlink-4521',
            status: 'operational',
            altitude: '550 km',
            speed: '7.58 km/s',
            orbit: '95.64 min',
            crew: '0'
        }
    ];

    const handleStartTracking = useCallback(() => {
        setIsTracking(!isTracking);
    }, [isTracking]);

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">🚀</div>
                    <h1>G3D SpaceAI</h1>
                </Logo>
                <GlassButton
                    variant="primary"
                    onClick={handleStartTracking}
                >
                    {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                </GlassButton>
            </Header>

            <MainGrid>
                <div>
                    <GlassCard>
                        <h3>Mission Control</h3>
                        <MissionControl>
                            <div className="mission-list">
                                {missions.map(mission => (
                                    <div
                                        key={mission.id}
                                        className={`mission-item ${activeMission === mission.id ? 'active' : ''}`}
                                        onClick={() => setActiveMission(mission.id)}
                                    >
                                        <div className="mission-name">{mission.name}</div>
                                        <div className="mission-status">{mission.status}</div>
                                        <div className="mission-progress">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${mission.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </MissionControl>
                    </GlassCard>
                </div>

                <div>
                    <GlassCard>
                        <h3>Space Visualization</h3>
                        <SpaceVisualization>
                            <div className="space-display">
                                <div className="earth">
                                    <div className="continent"></div>
                                    <div className="continent"></div>
                                    <div className="continent"></div>
                                </div>
                                <div className="satellite"></div>
                                <div className="satellite"></div>
                                <div className="satellite"></div>
                            </div>
                        </SpaceVisualization>
                    </GlassCard>
                </div>

                <div>
                    <GlassCard>
                        <h3>Satellite Tracking</h3>
                        <SatelliteTracking>
                            <div className="satellite-grid">
                                {satellites.map((satellite, index) => (
                                    <div key={index} className="satellite-card">
                                        <div className="satellite-header">
                                            <div className="satellite-name">{satellite.name}</div>
                                            <div className={`satellite-status ${satellite.status}`}>
                                                {satellite.status}
                                            </div>
                                        </div>
                                        <div className="satellite-metrics">
                                            <div className="metric">
                                                <span className="label">Altitude:</span>
                                                <span className="value">{satellite.altitude}</span>
                                            </div>
                                            <div className="metric">
                                                <span className="label">Speed:</span>
                                                <span className="value">{satellite.speed}</span>
                                            </div>
                                            <div className="metric">
                                                <span className="label">Orbit:</span>
                                                <span className="value">{satellite.orbit}</span>
                                            </div>
                                            <div className="metric">
                                                <span className="label">Crew:</span>
                                                <span className="value">{satellite.crew}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SatelliteTracking>
                    </GlassCard>
                </div>
            </MainGrid>
        </DashboardContainer>
    );
};