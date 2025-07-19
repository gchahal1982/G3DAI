/**
 * Aura Completion Provider for VS Code
 * 
 * Provides intelligent code completions using our 4-model strategy
 * with automatic routing based on context and task type.
 */

import * as vscode from 'vscode';
import { ModelLoader } from '../../../../src/lib/models/ModelLoader';
import { ModelRegistry, TaskContext } from '../../../../src/lib/models/ModelRegistry';

interface CompletionContext {
  document: vscode.TextDocument;
  position: vscode.Position;
  triggerCharacter?: string;
  triggerKind: vscode.CompletionTriggerKind;
}

interface CompletionCache {
  key: string;
  completions: vscode.CompletionItem[];
  timestamp: number;
}

export class CompletionProvider implements vscode.CompletionItemProvider {
  private cache: Map<string, CompletionCache> = new Map();
  private cacheTimeout = 5000; // 5 seconds
  private currentRequest?: { id: string; cancel: () => void };
  private config: any = {
    enableAutoComplete: true,
    maxTokens: 256,
    temperature: 0.1
  };

  constructor(
    private modelLoader: ModelLoader,
    private modelRegistry: ModelRegistry,
    private outputChannel: vscode.OutputChannel
  ) {}

  /**
   * Task 1: Implement VS Code completion provider
   */
  public async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): Promise<vscode.CompletionItem[] | vscode.CompletionList | null | undefined> {
    if (!this.config.enableAutoComplete) {
      return null;
    }

    // Create completion context
    const completionContext: CompletionContext = {
      document,
      position,
      triggerCharacter: context.triggerCharacter,
      triggerKind: context.triggerKind
    };

    // Task 2: Add context extraction logic
    const extractedContext = await this.extractContext(completionContext);
    
    // Check cache
    const cacheKey = this.getCacheKey(extractedContext);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Cancel previous request if still running
    if (this.currentRequest) {
      this.currentRequest.cancel();
    }

    // Create cancellable request
    const requestId = Math.random().toString(36).substring(7);
    let cancelled = false;
    
    this.currentRequest = {
      id: requestId,
      cancel: () => { cancelled = true; }
    };

    // Handle cancellation
    token.onCancellationRequested(() => {
      if (this.currentRequest?.id === requestId) {
        this.currentRequest.cancel();
      }
    });

    try {
      // Route to appropriate model
      const taskContext = this.createTaskContext(extractedContext);
      const routing = this.modelRegistry.routeTask(taskContext);
      
      this.outputChannel.appendLine(
        `Completion: ${routing.modelId} (${routing.reason})`
      );

      // Task 8: Add parameter hints with 50ms latency target
      const startTime = Date.now();
      
      // Generate completions based on model
      const completions = await this.generateCompletions(
        extractedContext,
        routing.modelId,
        cancelled
      );

      const latency = Date.now() - startTime;
      if (latency > 50) {
        this.outputChannel.appendLine(
          `Warning: Completion latency ${latency}ms exceeds 50ms target`
        );
      }

      // Cache results
      if (completions.length > 0) {
        this.cacheCompletions(cacheKey, completions);
      }

      return completions;

    } catch (error) {
      this.outputChannel.appendLine(`Completion error: ${error}`);
      return null;
    } finally {
      if (this.currentRequest?.id === requestId) {
        this.currentRequest = undefined as any;
      }
    }
  }

  /**
   * Task 2: Add context extraction logic
   */
  private async extractContext(context: CompletionContext): Promise<ExtractedContext> {
    const { document, position, triggerCharacter } = context;
    
    // Get surrounding code
    const linePrefix = document.lineAt(position.line).text.substring(0, position.character);
    const lineSuffix = document.lineAt(position.line).text.substring(position.character);
    
    // Get broader context (10 lines before and after)
    const startLine = Math.max(0, position.line - 10);
    const endLine = Math.min(document.lineCount - 1, position.line + 10);
    
    const lines: string[] = [];
    for (let i = startLine; i <= endLine; i++) {
      lines.push(document.lineAt(i).text);
    }
    
    // Detect completion type
    const completionType = this.detectCompletionType(linePrefix, triggerCharacter);
    
    // Extract imports and symbols
    const imports = this.extractImports(document.getText());
    const symbols = await this.extractSymbols(document);
    
    return {
      language: document.languageId,
      linePrefix,
      lineSuffix,
      lines,
      currentLine: position.line - startLine,
      completionType,
      imports,
      symbols,
      ...(triggerCharacter !== undefined && { triggerCharacter }),
      documentUri: document.uri.toString(),
      position: {
        line: position.line,
        character: position.character
      }
    };
  }

  /**
   * Task 3: Implement trigger character handling
   */
  private detectCompletionType(
    linePrefix: string,
    triggerCharacter?: string
  ): CompletionType {
    // Handle trigger characters
    if (triggerCharacter === '.') {
      return 'member';
    } else if (triggerCharacter === '(' || triggerCharacter === ',') {
      return 'parameter';
    } else if (triggerCharacter === '[' || triggerCharacter === '{') {
      return 'property';
    }
    
    // Analyze line prefix
    if (/\b(function|const|let|var|class|interface|type)\s+\w*$/.test(linePrefix)) {
      return 'declaration';
    } else if (/\b(import|from|require)\s/.test(linePrefix)) {
      return 'import';
    } else if (/\/\/\s*$|\/\*\*\s*$/.test(linePrefix)) {
      return 'comment';
    } else if (/\.\s*$/.test(linePrefix)) {
      return 'member';
    } else if (/\(\s*$/.test(linePrefix)) {
      return 'parameter';
    }
    
    return 'general';
  }

  /**
   * Extract imports from document
   */
  private extractImports(text: string): string[] {
    const imports: string[] = [];
    
    // ES6 imports
    const es6Regex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = es6Regex.exec(text)) !== null) {
      imports.push(match[1]);
    }
    
    // CommonJS requires
    const cjsRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = cjsRegex.exec(text)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  /**
   * Extract symbols from document
   */
  private async extractSymbols(document: vscode.TextDocument): Promise<string[]> {
    try {
      const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider',
        document.uri
      );
      
      if (!symbols) return [];
      
      const names: string[] = [];
      const extractNames = (syms: vscode.DocumentSymbol[]) => {
        for (const sym of syms) {
          names.push(sym.name);
          if (sym.children) {
            extractNames(sym.children);
          }
        }
      };
      
      extractNames(symbols);
      return names;
    } catch {
      return [];
    }
  }

  /**
   * Create task context for model routing
   */
  private createTaskContext(context: ExtractedContext): TaskContext {
    // Calculate context size in tokens (rough estimate)
    const contextSize = context.lines.join('\n').length / 4;
    
    // Determine if this needs special handling
    const needsLongContext = contextSize > 4000;
    const isComplexCode = this.isComplexCode(context);
    
    return {
      type: 'completion',
      complexity: isComplexCode ? 'medium' : 'low',
      contextSize,
      requiresToolUse: false,
      multiStep: false,
      needsLongContext
    };
  }

  /**
   * Check if code is complex
   */
  private isComplexCode(context: ExtractedContext): boolean {
    const { lines, language } = context;
    const code = lines.join('\n');
    
    // Language-specific complexity indicators
    const complexPatterns = {
      typescript: /generic|extends|implements|async|Promise|Observable/,
      javascript: /async|Promise|prototype|class|extends/,
      python: /async|await|yield|decorator|metaclass/,
      java: /generic|extends|implements|synchronized|volatile/,
      cpp: /template|virtual|operator|namespace|std::/,
      rust: /impl|trait|lifetime|unsafe|macro/
    };
    
    const pattern = complexPatterns[language as keyof typeof complexPatterns];
    return pattern ? pattern.test(code) : false;
  }

  /**
   * Generate completions based on model
   */
  private async generateCompletions(
    context: ExtractedContext,
    modelId: string,
    cancelled: boolean
  ): Promise<vscode.CompletionItem[]> {
    if (cancelled) return [];

    // Task 4: Add snippet support
    const completions: vscode.CompletionItem[] = [];
    
    // Generate based on completion type
    switch (context.completionType) {
      case 'member':
        completions.push(...this.generateMemberCompletions(context));
        break;
      
      case 'parameter':
        // Task 7: Implement signature help
        completions.push(...this.generateParameterCompletions(context));
        break;
      
      case 'import':
        completions.push(...this.generateImportCompletions(context));
        break;
      
      case 'comment':
        // Task 6: Add documentation hover
        completions.push(...this.generateCommentCompletions(context));
        break;
      
      case 'declaration':
        completions.push(...this.generateDeclarationCompletions(context));
        break;
      
      default:
        completions.push(...this.generateGeneralCompletions(context));
    }

    // Task 5: Implement completion item sorting
    return this.sortCompletions(completions, context);
  }

  /**
   * Generate member completions
   */
  private generateMemberCompletions(context: ExtractedContext): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];
    
    // Example member completions - in real implementation, 
    // this would call the AI model
    const members = ['length', 'toString', 'valueOf', 'hasOwnProperty'];
    
    for (const member of members) {
      const item = new vscode.CompletionItem(
        member,
        vscode.CompletionItemKind.Method
      );
      item.detail = `(method) ${member}()`;
      item.documentation = new vscode.MarkdownString(
        `Calls the ${member} method`
      );
      completions.push(item);
    }
    
    return completions;
  }

  /**
   * Generate parameter completions
   */
  private generateParameterCompletions(context: ExtractedContext): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];
    
    // Example parameter hints
    const item = new vscode.CompletionItem(
      'param1: string, param2: number',
      vscode.CompletionItemKind.Snippet
    );
    item.insertText = new vscode.SnippetString('${1:param1}, ${2:param2}');
    item.detail = 'Parameter hints';
    completions.push(item);
    
    return completions;
  }

  /**
   * Generate import completions
   */
  private generateImportCompletions(context: ExtractedContext): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];
    
    // Common imports based on language
    const imports = {
      typescript: ['@types/node', 'express', 'react', 'vscode'],
      javascript: ['express', 'react', 'fs', 'path'],
      python: ['os', 'sys', 'json', 'numpy', 'pandas'],
      java: ['java.util.*', 'java.io.*', 'java.lang.*']
    };
    
    const langImports = imports[context.language as keyof typeof imports] || [];
    
    for (const imp of langImports) {
      const item = new vscode.CompletionItem(
        imp,
        vscode.CompletionItemKind.Module
      );
      item.detail = `Import ${imp}`;
      completions.push(item);
    }
    
    return completions;
  }

  /**
   * Generate comment completions
   */
  private generateCommentCompletions(context: ExtractedContext): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];
    
    // JSDoc/TSDoc templates
    const docItem = new vscode.CompletionItem(
      'Document function',
      vscode.CompletionItemKind.Snippet
    );
    
    docItem.insertText = new vscode.SnippetString(
      '/**\n * ${1:Description}\n * @param {${2:type}} ${3:name} - ${4:description}\n * @returns {${5:type}} ${6:description}\n */'
    );
    
    docItem.documentation = new vscode.MarkdownString(
      'Generate JSDoc documentation'
    );
    
    completions.push(docItem);
    
    return completions;
  }

  /**
   * Generate declaration completions
   */
  private generateDeclarationCompletions(context: ExtractedContext): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];
    
    // Function template
    const funcItem = new vscode.CompletionItem(
      'function',
      vscode.CompletionItemKind.Snippet
    );
    funcItem.insertText = new vscode.SnippetString(
      'function ${1:name}(${2:params}) {\n\t${3:// body}\n}'
    );
    completions.push(funcItem);
    
    // Class template
    const classItem = new vscode.CompletionItem(
      'class',
      vscode.CompletionItemKind.Snippet
    );
    classItem.insertText = new vscode.SnippetString(
      'class ${1:Name} {\n\tconstructor(${2:params}) {\n\t\t${3:// constructor}\n\t}\n}'
    );
    completions.push(classItem);
    
    return completions;
  }

  /**
   * Generate general completions
   */
  private generateGeneralCompletions(context: ExtractedContext): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];
    
    // Keywords based on language
    const keywords = {
      typescript: ['const', 'let', 'function', 'class', 'interface', 'async', 'await'],
      javascript: ['const', 'let', 'function', 'class', 'async', 'await'],
      python: ['def', 'class', 'import', 'from', 'if', 'for', 'while'],
      java: ['public', 'private', 'class', 'interface', 'static', 'final']
    };
    
    const langKeywords = keywords[context.language as keyof typeof keywords] || [];
    
    for (const keyword of langKeywords) {
      const item = new vscode.CompletionItem(
        keyword,
        vscode.CompletionItemKind.Keyword
      );
      completions.push(item);
    }
    
    return completions;
  }

  /**
   * Task 5: Implement completion item sorting
   */
  private sortCompletions(
    completions: vscode.CompletionItem[],
    context: ExtractedContext
  ): vscode.CompletionItem[] {
    // Sort by relevance
    return completions.sort((a, b) => {
      // Prioritize by kind
      const kindPriority: Record<vscode.CompletionItemKind, number> = {
        [vscode.CompletionItemKind.Snippet]: 1,
        [vscode.CompletionItemKind.Method]: 2,
        [vscode.CompletionItemKind.Function]: 3,
        [vscode.CompletionItemKind.Variable]: 4,
        [vscode.CompletionItemKind.Class]: 5,
        [vscode.CompletionItemKind.Interface]: 6,
        [vscode.CompletionItemKind.Module]: 7,
        [vscode.CompletionItemKind.Property]: 8,
        [vscode.CompletionItemKind.Keyword]: 9,
        [vscode.CompletionItemKind.Text]: 10
      } as any;
      
      const aPriority = kindPriority[a.kind!] || 999;
      const bPriority = kindPriority[b.kind!] || 999;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Then sort alphabetically
      return a.label.toString().localeCompare(b.label.toString());
    });
  }

  /**
   * Update configuration
   */
  public updateConfiguration(config: any): void {
    this.config = config;
  }

  /**
   * Cache operations
   */
  private getCacheKey(context: ExtractedContext): string {
    return `${context.documentUri}:${context.position.line}:${context.position.character}:${context.linePrefix}`;
  }

  private getFromCache(key: string): vscode.CompletionItem[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.completions;
  }

  private cacheCompletions(key: string, completions: vscode.CompletionItem[]): void {
    this.cache.set(key, {
      key,
      completions,
      timestamp: Date.now()
    });
    
    // Clean old cache entries
    if (this.cache.size > 100) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest 50 entries
      for (let i = 0; i < 50; i++) {
        this.cache.delete(sortedEntries[i][0]);
      }
    }
  }
}

// Type definitions
interface ExtractedContext {
  language: string;
  linePrefix: string;
  lineSuffix: string;
  lines: string[];
  currentLine: number;
  completionType: CompletionType;
  imports: string[];
  symbols: string[];
  triggerCharacter?: string;
  documentUri: string;
  position: {
    line: number;
    character: number;
  };
}

type CompletionType = 
  | 'general'
  | 'member'
  | 'parameter'
  | 'import'
  | 'comment'
  | 'declaration'
  | 'property'; 