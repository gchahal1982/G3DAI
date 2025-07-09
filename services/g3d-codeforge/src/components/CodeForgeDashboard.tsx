/**
 * G3D CodeForge AI - Advanced Code Generation & Review Platform
 * Complete frontend implementation with real-time AI assistance
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
    CodeProject,
    CodeGenerationRequest,
    CodeReviewResult,
    AIModel,
    CodeMetrics,
    CodeSuggestion,
    SecurityScan,
    TestGenerationResult
} from '../types/codeforge.types';
import { LLMOrchestrator } from '../services/LLMOrchestrator';

// CodeForge Theme
const codeforgeTheme = {
    ...baseGlassmorphismTheme,
    ...serviceThemeOverrides['codeforge']
};

// Animations
const typewriter = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const blink = keyframes`
  0%, 50% { border-color: transparent; }
  51%, 100% { border-color: #6366f1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  padding: 1.5rem;
  color: white;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  animation: ${slideUp} 0.8s ease-out;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
`;

const StatusBar = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ActiveModels = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(99, 102, 241, 0.3);
  
  .model-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    animation: ${pulse} 2s infinite;
  }
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
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

const CodeEditor = styled.div`
  position: relative;
  min-height: 400px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  overflow: hidden;
  
  .editor-header {
    display: flex;
    justify-content: between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
    
    .file-tabs {
      display: flex;
      gap: 0.5rem;
      
      .tab {
        padding: 0.5rem 1rem;
        background: rgba(99, 102, 241, 0.1);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &.active {
          background: rgba(99, 102, 241, 0.3);
          border: 1px solid #6366f1;
        }
        
        &:hover {
          background: rgba(99, 102, 241, 0.2);
        }
      }
    }
    
    .editor-actions {
      display: flex;
      gap: 0.5rem;
    }
  }
  
  .editor-content {
    padding: 1rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    line-height: 1.6;
    
    textarea {
      width: 100%;
      height: 300px;
      background: transparent;
      border: none;
      color: white;
      font-family: inherit;
      font-size: inherit;
      resize: none;
      outline: none;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
`;

const AIAssistant = styled.div`
  position: relative;
  
  .ai-input {
    position: relative;
    
    .prompt-input {
      width: 100%;
      padding: 1rem;
      padding-right: 3rem;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 12px;
      color: white;
      font-family: inherit;
      resize: none;
      outline: none;
      
      &:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }
    }
    
    .send-button {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      background: #6366f1;
      border: none;
      border-radius: 8px;
      padding: 0.5rem;
      cursor: pointer;
      color: white;
      
      &:hover {
        background: #5855eb;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
  
  .ai-suggestions {
    margin-top: 1rem;
    max-height: 300px;
    overflow-y: auto;
    
    .suggestion {
      padding: 1rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 8px;
      margin-bottom: 0.5rem;
      animation: ${slideUp} 0.3s ease-out;
      
      .suggestion-header {
        display: flex;
        justify-content: between;
        align-items: center;
        margin-bottom: 0.5rem;
        
        .confidence {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
        }
      }
      
      .suggestion-code {
        background: rgba(0, 0, 0, 0.3);
        padding: 0.75rem;
        border-radius: 6px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
        overflow-x: auto;
        
        pre {
          margin: 0;
          white-space: pre-wrap;
        }
      }
      
      .suggestion-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.75rem;
      }
    }
  }
`;

const ProjectExplorer = styled.div`
  .project-tree {
    .folder, .file {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(99, 102, 241, 0.1);
      }
      
      &.active {
        background: rgba(99, 102, 241, 0.2);
        border: 1px solid #6366f1;
      }
      
      .icon {
        font-size: 1rem;
      }
      
      .name {
        font-size: 0.9rem;
      }
    }
    
    .folder {
      font-weight: 600;
      
      &.expanded .icon::before {
        content: '📂';
      }
      
      &:not(.expanded) .icon::before {
        content: '📁';
      }
    }
    
    .file .icon::before {
      content: '📄';
    }
    
    .file.js .icon::before { content: '🟨'; }
    .file.ts .icon::before { content: '🔷'; }
    .file.py .icon::before { content: '🐍'; }
    .file.java .icon::before { content: '☕'; }
    .file.cpp .icon::before { content: '⚙️'; }
    .file.go .icon::before { content: '🐹'; }
    .file.rust .icon::before { content: '🦀'; }
  }
`;

const CodeMetricsPanel = styled.div`
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .metric-card {
    text-align: center;
    padding: 1rem;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 8px;
    
    .metric-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #6366f1;
      margin-bottom: 0.25rem;
    }
    
    .metric-label {
      font-size: 0.8rem;
      opacity: 0.7;
    }
  }
  
  .quality-indicators {
    .indicator {
      display: flex;
      justify-content: between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      
      &:last-child {
        border-bottom: none;
      }
      
      .label {
        font-size: 0.9rem;
      }
      
      .score {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        
        &.excellent { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
        &.good { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        &.fair { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        &.poor { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
      }
    }
  }
`;

const ModelSelector = styled.div`
  .model-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .model-option {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(99, 102, 241, 0.1);
    }
    
    &.active {
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid #6366f1;
    }
    
    .model-info {
      flex: 1;
      
      .model-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      .model-description {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
    
    .model-status {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
      
      &.active { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
      &.loading { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    }
  }
`;

const GenerationHistory = styled.div`
  .history-item {
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(99, 102, 241, 0.1);
    }
    
    .history-header {
      display: flex;
      justify-content: between;
      align-items: center;
      margin-bottom: 0.5rem;
      
      .timestamp {
        font-size: 0.8rem;
        opacity: 0.7;
      }
      
      .language {
        background: rgba(99, 102, 241, 0.2);
        color: #6366f1;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.7rem;
      }
    }
    
    .history-prompt {
      font-size: 0.9rem;
      opacity: 0.9;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`;

// Main Component
export const CodeForgeDashboard: React.FC = () => {
    // State Management
    const [currentProject, setCurrentProject] = useState<CodeProject | null>(null);
    const [activeFile, setActiveFile] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [aiPrompt, setAiPrompt] = useState<string>('');
    const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4', 'claude-3']);
    const [metrics, setMetrics] = useState<CodeMetrics | null>(null);
    const [generationHistory, setGenerationHistory] = useState<any[]>([]);
    const [showSettings, setShowSettings] = useState(false);

    // Refs
    const llmOrchestrator = useRef(new LLMOrchestrator());

    // Available AI Models
    const availableModels = [
        {
            id: 'gpt-4',
            name: 'GPT-4 Turbo',
            description: 'Latest OpenAI model, excellent for complex code generation',
            status: 'active' as const,
            specialty: 'General Purpose'
        },
        {
            id: 'claude-3',
            name: 'Claude 3 Opus',
            description: 'Anthropic\'s most capable model, great for code analysis',
            status: 'active' as const,
            specialty: 'Code Review'
        },
        {
            id: 'codellama',
            name: 'Code Llama 70B',
            description: 'Meta\'s specialized code generation model',
            status: 'active' as const,
            specialty: 'Code Generation'
        },
        {
            id: 'deepseek-coder',
            name: 'DeepSeek Coder',
            description: 'Specialized for coding tasks and debugging',
            status: 'active' as const,
            specialty: 'Debugging'
        },
        {
            id: 'starcoder',
            name: 'StarCoder 2',
            description: 'Open-source code generation model',
            status: 'active' as const,
            specialty: 'Open Source'
        }
    ];

    // Sample project structure
    const projectStructure = [
        {
            type: 'folder',
            name: 'src',
            expanded: true,
            children: [
                { type: 'file', name: 'index.ts', extension: 'ts' },
                { type: 'file', name: 'app.tsx', extension: 'tsx' },
                { type: 'file', name: 'utils.js', extension: 'js' },
            ]
        },
        {
            type: 'folder',
            name: 'tests',
            expanded: false,
            children: [
                { type: 'file', name: 'app.test.ts', extension: 'ts' },
            ]
        },
        { type: 'file', name: 'package.json', extension: 'json' },
        { type: 'file', name: 'README.md', extension: 'md' },
    ];

    // Event Handlers
    const handleAIGeneration = useCallback(async () => {
        if (!aiPrompt.trim() || isGenerating) return;

        setIsGenerating(true);

        try {
            const request: CodeGenerationRequest = {
                prompt: aiPrompt,
                language: 'typescript',
                context: code,
                models: selectedModels,
                options: {
                    includeTests: true,
                    includeComments: true,
                    optimizePerformance: true
                }
            };

            const results = await llmOrchestrator.current.generateCode(request);

            const newSuggestions: CodeSuggestion[] = results.map((result, index) => ({
                id: crypto.randomUUID(),
                code: result.code,
                explanation: result.explanation,
                confidence: result.confidence,
                model: selectedModels[index] || 'unknown',
                language: 'typescript',
                timestamp: new Date()
            }));

            setSuggestions(prev => [...newSuggestions, ...prev.slice(0, 4)]);

            // Add to history
            setGenerationHistory(prev => [{
                prompt: aiPrompt,
                timestamp: new Date(),
                language: 'typescript',
                results: newSuggestions.length
            }, ...prev.slice(0, 9)]);

            setAiPrompt('');
        } catch (error) {
            console.error('Code generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [aiPrompt, code, selectedModels, isGenerating]);

    const applySuggestion = useCallback((suggestion: CodeSuggestion) => {
        setCode(prev => prev + '\n\n' + suggestion.code);
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    }, []);

    const handleCodeReview = useCallback(async () => {
        if (!code.trim()) return;

        try {
            const review = await llmOrchestrator.current.reviewCode(code, 'typescript');
            console.log('Code review:', review);
            // Handle review results
        } catch (error) {
            console.error('Code review failed:', error);
        }
    }, [code]);

    const generateTests = useCallback(async () => {
        if (!code.trim()) return;

        try {
            const tests = await llmOrchestrator.current.generateTests(code, 'typescript');
            console.log('Generated tests:', tests);
            // Handle test generation
        } catch (error) {
            console.error('Test generation failed:', error);
        }
    }, [code]);

    // Load metrics
    useEffect(() => {
        const loadMetrics = async () => {
            try {
                const codeMetrics = await llmOrchestrator.current.analyzeCodeMetrics(code);
                setMetrics(codeMetrics);
            } catch (error) {
                console.error('Failed to load metrics:', error);
            }
        };

        if (code.trim()) {
            loadMetrics();
        }
    }, [code]);

    const getQualityScore = (score: number) => {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'fair';
        return 'poor';
    };

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">⚡</div>
                    <h1>G3D CodeForge AI</h1>
                </Logo>
                <StatusBar>
                    <ActiveModels>
                        <div className="model-indicator" />
                        <span>{selectedModels.length} AI Models Active</span>
                    </ActiveModels>
                    <GlassButton
                        variant="ghost"
                        onClick={() => setShowSettings(true)}
                        theme={codeforgeTheme}
                    >
                        ⚙️ Settings
                    </GlassButton>
                </StatusBar>
            </Header>

            <MainLayout>
                {/* Left Panel - Project Explorer & Models */}
                <LeftPanel>
                    <GlassCard size="lg" theme={codeforgeTheme}>
                        <h3 style={{ marginTop: 0 }}>Project Explorer</h3>
                        <ProjectExplorer>
                            <div className="project-tree">
                                {projectStructure.map((item, index) => (
                                    <div key={index}>
                                        {item.type === 'folder' ? (
                                            <div>
                                                <div className={`folder ${item.expanded ? 'expanded' : ''}`}>
                                                    <span className="icon"></span>
                                                    <span className="name">{item.name}</span>
                                                </div>
                                                {item.expanded && item.children?.map((child, childIndex) => (
                                                    <div
                                                        key={childIndex}
                                                        className={`file ${child.extension} ${activeFile === child.name ? 'active' : ''}`}
                                                        style={{ marginLeft: '1.5rem' }}
                                                        onClick={() => setActiveFile(child.name)}
                                                    >
                                                        <span className="icon"></span>
                                                        <span className="name">{child.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div
                                                className={`file ${item.extension} ${activeFile === item.name ? 'active' : ''}`}
                                                onClick={() => setActiveFile(item.name)}
                                            >
                                                <span className="icon"></span>
                                                <span className="name">{item.name}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ProjectExplorer>
                    </GlassCard>

                    <GlassCard size="lg" theme={codeforgeTheme}>
                        <h3 style={{ marginTop: 0 }}>AI Models</h3>
                        <ModelSelector>
                            <div className="model-grid">
                                {availableModels.map(model => (
                                    <div
                                        key={model.id}
                                        className={`model-option ${selectedModels.includes(model.id) ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedModels(prev =>
                                                prev.includes(model.id)
                                                    ? prev.filter(id => id !== model.id)
                                                    : [...prev, model.id]
                                            );
                                        }}
                                    >
                                        <div className="model-info">
                                            <div className="model-name">{model.name}</div>
                                            <div className="model-description">{model.description}</div>
                                        </div>
                                        <div className={`model-status ${model.status}`}>
                                            {model.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ModelSelector>
                    </GlassCard>

                    <GlassCard size="lg" theme={codeforgeTheme}>
                        <h3 style={{ marginTop: 0 }}>Generation History</h3>
                        <GenerationHistory>
                            {generationHistory.map((item, index) => (
                                <div key={index} className="history-item">
                                    <div className="history-header">
                                        <span className="timestamp">
                                            {item.timestamp.toLocaleTimeString()}
                                        </span>
                                        <span className="language">{item.language}</span>
                                    </div>
                                    <div className="history-prompt">{item.prompt}</div>
                                </div>
                            ))}
                            {generationHistory.length === 0 && (
                                <div style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>
                                    No generation history
                                </div>
                            )}
                        </GenerationHistory>
                    </GlassCard>
                </LeftPanel>

                {/* Center Panel - Code Editor & AI Assistant */}
                <CenterPanel>
                    <GlassCard size="lg" theme={codeforgeTheme}>
                        <CodeEditor>
                            <div className="editor-header">
                                <div className="file-tabs">
                                    <div className="tab active">
                                        {activeFile || 'untitled.ts'}
                                    </div>
                                </div>
                                <div className="editor-actions">
                                    <GlassButton size="sm" variant="ghost" theme={codeforgeTheme}>
                                        💾 Save
                                    </GlassButton>
                                    <GlassButton size="sm" variant="ghost" theme={codeforgeTheme}>
                                        ▶️ Run
                                    </GlassButton>
                                </div>
                            </div>
                            <div className="editor-content">
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="// Start coding or use AI to generate code..."
                                    spellCheck={false}
                                />
                            </div>
                        </CodeEditor>
                    </GlassCard>

                    <GlassCard size="lg" theme={codeforgeTheme}>
                        <h3 style={{ marginTop: 0 }}>AI Assistant</h3>
                        <AIAssistant>
                            <div className="ai-input">
                                <textarea
                                    className="prompt-input"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="Describe what you want to build... (e.g., 'Create a React component for user authentication')"
                                    rows={3}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) {
                                            handleAIGeneration();
                                        }
                                    }}
                                />
                                <button
                                    className="send-button"
                                    onClick={handleAIGeneration}
                                    disabled={isGenerating || !aiPrompt.trim()}
                                >
                                    {isGenerating ? '⏳' : '🚀'}
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <GlassButton
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleCodeReview}
                                    disabled={!code.trim()}
                                    theme={codeforgeTheme}
                                >
                                    🔍 Review Code
                                </GlassButton>
                                <GlassButton
                                    size="sm"
                                    variant="secondary"
                                    onClick={generateTests}
                                    disabled={!code.trim()}
                                    theme={codeforgeTheme}
                                >
                                    🧪 Generate Tests
                                </GlassButton>
                                <GlassButton
                                    size="sm"
                                    variant="ghost"
                                    theme={codeforgeTheme}
                                >
                                    📝 Add Comments
                                </GlassButton>
                            </div>

                            {suggestions.length > 0 && (
                                <div className="ai-suggestions">
                                    {suggestions.map(suggestion => (
                                        <div key={suggestion.id} className="suggestion">
                                            <div className="suggestion-header">
                                                <span>
                                                    <strong>{suggestion.model}</strong> suggests:
                                                </span>
                                                <span className="confidence">
                                                    {Math.round(suggestion.confidence * 100)}%
                                                </span>
                                            </div>
                                            <div className="suggestion-code">
                                                <pre>{suggestion.code}</pre>
                                            </div>
                                            <div className="suggestion-actions">
                                                <GlassButton
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() => applySuggestion(suggestion)}
                                                    theme={codeforgeTheme}
                                                >
                                                    ✅ Apply
                                                </GlassButton>
                                                <GlassButton
                                                    size="sm"
                                                    variant="ghost"
                                                    theme={codeforgeTheme}
                                                >
                                                    📋 Copy
                                                </GlassButton>
                                                <GlassButton
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                                                    theme={codeforgeTheme}
                                                >
                                                    ❌ Dismiss
                                                </GlassButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </AIAssistant>
                    </GlassCard>
                </CenterPanel>

                {/* Right Panel - Metrics & Tools */}
                <RightPanel>
                    <GlassCard size="lg" theme={codeforgeTheme}>
                        <h3 style={{ marginTop: 0 }}>Code Metrics</h3>
                        <CodeMetricsPanel>
                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-value">{metrics?.linesOfCode || 0}</div>
                                    <div className="metric-label">Lines of Code</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-value">{metrics?.complexity || 0}</div>
                                    <div className="metric-label">Complexity</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-value">{metrics?.testCoverage || 0}%</div>
                                    <div className="metric-label">Test Coverage</div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-value">{metrics?.maintainabilityIndex || 0}</div>
                                    <div className="metric-label">Maintainability</div>
                                </div>
                            </div>

                            <div className="quality-indicators">
                                <div className="indicator">
                                    <span className="label">Code Quality</span>
                                    <span className={`score ${getQualityScore(metrics?.codeQuality || 0)}`}>
                                        {metrics?.codeQuality || 0}/100
                                    </span>
                                </div>
                                <div className="indicator">
                                    <span className="label">Security</span>
                                    <span className={`score ${getQualityScore(metrics?.security || 0)}`}>
                                        {metrics?.security || 0}/100
                                    </span>
                                </div>
                                <div className="indicator">
                                    <span className="label">Performance</span>
                                    <span className={`score ${getQualityScore(metrics?.performance || 0)}`}>
                                        {metrics?.performance || 0}/100
                                    </span>
                                </div>
                                <div className="indicator">
                                    <span className="label">Documentation</span>
                                    <span className={`score ${getQualityScore(metrics?.documentation || 0)}`}>
                                        {metrics?.documentation || 0}/100
                                    </span>
                                </div>
                            </div>
                        </CodeMetricsPanel>
                    </GlassCard>

                    <GlassCard size="lg" theme={codeforgeTheme}>
                        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="ghost" fullWidth theme={codeforgeTheme}>
                                🔧 Refactor Code
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={codeforgeTheme}>
                                🐛 Find Bugs
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={codeforgeTheme}>
                                ⚡ Optimize Performance
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={codeforgeTheme}>
                                📚 Add Documentation
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={codeforgeTheme}>
                                🔒 Security Scan
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={codeforgeTheme}>
                                📦 Export Project
                            </GlassButton>
                        </div>
                    </GlassCard>

                    <GlassCard size="lg" theme={codeforgeTheme}>
                        <h3 style={{ marginTop: 0 }}>AI Insights</h3>
                        <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>💡 Suggestion:</strong> Consider adding error handling to your async functions for better reliability.
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>🔍 Pattern Detected:</strong> You're building a React component. Would you like me to add TypeScript props interface?
                            </div>
                            <div>
                                <strong>⚡ Optimization:</strong> Your code could benefit from memoization for better performance.
                            </div>
                        </div>
                    </GlassCard>
                </RightPanel>
            </MainLayout>

            {/* Settings Modal */}
            <GlassModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                title="CodeForge Settings"
                size="lg"
                theme={codeforgeTheme}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Default Language
                        </label>
                        <select style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white'
                        }}>
                            <option value="typescript">TypeScript</option>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            AI Response Style
                        </label>
                        <select style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white'
                        }}>
                            <option value="detailed">Detailed Explanations</option>
                            <option value="concise">Concise Code Only</option>
                            <option value="educational">Educational Mode</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" defaultChecked />
                            Auto-save code changes
                        </label>
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" defaultChecked />
                            Enable real-time code analysis
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <GlassButton
                            variant="ghost"
                            onClick={() => setShowSettings(false)}
                            theme={codeforgeTheme}
                        >
                            Cancel
                        </GlassButton>
                        <GlassButton
                            variant="primary"
                            onClick={() => setShowSettings(false)}
                            theme={codeforgeTheme}
                        >
                            Save Settings
                        </GlassButton>
                    </div>
                </div>
            </GlassModal>
        </DashboardContainer>
    );
};

export default CodeForgeDashboard;