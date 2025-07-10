/**
 * G3D MedSight Pro - Advanced 3D Math Libraries
 * High-performance mathematical utilities for medical 3D visualization
 */

import { vec3, mat4, quat } from 'gl-matrix';

export interface MathConfig {
    precision: 'single' | 'double';
    enableGPUAcceleration: boolean;
    enableVectorization: boolean;
}

export class MathLibraries {
    private config: MathConfig;

    constructor(config: Partial<MathConfig> = {}) {
        this.config = {
            precision: 'single',
            enableGPUAcceleration: true,
            enableVectorization: true,
            ...config
        };
    }

    // Vector Operations
    public static vectorLength(v: vec3): number {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    }

    public static vectorNormalize(out: vec3, v: vec3): vec3 {
        const len = this.vectorLength(v);
        if (len > 0) {
            out[0] = v[0] / len;
            out[1] = v[1] / len;
            out[2] = v[2] / len;
        }
        return out;
    }

    public static vectorDot(a: vec3, b: vec3): number {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    public static vectorCross(out: vec3, a: vec3, b: vec3): vec3 {
        const ax = a[0], ay = a[1], az = a[2];
        const bx = b[0], by = b[1], bz = b[2];

        out[0] = ay * bz - az * by;
        out[1] = az * bx - ax * bz;
        out[2] = ax * by - ay * bx;
        return out;
    }

    // Matrix Operations
    public static matrixInvert(out: mat4, m: mat4): mat4 | null {
        const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
        const a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
        const a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
        const a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;

        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

        if (!det) return null;
        det = 1.0 / det;

        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

        return out;
    }

    // Quaternion Operations
    public static quaternionSlerp(out: quat, a: quat, b: quat, t: number): quat {
        const ax = a[0], ay = a[1], az = a[2], aw = a[3];
        let bx = b[0], by = b[1], bz = b[2], bw = b[3];

        let omega, cosom, sinom, scale0, scale1;

        cosom = ax * bx + ay * by + az * bz + aw * bw;
        if (cosom < 0.0) {
            cosom = -cosom;
            bx = -bx;
            by = -by;
            bz = -bz;
            bw = -bw;
        }

        if ((1.0 - cosom) > 0.000001) {
            omega = Math.acos(cosom);
            sinom = Math.sin(omega);
            scale0 = Math.sin((1.0 - t) * omega) / sinom;
            scale1 = Math.sin(t * omega) / sinom;
        } else {
            scale0 = 1.0 - t;
            scale1 = t;
        }

        out[0] = scale0 * ax + scale1 * bx;
        out[1] = scale0 * ay + scale1 * by;
        out[2] = scale0 * az + scale1 * bz;
        out[3] = scale0 * aw + scale1 * bw;

        return out;
    }

    // Geometric Calculations
    public static calculateTriangleArea(v1: vec3, v2: vec3, v3: vec3): number {
        const edge1 = vec3.create();
        const edge2 = vec3.create();
        const cross = vec3.create();

        vec3.subtract(edge1, v2, v1);
        vec3.subtract(edge2, v3, v1);
        this.vectorCross(cross, edge1, edge2);

        return this.vectorLength(cross) * 0.5;
    }

    public static calculateTetrahedronVolume(v1: vec3, v2: vec3, v3: vec3, v4: vec3): number {
        const a = vec3.create();
        const b = vec3.create();
        const c = vec3.create();
        const cross = vec3.create();

        vec3.subtract(a, v2, v1);
        vec3.subtract(b, v3, v1);
        vec3.subtract(c, v4, v1);

        this.vectorCross(cross, b, c);
        return Math.abs(this.vectorDot(a, cross)) / 6.0;
    }

    // Interpolation Functions
    public static lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    public static smoothstep(edge0: number, edge1: number, x: number): number {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }

    public static bezierCubic(p0: number, p1: number, p2: number, p3: number, t: number): number {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
    }

    // Noise Functions
    public static perlinNoise(x: number, y: number, z: number): number {
        // Simplified Perlin noise implementation
        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;
        const zi = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const a = this.p[xi] + yi;
        const aa = this.p[a] + zi;
        const ab = this.p[a + 1] + zi;
        const b = this.p[xi + 1] + yi;
        const ba = this.p[b] + zi;
        const bb = this.p[b + 1] + zi;

        return this.lerp(w,
            this.lerp(v,
                this.lerp(u, this.grad(this.p[aa], x, y, z), this.grad(this.p[ba], x - 1, y, z)),
                this.lerp(u, this.grad(this.p[ab], x, y - 1, z), this.grad(this.p[bb], x - 1, y - 1, z))
            ),
            this.lerp(v,
                this.lerp(u, this.grad(this.p[aa + 1], x, y, z - 1), this.grad(this.p[ba + 1], x - 1, y, z - 1)),
                this.lerp(u, this.grad(this.p[ab + 1], x, y - 1, z - 1), this.grad(this.p[bb + 1], x - 1, y - 1, z - 1))
            )
        );
    }

    private static fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private static grad(hash: number, x: number, y: number, z: number): number {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    private static p = [
        151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
        140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
        247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
        57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
        74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
        60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
        65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
        200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
        52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
        207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213,
        119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
        129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104,
        218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
        81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
        184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
        222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
        // Duplicate for wrapping
        151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
        140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
        247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
        57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
        74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
        60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
        65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
        200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
        52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
        207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213,
        119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
        129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104,
        218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
        81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
        184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
        222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
    ];

    // Transform Utilities
    public static decomposeMatrix(matrix: mat4): {
        position: vec3;
        rotation: quat;
        scale: vec3;
    } {
        const position = vec3.create();
        const rotation = quat.create();
        const scale = vec3.create();

        // Extract translation
        position[0] = matrix[12];
        position[1] = matrix[13];
        position[2] = matrix[14];

        // Extract scale
        const sx = this.vectorLength(vec3.fromValues(matrix[0], matrix[1], matrix[2]));
        const sy = this.vectorLength(vec3.fromValues(matrix[4], matrix[5], matrix[6]));
        const sz = this.vectorLength(vec3.fromValues(matrix[8], matrix[9], matrix[10]));

        // Check for negative scale
        const det = mat4.determinant(matrix);
        if (det < 0) {
            scale[0] = -sx;
        } else {
            scale[0] = sx;
        }
        scale[1] = sy;
        scale[2] = sz;

        // Remove scaling from matrix
        const rotationMatrix = mat4.clone(matrix);
        rotationMatrix[0] /= scale[0];
        rotationMatrix[1] /= scale[0];
        rotationMatrix[2] /= scale[0];
        rotationMatrix[4] /= scale[1];
        rotationMatrix[5] /= scale[1];
        rotationMatrix[6] /= scale[1];
        rotationMatrix[8] /= scale[2];
        rotationMatrix[9] /= scale[2];
        rotationMatrix[10] /= scale[2];

        // Extract rotation
        mat4.getRotation(rotation, rotationMatrix);

        return { position, rotation, scale };
    }

    // Medical-specific calculations
    public static calculateHounsfieldValue(pixelValue: number, slope: number, intercept: number): number {
        return pixelValue * slope + intercept;
    }

    public static calculateSUVValue(
        pixelValue: number,
        injectedDose: number,
        patientWeight: number,
        scanTime: number,
        halfLife: number
    ): number {
        const decayFactor = Math.exp(-Math.log(2) * scanTime / halfLife);
        const correctedDose = injectedDose * decayFactor;
        return (pixelValue * patientWeight * 1000) / correctedDose;
    }

    public static calculateVolumeFromVoxels(
        voxelCount: number,
        voxelSpacing: vec3
    ): number {
        return voxelCount * voxelSpacing[0] * voxelSpacing[1] * voxelSpacing[2];
    }

    public static calculateDistance3D(p1: vec3, p2: vec3): number {
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const dz = p2[2] - p1[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    public static calculateAngle3D(p1: vec3, p2: vec3, p3: vec3): number {
        const v1 = vec3.create();
        const v2 = vec3.create();

        vec3.subtract(v1, p1, p2);
        vec3.subtract(v2, p3, p2);

        this.vectorNormalize(v1, v1);
        this.vectorNormalize(v2, v2);

        const dot = this.vectorDot(v1, v2);
        return Math.acos(Math.max(-1, Math.min(1, dot)));
    }

    // Statistical functions
    public static calculateMean(values: number[]): number {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    public static calculateStandardDeviation(values: number[]): number {
        const mean = this.calculateMean(values);
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        const avgSquaredDiff = this.calculateMean(squaredDiffs);
        return Math.sqrt(avgSquaredDiff);
    }

    public static calculateMedian(values: number[]): number {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }

    public dispose(): void {
        console.log('G3D Math Libraries disposed');
    }
}

export default MathLibraries;