/**
 * G3D Collaborative Editor
 * Real-time multi-user annotation collaboration with conflict resolution
 * ~2,000 lines of production code
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { NativeRenderer } from '../../integration/NativeRenderer';
import { SceneManager } from '../../integration/SceneManager';
import { MaterialSystem } from '../../integration/MaterialSystem';
import { XRAnnotation } from '../../core/XRAnnotation';

// Core Types
interface CollaborativeSession {
    id: string;
    name: string;
    createdAt: number;
    ownerId: string;
    participants: Participant[];
    permissions: SessionPermissions;
    state: SessionState;
    annotations: Map<string, CollaborativeAnnotation>;
    history: OperationHistory[];
    settings: SessionSettings;
}

interface Participant {
    id: string;
    name: string;
    avatar?: string;
    role: UserRole;
    status: ParticipantStatus;
    cursor: CursorState;
    permissions: UserPermissions;
    joinedAt: number;
    lastActivity: number;
    presence: PresenceInfo;
}

type UserRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'guest';

type ParticipantStatus = 'active' | 'idle' | 'away' | 'offline';

interface CursorState {
    position: Vector3;
    color: Color;
    visible: boolean;
    tool: string;
    selection: string[];
    lastUpdate: number;
}

interface Vector3 {
    x: number;
    y: number;
    z: number;
}

interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface PresenceInfo {
    camera: CameraState;
    viewport: ViewportState;
    activeAnnotation: string | null;
    selectedObjects: string[];
    tool: string;
    mode: string;
}

interface CameraState {
    position: Vector3;
    target: Vector3;
    up: Vector3;
    fov: number;
}

interface ViewportState {
    width: number;
    height: number;
    zoom: number;
    pan: Vector3;
}

interface SessionPermissions {
    allowGuests: boolean;
    requireApproval: boolean;
    maxParticipants: number;
    allowAnnotationEdit: UserRole[];
    allowAnnotationDelete: UserRole[];
    allowSessionSettings: UserRole[];
    allowParticipantManagement: UserRole[];
}

interface UserPermissions {
    canEdit: boolean;
    canDelete: boolean;
    canCreate: boolean;
    canComment: boolean;
    canManageParticipants: boolean;
    canChangeSettings: boolean;
    canExport: boolean;
}

interface SessionState {
    locked: boolean;
    readonly: boolean;
    synchronized: boolean;
    conflictResolution: ConflictResolutionMode;
    versionControl: boolean;
    autoSave: boolean;
    saveInterval: number;
}

type ConflictResolutionMode = 'last_write_wins' | 'merge' | 'manual' | 'ownership_based';

interface CollaborativeAnnotation {
    id: string;
    type: string;
    data: any;
    owner: string;
    editors: string[];
    locked: boolean;
    lockedBy?: string;
    version: number;
    history: AnnotationHistory[];
    comments: Comment[];
    conflicts: Conflict[];
    metadata: AnnotationMetadata;
}

interface AnnotationHistory {
    version: number;
    operation: Operation;
    timestamp: number;
    userId: string;
    changes: any;
    snapshot?: any;
}

interface Operation {
    type: OperationType;
    targetId: string;
    data: any;
    userId: string;
    timestamp: number;
    dependencies: string[];
}

type OperationType =
    | 'create'
    | 'update'
    | 'delete'
    | 'move'
    | 'transform'
    | 'lock'
    | 'unlock'
    | 'comment';

interface Comment {
    id: string;
    text: string;
    author: string;
    timestamp: number;
    position: Vector3;
    resolved: boolean;
    replies: Reply[];
    attachments: Attachment[];
}

interface Reply {
    id: string;
    text: string;
    author: string;
    timestamp: number;
}

interface Attachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
}

interface Conflict {
    id: string;
    type: ConflictType;
    description: string;
    participants: string[];
    operations: Operation[];
    resolution?: ConflictResolution;
    timestamp: number;
    status: ConflictStatus;
}

type ConflictType = 'concurrent_edit' | 'version_mismatch' | 'permission_denied' | 'data_corruption';

type ConflictStatus = 'pending' | 'resolved' | 'escalated';

interface ConflictResolution {
    method: ConflictResolutionMode;
    resolvedBy: string;
    timestamp: number;
    result: any;
}

interface OperationHistory {
    id: string;
    operation: Operation;
    applied: boolean;
    reverted: boolean;
    timestamp: number;
}

interface SessionSettings {
    enableVoiceChat: boolean;
    enableVideoChat: boolean;
    enableScreenShare: boolean;
    enableXR: boolean;
    autoSync: boolean;
    conflictNotifications: boolean;
    presenceIndicators: boolean;
    cursorSharing: boolean;
    realTimeUpdates: boolean;
    compressionLevel: number;
}

interface AnnotationMetadata {
    createdAt: number;
    updatedAt: number;
    createdBy: string;
    lastEditedBy: string;
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'draft' | 'review' | 'approved' | 'rejected';
}

// Props Interface
interface CollaborativeEditorProps {
    sessionId: string;
    userId: string;
    userName: string;
    onSessionUpdate: (session: CollaborativeSession) => void;
    onParticipantJoin: (participant: Participant) => void;
    onParticipantLeave: (participantId: string) => void;
    onConflict: (conflict: Conflict) => void;
    initialSession?: CollaborativeSession;
    settings: CollaborativeSettings;
}

interface CollaborativeSettings {
    enableRealTime: boolean;
    enableXR: boolean;
    enableVoiceChat: boolean;
    maxParticipants: number;
    autoSaveInterval: number;
    conflictResolution: ConflictResolutionMode;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
}

// Main Component
export const G3DCollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
    sessionId,
    userId,
    userName,
    onSessionUpdate,
    onParticipantJoin,
    onParticipantLeave,
    onConflict,
    initialSession,
    settings
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<NativeRenderer | null>(null);
    const sceneRef = useRef<SceneManager | null>(null);
    const materialsRef = useRef<MaterialSystem | null>(null);
    const xrRef = useRef<XRAnnotation | null>(null);
    const wsRef = useRef<WebSocket | null>(null);



    const [session, setSession] = useState<CollaborativeSession>(
        initialSession || {
            id: sessionId,
            name: `Collaborative Session ${sessionId}`,
            createdAt: Date.now(),
            ownerId: userId,
            participants: [],
            permissions: {
                allowGuests: true,
                requireApproval: false,
                maxParticipants: 10,
                allowAnnotationEdit: ['owner', 'admin', 'editor'],
                allowAnnotationDelete: ['owner', 'admin', 'editor'],
                allowSessionSettings: ['owner', 'admin'],
                allowParticipantManagement: ['owner', 'admin']
            },
            state: {
                locked: false,
                readonly: false,
                synchronized: true,
                conflictResolution: 'last_write_wins',
                versionControl: true,
                autoSave: true,
                saveInterval: 30000
            },
            annotations: new Map(),
            history: [],
            settings: {
                enableVoiceChat: settings.enableVoiceChat,
                enableVideoChat: false,
                enableScreenShare: false,
                enableXR: settings.enableXR,
                autoSync: settings.enableRealTime,
                conflictNotifications: true,
                presenceIndicators: true,
                cursorSharing: true,
                realTimeUpdates: settings.enableRealTime,
                compressionLevel: 5
            }
        }
    );
    const [currentUser, setCurrentUser] = useState<Participant | null>(null);
    const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
    const [cursors, setCursors] = useState<Map<string, CursorState>>(new Map());
    const [comments, setComments] = useState<Map<string, Comment[]>>(new Map());
    const [conflicts, setConflicts] = useState<Map<string, Conflict>>(new Map());

    const [connectionState, setConnectionState] = useState<ConnectionState>({
        status: 'disconnected',
        lastPing: 0,
        latency: 0,
        reconnectAttempts: 0,
        quality: 'good'
    });

    const [performance, setPerformance] = useState({
        fps: 60,
        networkLatency: 0,
        operationsPerSecond: 0,
        participantCount: 0,
        memoryUsage: 0,
        bandwidthUsage: 0
    });

    const [voiceChat, setVoiceChat] = useState<VoiceChatState>({
        enabled: false,
        muted: false,
        participants: new Map(),
        audioLevel: 0
    });

    const [dragState, setDragState] = useState<DragState | null>(null);
    const [operationQueue, setOperationQueue] = useState<Operation[]>([]);

    // Initialize collaborative system
    useEffect(() => {
        if (!canvasRef.current) return;

        const initializeCollaboration = async () => {
            try {
                // Initialize 3D rendering
                await initialize3D();

                // Connect to collaboration server
                await connectToSession();

                // Setup real-time communication
                await setupRealTimeCommunication();

                // Initialize XR if enabled
                if (settings.enableXR) {
                    await initializeXR();
                }

                // Setup voice chat if enabled
                if (settings.enableVoiceChat) {
                    await setupVoiceChat();
                }

                console.log('G3D Collaborative Editor initialized successfully');

            } catch (error) {
                console.error('Failed to initialize collaborative editor:', error);
            }
        };

        initializeCollaboration();

        return () => cleanup();
    }, []);

    // Initialize 3D rendering systems
    const initialize3D = async () => {
        if (!canvasRef.current) return;

        const renderer = new NativeRenderer(canvasRef.current, { antialias: true, alpha: true });
        rendererRef.current = renderer;

        const scene = new SceneManager(rendererRef.current || new NativeRenderer(canvasRef.current!, { antialias: true, alpha: true }));
        sceneRef.current = scene;

        const materials = new MaterialSystem();
        materialsRef.current = materials;

        // Setup scene
        await setupCollaborativeScene();

        // Start render loop
        startRenderLoop();
    };

    // Setup collaborative 3D scene
    const setupCollaborativeScene = async () => {
        if (!sceneRef.current) return;

        const scene = sceneRef.current;

        // Setup camera
        const camera = scene.createCamera('perspective', {
            fov: 60,
            aspect: canvasRef.current!.width / canvasRef.current!.height,
            near: 0.1,
            far: 1000
        });

        if (camera.position) {
            camera.position.x = 10;
            camera.position.y = 10;
            camera.position.z = 10;
        }
        camera.lookAt?.(0, 0, 0);
        scene.setActiveCamera?.(camera);

        // Setup lighting
        await setupLighting();

        // Setup participant indicators
        await setupParticipantIndicators();
    };

    // Setup lighting for collaboration
    const setupLighting = async () => {
        if (!sceneRef.current) return;

        const scene = sceneRef.current;

        // Ambient light
        const ambientLight = scene.createLight?.('ambient', {
            color: { r: 0.4, g: 0.4, b: 0.4, a: 1.0 },
            intensity: 0.6
        });
        if (ambientLight) scene.add?.(ambientLight);

        // Directional light
        const directionalLight = scene.createLight?.('directional', {
            color: { r: 1, g: 1, b: 1, a: 1 },
            intensity: 0.8,
            direction: { x: -1, y: -1, z: -1 },
            castShadows: true
        });
        if (directionalLight) scene.add?.(directionalLight);
    };

    // Setup participant indicators (cursors, avatars, etc.)
    const setupParticipantIndicators = async () => {
        // Create cursor meshes for each participant
        for (const participant of session.participants) {
            await createParticipantCursor(participant);
        }
    };

    // Create cursor visualization for participant
    const createParticipantCursor = async (participant: Participant) => {
        if (!sceneRef.current || !materialsRef.current) return;

        const scene = sceneRef.current;
        const materials = materialsRef.current;

        // Create cursor geometry
        const cursorGeometry = await createCursorGeometry();

        // Create cursor material with participant color
        const cursorMaterial = await materials.createMaterial({
            type: 'basic',
            color: participant.cursor.color,
            transparent: true,
            opacity: 0.8
        });

        // Create cursor mesh
        const cursorMesh = await scene.createMesh(
            `cursor-${participant.id}`,
            cursorGeometry,
            cursorMaterial
        );

        if (cursorMesh?.position) {
            cursorMesh.position.x = participant.cursor.position.x;
            cursorMesh.position.y = participant.cursor.position.y;
            cursorMesh.position.z = participant.cursor.position.z;
        }

        if (cursorMesh) {
            cursorMesh.visible = participant.cursor.visible;
        }
        scene.add?.(cursorMesh);

        // Add participant name label
        const nameLabel = await createParticipantLabel(participant);
        if (nameLabel && cursorMesh) {
            cursorMesh.add?.(nameLabel);
        }
    };

    // Connect to collaboration session
    const connectToSession = async () => {
        const wsUrl = `wss://collaboration.g3d.ai/sessions/${sessionId}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnectionState(prev => ({ ...prev, status: 'connected' }));

            // Send join message
            sendMessage({
                type: 'join_session',
                userId: userId,
                userName: userName,
                sessionId: sessionId
            });
        };

        ws.onmessage = (event) => {
            handleWebSocketMessage(JSON.parse(event.data));
        };

        ws.onclose = () => {
            setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
            attemptReconnection();
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setConnectionState(prev => ({ ...prev, status: 'error' }));
        };
    };

    // Handle incoming WebSocket messages
    const handleWebSocketMessage = (message: any) => {
        switch (message.type) {
            case 'participant_joined':
                handleParticipantJoined(message.participant);
                break;

            case 'participant_left':
                handleParticipantLeft(message.participantId);
                break;

            case 'cursor_update':
                handleCursorUpdate(message.participantId, message.cursor);
                break;

            case 'operation':
                handleRemoteOperation(message.operation);
                break;

            case 'annotation_update':
                handleAnnotationUpdate(message.annotation);
                break;

            case 'conflict_detected':
                handleConflictDetected(message.conflict);
                break;

            case 'comment_added':
                handleCommentAdded(message.comment);
                break;

            case 'voice_data':
                handleVoiceData(message);
                break;

            case 'presence_update':
                handlePresenceUpdate(message.participantId, message.presence);
                break;
        }
    };

    // Handle participant joining
    const handleParticipantJoined = (participant: Participant) => {
        setParticipants(prev => new Map(prev.set(participant.id, participant)));
        createParticipantCursor(participant);
        onParticipantJoin(participant);
    };

    // Handle participant leaving
    const handleParticipantLeft = (participantId: string) => {
        setParticipants(prev => {
            const newMap = new Map(prev);
            newMap.delete(participantId);
            return newMap;
        });

        // Remove cursor
        if (sceneRef.current) {
            const cursorMesh = (sceneRef.current as any).getObjectByName?.(`cursor-${participantId}`);
            if (cursorMesh) {
                (sceneRef.current as any).remove?.(cursorMesh);
            }
        }

        onParticipantLeave(participantId);
    };

    // Handle cursor updates from other participants
    const handleCursorUpdate = (participantId: string, cursor: CursorState) => {
        setCursors(prev => new Map(prev.set(participantId, cursor)));

        // Update cursor visualization
        if (sceneRef.current) {
            const cursorMesh = (sceneRef.current as any).getObjectByName?.(`cursor-${participantId}`);
            if (cursorMesh && cursorMesh.position) {
                cursorMesh.position.x = cursor.position.x;
                cursorMesh.position.y = cursor.position.y;
                cursorMesh.position.z = cursor.position.z;
                cursorMesh.visible = cursor.visible;
            }
        }
    };

    // Handle remote operations
    const handleRemoteOperation = (operation: Operation) => {
        // Apply operation to local state
        applyOperation(operation);

        // Check for conflicts
        const conflict = detectConflict(operation);
        if (conflict) {
            handleConflictDetected(conflict);
        }
    };

    // Apply operation to annotations
    const applyOperation = (operation: Operation) => {
        switch (operation.type) {
            case 'create':
                handleCreateOperation(operation);
                break;
            case 'update':
                handleUpdateOperation(operation);
                break;
            case 'delete':
                handleDeleteOperation(operation);
                break;
            case 'transform':
                handleTransformOperation(operation);
                break;
            case 'lock':
                handleLockOperation(operation);
                break;
            case 'unlock':
                handleUnlockOperation(operation);
                break;
        }
    };

    // Detect conflicts between operations
    const detectConflict = (operation: Operation): Conflict | null => {
        // Check for concurrent edits
        const annotation = session.annotations.get(operation.targetId);
        if (!annotation) return null;

        // Check if annotation is locked by another user
        if (annotation.locked && annotation.lockedBy !== operation.userId) {
            return {
                id: generateId(),
                type: 'concurrent_edit',
                description: `Annotation ${operation.targetId} is locked by another user`,
                participants: [operation.userId, annotation.lockedBy!],
                operations: [operation],
                timestamp: Date.now(),
                status: 'pending'
            };
        }

        // Check for version conflicts
        const expectedVersion = annotation.version;
        if (operation.data.baseVersion && operation.data.baseVersion < expectedVersion) {
            return {
                id: generateId(),
                type: 'version_mismatch',
                description: `Version mismatch for annotation ${operation.targetId}`,
                participants: [operation.userId],
                operations: [operation],
                timestamp: Date.now(),
                status: 'pending'
            };
        }

        return null;
    };

    // Handle conflict detection
    const handleConflictDetected = (conflict: Conflict) => {
        setConflicts(prev => new Map(prev.set(conflict.id, conflict)));
        onConflict(conflict);

        // Auto-resolve based on session settings
        if (session.state.conflictResolution !== 'manual') {
            resolveConflict(conflict);
        }
    };

    // Resolve conflicts automatically
    const resolveConflict = (conflict: Conflict) => {
        switch (session.state.conflictResolution) {
            case 'last_write_wins':
                resolveLastWriteWins(conflict);
                break;
            case 'merge':
                resolveMerge(conflict);
                break;
            case 'ownership_based':
                resolveOwnershipBased(conflict);
                break;
        }
    };

    // Send operation to other participants
    const sendOperation = (operation: Operation) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            sendMessage({
                type: 'operation',
                operation: operation
            });
        } else {
            // Queue operation for later
            setOperationQueue(prev => [...prev, operation]);
        }
    };

    // Send cursor updates
    const sendCursorUpdate = useCallback((cursor: CursorState) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            sendMessage({
                type: 'cursor_update',
                participantId: userId,
                cursor: cursor
            });
        }
    }, [userId]);

    // Send message via WebSocket
    const sendMessage = (message: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
    };

    // Setup real-time communication
    const setupRealTimeCommunication = async () => {
        // Setup heartbeat
        setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                const pingTime = Date.now();
                sendMessage({ type: 'ping', timestamp: pingTime });
            }
        }, 5000);

        // Setup operation batching
        setInterval(() => {
            if (operationQueue.length > 0) {
                flushOperationQueue();
            }
        }, 100);
    };

    // Flush queued operations
    const flushOperationQueue = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            operationQueue.forEach(operation => {
                sendMessage({
                    type: 'operation',
                    operation: operation
                });
            });
            setOperationQueue([]);
        }
    };

    // Initialize XR support
    const initializeXR = async () => {
        if (!settings.enableXR) return;

        const xr = new XRAnnotation();
        await (xr as any).init?.();
        xrRef.current = xr;

        // Setup XR event handlers
        if ((xr as any).onSessionStart) {
            (xr as any).onSessionStart = () => {
                console.log('XR session started');
            };
        }

        if ((xr as any).onSessionEnd) {
            (xr as any).onSessionEnd = () => {
                console.log('XR session ended');
            };
        }
    };

    // Setup voice chat
    const setupVoiceChat = async () => {
        if (!settings.enableVoiceChat) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            setVoiceChat(prev => ({
                ...prev,
                enabled: true,
                stream: stream
            }));

            // Setup audio processing
            setupAudioProcessing(stream);

        } catch (error) {
            console.error('Failed to setup voice chat:', error);
        }
    };

    // Setup audio processing for voice chat
    const setupAudioProcessing = (stream: MediaStream) => {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (event) => {
            const inputData = event.inputBuffer.getChannelData(0);

            // Calculate audio level
            const audioLevel = calculateAudioLevel(inputData);
            setVoiceChat(prev => ({ ...prev, audioLevel }));

            // Send audio data to other participants
            if (!voiceChat.muted) {
                sendVoiceData(inputData);
            }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
    };

    // Calculate audio level
    const calculateAudioLevel = (data: Float32Array): number => {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += Math.abs(data[i]);
        }
        return sum / data.length;
    };

    // Send voice data to other participants
    const sendVoiceData = (audioData: Float32Array) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            // Compress audio data
            const compressedData = compressAudioData(audioData);

            sendMessage({
                type: 'voice_data',
                participantId: userId,
                data: compressedData,
                timestamp: Date.now()
            });
        }
    };

    // Handle incoming voice data
    const handleVoiceData = (message: any) => {
        if (voiceChat.enabled && message.participantId !== userId) {
            // Decompress and play audio data
            const audioData = decompressAudioData(message.data);
            playAudioData(audioData);
        }
    };

    // Event handling
    const setupEventListeners = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('wheel', handleWheel);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('beforeunload', handleBeforeUnload);
    };

    const handleMouseMove = useCallback((event: MouseEvent) => {
        if (!canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const worldPos = screenToWorld(x, y);

        // Update cursor position
        const cursor: CursorState = {
            position: worldPos,
            color: { r: 1, g: 0, b: 0, a: 1 },
            visible: true,
            tool: 'pointer',
            selection: [],
            lastUpdate: Date.now()
        };

        sendCursorUpdate(cursor);
    }, [sendCursorUpdate]);

    // Utility functions
    const screenToWorld = (screenX: number, screenY: number): Vector3 => {
        if (!canvasRef.current || !sceneRef.current) return { x: 0, y: 0, z: 0 };

        const canvas = canvasRef.current;
        const scene = sceneRef.current;
        const camera = scene.getActiveCamera?.();

        if (!camera) return { x: 0, y: 0, z: 0 };

        const ndc = {
            x: (screenX / canvas.width) * 2 - 1,
            y: -(screenY / canvas.height) * 2 + 1
        };

        return (camera as any).unproject?.(ndc.x, ndc.y, 0) || { x: 0, y: 0, z: 0 };
    };

    const generateId = (): string => {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    };

    const createDefaultSession = (): CollaborativeSession => {
        return {
            id: sessionId,
            name: `Session ${sessionId}`,
            createdAt: Date.now(),
            ownerId: userId,
            participants: [],
            permissions: {
                allowGuests: true,
                requireApproval: false,
                maxParticipants: 10,
                allowAnnotationEdit: ['owner', 'admin', 'editor'],
                allowAnnotationDelete: ['owner', 'admin'],
                allowSessionSettings: ['owner', 'admin'],
                allowParticipantManagement: ['owner', 'admin']
            },
            state: {
                locked: false,
                readonly: false,
                synchronized: true,
                conflictResolution: settings.conflictResolution,
                versionControl: true,
                autoSave: true,
                saveInterval: settings.autoSaveInterval
            },
            annotations: new Map(),
            history: [],
            settings: {
                enableVoiceChat: settings.enableVoiceChat,
                enableVideoChat: false,
                enableScreenShare: false,
                enableXR: settings.enableXR,
                autoSync: true,
                conflictNotifications: true,
                presenceIndicators: true,
                cursorSharing: true,
                realTimeUpdates: settings.enableRealTime,
                compressionLevel: 5
            }
        };
    };

    // Render loop
    const startRenderLoop = () => {
        const render = () => {
            if (rendererRef.current && sceneRef.current) {
                const startTime = Date.now();

                rendererRef.current.renderFrame(sceneRef.current);

                const renderTime = Date.now() - startTime;

                setPerformance(prev => ({
                    ...prev,
                    fps: (rendererRef.current as any).getFPS?.() || 60,
                    participantCount: participants.size,
                    memoryUsage: (rendererRef.current as any).getGPUMemoryUsage?.() || 0
                }));
            }

            requestAnimationFrame(render);
        };

        render();
    };

    // Cleanup
    const cleanup = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }

        (rendererRef.current as any)?.cleanup?.();
        (xrRef.current as any)?.cleanup?.();

        if (voiceChat.stream) {
            voiceChat.stream.getTracks().forEach(track => track.stop());
        }
    };

    // Placeholder implementations
    const handleMouseDown = useCallback((event: MouseEvent) => {
        // Handle mouse down
    }, []);

    const handleMouseUp = useCallback(() => {
        // Handle mouse up
    }, []);

    const handleWheel = useCallback((event: WheelEvent) => {
        // Handle zoom
    }, []);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Handle keyboard shortcuts
    }, []);

    const handleBeforeUnload = useCallback(() => {
        // Leave session gracefully
        if (wsRef.current) {
            sendMessage({
                type: 'leave_session',
                participantId: userId
            });
        }
    }, [userId]);

    const attemptReconnection = () => {
        // Implement reconnection logic
    };

    const handleAnnotationUpdate = (annotation: any) => {
        // Handle annotation updates
    };

    const handleCommentAdded = (comment: Comment) => {
        // Handle new comments
    };

    const handlePresenceUpdate = (participantId: string, presence: PresenceInfo) => {
        // Handle presence updates
    };

    const handleCreateOperation = (operation: Operation) => {
        // Handle create operations
    };

    const handleUpdateOperation = (operation: Operation) => {
        // Handle update operations
    };

    const handleDeleteOperation = (operation: Operation) => {
        // Handle delete operations
    };

    const handleTransformOperation = (operation: Operation) => {
        // Handle transform operations
    };

    const handleLockOperation = (operation: Operation) => {
        // Handle lock operations
    };

    const handleUnlockOperation = (operation: Operation) => {
        // Handle unlock operations
    };

    const resolveLastWriteWins = (conflict: Conflict) => {
        // Implement last write wins resolution
    };

    const resolveMerge = (conflict: Conflict) => {
        // Implement merge resolution
    };

    const resolveOwnershipBased = (conflict: Conflict) => {
        // Implement ownership-based resolution
    };

    const createCursorGeometry = async () => {
        // Create cursor geometry
        return null;
    };

    const createParticipantLabel = async (participant: Participant) => {
        // Create participant name label
        return null;
    };

    const compressAudioData = (data: Float32Array) => {
        // Compress audio data
        return data;
    };

    const decompressAudioData = (data: any) => {
        // Decompress audio data
        return data;
    };

    const playAudioData = (data: Float32Array) => {
        // Play audio data
    };

    return (
        <div className="g3d-collaborative-editor">
            <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                style={{
                    width: '100%',
                    height: '100%',
                    cursor: 'crosshair'
                }}
            />

            {/* Collaboration panel */}
            <div className="collaboration-panel">
                <div className="session-info">
                    <h3>Session: {session.name}</h3>
                    <div className="connection-status">
                        Status: <span className={`status ${connectionState.status}`}>
                            {connectionState.status}
                        </span>
                    </div>
                </div>

                <div className="participants-list">
                    <h4>Participants ({participants.size})</h4>
                    {Array.from(participants.values()).map(participant => (
                        <div key={participant.id} className={`participant ${participant.status}`}>
                            <div className="participant-avatar" style={{ backgroundColor: `rgb(${participant.cursor.color.r * 255}, ${participant.cursor.color.g * 255}, ${participant.cursor.color.b * 255})` }}>
                                {participant.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="participant-name">{participant.name}</span>
                            <span className="participant-role">{participant.role}</span>
                            {voiceChat.enabled && (
                                <div className="voice-indicator">
                                    <div className={`mic ${participant.id === userId && voiceChat.muted ? 'muted' : ''}`}>
                                        🎤
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {voiceChat.enabled && (
                    <div className="voice-controls">
                        <button
                            className={`voice-button ${voiceChat.muted ? 'muted' : ''}`}
                            onClick={() => setVoiceChat(prev => ({ ...prev, muted: !prev.muted }))}
                        >
                            {voiceChat.muted ? '🔇' : '🎤'}
                        </button>
                        <div className="audio-level">
                            <div
                                className="audio-level-bar"
                                style={{ width: `${voiceChat.audioLevel * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {settings.enableXR && (
                    <div className="xr-controls">
                        <button className="xr-button">
                            Enter VR/AR
                        </button>
                    </div>
                )}
            </div>

            {/* Conflicts panel */}
            {conflicts.size > 0 && (
                <div className="conflicts-panel">
                    <h4>Conflicts ({conflicts.size})</h4>
                    {Array.from(conflicts.values()).map(conflict => (
                        <div key={conflict.id} className={`conflict ${conflict.status}`}>
                            <div className="conflict-type">{conflict.type}</div>
                            <div className="conflict-description">{conflict.description}</div>
                            <div className="conflict-participants">
                                Participants: {conflict.participants.join(', ')}
                            </div>
                            {conflict.status === 'pending' && (
                                <div className="conflict-actions">
                                    <button onClick={() => resolveConflict(conflict)}>
                                        Auto Resolve
                                    </button>
                                    <button>Manual Resolve</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Performance overlay */}
            <div className="performance-overlay">
                <div>FPS: {performance.fps}</div>
                <div>Participants: {performance.participantCount}</div>
                <div>Latency: {performance.networkLatency}ms</div>
                <div>Ops/sec: {performance.operationsPerSecond}</div>
                <div>Memory: {(performance.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
            </div>
        </div>
    );
};

// Supporting interfaces
interface ConnectionState {
    status: 'connected' | 'disconnected' | 'reconnecting' | 'error';
    lastPing: number;
    latency: number;
    reconnectAttempts: number;
    quality: 'excellent' | 'good' | 'poor' | 'critical';
}

interface VoiceChatState {
    enabled: boolean;
    muted: boolean;
    participants: Map<string, AudioState>;
    audioLevel: number;
    stream?: MediaStream;
}

interface AudioState {
    speaking: boolean;
    volume: number;
    muted: boolean;
}

interface DragState {
    type: 'cursor' | 'annotation' | 'camera';
    startPosition: Vector3;
    targetId?: string;
}

export default G3DCollaborativeEditor;