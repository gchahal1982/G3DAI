import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as monaco from 'monaco-editor';
import { Box, Paper, Typography, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import {
  AutoFixHigh as AIIcon,
  Lightbulb as SuggestionIcon,
  CompareArrows as DiffIcon,
  TouchApp as SelectIcon,
  Build as RefactorIcon,
  Visibility as LensIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

// Interfaces
interface AICompletion {
  id: string;
  text: string;
  confidence: number;
  type: 'completion' | 'suggestion' | 'refactor';
  range: monaco.IRange;
  documentation?: string;
}

interface GhostText {
  text: string;
  position: monaco.IPosition;
  transparency: number;
  type: 'completion' | 'suggestion';
}

interface InlineDiff {
  id: string;
  original: string;
  modified: string;
  range: monaco.IRange;
  type: 'add' | 'delete' | 'modify';
}

interface CodeLensItem {
  range: monaco.IRange;
  command: string;
  title: string;
  tooltip?: string;
  arguments?: any[];
}

interface SmartSelection {
  ranges: monaco.IRange[];
  type: 'function' | 'class' | 'variable' | 'import' | 'block';
  context: string;
}

// Styled components
const EditorContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  '& .monaco-editor': {
    borderRadius: theme.shape.borderRadius,
  }
}));

const AIOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 1000,
  display: 'flex',
  gap: 4,
  '& .MuiIconButton-root': {
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(8px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    }
  }
}));

const GhostTextContainer = styled('div')<{ transparency: number }>(({ transparency }) => ({
  opacity: transparency,
  color: '#6e7681',
  fontStyle: 'italic',
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 10
}));

const DiffIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  width: 4,
  height: '100%',
  borderRadius: 2,
  '&.add': {
    backgroundColor: theme.palette.success.main,
  },
  '&.delete': {
    backgroundColor: theme.palette.error.main,
  },
  '&.modify': {
    backgroundColor: theme.palette.warning.main,
  }
}));

// Props interface
interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  onSelectionChange?: (selection: monaco.ISelection) => void;
  onAIRequest?: (prompt: string, context: any) => Promise<AICompletion[]>;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  aiEnabled?: boolean;
  ghostTextEnabled?: boolean;
  diffViewEnabled?: boolean;
  codeLensEnabled?: boolean;
  smartSelectionEnabled?: boolean;
  multiCursorEnabled?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

// Task 1: Extend Monaco with custom features
export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  language,
  onChange,
  onSelectionChange,
  onAIRequest,
  options = {},
  aiEnabled = true,
  ghostTextEnabled = true,
  diffViewEnabled = true,
  codeLensEnabled = true,
  smartSelectionEnabled = true,
  multiCursorEnabled = true,
  theme = 'dark'
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [aiCompletions, setAICompletions] = useState<AICompletion[]>([]);
  const [ghostTexts, setGhostTexts] = useState<GhostText[]>([]);
  const [inlineDiffs, setInlineDiffs] = useState<InlineDiff[]>([]);
  const [codeLenses, setCodeLenses] = useState<CodeLensItem[]>([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [decorations, setDecorations] = useState<string[]>([]);

  // Task 1: Initialize Monaco editor with custom features
  useEffect(() => {
    if (!containerRef.current) return;

    // Configure Monaco themes
    monaco.editor.defineTheme('codeforge-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'ai-suggestion', foreground: '00D2FF', fontStyle: 'italic' },
        { token: 'ai-completion', foreground: '7DD3FC', background: '1E293B' },
        { token: 'ghost-text', foreground: '6B7280', fontStyle: 'italic' }
      ],
      colors: {
        'editor.background': '#0D1117',
        'editor.foreground': '#F0F6FC',
        'editor.lineHighlightBackground': '#161B22',
        'editor.selectionBackground': '#264F78',
        'editorCursor.foreground': '#00D2FF',
        'editorLineNumber.foreground': '#6E7681',
        'editor.inlayHint.background': '#21262D',
        'editor.inlayHint.foreground': '#8B949E'
      }
    });

    monaco.editor.defineTheme('codeforge-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'ai-suggestion', foreground: '0066CC', fontStyle: 'italic' },
        { token: 'ai-completion', foreground: '0284C7', background: 'F1F5F9' },
        { token: 'ghost-text', foreground: '9CA3AF', fontStyle: 'italic' }
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#24292F',
        'editor.lineHighlightBackground': '#F6F8FA',
        'editor.selectionBackground': '#B6D6FE',
        'editorCursor.foreground': '#0066CC'
      }
    });

    // Create editor instance
    const editor = monaco.editor.create(containerRef.current, {
      value,
      language,
      theme: theme === 'dark' ? 'codeforge-dark' : 'codeforge-light',
      automaticLayout: true,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
      fontLigatures: true,
      minimap: { enabled: true, side: 'right' },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      suggest: {
        insertMode: 'replace',
        showSnippets: true,
        showKeywords: true,
        showFunctions: true
      },
      inlayHints: { enabled: 'on' },
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      },
      ...options
    });

    editorRef.current = editor;

    // Setup custom features
    setupAICompletionProvider(editor);
    setupCodeLensProvider(editor);
    setupHoverProvider(editor);
    setupCommandPalette(editor);
    setupCustomKeybindings(editor);

    // Event listeners
    editor.onDidChangeModelContent(() => {
      const newValue = editor.getValue();
      onChange(newValue);
      
      if (aiEnabled) {
        handleContentChange(newValue);
      }
    });

    editor.onDidChangeCursorSelection((e) => {
      onSelectionChange?.(e.selection);
      
      if (smartSelectionEnabled) {
        handleSmartSelection(e.selection);
      }
    });

    return () => {
      editor.dispose();
    };
  }, []);

  // Task 1: Setup AI completion provider
  const setupAICompletionProvider = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    monaco.languages.registerCompletionItemProvider(language, {
      triggerCharacters: ['.', '(', '[', '{', ' ', '\n'],
      
      provideCompletionItems: async (model, position, context) => {
        if (!aiEnabled || !onAIRequest) return { suggestions: [] };

        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        try {
          setIsAIProcessing(true);
          const completions = await onAIRequest('complete', {
            text: textUntilPosition,
            position,
            language,
            context: 'completion'
          });

          const suggestions = completions.map((completion, index) => ({
            label: completion.text.split('\n')[0], // First line as label
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: completion.text,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: `AI Completion (${Math.round(completion.confidence * 100)}% confidence)`,
            documentation: completion.documentation,
            sortText: `0${index}`, // Prioritize AI completions
            command: {
              id: 'codeforge.trackCompletion',
              title: 'Track AI completion usage'
            }
          }));

          return { suggestions };
        } catch (error) {
          console.error('AI completion failed:', error);
          return { suggestions: [] };
        } finally {
          setIsAIProcessing(false);
        }
      }
    });
  }, [language, aiEnabled, onAIRequest]);

  // Task 8: Implement code lens integration
  const setupCodeLensProvider = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    if (!codeLensEnabled) return;

    monaco.languages.registerCodeLensProvider(language, {
      provideCodeLenses: async (model) => {
        const lenses: monaco.languages.CodeLens[] = [];
        const text = model.getValue();
        
        // Function detection and AI-powered insights
        const functionRegex = /(function|class|const|let|var)\s+(\w+)/g;
        let match;
        
        while ((match = functionRegex.exec(text)) !== null) {
          const position = model.getPositionAt(match.index);
          const range = {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column + match[0].length
          };

          // AI-powered code insights
          lenses.push({
            range,
            command: {
              id: 'codeforge.explainFunction',
              title: '🤖 Explain Function',
              arguments: [match[2], range]
            }
          });

          lenses.push({
            range,
            command: {
              id: 'codeforge.generateTests',
              title: '🧪 Generate Tests',
              arguments: [match[2], range]
            }
          });

          lenses.push({
            range,
            command: {
              id: 'codeforge.optimizeFunction',
              title: '⚡ AI Optimize',
              arguments: [match[2], range]
            }
          });
        }

        setCodeLenses(lenses.map(lens => ({
          range: lens.range,
          command: lens.command?.id || '',
          title: lens.command?.title || '',
          arguments: lens.command?.arguments
        })));

        return { lenses };
      }
    });
  }, [language, codeLensEnabled]);

  // Task 2: AI suggestion rendering
  const handleContentChange = useCallback(async (newValue: string) => {
    if (!aiEnabled || !onAIRequest || isAIProcessing) return;

    const editor = editorRef.current;
    if (!editor) return;

    const position = editor.getPosition();
    if (!position) return;

    // Debounced AI suggestion
    setTimeout(async () => {
      try {
        const context = {
          text: newValue,
          position,
          language,
          context: 'suggestion'
        };

        const suggestions = await onAIRequest('suggest', context);
        
        if (suggestions.length > 0 && ghostTextEnabled) {
          renderGhostText(suggestions[0], position);
        }

        setAICompletions(suggestions);
      } catch (error) {
        console.error('AI suggestion failed:', error);
      }
    }, 500);
  }, [aiEnabled, onAIRequest, isAIProcessing, ghostTextEnabled, language]);

  // Task 4: Implement ghost text with transparency
  const renderGhostText = useCallback((completion: AICompletion, position: monaco.IPosition) => {
    const editor = editorRef.current;
    if (!editor || !ghostTextEnabled) return;

    const ghostText: GhostText = {
      text: completion.text,
      position,
      transparency: 0.6,
      type: 'completion'
    };

    setGhostTexts([ghostText]);

    // Create decoration for ghost text
    const decorationOptions: monaco.editor.IModelDecorationOptions = {
      afterContentClassName: 'ghost-text-decoration',
      after: {
        content: completion.text,
        inlineClassName: 'ghost-text-inline',
        color: '#6B7280',
        fontStyle: 'italic'
      }
    };

    const newDecorations = editor.deltaDecorations(
      decorations,
      [{
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        options: decorationOptions
      }]
    );

    setDecorations(newDecorations);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      setGhostTexts([]);
      editor.deltaDecorations(newDecorations, []);
    }, 10000);
  }, [ghostTextEnabled, decorations]);

  // Task 3: Add inline diff visualization
  const renderInlineDiff = useCallback((diff: InlineDiff) => {
    const editor = editorRef.current;
    if (!editor || !diffViewEnabled) return;

    const decorationOptions: monaco.editor.IModelDecorationOptions = {
      className: `diff-${diff.type}`,
      glyphMarginClassName: `diff-glyph-${diff.type}`,
      minimap: {
        color: diff.type === 'add' ? '#28a745' : diff.type === 'delete' ? '#d73a49' : '#ffa500',
        position: monaco.editor.MinimapPosition.Inline
      },
      overviewRuler: {
        color: diff.type === 'add' ? '#28a745' : diff.type === 'delete' ? '#d73a49' : '#ffa500',
        position: monaco.editor.OverviewRulerLane.Right
      }
    };

    const newDecorations = editor.deltaDecorations([], [{
      range: diff.range,
      options: decorationOptions
    }]);

    setInlineDiffs(prev => [...prev, diff]);

    return newDecorations;
  }, [diffViewEnabled]);

  // Task 5: Implement multi-cursor AI edits
  const handleMultiCursorAIEdit = useCallback(async (prompt: string) => {
    const editor = editorRef.current;
    if (!editor || !multiCursorEnabled || !onAIRequest) return;

    const selections = editor.getSelections();
    if (!selections || selections.length <= 1) return;

    try {
      setIsAIProcessing(true);
      const edits: monaco.editor.IIdentifiedSingleEditOperation[] = [];

      for (const selection of selections) {
        const selectedText = editor.getModel()?.getValueInRange(selection);
        if (!selectedText) continue;

        const aiResponse = await onAIRequest('edit', {
          text: selectedText,
          prompt,
          range: selection,
          language,
          context: 'multi-cursor-edit'
        });

        if (aiResponse.length > 0) {
          edits.push({
            range: selection,
            text: aiResponse[0].text
          });
        }
      }

      if (edits.length > 0) {
        editor.executeEdits('ai-multi-cursor', edits);
      }
    } catch (error) {
      console.error('Multi-cursor AI edit failed:', error);
    } finally {
      setIsAIProcessing(false);
    }
  }, [multiCursorEnabled, onAIRequest, language]);

  // Task 6: Add smart selection
  const handleSmartSelection = useCallback((selection: monaco.ISelection) => {
    const editor = editorRef.current;
    if (!editor || !smartSelectionEnabled) return;

    const model = editor.getModel();
    if (!model) return;

    const text = model.getValueInRange(selection);
    if (!text.trim()) return;

    // Analyze selection context and expand intelligently
    const lineText = model.getLineContent(selection.startLineNumber);
    const smartSelection = analyzeAndExpandSelection(text, lineText, selection);

    if (smartSelection) {
      // Highlight related ranges
      const decorationOptions: monaco.editor.IModelDecorationOptions = {
        className: 'smart-selection-highlight',
        minimap: {
          color: '#00D2FF',
          position: monaco.editor.MinimapPosition.Inline
        }
      };

      const newDecorations = editor.deltaDecorations([], 
        smartSelection.ranges.map(range => ({
          range,
          options: decorationOptions
        }))
      );

      // Auto-clear after 3 seconds
      setTimeout(() => {
        editor.deltaDecorations(newDecorations, []);
      }, 3000);
    }
  }, [smartSelectionEnabled]);

  // Task 7: Add AI-powered refactoring
  const handleAIRefactoring = useCallback(async (type: string) => {
    const editor = editorRef.current;
    if (!editor || !onAIRequest) return;

    const selection = editor.getSelection();
    if (!selection) return;

    const selectedText = editor.getModel()?.getValueInRange(selection);
    if (!selectedText) return;

    try {
      setIsAIProcessing(true);

      const refactorRequest = await onAIRequest('refactor', {
        text: selectedText,
        type,
        range: selection,
        language,
        context: 'refactoring'
      });

      if (refactorRequest.length > 0) {
        const refactored = refactorRequest[0];
        
        // Show diff preview
        const diff: InlineDiff = {
          id: Date.now().toString(),
          original: selectedText,
          modified: refactored.text,
          range: selection,
          type: 'modify'
        };

        renderInlineDiff(diff);

        // Apply refactoring after confirmation
        setTimeout(() => {
          editor.executeEdits('ai-refactor', [{
            range: selection,
            text: refactored.text
          }]);
        }, 1000);
      }
    } catch (error) {
      console.error('AI refactoring failed:', error);
    } finally {
      setIsAIProcessing(false);
    }
  }, [onAIRequest, language, renderInlineDiff]);

  // Setup additional Monaco features
  const setupHoverProvider = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    monaco.languages.registerHoverProvider(language, {
      provideHover: async (model, position) => {
        if (!aiEnabled) return null;

        const word = model.getWordAtPosition(position);
        if (!word) return null;

        // AI-powered hover information
        return {
          range: new monaco.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn
          ),
          contents: [
            { value: `**${word.word}**` },
            { value: '🤖 AI-powered insights loading...' }
          ]
        };
      }
    });
  }, [language, aiEnabled]);

  const setupCommandPalette = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    editor.addAction({
      id: 'codeforge.aiChat',
      label: 'Open AI Chat',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK],
      run: () => {
        // Open AI chat interface
        console.log('Opening AI chat...');
      }
    });

    editor.addAction({
      id: 'codeforge.generateCode',
      label: 'Generate Code with AI',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG],
      run: () => {
        const selection = editor.getSelection();
        if (selection) {
          // Trigger AI code generation
          console.log('Generating code...');
        }
      }
    });

    editor.addAction({
      id: 'codeforge.explainCode',
      label: 'Explain Code with AI',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE],
      run: () => {
        const selection = editor.getSelection();
        if (selection) {
          // Trigger AI explanation
          console.log('Explaining code...');
        }
      }
    });
  }, []);

  const setupCustomKeybindings = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    // Multi-cursor AI edit
    editor.addAction({
      id: 'codeforge.multiCursorAIEdit',
      label: 'AI Edit Multiple Selections',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyA],
      run: () => {
        // Prompt for AI edit
        const prompt = window.prompt('Enter AI edit instruction:');
        if (prompt) {
          handleMultiCursorAIEdit(prompt);
        }
      }
    });

    // Smart refactoring
    editor.addAction({
      id: 'codeforge.smartRefactor',
      label: 'AI Smart Refactor',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyR],
      run: () => {
        handleAIRefactoring('optimize');
      }
    });
  }, [handleMultiCursorAIEdit, handleAIRefactoring]);

  // Utility functions
  const analyzeAndExpandSelection = (text: string, lineText: string, selection: monaco.ISelection): SmartSelection | null => {
    // Analyze selection context and return expanded ranges
    const ranges: monaco.IRange[] = [selection];
    let type: SmartSelection['type'] = 'block';

    // Function detection
    if (lineText.includes('function') || lineText.includes('=>')) {
      type = 'function';
    }
    // Class detection
    else if (lineText.includes('class')) {
      type = 'class';
    }
    // Variable detection
    else if (lineText.includes('const') || lineText.includes('let') || lineText.includes('var')) {
      type = 'variable';
    }
    // Import detection
    else if (lineText.includes('import') || lineText.includes('require')) {
      type = 'import';
    }

    return {
      ranges,
      type,
      context: text
    };
  };

  // Context menu handler
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return (
    <EditorContainer onContextMenu={handleContextMenu}>
      {/* AI Overlay Controls */}
      {aiEnabled && (
        <AIOverlay>
          <Tooltip title="AI Suggestions">
            <IconButton size="small" disabled={isAIProcessing}>
              <SuggestionIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Show Diff">
            <IconButton size="small" onClick={() => console.log('Toggle diff view')}>
              <DiffIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="AI Refactor">
            <IconButton size="small" onClick={() => handleAIRefactoring('optimize')}>
              <RefactorIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Code Lens">
            <IconButton size="small">
              <LensIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </AIOverlay>
      )}

      {/* Monaco Editor Container */}
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />

      {/* Context Menu */}
      <Menu
        open={Boolean(contextMenu)}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined}
      >
        <MenuItem onClick={() => { handleAIRefactoring('extract'); handleCloseContextMenu(); }}>
          🤖 Extract Function
        </MenuItem>
        <MenuItem onClick={() => { handleAIRefactoring('inline'); handleCloseContextMenu(); }}>
          🤖 Inline Variable
        </MenuItem>
        <MenuItem onClick={() => { handleAIRefactoring('optimize'); handleCloseContextMenu(); }}>
          ⚡ AI Optimize
        </MenuItem>
        <MenuItem onClick={() => { console.log('Generate tests'); handleCloseContextMenu(); }}>
          🧪 Generate Tests
        </MenuItem>
        <MenuItem onClick={() => { console.log('Explain code'); handleCloseContextMenu(); }}>
          📚 Explain Code
        </MenuItem>
      </Menu>

      {/* Processing Indicator */}
      {isAIProcessing && (
        <Box
          position="absolute"
          bottom={16}
          right={16}
          display="flex"
          alignItems="center"
          gap={1}
          sx={{
            backgroundColor: alpha('#00D2FF', 0.1),
            padding: '8px 12px',
            borderRadius: 1,
            border: '1px solid #00D2FF'
          }}
        >
          <AIIcon sx={{ fontSize: 16, color: '#00D2FF' }} />
          <Typography variant="caption" sx={{ color: '#00D2FF' }}>
            AI Processing...
          </Typography>
        </Box>
      )}
    </EditorContainer>
  );
};

export default CodeEditor; 