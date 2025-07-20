/*---------------------------------------------------------------------------------------------
 *  Aura - AI-First VS Code Fork
 *  Copyright (c) Aura Development Team. All rights reserved.
 *  
 *  Based on Visual Studio Code
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as React from 'react';
import * as vscode from 'vscode';

/**
 * Dedicated AI Chat Panel
 * Premium AI interface with advanced features and collaboration
 */

interface AIModel {
    id: string;
    name: string;
    provider: 'openai' | 'anthropic' | 'cohere' | 'local';
    capabilities: ModelCapability[];
    description: string;
    pricing: 'free' | 'premium' | 'enterprise';
    maxTokens: number;
    features: string[];
}

interface ModelCapability {
    type: 'text' | 'code' | 'vision' | 'function-calling' | 'reasoning';
    level: 'basic' | 'advanced' | 'expert';
}

interface FileContext {
    id: string;
    name: string;
    path: string;
    content: string;
    language: string;
    size: number;
    addedAt: Date;
    highlighted: boolean;
}

interface ChatSession {
    id: string;
    title: string;
    model: AIModel;
    participants: SessionParticipant[];
    messages: ChatMessage[];
    fileContexts: FileContext[];
    createdAt: Date;
    lastActivity: Date;
    isCollaborative: boolean;
    shareUrl?: string;
}

interface SessionParticipant {
    id: string;
    name: string;
    avatar: string;
    role: 'owner' | 'collaborator' | 'viewer';
    isOnline: boolean;
    cursor?: CursorPosition;
}

interface CursorPosition {
    messageId: string;
    offset: number;
}

interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant' | 'system';
    author?: SessionParticipant;
    timestamp: Date;
    model?: AIModel;
    tokens?: number;
    cost?: number;
    attachments?: MessageAttachment[];
    highlights?: CodeHighlight[];
    reactions?: MessageReaction[];
    isEdited?: boolean;
    editHistory?: string[];
}

interface MessageAttachment {
    id: string;
    type: 'file' | 'image' | 'code-snippet' | 'link';
    name: string;
    url: string;
    size?: number;
    preview?: string;
}

interface CodeHighlight {
    id: string;
    fileName: string;
    startLine: number;
    endLine: number;
    code: string;
    language: string;
    explanation?: string;
}

interface MessageReaction {
    emoji: string;
    count: number;
    users: string[];
}

export class AIChatPanel extends React.Component<AIChatPanelProps, AIChatPanelState> {
    private fileDropRef: React.RefObject<HTMLDivElement>;
    private messageInputRef: React.RefObject<HTMLTextAreaElement>;
    private messagesEndRef: React.RefObject<HTMLDivElement>;
    private collaborationSocket: WebSocket | null = null;

    constructor(props: AIChatPanelProps) {
        super(props);
        
        this.fileDropRef = React.createRef();
        this.messageInputRef = React.createRef();
        this.messagesEndRef = React.createRef();
        
        this.state = {
            currentSession: this.createNewSession(),
            availableModels: this.loadAvailableModels(),
            selectedModel: null,
            inputValue: '',
            fileContexts: [],
            isProcessing: false,
            showModelSelector: false,
            showCollaborationPanel: false,
            dragActive: false,
            theme: 'aura-premium',
            notifications: []
        };
        
        this.setupCollaboration();
        this.setupFileDropHandlers();
    }

    componentDidMount(): void {
        this.scrollToBottom();
        this.setupKeyboardShortcuts();
    }

    render(): JSX.Element {
        return (
            <div className={`ai-chat-panel ${this.state.theme}`}>
                {this.renderHeader()}
                {this.renderModelSelector()}
                {this.renderFileContextArea()}
                {this.renderMessagesArea()}
                {this.renderInputArea()}
                {this.renderCollaborationPanel()}
                {this.renderNotifications()}
            </div>
        );
    }

    /**
     * Render premium header with model selection and collaboration
     */
    private renderHeader(): JSX.Element {
        const { currentSession, selectedModel, showModelSelector, showCollaborationPanel } = this.state;
        
        return (
            <div className="chat-header">
                <div className="header-left">
                    <div className="session-info">
                        <h2 className="session-title">{currentSession.title}</h2>
                        <div className="session-meta">
                            <span className="message-count">{currentSession.messages.length} messages</span>
                            {selectedModel && (
                                <span className="model-badge">{selectedModel.name}</span>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="header-controls">
                    <button 
                        className={`control-btn ${showModelSelector ? 'active' : ''}`}
                        onClick={() => this.setState({ showModelSelector: !showModelSelector })}
                        title="Select AI Model"
                    >
                        🧠 Model
                    </button>
                    
                    <button 
                        className={`control-btn ${showCollaborationPanel ? 'active' : ''}`}
                        onClick={() => this.setState({ showCollaborationPanel: !showCollaborationPanel })}
                        title="Collaboration"
                    >
                        👥 Share
                    </button>
                    
                    <button 
                        className="control-btn"
                        onClick={this.handleExportSession}
                        title="Export Session"
                    >
                        📤 Export
                    </button>
                    
                    <button 
                        className="control-btn"
                        onClick={this.handleNewSession}
                        title="New Session"
                    >
                        ➕ New
                    </button>
                </div>
            </div>
        );
    }

    /**
     * Render AI model selector with capabilities
     */
    private renderModelSelector(): JSX.Element {
        const { showModelSelector, availableModels, selectedModel } = this.state;
        
        if (!showModelSelector) return <></>;
        
        return (
            <div className="model-selector-panel">
                <div className="panel-header">
                    <h3>Select AI Model</h3>
                    <button 
                        className="close-btn"
                        onClick={() => this.setState({ showModelSelector: false })}
                    >
                        ✕
                    </button>
                </div>
                
                <div className="models-grid">
                    {availableModels.map(model => (
                        <div 
                            key={model.id}
                            className={`model-card ${selectedModel?.id === model.id ? 'selected' : ''}`}
                            onClick={() => this.handleModelSelect(model)}
                        >
                            <div className="model-header">
                                <span className="model-name">{model.name}</span>
                                <span className={`pricing-badge ${model.pricing}`}>
                                    {model.pricing}
                                </span>
                            </div>
                            
                            <div className="model-description">{model.description}</div>
                            
                            <div className="model-capabilities">
                                {model.capabilities.map(cap => (
                                    <span key={`${cap.type}-${cap.level}`} className="capability-tag">
                                        {cap.type}
                                    </span>
                                ))}
                            </div>
                            
                            <div className="model-features">
                                {model.features.slice(0, 3).map(feature => (
                                    <div key={feature} className="feature-item">
                                        ✨ {feature}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    /**
     * Render file context area with drag-and-drop
     */
    private renderFileContextArea(): JSX.Element {
        const { fileContexts, dragActive } = this.state;
        
        return (
            <div 
                ref={this.fileDropRef}
                className={`file-context-area ${dragActive ? 'drag-active' : ''} ${fileContexts.length > 0 ? 'has-files' : ''}`}
            >
                {fileContexts.length === 0 ? (
                    <div className="drop-zone">
                        <div className="drop-zone-content">
                            <div className="drop-icon">📁</div>
                            <div className="drop-text">
                                Drop files here or click to add context
                            </div>
                            <button 
                                className="add-context-btn"
                                onClick={this.handleAddFileContext}
                            >
                                Add File Context
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="file-contexts">
                        <div className="contexts-header">
                            <span className="contexts-title">File Contexts ({fileContexts.length})</span>
                            <button 
                                className="clear-contexts-btn"
                                onClick={this.handleClearContexts}
                            >
                                Clear All
                            </button>
                        </div>
                        
                        <div className="contexts-list">
                            {fileContexts.map(context => this.renderFileContext(context))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    /**
     * Render individual file context item
     */
    private renderFileContext(context: FileContext): JSX.Element {
        return (
            <div key={context.id} className={`file-context-item ${context.highlighted ? 'highlighted' : ''}`}>
                <div className="context-header">
                    <div className="file-info">
                        <span className="file-icon">📄</span>
                        <span className="file-name">{context.name}</span>
                        <span className="file-language">{context.language}</span>
                    </div>
                    
                    <div className="context-actions">
                        <button 
                            className="action-btn"
                            onClick={() => this.handleHighlightContext(context)}
                            title="Highlight in Editor"
                        >
                            🔍
                        </button>
                        <button 
                            className="action-btn"
                            onClick={() => this.handleRemoveContext(context)}
                            title="Remove Context"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div className="context-preview">
                    <pre>
                        <code className={`language-${context.language}`}>
                            {context.content.slice(0, 200)}
                            {context.content.length > 200 && '...'}
                        </code>
                    </pre>
                </div>
            </div>
        );
    }

    /**
     * Render messages area with premium styling
     */
    private renderMessagesArea(): JSX.Element {
        const { currentSession } = this.state;
        
        return (
            <div className="messages-area">
                <div className="messages-list">
                    {currentSession.messages.map(message => this.renderMessage(message))}
                    <div ref={this.messagesEndRef} />
                </div>
            </div>
        );
    }

    /**
     * Render individual message with premium features
     */
    private renderMessage(message: ChatMessage): JSX.Element {
        const isUser = message.role === 'user';
        const isSystem = message.role === 'system';
        
        return (
            <div 
                key={message.id}
                className={`message ${message.role}-message ${isSystem ? 'system-message' : ''}`}
            >
                <div className="message-avatar">
                    {this.getMessageAvatar(message)}
                </div>
                
                <div className="message-content">
                    <div className="message-header">
                        <span className="message-author">
                            {this.getMessageAuthor(message)}
                        </span>
                        
                        <div className="message-meta">
                            <span className="message-time">
                                {message.timestamp.toLocaleTimeString()}
                            </span>
                            
                            {message.model && (
                                <span className="message-model">{message.model.name}</span>
                            )}
                            
                            {message.tokens && (
                                <span className="token-count">{message.tokens} tokens</span>
                            )}
                        </div>
                    </div>
                    
                    <div className="message-body">
                        {this.renderMessageContent(message)}
                        {message.attachments?.map(attachment => this.renderAttachment(attachment))}
                        {message.highlights?.map(highlight => this.renderCodeHighlight(highlight))}
                    </div>
                    
                    <div className="message-actions">
                        {this.renderMessageActions(message)}
                    </div>
                    
                    {message.reactions && message.reactions.length > 0 && (
                        <div className="message-reactions">
                            {message.reactions.map(reaction => this.renderReaction(reaction, message))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /**
     * Render interactive code highlight
     */
    private renderCodeHighlight(highlight: CodeHighlight): JSX.Element {
        return (
            <div key={highlight.id} className="code-highlight">
                <div className="highlight-header">
                    <span className="file-name">{highlight.fileName}</span>
                    <span className="line-range">
                        Lines {highlight.startLine}-{highlight.endLine}
                    </span>
                    
                    <button 
                        className="action-btn"
                        onClick={() => this.handleJumpToCode(highlight)}
                        title="Jump to Code"
                    >
                        🔗
                    </button>
                </div>
                
                <div className="highlight-code">
                    <pre>
                        <code className={`language-${highlight.language}`}>
                            {highlight.code}
                        </code>
                    </pre>
                </div>
                
                {highlight.explanation && (
                    <div className="highlight-explanation">
                        {highlight.explanation}
                    </div>
                )}
            </div>
        );
    }

    /**
     * Render premium input area with advanced features
     */
    private renderInputArea(): JSX.Element {
        const { inputValue, isProcessing, selectedModel } = this.state;
        
        return (
            <div className="input-area">
                <div className="input-container">
                    <div className="input-wrapper">
                        <textarea
                            ref={this.messageInputRef}
                            className="message-input"
                            placeholder={`Ask ${selectedModel?.name || 'AI'} anything about your code...`}
                            value={inputValue}
                            onChange={this.handleInputChange}
                            onKeyDown={this.handleKeyDown}
                            disabled={isProcessing}
                            rows={1}
                        />
                        
                        <div className="input-toolbar">
                            <button 
                                className="toolbar-btn"
                                onClick={this.handleAttachFile}
                                title="Attach File"
                            >
                                📎
                            </button>
                            
                            <button 
                                className="toolbar-btn"
                                onClick={this.handleInsertCodeSnippet}
                                title="Insert Code Snippet"
                            >
                                💻
                            </button>
                            
                            <button 
                                className="toolbar-btn"
                                onClick={this.handleVoiceInput}
                                title="Voice Input"
                            >
                                🎤
                            </button>
                            
                            <div className="input-spacer" />
                            
                            <button 
                                className="send-btn"
                                onClick={this.handleSendMessage}
                                disabled={!inputValue.trim() || isProcessing || !selectedModel}
                            >
                                {isProcessing ? '⏳' : '🚀'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="input-status">
                        {this.renderInputStatus()}
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Render collaboration panel for team sessions
     */
    private renderCollaborationPanel(): JSX.Element {
        const { showCollaborationPanel, currentSession } = this.state;
        
        if (!showCollaborationPanel) return <></>;
        
        return (
            <div className="collaboration-panel">
                <div className="panel-header">
                    <h3>Collaboration</h3>
                    <button 
                        className="close-btn"
                        onClick={() => this.setState({ showCollaborationPanel: false })}
                    >
                        ✕
                    </button>
                </div>
                
                <div className="collaboration-content">
                    <div className="session-sharing">
                        <h4>Share Session</h4>
                        <div className="share-controls">
                            <input 
                                type="text"
                                className="share-url"
                                value={currentSession.shareUrl || 'Not shared'}
                                readOnly
                            />
                            <button 
                                className="share-btn"
                                onClick={this.handleCreateShareLink}
                            >
                                🔗 Share
                            </button>
                        </div>
                    </div>
                    
                    <div className="participants">
                        <h4>Participants ({currentSession.participants.length})</h4>
                        <div className="participants-list">
                            {currentSession.participants.map(participant => (
                                <div key={participant.id} className="participant-item">
                                    <div className="participant-avatar">{participant.avatar}</div>
                                    <div className="participant-info">
                                        <span className="participant-name">{participant.name}</span>
                                        <span className="participant-role">{participant.role}</span>
                                    </div>
                                    <div className={`online-status ${participant.isOnline ? 'online' : 'offline'}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Event handlers and utility methods...
    private handleSendMessage = async (): Promise<void> => {
        const { inputValue, selectedModel, currentSession, fileContexts } = this.state;
        
        if (!inputValue.trim() || !selectedModel) return;
        
        const userMessage: ChatMessage = {
            id: this.generateId(),
            content: inputValue,
            role: 'user',
            timestamp: new Date(),
            attachments: []
        };
        
        this.setState({ 
            inputValue: '', 
            isProcessing: true,
            currentSession: {
                ...currentSession,
                messages: [...currentSession.messages, userMessage]
            }
        });
        
        try {
            const response = await this.sendToAI(inputValue, selectedModel, fileContexts);
            this.addAIMessage(response, selectedModel);
        } catch (error) {
            this.addErrorMessage('Failed to get AI response');
        } finally {
            this.setState({ isProcessing: false });
        }
    };

    private handleModelSelect = (model: AIModel): void => {
        this.setState({ 
            selectedModel: model,
            showModelSelector: false 
        });
    };

    private sendToAI = async (message: string, model: AIModel, contexts: FileContext[]): Promise<string> => {
        // Simulate AI response (in production, this would call actual AI service)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return `Response from ${model.name}: I understand you're asking about "${message}". Based on the ${contexts.length} file context(s) provided, here's my analysis...`;
    };

    private addAIMessage = (content: string, model: AIModel): void => {
        const aiMessage: ChatMessage = {
            id: this.generateId(),
            content,
            role: 'assistant',
            timestamp: new Date(),
            model,
            tokens: Math.floor(Math.random() * 1000) + 100
        };
        
        this.setState(prevState => ({
            currentSession: {
                ...prevState.currentSession,
                messages: [...prevState.currentSession.messages, aiMessage]
            }
        }));
    };

    private addErrorMessage = (error: string): void => {
        const errorMessage: ChatMessage = {
            id: this.generateId(),
            content: error,
            role: 'system',
            timestamp: new Date()
        };
        
        this.setState(prevState => ({
            currentSession: {
                ...prevState.currentSession,
                messages: [...prevState.currentSession.messages, errorMessage]
            }
        }));
    };

    private generateId = (): string => {
        return Math.random().toString(36).substr(2, 9);
    };

    /**
     * Create a new chat session
     */
    private createNewSession = (): ChatSession => {
        return {
            id: this.generateId(),
            title: 'New Chat Session',
            model: {} as AIModel,
            participants: [{
                id: 'user-1',
                name: 'You',
                avatar: '👤',
                role: 'owner',
                isOnline: true
            }],
            messages: [],
            fileContexts: [],
            createdAt: new Date(),
            lastActivity: new Date(),
            isCollaborative: false
        };
    };

    /**
     * Load available AI models
     */
    private loadAvailableModels = (): AIModel[] => {
        return [
            {
                id: 'gpt-4-turbo',
                name: 'GPT-4 Turbo',
                provider: 'openai',
                capabilities: [
                    { type: 'text', level: 'expert' },
                    { type: 'code', level: 'expert' },
                    { type: 'reasoning', level: 'expert' }
                ],
                description: 'Most capable model for complex reasoning and code generation',
                pricing: 'premium',
                maxTokens: 128000,
                features: ['Advanced reasoning', 'Code generation', 'Multi-language support']
            },
            {
                id: 'claude-3-sonnet',
                name: 'Claude 3 Sonnet',
                provider: 'anthropic',
                capabilities: [
                    { type: 'text', level: 'expert' },
                    { type: 'code', level: 'advanced' },
                    { type: 'reasoning', level: 'expert' }
                ],
                description: 'Balanced model with excellent reasoning and safety',
                pricing: 'premium',
                maxTokens: 200000,
                features: ['Safety-focused', 'Long context', 'Accurate reasoning']
            },
            {
                id: 'local-codellama',
                name: 'Code Llama',
                provider: 'local',
                capabilities: [
                    { type: 'code', level: 'expert' },
                    { type: 'text', level: 'advanced' }
                ],
                description: 'Local code-specialized model for privacy-focused development',
                pricing: 'free',
                maxTokens: 16000,
                features: ['Privacy-first', 'Code-optimized', 'Local processing']
            }
        ];
    };

    /**
     * Setup collaboration features
     */
    private setupCollaboration = (): void => {
        // Initialize WebSocket connection for real-time collaboration
        // In production, this would connect to a collaboration service
        console.log('Setting up collaboration features...');
    };

    /**
     * Setup file drop handlers for drag-and-drop functionality
     */
    private setupFileDropHandlers = (): void => {
        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault();
            this.setState({ dragActive: true });
        };

        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();
            this.setState({ dragActive: false });
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            this.setState({ dragActive: false });
            
            const files = Array.from(e.dataTransfer?.files || []);
            files.forEach(file => this.addFileContext(file));
        };

        if (this.fileDropRef.current) {
            const element = this.fileDropRef.current;
            element.addEventListener('dragenter', handleDragEnter);
            element.addEventListener('dragleave', handleDragLeave);
            element.addEventListener('dragover', handleDragOver);
            element.addEventListener('drop', handleDrop);
        }
    };

    /**
     * Scroll to bottom of messages
     */
    private scrollToBottom = (): void => {
        this.messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    /**
     * Setup keyboard shortcuts
     */
    private setupKeyboardShortcuts = (): void => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.handleNewSession();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.handleExportSession();
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyPress);
    };

    /**
     * Render notifications
     */
    private renderNotifications = (): JSX.Element => {
        const { notifications } = this.state;
        
        if (notifications.length === 0) return <></>;
        
        return (
            <div className="notifications">
                {notifications.map((notification, index) => (
                    <div key={index} className={`notification ${notification.type}`}>
                        <span className="notification-icon">
                            {notification.type === 'success' ? '✅' : 
                             notification.type === 'error' ? '❌' : 'ℹ️'}
                        </span>
                        <span className="notification-message">{notification.message}</span>
                        <button 
                            className="notification-close"
                            onClick={() => this.dismissNotification(index)}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    /**
     * Handle session export
     */
    private handleExportSession = (): void => {
        const { currentSession } = this.state;
        const exportData = {
            session: currentSession,
            exportedAt: new Date(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-session-${currentSession.id}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Session exported successfully', 'success');
    };

    /**
     * Handle new session creation
     */
    private handleNewSession = (): void => {
        this.setState({
            currentSession: this.createNewSession(),
            inputValue: '',
            fileContexts: [],
            selectedModel: null
        });
        this.showNotification('New session created', 'success');
    };

    /**
     * Handle adding file context
     */
    private handleAddFileContext = (): void => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.h,.css,.html,.json,.md';
        
        input.onchange = (e) => {
            const files = Array.from((e.target as HTMLInputElement).files || []);
            files.forEach(file => this.addFileContext(file));
        };
        
        input.click();
    };

    /**
     * Handle clearing all contexts
     */
    private handleClearContexts = (): void => {
        this.setState({ fileContexts: [] });
        this.showNotification('All file contexts cleared', 'info');
    };

    /**
     * Handle highlighting context in editor
     */
    private handleHighlightContext = (context: FileContext): void => {
        // In production, this would highlight the file in VS Code editor
        vscode.window.showTextDocument(vscode.Uri.file(context.path));
        this.showNotification(`Opened ${context.name} in editor`, 'success');
    };

    /**
     * Handle removing context
     */
    private handleRemoveContext = (context: FileContext): void => {
        this.setState(prevState => ({
            fileContexts: prevState.fileContexts.filter(fc => fc.id !== context.id)
        }));
        this.showNotification(`Removed ${context.name} from context`, 'info');
    };

    /**
     * Get message avatar
     */
    private getMessageAvatar = (message: ChatMessage): string => {
        switch (message.role) {
            case 'user':
                return message.author?.avatar || '👤';
            case 'assistant':
                return '🤖';
            case 'system':
                return '⚙️';
            default:
                return '❓';
        }
    };

    /**
     * Get message author name
     */
    private getMessageAuthor = (message: ChatMessage): string => {
        switch (message.role) {
            case 'user':
                return message.author?.name || 'You';
            case 'assistant':
                return message.model?.name || 'AI Assistant';
            case 'system':
                return 'System';
            default:
                return 'Unknown';
        }
    };

    /**
     * Render message content with markdown support
     */
    private renderMessageContent = (message: ChatMessage): JSX.Element => {
        // In production, this would use a proper markdown renderer
        return (
            <div className="message-text">
                {message.content.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </div>
        );
    };

    /**
     * Render message attachment
     */
    private renderAttachment = (attachment: MessageAttachment): JSX.Element => {
        return (
            <div key={attachment.id} className="message-attachment">
                <div className="attachment-header">
                    <span className="attachment-type">{attachment.type}</span>
                    <span className="attachment-name">{attachment.name}</span>
                    {attachment.size && (
                        <span className="attachment-size">
                            {this.formatFileSize(attachment.size)}
                        </span>
                    )}
                </div>
                
                {attachment.preview && (
                    <div className="attachment-preview">
                        {attachment.type === 'image' ? (
                            <img src={attachment.preview} alt={attachment.name} />
                        ) : (
                            <pre><code>{attachment.preview}</code></pre>
                        )}
                    </div>
                )}
            </div>
        );
    };

    /**
     * Render message actions
     */
    private renderMessageActions = (message: ChatMessage): JSX.Element => {
        return (
            <div className="message-actions">
                <button 
                    className="action-btn"
                    onClick={() => this.copyMessage(message)}
                    title="Copy message"
                >
                    📋
                </button>
                
                <button 
                    className="action-btn"
                    onClick={() => this.addReaction(message, '👍')}
                    title="Like"
                >
                    👍
                </button>
                
                <button 
                    className="action-btn"
                    onClick={() => this.shareMessage(message)}
                    title="Share"
                >
                    🔗
                </button>
                
                {message.role === 'assistant' && (
                    <button 
                        className="action-btn"
                        onClick={() => this.regenerateResponse(message)}
                        title="Regenerate"
                    >
                        🔄
                    </button>
                )}
            </div>
        );
    };

    /**
     * Render message reaction
     */
    private renderReaction = (reaction: MessageReaction, message: ChatMessage): JSX.Element => {
        return (
            <button 
                key={reaction.emoji}
                className="reaction-btn"
                onClick={() => this.toggleReaction(message, reaction.emoji)}
            >
                {reaction.emoji} {reaction.count}
            </button>
        );
    };

    /**
     * Handle jumping to code location
     */
    private handleJumpToCode = (highlight: CodeHighlight): void => {
        vscode.window.showTextDocument(
            vscode.Uri.file(highlight.fileName),
            { selection: new vscode.Range(highlight.startLine - 1, 0, highlight.endLine - 1, 0) }
        );
        this.showNotification(`Jumped to ${highlight.fileName}:${highlight.startLine}`, 'success');
    };

    /**
     * Handle input change
     */
    private handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        this.setState({ inputValue: e.target.value });
        
        // Auto-resize textarea
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    };

    /**
     * Handle key down in input
     */
    private handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSendMessage();
        }
    };

    /**
     * Handle file attachment
     */
    private handleAttachFile = (): void => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        
        input.onchange = (e) => {
            const files = Array.from((e.target as HTMLInputElement).files || []);
            files.forEach(file => this.attachFileToMessage(file));
        };
        
        input.click();
    };

    /**
     * Handle inserting code snippet
     */
    private handleInsertCodeSnippet = (): void => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
            
            if (selectedText) {
                const snippet = `\`\`\`${editor.document.languageId}\n${selectedText}\n\`\`\``;
                this.setState(prevState => ({
                    inputValue: prevState.inputValue + '\n' + snippet
                }));
                this.showNotification('Code snippet inserted', 'success');
            } else {
                this.showNotification('No text selected in editor', 'info');
            }
        }
    };

    /**
     * Handle voice input
     */
    private handleVoiceInput = (): void => {
        this.showNotification('Voice input not yet implemented', 'info');
        // In production, this would integrate with Web Speech API
    };

    /**
     * Render input status
     */
    private renderInputStatus = (): JSX.Element => {
        const { inputValue, selectedModel, isProcessing } = this.state;
        
        if (isProcessing) {
            return (
                <div className="input-status processing">
                    ⏳ AI is thinking...
                </div>
            );
        }
        
        if (!selectedModel) {
            return (
                <div className="input-status warning">
                    ⚠️ Please select an AI model first
                </div>
            );
        }
        
        if (inputValue.length > 1000) {
            return (
                <div className="input-status warning">
                    ⚠️ Message is quite long ({inputValue.length} characters)
                </div>
            );
        }
        
        return (
            <div className="input-status ready">
                ✅ Ready to send • {selectedModel.name}
            </div>
        );
    };

    /**
     * Handle creating share link
     */
    private handleCreateShareLink = (): void => {
        const shareUrl = `https://aura-ide.com/chat/share/${this.state.currentSession.id}`;
        
        this.setState(prevState => ({
            currentSession: {
                ...prevState.currentSession,
                shareUrl,
                isCollaborative: true
            }
        }));
        
        navigator.clipboard.writeText(shareUrl);
        this.showNotification('Share link copied to clipboard', 'success');
    };

    // Utility methods

    private addFileContext = async (file: File): Promise<void> => {
        try {
            const content = await this.readFileContent(file);
            const context: FileContext = {
                id: this.generateId(),
                name: file.name,
                path: file.name, // In production, this would be the actual file path
                content,
                language: this.detectLanguage(file.name),
                size: file.size,
                addedAt: new Date(),
                highlighted: false
            };
            
            this.setState(prevState => ({
                fileContexts: [...prevState.fileContexts, context]
            }));
            
            this.showNotification(`Added ${file.name} to context`, 'success');
        } catch (error) {
            this.showNotification(`Failed to add ${file.name}`, 'error');
        }
    };

    private readFileContent = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    };

    private detectLanguage = (fileName: string): string => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        const languageMap: { [key: string]: string } = {
            'js': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'jsx': 'javascript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'h': 'c',
            'css': 'css',
            'html': 'html',
            'json': 'json',
            'md': 'markdown'
        };
        return languageMap[extension || ''] || 'text';
    };

    private formatFileSize = (bytes: number): string => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    private showNotification = (message: string, type: 'success' | 'error' | 'info'): void => {
        const notification = { message, type };
        this.setState(prevState => ({
            notifications: [...prevState.notifications, notification]
        }));
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            this.dismissNotification(this.state.notifications.length - 1);
        }, 3000);
    };

    private dismissNotification = (index: number): void => {
        this.setState(prevState => ({
            notifications: prevState.notifications.filter((_, i) => i !== index)
        }));
    };

    private copyMessage = (message: ChatMessage): void => {
        navigator.clipboard.writeText(message.content);
        this.showNotification('Message copied to clipboard', 'success');
    };

    private addReaction = (message: ChatMessage, emoji: string): void => {
        // In production, this would update the message reactions
        this.showNotification(`Added ${emoji} reaction`, 'success');
    };

    private shareMessage = (message: ChatMessage): void => {
        const shareText = `${message.content}\n\n- Shared from Aura IDE`;
        navigator.clipboard.writeText(shareText);
        this.showNotification('Message shared to clipboard', 'success');
    };

    private regenerateResponse = (message: ChatMessage): void => {
        // In production, this would regenerate the AI response
        this.showNotification('Response regeneration not yet implemented', 'info');
    };

    private toggleReaction = (message: ChatMessage, emoji: string): void => {
        // In production, this would toggle the reaction
        this.showNotification(`Toggled ${emoji} reaction`, 'success');
    };

    private attachFileToMessage = (file: File): void => {
        // In production, this would attach the file to the current message
        this.showNotification(`Attached ${file.name}`, 'success');
    };

    // Additional methods would be implemented here...
}

interface AIChatPanelProps {
    extensionContext: vscode.ExtensionContext;
}

interface AIChatPanelState {
    currentSession: ChatSession;
    availableModels: AIModel[];
    selectedModel: AIModel | null;
    inputValue: string;
    fileContexts: FileContext[];
    isProcessing: boolean;
    showModelSelector: boolean;
    showCollaborationPanel: boolean;
    dragActive: boolean;
    theme: string;
    notifications: any[];
} 