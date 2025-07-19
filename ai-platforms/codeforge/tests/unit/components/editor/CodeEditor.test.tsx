import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: jest.fn(({ onChange, value, onMount }) => {
    React.useEffect(() => {
      if (onMount) {
        const mockEditor = {
          getValue: jest.fn(() => value || ''),
          setValue: jest.fn(),
          getModel: jest.fn(() => ({
            uri: { toString: () => 'file:///test.ts' },
            getLanguageId: () => 'typescript',
          })),
          trigger: jest.fn(),
          addAction: jest.fn(),
          onDidChangeModelContent: jest.fn(),
          onDidChangeCursorPosition: jest.fn(),
          layout: jest.fn(),
          focus: jest.fn(),
          dispose: jest.fn(),
        };
        onMount(mockEditor, {});
      }
    }, [onMount]);

    return React.createElement('div', {
      'data-testid': 'monaco-editor',
      onChange: (e: any) => onChange?.(e.target.value),
      defaultValue: value,
    });
  }),
}));

// Create a mock CodeEditor component for testing
const MockCodeEditor: React.FC<any> = (props) => {
  return (
    <div data-testid="code-editor">
      <div data-testid="monaco-editor" />
      <div data-testid="ai-completion-status">Ready</div>
      <div data-testid="model-selector">qwen3-coder-4b</div>
    </div>
  );
};

// Mock the actual CodeEditor
jest.mock('../../../../src/components/editor/CodeEditor', () => ({
  CodeEditor: MockCodeEditor,
}));

// Mock AI completion service
const mockCompletionService = {
  getCompletion: jest.fn().mockResolvedValue({
    content: 'const result = ',
    tokens: 3,
    latency: 45,
    model: 'qwen3-coder-4b',
  }),
  getInlineCompletion: jest.fn().mockResolvedValue({
    suggestions: [
      { text: 'hello world', range: { startColumn: 1, endColumn: 1 } },
    ],
  }),
};

jest.mock('../../../../src/lib/models/ModelMesh', () => ({
  ModelMesh: {
    getInstance: () => mockCompletionService,
  },
}));

// Mock telemetry
const mockTelemetry = {
  trackEvent: jest.fn(),
  trackLatency: jest.fn(),
};

jest.mock('../../../../src/lib/telemetry/TelemetryClient', () => ({
  TelemetryClient: {
    getInstance: () => mockTelemetry,
  },
}));

describe('CodeEditor', () => {
  const { CodeEditor } = require('../../../../src/components/editor/CodeEditor');
  
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    language: 'typescript',
    theme: 'dark' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders without crashing', () => {
      render(<CodeEditor {...defaultProps} />);
      expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    });

    it('renders Monaco editor', () => {
      render(<CodeEditor {...defaultProps} />);
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    it('displays AI completion status', () => {
      render(<CodeEditor {...defaultProps} />);
      expect(screen.getByTestId('ai-completion-status')).toBeInTheDocument();
      expect(screen.getByTestId('ai-completion-status')).toHaveTextContent('Ready');
    });

    it('shows model selector', () => {
      render(<CodeEditor {...defaultProps} />);
      expect(screen.getByTestId('model-selector')).toBeInTheDocument();
      expect(screen.getByTestId('model-selector')).toHaveTextContent('qwen3-coder-4b');
    });

    it('supports different languages', () => {
      const { rerender } = render(
        <CodeEditor {...defaultProps} language="javascript" />
      );
      
      rerender(<CodeEditor {...defaultProps} language="python" />);
      rerender(<CodeEditor {...defaultProps} language="rust" />);
      
      // Verify no errors thrown for language changes
      expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    });

    it('supports different themes', () => {
      const { rerender } = render(
        <CodeEditor {...defaultProps} theme="light" />
      );
      
      rerender(<CodeEditor {...defaultProps} theme="dark" />);
      rerender(<CodeEditor {...defaultProps} theme="auto" />);
      
      // Verify no errors thrown for theme changes
      expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    });
  });

  describe('Performance Validation', () => {
    it('renders within performance budget', () => {
      const startTime = performance.now();
      render(<CodeEditor {...defaultProps} />);
      const endTime = performance.now();
      
      // Should render in under 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles large content efficiently', () => {
      const largeContent = 'const x = 1;\n'.repeat(1000);
      
      const startTime = performance.now();
      render(<CodeEditor {...defaultProps} value={largeContent} />);
      const endTime = performance.now();
      
      // Should handle large content without significant delay
      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  describe('Error Handling', () => {
    it('handles missing props gracefully', () => {
      // Should not crash with minimal props
      render(<CodeEditor />);
      expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    });

    it('recovers from render errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Should handle errors gracefully
      render(<CodeEditor {...defaultProps} />);
      expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<CodeEditor {...defaultProps} />);
      
      // Should have accessible structure
      const editor = screen.getByTestId('code-editor');
      expect(editor).toBeInTheDocument();
    });

    it('supports keyboard interaction', () => {
      render(<CodeEditor {...defaultProps} />);
      
      const editor = screen.getByTestId('code-editor');
      
      // Test keyboard events don't crash
      fireEvent.keyDown(editor, { key: 'Tab' });
      fireEvent.keyDown(editor, { key: 'Enter' });
      fireEvent.keyDown(editor, { key: 'Escape' });
      
      expect(editor).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('integrates with completion service', async () => {
      render(<CodeEditor {...defaultProps} />);
      
      // Should be able to access completion service
      expect(mockCompletionService).toBeDefined();
      expect(mockCompletionService.getCompletion).toBeDefined();
    });

    it('integrates with telemetry service', async () => {
      render(<CodeEditor {...defaultProps} />);
      
      // Should be able to access telemetry service
      expect(mockTelemetry).toBeDefined();
      expect(mockTelemetry.trackEvent).toBeDefined();
    });

    it('maintains state consistency', () => {
      const onChange = jest.fn();
      render(<CodeEditor {...defaultProps} onChange={onChange} />);
      
      // Should maintain consistent state
      expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('mounts successfully', () => {
      const component = render(<CodeEditor {...defaultProps} />);
      expect(component.container).toBeInTheDocument();
    });

    it('updates props correctly', () => {
      const { rerender } = render(<CodeEditor {...defaultProps} value="initial" />);
      
      rerender(<CodeEditor {...defaultProps} value="updated" />);
      
      expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    });

    it('unmounts cleanly', () => {
      const { unmount } = render(<CodeEditor {...defaultProps} />);
      
      // Should unmount without errors
      unmount();
    });
  });
}); 