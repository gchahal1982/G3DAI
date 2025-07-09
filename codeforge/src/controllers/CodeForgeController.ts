import { Request, Response } from 'express';
import { codeGenerationService } from '../services/RealCodeGenerationService';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

// Real CodeForge API controller with business logic
export class CodeForgeController {

    // Generate code endpoint
    async generateCode(req: Request, res: Response): Promise<void> {
        try {
            // Extract user from JWT token
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            const userId = decoded.userId;

            // Validate request body
            const {
                prompt,
                language,
                framework,
                codeStyle,
                complexity,
                requirements,
                context,
                generateTests,
                testFramework,
                requiresOptimization
            } = req.body;

            if (!prompt || !language) {
                res.status(400).json({
                    error: 'Missing required fields: prompt and language are required'
                });
                return;
            }

            // Check if user has access to CodeForge service
            const hasAccess = await this.checkServiceAccess(userId, 'codeforge');
            if (!hasAccess.allowed) {
                res.status(403).json({
                    error: hasAccess.reason,
                    upgradeUrl: '/pricing/codeforge'
                });
                return;
            }

            // Create code generation request
            const codeRequest = {
                userId,
                prompt,
                language,
                framework,
                codeStyle,
                complexity,
                requirements,
                context,
                generateTests,
                testFramework,
                requiresOptimization,
                timestamp: Date.now()
            };

            // Generate code using AI service
            const result = await codeGenerationService.generateCode(codeRequest);

            // Log the request for analytics
            await this.logCodeGenerationRequest(userId, {
                language,
                complexity,
                success: result.success,
                provider: result.provider,
                processingTime: result.metadata.processingTime
            });

            // Return response
            res.status(200).json({
                success: true,
                data: result,
                usage: {
                    remainingQuota: hasAccess.remainingUsage - 1,
                    tier: hasAccess.tier
                }
            });

        } catch (error) {
            console.error('Code generation error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Code generation failed. Please try again.'
            });
        }
    }

    // Get code generation history
    async getHistory(req: Request, res: Response): Promise<void> {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            const userId = decoded.userId;

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const language = req.query.language as string;

            // Get user's code generation history
            const history = await this.getUserCodeHistory(userId, {
                page,
                limit,
                language
            });

            res.status(200).json({
                success: true,
                data: history.items,
                pagination: {
                    page,
                    limit,
                    total: history.total,
                    pages: Math.ceil(history.total / limit)
                }
            });

        } catch (error) {
            console.error('Get history error:', error);
            res.status(500).json({ error: 'Failed to fetch history' });
        }
    }

    // Get user's usage statistics
    async getUsageStats(req: Request, res: Response): Promise<void> {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            const userId = decoded.userId;

            const timeRange = req.query.timeRange as string || '30d';

            const stats = await this.getUserUsageStats(userId, timeRange);

            res.status(200).json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Get usage stats error:', error);
            res.status(500).json({ error: 'Failed to fetch usage statistics' });
        }
    }

    // Get supported languages and frameworks
    async getSupportedLanguages(req: Request, res: Response): Promise<void> {
        try {
            const languages = {
                javascript: {
                    name: 'JavaScript',
                    frameworks: ['React', 'Vue', 'Angular', 'Node.js', 'Express'],
                    testFrameworks: ['Jest', 'Mocha', 'Cypress'],
                    codeStyles: ['standard', 'airbnb', 'google']
                },
                typescript: {
                    name: 'TypeScript',
                    frameworks: ['React', 'Vue', 'Angular', 'Node.js', 'NestJS'],
                    testFrameworks: ['Jest', 'Vitest', 'Cypress'],
                    codeStyles: ['standard', 'airbnb', 'google']
                },
                python: {
                    name: 'Python',
                    frameworks: ['Django', 'Flask', 'FastAPI', 'Pandas', 'NumPy'],
                    testFrameworks: ['pytest', 'unittest', 'nose2'],
                    codeStyles: ['pep8', 'black', 'google']
                },
                java: {
                    name: 'Java',
                    frameworks: ['Spring', 'Spring Boot', 'Hibernate', 'Maven', 'Gradle'],
                    testFrameworks: ['JUnit', 'TestNG', 'Mockito'],
                    codeStyles: ['google', 'oracle', 'eclipse']
                },
                csharp: {
                    name: 'C#',
                    frameworks: ['.NET', 'ASP.NET', 'Entity Framework', 'Xamarin'],
                    testFrameworks: ['NUnit', 'xUnit', 'MSTest'],
                    codeStyles: ['microsoft', 'stylecop']
                },
                go: {
                    name: 'Go',
                    frameworks: ['Gin', 'Echo', 'Fiber', 'GORM'],
                    testFrameworks: ['testing', 'testify', 'ginkgo'],
                    codeStyles: ['gofmt', 'goimports']
                },
                rust: {
                    name: 'Rust',
                    frameworks: ['Actix', 'Warp', 'Rocket', 'Tokio'],
                    testFrameworks: ['cargo test', 'quickcheck'],
                    codeStyles: ['rustfmt']
                },
                php: {
                    name: 'PHP',
                    frameworks: ['Laravel', 'Symfony', 'CodeIgniter', 'Composer'],
                    testFrameworks: ['PHPUnit', 'Codeception', 'Pest'],
                    codeStyles: ['psr-12', 'symfony', 'laravel']
                }
            };

            res.status(200).json({
                success: true,
                data: languages
            });

        } catch (error) {
            console.error('Get supported languages error:', error);
            res.status(500).json({ error: 'Failed to fetch supported languages' });
        }
    }

    // Save generated code to user's library
    async saveCode(req: Request, res: Response): Promise<void> {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            const userId = decoded.userId;

            const { code, title, description, language, tags } = req.body;

            if (!code || !title || !language) {
                res.status(400).json({
                    error: 'Missing required fields: code, title, and language are required'
                });
                return;
            }

            const savedCode = await this.saveCodeToLibrary(userId, {
                code,
                title,
                description,
                language,
                tags: tags || []
            });

            res.status(201).json({
                success: true,
                data: savedCode
            });

        } catch (error) {
            console.error('Save code error:', error);
            res.status(500).json({ error: 'Failed to save code' });
        }
    }

    // Get user's saved code library
    async getCodeLibrary(req: Request, res: Response): Promise<void> {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            const userId = decoded.userId;

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const language = req.query.language as string;
            const search = req.query.search as string;

            const library = await this.getUserCodeLibrary(userId, {
                page,
                limit,
                language,
                search
            });

            res.status(200).json({
                success: true,
                data: library.items,
                pagination: {
                    page,
                    limit,
                    total: library.total,
                    pages: Math.ceil(library.total / limit)
                }
            });

        } catch (error) {
            console.error('Get code library error:', error);
            res.status(500).json({ error: 'Failed to fetch code library' });
        }
    }

    // Share code with other users
    async shareCode(req: Request, res: Response): Promise<void> {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            const userId = decoded.userId;

            const { codeId, shareType, expiresIn } = req.body;

            if (!codeId || !shareType) {
                res.status(400).json({
                    error: 'Missing required fields: codeId and shareType are required'
                });
                return;
            }

            const shareLink = await this.createShareLink(userId, {
                codeId,
                shareType, // 'public', 'private', 'organization'
                expiresIn: expiresIn || '7d'
            });

            res.status(200).json({
                success: true,
                data: shareLink
            });

        } catch (error) {
            console.error('Share code error:', error);
            res.status(500).json({ error: 'Failed to create share link' });
        }
    }

    // Private helper methods
    private async checkServiceAccess(userId: string, serviceName: string): Promise<{
        allowed: boolean;
        reason: string;
        remainingUsage: number;
        tier: string;
    }> {
        // This would integrate with the User model and billing service
        // For now, return mock data
        return {
            allowed: true,
            reason: '',
            remainingUsage: 100,
            tier: 'professional'
        };
    }

    private async logCodeGenerationRequest(userId: string, metadata: any): Promise<void> {
        // Log request for analytics and billing
        console.log(`Code generation request logged for user ${userId}:`, metadata);

        // In real implementation, this would:
        // 1. Update user usage statistics
        // 2. Track billing/usage for Stripe
        // 3. Store analytics data
        // 4. Update service metrics
    }

    private async getUserCodeHistory(userId: string, options: {
        page: number;
        limit: number;
        language?: string;
    }): Promise<{ items: any[]; total: number }> {
        // Mock implementation - in real app, this would query database
        return {
            items: [
                {
                    id: '1',
                    prompt: 'Create a React component for user authentication',
                    language: 'javascript',
                    framework: 'React',
                    createdAt: '2024-01-15T10:30:00Z',
                    success: true,
                    linesOfCode: 45
                },
                {
                    id: '2',
                    prompt: 'Generate Python function for data validation',
                    language: 'python',
                    framework: 'None',
                    createdAt: '2024-01-14T15:20:00Z',
                    success: true,
                    linesOfCode: 23
                }
            ],
            total: 25
        };
    }

    private async getUserUsageStats(userId: string, timeRange: string): Promise<any> {
        // Mock implementation - in real app, this would aggregate from database
        return {
            totalGenerations: 156,
            totalLinesGenerated: 12450,
            languageBreakdown: {
                javascript: 45,
                python: 38,
                typescript: 32,
                java: 25,
                other: 16
            },
            frameworkBreakdown: {
                'React': 28,
                'Node.js': 22,
                'Django': 18,
                'Spring': 15,
                'Other': 13
            },
            successRate: 94.2,
            averageResponseTime: 2.8,
            monthlyUsage: [
                { month: '2024-01', generations: 45 },
                { month: '2024-02', generations: 52 },
                { month: '2024-03', generations: 59 }
            ]
        };
    }

    private async saveCodeToLibrary(userId: string, codeData: {
        code: string;
        title: string;
        description?: string;
        language: string;
        tags: string[];
    }): Promise<any> {
        // Mock implementation - in real app, this would save to database
        return {
            id: `code_${Date.now()}`,
            ...codeData,
            userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    private async getUserCodeLibrary(userId: string, options: {
        page: number;
        limit: number;
        language?: string;
        search?: string;
    }): Promise<{ items: any[]; total: number }> {
        // Mock implementation
        return {
            items: [
                {
                    id: 'code_1',
                    title: 'React Authentication Component',
                    description: 'Reusable authentication component with hooks',
                    language: 'javascript',
                    tags: ['react', 'auth', 'hooks'],
                    createdAt: '2024-01-15T10:30:00Z'
                }
            ],
            total: 12
        };
    }

    private async createShareLink(userId: string, shareData: {
        codeId: string;
        shareType: string;
        expiresIn: string;
    }): Promise<any> {
        // Mock implementation - in real app, this would create share tokens
        const shareId = `share_${Date.now()}`;
        return {
            shareId,
            shareUrl: `${process.env.FRONTEND_URL}/shared/${shareId}`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
    }
}

// Rate limiting middleware for CodeForge API
export const codeForgeRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req: Request) => {
        // Different limits based on user tier
        const userTier = (req as any).user?.subscriptionPlan || 'free';

        switch (userTier) {
            case 'enterprise': return 1000;
            case 'professional': return 500;
            case 'starter': return 100;
            default: return 20; // free tier
        }
    },
    message: {
        error: 'Rate limit exceeded',
        message: 'Too many code generation requests. Please upgrade your plan for higher limits.',
        upgradeUrl: '/pricing/codeforge'
    },
    headers: true
});

export const codeForgeController = new CodeForgeController();