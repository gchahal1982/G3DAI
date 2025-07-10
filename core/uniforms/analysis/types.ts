/**
 * G3D Uniform Analysis Types
 */

// Basic uniform definitions
export interface UniformDefinition {
  name: string;
  type: string;
  category?: string;
  defaultValue?: any;
  description?: string;
  file?: string;
}

export interface ShaderUniform {
  name: string;
  type: string;
  category?: string;
  file?: string;
}

export interface MaterialUniform {
  name: string;
  type: string;
  category?: string;
  file?: string;
}

// Analysis result types
export interface UniformInfo {
  name: string;
  types: Set<string>;
  categories: Set<string>;
  sources: {
    definitions: UniformDefinition[];
    shaders: ShaderUniform[];
    materials: MaterialUniform[];
  };
  inDefinitions: boolean;
  inShaders: boolean;
  inMaterials: boolean;
  conflictCount: number;
  defaultValue?: any;
  description?: string;
}

export interface SystemBreakdown {
  definitions: number;
  shaders: number;
  materials: number;
  inAllSystems: number;
  inTwoSystems: number;
  inOneSystemOnly: number;
  definitionsOnly: number;
  shadersOnly: number;
  materialsOnly: number;
  definitionsAndShaders: number;
  definitionsAndMaterials: number;
  shadersAndMaterials: number;
}

export interface UniformDuplicate {
  name: string;
  count: number;
  systems: string[];
  instances: any[];
}

export interface UniformTypeConflict {
  name: string;
  types: string[];
  conflictingSources: Array<{
    type: string;
    system: 'definitions' | 'shaders' | 'materials';
    files: string[];
    count: number;
  }>;
}

export interface UniformOrphan {
  name: string;
  system: 'definitions' | 'shaders' | 'materials';
  type: string;
  category: string;
  files: string[];
  suggestedAction: 'add_to_shader' | 'create_definition' | 'add_to_material';
  priority: 'high' | 'medium' | 'low';
}

export interface CategoryAnalysis {
  name: string;
  totalUniforms: number;
  bySystem: {
    definitions: number;
    shaders: number;
    materials: number;
  };
  coverage: {
    fullyIntegrated: number;
    partiallyIntegrated: number;
    orphaned: number;
  };
  conflicts: number;
  completeness: number;
}

export interface PerformanceMetrics {
  parseTime: {
    definitions: number;
    shaders: number;
    materials: number;
    total: number;
  };
  memoryUsage: {
    peak: number;
    average: number;
    final: number;
  };
  filesProcessed: {
    definitions: number;
    shaders: number;
    materials: number;
    total: number;
  };
  uniformsProcessed: {
    definitions: number;
    shaders: number;
    materials: number;
    unique: number;
    duplicates: number;
  };
}

export interface AnalysisResult {
  totalUniqueUniforms: number;
  bySystem: SystemBreakdown;
  duplicates: UniformDuplicate[];
  typeConflicts: UniformTypeConflict[];
  orphans: UniformOrphan[];
  categories: CategoryAnalysis[];
  uniformMap: Map<string, UniformInfo>;
  timestamp: Date;
  performance: any;
}

// Report types
export interface ReportSection {
  title: string;
  content: string;
  subsections?: ReportSection[];
}

export interface UniformReport {
  title: string;
  summary: ReportSection;
  systemBreakdown: ReportSection;
  duplicates: ReportSection;
  typeConflicts: ReportSection;
  orphans: ReportSection;
  categories: ReportSection;
  recommendations: ReportSection;
  sections: ReportSection[];
  appendices: ReportSection[];
  metadata: {
    generatedAt: Date;
    totalSections: number;
  };
} 