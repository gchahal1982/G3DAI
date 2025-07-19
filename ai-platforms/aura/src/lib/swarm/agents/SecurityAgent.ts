import { 
  SwarmAgent, 
  SwarmTask, 
  SwarmResult, 
  TaskType, 
  AgentCapability, 
  AgentMetrics, 
  AgentConfig 
} from '../SwarmOrchestrator';

// Security-specific types
export interface SecurityScanResult {
  overall: SecurityRating;
  vulnerabilities: Vulnerability[];
  dependencies: DependencySecurityReport;
  secrets: SecretDetectionResult;
  compliance: ComplianceReport;
  threatModel: ThreatModelingResult;
  recommendations: SecurityRecommendation[];
  patches: SecurityPatch[];
}

export enum SecurityRating {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export interface Vulnerability {
  id: string;
  type: VulnerabilityType;
  severity: SecurityRating;
  title: string;
  description: string;
  location: CodeLocation;
  cwe: string; // Common Weakness Enumeration
  cvss: CVSSScore;
  impact: SecurityImpact;
  remediation: RemediationAdvice;
  references: string[];
}

export enum VulnerabilityType {
  INJECTION = 'injection',
  XSS = 'cross_site_scripting',
  BROKEN_AUTH = 'broken_authentication',
  SENSITIVE_DATA = 'sensitive_data_exposure',
  XML_EXTERNAL = 'xml_external_entities',
  BROKEN_ACCESS = 'broken_access_control',
  SECURITY_MISCONFIG = 'security_misconfiguration',
  KNOWN_VULN = 'known_vulnerabilities',
  INSUFFICIENT_LOGGING = 'insufficient_logging',
  SSRF = 'server_side_request_forgery',
  DESERIALIZATION = 'insecure_deserialization',
  COMPONENTS = 'vulnerable_components'
}

export interface CodeLocation {
  file: string;
  line: number;
  column: number;
  context: string;
  function?: string;
  class?: string;
}

export interface CVSSScore {
  score: number; // 0-10
  vector: string;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityImpact {
  confidentiality: 'none' | 'low' | 'high';
  integrity: 'none' | 'low' | 'high';
  availability: 'none' | 'low' | 'high';
  description: string;
}

export interface RemediationAdvice {
  description: string;
  steps: string[];
  codeExample?: string;
  effort: 'low' | 'medium' | 'high';
  priority: number;
}

export interface DependencySecurityReport {
  totalDependencies: number;
  vulnerableDependencies: number;
  vulnerabilities: DependencyVulnerability[];
  licenses: LicenseReport[];
  outdatedPackages: OutdatedPackage[];
  recommendations: DependencyRecommendation[];
}

export interface DependencyVulnerability {
  package: PackageInfo;
  vulnerability: CVEInfo;
  severity: SecurityRating;
  fixedIn?: string;
  patchAvailable: boolean;
}

export interface PackageInfo {
  name: string;
  version: string;
  ecosystem: string; // npm, pip, cargo, etc.
  license?: string;
  maintainers?: string[];
  lastUpdated?: Date;
}

export interface CVEInfo {
  id: string; // CVE-YYYY-NNNN
  description: string;
  publishedDate: Date;
  cvssScore: CVSSScore;
  references: string[];
  patches: PatchInfo[];
}

export interface PatchInfo {
  version: string;
  releaseDate: Date;
  patchNotes: string;
  breaking: boolean;
}

export interface LicenseReport {
  package: string;
  license: string;
  compatible: boolean;
  risk: 'low' | 'medium' | 'high';
  issues: string[];
}

export interface OutdatedPackage {
  name: string;
  current: string;
  latest: string;
  securityUpdates: boolean;
  breaking: boolean;
}

export interface DependencyRecommendation {
  type: 'update' | 'replace' | 'remove';
  package: string;
  reason: string;
  action: string;
  priority: number;
}

export interface SecretDetectionResult {
  secrets: DetectedSecret[];
  patterns: SecretPattern[];
  riskScore: number;
  recommendations: SecretRecommendation[];
}

export interface DetectedSecret {
  id: string;
  type: SecretType;
  value: string; // Masked value
  location: CodeLocation;
  confidence: number; // 0-1
  entropy: number; // Entropy score
  exposed: boolean; // If in public repo/code
}

export enum SecretType {
  API_KEY = 'api_key',
  PASSWORD = 'password',
  TOKEN = 'token',
  PRIVATE_KEY = 'private_key',
  CERTIFICATE = 'certificate',
  DATABASE_URL = 'database_url',
  AWS_ACCESS_KEY = 'aws_access_key',
  JWT_TOKEN = 'jwt_token',
  OAUTH_TOKEN = 'oauth_token',
  WEBHOOK_URL = 'webhook_url'
}

export interface SecretPattern {
  name: string;
  pattern: RegExp;
  secretType: SecretType;
  confidence: number;
  description: string;
}

export interface SecretRecommendation {
  secret: DetectedSecret;
  action: 'move_to_env' | 'rotate' | 'remove' | 'encrypt';
  description: string;
  urgency: SecurityRating;
}

export interface ComplianceReport {
  frameworks: ComplianceFramework[];
  overallScore: number;
  violations: ComplianceViolation[];
  recommendations: ComplianceRecommendation[];
}

export interface ComplianceFramework {
  name: string; // OWASP, SOC2, GDPR, etc.
  version: string;
  score: number;
  requirements: ComplianceRequirement[];
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  evidence: string[];
  gaps: string[];
}

export interface ComplianceViolation {
  framework: string;
  requirement: string;
  severity: SecurityRating;
  description: string;
  location?: CodeLocation;
  remediation: string;
}

export interface ComplianceRecommendation {
  framework: string;
  priority: number;
  description: string;
  implementation: string[];
  effort: 'low' | 'medium' | 'high';
}

export interface ThreatModelingResult {
  assets: Asset[];
  threats: Threat[];
  vulnerabilities: ThreatVulnerability[];
  mitigations: Mitigation[];
  riskAssessment: RiskAssessment;
}

export interface Asset {
  id: string;
  name: string;
  type: 'data' | 'process' | 'external_entity' | 'data_store';
  value: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
}

export interface Threat {
  id: string;
  name: string;
  category: ThreatCategory;
  description: string;
  targetAssets: string[];
  likelihood: number; // 1-5
  impact: number; // 1-5
  riskScore: number; // likelihood * impact
}

export enum ThreatCategory {
  SPOOFING = 'spoofing',
  TAMPERING = 'tampering',
  REPUDIATION = 'repudiation',
  INFORMATION_DISCLOSURE = 'information_disclosure',
  DENIAL_OF_SERVICE = 'denial_of_service',
  ELEVATION_OF_PRIVILEGE = 'elevation_of_privilege'
}

export interface ThreatVulnerability {
  id: string;
  threat: string;
  description: string;
  exploitability: number; // 1-5
  detectability: number; // 1-5
}

export interface Mitigation {
  id: string;
  threats: string[];
  type: 'preventive' | 'detective' | 'corrective';
  description: string;
  implementation: string[];
  cost: 'low' | 'medium' | 'high';
  effectiveness: number; // 1-5
}

export interface RiskAssessment {
  overallRisk: number;
  acceptableRisk: number;
  riskCategories: Record<ThreatCategory, number>;
  residualRisk: number;
  recommendations: string[];
}

export interface SecurityRecommendation {
  id: string;
  priority: number;
  severity: SecurityRating;
  title: string;
  description: string;
  category: string;
  implementation: string[];
  effort: 'low' | 'medium' | 'high';
  impact: string;
  references: string[];
}

export interface SecurityPatch {
  id: string;
  vulnerability: string;
  description: string;
  files: PatchFile[];
  testing: string[];
  rollback: string[];
  risk: 'low' | 'medium' | 'high';
}

export interface PatchFile {
  path: string;
  changes: PatchChange[];
  backup: boolean;
}

export interface PatchChange {
  line: number;
  type: 'add' | 'remove' | 'modify';
  oldContent?: string;
  newContent: string;
  reason: string;
}

// Vulnerability Scanning Engine
class VulnerabilityScanner {
  private rules: SecurityRule[] = [];

  constructor() {
    this.initializeRules();
  }

  private initializeRules(): void {
    // SQL Injection rules
    this.rules.push({
      id: 'sql-injection-1',
      type: VulnerabilityType.INJECTION,
      pattern: /\$\{[^}]*\}.*(?:SELECT|INSERT|UPDATE|DELETE)/i,
      severity: SecurityRating.HIGH,
      title: 'Potential SQL Injection',
      description: 'Dynamic SQL query construction detected',
      cwe: 'CWE-89'
    });

    // XSS rules
    this.rules.push({
      id: 'xss-1',
      type: VulnerabilityType.XSS,
      pattern: /innerHTML\s*=\s*.*\+/,
      severity: SecurityRating.MEDIUM,
      title: 'Potential XSS via innerHTML',
      description: 'Dynamic HTML content insertion detected',
      cwe: 'CWE-79'
    });

    // Insecure randomness
    this.rules.push({
      id: 'weak-random-1',
      type: VulnerabilityType.SECURITY_MISCONFIG,
      pattern: /Math\.random\(\)/,
      severity: SecurityRating.MEDIUM,
      title: 'Weak Random Number Generation',
      description: 'Math.random() is not cryptographically secure',
      cwe: 'CWE-338'
    });

    // Hardcoded secrets
    this.rules.push({
      id: 'hardcoded-secret-1',
      type: VulnerabilityType.SENSITIVE_DATA,
      pattern: /(password|secret|key)\s*[:=]\s*["'][^"']+["']/i,
      severity: SecurityRating.HIGH,
      title: 'Hardcoded Secret',
      description: 'Potential hardcoded credentials detected',
      cwe: 'CWE-798'
    });

    // Insecure HTTP
    this.rules.push({
      id: 'insecure-http-1',
      type: VulnerabilityType.SENSITIVE_DATA,
      pattern: /http:\/\/[^\/\s]+/,
      severity: SecurityRating.LOW,
      title: 'Insecure HTTP Protocol',
      description: 'HTTP protocol detected, consider using HTTPS',
      cwe: 'CWE-319'
    });

    // Command injection
    this.rules.push({
      id: 'command-injection-1',
      type: VulnerabilityType.INJECTION,
      pattern: /exec\(.*\+|system\(.*\+|spawn\(.*\+/,
      severity: SecurityRating.CRITICAL,
      title: 'Command Injection Risk',
      description: 'Dynamic command execution detected',
      cwe: 'CWE-78'
    });
  }

  scanCode(code: string, filename: string): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];
    const lines = code.split('\n');

    lines.forEach((line, lineIndex) => {
      for (const rule of this.rules) {
        const matches = line.match(rule.pattern);
        if (matches) {
          const vulnerability: Vulnerability = {
            id: `${rule.id}-${lineIndex}`,
            type: rule.type,
            severity: rule.severity,
            title: rule.title,
            description: rule.description,
            location: {
              file: filename,
              line: lineIndex + 1,
              column: matches.index || 0,
              context: line.trim()
            },
            cwe: rule.cwe,
            cvss: this.calculateCVSS(rule.severity),
            impact: this.assessImpact(rule.type),
            remediation: this.getRemediation(rule.type),
            references: this.getReferences(rule.cwe)
          };
          vulnerabilities.push(vulnerability);
        }
      }
    });

    return vulnerabilities;
  }

  private calculateCVSS(severity: SecurityRating): CVSSScore {
    const scores = {
      [SecurityRating.CRITICAL]: { score: 9.5, severity: 'critical' as const },
      [SecurityRating.HIGH]: { score: 7.5, severity: 'high' as const },
      [SecurityRating.MEDIUM]: { score: 5.0, severity: 'medium' as const },
      [SecurityRating.LOW]: { score: 2.5, severity: 'low' as const },
      [SecurityRating.INFO]: { score: 0.0, severity: 'none' as const }
    };

    const scoreInfo = scores[severity];
    return {
      score: scoreInfo.score,
      vector: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`,
      severity: scoreInfo.severity
    };
  }

  private assessImpact(type: VulnerabilityType): SecurityImpact {
    const impacts = {
      [VulnerabilityType.INJECTION]: {
        confidentiality: 'high' as const,
        integrity: 'high' as const,
        availability: 'high' as const,
        description: 'Could lead to data breaches and system compromise'
      },
      [VulnerabilityType.XSS]: {
        confidentiality: 'high' as const,
        integrity: 'low' as const,
        availability: 'none' as const,
        description: 'Could expose user sessions and personal data'
      },
      [VulnerabilityType.SENSITIVE_DATA]: {
        confidentiality: 'high' as const,
        integrity: 'none' as const,
        availability: 'none' as const,
        description: 'Could expose sensitive information'
      }
    };

    return (impacts as any)[type] || {
      confidentiality: 'low',
      integrity: 'low',
      availability: 'low',
      description: 'Minor security concern'
    };
  }

  private getRemediation(type: VulnerabilityType): RemediationAdvice {
    const remediations = {
      [VulnerabilityType.INJECTION]: {
        description: 'Use parameterized queries and input validation',
        steps: [
          'Replace dynamic SQL with parameterized queries',
          'Implement input validation and sanitization',
          'Use ORM/query builders with built-in protection',
          'Apply principle of least privilege to database access'
        ],
        codeExample: `// Bad: const query = \`SELECT * FROM users WHERE id = \${userId}\`;
// Good: const query = 'SELECT * FROM users WHERE id = ?'; db.execute(query, [userId]);`,
        effort: 'medium' as const,
        priority: 1
      },
      [VulnerabilityType.XSS]: {
        description: 'Sanitize and escape user input before rendering',
        steps: [
          'Use safe DOM manipulation methods',
          'Implement Content Security Policy (CSP)',
          'Validate and sanitize all user inputs',
          'Use template engines with auto-escaping'
        ],
        codeExample: `// Bad: element.innerHTML = userInput;
// Good: element.textContent = userInput;`,
        effort: 'low' as const,
        priority: 2
      }
    };

    return (remediations as any)[type] || {
      description: 'Review and fix the identified security issue',
      steps: ['Analyze the vulnerability', 'Implement appropriate fixes', 'Test the solution'],
      effort: 'medium',
      priority: 3
    };
  }

  private getReferences(cwe: string): string[] {
    return [
      `https://cwe.mitre.org/data/definitions/${cwe.split('-')[1]}.html`,
      'https://owasp.org/www-project-top-ten/',
      'https://cheatsheetseries.owasp.org/'
    ];
  }
}

interface SecurityRule {
  id: string;
  type: VulnerabilityType;
  pattern: RegExp;
  severity: SecurityRating;
  title: string;
  description: string;
  cwe: string;
}

// Dependency Security Scanner
class DependencySecurityScanner {
  private cveDatabase: Map<string, CVEInfo> = new Map();

  constructor() {
    this.initializeCVEDatabase();
  }

  private initializeCVEDatabase(): void {
    // Sample CVE entries (in production, integrate with real CVE database)
    this.cveDatabase.set('lodash@4.17.15', {
      id: 'CVE-2020-8203',
      description: 'Prototype pollution in lodash',
      publishedDate: new Date('2020-07-15'),
      cvssScore: {
        score: 7.4,
        vector: 'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:N',
        severity: 'high'
      },
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2020-8203',
        'https://github.com/lodash/lodash/commit/c4847ebe7d14540bb28a8b932a9ce1b9f24be3db'
      ],
      patches: [
        {
          version: '4.17.19',
          releaseDate: new Date('2020-07-20'),
          patchNotes: 'Fixed prototype pollution vulnerability',
          breaking: false
        }
      ]
    });

    this.cveDatabase.set('express@4.16.0', {
      id: 'CVE-2019-10746',
      description: 'Prototype pollution in express',
      publishedDate: new Date('2019-06-18'),
      cvssScore: {
        score: 5.6,
        vector: 'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:L/A:L',
        severity: 'medium'
      },
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2019-10746'
      ],
      patches: [
        {
          version: '4.17.0',
          releaseDate: new Date('2019-07-01'),
          patchNotes: 'Security update',
          breaking: false
        }
      ]
    });
  }

  scanDependencies(dependencies: Record<string, string>): DependencySecurityReport {
    const vulnerabilities: DependencyVulnerability[] = [];
    const licenses: LicenseReport[] = [];
    const outdated: OutdatedPackage[] = [];

    for (const [name, version] of Object.entries(dependencies)) {
      const packageKey = `${name}@${version}`;
      const cveInfo = this.cveDatabase.get(packageKey);

      if (cveInfo) {
        vulnerabilities.push({
          package: {
            name,
            version,
            ecosystem: 'npm'
          },
          vulnerability: cveInfo,
          severity: this.mapCVSSToSeverity(cveInfo.cvssScore.score),
          fixedIn: cveInfo.patches[0]?.version,
          patchAvailable: cveInfo.patches.length > 0
        });
      }

      // Check for outdated packages (simplified)
      if (this.isOutdated(name, version)) {
        outdated.push({
          name,
          current: version,
          latest: this.getLatestVersion(name),
          securityUpdates: !!cveInfo,
          breaking: false
        });
      }

      // License analysis (simplified)
      const license = this.getLicense(name);
      licenses.push({
        package: name,
        license,
        compatible: this.isLicenseCompatible(license),
        risk: this.assessLicenseRisk(license),
        issues: this.getLicenseIssues(license)
      });
    }

    const recommendations = this.generateDependencyRecommendations(vulnerabilities, outdated);

    return {
      totalDependencies: Object.keys(dependencies).length,
      vulnerableDependencies: vulnerabilities.length,
      vulnerabilities,
      licenses,
      outdatedPackages: outdated,
      recommendations
    };
  }

  private mapCVSSToSeverity(score: number): SecurityRating {
    if (score >= 9.0) return SecurityRating.CRITICAL;
    if (score >= 7.0) return SecurityRating.HIGH;
    if (score >= 4.0) return SecurityRating.MEDIUM;
    if (score >= 0.1) return SecurityRating.LOW;
    return SecurityRating.INFO;
  }

  private isOutdated(name: string, version: string): boolean {
    // Simplified check - in production, check against registry
    const currentMajor = parseInt(version.split('.')[0]);
    const latestMajor = currentMajor + 1; // Simulate newer version available
    return Math.random() > 0.7; // 30% chance of being outdated
  }

  private getLatestVersion(name: string): string {
    // Simplified - in production, fetch from registry
    return '1.0.0';
  }

  private getLicense(name: string): string {
    const commonLicenses = ['MIT', 'Apache-2.0', 'BSD-3-Clause', 'GPL-3.0', 'ISC'];
    return commonLicenses[Math.floor(Math.random() * commonLicenses.length)];
  }

  private isLicenseCompatible(license: string): boolean {
    const compatibleLicenses = ['MIT', 'Apache-2.0', 'BSD-3-Clause', 'ISC'];
    return compatibleLicenses.includes(license);
  }

  private assessLicenseRisk(license: string): 'low' | 'medium' | 'high' {
    if (license.includes('GPL')) return 'high';
    if (license.includes('AGPL')) return 'high';
    if (license === 'Unknown') return 'medium';
    return 'low';
  }

  private getLicenseIssues(license: string): string[] {
    const issues = [];
    if (license.includes('GPL')) {
      issues.push('Copyleft license may require source code disclosure');
    }
    if (license === 'Unknown') {
      issues.push('License terms are unclear');
    }
    return issues;
  }

  private generateDependencyRecommendations(
    vulnerabilities: DependencyVulnerability[],
    outdated: OutdatedPackage[]
  ): DependencyRecommendation[] {
    const recommendations: DependencyRecommendation[] = [];

    for (const vuln of vulnerabilities) {
      recommendations.push({
        type: 'update',
        package: vuln.package.name,
        reason: `Contains vulnerability ${vuln.vulnerability.id}`,
        action: `Update to version ${vuln.fixedIn || 'latest'}`,
        priority: this.getSeverityPriority(vuln.severity)
      });
    }

    for (const pkg of outdated) {
      if (pkg.securityUpdates) {
        recommendations.push({
          type: 'update',
          package: pkg.name,
          reason: 'Security updates available',
          action: `Update from ${pkg.current} to ${pkg.latest}`,
          priority: 2
        });
      }
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  private getSeverityPriority(severity: SecurityRating): number {
    const priorities = {
      [SecurityRating.CRITICAL]: 1,
      [SecurityRating.HIGH]: 2,
      [SecurityRating.MEDIUM]: 3,
      [SecurityRating.LOW]: 4,
      [SecurityRating.INFO]: 5
    };
    return priorities[severity];
  }
}

// Secret Detection Engine
class SecretDetectionEngine {
  private patterns: SecretPattern[] = [];

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    this.patterns = [
      {
        name: 'AWS Access Key',
        pattern: /AKIA[0-9A-Z]{16}/g,
        secretType: SecretType.AWS_ACCESS_KEY,
        confidence: 0.9,
        description: 'AWS Access Key ID'
      },
      {
        name: 'API Key',
        pattern: /[Aa][Pp][Ii]_?[Kk][Ee][Yy].*['"]\w{20,}['"]/g,
        secretType: SecretType.API_KEY,
        confidence: 0.7,
        description: 'Generic API Key'
      },
      {
        name: 'JWT Token',
        pattern: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g,
        secretType: SecretType.JWT_TOKEN,
        confidence: 0.8,
        description: 'JSON Web Token'
      },
      {
        name: 'Database URL',
        pattern: /(postgres|mysql|mongodb):\/\/[^\s'"]+/g,
        secretType: SecretType.DATABASE_URL,
        confidence: 0.8,
        description: 'Database connection string'
      },
      {
        name: 'Private Key',
        pattern: /-----BEGIN [A-Z ]+PRIVATE KEY-----/g,
        secretType: SecretType.PRIVATE_KEY,
        confidence: 0.9,
        description: 'Private key header'
      },
      {
        name: 'Password',
        pattern: /[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd].*['"]\w{8,}['"]/g,
        secretType: SecretType.PASSWORD,
        confidence: 0.6,
        description: 'Potential password'
      }
    ];
  }

  detectSecrets(code: string, filename: string): SecretDetectionResult {
    const secrets: DetectedSecret[] = [];
    const lines = code.split('\n');

    lines.forEach((line, lineIndex) => {
      for (const pattern of this.patterns) {
        const matches = Array.from(line.matchAll(pattern.pattern));
        
        for (const match of matches) {
          const value = match[0];
          const entropy = this.calculateEntropy(value);
          
          secrets.push({
            id: `secret-${secrets.length + 1}`,
            type: pattern.secretType,
            value: this.maskSecret(value),
            location: {
              file: filename,
              line: lineIndex + 1,
              column: match.index || 0,
              context: line.trim()
            },
            confidence: pattern.confidence,
            entropy,
            exposed: filename.includes('public') || filename.includes('www')
          });
        }
      }
    });

    const riskScore = this.calculateRiskScore(secrets);
    const recommendations = this.generateSecretRecommendations(secrets);

    return {
      secrets,
      patterns: this.patterns,
      riskScore,
      recommendations
    };
  }

  private calculateEntropy(value: string): number {
    const freq: Record<string, number> = {};
    
    for (const char of value) {
      freq[char] = (freq[char] || 0) + 1;
    }

    let entropy = 0;
    const length = value.length;

    for (const count of Object.values(freq)) {
      const p = count / length;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  private maskSecret(value: string): string {
    if (value.length <= 8) {
      return '*'.repeat(value.length);
    }
    
    const visibleChars = 4;
    const start = value.substring(0, visibleChars);
    const end = value.substring(value.length - visibleChars);
    const masked = '*'.repeat(value.length - (visibleChars * 2));
    
    return start + masked + end;
  }

  private calculateRiskScore(secrets: DetectedSecret[]): number {
    if (secrets.length === 0) return 0;

    let totalRisk = 0;
    for (const secret of secrets) {
      let risk = secret.confidence * 0.4;
      risk += secret.entropy / 8 * 0.3; // Normalize entropy
      risk += secret.exposed ? 0.3 : 0.1;
      
      totalRisk += risk;
    }

    return Math.min(1, totalRisk / secrets.length);
  }

  private generateSecretRecommendations(secrets: DetectedSecret[]): SecretRecommendation[] {
    return secrets.map(secret => ({
      secret,
      action: this.getRecommendedAction(secret),
      description: this.getActionDescription(secret),
      urgency: this.getUrgency(secret)
    }));
  }

  private getRecommendedAction(secret: DetectedSecret): 'move_to_env' | 'rotate' | 'remove' | 'encrypt' {
    if (secret.exposed) return 'rotate';
    if (secret.type === SecretType.API_KEY || secret.type === SecretType.AWS_ACCESS_KEY) return 'move_to_env';
    if (secret.type === SecretType.PASSWORD) return 'remove';
    return 'encrypt';
  }

  private getActionDescription(secret: DetectedSecret): string {
    const actions = {
      move_to_env: 'Move to environment variables and remove from code',
      rotate: 'Immediately rotate the secret and update all references',
      remove: 'Remove hardcoded secret and implement secure authentication',
      encrypt: 'Encrypt the secret and manage through secure key management'
    };
    
    return actions[this.getRecommendedAction(secret)];
  }

  private getUrgency(secret: DetectedSecret): SecurityRating {
    if (secret.exposed) return SecurityRating.CRITICAL;
    if (secret.confidence > 0.8) return SecurityRating.HIGH;
    if (secret.confidence > 0.6) return SecurityRating.MEDIUM;
    return SecurityRating.LOW;
  }
}

// Threat Modeling Engine
class ThreatModelingEngine {
  generateThreatModel(code: string, assets: Asset[]): ThreatModelingResult {
    const threats = this.identifyThreats(assets);
    const vulnerabilities = this.identifyVulnerabilities(threats, code);
    const mitigations = this.suggestMitigations(threats);
    const riskAssessment = this.assessRisk(threats, vulnerabilities, mitigations);

    return {
      assets,
      threats,
      vulnerabilities,
      mitigations,
      riskAssessment
    };
  }

  private identifyThreats(assets: Asset[]): Threat[] {
    const threats: Threat[] = [];

    for (const asset of assets) {
      // Data assets face different threats than process assets
      if (asset.type === 'data') {
        threats.push({
          id: `threat-${threats.length + 1}`,
          name: 'Unauthorized Data Access',
          category: ThreatCategory.INFORMATION_DISCLOSURE,
          description: `Unauthorized access to ${asset.name}`,
          targetAssets: [asset.id],
          likelihood: 3,
          impact: asset.value === 'critical' ? 5 : 3,
          riskScore: 0
        });

        threats.push({
          id: `threat-${threats.length + 1}`,
          name: 'Data Tampering',
          category: ThreatCategory.TAMPERING,
          description: `Unauthorized modification of ${asset.name}`,
          targetAssets: [asset.id],
          likelihood: 2,
          impact: asset.value === 'critical' ? 5 : 3,
          riskScore: 0
        });
      }

      if (asset.type === 'process') {
        threats.push({
          id: `threat-${threats.length + 1}`,
          name: 'Process Spoofing',
          category: ThreatCategory.SPOOFING,
          description: `Impersonation of ${asset.name} process`,
          targetAssets: [asset.id],
          likelihood: 2,
          impact: 4,
          riskScore: 0
        });

        threats.push({
          id: `threat-${threats.length + 1}`,
          name: 'Privilege Escalation',
          category: ThreatCategory.ELEVATION_OF_PRIVILEGE,
          description: `Unauthorized privilege escalation in ${asset.name}`,
          targetAssets: [asset.id],
          likelihood: 3,
          impact: 5,
          riskScore: 0
        });
      }
    }

    // Calculate risk scores
    threats.forEach(threat => {
      threat.riskScore = threat.likelihood * threat.impact;
    });

    return threats.sort((a, b) => b.riskScore - a.riskScore);
  }

  private identifyVulnerabilities(threats: Threat[], code: string): ThreatVulnerability[] {
    const vulnerabilities: ThreatVulnerability[] = [];

    for (const threat of threats) {
      // Analyze code for specific vulnerability patterns
      const exploitability = this.assessExploitability(threat, code);
      const detectability = this.assessDetectability(threat, code);

      vulnerabilities.push({
        id: `vuln-${vulnerabilities.length + 1}`,
        threat: threat.id,
        description: `Vulnerability enabling ${threat.name}`,
        exploitability,
        detectability
      });
    }

    return vulnerabilities;
  }

  private assessExploitability(threat: Threat, code: string): number {
    // Simplified exploitability assessment based on code patterns
    let score = 3; // Base score

    if (threat.category === ThreatCategory.TAMPERING && code.includes('${')) {
      score = 5; // High exploitability if dynamic queries found
    }

    if (threat.category === ThreatCategory.INFORMATION_DISCLOSURE && code.includes('console.log')) {
      score = 4; // Medium-high if logging sensitive data
    }

    return score;
  }

  private assessDetectability(threat: Threat, code: string): number {
    // Simplified detectability assessment
    let score = 3; // Base score

    if (code.includes('logger') || code.includes('audit')) {
      score = 2; // Lower if logging is present (easier to detect)
    }

    if (code.includes('monitor') || code.includes('alert')) {
      score = 1; // Much lower if monitoring is present
    }

    return score;
  }

  private suggestMitigations(threats: Threat[]): Mitigation[] {
    const mitigations: Mitigation[] = [];
    const threatCategories = new Set(threats.map(t => t.category));

    for (const category of threatCategories) {
      switch (category) {
        case ThreatCategory.TAMPERING:
          mitigations.push({
            id: `mitigation-${mitigations.length + 1}`,
            threats: threats.filter(t => t.category === category).map(t => t.id),
            type: 'preventive',
            description: 'Input validation and parameterized queries',
            implementation: [
              'Implement input validation on all user inputs',
              'Use parameterized queries for database access',
              'Apply encoding/escaping for output'
            ],
            cost: 'medium',
            effectiveness: 5
          });
          break;

        case ThreatCategory.INFORMATION_DISCLOSURE:
          mitigations.push({
            id: `mitigation-${mitigations.length + 1}`,
            threats: threats.filter(t => t.category === category).map(t => t.id),
            type: 'preventive',
            description: 'Access controls and encryption',
            implementation: [
              'Implement role-based access control',
              'Encrypt sensitive data at rest and in transit',
              'Apply principle of least privilege'
            ],
            cost: 'high',
            effectiveness: 4
          });
          break;

        case ThreatCategory.ELEVATION_OF_PRIVILEGE:
          mitigations.push({
            id: `mitigation-${mitigations.length + 1}`,
            threats: threats.filter(t => t.category === category).map(t => t.id),
            type: 'preventive',
            description: 'Privilege management and monitoring',
            implementation: [
              'Implement strict privilege boundaries',
              'Monitor privilege usage and escalation attempts',
              'Use principle of least privilege'
            ],
            cost: 'medium',
            effectiveness: 4
          });
          break;
      }
    }

    return mitigations;
  }

  private assessRisk(
    threats: Threat[],
    vulnerabilities: ThreatVulnerability[],
    mitigations: Mitigation[]
  ): RiskAssessment {
    const overallRisk = threats.reduce((sum, t) => sum + t.riskScore, 0) / threats.length;
    const acceptableRisk = 10; // Risk threshold

    const riskCategories: Record<ThreatCategory, number> = {
      [ThreatCategory.SPOOFING]: 0,
      [ThreatCategory.TAMPERING]: 0,
      [ThreatCategory.REPUDIATION]: 0,
      [ThreatCategory.INFORMATION_DISCLOSURE]: 0,
      [ThreatCategory.DENIAL_OF_SERVICE]: 0,
      [ThreatCategory.ELEVATION_OF_PRIVILEGE]: 0
    };

    // Calculate risk by category
    for (const threat of threats) {
      riskCategories[threat.category] = Math.max(
        riskCategories[threat.category],
        threat.riskScore
      );
    }

    // Calculate residual risk after mitigations
    const mitigationEffectiveness = mitigations.reduce((sum, m) => sum + m.effectiveness, 0) / mitigations.length;
    const residualRisk = overallRisk * (1 - mitigationEffectiveness / 5);

    return {
      overallRisk,
      acceptableRisk,
      riskCategories,
      residualRisk,
      recommendations: [
        'Implement high-priority mitigations first',
        'Monitor for threat indicators',
        'Regular security assessments',
        'Update threat model as system evolves'
      ]
    };
  }
}

// Main SecurityAgent Implementation
export class SecurityAgent implements SwarmAgent {
  id: string;
  name: string;
  capabilities: AgentCapability[];
  specializations: string[];
  
  private vulnerabilityScanner: VulnerabilityScanner;
  private dependencyScanner: DependencySecurityScanner;
  private secretDetector: SecretDetectionEngine;
  private threatModeler: ThreatModelingEngine;
  private config: AgentConfig;
  private metrics: AgentMetrics;
  private isActive: boolean = false;

  constructor(id: string = 'security-agent-1') {
    this.id = id;
    this.name = 'Security Analysis Agent';
    this.capabilities = [AgentCapability.SECURITY];
    this.specializations = [
      'Vulnerability Scanning',
      'Dependency Security',
      'Secret Detection',
      'Threat Modeling',
      'Compliance Assessment',
      'Security Patches'
    ];

    this.vulnerabilityScanner = new VulnerabilityScanner();
    this.dependencyScanner = new DependencySecurityScanner();
    this.secretDetector = new SecretDetectionEngine();
    this.threatModeler = new ThreatModelingEngine();

    this.config = {
      maxConcurrentTasks: 2,
      timeoutMs: 45000,
      qualityThreshold: 0.85,
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
        [TaskType.CODE]: 0.6,
        [TaskType.TEST]: 0.7,
        [TaskType.SECURITY]: 0.95,
        [TaskType.DOCUMENT]: 0.7,
        [TaskType.REVIEW]: 0.9,
        [TaskType.REFACTOR]: 0.5,
        [TaskType.DEBUG]: 0.6
      }
    };
  }

  isAvailable(): boolean {
    return !this.isActive;
  }

  canHandle(taskType: TaskType): boolean {
    return [TaskType.SECURITY, TaskType.REVIEW].includes(taskType);
  }

  getScore(task: SwarmTask): number {
    let score = 0;

    // Base score for security tasks
    if (task.type === TaskType.SECURITY) {
      score += 0.95;
    } else if (task.type === TaskType.REVIEW) {
      score += 0.9;
    } else {
      return 0.1;
    }

    // Bonus for security-related keywords
    const description = task.description.toLowerCase();
    const securityKeywords = ['security', 'vulnerability', 'audit', 'compliance', 'threat', 'risk'];
    
    for (const keyword of securityKeywords) {
      if (description.includes(keyword)) {
        score += 0.1;
        break;
      }
    }

    // High-risk scenario bonus
    if (task.constraints.securityLevel === 'high') {
      score += 0.1;
    }

    return Math.min(1, score);
  }

  async execute(task: SwarmTask): Promise<SwarmResult> {
    this.isActive = true;
    const startTime = Date.now();

    try {
      let output: any;
      let quality = 0.85;
      let reasoning = '';

      if (task.type === TaskType.SECURITY) {
        output = await this.executeSecurityScan(task);
        quality = this.assessSecurityQuality(output);
        reasoning = 'Performed comprehensive security analysis including vulnerability scanning, dependency checking, secret detection, and threat modeling';
      } else if (task.type === TaskType.REVIEW) {
        output = await this.executeSecurityReview(task);
        quality = this.assessReviewQuality(output);
        reasoning = 'Conducted security review with vulnerability assessment and compliance checking';
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
        reasoning: `Security analysis failed: ${errorMessage}`,
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

  private async executeSecurityScan(task: SwarmTask): Promise<SecurityScanResult> {
    const code = task.context.codebase || '';
    const filename = task.context.files?.[0] || 'unknown.ts';
    
    // Vulnerability scanning
    const vulnerabilities = this.vulnerabilityScanner.scanCode(code, filename);
    
    // Dependency scanning (if package.json provided)
    const dependencies = this.extractDependencies(task.context);
    const dependencyReport = this.dependencyScanner.scanDependencies(dependencies);
    
    // Secret detection
    const secretReport = this.secretDetector.detectSecrets(code, filename);
    
    // Extract assets for threat modeling
    const assets = this.extractAssets(code, task.context);
    const threatModel = this.threatModeler.generateThreatModel(code, assets);
    
    // Generate compliance report
    const compliance = this.generateComplianceReport(vulnerabilities, secretReport);
    
    // Generate recommendations and patches
    const recommendations = this.generateSecurityRecommendations(
      vulnerabilities, 
      dependencyReport, 
      secretReport
    );
    const patches = this.generateSecurityPatches(vulnerabilities);

    return {
      overall: this.calculateOverallRating(vulnerabilities, secretReport),
      vulnerabilities,
      dependencies: dependencyReport,
      secrets: secretReport,
      compliance,
      threatModel,
      recommendations,
      patches
    };
  }

  private async executeSecurityReview(task: SwarmTask): Promise<any> {
    const existingScan = (task.context as any).securityScan;
    
    if (!existingScan) {
      // Perform new scan if none provided
      return this.executeSecurityScan(task);
    }

    // Review existing scan results
    const improvements = this.generateSecurityImprovements(existingScan);
    const compliance = this.assessCompliance(existingScan);
    
    return {
      scanResults: existingScan,
      improvements,
      compliance,
      riskAssessment: this.assessOverallRisk(existingScan),
      recommendations: this.prioritizeRecommendations(existingScan.recommendations)
    };
  }

  private extractDependencies(context: any): Record<string, string> {
    // Extract from package.json if available
    if (context.packageJson) {
      return { ...context.packageJson.dependencies, ...context.packageJson.devDependencies };
    }
    
    // Default dependencies for demonstration
    return {
      'lodash': '4.17.15',
      'express': '4.16.0',
      'react': '18.2.0'
    };
  }

  private extractAssets(code: string, context: any): Asset[] {
    const assets: Asset[] = [];

    // Extract data assets from code patterns
    if (code.includes('database') || code.includes('db')) {
      assets.push({
        id: 'user-data',
        name: 'User Database',
        type: 'data_store',
        value: 'high',
        description: 'Database containing user information',
        location: 'Database Server'
      });
    }

    if (code.includes('api') || code.includes('endpoint')) {
      assets.push({
        id: 'api-service',
        name: 'API Service',
        type: 'process',
        value: 'medium',
        description: 'REST API service',
        location: 'Application Server'
      });
    }

    // Default assets if none found
    if (assets.length === 0) {
      assets.push({
        id: 'application',
        name: 'Application Code',
        type: 'process',
        value: 'medium',
        description: 'Main application process',
        location: 'Application Server'
      });
    }

    return assets;
  }

  private generateComplianceReport(
    vulnerabilities: Vulnerability[],
    secretReport: SecretDetectionResult
  ): ComplianceReport {
    const frameworks: ComplianceFramework[] = [
      {
        name: 'OWASP Top 10',
        version: '2021',
        score: this.calculateOWASPScore(vulnerabilities),
        requirements: this.assessOWASPRequirements(vulnerabilities)
      }
    ];

    const violations: ComplianceViolation[] = [];
    
    // Check for violations
    if (secretReport.secrets.length > 0) {
      violations.push({
        framework: 'OWASP Top 10',
        requirement: 'A02:2021 – Cryptographic Failures',
        severity: SecurityRating.HIGH,
        description: 'Hardcoded secrets detected in code',
        remediation: 'Remove hardcoded secrets and use secure secret management'
      });
    }

    const highVulns = vulnerabilities.filter(v => v.severity === SecurityRating.HIGH || v.severity === SecurityRating.CRITICAL);
    if (highVulns.length > 0) {
      violations.push({
        framework: 'OWASP Top 10',
        requirement: 'A03:2021 – Injection',
        severity: SecurityRating.HIGH,
        description: 'High-severity vulnerabilities detected',
        remediation: 'Fix all high and critical severity vulnerabilities'
      });
    }

    const overallScore = frameworks.reduce((sum, f) => sum + f.score, 0) / frameworks.length;

    return {
      frameworks,
      overallScore,
      violations,
      recommendations: [
        {
          framework: 'OWASP Top 10',
          priority: 1,
          description: 'Address all high and critical vulnerabilities',
          implementation: ['Conduct security code review', 'Implement automated security testing'],
          effort: 'high'
        }
      ]
    };
  }

  private calculateOWASPScore(vulnerabilities: Vulnerability[]): number {
    const totalIssues = vulnerabilities.length;
    const criticalIssues = vulnerabilities.filter(v => v.severity === SecurityRating.CRITICAL).length;
    const highIssues = vulnerabilities.filter(v => v.severity === SecurityRating.HIGH).length;
    
    // Score decreases with more severe issues
    let score = 100;
    score -= criticalIssues * 20;
    score -= highIssues * 10;
    score -= (totalIssues - criticalIssues - highIssues) * 2;
    
    return Math.max(0, score);
  }

  private assessOWASPRequirements(vulnerabilities: Vulnerability[]): ComplianceRequirement[] {
    const requirements: ComplianceRequirement[] = [
      {
        id: 'A01:2021',
        title: 'Broken Access Control',
        description: 'Restrictions on what authenticated users are allowed to do',
        status: vulnerabilities.some(v => v.type === VulnerabilityType.BROKEN_ACCESS) ? 'non_compliant' : 'compliant',
        evidence: [],
        gaps: []
      },
      {
        id: 'A03:2021',
        title: 'Injection',
        description: 'Application is vulnerable to injection attacks',
        status: vulnerabilities.some(v => v.type === VulnerabilityType.INJECTION) ? 'non_compliant' : 'compliant',
        evidence: [],
        gaps: []
      }
    ];

    return requirements;
  }

  private calculateOverallRating(
    vulnerabilities: Vulnerability[],
    secretReport: SecretDetectionResult
  ): SecurityRating {
    const criticalCount = vulnerabilities.filter(v => v.severity === SecurityRating.CRITICAL).length;
    const highCount = vulnerabilities.filter(v => v.severity === SecurityRating.HIGH).length;
    const exposedSecrets = secretReport.secrets.filter(s => s.exposed).length;

    if (criticalCount > 0 || exposedSecrets > 0) return SecurityRating.CRITICAL;
    if (highCount > 2) return SecurityRating.HIGH;
    if (highCount > 0 || secretReport.secrets.length > 0) return SecurityRating.MEDIUM;
    if (vulnerabilities.length > 0) return SecurityRating.LOW;
    
    return SecurityRating.INFO;
  }

  private generateSecurityRecommendations(
    vulnerabilities: Vulnerability[],
    dependencyReport: DependencySecurityReport,
    secretReport: SecretDetectionResult
  ): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    // High-priority vulnerability fixes
    const criticalVulns = vulnerabilities.filter(v => v.severity === SecurityRating.CRITICAL);
    if (criticalVulns.length > 0) {
      recommendations.push({
        id: 'fix-critical-vulns',
        priority: 1,
        severity: SecurityRating.CRITICAL,
        title: 'Fix Critical Vulnerabilities',
        description: `${criticalVulns.length} critical vulnerabilities require immediate attention`,
        category: 'Vulnerability Management',
        implementation: criticalVulns.map(v => v.remediation.description),
        effort: 'high',
        impact: 'Eliminates critical security risks',
        references: ['https://owasp.org/www-project-top-ten/']
      });
    }

    // Dependency updates
    if (dependencyReport.vulnerableDependencies > 0) {
      recommendations.push({
        id: 'update-dependencies',
        priority: 2,
        severity: SecurityRating.HIGH,
        title: 'Update Vulnerable Dependencies',
        description: `${dependencyReport.vulnerableDependencies} dependencies have known vulnerabilities`,
        category: 'Dependency Management',
        implementation: dependencyReport.recommendations.map(r => r.action),
        effort: 'medium',
        impact: 'Reduces attack surface from third-party code',
        references: ['https://snyk.io/']
      });
    }

    // Secret management
    if (secretReport.secrets.length > 0) {
      recommendations.push({
        id: 'secure-secrets',
        priority: 1,
        severity: SecurityRating.HIGH,
        title: 'Implement Secure Secret Management',
        description: `${secretReport.secrets.length} hardcoded secrets detected`,
        category: 'Secret Management',
        implementation: [
          'Move secrets to environment variables',
          'Implement secret rotation',
          'Use secure secret management service'
        ],
        effort: 'medium',
        impact: 'Prevents credential exposure',
        references: ['https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html']
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  private generateSecurityPatches(vulnerabilities: Vulnerability[]): SecurityPatch[] {
    return vulnerabilities
      .filter(v => v.severity === SecurityRating.CRITICAL || v.severity === SecurityRating.HIGH)
      .map(vuln => ({
        id: `patch-${vuln.id}`,
        vulnerability: vuln.id,
        description: `Fix for ${vuln.title}`,
        files: [
          {
            path: vuln.location.file,
            changes: [
              {
                line: vuln.location.line,
                type: 'modify',
                oldContent: vuln.location.context,
                newContent: this.generateFixedCode(vuln),
                reason: vuln.remediation.description
              }
            ],
            backup: true
          }
        ],
        testing: [
          'Run security tests',
          'Verify fix effectiveness',
          'Test for regressions'
        ],
        rollback: [
          'Restore from backup',
          'Revert code changes',
          'Restart services'
        ],
        risk: vuln.severity === SecurityRating.CRITICAL ? 'low' : 'medium'
      }));
  }

  private generateFixedCode(vuln: Vulnerability): string {
    // Generate simplified fix based on vulnerability type
    switch (vuln.type) {
      case VulnerabilityType.INJECTION:
        return '// Use parameterized queries instead of string concatenation';
      case VulnerabilityType.XSS:
        return '// Use textContent instead of innerHTML for user data';
      case VulnerabilityType.SENSITIVE_DATA:
        return '// Move secret to environment variable';
      default:
        return '// Apply security fix as recommended';
    }
  }

  private generateSecurityImprovements(scanResults: SecurityScanResult): any[] {
    const improvements = [];

    if (scanResults.overall === SecurityRating.CRITICAL) {
      improvements.push({
        type: 'critical_fixes',
        description: 'Address critical security vulnerabilities immediately',
        priority: 'urgent'
      });
    }

    if (scanResults.secrets.secrets.length > 0) {
      improvements.push({
        type: 'secret_management',
        description: 'Implement proper secret management practices',
        priority: 'high'
      });
    }

    return improvements;
  }

  private assessCompliance(scanResults: SecurityScanResult): any {
    return {
      owasp: scanResults.compliance.frameworks.find(f => f.name === 'OWASP Top 10')?.score || 0,
      violations: scanResults.compliance.violations.length,
      status: scanResults.compliance.violations.length === 0 ? 'compliant' : 'non_compliant'
    };
  }

  private assessOverallRisk(scanResults: SecurityScanResult): any {
    const riskFactors = {
      vulnerabilities: scanResults.vulnerabilities.length,
      criticalVulns: scanResults.vulnerabilities.filter(v => v.severity === SecurityRating.CRITICAL).length,
      secrets: scanResults.secrets.secrets.length,
      dependencyIssues: scanResults.dependencies.vulnerableDependencies
    };

    const riskScore = (
      riskFactors.criticalVulns * 10 +
      riskFactors.vulnerabilities * 2 +
      riskFactors.secrets * 5 +
      riskFactors.dependencyIssues * 3
    );

    return {
      score: riskScore,
      level: riskScore > 50 ? 'high' : riskScore > 20 ? 'medium' : 'low',
      factors: riskFactors
    };
  }

  private prioritizeRecommendations(recommendations: SecurityRecommendation[]): SecurityRecommendation[] {
    return recommendations.sort((a, b) => {
      // Sort by severity first, then priority
      const severityOrder = [SecurityRating.CRITICAL, SecurityRating.HIGH, SecurityRating.MEDIUM, SecurityRating.LOW, SecurityRating.INFO];
      const severityDiff = severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
      
      if (severityDiff !== 0) return severityDiff;
      return a.priority - b.priority;
    });
  }

  private assessSecurityQuality(result: SecurityScanResult): number {
    let quality = 0.5; // Base quality

    // Quality increases with thorough analysis
    if (result.vulnerabilities.length >= 0) quality += 0.1; // Scan completed
    if (result.dependencies.totalDependencies > 0) quality += 0.1; // Dependencies analyzed
    if (result.secrets.patterns.length > 0) quality += 0.1; // Secret detection ran
    if (result.threatModel.threats.length > 0) quality += 0.1; // Threat modeling completed

    // Quality increases with actionable recommendations
    if (result.recommendations.length > 0) quality += 0.1;
    if (result.patches.length > 0) quality += 0.1;

    return Math.min(1, quality);
  }

  private assessReviewQuality(output: any): number {
    let quality = 0.6; // Base quality for reviews

    if (output.improvements?.length > 0) quality += 0.15;
    if (output.compliance?.status === 'compliant') quality += 0.15;
    if (output.riskAssessment) quality += 0.1;

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
  scanVulnerabilities(code: string, filename: string): Vulnerability[] {
    return this.vulnerabilityScanner.scanCode(code, filename);
  }

  scanDependencies(dependencies: Record<string, string>): DependencySecurityReport {
    return this.dependencyScanner.scanDependencies(dependencies);
  }

  detectSecrets(code: string, filename: string): SecretDetectionResult {
    return this.secretDetector.detectSecrets(code, filename);
  }

  generateThreatModel(code: string, assets: Asset[]): ThreatModelingResult {
    return this.threatModeler.generateThreatModel(code, assets);
  }
}

export default SecurityAgent; 