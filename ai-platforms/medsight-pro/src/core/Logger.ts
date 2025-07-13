export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  error?: Error;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
  maxBufferSize: number;
}

/**
 * Structured logging service for MedSight Pro
 */
export class Logger {
  private category: string;
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];

  constructor(category: string = 'App', config?: Partial<LoggerConfig>) {
    this.category = category;
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemoteLogging: false,
      maxBufferSize: 1000,
      ...config,
    };
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any, error?: Error): void {
    this.log(LogLevel.WARN, message, data, error);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any, data?: any): void {
    // Handle case where error might be passed as second parameter
    if (error && !(error instanceof Error) && typeof error === 'object') {
      data = error;
      error = undefined;
    }
    this.log(LogLevel.ERROR, message, data, error);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    // Check if we should log at this level
    if (level < this.config.level) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category: this.category,
      message,
      data,
      error,
    };

    // Add to buffer
    this.addToBuffer(logEntry);

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Remote logging
    if (this.config.enableRemoteLogging) {
      this.logToRemote(logEntry);
    }
  }

  /**
   * Add log entry to buffer
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    // Trim buffer if it exceeds max size
    if (this.logBuffer.length > this.config.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxBufferSize);
    }
  }

  /**
   * Log to browser console
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${entry.category}]`;
    
    const logData = entry.data ? [entry.data] : [];
    if (entry.error) {
      logData.push(entry.error);
    }

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, ...logData);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, ...logData);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, ...logData);
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.message, ...logData);
        break;
    }
  }

  /**
   * Send log to remote endpoint
   */
  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) {
      return;
    }

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entry,
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (error) {
      // Silently fail remote logging to avoid infinite loops
      console.warn('Failed to send log to remote endpoint:', error);
    }
  }

  /**
   * Get recent log entries
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Update logger configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Create child logger with different category
   */
  child(category: string): Logger {
    return new Logger(`${this.category}:${category}`, this.config);
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  /**
   * Get log level name
   */
  static getLevelName(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'DEBUG';
      case LogLevel.INFO:
        return 'INFO';
      case LogLevel.WARN:
        return 'WARN';
      case LogLevel.ERROR:
        return 'ERROR';
      default:
        return 'UNKNOWN';
    }
  }
} 