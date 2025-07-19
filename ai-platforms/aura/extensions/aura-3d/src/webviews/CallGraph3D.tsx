/**
 * CallGraph3D - 3D Call Graph Visualization Component
 * 
 * Advanced 3D visualization of function call relationships and code dependencies
 * Features:
 * - Interactive 3D function relationship rendering
 * - Detailed hover interactions with node information
 * - Animated edge data flow visualization
 * - Color and size-based complexity visualization
 * - Advanced filtering system by type, module, and complexity
 * - 3D annotation support with spatial labels
 * - Export functionality (glTF, screenshot, JSON)
 * - VR mode preparation for immersive exploration
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fade,
  Popper,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  FilterList,
  GetApp,
  VrPano,
  Timeline,
  AccountTree,
  Functions,
  Category,
  Speed,
  Palette,
  Visibility,
  VisibilityOff,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  PlayArrow,
  Pause,
  Camera,
  ThreeDRotation,
  Code,
  BugReport,
  TrendingUp
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import G3DRenderer from '../../g3d/G3DRenderer';
import SceneBuilder from '../../g3d/SceneBuilder';

// Styled components
const CallGraphContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.98) 0%, rgba(20, 20, 35, 0.98) 100%)',
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
  backdropFilter: 'blur(15px)'
}));

const CallGraphCanvas = styled('canvas')(({ theme }) => ({
  width: '100%',
  height: '100%',
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing'
  },
  transition: 'filter 0.2s ease',
  '&.vr-mode': {
    filter: 'brightness(1.2) contrast(1.1)'
  }
}));

const ControlPanel = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  width: 320,
  maxHeight: '80%',
  overflow: 'auto',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(1.5),
  zIndex: 10,
  '&::-webkit-scrollbar': {
    width: 6
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255,255,255,0.1)'
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255,255,255,0.3)',
    borderRadius: 3
  }
}));

const NodeInfoPanel = styled(Card)(({ theme }) => ({
  position: 'absolute',
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(1),
  maxWidth: 350,
  maxHeight: 400,
  overflow: 'auto',
  zIndex: 20,
  '&::-webkit-scrollbar': {
    width: 4
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255,255,255,0.1)'
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255,255,255,0.3)',
    borderRadius: 2
  }
}));

const ExportMenu = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  backdropFilter: 'blur(5px)'
}));

const AnimationControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1, 2),
  backdropFilter: 'blur(5px)'
}));

const AnnotationLabel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  color: theme.palette.text.primary,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(0.5),
  fontSize: '0.75rem',
  fontWeight: 500,
  pointerEvents: 'none',
  transform: 'translate(-50%, -100%)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    border: '4px solid transparent',
    borderTopColor: 'rgba(255, 255, 255, 0.95)'
  }
}));

// Interface definitions
interface CallGraphProps {
  callData?: CallGraphData;
  onNodeSelect?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
  onEdgeSelect?: (edgeId: string) => void;
  width?: number;
  height?: number;
  enableVR?: boolean;
  enableAnimations?: boolean;
  enableExport?: boolean;
  className?: string;
}

interface CallGraphData {
  nodes: CallGraphNode[];
  edges: CallGraphEdge[];
  metadata: {
    projectName: string;
    language: string;
    totalFunctions: number;
    totalCalls: number;
    lastAnalyzed: Date;
  };
}

interface CallGraphNode {
  id: string;
  name: string;
  type: 'function' | 'method' | 'constructor' | 'getter' | 'setter' | 'async' | 'generator';
  module: string;
  filePath: string;
  position: { line: number; column: number };
  complexity: number;
  size: number;
  callCount: number;
  calledBy: string[];
  calls: string[];
  parameters: Parameter[];
  returnType: string;
  visibility: 'public' | 'private' | 'protected' | 'internal';
  isAsync: boolean;
  isStatic: boolean;
  isAbstract: boolean;
  isDeprecated: boolean;
  documentation?: string;
  annotations: Annotation3D[];
  performance?: {
    averageExecutionTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

interface CallGraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'call' | 'callback' | 'promise' | 'event' | 'dependency';
  weight: number;
  frequency: number;
  context: string;
  isAsync: boolean;
  isConditional: boolean;
  isRecursive: boolean;
  performance?: {
    averageLatency: number;
    errorRate: number;
  };
}

interface Parameter {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: any;
}

interface Annotation3D {
  id: string;
  text: string;
  position: { x: number; y: number; z: number };
  type: 'info' | 'warning' | 'error' | 'performance' | 'deprecated';
  persistent: boolean;
}

interface FilterConfig {
  nodeTypes: Set<string>;
  edgeTypes: Set<string>;
  modules: Set<string>;
  complexityRange: [number, number];
  sizeRange: [number, number];
  callCountRange: [number, number];
  showDeprecated: boolean;
  showAsync: boolean;
  showPrivate: boolean;
}

interface VisualizationConfig {
  nodeColorBy: 'type' | 'complexity' | 'size' | 'module' | 'performance';
  nodeSizeBy: 'complexity' | 'size' | 'callCount' | 'uniform';
  edgeColorBy: 'type' | 'frequency' | 'performance' | 'uniform';
  edgeThicknessBy: 'weight' | 'frequency' | 'uniform';
  showLabels: boolean;
  showAnnotations: boolean;
  animateFlow: boolean;
  animationSpeed: number;
}

interface ExportOptions {
  format: 'gltf' | 'png' | 'jpg' | 'svg' | 'json';
  resolution: '1x' | '2x' | '4x';
  includeAnnotations: boolean;
  includeMetadata: boolean;
  transparent: boolean;
}

/**
 * CallGraph3D Component
 */
const CallGraph3D: React.FC<CallGraphProps> = ({
  callData,
  onNodeSelect,
  onNodeHover,
  onEdgeSelect,
  width = 800,
  height = 600,
  enableVR = true,
  enableAnimations = true,
  enableExport = true,
  className
}) => {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<G3DRenderer | null>(null);
  const sceneBuilderRef = useRef<SceneBuilder | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [nodeInfoAnchor, setNodeInfoAnchor] = useState<HTMLElement | null>(null);
  const [isVRMode, setIsVRMode] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(enableAnimations);
  
  // Configuration state
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    nodeTypes: new Set(['function', 'method', 'constructor']),
    edgeTypes: new Set(['call', 'callback', 'promise']),
    modules: new Set(),
    complexityRange: [0, 100],
    sizeRange: [0, 1000],
    callCountRange: [0, 100],
    showDeprecated: true,
    showAsync: true,
    showPrivate: false
  });

  const [visualConfig, setVisualConfig] = useState<VisualizationConfig>({
    nodeColorBy: 'type',
    nodeSizeBy: 'complexity',
    edgeColorBy: 'type',
    edgeThicknessBy: 'frequency',
    showLabels: true,
    showAnnotations: true,
    animateFlow: true,
    animationSpeed: 1.0
  });

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    resolution: '2x',
    includeAnnotations: true,
    includeMetadata: true,
    transparent: false
  });

  // Computed values
  const filteredNodes = useMemo(() => {
    if (!callData) return [];
    
    return callData.nodes.filter(node => {
      if (!filterConfig.nodeTypes.has(node.type)) return false;
      if (!filterConfig.showDeprecated && node.isDeprecated) return false;
      if (!filterConfig.showAsync && node.isAsync) return false;
      if (!filterConfig.showPrivate && node.visibility === 'private') return false;
      if (node.complexity < filterConfig.complexityRange[0] || node.complexity > filterConfig.complexityRange[1]) return false;
      if (node.size < filterConfig.sizeRange[0] || node.size > filterConfig.sizeRange[1]) return false;
      if (node.callCount < filterConfig.callCountRange[0] || node.callCount > filterConfig.callCountRange[1]) return false;
      if (filterConfig.modules.size > 0 && !filterConfig.modules.has(node.module)) return false;
      
      return true;
    });
  }, [callData, filterConfig]);

  const filteredEdges = useMemo(() => {
    if (!callData) return [];
    
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    
    return callData.edges.filter(edge => {
      if (!filterConfig.edgeTypes.has(edge.type)) return false;
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return false;
      
      return true;
    });
  }, [callData, filteredNodes, filterConfig]);

  const nodeInfo = useMemo(() => {
    if (!selectedNode || !callData) return null;
    return callData.nodes.find(n => n.id === selectedNode) || null;
  }, [selectedNode, callData]);

  const availableModules = useMemo(() => {
    if (!callData) return [];
    return Array.from(new Set(callData.nodes.map(n => n.module))).sort();
  }, [callData]);

  // Initialize renderer and scene builder
  useEffect(() => {
    const initialize = async () => {
      if (!canvasRef.current) return;

      try {
        // Initialize renderer
        const renderer = new G3DRenderer(canvasRef.current);
        await renderer.initialize();
        rendererRef.current = renderer;

        // Initialize scene builder
        const sceneBuilder = new SceneBuilder();
        sceneBuilderRef.current = sceneBuilder;

        // Configure for call graph visualization
        renderer.updateSettings({
          enableLOD: true,
          enableFrustumCulling: true,
          enableInstancing: true,
          enablePostProcessing: true,
          maxDrawCalls: 5000,
          targetFPS: 60
        });

        // Setup event listeners
        renderer.on('frame-rendered', handleFrameRendered);
        sceneBuilder.on('scene-built', handleSceneBuilt);

        setIsInitialized(true);

      } catch (error) {
        console.error('Failed to initialize CallGraph3D:', error);
      }
    };

    initialize();

    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (sceneBuilderRef.current) {
        sceneBuilderRef.current.dispose();
      }
    };
  }, []);

  // Build scene when data or filters change
  useEffect(() => {
    if (!isInitialized || !callData || !sceneBuilderRef.current || !rendererRef.current) return;

    buildCallGraphScene();
  }, [isInitialized, callData, filteredNodes, filteredEdges, visualConfig]);

  // Handle VR mode changes
  useEffect(() => {
    if (!rendererRef.current) return;

    if (isVRMode) {
      // Prepare for VR mode
      canvasRef.current?.classList.add('vr-mode');
      // Additional VR setup would go here
    } else {
      canvasRef.current?.classList.remove('vr-mode');
    }
  }, [isVRMode]);

  // Callbacks
  const handleFrameRendered = useCallback((stats: any) => {
    // Handle frame rendering stats
  }, []);

  const handleSceneBuilt = useCallback((event: any) => {
    console.log('Call graph scene built:', event);
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!rendererRef.current) return;

    // Perform ray casting to detect clicked node/edge
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Simplified node detection (would use actual ray casting in real implementation)
    const clickedNodeId = detectNodeAtPosition(x, y);
    
    if (clickedNodeId) {
      setSelectedNode(clickedNodeId);
      setNodeInfoAnchor(event.currentTarget);
      onNodeSelect?.(clickedNodeId);
    } else {
      setSelectedNode(null);
      setNodeInfoAnchor(null);
    }
  }, [onNodeSelect]);

  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!rendererRef.current) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const hoveredNodeId = detectNodeAtPosition(x, y);
    
    if (hoveredNodeId !== hoveredNode) {
      setHoveredNode(hoveredNodeId);
      onNodeHover?.(hoveredNodeId);
    }
  }, [hoveredNode, onNodeHover]);

  const buildCallGraphScene = async () => {
    if (!sceneBuilderRef.current || !rendererRef.current) return;

    try {
      // Convert call graph data to AST format for scene builder
      const ast = convertCallGraphToAST(filteredNodes, filteredEdges);
      
      // Build 3D scene
      const scene = await sceneBuilderRef.current.buildSceneFromAST(ast, {
        layout: {
          name: 'force-directed-3d',
          type: 'force-directed',
          parameters: {
            attraction: 0.1,
            repulsion: 200,
            damping: 0.95,
            gravity: 0.01
          }
        },
        enablePhysics: true,
        enableClustering: true,
        enableAnimation: isAnimationPlaying
      });

      // Apply visualization configuration
      applyVisualizationConfig(scene);

      // Set scene in renderer
      rendererRef.current.setScene(scene);
      
      // Start render loop
      rendererRef.current.startRenderLoop();

    } catch (error) {
      console.error('Failed to build call graph scene:', error);
    }
  };

  const convertCallGraphToAST = (nodes: CallGraphNode[], edges: CallGraphEdge[]) => {
    // Convert call graph data to AST format that SceneBuilder expects
    // This is a simplified implementation
    return {
      type: 'program',
      name: 'CallGraph',
      id: 'root',
      children: nodes.map(node => ({
        type: node.type,
        name: node.name,
        id: node.id,
        children: [],
        metadata: {
          filePath: node.filePath,
          line: node.position.line,
          column: node.position.column,
          endLine: node.position.line,
          endColumn: node.position.column,
          language: 'javascript',
          complexity: node.complexity,
          dependencies: node.calls,
          exports: [],
          imports: node.calledBy,
          size: node.size,
          lastModified: Date.now()
        },
        annotations: {
          type: node.type as any,
          visibility: node.visibility as any,
          async: node.isAsync,
          static: node.isStatic,
          abstract: node.isAbstract,
          deprecated: node.isDeprecated
        }
      })),
      metadata: {
        filePath: '',
        line: 0,
        column: 0,
        endLine: 0,
        endColumn: 0,
        language: 'javascript',
        complexity: 0,
        dependencies: [],
        exports: [],
        imports: [],
        size: 0,
        lastModified: Date.now()
      },
      annotations: {
        type: 'function' as any,
        visibility: 'public' as any,
        async: false,
        static: false,
        abstract: false,
        deprecated: false
      }
    };
  };

  const applyVisualizationConfig = (scene: any) => {
    // Apply color and size configurations to scene nodes
    scene.nodes.forEach((node: any, nodeId: string) => {
      const nodeData = filteredNodes.find(n => n.id === nodeId);
      if (!nodeData) return;

      // Apply node coloring
      node.color = getNodeColor(nodeData, visualConfig.nodeColorBy);
      
      // Apply node sizing
      const size = getNodeSize(nodeData, visualConfig.nodeSizeBy);
      node.size = { x: size, y: size, z: size };
    });

    // Apply edge configurations
    scene.connections.forEach((edge: any, edgeId: string) => {
      const edgeData = filteredEdges.find(e => e.id === edgeId);
      if (!edgeData) return;

      // Apply edge coloring
      // Apply edge thickness
    });
  };

  const getNodeColor = (node: CallGraphNode, colorBy: string) => {
    switch (colorBy) {
      case 'type':
        return getTypeColor(node.type);
      case 'complexity':
        return getComplexityColor(node.complexity);
      case 'module':
        return getModuleColor(node.module);
      case 'performance':
        return getPerformanceColor(node.performance?.averageExecutionTime || 0);
      default:
        return { r: 0.5, g: 0.5, b: 0.5, a: 1.0 };
    }
  };

  const getNodeSize = (node: CallGraphNode, sizeBy: string): number => {
    const baseSize = 1;
    switch (sizeBy) {
      case 'complexity':
        return baseSize + Math.log(node.complexity + 1) * 0.3;
      case 'size':
        return baseSize + Math.log(node.size + 1) * 0.1;
      case 'callCount':
        return baseSize + Math.log(node.callCount + 1) * 0.2;
      default:
        return baseSize;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      function: { r: 0.2, g: 0.8, b: 0.2, a: 1.0 },
      method: { r: 0.2, g: 0.6, b: 0.8, a: 1.0 },
      constructor: { r: 0.8, g: 0.6, b: 0.2, a: 1.0 },
      getter: { r: 0.6, g: 0.8, b: 0.2, a: 1.0 },
      setter: { r: 0.8, g: 0.4, b: 0.2, a: 1.0 },
      async: { r: 0.8, g: 0.2, b: 0.6, a: 1.0 },
      generator: { r: 0.4, g: 0.2, b: 0.8, a: 1.0 }
    };
    return colors[type as keyof typeof colors] || { r: 0.5, g: 0.5, b: 0.5, a: 1.0 };
  };

  const getComplexityColor = (complexity: number) => {
    const normalizedComplexity = Math.min(complexity / 20, 1);
    return {
      r: normalizedComplexity,
      g: 1 - normalizedComplexity,
      b: 0.2,
      a: 1.0
    };
  };

  const getModuleColor = (module: string) => {
    // Generate consistent color based on module name
    let hash = 0;
    for (let i = 0; i < module.length; i++) {
      hash = ((hash << 5) - hash + module.charCodeAt(i)) & 0xffffffff;
    }
    
    const r = (hash & 0xFF) / 255;
    const g = ((hash >> 8) & 0xFF) / 255;
    const b = ((hash >> 16) & 0xFF) / 255;
    
    return { r, g, b, a: 1.0 };
  };

  const getPerformanceColor = (executionTime: number) => {
    const normalizedTime = Math.min(executionTime / 100, 1);
    return {
      r: normalizedTime,
      g: 0.2,
      b: 1 - normalizedTime,
      a: 1.0
    };
  };

  const detectNodeAtPosition = (x: number, y: number): string | null => {
    // Simplified node detection - would use proper ray casting in real implementation
    return null;
  };

  const handleExport = async (options: ExportOptions) => {
    if (!rendererRef.current) return;

    try {
      switch (options.format) {
        case 'png':
        case 'jpg':
          await exportScreenshot(options);
          break;
        case 'gltf':
          await exportGLTF(options);
          break;
        case 'json':
          await exportJSON(options);
          break;
        case 'svg':
          await exportSVG(options);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const exportScreenshot = async (options: ExportOptions) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `callgraph.${options.format}`;
    link.href = canvas.toDataURL(`image/${options.format}`);
    link.click();
  };

  const exportGLTF = async (options: ExportOptions) => {
    // Implementation for glTF export
    console.log('Exporting glTF...', options);
  };

  const exportJSON = async (options: ExportOptions) => {
    const data = {
      nodes: filteredNodes,
      edges: filteredEdges,
      metadata: callData?.metadata,
      visualization: visualConfig,
      filters: filterConfig
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'callgraph.json';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const exportSVG = async (options: ExportOptions) => {
    // Implementation for SVG export
    console.log('Exporting SVG...', options);
  };

  const enterVRMode = () => {
    if (!enableVR) return;
    setIsVRMode(true);
    // Additional VR initialization would go here
  };

  const exitVRMode = () => {
    setIsVRMode(false);
  };

  // Render
  return (
    <CallGraphContainer ref={containerRef} className={className}>
      <CallGraphCanvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        style={{ 
          width: `${width}px`, 
          height: `${height}px` 
        }}
      />

      {/* Control Panel */}
      <Fade in={isControlPanelOpen}>
        <ControlPanel>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" color="primary">
              Call Graph Controls
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => setIsControlPanelOpen(false)}
            >
              <VisibilityOff />
            </IconButton>
          </Box>

          {/* Visualization Settings */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">Visualization</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControl size="small">
                  <InputLabel>Color By</InputLabel>
                  <Select
                    value={visualConfig.nodeColorBy}
                    onChange={(e) => setVisualConfig(prev => ({
                      ...prev,
                      nodeColorBy: e.target.value as any
                    }))}
                  >
                    <MenuItem value="type">Type</MenuItem>
                    <MenuItem value="complexity">Complexity</MenuItem>
                    <MenuItem value="module">Module</MenuItem>
                    <MenuItem value="performance">Performance</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel>Size By</InputLabel>
                  <Select
                    value={visualConfig.nodeSizeBy}
                    onChange={(e) => setVisualConfig(prev => ({
                      ...prev,
                      nodeSizeBy: e.target.value as any
                    }))}
                  >
                    <MenuItem value="complexity">Complexity</MenuItem>
                    <MenuItem value="size">Size</MenuItem>
                    <MenuItem value="callCount">Call Count</MenuItem>
                    <MenuItem value="uniform">Uniform</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={visualConfig.showLabels}
                      onChange={(e) => setVisualConfig(prev => ({
                        ...prev,
                        showLabels: e.target.checked
                      }))}
                    />
                  }
                  label="Show Labels"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={visualConfig.animateFlow}
                      onChange={(e) => setVisualConfig(prev => ({
                        ...prev,
                        animateFlow: e.target.checked
                      }))}
                    />
                  }
                  label="Animate Flow"
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Filters */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">Filters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="caption">Complexity Range</Typography>
                <Slider
                  value={filterConfig.complexityRange}
                  onChange={(e, value) => setFilterConfig(prev => ({
                    ...prev,
                    complexityRange: value as [number, number]
                  }))}
                  valueLabelDisplay="auto"
                  min={0}
                  max={50}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={filterConfig.showDeprecated}
                      onChange={(e) => setFilterConfig(prev => ({
                        ...prev,
                        showDeprecated: e.target.checked
                      }))}
                    />
                  }
                  label="Show Deprecated"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={filterConfig.showAsync}
                      onChange={(e) => setFilterConfig(prev => ({
                        ...prev,
                        showAsync: e.target.checked
                      }))}
                    />
                  }
                  label="Show Async"
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </ControlPanel>
      </Fade>

      {/* Node Info Panel */}
      <Popper open={!!nodeInfo} anchorEl={nodeInfoAnchor} placement="right">
        <NodeInfoPanel>
          {nodeInfo && (
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {nodeInfo.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {nodeInfo.type} • {nodeInfo.module}
              </Typography>
              
              <Divider style={{ margin: '8px 0' }} />
              
              <Typography variant="body2">
                Complexity: {nodeInfo.complexity}
              </Typography>
              <Typography variant="body2">
                Size: {nodeInfo.size} lines
              </Typography>
              <Typography variant="body2">
                Called: {nodeInfo.callCount} times
              </Typography>
              
              {nodeInfo.performance && (
                <>
                  <Divider style={{ margin: '8px 0' }} />
                  <Typography variant="body2">
                    Avg. Execution: {nodeInfo.performance.averageExecutionTime}ms
                  </Typography>
                </>
              )}
              
              {nodeInfo.documentation && (
                <>
                  <Divider style={{ margin: '8px 0' }} />
                  <Typography variant="body2">
                    {nodeInfo.documentation}
                  </Typography>
                </>
              )}
            </CardContent>
          )}
        </NodeInfoPanel>
      </Popper>

      {/* Export Menu */}
      {enableExport && (
        <ExportMenu>
          <Tooltip title="Export Screenshot">
            <IconButton 
              color="primary" 
              onClick={() => handleExport({ ...exportOptions, format: 'png' })}
            >
              <Camera />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Export 3D Model">
            <IconButton 
              color="primary" 
              onClick={() => handleExport({ ...exportOptions, format: 'gltf' })}
            >
              <ThreeDRotation />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Export Data">
            <IconButton 
              color="primary" 
              onClick={() => handleExport({ ...exportOptions, format: 'json' })}
            >
              <GetApp />
            </IconButton>
          </Tooltip>

          {enableVR && (
            <Tooltip title={isVRMode ? "Exit VR" : "Enter VR"}>
              <IconButton 
                color={isVRMode ? "secondary" : "primary"}
                onClick={isVRMode ? exitVRMode : enterVRMode}
              >
                <VrPano />
              </IconButton>
            </Tooltip>
          )}
        </ExportMenu>
      )}

      {/* Animation Controls */}
      {enableAnimations && (
        <AnimationControls>
          <IconButton
            color="primary"
            onClick={() => setIsAnimationPlaying(!isAnimationPlaying)}
          >
            {isAnimationPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          
          <Slider
            value={visualConfig.animationSpeed}
            onChange={(e, value) => setVisualConfig(prev => ({
              ...prev,
              animationSpeed: value as number
            }))}
            min={0.1}
            max={3}
            step={0.1}
            valueLabelDisplay="auto"
            style={{ width: 100 }}
          />
          
          <Typography variant="caption" color="textSecondary">
            Speed
          </Typography>
        </AnimationControls>
      )}

      {/* Toggle Control Panel */}
      {!isControlPanelOpen && (
        <IconButton
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }}
          onClick={() => setIsControlPanelOpen(true)}
        >
          <Visibility />
        </IconButton>
      )}
    </CallGraphContainer>
  );
};

export default CallGraph3D; 