/**
 * G3D HealthAI - Health Intelligence TypeScript Definitions
 */

export interface HealthProfile {
    id: string;
    userId: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    medicalHistory: string[];
    allergies: string[];
    medications: string[];
    vitalSigns: VitalSigns;
    lastUpdated: Date;
}

export interface VitalSigns {
    heartRate: number;
    bloodPressure: BloodPressure;
    temperature: number;
    respiratoryRate: number;
    oxygenSaturation: number;
    weight: number;
    height: number;
    timestamp: Date;
}

export interface BloodPressure {
    systolic: number;
    diastolic: number;
}

export interface HealthAssessment {
    id: string;
    profileId: string;
    type: 'routine' | 'symptom-check' | 'risk-assessment';
    results: AssessmentResult[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    createdAt: Date;
}

export interface AssessmentResult {
    category: string;
    score: number;
    status: 'normal' | 'warning' | 'abnormal';
    description: string;
}

export interface Symptom {
    id: string;
    name: string;
    severity: number;
    duration: string;
    description: string;
}

export interface HealthMetrics {
    totalAssessments: number;
    averageRiskScore: number;
    improvementTrends: number;
    complianceRate: number;
}