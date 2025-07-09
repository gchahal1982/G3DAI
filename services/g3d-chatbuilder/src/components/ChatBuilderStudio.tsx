/**
 * G3D ChatBuilder - Conversational AI Platform Studio
 * Complete enterprise chatbot building platform with drag-and-drop interface
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
    ChatBot,
    ConversationFlow,
    IntentClassification,
    ChannelIntegration,
    AnalyticsMetrics,
    TrainingData,
    ResponseTemplate
} from '../types/chatbuilder.types';
import { ConversationalAIEngine } from '../services/ConversationalAIEngine';

// ChatBuilder Theme (Green/Teal conversational theme)
const chatbuilderTheme = {
    ...baseGlassmorphismTheme,
    primary: '#10b981',
    secondary: '#06b6d4',
    accent: '#0891b2',
    glass: {
        background: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.2)',
        blur: '12px'
    }
};

// Animations
const messageFlow = keyframes`
  0% { transform: translateX(-50px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(50px); opacity: 0; }
`;

const typingIndicator = keyframes`
  0%, 60%, 100% { transform: scale(1); opacity: 0.7; }
  30% { transform: scale(1.2); opacity: 1; }
`;

const connectionPulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8); }
`;

// Styled Components
const StudioContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
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
    background: linear-gradient(135deg, #10b981, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #10b981, #06b6d4);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
`;

const BotStatus = styled.div`
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
    
    &.training {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }
    
    &.ready {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      animation: ${connectionPulse} 2s infinite;
    }
    
    &.deployed {
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
  grid-template-columns: 300px 1fr 350px;
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

const FlowBuilder = styled.div`
  position: relative;
  min-height: 500px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  
  .builder-content {
    width: 100%;
    height: 100%;
    padding: 1rem;
    position: relative;
    
    .flow-canvas {
      width: 100%;
      height: 450px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(6, 182, 212, 0.05));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      border: 2px dashed rgba(16, 185, 129, 0.3);
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #10b981, transparent);
        animation: ${messageFlow} 4s infinite;
      }
      
      .flow-nodes {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        
        .node {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 20px;
          border: 1px solid rgba(16, 185, 129, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 200px;
          
          &:hover {
            background: rgba(16, 185, 129, 0.2);
            transform: scale(1.02);
          }
          
          &.active {
            background: rgba(16, 185, 129, 0.3);
            border-color: #10b981;
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
          }
          
          .node-icon {
            font-size: 1.5rem;
          }
          
          .node-content {
            flex: 1;
            
            .node-title {
              font-weight: 600;
              margin-bottom: 0.25rem;
            }
            
            .node-description {
              font-size: 0.8rem;
              opacity: 0.7;
            }
          }
        }
        
        .arrow {
          font-size: 1.5rem;
          color: #10b981;
          transform: rotate(90deg);
        }
      }
    }
  }
`;

const BotsList = styled.div`
  .bot-item {
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
      background: rgba(16, 185, 129, 0.1);
    }
    
    &.selected {
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid #10b981;
    }
    
    .bot-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #10b981, #06b6d4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    
    .bot-info {
      flex: 1;
      
      .bot-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      .bot-details {
        font-size: 0.8rem;
        opacity: 0.7;
        display: flex;
        gap: 1rem;
      }
    }
    
    .bot-status {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
      
      &.deployed { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
      &.training { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
      &.draft { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }
    }
  }
`;

const ChatPreview = styled.div`
  .chat-container {
    height: 400px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    .chat-header {
      padding: 1rem;
      background: rgba(16, 185, 129, 0.1);
      border-bottom: 1px solid rgba(16, 185, 129, 0.2);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      
      .bot-avatar {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #10b981, #06b6d4);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
      }
      
      .bot-name {
        font-weight: 600;
      }
      
      .online-indicator {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: #22c55e;
        
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          animation: ${typingIndicator} 1.5s infinite;
        }
      }
    }
    
    .chat-messages {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      
      .message {
        max-width: 80%;
        padding: 0.75rem 1rem;
        border-radius: 18px;
        font-size: 0.9rem;
        
        &.user {
          align-self: flex-end;
          background: rgba(16, 185, 129, 0.2);
          color: white;
        }
        
        &.bot {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
      }
      
      .typing-indicator {
        align-self: flex-start;
        display: flex;
        gap: 0.25rem;
        padding: 0.75rem 1rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 18px;
        
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: ${typingIndicator} 1.5s infinite;
          
          &:nth-child(2) { animation-delay: 0.2s; }
          &:nth-child(3) { animation-delay: 0.4s; }
        }
      }
    }
    
    .chat-input {
      padding: 1rem;
      border-top: 1px solid rgba(16, 185, 129, 0.2);
      display: flex;
      gap: 0.75rem;
      
      input {
        flex: 1;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 20px;
        color: white;
        outline: none;
        
        &::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        &:focus {
          border-color: #10b981;
        }
      }
      
      button {
        padding: 0.75rem;
        background: linear-gradient(135deg, #10b981, #06b6d4);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  .metric-card {
    padding: 1.5rem;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 8px;
    text-align: center;
    
    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: #10b981;
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

const ChannelsList = styled.div`
  .channel-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    
    .channel-icon {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      
      &.website { background: rgba(59, 130, 246, 0.2); }
      &.whatsapp { background: rgba(34, 197, 94, 0.2); }
      &.slack { background: rgba(168, 85, 247, 0.2); }
      &.discord { background: rgba(99, 102, 241, 0.2); }
    }
    
    .channel-info {
      flex: 1;
      
      .channel-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      .channel-status {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
    
    .toggle-switch {
      width: 40px;
      height: 20px;
      background: rgba(107, 114, 128, 0.3);
      border-radius: 10px;
      position: relative;
      cursor: pointer;
      transition: background 0.3s ease;
      
      &.active {
        background: rgba(16, 185, 129, 0.3);
      }
      
      .toggle-slider {
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 50%;
        position: absolute;
        top: 2px;
        left: 2px;
        transition: transform 0.3s ease;
      }
      
      &.active .toggle-slider {
        transform: translateX(20px);
      }
    }
  }
`;

// Main Component
export const ChatBuilderStudio: React.FC = () => {
    // State Management
    const [selectedBot, setSelectedBot] = useState<string>('');
    const [botStatus, setBotStatus] = useState<'training' | 'ready' | 'deployed' | 'error'>('ready');
    const [activeNode, setActiveNode] = useState<string>('welcome');
    const [chatMessages, setChatMessages] = useState<Array<{ type: 'user' | 'bot', content: string }>>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showDeployModal, setShowDeployModal] = useState(false);

    // Refs
    const aiEngine = useRef(new ConversationalAIEngine());

    // Sample bots
    const bots = [
        {
            id: 'bot-001',
            name: 'Customer Support Bot',
            type: 'Support',
            channels: '3 channels',
            conversations: '1.2K',
            status: 'deployed' as const
        },
        {
            id: 'bot-002',
            name: 'Sales Assistant',
            type: 'Sales',
            channels: '2 channels',
            conversations: '856',
            status: 'deployed' as const
        },
        {
            id: 'bot-003',
            name: 'HR Onboarding Bot',
            type: 'HR',
            channels: '1 channel',
            conversations: '234',
            status: 'training' as const
        },
        {
            id: 'bot-004',
            name: 'Product FAQ Bot',
            type: 'FAQ',
            channels: '4 channels',
            conversations: '2.1K',
            status: 'draft' as const
        }
    ];

    // Flow nodes
    const flowNodes = [
        { id: 'welcome', title: 'Welcome Message', description: 'Greet users and introduce the bot', icon: '👋' },
        { id: 'intent', title: 'Intent Classification', description: 'Understand user intent', icon: '🧠' },
        { id: 'response', title: 'Generate Response', description: 'Create appropriate response', icon: '💬' },
        { id: 'action', title: 'Execute Action', description: 'Perform required actions', icon: '⚡' },
        { id: 'followup', title: 'Follow-up', description: 'Ask for additional help', icon: '🔄' }
    ];

    // Event Handlers
    const handleSendMessage = useCallback(async (message: string) => {
        if (!message.trim()) return;

        setChatMessages(prev => [...prev, { type: 'user', content: message }]);
        setIsTyping(true);

        try {
            // Simulate bot response
            await new Promise(resolve => setTimeout(resolve, 1500));

            const response = await aiEngine.current.generateResponse({
                message,
                botId: selectedBot,
                context: chatMessages
            });

            setChatMessages(prev => [...prev, { type: 'bot', content: response }]);
        } catch (error) {
            console.error('Failed to generate response:', error);
        } finally {
            setIsTyping(false);
        }
    }, [selectedBot, chatMessages]);

    const handleTrainBot = useCallback(async () => {
        setBotStatus('training');

        try {
            await aiEngine.current.trainBot({
                botId: selectedBot,
                trainingData: [], // Would include actual training data
                intents: [],
                responses: []
            });

            setBotStatus('ready');
        } catch (error) {
            console.error('Bot training failed:', error);
            setBotStatus('error');
        }
    }, [selectedBot]);

    // Initialize with sample messages
    useEffect(() => {
        setChatMessages([
            { type: 'bot', content: 'Hello! I\'m your customer support assistant. How can I help you today?' },
            { type: 'user', content: 'I need help with my order' },
            { type: 'bot', content: 'I\'d be happy to help you with your order. Could you please provide your order number?' }
        ]);
    }, [selectedBot]);

    return (
        <StudioContainer>
            <Header>
                <Logo>
                    <div className="icon">🤖</div>
                    <h1>G3D ChatBuilder Studio</h1>
                </Logo>
                <BotStatus>
                    <div className={`status-indicator ${botStatus}`}>
                        <div className="dot" />
                        <span>Bot Status: {botStatus.toUpperCase()}</span>
                    </div>
                    <GlassButton
                        variant="secondary"
                        onClick={handleTrainBot}
                        disabled={botStatus === 'training'}
                        theme={chatbuilderTheme}
                    >
                        {botStatus === 'training' ? '🔄 Training...' : '🎓 Train Bot'}
                    </GlassButton>
                    <GlassButton
                        variant="primary"
                        onClick={() => setShowDeployModal(true)}
                        theme={chatbuilderTheme}
                    >
                        🚀 Deploy
                    </GlassButton>
                </BotStatus>
            </Header>

            <MainGrid>
                {/* Left Panel - Bots & Tools */}
                <LeftPanel>
                    <GlassCard size="lg" theme={chatbuilderTheme}>
                        <h3 style={{ marginTop: 0 }}>My Chatbots</h3>
                        <BotsList>
                            {bots.map(bot => (
                                <div
                                    key={bot.id}
                                    className={`bot-item ${selectedBot === bot.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedBot(bot.id)}
                                >
                                    <div className="bot-avatar">🤖</div>
                                    <div className="bot-info">
                                        <div className="bot-name">{bot.name}</div>
                                        <div className="bot-details">
                                            <span>{bot.type}</span>
                                            <span>{bot.channels}</span>
                                            <span>{bot.conversations}</span>
                                        </div>
                                    </div>
                                    <div className={`bot-status ${bot.status}`}>
                                        {bot.status}
                                    </div>
                                </div>
                            ))}
                        </BotsList>
                    </GlassCard>

                    <GlassCard size="lg" theme={chatbuilderTheme}>
                        <h3 style={{ marginTop: 0 }}>Bot Analytics</h3>
                        <AnalyticsGrid>
                            <div className="metric-card">
                                <div className="metric-value">4.2K</div>
                                <div className="metric-label">Conversations</div>
                                <div className="metric-change positive">+18.5%</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">94.2%</div>
                                <div className="metric-label">Resolution Rate</div>
                                <div className="metric-change positive">+2.3%</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">1.2s</div>
                                <div className="metric-label">Avg Response Time</div>
                                <div className="metric-change negative">-0.3s</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">4.8</div>
                                <div className="metric-label">User Rating</div>
                                <div className="metric-change positive">+0.2</div>
                            </div>
                        </AnalyticsGrid>
                    </GlassCard>
                </LeftPanel>

                {/* Center Panel - Flow Builder */}
                <CenterPanel>
                    <GlassCard size="lg" theme={chatbuilderTheme}>
                        <h3 style={{ marginTop: 0 }}>Conversation Flow Builder</h3>
                        <FlowBuilder>
                            <div className="builder-content">
                                <div className="flow-canvas">
                                    <div className="flow-nodes">
                                        {flowNodes.map((node, index) => (
                                            <React.Fragment key={node.id}>
                                                <div
                                                    className={`node ${activeNode === node.id ? 'active' : ''}`}
                                                    onClick={() => setActiveNode(node.id)}
                                                >
                                                    <div className="node-icon">{node.icon}</div>
                                                    <div className="node-content">
                                                        <div className="node-title">{node.title}</div>
                                                        <div className="node-description">{node.description}</div>
                                                    </div>
                                                </div>
                                                {index < flowNodes.length - 1 && (
                                                    <div className="arrow">→</div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </FlowBuilder>
                    </GlassCard>

                    <GlassCard size="lg" theme={chatbuilderTheme}>
                        <h3 style={{ marginTop: 0 }}>Bot Configuration</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <GlassButton variant="ghost" fullWidth theme={chatbuilderTheme}>
                                🧠 Train Intents
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={chatbuilderTheme}>
                                💬 Manage Responses
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={chatbuilderTheme}>
                                📊 View Analytics
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={chatbuilderTheme}>
                                🔧 Bot Settings
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={chatbuilderTheme}>
                                📝 Training Data
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={chatbuilderTheme}>
                                🎯 A/B Testing
                            </GlassButton>
                        </div>
                    </GlassCard>
                </CenterPanel>

                {/* Right Panel - Chat Preview & Channels */}
                <RightPanel>
                    <GlassCard size="lg" theme={chatbuilderTheme}>
                        <h3 style={{ marginTop: 0 }}>Live Chat Preview</h3>
                        <ChatPreview>
                            <div className="chat-container">
                                <div className="chat-header">
                                    <div className="bot-avatar">🤖</div>
                                    <div className="bot-name">Customer Support Bot</div>
                                    <div className="online-indicator">
                                        <div className="dot"></div>
                                        <span>Online</span>
                                    </div>
                                </div>

                                <div className="chat-messages">
                                    {chatMessages.map((message, index) => (
                                        <div key={index} className={`message ${message.type}`}>
                                            {message.content}
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="typing-indicator">
                                            <div className="dot"></div>
                                            <div className="dot"></div>
                                            <div className="dot"></div>
                                        </div>
                                    )}
                                </div>

                                <div className="chat-input">
                                    <input
                                        type="text"
                                        placeholder="Type your message..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSendMessage(e.currentTarget.value);
                                                e.currentTarget.value = '';
                                            }
                                        }}
                                    />
                                    <button>📤</button>
                                </div>
                            </div>
                        </ChatPreview>
                    </GlassCard>

                    <GlassCard size="lg" theme={chatbuilderTheme}>
                        <h3 style={{ marginTop: 0 }}>Channel Integrations</h3>
                        <ChannelsList>
                            <div className="channel-item">
                                <div className="channel-icon website">🌐</div>
                                <div className="channel-info">
                                    <div className="channel-name">Website Widget</div>
                                    <div className="channel-status">Active - 1.2K conversations</div>
                                </div>
                                <div className="toggle-switch active">
                                    <div className="toggle-slider"></div>
                                </div>
                            </div>
                            <div className="channel-item">
                                <div className="channel-icon whatsapp">📱</div>
                                <div className="channel-info">
                                    <div className="channel-name">WhatsApp Business</div>
                                    <div className="channel-status">Active - 856 conversations</div>
                                </div>
                                <div className="toggle-switch active">
                                    <div className="toggle-slider"></div>
                                </div>
                            </div>
                            <div className="channel-item">
                                <div className="channel-icon slack">💬</div>
                                <div className="channel-info">
                                    <div className="channel-name">Slack Integration</div>
                                    <div className="channel-status">Inactive</div>
                                </div>
                                <div className="toggle-switch">
                                    <div className="toggle-slider"></div>
                                </div>
                            </div>
                            <div className="channel-item">
                                <div className="channel-icon discord">🎮</div>
                                <div className="channel-info">
                                    <div className="channel-name">Discord Bot</div>
                                    <div className="channel-status">Inactive</div>
                                </div>
                                <div className="toggle-switch">
                                    <div className="toggle-slider"></div>
                                </div>
                            </div>
                        </ChannelsList>
                    </GlassCard>

                    <GlassCard size="lg" theme={chatbuilderTheme}>
                        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="primary" fullWidth theme={chatbuilderTheme}>
                                ➕ Create New Bot
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth theme={chatbuilderTheme}>
                                📋 Import Bot Template
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={chatbuilderTheme}>
                                📊 Export Analytics
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={chatbuilderTheme}>
                                🔗 API Documentation
                            </GlassButton>
                        </div>
                    </GlassCard>
                </RightPanel>
            </MainGrid>

            {/* Deploy Modal */}
            <GlassModal
                isOpen={showDeployModal}
                onClose={() => setShowDeployModal(false)}
                title="Deploy Chatbot"
                size="lg"
                theme={chatbuilderTheme}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <h4>Deploy Customer Support Bot</h4>
                        <p>Select the channels where you want to deploy your chatbot.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" defaultChecked />
                            Website Widget
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" defaultChecked />
                            WhatsApp Business
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" />
                            Slack Integration
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" />
                            Discord Bot
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <GlassButton
                            variant="ghost"
                            onClick={() => setShowDeployModal(false)}
                            theme={chatbuilderTheme}
                        >
                            Cancel
                        </GlassButton>
                        <GlassButton
                            variant="primary"
                            onClick={() => setShowDeployModal(false)}
                            theme={chatbuilderTheme}
                        >
                            Deploy Bot
                        </GlassButton>
                    </div>
                </div>
            </GlassModal>
        </StudioContainer>
    );
};

export default ChatBuilderStudio;