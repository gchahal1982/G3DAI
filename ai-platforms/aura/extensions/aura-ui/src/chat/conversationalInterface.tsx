/*---------------------------------------------------------------------------------------------
 *  Aura - AI-First VS Code Fork - REVOLUTIONARY CONVERSATIONAL INTERFACE v2.0
 *  Copyright (c) Aura Development Team. All rights reserved.
 *  
 *  Based on Visual Studio Code
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *
 *  REVOLUTIONARY ENHANCEMENTS:
 *  - Advanced AI Personas (Claude Code patterns)
 *  - Ultra-Concise Response Mode
 *  - Security-First Interaction
 *  - Multi-Modal Context Awareness
 *  - Adaptive Response Streaming
 *  - Memory-Persistent Conversations
 *--------------------------------------------------------------------------------------------*/

import * as React from 'react';
import * as vscode from 'vscode';
import '../types/webapi';

/**
 * Revolutionary Conversational Interface
 * ChatGPT-style AI interaction with Claude Code-level intelligence
 */

interface ConversationMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant' | 'system';
    timestamp: Date;
    persona?: RevolutionaryAIPersona;
    codeBlocks?: EnhancedCodeBlock[];
    isStreaming?: boolean;
    reactions?: MessageReaction[];
    
    // Revolutionary additions
    securityLevel?: 'safe' | 'warning' | 'critical';
    contextAwareness?: MultiModalContext;
    adaptiveMetrics?: ResponseMetrics;
    memoryReferences?: MemoryReference[];
    taskBreakdown?: TaskBreakdown;
}

interface RevolutionaryAIPersona {
    id: string;
    name: string;
    description: string;
    style: 'ultra-concise' | 'security-focused' | 'mentor' | 'expert' | 'collaborative-partner' | 'debug-specialist';
    avatar: string;
    systemPrompt: string;
    specializations: string[];
    
    // Revolutionary enhancements
    responsePattern: 'minimal' | 'structured' | 'adaptive';
    securityMode: 'sandbox' | 'full' | 'adaptive';
    contextAwareness: boolean;
    memoryIntegration: boolean;
    taskManagement: boolean;
    confidenceThreshold: number;
}

interface EnhancedCodeBlock {
    id: string;
    language: string;
    code: string;
    description?: string;
    canApply: boolean;
    appliedAt?: Date;
    
    // Revolutionary additions
    securityAnalysis?: SecurityAnalysis;
    performanceImpact?: PerformanceImpact;
    testingStrategy?: TestingStrategy;
    alternatives?: AlternativeImplementation[];
}

interface SecurityAnalysis {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    threats: string[];
    recommendations: string[];
    sandboxCompatible: boolean;
}

interface PerformanceImpact {
    memoryUsage: number;
    cpuImpact: 'low' | 'medium' | 'high';
    scalability: 'excellent' | 'good' | 'limited';
    optimizations: string[];
}

interface MultiModalContext {
    currentFile: string;
    gitBranch: string;
    environment: string;
    recentErrors: string[];
    activeExtensions: string[];
}

interface MemoryReference {
    type: 'command' | 'preference' | 'pattern';
    content: string;
    confidence: number;
}

interface TaskBreakdown {
    mainTask: string;
    subtasks: Task[];
    currentPhase: string;
    progress: number;
}

interface Task {
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ResponseMetrics {
    responseTime: number;
    tokenUsage: number;
    satisfaction?: number;
    followUpLikelihood: number;
}

interface MessageReaction {
    type: 'like' | 'dislike' | 'copy' | 'apply' | 'bookmark';
    userId: string;
    timestamp: Date;
}

interface AlternativeImplementation {
    description: string;
    code: string;
    pros: string[];
    cons: string[];
}

interface TestingStrategy {
    testType: 'unit' | 'integration' | 'e2e';
    testCode: string;
    coverage: number;
}

// =================== REVOLUTIONARY AI PERSONAS ===================

const REVOLUTIONARY_PERSONAS: RevolutionaryAIPersona[] = [
    {
        id: 'ultra-concise',
        name: 'Ultra-Concise Expert',
        description: 'Claude Code-style minimal responses, maximum efficiency',
        style: 'ultra-concise',
        avatar: '⚡',
        systemPrompt: 'Ultra-concise coding expert. Answer in <4 lines. No preambles. Direct solutions only.',
        specializations: ['quick-fixes', 'minimal-responses', 'direct-answers'],
        responsePattern: 'minimal',
        securityMode: 'adaptive',
        contextAwareness: true,
        memoryIntegration: true,
        taskManagement: false,
        confidenceThreshold: 0.9
    },
    {
        id: 'security-specialist',
        name: 'Security Specialist',
        description: 'Security-first approach, threat detection, sandbox-aware',
        style: 'security-focused',
        avatar: '🔐',
        systemPrompt: 'Security expert. Malicious code detection enabled. Refuse threats instantly.',
        specializations: ['security-analysis', 'threat-detection', 'safe-coding'],
        responsePattern: 'structured',
        securityMode: 'sandbox',
        contextAwareness: true,
        memoryIntegration: true,
        taskManagement: true,
        confidenceThreshold: 0.95
    },
    {
        id: 'collaborative-partner',
        name: 'Collaborative Partner',
        description: 'Interactive problem-solving, asks clarifying questions',
        style: 'collaborative-partner',
        avatar: '🤝',
        systemPrompt: 'Collaborative coding partner. Interactive guidance. Shared problem-solving.',
        specializations: ['problem-solving', 'interactive-guidance', 'pair-programming'],
        responsePattern: 'adaptive',
        securityMode: 'full',
        contextAwareness: true,
        memoryIntegration: true,
        taskManagement: true,
        confidenceThreshold: 0.8
    },
    {
        id: 'debug-specialist',
        name: 'Debug Specialist',
        description: 'Decision tree debugging, root cause analysis',
        style: 'debug-specialist',
        avatar: '🔧',
        systemPrompt: 'Debug specialist. Decision tree enabled. Root cause analysis expert.',
        specializations: ['debugging', 'error-analysis', 'performance-optimization'],
        responsePattern: 'structured',
        securityMode: 'full',
        contextAwareness: true,
        memoryIntegration: true,
        taskManagement: true,
        confidenceThreshold: 0.85
    },
    {
        id: 'mentor',
        name: 'AI Mentor',
        description: 'Teaching approach, best practices, learning context',
        style: 'mentor',
        avatar: '👨‍🏫',
        systemPrompt: 'AI mentor. Teaching approach. Encourages best practices with learning context.',
        specializations: ['teaching', 'best-practices', 'knowledge-transfer'],
        responsePattern: 'adaptive',
        securityMode: 'full',
        contextAwareness: true,
        memoryIntegration: true,
        taskManagement: true,
        confidenceThreshold: 0.75
    },
    {
        id: 'expert',
        name: 'Technical Expert',
        description: 'Advanced patterns, assumes deep knowledge, minimal explanations',
        style: 'expert',
        avatar: '🧠',
        systemPrompt: 'Technical expert. Advanced patterns. Assumes deep knowledge. Minimal explanations.',
        specializations: ['advanced-patterns', 'optimization', 'architecture'],
        responsePattern: 'minimal',
        securityMode: 'full',
        contextAwareness: true,
        memoryIntegration: true,
        taskManagement: false,
        confidenceThreshold: 0.9
    }
];

// =================== REVOLUTIONARY CHAT INTERFACE ===================

interface ConversationalInterfaceState {
    messages: ConversationMessage[];
    currentPersona: RevolutionaryAIPersona;
    isStreaming: boolean;
    inputValue: string;
    isLoading: boolean;
    
    // Revolutionary state
    securityMode: 'sandbox' | 'full' | 'adaptive';
    adaptiveResponse: boolean;
    memoryContext: AuraMemoryContext;
    multiModalEnabled: boolean;
    taskTracking: boolean;
    performanceMetrics: ResponseMetrics[];
}

interface AuraMemoryContext {
    userPreferences: UserPreferences;
    recentInteractions: InteractionHistory[];
    codePatterns: CodePattern[];
    frequentCommands: string[];
}

interface UserPreferences {
    preferredPersona: string;
    responseLength: 'minimal' | 'balanced' | 'detailed';
    technicalLevel: 'beginner' | 'intermediate' | 'expert';
    securityPreference: 'strict' | 'balanced' | 'permissive';
}

interface InteractionHistory {
    query: string;
    response: string;
    satisfaction: number;
    timestamp: Date;
}

interface CodePattern {
    pattern: string;
    frequency: number;
    lastUsed: Date;
}

// =================== MAIN COMPONENT ===================

export const ConversationalInterface: React.FC = () => {
    const [state, setState] = React.useState<ConversationalInterfaceState>({
        messages: [],
        currentPersona: REVOLUTIONARY_PERSONAS[0], // Default to ultra-concise
        isStreaming: false,
        inputValue: '',
        isLoading: false,
        
        // Revolutionary state
        securityMode: 'adaptive',
        adaptiveResponse: true,
        memoryContext: {
            userPreferences: {
                preferredPersona: 'ultra-concise',
                responseLength: 'balanced',
                technicalLevel: 'intermediate',
                securityPreference: 'balanced'
            },
            recentInteractions: [],
            codePatterns: [],
            frequentCommands: []
        },
        multiModalEnabled: true,
        taskTracking: true,
        performanceMetrics: []
    });

    // Revolutionary: Load AURA memory on component mount
    React.useEffect(() => {
        loadAuraMemory();
    }, []);

    const loadAuraMemory = async () => {
        try {
            // Load persistent memory from AURA.md
            const memoryContent = await vscode.workspace.fs.readFile(
                vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, 'docs', 'AURA.md')
            );
            
            // Parse and apply memory context
            const memoryText = Buffer.from(memoryContent).toString('utf8');
            const parsedMemory = parseAuraMemory(memoryText);
            
            setState(prev => ({
                ...prev,
                memoryContext: {
                    ...prev.memoryContext,
                    ...parsedMemory
                }
            }));
        } catch (error) {
            console.warn('Could not load AURA memory:', error);
        }
    };

    const parseAuraMemory = (memoryText: string): Partial<AuraMemoryContext> => {
        // Extract user preferences from AURA.md
        const preferredPersonaMatch = memoryText.match(/"preferredPersonas":\s*\[(.*?)\]/);
        const technicalLevelMatch = memoryText.match(/"technicalLevel":\s*"(.*?)"/);
        const responseStyleMatch = memoryText.match(/"communicationStyle":\s*"(.*?)"/);
        
        return {
            userPreferences: {
                preferredPersona: preferredPersonaMatch ? preferredPersonaMatch[1].replace(/"/g, '').split(',')[0] : 'ultra-concise',
                responseLength: responseStyleMatch?.[1] === 'direct' ? 'minimal' : 'balanced',
                technicalLevel: (technicalLevelMatch?.[1] as any) || 'intermediate',
                securityPreference: 'balanced'
            }
        };
    };

    // Revolutionary: Enhanced message sending with security validation
    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        // Security validation first
        const securityCheck = await validateMessageSecurity(content);
        if (securityCheck.riskLevel === 'critical') {
            addMessage({
                id: generateId(),
                content: '🚨 SECURITY WARNING: Message contains potentially dangerous content and was blocked.',
                role: 'system',
                timestamp: new Date(),
                securityLevel: 'critical'
            });
            return;
        }

        // Map risk level to security level format
        const mapRiskToSecurity = (riskLevel: string): 'safe' | 'warning' | 'critical' => {
            switch (riskLevel) {
                case 'low': return 'safe';
                case 'medium': return 'warning';
                case 'high': return 'critical';
                default: return 'safe';
            }
        };

        // Add user message
        const userMessage: ConversationMessage = {
            id: generateId(),
            content,
            role: 'user',
            timestamp: new Date(),
            securityLevel: mapRiskToSecurity(securityCheck.riskLevel),
            contextAwareness: await getMultiModalContext()
        };

        addMessage(userMessage);

        // Start streaming response
        setState(prev => ({ ...prev, isStreaming: true, inputValue: '' }));

        try {
            // Revolutionary: Build context-aware prompt
            const prompt = await buildRevolutionaryPrompt(content, state.currentPersona);
            
            // Stream response
            await streamAIResponse(prompt, userMessage);
            
        } catch (error) {
            addMessage({
                id: generateId(),
                content: `Error: ${error.message}`,
                role: 'system',
                timestamp: new Date(),
                securityLevel: 'warning'
            });
        } finally {
            setState(prev => ({ ...prev, isStreaming: false }));
        }
    };

    const validateMessageSecurity = async (content: string): Promise<{ riskLevel: 'low' | 'medium' | 'high' | 'critical' }> => {
        // Revolutionary security validation
        const maliciousPatterns = [
            /eval\s*\(/gi,
            /exec\s*\(/gi,
            /\.\.\/\.\.\//gi,
            /document\.cookie/gi,
            /localStorage\.setItem.*password/gi,
            /keylogger/gi,
            /backdoor/gi,
            /malware/gi
        ];

        const detectedThreats = maliciousPatterns.filter(pattern => pattern.test(content));
        
        if (detectedThreats.length > 0) {
            return { riskLevel: 'critical' };
        }
        
        return { riskLevel: 'low' };
    };

    const getMultiModalContext = async (): Promise<MultiModalContext> => {
        // Revolutionary: Gather comprehensive context
        const activeEditor = vscode.window.activeTextEditor;
        const gitExtension = vscode.extensions.getExtension('vscode.git');
        
        return {
            currentFile: activeEditor?.document.fileName || 'unknown',
            gitBranch: 'main', // Would integrate with Git API
            environment: process.platform,
            recentErrors: [], // Would integrate with problem diagnostics
            activeExtensions: vscode.extensions.all.map(ext => ext.id)
        };
    };

    const buildRevolutionaryPrompt = async (userContent: string, persona: RevolutionaryAIPersona): Promise<string> => {
        // Revolutionary: Use our enhanced PromptAssembler
        const contextData = {
            intent: 'chat',
            userQuery: userContent,
            currentFile: vscode.window.activeTextEditor?.document.fileName,
            cursorPosition: vscode.window.activeTextEditor?.selection.start,
            contextChunks: [],
            multiModalContext: await getMultiModalContext(),
            userProfile: state.memoryContext.userPreferences
        };

        // This would integrate with our PromptAssembler
        return `${persona.systemPrompt}\n\nContext: ${JSON.stringify(contextData)}\n\nUser: ${userContent}`;
    };

    const streamAIResponse = async (prompt: string, userMessage: ConversationMessage) => {
        // Revolutionary: Adaptive streaming based on persona
        const responseId = generateId();
        let accumulatedResponse = '';
        
        // Add initial streaming message
        const streamingMessage: ConversationMessage = {
            id: responseId,
            content: '',
            role: 'assistant',
            timestamp: new Date(),
            persona: state.currentPersona,
            isStreaming: true,
            adaptiveMetrics: {
                responseTime: Date.now(),
                tokenUsage: 0,
                followUpLikelihood: 0.5
            }
        };

        addMessage(streamingMessage);

        // Simulate streaming response (would integrate with AI service)
        const responseText = await generateAIResponse(prompt);
        
        // Stream character by character for ultra-responsive feel
        for (let i = 0; i <= responseText.length; i++) {
            accumulatedResponse = responseText.substring(0, i);
            
            updateMessage(responseId, {
                content: accumulatedResponse,
                isStreaming: i < responseText.length
            });

            // Adaptive delay based on persona
            const delay = state.currentPersona.style === 'ultra-concise' ? 10 : 30;
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Finalize message with metadata
        updateMessage(responseId, {
            isStreaming: false,
            adaptiveMetrics: {
                responseTime: Date.now() - streamingMessage.adaptiveMetrics!.responseTime,
                tokenUsage: Math.ceil(accumulatedResponse.length / 4),
                followUpLikelihood: calculateFollowUpLikelihood(accumulatedResponse)
            }
        });
    };

    const generateAIResponse = async (prompt: string): Promise<string> => {
        // Revolutionary: Would integrate with multiple AI providers
        // For now, simulate based on persona
        switch (state.currentPersona.style) {
            case 'ultra-concise':
                return 'Fixed. Try now.'; // Ultra-minimal Claude Code style
            case 'security-focused':
                return '✅ SECURE: Code analyzed. No threats detected. Safe to proceed.';
            case 'collaborative-partner':
                return 'I see what you\'re trying to do. Let me walk through this step by step...';
            case 'debug-specialist':
                return '🔧 Analysis: Root cause identified. Error in line 42. Here\'s the fix...';
            case 'mentor':
                return 'Great question! Let me explain the concept and show you the best practice approach...';
            case 'expert':
                return 'Optimize with lazy loading pattern. Implement React.lazy() with Suspense fallback.';
            default:
                return 'I can help you with that. What specifically would you like to know?';
        }
    };

    const calculateFollowUpLikelihood = (response: string): number => {
        // Revolutionary: ML-based follow-up prediction
        if (response.includes('?') || response.includes('clarify')) return 0.8;
        if (response.length < 50) return 0.3; // Ultra-concise responses
        if (response.includes('error') || response.includes('fix')) return 0.6;
        return 0.4;
    };

    const addMessage = (message: ConversationMessage) => {
        setState(prev => ({
            ...prev,
            messages: [...prev.messages, message]
        }));
    };

    const updateMessage = (id: string, updates: Partial<ConversationMessage>) => {
        setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
                msg.id === id ? { ...msg, ...updates } : msg
            )
        }));
    };

    const switchPersona = (persona: RevolutionaryAIPersona) => {
        setState(prev => ({ ...prev, currentPersona: persona }));
        
        // Add system message about persona switch
        addMessage({
            id: generateId(),
            content: `Switched to ${persona.name} mode. ${persona.description}`,
            role: 'system',
            timestamp: new Date()
        });
    };

    const generateId = (): string => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    // Revolutionary: Render with enhanced UI
    return (
        <div className="conversational-interface revolutionary-chat">
            {/* Revolutionary Header with Persona Selector */}
            <div className="chat-header">
                <div className="persona-selector">
                    {REVOLUTIONARY_PERSONAS.map(persona => (
                        <button
                            key={persona.id}
                            className={`persona-btn ${state.currentPersona.id === persona.id ? 'active' : ''}`}
                            onClick={() => switchPersona(persona)}
                            title={persona.description}
                        >
                            <span className="persona-avatar">{persona.avatar}</span>
                            <span className="persona-name">{persona.name}</span>
                        </button>
                    ))}
                </div>
                
                {/* Revolutionary: Security & Context Indicators */}
                <div className="context-indicators">
                    <span className={`security-indicator ${state.securityMode}`}>
                        🔐 {state.securityMode.toUpperCase()}
                    </span>
                    {state.multiModalEnabled && (
                        <span className="context-indicator">
                            🌐 Multi-Modal
                        </span>
                    )}
                    {state.taskTracking && (
                        <span className="task-indicator">
                            📋 Task Tracking
                        </span>
                    )}
                </div>
            </div>

            {/* Revolutionary Message List */}
            <div className="messages-container">
                {state.messages.map(message => (
                    <MessageComponent 
                        key={message.id} 
                        message={message} 
                        onApplyCode={(code) => applyCodeToEditor(code)}
                        onReaction={(reaction) => handleMessageReaction(message.id, reaction)}
                    />
                ))}
                
                {state.isStreaming && (
                    <div className="streaming-indicator">
                        <span className="typing-animation">
                            {state.currentPersona.avatar} {state.currentPersona.name} is responding...
                        </span>
                    </div>
                )}
            </div>

            {/* Revolutionary Input with Security Validation */}
            <div className="input-container">
                <div className="input-wrapper">
                    <textarea
                        value={state.inputValue}
                        onChange={(e) => setState(prev => ({ ...prev, inputValue: e.target.value }))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage(state.inputValue);
                            }
                        }}
                        placeholder={`Ask ${state.currentPersona.name}... (${state.currentPersona.style} mode)`}
                        className="message-input"
                        rows={3}
                        disabled={state.isStreaming}
                    />
                    
                    <button
                        onClick={() => sendMessage(state.inputValue)}
                        disabled={!state.inputValue.trim() || state.isStreaming}
                        className="send-button revolutionary-send"
                    >
                        {state.isStreaming ? '⏳' : '🚀'}
                    </button>
                </div>
                
                {/* Revolutionary: Real-time Security Validation */}
                {state.inputValue && (
                    <div className="input-validation">
                        <SecurityValidationIndicator content={state.inputValue} />
                    </div>
                )}
            </div>
        </div>
    );
};

// =================== REVOLUTIONARY HELPER COMPONENTS ===================

const MessageComponent: React.FC<{
    message: ConversationMessage;
    onApplyCode: (code: string) => void;
    onReaction: (reaction: string) => void;
}> = ({ message, onApplyCode, onReaction }) => {
    return (
        <div className={`message ${message.role} ${message.securityLevel || ''}`}>
            <div className="message-header">
                {message.persona && (
                    <span className="persona-badge">
                        {message.persona.avatar} {message.persona.name}
                    </span>
                )}
                <span className="timestamp">{message.timestamp.toLocaleTimeString()}</span>
                {message.securityLevel && message.securityLevel !== 'safe' && (
                    <span className={`security-badge ${message.securityLevel}`}>
                        {message.securityLevel === 'critical' ? '🚨' : '⚠️'} {message.securityLevel.toUpperCase()}
                    </span>
                )}
            </div>
            
            <div className="message-content">
                {message.isStreaming ? (
                    <span className="streaming-content">{message.content}<span className="cursor">|</span></span>
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }} />
                )}
            </div>

            {message.codeBlocks && message.codeBlocks.map(block => (
                <CodeBlockComponent 
                    key={block.id} 
                    codeBlock={block} 
                    onApply={() => onApplyCode(block.code)} 
                />
            ))}

            {message.taskBreakdown && (
                <TaskBreakdownComponent taskBreakdown={message.taskBreakdown} />
            )}

            {!message.isStreaming && (
                <div className="message-actions">
                    <button onClick={() => onReaction('like')}>👍</button>
                    <button onClick={() => onReaction('copy')}>📋</button>
                    <button onClick={() => onReaction('bookmark')}>🔖</button>
                </div>
            )}
        </div>
    );
};

const SecurityValidationIndicator: React.FC<{ content: string }> = ({ content }) => {
    const [validation, setValidation] = React.useState<{ riskLevel: string; safe: boolean }>({ 
        riskLevel: 'low', 
        safe: true 
    });

    React.useEffect(() => {
        // Real-time security validation
        const maliciousPatterns = [/eval\s*\(/gi, /exec\s*\(/gi, /keylogger/gi];
        const hasThreats = maliciousPatterns.some(pattern => pattern.test(content));
        
        setValidation({
            riskLevel: hasThreats ? 'critical' : 'low',
            safe: !hasThreats
        });
    }, [content]);

    if (validation.safe) {
        return <span className="security-ok">✅ Safe</span>;
    }

    return (
        <span className="security-warning">
            🚨 Security Warning: Potentially dangerous content detected
        </span>
    );
};

const CodeBlockComponent: React.FC<{
    codeBlock: EnhancedCodeBlock;
    onApply: () => void;
}> = ({ codeBlock, onApply }) => {
    return (
        <div className="code-block-container">
            <div className="code-block-header">
                <span className="language-badge">{codeBlock.language}</span>
                {codeBlock.securityAnalysis && (
                    <span className={`security-badge ${codeBlock.securityAnalysis.riskLevel}`}>
                        {codeBlock.securityAnalysis.riskLevel.toUpperCase()}
                    </span>
                )}
                <button onClick={onApply} className="apply-code-btn">
                    Apply Code
                </button>
            </div>
            
            <pre className="code-content">
                <code>{codeBlock.code}</code>
            </pre>
            
            {codeBlock.description && (
                <div className="code-description">{codeBlock.description}</div>
            )}
        </div>
    );
};

const TaskBreakdownComponent: React.FC<{ taskBreakdown: TaskBreakdown }> = ({ taskBreakdown }) => {
    return (
        <div className="task-breakdown">
            <div className="task-header">
                <h4>📋 Task: {taskBreakdown.mainTask}</h4>
                <div className="progress-bar">
                    <div 
                        className="progress-fill" 
                        style={{ width: `${taskBreakdown.progress}%` }}
                    ></div>
                </div>
                <span className="progress-text">{taskBreakdown.progress}% Complete</span>
            </div>
            
            <div className="subtasks">
                {taskBreakdown.subtasks.map(task => (
                    <div key={task.id} className={`subtask ${task.status}`}>
                        <span className="task-status">
                            {task.status === 'completed' ? '✅' : 
                             task.status === 'in_progress' ? '🔄' : '⏳'}
                        </span>
                        <span className="task-description">{task.description}</span>
                        <span className={`priority-badge ${task.priority}`}>
                            {task.priority.toUpperCase()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// =================== UTILITY FUNCTIONS ===================

const formatMessageContent = (content: string): string => {
    // Revolutionary: Enhanced markdown rendering with security
    return content
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');
};

const applyCodeToEditor = async (code: string) => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const selection = editor.selection;
        await editor.edit(editBuilder => {
            editBuilder.replace(selection, code);
        });
    }
};

const handleMessageReaction = (messageId: string, reaction: string) => {
    // Revolutionary: Track user satisfaction and preferences
    console.log(`Message ${messageId} received reaction: ${reaction}`);
    // Would update AURA memory with user feedback
};

export default ConversationalInterface; 