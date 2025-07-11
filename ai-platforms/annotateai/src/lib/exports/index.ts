/**
 * Export System Library
 * Consolidated export utilities for all annotation formats
 */

// Export formats supported by the platform
export const SUPPORTED_FORMATS = [
  'coco', 'yolo', 'pascal-voc', 'tensorflow', 'pytorch', 
  'hugging-face', 'open-images', 'labelme', 'custom'
] as const;

export type ExportFormat = typeof SUPPORTED_FORMATS[number];

// Export configuration
export const EXPORT_LIMITS = {
  MAX_ANNOTATIONS: 100000,
  MAX_FILE_SIZE: 1024 * 1024 * 100, // 100MB
  TIMEOUT: 300000, // 5 minutes
} as const;

// Security settings for exports
export const SECURITY_SETTINGS = {
  ENCRYPTION_ENABLED: true,
  SIGNED_URLS: true,
  EXPIRES_IN: 3600 * 24 * 7, // 7 days
} as const;

// Export validation utility
export const validateExportFormat = (format: string): format is ExportFormat => {
  return SUPPORTED_FORMATS.includes(format as ExportFormat);
};

// Export ID generation
export const generateExportId = (): string => {
  return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Export utilities
export const exportUtils = {
  validateExportFormat,
  generateExportId,
  SUPPORTED_FORMATS,
  EXPORT_LIMITS,
  SECURITY_SETTINGS
} as const; 