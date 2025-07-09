/**
 * G3D Mesh3D - 3D Model Generation Dashboard
 * Complete 3D asset generation platform with AI-powered mesh and texture creation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

// Mesh3D Theme (3D purple/magenta theme)
const mesh3dTheme = {
    primary: '#a855f7',
    secondary: '#9333ea',
    accent: '#c084fc',
    glass: {
        background: 'rgba(168, 85, 247, 0.1)',
        border: 'rgba(168, 85, 247, 0.2)',
        blur: '12px'
    }
};

// Animations
const meshRotation = keyframes`
  0% { transform: rotateY(0deg) rotateX(15deg); }
  25% { transform: rotateY(90deg) rotateX(15deg); }
  50% { transform: rotateY(180deg) rotateX(15deg); }
  75% { transform: rotateY(270deg) rotateX(15deg); }
  100% { transform: rotateY(360deg) rotateX(15deg); }
`;

const generationPulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(168, 85, 247, 0.3); }
  50% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.8); }
`;

const meshWave = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.05) rotate(5deg); }
`;

const vertexFlow = keyframes`
  0% { opacity: 0; transform: translateY(-20px); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translateY(20px); }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #a855f7 100%);
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
    background: linear-gradient(135deg, #a855f7, #9333ea);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #a855f7, #9333ea);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: ${meshRotation} 8s infinite linear;
  }
`;

const GenerationStatus = styled.div`
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
    
    &.generating {
      background: rgba(168, 85, 247, 0.2);
      color: #a855f7;
      animation: ${generationPulse} 2s infinite;
    }
    
    &.ready {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }
    
    &.error {
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
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 12px;
  padding: ${props =>
        props.size === 'sm' ? '1rem' :
            props.size === 'lg' ? '2rem' : '1.5rem'};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const Viewport3D = styled.div`
  position: relative;
  min-height: 500px;
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5));
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(168, 85, 247, 0.3);
  
  .viewport-content {
    width: 100%;
    height: 100%;
    position: relative;
    
    .mesh-display {
      width: 100%;
      height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      
      .mesh-placeholder {
        width: 300px;
        height: 300px;
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(147, 51, 234, 0.3));
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid rgba(168, 85, 247, 0.5);
        animation: ${meshWave} 4s infinite;
        
        .mesh-icon {
          font-size: 4rem;
          color: #a855f7;
          animation: ${meshRotation} 6s infinite linear;
        }
      }
      
      .mesh-preview {
        width: 400px;
        height: 400px;
        background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
        border-radius: 12px;
        position: relative;
        overflow: hidden;
        border: 2px solid rgba(168, 85, 247, 0.5);
        
        .mesh-wireframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(45deg, transparent 48%, rgba(168, 85, 247, 0.3) 49%, rgba(168, 85, 247, 0.3) 51%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(168, 85, 247, 0.3) 49%, rgba(168, 85, 247, 0.3) 51%, transparent 52%);
          background-size: 20px 20px;
          animation: ${meshRotation} 10s infinite linear;
        }
        
        .mesh-vertices {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          
          .vertex {
            position: absolute;
            width: 4px;
            height: 4px;
            background: #a855f7;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(168, 85, 247, 0.8);
            animation: ${vertexFlow} 3s infinite;
            
            &:nth-child(1) { top: 20%; left: 30%; animation-delay: 0s; }
            &:nth-child(2) { top: 40%; left: 70%; animation-delay: 0.5s; }
            &:nth-child(3) { top: 60%; left: 20%; animation-delay: 1s; }
            &:nth-child(4) { top: 80%; left: 60%; animation-delay: 1.5s; }
            &:nth-child(5) { top: 30%; left: 80%; animation-delay: 2s; }
            &:nth-child(6) { top: 70%; left: 40%; animation-delay: 2.5s; }
          }
        }
      }
      
      .generation-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        
        .generation-progress {
          width: 200px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          margin-bottom: 1rem;
          overflow: hidden;
          
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #a855f7, #c084fc);
            border-radius: 3px;
            transition: width 0.3s ease;
          }
        }
        
        .generation-text {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #a855f7;
        }
        
        .generation-subtext {
          font-size: 0.9rem;
          opacity: 0.7;
        }
      }
    }
    
    .viewport-controls {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      .control-button {
        width: 40px;
        height: 40px;
        background: rgba(168, 85, 247, 0.2);
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 8px;
        color: #a855f7;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(168, 85, 247, 0.3);
          transform: scale(1.1);
        }
      }
    }
    
    .viewport-info {
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      background: rgba(0, 0, 0, 0.5);
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.8rem;
      
      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.25rem;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          opacity: 0.7;
          margin-right: 1rem;
        }
        
        .value {
          color: #a855f7;
          font-weight: 600;
        }
      }
    }
  }
`;

const MeshProperties = styled.div`
  .property-section {
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
      
      .randomize-button {
        font-size: 0.8rem;
        color: #c084fc;
        cursor: pointer;
        
        &:hover {
          color: #a855f7;
        }
      }
    }
    
    .property-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
      
      .property-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        
        .property-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .property-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          
          input[type="range"] {
            width: 80px;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            outline: none;
            
            &::-webkit-slider-thumb {
              appearance: none;
              width: 16px;
              height: 16px;
              background: #a855f7;
              border-radius: 50%;
              cursor: pointer;
            }
          }
          
          .property-value {
            font-size: 0.8rem;
            color: #a855f7;
            min-width: 40px;
            text-align: right;
          }
        }
      }
    }
  }
`;

const TexturePanel = styled.div`
  .texture-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
    
    .texture-option {
      aspect-ratio: 1;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.2));
      border: 2px solid rgba(168, 85, 247, 0.3);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      
      &:hover {
        border-color: #a855f7;
        transform: scale(1.05);
      }
      
      &.selected {
        border-color: #a855f7;
        background: rgba(168, 85, 247, 0.3);
      }
      
      .texture-icon {
        font-size: 1.5rem;
        color: #a855f7;
      }
      
      .texture-name {
        position: absolute;
        bottom: 0.5rem;
        left: 0.5rem;
        right: 0.5rem;
        font-size: 0.7rem;
        text-align: center;
        background: rgba(0, 0, 0, 0.5);
        padding: 0.25rem;
        border-radius: 4px;
      }
    }
  }
`;

const AssetLibrary = styled.div`
  .asset-item {
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
      transform: translateX(4px);
    }
    
    .asset-thumbnail {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(147, 51, 234, 0.3));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: #a855f7;
      animation: ${meshWave} 3s infinite;
    }
    
    .asset-info {
      flex: 1;
      
      .asset-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
        color: #a855f7;
      }
      
      .asset-details {
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
    
    .asset-actions {
      display: flex;
      gap: 0.5rem;
      
      .action-button {
        width: 32px;
        height: 32px;
        background: rgba(168, 85, 247, 0.2);
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 6px;
        color: #a855f7;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(168, 85, 247, 0.3);
        }
      }
    }
  }
`;

const GenerationHistory = styled.div`
  .history-item {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    border-left: 4px solid #a855f7;
    
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      
      .generation-type {
        background: rgba(168, 85, 247, 0.2);
        color: #a855f7;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.7rem;
      }
      
      .timestamp {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
    
    .history-content {
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 0.75rem;
    }
    
    .history-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      opacity: 0.7;
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
    }
  }
`;

const GlassButton = styled.button<{ variant?: 'primary' | 'secondary' | 'ghost'; fullWidth?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  background: ${props =>
        props.variant === 'primary' ? 'rgba(168, 85, 247, 0.2)' :
            props.variant === 'secondary' ? 'rgba(147, 51, 234, 0.2)' :
                'rgba(255, 255, 255, 0.1)'};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  &:hover {
    background: ${props =>
        props.variant === 'primary' ? 'rgba(168, 85, 247, 0.3)' :
            props.variant === 'secondary' ? 'rgba(147, 51, 234, 0.3)' :
                'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-2px);
  }
`;

// Main Component
export const Mesh3DGenerationDashboard: React.FC = () => {
    // State Management
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [selectedTexture, setSelectedTexture] = useState('metallic');
    const [meshProperties, setMeshProperties] = useState({
        complexity: 50,
        smoothness: 75,
        scale: 100,
        detail: 60
    });

    // Sample mesh data
    const meshStats = {
        vertices: 12847,
        faces: 25694,
        materials: 3,
        animations: 0,
        fileSize: '2.4MB',
        renderTime: '0.8s'
    };

    // Sample texture options
    const textureOptions = [
        { id: 'metallic', name: 'Metallic', icon: '⚡' },
        { id: 'wood', name: 'Wood', icon: '🌳' },
        { id: 'stone', name: 'Stone', icon: '🗿' },
        { id: 'fabric', name: 'Fabric', icon: '🧵' },
        { id: 'glass', name: 'Glass', icon: '💎' },
        { id: 'plastic', name: 'Plastic', icon: '🔮' }
    ];

    // Sample asset library
    const assetLibrary = [
        {
            id: 'asset-001',
            name: 'Geometric Sphere',
            type: 'Primitive',
            vertices: 1024,
            faces: 2048,
            size: '512KB',
            icon: '⚪'
        },
        {
            id: 'asset-002',
            name: 'Abstract Sculpture',
            type: 'Artistic',
            vertices: 5632,
            faces: 11264,
            size: '1.2MB',
            icon: '🎨'
        },
        {
            id: 'asset-003',
            name: 'Mechanical Part',
            type: 'Industrial',
            vertices: 8945,
            faces: 17890,
            size: '1.8MB',
            icon: '⚙️'
        },
        {
            id: 'asset-004',
            name: 'Organic Form',
            type: 'Natural',
            vertices: 3421,
            faces: 6842,
            size: '890KB',
            icon: '🌿'
        }
    ];

    // Event Handlers
    const handleGenerate3D = useCallback(async () => {
        setIsGenerating(true);
        setGenerationProgress(0);

        try {
            // Simulate 3D generation process
            const stages = [
                { progress: 20, message: 'Analyzing input parameters...' },
                { progress: 40, message: 'Generating mesh vertices...' },
                { progress: 60, message: 'Creating face topology...' },
                { progress: 80, message: 'Applying textures...' },
                { progress: 100, message: 'Finalizing 3D model...' }
            ];

            for (const stage of stages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                setGenerationProgress(stage.progress);
            }
        } catch (error) {
            console.error('3D generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const handlePropertyChange = useCallback((property: string, value: number) => {
        setMeshProperties(prev => ({
            ...prev,
            [property]: value
        }));
    }, []);

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">🎲</div>
                    <h1>G3D Mesh3D Generation</h1>
                </Logo>
                <GenerationStatus>
                    <div className={`status-indicator ${isGenerating ? 'generating' : 'ready'}`}>
                        <div className="dot" />
                        <span>{isGenerating ? `Generating... ${generationProgress}%` : 'Ready'}</span>
                    </div>
                    <GlassButton
                        variant="primary"
                        onClick={handleGenerate3D}
                        disabled={isGenerating}
                    >
                        🎯 Generate 3D Model
                    </GlassButton>
                </GenerationStatus>
            </Header>

            <MainGrid>
                {/* Left Panel - Mesh Properties & Controls */}
                <LeftPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Mesh Properties</h3>
                        <MeshProperties>
                            <div className="property-section">
                                <div className="section-header">
                                    <h4>Geometry</h4>
                                    <span className="randomize-button">🎲 Randomize</span>
                                </div>
                                <div className="property-grid">
                                    <div className="property-item">
                                        <span className="property-label">Complexity:</span>
                                        <div className="property-control">
                                            <input
                                                type="range"
                                                min="10"
                                                max="100"
                                                value={meshProperties.complexity}
                                                onChange={(e) => handlePropertyChange('complexity', parseInt(e.target.value))}
                                            />
                                            <span className="property-value">{meshProperties.complexity}%</span>
                                        </div>
                                    </div>
                                    <div className="property-item">
                                        <span className="property-label">Smoothness:</span>
                                        <div className="property-control">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={meshProperties.smoothness}
                                                onChange={(e) => handlePropertyChange('smoothness', parseInt(e.target.value))}
                                            />
                                            <span className="property-value">{meshProperties.smoothness}%</span>
                                        </div>
                                    </div>
                                    <div className="property-item">
                                        <span className="property-label">Scale:</span>
                                        <div className="property-control">
                                            <input
                                                type="range"
                                                min="25"
                                                max="200"
                                                value={meshProperties.scale}
                                                onChange={(e) => handlePropertyChange('scale', parseInt(e.target.value))}
                                            />
                                            <span className="property-value">{meshProperties.scale}%</span>
                                        </div>
                                    </div>
                                    <div className="property-item">
                                        <span className="property-label">Detail Level:</span>
                                        <div className="property-control">
                                            <input
                                                type="range"
                                                min="10"
                                                max="100"
                                                value={meshProperties.detail}
                                                onChange={(e) => handlePropertyChange('detail', parseInt(e.target.value))}
                                            />
                                            <span className="property-value">{meshProperties.detail}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </MeshProperties>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Texture & Materials</h3>
                        <TexturePanel>
                            <div className="texture-grid">
                                {textureOptions.map(texture => (
                                    <div
                                        key={texture.id}
                                        className={`texture-option ${selectedTexture === texture.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedTexture(texture.id)}
                                    >
                                        <div className="texture-icon">{texture.icon}</div>
                                        <div className="texture-name">{texture.name}</div>
                                    </div>
                                ))}
                            </div>
                            <GlassButton variant="ghost" fullWidth>
                                🎨 Custom Texture
                            </GlassButton>
                        </TexturePanel>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Export Options</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="secondary" fullWidth>
                                📦 Export as OBJ
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth>
                                🎭 Export as FBX
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth>
                                💎 Export as GLB
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                ⚙️ Custom Format
                            </GlassButton>
                        </div>
                    </GlassCard>
                </LeftPanel>

                {/* Center Panel - 3D Viewport */}
                <CenterPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>3D Viewport</h3>
                        <Viewport3D>
                            <div className="viewport-content">
                                <div className="mesh-display">
                                    {!isGenerating && (
                                        <div className="mesh-placeholder">
                                            <div className="mesh-icon">🎲</div>
                                        </div>
                                    )}

                                    {isGenerating && (
                                        <>
                                            <div className="mesh-preview">
                                                <div className="mesh-wireframe" />
                                                <div className="mesh-vertices">
                                                    <div className="vertex" />
                                                    <div className="vertex" />
                                                    <div className="vertex" />
                                                    <div className="vertex" />
                                                    <div className="vertex" />
                                                    <div className="vertex" />
                                                </div>
                                            </div>
                                            <div className="generation-overlay">
                                                <div className="generation-progress">
                                                    <div
                                                        className="progress-fill"
                                                        style={{ width: `${generationProgress}%` }}
                                                    />
                                                </div>
                                                <div className="generation-text">Generating 3D Model</div>
                                                <div className="generation-subtext">{generationProgress}% Complete</div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="viewport-controls">
                                    <div className="control-button" title="Rotate">🔄</div>
                                    <div className="control-button" title="Pan">✋</div>
                                    <div className="control-button" title="Zoom">🔍</div>
                                    <div className="control-button" title="Reset View">🏠</div>
                                </div>

                                <div className="viewport-info">
                                    <div className="info-item">
                                        <span className="label">Vertices:</span>
                                        <span className="value">{meshStats.vertices.toLocaleString()}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Faces:</span>
                                        <span className="value">{meshStats.faces.toLocaleString()}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Materials:</span>
                                        <span className="value">{meshStats.materials}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">File Size:</span>
                                        <span className="value">{meshStats.fileSize}</span>
                                    </div>
                                </div>
                            </div>
                        </Viewport3D>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Generation Tools</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            <GlassButton variant="ghost" fullWidth>
                                🎯 Auto Generate
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🔧 Manual Edit
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📐 Measure
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🎨 Paint
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                ✂️ Boolean Ops
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🔄 Subdivide
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📊 Analyze
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                💡 Optimize
                            </GlassButton>
                        </div>
                    </GlassCard>
                </CenterPanel>

                {/* Right Panel - Asset Library & History */}
                <RightPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Asset Library</h3>
                        <AssetLibrary>
                            {assetLibrary.map(asset => (
                                <div key={asset.id} className="asset-item">
                                    <div className="asset-thumbnail">
                                        {asset.icon}
                                    </div>
                                    <div className="asset-info">
                                        <div className="asset-name">{asset.name}</div>
                                        <div className="asset-details">
                                            <div className="detail-item">
                                                <span>📊</span>
                                                <span>{asset.vertices} vertices</span>
                                            </div>
                                            <div className="detail-item">
                                                <span>💾</span>
                                                <span>{asset.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="asset-actions">
                                        <div className="action-button" title="Load">📥</div>
                                        <div className="action-button" title="Preview">👁️</div>
                                        <div className="action-button" title="Clone">📋</div>
                                    </div>
                                </div>
                            ))}
                        </AssetLibrary>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Generation History</h3>
                        <GenerationHistory>
                            <div className="history-item">
                                <div className="history-header">
                                    <span className="generation-type">Geometric</span>
                                    <span className="timestamp">2 hours ago</span>
                                </div>
                                <div className="history-content">
                                    Generated complex geometric sculpture with metallic texture and high detail level.
                                </div>
                                <div className="history-stats">
                                    <div className="stat-item">
                                        <span>⏱️</span>
                                        <span>3.2s</span>
                                    </div>
                                    <div className="stat-item">
                                        <span>📊</span>
                                        <span>15K vertices</span>
                                    </div>
                                    <div className="stat-item">
                                        <span>💾</span>
                                        <span>2.1MB</span>
                                    </div>
                                </div>
                            </div>

                            <div className="history-item">
                                <div className="history-header">
                                    <span className="generation-type">Organic</span>
                                    <span className="timestamp">5 hours ago</span>
                                </div>
                                <div className="history-content">
                                    Created organic form with wood texture and medium complexity settings.
                                </div>
                                <div className="history-stats">
                                    <div className="stat-item">
                                        <span>⏱️</span>
                                        <span>2.8s</span>
                                    </div>
                                    <div className="stat-item">
                                        <span>📊</span>
                                        <span>8K vertices</span>
                                    </div>
                                    <div className="stat-item">
                                        <span>💾</span>
                                        <span>1.4MB</span>
                                    </div>
                                </div>
                            </div>

                            <div className="history-item">
                                <div className="history-header">
                                    <span className="generation-type">Industrial</span>
                                    <span className="timestamp">1 day ago</span>
                                </div>
                                <div className="history-content">
                                    Designed mechanical component with precise measurements and technical specifications.
                                </div>
                                <div className="history-stats">
                                    <div className="stat-item">
                                        <span>⏱️</span>
                                        <span>4.1s</span>
                                    </div>
                                    <div className="stat-item">
                                        <span>📊</span>
                                        <span>22K vertices</span>
                                    </div>
                                    <div className="stat-item">
                                        <span>💾</span>
                                        <span>3.2MB</span>
                                    </div>
                                </div>
                            </div>
                        </GenerationHistory>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="primary" fullWidth>
                                🚀 Batch Generate
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth>
                                📤 Upload Reference
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🔄 Random Seed
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                💾 Save Project
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                ⚙️ Advanced Settings
                            </GlassButton>
                        </div>
                    </GlassCard>
                </RightPanel>
            </MainGrid>
        </DashboardContainer>
    );
};

export default Mesh3DGenerationDashboard;