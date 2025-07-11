/**
 * Core Configuration Management
 * Simple configuration utilities
 */
export class Config {
    static get(key, defaultValue) {
        return this.config[key] ?? defaultValue;
    }
    static set(key, value) {
        this.config[key] = value;
    }
    static load(values) {
        this.config = { ...this.config, ...values };
    }
    static getAll() {
        return { ...this.config };
    }
}
Config.config = {};
