/**
 * G3D MedSight Pro - Medical XR Integration Module
 * Phase 0.5: G3D Medical XR Integration
 * 
 * Comprehensive XR (Extended Reality) capabilities for medical applications
 * including Virtual Reality, Augmented Reality, Holographic Imaging,
 * Collaborative Review, and Haptic Feedback systems.
 */

// Import classes for internal use
import MedicalVRClass from './MedicalVR';
import MedicalARClass from './MedicalAR';
import HolographicImagingClass from './HolographicImaging';
import CollaborativeReviewClass from './CollaborativeReview';
import MedicalHapticsClass from './MedicalHaptics';

// Virtual Reality System
export { default as MedicalVR } from './MedicalVR';
export type {
    MedicalVRConfig,
    VRSession,
    VRParticipant,
    MedicalVRContext,
    VRPermissions,
    VRAvatar,
    VRTool,
    VRRecording,
    VRAnnotation,
    VRKeyframe,
    VRControllerInput,
    VRHandTracking,
    FingerData,
    PalmData,
    Gesture
} from './MedicalVR';

// Augmented Reality System
export { default as MedicalAR } from './MedicalAR';
export type {
    MedicalARConfig,
    ARSession,
    MedicalARContext,
    ARObject,
    ARTrackingAnchor,
    ARTrackingData,
    LightEstimate,
    ARPlane,
    ARCalibration,
    CameraIntrinsics,
    PatientRegistration,
    LandmarkPoint,
    InstrumentCalibration,
    ARGuidanceSystem,
    GuidanceInstruction,
    NavigationPath,
    Waypoint,
    SafetyZone,
    CriticalStructure,
    VisualizationStyle
} from './MedicalAR';

// Holographic Imaging System
export { default as HolographicImaging } from './HolographicImaging';
export type {
    HolographicConfig,
    HolographicSession,
    MedicalHolographicContext,
    HolographicObject,
    HolographicProperties,
    HolographicViewer,
    ViewerPermissions
} from './HolographicImaging';

// Collaborative Review System
export { default as CollaborativeReview } from './CollaborativeReview';
export type {
    CollaborativeConfig,
    CollaborativeSession,
    MedicalCollaborativeContext,
    Participant,
    MedicalCredentials,
    ParticipantPermissions,
    Avatar,
    SharedObject,
    CollaborativeAnnotation,
    AnnotationReply,
    SessionState,
    ViewState,
    ConsensusItem,
    Vote
} from './CollaborativeReview';

// Medical Haptics System
export { default as MedicalHaptics } from './MedicalHaptics';
export type {
    MedicalHapticsConfig,
    HapticSafetyLimits,
    HapticSession,
    MedicalHapticContext,
    TissueType,
    TissueProperties,
    HapticModel,
    VisualModel,
    MedicalInstrument,
    InstrumentProperties,
    HapticMapping,
    HapticDevice,
    HapticCapabilities,
    HapticCalibration,
    HapticObject,
    HapticObjectProperties,
    MedicalObjectProperties,
    InteractionState,
    HapticPerformanceMetrics
} from './MedicalHaptics';

// Common XR Types
export type {
    Vector2,
    Vector3,
    Quaternion,
    Matrix4
} from './MedicalAR';

/**
 * G3D Medical XR Integration Manager
 * Orchestrates all XR systems for comprehensive medical applications
 */
export class MedicalXRManager {
    private vrSystem: MedicalVRClass | null = null;
    private arSystem: MedicalARClass | null = null;
    private holographicSystem: HolographicImagingClass | null = null;
    private collaborativeSystem: CollaborativeReviewClass | null = null;
    private hapticsSystem: MedicalHapticsClass | null = null;

    private isInitialized: boolean = false;

    constructor() {
        console.log('G3D Medical XR Manager created');
    }

    async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D Medical XR Manager...');

            // Initialize VR system
            this.vrSystem = new MedicalVRClass();
            await (this.vrSystem as any).initialize?.();

            // Initialize AR system
            this.arSystem = new MedicalARClass();
            await (this.arSystem as any).initialize?.();

            // Initialize holographic system
            this.holographicSystem = new HolographicImagingClass();
            await (this.holographicSystem as any).initialize?.();

            // Initialize collaborative system
            this.collaborativeSystem = new CollaborativeReviewClass();
            await (this.collaborativeSystem as any).initialize?.();

            // Initialize haptics system
            this.hapticsSystem = new MedicalHapticsClass();
            await (this.hapticsSystem as any).initialize?.();

            this.isInitialized = true;
            console.log('G3D Medical XR Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Medical XR Manager:', error);
            throw error;
        }
    }

    getVRSystem(): MedicalVRClass | null {
        return this.vrSystem;
    }

    getARSystem(): MedicalARClass | null {
        return this.arSystem;
    }

    getHolographicSystem(): HolographicImagingClass | null {
        return this.holographicSystem;
    }

    getCollaborativeSystem(): CollaborativeReviewClass | null {
        return this.collaborativeSystem;
    }

    getHapticsSystem(): MedicalHapticsClass | null {
        return this.hapticsSystem;
    }

    isSystemInitialized(): boolean {
        return this.isInitialized;
    }

    dispose(): void {
        console.log('Disposing G3D Medical XR Manager...');

        if (this.vrSystem) {
            (this.vrSystem as any).cleanup?.();
            this.vrSystem = null;
        }

        if (this.arSystem) {
            (this.arSystem as any).cleanup?.();
            this.arSystem = null;
        }

        if (this.holographicSystem) {
            (this.holographicSystem as any).cleanup?.();
            this.holographicSystem = null;
        }

        if (this.collaborativeSystem) {
            (this.collaborativeSystem as any).cleanup?.();
            this.collaborativeSystem = null;
        }

        if (this.hapticsSystem) {
            (this.hapticsSystem as any).cleanup?.();
            this.hapticsSystem = null;
        }

        this.isInitialized = false;
        console.log('G3D Medical XR Manager disposed');
    }
}

export default MedicalXRManager;