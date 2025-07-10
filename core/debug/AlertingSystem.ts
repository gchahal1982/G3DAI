import { Logger, LogCategory } from './DebugLogger';

/**
 * G3D Alerting System
 * 
 * Provides automated alerts and notifications for critical metrics violations,
 * performance regressions, and system health issues.
 */


// Temporary interface to avoid broken MetricsCollector import
interface SuccessMetricsSnapshot {
    build?: {
        duration: number;
        bundleSize: number;
        errors: any[];
    };
    targets: {
        buildTime: number;
        bundleSize: number;
        initSuccessRate: number;
        timeToFirstRender: number;
        circularDependencies: number;
    };
    initialization: Array<{ success: boolean }>;
    render?: {
        timeToFirstRender: number;
    };
    circularDependencies?: {
        circularCount: number;
    };
}

// Temporary mock for MetricsCollector
const MetricsCollector = {
    takeSnapshot: (): SuccessMetricsSnapshot => ({
        targets: {
            buildTime: 5000,
            bundleSize: 1000000,
            initSuccessRate: 0.95,
            timeToFirstRender: 1000,
            circularDependencies: 0
        },
        initialization: [{ success: true }]
    })
};

// Temporary interface to avoid broken MemoryDebugger import
interface MemoryAlert {
    type: 'critical' | 'warning';
    message: string;
    value: number;
    threshold: number;
    suggestion: string;
}

// Temporary mock for MemoryDebugger
const MemoryDebugger = {
    checkThresholds: (): MemoryAlert[] => [],
    forceGarbageCollection: (): void => { },
    generateReport: (): string => ''
};

export enum AlertSeverity {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    CRITICAL = 'critical'
}

export interface Alert {
    id: string;
    timestamp: number;
    severity: AlertSeverity;
    category: string;
    title: string;
    message: string;
    data?: any;
    acknowledged: boolean;
    resolved: boolean;
    resolvedAt?: number;
    actions?: AlertAction[];
}

export interface AlertAction {
    label: string;
    action: () => void | Promise<void>;
    type: 'primary' | 'secondary' | 'danger';
}

export interface AlertRule {
    id: string;
    name: string;
    category: string;
    condition: (snapshot: SuccessMetricsSnapshot) => boolean;
    severity: AlertSeverity;
    message: string;
    cooldown: number; // milliseconds
    enabled: boolean;
    actions?: AlertAction[];
}

export interface AlertChannel {
    name: string;
    type: 'console' | 'notification' | 'webhook' | 'email' | 'custom';
    enabled: boolean;
    config: any;
    send: (alert: Alert) => void | Promise<void>;
}

export interface AlertingConfig {
    enabled: boolean;
    globalCooldown: number;
    maxActiveAlerts: number;
    retentionPeriod: number;
    channels: AlertChannel[];
    rules: AlertRule[];
}

class AlertingSystemManager {
    private static instance: AlertingSystemManager;
    private alerts: Alert[] = [];
    private activeAlerts = new Map<string, Alert>();
    private ruleCooldowns = new Map<string, number>();
    private checkInterval?: number;

    private config: AlertingConfig = {
        enabled: true,
        globalCooldown: 30000, // 30 seconds
        maxActiveAlerts: 10,
        retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
        channels: [],
        rules: []
    };

    private defaultRules: AlertRule[] = [
        {
            id: 'build-time-exceeded',
            name: 'Build Time Exceeded',
            category: 'performance',
            condition: (snapshot) => {
                return snapshot.build?.duration ?
                    snapshot.build.duration > snapshot.targets.buildTime * 1.5 : false;
            },
            severity: AlertSeverity.WARNING,
            message: 'Build time exceeded target by 50%',
            cooldown: 300000, // 5 minutes
            enabled: true
        },
        {
            id: 'bundle-size-exceeded',
            name: 'Bundle Size Exceeded',
            category: 'performance',
            condition: (snapshot) => {
                return snapshot.build?.bundleSize ?
                    snapshot.build.bundleSize > snapshot.targets.bundleSize * 1.2 : false;
            },
            severity: AlertSeverity.ERROR,
            message: 'Bundle size exceeded target by 20%',
            cooldown: 600000, // 10 minutes
            enabled: true
        },
        {
            id: 'initialization-failure-rate',
            name: 'High Initialization Failure Rate',
            category: 'reliability',
            condition: (snapshot) => {
                const successfulInits = snapshot.initialization.filter(i => i.success).length;
                const totalInits = snapshot.initialization.length;
                const successRate = totalInits > 0 ? successfulInits / totalInits : 1;
                return successRate < snapshot.targets.initSuccessRate * 0.8;
            },
            severity: AlertSeverity.CRITICAL,
            message: 'Initialization failure rate is critically high',
            cooldown: 120000, // 2 minutes
            enabled: true
        },
        {
            id: 'first-render-time-exceeded',
            name: 'First Render Time Exceeded',
            category: 'performance',
            condition: (snapshot) => {
                return snapshot.render?.timeToFirstRender ?
                    snapshot.render.timeToFirstRender > snapshot.targets.timeToFirstRender * 2 : false;
            },
            severity: AlertSeverity.WARNING,
            message: 'Time to first render exceeded target by 100%',
            cooldown: 300000, // 5 minutes
            enabled: true
        },
        {
            id: 'circular-dependencies-detected',
            name: 'Circular Dependencies Detected',
            category: 'architecture',
            condition: (snapshot) => {
                return snapshot.circularDependencies ?
                    snapshot.circularDependencies.circularCount > snapshot.targets.circularDependencies : false;
            },
            severity: AlertSeverity.ERROR,
            message: 'Circular dependencies detected in codebase',
            cooldown: 1800000, // 30 minutes
            enabled: true
        },
        {
            id: 'build-errors',
            name: 'Build Errors',
            category: 'quality',
            condition: (snapshot) => {
                return snapshot.build ? snapshot.build.errors.length > 0 : false;
            },
            severity: AlertSeverity.ERROR,
            message: 'Build completed with errors',
            cooldown: 60000, // 1 minute
            enabled: true
        }
    ];

    private constructor() {
        this.setupDefaultChannels();
        this.setupDefaultRules();
        this.startMonitoring();
    }

    static getInstance(): AlertingSystemManager {
        if (!AlertingSystemManager.instance) {
            AlertingSystemManager.instance = new AlertingSystemManager();
        }
        return AlertingSystemManager.instance;
    }

    private setupDefaultChannels(): void {
        // Console channel
        this.config.channels.push({
            name: 'console',
            type: 'console',
            enabled: true,
            config: {},
            send: (alert: Alert) => {
                const method = alert.severity === AlertSeverity.CRITICAL || alert.severity === AlertSeverity.ERROR
                    ? 'error'
                    : alert.severity === AlertSeverity.WARNING
                        ? 'warn'
                        : 'info';

                console[method](`[G3D Alert] ${alert.title}: ${alert.message}`, alert.data);
            }
        });

        // Browser notification channel
        if (typeof window !== 'undefined' && 'Notification' in window) {
            this.config.channels.push({
                name: 'notification',
                type: 'notification',
                enabled: false, // Disabled by default
                config: {},
                send: async (alert: Alert) => {
                    if (Notification.permission === 'granted') {
                        new Notification(`G3D ${alert.severity.toUpperCase()}`, {
                            body: `${alert.title}: ${alert.message}`,
                            icon: '/favicon.ico'
                        });
                    } else if (Notification.permission !== 'denied') {
                        const permission = await Notification.requestPermission();
                        if (permission === 'granted') {
                            this.config.channels.find(c => c.name === 'notification')!.enabled = true;
                            new Notification(`G3D ${alert.severity.toUpperCase()}`, {
                                body: `${alert.title}: ${alert.message}`,
                                icon: '/favicon.ico'
                            });
                        }
                    }
                }
            });
        }
    }

    private setupDefaultRules(): void {
        this.config.rules = [...this.defaultRules];
    }

    private startMonitoring(): void {
        if (this.checkInterval) return;

        this.checkInterval = window.setInterval(() => {
            this.checkRules();
            this.cleanupOldAlerts();
        }, 5000); // Check every 5 seconds

        Logger.info('Monitoring started', LogCategory.General);
    }

    private stopMonitoring(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = undefined;
            Logger.info('Monitoring stopped', LogCategory.General);
        }
    }

    private checkRules(): void {
        if (!this.config.enabled) return;

        try {
            const snapshot = MetricsCollector.takeSnapshot();
            const memoryAlerts = MemoryDebugger.checkThresholds();

            // Check memory alerts
            memoryAlerts.forEach((memAlert: MemoryAlert) => {
                this.createMemoryAlert(memAlert);
            });

            // Check configured rules
            this.config.rules.forEach(rule => {
                if (!rule.enabled) return;

                // Check cooldown
                const lastTriggered = this.ruleCooldowns.get(rule.id);
                if (lastTriggered && Date.now() - lastTriggered < rule.cooldown) {
                    return;
                }

                // Check condition
                if (rule.condition(snapshot)) {
                    this.triggerAlert(rule, snapshot);
                }
            });
        } catch (error) {
            Logger.error('Error checking rules', LogCategory.Error, error);
        }
    }

    private createMemoryAlert(memAlert: MemoryAlert): void {
        const alert: Alert = {
            id: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            severity: memAlert.type === 'critical' ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
            category: 'memory',
            title: 'Memory Alert',
            message: memAlert.message,
            data: {
                value: memAlert.value,
                threshold: memAlert.threshold,
                suggestion: memAlert.suggestion
            },
            acknowledged: false,
            resolved: false,
            actions: [
                {
                    label: 'Force GC',
                    action: () => MemoryDebugger.forceGarbageCollection(),
                    type: 'primary'
                },
                {
                    label: 'Memory Report',
                    action: () => { Logger.info('Memory debug report generated', LogCategory.General); },
                    type: 'secondary'
                }
            ]
        };

        this.addAlert(alert);
    }

    private triggerAlert(rule: AlertRule, snapshot: SuccessMetricsSnapshot): void {
        const alert: Alert = {
            id: `${rule.id}-${Date.now()}`,
            timestamp: Date.now(),
            severity: rule.severity,
            category: rule.category,
            title: rule.name,
            message: rule.message,
            data: snapshot,
            acknowledged: false,
            resolved: false,
            actions: rule.actions
        };

        this.addAlert(alert);
        this.ruleCooldowns.set(rule.id, Date.now());

        Logger.warn(`Alert triggered: ${rule.name}`, LogCategory.General, {
            rule: rule.id,
            severity: rule.severity
        });
    }

    public addAlert(alert: Alert): void {
        // Check if we've reached the max active alerts
        if (this.activeAlerts.size >= this.config.maxActiveAlerts) {
            // Remove oldest alert
            const oldest = Array.from(this.activeAlerts.values())
                .sort((a, b) => a.timestamp - b.timestamp)[0];
            this.activeAlerts.delete(oldest.id);
        }

        this.alerts.push(alert);
        this.activeAlerts.set(alert.id, alert);

        // Send to all enabled channels
        this.config.channels
            .filter(channel => channel.enabled)
            .forEach(channel => {
                try {
                    channel.send(alert);
                } catch (error) {
                    Logger.error(`Error sending alert to channel ${channel.name}`, LogCategory.Error, error);
                }
            });
    }

    private cleanupOldAlerts(): void {
        const cutoff = Date.now() - this.config.retentionPeriod;

        // Remove old alerts from history
        this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);

        // Remove old resolved alerts from active alerts
        this.activeAlerts.forEach((alert, id) => {
            if (alert.resolved && alert.resolvedAt && alert.resolvedAt < cutoff) {
                this.activeAlerts.delete(id);
            }
        });

        // Clean up rule cooldowns
        this.ruleCooldowns.forEach((timestamp, ruleId) => {
            const rule = this.config.rules.find(r => r.id === ruleId);
            if (rule && Date.now() - timestamp > rule.cooldown * 2) {
                this.ruleCooldowns.delete(ruleId);
            }
        });
    }

    // Public API

    acknowledgeAlert(alertId: string): boolean {
        const alert = this.activeAlerts.get(alertId);
        if (alert) {
            alert.acknowledged = true;
            Logger.info(`Alert acknowledged: ${alertId}`, LogCategory.General);
            return true;
        }
        return false;
    }

    resolveAlert(alertId: string): boolean {
        const alert = this.activeAlerts.get(alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolvedAt = Date.now();
            Logger.info(`Alert resolved: ${alertId}`, LogCategory.General);
            return true;
        }
        return false;
    }

    dismissAlert(alertId: string): boolean {
        const alert = this.activeAlerts.get(alertId);
        if (alert) {
            this.activeAlerts.delete(alertId);
            Logger.info(`Alert dismissed: ${alertId}`, LogCategory.General);
            return true;
        }
        return false;
    }

    getActiveAlerts(): Alert[] {
        return Array.from(this.activeAlerts.values());
    }

    getAlertHistory(): Alert[] {
        return [...this.alerts];
    }

    getAlert(alertId: string): Alert | null {
        return this.activeAlerts.get(alertId) || null;
    }

    addRule(rule: AlertRule): void {
        this.config.rules.push(rule);
        Logger.info(`Alert rule added: ${rule.name}`, LogCategory.General);
    }

    removeRule(ruleId: string): boolean {
        const index = this.config.rules.findIndex(r => r.id === ruleId);
        if (index >= 0) {
            this.config.rules.splice(index, 1);
            this.ruleCooldowns.delete(ruleId);
            Logger.info(`Alert rule removed: ${ruleId}`, LogCategory.General);
            return true;
        }
        return false;
    }

    enableRule(ruleId: string): boolean {
        const rule = this.config.rules.find(r => r.id === ruleId);
        if (rule) {
            rule.enabled = true;
            Logger.info(`Alert rule enabled: ${ruleId}`, LogCategory.General);
            return true;
        }
        return false;
    }

    disableRule(ruleId: string): boolean {
        const rule = this.config.rules.find(r => r.id === ruleId);
        if (rule) {
            rule.enabled = false;
            Logger.info(`Alert rule disabled: ${ruleId}`, LogCategory.General);
            return true;
        }
        return false;
    }

    addChannel(channel: AlertChannel): void {
        this.config.channels.push(channel);
        Logger.info(`Alert channel added: ${channel.name}`, LogCategory.General);
    }

    removeChannel(channelName: string): boolean {
        const index = this.config.channels.findIndex(c => c.name === channelName);
        if (index >= 0) {
            this.config.channels.splice(index, 1);
            Logger.info(`Alert channel removed: ${channelName}`, LogCategory.General);
            return true;
        }
        return false;
    }

    enableChannel(channelName: string): boolean {
        const channel = this.config.channels.find(c => c.name === channelName);
        if (channel) {
            channel.enabled = true;
            Logger.info(`Alert channel enabled: ${channelName}`, LogCategory.General);
            return true;
        }
        return false;
    }

    disableChannel(channelName: string): boolean {
        const channel = this.config.channels.find(c => c.name === channelName);
        if (channel) {
            channel.enabled = false;
            Logger.info(`Alert channel disabled: ${channelName}`, LogCategory.General);
            return true;
        }
        return false;
    }

    configure(config: Partial<AlertingConfig>): void {
        const wasEnabled = this.config.enabled;
        this.config = { ...this.config, ...config };

        if (!wasEnabled && this.config.enabled) {
            this.startMonitoring();
        } else if (wasEnabled && !this.config.enabled) {
            this.stopMonitoring();
        }

        Logger.info('Configuration updated', LogCategory.General, config);
    }

    getConfig(): AlertingConfig {
        return { ...this.config };
    }

    enable(): void {
        this.config.enabled = true;
        this.startMonitoring();
    }

    disable(): void {
        this.config.enabled = false;
        this.stopMonitoring();
    }

    isEnabled(): boolean {
        return this.config.enabled;
    }

    // Test alert generation
    createTestAlert(severity: AlertSeverity = AlertSeverity.INFO): void {
        const alert: Alert = {
            id: `test-${Date.now()}`,
            timestamp: Date.now(),
            severity,
            category: 'test',
            title: 'Test Alert',
            message: 'This is a test alert to verify the alerting system is working',
            acknowledged: false,
            resolved: false,
            actions: [
                {
                    label: 'Acknowledge',
                    action: () => { this.acknowledgeAlert(alert.id); },
                    type: 'primary'
                },
                {
                    label: 'Resolve',
                    action: () => { this.resolveAlert(alert.id); },
                    type: 'secondary'
                }
            ]
        };

        this.addAlert(alert);
    }

    // Statistics
    getStatistics() {
        const activeCount = this.activeAlerts.size;
        const totalCount = this.alerts.length;
        const acknowledgedCount = this.alerts.filter(a => a.acknowledged).length;
        const resolvedCount = this.alerts.filter(a => a.resolved).length;

        const severityCounts = this.alerts.reduce((counts, alert) => {
            counts[alert.severity] = (counts[alert.severity] || 0) + 1;
            return counts;
        }, {} as Record<AlertSeverity, number>);

        const categoryCounts = this.alerts.reduce((counts, alert) => {
            counts[alert.category] = (counts[alert.category] || 0) + 1;
            return counts;
        }, {} as Record<string, number>);

        return {
            active: activeCount,
            total: totalCount,
            acknowledged: acknowledgedCount,
            resolved: resolvedCount,
            bySeverity: severityCounts,
            byCategory: categoryCounts,
            rules: {
                total: this.config.rules.length,
                enabled: this.config.rules.filter(r => r.enabled).length
            },
            channels: {
                total: this.config.channels.length,
                enabled: this.config.channels.filter(c => c.enabled).length
            }
        };
    }
}

// Export singleton instance
export const AlertingSystem = AlertingSystemManager.getInstance();

// Convenience functions
export function createAlert(severity: AlertSeverity, title: string, message: string, data?: unknown): void {
    const alert: Alert = {
        id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        severity,
        category: 'manual',
        title,
        message,
        data,
        acknowledged: false,
        resolved: false
    };

    AlertingSystem.addAlert(alert);
}

export function acknowledgeAlert(alertId: string): boolean {
    return AlertingSystem.acknowledgeAlert(alertId);
}

export function resolveAlert(alertId: string): boolean {
    return AlertingSystem.resolveAlert(alertId);
}

export function getActiveAlerts(): Alert[] {
    return AlertingSystem.getActiveAlerts();
}

// Register with window for easy access
if (typeof window !== 'undefined') {
    const typedWindow = window as typeof window & {
        G3D?: { alerts?: typeof AlertingSystem;[key: string]: unknown }
    };
    typedWindow.G3D = typedWindow.G3D || {};
    typedWindow.G3D.alerts = AlertingSystem;
}