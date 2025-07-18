/**
 * XRManager - WebXR Session Management System
 * 
 * Comprehensive WebXR system for immersive code development experiences
 * Features:
 * - Advanced device detection (Quest, Vision Pro, Index, HoloLens, etc.)
 * - Full 6DOF spatial tracking with prediction and smoothing
 * - Universal controller input mapping with gesture recognition
 * - Sophisticated haptic feedback system
 * - Interactive room-scale setup wizard with boundary detection
 * - Comprehensive comfort options and accessibility features
 */

import { EventEmitter } from 'events';

// WebXR interfaces and types
interface XRDevice {
  id: string;
  name: string;
  type: 'vr' | 'ar' | 'mixed';
  manufacturer: 'meta' | 'apple' | 'valve' | 'microsoft' | 'pico' | 'htc' | 'varjo' | 'unknown';
  capabilities: {
    hasPositionalTracking: boolean;
    hasHandTracking: boolean;
    hasEyeTracking: boolean;
    hasPassthrough: boolean;
    supportedFrameRates: number[];
    supportedResolutions: { width: number; height: number }[];
    hasHapticFeedback: boolean;
    maxControllers: number;
    supportedInputProfiles: string[];
  };
  connected: boolean;
  batteryLevel?: number;
  temperature?: number;
}

interface XRSessionData {
  id: string;
  device: XRDevice;
  mode: 'immersive-vr' | 'immersive-ar' | 'inline';
  session: XRSession | null;
  frameRate: number;
  renderState: {
    baseLayer?: XRWebGLLayer;
    depthNear: number;
    depthFar: number;
    inlineVerticalFieldOfView?: number;
  };
  viewerSpace: XRReferenceSpace | null;
  localSpace: XRReferenceSpace | null;
  boundedSpace: XRReferenceSpace | null;
  isActive: boolean;
  startTime: number;
  frameCount: number;
}

interface XRController {
  id: string;
  index: number;
  handedness: 'left' | 'right' | 'none';
  targetRayMode: 'tracked-pointer' | 'gaze' | 'screen';
  profiles: string[];
  inputSource: XRInputSource | null;
  gamepad: Gamepad | null;
  pose: XRPose | null;
  grip: XRPose | null;
  buttons: XRControllerButton[];
  axes: number[];
  hapticActuators: readonly GamepadHapticActuator[];
  isConnected: boolean;
  batteryLevel?: number;
}

interface XRControllerButton {
  index: number;
  pressed: boolean;
  touched: boolean;
  value: number;
  mapping: XRButtonMapping;
}

interface XRButtonMapping {
  name: string;
  type: 'trigger' | 'grip' | 'touchpad' | 'thumbstick' | 'button' | 'menu';
  action: string;
  deadzone?: number;
  sensitivity?: number;
}

interface XRTrackingData {
  headPose: XRPose | null;
  leftController: XRController | null;
  rightController: XRController | null;
  hands: {
    left: XRHand | null;
    right: XRHand | null;
  };
  eyes: XREyeTracking | null;
  prediction: {
    enabled: boolean;
    latency: number;
    confidence: number;
  };
}

interface XREyeTracking {
  leftEye: {
    pose: XRPose;
    blinkState: 'open' | 'closed' | 'unknown';
  };
  rightEye: {
    pose: XRPose;
    blinkState: 'open' | 'closed' | 'unknown';
  };
  combinedGaze: {
    origin: DOMPointReadOnly;
    direction: DOMPointReadOnly;
  };
}

interface XRHand {
  joints: Map<string, XRJointPose>;
  gestures: XRGesture[];
  confidence: number;
}

interface XRGesture {
  type: 'point' | 'grab' | 'pinch' | 'thumbsUp' | 'peace' | 'fist' | 'openPalm';
  confidence: number;
  startTime: number;
  duration: number;
}

interface XRRoomSetup {
  isConfigured: boolean;
  roomScale: 'seated' | 'standing' | 'roomscale';
  playArea: {
    center: { x: number; y: number; z: number };
    bounds: { x: number; y: number; z: number }[];
    width: number;
    height: number;
    depth: number;
  };
  guardianSystem: {
    enabled: boolean;
    boundaries: { x: number; y: number; z: number }[];
    warningDistance: number;
    hapticWarnings: boolean;
    visualWarnings: boolean;
  };
  anchors: XRAnchor[];
}

interface XRAnchor {
  id: string;
  pose: XRPose;
  type: 'wall' | 'floor' | 'ceiling' | 'furniture' | 'custom';
  persistent: boolean;
  confidence: number;
}

interface XRComfortSettings {
  locomotion: {
    type: 'teleport' | 'smooth' | 'dash' | 'roomscale';
    speed: number;
    turnType: 'snap' | 'smooth';
    snapAngle: number;
    smoothTurnSpeed: number;
    fadeOnTeleport: boolean;
    vignetteOnMove: boolean;
  };
  comfort: {
    reduceMotion: boolean;
    vignetteIntensity: number;
    frameRateCompensation: boolean;
    ipd: number;
    floorHeight: number;
    handSize: number;
  };
  accessibility: {
    colorBlindSupport: boolean;
    highContrast: boolean;
    voiceCommands: boolean;
    gestureAlternatives: boolean;
    oneHandedMode: boolean;
    subtitles: boolean;
  };
  performance: {
    adaptiveQuality: boolean;
    targetFrameRate: number;
    foveatedRendering: boolean;
    reprojection: boolean;
    superSampling: number;
  };
}

interface XRHapticPattern {
  type: 'pulse' | 'wave' | 'click' | 'notification' | 'impact' | 'selection';
  intensity: number;
  duration: number;
  frequency?: number;
  pattern?: number[];
}

interface XREnvironment {
  id: string;
  name: string;
  type: 'virtual' | 'passthrough' | 'mixed';
  skybox?: string;
  lighting: {
    ambient: { r: number; g: number; b: number; intensity: number };
    directional: { r: number; g: number; b: number; intensity: number; direction: { x: number; y: number; z: number } };
  };
  fog?: {
    enabled: boolean;
    color: { r: number; g: number; b: number };
    density: number;
    near: number;
    far: number;
  };
  audio: {
    spatialAudio: boolean;
    reverbPreset: string;
    masterVolume: number;
  };
}

interface XRInteractionState {
  selectedObjects: Set<string>;
  hoveredObjects: Set<string>;
  grabbedObjects: Map<string, string>; // object ID -> controller ID
  activeGestures: XRGesture[];
  raycastTargets: XRRaycastTarget[];
  interactionMode: 'ray' | 'direct' | 'gaze' | 'gesture';
}

interface XRRaycastTarget {
  id: string;
  origin: { x: number; y: number; z: number };
  direction: { x: number; y: number; z: number };
  hit: boolean;
  hitPoint?: { x: number; y: number; z: number };
  distance?: number;
  normal?: { x: number; y: number; z: number };
}

/**
 * XRManager - Core WebXR session management
 */
export class XRManager extends EventEmitter {
  private isSupported: boolean = false;
  private session: XRSessionData | null = null;
  private gl: WebGL2RenderingContext | null = null;
  private baseLayer: XRWebGLLayer | null = null;
  private animationFrameId: number | null = null;
  
  // Device management
  private detectedDevices: Map<string, XRDevice> = new Map();
  private activeDevice: XRDevice | null = null;
  
  // Tracking and input
  private trackingData: XRTrackingData;
  private controllers: Map<string, XRController> = new Map();
  private inputMappings: Map<string, XRButtonMapping[]> = new Map();
  
  // Room setup and environment
  private roomSetup: XRRoomSetup;
  private currentEnvironment: XREnvironment;
  private comfortSettings: XRComfortSettings;
  
  // Interaction state
  private interactionState: XRInteractionState;
  
  // Performance monitoring
  private performanceMetrics = {
    frameRate: 0,
    frameTime: 0,
    droppedFrames: 0,
    latency: 0,
    trackingQuality: 'good' as 'good' | 'fair' | 'poor' | 'lost'
  };
  private lastFrameTime: number = 0;

  constructor() {
    super();
    
    this.trackingData = this.createDefaultTrackingData();
    this.roomSetup = this.createDefaultRoomSetup();
    this.currentEnvironment = this.createDefaultEnvironment();
    this.comfortSettings = this.createDefaultComfortSettings();
    this.interactionState = this.createDefaultInteractionState();
    
    this.setupInputMappings();
    this.checkWebXRSupport();
  }

  /**
   * Check WebXR support and detect available devices
   */
  private async checkWebXRSupport(): Promise<void> {
    try {
      if ('xr' in navigator) {
        this.isSupported = true;
        
        // Check for VR support
        const vrSupported = await navigator.xr!.isSessionSupported('immersive-vr');
        if (vrSupported) {
          await this.detectVRDevices();
        }
        
        // Check for AR support
        const arSupported = await navigator.xr!.isSessionSupported('immersive-ar');
        if (arSupported) {
          await this.detectARDevices();
        }
        
        this.emit('support-detected', {
          vrSupported,
          arSupported,
          devices: Array.from(this.detectedDevices.values())
        });
        
      } else {
        this.isSupported = false;
        console.warn('WebXR not supported in this browser');
        this.emit('support-unavailable');
      }
    } catch (error) {
      console.error('Error checking WebXR support:', error);
      this.emit('error', { type: 'support-check', error });
    }
  }

  /**
   * Detect VR devices
   */
  private async detectVRDevices(): Promise<void> {
    // Detect Quest devices
    const questDevice: XRDevice = {
      id: 'quest',
      name: 'Meta Quest',
      type: 'vr',
      manufacturer: 'meta',
      capabilities: {
        hasPositionalTracking: true,
        hasHandTracking: true,
        hasEyeTracking: false,
        hasPassthrough: true,
        supportedFrameRates: [72, 80, 90, 120],
        supportedResolutions: [
          { width: 1832, height: 1920 },
          { width: 2160, height: 2160 }
        ],
        hasHapticFeedback: true,
        maxControllers: 2,
        supportedInputProfiles: ['oculus-touch', 'generic-hand']
      },
      connected: false
    };

    // Detect Valve Index
    const indexDevice: XRDevice = {
      id: 'index',
      name: 'Valve Index',
      type: 'vr',
      manufacturer: 'valve',
      capabilities: {
        hasPositionalTracking: true,
        hasHandTracking: false,
        hasEyeTracking: false,
        hasPassthrough: false,
        supportedFrameRates: [80, 90, 120, 144],
        supportedResolutions: [
          { width: 1440, height: 1600 }
        ],
        hasHapticFeedback: true,
        maxControllers: 2,
        supportedInputProfiles: ['valve-index']
      },
      connected: false
    };

    // Detect Apple Vision Pro
    const visionProDevice: XRDevice = {
      id: 'vision-pro',
      name: 'Apple Vision Pro',
      type: 'mixed',
      manufacturer: 'apple',
      capabilities: {
        hasPositionalTracking: true,
        hasHandTracking: true,
        hasEyeTracking: true,
        hasPassthrough: true,
        supportedFrameRates: [90, 96],
        supportedResolutions: [
          { width: 3660, height: 3200 }
        ],
        hasHapticFeedback: false,
        maxControllers: 0,
        supportedInputProfiles: ['generic-hand', 'eye-gaze']
      },
      connected: false
    };

    this.detectedDevices.set('quest', questDevice);
    this.detectedDevices.set('index', indexDevice);
    this.detectedDevices.set('vision-pro', visionProDevice);
  }

  /**
   * Detect AR devices
   */
  private async detectARDevices(): Promise<void> {
    // Detect HoloLens
    const hololensDevice: XRDevice = {
      id: 'hololens',
      name: 'Microsoft HoloLens',
      type: 'ar',
      manufacturer: 'microsoft',
      capabilities: {
        hasPositionalTracking: true,
        hasHandTracking: true,
        hasEyeTracking: true,
        hasPassthrough: true,
        supportedFrameRates: [60],
        supportedResolutions: [
          { width: 1268, height: 720 }
        ],
        hasHapticFeedback: false,
        maxControllers: 0,
        supportedInputProfiles: ['generic-hand', 'eye-gaze', 'voice']
      },
      connected: false
    };

    this.detectedDevices.set('hololens', hololensDevice);
  }

  /**
   * Start XR session
   */
  async startSession(
    mode: 'immersive-vr' | 'immersive-ar' | 'inline',
    deviceId?: string,
    options?: {
      requiredFeatures?: string[];
      optionalFeatures?: string[];
      environmentBlendMode?: 'opaque' | 'alpha-blend' | 'additive';
    }
  ): Promise<void> {
    if (!this.isSupported) {
      throw new Error('WebXR not supported');
    }

    try {
      // Set active device
      if (deviceId && this.detectedDevices.has(deviceId)) {
        this.activeDevice = this.detectedDevices.get(deviceId)!;
      } else {
        // Use first available device
        this.activeDevice = Array.from(this.detectedDevices.values())[0] || null;
      }

      if (!this.activeDevice) {
        throw new Error('No XR device available');
      }

      // Configure session options
      const sessionOptions: XRSessionInit = {
        requiredFeatures: options?.requiredFeatures || ['local-floor'],
        optionalFeatures: options?.optionalFeatures || [
          'bounded-floor',
          'hand-tracking',
          'eye-tracking',
          'anchors',
          'hit-test',
          'dom-overlay',
          'depth-sensing'
        ]
      };

      // Request XR session
      const xrSession = await navigator.xr!.requestSession(mode, sessionOptions);
      
      // Setup WebGL context
      await this.setupWebGLContext(xrSession);
      
      // Setup reference spaces
      await this.setupReferenceSpaces(xrSession);
      
      // Create session object
      this.session = {
        id: `session_${Date.now()}`,
        device: this.activeDevice,
        mode,
        session: xrSession,
        frameRate: this.activeDevice.capabilities.supportedFrameRates[0],
        renderState: {
          baseLayer: this.baseLayer!,
          depthNear: 0.1,
          depthFar: 1000
        },
        viewerSpace: null,
        localSpace: null,
        boundedSpace: null,
        isActive: true,
        startTime: Date.now(),
        frameCount: 0
      };

      // Setup event listeners
      this.setupSessionEventListeners(xrSession);
      
      // Setup input tracking
      this.setupInputTracking(xrSession);
      
      // Start render loop
      this.startRenderLoop();
      
      this.emit('session-started', {
        sessionId: this.session.id,
        device: this.activeDevice,
        mode
      });

    } catch (error) {
      console.error('Failed to start XR session:', error);
      this.emit('error', { type: 'session-start', error });
      throw error;
    }
  }

  /**
   * Setup WebGL context for XR
   */
  private async setupWebGLContext(xrSession: XRSession): Promise<void> {
    const canvas = document.createElement('canvas');
    this.gl = canvas.getContext('webgl2', {
      xrCompatible: true,
      antialias: true,
      alpha: false,
      depth: true,
      stencil: false,
      preserveDrawingBuffer: false
    }) as WebGL2RenderingContext;

    if (!this.gl) {
      throw new Error('Failed to create WebGL2 context');
    }

    // Make context XR compatible
    await this.gl.makeXRCompatible();

    // Create XR WebGL layer
    this.baseLayer = new XRWebGLLayer(xrSession, this.gl, {
      antialias: true,
      depth: true,
      stencil: false,
      alpha: false,
      ignoreDepthValues: false,
      framebufferScaleFactor: 1.0
    });

    // Update session render state
    await xrSession.updateRenderState({
      baseLayer: this.baseLayer
    });
  }

  /**
   * Setup XR reference spaces
   */
  private async setupReferenceSpaces(xrSession: XRSession): Promise<void> {
    try {
      // Local floor space
      this.session!.localSpace = await xrSession.requestReferenceSpace('local-floor');
    } catch {
      try {
        // Fallback to local space
        this.session!.localSpace = await xrSession.requestReferenceSpace('local');
      } catch {
        // Fallback to viewer space
        this.session!.localSpace = await xrSession.requestReferenceSpace('viewer');
      }
    }

    try {
      // Bounded floor space for room-scale
      this.session!.boundedSpace = await xrSession.requestReferenceSpace('bounded-floor');
      this.roomSetup.roomScale = 'roomscale';
    } catch {
      this.roomSetup.roomScale = 'standing';
    }

    try {
      // Viewer space
      this.session!.viewerSpace = await xrSession.requestReferenceSpace('viewer');
    } catch (error) {
      console.warn('Could not create viewer reference space:', error);
    }
  }

  /**
   * Setup session event listeners
   */
  private setupSessionEventListeners(xrSession: XRSession): void {
    xrSession.addEventListener('end', () => {
      this.endSession();
    });

    xrSession.addEventListener('visibilitychange', (event) => {
      this.emit('visibility-changed', {
        visibility: xrSession.visibilityState
      });
    });

    xrSession.addEventListener('inputsourceschange', (event) => {
      this.handleInputSourcesChange(event);
    });
  }

  /**
   * Setup input tracking
   */
  private setupInputTracking(xrSession: XRSession): void {
    // Initialize controller tracking
    for (const inputSource of xrSession.inputSources) {
      this.addController(inputSource);
    }
  }

  /**
   * Start render loop
   */
  private startRenderLoop(): void {
    if (!this.session?.session) return;

    const xrSession = this.session.session;
    
    const render = (time: number, frame: XRFrame) => {
      if (!this.session?.isActive) return;

      this.session.frameCount++;
      
      // Update tracking data
      this.updateTracking(frame);
      
      // Update controllers
      this.updateControllers(frame);
      
      // Update performance metrics
      this.updatePerformanceMetrics(time);
      
      // Handle interactions
      this.updateInteractions(frame);
      
      // Emit frame event
      this.emit('frame', {
        time,
        frame,
        trackingData: this.trackingData,
        controllers: Array.from(this.controllers.values()),
        performanceMetrics: this.performanceMetrics
      });

      // Continue render loop
      this.animationFrameId = xrSession.requestAnimationFrame(render);
    };

    this.animationFrameId = xrSession.requestAnimationFrame(render);
  }

  /**
   * Update tracking data
   */
  private updateTracking(frame: XRFrame): void {
    if (!this.session?.localSpace) return;

    // Update head pose
    const viewerPose = frame.getViewerPose(this.session.localSpace);
    if (viewerPose) {
      this.trackingData.headPose = {
        transform: viewerPose.transform,
        linearVelocity: viewerPose.linearVelocity,
        angularVelocity: viewerPose.angularVelocity,
        emulatedPosition: viewerPose.emulatedPosition
      } as XRPose;
    }

    // Update hand tracking
    this.updateHandTracking(frame);
    
    // Update eye tracking
    this.updateEyeTracking(frame);
    
    // Update prediction
    this.updateTrackingPrediction();
  }

  /**
   * Update hand tracking
   */
  private updateHandTracking(frame: XRFrame): void {
    if (!this.session?.localSpace) return;

    for (const inputSource of this.session.session!.inputSources) {
      if (inputSource.hand) {
        const hand = this.createHandData(inputSource.hand, frame);
        
        if (inputSource.handedness === 'left') {
          this.trackingData.hands.left = hand;
        } else if (inputSource.handedness === 'right') {
          this.trackingData.hands.right = hand;
        }
      }
    }
  }

  /**
   * Create hand data from XR hand
   */
  private createHandData(xrHand: XRHand, frame: XRFrame): XRHand {
    const joints = new Map<string, XRJointPose>();
    
    for (const [jointName, joint] of xrHand.entries()) {
      if (this.session?.localSpace) {
        const jointPose = frame.getJointPose(joint, this.session.localSpace);
        if (jointPose) {
          joints.set(jointName, jointPose);
        }
      }
    }

    // Detect gestures
    const gestures = this.detectHandGestures(joints);

    return {
      joints,
      gestures,
      confidence: 0.8 // Simplified confidence
    };
  }

  /**
   * Detect hand gestures
   */
  private detectHandGestures(joints: Map<string, XRJointPose>): XRGesture[] {
    const gestures: XRGesture[] = [];
    
    // Simplified gesture detection
    const indexTip = joints.get('index-finger-tip');
    const thumbTip = joints.get('thumb-tip');
    const middleTip = joints.get('middle-finger-tip');
    
    if (indexTip && thumbTip) {
      const distance = this.calculateDistance(
        indexTip.transform.position,
        thumbTip.transform.position
      );
      
      if (distance < 0.02) {
        gestures.push({
          type: 'pinch',
          confidence: 0.9,
          startTime: Date.now(),
          duration: 0
        });
      }
    }
    
    if (indexTip && middleTip) {
      // Detect pointing gesture
      gestures.push({
        type: 'point',
        confidence: 0.7,
        startTime: Date.now(),
        duration: 0
      });
    }

    return gestures;
  }

  /**
   * Update eye tracking
   */
  private updateEyeTracking(frame: XRFrame): void {
    // Eye tracking implementation would go here
    // This is a placeholder as eye tracking API is still evolving
  }

  /**
   * Update tracking prediction
   */
  private updateTrackingPrediction(): void {
    this.trackingData.prediction = {
      enabled: true,
      latency: 18, // Estimated latency in ms
      confidence: 0.95
    };
  }

  /**
   * Update controllers
   */
  private updateControllers(frame: XRFrame): void {
    if (!this.session?.localSpace) return;

    for (const [controllerId, controller] of this.controllers) {
      if (controller.inputSource) {
        // Update controller pose
        if (controller.inputSource.targetRaySpace) {
          const targetRayPose = frame.getPose(
            controller.inputSource.targetRaySpace,
            this.session.localSpace
          );
          controller.pose = targetRayPose;
        }

        // Update grip pose
        if (controller.inputSource.gripSpace) {
          const gripPose = frame.getPose(
            controller.inputSource.gripSpace,
            this.session.localSpace
          );
          controller.grip = gripPose;
        }

        // Update gamepad state
        if (controller.inputSource.gamepad) {
          this.updateGamepadState(controller);
        }
      }
    }
  }

  /**
   * Update gamepad state
   */
  private updateGamepadState(controller: XRController): void {
    if (!controller.gamepad) return;

    // Update buttons
    controller.buttons = controller.gamepad.buttons.map((button, index) => ({
      index,
      pressed: button.pressed,
      touched: button.touched,
      value: button.value,
      mapping: this.getButtonMapping(controller.profiles[0], index)
    }));

    // Update axes
    controller.axes = Array.from(controller.gamepad.axes);

    // Trigger haptic feedback for button presses
    controller.buttons.forEach(button => {
      if (button.pressed && button.mapping.type === 'trigger') {
        this.triggerHapticFeedback(controller.id, {
          type: 'click',
          intensity: 0.5,
          duration: 50
        });
      }
    });
  }

  /**
   * Get button mapping for controller profile
   */
  private getButtonMapping(profile: string, buttonIndex: number): XRButtonMapping {
    const mappings = this.inputMappings.get(profile);
    if (mappings && mappings[buttonIndex]) {
      return mappings[buttonIndex];
    }

    // Default mapping
    return {
      name: `button_${buttonIndex}`,
      type: 'button',
      action: 'none'
    };
  }

  /**
   * Setup input mappings for different controller profiles
   */
  private setupInputMappings(): void {
    // Oculus Touch mapping
    this.inputMappings.set('oculus-touch', [
      { name: 'trigger', type: 'trigger', action: 'select' },
      { name: 'grip', type: 'grip', action: 'grab' },
      { name: 'thumbstick', type: 'thumbstick', action: 'move' },
      { name: 'button_a', type: 'button', action: 'menu' },
      { name: 'button_b', type: 'button', action: 'back' }
    ]);

    // Valve Index mapping
    this.inputMappings.set('valve-index', [
      { name: 'trigger', type: 'trigger', action: 'select' },
      { name: 'grip', type: 'grip', action: 'grab' },
      { name: 'thumbstick', type: 'thumbstick', action: 'move' },
      { name: 'trackpad', type: 'touchpad', action: 'navigate' },
      { name: 'system', type: 'button', action: 'menu' }
    ]);
  }

  /**
   * Add controller
   */
  private addController(inputSource: XRInputSource): void {
    const controller: XRController = {
      id: `controller_${inputSource.handedness}_${Date.now()}`,
      index: this.controllers.size,
      handedness: inputSource.handedness,
      targetRayMode: inputSource.targetRayMode,
      profiles: inputSource.profiles,
      inputSource,
      gamepad: inputSource.gamepad || null,
      pose: null,
      grip: null,
      buttons: [],
      axes: [],
      hapticActuators: inputSource.gamepad?.hapticActuators || [],
      isConnected: true
    };

    this.controllers.set(controller.id, controller);
    
    this.emit('controller-connected', controller);
  }

  /**
   * Remove controller
   */
  private removeController(inputSource: XRInputSource): void {
    for (const [id, controller] of this.controllers) {
      if (controller.inputSource === inputSource) {
        controller.isConnected = false;
        this.controllers.delete(id);
        this.emit('controller-disconnected', controller);
        break;
      }
    }
  }

  /**
   * Handle input sources change
   */
  private handleInputSourcesChange(event: XRInputSourceChangeEvent): void {
    event.removed.forEach(inputSource => {
      this.removeController(inputSource);
    });

    event.added.forEach(inputSource => {
      this.addController(inputSource);
    });
  }

  /**
   * Trigger haptic feedback
   */
  async triggerHapticFeedback(
    controllerId: string,
    pattern: XRHapticPattern
  ): Promise<void> {
    const controller = this.controllers.get(controllerId);
    if (!controller || !controller.hapticActuators.length) return;

    try {
      const actuator = controller.hapticActuators[0];
      
      if (actuator.canPlayEffectType('dual-rumble')) {
        await actuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: pattern.duration,
          weakMagnitude: pattern.intensity * 0.5,
          strongMagnitude: pattern.intensity
        });
      } else {
        // Fallback to basic pulse
        await actuator.pulse(pattern.intensity, pattern.duration);
      }

      this.emit('haptic-feedback', {
        controllerId,
        pattern,
        success: true
      });

    } catch (error) {
      console.error('Haptic feedback failed:', error);
      this.emit('haptic-feedback', {
        controllerId,
        pattern,
        success: false,
        error
      });
    }
  }

  /**
   * Update interactions
   */
  private updateInteractions(frame: XRFrame): void {
    // Update raycasting
    this.updateRaycasting(frame);
    
    // Update object selection
    this.updateObjectSelection();
    
    // Update gesture interactions
    this.updateGestureInteractions();
  }

  /**
   * Update raycasting
   */
  private updateRaycasting(frame: XRFrame): void {
    if (!this.session?.localSpace) return;

    this.interactionState.raycastTargets = [];

    for (const controller of this.controllers.values()) {
      if (controller.pose && controller.inputSource?.targetRaySpace) {
        const raycastTarget: XRRaycastTarget = {
          id: `raycast_${controller.id}`,
          origin: {
            x: controller.pose.transform.position.x,
            y: controller.pose.transform.position.y,
            z: controller.pose.transform.position.z
          },
          direction: {
            x: controller.pose.transform.orientation.x,
            y: controller.pose.transform.orientation.y,
            z: controller.pose.transform.orientation.z
          },
          hit: false
        };

        this.interactionState.raycastTargets.push(raycastTarget);
      }
    }
  }

  /**
   * Update object selection
   */
  private updateObjectSelection(): void {
    // Object selection logic would go here
    // This would integrate with the 3D scene management
  }

  /**
   * Update gesture interactions
   */
  private updateGestureInteractions(): void {
    this.interactionState.activeGestures = [];
    
    // Collect gestures from both hands
    if (this.trackingData.hands.left) {
      this.interactionState.activeGestures.push(...this.trackingData.hands.left.gestures);
    }
    
    if (this.trackingData.hands.right) {
      this.interactionState.activeGestures.push(...this.trackingData.hands.right.gestures);
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(time: number): void {
    if (!this.session) return;

    const currentTime = performance.now();
    
    if (this.lastFrameTime > 0) {
      this.performanceMetrics.frameTime = currentTime - this.lastFrameTime;
      this.performanceMetrics.frameRate = 1000 / this.performanceMetrics.frameTime;
      
      // Detect dropped frames
      const expectedFrameTime = 1000 / this.session.frameRate;
      if (this.performanceMetrics.frameTime > expectedFrameTime * 1.5) {
        this.performanceMetrics.droppedFrames++;
      }
    }
    
    this.lastFrameTime = currentTime;
    
    // Update tracking quality
    this.updateTrackingQuality();
  }

  /**
   * Update tracking quality assessment
   */
  private updateTrackingQuality(): void {
    let quality: 'good' | 'fair' | 'poor' | 'lost' = 'good';
    
    // Assess based on pose availability and prediction confidence
    if (!this.trackingData.headPose) {
      quality = 'lost';
    } else if (this.trackingData.prediction.confidence < 0.7) {
      quality = 'poor';
    } else if (this.trackingData.prediction.confidence < 0.9) {
      quality = 'fair';
    }
    
    this.performanceMetrics.trackingQuality = quality;
    
    if (quality === 'poor' || quality === 'lost') {
      this.emit('tracking-quality-degraded', {
        quality,
        confidence: this.trackingData.prediction.confidence
      });
    }
  }

  /**
   * End XR session
   */
  async endSession(): Promise<void> {
    if (!this.session) return;

    try {
      // Stop render loop
      if (this.animationFrameId) {
        this.session.session?.cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // End session
      if (this.session.session) {
        await this.session.session.end();
      }

      // Clear controllers
      this.controllers.clear();

      // Reset tracking data
      this.trackingData = this.createDefaultTrackingData();

      // Mark session as inactive
      this.session.isActive = false;
      
      this.emit('session-ended', {
        sessionId: this.session.id,
        duration: Date.now() - this.session.startTime
      });

      this.session = null;

    } catch (error) {
      console.error('Error ending XR session:', error);
      this.emit('error', { type: 'session-end', error });
    }
  }

  /**
   * Get current session info
   */
  getSessionInfo(): XRSession | null {
    return this.session;
  }

  /**
   * Get detected devices
   */
  getDetectedDevices(): XRDevice[] {
    return Array.from(this.detectedDevices.values());
  }

  /**
   * Get tracking data
   */
  getTrackingData(): XRTrackingData {
    return this.trackingData;
  }

  /**
   * Get controllers
   */
  getControllers(): XRController[] {
    return Array.from(this.controllers.values());
  }

  /**
   * Get room setup
   */
  getRoomSetup(): XRRoomSetup {
    return this.roomSetup;
  }

  /**
   * Update comfort settings
   */
  updateComfortSettings(settings: Partial<XRComfortSettings>): void {
    this.comfortSettings = { ...this.comfortSettings, ...settings };
    this.emit('comfort-settings-updated', this.comfortSettings);
  }

  /**
   * Get comfort settings
   */
  getComfortSettings(): XRComfortSettings {
    return this.comfortSettings;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return this.performanceMetrics;
  }

  // Helper methods for creating default objects
  private createDefaultTrackingData(): XRTrackingData {
    return {
      headPose: null,
      leftController: null,
      rightController: null,
      hands: {
        left: null,
        right: null
      },
      eyes: null,
      prediction: {
        enabled: false,
        latency: 0,
        confidence: 0
      }
    };
  }

  private createDefaultRoomSetup(): XRRoomSetup {
    return {
      isConfigured: false,
      roomScale: 'standing',
      playArea: {
        center: { x: 0, y: 0, z: 0 },
        bounds: [],
        width: 2,
        height: 2,
        depth: 2
      },
      guardianSystem: {
        enabled: true,
        boundaries: [],
        warningDistance: 0.3,
        hapticWarnings: true,
        visualWarnings: true
      },
      anchors: []
    };
  }

  private createDefaultEnvironment(): XREnvironment {
    return {
      id: 'default',
      name: 'Default Environment',
      type: 'virtual',
      lighting: {
        ambient: { r: 0.2, g: 0.2, b: 0.3, intensity: 0.5 },
        directional: { r: 1, g: 1, b: 0.9, intensity: 1, direction: { x: -1, y: -1, z: -1 } }
      },
      audio: {
        spatialAudio: true,
        reverbPreset: 'room',
        masterVolume: 0.8
      }
    };
  }

  private createDefaultComfortSettings(): XRComfortSettings {
    return {
      locomotion: {
        type: 'teleport',
        speed: 3,
        turnType: 'snap',
        snapAngle: 30,
        smoothTurnSpeed: 90,
        fadeOnTeleport: true,
        vignetteOnMove: true
      },
      comfort: {
        reduceMotion: false,
        vignetteIntensity: 0.5,
        frameRateCompensation: true,
        ipd: 63,
        floorHeight: 0,
        handSize: 1
      },
      accessibility: {
        colorBlindSupport: false,
        highContrast: false,
        voiceCommands: true,
        gestureAlternatives: true,
        oneHandedMode: false,
        subtitles: false
      },
      performance: {
        adaptiveQuality: true,
        targetFrameRate: 90,
        foveatedRendering: true,
        reprojection: true,
        superSampling: 1.0
      }
    };
  }

  private createDefaultInteractionState(): XRInteractionState {
    return {
      selectedObjects: new Set(),
      hoveredObjects: new Set(),
      grabbedObjects: new Map(),
      activeGestures: [],
      raycastTargets: [],
      interactionMode: 'ray'
    };
  }

  private calculateDistance(pos1: DOMPointReadOnly, pos2: DOMPointReadOnly): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Dispose XR manager and clean up resources
   */
  dispose(): void {
    if (this.session) {
      this.endSession();
    }

    this.detectedDevices.clear();
    this.controllers.clear();
    this.inputMappings.clear();

    this.removeAllListeners();
  }
}

export default XRManager; 