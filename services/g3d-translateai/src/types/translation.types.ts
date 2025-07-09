/**
 * G3D TranslateAI - Neural Translation TypeScript Definitions
 */

export interface TranslationProject {
    id: string;
    name: string;
    sourceLanguage: string;
    targetLanguages: string[];
    documents: Document[];
    status: 'active' | 'completed' | 'archived';
    createdAt: Date;
}

export interface Document {
    id: string;
    name: string;
    originalText: string;
    translations: Translation[];
    wordCount: number;
    type: 'text' | 'document' | 'website' | 'subtitle';
    uploadedAt: Date;
}

export interface Translation {
    id: string;
    targetLanguage: string;
    translatedText: string;
    confidence: number;
    model: string;
    status: 'pending' | 'completed' | 'reviewed' | 'approved';
    translatedAt: Date;
    reviewedBy?: string;
}

export interface Language {
    code: string;
    name: string;
    nativeName: string;
    supported: boolean;
    quality: 'high' | 'medium' | 'low';
}

export interface TranslationQuality {
    accuracy: number;
    fluency: number;
    adequacy: number;
    overallScore: number;
    issues: QualityIssue[];
}

export interface QualityIssue {
    type: 'grammar' | 'terminology' | 'style' | 'cultural';
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion?: string;
    position: TextPosition;
}

export interface TextPosition {
    start: number;
    end: number;
    line?: number;
    column?: number;
}

export interface TranslationMemory {
    id: string;
    sourceText: string;
    targetText: string;
    sourceLanguage: string;
    targetLanguage: string;
    confidence: number;
    domain: string;
    createdAt: Date;
}

export interface Glossary {
    id: string;
    name: string;
    domain: string;
    entries: GlossaryEntry[];
    languages: string[];
    createdAt: Date;
}

export interface GlossaryEntry {
    id: string;
    sourceText: string;
    targetText: string;
    context?: string;
    notes?: string;
}