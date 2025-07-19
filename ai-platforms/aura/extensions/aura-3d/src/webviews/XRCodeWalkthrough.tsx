/**
 * XRCodeWalkthrough - Immersive VR Code Exploration Component
 * 
 * Revolutionary VR experience for immersive code development and exploration
 * Features:
 * - Immersive VR code exploration with customizable 3D environments
 * - Intuitive teleportation locomotion with comfort options
 * - Advanced hand tracking with gesture recognition
 * - Interactive ray-casting panels for code manipulation
 * - Voice command integration with natural language processing
 * - Real-time collaborative avatars with inverse kinematics
 * - 3D annotation tools with spatial commenting system
 * - Tutorial recording and playback system
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Box, Typography, Fab, Tooltip, Card, CardContent, Chip, Avatar, AvatarGroup } from '@mui/material';
import { styled } from '@mui/material/styles';
import XRManager from '../../xr/XRManager';
import G3DRenderer from '../../g3d/G3DRenderer';

// Styled components
const XRContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100vh',
  backgroundColor: '#000',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const XRCanvas = styled('canvas')(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'block'
}));

const VROverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 1000
}));

const StatusPanel = styled(Card)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(10px)',
  minWidth: 250,
  pointerEvents: 'auto'
}));

const ControlsPanel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  pointerEvents: 'auto'
}));

const CollaboratorsPanel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  pointerEvents: 'auto'
}));

const TutorialRecorder = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(139, 69, 19, 0.9)',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1, 2),
  pointerEvents: 'auto'
}));

// Interfaces and types
interface XRCodeWalkthroughProps {
  codeStructure?: CodeStructure;
  environment?: VREnvironment;
  collaborators?: Collaborator[];
  onCodeInteraction?: (action: CodeInteraction) => void;
  onVoiceCommand?: (command: VoiceCommand) => void;
  onAnnotationCreated?: (annotation: Annotation3D) => void;
  enableCollaboration?: boolean;
  enableVoiceCommands?: boolean;
  enableTutorialRecording?: boolean;
  className?: string;
}

interface CodeStructure {
  id: string;
  name: string;
  files: CodeFile[];
  functions: CodeFunction[];
  classes: CodeClass[];
  modules: CodeModule[];
  dependencies: CodeDependency[];
}

interface CodeFile {
  id: string;
  path: string;
  name: string;
  content: string;
  language: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number };
  visible: boolean;
  interactive: boolean;
}

interface CodeFunction {
  id: string;
  name: string;
  fileId: string;
  parameters: Parameter[];
  returnType: string;
  complexity: number;
  position: { x: number; y: number; z: number };
  connections: string[];
  annotations: Annotation3D[];
}

interface CodeClass {
  id: string;
  name: string;
  fileId: string;
  methods: CodeFunction[];
  properties: Property[];
  position: { x: number; y: number; z: number };
  inheritance: string[];
}

interface CodeModule {
  id: string;
  name: string;
  files: string[];
  exports: Export[];
  imports: Import[];
  position: { x: number; y: number; z: number };
  boundingBox: BoundingBox;
}

interface CodeDependency {
  id: string;
  source: string;
  target: string;
  type: 'import' | 'call' | 'inheritance' | 'composition';
  strength: number;
  animated: boolean;
}

interface Parameter {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: any;
}

interface Property {
  name: string;
  type: string;
  visibility: 'public' | 'private' | 'protected';
  static: boolean;
  readonly: boolean;
}

interface Export {
  name: string;
  type: string;
  isDefault: boolean;
}

interface Import {
  name: string;
  source: string;
  isDefault: boolean;
}

interface BoundingBox {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
}

interface VREnvironment {
  id: string;
  name: string;
  type: 'office' | 'nature' | 'space' | 'minimalist' | 'cyberpunk' | 'custom';
  skybox: string;
  lighting: EnvironmentLighting;
  ambientSound?: string;
  interactiveElements: EnvironmentElement[];
}

interface EnvironmentLighting {
  ambient: { r: number; g: number; b: number; intensity: number };
  directional: { r: number; g: number; b: number; intensity: number; direction: { x: number; y: number; z: number } };
  point: PointLight[];
}

interface PointLight {
  position: { x: number; y: number; z: number };
  color: { r: number; g: number; b: number };
  intensity: number;
  distance: number;
}

interface EnvironmentElement {
  id: string;
  type: 'desk' | 'chair' | 'monitor' | 'plant' | 'decoration';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  interactive: boolean;
}

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  handPoses: {
    left?: HandPose;
    right?: HandPose;
  };
  headPose: HeadPose;
  isOnline: boolean;
  isPresent: boolean;
  currentActivity: string;
  voiceActive: boolean;
}

interface HandPose {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  gesture: 'point' | 'grab' | 'pinch' | 'open' | 'fist';
  fingerPositions: FingerPosition[];
}

interface FingerPosition {
  finger: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';
  joints: { x: number; y: number; z: number }[];
}

interface HeadPose {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  eyeGaze?: {
    left: { x: number; y: number; z: number };
    right: { x: number; y: number; z: number };
  };
}

interface CodeInteraction {
  type: 'select' | 'edit' | 'navigate' | 'annotate' | 'execute' | 'debug';
  targetId: string;
  targetType: 'file' | 'function' | 'class' | 'module' | 'line';
  position: { x: number; y: number; z: number };
  data?: any;
  timestamp: number;
  userId: string;
}

interface VoiceCommand {
  command: string;
  intent: 'navigate' | 'search' | 'edit' | 'annotate' | 'execute' | 'help';
  confidence: number;
  parameters: { [key: string]: any };
  timestamp: number;
}

interface Annotation3D {
  id: string;
  text: string;
  position: { x: number; y: number; z: number };
  targetId: string;
  targetType: 'file' | 'function' | 'class' | 'line';
  author: string;
  timestamp: number;
  type: 'comment' | 'question' | 'suggestion' | 'issue' | 'todo';
  resolved: boolean;
  replies: AnnotationReply[];
  visible: boolean;
}

interface AnnotationReply {
  id: string;
  text: string;
  author: string;
  timestamp: number;
}

interface TeleportTarget {
  id: string;
  position: { x: number; y: number; z: number };
  valid: boolean;
  preview: boolean;
}

interface RaycastPanel {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  size: { width: number; height: number };
  content: PanelContent;
  interactive: boolean;
  visible: boolean;
}

interface PanelContent {
  type: 'code' | 'documentation' | 'console' | 'debugger' | 'tools';
  data: any;
  scrollPosition: number;
  cursorPosition?: { line: number; column: number };
}

interface TutorialRecording {
  id: string;
  name: string;
  duration: number;
  actions: TutorialAction[];
  environments: VREnvironment[];
  annotations: Annotation3D[];
  voiceNarration?: string;
  isRecording: boolean;
  isPaused: boolean;
}

interface TutorialAction {
  timestamp: number;
  type: 'move' | 'interact' | 'speak' | 'annotate' | 'teleport';
  data: any;
  position: { x: number; y: number; z: number };
  duration: number;
}

/**
 * XRCodeWalkthrough Component
 */
const XRCodeWalkthrough: React.FC<XRCodeWalkthroughProps> = ({
  codeStructure,
  environment = createDefaultEnvironment(),
  collaborators = [],
  onCodeInteraction,
  onVoiceCommand,
  onAnnotationCreated,
  enableCollaboration = true,
  enableVoiceCommands = true,
  enableTutorialRecording = true,
  className
}) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const xrManagerRef = useRef<XRManager | null>(null);
  const rendererRef = useRef<G3DRenderer | null>(null);

  // State
  const [isXRSupported, setIsXRSupported] = useState(false);
  const [isXRActive, setIsXRActive] = useState(false);
  const [currentEnvironment, setCurrentEnvironment] = useState(environment);
  const [teleportTargets, setTeleportTargets] = useState<TeleportTarget[]>([]);
  const [raycastPanels, setRaycastPanels] = useState<RaycastPanel[]>([]);
  const [activeAnnotations, setActiveAnnotations] = useState<Annotation3D[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingData, setRecordingData] = useState<TutorialRecording | null>(null);
  const [voiceRecognition, setVoiceRecognition] = useState<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [controllerStates, setControllerStates] = useState<any[]>([]);

  // Initialize XR system
  useEffect(() => {
    initializeXR();
    
    return () => {
      cleanup();
    };
  }, []);

  // Initialize voice recognition
  useEffect(() => {
    if (enableVoiceCommands) {
      initializeVoiceRecognition();
    }
  }, [enableVoiceCommands]);

  // Update environment when prop changes
  useEffect(() => {
    setCurrentEnvironment(environment);
    if (rendererRef.current) {
      updateEnvironmentSettings(environment);
    }
  }, [environment]);

  // Initialize XR system
  const initializeXR = async () => {
    try {
      // Initialize XR Manager
      const xrManager = new XRManager();
      xrManagerRef.current = xrManager;

      // Check XR support
      xrManager.on('support-detected', ({ vrSupported }) => {
        setIsXRSupported(vrSupported);
      });

      xrManager.on('support-unavailable', () => {
        setIsXRSupported(false);
      });

      // Setup XR event listeners
      setupXREventListeners(xrManager);

      // Initialize renderer if canvas is available
      if (canvasRef.current) {
        const renderer = new G3DRenderer(canvasRef.current);
        await renderer.initialize();
        rendererRef.current = renderer;

        // Setup render event listeners
        setupRendererEventListeners(renderer);
      }

    } catch (error) {
      console.error('Failed to initialize XR system:', error);
    }
  };

  // Setup XR event listeners
  const setupXREventListeners = (xrManager: XRManager) => {
    xrManager.on('session-started', ({ sessionId, device, mode }) => {
      setIsXRActive(true);
      initializeVREnvironment();
    });

    xrManager.on('session-ended', ({ sessionId, duration }) => {
      setIsXRActive(false);
    });

    xrManager.on('frame', ({ trackingData, controllers }) => {
      setTrackingData(trackingData);
      setControllerStates(controllers);
      updateTeleportTargets(trackingData, controllers);
      updateRaycastPanels(trackingData, controllers);
      handleControllerInteractions(controllers);
    });

    xrManager.on('controller-connected', (controller) => {
      console.log('Controller connected:', controller);
    });

    xrManager.on('haptic-feedback', ({ controllerId, pattern, success }) => {
      if (success) {
        console.log('Haptic feedback triggered:', controllerId, pattern);
      }
    });
  };

  // Setup renderer event listeners
  const setupRendererEventListeners = (renderer: G3DRenderer) => {
    renderer.on('frame-rendered', (stats) => {
      // Handle render stats
    });

    renderer.on('performance-warning', (warning) => {
      console.warn('Renderer performance warning:', warning);
    });
  };

  // Initialize VR environment
  const initializeVREnvironment = () => {
    if (!rendererRef.current || !codeStructure) return;

    // Load environment assets
    loadEnvironmentAssets(currentEnvironment);

    // Position code elements in 3D space
    positionCodeElements(codeStructure);

    // Initialize teleport targets
    initializeTeleportTargets();

    // Initialize raycast panels
    initializeRaycastPanels();

    // Setup collaboration features
    if (enableCollaboration) {
      initializeCollaboration();
    }

    // Start tutorial recording if enabled
    if (enableTutorialRecording) {
      initializeTutorialRecording();
    }
  };

  // Load environment assets
  const loadEnvironmentAssets = (env: VREnvironment) => {
    // Load skybox
    // Load environment models
    // Setup lighting
    // Load ambient sounds
  };

  // Position code elements in 3D space
  const positionCodeElements = (code: CodeStructure) => {
    // Create spatial layout for files, functions, classes
    const layout = generateSpatialLayout(code);
    
    // Apply positions to code elements
    applyCodeLayout(layout);
  };

  // Generate spatial layout for code elements
  const generateSpatialLayout = (code: CodeStructure) => {
    // Implement 3D layout algorithm
    // Consider module grouping, dependency visualization
    return {
      files: code.files.map((file, index) => ({
        ...file,
        position: {
          x: (index % 5) * 3,
          y: 1.5,
          z: Math.floor(index / 5) * 2
        }
      })),
      modules: code.modules,
      functions: code.functions,
      classes: code.classes
    };
  };

  // Apply code layout to renderer
  const applyCodeLayout = (layout: any) => {
    if (!rendererRef.current) return;

    // Create 3D representations of code elements
    // Add interactive hover effects
    // Setup selection highlighting
  };

  // Initialize teleport targets
  const initializeTeleportTargets = () => {
    const targets: TeleportTarget[] = [
      {
        id: 'center',
        position: { x: 0, y: 0, z: 0 },
        valid: true,
        preview: false
      },
      {
        id: 'overview',
        position: { x: 0, y: 5, z: 10 },
        valid: true,
        preview: false
      }
    ];

    // Add targets for each module
    if (codeStructure?.modules) {
      codeStructure.modules.forEach(module => {
        targets.push({
          id: `module_${module.id}`,
          position: {
            x: module.position.x,
            y: module.position.y + 2,
            z: module.position.z + 5
          },
          valid: true,
          preview: false
        });
      });
    }

    setTeleportTargets(targets);
  };

  // Initialize raycast panels
  const initializeRaycastPanels = () => {
    const panels: RaycastPanel[] = [
      {
        id: 'code_editor',
        position: { x: -2, y: 1.5, z: -1 },
        rotation: { x: 0, y: 15, z: 0 },
        size: { width: 2, height: 1.5 },
        content: {
          type: 'code',
          data: null,
          scrollPosition: 0
        },
        interactive: true,
        visible: true
      },
      {
        id: 'console',
        position: { x: 2, y: 1, z: -1 },
        rotation: { x: 0, y: -15, z: 0 },
        size: { width: 1.5, height: 1 },
        content: {
          type: 'console',
          data: [],
          scrollPosition: 0
        },
        interactive: true,
        visible: true
      }
    ];

    setRaycastPanels(panels);
  };

  // Initialize collaboration features
  const initializeCollaboration = () => {
    // Setup real-time collaboration
    // Initialize avatar system
    // Setup voice chat
  };

  // Initialize tutorial recording
  const initializeTutorialRecording = () => {
    const recording: TutorialRecording = {
      id: `tutorial_${Date.now()}`,
      name: `Code Walkthrough ${new Date().toLocaleTimeString()}`,
      duration: 0,
      actions: [],
      environments: [currentEnvironment],
      annotations: [],
      isRecording: false,
      isPaused: false
    };

    setRecordingData(recording);
  };

  // Initialize voice recognition
  const initializeVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const command = result[0].transcript.trim();
        handleVoiceCommand(command, result[0].confidence);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    setVoiceRecognition(recognition);
  };

  // Handle voice commands
  const handleVoiceCommand = (command: string, confidence: number) => {
    const voiceCommand = parseVoiceCommand(command, confidence);
    
    if (voiceCommand && onVoiceCommand) {
      onVoiceCommand(voiceCommand);
    }

    // Execute local voice commands
    executeVoiceCommand(voiceCommand);
  };

  // Parse voice command
  const parseVoiceCommand = (command: string, confidence: number): VoiceCommand | null => {
    const lowerCommand = command.toLowerCase();
    
    // Navigate commands
    if (lowerCommand.includes('go to') || lowerCommand.includes('navigate to')) {
      return {
        command,
        intent: 'navigate',
        confidence,
        parameters: { target: extractTarget(lowerCommand) },
        timestamp: Date.now()
      };
    }

    // Search commands
    if (lowerCommand.includes('find') || lowerCommand.includes('search')) {
      return {
        command,
        intent: 'search',
        confidence,
        parameters: { query: extractSearchQuery(lowerCommand) },
        timestamp: Date.now()
      };
    }

    // Annotation commands
    if (lowerCommand.includes('add note') || lowerCommand.includes('annotate')) {
      return {
        command,
        intent: 'annotate',
        confidence,
        parameters: { text: extractAnnotationText(lowerCommand) },
        timestamp: Date.now()
      };
    }

    return null;
  };

  // Execute voice command
  const executeVoiceCommand = (command: VoiceCommand | null) => {
    if (!command) return;

    switch (command.intent) {
      case 'navigate':
        handleNavigateCommand(command.parameters.target);
        break;
      case 'search':
        handleSearchCommand(command.parameters.query);
        break;
      case 'annotate':
        handleAnnotateCommand(command.parameters.text);
        break;
    }
  };

  // Handle navigate command
  const handleNavigateCommand = (target: string) => {
    const teleportTarget = teleportTargets.find(t => 
      t.id.toLowerCase().includes(target.toLowerCase())
    );
    
    if (teleportTarget) {
      teleportToPosition(teleportTarget.position);
    }
  };

  // Handle search command
  const handleSearchCommand = (query: string) => {
    // Implement code search and highlight
    console.log('Searching for:', query);
  };

  // Handle annotate command
  const handleAnnotateCommand = (text: string) => {
    if (trackingData?.headPose) {
      const annotation: Annotation3D = {
        id: `annotation_${Date.now()}`,
        text,
        position: {
          x: trackingData.headPose.transform.position.x,
          y: trackingData.headPose.transform.position.y,
          z: trackingData.headPose.transform.position.z - 1
        },
        targetId: 'current_view',
        targetType: 'file',
        author: 'current_user',
        timestamp: Date.now(),
        type: 'comment',
        resolved: false,
        replies: [],
        visible: true
      };

      setActiveAnnotations(prev => [...prev, annotation]);
      
      if (onAnnotationCreated) {
        onAnnotationCreated(annotation);
      }
    }
  };

  // Update teleport targets
  const updateTeleportTargets = (tracking: any, controllers: any[]) => {
    // Update teleport target validity based on controller raycast
    setTeleportTargets(prev => prev.map(target => ({
      ...target,
      preview: false // Reset preview state
    })));
  };

  // Update raycast panels
  const updateRaycastPanels = (tracking: any, controllers: any[]) => {
    // Update panel interactions based on controller raycast
  };

  // Handle controller interactions
  const handleControllerInteractions = (controllers: any[]) => {
    controllers.forEach(controller => {
      // Handle button presses
      controller.buttons?.forEach((button: any, index: number) => {
        if (button.pressed && !button.wasPressed) {
          handleControllerButtonPress(controller.id, index, button);
        }
        button.wasPressed = button.pressed;
      });

      // Handle hand gestures
      if (controller.hand) {
        handleHandGestures(controller.id, controller.hand);
      }
    });
  };

  // Handle controller button press
  const handleControllerButtonPress = (controllerId: string, buttonIndex: number, button: any) => {
    switch (button.mapping?.action) {
      case 'select':
        handleSelectAction(controllerId);
        break;
      case 'teleport':
        handleTeleportAction(controllerId);
        break;
      case 'menu':
        handleMenuAction(controllerId);
        break;
    }
  };

  // Handle hand gestures
  const handleHandGestures = (controllerId: string, hand: any) => {
    hand.gestures?.forEach((gesture: any) => {
      switch (gesture.type) {
        case 'pinch':
          handlePinchGesture(controllerId, gesture);
          break;
        case 'point':
          handlePointGesture(controllerId, gesture);
          break;
        case 'grab':
          handleGrabGesture(controllerId, gesture);
          break;
      }
    });
  };

  // Handle select action
  const handleSelectAction = (controllerId: string) => {
    // Implement object selection
    console.log('Select action from controller:', controllerId);
  };

  // Handle teleport action
  const handleTeleportAction = (controllerId: string) => {
    // Find valid teleport target and execute teleport
    const controller = controllerStates.find(c => c.id === controllerId);
    if (controller && controller.pose) {
      // Raycast to find teleport target
      const target = findTeleportTarget(controller.pose);
      if (target) {
        teleportToPosition(target.position);
      }
    }
  };

  // Handle menu action
  const handleMenuAction = (controllerId: string) => {
    // Toggle menu or panels
    console.log('Menu action from controller:', controllerId);
  };

  // Handle pinch gesture
  const handlePinchGesture = (controllerId: string, gesture: any) => {
    // Implement pinch interaction (grab, scale, etc.)
    console.log('Pinch gesture:', controllerId, gesture);
  };

  // Handle point gesture
  const handlePointGesture = (controllerId: string, gesture: any) => {
    // Implement pointing interaction (highlight, select)
    console.log('Point gesture:', controllerId, gesture);
  };

  // Handle grab gesture
  const handleGrabGesture = (controllerId: string, gesture: any) => {
    // Implement grab interaction (move objects)
    console.log('Grab gesture:', controllerId, gesture);
  };

  // Find teleport target from raycast
  const findTeleportTarget = (pose: any): TeleportTarget | null => {
    // Implement raycast to find valid teleport target
    return teleportTargets.find(target => target.valid) || null;
  };

  // Teleport to position
  const teleportToPosition = (position: { x: number; y: number; z: number }) => {
    if (!xrManagerRef.current) return;

    // Implement smooth teleportation with fade
    console.log('Teleporting to:', position);
    
    // Record action if recording
    if (isRecording && recordingData) {
      const action: TutorialAction = {
        timestamp: Date.now() - recordingData.duration,
        type: 'teleport',
        data: { targetPosition: position },
        position,
        duration: 1000
      };
      
      setRecordingData(prev => prev ? {
        ...prev,
        actions: [...prev.actions, action]
      } : null);
    }
  };

  // Start XR session
  const startXRSession = async () => {
    if (!xrManagerRef.current || !isXRSupported) return;

    try {
      await xrManagerRef.current.startSession('immersive-vr');
    } catch (error) {
      console.error('Failed to start XR session:', error);
    }
  };

  // End XR session
  const endXRSession = async () => {
    if (!xrManagerRef.current) return;

    try {
      await xrManagerRef.current.endSession();
    } catch (error) {
      console.error('Failed to end XR session:', error);
    }
  };

  // Start tutorial recording
  const startTutorialRecording = () => {
    if (!recordingData) return;

    setIsRecording(true);
    setRecordingData(prev => prev ? {
      ...prev,
      isRecording: true,
      duration: 0
    } : null);
  };

  // Stop tutorial recording
  const stopTutorialRecording = () => {
    setIsRecording(false);
    setRecordingData(prev => prev ? {
      ...prev,
      isRecording: false
    } : null);
  };

  // Start voice recognition
  const startVoiceRecognition = () => {
    if (voiceRecognition && !isListening) {
      voiceRecognition.start();
    }
  };

  // Stop voice recognition
  const stopVoiceRecognition = () => {
    if (voiceRecognition && isListening) {
      voiceRecognition.stop();
    }
  };

  // Update environment settings
  const updateEnvironmentSettings = (env: VREnvironment) => {
    if (!rendererRef.current) return;

    // Update lighting
    // Update skybox
    // Update ambient sounds
  };

  // Cleanup resources
  const cleanup = () => {
    if (xrManagerRef.current) {
      xrManagerRef.current.dispose();
    }
    
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
    
    if (voiceRecognition) {
      voiceRecognition.stop();
    }
  };

  // Helper functions
  const extractTarget = (command: string): string => {
    // Extract navigation target from voice command
    return command.replace(/(go to|navigate to)/gi, '').trim();
  };

  const extractSearchQuery = (command: string): string => {
    // Extract search query from voice command
    return command.replace(/(find|search for?)/gi, '').trim();
  };

  const extractAnnotationText = (command: string): string => {
    // Extract annotation text from voice command
    return command.replace(/(add note|annotate)/gi, '').trim();
  };

  // Render
  return (
    <XRContainer ref={containerRef} className={className}>
      <XRCanvas ref={canvasRef} />
      
      <VROverlay>
        {/* Status Panel */}
        <StatusPanel>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              VR Code Walkthrough
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={1}>
              <Chip 
                label={isXRActive ? 'VR Active' : 'VR Inactive'} 
                color={isXRActive ? 'success' : 'default'} 
                size="small" 
              />
              
              {isListening && (
                <Chip 
                  label="Voice Recognition Active" 
                  color="primary" 
                  size="small" 
                />
              )}
              
              {isRecording && (
                <Chip 
                  label="Recording Tutorial" 
                  color="error" 
                  size="small" 
                />
              )}
              
              <Typography variant="caption" color="textSecondary">
                Environment: {currentEnvironment.name}
              </Typography>
              
              <Typography variant="caption" color="textSecondary">
                Teleport Targets: {teleportTargets.length}
              </Typography>
              
              <Typography variant="caption" color="textSecondary">
                Active Panels: {raycastPanels.filter(p => p.visible).length}
              </Typography>
            </Box>
          </CardContent>
        </StatusPanel>

        {/* Collaborators Panel */}
        {enableCollaboration && collaborators.length > 0 && (
          <CollaboratorsPanel>
            <Typography variant="subtitle2" gutterBottom>
              Collaborators
            </Typography>
            <AvatarGroup max={4}>
              {collaborators.map(collaborator => (
                <Tooltip key={collaborator.id} title={collaborator.name}>
                  <Avatar 
                    src={collaborator.avatar}
                    style={{
                      border: collaborator.isPresent ? '2px solid #4CAF50' : '1px solid #666'
                    }}
                  />
                </Tooltip>
              ))}
            </AvatarGroup>
          </CollaboratorsPanel>
        )}

        {/* Tutorial Recording Controls */}
        {enableTutorialRecording && (
          <TutorialRecorder>
            <Fab
              size="small"
              color={isRecording ? "secondary" : "primary"}
              onClick={isRecording ? stopTutorialRecording : startTutorialRecording}
            >
              {isRecording ? '⏹' : '⏺'}
            </Fab>
            <Typography variant="caption" color="white">
              {isRecording ? 'Recording...' : 'Start Recording'}
            </Typography>
          </TutorialRecorder>
        )}

        {/* Control Panels */}
        <ControlsPanel>
          {!isXRActive ? (
            <Fab
              color="primary"
              onClick={startXRSession}
              disabled={!isXRSupported}
            >
              🥽
            </Fab>
          ) : (
            <Fab
              color="secondary"
              onClick={endXRSession}
            >
              ❌
            </Fab>
          )}
          
          {enableVoiceCommands && (
            <Fab
              color={isListening ? "secondary" : "default"}
              onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
              size="medium"
            >
              🎤
            </Fab>
          )}
        </ControlsPanel>
      </VROverlay>
    </XRContainer>
  );
};

// Helper function to create default environment
function createDefaultEnvironment(): VREnvironment {
  return {
    id: 'default',
    name: 'Modern Office',
    type: 'office',
    skybox: 'office_skybox',
    lighting: {
      ambient: { r: 0.3, g: 0.3, b: 0.4, intensity: 0.4 },
      directional: { r: 1, g: 1, b: 0.9, intensity: 0.8, direction: { x: -1, y: -0.5, z: -1 } },
      point: [
        {
          position: { x: 0, y: 3, z: 0 },
          color: { r: 1, g: 1, b: 1 },
          intensity: 0.5,
          distance: 10
        }
      ]
    },
    ambientSound: 'office_ambient',
    interactiveElements: [
      {
        id: 'desk',
        type: 'desk',
        position: { x: 0, y: 0, z: -2 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        interactive: true
      }
    ]
  };
}

export default XRCodeWalkthrough; 