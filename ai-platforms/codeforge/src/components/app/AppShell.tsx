import React, { useState, useCallback, useEffect, useMemo } from 'react';
import './AppShell.css';

// Types and interfaces
interface AppTab {
  id: string;
  title: string;
  type: 'editor' | 'browser' | 'terminal' | 'settings' | 'dashboard';
  filePath?: string;
  content?: string;
  isDirty?: boolean;
  isActive: boolean;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  action?: () => void;
  children?: NavigationItem[];
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  aiModelStatus: 'loading' | 'ready' | 'error' | 'offline';
  activeRequests: number;
}

// Props interface
interface AppShellProps {
  onThemeToggle: () => void;
  theme: 'light' | 'dark' | 'auto';
  onSettingsOpen: () => void;
  onFileOpen: (filePath: string) => void;
  onFileCreate: () => void;
  onProjectOpen: () => void;
}

// Main AppShell component
export const AppShell: React.FC<AppShellProps> = ({
  onThemeToggle,
  theme,
  onSettingsOpen,
  onFileOpen,
  onFileCreate,
  onProjectOpen
}) => {
  // State management
  const [tabs, setTabs] = useState<AppTab[]>([
    {
      id: 'welcome',
      title: 'Welcome',
      type: 'dashboard',
      isActive: true
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('welcome');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkLatency: 0,
    aiModelStatus: 'ready',
    activeRequests: 0
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);

  // Navigation items
  const navigationItems: NavigationItem[] = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      action: () => addTab('dashboard', 'Dashboard', 'dashboard')
    },
    {
      id: 'files',
      label: 'Files',
      icon: '📁',
      children: [
        {
          id: 'open-file',
          label: 'Open File',
          icon: '📄',
          action: () => onFileOpen('')
        },
        {
          id: 'new-file',
          label: 'New File',
          icon: '➕',
          action: onFileCreate
        }
      ]
    },
    {
      id: 'ai-tools',
      label: 'AI Tools',
      icon: '🤖',
      badge: metrics.activeRequests,
      children: [
        {
          id: 'code-completion',
          label: 'Code Completion',
          icon: '⚡'
        },
        {
          id: 'ai-chat',
          label: 'AI Chat',
          icon: '💬'
        }
      ]
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: '💻',
      action: () => addTab('terminal', 'Terminal', 'terminal')
    },
    {
      id: 'extensions',
      label: 'Extensions',
      icon: '🧩'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      action: onSettingsOpen
    }
  ], [metrics.activeRequests, onFileOpen, onFileCreate, onSettingsOpen]);

  // Tab management
  const addTab = useCallback((id: string, title: string, type: AppTab['type'], filePath?: string) => {
    const existingTab = tabs.find(tab => tab.id === id);
    if (existingTab) {
      setActiveTabId(id);
      return;
    }

    const newTab: AppTab = {
      id,
      title,
      type,
      ...(filePath && { filePath }),
      isActive: true,
      isDirty: false
    };

    setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat([newTab]));
    setActiveTabId(id);
  }, [tabs]);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);
      if (tabId === activeTabId && filtered.length > 0) {
        const newActiveTab = filtered[filtered.length - 1];
        setActiveTabId(newActiveTab.id);
      }
      return filtered;
    });
  }, [activeTabId]);

  // Window controls (for Electron)
  const handleMinimize = useCallback(() => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.minimizeWindow();
    }
  }, []);

  const handleMaximize = useCallback(() => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.maximizeWindow();
    }
  }, []);

  const handleClose = useCallback(() => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.closeWindow();
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Command palette (Cmd+K / Ctrl+K)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
      
      // Toggle sidebar (Cmd+B / Ctrl+B)
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        setSidebarOpen(prev => !prev);
      }
      
      // New file (Cmd+N / Ctrl+N)
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        onFileCreate();
      }
      
      // Open file (Cmd+O / Ctrl+O)
      if ((event.metaKey || event.ctrlKey) && event.key === 'o') {
        event.preventDefault();
        onFileOpen('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onFileCreate, onFileOpen]);

  // Mock system metrics update
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        networkLatency: Math.random() * 100 + 50
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Render content based on active tab
  const renderTabContent = useCallback((tab: AppTab) => {
    switch (tab.type) {
      case 'editor':
        return (
          <div className="tab-content">
            <div className="editor-toolbar">
              <h3>Code Editor - {tab.filePath}</h3>
              <button onClick={onSettingsOpen}>Settings</button>
            </div>
            <div className="editor-content">
              <textarea 
                value={tab.content || '// Welcome to CodeForge!\n// Start coding...'}
                onChange={() => {}}
                className="code-editor"
                placeholder="Start coding..."
              />
            </div>
          </div>
        );
      case 'dashboard':
        return (
          <div className="tab-content dashboard">
            <h1>Welcome to CodeForge</h1>
            <p>Next-generation AI-assisted development platform with local privacy and cloud power.</p>
            <div className="action-buttons">
              <button className="primary-button" onClick={onFileCreate}>
                📄 New File
              </button>
              <button className="secondary-button" onClick={onProjectOpen}>
                📁 Open Project
              </button>
              <button className="secondary-button" onClick={onSettingsOpen}>
                ⚙️ Settings
              </button>
            </div>
          </div>
        );
      case 'terminal':
        return (
          <div className="tab-content terminal">
            <div className="terminal-header">Terminal</div>
            <div className="terminal-content">
              <div className="terminal-line">$ CodeForge Terminal</div>
              <div className="terminal-line">Ready for commands...</div>
              <div className="terminal-cursor">_</div>
            </div>
          </div>
        );
      default:
        return (
          <div className="tab-content">
            <h2>Content for {tab.title}</h2>
          </div>
        );
    }
  }, [onSettingsOpen, onFileCreate, onProjectOpen]);

  return (
    <div className={`app-shell ${theme}`}>
      {/* Title Bar */}
      <div className="title-bar">
        {/* Traffic lights for macOS */}
        <div className="traffic-lights">
          <button className="traffic-light close" onClick={handleClose}>×</button>
          <button className="traffic-light minimize" onClick={handleMinimize}>−</button>
          <button className="traffic-light maximize" onClick={handleMaximize}>□</button>
        </div>
        
        <div className="title-content">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          
          <h1 className="app-title">CodeForge</h1>
          
          <div className="title-actions">
            <button 
              className="title-button"
              onClick={() => setCommandPaletteOpen(true)}
              title="Search (⌘K)"
            >
              🔍
            </button>
            
            <button 
              className="title-button"
              onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
              title="Notifications"
            >
              🔔 {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
            </button>
            
            <button 
              className="title-button"
              onClick={onThemeToggle}
              title="Toggle Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            
            <button 
              className="title-button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              title="User Menu"
            >
              👤
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="sidebar">
            <nav className="navigation">
              {navigationItems.map((item) => (
                <div key={item.id} className="nav-item">
                  <button 
                    className="nav-button"
                    onClick={item.action}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </button>
                </div>
              ))}
            </nav>
          </div>
        )}

        {/* Content Area */}
        <div className="content-area">
          {/* Tabs */}
          <div className="tab-container">
            <div className="tabs">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
                  onClick={() => setActiveTabId(tab.id)}
                >
                  <span className="tab-title">
                    {tab.title}
                    {tab.isDirty && ' •'}
                  </span>
                  <button
                    className="tab-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content-area">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`tab-pane ${tab.id === activeTabId ? 'active' : ''}`}
              >
                {renderTabContent(tab)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <span className={`status-indicator ${metrics.aiModelStatus}`}>
            AI: {metrics.aiModelStatus}
          </span>
          <span>CPU: {metrics.cpuUsage.toFixed(1)}%</span>
          <span>RAM: {metrics.memoryUsage.toFixed(1)}%</span>
          <span>Latency: {metrics.networkLatency.toFixed(0)}ms</span>
        </div>
        
        <div className="status-right">
          <span>Ready</span>
        </div>
      </div>

      {/* Command Palette */}
      {commandPaletteOpen && (
        <div className="modal-overlay" onClick={() => setCommandPaletteOpen(false)}>
          <div className="command-palette" onClick={(e) => e.stopPropagation()}>
            <div className="command-header">
              <h3>⌘ Command Palette</h3>
              <button onClick={() => setCommandPaletteOpen(false)}>×</button>
            </div>
            <input
              type="text"
              placeholder="Type a command..."
              className="command-input"
              autoFocus
            />
            <div className="command-list">
              {[
                { label: 'Open File', icon: '📄', shortcut: '⌘O' },
                { label: 'New File', icon: '➕', shortcut: '⌘N' },
                { label: 'Settings', icon: '⚙️', shortcut: '⌘,' },
                { label: 'Toggle Sidebar', icon: '☰', shortcut: '⌘B' }
              ].map((command, index) => (
                <div key={index} className="command-item">
                  <span className="command-icon">{command.icon}</span>
                  <span className="command-label">{command.label}</span>
                  <span className="command-shortcut">{command.shortcut}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Menu */}
      {userMenuOpen && (
        <div className="dropdown-menu user-menu">
          <div className="menu-item" onClick={onSettingsOpen}>
            ⚙️ Settings
          </div>
          <div className="menu-item" onClick={onThemeToggle}>
            {theme === 'dark' ? '☀️' : '🌙'} Toggle Theme
          </div>
          <div className="menu-divider"></div>
          <div className="menu-item">
            ℹ️ About CodeForge
          </div>
        </div>
      )}

      {/* Notifications Menu */}
      {notificationMenuOpen && (
        <div className="dropdown-menu notifications-menu">
          {notifications.length === 0 ? (
            <div className="menu-item disabled">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="notification-item">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AppShell; 