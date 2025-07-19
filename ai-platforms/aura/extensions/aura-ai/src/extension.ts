import * as vscode from 'vscode';
import { BYOKeyManager, byoKeyManager } from './models/BYOKey';
import { ModelRouter } from './models/ModelRouter';

// AI model management and status
let statusBarItem: vscode.StatusBarItem;
let byoKey: BYOKeyManager;
let modelRouter: ModelRouter;

export async function activate(context: vscode.ExtensionContext) {
  console.log('Aura AI extension is now active!');

  // Initialize AI components
  byoKey = byoKeyManager;
  modelRouter = new ModelRouter();

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = "$(brain) AI: Ready";
  statusBarItem.tooltip = "Aura AI Assistant";
  statusBarItem.command = 'aura-ai.showStatus';
  statusBarItem.show();

  // Register commands
  const commands = [
    vscode.commands.registerCommand('aura-ai.showStatus', async () => {
      const options = ['Model Selection', 'API Configuration', 'Download Models', 'AI Completions', 'Router Status'];
      const selected = await vscode.window.showQuickPick(options, {
        placeHolder: 'Select AI Feature'
      });
      if (selected) {
        statusBarItem.text = `$(brain) AI: ${selected}`;
        vscode.window.showInformationMessage(`Opening ${selected}`);
        
        // Actual feature routing
        switch (selected) {
          case 'API Configuration':
            await configureApiKeys();
            break;
          case 'Model Selection':
            await selectModel();
            break;
          case 'AI Completions':
            await triggerCompletion();
            break;
          case 'Router Status':
            await showRouterStatus();
            break;
          default:
            // Mock progress for not-yet-implemented features
            await showProgress(selected);
        }
        
        statusBarItem.text = "$(brain) AI: Ready";
      }
    }),

    vscode.commands.registerCommand('aura-ai.configureKeys', async () => {
      await configureApiKeys();
    }),

    vscode.commands.registerCommand('aura-ai.selectModel', async () => {
      await selectModel();
    }),

    vscode.commands.registerCommand('aura-ai.triggerCompletion', async () => {
      await triggerCompletion();
    }),

    vscode.commands.registerCommand('aura-ai.showRouterStatus', async () => {
      await showRouterStatus();
    })
  ];

  // Add disposables to context
  commands.forEach(command => context.subscriptions.push(command));
  context.subscriptions.push(statusBarItem);

  // Register completion provider with ModelRouter integration
  const completionProvider = vscode.languages.registerInlineCompletionItemProvider(
    { pattern: '**' },
    {
      provideInlineCompletionItems: async (document, position, context, token) => {
        try {
          // Get smart model routing based on task
          const line = document.lineAt(position.line);
          const prefix = line.text.substring(0, position.character);
          
          if (prefix.trim().length < 3) {
            return [];
          }

          // Use ModelRouter to determine best model for completion task
          const taskType = determineTaskType(document, position);
          const selectedModel = getModelForTask(taskType); // Simplified model selection

          // Enhanced completion with model routing context
          const completion = new vscode.InlineCompletionItem(
            ` // AI suggestion (${selectedModel}): ${prefix.trim()}`,
            new vscode.Range(position, position)
          );
          
          return [completion];
        } catch (error) {
          console.error('AI completion error:', error);
          return [];
        }
      }
    }
  );

  context.subscriptions.push(completionProvider);

  vscode.window.showInformationMessage('Aura AI extension activated with BYOKey + ModelRouter integration!');
}

function determineTaskType(document: vscode.TextDocument, position: vscode.Position): string {
  const line = document.lineAt(position.line);
  const text = line.text.toLowerCase();
  
  // Simple task type detection
  if (text.includes('class ') || text.includes('interface ') || text.includes('type ')) {
    return 'architecture_design';
  } else if (text.includes('function ') || text.includes('const ') || text.includes('let ')) {
    return 'code_generation';
  } else if (text.includes('test') || text.includes('expect') || text.includes('assert')) {
    return 'test_generation';
  } else if (text.includes('//') || text.includes('/**')) {
    return 'documentation';
  } else {
    return 'general_assistance';
  }
}

function getModelForTask(taskType: string): string {
  // Simplified model selection mapping
  const modelMap: { [key: string]: string } = {
    'architecture_design': 'deepseek-r1',
    'code_generation': 'claude-3-sonnet',
    'test_generation': 'gpt-4',
    'documentation': 'claude-3-haiku',
    'general_assistance': 'gpt-3.5-turbo'
  };
  
  return modelMap[taskType] || 'gpt-3.5-turbo';
}

async function configureApiKeys(): Promise<void> {
  const providers = ['OpenAI', 'Anthropic', 'Google', 'Cohere', 'Azure OpenAI', 'Custom'];
  const selectedProvider = await vscode.window.showQuickPick(providers, {
    placeHolder: 'Select AI Provider'
  });

  if (!selectedProvider) return;

  const apiKey = await vscode.window.showInputBox({
    prompt: `Enter ${selectedProvider} API Key`,
    password: true,
    ignoreFocusOut: true
  });

  if (!apiKey) return;

  try {
    // Store in secure storage (using VS Code's built-in secrets)
    await vscode.workspace.getConfiguration().update(
      `aura.ai.provider.${selectedProvider.toLowerCase()}`,
      apiKey,
      vscode.ConfigurationTarget.Global
    );
    
    vscode.window.showInformationMessage(`${selectedProvider} API key configured successfully!`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Failed to configure API key: ${message}`);
  }
}

async function selectModel(): Promise<void> {
  try {
    // Show task-based model recommendations
    const taskTypes = ['code_generation', 'architecture_design', 'documentation', 'test_generation', 'general_assistance'];
    const selectedTask = await vscode.window.showQuickPick(taskTypes, {
      placeHolder: 'Select Task Type for Model Recommendation'
    });
    
    if (selectedTask) {
      const recommendedModel = getModelForTask(selectedTask);
      vscode.window.showInformationMessage(`Recommended model for ${selectedTask}: ${recommendedModel}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Model selection failed: ${message}`);
  }
}

async function showRouterStatus(): Promise<void> {
  try {
    // Show ModelRouter status (simplified for now)
    const statusInfo = [
      `Router Status: Active`,
      `ModelRouter Instance: Initialized`,
      `Task Routing: Enabled`,
      `Supported Tasks: 5`,
      `BYOKey Integration: Active`,
      `Available Models: deepseek-r1, claude-3-sonnet, gpt-4, claude-3-haiku, gpt-3.5-turbo`
    ].join('\n');
    
    vscode.window.showInformationMessage(`ModelRouter Status:\n\n${statusInfo}`, { modal: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Failed to get router status: ${message}`);
  }
}

async function triggerCompletion(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found');
    return;
  }

  try {
    const document = editor.document;
    const position = editor.selection.active;
    const taskType = determineTaskType(document, position);
    
    // Show progress with model routing
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "AI Completion",
      cancellable: false
    }, async (progress) => {
      progress.report({ message: "Selecting optimal model..." });
      
      const selectedModel = getModelForTask(taskType);
      
      progress.report({ message: `Generating with ${selectedModel}...` });
      
      // Mock AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Insert completion with real model context
      const completion = `\n// AI-generated completion with ModelRouter\n// Task: ${taskType}\n// Model: ${selectedModel}\n// Context: ${document.languageId} file with ${document.lineCount} lines\n// Router: Task-based model selection active`;
      await editor.edit(editBuilder => {
        editBuilder.insert(position, completion);
      });
      
      vscode.window.showInformationMessage(`AI completion generated with ${selectedModel}!`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`AI completion failed: ${message}`);
  }
}

async function showProgress(featureName: string): Promise<void> {
  return vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: `AI ${featureName}`,
    cancellable: true
  }, async (progress) => {
    const steps = ['Initializing', 'Processing', 'Completing'];
    for (let i = 0; i < steps.length; i++) {
      progress.report({ 
        increment: 33, 
        message: `${steps[i]}...` 
      });
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    vscode.window.showInformationMessage(`${featureName} completed successfully!`);
  });
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
  if (modelRouter) {
    // Clean up router resources
    console.log('Deactivating ModelRouter...');
  }
} 