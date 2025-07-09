import * as dicomParser from 'dicom-parser';
import CryptoJS from 'crypto-js';
import {
    DICOMMetadata,
    DICOMParseResult,
    MedicalAIConfig
} from '../../types/medical';

interface ParseOptions {
    removePHI: boolean;
    preserveStudyData: boolean;
    validateIntegrity: boolean;
}

export class DICOMParser {
    private config: MedicalAIConfig;

    constructor(config: MedicalAIConfig) {
        this.config = config;
    }

    async parse(
        encryptedData: ArrayBuffer,
        options: ParseOptions
    ): Promise<DICOMParseResult> {
        try {
            // Decrypt the data if encrypted
            const decryptedData = await this.decryptData(encryptedData);

            // Parse DICOM using dicom-parser
            const dataSet = dicomParser.parseDicom(new Uint8Array(decryptedData));

            // Extract metadata
            const metadata = this.extractMetadata(dataSet, options);

            // Validate integrity if requested
            if (options.validateIntegrity) {
                await this.validateIntegrity(dataSet, metadata);
            }

            // Extract pixel data
            const pixelData = this.extractPixelData(dataSet, metadata);

            // Remove PHI if requested
            if (options.removePHI) {
                this.removePHI(metadata);
            }

            return {
                pixelData,
                metadata,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('DICOM parsing error:', error);
            throw new Error(`Failed to parse DICOM data: ${error.message}`);
        }
    }

    private async decryptData(encryptedData: ArrayBuffer): Promise<ArrayBuffer> {
        // In production, implement proper decryption
        // For now, assume data is not encrypted
        return encryptedData;
    }

    private extractMetadata(dataSet: any, options: ParseOptions): DICOMMetadata {
        const metadata: DICOMMetadata = {
            studyId: dataSet.string('x0020000d') || '',
            seriesId: dataSet.string('x0020000e') || '',
            instanceId: dataSet.string('x00080018') || '',
            modality: dataSet.string('x00080060') || '',
            studyDate: this.parseDate(dataSet.string('x00080020')),
            studyDescription: dataSet.string('x00081030'),
            patientId: options.removePHI ? undefined : dataSet.string('x00100020'),
            patientName: options.removePHI ? undefined : dataSet.string('x00100010'),
            pixelSpacing: this.parsePixelSpacing(dataSet),
            sliceThickness: dataSet.floatString('x00180050'),
            imagePosition: this.parseImagePosition(dataSet),
            imageOrientation: this.parseImageOrientation(dataSet),
            windowCenter: dataSet.floatString('x00281050'),
            windowWidth: dataSet.floatString('x00281051'),
            rows: dataSet.uint16('x00280010') || 512,
            columns: dataSet.uint16('x00280011') || 512,
            slices: this.calculateSliceCount(dataSet),
            imageCount: dataSet.intString('x00201002')
        };

        return metadata;
    }

    private parseDate(dateString: string | undefined): Date {
        if (!dateString || dateString.length !== 8) {
            return new Date();
        }

        const year = parseInt(dateString.substring(0, 4));
        const month = parseInt(dateString.substring(4, 6)) - 1;
        const day = parseInt(dateString.substring(6, 8));

        return new Date(year, month, day);
    }

    private parsePixelSpacing(dataSet: any): number[] {
        const pixelSpacing = dataSet.string('x00280030');
        if (!pixelSpacing) {
            return [1.0, 1.0];
        }

        const values = pixelSpacing.split('\\').map(parseFloat);
        return values.length >= 2 ? [values[0], values[1]] : [1.0, 1.0];
    }

    private parseImagePosition(dataSet: any): number[] | undefined {
        const position = dataSet.string('x00200032');
        if (!position) {
            return undefined;
        }

        return position.split('\\').map(parseFloat);
    }

    private parseImageOrientation(dataSet: any): number[] | undefined {
        const orientation = dataSet.string('x00200037');
        if (!orientation) {
            return undefined;
        }

        return orientation.split('\\').map(parseFloat);
    }

    private calculateSliceCount(dataSet: any): number {
        // Try to get number of frames for multi-frame images
        const numberOfFrames = dataSet.intString('x00280008');
        if (numberOfFrames) {
            return numberOfFrames;
        }

        // For single frame images, assume 1 slice
        return 1;
    }

    private async validateIntegrity(dataSet: any, metadata: DICOMMetadata): Promise<void> {
        // Validate required fields
        const requiredFields = ['studyId', 'seriesId', 'modality', 'rows', 'columns'];
        for (const field of requiredFields) {
            if (!metadata[field]) {
                throw new Error(`Missing required DICOM field: ${field}`);
            }
        }

        // Validate modality
        const validModalities = ['CT', 'MR', 'CR', 'DX', 'MG', 'US', 'NM', 'PET'];
        if (!validModalities.includes(metadata.modality)) {
            console.warn(`Unusual modality detected: ${metadata.modality}`);
        }

        // Validate image dimensions
        if (metadata.rows < 64 || metadata.columns < 64) {
            throw new Error('Image dimensions too small for medical imaging');
        }
    }

    private extractPixelData(dataSet: any, metadata: DICOMMetadata): Float32Array {
        const pixelDataElement = dataSet.elements.x7fe00010;
        if (!pixelDataElement) {
            throw new Error('No pixel data found in DICOM file');
        }

        const pixelData = new Uint16Array(
            dataSet.byteArray.buffer,
            pixelDataElement.dataOffset,
            pixelDataElement.length / 2
        );

        // Convert to Float32Array and apply rescale slope/intercept
        const rescaleSlope = dataSet.floatString('x00281053') || 1.0;
        const rescaleIntercept = dataSet.floatString('x00281052') || 0.0;

        const floatData = new Float32Array(pixelData.length);
        for (let i = 0; i < pixelData.length; i++) {
            floatData[i] = pixelData[i] * rescaleSlope + rescaleIntercept;
        }

        return floatData;
    }

    private removePHI(metadata: DICOMMetadata): void {
        // Remove PHI fields
        delete metadata.patientId;
        delete metadata.patientName;

        // Anonymize study description if it contains patient info
        if (metadata.studyDescription && this.containsPHI(metadata.studyDescription)) {
            metadata.studyDescription = 'ANONYMIZED';
        }
    }

    private containsPHI(text: string): boolean {
        // Simple PHI detection - in production, use more sophisticated methods
        const phiPatterns = [
            /\b\d{3}-\d{2}-\d{4}\b/, // SSN
            /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/, // Names
            /\b\d{2}\/\d{2}\/\d{4}\b/, // Dates
            /\b\d{10}\b/ // Phone numbers
        ];

        return phiPatterns.some(pattern => pattern.test(text));
    }
}