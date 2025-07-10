import { EventEmitter } from 'events';

// Types and Interfaces
interface CollaborationUser {
    id: string;
    name: string;
    avatar?: string;
    color: string;
    role: 'owner' | 'editor' | 'viewer' | 'guest';
    permissions: string[];
    isOnline: boolean;
    lastSeen: Date;
    cursor?: {
        position: { x: number; y: number; z: number };
        target?: string;
        action?: string;
    };
    selection?: string[];
    activeTools?: string[];
}

interface CollaborationSession {
    id: string;
    name: string;
    description?: string;
    owner: string;
    users: Map<string, CollaborationUser>;
    createdAt: Date;
    lastActivity: Date;
    settings: SessionSettings;
    state: SessionState;
}

interface SessionSettings {
    maxUsers: number;
    allowAnonymous: boolean;
    enableVoiceChat: boolean;
    enableVideoChat: boolean;
    enableScreenShare: boolean;
    lockOnEdit: boolean;
    autoSave: boolean;
    conflictResolution: 'last-write-wins' | 'merge' | 'manual';
    permissions: {
        canEdit: string[];
        canView: string[];
        canInvite: string[];
        canManage: string[];
    };
}

interface SessionState {
    version: number;
    checksum: string;
    operations: Operation[];
    locks: Map<string, LockInfo>;
    annotations: Map<string, Annotation>;
    comments: Map<string, Comment>;
}

interface Operation {
    id: string;
    type: 'create' | 'update' | 'delete' | 'move' | 'transform';
    userId: string;
    timestamp: Date;
    target: string;
    data: any;
    metadata?: {
        tool?: string;
        context?: string;
        description?: string;
    };
}

interface LockInfo {
    userId: string;
    objectId: string;
    type: 'edit' | 'view' | 'exclusive';
    timestamp: Date;
    duration?: number;
    reason?: string;
}

interface Annotation {
    id: string;
    userId: string;
    position: { x: number; y: number; z: number };
    type: 'point' | 'line' | 'area' | 'volume';
    content: string;
    tags: string[];
    timestamp: Date;
    replies?: Comment[];
    resolved: boolean;
}

interface Comment {
    id: string;
    userId: string;
    content: string;
    timestamp: Date;
    parentId?: string;
    mentions?: string[];
    attachments?: string[];
}

interface ConflictResolution {
    id: string;
    operations: Operation[];
    strategy: 'merge' | 'override' | 'manual';
    result?: Operation;
    userId?: string;
    timestamp: Date;
}

interface SynchronizationEvent {
    type: 'user-join' | 'user-leave' | 'operation' | 'lock' | 'unlock' | 'conflict' | 'annotation' | 'comment';
    userId: string;
    sessionId: string;
    data: any;
    timestamp: Date;
}

export class CollaborationEngine extends EventEmitter {
    private sessions: Map<string, CollaborationSession> = new Map();
    private activeSession: CollaborationSession | null = null;
    private currentUser: CollaborationUser | null = null;
    private websocket: WebSocket | null = null;
    private operationQueue: Operation[] = [];
    private conflictQueue: ConflictResolution[] = [];

    private heartbeatInterval: NodeJS.Timeout | null = null;
    private syncInterval: NodeJS.Timeout | null = null;
    private cleanupInterval: NodeJS.Timeout | null = null;

    private isConnected: boolean = false;
    private isAuthenticated: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    constructor() {
        super();
        this.initializeCollaboration();
        this.setupEventHandlers();
    }

    private initializeCollaboration(): void {
        console.log('Initializing G3D Collaboration Engine');

        // Setup intervals
        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, 30000);

        this.syncInterval = setInterval(() => {
            this.synchronizeState();
        }, 5000);

        this.cleanupInterval = setInterval(() => {
            this.cleanupInactiveUsers();
        }, 60000);
    }

    private setupEventHandlers(): void {
        this.on('userJoined', this.handleUserJoined.bind(this));
        this.on('userLeft', this.handleUserLeft.bind(this));
        this.on('operationReceived', this.handleOperationReceived.bind(this));
        this.on('conflictDetected', this.handleConflictDetected.bind(this));
        this.on('annotationAdded', this.handleAnnotationAdded.bind(this));
        this.on('commentAdded', this.handleCommentAdded.bind(this));
    }

    // Session Management
    public async createSession(name: string, settings?: Partial<SessionSettings>): Promise<string> {
        const sessionId = this.generateSessionId();

        const defaultSettings: SessionSettings = {
            maxUsers: 50,
            allowAnonymous: false,
            enableVoiceChat: true,
            enableVideoChat: true,
            enableScreenShare: true,
            lockOnEdit: true,
            autoSave: true,
            conflictResolution: 'merge',
            permissions: {
                canEdit: ['owner', 'editor'],
                canView: ['owner', 'editor', 'viewer'],
                canInvite: ['owner', 'editor'],
                canManage: ['owner']
            }
        };

        const session: CollaborationSession = {
            id: sessionId,
            name,
            description: '',
            owner: this.currentUser?.id || 'unknown',
            users: new Map(),
            createdAt: new Date(),
            lastActivity: new Date(),
            settings: { ...defaultSettings, ...settings },
            state: {
                version: 0,
                checksum: '',
                operations: [],
                locks: new Map(),
                annotations: new Map(),
                comments: new Map()
            }
        };

        this.sessions.set(sessionId, session);
        this.emit('sessionCreated', session);

        console.log(`Session created: ${sessionId} - ${name}`);
        return sessionId;
    }

    public async joinSession(sessionId: string, user?: Partial<CollaborationUser>): Promise<boolean> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        if (session.users.size >= session.settings.maxUsers) {
            throw new Error('Session is full');
        }

        const collaborationUser: CollaborationUser = {
            id: user?.id || this.generateUserId(),
            name: user?.name || 'Anonymous User',
            avatar: user?.avatar,
            color: user?.color || this.generateUserColor(),
            role: user?.role || 'viewer',
            permissions: this.getUserPermissions(user?.role || 'viewer', session),
            isOnline: true,
            lastSeen: new Date(),
            cursor: undefined,
            selection: [],
            activeTools: []
        };

        session.users.set(collaborationUser.id, collaborationUser);
        this.currentUser = collaborationUser;
        this.activeSession = session;

        // Connect to collaboration server
        await this.connectToSession(sessionId);

        this.emit('userJoined', { user: collaborationUser, session });
        console.log(`User joined session: ${collaborationUser.name} -> ${sessionId}`);

        return true;
    }

    public async leaveSession(): Promise<void> {
        if (!this.activeSession || !this.currentUser) return;

        const session = this.activeSession;
        const user = this.currentUser;

        // Release all locks
        await this.releaseAllLocks();

        // Remove user from session
        session.users.delete(user.id);

        // Disconnect from server
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }

        this.emit('userLeft', { user, session });
        console.log(`User left session: ${user.name} -> ${session.id}`);

        this.activeSession = null;
        this.currentUser = null;
        this.isConnected = false;
    }

    // Real-time Operations
    public async executeOperation(operation: Partial<Operation>): Promise<string> {
        if (!this.activeSession || !this.currentUser) {
            throw new Error('No active session');
        }

        const fullOperation: Operation = {
            id: this.generateOperationId(),
            type: operation.type || 'update',
            userId: this.currentUser.id,
            timestamp: new Date(),
            target: operation.target || '',
            data: operation.data || {},
            metadata: operation.metadata
        };

        // Add to operation queue
        this.operationQueue.push(fullOperation);
        this.activeSession.state.operations.push(fullOperation);
        this.activeSession.state.version++;

        // Send to other users
        await this.broadcastOperation(fullOperation);

        this.emit('operationExecuted', fullOperation);
        console.log(`Operation executed: ${fullOperation.type} on ${fullOperation.target}`);

        return fullOperation.id;
    }

    public async undoOperation(operationId: string): Promise<boolean> {
        if (!this.activeSession || !this.currentUser) return false;

        const operation = this.activeSession.state.operations.find(op => op.id === operationId);
        if (!operation || operation.userId !== this.currentUser.id) return false;

        // Create undo operation
        const undoOperation: Operation = {
            id: this.generateOperationId(),
            type: 'update',
            userId: this.currentUser.id,
            timestamp: new Date(),
            target: operation.target,
            data: { undo: operationId },
            metadata: { description: `Undo ${operation.type}` }
        };

        await this.executeOperation(undoOperation);
        return true;
    }

    // Object Locking
    public async lockObject(objectId: string, type: 'edit' | 'view' | 'exclusive' = 'edit'): Promise<boolean> {
        if (!this.activeSession || !this.currentUser) return false;

        const existingLock = this.activeSession.state.locks.get(objectId);
        if (existingLock && existingLock.userId !== this.currentUser.id) {
            return false; // Object already locked by another user
        }

        const lockInfo: LockInfo = {
            userId: this.currentUser.id,
            objectId,
            type,
            timestamp: new Date(),
            duration: type === 'exclusive' ? 300000 : 60000 // 5 min for exclusive, 1 min for others
        };

        this.activeSession.state.locks.set(objectId, lockInfo);
        await this.broadcastLock(lockInfo);

        this.emit('objectLocked', lockInfo);
        console.log(`Object locked: ${objectId} by ${this.currentUser.name}`);

        return true;
    }

    public async unlockObject(objectId: string): Promise<boolean> {
        if (!this.activeSession || !this.currentUser) return false;

        const lockInfo = this.activeSession.state.locks.get(objectId);
        if (!lockInfo || lockInfo.userId !== this.currentUser.id) return false;

        this.activeSession.state.locks.delete(objectId);
        await this.broadcastUnlock(objectId);

        this.emit('objectUnlocked', { objectId, userId: this.currentUser.id });
        console.log(`Object unlocked: ${objectId} by ${this.currentUser.name}`);

        return true;
    }

    private async releaseAllLocks(): Promise<void> {
        if (!this.activeSession || !this.currentUser) return;

        const userLocks = Array.from(this.activeSession.state.locks.entries())
            .filter(([_, lock]) => lock.userId === this.currentUser.id);

        for (const [objectId, _] of userLocks) {
            await this.unlockObject(objectId);
        }
    }

    // Annotations and Comments
    public async addAnnotation(annotation: Partial<Annotation>): Promise<string> {
        if (!this.activeSession || !this.currentUser) {
            throw new Error('No active session');
        }

        const fullAnnotation: Annotation = {
            id: this.generateAnnotationId(),
            userId: this.currentUser.id,
            position: annotation.position || { x: 0, y: 0, z: 0 },
            type: annotation.type || 'point',
            content: annotation.content || '',
            tags: annotation.tags || [],
            timestamp: new Date(),
            replies: [],
            resolved: false
        };

        this.activeSession.state.annotations.set(fullAnnotation.id, fullAnnotation);
        await this.broadcastAnnotation(fullAnnotation);

        this.emit('annotationAdded', fullAnnotation);
        console.log(`Annotation added: ${fullAnnotation.id} by ${this.currentUser.name}`);

        return fullAnnotation.id;
    }

    public async addComment(content: string, parentId?: string): Promise<string> {
        if (!this.activeSession || !this.currentUser) {
            throw new Error('No active session');
        }

        const comment: Comment = {
            id: this.generateCommentId(),
            userId: this.currentUser.id,
            content,
            timestamp: new Date(),
            parentId,
            mentions: this.extractMentions(content),
            attachments: []
        };

        this.activeSession.state.comments.set(comment.id, comment);
        await this.broadcastComment(comment);

        this.emit('commentAdded', comment);
        console.log(`Comment added: ${comment.id} by ${this.currentUser.name}`);

        return comment.id;
    }

    // Conflict Resolution
    private async handleConflictDetected(conflict: ConflictResolution): Promise<void> {
        if (!this.activeSession) return;

        console.log(`Conflict detected: ${conflict.id}`);
        this.conflictQueue.push(conflict);

        switch (this.activeSession.settings.conflictResolution) {
            case 'last-write-wins':
                await this.resolveConflictLastWriteWins(conflict);
                break;
            case 'merge':
                await this.resolveConflictMerge(conflict);
                break;
            case 'manual':
                this.emit('conflictRequiresResolution', conflict);
                break;
        }
    }

    private async resolveConflictLastWriteWins(conflict: ConflictResolution): Promise<void> {
        // Take the most recent operation
        const latestOperation = conflict.operations.reduce((latest, current) =>
            current.timestamp > latest.timestamp ? current : latest
        );

        conflict.result = latestOperation;
        conflict.strategy = 'override';
        conflict.timestamp = new Date();

        await this.applyConflictResolution(conflict);
    }

    private async resolveConflictMerge(conflict: ConflictResolution): Promise<void> {
        // Attempt to merge operations intelligently
        const mergedData = this.mergeOperationData(conflict.operations);

        const mergedOperation: Operation = {
            id: this.generateOperationId(),
            type: 'update',
            userId: 'system',
            timestamp: new Date(),
            target: conflict.operations[0].target,
            data: mergedData,
            metadata: { description: 'Merged conflict resolution' }
        };

        conflict.result = mergedOperation;
        conflict.strategy = 'merge';
        conflict.timestamp = new Date();

        await this.applyConflictResolution(conflict);
    }

    private mergeOperationData(operations: Operation[]): any {
        // Simple merge strategy - can be enhanced based on data types
        const merged: any = {};

        for (const operation of operations) {
            if (typeof operation.data === 'object' && operation.data !== null) {
                Object.assign(merged, operation.data);
            }
        }

        return merged;
    }

    private async applyConflictResolution(conflict: ConflictResolution): Promise<void> {
        if (!conflict.result) return;

        await this.executeOperation(conflict.result);
        this.emit('conflictResolved', conflict);
        console.log(`Conflict resolved: ${conflict.id} using ${conflict.strategy}`);
    }

    // Network Communication
    private async connectToSession(sessionId: string): Promise<void> {
        const wsUrl = `ws://localhost:8080/collaboration/${sessionId}`;

        try {
            this.websocket = new WebSocket(wsUrl);

            this.websocket.onopen = () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                console.log(`Connected to collaboration server: ${sessionId}`);
                this.emit('connected', sessionId);
            };

            this.websocket.onmessage = (event) => {
                this.handleServerMessage(JSON.parse(event.data));
            };

            this.websocket.onclose = () => {
                this.isConnected = false;
                console.log('Disconnected from collaboration server');
                this.emit('disconnected');
                this.attemptReconnect(sessionId);
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.emit('connectionError', error);
            };

        } catch (error) {
            console.error('Failed to connect to collaboration server:', error);
            throw error;
        }
    }

    private async attemptReconnect(sessionId: string): Promise<void> {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.emit('reconnectionFailed');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

        setTimeout(() => {
            console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            this.connectToSession(sessionId);
        }, delay);
    }

    private handleServerMessage(message: SynchronizationEvent): void {
        switch (message.type) {
            case 'user-join':
                this.emit('userJoined', message.data);
                break;
            case 'user-leave':
                this.emit('userLeft', message.data);
                break;
            case 'operation':
                this.emit('operationReceived', message.data);
                break;
            case 'conflict':
                this.emit('conflictDetected', message.data);
                break;
            case 'annotation':
                this.emit('annotationAdded', message.data);
                break;
            case 'comment':
                this.emit('commentAdded', message.data);
                break;
        }
    }

    private async broadcastOperation(operation: Operation): Promise<void> {
        if (!this.websocket || !this.isConnected) return;

        const message: SynchronizationEvent = {
            type: 'operation',
            userId: operation.userId,
            sessionId: this.activeSession?.id || '',
            data: operation,
            timestamp: new Date()
        };

        this.websocket.send(JSON.stringify(message));
    }

    private async broadcastLock(lockInfo: LockInfo): Promise<void> {
        if (!this.websocket || !this.isConnected) return;

        const message: SynchronizationEvent = {
            type: 'lock',
            userId: lockInfo.userId,
            sessionId: this.activeSession?.id || '',
            data: lockInfo,
            timestamp: new Date()
        };

        this.websocket.send(JSON.stringify(message));
    }

    private async broadcastUnlock(objectId: string): Promise<void> {
        if (!this.websocket || !this.isConnected || !this.currentUser) return;

        const message: SynchronizationEvent = {
            type: 'unlock',
            userId: this.currentUser.id,
            sessionId: this.activeSession?.id || '',
            data: { objectId },
            timestamp: new Date()
        };

        this.websocket.send(JSON.stringify(message));
    }

    private async broadcastAnnotation(annotation: Annotation): Promise<void> {
        if (!this.websocket || !this.isConnected) return;

        const message: SynchronizationEvent = {
            type: 'annotation',
            userId: annotation.userId,
            sessionId: this.activeSession?.id || '',
            data: annotation,
            timestamp: new Date()
        };

        this.websocket.send(JSON.stringify(message));
    }

    private async broadcastComment(comment: Comment): Promise<void> {
        if (!this.websocket || !this.isConnected) return;

        const message: SynchronizationEvent = {
            type: 'comment',
            userId: comment.userId,
            sessionId: this.activeSession?.id || '',
            data: comment,
            timestamp: new Date()
        };

        this.websocket.send(JSON.stringify(message));
    }

    // Utility Methods
    private sendHeartbeat(): void {
        if (!this.websocket || !this.isConnected || !this.currentUser) return;

        const heartbeat = {
            type: 'heartbeat',
            userId: this.currentUser.id,
            timestamp: new Date()
        };

        this.websocket.send(JSON.stringify(heartbeat));
    }

    private synchronizeState(): void {
        if (!this.activeSession) return;

        // Process operation queue
        if (this.operationQueue.length > 0) {
            this.processOperationQueue();
        }

        // Update session activity
        this.activeSession.lastActivity = new Date();
    }

    private processOperationQueue(): void {
        // Process pending operations in order
        while (this.operationQueue.length > 0) {
            const operation = this.operationQueue.shift();
            if (operation) {
                this.applyOperation(operation);
            }
        }
    }

    private applyOperation(operation: Operation): void {
        // Apply operation to local state
        console.log(`Applying operation: ${operation.type} on ${operation.target}`);
        this.emit('operationApplied', operation);
    }

    private cleanupInactiveUsers(): void {
        if (!this.activeSession) return;

        const now = new Date();
        const timeoutMs = 5 * 60 * 1000; // 5 minutes

        for (const [userId, user] of this.activeSession.users) {
            if (now.getTime() - user.lastSeen.getTime() > timeoutMs) {
                user.isOnline = false;
                console.log(`User marked as offline: ${user.name}`);
            }
        }
    }

    private getUserPermissions(role: string, session: CollaborationSession): string[] {
        const permissions: string[] = [];

        if (session.settings.permissions.canView.includes(role)) {
            permissions.push('view');
        }
        if (session.settings.permissions.canEdit.includes(role)) {
            permissions.push('edit');
        }
        if (session.settings.permissions.canInvite.includes(role)) {
            permissions.push('invite');
        }
        if (session.settings.permissions.canManage.includes(role)) {
            permissions.push('manage');
        }

        return permissions;
    }

    private extractMentions(content: string): string[] {
        const mentionRegex = /@(\w+)/g;
        const mentions: string[] = [];
        let match;

        while ((match = mentionRegex.exec(content)) !== null) {
            mentions.push(match[1]);
        }

        return mentions;
    }

    // Event Handlers
    private handleUserJoined(data: { user: CollaborationUser; session: CollaborationSession }): void {
        console.log(`User joined: ${data.user.name}`);
    }

    private handleUserLeft(data: { user: CollaborationUser; session: CollaborationSession }): void {
        console.log(`User left: ${data.user.name}`);
    }

    private handleOperationReceived(operation: Operation): void {
        if (operation.userId !== this.currentUser?.id) {
            this.operationQueue.push(operation);
        }
    }

    private handleAnnotationAdded(annotation: Annotation): void {
        console.log(`Annotation added: ${annotation.content}`);
    }

    private handleCommentAdded(comment: Comment): void {
        console.log(`Comment added: ${comment.content}`);
    }

    // ID Generators
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateUserId(): string {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateOperationId(): string {
        return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateAnnotationId(): string {
        return `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateCommentId(): string {
        return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateUserColor(): string {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Public API
    public getActiveSession(): CollaborationSession | null {
        return this.activeSession;
    }

    public getCurrentUser(): CollaborationUser | null {
        return this.currentUser;
    }

    public getSessionUsers(): CollaborationUser[] {
        return this.activeSession ? Array.from(this.activeSession.users.values()) : [];
    }

    public getAnnotations(): Annotation[] {
        return this.activeSession ? Array.from(this.activeSession.state.annotations.values()) : [];
    }

    public getComments(): Comment[] {
        return this.activeSession ? Array.from(this.activeSession.state.comments.values()) : [];
    }

    public isObjectLocked(objectId: string): boolean {
        return this.activeSession?.state.locks.has(objectId) || false;
    }

    public getObjectLock(objectId: string): LockInfo | undefined {
        return this.activeSession?.state.locks.get(objectId);
    }

    public dispose(): void {
        // Clean up intervals
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }

        // Close WebSocket connection
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }

        // Clear all data
        this.sessions.clear();
        this.operationQueue = [];
        this.conflictQueue = [];
        this.activeSession = null;
        this.currentUser = null;

        console.log('G3D Collaboration Engine disposed');
    }
}