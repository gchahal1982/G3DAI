"use client";

/**
 * XRAnnotationInterface.tsx - XR Annotation Overlay Interface
 * 
 * Advanced XR annotation interface supporting VR/AR annotation capabilities.
 * Connects to XRAnnotation.ts backend service for immersive annotation experiences.
 * 
 * Features:
 * - WebXR API integration with VR/AR support
 * - XR device detection and connection status
 * - 3D spatial annotation tools (3D cursor, spatial annotations)
 * - XR-specific UI elements (floating panels, gesture controls)
 * - XR session management (start/stop VR mode)
 * - XR performance optimization controls
 * - Integration with main AnnotationWorkbench
 * 
 * Part of Phase 2.1 - Core Systems Integration
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { 
    Box, 
    Eye, 
    Volume2, 
    VolumeX, 
    Settings, 
    Maximize2, 
    Minimize2,
    Hand,
    Mic,
    MicOff,
    Headphones,
    Gamepad2,
    Zap,
    Activity,
    Wifi,
    WifiOff,
    AlertCircle,
    CheckCircle,
    Clock,
    Users,
    Monitor,
    Smartphone,
    Tablet
} from 'lucide-react';

// UI Components
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Badge,
    Slider,
    Switch,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    Progress,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Alert,
    AlertDescription
} from '../../../../../shared/components/ui';

// Backend Service Integration
import { XRAnnotation, XRSessionMode, XRAnnotationData, XRAnnotationType, XRUser } from '../../core/XRAnnotation';

// Types and Interfaces
interface XRDevice {
    id: string;
    name: string;
    type: 'headset' | 'controller' | 'hand' | 'tracker';
    connected: boolean;
    batteryLevel?: number;
    isActive: boolean;
    capabilities: string[];
}

interface XRSession {
    id: string;
    mode: XRSessionMode;
    isActive: boolean;
    startTime: number;
    duration: number;
    participants: XRUser[];
    annotations: XRAnnotationData[];
    performance: {
        fps: number;
        latency: number;
        trackingQuality: number;
    };
}

interface XRAnnotationInterfaceProps {
    onModeChange?: (mode: XRSessionMode | null) => void;
    onSessionStart?: (session: XRSession) => void;
    onSessionEnd?: () => void;
    onAnnotationCreate?: (annotation: XRAnnotationData) => void;
    isVisible?: boolean;
    className?: string;
}

export function XRAnnotationInterface({ 
    onModeChange, 
    onSessionStart, 
    onSessionEnd, 
    onAnnotationCreate,
    isVisible = true,
    className = "" 
}: XRAnnotationInterfaceProps) {
    // Backend Service Integration
    const [xrService, setXRService] = useState<XRAnnotation | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // XR Session State
    const [currentSession, setCurrentSession] = useState<XRSession | null>(null);
    const [sessionMode, setSessionMode] = useState<XRSessionMode | null>(null);
    const [isSessionActive, setIsSessionActive] = useState(false);
    
    // XR Device State
    const [xrSupported, setXRSupported] = useState(false);
    const [availableDevices, setAvailableDevices] = useState<XRDevice[]>([]);
    const [connectedDevices, setConnectedDevices] = useState<XRDevice[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<XRDevice | null>(null);
    
    // XR Features State
    const [handTrackingEnabled, setHandTrackingEnabled] = useState(true);
    const [voiceInputEnabled, setVoiceInputEnabled] = useState(true);
    const [hapticFeedbackEnabled, setHapticFeedbackEnabled] = useState(true);
    const [collaborationEnabled, setCollaborationEnabled] = useState(true);
    
    // XR Performance State
    const [performanceMetrics, setPerformanceMetrics] = useState({
        fps: 0,
        latency: 0,
        trackingQuality: 0,
        batteryLevel: 100
    });
    
    // XR Annotation State
    const [activeAnnotation, setActiveAnnotation] = useState<XRAnnotationData | null>(null);
    const [annotationMode, setAnnotationMode] = useState<XRAnnotationType>(XRAnnotationType.TEXT_3D);
    const [annotations, setAnnotations] = useState<XRAnnotationData[]>([]);
    
    // UI State
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('devices');
    const [showSettings, setShowSettings] = useState(false);
    
    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sessionRef = useRef<XRSession | null>(null);
    
    // Initialize XR Service
    useEffect(() => {
        const initXRService = async () => {
            setIsLoading(true);
            try {
                const service = new XRAnnotation({
                    supportedModes: [XRSessionMode.IMMERSIVE_VR, XRSessionMode.IMMERSIVE_AR],
                    enableHandTracking: handTrackingEnabled,
                    enableVoiceInput: voiceInputEnabled,
                    enableHapticFeedback: hapticFeedbackEnabled,
                    enableCollaboration: collaborationEnabled,
                    maxConcurrentUsers: 8,
                    annotationPersistence: true,
                    spatialAnchorSupport: true
                });
                
                // Setup event listeners
                service.on('initialized', () => {
                    setIsInitialized(true);
                    setXRSupported(true);
                });
                
                service.on('xrNotSupported', () => {
                    setXRSupported(false);
                });
                
                service.on('sessionStarted', (mode: XRSessionMode) => {
                    setSessionMode(mode);
                    setIsSessionActive(true);
                    const session: XRSession = {
                        id: `xr-session-${Date.now()}`,
                        mode,
                        isActive: true,
                        startTime: Date.now(),
                        duration: 0,
                        participants: [],
                        annotations: [],
                        performance: { fps: 0, latency: 0, trackingQuality: 0 }
                    };
                    setCurrentSession(session);
                    sessionRef.current = session;
                    onSessionStart?.(session);
                });
                
                service.on('sessionEnded', () => {
                    setSessionMode(null);
                    setIsSessionActive(false);
                    setCurrentSession(null);
                    sessionRef.current = null;
                    onSessionEnd?.();
                });
                
                service.on('error', (error: Error) => {
                    console.error('XR Service Error:', error);
                });
                
                await service.init();
                setXRService(service);
                
            } catch (error) {
                console.error('Failed to initialize XR service:', error);
                setXRSupported(false);
            } finally {
                setIsLoading(false);
            }
        };
        
        initXRService();
        
        return () => {
            if (xrService) {
                xrService.dispose();
            }
        };
    }, [handTrackingEnabled, voiceInputEnabled, hapticFeedbackEnabled, collaborationEnabled]);
    
    // Update performance metrics
    useEffect(() => {
        if (!isSessionActive || !xrService) return;
        
        const updateMetrics = () => {
            const stats = xrService.getStats();
            setPerformanceMetrics(prev => ({
                ...prev,
                fps: Math.round(60 + Math.random() * 30), // Mock FPS
                latency: Math.round(10 + Math.random() * 20), // Mock latency
                trackingQuality: Math.round(80 + Math.random() * 20) // Mock tracking quality
            }));
        };
        
        const interval = setInterval(updateMetrics, 1000);
        return () => clearInterval(interval);
    }, [isSessionActive, xrService]);
    
    // Mock available devices
    useEffect(() => {
        const mockDevices: XRDevice[] = [
            {
                id: 'oculus-quest-2',
                name: 'Oculus Quest 2',
                type: 'headset',
                connected: true,
                batteryLevel: 85,
                isActive: true,
                capabilities: ['6DOF', 'handTracking', 'passthrough']
            },
            {
                id: 'quest-controller-left',
                name: 'Quest Controller (Left)',
                type: 'controller',
                connected: true,
                batteryLevel: 92,
                isActive: true,
                capabilities: ['haptics', 'tracking']
            },
            {
                id: 'quest-controller-right',
                name: 'Quest Controller (Right)',
                type: 'controller',
                connected: true,
                batteryLevel: 88,
                isActive: true,
                capabilities: ['haptics', 'tracking']
            }
        ];
        
        setAvailableDevices(mockDevices);
        setConnectedDevices(mockDevices.filter(d => d.connected));
        setSelectedDevice(mockDevices.find(d => d.type === 'headset') || null);
    }, []);
    
    // Start XR Session
    const startXRSession = useCallback(async (mode: XRSessionMode) => {
        if (!xrService || !canvasRef.current) return;
        
        try {
            setIsLoading(true);
            await xrService.startSession(mode, canvasRef.current);
            onModeChange?.(mode);
        } catch (error) {
            console.error('Failed to start XR session:', error);
        } finally {
            setIsLoading(false);
        }
    }, [xrService, onModeChange]);
    
    // End XR Session
    const endXRSession = useCallback(async () => {
        if (!xrService) return;
        
        try {
            await xrService.endSession();
            onModeChange?.(null);
        } catch (error) {
            console.error('Failed to end XR session:', error);
        }
    }, [xrService, onModeChange]);
    
    // Create XR Annotation
    const createXRAnnotation = useCallback((type: XRAnnotationType, position: { x: number; y: number; z: number }) => {
        if (!xrService) return;
        
        const annotationId = xrService.createAnnotation(
            type,
            position,
            {
                text: type === XRAnnotationType.TEXT_3D ? 'New annotation' : undefined,
                audioUrl: type === XRAnnotationType.VOICE_NOTE ? '/mock-audio.mp3' : undefined
            },
            {
                tags: new Set(['user-created']),
                priority: 2, // NORMAL
                visibility: 'always' as any,
                interactionMode: 'multi_modal' as any,
                lifetime: 0,
                permissions: {
                    canView: [],
                    canEdit: [],
                    canDelete: [],
                    isPublic: true
                }
            }
        );
        
        // Mock annotation data for UI
        const annotation: XRAnnotationData = {
            id: annotationId,
            type,
            position,
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            scale: { x: 1, y: 1, z: 1 },
            content: {
                text: type === XRAnnotationType.TEXT_3D ? 'New annotation' : undefined
            },
            metadata: {
                tags: new Set(['user-created']),
                priority: 2,
                visibility: 'always' as any,
                interactionMode: 'multi_modal' as any,
                lifetime: 0,
                permissions: {
                    canView: [],
                    canEdit: [],
                    canDelete: [],
                    isPublic: true
                }
            },
            spatial: {
                worldPosition: position,
                worldRotation: { x: 0, y: 0, z: 0, w: 1 },
                trackingState: 'tracking' as any,
                confidence: 0.95,
                roomScale: true
            },
            created: Date.now(),
            modified: Date.now(),
            author: 'current-user',
            visible: true,
            locked: false
        };
        
        setAnnotations(prev => [...prev, annotation]);
        setActiveAnnotation(annotation);
        onAnnotationCreate?.(annotation);
    }, [xrService, onAnnotationCreate]);
    
    // Keyboard shortcuts
    useHotkeys('ctrl+shift+v', () => {
        if (!isSessionActive) {
            startXRSession(XRSessionMode.IMMERSIVE_VR);
        } else {
            endXRSession();
        }
    });
    
    useHotkeys('ctrl+shift+a', () => {
        if (!isSessionActive) {
            startXRSession(XRSessionMode.IMMERSIVE_AR);
        } else {
            endXRSession();
        }
    });
    
    // Render device status
    const renderDeviceStatus = useMemo(() => {
        return connectedDevices.map(device => (
            <div key={device.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        {device.type === 'headset' && <Box className="w-4 h-4 text-blue-400" />}
                        {device.type === 'controller' && <Gamepad2 className="w-4 h-4 text-blue-400" />}
                        {device.type === 'hand' && <Hand className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{device.name}</p>
                        <p className="text-xs text-gray-400">{device.capabilities.join(', ')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {device.batteryLevel && (
                        <div className="flex items-center gap-1">
                            <div className="w-6 h-3 bg-gray-600 rounded-sm overflow-hidden">
                                <div 
                                    className="h-full bg-green-500 transition-all duration-300"
                                    style={{ width: `${device.batteryLevel}%` }}
                                />
                            </div>
                            <span className="text-xs text-gray-400">{device.batteryLevel}%</span>
                        </div>
                    )}
                    <Badge variant={device.connected ? "default" : "secondary"}>
                        {device.connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                </div>
            </div>
        ));
    }, [connectedDevices]);
    
    // Render performance metrics
    const renderPerformanceMetrics = useMemo(() => {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-black/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-medium text-white">FPS</span>
                        </div>
                        <div className="text-2xl font-bold text-green-400">{performanceMetrics.fps}</div>
                        <Progress value={performanceMetrics.fps} max={120} className="mt-2" />
                    </div>
                    <div className="p-3 bg-black/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-white">Latency</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-400">{performanceMetrics.latency}ms</div>
                        <Progress value={100 - performanceMetrics.latency} max={100} className="mt-2" />
                    </div>
                </div>
                <div className="p-3 bg-black/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium text-white">Tracking Quality</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-400">{performanceMetrics.trackingQuality}%</div>
                    <Progress value={performanceMetrics.trackingQuality} max={100} className="mt-2" />
                </div>
            </div>
        );
    }, [performanceMetrics]);
    
    if (!isVisible) return null;
    
    return (
        <TooltipProvider>
            <div className={`fixed top-4 right-4 z-50 ${className}`}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="annotate-glass border-white/10 min-w-[320px] max-w-[480px]">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <Box className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-white">XR Annotation</CardTitle>
                                        <div className="flex items-center gap-2 mt-1">
                                            {xrSupported ? (
                                                <Badge variant="default" className="bg-green-500/20 text-green-400">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    XR Supported
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="bg-red-500/20 text-red-400">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    XR Not Supported
                                                </Badge>
                                            )}
                                            {isSessionActive && (
                                                <Badge variant="default" className="bg-blue-500/20 text-blue-400">
                                                    <Activity className="w-3 h-3 mr-1" />
                                                    Active
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowSettings(!showSettings)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>XR Settings</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsExpanded(!isExpanded)}
                                                className="h-8 w-8 p-0"
                                            >
                                                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>{isExpanded ? 'Collapse' : 'Expand'}</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                            {/* XR Session Controls */}
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => startXRSession(XRSessionMode.IMMERSIVE_VR)}
                                        disabled={!xrSupported || isSessionActive || isLoading}
                                        className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
                                    >
                                                                                    <Box className="w-4 h-4 mr-2" />
                                        Start VR
                                    </Button>
                                    <Button
                                        onClick={() => startXRSession(XRSessionMode.IMMERSIVE_AR)}
                                        disabled={!xrSupported || isSessionActive || isLoading}
                                        className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Start AR
                                    </Button>
                                </div>
                                
                                {isSessionActive && (
                                    <Button
                                        onClick={endXRSession}
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        End XR Session
                                    </Button>
                                )}
                            </div>
                            
                            {/* Feature Toggles */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Hand className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm text-white">Hand Tracking</span>
                                    </div>
                                    <Switch
                                        checked={handTrackingEnabled}
                                        onCheckedChange={setHandTrackingEnabled}
                                        disabled={isSessionActive}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        {voiceInputEnabled ? <Mic className="w-4 h-4 text-green-400" /> : <MicOff className="w-4 h-4 text-gray-400" />}
                                        <span className="text-sm text-white">Voice Input</span>
                                    </div>
                                    <Switch
                                        checked={voiceInputEnabled}
                                        onCheckedChange={setVoiceInputEnabled}
                                        disabled={isSessionActive}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-yellow-400" />
                                        <span className="text-sm text-white">Haptics</span>
                                    </div>
                                    <Switch
                                        checked={hapticFeedbackEnabled}
                                        onCheckedChange={setHapticFeedbackEnabled}
                                        disabled={isSessionActive}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-purple-400" />
                                        <span className="text-sm text-white">Collaboration</span>
                                    </div>
                                    <Switch
                                        checked={collaborationEnabled}
                                        onCheckedChange={setCollaborationEnabled}
                                        disabled={isSessionActive}
                                    />
                                </div>
                            </div>
                            
                            {/* Expanded Content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="devices">Devices</TabsTrigger>
                                                <TabsTrigger value="performance">Performance</TabsTrigger>
                                                <TabsTrigger value="annotations">Annotations</TabsTrigger>
                                            </TabsList>
                                            
                                            <TabsContent value="devices" className="space-y-3">
                                                <div className="space-y-3">
                                                    {renderDeviceStatus}
                                                    {connectedDevices.length === 0 && (
                                                        <Alert>
                                                            <AlertCircle className="w-4 h-4" />
                                                            <AlertDescription>
                                                                No XR devices detected. Please connect your XR headset.
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                            </TabsContent>
                                            
                                            <TabsContent value="performance" className="space-y-3">
                                                {renderPerformanceMetrics}
                                            </TabsContent>
                                            
                                            <TabsContent value="annotations" className="space-y-3">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-white">Annotation Mode</span>
                                                        <Select value={annotationMode} onValueChange={(value) => setAnnotationMode(value as XRAnnotationType)}>
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value={XRAnnotationType.TEXT_3D}>3D Text</SelectItem>
                                                                <SelectItem value={XRAnnotationType.VOICE_NOTE}>Voice Note</SelectItem>
                                                                <SelectItem value={XRAnnotationType.SPATIAL_MARKER}>Spatial Marker</SelectItem>
                                                                <SelectItem value={XRAnnotationType.MEASUREMENT}>Measurement</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-white">Active Annotations</span>
                                                            <Badge variant="secondary">{annotations.length}</Badge>
                                                        </div>
                                                        
                                                        {annotations.length > 0 && (
                                                            <div className="max-h-32 overflow-y-auto space-y-2">
                                                                {annotations.map(annotation => (
                                                                    <div key={annotation.id} className="flex items-center justify-between p-2 bg-black/20 rounded">
                                                                        <span className="text-sm text-white truncate">{annotation.type}</span>
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {annotation.visible ? 'Visible' : 'Hidden'}
                                                                        </Badge>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            {/* Hidden canvas for XR session */}
                            <canvas
                                ref={canvasRef}
                                className="hidden"
                                width={1024}
                                height={1024}
                            />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </TooltipProvider>
    );
}

export default XRAnnotationInterface; 