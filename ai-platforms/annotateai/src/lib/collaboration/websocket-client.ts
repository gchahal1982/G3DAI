export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'annotator' | 'reviewer' | 'admin';
  color: string;
  cursor?: {
    x: number;
    y: number;
    visible: boolean;
  };
  selection?: {
    annotationId: string;
    type: 'bbox' | 'polygon' | 'keypoints' | 'point' | 'line';
  };
  status: 'active' | 'idle' | 'away' | 'offline';
  lastActivity: string;
  permissions: string[];
}

export interface CollaborationMessage {
  id: string;
  type: 'user_join' | 'user_leave' | 'cursor_move' | 'annotation_start' | 'annotation_update' | 'annotation_complete' | 'annotation_delete' | 'selection_change' | 'comment_add' | 'conflict_detected' | 'presence_update' | 'typing_start' | 'typing_stop';
  payload: any;
  userId: string;
  timestamp: string;
  projectId: string;
  imageId?: string;
}

export interface AnnotationChange {
  id: string;
  action: 'create' | 'update' | 'delete' | 'move' | 'resize';
  annotation: any;
  previousState?: any;
  userId: string;
  timestamp: string;
  conflictsWith?: string[];
}

export interface ConflictResolution {
  conflictId: string;
  type: 'merge' | 'overwrite' | 'keep_both' | 'manual';
  winner?: string;
  resolution: any;
  resolvedBy: string;
  resolvedAt: string;
}

export class WebSocketCollaborationClient {
  private ws: WebSocket | null = null;
  private url: string;
  private projectId: string;
  private userId: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: CollaborationMessage[] = [];
  private isConnected: boolean = false;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private presenceData: Map<string, CollaborationUser> = new Map();
  private pendingChanges: Map<string, AnnotationChange> = new Map();
  private conflictResolver: ConflictResolver;

  constructor(url: string, projectId: string, userId: string) {
    this.url = url;
    this.projectId = projectId;
    this.userId = userId;
    this.conflictResolver = new ConflictResolver(this);
  }

  public async connect(): Promise<void> {
    try {
      this.ws = new WebSocket(`${this.url}?projectId=${this.projectId}&userId=${this.userId}`);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.once('connected', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      throw error;
    }
  }

  public disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.isConnected = false;
    this.emit('disconnected');
  }

  private handleOpen(): void {
    console.log('WebSocket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Send queued messages
    this.flushMessageQueue();
    
    // Join project room
    this.sendMessage({
      type: 'user_join',
      payload: {
        user: this.getCurrentUser()
      }
    });

    this.emit('connected');
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: CollaborationMessage = JSON.parse(event.data);
      this.processMessage(message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket closed:', event.code, event.reason);
    this.isConnected = false;
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Attempt reconnection if not a clean close
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnect();
    }

    this.emit('disconnected', { code: event.code, reason: event.reason });
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    this.emit('error', error);
  }

  private async attemptReconnect(): Promise<void> {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(async () => {
      try {
        await this.connect();
        console.log('Reconnected successfully');
      } catch (error) {
        console.error('Reconnection failed:', error);
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.emit('reconnect_failed');
        }
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30 seconds
  }

  private processMessage(message: CollaborationMessage): void {
    switch (message.type) {
      case 'user_join':
        this.handleUserJoin(message);
        break;
      case 'user_leave':
        this.handleUserLeave(message);
        break;
      case 'cursor_move':
        this.handleCursorMove(message);
        break;
      case 'annotation_start':
        this.handleAnnotationStart(message);
        break;
      case 'annotation_update':
        this.handleAnnotationUpdate(message);
        break;
      case 'annotation_complete':
        this.handleAnnotationComplete(message);
        break;
      case 'annotation_delete':
        this.handleAnnotationDelete(message);
        break;
      case 'selection_change':
        this.handleSelectionChange(message);
        break;
      case 'comment_add':
        this.handleCommentAdd(message);
        break;
      case 'conflict_detected':
        this.handleConflictDetected(message);
        break;
      case 'presence_update':
        this.handlePresenceUpdate(message);
        break;
      case 'typing_start':
      case 'typing_stop':
        this.handleTypingChange(message);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }

    this.emit(message.type, message);
  }

  private handleUserJoin(message: CollaborationMessage): void {
    const user: CollaborationUser = message.payload.user;
    this.presenceData.set(user.id, user);
    this.emit('user_joined', user);
  }

  private handleUserLeave(message: CollaborationMessage): void {
    const userId = message.payload.userId;
    this.presenceData.delete(userId);
    this.emit('user_left', userId);
  }

  private handleCursorMove(message: CollaborationMessage): void {
    const user = this.presenceData.get(message.userId);
    if (user) {
      user.cursor = message.payload.cursor;
      user.lastActivity = message.timestamp;
      this.presenceData.set(message.userId, user);
      this.emit('cursor_moved', { userId: message.userId, cursor: message.payload.cursor });
    }
  }

  private handleAnnotationStart(message: CollaborationMessage): void {
    const { annotationId, type, position } = message.payload;
    
    // Check for conflicts
    const conflict = this.conflictResolver.detectConflict(message);
    if (conflict) {
      this.emit('conflict_detected', conflict);
      return;
    }

    this.emit('annotation_started', {
      userId: message.userId,
      annotationId,
      type,
      position
    });
  }

  private handleAnnotationUpdate(message: CollaborationMessage): void {
    const change: AnnotationChange = message.payload;
    
    // Store pending change for conflict detection
    this.pendingChanges.set(change.id, change);
    
    // Check for conflicts with other pending changes
    const conflicts = this.conflictResolver.checkForConflicts(change);
    if (conflicts.length > 0) {
      this.emit('conflict_detected', { change, conflicts });
      return;
    }

    this.emit('annotation_updated', change);
  }

  private handleAnnotationComplete(message: CollaborationMessage): void {
    const { annotationId, annotation } = message.payload;
    
    // Remove from pending changes
    this.pendingChanges.delete(annotationId);
    
    this.emit('annotation_completed', {
      userId: message.userId,
      annotationId,
      annotation
    });
  }

  private handleAnnotationDelete(message: CollaborationMessage): void {
    const { annotationId } = message.payload;
    
    // Remove from pending changes
    this.pendingChanges.delete(annotationId);
    
    this.emit('annotation_deleted', {
      userId: message.userId,
      annotationId
    });
  }

  private handleSelectionChange(message: CollaborationMessage): void {
    const user = this.presenceData.get(message.userId);
    if (user) {
      user.selection = message.payload.selection;
      user.lastActivity = message.timestamp;
      this.presenceData.set(message.userId, user);
      this.emit('selection_changed', { userId: message.userId, selection: message.payload.selection });
    }
  }

  private handleCommentAdd(message: CollaborationMessage): void {
    this.emit('comment_added', message.payload);
  }

  private handleConflictDetected(message: CollaborationMessage): void {
    this.emit('conflict_detected', message.payload);
  }

  private handlePresenceUpdate(message: CollaborationMessage): void {
    const { userId, status } = message.payload;
    const user = this.presenceData.get(userId);
    if (user) {
      user.status = status;
      user.lastActivity = message.timestamp;
      this.presenceData.set(userId, user);
      this.emit('presence_updated', { userId, status });
    }
  }

  private handleTypingChange(message: CollaborationMessage): void {
    this.emit('typing_changed', {
      userId: message.userId,
      isTyping: message.type === 'typing_start',
      context: message.payload.context
    });
  }

  // Public API methods
  public sendCursorMove(x: number, y: number): void {
    this.sendMessage({
      type: 'cursor_move',
      payload: {
        cursor: { x, y, visible: true }
      }
    });
  }

  public startAnnotation(annotationId: string, type: string, position: any): void {
    this.sendMessage({
      type: 'annotation_start',
      payload: {
        annotationId,
        type,
        position
      }
    });
  }

  public updateAnnotation(change: AnnotationChange): void {
    this.sendMessage({
      type: 'annotation_update',
      payload: change
    });
  }

  public completeAnnotation(annotationId: string, annotation: any): void {
    this.sendMessage({
      type: 'annotation_complete',
      payload: {
        annotationId,
        annotation
      }
    });
  }

  public deleteAnnotation(annotationId: string): void {
    this.sendMessage({
      type: 'annotation_delete',
      payload: {
        annotationId
      }
    });
  }

  public changeSelection(annotationId: string, type: string): void {
    this.sendMessage({
      type: 'selection_change',
      payload: {
        selection: { annotationId, type }
      }
    });
  }

  public addComment(comment: any): void {
    this.sendMessage({
      type: 'comment_add',
      payload: comment
    });
  }

  public updatePresence(status: 'active' | 'idle' | 'away'): void {
    this.sendMessage({
      type: 'presence_update',
      payload: { status }
    });
  }

  public startTyping(context: string): void {
    this.sendMessage({
      type: 'typing_start',
      payload: { context }
    });
  }

  public stopTyping(context: string): void {
    this.sendMessage({
      type: 'typing_stop',
      payload: { context }
    });
  }

  private sendMessage(partial: Partial<CollaborationMessage>): void {
    const message: CollaborationMessage = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId: this.userId,
      projectId: this.projectId,
      ...partial
    } as CollaborationMessage;

    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      if (message && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  private getCurrentUser(): CollaborationUser {
    // This would typically come from auth context
    return {
      id: this.userId,
      name: 'Current User', // Get from auth context
      email: 'user@example.com', // Get from auth context
      role: 'annotator', // Get from auth context
      color: this.generateUserColor(),
      status: 'active',
      lastActivity: new Date().toISOString(),
      permissions: ['annotate', 'comment'] // Get from auth context
    };
  }

  private generateUserColor(): string {
    const colors = [
      '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
      '#ef4444', '#ec4899', '#84cc16', '#f97316', '#3b82f6'
    ];
    const hash = this.userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Event system
  public on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  public once(event: string, callback: (data: any) => void): void {
    const onceCallback = (data: any) => {
      callback(data);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Getters
  public getConnectedUsers(): CollaborationUser[] {
    return Array.from(this.presenceData.values());
  }

  public getUser(userId: string): CollaborationUser | undefined {
    return this.presenceData.get(userId);
  }

  public isUserOnline(userId: string): boolean {
    const user = this.presenceData.get(userId);
    return user ? user.status !== 'offline' : false;
  }

  public getPendingChanges(): AnnotationChange[] {
    return Array.from(this.pendingChanges.values());
  }
}

class ConflictResolver {
  private client: WebSocketCollaborationClient;

  constructor(client: WebSocketCollaborationClient) {
    this.client = client;
  }

  public detectConflict(message: CollaborationMessage): any | null {
    // Simple conflict detection logic
    // In practice, this would be more sophisticated
    return null;
  }

  public checkForConflicts(change: AnnotationChange): AnnotationChange[] {
    const conflicts: AnnotationChange[] = [];
    const pendingChanges = this.client.getPendingChanges();

    pendingChanges.forEach(pendingChange => {
      if (pendingChange.id === change.id && pendingChange.userId !== change.userId) {
        // Same annotation being modified by different users
        conflicts.push(pendingChange);
      }
    });

    return conflicts;
  }

  public resolveConflict(conflict: any, resolution: ConflictResolution): void {
    // Implement conflict resolution logic
    console.log('Resolving conflict:', conflict, 'with resolution:', resolution);
  }
}

// Factory function for creating client instances
export function createCollaborationClient(projectId: string, userId: string): WebSocketCollaborationClient {
  const wsUrl = process.env.NODE_ENV === 'production' 
    ? 'wss://api.annotateai.com/ws'
    : 'ws://localhost:3001/ws';
    
  return new WebSocketCollaborationClient(wsUrl, projectId, userId);
} 