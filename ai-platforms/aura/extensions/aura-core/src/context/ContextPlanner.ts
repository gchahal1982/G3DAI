import { EventEmitter } from 'events';

/**
 * ContextPlanner - Event classification and intent planning
 * 
 * Hooks into IDE event buses (file open, edit, save) and CLI event buses 
 * (command execution, git operations) to classify events into intent labels
 * and manage context request queueing.
 */

export interface IDEEvent {
  type: 'file_open' | 'file_edit' | 'file_save' | 'selection_change' | 'cursor_move';
  file?: string;
  content?: string;
  selection?: { start: number; end: number };
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface CLIEvent {
  type: 'command_execution' | 'git_operation' | 'build_start' | 'build_end' | 'test_run';
  command?: string;
  cwd?: string;
  output?: string;
  exitCode?: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface Intent {
  id: string;
  label: 'code_completion' | 'refactoring' | 'debugging' | 'documentation' | 'testing' | 'architecture_review';
  priority: number; // 1-10, higher = more urgent
  context: string[];
  confidence: number; // 0-1
  timestamp: number;
  events: (IDEEvent | CLIEvent)[];
}

export interface ContextRequest {
  id: string;
  intent: Intent;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  timestamp: number;
  tokenBudget: number;
  retrievedChunks?: string[];
}

export class ContextPlanner extends EventEmitter {
  private eventBuffer: (IDEEvent | CLIEvent)[] = [];
  private intentQueue: Intent[] = [];
  private contextQueue: ContextRequest[] = [];
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_MS = 150; // Event debouncing for performance
  private readonly MAX_BUFFER_SIZE = 100;

  constructor() {
    super();
    this.setupEventListeners();
  }

  /**
   * Hook into IDE event buses
   */
  private setupEventListeners(): void {
    // IDE event bus integration would be implemented here
    // This is a placeholder for the actual IDE integration
    this.on('ide_event', this.handleIDEEvent.bind(this));
    this.on('cli_event', this.handleCLIEvent.bind(this));
  }

  /**
   * Handle IDE events (file open, edit, save, etc.)
   */
  public handleIDEEvent(event: IDEEvent): void {
    this.eventBuffer.push(event);
    this.trimEventBuffer();
    this.debounceEventProcessing();
  }

  /**
   * Handle CLI events (command execution, git operations, etc.)
   */
  public handleCLIEvent(event: CLIEvent): void {
    this.eventBuffer.push(event);
    this.trimEventBuffer();
    this.debounceEventProcessing();
  }

  /**
   * Debounce event processing for performance
   */
  private debounceEventProcessing(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.processEventBuffer();
    }, this.DEBOUNCE_MS);
  }

  /**
   * Process accumulated events and classify into intents
   */
  private processEventBuffer(): void {
    if (this.eventBuffer.length === 0) return;

    const intents = this.classifyEventsToIntents(this.eventBuffer);
    
    for (const intent of intents) {
      this.addIntent(intent);
    }

    // Clear processed events
    this.eventBuffer = [];
  }

  /**
   * Classify events into intent labels using heuristics and patterns
   */
  private classifyEventsToIntents(events: (IDEEvent | CLIEvent)[]): Intent[] {
    const intents: Intent[] = [];
    const recentEvents = events.slice(-10); // Consider last 10 events

    // Code completion intent detection
    const hasRecentEdit = recentEvents.some(e => e.type === 'file_edit');
    const hasCursorMove = recentEvents.some(e => e.type === 'cursor_move');
    
    if (hasRecentEdit && hasCursorMove) {
      intents.push({
        id: this.generateIntentId(),
        label: 'code_completion',
        priority: 8,
        context: this.extractRelevantContext(events, 'code_completion'),
        confidence: 0.85,
        timestamp: Date.now(),
        events: recentEvents
      });
    }

    // Refactoring intent detection
    const hasMultipleFileEdits = recentEvents.filter(e => e.type === 'file_edit').length > 2;
    const hasFileOpen = recentEvents.some(e => e.type === 'file_open');
    
    if (hasMultipleFileEdits && hasFileOpen) {
      intents.push({
        id: this.generateIntentId(),
        label: 'refactoring',
        priority: 6,
        context: this.extractRelevantContext(events, 'refactoring'),
        confidence: 0.75,
        timestamp: Date.now(),
        events: recentEvents
      });
    }

    // Testing intent detection
    const hasTestCommand = recentEvents.some(e => 
      e.type === 'command_execution' && 
      (e as CLIEvent).command?.includes('test')
    );
    
    if (hasTestCommand) {
      intents.push({
        id: this.generateIntentId(),
        label: 'testing',
        priority: 7,
        context: this.extractRelevantContext(events, 'testing'),
        confidence: 0.9,
        timestamp: Date.now(),
        events: recentEvents
      });
    }

    // Architecture review intent detection
    const hasGitDiff = recentEvents.some(e => 
      e.type === 'git_operation' && 
      (e as CLIEvent).command?.includes('diff')
    );
    
    if (hasGitDiff && hasMultipleFileEdits) {
      intents.push({
        id: this.generateIntentId(),
        label: 'architecture_review',
        priority: 5,
        context: this.extractRelevantContext(events, 'architecture_review'),
        confidence: 0.7,
        timestamp: Date.now(),
        events: recentEvents
      });
    }

    return intents;
  }

  /**
   * Extract relevant context based on intent type
   */
  private extractRelevantContext(events: (IDEEvent | CLIEvent)[], intentType: Intent['label']): string[] {
    const context: string[] = [];

    for (const event of events) {
      if (event.type === 'file_open' || event.type === 'file_edit') {
        const ideEvent = event as IDEEvent;
        if (ideEvent.file) {
          context.push(ideEvent.file);
        }
      }
      
      if (event.type === 'command_execution') {
        const cliEvent = event as CLIEvent;
        if (cliEvent.cwd) {
          context.push(cliEvent.cwd);
        }
      }
    }

    // Remove duplicates and limit context size
    return [...new Set(context)].slice(0, 10);
  }

  /**
   * Add intent to queue with priority scoring
   */
  private addIntent(intent: Intent): void {
    // Calculate priority score based on recency and confidence
    const recencyFactor = Math.max(0, 1 - (Date.now() - intent.timestamp) / 60000); // Decay over 1 minute
    const priorityScore = intent.priority * intent.confidence * (1 + recencyFactor);
    
    intent.priority = Math.round(priorityScore);
    
    this.intentQueue.push(intent);
    this.intentQueue.sort((a, b) => b.priority - a.priority);
    
    // Limit queue size
    if (this.intentQueue.length > 50) {
      this.intentQueue = this.intentQueue.slice(0, 50);
    }

    this.emit('intent_added', intent);
  }

  /**
   * Create context request from intent
   */
  public createContextRequest(intent: Intent, tokenBudget: number = 4000): ContextRequest {
    const request: ContextRequest = {
      id: this.generateRequestId(),
      intent,
      status: 'queued',
      timestamp: Date.now(),
      tokenBudget
    };

    this.contextQueue.push(request);
    this.emit('context_request_created', request);
    
    return request;
  }

  /**
   * Get next context request for processing
   */
  public getNextContextRequest(): ContextRequest | null {
    const request = this.contextQueue.find(r => r.status === 'queued');
    if (request) {
      request.status = 'processing';
    }
    return request || null;
  }

  /**
   * Mark context request as completed
   */
  public completeContextRequest(requestId: string, retrievedChunks: string[]): void {
    const request = this.contextQueue.find(r => r.id === requestId);
    if (request) {
      request.status = 'completed';
      request.retrievedChunks = retrievedChunks;
      this.emit('context_request_completed', request);
    }
  }

  /**
   * Mark context request as failed
   */
  public failContextRequest(requestId: string, error: Error): void {
    const request = this.contextQueue.find(r => r.id === requestId);
    if (request) {
      request.status = 'failed';
      this.emit('context_request_failed', request, error);
    }
  }

  /**
   * Get current intent queue
   */
  public getIntentQueue(): Intent[] {
    return [...this.intentQueue];
  }

  /**
   * Get context request queue
   */
  public getContextQueue(): ContextRequest[] {
    return [...this.contextQueue];
  }

  /**
   * Get analytics data
   */
  public getAnalytics(): {
    totalIntents: number;
    intentsByType: Record<string, number>;
    averageConfidence: number;
    queueLength: number;
  } {
    const intentsByType: Record<string, number> = {};
    let totalConfidence = 0;

    for (const intent of this.intentQueue) {
      intentsByType[intent.label] = (intentsByType[intent.label] || 0) + 1;
      totalConfidence += intent.confidence;
    }

    return {
      totalIntents: this.intentQueue.length,
      intentsByType,
      averageConfidence: this.intentQueue.length > 0 ? totalConfidence / this.intentQueue.length : 0,
      queueLength: this.contextQueue.length
    };
  }

  /**
   * Clear old intents and requests
   */
  public cleanup(): void {
    const cutoff = Date.now() - 300000; // 5 minutes ago
    
    this.intentQueue = this.intentQueue.filter(intent => intent.timestamp > cutoff);
    this.contextQueue = this.contextQueue.filter(request => 
      request.timestamp > cutoff || request.status === 'processing'
    );
  }

  /**
   * Utility methods
   */
  private trimEventBuffer(): void {
    if (this.eventBuffer.length > this.MAX_BUFFER_SIZE) {
      this.eventBuffer = this.eventBuffer.slice(-this.MAX_BUFFER_SIZE);
    }
  }

  private generateIntentId(): string {
    return `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default ContextPlanner; 