// Advanced Mathematical Libraries for G3D
// Comprehensive collection of mathematical functions and utilities

// Vector and Matrix Math
export class Vector2 {
    constructor(public x: number = 0, public y: number = 0) { }

    add(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subtract(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    multiply(scalar: number): Vector2 {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    dot(v: Vector2): number {
        return this.x * v.x + this.y * v.y;
    }

    cross(v: Vector2): number {
        return this.x * v.y - this.y * v.x;
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize(): Vector2 {
        const len = this.length();
        return len > 0 ? new Vector2(this.x / len, this.y / len) : new Vector2(0, 0);
    }

    angle(): number {
        return Math.atan2(this.y, this.x);
    }

    rotate(angle: number): Vector2 {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }
}

export class Vector3 {
    constructor(public x: number = 0, public y: number = 0, public z: number = 0) { }

    add(v: Vector3): Vector3 {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    subtract(v: Vector3): Vector3 {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    multiply(scalar: number): Vector3 {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    dot(v: Vector3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v: Vector3): Vector3 {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize(): Vector3 {
        const len = this.length();
        return len > 0 ? new Vector3(this.x / len, this.y / len, this.z / len) : new Vector3(0, 0, 0);
    }

    distanceTo(v: Vector3): number {
        return this.subtract(v).length();
    }

    lerp(v: Vector3, t: number): Vector3 {
        return new Vector3(
            this.x + (v.x - this.x) * t,
            this.y + (v.y - this.y) * t,
            this.z + (v.z - this.z) * t
        );
    }
}

export class Matrix3 {
    elements: Float32Array;

    constructor() {
        this.elements = new Float32Array(9);
        this.identity();
    }

    identity(): Matrix3 {
        this.elements.set([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]);
        return this;
    }

    multiply(m: Matrix3): Matrix3 {
        const te = this.elements;
        const me = m.elements;
        const result = new Matrix3();
        const re = result.elements;

        const a11 = te[0], a12 = te[3], a13 = te[6];
        const a21 = te[1], a22 = te[4], a23 = te[7];
        const a31 = te[2], a32 = te[5], a33 = te[8];

        const b11 = me[0], b12 = me[3], b13 = me[6];
        const b21 = me[1], b22 = me[4], b23 = me[7];
        const b31 = me[2], b32 = me[5], b33 = me[8];

        re[0] = a11 * b11 + a12 * b21 + a13 * b31;
        re[3] = a11 * b12 + a12 * b22 + a13 * b32;
        re[6] = a11 * b13 + a12 * b23 + a13 * b33;

        re[1] = a21 * b11 + a22 * b21 + a23 * b31;
        re[4] = a21 * b12 + a22 * b22 + a23 * b32;
        re[7] = a21 * b13 + a22 * b23 + a23 * b33;

        re[2] = a31 * b11 + a32 * b21 + a33 * b31;
        re[5] = a31 * b12 + a32 * b22 + a33 * b32;
        re[8] = a31 * b13 + a32 * b23 + a33 * b33;

        return result;
    }

    determinant(): number {
        const te = this.elements;
        const a = te[0], b = te[1], c = te[2];
        const d = te[3], e = te[4], f = te[5];
        const g = te[6], h = te[7], i = te[8];

        return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    }

    inverse(): Matrix3 {
        const te = this.elements;
        const det = this.determinant();

        if (Math.abs(det) < 1e-10) {
            throw new Error('Matrix is not invertible');
        }

        const result = new Matrix3();
        const re = result.elements;
        const invDet = 1 / det;

        re[0] = (te[4] * te[8] - te[5] * te[7]) * invDet;
        re[1] = (te[2] * te[7] - te[1] * te[8]) * invDet;
        re[2] = (te[1] * te[5] - te[2] * te[4]) * invDet;

        re[3] = (te[5] * te[6] - te[3] * te[8]) * invDet;
        re[4] = (te[0] * te[8] - te[2] * te[6]) * invDet;
        re[5] = (te[2] * te[3] - te[0] * te[5]) * invDet;

        re[6] = (te[3] * te[7] - te[4] * te[6]) * invDet;
        re[7] = (te[1] * te[6] - te[0] * te[7]) * invDet;
        re[8] = (te[0] * te[4] - te[1] * te[3]) * invDet;

        return result;
    }
}

export class Matrix4 {
    elements: Float32Array;

    constructor() {
        this.elements = new Float32Array(16);
        this.identity();
    }

    identity(): Matrix4 {
        this.elements.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        return this;
    }

    multiply(m: Matrix4): Matrix4 {
        const te = this.elements;
        const me = m.elements;
        const result = new Matrix4();
        const re = result.elements;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                re[i * 4 + j] = 0;
                for (let k = 0; k < 4; k++) {
                    re[i * 4 + j] += te[i * 4 + k] * me[k * 4 + j];
                }
            }
        }

        return result;
    }

    determinant(): number {
        const te = this.elements;
        const n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
        const n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
        const n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
        const n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];

        return (
            n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) +
            n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) +
            n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) +
            n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31)
        );
    }
}

// Quaternion Math
export class Quaternion {
    constructor(public x: number = 0, public y: number = 0, public z: number = 0, public w: number = 1) { }

    multiply(q: Quaternion): Quaternion {
        const x = this.x * q.w + this.y * q.z - this.z * q.y + this.w * q.x;
        const y = -this.x * q.z + this.y * q.w + this.z * q.x + this.w * q.y;
        const z = this.x * q.y - this.y * q.x + this.z * q.w + this.w * q.z;
        const w = -this.x * q.x - this.y * q.y - this.z * q.z + this.w * q.w;
        return new Quaternion(x, y, z, w);
    }

    normalize(): Quaternion {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
        if (length === 0) return new Quaternion(0, 0, 0, 1);
        return new Quaternion(this.x / length, this.y / length, this.z / length, this.w / length);
    }

    conjugate(): Quaternion {
        return new Quaternion(-this.x, -this.y, -this.z, this.w);
    }

    slerp(q: Quaternion, t: number): Quaternion {
        let dot = this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;

        if (dot < 0) {
            dot = -dot;
            q = new Quaternion(-q.x, -q.y, -q.z, -q.w);
        }

        if (dot > 0.9995) {
            // Linear interpolation for very close quaternions
            return new Quaternion(
                this.x + t * (q.x - this.x),
                this.y + t * (q.y - this.y),
                this.z + t * (q.z - this.z),
                this.w + t * (q.w - this.w)
            ).normalize();
        }

        const theta = Math.acos(dot);
        const sinTheta = Math.sin(theta);
        const scale0 = Math.sin((1 - t) * theta) / sinTheta;
        const scale1 = Math.sin(t * theta) / sinTheta;

        return new Quaternion(
            scale0 * this.x + scale1 * q.x,
            scale0 * this.y + scale1 * q.y,
            scale0 * this.z + scale1 * q.z,
            scale0 * this.w + scale1 * q.w
        );
    }

    static fromAxisAngle(axis: Vector3, angle: number): Quaternion {
        const halfAngle = angle * 0.5;
        const sin = Math.sin(halfAngle);
        const cos = Math.cos(halfAngle);
        const normalizedAxis = axis.normalize();

        return new Quaternion(
            normalizedAxis.x * sin,
            normalizedAxis.y * sin,
            normalizedAxis.z * sin,
            cos
        );
    }
}

// Geometric Primitives
export class Ray {
    constructor(public origin: Vector3, public direction: Vector3) {
        this.direction = direction.normalize();
    }

    at(t: number): Vector3 {
        return this.origin.add(this.direction.multiply(t));
    }

    intersectSphere(center: Vector3, radius: number): number | null {
        const oc = this.origin.subtract(center);
        const a = this.direction.dot(this.direction);
        const b = 2.0 * oc.dot(this.direction);
        const c = oc.dot(oc) - radius * radius;
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) return null;

        const sqrt = Math.sqrt(discriminant);
        const t1 = (-b - sqrt) / (2 * a);
        const t2 = (-b + sqrt) / (2 * a);

        return t1 > 0 ? t1 : (t2 > 0 ? t2 : null);
    }

    intersectPlane(point: Vector3, normal: Vector3): number | null {
        const denom = normal.dot(this.direction);
        if (Math.abs(denom) < 1e-6) return null; // Ray is parallel to plane

        const t = point.subtract(this.origin).dot(normal) / denom;
        return t >= 0 ? t : null;
    }
}

export class Plane {
    constructor(public normal: Vector3, public constant: number) {
        this.normal = normal.normalize();
    }

    distanceToPoint(point: Vector3): number {
        return this.normal.dot(point) + this.constant;
    }

    projectPoint(point: Vector3): Vector3 {
        const distance = this.distanceToPoint(point);
        return point.subtract(this.normal.multiply(distance));
    }

    static fromPoints(a: Vector3, b: Vector3, c: Vector3): Plane {
        const normal = b.subtract(a).cross(c.subtract(a)).normalize();
        const constant = -normal.dot(a);
        return new Plane(normal, constant);
    }
}

export class Sphere {
    constructor(public center: Vector3, public radius: number) { }

    containsPoint(point: Vector3): boolean {
        return this.center.distanceTo(point) <= this.radius;
    }

    intersectsSphere(other: Sphere): boolean {
        const distance = this.center.distanceTo(other.center);
        return distance <= (this.radius + other.radius);
    }

    volume(): number {
        return (4 / 3) * Math.PI * Math.pow(this.radius, 3);
    }

    surfaceArea(): number {
        return 4 * Math.PI * Math.pow(this.radius, 2);
    }
}

export class Box3 {
    constructor(public min: Vector3, public max: Vector3) { }

    containsPoint(point: Vector3): boolean {
        return point.x >= this.min.x && point.x <= this.max.x &&
            point.y >= this.min.y && point.y <= this.max.y &&
            point.z >= this.min.z && point.z <= this.max.z;
    }

    intersectsBox(box: Box3): boolean {
        return this.max.x >= box.min.x && this.min.x <= box.max.x &&
            this.max.y >= box.min.y && this.min.y <= box.max.y &&
            this.max.z >= box.min.z && this.min.z <= box.max.z;
    }

    expandByPoint(point: Vector3): Box3 {
        return new Box3(
            new Vector3(
                Math.min(this.min.x, point.x),
                Math.min(this.min.y, point.y),
                Math.min(this.min.z, point.z)
            ),
            new Vector3(
                Math.max(this.max.x, point.x),
                Math.max(this.max.y, point.y),
                Math.max(this.max.z, point.z)
            )
        );
    }

    center(): Vector3 {
        return new Vector3(
            (this.min.x + this.max.x) * 0.5,
            (this.min.y + this.max.y) * 0.5,
            (this.min.z + this.max.z) * 0.5
        );
    }

    size(): Vector3 {
        return this.max.subtract(this.min);
    }

    volume(): number {
        const size = this.size();
        return size.x * size.y * size.z;
    }
}

// Interpolation and Curve Math
export class CubicBezier {
    constructor(
        public p0: Vector3,
        public p1: Vector3,
        public p2: Vector3,
        public p3: Vector3
    ) { }

    evaluate(t: number): Vector3 {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        return this.p0.multiply(uuu)
            .add(this.p1.multiply(3 * uu * t))
            .add(this.p2.multiply(3 * u * tt))
            .add(this.p3.multiply(ttt));
    }

    derivative(t: number): Vector3 {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;

        return this.p1.subtract(this.p0).multiply(3 * uu)
            .add(this.p2.subtract(this.p1).multiply(6 * u * t))
            .add(this.p3.subtract(this.p2).multiply(3 * tt));
    }

    length(steps: number = 100): number {
        let length = 0;
        let prevPoint = this.evaluate(0);

        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const point = this.evaluate(t);
            length += prevPoint.distanceTo(point);
            prevPoint = point;
        }

        return length;
    }
}

export class CatmullRomSpline {
    constructor(public points: Vector3[]) { }

    evaluate(t: number): Vector3 {
        const l = this.points.length;
        const p = (l - 1) * t;
        const intPoint = Math.floor(p);
        const weight = p - intPoint;

        const p0 = this.points[intPoint === 0 ? intPoint : intPoint - 1];
        const p1 = this.points[intPoint];
        const p2 = this.points[intPoint > l - 2 ? l - 1 : intPoint + 1];
        const p3 = this.points[intPoint > l - 3 ? l - 1 : intPoint + 2];

        const w2 = weight * weight;
        const w3 = weight * w2;

        const v0 = p2.subtract(p0).multiply(0.5);
        const v1 = p3.subtract(p1).multiply(0.5);

        return p1.multiply(2 * w3 - 3 * w2 + 1)
            .add(p2.multiply(-2 * w3 + 3 * w2))
            .add(v0.multiply(w3 - 2 * w2 + weight))
            .add(v1.multiply(w3 - w2));
    }
}

// Noise Functions
export class PerlinNoise {
    private permutation: number[];
    private gradients: Vector3[];

    constructor(seed?: number) {
        this.permutation = this.generatePermutation(seed);
        this.gradients = this.generateGradients();
    }

    private generatePermutation(seed?: number): number[] {
        const p = [];
        for (let i = 0; i < 256; i++) p[i] = i;

        // Fisher-Yates shuffle with optional seed
        const random = seed ? this.seededRandom(seed) : Math.random;
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }

        return p.concat(p); // Duplicate for wrapping
    }

    private seededRandom(seed: number): () => number {
        let m = 0x80000000; // 2**31
        let a = 1103515245;
        let c = 12345;
        let state = seed;

        return () => {
            state = (a * state + c) % m;
            return state / (m - 1);
        };
    }

    private generateGradients(): Vector3[] {
        const gradients = [];
        for (let i = 0; i < 256; i++) {
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.random() * Math.PI;
            gradients.push(new Vector3(
                Math.sin(phi) * Math.cos(theta),
                Math.sin(phi) * Math.sin(theta),
                Math.cos(phi)
            ));
        }
        return gradients;
    }

    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private lerp(a: number, b: number, t: number): number {
        return a + t * (b - a);
    }

    noise3D(x: number, y: number, z: number): number {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.permutation[X] + Y;
        const AA = this.permutation[A] + Z;
        const AB = this.permutation[A + 1] + Z;
        const B = this.permutation[X + 1] + Y;
        const BA = this.permutation[B] + Z;
        const BB = this.permutation[B + 1] + Z;

        return this.lerp(
            this.lerp(
                this.lerp(this.grad(this.permutation[AA], x, y, z),
                    this.grad(this.permutation[BA], x - 1, y, z), u),
                this.lerp(this.grad(this.permutation[AB], x, y - 1, z),
                    this.grad(this.permutation[BB], x - 1, y - 1, z), u), v),
            this.lerp(
                this.lerp(this.grad(this.permutation[AA + 1], x, y, z - 1),
                    this.grad(this.permutation[BA + 1], x - 1, y, z - 1), u),
                this.lerp(this.grad(this.permutation[AB + 1], x, y - 1, z - 1),
                    this.grad(this.permutation[BB + 1], x - 1, y - 1, z - 1), u), v), w);
    }

    private grad(hash: number, x: number, y: number, z: number): number {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    fractalNoise3D(x: number, y: number, z: number, octaves: number = 4, persistence: number = 0.5): number {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            value += this.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }

        return value / maxValue;
    }
}

// Utility Functions
export class MathUtils {
    static readonly DEG2RAD = Math.PI / 180;
    static readonly RAD2DEG = 180 / Math.PI;
    static readonly EPSILON = 1e-6;

    static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    static lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    static smoothstep(edge0: number, edge1: number, x: number): number {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
    }

    static smootherstep(edge0: number, edge1: number, x: number): number {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    static degToRad(degrees: number): number {
        return degrees * this.DEG2RAD;
    }

    static radToDeg(radians: number): number {
        return radians * this.RAD2DEG;
    }

    static isPowerOfTwo(value: number): boolean {
        return (value & (value - 1)) === 0;
    }

    static nextPowerOfTwo(value: number): number {
        value--;
        value |= value >> 1;
        value |= value >> 2;
        value |= value >> 4;
        value |= value >> 8;
        value |= value >> 16;
        return value + 1;
    }

    static euclideanModulo(n: number, m: number): number {
        return ((n % m) + m) % m;
    }

    static mapLinear(x: number, a1: number, a2: number, b1: number, b2: number): number {
        return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
    }

    static generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// Statistical Functions
export class Statistics {
    static mean(values: number[]): number {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    static median(values: number[]): number {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    static standardDeviation(values: number[]): number {
        const avg = this.mean(values);
        const squareDiffs = values.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = this.mean(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }

    static correlation(x: number[], y: number[]): number {
        const n = Math.min(x.length, y.length);
        const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
        const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
        const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
        const sumYY = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    }
}

// Export all components
export {
    CubicBezier as Bezier,
    CatmullRomSpline as Spline,
    PerlinNoise as Noise
};

// Main G3D Math Libraries class
export class MathLibraries {
    public static Vector2 = Vector2;
    public static Vector3 = Vector3;
    public static Matrix3 = Matrix3;
    public static Matrix4 = Matrix4;
    public static Quaternion = Quaternion;
    public static Ray = Ray;
    public static Plane = Plane;
    public static Sphere = Sphere;
    public static Box3 = Box3;
    public static CubicBezier = CubicBezier;
    public static CatmullRomSpline = CatmullRomSpline;
    public static PerlinNoise = PerlinNoise;
    public static MathUtils = MathUtils;
    public static Statistics = Statistics;

    constructor() {
        console.log('G3D Math Libraries initialized');
    }

    // Factory methods for common operations
    public static createRandomVector3(min: number = -1, max: number = 1): Vector3 {
        return new Vector3(
            Math.random() * (max - min) + min,
            Math.random() * (max - min) + min,
            Math.random() * (max - min) + min
        );
    }

    public static createBoundingBox(points: Vector3[]): Box3 {
        if (points.length === 0) {
            return new Box3(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
        }

        let min = new Vector3(points[0].x, points[0].y, points[0].z);
        let max = new Vector3(points[0].x, points[0].y, points[0].z);

        for (const point of points) {
            min = new Vector3(
                Math.min(min.x, point.x),
                Math.min(min.y, point.y),
                Math.min(min.z, point.z)
            );
            max = new Vector3(
                Math.max(max.x, point.x),
                Math.max(max.y, point.y),
                Math.max(max.z, point.z)
            );
        }

        return new Box3(min, max);
    }

    public static createSplineFromPoints(points: Vector3[], type: 'catmull-rom' | 'bezier' = 'catmull-rom'): CatmullRomSpline | CubicBezier {
        if (type === 'catmull-rom') {
            return new CatmullRomSpline(points);
        } else {
            if (points.length < 4) {
                throw new Error('Bezier curve requires at least 4 points');
            }
            return new CubicBezier(points[0], points[1], points[2], points[3]);
        }
    }

    public static generateNoise(width: number, height: number, depth: number = 1, seed?: number): number[][][] {
        const noise = new PerlinNoise(seed);
        const result: number[][][] = [];

        for (let x = 0; x < width; x++) {
            result[x] = [];
            for (let y = 0; y < height; y++) {
                result[x][y] = [];
                for (let z = 0; z < depth; z++) {
                    result[x][y][z] = noise.fractalNoise3D(x / 50, y / 50, z / 50);
                }
            }
        }

        return result;
    }

    public dispose(): void {
        console.log('G3D Math Libraries disposed');
    }
}