/**
 * G3D Vision Pro - Medical Imaging TypeScript Definitions
 */

// Core Medical Image Types
export interface MedicalImage {
    id: string;
    filename: string;
    url: string;
    type: 'xray' | 'ct' | 'mri' | 'ultrasound' | 'mammogram' | 'retinal' | 'unknown';
    size: number;
    uploadedAt: Date;
    metadata: {
        originalName: string;
        mimeType: string;
        size: number;
        dimensions?: {
            width: number;
            height: number;
        };
        dicomTags?: Record<string, any>;
    };
}

// Analysis Results
export interface AnalysisResult {
    id: string;
    imageId: string;
    modelUsed: string;
    findings: Finding[];
    confidence: number;
    processingTime: number;
    timestamp: Date;
    metadata: {
        modelVersion: string;
        parameters: Record<string, any>;
    };
}

export interface Finding {
    id: string;
    type: 'anomaly' | 'normal' | 'suspicious' | 'pathological';
    description: string;
    confidence: number;
    location?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
    clinicalSignificance: string;
    recommendations?: string[];
}

// Diagnosis Report
export interface DiagnosisReport {
    id: string;
    imageId: string;
    analysisId: string;
    findings: Finding[];
    summary: string;
    recommendations: string[];
    confidence: number;
    reviewStatus: 'pending' | 'reviewed' | 'approved' | 'rejected';
    reviewer?: {
        id: string;
        name: string;
        credentials: string;
    };
    generatedAt: Date;
    reviewedAt?: Date;
}

// Model Metrics
export interface ModelMetrics {
    modelId: string;
    modelName: string;
    version: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    processingSpeed: number; // images per second
    lastUpdated: Date;
    totalProcessed: number;
    successRate: number;
}

// Processing Status
export type ProcessingStatus = 'idle' | 'uploading' | 'analyzing' | 'completed' | 'error';

// Vision Pro Configuration
export interface VisionProConfig {
    defaultModel: string;
    autoAnalysis: boolean;
    confidenceThreshold: number;
    enableAuditLogging: boolean;
    hipaaCompliance: boolean;
    maxFileSize: number;
    supportedFormats: string[];
    processingTimeout: number;
}

// DICOM Types
export interface DICOMMetadata {
    studyInstanceUID: string;
    seriesInstanceUID: string;
    sopInstanceUID: string;
    patientID: string;
    patientName: string;
    studyDate: string;
    modality: string;
    bodyPart: string;
    studyDescription: string;
    seriesDescription: string;
}

// Patient History (anonymized)
export interface PatientHistory {
    patientId: string; // anonymized
    previousScans: MedicalImage[];
    medicalHistory: string[];
    allergies: string[];
    medications: string[];
    demographics: {
        age: number;
        gender: 'M' | 'F' | 'O';
    };
}

// Segmentation Results
export interface SegmentationResult {
    id: string;
    imageId: string;
    segments: Segment[];
    measurements: Measurement[];
    confidence: number;
}

export interface Segment {
    id: string;
    label: string;
    type: 'organ' | 'tissue' | 'bone' | 'vessel' | 'tumor' | 'other';
    mask: number[][]; // 2D array representing the segmentation mask
    area: number;
    volume?: number;
    confidence: number;
}

export interface Measurement {
    id: string;
    type: 'length' | 'area' | 'volume' | 'angle' | 'density';
    value: number;
    unit: string;
    location: string;
    confidence: number;
}

// 3D Visualization
export interface Visualization3D {
    id: string;
    imageId: string;
    meshData: MeshData;
    renderSettings: RenderSettings;
    annotations: Annotation3D[];
}

export interface MeshData {
    vertices: number[];
    faces: number[];
    normals: number[];
    textures?: number[];
}

export interface RenderSettings {
    opacity: number;
    colorMap: string;
    lighting: {
        ambient: number;
        diffuse: number;
        specular: number;
    };
    camera: {
        position: [number, number, number];
        target: [number, number, number];
        up: [number, number, number];
    };
}

export interface Annotation3D {
    id: string;
    position: [number, number, number];
    label: string;
    description: string;
    type: 'point' | 'line' | 'plane' | 'volume';
}

// API Response Types
export interface MedicalAnalysisResponse {
    success: boolean;
    data?: {
        analysis: AnalysisResult;
        visualization?: Visualization3D;
        report?: DiagnosisReport;
    };
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

// Event Types
export interface MedicalAnalysisEvent {
    type: 'analysis_started' | 'analysis_completed' | 'analysis_failed' | 'report_generated';
    imageId: string;
    timestamp: Date;
    data?: any;
}

// Compliance Types
export interface HIPAAComplianceInfo {
    encrypted: boolean;
    auditLogged: boolean;
    accessControlled: boolean;
    dataMinimized: boolean;
    retentionPolicy: string;
    anonymized: boolean;
}

export interface AuditLogEntry {
    id: string;
    action: string;
    userId: string;
    imageId?: string;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    details?: Record<string, any>;
}

// All types are already exported above with their definitions