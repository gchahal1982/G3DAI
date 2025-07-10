/**
 * React Development Mode Detector
 * Utility to detect React development environment
 */

export interface ReactDevEnvironment {
  isDevelopment: boolean;
  isProduction: boolean;
  hasDevTools: boolean;
  reactVersion?: string;
}

export class ReactDevModeDetector {
  static detect(): ReactDevEnvironment {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';
    const hasDevTools = typeof window !== 'undefined' && !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    
    return {
      isDevelopment,
      isProduction,
      hasDevTools,
      reactVersion: typeof window !== 'undefined' && (window as any).React ? (window as any).React.version : undefined
    };
  }
}

export const reactDevModeDetector = ReactDevModeDetector; 