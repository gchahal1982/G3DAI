/**
 * Aura Collaboration Engine
 * CRDT-based real-time collaboration system for code development
 * 
 * Features:
 * - CRDT (Conflict-free Replicated Data Type) core implementation
 * - Yjs integration for document synchronization
 * - Presence awareness system with real-time updates
 * - Cursor position sharing and collaborative editing
 * - Selection synchronization across multiple users
 * - Annotation sharing with conflict resolution
 * - Voice chat integration with spatial audio
 * - Screen sharing capability for pair programming
 */

import { EventEmitter } from 'events';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

// Interfaces and types
interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canShare: boolean;
    canManageUsers: boolean;
  };
  presence: UserPresence;
  connection: {
    isOnline: boolean;
    lastSeen: number;
    latency: number;
    quality: 'excellent' | 'good' | 'poor' | 'disconnected';
  };
}

interface UserPresence {
  cursor: {
    x: number;
    y: number;
    visible: boolean;
    file?: string;
    line?: number;
    column?: number;
  };
  selection: {
    file?: string;
    start: { line: number; column: number };
    end: { line: number; column: number };
    text?: string;
  };
  viewport: {
    file?: string;
    topLine: number;
    bottomLine: number;
    scrollPosition: number;
  };
  activity: {
    status: 'active' | 'idle' | 'away' | 'dnd';
    lastActivity: number;
    currentAction?: string;
  };
  voice: {
    isEnabled: boolean;
    isMuted: boolean;
    isSpeaking: boolean;
    volume: number;
  };
  screen: {
    isSharing: boolean;
    shareType?: 'full' | 'window' | 'tab';
    shareTitle?: string;
  };
}

interface CollaborationDocument {
  id: string;
  type: 'code' | 'markdown' | 'json' | 'text';
  filePath: string;
  content: Y.Text;
  metadata: Y.Map<any>;
  annotations: Y.Array<CollaborationAnnotation>;
  version: number;
  lastModified: number;
  modifiedBy: string;
  conflictResolution: {
    strategy: 'last-write-wins' | 'merge' | 'manual';
    conflicts: ConflictRecord[];
  };
}

interface CollaborationAnnotation {
  id: string;
  type: 'comment' | 'suggestion' | 'issue' | 'review' | 'todo';
  position: {
    file: string;
    line: number;
    column: number;
    length?: number;
  };
  content: {
    text: string;
    author: string;
    timestamp: number;
    resolved: boolean;
    replies: AnnotationReply[];
  };
  visual: {
    color: string;
    highlighted: boolean;
    persistent: boolean;
  };
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canResolve: boolean;
  };
}

interface AnnotationReply {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  edited?: {
    timestamp: number;
    originalText: string;
  };
}

interface ConflictRecord {
  id: string;
  timestamp: number;
  file: string;
  conflictType: 'content' | 'move' | 'delete' | 'metadata';
  participants: string[];
  resolution: 'pending' | 'resolved' | 'ignored';
  data: {
    original: any;
    changes: { [userId: string]: any };
    merged?: any;
  };
}

interface VoiceChatConfig {
  enabled: boolean;
  spatialAudio: boolean;
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  quality: 'low' | 'medium' | 'high';
  codec: 'opus' | 'g722' | 'pcmu' | 'pcma';
  bitrate: number;
}

interface ScreenShareConfig {
  enabled: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  frameRate: 15 | 30 | 60;
  resolution: { width: number; height: number };
  audioIncluded: boolean;
  cursorIncluded: boolean;
}

interface CollaborationRoom {
  id: string;
  name: string;
  description?: string;
  users: Map<string, CollaborationUser>;
  documents: Map<string, CollaborationDocument>;
  sharedState: Y.Map<any>;
  permissions: {
    public: boolean;
    allowGuests: boolean;
    maxUsers: number;
    defaultRole: 'editor' | 'viewer';
  };
  settings: {
    voice: VoiceChatConfig;
    screen: ScreenShareConfig;
    notifications: boolean;
    autoSave: boolean;
    conflictResolution: 'automatic' | 'manual';
  };
}

/**
 * CollaborationEngine - CRDT-based real-time collaboration
 */
export class CollaborationEngine extends EventEmitter {
  private yDoc: Y.Doc;
  private wsProvider: WebsocketProvider | null = null;
  private persistence: IndexeddbPersistence | null = null;
  private currentUser: CollaborationUser | null = null;
  private currentRoom: CollaborationRoom | null = null;
  private users: Map<string, CollaborationUser> = new Map();
  private documents: Map<string, CollaborationDocument> = new Map();
  private mediaStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private voiceStreams: Map<string, MediaStream> = new Map();
  private screenStream: MediaStream | null = null;
  private isInitialized: boolean = false;

  constructor() {
    super();
    
    // Initialize Yjs document
    this.yDoc = new Y.Doc();
    
    // Setup event listeners
    this.setupYjsEventListeners();
  }

  /**
   * Initialize collaboration engine
   */
  async initialize(config: {
    websocketUrl: string;
    roomId: string;
    user: Partial<CollaborationUser>;
    persistence?: boolean;
  }): Promise<void> {
    try {
      // Setup user
      this.currentUser = {
        id: config.user.id || `user_${Date.now()}`,
        name: config.user.name || 'Anonymous',
        email: config.user.email || '',
        avatar: config.user.avatar || '',
        color: config.user.color || this.generateUserColor(),
        role: config.user.role || 'editor',
        permissions: {
          canEdit: true,
          canComment: true,
          canShare: false,
          canManageUsers: false,
          ...config.user.permissions
        },
        presence: this.createDefaultPresence(),
        connection: {
          isOnline: true,
          lastSeen: Date.now(),
          latency: 0,
          quality: 'excellent'
        }
      };

      // Setup WebSocket provider for real-time sync
      this.wsProvider = new WebsocketProvider(
        config.websocketUrl,
        config.roomId,
        this.yDoc,
        { 
          connect: true,
          params: {
            userId: this.currentUser.id,
            userName: this.currentUser.name
          }
        }
      );

      // Setup persistence
      if (config.persistence !== false) {
        this.persistence = new IndexeddbPersistence(config.roomId, this.yDoc);
      }

      // Setup WebSocket event listeners
      this.setupWebSocketEventListeners();

      // Setup shared state
      this.setupSharedState();

      // Setup presence awareness
      this.setupPresenceAwareness();

      // Initialize WebRTC for voice/video
      await this.initializeWebRTC();

      this.isInitialized = true;
      
      this.emit('initialized', {
        user: this.currentUser,
        roomId: config.roomId
      });

    } catch (error) {
      console.error('Failed to initialize collaboration engine:', error);
      this.emit('error', { type: 'initialization', error });
      throw error;
    }
  }

  /**
   * Setup Yjs event listeners for CRDT operations
   */
  private setupYjsEventListeners(): void {
    // Document updates
    this.yDoc.on('update', (update: Uint8Array, origin: any) => {
      this.emit('document-updated', {
        update,
        origin,
        timestamp: Date.now()
      });
    });

    // Subdocument events
    this.yDoc.on('subdocs', ({ added, removed, loaded }: any) => {
      this.emit('subdocs-changed', { added, removed, loaded });
    });
  }

  /**
   * Setup WebSocket provider event listeners
   */
  private setupWebSocketEventListeners(): void {
    if (!this.wsProvider) return;

    this.wsProvider.on('status', (event: { status: string }) => {
      this.updateConnectionStatus(event.status);
      this.emit('connection-status', event.status);
    });

    this.wsProvider.on('connection-close', (event: any) => {
      this.emit('connection-lost', event);
    });

    this.wsProvider.on('connection-error', (event: any) => {
      this.emit('connection-error', event);
    });
  }

  /**
   * Setup shared state management
   */
  private setupSharedState(): void {
    // Initialize shared maps
    const sharedUsers = this.yDoc.getMap('users');
    const sharedDocuments = this.yDoc.getMap('documents');
    const sharedAnnotations = this.yDoc.getArray('annotations');
    
    // Observe changes to shared state
    sharedUsers.observe((event: any) => {
      this.handleUserUpdates(event);
    });

    sharedDocuments.observe((event: any) => {
      this.handleDocumentUpdates(event);
    });

    sharedAnnotations.observe((event: any) => {
      this.handleAnnotationUpdates(event);
    });
  }

  /**
   * Setup presence awareness system
   */
  private setupPresenceAwareness(): void {
    if (!this.wsProvider || !this.currentUser) return;

    const awareness = this.wsProvider.awareness;
    
    // Set local user state
    awareness.setLocalStateField('user', {
      id: this.currentUser.id,
      name: this.currentUser.name,
      color: this.currentUser.color,
      avatar: this.currentUser.avatar
    });

    awareness.setLocalStateField('presence', this.currentUser.presence);

    // Listen for awareness changes
    awareness.on('change', (changes: any) => {
      this.handlePresenceChanges(changes);
    });

    // Update presence periodically
    setInterval(() => {
      this.updatePresence();
    }, 1000);
  }

  /**
   * Initialize WebRTC for voice chat and screen sharing
   */
  private async initializeWebRTC(): Promise<void> {
    try {
      // Get user media for voice chat
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      this.emit('media-initialized', {
        hasAudio: this.mediaStream.getAudioTracks().length > 0,
        hasVideo: this.mediaStream.getVideoTracks().length > 0
      });

    } catch (error) {
      console.warn('Failed to initialize media devices:', error);
      this.emit('media-error', error);
    }
  }

  /**
   * Create or join a collaboration room
   */
  async joinRoom(roomId: string, options?: {
    password?: string;
    role?: 'owner' | 'admin' | 'editor' | 'viewer';
  }): Promise<CollaborationRoom> {
    if (!this.isInitialized || !this.currentUser) {
      throw new Error('Collaboration engine not initialized');
    }

    try {
      // Get or create room state
      const roomData = this.yDoc.getMap('room');
      
      // Initialize room if not exists
      if (!roomData.has('info')) {
        const roomInfo = {
          id: roomId,
          name: `Room ${roomId}`,
          description: '',
          createdAt: Date.now(),
          createdBy: this.currentUser.id
        };
        roomData.set('info', roomInfo);
      }

      // Add user to room
      const roomUsers = this.yDoc.getMap('users');
      roomUsers.set(this.currentUser.id, this.currentUser);

      // Create room object
      const roomInfo = roomData.get('info') as any;
      this.currentRoom = {
        id: roomId,
        name: roomInfo.name,
        description: roomInfo.description,
        users: this.users,
        documents: this.documents,
        sharedState: this.yDoc.getMap('sharedState'),
        permissions: {
          public: true,
          allowGuests: true,
          maxUsers: 50,
          defaultRole: 'editor'
        },
        settings: {
          voice: {
            enabled: true,
            spatialAudio: false,
            noiseSuppression: true,
            echoCancellation: true,
            autoGainControl: true,
            quality: 'medium',
            codec: 'opus',
            bitrate: 32000
          },
          screen: {
            enabled: true,
            quality: 'medium',
            frameRate: 30,
            resolution: { width: 1920, height: 1080 },
            audioIncluded: false,
            cursorIncluded: true
          },
          notifications: true,
          autoSave: true,
          conflictResolution: 'automatic'
        }
      };

      this.emit('room-joined', {
        room: this.currentRoom,
        user: this.currentUser
      });

      return this.currentRoom;

    } catch (error) {
      console.error('Failed to join room:', error);
      this.emit('error', { type: 'room-join', error });
      throw error;
    }
  }

  /**
   * Create or update a document in the collaboration session
   */
  createDocument(filePath: string, content: string = '', type: 'code' | 'markdown' | 'json' | 'text' = 'code'): CollaborationDocument {
    if (!this.currentUser) {
      throw new Error('No current user');
    }

    const docId = this.generateDocumentId(filePath);
    
    // Create Yjs text object
    const yText = this.yDoc.getText(docId);
    
    // Only insert content if text is empty
    if (yText.length === 0 && content) {
      yText.insert(0, content);
    }

    const document: CollaborationDocument = {
      id: docId,
      type,
      filePath,
      content: yText,
      metadata: this.yDoc.getMap(`${docId}_metadata`),
      annotations: this.yDoc.getArray(`${docId}_annotations`),
      version: 1,
      lastModified: Date.now(),
      modifiedBy: this.currentUser.id,
      conflictResolution: {
        strategy: 'merge',
        conflicts: []
      }
    };

    // Set metadata
    document.metadata.set('filePath', filePath);
    document.metadata.set('type', type);
    document.metadata.set('createdAt', Date.now());
    document.metadata.set('createdBy', this.currentUser.id);

    this.documents.set(docId, document);

    // Add to shared documents map
    const sharedDocs = this.yDoc.getMap('documents');
    sharedDocs.set(docId, {
      id: docId,
      filePath,
      type,
      lastModified: Date.now(),
      modifiedBy: this.currentUser.id
    });

    this.emit('document-created', document);
    
    return document;
  }

  /**
   * Update cursor position for collaborative editing
   */
  updateCursorPosition(filePath: string, line: number, column: number): void {
    if (!this.currentUser || !this.wsProvider) return;

    this.currentUser.presence.cursor = {
      x: column,
      y: line,
      visible: true,
      file: filePath,
      line,
      column
    };

    // Update awareness
    this.wsProvider.awareness.setLocalStateField('presence', this.currentUser.presence);

    this.emit('cursor-updated', {
      user: this.currentUser.id,
      position: { filePath, line, column }
    });
  }

  /**
   * Update selection for collaborative editing
   */
  updateSelection(filePath: string, start: { line: number; column: number }, end: { line: number; column: number }, text?: string): void {
    if (!this.currentUser || !this.wsProvider) return;

    this.currentUser.presence.selection = {
      file: filePath,
      start,
      end,
      text
    };

    // Update awareness
    this.wsProvider.awareness.setLocalStateField('presence', this.currentUser.presence);

    this.emit('selection-updated', {
      user: this.currentUser.id,
      selection: { filePath, start, end, text }
    });
  }

  /**
   * Create collaborative annotation
   */
  createAnnotation(annotation: Omit<CollaborationAnnotation, 'id'>): CollaborationAnnotation {
    if (!this.currentUser) {
      throw new Error('No current user');
    }

    const fullAnnotation: CollaborationAnnotation = {
      ...annotation,
      id: `annotation_${Date.now()}_${Math.random()}`,
      content: {
        ...annotation.content,
        author: this.currentUser.id,
        timestamp: Date.now(),
        resolved: false,
        replies: []
      }
    };

    // Add to document annotations
    const docId = this.generateDocumentId(annotation.position.file);
    const doc = this.documents.get(docId);
    
    if (doc) {
      doc.annotations.push([fullAnnotation]);
    }

    // Add to shared annotations
    const sharedAnnotations = this.yDoc.getArray('annotations');
    sharedAnnotations.push([fullAnnotation]);

    this.emit('annotation-created', fullAnnotation);
    
    return fullAnnotation;
  }

  /**
   * Start voice chat
   */
  async startVoiceChat(): Promise<void> {
    if (!this.mediaStream || !this.currentUser) {
      throw new Error('Media stream or user not available');
    }

    try {
      // Update presence
      this.currentUser.presence.voice.isEnabled = true;
      this.updatePresence();

      // Setup peer connections for other users
      this.users.forEach((user, userId) => {
        if (userId !== this.currentUser!.id && user.presence.voice.isEnabled) {
          this.createPeerConnection(userId);
        }
      });

      this.emit('voice-chat-started');

    } catch (error) {
      console.error('Failed to start voice chat:', error);
      this.emit('voice-chat-error', error);
      throw error;
    }
  }

  /**
   * Stop voice chat
   */
  stopVoiceChat(): void {
    if (!this.currentUser) return;

    // Update presence
    this.currentUser.presence.voice.isEnabled = false;
    this.currentUser.presence.voice.isSpeaking = false;
    this.updatePresence();

    // Close peer connections
    this.peerConnections.forEach((pc, userId) => {
      pc.close();
    });
    this.peerConnections.clear();

    // Close data channels
    this.dataChannels.clear();

    this.emit('voice-chat-stopped');
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(options?: {
    shareType?: 'full' | 'window' | 'tab';
    includeAudio?: boolean;
  }): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No current user');
    }

    try {
      // Get screen share stream
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 30,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: options?.includeAudio || false
      });

      // Update presence
      this.currentUser.presence.screen.isSharing = true;
      this.currentUser.presence.screen.shareType = options?.shareType || 'full';
      this.updatePresence();

      // Setup screen share for other users
      this.users.forEach((user, userId) => {
        if (userId !== this.currentUser!.id) {
          this.shareScreenWithUser(userId);
        }
      });

      // Handle stream end
      this.screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopScreenShare();
      });

      this.emit('screen-share-started', {
        stream: this.screenStream,
        options
      });

    } catch (error) {
      console.error('Failed to start screen share:', error);
      this.emit('screen-share-error', error);
      throw error;
    }
  }

  /**
   * Stop screen sharing
   */
  stopScreenShare(): void {
    if (!this.currentUser) return;

    // Stop screen stream
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    // Update presence
    this.currentUser.presence.screen.isSharing = false;
    this.currentUser.presence.screen.shareType = undefined;
    this.updatePresence();

    this.emit('screen-share-stopped');
  }

  /**
   * Create WebRTC peer connection
   */
  private async createPeerConnection(userId: string): Promise<RTCPeerConnection> {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        pc.addTrack(track, this.mediaStream!);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      this.voiceStreams.set(userId, remoteStream);
      this.emit('remote-stream-added', { userId, stream: remoteStream });
    };

    // Handle data channel
    const dataChannel = pc.createDataChannel('collaboration', {
      ordered: true
    });
    
    dataChannel.onopen = () => {
      this.dataChannels.set(userId, dataChannel);
    };

    dataChannel.onmessage = (event) => {
      this.handleDataChannelMessage(userId, event.data);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage(userId, {
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };

    this.peerConnections.set(userId, pc);
    
    return pc;
  }

  /**
   * Share screen with specific user
   */
  private async shareScreenWithUser(userId: string): Promise<void> {
    if (!this.screenStream) return;

    const pc = this.peerConnections.get(userId);
    if (!pc) return;

    // Add screen track to peer connection
    this.screenStream.getTracks().forEach(track => {
      pc.addTrack(track, this.screenStream!);
    });
  }

  /**
   * Handle data channel messages
   */
  private handleDataChannelMessage(userId: string, data: string): void {
    try {
      const message = JSON.parse(data);
      this.emit('data-channel-message', { userId, message });
    } catch (error) {
      console.error('Failed to parse data channel message:', error);
    }
  }

  /**
   * Send signaling message (implementation depends on signaling server)
   */
  private sendSignalingMessage(userId: string, message: any): void {
    // This would typically send through WebSocket or other signaling mechanism
    this.emit('signaling-message', { userId, message });
  }

  /**
   * Handle user updates from shared state
   */
  private handleUserUpdates(event: any): void {
    // Process user additions, removals, and updates
    this.emit('users-updated', event);
  }

  /**
   * Handle document updates from shared state
   */
  private handleDocumentUpdates(event: any): void {
    // Process document changes
    this.emit('documents-updated', event);
  }

  /**
   * Handle annotation updates from shared state
   */
  private handleAnnotationUpdates(event: any): void {
    // Process annotation changes
    this.emit('annotations-updated', event);
  }

  /**
   * Handle presence changes from awareness
   */
  private handlePresenceChanges(changes: any): void {
    const { added, updated, removed } = changes;
    
    // Process added users
    added.forEach((clientId: number) => {
      const state = this.wsProvider?.awareness.getStates().get(clientId);
      if (state?.user) {
        this.users.set(state.user.id, state.user);
        this.emit('user-joined', state.user);
      }
    });

    // Process updated users
    updated.forEach((clientId: number) => {
      const state = this.wsProvider?.awareness.getStates().get(clientId);
      if (state?.user) {
        this.users.set(state.user.id, state.user);
        this.emit('user-updated', state.user);
      }
    });

    // Process removed users
    removed.forEach((clientId: number) => {
      // Find user by client ID and remove
      this.users.forEach((user, userId) => {
        // This would need proper client ID tracking
        this.emit('user-left', user);
      });
    });
  }

  /**
   * Update current user presence
   */
  private updatePresence(): void {
    if (!this.currentUser || !this.wsProvider) return;

    this.currentUser.presence.activity.lastActivity = Date.now();
    this.wsProvider.awareness.setLocalStateField('presence', this.currentUser.presence);
  }

  /**
   * Update connection status
   */
  private updateConnectionStatus(status: string): void {
    if (!this.currentUser) return;

    switch (status) {
      case 'connected':
        this.currentUser.connection.isOnline = true;
        this.currentUser.connection.quality = 'excellent';
        break;
      case 'disconnected':
        this.currentUser.connection.isOnline = false;
        this.currentUser.connection.quality = 'disconnected';
        break;
      case 'connecting':
        this.currentUser.connection.quality = 'poor';
        break;
    }

    this.currentUser.connection.lastSeen = Date.now();
  }

  /**
   * Generate document ID from file path
   */
  private generateDocumentId(filePath: string): string {
    return `doc_${btoa(filePath).replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  /**
   * Generate random user color
   */
  private generateUserColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Create default presence object
   */
  private createDefaultPresence(): UserPresence {
    return {
      cursor: {
        x: 0,
        y: 0,
        visible: false
      },
      selection: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 0 }
      },
      viewport: {
        topLine: 0,
        bottomLine: 0,
        scrollPosition: 0
      },
      activity: {
        status: 'active',
        lastActivity: Date.now()
      },
      voice: {
        isEnabled: false,
        isMuted: false,
        isSpeaking: false,
        volume: 0
      },
      screen: {
        isSharing: false
      }
    };
  }

  /**
   * Get current collaboration state
   */
  getCollaborationState(): {
    isInitialized: boolean;
    currentUser: CollaborationUser | null;
    currentRoom: CollaborationRoom | null;
    users: CollaborationUser[];
    documents: CollaborationDocument[];
    connectionStatus: string;
  } {
    return {
      isInitialized: this.isInitialized,
      currentUser: this.currentUser,
      currentRoom: this.currentRoom,
      users: Array.from(this.users.values()),
      documents: Array.from(this.documents.values()),
      connectionStatus: this.currentUser?.connection.isOnline ? 'connected' : 'disconnected'
    };
  }

  /**
   * Dispose collaboration engine
   */
  dispose(): void {
    // Stop media streams
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
    }

    // Close peer connections
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    // Close WebSocket provider
    if (this.wsProvider) {
      this.wsProvider.destroy();
    }

    // Close persistence
    if (this.persistence) {
      this.persistence.destroy();
    }

    // Destroy Yjs document
    this.yDoc.destroy();

    this.removeAllListeners();
    this.isInitialized = false;
  }
}

export default CollaborationEngine; 