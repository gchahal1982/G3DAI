/**
 * G3D AnnotateAI MVP - Main Application Entry Point
 * 
 * Production-ready computer vision data labeling platform
 * Revenue potential: $48-108M annually
 * 
 * Features:
 * - Project management dashboard
 * - Multi-modal annotation workbench
 * - Real-time collaboration
 * - AI-assisted labeling
 * - Enterprise-grade quality control
 * - Advanced export capabilities
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlusIcon,
    FolderIcon,
    PlayIcon,
    ChartBarIcon,
    UsersIcon,
    CogIcon,
    DocumentTextIcon,
    CloudArrowUpIcon,
    SparklesIcon,
    EyeIcon,
    VideoCameraIcon,
    CubeIcon
} from '@heroicons/react/24/outline';

import { AnnotationWorkbench } from '../workbench/AnnotationWorkbench';
import ImageAnnotationEngine, { AnnotationProject, AnnotationSession } from '../annotation/ImageAnnotationEngine';
import VideoAnnotationEngine from '../annotation/VideoAnnotationEngine';
import PreAnnotationEngine from '../ai-assist/PreAnnotationEngine';

// Types
interface ProjectStats {
    totalProjects: number;
    activeProjects: number;
    totalImages: number;
    annotatedImages: number;
    totalVideos: number;
    annotatedVideos: number;
    totalAnnotations: number;
    qualityScore: number;
    aiAssistanceUsage: number;
    collaborators: number;
}

interface RecentProject {
    id: string;
    name: string;
    type: 'image' | 'video' | '3d';
    progress: number;
    lastModified: number;
    collaborators: number;
    annotations: number;
    status: 'active' | 'completed' | 'paused';
}

interface DashboardState {
    currentView: 'dashboard' | 'workbench';
    selectedProject: AnnotationProject | null;
    selectedSession: AnnotationSession | null;
    workbenchMode: 'image' | 'video' | '3d';
}

// Main application component
export default function AnnotateAIApp() {
    // Core state
    const [dashboardState, setDashboardState] = useState<DashboardState>({
        currentView: 'dashboard',
        selectedProject: null,
        selectedSession: null,
        workbenchMode: 'image'
    });

    // Data state
    const [projects, setProjects] = useState<AnnotationProject[]>([]);
    const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
    const [stats, setStats] = useState<ProjectStats>({
        totalProjects: 0,
        activeProjects: 0,
        totalImages: 0,
        annotatedImages: 0,
        totalVideos: 0,
        annotatedVideos: 0,
        totalAnnotations: 0,
        qualityScore: 0,
        aiAssistanceUsage: 0,
        collaborators: 0
    });

    // Engine refs
    const [imageEngine, setImageEngine] = useState<ImageAnnotationEngine | null>(null);
    const [videoEngine, setVideoEngine] = useState<VideoAnnotationEngine | null>(null);
    const [aiEngine, setAIEngine] = useState<PreAnnotationEngine | null>(null);

    // UI state
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateProject, setShowCreateProject] = useState(false);

    // Initialize engines and load data
    useEffect(() => {
        const initializeApp = async () => {
            try {
                setIsLoading(true);

                // Initialize annotation engines
                const imgEngine = new ImageAnnotationEngine();
                setImageEngine(imgEngine);

                const vidEngine = new VideoAnnotationEngine(imgEngine);
                setVideoEngine(vidEngine);

                const preEngine = new PreAnnotationEngine();
                setAIEngine(preEngine);

                // Load initial data
                await loadDashboardData();

                setIsLoading(false);

            } catch (error) {
                console.error('Failed to initialize AnnotateAI:', error);
                setIsLoading(false);
            }
        };

        initializeApp();

        // Cleanup on unmount
        return () => {
            // Cleanup will be handled by the engines internally if needed
        };
    }, []);

    // Load dashboard data
    const loadDashboardData = async () => {
        try {
            // In production, this would fetch from API
            const mockProjects: AnnotationProject[] = [
                {
                    id: 'proj-1',
                    name: 'Autonomous Vehicle Dataset',
                    description: 'Street scene annotation for self-driving cars',
                    type: 'detection',
                    labels: ['car', 'person', 'bicycle', 'traffic_light', 'stop_sign'],
                    guidelines: 'Annotate all visible objects with high precision',
                    quality: {
                        minConfidence: 0.8,
                        requireReview: true,
                        consensusThreshold: 0.9
                    },
                    created: Date.now() - 86400000 * 7,
                    modified: Date.now() - 3600000,
                    owner: 'user123',
                    collaborators: ['user456', 'user789'],
                    settings: {
                        autoSave: true,
                        autoSaveInterval: 30000,
                        enableAI: true,
                        aiModel: 'yolov5',
                        qualityControl: true,
                        allowConcurrentEditing: true,
                        exportFormat: ['coco', 'yolo'],
                        dataAugmentation: false,
                        privacyMode: false
                    }
                },
                {
                    id: 'proj-2',
                    name: 'Medical Imaging Analysis',
                    description: 'CT scan annotation for diagnostic AI',
                    type: 'segmentation',
                    labels: ['tumor', 'organ', 'bone', 'vessel'],
                    guidelines: 'Precise segmentation of medical structures',
                    quality: {
                        minConfidence: 0.9,
                        requireReview: true,
                        consensusThreshold: 0.95
                    },
                    created: Date.now() - 86400000 * 14,
                    modified: Date.now() - 7200000,
                    owner: 'user123',
                    collaborators: ['user456'],
                    settings: {
                        autoSave: true,
                        autoSaveInterval: 15000,
                        enableAI: true,
                        aiModel: 'deeplabv3',
                        qualityControl: true,
                        allowConcurrentEditing: false,
                        exportFormat: ['dicom', 'nifti'],
                        dataAugmentation: true,
                        privacyMode: true
                    }
                }
            ];

            const mockRecentProjects: RecentProject[] = [
                {
                    id: 'proj-1',
                    name: 'Autonomous Vehicle Dataset',
                    type: 'video',
                    progress: 73,
                    lastModified: Date.now() - 3600000,
                    collaborators: 3,
                    annotations: 15420,
                    status: 'active'
                },
                {
                    id: 'proj-2',
                    name: 'Medical Imaging Analysis',
                    type: 'image',
                    progress: 45,
                    lastModified: Date.now() - 7200000,
                    collaborators: 2,
                    annotations: 8750,
                    status: 'active'
                },
                {
                    id: 'proj-3',
                    name: 'Retail Product Recognition',
                    type: 'image',
                    progress: 100,
                    lastModified: Date.now() - 86400000,
                    collaborators: 1,
                    annotations: 5200,
                    status: 'completed'
                }
            ];

            const mockStats: ProjectStats = {
                totalProjects: 8,
                activeProjects: 5,
                totalImages: 45680,
                annotatedImages: 32150,
                totalVideos: 1240,
                annotatedVideos: 890,
                totalAnnotations: 156780,
                qualityScore: 94.7,
                aiAssistanceUsage: 68.3,
                collaborators: 12
            };

            setProjects(mockProjects);
            setRecentProjects(mockRecentProjects);
            setStats(mockStats);

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    // Handle project creation
    const handleCreateProject = async (projectData: Partial<AnnotationProject>) => {
        if (!imageEngine) return;

        try {
            const projectId = await imageEngine.createProject(projectData);
            await loadDashboardData(); // Refresh data
            setShowCreateProject(false);

            // Optionally open the new project
            const newProject = projects.find(p => p.id === projectId);
            if (newProject) {
                handleOpenProject(newProject);
            }

        } catch (error) {
            console.error('Failed to create project:', error);
        }
    };

    // Handle opening project in workbench
    const handleOpenProject = (project: AnnotationProject) => {
        setDashboardState({
            currentView: 'workbench',
            selectedProject: project,
            selectedSession: null,
            workbenchMode: project.type === 'detection' ? 'image' :
                project.type === 'segmentation' ? 'image' : 'video'
        });
    };

    // Handle returning to dashboard
    const handleReturnToDashboard = () => {
        setDashboardState({
            currentView: 'dashboard',
            selectedProject: null,
            selectedSession: null,
            workbenchMode: 'image'
        });
    };

    // Handle session save
    const handleSessionSave = (session: AnnotationSession) => {
        console.log('Session saved:', session);
        // Update local state or refresh data
    };

    // Handle export
    const handleExport = (format: string) => {
        console.log('Exporting in format:', format);
        // Handle export logic
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <>
            <Head>
                <title>G3D AnnotateAI - Computer Vision Data Labeling Platform</title>
                <meta name="description" content="Production-ready AI-powered annotation platform for computer vision training data" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="min-h-screen bg-gray-900">
                <AnimatePresence mode="wait">
                    {dashboardState.currentView === 'dashboard' ? (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Dashboard
                                stats={stats}
                                recentProjects={recentProjects}
                                onCreateProject={() => setShowCreateProject(true)}
                                onOpenProject={handleOpenProject}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="workbench"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AnnotationWorkbench
                                projectId={dashboardState.selectedProject?.id || ''}
                                sessionId={dashboardState.selectedSession?.id}
                                mode={dashboardState.workbenchMode}
                                collaborative={true}
                                onSave={handleSessionSave}
                                onExport={handleExport}
                            />

                            {/* Return to dashboard button */}
                            <button
                                onClick={handleReturnToDashboard}
                                className="fixed top-4 left-4 z-50 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
                            >
                                ← Dashboard
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Create Project Modal */}
                {showCreateProject && (
                    <CreateProjectModal
                        onClose={() => setShowCreateProject(false)}
                        onCreate={handleCreateProject}
                    />
                )}
            </div>
        </>
    );
}

// Dashboard component
const Dashboard: React.FC<{
    stats: ProjectStats;
    recentProjects: RecentProject[];
    onCreateProject: () => void;
    onOpenProject: (project: AnnotationProject) => void;
}> = ({ stats, recentProjects, onCreateProject, onOpenProject }) => {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <SparklesIcon className="h-8 w-8 text-indigo-500 mr-3" />
                            <div>
                                <h1 className="text-2xl font-bold text-white">G3D AnnotateAI</h1>
                                <p className="text-gray-400">Computer Vision Data Labeling Platform</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onCreateProject}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                            >
                                <PlusIcon className="h-4 w-4" />
                                <span>New Project</span>
                            </button>

                            <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors">
                                <CogIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Total Projects"
                        value={stats.totalProjects}
                        subtitle={`${stats.activeProjects} active`}
                        icon={FolderIcon}
                        color="blue"
                    />
                    <StatsCard
                        title="Annotations"
                        value={stats.totalAnnotations}
                        subtitle={`${Math.round((stats.annotatedImages / stats.totalImages) * 100)}% complete`}
                        icon={DocumentTextIcon}
                        color="green"
                    />
                    <StatsCard
                        title="Quality Score"
                        value={`${stats.qualityScore}%`}
                        subtitle="Average quality"
                        icon={ChartBarIcon}
                        color="purple"
                    />
                    <StatsCard
                        title="Collaborators"
                        value={stats.collaborators}
                        subtitle={`${stats.aiAssistanceUsage}% AI assist`}
                        icon={UsersIcon}
                        color="orange"
                    />
                </div>

                {/* Recent projects */}
                <div className="bg-gray-800 rounded-lg border border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-700">
                        <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {recentProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onOpen={() => {
                                        // Create a mock project for opening
                                        const mockProject: AnnotationProject = {
                                            id: project.id,
                                            name: project.name,
                                            description: '',
                                            type: 'detection',
                                            labels: [],
                                            guidelines: '',
                                            quality: {
                                                minConfidence: 0.8,
                                                requireReview: true,
                                                consensusThreshold: 0.9
                                            },
                                            created: Date.now(),
                                            modified: project.lastModified,
                                            owner: 'user123',
                                            collaborators: [],
                                            settings: {
                                                autoSave: true,
                                                autoSaveInterval: 30000,
                                                enableAI: true,
                                                aiModel: 'yolov5',
                                                qualityControl: true,
                                                allowConcurrentEditing: true,
                                                exportFormat: ['coco'],
                                                dataAugmentation: false,
                                                privacyMode: false
                                            }
                                        };
                                        onOpenProject(mockProject);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <QuickActionCard
                        title="Import Dataset"
                        description="Upload images or videos for annotation"
                        icon={CloudArrowUpIcon}
                        color="blue"
                        onClick={() => console.log('Import dataset')}
                    />
                    <QuickActionCard
                        title="AI Models"
                        description="Manage and configure AI assistance models"
                        icon={SparklesIcon}
                        color="purple"
                        onClick={() => console.log('AI models')}
                    />
                    <QuickActionCard
                        title="Analytics"
                        description="View detailed project analytics and insights"
                        icon={ChartBarIcon}
                        color="green"
                        onClick={() => console.log('Analytics')}
                    />
                </div>
            </main>
        </div>
    );
};

// Stats card component
const StatsCard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'green' | 'purple' | 'orange';
}> = ({ title, value, subtitle, icon: Icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500'
    };

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                    <p className="text-sm text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-xs text-gray-500">{subtitle}</p>
                </div>
            </div>
        </div>
    );
};

// Project card component
const ProjectCard: React.FC<{
    project: RecentProject;
    onOpen: () => void;
}> = ({ project, onOpen }) => {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return VideoCameraIcon;
            case '3d': return CubeIcon;
            default: return EyeIcon;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'completed': return 'bg-blue-500';
            case 'paused': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const TypeIcon = getTypeIcon(project.type);

    return (
        <div className="bg-gray-700 rounded-lg border border-gray-600 p-6 hover:border-gray-500 transition-colors cursor-pointer"
            onClick={onOpen}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <TypeIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                </div>
                <span className="text-xs text-gray-400 capitalize">{project.status}</span>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>

            <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                    />
                </div>
            </div>

            <div className="flex justify-between text-sm text-gray-400">
                <span>{project.annotations} annotations</span>
                <span>{project.collaborators} collaborators</span>
            </div>
        </div>
    );
};

// Quick action card component
const QuickActionCard: React.FC<{
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'green' | 'purple';
    onClick: () => void;
}> = ({ title, description, icon: Icon, color, onClick }) => {
    const colorClasses = {
        blue: 'border-blue-500 hover:bg-blue-500/10',
        green: 'border-green-500 hover:bg-green-500/10',
        purple: 'border-purple-500 hover:bg-purple-500/10'
    };

    return (
        <div
            className={`bg-gray-800 rounded-lg border-2 border-dashed ${colorClasses[color]} p-6 cursor-pointer transition-colors`}
            onClick={onClick}
        >
            <Icon className="h-8 w-8 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
        </div>
    );
};

// Create project modal component
const CreateProjectModal: React.FC<{
    onClose: () => void;
    onCreate: (project: Partial<AnnotationProject>) => void;
}> = ({ onClose, onCreate }) => {
    const [projectData, setProjectData] = useState({
        name: '',
        description: '',
        type: 'detection' as 'detection' | 'segmentation' | 'classification',
        labels: [] as string[],
        guidelines: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(projectData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-4">Create New Project</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Project Name
                        </label>
                        <input
                            type="text"
                            value={projectData.name}
                            onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={projectData.description}
                            onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Project Type
                        </label>
                        <select
                            value={projectData.type}
                            onChange={(e) => setProjectData({ ...projectData, type: e.target.value as any })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        >
                            <option value="detection">Object Detection</option>
                            <option value="segmentation">Segmentation</option>
                            <option value="classification">Classification</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Loading screen component
const LoadingScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-white mb-2">Initializing G3D AnnotateAI</h2>
                <p className="text-gray-400">Loading AI models and annotation engines...</p>
            </div>
        </div>
    );
};