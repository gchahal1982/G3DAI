import { ContextChunk } from './Retriever';

/**
 * PromptAssembler - Prompt construction with context injection
 * 
 * Builds final prompts with retrieved context, implements context compression,
 * and optimizes prompts for different model types and capabilities.
 */

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  maxTokens: number;
  modelTypes: string[]; // Which models this template works well with
  contextSlots: {
    name: string;
    required: boolean;
    maxTokens: number;
    compression?: 'none' | 'summarize' | 'extract_symbols' | 'smart_truncate';
  }[];
}

export interface PromptContext {
  intent: string;
  userQuery?: string;
  currentFile?: string;
  currentSelection?: string;
  cursorPosition?: { line: number; column: number };
  recentFiles?: string[];
  errorMessages?: string[];
  contextChunks: ContextChunk[];
  metadata?: Record<string, any>;
}

export interface AssembledPrompt {
  prompt: string;
  tokenCount: number;
  template: PromptTemplate;
  context: {
    chunks: ContextChunk[];
    compression: {
      originalTokens: number;
      compressedTokens: number;
      compressionRatio: number;
    };
  };
  safety: {
    withinTokenLimit: boolean;
    safetyMargin: number;
    truncatedContent?: string[];
  };
  optimizations: {
    templateUsed: string;
    compressionApplied: string[];
    modelSpecificAdjustments: string[];
  };
}

export interface CompressionResult {
  content: string;
  originalTokens: number;
  compressedTokens: number;
  method: string;
  metadata?: Record<string, any>;
}

export class PromptAssembler {
  private templates: Map<string, PromptTemplate> = new Map();
  private tokenLimit: number = 4000; // Default token limit
  private safetyMargin: number = 200; // Reserve tokens for response

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Assemble prompt with retrieved context
   */
  public async assemblePrompt(
    context: PromptContext,
    templateId: string = 'default',
    targetModel?: string
  ): Promise<AssembledPrompt> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Adjust settings for target model
    if (targetModel) {
      this.adjustForModel(targetModel);
    }

    // Calculate available tokens for context
    const basePromptTokens = this.estimateTokens(template.template);
    const availableTokens = this.tokenLimit - this.safetyMargin - basePromptTokens;

    // Compress and fit context within token budget
    const compressedContext = await this.compressContext(context.contextChunks, availableTokens);

    // Build the final prompt
    const assembledPrompt = this.buildPrompt(template, context, compressedContext);

    // Validate token limits
    const finalTokenCount = this.estimateTokens(assembledPrompt);
    const withinLimit = finalTokenCount <= this.tokenLimit - this.safetyMargin;

    return {
      prompt: assembledPrompt,
      tokenCount: finalTokenCount,
      template,
      context: {
        chunks: compressedContext.chunks,
        compression: {
          originalTokens: compressedContext.originalTokens,
          compressedTokens: compressedContext.compressedTokens,
          compressionRatio: compressedContext.compressionRatio
        }
      },
      safety: {
        withinTokenLimit: withinLimit,
        safetyMargin: this.tokenLimit - finalTokenCount,
        ...(compressedContext.truncatedContent && { truncatedContent: compressedContext.truncatedContent })
      },
      optimizations: {
        templateUsed: templateId,
        compressionApplied: compressedContext.methods,
        modelSpecificAdjustments: targetModel ? this.getModelAdjustments(targetModel) : []
      }
    };
  }

  /**
   * Compress context to fit within token budget
   */
  private async compressContext(
    chunks: ContextChunk[], 
    tokenBudget: number
  ): Promise<{
    chunks: ContextChunk[];
    originalTokens: number;
    compressedTokens: number;
    compressionRatio: number;
    methods: string[];
    truncatedContent?: string[];
  }> {
    let workingChunks = [...chunks];
    let totalTokens = workingChunks.reduce((sum, chunk) => sum + this.estimateTokens(chunk.content), 0);
    const originalTokens = totalTokens;
    const methods: string[] = [];
    const truncatedContent: string[] = [];

    // If we're already within budget, return as-is
    if (totalTokens <= tokenBudget) {
      return {
        chunks: workingChunks,
        originalTokens,
        compressedTokens: totalTokens,
        compressionRatio: 1,
        methods: []
      };
    }

    // Strategy 1: Remove duplicate content
    workingChunks = this.removeDuplicateContent(workingChunks);
    totalTokens = workingChunks.reduce((sum, chunk) => sum + this.estimateTokens(chunk.content), 0);
    if (totalTokens !== originalTokens) {
      methods.push('duplicate_removal');
    }

    // Strategy 2: Smart truncation of large chunks
    if (totalTokens > tokenBudget) {
      const truncationResult = this.smartTruncateChunks(workingChunks, tokenBudget);
      workingChunks = truncationResult.chunks;
      totalTokens = truncationResult.totalTokens;
      truncatedContent.push(...truncationResult.truncatedContent);
      methods.push('smart_truncation');
    }

    // Strategy 3: Prioritize chunks by relevance and remove least important
    if (totalTokens > tokenBudget) {
      const prioritizationResult = this.prioritizeAndTrim(workingChunks, tokenBudget);
      workingChunks = prioritizationResult.chunks;
      totalTokens = prioritizationResult.totalTokens;
      truncatedContent.push(...prioritizationResult.removedContent);
      methods.push('relevance_filtering');
    }

    // Strategy 4: Extract key symbols/imports if still over budget
    if (totalTokens > tokenBudget) {
      const extractionResult = this.extractKeySymbols(workingChunks, tokenBudget);
      workingChunks = extractionResult.chunks;
      totalTokens = extractionResult.totalTokens;
      methods.push('symbol_extraction');
    }

    const result = {
      chunks: workingChunks,
      originalTokens,
      compressedTokens: totalTokens,
      compressionRatio: totalTokens / originalTokens,
      methods
    };

    if (truncatedContent.length > 0) {
      return { ...result, truncatedContent };
    }

    return result;
  }

  /**
   * Remove duplicate or highly similar content
   */
  private removeDuplicateContent(chunks: ContextChunk[]): ContextChunk[] {
    const uniqueChunks: ContextChunk[] = [];
    const seenContent = new Set<string>();

    for (const chunk of chunks) {
      // Create a normalized version for comparison
      const normalized = chunk.content
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

      if (!seenContent.has(normalized)) {
        seenContent.add(normalized);
        uniqueChunks.push(chunk);
      }
    }

    return uniqueChunks;
  }

  /**
   * Smart truncation that preserves important code structures
   */
  private smartTruncateChunks(
    chunks: ContextChunk[], 
    tokenBudget: number
  ): { chunks: ContextChunk[]; totalTokens: number; truncatedContent: string[] } {
    const truncatedChunks: ContextChunk[] = [];
    const truncatedContent: string[] = [];
    let totalTokens = 0;

    for (const chunk of chunks) {
      const chunkTokens = this.estimateTokens(chunk.content);
      
      if (totalTokens + chunkTokens <= tokenBudget) {
        // Chunk fits entirely
        truncatedChunks.push(chunk);
        totalTokens += chunkTokens;
      } else {
        // Need to truncate this chunk
        const remainingBudget = tokenBudget - totalTokens;
        if (remainingBudget > 100) { // Only truncate if we have meaningful space
          const truncatedContent_local = this.truncateChunkIntelligently(chunk.content, remainingBudget);
          const truncatedChunk: ContextChunk = {
            ...chunk,
            content: truncatedContent_local
          };
          truncatedChunks.push(truncatedChunk);
          totalTokens += this.estimateTokens(truncatedContent_local);
          truncatedContent.push(`Truncated content from ${chunk.filePath}:${chunk.startLine}`);
        }
        break; // No more budget
      }
    }

    return { chunks: truncatedChunks, totalTokens, truncatedContent };
  }

  /**
   * Intelligently truncate a chunk preserving key structures
   */
  private truncateChunkIntelligently(content: string, tokenBudget: number): string {
    const lines = content.split('\n');
    const targetChars = tokenBudget * 4; // Rough estimation: 4 chars per token
    
    if (content.length <= targetChars) {
      return content;
    }

    // Strategy: Keep function signatures, class definitions, imports
    const importantLines: string[] = [];
    const regularLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.startsWith('import ') ||
        trimmed.startsWith('export ') ||
        trimmed.includes('function ') ||
        trimmed.includes('class ') ||
        trimmed.includes('interface ') ||
        trimmed.includes('type ') ||
        trimmed.includes('=>') ||
        trimmed.includes('{') && !trimmed.includes('}')
      ) {
        importantLines.push(line);
      } else {
        regularLines.push(line);
      }
    }

    // Build truncated content
    let result = importantLines.join('\n');
    
    // Add regular lines until we hit the budget
    for (const line of regularLines) {
      if (result.length + line.length + 1 <= targetChars) {
        result += '\n' + line;
      } else {
        result += '\n// ... [truncated]';
        break;
      }
    }

    return result;
  }

  /**
   * Prioritize chunks by relevance and remove least important
   */
  private prioritizeAndTrim(
    chunks: ContextChunk[], 
    tokenBudget: number
  ): { chunks: ContextChunk[]; totalTokens: number; removedContent: string[] } {
    // Sort chunks by relevance (number of symbols, recency, etc.)
    const prioritizedChunks = chunks.sort((a, b) => {
      const scoreA = a.symbols.length * 2 + (Date.now() - a.lastModified) / 1000000;
      const scoreB = b.symbols.length * 2 + (Date.now() - b.lastModified) / 1000000;
      return scoreB - scoreA; // Higher score = more important
    });

    const selectedChunks: ContextChunk[] = [];
    const removedContent: string[] = [];
    let totalTokens = 0;

    for (const chunk of prioritizedChunks) {
      const chunkTokens = this.estimateTokens(chunk.content);
      
      if (totalTokens + chunkTokens <= tokenBudget) {
        selectedChunks.push(chunk);
        totalTokens += chunkTokens;
      } else {
        removedContent.push(`Removed ${chunk.filePath}:${chunk.startLine}-${chunk.endLine}`);
      }
    }

    return { chunks: selectedChunks, totalTokens, removedContent };
  }

  /**
   * Extract key symbols when still over budget
   */
  private extractKeySymbols(
    chunks: ContextChunk[], 
    tokenBudget: number
  ): { chunks: ContextChunk[]; totalTokens: number } {
    const symbolChunks: ContextChunk[] = [];
    let totalTokens = 0;

    for (const chunk of chunks) {
      // Extract just the key symbols and their signatures
      const symbols = this.extractSymbolSignatures(chunk.content);
      const symbolContent = symbols.join('\n');
      const symbolTokens = this.estimateTokens(symbolContent);

      if (totalTokens + symbolTokens <= tokenBudget && symbols.length > 0) {
        const symbolChunk: ContextChunk = {
          ...chunk,
          content: symbolContent
        };
        symbolChunks.push(symbolChunk);
        totalTokens += symbolTokens;
      }
    }

    return { chunks: symbolChunks, totalTokens };
  }

  /**
   * Extract symbol signatures from code content
   */
  private extractSymbolSignatures(content: string): string[] {
    const lines = content.split('\n');
    const signatures: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Function signatures
      if (trimmed.match(/^(export\s+)?(async\s+)?function\s+\w+/)) {
        signatures.push(line);
      }
      
      // Class definitions
      if (trimmed.match(/^(export\s+)?class\s+\w+/)) {
        signatures.push(line);
      }
      
      // Interface definitions
      if (trimmed.match(/^(export\s+)?interface\s+\w+/)) {
        signatures.push(line);
      }
      
      // Type definitions
      if (trimmed.match(/^(export\s+)?type\s+\w+/)) {
        signatures.push(line);
      }
      
      // Imports/exports
      if (trimmed.startsWith('import ') || trimmed.startsWith('export ')) {
        signatures.push(line);
      }
    }

    return signatures;
  }

  /**
   * Build the final prompt from template and context
   */
  private buildPrompt(
    template: PromptTemplate, 
    context: PromptContext, 
    compressedContext: any
  ): string {
    let prompt = template.template;

    // Replace template variables
    const variables = {
      intent: context.intent,
      user_query: context.userQuery || '',
      current_file: context.currentFile || '',
      current_selection: context.currentSelection || '',
      cursor_position: context.cursorPosition ? `${context.cursorPosition.line}:${context.cursorPosition.column}` : '',
      recent_files: context.recentFiles?.join(', ') || '',
      error_messages: context.errorMessages?.join('\n') || '',
      context_chunks: this.formatContextChunks(compressedContext.chunks),
      timestamp: new Date().toISOString()
    };

    // Replace all variables in template
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      prompt = prompt.replace(regex, value);
    }

    return prompt;
  }

  /**
   * Format context chunks for prompt inclusion
   */
  private formatContextChunks(chunks: ContextChunk[]): string {
    return chunks.map(chunk => {
      const fileInfo = `File: ${chunk.filePath}:${chunk.startLine}-${chunk.endLine}`;
      const symbols = chunk.symbols.length > 0 ? `\nSymbols: ${chunk.symbols.join(', ')}` : '';
      return `${fileInfo}${symbols}\n\`\`\`\n${chunk.content}\n\`\`\``;
    }).join('\n\n');
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token on average
    return Math.ceil(text.length / 4);
  }

  /**
   * Adjust settings for specific model
   */
  private adjustForModel(modelType: string): void {
    switch (modelType) {
      case 'qwen3-coder':
        this.tokenLimit = 32000; // Qwen3 supports long context
        break;
      case 'phi-4-mini':
        this.tokenLimit = 4000; // Smaller model, smaller context
        break;
      case 'codellama':
        this.tokenLimit = 16000;
        break;
      case 'deepseek-r1':
        this.tokenLimit = 64000; // Very large context window
        break;
      default:
        this.tokenLimit = 4000; // Conservative default
    }
  }

  /**
   * Get model-specific adjustments applied
   */
  private getModelAdjustments(modelType: string): string[] {
    const adjustments: string[] = [];
    
    switch (modelType) {
      case 'qwen3-coder':
        adjustments.push('Extended context window to 32K tokens');
        adjustments.push('Optimized for code generation tasks');
        break;
      case 'phi-4-mini':
        adjustments.push('Reduced context window to 4K tokens');
        adjustments.push('Increased compression ratio');
        break;
      case 'deepseek-r1':
        adjustments.push('Extended context window to 64K tokens');
        adjustments.push('Enhanced reasoning prompt format');
        break;
    }
    
    return adjustments;
  }

  /**
   * Initialize default prompt templates
   */
  private initializeDefaultTemplates(): void {
    // Default code completion template
    this.templates.set('default', {
      id: 'default',
      name: 'Code Completion',
      description: 'General purpose code completion with context',
      template: `You are an expert programmer assistant. Based on the provided context, help with the user's request.

Current Intent: {{intent}}
Current File: {{current_file}}
Cursor Position: {{cursor_position}}

Context:
{{context_chunks}}

User Query: {{user_query}}

Please provide a helpful response based on the context above.`,
      variables: ['intent', 'current_file', 'cursor_position', 'context_chunks', 'user_query'],
      maxTokens: 4000,
      modelTypes: ['all'],
      contextSlots: [
        {
          name: 'context_chunks',
          required: true,
          maxTokens: 3000,
          compression: 'smart_truncate'
        }
      ]
    });

    // Refactoring template
    this.templates.set('refactoring', {
      id: 'refactoring',
      name: 'Code Refactoring',
      description: 'Template for code refactoring tasks',
      template: `You are an expert software architect. Analyze the provided code and suggest refactoring improvements.

Context:
{{context_chunks}}

Current Selection: {{current_selection}}
Intent: {{intent}}

Please analyze the code structure and suggest specific refactoring improvements focusing on:
1. Code organization and structure
2. Performance optimizations
3. Maintainability improvements
4. Best practices adherence

User Query: {{user_query}}`,
      variables: ['context_chunks', 'current_selection', 'intent', 'user_query'],
      maxTokens: 4000,
      modelTypes: ['all'],
      contextSlots: [
        {
          name: 'context_chunks',
          required: true,
          maxTokens: 3000,
          compression: 'extract_symbols'
        }
      ]
    });

    // Debugging template
    this.templates.set('debugging', {
      id: 'debugging',
      name: 'Debug Assistance',
      description: 'Template for debugging and error resolution',
      template: `You are an expert debugger. Help identify and fix the issue based on the provided context.

Error Messages:
{{error_messages}}

Context:
{{context_chunks}}

Current File: {{current_file}}
Recent Files: {{recent_files}}

Please analyze the error and provide:
1. Root cause analysis
2. Specific fix recommendations
3. Prevention strategies

User Query: {{user_query}}`,
      variables: ['error_messages', 'context_chunks', 'current_file', 'recent_files', 'user_query'],
      maxTokens: 4000,
      modelTypes: ['all'],
      contextSlots: [
        {
          name: 'context_chunks',
          required: true,
          maxTokens: 2500,
          compression: 'smart_truncate'
        }
      ]
    });
  }

  /**
   * Add custom template
   */
  public addTemplate(template: PromptTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get available templates
   */
  public getTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Validate prompt assembly
   */
  public validatePrompt(prompt: AssembledPrompt): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!prompt.safety.withinTokenLimit) {
      issues.push('Prompt exceeds token limit');
      recommendations.push('Apply more aggressive compression');
    }

    if (prompt.safety.safetyMargin < 100) {
      issues.push('Safety margin too small');
      recommendations.push('Reduce context or increase compression');
    }

    if (prompt.context.compression.compressionRatio < 0.3) {
      recommendations.push('High compression ratio - consider reviewing context relevance');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }
}

export default PromptAssembler; 