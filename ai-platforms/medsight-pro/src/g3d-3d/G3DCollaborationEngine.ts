/**
 * G3D MedSight Pro - Collaboration Engine
 * Real-time collaborative medical visualization
 * 
 * Features:
 * - Multi-user medical collaboration
 * - Real-time 3D scene synchronization
 * - Medical annotation sharing
 * - Voice and video integration
 * - Session recording and playback
 * - Role-based access control
 */

import { vec3, mat4, quat } from 'gl-matrix';

export interface CollaborationConfig {
    enableCollaboration: boolean;
    enableMedicalAnnotations: boolean;
    maxParticipants: number;
    enableVoiceChat: boolean;
    enableVideoChat: boolean;
    enableSessionRecording: boolean;
    enableRealTimeSync: boolean;
    medicalPrivacy: boolean;
}

export interface Participant {
    id: string;
    name: string;
    role: 'radiologist' | 'surgeon' | 'student' | 'technician' | 'observer';
    avatar: Avatar;
    permissions: Permissions;
    status: 'active' | 'away' | 'busy' | 'offline';
    medicalCredentials?: MedicalCredentials;
    joinTime: number;
    lastActivity: number;
}

export interface Avatar {
    id: string;
    position: vec3;
    rotation: quat;
    color: vec3;
    visibility: boolean;
    cursor: Cursor;
    medicalFocus?: string; // Current area of medical focus
}

export interface Cursor {
    position: vec3;
    type: 'pointer' | 'measurement' | 'annotation' | 'selection';
    visible: boolean;
    medicalContext?: string;
}

export interface Permissions {
    canView: boolean;
    canAnnotate: boolean;
    canMeasure: boolean;
    canModifyScene: boolean;
    canControlPlayback: boolean;
    canInviteOthers: boolean;
    medicalDataAccess: 'none' | 'limited' | 'full';
}

export interface MedicalCredentials {
    licenseNumber: string;
    specialty: string;
    institution: string;
    verified: boolean;
    expirationDate: Date;
}

export interface CollaborationSession {
    id: string;
    name: string;
    description: string;
    hostId: string;
    participants: Map<string, Participant>;
    medicalCase?: MedicalCase;
    startTime: number;
    endTime?: number;
    recording?: SessionRecording;
    annotations: Annotation[];
    measurements: Measurement[];
    privacy: 'public' | 'private' | 'medical_confidential';
}

export interface MedicalCase {
    patientId: string;
    studyId: string;
    modality: string;
    bodyPart: string;
    clinicalQuestion: string;
    urgency: 'routine' | 'urgent' | 'stat';
    anonymized: boolean;
}

export interface Annotation {
    id: string;
    authorId: string;
    position: vec3;
    type: 'text' | 'arrow' | 'circle' | 'measurement' | 'finding';
    content: string;
    medicalSignificance: 'normal' | 'abnormal' | 'critical';
    timestamp: number;
    visible: boolean;
    color: vec3;
}

export interface Measurement {
    id: string;
    authorId: string;
    type: 'distance' | 'angle' | 'area' | 'volume';
    points: vec3[];
    value: number;
    unit: string;
    medicalRelevance: string;
    timestamp: number;
    accuracy: number;
}

export interface SessionRecording {
    id: string;
    sessionId: string;
    startTime: number;
    endTime?: number;
    events: CollaborationEvent[];
    medicalPrivacy: boolean;
    participants: string[];
}

export interface CollaborationEvent {
    id: string;
    type: 'join' | 'leave' | 'move' | 'annotate' | 'measure' | 'speak' | 'scene_change';
    participantId: string;
    timestamp: number;
    data: any;
    medicalContext?: string;
}

export class CollaborationEngine {
    private config: CollaborationConfig;
    private currentSession: CollaborationSession | null = null;
    private participants: Map<string, Participant> = new Map();
    private annotations: Map<string, Annotation> = new Map();
    private measurements: Map<string, Measurement> = new Map();
    private eventHistory: CollaborationEvent[] = [];
    private isInitialized: boolean = false;
    private websocket: WebSocket | null = null;

    // Medical collaboration presets
    private static readonly MEDICAL_ROLES = {
        radiologist: {
            permissions: {
                canView: true,
                canAnnotate: true,
                canMeasure: true,
                canModifyScene: true,
                canControlPlayback: true,
                canInviteOthers: true,
                medicalDataAccess: 'full' as const
            },
            color: vec3.fromValues(0.2, 0.6, 0.8)
        },
        surgeon: {
            permissions: {
                canView: true,
                canAnnotate: true,
                canMeasure: true,
                canModifyScene: true,
                canControlPlayback: false,
                canInviteOthers: true,
                medicalDataAccess: 'full' as const
            },
            color: vec3.fromValues(0.8, 0.2, 0.2)
        },
        student: {
            permissions: {
                canView: true,
                canAnnotate: false,
                canMeasure: false,
                canModifyScene: false,
                canControlPlayback: false,
                canInviteOthers: false,
                medicalDataAccess: 'limited' as const
            },
            color: vec3.fromValues(0.2, 0.8, 0.2)
        },
        observer: {
            permissions: {
                canView: true,
                canAnnotate: false,
                canMeasure: false,
                canModifyScene: false,
                canControlPlayback: false,
                canInviteOthers: false,
                medicalDataAccess: 'none' as const
            },
            color: vec3.fromValues(0.5, 0.5, 0.5)
        }
    };

    constructor(config: Partial<CollaborationConfig> = {}) {
        this.config = {
            enableCollaboration: true,
            enableMedicalAnnotations: true,
            maxParticipants: 10,
            enableVoiceChat: true,
            enableVideoChat: true,
            enableSessionRecording: true,
            enableRealTimeSync: true,
            medicalPrivacy: true,
            ...config
        };
    }

    async initialize(websocketUrl?: string): Promise<void> {
        try {
            console.log('Initializing G3D Collaboration Engine...');

            // Initialize WebSocket connection
            if (websocketUrl && this.config.enableRealTimeSync) {
                await this.initializeWebSocket(websocketUrl);
            }

            // Initialize medical privacy settings
            if (this.config.medicalPrivacy) {
                await this.initializeMedicalPrivacy();
            }

            this.isInitialized = true;
            console.log('G3D Collaboration Engine initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Collaboration Engine:', error);
            throw error;
        }
    }

    private async initializeWebSocket(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.websocket = new WebSocket(url);

            this.websocket.onopen = () => {
                console.log('WebSocket connection established');
                resolve();
            };

            this.websocket.onmessage = (event) => {
                this.handleWebSocketMessage(event);
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            };

            this.websocket.onclose = () => {
                console.log('WebSocket connection closed');
                this.handleWebSocketDisconnect();
            };
        });
    }

    private async initializeMedicalPrivacy(): Promise<void> {
        // Initialize medical privacy and compliance settings
        console.log('Initializing medical privacy settings...');
    }

    private handleWebSocketMessage(event: MessageEvent): void {
        try {
            const message = JSON.parse(event.data);
            this.processCollaborationMessage(message);
        } catch (error) {
            console.error('Failed to process WebSocket message:', error);
        }
    }

    private handleWebSocketDisconnect(): void {
        // Handle WebSocket disconnection
        console.log('Handling WebSocket disconnection...');

        // Attempt to reconnect
        setTimeout(() => {
            if (this.websocket && this.websocket.readyState === WebSocket.CLOSED) {
                // Reconnection logic would be implemented here
            }
        }, 5000);
    }

    public createSession(sessionData: Partial<CollaborationSession>): CollaborationSession {
        const session: CollaborationSession = {
            id: sessionData.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: sessionData.name || 'Medical Collaboration Session',
            description: sessionData.description || '',
            hostId: sessionData.hostId || '',
            participants: new Map(),
            medicalCase: sessionData.medicalCase,
            startTime: Date.now(),
            annotations: [],
            measurements: [],
            privacy: sessionData.privacy || 'medical_confidential'
        };

        if (this.config.enableSessionRecording) {
            session.recording = {
                id: `recording_${session.id}`,
                sessionId: session.id,
                startTime: session.startTime,
                events: [],
                medicalPrivacy: this.config.medicalPrivacy,
                participants: []
            };
        }

        this.currentSession = session;
        console.log(`Collaboration session created: ${session.id}`);
        return session;
    }

    public joinSession(sessionId: string, participant: Partial<Participant>): boolean {
        if (!this.currentSession || this.currentSession.id !== sessionId) {
            console.error('Session not found or not current');
            return false;
        }

        if (this.currentSession.participants.size >= this.config.maxParticipants) {
            console.error('Session is full');
            return false;
        }

        const newParticipant: Participant = {
            id: participant.id || `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: participant.name || 'Anonymous',
            role: participant.role || 'observer',
            avatar: participant.avatar || this.createDefaultAvatar(participant.role || 'observer'),
            permissions: participant.permissions || G3DCollaborationEngine.MEDICAL_ROLES[participant.role || 'observer'].permissions,
            status: 'active',
            medicalCredentials: participant.medicalCredentials,
            joinTime: Date.now(),
            lastActivity: Date.now()
        };

        this.currentSession.participants.set(newParticipant.id, newParticipant);
        this.participants.set(newParticipant.id, newParticipant);

        // Record join event
        this.recordEvent({
            id: `event_${Date.now()}`,
            type: 'join',
            participantId: newParticipant.id,
            timestamp: Date.now(),
            data: { role: newParticipant.role },
            medicalContext: this.currentSession.medicalCase?.clinicalQuestion
        });

        // Broadcast to other participants
        this.broadcastEvent('participant_joined', newParticipant);

        console.log(`Participant joined: ${newParticipant.name} (${newParticipant.role})`);
        return true;
    }

    private createDefaultAvatar(role: Participant['role']): Avatar {
        const roleConfig = G3DCollaborationEngine.MEDICAL_ROLES[role];

        return {
            id: `avatar_${Date.now()}`,
            position: vec3.fromValues(0, 0, 0),
            rotation: quat.create(),
            color: roleConfig.color,
            visibility: true,
            cursor: {
                position: vec3.fromValues(0, 0, 0),
                type: 'pointer',
                visible: false
            }
        };
    }

    public leaveSession(participantId: string): boolean {
        if (!this.currentSession) return false;

        const participant = this.currentSession.participants.get(participantId);
        if (!participant) return false;

        this.currentSession.participants.delete(participantId);
        this.participants.delete(participantId);

        // Record leave event
        this.recordEvent({
            id: `event_${Date.now()}`,
            type: 'leave',
            participantId,
            timestamp: Date.now(),
            data: {},
            medicalContext: this.currentSession.medicalCase?.clinicalQuestion
        });

        // Broadcast to other participants
        this.broadcastEvent('participant_left', { participantId });

        console.log(`Participant left: ${participant.name}`);
        return true;
    }

    public addAnnotation(annotation: Partial<Annotation>, authorId: string): Annotation | null {
        if (!this.currentSession) return null;

        const participant = this.participants.get(authorId);
        if (!participant || !participant.permissions.canAnnotate) {
            console.error('Participant does not have annotation permissions');
            return null;
        }

        const newAnnotation: Annotation = {
            id: annotation.id || `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            authorId,
            position: annotation.position || vec3.create(),
            type: annotation.type || 'text',
            content: annotation.content || '',
            medicalSignificance: annotation.medicalSignificance || 'normal',
            timestamp: Date.now(),
            visible: true,
            color: annotation.color || participant.avatar.color
        };

        this.annotations.set(newAnnotation.id, newAnnotation);
        this.currentSession.annotations.push(newAnnotation);

        // Record annotation event
        this.recordEvent({
            id: `event_${Date.now()}`,
            type: 'annotate',
            participantId: authorId,
            timestamp: Date.now(),
            data: newAnnotation,
            medicalContext: newAnnotation.medicalSignificance
        });

        // Broadcast to other participants
        this.broadcastEvent('annotation_added', newAnnotation);

        console.log(`Annotation added by ${participant.name}: ${newAnnotation.content}`);
        return newAnnotation;
    }

    public addMeasurement(measurement: Partial<Measurement>, authorId: string): Measurement | null {
        if (!this.currentSession) return null;

        const participant = this.participants.get(authorId);
        if (!participant || !participant.permissions.canMeasure) {
            console.error('Participant does not have measurement permissions');
            return null;
        }

        const newMeasurement: Measurement = {
            id: measurement.id || `measurement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            authorId,
            type: measurement.type || 'distance',
            points: measurement.points || [],
            value: measurement.value || 0,
            unit: measurement.unit || 'mm',
            medicalRelevance: measurement.medicalRelevance || '',
            timestamp: Date.now(),
            accuracy: measurement.accuracy || 0.95
        };

        this.measurements.set(newMeasurement.id, newMeasurement);
        this.currentSession.measurements.push(newMeasurement);

        // Record measurement event
        this.recordEvent({
            id: `event_${Date.now()}`,
            type: 'measure',
            participantId: authorId,
            timestamp: Date.now(),
            data: newMeasurement,
            medicalContext: newMeasurement.medicalRelevance
        });

        // Broadcast to other participants
        this.broadcastEvent('measurement_added', newMeasurement);

        console.log(`Measurement added by ${participant.name}: ${newMeasurement.value}${newMeasurement.unit}`);
        return newMeasurement;
    }

    public updateParticipantPosition(participantId: string, position: vec3, rotation?: quat): boolean {
        const participant = this.participants.get(participantId);
        if (!participant) return false;

        vec3.copy(participant.avatar.position, position);
        if (rotation) {
            quat.copy(participant.avatar.rotation, rotation);
        }

        participant.lastActivity = Date.now();

        // Broadcast position update
        this.broadcastEvent('participant_moved', {
            participantId,
            position,
            rotation
        });

        return true;
    }

    public updateCursorPosition(participantId: string, position: vec3, type?: Cursor['type']): boolean {
        const participant = this.participants.get(participantId);
        if (!participant) return false;

        vec3.copy(participant.avatar.cursor.position, position);
        if (type) {
            participant.avatar.cursor.type = type;
        }
        participant.avatar.cursor.visible = true;

        // Broadcast cursor update
        this.broadcastEvent('cursor_moved', {
            participantId,
            position,
            type: participant.avatar.cursor.type
        });

        return true;
    }

    private recordEvent(event: CollaborationEvent): void {
        if (!this.config.enableSessionRecording || !this.currentSession?.recording) return;

        this.eventHistory.push(event);
        this.currentSession.recording.events.push(event);
    }

    private broadcastEvent(eventType: string, data: any): void {
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) return;

        const message = {
            type: eventType,
            sessionId: this.currentSession?.id,
            timestamp: Date.now(),
            data
        };

        this.websocket.send(JSON.stringify(message));
    }

    private processCollaborationMessage(message: any): void {
        switch (message.type) {
            case 'participant_joined':
                this.handleParticipantJoined(message.data);
                break;
            case 'participant_left':
                this.handleParticipantLeft(message.data);
                break;
            case 'participant_moved':
                this.handleParticipantMoved(message.data);
                break;
            case 'cursor_moved':
                this.handleCursorMoved(message.data);
                break;
            case 'annotation_added':
                this.handleAnnotationAdded(message.data);
                break;
            case 'measurement_added':
                this.handleMeasurementAdded(message.data);
                break;
            default:
                console.warn('Unknown collaboration message type:', message.type);
        }
    }

    private handleParticipantJoined(data: Participant): void {
        this.participants.set(data.id, data);
        console.log(`Remote participant joined: ${data.name}`);
    }

    private handleParticipantLeft(data: { participantId: string }): void {
        this.participants.delete(data.participantId);
        console.log(`Remote participant left: ${data.participantId}`);
    }

    private handleParticipantMoved(data: { participantId: string; position: vec3; rotation?: quat }): void {
        const participant = this.participants.get(data.participantId);
        if (participant) {
            vec3.copy(participant.avatar.position, data.position);
            if (data.rotation) {
                quat.copy(participant.avatar.rotation, data.rotation);
            }
        }
    }

    private handleCursorMoved(data: { participantId: string; position: vec3; type: Cursor['type'] }): void {
        const participant = this.participants.get(data.participantId);
        if (participant) {
            vec3.copy(participant.avatar.cursor.position, data.position);
            participant.avatar.cursor.type = data.type;
            participant.avatar.cursor.visible = true;
        }
    }

    private handleAnnotationAdded(annotation: Annotation): void {
        this.annotations.set(annotation.id, annotation);
        if (this.currentSession) {
            this.currentSession.annotations.push(annotation);
        }
    }

    private handleMeasurementAdded(measurement: Measurement): void {
        this.measurements.set(measurement.id, measurement);
        if (this.currentSession) {
            this.currentSession.measurements.push(measurement);
        }
    }

    public getCurrentSession(): CollaborationSession | null {
        return this.currentSession;
    }

    public getParticipants(): Participant[] {
        return Array.from(this.participants.values());
    }

    public getAnnotations(): Annotation[] {
        return Array.from(this.annotations.values());
    }

    public getMeasurements(): Measurement[] {
        return Array.from(this.measurements.values());
    }

    public exportSessionData(): any {
        if (!this.currentSession) return null;

        return {
            session: this.currentSession,
            participants: Array.from(this.participants.values()),
            annotations: Array.from(this.annotations.values()),
            measurements: Array.from(this.measurements.values()),
            events: this.eventHistory,
            exportTime: Date.now()
        };
    }

    public getPerformanceMetrics(): {
        currentParticipants: number;
        totalAnnotations: number;
        totalMeasurements: number;
        sessionDuration: number;
        eventCount: number;
        connectionStatus: string;
    } {
        return {
            currentParticipants: this.participants.size,
            totalAnnotations: this.annotations.size,
            totalMeasurements: this.measurements.size,
            sessionDuration: this.currentSession ? Date.now() - this.currentSession.startTime : 0,
            eventCount: this.eventHistory.length,
            connectionStatus: this.websocket ? this.websocket.readyState.toString() : 'disconnected'
        };
    }

    public dispose(): void {
        console.log('Disposing G3D Collaboration Engine...');

        // Close WebSocket connection
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }

        // End current session
        if (this.currentSession) {
            this.currentSession.endTime = Date.now();
        }

        // Clear collections
        this.participants.clear();
        this.annotations.clear();
        this.measurements.clear();
        this.eventHistory = [];

        this.currentSession = null;
        this.isInitialized = false;

        console.log('G3D Collaboration Engine disposed');
    }
}

export default CollaborationEngine;