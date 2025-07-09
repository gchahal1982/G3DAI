export interface MedicalAIConfig {
    fdaApprovedModels: {
        segmentation: string;
        anomalyDetection: string;
        reconstruction: string;
    };
    device?: 'cpu' | 'webgl' | 'cuda';
    precision?: 'fp16' | 'fp32';
    fdaClearanceNumber: string;
    ceMarkingNumber: string;
    modelVersion: string;
    currentUserId: string;
    accessLevel: AccessLevel;
    complianceLevel?: ComplianceLevel;
    useONNX?: boolean;
    reportTemplates: string;
}

export enum ComplianceLevel {
    HIPAA_FULL = 'HIPAA_FULL',
    HIPAA_LIMITED = 'HIPAA_LIMITED',
    GDPR_COMPLIANT = 'GDPR_COMPLIANT',
    RESEARCH_ONLY = 'RESEARCH_ONLY'
}

export enum AccessLevel {
    PHYSICIAN = 'PHYSICIAN',
    RADIOLOGIST = 'RADIOLOGIST',
    TECHNICIAN = 'TECHNICIAN',
    RESEARCHER = 'RESEARCHER',
    ADMIN = 'ADMIN'
}

export type StudyType =
    | 'chest-xray'
    | 'ct-brain'
    | 'ct-abdomen'
    | 'mri-spine'
    | 'mammography';

export interface PatientHistory {
    previousScans?: PreviousScan[];
    riskFactors?: string[];
    medications?: string[];
    allergies?: string[];
    diagnoses?: Diagnosis[];
}

export interface PreviousScan {
    studyId: string;
    date: Date;
    modality: string;
    findings: string[];
    report?: string;
}

export interface Diagnosis {
    code: string;
    description: string;
    date: Date;
    active: boolean;
}

export interface MedicalAnalysis {
    segmentation: SegmentationResult;
    anomalies: Anomaly[];
    visualization: Reconstruction3D;
    report: MedicalReport;
    confidence: number;
    studyInfo: StudyInfo;
    regulatoryInfo: RegulatoryInfo;
    processingInfo: ProcessingInfo;
}

export interface SegmentationResult {
    mask: any;
    structures: AnatomicalStructure[];
    measurements: Measurements;
    confidence: number;
    metadata: {
        modelUsed: string;
        processingTime: number;
    };
}

export interface AnatomicalStructure {
    name: string;
    label: string;
    confidence: number;
    volume: number;
    normalRange?: {
        volume: [number, number];
    };
    status: 'normal' | 'below_normal' | 'above_normal';
}

export interface Measurements {
    volumes: Record<string, number>;
    areas: Record<string, number>;
    dimensions: Record<string, any>;
    densities: Record<string, number>;
}

export interface Anomaly {
    id: string;
    type: string;
    location: any;
    size: number;
    confidence: number;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    clinicalSignificance: number;
    description: string;
    recommendations: string[];
    similarCases: SimilarCase[];
    visualizations: {
        bbox: BoundingBox;
        heatmap: any;
        measurements: any;
    };
}

export interface SimilarCase {
    id: string;
    similarity: number;
    diagnosis: string;
    outcome: string;
}

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
    z?: number;
    depth?: number;
}

export interface Reconstruction3D {
    volumeData: any;
    visualizations: {
        mip: any;
        volume: any;
        surface: any;
    };
    interactionEnabled: boolean;
    metadata: {
        voxelSpacing: number[];
        dimensions: number[];
        orientation: number[];
    };
}

export interface MedicalReport {
    findings: Finding[];
    impressions: string[];
    recommendations: string[];
    measurements: Measurements;
    generatedAt: Date;
    aiVersion: string;
    confidenceScore: number;
}

export interface Finding {
    description: string;
    location: string;
    severity: string;
    confidence: number;
}

export interface StudyInfo {
    studyId: string;
    modality: string;
    timestamp: Date;
}

export interface RegulatoryInfo {
    fdaClearance: string;
    ceMarking: string;
    aiModelVersion: string;
    validatedForClinicalUse: boolean;
}

export interface ProcessingInfo {
    duration: number;
    gpuAccelerated: boolean;
    auditId: string;
}

export interface PHIData {
    patientId?: string;
    patientName?: string;
    dateOfBirth?: Date;
    gender?: string;
    mrn?: string;
}

// DICOM related types
export interface DICOMMetadata {
    studyId: string;
    seriesId: string;
    instanceId: string;
    modality: string;
    studyDate: Date;
    studyDescription?: string;
    patientId?: string;
    patientName?: string;
    pixelSpacing: number[];
    sliceThickness?: number;
    imagePosition?: number[];
    imageOrientation?: number[];
    windowCenter?: number;
    windowWidth?: number;
    rows: number;
    columns: number;
    slices?: number;
    imageCount?: number;
}

export interface DICOMParseResult {
    pixelData: Float32Array;
    metadata: DICOMMetadata;
    timestamp: number;
}

// Compliance types
export interface ComplianceResult {
    compliant: boolean;
    violations: ComplianceViolation[];
    warnings: ComplianceWarning[];
}

export interface ComplianceViolation {
    regulation: string;
    description: string;
    severity: 'critical' | 'high' | 'medium';
    remediation: string;
}

export interface ComplianceWarning {
    regulation: string;
    description: string;
    recommendation: string;
}

// Audit types
export interface AuditEntry {
    id: string;
    timestamp: number;
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    outcome: 'success' | 'failure' | 'pending';
    details?: any;
}