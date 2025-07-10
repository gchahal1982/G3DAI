/**
 * G3D MedSight Pro - Advanced 3D Spline System
 * Sophisticated spline and curve systems for medical applications
 */

import { vec3, mat4 } from 'gl-matrix';

export interface SplineConfig {
    resolution: number;
    smoothness: number;
    enableAdaptiveResolution: boolean;
    maxSegments: number;
    medicalMode: boolean;
}

export interface ControlPoint {
    position: vec3;
    tangent?: vec3;
    weight?: number;
    metadata?: Map<string, any>;
}

export interface SplinePoint {
    position: vec3;
    tangent: vec3;
    normal: vec3;
    binormal: vec3;
    curvature: number;
    parameter: number;
    distance: number;
}

export interface MedicalSplineData {
    vesselType: 'artery' | 'vein' | 'capillary' | 'lymphatic';
    diameter: number;
    flow: number;
    pressure: number;
    pathology?: string;
    clinicalRelevance: 'low' | 'medium' | 'high' | 'critical';
}

export class SplineSystem {
    private config: SplineConfig;
    private controlPoints: ControlPoint[] = [];
    private splinePoints: SplinePoint[] = [];
    private totalLength: number = 0;
    private medicalData: MedicalSplineData | null = null;

    constructor(config: Partial<SplineConfig> = {}) {
        this.config = {
            resolution: 100,
            smoothness: 0.5,
            enableAdaptiveResolution: true,
            maxSegments: 1000,
            medicalMode: false,
            ...config
        };
    }

    // Control Point Management
    public addControlPoint(point: ControlPoint): void {
        this.controlPoints.push(point);
        this.regenerateSpline();
    }

    public removeControlPoint(index: number): boolean {
        if (index >= 0 && index < this.controlPoints.length) {
            this.controlPoints.splice(index, 1);
            this.regenerateSpline();
            return true;
        }
        return false;
    }

    public updateControlPoint(index: number, point: ControlPoint): boolean {
        if (index >= 0 && index < this.controlPoints.length) {
            this.controlPoints[index] = point;
            this.regenerateSpline();
            return true;
        }
        return false;
    }

    // Spline Generation
    public generateCatmullRomSpline(): SplinePoint[] {
        if (this.controlPoints.length < 4) return [];

        const points: SplinePoint[] = [];
        const segments = this.config.resolution;

        for (let i = 0; i < this.controlPoints.length - 3; i++) {
            const p0 = this.controlPoints[i].position;
            const p1 = this.controlPoints[i + 1].position;
            const p2 = this.controlPoints[i + 2].position;
            const p3 = this.controlPoints[i + 3].position;

            for (let j = 0; j < segments; j++) {
                const t = j / segments;
                const position = this.catmullRomInterpolation(p0, p1, p2, p3, t);
                const tangent = this.catmullRomTangent(p0, p1, p2, p3, t);

                const splinePoint: SplinePoint = {
                    position,
                    tangent,
                    normal: vec3.create(),
                    binormal: vec3.create(),
                    curvature: 0,
                    parameter: (i + t) / (this.controlPoints.length - 3),
                    distance: 0
                };

                this.calculateFrenetFrame(splinePoint);
                points.push(splinePoint);
            }
        }

        this.calculateDistances(points);
        this.splinePoints = points;
        return points;
    }

    public generateBezierSpline(): SplinePoint[] {
        if (this.controlPoints.length < 4) return [];

        const points: SplinePoint[] = [];
        const segments = this.config.resolution;

        for (let i = 0; i < this.controlPoints.length - 3; i += 3) {
            const p0 = this.controlPoints[i].position;
            const p1 = this.controlPoints[i + 1].position;
            const p2 = this.controlPoints[i + 2].position;
            const p3 = this.controlPoints[i + 3].position;

            for (let j = 0; j < segments; j++) {
                const t = j / segments;
                const position = this.bezierInterpolation(p0, p1, p2, p3, t);
                const tangent = this.bezierTangent(p0, p1, p2, p3, t);

                const splinePoint: SplinePoint = {
                    position,
                    tangent,
                    normal: vec3.create(),
                    binormal: vec3.create(),
                    curvature: 0,
                    parameter: (i / 3 + t) / Math.floor((this.controlPoints.length - 1) / 3),
                    distance: 0
                };

                this.calculateFrenetFrame(splinePoint);
                points.push(splinePoint);
            }
        }

        this.calculateDistances(points);
        this.splinePoints = points;
        return points;
    }

    public generateBSpline(degree: number = 3): SplinePoint[] {
        if (this.controlPoints.length < degree + 1) return [];

        const points: SplinePoint[] = [];
        const n = this.controlPoints.length;
        const m = n + degree + 1;

        // Generate knot vector
        const knots: number[] = [];
        for (let i = 0; i < m; i++) {
            if (i <= degree) {
                knots[i] = 0;
            } else if (i >= n) {
                knots[i] = 1;
            } else {
                knots[i] = (i - degree) / (n - degree);
            }
        }

        const segments = this.config.resolution;
        for (let i = 0; i < segments; i++) {
            const t = i / (segments - 1);
            const position = this.bSplineInterpolation(t, degree, knots);
            const tangent = this.bSplineTangent(t, degree, knots);

            const splinePoint: SplinePoint = {
                position,
                tangent,
                normal: vec3.create(),
                binormal: vec3.create(),
                curvature: 0,
                parameter: t,
                distance: 0
            };

            this.calculateFrenetFrame(splinePoint);
            points.push(splinePoint);
        }

        this.calculateDistances(points);
        this.splinePoints = points;
        return points;
    }

    // Interpolation Methods
    private catmullRomInterpolation(p0: vec3, p1: vec3, p2: vec3, p3: vec3, t: number): vec3 {
        const t2 = t * t;
        const t3 = t2 * t;

        const result = vec3.create();

        result[0] = 0.5 * (
            (2 * p1[0]) +
            (-p0[0] + p2[0]) * t +
            (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
            (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3
        );

        result[1] = 0.5 * (
            (2 * p1[1]) +
            (-p0[1] + p2[1]) * t +
            (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
            (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3
        );

        result[2] = 0.5 * (
            (2 * p1[2]) +
            (-p0[2] + p2[2]) * t +
            (2 * p0[2] - 5 * p1[2] + 4 * p2[2] - p3[2]) * t2 +
            (-p0[2] + 3 * p1[2] - 3 * p2[2] + p3[2]) * t3
        );

        return result;
    }

    private catmullRomTangent(p0: vec3, p1: vec3, p2: vec3, p3: vec3, t: number): vec3 {
        const t2 = t * t;

        const result = vec3.create();

        result[0] = 0.5 * (
            (-p0[0] + p2[0]) +
            2 * (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t +
            3 * (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t2
        );

        result[1] = 0.5 * (
            (-p0[1] + p2[1]) +
            2 * (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t +
            3 * (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t2
        );

        result[2] = 0.5 * (
            (-p0[2] + p2[2]) +
            2 * (2 * p0[2] - 5 * p1[2] + 4 * p2[2] - p3[2]) * t +
            3 * (-p0[2] + 3 * p1[2] - 3 * p2[2] + p3[2]) * t2
        );

        vec3.normalize(result, result);
        return result;
    }

    private bezierInterpolation(p0: vec3, p1: vec3, p2: vec3, p3: vec3, t: number): vec3 {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        const result = vec3.create();

        vec3.scale(result, p0, uuu);
        vec3.scaleAndAdd(result, result, p1, 3 * uu * t);
        vec3.scaleAndAdd(result, result, p2, 3 * u * tt);
        vec3.scaleAndAdd(result, result, p3, ttt);

        return result;
    }

    private bezierTangent(p0: vec3, p1: vec3, p2: vec3, p3: vec3, t: number): vec3 {
        const u = 1 - t;
        const uu = u * u;
        const tt = t * t;

        const result = vec3.create();

        vec3.scale(result, p0, -3 * uu);
        vec3.scaleAndAdd(result, result, p1, 3 * (uu - 2 * u * t));
        vec3.scaleAndAdd(result, result, p2, 3 * (2 * u * t - tt));
        vec3.scaleAndAdd(result, result, p3, 3 * tt);

        vec3.normalize(result, result);
        return result;
    }

    private bSplineInterpolation(t: number, degree: number, knots: number[]): vec3 {
        const result = vec3.create();

        for (let i = 0; i < this.controlPoints.length; i++) {
            const basis = this.bSplineBasis(i, degree, t, knots);
            vec3.scaleAndAdd(result, result, this.controlPoints[i].position, basis);
        }

        return result;
    }

    private bSplineTangent(t: number, degree: number, knots: number[]): vec3 {
        const result = vec3.create();

        for (let i = 0; i < this.controlPoints.length; i++) {
            const basisDerivative = this.bSplineBasisDerivative(i, degree, t, knots);
            vec3.scaleAndAdd(result, result, this.controlPoints[i].position, basisDerivative);
        }

        vec3.normalize(result, result);
        return result;
    }

    private bSplineBasis(i: number, degree: number, t: number, knots: number[]): number {
        if (degree === 0) {
            return (t >= knots[i] && t < knots[i + 1]) ? 1 : 0;
        }

        let left = 0;
        if (knots[i + degree] !== knots[i]) {
            left = ((t - knots[i]) / (knots[i + degree] - knots[i])) *
                this.bSplineBasis(i, degree - 1, t, knots);
        }

        let right = 0;
        if (knots[i + degree + 1] !== knots[i + 1]) {
            right = ((knots[i + degree + 1] - t) / (knots[i + degree + 1] - knots[i + 1])) *
                this.bSplineBasis(i + 1, degree - 1, t, knots);
        }

        return left + right;
    }

    private bSplineBasisDerivative(i: number, degree: number, t: number, knots: number[]): number {
        let left = 0;
        if (knots[i + degree] !== knots[i]) {
            left = (degree / (knots[i + degree] - knots[i])) *
                this.bSplineBasis(i, degree - 1, t, knots);
        }

        let right = 0;
        if (knots[i + degree + 1] !== knots[i + 1]) {
            right = (degree / (knots[i + degree + 1] - knots[i + 1])) *
                this.bSplineBasis(i + 1, degree - 1, t, knots);
        }

        return left - right;
    }

    // Frenet Frame Calculation
    private calculateFrenetFrame(point: SplinePoint): void {
        vec3.normalize(point.tangent, point.tangent);

        // Calculate normal (simplified)
        const up = vec3.fromValues(0, 1, 0);
        vec3.cross(point.normal, point.tangent, up);
        vec3.normalize(point.normal, point.normal);

        // Calculate binormal
        vec3.cross(point.binormal, point.tangent, point.normal);
        vec3.normalize(point.binormal, point.binormal);

        // Calculate curvature (simplified)
        point.curvature = 0.1; // Would calculate actual curvature
    }

    // Distance Calculation
    private calculateDistances(points: SplinePoint[]): void {
        let totalDistance = 0;

        for (let i = 0; i < points.length; i++) {
            points[i].distance = totalDistance;

            if (i < points.length - 1) {
                const dist = vec3.distance(points[i].position, points[i + 1].position);
                totalDistance += dist;
            }
        }

        this.totalLength = totalDistance;
    }

    // Spline Evaluation
    public getPointAtParameter(t: number): SplinePoint | null {
        if (this.splinePoints.length === 0) return null;

        const index = Math.floor(t * (this.splinePoints.length - 1));
        const clampedIndex = Math.max(0, Math.min(this.splinePoints.length - 1, index));

        return this.splinePoints[clampedIndex];
    }

    public getPointAtDistance(distance: number): SplinePoint | null {
        if (this.splinePoints.length === 0 || this.totalLength === 0) return null;

        const t = distance / this.totalLength;
        return this.getPointAtParameter(t);
    }

    // Medical-specific methods
    public setMedicalData(data: MedicalSplineData): void {
        this.medicalData = data;
        this.config.medicalMode = true;
    }

    public generateVesselMesh(radius: number = 1.0, segments: number = 8): {
        vertices: Float32Array;
        indices: Uint32Array;
        normals: Float32Array;
    } {
        if (this.splinePoints.length === 0) {
            return {
                vertices: new Float32Array(0),
                indices: new Uint32Array(0),
                normals: new Float32Array(0)
            };
        }

        const vertices: number[] = [];
        const indices: number[] = [];
        const normals: number[] = [];

        for (let i = 0; i < this.splinePoints.length; i++) {
            const point = this.splinePoints[i];
            const currentRadius = this.medicalData ? this.medicalData.diameter / 2 : radius;

            // Generate circle around the spline point
            for (let j = 0; j < segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);

                // Calculate position on circle
                const circlePos = vec3.create();
                vec3.scaleAndAdd(circlePos, point.position, point.normal, cos * currentRadius);
                vec3.scaleAndAdd(circlePos, circlePos, point.binormal, sin * currentRadius);

                vertices.push(circlePos[0], circlePos[1], circlePos[2]);

                // Calculate normal
                const normal = vec3.create();
                vec3.scaleAndAdd(normal, point.normal, point.normal, cos);
                vec3.scaleAndAdd(normal, normal, point.binormal, sin);
                vec3.normalize(normal, normal);

                normals.push(normal[0], normal[1], normal[2]);

                // Generate indices for triangles
                if (i < this.splinePoints.length - 1) {
                    const current = i * segments + j;
                    const next = i * segments + ((j + 1) % segments);
                    const nextRing = (i + 1) * segments + j;
                    const nextRingNext = (i + 1) * segments + ((j + 1) % segments);

                    // Two triangles per quad
                    indices.push(current, next, nextRing);
                    indices.push(next, nextRingNext, nextRing);
                }
            }
        }

        return {
            vertices: new Float32Array(vertices),
            indices: new Uint32Array(indices),
            normals: new Float32Array(normals)
        };
    }

    public calculateCenterline(): vec3[] {
        return this.splinePoints.map(point => vec3.clone(point.position));
    }

    public calculateCurvatureAnalysis(): {
        maxCurvature: number;
        avgCurvature: number;
        curvaturePoints: number[];
    } {
        if (this.splinePoints.length === 0) {
            return { maxCurvature: 0, avgCurvature: 0, curvaturePoints: [] };
        }

        const curvatures = this.splinePoints.map(point => point.curvature);
        const maxCurvature = Math.max(...curvatures);
        const avgCurvature = curvatures.reduce((sum, c) => sum + c, 0) / curvatures.length;

        return {
            maxCurvature,
            avgCurvature,
            curvaturePoints: curvatures
        };
    }

    // Utility Methods
    public regenerateSpline(): void {
        if (this.controlPoints.length >= 4) {
            this.generateCatmullRomSpline();
        }
    }

    public getControlPoints(): ControlPoint[] {
        return [...this.controlPoints];
    }

    public getSplinePoints(): SplinePoint[] {
        return [...this.splinePoints];
    }

    public getTotalLength(): number {
        return this.totalLength;
    }

    public clear(): void {
        this.controlPoints = [];
        this.splinePoints = [];
        this.totalLength = 0;
        this.medicalData = null;
    }

    public dispose(): void {
        this.clear();
        console.log('G3D Spline System disposed');
    }
}

export default SplineSystem;