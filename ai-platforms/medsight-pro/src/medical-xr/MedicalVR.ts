/**
 * G3D MedSight Pro - Medical Virtual Reality System
 * Comprehensive VR capabilities for medical applications
 * 
 * Features:
 * - Immersive medical data visualization
 * - VR-based surgical planning and simulation
 * - Medical training and education in VR
 * - Multi-user collaborative VR sessions
 * - Haptic feedback integration
 * - Clinical workflow optimization for VR
 */

export interface MedicalVRConfig {
    enableImmersiveMode: boolean;
    enableHandTracking: boolean;
    enableEyeTracking: boolean;
    enableHapticFeedback: boolean;
    enableCollaboration: boolean;
    maxCollaborators: number;
    renderQuality: 'low' | 'medium' | 'high' | 'ultra';
    framerate: 60 | 72 | 90 | 120;
    ipd: number; // Interpupillary distance
    medicalSafetyMode: boolean;
}

export interface VRSession {
    id: string;
    userId: string;
    patientId?: string;
    studyId?: string;
    sessionType: 'visualization' | 'planning' | 'training' | 'collaboration' | 'simulation';
    startTime: number;
    duration: number;
    participants: VRParticipant[];
    medicalContext: MedicalVRContext;
    recordings: VRRecording[];
}

export interface VRParticipant {
    id: string;
    name: string;
    role: 'surgeon' | 'resident' | 'student' | 'observer' | 'patient' | 'technician';
    permissions: VRPermissions;
    position: Vector3;
    orientation: Quaternion;
    avatar: VRAvatar;
    tools: VRTool[];
}

export interface MedicalVRContext {
    patientData: {
        id: string;
        age: number;
        gender: string;
        medicalHistory: string[];
        allergies: string[];
        currentCondition: string;
    };
    studyData: {
        modality: string;
        bodyPart: string;
        studyDate: string;
        findings: string[];
        diagnosis?: string;
    };
    clinicalPurpose: 'diagnosis' | 'planning' | 'training' | 'consultation' | 'education';
    urgency: 'routine' | 'urgent' | 'emergency';
    qualityRequirements: 'standard' | 'high' | 'surgical';
}

export interface VRPermissions {
    canViewPatientData: boolean;
    canModifyVisualization: boolean;
    canUseSurgicalTools: boolean;
    canRecordSession: boolean;
    canInviteParticipants: boolean;
    canAccessTrainingMaterials: boolean;
}

export interface VRAvatar {
    model: string;
    scale: number;
    visibility: boolean;
    handRepresentation: 'realistic' | 'abstract' | 'tools';
    nameTag: boolean;
    roleIndicator: boolean;
}

export interface VRTool {
    id: string;
    type: 'scalpel' | 'probe' | 'measure' | 'annotation' | 'slice' | 'zoom' | 'rotate';
    position: Vector3;
    orientation: Quaternion;
    active: boolean;
    hapticEnabled: boolean;
    precision: number;
}

export interface VRRecording {
    id: string;
    type: 'session' | 'procedure' | 'training';
    startTime: number;
    duration: number;
    quality: string;
    size: number;
    annotations: VRAnnotation[];
    keyframes: VRKeyframe[];
}

export interface VRAnnotation {
    id: string;
    timestamp: number;
    position: Vector3;
    text: string;
    author: string;
    type: 'note' | 'measurement' | 'finding' | 'instruction';
    visibility: 'private' | 'session' | 'public';
}

export interface VRKeyframe {
    timestamp: number;
    cameraPosition: Vector3;
    cameraOrientation: Quaternion;
    sceneState: any;
    annotations: string[];
}

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}

export interface VRControllerInput {
    controllerId: string;
    position: Vector3;
    orientation: Quaternion;
    buttons: Map<string, boolean>;
    axes: Map<string, number>;
    hapticIntensity: number;
    tracking: boolean;
}

export interface VRHandTracking {
    handId: 'left' | 'right';
    fingers: FingerData[];
    palm: PalmData;
    gestures: Gesture[];
    confidence: number;
}

export interface FingerData {
    fingerId: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';
    joints: Vector3[];
    extended: boolean;
    touching: boolean;
}

export interface PalmData {
    position: Vector3;
    normal: Vector3;
    width: number;
    height: number;
}

export interface Gesture {
    type: 'point' | 'grab' | 'pinch' | 'swipe' | 'rotate' | 'scale';
    confidence: number;
    startTime: number;
    duration: number;
    parameters: Map<string, number>;
}

export class MedicalVR {
    private config: MedicalVRConfig;
    private vrDisplay: any = null; // VRDisplay or XRSystem
    private vrSession: any = null; // VRSession or XRSession
    private currentSession: VRSession | null = null;
    private participants: Map<string, VRParticipant> = new Map();
    private medicalData: any = null;
    private vrScene: any = null;
    private isInitialized: boolean = false;

    private controllers: Map<string, VRControllerInput> = new Map();
    private handTracking: Map<string, VRHandTracking> = new Map();
    private hapticDevices: Map<string, any> = new Map();

    private sessionRecorder: VRSessionRecorder | null = null;
    private collaborationManager: VRCollaborationManager | null = null;
    private medicalTools: MedicalVRTools | null = null;

    constructor(config: Partial<MedicalVRConfig> = {}) {
        this.config = {
            enableImmersiveMode: true,
            enableHandTracking: true,
            enableEyeTracking: false,
            enableHapticFeedback: true,
            enableCollaboration: true,
            maxCollaborators: 8,
            renderQuality: 'high',
            framerate: 90,
            ipd: 63, // Average IPD in mm
            medicalSafetyMode: true,
            ...config
        };
    }

    async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D Medical VR System...');

            // Check VR support
            await this.checkVRSupport();

            // Initialize VR display
            await this.initializeVRDisplay();

            // Initialize medical tools
            this.medicalTools = new MedicalVRTools(this.config);
            await this.medicalTools.initialize();

            // Initialize collaboration if enabled
            if (this.config.enableCollaboration) {
                this.collaborationManager = new VRCollaborationManager(this.config);
                await this.collaborationManager.initialize();
            }

            // Initialize session recorder
            this.sessionRecorder = new VRSessionRecorder(this.config);
            await this.sessionRecorder.initialize();

            this.isInitialized = true;
            console.log('G3D Medical VR System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Medical VR System:', error);
            throw error;
        }
    }

    private async checkVRSupport(): Promise<void> {
        // Check for WebXR support
        if ('xr' in navigator) {
            try {
                const supported = await (navigator as any).xr.isSessionSupported('immersive-vr');
                if (!supported) {
                    throw new Error('Immersive VR not supported');
                }
                console.log('WebXR VR support detected');
            } catch (error) {
                console.warn('WebXR not available, checking for WebVR...');
                await this.checkWebVRSupport();
            }
        } else {
            await this.checkWebVRSupport();
        }
    }

    private async checkWebVRSupport(): Promise<void> {
        if ('getVRDisplays' in navigator) {
            const displays = await (navigator as any).getVRDisplays();
            if (displays.length === 0) {
                throw new Error('No VR displays found');
            }
            this.vrDisplay = displays[0];
            console.log('WebVR support detected');
        } else {
            throw new Error('No VR support available');
        }
    }

    private async initializeVRDisplay(): Promise<void> {
        if ('xr' in navigator) {
            // WebXR initialization
            const xr = (navigator as any).xr;

            try {
                this.vrSession = await xr.requestSession('immersive-vr', {
                    requiredFeatures: ['local'],
                    optionalFeatures: ['hand-tracking', 'eye-tracking', 'bounded-floor']
                });

                // Set up reference space
                const referenceSpace = await this.vrSession.requestReferenceSpace('local');

                // Set up frame callback
                this.vrSession.requestAnimationFrame(this.onVRFrame.bind(this));

                console.log('WebXR session initialized');
            } catch (error) {
                console.error('Failed to initialize WebXR session:', error);
                throw error;
            }
        } else if (this.vrDisplay) {
            // WebVR initialization
            try {
                await this.vrDisplay.requestPresent([{ source: document.createElement('canvas') }]);
                console.log('WebVR display initialized');
            } catch (error) {
                console.error('Failed to initialize WebVR display:', error);
                throw error;
            }
        }
    }

    private onVRFrame(time: number, frame: any): void {
        if (!this.vrSession) return;

        // Update VR controllers
        this.updateControllers(frame);

        // Update hand tracking
        if (this.config.enableHandTracking) {
            this.updateHandTracking(frame);
        }

        // Update medical visualization
        this.updateMedicalVisualization(time, frame);

        // Update collaboration
        if (this.collaborationManager) {
            this.collaborationManager.update(time, frame);
        }

        // Record session if active
        if (this.sessionRecorder && this.sessionRecorder.isRecording()) {
            this.sessionRecorder.recordFrame(time, frame);
        }

        // Request next frame
        this.vrSession.requestAnimationFrame(this.onVRFrame.bind(this));
    }

    private updateControllers(frame: any): void {
        if (!frame.session.inputSources) return;

        for (const inputSource of frame.session.inputSources) {
            if (inputSource.targetRayMode === 'tracked-pointer') {
                const controllerId = inputSource.handedness || 'unknown';

                const pose = frame.getPose(inputSource.targetRaySpace, frame.session.viewerSpace);
                if (pose) {
                    const controller: VRControllerInput = {
                        controllerId,
                        position: {
                            x: pose.transform.position.x,
                            y: pose.transform.position.y,
                            z: pose.transform.position.z
                        },
                        orientation: {
                            x: pose.transform.orientation.x,
                            y: pose.transform.orientation.y,
                            z: pose.transform.orientation.z,
                            w: pose.transform.orientation.w
                        },
                        buttons: new Map(),
                        axes: new Map(),
                        hapticIntensity: 0,
                        tracking: true
                    };

                    // Update button states
                    if (inputSource.gamepad) {
                        inputSource.gamepad.buttons.forEach((button: any, index: number) => {
                            controller.buttons.set(index.toString(), button.pressed);
                        });

                        inputSource.gamepad.axes.forEach((axis: number, index: number) => {
                            controller.axes.set(index.toString(), axis);
                        });
                    }

                    this.controllers.set(controllerId, controller);
                }
            }
        }
    }

    private updateHandTracking(frame: any): void {
        if (!frame.session.inputSources) return;

        for (const inputSource of frame.session.inputSources) {
            if (inputSource.hand) {
                const handId = inputSource.handedness as 'left' | 'right';

                const handTracking: VRHandTracking = {
                    handId,
                    fingers: [],
                    palm: {
                        position: { x: 0, y: 0, z: 0 },
                        normal: { x: 0, y: 1, z: 0 },
                        width: 0.08,
                        height: 0.12
                    },
                    gestures: [],
                    confidence: 0.8
                };

                // Process hand joints
                for (const [jointName, joint] of inputSource.hand.entries()) {
                    const pose = frame.getJointPose(joint, frame.session.viewerSpace);
                    if (pose) {
                        // Process finger data based on joint name
                        // This is a simplified implementation
                        const fingerData: FingerData = {
                            fingerId: this.mapJointToFinger(jointName),
                            joints: [{
                                x: pose.transform.position.x,
                                y: pose.transform.position.y,
                                z: pose.transform.position.z
                            }],
                            extended: true,
                            touching: false
                        };

                        handTracking.fingers.push(fingerData);
                    }
                }

                // Detect gestures
                handTracking.gestures = this.detectGestures(handTracking);

                this.handTracking.set(handId, handTracking);
            }
        }
    }

    private mapJointToFinger(jointName: string): 'thumb' | 'index' | 'middle' | 'ring' | 'pinky' {
        if (jointName.includes('thumb')) return 'thumb';
        if (jointName.includes('index')) return 'index';
        if (jointName.includes('middle')) return 'middle';
        if (jointName.includes('ring')) return 'ring';
        if (jointName.includes('pinky')) return 'pinky';
        return 'index'; // default
    }

    private detectGestures(handData: VRHandTracking): Gesture[] {
        const gestures: Gesture[] = [];

        // Simple gesture detection logic
        const extendedFingers = handData.fingers.filter(f => f.extended).length;

        if (extendedFingers === 1 && handData.fingers[1]?.extended) {
            gestures.push({
                type: 'point',
                confidence: 0.9,
                startTime: Date.now(),
                duration: 0,
                parameters: new Map()
            });
        } else if (extendedFingers === 0) {
            gestures.push({
                type: 'grab',
                confidence: 0.8,
                startTime: Date.now(),
                duration: 0,
                parameters: new Map()
            });
        } else if (extendedFingers === 2) {
            gestures.push({
                type: 'pinch',
                confidence: 0.85,
                startTime: Date.now(),
                duration: 0,
                parameters: new Map()
            });
        }

        return gestures;
    }

    private updateMedicalVisualization(time: number, frame: any): void {
        if (!this.medicalData || !this.vrScene) return;

        // Update medical data visualization based on VR interaction
        // This would integrate with the medical rendering systems

        // Update based on controller input
        for (const [controllerId, controller] of this.controllers) {
            if (controller.buttons.get('0')) { // Trigger pressed
                this.handleMedicalInteraction(controller);
            }
        }

        // Update based on hand gestures
        for (const [handId, handData] of this.handTracking) {
            for (const gesture of handData.gestures) {
                this.handleMedicalGesture(gesture, handData);
            }
        }
    }

    private handleMedicalInteraction(controller: VRControllerInput): void {
        if (!this.medicalTools) return;

        // Determine active tool and perform interaction
        const activeTool = this.medicalTools.getActiveTool(controller.controllerId);
        if (activeTool) {
            this.medicalTools.executeToolAction(activeTool, controller);
        }
    }

    private handleMedicalGesture(gesture: Gesture, handData: VRHandTracking): void {
        switch (gesture.type) {
            case 'point':
                this.handlePointGesture(handData);
                break;
            case 'grab':
                this.handleGrabGesture(handData);
                break;
            case 'pinch':
                this.handlePinchGesture(handData);
                break;
            case 'rotate':
                this.handleRotateGesture(handData);
                break;
            case 'scale':
                this.handleScaleGesture(handData);
                break;
        }
    }

    private handlePointGesture(handData: VRHandTracking): void {
        // Handle pointing gesture for medical data selection
        console.log(`Point gesture detected with ${handData.handId} hand`);
    }

    private handleGrabGesture(handData: VRHandTracking): void {
        // Handle grab gesture for medical data manipulation
        console.log(`Grab gesture detected with ${handData.handId} hand`);
    }

    private handlePinchGesture(handData: VRHandTracking): void {
        // Handle pinch gesture for precise medical interactions
        console.log(`Pinch gesture detected with ${handData.handId} hand`);
    }

    private handleRotateGesture(handData: VRHandTracking): void {
        // Handle rotation gesture for 3D medical data
        console.log(`Rotate gesture detected with ${handData.handId} hand`);
    }

    private handleScaleGesture(handData: VRHandTracking): void {
        // Handle scale gesture for zooming medical data
        console.log(`Scale gesture detected with ${handData.handId} hand`);
    }

    // Public API
    public async startMedicalVRSession(
        sessionType: VRSession['sessionType'],
        medicalContext: MedicalVRContext,
        userId: string
    ): Promise<string> {
        if (!this.isInitialized) {
            throw new Error('VR system not initialized');
        }

        const sessionId = `vr_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const session: VRSession = {
            id: sessionId,
            userId,
            patientId: medicalContext.patientData.id,
            studyId: medicalContext.studyData.modality,
            sessionType,
            startTime: Date.now(),
            duration: 0,
            participants: [],
            medicalContext,
            recordings: []
        };

        // Add primary participant
        const primaryParticipant: VRParticipant = {
            id: userId,
            name: 'Primary User',
            role: this.determineUserRole(sessionType),
            permissions: this.getDefaultPermissions(sessionType),
            position: { x: 0, y: 1.7, z: 0 },
            orientation: { x: 0, y: 0, z: 0, w: 1 },
            avatar: {
                model: 'medical_professional',
                scale: 1.0,
                visibility: true,
                handRepresentation: 'realistic',
                nameTag: true,
                roleIndicator: true
            },
            tools: []
        };

        session.participants.push(primaryParticipant);
        this.participants.set(userId, primaryParticipant);
        this.currentSession = session;

        // Load medical data for the session
        await this.loadMedicalDataForSession(medicalContext);

        // Start recording if enabled
        if (this.sessionRecorder) {
            await this.sessionRecorder.startRecording(session);
        }

        console.log(`Medical VR session started: ${sessionId}`);
        return sessionId;
    }

    private determineUserRole(sessionType: VRSession['sessionType']): VRParticipant['role'] {
        switch (sessionType) {
            case 'planning': return 'surgeon';
            case 'training': return 'student';
            case 'visualization': return 'surgeon';
            case 'collaboration': return 'surgeon';
            case 'simulation': return 'resident';
            default: return 'observer';
        }
    }

    private getDefaultPermissions(sessionType: VRSession['sessionType']): VRPermissions {
        const basePermissions: VRPermissions = {
            canViewPatientData: true,
            canModifyVisualization: true,
            canUseSurgicalTools: false,
            canRecordSession: false,
            canInviteParticipants: false,
            canAccessTrainingMaterials: false
        };

        switch (sessionType) {
            case 'planning':
                return {
                    ...basePermissions,
                    canUseSurgicalTools: true,
                    canRecordSession: true,
                    canInviteParticipants: true
                };
            case 'training':
                return {
                    ...basePermissions,
                    canAccessTrainingMaterials: true,
                    canRecordSession: true
                };
            case 'collaboration':
                return {
                    ...basePermissions,
                    canInviteParticipants: true,
                    canRecordSession: true
                };
            default:
                return basePermissions;
        }
    }

    private async loadMedicalDataForSession(context: MedicalVRContext): Promise<void> {
        // Load medical data based on context
        // This would integrate with DICOM processor and medical renderers
        console.log(`Loading medical data for patient: ${context.patientData.id}`);

        // Simulate medical data loading
        this.medicalData = {
            patientId: context.patientData.id,
            studyData: context.studyData,
            volumeData: null, // Would be loaded from DICOM
            meshData: null,   // Would be generated from volume
            annotations: [],
            measurements: []
        };
    }

    public async inviteParticipant(
        sessionId: string,
        participantId: string,
        role: VRParticipant['role']
    ): Promise<boolean> {
        if (!this.currentSession || this.currentSession.id !== sessionId) {
            throw new Error('Invalid session');
        }

        if (this.participants.size >= this.config.maxCollaborators) {
            throw new Error('Maximum collaborators reached');
        }

        const participant: VRParticipant = {
            id: participantId,
            name: `Participant ${participantId}`,
            role,
            permissions: this.getPermissionsForRole(role),
            position: { x: Math.random() * 2 - 1, y: 1.7, z: Math.random() * 2 - 1 },
            orientation: { x: 0, y: 0, z: 0, w: 1 },
            avatar: {
                model: this.getAvatarForRole(role),
                scale: 1.0,
                visibility: true,
                handRepresentation: 'realistic',
                nameTag: true,
                roleIndicator: true
            },
            tools: []
        };

        this.participants.set(participantId, participant);
        this.currentSession.participants.push(participant);

        if (this.collaborationManager) {
            await this.collaborationManager.addParticipant(participant);
        }

        console.log(`Participant ${participantId} invited to session ${sessionId}`);
        return true;
    }

    private getPermissionsForRole(role: VRParticipant['role']): VRPermissions {
        const permissions: Record<VRParticipant['role'], VRPermissions> = {
            surgeon: {
                canViewPatientData: true,
                canModifyVisualization: true,
                canUseSurgicalTools: true,
                canRecordSession: true,
                canInviteParticipants: true,
                canAccessTrainingMaterials: true
            },
            resident: {
                canViewPatientData: true,
                canModifyVisualization: true,
                canUseSurgicalTools: true,
                canRecordSession: false,
                canInviteParticipants: false,
                canAccessTrainingMaterials: true
            },
            student: {
                canViewPatientData: false,
                canModifyVisualization: false,
                canUseSurgicalTools: false,
                canRecordSession: false,
                canInviteParticipants: false,
                canAccessTrainingMaterials: true
            },
            observer: {
                canViewPatientData: false,
                canModifyVisualization: false,
                canUseSurgicalTools: false,
                canRecordSession: false,
                canInviteParticipants: false,
                canAccessTrainingMaterials: false
            },
            patient: {
                canViewPatientData: true,
                canModifyVisualization: false,
                canUseSurgicalTools: false,
                canRecordSession: false,
                canInviteParticipants: false,
                canAccessTrainingMaterials: false
            },
            technician: {
                canViewPatientData: false,
                canModifyVisualization: true,
                canUseSurgicalTools: false,
                canRecordSession: true,
                canInviteParticipants: false,
                canAccessTrainingMaterials: false
            }
        };

        return permissions[role];
    }

    private getAvatarForRole(role: VRParticipant['role']): string {
        const avatars: Record<VRParticipant['role'], string> = {
            surgeon: 'surgeon_avatar',
            resident: 'resident_avatar',
            student: 'student_avatar',
            observer: 'observer_avatar',
            patient: 'patient_avatar',
            technician: 'technician_avatar'
        };

        return avatars[role];
    }

    public async endVRSession(): Promise<void> {
        if (!this.currentSession) {
            throw new Error('No active session');
        }

        // Stop recording
        if (this.sessionRecorder && this.sessionRecorder.isRecording()) {
            await this.sessionRecorder.stopRecording();
        }

        // Clean up collaboration
        if (this.collaborationManager) {
            await this.collaborationManager.endSession();
        }

        // Update session duration
        this.currentSession.duration = Date.now() - this.currentSession.startTime;

        console.log(`VR session ended: ${this.currentSession.id}, duration: ${this.currentSession.duration}ms`);

        // Clear session data
        this.currentSession = null;
        this.participants.clear();
        this.medicalData = null;
    }

    public getCurrentSession(): VRSession | null {
        return this.currentSession;
    }

    public getParticipants(): VRParticipant[] {
        return Array.from(this.participants.values());
    }

    public getControllerInputs(): VRControllerInput[] {
        return Array.from(this.controllers.values());
    }

    public getHandTrackingData(): VRHandTracking[] {
        return Array.from(this.handTracking.values());
    }

    public dispose(): void {
        console.log('Disposing G3D Medical VR System...');

        // End current session
        if (this.currentSession) {
            this.endVRSession();
        }

        // Dispose VR session
        if (this.vrSession) {
            this.vrSession.end();
            this.vrSession = null;
        }

        // Clean up managers
        if (this.sessionRecorder) {
            this.sessionRecorder.dispose();
            this.sessionRecorder = null;
        }

        if (this.collaborationManager) {
            this.collaborationManager.dispose();
            this.collaborationManager = null;
        }

        if (this.medicalTools) {
            this.medicalTools.dispose();
            this.medicalTools = null;
        }

        // Clear data
        this.controllers.clear();
        this.handTracking.clear();
        this.hapticDevices.clear();
        this.participants.clear();

        this.isInitialized = false;

        console.log('G3D Medical VR System disposed');
    }
}

// Supporting classes (simplified implementations)
class VRSessionRecorder {
    private isRecordingActive: boolean = false;

    constructor(private config: MedicalVRConfig) { }

    async initialize(): Promise<void> {
        console.log('VR Session Recorder initialized');
    }

    async startRecording(session: VRSession): Promise<void> {
        this.isRecordingActive = true;
        console.log(`Started recording session: ${session.id}`);
    }

    recordFrame(time: number, frame: any): void {
        // Record frame data
    }

    async stopRecording(): Promise<void> {
        this.isRecordingActive = false;
        console.log('Stopped recording session');
    }

    isRecording(): boolean {
        return this.isRecordingActive;
    }

    dispose(): void {
        this.isRecordingActive = false;
    }
}

class VRCollaborationManager {
    constructor(private config: MedicalVRConfig) { }

    async initialize(): Promise<void> {
        console.log('VR Collaboration Manager initialized');
    }

    async addParticipant(participant: VRParticipant): Promise<void> {
        console.log(`Added participant: ${participant.id}`);
    }

    update(time: number, frame: any): void {
        // Update collaboration state
    }

    async endSession(): Promise<void> {
        console.log('Collaboration session ended');
    }

    dispose(): void {
        console.log('VR Collaboration Manager disposed');
    }
}

class MedicalVRTools {
    private tools: Map<string, VRTool> = new Map();

    constructor(private config: MedicalVRConfig) { }

    async initialize(): Promise<void> {
        // Initialize medical VR tools
        this.createDefaultTools();
        console.log('Medical VR Tools initialized');
    }

    private createDefaultTools(): void {
        const defaultTools: VRTool[] = [
            {
                id: 'scalpel',
                type: 'scalpel',
                position: { x: 0, y: 0, z: 0 },
                orientation: { x: 0, y: 0, z: 0, w: 1 },
                active: false,
                hapticEnabled: true,
                precision: 0.1
            },
            {
                id: 'probe',
                type: 'probe',
                position: { x: 0, y: 0, z: 0 },
                orientation: { x: 0, y: 0, z: 0, w: 1 },
                active: false,
                hapticEnabled: true,
                precision: 0.05
            },
            {
                id: 'measure',
                type: 'measure',
                position: { x: 0, y: 0, z: 0 },
                orientation: { x: 0, y: 0, z: 0, w: 1 },
                active: false,
                hapticEnabled: false,
                precision: 0.01
            }
        ];

        defaultTools.forEach(tool => {
            this.tools.set(tool.id, tool);
        });
    }

    getActiveTool(controllerId: string): VRTool | null {
        // Return active tool for controller
        for (const tool of this.tools.values()) {
            if (tool.active) {
                return tool;
            }
        }
        return null;
    }

    executeToolAction(tool: VRTool, controller: VRControllerInput): void {
        console.log(`Executing ${tool.type} action`);

        // Provide haptic feedback if enabled
        if (tool.hapticEnabled && this.config.enableHapticFeedback) {
            this.triggerHapticFeedback(controller.controllerId, 0.5, 100);
        }
    }

    private triggerHapticFeedback(controllerId: string, intensity: number, duration: number): void {
        // Trigger haptic feedback on controller
        console.log(`Haptic feedback: ${intensity} intensity for ${duration}ms on ${controllerId}`);
    }

    dispose(): void {
        this.tools.clear();
        console.log('Medical VR Tools disposed');
    }
}

export default MedicalVR;