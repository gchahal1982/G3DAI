// Health data types
export interface HealthData {
    id: string;
    userId: string;
    vitals: VitalSigns;
    symptoms: Symptom[];
    symptomDuration: number;
    symptomSeverity: SeverityLevel;
    medicalHistory: MedicalHistory;
    demographics: Demographics;
    lifestyle: LifestyleFactors;
    genetics?: GeneticData;
    history: HealthRecord[];
    profile: HealthProfile;
    preferences: UserPreferences;
}

export interface VitalSigns {
    heartRate: number;
    bloodPressure: BloodPressure;
    temperature: number;
    oxygenSaturation: number;
    respiratoryRate?: number;
    weight?: number;
    height?: number;
    timestamp: Date;
}

export interface BloodPressure {
    systolic: number;
    diastolic: number;
}

export interface Symptom {
    id: string;
    name: string;
    severity: SeverityLevel;
    duration: number;
    location?: string;
    description?: string;
    frequency?: 'constant' | 'intermittent' | 'occasional';
}

export type SeverityLevel = 'mild' | 'moderate' | 'severe' | 'critical';

export interface MedicalHistory {
    conditions: MedicalCondition[];
    medications: Medication[];
    allergies: Allergy[];
    surgeries: Surgery[];
    familyHistory: FamilyHistory[];
}

export interface MedicalCondition {
    name: string;
    diagnosedDate: Date;
    status: 'active' | 'resolved' | 'chronic';
    severity: SeverityLevel;
}

export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate?: Date;
    prescribedBy: string;
}

export interface Allergy {
    allergen: string;
    reaction: string;
    severity: SeverityLevel;
}

export interface Surgery {
    procedure: string;
    date: Date;
    hospital: string;
    surgeon: string;
}

export interface FamilyHistory {
    relation: string;
    condition: string;
    ageOfOnset?: number;
}

export interface Demographics {
    age: number;
    gender: 'male' | 'female' | 'other';
    ethnicity?: string;
    occupation?: string;
}

export interface LifestyleFactors {
    smokingStatus: 'never' | 'former' | 'current';
    alcoholConsumption: 'none' | 'light' | 'moderate' | 'heavy';
    exerciseFrequency: 'none' | 'light' | 'moderate' | 'intense';
    dietType?: 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'mediterranean';
    sleepHours: number;
    stressLevel: SeverityLevel;
}

export interface GeneticData {
    markers: GeneticMarker[];
    riskFactors: GeneticRiskFactor[];
}

export interface GeneticMarker {
    gene: string;
    variant: string;
    significance: string;
}

export interface GeneticRiskFactor {
    condition: string;
    riskLevel: 'low' | 'moderate' | 'high';
    confidence: number;
}

export interface HealthRecord {
    date: Date;
    type: 'vitals' | 'symptoms' | 'medication' | 'appointment';
    data: any;
    provider?: string;
}

export interface HealthProfile {
    goals: HealthGoal[];
    preferences: HealthPreferences;
    riskFactors: string[];
}

export interface HealthGoal {
    type: 'weight_loss' | 'fitness' | 'chronic_management' | 'prevention';
    target: string;
    deadline?: Date;
}

export interface HealthPreferences {
    communicationFrequency: 'daily' | 'weekly' | 'monthly';
    reminderTypes: string[];
    privacyLevel: 'basic' | 'standard' | 'strict';
}

export interface UserPreferences {
    language: string;
    units: 'metric' | 'imperial';
    notifications: boolean;
}

// Analysis configuration
export interface HealthAnalysisConfig {
    includeGenetics: boolean;
    riskAssessmentDepth: 'basic' | 'comprehensive';
    recommendationTypes: RecommendationType[];
    urgencyThreshold: number;
}

export type RecommendationType =
    | 'lifestyle'
    | 'medical'
    | 'preventive'
    | 'emergency';

// Results types
export interface HealthInsights {
    vitals: VitalAnalysis;
    symptoms: SymptomAnalysis;
    risks: RiskAssessment;
    recommendations: HealthRecommendation[];
    urgencyLevel: UrgencyLevel;
    nextSteps: NextStep[];
}

export interface VitalAnalysis {
    status: 'normal' | 'concerning' | 'critical';
    trends: VitalTrend[];
    alerts: VitalAlert[];
    score: number;
}

export interface VitalTrend {
    metric: string;
    direction: 'improving' | 'stable' | 'declining';
    significance: 'low' | 'medium' | 'high';
    timeframe: string;
}

export interface VitalAlert {
    type: string;
    message: string;
    severity: SeverityLevel;
    actionRequired: boolean;
}

export interface SymptomAnalysis {
    patterns: SymptomPattern[];
    possibleConditions: PossibleCondition[];
    redFlags: RedFlag[];
    confidence: number;
}

export interface SymptomPattern {
    symptoms: string[];
    frequency: string;
    triggers?: string[];
    correlations: string[];
}

export interface PossibleCondition {
    name: string;
    probability: number;
    reasoning: string;
    urgency: UrgencyLevel;
}

export interface RedFlag {
    symptom: string;
    reason: string;
    action: string;
}

export interface RiskAssessment {
    overallRisk: 'low' | 'moderate' | 'high' | 'critical';
    riskFactors: RiskFactor[];
    protectiveFactors: ProtectiveFactor[];
    score: number;
}

export interface RiskFactor {
    factor: string;
    impact: 'low' | 'medium' | 'high';
    modifiable: boolean;
    recommendation?: string;
}

export interface ProtectiveFactor {
    factor: string;
    benefit: string;
    maintainAction: string;
}

export interface HealthRecommendation {
    type: RecommendationType;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    timeframe: string;
    evidence: string;
    actionSteps: string[];
}

export type UrgencyLevel = 'routine' | 'soon' | 'urgent' | 'emergency';

export interface NextStep {
    action: string;
    timeframe: string;
    provider?: string;
    reason: string;
}