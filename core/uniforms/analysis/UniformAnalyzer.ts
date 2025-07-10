import { Logger, LogCategory } from '../../debug/DebugLogger';
/**
 * G3D Uniform Systems Analyzer
 * 
 * This class analyzes and cross-references uniforms across all three G3D uniform systems:
 * 1. UniformDefinition TypeScript system
 * 2. Shader GLSL uniform declarations  
 * 3. Material uniform properties
 * 
 * Provides comprehensive analysis including deduplication, conflict detection,
 * and integration recommendations.
 */

// Browser-compatible file operations
const isBrowser = typeof window !== 'undefined';
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

// Conditional imports for Node.js vs Browser
let fs: any;

if (isNode && !isBrowser) {
  // Only import Node.js modules in Node.js environment
  try {
    fs = require('fs/promises');
  } catch (e) {
    // Fallback if modules not available
    fs = null;
  }
}
// UniformDefinition, ShaderUniform, MaterialUniform, categorizeUniform, deduplicateUniforms, findTypeConflicts 
// } from '../../../scripts/utils/uniform-parsers'; // Moved to avoid build issues
import {
  AnalysisResult,
  UniformInfo,
  SystemBreakdown,
  UniformDuplicate,
  UniformTypeConflict,
  UniformOrphan,
  CategoryAnalysis,
  PerformanceMetrics,
  UniformReport,
  ReportSection,
  UniformDefinition,
  ShaderUniform,
  MaterialUniform
} from './types';

// Inline categorizeUniform function to avoid build dependencies
function categorizeUniform(name: string): string {
  const lowerName = name.toLowerCase();

  // Matrix categories
  if (lowerName.includes('matrix') || lowerName.includes('mat')) {
    return 'matrices';
  }

  // Lighting categories
  if (lowerName.includes('light') || lowerName.includes('shadow') || lowerName.includes('ambient')) {
    return 'lighting';
  }

  // Camera/view categories
  if (lowerName.includes('camera') || lowerName.includes('view') || lowerName.includes('projection')) {
    return 'camera';
  }

  // Material categories
  if (lowerName.includes('color') || lowerName.includes('diffuse') || lowerName.includes('specular') ||
    lowerName.includes('roughness') || lowerName.includes('metallic') || lowerName.includes('material')) {
    return 'material';
  }

  // Texture categories
  if (lowerName.includes('texture') || lowerName.includes('map') || lowerName.includes('sampler')) {
    return 'textures';
  }

  // Time/animation categories
  if (lowerName.includes('time') || lowerName.includes('delta') || lowerName.includes('frame')) {
    return 'animation';
  }

  return 'other';
}

export class UniformAnalyzer {
  private uniformMap = new Map<string, UniformInfo>();
  private performance: PerformanceMetrics;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    this.performance = {
      parseTime: {
        definitions: 0,
        shaders: 0,
        materials: 0,
        total: 0
      },
      memoryUsage: {
        peak: 0,
        average: 0,
        final: 0
      },
      filesProcessed: {
        definitions: 0,
        shaders: 0,
        materials: 0,
        total: 0
      },
      uniformsProcessed: {
        definitions: 0,
        shaders: 0,
        materials: 0,
        unique: 0,
        duplicates: 0
      }
    };
  }

  /**
   * Main analysis method that processes all three uniform systems
   */
  analyze(
    definitions: UniformDefinition[],
    shaderUniforms: ShaderUniform[],
    materialUniforms: MaterialUniform[]
  ): AnalysisResult {
    Logger.info('🔍 Starting uniform analysis...', LogCategory.General);
    const analysisStartTime = Date.now();

    // Build complete map of all uniforms
    this.processDefinitions(definitions);
    this.processShaderUniforms(shaderUniforms);
    this.processMaterialUniforms(materialUniforms);

    // Calculate statistics
    const result: AnalysisResult = {
      totalUniqueUniforms: this.uniformMap.size,
      bySystem: this.getSystemBreakdown(),
      duplicates: this.findDuplicates(),
      typeConflicts: this.findTypeConflicts(),
      orphans: this.findOrphans(),
      categories: this.analyzeCategoriesComprehensive(),
      uniformMap: this.uniformMap,
      timestamp: new Date(),
      performance: this.calculatePerformanceMetrics(analysisStartTime)
    };

    Logger.info(`✅ Analysis complete in ${Date.now() - analysisStartTime}ms`, LogCategory.General);
    return result;
  }

  /**
   * Process UniformDefinition files
   */
  private processDefinitions(definitions: UniformDefinition[]): void {
    const startTime = Date.now();
    this.performance.uniformsProcessed.definitions = definitions.length;

    for (const def of definitions) {
      if (!this.uniformMap.has(def.name)) {
        this.uniformMap.set(def.name, {
          name: def.name,
          types: new Set(),
          categories: new Set(),
          sources: {
            definitions: [],
            shaders: [],
            materials: []
          },
          inDefinitions: false,
          inShaders: false,
          inMaterials: false,
          conflictCount: 0,
          defaultValue: def.defaultValue,
          description: def.description
        });
      }

      const info = this.uniformMap.get(def.name)!;
      info.types.add(def.type);
      info.categories.add(def.category || categorizeUniform(def.name));
      info.sources.definitions.push(def);
      info.inDefinitions = true;
      info.description = info.description || def.description;
    }

    this.performance.parseTime.definitions = Date.now() - startTime;
  }

  /**
   * Process shader uniform declarations
   */
  private processShaderUniforms(shaderUniforms: ShaderUniform[]): void {
    const startTime = Date.now();
    this.performance.uniformsProcessed.shaders = shaderUniforms.length;

    for (const shader of shaderUniforms) {
      if (!this.uniformMap.has(shader.name)) {
        this.uniformMap.set(shader.name, {
          name: shader.name,
          types: new Set(),
          categories: new Set(),
          sources: {
            definitions: [],
            shaders: [],
            materials: []
          },
          inDefinitions: false,
          inShaders: false,
          inMaterials: false,
          conflictCount: 0
        });
      }

      const info = this.uniformMap.get(shader.name)!;
      info.types.add(shader.type);
      info.categories.add(shader.category || categorizeUniform(shader.name));
      info.sources.shaders.push(shader);
      info.inShaders = true;
    }

    this.performance.parseTime.shaders = Date.now() - startTime;
  }

  /**
   * Process material uniform properties
   */
  private processMaterialUniforms(materialUniforms: MaterialUniform[]): void {
    const startTime = Date.now();
    this.performance.uniformsProcessed.materials = materialUniforms.length;

    for (const material of materialUniforms) {
      if (!this.uniformMap.has(material.name)) {
        this.uniformMap.set(material.name, {
          name: material.name,
          types: new Set(),
          categories: new Set(),
          sources: {
            definitions: [],
            shaders: [],
            materials: []
          },
          inDefinitions: false,
          inShaders: false,
          inMaterials: false,
          conflictCount: 0
        });
      }

      const info = this.uniformMap.get(material.name)!;
      info.types.add(material.type);
      info.categories.add(material.category || categorizeUniform(material.name));
      info.sources.materials.push(material);
      info.inMaterials = true;
    }

    this.performance.parseTime.materials = Date.now() - startTime;
  }

  /**
   * Calculate system breakdown statistics
   */
  private getSystemBreakdown(): SystemBreakdown {
    let inAllSystems = 0;
    let inTwoSystems = 0;
    let inOneSystemOnly = 0;
    let definitionsOnly = 0;
    let shadersOnly = 0;
    let materialsOnly = 0;
    let definitionsAndShaders = 0;
    let definitionsAndMaterials = 0;
    let shadersAndMaterials = 0;

    this.uniformMap.forEach((info, name) => {
      const systemCount =
        (info.inDefinitions ? 1 : 0) +
        (info.inShaders ? 1 : 0) +
        (info.inMaterials ? 1 : 0);

      if (systemCount === 3) {
        inAllSystems++;
      } else if (systemCount === 2) {
        inTwoSystems++;
        if (info.inDefinitions && info.inShaders) definitionsAndShaders++;
        if (info.inDefinitions && info.inMaterials) definitionsAndMaterials++;
        if (info.inShaders && info.inMaterials) shadersAndMaterials++;
      } else if (systemCount === 1) {
        inOneSystemOnly++;
        if (info.inDefinitions) definitionsOnly++;
        if (info.inShaders) shadersOnly++;
        if (info.inMaterials) materialsOnly++;
      }
    });

    return {
      definitions: this.performance.uniformsProcessed.definitions,
      shaders: this.performance.uniformsProcessed.shaders,
      materials: this.performance.uniformsProcessed.materials,
      inAllSystems,
      inTwoSystems,
      inOneSystemOnly,
      definitionsOnly,
      shadersOnly,
      materialsOnly,
      definitionsAndShaders,
      definitionsAndMaterials,
      shadersAndMaterials
    };
  }

  /**
   * Find duplicate uniforms across systems
   */
  private findDuplicates(): UniformDuplicate[] {
    const duplicates: UniformDuplicate[] = [];

    this.uniformMap.forEach((info, name) => {
      const totalInstances =
        info.sources.definitions.length +
        info.sources.shaders.length +
        info.sources.materials.length;

      if (totalInstances > 1) {
        const systems: string[] = [];
        const instances: any[] = [];

        if (info.inDefinitions) {
          systems.push('definitions');
          instances.push(...info.sources.definitions);
        }
        if (info.inShaders) {
          systems.push('shaders');
          instances.push(...info.sources.shaders);
        }
        if (info.inMaterials) {
          systems.push('materials');
          instances.push(...info.sources.materials);
        }

        duplicates.push({
          name,
          count: totalInstances,
          systems,
          instances
        });
      }
    });

    return duplicates.sort((a, b) => b.count - a.count);
  }

  /**
   * Find type conflicts across systems
   */
  private findTypeConflicts(): UniformTypeConflict[] {
    const conflicts: UniformTypeConflict[] = [];

    this.uniformMap.forEach((info, name) => {
      if (info.types.size > 1) {
        const types = Array.from(info.types);
        const conflictingSources: UniformTypeConflict['conflictingSources'] = [];

        // Group by type and system
        const typeMap = new Map<string, { system: string; files: string[]; count: number }[]>();

        for (const type of types) {
          typeMap.set(type, []);

          // Check definitions
          const defSources = info.sources.definitions.filter((d: any) => d.type === type);
          if (defSources.length > 0) {
            const entry = typeMap.get(type);
            if (entry) {
              entry.push({
                system: 'definitions',
                files: defSources.map((d: any) => d.file || '').filter((f: string) => f),
                count: defSources.length
              });
            }
          }

          // Check shaders
          const shaderSources = info.sources.shaders.filter((s: any) => s.type === type);
          if (shaderSources.length > 0) {
            const entry = typeMap.get(type);
            if (entry) {
              entry.push({
                system: 'shaders',
                files: shaderSources.map((s: any) => s.file || '').filter((f: string) => f),
                count: shaderSources.length
              });
            }
          }

          // Check materials
          const materialSources = info.sources.materials.filter((m: any) => m.type === type);
          if (materialSources.length > 0) {
            const entry = typeMap.get(type);
            if (entry) {
              entry.push({
                system: 'materials',
                files: materialSources.map((m: any) => m.file || '').filter((f: string) => f),
                count: materialSources.length
              });
            }
          }
        }

        // Flatten conflicting sources
        typeMap.forEach((sources, type) => {
          for (const source of sources) {
            conflictingSources.push({
              type,
              system: source.system as any,
              files: source.files,
              count: source.count
            });
          }
        });

        conflicts.push({
          name,
          types,
          conflictingSources
        });

        // Update conflict count
        info.conflictCount = types.length - 1;
      }
    });

    return conflicts.sort((a, b) => b.types.length - a.types.length);
  }

  /**
   * Find orphaned uniforms (exist in only one system)
   */
  private findOrphans(): UniformOrphan[] {
    const orphans: UniformOrphan[] = [];

    this.uniformMap.forEach((info, name) => {
      const systemCount =
        (info.inDefinitions ? 1 : 0) +
        (info.inShaders ? 1 : 0) +
        (info.inMaterials ? 1 : 0);

      if (systemCount === 1) {
        let system: 'definitions' | 'shaders' | 'materials';
        let files: string[];
        let type: string;
        let suggestedAction: UniformOrphan['suggestedAction'];
        let priority: UniformOrphan['priority'];

        if (info.inDefinitions) {
          system = 'definitions';
          files = info.sources.definitions.map(d => d.file || '').filter(f => f);
          type = info.sources.definitions[0].type;
          suggestedAction = 'add_to_shader';
          priority = 'medium';
        } else if (info.inShaders) {
          system = 'shaders';
          files = info.sources.shaders.map(s => s.file || '').filter(f => f);
          type = info.sources.shaders[0].type;
          suggestedAction = 'create_definition';
          priority = 'high';
        } else {
          system = 'materials';
          files = info.sources.materials.map(m => m.file || '').filter(f => f);
          type = info.sources.materials[0].type;
          suggestedAction = 'create_definition';
          priority = 'medium';
        }

        orphans.push({
          name,
          system,
          type,
          category: Array.from(info.categories)[0],
          files,
          suggestedAction,
          priority
        });
      }
    });

    return orphans.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Comprehensive category analysis
   */
  private analyzeCategoriesComprehensive(): CategoryAnalysis[] {
    const categoryMap = new Map<string, {
      totalUniforms: number;
      bySystem: { definitions: number; shaders: number; materials: number };
      fullyIntegrated: number;
      partiallyIntegrated: number;
      orphaned: number;
      conflicts: number;
    }>();

    // Initialize categories
    this.uniformMap.forEach((info, name) => {
      Array.from(info.categories).forEach(category => {
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            totalUniforms: 0,
            bySystem: { definitions: 0, shaders: 0, materials: 0 },
            fullyIntegrated: 0,
            partiallyIntegrated: 0,
            orphaned: 0,
            conflicts: 0
          });
        }

        const catData = categoryMap.get(category)!;
        catData.totalUniforms++;

        if (info.inDefinitions) catData.bySystem.definitions++;
        if (info.inShaders) catData.bySystem.shaders++;
        if (info.inMaterials) catData.bySystem.materials++;

        const systemCount =
          (info.inDefinitions ? 1 : 0) +
          (info.inShaders ? 1 : 0) +
          (info.inMaterials ? 1 : 0);

        if (systemCount === 3) catData.fullyIntegrated++;
        else if (systemCount === 2) catData.partiallyIntegrated++;
        else catData.orphaned++;

        if (info.conflictCount > 0) catData.conflicts++;
      });
    });

    // Convert to analysis format
    return Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      totalUniforms: data.totalUniforms,
      bySystem: data.bySystem,
      coverage: {
        fullyIntegrated: data.fullyIntegrated,
        partiallyIntegrated: data.partiallyIntegrated,
        orphaned: data.orphaned
      },
      conflicts: data.conflicts,
      completeness: Math.round((data.fullyIntegrated / data.totalUniforms) * 100)
    })).sort((a, b) => b.totalUniforms - a.totalUniforms);
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(analysisStartTime: number): any {
    const totalTime = Date.now() - this.startTime;
    const analysisTime = Date.now() - analysisStartTime;

    return {
      parseTime: totalTime,
      analysisTime: analysisTime,
      totalTime: totalTime,
      filesProcessed: {
        definitions: this.performance.filesProcessed.definitions,
        shaders: this.performance.filesProcessed.shaders,
        materials: this.performance.filesProcessed.materials
      }
    };
  }

  /**
   * Generate comprehensive markdown report
   */
  async generateReport(analysis: AnalysisResult, outputPath: string): Promise<void> {
    const report = this.buildReport(analysis);
    const markdown = this.renderReportAsMarkdown(report);

    await fs.writeFile(outputPath, markdown);
    Logger.info(`📝 Report generated: ${outputPath}`, LogCategory.General);
  }

  /**
   * Generate machine-readable JSON output
   */
  async generateJSON(analysis: AnalysisResult, outputPath: string): Promise<void> {
    // Convert Map to object for JSON serialization
    const serializable = {
      ...analysis,
      uniformMap: Object.fromEntries(
        Array.from(analysis.uniformMap.entries()).map(([key, value]) => [
          key,
          {
            ...value,
            types: Array.from(value.types),
            categories: Array.from(value.categories)
          }
        ])
      )
    };

    await fs.writeFile(outputPath, JSON.stringify(serializable, null, 2));
    Logger.info(`💾 JSON data generated: ${outputPath}`, LogCategory.General);
  }

  /**
   * Build structured report
   */
  private buildReport(analysis: AnalysisResult): UniformReport {
    return {
      title: 'G3D Uniform Analysis Report',
      summary: this.buildSummarySection(analysis),
      systemBreakdown: this.buildSystemBreakdownSection(analysis),
      duplicates: this.buildDuplicatesSection(analysis),
      typeConflicts: this.buildTypeConflictsSection(analysis),
      orphans: this.buildOrphansSection(analysis),
      categories: this.buildCategoriesSection(analysis),
      recommendations: this.buildRecommendationsSection(analysis),
      sections: [],
      appendices: this.buildAppendices(analysis),
      metadata: {
        generatedAt: new Date(),
        totalSections: 6
      }
    };
  }

  private buildSummarySection(analysis: AnalysisResult): ReportSection {
    const completeness = Math.round((analysis.bySystem.inAllSystems / analysis.totalUniqueUniforms) * 100);

    return {
      title: 'Executive Summary',
      content: `
**Analysis Date:** ${analysis.timestamp.toISOString()}
**Total Unique Uniforms:** ${analysis.totalUniqueUniforms}
**System Integration Completeness:** ${completeness}%

**Key Findings:**
- ${analysis.bySystem.inAllSystems} uniforms (${Math.round((analysis.bySystem.inAllSystems / analysis.totalUniqueUniforms) * 100)}%) exist in all 3 systems
- ${analysis.duplicates.length} uniforms have multiple instances
- ${analysis.typeConflicts.length} uniforms have type conflicts
- ${analysis.orphans.length} uniforms exist in only one system

**Performance:**
- Analysis completed in ${analysis.performance.parseTime}ms
- Processed ${analysis.performance.filesProcessed.definitions + analysis.performance.filesProcessed.shaders + analysis.performance.filesProcessed.materials} files`
    };
  }

  private buildSystemBreakdownSection(analysis: AnalysisResult): ReportSection {
    return {
      title: 'System Breakdown',
      content: `
| System | Count | Percentage |
|--------|-------|------------|
| UniformDefinitions | ${analysis.bySystem.definitions} | ${Math.round((analysis.bySystem.definitions / (analysis.bySystem.definitions + analysis.bySystem.shaders + analysis.bySystem.materials)) * 100)}% |
| Shader Uniforms | ${analysis.bySystem.shaders} | ${Math.round((analysis.bySystem.shaders / (analysis.bySystem.definitions + analysis.bySystem.shaders + analysis.bySystem.materials)) * 100)}% |
| Material Uniforms | ${analysis.bySystem.materials} | ${Math.round((analysis.bySystem.materials / (analysis.bySystem.definitions + analysis.bySystem.shaders + analysis.bySystem.materials)) * 100)}% |

**Integration Status:**
- In all 3 systems: ${analysis.bySystem.inAllSystems}
- In 2 systems: ${analysis.bySystem.inTwoSystems}
- In 1 system only: ${analysis.bySystem.inOneSystemOnly}`
    };
  }

  private buildDuplicatesSection(analysis: AnalysisResult): ReportSection {
    const topDuplicates = analysis.duplicates.slice(0, 10);

    let content = `**Total Duplicates:** ${analysis.duplicates.length}\n\n`;

    if (topDuplicates.length > 0) {
      content += '**Top Duplicates:**\n\n';
      for (const dup of topDuplicates) {
        content += `- **${dup.name}**: ${dup.count} instances across [${dup.systems.join(', ')}]\n`;
      }
    }

    return {
      title: 'Duplicate Analysis',
      content
    };
  }

  private buildTypeConflictsSection(analysis: AnalysisResult): ReportSection {
    let content = `**Total Type Conflicts:** ${analysis.typeConflicts.length}\n\n`;

    if (analysis.typeConflicts.length > 0) {
      content += '**Type Conflicts:**\n\n';
      for (const conflict of analysis.typeConflicts.slice(0, 10)) {
        content += `- **${conflict.name}**: [${conflict.types.join(', ')}]\n`;
      }
    }

    return {
      title: 'Type Conflicts',
      content
    };
  }

  private buildOrphansSection(analysis: AnalysisResult): ReportSection {
    const orphansBySystem = {
      definitions: analysis.orphans.filter(o => o.system === 'definitions').length,
      shaders: analysis.orphans.filter(o => o.system === 'shaders').length,
      materials: analysis.orphans.filter(o => o.system === 'materials').length
    };

    return {
      title: 'Orphaned Uniforms',
      content: `
**Total Orphans:** ${analysis.orphans.length}

**By System:**
- Definitions only: ${orphansBySystem.definitions}
- Shaders only: ${orphansBySystem.shaders}
- Materials only: ${orphansBySystem.materials}

**High Priority Orphans:**
${analysis.orphans.filter(o => o.priority === 'high').slice(0, 5).map(o =>
        `- **${o.name}** (${o.system}): ${o.suggestedAction.replace(/_/g, ' ')}`
      ).join('\n')}`
    };
  }

  private buildCategoriesSection(analysis: AnalysisResult): ReportSection {
    const topCategories = analysis.categories.slice(0, 10);

    let content = '| Category | Total | Completeness | Conflicts |\n';
    content += '|----------|-------|--------------|----------|\n';

    for (const cat of topCategories) {
      content += `| ${cat.name} | ${cat.totalUniforms} | ${cat.completeness}% | ${cat.conflicts} |\n`;
    }

    return {
      title: 'Category Analysis',
      content
    };
  }

  private buildRecommendationsSection(analysis: AnalysisResult): ReportSection {
    const recommendations: string[] = [];

    if (analysis.orphans.length > 0) {
      recommendations.push(`Create UniformDefinitions for ${analysis.orphans.filter(o => o.system === 'shaders').length} shader-only uniforms`);
    }

    if (analysis.typeConflicts.length > 0) {
      recommendations.push(`Resolve ${analysis.typeConflicts.length} type conflicts to ensure system consistency`);
    }

    if (analysis.bySystem.inAllSystems < analysis.totalUniqueUniforms * 0.8) {
      recommendations.push('Improve system integration - less than 80% of uniforms are in all 3 systems');
    }

    return {
      title: 'Recommendations',
      content: recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')
    };
  }

  private buildAppendices(analysis: AnalysisResult): ReportSection[] {
    return [
      {
        title: 'Performance Metrics',
        content: `
**Parse Times:**
- Total: ${analysis.performance.parseTime}ms

**Files Processed:**
- Definitions: ${analysis.performance.filesProcessed.definitions}
- Shaders: ${analysis.performance.filesProcessed.shaders}
- Materials: ${analysis.performance.filesProcessed.materials}`
      }
    ];
  }

  private renderReportAsMarkdown(report: UniformReport): string {
    let markdown = `# G3D Uniform Systems Analysis Report\n\n`;

    markdown += `## ${report.summary.title}\n\n${report.summary.content}\n\n`;
    markdown += `## ${report.systemBreakdown.title}\n\n${report.systemBreakdown.content}\n\n`;
    markdown += `## ${report.duplicates.title}\n\n${report.duplicates.content}\n\n`;
    markdown += `## ${report.typeConflicts.title}\n\n${report.typeConflicts.content}\n\n`;
    markdown += `## ${report.orphans.title}\n\n${report.orphans.content}\n\n`;
    markdown += `## ${report.categories.title}\n\n${report.categories.content}\n\n`;
    markdown += `## ${report.recommendations.title}\n\n${report.recommendations.content}\n\n`;

    markdown += `## Appendices\n\n`;
    for (const appendix of report.appendices) {
      markdown += `### ${appendix.title}\n\n${appendix.content}\n\n`;
    }

    return markdown;
  }
}