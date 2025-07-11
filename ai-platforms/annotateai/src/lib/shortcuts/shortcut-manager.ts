export interface ShortcutDefinition {
  id: string;
  name: string;
  description: string;
  category: 'navigation' | 'annotation' | 'tools' | 'view' | 'edit' | 'global';
  defaultKeys: string[];
  currentKeys: string[];
  context?: string; // Which annotation tool or page this applies to
  action: string; // Action function name
  enabled: boolean;
  conflictsWith?: string[]; // Other shortcut IDs that conflict
  customizable: boolean;
  global: boolean; // Works across entire app vs specific contexts
}

export interface ShortcutContext {
  id: string;
  name: string;
  description: string;
  active: boolean;
  shortcuts: string[];
}

export interface ShortcutPreferences {
  userId: string;
  customShortcuts: Record<string, string[]>;
  disabledShortcuts: string[];
  contexts: Record<string, boolean>;
  showHelpOverlay: boolean;
  enableSounds: boolean;
  enableVisualFeedback: boolean;
}

// Predefined shortcut definitions
export const defaultShortcuts: ShortcutDefinition[] = [
  // Global shortcuts
  {
    id: 'global_search',
    name: 'Global Search',
    description: 'Open global search dialog',
    category: 'global',
    defaultKeys: ['cmd+k', 'ctrl+k'],
    currentKeys: ['cmd+k', 'ctrl+k'],
    action: 'openGlobalSearch',
    enabled: true,
    customizable: false,
    global: true
  },
  {
    id: 'save_annotation',
    name: 'Save Annotation',
    description: 'Save current annotation changes',
    category: 'annotation',
    defaultKeys: ['cmd+s', 'ctrl+s'],
    currentKeys: ['cmd+s', 'ctrl+s'],
    action: 'saveAnnotation',
    enabled: true,
    customizable: true,
    global: false
  },
  {
    id: 'undo_annotation',
    name: 'Undo',
    description: 'Undo last annotation action',
    category: 'edit',
    defaultKeys: ['cmd+z', 'ctrl+z'],
    currentKeys: ['cmd+z', 'ctrl+z'],
    action: 'undoAnnotation',
    enabled: true,
    customizable: true,
    global: false
  },
  {
    id: 'redo_annotation',
    name: 'Redo',
    description: 'Redo last undone action',
    category: 'edit',
    defaultKeys: ['cmd+shift+z', 'ctrl+shift+z'],
    currentKeys: ['cmd+shift+z', 'ctrl+shift+z'],
    action: 'redoAnnotation',
    enabled: true,
    customizable: true,
    global: false
  },

  // Navigation shortcuts
  {
    id: 'next_image',
    name: 'Next Image',
    description: 'Navigate to next image',
    category: 'navigation',
    defaultKeys: ['arrowright', 'd'],
    currentKeys: ['arrowright', 'd'],
    action: 'nextImage',
    enabled: true,
    customizable: true,
    global: false
  },
  {
    id: 'prev_image',
    name: 'Previous Image',
    description: 'Navigate to previous image',
    category: 'navigation',
    defaultKeys: ['arrowleft', 'a'],
    currentKeys: ['arrowleft', 'a'],
    action: 'previousImage',
    enabled: true,
    customizable: true,
    global: false
  },
  {
    id: 'first_image',
    name: 'First Image',
    description: 'Go to first image in dataset',
    category: 'navigation',
    defaultKeys: ['home'],
    currentKeys: ['home'],
    action: 'firstImage',
    enabled: true,
    customizable: true,
    global: false
  },
  {
    id: 'last_image',
    name: 'Last Image',
    description: 'Go to last image in dataset',
    category: 'navigation',
    defaultKeys: ['end'],
    currentKeys: ['end'],
    action: 'lastImage',
    enabled: true,
    customizable: true,
    global: false
  },

  // Annotation tool shortcuts
  {
    id: 'select_bbox_tool',
    name: 'Bounding Box Tool',
    description: 'Activate bounding box annotation tool',
    category: 'tools',
    defaultKeys: ['b'],
    currentKeys: ['b'],
    action: 'selectBboxTool',
    enabled: true,
    customizable: true,
    global: false,
    context: 'annotation_workbench'
  },
  {
    id: 'select_polygon_tool',
    name: 'Polygon Tool',
    description: 'Activate polygon annotation tool',
    category: 'tools',
    defaultKeys: ['p'],
    currentKeys: ['p'],
    action: 'selectPolygonTool',
    enabled: true,
    customizable: true,
    global: false,
    context: 'annotation_workbench'
  },
  {
    id: 'select_keypoint_tool',
    name: 'Keypoint Tool',
    description: 'Activate keypoint annotation tool',
    category: 'tools',
    defaultKeys: ['k'],
    currentKeys: ['k'],
    action: 'selectKeypointTool',
    enabled: true,
    customizable: true,
    global: false,
    context: 'annotation_workbench'
  },
  {
    id: 'select_pan_tool',
    name: 'Pan Tool',
    description: 'Activate pan/move tool',
    category: 'tools',
    defaultKeys: ['space'],
    currentKeys: ['space'],
    action: 'selectPanTool',
    enabled: true,
    customizable: true,
    global: false,
    context: 'annotation_workbench'
  },

  // View shortcuts
  {
    id: 'zoom_in',
    name: 'Zoom In',
    description: 'Zoom into the image',
    category: 'view',
    defaultKeys: ['cmd+=', 'ctrl+=', '+'],
    currentKeys: ['cmd+=', 'ctrl+=', '+'],
    action: 'zoomIn',
    enabled: true,
    customizable: true,
    global: false,
    context: 'annotation_workbench'
  },
  {
    id: 'zoom_out',
    name: 'Zoom Out',
    description: 'Zoom out of the image',
    category: 'view',
    defaultKeys: ['cmd+-', 'ctrl+-', '-'],
    currentKeys: ['cmd+-', 'ctrl+-', '-'],
    action: 'zoomOut',
    enabled: true,
    customizable: true,
    global: false,
    context: 'annotation_workbench'
  },
  {
    id: 'zoom_fit',
    name: 'Fit to Screen',
    description: 'Fit image to screen',
    category: 'view',
    defaultKeys: ['cmd+0', 'ctrl+0'],
    currentKeys: ['cmd+0', 'ctrl+0'],
    action: 'zoomFit',
    enabled: true,
    customizable: true,
    global: false,
    context: 'annotation_workbench'
  },
  {
    id: 'zoom_actual',
    name: 'Actual Size',
    description: 'View image at 100% zoom',
    category: 'view',
    defaultKeys: ['cmd+1', 'ctrl+1'],
    currentKeys: ['cmd+1', 'ctrl+1'],
    action: 'zoomActual',
    enabled: true,
    customizable: true,
    global: false,
    context: 'annotation_workbench'
  },

  // Annotation editing
  {
    id: 'delete_annotation',
    name: 'Delete Annotation',
    description: 'Delete selected annotation',
    category: 'edit',
    defaultKeys: ['delete', 'backspace'],
    currentKeys: ['delete', 'backspace'],
    action: 'deleteAnnotation',
    enabled: true,
    customizable: true,
    global: false,
    context: 'annotation_workbench'
  },
  {
    id: 'duplicate_annotation',
    name: 'Duplicate Annotation',
    description: 'Duplicate selected annotation',
    category: 'edit',
    defaultKeys: ['cmd+d', 'ctrl+d'],
    currentKeys: ['cmd+d', 'ctrl+d'],
    action: 'duplicateAnnotation',
    enabled: true,
    customizable: true,
    global: false,
    context: 'annotation_workbench'
  },
  {
    id: 'select_all_annotations',
    name: 'Select All',
    description: 'Select all annotations',
    category: 'edit',
    defaultKeys: ['cmd+a', 'ctrl+a'],
    currentKeys: ['cmd+a', 'ctrl+a'],
    action: 'selectAllAnnotations',
    enabled: true,
    customizable: true,
    global: false,
    context: 'annotation_workbench'
  },

  // Quick actions
  {
    id: 'toggle_labels',
    name: 'Toggle Labels',
    description: 'Show/hide annotation labels',
    category: 'view',
    defaultKeys: ['l'],
    currentKeys: ['l'],
    action: 'toggleLabels',
    enabled: true,
    customizable: true,
    global: false,
    context: 'annotation_workbench'
  },
  {
    id: 'toggle_grid',
    name: 'Toggle Grid',
    description: 'Show/hide grid overlay',
    category: 'view',
    defaultKeys: ['g'],
    currentKeys: ['g'],
    action: 'toggleGrid',
    enabled: true,
    customizable: true,
    global: false,
    context: 'annotation_workbench'
  },
  {
    id: 'toggle_help',
    name: 'Toggle Help',
    description: 'Show/hide keyboard shortcuts help',
    category: 'global',
    defaultKeys: ['?', 'h'],
    currentKeys: ['?', 'h'],
    action: 'toggleHelp',
    enabled: true,
    customizable: false,
    global: true
  },

  // Category selection shortcuts (1-9)
  {
    id: 'select_category_1',
    name: 'Category 1',
    description: 'Select category 1 for new annotations',
    category: 'annotation',
    defaultKeys: ['1'],
    currentKeys: ['1'],
    action: 'selectCategory1',
    enabled: true,
    customizable: true,
    global: false,
    context: 'annotation_workbench'
  },
  {
    id: 'select_category_2',
    name: 'Category 2',
    description: 'Select category 2 for new annotations',
    category: 'annotation',
    defaultKeys: ['2'],
    currentKeys: ['2'],
    action: 'selectCategory2',
    enabled: true,
    customizable: true,
    global: false,
    context: 'annotation_workbench'
  },
  {
    id: 'select_category_3',
    name: 'Category 3',
    description: 'Select category 3 for new annotations',
    category: 'annotation',
    defaultKeys: ['3'],
    currentKeys: ['3'],
    action: 'selectCategory3',
    enabled: true,
    customizable: true,
    global: false,
    context: 'annotation_workbench'
  },

  // Review shortcuts
  {
    id: 'approve_annotation',
    name: 'Approve',
    description: 'Approve current annotation',
    category: 'annotation',
    defaultKeys: ['cmd+enter', 'ctrl+enter'],
    currentKeys: ['cmd+enter', 'ctrl+enter'],
    action: 'approveAnnotation',
    enabled: true,
    customizable: true,
    global: false,
    context: 'review'
  },
  {
    id: 'reject_annotation',
    name: 'Reject',
    description: 'Reject current annotation',
    category: 'annotation',
    defaultKeys: ['cmd+backspace', 'ctrl+backspace'],
    currentKeys: ['cmd+backspace', 'ctrl+backspace'],
    action: 'rejectAnnotation',
    enabled: true,
    customizable: true,
    global: false,
    context: 'review'
  }
];

// Predefined contexts
export const defaultContexts: ShortcutContext[] = [
  {
    id: 'global',
    name: 'Global',
    description: 'Available everywhere in the application',
    active: true,
    shortcuts: ['global_search', 'toggle_help']
  },
  {
    id: 'annotation_workbench',
    name: 'Annotation Workbench',
    description: 'Active when annotating images',
    active: false,
    shortcuts: [
      'save_annotation', 'undo_annotation', 'redo_annotation',
      'next_image', 'prev_image', 'first_image', 'last_image',
      'select_bbox_tool', 'select_polygon_tool', 'select_keypoint_tool', 'select_pan_tool',
      'zoom_in', 'zoom_out', 'zoom_fit', 'zoom_actual',
      'delete_annotation', 'duplicate_annotation', 'select_all_annotations',
      'toggle_labels', 'toggle_grid',
      'select_category_1', 'select_category_2', 'select_category_3'
    ]
  },
  {
    id: 'review',
    name: 'Review Interface',
    description: 'Active when reviewing annotations',
    active: false,
    shortcuts: [
      'next_image', 'prev_image',
      'approve_annotation', 'reject_annotation',
      'zoom_in', 'zoom_out', 'zoom_fit'
    ]
  },
  {
    id: 'project_dashboard',
    name: 'Project Dashboard',
    description: 'Active on project overview pages',
    active: false,
    shortcuts: ['global_search']
  }
];

export class ShortcutManager {
  private shortcuts: Map<string, ShortcutDefinition> = new Map();
  private contexts: Map<string, ShortcutContext> = new Map();
  private activeListeners: Map<string, (event: KeyboardEvent) => void> = new Map();
  private actionHandlers: Map<string, () => void> = new Map();
  private preferences: ShortcutPreferences;
  private isEnabled: boolean = true;
  private helpOverlayVisible: boolean = false;

  constructor(userId?: string) {
    this.preferences = {
      userId: userId || 'default',
      customShortcuts: {},
      disabledShortcuts: [],
      contexts: {},
      showHelpOverlay: true,
      enableSounds: false,
      enableVisualFeedback: true
    };

    this.initializeShortcuts();
    this.initializeContexts();
    this.loadPreferences();
    this.attachGlobalListeners();
  }

  private initializeShortcuts() {
    defaultShortcuts.forEach(shortcut => {
      this.shortcuts.set(shortcut.id, { ...shortcut });
    });
  }

  private initializeContexts() {
    defaultContexts.forEach(context => {
      this.contexts.set(context.id, { ...context });
    });
  }

  private loadPreferences() {
    try {
      const saved = localStorage.getItem(`shortcut_preferences_${this.preferences.userId}`);
      if (saved) {
        const savedPrefs = JSON.parse(saved);
        this.preferences = { ...this.preferences, ...savedPrefs };
        this.applyPreferences();
      }
    } catch (error) {
      console.warn('Failed to load shortcut preferences:', error);
    }
  }

  private savePreferences() {
    try {
      localStorage.setItem(
        `shortcut_preferences_${this.preferences.userId}`,
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      console.warn('Failed to save shortcut preferences:', error);
    }
  }

  private applyPreferences() {
    // Apply custom shortcuts
    Object.entries(this.preferences.customShortcuts).forEach(([shortcutId, keys]) => {
      const shortcut = this.shortcuts.get(shortcutId);
      if (shortcut && shortcut.customizable) {
        shortcut.currentKeys = keys;
      }
    });

    // Apply disabled shortcuts
    this.preferences.disabledShortcuts.forEach(shortcutId => {
      const shortcut = this.shortcuts.get(shortcutId);
      if (shortcut) {
        shortcut.enabled = false;
      }
    });

    // Apply context preferences
    Object.entries(this.preferences.contexts).forEach(([contextId, enabled]) => {
      const context = this.contexts.get(contextId);
      if (context) {
        context.active = enabled;
      }
    });
  }

  private attachGlobalListeners() {
    document.addEventListener('keydown', this.handleGlobalKeyDown.bind(this));
    document.addEventListener('keyup', this.handleGlobalKeyUp.bind(this));
  }

  private handleGlobalKeyDown(event: KeyboardEvent) {
    if (!this.isEnabled) return;

    const keyString = this.formatKeyEvent(event);
    const matchingShortcuts = this.findMatchingShortcuts(keyString);

    for (const shortcut of matchingShortcuts) {
      if (this.shouldExecuteShortcut(shortcut, event)) {
        event.preventDefault();
        event.stopPropagation();
        this.executeShortcut(shortcut);
        
        if (this.preferences.enableVisualFeedback) {
          this.showVisualFeedback(shortcut);
        }
        
        if (this.preferences.enableSounds) {
          this.playSound(shortcut);
        }
        
        break; // Execute only the first matching shortcut
      }
    }
  }

  private handleGlobalKeyUp(event: KeyboardEvent) {
    // Handle key up events if needed for certain shortcuts
  }

  private formatKeyEvent(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('cmd');
    
    const key = event.key.toLowerCase();
    parts.push(key);
    
    return parts.join('+');
  }

  private findMatchingShortcuts(keyString: string): ShortcutDefinition[] {
    const matching: ShortcutDefinition[] = [];
    
    this.shortcuts.forEach(shortcut => {
      if (shortcut.enabled && shortcut.currentKeys.includes(keyString)) {
        matching.push(shortcut);
      }
    });
    
    return matching;
  }

  private shouldExecuteShortcut(shortcut: ShortcutDefinition, event: KeyboardEvent): boolean {
    // Check if shortcut is disabled
    if (!shortcut.enabled) return false;
    
    // Check context restrictions
    if (shortcut.context && !shortcut.global) {
      const context = this.contexts.get(shortcut.context);
      if (!context || !context.active) return false;
    }
    
    // Check if we're in an input field (unless it's a global shortcut)
    if (!shortcut.global) {
      const target = event.target as HTMLElement;
      if (target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      )) {
        return false;
      }
    }
    
    return true;
  }

  private executeShortcut(shortcut: ShortcutDefinition) {
    const handler = this.actionHandlers.get(shortcut.action);
    if (handler) {
      try {
        handler();
      } catch (error) {
        console.error(`Error executing shortcut ${shortcut.id}:`, error);
      }
    } else {
      console.warn(`No handler registered for action: ${shortcut.action}`);
    }
  }

  private showVisualFeedback(shortcut: ShortcutDefinition) {
    // Create visual feedback element
    const feedback = document.createElement('div');
    feedback.className = 'shortcut-feedback';
    feedback.textContent = shortcut.name;
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(99, 102, 241, 0.9);
      color: white;
      padding: 8px 16px;
      rounded: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      pointer-events: none;
      animation: slideInOut 2s ease-in-out;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 2000);
  }

  private playSound(shortcut: ShortcutDefinition) {
    // Play audio feedback (optional)
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgiBDSb2O7BfS0AK4nI7pZ/Ggg8k9n0wXwvBSx/x+6NcSpqCGCG2OyZOw8TADaW2O7BfyUFMI3M7NmGNQ0VbMD54KV5FAREguP2uW4hAzqY1vbFfSMELZZIFJZaT2yzXyBGILhfMAmhU+2hFJNCEAOW0+3LvnwkBDyZ2O/HfCwGKH/H7Y19KQs9j9j2v30vBSx+ye6MeC4NL4nL8N2NcSIFMHTRwqR6GwOYcBx2VAb8IxLMNt4');
      audio.volume = 0.1;
      audio.play().catch(() => {}); // Ignore play failures
    } catch (error) {
      // Ignore audio errors
    }
  }

  // Public API methods
  public registerActionHandler(action: string, handler: () => void) {
    this.actionHandlers.set(action, handler);
  }

  public unregisterActionHandler(action: string) {
    this.actionHandlers.delete(action);
  }

  public setContext(contextId: string, active: boolean) {
    const context = this.contexts.get(contextId);
    if (context) {
      context.active = active;
    }
  }

  public getActiveShortcuts(): ShortcutDefinition[] {
    const activeShortcuts: ShortcutDefinition[] = [];
    
    this.shortcuts.forEach(shortcut => {
      if (shortcut.enabled) {
        if (shortcut.global) {
          activeShortcuts.push(shortcut);
        } else if (shortcut.context) {
          const context = this.contexts.get(shortcut.context);
          if (context && context.active) {
            activeShortcuts.push(shortcut);
          }
        }
      }
    });
    
    return activeShortcuts;
  }

  public getShortcutsByCategory(category: string): ShortcutDefinition[] {
    return Array.from(this.shortcuts.values()).filter(s => s.category === category);
  }

  public customizeShortcut(shortcutId: string, newKeys: string[]): boolean {
    const shortcut = this.shortcuts.get(shortcutId);
    
    if (!shortcut || !shortcut.customizable) {
      return false;
    }
    
    // Check for conflicts
    const conflicts = this.checkForConflicts(shortcutId, newKeys);
    if (conflicts.length > 0) {
      console.warn('Shortcut conflicts detected:', conflicts);
      return false;
    }
    
    shortcut.currentKeys = newKeys;
    this.preferences.customShortcuts[shortcutId] = newKeys;
    this.savePreferences();
    
    return true;
  }

  public resetShortcut(shortcutId: string) {
    const shortcut = this.shortcuts.get(shortcutId);
    if (shortcut) {
      shortcut.currentKeys = [...shortcut.defaultKeys];
      delete this.preferences.customShortcuts[shortcutId];
      this.savePreferences();
    }
  }

  public enableShortcut(shortcutId: string) {
    const shortcut = this.shortcuts.get(shortcutId);
    if (shortcut) {
      shortcut.enabled = true;
      this.preferences.disabledShortcuts = this.preferences.disabledShortcuts.filter(id => id !== shortcutId);
      this.savePreferences();
    }
  }

  public disableShortcut(shortcutId: string) {
    const shortcut = this.shortcuts.get(shortcutId);
    if (shortcut) {
      shortcut.enabled = false;
      if (!this.preferences.disabledShortcuts.includes(shortcutId)) {
        this.preferences.disabledShortcuts.push(shortcutId);
      }
      this.savePreferences();
    }
  }

  public checkForConflicts(shortcutId: string, keys: string[]): string[] {
    const conflicts: string[] = [];
    
    this.shortcuts.forEach((shortcut, id) => {
      if (id !== shortcutId && shortcut.enabled) {
        const overlapping = keys.some(key => shortcut.currentKeys.includes(key));
        if (overlapping) {
          conflicts.push(id);
        }
      }
    });
    
    return conflicts;
  }

  public enable() {
    this.isEnabled = true;
  }

  public disable() {
    this.isEnabled = false;
  }

  public showHelp() {
    this.helpOverlayVisible = true;
    // Emit event or call callback to show help overlay
    window.dispatchEvent(new CustomEvent('shortcut:showHelp', { 
      detail: { shortcuts: this.getActiveShortcuts() }
    }));
  }

  public hideHelp() {
    this.helpOverlayVisible = false;
    window.dispatchEvent(new CustomEvent('shortcut:hideHelp'));
  }

  public toggleHelp() {
    if (this.helpOverlayVisible) {
      this.hideHelp();
    } else {
      this.showHelp();
    }
  }

  public exportPreferences(): string {
    return JSON.stringify(this.preferences, null, 2);
  }

  public importPreferences(preferencesJson: string): boolean {
    try {
      const imported = JSON.parse(preferencesJson);
      this.preferences = { ...this.preferences, ...imported };
      this.applyPreferences();
      this.savePreferences();
      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }

  public destroy() {
    document.removeEventListener('keydown', this.handleGlobalKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleGlobalKeyUp.bind(this));
    this.actionHandlers.clear();
    this.activeListeners.clear();
  }
}

// Global instance
let globalShortcutManager: ShortcutManager | null = null;

export function getShortcutManager(userId?: string): ShortcutManager {
  if (!globalShortcutManager) {
    globalShortcutManager = new ShortcutManager(userId);
  }
  return globalShortcutManager;
}

// CSS for visual feedback
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInOut {
      0% { transform: translateX(100%); opacity: 0; }
      10% { transform: translateX(0); opacity: 1; }
      90% { transform: translateX(0); opacity: 1; }
      100% { transform: translateX(100%); opacity: 0; }
    }
    
    .shortcut-feedback {
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-radius: 8px;
    }
  `;
  document.head.appendChild(style);
} 