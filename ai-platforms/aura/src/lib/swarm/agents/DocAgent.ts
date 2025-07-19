import { 
  SwarmAgent, 
  SwarmTask, 
  SwarmResult, 
  TaskType, 
  AgentCapability, 
  AgentMetrics, 
  AgentConfig 
} from '../SwarmOrchestrator';

// Documentation-specific types
export interface SecurityRequirement {
  [scheme: string]: string[];
}
export interface DocumentationResult {
  apiDocs: APIDocumentation;
  readme: README;
  changelog: Changelog;
  examples: CodeExample[];
  diagrams: Diagram[];
  tutorials: Tutorial[];
  translations: Translation[];
  metrics: DocumentationMetrics;
}

export interface APIDocumentation {
  title: string;
  version: string;
  description: string;
  baseUrl: string;
  endpoints: APIEndpoint[];
  schemas: DataSchema[];
  authentication: AuthenticationDoc;
  errorCodes: ErrorCode[];
  examples: APIExample[];
}

export interface APIEndpoint {
  path: string;
  method: HTTPMethod;
  summary: string;
  description: string;
  parameters: Parameter[];
  requestBody?: RequestBody;
  responses: APIResponse[];
  examples: EndpointExample[];
  security: SecurityRequirement[];
  tags: string[];
  deprecated: boolean;
}

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

export interface Parameter {
  name: string;
  location: 'query' | 'path' | 'header' | 'cookie';
  description: string;
  required: boolean;
  type: string;
  format?: string;
  example?: any;
  enum?: string[];
  pattern?: string;
}

export interface RequestBody {
  description: string;
  required: boolean;
  contentType: string;
  schema: DataSchema;
  examples: any[];
}

export interface APIResponse {
  statusCode: number;
  description: string;
  headers?: Record<string, string>;
  schema?: DataSchema;
  examples?: any[];
}

export interface EndpointExample {
  name: string;
  description: string;
  request: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
  };
  response: {
    statusCode: number;
    headers?: Record<string, string>;
    body: any;
  };
}

export interface DataSchema {
  type: string;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
  description?: string;
  example?: any;
}

export interface SchemaProperty {
  type: string;
  description: string;
  format?: string;
  enum?: string[];
  items?: DataSchema;
  example?: any;
}

export interface AuthenticationDoc {
  type: 'bearer' | 'apiKey' | 'oauth2' | 'basic';
  description: string;
  location?: 'header' | 'query' | 'cookie';
  name?: string;
  flows?: OAuthFlow[];
  examples: AuthExample[];
}

export interface OAuthFlow {
  type: 'implicit' | 'password' | 'clientCredentials' | 'authorizationCode';
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface AuthExample {
  name: string;
  description: string;
  value: string;
}

export interface ErrorCode {
  code: number;
  message: string;
  description: string;
  resolution: string;
  examples: string[];
}

export interface APIExample {
  title: string;
  description: string;
  language: string;
  code: string;
  response: string;
}

export interface README {
  title: string;
  description: string;
  badges: Badge[];
  sections: READMESection[];
  tableOfContents: TOCEntry[];
  lastUpdated: Date;
}

export interface Badge {
  label: string;
  message: string;
  color: string;
  style: 'flat' | 'flat-square' | 'plastic' | 'for-the-badge';
  url?: string;
}

export interface READMESection {
  id: string;
  title: string;
  level: number; // H1, H2, H3, etc.
  content: string;
  type: SectionType;
  order: number;
}

export enum SectionType {
  OVERVIEW = 'overview',
  INSTALLATION = 'installation',
  USAGE = 'usage',
  API = 'api',
  EXAMPLES = 'examples',
  CONTRIBUTING = 'contributing',
  LICENSE = 'license',
  CHANGELOG = 'changelog',
  FAQ = 'faq',
  TROUBLESHOOTING = 'troubleshooting'
}

export interface TOCEntry {
  title: string;
  anchor: string;
  level: number;
  children: TOCEntry[];
}

export interface Changelog {
  version: string;
  entries: ChangelogEntry[];
  format: 'keepachangelog' | 'conventional' | 'custom';
  lastUpdated: Date;
}

export interface ChangelogEntry {
  version: string;
  date: Date;
  description?: string;
  changes: Change[];
  breaking: boolean;
  yanked: boolean;
}

export interface Change {
  type: ChangeType;
  description: string;
  scope?: string;
  breaking: boolean;
  references: string[];
  author?: string;
}

export enum ChangeType {
  ADDED = 'added',
  CHANGED = 'changed',
  DEPRECATED = 'deprecated',
  REMOVED = 'removed',
  FIXED = 'fixed',
  SECURITY = 'security'
}

export interface CodeExample {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  output?: string;
  category: ExampleCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  dependencies: string[];
  runnable: boolean;
}

export enum ExampleCategory {
  BASIC_USAGE = 'basic_usage',
  ADVANCED = 'advanced',
  INTEGRATION = 'integration',
  TUTORIAL = 'tutorial',
  COOKBOOK = 'cookbook',
  BENCHMARK = 'benchmark'
}

export interface Diagram {
  id: string;
  title: string;
  type: DiagramType;
  description: string;
  source: string; // Mermaid, PlantUML, etc.
  format: 'mermaid' | 'plantuml' | 'graphviz' | 'svg';
  category: string;
  generated: boolean;
}

export enum DiagramType {
  FLOWCHART = 'flowchart',
  SEQUENCE = 'sequence',
  CLASS = 'class',
  ER = 'er',
  GANTT = 'gantt',
  GITGRAPH = 'gitgraph',
  ARCHITECTURE = 'architecture',
  DEPLOYMENT = 'deployment'
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  prerequisites: string[];
  steps: TutorialStep[];
  resources: Resource[];
  tags: string[];
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  code?: string;
  expected?: string;
  hints: string[];
  validation?: string;
}

export interface Resource {
  title: string;
  url: string;
  type: 'documentation' | 'video' | 'article' | 'repository' | 'tool';
  description: string;
}

export interface Translation {
  language: string;
  locale: string;
  completeness: number; // 0-1
  lastUpdated: Date;
  translatedSections: string[];
  missingSections: string[];
}

export interface DocumentationMetrics {
  coverage: CoverageMetrics;
  quality: QualityMetrics;
  usage: UsageMetrics;
  freshness: FreshnessMetrics;
}

export interface CoverageMetrics {
  overallCoverage: number; // 0-1
  apiCoverage: number;
  codeCoverage: number;
  exampleCoverage: number;
  missingDocumentation: string[];
}

export interface QualityMetrics {
  readabilityScore: number; // 0-100
  completenessScore: number; // 0-100
  accuracyScore: number; // 0-100
  consistency: number; // 0-1
  issues: QualityIssue[];
}

export interface QualityIssue {
  type: 'spelling' | 'grammar' | 'formatting' | 'broken_link' | 'outdated';
  severity: 'low' | 'medium' | 'high';
  location: string;
  description: string;
  suggestion?: string;
}

export interface UsageMetrics {
  pageViews: Record<string, number>;
  searchQueries: string[];
  mostViewedSections: string[];
  bounceRate: number;
  timeOnPage: Record<string, number>;
}

export interface FreshnessMetrics {
  lastUpdated: Date;
  staleSections: string[];
  outdatedExamples: string[];
  brokenLinks: string[];
  updateFrequency: number; // days
}

// Auto-Documentation Engine
class AutoDocumentationEngine {
  generateAPIDocumentation(code: string, language: string): APIDocumentation {
    const endpoints = this.extractAPIEndpoints(code, language);
    const schemas = this.extractDataSchemas(code, language);
    const auth = this.extractAuthentication(code);
    const errors = this.extractErrorCodes(code);

    return {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Auto-generated API documentation',
      baseUrl: this.extractBaseUrl(code),
      endpoints,
      schemas,
      authentication: auth,
      errorCodes: errors,
      examples: this.generateAPIExamples(endpoints)
    };
  }

  private extractAPIEndpoints(code: string, language: string): APIEndpoint[] {
    const endpoints: APIEndpoint[] = [];

    switch (language) {
      case 'typescript':
      case 'javascript':
        return this.extractJSEndpoints(code);
      case 'python':
        return this.extractPythonEndpoints(code);
      default:
        return this.extractGenericEndpoints(code);
    }
  }

  private extractJSEndpoints(code: string): APIEndpoint[] {
    const endpoints: APIEndpoint[] = [];
    const patterns = [
      /app\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g,
      /router\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g,
      /@(Get|Post|Put|Delete|Patch)\(['"`]([^'"`]+)['"`]/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const method = match[1].toUpperCase() as HTTPMethod;
        const path = match[2];
        
        endpoints.push({
          path,
          method,
          summary: `${method} ${path}`,
          description: this.extractEndpointDescription(code, path),
          parameters: this.extractParameters(code, path),
          responses: this.generateDefaultResponses(),
          examples: [],
          security: [],
          tags: this.extractTags(path),
          deprecated: false
        });
      }
    }

    return endpoints;
  }

  private extractPythonEndpoints(code: string): APIEndpoint[] {
    const endpoints: APIEndpoint[] = [];
    const patterns = [
      /@app\.route\(['"`]([^'"`]+)['"`].*methods\s*=\s*\[['"`](\w+)['"`]\]/g,
      /@router\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const path = match[1];
        const method = (match[2] || 'GET').toUpperCase() as HTTPMethod;
        
        endpoints.push({
          path,
          method,
          summary: `${method} ${path}`,
          description: this.extractEndpointDescription(code, path),
          parameters: this.extractParameters(code, path),
          responses: this.generateDefaultResponses(),
          examples: [],
          security: [],
          tags: this.extractTags(path),
          deprecated: false
        });
      }
    }

    return endpoints;
  }

  private extractGenericEndpoints(code: string): APIEndpoint[] {
    // Fallback for unknown languages
    const endpoints: APIEndpoint[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      if (line.includes('/api/') || line.includes('endpoint')) {
        const pathMatch = line.match(/['"]([^'"]*\/[^'"]*)['"]/);
        if (pathMatch) {
          endpoints.push({
            path: pathMatch[1],
            method: HTTPMethod.GET,
            summary: `API endpoint ${pathMatch[1]}`,
            description: 'Auto-detected API endpoint',
            parameters: [],
            responses: this.generateDefaultResponses(),
            examples: [],
            security: [],
            tags: [],
            deprecated: false
          });
        }
      }
    });

    return endpoints;
  }

  private extractEndpointDescription(code: string, path: string): string {
    // Look for comments above the endpoint definition
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(path)) {
        // Check previous lines for comments
        for (let j = i - 1; j >= 0 && j >= i - 5; j--) {
          const line = lines[j].trim();
          if (line.startsWith('//') || line.startsWith('#') || line.startsWith('"""')) {
            return line.replace(/^(\/\/|#|""")/, '').trim();
          }
        }
        break;
      }
    }
    return `Endpoint for ${path}`;
  }

  private extractParameters(code: string, path: string): Parameter[] {
    const parameters: Parameter[] = [];
    
    // Extract path parameters
    const pathParams = path.match(/:(\w+)/g) || path.match(/\{(\w+)\}/g);
    if (pathParams) {
      pathParams.forEach(param => {
        const name = param.replace(/[:{}\[\]]/g, '');
        parameters.push({
          name,
          location: 'path',
          description: `Path parameter: ${name}`,
          required: true,
          type: 'string'
        });
      });
    }

    // Look for query parameters in nearby code
    const codeSection = this.getCodeSectionForPath(code, path);
    const queryMatches = codeSection.match(/req\.query\.(\w+)/g) || 
                        codeSection.match(/request\.args\.get\(['"`](\w+)['"`]\)/g);
    
    if (queryMatches) {
      queryMatches.forEach(match => {
        const name = match.match(/(\w+)(?=['"`\]]|$)/)?.[1];
        if (name && !parameters.some(p => p.name === name)) {
          parameters.push({
            name,
            location: 'query',
            description: `Query parameter: ${name}`,
            required: false,
            type: 'string'
          });
        }
      });
    }

    return parameters;
  }

  private getCodeSectionForPath(code: string, path: string): string {
    const lines = code.split('\n');
    let startIndex = -1;
    let endIndex = -1;

    // Find the line with the path
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(path)) {
        startIndex = Math.max(0, i - 5);
        endIndex = Math.min(lines.length - 1, i + 20);
        break;
      }
    }

    return startIndex >= 0 ? lines.slice(startIndex, endIndex + 1).join('\n') : '';
  }

  private generateDefaultResponses(): APIResponse[] {
    return [
      {
        statusCode: 200,
        description: 'Successful response',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: 'Operation success status' },
            data: { type: 'object', description: 'Response data' }
          }
        }
      },
      {
        statusCode: 400,
        description: 'Bad request',
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Error message' }
          }
        }
      },
      {
        statusCode: 500,
        description: 'Internal server error',
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Error message' }
          }
        }
      }
    ];
  }

  private extractTags(path: string): string[] {
    const segments = path.split('/').filter(s => s && !s.includes(':') && !s.includes('{'));
    return segments.length > 1 ? [segments[1]] : ['general'];
  }

  private extractDataSchemas(code: string, language: string): DataSchema[] {
    const schemas: DataSchema[] = [];

    switch (language) {
      case 'typescript':
        return this.extractTypeScriptSchemas(code);
      case 'python':
        return this.extractPythonSchemas(code);
      default:
        return schemas;
    }
  }

  private extractTypeScriptSchemas(code: string): DataSchema[] {
    const schemas: DataSchema[] = [];
    const interfacePattern = /interface\s+(\w+)\s*\{([^}]+)\}/g;

    let match;
    while ((match = interfacePattern.exec(code)) !== null) {
      const name = match[1];
      const body = match[2];
      const properties: Record<string, SchemaProperty> = {};

      const propPattern = /(\w+)(\?)?\s*:\s*([^;,\n]+)/g;
      let propMatch;
      while ((propMatch = propPattern.exec(body)) !== null) {
        const propName = propMatch[1];
        const optional = !!propMatch[2];
        const propType = propMatch[3].trim();

        properties[propName] = {
          type: this.mapTypeScriptToJsonSchema(propType),
          description: `Property: ${propName}`
        };
      }

      schemas.push({
        type: 'object',
        properties,
        description: `Interface: ${name}`
      });
    }

    return schemas;
  }

  private extractPythonSchemas(code: string): DataSchema[] {
    const schemas: DataSchema[] = [];
    const classPattern = /class\s+(\w+).*?:\s*([\s\S]*?)(?=\nclass|\n\w|\Z)/g;

    let match;
    while ((match = classPattern.exec(code)) !== null) {
      const name = match[1];
      const body = match[2];
      
      if (body.includes('BaseModel') || body.includes('Schema')) {
        const properties: Record<string, SchemaProperty> = {};
        const propPattern = /(\w+)\s*:\s*([^\n=]+)/g;
        
        let propMatch;
        while ((propMatch = propPattern.exec(body)) !== null) {
          const propName = propMatch[1];
          const propType = propMatch[2].trim();

          properties[propName] = {
            type: this.mapPythonToJsonSchema(propType),
            description: `Property: ${propName}`
          };
        }

        schemas.push({
          type: 'object',
          properties,
          description: `Schema: ${name}`
        });
      }
    }

    return schemas;
  }

  private mapTypeScriptToJsonSchema(type: string): string {
    const mapping: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'Date': 'string',
      'any': 'object'
    };

    if (type.includes('[]')) return 'array';
    if (type.includes('|')) return 'string'; // Union types -> string
    
    return mapping[type] || 'object';
  }

  private mapPythonToJsonSchema(type: string): string {
    const mapping: Record<string, string> = {
      'str': 'string',
      'int': 'integer',
      'float': 'number',
      'bool': 'boolean',
      'list': 'array',
      'dict': 'object',
      'List': 'array',
      'Dict': 'object'
    };

    return mapping[type] || 'object';
  }

  private extractAuthentication(code: string): AuthenticationDoc {
    if (code.includes('Bearer') || code.includes('JWT')) {
      return {
        type: 'bearer',
        description: 'JWT Bearer token authentication',
        examples: [
          {
            name: 'Bearer Token',
            description: 'Include JWT token in Authorization header',
            value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        ]
      };
    }

    if (code.includes('api_key') || code.includes('apiKey')) {
      return {
        type: 'apiKey',
        description: 'API Key authentication',
        location: 'header',
        name: 'X-API-Key',
        examples: [
          {
            name: 'API Key',
            description: 'Include API key in header',
            value: 'your-api-key-here'
          }
        ]
      };
    }

    return {
      type: 'bearer',
      description: 'Authentication required',
      examples: []
    };
  }

  private extractErrorCodes(code: string): ErrorCode[] {
    const errors: ErrorCode[] = [];
    const errorPattern = /throw.*Error.*['"`]([^'"`]+)['"`]|res\.status\((\d+)\).*['"`]([^'"`]+)['"`]/g;

    let match;
    while ((match = errorPattern.exec(code)) !== null) {
      const message = match[1] || match[3];
      const code_num = match[2] ? parseInt(match[2]) : 500;

      if (message && !errors.some(e => e.message === message)) {
        errors.push({
          code: code_num,
          message,
          description: `Error: ${message}`,
          resolution: 'Check the request parameters and try again',
          examples: [`HTTP ${code_num}: ${message}`]
        });
      }
    }

    return errors;
  }

  private extractBaseUrl(code: string): string {
    const patterns = [
      /baseURL\s*[:=]\s*['"`]([^'"`]+)['"`]/,
      /host\s*[:=]\s*['"`]([^'"`]+)['"`]/,
      /app\.listen\(\d+.*['"`]([^'"`]+)['"`]/
    ];

    for (const pattern of patterns) {
      const match = code.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return 'http://localhost:3000';
  }

  private generateAPIExamples(endpoints: APIEndpoint[]): APIExample[] {
    return endpoints.slice(0, 3).map(endpoint => ({
      title: `${endpoint.method} ${endpoint.path} Example`,
      description: `Example usage of ${endpoint.summary}`,
      language: 'curl',
      code: this.generateCurlExample(endpoint),
      response: this.generateExampleResponse(endpoint)
    }));
  }

  private generateCurlExample(endpoint: APIEndpoint): string {
    let curl = `curl -X ${endpoint.method} "${endpoint.path}"`;
    
    if (endpoint.method !== HTTPMethod.GET) {
      curl += ' \\\n  -H "Content-Type: application/json"';
      if (endpoint.requestBody) {
        curl += ' \\\n  -d \'{"example": "data"}\'';
      }
    }

    return curl;
  }

  private generateExampleResponse(endpoint: APIEndpoint): string {
    const successResponse = endpoint.responses.find(r => r.statusCode === 200);
    if (successResponse?.schema) {
      return JSON.stringify({
        success: true,
        data: this.generateExampleFromSchema(successResponse.schema)
      }, null, 2);
    }

    return JSON.stringify({ success: true, message: 'Operation completed' }, null, 2);
  }

  private generateExampleFromSchema(schema: DataSchema): any {
    if (schema.example) return schema.example;

    switch (schema.type) {
      case 'string':
        return 'example_string';
      case 'number':
      case 'integer':
        return 42;
      case 'boolean':
        return true;
      case 'array':
        return ['example'];
      case 'object':
        const obj: any = {};
        if (schema.properties) {
          for (const [key, prop] of Object.entries(schema.properties)) {
            obj[key] = this.generateExampleFromSchema(prop as DataSchema);
          }
        }
        return obj;
      default:
        return null;
    }
  }
}

// README Generation Engine
class READMEGenerator {
  generateREADME(code: string, projectInfo: any): README {
    const sections = this.generateSections(code, projectInfo);
    const toc = this.generateTableOfContents(sections);
    const badges = this.generateBadges(projectInfo);

    return {
      title: projectInfo.name || 'Project',
      description: projectInfo.description || 'A software project',
      badges,
      sections,
      tableOfContents: toc,
      lastUpdated: new Date()
    };
  }

  private generateSections(code: string, projectInfo: any): READMESection[] {
    const sections: READMESection[] = [];

    // Overview section
    sections.push({
      id: 'overview',
      title: 'Overview',
      level: 2,
      content: this.generateOverview(projectInfo),
      type: SectionType.OVERVIEW,
      order: 1
    });

    // Installation section
    sections.push({
      id: 'installation',
      title: 'Installation',
      level: 2,
      content: this.generateInstallation(projectInfo),
      type: SectionType.INSTALLATION,
      order: 2
    });

    // Usage section
    sections.push({
      id: 'usage',
      title: 'Usage',
      level: 2,
      content: this.generateUsage(code, projectInfo),
      type: SectionType.USAGE,
      order: 3
    });

    // API section
    if (this.hasAPI(code)) {
      sections.push({
        id: 'api',
        title: 'API Reference',
        level: 2,
        content: this.generateAPISection(code),
        type: SectionType.API,
        order: 4
      });
    }

    // Examples section
    sections.push({
      id: 'examples',
      title: 'Examples',
      level: 2,
      content: this.generateExamples(code),
      type: SectionType.EXAMPLES,
      order: 5
    });

    // Contributing section
    sections.push({
      id: 'contributing',
      title: 'Contributing',
      level: 2,
      content: this.generateContributing(),
      type: SectionType.CONTRIBUTING,
      order: 6
    });

    // License section
    sections.push({
      id: 'license',
      title: 'License',
      level: 2,
      content: this.generateLicense(projectInfo),
      type: SectionType.LICENSE,
      order: 7
    });

    return sections;
  }

  private generateOverview(projectInfo: any): string {
    return `${projectInfo.description || 'A software project'}

## Features

${this.extractFeatures(projectInfo).map(feature => `- ${feature}`).join('\n')}

## Requirements

${this.extractRequirements(projectInfo).map(req => `- ${req}`).join('\n')}`;
  }

  private extractFeatures(projectInfo: any): string[] {
    return projectInfo.features || [
      'Modern architecture',
      'High performance',
      'Easy to use',
      'Well documented'
    ];
  }

  private extractRequirements(projectInfo: any): string[] {
    return projectInfo.requirements || [
      'Node.js 18+',
      'TypeScript 4.9+',
      'Modern web browser'
    ];
  }

  private generateInstallation(projectInfo: any): string {
    const packageManager = projectInfo.packageManager || 'npm';
    const packageName = projectInfo.name || 'project-name';

    return `### Using ${packageManager}

\`\`\`bash
${packageManager} install ${packageName}
\`\`\`

### From source

\`\`\`bash
git clone https://github.com/user/${packageName}.git
cd ${packageName}
${packageManager} install
${packageManager} run build
\`\`\``;
  }

  private generateUsage(code: string, projectInfo: any): string {
    const mainFunction = this.extractMainFunction(code);
    const importName = projectInfo.name || 'library';

    return `### Basic Usage

\`\`\`typescript
import { ${mainFunction} } from '${importName}';

// Basic example
const result = ${mainFunction}();
console.log(result);
\`\`\`

### Advanced Usage

\`\`\`typescript
// Configure options
const options = {
  // Add configuration options here
};

const result = ${mainFunction}(options);
\`\`\``;
  }

  private extractMainFunction(code: string): string {
    const exportMatches = code.match(/export\s+(?:function|const)\s+(\w+)/g);
    if (exportMatches && exportMatches.length > 0) {
      const match = exportMatches[0].match(/(\w+)$/);
      return match ? match[1] : 'main';
    }
    return 'main';
  }

  private hasAPI(code: string): boolean {
    return code.includes('app.') || code.includes('router.') || code.includes('@') && code.includes('(');
  }

  private generateAPISection(code: string): string {
    return `This project provides a REST API. See the [API Documentation](#api-documentation) for detailed endpoint information.

### Quick Reference

- Base URL: \`http://localhost:3000/api\`
- Authentication: Bearer token
- Response format: JSON

### Endpoints

${this.extractEndpointSummary(code)}`;
  }

  private extractEndpointSummary(code: string): string {
    const patterns = [
      /app\.(get|post|put|delete)\(['"`]([^'"`]+)['"`]/g,
      /router\.(get|post|put|delete)\(['"`]([^'"`]+)['"`]/g
    ];

    const endpoints: string[] = [];
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const method = match[1].toUpperCase();
        const path = match[2];
        endpoints.push(`- \`${method} ${path}\``);
      }
    }

    return endpoints.length > 0 ? endpoints.join('\n') : '- API endpoints will be documented here';
  }

  private generateExamples(code: string): string {
    return `### Example 1: Basic Usage

\`\`\`typescript
// Example code will be generated based on your implementation
\`\`\`

### Example 2: Advanced Configuration

\`\`\`typescript
// Advanced examples will be added here
\`\`\`

### Example 3: Integration

\`\`\`typescript
// Integration examples will be provided
\`\`\``;
  }

  private generateContributing(): string {
    return `We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature-name\`
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: \`npm test\`
6. Commit your changes: \`git commit -am 'Add feature'\`
7. Push to the branch: \`git push origin feature-name\`
8. Submit a pull request

### Development Setup

\`\`\`bash
git clone https://github.com/user/repo.git
cd repo
npm install
npm run dev
\`\`\`

### Code Style

- Use TypeScript
- Follow ESLint rules
- Add JSDoc comments
- Write tests for new features`;
  }

  private generateLicense(projectInfo: any): string {
    const license = projectInfo.license || 'MIT';
    return `This project is licensed under the ${license} License - see the [LICENSE](LICENSE) file for details.`;
  }

  private generateTableOfContents(sections: READMESection[]): TOCEntry[] {
    return sections.map(section => ({
      title: section.title,
      anchor: `#${section.id}`,
      level: section.level,
      children: []
    }));
  }

  private generateBadges(projectInfo: any): Badge[] {
    const badges: Badge[] = [];

    // Version badge
    if (projectInfo.version) {
      badges.push({
        label: 'version',
        message: projectInfo.version,
        color: 'blue',
        style: 'flat'
      });
    }

    // License badge
    if (projectInfo.license) {
      badges.push({
        label: 'license',
        message: projectInfo.license,
        color: 'green',
        style: 'flat'
      });
    }

    // Build status
    badges.push({
      label: 'build',
      message: 'passing',
      color: 'brightgreen',
      style: 'flat'
    });

    // Coverage
    badges.push({
      label: 'coverage',
      message: '90%',
      color: 'brightgreen',
      style: 'flat'
    });

    return badges;
  }
}

// Changelog Generator
class ChangelogGenerator {
  generateChangelog(gitHistory: any[], currentVersion: string): Changelog {
    const entries = this.processGitHistory(gitHistory);
    
    return {
      version: currentVersion,
      entries,
      format: 'keepachangelog',
      lastUpdated: new Date()
    };
  }

  private processGitHistory(history: any[]): ChangelogEntry[] {
    const entries: ChangelogEntry[] = [];
    const groupedByVersion = this.groupByVersion(history);

    for (const [version, commits] of Object.entries(groupedByVersion)) {
      const changes = this.categorizeCommits(commits as any[]);
      const hasBreaking = changes.some(c => c.breaking);

      entries.push({
        version,
        date: new Date(), // In real implementation, get from git tag
        changes,
        breaking: hasBreaking,
        yanked: false
      });
    }

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private groupByVersion(history: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {};
    let currentVersion = '1.0.0';

    for (const commit of history) {
      if (commit.type === 'tag') {
        currentVersion = commit.version;
      }
      
      if (!groups[currentVersion]) {
        groups[currentVersion] = [];
      }
      groups[currentVersion].push(commit);
    }

    return groups;
  }

  private categorizeCommits(commits: any[]): Change[] {
    return commits.map(commit => {
      const type = this.determineChangeType(commit.message);
      const breaking = commit.message.includes('BREAKING CHANGE') || commit.message.includes('!:');

      return {
        type,
        description: this.cleanCommitMessage(commit.message),
        breaking,
        references: this.extractReferences(commit.message),
        author: commit.author
      };
    });
  }

  private determineChangeType(message: string): ChangeType {
    const lower = message.toLowerCase();
    
    if (lower.includes('feat') || lower.includes('add')) return ChangeType.ADDED;
    if (lower.includes('fix') || lower.includes('bug')) return ChangeType.FIXED;
    if (lower.includes('break') || lower.includes('remove')) return ChangeType.CHANGED;
    if (lower.includes('deprecat')) return ChangeType.DEPRECATED;
    if (lower.includes('secur')) return ChangeType.SECURITY;
    
    return ChangeType.CHANGED;
  }

  private cleanCommitMessage(message: string): string {
    // Remove conventional commit prefixes and clean up
    return message
      .replace(/^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?\s*:\s*/, '')
      .replace(/\n.*$/, '') // Take only first line
      .trim();
  }

  private extractReferences(message: string): string[] {
    const references: string[] = [];
    
    // Extract issue references (#123)
    const issueRefs = message.match(/#\d+/g);
    if (issueRefs) {
      references.push(...issueRefs);
    }

    // Extract PR references
    const prRefs = message.match(/PR #\d+/g);
    if (prRefs) {
      references.push(...prRefs);
    }

    return references;
  }
}

// Example Generation Engine
class ExampleGenerator {
  generateExamples(code: string, language: string): CodeExample[] {
    const functions = this.extractFunctions(code, language);
    const examples: CodeExample[] = [];

    for (const func of functions) {
      examples.push(this.generateFunctionExample(func, language));
    }

    // Add integration examples
    examples.push(...this.generateIntegrationExamples(code, language));

    return examples;
  }

  private extractFunctions(code: string, language: string): any[] {
    const functions: any[] = [];

    switch (language) {
      case 'typescript':
      case 'javascript':
        return this.extractJSFunctions(code);
      case 'python':
        return this.extractPythonFunctions(code);
      default:
        return functions;
    }
  }

  private extractJSFunctions(code: string): any[] {
    const functions: any[] = [];
    const patterns = [
      /export\s+function\s+(\w+)\s*\(([^)]*)\)/g,
      /export\s+const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        functions.push({
          name: match[1],
          parameters: match[2],
          exported: true
        });
      }
    }

    return functions;
  }

  private extractPythonFunctions(code: string): any[] {
    const functions: any[] = [];
    const pattern = /def\s+(\w+)\s*\(([^)]*)\)/g;

    let match;
    while ((match = pattern.exec(code)) !== null) {
      functions.push({
        name: match[1],
        parameters: match[2],
        exported: !match[1].startsWith('_')
      });
    }

    return functions;
  }

  private generateFunctionExample(func: any, language: string): CodeExample {
    const exampleCode = this.generateExampleCode(func, language);
    
    return {
      id: `example-${func.name}`,
      title: `Using ${func.name}`,
      description: `Example demonstrating how to use the ${func.name} function`,
      language,
      code: exampleCode,
      category: ExampleCategory.BASIC_USAGE,
      difficulty: 'beginner',
      tags: [func.name, 'function', 'basic'],
      dependencies: [],
      runnable: true
    };
  }

  private generateExampleCode(func: any, language: string): string {
    switch (language) {
      case 'typescript':
      case 'javascript':
        return this.generateJSExample(func);
      case 'python':
        return this.generatePythonExample(func);
      default:
        return `// Example for ${func.name}`;
    }
  }

  private generateJSExample(func: any): string {
    const params = this.generateExampleParameters(func.parameters);
    return `import { ${func.name} } from './library';

// Example usage
const result = ${func.name}(${params});
console.log(result);`;
  }

  private generatePythonExample(func: any): string {
    const params = this.generateExampleParameters(func.parameters);
    return `from library import ${func.name}

# Example usage
result = ${func.name}(${params})
print(result)`;
  }

  private generateExampleParameters(paramString: string): string {
    if (!paramString.trim()) return '';
    
    const params = paramString.split(',').map(p => p.trim());
    return params.map(param => {
      const name = param.split(':')[0].trim();
      if (name.includes('string') || name.includes('str')) return `"example"`;
      if (name.includes('number') || name.includes('int')) return `42`;
      if (name.includes('boolean') || name.includes('bool')) return `true`;
      return `"value"`;
    }).join(', ');
  }

  private generateIntegrationExamples(code: string, language: string): CodeExample[] {
    const examples: CodeExample[] = [];

    if (code.includes('express') || code.includes('fastapi')) {
      examples.push({
        id: 'integration-api',
        title: 'API Integration',
        description: 'Example of integrating with a REST API',
        language,
        code: this.generateAPIIntegrationExample(language),
        category: ExampleCategory.INTEGRATION,
        difficulty: 'intermediate',
        tags: ['api', 'integration', 'http'],
        dependencies: ['axios'],
        runnable: true
      });
    }

    if (code.includes('database') || code.includes('db')) {
      examples.push({
        id: 'integration-database',
        title: 'Database Integration',
        description: 'Example of database operations',
        language,
        code: this.generateDatabaseExample(language),
        category: ExampleCategory.INTEGRATION,
        difficulty: 'advanced',
        tags: ['database', 'sql', 'integration'],
        dependencies: ['database-driver'],
        runnable: false
      });
    }

    return examples;
  }

  private generateAPIIntegrationExample(language: string): string {
    switch (language) {
      case 'typescript':
      case 'javascript':
        return `import axios from 'axios';

// API integration example
async function fetchData() {
  try {
    const response = await axios.get('/api/data');
    return response.data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Usage
fetchData().then(data => {
  console.log('Received data:', data);
});`;

      case 'python':
        return `import requests

# API integration example
def fetch_data():
    try:
        response = requests.get('/api/data')
        response.raise_for_status()
        return response.json()
    except requests.RequestException as error:
        print(f'API request failed: {error}')
        raise

# Usage
data = fetch_data()
print(f'Received data: {data}')`;

      default:
        return '// API integration example';
    }
  }

  private generateDatabaseExample(language: string): string {
    switch (language) {
      case 'typescript':
      case 'javascript':
        return `// Database integration example
import { Database } from 'database-driver';

const db = new Database({
  host: 'localhost',
  port: 5432,
  database: 'myapp'
});

async function getUsers() {
  const query = 'SELECT * FROM users WHERE active = $1';
  const result = await db.query(query, [true]);
  return result.rows;
}

// Usage
getUsers().then(users => {
  console.log('Active users:', users);
});`;

      case 'python':
        return `# Database integration example
import sqlite3

def get_users():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM users WHERE active = ?', (True,))
    users = cursor.fetchall()
    
    conn.close()
    return users

# Usage
users = get_users()
print(f'Active users: {users}')`;

      default:
        return '// Database integration example';
    }
  }
}

// Main DocAgent Implementation
export class DocAgent implements SwarmAgent {
  id: string;
  name: string;
  capabilities: AgentCapability[];
  specializations: string[];
  
  private autoDocEngine: AutoDocumentationEngine;
  private readmeGenerator: READMEGenerator;
  private changelogGenerator: ChangelogGenerator;
  private exampleGenerator: ExampleGenerator;
  private config: AgentConfig;
  private metrics: AgentMetrics;
  private isActive: boolean = false;

  constructor(id: string = 'doc-agent-1') {
    this.id = id;
    this.name = 'Documentation Agent';
    this.capabilities = [AgentCapability.DOCUMENTATION];
    this.specializations = [
      'API Documentation',
      'README Generation',
      'Changelog Management',
      'Code Examples',
      'Tutorial Creation',
      'Diagram Generation'
    ];

    this.autoDocEngine = new AutoDocumentationEngine();
    this.readmeGenerator = new READMEGenerator();
    this.changelogGenerator = new ChangelogGenerator();
    this.exampleGenerator = new ExampleGenerator();

    this.config = {
      maxConcurrentTasks: 2,
      timeoutMs: 30000,
      qualityThreshold: 0.8,
      retryAttempts: 2
    };

    this.metrics = {
      totalTasks: 0,
      successRate: 0,
      averageExecutionTime: 0,
      averageQuality: 0,
      lastActive: new Date(),
      expertise: {
        [TaskType.PLAN]: 0.4,
        [TaskType.CODE]: 0.3,
        [TaskType.TEST]: 0.4,
        [TaskType.SECURITY]: 0.3,
        [TaskType.DOCUMENT]: 0.95,
        [TaskType.REVIEW]: 0.8,
        [TaskType.REFACTOR]: 0.3,
        [TaskType.DEBUG]: 0.2
      }
    };
  }

  isAvailable(): boolean {
    return !this.isActive;
  }

  canHandle(taskType: TaskType): boolean {
    return [TaskType.DOCUMENT, TaskType.REVIEW].includes(taskType);
  }

  getScore(task: SwarmTask): number {
    let score = 0;

    // Base score for documentation tasks
    if (task.type === TaskType.DOCUMENT) {
      score += 0.95;
    } else if (task.type === TaskType.REVIEW) {
      score += 0.8;
    } else {
      return 0.1;
    }

    // Bonus for documentation-related keywords
    const description = task.description.toLowerCase();
    const docKeywords = ['document', 'readme', 'api', 'example', 'tutorial', 'guide', 'changelog'];
    
    for (const keyword of docKeywords) {
      if (description.includes(keyword)) {
        score += 0.1;
        break;
      }
    }

    // Complexity handling
    if (task.context.files && task.context.files.length > 3) {
      score += 0.05;
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

      if (task.type === TaskType.DOCUMENT) {
        output = await this.executeDocumentGeneration(task);
        quality = this.assessDocumentationQuality(output);
        reasoning = 'Generated comprehensive documentation including API docs, README, examples, and diagrams';
      } else if (task.type === TaskType.REVIEW) {
        output = await this.executeDocumentationReview(task);
        quality = this.assessReviewQuality(output);
        reasoning = 'Reviewed documentation for completeness, accuracy, and quality';
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
        reasoning: `Documentation generation failed: ${errorMessage}`,
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

  private async executeDocumentGeneration(task: SwarmTask): Promise<DocumentationResult> {
    const code = task.context.codebase || '';
    const language = this.detectLanguage(task);
    const projectInfo = (task.context as any).projectInfo || {};

    // Generate API documentation
    const apiDocs = this.autoDocEngine.generateAPIDocumentation(code, language);

    // Generate README
    const readme = this.readmeGenerator.generateREADME(code, projectInfo);

    // Generate changelog
    const gitHistory = (task.context as any).gitHistory || [];
    const changelog = this.changelogGenerator.generateChangelog(gitHistory, projectInfo.version || '1.0.0');

    // Generate examples
    const examples = this.exampleGenerator.generateExamples(code, language);

    // Generate diagrams
    const diagrams = this.generateDiagrams(code, apiDocs);

    // Generate tutorials
    const tutorials = this.generateTutorials(examples);

    // Generate translations
    const translations = this.generateTranslations(readme);

    // Calculate metrics
    const metrics = this.calculateDocumentationMetrics(apiDocs, readme, examples);

    return {
      apiDocs,
      readme,
      changelog,
      examples,
      diagrams,
      tutorials,
      translations,
      metrics
    };
  }

  private async executeDocumentationReview(task: SwarmTask): Promise<any> {
    const existingDocs = (task.context as any).documentation;
    
    if (!existingDocs) {
      throw new Error('No existing documentation provided for review');
    }

    // Review documentation quality
    const qualityIssues = this.identifyQualityIssues(existingDocs);
    
    // Check completeness
    const completenessReport = this.assessCompleteness(existingDocs);
    
    // Generate improvement recommendations
    const improvements = this.generateImprovementRecommendations(qualityIssues, completenessReport);

    return {
      qualityIssues,
      completenessReport,
      improvements,
      overallScore: this.calculateOverallScore(qualityIssues, completenessReport)
    };
  }

  private detectLanguage(task: SwarmTask): string {
    if (task.context.files && task.context.files.length > 0) {
      const firstFile = task.context.files[0];
      if (firstFile.endsWith('.ts') || firstFile.endsWith('.tsx')) return 'typescript';
      if (firstFile.endsWith('.js') || firstFile.endsWith('.jsx')) return 'javascript';
      if (firstFile.endsWith('.py')) return 'python';
      if (firstFile.endsWith('.rs')) return 'rust';
    }
    
    return 'typescript'; // Default
  }

  private generateDiagrams(code: string, apiDocs: APIDocumentation): Diagram[] {
    const diagrams: Diagram[] = [];

    // Architecture diagram
    if (code.includes('class') || code.includes('component')) {
      diagrams.push({
        id: 'architecture',
        title: 'System Architecture',
        type: DiagramType.ARCHITECTURE,
        description: 'Overview of system components and their relationships',
        source: this.generateArchitectureDiagram(code),
        format: 'mermaid',
        category: 'architecture',
        generated: true
      });
    }

    // API flow diagram
    if (apiDocs.endpoints.length > 0) {
      diagrams.push({
        id: 'api-flow',
        title: 'API Flow',
        type: DiagramType.SEQUENCE,
        description: 'API request/response flow',
        source: this.generateAPIFlowDiagram(apiDocs),
        format: 'mermaid',
        category: 'api',
        generated: true
      });
    }

    return diagrams;
  }

  private generateArchitectureDiagram(code: string): string {
    return `graph TD
    A[Client] --> B[API Gateway]
    B --> C[Authentication]
    B --> D[Business Logic]
    D --> E[Database]
    D --> F[External Services]`;
  }

  private generateAPIFlowDiagram(apiDocs: APIDocumentation): string {
    const endpoint = apiDocs.endpoints[0];
    return `sequenceDiagram
    participant Client
    participant API
    participant Database
    
    Client->>API: ${endpoint.method} ${endpoint.path}
    API->>Database: Query data
    Database-->>API: Return results
    API-->>Client: Response`;
  }

  private generateTutorials(examples: CodeExample[]): Tutorial[] {
    const tutorials: Tutorial[] = [];

    if (examples.length > 0) {
      tutorials.push({
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Learn the basics of using this library',
        difficulty: 'beginner',
        estimatedTime: 15,
        prerequisites: ['Basic programming knowledge'],
        steps: this.generateTutorialSteps(examples.slice(0, 3)),
        resources: [
          {
            title: 'Official Documentation',
            url: '/docs',
            type: 'documentation',
            description: 'Complete API reference'
          }
        ],
        tags: ['tutorial', 'beginner', 'getting-started']
      });
    }

    return tutorials;
  }

  private generateTutorialSteps(examples: CodeExample[]): TutorialStep[] {
    return examples.map((example, index) => ({
      id: `step-${index + 1}`,
      title: example.title,
      description: example.description,
      code: example.code,
      expected: example.output,
      hints: [`Try running: ${example.code.split('\n')[0]}`],
      validation: 'Check that the output matches the expected result'
    }));
  }

  private generateTranslations(readme: README): Translation[] {
    return [
      {
        language: 'English',
        locale: 'en-US',
        completeness: 1.0,
        lastUpdated: new Date(),
        translatedSections: readme.sections.map(s => s.id),
        missingSections: []
      }
    ];
  }

  private calculateDocumentationMetrics(
    apiDocs: APIDocumentation,
    readme: README,
    examples: CodeExample[]
  ): DocumentationMetrics {
    const coverage = this.calculateCoverage(apiDocs, examples);
    const quality = this.calculateQuality(readme, examples);
    const usage = this.generateUsageMetrics();
    const freshness = this.calculateFreshness(readme);

    return {
      coverage,
      quality,
      usage,
      freshness
    };
  }

  private calculateCoverage(apiDocs: APIDocumentation, examples: CodeExample[]): CoverageMetrics {
    const apiCoverage = apiDocs.endpoints.length > 0 ? 0.8 : 0.3;
    const exampleCoverage = examples.length > 0 ? 0.9 : 0.2;
    const overallCoverage = (apiCoverage + exampleCoverage) / 2;

    return {
      overallCoverage,
      apiCoverage,
      codeCoverage: 0.75, // Estimated
      exampleCoverage,
      missingDocumentation: overallCoverage < 0.8 ? ['API examples', 'Advanced usage'] : []
    };
  }

  private calculateQuality(readme: README, examples: CodeExample[]): QualityMetrics {
    const readabilityScore = readme.sections.length > 5 ? 85 : 60;
    const completenessScore = readme.sections.length * 15; // Max 100
    const accuracyScore = 90; // Estimated
    const consistency = examples.length > 2 ? 0.9 : 0.6;

    return {
      readabilityScore,
      completenessScore: Math.min(100, completenessScore),
      accuracyScore,
      consistency,
      issues: []
    };
  }

  private generateUsageMetrics(): UsageMetrics {
    return {
      pageViews: {
        'README': 1000,
        'API': 500,
        'Examples': 300
      },
      searchQueries: ['getting started', 'api reference', 'examples'],
      mostViewedSections: ['Installation', 'Usage', 'API'],
      bounceRate: 0.3,
      timeOnPage: {
        'README': 180,
        'API': 240,
        'Examples': 120
      }
    };
  }

  private calculateFreshness(readme: README): FreshnessMetrics {
    return {
      lastUpdated: readme.lastUpdated,
      staleSections: [],
      outdatedExamples: [],
      brokenLinks: [],
      updateFrequency: 30 // days
    };
  }

  private identifyQualityIssues(docs: any): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Check for common issues
    if (!docs.readme) {
      issues.push({
        type: 'formatting',
        severity: 'high',
        location: 'README',
        description: 'Missing README file'
      });
    }

    if (!docs.apiDocs || docs.apiDocs.endpoints?.length === 0) {
      issues.push({
        type: 'outdated',
        severity: 'medium',
        location: 'API Documentation',
        description: 'API documentation is incomplete or missing'
      });
    }

    return issues;
  }

  private assessCompleteness(docs: any): any {
    const requiredSections = ['overview', 'installation', 'usage', 'api', 'examples'];
    const presentSections = docs.readme?.sections?.map((s: any) => s.id) || [];
    const missing = requiredSections.filter(section => !presentSections.includes(section));

    return {
      score: ((requiredSections.length - missing.length) / requiredSections.length) * 100,
      missing,
      present: presentSections,
      recommendations: missing.map(section => `Add ${section} section`)
    };
  }

  private generateImprovementRecommendations(qualityIssues: QualityIssue[], completenessReport: any): any[] {
    const recommendations = [];

    // Address quality issues
    for (const issue of qualityIssues) {
      recommendations.push({
        type: 'quality',
        priority: issue.severity === 'high' ? 1 : 2,
        description: `Fix ${issue.type} issue: ${issue.description}`,
        location: issue.location
      });
    }

    // Address completeness
    if (completenessReport.score < 80) {
      recommendations.push({
        type: 'completeness',
        priority: 1,
        description: 'Add missing documentation sections',
        suggestions: completenessReport.recommendations
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  private calculateOverallScore(qualityIssues: QualityIssue[], completenessReport: any): number {
    const qualityScore = Math.max(0, 100 - (qualityIssues.length * 10));
    const completenessScore = completenessReport.score;
    
    return (qualityScore + completenessScore) / 2;
  }

  private assessDocumentationQuality(result: DocumentationResult): number {
    let quality = 0.5; // Base quality

    // API documentation quality
    if (result.apiDocs.endpoints.length > 0) quality += 0.15;
    if (result.apiDocs.examples.length > 0) quality += 0.1;

    // README quality
    if (result.readme.sections.length >= 5) quality += 0.1;
    if (result.readme.tableOfContents.length > 0) quality += 0.05;

    // Examples quality
    if (result.examples.length > 2) quality += 0.1;

    // Overall metrics
    if (result.metrics.coverage.overallCoverage > 0.8) quality += 0.1;

    return Math.min(1, quality);
  }

  private assessReviewQuality(output: any): number {
    let quality = 0.6; // Base quality for reviews

    if (output.qualityIssues?.length !== undefined) quality += 0.15;
    if (output.completenessReport?.score > 80) quality += 0.15;
    if (output.improvements?.length > 0) quality += 0.1;

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

  // Additional methods for external access
  generateAPIDocumentation(code: string, language: string): APIDocumentation {
    return this.autoDocEngine.generateAPIDocumentation(code, language);
  }

  generateREADME(code: string, projectInfo: any): README {
    return this.readmeGenerator.generateREADME(code, projectInfo);
  }

  generateChangelog(gitHistory: any[], version: string): Changelog {
    return this.changelogGenerator.generateChangelog(gitHistory, version);
  }

  generateExamples(code: string, language: string): CodeExample[] {
    return this.exampleGenerator.generateExamples(code, language);
  }
}

export default DocAgent; 