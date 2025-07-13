"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PenTool, 
    Move, 
    RotateCw, 
    Zap, 
    Settings, 
    Plus, 
    Trash2, 
    Play, 
    Pause, 
    Square, 
    Target, 
    Activity, 
    Eye, 
    EyeOff, 
    Grid, 
    Ruler, 
    X,
    Layers,
    Sliders,
    Gauge,
    Circle,
    Spline,
    TrendingUp,
    Save,
    Upload,
    Download,
    Copy,
    Scissors,
    RefreshCw,
    ChevronDown,
    Sparkles,
    Palette,
    Maximize2,
    Minimize2
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../../../../../shared/components/ui/Card';
import { Button } from '../../../../../shared/components/ui/Button';
import { Badge } from '../../../../../shared/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../shared/components/ui/Tabs';
import { Slider } from '../../../../../shared/components/ui/Slider';
import { Switch } from '../../../../../shared/components/ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../shared/components/ui/Select';
import { Input } from '../../../../../shared/components/ui/Input';
import { Label } from '../../../../../shared/components/ui/Label';
import { Separator } from '../../../../../shared/components/ui/Separator';
import { ScrollArea } from '../../../../../shared/components/ui/ScrollArea';
import { Progress } from '../../../../../shared/components/ui/Progress';

interface SplineData {
    id: string;
    name: string;
    type: 'bezier' | 'catmull-rom' | 'linear' | 'hermite';
    points: Array<{x: number; y: number; z: number}>;
    visible: boolean;
    color: string;
    thickness: number;
    length: number;
    selected: boolean;
}

interface SplineEditingToolsProps {
    onSplineCreated?: (spline: SplineData) => void;
    onSplineModified?: (spline: SplineData) => void;
    onSplineDeleted?: (splineId: string) => void;
    onPointSelected?: (splineId: string, pointIndex: number) => void;
    onClose?: () => void;
    isVisible?: boolean;
    className?: string;
}

export function SplineEditingTools({
    onSplineCreated,
    onSplineModified,
    onSplineDeleted,
    onPointSelected,
    onClose,
    isVisible = true,
    className = ""
}: SplineEditingToolsProps) {
    const [splines, setSplines] = useState<SplineData[]>([
        {
            id: 'spline-1',
            name: 'Smooth Curve',
            type: 'catmull-rom',
            points: [
                { x: 0, y: 0, z: 0 },
                { x: 100, y: 50, z: 0 },
                { x: 200, y: -30, z: 0 },
                { x: 300, y: 80, z: 0 }
            ],
            visible: true,
            color: '#3B82F6',
            thickness: 2,
            length: 385.2,
            selected: false
        },
        {
            id: 'spline-2',
            name: 'Bezier Path',
            type: 'bezier',
            points: [
                { x: 50, y: 100, z: 0 },
                { x: 150, y: 100, z: 0 },
                { x: 250, y: 200, z: 0 },
                { x: 350, y: 200, z: 0 }
            ],
            visible: true,
            color: '#10B981',
            thickness: 3,
            length: 412.8,
            selected: true
        }
    ]);

    const [selectedSpline, setSelectedSpline] = useState<string>('spline-2');
    const [editMode, setEditMode] = useState<'select' | 'create' | 'edit' | 'animate'>('select');
    const [splineType, setSplineType] = useState<'bezier' | 'catmull-rom' | 'linear' | 'hermite'>('catmull-rom');
    const [tension, setTension] = useState([0.5]);
    const [showPoints, setShowPoints] = useState(true);
    const [showTangents, setShowTangents] = useState(false);
    const [snapToGrid, setSnapToGrid] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const selectedSplineData = splines.find(s => s.id === selectedSpline);

    const createSpline = useCallback(() => {
        const newSpline: SplineData = {
            id: `spline-${Date.now()}`,
            name: `Spline ${splines.length + 1}`,
            type: splineType,
            points: [
                { x: 50, y: 50, z: 0 },
                { x: 150, y: 100, z: 0 },
                { x: 250, y: 50, z: 0 }
            ],
            visible: true,
            color: '#8B5CF6',
            thickness: 2,
            length: 224.7,
            selected: false
        };

        setSplines(prev => [...prev, newSpline]);
        setSelectedSpline(newSpline.id);
        onSplineCreated?.(newSpline);
    }, [splines.length, splineType, onSplineCreated]);

    const deleteSpline = useCallback((id: string) => {
        setSplines(prev => prev.filter(s => s.id !== id));
        if (selectedSpline === id) {
            setSelectedSpline(splines[0]?.id || '');
        }
        onSplineDeleted?.(id);
    }, [selectedSpline, splines, onSplineDeleted]);

    const toggleSplineVisibility = useCallback((id: string) => {
        setSplines(prev => prev.map(s => 
            s.id === id ? { ...s, visible: !s.visible } : s
        ));
    }, []);

    const updateSplineColor = useCallback((id: string, color: string) => {
        setSplines(prev => prev.map(s => 
            s.id === id ? { ...s, color } : s
        ));
    }, []);

    const updateSplineThickness = useCallback((id: string, thickness: number) => {
        setSplines(prev => prev.map(s => 
            s.id === id ? { ...s, thickness } : s
        ));
    }, []);

    // Canvas drawing logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid if enabled
        if (snapToGrid) {
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
            ctx.lineWidth = 1;
            for (let x = 0; x <= canvas.width; x += 20) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y <= canvas.height; y += 20) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        }

        // Draw splines
        splines.forEach(spline => {
            if (!spline.visible) return;

            ctx.strokeStyle = spline.color;
            ctx.lineWidth = spline.thickness;
            ctx.beginPath();

            // Simple spline rendering
            if (spline.points.length >= 2) {
                ctx.moveTo(spline.points[0].x, spline.points[0].y);
                for (let i = 1; i < spline.points.length; i++) {
                    ctx.lineTo(spline.points[i].x, spline.points[i].y);
                }
            }
            ctx.stroke();

            // Draw points if enabled
            if (showPoints) {
                spline.points.forEach((point, index) => {
                    ctx.fillStyle = spline.selected ? '#FBBF24' : spline.color;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // Draw point index
                    ctx.fillStyle = 'white';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(index.toString(), point.x, point.y - 8);
                });
            }
        });
    }, [splines, showPoints, snapToGrid]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`relative ${className}`}
        >
            <Card className="bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-purple-800/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl shadow-purple-500/25">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-purple-500/20">
                    <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg shadow-lg">
                            <Spline className="h-5 w-5 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-purple-200 to-indigo-200 bg-clip-text text-transparent">
                            Spline Editor
                        </span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="h-8 w-8 p-0 text-purple-200 hover:text-white hover:bg-purple-500/20"
                        >
                            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                        </Button>
                        {onClose && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="h-8 w-8 p-0 text-purple-200 hover:text-white hover:bg-purple-500/20"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                
                <AnimatePresence>
                    {!isMinimized && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <CardContent className="space-y-6 p-6">
                                <Tabs defaultValue="editing" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-purple-800/50 to-indigo-800/50 border border-purple-500/30">
                                        <TabsTrigger 
                                            value="splines" 
                                            className="text-purple-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
                                        >
                                            Splines
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="editing" 
                                            className="text-purple-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
                                        >
                                            Editing
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="animation" 
                                            className="text-purple-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
                                        >
                                            Animation
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="splines" className="space-y-4 mt-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-purple-200">Spline Collection</span>
                                            <Button
                                                size="sm"
                                                onClick={createSpline}
                                                className="h-8 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create
                                            </Button>
                                        </div>

                                        <ScrollArea className="h-96">
                                            <div className="space-y-2">
                                                {splines.map((spline) => (
                                                    <motion.div
                                                        key={spline.id}
                                                        whileHover={{ scale: 1.02 }}
                                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                                                            selectedSpline === spline.id 
                                                                ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border-purple-400/50 shadow-lg' 
                                                                : 'bg-gradient-to-r from-purple-800/20 to-indigo-800/20 border-purple-500/20 hover:border-purple-400/40'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-4 h-4 rounded-full shadow-lg"
                                                                style={{ backgroundColor: spline.color }}
                                                            />
                                                            <div>
                                                                <span className="text-sm font-medium text-white">{spline.name}</span>
                                                                <Badge variant="outline" className="ml-2 text-xs text-purple-200 border-purple-400/30">
                                                                    {spline.type}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleSplineVisibility(spline.id)}
                                                                className="h-6 w-6 p-0 text-purple-200 hover:text-white hover:bg-purple-500/20"
                                                            >
                                                                {spline.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteSpline(spline.id)}
                                                                className="h-6 w-6 p-0 text-red-300 hover:text-red-200 hover:bg-red-500/20"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>

                                    <TabsContent value="editing" className="space-y-6 mt-6">
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant={editMode === 'select' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setEditMode('select')}
                                                className={editMode === 'select' 
                                                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg" 
                                                    : "border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                                                }
                                            >
                                                <Target className="h-4 w-4 mr-2" />
                                                Select
                                            </Button>
                                            <Button
                                                variant={editMode === 'create' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setEditMode('create')}
                                                className={editMode === 'create' 
                                                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg" 
                                                    : "border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                                                }
                                            >
                                                <PenTool className="h-4 w-4 mr-2" />
                                                Create
                                            </Button>
                                            <Button
                                                variant={editMode === 'edit' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setEditMode('edit')}
                                                className={editMode === 'edit' 
                                                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg" 
                                                    : "border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                                                }
                                            >
                                                <Move className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant={editMode === 'animate' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setEditMode('animate')}
                                                className={editMode === 'animate' 
                                                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg" 
                                                    : "border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                                                }
                                            >
                                                <Activity className="h-4 w-4 mr-2" />
                                                Animate
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-purple-200">Spline Type</Label>
                                                <div className="relative">
                                                    <Select value={splineType} onValueChange={(value: any) => setSplineType(value)}>
                                                        <SelectTrigger className="bg-gradient-to-r from-purple-800/30 to-indigo-800/30 border-purple-500/30 text-white hover:border-purple-400/50">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-500/30 z-[60]">
                                                            <SelectItem value="bezier" className="text-white hover:bg-purple-500/20">Bezier</SelectItem>
                                                            <SelectItem value="catmull-rom" className="text-white hover:bg-purple-500/20">Catmull-Rom</SelectItem>
                                                            <SelectItem value="linear" className="text-white hover:bg-purple-500/20">Linear</SelectItem>
                                                            <SelectItem value="hermite" className="text-white hover:bg-purple-500/20">Hermite</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium text-purple-200">Tension: {tension[0]}</Label>
                                                <div className="px-3">
                                                    <Slider
                                                        value={tension}
                                                        onValueChange={setTension}
                                                        max={1}
                                                        min={0}
                                                        step={0.1}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-800/20 to-indigo-800/20 rounded-lg border border-purple-500/20">
                                                    <Label className="text-sm font-medium text-purple-200">Show Points</Label>
                                                    <Switch 
                                                        checked={showPoints} 
                                                        onCheckedChange={setShowPoints}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-800/20 to-indigo-800/20 rounded-lg border border-purple-500/20">
                                                    <Label className="text-sm font-medium text-purple-200">Show Tangents</Label>
                                                    <Switch 
                                                        checked={showTangents} 
                                                        onCheckedChange={setShowTangents}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-800/20 to-indigo-800/20 rounded-lg border border-purple-500/20">
                                                    <Label className="text-sm font-medium text-purple-200">Snap to Grid</Label>
                                                    <Switch 
                                                        checked={snapToGrid} 
                                                        onCheckedChange={setSnapToGrid}
                                                    />
                                                </div>
                                            </div>

                                            {selectedSplineData && (
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-medium text-purple-200">Selected Spline</Label>
                                                    <div className="p-4 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-lg border border-purple-400/30">
                                                        <div className="text-sm font-medium text-white">{selectedSplineData.name}</div>
                                                        <div className="text-xs text-purple-200 mt-1">{selectedSplineData.points.length} points</div>
                                                        <div className="text-xs text-purple-200">Length: {selectedSplineData.length.toFixed(1)}px</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="animation" className="space-y-6 mt-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-purple-200">Animation Controls</span>
                                            <Button
                                                size="sm"
                                                onClick={() => setIsAnimating(!isAnimating)}
                                                className={isAnimating 
                                                    ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg"
                                                    : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                                                }
                                            >
                                                {isAnimating ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                                {isAnimating ? 'Pause' : 'Play'}
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium text-purple-200">Animation Speed</Label>
                                                <div className="px-3">
                                                    <Slider
                                                        value={[0.5]}
                                                        onValueChange={() => {}}
                                                        max={2}
                                                        min={0.1}
                                                        step={0.1}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-purple-200">Duration (seconds)</Label>
                                                <Input
                                                    type="number"
                                                    value="5"
                                                    className="bg-gradient-to-r from-purple-800/30 to-indigo-800/30 border-purple-500/30 text-white placeholder-purple-300"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-800/20 to-indigo-800/20 rounded-lg border border-purple-500/20">
                                                    <Label className="text-sm font-medium text-purple-200">Loop</Label>
                                                    <Switch checked={true} onCheckedChange={() => {}} />
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-800/20 to-indigo-800/20 rounded-lg border border-purple-500/20">
                                                    <Label className="text-sm font-medium text-purple-200">Show Path</Label>
                                                    <Switch checked={true} onCheckedChange={() => {}} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-purple-200">Progress</Label>
                                            <Progress value={33} className="w-full" />
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="space-y-4">
                                    <Label className="text-sm font-medium text-purple-200">Preview Canvas</Label>
                                    <div className="relative">
                                        <canvas
                                            ref={canvasRef}
                                            width={320}
                                            height={200}
                                            className="w-full bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border border-purple-500/30 rounded-lg shadow-inner"
                                        />
                                        <div className="absolute top-2 right-2 text-xs text-purple-300 bg-purple-900/50 px-2 py-1 rounded">
                                            Dev Mode
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between gap-3 pt-4 border-t border-purple-500/20">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 border-purple-500/30 text-purple-200 hover:bg-purple-500/20 hover:text-white"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 border-purple-500/30 text-purple-200 hover:bg-purple-500/20 hover:text-white"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </div>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    );
} 