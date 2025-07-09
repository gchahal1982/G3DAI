export interface LegalDocument {
  id: string;
  title: string;
  type: DocumentType;
  content: string;
  metadata: DocumentMetadata;
  jurisdiction?: string;
}

export type DocumentType = 
  | 'contract'
  | 'agreement'
  | 'memorandum'
  | 'brief'
  | 'motion'
  | 'patent'
  | 'trademark'
  | 'compliance';

export interface DocumentMetadata {
  parties: string[];
  date: Date;
  effectiveDate?: Date;
  expirationDate?: Date;
  value?: number;
  status: 'draft' | 'executed' | 'expired';
}

export interface LegalAnalysisConfig {
  clauseTypes?: ClauseType[];
  jurisdiction: string;
  riskProfile: RiskProfile;
  industryStandards?: string[];
  applicableRegulations?: string[];
  researchDateRange?: DateRange;
}

export interface ClauseType {
  name: string;
  category: string;
  required: boolean;
  standardLanguage?: string;
}

export interface RiskProfile {
  tolerance: 'low' | 'medium' | 'high';
  focusAreas: string[];
  dealBreakers: string[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface LegalAnalysis {
  clauses: ExtractedClause[];
  risks: RiskAssessment;
  compliance: ComplianceCheck;
  research: CaseResearch;
  recommendations: Recommendation[];
}

export interface ExtractedClause {
  type: string;
  text: string;
  location: { start: number; end: number };
  analysis: ClauseAnalysis;
}

export interface ClauseAnalysis {
  isStandard: boolean;
  deviations: string[];
  risks: string[];
  suggestions: string[];
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  identifiedIssues: RiskIssue[];
  score: number;
}

export interface RiskIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: { start: number; end: number };
  mitigation?: string;
}

export interface ComplianceCheck {
  compliant: boolean;
  violations: ComplianceViolation[];
  warnings: ComplianceWarning[];
}

export interface ComplianceViolation {
  regulation: string;
  section: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
}

export interface ComplianceWarning {
  regulation: string;
  description: string;
  recommendation: string;
}

export interface CaseResearch {
  relevantCases: Case[];
  statutes: Statute[];
  analysis: string;
}

export interface Case {
  name: string;
  citation: string;
  year: number;
  jurisdiction: string;
  relevance: number;
  summary: string;
}

export interface Statute {
  title: string;
  section: string;
  text: string;
  applicability: string;
}

export interface Recommendation {
  type: 'revision' | 'addition' | 'deletion' | 'clarification';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedText?: string;
  rationale: string;
}
