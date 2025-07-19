import React, { useState, useEffect, useCallback } from 'react';
import { ContextChunk } from '../../lib/context/Retriever';
import { Intent, ContextRequest } from '../../lib/context/ContextPlanner';

/**
 * MemoryPanel - Live context display sidebar
 * 
 * Shows current "live context" chunks in sidebar with token count,
 * budget utilization, pin/unpin functionality, and relevance scores.
 */

interface MemoryPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

interface ContextState {
  chunks: ContextChunk[];
  currentIntent: Intent | null;
  tokenUsage: {
    used: number;
    budget: number;
    utilization: number;
  };
  retrievalStatus: 'idle' | 'retrieving' | 'complete' | 'error';
  lastUpdated: number;
}

interface PinnedChunk {
  chunkId: string;
  reason: string;
  timestamp: number;
}

export const MemoryPanel: React.FC<MemoryPanelProps> = ({
  isVisible,
  onToggle,
  className = ''
}) => {
  const [contextState, setContextState] = useState<ContextState>({
    chunks: [],
    currentIntent: null,
    tokenUsage: { used: 0, budget: 4000, utilization: 0 },
    retrievalStatus: 'idle',
    lastUpdated: Date.now()
  });

  const [pinnedChunks, setPinnedChunks] = useState<PinnedChunk[]>([]);
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(new Set());
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'recency' | 'file'>('relevance');

  // Simulate context updates (in real implementation, this would come from context services)
  useEffect(() => {
    const updateInterval = setInterval(() => {
      // Mock data for demonstration
      const mockChunks: ContextChunk[] = [
        {
          id: 'chunk_1',
          content: 'export function calculateTotal(items: Item[]): number {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}',
          filePath: 'src/utils/calculations.ts',
          startLine: 15,
          endLine: 17,
          symbols: ['calculateTotal', 'Item'],
          lastModified: Date.now() - 30000,
          accessCount: 5
        },
        {
          id: 'chunk_2',
          content: 'interface Item {\n  id: string;\n  name: string;\n  price: number;\n  category: string;\n}',
          filePath: 'src/types/Item.ts',
          startLine: 1,
          endLine: 6,
          symbols: ['Item'],
          lastModified: Date.now() - 60000,
          accessCount: 12
        }
      ];

      setContextState(prev => ({
        ...prev,
        chunks: mockChunks,
        tokenUsage: {
          used: mockChunks.reduce((sum, chunk) => sum + estimateTokens(chunk.content), 0),
          budget: 4000,
          utilization: 0
        },
        lastUpdated: Date.now()
      }));
    }, 5000);

    return () => clearInterval(updateInterval);
  }, []);

  // Update utilization when usage changes
  useEffect(() => {
    setContextState(prev => ({
      ...prev,
      tokenUsage: {
        ...prev.tokenUsage,
        utilization: prev.tokenUsage.used / prev.tokenUsage.budget
      }
    }));
  }, [contextState.tokenUsage.used, contextState.tokenUsage.budget]);

  const estimateTokens = (content: string): number => {
    return Math.ceil(content.length / 4);
  };

  const handlePinChunk = useCallback((chunkId: string, reason: string = 'User pinned') => {
    const existingPin = pinnedChunks.find(p => p.chunkId === chunkId);
    if (!existingPin) {
      setPinnedChunks(prev => [...prev, {
        chunkId,
        reason,
        timestamp: Date.now()
      }]);
    }
  }, [pinnedChunks]);

  const handleUnpinChunk = useCallback((chunkId: string) => {
    setPinnedChunks(prev => prev.filter(p => p.chunkId !== chunkId));
  }, []);

  const handleToggleExpanded = useCallback((chunkId: string) => {
    setExpandedChunks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chunkId)) {
        newSet.delete(chunkId);
      } else {
        newSet.add(chunkId);
      }
      return newSet;
    });
  }, []);

  const handleRefreshContext = useCallback(() => {
    setContextState(prev => ({ ...prev, retrievalStatus: 'retrieving' }));
    
    // Simulate refresh
    setTimeout(() => {
      setContextState(prev => ({ 
        ...prev, 
        retrievalStatus: 'complete',
        lastUpdated: Date.now()
      }));
    }, 1000);
  }, []);

  const handleExportContext = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      chunks: contextState.chunks.map(chunk => ({
        file: chunk.filePath,
        lines: `${chunk.startLine}-${chunk.endLine}`,
        symbols: chunk.symbols,
        content: chunk.content
      })),
      tokenUsage: contextState.tokenUsage,
      pinnedChunks
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `context-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [contextState, pinnedChunks]);

  const filteredAndSortedChunks = contextState.chunks
    .filter(chunk => {
      if (!searchFilter) return true;
      return (
        chunk.filePath.toLowerCase().includes(searchFilter.toLowerCase()) ||
        chunk.symbols.some(symbol => symbol.toLowerCase().includes(searchFilter.toLowerCase())) ||
        chunk.content.toLowerCase().includes(searchFilter.toLowerCase())
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recency':
          return b.lastModified - a.lastModified;
        case 'file':
          return a.filePath.localeCompare(b.filePath);
        case 'relevance':
        default:
          return b.accessCount - a.accessCount;
      }
    });

  const isPinned = (chunkId: string) => pinnedChunks.some(p => p.chunkId === chunkId);

  if (!isVisible) {
    return (
      <div className="memory-panel-collapsed">
        <button 
          onClick={onToggle}
          className="memory-panel-toggle"
          title="Show Memory Panel"
        >
          🧠
        </button>
      </div>
    );
  }

  return (
    <div className={`memory-panel ${className}`}>
      {/* Header */}
      <div className="memory-panel-header">
        <div className="memory-panel-title">
          <h3>🧠 Live Context</h3>
          <button 
            onClick={onToggle}
            className="memory-panel-close"
            title="Hide Memory Panel"
          >
            ×
          </button>
        </div>
        
        {/* Token Usage */}
        <div className="token-usage">
          <div className="token-usage-bar">
            <div 
              className="token-usage-fill"
              style={{ 
                width: `${contextState.tokenUsage.utilization * 100}%`,
                backgroundColor: contextState.tokenUsage.utilization > 0.8 ? '#ff6b6b' : 
                                contextState.tokenUsage.utilization > 0.6 ? '#ffd93d' : '#6bcf7f'
              }}
            />
          </div>
          <div className="token-usage-text">
            {contextState.tokenUsage.used} / {contextState.tokenUsage.budget} tokens
            ({Math.round(contextState.tokenUsage.utilization * 100)}%)
          </div>
        </div>

        {/* Controls */}
        <div className="memory-panel-controls">
          <input
            type="text"
            placeholder="Filter context..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="context-search"
          />
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="context-sort"
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="recency">Sort by Recency</option>
            <option value="file">Sort by File</option>
          </select>

          <button 
            onClick={handleRefreshContext}
            disabled={contextState.retrievalStatus === 'retrieving'}
            className="context-refresh"
            title="Refresh Context"
          >
            {contextState.retrievalStatus === 'retrieving' ? '🔄' : '↻'}
          </button>

          <button 
            onClick={handleExportContext}
            className="context-export"
            title="Export Context"
          >
            📥
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="memory-panel-status">
        <div className="status-item">
          <span className="status-label">Status:</span>
          <span className={`status-value status-${contextState.retrievalStatus}`}>
            {contextState.retrievalStatus}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Chunks:</span>
          <span className="status-value">{contextState.chunks.length}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Updated:</span>
          <span className="status-value">
            {new Date(contextState.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Context Chunks List */}
      <div className="context-chunks">
        {filteredAndSortedChunks.length === 0 ? (
          <div className="no-context">
            {searchFilter ? 'No matching context found' : 'No active context'}
          </div>
        ) : (
          filteredAndSortedChunks.map(chunk => (
            <div 
              key={chunk.id} 
              className={`context-chunk ${isPinned(chunk.id) ? 'pinned' : ''}`}
            >
              {/* Chunk Header */}
              <div className="chunk-header">
                <div className="chunk-file">
                  <span className="file-path" title={chunk.filePath}>
                    {chunk.filePath.split('/').pop()}
                  </span>
                  <span className="line-range">
                    :{chunk.startLine}-{chunk.endLine}
                  </span>
                </div>
                
                <div className="chunk-actions">
                  <button
                    onClick={() => handleToggleExpanded(chunk.id)}
                    className="chunk-expand"
                    title={expandedChunks.has(chunk.id) ? 'Collapse' : 'Expand'}
                  >
                    {expandedChunks.has(chunk.id) ? '−' : '+'}
                  </button>
                  
                  <button
                    onClick={() => isPinned(chunk.id) 
                      ? handleUnpinChunk(chunk.id) 
                      : handlePinChunk(chunk.id)}
                    className={`chunk-pin ${isPinned(chunk.id) ? 'pinned' : ''}`}
                    title={isPinned(chunk.id) ? 'Unpin' : 'Pin'}
                  >
                    📌
                  </button>
                </div>
              </div>

              {/* Chunk Metadata */}
              <div className="chunk-metadata">
                {chunk.symbols.length > 0 && (
                  <div className="chunk-symbols">
                    <span className="symbols-label">Symbols:</span>
                    {chunk.symbols.map(symbol => (
                      <span key={symbol} className="symbol-tag">
                        {symbol}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="chunk-stats">
                  <span className="stat-item">
                    {estimateTokens(chunk.content)} tokens
                  </span>
                  <span className="stat-item">
                    {chunk.accessCount} accesses
                  </span>
                  <span className="stat-item">
                    {Math.round((Date.now() - chunk.lastModified) / 60000)}m ago
                  </span>
                </div>
              </div>

              {/* Chunk Content (expandable) */}
              {expandedChunks.has(chunk.id) && (
                <div className="chunk-content">
                  <pre>
                    <code>{chunk.content}</code>
                  </pre>
                </div>
              )}

              {/* Chunk Preview (when collapsed) */}
              {!expandedChunks.has(chunk.id) && (
                <div className="chunk-preview">
                  {chunk.content.split('\n')[0].slice(0, 100)}
                  {chunk.content.length > 100 && '...'}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pinned Chunks Section */}
      {pinnedChunks.length > 0 && (
        <div className="pinned-chunks-section">
          <h4>📌 Pinned Context</h4>
          <div className="pinned-chunks-list">
            {pinnedChunks.map(pinnedChunk => {
              const chunk = contextState.chunks.find(c => c.id === pinnedChunk.chunkId);
              return chunk && (
                <div key={pinnedChunk.chunkId} className="pinned-chunk-item">
                  <span className="pinned-file">
                    {chunk.filePath.split('/').pop()}:{chunk.startLine}
                  </span>
                  <span className="pinned-reason" title={pinnedChunk.reason}>
                    {pinnedChunk.reason}
                  </span>
                  <button 
                    onClick={() => handleUnpinChunk(pinnedChunk.chunkId)}
                    className="unpin-button"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// CSS styles (would typically be in a separate file)
const styles = `
.memory-panel-collapsed {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
}

.memory-panel-toggle {
  background: #2d3748;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px 0 0 6px;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.2s;
}

.memory-panel-toggle:hover {
  background: #4a5568;
}

.memory-panel {
  width: 400px;
  height: 100vh;
  background: #1a202c;
  color: #e2e8f0;
  border-left: 1px solid #2d3748;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
}

.memory-panel-header {
  padding: 16px;
  border-bottom: 1px solid #2d3748;
  flex-shrink: 0;
}

.memory-panel-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.memory-panel-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.memory-panel-close {
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
}

.token-usage {
  margin-bottom: 16px;
}

.token-usage-bar {
  height: 6px;
  background: #2d3748;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.token-usage-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.token-usage-text {
  font-size: 12px;
  color: #a0aec0;
}

.memory-panel-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.context-search,
.context-sort {
  background: #2d3748;
  border: 1px solid #4a5568;
  border-radius: 4px;
  color: #e2e8f0;
  padding: 6px 8px;
  font-size: 12px;
}

.context-search {
  flex: 1;
  min-width: 120px;
}

.context-refresh,
.context-export {
  background: #2d3748;
  border: 1px solid #4a5568;
  border-radius: 4px;
  color: #e2e8f0;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 12px;
}

.context-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.memory-panel-status {
  padding: 12px 16px;
  background: #2d3748;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-label {
  color: #a0aec0;
  margin-bottom: 2px;
}

.status-value {
  font-weight: 500;
}

.status-complete { color: #6bcf7f; }
.status-retrieving { color: #ffd93d; }
.status-error { color: #ff6b6b; }
.status-idle { color: #a0aec0; }

.context-chunks {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.no-context {
  text-align: center;
  color: #a0aec0;
  padding: 32px;
  font-style: italic;
}

.context-chunk {
  background: #2d3748;
  border-radius: 6px;
  margin-bottom: 12px;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.context-chunk.pinned {
  border-color: #ffd93d;
}

.chunk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #4a5568;
}

.chunk-file {
  flex: 1;
}

.file-path {
  font-weight: 500;
  color: #63b3ed;
}

.line-range {
  color: #a0aec0;
  font-size: 12px;
}

.chunk-actions {
  display: flex;
  gap: 4px;
}

.chunk-expand,
.chunk-pin {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 4px;
  border-radius: 2px;
}

.chunk-pin.pinned {
  color: #ffd93d;
}

.chunk-metadata {
  padding: 8px 12px;
}

.chunk-symbols {
  margin-bottom: 8px;
}

.symbols-label {
  font-size: 12px;
  color: #a0aec0;
  margin-right: 8px;
}

.symbol-tag {
  background: #4a5568;
  color: #e2e8f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  margin-right: 4px;
}

.chunk-stats {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #a0aec0;
}

.chunk-content {
  padding: 12px;
  border-top: 1px solid #4a5568;
}

.chunk-content pre {
  margin: 0;
  font-size: 12px;
  background: #1a202c;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}

.chunk-preview {
  padding: 8px 12px;
  font-size: 12px;
  color: #a0aec0;
  font-family: 'Monaco', 'Menlo', monospace;
  border-top: 1px solid #4a5568;
}

.pinned-chunks-section {
  border-top: 1px solid #2d3748;
  padding: 16px;
  flex-shrink: 0;
}

.pinned-chunks-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
}

.pinned-chunk-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2d3748;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 12px;
}

.pinned-file {
  font-weight: 500;
  color: #63b3ed;
}

.pinned-reason {
  color: #a0aec0;
  font-style: italic;
  flex: 1;
  margin: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unpin-button {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 2px 4px;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default MemoryPanel; 