/**
 * G3D XR Annotation System - VR/AR Annotation Support
 * 
 * Advanced Extended Reality (XR) annotation system supporting both
 * Virtual Reality (VR) and Augmented Reality (AR) environments.
 * 
 * Features:
 * - WebXR API integration
 * - 3D spatial annotations in VR/AR
 * - Hand tracking and gesture recognition
 * - Voice input and speech recognition
 * - Immersive annotation interfaces
 * - Cross-platform XR device support
 * - Real-time collaboration in XR
 * - Haptic feedback integration
 * 
 * Part of G3D AnnotateAI MVP - Phase 0.3 Advanced 3D Systems
 * Enables immersive annotation experiences in VR/AR environments
 */

import { EventEmitter } from 'events';

// Core XR interfaces
export interface XRAnnotationConfig {
    supportedModes: XRSessionMode[];
    enableHandTracking: boolean;
    enableVoiceInput: boolean;
    enableHapticFeedback: boolean;
    enableCollaboration: boolean;
    maxConcurrentUsers: number;
    annotationPersistence: boolean;
    spatialAnchorSupport: boolean;
}

export enum XRSessionMode {
    IMMERSIVE_VR = 'immersive-vr',
    IMMERSIVE_AR = 'immersive-ar',
    INLINE = 'inline'
}

export interface XRAnnotationData {
    id: string;
    type: XRAnnotationType;
    position: XRVector3;
    rotation: XRQuaternion;
    scale: XRVector3;
    content: XRAnnotationContent;
    metadata: XRAnnotationMetadata;
    spatial: XRSpatialData;
    created: number;
    modified: number;
    author: string;
    visible: boolean;
    locked: boolean;
}

export enum XRAnnotationType {
    TEXT_3D = 'text_3d',
    VOICE_NOTE = 'voice_note',
    SPATIAL_MARKER = 'spatial_marker',
    GESTURE_ANNOTATION = 'gesture_annotation',
    HOLOGRAPHIC_MODEL = 'holographic_model',
    MEASUREMENT = 'measurement',
    COLLABORATIVE_POINTER = 'collaborative_pointer',
    IMMERSIVE_PANEL = 'immersive_panel'
}

export interface XRAnnotationContent {
    text?: string;
    audioUrl?: string;
    modelUrl?: string;
    imageUrl?: string;
    videoUrl?: string;
    gestureData?: XRGestureData;
    measurementData?: XRMeasurementData;
    customData?: any;
}

export interface XRAnnotationMetadata {
    tags: Set<string>;
    priority: XRPriority;
    visibility: XRVisibilityMode;
    interactionMode: XRInteractionMode;
    lifetime: number; // milliseconds, 0 = permanent
    permissions: XRPermissions;
}

export enum XRPriority {
    LOW = 1,
    NORMAL = 2,
    HIGH = 3,
    CRITICAL = 4
}

export enum XRVisibilityMode {
    ALWAYS = 'always',
    PROXIMITY = 'proximity',
    ON_DEMAND = 'on_demand',
    CONTEXT_AWARE = 'context_aware'
}

export enum XRInteractionMode {
    GAZE = 'gaze',
    HAND_TRACKING = 'hand_tracking',
    CONTROLLER = 'controller',
    VOICE = 'voice',
    GESTURE = 'gesture',
    MULTI_MODAL = 'multi_modal'
}

export interface XRPermissions {
    canView: string[];
    canEdit: string[];
    canDelete: string[];
    isPublic: boolean;
}

export interface XRSpatialData {
    anchorId?: string;
    worldPosition: XRVector3;
    worldRotation: XRQuaternion;
    trackingState: XRTrackingState;
    confidence: number; // 0-1
    roomScale: boolean;
    floorLevel?: number;
}

export enum XRTrackingState {
    TRACKING = 'tracking',
    LIMITED = 'limited',
    NOT_TRACKING = 'not_tracking'
}

export interface XRVector3 {
    x: number;
    y: number;
    z: number;
}

export interface XRQuaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}

export interface XRGestureData {
    gestureType: XRGestureType;
    handedness: XRHandedness;
    confidence: number;
    keyPoints: XRVector3[];
    duration: number;
}

export enum XRGestureType {
    POINT = 'point',
    GRAB = 'grab',
    PINCH = 'pinch',
    SWIPE = 'swipe',
    CIRCLE = 'circle',
    CUSTOM = 'custom'
}

export enum XRHandedness {
    LEFT = 'left',
    RIGHT = 'right',
    BOTH = 'both'
}

export interface XRMeasurementData {
    measurementType: XRMeasurementType;
    points: XRVector3[];
    value: number;
    unit: string;
    accuracy: number;
}

export enum XRMeasurementType {
    DISTANCE = 'distance',
    AREA = 'area',
    VOLUME = 'volume',
    ANGLE = 'angle'
}

export interface XRUser {
    id: string;
    displayName: string;
    avatar?: XRAvatar;
    position: XRVector3;
    rotation: XRQuaternion;
    headPose: XRRigidTransform;
    handPoses: Map<XRHandedness, XRHandPose>;
    isPresent: boolean;
    lastUpdate: number;
}

export interface XRAvatar {
    modelUrl: string;
    scale: XRVector3;
    animations: Map<string, string>;
    currentAnimation?: string;
}

export interface XRHandPose {
    position: XRVector3;
    rotation: XRQuaternion;
    joints: Map<string, XRJointPose>;
    gesture?: XRGestureType;
}

export interface XRJointPose {
    position: XRVector3;
    rotation: XRQuaternion;
    radius: number;
}

export interface XRRigidTransform {
    position: XRVector3;
    orientation: XRQuaternion;
}

export interface XRInputSource {
    handedness: XRHandedness;
    targetRayMode: XRTargetRayMode;
    targetRaySpace: any; // XRSpace
    gripSpace?: any; // XRSpace
    gamepad?: Gamepad;
    hand?: any; // XRHand
}

export enum XRTargetRayMode {
    GAZE = 'gaze',
    TRACKED_POINTER = 'tracked-pointer',
    SCREEN = 'screen'
}

/**
 * Advanced XR Annotation System
 * Provides immersive annotation capabilities for VR/AR environments
 */
export class XRAnnotation extends EventEmitter {
    private session: any | null = null; // XRSession
    private referenceSpace: any | null = null; // XRReferenceSpace
    private renderer: any | null = null; // WebGL renderer
    private scene: any | null = null; // 3D scene
    private camera: any | null = null; // XR camera

    private config: XRAnnotationConfig;
    private annotations: Map<string, XRAnnotationData> = new Map();
    private users: Map<string, XRUser> = new Map();
    private inputSources: Map<string, XRInputSource> = new Map();

    private isXRSupported = false;
    private isSessionActive = false;
    private currentMode: XRSessionMode | null = null;

    // XR-specific systems
    private handTracker: XRHandTracker;
    private voiceRecognizer: XRVoiceRecognizer;
    private gestureRecognizer: XRGestureRecognizer;
    private spatialAnchorManager: XRSpatialAnchorManager;
    private collaborationManager: XRCollaborationManager;
    private hapticManager: XRHapticManager;

    // Annotation UI
    private annotationRenderer: XRAnnotationRenderer;
    private uiManager: XRUIManager;

    private frameId: number = 0;
    private lastFrameTime = 0;

    constructor(config: Partial<XRAnnotationConfig> = {}) {
        super();

        this.config = {
            supportedModes: [XRSessionMode.IMMERSIVE_VR, XRSessionMode.IMMERSIVE_AR],
            enableHandTracking: true,
            enableVoiceInput: true,
            enableHapticFeedback: true,
            enableCollaboration: true,
            maxConcurrentUsers: 8,
            annotationPersistence: true,
            spatialAnchorSupport: true,
            ...config
        };

        this.handTracker = new XRHandTracker();
        this.voiceRecognizer = new XRVoiceRecognizer();
        this.gestureRecognizer = new XRGestureRecognizer();
        this.spatialAnchorManager = new XRSpatialAnchorManager();
        this.collaborationManager = new XRCollaborationManager();
        this.hapticManager = new XRHapticManager();
        this.annotationRenderer = new XRAnnotationRenderer();
        this.uiManager = new XRUIManager();

        this.initialize?.();
    }

    /**
     * Initialize XR annotation system
     */
    private async initialize(): Promise<void> {
        try {
            // Check WebXR support
            if ('xr' in navigator) {
                this.isXRSupported = true;
                await this.checkXRSupport();
            } else {
                console.warn('WebXR not supported in this browser');
                this.emit('xrNotSupported');
                return;
            }

            // Initialize subsystems
            await this.initializeSubsystems();

            this.emit('initialized');

        } catch (error) {
            console.error('XR initialization failed:', error);
            this.emit('error', error);
        }
    }

    /**
     * Check XR device support
     */
    private async checkXRSupport(): Promise<void> {
        const supportedModes: XRSessionMode[] = [];

        for (const mode of this.config.supportedModes) {
            try {
                const supported = await (navigator as any).xr.isSessionSupported(mode);
                if (supported) {
                    supportedModes.push(mode);
                }
            } catch (error) {
                console.warn(`XR mode ${mode} not supported:`, error);
            }
        }

        if (supportedModes.length === 0) {
            throw new Error('No supported XR modes available');
        }

        this.config.supportedModes = supportedModes;
        this.emit('xrSupportChecked', supportedModes);
    }

    /**
     * Initialize XR subsystems
     */
    private async initializeSubsystems(): Promise<void> {
        if (this.config.enableHandTracking) {
            if ((this.handTracker as any).init) {
                await (this.handTracker as any).init();
            }
        }

        if (this.config.enableVoiceInput) {
            if ((this.voiceRecognizer as any).init) {
                await (this.voiceRecognizer as any).init();
            }
        }

        if (this.config.enableCollaboration) {
            if ((this.collaborationManager as any).init) {
                await (this.collaborationManager as any).init();
            }
        }

        if (this.config.spatialAnchorSupport) {
            if ((this.spatialAnchorManager as any).init) {
                await (this.spatialAnchorManager as any).init();
            }
        }

        if ((this.annotationRenderer as any).init) {
            await (this.annotationRenderer as any).init();
        }
        if ((this.uiManager as any).init) {
            await (this.uiManager as any).init();
        }
    }

    /**
     * Start XR session
     */
    public async startSession(mode: XRSessionMode, canvas: HTMLCanvasElement): Promise<void> {
        if (!this.isXRSupported) {
            throw new Error('XR not supported');
        }

        if (this.isSessionActive) {
            throw new Error('XR session already active');
        }

        try {
            // Request XR session
            const sessionInit: any = {
                requiredFeatures: ['local-floor'],
                optionalFeatures: []
            };

            if (this.config.enableHandTracking) {
                sessionInit.optionalFeatures.push('hand-tracking');
            }

            if (this.config.spatialAnchorSupport) {
                sessionInit.optionalFeatures.push('anchors');
            }

            this.session = await (navigator as any).xr.requestSession(mode, sessionInit);
            this.currentMode = mode;

            // Set up WebGL context
            const gl = canvas.getContext('webgl2', { xrCompatible: true });
            if (!gl) {
                throw new Error('WebGL2 not supported');
            }

            await this.session.updateRenderState({
                baseLayer: new (window as any).XRWebGLLayer(this.session, gl)
            });

            // Get reference space
            this.referenceSpace = await this.session.requestReferenceSpace('local-floor');

            // Set up event listeners
            this.setupSessionEventListeners();

            // Start render loop
            this.session.requestAnimationFrame(this.onXRFrame.bind(this));

            this.isSessionActive = true;
            this.emit('sessionStarted', mode);

        } catch (error) {
            console.error('Failed to start XR session:', error);
            this.emit('sessionError', error);
            throw error;
        }
    }

    /**
     * End XR session
     */
    public async endSession(): Promise<void> {
        if (!this.isSessionActive || !this.session) {
            return;
        }

        try {
            await this.session.end();
        } catch (error) {
            console.error('Error ending XR session:', error);
        }

        this.cleanup?.();
    }

    /**
     * Initialize XR annotation system (alias for compatibility)
     */
    async init(): Promise<void> {
        return this.initialize();
    }

    /**
     * Called when XR session starts
     */
    onSessionStart(): void {
        this.emit('sessionStarted', this.currentMode);
    }

    /**
     * Called when XR session ends
     */
    onSessionEnd(): void {
        this.isSessionActive = false;
        this.session = null;
        this.referenceSpace = null;
        this.emit('sessionEnded');
    }

    /**
     * Setup XR session event listeners
     */
    private setupSessionEventListeners(): void {
        if (!this.session) return;

        this.session.addEventListener('end', () => {
            this.cleanup?.();
            this.emit('sessionEnded');
        });

        this.session.addEventListener('inputsourceschange', (event: any) => {
            this.handleInputSourcesChange(event);
        });

        this.session.addEventListener('select', (event: any) => {
            this.handleSelect(event);
        });

        this.session.addEventListener('selectstart', (event: any) => {
            this.handleSelectStart(event);
        });

        this.session.addEventListener('selectend', (event: any) => {
            this.handleSelectEnd(event);
        });
    }

    /**
     * XR frame callback
     */
    private onXRFrame(time: number, frame: any): void {
        if (!this.session || !this.referenceSpace) return;

        const deltaTime = time - this.lastFrameTime;
        this.lastFrameTime = time;

        try {
            // Get viewer pose
            const pose = frame.getViewerPose(this.referenceSpace);
            if (!pose) {
                this.session.requestAnimationFrame(this.onXRFrame.bind(this));
                return;
            }

            // Update input sources
            this.updateInputSources(frame);

            // Update hand tracking
            if (this.config.enableHandTracking) {
                this.updateHandTracking(frame);
            }

            // Update gesture recognition
            this.updateGestureRecognition(deltaTime);

            // Update voice recognition
            if (this.config.enableVoiceInput) {
                this.updateVoiceRecognition();
            }

            // Update annotations
            this.updateAnnotations(pose, deltaTime);

            // Update collaboration
            if (this.config.enableCollaboration) {
                this.updateCollaboration(pose);
            }

            // Render frame
            this.renderFrame?.(pose, frame);

            this.frameId++;

        } catch (error) {
            console.error('XR frame error:', error);
            this.emit('frameError', error);
        }

        // Request next frame
        this.session.requestAnimationFrame(this.onXRFrame.bind(this));
    }

    /**
     * Update input sources
     */
    private updateInputSources(frame: any): void {
        if (!this.session) return;

        for (const inputSource of this.session.inputSources) {
            const sourceId = this.getInputSourceId(inputSource);

            if (!this.inputSources.has(sourceId)) {
                this.inputSources.set(sourceId, {
                    handedness: inputSource.handedness,
                    targetRayMode: inputSource.targetRayMode,
                    targetRaySpace: inputSource.targetRaySpace,
                    gripSpace: inputSource.gripSpace,
                    gamepad: inputSource.gamepad,
                    hand: inputSource.hand
                });
            }

            // Update input source data
            const source = this.inputSources.get(sourceId)!;
            source.gamepad = inputSource.gamepad;
            source.hand = inputSource.hand;
        }
    }

    /**
     * Update hand tracking
     */
    private updateHandTracking(frame: any): void {
        this.inputSources.forEach((inputSource, sourceId) => {
            if (inputSource.hand) {
                const handPose = this.handTracker.updateHand(inputSource.hand, frame, this.referenceSpace);
                if (handPose) {
                    this.emit('handPoseUpdated', inputSource.handedness, handPose);
                }
            }
        });
    }

    /**
     * Update gesture recognition
     */
    private updateGestureRecognition(deltaTime: number): void {
        const gestures = this.gestureRecognizer.update(deltaTime);
        for (const gesture of gestures) {
            this.handleGesture(gesture);
        }
    }

    /**
     * Update voice recognition
     */
    private updateVoiceRecognition(): void {
        const voiceCommands = this.voiceRecognizer.getRecognizedCommands();
        for (const command of voiceCommands) {
            this.handleVoiceCommand(command);
        }
    }

    /**
     * Update annotations
     */
    private updateAnnotations(pose: any, deltaTime: number): void {
        const viewerPosition = pose.transform.position;
        const viewerRotation = pose.transform.orientation;

        this.annotations.forEach((annotation, id) => {
            // Update visibility based on proximity and context
            this.updateAnnotationVisibility(annotation, viewerPosition);

            // Update spatial tracking
            this.updateAnnotationSpatialData(annotation);

            // Handle lifetime expiration
            if (annotation.metadata.lifetime > 0) {
                const age = Date.now() - annotation.created;
                if (age > annotation.metadata.lifetime) {
                    this.removeAnnotation(id);
                }
            }
        });
    }

    /**
     * Update collaboration
     */
    private updateCollaboration(pose: any): void {
        if (!this.config.enableCollaboration) return;

        // Update local user pose
        const localUser = this.users.get('local');
        if (localUser) {
            localUser.position = pose.transform.position;
            localUser.rotation = pose.transform.orientation;
            localUser.headPose = pose.transform;
            localUser.lastUpdate = Date.now();
        }

        // Sync with remote users
        this.collaborationManager.updateUsers(this.users);
    }

    /**
     * Render XR frame
     */
    private renderFrame(pose: any, frame: any): void {
        const gl = this.session.renderState.baseLayer.context;
        const layer = this.session.renderState.baseLayer;

        // Clear framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Render for each eye
        for (const view of pose.views) {
            const viewport = layer.getViewport(view);
            gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

            // Set up view matrices
            const viewMatrix = view.transform.inverse.matrix;
            const projectionMatrix = view.projectionMatrix;

            // Render annotations
            this.annotationRenderer.render(
                this.annotations,
                viewMatrix,
                projectionMatrix,
                view.transform.position
            );

            // Render UI
            this.uiManager.render(viewMatrix, projectionMatrix);

            // Render collaboration avatars
            if (this.config.enableCollaboration) {
                this.renderCollaborationAvatars?.(viewMatrix, projectionMatrix);
            }
        }
    }

    /**
     * Create annotation
     */
    public createAnnotation(
        type: XRAnnotationType,
        position: XRVector3,
        content: XRAnnotationContent,
        metadata: Partial<XRAnnotationMetadata> = {}
    ): string {
        const id = `xr-annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const annotation: XRAnnotationData = {
            id,
            type,
            position,
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            scale: { x: 1, y: 1, z: 1 },
            content,
            metadata: {
                tags: new Set(metadata.tags || []),
                priority: metadata.priority || XRPriority.NORMAL,
                visibility: metadata.visibility || XRVisibilityMode.ALWAYS,
                interactionMode: metadata.interactionMode || XRInteractionMode.MULTI_MODAL,
                lifetime: metadata.lifetime || 0,
                permissions: metadata.permissions || {
                    canView: ['*'],
                    canEdit: ['*'],
                    canDelete: ['*'],
                    isPublic: true
                }
            },
            spatial: {
                worldPosition: position,
                worldRotation: { x: 0, y: 0, z: 0, w: 1 },
                trackingState: XRTrackingState.TRACKING,
                confidence: 1.0,
                roomScale: this.currentMode === XRSessionMode.IMMERSIVE_VR
            },
            created: Date.now(),
            modified: Date.now(),
            author: 'local', // Would be actual user ID
            visible: true,
            locked: false
        };

        // Create spatial anchor if supported
        if (this.config.spatialAnchorSupport) {
            this.createSpatialAnchor?.(annotation);
        }

        this.annotations.set(id, annotation);
        this.emit('annotationCreated', annotation);

        return id;
    }

    /**
     * Update annotation
     */
    public updateAnnotation(id: string, updates: Partial<XRAnnotationData>): boolean {
        const annotation = this.annotations.get(id);
        if (!annotation) return false;

        // Check permissions
        if (!this.canEditAnnotation(annotation)) {
            this.emit('permissionDenied', 'edit', id);
            return false;
        }

        // Apply updates
        Object.assign(annotation, updates);
        annotation.modified = Date.now();

        this.annotations.set(id, annotation);
        this.emit('annotationUpdated', annotation);

        return true;
    }

    /**
     * Remove annotation
     */
    public removeAnnotation(id: string): boolean {
        const annotation = this.annotations.get(id);
        if (!annotation) return false;

        // Check permissions
        if (!this.canDeleteAnnotation(annotation)) {
            this.emit('permissionDenied', 'delete', id);
            return false;
        }

        // Remove spatial anchor
        if (annotation.spatial.anchorId) {
            this.spatialAnchorManager.removeAnchor(annotation.spatial.anchorId);
        }

        this.annotations.delete(id);
        this.emit('annotationRemoved', id);

        return true;
    }

    /**
     * Get annotations in area
     */
    public getAnnotationsInArea(center: XRVector3, radius: number): XRAnnotationData[] {
        const result: XRAnnotationData[] = [];

        this.annotations.forEach(annotation => {
            const distance = this.calculateDistance?.(center, annotation.position);
            if (distance <= radius) {
                result.push(annotation);
            }
        });

        return result;
    }

    /**
     * Handle input source changes
     */
    private handleInputSourcesChange(event: any): void {
        for (const inputSource of event.added) {
            const sourceId = this.getInputSourceId(inputSource);
            this.inputSources.set(sourceId, {
                handedness: inputSource.handedness,
                targetRayMode: inputSource.targetRayMode,
                targetRaySpace: inputSource.targetRaySpace,
                gripSpace: inputSource.gripSpace,
                gamepad: inputSource.gamepad,
                hand: inputSource.hand
            });
            this.emit('inputSourceAdded', sourceId);
        }

        for (const inputSource of event.removed) {
            const sourceId = this.getInputSourceId(inputSource);
            this.inputSources.delete(sourceId);
            this.emit('inputSourceRemoved', sourceId);
        }
    }

    /**
     * Handle select events
     */
    private handleSelect(event: any): void {
        const inputSource = event.inputSource;
        const frame = event.frame;

        // Get target ray pose
        const pose = frame.getPose(inputSource.targetRaySpace, this.referenceSpace);
        if (!pose) return;

        // Perform ray casting to find annotations
        const hitAnnotation = this.raycastAnnotations(pose.transform.position, pose.transform.orientation);

        if (hitAnnotation) {
            this.selectAnnotation(hitAnnotation.id);
        } else {
            // Create new annotation at target position
            const targetPosition = this.calculateTargetPosition?.(pose.transform.position, pose.transform.orientation);
            this.createAnnotationAtPosition?.(targetPosition);
        }
    }

    private handleSelectStart(event: any): void {
        this.emit('selectStart', event);
    }

    private handleSelectEnd(event: any): void {
        this.emit('selectEnd', event);
    }

    /**
     * Handle gestures
     */
    private handleGesture(gesture: XRGestureData): void {
        switch (gesture.gestureType) {
            case XRGestureType.POINT:
                this.handlePointGesture(gesture);
                break;
            case XRGestureType.GRAB:
                this.handleGrabGesture(gesture);
                break;
            case XRGestureType.PINCH:
                this.handlePinchGesture(gesture);
                break;
            default:
                this.emit('gestureRecognized', gesture);
        }
    }

    /**
     * Handle voice commands
     */
    private handleVoiceCommand(command: string): void {
        const lowerCommand = command.toLowerCase();

        if (lowerCommand.includes('create annotation')) {
            this.createVoiceAnnotation?.(command);
        } else if (lowerCommand.includes('delete annotation')) {
            this.deleteSelectedAnnotation();
        } else if (lowerCommand.includes('show annotations')) {
            this.showAllAnnotations();
        } else if (lowerCommand.includes('hide annotations')) {
            this.hideAllAnnotations();
        }

        this.emit('voiceCommand', command);
    }

    // Helper methods
    private getInputSourceId(inputSource: any): string {
        return `${inputSource.handedness}-${inputSource.targetRayMode}`;
    }

    private calculateDistance(pos1: XRVector3, pos2: XRVector3): number {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    private updateAnnotationVisibility(annotation: XRAnnotationData, viewerPosition: XRVector3): void {
        switch (annotation.metadata.visibility) {
            case XRVisibilityMode.PROXIMITY:
                const distance = this.calculateDistance?.(annotation.position, viewerPosition);
                annotation.visible = distance < 5.0; // 5 meter proximity
                break;
            case XRVisibilityMode.CONTEXT_AWARE:
                // Implement context-aware visibility logic
                break;
            default:
                annotation.visible = true;
        }
    }

    private updateAnnotationSpatialData(annotation: XRAnnotationData): void {
        // Update spatial anchor tracking if available
        if (annotation.spatial.anchorId) {
            const anchorPose = this.spatialAnchorManager.getAnchorPose(annotation.spatial.anchorId);
            if (anchorPose) {
                annotation.spatial.worldPosition = anchorPose.position;
                annotation.spatial.worldRotation = anchorPose.orientation;
                annotation.spatial.trackingState = XRTrackingState.TRACKING;
            } else {
                annotation.spatial.trackingState = XRTrackingState.LIMITED;
            }
        }
    }

    private createSpatialAnchor(annotation: XRAnnotationData): void {
        const anchorId = this.spatialAnchorManager.createAnchor?.(
            annotation.position,
            annotation.rotation
        );
        if (anchorId) {
            annotation.spatial.anchorId = anchorId;
        }
    }

    private canEditAnnotation(annotation: XRAnnotationData): boolean {
        // Simplified permission check
        return annotation.metadata.permissions.canEdit.includes('*') ||
            annotation.metadata.permissions.canEdit.includes('local');
    }

    private canDeleteAnnotation(annotation: XRAnnotationData): boolean {
        // Simplified permission check
        return annotation.metadata.permissions.canDelete.includes('*') ||
            annotation.metadata.permissions.canDelete.includes('local');
    }

    private raycastAnnotations(origin: XRVector3, direction: XRQuaternion): XRAnnotationData | null {
        // Simplified raycast implementation
        let closestAnnotation: XRAnnotationData | null = null;
        let closestDistance = Infinity;

        this.annotations.forEach(annotation => {
            if (!annotation.visible) return;

            const distance = this.calculateDistance?.(origin, annotation.position);
            if (distance < 0.5 && distance < closestDistance) { // 50cm interaction range
                closestDistance = distance;
                closestAnnotation = annotation;
            }
        });

        return closestAnnotation;
    }

    private calculateTargetPosition(origin: XRVector3, direction: XRQuaternion): XRVector3 {
        // Calculate position 1 meter in front of the ray
        return {
            x: origin.x + direction.x,
            y: origin.y + direction.y,
            z: origin.z + direction.z - 1.0
        };
    }

    private selectAnnotation(id: string): void {
        this.emit('annotationSelected', id);
    }

    private createAnnotationAtPosition(position: XRVector3): void {
        const id = this.createAnnotation?.(
            XRAnnotationType.SPATIAL_MARKER,
            position,
            { text: 'New annotation' }
        );
        this.selectAnnotation(id);
    }

    private handlePointGesture(gesture: XRGestureData): void {
        // Handle pointing gesture
        this.emit('pointGesture', gesture);
    }

    private handleGrabGesture(gesture: XRGestureData): void {
        // Handle grab gesture
        this.emit('grabGesture', gesture);
    }

    private handlePinchGesture(gesture: XRGestureData): void {
        // Handle pinch gesture
        this.emit('pinchGesture', gesture);
    }

    private createVoiceAnnotation(command: string): void {
        // Extract text from voice command
        const text = command.replace(/create annotation/i, '').trim();

        // Create annotation at current gaze position
        const id = this.createAnnotation?.(
            XRAnnotationType.VOICE_NOTE,
            { x: 0, y: 1.5, z: -2 }, // Default position
            { text, audioUrl: '' } // Would record audio
        );
    }

    private deleteSelectedAnnotation(): void {
        // Delete currently selected annotation
        this.emit('deleteSelectedAnnotation');
    }

    private showAllAnnotations(): void {
        this.annotations.forEach(annotation => {
            annotation.visible = true;
        });
        this.emit('annotationsShown');
    }

    private hideAllAnnotations(): void {
        this.annotations.forEach(annotation => {
            annotation.visible = false;
        });
        this.emit('annotationsHidden');
    }

    private renderCollaborationAvatars(viewMatrix: Float32Array, projectionMatrix: Float32Array): void {
        this.users.forEach((user, userId) => {
            if (userId === 'local' || !user.isPresent) return;

            // Render user avatar
            this.collaborationManager.renderAvatar?.(user, viewMatrix, projectionMatrix);
        });
    }

    /**
     * Cleanup XR session
     */
    private cleanup(): void {
        this.isSessionActive = false;
        this.currentMode = null;
        this.session = null;
        this.referenceSpace = null;
        this.inputSources.clear();
        this.frameId = 0;
    }

    /**
     * Get XR statistics
     */
    public getStats(): {
        isXRSupported: boolean;
        isSessionActive: boolean;
        currentMode: XRSessionMode | null;
        annotationCount: number;
        userCount: number;
        frameId: number;
        supportedModes: XRSessionMode[];
    } {
        return {
            isXRSupported: this.isXRSupported,
            isSessionActive: this.isSessionActive,
            currentMode: this.currentMode,
            annotationCount: this.annotations.size,
            userCount: this.users.size,
            frameId: this.frameId,
            supportedModes: this.config.supportedModes
        };
    }

    /**
     * Cleanup resources
     */
    public dispose(): void {
        if (this.isSessionActive) {
            this.endSession();
        }

        this.annotations.clear();
        this.users.clear();
        this.inputSources.clear();

        this.handTracker.dispose?.();
        this.voiceRecognizer.dispose?.();
        this.gestureRecognizer.dispose?.();
        this.spatialAnchorManager.dispose?.();
        this.collaborationManager.dispose?.();
        this.hapticManager.dispose?.();
        this.annotationRenderer.dispose?.();
        this.uiManager.dispose?.();

        this.removeAllListeners();
    }
}

// Supporting classes (simplified implementations)
class XRHandTracker {
    async initialize(): Promise<void> { }
    updateHand(hand: any, frame: any, referenceSpace: any): XRHandPose | null { return null; }
    dispose(): void { }
}

class XRVoiceRecognizer {
    async initialize(): Promise<void> { }
    getRecognizedCommands(): string[] { return []; }
    dispose(): void { }
}

class XRGestureRecognizer {
    update(deltaTime: number): XRGestureData[] { return []; }
    dispose(): void { }
}

class XRSpatialAnchorManager {
    async initialize(): Promise<void> { }
    createAnchor(position: XRVector3, rotation: XRQuaternion): string | null { return null; }
    getAnchorPose(anchorId: string): XRRigidTransform | null { return null; }
    removeAnchor(anchorId: string): void { }
    dispose(): void { }
}

class XRCollaborationManager {
    async initialize(): Promise<void> { }
    updateUsers(users: Map<string, XRUser>): void { }
    renderAvatar(user: XRUser, viewMatrix: Float32Array, projectionMatrix: Float32Array): void { }
    dispose(): void { }
}

class XRHapticManager {
    dispose(): void { }
}

class XRAnnotationRenderer {
    async initialize(): Promise<void> { }
    render(annotations: Map<string, XRAnnotationData>, viewMatrix: Float32Array, projectionMatrix: Float32Array, viewerPosition: XRVector3): void { }
    dispose(): void { }
}

class XRUIManager {
    async initialize(): Promise<void> { }
    render(viewMatrix: Float32Array, projectionMatrix: Float32Array): void { }
    dispose(): void { }
}

export default XRAnnotation;