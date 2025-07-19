import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

// Security-specific types
export interface SecurityRequirement {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
}

// Core Types for Swarm System
export interface SwarmTask {
  id: string;
  type: TaskType;
  priority: number;
  description: string;
  context: {
    codebase: string;
    files: string[];
    intent: string;
    requirements: string[];
    // Additional properties accessed by agents
    projectInfo?: any;
    gitHistory?: any;
    documentation?: any;
    plan?: any;
    securityScan?: any;
    tests?: any;
  };
  constraints: {
    timeLimit?: number;
    qualityThreshold: number;
    securityLevel: 'low' | 'medium' | 'high';
  };
  metadata: Record<string, any>;
}

export interface SwarmResult {
  taskId: string;
  agentId: string;
  success: boolean;
  output: any;
  quality: number; // 0-1 score
  executionTime: number;
  reasoning: string;
  metadata: Record<string, any>;
}

export enum TaskType {
  PLAN = 'plan',
  CODE = 'code',
  TEST = 'test',
  SECURITY = 'security',
  DOCUMENT = 'document',
  REVIEW = 'review',
  REFACTOR = 'refactor',
  DEBUG = 'debug'
}

export enum AgentCapability {
  PLANNING = 'planning',
  CODING = 'coding',
  TESTING = 'testing',
  SECURITY = 'security',
  DOCUMENTATION = 'documentation',
  REVIEW = 'review',
  ARCHITECTURE = 'architecture',
  DEBUGGING = 'debugging'
}

export interface SwarmAgent {
  id: string;
  name: string;
  capabilities: AgentCapability[];
  specializations: string[];
  isAvailable: () => boolean;
  canHandle: (taskType: TaskType) => boolean;
  getScore: (task: SwarmTask) => number;
  execute: (task: SwarmTask) => Promise<SwarmResult>;
  getMetrics: () => AgentMetrics;
  updateConfig: (config: AgentConfig) => void;
}

export interface AgentMetrics {
  totalTasks: number;
  successRate: number;
  averageExecutionTime: number;
  averageQuality: number;
  lastActive: Date;
  expertise: Record<TaskType, number>; // 0-1 scores
}

export interface AgentConfig {
  maxConcurrentTasks: number;
  timeoutMs: number;
  qualityThreshold: number;
  retryAttempts: number;
}

export interface ConsensusRequest {
  id: string;
  question: string;
  options: string[];
  requiredVotes: number;
  timeoutMs: number;
  context: any;
}

export interface ConsensusResult {
  decision: string;
  confidence: number;
  votes: Record<string, string>;
  reasoning: string[];
}

// Task Queue with Priority Management
class TaskQueue {
  private tasks: SwarmTask[] = [];
  private processing = new Map<string, SwarmTask>();

  enqueue(task: SwarmTask): void {
    this.tasks.push(task);
    this.tasks.sort((a, b) => b.priority - a.priority);
  }

  dequeue(): SwarmTask | null {
    return this.tasks.shift() || null;
  }

  peek(): SwarmTask | null {
    return this.tasks[0] || null;
  }

  markProcessing(taskId: string, task: SwarmTask): void {
    this.processing.set(taskId, task);
  }

  markComplete(taskId: string): void {
    this.processing.delete(taskId);
  }

  getProcessing(): SwarmTask[] {
    return Array.from(this.processing.values());
  }

  size(): number {
    return this.tasks.length;
  }

  isEmpty(): boolean {
    return this.tasks.length === 0;
  }
}

// Performance Tracker for Agents
class AgentPerformanceTracker {
  private metrics = new Map<string, AgentMetrics>();

  updateMetrics(agentId: string, result: SwarmResult): void {
    const existing = this.metrics.get(agentId) || {
      totalTasks: 0,
      successRate: 0,
      averageExecutionTime: 0,
      averageQuality: 0,
      lastActive: new Date(),
      expertise: {} as Record<TaskType, number>
    };

    existing.totalTasks++;
    existing.lastActive = new Date();

    // Update success rate
    const successCount = existing.successRate * (existing.totalTasks - 1) + (result.success ? 1 : 0);
    existing.successRate = successCount / existing.totalTasks;

    // Update average execution time
    existing.averageExecutionTime = 
      (existing.averageExecutionTime * (existing.totalTasks - 1) + result.executionTime) / existing.totalTasks;

    // Update average quality
    existing.averageQuality = 
      (existing.averageQuality * (existing.totalTasks - 1) + result.quality) / existing.totalTasks;

    // Update expertise for task type
    const taskType = this.getTaskTypeFromResult(result);
    if (taskType) {
      const currentExpertise = existing.expertise[taskType] || 0;
      existing.expertise[taskType] = Math.min(1, currentExpertise + (result.quality * 0.1));
    }

    this.metrics.set(agentId, existing);
  }

  getMetrics(agentId: string): AgentMetrics | null {
    return this.metrics.get(agentId) || null;
  }

  getAllMetrics(): Map<string, AgentMetrics> {
    return new Map(this.metrics);
  }

  private getTaskTypeFromResult(result: SwarmResult): TaskType | null {
    // Extract task type from result metadata
    return result.metadata?.taskType || null;
  }
}

// Consensus Manager for Multi-Agent Decisions
class ConsensusManager {
  private activeConsensus = new Map<string, ConsensusRequest>();
  private votes = new Map<string, Map<string, string>>();

  async requestConsensus(
    request: ConsensusRequest,
    agents: SwarmAgent[]
  ): Promise<ConsensusResult> {
    this.activeConsensus.set(request.id, request);
    this.votes.set(request.id, new Map());

    const availableAgents = agents.filter(agent => agent.isAvailable());
    const votingAgents = availableAgents.slice(0, request.requiredVotes);

    // Collect votes with timeout
    const votePromises = votingAgents.map(agent => 
      this.collectVote(request, agent)
    );

    try {
      await Promise.all(votePromises);
    } catch (error) {
      console.warn('Some agents failed to vote within timeout:', error);
    }

    return this.calculateConsensus(request.id);
  }

  private async collectVote(request: ConsensusRequest, agent: SwarmAgent): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Agent ${agent.id} vote timeout`));
      }, request.timeoutMs);

      // Simulate agent voting (in real implementation, this would call agent's decision method)
      setTimeout(() => {
        clearTimeout(timeout);
        const vote = this.simulateAgentVote(request, agent);
        const agentVotes = this.votes.get(request.id)!;
        agentVotes.set(agent.id, vote);
        resolve();
      }, Math.random() * 1000); // Random delay to simulate thinking
    });
  }

  private simulateAgentVote(request: ConsensusRequest, agent: SwarmAgent): string {
    // Simple simulation - in real implementation, agents would analyze the question
    const randomIndex = Math.floor(Math.random() * request.options.length);
    return request.options[randomIndex];
  }

  private calculateConsensus(requestId: string): ConsensusResult {
    const request = this.activeConsensus.get(requestId)!;
    const votes = this.votes.get(requestId)!;

    // Count votes
    const voteCounts = new Map<string, number>();
    const voteReasons = new Map<string, string[]>();

    for (const [agentId, vote] of votes) {
      voteCounts.set(vote, (voteCounts.get(vote) || 0) + 1);
      if (!voteReasons.has(vote)) {
        voteReasons.set(vote, []);
      }
      voteReasons.get(vote)!.push(`Agent ${agentId} voted for ${vote}`);
    }

    // Find winning option
    let maxVotes = 0;
    let decision = request.options[0];
    for (const [option, count] of voteCounts) {
      if (count > maxVotes) {
        maxVotes = count;
        decision = option;
      }
    }

    const confidence = maxVotes / votes.size;
    const reasoning = voteReasons.get(decision) || [];

    // Cleanup
    this.activeConsensus.delete(requestId);
    this.votes.delete(requestId);

    return {
      decision,
      confidence,
      votes: Object.fromEntries(votes),
      reasoning
    };
  }
}

// Main SwarmOrchestrator Class
export class SwarmOrchestrator extends EventEmitter {
  private agents = new Map<string, SwarmAgent>();
  private taskQueue = new TaskQueue();
  private performanceTracker = new AgentPerformanceTracker();
  private consensusManager = new ConsensusManager();
  private isProcessing = false;
  private maxConcurrentTasks = 5;
  private fallbackStrategies = new Map<TaskType, SwarmAgent[]>();

  constructor() {
    super();
    this.startTaskProcessor();
  }

  // Agent Registry Management
  registerAgent(agent: SwarmAgent): void {
    this.agents.set(agent.id, agent);
    this.emit('agentRegistered', agent);
    console.log(`Agent registered: ${agent.name} (${agent.id})`);
  }

  unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.agents.delete(agentId);
      this.emit('agentUnregistered', agent);
      console.log(`Agent unregistered: ${agent.name} (${agentId})`);
    }
  }

  getRegisteredAgents(): SwarmAgent[] {
    return Array.from(this.agents.values());
  }

  getAgent(agentId: string): SwarmAgent | null {
    return this.agents.get(agentId) || null;
  }

  // Task Execution
  async executeTask(task: SwarmTask): Promise<SwarmResult> {
    const startTime = performance.now();

    try {
      const agent = this.selectBestAgent(task);
      if (!agent) {
        throw new Error(`No suitable agent found for task type: ${task.type}`);
      }

      this.emit('taskStarted', { task, agent: agent.id });

      const result = await this.executeWithFallback(task, agent);
      const executionTime = performance.now() - startTime;

      // Update performance metrics
      this.performanceTracker.updateMetrics(agent.id, {
        ...result,
        executionTime
      });

      this.emit('taskCompleted', { task, result });
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorResult: SwarmResult = {
        taskId: task.id,
        agentId: 'system',
        success: false,
        output: null,
        quality: 0,
        executionTime: performance.now() - startTime,
        reasoning: `Task execution failed: ${errorMessage}`,
        metadata: { error: errorMessage }
      };

      this.emit('taskFailed', { task, error });
      return errorResult;
    }
  }

  // Task Queue Management
  queueTask(task: SwarmTask): void {
    this.taskQueue.enqueue(task);
    this.emit('taskQueued', task);
  }

  // Agent Selection with Performance-based Routing
  private selectBestAgent(task: SwarmTask): SwarmAgent | null {
    const candidates = Array.from(this.agents.values()).filter(agent => 
      agent.canHandle(task.type) && agent.isAvailable()
    );

    if (candidates.length === 0) {
      return null;
    }

    return candidates.reduce((best, current) => {
      const bestScore = this.calculateAgentScore(best, task);
      const currentScore = this.calculateAgentScore(current, task);
      return currentScore > bestScore ? current : best;
    });
  }

  private calculateAgentScore(agent: SwarmAgent, task: SwarmTask): number {
    const baseScore = agent.getScore(task);
    const metrics = this.performanceTracker.getMetrics(agent.id);
    
    if (!metrics) {
      return baseScore;
    }

    // Combine base score with performance metrics
    const performanceScore = (
      metrics.successRate * 0.4 +
      metrics.averageQuality * 0.3 +
      (metrics.expertise[task.type] || 0) * 0.3
    );

    return baseScore * 0.6 + performanceScore * 0.4;
  }

  // Execution with Fallback Strategies
  private async executeWithFallback(task: SwarmTask, primaryAgent: SwarmAgent): Promise<SwarmResult> {
    try {
      return await primaryAgent.execute(task);
    } catch (error) {
      console.warn(`Primary agent ${primaryAgent.id} failed, trying fallback strategies`);

      const fallbackAgents = this.fallbackStrategies.get(task.type) || [];
      for (const fallbackAgent of fallbackAgents) {
        if (fallbackAgent.isAvailable() && fallbackAgent.id !== primaryAgent.id) {
          try {
            return await fallbackAgent.execute(task);
          } catch (fallbackError) {
            console.warn(`Fallback agent ${fallbackAgent.id} also failed`);
          }
        }
      }

      throw error; // All fallbacks failed
    }
  }

  // Consensus-based Decision Making
  async requestConsensus(
    question: string,
    options: string[],
    context?: any
  ): Promise<ConsensusResult> {
    const request: ConsensusRequest = {
      id: `consensus_${Date.now()}`,
      question,
      options,
      requiredVotes: Math.min(3, this.agents.size),
      timeoutMs: 10000,
      context
    };

    return this.consensusManager.requestConsensus(request, this.getRegisteredAgents());
  }

  // Multi-Agent Coordination
  async coordinateMultiAgentTask(
    tasks: SwarmTask[],
    strategy: 'parallel' | 'sequential' | 'pipeline' = 'parallel'
  ): Promise<SwarmResult[]> {
    switch (strategy) {
      case 'parallel':
        return Promise.all(tasks.map(task => this.executeTask(task)));
      
      case 'sequential':
        const results: SwarmResult[] = [];
        for (const task of tasks) {
          const result = await this.executeTask(task);
          results.push(result);
          
          // Stop if any task fails and it's marked as critical
          if (!result.success && task.metadata?.critical) {
            break;
          }
        }
        return results;
      
      case 'pipeline':
        return this.executePipelineTasks(tasks);
      
      default:
        throw new Error(`Unknown coordination strategy: ${strategy}`);
    }
  }

  private async executePipelineTasks(tasks: SwarmTask[]): Promise<SwarmResult[]> {
    const results: SwarmResult[] = [];
    let context: any = {};

    for (const task of tasks) {
      // Add previous results to context
      const enhancedTask = {
        ...task,
        context: { ...task.context, pipelineResults: context }
      };

      const result = await this.executeTask(enhancedTask);
      results.push(result);
      
      // Add result to context for next task
      context[task.type] = result.output;

      if (!result.success) {
        break; // Pipeline stops on failure
      }
    }

    return results;
  }

  // Task Processing Loop
  private startTaskProcessor(): void {
    const processNext = async () => {
      if (this.isProcessing || this.taskQueue.isEmpty()) {
        setTimeout(processNext, 100);
        return;
      }

      const processingTasks = this.taskQueue.getProcessing();
      if (processingTasks.length >= this.maxConcurrentTasks) {
        setTimeout(processNext, 100);
        return;
      }

      this.isProcessing = true;
      const task = this.taskQueue.dequeue();
      
      if (task) {
        this.taskQueue.markProcessing(task.id, task);
        
        try {
          await this.executeTask(task);
        } finally {
          this.taskQueue.markComplete(task.id);
        }
      }

      this.isProcessing = false;
      setTimeout(processNext, 10); // Quick retry
    };

    processNext();
  }

  // Configuration Management
  setFallbackStrategy(taskType: TaskType, agents: SwarmAgent[]): void {
    this.fallbackStrategies.set(taskType, agents);
  }

  setMaxConcurrentTasks(max: number): void {
    this.maxConcurrentTasks = max;
  }

  // Performance Analytics
  getPerformanceMetrics(): Map<string, AgentMetrics> {
    return this.performanceTracker.getAllMetrics();
  }

  getSystemStatus(): {
    activeAgents: number;
    queuedTasks: number;
    processingTasks: number;
    totalTasksCompleted: number;
  } {
    const metrics = this.getPerformanceMetrics();
    const totalTasks = Array.from(metrics.values()).reduce(
      (sum, metric) => sum + metric.totalTasks, 0
    );

    return {
      activeAgents: this.agents.size,
      queuedTasks: this.taskQueue.size(),
      processingTasks: this.taskQueue.getProcessing().length,
      totalTasksCompleted: totalTasks
    };
  }

  // Lifecycle Management
  async shutdown(): Promise<void> {
    this.emit('shutdown');
    
    // Wait for current tasks to complete
    while (this.taskQueue.getProcessing().length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Cleanup agents
    for (const agent of this.agents.values()) {
      if (typeof (agent as any).shutdown === 'function') {
        await (agent as any).shutdown();
      }
    }

    this.agents.clear();
    console.log('SwarmOrchestrator shutdown complete');
  }
}

export default SwarmOrchestrator; 