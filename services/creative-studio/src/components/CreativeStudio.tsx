'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreativeProject,
    CreativeAsset,
    CreativeRequestType,
    GenerationOptions,
    BrandGuidelines
} from '@/types/creative.types';
import { CreativeAIEngine } from '@/services/CreativeAIEngine';
import { MetricsService } from '@/services/metrics/MetricsService';
import { BillingService } from '@/services/billing/BillingService';
import { Logger } from '@/utils/logger';

// Icons (placeholder - would use actual icon library)
const ImageIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const VideoIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const TextIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const DownloadIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>;

// Styled components with glassmorphism
const StudioContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="backdrop-blur-3xl">
            {children}
        </div>
    </div>
);

const StudioHeader = ({ children }: { children: React.ReactNode }) => (
    <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            {children}
        </div>
    </header>
);

const CreativeCanvas = ({ children }: { children: React.ReactNode }) => (
    <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
            {children}
        </div>
    </div>
);

const ToolPanel = ({ children }: { children: React.ReactNode }) => (
    <div className="col-span-2">
        <div className="sticky top-24 space-y-3">
            {children}
        </div>
    </div>
);

const MainCanvas = ({ children }: { children: React.ReactNode }) => (
    <div className="col-span-7">
        {children}
    </div>
);

const PropertiesPanel = ({ children }: { children: React.ReactNode }) => (
    <div className="col-span-3">
        <div className="sticky top-24">
            {children}
        </div>
    </div>
);

const AssetGrid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-2 gap-4">
        {children}
    </div>
);

interface CreativeTool {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    glassmorphism: {
        background: string;
        border: string;
    };
}

const CreativeTool: React.FC<CreativeTool> = ({ icon, label, onClick, glassmorphism }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="w-full p-4 rounded-xl transition-all duration-300 hover:shadow-xl"
        style={{
            background: glassmorphism.background,
            border: glassmorphism.border,
            backdropFilter: 'blur(10px)'
        }}
    >
        <div className="flex flex-col items-center space-y-2 text-white">
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </div>
    </motion.button>
);

interface AssetCardProps {
    asset: CreativeAsset;
    onClick: () => void;
    glassmorphism: {
        background: string;
        hover: string;
    };
    children: React.ReactNode;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick, glassmorphism, children }) => (
    <motion.div
        whileHover={{ y: -4 }}
        onClick={onClick}
        className="cursor-pointer rounded-xl overflow-hidden transition-all duration-300"
        style={{
            background: glassmorphism.background,
            backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.background = glassmorphism.hover;
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.background = glassmorphism.background;
        }}
    >
        {children}
    </motion.div>
);

const AssetPreview = ({ asset }: { asset: CreativeAsset }) => (
    <div className="aspect-square bg-gray-800/50 relative overflow-hidden">
        {asset.type === 'image' && asset.preview.thumbnail && (
            <img
                src={asset.preview.thumbnail}
                alt={asset.title}
                className="w-full h-full object-cover"
            />
        )}
        {asset.type === 'video' && asset.preview.animated && (
            <img
                src={asset.preview.animated}
                alt={asset.title}
                className="w-full h-full object-cover"
            />
        )}
        {asset.type === 'text' && (
            <div className="p-4 text-white/80 text-sm">
                {asset.preview.pages?.[0]}
            </div>
        )}
    </div>
);

const AssetMeta = ({ children }: { children: React.ReactNode }) => (
    <div className="p-3 space-y-1">
        {children}
    </div>
);

const AssetType = ({ children }: { children: React.ReactNode }) => (
    <div className="text-xs text-white/60 uppercase tracking-wider">
        {children}
    </div>
);

const GeneratedBy = ({ children }: { children: React.ReactNode }) => (
    <div className="text-xs text-white/40">
        {children}
    </div>
);

const AssetActions = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center space-x-2 mt-2">
        {children}
    </div>
);

const IconButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button
        onClick={(e) => {
            e.stopPropagation();
            onClick();
        }}
        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
    >
        {children}
    </button>
);

const BrandSelector = () => (
    <select className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white">
        <option>Default Brand</option>
        <option>Brand A</option>
        <option>Brand B</option>
    </select>
);

const ProjectTitle = ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-2xl font-bold text-white">
        {children}
    </h1>
);

const CollaboratorAvatars = () => (
    <div className="flex -space-x-2">
        {[1, 2, 3].map((i) => (
            <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white/20"
            />
        ))}
    </div>
);

interface AssetPropertiesProps {
    asset: CreativeAsset;
    onUpdate: (asset: CreativeAsset) => void;
    glassmorphism: {
        sections: string;
        inputs: string;
    };
}

const AssetProperties: React.FC<AssetPropertiesProps> = ({ asset, onUpdate, glassmorphism }) => (
    <div
        className="rounded-xl p-6 space-y-6"
        style={{
            background: glassmorphism.sections,
            backdropFilter: 'blur(10px)'
        }}
    >
        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Properties</h3>
            <div className="space-y-3">
                <div>
                    <label className="text-sm text-white/60">Title</label>
                    <input
                        type="text"
                        value={asset.title}
                        onChange={(e) => onUpdate({ ...asset, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-white"
                        style={{
                            background: glassmorphism.inputs,
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                    />
                </div>
                <div>
                    <label className="text-sm text-white/60">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {asset.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/80"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div>
            <h4 className="text-sm font-medium text-white/80 mb-2">AI Details</h4>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-white/60">Model</span>
                    <span className="text-white">{asset.ai.model}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-white/60">Confidence</span>
                    <span className="text-white">{(asset.ai.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-white/60">Generation Time</span>
                    <span className="text-white">{asset.ai.generationTime}ms</span>
                </div>
            </div>
        </div>

        <div>
            <h4 className="text-sm font-medium text-white/80 mb-2">Quality Metrics</h4>
            <div className="space-y-2">
                <QualityBar label="Technical" value={asset.quality.technicalQuality} />
                <QualityBar label="Aesthetic" value={asset.quality.aestheticScore} />
                <QualityBar label="Originality" value={asset.quality.originalityScore} />
            </div>
        </div>
    </div>
);

const QualityBar = ({ label, value }: { label: string; value: number }) => (
    <div>
        <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
            />
        </div>
    </div>
);

// Modal components
const GenerationModal = ({ children }: { children: React.ReactNode }) => (
    <AnimatePresence>
        {children && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-2xl"
                >
                    {children}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

// Main Creative Studio Component
export const CreativeStudio: React.FC = () => {
    const [project, setProject] = useState<CreativeProject | null>(null);
    const [assets, setAssets] = useState<CreativeAsset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<CreativeAsset | null>(null);
    const [activeGenerator, setActiveGenerator] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentBrand, setCurrentBrand] = useState<BrandGuidelines | null>(null);

    // Initialize services
    const [aiEngine] = useState(() => {
        const config = {
            imageGenerators: {
                stableDiffusion: {
                    endpoint: process.env.NEXT_PUBLIC_SD_ENDPOINT || '',
                    apiKey: process.env.NEXT_PUBLIC_SD_API_KEY || '',
                    models: ['sdxl', 'sd-1.5']
                },
                dalle3: {
                    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
                    organization: process.env.NEXT_PUBLIC_OPENAI_ORG || ''
                },
                midjourney: {
                    serverId: process.env.NEXT_PUBLIC_MJ_SERVER || '',
                    channelId: process.env.NEXT_PUBLIC_MJ_CHANNEL || '',
                    token: process.env.NEXT_PUBLIC_MJ_TOKEN || ''
                }
            },
            videoGenerators: {
                runway: {
                    apiKey: process.env.NEXT_PUBLIC_RUNWAY_API_KEY || '',
                    endpoint: process.env.NEXT_PUBLIC_RUNWAY_ENDPOINT || ''
                },
                pika: {
                    apiKey: process.env.NEXT_PUBLIC_PIKA_API_KEY || '',
                    endpoint: process.env.NEXT_PUBLIC_PIKA_ENDPOINT || ''
                },
                stableVideo: {
                    endpoint: process.env.NEXT_PUBLIC_SV_ENDPOINT || '',
                    apiKey: process.env.NEXT_PUBLIC_SV_API_KEY || ''
                }
            },
            textGenerators: {
                gpt4: {
                    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
                    organization: process.env.NEXT_PUBLIC_OPENAI_ORG || ''
                },
                claude3: {
                    apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || ''
                },
                gemini: {
                    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
                    project: process.env.NEXT_PUBLIC_GOOGLE_PROJECT || ''
                }
            },
            audioGenerators: {
                elevenlabs: {
                    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
                    voices: {}
                },
                mubert: {
                    apiKey: process.env.NEXT_PUBLIC_MUBERT_API_KEY || '',
                    licenseKey: process.env.NEXT_PUBLIC_MUBERT_LICENSE || ''
                },
                musicgen: {
                    endpoint: process.env.NEXT_PUBLIC_MUSICGEN_ENDPOINT || ''
                }
            },
            storage: {
                provider: 'aws' as const,
                bucket: process.env.NEXT_PUBLIC_S3_BUCKET || '',
                cdnUrl: process.env.NEXT_PUBLIC_CDN_URL || ''
            },
            compliance: {
                enableBrandCheck: true,
                enableLicenseCheck: true,
                enableContentModeration: true
            }
        };

        const logger = new Logger('CreativeStudio');
        const metrics = new MetricsService();
        const billing = new BillingService();

        return new CreativeAIEngine(config, { metrics, billing, logger });
    });

    // Tool handlers
    const openImageGenerator = () => {
        setActiveGenerator('image');
    };

    const openVideoGenerator = () => {
        setActiveGenerator('video');
    };

    const openCopyWriter = () => {
        setActiveGenerator('copy');
    };

    const selectAsset = (asset: CreativeAsset) => {
        setSelectedAsset(asset);
    };

    const editAsset = (asset: CreativeAsset) => {
        console.log('Edit asset:', asset);
        // TODO: Implement asset editing
    };

    const downloadAsset = async (asset: CreativeAsset) => {
        console.log('Download asset:', asset);
        // TODO: Implement asset download
        const mainFile = asset.files[0];
        if (mainFile) {
            window.open(mainFile.url, '_blank');
        }
    };

    const updateAsset = (updatedAsset: CreativeAsset) => {
        setAssets(assets.map(a => a.id === updatedAsset.id ? updatedAsset : a));
        setSelectedAsset(updatedAsset);
    };

    const handleImageGeneration = async (params: any) => {
        setIsGenerating(true);
        try {
            // TODO: Implement actual generation
            console.log('Generating image with params:', params);

            // Simulate generation
            setTimeout(() => {
                const mockAsset: CreativeAsset = {
                    id: `img_${Date.now()}`,
                    type: 'image',
                    requestId: `req_${Date.now()}`,
                    title: 'Generated Image',
                    tags: ['generated', 'ai', 'image'],
                    files: [{
                        id: 'file1',
                        format: 'png',
                        url: 'https://via.placeholder.com/800x800',
                        size: 1024000,
                        dimensions: { width: 800, height: 800, unit: 'px' },
                        metadata: {}
                    }],
                    preview: {
                        thumbnail: 'https://via.placeholder.com/400x400'
                    },
                    ai: {
                        model: 'stable-diffusion',
                        provider: 'replicate',
                        parameters: params,
                        confidence: 0.95,
                        generationTime: 3500
                    },
                    quality: {
                        technicalQuality: 92,
                        aestheticScore: 88,
                        originalityScore: 85
                    },
                    licensing: {
                        type: 'proprietary',
                        terms: 'Generated for exclusive use',
                        restrictions: []
                    },
                    copyright: {
                        owner: 'user-org',
                        year: 2024,
                        notice: '© 2024 User Organization. All rights reserved.'
                    },
                    version: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: 'current-user',
                    status: { state: 'ready' }
                };

                setAssets([...assets, mockAsset]);
                setActiveGenerator(null);
                setIsGenerating(false);
            }, 3000);
        } catch (error) {
            console.error('Generation failed:', error);
            setIsGenerating(false);
        }
    };

    // Load initial data
    useEffect(() => {
        // TODO: Load project and assets from API
        const mockProject: CreativeProject = {
            id: 'proj_1',
            name: 'Summer Campaign 2024',
            organizationId: 'org_1',
            type: 'marketing-campaign',
            status: 'in-progress',
            brief: {
                objective: 'Launch summer product line',
                keyMessages: ['Fresh', 'Vibrant', 'Adventure'],
                callToAction: 'Shop Now'
            },
            brand: {
                id: 'brand_1',
                name: 'Example Brand',
                colors: {
                    primary: { hex: '#2563eb', rgb: { r: 37, g: 99, b: 235 }, hsl: { h: 217, s: 83, l: 53 } },
                    secondary: { hex: '#8b5cf6', rgb: { r: 139, g: 92, b: 246 }, hsl: { h: 258, s: 89, l: 66 } },
                    accent: { hex: '#ec4899', rgb: { r: 236, g: 72, b: 153 }, hsl: { h: 330, s: 81, l: 60 } },
                    neutral: { hex: '#6b7280', rgb: { r: 107, g: 114, b: 128 }, hsl: { h: 220, s: 9, l: 46 } }
                },
                typography: {
                    primary: {
                        family: 'Inter',
                        weights: [400, 500, 600, 700],
                        styles: ['normal'],
                        sizes: { min: 14, max: 48, preferred: [16, 20, 24, 32] }
                    },
                    secondary: {
                        family: 'Roboto',
                        weights: [300, 400, 500],
                        styles: ['normal'],
                        sizes: { min: 12, max: 36, preferred: [14, 18, 24] }
                    }
                },
                logoUsage: {
                    primary: { id: 'logo', url: '/logo.svg', format: 'svg' },
                    variations: [],
                    clearSpace: 20,
                    minSize: { width: 100, height: 40, unit: 'px' }
                },
                tone: {
                    formality: 'conversational',
                    emotion: 'excited',
                    characteristics: ['energetic', 'youthful', 'adventurous']
                },
                values: ['innovation', 'sustainability', 'community'],
                personality: {
                    innovative: 0.9,
                    trustworthy: 0.8,
                    approachable: 0.9,
                    sophisticated: 0.6,
                    playful: 0.8,
                    authoritative: 0.5
                },
                visualStyle: {
                    aesthetic: 'modern',
                    mood: 'vibrant',
                    complexity: 'moderate'
                },
                imageryGuidelines: {
                    subjectMatter: ['people', 'nature', 'products'],
                    composition: ['dynamic', 'asymmetric'],
                    lighting: 'bright and airy',
                    colorGrading: 'warm and saturated',
                    avoid: ['dark', 'corporate', 'staged']
                }
            },
            owner: 'user_1',
            collaborators: [],
            assets: [],
            folders: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            settings: {
                autoSave: true,
                versionControl: true,
                approvalRequired: false,
                notificationPreferences: {
                    email: true,
                    inApp: true,
                    events: ['generation-complete', 'approval-needed']
                },
                exportDefaults: {
                    format: { type: 'png', quality: 95 },
                    naming: 'original',
                    structure: 'nested',
                    includeMetadata: true
                },
                aiPreferences: {
                    defaultModels: {
                        image: 'stable-diffusion',
                        video: 'runway',
                        text: 'gpt-4'
                    },
                    creativity: 0.7,
                    brandAdherence: 0.9,
                    autoEnhance: true,
                    suggestionsEnabled: true
                }
            }
        };

        setProject(mockProject);
        setCurrentBrand(mockProject.brand);
    }, []);

    return (
        <StudioContainer>
            <StudioHeader>
                <BrandSelector />
                <ProjectTitle>{project?.name || 'New Project'}</ProjectTitle>
                <CollaboratorAvatars />
            </StudioHeader>

            <CreativeCanvas>
                <ToolPanel>
                    <CreativeTool
                        icon={<ImageIcon />}
                        label="Image Generation"
                        onClick={openImageGenerator}
                        glassmorphism={{
                            background: 'rgba(236, 72, 153, 0.08)',
                            border: '1px solid rgba(236, 72, 153, 0.25)'
                        }}
                    />
                    <CreativeTool
                        icon={<VideoIcon />}
                        label="Video Creation"
                        onClick={openVideoGenerator}
                        glassmorphism={{
                            background: 'rgba(59, 130, 246, 0.08)',
                            border: '1px solid rgba(59, 130, 246, 0.25)'
                        }}
                    />
                    <CreativeTool
                        icon={<TextIcon />}
                        label="Copy Writing"
                        onClick={openCopyWriter}
                        glassmorphism={{
                            background: 'rgba(34, 197, 94, 0.08)',
                            border: '1px solid rgba(34, 197, 94, 0.25)'
                        }}
                    />
                </ToolPanel>

                <MainCanvas>
                    <AssetGrid>
                        {assets.map((asset) => (
                            <AssetCard
                                key={asset.id}
                                asset={asset}
                                onClick={() => selectAsset(asset)}
                                glassmorphism={{
                                    background: 'rgba(30, 30, 40, 0.85)',
                                    hover: 'rgba(99, 102, 241, 0.15)'
                                }}
                            >
                                <AssetPreview asset={asset} />
                                <AssetMeta>
                                    <AssetType>{asset.type}</AssetType>
                                    <GeneratedBy>{asset.ai.model}</GeneratedBy>
                                    <AssetActions>
                                        <IconButton onClick={() => editAsset(asset)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => downloadAsset(asset)}>
                                            <DownloadIcon />
                                        </IconButton>
                                    </AssetActions>
                                </AssetMeta>
                            </AssetCard>
                        ))}
                    </AssetGrid>
                </MainCanvas>

                <PropertiesPanel>
                    {selectedAsset && (
                        <AssetProperties
                            asset={selectedAsset}
                            onUpdate={updateAsset}
                            glassmorphism={{
                                sections: 'rgba(25, 25, 35, 0.60)',
                                inputs: 'rgba(255, 255, 255, 0.08)'
                            }}
                        />
                    )}
                </PropertiesPanel>
            </CreativeCanvas>

            <GenerationModal>
                {activeGenerator === 'image' && (
                    <ImageGeneratorUI
                        onGenerate={handleImageGeneration}
                        brandGuidelines={currentBrand}
                        isGenerating={isGenerating}
                        onClose={() => setActiveGenerator(null)}
                    />
                )}
            </GenerationModal>
        </StudioContainer>
    );
};

// Image Generator UI Component
interface ImageGeneratorUIProps {
    onGenerate: (params: any) => void;
    brandGuidelines: BrandGuidelines | null;
    isGenerating: boolean;
    onClose: () => void;
}

const ImageGeneratorUI: React.FC<ImageGeneratorUIProps> = ({
    onGenerate,
    brandGuidelines,
    isGenerating,
    onClose
}) => {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('modern');
    const [size, setSize] = useState('1080x1080');

    const handleGenerate = () => {
        onGenerate({
            prompt,
            style,
            size,
            brandGuidelines
        });
    };

    return (
        <div
            className="rounded-2xl p-8 text-white"
            style={{
                background: 'rgba(30, 30, 40, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Generate Image</h2>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Prompt</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe what you want to create..."
                        className="w-full h-32 px-4 py-3 rounded-lg resize-none"
                        style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Style</label>
                        <select
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg"
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <option value="modern">Modern</option>
                            <option value="classic">Classic</option>
                            <option value="bold">Bold</option>
                            <option value="minimal">Minimal</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Size</label>
                        <select
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg"
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <option value="1080x1080">Square (1080x1080)</option>
                            <option value="1920x1080">Landscape (1920x1080)</option>
                            <option value="1080x1920">Portrait (1080x1920)</option>
                            <option value="1200x628">Social (1200x628)</option>
                        </select>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={!prompt || isGenerating}
                    className="w-full py-4 rounded-lg font-medium bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? 'Generating...' : 'Generate Image'}
                </motion.button>
            </div>
        </div>
    );
};

export default CreativeStudio;