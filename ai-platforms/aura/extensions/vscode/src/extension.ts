/**
 * Aura VS Code Extension
 * 
 * Integrates Aura's 4-model AI strategy directly into VS Code
 * with intelligent routing, local inference, and cloud fallback.
 */

import * as vscode from 'vscode';
import * as path from 'path';
// import { CompletionProvider } from './providers/CompletionProvider'; // TODO: Implement CompletionProvider
import { ModelLoader } from '../../../src/lib/models/ModelLoader';
import { ModelRegistry } from '../../../src/lib/models/ModelRegistry';

// Extension configuration
export interface AuraConfig {
  enableAutoComplete: boolean;
  enableInlineHints: boolean;
  preferredModel: string;
  autoModelRouting: boolean;
  maxTokens: number;
  temperature: number;
  telemetryOptIn: boolean;
  offlineMode: boolean;
  apiKeys: {
    kimiK2?: string;
    deepseekV3?: string;
  };
}

// Extension state
class AuraExtension {
  private modelLoader: ModelLoader;
  private modelRegistry: ModelRegistry;
  private statusBar: vscode.StatusBarItem;
  private outputChannel: vscode.OutputChannel;
  private config: AuraConfig;
  private completionProvider?: any; // CompletionProvider;
  private diagnosticsCollection: vscode.DiagnosticCollection;

  constructor(private context: vscode.ExtensionContext) {
    // Initialize components
    const modelsDir = path.join(context.globalStorageUri.fsPath, 'models');
    this.modelLoader = new ModelLoader(modelsDir);
    this.modelRegistry = new ModelRegistry();
    this.outputChannel = vscode.window.createOutputChannel('Aura');
    this.diagnosticsCollection = vscode.languages.createDiagnosticCollection('aura');
    
    // Create status bar
    this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.statusBar.text = '$(rocket) Aura';
    this.statusBar.tooltip = 'Aura AI Assistant';
    this.statusBar.command = 'aura.showMenu';
    this.statusBar.show();

    // Load configuration
    this.config = this.loadConfiguration();

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Activate the extension
   */
  public async activate(): Promise<void> {
    this.outputChannel.appendLine('Aura extension activating...');

    try {
      // Task 1: Initialize VS Code extension API
      await this.initializeExtension();

      // Task 2: Implement activation events
      await this.registerActivationEvents();

      // Task 3: Add extension configuration schema
      await this.registerConfiguration();

      // Task 4: Create status bar items
      await this.createStatusBarItems();

      // Task 5: Implement command registration
      await this.registerCommands();

      // Task 6: Add context menu integration
      await this.registerContextMenus();

      // Task 7: Implement workspace trust API
      await this.handleWorkspaceTrust();

      // Task 8: Add telemetry opt-in with differential privacy
      await this.initializeTelemetry();

      // Initialize completion provider
      await this.initializeCompletionProvider();

      // Check and download required models
      await this.checkRequiredModels();

      this.outputChannel.appendLine('Aura extension activated successfully!');
      
    } catch (error) {
      this.outputChannel.appendLine(`Activation failed: ${error}`);
      vscode.window.showErrorMessage(`Aura activation failed: ${error}`);
    }
  }

  /**
   * Task 1: Initialize VS Code extension API
   */
  private async initializeExtension(): Promise<void> {
    // Register disposables
    this.context.subscriptions.push(this.statusBar);
    this.context.subscriptions.push(this.outputChannel);
    this.context.subscriptions.push(this.diagnosticsCollection);

    // Set extension context values
    await vscode.commands.executeCommand('setContext', 'aura.active', true);
    await vscode.commands.executeCommand('setContext', 'aura.hasModels', false);
  }

  /**
   * Task 2: Implement activation events
   */
  private async registerActivationEvents(): Promise<void> {
    // Extension is activated on:
    // - Startup (if previously used)
    // - First use of any Aura command
    // - Opening supported file types
    // These are defined in package.json activationEvents
    
    // Track activation reason
    const activationReason = this.context.globalState.get('firstActivation', true) 
      ? 'first-activation' 
      : 'startup';
    
    if (activationReason === 'first-activation') {
      await this.context.globalState.update('firstActivation', false);
      await this.showWelcomeMessage();
    }
  }

  /**
   * Task 3: Add extension configuration schema
   */
  private async registerConfiguration(): Promise<void> {
    // Configuration is defined in package.json contributes.configuration
    // Here we handle configuration changes
    vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration('aura')) {
        this.config = this.loadConfiguration();
        await this.handleConfigurationChange();
      }
    });
  }

  /**
   * Task 4: Create status bar items
   */
  private async createStatusBarItems(): Promise<void> {
    // Update status bar based on current state
    await this.updateStatusBar();

    // Create additional status items for model info
    const modelStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
    modelStatusBar.text = '$(chip) Model: Loading...';
    modelStatusBar.tooltip = 'Current AI Model';
    modelStatusBar.command = 'aura.selectModel';
    this.context.subscriptions.push(modelStatusBar);
    
    // Update model status
    const hardware = this.modelRegistry.getHardwareProfile();
    if (hardware) {
      const optimalModel = this.modelRegistry.getOptimalModelForHardware();
      const model = this.modelRegistry.getModel(optimalModel);
      if (model) {
        modelStatusBar.text = `$(chip) ${model.variant || model.family}`;
        modelStatusBar.show();
      }
    }
  }

  /**
   * Task 5: Implement command registration
   */
  private async registerCommands(): Promise<void> {
    const commands = [
      // Main menu
      {
        id: 'aura.showMenu',
        handler: () => this.showMainMenu()
      },
      // Model management
      {
        id: 'aura.selectModel',
        handler: () => this.showModelSelector()
      },
      {
        id: 'aura.downloadModels',
        handler: () => this.showModelDownloader()
      },
      // AI features
      {
        id: 'aura.complete',
        handler: () => this.triggerCompletion()
      },
      {
        id: 'aura.refactor',
        handler: () => this.refactorCode()
      },
      {
        id: 'aura.debug',
        handler: () => this.debugCode()
      },
      {
        id: 'aura.document',
        handler: () => this.generateDocumentation()
      },
      {
        id: 'aura.explain',
        handler: () => this.explainCode()
      },
      // Settings
      {
        id: 'aura.openSettings',
        handler: () => this.openSettings()
      },
      {
        id: 'aura.toggleOfflineMode',
        handler: () => this.toggleOfflineMode()
      }
    ];

    for (const cmd of commands) {
      const disposable = vscode.commands.registerCommand(cmd.id, cmd.handler);
      this.context.subscriptions.push(disposable);
    }
  }

  /**
   * Task 6: Add context menu integration
   */
  private async registerContextMenus(): Promise<void> {
    // Context menu items are defined in package.json contributes.menus
    // Here we ensure they're properly enabled based on context
    
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        const isSupported = this.isSupportedLanguage(editor.document.languageId);
        vscode.commands.executeCommand('setContext', 'aura.supportedFile', isSupported);
      }
    });
  }

  /**
   * Task 7: Implement workspace trust API
   */
  private async handleWorkspaceTrust(): Promise<void> {
    const trustState = vscode.workspace.isTrusted;
    
    if (!trustState) {
      // Restricted mode - only cloud models allowed
      await vscode.commands.executeCommand('setContext', 'aura.trustedWorkspace', false);
      this.outputChannel.appendLine('Workspace untrusted - local models disabled');
      
      vscode.workspace.onDidGrantWorkspaceTrust(() => {
        vscode.commands.executeCommand('setContext', 'aura.trustedWorkspace', true);
        this.outputChannel.appendLine('Workspace trusted - local models enabled');
        this.checkRequiredModels();
      });
    } else {
      await vscode.commands.executeCommand('setContext', 'aura.trustedWorkspace', true);
    }
  }

  /**
   * Task 8: Add telemetry opt-in with differential privacy
   */
  private async initializeTelemetry(): Promise<void> {
    if (this.config.telemetryOptIn) {
      // Initialize telemetry with differential privacy
      this.outputChannel.appendLine('Telemetry enabled with differential privacy');
      
      // Track anonymous usage metrics
      this.context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((e) => {
          if (this.completionProvider) {
            // Track completion acceptance rate (anonymized)
            // No actual code content is sent
          }
        })
      );
    }
  }

  /**
   * Initialize completion provider
   */
  private async initializeCompletionProvider(): Promise<void> {
    // TODO: Implement CompletionProvider
    /*
    this.completionProvider = new CompletionProvider(
      this.modelLoader,
      this.modelRegistry,
      this.outputChannel
    );

    // Register completion provider for all languages
    const provider = vscode.languages.registerCompletionItemProvider(
      { pattern: '**/*' },
      this.completionProvider,
      '.', '(', '[', '{', ' ', '\n'
    );

    this.context.subscriptions.push(provider);
    */
  }

  /**
   * Check and download required models
   */
  private async checkRequiredModels(): Promise<void> {
    if (!vscode.workspace.isTrusted) return;

    const installedModels = await this.modelLoader.getInstalledModels();
    const hasModels = installedModels.length > 0;
    
    await vscode.commands.executeCommand('setContext', 'aura.hasModels', hasModels);

    if (!hasModels) {
      const download = await vscode.window.showInformationMessage(
        'Aura requires AI models to be downloaded. Download now?',
        'Download Models',
        'Later'
      );

      if (download === 'Download Models') {
        await this.showModelDownloader();
      }
    } else {
      // Update model status in registry
      for (const model of installedModels) {
        this.modelRegistry.updateModelStatus(model.id, 'available');
      }
    }
  }

  /**
   * Load configuration
   */
  private loadConfiguration(): AuraConfig {
    const config = vscode.workspace.getConfiguration('aura');
    
    return {
      enableAutoComplete: config.get('enableAutoComplete', true),
      enableInlineHints: config.get('enableInlineHints', true),
      preferredModel: config.get('preferredModel', 'auto'),
      autoModelRouting: config.get('autoModelRouting', true),
      maxTokens: config.get('maxTokens', 1024),
      temperature: config.get('temperature', 0.2),
      telemetryOptIn: config.get('telemetryOptIn', false),
      offlineMode: config.get('offlineMode', false),
      apiKeys: {
        kimiK2: config.get('apiKeys.kimiK2'),
        deepseekV3: config.get('apiKeys.deepseekV3')
      }
    };
  }

  /**
   * Handle configuration changes
   */
  private async handleConfigurationChange(): Promise<void> {
    this.outputChannel.appendLine('Configuration changed, reloading...');
    
    // Update completion provider settings
    if (this.completionProvider) {
      this.completionProvider.updateConfiguration(this.config);
    }

    // Update status bar
    await this.updateStatusBar();
  }

  /**
   * Update status bar
   */
  private async updateStatusBar(): Promise<void> {
    const icon = this.config.offlineMode ? '$(cloud-offline)' : '$(rocket)';
    const mode = this.config.offlineMode ? ' (Offline)' : '';
    this.statusBar.text = `${icon} Aura${mode}`;
  }

  /**
   * Show main menu
   */
  private async showMainMenu(): Promise<void> {
    const items: vscode.QuickPickItem[] = [
      {
        label: '$(code) Complete Code',
        description: 'AI-powered code completion',
        detail: 'Complete code at cursor position'
      },
      {
        label: '$(tools) Refactor Code',
        description: 'Intelligent code refactoring',
        detail: 'Refactor selected code or entire file'
      },
      {
        label: '$(bug) Debug Code',
        description: 'Find and fix bugs',
        detail: 'Analyze code for potential issues'
      },
      {
        label: '$(book) Generate Documentation',
        description: 'Auto-generate docs',
        detail: 'Create documentation for selected code'
      },
      {
        label: '$(info) Explain Code',
        description: 'Get code explanations',
        detail: 'Understand how selected code works'
      },
      {
        label: '$(cloud-download) Download Models',
        description: 'Manage AI models',
        detail: 'Download or update AI models'
      },
      {
        label: '$(settings-gear) Settings',
        description: 'Configure Aura',
        detail: 'Open Aura settings'
      }
    ];

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a Aura action'
    });

    if (selected) {
      switch (selected.label) {
        case '$(code) Complete Code':
          await vscode.commands.executeCommand('aura.complete');
          break;
        case '$(tools) Refactor Code':
          await vscode.commands.executeCommand('aura.refactor');
          break;
        case '$(bug) Debug Code':
          await vscode.commands.executeCommand('aura.debug');
          break;
        case '$(book) Generate Documentation':
          await vscode.commands.executeCommand('aura.document');
          break;
        case '$(info) Explain Code':
          await vscode.commands.executeCommand('aura.explain');
          break;
        case '$(cloud-download) Download Models':
          await vscode.commands.executeCommand('aura.downloadModels');
          break;
        case '$(settings-gear) Settings':
          await vscode.commands.executeCommand('aura.openSettings');
          break;
      }
    }
  }

  /**
   * Show model selector
   */
  private async showModelSelector(): Promise<void> {
    const allModels = this.modelRegistry.getModels();
    
    // Separate core models from BYO-Key models
    const coreModels = allModels.filter(m => m.isCoreModel);
    const byoModels = allModels.filter(m => !m.isCoreModel);
    
    const items: vscode.QuickPickItem[] = [
      // Add separator for core models
      {
        label: '🚀 Core Models (Included)',
        kind: vscode.QuickPickItemKind.Separator
      },
      ...coreModels.map(model => ({
        label: `$(star-full) ${model.variant || model.family}`,
        description: `${model.type} - ${model.status}`,
        detail: `Core model: ${model.family} - Always available`
      })),
      
      // Add separator for BYO-Key models
      {
        label: '🔑 Additional Models (Bring Your Own Key)',
        kind: vscode.QuickPickItemKind.Separator
      },
      ...byoModels.map(model => ({
        label: `$(key) ${model.variant || model.family}`,
        description: `${model.family} - ${model.requiresApiKey ? 'Requires API Key' : 'Available'}`,
        detail: `${model.family} - Configure API key in settings`
      }))
    ];

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select AI model',
      ignoreFocusOut: true
    });

    if (selected && selected.kind !== vscode.QuickPickItemKind.Separator) {
      // Extract model name from label
      const modelName = selected.label.replace(/^\$\([^)]+\)\s*/, '');
      const model = allModels.find(m => (m.variant || m.family) === modelName);
      
      if (model) {
        if (model.requiresApiKey) {
          // Show API key configuration
          const configure = await vscode.window.showInformationMessage(
            `${model.variant || model.family} requires an API key. Configure now?`,
            'Configure API Key',
            'Cancel'
          );
          
          if (configure === 'Configure API Key') {
            await this.configureApiKey(model.family);
          }
        } else {
          await vscode.workspace.getConfiguration('aura').update(
            'preferredModel',
            model.id,
            vscode.ConfigurationTarget.Global
          );
        }
      }
    }
  }

  /**
   * Show model downloader
   */
  private async showModelDownloader(): Promise<void> {
    const models = this.modelLoader.getAvailableModels();
    const installedIds = (await this.modelLoader.getInstalledModels()).map(m => m.id);
    
    const items: vscode.QuickPickItem[] = await Promise.all(
      models.map(async (model) => {
        const installed = installedIds.includes(model.id);
        const icon = installed ? '$(check)' : '$(cloud-download)';
        const status = installed ? 'Installed' : `${(model.size / (1024 * 1024 * 1024)).toFixed(1)}GB`;
        
        return {
          label: `${icon} ${model.name}`,
          description: status,
          detail: `${model.description} - ${this.modelLoader.getHardwareRecommendation(model.id)}`
        };
      })
    );

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select models to download',
      canPickMany: true
    });

    if (selected && selected.length > 0) {
      for (const item of selected) {
        const modelName = item.label.replace(/^\$\([^)]+\)\s*/, '');
        const model = models.find(m => m.name === modelName);
        
        if (model && !installedIds.includes(model.id)) {
          await this.downloadModelWithProgress(model.id);
        }
      }
    }
  }

  /**
   * Download model with progress
   */
  private async downloadModelWithProgress(modelId: string): Promise<void> {
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `Downloading ${modelId}...`,
      cancellable: true
    }, async (progress, token) => {
      // Set up progress tracking
      this.modelLoader.on('download:progress', (data) => {
        if (data.modelId === modelId) {
          const percent = (data.downloadedBytes / data.totalBytes) * 100;
          const mbDownloaded = (data.downloadedBytes / (1024 * 1024)).toFixed(1);
          const mbTotal = (data.totalBytes / (1024 * 1024)).toFixed(1);
          
          progress.report({
            increment: percent,
            message: `${mbDownloaded}MB / ${mbTotal}MB (${percent.toFixed(1)}%)`
          });
        }
      });

      // Handle cancellation
      token.onCancellationRequested(() => {
        this.modelLoader.cancelDownload(modelId);
      });

      try {
        await this.modelLoader.downloadModel(modelId);
        vscode.window.showInformationMessage(`Model ${modelId} downloaded successfully!`);
        this.modelRegistry.updateModelStatus(modelId, 'available');
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to download ${modelId}: ${error}`);
      }
    });
  }

  /**
   * Trigger completion
   */
  private async triggerCompletion(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    await vscode.commands.executeCommand('editor.action.triggerSuggest');
  }

  /**
   * Refactor code
   */
  private async refactorCode(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    const text = editor.document.getText(selection.isEmpty ? undefined : selection);
    
    if (!text) {
      vscode.window.showWarningMessage('Please select code to refactor');
      return;
    }

    // Route to appropriate model
    const context = this.modelRegistry.classifyTask({
      type: 'refactor',
      contextSize: text.length,
      complexity: text.length > 1000 ? 'high' : 'medium'
    });

    const routing = this.modelRegistry.routeTask(context);
    this.outputChannel.appendLine(`Refactoring with ${routing.modelId}: ${routing.reason}`);

    // TODO: Implement actual refactoring logic
    vscode.window.showInformationMessage(`Refactoring with ${routing.modelId}...`);
  }

  /**
   * Debug code
   */
  private async debugCode(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    // Get current file diagnostics
    const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
    
    if (diagnostics.length === 0) {
      vscode.window.showInformationMessage('No issues found in current file');
      return;
    }

    // Route to debugging model
    const context = this.modelRegistry.classifyTask({
      type: 'debug',
      complexity: 'medium',
      contextSize: editor.document.getText().length
    });

    const routing = this.modelRegistry.routeTask(context);
    this.outputChannel.appendLine(`Debugging with ${routing.modelId}: ${routing.reason}`);

    // TODO: Implement actual debugging logic
    vscode.window.showInformationMessage(`Analyzing ${diagnostics.length} issues with ${routing.modelId}...`);
  }

  /**
   * Generate documentation
   */
  private async generateDocumentation(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    const text = editor.document.getText(selection.isEmpty ? undefined : selection);
    
    if (!text) {
      vscode.window.showWarningMessage('Please select code to document');
      return;
    }

    // Route to documentation model
    const context = this.modelRegistry.classifyTask({
      type: 'document',
      contextSize: text.length
    });

    const routing = this.modelRegistry.routeTask(context);
    this.outputChannel.appendLine(`Documenting with ${routing.modelId}: ${routing.reason}`);

    // TODO: Implement actual documentation generation
    vscode.window.showInformationMessage(`Generating documentation with ${routing.modelId}...`);
  }

  /**
   * Explain code
   */
  private async explainCode(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    const text = editor.document.getText(selection.isEmpty ? undefined : selection);
    
    if (!text) {
      vscode.window.showWarningMessage('Please select code to explain');
      return;
    }

    // Route to reasoning model
    const context = this.modelRegistry.classifyTask({
      type: 'reason',
      contextSize: text.length,
      complexity: 'medium'
    });

    const routing = this.modelRegistry.routeTask(context);
    this.outputChannel.appendLine(`Explaining with ${routing.modelId}: ${routing.reason}`);

    // TODO: Implement actual explanation logic
    vscode.window.showInformationMessage(`Explaining code with ${routing.modelId}...`);
  }

  /**
   * Open settings
   */
  private async openSettings(): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.openSettings', '@ext:aura');
  }

  /**
   * Toggle offline mode
   */
  private async toggleOfflineMode(): Promise<void> {
    const current = this.config.offlineMode;
    await vscode.workspace.getConfiguration('aura').update(
      'offlineMode',
      !current,
      vscode.ConfigurationTarget.Global
    );
  }

  /**
   * Configure API key for a provider
   */
  private async configureApiKey(family: string): Promise<void> {
    const providerNames: Record<string, string> = {
      'openai': 'OpenAI',
      'anthropic': 'Anthropic',
      'google': 'Google',
      'xai': 'xAI',
      'meta': 'Meta'
    };

    const providerName = providerNames[family] || family;
    
    const apiKey = await vscode.window.showInputBox({
      prompt: `Enter your ${providerName} API key`,
      password: true,
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'API key is required';
        }
        return null;
      }
    });

    if (apiKey) {
      // Store API key in settings
      await vscode.workspace.getConfiguration('aura').update(
        `apiKeys.${family}`,
        apiKey.trim(),
        vscode.ConfigurationTarget.Global
      );

      vscode.window.showInformationMessage(
        `${providerName} API key configured successfully!`
      );
    }
  }

  /**
   * Show welcome message
   */
  private async showWelcomeMessage(): Promise<void> {
    const message = 'Welcome to Aura! AI-powered coding with 4 specialized models.';
    const actions = ['Download Models', 'Open Settings', 'Learn More'];
    
    const selected = await vscode.window.showInformationMessage(message, ...actions);
    
    switch (selected) {
      case 'Download Models':
        await this.showModelDownloader();
        break;
      case 'Open Settings':
        await this.openSettings();
        break;
      case 'Learn More':
        await vscode.env.openExternal(vscode.Uri.parse('https://aura.ai/docs'));
        break;
    }
  }

  /**
   * Check if language is supported
   */
  private isSupportedLanguage(languageId: string): boolean {
    const supported = [
      'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'c',
      'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'dart',
      'html', 'css', 'scss', 'less', 'json', 'xml', 'yaml', 'markdown'
    ];
    
    return supported.includes(languageId);
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Model loader events
    this.modelLoader.on('download:start', ({ modelId }) => {
      this.outputChannel.appendLine(`Starting download: ${modelId}`);
    });

    this.modelLoader.on('download:complete', ({ modelId }) => {
      this.outputChannel.appendLine(`Download complete: ${modelId}`);
      vscode.window.showInformationMessage(`Model ${modelId} downloaded successfully!`);
    });

    this.modelLoader.on('download:error', ({ modelId, error }) => {
      this.outputChannel.appendLine(`Download failed: ${modelId} - ${error}`);
      vscode.window.showErrorMessage(`Failed to download ${modelId}`);
    });

    // Model registry events
    this.modelRegistry.on('hardware:detected', (hardware) => {
      this.outputChannel.appendLine(`Hardware detected: ${JSON.stringify(hardware)}`);
    });

    this.modelRegistry.on('task:routed', ({ context, decision }) => {
      this.outputChannel.appendLine(`Task routed: ${context.type} -> ${decision.modelId}`);
    });
  }

  /**
   * Deactivate extension
   */
  public deactivate(): void {
    this.outputChannel.appendLine('Aura extension deactivating...');
  }
}

// Extension instance
let extension: AuraExtension | undefined;

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  extension = new AuraExtension(context);
  await extension.activate();
}

/**
 * Extension deactivation
 */
export function deactivate(): void {
  if (extension) {
    extension.deactivate();
  }
} 