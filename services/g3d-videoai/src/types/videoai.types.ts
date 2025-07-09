/**
 * G3D VideoAI - Video Intelligence TypeScript Definitions
 */

export interface VideoProject {
    id: string;
    name: string;
    description: string;
    status: 'processing' | 'completed' | 'failed';
    createdAt: Date;
}

export interface VideoAnalysis {
    id: string;
    videoId: string;
    type: 'object-detection' | 'scene-analysis' | 'sentiment-analysis';
    results: AnalysisResult[];
    confidence: number;
    processingTime: number;
}

export interface AnalysisResult {
    timestamp: number;
    objects: DetectedObject[];
    scenes: Scene[];
    emotions: Emotion[];
}

export interface DetectedObject {
    id: string;
    label: string;
    confidence: number;
    boundingBox: BoundingBox;
}

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Scene {
    id: string;
    label: string;
    confidence: number;
    startTime: number;
    endTime: number;
}

export interface Emotion {
    type: 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral';
    confidence: number;
    intensity: number;
}

export interface VideoMetrics {
    duration: number;
    frameRate: number;
    resolution: string;
    fileSize: number;
    format: string;
}

export interface ProcessingConfig {
    enableObjectDetection: boolean;
    enableSceneAnalysis: boolean;
    enableSentimentAnalysis: boolean;
    quality: 'fast' | 'balanced' | 'accurate';
}