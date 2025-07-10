/**
 * Debug Logger Utility
 * Simple logger for debugging and development
 */

export enum LogCategory {
  General = 'general',
  Core = 'core',
  Performance = 'performance',
  Debug = 'debug',
  Error = 'error'
}

export class Logger {
  static info(message: string, category?: LogCategory, data?: any): void {
    const prefix = category ? `[${category.toUpperCase()}]` : '[INFO]';
    console.log(prefix, message, data || '');
  }

  static warn(message: string, category?: LogCategory, data?: any): void {
    const prefix = category ? `[${category.toUpperCase()}]` : '[WARN]';
    console.warn(prefix, message, data || '');
  }

  static error(message: string, category?: LogCategory, data?: any): void {
    const prefix = category ? `[${category.toUpperCase()}]` : '[ERROR]';
    console.error(prefix, message, data || '');
  }

  static debug(message: string, category?: LogCategory, data?: any): void {
    const prefix = category ? `[${category.toUpperCase()}]` : '[DEBUG]';
    console.debug(prefix, message, data || '');
  }
}

export { Logger as default }; 