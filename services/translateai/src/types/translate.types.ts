export interface TranslatableContent {
  id: string;
  text: string;
  format: 'plain' | 'html' | 'markdown' | 'structured';
  metadata?: ContentMetadata;
}

export interface ContentMetadata {
  domain?: string;
  context?: string;
  glossary?: Record<string, string>;
  preserveFormatting?: boolean;
}

export interface TranslationConfig {
  sourceLang: string;
  targetLang: string;
  domain?: string;
  formality?: 'formal' | 'informal' | 'neutral';
  brandVoice?: BrandVoiceConfig;
  targetMarket?: string;
  translationMemory?: TranslationMemory[];
}

export interface BrandVoiceConfig {
  tone: string;
  style: string;
  terminology: Record<string, string>;
  doNotTranslate: string[];
}

export interface TranslationMemory {
  source: string;
  target: string;
  confidence: number;
  domain?: string;
}

export interface TranslatedContent {
  translation: string;
  quality: TranslationQuality;
  alternatives?: AlternativeTranslation[];
  confidence: number;
  metadata?: TranslationMetadata;
}

export interface TranslationQuality {
  overallScore: number;
  accuracy: number;
  fluency: number;
  adequacy: number;
  terminology: number;
  issues?: QualityIssue[];
}

export interface QualityIssue {
  type: 'grammar' | 'terminology' | 'style' | 'accuracy';
  severity: 'low' | 'medium' | 'high';
  location: { start: number; end: number };
  suggestion?: string;
}

export interface AlternativeTranslation {
  text: string;
  confidence: number;
  reason: string;
}

export interface TranslationMetadata {
  detectedSourceLang?: string;
  usedGlossary: boolean;
  appliedBrandVoice: boolean;
  processingTime: number;
}
