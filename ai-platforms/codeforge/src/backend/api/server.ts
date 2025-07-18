import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer, Server } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSchema } from 'graphql';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { body, query, param, validationResult } from 'express-validator';
import morgan from 'morgan';
import winston from 'winston';
import prometheus from 'prom-client';
import { createProxyMiddleware } from 'http-proxy-middleware';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

// Types and interfaces
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organization?: string;
    permissions: string[];
  };
  requestId: string;
  startTime: number;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    requestId: string;
    timestamp: string;
    version: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

interface ServerConfig {
  port: number;
  host: string;
  environment: 'development' | 'staging' | 'production';
  corsOrigins: string[];
  jwtSecret: string;
  rateLimits: {
    general: RateLimitConfig;
    auth: RateLimitConfig;
    api: RateLimitConfig;
  };
  monitoring: {
    enabled: boolean;
    prometheusPath: string;
    healthCheckPath: string;
  };
}

// Task 8: Implement request logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'codeforge-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Prometheus metrics
const register = new prometheus.Registry();
prometheus.collectDefaultMetrics({ register });

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new prometheus.Gauge({
  name: 'websocket_active_connections',
  help: 'Number of active WebSocket connections'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);

// Task 1: Initialize Node.js REST API server
export class CodeForgeAPIServer {
  private app: Express;
  private server: Server;
  private apolloServer: ApolloServer;
  private config: ServerConfig;
  private wsServer?: WebSocket.Server;

  constructor(config: ServerConfig) {
    this.config = config;
    this.app = express();
    this.server = createServer(this.app);
    
    this.setupMiddleware();
    this.setupAuthentication();
    this.setupRateLimit();
    this.setupGraphQL();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupErrorHandling();
  }

  // Task 1: Setup basic middleware
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "wss:", "ws:"],
          fontSrc: ["'self'"]
        }
      }
    }));

    // Compression middleware
    this.app.use(compression());

    // Task 6: Add CORS configuration
    this.app.use(cors({
      origin: this.config.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Version'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-Request-ID']
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request ID middleware
    this.app.use((req: AuthenticatedRequest, res, next) => {
      req.requestId = uuidv4();
      req.startTime = Date.now();
      res.setHeader('X-Request-ID', req.requestId);
      next();
    });

    // Task 8: Request logging with Morgan
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }));

    // Metrics middleware
    this.app.use((req: AuthenticatedRequest, res, next) => {
      const end = httpRequestDuration.startTimer({
        method: req.method,
        route: req.route?.path || req.path
      });

      res.on('finish', () => {
        end({ status_code: res.statusCode });
        httpRequestTotal.inc({
          method: req.method,
          route: req.route?.path || req.path,
          status_code: res.statusCode
        });

        logger.info('HTTP Request', {
          requestId: req.requestId,
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: Date.now() - req.startTime,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          userId: req.user?.id
        });
      });

      next();
    });
  }

  // Task 5: Implement authentication middleware
  private setupAuthentication(): void {
    // JWT verification middleware
    const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json(this.formatResponse(false, null, 'Access token required'));
      }

      jwt.verify(token, this.config.jwtSecret, (err: any, decoded: any) => {
        if (err) {
          logger.warn('Invalid token attempt', { 
            requestId: req.requestId, 
            error: err.message,
            ip: req.ip 
          });
          return res.status(403).json(this.formatResponse(false, null, 'Invalid or expired token'));
        }

        req.user = decoded as AuthenticatedRequest['user'];
        logger.debug('User authenticated', { 
          requestId: req.requestId, 
          userId: req.user?.id,
          role: req.user?.role 
        });
        next();
      });
    };

    // Optional authentication middleware
    const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        jwt.verify(token, this.config.jwtSecret, (err: any, decoded: any) => {
          if (!err) {
            req.user = decoded as AuthenticatedRequest['user'];
          }
        });
      }
      next();
    };

    // Store middleware for later use
    this.app.set('authenticateToken', authenticateToken);
    this.app.set('optionalAuth', optionalAuth);
  }

  // Task 4: Create rate limiting with 99.5% SLO
  private setupRateLimit(): void {
    // General rate limiting
    const generalLimiter = rateLimit(this.config.rateLimits.general);
    
    // Authentication rate limiting (stricter)
    const authLimiter = rateLimit(this.config.rateLimits.auth);
    
    // API rate limiting (per user)
    const apiLimiter = rateLimit({
      ...this.config.rateLimits.api,
      keyGenerator: (req: AuthenticatedRequest) => {
        return req.user?.id || req.ip;
      },
      skip: (req: AuthenticatedRequest) => {
        // Skip rate limiting for premium users
        return req.user?.role === 'premium' || req.user?.role === 'enterprise';
      }
    });

    // Apply rate limiters
    this.app.use('/api/', generalLimiter);
    this.app.use('/auth/', authLimiter);
    this.app.use('/api/', apiLimiter);

    // Rate limit exceeded handler
    this.app.use((err: any, req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (err.name === 'RateLimitError') {
        logger.warn('Rate limit exceeded', {
          requestId: req.requestId,
          ip: req.ip,
          userId: req.user?.id,
          endpoint: req.path
        });
        
        return res.status(429).json(this.formatResponse(
          false,
          null,
          'Rate limit exceeded. Please try again later.',
          {
            retryAfter: err.retryAfter,
            limit: err.limit,
            remaining: err.remaining
          }
        ));
      }
      next(err);
    });
  }

  // Task 2: Implement GraphQL endpoint
  private async setupGraphQL(): Promise<void> {
    const typeDefs = `
      type Query {
        user(id: ID!): User
        models: [AIModel!]!
        completions(input: CompletionInput!): [Completion!]!
        projects: [Project!]!
        analytics(timeframe: String!): Analytics
      }

      type Mutation {
        generateCode(input: CodeGenerationInput!): CodeGenerationResult!
        saveProject(input: ProjectInput!): Project!
        updateSettings(input: SettingsInput!): Settings!
        createCompletion(input: CompletionInput!): Completion!
      }

      type Subscription {
        completionProgress(sessionId: String!): CompletionProgress!
        modelStatus: ModelStatus!
        systemHealth: SystemHealth!
      }

      type User {
        id: ID!
        email: String!
        role: String!
        organization: String
        settings: Settings
        usage: UsageStats
      }

      type AIModel {
        id: ID!
        name: String!
        provider: String!
        status: ModelStatus!
        capabilities: [String!]!
        contextWindow: Int!
        costPerToken: Float
        latency: Float!
      }

      type Completion {
        id: ID!
        text: String!
        confidence: Float!
        model: String!
        timestamp: String!
        usage: TokenUsage!
      }

      type Project {
        id: ID!
        name: String!
        description: String
        files: [ProjectFile!]!
        settings: ProjectSettings
        createdAt: String!
        updatedAt: String!
      }

      type Analytics {
        requests: Int!
        latency: Float!
        errorRate: Float!
        costToday: Float!
        tokensUsed: Int!
      }

      input CompletionInput {
        prompt: String!
        model: String
        temperature: Float
        maxTokens: Int
        stream: Boolean
      }

      input CodeGenerationInput {
        description: String!
        language: String!
        context: String
        style: String
      }

      input ProjectInput {
        name: String!
        description: String
        template: String
      }

      input SettingsInput {
        theme: String
        models: [ModelConfigInput!]
        privacy: PrivacySettingsInput
      }

      type CodeGenerationResult {
        code: String!
        explanation: String
        tests: String
        documentation: String
      }

      type Settings {
        theme: String!
        models: [ModelConfig!]!
        privacy: PrivacySettings!
      }

      type CompletionProgress {
        sessionId: String!
        progress: Float!
        currentText: String
        completed: Boolean!
      }

      type ModelStatus {
        model: String!
        status: String!
        latency: Float
        load: Float
      }

      type SystemHealth {
        status: String!
        uptime: Float!
        memoryUsage: Float!
        cpuUsage: Float!
      }

      type UsageStats {
        tokensToday: Int!
        requestsToday: Int!
        costToday: Float!
        limitReached: Boolean!
      }

      type TokenUsage {
        promptTokens: Int!
        completionTokens: Int!
        totalTokens: Int!
        cost: Float!
      }

      type ProjectFile {
        path: String!
        content: String!
        language: String!
        size: Int!
      }

      type ProjectSettings {
        aiModel: String
        autoComplete: Boolean!
        linting: Boolean!
      }

      type ModelConfig {
        id: String!
        enabled: Boolean!
        settings: ModelSettings!
      }

      type PrivacySettings {
        telemetry: Boolean!
        analytics: Boolean!
        crashReports: Boolean!
      }

      input ModelConfigInput {
        id: String!
        enabled: Boolean!
        settings: ModelSettingsInput!
      }

      input PrivacySettingsInput {
        telemetry: Boolean
        analytics: Boolean
        crashReports: Boolean
      }

      input ModelSettingsInput {
        temperature: Float
        maxTokens: Int
      }

      type ModelSettings {
        temperature: Float!
        maxTokens: Int!
      }
    `;

    const resolvers = {
      Query: {
        user: async (parent: any, args: { id: string }, context: any) => {
          // Implementation will be added with actual database
          return { id: args.id, email: 'user@example.com', role: 'developer' };
        },
        models: async () => {
          // Return available AI models
          return [];
        },
        completions: async (parent: any, args: any, context: any) => {
          // Return completion history
          return [];
        },
        projects: async (parent: any, args: any, context: any) => {
          // Return user projects
          return [];
        },
        analytics: async (parent: any, args: { timeframe: string }, context: any) => {
          // Return analytics data
          return {
            requests: 0,
            latency: 0,
            errorRate: 0,
            costToday: 0,
            tokensUsed: 0
          };
        }
      },
      Mutation: {
        generateCode: async (parent: any, args: any, context: any) => {
          // AI code generation
          return {
            code: '// Generated code',
            explanation: 'Code explanation',
            tests: '// Generated tests',
            documentation: '// Documentation'
          };
        },
        saveProject: async (parent: any, args: any, context: any) => {
          // Save project
          return { id: '1', name: args.input.name };
        },
        updateSettings: async (parent: any, args: any, context: any) => {
          // Update user settings
          return { theme: 'dark' };
        },
        createCompletion: async (parent: any, args: any, context: any) => {
          // Create AI completion
          return {
            id: '1',
            text: 'Completion text',
            confidence: 0.95,
            model: 'gpt-4',
            timestamp: new Date().toISOString()
          };
        }
      }
    };

    this.apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer: this.server })],
      formatError: (err) => {
        logger.error('GraphQL Error', {
          error: err.message,
          stack: err.stack,
          path: err.path
        });
        return err;
      }
    });

    await this.apolloServer.start();

    // Apply GraphQL middleware
    this.app.use(
      '/graphql',
      cors<cors.CorsRequest>(),
      express.json(),
      expressMiddleware(this.apolloServer, {
        context: async ({ req }) => {
          return {
            user: (req as AuthenticatedRequest).user,
            requestId: (req as AuthenticatedRequest).requestId
          };
        }
      })
    );
  }

  // Task 3: Add request validation middleware
  private setupRoutes(): void {
    const authenticateToken = this.app.get('authenticateToken');
    const optionalAuth = this.app.get('optionalAuth');

    // Health check endpoint
    this.app.get('/health', (req: AuthenticatedRequest, res: Response) => {
      res.json(this.formatResponse(true, {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
      }));
    });

    // Metrics endpoint
    this.app.get('/metrics', async (req: Request, res: Response) => {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    });

    // Task 7: API versioning
    const apiV1 = express.Router();

    // Authentication routes
    apiV1.post('/auth/login', [
      body('email').isEmail().normalizeEmail(),
      body('password').isLength({ min: 8 })
    ], this.validateRequest, async (req: AuthenticatedRequest, res: Response) => {
      // Login implementation
      const token = jwt.sign(
        { id: '1', email: req.body.email, role: 'developer' },
        this.config.jwtSecret,
        { expiresIn: '24h' }
      );
      
      res.json(this.formatResponse(true, { token, user: { id: '1', email: req.body.email } }));
    });

    // AI completion routes
    apiV1.post('/completions', authenticateToken, [
      body('prompt').notEmpty().isLength({ max: 10000 }),
      body('model').optional().isString(),
      body('temperature').optional().isFloat({ min: 0, max: 1 }),
      body('maxTokens').optional().isInt({ min: 1, max: 4000 })
    ], this.validateRequest, async (req: AuthenticatedRequest, res: Response) => {
      // AI completion implementation
      logger.info('Completion request', {
        requestId: req.requestId,
        userId: req.user?.id,
        model: req.body.model,
        promptLength: req.body.prompt.length
      });

      res.json(this.formatResponse(true, {
        id: uuidv4(),
        text: 'Generated completion',
        model: req.body.model || 'default',
        timestamp: new Date().toISOString()
      }));
    });

    // Model management routes
    apiV1.get('/models', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
      res.json(this.formatResponse(true, [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          provider: 'openai',
          status: 'available',
          latency: 150
        }
      ]));
    });

    // User settings routes
    apiV1.get('/settings', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
      res.json(this.formatResponse(true, {
        theme: 'dark',
        models: [],
        privacy: { telemetry: false }
      }));
    });

    apiV1.put('/settings', authenticateToken, [
      body('theme').optional().isIn(['light', 'dark', 'auto']),
      body('models').optional().isArray(),
      body('privacy').optional().isObject()
    ], this.validateRequest, async (req: AuthenticatedRequest, res: Response) => {
      logger.info('Settings updated', {
        requestId: req.requestId,
        userId: req.user?.id,
        changes: Object.keys(req.body)
      });

      res.json(this.formatResponse(true, req.body));
    });

    // Analytics routes
    apiV1.get('/analytics', authenticateToken, [
      query('timeframe').isIn(['hour', 'day', 'week', 'month'])
    ], this.validateRequest, async (req: AuthenticatedRequest, res: Response) => {
      res.json(this.formatResponse(true, {
        requests: 150,
        latency: 120,
        errorRate: 0.01,
        costToday: 2.45
      }));
    });

    this.app.use('/api/v1', apiV1);

    // Catch all for undefined routes
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json(this.formatResponse(false, null, 'Endpoint not found'));
    });
  }

  // WebSocket setup for real-time features
  private setupWebSocket(): void {
    this.wsServer = new WebSocket.Server({ server: this.server });

    this.wsServer.on('connection', (ws: WebSocket, req: Request) => {
      activeConnections.inc();
      logger.info('WebSocket connection established', { ip: req.socket.remoteAddress });

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          logger.debug('WebSocket message received', { type: data.type, data });

          // Handle different message types
          switch (data.type) {
            case 'completion_request':
              // Handle real-time completion
              ws.send(JSON.stringify({
                type: 'completion_progress',
                sessionId: data.sessionId,
                progress: 0.5,
                currentText: 'Generating...'
              }));
              break;
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
              break;
          }
        } catch (error) {
          logger.error('WebSocket message error', { error: (error as Error).message });
        }
      });

      ws.on('close', () => {
        activeConnections.dec();
        logger.info('WebSocket connection closed');
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error', { error: error.message });
      });
    });
  }

  // Request validation helper
  private validateRequest(req: Request, res: Response, next: NextFunction): void {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }

  // Response formatter
  private formatResponse<T>(
    success: boolean,
    data?: T,
    error?: string,
    meta?: any
  ): APIResponse<T> {
    return {
      success,
      data,
      error,
      meta: {
        requestId: uuidv4(),
        timestamp: new Date().toISOString(),
        version: 'v1',
        ...meta
      }
    };
  }

  // Error handling middleware
  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((err: Error, req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      logger.error('Unhandled error', {
        requestId: req.requestId,
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        userId: req.user?.id
      });

      if (res.headersSent) {
        return next(err);
      }

      const statusCode = (err as any).statusCode || 500;
      const message = this.config.environment === 'production' 
        ? 'Internal server error' 
        : err.message;

      res.status(statusCode).json(this.formatResponse(false, null, message));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught exception', { error: err.message, stack: err.stack });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', { reason, promise });
    });
  }

  // Start the server
  public async start(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.server.listen(this.config.port, this.config.host, () => {
        logger.info(`CodeForge API Server started`, {
          port: this.config.port,
          host: this.config.host,
          environment: this.config.environment,
          graphql: '/graphql',
          health: '/health',
          metrics: '/metrics'
        });
        resolve();
      });
    });
  }

  // Graceful shutdown
  public async stop(): Promise<void> {
    logger.info('Shutting down server...');
    
    if (this.wsServer) {
      this.wsServer.close();
    }
    
    await this.apolloServer.stop();
    
    await new Promise<void>((resolve) => {
      this.server.close(() => {
        logger.info('Server shut down successfully');
        resolve();
      });
    });
  }
}

// Default configuration
export const defaultConfig: ServerConfig = {
  port: parseInt(process.env.PORT || '3001'),
  host: process.env.HOST || '0.0.0.0',
  environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  rateLimits: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP',
      standardHeaders: true,
      legacyHeaders: false
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20, // limit each IP to 20 auth requests per windowMs
      message: 'Too many authentication attempts',
      standardHeaders: true,
      legacyHeaders: false
    },
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 2000, // limit each user to 2000 API requests per windowMs
      message: 'API rate limit exceeded',
      standardHeaders: true,
      legacyHeaders: false
    }
  },
  monitoring: {
    enabled: true,
    prometheusPath: '/metrics',
    healthCheckPath: '/health'
  }
};

// Export server instance for use in other modules
export default CodeForgeAPIServer; 