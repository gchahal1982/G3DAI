import { 
  SwarmAgent, 
  SwarmTask, 
  SwarmResult, 
  TaskType, 
  AgentCapability, 
  AgentMetrics, 
  AgentConfig 
} from '../orchestrator/SwarmOrchestrator';

// Planning-specific types
export interface ArchitecturePattern {
  name: string;
  description: string;
  components: string[];
  relationships: PatternRelationship[];
  constraints: PatternConstraint[];
  benefits: string[];
  tradeoffs: string[];
}

export interface PatternRelationship {
  from: string;
  to: string;
  type: 'depends_on' | 'communicates_with' | 'inherits_from' | 'implements';
  strength: number; // 0-1
}

export interface PatternConstraint {
  type: 'performance' | 'security' | 'scalability' | 'maintainability';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface TaskDecomposition {
  originalTask: string;
  subtasks: SubTask[];
  dependencies: TaskDependency[];
  criticalPath: string[];
  estimatedDuration: number;
  riskLevel: number;
}

export interface SubTask {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  estimatedHours: number;
  complexity: number; // 1-10
  priority: number; // 1-5
  prerequisites: string[];
  outputs: string[];
  assignedRole: AgentCapability;
}

export interface TaskDependency {
  from: string;
  to: string;
  type: 'blocks' | 'enables' | 'enhances' | 'requires';
  isOptional: boolean;
}

export interface RiskAssessment {
  overall: number; // 0-1
  categories: {
    technical: number;
    timeline: number;
    resources: number;
    complexity: number;
    dependencies: number;
  };
  risks: Risk[];
  mitigations: Mitigation[];
}

export interface Risk {
  id: string;
  description: string;
  probability: number; // 0-1
  impact: number; // 0-1
  category: string;
  triggers: string[];
}

export interface Mitigation {
  riskId: string;
  strategy: string;
  effort: number; // hours
  effectiveness: number; // 0-1
}

export interface ResourcePlan {
  agents: AgentRequirement[];
  timeline: TimelinePhase[];
  bottlenecks: Bottleneck[];
  optimizations: Optimization[];
}

export interface AgentRequirement {
  capability: AgentCapability;
  hoursRequired: number;
  concurrency: number;
  criticality: number;
}

export interface TimelinePhase {
  name: string;
  startDay: number;
  duration: number;
  tasks: string[];
  dependencies: string[];
  resources: AgentRequirement[];
}

export interface Bottleneck {
  resource: string;
  utilization: number;
  duration: number;
  impact: number;
  suggestions: string[];
}

export interface Optimization {
  type: 'parallelization' | 'resource_reallocation' | 'scope_reduction' | 'dependency_removal';
  description: string;
  impact: string;
  effort: number;
  timeReduction: number;
}

export interface PlanValidation {
  isValid: boolean;
  score: number; // 0-1
  violations: ValidationViolation[];
  warnings: ValidationWarning[];
  recommendations: string[];
}

export interface ValidationViolation {
  type: 'constraint' | 'dependency' | 'resource' | 'timeline';
  severity: 'error' | 'warning';
  description: string;
  affectedTasks: string[];
}

export interface ValidationWarning {
  type: 'efficiency' | 'risk' | 'quality';
  description: string;
  recommendation: string;
}

// Architecture Pattern Library
class ArchitecturePatternLibrary {
  private patterns: Map<string, ArchitecturePattern> = new Map();

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // Microservices Pattern
    this.patterns.set('microservices', {
      name: 'Microservices Architecture',
      description: 'Decompose application into small, independent services',
      components: ['API Gateway', 'Service Registry', 'Individual Services', 'Database per Service'],
      relationships: [
        { from: 'API Gateway', to: 'Individual Services', type: 'communicates_with', strength: 0.9 },
        { from: 'Individual Services', to: 'Service Registry', type: 'depends_on', strength: 0.7 }
      ],
      constraints: [
        { type: 'performance', description: 'Network latency between services', severity: 'medium' },
        { type: 'security', description: 'Inter-service authentication required', severity: 'high' }
      ],
      benefits: ['Scalability', 'Technology diversity', 'Team independence'],
      tradeoffs: ['Increased complexity', 'Network overhead', 'Data consistency challenges']
    });

    // Event-Driven Pattern
    this.patterns.set('event-driven', {
      name: 'Event-Driven Architecture',
      description: 'Components communicate through events and message queues',
      components: ['Event Bus', 'Event Producers', 'Event Consumers', 'Event Store'],
      relationships: [
        { from: 'Event Producers', to: 'Event Bus', type: 'communicates_with', strength: 0.8 },
        { from: 'Event Bus', to: 'Event Consumers', type: 'communicates_with', strength: 0.8 }
      ],
      constraints: [
        { type: 'performance', description: 'Event processing latency', severity: 'medium' },
        { type: 'scalability', description: 'Event bus throughput limits', severity: 'high' }
      ],
      benefits: ['Loose coupling', 'Scalability', 'Resilience'],
      tradeoffs: ['Eventual consistency', 'Complex debugging', 'Event ordering challenges']
    });

    // Add more patterns as needed
  }

  getPattern(name: string): ArchitecturePattern | null {
    return this.patterns.get(name) || null;
  }

  suggestPatterns(requirements: string[]): ArchitecturePattern[] {
    const suggestions: ArchitecturePattern[] = [];
    
    for (const pattern of this.patterns.values()) {
      const relevance = this.calculatePatternRelevance(pattern, requirements);
      if (relevance > 0.5) {
        suggestions.push(pattern);
      }
    }

    return suggestions.sort((a, b) => 
      this.calculatePatternRelevance(b, requirements) - 
      this.calculatePatternRelevance(a, requirements)
    );
  }

  private calculatePatternRelevance(pattern: ArchitecturePattern, requirements: string[]): number {
    let relevance = 0;
    const keywords = requirements.join(' ').toLowerCase();

    for (const benefit of pattern.benefits) {
      if (keywords.includes(benefit.toLowerCase())) {
        relevance += 0.3;
      }
    }

    // Check for specific architectural keywords
    if (keywords.includes('microservice') && pattern.name.includes('Microservices')) {
      relevance += 0.5;
    }
    if (keywords.includes('event') && pattern.name.includes('Event-Driven')) {
      relevance += 0.5;
    }

    return Math.min(1, relevance);
  }
}

// Task Decomposition Engine
class TaskDecompositionEngine {
  async decomposeTask(
    task: string, 
    context: any, 
    constraints: any
  ): Promise<TaskDecomposition> {
    const subtasks = await this.generateSubtasks(task, context);
    const dependencies = this.analyzeDependencies(subtasks);
    const criticalPath = this.calculateCriticalPath(subtasks, dependencies);
    const estimatedDuration = this.estimateDuration(subtasks, dependencies);
    const riskLevel = this.assessRiskLevel(subtasks, dependencies);

    return {
      originalTask: task,
      subtasks,
      dependencies,
      criticalPath,
      estimatedDuration,
      riskLevel
    };
  }

  private async generateSubtasks(task: string, context: any): Promise<SubTask[]> {
    // Simulate intelligent task breakdown
    const taskLower = task.toLowerCase();
    const subtasks: SubTask[] = [];

    // Pattern-based task generation
    if (taskLower.includes('implement') || taskLower.includes('build')) {
      subtasks.push({
        id: 'plan_1',
        title: 'Architecture Planning',
        description: 'Design system architecture and component interactions',
        type: TaskType.PLAN,
        estimatedHours: 8,
        complexity: 7,
        priority: 5,
        prerequisites: [],
        outputs: ['Architecture Document', 'Component Diagram'],
        assignedRole: AgentCapability.PLANNING
      });

      subtasks.push({
        id: 'code_1',
        title: 'Core Implementation',
        description: 'Implement main functionality and business logic',
        type: TaskType.CODE,
        estimatedHours: 24,
        complexity: 8,
        priority: 4,
        prerequisites: ['plan_1'],
        outputs: ['Core Modules', 'API Endpoints'],
        assignedRole: AgentCapability.CODING
      });

      subtasks.push({
        id: 'test_1',
        title: 'Test Suite Development',
        description: 'Create comprehensive test coverage',
        type: TaskType.TEST,
        estimatedHours: 16,
        complexity: 6,
        priority: 3,
        prerequisites: ['code_1'],
        outputs: ['Unit Tests', 'Integration Tests'],
        assignedRole: AgentCapability.TESTING
      });

      subtasks.push({
        id: 'security_1',
        title: 'Security Review',
        description: 'Conduct security analysis and implement safeguards',
        type: TaskType.SECURITY,
        estimatedHours: 8,
        complexity: 7,
        priority: 4,
        prerequisites: ['code_1'],
        outputs: ['Security Report', 'Security Fixes'],
        assignedRole: AgentCapability.SECURITY
      });

      subtasks.push({
        id: 'doc_1',
        title: 'Documentation',
        description: 'Create user and developer documentation',
        type: TaskType.DOCUMENT,
        estimatedHours: 12,
        complexity: 4,
        priority: 2,
        prerequisites: ['code_1', 'test_1'],
        outputs: ['API Documentation', 'User Guide'],
        assignedRole: AgentCapability.DOCUMENTATION
      });
    }

    return subtasks;
  }

  private analyzeDependencies(subtasks: SubTask[]): TaskDependency[] {
    const dependencies: TaskDependency[] = [];

    for (const task of subtasks) {
      for (const prereq of task.prerequisites) {
        dependencies.push({
          from: prereq,
          to: task.id,
          type: 'blocks',
          isOptional: false
        });
      }
    }

    return dependencies;
  }

  private calculateCriticalPath(subtasks: SubTask[], dependencies: TaskDependency[]): string[] {
    // Simplified critical path calculation
    const taskMap = new Map(subtasks.map(t => [t.id, t]));
    const dependencyMap = new Map<string, string[]>();

    // Build dependency graph
    for (const dep of dependencies) {
      if (!dependencyMap.has(dep.to)) {
        dependencyMap.set(dep.to, []);
      }
      dependencyMap.get(dep.to)!.push(dep.from);
    }

    // Find longest path (simplified)
    const visited = new Set<string>();
    let longestPath: string[] = [];

    const dfs = (taskId: string, currentPath: string[]): void => {
      if (visited.has(taskId)) return;
      visited.add(taskId);

      const newPath = [...currentPath, taskId];
      if (newPath.length > longestPath.length) {
        longestPath = [...newPath];
      }

      const dependents = dependencies
        .filter(d => d.from === taskId)
        .map(d => d.to);

      for (const dependent of dependents) {
        dfs(dependent, newPath);
      }
    };

    // Find root tasks (no dependencies)
    const rootTasks = subtasks.filter(t => t.prerequisites.length === 0);
    for (const root of rootTasks) {
      dfs(root.id, []);
    }

    return longestPath;
  }

  private estimateDuration(subtasks: SubTask[], dependencies: TaskDependency[]): number {
    // Calculate parallel execution time considering dependencies
    const taskDurations = new Map(subtasks.map(t => [t.id, t.estimatedHours]));
    const dependencyMap = new Map<string, string[]>();

    for (const dep of dependencies) {
      if (!dependencyMap.has(dep.to)) {
        dependencyMap.set(dep.to, []);
      }
      dependencyMap.get(dep.to)!.push(dep.from);
    }

    // Simplified scheduling algorithm
    const completed = new Set<string>();
    let totalTime = 0;
    const timeSlots: string[][] = [];

    while (completed.size < subtasks.length) {
      const readyTasks = subtasks.filter(task => 
        !completed.has(task.id) &&
        task.prerequisites.every(prereq => completed.has(prereq))
      );

      if (readyTasks.length === 0) break;

      const currentSlot = readyTasks.map(t => t.id);
      timeSlots.push(currentSlot);

      const maxDuration = Math.max(...readyTasks.map(t => t.estimatedHours));
      totalTime += maxDuration;

      readyTasks.forEach(t => completed.add(t.id));
    }

    return totalTime;
  }

  private assessRiskLevel(subtasks: SubTask[], dependencies: TaskDependency[]): number {
    let totalRisk = 0;

    for (const task of subtasks) {
      // Risk factors: complexity, dependencies, new technology
      const complexityRisk = task.complexity / 10;
      const dependencyRisk = task.prerequisites.length * 0.1;
      const taskRisk = (complexityRisk + dependencyRisk) / 2;
      
      totalRisk += taskRisk;
    }

    return Math.min(1, totalRisk / subtasks.length);
  }
}

// Risk Assessment Engine
class RiskAssessmentEngine {
  assessRisk(
    decomposition: TaskDecomposition,
    context: any,
    constraints: any
  ): RiskAssessment {
    const risks = this.identifyRisks(decomposition, context);
    const mitigations = this.suggestMitigations(risks);
    const categories = this.categorizeRisks(risks);
    const overall = this.calculateOverallRisk(categories);

    return {
      overall,
      categories,
      risks,
      mitigations
    };
  }

  private identifyRisks(decomposition: TaskDecomposition, context: any): Risk[] {
    const risks: Risk[] = [];

    // Complexity risks
    const highComplexityTasks = decomposition.subtasks.filter(t => t.complexity >= 8);
    if (highComplexityTasks.length > 0) {
      risks.push({
        id: 'complexity_risk_1',
        description: `${highComplexityTasks.length} high-complexity tasks may face implementation challenges`,
        probability: Math.min(0.8, highComplexityTasks.length * 0.2),
        impact: 0.7,
        category: 'technical',
        triggers: ['Technical challenges', 'Unclear requirements', 'New technology']
      });
    }

    // Dependency risks
    const complexDependencies = decomposition.dependencies.filter(d => !d.isOptional);
    if (complexDependencies.length > decomposition.subtasks.length) {
      risks.push({
        id: 'dependency_risk_1',
        description: 'High number of dependencies may cause cascading delays',
        probability: 0.6,
        impact: 0.8,
        category: 'timeline',
        triggers: ['Task delays', 'Resource conflicts', 'Scope changes']
      });
    }

    // Timeline risks
    if (decomposition.riskLevel > 0.7) {
      risks.push({
        id: 'timeline_risk_1',
        description: 'Aggressive timeline with high-risk tasks',
        probability: 0.7,
        impact: 0.6,
        category: 'timeline',
        triggers: ['Underestimation', 'External dependencies', 'Resource unavailability']
      });
    }

    return risks;
  }

  private suggestMitigations(risks: Risk[]): Mitigation[] {
    const mitigations: Mitigation[] = [];

    for (const risk of risks) {
      if (risk.category === 'technical') {
        mitigations.push({
          riskId: risk.id,
          strategy: 'Add technical spike tasks for research and prototyping',
          effort: 16,
          effectiveness: 0.7
        });
      }

      if (risk.category === 'timeline') {
        mitigations.push({
          riskId: risk.id,
          strategy: 'Build buffer time and parallel execution opportunities',
          effort: 8,
          effectiveness: 0.6
        });
      }

      if (risk.category === 'dependencies') {
        mitigations.push({
          riskId: risk.id,
          strategy: 'Create mock implementations and decouple dependencies',
          effort: 20,
          effectiveness: 0.8
        });
      }
    }

    return mitigations;
  }

  private categorizeRisks(risks: Risk[]): RiskAssessment['categories'] {
    const categories = {
      technical: 0,
      timeline: 0,
      resources: 0,
      complexity: 0,
      dependencies: 0
    };

    for (const risk of risks) {
      const riskScore = risk.probability * risk.impact;
      
      switch (risk.category) {
        case 'technical':
          categories.technical = Math.max(categories.technical, riskScore);
          break;
        case 'timeline':
          categories.timeline = Math.max(categories.timeline, riskScore);
          break;
        case 'resources':
          categories.resources = Math.max(categories.resources, riskScore);
          break;
        case 'complexity':
          categories.complexity = Math.max(categories.complexity, riskScore);
          break;
        case 'dependencies':
          categories.dependencies = Math.max(categories.dependencies, riskScore);
          break;
      }
    }

    return categories;
  }

  private calculateOverallRisk(categories: RiskAssessment['categories']): number {
    const weights = {
      technical: 0.25,
      timeline: 0.25,
      resources: 0.2,
      complexity: 0.15,
      dependencies: 0.15
    };

    return (
      categories.technical * weights.technical +
      categories.timeline * weights.timeline +
      categories.resources * weights.resources +
      categories.complexity * weights.complexity +
      categories.dependencies * weights.dependencies
    );
  }
}

// Resource Planning Engine
class ResourcePlanningEngine {
  planResources(
    decomposition: TaskDecomposition,
    riskAssessment: RiskAssessment,
    constraints: any
  ): ResourcePlan {
    const agents = this.calculateAgentRequirements(decomposition);
    const timeline = this.createTimeline(decomposition, agents);
    const bottlenecks = this.identifyBottlenecks(timeline, agents);
    const optimizations = this.suggestOptimizations(timeline, bottlenecks);

    return {
      agents,
      timeline,
      bottlenecks,
      optimizations
    };
  }

  private calculateAgentRequirements(decomposition: TaskDecomposition): AgentRequirement[] {
    const requirements = new Map<AgentCapability, AgentRequirement>();

    for (const task of decomposition.subtasks) {
      const existing = requirements.get(task.assignedRole) || {
        capability: task.assignedRole,
        hoursRequired: 0,
        concurrency: 1,
        criticality: 0
      };

      existing.hoursRequired += task.estimatedHours;
      existing.criticality = Math.max(existing.criticality, task.priority / 5);

      requirements.set(task.assignedRole, existing);
    }

    return Array.from(requirements.values());
  }

  private createTimeline(
    decomposition: TaskDecomposition,
    agents: AgentRequirement[]
  ): TimelinePhase[] {
    const phases: TimelinePhase[] = [];
    const taskLevels = this.calculateTaskLevels(decomposition);

    let currentDay = 0;
    for (let level = 0; level < taskLevels.length; level++) {
      const levelTasks = taskLevels[level];
      const maxDuration = Math.max(...levelTasks.map(t => Math.ceil(t.estimatedHours / 8)));

      phases.push({
        name: `Phase ${level + 1}`,
        startDay: currentDay,
        duration: maxDuration,
        tasks: levelTasks.map(t => t.id),
        dependencies: level > 0 ? [`Phase ${level}`] : [],
        resources: this.getPhaseResources(levelTasks, agents)
      });

      currentDay += maxDuration;
    }

    return phases;
  }

  private calculateTaskLevels(decomposition: TaskDecomposition): SubTask[][] {
    const levels: SubTask[][] = [];
    const taskMap = new Map(decomposition.subtasks.map(t => [t.id, t]));
    const completed = new Set<string>();

    while (completed.size < decomposition.subtasks.length) {
      const currentLevel = decomposition.subtasks.filter(task =>
        !completed.has(task.id) &&
        task.prerequisites.every(prereq => completed.has(prereq))
      );

      if (currentLevel.length === 0) break;

      levels.push(currentLevel);
      currentLevel.forEach(t => completed.add(t.id));
    }

    return levels;
  }

  private getPhaseResources(tasks: SubTask[], agents: AgentRequirement[]): AgentRequirement[] {
    const phaseResources = new Map<AgentCapability, AgentRequirement>();

    for (const task of tasks) {
      const existing = phaseResources.get(task.assignedRole) || {
        capability: task.assignedRole,
        hoursRequired: 0,
        concurrency: 1,
        criticality: 0
      };

      existing.hoursRequired += task.estimatedHours;
      existing.criticality = Math.max(existing.criticality, task.priority / 5);

      phaseResources.set(task.assignedRole, existing);
    }

    return Array.from(phaseResources.values());
  }

  private identifyBottlenecks(timeline: TimelinePhase[], agents: AgentRequirement[]): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];
    const resourceUtilization = new Map<AgentCapability, number>();

    // Calculate utilization for each agent type
    for (const agent of agents) {
      let totalHours = 0;
      for (const phase of timeline) {
        const phaseResource = phase.resources.find(r => r.capability === agent.capability);
        if (phaseResource) {
          totalHours += phaseResource.hoursRequired;
        }
      }

      const workingDays = timeline.reduce((sum, phase) => sum + phase.duration, 0);
      const availableHours = workingDays * 8; // 8 hours per day
      const utilization = totalHours / availableHours;

      resourceUtilization.set(agent.capability, utilization);

      if (utilization > 0.9) {
        bottlenecks.push({
          resource: agent.capability,
          utilization,
          duration: workingDays,
          impact: utilization > 1 ? 0.8 : 0.5,
          suggestions: [
            'Add additional agent with this capability',
            'Parallelize tasks where possible',
            'Consider extending timeline'
          ]
        });
      }
    }

    return bottlenecks;
  }

  private suggestOptimizations(timeline: TimelinePhase[], bottlenecks: Bottleneck[]): Optimization[] {
    const optimizations: Optimization[] = [];

    // Parallelization opportunities
    for (const phase of timeline) {
      if (phase.tasks.length > 1) {
        optimizations.push({
          type: 'parallelization',
          description: `${phase.name} has ${phase.tasks.length} tasks that can run in parallel`,
          impact: 'Reduce phase duration by up to 50%',
          effort: 2,
          timeReduction: phase.duration * 0.3
        });
      }
    }

    // Resource reallocation for bottlenecks
    for (const bottleneck of bottlenecks) {
      if (bottleneck.utilization > 1) {
        optimizations.push({
          type: 'resource_reallocation',
          description: `${bottleneck.resource} is overallocated at ${Math.round(bottleneck.utilization * 100)}%`,
          impact: 'Reduce delivery risk and timeline pressure',
          effort: 4,
          timeReduction: bottleneck.duration * 0.2
        });
      }
    }

    return optimizations;
  }
}

// Plan Validation Engine
class PlanValidationEngine {
  validatePlan(
    decomposition: TaskDecomposition,
    resourcePlan: ResourcePlan,
    constraints: any
  ): PlanValidation {
    const violations: ValidationViolation[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: string[] = [];

    // Validate dependencies
    this.validateDependencies(decomposition, violations);

    // Validate resource allocation
    this.validateResources(resourcePlan, violations, warnings);

    // Validate timeline
    this.validateTimeline(resourcePlan, constraints, violations, warnings);

    // Generate recommendations
    this.generateRecommendations(violations, warnings, recommendations);

    const isValid = violations.filter(v => v.severity === 'error').length === 0;
    const score = this.calculateValidationScore(violations, warnings);

    return {
      isValid,
      score,
      violations,
      warnings,
      recommendations
    };
  }

  private validateDependencies(decomposition: TaskDecomposition, violations: ValidationViolation[]): void {
    // Check for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (taskId: string): boolean => {
      visited.add(taskId);
      recursionStack.add(taskId);

      const dependencies = decomposition.dependencies
        .filter(d => d.from === taskId)
        .map(d => d.to);

      for (const dep of dependencies) {
        if (!visited.has(dep) && hasCycle(dep)) {
          return true;
        } else if (recursionStack.has(dep)) {
          return true;
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    for (const task of decomposition.subtasks) {
      if (!visited.has(task.id) && hasCycle(task.id)) {
        violations.push({
          type: 'dependency',
          severity: 'error',
          description: `Circular dependency detected involving task: ${task.id}`,
          affectedTasks: [task.id]
        });
      }
    }
  }

  private validateResources(
    resourcePlan: ResourcePlan,
    violations: ValidationViolation[],
    warnings: ValidationWarning[]
  ): void {
    for (const bottleneck of resourcePlan.bottlenecks) {
      if (bottleneck.utilization > 1) {
        violations.push({
          type: 'resource',
          severity: 'error',
          description: `${bottleneck.resource} is overallocated at ${Math.round(bottleneck.utilization * 100)}%`,
          affectedTasks: []
        });
      } else if (bottleneck.utilization > 0.9) {
        warnings.push({
          type: 'efficiency',
          description: `${bottleneck.resource} utilization is very high (${Math.round(bottleneck.utilization * 100)}%)`,
          recommendation: 'Consider adding buffer time or additional resources'
        });
      }
    }
  }

  private validateTimeline(
    resourcePlan: ResourcePlan,
    constraints: any,
    violations: ValidationViolation[],
    warnings: ValidationWarning[]
  ): void {
    const totalDuration = resourcePlan.timeline.reduce((sum, phase) => sum + phase.duration, 0);

    if (constraints.maxDuration && totalDuration > constraints.maxDuration) {
      violations.push({
        type: 'timeline',
        severity: 'error',
        description: `Planned duration (${totalDuration} days) exceeds constraint (${constraints.maxDuration} days)`,
        affectedTasks: []
      });
    }

    if (constraints.targetDuration && totalDuration > constraints.targetDuration * 1.2) {
      warnings.push({
        type: 'efficiency',
        description: `Timeline is 20% longer than target (${totalDuration} vs ${constraints.targetDuration} days)`,
        recommendation: 'Look for optimization opportunities or scope reduction'
      });
    }
  }

  private generateRecommendations(
    violations: ValidationViolation[],
    warnings: ValidationWarning[],
    recommendations: string[]
  ): void {
    if (violations.length > 0) {
      recommendations.push('Address all validation errors before proceeding with implementation');
    }

    if (warnings.some(w => w.type === 'efficiency')) {
      recommendations.push('Consider resource optimization to improve timeline efficiency');
    }

    recommendations.push('Review critical path tasks for potential parallelization opportunities');
    recommendations.push('Implement regular checkpoint reviews to validate progress against plan');
  }

  private calculateValidationScore(violations: ValidationViolation[], warnings: ValidationWarning[]): number {
    let score = 1.0;

    // Penalize errors more heavily than warnings
    score -= violations.filter(v => v.severity === 'error').length * 0.2;
    score -= violations.filter(v => v.severity === 'warning').length * 0.1;
    score -= warnings.length * 0.05;

    return Math.max(0, score);
  }
}

// Main PlannerAgent Implementation
export class PlannerAgent implements SwarmAgent {
  id: string;
  name: string;
  capabilities: AgentCapability[];
  specializations: string[];
  
  private patternLibrary: ArchitecturePatternLibrary;
  private decompositionEngine: TaskDecompositionEngine;
  private riskEngine: RiskAssessmentEngine;
  private resourceEngine: ResourcePlanningEngine;
  private validationEngine: PlanValidationEngine;
  private config: AgentConfig;
  private metrics: AgentMetrics;
  private isActive: boolean = false;

  constructor(id: string = 'planner-agent-1') {
    this.id = id;
    this.name = 'Strategic Planning Agent';
    this.capabilities = [AgentCapability.PLANNING, AgentCapability.ARCHITECTURE];
    this.specializations = [
      'Architecture Patterns',
      'Task Decomposition',
      'Risk Assessment',
      'Resource Planning',
      'Timeline Estimation'
    ];

    this.patternLibrary = new ArchitecturePatternLibrary();
    this.decompositionEngine = new TaskDecompositionEngine();
    this.riskEngine = new RiskAssessmentEngine();
    this.resourceEngine = new ResourcePlanningEngine();
    this.validationEngine = new PlanValidationEngine();

    this.config = {
      maxConcurrentTasks: 2,
      timeoutMs: 30000,
      qualityThreshold: 0.8,
      retryAttempts: 3
    };

    this.metrics = {
      totalTasks: 0,
      successRate: 0,
      averageExecutionTime: 0,
      averageQuality: 0,
      lastActive: new Date(),
      expertise: {
        [TaskType.PLAN]: 0.9,
        [TaskType.CODE]: 0.3,
        [TaskType.TEST]: 0.4,
        [TaskType.SECURITY]: 0.5,
        [TaskType.DOCUMENT]: 0.6,
        [TaskType.REVIEW]: 0.7,
        [TaskType.REFACTOR]: 0.4,
        [TaskType.DEBUG]: 0.3
      }
    };
  }

  isAvailable(): boolean {
    return !this.isActive;
  }

  canHandle(taskType: TaskType): boolean {
    return taskType === TaskType.PLAN || taskType === TaskType.REVIEW;
  }

  getScore(task: SwarmTask): number {
    let score = 0;

    // Base score for planning tasks
    if (task.type === TaskType.PLAN) {
      score += 0.9;
    } else if (task.type === TaskType.REVIEW) {
      score += 0.7;
    } else {
      return 0.1; // Low score for non-planning tasks
    }

    // Bonus for architecture-related tasks
    const description = task.description.toLowerCase();
    if (description.includes('architecture') || description.includes('design')) {
      score += 0.1;
    }

    // Complexity bonus
    if (task.context.requirements && task.context.requirements.length > 5) {
      score += 0.1;
    }

    return Math.min(1, score);
  }

  async execute(task: SwarmTask): Promise<SwarmResult> {
    this.isActive = true;
    const startTime = Date.now();

    try {
      let output: any;
      let quality = 0.8;
      let reasoning = '';

      if (task.type === TaskType.PLAN) {
        output = await this.executePlanningTask(task);
        quality = this.assessPlanQuality(output);
        reasoning = 'Generated comprehensive plan with architecture patterns, task decomposition, risk assessment, and resource planning';
      } else if (task.type === TaskType.REVIEW) {
        output = await this.executeReviewTask(task);
        quality = this.assessReviewQuality(output);
        reasoning = 'Performed plan review with validation checks and optimization recommendations';
      } else {
        throw new Error(`Unsupported task type: ${task.type}`);
      }

      this.updateMetrics(true, Date.now() - startTime, quality);

      return {
        taskId: task.id,
        agentId: this.id,
        success: true,
        output,
        quality,
        executionTime: Date.now() - startTime,
        reasoning,
        metadata: {
          taskType: task.type,
          agent: this.name,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      this.updateMetrics(false, Date.now() - startTime, 0);
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        taskId: task.id,
        agentId: this.id,
        success: false,
        output: null,
        quality: 0,
        executionTime: Date.now() - startTime,
        reasoning: `Planning failed: ${errorMessage}`,
        metadata: {
          taskType: task.type,
          error: errorMessage,
          timestamp: new Date().toISOString()
        }
      };
    } finally {
      this.isActive = false;
    }
  }

  private async executePlanningTask(task: SwarmTask): Promise<any> {
    // Step 1: Suggest architecture patterns
    const patterns = this.patternLibrary.suggestPatterns(task.context.requirements || []);

    // Step 2: Decompose task into subtasks
    const decomposition = await this.decompositionEngine.decomposeTask(
      task.description,
      task.context,
      task.constraints
    );

    // Step 3: Assess risks
    const riskAssessment = this.riskEngine.assessRisk(
      decomposition,
      task.context,
      task.constraints
    );

    // Step 4: Plan resources
    const resourcePlan = this.resourceEngine.planResources(
      decomposition,
      riskAssessment,
      task.constraints
    );

    // Step 5: Validate plan
    const validation = this.validationEngine.validatePlan(
      decomposition,
      resourcePlan,
      task.constraints
    );

    return {
      architecturePatterns: patterns,
      taskDecomposition: decomposition,
      riskAssessment,
      resourcePlan,
      validation,
      summary: {
        estimatedDuration: decomposition.estimatedDuration,
        riskLevel: riskAssessment.overall,
        resourcesRequired: resourcePlan.agents.length,
        validationScore: validation.score
      }
    };
  }

  private async executeReviewTask(task: SwarmTask): Promise<any> {
    // Review existing plan from task context
    const existingPlan = task.context.plan;
    if (!existingPlan) {
      throw new Error('No plan provided for review');
    }

    const validation = this.validationEngine.validatePlan(
      existingPlan.taskDecomposition,
      existingPlan.resourcePlan,
      task.constraints
    );

    // Generate improvement suggestions
    const improvements = this.generateImprovements(existingPlan, validation);

    return {
      validation,
      improvements,
      recommendations: validation.recommendations,
      approvalStatus: validation.isValid ? 'approved' : 'requires_changes'
    };
  }

  private generateImprovements(plan: any, validation: PlanValidation): any[] {
    const improvements: Array<{
      type: string;
      description: string;
      impact: string;
      effort: string;
    }> = [];

    // Suggest optimizations for resource bottlenecks
    if (plan.resourcePlan?.bottlenecks?.length > 0) {
      improvements.push({
        type: 'resource_optimization',
        description: 'Optimize resource allocation to resolve bottlenecks',
        impact: 'High',
        effort: 'Medium'
      });
    }

    // Suggest risk mitigations
    if (plan.riskAssessment?.overall > 0.7) {
      improvements.push({
        type: 'risk_mitigation',
        description: 'Implement additional risk mitigation strategies',
        impact: 'High',
        effort: 'Low'
      });
    }

    return improvements;
  }

  private assessPlanQuality(output: any): number {
    let quality = 0.5; // Base quality

    // Quality factors
    if (output.validation?.isValid) quality += 0.2;
    if (output.validation?.score > 0.8) quality += 0.1;
    if (output.riskAssessment?.overall < 0.5) quality += 0.1;
    if (output.taskDecomposition?.subtasks?.length > 0) quality += 0.1;

    return Math.min(1, quality);
  }

  private assessReviewQuality(output: any): number {
    let quality = 0.6; // Base quality for reviews

    if (output.validation?.isValid) quality += 0.2;
    if (output.improvements?.length > 0) quality += 0.1;
    if (output.recommendations?.length > 0) quality += 0.1;

    return Math.min(1, quality);
  }

  private updateMetrics(success: boolean, executionTime: number, quality: number): void {
    this.metrics.totalTasks++;
    this.metrics.lastActive = new Date();

    // Update success rate
    const successCount = this.metrics.successRate * (this.metrics.totalTasks - 1) + (success ? 1 : 0);
    this.metrics.successRate = successCount / this.metrics.totalTasks;

    // Update average execution time
    this.metrics.averageExecutionTime = 
      (this.metrics.averageExecutionTime * (this.metrics.totalTasks - 1) + executionTime) / this.metrics.totalTasks;

    // Update average quality
    this.metrics.averageQuality = 
      (this.metrics.averageQuality * (this.metrics.totalTasks - 1) + quality) / this.metrics.totalTasks;
  }

  getMetrics(): AgentMetrics {
    return { ...this.metrics };
  }

  updateConfig(config: AgentConfig): void {
    this.config = { ...this.config, ...config };
  }
}

export default PlannerAgent; 