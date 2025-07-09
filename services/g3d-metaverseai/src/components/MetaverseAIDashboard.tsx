/**
 * G3D MetaverseAI - Virtual World Intelligence Dashboard
 * Advanced metaverse creation and virtual reality platform
 */

import React, { useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    GlassCard,
    GlassButton,
    baseGlassmorphismTheme
} from '../../../../shared/ui/src/components/index';

// Metaverse Theme (Rainbow/Holographic theme)
const metaverseTheme = {
    ...baseGlassmorphismTheme,
    primary: '#8b5cf6',
    secondary: '#06b6d4',
    accent: '#ec4899',
    glass: {
        background: 'rgba(139, 92, 246, 0.1)',
        border: 'rgba(139, 92, 246, 0.2)',
        blur: '12px'
    }
};

// Metaverse Animations
const holographicShimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const virtualFloat = keyframes`
  0%, 100% { transform: translateY(0px) rotateY(0deg); }
  50% { transform: translateY(-10px) rotateY(180deg); }
`;

const dataStream = keyframes`
  0% { transform: translateY(100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-100%); opacity: 0; }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0a1f 0%, #1e1b4b 25%, #581c87 50%, #be185d 75%, #0c4a6e 100%);
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
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(139, 92, 246, 0.1) 50%,
      transparent 70%
    );
    background-size: 200% 200%;
    animation: ${holographicShimmer} 8s infinite;
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
    background: linear-gradient(135deg, #8b5cf6, #06b6d4, #ec4899);
    background-size: 200% 200%;
    animation: ${holographicShimmer} 3s infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #8b5cf6, #06b6d4, #ec4899);
    background-size: 200% 200%;
    animation: ${holographicShimmer} 3s infinite;
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

const VirtualWorldViewer = styled.div`
  position: relative;
  min-height: 500px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  
  .world-display {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: radial-gradient(circle at center, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.1));
    
    .virtual-objects {
      position: relative;
      width: 300px;
      height: 300px;
      
      .vr-cube {
        position: absolute;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #8b5cf6, #06b6d4);
        border-radius: 8px;
        animation: ${virtualFloat} 4s infinite;
        
        &:nth-child(1) {
          top: 20%;
          left: 30%;
          animation-delay: 0s;
        }
        
        &:nth-child(2) {
          top: 60%;
          right: 20%;
          animation-delay: 1s;
        }
        
        &:nth-child(3) {
          bottom: 30%;
          left: 50%;
          animation-delay: 2s;
        }
      }
      
      .data-particle {
        position: absolute;
        width: 4px;
        height: 20px;
        background: linear-gradient(180deg, #ec4899, transparent);
        animation: ${dataStream} 3s infinite;
        
        &:nth-child(4) { left: 10%; animation-delay: 0s; }
        &:nth-child(5) { left: 30%; animation-delay: 0.5s; }
        &:nth-child(6) { left: 50%; animation-delay: 1s; }
        &:nth-child(7) { left: 70%; animation-delay: 1.5s; }
        &:nth-child(8) { left: 90%; animation-delay: 2s; }
      }
    }
  }
`;

const WorldBuilder = styled.div`
  .builder-tools {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
    
    .tool-button {
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
      
      .tool-icon {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
      }
      
      .tool-label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #8b5cf6;
      }
    }
  }
  
  .world-templates {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    
    .template-item {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(139, 92, 246, 0.1);
      }
      
      .template-name {
        font-weight: 600;
        color: #8b5cf6;
        margin-bottom: 0.25rem;
      }
      
      .template-description {
        font-size: 0.8rem;
        color: #a1a1aa;
        margin-bottom: 0.5rem;
      }
      
      .template-tags {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        
        .tag {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          background: rgba(6, 182, 212, 0.2);
          color: #06b6d4;
          border-radius: 10px;
        }
      }
    }
  }
`;

const AvatarStudio = styled.div`
  .avatar-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    
    .avatar-card {
      background: rgba(139, 92, 246, 0.1);
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(139, 92, 246, 0.2);
        transform: scale(1.05);
      }
      
      .avatar-preview {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #ec4899, #06b6d4);
        border-radius: 50%;
        margin: 0 auto 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        animation: ${virtualFloat} 6s infinite;
      }
      
      .avatar-name {
        font-weight: 600;
        color: #8b5cf6;
        margin-bottom: 0.25rem;
      }
      
      .avatar-type {
        font-size: 0.8rem;
        color: #a1a1aa;
      }
    }
  }
`;

export const MetaverseAIDashboard: React.FC = () => {
    const [activeTool, setActiveTool] = useState<string>('terrain');
    const [selectedAvatar, setSelectedAvatar] = useState<string>('');

    const builderTools = [
        { id: 'terrain', icon: '🏔️', label: 'Terrain' },
        { id: 'objects', icon: '🏗️', label: 'Objects' },
        { id: 'lighting', icon: '💡', label: 'Lighting' },
        { id: 'physics', icon: '⚡', label: 'Physics' }
    ];

    const worldTemplates = [
        {
            name: 'Cyberpunk City',
            description: 'Futuristic neon-lit metropolis',
            tags: ['Urban', 'Sci-Fi', 'Neon']
        },
        {
            name: 'Fantasy Forest',
            description: 'Magical woodland realm',
            tags: ['Nature', 'Fantasy', 'Magic']
        },
        {
            name: 'Space Station',
            description: 'Zero-gravity orbital platform',
            tags: ['Space', 'Sci-Fi', 'Tech']
        },
        {
            name: 'Underwater City',
            description: 'Submerged aquatic civilization',
            tags: ['Ocean', 'Fantasy', 'Unique']
        }
    ];

    const avatars = [
        { id: 'human', name: 'Human', type: 'Realistic', emoji: '👤' },
        { id: 'robot', name: 'Cyborg', type: 'Sci-Fi', emoji: '🤖' },
        { id: 'alien', name: 'Alien', type: 'Fantasy', emoji: '👽' },
        { id: 'animal', name: 'Furry', type: 'Creature', emoji: '🐺' }
    ];

    const handleCreateWorld = useCallback(() => {
        console.log('Creating new virtual world...');
    }, []);

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">🌐</div>
                    <h1>G3D MetaverseAI</h1>
                </Logo>
                <GlassButton
                    variant="primary"
                    onClick={handleCreateWorld}
                >
                    Create World
                </GlassButton>
            </Header>

            <MainGrid>
                <div>
                    <GlassCard>
                        <h3>World Builder</h3>
                        <WorldBuilder>
                            <div className="builder-tools">
                                {builderTools.map(tool => (
                                    <div
                                        key={tool.id}
                                        className={`tool-button ${activeTool === tool.id ? 'active' : ''}`}
                                        onClick={() => setActiveTool(tool.id)}
                                    >
                                        <div className="tool-icon">{tool.icon}</div>
                                        <div className="tool-label">{tool.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="world-templates">
                                {worldTemplates.map((template, index) => (
                                    <div key={index} className="template-item">
                                        <div className="template-name">{template.name}</div>
                                        <div className="template-description">{template.description}</div>
                                        <div className="template-tags">
                                            {template.tags.map((tag, tagIndex) => (
                                                <div key={tagIndex} className="tag">{tag}</div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </WorldBuilder>
                    </GlassCard>
                </div>

                <div>
                    <GlassCard>
                        <h3>Virtual World Viewer</h3>
                        <VirtualWorldViewer>
                            <div className="world-display">
                                <div className="virtual-objects">
                                    <div className="vr-cube"></div>
                                    <div className="vr-cube"></div>
                                    <div className="vr-cube"></div>
                                    <div className="data-particle"></div>
                                    <div className="data-particle"></div>
                                    <div className="data-particle"></div>
                                    <div className="data-particle"></div>
                                    <div className="data-particle"></div>
                                </div>
                            </div>
                        </VirtualWorldViewer>
                    </GlassCard>
                </div>

                <div>
                    <GlassCard>
                        <h3>Avatar Studio</h3>
                        <AvatarStudio>
                            <div className="avatar-grid">
                                {avatars.map(avatar => (
                                    <div
                                        key={avatar.id}
                                        className="avatar-card"
                                        onClick={() => setSelectedAvatar(avatar.id)}
                                    >
                                        <div className="avatar-preview">
                                            {avatar.emoji}
                                        </div>
                                        <div className="avatar-name">{avatar.name}</div>
                                        <div className="avatar-type">{avatar.type}</div>
                                    </div>
                                ))}
                            </div>
                        </AvatarStudio>
                    </GlassCard>
                </div>
            </MainGrid>
        </DashboardContainer>
    );
};