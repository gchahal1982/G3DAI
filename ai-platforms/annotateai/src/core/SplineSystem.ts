import { EventEmitter } from 'events';

// Types and Interfaces
export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface Vector2 {
    x: number;
    y: number;
}

export interface SplinePoint {
    position: Vector3;
    tangent?: Vector3;
    normal?: Vector3;
    binormal?: Vector3;
    curvature?: number;
    torsion?: number;
    parameter: number;
}

export interface CurveSegment {
    startPoint: Vector3;
    endPoint: Vector3;
    controlPoints: Vector3[];
    type: 'linear' | 'quadratic' | 'cubic' | 'bezier' | 'nurbs';
    weights?: number[];
}

export interface SplineConfig {
    type: 'linear' | 'catmull-rom' | 'bezier' | 'b-spline' | 'nurbs' | 'hermite';
    tension?: number;
    bias?: number;
    continuity?: number;
    degree?: number;
    closed?: boolean;
    adaptive?: boolean;
    resolution?: number;
}

export interface PathConfig {
    speed: number;
    easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'custom';
    loop: boolean;
    reverse: boolean;
    customEasing?: (t: number) => number;
}

// Vector3 Math Utilities
class Vec3 {
    static create(x: number = 0, y: number = 0, z: number = 0): Vector3 {
        return { x, y, z };
    }

    static add(a: Vector3, b: Vector3): Vector3 {
        return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
    }

    static subtract(a: Vector3, b: Vector3): Vector3 {
        return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    }

    static multiply(v: Vector3, scalar: number): Vector3 {
        return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar };
    }

    static dot(a: Vector3, b: Vector3): number {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    static cross(a: Vector3, b: Vector3): Vector3 {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
    }

    static magnitude(v: Vector3): number {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    static normalize(v: Vector3): Vector3 {
        const len = Vec3.magnitude(v);
        return len > 0 ? Vec3.multiply(v, 1 / len) : Vec3.create(0, 0, 0);
    }

    static distance(a: Vector3, b: Vector3): number {
        return Vec3.magnitude(Vec3.subtract(a, b));
    }

    static lerp(a: Vector3, b: Vector3, t: number): Vector3 {
        return Vec3.add(Vec3.multiply(a, 1 - t), Vec3.multiply(b, t));
    }

    static equals(a: Vector3, b: Vector3, epsilon: number = 1e-6): boolean {
        return Math.abs(a.x - b.x) < epsilon &&
            Math.abs(a.y - b.y) < epsilon &&
            Math.abs(a.z - b.z) < epsilon;
    }
}

// Base Spline Class
abstract class BaseSpline {
    protected points: Vector3[] = [];
    protected config: SplineConfig;
    protected cachedLength: number | null = null;
    protected arcLengthDivisions: number = 200;

    constructor(points: Vector3[], config: SplineConfig) {
        this.points = [...points];
        this.config = { ...config };
    }

    abstract getPoint(t: number): Vector3;
    abstract getTangent(t: number): Vector3;

    public getPoints(): Vector3[] {
        return [...this.points];
    }

    public addPoint(point: Vector3, index?: number): void {
        if (index !== undefined) {
            this.points.splice(index, 0, point);
        } else {
            this.points.push(point);
        }
        this.invalidateCache();
    }

    public removePoint(index: number): boolean {
        if (index >= 0 && index < this.points.length) {
            this.points.splice(index, 1);
            this.invalidateCache();
            return true;
        }
        return false;
    }

    public updatePoint(index: number, point: Vector3): boolean {
        if (index >= 0 && index < this.points.length) {
            this.points[index] = { ...point };
            this.invalidateCache();
            return true;
        }
        return false;
    }

    public getLength(): number {
        if (this.cachedLength === null) {
            this.cachedLength = this.computeLength();
        }
        return this.cachedLength;
    }

    protected computeLength(): number {
        let length = 0;
        let prevPoint = this.getPoint(0);

        for (let i = 1; i <= this.arcLengthDivisions; i++) {
            const t = i / this.arcLengthDivisions;
            const point = this.getPoint(t);
            length += Vec3.distance(prevPoint, point);
            prevPoint = point;
        }

        return length;
    }

    public getPointAtDistance(distance: number): Vector3 {
        const totalLength = this.getLength();
        if (totalLength === 0) return this.getPoint(0);

        const t = this.getParameterAtDistance(distance);
        return this.getPoint(t);
    }

    public getParameterAtDistance(distance: number): number {
        const totalLength = this.getLength();
        if (totalLength === 0) return 0;

        const targetDistance = Math.max(0, Math.min(distance, totalLength));
        let currentDistance = 0;
        let prevPoint = this.getPoint(0);

        for (let i = 1; i <= this.arcLengthDivisions; i++) {
            const t = i / this.arcLengthDivisions;
            const point = this.getPoint(t);
            const segmentLength = Vec3.distance(prevPoint, point);

            if (currentDistance + segmentLength >= targetDistance) {
                const ratio = (targetDistance - currentDistance) / segmentLength;
                return (i - 1 + ratio) / this.arcLengthDivisions;
            }

            currentDistance += segmentLength;
            prevPoint = point;
        }

        return 1;
    }

    public getNormal(t: number): Vector3 {
        const tangent = this.getTangent(t);
        const epsilon = 0.001;

        // Get a second tangent slightly offset
        const t2 = Math.min(t + epsilon, 1);
        const tangent2 = this.getTangent(t2);

        // Calculate normal as the derivative of the tangent
        const normal = Vec3.subtract(tangent2, tangent);
        return Vec3.normalize(normal);
    }

    public getBinormal(t: number): Vector3 {
        const tangent = this.getTangent(t);
        const normal = this.getNormal(t);
        return Vec3.normalize(Vec3.cross(tangent, normal));
    }

    public getCurvature(t: number): number {
        const epsilon = 0.001;
        const t1 = Math.max(t - epsilon, 0);
        const t2 = Math.min(t + epsilon, 1);

        const tangent1 = this.getTangent(t1);
        const tangent2 = this.getTangent(t2);

        const deltaT = t2 - t1;
        const deltaTangent = Vec3.subtract(tangent2, tangent1);

        return Vec3.magnitude(deltaTangent) / deltaT;
    }

    public getSplinePoint(t: number): SplinePoint {
        const position = this.getPoint(t);
        const tangent = this.getTangent(t);
        const normal = this.getNormal(t);
        const binormal = this.getBinormal(t);
        const curvature = this.getCurvature(t);

        return {
            position,
            tangent,
            normal,
            binormal,
            curvature,
            parameter: t
        };
    }

    public subdivide(steps: number): Vector3[] {
        const points: Vector3[] = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            points.push(this.getPoint(t));
        }
        return points;
    }

    protected invalidateCache(): void {
        this.cachedLength = null;
    }
}

// Linear Spline
class LinearSpline extends BaseSpline {
    getPoint(t: number): Vector3 {
        if (this.points.length === 0) return Vec3.create();
        if (this.points.length === 1) return this.points[0];

        const scaledT = t * (this.points.length - 1);
        const index = Math.floor(scaledT);
        const localT = scaledT - index;

        if (index >= this.points.length - 1) {
            return this.points[this.points.length - 1];
        }

        return Vec3.lerp(this.points[index], this.points[index + 1], localT);
    }

    getTangent(t: number): Vector3 {
        if (this.points.length < 2) return Vec3.create(1, 0, 0);

        const scaledT = t * (this.points.length - 1);
        const index = Math.floor(scaledT);

        if (index >= this.points.length - 1) {
            return Vec3.normalize(Vec3.subtract(this.points[this.points.length - 1], this.points[this.points.length - 2]));
        }

        return Vec3.normalize(Vec3.subtract(this.points[index + 1], this.points[index]));
    }
}

// Catmull-Rom Spline
class CatmullRomSpline extends BaseSpline {
    getPoint(t: number): Vector3 {
        if (this.points.length === 0) return Vec3.create();
        if (this.points.length === 1) return this.points[0];

        const l = this.points.length;
        const p = (l - 1) * t;
        const intPoint = Math.floor(p);
        const weight = p - intPoint;

        const p0 = this.points[intPoint === 0 ? intPoint : intPoint - 1];
        const p1 = this.points[intPoint];
        const p2 = this.points[intPoint > l - 2 ? l - 1 : intPoint + 1];
        const p3 = this.points[intPoint > l - 3 ? l - 1 : intPoint + 2];

        return this.catmullRomInterpolate(p0, p1, p2, p3, weight);
    }

    getTangent(t: number): Vector3 {
        const epsilon = 0.0001;
        const t1 = Math.max(t - epsilon, 0);
        const t2 = Math.min(t + epsilon, 1);

        const point1 = this.getPoint(t1);
        const point2 = this.getPoint(t2);

        return Vec3.normalize(Vec3.subtract(point2, point1));
    }

    private catmullRomInterpolate(p0: Vector3, p1: Vector3, p2: Vector3, p3: Vector3, t: number): Vector3 {
        const t2 = t * t;
        const t3 = t2 * t;

        const v0 = Vec3.multiply(Vec3.subtract(p2, p0), 0.5);
        const v1 = Vec3.multiply(Vec3.subtract(p3, p1), 0.5);

        const a = Vec3.add(Vec3.multiply(p1, 2), Vec3.multiply(v0, -1));
        const b = Vec3.add(Vec3.multiply(p2, -2), v0);
        const c = Vec3.add(a, Vec3.add(b, v1));
        const d = Vec3.add(Vec3.multiply(a, -1), Vec3.subtract(b, v1));

        return Vec3.add(
            Vec3.add(Vec3.multiply(c, t3), Vec3.multiply(d, t2)),
            Vec3.add(Vec3.multiply(v0, t), p1)
        );
    }
}

// Cubic Bezier Spline
class BezierSpline extends BaseSpline {
    getPoint(t: number): Vector3 {
        if (this.points.length < 4) return Vec3.create();

        // For multiple bezier segments
        const segments = Math.floor((this.points.length - 1) / 3);
        const segmentT = t * segments;
        const segmentIndex = Math.min(Math.floor(segmentT), segments - 1);
        const localT = segmentT - segmentIndex;

        const startIndex = segmentIndex * 3;
        const p0 = this.points[startIndex];
        const p1 = this.points[startIndex + 1];
        const p2 = this.points[startIndex + 2];
        const p3 = this.points[startIndex + 3];

        return this.cubicBezierInterpolate(p0, p1, p2, p3, localT);
    }

    getTangent(t: number): Vector3 {
        if (this.points.length < 4) return Vec3.create(1, 0, 0);

        const segments = Math.floor((this.points.length - 1) / 3);
        const segmentT = t * segments;
        const segmentIndex = Math.min(Math.floor(segmentT), segments - 1);
        const localT = segmentT - segmentIndex;

        const startIndex = segmentIndex * 3;
        const p0 = this.points[startIndex];
        const p1 = this.points[startIndex + 1];
        const p2 = this.points[startIndex + 2];
        const p3 = this.points[startIndex + 3];

        return this.cubicBezierTangent(p0, p1, p2, p3, localT);
    }

    private cubicBezierInterpolate(p0: Vector3, p1: Vector3, p2: Vector3, p3: Vector3, t: number): Vector3 {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        const point = Vec3.multiply(p0, uuu);
        Vec3.add(point, Vec3.multiply(p1, 3 * uu * t));
        Vec3.add(point, Vec3.multiply(p2, 3 * u * tt));
        Vec3.add(point, Vec3.multiply(p3, ttt));

        return point;
    }

    private cubicBezierTangent(p0: Vector3, p1: Vector3, p2: Vector3, p3: Vector3, t: number): Vector3 {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;

        const tangent = Vec3.multiply(Vec3.subtract(p1, p0), 3 * uu);
        Vec3.add(tangent, Vec3.multiply(Vec3.subtract(p2, p1), 6 * u * t));
        Vec3.add(tangent, Vec3.multiply(Vec3.subtract(p3, p2), 3 * tt));

        return Vec3.normalize(tangent);
    }
}

// B-Spline
class BSpline extends BaseSpline {
    protected degree: number;
    private knots: number[] = [];

    constructor(points: Vector3[], config: SplineConfig) {
        super(points, config);
        this.degree = config.degree || 3;
        this.generateKnotVector();
    }

    getPoint(t: number): Vector3 {
        if (this.points.length === 0) return Vec3.create();
        if (this.points.length === 1) return this.points[0];

        const n = this.points.length - 1;
        const p = this.degree;

        // Find the knot span
        const span = this.findSpan(n, p, t);

        // Compute the non-vanishing basis functions
        const basisFunctions = this.basisFunctions(span, t, p);

        // Compute curve point
        let point = Vec3.create();
        for (let i = 0; i <= p; i++) {
            const controlPoint = this.points[span - p + i];
            const weight = basisFunctions[i];
            point = Vec3.add(point, Vec3.multiply(controlPoint, weight));
        }

        return point;
    }

    getTangent(t: number): Vector3 {
        const epsilon = 0.0001;
        const t1 = Math.max(t - epsilon, 0);
        const t2 = Math.min(t + epsilon, 1);

        const point1 = this.getPoint(t1);
        const point2 = this.getPoint(t2);

        return Vec3.normalize(Vec3.subtract(point2, point1));
    }

    private generateKnotVector(): void {
        const n = this.points.length - 1;
        const p = this.degree;
        const m = n + p + 1;

        this.knots = new Array(m + 1);

        // Clamped knot vector
        for (let i = 0; i <= p; i++) {
            this.knots[i] = 0;
        }

        for (let i = 1; i <= n - p; i++) {
            this.knots[p + i] = i / (n - p + 1);
        }

        for (let i = n + 1; i <= m; i++) {
            this.knots[i] = 1;
        }
    }

    protected findSpan(n: number, p: number, u: number): number {
        if (u >= 1) return n;
        if (u <= 0) return p;

        let low = p;
        let high = n + 1;
        let mid = Math.floor((low + high) / 2);

        while (u < this.knots[mid] || u >= this.knots[mid + 1]) {
            if (u < this.knots[mid]) {
                high = mid;
            } else {
                low = mid;
            }
            mid = Math.floor((low + high) / 2);
        }

        return mid;
    }

    protected basisFunctions(i: number, u: number, p: number): number[] {
        const N = new Array(p + 1);
        const left = new Array(p + 1);
        const right = new Array(p + 1);

        N[0] = 1;

        for (let j = 1; j <= p; j++) {
            left[j] = u - this.knots[i + 1 - j];
            right[j] = this.knots[i + j] - u;
            let saved = 0;

            for (let r = 0; r < j; r++) {
                const temp = N[r] / (right[r + 1] + left[j - r]);
                N[r] = saved + right[r + 1] * temp;
                saved = left[j - r] * temp;
            }

            N[j] = saved;
        }

        return N;
    }
}

// NURBS (Non-Uniform Rational B-Splines)
class NURBSSpline extends BSpline {
    private weights: number[];

    constructor(points: Vector3[], config: SplineConfig, weights?: number[]) {
        super(points, config);
        this.weights = weights || new Array(points.length).fill(1);
    }

    getPoint(t: number): Vector3 {
        if (this.points.length === 0) return Vec3.create();
        if (this.points.length === 1) return this.points[0];

        const n = this.points.length - 1;
        const p = this.degree;

        // Find the knot span
        const span = this.findSpan(n, p, t);

        // Compute the non-vanishing basis functions
        const basisFunctions = this.basisFunctions(span, t, p);

        // Compute curve point using rational basis functions
        let numerator = Vec3.create();
        let denominator = 0;

        for (let i = 0; i <= p; i++) {
            const controlPoint = this.points[span - p + i];
            const weight = this.weights[span - p + i];
            const basisWeight = basisFunctions[i] * weight;

            numerator = Vec3.add(numerator, Vec3.multiply(controlPoint, basisWeight));
            denominator += basisWeight;
        }

        return Vec3.multiply(numerator, 1 / denominator);
    }

    public setWeight(index: number, weight: number): void {
        if (index >= 0 && index < this.weights.length) {
            this.weights[index] = weight;
            this.invalidateCache();
        }
    }

    public getWeight(index: number): number {
        return this.weights[index] || 1;
    }
}

// Hermite Spline
class HermiteSpline extends BaseSpline {
    private tangents: Vector3[] = [];

    constructor(points: Vector3[], config: SplineConfig, tangents?: Vector3[]) {
        super(points, config);
        this.tangents = tangents || this.computeDefaultTangents();
    }

    getPoint(t: number): Vector3 {
        if (this.points.length === 0) return Vec3.create();
        if (this.points.length === 1) return this.points[0];

        const scaledT = t * (this.points.length - 1);
        const index = Math.floor(scaledT);
        const localT = scaledT - index;

        if (index >= this.points.length - 1) {
            return this.points[this.points.length - 1];
        }

        const p0 = this.points[index];
        const p1 = this.points[index + 1];
        const t0 = this.tangents[index];
        const t1 = this.tangents[index + 1];

        return this.hermiteInterpolate(p0, p1, t0, t1, localT);
    }

    getTangent(t: number): Vector3 {
        if (this.points.length === 0) return Vec3.create(1, 0, 0);
        if (this.points.length === 1) return this.tangents[0] || Vec3.create(1, 0, 0);

        const scaledT = t * (this.points.length - 1);
        const index = Math.floor(scaledT);
        const localT = scaledT - index;

        if (index >= this.points.length - 1) {
            return this.tangents[this.tangents.length - 1];
        }

        const t0 = this.tangents[index];
        const t1 = this.tangents[index + 1];

        return Vec3.normalize(Vec3.lerp(t0, t1, localT));
    }

    public setTangent(index: number, tangent: Vector3): void {
        if (index >= 0 && index < this.tangents.length) {
            this.tangents[index] = { ...tangent };
            this.invalidateCache();
        }
    }

    public getTangentAt(index: number): Vector3 {
        return this.tangents[index] || Vec3.create(1, 0, 0);
    }

    private computeDefaultTangents(): Vector3[] {
        const tangents: Vector3[] = [];

        for (let i = 0; i < this.points.length; i++) {
            if (i === 0) {
                tangents.push(Vec3.subtract(this.points[1], this.points[0]));
            } else if (i === this.points.length - 1) {
                tangents.push(Vec3.subtract(this.points[i], this.points[i - 1]));
            } else {
                const prev = this.points[i - 1];
                const next = this.points[i + 1];
                tangents.push(Vec3.multiply(Vec3.subtract(next, prev), 0.5));
            }
        }

        return tangents;
    }

    private hermiteInterpolate(p0: Vector3, p1: Vector3, t0: Vector3, t1: Vector3, t: number): Vector3 {
        const t2 = t * t;
        const t3 = t2 * t;

        const h00 = 2 * t3 - 3 * t2 + 1;
        const h10 = t3 - 2 * t2 + t;
        const h01 = -2 * t3 + 3 * t2;
        const h11 = t3 - t2;

        return Vec3.add(
            Vec3.add(Vec3.multiply(p0, h00), Vec3.multiply(t0, h10)),
            Vec3.add(Vec3.multiply(p1, h01), Vec3.multiply(t1, h11))
        );
    }
}

// Path Animation
class SplinePath {
    private spline: BaseSpline;
    private config: PathConfig;
    private currentTime: number = 0;
    private isPlaying: boolean = false;
    private callbacks: { [key: string]: Function[] } = {};

    constructor(spline: BaseSpline, config: PathConfig) {
        this.spline = spline;
        this.config = { ...config };
    }

    public play(): void {
        this.isPlaying = true;
        this.emit('play');
    }

    public pause(): void {
        this.isPlaying = false;
        this.emit('pause');
    }

    public stop(): void {
        this.isPlaying = false;
        this.currentTime = 0;
        this.emit('stop');
    }

    public update(deltaTime: number): SplinePoint | null {
        if (!this.isPlaying) return null;

        this.currentTime += deltaTime * this.config.speed;

        let t = this.currentTime;

        // Handle looping
        if (this.config.loop) {
            t = t % 1;
        } else if (t >= 1) {
            t = 1;
            this.isPlaying = false;
            this.emit('complete');
        }

        // Handle reverse
        if (this.config.reverse) {
            t = 1 - t;
        }

        // Apply easing
        t = this.applyEasing(t);

        return this.spline.getSplinePoint(t);
    }

    public seekTo(time: number): void {
        this.currentTime = Math.max(0, Math.min(time, 1));
    }

    public getCurrentTime(): number {
        return this.currentTime;
    }

    public getDuration(): number {
        return this.spline.getLength() / this.config.speed;
    }

    private applyEasing(t: number): number {
        switch (this.config.easing) {
            case 'linear':
                return t;
            case 'ease-in':
                return t * t;
            case 'ease-out':
                return 1 - (1 - t) * (1 - t);
            case 'ease-in-out':
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            case 'custom':
                return this.config.customEasing ? this.config.customEasing(t) : t;
            default:
                return t;
        }
    }

    private emit(event: string, data?: any): void {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(data));
        }
    }

    public on(event: string, callback: Function): void {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    }

    public off(event: string, callback: Function): void {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index !== -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    }
}

// Main Spline System Class
export class SplineSystem extends EventEmitter {
    private splines: Map<string, BaseSpline> = new Map();
    private paths: Map<string, SplinePath> = new Map();
    private isRunning: boolean = false;

    constructor() {
        super();
        this.initializeSystem();
    }

    private initializeSystem(): void {
        console.log('Initializing G3D Spline System');
        this.emit('initialized');
    }

    // Spline Creation
    public createSpline(
        id: string,
        points: Vector3[],
        config: SplineConfig,
        weights?: number[]
    ): string {
        let spline: BaseSpline;

        switch (config.type) {
            case 'linear':
                spline = new LinearSpline(points, config);
                break;
            case 'catmull-rom':
                spline = new CatmullRomSpline(points, config);
                break;
            case 'bezier':
                spline = new BezierSpline(points, config);
                break;
            case 'b-spline':
                spline = new BSpline(points, config);
                break;
            case 'nurbs':
                spline = new NURBSSpline(points, config, weights);
                break;
            case 'hermite':
                spline = new HermiteSpline(points, config);
                break;
            default:
                spline = new CatmullRomSpline(points, config);
        }

        this.splines.set(id, spline);
        this.emit('splineCreated', { id, type: config.type });

        return id;
    }

    public removeSpline(id: string): boolean {
        const success = this.splines.delete(id);
        if (success) {
            this.emit('splineRemoved', { id });
        }
        return success;
    }

    public getSpline(id: string): BaseSpline | undefined {
        return this.splines.get(id);
    }

    // Path Animation
    public createPath(id: string, splineId: string, config: PathConfig): string {
        const spline = this.splines.get(splineId);
        if (!spline) {
            throw new Error(`Spline not found: ${splineId}`);
        }

        const path = new SplinePath(spline, config);
        this.paths.set(id, path);

        this.emit('pathCreated', { id, splineId });
        return id;
    }

    public removePath(id: string): boolean {
        const success = this.paths.delete(id);
        if (success) {
            this.emit('pathRemoved', { id });
        }
        return success;
    }

    public getPath(id: string): SplinePath | undefined {
        return this.paths.get(id);
    }

    // System Control
    public start(): void {
        this.isRunning = true;
        this.emit('started');
    }

    public stop(): void {
        this.isRunning = false;
        this.emit('stopped');
    }

    public update(deltaTime: number): void {
        if (!this.isRunning) return;

        for (const [id, path] of this.paths) {
            const point = path.update(deltaTime);
            if (point) {
                this.emit('pathUpdate', { pathId: id, point });
            }
        }
    }

    // Utility Methods
    public evaluateSpline(splineId: string, t: number): Vector3 | null {
        const spline = this.splines.get(splineId);
        return spline ? spline.getPoint(t) : null;
    }

    public getSplineTangent(splineId: string, t: number): Vector3 | null {
        const spline = this.splines.get(splineId);
        return spline ? spline.getTangent(t) : null;
    }

    public getSplineLength(splineId: string): number {
        const spline = this.splines.get(splineId);
        return spline ? spline.getLength() : 0;
    }

    public subdivideSpline(splineId: string, steps: number): Vector3[] {
        const spline = this.splines.get(splineId);
        return spline ? spline.subdivide(steps) : [];
    }

    public getSplinePoint(splineId: string, t: number): SplinePoint | null {
        const spline = this.splines.get(splineId);
        return spline ? spline.getSplinePoint(t) : null;
    }

    // Spline Modification
    public addSplinePoint(splineId: string, point: Vector3, index?: number): boolean {
        const spline = this.splines.get(splineId);
        if (spline) {
            spline.addPoint(point, index);
            this.emit('splineModified', { id: splineId, action: 'addPoint' });
            return true;
        }
        return false;
    }

    public removeSplinePoint(splineId: string, index: number): boolean {
        const spline = this.splines.get(splineId);
        if (spline) {
            const success = spline.removePoint(index);
            if (success) {
                this.emit('splineModified', { id: splineId, action: 'removePoint' });
            }
            return success;
        }
        return false;
    }

    public updateSplinePoint(splineId: string, index: number, point: Vector3): boolean {
        const spline = this.splines.get(splineId);
        if (spline) {
            const success = spline.updatePoint(index, point);
            if (success) {
                this.emit('splineModified', { id: splineId, action: 'updatePoint' });
            }
            return success;
        }
        return false;
    }

    // Advanced Operations
    public connectSplines(splineId1: string, splineId2: string, continuity: 'C0' | 'C1' | 'C2' = 'C0'): string | null {
        const spline1 = this.splines.get(splineId1);
        const spline2 = this.splines.get(splineId2);

        if (!spline1 || !spline2) return null;

        const points1 = spline1.getPoints();
        const points2 = spline2.getPoints();
        const connectedPoints = [...points1, ...points2];

        const newId = this.generateId();
        const config: SplineConfig = { type: 'catmull-rom' };

        this.createSpline(newId, connectedPoints, config);
        return newId;
    }

    public offsetSpline(splineId: string, distance: number, direction: 'normal' | 'binormal' = 'normal'): string | null {
        const spline = this.splines.get(splineId);
        if (!spline) return null;

        const offsetPoints: Vector3[] = [];
        const steps = 100;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const point = spline.getSplinePoint(t);
            const offsetDirection = direction === 'normal' ? point.normal : point.binormal;

            if (offsetDirection) {
                const offsetPoint = Vec3.add(point.position, Vec3.multiply(offsetDirection, distance));
                offsetPoints.push(offsetPoint);
            }
        }

        const newId = this.generateId();
        const config: SplineConfig = { type: 'catmull-rom' };

        this.createSpline(newId, offsetPoints, config);
        return newId;
    }

    public getClosestPointOnSpline(splineId: string, targetPoint: Vector3): { point: Vector3; t: number; distance: number } | null {
        const spline = this.splines.get(splineId);
        if (!spline) return null;

        let closestPoint = Vec3.create();
        let closestT = 0;
        let minDistance = Infinity;

        const steps = 1000;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const point = spline.getPoint(t);
            const distance = Vec3.distance(point, targetPoint);

            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = point;
                closestT = t;
            }
        }

        return {
            point: closestPoint,
            t: closestT,
            distance: minDistance
        };
    }

    // Statistics and Analysis
    public getSplineStats(splineId: string): {
        length: number;
        pointCount: number;
        boundingBox: { min: Vector3; max: Vector3 };
        averageCurvature: number;
    } | null {
        const spline = this.splines.get(splineId);
        if (!spline) return null;

        const points = spline.getPoints();
        const length = spline.getLength();

        // Calculate bounding box
        let min = { ...points[0] };
        let max = { ...points[0] };

        for (const point of points) {
            min.x = Math.min(min.x, point.x);
            min.y = Math.min(min.y, point.y);
            min.z = Math.min(min.z, point.z);
            max.x = Math.max(max.x, point.x);
            max.y = Math.max(max.y, point.y);
            max.z = Math.max(max.z, point.z);
        }

        // Calculate average curvature
        let totalCurvature = 0;
        const samples = 100;
        for (let i = 0; i <= samples; i++) {
            const t = i / samples;
            totalCurvature += spline.getCurvature(t);
        }
        const averageCurvature = totalCurvature / (samples + 1);

        return {
            length,
            pointCount: points.length,
            boundingBox: { min, max },
            averageCurvature
        };
    }

    public getAllSplines(): string[] {
        return Array.from(this.splines.keys());
    }

    public getAllPaths(): string[] {
        return Array.from(this.paths.keys());
    }

    private generateId(): string {
        return `spline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    public dispose(): void {
        this.stop();
        this.splines.clear();
        this.paths.clear();
        this.removeAllListeners();
        console.log('G3D Spline System disposed');
    }
}