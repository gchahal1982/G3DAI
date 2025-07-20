import * as vscode from 'vscode';

/**
 * Floating AI Assistant - Contextual AI chat that appears based on cursor location
 * Provides natural language to code conversion with voice input support
 */
export class FloatingAIAssistant {
    private panel: vscode.WebviewPanel | undefined;
    private context: vscode.ExtensionContext;
    private currentPosition: vscode.Position | undefined;
    private isVisible: boolean = false;
    private conversationHistory: ChatMessage[] = [];

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        // Show assistant on cursor position change (with debounce)
        vscode.window.onDidChangeTextEditorSelection(this.onSelectionChange.bind(this));
        
        // Hide assistant when changing editors
        vscode.window.onDidChangeActiveTextEditor(() => {
            if (this.isVisible) {
                this.hide();
            }
        });

        // Command to toggle assistant
        vscode.commands.registerCommand('aura.ai.toggleFloatingAssistant', () => {
            this.toggle();
        });

        // Command to show assistant at current position
        vscode.commands.registerCommand('aura.ai.showAssistantHere', () => {
            this.showAtCurrentPosition();
        });
    }

    private debounceTimer: NodeJS.Timeout | undefined;
    private onSelectionChange(event: vscode.TextEditorSelectionChangeEvent) {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            const editor = event.textEditor;
            const selection = event.selections[0];
            
            // Show assistant for complex code contexts
            if (this.shouldShowAssistant(editor, selection)) {
                this.showAtPosition(selection.active);
            }
        }, 1000);
    }

    private shouldShowAssistant(editor: vscode.TextEditor, selection: vscode.Selection): boolean {
        const document = editor.document;
        const line = document.lineAt(selection.active.line);
        const text = line.text.trim();

        // Show for empty lines in functions, classes, or after comments
        if (text === '' && selection.active.line > 0) {
            const previousLine = document.lineAt(selection.active.line - 1).text;
            return (
                previousLine.includes('function') ||
                previousLine.includes('class') ||
                previousLine.includes('//') ||
                previousLine.includes('TODO') ||
                previousLine.includes('FIXME')
            );
        }

        return false;
    }

    public showAtCurrentPosition() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            this.showAtPosition(editor.selection.active);
        }
    }

    public showAtPosition(position: vscode.Position) {
        this.currentPosition = position;
        if (!this.panel) {
            this.createPanel();
        }
        this.panel!.reveal();
        this.isVisible = true;
        this.updateContext();
    }

    public hide() {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
        this.isVisible = false;
    }

    public toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.showAtCurrentPosition();
        }
    }

    private createPanel() {
        this.panel = vscode.window.createWebviewPanel(
            'auraFloatingAssistant',
            'AI Assistant',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'webviews')
                ]
            }
        );

        this.panel.webview.html = this.getWebviewContent();
        this.panel.onDidDispose(() => {
            this.panel = undefined;
            this.isVisible = false;
        });

        // Handle messages from webview
        this.panel.webview.onDidReceiveMessage(this.handleWebviewMessage.bind(this));
    }

    private getWebviewContent(): string {
        const cssPath = vscode.Uri.joinPath(this.context.extensionUri, 'webviews', 'chat', 'assistant.css');
        const cssUri = this.panel!.webview.asWebviewUri(cssPath);
        
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aura AI Assistant</title>
    <link href="${cssUri}" rel="stylesheet">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 16px;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            min-height: 100vh;
        }
        
        .assistant-container {
            max-width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .chat-header {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid var(--vscode-panel-border);
            margin-bottom: 16px;
        }
        
        .chat-header h3 {
            margin: 0;
            color: var(--vscode-foreground);
        }
        
        .context-info {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }
        
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 8px 0;
            min-height: 200px;
            max-height: 400px;
        }
        
        .message {
            margin-bottom: 12px;
            padding: 8px 12px;
            border-radius: 8px;
        }
        
        .message.user {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            margin-left: 20%;
        }
        
        .message.assistant {
            background: var(--vscode-editor-selectionBackground);
            border: 1px solid var(--vscode-panel-border);
        }
        
        .message-content {
            line-height: 1.4;
        }
        
        .code-preview {
            background: var(--vscode-textCodeBlock-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            margin: 8px 0;
            overflow: hidden;
        }
        
        .code-actions {
            background: var(--vscode-editorGroupHeader-tabsBackground);
            border-bottom: 1px solid var(--vscode-panel-border);
            padding: 4px 8px;
            display: flex;
            gap: 8px;
        }
        
        .code-action-btn {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 11px;
            cursor: pointer;
        }
        
        .code-action-btn:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        
        .chat-input-container {
            display: flex;
            gap: 8px;
            margin-top: 16px;
            padding-top: 12px;
            border-top: 1px solid var(--vscode-panel-border);
        }
        
        .chat-input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-family: inherit;
            outline: none;
        }
        
        .chat-input:focus {
            border-color: var(--vscode-focusBorder);
        }
        
        .send-button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .send-button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        
        .quick-actions {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
            flex-wrap: wrap;
        }
        
        .quick-action-btn {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
        }
        
        .quick-action-btn:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
    </style>
</head>
<body>
    <div class="assistant-container">
        <div class="chat-header">
            <div>
                <h3>🤖 Aura AI Assistant</h3>
                <div class="context-info" id="contextInfo">Ready to help with your code</div>
            </div>
        </div>
        
        <div class="quick-actions">
            <button class="quick-action-btn" onclick="sendQuickMessage('Explain this code')">Explain Code</button>
            <button class="quick-action-btn" onclick="sendQuickMessage('Add comments')">Add Comments</button>
            <button class="quick-action-btn" onclick="sendQuickMessage('Refactor this')">Refactor</button>
            <button class="quick-action-btn" onclick="sendQuickMessage('Find bugs')">Find Bugs</button>
        </div>
        
        <div class="chat-messages" id="chatMessages">
            <div class="message assistant">
                <div class="message-content">
                    Hello! I'm your AI coding assistant. I can help you understand, improve, and write code based on your current cursor position.
                </div>
            </div>
        </div>
        
        <div class="chat-input-container">
            <input type="text" class="chat-input" id="chatInput" placeholder="Ask me anything about your code...">
            <button class="send-button" onclick="sendMessage()">Send</button>
        </div>
    </div>
</body>
</html>`;

        const script = `
            const vscode = acquireVsCodeApi();
            
            function sendMessage() {
                const input = document.getElementById('chatInput');
                const message = input.value.trim();
                
                if (!message) return;
                
                addMessage(message, 'user');
                input.value = '';
                
                vscode.postMessage({
                    type: 'sendMessage',
                    message: message
                });
            }
            
            function sendQuickMessage(message) {
                document.getElementById('chatInput').value = message;
                sendMessage();
            }
            
            function addMessage(content, sender) {
                const messagesContainer = document.getElementById('chatMessages');
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message ' + sender;
                
                const codeBlockPattern = /\`\`\`([\\s\\S]*?)\`\`\`/g;
                
                if (sender === 'assistant' && codeBlockPattern.test(content)) {
                    let html = content.replace(codeBlockPattern, function(match, code) {
                        return '<div class="code-preview">' +
                            '<div class="code-actions">' +
                            '<button class="code-action-btn" onclick="copyCode(this)">Copy</button>' +
                            '<button class="code-action-btn" onclick="insertCode(this)">Insert</button>' +
                            '</div><pre>' + code + '</pre></div>';
                    });
                    
                    messageDiv.innerHTML = '<div class="message-content">' + html + '</div>';
                } else {
                    messageDiv.innerHTML = '<div class="message-content">' + content + '</div>';
                }
                
                messagesContainer.appendChild(messageDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
            
            function copyCode(button) {
                const codeBlock = button.closest('.code-preview').querySelector('pre');
                const code = codeBlock.textContent;
                
                navigator.clipboard.writeText(code).then(() => {
                    button.textContent = 'Copied!';
                    setTimeout(() => {
                        button.textContent = 'Copy';
                    }, 2000);
                });
            }
            
            function insertCode(button) {
                const codeBlock = button.closest('.code-preview').querySelector('pre');
                const code = codeBlock.textContent;
                
                vscode.postMessage({
                    type: 'insertCode',
                    code: code
                });
                
                button.textContent = 'Inserted!';
                setTimeout(() => {
                    button.textContent = 'Insert';
                }, 2000);
            }
            
            document.getElementById('chatInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
            
            window.addEventListener('message', event => {
                const message = event.data;
                
                switch (message.type) {
                    case 'addMessage':
                        addMessage(message.content, 'assistant');
                        break;
                    case 'updateContext':
                        document.getElementById('contextInfo').textContent = message.context;
                        break;
                }
            });
        `;

        return html.replace('</body>', `<script>${script}</script></body>`);
    }

    private async handleWebviewMessage(message: any) {
        switch (message.type) {
            case 'sendMessage':
                await this.processUserMessage(message.message);
                break;
            case 'insertCode':
                await this.insertCodeAtPosition(message.code);
                break;
        }
    }

    private async processUserMessage(userMessage: string) {
        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        });

        // Get current context
        const context = await this.getCurrentContext();
        
        // Send to AI provider (this would integrate with the AI engine)
        const response = await this.generateResponse(userMessage, context);
        
        // Add AI response to history
        this.conversationHistory.push({
            role: 'assistant',
            content: response,
            timestamp: new Date()
        });

        // Send response to webview
        this.panel?.webview.postMessage({
            type: 'addMessage',
            content: response
        });
    }

    private async getCurrentContext(): Promise<string> {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !this.currentPosition) {
            return 'No active editor context';
        }

        const document = editor.document;
        const line = this.currentPosition.line;
        
        // Get surrounding context (10 lines before and after)
        const startLine = Math.max(0, line - 10);
        const endLine = Math.min(document.lineCount - 1, line + 10);
        
        const contextRange = new vscode.Range(startLine, 0, endLine, 0);
        const contextText = document.getText(contextRange);
        
        return `File: ${document.fileName}
Language: ${document.languageId}
Current line: ${line + 1}
Context:
\`\`\`${document.languageId}
${contextText}
\`\`\``;
    }

    private async generateResponse(userMessage: string, context: string): Promise<string> {
        // This would integrate with the AI engine
        // For now, return a mock response
        
        if (userMessage.toLowerCase().includes('explain')) {
            return `I can see you're asking about the code at line ${(this.currentPosition?.line || 0) + 1}. Here's what this code does:

\`\`\`typescript
// This is a sample explanation
// The code appears to be handling user input
\`\`\`

Would you like me to add comments or suggest improvements?`;
        }
        
        if (userMessage.toLowerCase().includes('refactor')) {
            return `Here's a refactored version of your code:

\`\`\`typescript
// Refactored code with better practices
function improvedFunction() {
    // Implementation here
    return result;
}
\`\`\`

This version improves readability and follows best practices.`;
        }
        
        return `I understand you want help with: "${userMessage}"

Based on your current context, here are some suggestions:
• Consider adding error handling
• Add type annotations for better type safety
• Include unit tests for this functionality

Would you like me to implement any of these suggestions?`;
    }

    private async insertCodeAtPosition(code: string) {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !this.currentPosition) {
            return;
        }

        await editor.edit(editBuilder => {
            editBuilder.insert(this.currentPosition!, code);
        });

        // Move cursor to end of inserted code
        const newPosition = this.currentPosition.translate(0, code.length);
        editor.selection = new vscode.Selection(newPosition, newPosition);
    }

    private updateContext() {
        if (!this.panel) return;

        this.getCurrentContext().then(context => {
            this.panel!.webview.postMessage({
                type: 'updateContext',
                context: `Context updated: ${context.split('\n')[0]}`
            });
        });
    }

    dispose() {
        this.hide();
    }
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
} 