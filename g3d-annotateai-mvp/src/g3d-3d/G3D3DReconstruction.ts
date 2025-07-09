/**
 * G3D AnnotateAI - 3D Reconstruction
 * Photogrammetry and 3D scene reconstruction
 * Structure from Motion (SfM) and Multi-View Stereo (MVS)
 */

export interface ReconstructionConfig {
    sfm: SfMConfig;
    mvs: MVSConfig;
    meshing: MeshingConfig;
    texturing: TexturingConfig;
    optimization: ReconstructionOptimization;
}

export interface SfMConfig {
    featureDetection: FeatureDetectionConfig;
    featureMatching: FeatureMatchingConfig;
    bundleAdjustment: BundleAdjustmentConfig;
    incrementalSfM: IncrementalSfMConfig;
}

export interface FeatureDetectionConfig {
    detector: 'sift' | 'surf' | 'orb' | 'akaze' | 'superpoint';
    maxFeatures: number;
    threshold: number;
    octaves: number;
    contrastThreshold: number;
    edgeThreshold: number;
}

export interface FeatureMatchingConfig {
    matcher: 'brute_force' | 'flann' | 'superglue';
    ratio: number;
    crossCheck: boolean;
    maxDistance: number;
    geometricVerification: GeometricVerificationConfig;
}

export interface GeometricVerificationConfig {
    method: 'fundamental' | 'essential' | 'homography';
    threshold: number;
    confidence: number;
    maxIterations: number;
}

export interface BundleAdjustmentConfig {
    enabled: boolean;
    solver: 'ceres' | 'g2o' | 'gtsam';
    maxIterations: number;
    functionTolerance: number;
    gradientTolerance: number;
    parameterTolerance: number;
}

export interface IncrementalSfMConfig {
    initialPairSelection: 'automatic' | 'manual';
    triangulationAngle: number;
    reprojectionError: number;
    minTrackLength: number;
    maxTrackLength: number;
}

export interface MVSConfig {
    patchMatch: PatchMatchConfig;
    depthMaps: DepthMapsConfig;
    pointCloud: PointCloudConfig;
    filtering: FilteringConfig;
}

export interface PatchMatchConfig {
    windowSize: number;
    iterations: number;
    randomSamples: number;
    propagationRadius: number;
    viewSelection: ViewSelectionConfig;
}

export interface ViewSelectionConfig {
    maxViews: number;
    angleThreshold: number;
    baselineThreshold: number;
    resolutionThreshold: number;
}

export interface DepthMapsConfig {
    resolution: number;
    minDepth: number;
    maxDepth: number;
    depthRange: number;
    consistency: ConsistencyConfig;
}

export interface ConsistencyConfig {
    enabled: boolean;
    minConsistentViews: number;
    depthTolerance: number;
    normalTolerance: number;
}

export interface PointCloudConfig {
    fusion: FusionConfig;
    filtering: PointFilteringConfig;
    meshing: PointMeshingConfig;
}

export interface FusionConfig {
    method: 'average' | 'median' | 'weighted';
    confidenceWeighting: boolean;
    outlierRemoval: boolean;
}

export interface PointFilteringConfig {
    enabled: boolean;
    minConfidence: number;
    maxReprojectionError: number;
    minViews: number;
    spatialFiltering: boolean;
}

export interface PointMeshingConfig {
    algorithm: 'poisson' | 'delaunay' | 'ball_pivoting' | 'alpha_shapes';
    depth: number;
    samplesPerNode: number;
    pointWeight: number;
}

export interface MeshingConfig {
    algorithm: 'screened_poisson' | 'advancing_front' | 'delaunay';
    depth: number;
    density: number;
    pointWeight: number;
    smoothing: SmoothingConfig;
    simplification: SimplificationConfig;
}

export interface SmoothingConfig {
    enabled: boolean;
    iterations: number;
    lambda: number;
    preserveFeatures: boolean;
}

export interface SimplificationConfig {
    enabled: boolean;
    targetTriangles: number;
    preserveBoundary: boolean;
    errorThreshold: number;
}

export interface TexturingConfig {
    enabled: boolean;
    resolution: number;
    padding: number;
    blending: BlendingConfig;
    colorCorrection: ColorCorrectionConfig;
}

export interface BlendingConfig {
    method: 'average' | 'multiband' | 'poisson';
    seamDetection: boolean;
    feathering: number;
}

export interface ColorCorrectionConfig {
    enabled: boolean;
    method: 'histogram' | 'gain_compensation' | 'exposure_compensation';
    blockSize: number;
    gainRange: [number, number];
}

export interface FilteringConfig {
    geometricFiltering: GeometricFilteringConfig;
    photometricFiltering: PhotometricFilteringConfig;
    temporalFiltering: TemporalFilteringConfig;
}

export interface GeometricFilteringConfig {
    enabled: boolean;
    minAngle: number;
    maxAngle: number;
    minBaseline: number;
    maxBaseline: number;
}

export interface PhotometricFilteringConfig {
    enabled: boolean;
    nccThreshold: number;
    gradientThreshold: number;
    varianceThreshold: number;
}

export interface TemporalFilteringConfig {
    enabled: boolean;
    windowSize: number;
    consistencyThreshold: number;
}

export interface ReconstructionOptimization {
    multiThreading: boolean;
    gpuAcceleration: boolean;
    memoryOptimization: boolean;
    levelOfDetail: boolean;
    progressiveReconstruction: boolean;
}

export interface CameraIntrinsics {
    fx: number;
    fy: number;
    cx: number;
    cy: number;
    k1: number;
    k2: number;
    k3: number;
    p1: number;
    p2: number;
}

export interface CameraPose {
    rotation: Matrix3x3;
    translation: Vector3;
    center: Vector3;
}

export interface Matrix3x3 {
    m00: number; m01: number; m02: number;
    m10: number; m11: number; m12: number;
    m20: number; m21: number; m22: number;
}

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface Vector2 {
    x: number;
    y: number;
}

export interface Image {
    id: string;
    data: ImageData | HTMLImageElement;
    width: number;
    height: number;
    intrinsics?: CameraIntrinsics;
    pose?: CameraPose;
    features?: Feature[];
    metadata?: ImageMetadata;
}

export interface ImageMetadata {
    filename: string;
    timestamp: Date;
    gps?: GPSCoordinates;
    orientation?: number;
    exposure?: ExposureInfo;
}

export interface GPSCoordinates {
    latitude: number;
    longitude: number;
    altitude: number;
    accuracy: number;
}

export interface ExposureInfo {
    aperture: number;
    shutterSpeed: number;
    iso: number;
    focalLength: number;
}

export interface Feature {
    id: number;
    position: Vector2;
    descriptor: Float32Array;
    scale: number;
    orientation: number;
    response: number;
}

export interface Match {
    featureA: number;
    featureB: number;
    distance: number;
    confidence: number;
}

export interface Track {
    id: number;
    features: Map<string, number>; // imageId -> featureId
    point3D?: Point3D;
    color?: [number, number, number];
    confidence: number;
}

export interface Point3D {
    position: Vector3;
    color: [number, number, number];
    normal?: Vector3;
    confidence: number;
    reprojectionError: number;
    viewIds: string[];
}

export interface DepthMap {
    imageId: string;
    width: number;
    height: number;
    depths: Float32Array;
    normals?: Float32Array;
    confidence?: Float32Array;
    minDepth: number;
    maxDepth: number;
}

export interface Mesh {
    vertices: Float32Array;
    faces: Uint32Array;
    normals?: Float32Array;
    texCoords?: Float32Array;
    colors?: Float32Array;
    texture?: HTMLImageElement;
    boundingBox: BoundingBox;
}

export interface BoundingBox {
    min: Vector3;
    max: Vector3;
    center: Vector3;
    size: Vector3;
}

export interface ReconstructionResult {
    images: Map<string, Image>;
    tracks: Map<number, Track>;
    pointCloud: Point3D[];
    depthMaps: Map<string, DepthMap>;
    mesh?: Mesh;
    statistics: ReconstructionStatistics;
}

export interface ReconstructionStatistics {
    totalImages: number;
    registeredImages: number;
    totalFeatures: number;
    totalMatches: number;
    totalTracks: number;
    totalPoints3D: number;
    meanReprojectionError: number;
    reconstructionTime: number;
    memoryUsage: number;
}

export class G3D3DReconstruction {
    private config: ReconstructionConfig;
    private images: Map<string, Image>;
    private tracks: Map<number, Track>;
    private isInitialized: boolean = false;

    constructor(config: ReconstructionConfig) {
        this.config = config;
        this.images = new Map();
        this.tracks = new Map();
    }

    /**
     * Initialize 3D reconstruction system
     */
    public async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D 3D Reconstruction');
            this.isInitialized = true;
            console.log('G3D 3D Reconstruction initialized successfully');
        } catch (error) {
            console.error('Failed to initialize 3D reconstruction:', error);
            throw error;
        }
    }

    /**
     * Add image to reconstruction
     */
    public addImage(image: Image): void {
        if (!this.isInitialized) {
            throw new Error('3D reconstruction not initialized');
        }

        this.images.set(image.id, image);
        console.log(`Added image: ${image.id} (${image.width}x${image.height})`);
    }

    /**
     * Remove image from reconstruction
     */
    public removeImage(imageId: string): boolean {
        const removed = this.images.delete(imageId);

        if (removed) {
            // Remove tracks that reference this image
            for (const [trackId, track] of this.tracks) {
                if (track.features.has(imageId)) {
                    track.features.delete(imageId);
                    if (track.features.size < 2) {
                        this.tracks.delete(trackId);
                    }
                }
            }
            console.log(`Removed image: ${imageId}`);
        }

        return removed;
    }

    /**
     * Perform complete 3D reconstruction
     */
    public async reconstruct(): Promise<ReconstructionResult> {
        if (!this.isInitialized) {
            throw new Error('3D reconstruction not initialized');
        }

        const startTime = performance.now();
        console.log('Starting 3D reconstruction pipeline');

        try {
            // Step 1: Feature detection
            console.log('Step 1: Detecting features');
            await this.detectFeatures();

            // Step 2: Feature matching
            console.log('Step 2: Matching features');
            const matches = await this.matchFeatures();

            // Step 3: Structure from Motion
            console.log('Step 3: Structure from Motion');
            this.buildTracks(matches);
            const initialPair = this.selectInitialPair();
            await this.initializeReconstruction(initialPair);

            // Step 4: Multi-View Stereo
            console.log('Step 4: Multi-View Stereo');
            const depthMaps = await this.performMVS();

            // Step 5: Point cloud fusion
            console.log('Step 5: Point cloud fusion');
            const pointCloud = await this.fusePointClouds(depthMaps);

            // Step 6: Meshing (optional)
            let mesh: Mesh | undefined;
            if (this.config.meshing) {
                console.log('Step 6: Mesh generation');
                mesh = await this.generateMesh(pointCloud);

                // Step 7: Texturing (optional)
                if (this.config.texturing.enabled && mesh) {
                    console.log('Step 7: Texture mapping');
                    mesh = await this.applyTexturing(mesh);
                }
            }

            const reconstructionTime = performance.now() - startTime;

            const statistics: ReconstructionStatistics = {
                totalImages: this.images.size,
                registeredImages: Array.from(this.images.values()).filter(img => img.pose).length,
                totalFeatures: this.getTotalFeatures(),
                totalMatches: matches.length,
                totalTracks: this.tracks.size,
                totalPoints3D: pointCloud.length,
                meanReprojectionError: this.calculateMeanReprojectionError(),
                reconstructionTime,
                memoryUsage: this.calculateMemoryUsage()
            };

            console.log(`3D reconstruction completed in ${reconstructionTime.toFixed(2)}ms`);

            return {
                images: new Map(this.images),
                tracks: new Map(this.tracks),
                pointCloud,
                depthMaps,
                mesh,
                statistics
            };

        } catch (error) {
            console.error('3D reconstruction failed:', error);
            throw error;
        }
    }

    /**
     * Perform incremental Structure from Motion
     */
    public async performIncrementalSfM(): Promise<ReconstructionResult> {
        console.log('Performing incremental Structure from Motion');

        // Detect features for all images
        await this.detectFeatures();

        // Match features between all image pairs
        const matches = await this.matchFeatures();

        // Build tracks from matches
        this.buildTracks(matches);

        // Initialize reconstruction with best initial pair
        const initialPair = this.selectInitialPair();
        await this.initializeReconstruction(initialPair);

        // Incrementally add remaining images
        const remainingImages = Array.from(this.images.keys()).filter(
            id => !this.images.get(id)!.pose
        );

        for (const imageId of remainingImages) {
            await this.addImageToReconstruction(imageId);
        }

        // Bundle adjustment
        if (this.config.sfm.bundleAdjustment.enabled) {
            await this.performBundleAdjustment();
        }

        return this.reconstruct();
    }

    /**
     * Extract dense point cloud using Multi-View Stereo
     */
    public async extractDensePointCloud(): Promise<Point3D[]> {
        console.log('Extracting dense point cloud');

        // Generate depth maps for all images
        const depthMaps = await this.performMVS();

        // Fuse depth maps into dense point cloud
        const pointCloud = await this.fusePointClouds(depthMaps);

        // Filter point cloud
        if (this.config.mvs.pointCloud.filtering) {
            return this.filterPointCloud(pointCloud);
        }

        return pointCloud;
    }

    /**
     * Generate mesh from point cloud
     */
    public async generateMeshFromPointCloud(pointCloud: Point3D[]): Promise<Mesh> {
        console.log('Generating mesh from point cloud');

        return await this.generateMesh(pointCloud);
    }

    // Private helper methods

    /**
     * Detect features in all images
     */
    private async detectFeatures(): Promise<void> {
        const config = this.config.sfm.featureDetection;

        for (const image of this.images.values()) {
            if (image.features) continue; // Already detected

            image.features = await this.detectImageFeatures(image, config);
        }
    }

    /**
     * Detect features in a single image
     */
    private async detectImageFeatures(image: Image, config: FeatureDetectionConfig): Promise<Feature[]> {
        // Simplified feature detection (placeholder)
        const features: Feature[] = [];

        // Generate random features for demonstration
        for (let i = 0; i < Math.min(config.maxFeatures, 1000); i++) {
            features.push({
                id: i,
                position: {
                    x: Math.random() * image.width,
                    y: Math.random() * image.height
                },
                descriptor: new Float32Array(128).map(() => Math.random()),
                scale: 1.0,
                orientation: Math.random() * Math.PI * 2,
                response: Math.random()
            });
        }

        return features;
    }

    /**
     * Match features between all image pairs
     */
    private async matchFeatures(): Promise<ImagePairMatches[]> {
        const config = this.config.sfm.featureMatching;
        const matches: ImagePairMatches[] = [];
        const imageIds = Array.from(this.images.keys());

        for (let i = 0; i < imageIds.length; i++) {
            for (let j = i + 1; j < imageIds.length; j++) {
                const imageA = this.images.get(imageIds[i])!;
                const imageB = this.images.get(imageIds[j])!;

                const pairMatches = await this.matchImagePair(imageA, imageB, config);

                if (pairMatches.matches.length > 0) {
                    matches.push({
                        imageA: imageIds[i],
                        imageB: imageIds[j],
                        matches: pairMatches.matches
                    });
                }
            }
        }

        return matches;
    }

    /**
     * Match features between two images
     */
    private async matchImagePair(
        imageA: Image,
        imageB: Image,
        config: FeatureMatchingConfig
    ): Promise<{ matches: Match[] }> {
        if (!imageA.features || !imageB.features) {
            return { matches: [] };
        }

        const matches: Match[] = [];

        // Simplified feature matching (placeholder)
        for (let i = 0; i < Math.min(imageA.features.length, 100); i++) {
            for (let j = 0; j < Math.min(imageB.features.length, 100); j++) {
                const distance = this.calculateDescriptorDistance(
                    imageA.features[i].descriptor,
                    imageB.features[j].descriptor
                );

                if (distance < config.maxDistance) {
                    matches.push({
                        featureA: i,
                        featureB: j,
                        distance,
                        confidence: 1.0 - distance
                    });
                }
            }
        }

        // Apply ratio test
        return { matches: matches.slice(0, 50) }; // Limit for demonstration
    }

    /**
     * Calculate descriptor distance
     */
    private calculateDescriptorDistance(descA: Float32Array, descB: Float32Array): number {
        let sum = 0;
        for (let i = 0; i < descA.length; i++) {
            const diff = descA[i] - descB[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }

    /**
     * Build tracks from feature matches
     */
    private buildTracks(matches: ImagePairMatches[]): void {
        this.tracks.clear();
        let trackId = 0;

        // Simplified track building (placeholder)
        for (const pairMatch of matches) {
            for (const match of pairMatch.matches) {
                const track: Track = {
                    id: trackId++,
                    features: new Map([
                        [pairMatch.imageA, match.featureA],
                        [pairMatch.imageB, match.featureB]
                    ]),
                    confidence: match.confidence
                };

                this.tracks.set(track.id, track);
            }
        }
    }

    /**
     * Select initial image pair for reconstruction
     */
    private selectInitialPair(): [string, string] {
        const imageIds = Array.from(this.images.keys());
        // Simplified selection - just take first two images
        return [imageIds[0], imageIds[1]];
    }

    /**
     * Initialize reconstruction with initial pair
     */
    private async initializeReconstruction(initialPair: [string, string]): Promise<void> {
        const [imageA, imageB] = initialPair;

        // Simplified initialization (placeholder)
        const poseA: CameraPose = {
            rotation: this.createIdentityMatrix3x3(),
            translation: { x: 0, y: 0, z: 0 },
            center: { x: 0, y: 0, z: 0 }
        };

        const poseB: CameraPose = {
            rotation: this.createIdentityMatrix3x3(),
            translation: { x: 1, y: 0, z: 0 },
            center: { x: 1, y: 0, z: 0 }
        };

        this.images.get(imageA)!.pose = poseA;
        this.images.get(imageB)!.pose = poseB;
    }

    /**
     * Add image to existing reconstruction
     */
    private async addImageToReconstruction(imageId: string): Promise<void> {
        // Simplified image addition (placeholder)
        const image = this.images.get(imageId)!;

        // Estimate pose using PnP
        const pose = await this.estimatePose(image);
        image.pose = pose;

        // Triangulate new points
        await this.triangulateNewPoints(imageId);
    }

    /**
     * Estimate camera pose using PnP
     */
    private async estimatePose(image: Image): Promise<CameraPose> {
        // Simplified pose estimation (placeholder)
        return {
            rotation: this.createIdentityMatrix3x3(),
            translation: { x: Math.random(), y: Math.random(), z: Math.random() },
            center: { x: Math.random(), y: Math.random(), z: Math.random() }
        };
    }

    /**
     * Triangulate new 3D points
     */
    private async triangulateNewPoints(imageId: string): Promise<void> {
        // Simplified triangulation (placeholder)
        for (const track of this.tracks.values()) {
            if (track.features.has(imageId) && !track.point3D) {
                track.point3D = {
                    position: {
                        x: Math.random() * 10 - 5,
                        y: Math.random() * 10 - 5,
                        z: Math.random() * 10 - 5
                    },
                    color: [
                        Math.floor(Math.random() * 255),
                        Math.floor(Math.random() * 255),
                        Math.floor(Math.random() * 255)
                    ],
                    confidence: Math.random(),
                    reprojectionError: Math.random(),
                    viewIds: Array.from(track.features.keys())
                };
            }
        }
    }

    /**
     * Perform bundle adjustment
     */
    private async performBundleAdjustment(): Promise<void> {
        console.log('Performing bundle adjustment');
        // Simplified bundle adjustment (placeholder)
        // In practice, this would optimize camera poses and 3D points
    }

    /**
     * Perform Multi-View Stereo
     */
    private async performMVS(): Promise<Map<string, DepthMap>> {
        const depthMaps = new Map<string, DepthMap>();

        for (const [imageId, image] of this.images) {
            if (!image.pose) continue;

            const depthMap = await this.generateDepthMap(imageId);
            depthMaps.set(imageId, depthMap);
        }

        return depthMaps;
    }

    /**
     * Generate depth map for image
     */
    private async generateDepthMap(imageId: string): Promise<DepthMap> {
        const image = this.images.get(imageId)!;
        const width = Math.floor(image.width / 4); // Reduced resolution
        const height = Math.floor(image.height / 4);

        // Simplified depth map generation (placeholder)
        const depths = new Float32Array(width * height);
        for (let i = 0; i < depths.length; i++) {
            depths[i] = Math.random() * 10 + 1; // Random depths between 1-11
        }

        return {
            imageId,
            width,
            height,
            depths,
            minDepth: 1,
            maxDepth: 11
        };
    }

    /**
     * Fuse point clouds from depth maps
     */
    private async fusePointClouds(depthMaps: Map<string, DepthMap>): Promise<Point3D[]> {
        const points: Point3D[] = [];

        for (const [imageId, depthMap] of depthMaps) {
            const image = this.images.get(imageId)!;
            if (!image.pose) continue;

            // Convert depth map to 3D points
            for (let y = 0; y < depthMap.height; y++) {
                for (let x = 0; x < depthMap.width; x++) {
                    const depth = depthMap.depths[y * depthMap.width + x];

                    if (depth > 0) {
                        // Simplified back-projection (placeholder)
                        const point3D: Point3D = {
                            position: {
                                x: (x - depthMap.width / 2) * depth * 0.001,
                                y: (y - depthMap.height / 2) * depth * 0.001,
                                z: depth
                            },
                            color: [128, 128, 128], // Gray
                            confidence: Math.random(),
                            reprojectionError: Math.random(),
                            viewIds: [imageId]
                        };

                        points.push(point3D);
                    }
                }
            }
        }

        return points;
    }

    /**
     * Filter point cloud
     */
    private filterPointCloud(pointCloud: Point3D[]): Point3D[] {
        const config = this.config.mvs.pointCloud.filtering;

        return pointCloud.filter(point =>
            point.confidence >= config.minConfidence &&
            point.reprojectionError <= config.maxReprojectionError &&
            point.viewIds.length >= config.minViews
        );
    }

    /**
     * Generate mesh from point cloud
     */
    private async generateMesh(pointCloud: Point3D[]): Promise<Mesh> {
        console.log(`Generating mesh from ${pointCloud.length} points`);

        // Simplified mesh generation (placeholder)
        // In practice, this would use Poisson reconstruction or similar

        const vertices = new Float32Array(pointCloud.length * 3);
        const colors = new Float32Array(pointCloud.length * 3);

        for (let i = 0; i < pointCloud.length; i++) {
            const point = pointCloud[i];
            vertices[i * 3] = point.position.x;
            vertices[i * 3 + 1] = point.position.y;
            vertices[i * 3 + 2] = point.position.z;

            colors[i * 3] = point.color[0] / 255;
            colors[i * 3 + 1] = point.color[1] / 255;
            colors[i * 3 + 2] = point.color[2] / 255;
        }

        // Generate simple triangulation (placeholder)
        const faces = new Uint32Array((pointCloud.length - 2) * 3);
        for (let i = 0; i < pointCloud.length - 2; i++) {
            faces[i * 3] = 0;
            faces[i * 3 + 1] = i + 1;
            faces[i * 3 + 2] = i + 2;
        }

        const boundingBox = this.calculateBoundingBox(pointCloud);

        return {
            vertices,
            faces,
            colors,
            boundingBox
        };
    }

    /**
     * Apply texturing to mesh
     */
    private async applyTexturing(mesh: Mesh): Promise<Mesh> {
        console.log('Applying texture to mesh');

        // Simplified texturing (placeholder)
        // In practice, this would involve UV mapping and texture atlas generation

        const texCoords = new Float32Array((mesh.vertices.length / 3) * 2);
        for (let i = 0; i < texCoords.length; i += 2) {
            texCoords[i] = Math.random(); // U
            texCoords[i + 1] = Math.random(); // V
        }

        return {
            ...mesh,
            texCoords
        };
    }

    // Utility methods

    private createIdentityMatrix3x3(): Matrix3x3 {
        return {
            m00: 1, m01: 0, m02: 0,
            m10: 0, m11: 1, m12: 0,
            m20: 0, m21: 0, m22: 1
        };
    }

    private calculateBoundingBox(pointCloud: Point3D[]): BoundingBox {
        if (pointCloud.length === 0) {
            return {
                min: { x: 0, y: 0, z: 0 },
                max: { x: 0, y: 0, z: 0 },
                center: { x: 0, y: 0, z: 0 },
                size: { x: 0, y: 0, z: 0 }
            };
        }

        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (const point of pointCloud) {
            minX = Math.min(minX, point.position.x);
            minY = Math.min(minY, point.position.y);
            minZ = Math.min(minZ, point.position.z);
            maxX = Math.max(maxX, point.position.x);
            maxY = Math.max(maxY, point.position.y);
            maxZ = Math.max(maxZ, point.position.z);
        }

        const center = {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2,
            z: (minZ + maxZ) / 2
        };

        const size = {
            x: maxX - minX,
            y: maxY - minY,
            z: maxZ - minZ
        };

        return {
            min: { x: minX, y: minY, z: minZ },
            max: { x: maxX, y: maxY, z: maxZ },
            center,
            size
        };
    }

    private getTotalFeatures(): number {
        let total = 0;
        for (const image of this.images.values()) {
            if (image.features) {
                total += image.features.length;
            }
        }
        return total;
    }

    private calculateMeanReprojectionError(): number {
        let totalError = 0;
        let count = 0;

        for (const track of this.tracks.values()) {
            if (track.point3D) {
                totalError += track.point3D.reprojectionError;
                count++;
            }
        }

        return count > 0 ? totalError / count : 0;
    }

    private calculateMemoryUsage(): number {
        let memory = 0;

        // Estimate memory usage
        memory += this.images.size * 1024 * 1024; // ~1MB per image
        memory += this.tracks.size * 1024; // ~1KB per track

        return memory;
    }

    /**
     * Get reconstruction statistics
     */
    public getStatistics(): ReconstructionStatistics {
        return {
            totalImages: this.images.size,
            registeredImages: Array.from(this.images.values()).filter(img => img.pose).length,
            totalFeatures: this.getTotalFeatures(),
            totalMatches: 0, // Would need to store matches
            totalTracks: this.tracks.size,
            totalPoints3D: Array.from(this.tracks.values()).filter(track => track.point3D).length,
            meanReprojectionError: this.calculateMeanReprojectionError(),
            reconstructionTime: 0,
            memoryUsage: this.calculateMemoryUsage()
        };
    }

    /**
     * Cleanup resources
     */
    public cleanup(): void {
        try {
            this.images.clear();
            this.tracks.clear();
            this.isInitialized = false;
            console.log('G3D 3D Reconstruction cleanup completed');
        } catch (error) {
            console.error('Failed to cleanup 3D reconstruction:', error);
        }
    }
}

// Additional interfaces
interface ImagePairMatches {
    imageA: string;
    imageB: string;
    matches: Match[];
}

export default G3D3DReconstruction;