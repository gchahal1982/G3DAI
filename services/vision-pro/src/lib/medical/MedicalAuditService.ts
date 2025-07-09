import { AuditEntry, StudyType } from '../../types/medical';

interface AuditStartOptions {
    studyType: StudyType;
    timestamp: number;
    userId: string;
    accessLevel: string;
}

interface AuditCompleteOptions {
    success: boolean;
    findingsCount: number;
    processingTime: number;
    aiVersion: string;
    confidenceScore: number;
}

interface AuditErrorOptions {
    error: string;
    context: string;
    studyType: StudyType;
    timestamp: number;
}

export class MedicalAuditService {
    private auditLog: AuditEntry[] = [];
    private immutableStorage: any; // In production, use blockchain or append-only database

    constructor() {
        this.initializeImmutableStorage();
    }

    private initializeImmutableStorage(): void {
        // In production, initialize connection to immutable storage
        // Could be blockchain, append-only database, or WORM storage
        this.immutableStorage = {
            write: async (entry: AuditEntry) => {
                // Simulate immutable write
                console.log('Writing to immutable storage:', entry.id);
                return true;
            },
            read: async (id: string) => {
                // Simulate immutable read
                return this.auditLog.find(entry => entry.id === id);
            },
            verify: async (id: string, hash: string) => {
                // Simulate integrity verification
                return true;
            }
        };
    }

    async startAnalysis(options: AuditStartOptions): Promise<string> {
        const auditId = this.generateAuditId();

        const entry: AuditEntry = {
            id: auditId,
            timestamp: options.timestamp,
            userId: options.userId,
            action: 'medical_analysis_start',
            resourceType: 'medical_image',
            resourceId: `${options.studyType}_${options.timestamp}`,
            outcome: 'pending',
            details: {
                studyType: options.studyType,
                accessLevel: options.accessLevel,
                startTime: Date.now(),
                ipAddress: this.getClientIpAddress(),
                userAgent: this.getUserAgent(),
                sessionId: this.getSessionId()
            }
        };

        await this.logEntry(entry);

        return auditId;
    }

    async completeAnalysis(auditId: string, options: AuditCompleteOptions): Promise<void> {
        const originalEntry = await this.getEntry(auditId);
        if (!originalEntry) {
            throw new Error(`Audit entry ${auditId} not found`);
        }

        const completionEntry: AuditEntry = {
            id: this.generateAuditId(),
            timestamp: Date.now(),
            userId: originalEntry.userId,
            action: 'medical_analysis_complete',
            resourceType: 'medical_image',
            resourceId: originalEntry.resourceId,
            outcome: options.success ? 'success' : 'failure',
            details: {
                originalAuditId: auditId,
                findingsCount: options.findingsCount,
                processingTime: options.processingTime,
                aiVersion: options.aiVersion,
                confidenceScore: options.confidenceScore,
                completionTime: Date.now(),
                duration: Date.now() - originalEntry.details.startTime
            }
        };

        await this.logEntry(completionEntry);
    }

    async logError(options: AuditErrorOptions): Promise<void> {
        const errorEntry: AuditEntry = {
            id: this.generateAuditId(),
            timestamp: options.timestamp,
            userId: this.getCurrentUserId(),
            action: 'medical_analysis_error',
            resourceType: 'medical_image',
            resourceId: `error_${options.timestamp}`,
            outcome: 'failure',
            details: {
                error: options.error,
                context: options.context,
                studyType: options.studyType,
                stackTrace: this.getStackTrace(),
                systemState: await this.captureSystemState()
            }
        };

        await this.logEntry(errorEntry);

        // Alert on critical errors
        if (this.isCriticalError(options.error)) {
            await this.alertSecurityTeam(errorEntry);
        }
    }

    async log(entry: Partial<AuditEntry>): Promise<void> {
        const fullEntry: AuditEntry = {
            id: entry.id || this.generateAuditId(),
            timestamp: entry.timestamp || Date.now(),
            userId: entry.userId || this.getCurrentUserId(),
            action: entry.action || 'unknown',
            resourceType: entry.resourceType || 'unknown',
            resourceId: entry.resourceId || 'unknown',
            outcome: entry.outcome || 'success',
            details: entry.details || {}
        };

        await this.logEntry(fullEntry);
    }

    private async logEntry(entry: AuditEntry): Promise<void> {
        // Add integrity hash
        const entryWithHash = {
            ...entry,
            hash: this.calculateEntryHash(entry),
            previousHash: this.getPreviousHash()
        };

        // Store in memory (for development)
        this.auditLog.push(entryWithHash);

        // Store in immutable storage
        await this.immutableStorage.write(entryWithHash);

        // Check if we need to rotate logs
        if (this.auditLog.length > 10000) {
            await this.rotateLogs();
        }
    }

    private async getEntry(auditId: string): Promise<AuditEntry | null> {
        // Try memory first
        const memoryEntry = this.auditLog.find(entry => entry.id === auditId);
        if (memoryEntry) return memoryEntry;

        // Fall back to immutable storage
        return await this.immutableStorage.read(auditId);
    }

    async getAuditTrail(
        userId?: string,
        startDate?: Date,
        endDate?: Date,
        action?: string
    ): Promise<AuditEntry[]> {
        let entries = [...this.auditLog];

        // Apply filters
        if (userId) {
            entries = entries.filter(e => e.userId === userId);
        }

        if (startDate) {
            entries = entries.filter(e => e.timestamp >= startDate.getTime());
        }

        if (endDate) {
            entries = entries.filter(e => e.timestamp <= endDate.getTime());
        }

        if (action) {
            entries = entries.filter(e => e.action === action);
        }

        // Sort by timestamp descending
        entries.sort((a, b) => b.timestamp - a.timestamp);

        return entries;
    }

    async generateComplianceReport(
        startDate: Date,
        endDate: Date
    ): Promise<any> {
        const entries = await this.getAuditTrail(
            undefined,
            startDate,
            endDate
        );

        const report = {
            period: {
                start: startDate,
                end: endDate
            },
            summary: {
                totalAccess: entries.length,
                uniqueUsers: new Set(entries.map(e => e.userId)).size,
                successfulOperations: entries.filter(e => e.outcome === 'success').length,
                failedOperations: entries.filter(e => e.outcome === 'failure').length,
                errors: entries.filter(e => e.action.includes('error')).length
            },
            accessByUser: this.groupByUser(entries),
            accessByAction: this.groupByAction(entries),
            accessByResource: this.groupByResource(entries),
            anomalies: await this.detectAnomalies(entries),
            integrityCheck: await this.verifyIntegrity(entries)
        };

        return report;
    }

    private generateAuditId(): string {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private calculateEntryHash(entry: AuditEntry): string {
        // In production, use proper cryptographic hashing
        const entryString = JSON.stringify({
            id: entry.id,
            timestamp: entry.timestamp,
            userId: entry.userId,
            action: entry.action,
            resourceType: entry.resourceType,
            resourceId: entry.resourceId,
            outcome: entry.outcome
        });

        // Simple hash for demonstration
        let hash = 0;
        for (let i = 0; i < entryString.length; i++) {
            const char = entryString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }

        return Math.abs(hash).toString(16);
    }

    private getPreviousHash(): string {
        if (this.auditLog.length === 0) {
            return '0';
        }

        const previousEntry = this.auditLog[this.auditLog.length - 1];
        return (previousEntry as any).hash || '0';
    }

    private getCurrentUserId(): string {
        // In production, get from authentication context
        return 'system';
    }

    private getClientIpAddress(): string {
        // In production, get from request context
        return '127.0.0.1';
    }

    private getUserAgent(): string {
        // In production, get from request headers
        return 'MedicalAI/1.0';
    }

    private getSessionId(): string {
        // In production, get from session management
        return `session_${Date.now()}`;
    }

    private getStackTrace(): string {
        const error = new Error();
        return error.stack || 'No stack trace available';
    }

    private async captureSystemState(): Promise<any> {
        return {
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            uptime: process.uptime(),
            timestamp: Date.now()
        };
    }

    private isCriticalError(error: string): boolean {
        const criticalPatterns = [
            'HIPAA',
            'PHI',
            'encryption',
            'authentication',
            'authorization',
            'compliance'
        ];

        return criticalPatterns.some(pattern =>
            error.toLowerCase().includes(pattern.toLowerCase())
        );
    }

    private async alertSecurityTeam(entry: AuditEntry): Promise<void> {
        // In production, send alerts via multiple channels
        console.error('SECURITY ALERT:', entry);

        // Email, SMS, Slack, PagerDuty, etc.
    }

    private async rotateLogs(): Promise<void> {
        // Archive old logs
        const cutoffIndex = Math.floor(this.auditLog.length * 0.8);
        const toArchive = this.auditLog.slice(0, cutoffIndex);

        // In production, archive to long-term storage
        console.log(`Archiving ${toArchive.length} audit entries`);

        // Keep recent logs in memory
        this.auditLog = this.auditLog.slice(cutoffIndex);
    }

    private groupByUser(entries: AuditEntry[]): Record<string, number> {
        const grouped: Record<string, number> = {};

        for (const entry of entries) {
            grouped[entry.userId] = (grouped[entry.userId] || 0) + 1;
        }

        return grouped;
    }

    private groupByAction(entries: AuditEntry[]): Record<string, number> {
        const grouped: Record<string, number> = {};

        for (const entry of entries) {
            grouped[entry.action] = (grouped[entry.action] || 0) + 1;
        }

        return grouped;
    }

    private groupByResource(entries: AuditEntry[]): Record<string, number> {
        const grouped: Record<string, number> = {};

        for (const entry of entries) {
            grouped[entry.resourceType] = (grouped[entry.resourceType] || 0) + 1;
        }

        return grouped;
    }

    private async detectAnomalies(entries: AuditEntry[]): Promise<any[]> {
        const anomalies: any[] = [];

        // Detect unusual access patterns
        const accessByHour = this.groupByHour(entries);
        for (const [hour, count] of Object.entries(accessByHour)) {
            if (count > 100) {
                anomalies.push({
                    type: 'unusual_access_volume',
                    description: `High access volume at hour ${hour}: ${count} accesses`,
                    severity: 'medium'
                });
            }
        }

        // Detect repeated failures
        const failuresByUser = this.getFailuresByUser(entries);
        for (const [userId, failures] of Object.entries(failuresByUser)) {
            if (failures > 5) {
                anomalies.push({
                    type: 'repeated_failures',
                    description: `User ${userId} had ${failures} failed attempts`,
                    severity: 'high'
                });
            }
        }

        return anomalies;
    }

    private groupByHour(entries: AuditEntry[]): Record<string, number> {
        const grouped: Record<string, number> = {};

        for (const entry of entries) {
            const hour = new Date(entry.timestamp).getHours();
            grouped[hour] = (grouped[hour] || 0) + 1;
        }

        return grouped;
    }

    private getFailuresByUser(entries: AuditEntry[]): Record<string, number> {
        const failures: Record<string, number> = {};

        for (const entry of entries) {
            if (entry.outcome === 'failure') {
                failures[entry.userId] = (failures[entry.userId] || 0) + 1;
            }
        }

        return failures;
    }

    private async verifyIntegrity(entries: AuditEntry[]): Promise<boolean> {
        // Verify hash chain integrity
        for (let i = 1; i < entries.length; i++) {
            const entry = entries[i] as any;
            const previousEntry = entries[i - 1] as any;

            if (entry.previousHash !== previousEntry.hash) {
                console.error(`Integrity violation at entry ${entry.id}`);
                return false;
            }
        }

        return true;
    }

    async getLastId(): Promise<string> {
        if (this.auditLog.length === 0) {
            return 'none';
        }

        return this.auditLog[this.auditLog.length - 1].id;
    }
}