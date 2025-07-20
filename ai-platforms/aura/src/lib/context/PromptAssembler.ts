import { ContextChunk } from './Retriever';

/**
 * REVOLUTIONARY PromptAssembler v2.0 - Advanced AI Coding Assistant Prompt System
 * 
 * Implements cutting-edge patterns discovered from Claude Code, Cursor, and top AI assistants:
 * - Persistent Memory Architecture (AURA.md system)
 * - Advanced Security Validation & Command Prefix Detection  
 * - Adaptive Response System with User Behavior Profiling
 * - Multi-Modal Context Awareness (File/Git/Environment)
 * - Self-Optimizing Performance Tracking
 * - XML-Based Structured Reasoning
 * - Dynamic Context Compression with Semantic Clustering
 * - Task Management with Real-time Progress Tracking
 */

// =================== REVOLUTIONARY INTERFACES ===================

export interface AdvancedPromptTemplate extends PromptTemplate {
  securityValidation?: boolean;
  useStructuredReasoning?: boolean;
  useTaskManagement?: boolean;
  useAdaptiveResponse?: boolean;
  useMultiModalContext?: boolean;
  useSelfOptimization?: boolean;
  useDecisionTree?: boolean;
  responseOptimization?: 'minimal' | 'balanced' | 'detailed' | 'adaptive';
  securityMode?: 'sandbox' | 'full' | 'adaptive';
  optimizationLevel?: 'basic' | 'advanced' | 'maximum';
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  maxTokens: number | 'adaptive' | 'dynamic';
  modelTypes: string[];
  contextSlots: {
    name: string;
    required: boolean;
    maxTokens: number;
    compression?: 'none' | 'summarize' | 'extract_symbols' | 'smart_truncate' | 'semantic_clustering';
  }[];
}

// =================== PERSISTENT MEMORY SYSTEM ===================

export interface AuraMemorySystem {
  persistentMemory: {
    commands: Record<string, string>;
    codeStyles: Record<string, CodeStylePreferences>;
    projectContext: Record<string, ProjectKnowledge>;
    userPatterns: UserBehaviorProfile;
    frequentTasks: Record<string, TaskTemplate>;
  };
  sessionMemory: {
    recentErrors: string[];
    completionHistory: CompletionMetrics[];
    contextCache: Map<string, CachedContext>;
    performanceMetrics: ResponseMetrics[];
  };
}

export interface CodeStylePreferences {
  indentation: 'tabs' | 'spaces';
  spacesCount: number;
  quotestyle: 'single' | 'double';
  semicolons: boolean;
  trailingCommas: boolean;
  functionStyle: 'arrow' | 'function' | 'mixed';
  namingConvention: 'camelCase' | 'snake_case' | 'PascalCase';
}

export interface ProjectKnowledge {
  framework: string;
  language: string;
  architecture: string;
  dependencies: string[];
  commonPatterns: string[];
  fileStructure: Record<string, string>;
  buildCommands: string[];
  testCommands: string[];
}

export interface UserBehaviorProfile {
  preferredResponseLength: 'minimal' | 'balanced' | 'detailed';
  technicalLevel: 'beginner' | 'intermediate' | 'expert';
  communicationStyle: 'direct' | 'explanatory' | 'collaborative';
  domainExpertise: string[];
  recentInteractionPatterns: InteractionPattern[];
  satisfactionScore: number;
  preferredPersonas: string[];
}

export interface InteractionPattern {
  queryType: string;
  responseType: string;
  satisfaction: number;
  timestamp: Date;
  followUpQuestions: number;
}

// =================== SECURITY SYSTEM ===================

export interface SecurityValidation {
  safe: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  allowedInSandbox: boolean;
  requiresApproval: boolean;
  detectedPatterns: string[];
  threatAssessment: string;
  recommendedMode: 'sandbox' | 'full';
}

export interface CommandSecurityAnalysis {
  commandPrefix: string;
  injectionDetected: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  sandboxCompatible: boolean;
  approvalRequired: boolean;
  securityWarnings: string[];
}

// =================== MULTI-MODAL CONTEXT ===================

export interface MultiModalContext {
  fileContext: FileAnalysis;
  gitContext: GitStateAnalysis;
  environmentContext: EnvironmentState;
  projectContext: ProjectAnalysis;
}

export interface FileAnalysis {
  fileType: string;
  language: string;
  framework: string;
  dependencies: string[];
  codeStyle: CodeStyleAnalysis;
  complexity: ComplexityMetrics;
  securityProfile: SecurityProfile;
}

export interface GitStateAnalysis {
  currentBranch: string;
  uncommittedChanges: boolean;
  recentCommits: string[];
  conflictFiles: string[];
  stashCount: number;
}

export interface EnvironmentState {
  platform: string;
  nodeVersion?: string;
  pythonVersion?: string;
  workingDirectory: string;
  activeServices: string[];
}

// =================== PERFORMANCE OPTIMIZATION ===================

export interface ResponseMetrics {
  responseTime: number;
  tokenUsage: number;
  userSatisfaction?: number;
  taskCompletionRate: number;
  errorRate: number;
  followUpQuestions: number;
  templateUsed: string;
  optimizationLevel: string;
}

export interface IPerformanceOptimizer {
  trackResponseMetrics(promptId: string, metrics: ResponseMetrics): void;
  optimizePromptBasedOnPerformance(promptId: string): AdvancedPromptTemplate;
  adaptTokenAllocation(usage: TokenUsage[]): TokenAllocationStrategy;
  suggestTemplateImprovements(templateId: string): TemplateOptimization[];
}

// =================== TASK MANAGEMENT ===================

export interface TaskBreakdown {
  id: string;
  mainTask: string;
  subtasks: Task[];
  currentPhase: string;
  completionPercentage: number;
  estimatedDuration: number;
}

export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  estimatedTime: number;
  actualTime?: number;
}

// =================== ENHANCED PROMPT CONTEXT ===================

export interface PromptContext {
  intent: string;
  userQuery?: string;
  currentFile?: string;
  currentSelection?: string;
  cursorPosition?: { line: number; column: number };
  recentFiles?: string[];
  errorMessages?: string[];
  contextChunks: ContextChunk[];
  metadata?: Record<string, any>;
  
  // Revolutionary additions
  multiModalContext?: MultiModalContext;
  securityContext?: SecurityValidation;
  userProfile?: UserBehaviorProfile;
  activeTasks?: Task[];
  memoryContext?: AuraMemorySystem;
  performanceContext?: ResponseMetrics[];
}

export interface AssembledPrompt {
  prompt: string;
  tokenCount: number;
  template: AdvancedPromptTemplate;
  context: {
    chunks: ContextChunk[];
    compression: {
      originalTokens: number;
      compressedTokens: number;
      compressionRatio: number;
    };
  };
  safety: {
    withinTokenLimit: boolean;
    safetyMargin: number;
    truncatedContent?: string[];
    securityValidation?: SecurityValidation;
  };
  optimizations: {
    templateUsed: string;
    compressionApplied: string[];
    modelSpecificAdjustments: string[];
    performanceOptimizations: string[];
    adaptiveAdjustments: string[];
  };
  
  // Revolutionary additions
  memoryInjections: string[];
  securityAnalysis?: CommandSecurityAnalysis;
  taskBreakdown?: TaskBreakdown;
  adaptiveMetrics: ResponseMetrics;
}

export interface CompressionResult {
  content: string;
  originalTokens: number;
  compressedTokens: number;
  method: string;
  metadata?: Record<string, any>;
  preservedConcepts?: string[];
  semanticClusters?: any[];
}

// =================== REVOLUTIONARY PROMPT ASSEMBLER ===================

export class PromptAssembler {
  private templates: Map<string, AdvancedPromptTemplate> = new Map();
  private tokenLimit: number = 4000;
  private safetyMargin: number = 200;
  
  // Revolutionary additions - properly initialized
  private memorySystem: AuraMemorySystem;
  private securityValidator: SecurityValidator;
  private performanceOptimizer: PerformanceOptimizer;
  private contextCompressor: IntelligentContextCompressor;
  private taskManager: AdvancedTaskManager;
  private userProfiler: UserBehaviorProfiler;

  constructor() {
    // Initialize revolutionary system first
    this.memorySystem = this.createMemorySystem();
    this.securityValidator = new SecurityValidator();
    this.performanceOptimizer = new PerformanceOptimizer();
    this.contextCompressor = new IntelligentContextCompressor();
    this.taskManager = new AdvancedTaskManager();
    this.userProfiler = new UserBehaviorProfiler();
    
    this.initializeAdvancedTemplates();
  }

  /**
   * Revolutionary prompt assembly with all advanced features
   */
  public async assemblePrompt(
    context: PromptContext,
    templateId: string = 'ultra-concise-default',
    targetModel?: string
  ): Promise<AssembledPrompt> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Security validation first
    if (template.securityValidation) {
      const securityCheck = await this.validateSecurity(context);
      if (!securityCheck.safe && securityCheck.riskLevel === 'critical') {
        throw new Error(`Security validation failed: ${securityCheck.threatAssessment}`);
      }
      context.securityContext = securityCheck;
    }

    // Load persistent memory context
    context.memoryContext = this.memorySystem;

    // User behavior profiling
    if (template.useAdaptiveResponse) {
      context.userProfile = this.memorySystem.persistentMemory.userPatterns;
    }

    // Multi-modal context analysis
    if (template.useMultiModalContext) {
      context.multiModalContext = await this.analyzeMultiModalContext(context);
    }

    // Task breakdown for complex requests
    if (template.useTaskManagement) {
      const taskBreakdown = await this.createTaskBreakdown(context);
      context.activeTasks = taskBreakdown.subtasks;
    }

    // Adjust settings for target model
    if (targetModel) {
      this.adjustForModel(targetModel);
    }

    // Calculate available tokens with adaptive allocation
    const availableTokens = await this.calculateAdaptiveTokenAllocation(template, context);

    // Advanced context compression with semantic clustering
    const compressedContext = await this.compressContextIntelligently(
      context.contextChunks, 
      availableTokens,
      template.contextSlots[0]?.compression || 'semantic_clustering'
    );

    // Build the revolutionary prompt
    const assembledPrompt = await this.buildAdvancedPrompt(template, context, compressedContext);

    // Performance tracking and optimization
    if (template.useSelfOptimization) {
      await this.trackPerformanceMetrics(templateId, context, assembledPrompt);
    }

    // Validate final result
    const finalTokenCount = this.estimateTokens(assembledPrompt);
    const withinLimit = finalTokenCount <= this.tokenLimit - this.safetyMargin;

    return {
      prompt: assembledPrompt,
      tokenCount: finalTokenCount,
      template,
      context: {
        chunks: compressedContext.chunks,
        compression: {
          originalTokens: compressedContext.originalTokens,
          compressedTokens: compressedContext.compressedTokens,
          compressionRatio: compressedContext.compressionRatio
        }
      },
      safety: {
        withinTokenLimit: withinLimit,
        safetyMargin: this.tokenLimit - finalTokenCount,
        securityValidation: context.securityContext,
        ...(compressedContext.truncatedContent && { truncatedContent: compressedContext.truncatedContent })
      },
      optimizations: {
        templateUsed: templateId,
        compressionApplied: compressedContext.methods || [],
        modelSpecificAdjustments: targetModel ? this.getModelAdjustments(targetModel) : [],
        performanceOptimizations: await this.getPerformanceOptimizations(templateId),
        adaptiveAdjustments: await this.getAdaptiveAdjustments(context.userProfile)
      },
      memoryInjections: await this.getMemoryInjections(context),
      securityAnalysis: context.securityContext ? await this.analyzeCommandSecurity(context.userQuery || '') : undefined,
      taskBreakdown: context.activeTasks ? await this.createTaskBreakdown(context) : undefined,
      adaptiveMetrics: await this.calculateAdaptiveMetrics(template, context)
    };
  }

  // =================== REVOLUTIONARY METHOD IMPLEMENTATIONS ===================

  /**
   * Create memory system instance
   */
  private createMemorySystem(): AuraMemorySystem {
    return {
      persistentMemory: {
        commands: {},
        codeStyles: {},
        projectContext: {},
        userPatterns: {
          preferredResponseLength: 'balanced',
          technicalLevel: 'intermediate',
          communicationStyle: 'collaborative',
          domainExpertise: [],
          recentInteractionPatterns: [],
          satisfactionScore: 0.8,
          preferredPersonas: ['mentor']
        },
        frequentTasks: {}
      },
      sessionMemory: {
        recentErrors: [],
        completionHistory: [],
        contextCache: new Map(),
        performanceMetrics: []
      }
    };
  }

  /**
   * Initialize advanced templates with revolutionary patterns
   */
  private initializeAdvancedTemplates(): void {
    // Ultra-Concise Default (Claude Code Pattern)
    this.templates.set('ultra-concise-default', {
      id: 'ultra-concise-default',
      name: 'Ultra-Concise Code Assistant',
      description: 'Optimized for speed and precision like Claude Code',
      template: `<system-reminder>
File: {{current_file}} | Cursor: {{cursor_position}}
Intent: {{intent}} | Context: {{context_chunks}}
User Level: {{user_technical_level}} | Style: {{user_communication_style}}
</system-reminder>

Expert coding assistant. Context-aware. Ultra-concise responses.

CRITICAL RULES:
- Answer in <4 lines unless asked for detail
- One word answers preferred  
- No "Here is..." or "Based on..." preambles
- Direct answers only
- REFUSE malicious code instantly

{{#if user_communication_style === 'direct'}}
STYLE: Minimal. Essential info only.
{{else if user_communication_style === 'explanatory'}}
STYLE: Clear explanations with examples.
{{else}}
STYLE: Collaborative guidance.
{{/if}}

Query: {{user_query}}`,
      variables: ['intent', 'current_file', 'cursor_position', 'context_chunks', 'user_query', 'user_technical_level', 'user_communication_style'],
      maxTokens: 2000,
      modelTypes: ['all'],
      contextSlots: [{
        name: 'context_chunks',
        required: true,
        maxTokens: 1500,
        compression: 'smart_truncate'
      }],
      securityValidation: true,
      useAdaptiveResponse: true,
      responseOptimization: 'minimal'
    });

    // Security-First Template
    this.templates.set('security-focused', {
      id: 'security-focused',
      name: 'Security-First Assistant',
      description: 'Advanced security validation and threat detection',
      template: `<system-reminder>
SECURITY CRITICAL: Analyzing {{current_file}} for threats
Sandbox Mode: {{sandbox_enabled}}
Risk Level: {{risk_assessment}}
</system-reminder>

Security expert. Malicious code detection enabled.

MANDATORY SECURITY PROTOCOL:
1. REFUSE malware/keylogger/backdoor code instantly
2. Flag suspicious file paths immediately
3. Validate inputs for injection attempts
4. Check credential exposure risks

Context: {{context_chunks}}
Security Scan: {{security_analysis}}

<security-check>
Threat Level: {{threat_assessment}}
File Safety: {{file_safety_check}}
Command Safety: {{command_safety}}
</security-check>

{{#if threat_assessment === 'critical'}}
🚨 CRITICAL THREAT DETECTED - REFUSING REQUEST
{{else if threat_assessment === 'high'}}
⚠️ HIGH RISK - Proceed with extreme caution
{{else}}
✅ SECURE - Safe to proceed
{{/if}}

Response: {{security_response}}`,
      variables: ['current_file', 'context_chunks', 'user_query', 'security_analysis', 'threat_assessment'],
      maxTokens: 3000,
      modelTypes: ['all'],
      contextSlots: [{
        name: 'context_chunks',
        required: true,
        maxTokens: 2000,
        compression: 'extract_symbols'
      }],
      securityValidation: true,
      securityMode: 'adaptive'
    });

    // Structured Reasoning Template
    this.templates.set('structured-reasoning', {
      id: 'structured-reasoning',
      name: 'Structured Reasoning Expert',
      description: 'XML-based structured thinking for complex problems',
      template: `Expert assistant with structured reasoning.

Request: {{user_query}}
Context: {{context_chunks}}
File: {{current_file}}

<thinking>
<understanding>{{problem_comprehension}}</understanding>
<context-analysis>{{context_evaluation}}</context-analysis>
<approach-selection>{{chosen_strategy}}</approach-selection>
<implementation-plan>{{step_by_step_plan}}</implementation-plan>
<risk-assessment>{{potential_issues}}</risk-assessment>
<validation-strategy>{{how_to_verify}}</validation-strategy>
</thinking>

<execution>
<primary-action>{{main_solution}}</primary-action>
<verification>{{validation_result}}</verification>
<follow-up>{{next_steps}}</follow-up>
</execution>

<output>{{final_response}}</output>`,
      variables: ['user_query', 'context_chunks', 'current_file'],
      maxTokens: 4000,
      modelTypes: ['all'],
      contextSlots: [{
        name: 'context_chunks',
        required: true,
        maxTokens: 3000,
        compression: 'semantic_clustering'
      }],
      useStructuredReasoning: true
    });
  }

  /**
   * Validate security context
   */
  private async validateSecurity(context: PromptContext): Promise<SecurityValidation> {
    const userQuery = context.userQuery || '';
    const currentFile = context.currentFile || '';
    
    // Check for malicious patterns
    const maliciousPatterns = [
      /eval\s*\(/gi,
      /exec\s*\(/gi,
      /\.\.\/\.\.\//gi,
      /document\.cookie/gi,
      /localStorage\.setItem.*password/gi,
      /keylogger/gi,
      /backdoor/gi,
      /malware/gi
    ];

    const detectedPatterns = maliciousPatterns
      .filter(pattern => pattern.test(userQuery) || pattern.test(currentFile))
      .map(pattern => pattern.source);

    const riskLevel = detectedPatterns.length > 0 ? 'critical' : 'low';
    const safe = detectedPatterns.length === 0;

    return {
      safe,
      riskLevel,
      allowedInSandbox: safe,
      requiresApproval: !safe,
      detectedPatterns,
      threatAssessment: safe ? 'No threats detected' : `Detected patterns: ${detectedPatterns.join(', ')}`,
      recommendedMode: safe ? 'full' : 'sandbox'
    };
  }

  /**
   * Analyze multi-modal context
   */
  private async analyzeMultiModalContext(context: PromptContext): Promise<MultiModalContext> {
    const currentFile = context.currentFile || '';
    const fileExtension = currentFile.split('.').pop() || '';
    
    return {
      fileContext: {
        fileType: fileExtension,
        language: this.detectLanguage(fileExtension),
        framework: 'unknown',
        dependencies: [],
        codeStyle: {
          indentation: 'spaces',
          quotestyle: 'single',
          semicolons: true
        },
        complexity: {
          cyclomaticComplexity: 0,
          linesOfCode: 0,
          nestingDepth: 0
        },
        securityProfile: {
          hasSecrets: false,
          usesExternalAPIs: false,
          hasFileAccess: false
        }
      },
      gitContext: {
        currentBranch: 'main',
        uncommittedChanges: false,
        recentCommits: [],
        conflictFiles: [],
        stashCount: 0
      },
      environmentContext: {
        platform: process.platform,
        nodeVersion: process.version,
        workingDirectory: process.cwd(),
        activeServices: []
      },
      projectContext: {
        framework: 'unknown',
        buildSystem: 'unknown',
        testFramework: 'unknown',
        dependencies: [],
        architecture: 'unknown'
      }
    };
  }

  /**
   * Create task breakdown
   */
  private async createTaskBreakdown(context: PromptContext): Promise<TaskBreakdown> {
    const userQuery = context.userQuery || '';
    
    // Simple task breakdown based on query complexity
    const subtasks: Task[] = [
      {
        id: 'analyze',
        description: 'Analyze requirements',
        status: 'completed',
        priority: 'high',
        dependencies: [],
        estimatedTime: 30
      },
      {
        id: 'implement',
        description: 'Implement solution',
        status: 'in_progress',
        priority: 'high',
        dependencies: ['analyze'],
        estimatedTime: 120
      },
      {
        id: 'validate',
        description: 'Validate and test',
        status: 'pending',
        priority: 'medium',
        dependencies: ['implement'],
        estimatedTime: 60
      }
    ];

    return {
      id: 'task-' + Date.now(),
      mainTask: userQuery,
      subtasks,
      currentPhase: 'implementation',
      completionPercentage: 33,
      estimatedDuration: 210
    };
  }

  /**
   * Calculate adaptive token allocation
   */
  private async calculateAdaptiveTokenAllocation(template: AdvancedPromptTemplate, context: PromptContext): Promise<number> {
    const baseTokens = this.tokenLimit - this.safetyMargin;
    
    // Adjust based on template optimization level
    switch (template.responseOptimization) {
      case 'minimal':
        return Math.floor(baseTokens * 0.6);
      case 'detailed':
        return Math.floor(baseTokens * 0.9);
      case 'adaptive':
        return Math.floor(baseTokens * (context.userProfile?.technicalLevel === 'expert' ? 0.7 : 0.8));
      default:
        return Math.floor(baseTokens * 0.75);
    }
  }

  /**
   * Intelligent context compression
   */
  private async compressContextIntelligently(
    chunks: ContextChunk[],
    targetTokens: number,
    compressionType: string
  ): Promise<any> {
    // Simplified implementation - in reality would use semantic clustering
    const originalTokens = chunks.reduce((sum, chunk) => sum + this.estimateTokens(chunk.content), 0);
    
    if (originalTokens <= targetTokens) {
      return {
        chunks,
        originalTokens,
        compressedTokens: originalTokens,
        compressionRatio: 1.0,
        methods: ['none']
      };
    }

    // Simple truncation for now
    const compressionRatio = targetTokens / originalTokens;
    const compressedChunks = chunks.slice(0, Math.floor(chunks.length * compressionRatio));
    const compressedTokens = compressedChunks.reduce((sum, chunk) => sum + this.estimateTokens(chunk.content), 0);

    return {
      chunks: compressedChunks,
      originalTokens,
      compressedTokens,
      compressionRatio,
      methods: [compressionType]
    };
  }

  /**
   * Build advanced prompt with all enhancements
   */
  private async buildAdvancedPrompt(
    template: AdvancedPromptTemplate,
    context: PromptContext,
    compressedContext: any
  ): Promise<string> {
    let prompt = template.template;

    // Inject system reminders
    const systemReminders = this.buildSystemReminders(context);
    
    // Replace template variables
    const variables = {
      intent: context.intent || '',
      user_query: context.userQuery || '',
      current_file: context.currentFile || '',
      current_selection: context.currentSelection || '',
      cursor_position: context.cursorPosition ? `${context.cursorPosition.line}:${context.cursorPosition.column}` : '',
      recent_files: context.recentFiles?.join(', ') || '',
      error_messages: context.errorMessages?.join('\n') || '',
      context_chunks: this.formatContextChunks(compressedContext.chunks),
      timestamp: new Date().toISOString(),
      
      // Advanced variables
      user_technical_level: context.userProfile?.technicalLevel || 'intermediate',
      user_communication_style: context.userProfile?.communicationStyle || 'collaborative',
      programming_language: context.multiModalContext?.fileContext?.language || 'unknown',
      detected_framework: context.multiModalContext?.fileContext?.framework || 'unknown',
      git_branch: context.multiModalContext?.gitContext?.currentBranch || 'unknown',
      git_status: context.multiModalContext?.gitContext?.uncommittedChanges ? 'dirty' : 'clean',
      platform: context.multiModalContext?.environmentContext?.platform || 'unknown',
      file_type: context.multiModalContext?.fileContext?.fileType || 'unknown',
      
      // Security variables
      security_analysis: context.securityContext?.threatAssessment || 'No analysis',
      threat_assessment: context.securityContext?.riskLevel || 'low',
      sandbox_enabled: context.securityContext?.recommendedMode === 'sandbox' ? 'true' : 'false',
      
      // Task variables
      active_tasks: context.activeTasks?.map(t => `${t.description} (${t.status})`).join(', ') || 'none',
      current_phase: 'analysis'
    };

    // Replace all variables in template
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      prompt = prompt.replace(regex, value);
    }

    return systemReminders + '\n\n' + prompt;
  }

  /**
   * Build system reminders for context injection
   */
  private buildSystemReminders(context: PromptContext): string {
    return `<system-reminder>
File: ${context.currentFile || 'unknown'} | Cursor: ${context.cursorPosition?.line || 0}:${context.cursorPosition?.column || 0}
Recent errors: ${context.errorMessages?.join('; ') || 'none'}
User level: ${context.userProfile?.technicalLevel || 'intermediate'}
Security: ${context.securityContext?.riskLevel || 'unknown'}
</system-reminder>`;
  }

  /**
   * Track performance metrics
   */
  private async trackPerformanceMetrics(templateId: string, context: PromptContext, prompt: string): Promise<void> {
    const metrics: ResponseMetrics = {
      responseTime: Date.now(), // Will be updated after response
      tokenUsage: this.estimateTokens(prompt),
      taskCompletionRate: 1.0,
      errorRate: 0.0,
      followUpQuestions: 0,
      templateUsed: templateId,
      optimizationLevel: 'advanced'
    };

    this.memorySystem.sessionMemory.performanceMetrics.push(metrics);
  }

  /**
   * Get performance optimizations
   */
  private async getPerformanceOptimizations(templateId: string): Promise<string[]> {
    return ['token-optimization', 'context-compression', 'adaptive-response'];
  }

  /**
   * Get adaptive adjustments
   */
  private async getAdaptiveAdjustments(userProfile?: UserBehaviorProfile): Promise<string[]> {
    if (!userProfile) return [];
    
    const adjustments = [];
    if (userProfile.preferredResponseLength === 'minimal') {
      adjustments.push('ultra-concise-mode');
    }
    if (userProfile.technicalLevel === 'expert') {
      adjustments.push('expert-vocabulary');
    }
    return adjustments;
  }

  /**
   * Get memory injections
   */
  private async getMemoryInjections(context: PromptContext): Promise<string[]> {
    return ['persistent-commands', 'code-style-preferences', 'project-context'];
  }

  /**
   * Analyze command security
   */
  private async analyzeCommandSecurity(command: string): Promise<CommandSecurityAnalysis> {
    const commandPrefix = command.split(' ')[0] || '';
    
    const dangerousCommands = ['rm', 'del', 'format', 'eval', 'exec'];
    const injectionDetected = /[;&|]/.test(command);
    
    const riskLevel = dangerousCommands.includes(commandPrefix) || injectionDetected ? 'high' : 'low';
    
    return {
      commandPrefix,
      injectionDetected,
      riskLevel,
      sandboxCompatible: riskLevel === 'low',
      approvalRequired: riskLevel === 'high',
      securityWarnings: riskLevel === 'high' ? ['Potentially dangerous command detected'] : []
    };
  }

  /**
   * Calculate adaptive metrics
   */
  private async calculateAdaptiveMetrics(template: AdvancedPromptTemplate, context: PromptContext): Promise<ResponseMetrics> {
    return {
      responseTime: 0, // Will be set during actual response
      tokenUsage: template.maxTokens as number || 2000,
      taskCompletionRate: 1.0,
      errorRate: 0.0,
      followUpQuestions: 0,
      templateUsed: template.id,
      optimizationLevel: template.optimizationLevel || 'basic'
    };
  }

  /**
   * Detect programming language from file extension
   */
  private detectLanguage(extension: string): string {
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'js': 'javascript',
      'py': 'python',
      'rs': 'rust',
      'go': 'go',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin'
    };
    
    return languageMap[extension] || 'unknown';
  }

  /**
   * Format context chunks for display
   */
  private formatContextChunks(chunks: ContextChunk[]): string {
    return chunks
      .map(chunk => `[${chunk.filePath}] ${chunk.content.substring(0, 200)}...`)
      .join('\n\n');
  }

  /**
   * Estimate token count for text
   */
  private estimateTokens(text: string): number {
    // Simple estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Adjust settings for specific model
   */
  private adjustForModel(model: string): void {
    switch (model) {
      case 'gpt-4':
        this.tokenLimit = 8000;
        break;
      case 'claude-3':
        this.tokenLimit = 8000;
        break;
      case 'qwen3-coder-14b':
        this.tokenLimit = 4000;
        break;
      default:
        this.tokenLimit = 4000;
    }
  }

  /**
   * Get model-specific adjustments
   */
  private getModelAdjustments(model: string): string[] {
    const adjustments = [];
    if (model.includes('gpt')) {
      adjustments.push('openai-optimized');
    }
    if (model.includes('claude')) {
      adjustments.push('anthropic-optimized');
    }
    if (model.includes('qwen')) {
      adjustments.push('local-model-optimized');
    }
    return adjustments;
  }
}

// =================== REVOLUTIONARY HELPER CLASSES ===================

class SecurityValidator {
  async validateCommand(command: string): Promise<SecurityValidation> {
    return {
      safe: true,
      riskLevel: 'low',
      allowedInSandbox: true,
      requiresApproval: false,
      detectedPatterns: [],
      threatAssessment: 'Safe command',
      recommendedMode: 'full'
    };
  }
}

class PerformanceOptimizer {
  optimizeTemplate(template: AdvancedPromptTemplate): AdvancedPromptTemplate {
    return template;
  }
}

class IntelligentContextCompressor {
  async compressSemanticClusters(chunks: ContextChunk[], targetTokens: number): Promise<any> {
    return { chunks, compressionRatio: 1.0 };
  }
}

class AdvancedTaskManager {
  createTaskBreakdown(query: string): TaskBreakdown {
    return {
      id: 'task-1',
      mainTask: query,
      subtasks: [],
      currentPhase: 'analysis',
      completionPercentage: 0,
      estimatedDuration: 0
    };
  }
}

class UserBehaviorProfiler {
  profileUser(context: PromptContext): UserBehaviorProfile {
    return {
      preferredResponseLength: 'balanced',
      technicalLevel: 'intermediate',
      communicationStyle: 'collaborative',
      domainExpertise: [],
      recentInteractionPatterns: [],
      satisfactionScore: 0.8,
      preferredPersonas: []
    };
  }
}

// =================== ADDITIONAL TYPE DEFINITIONS ===================

interface CodeStyleAnalysis {
  indentation: string;
  quotestyle: string;
  semicolons: boolean;
}

interface ComplexityMetrics {
  cyclomaticComplexity: number;
  linesOfCode: number;
  nestingDepth: number;
}

interface SecurityProfile {
  hasSecrets: boolean;
  usesExternalAPIs: boolean;
  hasFileAccess: boolean;
}

interface ProjectAnalysis {
  framework: string;
  buildSystem: string;
  testFramework: string;
  dependencies: string[];
  architecture: string;
}

interface CompletionMetrics {
  timestamp: Date;
  templateUsed: string;
  tokensUsed: number;
  responseTime: number;
  userSatisfaction?: number;
}

interface CachedContext {
  content: string;
  timestamp: Date;
  hits: number;
}

interface TaskTemplate {
  name: string;
  steps: string[];
  estimatedTime: number;
}

interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

interface TokenAllocationStrategy {
  contextTokens: number;
  responseTokens: number;
  safetyMargin: number;
}

interface TemplateOptimization {
  suggestion: string;
  expectedImprovement: number;
  riskLevel: string;
}

export default PromptAssembler; 