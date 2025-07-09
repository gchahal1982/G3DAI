export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  content: ArrayBuffer | string;
  metadata: DocumentMetadata;
}

export type DocumentType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'image' | 'email' | 'html';

export interface DocumentMetadata {
  size: number;
  created: Date;
  modified: Date;
  author?: string;
  language?: string;
}

export interface ProcessingConfig {
  languages: string[];
  entityTypes?: EntityType[];
  customPatterns?: CustomPattern[];
  taxonomies?: Taxonomy[];
  enhanceQuality?: boolean;
}

export interface EntityType {
  name: string;
  patterns?: string[];
  examples?: string[];
}

export interface CustomPattern {
  name: string;
  regex: string;
  category: string;
}

export interface Taxonomy {
  id: string;
  name: string;
  categories: TaxonomyCategory[];
}

export interface TaxonomyCategory {
  id: string;
  name: string;
  keywords: string[];
  children?: TaxonomyCategory[];
}

export interface ProcessedDocument {
  text: string;
  layout: DocumentLayout;
  entities: ExtractedEntity[];
  classification: DocumentClassification;
  metadata: ExtractedMetadata;
  confidence: number;
}

export interface DocumentLayout {
  pages: Page[];
  tables: Table[];
  forms: Form[];
  signatures: Signature[];
}

export interface Page {
  number: number;
  width: number;
  height: number;
  elements: LayoutElement[];
}

export interface LayoutElement {
  type: 'text' | 'image' | 'table' | 'form';
  bounds: { x: number; y: number; width: number; height: number };
  content: any;
}

export interface Table {
  pageNumber: number;
  rows: number;
  columns: number;
  cells: TableCell[][];
}

export interface TableCell {
  text: string;
  rowSpan: number;
  colSpan: number;
}

export interface Form {
  fields: FormField[];
}

export interface FormField {
  name: string;
  value: string;
  type: 'text' | 'checkbox' | 'radio' | 'signature';
  confidence: number;
}

export interface Signature {
  pageNumber: number;
  bounds: { x: number; y: number; width: number; height: number };
  signed: boolean;
  signatory?: string;
}

export interface ExtractedEntity {
  type: string;
  value: string;
  confidence: number;
  location: { page: number; bounds: any };
  context?: string;
}

export interface DocumentClassification {
  primaryCategory: string;
  categories: CategoryScore[];
  confidence: number;
}

export interface CategoryScore {
  category: string;
  score: number;
}

export interface ExtractedMetadata {
  title?: string;
  subject?: string;
  keywords?: string[];
  summary?: string;
}
