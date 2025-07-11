"use client";

/**
 * XR Annotation Workspace Page
 * 
 * Dedicated workspace for XR annotation functionality.
 * Provides comprehensive XR annotation capabilities with immersive interfaces.
 * 
 * Features:
 * - XR device management interface
 * - XR session controls and monitoring
 * - XR annotation project management
 * - XR settings and preferences
 * - XR performance monitoring
 * - XR tutorial and onboarding
 * - XR troubleshooting tools
 * - Integration with main annotation workbench
 * 
 * Part of Phase 2.1 - Core Systems Integration
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Box, 
    Eye, 
    Settings, 
    Play, 
    Pause, 
    Square,
    Headphones,
    Gamepad2,
    Hand,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Zap,
    Activity,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    Maximize2,
    Minimize2,
    RotateCw,
    Move3D,
    Layers3,
    Circle,
    Target,
    Crosshair,
    Navigation,
    Compass,
    Map,
    Camera,
    Video,
    Image,
    Save,
    Download,
    Upload,
    Share2,
    Users,
    MessageSquare,
    HelpCircle,
    BookOpen,
    Lightbulb,
    Wrench,
    Gauge,
    BarChart3,
    TrendingUp,
    Wifi,
    WifiOff,
    Battery,
    Thermometer,
    Cpu,
    HardDrive,
    MemoryStick,
    Clock,
    Timer,
    PlayCircle,
    PauseCircle,
    StopCircle,
    FastForward,
    Rewind,
    SkipBack,
    SkipForward,
    Repeat,
    Shuffle,
    Volume1,
    Volume,
    Vibrate,
    Smartphone,
    Tablet,
    Laptop,
    Monitor,
    Server,
    Cloud,
    Database,
    Network,
    Globe,
    Satellite,
    Router,
    Antenna,
    Signal,
    SignalHigh,
    SignalLow,
    SignalMedium,
    SignalZero
} from 'lucide-react';

// UI Components
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Badge,
    Progress,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Alert,
    AlertDescription,
    Switch,
    Slider,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Input,
    Label,
    Separator,
    ScrollArea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../../../../../../shared/components/ui';

// XR Components
import XRAnnotationInterface from '../../../components/xr/XRAnnotationInterface';
import { XRSessionMode, XRAnnotationData, XRUser } from '../../../core/XRAnnotation';

// Types and Interfaces
interface XRProject {
    id: string;
    name: string;
    description: string;
    created: Date;
    modified: Date;
    type: 'vr' | 'ar' | 'mixed';
    status: 'active' | 'paused' | 'completed' | 'archived';
    sessionMode: XRSessionMode;
    annotations: XRAnnotationData[];
    participants: XRUser[];
    settings: XRProjectSettings;
    metrics: XRProjectMetrics;
}

interface XRProjectSettings {
    roomScale: { width: number; height: number; depth: number };
    trackingArea: { x: number; y: number; z: number };
    handTracking: boolean;
    eyeTracking: boolean;
    voiceInput: boolean;
    hapticFeedback: boolean;
    spatialAudio: boolean;
    passthrough: boolean;
    guardianSystem: boolean;
    safetyMode: boolean;
    recordSession: boolean;
    streamSession: boolean;
    multiuser: boolean;
    maxUsers: number;
}

interface XRProjectMetrics {
    totalSessions: number;
    totalDuration: number;
    annotationsCreated: number;
    averageSessionTime: number;
    trackingQuality: number;
    performanceScore: number;
    usabilityScore: number;
    comfortScore: number;
}

interface XRDevice {
    id: string;
    name: string;
    type: 'headset' | 'controller' | 'tracker' | 'haptic';
    brand: string;
    model: string;
    connected: boolean;
    battery: number;
    firmware: string;
    capabilities: string[];
    status: 'active' | 'standby' | 'charging' | 'error';
    temperature: number;
    tracking: {
        quality: number;
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number; w: number };
    };
}

interface XRSession {
    id: string;
    projectId: string;
    name: string;
    startTime: Date;
    endTime?: Date;
    duration: number;
    mode: XRSessionMode;
    participants: XRUser[];
    annotations: XRAnnotationData[];
    performance: {
        averageFPS: number;
        minFPS: number;
        maxFPS: number;
        frameDrops: number;
        latency: number;
        trackingLoss: number;
        motionSickness: number;
    };
    recordings: {
        video: boolean;
        audio: boolean;
        tracking: boolean;
        annotations: boolean;
    };
}

export default function XRAnnotationWorkspace() {
    // State Management
    const [currentProject, setCurrentProject] = useState<XRProject | null>(null);
    const [projects, setProjects] = useState<XRProject[]>([]);
    const [devices, setDevices] = useState<XRDevice[]>([]);
    const [sessions, setSessions] = useState<XRSession[]>([]);
    const [activeSession, setActiveSession] = useState<XRSession | null>(null);
    
    // XR State
    const [xrMode, setXRMode] = useState<XRSessionMode | null>(null);
    const [isXRActive, setIsXRActive] = useState(false);
    const [xrSupported, setXRSupported] = useState(false);
    const [roomSetup, setRoomSetup] = useState(false);
    
    // UI State
    const [activeTab, setActiveTab] = useState('projects');
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showDiagnostics, setShowDiagnostics] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    
    // Performance Metrics
    const [performanceMetrics, setPerformanceMetrics] = useState({
        fps: 0,
        latency: 0,
        trackingQuality: 0,
        batteryLife: 0,
        temperature: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        networkLatency: 0
    });
    
    // Refs
    const workspaceRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Initialize XR workspace
    useEffect(() => {
        initializeXRWorkspace();
        loadProjects();
        loadDevices();
        loadSessions();
        
        // Start performance monitoring
        const interval = setInterval(updatePerformanceMetrics, 1000);
        
        return () => clearInterval(interval);
    }, []);
    
    // Initialize XR workspace
    const initializeXRWorkspace = useCallback(async () => {
        try {
            // Check WebXR support
            if ('xr' in navigator) {
                const supported = await (navigator as any).xr.isSessionSupported('immersive-vr');
                setXRSupported(supported);
            }
            
            // Initialize room setup
            setRoomSetup(true);
            
        } catch (error) {
            console.error('Failed to initialize XR workspace:', error);
        }
    }, []);
    
    // Load projects
    const loadProjects = useCallback(() => {
        const mockProjects: XRProject[] = [
            {
                id: 'xr-project-1',
                name: 'VR Medical Training',
                description: 'Virtual reality training for medical procedures',
                created: new Date('2024-01-15'),
                modified: new Date('2024-01-20'),
                type: 'vr',
                status: 'active',
                sessionMode: XRSessionMode.IMMERSIVE_VR,
                annotations: [],
                participants: [],
                settings: {
                    roomScale: { width: 4, height: 3, depth: 4 },
                    trackingArea: { x: 0, y: 0, z: 0 },
                    handTracking: true,
                    eyeTracking: false,
                    voiceInput: true,
                    hapticFeedback: true,
                    spatialAudio: true,
                    passthrough: false,
                    guardianSystem: true,
                    safetyMode: true,
                    recordSession: true,
                    streamSession: false,
                    multiuser: false,
                    maxUsers: 1
                },
                metrics: {
                    totalSessions: 15,
                    totalDuration: 4500,
                    annotationsCreated: 87,
                    averageSessionTime: 300,
                    trackingQuality: 0.95,
                    performanceScore: 0.92,
                    usabilityScore: 0.88,
                    comfortScore: 0.85
                }
            },
            {
                id: 'xr-project-2',
                name: 'AR Industrial Inspection',
                description: 'Augmented reality for industrial equipment inspection',
                created: new Date('2024-01-10'),
                modified: new Date('2024-01-18'),
                type: 'ar',
                status: 'active',
                sessionMode: XRSessionMode.IMMERSIVE_AR,
                annotations: [],
                participants: [],
                settings: {
                    roomScale: { width: 10, height: 3, depth: 10 },
                    trackingArea: { x: 0, y: 0, z: 0 },
                    handTracking: true,
                    eyeTracking: false,
                    voiceInput: true,
                    hapticFeedback: false,
                    spatialAudio: false,
                    passthrough: true,
                    guardianSystem: false,
                    safetyMode: true,
                    recordSession: true,
                    streamSession: true,
                    multiuser: true,
                    maxUsers: 4
                },
                metrics: {
                    totalSessions: 32,
                    totalDuration: 7200,
                    annotationsCreated: 156,
                    averageSessionTime: 225,
                    trackingQuality: 0.89,
                    performanceScore: 0.87,
                    usabilityScore: 0.91,
                    comfortScore: 0.94
                }
            }
        ];
        
        setProjects(mockProjects);
        setCurrentProject(mockProjects[0]);
    }, []);
    
    // Load devices
    const loadDevices = useCallback(() => {
        const mockDevices: XRDevice[] = [
            {
                id: 'device-1',
                name: 'Meta Quest 2',
                type: 'headset',
                brand: 'Meta',
                model: 'Quest 2',
                connected: true,
                battery: 85,
                firmware: '45.0.0',
                capabilities: ['6DOF', 'handTracking', 'passthrough', 'guardian'],
                status: 'active',
                temperature: 38,
                tracking: {
                    quality: 0.95,
                    position: { x: 0, y: 1.7, z: 0 },
                    rotation: { x: 0, y: 0, z: 0, w: 1 }
                }
            },
            {
                id: 'device-2',
                name: 'Quest Touch Controller (L)',
                type: 'controller',
                brand: 'Meta',
                model: 'Touch Controller',
                connected: true,
                battery: 92,
                firmware: '45.0.0',
                capabilities: ['6DOF', 'haptics', 'buttons', 'analog'],
                status: 'active',
                temperature: 35,
                tracking: {
                    quality: 0.98,
                    position: { x: -0.3, y: 1.2, z: -0.2 },
                    rotation: { x: 0, y: 0, z: 0, w: 1 }
                }
            },
            {
                id: 'device-3',
                name: 'Quest Touch Controller (R)',
                type: 'controller',
                brand: 'Meta',
                model: 'Touch Controller',
                connected: true,
                battery: 88,
                firmware: '45.0.0',
                capabilities: ['6DOF', 'haptics', 'buttons', 'analog'],
                status: 'active',
                temperature: 36,
                tracking: {
                    quality: 0.97,
                    position: { x: 0.3, y: 1.2, z: -0.2 },
                    rotation: { x: 0, y: 0, z: 0, w: 1 }
                }
            }
        ];
        
        setDevices(mockDevices);
    }, []);
    
    // Load sessions
    const loadSessions = useCallback(() => {
        const mockSessions: XRSession[] = [
            {
                id: 'session-1',
                projectId: 'xr-project-1',
                name: 'Medical Training Session #1',
                startTime: new Date('2024-01-20T10:00:00'),
                endTime: new Date('2024-01-20T10:30:00'),
                duration: 1800,
                mode: XRSessionMode.IMMERSIVE_VR,
                participants: [],
                annotations: [],
                performance: {
                    averageFPS: 72,
                    minFPS: 68,
                    maxFPS: 75,
                    frameDrops: 3,
                    latency: 18,
                    trackingLoss: 0.02,
                    motionSickness: 0.1
                },
                recordings: {
                    video: true,
                    audio: true,
                    tracking: true,
                    annotations: true
                }
            }
        ];
        
        setSessions(mockSessions);
    }, []);
    
    // Update performance metrics
    const updatePerformanceMetrics = useCallback(() => {
        setPerformanceMetrics(prev => ({
            ...prev,
            fps: Math.round(60 + Math.random() * 30),
            latency: Math.round(15 + Math.random() * 10),
            trackingQuality: Math.round((90 + Math.random() * 10) * 100) / 100,
            batteryLife: Math.max(0, prev.batteryLife - 0.1),
            temperature: Math.round(35 + Math.random() * 10),
            memoryUsage: Math.round(40 + Math.random() * 20),
            cpuUsage: Math.round(30 + Math.random() * 30),
            networkLatency: Math.round(20 + Math.random() * 15)
        }));
    }, []);
    
    // Start XR session
    const startXRSession = useCallback(async (mode: XRSessionMode) => {
        try {
            setXRMode(mode);
            setIsXRActive(true);
            
            // Create new session
            const newSession: XRSession = {
                id: `session-${Date.now()}`,
                projectId: currentProject?.id || '',
                name: `${mode === XRSessionMode.IMMERSIVE_VR ? 'VR' : 'AR'} Session`,
                startTime: new Date(),
                duration: 0,
                mode,
                participants: [],
                annotations: [],
                performance: {
                    averageFPS: 0,
                    minFPS: 0,
                    maxFPS: 0,
                    frameDrops: 0,
                    latency: 0,
                    trackingLoss: 0,
                    motionSickness: 0
                },
                recordings: {
                    video: false,
                    audio: false,
                    tracking: true,
                    annotations: true
                }
            };
            
            setActiveSession(newSession);
            
        } catch (error) {
            console.error('Failed to start XR session:', error);
        }
    }, [currentProject]);
    
    // End XR session
    const endXRSession = useCallback(() => {
        if (activeSession) {
            const updatedSession = {
                ...activeSession,
                endTime: new Date(),
                duration: Date.now() - activeSession.startTime.getTime()
            };
            
            setSessions(prev => [...prev, updatedSession]);
        }
        
        setXRMode(null);
        setIsXRActive(false);
        setActiveSession(null);
    }, [activeSession]);
    
    // Create new project
    const createNewProject = useCallback(() => {
        const newProject: XRProject = {
            id: `xr-project-${Date.now()}`,
            name: 'New XR Project',
            description: 'New XR annotation project',
            created: new Date(),
            modified: new Date(),
            type: 'vr',
            status: 'active',
            sessionMode: XRSessionMode.IMMERSIVE_VR,
            annotations: [],
            participants: [],
            settings: {
                roomScale: { width: 4, height: 3, depth: 4 },
                trackingArea: { x: 0, y: 0, z: 0 },
                handTracking: true,
                eyeTracking: false,
                voiceInput: true,
                hapticFeedback: true,
                spatialAudio: true,
                passthrough: false,
                guardianSystem: true,
                safetyMode: true,
                recordSession: true,
                streamSession: false,
                multiuser: false,
                maxUsers: 1
            },
            metrics: {
                totalSessions: 0,
                totalDuration: 0,
                annotationsCreated: 0,
                averageSessionTime: 0,
                trackingQuality: 0,
                performanceScore: 0,
                usabilityScore: 0,
                comfortScore: 0
            }
        };
        
        setProjects(prev => [...prev, newProject]);
        setCurrentProject(newProject);
    }, []);
    
    // Render project card
    const renderProjectCard = (project: XRProject) => (
        <Card key={project.id} className={`cursor-pointer transition-all duration-200 ${
            currentProject?.id === project.id 
                ? 'ring-2 ring-blue-500 bg-blue-500/10' 
                : 'hover:bg-white/5'
        }`} onClick={() => setCurrentProject(project)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            {project.type === 'vr' ? <Box className="w-5 h-5 text-blue-400" /> : <Eye className="w-5 h-5 text-green-400" />}
                        </div>
                        <div>
                            <CardTitle className="text-lg text-white">{project.name}</CardTitle>
                            <p className="text-sm text-gray-400">{project.description}</p>
                        </div>
                    </div>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-400">Sessions:</span>
                        <span className="ml-2 text-white">{project.metrics.totalSessions}</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Annotations:</span>
                        <span className="ml-2 text-white">{project.metrics.annotationsCreated}</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Quality:</span>
                        <span className="ml-2 text-white">{(project.metrics.trackingQuality * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Modified:</span>
                        <span className="ml-2 text-white">{project.modified.toLocaleDateString()}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
    
    // Render device status
    const renderDeviceStatus = (device: XRDevice) => (
        <div key={device.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                    {device.type === 'headset' && <Box className="w-4 h-4 text-green-400" />}
                    {device.type === 'controller' && <Gamepad2 className="w-4 h-4 text-blue-400" />}
                    {device.type === 'tracker' && <Target className="w-4 h-4 text-purple-400" />}
                    {device.type === 'haptic' && <Vibrate className="w-4 h-4 text-orange-400" />}
                </div>
                <div>
                    <p className="text-sm font-medium text-white">{device.name}</p>
                    <p className="text-xs text-gray-400">{device.brand} {device.model}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <Battery className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">{device.battery}%</span>
                </div>
                <Badge variant={device.connected ? 'default' : 'secondary'}>
                    {device.connected ? 'Connected' : 'Disconnected'}
                </Badge>
            </div>
        </div>
    );
    
    return (
        <TooltipProvider>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/20 rounded-xl">
                                <Box className="w-8 h-8 text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">XR Annotation Workspace</h1>
                                <p className="text-gray-400">Extended Reality annotation and collaboration platform</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant={xrSupported ? 'default' : 'destructive'}>
                                {xrSupported ? 'XR Supported' : 'XR Not Supported'}
                            </Badge>
                            {isXRActive && (
                                <Badge variant="default" className="bg-green-500/20 text-green-400">
                                    <Activity className="w-3 h-3 mr-1" />
                                    XR Active
                                </Badge>
                            )}
                            <Button
                                onClick={() => setShowTutorial(true)}
                                variant="outline"
                                className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                            >
                                <HelpCircle className="w-4 h-4 mr-2" />
                                Tutorial
                            </Button>
                        </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Left Panel */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* XR Session Controls */}
                            <Card className="annotate-glass border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white">XR Session Control</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Session Controls */}
                                        <div className="flex items-center gap-4">
                                            <Button
                                                onClick={() => startXRSession(XRSessionMode.IMMERSIVE_VR)}
                                                disabled={!xrSupported || isXRActive}
                                                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
                                            >
                                                <Box className="w-4 h-4 mr-2" />
                                                Start VR Session
                                            </Button>
                                            <Button
                                                onClick={() => startXRSession(XRSessionMode.IMMERSIVE_AR)}
                                                disabled={!xrSupported || isXRActive}
                                                className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Start AR Session
                                            </Button>
                                            {isXRActive && (
                                                <Button
                                                    onClick={endXRSession}
                                                    variant="destructive"
                                                    className="flex-1"
                                                >
                                                    <Square className="w-4 h-4 mr-2" />
                                                    End Session
                                                </Button>
                                            )}
                                        </div>
                                        
                                        {/* Active Session Info */}
                                        {activeSession && (
                                            <div className="p-4 bg-blue-500/20 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-blue-400">Active Session</h4>
                                                    <Badge variant="default" className="bg-blue-500/20 text-blue-400">
                                                        {activeSession.mode === XRSessionMode.IMMERSIVE_VR ? 'VR' : 'AR'}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-400">Duration:</span>
                                                        <span className="ml-2 text-white">
                                                            {Math.floor((Date.now() - activeSession.startTime.getTime()) / 60000)}m
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">FPS:</span>
                                                        <span className="ml-2 text-white">{performanceMetrics.fps}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Latency:</span>
                                                        <span className="ml-2 text-white">{performanceMetrics.latency}ms</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* Main Content Tabs */}
                            <Card className="annotate-glass border-white/10">
                                <CardContent className="p-0">
                                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                                        <div className="border-b border-white/10">
                                            <TabsList className="grid w-full grid-cols-4 bg-transparent">
                                                <TabsTrigger value="projects">Projects</TabsTrigger>
                                                <TabsTrigger value="devices">Devices</TabsTrigger>
                                                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                                                <TabsTrigger value="performance">Performance</TabsTrigger>
                                            </TabsList>
                                        </div>
                                        
                                        <div className="p-6">
                                            <TabsContent value="projects" className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold text-white">XR Projects</h3>
                                                    <Button
                                                        onClick={createNewProject}
                                                        className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/30"
                                                    >
                                                        <Box className="w-4 h-4 mr-2" />
                                                        New Project
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {projects.map(renderProjectCard)}
                                                </div>
                                            </TabsContent>
                                            
                                            <TabsContent value="devices" className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold text-white">XR Devices</h3>
                                                    <Button
                                                        onClick={() => setShowDiagnostics(true)}
                                                        variant="outline"
                                                    >
                                                        <Wrench className="w-4 h-4 mr-2" />
                                                        Diagnostics
                                                    </Button>
                                                </div>
                                                <div className="space-y-3">
                                                    {devices.map(renderDeviceStatus)}
                                                </div>
                                            </TabsContent>
                                            
                                            <TabsContent value="sessions" className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold text-white">Session History</h3>
                                                    <Button variant="outline">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Export
                                                    </Button>
                                                </div>
                                                <div className="space-y-3">
                                                    {sessions.map(session => (
                                                        <div key={session.id} className="p-4 bg-black/20 rounded-lg">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-medium text-white">{session.name}</h4>
                                                                <Badge variant="outline">
                                                                    {session.mode === XRSessionMode.IMMERSIVE_VR ? 'VR' : 'AR'}
                                                                </Badge>
                                                            </div>
                                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                                                <div>
                                                                    <span className="text-gray-400">Duration:</span>
                                                                    <span className="ml-2 text-white">{Math.floor(session.duration / 60000)}m</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-400">Avg FPS:</span>
                                                                    <span className="ml-2 text-white">{session.performance.averageFPS}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-400">Latency:</span>
                                                                    <span className="ml-2 text-white">{session.performance.latency}ms</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-400">Date:</span>
                                                                    <span className="ml-2 text-white">{session.startTime.toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TabsContent>
                                            
                                            <TabsContent value="performance" className="space-y-4">
                                                <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="p-4 bg-black/20 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Activity className="w-4 h-4 text-blue-400" />
                                                            <span className="text-sm font-medium text-white">FPS</span>
                                                        </div>
                                                        <div className="text-2xl font-bold text-blue-400">{performanceMetrics.fps}</div>
                                                    </div>
                                                    <div className="p-4 bg-black/20 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Timer className="w-4 h-4 text-green-400" />
                                                            <span className="text-sm font-medium text-white">Latency</span>
                                                        </div>
                                                        <div className="text-2xl font-bold text-green-400">{performanceMetrics.latency}ms</div>
                                                    </div>
                                                    <div className="p-4 bg-black/20 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Zap className="w-4 h-4 text-yellow-400" />
                                                            <span className="text-sm font-medium text-white">Quality</span>
                                                        </div>
                                                        <div className="text-2xl font-bold text-yellow-400">{(performanceMetrics.trackingQuality * 100).toFixed(0)}%</div>
                                                    </div>
                                                    <div className="p-4 bg-black/20 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Thermometer className="w-4 h-4 text-red-400" />
                                                            <span className="text-sm font-medium text-white">Temperature</span>
                                                        </div>
                                                        <div className="text-2xl font-bold text-red-400">{performanceMetrics.temperature}°C</div>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </div>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>
                        
                        {/* Right Panel - XR Interface */}
                        <div className="space-y-6">
                            <XRAnnotationInterface
                                onModeChange={setXRMode}
                                onSessionStart={(session) => {
                                    // Handle session start
                                }}
                                onSessionEnd={() => {
                                    // Handle session end
                                }}
                                onAnnotationCreate={(annotation) => {
                                    // Handle annotation creation
                                }}
                                isVisible={true}
                                className="relative"
                            />
                        </div>
                    </div>
                </div>
                
                {/* Tutorial Dialog */}
                <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>XR Annotation Tutorial</DialogTitle>
                            <DialogDescription>
                                Learn how to use the XR annotation workspace effectively.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-500/20 rounded-lg">
                                <h4 className="font-medium text-blue-400 mb-2">Getting Started</h4>
                                <p className="text-sm text-white">
                                    1. Ensure your XR device is connected and calibrated<br/>
                                    2. Select or create an XR project<br/>
                                    3. Choose VR or AR mode based on your needs<br/>
                                    4. Start your XR session and begin annotating
                                </p>
                            </div>
                            <div className="p-4 bg-green-500/20 rounded-lg">
                                <h4 className="font-medium text-green-400 mb-2">Best Practices</h4>
                                <p className="text-sm text-white">
                                    • Take breaks every 30 minutes to avoid fatigue<br/>
                                    • Ensure good lighting for AR tracking<br/>
                                    • Keep your play area clear of obstacles<br/>
                                    • Use voice commands for efficiency
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setShowTutorial(false)}>
                                Got it
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
} 