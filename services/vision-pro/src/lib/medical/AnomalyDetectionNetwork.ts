import * as tf from '@tensorflow/tfjs';
import { StudyType, PatientHistory } from '../../types/medical';

interface AnomalyDetectionConfig {
    modelPath: string;
    sensitivityPresets: {
        screening: number;
        diagnostic: number;
        followUp: number;
    };
}

interface DetectionOptions {
    sensitivity: number;
    compareToBaseline?: any[];
    useEnsemble: boolean;
    models: string[];
}

interface Detection {
    type: string;
    location: {
        x: number;
        y: number;
        z?: number;
        side?: string;
        lobe?: string;
        hemisphere?: string;
        region?: string;
    };
    size: number;
    confidence: number;
    malignancyProbability?: number;
    isNew?: boolean;
    boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    attentionMap: any;
    measurements: any;
    shape?: string;
    margins?: string;
    density?: string;
}

export class AnomalyDetectionNetwork {
    private models: Map<string, tf.LayersModel> = new Map();
    private config: AnomalyDetectionConfig;
    private isInitialized: boolean = false;

    constructor(config: AnomalyDetectionConfig) {
        this.config = config;
    }

    async initialize(): Promise<void> {
        try {
            // Load ensemble models
            const modelNames = ['resnet50', 'efficientnet', 'vision-transformer'];

            for (const modelName of modelNames) {
                const modelPath = `${this.config.modelPath}/${modelName}/model.json`;
                const model = await tf.loadLayersModel(modelPath);
                this.models.set(modelName, model);
            }

            // Warm up models
            await this.warmUpModels();

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize anomaly detection network:', error);
            throw new Error('Anomaly detection network initialization failed');
        }
    }

    private async warmUpModels(): Promise<void> {
        const dummyInput = tf.zeros([1, 512, 512, 1]);

        for (const [name, model] of this.models) {
            const prediction = model.predict(dummyInput) as tf.Tensor;
            prediction.dispose();
        }

        dummyInput.dispose();
    }

    async detect(
        pixelData: Float32Array,
        options: DetectionOptions
    ): Promise<Detection[]> {
        if (!this.isInitialized) {
            throw new Error('Anomaly detection network not initialized');
        }

        try {
            // Convert pixel data to tensor
            const inputTensor = this.prepareInput(pixelData);

            // Run detection with ensemble if requested
            let detections: Detection[];
            if (options.useEnsemble) {
                detections = await this.ensembleDetection(inputTensor, options);
            } else {
                detections = await this.singleModelDetection(inputTensor, options);
            }

            // Compare to baseline if provided
            if (options.compareToBaseline && options.compareToBaseline.length > 0) {
                detections = this.compareToBaseline(detections, options.compareToBaseline);
            }

            // Filter by sensitivity
            detections = this.filterBySensitivity(detections, options.sensitivity);

            // Clean up
            inputTensor.dispose();

            return detections;

        } catch (error) {
            console.error('Anomaly detection error:', error);
            throw error;
        }
    }

    private prepareInput(pixelData: Float32Array): tf.Tensor4D {
        // Assume pixelData is already normalized
        const size = Math.sqrt(pixelData.length);

        // Reshape to [batch, height, width, channels]
        return tf.tensor4d(pixelData, [1, size, size, 1]);
    }

    private async ensembleDetection(
        inputTensor: tf.Tensor4D,
        options: DetectionOptions
    ): Promise<Detection[]> {
        const allDetections: Detection[][] = [];

        // Run detection with each model
        for (const modelName of options.models) {
            const model = this.models.get(modelName);
            if (!model) continue;

            const detections = await this.runDetection(model, inputTensor, modelName);
            allDetections.push(detections);
        }

        // Merge and aggregate detections
        return this.mergeDetections(allDetections);
    }

    private async singleModelDetection(
        inputTensor: tf.Tensor4D,
        options: DetectionOptions
    ): Promise<Detection[]> {
        const model = this.models.get(options.models[0]);
        if (!model) {
            throw new Error(`Model ${options.models[0]} not found`);
        }

        return this.runDetection(model, inputTensor, options.models[0]);
    }

    private async runDetection(
        model: tf.LayersModel,
        inputTensor: tf.Tensor4D,
        modelName: string
    ): Promise<Detection[]> {
        // Run inference
        const prediction = model.predict(inputTensor) as tf.Tensor;

        // Extract detections from model output
        const detections = await this.extractDetections(prediction, modelName);

        // Clean up
        prediction.dispose();

        return detections;
    }

    private async extractDetections(
        prediction: tf.Tensor,
        modelName: string
    ): Promise<Detection[]> {
        // This is a simplified extraction - in production, this would be model-specific
        const predictionArray = await prediction.array() as number[][][][];
        const detections: Detection[] = [];

        // Threshold for detection
        const threshold = 0.5;

        // Simple peak detection
        for (let y = 0; y < predictionArray[0][0].length; y++) {
            for (let x = 0; x < predictionArray[0][0][0].length; x++) {
                const value = predictionArray[0][0][y][x];

                if (value > threshold) {
                    // Check if it's a local maximum
                    if (this.isLocalMaximum(predictionArray[0][0], x, y, value)) {
                        detections.push({
                            type: this.inferAnomalyType(value, modelName),
                            location: {
                                x: x,
                                y: y
                            },
                            size: this.estimateSize(predictionArray[0][0], x, y, threshold),
                            confidence: value,
                            malignancyProbability: this.estimateMalignancy(value, modelName),
                            boundingBox: this.calculateBoundingBox(predictionArray[0][0], x, y, threshold),
                            attentionMap: this.extractAttentionMap(predictionArray[0][0], x, y),
                            measurements: {
                                area: 0,
                                perimeter: 0,
                                circularity: 0
                            }
                        });
                    }
                }
            }
        }

        return detections;
    }

    private isLocalMaximum(
        heatmap: number[][],
        x: number,
        y: number,
        value: number
    ): boolean {
        const neighbors = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [dx, dy] of neighbors) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < heatmap[0].length && ny >= 0 && ny < heatmap.length) {
                if (heatmap[ny][nx] > value) {
                    return false;
                }
            }
        }

        return true;
    }

    private inferAnomalyType(confidence: number, modelName: string): string {
        // Simplified type inference - in production, this would be more sophisticated
        if (modelName === 'resnet50') {
            if (confidence > 0.9) return 'mass';
            if (confidence > 0.7) return 'nodule';
            return 'opacity';
        } else if (modelName === 'efficientnet') {
            if (confidence > 0.85) return 'lesion';
            if (confidence > 0.65) return 'calcification';
            return 'asymmetry';
        }

        return 'unknown';
    }

    private estimateSize(
        heatmap: number[][],
        centerX: number,
        centerY: number,
        threshold: number
    ): number {
        // Simple flood fill to estimate size
        let size = 0;
        const visited = new Set<string>();
        const queue = [[centerX, centerY]];

        while (queue.length > 0) {
            const [x, y] = queue.shift()!;
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            if (x < 0 || x >= heatmap[0].length || y < 0 || y >= heatmap.length) continue;
            if (heatmap[y][x] < threshold) continue;

            visited.add(key);
            size++;

            // Add neighbors
            queue.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
        }

        // Convert pixel count to approximate mm (assuming 1 pixel = 0.5mm)
        return Math.sqrt(size) * 0.5;
    }

    private estimateMalignancy(confidence: number, modelName: string): number {
        // Model-specific malignancy estimation
        const modelWeights = {
            'resnet50': 1.2,
            'efficientnet': 1.0,
            'vision-transformer': 1.1
        };

        const weight = modelWeights[modelName] || 1.0;
        return Math.min(confidence * weight * 0.8, 1.0);
    }

    private calculateBoundingBox(
        heatmap: number[][],
        centerX: number,
        centerY: number,
        threshold: number
    ): { x: number; y: number; width: number; height: number } {
        let minX = centerX, maxX = centerX;
        let minY = centerY, maxY = centerY;

        // Expand from center until threshold is not met
        for (let y = 0; y < heatmap.length; y++) {
            for (let x = 0; x < heatmap[0].length; x++) {
                if (heatmap[y][x] >= threshold) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        return {
            x: minX,
            y: minY,
            width: maxX - minX + 1,
            height: maxY - minY + 1
        };
    }

    private extractAttentionMap(
        heatmap: number[][],
        centerX: number,
        centerY: number,
        radius: number = 32
    ): number[][] {
        const attentionMap: number[][] = [];

        for (let dy = -radius; dy <= radius; dy++) {
            const row: number[] = [];
            for (let dx = -radius; dx <= radius; dx++) {
                const x = centerX + dx;
                const y = centerY + dy;

                if (x >= 0 && x < heatmap[0].length && y >= 0 && y < heatmap.length) {
                    row.push(heatmap[y][x]);
                } else {
                    row.push(0);
                }
            }
            attentionMap.push(row);
        }

        return attentionMap;
    }

    private mergeDetections(allDetections: Detection[][]): Detection[] {
        // Merge detections from multiple models using NMS
        const merged: Detection[] = [];
        const iouThreshold = 0.5;

        // Flatten all detections
        const flatDetections = allDetections.flat();

        // Sort by confidence
        flatDetections.sort((a, b) => b.confidence - a.confidence);

        // Apply Non-Maximum Suppression
        const selected: Detection[] = [];
        const suppressed = new Set<number>();

        for (let i = 0; i < flatDetections.length; i++) {
            if (suppressed.has(i)) continue;

            selected.push(flatDetections[i]);

            // Suppress overlapping detections
            for (let j = i + 1; j < flatDetections.length; j++) {
                if (suppressed.has(j)) continue;

                const iou = this.calculateIOU(
                    flatDetections[i].boundingBox,
                    flatDetections[j].boundingBox
                );

                if (iou > iouThreshold) {
                    suppressed.add(j);
                }
            }
        }

        return selected;
    }

    private calculateIOU(
        box1: { x: number; y: number; width: number; height: number },
        box2: { x: number; y: number; width: number; height: number }
    ): number {
        const x1 = Math.max(box1.x, box2.x);
        const y1 = Math.max(box1.y, box2.y);
        const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
        const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

        if (x2 < x1 || y2 < y1) return 0;

        const intersection = (x2 - x1) * (y2 - y1);
        const area1 = box1.width * box1.height;
        const area2 = box2.width * box2.height;
        const union = area1 + area2 - intersection;

        return intersection / union;
    }

    private compareToBaseline(
        detections: Detection[],
        baseline: any[]
    ): Detection[] {
        // Mark new detections not present in baseline
        return detections.map(detection => {
            const isNew = !baseline.some(b =>
                this.calculateIOU(detection.boundingBox, b.boundingBox) > 0.5
            );

            return {
                ...detection,
                isNew
            };
        });
    }

    private filterBySensitivity(
        detections: Detection[],
        sensitivity: number
    ): Detection[] {
        // Adjust threshold based on sensitivity
        const threshold = 1 - sensitivity;

        return detections.filter(d => d.confidence >= threshold);
    }
}