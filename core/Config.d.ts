/**
 * Core Configuration Management
 * Simple configuration utilities
 */
interface ConfigValues {
    [key: string]: any;
}
export declare class Config {
    private static config;
    static get(key: string, defaultValue?: any): any;
    static set(key: string, value: any): void;
    static load(values: ConfigValues): void;
    static getAll(): ConfigValues;
}
export {};
//# sourceMappingURL=Config.d.ts.map