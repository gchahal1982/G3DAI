/**
 * Debug Logger Utility
 * Simple logger for debugging and development
 */
export var LogCategory;
(function (LogCategory) {
    LogCategory["General"] = "general";
    LogCategory["Core"] = "core";
    LogCategory["Performance"] = "performance";
    LogCategory["Debug"] = "debug";
    LogCategory["Error"] = "error";
})(LogCategory || (LogCategory = {}));
export class Logger {
    static info(message, category, data) {
        const prefix = category ? `[${category.toUpperCase()}]` : '[INFO]';
        console.log(prefix, message, data || '');
    }
    static warn(message, category, data) {
        const prefix = category ? `[${category.toUpperCase()}]` : '[WARN]';
        console.warn(prefix, message, data || '');
    }
    static error(message, category, data) {
        const prefix = category ? `[${category.toUpperCase()}]` : '[ERROR]';
        console.error(prefix, message, data || '');
    }
    static debug(message, category, data) {
        const prefix = category ? `[${category.toUpperCase()}]` : '[DEBUG]';
        console.debug(prefix, message, data || '');
    }
}
export { Logger as default };
