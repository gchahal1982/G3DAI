/**
 * Core Metrics Collection
 * Simple metrics tracking for services
 */
export class Metrics {
    static record(name, value, tags) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name).push({
            timestamp: Date.now(),
            value,
            tags
        });
    }
    static get(name) {
        return this.metrics.get(name) || [];
    }
    static clear() {
        this.metrics.clear();
    }
}
Metrics.metrics = new Map();
