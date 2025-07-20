import * as vscode from 'vscode';

/**
 * EnhancedGutter - AI-powered gutter with complexity indicators, security highlights,
 * and performance hotspot visualization
 */
export class EnhancedGutter {
    private context: vscode.ExtensionContext;
    private decorationTypes: Map<string, vscode.TextEditorDecorationType> = new Map();
    private analysisResults: Map<string, GutterAnalysis> = new Map();
    private updateTimeout: NodeJS.Timeout | undefined;
    private isEnabled = true;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.initializeDecorationTypes();
        this.setupEventListeners();
        this.analyzeActiveEditor();
    }

    private initializeDecorationTypes(): void {
        // Complexity indicators
        this.decorationTypes.set('complexity-low', vscode.window.createTextEditorDecorationType({
            gutterIconPath: this.createComplexityIcon('low'),
            gutterIconSize: 'contain',
            overviewRulerColor: '#10b981',
            overviewRulerLane: vscode.OverviewRulerLane.Left
        }));

        this.decorationTypes.set('complexity-medium', vscode.window.createTextEditorDecorationType({
            gutterIconPath: this.createComplexityIcon('medium'),
            gutterIconSize: 'contain',
            overviewRulerColor: '#f59e0b',
            overviewRulerLane: vscode.OverviewRulerLane.Left
        }));

        this.decorationTypes.set('complexity-high', vscode.window.createTextEditorDecorationType({
            gutterIconPath: this.createComplexityIcon('high'),
            gutterIconSize: 'contain',
            overviewRulerColor: '#ef4444',
            overviewRulerLane: vscode.OverviewRulerLane.Left
        }));

        // Security vulnerability indicators
        this.decorationTypes.set('security-critical', vscode.window.createTextEditorDecorationType({
            gutterIconPath: this.createSecurityIcon('critical'),
            gutterIconSize: 'contain',
            overviewRulerColor: '#dc2626',
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            backgroundColor: 'rgba(220, 38, 38, 0.1)'
        }));

        this.decorationTypes.set('security-warning', vscode.window.createTextEditorDecorationType({
            gutterIconPath: this.createSecurityIcon('warning'),
            gutterIconSize: 'contain',
            overviewRulerColor: '#f59e0b',
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            backgroundColor: 'rgba(245, 158, 11, 0.1)'
        }));

        // Performance hotspots
        this.decorationTypes.set('performance-slow', vscode.window.createTextEditorDecorationType({
            gutterIconPath: this.createPerformanceIcon('slow'),
            gutterIconSize: 'contain',
            overviewRulerColor: '#ef4444',
            overviewRulerLane: vscode.OverviewRulerLane.Center,
            backgroundColor: 'rgba(239, 68, 68, 0.1)'
        }));

        this.decorationTypes.set('performance-optimal', vscode.window.createTextEditorDecorationType({
            gutterIconPath: this.createPerformanceIcon('optimal'),
            gutterIconSize: 'contain',
            overviewRulerColor: '#10b981',
            overviewRulerLane: vscode.OverviewRulerLane.Center
        }));

        // Test coverage indicators
        this.decorationTypes.set('coverage-covered', vscode.window.createTextEditorDecorationType({
            gutterIconPath: this.createCoverageIcon('covered'),
            gutterIconSize: 'contain',
            backgroundColor: 'rgba(16, 185, 129, 0.1)'
        }));

        this.decorationTypes.set('coverage-uncovered', vscode.window.createTextEditorDecorationType({
            gutterIconPath: this.createCoverageIcon('uncovered'),
            gutterIconSize: 'contain',
            backgroundColor: 'rgba(239, 68, 68, 0.1)'
        }));

        // AI suggestions
        this.decorationTypes.set('ai-suggestion', vscode.window.createTextEditorDecorationType({
            gutterIconPath: this.createAIIcon('suggestion'),
            gutterIconSize: 'contain',
            overviewRulerColor: '#3b82f6',
            overviewRulerLane: vscode.OverviewRulerLane.Full,
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }));

        // Collaborative editing indicators
        this.decorationTypes.set('collaboration-user1', vscode.window.createTextEditorDecorationType({
            gutterIconPath: this.createCollaborationIcon('user1'),
            gutterIconSize: 'contain'
        }));

        this.decorationTypes.set('collaboration-user2', vscode.window.createTextEditorDecorationType({
            gutterIconPath: this.createCollaborationIcon('user2'),
            gutterIconSize: 'contain'
        }));

        // 3D structure preview
        this.decorationTypes.set('3d-preview', vscode.window.createTextEditorDecorationType({
            gutterIconPath: this.create3DIcon(),
            gutterIconSize: 'contain',
            backgroundColor: 'rgba(59, 130, 246, 0.05)'
        }));
    }

    private setupEventListeners(): void {
        // Analyze when editor changes
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                this.analyzeEditor(editor);
            }
        });

        // Re-analyze when text changes (debounced)
        vscode.workspace.onDidChangeTextDocument(event => {
            if (vscode.window.activeTextEditor?.document === event.document) {
                this.scheduleAnalysis();
            }
        });

        // Re-analyze when configuration changes
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('aura.gutter')) {
                this.updateConfiguration();
                this.analyzeActiveEditor();
            }
        });

        // Update decorations when selection changes
        vscode.window.onDidChangeTextEditorSelection(event => {
            this.updateContextualDecorations(event.textEditor);
        });
    }

    private scheduleAnalysis(): void {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = setTimeout(() => {
            this.analyzeActiveEditor();
        }, 500); // Debounce for 500ms
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
            // Perform comprehensive analysis
            const analysis = await this.performAnalysis(document);
            this.analysisResults.set(documentUri, analysis);

            // Apply decorations
            this.applyDecorations(editor, analysis);

        } catch (error) {
            console.error('Gutter analysis failed:', error);
        }
    }

    private async performAnalysis(document: vscode.TextDocument): Promise<GutterAnalysis> {
        const text = document.getText();
        const lines = text.split('\n');

        const analysis: GutterAnalysis = {
            complexity: [],
            security: [],
            performance: [],
            coverage: [],
            aiSuggestions: [],
            collaboration: [],
            structure3D: []
        };

        // Analyze each line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i;

            // Complexity analysis
            const complexity = this.analyzeComplexity(line, lines, lineNumber);
            if (complexity.level !== 'none') {
                analysis.complexity.push({
                    line: lineNumber,
                    level: complexity.level,
                    score: complexity.score,
                    description: complexity.description
                });
            }

            // Security analysis
            const security = this.analyzeSecurityIssues(line, lineNumber);
            if (security.length > 0) {
                analysis.security.push(...security);
            }

            // Performance analysis
            const performance = this.analyzePerformance(line, lineNumber);
            if (performance.level !== 'normal') {
                analysis.performance.push({
                    line: lineNumber,
                    level: performance.level,
                    impact: performance.impact,
                    suggestion: performance.suggestion
                });
            }

            // AI suggestions
            const aiSuggestion = await this.generateAISuggestion(line, lineNumber, document);
            if (aiSuggestion) {
                analysis.aiSuggestions.push(aiSuggestion);
            }

            // 3D structure analysis
            if (this.isStructuralElement(line)) {
                analysis.structure3D.push({
                    line: lineNumber,
                    type: this.getStructureType(line),
                    depth: this.calculateDepth(lines, lineNumber)
                });
            }
        }

        // Get test coverage data
        analysis.coverage = await this.getTestCoverage(document);

        return analysis;
    }

    private analyzeComplexity(line: string, allLines: string[], lineNumber: number): ComplexityResult {
        const trimmed = line.trim();
        let score = 0;
        let factors: string[] = [];

        // Cyclomatic complexity factors
        if (trimmed.includes('if') || trimmed.includes('else')) {
            score += 1;
            factors.push('conditional');
        }
        if (trimmed.includes('for') || trimmed.includes('while') || trimmed.includes('do')) {
            score += 2;
            factors.push('loop');
        }
        if (trimmed.includes('switch') || trimmed.includes('case')) {
            score += 1;
            factors.push('switch');
        }
        if (trimmed.includes('try') || trimmed.includes('catch')) {
            score += 1;
            factors.push('exception');
        }
        if (trimmed.includes('&&') || trimmed.includes('||')) {
            score += 1;
            factors.push('logical');
        }

        // Nested complexity
        const indentLevel = line.length - line.trimStart().length;
        if (indentLevel > 12) {
            score += Math.floor(indentLevel / 4);
            factors.push('nesting');
        }

        // Function complexity
        if (trimmed.includes('function') && this.isLongFunction(allLines, lineNumber)) {
            score += 2;
            factors.push('long-function');
        }

        let level: ComplexityLevel = 'none';
        if (score >= 5) level = 'high';
        else if (score >= 3) level = 'medium';
        else if (score >= 1) level = 'low';

        return {
            level,
            score,
            description: factors.length > 0 ? `Complexity factors: ${factors.join(', ')}` : ''
        };
    }

    private analyzeSecurityIssues(line: string, lineNumber: number): SecurityIssue[] {
        const issues: SecurityIssue[] = [];
        const trimmed = line.trim().toLowerCase();

        // SQL injection risks
        if (trimmed.includes('sql') && (trimmed.includes('+') || trimmed.includes('${') || trimmed.includes('"'))) {
            issues.push({
                line: lineNumber,
                type: 'sql-injection',
                severity: 'critical',
                description: 'Potential SQL injection vulnerability',
                suggestion: 'Use parameterized queries or prepared statements'
            });
        }

        // XSS risks
        if (trimmed.includes('innerhtml') || trimmed.includes('document.write')) {
            issues.push({
                line: lineNumber,
                type: 'xss',
                severity: 'critical',
                description: 'Potential XSS vulnerability',
                suggestion: 'Use textContent or sanitize input'
            });
        }

        // Hardcoded secrets
        if (this.containsHardcodedSecret(line)) {
            issues.push({
                line: lineNumber,
                type: 'hardcoded-secret',
                severity: 'critical',
                description: 'Hardcoded secret detected',
                suggestion: 'Move secrets to environment variables'
            });
        }

        // Insecure random
        if (trimmed.includes('math.random') && this.isSecurityContext(line)) {
            issues.push({
                line: lineNumber,
                type: 'weak-random',
                severity: 'warning',
                description: 'Weak random number generation',
                suggestion: 'Use cryptographically secure random functions'
            });
        }

        return issues;
    }

    private analyzePerformance(line: string, lineNumber: number): PerformanceResult {
        const trimmed = line.trim().toLowerCase();
        
        // Performance anti-patterns
        if (trimmed.includes('document.getelementbyid') && trimmed.includes('for')) {
            return {
                level: 'slow',
                impact: 'high',
                suggestion: 'Cache DOM queries outside loops'
            };
        }

        if (trimmed.includes('nested loop') || (trimmed.includes('for') && this.isNestedLoop(line))) {
            return {
                level: 'slow',
                impact: 'medium',
                suggestion: 'Consider algorithm optimization'
            };
        }

        if (trimmed.includes('json.parse') || trimmed.includes('json.stringify')) {
            return {
                level: 'slow',
                impact: 'low',
                suggestion: 'Consider streaming or caching for large objects'
            };
        }

        return { level: 'normal', impact: 'none', suggestion: '' };
    }

    private async generateAISuggestion(line: string, lineNumber: number, document: vscode.TextDocument): Promise<AISuggestion | null> {
        // This would integrate with the AI engine
        const trimmed = line.trim();
        
        // Simple heuristics for demonstration
        if (trimmed.includes('TODO') || trimmed.includes('FIXME')) {
            return {
                line: lineNumber,
                type: 'improvement',
                confidence: 0.8,
                suggestion: 'AI can help implement this functionality',
                action: 'aura.ai.implementTodo'
            };
        }

        if (trimmed.includes('console.log') && document.languageId === 'typescript') {
            return {
                line: lineNumber,
                type: 'refactor',
                confidence: 0.6,
                suggestion: 'Consider using proper logging framework',
                action: 'aura.ai.improveLogging'
            };
        }

        return null;
    }

    private applyDecorations(editor: vscode.TextEditor, analysis: GutterAnalysis): void {
        // Clear existing decorations
        this.decorationTypes.forEach(decorationType => {
            editor.setDecorations(decorationType, []);
        });

        // Apply complexity decorations
        const complexityRanges: Map<string, vscode.Range[]> = new Map();
        analysis.complexity.forEach(item => {
            const range = new vscode.Range(item.line, 0, item.line, 0);
            const key = `complexity-${item.level}`;
            if (!complexityRanges.has(key)) {
                complexityRanges.set(key, []);
            }
            complexityRanges.get(key)!.push(range);
        });

        complexityRanges.forEach((ranges, key) => {
            const decorationType = this.decorationTypes.get(key);
            if (decorationType) {
                editor.setDecorations(decorationType, ranges.map(range => ({
                    range,
                    hoverMessage: this.getComplexityHoverMessage(analysis.complexity.find(c => c.line === range.start.line))
                })));
            }
        });

        // Apply security decorations
        const securityRanges: Map<string, vscode.DecorationOptions[]> = new Map();
        analysis.security.forEach(issue => {
            const range = new vscode.Range(issue.line, 0, issue.line, 0);
            const key = `security-${issue.severity}`;
            if (!securityRanges.has(key)) {
                securityRanges.set(key, []);
            }
            securityRanges.get(key)!.push({
                range,
                hoverMessage: this.getSecurityHoverMessage(issue)
            });
        });

        securityRanges.forEach((options, key) => {
            const decorationType = this.decorationTypes.get(key);
            if (decorationType) {
                editor.setDecorations(decorationType, options);
            }
        });

        // Apply performance decorations
        const performanceRanges: vscode.DecorationOptions[] = [];
        analysis.performance.forEach(item => {
            const range = new vscode.Range(item.line, 0, item.line, 0);
            performanceRanges.push({
                range,
                hoverMessage: this.getPerformanceHoverMessage(item)
            });
        });

        const performanceDecoration = this.decorationTypes.get('performance-slow');
        if (performanceDecoration) {
            editor.setDecorations(performanceDecoration, performanceRanges);
        }

        // Apply AI suggestion decorations
        const aiRanges: vscode.DecorationOptions[] = [];
        analysis.aiSuggestions.forEach(suggestion => {
            const range = new vscode.Range(suggestion.line, 0, suggestion.line, 0);
            aiRanges.push({
                range,
                hoverMessage: this.getAISuggestionHoverMessage(suggestion)
            });
        });

        const aiDecoration = this.decorationTypes.get('ai-suggestion');
        if (aiDecoration) {
            editor.setDecorations(aiDecoration, aiRanges);
        }

        // Apply 3D structure decorations
        const structure3DRanges: vscode.Range[] = [];
        analysis.structure3D.forEach(item => {
            const range = new vscode.Range(item.line, 0, item.line, 0);
            structure3DRanges.push(range);
        });

        const structure3DDecoration = this.decorationTypes.get('3d-preview');
        if (structure3DDecoration) {
            editor.setDecorations(structure3DDecoration, structure3DRanges);
        }
    }

    // Helper methods for creating icons (these would return actual icon URIs)
    private createComplexityIcon(level: string): vscode.Uri {
        // This would create or return paths to actual icon files
        return vscode.Uri.parse(`data:image/svg+xml;base64,${this.generateIconSVG(level, 'complexity')}`);
    }

    private createSecurityIcon(severity: string): vscode.Uri {
        return vscode.Uri.parse(`data:image/svg+xml;base64,${this.generateIconSVG(severity, 'security')}`);
    }

    private createPerformanceIcon(level: string): vscode.Uri {
        return vscode.Uri.parse(`data:image/svg+xml;base64,${this.generateIconSVG(level, 'performance')}`);
    }

    private createCoverageIcon(status: string): vscode.Uri {
        return vscode.Uri.parse(`data:image/svg+xml;base64,${this.generateIconSVG(status, 'coverage')}`);
    }

    private createAIIcon(type: string): vscode.Uri {
        return vscode.Uri.parse(`data:image/svg+xml;base64,${this.generateIconSVG(type, 'ai')}`);
    }

    private createCollaborationIcon(user: string): vscode.Uri {
        return vscode.Uri.parse(`data:image/svg+xml;base64,${this.generateIconSVG(user, 'collaboration')}`);
    }

    private create3DIcon(): vscode.Uri {
        return vscode.Uri.parse(`data:image/svg+xml;base64,${this.generateIconSVG('3d', 'structure')}`);
    }

    private generateIconSVG(type: string, category: string): string {
        // Generate base64 encoded SVG icons
        const colors = {
            complexity: { low: '#10b981', medium: '#f59e0b', high: '#ef4444' },
            security: { warning: '#f59e0b', critical: '#dc2626' },
            performance: { slow: '#ef4444', optimal: '#10b981' },
            coverage: { covered: '#10b981', uncovered: '#ef4444' },
            ai: { suggestion: '#3b82f6' },
            collaboration: { user1: '#8b5cf6', user2: '#06b6d4' },
            structure: { '3d': '#3b82f6' }
        };

        const color = (colors as any)[category]?.[type] || '#64748b';
        const svg = `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="6" fill="${color}" opacity="0.8"/>
            <text x="8" y="11" text-anchor="middle" fill="white" font-size="8" font-weight="bold">${type[0].toUpperCase()}</text>
        </svg>`;

        return Buffer.from(svg).toString('base64');
    }

    // Helper methods for hover messages
    private getComplexityHoverMessage(complexity: ComplexityInfo | undefined): vscode.MarkdownString {
        if (!complexity) return new vscode.MarkdownString('');
        
        const message = new vscode.MarkdownString();
        message.appendMarkdown(`**Complexity: ${complexity.level.toUpperCase()}** (Score: ${complexity.score})\n\n`);
        message.appendMarkdown(complexity.description);
        message.appendMarkdown('\n\n[Refactor Code](command:aura.ai.refactorComplexity)');
        return message;
    }

    private getSecurityHoverMessage(issue: SecurityIssue): vscode.MarkdownString {
        const message = new vscode.MarkdownString();
        message.appendMarkdown(`**Security ${issue.severity.toUpperCase()}: ${issue.type}**\n\n`);
        message.appendMarkdown(issue.description);
        message.appendMarkdown(`\n\n**Suggestion:** ${issue.suggestion}`);
        message.appendMarkdown('\n\n[Fix Security Issue](command:aura.ai.fixSecurity)');
        return message;
    }

    private getPerformanceHoverMessage(perf: PerformanceInfo): vscode.MarkdownString {
        const message = new vscode.MarkdownString();
        message.appendMarkdown(`**Performance Impact: ${perf.impact.toUpperCase()}**\n\n`);
        message.appendMarkdown(perf.suggestion);
        message.appendMarkdown('\n\n[Optimize Performance](command:aura.ai.optimizePerformance)');
        return message;
    }

    private getAISuggestionHoverMessage(suggestion: AISuggestion): vscode.MarkdownString {
        const message = new vscode.MarkdownString();
        message.appendMarkdown(`**AI Suggestion** (${Math.round(suggestion.confidence * 100)}% confidence)\n\n`);
        message.appendMarkdown(suggestion.suggestion);
        message.appendMarkdown(`\n\n[Apply Suggestion](command:${suggestion.action})`);
        return message;
    }

    // Utility methods
    private isLongFunction(lines: string[], startLine: number): boolean {
        // Check if function is longer than 20 lines
        let braceCount = 0;
        for (let i = startLine; i < lines.length && i < startLine + 50; i++) {
            const line = lines[i];
            braceCount += (line.match(/{/g) || []).length;
            braceCount -= (line.match(/}/g) || []).length;
            if (braceCount === 0 && i > startLine) {
                return (i - startLine) > 20;
            }
        }
        return false;
    }

    private containsHardcodedSecret(line: string): boolean {
        const secretPatterns = [
            /password\s*=\s*["'][^"']+["']/i,
            /api[_-]?key\s*=\s*["'][^"']+["']/i,
            /secret\s*=\s*["'][^"']+["']/i,
            /token\s*=\s*["'][^"']+["']/i
        ];
        return secretPatterns.some(pattern => pattern.test(line));
    }

    private isSecurityContext(line: string): boolean {
        return line.includes('crypto') || line.includes('security') || line.includes('auth');
    }

    private isNestedLoop(line: string): boolean {
        // Simple heuristic - would need more sophisticated analysis
        return false;
    }

    private isStructuralElement(line: string): boolean {
        const trimmed = line.trim();
        return trimmed.includes('function') || 
               trimmed.includes('class') || 
               trimmed.includes('interface') ||
               trimmed.includes('type ') ||
               trimmed.includes('const ') && trimmed.includes('{');
    }

    private getStructureType(line: string): string {
        if (line.includes('function')) return 'function';
        if (line.includes('class')) return 'class';
        if (line.includes('interface')) return 'interface';
        if (line.includes('type')) return 'type';
        return 'block';
    }

    private calculateDepth(lines: string[], lineNumber: number): number {
        const line = lines[lineNumber];
        return Math.floor((line.length - line.trimStart().length) / 2);
    }

    private async getTestCoverage(document: vscode.TextDocument): Promise<CoverageInfo[]> {
        // This would integrate with test coverage tools
        return [];
    }

    private updateContextualDecorations(editor: vscode.TextEditor): void {
        // Update decorations based on current selection/context
    }

    private updateConfiguration(): void {
        const config = vscode.workspace.getConfiguration('aura.gutter');
        this.isEnabled = config.get('enabled', true);
    }

    public enable(): void {
        this.isEnabled = true;
        this.analyzeActiveEditor();
    }

    public disable(): void {
        this.isEnabled = false;
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            this.decorationTypes.forEach(decorationType => {
                editor.setDecorations(decorationType, []);
            });
        }
    }

    public dispose(): void {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        
        this.decorationTypes.forEach(decorationType => {
            decorationType.dispose();
        });
        this.decorationTypes.clear();
        this.analysisResults.clear();
    }
}

// Type definitions
type ComplexityLevel = 'none' | 'low' | 'medium' | 'high';

interface ComplexityResult {
    level: ComplexityLevel;
    score: number;
    description: string;
}

interface ComplexityInfo {
    line: number;
    level: ComplexityLevel;
    score: number;
    description: string;
}

interface SecurityIssue {
    line: number;
    type: string;
    severity: 'warning' | 'critical';
    description: string;
    suggestion: string;
}

interface PerformanceResult {
    level: 'normal' | 'slow';
    impact: 'none' | 'low' | 'medium' | 'high';
    suggestion: string;
}

interface PerformanceInfo {
    line: number;
    level: 'normal' | 'slow';
    impact: 'none' | 'low' | 'medium' | 'high';
    suggestion: string;
}

interface AISuggestion {
    line: number;
    type: 'improvement' | 'refactor' | 'fix';
    confidence: number;
    suggestion: string;
    action: string;
}

interface CoverageInfo {
    line: number;
    covered: boolean;
    hitCount: number;
}

interface CollaborationInfo {
    line: number;
    user: string;
    action: 'editing' | 'viewing';
    timestamp: Date;
}

interface Structure3DInfo {
    line: number;
    type: string;
    depth: number;
}

interface GutterAnalysis {
    complexity: ComplexityInfo[];
    security: SecurityIssue[];
    performance: PerformanceInfo[];
    coverage: CoverageInfo[];
    aiSuggestions: AISuggestion[];
    collaboration: CollaborationInfo[];
    structure3D: Structure3DInfo[];
} 