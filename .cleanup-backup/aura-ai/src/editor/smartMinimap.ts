import * as vscode from 'vscode';

/**
 * SmartMinimap - Enhanced minimap with AI insights, function boundaries, problem areas,
 * performance hotspots, and seamless 3D integration
 */
export class SmartMinimap {
    private context: vscode.ExtensionContext;
    private minimapPanel: vscode.WebviewPanel | undefined;
    private decorationTypes: Map<string, vscode.TextEditorDecorationType> = new Map();
    private analysisData: Map<string, MinimapAnalysis> = new Map();
    private updateInterval: NodeJS.Timeout | undefined;
    private isEnabled = true;
    private currentZoomLevel = 1.0;
    private heatmapMode: HeatmapMode = 'none';

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.initializeDecorations();
        this.setupEventListeners();
        this.createMinimapPanel();
    }

    private initializeDecorations(): void {
        // Function boundaries
        this.decorationTypes.set('function-boundary', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#3b82f6',
            overviewRulerLane: vscode.OverviewRulerLane.Left,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        // Class boundaries
        this.decorationTypes.set('class-boundary', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#8b5cf6',
            overviewRulerLane: vscode.OverviewRulerLane.Left,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        // Problem areas
        this.decorationTypes.set('error-highlight', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#ef4444',
            overviewRulerLane: vscode.OverviewRulerLane.Right
        }));

        this.decorationTypes.set('warning-highlight', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#f59e0b',
            overviewRulerLane: vscode.OverviewRulerLane.Right
        }));

        // AI suggestions
        this.decorationTypes.set('ai-suggestion-marker', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#06b6d4',
            overviewRulerLane: vscode.OverviewRulerLane.Center
        }));

        // Performance hotspots
        this.decorationTypes.set('performance-hotspot', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#ec4899',
            overviewRulerLane: vscode.OverviewRulerLane.Full
        }));

        // Code complexity heatmap
        this.decorationTypes.set('complexity-heat', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#f97316',
            overviewRulerLane: vscode.OverviewRulerLane.Full
        }));

        // 3D visualization markers
        this.decorationTypes.set('3d-marker', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#14b8a6',
            overviewRulerLane: vscode.OverviewRulerLane.Center
        }));
    }

    private setupEventListeners(): void {
        // Update on editor changes
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                this.analyzeEditor(editor);
                this.updateMinimapPanel(editor);
            }
        });

        // Update on text changes (debounced)
        vscode.workspace.onDidChangeTextDocument(event => {
            if (vscode.window.activeTextEditor?.document === event.document) {
                this.scheduleUpdate();
            }
        });

        // Update on diagnostics changes
        vscode.languages.onDidChangeDiagnostics(event => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && event.uris.includes(activeEditor.document.uri)) {
                this.updateDiagnosticMarkers(activeEditor);
            }
        });

        // Configuration changes
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('aura.minimap')) {
                this.updateConfiguration();
            }
        });

        // Register commands
        this.registerCommands();
    }

    private registerCommands(): void {
        vscode.commands.registerCommand('aura.minimap.toggle', () => {
            this.toggleMinimap();
        });

        vscode.commands.registerCommand('aura.minimap.zoomIn', () => {
            this.zoomIn();
        });

        vscode.commands.registerCommand('aura.minimap.zoomOut', () => {
            this.zoomOut();
        });

        vscode.commands.registerCommand('aura.minimap.resetZoom', () => {
            this.resetZoom();
        });

        vscode.commands.registerCommand('aura.minimap.toggleHeatmap', (mode: HeatmapMode) => {
            this.toggleHeatmap(mode);
        });

        vscode.commands.registerCommand('aura.minimap.jumpToFunction', (line: number) => {
            this.jumpToLine(line);
        });

        vscode.commands.registerCommand('aura.minimap.showInsights', () => {
            this.showAIInsights();
        });
    }

    private async createMinimapPanel(): Promise<void> {
        this.minimapPanel = vscode.window.createWebviewPanel(
            'auraSmartMinimap',
            'Smart Minimap',
            { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'webviews')
                ]
            }
        );

        this.minimapPanel.webview.html = await this.getMinimapHTML();

        // Handle messages from webview
        this.minimapPanel.webview.onDidReceiveMessage(message => {
            this.handleWebviewMessage(message);
        });

        this.minimapPanel.onDidDispose(() => {
            this.minimapPanel = undefined;
        });

        // Initial update
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            this.analyzeEditor(activeEditor);
            this.updateMinimapPanel(activeEditor);
        }
    }

    private scheduleUpdate(): void {
        if (this.updateInterval) {
            clearTimeout(this.updateInterval);
        }

        this.updateInterval = setTimeout(() => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                this.analyzeEditor(editor);
                this.updateMinimapPanel(editor);
            }
        }, 300);
    }

    private async analyzeEditor(editor: vscode.TextEditor): Promise<void> {
        const document = editor.document;
        const documentUri = document.uri.toString();

        try {
            const analysis = await this.performMinimapAnalysis(document);
            this.analysisData.set(documentUri, analysis);

            // Apply decorations
            this.applyMinimapDecorations(editor, analysis);

        } catch (error) {
            console.error('Minimap analysis failed:', error);
        }
    }

    private async performMinimapAnalysis(document: vscode.TextDocument): Promise<MinimapAnalysis> {
        const text = document.getText();
        const lines = text.split('\n');

        const analysis: MinimapAnalysis = {
            functions: [],
            classes: [],
            imports: [],
            problems: [],
            complexity: [],
            performance: [],
            aiSuggestions: [],
            codeStructure: [],
            metrics: {
                totalLines: lines.length,
                codeLines: 0,
                commentLines: 0,
                blankLines: 0,
                complexity: 0
            }
        };

        // Analyze code structure
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Count line types
            if (trimmed === '') {
                analysis.metrics.blankLines++;
            } else if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
                analysis.metrics.commentLines++;
            } else {
                analysis.metrics.codeLines++;
            }

            // Detect functions
            if (this.isFunctionDeclaration(trimmed)) {
                const func = await this.analyzeFunctionAt(lines, i);
                analysis.functions.push(func);
            }

            // Detect classes
            if (this.isClassDeclaration(trimmed)) {
                const cls = await this.analyzeClassAt(lines, i);
                analysis.classes.push(cls);
            }

            // Detect imports
            if (trimmed.startsWith('import') || trimmed.startsWith('require')) {
                analysis.imports.push({
                    line: i,
                    module: this.extractModuleName(trimmed),
                    type: trimmed.startsWith('import') ? 'es6' : 'commonjs'
                });
            }

            // Analyze complexity
            const complexity = this.analyzeLineComplexity(trimmed);
            if (complexity > 0) {
                analysis.complexity.push({
                    line: i,
                    score: complexity,
                    type: this.getComplexityType(trimmed)
                });
                analysis.metrics.complexity += complexity;
            }
        }

        // Get diagnostic information
        analysis.problems = await this.extractProblems(document);

        // Get AI suggestions
        analysis.aiSuggestions = await this.getAISuggestions(document);

        // Analyze performance hotspots
        analysis.performance = await this.analyzePerformanceHotspots(document, lines);

        // Build code structure tree
        analysis.codeStructure = this.buildStructureTree(analysis);

        return analysis;
    }

    private async analyzeFunctionAt(lines: string[], startLine: number): Promise<FunctionInfo> {
        const line = lines[startLine].trim();
        const name = this.extractFunctionName(line);
        
        // Find function end
        let endLine = this.findBlockEnd(lines, startLine);
        const bodyLines = endLine - startLine;
        
        // Calculate complexity
        let complexity = 0;
        for (let i = startLine; i <= endLine; i++) {
            complexity += this.analyzeLineComplexity(lines[i]);
        }

        // Analyze parameters
        const parameters = this.extractParameters(line);
        
        // Check for async/await
        const isAsync = line.includes('async');
        
        return {
            name,
            startLine,
            endLine,
            bodyLines,
            complexity,
            parameters,
            isAsync,
            visibility: this.extractVisibility(line),
            returnType: this.extractReturnType(line)
        };
    }

    private async analyzeClassAt(lines: string[], startLine: number): Promise<ClassInfo> {
        const line = lines[startLine].trim();
        const name = this.extractClassName(line);
        
        let endLine = this.findBlockEnd(lines, startLine);
        const methods: string[] = [];
        const properties: string[] = [];
        
        // Find methods and properties within class
        for (let i = startLine + 1; i < endLine; i++) {
            const innerLine = lines[i].trim();
            if (this.isMethodDeclaration(innerLine)) {
                methods.push(this.extractMethodName(innerLine));
            } else if (this.isPropertyDeclaration(innerLine)) {
                properties.push(this.extractPropertyName(innerLine));
            }
        }

        return {
            name,
            startLine,
            endLine,
            methods,
            properties,
            extends: this.extractExtendsClass(line),
            implements: this.extractImplementsInterfaces(line)
        };
    }

    private async extractProblems(document: vscode.TextDocument): Promise<ProblemInfo[]> {
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        
        return diagnostics.map(diagnostic => ({
            line: diagnostic.range.start.line,
            severity: diagnostic.severity || vscode.DiagnosticSeverity.Information,
            message: diagnostic.message,
            source: diagnostic.source || 'unknown',
            code: diagnostic.code?.toString() || ''
        }));
    }

    private async getAISuggestions(document: vscode.TextDocument): Promise<AISuggestionInfo[]> {
        // This would integrate with the AI engine
        const suggestions: AISuggestionInfo[] = [];
        
        // Mock AI suggestions for demonstration
        const text = document.getText();
        const lines = text.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.includes('TODO') || line.includes('FIXME')) {
                suggestions.push({
                    line: i,
                    type: 'implementation',
                    confidence: 0.8,
                    message: 'AI can help implement this functionality',
                    action: 'aura.ai.implement'
                });
            }
            
            if (line.includes('console.log')) {
                suggestions.push({
                    line: i,
                    type: 'improvement',
                    confidence: 0.6,
                    message: 'Consider using proper logging',
                    action: 'aura.ai.improveLogging'
                });
            }
        }
        
        return suggestions;
    }

    private async analyzePerformanceHotspots(document: vscode.TextDocument, lines: string[]): Promise<PerformanceInfo[]> {
        const hotspots: PerformanceInfo[] = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim().toLowerCase();
            
            // Detect potential performance issues
            if (line.includes('for') && line.includes('for')) {
                hotspots.push({
                    line: i,
                    type: 'nested-loop',
                    impact: 'high',
                    suggestion: 'Consider algorithm optimization'
                });
            }
            
            if (line.includes('document.getelementbyid') || line.includes('queryselector')) {
                hotspots.push({
                    line: i,
                    type: 'dom-query',
                    impact: 'medium',
                    suggestion: 'Cache DOM queries'
                });
            }
            
            if (line.includes('json.parse') || line.includes('json.stringify')) {
                hotspots.push({
                    line: i,
                    type: 'json-operation',
                    impact: 'low',
                    suggestion: 'Consider streaming for large objects'
                });
            }
        }
        
        return hotspots;
    }

    private buildStructureTree(analysis: MinimapAnalysis): StructureNode[] {
        const nodes: StructureNode[] = [];
        
        // Add top-level imports
        if (analysis.imports.length > 0) {
            nodes.push({
                type: 'imports',
                name: 'Imports',
                startLine: analysis.imports[0].line,
                endLine: analysis.imports[analysis.imports.length - 1].line,
                children: analysis.imports.map(imp => ({
                    type: 'import',
                    name: imp.module,
                    startLine: imp.line,
                    endLine: imp.line,
                    children: []
                }))
            });
        }
        
        // Add classes with their methods
        analysis.classes.forEach(cls => {
            nodes.push({
                type: 'class',
                name: cls.name,
                startLine: cls.startLine,
                endLine: cls.endLine,
                children: cls.methods.map(method => ({
                    type: 'method',
                    name: method,
                    startLine: cls.startLine, // Would need to find actual method line
                    endLine: cls.startLine,
                    children: []
                }))
            });
        });
        
        // Add standalone functions
        analysis.functions.forEach(func => {
            if (!this.isMethodOfClass(func, analysis.classes)) {
                nodes.push({
                    type: 'function',
                    name: func.name,
                    startLine: func.startLine,
                    endLine: func.endLine,
                    children: []
                });
            }
        });
        
        return nodes;
    }

    private applyMinimapDecorations(editor: vscode.TextEditor, analysis: MinimapAnalysis): void {
        // Clear existing decorations
        this.decorationTypes.forEach(decoration => {
            editor.setDecorations(decoration, []);
        });

        // Function boundaries
        const functionRanges = analysis.functions.map(func => 
            new vscode.Range(func.startLine, 0, func.endLine, 0)
        );
        editor.setDecorations(this.decorationTypes.get('function-boundary')!, functionRanges);

        // Class boundaries
        const classRanges = analysis.classes.map(cls => 
            new vscode.Range(cls.startLine, 0, cls.endLine, 0)
        );
        editor.setDecorations(this.decorationTypes.get('class-boundary')!, classRanges);

        // Problem markers
        const errorRanges = analysis.problems
            .filter(p => p.severity === vscode.DiagnosticSeverity.Error)
            .map(p => new vscode.Range(p.line, 0, p.line, 0));
        editor.setDecorations(this.decorationTypes.get('error-highlight')!, errorRanges);

        const warningRanges = analysis.problems
            .filter(p => p.severity === vscode.DiagnosticSeverity.Warning)
            .map(p => new vscode.Range(p.line, 0, p.line, 0));
        editor.setDecorations(this.decorationTypes.get('warning-highlight')!, warningRanges);

        // AI suggestions
        const aiRanges = analysis.aiSuggestions.map(suggestion => 
            new vscode.Range(suggestion.line, 0, suggestion.line, 0)
        );
        editor.setDecorations(this.decorationTypes.get('ai-suggestion-marker')!, aiRanges);

        // Performance hotspots
        const perfRanges = analysis.performance.map(perf => 
            new vscode.Range(perf.line, 0, perf.line, 0)
        );
        editor.setDecorations(this.decorationTypes.get('performance-hotspot')!, perfRanges);

        // Complexity heatmap (if enabled)
        if (this.heatmapMode === 'complexity') {
            const complexityRanges = analysis.complexity.map(comp => 
                new vscode.Range(comp.line, 0, comp.line, 0)
            );
            editor.setDecorations(this.decorationTypes.get('complexity-heat')!, complexityRanges);
        }
    }

    private async updateMinimapPanel(editor: vscode.TextEditor): Promise<void> {
        if (!this.minimapPanel) return;

        const documentUri = editor.document.uri.toString();
        const analysis = this.analysisData.get(documentUri);
        
        if (!analysis) return;

        // Send updated data to webview
        this.minimapPanel.webview.postMessage({
            type: 'updateMinimap',
            data: {
                analysis,
                currentLine: editor.selection.active.line,
                totalLines: editor.document.lineCount,
                visibleRange: {
                    start: editor.visibleRanges[0]?.start.line || 0,
                    end: editor.visibleRanges[0]?.end.line || 0
                },
                zoomLevel: this.currentZoomLevel,
                heatmapMode: this.heatmapMode
            }
        });
    }

    private updateDiagnosticMarkers(editor: vscode.TextEditor): void {
        // Re-analyze to update problem markers
        this.analyzeEditor(editor);
    }

    private async getMinimapHTML(): Promise<string> {
        const cssUri = vscode.Uri.joinPath(this.context.extensionUri, 'webviews', 'minimap.css');
        const cssPath = this.minimapPanel!.webview.asWebviewUri(cssUri);

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Smart Minimap</title>
            <link href="${cssPath}" rel="stylesheet">
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    font-family: var(--vscode-font-family);
                    overflow: hidden;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                
                .minimap-header {
                    padding: 8px 12px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    background: var(--vscode-sideBar-background);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                }
                
                .minimap-title {
                    font-weight: 600;
                    font-size: 12px;
                }
                
                .minimap-controls {
                    display: flex;
                    gap: 4px;
                }
                
                .control-btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 10px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                
                .control-btn:hover {
                    background: var(--vscode-button-hoverBackground);
                }
                
                .minimap-container {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                }
                
                .minimap-canvas {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    background: var(--vscode-textBlockQuote-background);
                }
                
                .code-line {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: var(--vscode-editor-foreground);
                    opacity: 0.1;
                    transition: opacity 0.2s ease;
                }
                
                .code-line:hover {
                    opacity: 0.3;
                }
                
                .code-line.current {
                    background: var(--vscode-editor-lineHighlightBackground);
                    opacity: 0.8;
                    height: 3px;
                }
                
                .structure-marker {
                    position: absolute;
                    left: 2px;
                    width: 4px;
                    border-radius: 2px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .structure-marker:hover {
                    transform: scaleX(1.5);
                }
                
                .structure-marker.function {
                    background: #3b82f6;
                }
                
                .structure-marker.class {
                    background: #8b5cf6;
                }
                
                .structure-marker.import {
                    background: #10b981;
                }
                
                .problem-marker {
                    position: absolute;
                    right: 2px;
                    width: 3px;
                    height: 2px;
                    border-radius: 1px;
                }
                
                .problem-marker.error {
                    background: #ef4444;
                }
                
                .problem-marker.warning {
                    background: #f59e0b;
                }
                
                .ai-marker {
                    position: absolute;
                    right: 8px;
                    width: 6px;
                    height: 2px;
                    background: #06b6d4;
                    border-radius: 1px;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                
                .viewport-indicator {
                    position: absolute;
                    left: 0;
                    right: 0;
                    background: rgba(59, 130, 246, 0.2);
                    border: 1px solid #3b82f6;
                    pointer-events: none;
                    min-height: 10px;
                }
                
                .minimap-stats {
                    padding: 8px 12px;
                    border-top: 1px solid var(--vscode-panel-border);
                    background: var(--vscode-sideBar-background);
                    font-size: 10px;
                    flex-shrink: 0;
                }
                
                .stat-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 2px 0;
                }
                
                .heatmap-controls {
                    padding: 4px 12px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    background: var(--vscode-sideBar-background);
                    flex-shrink: 0;
                }
                
                .heatmap-btn {
                    background: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border: none;
                    padding: 2px 8px;
                    border-radius: 3px;
                    font-size: 9px;
                    cursor: pointer;
                    margin-right: 4px;
                }
                
                .heatmap-btn.active {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }
                
                .complexity-overlay {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(to right, #10b981, #f59e0b, #ef4444);
                    opacity: 0.6;
                }
            </style>
        </head>
        <body>
            <div class="minimap-header">
                <div class="minimap-title">Smart Minimap</div>
                <div class="minimap-controls">
                    <button class="control-btn" onclick="zoomOut()">-</button>
                    <button class="control-btn" onclick="resetZoom()">1:1</button>
                    <button class="control-btn" onclick="zoomIn()">+</button>
                </div>
            </div>
            
            <div class="heatmap-controls">
                <button class="heatmap-btn active" onclick="setHeatmap('none')">None</button>
                <button class="heatmap-btn" onclick="setHeatmap('complexity')">Complexity</button>
                <button class="heatmap-btn" onclick="setHeatmap('performance')">Performance</button>
                <button class="heatmap-btn" onclick="setHeatmap('ai')">AI Insights</button>
            </div>
            
            <div class="minimap-container">
                <div class="minimap-canvas" id="minimapCanvas">
                    <!-- Dynamic content will be generated here -->
                </div>
            </div>
            
            <div class="minimap-stats" id="minimapStats">
                <div class="stat-row">
                    <span>Lines:</span>
                    <span id="totalLines">0</span>
                </div>
                <div class="stat-row">
                    <span>Functions:</span>
                    <span id="functionCount">0</span>
                </div>
                <div class="stat-row">
                    <span>Complexity:</span>
                    <span id="complexityScore">0</span>
                </div>
                <div class="stat-row">
                    <span>Issues:</span>
                    <span id="issueCount">0</span>
                </div>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                let currentAnalysis = null;
                let currentZoom = 1.0;
                let currentHeatmap = 'none';
                
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    switch (message.type) {
                        case 'updateMinimap':
                            updateMinimap(message.data);
                            break;
                    }
                });
                
                function updateMinimap(data) {
                    currentAnalysis = data.analysis;
                    currentZoom = data.zoomLevel;
                    currentHeatmap = data.heatmapMode;
                    
                    renderMinimap(data);
                    updateStats(data.analysis.metrics);
                }
                
                function renderMinimap(data) {
                    const canvas = document.getElementById('minimapCanvas');
                    canvas.innerHTML = '';
                    
                    const totalLines = data.totalLines;
                    const canvasHeight = canvas.clientHeight;
                    const lineHeight = canvasHeight / totalLines * currentZoom;
                    
                    // Render code lines
                    for (let i = 0; i < totalLines; i++) {
                        const line = document.createElement('div');
                        line.className = 'code-line';
                        if (i === data.currentLine) {
                            line.classList.add('current');
                        }
                        line.style.top = (i * lineHeight) + 'px';
                        line.onclick = () => jumpToLine(i);
                        canvas.appendChild(line);
                    }
                    
                    // Render structure markers
                    data.analysis.functions.forEach(func => {
                        const marker = document.createElement('div');
                        marker.className = 'structure-marker function';
                        marker.style.top = (func.startLine * lineHeight) + 'px';
                        marker.style.height = ((func.endLine - func.startLine) * lineHeight) + 'px';
                        marker.title = \`Function: \${func.name}\`;
                        marker.onclick = () => jumpToLine(func.startLine);
                        canvas.appendChild(marker);
                    });
                    
                    data.analysis.classes.forEach(cls => {
                        const marker = document.createElement('div');
                        marker.className = 'structure-marker class';
                        marker.style.top = (cls.startLine * lineHeight) + 'px';
                        marker.style.height = ((cls.endLine - cls.startLine) * lineHeight) + 'px';
                        marker.title = \`Class: \${cls.name}\`;
                        marker.onclick = () => jumpToLine(cls.startLine);
                        canvas.appendChild(marker);
                    });
                    
                    // Render problem markers
                    data.analysis.problems.forEach(problem => {
                        const marker = document.createElement('div');
                        marker.className = \`problem-marker \${problem.severity === 1 ? 'error' : 'warning'}\`;
                        marker.style.top = (problem.line * lineHeight) + 'px';
                        marker.title = problem.message;
                        marker.onclick = () => jumpToLine(problem.line);
                        canvas.appendChild(marker);
                    });
                    
                    // Render AI suggestion markers
                    data.analysis.aiSuggestions.forEach(suggestion => {
                        const marker = document.createElement('div');
                        marker.className = 'ai-marker';
                        marker.style.top = (suggestion.line * lineHeight) + 'px';
                        marker.title = suggestion.message;
                        marker.onclick = () => jumpToLine(suggestion.line);
                        canvas.appendChild(marker);
                    });
                    
                    // Render complexity heatmap if enabled
                    if (currentHeatmap === 'complexity') {
                        data.analysis.complexity.forEach(comp => {
                            const overlay = document.createElement('div');
                            overlay.className = 'complexity-overlay';
                            overlay.style.top = (comp.line * lineHeight) + 'px';
                            overlay.style.opacity = Math.min(comp.score / 10, 1);
                            canvas.appendChild(overlay);
                        });
                    }
                    
                    // Render viewport indicator
                    if (data.visibleRange) {
                        const indicator = document.createElement('div');
                        indicator.className = 'viewport-indicator';
                        indicator.style.top = (data.visibleRange.start * lineHeight) + 'px';
                        indicator.style.height = ((data.visibleRange.end - data.visibleRange.start) * lineHeight) + 'px';
                        canvas.appendChild(indicator);
                    }
                }
                
                function updateStats(metrics) {
                    document.getElementById('totalLines').textContent = metrics.totalLines;
                    document.getElementById('functionCount').textContent = currentAnalysis.functions.length;
                    document.getElementById('complexityScore').textContent = Math.round(metrics.complexity);
                    document.getElementById('issueCount').textContent = currentAnalysis.problems.length;
                }
                
                function jumpToLine(line) {
                    vscode.postMessage({
                        type: 'jumpToLine',
                        line: line
                    });
                }
                
                function zoomIn() {
                    vscode.postMessage({ type: 'zoomIn' });
                }
                
                function zoomOut() {
                    vscode.postMessage({ type: 'zoomOut' });
                }
                
                function resetZoom() {
                    vscode.postMessage({ type: 'resetZoom' });
                }
                
                function setHeatmap(mode) {
                    // Update button states
                    document.querySelectorAll('.heatmap-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    event.target.classList.add('active');
                    
                    vscode.postMessage({
                        type: 'setHeatmap',
                        mode: mode
                    });
                }
            </script>
        </body>
        </html>
        `;
    }

    private handleWebviewMessage(message: any): void {
        switch (message.type) {
            case 'jumpToLine':
                this.jumpToLine(message.line);
                break;
            case 'zoomIn':
                this.zoomIn();
                break;
            case 'zoomOut':
                this.zoomOut();
                break;
            case 'resetZoom':
                this.resetZoom();
                break;
            case 'setHeatmap':
                this.toggleHeatmap(message.mode);
                break;
        }
    }

    // Public API methods
    public toggleMinimap(): void {
        if (this.minimapPanel) {
            this.minimapPanel.dispose();
            this.minimapPanel = undefined;
        } else {
            this.createMinimapPanel();
        }
    }

    public zoomIn(): void {
        this.currentZoomLevel = Math.min(this.currentZoomLevel * 1.2, 3.0);
        this.updateMinimapPanel(vscode.window.activeTextEditor!);
    }

    public zoomOut(): void {
        this.currentZoomLevel = Math.max(this.currentZoomLevel / 1.2, 0.3);
        this.updateMinimapPanel(vscode.window.activeTextEditor!);
    }

    public resetZoom(): void {
        this.currentZoomLevel = 1.0;
        this.updateMinimapPanel(vscode.window.activeTextEditor!);
    }

    public toggleHeatmap(mode: HeatmapMode): void {
        this.heatmapMode = mode;
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            this.analyzeEditor(editor);
            this.updateMinimapPanel(editor);
        }
    }

    public jumpToLine(line: number): void {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const position = new vscode.Position(line, 0);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position));
        }
    }

    public showAIInsights(): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const analysis = this.analysisData.get(editor.document.uri.toString());
        if (!analysis) return;

        const insights = this.generateInsights(analysis);
        vscode.window.showInformationMessage(insights);
    }

    // Helper methods
    private isFunctionDeclaration(line: string): boolean {
        return /\b(function|async\s+function|const\s+\w+\s*=\s*\(|const\s+\w+\s*=\s*async\s*\(|\w+\s*\(.*\)\s*{)/.test(line);
    }

    private isClassDeclaration(line: string): boolean {
        return /\bclass\s+\w+/.test(line);
    }

    private isMethodDeclaration(line: string): boolean {
        return /^\s*\w+\s*\(.*\)\s*{/.test(line);
    }

    private isPropertyDeclaration(line: string): boolean {
        return /^\s*(public|private|protected)?\s*\w+\s*[=:]/.test(line);
    }

    private extractFunctionName(line: string): string {
        const matches = line.match(/function\s+(\w+)|const\s+(\w+)\s*=|(\w+)\s*\(/);
        return matches ? (matches[1] || matches[2] || matches[3] || 'anonymous') : 'unknown';
    }

    private extractClassName(line: string): string {
        const match = line.match(/class\s+(\w+)/);
        return match ? match[1] : 'unknown';
    }

    private extractMethodName(line: string): string {
        const match = line.match(/^\s*(\w+)\s*\(/);
        return match ? match[1] : 'unknown';
    }

    private extractPropertyName(line: string): string {
        const match = line.match(/^\s*(?:public|private|protected)?\s*(\w+)/);
        return match ? match[1] : 'unknown';
    }

    private extractModuleName(line: string): string {
        const match = line.match(/from\s+['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]/);
        return match ? (match[1] || match[2] || 'unknown') : 'unknown';
    }

    private extractParameters(line: string): string[] {
        const match = line.match(/\(([^)]*)\)/);
        if (!match || !match[1].trim()) return [];
        return match[1].split(',').map(p => p.trim());
    }

    private extractVisibility(line: string): string {
        if (line.includes('private')) return 'private';
        if (line.includes('protected')) return 'protected';
        if (line.includes('public')) return 'public';
        return 'public';
    }

    private extractReturnType(line: string): string {
        const match = line.match(/:\s*(\w+)\s*{/);
        return match ? match[1] : 'void';
    }

    private extractExtendsClass(line: string): string | undefined {
        const match = line.match(/extends\s+(\w+)/);
        return match ? match[1] : undefined;
    }

    private extractImplementsInterfaces(line: string): string[] {
        const match = line.match(/implements\s+([\w,\s]+)/);
        if (!match) return [];
        return match[1].split(',').map(i => i.trim());
    }

    private findBlockEnd(lines: string[], startLine: number): number {
        let braceCount = 0;
        let inString = false;
        let stringChar = '';

        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i];
            
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                
                if (!inString) {
                    if (char === '"' || char === "'") {
                        inString = true;
                        stringChar = char;
                    } else if (char === '{') {
                        braceCount++;
                    } else if (char === '}') {
                        braceCount--;
                        if (braceCount === 0 && i > startLine) {
                            return i;
                        }
                    }
                } else if (char === stringChar && line[j-1] !== '\\') {
                    inString = false;
                }
            }
        }
        
        return Math.min(startLine + 50, lines.length - 1);
    }

    private analyzeLineComplexity(line: string): number {
        let complexity = 0;
        
        if (line.includes('if') || line.includes('else')) complexity += 1;
        if (line.includes('for') || line.includes('while')) complexity += 2;
        if (line.includes('switch') || line.includes('case')) complexity += 1;
        if (line.includes('try') || line.includes('catch')) complexity += 1;
        if (line.includes('&&') || line.includes('||')) complexity += 1;
        
        return complexity;
    }

    private getComplexityType(line: string): string {
        if (line.includes('if')) return 'conditional';
        if (line.includes('for') || line.includes('while')) return 'loop';
        if (line.includes('switch')) return 'switch';
        if (line.includes('try')) return 'exception';
        return 'other';
    }

    private isMethodOfClass(func: FunctionInfo, classes: ClassInfo[]): boolean {
        return classes.some(cls => 
            func.startLine > cls.startLine && func.endLine < cls.endLine
        );
    }

    private generateInsights(analysis: MinimapAnalysis): string {
        const insights: string[] = [];
        
        if (analysis.metrics.complexity > 50) {
            insights.push('High complexity detected - consider refactoring');
        }
        
        if (analysis.problems.length > 10) {
            insights.push('Many issues found - review code quality');
        }
        
        if (analysis.aiSuggestions.length > 0) {
            insights.push(`${analysis.aiSuggestions.length} AI improvement suggestions available`);
        }
        
        return insights.length > 0 ? insights.join('\n') : 'Code looks good!';
    }

    private updateConfiguration(): void {
        const config = vscode.workspace.getConfiguration('aura.minimap');
        this.isEnabled = config.get('enabled', true);
    }

    public dispose(): void {
        if (this.updateInterval) {
            clearTimeout(this.updateInterval);
        }
        
        if (this.minimapPanel) {
            this.minimapPanel.dispose();
        }
        
        this.decorationTypes.forEach(decoration => {
            decoration.dispose();
        });
        
        this.decorationTypes.clear();
        this.analysisData.clear();
    }
}

// Type definitions
type HeatmapMode = 'none' | 'complexity' | 'performance' | 'ai';

interface MinimapAnalysis {
    functions: FunctionInfo[];
    classes: ClassInfo[];
    imports: ImportInfo[];
    problems: ProblemInfo[];
    complexity: ComplexityInfo[];
    performance: PerformanceInfo[];
    aiSuggestions: AISuggestionInfo[];
    codeStructure: StructureNode[];
    metrics: CodeMetrics;
}

interface FunctionInfo {
    name: string;
    startLine: number;
    endLine: number;
    bodyLines: number;
    complexity: number;
    parameters: string[];
    isAsync: boolean;
    visibility: string;
    returnType: string;
}

interface ClassInfo {
    name: string;
    startLine: number;
    endLine: number;
    methods: string[];
    properties: string[];
    extends?: string;
    implements: string[];
}

interface ImportInfo {
    line: number;
    module: string;
    type: 'es6' | 'commonjs';
}

interface ProblemInfo {
    line: number;
    severity: vscode.DiagnosticSeverity;
    message: string;
    source: string;
    code: string;
}

interface ComplexityInfo {
    line: number;
    score: number;
    type: string;
}

interface PerformanceInfo {
    line: number;
    type: string;
    impact: 'low' | 'medium' | 'high';
    suggestion: string;
}

interface AISuggestionInfo {
    line: number;
    type: 'implementation' | 'improvement' | 'refactor';
    confidence: number;
    message: string;
    action: string;
}

interface StructureNode {
    type: string;
    name: string;
    startLine: number;
    endLine: number;
    children: StructureNode[];
}

interface CodeMetrics {
    totalLines: number;
    codeLines: number;
    commentLines: number;
    blankLines: number;
    complexity: number;
} 