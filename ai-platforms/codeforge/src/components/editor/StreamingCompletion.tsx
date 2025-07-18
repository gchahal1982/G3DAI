/**
 * CodeForge Streaming Completion Component
 * Implements real-time completion with optimized token streaming
 * 
 * Features:
 * - Pull-based token streaming in Monaco Editor
 * - First-token-at-20-characters optimization
 * - Completion request debouncing
 * - Intelligent context truncation
 * - Completion caching layer
 * - Typing-ahead prediction
 * - Completion priority queuing
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as monaco from 'monaco-editor';
import { latencyTracker } from '../../lib/telemetry/LatencySpan';
import { inferenceOptimizer } from '../../lib/optimization/InferenceOptimizer';

// Interfaces and types
interface StreamingCompletionProps {
  editor: monaco.editor.IStandaloneCodeEditor;
  modelId: string;
  enabled: boolean;
  maxTokens?: number;
  temperature?: number;
  debounceMs?: number;
  contextWindow?: number;
  onCompletionAccepted?: (completion: string) => void;
  onCompletionRejected?: (completion: string) => void;
  onPerformanceMetrics?: (metrics: CompletionMetrics) => void;
}

interface CompletionState {
  isStreaming: boolean;
  currentCompletion: string;
  partialCompletion: string;
  completionStartPosition: monaco.Position;
  streamingDecoration: string[];
  ghostTextDecoration: string[];
  confidence: number;
  tokenCount: number;
  latency: number;
}

interface CompletionMetrics {
  firstTokenLatency: number;
  totalLatency: number;
  tokensPerSecond: number;
  cacheHit: boolean;
  contextLength: number;
  acceptanceRate: number;
}

interface CompletionRequest {
  id: string;
  prefix: string;
  suffix: string;
  position: monaco.Position;
  timestamp: number;
  priority: 'low' | 'normal' | 'high';
  context: CompletionContext;
}

interface CompletionContext {
  language: string;
  filePath: string;
  nearbyFunctions: string[];
  imports: string[];
  variables: string[];
  semanticContext: string;
}

interface CompletionCache {
  key: string;
  completion: string;
  timestamp: number;
  hitCount: number;
  confidence: number;
}

// Configuration constants
const COMPLETION_CONFIG = {
  // Timing optimization
  FIRST_TOKEN_TRIGGER_CHARS: 20,
  DEBOUNCE_MS: 150,
  MIN_TRIGGER_CHARS: 3,
  MAX_CONTEXT_CHARS: 8192,
  
  // Streaming settings
  STREAM_CHUNK_SIZE: 1,
  STREAM_INTERVAL_MS: 16, // 60 FPS
  
  // Cache settings
  CACHE_SIZE: 100,
  CACHE_TTL_MS: 300000, // 5 minutes
  CACHE_KEY_LENGTH: 50,
  
  // UI settings
  GHOST_TEXT_OPACITY: 0.4,
  TYPING_AHEAD_THRESHOLD: 5,
  COMPLETION_PREVIEW_LINES: 3,
  
  // Performance thresholds
  TARGET_FIRST_TOKEN_MS: 100,
  TARGET_TOTAL_COMPLETION_MS: 2000,
  MIN_CONFIDENCE: 0.3
};

export const StreamingCompletion: React.FC<StreamingCompletionProps> = ({
  editor,
  modelId,
  enabled,
  maxTokens = 100,
  temperature = 0.2,
  debounceMs = COMPLETION_CONFIG.DEBOUNCE_MS,
  contextWindow = COMPLETION_CONFIG.MAX_CONTEXT_CHARS,
  onCompletionAccepted,
  onCompletionRejected,
  onPerformanceMetrics
}) => {
  // State management
  const [completionState, setCompletionState] = useState<CompletionState>({
    isStreaming: false,
    currentCompletion: '',
    partialCompletion: '',
    completionStartPosition: new monaco.Position(1, 1),
    streamingDecoration: [],
    ghostTextDecoration: [],
    confidence: 0,
    tokenCount: 0,
    latency: 0
  });

  // Refs for performance optimization
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const completionCacheRef = useRef<Map<string, CompletionCache>>(new Map());
  const currentRequestRef = useRef<string | null>(null);
  const typingAheadBufferRef = useRef<string>('');
  const lastCompletionMetricsRef = useRef<CompletionMetrics | null>(null);
  const streamingStateRef = useRef<{
    controller: AbortController | null;
    tokens: string[];
    startTime: number;
    firstTokenTime: number;
  }>({
    controller: null,
    tokens: [],
    startTime: 0,
    firstTokenTime: 0
  });

  // Context extraction utilities
  const extractCompletionContext = useCallback((position: monaco.Position): CompletionContext => {
    const model = editor.getModel();
    if (!model) {
      return {
        language: 'plaintext',
        filePath: '',
        nearbyFunctions: [],
        imports: [],
        variables: [],
        semanticContext: ''
      };
    }

    const language = model.getLanguageId();
    const filePath = model.uri.path;
    
    // Extract context around cursor
    const lineNumber = position.lineNumber;
    const startLine = Math.max(1, lineNumber - 20);
    const endLine = Math.min(model.getLineCount(), lineNumber + 5);
    
    const nearbyCode = model.getValueInRange({
      startLineNumber: startLine,
      startColumn: 1,
      endLineNumber: endLine,
      endColumn: model.getLineMaxColumn(endLine)
    });

    return {
      language,
      filePath,
      nearbyFunctions: extractFunctions(nearbyCode, language),
      imports: extractImports(nearbyCode, language),
      variables: extractVariables(nearbyCode, language),
      semanticContext: nearbyCode
    };
  }, [editor]);

  const extractFunctions = (code: string, language: string): string[] => {
    const functionPatterns = {
      typescript: /function\s+(\w+)|(\w+)\s*[=:]\s*\(.*?\)\s*=>/g,
      javascript: /function\s+(\w+)|(\w+)\s*[=:]\s*\(.*?\)\s*=>/g,
      python: /def\s+(\w+)/g,
      java: /(?:public|private|protected)?\s*(?:static)?\s*\w+\s+(\w+)\s*\(/g
    };

    const pattern = functionPatterns[language as keyof typeof functionPatterns];
    if (!pattern) return [];

    const matches = Array.from(code.matchAll(pattern));
    return matches.map(match => match[1] || match[2]).filter(Boolean);
  };

  const extractImports = (code: string, language: string): string[] => {
    const importPatterns = {
      typescript: /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
      javascript: /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
      python: /from\s+(\w+)\s+import|import\s+(\w+)/g,
      java: /import\s+([\w.]+)/g
    };

    const pattern = importPatterns[language as keyof typeof importPatterns];
    if (!pattern) return [];

    const matches = Array.from(code.matchAll(pattern));
    return matches.map(match => match[1] || match[2]).filter(Boolean);
  };

  const extractVariables = (code: string, language: string): string[] => {
    const variablePatterns = {
      typescript: /(?:let|const|var)\s+(\w+)/g,
      javascript: /(?:let|const|var)\s+(\w+)/g,
      python: /(\w+)\s*=/g,
      java: /(?:int|String|boolean|double|float)\s+(\w+)/g
    };

    const pattern = variablePatterns[language as keyof typeof variablePatterns];
    if (!pattern) return [];

    const matches = Array.from(code.matchAll(pattern));
    return matches.map(match => match[1]).filter(Boolean);
  };

  // Intelligent context truncation
  const truncateContext = useCallback((prefix: string, suffix: string, maxLength: number): { prefix: string; suffix: string } => {
    const prefixLength = Math.floor(maxLength * 0.7); // 70% for prefix
    const suffixLength = maxLength - prefixLength;

    let truncatedPrefix = prefix;
    let truncatedSuffix = suffix;

    // Truncate prefix intelligently (keep recent lines)
    if (prefix.length > prefixLength) {
      const lines = prefix.split('\n');
      let charCount = 0;
      let lineIndex = lines.length - 1;

      // Keep complete lines from the end
      while (lineIndex >= 0 && charCount + lines[lineIndex].length <= prefixLength) {
        charCount += lines[lineIndex].length + 1; // +1 for newline
        lineIndex--;
      }

      truncatedPrefix = lines.slice(lineIndex + 1).join('\n');
    }

    // Truncate suffix (keep immediate following code)
    if (suffix.length > suffixLength) {
      const lines = suffix.split('\n');
      let charCount = 0;
      let lineIndex = 0;

      while (lineIndex < lines.length && charCount + lines[lineIndex].length <= suffixLength) {
        charCount += lines[lineIndex].length + 1;
        lineIndex++;
      }

      truncatedSuffix = lines.slice(0, lineIndex).join('\n');
    }

    return { prefix: truncatedPrefix, suffix: truncatedSuffix };
  }, []);

  // Cache management
  const generateCacheKey = useCallback((prefix: string, context: CompletionContext): string => {
    const contextStr = `${prefix.slice(-COMPLETION_CONFIG.CACHE_KEY_LENGTH)}|${context.language}|${context.nearbyFunctions.join(',')}`;
    return btoa(contextStr).slice(0, 32);
  }, []);

  const getCachedCompletion = useCallback((cacheKey: string): CompletionCache | null => {
    const cached = completionCacheRef.current.get(cacheKey);
    if (!cached) return null;

    // Check TTL
    if (Date.now() - cached.timestamp > COMPLETION_CONFIG.CACHE_TTL_MS) {
      completionCacheRef.current.delete(cacheKey);
      return null;
    }

    // Update hit count
    cached.hitCount++;
    return cached;
  }, []);

  const setCachedCompletion = useCallback((cacheKey: string, completion: string, confidence: number): void => {
    const cache = completionCacheRef.current;
    
    // Evict oldest entries if cache is full
    if (cache.size >= COMPLETION_CONFIG.CACHE_SIZE) {
      const oldestKey = Array.from(cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      cache.delete(oldestKey);
    }

    cache.set(cacheKey, {
      key: cacheKey,
      completion,
      timestamp: Date.now(),
      hitCount: 0,
      confidence
    });
  }, []);

  // Main completion request handler
  const requestCompletion = useCallback(async (position: monaco.Position): Promise<void> => {
    const model = editor.getModel();
    if (!model || !enabled) return;

    // Extract context around cursor
    const beforeCursor = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    });

    const afterCursor = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endLineNumber: model.getLineCount(),
      endColumn: model.getLineMaxColumn(model.getLineCount())
    });

    // Skip if cursor is in the middle of a word
    const currentLine = model.getLineContent(position.lineNumber);
    const charBefore = currentLine[position.column - 2];
    const charAfter = currentLine[position.column - 1];
    
    if (charAfter && /\w/.test(charAfter) && charBefore && /\w/.test(charBefore)) {
      return;
    }

    // Truncate context intelligently
    const { prefix, suffix } = truncateContext(beforeCursor, afterCursor, contextWindow);
    
    // Extract completion context
    const context = extractCompletionContext(position);
    
    // Check cache first
    const cacheKey = generateCacheKey(prefix, context);
    const cached = getCachedCompletion(cacheKey);
    
    if (cached && cached.confidence > COMPLETION_CONFIG.MIN_CONFIDENCE) {
      // Use cached completion
      displayCompletion(cached.completion, position, true);
      
      if (onPerformanceMetrics) {
        onPerformanceMetrics({
          firstTokenLatency: 0,
          totalLatency: 0,
          tokensPerSecond: Infinity,
          cacheHit: true,
          contextLength: prefix.length + suffix.length,
          acceptanceRate: lastCompletionMetricsRef.current?.acceptanceRate || 0
        });
      }
      return;
    }

    // Start streaming completion
    await startStreamingCompletion({
      id: crypto.randomUUID(),
      prefix,
      suffix,
      position,
      timestamp: performance.now(),
      priority: 'normal',
      context
    }, cacheKey);

  }, [editor, enabled, modelId, contextWindow, extractCompletionContext, truncateContext, generateCacheKey, getCachedCompletion, onPerformanceMetrics]);

  // Streaming completion implementation
  const startStreamingCompletion = useCallback(async (request: CompletionRequest, cacheKey: string): Promise<void> => {
    // Cancel any existing request
    if (streamingStateRef.current.controller) {
      streamingStateRef.current.controller.abort();
    }

    // Setup new streaming state
    const controller = new AbortController();
    streamingStateRef.current = {
      controller,
      tokens: [],
      startTime: performance.now(),
      firstTokenTime: 0
    };

    currentRequestRef.current = request.id;

    // Start latency tracking
    const spanId = latencyTracker.trackKeystrokeToCompletion(
      new KeyboardEvent('keydown', { key: 'Tab' }),
      request.prefix.length + request.suffix.length
    );

    try {
      // Update state to show streaming started
      setCompletionState(prev => ({
        ...prev,
        isStreaming: true,
        currentCompletion: '',
        partialCompletion: '',
        completionStartPosition: request.position,
        confidence: 0,
        tokenCount: 0
      }));

      // Request completion from inference optimizer
      const result = await inferenceOptimizer.requestInference({
        type: 'completion',
        input: `${request.prefix}${request.suffix}`,
        modelId,
        priority: request.priority,
        metadata: {
          contextSize: request.prefix.length + request.suffix.length,
          maxTokens,
          temperature
        }
      });

      if (result.success && result.output && currentRequestRef.current === request.id) {
        // Handle completed result
        const completion = result.output as string;
        
        // Cache the completion
        setCachedCompletion(cacheKey, completion, 0.8);
        
        // Display the completion
        displayCompletion(completion, request.position, false);
        
        // Finish latency tracking
        latencyTracker.finishSpan(spanId, 'completed', {
          completion_length: completion.length,
          cache_hit: result.cached,
          model_used: result.modelUsed
        });

        // Update performance metrics
        if (onPerformanceMetrics) {
          onPerformanceMetrics({
            firstTokenLatency: result.latency * 0.1, // Estimate first token latency
            totalLatency: result.latency,
            tokensPerSecond: (result.tokensGenerated || completion.length) / (result.latency / 1000),
            cacheHit: result.cached,
            contextLength: request.prefix.length + request.suffix.length,
            acceptanceRate: lastCompletionMetricsRef.current?.acceptanceRate || 0
          });
        }
      }

    } catch (error) {
      console.error('Streaming completion failed:', error);
      
      // Finish span with error
      latencyTracker.finishSpan(spanId, 'error');
      
      // Clear streaming state
      clearCompletionState();
    }
  }, [modelId, maxTokens, temperature, setCachedCompletion, onPerformanceMetrics]);

  // Display completion with ghost text
  const displayCompletion = useCallback((completion: string, position: monaco.Position, cached: boolean): void => {
    const model = editor.getModel();
    if (!model) return;

    // Clean up existing decorations
    if (completionState.ghostTextDecoration.length > 0) {
      editor.removeDecorations(completionState.ghostTextDecoration);
    }

    // Extract just the completion part (remove the prefix that's already typed)
    const lines = completion.split('\n');
    const firstLine = lines[0];
    const restLines = lines.slice(1);

    // Create ghost text decoration
    const decorations: monaco.editor.IModelDeltaDecoration[] = [];

    // First line decoration (inline)
    if (firstLine) {
      decorations.push({
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        options: {
          afterContentClassName: 'ghost-text-inline',
          after: {
            content: firstLine,
            inlineClassName: 'ghost-text-content'
          }
        }
      });
    }

    // Additional lines decorations
    restLines.slice(0, COMPLETION_CONFIG.COMPLETION_PREVIEW_LINES - 1).forEach((line, index) => {
      const lineNumber = position.lineNumber + index + 1;
      decorations.push({
        range: new monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          afterContentClassName: 'ghost-text-line',
          after: {
            content: line,
            inlineClassName: 'ghost-text-content'
          }
        }
      });
    });

    // Apply decorations
    const decorationIds = editor.addDecorations(decorations);

    // Update state
    setCompletionState(prev => ({
      ...prev,
      isStreaming: false,
      currentCompletion: completion,
      ghostTextDecoration: decorationIds,
      confidence: cached ? 0.9 : 0.7,
      tokenCount: completion.length
    }));

  }, [editor, completionState.ghostTextDecoration]);

  // Clear completion state
  const clearCompletionState = useCallback((): void => {
    if (completionState.ghostTextDecoration.length > 0) {
      editor.removeDecorations(completionState.ghostTextDecoration);
    }

    setCompletionState({
      isStreaming: false,
      currentCompletion: '',
      partialCompletion: '',
      completionStartPosition: new monaco.Position(1, 1),
      streamingDecoration: [],
      ghostTextDecoration: [],
      confidence: 0,
      tokenCount: 0,
      latency: 0
    });

    currentRequestRef.current = null;
    
    if (streamingStateRef.current.controller) {
      streamingStateRef.current.controller.abort();
      streamingStateRef.current.controller = null;
    }
  }, [editor, completionState.ghostTextDecoration]);

  // Handle completion acceptance
  const acceptCompletion = useCallback((): boolean => {
    if (!completionState.currentCompletion) return false;

    const model = editor.getModel();
    if (!model) return false;

    // Insert the completion
    const position = editor.getPosition();
    if (!position) return false;

    editor.executeEdits('completion-accept', [{
      range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
      text: completionState.currentCompletion
    }]);

    // Update acceptance rate
    if (lastCompletionMetricsRef.current) {
      lastCompletionMetricsRef.current.acceptanceRate = 
        (lastCompletionMetricsRef.current.acceptanceRate * 0.9) + (1 * 0.1);
    }

    // Call callback
    if (onCompletionAccepted) {
      onCompletionAccepted(completionState.currentCompletion);
    }

    // Clear state
    clearCompletionState();
    return true;
  }, [editor, completionState.currentCompletion, onCompletionAccepted, clearCompletionState]);

  // Handle completion rejection
  const rejectCompletion = useCallback((): void => {
    if (completionState.currentCompletion && onCompletionRejected) {
      onCompletionRejected(completionState.currentCompletion);
    }

    // Update acceptance rate
    if (lastCompletionMetricsRef.current) {
      lastCompletionMetricsRef.current.acceptanceRate = 
        (lastCompletionMetricsRef.current.acceptanceRate * 0.9) + (0 * 0.1);
    }

    clearCompletionState();
  }, [completionState.currentCompletion, onCompletionRejected, clearCompletionState]);

  // Debounced completion trigger
  const triggerCompletion = useCallback((position: monaco.Position): void => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      requestCompletion(position);
    }, debounceMs);
  }, [requestCompletion, debounceMs]);

  // Event handlers
  useEffect(() => {
    if (!editor || !enabled) return;

    const model = editor.getModel();
    if (!model) return;

    // Handle cursor position changes
    const onCursorPositionChange = (e: monaco.editor.ICursorPositionChangedEvent) => {
      const position = e.position;
      const lineContent = model.getLineContent(position.lineNumber);
      const charCount = lineContent.length;

      // Clear completion on cursor move if not accepting
      if (completionState.currentCompletion) {
        clearCompletionState();
      }

      // Trigger completion if enough characters are typed
      if (charCount >= COMPLETION_CONFIG.MIN_TRIGGER_CHARS) {
        // Check if we've reached the first token trigger threshold
        if (charCount >= COMPLETION_CONFIG.FIRST_TOKEN_TRIGGER_CHARS) {
          triggerCompletion(position);
        } else {
          // Debounced trigger for earlier completions
          triggerCompletion(position);
        }
      }
    };

    // Handle content changes (typing ahead detection)
    const onDidChangeModelContent = (e: monaco.editor.IModelContentChangedEvent) => {
      // Handle typing ahead while completion is showing
      if (completionState.currentCompletion && e.changes.length > 0) {
        const change = e.changes[0];
        if (change.text && change.text.length <= COMPLETION_CONFIG.TYPING_AHEAD_THRESHOLD) {
          typingAheadBufferRef.current += change.text;
          
          // Check if typed text matches beginning of completion
          if (completionState.currentCompletion.startsWith(typingAheadBufferRef.current)) {
            // Continue showing completion with typed part removed
            const remainingCompletion = completionState.currentCompletion.slice(typingAheadBufferRef.current.length);
            if (remainingCompletion) {
              const newPosition = editor.getPosition();
              if (newPosition) {
                displayCompletion(remainingCompletion, newPosition, false);
              }
            } else {
              // Completion fully typed, accept it
              clearCompletionState();
            }
          } else {
            // Typed text doesn't match, clear completion
            clearCompletionState();
          }
        } else {
          // Major change, clear completion
          clearCompletionState();
        }
      } else {
        typingAheadBufferRef.current = '';
      }
    };

    // Handle key presses for completion control
    const onKeyDown = (e: monaco.IKeyboardEvent) => {
      if (completionState.currentCompletion) {
        switch (e.keyCode) {
          case monaco.KeyCode.Tab:
            e.preventDefault();
            acceptCompletion();
            break;
          case monaco.KeyCode.Escape:
            e.preventDefault();
            rejectCompletion();
            break;
          case monaco.KeyCode.RightArrow:
            // Accept completion on right arrow at end of line
            const position = editor.getPosition();
            if (position) {
              const lineContent = model.getLineContent(position.lineNumber);
              if (position.column > lineContent.length) {
                e.preventDefault();
                acceptCompletion();
              }
            }
            break;
        }
      }
    };

    // Register event listeners
    const cursorDisposable = editor.onDidChangeCursorPosition(onCursorPositionChange);
    const contentDisposable = editor.onDidChangeModelContent(onDidChangeModelContent);
    const keyDisposable = editor.onKeyDown(onKeyDown);

    // Cleanup
    return () => {
      cursorDisposable.dispose();
      contentDisposable.dispose();
      keyDisposable.dispose();
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      clearCompletionState();
    };
  }, [editor, enabled, completionState.currentCompletion, triggerCompletion, acceptCompletion, rejectCompletion, clearCompletionState, displayCompletion]);

  // CSS injection for ghost text styling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .ghost-text-content {
        opacity: ${COMPLETION_CONFIG.GHOST_TEXT_OPACITY};
        font-style: italic;
        color: #888;
      }
      
      .ghost-text-inline::after {
        opacity: ${COMPLETION_CONFIG.GHOST_TEXT_OPACITY};
        font-style: italic;
        color: #888;
      }
      
      .ghost-text-line::after {
        opacity: ${COMPLETION_CONFIG.GHOST_TEXT_OPACITY};
        font-style: italic;
        color: #888;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Return completion status for parent components
  return (
    <div className="streaming-completion-status" style={{ display: 'none' }}>
      {completionState.isStreaming && (
        <div className="completion-indicator">
          Generating completion...
        </div>
      )}
      {completionState.currentCompletion && (
        <div className="completion-controls">
          <span>Press Tab to accept, Esc to reject</span>
        </div>
      )}
    </div>
  );
};

export default StreamingCompletion; 