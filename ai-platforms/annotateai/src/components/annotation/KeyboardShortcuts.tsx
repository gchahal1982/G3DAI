'use client';

import { useState, useEffect } from 'react';
import { ShortcutDefinition, getShortcutManager } from '@/lib/shortcuts/shortcut-manager';

interface KeyboardShortcutsProps {
  visible: boolean;
  onClose: () => void;
  context?: string;
}

export function KeyboardShortcuts({ visible, onClose, context }: KeyboardShortcutsProps) {
  const [shortcuts, setShortcuts] = useState<ShortcutDefinition[]>([]);
  const [activeTab, setActiveTab] = useState<'help' | 'customize'>('help');
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [newKeys, setNewKeys] = useState<string[]>([]);
  const [recordingKeys, setRecordingKeys] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const shortcutManager = getShortcutManager();

  useEffect(() => {
    if (visible) {
      loadShortcuts();
    }
  }, [visible, context]);

  useEffect(() => {
    const handleShowHelp = () => setShortcuts(shortcutManager.getActiveShortcuts());
    const handleHideHelp = () => {};

    window.addEventListener('shortcut:showHelp', handleShowHelp);
    window.addEventListener('shortcut:hideHelp', handleHideHelp);

    return () => {
      window.removeEventListener('shortcut:showHelp', handleShowHelp);
      window.removeEventListener('shortcut:hideHelp', handleHideHelp);
    };
  }, []);

  const loadShortcuts = () => {
    const allShortcuts = shortcutManager.getActiveShortcuts();
    setShortcuts(allShortcuts);
  };

  const categories = [
    { id: 'all', name: 'All Shortcuts' },
    { id: 'global', name: 'Global' },
    { id: 'navigation', name: 'Navigation' },
    { id: 'annotation', name: 'Annotation' },
    { id: 'tools', name: 'Tools' },
    { id: 'view', name: 'View' },
    { id: 'edit', name: 'Edit' }
  ];

  const filteredShortcuts = shortcuts.filter(shortcut => {
    const matchesSearch = searchQuery === '' || 
      shortcut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.currentKeys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || shortcut.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const groupedShortcuts = filteredShortcuts.reduce((groups, shortcut) => {
    const category = shortcut.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(shortcut);
    return groups;
  }, {} as Record<string, ShortcutDefinition[]>);

  const handleEditShortcut = (shortcutId: string) => {
    const shortcut = shortcuts.find(s => s.id === shortcutId);
    if (shortcut && shortcut.customizable) {
      setEditingShortcut(shortcutId);
      setNewKeys([...shortcut.currentKeys]);
      setConflicts([]);
    }
  };

  const handleSaveShortcut = () => {
    if (editingShortcut && newKeys.length > 0) {
      const success = shortcutManager.customizeShortcut(editingShortcut, newKeys);
      if (success) {
        setEditingShortcut(null);
        setNewKeys([]);
        loadShortcuts();
      } else {
        // Show error message
        console.error('Failed to save shortcut');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingShortcut(null);
    setNewKeys([]);
    setConflicts([]);
    setRecordingKeys(false);
  };

  const handleResetShortcut = (shortcutId: string) => {
    shortcutManager.resetShortcut(shortcutId);
    loadShortcuts();
  };

  const handleToggleShortcut = (shortcutId: string) => {
    const shortcut = shortcuts.find(s => s.id === shortcutId);
    if (shortcut) {
      if (shortcut.enabled) {
        shortcutManager.disableShortcut(shortcutId);
      } else {
        shortcutManager.enableShortcut(shortcutId);
      }
      loadShortcuts();
    }
  };

  const handleKeyRecording = (event: React.KeyboardEvent) => {
    if (!recordingKeys) return;

    event.preventDefault();
    const keyString = formatKeyEvent(event.nativeEvent);
    
    if (!newKeys.includes(keyString)) {
      const updatedKeys = [...newKeys, keyString];
      setNewKeys(updatedKeys);
      
      // Check for conflicts
      if (editingShortcut) {
        const conflicts = shortcutManager.checkForConflicts(editingShortcut, updatedKeys);
        setConflicts(conflicts);
      }
    }
  };

  const formatKeyEvent = (event: KeyboardEvent): string => {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('cmd');
    
    const key = event.key.toLowerCase();
    parts.push(key);
    
    return parts.join('+');
  };

  const formatKeys = (keys: string[]): string => {
    return keys.map(key => {
      return key
        .split('+')
        .map(part => {
          switch (part) {
            case 'cmd': return '⌘';
            case 'ctrl': return 'Ctrl';
            case 'alt': return 'Alt';
            case 'shift': return 'Shift';
            case 'arrowup': return '↑';
            case 'arrowdown': return '↓';
            case 'arrowleft': return '←';
            case 'arrowright': return '→';
            case 'backspace': return '⌫';
            case 'delete': return 'Del';
            case 'enter': return '↵';
            case 'escape': return 'Esc';
            case 'space': return 'Space';
            case 'tab': return 'Tab';
            default: return part.toUpperCase();
          }
        })
        .join(' + ');
    }).join(', ');
  };

  const handleExportSettings = () => {
    const settings = shortcutManager.exportPreferences();
    const blob = new Blob([settings], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keyboard-shortcuts.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const success = shortcutManager.importPreferences(content);
        if (success) {
          loadShortcuts();
        } else {
          alert('Failed to import settings');
        }
      };
      reader.readAsText(file);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Keyboard Shortcuts
            </h2>
            <p className="text-gray-600 mt-1">Configure and view keyboard shortcuts</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('help')}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  activeTab === 'help' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Help
              </button>
              <button
                onClick={() => setActiveTab('customize')}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  activeTab === 'customize' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Customize
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search shortcuts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            {activeTab === 'customize' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportSettings}
                  className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Export
                </button>
                <label className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors cursor-pointer">
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSettings}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: '60vh' }}>
          {activeTab === 'help' && (
            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize">
                    {category} Shortcuts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {shortcuts.map(shortcut => (
                      <div key={shortcut.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{shortcut.name}</div>
                          <div className="text-sm text-gray-600">{shortcut.description}</div>
                        </div>
                        <div className="ml-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700 font-medium">
                            {formatKeys(shortcut.currentKeys)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'customize' && (
            <div className="space-y-4">
              {filteredShortcuts.map(shortcut => (
                <div key={shortcut.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{shortcut.name}</span>
                      {!shortcut.enabled && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                          Disabled
                        </span>
                      )}
                      {!shortcut.customizable && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          System
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{shortcut.description}</div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {editingShortcut === shortcut.id ? (
                      <div className="flex items-center space-x-2">
                        <div
                          className="px-3 py-1 border-2 border-dashed border-indigo-300 rounded-md min-w-[100px] text-center cursor-pointer"
                          onClick={() => setRecordingKeys(true)}
                          onKeyDown={handleKeyRecording}
                          tabIndex={0}
                        >
                          {recordingKeys ? (
                            <span className="text-indigo-600">Press keys...</span>
                          ) : (
                            <span className="text-indigo-700 font-medium">
                              {newKeys.length > 0 ? formatKeys(newKeys) : 'Click to record'}
                            </span>
                          )}
                        </div>
                        
                        {conflicts.length > 0 && (
                          <span className="text-xs text-red-600">
                            Conflicts with: {conflicts.join(', ')}
                          </span>
                        )}
                        
                        <button
                          onClick={handleSaveShortcut}
                          disabled={newKeys.length === 0 || conflicts.length > 0}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700 font-medium">
                          {formatKeys(shortcut.currentKeys)}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleToggleShortcut(shortcut.id)}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              shortcut.enabled
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {shortcut.enabled ? 'Disable' : 'Enable'}
                          </button>
                          
                          {shortcut.customizable && (
                            <>
                              <button
                                onClick={() => handleEditShortcut(shortcut.id)}
                                className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleResetShortcut(shortcut.id)}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                              >
                                Reset
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">?</kbd> or{' '}
            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">H</kbd> to toggle this help dialog
          </p>
        </div>
      </div>
    </div>
  );
} 