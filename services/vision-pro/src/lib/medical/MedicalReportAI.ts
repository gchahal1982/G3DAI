import {
    Anomaly,
    Measurements,
    PatientHistory,
    MedicalReport,
    Finding,
    ComplianceLevel
} from '../../types/medical';

interface ReportConfig {
    templatePath: string;
    complianceLevel: ComplianceLevel;
}

interface GenerateOptions {
    findings: Anomaly[];
    measurements: Measurements;
    clinicalContext?: PatientHistory;
    confidenceThreshold: number;
    studyMetadata: any;
    comparisonStudies?: any[];
}

export class MedicalReportAI {
    private config: ReportConfig;
    private templates: Map<string, string> = new Map();

    constructor(config: ReportConfig) {
        this.config = config;
        this.loadTemplates();
    }

    private loadTemplates(): void {
        // Load report templates based on compliance level
        const templates = {
            standard: this.getStandardTemplate(),
            detailed: this.getDetailedTemplate(),
            research: this.getResearchTemplate()
        };

        for (const [name, template] of Object.entries(templates)) {
            this.templates.set(name, template);
        }
    }

    async generate(options: GenerateOptions): Promise<MedicalReport> {
        try {
            // Filter findings by confidence threshold
            const significantFindings = options.findings.filter(
                f => f.confidence >= options.confidenceThreshold
            );

            // Generate report sections
            const findings = this.generateFindings(significantFindings, options.measurements);
            const impressions = this.generateImpressions(significantFindings, options.clinicalContext);
            const recommendations = this.generateRecommendations(
                significantFindings,
                options.clinicalContext,
                options.comparisonStudies
            );

            // Calculate overall confidence
            const confidenceScore = this.calculateReportConfidence(
                significantFindings,
                options.measurements
            );

            return {
                findings,
                impressions,
                recommendations,
                measurements: options.measurements,
                generatedAt: new Date(),
                aiVersion: '2.1.0',
                confidenceScore
            };

        } catch (error) {
            console.error('Report generation error:', error);
            throw new Error('Failed to generate medical report');
        }
    }

    private generateFindings(
        anomalies: Anomaly[],
        measurements: Measurements
    ): Finding[] {
        const findings: Finding[] = [];

        // Group anomalies by type and location
        const groupedAnomalies = this.groupAnomalies(anomalies);

        // Generate findings for each group
        for (const [key, group] of groupedAnomalies) {
            const finding: Finding = {
                description: this.describeFinding(group),
                location: this.formatLocation(group[0].location),
                severity: this.determineSeverity(group),
                confidence: this.calculateGroupConfidence(group)
            };

            findings.push(finding);
        }

        // Add measurement-based findings
        const measurementFindings = this.generateMeasurementFindings(measurements);
        findings.push(...measurementFindings);

        // Sort by severity and confidence
        findings.sort((a, b) => {
            const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
            const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];

            if (severityDiff !== 0) return severityDiff;
            return b.confidence - a.confidence;
        });

        return findings;
    }

    private groupAnomalies(anomalies: Anomaly[]): Map<string, Anomaly[]> {
        const groups = new Map<string, Anomaly[]>();

        for (const anomaly of anomalies) {
            const key = `${anomaly.type}_${this.getLocationKey(anomaly.location)}`;

            if (!groups.has(key)) {
                groups.set(key, []);
            }

            groups.get(key)!.push(anomaly);
        }

        return groups;
    }

    private getLocationKey(location: any): string {
        if (location.side && location.lobe) {
            return `${location.side}_${location.lobe}`;
        }

        if (location.hemisphere && location.region) {
            return `${location.hemisphere}_${location.region}`;
        }

        return `${location.x}_${location.y}`;
    }

    private describeFinding(anomalies: Anomaly[]): string {
        const primary = anomalies[0];
        const count = anomalies.length;

        let description = '';

        if (count === 1) {
            description = `${primary.description}`;
        } else {
            description = `Multiple ${primary.type}s (${count}) identified in the ${this.formatLocation(primary.location)}`;

            // Add size range if applicable
            const sizes = anomalies.map(a => a.size).filter(s => s > 0);
            if (sizes.length > 0) {
                const minSize = Math.min(...sizes);
                const maxSize = Math.max(...sizes);
                description += `, ranging from ${minSize.toFixed(1)}mm to ${maxSize.toFixed(1)}mm`;
            }
        }

        // Add characteristics
        const characteristics = this.extractCharacteristics(anomalies);
        if (characteristics.length > 0) {
            description += `. ${characteristics.join('. ')}`;
        }

        return description;
    }

    private formatLocation(location: any): string {
        if (location.side && location.lobe) {
            return `${location.side} ${location.lobe}`;
        }

        if (location.hemisphere && location.region) {
            return `${location.hemisphere} ${location.region}`;
        }

        return `coordinates (${location.x}, ${location.y})`;
    }

    private determineSeverity(anomalies: Anomaly[]): string {
        // Return the highest severity in the group
        const severities = anomalies.map(a => a.severity);
        const severityOrder = ['critical', 'high', 'moderate', 'low'];

        for (const severity of severityOrder) {
            if (severities.includes(severity as any)) {
                return severity;
            }
        }

        return 'low';
    }

    private calculateGroupConfidence(anomalies: Anomaly[]): number {
        // Average confidence of the group
        const sum = anomalies.reduce((acc, a) => acc + a.confidence, 0);
        return sum / anomalies.length;
    }

    private extractCharacteristics(anomalies: Anomaly[]): string[] {
        const characteristics: string[] = [];

        // Get unique shapes
        const shapes = [...new Set(anomalies.map(a => a.visualizations?.shape).filter(Boolean))];
        if (shapes.length > 0) {
            characteristics.push(`Morphology: ${shapes.join(', ')}`);
        }

        // Get unique margins
        const margins = [...new Set(anomalies.map(a => a.visualizations?.margins).filter(Boolean))];
        if (margins.length > 0) {
            characteristics.push(`Margins: ${margins.join(', ')}`);
        }

        // Get unique densities
        const densities = [...new Set(anomalies.map(a => a.visualizations?.density).filter(Boolean))];
        if (densities.length > 0) {
            characteristics.push(`Density: ${densities.join(', ')}`);
        }

        return characteristics;
    }

    private generateMeasurementFindings(measurements: Measurements): Finding[] {
        const findings: Finding[] = [];

        // Check for abnormal volumes
        for (const [structure, volume] of Object.entries(measurements.volumes)) {
            const normalRange = this.getNormalRange(structure);
            if (normalRange && (volume < normalRange[0] || volume > normalRange[1])) {
                findings.push({
                    description: `${structure} volume is ${volume.toFixed(1)}mm³ (normal range: ${normalRange[0]}-${normalRange[1]}mm³)`,
                    location: structure,
                    severity: this.getVolumeSeverity(volume, normalRange),
                    confidence: 0.95
                });
            }
        }

        return findings;
    }

    private getNormalRange(structure: string): [number, number] | null {
        const normalRanges: Record<string, [number, number]> = {
            'Left Lung': [3000, 5000],
            'Right Lung': [3500, 5500],
            'Heart': [600, 1000],
            'Gray Matter': [400, 600],
            'White Matter': [400, 500],
            'Ventricles': [20, 40]
        };

        return normalRanges[structure] || null;
    }

    private getVolumeSeverity(volume: number, normalRange: [number, number]): string {
        const percentDiff = Math.abs(volume - (normalRange[0] + normalRange[1]) / 2) /
            ((normalRange[1] - normalRange[0]) / 2) * 100;

        if (percentDiff > 50) return 'high';
        if (percentDiff > 25) return 'moderate';
        return 'low';
    }

    private generateImpressions(
        anomalies: Anomaly[],
        clinicalContext?: PatientHistory
    ): string[] {
        const impressions: string[] = [];

        // Overall assessment
        if (anomalies.length === 0) {
            impressions.push('No significant abnormalities identified.');
        } else {
            const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
            const highCount = anomalies.filter(a => a.severity === 'high').length;

            if (criticalCount > 0) {
                impressions.push(`${criticalCount} critical finding(s) requiring immediate attention.`);
            }

            if (highCount > 0) {
                impressions.push(`${highCount} finding(s) of high clinical significance.`);
            }
        }

        // Context-specific impressions
        if (clinicalContext?.previousScans && anomalies.some(a => a.isNew)) {
            const newFindings = anomalies.filter(a => a.isNew).length;
            impressions.push(`${newFindings} new finding(s) compared to prior study.`);
        }

        // Risk factor considerations
        if (clinicalContext?.riskFactors && clinicalContext.riskFactors.length > 0) {
            impressions.push(
                `Findings should be interpreted in the context of patient's risk factors: ${clinicalContext.riskFactors.join(', ')
                }.`
            );
        }

        return impressions;
    }

    private generateRecommendations(
        anomalies: Anomaly[],
        clinicalContext?: PatientHistory,
        comparisonStudies?: any[]
    ): string[] {
        const recommendations: string[] = [];

        // Critical findings recommendations
        const criticalFindings = anomalies.filter(a => a.severity === 'critical');
        if (criticalFindings.length > 0) {
            recommendations.push('Immediate clinical correlation recommended.');
            recommendations.push('Consider urgent follow-up imaging or intervention.');
        }

        // High severity findings
        const highFindings = anomalies.filter(a => a.severity === 'high');
        if (highFindings.length > 0) {
            recommendations.push('Clinical correlation recommended.');
            recommendations.push('Follow-up imaging recommended in 3-6 months.');
        }

        // Moderate findings
        const moderateFindings = anomalies.filter(a => a.severity === 'moderate');
        if (moderateFindings.length > 0) {
            recommendations.push('Routine follow-up recommended in 6-12 months.');
        }

        // Comparison recommendations
        if (comparisonStudies && comparisonStudies.length === 0 && anomalies.length > 0) {
            recommendations.push('Recommend obtaining prior studies for comparison if available.');
        }

        // Additional testing recommendations
        const additionalTests = this.recommendAdditionalTests(anomalies);
        recommendations.push(...additionalTests);

        return [...new Set(recommendations)]; // Remove duplicates
    }

    private recommendAdditionalTests(anomalies: Anomaly[]): string[] {
        const tests: string[] = [];

        // Based on anomaly types
        for (const anomaly of anomalies) {
            switch (anomaly.type) {
                case 'mass':
                case 'nodule':
                    if (anomaly.malignancyProbability && anomaly.malignancyProbability > 0.5) {
                        tests.push('Consider biopsy for histopathological correlation.');
                        tests.push('PET-CT may be helpful for staging if malignancy is confirmed.');
                    }
                    break;

                case 'calcification':
                    tests.push('Consider mammographic magnification views.');
                    break;

                case 'hemorrhage':
                    tests.push('Consider MRI for better characterization.');
                    tests.push('Vascular imaging may be indicated to rule out underlying vascular abnormality.');
                    break;
            }
        }

        return [...new Set(tests)];
    }

    private calculateReportConfidence(
        findings: Anomaly[],
        measurements: Measurements
    ): number {
        if (findings.length === 0) {
            // High confidence for normal studies
            return 0.95;
        }

        // Average confidence of all findings
        const findingConfidence = findings.reduce((sum, f) => sum + f.confidence, 0) / findings.length;

        // Adjust based on number of findings
        const countPenalty = Math.min(findings.length * 0.02, 0.1); // Max 10% penalty

        return Math.max(findingConfidence - countPenalty, 0.5);
    }

    private getStandardTemplate(): string {
        return `
MEDICAL IMAGING REPORT

STUDY TYPE: {{studyType}}
STUDY DATE: {{studyDate}}
COMPARISON: {{comparison}}

FINDINGS:
{{findings}}

IMPRESSION:
{{impressions}}

RECOMMENDATIONS:
{{recommendations}}

This report was generated with AI assistance and should be reviewed by a qualified physician.
Confidence Score: {{confidence}}%
    `.trim();
    }

    private getDetailedTemplate(): string {
        return `
COMPREHENSIVE MEDICAL IMAGING REPORT

CLINICAL INFORMATION:
{{clinicalInfo}}

TECHNIQUE:
{{technique}}

FINDINGS:
{{findings}}

MEASUREMENTS:
{{measurements}}

IMPRESSION:
{{impressions}}

RECOMMENDATIONS:
{{recommendations}}

DIFFERENTIAL DIAGNOSIS:
{{differential}}

AI ANALYSIS DETAILS:
- Models Used: {{models}}
- Confidence Score: {{confidence}}%
- Processing Time: {{processingTime}}
- Regulatory Compliance: {{compliance}}
    `.trim();
    }

    private getResearchTemplate(): string {
        return `
RESEARCH IMAGING ANALYSIS

STUDY IDENTIFIERS:
{{identifiers}}

QUANTITATIVE ANALYSIS:
{{quantitative}}

FINDINGS:
{{findings}}

STATISTICAL MEASURES:
{{statistics}}

RESEARCH OBSERVATIONS:
{{observations}}

DATA EXPORT:
{{dataExport}}

Note: This report is for research purposes only and not for clinical use.
    `.trim();
    }
}