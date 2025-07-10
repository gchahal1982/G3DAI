/**
 * G3D Camera Controller - Enhanced camera controls with smooth animations
 * Provides orbit, pan, zoom controls with touch and mouse support
 */

import { vec3, mat4, quat } from 'gl-matrix';
import { G3DCamera } from './G3DNativeRenderer';

// Camera control modes
export enum G3DCameraMode {
    ORBIT = 'orbit',
    FLY = 'fly',
    FIRST_PERSON = 'first_person',
    FIXED = 'fixed',
    FOLLOW = 'follow'
}

// Camera animation easing functions
export enum G3DEasing {
    LINEAR = 'linear',
    EASE_IN = 'ease_in',
    EASE_OUT = 'ease_out',
    EASE_IN_OUT = 'ease_in_out',
    CUBIC = 'cubic',
    SPRING = 'spring'
}

// Camera configuration
export interface G3DCameraConfig {
    mode: G3DCameraMode;
    enableDamping: boolean;
    dampingFactor: number;
    rotateSpeed: number;
    panSpeed: number;
    zoomSpeed: number;
    minDistance: number;
    maxDistance: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;
    enableKeys: boolean;
    keys: {
        forward: string;
        backward: string;
        left: string;
        right: string;
        up: string;
        down: string;
    };
    touchConfig: {
        rotateSpeed: number;
        panSpeed: number;
        zoomSpeed: number;
    };
}

// Camera animation
interface G3DCameraAnimation {
    startPosition: vec3;
    endPosition: vec3;
    startTarget: vec3;
    endTarget: vec3;
    startTime: number;
    duration: number;
    easing: G3DEasing;
    onComplete?: () => void;
}

// Input state
interface G3DInputState {
    mouseButtons: boolean[];
    mousePosition: vec2;
    lastMousePosition: vec2;
    touches: Map<number, Touch>;
    keys: Set<string>;
}

// Main G3D Camera Controller Class
export class G3DCameraController {
    private camera: G3DCamera;
    private domElement: HTMLElement;
    private config: G3DCameraConfig;
    private inputState: G3DInputState;

    // Orbit controls state
    private spherical = {
        radius: 10,
        theta: 0,  // Azimuth angle
        phi: Math.PI / 2  // Polar angle
    };
    private target: vec3 = vec3.create();
    private offset: vec3 = vec3.create();

    // Movement state
    private velocity: vec3 = vec3.create();
    private rotationVelocity = { theta: 0, phi: 0 };
    private panVelocity: vec3 = vec3.create();

    // Animation state
    private currentAnimation: G3DCameraAnimation | null = null;

    // Touch gesture state
    private lastPinchDistance: number = 0;
    private lastTouchCenter: vec2 = [0, 0];

    // Frame timing
    private lastFrameTime: number = 0;

    constructor(camera: G3DCamera, domElement: HTMLElement, config?: Partial<G3DCameraConfig>) {
        this.camera = camera;
        this.domElement = domElement;

        // Default configuration
        this.config = {
            mode: G3DCameraMode.ORBIT,
            enableDamping: true,
            dampingFactor: 0.05,
            rotateSpeed: 1.0,
            panSpeed: 1.0,
            zoomSpeed: 1.0,
            minDistance: 1,
            maxDistance: 1000,
            minPolarAngle: 0,
            maxPolarAngle: Math.PI,
            minAzimuthAngle: -Infinity,
            maxAzimuthAngle: Infinity,
            enableKeys: true,
            keys: {
                forward: 'w',
                backward: 's',
                left: 'a',
                right: 'd',
                up: 'q',
                down: 'e'
            },
            touchConfig: {
                rotateSpeed: 0.5,
                panSpeed: 0.5,
                zoomSpeed: 0.5
            },
            ...config
        };

        // Initialize input state
        this.inputState = {
            mouseButtons: [false, false, false],
            mousePosition: [0, 0],
            lastMousePosition: [0, 0],
            touches: new Map(),
            keys: new Set()
        };

        // Initialize camera position from current state
        this.updateSphericalFromCamera();

        // Setup event listeners
        this.setupEventListeners();

        // Start update loop
        this.startUpdateLoop();
    }

    private setupEventListeners(): void {
        // Mouse events
        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.domElement.addEventListener('wheel', this.onWheel.bind(this));
        this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

        // Touch events
        this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this));

        // Keyboard events
        if (this.config.enableKeys) {
            window.addEventListener('keydown', this.onKeyDown.bind(this));
            window.addEventListener('keyup', this.onKeyUp.bind(this));
        }

        // Prevent default touch behavior
        this.domElement.style.touchAction = 'none';
    }

    private onMouseDown(event: MouseEvent): void {
        event.preventDefault();
        this.inputState.mouseButtons[event.button] = true;
        this.inputState.mousePosition = [event.clientX, event.clientY];
        this.inputState.lastMousePosition = [event.clientX, event.clientY];
    }

    private onMouseMove(event: MouseEvent): void {
        if (!this.inputState.mouseButtons.some(b => b)) return;

        const deltaX = event.clientX - this.inputState.lastMousePosition[0];
        const deltaY = event.clientY - this.inputState.lastMousePosition[1];

        if (this.config.mode === G3DCameraMode.ORBIT) {
            if (this.inputState.mouseButtons[0]) {  // Left button - rotate
                this.rotateOrbit(deltaX, deltaY);
            } else if (this.inputState.mouseButtons[1]) {  // Middle button - zoom
                this.zoomOrbit(deltaY);
            } else if (this.inputState.mouseButtons[2]) {  // Right button - pan
                this.panOrbit(deltaX, deltaY);
            }
        } else if (this.config.mode === G3DCameraMode.FLY) {
            if (this.inputState.mouseButtons[0]) {  // Left button - look around
                this.rotateFly(deltaX, deltaY);
            }
        }

        this.inputState.lastMousePosition = [event.clientX, event.clientY];
    }

    private onMouseUp(event: MouseEvent): void {
        this.inputState.mouseButtons[event.button] = false;
    }

    private onWheel(event: WheelEvent): void {
        event.preventDefault();

        if (this.config.mode === G3DCameraMode.ORBIT) {
            this.zoomOrbit(event.deltaY * 0.5);
        } else if (this.config.mode === G3DCameraMode.FLY) {
            this.moveFly(0, 0, event.deltaY * 0.01);
        }
    }

    private onTouchStart(event: TouchEvent): void {
        event.preventDefault();

        // Update touch map
        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            this.inputState.touches.set(touch.identifier, touch);
        }

        // Handle gestures
        if (event.touches.length === 2) {
            // Initialize pinch
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            this.lastPinchDistance = this.getTouchDistance(touch1, touch2);
            this.lastTouchCenter = this.getTouchCenter(touch1, touch2);
        }
    }

    private onTouchMove(event: TouchEvent): void {
        event.preventDefault();

        // Update touch map
        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            this.inputState.touches.set(touch.identifier, touch);
        }

        if (event.touches.length === 1) {
            // Single touch - rotate
            const touch = event.touches[0];
            const lastTouch = this.inputState.touches.get(touch.identifier);

            if (lastTouch) {
                const deltaX = touch.clientX - lastTouch.clientX;
                const deltaY = touch.clientY - lastTouch.clientY;
                this.rotateOrbit(deltaX * this.config.touchConfig.rotateSpeed,
                    deltaY * this.config.touchConfig.rotateSpeed);
            }
        } else if (event.touches.length === 2) {
            // Two touches - pinch zoom and pan
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];

            // Pinch zoom
            const currentDistance = this.getTouchDistance(touch1, touch2);
            const deltaDistance = currentDistance - this.lastPinchDistance;
            this.zoomOrbit(-deltaDistance * this.config.touchConfig.zoomSpeed);
            this.lastPinchDistance = currentDistance;

            // Pan
            const currentCenter = this.getTouchCenter(touch1, touch2);
            const deltaX = currentCenter[0] - this.lastTouchCenter[0];
            const deltaY = currentCenter[1] - this.lastTouchCenter[1];
            this.panOrbit(deltaX * this.config.touchConfig.panSpeed,
                deltaY * this.config.touchConfig.panSpeed);
            this.lastTouchCenter = currentCenter;
        }
    }

    private onTouchEnd(event: TouchEvent): void {
        // Remove ended touches
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            this.inputState.touches.delete(touch.identifier);
        }
    }

    private onKeyDown(event: KeyboardEvent): void {
        this.inputState.keys.add(event.key.toLowerCase());
    }

    private onKeyUp(event: KeyboardEvent): void {
        this.inputState.keys.delete(event.key.toLowerCase());
    }

    // Touch utility functions

    private getTouchDistance(touch1: Touch, touch2: Touch): number {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private getTouchCenter(touch1: Touch, touch2: Touch): vec2 {
        return [
            (touch1.clientX + touch2.clientX) * 0.5,
            (touch1.clientY + touch2.clientY) * 0.5
        ];
    }

    // Orbit control methods

    private rotateOrbit(deltaX: number, deltaY: number): void {
        const rotateSpeed = this.config.rotateSpeed;

        // Update angles
        this.rotationVelocity.theta = -deltaX * rotateSpeed * 0.01;
        this.rotationVelocity.phi = -deltaY * rotateSpeed * 0.01;
    }

    private panOrbit(deltaX: number, deltaY: number): void {
        const panSpeed = this.config.panSpeed;
        const distance = this.spherical.radius;

        // Calculate pan offset in camera space
        const panOffset = vec3.create();
        const cameraMatrix = mat4.create();
        mat4.lookAt(cameraMatrix, this.camera.getPosition(), this.target, [0, 1, 0]);

        // Right vector
        const right = vec3.fromValues(cameraMatrix[0], cameraMatrix[4], cameraMatrix[8]);
        vec3.scale(right, right, -deltaX * panSpeed * 0.001 * distance);

        // Up vector
        const up = vec3.fromValues(cameraMatrix[1], cameraMatrix[5], cameraMatrix[9]);
        vec3.scale(up, up, deltaY * panSpeed * 0.001 * distance);

        vec3.add(panOffset, right, up);
        vec3.add(this.panVelocity, this.panVelocity, panOffset);
    }

    private zoomOrbit(delta: number): void {
        const zoomSpeed = this.config.zoomSpeed;
        this.spherical.radius *= Math.pow(0.95, -delta * zoomSpeed * 0.01);
        this.spherical.radius = Math.max(this.config.minDistance,
            Math.min(this.config.maxDistance, this.spherical.radius));
    }

    // Fly control methods

    private rotateFly(deltaX: number, deltaY: number): void {
        const rotateSpeed = this.config.rotateSpeed;
        this.rotationVelocity.theta = -deltaX * rotateSpeed * 0.001;
        this.rotationVelocity.phi = -deltaY * rotateSpeed * 0.001;
    }

    private moveFly(forward: number, right: number, up: number): void {
        const moveSpeed = this.config.panSpeed;

        // Get camera direction vectors
        const cameraMatrix = mat4.create();
        mat4.lookAt(cameraMatrix, this.camera.getPosition(), this.target, [0, 1, 0]);

        const forwardVec = vec3.fromValues(-cameraMatrix[2], -cameraMatrix[6], -cameraMatrix[10]);
        const rightVec = vec3.fromValues(cameraMatrix[0], cameraMatrix[4], cameraMatrix[8]);
        const upVec = vec3.fromValues(0, 1, 0);

        // Calculate velocity
        vec3.scale(forwardVec, forwardVec, forward * moveSpeed);
        vec3.scale(rightVec, rightVec, right * moveSpeed);
        vec3.scale(upVec, upVec, up * moveSpeed);

        vec3.add(this.velocity, this.velocity, forwardVec);
        vec3.add(this.velocity, this.velocity, rightVec);
        vec3.add(this.velocity, this.velocity, upVec);
    }

    // Update methods

    private startUpdateLoop(): void {
        const update = (timestamp: number) => {
            const deltaTime = timestamp - this.lastFrameTime;
            this.lastFrameTime = timestamp;

            if (deltaTime > 0) {
                this.update(deltaTime / 1000);  // Convert to seconds
            }

            requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
    }

    private update(deltaTime: number): void {
        // Update animation
        if (this.currentAnimation) {
            this.updateAnimation(deltaTime);
        }

        // Update based on mode
        switch (this.config.mode) {
            case G3DCameraMode.ORBIT:
                this.updateOrbit(deltaTime);
                break;
            case G3DCameraMode.FLY:
                this.updateFly(deltaTime);
                break;
            case G3DCameraMode.FIRST_PERSON:
                this.updateFirstPerson(deltaTime);
                break;
        }

        // Handle keyboard input
        if (this.config.enableKeys) {
            this.handleKeyboardInput(deltaTime);
        }
    }

    private updateOrbit(deltaTime: number): void {
        // Apply rotation velocity
        this.spherical.theta += this.rotationVelocity.theta;
        this.spherical.phi += this.rotationVelocity.phi;

        // Clamp angles
        this.spherical.theta = Math.max(this.config.minAzimuthAngle,
            Math.min(this.config.maxAzimuthAngle, this.spherical.theta));
        this.spherical.phi = Math.max(this.config.minPolarAngle,
            Math.min(this.config.maxPolarAngle, this.spherical.phi));

        // Apply pan velocity
        vec3.add(this.target, this.target, this.panVelocity);

        // Convert spherical to cartesian
        const sinPhiRadius = Math.sin(this.spherical.phi) * this.spherical.radius;
        this.offset[0] = sinPhiRadius * Math.sin(this.spherical.theta);
        this.offset[1] = Math.cos(this.spherical.phi) * this.spherical.radius;
        this.offset[2] = sinPhiRadius * Math.cos(this.spherical.theta);

        // Update camera position
        const newPosition = vec3.create();
        vec3.add(newPosition, this.target, this.offset);
        this.camera.setPosition(newPosition[0], newPosition[1], newPosition[2]);
        this.camera.lookAt(this.target[0], this.target[1], this.target[2]);

        // Apply damping
        if (this.config.enableDamping) {
            const damping = 1 - this.config.dampingFactor;
            this.rotationVelocity.theta *= damping;
            this.rotationVelocity.phi *= damping;
            vec3.scale(this.panVelocity, this.panVelocity, damping);
        } else {
            this.rotationVelocity.theta = 0;
            this.rotationVelocity.phi = 0;
            vec3.set(this.panVelocity, 0, 0, 0);
        }
    }

    private updateFly(deltaTime: number): void {
        // Apply rotation
        const rotation = quat.create();
        quat.rotateY(rotation, rotation, this.rotationVelocity.theta);
        quat.rotateX(rotation, rotation, this.rotationVelocity.phi);

        // Update camera orientation
        const forward = vec3.fromValues(0, 0, -1);
        vec3.transformQuat(forward, forward, rotation);
        vec3.add(this.target, this.camera.getPosition(), forward);
        this.camera.lookAt(this.target[0], this.target[1], this.target[2]);

        // Apply velocity
        const currentPosition = this.camera.getPosition();
        const newPosition = vec3.create();
        vec3.add(newPosition, currentPosition, this.velocity);
        this.camera.setPosition(newPosition[0], newPosition[1], newPosition[2]);
        vec3.add(this.target, this.target, this.velocity);

        // Apply damping
        if (this.config.enableDamping) {
            const damping = 1 - this.config.dampingFactor;
            this.rotationVelocity.theta *= damping;
            this.rotationVelocity.phi *= damping;
            vec3.scale(this.velocity, this.velocity, damping);
        } else {
            this.rotationVelocity.theta = 0;
            this.rotationVelocity.phi = 0;
            vec3.set(this.velocity, 0, 0, 0);
        }
    }

    private updateFirstPerson(deltaTime: number): void {
        // Similar to fly mode but with different controls
        this.updateFly(deltaTime);
    }

    private handleKeyboardInput(deltaTime: number): void {
        const keys = this.config.keys;
        const moveSpeed = this.config.panSpeed * deltaTime;

        let forward = 0;
        let right = 0;
        let up = 0;

        if (this.inputState.keys.has(keys.forward)) forward += 1;
        if (this.inputState.keys.has(keys.backward)) forward -= 1;
        if (this.inputState.keys.has(keys.right)) right += 1;
        if (this.inputState.keys.has(keys.left)) right -= 1;
        if (this.inputState.keys.has(keys.up)) up += 1;
        if (this.inputState.keys.has(keys.down)) up -= 1;

        if (this.config.mode === G3DCameraMode.FLY ||
            this.config.mode === G3DCameraMode.FIRST_PERSON) {
            this.moveFly(forward * moveSpeed, right * moveSpeed, up * moveSpeed);
        }
    }

    // Animation methods

    animateTo(position: vec3, target: vec3, duration: number, easing: G3DEasing = G3DEasing.EASE_IN_OUT): Promise<void> {
        return new Promise((resolve) => {
            this.currentAnimation = {
                startPosition: vec3.clone(this.camera.getPosition()),
                endPosition: vec3.clone(position),
                startTarget: vec3.clone(this.target),
                endTarget: vec3.clone(target),
                startTime: Date.now(),
                duration: duration * 1000,  // Convert to milliseconds
                easing,
                onComplete: resolve
            };
        });
    }

    private updateAnimation(deltaTime: number): void {
        if (!this.currentAnimation) return;

        const elapsed = Date.now() - this.currentAnimation.startTime;
        const progress = Math.min(elapsed / this.currentAnimation.duration, 1);

        // Apply easing
        const t = this.applyEasing(progress, this.currentAnimation.easing);

        // Interpolate position
        const interpolatedPosition = vec3.create();
        vec3.lerp(interpolatedPosition,
            this.currentAnimation.startPosition,
            this.currentAnimation.endPosition, t);

        // Interpolate target
        vec3.lerp(this.target,
            this.currentAnimation.startTarget,
            this.currentAnimation.endTarget, t);

        // Update camera
        this.camera.setPosition(interpolatedPosition[0],
            interpolatedPosition[1],
            interpolatedPosition[2]);
        this.camera.lookAt(this.target[0], this.target[1], this.target[2]);

        // Update spherical coordinates
        this.updateSphericalFromCamera();

        // Check completion
        if (progress >= 1) {
            if (this.currentAnimation.onComplete) {
                this.currentAnimation.onComplete();
            }
            this.currentAnimation = null;
        }
    }

    private applyEasing(t: number, easing: G3DEasing): number {
        switch (easing) {
            case G3DEasing.LINEAR:
                return t;
            case G3DEasing.EASE_IN:
                return t * t;
            case G3DEasing.EASE_OUT:
                return t * (2 - t);
            case G3DEasing.EASE_IN_OUT:
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            case G3DEasing.CUBIC:
                return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
            case G3DEasing.SPRING:
                return 1 - Math.cos(t * Math.PI * 4) * Math.exp(-t * 6);
            default:
                return t;
        }
    }

    // Utility methods

    private updateSphericalFromCamera(): void {
        vec3.subtract(this.offset, this.camera.getPosition(), this.target);
        this.spherical.radius = vec3.length(this.offset);

        if (this.spherical.radius === 0) {
            this.spherical.theta = 0;
            this.spherical.phi = 0;
        } else {
            this.spherical.theta = Math.atan2(this.offset[0], this.offset[2]);
            this.spherical.phi = Math.acos(Math.max(-1, Math.min(1, this.offset[1] / this.spherical.radius)));
        }
    }

    // Public API

    setMode(mode: G3DCameraMode): void {
        this.config.mode = mode;

        // Reset velocities when switching modes
        vec3.set(this.velocity, 0, 0, 0);
        this.rotationVelocity = { theta: 0, phi: 0 };
        vec3.set(this.panVelocity, 0, 0, 0);
    }

    getMode(): G3DCameraMode {
        return this.config.mode;
    }

    setTarget(x: number, y: number, z: number): void {
        vec3.set(this.target, x, y, z);
        this.updateSphericalFromCamera();
    }

    getTarget(): vec3 {
        return vec3.clone(this.target);
    }

    setDistance(distance: number): void {
        this.spherical.radius = Math.max(this.config.minDistance,
            Math.min(this.config.maxDistance, distance));
    }

    getDistance(): number {
        return this.spherical.radius;
    }

    reset(): void {
        this.camera.setPosition(0, 0, 10);
        this.camera.lookAt(0, 0, 0);
        vec3.set(this.target, 0, 0, 0);
        this.updateSphericalFromCamera();

        // Reset velocities
        vec3.set(this.velocity, 0, 0, 0);
        this.rotationVelocity = { theta: 0, phi: 0 };
        vec3.set(this.panVelocity, 0, 0, 0);

        // Cancel animation
        this.currentAnimation = null;
    }

    dispose(): void {
        // Remove event listeners
        this.domElement.removeEventListener('mousedown', this.onMouseDown.bind(this));
        this.domElement.removeEventListener('mousemove', this.onMouseMove.bind(this));
        this.domElement.removeEventListener('mouseup', this.onMouseUp.bind(this));
        this.domElement.removeEventListener('wheel', this.onWheel.bind(this));
        this.domElement.removeEventListener('touchstart', this.onTouchStart.bind(this));
        this.domElement.removeEventListener('touchmove', this.onTouchMove.bind(this));
        this.domElement.removeEventListener('touchend', this.onTouchEnd.bind(this));

        if (this.config.enableKeys) {
            window.removeEventListener('keydown', this.onKeyDown.bind(this));
            window.removeEventListener('keyup', this.onKeyUp.bind(this));
        }
    }
}

// Type definitions
type vec2 = [number, number];

// Export factory function
export function createG3DCameraController(
    camera: G3DCamera,
    domElement: HTMLElement,
    config?: Partial<G3DCameraConfig>
): G3DCameraController {
    return new G3DCameraController(camera, domElement, config);
}