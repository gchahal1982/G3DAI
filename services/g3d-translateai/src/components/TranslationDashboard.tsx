/**
 * G3D TranslateAI - Neural Translation Dashboard
 * Complete translation platform with context-aware AI and brand voice preservation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

// TranslateAI Theme (Translation teal/cyan theme)
const translateaiTheme = {
    primary: '#0891b2',
    secondary: '#06b6d4',
    accent: '#22d3ee',
    glass: {
        background: 'rgba(8, 145, 178, 0.1)',
        border: 'rgba(8, 145, 178, 0.2)',
        blur: '12px'
    }
};

// Animations
const translateFlow = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

const languagePulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(8, 145, 178, 0.3); }
  50% { box-shadow: 0 0 20px rgba(8, 145, 178, 0.8); }
`;

const qualityGlow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(34, 211, 238, 0.3); }
  50% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.8); }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #155e75 0%, #0e7490 50%, #0891b2 100%);
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
    background: linear-gradient(135deg, #0891b2, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #0891b2, #06b6d4);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: ${languagePulse} 3s infinite;
  }
`;

const TranslationStatus = styled.div`
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
    
    &.translating {
      background: rgba(8, 145, 178, 0.2);
      color: #0891b2;
      animation: ${languagePulse} 2s infinite;
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
  border: 1px solid rgba(8, 145, 178, 0.2);
  border-radius: 12px;
  padding: ${props =>
        props.size === 'sm' ? '1rem' :
            props.size === 'lg' ? '2rem' : '1.5rem'};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const TranslationInterface = styled.div`
  position: relative;
  min-height: 500px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  
  .translation-content {
    width: 100%;
    height: 100%;
    padding: 1rem;
    position: relative;
    
    .translation-display {
      width: 100%;
      height: 450px;
      background: linear-gradient(135deg, rgba(8, 145, 178, 0.1), rgba(6, 182, 212, 0.1));
      border-radius: 8px;
      position: relative;
      overflow: hidden;
      border: 2px solid rgba(8, 145, 178, 0.3);
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #0891b2, transparent);
        animation: ${translateFlow} 3s infinite;
      }
      
      .translation-panels {
        display: grid;
        grid-template-columns: 1fr 60px 1fr;
        height: 100%;
        gap: 0;
        
        .source-panel {
          padding: 1.5rem;
          border-right: 1px solid rgba(8, 145, 178, 0.2);
          
          .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            
            .language-selector {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.5rem 1rem;
              background: rgba(8, 145, 178, 0.2);
              border-radius: 8px;
              border: 1px solid rgba(8, 145, 178, 0.3);
              color: white;
              cursor: pointer;
              
              .flag {
                font-size: 1.2rem;
              }
            }
            
            .word-count {
              font-size: 0.8rem;
              opacity: 0.7;
            }
          }
          
          .text-area {
            width: 100%;
            height: 300px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(8, 145, 178, 0.2);
            border-radius: 8px;
            padding: 1rem;
            color: white;
            font-size: 1rem;
            line-height: 1.6;
            resize: none;
            
            &::placeholder {
              color: rgba(255, 255, 255, 0.5);
            }
            
            &:focus {
              outline: none;
              border-color: #0891b2;
              box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.2);
            }
          }
        }
        
        .translation-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1rem 0;
          
          .translate-button {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0891b2, #06b6d4);
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            transition: all 0.3s ease;
            animation: ${qualityGlow} 2s infinite;
            
            &:hover {
              transform: scale(1.1);
            }
            
            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
              animation: none;
            }
          }
          
          .swap-button {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(8, 145, 178, 0.3);
            color: white;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
            
            &:hover {
              background: rgba(8, 145, 178, 0.2);
            }
          }
        }
        
        .target-panel {
          padding: 1.5rem;
          border-left: 1px solid rgba(8, 145, 178, 0.2);
          
          .translation-result {
            width: 100%;
            height: 300px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(8, 145, 178, 0.2);
            border-radius: 8px;
            padding: 1rem;
            color: white;
            font-size: 1rem;
            line-height: 1.6;
            overflow-y: auto;
            
            .confidence-indicator {
              display: inline-block;
              margin-left: 0.5rem;
              padding: 0.25rem 0.5rem;
              background: rgba(34, 197, 94, 0.2);
              color: #22c55e;
              border-radius: 12px;
              font-size: 0.7rem;
            }
          }
        }
      }
    }
  }
`;

const LanguageSettings = styled.div`
  .settings-section {
    margin-bottom: 1.5rem;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      
      h4 {
        margin: 0;
        font-size: 1rem;
        color: #0891b2;
      }
      
      .reset-button {
        font-size: 0.8rem;
        color: #06b6d4;
        cursor: pointer;
        
        &:hover {
          color: #0891b2;
        }
      }
    }
    
    .settings-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
      
      .setting-item {
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        
        .setting-label {
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          opacity: 0.8;
        }
        
        .setting-control {
          width: 100%;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(8, 145, 178, 0.3);
          border-radius: 6px;
          color: white;
          font-size: 0.9rem;
          
          &:focus {
            outline: none;
            border-color: #0891b2;
          }
        }
      }
    }
  }
`;

const TranslationHistory = styled.div`
  .history-item {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    border-left: 4px solid #0891b2;
    
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      
      .language-pair {
        background: rgba(8, 145, 178, 0.2);
        color: #0891b2;
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
      
      .source-text {
        margin-bottom: 0.5rem;
        opacity: 0.8;
      }
      
      .translated-text {
        font-weight: 500;
      }
    }
    
    .history-actions {
      display: flex;
      gap: 0.5rem;
      
      .action-button {
        padding: 0.25rem 0.75rem;
        background: rgba(8, 145, 178, 0.2);
        border: 1px solid rgba(8, 145, 178, 0.3);
        border-radius: 6px;
        color: #0891b2;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(8, 145, 178, 0.3);
        }
      }
    }
  }
`;

const QualityMetrics = styled.div`
  .metric-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    
    .metric-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      background: rgba(8, 145, 178, 0.2);
    }
    
    .metric-info {
      flex: 1;
      
      .metric-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      .metric-description {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
    
    .metric-score {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
      background: rgba(8, 145, 178, 0.2);
      color: #0891b2;
    }
  }
`;

const TranslationMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  .metric-card {
    padding: 1.5rem;
    background: rgba(8, 145, 178, 0.1);
    border-radius: 8px;
    text-align: center;
    
    .metric-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #0891b2;
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
      &.stable { color: #06b6d4; }
    }
  }
`;

const GlassButton = styled.button<{ variant?: 'primary' | 'secondary' | 'ghost'; fullWidth?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(8, 145, 178, 0.3);
  background: ${props =>
        props.variant === 'primary' ? 'rgba(8, 145, 178, 0.2)' :
            props.variant === 'secondary' ? 'rgba(6, 182, 212, 0.2)' :
                'rgba(255, 255, 255, 0.1)'};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  &:hover {
    background: ${props =>
        props.variant === 'primary' ? 'rgba(8, 145, 178, 0.3)' :
            props.variant === 'secondary' ? 'rgba(6, 182, 212, 0.3)' :
                'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-2px);
  }
`;

// Main Component
export const TranslationDashboard: React.FC = () => {
    // State Management
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLang, setSourceLang] = useState('en');
    const [targetLang, setTargetLang] = useState('es');
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationHistory, setTranslationHistory] = useState<any[]>([]);
    const [qualityMetrics, setQualityMetrics] = useState<any>(null);

    // Sample languages
    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Spanish', flag: '🇪🇸' },
        { code: 'fr', name: 'French', flag: '🇫🇷' },
        { code: 'de', name: 'German', flag: '🇩🇪' },
        { code: 'it', name: 'Italian', flag: '🇮🇹' },
        { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
        { code: 'ru', name: 'Russian', flag: '🇷🇺' },
        { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
        { code: 'ko', name: 'Korean', flag: '🇰🇷' },
        { code: 'zh', name: 'Chinese', flag: '🇨🇳' }
    ];

    // Sample quality metrics
    const qualityData = [
        {
            id: 'quality-001',
            name: 'Accuracy',
            description: 'Translation accuracy based on context analysis',
            score: 96
        },
        {
            id: 'quality-002',
            name: 'Fluency',
            description: 'Natural language flow and readability',
            score: 94
        },
        {
            id: 'quality-003',
            name: 'Context Preservation',
            description: 'Maintaining original meaning and context',
            score: 98
        }
    ];

    // Sample translation history
    const history = [
        {
            id: 'hist-001',
            sourceLang: 'en',
            targetLang: 'es',
            sourceText: 'Welcome to our premium service',
            translatedText: 'Bienvenido a nuestro servicio premium',
            timestamp: '2 hours ago',
            confidence: 97
        },
        {
            id: 'hist-002',
            sourceLang: 'fr',
            targetLang: 'en',
            sourceText: 'Nous sommes ravis de vous accueillir',
            translatedText: 'We are delighted to welcome you',
            timestamp: '5 hours ago',
            confidence: 95
        },
        {
            id: 'hist-003',
            sourceLang: 'de',
            targetLang: 'en',
            sourceText: 'Vielen Dank für Ihr Vertrauen',
            translatedText: 'Thank you for your trust',
            timestamp: '1 day ago',
            confidence: 99
        }
    ];

    // Event Handlers
    const handleTranslate = useCallback(async () => {
        if (!sourceText.trim()) return;

        setIsTranslating(true);

        try {
            // Simulate translation API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock translation result
            const mockTranslation = "Esta es una traducción de ejemplo que demuestra las capacidades de IA de G3D TranslateAI con preservación del contexto y la voz de marca.";
            setTranslatedText(mockTranslation);

            // Add to history
            const newHistoryItem = {
                id: `hist-${Date.now()}`,
                sourceLang,
                targetLang,
                sourceText,
                translatedText: mockTranslation,
                timestamp: 'Just now',
                confidence: 96
            };

            setTranslationHistory(prev => [newHistoryItem, ...prev.slice(0, 4)]);
        } catch (error) {
            console.error('Translation failed:', error);
        } finally {
            setIsTranslating(false);
        }
    }, [sourceText, sourceLang, targetLang]);

    const handleSwapLanguages = useCallback(() => {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
        setSourceText(translatedText);
        setTranslatedText(sourceText);
    }, [sourceLang, targetLang, sourceText, translatedText]);

    const getLanguageByCode = (code: string) => {
        return languages.find(lang => lang.code === code) || languages[0];
    };

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">🌐</div>
                    <h1>G3D TranslateAI</h1>
                </Logo>
                <TranslationStatus>
                    <div className={`status-indicator ${isTranslating ? 'translating' : 'ready'}`}>
                        <div className="dot" />
                        <span>{isTranslating ? 'Translating...' : 'Ready'}</span>
                    </div>
                    <GlassButton
                        variant="secondary"
                        onClick={handleTranslate}
                        disabled={isTranslating || !sourceText.trim()}
                    >
                        {isTranslating ? '⏳ Translating' : '🚀 Translate'}
                    </GlassButton>
                </TranslationStatus>
            </Header>

            <MainGrid>
                {/* Left Panel - Language Settings & History */}
                <LeftPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Language Settings</h3>
                        <LanguageSettings>
                            <div className="settings-section">
                                <div className="section-header">
                                    <h4>Translation Preferences</h4>
                                    <span className="reset-button">Reset</span>
                                </div>
                                <div className="settings-grid">
                                    <div className="setting-item">
                                        <div className="setting-label">Translation Style</div>
                                        <select className="setting-control">
                                            <option value="formal">Formal</option>
                                            <option value="casual">Casual</option>
                                            <option value="technical">Technical</option>
                                            <option value="creative">Creative</option>
                                        </select>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-label">Brand Voice</div>
                                        <select className="setting-control">
                                            <option value="default">Default</option>
                                            <option value="professional">Professional</option>
                                            <option value="friendly">Friendly</option>
                                            <option value="authoritative">Authoritative</option>
                                        </select>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-label">Domain</div>
                                        <select className="setting-control">
                                            <option value="general">General</option>
                                            <option value="business">Business</option>
                                            <option value="legal">Legal</option>
                                            <option value="medical">Medical</option>
                                            <option value="technical">Technical</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </LanguageSettings>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Quality Metrics</h3>
                        <QualityMetrics>
                            {qualityData.map(metric => (
                                <div key={metric.id} className="metric-item">
                                    <div className="metric-icon">
                                        📊
                                    </div>
                                    <div className="metric-info">
                                        <div className="metric-name">{metric.name}</div>
                                        <div className="metric-description">{metric.description}</div>
                                    </div>
                                    <div className="metric-score">
                                        {metric.score}%
                                    </div>
                                </div>
                            ))}
                        </QualityMetrics>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Performance</h3>
                        <TranslationMetricsGrid>
                            <div className="metric-card">
                                <div className="metric-value">2.3s</div>
                                <div className="metric-label">Avg Speed</div>
                                <div className="metric-trend improving">-15% faster</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">96%</div>
                                <div className="metric-label">Accuracy</div>
                                <div className="metric-trend improving">+2% this week</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">1,247</div>
                                <div className="metric-label">Translations</div>
                                <div className="metric-trend stable">This month</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">42</div>
                                <div className="metric-label">Languages</div>
                                <div className="metric-trend stable">Supported</div>
                            </div>
                        </TranslationMetricsGrid>
                    </GlassCard>
                </LeftPanel>

                {/* Center Panel - Translation Interface */}
                <CenterPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Neural Translation Interface</h3>
                        <TranslationInterface>
                            <div className="translation-content">
                                <div className="translation-display">
                                    <div className="translation-panels">
                                        <div className="source-panel">
                                            <div className="panel-header">
                                                <div className="language-selector">
                                                    <span className="flag">{getLanguageByCode(sourceLang).flag}</span>
                                                    <span>{getLanguageByCode(sourceLang).name}</span>
                                                    <span>▼</span>
                                                </div>
                                                <div className="word-count">{sourceText.split(' ').length} words</div>
                                            </div>
                                            <textarea
                                                className="text-area"
                                                placeholder="Enter text to translate..."
                                                value={sourceText}
                                                onChange={(e) => setSourceText(e.target.value)}
                                            />
                                        </div>

                                        <div className="translation-controls">
                                            <button
                                                className="translate-button"
                                                onClick={handleTranslate}
                                                disabled={isTranslating || !sourceText.trim()}
                                            >
                                                {isTranslating ? '⏳' : '→'}
                                            </button>
                                            <button
                                                className="swap-button"
                                                onClick={handleSwapLanguages}
                                            >
                                                ⇄
                                            </button>
                                        </div>

                                        <div className="target-panel">
                                            <div className="panel-header">
                                                <div className="language-selector">
                                                    <span className="flag">{getLanguageByCode(targetLang).flag}</span>
                                                    <span>{getLanguageByCode(targetLang).name}</span>
                                                    <span>▼</span>
                                                </div>
                                                <div className="word-count">
                                                    {translatedText ? `${translatedText.split(' ').length} words` : '0 words'}
                                                </div>
                                            </div>
                                            <div className="translation-result">
                                                {translatedText && (
                                                    <>
                                                        {translatedText}
                                                        <span className="confidence-indicator">96% confidence</span>
                                                    </>
                                                )}
                                                {!translatedText && !isTranslating && (
                                                    <div style={{ opacity: 0.5, fontStyle: 'italic' }}>
                                                        Translation will appear here...
                                                    </div>
                                                )}
                                                {isTranslating && (
                                                    <div style={{ opacity: 0.7, fontStyle: 'italic' }}>
                                                        🔄 Analyzing context and generating translation...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TranslationInterface>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Translation Tools</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <GlassButton variant="ghost" fullWidth>
                                📄 Document Translation
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🎙️ Voice Translation
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📱 Mobile App
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🔗 API Integration
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🌐 Website Plugin
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📊 Batch Processing
                            </GlassButton>
                        </div>
                    </GlassCard>
                </CenterPanel>

                {/* Right Panel - Translation History & Actions */}
                <RightPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Translation History</h3>
                        <TranslationHistory>
                            {history.map(item => (
                                <div key={item.id} className="history-item">
                                    <div className="history-header">
                                        <span className="language-pair">
                                            {getLanguageByCode(item.sourceLang).flag} → {getLanguageByCode(item.targetLang).flag}
                                        </span>
                                        <span className="timestamp">{item.timestamp}</span>
                                    </div>
                                    <div className="history-content">
                                        <div className="source-text">{item.sourceText}</div>
                                        <div className="translated-text">{item.translatedText}</div>
                                    </div>
                                    <div className="history-actions">
                                        <button className="action-button">Reuse</button>
                                        <button className="action-button">Edit</button>
                                        <button className="action-button">Share</button>
                                    </div>
                                </div>
                            ))}
                        </TranslationHistory>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Supported Languages</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                            {languages.map(lang => (
                                <div
                                    key={lang.code}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.5rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setSourceLang(lang.code)}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                                    <span style={{ fontWeight: 500 }}>{lang.name}</span>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.7, marginLeft: 'auto' }}>
                                        {lang.code.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="primary" fullWidth>
                                📤 Export Translation
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth>
                                📋 Copy to Clipboard
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🔊 Text to Speech
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📧 Share via Email
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

export default TranslationDashboard;