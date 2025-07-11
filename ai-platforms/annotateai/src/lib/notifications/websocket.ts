interface NotificationMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  category: 'system' | 'billing' | 'project' | 'collaboration' | 'security';
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

interface WebSocketMessage {
  type: 'notification' | 'ping' | 'pong' | 'auth' | 'error';
  data?: any;
  timestamp: string;
}

type NotificationHandler = (notification: NotificationMessage) => void;
type ErrorHandler = (error: Error) => void;
type ConnectionHandler = (connected: boolean) => void;

class NotificationWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;

  // Event handlers
  private notificationHandlers: NotificationHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];

  constructor(url?: string) {
    this.url = url || this.getWebSocketUrl();
  }

  private getWebSocketUrl(): string {
    if (typeof window === 'undefined') return '';
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/api/notifications/ws`;
  }

  // Public methods
  connect(token: string): void {
    this.token = token;
    this.isIntentionallyClosed = false;
    this.createConnection();
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;
    this.cleanup();
  }

  // Event subscription methods
  onNotification(handler: NotificationHandler): () => void {
    this.notificationHandlers.push(handler);
    return () => {
      const index = this.notificationHandlers.indexOf(handler);
      if (index > -1) {
        this.notificationHandlers.splice(index, 1);
      }
    };
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler);
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  // Connection management
  private createConnection(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      this.handleError(new Error(`Failed to create WebSocket connection: ${error}`));
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connection established');
      this.reconnectAttempts = 0;
      this.authenticate();
      this.startPingInterval();
      this.notifyConnectionChange(true);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        this.handleError(new Error(`Failed to parse WebSocket message: ${error}`));
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      this.cleanup();
      this.notifyConnectionChange(false);
      
      if (!this.isIntentionallyClosed) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.handleError(new Error('WebSocket connection error'));
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'notification':
        if (message.data) {
          this.notifyHandlers(message.data);
        }
        break;

      case 'ping':
        this.send({ type: 'pong', timestamp: new Date().toISOString() });
        break;

      case 'pong':
        // Handle pong response
        break;

      case 'error':
        this.handleError(new Error(message.data?.message || 'Server error'));
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private authenticate(): void {
    if (!this.token) {
      this.handleError(new Error('No authentication token available'));
      return;
    }

    this.send({
      type: 'auth',
      data: { token: this.token },
      timestamp: new Date().toISOString(),
    });
  }

  private send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping', timestamp: new Date().toISOString() });
    }, 30000); // Ping every 30 seconds
  }

  private scheduleReconnect(): void {
    if (this.isIntentionallyClosed || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000
    );

    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.createConnection();
    }, delay);
  }

  private cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private notifyHandlers(notification: NotificationMessage): void {
    this.notificationHandlers.forEach(handler => {
      try {
        handler(notification);
      } catch (error) {
        console.error('Error in notification handler:', error);
      }
    });
  }

  private handleError(error: Error): void {
    console.error('WebSocket error:', error);
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  // Utility methods
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }
}

// Singleton instance
let notificationWebSocket: NotificationWebSocket | null = null;

export function getNotificationWebSocket(): NotificationWebSocket {
  if (!notificationWebSocket) {
    notificationWebSocket = new NotificationWebSocket();
  }
  return notificationWebSocket;
}

// React hook for using notifications
export function useNotificationWebSocket() {
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const ws = getNotificationWebSocket();

    // Set up event handlers
    const unsubscribeConnection = ws.onConnectionChange(setConnected);
    const unsubscribeError = ws.onError(setError);
    const unsubscribeNotification = ws.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 99)]); // Keep last 100
    });

    // Connect if token is available
    const token = localStorage.getItem('token');
    if (token && !ws.isConnected()) {
      ws.connect(token);
    }

    return () => {
      unsubscribeConnection();
      unsubscribeError();
      unsubscribeNotification();
    };
  }, []);

  const connect = (token: string) => {
    const ws = getNotificationWebSocket();
    ws.connect(token);
  };

  const disconnect = () => {
    const ws = getNotificationWebSocket();
    ws.disconnect();
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    connected,
    notifications,
    error,
    connect,
    disconnect,
    clearNotifications,
    clearError,
    connectionState: notificationWebSocket?.getConnectionState() || 'disconnected',
  };
}

// Toast notification system
interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary';
  }>;
}

class ToastManager {
  private toasts: ToastNotification[] = [];
  private listeners: Array<(toasts: ToastNotification[]) => void> = [];

  show(toast: Omit<ToastNotification, 'id'>): string {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastNotification = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };

    this.toasts.push(newToast);
    this.notifyListeners();

    // Auto-dismiss after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, newToast.duration);
    }

    return id;
  }

  dismiss(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  dismissAll(): void {
    this.toasts = [];
    this.notifyListeners();
  }

  subscribe(listener: (toasts: ToastNotification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }
}

// Singleton toast manager
const toastManager = new ToastManager();

export function useToast() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const showToast = (toast: Omit<ToastNotification, 'id'>) => {
    return toastManager.show(toast);
  };

  const dismissToast = (id: string) => {
    toastManager.dismiss(id);
  };

  const dismissAllToasts = () => {
    toastManager.dismissAll();
  };

  return {
    toasts,
    showToast,
    dismissToast,
    dismissAllToasts,
  };
}

// Export types and utilities
export type {
  NotificationMessage,
  WebSocketMessage,
  NotificationHandler,
  ErrorHandler,
  ConnectionHandler,
  ToastNotification,
};

export { NotificationWebSocket, ToastManager };

// React import for hooks
import { useState, useEffect } from 'react'; 