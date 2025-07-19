import React, { useState, useEffect, useCallback } from 'react';

/**
 * MemorySettings - Memory configuration interface
 * 
 * Provides configuration for disk quota, context expiry settings,
 * privacy toggles, memory retention policies, and context exclusion patterns.
 */

interface MemorySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface MemoryConfig {
  storage: {
    diskQuotaGB: number;
    maxContextSizeMB: number;
    compressionEnabled: boolean;
    cleanupThresholdPercent: number;
  };
  retention: {
    contextExpiryDays: number;
    maxChunksPerFile: number;
    keepPinnedIndefinitely: boolean;
    autoCleanupEnabled: boolean;
  };
  privacy: {
    excludePersonalData: boolean;
    excludeCredentials: boolean;
    excludeThirdPartyCode: boolean;
    localOnlyMode: boolean;
  };
  performance: {
    maxConcurrentIndexing: number;
    indexingBatchSize: number;
    vectorSearchLimit: number;
    cacheWarmingEnabled: boolean;
  };
  exclusions: {
    filePatterns: string[];
    directoryPatterns: string[];
    contentPatterns: string[];
  };
}

const defaultConfig: MemoryConfig = {
  storage: {
    diskQuotaGB: 5,
    maxContextSizeMB: 100,
    compressionEnabled: true,
    cleanupThresholdPercent: 80
  },
  retention: {
    contextExpiryDays: 30,
    maxChunksPerFile: 50,
    keepPinnedIndefinitely: true,
    autoCleanupEnabled: true
  },
  privacy: {
    excludePersonalData: true,
    excludeCredentials: true,
    excludeThirdPartyCode: false,
    localOnlyMode: false
  },
  performance: {
    maxConcurrentIndexing: 4,
    indexingBatchSize: 100,
    vectorSearchLimit: 100,
    cacheWarmingEnabled: true
  },
  exclusions: {
    filePatterns: [
      '*.log',
      '*.tmp',
      '.env*',
      '*.key',
      '*.pem',
      'node_modules/**',
      '.git/**'
    ],
    directoryPatterns: [
      'node_modules',
      '.git',
      'dist',
      'build',
      'coverage',
      'logs'
    ],
    contentPatterns: [
      'password',
      'secret',
      'api_key',
      'private_key',
      'token'
    ]
  }
};

export const MemorySettings: React.FC<MemorySettingsProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const [config, setConfig] = useState<MemoryConfig>(defaultConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [storageStats, setStorageStats] = useState({
    used: 0,
    total: 0,
    chunks: 0,
    files: 0
  });
  const [activeTab, setActiveTab] = useState<'storage' | 'retention' | 'privacy' | 'performance' | 'exclusions'>('storage');

  // Load settings from storage
  useEffect(() => {
    const savedConfig = localStorage.getItem('aura-memory-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...defaultConfig, ...parsed });
      } catch (e) {
        console.error('Failed to parse memory config:', e);
      }
    }
  }, []);

  // Update storage stats
  useEffect(() => {
    // Mock storage stats (in real implementation, would query actual storage)
    setStorageStats({
      used: 2.3,
      total: config.storage.diskQuotaGB,
      chunks: 1247,
      files: 89
    });
  }, [config.storage.diskQuotaGB]);

  const handleConfigChange = useCallback((section: keyof MemoryConfig, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  }, []);

  const handleArrayChange = useCallback((section: keyof MemoryConfig, key: string, index: number, value: string) => {
    setConfig(prev => {
      const array = [...(prev[section] as any)[key]];
      array[index] = value;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: array
        }
      };
    });
    setHasChanges(true);
  }, []);

  const handleArrayAdd = useCallback((section: keyof MemoryConfig, key: string, value: string = '') => {
    setConfig(prev => {
      const array = [...(prev[section] as any)[key], value];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: array
        }
      };
    });
    setHasChanges(true);
  }, []);

  const handleArrayRemove = useCallback((section: keyof MemoryConfig, key: string, index: number) => {
    setConfig(prev => {
      const array = (prev[section] as any)[key].filter((_: any, i: number) => i !== index);
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: array
        }
      };
    });
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    localStorage.setItem('aura-memory-config', JSON.stringify(config));
    setHasChanges(false);
    // In real implementation, would also update the running memory services
    console.log('Memory configuration saved:', config);
  }, [config]);

  const handleReset = useCallback(() => {
    setConfig(defaultConfig);
    setHasChanges(true);
  }, []);

  const handleCleanup = useCallback(async () => {
    // Simulate cleanup operation
    console.log('Starting memory cleanup...');
    
    // In real implementation, would trigger actual cleanup
    setTimeout(() => {
      setStorageStats(prev => ({
        ...prev,
        used: Math.max(0.5, prev.used * 0.7), // Simulate space recovery
        chunks: Math.floor(prev.chunks * 0.8)
      }));
      console.log('Memory cleanup completed');
    }, 2000);
  }, []);

  const handleExportSettings = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      config
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memory-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [config]);

  const handleImportSettings = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.config) {
            setConfig({ ...defaultConfig, ...data.config });
            setHasChanges(true);
          }
        } catch (err) {
          alert('Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  }, []);

  if (!isOpen) return null;

  const storageUtilization = storageStats.used / storageStats.total;

  return (
    <div className={`memory-settings-overlay ${className}`}>
      <div className="memory-settings-modal">
        <div className="memory-settings-header">
          <h2>🧠 Memory Settings</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        {/* Storage Overview */}
        <div className="storage-overview">
          <div className="storage-info">
            <div className="storage-bar">
              <div 
                className="storage-fill"
                style={{ 
                  width: `${storageUtilization * 100}%`,
                  backgroundColor: storageUtilization > 0.8 ? '#ff6b6b' : 
                                  storageUtilization > 0.6 ? '#ffd93d' : '#6bcf7f'
                }}
              />
            </div>
            <div className="storage-stats">
              <span>{storageStats.used.toFixed(1)} GB / {storageStats.total} GB</span>
              <span>{storageStats.chunks} chunks in {storageStats.files} files</span>
            </div>
          </div>
          <button onClick={handleCleanup} className="cleanup-button">
            🧹 Cleanup
          </button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          {['storage', 'retention', 'privacy', 'performance', 'exclusions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="settings-content">
          {activeTab === 'storage' && (
            <div className="settings-section">
              <h3>Storage Configuration</h3>
              
              <div className="setting-item">
                <label>Disk Quota (GB)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={config.storage.diskQuotaGB}
                  onChange={(e) => handleConfigChange('storage', 'diskQuotaGB', Number(e.target.value))}
                />
                <small>Maximum disk space for context storage</small>
              </div>

              <div className="setting-item">
                <label>Max Context Size (MB)</label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={config.storage.maxContextSizeMB}
                  onChange={(e) => handleConfigChange('storage', 'maxContextSizeMB', Number(e.target.value))}
                />
                <small>Maximum size for a single context session</small>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={config.storage.compressionEnabled}
                    onChange={(e) => handleConfigChange('storage', 'compressionEnabled', e.target.checked)}
                  />
                  Enable Compression
                </label>
                <small>Compress stored context to save space</small>
              </div>

              <div className="setting-item">
                <label>Cleanup Threshold (%)</label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={config.storage.cleanupThresholdPercent}
                  onChange={(e) => handleConfigChange('storage', 'cleanupThresholdPercent', Number(e.target.value))}
                />
                <span>{config.storage.cleanupThresholdPercent}%</span>
                <small>Trigger cleanup when storage exceeds this percentage</small>
              </div>
            </div>
          )}

          {activeTab === 'retention' && (
            <div className="settings-section">
              <h3>Retention Policies</h3>
              
              <div className="setting-item">
                <label>Context Expiry (days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={config.retention.contextExpiryDays}
                  onChange={(e) => handleConfigChange('retention', 'contextExpiryDays', Number(e.target.value))}
                />
                <small>Automatically remove context older than this</small>
              </div>

              <div className="setting-item">
                <label>Max Chunks per File</label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={config.retention.maxChunksPerFile}
                  onChange={(e) => handleConfigChange('retention', 'maxChunksPerFile', Number(e.target.value))}
                />
                <small>Maximum context chunks to store per file</small>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={config.retention.keepPinnedIndefinitely}
                    onChange={(e) => handleConfigChange('retention', 'keepPinnedIndefinitely', e.target.checked)}
                  />
                  Keep Pinned Context Indefinitely
                </label>
                <small>Pinned context will not be automatically deleted</small>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={config.retention.autoCleanupEnabled}
                    onChange={(e) => handleConfigChange('retention', 'autoCleanupEnabled', e.target.checked)}
                  />
                  Enable Auto-Cleanup
                </label>
                <small>Automatically clean up old context based on policies</small>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h3>Privacy Controls</h3>
              
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={config.privacy.excludePersonalData}
                    onChange={(e) => handleConfigChange('privacy', 'excludePersonalData', e.target.checked)}
                  />
                  Exclude Personal Data
                </label>
                <small>Filter out names, emails, and personal identifiers</small>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={config.privacy.excludeCredentials}
                    onChange={(e) => handleConfigChange('privacy', 'excludeCredentials', e.target.checked)}
                  />
                  Exclude Credentials
                </label>
                <small>Filter out passwords, API keys, and secrets</small>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={config.privacy.excludeThirdPartyCode}
                    onChange={(e) => handleConfigChange('privacy', 'excludeThirdPartyCode', e.target.checked)}
                  />
                  Exclude Third-Party Code
                </label>
                <small>Skip indexing of node_modules and vendor directories</small>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={config.privacy.localOnlyMode}
                    onChange={(e) => handleConfigChange('privacy', 'localOnlyMode', e.target.checked)}
                  />
                  Local-Only Mode
                </label>
                <small>Never send context to cloud services</small>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="settings-section">
              <h3>Performance Tuning</h3>
              
              <div className="setting-item">
                <label>Max Concurrent Indexing</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={config.performance.maxConcurrentIndexing}
                  onChange={(e) => handleConfigChange('performance', 'maxConcurrentIndexing', Number(e.target.value))}
                />
                <small>Number of files to index simultaneously</small>
              </div>

              <div className="setting-item">
                <label>Indexing Batch Size</label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={config.performance.indexingBatchSize}
                  onChange={(e) => handleConfigChange('performance', 'indexingBatchSize', Number(e.target.value))}
                />
                <small>Chunk size for batch processing</small>
              </div>

              <div className="setting-item">
                <label>Vector Search Limit</label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={config.performance.vectorSearchLimit}
                  onChange={(e) => handleConfigChange('performance', 'vectorSearchLimit', Number(e.target.value))}
                />
                <small>Maximum results for vector similarity search</small>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={config.performance.cacheWarmingEnabled}
                    onChange={(e) => handleConfigChange('performance', 'cacheWarmingEnabled', e.target.checked)}
                  />
                  Enable Cache Warming
                </label>
                <small>Pre-load frequently accessed context</small>
              </div>
            </div>
          )}

          {activeTab === 'exclusions' && (
            <div className="settings-section">
              <h3>Exclusion Patterns</h3>
              
              <div className="exclusion-group">
                <h4>File Patterns</h4>
                {config.exclusions.filePatterns.map((pattern, index) => (
                  <div key={index} className="exclusion-item">
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) => handleArrayChange('exclusions', 'filePatterns', index, e.target.value)}
                    />
                    <button onClick={() => handleArrayRemove('exclusions', 'filePatterns', index)}>×</button>
                  </div>
                ))}
                <button onClick={() => handleArrayAdd('exclusions', 'filePatterns', '*.txt')}>+ Add Pattern</button>
              </div>

              <div className="exclusion-group">
                <h4>Directory Patterns</h4>
                {config.exclusions.directoryPatterns.map((pattern, index) => (
                  <div key={index} className="exclusion-item">
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) => handleArrayChange('exclusions', 'directoryPatterns', index, e.target.value)}
                    />
                    <button onClick={() => handleArrayRemove('exclusions', 'directoryPatterns', index)}>×</button>
                  </div>
                ))}
                <button onClick={() => handleArrayAdd('exclusions', 'directoryPatterns', 'temp')}>+ Add Pattern</button>
              </div>

              <div className="exclusion-group">
                <h4>Content Patterns</h4>
                {config.exclusions.contentPatterns.map((pattern, index) => (
                  <div key={index} className="exclusion-item">
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) => handleArrayChange('exclusions', 'contentPatterns', index, e.target.value)}
                    />
                    <button onClick={() => handleArrayRemove('exclusions', 'contentPatterns', index)}>×</button>
                  </div>
                ))}
                <button onClick={() => handleArrayAdd('exclusions', 'contentPatterns', 'sensitive')}>+ Add Pattern</button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="memory-settings-footer">
          <div className="footer-actions">
            <button onClick={handleExportSettings} className="export-button">
              📤 Export
            </button>
            <label className="import-button">
              📥 Import
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                style={{ display: 'none' }}
              />
            </label>
            <button onClick={handleReset} className="reset-button">
              🔄 Reset
            </button>
          </div>
          
          <div className="save-actions">
            <button onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              className={`save-button ${hasChanges ? 'has-changes' : ''}`}
              disabled={!hasChanges}
            >
              {hasChanges ? 'Save Changes' : 'Saved'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS styles
const styles = `
.memory-settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  font-family: 'Inter', sans-serif;
}

.memory-settings-modal {
  background: #1a202c;
  color: #e2e8f0;
  border-radius: 12px;
  width: 90vw;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid #2d3748;
}

.memory-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #2d3748;
  flex-shrink: 0;
}

.memory-settings-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.close-button:hover {
  background: #2d3748;
}

.storage-overview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #2d3748;
  border-bottom: 1px solid #4a5568;
}

.storage-info {
  flex: 1;
}

.storage-bar {
  height: 8px;
  background: #4a5568;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.storage-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.storage-stats {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #a0aec0;
}

.cleanup-button {
  background: #4299e1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  margin-left: 16px;
}

.cleanup-button:hover {
  background: #3182ce;
}

.settings-tabs {
  display: flex;
  background: #2d3748;
  border-bottom: 1px solid #4a5568;
  overflow-x: auto;
}

.tab-button {
  background: none;
  border: none;
  color: #a0aec0;
  padding: 16px 24px;
  cursor: pointer;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  transition: all 0.2s;
}

.tab-button:hover {
  color: #e2e8f0;
  background: #4a5568;
}

.tab-button.active {
  color: #4299e1;
  border-bottom-color: #4299e1;
  background: #1a202c;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.settings-section h3 {
  margin: 0 0 24px 0;
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
}

.setting-item {
  margin-bottom: 24px;
}

.setting-item label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #e2e8f0;
}

.setting-item input[type="text"],
.setting-item input[type="number"] {
  width: 100%;
  background: #2d3748;
  border: 1px solid #4a5568;
  border-radius: 6px;
  color: #e2e8f0;
  padding: 12px;
  font-size: 14px;
}

.setting-item input[type="range"] {
  width: calc(100% - 60px);
  margin-right: 12px;
}

.setting-item input[type="checkbox"] {
  margin-right: 8px;
  transform: scale(1.2);
}

.setting-item small {
  display: block;
  color: #a0aec0;
  font-size: 12px;
  margin-top: 4px;
}

.exclusion-group {
  margin-bottom: 32px;
}

.exclusion-group h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #e2e8f0;
}

.exclusion-item {
  display: flex;
  margin-bottom: 8px;
}

.exclusion-item input {
  flex: 1;
  background: #2d3748;
  border: 1px solid #4a5568;
  border-radius: 4px 0 0 4px;
  color: #e2e8f0;
  padding: 8px 12px;
  font-size: 14px;
}

.exclusion-item button {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-weight: bold;
}

.exclusion-group > button {
  background: #4299e1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.memory-settings-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-top: 1px solid #2d3748;
  background: #2d3748;
  flex-shrink: 0;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.export-button,
.import-button,
.reset-button {
  background: #4a5568;
  color: #e2e8f0;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.import-button {
  display: inline-block;
}

.save-actions {
  display: flex;
  gap: 12px;
}

.cancel-button {
  background: none;
  color: #a0aec0;
  border: 1px solid #4a5568;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.save-button {
  background: #4a5568;
  color: #a0aec0;
  border: none;
  padding: 8px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.save-button.has-changes {
  background: #48bb78;
  color: white;
}

.save-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default MemorySettings; 