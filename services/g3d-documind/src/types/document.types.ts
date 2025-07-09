/**
 * G3D DocuMind - Document Intelligence TypeScript Definitions
 */

export interface DocumentProject {
    id: string;
    name: string;
    description: string;
    documents: ProcessedDocument[];
    status: 'active' | 'completed' | 'archived';
    createdAt: Date;
}

export interface ProcessedDocument {
    id: string;
    name: string;
    type: 'pdf' | 'image' | 'text' | 'word' | 'excel' | 'powerpoint';
    fileUrl: string;
    fileSize: number;
    pageCount: number;
    extractedText: string;
    entities: ExtractedEntity[];
    classification: DocumentClassification;
    analysis: DocumentAnalysis;
    createdAt: Date;
}

export interface ExtractedEntity {
    id: string;
    type: 'person' | 'organization' | 'location' | 'date' | 'money' | 'phone' | 'email' | 'custom';
    text: string;
    confidence: number;
    position: TextPosition;
    context: string;
}

export interface DocumentClassification {
    category: string;
    subcategory?: string;
    confidence: number;
    tags: string[];
    language: string;
    domain: string;
}

export interface DocumentAnalysis {
    sentiment: SentimentAnalysis;
    keyPhrases: string[];
    summary: string;
    topics: Topic[];
    readabilityScore: number;
    wordCount: number;
    characterCount: number;
}

export interface SentimentAnalysis {
    overall: 'positive' | 'negative' | 'neutral';
    confidence: number;
    score: number;
    aspects: AspectSentiment[];
}

export interface AspectSentiment {
    aspect: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
}

export interface Topic {
    name: string;
    relevance: number;
    keywords: string[];
}

export interface TextPosition {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface OCRResult {
    text: string;
    confidence: number;
    boundingBox: BoundingBox;
    words: Word[];
}

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Word {
    text: string;
    confidence: number;
    boundingBox: BoundingBox;
}