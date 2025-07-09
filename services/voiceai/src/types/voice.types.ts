// Audio and voice types
export interface AudioStream {
    id: string;
    sampleRate: number;
    channels: number;
    bitDepth: number;
    duration?: number;
    data: Float32Array | ArrayBuffer;
    format: 'wav' | 'mp3' | 'opus' | 'webm';
}

export interface VoiceProcessingConfig {
    language: string;
    dialect?: string;
    conversationContext?: ConversationContext;
    businessDomain?: string;
    complianceRules?: ComplianceRule[];
    realTimeProcessing: boolean;
    enhanceAudio?: boolean;
}

export interface ConversationContext {
    conversationId: string;
    participants: Participant[];
    previousUtterances: Utterance[];
    topic?: string;
    metadata?: Record<string, any>;
}

export interface Participant {
    id: string;
    name?: string;
    role: 'agent' | 'customer' | 'supervisor';
    voiceProfile?: VoiceProfile;
}

export interface VoiceProfile {
    speakerId: string;
    embedding: number[];
    characteristics: {
        pitch: number;
        speed: number;
        energy: number;
    };
}

export interface Utterance {
    id: string;
    speakerId: string;
    text: string;
    startTime: number;
    endTime: number;
    confidence: number;
    emotion?: EmotionAnalysis;
    intent?: Intent;
}

export interface Transcript {
    utterances: Utterance[];
    speakers: Speaker[];
    language: string;
    confidence: number;
    metadata: TranscriptMetadata;
}

export interface Speaker {
    id: string;
    label: string;
    utteranceCount: number;
    totalDuration: number;
    averageConfidence: number;
}

export interface TranscriptMetadata {
    duration: number;
    wordCount: number;
    sentenceCount: number;
    languageConfidence: number;
}

// Emotion and sentiment types
export interface EmotionAnalysis {
    primary: EmotionType;
    secondary?: EmotionType;
    valence: number; // -1 to 1
    arousal: number; // 0 to 1
    confidence: number;
    timestamp: number;
}

export type EmotionType =
    | 'neutral'
    | 'happy'
    | 'sad'
    | 'angry'
    | 'fearful'
    | 'surprised'
    | 'disgusted'
    | 'confused'
    | 'excited'
    | 'calm';

export interface SentimentAnalysis {
    score: number; // -1 to 1
    magnitude: number; // 0 to 1
    label: 'positive' | 'negative' | 'neutral' | 'mixed';
    aspects?: AspectSentiment[];
}

export interface AspectSentiment {
    aspect: string;
    sentiment: number;
    mentions: number;
}

// Intent and entity types
export interface Intent {
    name: string;
    confidence: number;
    parameters?: Record<string, any>;
    entities?: Entity[];
}

export interface Entity {
    type: string;
    value: string;
    startIndex: number;
    endIndex: number;
    confidence: number;
    metadata?: Record<string, any>;
}

// Call analytics types
export interface Call {
    id: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    participants: Participant[];
    status: CallStatus;
    recording?: AudioStream;
    transcript?: Transcript;
    analytics?: CallAnalytics;
}

export type CallStatus =
    | 'initiating'
    | 'active'
    | 'on-hold'
    | 'transferring'
    | 'ended'
    | 'failed';

export interface CallAnalytics {
    sentimentScore: number;
    emotionTimeline: EmotionAnalysis[];
    talkRatio: TalkRatio;
    interruptions: number;
    silences: Silence[];
    keyMoments: KeyMoment[];
    complianceScore: number;
    qualityScore: number;
}

export interface TalkRatio {
    agent: number;
    customer: number;
    silence: number;
    overlap: number;
}

export interface Silence {
    startTime: number;
    duration: number;
    type: 'pause' | 'dead-air';
}

export interface KeyMoment {
    timestamp: number;
    type: 'objection' | 'question' | 'complaint' | 'positive-feedback' | 'decision';
    description: string;
    importance: 'low' | 'medium' | 'high';
}

// Real-time suggestions
export interface Suggestion {
    id: string;
    type: SuggestionType;
    text: string;
    reason: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number;
    context?: any;
}

export type SuggestionType =
    | 'response'
    | 'tone-adjustment'
    | 'clarification'
    | 'empathy'
    | 'compliance'
    | 'upsell'
    | 'de-escalation';

// Compliance types
export interface ComplianceRule {
    id: string;
    name: string;
    type: 'required-disclosure' | 'prohibited-statement' | 'process-adherence';
    pattern?: string | RegExp;
    action: 'alert' | 'block' | 'log';
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceViolation {
    rule: ComplianceRule;
    timestamp: number;
    utteranceId: string;
    details: string;
    resolved: boolean;
}

// Voice synthesis types
export interface VoiceSynthesisRequest {
    text: string;
    voice: VoiceOption;
    speed?: number;
    pitch?: number;
    emotion?: EmotionType;
    format?: 'mp3' | 'wav' | 'opus';
}

export interface VoiceOption {
    id: string;
    name: string;
    language: string;
    gender: 'male' | 'female' | 'neutral';
    style?: string;
    preview?: string;
}

// Analytics types
export interface VoiceAnalytics {
    period: AnalyticsPeriod;
    calls: number;
    averageDuration: number;
    sentimentScore: number;
    complianceScore: number;
    qualityMetrics: QualityMetrics;
    agentPerformance: AgentPerformance[];
    trends: AnalyticsTrend[];
}

export interface AnalyticsPeriod {
    start: Date;
    end: Date;
    granularity: 'hour' | 'day' | 'week' | 'month';
}

export interface QualityMetrics {
    averageScore: number;
    firstCallResolution: number;
    customerSatisfaction: number;
    scriptAdherence: number;
}

export interface AgentPerformance {
    agentId: string;
    agentName: string;
    callsHandled: number;
    averageHandleTime: number;
    sentimentScore: number;
    complianceScore: number;
    coachingNeeded: boolean;
}

export interface AnalyticsTrend {
    metric: string;
    values: TimeSeriesData[];
    change: number;
    changePercent: number;
}

export interface TimeSeriesData {
    timestamp: Date;
    value: number;
}

// Training and coaching types
export interface CoachingSession {
    id: string;
    agentId: string;
    coachId: string;
    callId: string;
    feedback: CoachingFeedback[];
    actionItems: string[];
    scheduledFollowUp?: Date;
}

export interface CoachingFeedback {
    timestamp: number;
    type: 'positive' | 'improvement';
    category: string;
    comment: string;
    example?: string;
}