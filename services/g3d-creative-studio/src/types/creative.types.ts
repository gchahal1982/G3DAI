/**
 * G3D Creative Studio - Creative Content Generation TypeScript Definitions
 */

// Core Creative Project Types
export interface CreativeProject {
    id: string;
    name: string;
    description: string;
    type: CreativeProjectType;
    assets: CreativeAsset[];
    createdAt: Date;
    updatedAt: Date;
    owner: string;
    collaborators: string[];
    status: ProjectStatus;
    tags: string[];
}

export type CreativeProjectType =
    | 'image-generation'
    | 'video-production'
    | 'audio-synthesis'
    | 'text-content'
    | 'mixed-media'
    | 'branding'
    | 'marketing-campaign';

export type ProjectStatus = 'draft' | 'in-progress' | 'review' | 'completed' | 'archived';

export interface CreativeAsset {
    id: string;
    name: string;
    type: AssetType;
    url: string;
    thumbnailUrl?: string;
    metadata: AssetMetadata;
    createdAt: Date;
    size: number;
    duration?: number; // for video/audio
    dimensions?: {
        width: number;
        height: number;
    };
}

export type AssetType =
    | 'image'
    | 'video'
    | 'audio'
    | 'text'
    | 'vector'
    | 'animation'
    | '3d-model'
    | 'template';

export interface AssetMetadata {
    format: string;
    quality: 'draft' | 'standard' | 'high' | 'ultra';
    colorProfile?: string;
    compression?: string;
    generatedBy?: string;
    prompt?: string;
    style?: string;
    mood?: string;
}

// Content Generation Types
export interface ContentGenerationRequest {
    id: string;
    type: GenerationType;
    prompt: string;
    style: StylePreferences;
    parameters: GenerationParameters;
    constraints: ContentConstraints;
    userId: string;
    timestamp: Date;
    priority: 'low' | 'medium' | 'high';
}

export type GenerationType =
    | 'text-to-image'
    | 'image-to-image'
    | 'text-to-video'
    | 'audio-generation'
    | 'text-generation'
    | 'logo-design'
    | 'poster-design'
    | 'social-media-post';

export interface StylePreferences {
    artStyle: ArtStyle;
    colorPalette: string[];
    mood: string;
    composition: CompositionStyle;
    lighting?: LightingStyle;
    camera?: CameraSettings;
}

export type ArtStyle =
    | 'photorealistic'
    | 'cartoon'
    | 'anime'
    | 'abstract'
    | 'minimalist'
    | 'vintage'
    | 'modern'
    | 'impressionist'
    | 'cyberpunk'
    | 'steampunk';

export type CompositionStyle =
    | 'centered'
    | 'rule-of-thirds'
    | 'golden-ratio'
    | 'symmetrical'
    | 'asymmetrical'
    | 'dynamic'
    | 'static';

export type LightingStyle =
    | 'natural'
    | 'dramatic'
    | 'soft'
    | 'hard'
    | 'backlit'
    | 'golden-hour'
    | 'blue-hour'
    | 'studio';

export interface CameraSettings {
    angle: 'wide' | 'medium' | 'close-up' | 'macro' | 'aerial';
    perspective: 'first-person' | 'third-person' | 'birds-eye' | 'worms-eye';
    depth: 'shallow' | 'medium' | 'deep';
}

export interface GenerationParameters {
    resolution: Resolution;
    aspectRatio: AspectRatio;
    quality: QualityLevel;
    iterations: number;
    seed?: number;
    guidance: number;
    steps: number;
    model: string;
}

export type Resolution = '512x512' | '768x768' | '1024x1024' | '1920x1080' | '3840x2160' | 'custom';
export type AspectRatio = '1:1' | '4:3' | '16:9' | '9:16' | '3:2' | '2:3' | 'custom';
export type QualityLevel = 'draft' | 'standard' | 'high' | 'ultra';

export interface ContentConstraints {
    maxFileSize: number;
    allowedFormats: string[];
    contentPolicy: ContentPolicy;
    brandGuidelines?: BrandGuidelines;
    accessibility?: AccessibilityRequirements;
}

export interface ContentPolicy {
    allowNSFW: boolean;
    allowViolence: boolean;
    allowPolitical: boolean;
    allowCopyright: boolean;
    moderationLevel: 'strict' | 'moderate' | 'relaxed';
}

export interface BrandGuidelines {
    colors: string[];
    fonts: string[];
    logoUsage: string;
    voiceTone: string;
    imagery: string;
    restrictions: string[];
}

export interface AccessibilityRequirements {
    altText: boolean;
    colorContrast: number;
    fontSize: number;
    screenReader: boolean;
}

// AI Model Types
export interface CreativeAIModel {
    id: string;
    name: string;
    provider: 'openai' | 'midjourney' | 'stability-ai' | 'runwayml' | 'elevenlabs' | 'local';
    version: string;
    capabilities: ModelCapability[];
    supportedTypes: GenerationType[];
    maxResolution: Resolution;
    processingTime: number; // seconds
    costPerGeneration: number;
    quality: number; // 0-100
    isActive: boolean;
    lastUpdated: Date;
}

export type ModelCapability =
    | 'text-to-image'
    | 'image-to-image'
    | 'inpainting'
    | 'outpainting'
    | 'upscaling'
    | 'style-transfer'
    | 'animation'
    | 'video-generation'
    | 'audio-synthesis'
    | 'voice-cloning'
    | 'text-generation';

// Generation Results
export interface GenerationResult {
    id: string;
    requestId: string;
    assets: CreativeAsset[];
    metadata: GenerationMetadata;
    status: GenerationStatus;
    progress: number; // 0-100
    estimatedCompletion?: Date;
    error?: string;
    createdAt: Date;
    completedAt?: Date;
}

export type GenerationStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface GenerationMetadata {
    modelUsed: string;
    actualParameters: GenerationParameters;
    processingTime: number;
    iterations: number;
    seed: number;
    cost: number;
    variations: number;
}

// Creative Analytics
export interface CreativeAnalytics {
    projectId: string;
    metrics: CreativeMetrics;
    performance: PerformanceMetrics;
    engagement: EngagementMetrics;
    trends: TrendAnalysis;
    recommendations: string[];
}

export interface CreativeMetrics {
    totalAssets: number;
    generationsThisMonth: number;
    successRate: number;
    averageQuality: number;
    popularStyles: string[];
    topModels: string[];
}

export interface PerformanceMetrics {
    averageGenerationTime: number;
    queueTime: number;
    errorRate: number;
    resourceUtilization: number;
    costEfficiency: number;
}

export interface EngagementMetrics {
    downloads: number;
    shares: number;
    likes: number;
    comments: number;
    viewTime: number;
    clickThrough: number;
}

export interface TrendAnalysis {
    popularPrompts: string[];
    emergingStyles: string[];
    seasonalTrends: string[];
    userPreferences: Record<string, number>;
    marketDemand: Record<string, number>;
}

// Collaboration Types
export interface CreativeCollaboration {
    id: string;
    projectId: string;
    participants: Collaborator[];
    permissions: CollaborationPermissions;
    history: CollaborationHistory[];
    realTimeSession?: RealTimeSession;
}

export interface Collaborator {
    userId: string;
    name: string;
    role: CollaboratorRole;
    permissions: string[];
    joinedAt: Date;
    lastActive: Date;
}

export type CollaboratorRole = 'owner' | 'editor' | 'contributor' | 'viewer' | 'commenter';

export interface CollaborationPermissions {
    canEdit: boolean;
    canDelete: boolean;
    canShare: boolean;
    canExport: boolean;
    canInvite: boolean;
    canManagePermissions: boolean;
}

export interface CollaborationHistory {
    id: string;
    userId: string;
    action: CollaborationAction;
    details: string;
    timestamp: Date;
    assetId?: string;
}

export type CollaborationAction =
    | 'created'
    | 'edited'
    | 'deleted'
    | 'shared'
    | 'commented'
    | 'approved'
    | 'rejected'
    | 'exported';

export interface RealTimeSession {
    id: string;
    activeUsers: string[];
    cursor: Record<string, CursorPosition>;
    selections: Record<string, Selection>;
    changes: RealtimeChange[];
}

export interface CursorPosition {
    x: number;
    y: number;
    timestamp: Date;
}

export interface Selection {
    assetId: string;
    area?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    timestamp: Date;
}

export interface RealtimeChange {
    id: string;
    userId: string;
    type: 'add' | 'modify' | 'delete' | 'move';
    assetId: string;
    data: any;
    timestamp: Date;
}

// API Response Types
export interface CreativeGenerationResponse {
    success: boolean;
    data?: {
        result: GenerationResult;
        assets: CreativeAsset[];
        metadata: GenerationMetadata;
    };
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    requestId: string;
    timestamp: Date;
}

// Event Types
export interface CreativeStudioEvent {
    type: 'generation_started' | 'generation_completed' | 'project_created' | 'asset_uploaded';
    projectId: string;
    assetId?: string;
    userId: string;
    timestamp: Date;
    data?: any;
}

// Configuration Types
export interface CreativeStudioConfig {
    defaultModel: string;
    autoSave: boolean;
    maxConcurrentGenerations: number;
    defaultQuality: QualityLevel;
    contentModeration: boolean;
    allowedFileTypes: string[];
    maxFileSize: number;
    watermark: boolean;
}

// Template Types
export interface CreativeTemplate {
    id: string;
    name: string;
    description: string;
    category: TemplateCategory;
    thumbnail: string;
    assets: CreativeAsset[];
    parameters: TemplateParameters;
    isPublic: boolean;
    downloads: number;
    rating: number;
    createdBy: string;
    createdAt: Date;
}

export type TemplateCategory =
    | 'social-media'
    | 'marketing'
    | 'branding'
    | 'presentation'
    | 'print'
    | 'web'
    | 'mobile'
    | 'video'
    | 'animation';

export interface TemplateParameters {
    customizable: string[];
    required: string[];
    optional: string[];
    defaultValues: Record<string, any>;
    constraints: Record<string, any>;
}