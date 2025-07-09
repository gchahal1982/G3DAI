/**
 * G3D VoiceAI - Voice Intelligence TypeScript Definitions
 */

export interface VoiceRecording {
    id: string;
    name: string;
    duration: number;
    fileUrl: string;
    transcription?: string;
    analysis?: VoiceAnalysis;
    createdAt: Date;
}

export interface VoiceAnalysis {
    sentiment: SentimentResult;
    emotions: EmotionResult[];
    speakerInfo: SpeakerInfo;
    qualityMetrics: QualityMetrics;
    keywords: string[];
    topics: string[];
}

export interface SentimentResult {
    overall: 'positive' | 'negative' | 'neutral';
    confidence: number;
    score: number;
}

export interface EmotionResult {
    emotion: 'happy' | 'sad' | 'angry' | 'surprised' | 'fear' | 'disgust' | 'neutral';
    intensity: number;
    confidence: number;
    timestamp: number;
}

export interface SpeakerInfo {
    count: number;
    speakers: Speaker[];
    diarization: DiarizationSegment[];
}

export interface Speaker {
    id: string;
    gender?: 'male' | 'female';
    ageEstimate?: number;
    speakingTime: number;
    speakingPercentage: number;
}

export interface DiarizationSegment {
    speakerId: string;
    startTime: number;
    endTime: number;
    text: string;
}

export interface QualityMetrics {
    clarity: number;
    volume: number;
    backgroundNoise: number;
    speechRate: number;
    pauseCount: number;
}

export interface VoiceProject {
    id: string;
    name: string;
    description: string;
    recordings: string[];
    status: 'active' | 'completed' | 'archived';
    createdAt: Date;
}