"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, 
    Brain, 
    Target, 
    Zap, 
    Eye, 
    Wand2, 
    Lightbulb, 
    CheckCircle, 
    X, 
    Play, 
    Pause, 
    RotateCcw, 
    Settings, 
    TrendingUp, 
    Activity, 
    Clock, 
    AlertCircle,
    Maximize2,
    Minimize2,
    Bot,
    Cpu,
    Gauge,
    Star,
    Award 
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../../../../../shared/components/ui/Card';
import { Button } from '../../../../../shared/components/ui/Button';
import { Badge } from '../../../../../shared/components/ui/Badge';
import { Progress } from '../../../../../shared/components/ui/Progress';
import { Slider } from '../../../../../shared/components/ui/Slider';
import { Switch } from '../../../../../shared/components/ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../shared/components/ui/Select';
import { Label } from '../../../../../shared/components/ui/Label';
import { Separator } from '../../../../../shared/components/ui/Separator';
import { ScrollArea } from '../../../../../shared/components/ui/ScrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../shared/components/ui/Tabs';

interface AISuggestion {
    id: string;
    type: 'object' | 'region' | 'classification' | 'segmentation';
    label: string;
    confidence: number;
    bbox?: { x: number; y: number; width: number; height: number };
    polygon?: Array<{ x: number; y: number }>;
    description: string;
    accepted: boolean;
}

interface AIModel {
    id: string;
    name: string;
    type: 'detection' | 'segmentation' | 'classification' | 'tracking';
    accuracy: number;
    speed: number;
    enabled: boolean;
}

interface AIAssistantPanelProps {
    onClose?: () => void;
    onSuggestionAccept?: (suggestion: AISuggestion) => void;
    onSuggestionReject?: (suggestion: AISuggestion) => void;
    isProcessing?: boolean;
    className?: string;
}

export function AIAssistantPanel({
    onClose,
    onSuggestionAccept,
    onSuggestionReject,
    isProcessing = false,
    className = ""
}: AIAssistantPanelProps) {
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([
        {
            id: 'ai-1',
            type: 'object',
            label: 'Person',
            confidence: 0.94,
            bbox: { x: 120, y: 80, width: 160, height: 280 },
            description: 'High confidence person detection',
            accepted: false
        },
        {
            id: 'ai-2',
            type: 'object',
            label: 'Vehicle',
            confidence: 0.87,
            bbox: { x: 320, y: 180, width: 180, height: 120 },
            description: 'Car detected in background',
            accepted: false
        },
        {
            id: 'ai-3',
            type: 'region',
            label: 'Road',
            confidence: 0.91,
            polygon: [
                { x: 0, y: 300 },
                { x: 640, y: 300 },
                { x: 640, y: 480 },
                { x: 0, y: 480 }
            ],
            description: 'Road surface segmentation',
            accepted: false
        }
    ]);

    const [aiModels, setAIModels] = useState<AIModel[]>([
        {
            id: 'yolo-v8',
            name: 'YOLO v8',
            type: 'detection',
            accuracy: 92.5,
            speed: 85,
            enabled: true
        },
        {
            id: 'mask-rcnn',
            name: 'Mask R-CNN',
            type: 'segmentation',
            accuracy: 88.3,
            speed: 45,
            enabled: true
        },
        {
            id: 'efficientnet',
            name: 'EfficientNet',
            type: 'classification',
            accuracy: 96.1,
            speed: 92,
            enabled: false
        }
    ]);

    const [autoMode, setAutoMode] = useState(false);
    const [confidenceThreshold, setConfidenceThreshold] = useState([0.8]);
    const [processing, setProcessing] = useState(isProcessing);
    const [selectedModel, setSelectedModel] = useState('yolo-v8');
    const [processingProgress, setProcessingProgress] = useState(0);
    const [isMinimized, setIsMinimized] = useState(false);

    const runAIAnalysis = useCallback(async () => {
        setProcessing(true);
        setProcessingProgress(0);
        
        // Simulate AI processing
        const interval = setInterval(() => {
            setProcessingProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setProcessing(false);
                    // Add new suggestions
                    const newSuggestions: AISuggestion[] = [
                        {
                            id: `ai-${Date.now()}`,
                            type: 'object',
                            label: 'Traffic Sign',
                            confidence: 0.89,
                            bbox: { x: 520, y: 40, width: 60, height: 80 },
                            description: 'Stop sign detected',
                            accepted: false
                        }
                    ];
                    setSuggestions(prev => [...prev, ...newSuggestions]);
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    }, []);

    const acceptSuggestion = useCallback((suggestion: AISuggestion) => {
        setSuggestions(prev => prev.map(s => 
            s.id === suggestion.id ? { ...s, accepted: true } : s
        ));
        onSuggestionAccept?.(suggestion);
    }, [onSuggestionAccept]);

    const rejectSuggestion = useCallback((suggestion: AISuggestion) => {
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
        onSuggestionReject?.(suggestion);
    }, [onSuggestionReject]);

    const acceptAllSuggestions = useCallback(() => {
        const unacceptedSuggestions = suggestions.filter(s => !s.accepted);
        setSuggestions(prev => prev.map(s => ({ ...s, accepted: true })));
        unacceptedSuggestions.forEach(suggestion => {
            onSuggestionAccept?.(suggestion);
        });
    }, [suggestions, onSuggestionAccept]);

    const clearAllSuggestions = useCallback(() => {
        setSuggestions([]);
    }, []);

    const toggleModel = useCallback((modelId: string) => {
        setAIModels(prev => prev.map(model => 
            model.id === modelId ? { ...model, enabled: !model.enabled } : model
        ));
    }, []);

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.9) return 'text-green-400 border-green-400/50';
        if (confidence >= 0.7) return 'text-yellow-400 border-yellow-400/50';
        return 'text-red-400 border-red-400/50';
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'object': return Target;
            case 'region': return Eye;
            case 'classification': return Brain;
            case 'segmentation': return Wand2;
            default: return Sparkles;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`relative ${className}`}
        >
            <Card className="bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-indigo-900/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl shadow-purple-500/25">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-purple-500/20">
                    <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                            AI Assistant
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
                                <Tabs defaultValue="suggestions" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-purple-800/50 to-pink-800/50 border border-purple-500/30">
                                        <TabsTrigger 
                                            value="suggestions" 
                                            className="text-purple-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                                        >
                                            Suggestions
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="models" 
                                            className="text-purple-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                                        >
                                            Models
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="settings" 
                                            className="text-purple-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                                        >
                                            Settings
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="suggestions" className="space-y-4 mt-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-purple-200">
                                                AI Suggestions ({suggestions.length})
                                            </span>
                                            <Button
                                                size="sm"
                                                onClick={runAIAnalysis}
                                                disabled={processing}
                                                className="h-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                                            >
                                                {processing ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Analyzing
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Sparkles className="h-4 w-4 mr-2" />
                                                        Analyze
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {processing && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-3"
                                            >
                                                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                        <span className="text-purple-200">AI Processing...</span>
                                                        <span className="text-white font-medium">{processingProgress}%</span>
                                                    </div>
                                                    <Progress value={processingProgress} className="w-full" />
                                                </div>
                                            </motion.div>
                                        )}

                                        {suggestions.length > 0 && (
                                            <div className="flex gap-2 mb-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={acceptAllSuggestions}
                                                    className="h-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-300 hover:bg-green-500/30"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Accept All
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={clearAllSuggestions}
                                                    className="h-8 bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Clear All
                                                </Button>
                                            </div>
                                        )}

                                        <ScrollArea className="h-64">
                                            <div className="space-y-2">
                                                {suggestions.map((suggestion) => {
                                                    const TypeIcon = getTypeIcon(suggestion.type);
                                                    return (
                                                        <motion.div
                                                            key={suggestion.id}
                                                            whileHover={{ scale: 1.02 }}
                                                            className={`p-3 rounded-lg border transition-all duration-200 ${
                                                                suggestion.accepted 
                                                                    ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-green-400/50 shadow-lg' 
                                                                    : 'bg-gradient-to-r from-purple-800/20 to-pink-800/20 border-purple-500/20 hover:border-purple-400/40'
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <TypeIcon className="h-4 w-4 text-purple-400" />
                                                                    <div>
                                                                        <div className="font-medium text-white">{suggestion.label}</div>
                                                                        <div className="text-xs text-purple-200">{suggestion.description}</div>
                                                                    </div>
                                                                </div>
                                                                <Badge 
                                                                    variant="outline" 
                                                                    className={`${getConfidenceColor(suggestion.confidence)}`}
                                                                >
                                                                    {Math.round(suggestion.confidence * 100)}%
                                                                </Badge>
                                                            </div>
                                                            
                                                            {!suggestion.accepted && (
                                                                <div className="flex gap-2 mt-3">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => acceptSuggestion(suggestion)}
                                                                        className="h-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                                                                    >
                                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                                        Accept
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => rejectSuggestion(suggestion)}
                                                                        className="h-6 bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                                                                    >
                                                                        <X className="h-3 w-3 mr-1" />
                                                                        Reject
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>

                                    <TabsContent value="models" className="space-y-4 mt-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-purple-200">AI Models</span>
                                            <Badge variant="outline" className="text-purple-200 border-purple-400/50">
                                                {aiModels.filter(m => m.enabled).length} active
                                            </Badge>
                                        </div>

                                        <div className="space-y-3">
                                            {aiModels.map((model) => (
                                                <motion.div
                                                    key={model.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    className={`p-4 rounded-lg border transition-all duration-200 ${
                                                        model.enabled 
                                                            ? 'bg-gradient-to-r from-purple-800/30 to-pink-800/30 border-purple-400/50 shadow-lg' 
                                                            : 'bg-gradient-to-r from-purple-800/10 to-pink-800/10 border-purple-500/20'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                                                                <Cpu className="h-4 w-4 text-purple-400" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-white">{model.name}</div>
                                                                <div className="text-xs text-purple-200 capitalize">{model.type}</div>
                                                            </div>
                                                        </div>
                                                        <Switch
                                                            checked={model.enabled}
                                                            onCheckedChange={() => toggleModel(model.id)}
                                                        />
                                                    </div>
                                                    
                                                    <div className="mt-3 grid grid-cols-2 gap-3">
                                                        <div className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-800/20 to-pink-800/20 rounded-lg">
                                                            <span className="text-xs text-purple-200">Accuracy</span>
                                                            <span className="text-sm font-medium text-green-400">{model.accuracy}%</span>
                                                        </div>
                                                        <div className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-800/20 to-pink-800/20 rounded-lg">
                                                            <span className="text-xs text-purple-200">Speed</span>
                                                            <span className="text-sm font-medium text-blue-400">{model.speed}%</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="settings" className="space-y-4 mt-6">
                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium text-purple-200">
                                                    Confidence Threshold: {Math.round(confidenceThreshold[0] * 100)}%
                                                </Label>
                                                <div className="px-3">
                                                    <Slider
                                                        value={confidenceThreshold}
                                                        onValueChange={setConfidenceThreshold}
                                                        max={1}
                                                        min={0.1}
                                                        step={0.05}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div className="text-xs text-purple-200">
                                                    Only show suggestions above this confidence level
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-purple-200">Primary Model</Label>
                                                <div className="relative">
                                                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                                                        <SelectTrigger className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 border-purple-500/30 text-white hover:border-purple-400/50">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-gradient-to-br from-purple-900 to-pink-900 border-purple-500/30 z-[60]">
                                                            {aiModels.filter(m => m.enabled).map(model => (
                                                                <SelectItem key={model.id} value={model.id} className="text-white hover:bg-purple-500/20">
                                                                    {model.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-800/20 to-pink-800/20 rounded-lg border border-purple-500/20">
                                                    <Label className="text-sm font-medium text-purple-200">Auto Mode</Label>
                                                    <Switch 
                                                        checked={autoMode} 
                                                        onCheckedChange={setAutoMode}
                                                    />
                                                </div>
                                                <div className="text-xs text-purple-200 pl-3">
                                                    Automatically run AI analysis on new images
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-purple-500/20">
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-semibold text-purple-200">Statistics</Label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="p-3 bg-gradient-to-r from-purple-800/20 to-pink-800/20 rounded-lg border border-purple-500/20">
                                                            <div className="text-2xl font-bold text-white">247</div>
                                                            <div className="text-xs text-purple-200">Suggestions</div>
                                                        </div>
                                                        <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/20">
                                                            <div className="text-2xl font-bold text-green-400">189</div>
                                                            <div className="text-xs text-green-200">Accepted</div>
                                                        </div>
                                                        <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/20">
                                                            <div className="text-2xl font-bold text-blue-400">92.3%</div>
                                                            <div className="text-xs text-blue-200">Accuracy</div>
                                                        </div>
                                                        <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/20">
                                                            <div className="text-2xl font-bold text-yellow-400">2.4h</div>
                                                            <div className="text-xs text-yellow-200">Time Saved</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    );
} 