/**
 * G3DAnimationEngine.ts
 * Advanced 3D animation and keyframe interpolation engine for G3D AnnotateAI
 */

import { G3DComputeShaders } from '../g3d-ai/G3DComputeShaders';

export interface AnimationClip {
    id: string;
    name: string;
    duration: number;
    tracks: AnimationTrack[];
    loop: boolean;
    blendMode: BlendMode;
}

export interface AnimationTrack {
    id: string;
    target: string;
    property: string;
    keyframes: Keyframe[];
    interpolation: InterpolationType;
}

export interface Keyframe {
    time: number;
    value: any;
    inTangent?: number[];
    outTangent?: number[];
}

export type InterpolationType = 'linear' | 'step' | 'cubic' | 'bezier' | 'hermite';
export type BlendMode = 'override' | 'additive' | 'multiply' | 'screen';

export interface AnimationState {
    clip: string;
    time: number;
    weight: number;
    speed: number;
    enabled: boolean;
    loop: boolean;
}

export interface AnimationMixer {
    states: Map<string, AnimationState>;
    crossfades: CrossfadeTransition[];
    globalTime: number;
    timeScale: number;
}

export interface CrossfadeTransition {
    fromClip: string;
    toClip: string;
    duration: number;
    currentTime: number;
    curve: EasingCurve;
}

export type EasingCurve = 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'bounce' | 'elastic';

export interface AnimationTarget {
    id: string;
    transform: Transform3D;
    properties: Map<string, any>;
}

export interface Transform3D {
    position: [number, number, number];
    rotation: [number, number, number, number]; // quaternion
    scale: [number, number, number];
}

export interface AnimationConfig {
    playback: PlaybackConfig;
    blending: BlendingConfig;
    optimization: OptimizationConfig;
    constraints: ConstraintConfig;
}

export interface PlaybackConfig {
    autoPlay: boolean;
    defaultSpeed: number;
    globalTimeScale: number;
    maxDeltaTime: number;
}

export interface BlendingConfig {
    enableBlending: boolean;
    maxBlendStates: number;
    normalizeWeights: boolean;
    blendThreshold: number;
}

export interface OptimizationConfig {
    enableCulling: boolean;
    cullDistance: number;
    enableLOD: boolean;
    lodLevels: number[];
}

export interface ConstraintConfig {
    enableConstraints: boolean;
    maxConstraints: number;
    solverIterations: number;
}

export class G3DAnimationEngine {
    private computeShaders: G3DComputeShaders;
    private clips: Map<string, AnimationClip> = new Map();
    private targets: Map<string, AnimationTarget> = new Map();
    private mixer: AnimationMixer;
    private config: AnimationConfig;

    // Performance tracking
    private stats = {
        activeClips: 0,
        totalKeyframes: 0,
        blendOperations: 0,
        frameTime: 0
    };

    constructor(config?: Partial<AnimationConfig>) {
        this.config = this.createDefaultConfig(config);
        this.mixer = this.createMixer();
        this.initializeComputeShaders();
    }

    private initializeComputeShaders(): void {
        this.computeShaders = new G3DComputeShaders({
            backend: 'webgpu',
            device: {
                preferredDevice: 'gpu',
                minComputeUnits: 4,
                minMemorySize: 256 * 1024 * 1024,
                features: ['fp16']
            },
            memory: {
                maxBufferSize: 1024 * 1024 * 1024,
                alignment: 256,
                caching: 'adaptive',
                pooling: { enabled: true, initialSize: 64, maxSize: 512, growthFactor: 2 },
                compression: { enabled: false, algorithm: 'lz4', level: 1 }
            },
            optimization: {
                autoTuning: true,
                workGroupOptimization: true,
                memoryCoalescing: true,
                loopUnrolling: true,
                constantFolding: true,
                deadCodeElimination: true
            },
            debugging: {
                enabled: false,
                profiling: true,
                validation: false,
                verboseLogging: false
            },
            kernels: []
        });
    }

    public async initialize(): Promise<void> {
        console.log('Initializing G3D Animation Engine...');
        await this.computeShaders.init();
        await this.createAnimationKernels();
        console.log('G3D Animation Engine initialized successfully');
    }

    public addClip(clip: AnimationClip): void {
        this.clips.set(clip.id, clip);
        this.stats.totalKeyframes += clip.tracks.reduce((sum, track) => sum + track.keyframes.length, 0);
        console.log(`Added animation clip: ${clip.name} (${clip.duration}s)`);
    }

    public addTarget(target: AnimationTarget): void {
        this.targets.set(target.id, target);
        console.log(`Added animation target: ${target.id}`);
    }

    public play(clipId: string, options: Partial<AnimationState> = {}): void {
        const clip = this.clips.get(clipId);
        if (!clip) {
            console.warn(`Animation clip not found: ${clipId}`);
            return;
        }

        const state: AnimationState = {
            clip: clipId,
            time: 0,
            weight: 1.0,
            speed: this.config.playback.defaultSpeed,
            enabled: true,
            loop: clip.loop,
            ...options
        };

        this.mixer.states.set(clipId, state);
        this.stats.activeClips = this.mixer.states.size;
        console.log(`Playing animation: ${clip.name}`);
    }

    public stop(clipId: string): void {
        this.mixer.states.delete(clipId);
        this.stats.activeClips = this.mixer.states.size;
        console.log(`Stopped animation: ${clipId}`);
    }

    public crossfade(fromClip: string, toClip: string, duration: number, curve: EasingCurve = 'ease_in_out'): void {
        const transition: CrossfadeTransition = {
            fromClip,
            toClip,
            duration,
            currentTime: 0,
            curve
        };

        this.mixer.crossfades.push(transition);
        this.play(toClip, { weight: 0 });
        console.log(`Starting crossfade from ${fromClip} to ${toClip} (${duration}s)`);
    }

    public update(deltaTime: number): void {
        const startTime = Date.now();

        // Clamp delta time
        deltaTime = Math.min(deltaTime, this.config.playback.maxDeltaTime);
        deltaTime *= this.config.playback.globalTimeScale;

        this.mixer.globalTime += deltaTime;

        // Update crossfades
        this.updateCrossfades(deltaTime);

        // Update animation states
        this.updateAnimationStates(deltaTime);

        // Apply animations to targets
        this.applyAnimations();

        this.stats.frameTime = Date.now() - startTime;
    }

    private updateCrossfades(deltaTime: number): void {
        for (let i = this.mixer.crossfades.length - 1; i >= 0; i--) {
            const crossfade = this.mixer.crossfades[i];
            crossfade.currentTime += deltaTime;

            const progress = Math.min(crossfade.currentTime / crossfade.duration, 1.0);
            const easedProgress = this.applyEasing(progress, crossfade.curve);

            // Update weights
            const fromState = this.mixer.states.get(crossfade.fromClip);
            const toState = this.mixer.states.get(crossfade.toClip);

            if (fromState) fromState.weight = 1.0 - easedProgress;
            if (toState) toState.weight = easedProgress;

            // Remove completed crossfades
            if (progress >= 1.0) {
                if (fromState) this.stop(crossfade.fromClip);
                this.mixer.crossfades.splice(i, 1);
            }
        }
    }

    private updateAnimationStates(deltaTime: number): void {
        for (const state of this.mixer.states.values()) {
            if (!state.enabled) continue;

            const clip = this.clips.get(state.clip);
            if (!clip) continue;

            // Update time
            state.time += deltaTime * state.speed;

            // Handle looping
            if (state.loop && state.time > clip.duration) {
                state.time = state.time % clip.duration;
            } else if (state.time > clip.duration) {
                state.time = clip.duration;
                state.enabled = false;
            }
        }
    }

    private applyAnimations(): void {
        // Reset all targets
        for (const target of this.targets.values()) {
            target.properties.clear();
        }

        // Collect all animation contributions
        const contributions = new Map<string, Map<string, any[]>>();

        for (const state of this.mixer.states.values()) {
            if (!state.enabled || state.weight <= 0) continue;

            const clip = this.clips.get(state.clip);
            if (!clip) continue;

            for (const track of clip.tracks) {
                const value = this.evaluateTrack(track, state.time);

                if (!contributions.has(track.target)) {
                    contributions.set(track.target, new Map());
                }

                const targetContributions = contributions.get(track.target)!;
                if (!targetContributions.has(track.property)) {
                    targetContributions.set(track.property, []);
                }

                targetContributions.get(track.property)!.push({
                    value,
                    weight: state.weight,
                    blendMode: clip.blendMode
                });
            }
        }

        // Blend and apply contributions
        for (const [targetId, properties] of contributions) {
            const target = this.targets.get(targetId);
            if (!target) continue;

            for (const [property, contribs] of properties) {
                const blendedValue = this.blendValues(contribs);
                this.applyPropertyValue(target, property, blendedValue);
            }
        }

        this.stats.blendOperations = contributions.size;
    }

    private evaluateTrack(track: AnimationTrack, time: number): any {
        if (track.keyframes.length === 0) return null;
        if (track.keyframes.length === 1) return track.keyframes[0].value;

        // Find surrounding keyframes
        let keyframe1 = track.keyframes[0];
        let keyframe2 = track.keyframes[track.keyframes.length - 1];

        for (let i = 0; i < track.keyframes.length - 1; i++) {
            if (time >= track.keyframes[i].time && time <= track.keyframes[i + 1].time) {
                keyframe1 = track.keyframes[i];
                keyframe2 = track.keyframes[i + 1];
                break;
            }
        }

        if (keyframe1 === keyframe2) return keyframe1.value;

        // Calculate interpolation factor
        const duration = keyframe2.time - keyframe1.time;
        const t = duration > 0 ? (time - keyframe1.time) / duration : 0;

        // Apply interpolation
        return this.interpolateValues(keyframe1, keyframe2, t, track.interpolation);
    }

    private interpolateValues(kf1: Keyframe, kf2: Keyframe, t: number, type: InterpolationType): any {
        switch (type) {
            case 'step':
                return kf1.value;

            case 'linear':
                return this.lerp(kf1.value, kf2.value, t);

            case 'cubic':
                return this.cubicInterpolate(kf1.value, kf2.value, t);

            case 'bezier':
                return this.bezierInterpolate(kf1, kf2, t);

            case 'hermite':
                return this.hermiteInterpolate(kf1, kf2, t);

            default:
                return this.lerp(kf1.value, kf2.value, t);
        }
    }

    private lerp(a: any, b: any, t: number): any {
        if (typeof a === 'number' && typeof b === 'number') {
            return a + (b - a) * t;
        }

        if (Array.isArray(a) && Array.isArray(b)) {
            return a.map((val, i) => val + (b[i] - val) * t);
        }

        return a;
    }

    private cubicInterpolate(a: any, b: any, t: number): any {
        const t2 = t * t;
        const t3 = t2 * t;
        const smoothT = 3 * t2 - 2 * t3;
        return this.lerp(a, b, smoothT);
    }

    private bezierInterpolate(kf1: Keyframe, kf2: Keyframe, t: number): any {
        // Simplified bezier interpolation
        return this.lerp(kf1.value, kf2.value, t);
    }

    private hermiteInterpolate(kf1: Keyframe, kf2: Keyframe, t: number): any {
        // Simplified hermite interpolation
        return this.lerp(kf1.value, kf2.value, t);
    }

    private blendValues(contributions: any[]): any {
        if (contributions.length === 0) return null;
        if (contributions.length === 1) return contributions[0].value;

        // Normalize weights if enabled
        if (this.config.blending.normalizeWeights) {
            const totalWeight = contributions.reduce((sum, c) => sum + c.weight, 0);
            if (totalWeight > 0) {
                contributions.forEach(c => c.weight /= totalWeight);
            }
        }

        // Apply blending based on blend modes
        let result = contributions[0].value;
        let totalWeight = contributions[0].weight;

        for (let i = 1; i < contributions.length; i++) {
            const contrib = contributions[i];

            switch (contrib.blendMode) {
                case 'override':
                    result = this.lerp(result, contrib.value, contrib.weight);
                    break;
                case 'additive':
                    result = this.add(result, this.scale(contrib.value, contrib.weight));
                    break;
                case 'multiply':
                    result = this.multiply(result, contrib.value, contrib.weight);
                    break;
                case 'screen':
                    result = this.screen(result, contrib.value, contrib.weight);
                    break;
            }

            totalWeight += contrib.weight;
        }

        return result;
    }

    private add(a: any, b: any): any {
        if (typeof a === 'number' && typeof b === 'number') {
            return a + b;
        }
        if (Array.isArray(a) && Array.isArray(b)) {
            return a.map((val, i) => val + (b[i] || 0));
        }
        return a;
    }

    private scale(value: any, factor: number): any {
        if (typeof value === 'number') {
            return value * factor;
        }
        if (Array.isArray(value)) {
            return value.map(val => val * factor);
        }
        return value;
    }

    private multiply(a: any, b: any, weight: number): any {
        // Simplified multiply blend
        return this.lerp(a, this.scale(b, weight), weight);
    }

    private screen(a: any, b: any, weight: number): any {
        // Simplified screen blend
        return this.lerp(a, b, weight);
    }

    private applyPropertyValue(target: AnimationTarget, property: string, value: any): void {
        if (property.startsWith('transform.')) {
            const transformProp = property.substring(10);
            switch (transformProp) {
                case 'position':
                    target.transform.position = value;
                    break;
                case 'rotation':
                    target.transform.rotation = value;
                    break;
                case 'scale':
                    target.transform.scale = value;
                    break;
            }
        } else {
            target.properties.set(property, value);
        }
    }

    private applyEasing(t: number, curve: EasingCurve): number {
        switch (curve) {
            case 'linear':
                return t;
            case 'ease_in':
                return t * t;
            case 'ease_out':
                return 1 - Math.pow(1 - t, 2);
            case 'ease_in_out':
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            case 'bounce':
                return this.bounceEasing(t);
            case 'elastic':
                return this.elasticEasing(t);
            default:
                return t;
        }
    }

    private bounceEasing(t: number): number {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }

    private elasticEasing(t: number): number {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    }

    private createMixer(): AnimationMixer {
        return {
            states: new Map(),
            crossfades: [],
            globalTime: 0,
            timeScale: 1.0
        };
    }

    private createDefaultConfig(config?: Partial<AnimationConfig>): AnimationConfig {
        return {
            playback: {
                autoPlay: false,
                defaultSpeed: 1.0,
                globalTimeScale: 1.0,
                maxDeltaTime: 1 / 30 // 30 FPS minimum
            },
            blending: {
                enableBlending: true,
                maxBlendStates: 8,
                normalizeWeights: true,
                blendThreshold: 0.001
            },
            optimization: {
                enableCulling: true,
                cullDistance: 100.0,
                enableLOD: false,
                lodLevels: [0.5, 0.25, 0.1]
            },
            constraints: {
                enableConstraints: false,
                maxConstraints: 32,
                solverIterations: 4
            },
            ...config
        };
    }

    private async createAnimationKernels(): Promise<void> {
        try {
            // Keyframe interpolation kernel
            await this.computeShaders.createKernel(
                'interpolate_keyframes',
                'Keyframe Interpolation',
                this.getInterpolationShader(),
                [64, 1, 1]
            );

            console.log('Animation processing kernels created');
        } catch (error) {
            console.warn('Failed to create some animation kernels:', error);
        }
    }

    private getInterpolationShader(): string {
        return `
      #version 450
      layout(local_size_x = 64, local_size_y = 1, local_size_z = 1) in;
      
      layout(set = 0, binding = 0) buffer KeyframeData {
        float keyframe_data[];
      };
      
      layout(set = 0, binding = 1) buffer OutputData {
        float output_data[];
      };
      
      void main() {
        uint index = gl_GlobalInvocationID.x;
        if (index >= keyframe_data.length() / 4) return;
        
        // Perform keyframe interpolation
        // Implementation would interpolate between keyframes
        output_data[index] = keyframe_data[index];
      }
    `;
    }

    // Public API methods
    public getClip(id: string): AnimationClip | undefined {
        return this.clips.get(id);
    }

    public getTarget(id: string): AnimationTarget | undefined {
        return this.targets.get(id);
    }

    public getState(clipId: string): AnimationState | undefined {
        return this.mixer.states.get(clipId);
    }

    public setTimeScale(scale: number): void {
        this.mixer.timeScale = scale;
    }

    public getStats(): any {
        return { ...this.stats };
    }

    public pause(): void {
        this.config.playback.globalTimeScale = 0;
    }

    public resume(): void {
        this.config.playback.globalTimeScale = 1;
    }

    public dispose(): void {
        this.computeShaders.cleanup();
        this.clips.clear();
        this.targets.clear();
        this.mixer.states.clear();
        this.mixer.crossfades.length = 0;
        console.log('G3D Animation Engine disposed');
    }
}