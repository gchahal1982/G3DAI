"use client";

/**
 * SplineEditingTools.tsx - Advanced Spline Editing Interface
 * 
 * Advanced spline editing interface for geometric modeling and annotation paths.
 * Connects to SplineSystem.ts backend service for comprehensive spline operations.
 * 
 * Features:
 * - Bezier curve editing tools
 * - Spline point manipulation controls
 * - Curve smoothing and optimization
 * - Spline-based annotation paths
 * - Spline animation controls
 * - Spline measurement tools
 * - Spline export/import functionality
 * - Spline fitting algorithms interface
 * 
 * Part of Phase 2.1 - Core Systems Integration
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { 
    Spline, 
    TrendingUp,
    Route,
    Play,
    Pause,
    Square,
    SkipForward,
    SkipBack,
    Repeat,
    Settings,
    Plus,
    Minus,
    Move,
    RotateCw,
    Maximize2,
    Minimize2,
    Eye,
    EyeOff,
    Target,
    Crosshair,
    Circle,
    Square as SquareIcon,
    Triangle,
    Hexagon,
    Waves,
    Activity,
    BarChart3,
    Zap,
    RefreshCw,
    Save,
    Upload,
    Download,
    Copy,
    Trash2,
    Edit3,
    MousePointer,
    Hand,
    Grab,
    Move3D,
    RotateCcw,
    FlipHorizontal,
    FlipVertical,
    Layers,
    Grid,
    Ruler,
    Compass,
    Scissors,
    Link,
    Unlink,
    Anchor,
    Navigation,
    MapPin,
    Waypoints,
    Split,
    Merge,
    Shuffle,
    CornerUpLeft,
    CornerUpRight,
    CornerDownLeft,
    CornerDownRight,
    ArrowUpDown,
    ArrowLeftRight,
    Maximize,
    Minimize,
    ZoomIn,
    ZoomOut,
    PenTool,
    Paintbrush,
    Eraser,
    Pipette,
    Gauge,
    Timer,
    Clock,
    FastForward,
    Rewind,
    Volume2,
    VolumeX,
    Sliders,
    ToggleLeft,
    ToggleRight,
    Power,
    PowerOff
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
    AlertDescription,
    Input,
    Label,
    Separator,
    ScrollArea,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../../../shared/components/ui';

// Backend Service Integration
import { SplineSystem, SplineConfig, Vector3, SplinePoint, PathConfig } from '../../core/SplineSystem';

// Types and Interfaces
interface SplineData {
    id: string;
    name: string;
    type: SplineConfig['type'];
    points: Vector3[];
    config: SplineConfig;
    visible: boolean;
    selected: boolean;
    color: string;
    thickness: number;
    created: Date;
    modified: Date;
    length: number;
    animated: boolean;
    pathId?: string;
}

interface SplineEditingState {
    mode: 'select' | 'create' | 'edit' | 'animate' | 'measure';
    selectedSpline: string | null;
    selectedPoints: number[];
    dragState: {
        isDragging: boolean;
        splineId: string | null;
        pointIndex: number | null;
        startPos: Vector3 | null;
    };
    clipboard: SplineData | null;
    history: SplineData[];
    historyIndex: number;
}

interface SplineEditingToolsProps {
    onSplineCreated?: (spline: SplineData) => void;
    onSplineModified?: (spline: SplineData) => void;
    onSplineDeleted?: (splineId: string) => void;
    onPointSelected?: (splineId: string, pointIndex: number) => void;
    isVisible?: boolean;
    className?: string;
}

export function SplineEditingTools({
    onSplineCreated,
    onSplineModified,
    onSplineDeleted,
    onPointSelected,
    isVisible = true,
    className = ""
}: SplineEditingToolsProps) {
    // Backend Service Integration
    const [splineSystem, setSplineSystem] = useState<SplineSystem | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Spline Data State
    const [splines, setSplines] = useState<SplineData[]>([]);
    const [splineCounter, setSplineCounter] = useState(0);
    const [totalSplines, setTotalSplines] = useState(0);
    
    // Editing State
    const [editingState, setEditingState] = useState<SplineEditingState>({
        mode: 'select',
        selectedSpline: null,
        selectedPoints: [],
        dragState: {
            isDragging: false,
            splineId: null,
            pointIndex: null,
            startPos: null
        },
        clipboard: null,
        history: [],
        historyIndex: -1
    });
    
    // Tool Settings
    const [toolSettings, setToolSettings] = useState({
        splineType: 'catmull-rom' as SplineConfig['type'],
        tension: 0.5,
        bias: 0.0,
        continuity: 0.0,
        degree: 3,
        closed: false,
        adaptive: true,
        resolution: 100,
        showPoints: true,
        showTangents: false,
        showNormals: false,
        showCurvature: false,
        snapToGrid: true,
        gridSize: 10,
        autoSmooth: true,
        realTimeUpdate: true
    });
    
    // Animation Settings
    const [animationSettings, setAnimationSettings] = useState({
        isPlaying: false,
        speed: 1.0,
        duration: 5.0,
        loop: true,
        pingPong: false,
        easing: 'linear' as 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out',
        currentTime: 0,
        showPath: true,
        showMarker: true,
        markerSize: 8
    });
    
    // Measurement State
    const [measurements, setMeasurements] = useState({
        totalLength: 0,
        segmentLengths: [] as number[],
        curvaturePoints: [] as { position: Vector3; curvature: number }[],
        tangentPoints: [] as { position: Vector3; tangent: Vector3 }[],
        area: 0,
        perimeter: 0
    });
    
    // UI State
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('splines');
    const [showProperties, setShowProperties] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const [showMeasurements, setShowMeasurements] = useState(false);
    
    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>();
    
    // Initialize Spline System
    useEffect(() => {
        const initSplineSystem = async () => {
            setIsLoading(true);
            try {
                const system = new SplineSystem();
                
                // Setup event listeners
                system.on('splineCreated', (event: any) => {
                    console.log('Spline created:', event);
                });
                
                system.on('splineModified', (event: any) => {
                    console.log('Spline modified:', event);
                    updateSplineData(event.id);
                });
                
                system.on('splineRemoved', (event: any) => {
                    console.log('Spline removed:', event);
                    setSplines(prev => prev.filter(s => s.id !== event.id));
                });
                
                system.on('pathUpdate', (event: any) => {
                    // Handle path animation updates
                    if (animationSettings.isPlaying) {
                        updateAnimationMarker(event.pathId, event.point);
                    }
                });
                
                setSplineSystem(system);
                setIsInitialized(true);
                
                // Initialize with sample splines
                initializeSampleSplines(system);
                
            } catch (error) {
                console.error('Failed to initialize spline system:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        initSplineSystem();
        
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);
    
    // Initialize sample splines
    const initializeSampleSplines = useCallback((system: SplineSystem) => {
        const sampleSplines: Partial<SplineData>[] = [
            {
                name: 'Smooth Curve',
                type: 'catmull-rom',
                points: [
                    { x: 0, y: 0, z: 0 },
                    { x: 100, y: 50, z: 0 },
                    { x: 200, y: -30, z: 0 },
                    { x: 300, y: 80, z: 0 },
                    { x: 400, y: 20, z: 0 }
                ],
                color: '#3B82F6',
                thickness: 2
            },
            {
                name: 'Bezier Path',
                type: 'bezier',
                points: [
                    { x: 50, y: 100, z: 0 },
                    { x: 150, y: 100, z: 0 },
                    { x: 250, y: 200, z: 0 },
                    { x: 350, y: 200, z: 0 }
                ],
                color: '#10B981',
                thickness: 3
            },
            {
                name: 'Linear Path',
                type: 'linear',
                points: [
                    { x: 0, y: 150, z: 0 },
                    { x: 100, y: 120, z: 0 },
                    { x: 200, y: 180, z: 0 },
                    { x: 300, y: 140, z: 0 }
                ],
                color: '#F59E0B',
                thickness: 2
            }
        ];
        
        const createdSplines: SplineData[] = [];
        
        sampleSplines.forEach((splineData, index) => {
            const splineId = `spline-${index}`;
            const config: SplineConfig = {
                type: splineData.type!,
                tension: 0.5,
                bias: 0.0,
                continuity: 0.0,
                degree: 3,
                closed: false,
                adaptive: true,
                resolution: 100
            };
            
            system.createSpline(splineId, splineData.points!, config);
            
            const fullSplineData: SplineData = {
                id: splineId,
                name: splineData.name!,
                type: splineData.type!,
                points: splineData.points!,
                config,
                visible: true,
                selected: false,
                color: splineData.color!,
                thickness: splineData.thickness!,
                created: new Date(),
                modified: new Date(),
                length: 0,
                animated: false
            };
            
            createdSplines.push(fullSplineData);
        });
        
        setSplines(createdSplines);
        setTotalSplines(createdSplines.length);
        setSplineCounter(createdSplines.length);
    }, []);
    
    // Update spline data
    const updateSplineData = useCallback((splineId: string) => {
        if (!splineSystem) return;
        
        const spline = splineSystem.getSpline(splineId);
        if (!spline) return;
        
        setSplines(prev => prev.map(s => {
            if (s.id === splineId) {
                return {
                    ...s,
                    points: spline.getPoints(),
                    length: spline.getLength(),
                    modified: new Date()
                };
            }
            return s;
        }));
    }, [splineSystem]);
    
    // Create new spline
    const createSpline = useCallback(() => {
        if (!splineSystem) return;
        
        const splineId = `spline-${splineCounter}`;
        const points: Vector3[] = [
            { x: 50, y: 50, z: 0 },
            { x: 150, y: 100, z: 0 },
            { x: 250, y: 50, z: 0 }
        ];
        
        const config: SplineConfig = {
            type: toolSettings.splineType,
            tension: toolSettings.tension,
            bias: toolSettings.bias,
            continuity: toolSettings.continuity,
            degree: toolSettings.degree,
            closed: toolSettings.closed,
            adaptive: toolSettings.adaptive,
            resolution: toolSettings.resolution
        };
        
        splineSystem.createSpline(splineId, points, config);
        
        const newSpline: SplineData = {
            id: splineId,
            name: `Spline ${splineCounter + 1}`,
            type: toolSettings.splineType,
            points,
            config,
            visible: true,
            selected: true,
            color: '#3B82F6',
            thickness: 2,
            created: new Date(),
            modified: new Date(),
            length: 0,
            animated: false
        };
        
        setSplines(prev => [...prev, newSpline]);
        setSplineCounter(prev => prev + 1);
        setTotalSplines(prev => prev + 1);
        
        // Select the new spline
        setEditingState(prev => ({
            ...prev,
            selectedSpline: splineId,
            selectedPoints: []
        }));
        
        onSplineCreated?.(newSpline);
    }, [splineSystem, splineCounter, toolSettings, onSplineCreated]);
    
    // Delete spline
    const deleteSpline = useCallback((splineId: string) => {
        if (!splineSystem) return;
        
        splineSystem.removeSpline(splineId);
        setSplines(prev => prev.filter(s => s.id !== splineId));
        
        if (editingState.selectedSpline === splineId) {
            setEditingState(prev => ({
                ...prev,
                selectedSpline: null,
                selectedPoints: []
            }));
        }
        
        onSplineDeleted?.(splineId);
    }, [splineSystem, editingState.selectedSpline, onSplineDeleted]);
    
    // Add point to spline
    const addPointToSpline = useCallback((splineId: string, point: Vector3, index?: number) => {
        if (!splineSystem) return;
        
        splineSystem.addSplinePoint(splineId, point, index);
        updateSplineData(splineId);
    }, [splineSystem, updateSplineData]);
    
    // Remove point from spline
    const removePointFromSpline = useCallback((splineId: string, pointIndex: number) => {
        if (!splineSystem) return;
        
        splineSystem.removeSplinePoint(splineId, pointIndex);
        updateSplineData(splineId);
    }, [splineSystem, updateSplineData]);
    
    // Update point position
    const updatePointPosition = useCallback((splineId: string, pointIndex: number, newPosition: Vector3) => {
        if (!splineSystem) return;
        
        splineSystem.updateSplinePoint(splineId, pointIndex, newPosition);
        updateSplineData(splineId);
    }, [splineSystem, updateSplineData]);
    
    // Start animation
    const startAnimation = useCallback(() => {
        if (!splineSystem || !editingState.selectedSpline) return;
        
        const pathId = `path-${editingState.selectedSpline}`;
        const pathConfig: PathConfig = {
            speed: animationSettings.speed,
            loop: animationSettings.loop,
            reverse: animationSettings.pingPong,
            easing: animationSettings.easing
        };
        
        splineSystem.createPath(pathId, editingState.selectedSpline, pathConfig);
        // Start the path using the path object
        const path = splineSystem.getPath(pathId);
        if (path) {
            path.play();
        }
        
        setAnimationSettings(prev => ({ ...prev, isPlaying: true }));
        
        // Update spline data
        setSplines(prev => prev.map(s => 
            s.id === editingState.selectedSpline 
                ? { ...s, animated: true, pathId }
                : s
        ));
    }, [splineSystem, editingState.selectedSpline, animationSettings]);
    
    // Stop animation
    const stopAnimation = useCallback(() => {
        if (!splineSystem || !editingState.selectedSpline) return;
        
        const spline = splines.find(s => s.id === editingState.selectedSpline);
        if (spline?.pathId) {
            const path = splineSystem.getPath(spline.pathId);
            if (path) {
                path.stop();
            }
        }
        
        setAnimationSettings(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
        
        // Update spline data
        setSplines(prev => prev.map(s => 
            s.id === editingState.selectedSpline 
                ? { ...s, animated: false, pathId: undefined }
                : s
        ));
    }, [splineSystem, editingState.selectedSpline, splines]);
    
    // Update animation marker
    const updateAnimationMarker = useCallback((pathId: string, point: SplinePoint) => {
        // Update animation marker position
        setAnimationSettings(prev => ({
            ...prev,
            currentTime: point.parameter * prev.duration
        }));
    }, []);
    
    // Calculate measurements
    const calculateMeasurements = useCallback(() => {
        if (!splineSystem || !editingState.selectedSpline) return;
        
        const spline = splineSystem.getSpline(editingState.selectedSpline);
        if (!spline) return;
        
        const totalLength = spline.getLength();
        const subdivisions = spline.subdivide(100);
        
        const segmentLengths: number[] = [];
        for (let i = 0; i < subdivisions.length - 1; i++) {
            const segmentLength = Math.sqrt(
                Math.pow(subdivisions[i + 1].x - subdivisions[i].x, 2) +
                Math.pow(subdivisions[i + 1].y - subdivisions[i].y, 2) +
                Math.pow(subdivisions[i + 1].z - subdivisions[i].z, 2)
            );
            segmentLengths.push(segmentLength);
        }
        
        setMeasurements({
            totalLength,
            segmentLengths,
            curvaturePoints: [],
            tangentPoints: [],
            area: 0,
            perimeter: totalLength
        });
    }, [splineSystem, editingState.selectedSpline]);
    
    // Keyboard shortcuts
    useHotkeys('ctrl+n', (e) => {
        e.preventDefault();
        createSpline();
    });
    
    useHotkeys('delete', () => {
        if (editingState.selectedSpline) {
            deleteSpline(editingState.selectedSpline);
        }
    });
    
    useHotkeys('space', (e) => {
        e.preventDefault();
        if (animationSettings.isPlaying) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });
    
    useHotkeys('escape', () => {
        setEditingState(prev => ({
            ...prev,
            selectedSpline: null,
            selectedPoints: []
        }));
    });
    
    // Render spline list
    const renderSplineList = useMemo(() => {
        return (
            <ScrollArea className="h-48">
                <div className="space-y-2">
                    {splines.map(spline => (
                        <div
                            key={spline.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                editingState.selectedSpline === spline.id 
                                    ? 'bg-blue-500/20 border-blue-500/30' 
                                    : 'bg-black/20 border-white/10 hover:bg-black/30'
                            }`}
                            onClick={() => setEditingState(prev => ({ ...prev, selectedSpline: spline.id }))}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-4 h-4 rounded border"
                                            style={{ backgroundColor: spline.color }}
                                        />
                                        <Switch
                                            checked={spline.visible}
                                            onCheckedChange={(checked) => {
                                                setSplines(prev => prev.map(s => 
                                                    s.id === spline.id ? { ...s, visible: checked } : s
                                                ));
                                            }}
                                            className="scale-75"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{spline.name}</p>
                                        <p className="text-xs text-gray-400">{spline.type} • {spline.points.length} points</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {spline.animated && (
                                        <Badge variant="default" className="bg-green-500/20 text-green-400">
                                            <Activity className="w-3 h-3 mr-1" />
                                            Animated
                                        </Badge>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSpline(spline.id);
                                        }}
                                        className="h-6 w-6 p-0"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        );
    }, [splines, editingState.selectedSpline, deleteSpline]);
    
    // Render tools
    const renderTools = useMemo(() => {
        return (
            <div className="grid grid-cols-4 gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={editingState.mode === 'select' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setEditingState(prev => ({ ...prev, mode: 'select' }))}
                        >
                            <MousePointer className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Select Tool</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={editingState.mode === 'create' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setEditingState(prev => ({ ...prev, mode: 'create' }))}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create Spline</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={editingState.mode === 'edit' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setEditingState(prev => ({ ...prev, mode: 'edit' }))}
                        >
                            <Edit3 className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Points</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={editingState.mode === 'measure' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setEditingState(prev => ({ ...prev, mode: 'measure' }))}
                        >
                            <Ruler className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Measure</TooltipContent>
                </Tooltip>
            </div>
        );
    }, [editingState.mode]);
    
    // Render animation controls
    const renderAnimationControls = useMemo(() => {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant={animationSettings.isPlaying ? 'default' : 'outline'}
                        size="sm"
                        onClick={animationSettings.isPlaying ? stopAnimation : startAnimation}
                        disabled={!editingState.selectedSpline}
                    >
                        {animationSettings.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={stopAnimation}
                        disabled={!animationSettings.isPlaying}
                    >
                        <Square className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAnimationSettings(prev => ({ ...prev, loop: !prev.loop }))}
                    >
                        <Repeat className={`w-4 h-4 ${animationSettings.loop ? 'text-blue-400' : ''}`} />
                    </Button>
                </div>
                
                <div className="space-y-2">
                    <Label className="text-sm text-white">Speed</Label>
                    <Slider
                        value={[animationSettings.speed]}
                        onValueChange={([value]) => setAnimationSettings(prev => ({ ...prev, speed: value }))}
                        min={0.1}
                        max={5}
                        step={0.1}
                        className="w-full"
                    />
                    <div className="text-xs text-gray-400">{animationSettings.speed.toFixed(1)}x</div>
                </div>
                
                <div className="space-y-2">
                    <Label className="text-sm text-white">Duration</Label>
                    <Slider
                        value={[animationSettings.duration]}
                        onValueChange={([value]) => setAnimationSettings(prev => ({ ...prev, duration: value }))}
                        min={1}
                        max={30}
                        step={1}
                        className="w-full"
                    />
                    <div className="text-xs text-gray-400">{animationSettings.duration}s</div>
                </div>
            </div>
        );
    }, [animationSettings, editingState.selectedSpline, startAnimation, stopAnimation]);
    
    if (!isVisible) return null;
    
    return (
        <TooltipProvider>
            <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="annotate-glass border-white/10 min-w-[380px] max-w-[480px]">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                                        <Spline className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-white">Spline Editor</CardTitle>
                                        <div className="flex items-center gap-2 mt-1">
                                            {isInitialized ? (
                                                <Badge variant="default" className="bg-green-500/20 text-green-400">
                                                    <Activity className="w-3 h-3 mr-1" />
                                                    Ready
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">
                                                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                                    Loading
                                                </Badge>
                                            )}
                                            <Badge variant="outline" className="text-xs">
                                                {totalSplines} splines
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowProperties(!showProperties)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Properties</TooltipContent>
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
                            {/* Tool Selection */}
                            <div className="space-y-2">
                                <Label className="text-sm text-white">Tools</Label>
                                {renderTools}
                            </div>
                            
                            {/* Spline Type Selection */}
                            <div className="space-y-2">
                                <Label className="text-sm text-white">Spline Type</Label>
                                <Select
                                    value={toolSettings.splineType}
                                    onValueChange={(value) => setToolSettings(prev => ({ ...prev, splineType: value as SplineConfig['type'] }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="linear">Linear</SelectItem>
                                        <SelectItem value="catmull-rom">Catmull-Rom</SelectItem>
                                        <SelectItem value="bezier">Bezier</SelectItem>
                                        <SelectItem value="b-spline">B-Spline</SelectItem>
                                        <SelectItem value="nurbs">NURBS</SelectItem>
                                        <SelectItem value="hermite">Hermite</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    onClick={createSpline}
                                    disabled={!isInitialized}
                                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/30"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Spline
                                </Button>
                                <Button
                                    onClick={calculateMeasurements}
                                    disabled={!editingState.selectedSpline}
                                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/30"
                                >
                                    <Ruler className="w-4 h-4 mr-2" />
                                    Measure
                                </Button>
                            </div>
                            
                            {/* Current Spline Info */}
                            {editingState.selectedSpline && (
                                <div className="p-3 bg-black/20 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-white">Selected Spline</h4>
                                        <Badge variant="outline">{editingState.selectedSpline}</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-400">Type:</span>
                                            <span className="ml-2 text-white">{splines.find(s => s.id === editingState.selectedSpline)?.type}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Points:</span>
                                            <span className="ml-2 text-white">{splines.find(s => s.id === editingState.selectedSpline)?.points.length}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
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
                                                <TabsTrigger value="splines">Splines</TabsTrigger>
                                                <TabsTrigger value="animation">Animation</TabsTrigger>
                                                <TabsTrigger value="settings">Settings</TabsTrigger>
                                            </TabsList>
                                            
                                            <TabsContent value="splines" className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-white">Splines ({splines.length})</span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={createSpline}
                                                        disabled={!isInitialized}
                                                        className="h-8"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add
                                                    </Button>
                                                </div>
                                                {renderSplineList}
                                            </TabsContent>
                                            
                                            <TabsContent value="animation" className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-white">Animation Controls</span>
                                                    <Badge variant={animationSettings.isPlaying ? 'default' : 'outline'}>
                                                        {animationSettings.isPlaying ? 'Playing' : 'Stopped'}
                                                    </Badge>
                                                </div>
                                                {renderAnimationControls}
                                            </TabsContent>
                                            
                                            <TabsContent value="settings" className="space-y-3">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-white">Tension</Label>
                                                        <Slider
                                                            value={[toolSettings.tension]}
                                                            onValueChange={([value]) => setToolSettings(prev => ({ ...prev, tension: value }))}
                                                            min={0}
                                                            max={1}
                                                            step={0.1}
                                                            className="w-full"
                                                        />
                                                        <div className="text-xs text-gray-400">{toolSettings.tension.toFixed(1)}</div>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-white">Resolution</Label>
                                                        <Slider
                                                            value={[toolSettings.resolution]}
                                                            onValueChange={([value]) => setToolSettings(prev => ({ ...prev, resolution: value }))}
                                                            min={10}
                                                            max={500}
                                                            step={10}
                                                            className="w-full"
                                                        />
                                                        <div className="text-xs text-gray-400">{toolSettings.resolution} points</div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-white">Closed</span>
                                                            <Switch 
                                                                checked={toolSettings.closed}
                                                                onCheckedChange={(checked) => setToolSettings(prev => ({ ...prev, closed: checked }))}
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-white">Adaptive</span>
                                                            <Switch 
                                                                checked={toolSettings.adaptive}
                                                                onCheckedChange={(checked) => setToolSettings(prev => ({ ...prev, adaptive: checked }))}
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-white">Show Points</span>
                                                            <Switch 
                                                                checked={toolSettings.showPoints}
                                                                onCheckedChange={(checked) => setToolSettings(prev => ({ ...prev, showPoints: checked }))}
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-white">Show Tangents</span>
                                                            <Switch 
                                                                checked={toolSettings.showTangents}
                                                                onCheckedChange={(checked) => setToolSettings(prev => ({ ...prev, showTangents: checked }))}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            {/* Hidden canvas for spline visualization */}
                            <canvas
                                ref={canvasRef}
                                className="hidden"
                                width={400}
                                height={300}
                            />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </TooltipProvider>
    );
}

export default SplineEditingTools; 