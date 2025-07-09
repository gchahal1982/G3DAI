/**
 * G3D LegalAI - Legal Assistant TypeScript Definitions
 */

export interface LegalDocument {
    id: string;
    name: string;
    type: 'contract' | 'agreement' | 'policy' | 'regulation' | 'case-law' | 'statute';
    content: string;
    analysis: DocumentAnalysis;
    clauses: LegalClause[];
    risks: RiskAssessment[];
    status: 'draft' | 'review' | 'approved' | 'executed' | 'archived';
    createdAt: Date;
    lastModified: Date;
}

export interface DocumentAnalysis {
    summary: string;
    keyTerms: string[];
    obligations: Obligation[];
    deadlines: Deadline[];
    parties: Party[];
    jurisdiction: string;
    governingLaw: string;
    confidenceScore: number;
}

export interface LegalClause {
    id: string;
    type: string;
    title: string;
    content: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    suggestions: string[];
    precedents: Precedent[];
    position: ClausePosition;
}

export interface ClausePosition {
    section: string;
    paragraph: number;
    startIndex: number;
    endIndex: number;
}

export interface Obligation {
    id: string;
    party: string;
    description: string;
    type: 'payment' | 'delivery' | 'performance' | 'compliance' | 'reporting';
    deadline?: Date;
    penalty?: string;
    status: 'pending' | 'completed' | 'overdue' | 'waived';
}

export interface Deadline {
    id: string;
    description: string;
    date: Date;
    type: 'filing' | 'payment' | 'performance' | 'notification' | 'renewal';
    priority: 'low' | 'medium' | 'high' | 'critical';
    responsible: string;
    status: 'upcoming' | 'due' | 'overdue' | 'completed';
}

export interface Party {
    id: string;
    name: string;
    type: 'individual' | 'corporation' | 'partnership' | 'government' | 'nonprofit';
    role: string;
    contact: ContactInfo;
    jurisdiction: string;
}

export interface ContactInfo {
    email?: string;
    phone?: string;
    address?: Address;
    representative?: string;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

export interface RiskAssessment {
    id: string;
    type: 'legal' | 'financial' | 'operational' | 'compliance' | 'reputational';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    probability: number;
    impact: string;
    mitigation: string[];
    relatedClauses: string[];
}

export interface Precedent {
    id: string;
    title: string;
    court: string;
    date: Date;
    citation: string;
    summary: string;
    relevance: number;
    jurisdiction: string;
    outcome: 'favorable' | 'unfavorable' | 'neutral';
}

export interface LegalResearch {
    id: string;
    query: string;
    results: ResearchResult[];
    filters: ResearchFilters;
    createdAt: Date;
}

export interface ResearchResult {
    id: string;
    title: string;
    type: 'case' | 'statute' | 'regulation' | 'article' | 'opinion';
    source: string;
    date: Date;
    relevance: number;
    summary: string;
    url?: string;
    citation: string;
}

export interface ResearchFilters {
    jurisdiction: string[];
    dateRange: DateRange;
    documentTypes: string[];
    courts: string[];
    practiceAreas: string[];
}

export interface DateRange {
    start: Date;
    end: Date;
}

export interface ComplianceCheck {
    id: string;
    regulation: string;
    jurisdiction: string;
    requirements: Requirement[];
    status: 'compliant' | 'non-compliant' | 'partial' | 'unknown';
    lastChecked: Date;
    nextReview: Date;
}

export interface Requirement {
    id: string;
    description: string;
    status: 'met' | 'not-met' | 'partial' | 'not-applicable';
    evidence: string[];
    deadline?: Date;
    responsible: string;
}