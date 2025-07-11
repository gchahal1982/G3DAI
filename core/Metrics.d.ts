/**
 * Core Metrics Collection
 * Simple metrics tracking for services
 */
interface MetricData {
    timestamp: number;
    value: number;
    tags?: Record<string, string>;
}
export declare class Metrics {
    private static metrics;
    static record(name: string, value: number, tags?: Record<string, string>): void;
    static get(name: string): MetricData[];
    static clear(): void;
}
export {};
//# sourceMappingURL=Metrics.d.ts.map