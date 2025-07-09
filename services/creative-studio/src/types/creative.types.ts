// Creative Studio Type Definitions

export type CreativeAssetType =
    | 'image'
    | 'video'
    | 'audio'
    | 'text'
    | 'animation'
    | '3d-model'
    | 'design-system'
    | 'brand-kit';

export type CreativeRequestType =
    | 'campaign'
    | 'social-media'
    | 'video-ad'
    | 'brand-identity'
    | 'product-visualization'
    | 'marketing-copy'
    | 'presentation'
    | 'email-template';

export interface CreativeRequest {
    id: string;
    type: CreativeRequestType;
    userId: string;
    organizationId: string;

    // Content specifications
    concept: string;
    brief?: CreativeBrief;
    brand?: BrandGuidelines;
    targetAudience?: TargetAudience;

    // Technical requirements
    formats?: OutputFormat[];
    dimensions?: Dimensions[];
    duration?: number; // For video/audio
    language?: string;
    tone?: ToneOfVoice;

    // Constraints
    budget?: CreativeBudget;
    deadline?: Date;
    compliance?: ComplianceRequirements;

    // AI preferences
    aiModels?: AIModelPreference[];
    creativity?: number; // 0-1 scale
    brandAdherence?: number; // 0-1 scale

    metadata?: Record<string, any>;
}

export interface CreativeBrief {
    objective: string;
    keyMessages: string[];
    callToAction: string;
    inspiration?: InspirationReference[];
    avoidList?: string[];
    mandatoryElements?: string[];
}

export interface InspirationReference {
    id: string;
    type: 'image' | 'video' | 'website' | 'campaign';
    url: string;
    description?: string;
    aspectsToEmulate?: string[];
}

export interface BrandGuidelines {
    id: string;
    name: string;

    // Visual identity
    colors: {
        primary: ColorPalette;
        secondary: ColorPalette;
        accent: ColorPalette;
        neutral: ColorPalette;
    };

    typography: {
        primary: FontSpecification;
        secondary: FontSpecification;
        display?: FontSpecification;
    };

    logoUsage: {
        primary: AssetReference;
        variations: AssetReference[];
        clearSpace: number;
        minSize: Dimensions;
    };

    // Brand personality
    tone: ToneOfVoice;
    values: string[];
    personality: PersonalityTraits;

    // Style preferences
    visualStyle: VisualStyle;
    imageryGuidelines: ImageryGuidelines;

    // Compliance
    legalRequirements?: string[];
    copyrightNotice?: string;
}

export interface AssetReference {
    id: string;
    url: string;
    format: string;
    variants?: {
        size: string;
        url: string;
    }[];
}

export interface CreativeAsset {
    id: string;
    type: CreativeAssetType;
    requestId: string;

    // Asset details
    title: string;
    description?: string;
    tags: string[];

    // File information
    files: AssetFile[];
    preview: PreviewData;

    // AI generation details
    ai: {
        model: string;
        provider: string;
        parameters: Record<string, any>;
        confidence: number;
        generationTime: number;
    };

    // Quality metrics
    quality: QualityMetrics;

    // Brand compliance
    brandCompliance?: BrandComplianceScore;

    // Legal and licensing
    licensing: LicensingInfo;
    copyright: CopyrightInfo;

    // Versioning
    version: number;
    parentId?: string;
    variations?: AssetVariation[];

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    status: AssetStatus;

    // Usage tracking
    usage?: UsageTracking;
}

export interface AssetFile {
    id: string;
    format: string;
    url: string;
    size: number;
    dimensions?: Dimensions;
    duration?: number; // For video/audio
    metadata: Record<string, any>;
}

export interface PreviewData {
    thumbnail: string;
    animated?: string; // GIF or video preview
    waveform?: string; // For audio
    pages?: string[]; // For multi-page documents
}

export interface QualityMetrics {
    resolution?: number;
    sharpness?: number;
    colorAccuracy?: number;
    composition?: number;
    technicalQuality: number; // 0-100
    aestheticScore: number; // 0-100
    originalityScore: number; // 0-100
}

export interface BrandComplianceScore {
    overall: number; // 0-100
    colorCompliance: number;
    typographyCompliance: number;
    styleCompliance: number;
    toneCompliance: number;
    issues: ComplianceIssue[];
}

export interface ComplianceIssue {
    type: 'color' | 'typography' | 'style' | 'tone' | 'legal';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    suggestion?: string;
    autoFixAvailable: boolean;
}

export interface CreativeProject {
    id: string;
    name: string;
    description?: string;
    organizationId: string;

    // Project details
    type: ProjectType;
    status: ProjectStatus;
    brief: CreativeBrief;
    brand: BrandGuidelines;

    // Team
    owner: string;
    collaborators: Collaborator[];

    // Assets
    assets: string[]; // Asset IDs
    folders: ProjectFolder[];

    // Timeline
    createdAt: Date;
    updatedAt: Date;
    deadline?: Date;
    milestones?: Milestone[];

    // Settings
    settings: ProjectSettings;

    // Analytics
    analytics?: ProjectAnalytics;
}

export interface ProjectFolder {
    id: string;
    name: string;
    parentId?: string;
    assets: string[];
    subfolders: string[];
    permissions?: FolderPermissions;
}

export interface Milestone {
    id: string;
    name: string;
    description?: string;
    dueDate: Date;
    status: 'pending' | 'in-progress' | 'completed' | 'overdue';
    deliverables: string[];
    assignedTo?: string[];
}

export interface ProjectSettings {
    autoSave: boolean;
    versionControl: boolean;
    approvalRequired: boolean;
    notificationPreferences: NotificationSettings;
    exportDefaults: ExportSettings;
    aiPreferences: AIPreferences;
}

export interface ProjectAnalytics {
    totalAssets: number;
    assetsByType: Record<CreativeAssetType, number>;
    totalGenerationTime: number;
    totalCost: number;
    teamProductivity: ProductivityMetrics;
    assetPerformance?: AssetPerformanceMetrics;
}

export interface GenerationOptions {
    // Image generation
    imageStyle?: ImageStyle;
    imageQuality?: 'draft' | 'standard' | 'high' | 'ultra';
    imageModel?: 'stable-diffusion' | 'dalle-3' | 'midjourney' | 'custom';

    // Video generation
    videoStyle?: VideoStyle;
    videoQuality?: '720p' | '1080p' | '4k' | '8k';
    frameRate?: 24 | 30 | 60;
    videoModel?: 'runway' | 'pika' | 'stable-video' | 'custom';

    // Text generation
    textModel?: 'gpt-4' | 'claude-3' | 'gemini-pro' | 'custom';
    textLength?: 'short' | 'medium' | 'long' | number;
    textFormat?: 'paragraph' | 'bullet-points' | 'headline' | 'script';

    // Audio generation
    audioModel?: 'elevenlabs' | 'mubert' | 'musicgen' | 'custom';
    voiceId?: string;
    musicStyle?: string;

    // Common options
    variations?: number;
    seed?: number;
    temperature?: number;
    guidanceScale?: number;
}

export interface ImageStyle {
    artistic?: 'photorealistic' | 'illustration' | 'cartoon' | 'abstract' | 'painting';
    technique?: string;
    lighting?: string;
    mood?: string;
    colorGrading?: string;
}

export interface VideoStyle {
    cinematography?: string;
    editing?: 'fast-paced' | 'slow' | 'dynamic' | 'minimal';
    transitions?: string[];
    effects?: string[];
    musicStyle?: string;
}

export interface CampaignAssets {
    id: string;
    campaignName: string;

    // Core assets
    images: CreativeAsset[];
    videos: CreativeAsset[];
    copy: CreativeAsset[];

    // Platform-specific
    social: {
        facebook: CreativeAsset[];
        instagram: CreativeAsset[];
        twitter: CreativeAsset[];
        linkedin: CreativeAsset[];
        tiktok: CreativeAsset[];
    };

    // Additional materials
    email: CreativeAsset[];
    landing: CreativeAsset[];
    display: CreativeAsset[];
    print?: CreativeAsset[];

    // Performance tracking
    performance?: CampaignPerformance;

    // Compliance and approval
    brandCompliance: BrandComplianceScore;
    approvals: ApprovalRecord[];

    // Export packages
    exportPackages: ExportPackage[];
}

export interface CampaignPerformance {
    impressions: number;
    clicks: number;
    conversions: number;
    engagement: EngagementMetrics;
    roi: number;
    abTestResults?: ABTestResults[];
}

export interface ApprovalRecord {
    id: string;
    approver: string;
    status: 'pending' | 'approved' | 'rejected' | 'revision-requested';
    comments?: string;
    timestamp: Date;
    version: number;
}

export interface ExportPackage {
    id: string;
    name: string;
    format: 'zip' | 'drive' | 'dropbox' | 'wetransfer';
    assets: string[];
    metadata: boolean;
    includeSourceFiles: boolean;
    url?: string;
    expiresAt?: Date;
}

// Supporting types
export interface ColorPalette {
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
    name?: string;
    usage?: string;
}

export interface FontSpecification {
    family: string;
    weights: number[];
    styles: string[];
    sizes: {
        min: number;
        max: number;
        preferred: number[];
    };
    lineHeight?: number;
    letterSpacing?: number;
}

export interface Dimensions {
    width: number;
    height: number;
    unit: 'px' | 'in' | 'cm' | 'mm';
}

export interface ToneOfVoice {
    formality: 'casual' | 'conversational' | 'professional' | 'formal';
    emotion: 'neutral' | 'friendly' | 'excited' | 'serious' | 'empathetic';
    characteristics: string[];
}

export interface PersonalityTraits {
    innovative: number; // 0-1
    trustworthy: number;
    approachable: number;
    sophisticated: number;
    playful: number;
    authoritative: number;
}

export interface VisualStyle {
    aesthetic: 'minimal' | 'modern' | 'classic' | 'bold' | 'organic' | 'tech';
    mood: 'bright' | 'dark' | 'vibrant' | 'muted' | 'warm' | 'cool';
    complexity: 'simple' | 'moderate' | 'detailed';
}

export interface ImageryGuidelines {
    subjectMatter: string[];
    composition: string[];
    lighting: string;
    colorGrading: string;
    avoid: string[];
}

export interface AssetStatus {
    state: 'generating' | 'processing' | 'ready' | 'failed' | 'archived';
    progress?: number;
    error?: string;
}

export interface LicensingInfo {
    type: 'royalty-free' | 'rights-managed' | 'creative-commons' | 'proprietary';
    terms: string;
    restrictions?: string[];
    attribution?: string;
}

export interface CopyrightInfo {
    owner: string;
    year: number;
    notice: string;
    registrationNumber?: string;
}

export interface UsageTracking {
    downloads: number;
    views: number;
    shares: number;
    campaigns: string[];
    lastUsed: Date;
}

export interface AssetVariation {
    id: string;
    type: 'size' | 'format' | 'style' | 'language' | 'platform';
    description: string;
    file: AssetFile;
    metadata?: Record<string, any>;
}

export type ProjectType =
    | 'marketing-campaign'
    | 'brand-development'
    | 'content-series'
    | 'product-launch'
    | 'event-promotion'
    | 'social-media'
    | 'internal-communications';

export type ProjectStatus =
    | 'planning'
    | 'in-progress'
    | 'review'
    | 'approved'
    | 'completed'
    | 'archived';

export interface Collaborator {
    userId: string;
    role: 'owner' | 'editor' | 'viewer' | 'approver';
    permissions: Permission[];
    addedAt: Date;
    lastActive: Date;
}

export interface Permission {
    action: 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'share';
    resource: 'assets' | 'projects' | 'brands' | 'team';
}

export interface AIModelPreference {
    capability: 'image' | 'video' | 'text' | 'audio';
    provider: string;
    model: string;
    priority: number;
}

export interface ComplianceRequirements {
    regulations: string[]; // GDPR, CCPA, COPPA, etc.
    industries: string[]; // Healthcare, Finance, etc.
    certifications: string[]; // ISO, SOC2, etc.
    customRules?: ComplianceRule[];
}

export interface ComplianceRule {
    id: string;
    name: string;
    description: string;
    validator: (asset: CreativeAsset) => Promise<boolean>;
}

export interface OutputFormat {
    type: string; // 'jpeg', 'png', 'mp4', 'pdf', etc.
    quality?: number;
    compression?: string;
    colorSpace?: 'sRGB' | 'AdobeRGB' | 'ProPhoto' | 'P3';
    metadata?: boolean;
}

export interface CreativeBudget {
    tokens?: number;
    credits?: number;
    dollarAmount?: number;
    computeTime?: number; // in seconds
}

export interface TargetAudience {
    demographics: {
        ageRange?: [number, number];
        gender?: string[];
        location?: string[];
        language?: string[];
    };
    psychographics: {
        interests?: string[];
        values?: string[];
        lifestyle?: string[];
    };
    behavior: {
        purchaseHistory?: string[];
        brandAffinity?: string[];
        mediaConsumption?: string[];
    };
}

export interface FolderPermissions {
    inherit: boolean;
    customPermissions?: {
        userId: string;
        permissions: Permission[];
    }[];
}

export interface NotificationSettings {
    email: boolean;
    inApp: boolean;
    slack?: boolean;
    events: string[];
}

export interface ExportSettings {
    format: OutputFormat;
    naming: 'original' | 'sequential' | 'custom';
    structure: 'flat' | 'nested';
    includeMetadata: boolean;
}

export interface AIPreferences {
    defaultModels: Record<string, string>;
    creativity: number;
    brandAdherence: number;
    autoEnhance: boolean;
    suggestionsEnabled: boolean;
}

export interface ProductivityMetrics {
    assetsPerDay: number;
    averageGenerationTime: number;
    revisionRate: number;
    approvalRate: number;
}

export interface AssetPerformanceMetrics {
    topPerforming: string[];
    engagementByType: Record<CreativeAssetType, number>;
    conversionsByAsset: Record<string, number>;
}

export interface EngagementMetrics {
    likes: number;
    shares: number;
    comments: number;
    saves: number;
    avgTimeSpent?: number;
}

export interface ABTestResults {
    variantA: string;
    variantB: string;
    winner?: string;
    confidence: number;
    metrics: Record<string, number>;
}