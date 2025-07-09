/**
 * G3D NeuroAI - Neural Interface Platform Dashboard
 * Advanced brain-computer interface and neural analysis
 */

import React, { useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    GlassCard,
    GlassButton,
    baseGlassmorphismTheme
} from '../../../../shared/ui/src/components/index';

// Neural Theme (Purple/Pink neural theme)
const neuralTheme = {
    ...baseGlassmorphismTheme,
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#06b6d4',
    glass: {
        background: 'rgba(139, 92, 246, 0.1)',
        border: 'rgba(139, 92, 246, 0.2)',
        blur: '12px'
    }
};

// Neural Animations
const brainPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
`;

const neuralSignal = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #be185d 100%);
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
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: ${brainPulse} 3s infinite;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 1.5rem;
  height: calc(100vh - 140px);
`;

const BrainVisualization = styled.div`
  position: relative;
  min-height: 500px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  
  .brain-display {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    .brain-outline {
      width: 200px;
      height: 200px;
      border: 3px solid #8b5cf6;
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      position: relative;
      animation: ${brainPulse} 4s infinite;
      
      .neural-pathway {
        position: absolute;
        height: 2px;
        background: linear-gradient(90deg, transparent, #ec4899, transparent);
        animation: ${neuralSignal} 2s infinite;
        
        &:nth-child(1) {
          top: 30%;
          left: 0;
          right: 0;
          animation-delay: 0s;
        }
        
        &:nth-child(2) {
          top: 50%;
          left: 0;
          right: 0;
          animation-delay: 0.5s;
        }
        
        &:nth-child(3) {
          top: 70%;
          left: 0;
          right: 0;
          animation-delay: 1s;
        }
      }
      
      .neural-node {
        position: absolute;
        width: 12px;
        height: 12px;
        background: #06b6d4;
        border-radius: 50%;
        animation: ${brainPulse} 2s infinite;
        
        &:nth-child(4) { top: 20%; left: 30%; animation-delay: 0.2s; }
        &:nth-child(5) { top: 40%; right: 25%; animation-delay: 0.7s; }
        &:nth-child(6) { bottom: 30%; left: 40%; animation-delay: 1.2s; }
        &:nth-child(7) { bottom: 20%; right: 35%; animation-delay: 1.7s; }
      }
    }
  }
`;

const EEGMonitor = styled.div`
  .eeg-channels {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    .channel {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      
      .channel-label {
        font-weight: 600;
        color: #8b5cf6;
        min-width: 40px;
      }
      
      .waveform {
        flex: 1;
        height: 30px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 4px;
        position: relative;
        overflow: hidden;
        
        .wave {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #ec4899, transparent);
          animation: ${neuralSignal} 1.5s infinite;
        }
      }
      
      .amplitude {
        font-size: 0.8rem;
        color: #a1a1aa;
        min-width: 50px;
        text-align: right;
      }
    }
  }
`;

const BCIControls = styled.div`
  .control-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    
    .control-button {
      padding: 1rem;
      background: rgba(139, 92, 246, 0.1);
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(139, 92, 246, 0.2);
        transform: translateY(-2px);
      }
      
      &.active {
        background: rgba(139, 92, 246, 0.3);
        border: 1px solid #8b5cf6;
      }
      
      .control-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }
      
      .control-label {
        font-weight: 600;
        color: #8b5cf6;
      }
    }
  }
`;

export const NeuroAIDashboard: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [activeControl, setActiveControl] = useState<string>('');

    const eegChannels = [
        { label: 'Fp1', amplitude: '45μV' },
        { label: 'Fp2', amplitude: '38μV' },
        { label: 'F3', amplitude: '52μV' },
        { label: 'F4', amplitude: '41μV' },
        { label: 'C3', amplitude: '47μV' },
        { label: 'C4', amplitude: '39μV' },
        { label: 'P3', amplitude: '44μV' },
        { label: 'P4', amplitude: '36μV' },
        { label: 'O1', amplitude: '33μV' },
        { label: 'O2', amplitude: '31μV' }
    ];

    const bciControls = [
        { id: 'cursor', icon: '🖱️', label: 'Cursor Control' },
        { id: 'keyboard', icon: '⌨️', label: 'Virtual Keyboard' },
        { id: 'prosthetic', icon: '🦾', label: 'Prosthetic Arm' },
        { id: 'wheelchair', icon: '♿', label: 'Wheelchair' }
    ];

    const handleStartRecording = useCallback(() => {
        setIsRecording(!isRecording);
    }, [isRecording]);

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">🧠</div>
                    <h1>G3D NeuroAI</h1>
                </Logo>
                <GlassButton
                    variant="primary"
                    onClick={handleStartRecording}
                >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </GlassButton>
            </Header>

            <MainGrid>
                <div>
                    <GlassCard>
                        <h3>EEG Monitoring</h3>
                        <EEGMonitor>
                            <div className="eeg-channels">
                                {eegChannels.map((channel, index) => (
                                    <div key={index} className="channel">
                                        <div className="channel-label">{channel.label}</div>
                                        <div className="waveform">
                                            <div
                                                className="wave"
                                                style={{ animationDelay: `${index * 0.1}s` }}
                                            ></div>
                                        </div>
                                        <div className="amplitude">{channel.amplitude}</div>
                                    </div>
                                ))}
                            </div>
                        </EEGMonitor>
                    </GlassCard>
                </div>

                <div>
                    <GlassCard>
                        <h3>Brain Activity Visualization</h3>
                        <BrainVisualization>
                            <div className="brain-display">
                                <div className="brain-outline">
                                    <div className="neural-pathway"></div>
                                    <div className="neural-pathway"></div>
                                    <div className="neural-pathway"></div>
                                    <div className="neural-node"></div>
                                    <div className="neural-node"></div>
                                    <div className="neural-node"></div>
                                    <div className="neural-node"></div>
                                </div>
                            </div>
                        </BrainVisualization>
                    </GlassCard>
                </div>

                <div>
                    <GlassCard>
                        <h3>BCI Controls</h3>
                        <BCIControls>
                            <div className="control-grid">
                                {bciControls.map(control => (
                                    <div
                                        key={control.id}
                                        className={`control-button ${activeControl === control.id ? 'active' : ''}`}
                                        onClick={() => setActiveControl(control.id)}
                                    >
                                        <div className="control-icon">{control.icon}</div>
                                        <div className="control-label">{control.label}</div>
                                    </div>
                                ))}
                            </div>
                        </BCIControls>
                    </GlassCard>
                </div>
            </MainGrid>
        </DashboardContainer>
    );
};