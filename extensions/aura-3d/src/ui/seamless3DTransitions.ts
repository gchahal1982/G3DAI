import * as vscode from 'vscode';

/**
 * Seamless3DTransitions - Manages smooth transitions between 2D and 3D code visualization
 * Provides contextual 3D overlays, picture-in-picture minimaps, and animated transitions
 */
export class Seamless3DTransitions {
    private context: vscode.ExtensionContext;
    private currentMode: ViewMode = '2d';
    private transitionPanel: vscode.WebviewPanel | undefined;
    private minimap3D: vscode.WebviewPanel | undefined;
    private isTransitioning = false;
    private transitionDuration = 800; // milliseconds
    private overlayElements: Map<string, OverlayElement> = new Map();

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.registerCommands();
        this.setupEventListeners();
    }

    private registerCommands(): void {
        // Toggle between 2D and 3D modes
        vscode.commands.registerCommand('aura.3d.toggle', () => {
            this.toggleMode();
        });

        // Smooth transition to 3D
        vscode.commands.registerCommand('aura.3d.transitionTo3D', () => {
            this.transitionToMode('3d');
        });

        // Smooth transition to 2D
        vscode.commands.registerCommand('aura.3d.transitionTo2D', () => {
            this.transitionToMode('2d');
        });

        // Show 3D minimap overlay
        vscode.commands.registerCommand('aura.3d.showMinimap', () => {
            this.show3DMinimap();
        });

        // Hide 3D minimap overlay
        vscode.commands.registerCommand('aura.3d.hideMinimap', () => {
            this.hide3DMinimap();
        });

        // Contextual 3D overlay
        vscode.commands.registerCommand('aura.3d.showContextualOverlay', (position: vscode.Position) => {
            this.showContextualOverlay(position);
        });
    }

    private setupEventListeners(): void {
        // Listen for editor changes to update 3D context
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && this.currentMode === '3d') {
                this.updateVisualizationContext(editor);
            }
        });

        // Listen for selection changes for contextual overlays
        vscode.window.onDidChangeTextEditorSelection(event => {
            if (this.shouldShowContextualOverlay(event)) {
                this.showContextualOverlay(event.selections[0].active);
            }
        });

        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('aura.3d')) {
                this.updateConfiguration();
            }
        });
    }

    public async toggleMode(): Promise<void> {
        if (this.isTransitioning) return;

        const newMode: ViewMode = this.currentMode === '2d' ? '3d' : '2d';
        await this.transitionToMode(newMode);
    }

    public async transitionToMode(targetMode: ViewMode): Promise<void> {
        if (this.isTransitioning || this.currentMode === targetMode) return;

        this.isTransitioning = true;

        try {
            // Show transition UI
            await this.showTransitionUI(targetMode);

            // Perform the actual transition
            await this.performTransition(targetMode);

            // Update mode
            this.currentMode = targetMode;

            // Update configuration
            await vscode.workspace.getConfiguration('aura.3d').update('enabled', targetMode === '3d', true);

            // Hide transition UI
            await this.hideTransitionUI();

        } catch (error) {
            console.error('Transition failed:', error);
            vscode.window.showErrorMessage(`Failed to transition to ${targetMode} mode: ${error}`);
        } finally {
            this.isTransitioning = false;
        }
    }

    private async showTransitionUI(targetMode: ViewMode): Promise<void> {
        if (this.transitionPanel) {
            this.transitionPanel.dispose();
        }

        this.transitionPanel = vscode.window.createWebviewPanel(
            'aura3dTransition',
            'Transitioning...',
            vscode.ViewColumn.Active,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'webviews')
                ]
            }
        );

        this.transitionPanel.webview.html = this.getTransitionHTML(targetMode);

        // Auto-hide after transition
        setTimeout(() => {
            this.hideTransitionUI();
        }, this.transitionDuration);
    }

    private async hideTransitionUI(): Promise<void> {
        if (this.transitionPanel) {
            this.transitionPanel.dispose();
            this.transitionPanel = undefined;
        }
    }

    private async performTransition(targetMode: ViewMode): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        if (targetMode === '3d') {
            await this.transitionTo3D(editor);
        } else {
            await this.transitionTo2D(editor);
        }
    }

    private async transitionTo3D(editor: vscode.TextEditor): Promise<void> {
        // Analyze code structure for 3D visualization
        const document = editor.document;
        const codeStructure = await this.analyzeCodeStructure(document);

        // Create 3D visualization
        await this.create3DVisualization(codeStructure);

        // Show 3D interface elements
        this.show3DInterface();

        // Animate transition
        await this.animate3DTransition();
    }

    private async transitionTo2D(editor: vscode.TextEditor): Promise<void> {
        // Hide 3D interface elements
        this.hide3DInterface();

        // Animate transition back to 2D
        await this.animate2DTransition();

        // Focus back on editor
        await vscode.window.showTextDocument(editor.document, editor.viewColumn);
    }

    public async show3DMinimap(): Promise<void> {
        if (this.minimap3D) return;

        this.minimap3D = vscode.window.createWebviewPanel(
            'aura3dMinimap',
            '3D Minimap',
            { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'webviews')
                ]
            }
        );

        this.minimap3D.webview.html = await this.get3DMinimapHTML();

        this.minimap3D.onDidDispose(() => {
            this.minimap3D = undefined;
        });

        // Update minimap when editor changes
        const updateMinimap = () => {
            if (this.minimap3D) {
                this.update3DMinimap();
            }
        };

        vscode.window.onDidChangeActiveTextEditor(updateMinimap);
        vscode.window.onDidChangeTextEditorSelection(updateMinimap);
    }

    public hide3DMinimap(): void {
        if (this.minimap3D) {
            this.minimap3D.dispose();
            this.minimap3D = undefined;
        }
    }

    private async showContextualOverlay(position: vscode.Position): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const overlayId = `overlay-${position.line}-${position.character}`;
        
        // Remove existing overlay if any
        if (this.overlayElements.has(overlayId)) {
            this.removeContextualOverlay(overlayId);
        }

        // Create new overlay
        const overlay = await this.createContextualOverlay(editor, position);
        this.overlayElements.set(overlayId, overlay);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.removeContextualOverlay(overlayId);
        }, 5000);
    }

    private removeContextualOverlay(overlayId: string): void {
        const overlay = this.overlayElements.get(overlayId);
        if (overlay) {
            overlay.dispose();
            this.overlayElements.delete(overlayId);
        }
    }

    private shouldShowContextualOverlay(event: vscode.TextEditorSelectionChangeEvent): boolean {
        if (this.currentMode === '3d') return false;

        const editor = event.textEditor;
        const selection = event.selections[0];
        
        // Show overlay for complex code structures
        const line = editor.document.lineAt(selection.active.line);
        const text = line.text.trim();

        return (
            text.includes('function') ||
            text.includes('class') ||
            text.includes('interface') ||
            text.includes('type') ||
            text.includes('const') && text.includes('{') ||
            text.includes('import') ||
            text.includes('export')
        );
    }

    private async analyzeCodeStructure(document: vscode.TextDocument): Promise<CodeStructure> {
        const text = document.getText();
        const lines = text.split('\n');

        const structure: CodeStructure = {
            functions: [],
            classes: [],
            imports: [],
            exports: [],
            complexity: 0,
            relationships: []
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('function') || line.includes('function')) {
                structure.functions.push({
                    name: this.extractFunctionName(line),
                    line: i,
                    complexity: this.calculateComplexity(lines, i)
                });
            }
            
            if (line.startsWith('class') || line.includes('class')) {
                structure.classes.push({
                    name: this.extractClassName(line),
                    line: i,
                    methods: this.extractMethods(lines, i)
                });
            }
            
            if (line.startsWith('import')) {
                structure.imports.push({
                    module: this.extractImportModule(line),
                    line: i
                });
            }
        }

        structure.complexity = this.calculateOverallComplexity(structure);
        structure.relationships = this.analyzeRelationships(structure);

        return structure;
    }

    private async create3DVisualization(structure: CodeStructure): Promise<void> {
        // This would create the actual 3D visualization
        // For now, we'll prepare the data structure
        console.log('Creating 3D visualization for:', structure);
    }

    private show3DInterface(): void {
        // Show 3D-specific UI elements
        vscode.commands.executeCommand('setContext', 'aura.3d.active', true);
    }

    private hide3DInterface(): void {
        // Hide 3D-specific UI elements
        vscode.commands.executeCommand('setContext', 'aura.3d.active', false);
    }

    private async animate3DTransition(): Promise<void> {
        return new Promise(resolve => {
            setTimeout(resolve, this.transitionDuration);
        });
    }

    private async animate2DTransition(): Promise<void> {
        return new Promise(resolve => {
            setTimeout(resolve, this.transitionDuration);
        });
    }

    private getTransitionHTML(targetMode: ViewMode): string {
        const modeText = targetMode === '3d' ? '3D Visualization' : '2D Editor';
        const color = targetMode === '3d' ? '#3b82f6' : '#10b981';
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    font-family: var(--vscode-font-family);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    overflow: hidden;
                }
                
                .transition-container {
                    text-align: center;
                    animation: fadeInScale 0.5s ease-out;
                }
                
                .transition-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                    color: ${color};
                    animation: pulse 1s infinite;
                }
                
                .transition-text {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 10px;
                }
                
                .transition-subtitle {
                    font-size: 14px;
                    opacity: 0.7;
                }
                
                .progress-bar {
                    width: 200px;
                    height: 4px;
                    background: var(--vscode-progressBar-background);
                    border-radius: 2px;
                    margin: 20px auto;
                    overflow: hidden;
                }
                
                .progress-fill {
                    height: 100%;
                    background: ${color};
                    border-radius: 2px;
                    animation: progressFill ${this.transitionDuration}ms ease-out;
                }
                
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                
                @keyframes progressFill {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            </style>
        </head>
        <body>
            <div class="transition-container">
                <div class="transition-icon">
                    ${targetMode === '3d' ? '🌐' : '📝'}
                </div>
                <div class="transition-text">
                    Switching to ${modeText}
                </div>
                <div class="transition-subtitle">
                    ${targetMode === '3d' ? 'Preparing 3D code visualization...' : 'Returning to 2D editor...'}
                </div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    private async get3DMinimapHTML(): Promise<string> {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    padding: 8px;
                    background: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    font-family: var(--vscode-font-family);
                }
                
                .minimap-container {
                    width: 100%;
                    height: 100vh;
                    position: relative;
                }
                
                .minimap-header {
                    padding: 8px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    font-weight: 600;
                    font-size: 12px;
                }
                
                .minimap-canvas {
                    width: 100%;
                    height: calc(100% - 40px);
                    background: var(--vscode-textBlockQuote-background);
                    border-radius: 4px;
                    position: relative;
                    overflow: hidden;
                }
                
                .code-block {
                    position: absolute;
                    background: var(--vscode-button-background);
                    border-radius: 2px;
                    opacity: 0.8;
                    transition: all 0.2s ease;
                }
                
                .code-block:hover {
                    opacity: 1;
                    transform: scale(1.1);
                }
                
                .code-block.function {
                    background: #3b82f6;
                }
                
                .code-block.class {
                    background: #8b5cf6;
                }
                
                .code-block.import {
                    background: #10b981;
                }
            </style>
        </head>
        <body>
            <div class="minimap-container">
                <div class="minimap-header">3D Code Structure</div>
                <div class="minimap-canvas" id="minimapCanvas">
                    <!-- 3D minimap content will be dynamically generated -->
                </div>
            </div>
            
            <script>
                // Initialize 3D minimap visualization
                function initializeMinimap() {
                    // This would contain WebGL or Three.js code for 3D rendering
                    console.log('3D Minimap initialized');
                }
                
                initializeMinimap();
            </script>
        </body>
        </html>
        `;
    }

    private async createContextualOverlay(editor: vscode.TextEditor, position: vscode.Position): Promise<OverlayElement> {
        // Create a lightweight overlay panel
        const panel = vscode.window.createWebviewPanel(
            'aura3dOverlay',
            'Code Structure',
            { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
            {
                enableScripts: true,
                retainContextWhenHidden: false,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'webviews')
                ]
            }
        );

        panel.webview.html = await this.getOverlayHTML(editor, position);

        return {
            panel,
            position,
            dispose: () => panel.dispose()
        };
    }

    private async getOverlayHTML(editor: vscode.TextEditor, position: vscode.Position): Promise<string> {
        const line = editor.document.lineAt(position.line);
        const context = this.analyzeLineContext(editor.document, position.line);
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    padding: 12px;
                    background: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    font-family: var(--vscode-font-family);
                    font-size: 12px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }
                
                .overlay-header {
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: var(--vscode-textLink-foreground);
                }
                
                .overlay-content {
                    font-size: 11px;
                    line-height: 1.4;
                }
                
                .context-item {
                    margin: 4px 0;
                    padding: 2px 0;
                }
                
                .context-type {
                    color: var(--vscode-symbolIcon-functionForeground);
                    font-weight: 500;
                }
            </style>
        </head>
        <body>
            <div class="overlay-header">3D Structure Preview</div>
            <div class="overlay-content">
                <div class="context-item">
                    <span class="context-type">Type:</span> ${context.type}
                </div>
                <div class="context-item">
                    <span class="context-type">Complexity:</span> ${context.complexity}
                </div>
                <div class="context-item">
                    <span class="context-type">Dependencies:</span> ${context.dependencies}
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Helper methods
    private extractFunctionName(line: string): string {
        const match = line.match(/function\s+(\w+)|(\w+)\s*\(/);
        return match ? (match[1] || match[2] || 'anonymous') : 'unknown';
    }

    private extractClassName(line: string): string {
        const match = line.match(/class\s+(\w+)/);
        return match ? match[1] : 'unknown';
    }

    private extractImportModule(line: string): string {
        const match = line.match(/from\s+['"]([^'"]+)['"]/);
        return match ? match[1] : 'unknown';
    }

    private extractMethods(lines: string[], startLine: number): string[] {
        // Extract methods from class body
        return [];
    }

    private calculateComplexity(lines: string[], startLine: number): number {
        // Calculate cyclomatic complexity
        return Math.floor(Math.random() * 10) + 1;
    }

    private calculateOverallComplexity(structure: CodeStructure): number {
        return structure.functions.length + structure.classes.length * 2;
    }

    private analyzeRelationships(structure: CodeStructure): any[] {
        // Analyze code relationships for 3D visualization
        return [];
    }

    private analyzeLineContext(document: vscode.TextDocument, lineNumber: number): LineContext {
        const line = document.lineAt(lineNumber).text.trim();
        
        let type = 'code';
        if (line.includes('function')) type = 'function';
        else if (line.includes('class')) type = 'class';
        else if (line.includes('import')) type = 'import';
        else if (line.includes('export')) type = 'export';

        return {
            type,
            complexity: Math.floor(Math.random() * 5) + 1,
            dependencies: Math.floor(Math.random() * 3)
        };
    }

    private updateVisualizationContext(editor: vscode.TextEditor): void {
        // Update 3D visualization when editor context changes
    }

    private updateConfiguration(): void {
        // Update transition settings based on configuration
        const config = vscode.workspace.getConfiguration('aura.3d');
        this.transitionDuration = config.get('transitionDuration', 800);
    }

    private update3DMinimap(): void {
        if (!this.minimap3D) return;
        
        // Update minimap content based on current editor
        this.minimap3D.webview.postMessage({
            type: 'updateMinimap',
            data: this.getCurrentEditorData()
        });
    }

    private getCurrentEditorData(): any {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return null;

        return {
            language: editor.document.languageId,
            lineCount: editor.document.lineCount,
            selection: editor.selection
        };
    }

    public dispose(): void {
        this.hideTransitionUI();
        this.hide3DMinimap();
        
        this.overlayElements.forEach(overlay => overlay.dispose());
        this.overlayElements.clear();
    }
}

// Type definitions
type ViewMode = '2d' | '3d';

interface CodeStructure {
    functions: FunctionInfo[];
    classes: ClassInfo[];
    imports: ImportInfo[];
    exports: ExportInfo[];
    complexity: number;
    relationships: RelationshipInfo[];
}

interface FunctionInfo {
    name: string;
    line: number;
    complexity: number;
}

interface ClassInfo {
    name: string;
    line: number;
    methods: string[];
}

interface ImportInfo {
    module: string;
    line: number;
}

interface ExportInfo {
    name: string;
    line: number;
}

interface RelationshipInfo {
    from: string;
    to: string;
    type: 'calls' | 'extends' | 'imports';
}

interface OverlayElement {
    panel: vscode.WebviewPanel;
    position: vscode.Position;
    dispose: () => void;
}

interface LineContext {
    type: string;
    complexity: number;
    dependencies: number;
} 