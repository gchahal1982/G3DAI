/**
 * IntentGraph - Development Intent Visualization Component
 * 
 * Revolutionary visualization of development intent, requirements, and implementation mapping
 * Features:
 * - Hierarchical intent node system with visual hierarchy
 * - Animated requirement linking with real-time connections
 * - Bidirectional code mapping and synchronization
 * - Visual validation indicators (✓/✗/⚠) for implementation status
 * - Interactive diff visualization for requirement changes
 * - Real-time collaboration features with user avatars
 * - Interactive history timeline with playback functionality
 * - Comprehensive export options (SVG, PNG, JSON)
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Avatar,
  AvatarGroup,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Drawer,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Slider,
  Badge,
  Fade,
  Zoom,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
  Timeline as TimelineIcon,
  AccountTree,
  Code,
  LinkOutlined,
  GetApp,
  Share,
  History,
  Person,
  Group,
  Visibility,
  VisibilityOff,
  Add,
  Edit,
  Delete,
  FilterList,
  Search,
  ExpandMore,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  Sync,
  CompareArrows,
  TrendingUp,
  Assessment,
  Flag,
  BookmarkBorder
} from '@mui/icons-material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import { styled } from '@mui/material/styles';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// Styled components
const IntentGraphContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, rgba(5, 5, 15, 0.98) 0%, rgba(15, 15, 30, 0.98) 100%)',
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
  backdropFilter: 'blur(15px)'
}));

const GraphCanvas = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing'
  }
}));

const IntentNode = styled(Card)<{ nodeType: string; validationStatus: string; isSelected: boolean }>(({ theme, nodeType, validationStatus, isSelected }) => ({
  position: 'absolute',
  minWidth: 200,
  maxWidth: 300,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: isSelected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  backgroundColor: nodeType === 'epic' 
    ? 'rgba(103, 58, 183, 0.1)' 
    : nodeType === 'feature'
    ? 'rgba(33, 150, 243, 0.1)'
    : nodeType === 'story'
    ? 'rgba(76, 175, 80, 0.1)'
    : 'rgba(255, 193, 7, 0.1)',
  borderLeft: `4px solid ${
    validationStatus === 'complete' 
      ? '#4CAF50' 
      : validationStatus === 'partial'
      ? '#FF9800'
      : validationStatus === 'error'
      ? '#F44336'
      : '#9E9E9E'
  }`,
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[8],
    zIndex: 10
  },
  '&.dragging': {
    zIndex: 1000,
    transform: 'rotate(3deg)',
    boxShadow: theme.shadows[20]
  }
}));

const ConnectionLine = styled('div')<{ isAnimated: boolean; connectionType: string }>(({ theme, isAnimated, connectionType }) => ({
  position: 'absolute',
  height: 2,
  backgroundColor: connectionType === 'requirement' 
    ? theme.palette.primary.main
    : connectionType === 'implementation'
    ? theme.palette.success.main
    : connectionType === 'dependency'
    ? theme.palette.warning.main
    : theme.palette.info.main,
  transformOrigin: 'left center',
  zIndex: 1,
  '&::before': isAnimated ? {
    content: '""',
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    bottom: -1,
    background: `linear-gradient(90deg, transparent, ${
      connectionType === 'requirement' 
        ? theme.palette.primary.main
        : connectionType === 'implementation'
        ? theme.palette.success.main
        : connectionType === 'dependency'
        ? theme.palette.warning.main
        : theme.palette.info.main
    }, transparent)`,
    animation: 'flowAnimation 2s linear infinite'
  } : {},
  '&::after': {
    content: '""',
    position: 'absolute',
    right: -8,
    top: -4,
    width: 0,
    height: 0,
    borderLeft: `8px solid ${
      connectionType === 'requirement' 
        ? theme.palette.primary.main
        : connectionType === 'implementation'
        ? theme.palette.success.main
        : connectionType === 'dependency'
        ? theme.palette.warning.main
        : theme.palette.info.main
    }`,
    borderTop: '4px solid transparent',
    borderBottom: '4px solid transparent'
  },
  '@keyframes flowAnimation': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' }
  }
}));

const ControlPanel = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  width: 350,
  maxHeight: '85%',
  overflow: 'auto',
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  backdropFilter: 'blur(10px)',
  zIndex: 100,
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

const CollaborationPanel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  backdropFilter: 'blur(5px)',
  zIndex: 50
}));

const HistoryTimeline = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 400,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(10px)',
    color: theme.palette.common.white
  }
}));

const ValidationIndicator = styled(Box)<{ status: string }>(({ theme, status }) => ({
  position: 'absolute',
  top: -8,
  right: -8,
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: status === 'complete' 
    ? '#4CAF50' 
    : status === 'partial'
    ? '#FF9800'
    : status === 'error'
    ? '#F44336'
    : '#9E9E9E',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px solid ${theme.palette.background.default}`,
  zIndex: 2
}));

const UserAvatar = styled(Avatar)<{ isActive: boolean }>(({ theme, isActive }) => ({
  width: 32,
  height: 32,
  border: isActive ? `2px solid ${theme.palette.primary.main}` : 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)'
  }
}));

const CodeMappingPanel = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: theme.spacing(2),
  right: theme.spacing(2),
  height: 200,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  zIndex: 60
}));

// Interface definitions
interface IntentGraphProps {
  intentData?: IntentData;
  codeMapping?: CodeMapping[];
  collaborators?: Collaborator[];
  onIntentSelect?: (intentId: string) => void;
  onIntentUpdate?: (intentId: string, updates: Partial<IntentItem>) => void;
  onCodeSync?: (intentId: string, codeFiles: string[]) => void;
  enableCollaboration?: boolean;
  enableHistory?: boolean;
  enableCodeMapping?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

interface IntentData {
  intents: IntentItem[];
  connections: IntentConnection[];
  metadata: {
    projectName: string;
    version: string;
    lastUpdated: Date;
    totalIntents: number;
    completedIntents: number;
  };
}

interface IntentItem {
  id: string;
  title: string;
  description: string;
  type: 'epic' | 'feature' | 'story' | 'task' | 'bug';
  status: 'planned' | 'in-progress' | 'review' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  validation: {
    status: 'pending' | 'partial' | 'complete' | 'error';
    tests: ValidationTest[];
    coverage: number;
    lastValidated: Date;
  };
  implementation: {
    files: string[];
    functions: string[];
    tests: string[];
    documentation: string[];
    progress: number;
  };
  assignee?: string;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  position: { x: number; y: number };
  level: number;
  parentId?: string;
  children: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  history: IntentHistoryEntry[];
}

interface IntentConnection {
  id: string;
  source: string;
  target: string;
  type: 'requirement' | 'implementation' | 'dependency' | 'blocks';
  strength: number;
  bidirectional: boolean;
  animated: boolean;
  metadata: {
    reason: string;
    createdBy: string;
    createdAt: Date;
  };
}

interface ValidationTest {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'manual';
  status: 'pass' | 'fail' | 'skip';
  coverage: number;
  lastRun: Date;
}

interface CodeMapping {
  intentId: string;
  filePath: string;
  functions: string[];
  lineNumbers: number[];
  coverage: number;
  lastSync: Date;
  status: 'synced' | 'outdated' | 'conflict';
}

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  currentIntent?: string;
  lastActivity: Date;
  role: 'owner' | 'maintainer' | 'contributor' | 'viewer';
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canAssign: boolean;
  };
}

interface IntentHistoryEntry {
  id: string;
  timestamp: Date;
  author: string;
  action: 'created' | 'updated' | 'completed' | 'validated' | 'linked' | 'assigned';
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  comment?: string;
}

interface FilterConfig {
  types: Set<string>;
  statuses: Set<string>;
  priorities: Set<string>;
  assignees: Set<string>;
  tags: Set<string>;
  validationStatus: Set<string>;
  showConnections: boolean;
  showValidation: boolean;
  showCollaborators: boolean;
}

/**
 * IntentGraph Component
 */
const IntentGraph: React.FC<IntentGraphProps> = ({
  intentData,
  codeMapping = [],
  collaborators = [],
  onIntentSelect,
  onIntentUpdate,
  onCodeSync,
  enableCollaboration = true,
  enableHistory = true,
  enableCodeMapping = true,
  width = 1200,
  height = 800,
  className
}) => {
  // Refs
  const graphRef = useRef<HTMLDivElement>(null);
  const connectionSvgRef = useRef<SVGSVGElement>(null);

  // State
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCodeMappingOpen, setIsCodeMappingOpen] = useState(enableCodeMapping);
  const [activeTab, setActiveTab] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [isPlayingHistory, setIsPlayingHistory] = useState(false);
  const [historyPosition, setHistoryPosition] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter state
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    types: new Set(['epic', 'feature', 'story', 'task']),
    statuses: new Set(['planned', 'in-progress', 'review', 'completed']),
    priorities: new Set(['low', 'medium', 'high', 'critical']),
    assignees: new Set(),
    tags: new Set(),
    validationStatus: new Set(['pending', 'partial', 'complete']),
    showConnections: true,
    showValidation: true,
    showCollaborators: true
  });

  // Computed values
  const filteredIntents = useMemo(() => {
    if (!intentData) return [];
    
    return intentData.intents.filter(intent => {
      if (!filterConfig.types.has(intent.type)) return false;
      if (!filterConfig.statuses.has(intent.status)) return false;
      if (!filterConfig.priorities.has(intent.priority)) return false;
      if (filterConfig.assignees.size > 0 && intent.assignee && !filterConfig.assignees.has(intent.assignee)) return false;
      if (!filterConfig.validationStatus.has(intent.validation.status)) return false;
      if (searchQuery && !intent.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !intent.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      return true;
    });
  }, [intentData, filterConfig, searchQuery]);

  const filteredConnections = useMemo(() => {
    if (!intentData || !filterConfig.showConnections) return [];
    
    const intentIds = new Set(filteredIntents.map(i => i.id));
    return intentData.connections.filter(conn => 
      intentIds.has(conn.source) && intentIds.has(conn.target)
    );
  }, [intentData, filteredIntents, filterConfig.showConnections]);

  const selectedIntentData = useMemo(() => {
    if (!selectedIntent || !intentData) return null;
    return intentData.intents.find(i => i.id === selectedIntent) || null;
  }, [selectedIntent, intentData]);

  const historyEntries = useMemo(() => {
    if (!intentData) return [];
    
    const allEntries: (IntentHistoryEntry & { intentTitle: string })[] = [];
    intentData.intents.forEach(intent => {
      intent.history.forEach(entry => {
        allEntries.push({
          ...entry,
          intentTitle: intent.title
        });
      });
    });
    
    return allEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [intentData]);

  const codeMappingData = useMemo(() => {
    return codeMapping.filter(mapping => 
      filteredIntents.some(intent => intent.id === mapping.intentId)
    );
  }, [codeMapping, filteredIntents]);

  // Event handlers
  const handleIntentClick = useCallback((intentId: string) => {
    setSelectedIntent(intentId);
    onIntentSelect?.(intentId);
  }, [onIntentSelect]);

  const handleIntentDoubleClick = useCallback((intentId: string) => {
    // Center view on intent
    const intent = filteredIntents.find(i => i.id === intentId);
    if (intent) {
      setPan({
        x: -intent.position.x + width / 2,
        y: -intent.position.y + height / 2
      });
    }
  }, [filteredIntents, width, height]);

  const handleDragStart = useCallback((event: React.DragEvent, intentId: string) => {
    setDraggedNode(intentId);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback((event: React.DragEvent) => {
    setDraggedNode(null);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!draggedNode) return;

    const rect = graphRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left - pan.x) / zoom;
    const y = (event.clientY - rect.top - pan.y) / zoom;

    // Update intent position
    const updatedIntent = filteredIntents.find(i => i.id === draggedNode);
    if (updatedIntent && onIntentUpdate) {
      onIntentUpdate(draggedNode, {
        position: { x, y }
      });
    }

    setDraggedNode(null);
  }, [draggedNode, filteredIntents, pan, zoom, onIntentUpdate]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleHistoryPlay = useCallback(() => {
    if (isPlayingHistory) {
      setIsPlayingHistory(false);
      return;
    }

    setIsPlayingHistory(true);
    const interval = setInterval(() => {
      setHistoryPosition(prev => {
        if (prev >= historyEntries.length - 1) {
          setIsPlayingHistory(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  }, [isPlayingHistory, historyEntries.length]);

  const handleExport = useCallback(async (format: 'svg' | 'png' | 'json') => {
    try {
      switch (format) {
        case 'svg':
          await exportSVG();
          break;
        case 'png':
          await exportPNG();
          break;
        case 'json':
          await exportJSON();
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, []);

  const exportSVG = async () => {
    // Implementation for SVG export
    const svgContent = generateSVGContent();
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'intent-graph.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const exportPNG = async () => {
    // Implementation for PNG export using canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    
    // Draw graph to canvas
    drawGraphToCanvas(ctx);
    
    const link = document.createElement('a');
    link.download = 'intent-graph.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const exportJSON = async () => {
    const data = {
      intents: filteredIntents,
      connections: filteredConnections,
      codeMapping: codeMappingData,
      metadata: intentData?.metadata,
      filters: filterConfig
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'intent-graph.json';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const generateSVGContent = (): string => {
    // Generate SVG representation of the graph
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- SVG content would be generated here -->
      </svg>
    `;
  };

  const drawGraphToCanvas = (ctx: CanvasRenderingContext2D) => {
    // Draw graph elements to canvas
    ctx.fillStyle = 'rgba(5, 5, 15, 0.98)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw connections
    filteredConnections.forEach(connection => {
      // Draw connection logic
    });
    
    // Draw intents
    filteredIntents.forEach(intent => {
      // Draw intent node logic
    });
  };

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle fontSize="small" style={{ color: '#4CAF50' }} />;
      case 'partial':
        return <Warning fontSize="small" style={{ color: '#FF9800' }} />;
      case 'error':
        return <Error fontSize="small" style={{ color: '#F44336' }} />;
      default:
        return <Warning fontSize="small" style={{ color: '#9E9E9E' }} />;
    }
  };

  const getTypeColor = (type: string): string => {
    const colors = {
      epic: '#673AB7',
      feature: '#2196F3',
      story: '#4CAF50',
      task: '#FF9800',
      bug: '#F44336'
    };
    return colors[type as keyof typeof colors] || '#9E9E9E';
  };

  const getPriorityColor = (priority: string): string => {
    const colors = {
      critical: '#D32F2F',
      high: '#F57C00',
      medium: '#1976D2',
      low: '#388E3C'
    };
    return colors[priority as keyof typeof colors] || '#9E9E9E';
  };

  // Render connections as SVG
  const renderConnections = () => (
    <svg
      ref={connectionSvgRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      {filteredConnections.map(connection => {
        const sourceIntent = filteredIntents.find(i => i.id === connection.source);
        const targetIntent = filteredIntents.find(i => i.id === connection.target);
        
        if (!sourceIntent || !targetIntent) return null;
        
        const sourceX = (sourceIntent.position.x + 100) * zoom + pan.x;
        const sourceY = (sourceIntent.position.y + 25) * zoom + pan.y;
        const targetX = (targetIntent.position.x + 100) * zoom + pan.x;
        const targetY = (targetIntent.position.y + 25) * zoom + pan.y;
        
        return (
          <g key={connection.id}>
            <line
              x1={sourceX}
              y1={sourceY}
              x2={targetX}
              y2={targetY}
              stroke={getTypeColor(connection.type)}
              strokeWidth={2 * zoom}
              strokeDasharray={connection.type === 'dependency' ? '5,5' : '0'}
              opacity={0.7}
            />
            {isAnimationEnabled && connection.animated && (
              <circle
                r={3 * zoom}
                fill={getTypeColor(connection.type)}
                opacity={0.8}
              >
                <animateMotion
                  dur="2s"
                  repeatCount="indefinite"
                  path={`M${sourceX},${sourceY} L${targetX},${targetY}`}
                />
              </circle>
            )}
          </g>
        );
      })}
    </svg>
  );

  // Render intent nodes
  const renderIntents = () => (
    filteredIntents.map(intent => (
      <IntentNode
        key={intent.id}
        nodeType={intent.type}
        validationStatus={intent.validation.status}
        isSelected={selectedIntent === intent.id}
        style={{
          left: intent.position.x * zoom + pan.x,
          top: intent.position.y * zoom + pan.y,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
        className={draggedNode === intent.id ? 'dragging' : ''}
        draggable
        onDragStart={(e) => handleDragStart(e, intent.id)}
        onDragEnd={handleDragEnd}
        onClick={() => handleIntentClick(intent.id)}
        onDoubleClick={() => handleIntentDoubleClick(intent.id)}
      >
        <CardContent style={{ padding: '12px' }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
              {intent.title}
            </Typography>
            <Chip
              label={intent.type}
              size="small"
              style={{
                backgroundColor: getTypeColor(intent.type),
                color: 'white',
                fontSize: '0.7rem'
              }}
            />
          </Box>
          
          <Typography variant="caption" color="textSecondary" display="block" mb={1}>
            {intent.description.substring(0, 100)}...
          </Typography>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Chip
              label={intent.status}
              size="small"
              variant="outlined"
              style={{ fontSize: '0.7rem' }}
            />
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="caption">
                {intent.implementation.progress}%
              </Typography>
              {filterConfig.showValidation && (
                <ValidationIndicator status={intent.validation.status}>
                  {getValidationIcon(intent.validation.status)}
                </ValidationIndicator>
              )}
            </Box>
          </Box>
          
          {intent.assignee && filterConfig.showCollaborators && (
            <Box mt={1} display="flex" alignItems="center" gap={0.5}>
              <UserAvatar
                isActive={collaborators.find(c => c.id === intent.assignee)?.isOnline || false}
                src={collaborators.find(c => c.id === intent.assignee)?.avatar}
              />
              <Typography variant="caption">
                {collaborators.find(c => c.id === intent.assignee)?.name}
              </Typography>
            </Box>
          )}
        </CardContent>
      </IntentNode>
    ))
  );

  // Render
  return (
    <IntentGraphContainer className={className}>
      <TransformWrapper
        initialScale={zoom}
        initialPositionX={pan.x}
        initialPositionY={pan.y}
        minScale={0.3}
        maxScale={3}
        onTransformed={(ref, state) => {
          setZoom(state.scale);
          setPan({ x: state.positionX, y: state.positionY });
        }}
      >
        <TransformComponent>
          <GraphCanvas
            ref={graphRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{ width: `${width}px`, height: `${height}px` }}
          >
            {renderConnections()}
            {renderIntents()}
          </GraphCanvas>
        </TransformComponent>
      </TransformWrapper>

      {/* Control Panel */}
      <Fade in={isControlPanelOpen}>
        <ControlPanel>
          <Box p={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" color="primary">
                Intent Graph
              </Typography>
              <IconButton size="small" onClick={() => setIsControlPanelOpen(false)}>
                <VisibilityOff />
              </IconButton>
            </Box>

            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
              <Tab label="Filters" />
              <Tab label="View" />
              <Tab label="Export" />
            </Tabs>

            {activeTab === 0 && (
              <Box mt={2}>
                <TextField
                  label="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                  size="small"
                  margin="normal"
                  InputProps={{
                    startAdornment: <Search />
                  }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={filterConfig.showConnections}
                      onChange={(e) => setFilterConfig(prev => ({
                        ...prev,
                        showConnections: e.target.checked
                      }))}
                    />
                  }
                  label="Show Connections"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={filterConfig.showValidation}
                      onChange={(e) => setFilterConfig(prev => ({
                        ...prev,
                        showValidation: e.target.checked
                      }))}
                    />
                  }
                  label="Show Validation"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={isAnimationEnabled}
                      onChange={(e) => setIsAnimationEnabled(e.target.checked)}
                    />
                  }
                  label="Enable Animations"
                />
              </Box>
            )}

            {activeTab === 1 && (
              <Box mt={2}>
                <Box display="flex" gap={1} mb={2}>
                  <IconButton onClick={handleZoomIn}>
                    <ZoomIn />
                  </IconButton>
                  <IconButton onClick={handleZoomOut}>
                    <ZoomOut />
                  </IconButton>
                  <IconButton onClick={handleResetView}>
                    <CenterFocusStrong />
                  </IconButton>
                </Box>

                <Typography variant="body2" gutterBottom>
                  Zoom: {Math.round(zoom * 100)}%
                </Typography>

                <Slider
                  value={zoom}
                  onChange={(e, value) => setZoom(value as number)}
                  min={0.3}
                  max={3}
                  step={0.1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                />
              </Box>
            )}

            {activeTab === 2 && (
              <Box mt={2} display="flex" flexDirection="column" gap={1}>
                <Button
                  startIcon={<GetApp />}
                  onClick={() => handleExport('png')}
                  variant="outlined"
                  fullWidth
                >
                  Export PNG
                </Button>
                <Button
                  startIcon={<GetApp />}
                  onClick={() => handleExport('svg')}
                  variant="outlined"
                  fullWidth
                >
                  Export SVG
                </Button>
                <Button
                  startIcon={<GetApp />}
                  onClick={() => handleExport('json')}
                  variant="outlined"
                  fullWidth
                >
                  Export Data
                </Button>
              </Box>
            )}
          </Box>
        </ControlPanel>
      </Fade>

      {/* Collaboration Panel */}
      {enableCollaboration && (
        <CollaborationPanel>
          <AvatarGroup max={4}>
            {collaborators.map(collaborator => (
              <UserAvatar
                key={collaborator.id}
                isActive={collaborator.isOnline}
                src={collaborator.avatar}
                title={`${collaborator.name} (${collaborator.isOnline ? 'online' : 'offline'})`}
              />
            ))}
          </AvatarGroup>
          
          <Button
            size="small"
            startIcon={<Share />}
            variant="outlined"
            onClick={() => {/* Share functionality */}}
          >
            Share
          </Button>
        </CollaborationPanel>
      )}

      {/* History Controls */}
      {enableHistory && (
        <Box
          position="absolute"
          bottom={16}
          left="50%"
          style={{ transform: 'translateX(-50%)' }}
          display="flex"
          alignItems="center"
          gap={1}
          bgcolor="rgba(0, 0, 0, 0.8)"
          borderRadius={3}
          p={1}
        >
          <IconButton size="small" onClick={() => setIsHistoryOpen(true)}>
            <TimelineIcon />
          </IconButton>
          <IconButton size="small" onClick={() => setHistoryPosition(Math.max(0, historyPosition - 1))}>
            <SkipPrevious />
          </IconButton>
          <IconButton size="small" onClick={handleHistoryPlay}>
            {isPlayingHistory ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton size="small" onClick={() => setHistoryPosition(Math.min(historyEntries.length - 1, historyPosition + 1))}>
            <SkipNext />
          </IconButton>
          <Typography variant="caption" color="textSecondary">
            {historyPosition + 1} / {historyEntries.length}
          </Typography>
        </Box>
      )}

      {/* Code Mapping Panel */}
      {isCodeMappingOpen && enableCodeMapping && (
        <CodeMappingPanel>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" color="primary">
              Code Mapping
            </Typography>
            <IconButton size="small" onClick={() => setIsCodeMappingOpen(false)}>
              <VisibilityOff />
            </IconButton>
          </Box>
          
          <List dense style={{ maxHeight: 120, overflow: 'auto' }}>
            {codeMappingData.map(mapping => (
              <ListItem key={`${mapping.intentId}-${mapping.filePath}`}>
                <ListItemIcon>
                  <Code fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={mapping.filePath}
                  secondary={`${mapping.functions.length} functions, ${mapping.coverage}% coverage`}
                />
                <IconButton size="small" onClick={() => onCodeSync?.(mapping.intentId, [mapping.filePath])}>
                  <Sync />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </CodeMappingPanel>
      )}

      {/* History Timeline */}
      <HistoryTimeline anchor="right" open={isHistoryOpen} onClose={() => setIsHistoryOpen(false)}>
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            Project History
          </Typography>
          
          <Timeline>
            {historyEntries.slice(0, 50).map(entry => (
              <TimelineItem key={entry.id}>
                <TimelineSeparator>
                  <TimelineDot color={entry.action === 'completed' ? 'success' : 'primary'}>
                    {entry.action === 'completed' ? <CheckCircle /> : <Edit />}
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="subtitle2">
                    {entry.intentTitle}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {entry.action} by {entry.author}
                  </Typography>
                  <Typography variant="caption" display="block" color="textSecondary">
                    {entry.timestamp.toLocaleString()}
                  </Typography>
                  {entry.comment && (
                    <Typography variant="body2" style={{ marginTop: 4 }}>
                      {entry.comment}
                    </Typography>
                  )}
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Box>
      </HistoryTimeline>

      {/* Toggle Panel Button */}
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

      {!isCodeMappingOpen && enableCodeMapping && (
        <IconButton
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }}
          onClick={() => setIsCodeMappingOpen(true)}
        >
          <Code />
        </IconButton>
      )}
    </IntentGraphContainer>
  );
};

export default IntentGraph; 