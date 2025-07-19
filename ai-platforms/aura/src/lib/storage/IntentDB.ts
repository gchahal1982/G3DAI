import { Pool, PoolClient, QueryResult } from 'pg';
import { EventEmitter } from 'events';
import { createHash } from 'crypto';
import { performance } from 'perf_hooks';

// Types and interfaces
interface Intent {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'bug' | 'refactor' | 'test' | 'documentation' | 'architecture';
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  metadata: {
    userId: string;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
    estimatedHours?: number;
    actualHours?: number;
    complexity: 'simple' | 'medium' | 'complex';
    dependencies: string[];
  };
  content: {
    requirements: string;
    acceptanceCriteria: string[];
    technicalNotes?: string;
    businessRules?: string[];
    constraints?: string[];
  };
  version: number;
  parentId?: string;
  children: string[];
}

interface IntentVersion {
  intentId: string;
  version: number;
  changes: IntentChange[];
  timestamp: Date;
  userId: string;
  changeReason: string;
  checksum: string;
}

interface IntentChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'create' | 'update' | 'delete';
}

interface CodeLink {
  id: string;
  intentId: string;
  fileId: string;
  filePath: string;
  startLine: number;
  endLine: number;
  linkType: 'implements' | 'tests' | 'documents' | 'references';
  confidence: number;
  metadata: {
    createdAt: Date;
    createdBy: 'user' | 'ai';
    lastValidated: Date;
    isValid: boolean;
    language: string;
    functionName?: string;
    className?: string;
  };
}

interface IntentSearchQuery {
  text?: string;
  type?: Intent['type'];
  status?: Intent['status'];
  priority?: Intent['priority'];
  tags?: string[];
  userId?: string;
  projectId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasCodeLinks?: boolean;
  complexity?: Intent['metadata']['complexity'];
  limit?: number;
  offset?: number;
  sortBy?: 'created' | 'updated' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface IntentSearchResult {
  intents: Intent[];
  total: number;
  facets: {
    types: { [key: string]: number };
    statuses: { [key: string]: number };
    priorities: { [key: string]: number };
    tags: { [key: string]: number };
    complexities: { [key: string]: number };
  };
  searchMeta: {
    query: IntentSearchQuery;
    executionTime: number;
    searchId: string;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

// Task 1: Create PostgreSQL schema for intents
export class IntentDB extends EventEmitter {
  private pool: Pool;
  private isInitialized: boolean = false;
  private cache: Map<string, Intent> = new Map();
  private searchCache: Map<string, IntentSearchResult> = new Map();
  private syncQueue: Intent[] = [];

  constructor(config: IntentDBConfig) {
    super();
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: config.maxConnections || 20,
      idleTimeoutMillis: config.idleTimeoutMs || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMs || 2000,
    });

    this.pool.on('error', (err: Error) => {
      console.error('Database pool error:', err);
      this.emit('error', err);
    });
  }

  // Initialize database schema
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.createSchema();
      await this.createIndexes();
      await this.createTriggers();
      this.isInitialized = true;
      console.log('IntentDB initialized successfully');
      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize IntentDB:', error);
      throw error;
    }
  }

  // Task 1: Create database schema
  private async createSchema(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Main intents table
      await client.query(`
        CREATE TABLE IF NOT EXISTS intents (
          id VARCHAR(36) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          type VARCHAR(20) NOT NULL CHECK (type IN ('feature', 'bug', 'refactor', 'test', 'documentation', 'architecture')),
          status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'blocked')),
          priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
          tags TEXT[] DEFAULT '{}',
          user_id VARCHAR(36) NOT NULL,
          project_id VARCHAR(36) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          estimated_hours NUMERIC(8,2),
          actual_hours NUMERIC(8,2),
          complexity VARCHAR(10) DEFAULT 'medium' CHECK (complexity IN ('simple', 'medium', 'complex')),
          dependencies TEXT[] DEFAULT '{}',
          requirements TEXT NOT NULL,
          acceptance_criteria TEXT[] DEFAULT '{}',
          technical_notes TEXT,
          business_rules TEXT[],
          constraints TEXT[],
          version INTEGER DEFAULT 1,
          parent_id VARCHAR(36) REFERENCES intents(id),
          children TEXT[] DEFAULT '{}',
          search_vector tsvector,
          checksum VARCHAR(64)
        )
      `);

      // Task 3: Intent versioning table
      await client.query(`
        CREATE TABLE IF NOT EXISTS intent_versions (
          id SERIAL PRIMARY KEY,
          intent_id VARCHAR(36) NOT NULL REFERENCES intents(id) ON DELETE CASCADE,
          version INTEGER NOT NULL,
          changes JSONB NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          user_id VARCHAR(36) NOT NULL,
          change_reason TEXT,
          checksum VARCHAR(64) NOT NULL,
          UNIQUE(intent_id, version)
        )
      `);

      // Task 4: Code linking table
      await client.query(`
        CREATE TABLE IF NOT EXISTS intent_code_links (
          id VARCHAR(36) PRIMARY KEY,
          intent_id VARCHAR(36) NOT NULL REFERENCES intents(id) ON DELETE CASCADE,
          file_id VARCHAR(36),
          file_path TEXT NOT NULL,
          start_line INTEGER NOT NULL,
          end_line INTEGER NOT NULL,
          link_type VARCHAR(20) NOT NULL CHECK (link_type IN ('implements', 'tests', 'documents', 'references')),
          confidence NUMERIC(3,2) DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by VARCHAR(10) DEFAULT 'user' CHECK (created_by IN ('user', 'ai')),
          last_validated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_valid BOOLEAN DEFAULT true,
          language VARCHAR(50),
          function_name VARCHAR(255),
          class_name VARCHAR(255)
        )
      `);

      // Task 7: Intent history/audit table
      await client.query(`
        CREATE TABLE IF NOT EXISTS intent_history (
          id SERIAL PRIMARY KEY,
          intent_id VARCHAR(36) NOT NULL,
          action VARCHAR(20) NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'restored')),
          user_id VARCHAR(36) NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          details JSONB,
          ip_address INET,
          user_agent TEXT
        )
      `);

      // Task 8: Synchronization tracking table
      await client.query(`
        CREATE TABLE IF NOT EXISTS intent_sync_log (
          id SERIAL PRIMARY KEY,
          intent_id VARCHAR(36) NOT NULL,
          sync_type VARCHAR(20) NOT NULL CHECK (sync_type IN ('push', 'pull', 'conflict')),
          source VARCHAR(50) NOT NULL,
          destination VARCHAR(50) NOT NULL,
          status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          error_message TEXT,
          retry_count INTEGER DEFAULT 0
        )
      `);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Create database indexes
  private async createIndexes(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      // Primary indexes for performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_intents_user_project ON intents(user_id, project_id);
        CREATE INDEX IF NOT EXISTS idx_intents_status_priority ON intents(status, priority);
        CREATE INDEX IF NOT EXISTS idx_intents_type ON intents(type);
        CREATE INDEX IF NOT EXISTS idx_intents_created_at ON intents(created_at);
        CREATE INDEX IF NOT EXISTS idx_intents_updated_at ON intents(updated_at);
        CREATE INDEX IF NOT EXISTS idx_intents_tags ON intents USING GIN(tags);
        CREATE INDEX IF NOT EXISTS idx_intents_search_vector ON intents USING GIN(search_vector);
        CREATE INDEX IF NOT EXISTS idx_intents_parent_id ON intents(parent_id);
        
        CREATE INDEX IF NOT EXISTS idx_intent_versions_intent_id ON intent_versions(intent_id);
        CREATE INDEX IF NOT EXISTS idx_intent_versions_timestamp ON intent_versions(timestamp);
        
        CREATE INDEX IF NOT EXISTS idx_code_links_intent_id ON intent_code_links(intent_id);
        CREATE INDEX IF NOT EXISTS idx_code_links_file_path ON intent_code_links(file_path);
        CREATE INDEX IF NOT EXISTS idx_code_links_type ON intent_code_links(link_type);
        CREATE INDEX IF NOT EXISTS idx_code_links_valid ON intent_code_links(is_valid);
        
        CREATE INDEX IF NOT EXISTS idx_intent_history_intent_id ON intent_history(intent_id);
        CREATE INDEX IF NOT EXISTS idx_intent_history_timestamp ON intent_history(timestamp);
        CREATE INDEX IF NOT EXISTS idx_intent_history_action ON intent_history(action);
        
        CREATE INDEX IF NOT EXISTS idx_sync_log_intent_id ON intent_sync_log(intent_id);
        CREATE INDEX IF NOT EXISTS idx_sync_log_status ON intent_sync_log(status);
      `);
    } finally {
      client.release();
    }
  }

  // Create database triggers
  private async createTriggers(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      // Trigger to update search vector
      await client.query(`
        CREATE OR REPLACE FUNCTION update_intent_search_vector()
        RETURNS trigger AS $$
        BEGIN
          NEW.search_vector := to_tsvector('english', 
            COALESCE(NEW.title, '') || ' ' ||
            COALESCE(NEW.description, '') || ' ' ||
            COALESCE(NEW.requirements, '') || ' ' ||
            COALESCE(array_to_string(NEW.tags, ' '), '') || ' ' ||
            COALESCE(NEW.technical_notes, '')
          );
          NEW.updated_at := NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trigger_update_search_vector ON intents;
        CREATE TRIGGER trigger_update_search_vector
          BEFORE INSERT OR UPDATE ON intents
          FOR EACH ROW EXECUTE FUNCTION update_intent_search_vector();
      `);

      // Trigger to create version history
      await client.query(`
        CREATE OR REPLACE FUNCTION create_intent_version()
        RETURNS trigger AS $$
        BEGIN
          IF TG_OP = 'UPDATE' THEN
            INSERT INTO intent_versions (intent_id, version, changes, user_id, checksum)
            VALUES (
              NEW.id,
              NEW.version,
              jsonb_build_object(
                'old', row_to_json(OLD),
                'new', row_to_json(NEW)
              ),
              NEW.user_id,
              NEW.checksum
            );
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trigger_create_version ON intents;
        CREATE TRIGGER trigger_create_version
          AFTER UPDATE ON intents
          FOR EACH ROW EXECUTE FUNCTION create_intent_version();
      `);
    } finally {
      client.release();
    }
  }

  // Task 2: Implement intent CRUD operations
  public async createIntent(intent: Omit<Intent, 'id' | 'version'>): Promise<Intent> {
    const id = this.generateId();
    const checksum = this.calculateChecksum(intent);
    
    const fullIntent: Intent = {
      ...intent,
      id,
      version: 1,
      children: intent.children || []
    };

    // Task 6: Add intent validation
    const validation = await this.validateIntent(fullIntent);
    if (!validation.isValid) {
      throw new Error(`Intent validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO intents (
          id, title, description, type, status, priority, tags,
          user_id, project_id, estimated_hours, actual_hours, complexity, dependencies,
          requirements, acceptance_criteria, technical_notes, business_rules, constraints,
          parent_id, children, checksum
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING *
      `;

      const values = [
        id, intent.title, intent.description, intent.type, intent.status, intent.priority, intent.tags,
        intent.metadata.userId, intent.metadata.projectId, intent.metadata.estimatedHours, 
        intent.metadata.actualHours, intent.metadata.complexity, intent.metadata.dependencies,
        intent.content.requirements, intent.content.acceptanceCriteria, intent.content.technicalNotes,
        intent.content.businessRules, intent.content.constraints, intent.parentId, intent.children, checksum
      ];

      const result = await client.query(query, values);
      const createdIntent = this.mapRowToIntent(result.rows[0]);

      // Task 7: Create history entry
      await this.addHistoryEntry(client, id, 'created', intent.metadata.userId, {
        intent: createdIntent
      });

      await client.query('COMMIT');

      // Update cache
      this.cache.set(id, createdIntent);
      this.invalidateSearchCache();

      this.emit('intent_created', createdIntent);
      return createdIntent;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async getIntent(id: string): Promise<Intent | null> {
    // Check cache first
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    const query = 'SELECT * FROM intents WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const intent = this.mapRowToIntent(result.rows[0]);
    this.cache.set(id, intent);
    return intent;
  }

  public async updateIntent(id: string, updates: Partial<Intent>, userId: string): Promise<Intent> {
    const existingIntent = await this.getIntent(id);
    if (!existingIntent) {
      throw new Error(`Intent ${id} not found`);
    }

    const updatedIntent: Intent = {
      ...existingIntent,
      ...updates,
      version: existingIntent.version + 1,
      metadata: {
        ...existingIntent.metadata,
        ...updates.metadata,
        updatedAt: new Date()
      }
    };

    // Task 6: Validate updated intent
    const validation = await this.validateIntent(updatedIntent);
    if (!validation.isValid) {
      throw new Error(`Intent validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const checksum = this.calculateChecksum(updatedIntent);
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const query = `
        UPDATE intents SET
          title = $2, description = $3, type = $4, status = $5, priority = $6, tags = $7,
          estimated_hours = $8, actual_hours = $9, complexity = $10, dependencies = $11,
          requirements = $12, acceptance_criteria = $13, technical_notes = $14,
          business_rules = $15, constraints = $16, version = $17, children = $18, checksum = $19
        WHERE id = $1
        RETURNING *
      `;

      const values = [
        id, updatedIntent.title, updatedIntent.description, updatedIntent.type,
        updatedIntent.status, updatedIntent.priority, updatedIntent.tags,
        updatedIntent.metadata.estimatedHours, updatedIntent.metadata.actualHours,
        updatedIntent.metadata.complexity, updatedIntent.metadata.dependencies,
        updatedIntent.content.requirements, updatedIntent.content.acceptanceCriteria,
        updatedIntent.content.technicalNotes, updatedIntent.content.businessRules,
        updatedIntent.content.constraints, updatedIntent.version, updatedIntent.children, checksum
      ];

      const result = await client.query(query, values);
      const intent = this.mapRowToIntent(result.rows[0]);

      // Task 7: Create history entry
      await this.addHistoryEntry(client, id, 'updated', userId, {
        changes: this.calculateChanges(existingIntent, updatedIntent),
        oldVersion: existingIntent.version,
        newVersion: updatedIntent.version
      });

      await client.query('COMMIT');

      // Update cache
      this.cache.set(id, intent);
      this.invalidateSearchCache();

      this.emit('intent_updated', intent, existingIntent);
      return intent;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async deleteIntent(id: string, userId: string): Promise<boolean> {
    const intent = await this.getIntent(id);
    if (!intent) {
      return false;
    }

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Delete related code links
      await client.query('DELETE FROM intent_code_links WHERE intent_id = $1', [id]);

      // Delete the intent
      const result = await client.query('DELETE FROM intents WHERE id = $1', [id]);

      // Task 7: Create history entry
      await this.addHistoryEntry(client, id, 'deleted', userId, {
        deletedIntent: intent
      });

      await client.query('COMMIT');

      // Remove from cache
      this.cache.delete(id);
      this.invalidateSearchCache();

      this.emit('intent_deleted', intent);
      return (result.rowCount || 0) > 0;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Task 5: Implement intent search functionality
  public async searchIntents(query: IntentSearchQuery): Promise<IntentSearchResult> {
    const searchId = this.generateSearchId(query);
    const startTime = performance.now();

    // Check search cache
    if (this.searchCache.has(searchId)) {
      const cached = this.searchCache.get(searchId)!;
      cached.searchMeta.executionTime = performance.now() - startTime;
      return cached;
    }

    let sql = `
      SELECT i.*, COUNT(*) OVER() as total_count
      FROM intents i
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    // Text search
    if (query.text) {
      sql += ` AND i.search_vector @@ plainto_tsquery('english', $${paramIndex})`;
      params.push(query.text);
      paramIndex++;
    }

    // Filter by type
    if (query.type) {
      sql += ` AND i.type = $${paramIndex}`;
      params.push(query.type);
      paramIndex++;
    }

    // Filter by status
    if (query.status) {
      sql += ` AND i.status = $${paramIndex}`;
      params.push(query.status);
      paramIndex++;
    }

    // Filter by priority
    if (query.priority) {
      sql += ` AND i.priority = $${paramIndex}`;
      params.push(query.priority);
      paramIndex++;
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      sql += ` AND i.tags && $${paramIndex}`;
      params.push(query.tags);
      paramIndex++;
    }

    // Filter by user
    if (query.userId) {
      sql += ` AND i.user_id = $${paramIndex}`;
      params.push(query.userId);
      paramIndex++;
    }

    // Filter by project
    if (query.projectId) {
      sql += ` AND i.project_id = $${paramIndex}`;
      params.push(query.projectId);
      paramIndex++;
    }

    // Filter by date range
    if (query.dateRange) {
      sql += ` AND i.created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(query.dateRange.start, query.dateRange.end);
      paramIndex += 2;
    }

    // Filter by complexity
    if (query.complexity) {
      sql += ` AND i.complexity = $${paramIndex}`;
      params.push(query.complexity);
      paramIndex++;
    }

    // Filter by code links
    if (query.hasCodeLinks !== undefined) {
      if (query.hasCodeLinks) {
        sql += ` AND EXISTS (SELECT 1 FROM intent_code_links icl WHERE icl.intent_id = i.id)`;
      } else {
        sql += ` AND NOT EXISTS (SELECT 1 FROM intent_code_links icl WHERE icl.intent_id = i.id)`;
      }
    }

    // Sorting
    const sortBy = query.sortBy || 'updated';
    const sortOrder = query.sortOrder || 'desc';
    const sortColumn = {
      'created': 'i.created_at',
      'updated': 'i.updated_at',
      'priority': 'i.priority',
      'title': 'i.title'
    }[sortBy];

    sql += ` ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`;

    // Pagination
    const limit = query.limit || 50;
    const offset = query.offset || 0;
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await this.pool.query(sql, params);
    const intents = result.rows.map((row: any) => this.mapRowToIntent(row));
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    // Calculate facets
    const facets = await this.calculateSearchFacets(query);

    const searchResult: IntentSearchResult = {
      intents,
      total,
      facets,
      searchMeta: {
        query,
        executionTime: performance.now() - startTime,
        searchId
      }
    };

    // Cache result
    this.searchCache.set(searchId, searchResult);
    
    // Clean cache if it gets too large
    if (this.searchCache.size > 100) {
      const firstKey = this.searchCache.keys().next().value;
      if (firstKey) {
        this.searchCache.delete(firstKey);
      }
    }

    return searchResult;
  }

  // Calculate search facets
  private async calculateSearchFacets(query: IntentSearchQuery): Promise<IntentSearchResult['facets']> {
    const facetQueries = [
      'SELECT type, COUNT(*) as count FROM intents GROUP BY type',
      'SELECT status, COUNT(*) as count FROM intents GROUP BY status',
      'SELECT priority, COUNT(*) as count FROM intents GROUP BY priority',
      'SELECT complexity, COUNT(*) as count FROM intents GROUP BY complexity',
      'SELECT UNNEST(tags) as tag, COUNT(*) as count FROM intents GROUP BY tag ORDER BY count DESC LIMIT 20'
    ];

    const results = await Promise.all(facetQueries.map(q => this.pool.query(q)));

    return {
      types: Object.fromEntries(results[0].rows.map((r: any) => [r.type, parseInt(r.count)])),
      statuses: Object.fromEntries(results[1].rows.map((r: any) => [r.status, parseInt(r.count)])),
      priorities: Object.fromEntries(results[2].rows.map((r: any) => [r.priority, parseInt(r.count)])),
      complexities: Object.fromEntries(results[3].rows.map((r: any) => [r.complexity, parseInt(r.count)])),
      tags: Object.fromEntries(results[4].rows.map((r: any) => [r.tag, parseInt(r.count)]))
    };
  }

  // Task 4: Code linking methods
  public async createCodeLink(link: Omit<CodeLink, 'id'>): Promise<CodeLink> {
    const id = this.generateId();
    const fullLink: CodeLink = { ...link, id };

    const query = `
      INSERT INTO intent_code_links (
        id, intent_id, file_id, file_path, start_line, end_line, link_type, confidence,
        created_by, language, function_name, class_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      id, link.intentId, link.fileId, link.filePath, link.startLine, link.endLine,
      link.linkType, link.confidence, link.metadata.createdBy, link.metadata.language,
      link.metadata.functionName, link.metadata.className
    ];

    const result = await this.pool.query(query, values);
    const createdLink = this.mapRowToCodeLink(result.rows[0]);

    this.emit('code_link_created', createdLink);
    return createdLink;
  }

  public async getCodeLinks(intentId: string): Promise<CodeLink[]> {
    const query = 'SELECT * FROM intent_code_links WHERE intent_id = $1 ORDER BY created_at';
    const result = await this.pool.query(query, [intentId]);
    return result.rows.map((row: any) => this.mapRowToCodeLink(row));
  }

  public async validateCodeLinks(intentId: string): Promise<CodeLink[]> {
    const links = await this.getCodeLinks(intentId);
    const validatedLinks: CodeLink[] = [];

    for (const link of links) {
      // Mock validation - in real implementation, would check if file/lines still exist
      const isValid = Math.random() > 0.1; // 90% validity rate
      
      if (link.metadata.isValid !== isValid) {
        await this.pool.query(
          'UPDATE intent_code_links SET is_valid = $1, last_validated = NOW() WHERE id = $2',
          [isValid, link.id]
        );
        
        link.metadata.isValid = isValid;
        link.metadata.lastValidated = new Date();
      }

      validatedLinks.push(link);
    }

    return validatedLinks;
  }

  // Task 3: Intent versioning methods
  public async getIntentVersions(intentId: string): Promise<IntentVersion[]> {
    const query = `
      SELECT * FROM intent_versions 
      WHERE intent_id = $1 
      ORDER BY version DESC
    `;
    
    const result = await this.pool.query(query, [intentId]);
    return result.rows.map((row: any) => ({
      intentId: row.intent_id,
      version: row.version,
      changes: row.changes,
      timestamp: row.timestamp,
      userId: row.user_id,
      changeReason: row.change_reason,
      checksum: row.checksum
    }));
  }

  public async getIntentAtVersion(intentId: string, version: number): Promise<Intent | null> {
    // This would require reconstructing the intent from version history
    // For now, return current version if requested version matches
    const intent = await this.getIntent(intentId);
    if (intent && intent.version === version) {
      return intent;
    }
    return null;
  }

  // Task 6: Intent validation
  public async validateIntent(intent: Intent): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required field validation
    if (!intent.title || intent.title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: 'Title is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    if (!intent.description || intent.description.trim().length === 0) {
      errors.push({
        field: 'description',
        message: 'Description is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    if (!intent.content.requirements || intent.content.requirements.trim().length === 0) {
      errors.push({
        field: 'content.requirements',
        message: 'Requirements are required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    // Length validation
    if (intent.title && intent.title.length > 255) {
      errors.push({
        field: 'title',
        message: 'Title must be 255 characters or less',
        code: 'MAX_LENGTH',
        severity: 'error'
      });
    }

    // Business logic validation
    if (intent.status === 'completed' && intent.metadata.actualHours === undefined) {
      warnings.push({
        field: 'metadata.actualHours',
        message: 'Actual hours should be recorded for completed intents',
        suggestion: 'Add actual hours spent on this intent'
      });
    }

    if (intent.content.acceptanceCriteria.length === 0) {
      warnings.push({
        field: 'content.acceptanceCriteria',
        message: 'No acceptance criteria defined',
        suggestion: 'Add acceptance criteria to make requirements clearer'
      });
    }

    // Circular dependency check
    if (intent.parentId && intent.children.includes(intent.parentId)) {
      errors.push({
        field: 'parentId',
        message: 'Circular dependency detected',
        code: 'CIRCULAR_DEPENDENCY',
        severity: 'error'
      });
    }

    const score = Math.max(0, 100 - (errors.length * 25) - (warnings.length * 5));

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  // Task 7: Intent history methods
  private async addHistoryEntry(
    client: PoolClient,
    intentId: string,
    action: string,
    userId: string,
    details: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const query = `
      INSERT INTO intent_history (intent_id, action, user_id, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    await client.query(query, [intentId, action, userId, JSON.stringify(details), ipAddress, userAgent]);
  }

  public async getIntentHistory(intentId: string, limit: number = 50): Promise<any[]> {
    const query = `
      SELECT * FROM intent_history 
      WHERE intent_id = $1 
      ORDER BY timestamp DESC 
      LIMIT $2
    `;
    
    const result = await this.pool.query(query, [intentId, limit]);
    return result.rows;
  }

  // Task 8: Intent synchronization
  public async synchronizeIntents(source: string, destination: string): Promise<void> {
    // Add intents to sync queue
    const pendingIntents = Array.from(this.cache.values());
    this.syncQueue.push(...pendingIntents);

    for (const intent of this.syncQueue) {
      try {
        await this.syncIntent(intent, source, destination);
        
        // Remove from queue on success
        const index = this.syncQueue.indexOf(intent);
        if (index > -1) {
          this.syncQueue.splice(index, 1);
        }
        
      } catch (error) {
        console.error(`Failed to sync intent ${intent.id}:`, error);
        
        // Log sync failure
        await this.pool.query(`
          INSERT INTO intent_sync_log (intent_id, sync_type, source, destination, status, error_message)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [intent.id, 'push', source, destination, 'failed', (error as Error).message]);
      }
    }

    this.emit('sync_completed', { source, destination, synced: pendingIntents.length });
  }

  private async syncIntent(intent: Intent, source: string, destination: string): Promise<void> {
    // Mock synchronization - in real implementation would call external APIs
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Log successful sync
    await this.pool.query(`
      INSERT INTO intent_sync_log (intent_id, sync_type, source, destination, status)
      VALUES ($1, $2, $3, $4, $5)
    `, [intent.id, 'push', source, destination, 'completed']);
  }

  // Utility methods
  private mapRowToIntent(row: any): Intent {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      status: row.status,
      priority: row.priority,
      tags: row.tags || [],
      metadata: {
        userId: row.user_id,
        projectId: row.project_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        estimatedHours: row.estimated_hours,
        actualHours: row.actual_hours,
        complexity: row.complexity,
        dependencies: row.dependencies || []
      },
      content: {
        requirements: row.requirements,
        acceptanceCriteria: row.acceptance_criteria || [],
        technicalNotes: row.technical_notes,
        businessRules: row.business_rules,
        constraints: row.constraints
      },
      version: row.version,
      parentId: row.parent_id,
      children: row.children || []
    };
  }

  private mapRowToCodeLink(row: any): CodeLink {
    return {
      id: row.id,
      intentId: row.intent_id,
      fileId: row.file_id,
      filePath: row.file_path,
      startLine: row.start_line,
      endLine: row.end_line,
      linkType: row.link_type,
      confidence: parseFloat(row.confidence),
      metadata: {
        createdAt: row.created_at,
        createdBy: row.created_by,
        lastValidated: row.last_validated,
        isValid: row.is_valid,
        language: row.language,
        functionName: row.function_name,
        className: row.class_name
      }
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private generateSearchId(query: IntentSearchQuery): string {
    return createHash('md5').update(JSON.stringify(query)).digest('hex');
  }

  private calculateChecksum(intent: Partial<Intent>): string {
    const data = JSON.stringify({
      title: intent.title,
      description: intent.description,
      content: intent.content,
      type: intent.type,
      priority: intent.priority
    });
    return createHash('sha256').update(data).digest('hex');
  }

  private calculateChanges(oldIntent: Intent, newIntent: Intent): IntentChange[] {
    const changes: IntentChange[] = [];
    
    // Compare key fields
    const fields = ['title', 'description', 'type', 'status', 'priority'];
    for (const field of fields) {
      if (oldIntent[field as keyof Intent] !== newIntent[field as keyof Intent]) {
        changes.push({
          field,
          oldValue: oldIntent[field as keyof Intent],
          newValue: newIntent[field as keyof Intent],
          changeType: 'update'
        });
      }
    }

    return changes;
  }

  private invalidateSearchCache(): void {
    this.searchCache.clear();
  }

  // Cleanup and shutdown
  public async shutdown(): Promise<void> {
    console.log('IntentDB shutting down...');
    await this.pool.end();
    this.cache.clear();
    this.searchCache.clear();
    console.log('IntentDB shutdown complete');
  }
}

// Configuration interface
interface IntentDBConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  maxConnections?: number;
  idleTimeoutMs?: number;
  connectionTimeoutMs?: number;
}

export type {
  Intent,
  IntentVersion,
  CodeLink,
  IntentSearchQuery,
  IntentSearchResult,
  ValidationResult,
  IntentDBConfig
};

export default IntentDB; 