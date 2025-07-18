/**
 * ASTIndexer.ts - Incremental AST indexing for CodeForge dynamic context
 * 
 * Implements incremental Tree-sitter diff parsing with symbol extraction:
 * - TypeScript + Rust WASM build of Tree-sitter for performance
 * - Incremental diff parsing for efficient updates
 * - Symbol & embedding queue (≤ 200 tokens per chunk)
 * - Code structure extraction (functions, classes, imports, etc.)
 * - Dependency graph construction and maintenance
 * - Target: < 200ms incremental updates, < 30s cold start for 100k LOC
 */

import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Tree-sitter imports (would be actual tree-sitter in real implementation)
interface TreeSitterNode {
  type: string;
  text: string;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  children: TreeSitterNode[];
  parent?: TreeSitterNode;
  id: string;
}

interface TreeSitterTree {
  rootNode: TreeSitterNode;
  getChangedRanges(oldTree: TreeSitterTree): Range[];
}

interface Range {
  startIndex: number;
  endIndex: number;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
}

interface Language {
  parse(content: string, oldTree?: TreeSitterTree): TreeSitterTree;
}

export interface CodeSymbol {
  id: string;
  name: string;
  type: 'function' | 'class' | 'interface' | 'variable' | 'import' | 'export' | 'type' | 'method' | 'property';
  filePath: string;
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
  text: string;
  signature?: string;
  documentation?: string;
  visibility?: 'public' | 'private' | 'protected';
  isAsync?: boolean;
  isStatic?: boolean;
  returnType?: string;
  parameters?: Parameter[];
  dependencies: string[]; // symbol IDs this depends on
  dependents: string[]; // symbol IDs that depend on this
  parent?: string; // parent symbol ID
  children: string[]; // child symbol IDs
  metadata: Record<string, any>;
}

export interface Parameter {
  name: string;
  type?: string;
  optional?: boolean;
  defaultValue?: string;
}

export interface CodeChunk {
  id: string;
  filePath: string;
  content: string;
  tokens: number;
  startLine: number;
  endLine: number;
  symbols: string[]; // symbol IDs in this chunk
  embedding?: number[]; // vector embedding
  hash: string;
  language: string;
  type: 'function' | 'class' | 'module' | 'comment' | 'import' | 'mixed';
  lastModified: Date;
}

export interface FileIndex {
  filePath: string;
  language: string;
  hash: string;
  symbols: Map<string, CodeSymbol>;
  chunks: Map<string, CodeChunk>;
  tree?: TreeSitterTree;
  lastIndexed: Date;
  version: number;
}

export interface IndexingStats {
  filesIndexed: number;
  symbolsExtracted: number;
  chunksCreated: number;
  totalTokens: number;
  averageProcessingTime: number;
  lastIndexTime: number;
  incrementalUpdates: number;
  coldStarts: number;
}

export interface IndexingOptions {
  maxChunkTokens: number;
  minChunkTokens: number;
  overlapTokens: number;
  enableIncrementalUpdates: boolean;
  enableEmbedding: boolean;
  embeddingModel: string;
  supportedLanguages: string[];
  excludePatterns: RegExp[];
  maxFileSize: number; // bytes
}

export class ASTIndexer extends EventEmitter {
  private fileIndexes: Map<string, FileIndex> = new Map();
  private languages: Map<string, Language> = new Map();
  private processingQueue: string[] = [];
  private isProcessing = false;
  private options: IndexingOptions;
  private stats: IndexingStats;
  private processingTimes: number[] = [];

  constructor(options: Partial<IndexingOptions> = {}) {
    super();
    
    this.options = {
      maxChunkTokens: 200,
      minChunkTokens: 50,
      overlapTokens: 20,
      enableIncrementalUpdates: true,
      enableEmbedding: false, // Disabled by default for performance
      embeddingModel: 'minilm-l6',
      supportedLanguages: [
        'typescript', 'javascript', 'python', 'rust', 'go',
        'java', 'cpp', 'c', 'csharp', 'php', 'ruby'
      ],
      excludePatterns: [
        /node_modules/,
        /\.git/,
        /dist/,
        /build/,
        /coverage/,
        /\.d\.ts$/
      ],
      maxFileSize: 5 * 1024 * 1024, // 5MB
      ...options
    };

    this.stats = {
      filesIndexed: 0,
      symbolsExtracted: 0,
      chunksCreated: 0,
      totalTokens: 0,
      averageProcessingTime: 0,
      lastIndexTime: 0,
      incrementalUpdates: 0,
      coldStarts: 0
    };

    this.initializeLanguages();
  }

  /**
   * Initialize Tree-sitter language parsers
   */
  private async initializeLanguages(): Promise<void> {
    // In a real implementation, this would load Tree-sitter WASM modules
    // For now, using mock implementations
    const mockLanguages = [
      'typescript', 'javascript', 'python', 'rust', 'go',
      'java', 'cpp', 'c', 'csharp', 'php', 'ruby'
    ];

    for (const lang of mockLanguages) {
      this.languages.set(lang, this.createMockLanguage(lang));
    }

    this.emit('languages:initialized', Array.from(this.languages.keys()));
  }

  /**
   * Create mock language parser (would be actual Tree-sitter in production)
   */
  private createMockLanguage(language: string): Language {
    return {
      parse: (content: string, oldTree?: TreeSitterTree): TreeSitterTree => {
        return this.mockParse(content, language, oldTree);
      }
    };
  }

  /**
   * Mock parsing implementation
   */
  private mockParse(content: string, language: string, oldTree?: TreeSitterTree): TreeSitterTree {
    // This would be actual Tree-sitter parsing in production
    const rootNode: TreeSitterNode = {
      type: 'program',
      text: content,
      startPosition: { row: 0, column: 0 },
      endPosition: { row: content.split('\n').length - 1, column: 0 },
      children: [],
      id: crypto.randomUUID()
    };

    // Simple mock parsing for demonstration
    const lines = content.split('\n');
    let currentLine = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (this.isFunction(trimmedLine, language)) {
        rootNode.children.push(this.createFunctionNode(line, currentLine, language));
      } else if (this.isClass(trimmedLine, language)) {
        rootNode.children.push(this.createClassNode(line, currentLine, language));
      } else if (this.isImport(trimmedLine, language)) {
        rootNode.children.push(this.createImportNode(line, currentLine, language));
      }

      currentLine++;
    }

    return { rootNode, getChangedRanges: () => [] };
  }

  /**
   * Index a single file
   */
  async indexFile(filePath: string): Promise<void> {
    try {
      const startTime = performance.now();
      
      // Check if file should be indexed
      if (!this.shouldIndexFile(filePath)) {
        return;
      }

      // Read file content
      const content = await fs.readFile(filePath, 'utf-8');
      const hash = this.calculateHash(content);
      const language = this.detectLanguage(filePath);

      // Check if file needs re-indexing
      const existingIndex = this.fileIndexes.get(filePath);
      if (existingIndex && existingIndex.hash === hash) {
        return; // No changes
      }

      // Parse with Tree-sitter
      const languageParser = this.languages.get(language);
      if (!languageParser) {
        throw new Error(`No parser available for language: ${language}`);
      }

      const oldTree = existingIndex?.tree;
      const tree = languageParser.parse(content, oldTree);

      // Determine if this is incremental or cold start
      const isIncremental = !!oldTree && this.options.enableIncrementalUpdates;
      
      if (isIncremental) {
        await this.incrementalUpdate(filePath, content, tree, oldTree, hash, language);
        this.stats.incrementalUpdates++;
      } else {
        await this.fullIndex(filePath, content, tree, hash, language);
        this.stats.coldStarts++;
      }

      const processingTime = performance.now() - startTime;
      this.updateProcessingStats(processingTime);

      this.emit('file:indexed', {
        filePath,
        language,
        isIncremental,
        processingTime,
        symbolCount: this.fileIndexes.get(filePath)?.symbols.size || 0
      });

    } catch (error) {
      this.emit('file:error', filePath, error);
      throw error;
    }
  }

  /**
   * Perform full indexing of a file
   */
  private async fullIndex(
    filePath: string, 
    content: string, 
    tree: TreeSitterTree, 
    hash: string, 
    language: string
  ): Promise<void> {
    const symbols = new Map<string, CodeSymbol>();
    const chunks = new Map<string, CodeChunk>();

    // Extract symbols from AST
    this.extractSymbols(tree.rootNode, filePath, language, symbols);

    // Create code chunks
    this.createChunks(content, filePath, language, symbols, chunks);

    // Create file index
    const fileIndex: FileIndex = {
      filePath,
      language,
      hash,
      symbols,
      chunks,
      tree,
      lastIndexed: new Date(),
      version: 1
    };

    this.fileIndexes.set(filePath, fileIndex);

    // Update statistics
    this.stats.filesIndexed++;
    this.stats.symbolsExtracted += symbols.size;
    this.stats.chunksCreated += chunks.size;
    this.stats.totalTokens += Array.from(chunks.values()).reduce((sum, chunk) => sum + chunk.tokens, 0);

    // Queue for embedding if enabled
    if (this.options.enableEmbedding) {
      this.queueForEmbedding(filePath);
    }
  }

  /**
   * Perform incremental update of a file
   */
  private async incrementalUpdate(
    filePath: string,
    content: string,
    newTree: TreeSitterTree,
    oldTree: TreeSitterTree,
    hash: string,
    language: string
  ): Promise<void> {
    const existingIndex = this.fileIndexes.get(filePath)!;
    const changedRanges = newTree.getChangedRanges(oldTree);

    if (changedRanges.length === 0) {
      return; // No actual changes
    }

    // Update symbols incrementally
    this.updateSymbolsIncremental(newTree.rootNode, filePath, language, existingIndex.symbols, changedRanges);

    // Update chunks incrementally  
    this.updateChunksIncremental(content, filePath, language, existingIndex, changedRanges);

    // Update file index
    existingIndex.hash = hash;
    existingIndex.tree = newTree;
    existingIndex.lastIndexed = new Date();
    existingIndex.version++;

    // Queue changed chunks for re-embedding
    if (this.options.enableEmbedding) {
      this.queueChangedChunksForEmbedding(filePath, changedRanges);
    }
  }

  /**
   * Extract symbols from AST node recursively
   */
  private extractSymbols(
    node: TreeSitterNode,
    filePath: string,
    language: string,
    symbols: Map<string, CodeSymbol>,
    parent?: CodeSymbol
  ): void {
    const symbolType = this.getSymbolType(node, language);
    
    if (symbolType) {
      const symbol = this.createSymbol(node, filePath, symbolType, parent);
      symbols.set(symbol.id, symbol);

      // Process children with this symbol as parent
      for (const child of node.children) {
        this.extractSymbols(child, filePath, language, symbols, symbol);
      }
    } else {
      // Not a symbol node, continue with children
      for (const child of node.children) {
        this.extractSymbols(child, filePath, language, symbols, parent);
      }
    }
  }

  /**
   * Create code chunks from content
   */
  private createChunks(
    content: string,
    filePath: string,
    language: string,
    symbols: Map<string, CodeSymbol>,
    chunks: Map<string, CodeChunk>
  ): void {
    const lines = content.split('\n');
    let currentChunk: string[] = [];
    let currentTokens = 0;
    let chunkStartLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineTokens = this.estimateTokens(line);

      // Check if adding this line would exceed max tokens
      if (currentTokens + lineTokens > this.options.maxChunkTokens && currentChunk.length > 0) {
        // Create chunk from current content
        this.createChunkFromLines(
          currentChunk, 
          chunkStartLine, 
          i - 1, 
          filePath, 
          language, 
          symbols, 
          chunks
        );

        // Start new chunk with overlap
        const overlapLines = Math.min(
          Math.floor(this.options.overlapTokens / 10), // Rough estimate
          currentChunk.length
        );

        currentChunk = currentChunk.slice(-overlapLines);
        currentTokens = currentChunk.reduce((sum, l) => sum + this.estimateTokens(l), 0);
        chunkStartLine = i - overlapLines;
      }

      currentChunk.push(line);
      currentTokens += lineTokens;
    }

    // Create final chunk
    if (currentChunk.length > 0) {
      this.createChunkFromLines(
        currentChunk,
        chunkStartLine,
        lines.length - 1,
        filePath,
        language,
        symbols,
        chunks
      );
    }
  }

  /**
   * Create a chunk from lines
   */
  private createChunkFromLines(
    lines: string[],
    startLine: number,
    endLine: number,
    filePath: string,
    language: string,
    symbols: Map<string, CodeSymbol>,
    chunks: Map<string, CodeChunk>
  ): void {
    const content = lines.join('\n');
    const tokens = this.estimateTokens(content);

    // Only create chunk if it meets minimum size
    if (tokens < this.options.minChunkTokens) {
      return;
    }

    const hash = this.calculateHash(content);
    const chunkId = `${filePath}:${startLine}-${endLine}:${hash.substring(0, 8)}`;

    // Find symbols in this chunk
    const chunkSymbols = Array.from(symbols.values())
      .filter(symbol => 
        symbol.startLine >= startLine && 
        symbol.endLine <= endLine
      )
      .map(symbol => symbol.id);

    // Determine chunk type
    const chunkType = this.determineChunkType(content, chunkSymbols, symbols);

    const chunk: CodeChunk = {
      id: chunkId,
      filePath,
      content,
      tokens,
      startLine,
      endLine,
      symbols: chunkSymbols,
      hash,
      language,
      type: chunkType,
      lastModified: new Date()
    };

    chunks.set(chunkId, chunk);
  }

  /**
   * Helper methods for symbol and chunk processing
   */
  private shouldIndexFile(filePath: string): boolean {
    // Check file size
    try {
      const stats = require('fs').statSync(filePath);
      if (stats.size > this.options.maxFileSize) {
        return false;
      }
    } catch {
      return false;
    }

    // Check exclude patterns
    for (const pattern of this.options.excludePatterns) {
      if (pattern.test(filePath)) {
        return false;
      }
    }

    // Check supported language
    const language = this.detectLanguage(filePath);
    return this.options.supportedLanguages.includes(language);
  }

  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const extensionMap: Record<string, string> = {
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.py': 'python',
      '.rs': 'rust',
      '.go': 'go',
      '.java': 'java',
      '.cpp': 'cpp',
      '.cc': 'cpp',
      '.cxx': 'cpp',
      '.c': 'c',
      '.h': 'c',
      '.cs': 'csharp',
      '.php': 'php',
      '.rb': 'ruby'
    };

    return extensionMap[ext] || 'text';
  }

  private calculateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  private isFunction(line: string, language: string): boolean {
    switch (language) {
      case 'typescript':
      case 'javascript':
        return /^(export\s+)?(async\s+)?function\s+\w+/.test(line) ||
               /^\s*\w+\s*[:=]\s*(async\s+)?\([^)]*\)\s*=>/.test(line);
      case 'python':
        return /^\s*def\s+\w+/.test(line);
      case 'rust':
        return /^\s*(pub\s+)?fn\s+\w+/.test(line);
      case 'go':
        return /^\s*func\s+(\w+\s+)?\w+/.test(line);
      default:
        return false;
    }
  }

  private isClass(line: string, language: string): boolean {
    switch (language) {
      case 'typescript':
      case 'javascript':
        return /^(export\s+)?(abstract\s+)?class\s+\w+/.test(line);
      case 'python':
        return /^\s*class\s+\w+/.test(line);
      case 'rust':
        return /^\s*(pub\s+)?struct\s+\w+/.test(line) ||
               /^\s*(pub\s+)?enum\s+\w+/.test(line);
      case 'java':
      case 'csharp':
        return /^\s*(public\s+|private\s+|protected\s+)?(abstract\s+)?class\s+\w+/.test(line);
      default:
        return false;
    }
  }

  private isImport(line: string, language: string): boolean {
    switch (language) {
      case 'typescript':
      case 'javascript':
        return /^import\s+/.test(line) || /^export\s+.*from/.test(line);
      case 'python':
        return /^(from\s+\S+\s+)?import\s+/.test(line);
      case 'rust':
        return /^use\s+/.test(line);
      case 'go':
        return /^import\s+/.test(line);
      default:
        return false;
    }
  }

  private createFunctionNode(line: string, lineNumber: number, language: string): TreeSitterNode {
    return {
      type: 'function_declaration',
      text: line,
      startPosition: { row: lineNumber, column: 0 },
      endPosition: { row: lineNumber, column: line.length },
      children: [],
      id: crypto.randomUUID()
    };
  }

  private createClassNode(line: string, lineNumber: number, language: string): TreeSitterNode {
    return {
      type: 'class_declaration',
      text: line,
      startPosition: { row: lineNumber, column: 0 },
      endPosition: { row: lineNumber, column: line.length },
      children: [],
      id: crypto.randomUUID()
    };
  }

  private createImportNode(line: string, lineNumber: number, language: string): TreeSitterNode {
    return {
      type: 'import_statement',
      text: line,
      startPosition: { row: lineNumber, column: 0 },
      endPosition: { row: lineNumber, column: line.length },
      children: [],
      id: crypto.randomUUID()
    };
  }

  private getSymbolType(node: TreeSitterNode, language: string): CodeSymbol['type'] | null {
    const typeMap: Record<string, CodeSymbol['type']> = {
      'function_declaration': 'function',
      'method_definition': 'method',
      'class_declaration': 'class',
      'interface_declaration': 'interface',
      'variable_declaration': 'variable',
      'import_statement': 'import',
      'export_statement': 'export',
      'type_alias_declaration': 'type'
    };

    return typeMap[node.type] || null;
  }

  private createSymbol(
    node: TreeSitterNode,
    filePath: string,
    type: CodeSymbol['type'],
    parent?: CodeSymbol
  ): CodeSymbol {
    const name = this.extractSymbolName(node);
    const id = `${filePath}:${name}:${node.startPosition.row}`;

    return {
      id,
      name,
      type,
      filePath,
      startLine: node.startPosition.row,
      endLine: node.endPosition.row,
      startColumn: node.startPosition.column,
      endColumn: node.endPosition.column,
      text: node.text,
      dependencies: [],
      dependents: [],
      parent: parent?.id,
      children: [],
      metadata: {}
    };
  }

  private extractSymbolName(node: TreeSitterNode): string {
    // Extract name from different node types
    // This is simplified - real implementation would parse the AST properly
    const text = node.text.trim();
    
    if (node.type === 'function_declaration') {
      const match = text.match(/function\s+(\w+)/);
      return match ? match[1] : 'anonymous';
    }
    
    if (node.type === 'class_declaration') {
      const match = text.match(/class\s+(\w+)/);
      return match ? match[1] : 'Anonymous';
    }

    return 'unknown';
  }

  private updateSymbolsIncremental(
    node: TreeSitterNode,
    filePath: string,
    language: string,
    symbols: Map<string, CodeSymbol>,
    changedRanges: Range[]
  ): void {
    // Implementation would update only symbols in changed ranges
    // For now, just re-extract everything (simplified)
    symbols.clear();
    this.extractSymbols(node, filePath, language, symbols);
  }

  private updateChunksIncremental(
    content: string,
    filePath: string,
    language: string,
    fileIndex: FileIndex,
    changedRanges: Range[]
  ): void {
    // Implementation would update only chunks that overlap with changed ranges
    // For now, just recreate all chunks (simplified)
    fileIndex.chunks.clear();
    this.createChunks(content, filePath, language, fileIndex.symbols, fileIndex.chunks);
  }

  private determineChunkType(
    content: string,
    symbolIds: string[],
    allSymbols: Map<string, CodeSymbol>
  ): CodeChunk['type'] {
    if (symbolIds.length === 0) {
      return content.trim().startsWith('//') || content.trim().startsWith('/*') ? 'comment' : 'mixed';
    }

    const symbols = symbolIds.map(id => allSymbols.get(id)!).filter(Boolean);
    const types = new Set(symbols.map(s => s.type));

    if (types.size === 1) {
      const type = Array.from(types)[0];
      return type === 'import' ? 'import' : 
             type === 'function' ? 'function' :
             type === 'class' ? 'class' : 'mixed';
    }

    return 'mixed';
  }

  private queueForEmbedding(filePath: string): void {
    // Queue file for embedding processing
    this.emit('embedding:queued', filePath);
  }

  private queueChangedChunksForEmbedding(filePath: string, changedRanges: Range[]): void {
    // Queue specific chunks for re-embedding
    this.emit('embedding:chunks_changed', filePath, changedRanges);
  }

  private updateProcessingStats(processingTime: number): void {
    this.processingTimes.push(processingTime);
    
    if (this.processingTimes.length > 100) {
      this.processingTimes.shift();
    }

    this.stats.averageProcessingTime = 
      this.processingTimes.reduce((sum, time) => sum + time, 0) / this.processingTimes.length;
    this.stats.lastIndexTime = Date.now();
  }

  /**
   * Public API methods
   */
  
  /**
   * Index multiple files
   */
  async indexFiles(filePaths: string[]): Promise<void> {
    const startTime = performance.now();
    
    for (const filePath of filePaths) {
      await this.indexFile(filePath);
    }

    const totalTime = performance.now() - startTime;
    this.emit('indexing:completed', {
      fileCount: filePaths.length,
      totalTime,
      averageTime: totalTime / filePaths.length
    });
  }

  /**
   * Get symbols for a file
   */
  getFileSymbols(filePath: string): CodeSymbol[] {
    const fileIndex = this.fileIndexes.get(filePath);
    return fileIndex ? Array.from(fileIndex.symbols.values()) : [];
  }

  /**
   * Get chunks for a file
   */
  getFileChunks(filePath: string): CodeChunk[] {
    const fileIndex = this.fileIndexes.get(filePath);
    return fileIndex ? Array.from(fileIndex.chunks.values()) : [];
  }

  /**
   * Search symbols by name
   */
  searchSymbols(query: string, type?: CodeSymbol['type']): CodeSymbol[] {
    const results: CodeSymbol[] = [];
    
    for (const fileIndex of this.fileIndexes.values()) {
      for (const symbol of fileIndex.symbols.values()) {
        if (symbol.name.toLowerCase().includes(query.toLowerCase())) {
          if (!type || symbol.type === type) {
            results.push(symbol);
          }
        }
      }
    }

    return results;
  }

  /**
   * Get indexing statistics
   */
  getStats(): IndexingStats {
    return { ...this.stats };
  }

  /**
   * Remove file from index
   */
  removeFile(filePath: string): void {
    this.fileIndexes.delete(filePath);
    this.emit('file:removed', filePath);
  }

  /**
   * Clear all indexes
   */
  clear(): void {
    this.fileIndexes.clear();
    this.stats = {
      filesIndexed: 0,
      symbolsExtracted: 0,
      chunksCreated: 0,
      totalTokens: 0,
      averageProcessingTime: 0,
      lastIndexTime: 0,
      incrementalUpdates: 0,
      coldStarts: 0
    };
    this.emit('index:cleared');
  }

  /**
   * Get all indexed files
   */
  getIndexedFiles(): string[] {
    return Array.from(this.fileIndexes.keys());
  }

  /**
   * Check if file is indexed
   */
  isFileIndexed(filePath: string): boolean {
    return this.fileIndexes.has(filePath);
  }
}

// Default instance
export const astIndexer = new ASTIndexer({
  maxChunkTokens: 200,
  minChunkTokens: 50,
  overlapTokens: 20,
  enableIncrementalUpdates: true,
  enableEmbedding: false
});

export default ASTIndexer; 