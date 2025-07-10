/**
 * Uniform Analysis Types
 * Type definitions for uniform system analysis
 */

export interface UniformEntry {
  name: string;
  type: string;
  category: string;
  active: boolean;
  integrated: boolean;
  declared: boolean;
}

export interface UniformCategory {
  name: string;
  total: number;
  active: number;
  integrated: number;
  declared: number;
}

export interface UniformAnalysisResult {
  totalUniforms: number;
  activeUniforms: number;
  integratedUniforms: number;
  categories: UniformCategory[];
  entries: UniformEntry[];
}

export interface UniformSystemStatus {
  progressPercentage: number;
  overallStatus: 'complete' | 'in-progress' | 'error';
} 