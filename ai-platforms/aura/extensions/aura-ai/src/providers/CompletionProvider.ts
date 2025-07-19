/**
 * Aura AI Completion Provider
 * Minimal implementation for VS Code extension
 */

import * as vscode from 'vscode';

export class CompletionProvider implements vscode.CompletionItemProvider {
  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): Promise<vscode.CompletionItem[]> {
    try {
      // Basic completion logic
      const line = document.lineAt(position.line);
      const lineText = line.text.substring(0, position.character);

      // Simple keyword completions for now
      const completions: vscode.CompletionItem[] = [];
      
      if (lineText.includes('console.')) {
        completions.push(new vscode.CompletionItem('log', vscode.CompletionItemKind.Method));
        completions.push(new vscode.CompletionItem('error', vscode.CompletionItemKind.Method));
        completions.push(new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method));
      }
      
      if (lineText.includes('function ')) {
        const funcCompletion = new vscode.CompletionItem('async function', vscode.CompletionItemKind.Function);
        funcCompletion.insertText = new vscode.SnippetString('async function ${1:name}(${2:params}) {\n\t${3:// implementation}\n}');
        completions.push(funcCompletion);
      }

      return completions;
    } catch (error) {
      this.outputChannel.appendLine(`Completion error: ${error}`);
      return [];
    }
  }

  private isComplexCode(context: string): boolean {
    // Simple heuristic for code complexity
    const lines = context.split('\n').length;
    const hasLoops = /\b(for|while|do)\b/.test(context);
    const hasAsync = /\b(async|await|Promise)\b/.test(context);
    const hasClasses = /\b(class|interface)\b/.test(context);
    
    return lines > 50 || hasLoops || hasAsync || hasClasses;
      }
} 