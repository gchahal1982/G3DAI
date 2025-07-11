/**
 * Debug Logger Utility
 * Simple logger for debugging and development
 */
export declare enum LogCategory {
    General = "general",
    Core = "core",
    Performance = "performance",
    Debug = "debug",
    Error = "error"
}
export declare class Logger {
    static info(message: string, category?: LogCategory, data?: any): void;
    static warn(message: string, category?: LogCategory, data?: any): void;
    static error(message: string, category?: LogCategory, data?: any): void;
    static debug(message: string, category?: LogCategory, data?: any): void;
}
export { Logger as default };
//# sourceMappingURL=DebugLogger.d.ts.map