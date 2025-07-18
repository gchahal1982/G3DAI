import { VectorDB } from './VectorDB';
import { SemanticStore } from './SemanticStore';

/**
 * Retriever - Hybrid relevance ranking for context retrieval
 * 
 * Implements BM25 text scoring, cosine similarity vector scoring, and recency-weighted
 * ranking to retrieve the most relevant context chunks for a given intent.
 */

export interface ContextChunk {
  id: string;
  content: string;
  filePath: string;
  startLine: number;
  endLine: number;
  symbols: string[];
  embedding?: number[];
  lastModified: number;
  accessCount: number;
  metadata?: Record<string, any>;
}

export interface RetrievalQuery {
  text: string;
  embedding?: number[];
  intent: string;
  context: string[];
  tokenBudget: number;
  filters?: {
    fileTypes?: string[];
    directories?: string[];
    maxAge?: number; // milliseconds
    minRelevance?: number; // 0-1
  };
}

export interface RetrievalResult {
  chunks: ContextChunk[];
  scores: {
    chunkId: string;
    textScore: number;
    vectorScore: number;
    recencyScore: number;
    hybridScore: number;
  }[];
  totalTokens: number;
  retrievalTime: number;
}

export interface BM25Config {
  k1: number; // Term frequency saturation parameter
  b: number;  // Field length normalization parameter
}

export class Retriever {
  private vectorDB: VectorDB;
  private semanticStore: SemanticStore;
  private bm25Config: BM25Config = { k1: 1.2, b: 0.75 };
  private documentFreq: Map<string, number> = new Map(); // Term -> document frequency
  private documentLengths: Map<string, number> = new Map(); // Document ID -> length
  private averageDocLength: number = 0;
  private totalDocuments: number = 0;

  constructor(vectorDB: VectorDB, semanticStore: SemanticStore) {
    this.vectorDB = vectorDB;
    this.semanticStore = semanticStore;
    this.buildBM25Index();
  }

  /**
   * Retrieve relevant context chunks using hybrid ranking
   */
  public async retrieve(query: RetrievalQuery): Promise<RetrievalResult> {
    const startTime = performance.now();

    // Get candidate chunks from multiple sources
    const candidates = await this.getCandidateChunks(query);
    
    // Score chunks using hybrid approach
    const scoredChunks = await this.scoreChunks(candidates, query);
    
    // Rank and filter chunks
    const rankedChunks = this.rankChunks(scoredChunks, query);
    
    // Assemble final result within token budget
    const result = this.assembleResult(rankedChunks, query);
    
    const retrievalTime = performance.now() - startTime;

    return {
      ...result,
      retrievalTime
    };
  }

  /**
   * Get candidate chunks from vector search and semantic store
   */
  private async getCandidateChunks(query: RetrievalQuery): Promise<ContextChunk[]> {
    const candidates = new Map<string, ContextChunk>();

    // Vector similarity search
    if (query.embedding) {
      const vectorResults = await this.vectorDB.search(query.embedding, 50);
      for (const result of vectorResults) {
        const chunk = await this.semanticStore.getChunk(result.id);
        if (chunk) {
          candidates.set(chunk.id, chunk);
        }
      }
    }

    // Text-based search for specific symbols/files mentioned in context
    for (const contextItem of query.context) {
      const textResults = await this.semanticStore.searchByText(contextItem, 20);
      for (const chunk of textResults) {
        candidates.set(chunk.id, chunk);
      }
    }

    // Intent-based search
    const intentResults = await this.semanticStore.searchByIntent(query.intent, 30);
    for (const chunk of intentResults) {
      candidates.set(chunk.id, chunk);
    }

    // Apply filters
    let filteredCandidates = Array.from(candidates.values());
    
    if (query.filters) {
      filteredCandidates = this.applyFilters(filteredCandidates, query.filters);
    }

    return filteredCandidates;
  }

  /**
   * Score chunks using hybrid approach (BM25 + Vector + Recency)
   */
  private async scoreChunks(
    chunks: ContextChunk[], 
    query: RetrievalQuery
  ): Promise<Array<{ chunk: ContextChunk; scores: any }>> {
    const scoredChunks = [];

    for (const chunk of chunks) {
      // BM25 text scoring
      const textScore = this.calculateBM25Score(chunk, query.text);
      
      // Cosine similarity vector scoring
      const vectorScore = query.embedding && chunk.embedding 
        ? this.calculateCosineSimilarity(query.embedding, chunk.embedding)
        : 0;
      
      // Recency scoring
      const recencyScore = this.calculateRecencyScore(chunk);
      
      // Access frequency scoring
      const frequencyScore = this.calculateFrequencyScore(chunk);
      
      // Hybrid score combination
      const hybridScore = this.calculateHybridScore({
        textScore,
        vectorScore,
        recencyScore,
        frequencyScore
      });

      scoredChunks.push({
        chunk,
        scores: {
          chunkId: chunk.id,
          textScore,
          vectorScore,
          recencyScore,
          frequencyScore,
          hybridScore
        }
      });
    }

    return scoredChunks;
  }

  /**
   * Calculate BM25 score for text relevance
   */
  private calculateBM25Score(chunk: ContextChunk, queryText: string): number {
    const queryTerms = this.tokenize(queryText.toLowerCase());
    const documentTerms = this.tokenize(chunk.content.toLowerCase());
    const documentLength = documentTerms.length;
    
    let score = 0;

    for (const term of queryTerms) {
      const termFreq = documentTerms.filter(t => t === term).length;
      const docFreq = this.documentFreq.get(term) || 0;
      
      if (termFreq > 0 && docFreq > 0) {
        // IDF calculation
        const idf = Math.log((this.totalDocuments - docFreq + 0.5) / (docFreq + 0.5));
        
        // TF calculation with BM25 normalization
        const tf = (termFreq * (this.bm25Config.k1 + 1)) / 
          (termFreq + this.bm25Config.k1 * (1 - this.bm25Config.b + 
            this.bm25Config.b * (documentLength / this.averageDocLength)));
        
        score += idf * tf;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Calculate cosine similarity between embeddings
   */
  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * Calculate recency score (more recent = higher score)
   */
  private calculateRecencyScore(chunk: ContextChunk): number {
    const now = Date.now();
    const age = now - chunk.lastModified;
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    // Exponential decay over time
    return Math.exp(-age / maxAge);
  }

  /**
   * Calculate frequency score based on access count
   */
  private calculateFrequencyScore(chunk: ContextChunk): number {
    // Log-scale scoring to prevent extremely high access counts from dominating
    return Math.log(chunk.accessCount + 1) / Math.log(100); // Normalize to ~1.0 max
  }

  /**
   * Calculate hybrid score combining all factors
   */
  private calculateHybridScore(scores: {
    textScore: number;
    vectorScore: number;
    recencyScore: number;
    frequencyScore: number;
  }): number {
    // Weighted combination of scores
    const weights = {
      text: 0.4,    // Text relevance is most important
      vector: 0.35, // Vector similarity is second most important
      recency: 0.15, // Recent content is preferred
      frequency: 0.1 // Frequently accessed content is slightly preferred
    };

    return (
      scores.textScore * weights.text +
      scores.vectorScore * weights.vector +
      scores.recencyScore * weights.recency +
      scores.frequencyScore * weights.frequency
    );
  }

  /**
   * Rank chunks by hybrid score and apply relevance threshold
   */
  private rankChunks(
    scoredChunks: Array<{ chunk: ContextChunk; scores: any }>,
    query: RetrievalQuery
  ): Array<{ chunk: ContextChunk; scores: any }> {
    // Sort by hybrid score descending
    const ranked = scoredChunks.sort((a, b) => b.scores.hybridScore - a.scores.hybridScore);
    
    // Apply minimum relevance threshold
    const minRelevance = query.filters?.minRelevance || 0.1;
    return ranked.filter(item => item.scores.hybridScore >= minRelevance);
  }

  /**
   * Assemble final result within token budget
   */
  private assembleResult(
    rankedChunks: Array<{ chunk: ContextChunk; scores: any }>,
    query: RetrievalQuery
  ): { chunks: ContextChunk[]; scores: any[]; totalTokens: number } {
    const selectedChunks: ContextChunk[] = [];
    const selectedScores: any[] = [];
    let totalTokens = 0;

    for (const item of rankedChunks) {
      const chunkTokens = this.estimateTokenCount(item.chunk.content);
      
      if (totalTokens + chunkTokens <= query.tokenBudget) {
        selectedChunks.push(item.chunk);
        selectedScores.push(item.scores);
        totalTokens += chunkTokens;
        
        // Update access count for selected chunks
        this.updateAccessCount(item.chunk.id);
      } else {
        break; // Stop when token budget is exhausted
      }
    }

    return {
      chunks: selectedChunks,
      scores: selectedScores,
      totalTokens
    };
  }

  /**
   * Apply filters to candidate chunks
   */
  private applyFilters(chunks: ContextChunk[], filters: NonNullable<RetrievalQuery['filters']>): ContextChunk[] {
    return chunks.filter(chunk => {
      // File type filter
      if (filters.fileTypes) {
        const fileExt = chunk.filePath.split('.').pop()?.toLowerCase();
        if (fileExt && !filters.fileTypes.includes(fileExt)) {
          return false;
        }
      }

      // Directory filter
      if (filters.directories) {
        const isInAllowedDir = filters.directories.some(dir => 
          chunk.filePath.startsWith(dir)
        );
        if (!isInAllowedDir) {
          return false;
        }
      }

      // Age filter
      if (filters.maxAge) {
        const age = Date.now() - chunk.lastModified;
        if (age > filters.maxAge) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Build BM25 index for text scoring
   */
  private async buildBM25Index(): Promise<void> {
    // This would typically be called during startup or when documents change
    const allChunks = await this.semanticStore.getAllChunks();
    
    this.documentFreq.clear();
    this.documentLengths.clear();
    
    let totalLength = 0;
    this.totalDocuments = allChunks.length;

    for (const chunk of allChunks) {
      const terms = this.tokenize(chunk.content.toLowerCase());
      const uniqueTerms = new Set(terms);
      
      this.documentLengths.set(chunk.id, terms.length);
      totalLength += terms.length;

      // Update document frequency for each unique term
      for (const term of uniqueTerms) {
        this.documentFreq.set(term, (this.documentFreq.get(term) || 0) + 1);
      }
    }

    this.averageDocLength = totalLength / this.totalDocuments;
  }

  /**
   * Simple tokenization (could be enhanced with better NLP)
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1);
  }

  /**
   * Estimate token count for content (rough approximation)
   */
  private estimateTokenCount(content: string): number {
    // Rough estimate: ~4 characters per token on average
    return Math.ceil(content.length / 4);
  }

  /**
   * Update access count for a chunk
   */
  private async updateAccessCount(chunkId: string): Promise<void> {
    await this.semanticStore.incrementAccessCount(chunkId);
  }

  /**
   * Cache warming strategies for frequently accessed content
   */
  public async warmCache(recentFiles: string[]): Promise<void> {
    for (const filePath of recentFiles) {
      const chunks = await this.semanticStore.getChunksByFile(filePath);
      for (const chunk of chunks) {
        if (chunk.embedding) {
          // Pre-load embeddings into vector database cache
          await this.vectorDB.preloadEmbedding(chunk.id, chunk.embedding);
        }
      }
    }
  }

  /**
   * Get retrieval performance metrics
   */
  public getMetrics(): {
    totalDocuments: number;
    averageDocLength: number;
    vocabularySize: number;
    cacheHitRate: number;
  } {
    return {
      totalDocuments: this.totalDocuments,
      averageDocLength: this.averageDocLength,
      vocabularySize: this.documentFreq.size,
      cacheHitRate: this.vectorDB.getCacheHitRate()
    };
  }
}

export default Retriever; 