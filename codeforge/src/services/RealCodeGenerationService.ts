import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

// Real AI code generation service with multiple providers
export class RealCodeGenerationService {
    private openai: OpenAI;
    private anthropic: Anthropic;

    constructor() {
        // Initialize AI providers
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
    }

    // Main code generation method
    async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
        // Validate user has access and hasn't exceeded limits
        const accessCheck = await this.checkUserAccess(request.userId, 'codeforge');
        if (!accessCheck.allowed) {
            throw new Error(`Access denied: ${accessCheck.reason}`);
        }

        // Choose the best AI provider based on request type
        const provider = this.selectProvider(request);

        // Generate code using selected provider
        let generatedCode: string;
        let explanation: string;
        let confidence: number;

        try {
            switch (provider) {
                case 'openai-gpt4':
                    const gpt4Result = await this.generateWithGPT4(request);
                    generatedCode = gpt4Result.code;
                    explanation = gpt4Result.explanation;
                    confidence = gpt4Result.confidence;
                    break;

                case 'anthropic-claude':
                    const claudeResult = await this.generateWithClaude(request);
                    generatedCode = claudeResult.code;
                    explanation = claudeResult.explanation;
                    confidence = claudeResult.confidence;
                    break;

                case 'codellama':
                    const codeLlamaResult = await this.generateWithCodeLlama(request);
                    generatedCode = codeLlamaResult.code;
                    explanation = codeLlamaResult.explanation;
                    confidence = codeLlamaResult.confidence;
                    break;

                default:
                    throw new Error('No suitable AI provider available');
            }

            // Security scan the generated code
            const securityScan = await this.scanCodeSecurity(generatedCode, request.language);

            // Generate tests if requested
            const tests = request.generateTests ?
                await this.generateTests(generatedCode, request.language, request.testFramework) :
                null;

            // Generate documentation
            const documentation = await this.generateDocumentation(generatedCode, request.language);

            // Track usage for billing
            await this.trackUsage(request.userId, 'code-generation', {
                provider,
                language: request.language,
                linesOfCode: generatedCode.split('\n').length,
                complexity: this.calculateComplexity(generatedCode)
            });

            return {
                success: true,
                code: generatedCode,
                explanation,
                confidence,
                provider,
                language: request.language,
                securityScan,
                tests,
                documentation,
                metadata: {
                    generatedAt: new Date(),
                    tokensUsed: this.estimateTokens(request.prompt + generatedCode),
                    processingTime: Date.now() - request.timestamp
                }
            };

        } catch (error) {
            // Log error and return user-friendly message
            console.error('Code generation failed:', error);

            return {
                success: false,
                error: 'Code generation failed. Please try again or contact support.',
                provider,
                metadata: {
                    generatedAt: new Date(),
                    processingTime: Date.now() - request.timestamp
                }
            };
        }
    }

    // Generate code using GPT-4
    private async generateWithGPT4(request: CodeGenerationRequest): Promise<AIGenerationResult> {
        const systemPrompt = this.buildSystemPrompt(request);
        const userPrompt = this.buildUserPrompt(request);

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4-1106-preview',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.2, // Lower temperature for more consistent code
            max_tokens: 4000,
            response_format: { type: 'json_object' }
        });

        const response = JSON.parse(completion.choices[0].message.content || '{}');

        return {
            code: response.code || '',
            explanation: response.explanation || '',
            confidence: this.calculateConfidence(response, 'gpt4')
        };
    }

    // Generate code using Claude
    private async generateWithClaude(request: CodeGenerationRequest): Promise<AIGenerationResult> {
        const systemPrompt = this.buildSystemPrompt(request);
        const userPrompt = this.buildUserPrompt(request);

        const message = await this.anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 4000,
            temperature: 0.2,
            system: systemPrompt,
            messages: [
                { role: 'user', content: userPrompt }
            ]
        });

        // Parse Claude's response (assuming structured format)
        const content = message.content[0].type === 'text' ? message.content[0].text : '';
        const response = this.parseClaudeResponse(content);

        return {
            code: response.code,
            explanation: response.explanation,
            confidence: this.calculateConfidence(response, 'claude')
        };
    }

    // Generate code using CodeLlama (self-hosted)
    private async generateWithCodeLlama(request: CodeGenerationRequest): Promise<AIGenerationResult> {
        const prompt = this.buildCodeLlamaPrompt(request);

        const response = await axios.post(process.env.CODELLAMA_ENDPOINT!, {
            prompt,
            max_tokens: 4000,
            temperature: 0.2,
            stop: ['</code>', '```']
        });

        const generatedText = response.data.choices[0].text;
        const parsed = this.parseCodeLlamaResponse(generatedText);

        return {
            code: parsed.code,
            explanation: parsed.explanation,
            confidence: this.calculateConfidence(parsed, 'codellama')
        };
    }

    // Security scanning for generated code
    private async scanCodeSecurity(code: string, language: string): Promise<SecurityScanResult> {
        const vulnerabilities: SecurityIssue[] = [];

        // Common security patterns to check
        const securityPatterns = {
            'sql-injection': /(?:SELECT|INSERT|UPDATE|DELETE).*(?:\$|%s|%d)/gi,
            'xss-vulnerability': /<script|javascript:|onclick|onerror/gi,
            'hardcoded-secrets': /(?:password|secret|key|token)\s*[:=]\s*['"]/gi,
            'command-injection': /(?:exec|system|shell_exec|eval)\s*\(/gi,
            'path-traversal': /\.\.\/|\.\.\\|\.\.\%2f/gi
        };

        for (const [vulnType, pattern] of Object.entries(securityPatterns)) {
            const matches = code.match(pattern);
            if (matches) {
                vulnerabilities.push({
                    type: vulnType,
                    severity: this.getVulnerabilitySeverity(vulnType),
                    description: this.getVulnerabilityDescription(vulnType),
                    occurrences: matches.length,
                    suggestions: this.getSecuritySuggestions(vulnType)
                });
            }
        }

        return {
            isSecure: vulnerabilities.length === 0,
            vulnerabilities,
            scanDate: new Date(),
            language
        };
    }

    // Generate tests for the code
    private async generateTests(code: string, language: string, framework?: string): Promise<string> {
        const testPrompt = `Generate comprehensive unit tests for the following ${language} code using ${framework || 'the standard testing framework'}:

\`\`\`${language}
${code}
\`\`\`

Requirements:
- Test all public methods/functions
- Include edge cases and error conditions
- Use proper assertions
- Follow testing best practices for ${language}
- Return only the test code, no explanations`;

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: testPrompt }],
            temperature: 0.3,
            max_tokens: 2000
        });

        return completion.choices[0].message.content || '';
    }

    // Generate documentation for the code
    private async generateDocumentation(code: string, language: string): Promise<string> {
        const docPrompt = `Generate comprehensive documentation for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Include:
- Overview of what the code does
- Function/method descriptions
- Parameter explanations
- Return value descriptions
- Usage examples
- Any important notes or warnings

Format as markdown.`;

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: docPrompt }],
            temperature: 0.4,
            max_tokens: 1500
        });

        return completion.choices[0].message.content || '';
    }

    // Helper methods
    private selectProvider(request: CodeGenerationRequest): string {
        // Logic to select best provider based on request characteristics
        if (request.language === 'python' && request.complexity === 'high') {
            return 'anthropic-claude'; // Claude is good at Python
        } else if (request.language === 'javascript' || request.language === 'typescript') {
            return 'openai-gpt4'; // GPT-4 excels at JS/TS
        } else if (request.requiresOptimization) {
            return 'codellama'; // CodeLlama for performance-critical code
        }

        return 'openai-gpt4'; // Default to GPT-4
    }

    private buildSystemPrompt(request: CodeGenerationRequest): string {
        return `You are an expert software engineer specializing in ${request.language}. 
Generate high-quality, production-ready code that follows best practices.

Requirements:
- Language: ${request.language}
- Style: ${request.codeStyle || 'standard'}
- Framework: ${request.framework || 'none'}
- Security: Always write secure code
- Performance: Optimize for performance when possible
- Maintainability: Write clean, readable code

Return your response as JSON with this structure:
{
  "code": "the generated code",
  "explanation": "explanation of what the code does and key design decisions"
}`;
    }

    private buildUserPrompt(request: CodeGenerationRequest): string {
        let prompt = `Generate ${request.language} code for: ${request.prompt}`;

        if (request.requirements) {
            prompt += `\n\nAdditional requirements:\n${request.requirements.join('\n')}`;
        }

        if (request.context) {
            prompt += `\n\nContext: ${request.context}`;
        }

        return prompt;
    }

    private async checkUserAccess(userId: string, serviceName: string): Promise<AccessCheckResult> {
        // This would integrate with the User model to check access
        // For now, return a mock implementation
        return {
            allowed: true,
            reason: '',
            remainingUsage: 100,
            tier: 'professional'
        };
    }

    private async trackUsage(userId: string, operation: string, metadata: any): Promise<void> {
        // This would integrate with the billing service to track usage
        console.log(`Usage tracked for user ${userId}: ${operation}`, metadata);
    }

    private calculateComplexity(code: string): number {
        // Simple complexity calculation based on code characteristics
        const lines = code.split('\n').length;
        const functions = (code.match(/function|def |class /g) || []).length;
        const conditions = (code.match(/if |while |for |switch/g) || []).length;

        return Math.min(10, Math.round((lines / 10) + (functions * 2) + (conditions * 1.5)));
    }

    private estimateTokens(text: string): number {
        // Rough token estimation (1 token ≈ 4 characters)
        return Math.ceil(text.length / 4);
    }

    private calculateConfidence(response: any, provider: string): number {
        // Calculate confidence based on response quality and provider
        let confidence = 0.8; // Base confidence

        if (response.code && response.code.length > 50) confidence += 0.1;
        if (response.explanation && response.explanation.length > 100) confidence += 0.05;
        if (provider === 'openai-gpt4') confidence += 0.05;

        return Math.min(1.0, confidence);
    }

    private parseClaudeResponse(content: string): any {
        // Parse Claude's response - implement based on actual format
        try {
            return JSON.parse(content);
        } catch {
            // Fallback parsing if not JSON
            const codeMatch = content.match(/```[\w]*\n([\s\S]*?)\n```/);
            return {
                code: codeMatch ? codeMatch[1] : content,
                explanation: 'Code generated by Claude'
            };
        }
    }

    private buildCodeLlamaPrompt(request: CodeGenerationRequest): string {
        return `<s>[INST] Generate ${request.language} code for: ${request.prompt} [/INST]`;
    }

    private parseCodeLlamaResponse(response: string): any {
        const codeMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
        return {
            code: codeMatch ? codeMatch[1] : response,
            explanation: 'Code generated by CodeLlama'
        };
    }

    private getVulnerabilitySeverity(vulnType: string): 'low' | 'medium' | 'high' | 'critical' {
        const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
            'sql-injection': 'critical',
            'xss-vulnerability': 'high',
            'hardcoded-secrets': 'high',
            'command-injection': 'critical',
            'path-traversal': 'high'
        };
        return severityMap[vulnType] || 'medium';
    }

    private getVulnerabilityDescription(vulnType: string): string {
        const descriptions: Record<string, string> = {
            'sql-injection': 'Potential SQL injection vulnerability detected',
            'xss-vulnerability': 'Potential cross-site scripting (XSS) vulnerability',
            'hardcoded-secrets': 'Hardcoded secrets or credentials detected',
            'command-injection': 'Potential command injection vulnerability',
            'path-traversal': 'Potential path traversal vulnerability'
        };
        return descriptions[vulnType] || 'Security issue detected';
    }

    private getSecuritySuggestions(vulnType: string): string[] {
        const suggestions: Record<string, string[]> = {
            'sql-injection': [
                'Use parameterized queries or prepared statements',
                'Validate and sanitize all user inputs',
                'Use ORM frameworks with built-in protection'
            ],
            'xss-vulnerability': [
                'Escape all user-generated content',
                'Use Content Security Policy (CSP)',
                'Validate and sanitize inputs'
            ],
            'hardcoded-secrets': [
                'Use environment variables for secrets',
                'Implement proper secret management',
                'Never commit secrets to version control'
            ]
        };
        return suggestions[vulnType] || ['Review and fix security issue'];
    }
}

// Type definitions
export interface CodeGenerationRequest {
    userId: string;
    prompt: string;
    language: string;
    framework?: string;
    codeStyle?: string;
    complexity?: 'low' | 'medium' | 'high';
    requirements?: string[];
    context?: string;
    generateTests?: boolean;
    testFramework?: string;
    requiresOptimization?: boolean;
    timestamp: number;
}

export interface CodeGenerationResponse {
    success: boolean;
    code?: string;
    explanation?: string;
    confidence?: number;
    provider?: string;
    language?: string;
    securityScan?: SecurityScanResult;
    tests?: string;
    documentation?: string;
    error?: string;
    metadata: {
        generatedAt: Date;
        tokensUsed?: number;
        processingTime: number;
    };
}

interface AIGenerationResult {
    code: string;
    explanation: string;
    confidence: number;
}

interface SecurityScanResult {
    isSecure: boolean;
    vulnerabilities: SecurityIssue[];
    scanDate: Date;
    language: string;
}

interface SecurityIssue {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    occurrences: number;
    suggestions: string[];
}

interface AccessCheckResult {
    allowed: boolean;
    reason: string;
    remainingUsage: number;
    tier: string;
}

export const codeGenerationService = new RealCodeGenerationService();