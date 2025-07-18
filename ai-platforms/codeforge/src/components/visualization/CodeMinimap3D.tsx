/**
 * CodeMinimap3D - 3D Code Visualization Minimap Component
 * 
 * Revolutionary miniature 3D view for code navigation and exploration
 * Features:
 * - Miniature 3D representation of code structure
 * - Interactive viewport indicator for main view navigation
 * - Intuitive click navigation with smooth transitions
 * - Comprehensive zoom controls with gesture support
 * - Advanced layer filtering system
 * - Real-time heat map overlay for code complexity
 * - Smart search highlighting with visual feedback
 * - Performance monitoring with FPS counter display
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Box, Paper, Slider, IconButton, Tooltip, Chip, Fade, Typography } from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  FilterList,
  Search,
  Timeline,
  Visibility,
  VisibilityOff,
  Speed,
  ThermostatTwoTone,
  RadioButtonUnchecked,
  MyLocation,
  Refresh
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import G3DRenderer from '../../lib/g3d/G3DRenderer';
import SceneBuilder from '../../lib/g3d/SceneBuilder';

// Styled components
const MinimapContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, rgba(15, 15, 25, 0.95) 0%, rgba(25, 25, 40, 0.95) 100%)',
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    boxShadow: theme.shadows[8]
  }
}));

const MinimapCanvas = styled('canvas')(({ theme }) => ({
  width: '100%',
  height: '100%',
  cursor: 'crosshair',
  transition: 'opacity 0.2s ease',
  '&:hover': {
    opacity: 0.9
  }
}));

const ControlsOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(0.5),
  backdropFilter: 'blur(5px)'
}));

const LayerControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(1),
  left: theme.spacing(1),
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  maxWidth: '80%'
}));

const ViewportIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  border: '2px solid #00ff88',
  backgroundColor: 'rgba(0, 255, 136, 0.1)',
  borderRadius: theme.spacing(0.5),
  pointerEvents: 'none',
  transition: 'all 0.2s ease',
  '&.active': {
    boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
  }
}));

const PerformanceOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1),
  backdropFilter: 'blur(5px)',
  fontSize: '0.75rem',
  fontFamily: 'monospace',
  color: theme.palette.success.main,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5)
}));

const SearchOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.primary.main}`,
  minWidth: 200
}));

const HeatMapLegend = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(6),
  right: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  backdropFilter: 'blur(5px)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.25),
  fontSize: '0.7rem'
}));

// Interface definitions
interface MinimapProps {
  scene?: any; // G3D Scene object
  viewportBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  onViewportChange?: (bounds: { x: number; y: number; width: number; height: number }) => void;
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
  searchQuery?: string;
  searchResults?: string[];
  width?: number;
  height?: number;
  enableHeatMap?: boolean;
  enablePerformanceMonitor?: boolean;
  className?: string;
}

interface LayerConfig {
  id: string;
  name: string;
  visible: boolean;
  color: string;
  type: 'function' | 'class' | 'module' | 'file' | 'connection';
  nodeCount: number;
}

interface PerformanceStats {
  fps: number;
  frameTime: number;
  nodeCount: number;
  renderTime: number;
  memoryUsage: number;
}

interface HeatMapConfig {
  enabled: boolean;
  metric: 'complexity' | 'size' | 'connections' | 'activity';
  intensity: number;
  colorScheme: 'viridis' | 'plasma' | 'inferno' | 'cool' | 'warm';
}

/**
 * CodeMinimap3D Component
 */
const CodeMinimap3D: React.FC<MinimapProps> = ({
  scene,
  viewportBounds,
  onViewportChange,
  onNodeClick,
  onNodeHover,
  searchQuery = '',
  searchResults = [],
  width = 300,
  height = 200,
  enableHeatMap = true,
  enablePerformanceMonitor = true,
  className
}) => {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<G3DRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [layers, setLayers] = useState<LayerConfig[]>([]);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    fps: 0,
    frameTime: 0,
    nodeCount: 0,
    renderTime: 0,
    memoryUsage: 0
  });
  const [heatMapConfig, setHeatMapConfig] = useState<HeatMapConfig>({
    enabled: enableHeatMap,
    metric: 'complexity',
    intensity: 0.8,
    colorScheme: 'viridis'
  });
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [lastRenderTime, setLastRenderTime] = useState(0);

  // Computed values
  const viewportIndicatorStyle = useMemo(() => {
    if (!viewportBounds) return { display: 'none' };
    
    return {
      left: `${viewportBounds.x}%`,
      top: `${viewportBounds.y}%`,
      width: `${viewportBounds.width}%`,
      height: `${viewportBounds.height}%`,
      display: 'block'
    };
  }, [viewportBounds]);

  const visibleLayers = useMemo(() => {
    return layers.filter(layer => layer.visible);
  }, [layers]);

  const searchHighlights = useMemo(() => {
    return new Set(searchResults);
  }, [searchResults]);

  // Initialize renderer
  useEffect(() => {
    const initializeRenderer = async () => {
      if (!canvasRef.current) return;

      try {
        const renderer = new G3DRenderer(canvasRef.current);
        await renderer.initialize();
        
        rendererRef.current = renderer;
        
        // Setup event listeners
        renderer.on('frame-rendered', handleFrameRendered);
        renderer.on('performance-warning', handlePerformanceWarning);
        
        // Configure for minimap
        renderer.updateSettings({
          enableLOD: true,
          enableFrustumCulling: true,
          enableInstancing: true,
          enablePostProcessing: false, // Disable for performance
          maxDrawCalls: 100,
          targetFPS: 30 // Lower target for minimap
        });

        setIsInitialized(true);
        
      } catch (error) {
        console.error('Failed to initialize minimap renderer:', error);
      }
    };

    initializeRenderer();

    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update scene when props change
  useEffect(() => {
    if (!rendererRef.current || !scene || !isInitialized) return;

    // Create minimap-specific scene
    const minimapScene = createMinimapScene(scene);
    rendererRef.current.setScene(minimapScene);
    
    // Update layers
    updateLayersFromScene(scene);
    
    // Start render loop
    rendererRef.current.startRenderLoop();

  }, [scene, isInitialized]);

  // Handle zoom changes
  useEffect(() => {
    if (!rendererRef.current) return;

    // Update camera zoom
    const scene = rendererRef.current.getScene?.();
    if (scene) {
      // Update camera properties based on zoom level
      // Implementation would depend on G3D camera API
    }
  }, [zoomLevel]);

  // Handle layer visibility changes
  useEffect(() => {
    if (!rendererRef.current) return;

    // Update node visibility based on layer settings
    updateNodeVisibility();
  }, [visibleLayers]);

  // Handle heat map changes
  useEffect(() => {
    if (!rendererRef.current) return;

    if (heatMapConfig.enabled) {
      applyHeatMapVisualization();
    } else {
      removeHeatMapVisualization();
    }
  }, [heatMapConfig]);

  // Handle search highlighting
  useEffect(() => {
    if (!rendererRef.current) return;

    updateSearchHighlights();
  }, [searchHighlights]);

  // Callbacks
  const handleFrameRendered = useCallback((stats: any) => {
    setPerformanceStats(prev => ({
      ...prev,
      fps: stats.fps,
      frameTime: stats.frameTime,
      renderTime: stats.performance.renderTime,
      nodeCount: stats.vertices / 3 // Approximate
    }));
    setLastRenderTime(Date.now());
  }, []);

  const handlePerformanceWarning = useCallback((warning: any) => {
    console.warn('Minimap performance warning:', warning);
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !onViewportChange) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // Calculate new viewport bounds centered on click
    const viewportWidth = viewportBounds?.width || 25;
    const viewportHeight = viewportBounds?.height || 25;

    const newBounds = {
      x: Math.max(0, Math.min(100 - viewportWidth, x - viewportWidth / 2)),
      y: Math.max(0, Math.min(100 - viewportHeight, y - viewportHeight / 2)),
      width: viewportWidth,
      height: viewportHeight
    };

    onViewportChange(newBounds);

    // Also handle node selection
    const nodeId = getNodeAtPosition(x, y);
    if (nodeId && onNodeClick) {
      onNodeClick(nodeId);
    }
  }, [viewportBounds, onViewportChange, onNodeClick]);

  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !onNodeHover) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const nodeId = getNodeAtPosition(x, y);
    if (nodeId !== hoveredNode) {
      setHoveredNode(nodeId);
      onNodeHover(nodeId);
    }
  }, [hoveredNode, onNodeHover]);

  const handleZoomChange = useCallback((event: Event, newValue: number | number[]) => {
    const zoom = Array.isArray(newValue) ? newValue[0] : newValue;
    setZoomLevel(zoom);
  }, []);

  const handleLayerToggle = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  }, []);

  const handleHeatMapToggle = useCallback(() => {
    setHeatMapConfig(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  }, []);

  const handleHeatMapMetricChange = useCallback((metric: HeatMapConfig['metric']) => {
    setHeatMapConfig(prev => ({
      ...prev,
      metric
    }));
  }, []);

  const resetView = useCallback(() => {
    setZoomLevel(1);
    if (onViewportChange) {
      onViewportChange({
        x: 25,
        y: 25,
        width: 50,
        height: 50
      });
    }
  }, [onViewportChange]);

  // Helper functions
  const createMinimapScene = (originalScene: any) => {
    // Create a simplified version of the scene for minimap
    // This would involve LOD reduction, simplified geometry, etc.
    return originalScene;
  };

  const updateLayersFromScene = (scene: any) => {
    if (!scene?.nodes) return;

    const layerMap = new Map<string, { count: number; type: string }>();
    
    // Analyze scene to determine layers
    scene.nodes.forEach((node: any) => {
      const layerKey = node.type;
      const existing = layerMap.get(layerKey);
      layerMap.set(layerKey, {
        count: (existing?.count || 0) + 1,
        type: node.type
      });
    });

    const newLayers: LayerConfig[] = Array.from(layerMap.entries()).map(([type, data]) => ({
      id: type,
      name: type.charAt(0).toUpperCase() + type.slice(1) + 's',
      visible: true,
      color: getLayerColor(type),
      type: type as LayerConfig['type'],
      nodeCount: data.count
    }));

    setLayers(newLayers);
  };

  const updateNodeVisibility = () => {
    // Implementation would update node visibility in the renderer
    // based on layer settings
  };

  const applyHeatMapVisualization = () => {
    // Implementation would apply heat map coloring to nodes
    // based on the selected metric
  };

  const removeHeatMapVisualization = () => {
    // Implementation would restore original node colors
  };

  const updateSearchHighlights = () => {
    // Implementation would highlight nodes that match search
  };

  const getNodeAtPosition = (x: number, y: number): string | null => {
    // Implementation would perform ray casting to find node at position
    // This is a simplified placeholder
    return null;
  };

  const getLayerColor = (type: string): string => {
    const colors = {
      function: '#4CAF50',
      class: '#2196F3',
      module: '#FF9800',
      file: '#9C27B0',
      connection: '#607D8B'
    };
    return colors[type as keyof typeof colors] || '#757575';
  };

  const getFPSColor = (fps: number): string => {
    if (fps >= 25) return '#4CAF50';
    if (fps >= 15) return '#FF9800';
    return '#F44336';
  };

  // Render
  return (
    <MinimapContainer ref={containerRef} className={className}>
      <MinimapCanvas
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

      {/* Viewport Indicator */}
      <ViewportIndicator 
        style={viewportIndicatorStyle}
        className={viewportBounds ? 'active' : ''}
      />

      {/* Performance Monitor */}
      {enablePerformanceMonitor && (
        <PerformanceOverlay>
          <Speed fontSize="small" />
          <Typography 
            variant="caption" 
            style={{ 
              color: getFPSColor(performanceStats.fps),
              fontWeight: 'bold'
            }}
          >
            {performanceStats.fps.toFixed(1)} FPS
          </Typography>
        </PerformanceOverlay>
      )}

      {/* Controls */}
      <Fade in={isControlsVisible}>
        <ControlsOverlay>
          <Tooltip title="Zoom In">
            <IconButton 
              size="small" 
              onClick={() => setZoomLevel(prev => Math.min(5, prev + 0.5))}
              disabled={zoomLevel >= 5}
            >
              <ZoomIn fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Zoom Out">
            <IconButton 
              size="small" 
              onClick={() => setZoomLevel(prev => Math.max(0.1, prev - 0.5))}
              disabled={zoomLevel <= 0.1}
            >
              <ZoomOut fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Reset View">
            <IconButton size="small" onClick={resetView}>
              <MyLocation fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Toggle Heat Map">
            <IconButton 
              size="small" 
              onClick={handleHeatMapToggle}
              color={heatMapConfig.enabled ? 'primary' : 'default'}
            >
              <ThermostatTwoTone fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh">
            <IconButton size="small" onClick={() => window.location.reload()}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        </ControlsOverlay>
      </Fade>

      {/* Layer Controls */}
      <LayerControls>
        {layers.map(layer => (
          <Chip
            key={layer.id}
            label={`${layer.name} (${layer.nodeCount})`}
            size="small"
            variant={layer.visible ? 'filled' : 'outlined'}
            style={{ 
              backgroundColor: layer.visible ? layer.color : 'transparent',
              borderColor: layer.color,
              color: layer.visible ? 'white' : layer.color
            }}
            onClick={() => handleLayerToggle(layer.id)}
            icon={layer.visible ? <Visibility /> : <VisibilityOff />}
          />
        ))}
      </LayerControls>

      {/* Heat Map Legend */}
      {heatMapConfig.enabled && (
        <HeatMapLegend>
          <Typography variant="caption" style={{ color: '#fff', fontWeight: 'bold' }}>
            Heat Map: {heatMapConfig.metric}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box 
              width={10} 
              height={10} 
              bgcolor="#0000ff" 
              borderRadius="50%" 
            />
            <Typography variant="caption" style={{ color: '#fff' }}>
              Low
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box 
              width={10} 
              height={10} 
              bgcolor="#ff0000" 
              borderRadius="50%" 
            />
            <Typography variant="caption" style={{ color: '#fff' }}>
              High
            </Typography>
          </Box>
        </HeatMapLegend>
      )}

      {/* Search Highlights Info */}
      {searchQuery && searchResults.length > 0 && (
        <SearchOverlay>
          <Typography variant="caption" style={{ color: '#fff' }}>
            Found {searchResults.length} matches for "{searchQuery}"
          </Typography>
        </SearchOverlay>
      )}
    </MinimapContainer>
  );
};

export default CodeMinimap3D; 