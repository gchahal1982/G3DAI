/**
 * Core Configuration Management
 * Simple configuration utilities
 */

interface ConfigValues {
  [key: string]: any;
}

export class Config {
  private static config: ConfigValues = {};

  static get(key: string, defaultValue?: any): any {
    return this.config[key] ?? defaultValue;
  }

  static set(key: string, value: any): void {
    this.config[key] = value;
  }

  static load(values: ConfigValues): void {
    this.config = { ...this.config, ...values };
  }

  static getAll(): ConfigValues {
    return { ...this.config };
  }
} 