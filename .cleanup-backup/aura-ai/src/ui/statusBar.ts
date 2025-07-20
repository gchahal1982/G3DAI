import * as vscode from 'vscode';

/**
 * Premium Status Bar System - Enhanced status bar with AI indicators and real-time feedback
 * Provides comprehensive AI status, model information, token usage, and performance metrics
 */
export class PremiumStatusBar {
    private context: vscode.ExtensionContext;
    private statusBarItems: Map<string, vscode.StatusBarItem> = new Map();
    private updateInterval: NodeJS.Timeout | undefined;
    private currentModel: string = 'No model selected';
    private tokenUsage: TokenUsage = { used: 0, limit: 1000, cost: 0 };
    private aiStatus: AIStatus = 'disconnected';
    private performanceMetrics: PerformanceMetrics = { latency: 0, throughput: 0, memory: 0 };

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.initializeStatusBar();
        this.startPeriodicUpdates();
    }

    private initializeStatusBar(): void {
        // AI Status Indicator (leftmost)
        const aiStatusItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 
            1000
        );
        aiStatusItem.command = 'aura.ai.showStatus';
        aiStatusItem.tooltip = 'Aura AI Status';
        this.statusBarItems.set('aiStatus', aiStatusItem);

        // Model Selector
        const modelItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 
            999
        );
        modelItem.command = 'aura.ai.selectModel';
        modelItem.tooltip = 'Click to change AI model';
        this.statusBarItems.set('model', modelItem);

        // Token Usage Meter
        const tokenItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 
            998
        );
        tokenItem.command = 'aura.ai.showTokenUsage';
        tokenItem.tooltip = 'Token usage and cost tracking';
        this.statusBarItems.set('tokens', tokenItem);

        // Performance Indicator
        const performanceItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 
            997
        );
        performanceItem.command = 'aura.ai.showPerformance';
        performanceItem.tooltip = 'AI performance metrics';
        this.statusBarItems.set('performance', performanceItem);

        // 3D Toggle Button
        const toggle3DItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right, 
            1000
        );
        toggle3DItem.command = 'aura.3d.toggle';
        toggle3DItem.tooltip = 'Toggle 3D code visualization';
        this.statusBarItems.set('3d', toggle3DItem);

        // Context Size Indicator
        const contextItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right, 
            999
        );
        contextItem.command = 'aura.ai.showContext';
        contextItem.tooltip = 'Current context window size';
        this.statusBarItems.set('context', contextItem);

        // Show all items
        this.statusBarItems.forEach(item => item.show());
        
        // Initial update
        this.updateAllItems();
    }

    private startPeriodicUpdates(): void {
        // Update status every 2 seconds
        this.updateInterval = setInterval(() => {
            this.updatePerformanceMetrics();
            this.updateTokenUsage();
            this.updateStatusItems();
        }, 2000);
    }

    private updateAllItems(): void {
        this.updateAIStatusItem();
        this.updateModelItem();
        this.updateTokenItem();
        this.updatePerformanceItem();
        this.update3DItem();
        this.updateContextItem();
    }

    private updateStatusItems(): void {
        this.updateAIStatusItem();
        this.updateTokenItem();
        this.updatePerformanceItem();
    }

    private updateAIStatusItem(): void {
        const statusItem = this.statusBarItems.get('aiStatus');
        if (!statusItem) return;

        const statusConfig = this.getStatusConfig(this.aiStatus);
        statusItem.text = `$(${statusConfig.icon}) Aura AI`;
        statusItem.backgroundColor = statusConfig.backgroundColor;
        statusItem.color = statusConfig.color;
        statusItem.tooltip = `Aura AI: ${statusConfig.description}`;
    }

    private updateModelItem(): void {
        const modelItem = this.statusBarItems.get('model');
        if (!modelItem) return;

        const modelDisplay = this.currentModel.length > 15 
            ? `${this.currentModel.substring(0, 12)}...`
            : this.currentModel;
            
        modelItem.text = `$(robot) ${modelDisplay}`;
        modelItem.tooltip = `Current AI Model: ${this.currentModel}\nClick to change model`;
    }

    private updateTokenItem(): void {
        const tokenItem = this.statusBarItems.get('tokens');
        if (!tokenItem) return;

        const percentage = (this.tokenUsage.used / this.tokenUsage.limit) * 100;
        const icon = this.getTokenIcon(percentage);
        const color = this.getTokenColor(percentage);
        
        tokenItem.text = `$(${icon}) ${this.formatNumber(this.tokenUsage.used)}/${this.formatNumber(this.tokenUsage.limit)}`;
        tokenItem.color = color;
        tokenItem.tooltip = this.getTokenTooltip();
    }

    private updatePerformanceItem(): void {
        const perfItem = this.statusBarItems.get('performance');
        if (!perfItem) return;

        const latencyColor = this.getLatencyColor(this.performanceMetrics.latency);
        const latencyIcon = this.getLatencyIcon(this.performanceMetrics.latency);
        
        perfItem.text = `$(${latencyIcon}) ${this.performanceMetrics.latency}ms`;
        perfItem.color = latencyColor;
        perfItem.tooltip = this.getPerformanceTooltip();
    }

    private update3DItem(): void {
        const item3D = this.statusBarItems.get('3d');
        if (!item3D) return;

        const is3DActive = vscode.workspace.getConfiguration('aura.3d').get('enabled', false);
        item3D.text = is3DActive ? '$(globe) 3D' : '$(eye) 2D';
        item3D.backgroundColor = is3DActive ? 
            new vscode.ThemeColor('statusBarItem.prominentBackground') : 
            undefined;
        item3D.tooltip = is3DActive ? 
            'Disable 3D visualization' : 
            'Enable 3D visualization';
    }

    private updateContextItem(): void {
        const contextItem = this.statusBarItems.get('context');
        if (!contextItem) return;

        const contextSize = this.getCurrentContextSize();
        const maxContext = 8192; // Default context window
        const percentage = (contextSize / maxContext) * 100;
        
        const icon = percentage > 90 ? 'warning' : 'file-text';
        const color = percentage > 90 ? '#f59e0b' : undefined;
        
        contextItem.text = `$(${icon}) ${this.formatNumber(contextSize)}`;
        contextItem.color = color;
        contextItem.tooltip = `Context: ${contextSize}/${maxContext} tokens (${percentage.toFixed(1)}%)`;
    }

    private getStatusConfig(status: AIStatus): StatusConfig {
        switch (status) {
            case 'connected':
                return {
                    icon: 'check-all',
                    color: '#10b981',
                    backgroundColor: undefined,
                    description: 'Connected and ready'
                };
            case 'processing':
                return {
                    icon: 'loading~spin',
                    color: '#3b82f6',
                    backgroundColor: undefined,
                    description: 'Processing request'
                };
            case 'error':
                return {
                    icon: 'error',
                    color: '#ef4444',
                    backgroundColor: new vscode.ThemeColor('statusBarItem.errorBackground'),
                    description: 'Connection error'
                };
            case 'rate_limited':
                return {
                    icon: 'clock',
                    color: '#f59e0b',
                    backgroundColor: new vscode.ThemeColor('statusBarItem.warningBackground'),
                    description: 'Rate limited'
                };
            default:
                return {
                    icon: 'circle-outline',
                    color: '#64748b',
                    backgroundColor: undefined,
                    description: 'Disconnected'
                };
        }
    }

    private getTokenIcon(percentage: number): string {
        if (percentage > 90) return 'warning';
        if (percentage > 75) return 'graph';
        if (percentage > 50) return 'pulse';
        return 'circle-small-filled';
    }

    private getTokenColor(percentage: number): string | undefined {
        if (percentage > 90) return '#ef4444';
        if (percentage > 75) return '#f59e0b';
        if (percentage > 50) return '#3b82f6';
        return '#10b981';
    }

    private getTokenTooltip(): string {
        const percentage = (this.tokenUsage.used / this.tokenUsage.limit) * 100;
        const costFormatted = this.tokenUsage.cost > 0 ? 
            `$${this.tokenUsage.cost.toFixed(4)}` : 
            'Free';
            
        return `Token Usage: ${this.tokenUsage.used}/${this.tokenUsage.limit} (${percentage.toFixed(1)}%)\n` +
               `Cost this session: ${costFormatted}\n` +
               `Click for detailed usage statistics`;
    }

    private getLatencyIcon(latency: number): string {
        if (latency > 2000) return 'clock';
        if (latency > 1000) return 'watch';
        if (latency > 500) return 'zap';
        return 'rocket';
    }

    private getLatencyColor(latency: number): string | undefined {
        if (latency > 2000) return '#ef4444';
        if (latency > 1000) return '#f59e0b';
        if (latency > 500) return '#3b82f6';
        return '#10b981';
    }

    private getPerformanceTooltip(): string {
        return `Performance Metrics:\n` +
               `• Latency: ${this.performanceMetrics.latency}ms\n` +
               `• Throughput: ${this.performanceMetrics.throughput} tokens/sec\n` +
               `• Memory: ${this.formatBytes(this.performanceMetrics.memory)}\n` +
               `Click for detailed performance analysis`;
    }

    private getCurrentContextSize(): number {
        // This would integrate with the active context system
        const editor = vscode.window.activeTextEditor;
        if (!editor) return 0;
        
        // Rough estimation of context size
        const document = editor.document;
        const text = document.getText();
        return Math.floor(text.length / 4); // Rough token estimation
    }

    private formatNumber(num: number): string {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    }

    private formatBytes(bytes: number): string {
        if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
        if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
        if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}KB`;
        return `${bytes}B`;
    }

    private updatePerformanceMetrics(): void {
        // Simulate performance metrics (would integrate with actual AI system)
        this.performanceMetrics = {
            latency: Math.random() * 500 + 200, // 200-700ms
            throughput: Math.random() * 50 + 10, // 10-60 tokens/sec
            memory: Math.random() * 1024 * 1024 * 500 + 1024 * 1024 * 100 // 100-600MB
        };
    }

    private updateTokenUsage(): void {
        // Simulate token usage updates (would integrate with actual AI system)
        if (this.aiStatus === 'processing') {
            this.tokenUsage.used += Math.floor(Math.random() * 10);
            this.tokenUsage.cost += Math.random() * 0.001;
        }
    }

    // Public API methods
    public setAIStatus(status: AIStatus): void {
        this.aiStatus = status;
        this.updateAIStatusItem();
    }

    public setCurrentModel(modelName: string): void {
        this.currentModel = modelName;
        this.updateModelItem();
    }

    public updateTokens(used: number, limit: number, cost: number = 0): void {
        this.tokenUsage = { used, limit, cost };
        this.updateTokenItem();
    }

    public incrementTokenUsage(tokens: number, cost: number = 0): void {
        this.tokenUsage.used += tokens;
        this.tokenUsage.cost += cost;
        this.updateTokenItem();
    }

    public setPerformanceMetrics(metrics: Partial<PerformanceMetrics>): void {
        this.performanceMetrics = { ...this.performanceMetrics, ...metrics };
        this.updatePerformanceItem();
    }

    public showProgress(message: string, cancellable: boolean = false): Thenable<void> {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: message,
            cancellable
        }, async (progress, token) => {
            this.setAIStatus('processing');
            
            return new Promise<void>((resolve) => {
                let currentProgress = 0;
                const progressInterval = setInterval(() => {
                    if (token.isCancellationRequested || currentProgress >= 100) {
                        clearInterval(progressInterval);
                        this.setAIStatus('connected');
                        resolve();
                        return;
                    }
                    
                    currentProgress += 10;
                    progress.report({ 
                        message: `${message} (${currentProgress}%)`,
                        increment: 10 
                    });
                }, 200);
            });
        });
    }

    public showNotification(
        message: string, 
        type: 'info' | 'warning' | 'error' = 'info',
        actions?: string[]
    ): Thenable<string | undefined> {
        const showMethod = type === 'error' ? 
            vscode.window.showErrorMessage :
            type === 'warning' ? 
                vscode.window.showWarningMessage :
                vscode.window.showInformationMessage;

        return showMethod(message, ...(actions || []));
    }

    public pulse(item: string, duration: number = 2000): void {
        const statusItem = this.statusBarItems.get(item);
        if (!statusItem) return;

        const originalBg = statusItem.backgroundColor;
        statusItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        
        setTimeout(() => {
            statusItem.backgroundColor = originalBg;
        }, duration);
    }

    public hide(): void {
        this.statusBarItems.forEach(item => item.hide());
    }

    public show(): void {
        this.statusBarItems.forEach(item => item.show());
    }

    public dispose(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.statusBarItems.forEach(item => item.dispose());
        this.statusBarItems.clear();
    }
}

// Type definitions
export type AIStatus = 'connected' | 'disconnected' | 'processing' | 'error' | 'rate_limited';

export interface TokenUsage {
    used: number;
    limit: number;
    cost: number;
}

export interface PerformanceMetrics {
    latency: number; // milliseconds
    throughput: number; // tokens per second
    memory: number; // bytes
}

interface StatusConfig {
    icon: string;
    color?: string;
    backgroundColor?: vscode.ThemeColor;
    description: string;
} 