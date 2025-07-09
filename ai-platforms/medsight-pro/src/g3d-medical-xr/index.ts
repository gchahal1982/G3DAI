/**
 * G3D MedSight Pro - Medical XR Integration Module
 * Phase 0.5: G3D Medical XR Integration
 * 
 * Comprehensive XR (Extended Reality) capabilities for medical applications
 * including Virtual Reality, Augmented Reality, Holographic Imaging,
 * Collaborative Review, and Haptic Feedback systems.
 */

// Import classes for internal use
import G3DMedicalVRClass from './G3DMedicalVR';
import G3DMedicalARClass from './G3DMedicalAR';
import G3DHolographicImagingClass from './G3DHolographicImaging';
import G3DCollaborativeReviewClass from './G3DCollaborativeReview';
import G3DMedicalHapticsClass from './G3DMedicalHaptics';

// Virtual Reality System
export { default as G3DMedicalVR } from './G3DMedicalVR';
export type {
    G3DMedicalVRConfig,
    G3DVRSession,
    G3DVRParticipant,
    G3DMedicalVRContext,
    G3DVRPermissions,
    G3DVRAvatar,
    G3DVRTool,
    G3DVRRecording,
    G3DVRAnnotation,
    G3DVRKeyframe,
    G3DVRControllerInput,
    G3DVRHandTracking,
    G3DFingerData,
    G3DPalmData,
    G3DGesture
} from './G3DMedicalVR';

// Augmented Reality System
export { default as G3DMedicalAR } from './G3DMedicalAR';
export type {
    G3DMedicalARConfig,
    G3DARSession,
    G3DMedicalARContext,
    G3DARObject,
    G3DARTrackingAnchor,
    G3DARTrackingData,
    G3DLightEstimate,
    G3DARPlane,
    G3DARCalibration,
    G3DCameraIntrinsics,
    G3DPatientRegistration,
    G3DLandmarkPoint,
    G3DInstrumentCalibration,
    G3DARGuidanceSystem,
    G3DGuidanceInstruction,
    G3DNavigationPath,
    G3DWaypoint,
    G3DSafetyZone,
    G3DCriticalStructure,
    G3DVisualizationStyle
} from './G3DMedicalAR';

// Holographic Imaging System
export { default as G3DHolographicImaging } from './G3DHolographicImaging';
export type {
    G3DHolographicConfig,
    G3DHolographicSession,
    G3DMedicalHolographicContext,
    G3DHolographicObject,
    G3DHolographicProperties,
    G3DHolographicViewer,
    G3DViewerPermissions
} from './G3DHolographicImaging';

// Collaborative Review System
export { default as G3DCollaborativeReview } from './G3DCollaborativeReview';
export type {
    G3DCollaborativeConfig,
    G3DCollaborativeSession,
    G3DMedicalCollaborativeContext,
    G3DParticipant,
    G3DMedicalCredentials,
    G3DParticipantPermissions,
    G3DAvatar,
    G3DSharedObject,
    G3DCollaborativeAnnotation,
    G3DAnnotationReply,
    G3DSessionState,
    G3DViewState,
    G3DConsensusItem,
    G3DVote
} from './G3DCollaborativeReview';

// Medical Haptics System
export { default as G3DMedicalHaptics } from './G3DMedicalHaptics';
export type {
    G3DMedicalHapticsConfig,
    G3DHapticSafetyLimits,
    G3DHapticSession,
    G3DMedicalHapticContext,
    G3DTissueType,
    G3DTissueProperties,
    G3DHapticModel,
    G3DVisualModel,
    G3DMedicalInstrument,
    G3DInstrumentProperties,
    G3DHapticMapping,
    G3DHapticDevice,
    G3DHapticCapabilities,
    G3DHapticCalibration,
    G3DHapticObject,
    G3DHapticObjectProperties,
    G3DMedicalObjectProperties,
    G3DInteractionState,
    G3DHapticPerformanceMetrics
} from './G3DMedicalHaptics';

// Common XR Types
export type {
    G3DVector2,
    G3DVector3,
    G3DQuaternion,
    G3DMatrix4
} from './G3DMedicalAR';

/**
 * G3D Medical XR Integration Manager
 * Orchestrates all XR systems for comprehensive medical applications
 */
export class G3DMedicalXRManager {
    private vrSystem: G3DMedicalVRClass | null = null;
    private arSystem: G3DMedicalARClass | null = null;
    private holographicSystem: G3DHolographicImagingClass | null = null;
    private collaborativeSystem: G3DCollaborativeReviewClass | null = null;
    private hapticsSystem: G3DMedicalHapticsClass | null = null;

    private isInitialized: boolean = false;

    constructor() {
        console.log('G3D Medical XR Manager created');
    }

    async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D Medical XR Manager...');

            // Initialize VR system
            this.vrSystem = new G3DMedicalVRClass();
            await this.vrSystem.init();

            // Initialize AR system
            this.arSystem = new G3DMedicalARClass();
            await this.arSystem.init();

            // Initialize holographic system
            this.holographicSystem = new G3DHolographicImagingClass();
            await this.holographicSystem.init();

            // Initialize collaborative system
            this.collaborativeSystem = new G3DCollaborativeReviewClass();
            await this.collaborativeSystem.init();

            // Initialize haptics system
            this.hapticsSystem = new G3DMedicalHapticsClass();
            await this.hapticsSystem.init();

            this.isInitialized = true;
            console.log('G3D Medical XR Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Medical XR Manager:', error);
            throw error;
        }
    }

    getVRSystem(): G3DMedicalVRClass | null {
        return this.vrSystem;
    }

    getARSystem(): G3DMedicalARClass | null {
        return this.arSystem;
    }

    getHolographicSystem(): G3DHolographicImagingClass | null {
        return this.holographicSystem;
    }

    getCollaborativeSystem(): G3DCollaborativeReviewClass | null {
        return this.collaborativeSystem;
    }

    getHapticsSystem(): G3DMedicalHapticsClass | null {
        return this.hapticsSystem;
    }

    isSystemInitialized(): boolean {
        return this.isInitialized;
    }

    dispose(): void {
        console.log('Disposing G3D Medical XR Manager...');

        if (this.vrSystem) {
            this.vrSystem.cleanup();
            this.vrSystem = null;
        }

        if (this.arSystem) {
            this.arSystem.cleanup();
            this.arSystem = null;
        }

        if (this.holographicSystem) {
            this.holographicSystem.cleanup();
            this.holographicSystem = null;
        }

        if (this.collaborativeSystem) {
            this.collaborativeSystem.cleanup();
            this.collaborativeSystem = null;
        }

        if (this.hapticsSystem) {
            this.hapticsSystem.cleanup();
            this.hapticsSystem = null;
        }

        this.isInitialized = false;
        console.log('G3D Medical XR Manager disposed');
    }
}

export default G3DMedicalXRManager;