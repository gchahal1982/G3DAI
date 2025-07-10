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

// Additional types that UniformAnalyzer.ts imports
export interface AnalysisResult {
  totalUniforms: number;
  activeUniforms: number;
  integratedUniforms: number;
  categories: UniformCategory[];
  entries: UniformEntry[];
}

export interface UniformInfo {
  name: string;
  type: string;
  category: string;
  active: boolean;
  integrated: boolean;
  declared: boolean;
}

export interface SystemBreakdown {
  totalUniforms: number;
  activeUniforms: number;
  integratedUniforms: number;
  categories: UniformCategory[];
}

export interface UniformDuplicate {
  name: string;
  locations: string[];
  type: string;
}

export interface UniformTypeConflict {
  name: string;
  types: string[];
  locations: string[];
}

export interface UniformOrphan {
  name: string;
  location: string;
  type: string;
}

export interface CategoryAnalysis {
  name: string;
  total: number;
  active: number;
  integrated: number;
  declared: number;
}

export interface PerformanceMetrics {
  totalUniforms: number;
  activeUniforms: number;
  integratedUniforms: number;
  analysisTime: number;
}

export interface UniformReport {
  summary: SystemBreakdown;
  categories: CategoryAnalysis[];
  duplicates: UniformDuplicate[];
  conflicts: UniformTypeConflict[];
  orphans: UniformOrphan[];
  performance: PerformanceMetrics;
}

export interface ReportSection {
  title: string;
  content: string;
  data: any;
}

export interface UniformDefinition {
  name: string;
  type: string;
  location: string;
  category: string;
}

export interface ShaderUniform {
  name: string;
  type: string;
  location: string;
  value: any;
}

export interface MaterialUniform {
  name: string;
  type: string;
  value: any;
  category: string;
} 