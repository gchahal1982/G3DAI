/**
 * Core Metrics Collection
 * Simple metrics tracking for services
 */

interface MetricData {
  timestamp: number;
  value: number;
  tags?: Record<string, string>;
}

export class Metrics {
  private static metrics: Map<string, MetricData[]> = new Map();

  static record(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name)!.push({
      timestamp: Date.now(),
      value,
      tags
    });
  }

  static get(name: string): MetricData[] {
    return this.metrics.get(name) || [];
  }

  static clear(): void {
    this.metrics.clear();
  }
} 