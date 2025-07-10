/**
 * G3D AI Services API Gateway
 * Routes and manages requests across all 24 AI services
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            user?: any;
            startTime?: number;
            id?: string;
        }
    }
}

export interface ServiceConfig {
    id: string;
    name: string;
    displayName: string;
    version: string;
    upstream: string;
    healthCheck: string;
    timeout: number;
    retries: number;
    rateLimit: {
        windowMs: number;
        max: number;
        skipSuccessfulRequests?: boolean;
    };
    authentication: {
        required: boolean;
        scopes?: string[];
        roles?: string[];
    };
    monitoring: {
        enabled: boolean;
        metrics: string[];
    };
    caching: {
        enabled: boolean;
        ttl: number;
        patterns: string[];
    };
}

export interface GatewayConfig {
    port: number;
    host: string;
    cors: {
        origin: string | string[];
        credentials: boolean;
    };
    redis: {
        host: string;
        port: number;
        password?: string;
    };
    jwt: {
        secret: string;
        algorithm: string;
    };
    services: ServiceConfig[];
    monitoring: {
        enabled: boolean;
        endpoint: string;
        interval: number;
    };
    logging: {
        level: string;
        format: string;
    };
}

// G3D AI Services Configuration
export const G3D_SERVICES: ServiceConfig[] = [
    // Computer Vision Services
    {
        id: 'vision-pro',
        name: 'g3d-vision-pro',
        displayName: 'G3D Vision Pro',
        version: '1.0.0',
        upstream: 'http://vision-pro-service:3001',
        healthCheck: '/health',
        timeout: 30000,
        retries: 3,
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000, // limit each IP to 1000 requests per windowMs
        },
        authentication: {
            required: true,
            scopes: ['vision:read', 'vision:write'],
            roles: ['user', 'admin']
        },
        monitoring: {
            enabled: true,
            metrics: ['requests', 'latency', 'errors', 'gpu_usage']
        },
        caching: {
            enabled: true,
            ttl: 300, // 5 minutes
            patterns: ['/api/v1/models', '/api/v1/datasets']
        }
    },
    {
        id: 'codeforge',
        name: 'g3d-codeforge',
        displayName: 'G3D CodeForge AI',
        version: '1.0.0',
        upstream: 'http://codeforge-service:3002',
        healthCheck: '/health',
        timeout: 45000,
        retries: 2,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 500,
        },
        authentication: {
            required: true,
            scopes: ['code:generate', 'code:review'],
            roles: ['developer', 'admin']
        },
        monitoring: {
            enabled: true,
            metrics: ['requests', 'latency', 'errors', 'tokens_generated']
        },
        caching: {
            enabled: false,
            ttl: 0,
            patterns: []
        }
    },
    {
        id: 'creative-studio',
        name: 'g3d-creative-studio',
        displayName: 'G3D Creative Studio',
        version: '1.0.0',
        upstream: 'http://creative-studio-service:3003',
        healthCheck: '/health',
        timeout: 60000,
        retries: 2,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 200,
        },
        authentication: {
            required: true,
            scopes: ['creative:generate', 'creative:edit'],
            roles: ['creator', 'admin']
        },
        monitoring: {
            enabled: true,
            metrics: ['requests', 'latency', 'errors', 'media_generated']
        },
        caching: {
            enabled: true,
            ttl: 600,
            patterns: ['/api/v1/templates', '/api/v1/styles']
        }
    },
    {
        id: 'dataforge',
        name: 'g3d-dataforge',
        displayName: 'G3D DataForge',
        version: '1.0.0',
        upstream: 'http://dataforge-service:3004',
        healthCheck: '/health',
        timeout: 120000,
        retries: 3,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 100,
        },
        authentication: {
            required: true,
            scopes: ['data:read', 'data:write', 'data:analyze'],
            roles: ['analyst', 'admin']
        },
        monitoring: {
            enabled: true,
            metrics: ['requests', 'latency', 'errors', 'data_processed']
        },
        caching: {
            enabled: true,
            ttl: 1800,
            patterns: ['/api/v1/reports', '/api/v1/insights']
        }
    },
    {
        id: 'secure-ai',
        name: 'g3d-secure-ai',
        displayName: 'G3D SecureAI',
        version: '1.0.0',
        upstream: 'http://secure-ai-service:3005',
        healthCheck: '/health',
        timeout: 30000,
        retries: 3,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 2000,
        },
        authentication: {
            required: true,
            scopes: ['security:monitor', 'security:respond'],
            roles: ['security', 'admin']
        },
        monitoring: {
            enabled: true,
            metrics: ['requests', 'latency', 'errors', 'threats_detected']
        },
        caching: {
            enabled: false,
            ttl: 0,
            patterns: []
        }
    },
    {
        id: 'annotate',
        name: 'g3d-annotate',
        displayName: 'G3D Annotate',
        version: '1.0.0',
        upstream: 'http://annotate-service:3006',
        healthCheck: '/health',
        timeout: 60000,
        retries: 2,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 300,
        },
        authentication: {
            required: true,
            scopes: ['annotation:create', 'annotation:review'],
            roles: ['annotator', 'admin']
        },
        monitoring: {
            enabled: true,
            metrics: ['requests', 'latency', 'errors', 'annotations_created']
        },
        caching: {
            enabled: true,
            ttl: 900,
            patterns: ['/api/v1/datasets', '/api/v1/labels']
        }
    },
    // Additional services would be configured here...
    // For brevity, showing first 6 services
];

export class APIGateway {
    private app: express.Application;
    private redis: Redis;
    private services: Map<string, ServiceConfig>;
    private healthChecks: Map<string, boolean>;
    private metrics: Map<string, any>;

    constructor(private config: GatewayConfig) {
        this.app = express();
        this.redis = new Redis(config.redis);
        this.services = new Map();
        this.healthChecks = new Map();
        this.metrics = new Map();

        this.initializeServices();
        this.setupMiddleware();
        this.setupRoutes();
        this.startHealthChecks();
    }

    private initializeServices(): void {
        this.config.services.forEach(service => {
            this.services.set(service.id, service);
            this.healthChecks.set(service.id, false);
            this.metrics.set(service.id, {
                requests: 0,
                errors: 0,
                latency: [],
                lastHealthCheck: null
            });
        });
    }

    private setupMiddleware(): void {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "wss:", "https:"],
                },
            },
        }));

        // CORS
        this.app.use(cors(this.config.cors));

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging
        this.app.use(this.requestLogger);

        // Global rate limiting
        this.app.use(rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 10000, // limit each IP to 10000 requests per windowMs
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        }));
    }

    private setupRoutes(): void {
        // Health check endpoint
        this.app.get('/health', this.healthCheck);

        // Metrics endpoint
        this.app.get('/metrics', this.getMetrics);

        // Service discovery endpoint
        this.app.get('/services', this.getServices);

        // Authentication endpoints
        this.app.use('/auth', this.createAuthProxy());

        // Service routing
        this.config.services.forEach(service => {
            this.app.use(`/${service.id}`, this.createServiceProxy(service));
        });

        // Catch-all error handler
        this.app.use(this.errorHandler);
    }

    private createAuthProxy() {
        return createProxyMiddleware({
            target: 'http://auth-service:3000',
            changeOrigin: true,
            pathRewrite: {
                '^/auth': ''
            },
            onProxyReq: (proxyReq, req, res) => {
                proxyReq.setHeader('X-Gateway-Source', 'g3d-api-gateway');
            },
            onError: (err, req, res) => {
                console.error('Auth proxy error:', err);
                res.status(502).json({
                    error: 'Authentication service unavailable',
                    code: 'AUTH_SERVICE_ERROR'
                });
            }
        });
    }

    private createServiceProxy(service: ServiceConfig) {
        const proxyOptions: Options = {
            target: service.upstream,
            changeOrigin: true,
            timeout: service.timeout,
            pathRewrite: {
                [`^/${service.id}`]: ''
            },
            onProxyReq: (proxyReq, req, res) => {
                proxyReq.setHeader('X-Service-ID', service.id);
                proxyReq.setHeader('X-Gateway-Source', 'g3d-api-gateway');

                // Add user context if authenticated
                if (req.user) {
                    proxyReq.setHeader('X-User-ID', req.user.id);
                    proxyReq.setHeader('X-User-Role', req.user.role);
                    proxyReq.setHeader('X-Organization-ID', req.user.organizationId || '');
                }
            },
            onProxyRes: (proxyRes, req, res) => {
                // Add CORS headers
                proxyRes.headers['Access-Control-Allow-Origin'] = '*';
                proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
                proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Content-Length, X-Requested-With';

                // Update metrics
                this.updateMetrics(service.id, req, proxyRes);
            },
            onError: (err, req, res) => {
                console.error(`Service ${service.id} proxy error:`, err);

                this.updateErrorMetrics(service.id);

                res.status(502).json({
                    error: `${service.displayName} service unavailable`,
                    code: 'SERVICE_UNAVAILABLE',
                    service: service.id
                });
            }
        };

        const middleware = [
            // Service-specific rate limiting
            rateLimit({
                windowMs: service.rateLimit.windowMs,
                max: service.rateLimit.max,
                keyGenerator: (req) => `${req.ip}:${service.id}`,
                message: `Rate limit exceeded for ${service.displayName}`,
                skipSuccessfulRequests: service.rateLimit.skipSuccessfulRequests
            }),

            // Authentication middleware
            service.authentication.required ? this.authenticate(service) : (req, res, next) => next(),

            // Caching middleware
            service.caching.enabled ? this.cache(service) : (req, res, next) => next(),

            // Proxy middleware
            createProxyMiddleware(proxyOptions)
        ];

        return middleware;
    }

    private authenticate = (service: ServiceConfig) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const token = this.extractToken(req);
                if (!token) {
                    return res.status(401).json({
                        error: 'Authentication required',
                        code: 'MISSING_TOKEN'
                    });
                }

                const decoded = jwt.verify(token, this.config.jwt.secret) as any;

                // Check if user has required scopes
                if (service.authentication.scopes) {
                    const hasRequiredScope = service.authentication.scopes.some(scope =>
                        decoded.scopes?.includes(scope)
                    );

                    if (!hasRequiredScope) {
                        return res.status(403).json({
                            error: 'Insufficient permissions',
                            code: 'INSUFFICIENT_SCOPE',
                            required: service.authentication.scopes
                        });
                    }
                }

                // Check if user has required role
                if (service.authentication.roles) {
                    if (!service.authentication.roles.includes(decoded.role)) {
                        return res.status(403).json({
                            error: 'Insufficient permissions',
                            code: 'INSUFFICIENT_ROLE',
                            required: service.authentication.roles
                        });
                    }
                }

                req.user = decoded;
                next();
            } catch (error) {
                if (error.name === 'TokenExpiredError') {
                    return res.status(401).json({
                        error: 'Token expired',
                        code: 'TOKEN_EXPIRED'
                    });
                }

                return res.status(401).json({
                    error: 'Invalid token',
                    code: 'INVALID_TOKEN'
                });
            }
        };
    };

    private cache = (service: ServiceConfig) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            if (req.method !== 'GET') {
                return next();
            }

            const shouldCache = service.caching.patterns.some(pattern =>
                req.path.includes(pattern)
            );

            if (!shouldCache) {
                return next();
            }

            const cacheKey = `${service.id}:${req.originalUrl}`;

            try {
                const cached = await this.redis.get(cacheKey);
                if (cached) {
                    res.setHeader('X-Cache', 'HIT');
                    return res.json(JSON.parse(cached));
                }

                // Store original res.json
                const originalJson = res.json;
                res.json = function (data) {
                    // Cache the response
                    this.redis.setex(cacheKey, service.caching.ttl, JSON.stringify(data));
                    res.setHeader('X-Cache', 'MISS');
                    return originalJson.call(this, data);
                }.bind(this);

                next();
            } catch (error) {
                console.error('Cache error:', error);
                next();
            }
        };
    };

    private extractToken(req: Request): string | null {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        return null;
    }

    private requestLogger = (req: Request, res: Response, next: NextFunction) => {
        const start = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
        });

        next();
    };

    private healthCheck = async (req: Request, res: Response) => {
        const serviceHealths = Array.from(this.services.entries()).map(([id, service]) => ({
            service: id,
            name: service.displayName,
            status: this.healthChecks.get(id) ? 'healthy' : 'unhealthy',
            lastCheck: this.metrics.get(id)?.lastHealthCheck
        }));

        const overallHealth = serviceHealths.every(s => s.status === 'healthy');

        res.status(overallHealth ? 200 : 503).json({
            status: overallHealth ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            services: serviceHealths
        });
    };

    private getMetrics = async (req: Request, res: Response) => {
        const metrics = Array.from(this.metrics.entries()).map(([serviceId, data]) => ({
            service: serviceId,
            requests: data.requests,
            errors: data.errors,
            errorRate: data.requests > 0 ? (data.errors / data.requests) * 100 : 0,
            averageLatency: data.latency.length > 0
                ? data.latency.reduce((a, b) => a + b, 0) / data.latency.length
                : 0
        }));

        res.json({
            timestamp: new Date().toISOString(),
            services: metrics
        });
    };

    private getServices = async (req: Request, res: Response) => {
        const services = Array.from(this.services.values()).map(service => ({
            id: service.id,
            name: service.displayName,
            version: service.version,
            status: this.healthChecks.get(service.id) ? 'healthy' : 'unhealthy',
            authentication: service.authentication,
            rateLimit: service.rateLimit
        }));

        res.json({ services });
    };

    private updateMetrics(serviceId: string, req: Request, proxyRes: any): void {
        const metrics = this.metrics.get(serviceId);
        if (metrics) {
            metrics.requests++;

            const latency = req.startTime ? Date.now() - req.startTime : 0;
            metrics.latency.push(latency);

            // Keep only last 100 latency measurements
            if (metrics.latency.length > 100) {
                metrics.latency = metrics.latency.slice(-100);
            }
        }
    }

    private updateErrorMetrics(serviceId: string): void {
        const metrics = this.metrics.get(serviceId);
        if (metrics) {
            metrics.errors++;
        }
    }

    private startHealthChecks(): void {
        setInterval(async () => {
            for (const [serviceId, service] of this.services.entries()) {
                try {
                    const response = await fetch(`${service.upstream}${service.healthCheck}`, {
                        signal: AbortSignal.timeout(5000)
                    });

                    const isHealthy = response.ok;
                    this.healthChecks.set(serviceId, isHealthy);

                    const metrics = this.metrics.get(serviceId);
                    if (metrics) {
                        metrics.lastHealthCheck = new Date().toISOString();
                    }
                } catch (error) {
                    this.healthChecks.set(serviceId, false);
                    console.error(`Health check failed for ${serviceId}:`, error.message);
                }
            }
        }, this.config.monitoring.interval);
    }

    private errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
        console.error('Gateway error:', err);

        res.status(500).json({
            error: 'Internal gateway error',
            code: 'GATEWAY_ERROR',
            requestId: req.id || 'unknown'
        });
    };

    public start(): void {
        this.app.listen(this.config.port, this.config.host, () => {
            console.log(`🚀 G3D API Gateway running on ${this.config.host}:${this.config.port}`);
            console.log(`📊 Monitoring ${this.services.size} services`);
            console.log(`🔒 Authentication: ${this.config.jwt.algorithm}`);
        });
    }

    public stop(): void {
        this.redis.disconnect();
    }
}

// Default configuration
export const defaultConfig: GatewayConfig = {
    port: 8080,
    host: '0.0.0.0',
    cors: {
        origin: ['http://localhost:3000', 'https://g3d.ai', 'https://*.g3d.ai'],
        credentials: true
    },
    redis: {
        host: 'redis',
        port: 6379
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        algorithm: 'HS256'
    },
    services: G3D_SERVICES,
    monitoring: {
        enabled: true,
        endpoint: '/metrics',
        interval: 30000 // 30 seconds
    },
    logging: {
        level: 'info',
        format: 'json'
    }
};

export default APIGateway;