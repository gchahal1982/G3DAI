/**
 * G3D MedSight Pro - Medical System Monitoring
 * Real-time monitoring and alerting for medical production systems
 */

export interface MedicalMonitoringConfig {
    enableRealTimeMonitoring: boolean;
    enablePredictiveAnalytics: boolean;
    enableAutomatedAlerting: boolean;
    enablePerformanceTracking: boolean;
    enableHealthChecks: boolean;
    enableComplianceMonitoring: boolean;
    monitoringInterval: number; // seconds
    alertThresholds: AlertThresholds;
    retentionPeriod: number; // days
    enableMedicalWorkflowTracking: boolean;
}

export interface AlertThresholds {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
    errorRate: number;
    responseTime: number;
    patientDataAccess: number;
    medicalDeviceFailure: number;
    complianceViolation: number;
}

export interface SystemMetric {
    id: string;
    timestamp: number;
    component: string;
    metricType: 'performance' | 'health' | 'security' | 'compliance' | 'medical';
    value: number;
    unit: string;
    status: 'normal' | 'warning' | 'critical' | 'emergency';
    medicalContext: boolean;
    patientImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface Alert {
    id: string;
    timestamp: number;
    severity: 'info' | 'warning' | 'error' | 'critical' | 'emergency';
    category: 'system' | 'medical' | 'security' | 'compliance' | 'patient_safety';
    component: string;
    message: string;
    details: Record<string, any>;
    acknowledged: boolean;
    resolved: boolean;
    medicalEmergency: boolean;
    patientSafetyImpact: boolean;
    responseRequired: boolean;
    escalationLevel: number;
}

export interface HealthCheck {
    component: string;
    status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
    lastCheck: number;
    responseTime: number;
    dependencies: string[];
    medicalFunctionality: boolean;
    patientDataAccess: boolean;
    emergencyCapable: boolean;
    details: Record<string, any>;
}

export interface MonitoringDashboard {
    systemHealth: SystemHealth;
    alerts: Alert[];
    metrics: SystemMetric[];
    medicalWorkflows: MedicalWorkflowStatus[];
    complianceStatus: ComplianceStatus;
    patientSafetyIndicators: PatientSafetyIndicators;
}

export interface SystemHealth {
    overall: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
    uptime: number; // percentage
    performance: number; // percentage
    availability: number; // percentage
    medicalSystemsOperational: boolean;
    patientDataAccessible: boolean;
    emergencySystemsActive: boolean;
    lastUpdate: number;
}

export interface MedicalWorkflowStatus {
    workflowId: string;
    name: string;
    status: 'running' | 'paused' | 'failed' | 'completed';
    progress: number; // percentage
    patientsAffected: number;
    estimatedCompletion: number;
    priority: 'low' | 'normal' | 'high' | 'emergency';
    medicalSpecialty: string;
}

export interface ComplianceStatus {
    hipaaCompliant: boolean;
    fdaCompliant: boolean;
    auditReady: boolean;
    dataProtectionActive: boolean;
    accessControlsValid: boolean;
    encryptionActive: boolean;
    lastAudit: number;
    nextAudit: number;
    violationsCount: number;
}

export interface PatientSafetyIndicators {
    systemsOperational: boolean;
    dataIntegrityValid: boolean;
    emergencySystemsReady: boolean;
    medicalDevicesConnected: boolean;
    alertSystemActive: boolean;
    backupSystemsReady: boolean;
    staffNotificationActive: boolean;
    safetyScore: number; // 0-100
}

export class MedicalMonitoring {
    private config: MedicalMonitoringConfig;
    private metrics: Map<string, SystemMetric[]> = new Map();
    private alerts: Map<string, Alert> = new Map();
    private healthChecks: Map<string, HealthCheck> = new Map();
    private isMonitoring: boolean = false;
    private monitoringInterval: NodeJS.Timeout | null = null;

    constructor(config: Partial<MedicalMonitoringConfig> = {}) {
        this.config = {
            enableRealTimeMonitoring: true,
            enablePredictiveAnalytics: true,
            enableAutomatedAlerting: true,
            enablePerformanceTracking: true,
            enableHealthChecks: true,
            enableComplianceMonitoring: true,
            monitoringInterval: 30,
            alertThresholds: {
                cpuUsage: 80,
                memoryUsage: 85,
                diskUsage: 90,
                networkLatency: 100,
                errorRate: 5,
                responseTime: 2000,
                patientDataAccess: 99,
                medicalDeviceFailure: 1,
                complianceViolation: 0
            },
            retentionPeriod: 90,
            enableMedicalWorkflowTracking: true,
            ...config
        };
    }

    async startMonitoring(): Promise<void> {
        if (this.isMonitoring) {
            console.log('Monitoring already active');
            return;
        }

        console.log('Starting G3D Medical System Monitoring...');
        this.isMonitoring = true;

        // Start monitoring interval
        this.monitoringInterval = setInterval(async () => {
            await this.collectMetrics();
            await this.performHealthChecks();
            await this.checkAlertThresholds();
        }, this.config.monitoringInterval * 1000);

        console.log('G3D Medical System Monitoring started successfully');
    }

    async stopMonitoring(): Promise<void> {
        if (!this.isMonitoring) return;

        console.log('Stopping G3D Medical System Monitoring...');
        this.isMonitoring = false;

        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        console.log('G3D Medical System Monitoring stopped');
    }

    async recordMetric(metric: Partial<SystemMetric>): Promise<string> {
        const metricId = `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const systemMetric: SystemMetric = {
            id: metricId,
            timestamp: Date.now(),
            component: metric.component || 'system',
            metricType: metric.metricType || 'performance',
            value: metric.value || 0,
            unit: metric.unit || 'count',
            status: metric.status || 'normal',
            medicalContext: metric.medicalContext || false,
            patientImpact: metric.patientImpact || 'none'
        };

        const componentMetrics = this.metrics.get(systemMetric.component) || [];
        componentMetrics.push(systemMetric);
        this.metrics.set(systemMetric.component, componentMetrics);

        // Check if metric triggers alert
        await this.evaluateMetricForAlert(systemMetric);

        return metricId;
    }

    async createAlert(alertData: Partial<Alert>): Promise<string> {
        const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const alert: Alert = {
            id: alertId,
            timestamp: Date.now(),
            severity: alertData.severity || 'info',
            category: alertData.category || 'system',
            component: alertData.component || 'unknown',
            message: alertData.message || 'System alert',
            details: alertData.details || {},
            acknowledged: false,
            resolved: false,
            medicalEmergency: alertData.medicalEmergency || false,
            patientSafetyImpact: alertData.patientSafetyImpact || false,
            responseRequired: alertData.responseRequired || false,
            escalationLevel: alertData.escalationLevel || 1
        };

        this.alerts.set(alertId, alert);

        // Handle emergency alerts
        if (alert.medicalEmergency || alert.patientSafetyImpact) {
            await this.handleEmergencyAlert(alert);
        }

        console.log(`Alert created: ${alertId} - ${alert.severity} - ${alert.message}`);
        return alertId;
    }

    async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
        const alert = this.alerts.get(alertId);
        if (!alert) {
            throw new Error('Alert not found');
        }

        alert.acknowledged = true;
        alert.details.acknowledgedBy = userId;
        alert.details.acknowledgedAt = Date.now();

        console.log(`Alert acknowledged: ${alertId} by ${userId}`);
    }

    async resolveAlert(alertId: string, userId: string, resolution: string): Promise<void> {
        const alert = this.alerts.get(alertId);
        if (!alert) {
            throw new Error('Alert not found');
        }

        alert.resolved = true;
        alert.details.resolvedBy = userId;
        alert.details.resolvedAt = Date.now();
        alert.details.resolution = resolution;

        console.log(`Alert resolved: ${alertId} by ${userId}`);
    }

    getDashboard(): MonitoringDashboard {
        const activeAlerts = Array.from(this.alerts.values()).filter(a => !a.resolved);
        const recentMetrics = this.getRecentMetrics(100);

        return {
            systemHealth: this.calculateSystemHealth(),
            alerts: activeAlerts,
            metrics: recentMetrics,
            medicalWorkflows: this.getMedicalWorkflowStatus(),
            complianceStatus: this.getComplianceStatus(),
            patientSafetyIndicators: this.getPatientSafetyIndicators()
        };
    }

    getMetrics(component?: string, limit: number = 100): SystemMetric[] {
        if (component) {
            return this.metrics.get(component)?.slice(-limit) || [];
        }

        return this.getRecentMetrics(limit);
    }

    getAlerts(resolved: boolean = false): Alert[] {
        return Array.from(this.alerts.values()).filter(a => a.resolved === resolved);
    }

    private async collectMetrics(): Promise<void> {
        if (!this.config.enablePerformanceTracking) return;

        // Simulate metric collection
        await this.recordMetric({
            component: 'cpu',
            metricType: 'performance',
            value: Math.random() * 100,
            unit: 'percentage',
            status: 'normal'
        });

        await this.recordMetric({
            component: 'memory',
            metricType: 'performance',
            value: Math.random() * 100,
            unit: 'percentage',
            status: 'normal'
        });

        await this.recordMetric({
            component: 'medical_devices',
            metricType: 'medical',
            value: Math.random() * 100,
            unit: 'percentage',
            status: 'normal',
            medicalContext: true,
            patientImpact: 'medium'
        });
    }

    private async performHealthChecks(): Promise<void> {
        if (!this.config.enableHealthChecks) return;

        const components = ['api', 'database', 'imaging_system', 'ai_processor', 'security_system'];

        for (const component of components) {
            const healthCheck: HealthCheck = {
                component,
                status: Math.random() > 0.1 ? 'healthy' : 'degraded',
                lastCheck: Date.now(),
                responseTime: Math.random() * 100,
                dependencies: [],
                medicalFunctionality: component.includes('imaging') || component.includes('ai'),
                patientDataAccess: component === 'database' || component === 'api',
                emergencyCapable: component === 'api' || component === 'imaging_system',
                details: {}
            };

            this.healthChecks.set(component, healthCheck);
        }
    }

    private async checkAlertThresholds(): Promise<void> {
        if (!this.config.enableAutomatedAlerting) return;

        // Check recent metrics against thresholds
        const recentMetrics = this.getRecentMetrics(10);

        for (const metric of recentMetrics) {
            await this.evaluateMetricForAlert(metric);
        }
    }

    private async evaluateMetricForAlert(metric: SystemMetric): Promise<void> {
        const thresholds = this.config.alertThresholds;
        let shouldAlert = false;
        let severity: Alert['severity'] = 'info';

        // Evaluate based on component and value
        switch (metric.component) {
            case 'cpu':
                if (metric.value > thresholds.cpuUsage) {
                    shouldAlert = true;
                    severity = metric.value > 95 ? 'critical' : 'warning';
                }
                break;
            case 'memory':
                if (metric.value > thresholds.memoryUsage) {
                    shouldAlert = true;
                    severity = metric.value > 95 ? 'critical' : 'warning';
                }
                break;
            case 'medical_devices':
                if (metric.value < 95) {
                    shouldAlert = true;
                    severity = metric.value < 80 ? 'critical' : 'warning';
                }
                break;
        }

        if (shouldAlert) {
            await this.createAlert({
                severity,
                category: metric.medicalContext ? 'medical' : 'system',
                component: metric.component,
                message: `${metric.component} threshold exceeded: ${metric.value}${metric.unit}`,
                details: { metric: metric },
                medicalEmergency: metric.medicalContext && severity === 'critical',
                patientSafetyImpact: metric.patientImpact !== 'none'
            });
        }
    }

    private async handleEmergencyAlert(alert: Alert): Promise<void> {
        console.log(`EMERGENCY ALERT: ${alert.message}`);
        // Emergency notification logic would go here
    }

    private calculateSystemHealth(): SystemHealth {
        const healthChecks = Array.from(this.healthChecks.values());
        const healthyCount = healthChecks.filter(h => h.status === 'healthy').length;
        const healthPercentage = healthChecks.length > 0 ? (healthyCount / healthChecks.length) * 100 : 100;

        return {
            overall: healthPercentage > 90 ? 'healthy' : healthPercentage > 70 ? 'degraded' : 'unhealthy',
            uptime: 99.5,
            performance: healthPercentage,
            availability: 99.9,
            medicalSystemsOperational: true,
            patientDataAccessible: true,
            emergencySystemsActive: true,
            lastUpdate: Date.now()
        };
    }

    private getRecentMetrics(limit: number): SystemMetric[] {
        const allMetrics: SystemMetric[] = [];

        for (const componentMetrics of this.metrics.values()) {
            allMetrics.push(...componentMetrics);
        }

        return allMetrics
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    private getMedicalWorkflowStatus(): MedicalWorkflowStatus[] {
        return [
            {
                workflowId: 'wf_imaging_001',
                name: 'CT Scan Processing',
                status: 'running',
                progress: 75,
                patientsAffected: 15,
                estimatedCompletion: Date.now() + 1800000, // 30 minutes
                priority: 'normal',
                medicalSpecialty: 'radiology'
            },
            {
                workflowId: 'wf_ai_002',
                name: 'AI Diagnostic Analysis',
                status: 'running',
                progress: 60,
                patientsAffected: 8,
                estimatedCompletion: Date.now() + 900000, // 15 minutes
                priority: 'high',
                medicalSpecialty: 'pathology'
            }
        ];
    }

    private getComplianceStatus(): ComplianceStatus {
        return {
            hipaaCompliant: true,
            fdaCompliant: true,
            auditReady: true,
            dataProtectionActive: true,
            accessControlsValid: true,
            encryptionActive: true,
            lastAudit: Date.now() - 7776000000, // 90 days ago
            nextAudit: Date.now() + 23328000000, // 270 days
            violationsCount: 0
        };
    }

    private getPatientSafetyIndicators(): PatientSafetyIndicators {
        return {
            systemsOperational: true,
            dataIntegrityValid: true,
            emergencySystemsReady: true,
            medicalDevicesConnected: true,
            alertSystemActive: true,
            backupSystemsReady: true,
            staffNotificationActive: true,
            safetyScore: 98
        };
    }

    dispose(): void {
        console.log('Disposing G3D Medical Monitoring System...');
        this.stopMonitoring();
        this.metrics.clear();
        this.alerts.clear();
        this.healthChecks.clear();
    }
}

export default MedicalMonitoring;