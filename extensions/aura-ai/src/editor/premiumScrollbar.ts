import * as vscode from 'vscode';

/**
 * PremiumScrollbar - Enhanced scrollbar with problem markers, AI suggestions,
 * performance bottlenecks, and intelligent navigation aids
 */
export class PremiumScrollbar {
    private context: vscode.ExtensionContext;
    private decorationTypes: Map<string, vscode.TextEditorDecorationType> = new Map();
    private scrollbarData: Map<string, ScrollbarData> = new Map();
    private updateTimeout: NodeJS.Timeout | undefined;
    private isEnabled = true;
    private markerDensity: MarkerDensity = 'normal';

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.initializeDecorations();
        this.setupEventListeners();
        this.registerCommands();
        this.analyzeActiveEditor();
    }

    private initializeDecorations(): void {
        // Error markers (highest priority)
        this.decorationTypes.set('error-marker', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#ef4444',
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        // Warning markers
        this.decorationTypes.set('warning-marker', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#f59e0b',
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        // Info markers
        this.decorationTypes.set('info-marker', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#3b82f6',
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        // Search result markers
        this.decorationTypes.set('search-marker', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#fbbf24',
            overviewRulerLane: vscode.OverviewRulerLane.Left,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        // AI suggestion markers
        this.decorationTypes.set('ai-suggestion-marker', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#06b6d4',
            overviewRulerLane: vscode.OverviewRulerLane.Center,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        // Performance bottleneck markers
        this.decorationTypes.set('performance-marker', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#ec4899',
            overviewRulerLane: vscode.OverviewRulerLane.Full,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        // Security vulnerability markers
        this.decorationTypes.set('security-marker', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#dc2626',
            overviewRulerLane: vscode.OverviewRulerLane.Full,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        // Git change markers
        this.decorationTypes.set('git-addition', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#10b981',
            overviewRulerLane: vscode.OverviewRulerLane.Left,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        this.decorationTypes.set('git-modification', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#3b82f6',
            overviewRulerLane: vscode.OverviewRulerLane.Left,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        this.decorationTypes.set('git-deletion', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#ef4444',
            overviewRulerLane: vscode.OverviewRulerLane.Left,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        // Code complexity markers
        this.decorationTypes.set('complexity-high', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#f97316',
            overviewRulerLane: vscode.OverviewRulerLane.Center,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        this.decorationTypes.set('complexity-medium', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#eab308',
            overviewRulerLane: vscode.OverviewRulerLane.Center,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        // Test coverage markers
        this.decorationTypes.set('coverage-uncovered', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#ef4444',
            overviewRulerLane: vscode.OverviewRulerLane.Full,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        this.decorationTypes.set('coverage-partial', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#f59e0b',
            overviewRulerLane: vscode.OverviewRulerLane.Full,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        // Collaboration markers
        this.decorationTypes.set('collaboration-user', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#8b5cf6',
            overviewRulerLane: vscode.OverviewRulerLane.Center,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));

        // Bookmark markers
        this.decorationTypes.set('bookmark-marker', vscode.window.createTextEditorDecorationType({
            overviewRulerColor: '#14b8a6',
            overviewRulerLane: vscode.OverviewRulerLane.Left,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        }));
    }

    private setupEventListeners(): void {
        // Update on editor changes
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                this.analyzeEditor(editor);
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

        // Update on selection changes
        vscode.window.onDidChangeTextEditorSelection(event => {
            this.updateSelectionMarkers(event.textEditor);
        });

        // Configuration changes
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('aura.scrollbar')) {
                this.updateConfiguration();
            }
        });
    }

    private registerCommands(): void {
        // Navigation commands
        vscode.commands.registerCommand('aura.scrollbar.nextError', () => {
            this.navigateToNext('error');
        });

        vscode.commands.registerCommand('aura.scrollbar.prevError', () => {
            this.navigateToPrevious('error');
        });

        vscode.commands.registerCommand('aura.scrollbar.nextWarning', () => {
            this.navigateToNext('warning');
        });

        vscode.commands.registerCommand('aura.scrollbar.nextAISuggestion', () => {
            this.navigateToNext('ai-suggestion');
        });

        vscode.commands.registerCommand('aura.scrollbar.nextPerformanceIssue', () => {
            this.navigateToNext('performance');
        });

        // Marker density control
        vscode.commands.registerCommand('aura.scrollbar.increaseDensity', () => {
            this.adjustMarkerDensity('increase');
        });

        vscode.commands.registerCommand('aura.scrollbar.decreaseDensity', () => {
            this.adjustMarkerDensity('decrease');
        });

        // Toggle marker types
        vscode.commands.registerCommand('aura.scrollbar.toggleComplexityMarkers', () => {
            this.toggleMarkerType('complexity');
        });

        vscode.commands.registerCommand('aura.scrollbar.togglePerformanceMarkers', () => {
            this.toggleMarkerType('performance');
        });

        vscode.commands.registerCommand('aura.scrollbar.toggleAIMarkers', () => {
            this.toggleMarkerType('ai');
        });

        // Overview and statistics
        vscode.commands.registerCommand('aura.scrollbar.showOverview', () => {
            this.showScrollbarOverview();
        });
    }

    private scheduleUpdate(): void {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = setTimeout(() => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                this.analyzeEditor(editor);
            }
        }, 200);
    }

    public analyzeActiveEditor(): void {
        const editor = vscode.window.activeTextEditor;
        if (editor && this.isEnabled) {
            this.analyzeEditor(editor);
        }
    }

    private async analyzeEditor(editor: vscode.TextEditor): Promise<void> {
        const document = editor.document;
        const documentUri = document.uri.toString();

        try {
            const scrollbarData = await this.analyzeScrollbarData(document);
            this.scrollbarData.set(documentUri, scrollbarData);

            // Apply all markers
            this.applyScrollbarMarkers(editor, scrollbarData);

        } catch (error) {
            console.error('Scrollbar analysis failed:', error);
        }
    }

    private async analyzeScrollbarData(document: vscode.TextDocument): Promise<ScrollbarData> {
        const text = document.getText();
        const lines = text.split('\n');

        const data: ScrollbarData = {
            problems: [],
            aiSuggestions: [],
            performance: [],
            security: [],
            complexity: [],
            gitChanges: [],
            coverage: [],
            collaboration: [],
            bookmarks: [],
            searchResults: [],
            statistics: {
                totalMarkers: 0,
                errorCount: 0,
                warningCount: 0,
                suggestionCount: 0,
                performanceIssues: 0
            }
        };

        // Get diagnostic problems
        data.problems = await this.extractDiagnosticProblems(document);

        // Analyze AI suggestions
        data.aiSuggestions = await this.analyzeAISuggestions(document, lines);

        // Analyze performance issues
        data.performance = await this.analyzePerformanceIssues(document, lines);

        // Analyze security vulnerabilities
        data.security = await this.analyzeSecurityIssues(document, lines);

        // Analyze code complexity
        data.complexity = await this.analyzeComplexity(document, lines);

        // Get Git changes
        data.gitChanges = await this.analyzeGitChanges(document);

        // Get test coverage (if available)
        data.coverage = await this.analyzeCoverage(document);

        // Get collaboration data
        data.collaboration = await this.analyzeCollaboration(document);

        // Get bookmarks
        data.bookmarks = await this.analyzeBookmarks(document);

        // Calculate statistics
        data.statistics = this.calculateStatistics(data);

        return data;
    }

    private async extractDiagnosticProblems(document: vscode.TextDocument): Promise<ProblemMarker[]> {
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        
        return diagnostics.map(diagnostic => ({
            line: diagnostic.range.start.line,
            severity: diagnostic.severity || vscode.DiagnosticSeverity.Information,
            message: diagnostic.message,
            source: diagnostic.source || 'unknown',
            range: diagnostic.range
        }));
    }

    private async analyzeAISuggestions(document: vscode.TextDocument, lines: string[]): Promise<AISuggestionMarker[]> {
        const suggestions: AISuggestionMarker[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Detect TODO/FIXME comments
            if (line.includes('TODO') || line.includes('FIXME') || line.includes('HACK')) {
                suggestions.push({
                    line: i,
                    type: 'implementation',
                    confidence: 0.8,
                    message: 'AI can help implement this functionality',
                    priority: 'medium'
                });
            }

            // Detect potential improvements
            if (line.includes('console.log') && document.languageId !== 'javascript') {
                suggestions.push({
                    line: i,
                    type: 'improvement',
                    confidence: 0.6,
                    message: 'Consider using proper logging framework',
                    priority: 'low'
                });
            }

            // Detect code smells
            if (this.detectCodeSmell(line)) {
                suggestions.push({
                    line: i,
                    type: 'refactor',
                    confidence: 0.7,
                    message: 'Code smell detected - consider refactoring',
                    priority: 'medium'
                });
            }
        }

        return suggestions;
    }

    private async analyzePerformanceIssues(document: vscode.TextDocument, lines: string[]): Promise<PerformanceMarker[]> {
        const issues: PerformanceMarker[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim().toLowerCase();

            // Nested loops
            if (this.isNestedLoop(lines, i)) {
                issues.push({
                    line: i,
                    type: 'nested-loop',
                    impact: 'high',
                    suggestion: 'Consider algorithm optimization',
                    estimatedCost: 'O(n²) or higher'
                });
            }

            // DOM queries in loops
            if (line.includes('for') && (line.includes('getelementbyid') || line.includes('queryselector'))) {
                issues.push({
                    line: i,
                    type: 'dom-in-loop',
                    impact: 'medium',
                    suggestion: 'Cache DOM queries outside loop',
                    estimatedCost: 'DOM reflow per iteration'
                });
            }

            // Large object operations
            if (line.includes('json.parse') || line.includes('json.stringify')) {
                issues.push({
                    line: i,
                    type: 'large-object',
                    impact: 'low',
                    suggestion: 'Consider streaming for large objects',
                    estimatedCost: 'Memory allocation spike'
                });
            }

            // Synchronous file operations
            if (line.includes('fs.readfilesync') || line.includes('fs.writefilesync')) {
                issues.push({
                    line: i,
                    type: 'sync-io',
                    impact: 'high',
                    suggestion: 'Use async file operations',
                    estimatedCost: 'Blocks event loop'
                });
            }
        }

        return issues;
    }

    private async analyzeSecurityIssues(document: vscode.TextDocument, lines: string[]): Promise<SecurityMarker[]> {
        const issues: SecurityMarker[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // SQL injection risks
            if (this.hasSQLInjectionRisk(line)) {
                issues.push({
                    line: i,
                    type: 'sql-injection',
                    severity: 'critical',
                    description: 'Potential SQL injection vulnerability',
                    cwe: 'CWE-89'
                });
            }

            // XSS risks
            if (line.includes('innerHTML') || line.includes('document.write')) {
                issues.push({
                    line: i,
                    type: 'xss',
                    severity: 'high',
                    description: 'Potential XSS vulnerability',
                    cwe: 'CWE-79'
                });
            }

            // Hardcoded secrets
            if (this.hasHardcodedSecret(line)) {
                issues.push({
                    line: i,
                    type: 'hardcoded-secret',
                    severity: 'critical',
                    description: 'Hardcoded secret detected',
                    cwe: 'CWE-798'
                });
            }

            // Insecure random
            if (line.includes('Math.random') && this.isSecurityContext(line)) {
                issues.push({
                    line: i,
                    type: 'weak-random',
                    severity: 'medium',
                    description: 'Weak random number generation',
                    cwe: 'CWE-338'
                });
            }
        }

        return issues;
    }

    private async analyzeComplexity(document: vscode.TextDocument, lines: string[]): Promise<ComplexityMarker[]> {
        const complexity: ComplexityMarker[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const score = this.calculateLineComplexity(line);

            if (score >= 3) {
                complexity.push({
                    line: i,
                    score,
                    level: score >= 5 ? 'high' : 'medium',
                    factors: this.getComplexityFactors(line)
                });
            }
        }

        return complexity;
    }

    private async analyzeGitChanges(document: vscode.TextDocument): Promise<GitChangeMarker[]> {
        // This would integrate with Git API to get actual changes
        // For now, return empty array
        return [];
    }

    private async analyzeCoverage(document: vscode.TextDocument): Promise<CoverageMarker[]> {
        // This would integrate with coverage tools
        // For now, return empty array
        return [];
    }

    private async analyzeCollaboration(document: vscode.TextDocument): Promise<CollaborationMarker[]> {
        // This would integrate with collaboration features
        // For now, return empty array
        return [];
    }

    private async analyzeBookmarks(document: vscode.TextDocument): Promise<BookmarkMarker[]> {
        // This would integrate with bookmark systems
        // For now, return empty array
        return [];
    }

    private calculateStatistics(data: ScrollbarData): ScrollbarStatistics {
        const errorCount = data.problems.filter(p => p.severity === vscode.DiagnosticSeverity.Error).length;
        const warningCount = data.problems.filter(p => p.severity === vscode.DiagnosticSeverity.Warning).length;

        return {
            totalMarkers: data.problems.length + data.aiSuggestions.length + data.performance.length + data.security.length,
            errorCount,
            warningCount,
            suggestionCount: data.aiSuggestions.length,
            performanceIssues: data.performance.length
        };
    }

    private applyScrollbarMarkers(editor: vscode.TextEditor, data: ScrollbarData): void {
        // Clear existing decorations
        this.decorationTypes.forEach(decoration => {
            editor.setDecorations(decoration, []);
        });

        // Apply problem markers
        this.applyProblemMarkers(editor, data.problems);

        // Apply AI suggestion markers
        this.applyAISuggestionMarkers(editor, data.aiSuggestions);

        // Apply performance markers
        this.applyPerformanceMarkers(editor, data.performance);

        // Apply security markers
        this.applySecurityMarkers(editor, data.security);

        // Apply complexity markers
        this.applyComplexityMarkers(editor, data.complexity);

        // Apply Git change markers
        this.applyGitChangeMarkers(editor, data.gitChanges);

        // Apply coverage markers
        this.applyCoverageMarkers(editor, data.coverage);

        // Apply collaboration markers
        this.applyCollaborationMarkers(editor, data.collaboration);

        // Apply bookmark markers
        this.applyBookmarkMarkers(editor, data.bookmarks);
    }

    private applyProblemMarkers(editor: vscode.TextEditor, problems: ProblemMarker[]): void {
        const errorRanges: vscode.DecorationOptions[] = [];
        const warningRanges: vscode.DecorationOptions[] = [];
        const infoRanges: vscode.DecorationOptions[] = [];

        problems.forEach(problem => {
            const decoration: vscode.DecorationOptions = {
                range: new vscode.Range(problem.line, 0, problem.line, 0),
                hoverMessage: `${problem.source}: ${problem.message}`
            };

            switch (problem.severity) {
                case vscode.DiagnosticSeverity.Error:
                    errorRanges.push(decoration);
                    break;
                case vscode.DiagnosticSeverity.Warning:
                    warningRanges.push(decoration);
                    break;
                default:
                    infoRanges.push(decoration);
                    break;
            }
        });

        editor.setDecorations(this.decorationTypes.get('error-marker')!, errorRanges);
        editor.setDecorations(this.decorationTypes.get('warning-marker')!, warningRanges);
        editor.setDecorations(this.decorationTypes.get('info-marker')!, infoRanges);
    }

    private applyAISuggestionMarkers(editor: vscode.TextEditor, suggestions: AISuggestionMarker[]): void {
        const ranges: vscode.DecorationOptions[] = suggestions.map(suggestion => ({
            range: new vscode.Range(suggestion.line, 0, suggestion.line, 0),
            hoverMessage: `AI Suggestion (${Math.round(suggestion.confidence * 100)}%): ${suggestion.message}`
        }));

        editor.setDecorations(this.decorationTypes.get('ai-suggestion-marker')!, ranges);
    }

    private applyPerformanceMarkers(editor: vscode.TextEditor, performance: PerformanceMarker[]): void {
        const ranges: vscode.DecorationOptions[] = performance.map(perf => ({
            range: new vscode.Range(perf.line, 0, perf.line, 0),
            hoverMessage: `Performance Issue (${perf.impact}): ${perf.suggestion}\nEstimated Cost: ${perf.estimatedCost}`
        }));

        editor.setDecorations(this.decorationTypes.get('performance-marker')!, ranges);
    }

    private applySecurityMarkers(editor: vscode.TextEditor, security: SecurityMarker[]): void {
        const ranges: vscode.DecorationOptions[] = security.map(sec => ({
            range: new vscode.Range(sec.line, 0, sec.line, 0),
            hoverMessage: `Security Issue (${sec.severity}): ${sec.description}\nCWE: ${sec.cwe}`
        }));

        editor.setDecorations(this.decorationTypes.get('security-marker')!, ranges);
    }

    private applyComplexityMarkers(editor: vscode.TextEditor, complexity: ComplexityMarker[]): void {
        const highRanges: vscode.DecorationOptions[] = [];
        const mediumRanges: vscode.DecorationOptions[] = [];

        complexity.forEach(comp => {
            const decoration: vscode.DecorationOptions = {
                range: new vscode.Range(comp.line, 0, comp.line, 0),
                hoverMessage: `Complexity Score: ${comp.score}\nFactors: ${comp.factors.join(', ')}`
            };

            if (comp.level === 'high') {
                highRanges.push(decoration);
            } else {
                mediumRanges.push(decoration);
            }
        });

        editor.setDecorations(this.decorationTypes.get('complexity-high')!, highRanges);
        editor.setDecorations(this.decorationTypes.get('complexity-medium')!, mediumRanges);
    }

    private applyGitChangeMarkers(editor: vscode.TextEditor, changes: GitChangeMarker[]): void {
        // Implementation would apply Git change markers
    }

    private applyCoverageMarkers(editor: vscode.TextEditor, coverage: CoverageMarker[]): void {
        // Implementation would apply coverage markers
    }

    private applyCollaborationMarkers(editor: vscode.TextEditor, collaboration: CollaborationMarker[]): void {
        // Implementation would apply collaboration markers
    }

    private applyBookmarkMarkers(editor: vscode.TextEditor, bookmarks: BookmarkMarker[]): void {
        // Implementation would apply bookmark markers
    }

    private updateDiagnosticMarkers(editor: vscode.TextEditor): void {
        this.analyzeEditor(editor);
    }

    private updateSelectionMarkers(editor: vscode.TextEditor): void {
        // Could highlight related markers based on current selection
    }

    // Navigation methods
    private navigateToNext(markerType: string): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const data = this.scrollbarData.get(editor.document.uri.toString());
        if (!data) return;

        const currentLine = editor.selection.active.line;
        let markers: { line: number }[] = [];

        switch (markerType) {
            case 'error':
                markers = data.problems.filter(p => p.severity === vscode.DiagnosticSeverity.Error);
                break;
            case 'warning':
                markers = data.problems.filter(p => p.severity === vscode.DiagnosticSeverity.Warning);
                break;
            case 'ai-suggestion':
                markers = data.aiSuggestions;
                break;
            case 'performance':
                markers = data.performance;
                break;
        }

        const nextMarker = markers.find(m => m.line > currentLine) || markers[0];
        if (nextMarker) {
            this.jumpToLine(nextMarker.line);
        }
    }

    private navigateToPrevious(markerType: string): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const data = this.scrollbarData.get(editor.document.uri.toString());
        if (!data) return;

        const currentLine = editor.selection.active.line;
        let markers: { line: number }[] = [];

        switch (markerType) {
            case 'error':
                markers = data.problems.filter(p => p.severity === vscode.DiagnosticSeverity.Error);
                break;
            case 'warning':
                markers = data.problems.filter(p => p.severity === vscode.DiagnosticSeverity.Warning);
                break;
            case 'ai-suggestion':
                markers = data.aiSuggestions;
                break;
            case 'performance':
                markers = data.performance;
                break;
        }

        const reversedMarkers = [...markers].reverse();
        const prevMarker = reversedMarkers.find(m => m.line < currentLine) || reversedMarkers[0];
        if (prevMarker) {
            this.jumpToLine(prevMarker.line);
        }
    }

    private jumpToLine(line: number): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const position = new vscode.Position(line, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
    }

    private adjustMarkerDensity(direction: 'increase' | 'decrease'): void {
        const densities: MarkerDensity[] = ['minimal', 'normal', 'detailed', 'verbose'];
        const currentIndex = densities.indexOf(this.markerDensity);
        
        if (direction === 'increase' && currentIndex < densities.length - 1) {
            this.markerDensity = densities[currentIndex + 1];
        } else if (direction === 'decrease' && currentIndex > 0) {
            this.markerDensity = densities[currentIndex - 1];
        }

        this.analyzeActiveEditor();
        vscode.window.showInformationMessage(`Marker density: ${this.markerDensity}`);
    }

    private toggleMarkerType(type: string): void {
        // Toggle visibility of specific marker types
        const config = vscode.workspace.getConfiguration('aura.scrollbar');
        const currentValue = config.get(`show${type.charAt(0).toUpperCase() + type.slice(1)}Markers`, true);
        config.update(`show${type.charAt(0).toUpperCase() + type.slice(1)}Markers`, !currentValue, true);
    }

    private showScrollbarOverview(): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const data = this.scrollbarData.get(editor.document.uri.toString());
        if (!data) return;

        const overview = this.generateOverview(data);
        
        vscode.window.showInformationMessage(
            'Scrollbar Overview',
            { modal: true, detail: overview }
        );
    }

    private generateOverview(data: ScrollbarData): string {
        const stats = data.statistics;
        
        return `File Analysis Overview:
        
📊 Statistics:
• Total Markers: ${stats.totalMarkers}
• Errors: ${stats.errorCount}
• Warnings: ${stats.warningCount}
• AI Suggestions: ${stats.suggestionCount}
• Performance Issues: ${stats.performanceIssues}

🛡️ Security Issues: ${data.security.length}
🔧 Complexity Issues: ${data.complexity.length}
📚 Coverage Gaps: ${data.coverage.length}

Use Ctrl+Shift+P and search for "Aura Scrollbar" commands to navigate between markers.`;
    }

    // Helper methods
    private detectCodeSmell(line: string): boolean {
        const smells = [
            'debugger',
            'alert(',
            'confirm(',
            'prompt(',
            'document.write',
            'eval(',
            'with(',
            'arguments.callee'
        ];
        
        return smells.some(smell => line.includes(smell));
    }

    private isNestedLoop(lines: string[], lineIndex: number): boolean {
        const line = lines[lineIndex].trim();
        if (!line.includes('for') && !line.includes('while')) return false;

        // Check if we're already inside a loop
        let braceCount = 0;
        for (let i = lineIndex - 1; i >= 0; i--) {
            const prevLine = lines[i];
            braceCount += (prevLine.match(/{/g) || []).length;
            braceCount -= (prevLine.match(/}/g) || []).length;
            
            if (braceCount === 0) break;
            
            if (prevLine.includes('for') || prevLine.includes('while')) {
                return true;
            }
        }
        
        return false;
    }

    private hasSQLInjectionRisk(line: string): boolean {
        const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP'];
        const hasSQL = sqlKeywords.some(keyword => line.toUpperCase().includes(keyword));
        const hasConcatenation = line.includes('+') || line.includes('${') || line.includes('`');
        
        return hasSQL && hasConcatenation;
    }

    private hasHardcodedSecret(line: string): boolean {
        const secretPatterns = [
            /password\s*[=:]\s*["'][^"']{8,}["']/i,
            /api[_-]?key\s*[=:]\s*["'][^"']{20,}["']/i,
            /secret\s*[=:]\s*["'][^"']{16,}["']/i,
            /token\s*[=:]\s*["'][^"']{32,}["']/i
        ];
        
        return secretPatterns.some(pattern => pattern.test(line));
    }

    private isSecurityContext(line: string): boolean {
        const securityKeywords = ['crypto', 'random', 'token', 'password', 'key', 'secret', 'auth'];
        return securityKeywords.some(keyword => line.toLowerCase().includes(keyword));
    }

    private calculateLineComplexity(line: string): number {
        let complexity = 0;
        
        // Conditional statements
        complexity += (line.match(/\bif\b/g) || []).length;
        complexity += (line.match(/\belse\b/g) || []).length;
        complexity += (line.match(/\?\s*.*\s*:/g) || []).length; // ternary
        
        // Loops
        complexity += (line.match(/\bfor\b/g) || []).length * 2;
        complexity += (line.match(/\bwhile\b/g) || []).length * 2;
        complexity += (line.match(/\bdo\b/g) || []).length * 2;
        
        // Switch statements
        complexity += (line.match(/\bcase\b/g) || []).length;
        
        // Logical operators
        complexity += (line.match(/&&/g) || []).length;
        complexity += (line.match(/\|\|/g) || []).length;
        
        // Exception handling
        complexity += (line.match(/\btry\b/g) || []).length;
        complexity += (line.match(/\bcatch\b/g) || []).length;
        
        return complexity;
    }

    private getComplexityFactors(line: string): string[] {
        const factors: string[] = [];
        
        if (line.includes('if')) factors.push('conditional');
        if (line.includes('for') || line.includes('while')) factors.push('loop');
        if (line.includes('switch') || line.includes('case')) factors.push('switch');
        if (line.includes('try') || line.includes('catch')) factors.push('exception');
        if (line.includes('&&') || line.includes('||')) factors.push('logical');
        if (line.includes('?') && line.includes(':')) factors.push('ternary');
        
        return factors;
    }

    private updateConfiguration(): void {
        const config = vscode.workspace.getConfiguration('aura.scrollbar');
        this.isEnabled = config.get('enabled', true);
        this.markerDensity = config.get('markerDensity', 'normal') as MarkerDensity;
    }

    public dispose(): void {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        
        this.decorationTypes.forEach(decoration => {
            decoration.dispose();
        });
        
        this.decorationTypes.clear();
        this.scrollbarData.clear();
    }
}

// Type definitions
type MarkerDensity = 'minimal' | 'normal' | 'detailed' | 'verbose';

interface ScrollbarData {
    problems: ProblemMarker[];
    aiSuggestions: AISuggestionMarker[];
    performance: PerformanceMarker[];
    security: SecurityMarker[];
    complexity: ComplexityMarker[];
    gitChanges: GitChangeMarker[];
    coverage: CoverageMarker[];
    collaboration: CollaborationMarker[];
    bookmarks: BookmarkMarker[];
    searchResults: SearchMarker[];
    statistics: ScrollbarStatistics;
}

interface ProblemMarker {
    line: number;
    severity: vscode.DiagnosticSeverity;
    message: string;
    source: string;
    range: vscode.Range;
}

interface AISuggestionMarker {
    line: number;
    type: 'implementation' | 'improvement' | 'refactor';
    confidence: number;
    message: string;
    priority: 'low' | 'medium' | 'high';
}

interface PerformanceMarker {
    line: number;
    type: string;
    impact: 'low' | 'medium' | 'high';
    suggestion: string;
    estimatedCost: string;
}

interface SecurityMarker {
    line: number;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    cwe: string;
}

interface ComplexityMarker {
    line: number;
    score: number;
    level: 'medium' | 'high';
    factors: string[];
}

interface GitChangeMarker {
    line: number;
    type: 'addition' | 'modification' | 'deletion';
    author: string;
    timestamp: Date;
}

interface CoverageMarker {
    line: number;
    covered: boolean;
    hitCount: number;
}

interface CollaborationMarker {
    line: number;
    user: string;
    action: 'editing' | 'viewing' | 'commenting';
    timestamp: Date;
}

interface BookmarkMarker {
    line: number;
    label: string;
    category: string;
}

interface SearchMarker {
    line: number;
    query: string;
    matchType: 'exact' | 'regex' | 'fuzzy';
}

interface ScrollbarStatistics {
    totalMarkers: number;
    errorCount: number;
    warningCount: number;
    suggestionCount: number;
    performanceIssues: number;
} 