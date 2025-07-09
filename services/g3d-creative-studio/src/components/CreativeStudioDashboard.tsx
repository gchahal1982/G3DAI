/**
 * G3D Creative Studio - Advanced Content Generation Platform
 * Complete frontend implementation with multi-modal AI creation tools
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
    CreativeProject,
    ContentGenerationRequest,
    GeneratedContent,
    AIModel,
    CreativeTemplate,
    ContentType,
    MediaAsset,
    RenderJob
} from '../types/creative.types';
import { CreativeAIEngine } from '../services/CreativeAIEngine';

// Creative Studio Theme
const creativeTheme = {
    ...baseGlassmorphismTheme,
    ...serviceThemeOverrides['creative-studio']
};

// Animations
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const fadeInUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const rotateIn = keyframes`
  from { transform: rotate(-180deg) scale(0.5); opacity: 0; }
  to { transform: rotate(0deg) scale(1); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  padding: 1.5rem;
  color: white;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #ec4899, #f59e0b, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #ec4899, #f59e0b);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: ${rotateIn} 1s ease-out;
  }
`;

const StatusBar = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const CreationModeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  
  .mode-tab {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    
    &.active {
      background: linear-gradient(135deg, #ec4899, #f59e0b);
      color: white;
    }
    
    &:hover:not(.active) {
      background: rgba(236, 72, 153, 0.2);
    }
  }
`;

const MainLayout = styled.div`
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

const CreativeCanvas = styled.div`
  position: relative;
  min-height: 500px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  
  .canvas-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 1rem;
    
    &.has-content {
      border: none;
      padding: 0;
    }
    
    .placeholder {
      text-align: center;
      opacity: 0.6;
      
      .icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }
      
      .text {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
      }
      
      .subtext {
        font-size: 0.9rem;
        opacity: 0.7;
      }
    }
    
    .generated-content {
      width: 100%;
      height: 100%;
      position: relative;
      
      img, video {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 8px;
      }
      
      .content-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: 8px;
        
        &:hover {
          opacity: 1;
        }
      }
    }
  }
  
  .generation-progress {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    
    .progress-ring {
      width: 80px;
      height: 80px;
      border: 4px solid rgba(236, 72, 153, 0.3);
      border-top: 4px solid #ec4899;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    
    .progress-text {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }
    
    .progress-subtext {
      font-size: 0.9rem;
      opacity: 0.7;
    }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PromptInput = styled.div`
  .prompt-container {
    position: relative;
    
    .prompt-textarea {
      width: 100%;
      min-height: 120px;
      padding: 1rem;
      background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(245, 158, 11, 0.1));
      border: 1px solid rgba(236, 72, 153, 0.3);
      border-radius: 12px;
      color: white;
      font-family: inherit;
      font-size: 1rem;
      resize: vertical;
      outline: none;
      
      &:focus {
        border-color: #ec4899;
        box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
      }
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
    }
    
    .prompt-actions {
      display: flex;
      justify-content: between;
      align-items: center;
      margin-top: 1rem;
      
      .prompt-suggestions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        flex: 1;
        
        .suggestion-chip {
          padding: 0.25rem 0.75rem;
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 16px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            background: rgba(245, 158, 11, 0.3);
            transform: translateY(-1px);
          }
        }
      }
      
      .generate-button {
        background: linear-gradient(135deg, #ec4899, #f59e0b);
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
      }
    }
  }
`;

const TemplateGallery = styled.div`
  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
  }
  
  .template-card {
    aspect-ratio: 1;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &:hover {
      transform: scale(1.05);
      background: rgba(236, 72, 153, 0.1);
    }
    
    &.active {
      border: 2px solid #ec4899;
      background: rgba(236, 72, 153, 0.2);
    }
    
    .template-preview {
      width: 100%;
      height: 70%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
    }
    
    .template-name {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.5rem;
      background: rgba(0, 0, 0, 0.7);
      font-size: 0.8rem;
      text-align: center;
    }
  }
`;

const ModelSelector = styled.div`
  .model-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    
    .model-tab {
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      
      &.active {
        background: linear-gradient(135deg, #ec4899, #f59e0b);
      }
      
      &:hover:not(.active) {
        background: rgba(236, 72, 153, 0.1);
      }
    }
  }
  
  .model-settings {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    
    .setting-group {
      .setting-label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        opacity: 0.9;
      }
      
      .setting-control {
        width: 100%;
        
        input[type="range"] {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          outline: none;
          
          &::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            background: #ec4899;
            border-radius: 50%;
            cursor: pointer;
          }
        }
        
        select {
          width: 100%;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: white;
          outline: none;
        }
      }
      
      .setting-value {
        float: right;
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
  }
`;

const GenerationHistory = styled.div`
  .history-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 0.5rem;
  }
  
  .history-item {
    aspect-ratio: 1;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &:hover {
      transform: scale(1.05);
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .history-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      
      &:hover {
        opacity: 1;
      }
    }
    
    .timestamp {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.25rem;
      background: rgba(0, 0, 0, 0.8);
      font-size: 0.7rem;
      text-align: center;
    }
  }
`;

const AssetLibrary = styled.div`
  .asset-categories {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    
    .category-chip {
      padding: 0.25rem 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &.active {
        background: linear-gradient(135deg, #ec4899, #f59e0b);
      }
      
      &:hover:not(.active) {
        background: rgba(236, 72, 153, 0.1);
      }
    }
  }
  
  .asset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .asset-item {
    aspect-ratio: 1;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
    
    &:hover {
      transform: scale(1.1);
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

// Main Component
export const CreativeStudioDashboard: React.FC = () => {
    // State Management
    const [creationMode, setCreationMode] = useState<ContentType>('image');
    const [currentProject, setCurrentProject] = useState<CreativeProject | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>('dalle-3');
    const [modelSettings, setModelSettings] = useState({
        quality: 'standard',
        style: 'vivid',
        size: '1024x1024',
        steps: 20,
        guidance: 7.5
    });
    const [generationHistory, setGenerationHistory] = useState<any[]>([]);
    const [showSettings, setShowSettings] = useState(false);
    const [activeAssetCategory, setActiveAssetCategory] = useState('all');

    // Refs
    const creativeEngine = useRef(new CreativeAIEngine());

    // Creation modes
    const creationModes = [
        { id: 'image', label: '🎨 Image', icon: '🎨' },
        { id: 'video', label: '🎬 Video', icon: '🎬' },
        { id: 'audio', label: '🎵 Audio', icon: '🎵' },
        { id: 'text', label: '📝 Text', icon: '📝' },
        { id: '3d', label: '🎯 3D Model', icon: '🎯' }
    ];

    // Available templates
    const templates = {
        image: [
            { id: 'portrait', name: 'Portrait', icon: '👤' },
            { id: 'landscape', name: 'Landscape', icon: '🏔️' },
            { id: 'abstract', name: 'Abstract', icon: '🌀' },
            { id: 'concept-art', name: 'Concept Art', icon: '🎭' },
            { id: 'logo', name: 'Logo', icon: '🔷' },
            { id: 'illustration', name: 'Illustration', icon: '✏️' }
        ],
        video: [
            { id: 'motion-graphics', name: 'Motion Graphics', icon: '🎞️' },
            { id: 'animation', name: 'Animation', icon: '🎪' },
            { id: 'slideshow', name: 'Slideshow', icon: '📊' },
            { id: 'trailer', name: 'Trailer', icon: '🎬' }
        ],
        audio: [
            { id: 'music', name: 'Music', icon: '🎼' },
            { id: 'voice', name: 'Voice', icon: '🎤' },
            { id: 'sound-fx', name: 'Sound FX', icon: '🔊' },
            { id: 'podcast', name: 'Podcast', icon: '📻' }
        ]
    };

    // AI Models
    const aiModels = {
        image: [
            { id: 'dalle-3', name: 'DALL-E 3', description: 'OpenAI\'s latest image model' },
            { id: 'midjourney', name: 'Midjourney', description: 'Artistic and creative images' },
            { id: 'stable-diffusion', name: 'Stable Diffusion XL', description: 'Open-source powerhouse' },
            { id: 'firefly', name: 'Adobe Firefly', description: 'Commercial-safe generation' }
        ],
        video: [
            { id: 'runway', name: 'Runway Gen-2', description: 'Text-to-video generation' },
            { id: 'pika', name: 'Pika Labs', description: 'Creative video synthesis' },
            { id: 'stable-video', name: 'Stable Video', description: 'Open-source video AI' }
        ],
        audio: [
            { id: 'musiclm', name: 'MusicLM', description: 'Google\'s music generation' },
            { id: 'mubert', name: 'Mubert', description: 'AI music composition' },
            { id: 'elevenlabs', name: 'ElevenLabs', description: 'Voice synthesis' }
        ]
    };

    // Prompt suggestions
    const promptSuggestions = {
        image: [
            'Photorealistic portrait',
            'Fantasy landscape',
            'Minimalist design',
            'Vintage poster style',
            'Cyberpunk aesthetic'
        ],
        video: [
            'Smooth camera movement',
            'Dynamic transitions',
            'Particle effects',
            'Color grading',
            'Motion blur'
        ],
        audio: [
            'Upbeat electronic',
            'Ambient soundscape',
            'Jazz improvisation',
            'Epic orchestral',
            'Lo-fi hip hop'
        ]
    };

    // Event Handlers
    const handleGenerate = useCallback(async () => {
        if (!prompt.trim() || isGenerating) return;

        setIsGenerating(true);

        try {
            const request: ContentGenerationRequest = {
                type: creationMode,
                prompt,
                model: selectedModel,
                template: selectedTemplate,
                settings: modelSettings,
                options: {
                    quality: modelSettings.quality,
                    style: modelSettings.style,
                    size: modelSettings.size
                }
            };

            const result = await creativeEngine.current.generateContent(request);

            setGeneratedContent(prev => [result, ...prev.slice(0, 9)]);

            // Add to history
            setGenerationHistory(prev => [{
                id: crypto.randomUUID(),
                type: creationMode,
                prompt,
                result: result.url,
                timestamp: new Date(),
                model: selectedModel
            }, ...prev.slice(0, 19)]);

        } catch (error) {
            console.error('Generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [prompt, creationMode, selectedModel, selectedTemplate, modelSettings, isGenerating]);

    const handlePromptSuggestion = useCallback((suggestion: string) => {
        setPrompt(prev => prev ? `${prev}, ${suggestion}` : suggestion);
    }, []);

    const handleTemplateSelect = useCallback((templateId: string) => {
        setSelectedTemplate(templateId);
    }, []);

    const downloadContent = useCallback((content: GeneratedContent) => {
        const link = document.createElement('a');
        link.href = content.url;
        link.download = `generated-${content.type}-${Date.now()}`;
        link.click();
    }, []);

    // Get current templates and models
    const currentTemplates = templates[creationMode as keyof typeof templates] || [];
    const currentModels = aiModels[creationMode as keyof typeof aiModels] || [];
    const currentSuggestions = promptSuggestions[creationMode as keyof typeof promptSuggestions] || [];

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">🎨</div>
                    <h1>G3D Creative Studio</h1>
                </Logo>
                <StatusBar>
                    <CreationModeSelector>
                        {creationModes.map(mode => (
                            <div
                                key={mode.id}
                                className={`mode-tab ${creationMode === mode.id ? 'active' : ''}`}
                                onClick={() => setCreationMode(mode.id as ContentType)}
                            >
                                {mode.label}
                            </div>
                        ))}
                    </CreationModeSelector>
                    <GlassButton
                        variant="ghost"
                        onClick={() => setShowSettings(true)}
                        theme={creativeTheme}
                    >
                        ⚙️ Settings
                    </GlassButton>
                </StatusBar>
            </Header>

            <MainLayout>
                {/* Left Panel - Templates & Models */}
                <LeftPanel>
                    <GlassCard size="lg" theme={creativeTheme}>
                        <h3 style={{ marginTop: 0 }}>Templates</h3>
                        <TemplateGallery>
                            <div className="template-grid">
                                {currentTemplates.map(template => (
                                    <div
                                        key={template.id}
                                        className={`template-card ${selectedTemplate === template.id ? 'active' : ''}`}
                                        onClick={() => handleTemplateSelect(template.id)}
                                    >
                                        <div className="template-preview">{template.icon}</div>
                                        <div className="template-name">{template.name}</div>
                                    </div>
                                ))}
                            </div>
                        </TemplateGallery>
                    </GlassCard>

                    <GlassCard size="lg" theme={creativeTheme}>
                        <h3 style={{ marginTop: 0 }}>AI Models</h3>
                        <ModelSelector>
                            <div className="model-tabs">
                                {currentModels.map(model => (
                                    <div
                                        key={model.id}
                                        className={`model-tab ${selectedModel === model.id ? 'active' : ''}`}
                                        onClick={() => setSelectedModel(model.id)}
                                    >
                                        {model.name}
                                    </div>
                                ))}
                            </div>

                            <div className="model-settings">
                                <div className="setting-group">
                                    <label className="setting-label">
                                        Quality
                                        <span className="setting-value">{modelSettings.quality}</span>
                                    </label>
                                    <select
                                        className="setting-control"
                                        value={modelSettings.quality}
                                        onChange={(e) => setModelSettings(prev => ({ ...prev, quality: e.target.value }))}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="standard">Standard</option>
                                        <option value="high">High</option>
                                        <option value="ultra">Ultra</option>
                                    </select>
                                </div>

                                <div className="setting-group">
                                    <label className="setting-label">
                                        Style
                                        <span className="setting-value">{modelSettings.style}</span>
                                    </label>
                                    <select
                                        className="setting-control"
                                        value={modelSettings.style}
                                        onChange={(e) => setModelSettings(prev => ({ ...prev, style: e.target.value }))}
                                    >
                                        <option value="natural">Natural</option>
                                        <option value="vivid">Vivid</option>
                                        <option value="artistic">Artistic</option>
                                        <option value="photographic">Photographic</option>
                                    </select>
                                </div>

                                {creationMode === 'image' && (
                                    <div className="setting-group">
                                        <label className="setting-label">
                                            Guidance Scale
                                            <span className="setting-value">{modelSettings.guidance}</span>
                                        </label>
                                        <input
                                            type="range"
                                            className="setting-control"
                                            min="1"
                                            max="20"
                                            step="0.5"
                                            value={modelSettings.guidance}
                                            onChange={(e) => setModelSettings(prev => ({ ...prev, guidance: parseFloat(e.target.value) }))}
                                        />
                                    </div>
                                )}

                                <div className="setting-group">
                                    <label className="setting-label">
                                        Steps
                                        <span className="setting-value">{modelSettings.steps}</span>
                                    </label>
                                    <input
                                        type="range"
                                        className="setting-control"
                                        min="10"
                                        max="50"
                                        step="5"
                                        value={modelSettings.steps}
                                        onChange={(e) => setModelSettings(prev => ({ ...prev, steps: parseInt(e.target.value) }))}
                                    />
                                </div>
                            </div>
                        </ModelSelector>
                    </GlassCard>

                    <GlassCard size="lg" theme={creativeTheme}>
                        <h3 style={{ marginTop: 0 }}>Asset Library</h3>
                        <AssetLibrary>
                            <div className="asset-categories">
                                {['all', 'textures', 'backgrounds', 'objects', 'effects'].map(category => (
                                    <div
                                        key={category}
                                        className={`category-chip ${activeAssetCategory === category ? 'active' : ''}`}
                                        onClick={() => setActiveAssetCategory(category)}
                                    >
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </div>
                                ))}
                            </div>
                            <div className="asset-grid">
                                {Array.from({ length: 12 }, (_, i) => (
                                    <div key={i} className="asset-item">
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            background: `linear-gradient(${45 + i * 30}deg, #ec4899, #f59e0b)`,
                                            opacity: 0.3
                                        }} />
                                    </div>
                                ))}
                            </div>
                        </AssetLibrary>
                    </GlassCard>
                </LeftPanel>

                {/* Center Panel - Canvas & Prompt */}
                <CenterPanel>
                    <GlassCard size="lg" theme={creativeTheme}>
                        <CreativeCanvas>
                            <div className={`canvas-content ${generatedContent.length > 0 ? 'has-content' : ''}`}>
                                {isGenerating ? (
                                    <div className="generation-progress">
                                        <div className="progress-ring" />
                                        <div className="progress-text">Generating {creationMode}...</div>
                                        <div className="progress-subtext">This may take a few moments</div>
                                    </div>
                                ) : generatedContent.length > 0 ? (
                                    <div className="generated-content">
                                        {generatedContent[0].type === 'image' && (
                                            <img src={generatedContent[0].url} alt="Generated content" />
                                        )}
                                        {generatedContent[0].type === 'video' && (
                                            <video src={generatedContent[0].url} controls />
                                        )}
                                        {generatedContent[0].type === 'audio' && (
                                            <audio src={generatedContent[0].url} controls />
                                        )}
                                        <div className="content-overlay">
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <GlassButton
                                                    variant="primary"
                                                    onClick={() => downloadContent(generatedContent[0])}
                                                    theme={creativeTheme}
                                                >
                                                    💾 Download
                                                </GlassButton>
                                                <GlassButton variant="secondary" theme={creativeTheme}>
                                                    ✏️ Edit
                                                </GlassButton>
                                                <GlassButton variant="ghost" theme={creativeTheme}>
                                                    🔄 Remix
                                                </GlassButton>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="placeholder">
                                        <div className="icon">
                                            {creationModes.find(m => m.id === creationMode)?.icon}
                                        </div>
                                        <div className="text">
                                            Ready to create {creationMode} content
                                        </div>
                                        <div className="subtext">
                                            Enter a prompt below and click generate
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CreativeCanvas>
                    </GlassCard>

                    <GlassCard size="lg" theme={creativeTheme}>
                        <h3 style={{ marginTop: 0 }}>Creative Prompt</h3>
                        <PromptInput>
                            <div className="prompt-container">
                                <textarea
                                    className="prompt-textarea"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={`Describe the ${creationMode} you want to create... Be specific and creative!`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) {
                                            handleGenerate();
                                        }
                                    }}
                                />
                                <div className="prompt-actions">
                                    <div className="prompt-suggestions">
                                        {currentSuggestions.map((suggestion, index) => (
                                            <div
                                                key={index}
                                                className="suggestion-chip"
                                                onClick={() => handlePromptSuggestion(suggestion)}
                                            >
                                                {suggestion}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        className="generate-button"
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !prompt.trim()}
                                    >
                                        {isGenerating ? '⏳ Generating...' : '🚀 Generate'}
                                    </button>
                                </div>
                            </div>
                        </PromptInput>
                    </GlassCard>
                </CenterPanel>

                {/* Right Panel - History & Tools */}
                <RightPanel>
                    <GlassCard size="lg" theme={creativeTheme}>
                        <h3 style={{ marginTop: 0 }}>Generation History</h3>
                        <GenerationHistory>
                            <div className="history-grid">
                                {generationHistory.map(item => (
                                    <div key={item.id} className="history-item">
                                        {item.type === 'image' && (
                                            <img src={item.result} alt="Generated" />
                                        )}
                                        {item.type !== 'image' && (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.5rem'
                                            }}>
                                                {creationModes.find(m => m.id === item.type)?.icon}
                                            </div>
                                        )}
                                        <div className="history-overlay">
                                            <GlassButton size="sm" variant="ghost" theme={creativeTheme}>
                                                👁️
                                            </GlassButton>
                                        </div>
                                        <div className="timestamp">
                                            {item.timestamp.toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {generationHistory.length === 0 && (
                                <div style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>
                                    No generation history
                                </div>
                            )}
                        </GenerationHistory>
                    </GlassCard>

                    <GlassCard size="lg" theme={creativeTheme}>
                        <h3 style={{ marginTop: 0 }}>Creative Tools</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="ghost" fullWidth theme={creativeTheme}>
                                🎨 Style Transfer
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={creativeTheme}>
                                🔄 Variation Generator
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={creativeTheme}>
                                ✂️ Background Remover
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={creativeTheme}>
                                🔍 Upscale Image
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={creativeTheme}>
                                🎭 Face Swap
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={creativeTheme}>
                                📐 Crop & Resize
                            </GlassButton>
                        </div>
                    </GlassCard>

                    <GlassCard size="lg" theme={creativeTheme}>
                        <h3 style={{ marginTop: 0 }}>Export Options</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="secondary" fullWidth theme={creativeTheme}>
                                📱 Social Media Pack
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth theme={creativeTheme}>
                                🖼️ Print Ready
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth theme={creativeTheme}>
                                🌐 Web Optimized
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth theme={creativeTheme}>
                                📺 Video Export
                            </GlassButton>
                        </div>
                    </GlassCard>

                    <GlassCard size="lg" theme={creativeTheme}>
                        <h3 style={{ marginTop: 0 }}>AI Insights</h3>
                        <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>🎯 Trending:</strong> Cyberpunk aesthetics and neon colors are popular this week.
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>💡 Tip:</strong> Try adding "cinematic lighting" to your prompts for dramatic effects.
                            </div>
                            <div>
                                <strong>🔥 Hot Model:</strong> DALL-E 3 is performing exceptionally well for portraits.
                            </div>
                        </div>
                    </GlassCard>
                </RightPanel>
            </MainLayout>

            {/* Settings Modal */}
            <GlassModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                title="Creative Studio Settings"
                size="lg"
                theme={creativeTheme}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Default Quality
                        </label>
                        <select style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white'
                        }}>
                            <option value="standard">Standard</option>
                            <option value="high">High</option>
                            <option value="ultra">Ultra</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Auto-save Generations
                        </label>
                        <input type="checkbox" defaultChecked />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Watermark Generated Content
                        </label>
                        <input type="checkbox" />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <GlassButton
                            variant="ghost"
                            onClick={() => setShowSettings(false)}
                            theme={creativeTheme}
                        >
                            Cancel
                        </GlassButton>
                        <GlassButton
                            variant="primary"
                            onClick={() => setShowSettings(false)}
                            theme={creativeTheme}
                        >
                            Save Settings
                        </GlassButton>
                    </div>
                </div>
            </GlassModal>
        </DashboardContainer>
    );
};

export default CreativeStudioDashboard;