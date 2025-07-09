/**
 * G3D AI Services - Metrics Service
 * Comprehensive monitoring and analytics for all 16 G3D AI services
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

// Types
interface ServiceMetrics {
    serviceName: string;
    timestamp: Date;
    requestCount: number;
    responseTime: number;
    errorCount: number;
    successRate: number;
    activeUsers: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkIO: {
        inbound: number;
        outbound: number;
    };
    customMetrics: Record<string, number>;
}

interface UserMetrics {
    userId: string;
    organizationId: string;
    sessionId: string;
    service: string;
    action: string;
    timestamp: Date;
    duration: number;
    success: boolean;
    errorType?: string;
    metadata: Record<string, any>;
}

interface BusinessMetrics {
    date: Date;
    revenue: number;
    newUsers: number;
    activeUsers: number;
    churnRate: number;
    conversionRate: number;
    averageSessionDuration: number;
    topServices: Array<{
        service: string;
        usage: number;
        revenue: number;
    }>;
    geographicDistribution: Record<string, number>;
    subscriptionMetrics: {
        free: number;
        basic: number;
        professional: number;
        enterprise: number;
        custom: number;
    };
}

interface AlertRule {
    id: string;
    name: string;
    service: string;
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
    duration: number; // seconds
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
    notifications: {
        email: boolean;
        slack: boolean;
        webhook?: string;
    };
}

interface Alert {
    id: string;
    ruleId: string;
    service: string;
    metric: string;
    value: number;
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    resolved: boolean;
    resolvedAt?: Date;
    description: string;
}

export class MetricsService extends EventEmitter {
    private serviceMetrics: Map<string, ServiceMetrics[]> = new Map();
    private userMetrics: UserMetrics[] = [];
    private businessMetrics: BusinessMetrics[] = [];
    private alertRules: Map<string, AlertRule> = new Map();
    private activeAlerts: Map<string, Alert> = new Map();
    private metricsBuffer: Map<string, any[]> = new Map();
    private flushInterval: NodeJS.Timeout;

    // Service names for all 16 G3D AI services
    private readonly services = [
        'vision-pro', 'code-forge', 'creative-studio', 'data-forge',
        'secure-ai', 'automl', 'chat-builder', 'video-ai',
        'finance-ai', 'health-ai', 'voice-ai', 'translate-ai',
        'documind', 'mesh3d', 'edge-ai', 'legal-ai'
    ];

    constructor() {
        super();
        this.initializeServices();
        this.setupDefaultAlertRules();
        this.startMetricsCollection();

        // Flush metrics every 30 seconds
        this.flushInterval = setInterval(() => {
            this.flushMetrics();
        }, 30000);
    }

    /**
     * Initialize service metrics storage
     */
    private initializeServices(): void {
        this.services.forEach(service => {
            this.serviceMetrics.set(service, []);
            this.metricsBuffer.set(service, []);
        });
    }

    /**
     * Setup default alert rules for all services
     */
    private setupDefaultAlertRules(): void {
        const defaultRules: Omit<AlertRule, 'id'>[] = [
            {
                name: 'High Error Rate',
                service: '*',
                metric: 'errorRate',
                operator: 'gt',
                threshold: 5, // 5%
                duration: 300, // 5 minutes
                severity: 'high',
                enabled: true,
                notifications: { email: true, slack: true }
            },
            {
                name: 'High Response Time',
                service: '*',
                metric: 'responseTime',
                operator: 'gt',
                threshold: 5000, // 5 seconds
                duration: 300,
                severity: 'medium',
                enabled: true,
                notifications: { email: true, slack: false }
            },
            {
                name: 'High CPU Usage',
                service: '*',
                metric: 'cpuUsage',
                operator: 'gt',
                threshold: 80, // 80%
                duration: 600, // 10 minutes
                severity: 'medium',
                enabled: true,
                notifications: { email: true, slack: true }
            },
            {
                name: 'High Memory Usage',
                service: '*',
                metric: 'memoryUsage',
                operator: 'gt',
                threshold: 90, // 90%
                duration: 300,
                severity: 'high',
                enabled: true,
                notifications: { email: true, slack: true }
            },
            {
                name: 'Service Down',
                service: '*',
                metric: 'successRate',
                operator: 'lt',
                threshold: 50, // 50%
                duration: 60, // 1 minute
                severity: 'critical',
                enabled: true,
                notifications: { email: true, slack: true }
            }
        ];

        defaultRules.forEach(rule => {
            const ruleId = `${rule.service}-${rule.metric}-${Date.now()}`;
            this.alertRules.set(ruleId, { ...rule, id: ruleId });
        });
    }

    /**
     * Start metrics collection for all services
     */
    private startMetricsCollection(): void {
        // Collect metrics every 60 seconds
        setInterval(() => {
            this.collectServiceMetrics();
        }, 60000);

        // Collect business metrics every hour
        setInterval(() => {
            this.collectBusinessMetrics();
        }, 3600000);

        // Check alerts every 30 seconds
        setInterval(() => {
            this.checkAlerts();
        }, 30000);
    }

    /**
     * Record service metrics
     */
    recordServiceMetric(serviceName: string, metrics: Partial<ServiceMetrics>): void {
        const timestamp = new Date();
        const serviceMetric: ServiceMetrics = {
            serviceName,
            timestamp,
            requestCount: 0,
            responseTime: 0,
            errorCount: 0,
            successRate: 100,
            activeUsers: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            diskUsage: 0,
            networkIO: { inbound: 0, outbound: 0 },
            customMetrics: {},
            ...metrics
        };

        // Add to buffer
        const buffer = this.metricsBuffer.get(serviceName) || [];
        buffer.push(serviceMetric);
        this.metricsBuffer.set(serviceName, buffer);

        // Emit event
        this.emit('serviceMetric', serviceMetric);
    }

    /**
     * Record user activity metrics
     */
    recordUserMetric(userMetric: UserMetrics): void {
        this.userMetrics.push(userMetric);

        // Keep only last 10000 user metrics in memory
        if (this.userMetrics.length > 10000) {
            this.userMetrics = this.userMetrics.slice(-10000);
        }

        this.emit('userMetric', userMetric);
    }

    /**
     * Record API request metrics
     */
    recordAPIRequest(
        service: string,
        endpoint: string,
        method: string,
        statusCode: number,
        responseTime: number,
        userId?: string
    ): void {
        const isError = statusCode >= 400;
        const timestamp = new Date();

        // Update service metrics buffer
        const buffer = this.metricsBuffer.get(service) || [];
        const lastMetric = buffer[buffer.length - 1] as ServiceMetrics;

        if (lastMetric && (timestamp.getTime() - lastMetric.timestamp.getTime()) < 60000) {
            // Update existing metric within the same minute
            lastMetric.requestCount++;
            lastMetric.responseTime = (lastMetric.responseTime + responseTime) / 2;
            if (isError) lastMetric.errorCount++;
            lastMetric.successRate = ((lastMetric.requestCount - lastMetric.errorCount) / lastMetric.requestCount) * 100;
        } else {
            // Create new metric
            this.recordServiceMetric(service, {
                requestCount: 1,
                responseTime,
                errorCount: isError ? 1 : 0,
                successRate: isError ? 0 : 100
            });
        }

        // Record user metric if userId provided
        if (userId) {
            this.recordUserMetric({
                userId,
                organizationId: '', // Would be populated from user context
                sessionId: '', // Would be populated from session
                service,
                action: `${method} ${endpoint}`,
                timestamp,
                duration: responseTime,
                success: !isError,
                errorType: isError ? `HTTP_${statusCode}` : undefined,
                metadata: {
                    endpoint,
                    method,
                    statusCode,
                    responseTime
                }
            });
        }
    }

    /**
     * Get service metrics for a specific time range
     */
    getServiceMetrics(
        serviceName: string,
        startTime: Date,
        endTime: Date
    ): ServiceMetrics[] {
        const metrics = this.serviceMetrics.get(serviceName) || [];
        return metrics.filter(
            metric => metric.timestamp >= startTime && metric.timestamp <= endTime
        );
    }

    /**
     * Get aggregated metrics for all services
     */
    getAggregatedMetrics(startTime: Date, endTime: Date): Record<string, any> {
        const aggregated: Record<string, any> = {};

        this.services.forEach(service => {
            const metrics = this.getServiceMetrics(service, startTime, endTime);

            if (metrics.length > 0) {
                const totalRequests = metrics.reduce((sum, m) => sum + m.requestCount, 0);
                const totalErrors = metrics.reduce((sum, m) => sum + m.errorCount, 0);
                const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
                const avgCpuUsage = metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length;
                const avgMemoryUsage = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length;

                aggregated[service] = {
                    totalRequests,
                    totalErrors,
                    errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
                    avgResponseTime,
                    avgCpuUsage,
                    avgMemoryUsage,
                    successRate: totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests) * 100 : 100,
                    dataPoints: metrics.length
                };
            }
        });

        return aggregated;
    }

    /**
     * Get user analytics
     */
    getUserAnalytics(startTime: Date, endTime: Date): Record<string, any> {
        const relevantMetrics = this.userMetrics.filter(
            metric => metric.timestamp >= startTime && metric.timestamp <= endTime
        );

        const uniqueUsers = new Set(relevantMetrics.map(m => m.userId)).size;
        const totalSessions = new Set(relevantMetrics.map(m => m.sessionId)).size;
        const avgSessionDuration = relevantMetrics.reduce((sum, m) => sum + m.duration, 0) / relevantMetrics.length;

        const serviceUsage = relevantMetrics.reduce((acc, metric) => {
            acc[metric.service] = (acc[metric.service] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const errorsByService = relevantMetrics
            .filter(m => !m.success)
            .reduce((acc, metric) => {
                acc[metric.service] = (acc[metric.service] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        return {
            uniqueUsers,
            totalSessions,
            avgSessionDuration,
            totalActions: relevantMetrics.length,
            serviceUsage,
            errorsByService,
            successRate: relevantMetrics.length > 0
                ? (relevantMetrics.filter(m => m.success).length / relevantMetrics.length) * 100
                : 100
        };
    }

    /**
     * Get business metrics
     */
    getBusinessMetrics(startTime: Date, endTime: Date): BusinessMetrics[] {
        return this.businessMetrics.filter(
            metric => metric.date >= startTime && metric.date <= endTime
        );
    }

    /**
     * Create custom alert rule
     */
    createAlertRule(rule: Omit<AlertRule, 'id'>): string {
        const ruleId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.alertRules.set(ruleId, { ...rule, id: ruleId });
        return ruleId;
    }

    /**
     * Update alert rule
     */
    updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
        const rule = this.alertRules.get(ruleId);
        if (!rule) return false;

        this.alertRules.set(ruleId, { ...rule, ...updates });
        return true;
    }

    /**
     * Delete alert rule
     */
    deleteAlertRule(ruleId: string): boolean {
        return this.alertRules.delete(ruleId);
    }

    /**
     * Get all alert rules
     */
    getAlertRules(): AlertRule[] {
        return Array.from(this.alertRules.values());
    }

    /**
     * Get active alerts
     */
    getActiveAlerts(): Alert[] {
        return Array.from(this.activeAlerts.values()).filter(alert => !alert.resolved);
    }

    /**
     * Get alert history
     */
    getAlertHistory(startTime: Date, endTime: Date): Alert[] {
        return Array.from(this.activeAlerts.values()).filter(
            alert => alert.timestamp >= startTime && alert.timestamp <= endTime
        );
    }

    /**
     * Resolve alert
     */
    resolveAlert(alertId: string): boolean {
        const alert = this.activeAlerts.get(alertId);
        if (!alert) return false;

        alert.resolved = true;
        alert.resolvedAt = new Date();
        this.emit('alertResolved', alert);
        return true;
    }

    /**
     * Get performance insights
     */
    getPerformanceInsights(serviceName: string, hours: number = 24): Record<string, any> {
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - (hours * 60 * 60 * 1000));
        const metrics = this.getServiceMetrics(serviceName, startTime, endTime);

        if (metrics.length === 0) {
            return { error: 'No metrics available for the specified time range' };
        }

        const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
        const maxResponseTime = Math.max(...metrics.map(m => m.responseTime));
        const minResponseTime = Math.min(...metrics.map(m => m.responseTime));
        const totalRequests = metrics.reduce((sum, m) => sum + m.requestCount, 0);
        const totalErrors = metrics.reduce((sum, m) => sum + m.errorCount, 0);
        const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

        // Calculate trends
        const midPoint = Math.floor(metrics.length / 2);
        const firstHalf = metrics.slice(0, midPoint);
        const secondHalf = metrics.slice(midPoint);

        const firstHalfAvgResponse = firstHalf.reduce((sum, m) => sum + m.responseTime, 0) / firstHalf.length;
        const secondHalfAvgResponse = secondHalf.reduce((sum, m) => sum + m.responseTime, 0) / secondHalf.length;
        const responseTimeTrend = secondHalfAvgResponse - firstHalfAvgResponse;

        return {
            serviceName,
            timeRange: { startTime, endTime, hours },
            performance: {
                avgResponseTime,
                maxResponseTime,
                minResponseTime,
                responseTimeTrend: responseTimeTrend > 0 ? 'increasing' : 'decreasing',
                responseTimeTrendValue: Math.abs(responseTimeTrend)
            },
            reliability: {
                totalRequests,
                totalErrors,
                errorRate,
                successRate: 100 - errorRate
            },
            resourceUsage: {
                avgCpuUsage: metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length,
                avgMemoryUsage: metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length,
                avgDiskUsage: metrics.reduce((sum, m) => sum + m.diskUsage, 0) / metrics.length
            },
            recommendations: this.generateRecommendations(serviceName, metrics)
        };
    }

    /**
     * Generate performance recommendations
     */
    private generateRecommendations(serviceName: string, metrics: ServiceMetrics[]): string[] {
        const recommendations: string[] = [];

        const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
        const avgCpuUsage = metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length;
        const avgMemoryUsage = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length;
        const totalRequests = metrics.reduce((sum, m) => sum + m.requestCount, 0);
        const totalErrors = metrics.reduce((sum, m) => sum + m.errorCount, 0);
        const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

        if (avgResponseTime > 2000) {
            recommendations.push('Consider optimizing database queries and implementing caching to reduce response times');
        }

        if (avgCpuUsage > 70) {
            recommendations.push('High CPU usage detected. Consider scaling horizontally or optimizing CPU-intensive operations');
        }

        if (avgMemoryUsage > 80) {
            recommendations.push('Memory usage is high. Check for memory leaks and consider increasing memory allocation');
        }

        if (errorRate > 2) {
            recommendations.push('Error rate is above acceptable threshold. Review error logs and implement better error handling');
        }

        if (totalRequests / metrics.length > 1000) {
            recommendations.push('High request volume detected. Consider implementing rate limiting and load balancing');
        }

        return recommendations;
    }

    /**
     * Collect service metrics (simulate real metrics collection)
     */
    private collectServiceMetrics(): void {
        this.services.forEach(service => {
            // Simulate metrics collection
            const metrics: Partial<ServiceMetrics> = {
                requestCount: Math.floor(Math.random() * 1000) + 100,
                responseTime: Math.floor(Math.random() * 2000) + 200,
                errorCount: Math.floor(Math.random() * 10),
                cpuUsage: Math.floor(Math.random() * 100),
                memoryUsage: Math.floor(Math.random() * 100),
                diskUsage: Math.floor(Math.random() * 100),
                networkIO: {
                    inbound: Math.floor(Math.random() * 1000000),
                    outbound: Math.floor(Math.random() * 1000000)
                },
                activeUsers: Math.floor(Math.random() * 500) + 50
            };

            metrics.successRate = metrics.requestCount && metrics.errorCount
                ? ((metrics.requestCount - metrics.errorCount) / metrics.requestCount) * 100
                : 100;

            this.recordServiceMetric(service, metrics);
        });
    }

    /**
     * Collect business metrics (simulate)
     */
    private collectBusinessMetrics(): void {
        const businessMetric: BusinessMetrics = {
            date: new Date(),
            revenue: Math.floor(Math.random() * 100000) + 50000,
            newUsers: Math.floor(Math.random() * 100) + 20,
            activeUsers: Math.floor(Math.random() * 5000) + 1000,
            churnRate: Math.random() * 5,
            conversionRate: Math.random() * 10 + 2,
            averageSessionDuration: Math.floor(Math.random() * 1800) + 300,
            topServices: this.services.slice(0, 5).map(service => ({
                service,
                usage: Math.floor(Math.random() * 10000) + 1000,
                revenue: Math.floor(Math.random() * 20000) + 5000
            })),
            geographicDistribution: {
                'US': Math.floor(Math.random() * 1000) + 500,
                'EU': Math.floor(Math.random() * 800) + 300,
                'APAC': Math.floor(Math.random() * 600) + 200,
                'Other': Math.floor(Math.random() * 400) + 100
            },
            subscriptionMetrics: {
                free: Math.floor(Math.random() * 1000) + 500,
                basic: Math.floor(Math.random() * 500) + 200,
                professional: Math.floor(Math.random() * 200) + 100,
                enterprise: Math.floor(Math.random() * 50) + 20,
                custom: Math.floor(Math.random() * 10) + 5
            }
        };

        this.businessMetrics.push(businessMetric);

        // Keep only last 30 days of business metrics
        const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
        this.businessMetrics = this.businessMetrics.filter(metric => metric.date >= thirtyDaysAgo);

        this.emit('businessMetric', businessMetric);
    }

    /**
     * Check alert rules and trigger alerts
     */
    private checkAlerts(): void {
        const now = new Date();

        this.alertRules.forEach(rule => {
            if (!rule.enabled) return;

            const services = rule.service === '*' ? this.services : [rule.service];

            services.forEach(serviceName => {
                const recentMetrics = this.getServiceMetrics(
                    serviceName,
                    new Date(now.getTime() - (rule.duration * 1000)),
                    now
                );

                if (recentMetrics.length === 0) return;

                let metricValue: number;
                switch (rule.metric) {
                    case 'errorRate':
                        const totalRequests = recentMetrics.reduce((sum, m) => sum + m.requestCount, 0);
                        const totalErrors = recentMetrics.reduce((sum, m) => sum + m.errorCount, 0);
                        metricValue = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
                        break;
                    case 'responseTime':
                        metricValue = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
                        break;
                    case 'cpuUsage':
                        metricValue = recentMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / recentMetrics.length;
                        break;
                    case 'memoryUsage':
                        metricValue = recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / recentMetrics.length;
                        break;
                    case 'successRate':
                        const totalReqs = recentMetrics.reduce((sum, m) => sum + m.requestCount, 0);
                        const totalErrs = recentMetrics.reduce((sum, m) => sum + m.errorCount, 0);
                        metricValue = totalReqs > 0 ? ((totalReqs - totalErrs) / totalReqs) * 100 : 100;
                        break;
                    default:
                        return;
                }

                const shouldAlert = this.evaluateAlertCondition(rule.operator, metricValue, rule.threshold);
                const alertId = `${rule.id}-${serviceName}`;

                if (shouldAlert && !this.activeAlerts.has(alertId)) {
                    const alert: Alert = {
                        id: alertId,
                        ruleId: rule.id,
                        service: serviceName,
                        metric: rule.metric,
                        value: metricValue,
                        threshold: rule.threshold,
                        severity: rule.severity,
                        timestamp: now,
                        resolved: false,
                        description: `${rule.name}: ${rule.metric} is ${metricValue.toFixed(2)} (threshold: ${rule.threshold})`
                    };

                    this.activeAlerts.set(alertId, alert);
                    this.emit('alert', alert);
                } else if (!shouldAlert && this.activeAlerts.has(alertId)) {
                    this.resolveAlert(alertId);
                }
            });
        });
    }

    /**
     * Evaluate alert condition
     */
    private evaluateAlertCondition(operator: string, value: number, threshold: number): boolean {
        switch (operator) {
            case 'gt': return value > threshold;
            case 'lt': return value < threshold;
            case 'eq': return value === threshold;
            case 'gte': return value >= threshold;
            case 'lte': return value <= threshold;
            default: return false;
        }
    }

    /**
     * Flush metrics from buffer to storage
     */
    private flushMetrics(): void {
        this.metricsBuffer.forEach((buffer, serviceName) => {
            if (buffer.length > 0) {
                const existingMetrics = this.serviceMetrics.get(serviceName) || [];
                existingMetrics.push(...buffer);

                // Keep only last 24 hours of metrics in memory
                const oneDayAgo = new Date(Date.now() - (24 * 60 * 60 * 1000));
                const filteredMetrics = existingMetrics.filter(metric => metric.timestamp >= oneDayAgo);

                this.serviceMetrics.set(serviceName, filteredMetrics);
                this.metricsBuffer.set(serviceName, []);
            }
        });
    }

    /**
     * Export metrics data
     */
    exportMetrics(format: 'json' | 'csv' = 'json'): string {
        const data = {
            timestamp: new Date().toISOString(),
            services: this.services,
            serviceMetrics: Object.fromEntries(this.serviceMetrics),
            userMetrics: this.userMetrics.slice(-1000), // Last 1000 user metrics
            businessMetrics: this.businessMetrics.slice(-30), // Last 30 business metrics
            alertRules: Array.from(this.alertRules.values()),
            activeAlerts: Array.from(this.activeAlerts.values()).filter(a => !a.resolved)
        };

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else {
            // Simple CSV export (would need proper CSV library in production)
            return 'CSV export not implemented in this demo';
        }
    }

    /**
     * Cleanup and shutdown
     */
    shutdown(): void {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
        this.flushMetrics();
        this.removeAllListeners();
    }
}

export default MetricsService;