import * as vscode from 'vscode';

// Revolutionary AI Personas
interface RevolutionaryPersona {
    id: string;
    name: string;
    description: string;
    icon: string;
    style: string;
    examples: string[];
}

const REVOLUTIONARY_PERSONAS: RevolutionaryPersona[] = [
    {
        id: 'ultra-concise',
        name: '⚡ Ultra-Concise Expert',
        description: 'Claude Code-style minimal responses, maximum efficiency',
        icon: '⚡',
        style: 'Answer in <4 lines. No preambles. Direct solutions only.',
        examples: ['Fixed. Try now.', 'Use async/await.', 'Memory leak in line 42.', 'Import missing.']
    },
    {
        id: 'security-specialist',
        name: '🔐 Security Specialist',
        description: 'Security-first approach, threat detection, sandbox-aware',
        icon: '🔐',
        style: 'Security expert. Malicious code detection enabled.',
        examples: ['✅ SECURE: No threats detected.', '🚨 CRITICAL: eval() detected - refusing request.']
    },
    {
        id: 'mentor',
        name: '👨‍🏫 AI Mentor',
        description: 'Teaching approach, best practices, learning context',
        icon: '👨‍🏫',
        style: 'Teaching approach with best practices and explanations.',
        examples: ['Great question! Let me explain step by step...', 'The best practice here would be...']
    },
    {
        id: 'debug-specialist',
        name: '🔧 Debug Specialist',
        description: 'Decision tree debugging, root cause analysis',
        icon: '🔧',
        style: 'Debug specialist with decision tree analysis.',
        examples: ['🔧 Root cause: Variable scope issue in line 42.', 'Debug tree: Check imports → Verify types.']
    },
    {
        id: 'expert',
        name: '🧠 Technical Expert',
        description: 'Advanced patterns, assumes deep knowledge, minimal explanations',
        icon: '🧠',
        style: 'Advanced patterns for experts. Minimal explanations.',
        examples: ['Optimize with lazy loading pattern.', 'Use Dependency Injection pattern.']
    },
    {
        id: 'collaborative-partner',
        name: '🤝 Collaborative Partner',
        description: 'Interactive problem-solving, asks clarifying questions',
        icon: '🤝',
        style: 'Collaborative approach with interactive guidance.',
        examples: ['I see what you\'re trying to do. Let\'s explore...', 'Have you considered the trade-offs?']
    }
];

let currentPersona = REVOLUTIONARY_PERSONAS[0];

// Security Validation System
class SecurityValidator {
    private static readonly THREAT_PATTERNS = [
        { pattern: /eval\s*\(/gi, level: 'critical', description: 'Code execution detected' },
        { pattern: /exec\s*\(/gi, level: 'critical', description: 'Command execution detected' },
        { pattern: /document\.cookie/gi, level: 'high', description: 'Cookie access detected' },
        { pattern: /localStorage\.setItem.*password/gi, level: 'high', description: 'Credential storage detected' },
        { pattern: /\.\.\/\.\.\//gi, level: 'high', description: 'Directory traversal detected' },
        { pattern: /keylogger|backdoor|malware/gi, level: 'critical', description: 'Malicious software patterns' },
        { pattern: /rm\s+-rf/gi, level: 'critical', description: 'Destructive file operation' }
    ];

    static validateCode(code: string): { safe: boolean; threats: any[]; riskLevel: string } {
        const threats = [];
        let highestRisk = 'low';

        for (const threat of this.THREAT_PATTERNS) {
            if (threat.pattern.test(code)) {
                threats.push({
                    pattern: threat.pattern.source,
                    level: threat.level,
                    description: threat.description
                });
                
                if (threat.level === 'critical') {
                    highestRisk = 'critical';
                } else if (threat.level === 'high' && highestRisk !== 'critical') {
                    highestRisk = 'high';
                }
            }
        }

        return {
            safe: threats.length === 0,
            threats,
            riskLevel: highestRisk
        };
    }
}

// Memory System
class AuraMemorySystem {
    private static context: vscode.ExtensionContext;
    
    static initialize(context: vscode.ExtensionContext) {
        this.context = context;
    }

    static getUserProfile() {
        return this.context.globalState.get('aura.userProfile', {
            preferredPersona: 'ultra-concise',
            technicalLevel: 'intermediate',
            communicationStyle: 'collaborative',
            satisfactionScore: 0.8,
            interactionCount: 0
        });
    }

    static updateUserProfile(updates: any) {
        const current = this.getUserProfile();
        const updated = { ...current, ...updates };
        this.context.globalState.update('aura.userProfile', updated);
    }

    static getMemoryStats() {
        const profile = this.getUserProfile();
        return {
            interactionCount: profile.interactionCount || 0,
            satisfactionScore: profile.satisfactionScore || 0.8,
            preferredPersona: profile.preferredPersona || 'ultra-concise',
            memorySize: JSON.stringify(this.context.globalState.keys()).length
        };
    }
}

// Revolutionary Chat Provider
class RevolutionaryChatProvider implements vscode.TreeDataProvider<ChatItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<ChatItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private messages: ChatItem[] = [
        new ChatItem('🚀 Revolutionary AI Chat Active', vscode.TreeItemCollapsibleState.None, 'system'),
        new ChatItem(`Current Persona: ${currentPersona.name}`, vscode.TreeItemCollapsibleState.None, 'info'),
        new ChatItem('Type Cmd+Shift+A to open chat', vscode.TreeItemCollapsibleState.None, 'command')
    ];

    getTreeItem(element: ChatItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ChatItem): Thenable<ChatItem[]> {
        if (!element) {
            return Promise.resolve(this.messages);
        }
        return Promise.resolve([]);
    }

    addMessage(message: string, type: string = 'user') {
        this.messages.push(new ChatItem(message, vscode.TreeItemCollapsibleState.None, type));
        this._onDidChangeTreeData.fire();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

class ChatItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type: string
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}`;
        
        switch(type) {
            case 'system':
                this.iconPath = new vscode.ThemeIcon('rocket');
                break;
            case 'user':
                this.iconPath = new vscode.ThemeIcon('person');
                break;
            case 'assistant':
                this.iconPath = new vscode.ThemeIcon('robot');
                break;
            case 'security':
                this.iconPath = new vscode.ThemeIcon('shield');
                break;
            default:
                this.iconPath = new vscode.ThemeIcon('comment');
        }
    }
}

// Persona Provider
class PersonaProvider implements vscode.TreeDataProvider<PersonaItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<PersonaItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    getTreeItem(element: PersonaItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: PersonaItem): Thenable<PersonaItem[]> {
        if (!element) {
            return Promise.resolve(REVOLUTIONARY_PERSONAS.map(persona => 
                new PersonaItem(persona, persona.id === currentPersona.id)
            ));
        }
        return Promise.resolve([]);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

class PersonaItem extends vscode.TreeItem {
    constructor(
        public readonly persona: RevolutionaryPersona,
        public readonly isActive: boolean
    ) {
        super(`${persona.icon} ${persona.name}`, vscode.TreeItemCollapsibleState.None);
        this.tooltip = persona.description;
        this.description = isActive ? '(Active)' : '';
        this.iconPath = new vscode.ThemeIcon(isActive ? 'star-full' : 'star-empty');
        this.command = {
            command: 'aura.selectPersona',
            title: 'Select Persona',
            arguments: [persona]
        };
    }
}

// Security Monitor Provider
class SecurityProvider implements vscode.TreeDataProvider<SecurityItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<SecurityItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private securityStatus = {
        mode: 'adaptive',
        threatsDetected: 0,
        lastScan: new Date(),
        riskLevel: 'low'
    };

    getTreeItem(element: SecurityItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: SecurityItem): Thenable<SecurityItem[]> {
        if (!element) {
            return Promise.resolve([
                new SecurityItem('🔐 Security Status', `Mode: ${this.securityStatus.mode}`, 'shield'),
                new SecurityItem('📊 Threat Level', `Risk: ${this.securityStatus.riskLevel}`, 'warning'),
                new SecurityItem('🔍 Threats Detected', `Count: ${this.securityStatus.threatsDetected}`, 'bug'),
                new SecurityItem('⏰ Last Scan', this.securityStatus.lastScan.toLocaleTimeString(), 'clock')
            ]);
        }
        return Promise.resolve([]);
    }

    updateSecurityStatus(status: any) {
        this.securityStatus = { ...this.securityStatus, ...status };
        this._onDidChangeTreeData.fire();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

class SecurityItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string,
        iconName: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `${this.label}: ${this.description}`;
        this.iconPath = new vscode.ThemeIcon(iconName);
    }
}

// Main Extension Activation
export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Aura Revolutionary Demo is now active!');

    // Initialize Memory System
    AuraMemorySystem.initialize(context);

    // Create Providers
    const chatProvider = new RevolutionaryChatProvider();
    const personaProvider = new PersonaProvider();
    const securityProvider = new SecurityProvider();

    // Register Tree Views
    vscode.window.createTreeView('auraRevolutionaryChat', { treeDataProvider: chatProvider });
    vscode.window.createTreeView('auraPersonas', { treeDataProvider: personaProvider });
    vscode.window.createTreeView('auraSecurity', { treeDataProvider: securityProvider });

    // Register Commands
    context.subscriptions.push(
        vscode.commands.registerCommand('aura.openRevolutionaryChat', async () => {
            const panel = vscode.window.createWebviewPanel(
                'auraChat',
                '🚀 Revolutionary AI Chat',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            panel.webview.html = getRevolutionaryWebviewContent();
            
            // Handle messages from webview
            panel.webview.onDidReceiveMessage(async (message) => {
                switch (message.command) {
                    case 'sendMessage':
                        const userMessage = message.text;
                        
                        // Security validation
                        const securityCheck = SecurityValidator.validateCode(userMessage);
                        if (!securityCheck.safe) {
                            securityProvider.updateSecurityStatus({
                                threatsDetected: securityCheck.threats.length,
                                riskLevel: securityCheck.riskLevel,
                                lastScan: new Date()
                            });
                            
                            panel.webview.postMessage({
                                command: 'addMessage',
                                role: 'system',
                                content: `🚨 SECURITY WARNING: ${securityCheck.threats[0].description} detected!`,
                                security: securityCheck
                            });
                            return;
                        }

                        // Add user message
                        panel.webview.postMessage({
                            command: 'addMessage',
                            role: 'user',
                            content: userMessage
                        });

                        // Simulate AI response based on persona
                        setTimeout(() => {
                            const response = getPersonaResponse(currentPersona, userMessage);
                            panel.webview.postMessage({
                                command: 'addMessage',
                                role: 'assistant',
                                content: response,
                                persona: currentPersona
                            });
                        }, 500 + Math.random() * 1000);

                        // Update memory
                        const profile = AuraMemorySystem.getUserProfile();
                        AuraMemorySystem.updateUserProfile({
                            interactionCount: profile.interactionCount + 1
                        });
                        
                        break;
                        
                    case 'switchPersona':
                        const persona = REVOLUTIONARY_PERSONAS.find(p => p.id === message.personaId);
                        if (persona) {
                            currentPersona = persona;
                            personaProvider.refresh();
                            panel.webview.postMessage({
                                command: 'addMessage',
                                role: 'system',
                                content: `Switched to ${persona.name} mode. ${persona.style}`
                            });
                        }
                        break;
                }
            });

            chatProvider.addMessage('🤖 Revolutionary AI Chat opened', 'system');
        }),

        vscode.commands.registerCommand('aura.selectPersona', (persona: RevolutionaryPersona) => {
            currentPersona = persona;
            personaProvider.refresh();
            chatProvider.addMessage(`Switched to ${persona.name}`, 'system');
            AuraMemorySystem.updateUserProfile({ preferredPersona: persona.id });
            vscode.window.showInformationMessage(`Switched to ${persona.name} mode!`);
        }),

        vscode.commands.registerCommand('aura.validateSecurity', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor found');
                return;
            }

            const code = editor.document.getText();
            const securityCheck = SecurityValidator.validateCode(code);
            
            securityProvider.updateSecurityStatus({
                threatsDetected: securityCheck.threats.length,
                riskLevel: securityCheck.riskLevel,
                lastScan: new Date()
            });

            if (securityCheck.safe) {
                vscode.window.showInformationMessage('✅ Security scan complete - No threats detected');
            } else {
                const message = `🚨 Security threats detected: ${securityCheck.threats.map(t => t.description).join(', ')}`;
                vscode.window.showWarningMessage(message);
            }
        }),

        vscode.commands.registerCommand('aura.showMemory', () => {
            const stats = AuraMemorySystem.getMemoryStats();
            const profile = AuraMemorySystem.getUserProfile();
            
            vscode.window.showInformationMessage(
                `🧠 Memory Stats: ${stats.interactionCount} interactions, ` +
                `${(stats.satisfactionScore * 100).toFixed(1)}% satisfaction, ` +
                `Persona: ${profile.preferredPersona}`
            );
        }),

        vscode.commands.registerCommand('aura.performanceMetrics', () => {
            const stats = AuraMemorySystem.getMemoryStats();
            vscode.window.showInformationMessage(
                `📊 Performance: Memory Size: ${(stats.memorySize / 1024).toFixed(2)}KB, ` +
                `Interactions: ${stats.interactionCount}, ` +
                `Satisfaction: ${(stats.satisfactionScore * 100).toFixed(1)}%`
            );
        })
    );

    // Show welcome message
    vscode.window.showInformationMessage(
        '🚀 Aura Revolutionary Demo loaded! Use Cmd+Shift+A to open AI chat.',
        'Open Chat', 'View Personas'
    ).then(selection => {
        if (selection === 'Open Chat') {
            vscode.commands.executeCommand('aura.openRevolutionaryChat');
        } else if (selection === 'View Personas') {
            vscode.commands.executeCommand('workbench.view.explorer');
        }
    });
}

function getPersonaResponse(persona: RevolutionaryPersona, userMessage: string): string {
    const responses = persona.examples;
    return responses[Math.floor(Math.random() * responses.length)];
}

function getRevolutionaryWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Revolutionary AI Chat</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            margin: 0;
            padding: 20px;
        }
        .chat-container {
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        .messages {
            min-height: 400px;
            max-height: 500px;
            overflow-y: auto;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            background: var(--vscode-panel-background);
        }
        .message {
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 8px;
            animation: fadeIn 0.3s ease;
        }
        .message.user {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            margin-left: 20%;
        }
        .message.assistant {
            background: var(--vscode-input-background);
            border-left: 3px solid var(--vscode-focusBorder);
        }
        .message.system {
            background: var(--vscode-inputValidation-warningBackground);
            text-align: center;
            font-style: italic;
        }
        .persona-badge {
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            margin-bottom: 5px;
            display: inline-block;
        }
        .input-container {
            display: flex;
            gap: 10px;
        }
        .input-field {
            flex: 1;
            padding: 10px;
            border: 1px solid var(--vscode-input-border);
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            font-family: inherit;
        }
        .send-button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
        }
        .send-button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .personas {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 15px;
        }
        .persona-btn {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            padding: 6px 12px;
            border-radius: 16px;
            cursor: pointer;
            font-size: 12px;
        }
        .persona-btn:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="header">
            <h2>🚀 Aura Revolutionary AI Chat</h2>
            <p>Experience the revolutionary prompt engineering with 6 specialized personas</p>
        </div>
        
        <div class="personas">
            <button class="persona-btn" onclick="switchPersona('ultra-concise')">⚡ Ultra-Concise</button>
            <button class="persona-btn" onclick="switchPersona('security-specialist')">🔐 Security</button>
            <button class="persona-btn" onclick="switchPersona('mentor')">👨‍🏫 Mentor</button>
            <button class="persona-btn" onclick="switchPersona('debug-specialist')">🔧 Debug</button>
            <button class="persona-btn" onclick="switchPersona('expert')">🧠 Expert</button>
            <button class="persona-btn" onclick="switchPersona('collaborative-partner')">🤝 Collab</button>
        </div>
        
        <div class="messages" id="messages">
            <div class="message system">
                🚀 Revolutionary AI Chat initialized with Ultra-Concise Expert mode
            </div>
        </div>
        
        <div class="input-container">
            <input type="text" class="input-field" id="messageInput" placeholder="Ask the revolutionary AI assistant..." />
            <button class="send-button" onclick="sendMessage()">🚀 Send</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function addMessage(role, content, persona = null) {
            const messages = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${role}\`;
            
            let html = '';
            if (persona) {
                html += \`<div class="persona-badge">\${persona.icon} \${persona.name}</div>\`;
            }
            html += content;
            
            messageDiv.innerHTML = html;
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }
        
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (!message) return;
            
            vscode.postMessage({
                command: 'sendMessage',
                text: message
            });
            
            input.value = '';
        }
        
        function switchPersona(personaId) {
            vscode.postMessage({
                command: 'switchPersona',
                personaId: personaId
            });
        }
        
        // Handle Enter key
        document.getElementById('messageInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Listen for messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'addMessage') {
                addMessage(message.role, message.content, message.persona);
            }
        });
    </script>
</body>
</html>`;
}

export function deactivate() {
    console.log('🚀 Aura Revolutionary Demo deactivated');
} 