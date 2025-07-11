/**
 * G3D AI Services - Production API Gateway
 * Enterprise-grade API gateway with authentication, rate limiting, and service discovery
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { performance } from 'perf_hooks';

// Types
interface ServiceConfig {
    name: string;
    target: string;
    path: string;
    healthCheck: string;
    timeout: number;
    retries: number;
    rateLimit: {
        windowMs: number;
        max: number;
    };
    auth: {
        required: boolean;
        roles?: string[];
        scopes?: string[];
    };
}

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        roles: string[];
        scopes: string[];
        organizationId: string;
        subscription: {
            plan: string;
            features: string[];
            limits: Record<string, number>;
        };
    };
    requestId?: string;
    startTime?: number;
}

interface RateLimitInfo {
    count: number;
    resetTime: number;
    limit: number;
}

// Configuration
const config = {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    logLevel: process.env.LOG_LEVEL || 'info',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '1000'),
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'), // 30 seconds
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'), // 30 seconds
};

// Service Registry - All 16 G3D AI Services
const services: ServiceConfig[] = [
    // Core Medical & Health Services
    {
        name: 'vision-pro',
        target: process.env.VISION_PRO_URL || 'http://localhost:3001',
        path: '/api/vision-pro',
        healthCheck: '/health',
        timeout: 30000,
        retries: 3,
        rateLimit: { windowMs: 900000, max: 500 },
        auth: { required: true, roles: ['medical', 'admin'], scopes: ['medical:read', 'medical:write'] }
    },
    {
        name: 'health-ai',
        target: process.env.HEALTH_AI_URL || 'http://localhost:3010',
        path: '/api/health-ai',
        healthCheck: '/health',
        timeout: 25000,
        retries: 3,
        rateLimit: { windowMs: 900000, max: 300 },
        auth: { required: true, roles: ['health', 'admin'], scopes: ['health:read', 'health:write'] }
    },

    // Development & Creative Services
    {
        name: 'code-forge',
        target: process.env.CODE_FORGE_URL || 'http://localhost:3002',
        path: '/api/code-forge',
        healthCheck: '/health',
        timeout: 45000,
        retries: 2,
        rateLimit: { windowMs: 900000, max: 1000 },
        auth: { required: true, roles: ['developer', 'admin'], scopes: ['code:read', 'code:write'] }
    },
    {
        name: 'creative-studio',
        target: process.env.CREATIVE_STUDIO_URL || 'http://localhost:3003',
        path: '/api/creative-studio',
        healthCheck: '/health',
        timeout: 60000,
        retries: 2,
        rateLimit: { windowMs: 900000, max: 800 },
        auth: { required: true, roles: ['creative', 'admin'], scopes: ['creative:read', 'creative:write'] }
    },
    {
        name: 'mesh3d',
        target: process.env.MESH3D_URL || 'http://localhost:3014',
        path: '/api/mesh3d',
        healthCheck: '/health',
        timeout: 90000,
        retries: 2,
        rateLimit: { windowMs: 900000, max: 200 },
        auth: { required: true, roles: ['designer', 'admin'], scopes: ['3d:read', '3d:write'] }
    },

    // Enterprise Data & Analytics Services
    {
        name: 'data-forge',
        target: process.env.DATA_FORGE_URL || 'http://localhost:3004',
        path: '/api/data-forge',
        healthCheck: '/health',
        timeout: 120000,
        retries: 3,
        rateLimit: { windowMs: 900000, max: 600 },
        auth: { required: true, roles: ['analyst', 'admin'], scopes: ['data:read', 'data:write'] }
    },
    {
        name: 'automl',
        target: process.env.AUTOML_URL || 'http://localhost:3006',
        path: '/api/automl',
        healthCheck: '/health',
        timeout: 180000,
        retries: 2,
        rateLimit: { windowMs: 900000, max: 100 },
        auth: { required: true, roles: ['ml-engineer', 'admin'], scopes: ['ml:read', 'ml:write'] }
    },

    // Security & Compliance Services
    {
        name: 'secure-ai',
        target: process.env.SECURE_AI_URL || 'http://localhost:3005',
        path: '/api/secure-ai',
        healthCheck: '/health',
        timeout: 15000,
        retries: 3,
        rateLimit: { windowMs: 900000, max: 2000 },
        auth: { required: true, roles: ['security', 'admin'], scopes: ['security:read', 'security:write'] }
    },
    {
        name: 'legal-ai',
        target: process.env.LEGAL_AI_URL || 'http://localhost:3016',
        path: '/api/legal-ai',
        healthCheck: '/health',
        timeout: 30000,
        retries: 3,
        rateLimit: { windowMs: 900000, max: 400 },
        auth: { required: true, roles: ['legal', 'admin'], scopes: ['legal:read', 'legal:write'] }
    },

    // Communication & Media Services
    {
        name: 'chat-builder',
        target: process.env.CHAT_BUILDER_URL || 'http://localhost:3007',
        path: '/api/chat-builder',
        healthCheck: '/health',
        timeout: 20000,
        retries: 3,
        rateLimit: { windowMs: 900000, max: 1500 },
        auth: { required: true, roles: ['support', 'admin'], scopes: ['chat:read', 'chat:write'] }
    },
    {
        name: 'video-ai',
        target: process.env.VIDEO_AI_URL || 'http://localhost:3008',
        path: '/api/video-ai',
        healthCheck: '/health',
        timeout: 300000,
        retries: 2,
        rateLimit: { windowMs: 900000, max: 50 },
        auth: { required: true, roles: ['media', 'admin'], scopes: ['video:read', 'video:write'] }
    },
    {
        name: 'voice-ai',
        target: process.env.VOICE_AI_URL || 'http://localhost:3011',
        path: '/api/voice-ai',
        healthCheck: '/health',
        timeout: 45000,
        retries: 3,
        rateLimit: { windowMs: 900000, max: 800 },
        auth: { required: true, roles: ['voice', 'admin'], scopes: ['voice:read', 'voice:write'] }
    },
    {
        name: 'translate-ai',
        target: process.env.TRANSLATE_AI_URL || 'http://localhost:3012',
        path: '/api/translate-ai',
        healthCheck: '/health',
        timeout: 20000,
        retries: 3,
        rateLimit: { windowMs: 900000, max: 2000 },
        auth: { required: true, roles: ['translator', 'admin'], scopes: ['translate:read', 'translate:write'] }
    },

    // Financial & Document Services
    {
        name: 'finance-ai',
        target: process.env.FINANCE_AI_URL || 'http://localhost:3009',
        path: '/api/finance-ai',
        healthCheck: '/health',
        timeout: 25000,
        retries: 3,
        rateLimit: { windowMs: 900000, max: 600 },
        auth: { required: true, roles: ['finance', 'admin'], scopes: ['finance:read', 'finance:write'] }
    },
    {
        name: 'documind',
        target: process.env.DOCUMIND_URL || 'http://localhost:3013',
        path: '/api/documind',
        healthCheck: '/health',
        timeout: 60000,
        retries: 3,
        rateLimit: { windowMs: 900000, max: 1000 },
        auth: { required: true, roles: ['document', 'admin'], scopes: ['document:read', 'document:write'] }
    },

    // Infrastructure Services
    {
        name: 'edge-ai',
        target: process.env.EDGE_AI_URL || 'http://localhost:3015',
        path: '/api/edge-ai',
        healthCheck: '/health',
        timeout: 15000,
        retries: 3,
        rateLimit: { windowMs: 900000, max: 1200 },
        auth: { required: true, roles: ['infrastructure', 'admin'], scopes: ['edge:read', 'edge:write'] }
    }
];

// Logger setup
const logger = winston.createLogger({
    level: config.logLevel,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'g3d-api-gateway' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// Redis client for caching and rate limiting
const redis = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true
});

redis.on('error', (error) => {
    logger.error('Redis connection error:', error);
});

redis.on('connect', () => {
    logger.info('Connected to Redis');
});

// Express app setup
const app: Express = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID']
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID and timing middleware
app.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    req.requestId = uuidv4();
    req.startTime = performance.now();
    res.setHeader('X-Request-ID', req.requestId);
    next();
});

// Request logging middleware
app.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    logger.info('Incoming request', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip
    });
    next();
});

// Global rate limiting
const globalRateLimit = rateLimit({
    windowMs: config.rateLimitWindow,
    max: config.rateLimitMax,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.rateLimitWindow / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: {
        incr: async (key: string) => {
            const multi = redis.multi();
            multi.incr(key);
            multi.expire(key, Math.ceil(config.rateLimitWindow / 1000));
            const results = await multi.exec();
            return { totalHits: results?.[0]?.[1] as number || 0, resetTime: new Date(Date.now() + config.rateLimitWindow) };
        },
        decrement: async (key: string) => {
            await redis.decr(key);
        },
        resetKey: async (key: string) => {
            await redis.del(key);
        }
    }
});

app.use('/api', globalRateLimit);

// Authentication middleware
const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'Access token required',
            requestId: req.requestId
        });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as any;

        // Check if token is blacklisted
        const isBlacklisted = await redis.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({
                error: 'Token has been revoked',
                requestId: req.requestId
            });
        }

        // Fetch user details from cache or database
        const userKey = `user:${decoded.userId}`;
        let userData = await redis.get(userKey);

        if (!userData) {
            // In production, this would fetch from database
            userData = JSON.stringify({
                id: decoded.userId,
                email: decoded.email,
                roles: decoded.roles || ['user'],
                scopes: decoded.scopes || [],
                organizationId: decoded.organizationId,
                subscription: decoded.subscription || {
                    plan: 'basic',
                    features: ['basic-access'],
                    limits: { requests: 1000, storage: 1000000000 }
                }
            });

            // Cache user data for 15 minutes
            await redis.setex(userKey, 900, userData);
        }

        req.user = JSON.parse(userData);
        next();
    } catch (error) {
        logger.error('Token verification failed:', { error: error.message, requestId: req.requestId });
        return res.status(403).json({
            error: 'Invalid or expired token',
            requestId: req.requestId
        });
    }
};

// Authorization middleware
const authorizeAccess = (requiredRoles: string[] = [], requiredScopes: string[] = []) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                requestId: req.requestId
            });
        }

        // Check roles
        if (requiredRoles.length > 0) {
            const hasRole = requiredRoles.some(role => req.user!.roles.includes(role)) || req.user!.roles.includes('admin');
            if (!hasRole) {
                return res.status(403).json({
                    error: 'Insufficient permissions',
                    required: requiredRoles,
                    requestId: req.requestId
                });
            }
        }

        // Check scopes
        if (requiredScopes.length > 0) {
            const hasScope = requiredScopes.some(scope => req.user!.scopes.includes(scope));
            if (!hasScope) {
                return res.status(403).json({
                    error: 'Insufficient scopes',
                    required: requiredScopes,
                    requestId: req.requestId
                });
            }
        }

        next();
    };
};

// Service-specific rate limiting
const createServiceRateLimit = (service: ServiceConfig) => {
    return rateLimit({
        windowMs: service.rateLimit.windowMs,
        max: service.rateLimit.max,
        message: {
            error: `Too many requests to ${service.name} service`,
            service: service.name,
            retryAfter: Math.ceil(service.rateLimit.windowMs / 1000)
        },
        keyGenerator: (req: AuthenticatedRequest) => {
            return `${service.name}:${req.user?.id || req.ip}`;
        }
    });
};

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: config.environment,
        services: services.length
    });
});

// Service discovery endpoint
app.get('/api/services', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userServices = services.filter(service => {
        if (!service.auth.required) return true;
        if (!req.user) return false;

        const hasRole = !service.auth.roles ||
            service.auth.roles.some(role => req.user!.roles.includes(role)) ||
            req.user!.roles.includes('admin');

        const hasScope = !service.auth.scopes ||
            service.auth.scopes.some(scope => req.user!.scopes.includes(scope));

        return hasRole && hasScope;
    });

    res.json({
        services: userServices.map(service => ({
            name: service.name,
            path: service.path,
            description: `G3D ${service.name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Service`,
            status: 'available',
            auth: service.auth
        })),
        user: {
            id: req.user!.id,
            roles: req.user!.roles,
            scopes: req.user!.scopes,
            subscription: req.user!.subscription
        }
    });
});

// Setup proxy middleware for each service
services.forEach(service => {
    const proxyOptions: Options = {
        target: service.target,
        changeOrigin: true,
        pathRewrite: {
            [`^${service.path}`]: ''
        },
        timeout: service.timeout,
        // Note: onError, onProxyReq, and onProxyRes are handled differently in newer versions
        // These would be configured through event listeners on the proxy middleware
    };

    // Apply middleware chain for each service
    const middlewareChain: any[] = [createServiceRateLimit(service)];

    if (service.auth.required) {
        middlewareChain.push(authenticateToken);
        middlewareChain.push(authorizeAccess(service.auth.roles, service.auth.scopes));
    }

    middlewareChain.push(createProxyMiddleware(proxyOptions));

    app.use(service.path, ...middlewareChain);
});

// Error handling middleware
app.use((error: Error, req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    logger.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        requestId: req.requestId
    });

    if (!res.headersSent) {
        res.status(500).json({
            error: 'Internal server error',
            requestId: req.requestId
        });
    }
});

// 404 handler
app.use('*', (req: AuthenticatedRequest, res: Response) => {
    res.status(404).json({
        error: 'Endpoint not found',
        requestId: req.requestId,
        availableServices: services.map(s => s.path)
    });
});

// Health check for services
const checkServiceHealth = async () => {
    const healthChecks = services.map(async service => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${service.target}${service.healthCheck}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return {
                service: service.name,
                status: response.ok ? 'healthy' : 'unhealthy',
                responseTime: response.headers.get('response-time') || 'unknown'
            };
        } catch (error) {
            return {
                service: service.name,
                status: 'unhealthy',
                error: error.message
            };
        }
    });

    const results = await Promise.allSettled(healthChecks);
    const healthStatus = results.map(result =>
        result.status === 'fulfilled' ? result.value : { status: 'error' }
    );

    // Cache health status
    await redis.setex('service:health', 30, JSON.stringify(healthStatus));

    logger.info('Service health check completed', {
        healthy: healthStatus.filter(s => s.status === 'healthy').length,
        total: services.length
    });
};

// Start health checks
setInterval(checkServiceHealth, config.healthCheckInterval);

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');

    // Close Redis connection
    await redis.quit();

    // Close server
    process.exit(0);
});

// Start server
const server = app.listen(config.port, () => {
    logger.info(`G3D API Gateway running on port ${config.port}`);
    logger.info(`Environment: ${config.environment}`);
    logger.info(`Services registered: ${services.length}`);

    // Initial health check
    checkServiceHealth();
});

export { app, server };