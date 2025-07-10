/**
 * MedSight Pro Hybrid Stream Processor
 * 
 * Extends the infrastructure StreamProcessor with medical-specific streaming features:
 * - DICOM medical imaging stream processing
 * - Real-time medical device data streaming
 * - Clinical workflow data synchronization
 * - Medical AI inference pipeline streaming
 * 
 * This hybrid approach leverages the advanced infrastructure foundation
 * while preserving all MedSight Pro medical-specific functionality.
 */

import { StreamProcessor as BaseStreamProcessor } from '../../../../infrastructure/engines';

// Medical-specific streaming interfaces
export interface DICOMStreamConfig {
    studyId: string;
    modality: string;
    compressionLevel: number;
    qualityLevel: 'lossless' | 'high' | 'medium';
    realTimeStreaming: boolean;
    encryptionRequired: boolean;
}

export interface MedicalDeviceStreamConfig {
    deviceId: string;
    deviceType: 'imaging' | 'monitoring' | 'therapeutic';
    dataFrequency: number; // Hz
    bufferSize: number;
    alertThresholds: Record<string, number>;
    realTimeProcessing: boolean;
}

export interface ClinicalWorkflowStreamConfig {
    workflowId: string;
    participantIds: string[];
    synchronizationMode: 'real_time' | 'batched';
    auditTrail: boolean;
    backupFrequency: number;
}

export class MedSightProStreamProcessor extends BaseStreamProcessor {
    private dicomStreams: Map<string, DICOMStreamConfig> = new Map();
    private deviceStreams: Map<string, MedicalDeviceStreamConfig> = new Map();
    private workflowStreams: Map<string, ClinicalWorkflowStreamConfig> = new Map();

    constructor() {
        super();
        this.initializeMedicalStreaming();
    }

    private initializeMedicalStreaming(): void {
        console.log('Medical streaming initialized');
    }

    /**
     * DICOM Streaming
     */
    public createDICOMStream(config: Partial<DICOMStreamConfig>): string {
        const streamId = this.generateMedicalStreamId();
        
        const dicomConfig: DICOMStreamConfig = {
            studyId: config.studyId || 'unknown',
            modality: config.modality || 'CT',
            compressionLevel: config.compressionLevel || 1,
            qualityLevel: config.qualityLevel || 'high',
            realTimeStreaming: config.realTimeStreaming || false,
            encryptionRequired: config.encryptionRequired || true
        };

        this.dicomStreams.set(streamId, dicomConfig);
        
        // Create DICOM processing pipeline
        const sourceId = this.createSource({
            name: `DICOM Stream - ${dicomConfig.studyId}`,
            type: 'file',
            url: `dicom://${dicomConfig.studyId}`,
            format: 'dicom'
        });

        const processorId = this.createProcessor({
            name: `DICOM Processor - ${dicomConfig.modality}`,
            type: 'decode',
            config: {
                algorithm: 'dicom_processing',
                parameters: {
                    modality: dicomConfig.modality,
                    compressionLevel: dicomConfig.compressionLevel,
                    qualityLevel: dicomConfig.qualityLevel
                },
                bufferSize: 1000,
                batchSize: 1,
                timeout: 5000,
                retries: 3,
                gpuEnabled: true,
                multiThreaded: true
            }
        });

        console.log(`DICOM stream created: ${streamId}`);
        return streamId;
    }

    /**
     * Medical Device Streaming
     */
    public createMedicalDeviceStream(config: Partial<MedicalDeviceStreamConfig>): string {
        const streamId = this.generateMedicalStreamId();
        
        const deviceConfig: MedicalDeviceStreamConfig = {
            deviceId: config.deviceId || 'unknown',
            deviceType: config.deviceType || 'monitoring',
            dataFrequency: config.dataFrequency || 60,
            bufferSize: config.bufferSize || 1000,
            alertThresholds: config.alertThresholds || {},
            realTimeProcessing: config.realTimeProcessing || true
        };

        this.deviceStreams.set(streamId, deviceConfig);
        
        console.log(`Medical device stream created: ${streamId}`);
        return streamId;
    }

    /**
     * Clinical Workflow Streaming
     */
    public createClinicalWorkflowStream(config: Partial<ClinicalWorkflowStreamConfig>): string {
        const streamId = this.generateMedicalStreamId();
        
        const workflowConfig: ClinicalWorkflowStreamConfig = {
            workflowId: config.workflowId || 'unknown',
            participantIds: config.participantIds || [],
            synchronizationMode: config.synchronizationMode || 'real_time',
            auditTrail: config.auditTrail || true,
            backupFrequency: config.backupFrequency || 60
        };

        this.workflowStreams.set(streamId, workflowConfig);
        
        console.log(`Clinical workflow stream created: ${streamId}`);
        return streamId;
    }

    private generateMedicalStreamId(): string {
        return `med_stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    public getMedicalStreamingStatus(): {
        totalStreams: number;
        activeDICOMStreams: number;
        activeDeviceStreams: number;
        activeWorkflowStreams: number;
    } {
        return {
            totalStreams: this.dicomStreams.size + this.deviceStreams.size + this.workflowStreams.size,
            activeDICOMStreams: this.dicomStreams.size,
            activeDeviceStreams: this.deviceStreams.size,
            activeWorkflowStreams: this.workflowStreams.size
        };
    }
} 