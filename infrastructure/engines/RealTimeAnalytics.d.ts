import { EventEmitter } from 'events';
interface DataPoint {
    id: string;
    timestamp: Date;
    value: number | string | boolean | object;
    source: string;
    type: 'numeric' | 'categorical' | 'boolean' | 'object' | 'array';
    tags: string[];
    metadata: Record<string, any>;
}
interface MetricDefinition {
    id: string;
    name: string;
    description: string;
    type: 'counter' | 'gauge' | 'histogram' | 'summary' | 'rate' | 'ratio';
    aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'percentile' | 'stddev';
    windowSize: number;
    retention: number;
    threshold?: ThresholdConfig;
    formula?: string;
    dependencies: string[];
    tags: string[];
    isActive: boolean;
    createdAt: Date;
}
interface ThresholdConfig {
    warning: number;
    critical: number;
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
    consecutive: number;
}
interface Alert {
    id: string;
    metricId: string;
    level: 'info' | 'warning' | 'critical';
    message: string;
    value: number;
    threshold: number;
    timestamp: Date;
    status: 'active' | 'resolved' | 'acknowledged';
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
    resolvedAt?: Date;
    actions: AlertAction[];
}
interface AlertAction {
    type: 'email' | 'webhook' | 'sms' | 'slack' | 'pagerduty';
    target: string;
    executed: boolean;
    executedAt?: Date;
    response?: any;
    error?: string;
}
interface Dashboard {
    id: string;
    name: string;
    description: string;
    widgets: Widget[];
    layout: DashboardLayout;
    filters: DashboardFilter[];
    refreshInterval: number;
    isPublic: boolean;
    owner: string;
    createdAt: Date;
    updatedAt: Date;
}
interface Widget {
    id: string;
    type: 'chart' | 'table' | 'metric' | 'alert' | 'heatmap' | 'gauge' | 'text';
    title: string;
    config: WidgetConfig;
    position: WidgetPosition;
    dataSource: DataSourceConfig;
    refreshInterval: number;
}
interface WidgetConfig {
    chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'histogram';
    timeRange: number;
    aggregation: string;
    groupBy?: string[];
    filters?: Record<string, any>;
    colors?: string[];
    showLegend?: boolean;
    showAxes?: boolean;
    customOptions?: Record<string, any>;
}
interface WidgetPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface DataSourceConfig {
    type: 'metric' | 'query' | 'api' | 'static';
    source: string;
    query?: string;
    parameters?: Record<string, any>;
}
interface DashboardLayout {
    columns: number;
    rows: number;
    gap: number;
    responsive: boolean;
}
interface DashboardFilter {
    id: string;
    name: string;
    type: 'select' | 'multiselect' | 'date' | 'range' | 'text';
    field: string;
    options?: string[];
    defaultValue?: any;
}
interface AnalyticsQuery {
    id: string;
    name: string;
    query: string;
    type: 'sql' | 'nosql' | 'timeseries' | 'aggregation';
    parameters: Record<string, any>;
    schedule?: QuerySchedule;
    cache: boolean;
    cacheTTL: number;
    resultFormat: 'json' | 'csv' | 'table';
    createdAt: Date;
}
interface QuerySchedule {
    enabled: boolean;
    cron: string;
    timezone: string;
    retries: number;
    timeout: number;
}
interface StreamingWindow {
    id: string;
    name: string;
    type: 'tumbling' | 'sliding' | 'session';
    size: number;
    slide?: number;
    sessionTimeout?: number;
    aggregations: WindowAggregation[];
    triggers: WindowTrigger[];
    output: WindowOutput;
}
interface WindowAggregation {
    field: string;
    function: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'first' | 'last';
    alias: string;
}
interface WindowTrigger {
    type: 'time' | 'count' | 'condition';
    value: number | string;
    action: 'emit' | 'alert' | 'store';
}
interface WindowOutput {
    type: 'stream' | 'batch' | 'store';
    destination: string;
    format: 'json' | 'avro' | 'parquet';
    compression?: string;
}
interface RealTimeMetrics {
    totalDataPoints: number;
    dataPointsPerSecond: number;
    activeMetrics: number;
    activeAlerts: number;
    activeDashboards: number;
    queryLatency: number;
    memoryUsage: number;
    cpuUsage: number;
    errorRate: number;
    uptime: number;
}
export declare class RealTimeAnalytics extends EventEmitter {
    private dataPoints;
    private metrics;
    private alerts;
    private dashboards;
    private queries;
    private windows;
    private metricValues;
    private aggregatedData;
    private queryCache;
    private isRunning;
    private processingInterval;
    private alertInterval;
    private cleanupInterval;
    private metricsInterval;
    private systemMetrics;
    private maxDataPoints;
    private defaultRetention;
    constructor();
    private initializeAnalytics;
    private setupEventHandlers;
    private setupDefaultMetrics;
    private initializeSystemMetrics;
    ingestDataPoint(dataPoint: Partial<DataPoint>): string;
    ingestBatch(dataPoints: Partial<DataPoint>[]): string[];
    createMetric(metricInfo: Partial<MetricDefinition>): string;
    updateMetric(metricId: string, updates: Partial<MetricDefinition>): void;
    deleteMetric(metricId: string): void;
    createDashboard(dashboardInfo: Partial<Dashboard>): string;
    addWidget(dashboardId: string, widgetInfo: Partial<Widget>): string;
    createQuery(queryInfo: Partial<AnalyticsQuery>): string;
    executeQuery(queryId: string, parameters?: Record<string, any>): Promise<any>;
    createWindow(windowInfo: Partial<StreamingWindow>): string;
    startAnalytics(): void;
    stopAnalytics(): void;
    private processMetrics;
    private calculateMetricValue;
    private matchesMetricCriteria;
    private applyAggregation;
    private processWindows;
    private processWindow;
    private extractFieldValue;
    private applyAggregationToValues;
    private evaluateTrigger;
    private evaluateCondition;
    private checkAlerts;
    private checkThreshold;
    private evaluateThreshold;
    private triggerAlert;
    private handleDataPointReceived;
    private handleThresholdExceeded;
    private handleAlertTriggered;
    private handleQueryExecuted;
    private handleWindowTriggered;
    private executeQueryInternal;
    private generateTimeSeriesData;
    private generateAggregationData;
    private executeAlertActions;
    private outputWindowResults;
    private performCleanup;
    private updateSystemMetrics;
    private getSourceKey;
    private getCacheKey;
    private getDefaultLayout;
    private getDefaultWidgetConfig;
    private generateDataPointId;
    private generateMetricId;
    private generateDashboardId;
    private generateWidgetId;
    private generateQueryId;
    private generateWindowId;
    private generateAlertId;
    getAnalyticsStatus(): {
        isRunning: boolean;
        metrics: RealTimeMetrics;
        totalMetrics: number;
        totalDashboards: number;
        totalQueries: number;
        cacheSize: number;
    };
    getMetricDetails(metricId: string): MetricDefinition | null;
    getMetricValues(metricId: string, timeRange?: number): number[];
    getDashboardDetails(dashboardId: string): Dashboard | null;
    getActiveAlerts(): Alert[];
    acknowledgeAlert(alertId: string, acknowledgedBy: string): void;
    resolveAlert(alertId: string): void;
}
export {};
//# sourceMappingURL=RealTimeAnalytics.d.ts.map