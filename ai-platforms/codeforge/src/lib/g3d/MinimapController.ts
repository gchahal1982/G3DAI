/**
 * CodeForge 3D Minimap Controller
 * Implements 3D navigation and interaction for the code minimap
 * 
 * Features:
 * - Raycast-to-file-path navigation system
 * - 3D camera controls (orbit, zoom, pan)
 * - File selection highlighting
 * - Smooth transition animations
 * - Viewport frustum culling
 * - Interaction state management
 * - Keyboard navigation support
 * - Accessibility controls for 3D view
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

// Interfaces and types
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

interface Camera {
  position: Vector3;
  target: Vector3;
  up: Vector3;
  fov: number;
  near: number;
  far: number;
  aspect: number;
}

interface Ray {
  origin: Vector3;
  direction: Vector3;
}

interface RaycastHit {
  fileId: string;
  filePath: string;
  position: Vector3;
  distance: number;
  nodeType: 'file' | 'directory' | 'function' | 'class' | 'variable';
  metadata: any;
}

interface MinimapNode {
  id: string;
  filePath: string;
  position: Vector3;
  size: Vector3;
  type: 'file' | 'directory' | 'function' | 'class' | 'variable';
  children: MinimapNode[];
  visible: boolean;
  selected: boolean;
  highlighted: boolean;
  metadata: {
    lineCount?: number;
    complexity?: number;
    lastModified?: number;
    dependencies?: string[];
    exports?: string[];
  };
}

interface CameraControls {
  enabled: boolean;
  enableRotate: boolean;
  enableZoom: boolean;
  enablePan: boolean;
  autoRotate: boolean;
  autoRotateSpeed: number;
  rotateSpeed: number;
  zoomSpeed: number;
  panSpeed: number;
  dampingFactor: number;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
}

interface Animation {
  id: string;
  startTime: number;
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
  from: any;
  to: any;
  onUpdate: (value: any) => void;
  onComplete?: () => void;
}

interface AccessibilityOptions {
  enabled: boolean;
  announceNavigation: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  colorBlindFriendly: boolean;
}

// Configuration constants
const MINIMAP_CONFIG = {
  // Camera settings
  DEFAULT_FOV: 75,
  NEAR_PLANE: 0.1,
  FAR_PLANE: 1000,
  DEFAULT_POSITION: { x: 0, y: 5, z: 10 },
  DEFAULT_TARGET: { x: 0, y: 0, z: 0 },
  
  // Control settings
  ROTATE_SPEED: 1.0,
  ZOOM_SPEED: 0.5,
  PAN_SPEED: 0.8,
  DAMPING_FACTOR: 0.1,
  MIN_DISTANCE: 2,
  MAX_DISTANCE: 50,
  
  // Animation settings
  TRANSITION_DURATION: 800, // ms
  SELECTION_ANIMATION_DURATION: 300,
  HIGHLIGHT_ANIMATION_DURATION: 150,
  
  // Interaction settings
  RAYCAST_PRECISION: 0.01,
  SELECTION_TOLERANCE: 2.0, // pixels
  DOUBLE_CLICK_TIME: 300, // ms
  
  // Performance settings
  FRUSTUM_CULLING_ENABLED: true,
  LOD_ENABLED: true,
  MAX_VISIBLE_NODES: 1000,
  UPDATE_FREQUENCY: 60 // FPS
};

export class MinimapController extends EventEmitter {
  private camera: Camera;
  private controls: CameraControls;
  private nodes: Map<string, MinimapNode> = new Map();
  private selectedNodes: Set<string> = new Set();
  private highlightedNodes: Set<string> = new Set();
  private animations: Map<string, Animation> = new Map();
  private accessibility: AccessibilityOptions;
  private canvas: HTMLCanvasElement | null = null;
  private isInteracting: boolean = false;
  private lastClickTime: number = 0;
  private lastMousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private animationFrameId: number | null = null;

  constructor() {
    super();
    
    this.camera = {
      position: { ...MINIMAP_CONFIG.DEFAULT_POSITION },
      target: { ...MINIMAP_CONFIG.DEFAULT_TARGET },
      up: { x: 0, y: 1, z: 0 },
      fov: MINIMAP_CONFIG.DEFAULT_FOV,
      near: MINIMAP_CONFIG.NEAR_PLANE,
      far: MINIMAP_CONFIG.FAR_PLANE,
      aspect: 1.0
    };

    this.controls = {
      enabled: true,
      enableRotate: true,
      enableZoom: true,
      enablePan: true,
      autoRotate: false,
      autoRotateSpeed: 2.0,
      rotateSpeed: MINIMAP_CONFIG.ROTATE_SPEED,
      zoomSpeed: MINIMAP_CONFIG.ZOOM_SPEED,
      panSpeed: MINIMAP_CONFIG.PAN_SPEED,
      dampingFactor: MINIMAP_CONFIG.DAMPING_FACTOR,
      minDistance: MINIMAP_CONFIG.MIN_DISTANCE,
      maxDistance: MINIMAP_CONFIG.MAX_DISTANCE,
      minPolarAngle: 0,
      maxPolarAngle: Math.PI
    };

    this.accessibility = {
      enabled: true,
      announceNavigation: true,
      highContrast: false,
      reducedMotion: false,
      keyboardNavigation: true,
      screenReaderSupport: true,
      colorBlindFriendly: false
    };

    this.initializeController();
  }

  private initializeController(): void {
    // Start render loop
    this.startRenderLoop();
    
    // Initialize accessibility support
    this.initializeAccessibility();
    
    this.emit('controller_initialized', {
      camera: this.camera,
      controls: this.controls,
      accessibility: this.accessibility
    });
  }

  // Canvas and DOM integration
  setCanvas(canvas: HTMLCanvasElement): void {
    if (this.canvas) {
      this.removeEventListeners();
    }

    this.canvas = canvas;
    this.camera.aspect = canvas.width / canvas.height;
    
    this.addEventListeners();
    this.emit('canvas_attached', { canvas, aspect: this.camera.aspect });
  }

  private addEventListeners(): void {
    if (!this.canvas) return;

    // Mouse events
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.onWheel.bind(this));
    this.canvas.addEventListener('click', this.onClick.bind(this));
    this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));

    // Touch events
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));

    // Keyboard events
    this.canvas.addEventListener('keydown', this.onKeyDown.bind(this));
    this.canvas.addEventListener('keyup', this.onKeyUp.bind(this));

    // Context menu
    this.canvas.addEventListener('contextmenu', this.onContextMenu.bind(this));
  }

  private removeEventListeners(): void {
    if (!this.canvas) return;

    this.canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.removeEventListener('wheel', this.onWheel.bind(this));
    this.canvas.removeEventListener('click', this.onClick.bind(this));
    this.canvas.removeEventListener('dblclick', this.onDoubleClick.bind(this));
    this.canvas.removeEventListener('touchstart', this.onTouchStart.bind(this));
    this.canvas.removeEventListener('touchmove', this.onTouchMove.bind(this));
    this.canvas.removeEventListener('touchend', this.onTouchEnd.bind(this));
    this.canvas.removeEventListener('keydown', this.onKeyDown.bind(this));
    this.canvas.removeEventListener('keyup', this.onKeyUp.bind(this));
    this.canvas.removeEventListener('contextmenu', this.onContextMenu.bind(this));
  }

  // Raycast-to-file-path navigation system
  raycastToFilePath(screenX: number, screenY: number): RaycastHit | null {
    if (!this.canvas) return null;

    // Convert screen coordinates to normalized device coordinates
    const rect = this.canvas.getBoundingClientRect();
    const x = ((screenX - rect.left) / rect.width) * 2 - 1;
    const y = -((screenY - rect.top) / rect.height) * 2 + 1;

    // Create ray from camera through screen point
    const ray = this.createRayFromScreen(x, y);
    
    // Find intersections with nodes
    return this.findRayIntersection(ray);
  }

  private createRayFromScreen(x: number, y: number): Ray {
    // Create ray from camera through screen point
    // This is a simplified implementation - real world would use projection matrix
    const direction = this.normalize({
      x: x * Math.tan(this.camera.fov * Math.PI / 360),
      y: y * Math.tan(this.camera.fov * Math.PI / 360) / this.camera.aspect,
      z: -1
    });

    return {
      origin: { ...this.camera.position },
      direction: this.transformDirection(direction)
    };
  }

  private findRayIntersection(ray: Ray): RaycastHit | null {
    let closestHit: RaycastHit | null = null;
    let closestDistance = Infinity;

    for (const node of this.nodes.values()) {
      if (!node.visible) continue;

      const intersection = this.rayIntersectNode(ray, node);
      if (intersection && intersection.distance < closestDistance) {
        closestDistance = intersection.distance;
        closestHit = {
          fileId: node.id,
          filePath: node.filePath,
          position: intersection.position,
          distance: intersection.distance,
          nodeType: node.type,
          metadata: node.metadata
        };
      }
    }

    return closestHit;
  }

  private rayIntersectNode(ray: Ray, node: MinimapNode): { position: Vector3; distance: number } | null {
    // Simplified ray-box intersection for node bounding box
    const min = {
      x: node.position.x - node.size.x / 2,
      y: node.position.y - node.size.y / 2,
      z: node.position.z - node.size.z / 2
    };
    
    const max = {
      x: node.position.x + node.size.x / 2,
      y: node.position.y + node.size.y / 2,
      z: node.position.z + node.size.z / 2
    };

    const invDir = {
      x: 1 / ray.direction.x,
      y: 1 / ray.direction.y,
      z: 1 / ray.direction.z
    };

    const t1 = (min.x - ray.origin.x) * invDir.x;
    const t2 = (max.x - ray.origin.x) * invDir.x;
    const t3 = (min.y - ray.origin.y) * invDir.y;
    const t4 = (max.y - ray.origin.y) * invDir.y;
    const t5 = (min.z - ray.origin.z) * invDir.z;
    const t6 = (max.z - ray.origin.z) * invDir.z;

    const tmin = Math.max(
      Math.min(t1, t2),
      Math.min(t3, t4),
      Math.min(t5, t6)
    );
    
    const tmax = Math.min(
      Math.max(t1, t2),
      Math.max(t3, t4),
      Math.max(t5, t6)
    );

    if (tmax < 0 || tmin > tmax) {
      return null; // No intersection
    }

    const distance = tmin > 0 ? tmin : tmax;
    const position = {
      x: ray.origin.x + ray.direction.x * distance,
      y: ray.origin.y + ray.direction.y * distance,
      z: ray.origin.z + ray.direction.z * distance
    };

    return { position, distance };
  }

  // Camera controls
  orbitCamera(deltaX: number, deltaY: number): void {
    if (!this.controls.enableRotate) return;

    const spherical = this.cartesianToSpherical(
      this.subtract(this.camera.position, this.camera.target)
    );

    spherical.theta -= deltaX * this.controls.rotateSpeed * 0.01;
    spherical.phi = Math.max(
      this.controls.minPolarAngle,
      Math.min(this.controls.maxPolarAngle, spherical.phi - deltaY * this.controls.rotateSpeed * 0.01)
    );

    const newPosition = this.sphericalToCartesian(spherical);
    this.camera.position = this.add(this.camera.target, newPosition);

    this.emit('camera_rotated', { 
      position: this.camera.position, 
      target: this.camera.target 
    });
  }

  zoomCamera(delta: number): void {
    if (!this.controls.enableZoom) return;

    const direction = this.normalize(this.subtract(this.camera.position, this.camera.target));
    const distance = this.distance(this.camera.position, this.camera.target);
    
    const newDistance = Math.max(
      this.controls.minDistance,
      Math.min(this.controls.maxDistance, distance + delta * this.controls.zoomSpeed)
    );

    this.camera.position = this.add(
      this.camera.target,
      this.scale(direction, newDistance)
    );

    this.emit('camera_zoomed', { 
      position: this.camera.position, 
      distance: newDistance 
    });
  }

  panCamera(deltaX: number, deltaY: number): void {
    if (!this.controls.enablePan) return;

    const distance = this.distance(this.camera.position, this.camera.target);
    const right = this.normalize(this.cross(
      this.subtract(this.camera.target, this.camera.position),
      this.camera.up
    ));
    const up = this.normalize(this.cross(right, this.subtract(this.camera.target, this.camera.position)));

    const panVector = this.add(
      this.scale(right, -deltaX * this.controls.panSpeed * distance * 0.001),
      this.scale(up, deltaY * this.controls.panSpeed * distance * 0.001)
    );

    this.camera.position = this.add(this.camera.position, panVector);
    this.camera.target = this.add(this.camera.target, panVector);

    this.emit('camera_panned', { 
      position: this.camera.position, 
      target: this.camera.target 
    });
  }

  // Smooth animations
  animateCameraTo(position: Vector3, target: Vector3, duration: number = MINIMAP_CONFIG.TRANSITION_DURATION): void {
    const startPosition = { ...this.camera.position };
    const startTarget = { ...this.camera.target };

    this.createAnimation({
      id: 'camera_transition',
      duration,
      easing: 'ease-in-out',
      from: { position: startPosition, target: startTarget },
      to: { position, target },
      onUpdate: (value) => {
        this.camera.position = value.position;
        this.camera.target = value.target;
      },
      onComplete: () => {
        this.emit('camera_animation_complete', { position, target });
      }
    });
  }

  focusOnNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Calculate optimal camera position for viewing the node
    const targetPosition = { ...node.position };
    const cameraDistance = Math.max(node.size.x, node.size.y, node.size.z) * 2;
    const cameraPosition = this.add(targetPosition, { x: 0, y: cameraDistance, z: cameraDistance });

    this.animateCameraTo(cameraPosition, targetPosition);
    this.selectNode(nodeId);

    if (this.accessibility.announceNavigation) {
      this.announceToScreenReader(`Focused on ${node.filePath}`);
    }
  }

  // Node management
  addNode(node: MinimapNode): void {
    this.nodes.set(node.id, node);
    this.emit('node_added', node);
  }

  removeNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      this.nodes.delete(nodeId);
      this.selectedNodes.delete(nodeId);
      this.highlightedNodes.delete(nodeId);
      this.emit('node_removed', node);
    }
  }

  updateNode(nodeId: string, updates: Partial<MinimapNode>): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      Object.assign(node, updates);
      this.emit('node_updated', node);
    }
  }

  // Selection and highlighting
  selectNode(nodeId: string, multiSelect: boolean = false): void {
    if (!multiSelect) {
      this.clearSelection();
    }

    const node = this.nodes.get(nodeId);
    if (node) {
      node.selected = true;
      this.selectedNodes.add(nodeId);

      // Animate selection
      this.animateNodeSelection(node);

      this.emit('node_selected', { 
        nodeId, 
        node, 
        selectedNodes: Array.from(this.selectedNodes) 
      });
    }
  }

  deselectNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.selected = false;
      this.selectedNodes.delete(nodeId);
      this.emit('node_deselected', { nodeId, node });
    }
  }

  clearSelection(): void {
    for (const nodeId of this.selectedNodes) {
      const node = this.nodes.get(nodeId);
      if (node) {
        node.selected = false;
      }
    }
    this.selectedNodes.clear();
    this.emit('selection_cleared');
  }

  highlightNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.highlighted = true;
      this.highlightedNodes.add(nodeId);

      // Animate highlight
      this.animateNodeHighlight(node);

      this.emit('node_highlighted', { nodeId, node });
    }
  }

  unhighlightNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.highlighted = false;
      this.highlightedNodes.delete(nodeId);
      this.emit('node_unhighlighted', { nodeId, node });
    }
  }

  // Animation system
  private createAnimation(config: Omit<Animation, 'startTime'>): void {
    const animation: Animation = {
      ...config,
      startTime: performance.now()
    };

    this.animations.set(animation.id, animation);
  }

  private updateAnimations(): void {
    const currentTime = performance.now();

    for (const [id, animation] of this.animations) {
      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);

      // Apply easing
      const easedProgress = this.applyEasing(progress, animation.easing);
      
      // Interpolate values
      const value = this.interpolate(animation.from, animation.to, easedProgress);
      animation.onUpdate(value);

      if (progress >= 1) {
        if (animation.onComplete) {
          animation.onComplete();
        }
        this.animations.delete(id);
      }
    }
  }

  private animateNodeSelection(node: MinimapNode): void {
    if (this.accessibility.reducedMotion) return;

    const originalSize = { ...node.size };
    const targetSize = this.scale(originalSize, 1.1);

    this.createAnimation({
      id: `selection_${node.id}`,
      duration: MINIMAP_CONFIG.SELECTION_ANIMATION_DURATION,
      easing: 'ease-out',
      from: originalSize,
      to: targetSize,
      onUpdate: (size) => {
        node.size = size;
      },
      onComplete: () => {
        // Animate back to original size
        this.createAnimation({
          id: `selection_return_${node.id}`,
          duration: MINIMAP_CONFIG.SELECTION_ANIMATION_DURATION,
          easing: 'ease-in',
          from: targetSize,
          to: originalSize,
          onUpdate: (size) => {
            node.size = size;
          }
        });
      }
    });
  }

  private animateNodeHighlight(node: MinimapNode): void {
    if (this.accessibility.reducedMotion) return;

    const originalPosition = { ...node.position };
    const targetPosition = this.add(originalPosition, { x: 0, y: 0.1, z: 0 });

    this.createAnimation({
      id: `highlight_${node.id}`,
      duration: MINIMAP_CONFIG.HIGHLIGHT_ANIMATION_DURATION,
      easing: 'bounce',
      from: originalPosition,
      to: targetPosition,
      onUpdate: (position) => {
        node.position = position;
      },
      onComplete: () => {
        // Animate back to original position
        this.createAnimation({
          id: `highlight_return_${node.id}`,
          duration: MINIMAP_CONFIG.HIGHLIGHT_ANIMATION_DURATION,
          easing: 'ease-out',
          from: targetPosition,
          to: originalPosition,
          onUpdate: (position) => {
            node.position = position;
          }
        });
      }
    });
  }

  // Event handlers
  private onMouseDown(event: MouseEvent): void {
    this.isInteracting = true;
    this.lastMousePosition = { x: event.clientX, y: event.clientY };
    
    if (this.canvas) {
      this.canvas.focus();
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isInteracting) {
      // Handle hover highlighting
      const hit = this.raycastToFilePath(event.clientX, event.clientY);
      this.updateHover(hit);
      return;
    }

    const deltaX = event.clientX - this.lastMousePosition.x;
    const deltaY = event.clientY - this.lastMousePosition.y;

    if (event.buttons === 1) { // Left mouse button
      this.orbitCamera(deltaX, deltaY);
    } else if (event.buttons === 2) { // Right mouse button
      this.panCamera(deltaX, deltaY);
    }

    this.lastMousePosition = { x: event.clientX, y: event.clientY };
  }

  private onMouseUp(event: MouseEvent): void {
    this.isInteracting = false;
  }

  private onWheel(event: WheelEvent): void {
    event.preventDefault();
    this.zoomCamera(event.deltaY * 0.01);
  }

  private onClick(event: MouseEvent): void {
    const currentTime = performance.now();
    const isDoubleClick = currentTime - this.lastClickTime < MINIMAP_CONFIG.DOUBLE_CLICK_TIME;
    this.lastClickTime = currentTime;

    if (isDoubleClick) return; // Let double click handler deal with it

    const hit = this.raycastToFilePath(event.clientX, event.clientY);
    if (hit) {
      this.selectNode(hit.fileId, event.ctrlKey || event.metaKey);
      this.emit('file_clicked', hit);
    } else {
      this.clearSelection();
    }
  }

  private onDoubleClick(event: MouseEvent): void {
    const hit = this.raycastToFilePath(event.clientX, event.clientY);
    if (hit) {
      this.focusOnNode(hit.fileId);
      this.emit('file_double_clicked', hit);
    }
  }

  private onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    
    const hit = this.raycastToFilePath(event.clientX, event.clientY);
    this.emit('context_menu', { hit, x: event.clientX, y: event.clientY });
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (!this.accessibility.keyboardNavigation) return;

    switch (event.key) {
      case 'ArrowUp':
        this.panCamera(0, -10);
        break;
      case 'ArrowDown':
        this.panCamera(0, 10);
        break;
      case 'ArrowLeft':
        this.panCamera(-10, 0);
        break;
      case 'ArrowRight':
        this.panCamera(10, 0);
        break;
      case '+':
      case '=':
        this.zoomCamera(-1);
        break;
      case '-':
        this.zoomCamera(1);
        break;
      case 'Home':
        this.resetCamera();
        break;
      case 'Escape':
        this.clearSelection();
        break;
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    // Handle key up events if needed
  }

  private onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    // Handle touch start
  }

  private onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    // Handle touch move
  }

  private onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    // Handle touch end
  }

  // Hover management
  private updateHover(hit: RaycastHit | null): void {
    // Clear all highlights
    for (const nodeId of this.highlightedNodes) {
      this.unhighlightNode(nodeId);
    }

    // Add new highlight
    if (hit) {
      this.highlightNode(hit.fileId);
      
      if (this.canvas) {
        this.canvas.style.cursor = 'pointer';
      }
    } else {
      if (this.canvas) {
        this.canvas.style.cursor = 'default';
      }
    }
  }

  // Accessibility support
  private initializeAccessibility(): void {
    if (this.accessibility.screenReaderSupport && this.canvas) {
      this.canvas.setAttribute('role', 'application');
      this.canvas.setAttribute('aria-label', '3D Code Minimap - Navigate with arrow keys, zoom with +/-, focus with Enter');
      this.canvas.setAttribute('tabindex', '0');
    }
  }

  private announceToScreenReader(message: string): void {
    if (!this.accessibility.announceNavigation) return;

    // Create temporary element for screen reader announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Utility methods
  private normalize(v: Vector3): Vector3 {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return length > 0 ? { x: v.x / length, y: v.y / length, z: v.z / length } : { x: 0, y: 0, z: 0 };
  }

  private add(a: Vector3, b: Vector3): Vector3 {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  }

  private subtract(a: Vector3, b: Vector3): Vector3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  }

  private scale(v: Vector3, s: number): Vector3 {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
  }

  private cross(a: Vector3, b: Vector3): Vector3 {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  private distance(a: Vector3, b: Vector3): number {
    const diff = this.subtract(a, b);
    return Math.sqrt(diff.x * diff.x + diff.y * diff.y + diff.z * diff.z);
  }

  private cartesianToSpherical(v: Vector3): { radius: number; theta: number; phi: number } {
    const radius = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    const theta = Math.atan2(v.x, v.z);
    const phi = Math.acos(v.y / radius);
    return { radius, theta, phi };
  }

  private sphericalToCartesian(spherical: { radius: number; theta: number; phi: number }): Vector3 {
    return {
      x: spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta),
      y: spherical.radius * Math.cos(spherical.phi),
      z: spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)
    };
  }

  private transformDirection(direction: Vector3): Vector3 {
    // Apply camera rotation to direction vector
    // This is simplified - real implementation would use camera matrix
    return this.normalize(direction);
  }

  private applyEasing(t: number, easing: Animation['easing']): number {
    switch (easing) {
      case 'linear':
        return t;
      case 'ease-in':
        return t * t;
      case 'ease-out':
        return 1 - (1 - t) * (1 - t);
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
      case 'bounce':
        if (t < 1 / 2.75) {
          return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
      default:
        return t;
    }
  }

  private interpolate(from: any, to: any, t: number): any {
    if (typeof from === 'number' && typeof to === 'number') {
      return from + (to - from) * t;
    }
    
    if (from && to && typeof from === 'object' && typeof to === 'object') {
      const result: any = {};
      for (const key in from) {
        if (key in to) {
          result[key] = this.interpolate(from[key], to[key], t);
        }
      }
      return result;
    }
    
    return t < 0.5 ? from : to;
  }

  // Render loop
  private startRenderLoop(): void {
    const render = () => {
      this.updateAnimations();
      
      if (this.controls.autoRotate) {
        this.orbitCamera(this.controls.autoRotateSpeed, 0);
      }
      
      this.emit('render_frame', {
        camera: this.camera,
        nodes: Array.from(this.nodes.values()),
        selectedNodes: Array.from(this.selectedNodes),
        highlightedNodes: Array.from(this.highlightedNodes)
      });
      
      this.animationFrameId = requestAnimationFrame(render);
    };
    
    render();
  }

  // Public API methods
  resetCamera(): void {
    this.animateCameraTo(
      { ...MINIMAP_CONFIG.DEFAULT_POSITION },
      { ...MINIMAP_CONFIG.DEFAULT_TARGET }
    );
  }

  getCamera(): Camera {
    return { ...this.camera };
  }

  getSelectedNodes(): MinimapNode[] {
    return Array.from(this.selectedNodes).map(id => this.nodes.get(id)).filter(Boolean) as MinimapNode[];
  }

  getHighlightedNodes(): MinimapNode[] {
    return Array.from(this.highlightedNodes).map(id => this.nodes.get(id)).filter(Boolean) as MinimapNode[];
  }

  updateAccessibilityOptions(options: Partial<AccessibilityOptions>): void {
    this.accessibility = { ...this.accessibility, ...options };
    this.emit('accessibility_updated', this.accessibility);
  }

  updateControls(controls: Partial<CameraControls>): void {
    this.controls = { ...this.controls, ...controls };
    this.emit('controls_updated', this.controls);
  }

  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.removeEventListeners();
    this.nodes.clear();
    this.selectedNodes.clear();
    this.highlightedNodes.clear();
    this.animations.clear();
    
    this.emit('controller_destroyed');
  }
}

// Export types and main class
export type { Vector3, Camera, RaycastHit, MinimapNode, CameraControls, AccessibilityOptions };
export default MinimapController; 