/**
 * G3D AnnotateAI - XR Collaboration Component
 * VR/AR collaborative annotation with G3D hardware acceleration
 * Immersive multi-user annotation experiences
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Local WebXR types for compatibility
interface XRFrameData {
    session: any;
    getViewerPose?: () => any;
}

// Mock G3D classes if not available
class GPUCompute {
    async init(): Promise<void> {
        console.log('GPUCompute initialized');
    }
    
    async cleanup(): Promise<void> {
        console.log('GPUCompute cleaned up');
    }
}

class XRAnnotationSystem {
    async initialize(): Promise<void> {
        console.log('XRAnnotationSystem initialized');
    }
    
    async setupXRSession(config: any): Promise<void> {
        console.log('XRAnnotationSystem XR session setup:', config);
    }
    
    renderFrame(frame: any, data: any): void {
        // Mock render implementation
    }
    
    async cleanup(): Promise<void> {
        console.log('XRAnnotationSystem cleaned up');
    }
}

class CollaborationEngine {
    async initialize(): Promise<void> {
        console.log('CollaborationEngine initialized');
    }
    
    async setupDesktopMode(config: any): Promise<void> {
        console.log('CollaborationEngine desktop mode setup:', config);
    }
    
    async cleanup(): Promise<void> {
        console.log('CollaborationEngine cleaned up');
    }
}

// Component interfaces
export interface XRCollaborationProps {
    sessionId: string;
    userId: string;
    projectId: string;
    enableVR?: boolean;
    enableAR?: boolean;
    enableG3DAcceleration?: boolean;
    onAnnotationCreate?: (annotation: XRAnnotation) => void;
    onAnnotationUpdate?: (annotation: XRAnnotation) => void;
    onAnnotationDelete?: (annotationId: string) => void;
    onUserJoin?: (user: CollaborationUser) => void;
    onUserLeave?: (userId: string) => void;
}

export interface XRAnnotation {
    id: string;
    type: 'point' | 'line' | 'polygon' | 'volume' | 'mesh';
    position: [number, number, number];
    orientation: [number, number, number, number]; // quaternion
    scale: [number, number, number];
    data: any;
    metadata: {
        createdBy: string;
        createdAt: Date;
        updatedBy: string;
        updatedAt: Date;
        confidence: number;
        tags: string[];
    };
}

export interface CollaborationUser {
    id: string;
    name: string;
    avatar: string;
    role: 'viewer' | 'annotator' | 'admin';
    isActive: boolean;
    headPosition: [number, number, number];
    headRotation: [number, number, number, number];
    handPositions: {
        left: [number, number, number];
        right: [number, number, number];
    };
    handRotations: {
        left: [number, number, number, number];
        right: [number, number, number, number];
    };
}

export interface CollaborationSession {
    id: string;
    mode: 'immersive-vr' | 'immersive-ar' | 'inline';
    users: CollaborationUser[];
    annotations: XRAnnotation[];
    sharedState: any;
    settings: {
        enableVoiceChat: boolean;
        enableGestures: boolean;
        enableEyeTracking: boolean;
        enableHandTracking: boolean;
        renderQuality: 'low' | 'medium' | 'high' | 'ultra';
    };
}

export interface XRInteractionEvent {
    type: 'select' | 'squeeze' | 'move' | 'rotate' | 'scale';
    userId: string;
    position: [number, number, number];
    rotation: [number, number, number, number];
    intensity: number;
    targetId?: string;
}

// WebSocket message types
interface WebSocketMessage {
    type: string;
    [key: string]: any;
}

const G3DXRCollaboration: React.FC<XRCollaborationProps> = ({
    sessionId,
    userId,
    projectId,
    enableVR = true,
    enableAR = true,
    enableG3DAcceleration = true,
    onAnnotationCreate,
    onAnnotationUpdate,
    onAnnotationDelete,
    onUserJoin,
    onUserLeave
}) => {
    // State management
    const [session, setSession] = useState<CollaborationSession | null>(null);
    const [isXRSupported, setIsXRSupported] = useState(false);
    const [isXRActive, setIsXRActive] = useState(false);
    const [currentMode, setCurrentMode] = useState<'vr' | 'ar' | 'desktop'>('desktop');
    const [users, setUsers] = useState<CollaborationUser[]>([]);
    const [annotations, setAnnotations] = useState<XRAnnotation[]>([]);
    const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Refs for XR components
    const xrSessionRef = useRef<any>(null);
    const rendererRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);

    // G3D components
    const gpuComputeRef = useRef<GPUCompute | null>(null);
    const xrAnnotationRef = useRef<XRAnnotationSystem | null>(null);
    const collaborationEngineRef = useRef<CollaborationEngine | null>(null);

    // WebSocket connection for real-time collaboration
    const wsRef = useRef<WebSocket | null>(null);

    /**
     * Initialize XR collaboration system
     */
    useEffect(() => {
        initializeXRCollaboration();
        return () => {
            cleanup();
        };
    }, []);

    /**
     * Initialize XR collaboration components
     */
    const initializeXRCollaboration = async (): Promise<void> => {
        try {
            setIsLoading(true);

            // Initialize G3D components
            if (enableG3DAcceleration) {
                gpuComputeRef.current = new GPUCompute();
                xrAnnotationRef.current = new XRAnnotationSystem();
                collaborationEngineRef.current = new CollaborationEngine();

                await gpuComputeRef.current.init();
                await xrAnnotationRef.current.initialize();
                await collaborationEngineRef.current.initialize();
            }

            // Check XR support
            const xrSupported = await checkXRSupport();
            setIsXRSupported(xrSupported);

            // Initialize WebSocket connection
            await initializeWebSocket();

            // Setup XR session if supported
            if (xrSupported) {
                await setupXRSession();
            }

            // Initialize desktop fallback
            await initializeDesktopMode();

            setIsLoading(false);
            console.log('XR Collaboration initialized successfully');

        } catch (error) {
            console.error('Failed to initialize XR collaboration:', error);
            setIsLoading(false);
        }
    };

    /**
     * Check WebXR support
     */
    const checkXRSupport = async (): Promise<boolean> => {
        try {
            if (!navigator.xr) {
                console.warn('WebXR not supported');
                return false;
            }

            const vrSupported = enableVR && await navigator.xr.isSessionSupported('immersive-vr');
            const arSupported = enableAR && await navigator.xr.isSessionSupported('immersive-ar');

            console.log(`XR Support - VR: ${vrSupported}, AR: ${arSupported}`);
            return vrSupported || arSupported;

        } catch (error) {
            console.error('Error checking XR support:', error);
            return false;
        }
    };

    /**
     * Initialize WebSocket connection for real-time collaboration
     */
    const initializeWebSocket = async (): Promise<void> => {
        try {
            const wsUrl = `ws://localhost:8080/collaboration/${sessionId}`;
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
                // Join session
                sendMessage({
                    type: 'join_session',
                    userId,
                    sessionId,
                    projectId
                });
            };

            wsRef.current.onmessage = (event) => {
                const message: WebSocketMessage = JSON.parse(event.data);
                handleWebSocketMessage(message);
            };

            wsRef.current.onclose = () => {
                console.log('WebSocket disconnected');
                // Attempt reconnection
                setTimeout(initializeWebSocket, 5000);
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
        }
    };

    /**
     * Handle WebSocket messages
     */
    const handleWebSocketMessage = (message: WebSocketMessage): void => {
        switch (message.type) {
            case 'user_joined':
                handleUserJoined(message.user);
                break;
            case 'user_left':
                handleUserLeft(message.userId);
                break;
            case 'user_moved':
                handleUserMoved(message.userId, message.position, message.rotation);
                break;
            case 'annotation_created':
                handleAnnotationCreated(message.annotation);
                break;
            case 'annotation_updated':
                handleAnnotationUpdated(message.annotation);
                break;
            case 'annotation_deleted':
                handleAnnotationDeleted(message.annotationId);
                break;
            case 'session_state':
                handleSessionState(message.session);
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    };

    /**
     * Setup XR session
     */
    const setupXRSession = async (): Promise<void> => {
        try {
            // This would be implemented with actual WebXR API
            console.log('Setting up XR session...');

            // Initialize XR renderer with G3D acceleration
            if (xrAnnotationRef.current) {
                await xrAnnotationRef.current.setupXRSession({
                    mode: enableVR ? 'immersive-vr' : 'immersive-ar',
                    enableG3DAcceleration,
                    renderQuality: 'high'
                });
            }

        } catch (error) {
            console.error('Failed to setup XR session:', error);
        }
    };

    /**
     * Initialize desktop mode fallback
     */
    const initializeDesktopMode = async (): Promise<void> => {
        try {
            console.log('Initializing desktop mode...');

            // Setup 3D scene for desktop viewing
            if (collaborationEngineRef.current) {
                await collaborationEngineRef.current.setupDesktopMode({
                    enableG3DAcceleration,
                    renderQuality: 'high'
                });
            }

        } catch (error) {
            console.error('Failed to initialize desktop mode:', error);
        }
    };

    /**
     * Start VR session
     */
    const startVRSession = async (): Promise<void> => {
        try {
            if (!navigator.xr) {
                throw new Error('WebXR not supported');
            }

            const session = await navigator.xr.requestSession('immersive-vr', {
                requiredFeatures: ['hand-tracking', 'eye-tracking'],
                optionalFeatures: ['voice-input', 'spatial-tracking']
            });

            xrSessionRef.current = session;
            setIsXRActive(true);
            setCurrentMode('vr');

            // Setup XR frame loop
            session.requestAnimationFrame(onXRFrame);

            // Send session start event
            sendMessage({
                type: 'session_started',
                userId,
                mode: 'vr'
            });

            console.log('VR session started');

        } catch (error) {
            console.error('Failed to start VR session:', error);
        }
    };

    /**
     * Start AR session
     */
    const startARSession = async (): Promise<void> => {
        try {
            if (!navigator.xr) {
                throw new Error('WebXR not supported');
            }

            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test', 'plane-detection'],
                optionalFeatures: ['hand-tracking', 'eye-tracking']
            });

            xrSessionRef.current = session;
            setIsXRActive(true);
            setCurrentMode('ar');

            // Setup XR frame loop
            session.requestAnimationFrame(onXRFrame);

            // Send session start event
            sendMessage({
                type: 'session_started',
                userId,
                mode: 'ar'
            });

            console.log('AR session started');

        } catch (error) {
            console.error('Failed to start AR session:', error);
        }
    };

    /**
     * End XR session
     */
    const endXRSession = async (): Promise<void> => {
        try {
            if (xrSessionRef.current) {
                await xrSessionRef.current.end();
                xrSessionRef.current = null;
            }

            setIsXRActive(false);
            setCurrentMode('desktop');

            // Send session end event
            sendMessage({
                type: 'session_ended',
                userId
            });

            console.log('XR session ended');

        } catch (error) {
            console.error('Failed to end XR session:', error);
        }
    };

    /**
     * XR frame loop
     */
    const onXRFrame = (time: number, frame: any): void => {
        if (!xrSessionRef.current || !frame) return;

        try {
            // Update user tracking data
            updateUserTracking(frame);

            // Render frame with G3D acceleration
            if (xrAnnotationRef.current) {
                xrAnnotationRef.current.renderFrame(frame, {
                    annotations,
                    users,
                    selectedAnnotation
                });
            }

            // Request next frame
            xrSessionRef.current.requestAnimationFrame(onXRFrame);

        } catch (error) {
            console.error('Error in XR frame loop:', error);
        }
    };

    /**
     * Update user tracking data
     */
    const updateUserTracking = (frame: any): void => {
        try {
            // Get head pose
            const headPose = frame.getViewerPose?.();
            if (headPose) {
                const position = headPose.transform.position;
                const orientation = headPose.transform.orientation;

                // Send user movement update
                sendMessage({
                    type: 'user_moved',
                    userId,
                    position: [position.x, position.y, position.z],
                    rotation: [orientation.x, orientation.y, orientation.z, orientation.w],
                    timestamp: Date.now()
                });
            }

            // Get hand poses if available
            const inputSources = frame.session.inputSources;
            if (inputSources) {
                for (const inputSource of inputSources) {
                    if (inputSource.hand) {
                        updateHandTracking(inputSource);
                    }
                }
            }

        } catch (error) {
            console.error('Error updating user tracking:', error);
        }
    };

    /**
     * Update hand tracking data
     */
    const updateHandTracking = (inputSource: any): void => {
        try {
            const hand = inputSource.hand;
            const handedness = inputSource.handedness; // 'left' or 'right'

            // Process hand joints
            if (hand && hand.entries) {
                for (const [jointName, joint] of hand.entries()) {
                    if (joint) {
                        // Update hand position and rotation
                        // This would be sent to other users for visualization
                        console.log(`Hand ${handedness} ${jointName}:`, joint);
                    }
                }
            }

        } catch (error) {
            console.error('Error updating hand tracking:', error);
        }
    };

    /**
     * Handle XR input events
     */
    const handleXRInput = useCallback((event: XRInteractionEvent): void => {
        try {
            switch (event.type) {
                case 'select':
                    handleXRSelect(event);
                    break;
                case 'squeeze':
                    handleXRSqueeze(event);
                    break;
                case 'move':
                    handleXRMove(event);
                    break;
                default:
                    console.warn('Unknown XR input event:', event.type);
            }

        } catch (error) {
            console.error('Error handling XR input:', error);
        }
    }, [annotations, selectedAnnotation]);

    /**
     * Handle XR select event (primary button)
     */
    const handleXRSelect = (event: XRInteractionEvent): void => {
        try {
            if (event.targetId) {
                // Select existing annotation
                setSelectedAnnotation(event.targetId);

                sendMessage({
                    type: 'annotation_selected',
                    userId,
                    annotationId: event.targetId
                });
            } else {
                // Create new annotation
                createAnnotation(event.position, event.rotation);
            }

        } catch (error) {
            console.error('Error handling XR select:', error);
        }
    };

    /**
     * Handle XR squeeze event (grip button)
     */
    const handleXRSqueeze = (event: XRInteractionEvent): void => {
        try {
            if (selectedAnnotation && event.targetId === selectedAnnotation) {
                // Delete selected annotation
                deleteAnnotation(selectedAnnotation);
            }

        } catch (error) {
            console.error('Error handling XR squeeze:', error);
        }
    };

    /**
     * Handle XR move event
     */
    const handleXRMove = (event: XRInteractionEvent): void => {
        try {
            if (selectedAnnotation && event.targetId === selectedAnnotation) {
                // Move selected annotation
                updateAnnotationPosition(selectedAnnotation, event.position, event.rotation);
            }

        } catch (error) {
            console.error('Error handling XR move:', error);
        }
    };

    /**
     * Create new annotation
     */
    const createAnnotation = (position: [number, number, number], rotation: [number, number, number, number]): void => {
        try {
            const annotation: XRAnnotation = {
                id: `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'point',
                position,
                orientation: rotation,
                scale: [1, 1, 1],
                data: {},
                metadata: {
                    createdBy: userId,
                    createdAt: new Date(),
                    updatedBy: userId,
                    updatedAt: new Date(),
                    confidence: 1.0,
                    tags: []
                }
            };

            setAnnotations(prev => [...prev, annotation]);
            setSelectedAnnotation(annotation.id);

            // Send to other users
            sendMessage({
                type: 'annotation_created',
                annotation
            });

            // Trigger callback
            onAnnotationCreate?.(annotation);

            console.log('Created annotation:', annotation.id);

        } catch (error) {
            console.error('Error creating annotation:', error);
        }
    };

    /**
     * Update annotation position
     */
    const updateAnnotationPosition = (
        annotationId: string,
        position: [number, number, number],
        rotation: [number, number, number, number]
    ): void => {
        try {
            setAnnotations(prev => prev.map(annotation => {
                if (annotation.id === annotationId) {
                    const updated = {
                        ...annotation,
                        position,
                        orientation: rotation,
                        metadata: {
                            ...annotation.metadata,
                            updatedBy: userId,
                            updatedAt: new Date()
                        }
                    };

                    // Send to other users
                    sendMessage({
                        type: 'annotation_updated',
                        annotation: updated
                    });

                    // Trigger callback
                    onAnnotationUpdate?.(updated);

                    return updated;
                }
                return annotation;
            }));

        } catch (error) {
            console.error('Error updating annotation position:', error);
        }
    };

    /**
     * Delete annotation
     */
    const deleteAnnotation = (annotationId: string): void => {
        try {
            setAnnotations(prev => prev.filter(annotation => annotation.id !== annotationId));
            setSelectedAnnotation(null);

            // Send to other users
            sendMessage({
                type: 'annotation_deleted',
                annotationId
            });

            // Trigger callback
            onAnnotationDelete?.(annotationId);

            console.log('Deleted annotation:', annotationId);

        } catch (error) {
            console.error('Error deleting annotation:', error);
        }
    };

    /**
     * Send WebSocket message
     */
    const sendMessage = (message: WebSocketMessage): void => {
        try {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify(message));
            }
        } catch (error) {
            console.error('Error sending WebSocket message:', error);
        }
    };

    // WebSocket event handlers
    const handleUserJoined = (user: CollaborationUser): void => {
        setUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
        onUserJoin?.(user);
        console.log('User joined:', user.name);
    };

    const handleUserLeft = (userId: string): void => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        onUserLeave?.(userId);
        console.log('User left:', userId);
    };

    const handleUserMoved = (
        userId: string,
        position: [number, number, number],
        rotation: [number, number, number, number]
    ): void => {
        setUsers(prev => prev.map(user => {
            if (user.id === userId) {
                return {
                    ...user,
                    headPosition: position,
                    headRotation: rotation
                };
            }
            return user;
        }));
    };

    const handleAnnotationCreated = (annotation: XRAnnotation): void => {
        setAnnotations(prev => [...prev, annotation]);
        onAnnotationCreate?.(annotation);
    };

    const handleAnnotationUpdated = (annotation: XRAnnotation): void => {
        setAnnotations(prev => prev.map(a => a.id === annotation.id ? annotation : a));
        onAnnotationUpdate?.(annotation);
    };

    const handleAnnotationDeleted = (annotationId: string): void => {
        setAnnotations(prev => prev.filter(a => a.id !== annotationId));
        onAnnotationDelete?.(annotationId);
    };

    const handleSessionState = (sessionData: CollaborationSession): void => {
        setSession(sessionData);
        setUsers(sessionData.users);
        setAnnotations(sessionData.annotations);
    };

    /**
     * Cleanup resources
     */
    const cleanup = async (): Promise<void> => {
        try {
            // End XR session
            if (xrSessionRef.current) {
                await xrSessionRef.current.end();
            }

            // Close WebSocket
            if (wsRef.current) {
                wsRef.current.close();
            }

            // Cleanup G3D components
            if (gpuComputeRef.current) {
                await gpuComputeRef.current.cleanup();
            }
            if (xrAnnotationRef.current) {
                await xrAnnotationRef.current.cleanup();
            }
            if (collaborationEngineRef.current) {
                await collaborationEngineRef.current.cleanup();
            }

            console.log('XR Collaboration cleanup completed');

        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    };

    // Render UI
    return (
        <div className="g3d-xr-collaboration">
            {isLoading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Initializing XR Collaboration...</p>
                </div>
            ) : (
                <>
                    {/* XR Controls */}
                    <div className="xr-controls">
                        <div className="mode-selector">
                            <button
                                onClick={() => setCurrentMode('desktop')}
                                className={currentMode === 'desktop' ? 'active' : ''}
                            >
                                Desktop
                            </button>
                            {isXRSupported && enableVR && (
                                <button
                                    onClick={isXRActive ? endXRSession : startVRSession}
                                    className={currentMode === 'vr' ? 'active' : ''}
                                >
                                    {isXRActive && currentMode === 'vr' ? 'Exit VR' : 'Enter VR'}
                                </button>
                            )}
                            {isXRSupported && enableAR && (
                                <button
                                    onClick={isXRActive ? endXRSession : startARSession}
                                    className={currentMode === 'ar' ? 'active' : ''}
                                >
                                    {isXRActive && currentMode === 'ar' ? 'Exit AR' : 'Enter AR'}
                                </button>
                            )}
                        </div>

                        {/* Session Info */}
                        <div className="session-info">
                            <span>Session: {sessionId}</span>
                            <span>Users: {users.length}</span>
                            <span>Annotations: {annotations.length}</span>
                        </div>
                    </div>

                    {/* User List */}
                    <div className="user-list">
                        <h3>Active Users</h3>
                        {users.map(user => (
                            <div key={user.id} className={`user-item ${user.isActive ? 'active' : 'inactive'}`}>
                                <img src={user.avatar} alt={user.name} className="user-avatar" />
                                <span className="user-name">{user.name}</span>
                                <span className="user-role">{user.role}</span>
                            </div>
                        ))}
                    </div>

                    {/* Annotation List */}
                    <div className="annotation-list">
                        <h3>Annotations</h3>
                        {annotations.map(annotation => (
                            <div
                                key={annotation.id}
                                className={`annotation-item ${selectedAnnotation === annotation.id ? 'selected' : ''}`}
                                onClick={() => setSelectedAnnotation(annotation.id)}
                            >
                                <span className="annotation-type">{annotation.type}</span>
                                <span className="annotation-creator">{annotation.metadata.createdBy}</span>
                                <span className="annotation-confidence">{(annotation.metadata.confidence * 100).toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>

                    {/* XR Canvas */}
                    <div className="xr-canvas-container">
                        <canvas
                            ref={rendererRef}
                            className="xr-canvas"
                            width={800}
                            height={600}
                        />
                    </div>
                </>
            )}

            <style>{`
                .g3d-xr-collaboration {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: #1a1a1a;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    border-top: 4px solid #4CAF50;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 16px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .xr-controls {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    right: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    background: rgba(0, 0, 0, 0.8);
                    border-radius: 8px;
                    backdrop-filter: blur(10px);
                }

                .mode-selector {
                    display: flex;
                    gap: 8px;
                }

                .mode-selector button {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .mode-selector button:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .mode-selector button.active {
                    background: #4CAF50;
                }

                .session-info {
                    display: flex;
                    gap: 16px;
                    font-size: 14px;
                    color: #aaa;
                }

                .user-list {
                    position: absolute;
                    top: 100px;
                    left: 20px;
                    width: 200px;
                    background: rgba(0, 0, 0, 0.8);
                    border-radius: 8px;
                    padding: 16px;
                    backdrop-filter: blur(10px);
                }

                .user-list h3 {
                    margin: 0 0 12px 0;
                    font-size: 16px;
                    color: white;
                }

                .user-item {
                    display: flex;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .user-item:last-child {
                    border-bottom: none;
                }

                .user-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    margin-right: 8px;
                }

                .user-name {
                    flex: 1;
                    font-size: 14px;
                }

                .user-role {
                    font-size: 12px;
                    color: #4CAF50;
                }

                .annotation-list {
                    position: absolute;
                    top: 100px;
                    right: 20px;
                    width: 300px;
                    background: rgba(0, 0, 0, 0.8);
                    border-radius: 8px;
                    padding: 16px;
                    backdrop-filter: blur(10px);
                }

                .annotation-list h3 {
                    margin: 0 0 12px 0;
                    font-size: 16px;
                    color: white;
                }

                .annotation-item {
                    display: flex;
                    align-items: center;
                    padding: 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .annotation-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .annotation-item.selected {
                    background: #4CAF50;
                }

                .annotation-type {
                    font-size: 12px;
                    text-transform: uppercase;
                    color: #4CAF50;
                    margin-right: 8px;
                }

                .annotation-creator {
                    flex: 1;
                    font-size: 14px;
                }

                .annotation-confidence {
                    font-size: 12px;
                    color: #aaa;
                }

                .xr-canvas-container {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .xr-canvas {
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    background: #000;
                }
            `}</style>
        </div>
    );
};

export default G3DXRCollaboration;