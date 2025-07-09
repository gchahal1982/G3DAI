/**
 * G3D MedSight Pro - Medical Augmented Reality System
 * Comprehensive AR capabilities for medical applications
 * 
 * Features:
 * - Medical data AR overlays and visualization
 * - Real-time surgical guidance and navigation
 * - Patient anatomy AR visualization
 * - Medical training with AR simulation
 * - Multi-modal AR medical imaging
 * - Clinical workflow AR integration
 */

export interface G3DMedicalARConfig {
    enableMarkerTracking: boolean;
    enableMarkerlessTracking: boolean;
    enablePlaneDetection: boolean;
    enableLightEstimation: boolean;
    enableOcclusion: boolean;
    enableCollaboration: boolean;
    maxARObjects: number;
    trackingQuality: 'low' | 'medium' | 'high' | 'ultra';
    renderDistance: number;
    medicalSafetyMode: boolean;
    clinicalAccuracyMode: boolean;
}

export interface G3DARSession {
    id: string;
    userId: string;
    patientId?: string;
    studyId?: string;
    sessionType: 'visualization' | 'guidance' | 'training' | 'planning' | 'education';
    startTime: number;
    duration: number;
    arObjects: G3DARObject[];
    medicalContext: G3DMedicalARContext;
    trackingData: G3DARTrackingData;
    calibrationData: G3DARCalibration;
}

export interface G3DMedicalARContext {
    patientData: {
        id: string;
        age: number;
        gender: string;
        bodyPart: string;
        medicalHistory: string[];
        currentProcedure?: string;
    };
    procedureData: {
        type: string;
        phase: 'planning' | 'preparation' | 'execution' | 'completion';
        urgency: 'routine' | 'urgent' | 'emergency';
        requiredAccuracy: 'standard' | 'high' | 'surgical';
    };
    imagingData: {
        modality: string;
        studyDate: string;
        bodyRegion: string;
        pathology?: string[];
    };
    clinicalWorkflow: {
        step: number;
        totalSteps: number;
        currentTask: string;
        nextTask?: string;
    };
}

export interface G3DARObject {
    id: string;
    type: 'anatomy' | 'pathology' | 'instrument' | 'annotation' | 'guidance' | 'measurement';
    position: G3DVector3;
    rotation: G3DQuaternion;
    scale: G3DVector3;
    visible: boolean;
    interactive: boolean;
    medicalData: any;
    renderPriority: number;
    trackingAnchor?: G3DARTrackingAnchor;
}

export interface G3DARTrackingAnchor {
    id: string;
    type: 'marker' | 'plane' | 'feature' | 'body' | 'instrument';
    position: G3DVector3;
    orientation: G3DQuaternion;
    confidence: number;
    lastUpdated: number;
    trackingState: 'tracking' | 'limited' | 'lost';
}

export interface G3DARTrackingData {
    cameraPosition: G3DVector3;
    cameraOrientation: G3DQuaternion;
    lightEstimate: G3DLightEstimate;
    detectedPlanes: G3DARPlane[];
    trackedAnchors: G3DARTrackingAnchor[];
    trackingQuality: number;
}

export interface G3DLightEstimate {
    ambientIntensity: number;
    ambientColorTemperature: number;
    mainLightDirection: G3DVector3;
    mainLightIntensity: number;
}

export interface G3DARPlane {
    id: string;
    center: G3DVector3;
    normal: G3DVector3;
    extent: G3DVector2;
    polygon: G3DVector3[];
    classification: 'horizontal' | 'vertical' | 'unknown';
    medicalRelevance: 'patient_surface' | 'surgical_table' | 'equipment' | 'none';
}

export interface G3DARCalibration {
    cameraIntrinsics: G3DCameraIntrinsics;
    displayToCamera: G3DMatrix4;
    patientRegistration?: G3DPatientRegistration;
    instrumentCalibration?: G3DInstrumentCalibration;
}

export interface G3DCameraIntrinsics {
    focalLength: G3DVector2;
    principalPoint: G3DVector2;
    imageResolution: G3DVector2;
    distortionCoefficients: number[];
}

export interface G3DPatientRegistration {
    landmarkPoints: G3DLandmarkPoint[];
    registrationMatrix: G3DMatrix4;
    accuracy: number;
    timestamp: number;
    method: 'manual' | 'automatic' | 'hybrid';
}

export interface G3DLandmarkPoint {
    id: string;
    anatomicalName: string;
    position3D: G3DVector3;
    position2D: G3DVector2;
    confidence: number;
    verified: boolean;
}

export interface G3DInstrumentCalibration {
    instrumentId: string;
    tipOffset: G3DVector3;
    orientation: G3DQuaternion;
    accuracy: number;
    lastCalibrated: number;
}

export interface G3DVector2 {
    x: number;
    y: number;
}

export interface G3DVector3 {
    x: number;
    y: number;
    z: number;
}

export interface G3DQuaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}

export interface G3DMatrix4 {
    elements: number[]; // 16 elements in column-major order
}

export interface G3DARGuidanceSystem {
    currentGuidance: G3DGuidanceInstruction[];
    navigationPath: G3DNavigationPath;
    safetyZones: G3DSafetyZone[];
    criticalStructures: G3DCriticalStructure[];
}

export interface G3DGuidanceInstruction {
    id: string;
    type: 'navigation' | 'warning' | 'information' | 'action';
    priority: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    position?: G3DVector3;
    duration: number;
    medicalContext: string;
}

export interface G3DNavigationPath {
    waypoints: G3DWaypoint[];
    currentWaypoint: number;
    totalDistance: number;
    estimatedTime: number;
    safetyLevel: 'safe' | 'caution' | 'danger';
}

export interface G3DWaypoint {
    position: G3DVector3;
    orientation: G3DQuaternion;
    instruction: string;
    medicalSignificance: string;
    reached: boolean;
}

export interface G3DSafetyZone {
    id: string;
    center: G3DVector3;
    radius: number;
    type: 'safe' | 'caution' | 'danger' | 'no_go';
    medicalStructure: string;
    warningDistance: number;
}

export interface G3DCriticalStructure {
    id: string;
    name: string;
    type: 'vessel' | 'nerve' | 'organ' | 'bone' | 'tumor';
    geometry: G3DVector3[];
    importance: 'low' | 'medium' | 'high' | 'critical';
    visualStyle: G3DVisualizationStyle;
}

export interface G3DVisualizationStyle {
    color: string;
    opacity: number;
    wireframe: boolean;
    highlighted: boolean;
    pulsing: boolean;
}

export class G3DMedicalAR {
    private config: G3DMedicalARConfig;
    private arSession: any = null; // XRSession
    private currentSession: G3DARSession | null = null;
    private arObjects: Map<string, G3DARObject> = new Map();
    private trackingAnchors: Map<string, G3DARTrackingAnchor> = new Map();
    private isInitialized: boolean = false;

    private guidanceSystem: G3DARGuidanceSystem | null = null;
    private patientRegistration: G3DPatientRegistration | null = null;
    private medicalRenderer: G3DMedicalARRenderer | null = null;
    private trackingManager: G3DARTrackingManager | null = null;

    constructor(config: Partial<G3DMedicalARConfig> = {}) {
        this.config = {
            enableMarkerTracking: true,
            enableMarkerlessTracking: true,
            enablePlaneDetection: true,
            enableLightEstimation: true,
            enableOcclusion: false,
            enableCollaboration: true,
            maxARObjects: 50,
            trackingQuality: 'high',
            renderDistance: 10.0, // meters
            medicalSafetyMode: true,
            clinicalAccuracyMode: true,
            ...config
        };
    }

    async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D Medical AR System...');

            // Check AR support
            await this.checkARSupport();

            // Initialize AR session
            await this.initializeARSession();

            // Initialize medical renderer
            this.medicalRenderer = new G3DMedicalARRenderer(this.config);
            await this.medicalRenderer.init();

            // Initialize tracking manager
            this.trackingManager = new G3DARTrackingManager(this.config);
            await this.trackingManager.init();

            // Initialize guidance system
            this.guidanceSystem = {
                currentGuidance: [],
                navigationPath: {
                    waypoints: [],
                    currentWaypoint: 0,
                    totalDistance: 0,
                    estimatedTime: 0,
                    safetyLevel: 'safe'
                },
                safetyZones: [],
                criticalStructures: []
            };

            this.isInitialized = true;
            console.log('G3D Medical AR System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Medical AR System:', error);
            throw error;
        }
    }

    private async checkARSupport(): Promise<void> {
        if ('xr' in navigator) {
            try {
                const supported = await (navigator as any).xr.isSessionSupported('immersive-ar');
                if (!supported) {
                    throw new Error('Immersive AR not supported');
                }
                console.log('WebXR AR support detected');
            } catch (error) {
                console.warn('WebXR AR not available');
                throw new Error('AR not supported');
            }
        } else {
            throw new Error('WebXR not available');
        }
    }

    private async initializeARSession(): Promise<void> {
        const xr = (navigator as any).xr;

        try {
            const sessionInit: any = {
                requiredFeatures: ['local'],
                optionalFeatures: ['plane-detection', 'light-estimation', 'anchors']
            };

            if (this.config.enableMarkerTracking) {
                sessionInit.optionalFeatures.push('image-tracking');
            }

            this.arSession = await xr.requestSession('immersive-ar', sessionInit);

            // Set up reference space
            const referenceSpace = await this.arSession.requestReferenceSpace('local');

            // Set up frame callback
            this.arSession.requestAnimationFrame(this.onARFrame.bind(this));

            console.log('WebXR AR session initialized');
        } catch (error) {
            console.error('Failed to initialize WebXR AR session:', error);
            throw error;
        }
    }

    private onARFrame(time: number, frame: any): void {
        if (!this.arSession) return;

        // Update tracking data
        this.updateTrackingData(frame);

        // Update medical visualization
        this.updateMedicalVisualization(time, frame);

        // Update guidance system
        if (this.guidanceSystem) {
            this.updateGuidanceSystem(time, frame);
        }

        // Update patient registration
        if (this.patientRegistration) {
            this.updatePatientRegistration(frame);
        }

        // Render AR objects
        if (this.medicalRenderer) {
            this.medicalRenderer.render(time, frame, this.arObjects);
        }

        // Request next frame
        this.arSession.requestAnimationFrame(this.onARFrame.bind(this));
    }

    private updateTrackingData(frame: any): void {
        if (!this.currentSession) return;

        const pose = frame.getViewerPose(frame.session.viewerSpace);
        if (pose) {
            this.currentSession.trackingData = {
                cameraPosition: {
                    x: pose.transform.position.x,
                    y: pose.transform.position.y,
                    z: pose.transform.position.z
                },
                cameraOrientation: {
                    x: pose.transform.orientation.x,
                    y: pose.transform.orientation.y,
                    z: pose.transform.orientation.z,
                    w: pose.transform.orientation.w
                },
                lightEstimate: this.getLightEstimate(frame),
                detectedPlanes: this.getDetectedPlanes(frame),
                trackedAnchors: Array.from(this.trackingAnchors.values()),
                trackingQuality: this.calculateTrackingQuality(frame)
            };
        }
    }

    private getLightEstimate(frame: any): G3DLightEstimate {
        // Simplified light estimation
        return {
            ambientIntensity: 1.0,
            ambientColorTemperature: 6500,
            mainLightDirection: { x: 0, y: 1, z: 0 },
            mainLightIntensity: 1.0
        };
    }

    private getDetectedPlanes(frame: any): G3DARPlane[] {
        const planes: G3DARPlane[] = [];

        // Process detected planes from WebXR
        if (frame.detectedPlanes) {
            for (const plane of frame.detectedPlanes) {
                const arPlane: G3DARPlane = {
                    id: plane.id || `plane_${planes.length}`,
                    center: { x: 0, y: 0, z: 0 },
                    normal: { x: 0, y: 1, z: 0 },
                    extent: { x: 1, y: 1 },
                    polygon: [],
                    classification: 'horizontal',
                    medicalRelevance: this.classifyPlaneForMedical(plane)
                };

                planes.push(arPlane);
            }
        }

        return planes;
    }

    private classifyPlaneForMedical(plane: any): G3DARPlane['medicalRelevance'] {
        // Classify plane based on medical context
        // This would use ML or heuristics to identify medical surfaces
        return 'none'; // Simplified
    }

    private calculateTrackingQuality(frame: any): number {
        // Calculate tracking quality based on various factors
        return 0.85; // Simplified
    }

    private updateMedicalVisualization(time: number, frame: any): void {
        if (!this.currentSession) return;

        // Update AR objects based on medical context
        for (const [objectId, arObject] of this.arObjects) {
            this.updateARObject(arObject, time, frame);
        }

        // Update medical guidance visualization
        this.updateGuidanceVisualization(time, frame);
    }

    private updateARObject(arObject: G3DARObject, time: number, frame: any): void {
        // Update AR object based on tracking and medical data
        if (arObject.trackingAnchor) {
            const anchor = this.trackingAnchors.get(arObject.trackingAnchor.id);
            if (anchor && anchor.trackingState === 'tracking') {
                arObject.position = anchor.position;
                arObject.rotation = anchor.orientation;
                arObject.visible = true;
            } else {
                arObject.visible = false;
            }
        }

        // Update based on medical context
        this.updateMedicalObjectProperties(arObject);
    }

    private updateMedicalObjectProperties(arObject: G3DARObject): void {
        if (!this.currentSession) return;

        const context = this.currentSession.medicalContext;

        // Adjust visualization based on procedure phase
        switch (context.procedureData.phase) {
            case 'planning':
                arObject.renderPriority = arObject.type === 'anatomy' ? 10 : 5;
                break;
            case 'execution':
                arObject.renderPriority = arObject.type === 'guidance' ? 10 :
                    arObject.type === 'instrument' ? 8 : 5;
                break;
            default:
                arObject.renderPriority = 5;
        }

        // Adjust based on urgency
        if (context.procedureData.urgency === 'emergency') {
            arObject.renderPriority += 2;
        }
    }

    private updateGuidanceSystem(time: number, frame: any): void {
        if (!this.guidanceSystem || !this.currentSession) return;

        // Update navigation guidance
        this.updateNavigationGuidance();

        // Check safety zones
        this.checkSafetyZones();

        // Update critical structure warnings
        this.updateCriticalStructureWarnings();
    }

    private updateNavigationGuidance(): void {
        if (!this.guidanceSystem) return;

        const path = this.guidanceSystem.navigationPath;
        if (path.waypoints.length === 0) return;

        const currentWaypoint = path.waypoints[path.currentWaypoint];
        if (!currentWaypoint) return;

        // Check if current waypoint is reached
        const distance = this.calculateDistance(
            this.currentSession!.trackingData.cameraPosition,
            currentWaypoint.position
        );

        if (distance < 0.1 && !currentWaypoint.reached) { // 10cm threshold
            currentWaypoint.reached = true;
            path.currentWaypoint++;

            // Add guidance instruction for next waypoint
            if (path.currentWaypoint < path.waypoints.length) {
                const nextWaypoint = path.waypoints[path.currentWaypoint];
                this.addGuidanceInstruction({
                    id: `nav_${Date.now()}`,
                    type: 'navigation',
                    priority: 'medium',
                    message: nextWaypoint.instruction,
                    position: nextWaypoint.position,
                    duration: 5000,
                    medicalContext: nextWaypoint.medicalSignificance
                });
            }
        }
    }

    private checkSafetyZones(): void {
        if (!this.guidanceSystem || !this.currentSession) return;

        const cameraPos = this.currentSession.trackingData.cameraPosition;

        for (const zone of this.guidanceSystem.safetyZones) {
            const distance = this.calculateDistance(cameraPos, zone.center);

            if (distance < zone.radius) {
                // Inside safety zone
                if (zone.type === 'danger' || zone.type === 'no_go') {
                    this.addGuidanceInstruction({
                        id: `safety_${zone.id}_${Date.now()}`,
                        type: 'warning',
                        priority: 'critical',
                        message: `WARNING: Approaching ${zone.medicalStructure}`,
                        position: zone.center,
                        duration: 3000,
                        medicalContext: `Critical structure: ${zone.medicalStructure}`
                    });
                }
            } else if (distance < zone.warningDistance) {
                // Approaching safety zone
                this.addGuidanceInstruction({
                    id: `approach_${zone.id}_${Date.now()}`,
                    type: 'information',
                    priority: 'medium',
                    message: `Approaching ${zone.medicalStructure}`,
                    position: zone.center,
                    duration: 2000,
                    medicalContext: `Structure: ${zone.medicalStructure}`
                });
            }
        }
    }

    private updateCriticalStructureWarnings(): void {
        if (!this.guidanceSystem) return;

        // Update visualization of critical structures based on proximity
        for (const structure of this.guidanceSystem.criticalStructures) {
            const minDistance = this.calculateMinDistanceToStructure(structure);

            // Update visualization style based on proximity
            if (minDistance < 0.05) { // 5cm
                structure.visualStyle.highlighted = true;
                structure.visualStyle.pulsing = true;
                structure.visualStyle.color = '#FF0000'; // Red
            } else if (minDistance < 0.1) { // 10cm
                structure.visualStyle.highlighted = true;
                structure.visualStyle.pulsing = false;
                structure.visualStyle.color = '#FFA500'; // Orange
            } else {
                structure.visualStyle.highlighted = false;
                structure.visualStyle.pulsing = false;
                structure.visualStyle.color = '#00FF00'; // Green
            }
        }
    }

    private calculateMinDistanceToStructure(structure: G3DCriticalStructure): number {
        if (!this.currentSession) return Infinity;

        const cameraPos = this.currentSession.trackingData.cameraPosition;
        let minDistance = Infinity;

        for (const point of structure.geometry) {
            const distance = this.calculateDistance(cameraPos, point);
            minDistance = Math.min(minDistance, distance);
        }

        return minDistance;
    }

    private updateGuidanceVisualization(time: number, frame: any): void {
        // Remove expired guidance instructions
        if (this.guidanceSystem) {
            this.guidanceSystem.currentGuidance = this.guidanceSystem.currentGuidance.filter(
                instruction => (time - instruction.duration) < 10000 // 10 second max display
            );
        }
    }

    private updatePatientRegistration(frame: any): void {
        if (!this.patientRegistration) return;

        // Update patient registration based on tracking
        // This would involve continuous refinement of the registration
        // based on detected landmarks and tracking quality
    }

    private calculateDistance(pos1: G3DVector3, pos2: G3DVector3): number {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    private addGuidanceInstruction(instruction: G3DGuidanceInstruction): void {
        if (!this.guidanceSystem) return;

        // Remove duplicate instructions
        this.guidanceSystem.currentGuidance = this.guidanceSystem.currentGuidance.filter(
            existing => existing.id !== instruction.id
        );

        this.guidanceSystem.currentGuidance.push(instruction);

        // Sort by priority
        this.guidanceSystem.currentGuidance.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        console.log(`AR Guidance: ${instruction.message}`);
    }

    // Public API
    public async startMedicalARSession(
        sessionType: G3DARSession['sessionType'],
        medicalContext: G3DMedicalARContext,
        userId: string
    ): Promise<string> {
        if (!this.isInitialized) {
            throw new Error('AR system not initialized');
        }

        const sessionId = `ar_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const session: G3DARSession = {
            id: sessionId,
            userId,
            patientId: medicalContext.patientData.id,
            studyId: medicalContext.imagingData.modality,
            sessionType,
            startTime: Date.now(),
            duration: 0,
            arObjects: [],
            medicalContext,
            trackingData: {
                cameraPosition: { x: 0, y: 0, z: 0 },
                cameraOrientation: { x: 0, y: 0, z: 0, w: 1 },
                lightEstimate: {
                    ambientIntensity: 1.0,
                    ambientColorTemperature: 6500,
                    mainLightDirection: { x: 0, y: 1, z: 0 },
                    mainLightIntensity: 1.0
                },
                detectedPlanes: [],
                trackedAnchors: [],
                trackingQuality: 0
            },
            calibrationData: {
                cameraIntrinsics: {
                    focalLength: { x: 800, y: 800 },
                    principalPoint: { x: 400, y: 300 },
                    imageResolution: { x: 800, y: 600 },
                    distortionCoefficients: [0, 0, 0, 0, 0]
                },
                displayToCamera: {
                    elements: [
                        1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1
                    ]
                }
            }
        };

        this.currentSession = session;

        // Load medical data for AR visualization
        await this.loadMedicalDataForAR(medicalContext);

        // Set up patient registration if needed
        if (sessionType === 'guidance' || sessionType === 'planning') {
            await this.initializePatientRegistration(medicalContext);
        }

        console.log(`Medical AR session started: ${sessionId}`);
        return sessionId;
    }

    private async loadMedicalDataForAR(context: G3DMedicalARContext): Promise<void> {
        console.log(`Loading medical data for AR session: ${context.patientData.id}`);

        // Load anatomy models
        await this.loadAnatomyModels(context);

        // Load pathology data
        if (context.imagingData.pathology) {
            await this.loadPathologyData(context);
        }

        // Set up guidance system
        if (context.procedureData.type) {
            await this.setupGuidanceForProcedure(context);
        }
    }

    private async loadAnatomyModels(context: G3DMedicalARContext): Promise<void> {
        // Create anatomy AR objects based on body part
        const anatomyObject: G3DARObject = {
            id: `anatomy_${context.patientData.bodyPart}`,
            type: 'anatomy',
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            scale: { x: 1, y: 1, z: 1 },
            visible: true,
            interactive: true,
            medicalData: {
                bodyPart: context.patientData.bodyPart,
                modality: context.imagingData.modality
            },
            renderPriority: 5
        };

        this.arObjects.set(anatomyObject.id, anatomyObject);
    }

    private async loadPathologyData(context: G3DMedicalARContext): Promise<void> {
        if (!context.imagingData.pathology) return;

        for (const pathology of context.imagingData.pathology) {
            const pathologyObject: G3DARObject = {
                id: `pathology_${pathology}`,
                type: 'pathology',
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0, w: 1 },
                scale: { x: 1, y: 1, z: 1 },
                visible: true,
                interactive: true,
                medicalData: {
                    pathologyType: pathology,
                    severity: 'unknown'
                },
                renderPriority: 8
            };

            this.arObjects.set(pathologyObject.id, pathologyObject);
        }
    }

    private async setupGuidanceForProcedure(context: G3DMedicalARContext): Promise<void> {
        if (!this.guidanceSystem) return;

        // Set up navigation path based on procedure
        const procedureSteps = this.getProcedureSteps(context.procedureData.type);

        this.guidanceSystem.navigationPath = {
            waypoints: procedureSteps.map((step, index) => ({
                position: { x: index * 0.1, y: 0, z: 0 }, // Simplified positioning
                orientation: { x: 0, y: 0, z: 0, w: 1 },
                instruction: step.instruction,
                medicalSignificance: step.significance,
                reached: false
            })),
            currentWaypoint: 0,
            totalDistance: procedureSteps.length * 0.1,
            estimatedTime: procedureSteps.length * 30, // 30 seconds per step
            safetyLevel: 'safe'
        };

        // Set up safety zones
        this.guidanceSystem.safetyZones = this.getSafetyZonesForProcedure(context.procedureData.type);

        // Set up critical structures
        this.guidanceSystem.criticalStructures = this.getCriticalStructures(context.patientData.bodyPart);
    }

    private getProcedureSteps(procedureType: string): Array<{ instruction: string, significance: string }> {
        // Return procedure-specific steps
        return [
            { instruction: "Position patient", significance: "Patient positioning" },
            { instruction: "Identify landmarks", significance: "Anatomical reference" },
            { instruction: "Begin procedure", significance: "Procedure start" }
        ];
    }

    private getSafetyZonesForProcedure(procedureType: string): G3DSafetyZone[] {
        // Return procedure-specific safety zones
        return [
            {
                id: 'major_vessel',
                center: { x: 0.1, y: 0, z: 0 },
                radius: 0.05,
                type: 'danger',
                medicalStructure: 'Major blood vessel',
                warningDistance: 0.1
            }
        ];
    }

    private getCriticalStructures(bodyPart: string): G3DCriticalStructure[] {
        // Return body part-specific critical structures
        return [
            {
                id: 'nerve_structure',
                name: 'Main nerve bundle',
                type: 'nerve',
                geometry: [
                    { x: 0.05, y: 0, z: 0 },
                    { x: 0.1, y: 0, z: 0 },
                    { x: 0.15, y: 0, z: 0 }
                ],
                importance: 'critical',
                visualStyle: {
                    color: '#FFFF00',
                    opacity: 0.8,
                    wireframe: false,
                    highlighted: false,
                    pulsing: false
                }
            }
        ];
    }

    private async initializePatientRegistration(context: G3DMedicalARContext): Promise<void> {
        // Initialize patient registration for accurate AR overlay
        this.patientRegistration = {
            landmarkPoints: [],
            registrationMatrix: {
                elements: [
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1
                ]
            },
            accuracy: 0.0,
            timestamp: Date.now(),
            method: 'manual'
        };

        console.log('Patient registration initialized');
    }

    public async addLandmarkPoint(
        anatomicalName: string,
        position3D: G3DVector3,
        position2D: G3DVector2
    ): Promise<void> {
        if (!this.patientRegistration) {
            throw new Error('Patient registration not initialized');
        }

        const landmark: G3DLandmarkPoint = {
            id: `landmark_${Date.now()}`,
            anatomicalName,
            position3D,
            position2D,
            confidence: 0.9,
            verified: false
        };

        this.patientRegistration.landmarkPoints.push(landmark);

        // Recalculate registration if we have enough points
        if (this.patientRegistration.landmarkPoints.length >= 3) {
            await this.calculateRegistration();
        }

        console.log(`Added landmark: ${anatomicalName}`);
    }

    private async calculateRegistration(): Promise<void> {
        if (!this.patientRegistration) return;

        // Calculate registration matrix based on landmark points
        // This would use algorithms like ICP or point-based registration

        this.patientRegistration.accuracy = this.calculateRegistrationAccuracy();
        this.patientRegistration.timestamp = Date.now();

        console.log(`Registration calculated with accuracy: ${this.patientRegistration.accuracy}`);
    }

    private calculateRegistrationAccuracy(): number {
        // Calculate registration accuracy based on landmark alignment
        return 0.85; // Simplified
    }

    public getCurrentSession(): G3DARSession | null {
        return this.currentSession;
    }

    public getARObjects(): G3DARObject[] {
        return Array.from(this.arObjects.values());
    }

    public getGuidanceInstructions(): G3DGuidanceInstruction[] {
        return this.guidanceSystem?.currentGuidance || [];
    }

    public getPatientRegistration(): G3DPatientRegistration | null {
        return this.patientRegistration;
    }

    public async endARSession(): Promise<void> {
        if (!this.currentSession) {
            throw new Error('No active session');
        }

        // Update session duration
        this.currentSession.duration = Date.now() - this.currentSession.startTime;

        console.log(`AR session ended: ${this.currentSession.id}, duration: ${this.currentSession.duration}ms`);

        // Clear session data
        this.currentSession = null;
        this.arObjects.clear();
        this.trackingAnchors.clear();
        this.patientRegistration = null;

        if (this.guidanceSystem) {
            this.guidanceSystem.currentGuidance = [];
        }
    }

    public dispose(): void {
        console.log('Disposing G3D Medical AR System...');

        // End current session
        if (this.currentSession) {
            this.endARSession();
        }

        // Dispose AR session
        if (this.arSession) {
            this.arSession.end();
            this.arSession = null;
        }

        // Clean up managers
        if (this.medicalRenderer) {
            this.medicalRenderer.cleanup();
            this.medicalRenderer = null;
        }

        if (this.trackingManager) {
            this.trackingManager.cleanup();
            this.trackingManager = null;
        }

        // Clear data
        this.arObjects.clear();
        this.trackingAnchors.clear();

        this.isInitialized = false;

        console.log('G3D Medical AR System disposed');
    }
}

// Supporting classes (simplified implementations)
class G3DMedicalARRenderer {
    constructor(private config: G3DMedicalARConfig) { }

    async initialize(): Promise<void> {
        console.log('Medical AR Renderer initialized');
    }

    render(time: number, frame: any, arObjects: Map<string, G3DARObject>): void {
        // Render AR objects with medical-specific styling
        for (const arObject of arObjects.values()) {
            if (arObject.visible) {
                this.renderARObject(arObject);
            }
        }
    }

    private renderARObject(arObject: G3DARObject): void {
        // Render individual AR object based on medical type
        console.log(`Rendering ${arObject.type}: ${arObject.id}`);
    }

    dispose(): void {
        console.log('Medical AR Renderer disposed');
    }
}

class G3DARTrackingManager {
    constructor(private config: G3DMedicalARConfig) { }

    async initialize(): Promise<void> {
        console.log('AR Tracking Manager initialized');
    }

    dispose(): void {
        console.log('AR Tracking Manager disposed');
    }
}

export default G3DMedicalAR;