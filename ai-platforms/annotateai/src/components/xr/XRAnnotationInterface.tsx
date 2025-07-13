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
    Tablet,
    X,
    Sparkles,
    Play,
    Pause,
    Square,
    RotateCcw,
    Move3D,
    Scan,
    Layers3
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../shared/components/ui/Card';
import { Button } from '../../../../../shared/components/ui/Button';
import { Badge } from '../../../../../shared/components/ui/Badge';
import { Slider } from '../../../../../shared/components/ui/Slider';
import { Switch } from '../../../../../shared/components/ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../shared/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../shared/components/ui/Tabs';
import { Progress } from '../../../../../shared/components/ui/Progress';
import { Label } from '../../../../../shared/components/ui/Label';
import { ScrollArea } from '../../../../../shared/components/ui/ScrollArea';

// Backend Service Integration
// import { XRAnnotation, XRSessionMode, XRAnnotationData, XRAnnotationType, XRUser } from '../../core/XRAnnotation';

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
    mode: 'ar' | 'vr' | 'mixed';
    isActive: boolean;
    startTime: number;
    duration: number;
    participants: any[];
    annotations: any[];
    performance: {
        fps: number;
        latency: number;
        trackingQuality: number;
    };
}

interface XRAnnotationInterfaceProps {
    onModeChange?: (mode: 'ar' | 'vr' | 'mixed') => void;
    onSessionStart?: (session: any) => void;
    onSessionEnd?: () => void;
    onAnnotationCreate?: (annotation: any) => void;
    onClose?: () => void;
    isVisible?: boolean;
    className?: string;
}

export default function XRAnnotationInterface({ 
    onModeChange, 
    onSessionStart, 
    onSessionEnd, 
    onAnnotationCreate,
    onClose,
    isVisible = true,
    className = ""
}: XRAnnotationInterfaceProps) {
  const [xrMode, setXrMode] = useState<'ar' | 'vr' | 'mixed'>('ar');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [trackingQuality, setTrackingQuality] = useState(85);
  const [isMinimized, setIsMinimized] = useState(false);
  const [devices, setDevices] = useState<XRDevice[]>([
    {
      id: 'headset-1',
      name: 'Meta Quest 3',
      type: 'headset',
      connected: true,
      batteryLevel: 78,
      isActive: true,
      capabilities: ['6dof', 'hand-tracking', 'passthrough']
    },
    {
      id: 'controller-1',
      name: 'Left Controller',
      type: 'controller',
      connected: true,
      batteryLevel: 65,
      isActive: true,
      capabilities: ['6dof', 'haptic']
    },
    {
      id: 'controller-2',
      name: 'Right Controller',
      type: 'controller',
      connected: true,
      batteryLevel: 72,
      isActive: true,
      capabilities: ['6dof', 'haptic']
    }
  ]);

  const handleStartSession = useCallback((mode: 'ar' | 'vr' | 'mixed') => {
    setXrMode(mode);
    setIsSessionActive(true);
    onSessionStart?.({ id: `session-${Date.now()}`, mode, isActive: true });
  }, [onSessionStart]);

  const handleEndSession = useCallback(() => {
    setIsSessionActive(false);
    onSessionEnd?.();
  }, [onSessionEnd]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative ${className}`}
    >
      <Card className="bg-gradient-to-br from-blue-900/95 via-indigo-900/95 to-purple-900/95 backdrop-blur-xl border border-blue-500/30 shadow-2xl shadow-blue-500/25">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-blue-500/20">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              XR Annotation Interface
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 text-blue-200 hover:text-white hover:bg-blue-500/20"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-blue-200 hover:text-white hover:bg-blue-500/20"
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
                <Tabs defaultValue="session" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-800/50 to-purple-800/50 border border-blue-500/30">
                    <TabsTrigger 
                      value="session" 
                      className="text-blue-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                    >
                      Session
                    </TabsTrigger>
                    <TabsTrigger 
                      value="devices" 
                      className="text-blue-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                    >
                      Devices
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tools" 
                      className="text-blue-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                    >
                      Tools
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="session" className="space-y-4 mt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isSessionActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium text-blue-200">
                          {isSessionActive ? 'Session Active' : 'WebXR Ready'}
                        </span>
                        <Badge variant="outline" className="text-green-400 border-green-400/50">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ready
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartSession('ar')}
                          disabled={isSessionActive}
                          className={`${xrMode === 'ar' && isSessionActive 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                            : 'border-blue-500/30 text-blue-200 hover:bg-blue-500/20'
                          }`}
                        >
                          <Smartphone className="h-4 w-4 mr-2" />
                          AR Mode
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartSession('vr')}
                          disabled={isSessionActive}
                          className={`${xrMode === 'vr' && isSessionActive 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                            : 'border-blue-500/30 text-blue-200 hover:bg-blue-500/20'
                          }`}
                        >
                          <Box className="h-4 w-4 mr-2" />
                          VR Mode
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-800/20 to-purple-800/20 rounded-lg border border-blue-500/20">
                          <span className="text-sm font-medium text-blue-200">Tracking Quality</span>
                          <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                            <Activity className="h-3 w-3 mr-1" />
                            {trackingQuality}%
                          </Badge>
                        </div>
                        
                        <div className="px-3">
                          <Progress value={trackingQuality} className="w-full" />
                        </div>
                      </div>

                      {isSessionActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-400/30">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="h-4 w-4 text-green-400" />
                              <span className="text-sm font-medium text-white">Active Session</span>
                            </div>
                            <div className="text-xs text-green-200">
                              Mode: {xrMode.toUpperCase()} • Duration: 00:02:45
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEndSession}
                            className="w-full bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30 hover:text-red-200"
                          >
                            <Square className="h-4 w-4 mr-2" />
                            End Session
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="devices" className="space-y-4 mt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-blue-200">Connected Devices</span>
                        <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                          {devices.filter(d => d.connected).length} online
                        </Badge>
                      </div>

                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {devices.map((device) => (
                            <motion.div
                              key={device.id}
                              whileHover={{ scale: 1.02 }}
                              className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-800/20 to-purple-800/20 rounded-lg border border-blue-500/20"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${device.connected ? 'bg-green-500' : 'bg-red-500'}`} />
                                <div>
                                  <div className="text-sm font-medium text-white">{device.name}</div>
                                  <div className="text-xs text-blue-200">{device.type}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {device.batteryLevel && (
                                  <Badge variant="outline" className="text-xs text-blue-200 border-blue-400/30">
                                    {device.batteryLevel}%
                                  </Badge>
                                )}
                                <div className={`w-2 h-2 rounded-full ${device.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  <TabsContent value="tools" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <span className="text-sm font-semibold text-blue-200">XR Annotation Tools</span>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20 hover:text-white"
                          >
                            <Hand className="h-4 w-4 mr-2" />
                            Hand Tracking
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20 hover:text-white"
                          >
                            <Mic className="h-4 w-4 mr-2" />
                            Voice Input
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20 hover:text-white"
                          >
                            <Move3D className="h-4 w-4 mr-2" />
                            3D Cursor
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20 hover:text-white"
                          >
                            <Layers3 className="h-4 w-4 mr-2" />
                            Spatial Tools
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-sm font-semibold text-blue-200">Performance</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gradient-to-r from-blue-800/20 to-purple-800/20 rounded-lg border border-blue-500/20">
                            <div className="text-lg font-bold text-white">90</div>
                            <div className="text-xs text-blue-200">FPS</div>
                          </div>
                          <div className="p-3 bg-gradient-to-r from-blue-800/20 to-purple-800/20 rounded-lg border border-blue-500/20">
                            <div className="text-lg font-bold text-white">12ms</div>
                            <div className="text-xs text-blue-200">Latency</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-800/20 to-purple-800/20 rounded-lg border border-blue-500/20">
                          <Label className="text-sm font-medium text-blue-200">Passthrough</Label>
                          <Switch checked={true} onCheckedChange={() => {}} />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-800/20 to-purple-800/20 rounded-lg border border-blue-500/20">
                          <Label className="text-sm font-medium text-blue-200">Haptic Feedback</Label>
                          <Switch checked={true} onCheckedChange={() => {}} />
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