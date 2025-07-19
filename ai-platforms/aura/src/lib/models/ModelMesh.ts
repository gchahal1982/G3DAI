/**
 * ModelMesh - Multi-Vendor AI Model Abstraction Layer
 * Aura MVP - Updated for July 2025 Model Landscape
 * 
 * Provides unified interface across OpenAI, Anthropic, Google, xAI, DeepSeek,
 * Alibaba Qwen, and Meta Llama model providers with intelligent routing,
 * cost optimization, and performance monitoring.
 */

import { EventEmitter } from 'events';

// Core Types & Interfaces
export interface ModelCapabilities {
  contextWindow: number;
  outputTokens: number;
  multimodal: boolean;
  thinkingMode: boolean;
  reasoningChains: boolean;
  codeOptimized: boolean;
  languages: string[];
  pricing: {
    inputPerMToken: number;
    outputPerMToken: number;
  };
}

export interface ModelAdapter {
  id: string;
  name: string;
  provider: string;
  capabilities: ModelCapabilities;
  
  // Core Methods
  complete(prompt: string, options?: CompletionOptions): Promise<CompletionResult>;
  stream(prompt: string, options?: CompletionOptions): AsyncGenerator<CompletionChunk>;
  embeddings(text: string): Promise<number[]>;
  
  // Health & Monitoring
  healthCheck(): Promise<boolean>;
  getLatency(): Promise<number>;
  getCost(tokens: number): number;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  useThinking?: boolean;
  systemPrompt?: string;
  userId?: string;
}

export interface CompletionResult {
  text: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  latency: number;
  model: string;
  reasoning?: string; // For thinking mode models
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface CompletionChunk {
  delta: string;
  tokens: number;
  done: boolean;
  reasoning?: string;
}

// OpenAI 2025 Models
export class OpenAIGPT41Adapter implements ModelAdapter {
  id = 'openai-gpt-4.1';
  name = 'GPT-4.1';
  provider = 'openai';
  
  capabilities: ModelCapabilities = {
    contextWindow: 1000000, // 1M tokens
    outputTokens: 32768,
    multimodal: true,
    thinkingMode: false,
    reasoningChains: true,
    codeOptimized: true,
    languages: ['typescript', 'python', 'rust', 'go', 'java', 'cpp', 'c', 'javascript'],
    pricing: {
      inputPerMToken: 15.0,  // $15 per 1M input tokens
      outputPerMToken: 30.0  // $30 per 1M output tokens
    }
  };

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Data-Policy': 'opt-out-training'
        },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [
            ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 4096,
          top_p: options.topP ?? 1.0,
          frequency_penalty: options.frequencyPenalty ?? 0,
          presence_penalty: options.presencePenalty ?? 0,
          stop: options.stopSequences,
          user: options.userId
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;
      
      const inputTokens = data.usage.prompt_tokens;
      const outputTokens = data.usage.completion_tokens;
      const totalTokens = data.usage.total_tokens;
      
      return {
        text: data.choices[0].message.content,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens
        },
        cost: this.getCost(totalTokens),
        latency,
        model: this.id,
        confidence: data.choices[0].finish_reason === 'stop' ? 0.95 : 0.8,
        metadata: {
          finishReason: data.choices[0].finish_reason,
          apiVersion: '2025-07'
        }
      };
    } catch (error) {
      throw new Error(`GPT-4.1 completion failed: ${(error as Error).message}`);
    }
  }

  async *stream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<CompletionChunk> {
    // Implementation for streaming responses
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Data-Policy': 'opt-out-training'
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4096
      })
    });

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += new TextDecoder().decode(value);
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices[0]?.delta?.content || '';
            if (delta) {
              yield {
                delta,
                tokens: 1, // Approximation
                done: false
              };
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  }

  async embeddings(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-large',
        input: text
      })
    });

    const data = await response.json();
    return data.data[0].embedding;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const startTime = Date.now();
    await this.healthCheck();
    return Date.now() - startTime;
  }

  getCost(tokens: number): number {
    // Simplified cost calculation (assumes 50/50 input/output)
    const inputTokens = tokens * 0.5;
    const outputTokens = tokens * 0.5;
    return (inputTokens * this.capabilities.pricing.inputPerMToken / 1000000) +
           (outputTokens * this.capabilities.pricing.outputPerMToken / 1000000);
  }
}

export class OpenAIO3Adapter implements ModelAdapter {
  id = 'openai-o3';
  name = 'OpenAI o3';
  provider = 'openai';
  
  capabilities: ModelCapabilities = {
    contextWindow: 200000,
    outputTokens: 16384,
    multimodal: false,
    thinkingMode: true,
    reasoningChains: true,
    codeOptimized: true,
    languages: ['typescript', 'python', 'rust', 'go', 'java', 'cpp'],
    pricing: {
      inputPerMToken: 60.0,  // Premium reasoning model
      outputPerMToken: 120.0
    }
  };

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Data-Policy': 'opt-out-training'
        },
        body: JSON.stringify({
          model: 'o3',
          messages: [
            ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          temperature: options.temperature ?? 0.1, // Lower for reasoning
          max_tokens: options.maxTokens ?? 8192,
          reasoning: options.useThinking ?? true
        })
      });

      const data = await response.json();
      const latency = Date.now() - startTime;
      
      return {
        text: data.choices[0].message.content,
        tokens: {
          input: data.usage.prompt_tokens,
          output: data.usage.completion_tokens,
          total: data.usage.total_tokens
        },
        cost: this.getCost(data.usage.total_tokens),
        latency,
        model: this.id,
        reasoning: data.choices[0].message.reasoning, // o3 thinking process
        confidence: 0.98, // High confidence for reasoning model
        metadata: {
          reasoningTokens: data.usage.reasoning_tokens || 0
        }
      };
    } catch (error) {
      throw new Error(`OpenAI o3 completion failed: ${(error as Error).message}`);
    }
  }

  async *stream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<CompletionChunk> {
    // Similar to GPT-4.1 but with reasoning chunks
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'o3',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        reasoning: true,
        temperature: options.temperature ?? 0.1
      })
    });

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += new TextDecoder().decode(value);
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices[0]?.delta?.content || '';
            const reasoning = parsed.choices[0]?.delta?.reasoning || '';
            
            if (delta || reasoning) {
              yield {
                delta,
                tokens: 1,
                done: false,
                reasoning
              };
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  }

  async embeddings(text: string): Promise<number[]> {
    // Delegate to embedding model
    const embeddingAdapter = new OpenAIGPT41Adapter();
    return embeddingAdapter.embeddings(text);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const startTime = Date.now();
    await this.healthCheck();
    return Date.now() - startTime;
  }

  getCost(tokens: number): number {
    const inputTokens = tokens * 0.3; // Reasoning models use more input context
    const outputTokens = tokens * 0.7;
    return (inputTokens * this.capabilities.pricing.inputPerMToken / 1000000) +
           (outputTokens * this.capabilities.pricing.outputPerMToken / 1000000);
  }
}

// Anthropic Claude 4 Models
export class Claude4SonnetAdapter implements ModelAdapter {
  id = 'anthropic-claude-4-sonnet';
  name = 'Claude 4 Sonnet';
  provider = 'anthropic';
  
  capabilities: ModelCapabilities = {
    contextWindow: 200000,
    outputTokens: 8192,
    multimodal: true,
    thinkingMode: true,
    reasoningChains: true,
    codeOptimized: true,
    languages: ['typescript', 'python', 'rust', 'go', 'java', 'cpp', 'c', 'javascript', 'sql'],
    pricing: {
      inputPerMToken: 15.0,
      outputPerMToken: 75.0
    }
  };

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'Content-Type': 'application/json',
          'anthropic-version': '2025-07-18',
          'X-Data-Policy': 'opt-out-training'
        },
        body: JSON.stringify({
          model: 'claude-4-sonnet-20250718',
          max_tokens: options.maxTokens ?? 8192,
          temperature: options.temperature ?? 0.7,
          system: options.systemPrompt,
          thinking: options.useThinking ?? true,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      });

      const data = await response.json();
      const latency = Date.now() - startTime;
      
      return {
        text: data.content[0].text,
        tokens: {
          input: data.usage.input_tokens,
          output: data.usage.output_tokens,
          total: data.usage.input_tokens + data.usage.output_tokens
        },
        cost: this.getCost(data.usage.input_tokens + data.usage.output_tokens),
        latency,
        model: this.id,
        reasoning: data.thinking || undefined,
        confidence: 0.96,
        metadata: {
          stopReason: data.stop_reason,
          thinkingTokens: data.usage.thinking_tokens || 0
        }
      };
    } catch (error) {
      throw new Error(`Claude 4 Sonnet completion failed: ${(error as Error).message}`);
    }
  }

  async *stream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<CompletionChunk> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'Content-Type': 'application/json',
        'anthropic-version': '2025-07-18'
      },
      body: JSON.stringify({
        model: 'claude-4-sonnet-20250718',
        max_tokens: options.maxTokens ?? 8192,
        stream: true,
        thinking: true,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += new TextDecoder().decode(value);
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta') {
              yield {
                delta: parsed.delta.text || '',
                tokens: 1,
                done: false,
                reasoning: parsed.delta.thinking
              };
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  }

  async embeddings(text: string): Promise<number[]> {
    // Claude doesn't have embeddings, delegate to OpenAI
    const embeddingAdapter = new OpenAIGPT41Adapter();
    return embeddingAdapter.embeddings(text);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'Content-Type': 'application/json',
          'anthropic-version': '2025-07-18'
        },
        body: JSON.stringify({
          model: 'claude-4-sonnet-20250718',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }]
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const startTime = Date.now();
    await this.healthCheck();
    return Date.now() - startTime;
  }

  getCost(tokens: number): number {
    const inputTokens = tokens * 0.6;
    const outputTokens = tokens * 0.4;
    return (inputTokens * this.capabilities.pricing.inputPerMToken / 1000000) +
           (outputTokens * this.capabilities.pricing.outputPerMToken / 1000000);
  }
}

export class Claude4OpusAdapter implements ModelAdapter {
  id = 'anthropic-claude-4-opus';
  name = 'Claude 4 Opus';
  provider = 'anthropic';
  
  capabilities: ModelCapabilities = {
    contextWindow: 200000,
    outputTokens: 8192,
    multimodal: true,
    thinkingMode: true,
    reasoningChains: true,
    codeOptimized: true,
    languages: ['typescript', 'python', 'rust', 'go', 'java', 'cpp', 'c', 'javascript', 'sql', 'haskell'],
    pricing: {
      inputPerMToken: 75.0,  // Premium model
      outputPerMToken: 225.0
    }
  };

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    // Similar implementation to Claude 4 Sonnet but with claude-4-opus model
    const startTime = Date.now();
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'Content-Type': 'application/json',
          'anthropic-version': '2025-07-18'
        },
        body: JSON.stringify({
          model: 'claude-4-opus-20250718',
          max_tokens: options.maxTokens ?? 8192,
          temperature: options.temperature ?? 0.3, // Lower for highest quality
          system: options.systemPrompt,
          thinking: options.useThinking ?? true,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();
      const latency = Date.now() - startTime;
      
      return {
        text: data.content[0].text,
        tokens: {
          input: data.usage.input_tokens,
          output: data.usage.output_tokens,
          total: data.usage.input_tokens + data.usage.output_tokens
        },
        cost: this.getCost(data.usage.input_tokens + data.usage.output_tokens),
        latency,
        model: this.id,
        reasoning: data.thinking || undefined,
        confidence: 0.99, // Highest confidence for flagship model
        metadata: {
          stopReason: data.stop_reason,
          thinkingTokens: data.usage.thinking_tokens || 0
        }
      };
    } catch (error) {
      throw new Error(`Claude 4 Opus completion failed: ${(error as Error).message}`);
    }
  }

  async *stream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<CompletionChunk> {
    // Implementation similar to Claude 4 Sonnet
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'Content-Type': 'application/json',
        'anthropic-version': '2025-07-18'
      },
      body: JSON.stringify({
        model: 'claude-4-opus-20250718',
        max_tokens: options.maxTokens ?? 8192,
        stream: true,
        thinking: true,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += new TextDecoder().decode(value);
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta') {
              yield {
                delta: parsed.delta.text || '',
                tokens: 1,
                done: false,
                reasoning: parsed.delta.thinking
              };
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  }

  async embeddings(text: string): Promise<number[]> {
    const embeddingAdapter = new OpenAIGPT41Adapter();
    return embeddingAdapter.embeddings(text);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'Content-Type': 'application/json',
          'anthropic-version': '2025-07-18'
        },
        body: JSON.stringify({
          model: 'claude-4-opus-20250718',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }]
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const startTime = Date.now();
    await this.healthCheck();
    return Date.now() - startTime;
  }

  getCost(tokens: number): number {
    const inputTokens = tokens * 0.6;
    const outputTokens = tokens * 0.4;
    return (inputTokens * this.capabilities.pricing.inputPerMToken / 1000000) +
           (outputTokens * this.capabilities.pricing.outputPerMToken / 1000000);
  }
}

// Google Gemini 2.5 Pro
export class Gemini25ProAdapter implements ModelAdapter {
  id = 'google-gemini-2.5-pro';
  name = 'Gemini 2.5 Pro';
  provider = 'google';
  
  capabilities: ModelCapabilities = {
    contextWindow: 1000000, // 1M tokens
    outputTokens: 60000,
    multimodal: true,
    thinkingMode: false,
    reasoningChains: true,
    codeOptimized: true,
    languages: ['typescript', 'python', 'rust', 'go', 'java', 'cpp', 'c', 'javascript', 'kotlin', 'swift'],
    pricing: {
      inputPerMToken: 7.0,
      outputPerMToken: 21.0
    }
  };

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Data-Policy': 'opt-out-training'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.maxTokens ?? 8192,
            topP: options.topP ?? 1.0,
            stopSequences: options.stopSequences
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE'
            }
          ]
        })
      });

      const data = await response.json();
      const latency = Date.now() - startTime;
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No completion generated');
      }

      const candidate = data.candidates[0];
      const text = candidate.content.parts[0].text;
      
      // Estimate token usage (Gemini doesn't always return usage)
      const estimatedTokens = Math.ceil(text.length / 4); // Rough estimation
      
      return {
        text,
        tokens: {
          input: data.usageMetadata?.promptTokenCount || Math.ceil(prompt.length / 4),
          output: data.usageMetadata?.candidatesTokenCount || estimatedTokens,
          total: data.usageMetadata?.totalTokenCount || estimatedTokens + Math.ceil(prompt.length / 4)
        },
        cost: this.getCost(data.usageMetadata?.totalTokenCount || estimatedTokens),
        latency,
        model: this.id,
        confidence: candidate.finishReason === 'STOP' ? 0.94 : 0.8,
        metadata: {
          finishReason: candidate.finishReason,
          safetyRatings: candidate.safetyRatings
        }
      };
    } catch (error) {
      throw new Error(`Gemini 2.5 Pro completion failed: ${(error as Error).message}`);
    }
  }

  async *stream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<CompletionChunk> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:streamGenerateContent?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 8192
        }
      })
    });

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += new TextDecoder().decode(value);
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.candidates && parsed.candidates[0]?.content?.parts[0]?.text) {
              const delta = parsed.candidates[0].content.parts[0].text;
              yield {
                delta,
                tokens: Math.ceil(delta.length / 4),
                done: false
              };
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  }

  async embeddings(text: string): Promise<number[]> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: {
          parts: [{ text }]
        }
      })
    });

    const data = await response.json();
    return data.embedding.values;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const startTime = Date.now();
    await this.healthCheck();
    return Date.now() - startTime;
  }

  getCost(tokens: number): number {
    const inputTokens = tokens * 0.6;
    const outputTokens = tokens * 0.4;
    return (inputTokens * this.capabilities.pricing.inputPerMToken / 1000000) +
           (outputTokens * this.capabilities.pricing.outputPerMToken / 1000000);
  }
}

// LOCAL MODEL ADAPTERS (7 models for privacy-first coding)

// 1. Qwen3-Coder Adapter - Primary coding model (4B/8B/14B/32B variants)
class Qwen3CoderAdapter implements ModelAdapter {
  id = 'qwen3-coder-14b';
  name = 'Qwen3-Coder 14B';
  provider = 'Alibaba/Local';
  capabilities: ModelCapabilities = {
    contextWindow: 131072,
    outputTokens: 8192,
    multimodal: false,
    thinkingMode: false,
    reasoningChains: true,
    codeOptimized: true,
    languages: ['python', 'javascript', 'typescript', 'rust', 'go', 'cpp', 'java'],
    pricing: { inputPerMToken: 0, outputPerMToken: 0 } // Local model - free
  };

  private async fetchFromLocalServer(endpoint: string, body: object): Promise<any> {
    const response = await fetch(`http://localhost:8080/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Qwen3-Coder local server error: ${response.statusText}`);
    }
    return response.json();
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const startTime = Date.now();
    try {
      const data = await this.fetchFromLocalServer('completion', {
        prompt,
        temperature: options.temperature ?? 0.1,
        max_tokens: options.maxTokens ?? 4096,
        stop: options.stopSequences || ['\n\n', '```']
      });

      return {
        text: data.content,
        tokens: { input: data.usage.prompt_tokens, output: data.usage.completion_tokens, total: data.usage.total_tokens },
        cost: 0, // Local model
        latency: Date.now() - startTime,
        model: this.id,
        confidence: 0.92,
        metadata: { finishReason: data.stop_reason, modelVariant: '14B' }
      };
    } catch (error: any) {
      throw new Error(`Qwen3-Coder completion failed: ${error?.message || 'Unknown error'}`);
    }
  }

  async *stream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<CompletionChunk> {
    // Streaming implementation for local model
    const response = await fetch('http://localhost:8080/completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, stream: true, temperature: options.temperature ?? 0.1 })
    });

    if (!response.body) throw new Error("No response body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        yield { delta: chunk, tokens: 1, done: false };
    }
  }

  async embeddings(text: string): Promise<number[]> {
    const data = await this.fetchFromLocalServer('embeddings', { input: text });
    return data.embedding;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:8080/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const start = Date.now();
    await this.healthCheck();
    return Date.now() - start;
  }

  getCost(tokens: number): number { return 0; } // Local model
}

// 2. Phi-4-mini-instruct Adapter - Local agentic capabilities (3.8B, 88.6% GSM8K, 64.0% MATH, 62.8% HumanEval)
class Phi4MiniAdapter implements ModelAdapter {
  id = 'phi-4-mini';
  name = 'Phi-4-mini-instruct';
  provider = 'Microsoft/Local';
  capabilities: ModelCapabilities = {
    contextWindow: 128000,
    outputTokens: 4096,
    multimodal: false,
    thinkingMode: true,
    reasoningChains: true,
    codeOptimized: true,
    languages: ['python', 'javascript', 'typescript', 'csharp', 'cpp'],
    pricing: { inputPerMToken: 0, outputPerMToken: 0 }
  };

  private async fetchFromLocalServer(endpoint: string, body: object): Promise<any> {
    const response = await fetch(`http://localhost:8081/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Phi-4-mini-instruct local server error: ${response.statusText}`);
    }
    return response.json();
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const startTime = Date.now();
    try {
      const data = await this.fetchFromLocalServer('completion', {
        prompt,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 2048,
        enable_thinking: true // Phi-4's thinking mode
      });

      return {
        text: data.content,
        tokens: { input: data.usage.prompt_tokens, output: data.usage.completion_tokens, total: data.usage.total_tokens },
        cost: 0,
        latency: Date.now() - startTime,
        model: this.id,
        confidence: 0.89,
        metadata: { finishReason: data.stop_reason, thinkingTokens: data.thinking_tokens }
      };
    } catch (error: any) {
      throw new Error(`Phi-4-mini-instruct completion failed: ${error?.message || 'Unknown error'}`);
    }
  }

  async *stream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<CompletionChunk> {
    // Similar streaming implementation
    const response = await fetch('http://localhost:8081/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, stream: true, temperature: options.temperature ?? 0.3 })
    });

    if (!response.body) throw new Error("No response body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // Assuming chunk is a JSON string with delta
        const parsed = JSON.parse(chunk);
        yield { delta: parsed.delta, tokens: 1, done: false, reasoning: parsed.reasoning };
    }
  }

  async embeddings(text: string): Promise<number[]> {
    const data = await this.fetchFromLocalServer('embeddings', { input: text });
    return data.embedding;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:8081/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const start = Date.now();
    await this.healthCheck();
    return Date.now() - start;
  }

  getCost(tokens: number): number { return 0; }
}

// 3. Gemma 3 QAT Adapter - Google's multimodal model with Quantization Aware Training (1B/4B/12B/27B)
// Memory efficient: QAT preserves bfloat16 quality while using 3x less memory
class Gemma3Adapter implements ModelAdapter {
  id = 'gemma-3-12b';
  name = 'Gemma 3 12B QAT';
  provider = 'Google/Local';
  capabilities: ModelCapabilities = {
    contextWindow: 128000, // 128K context window for 4B, 12B, 27B variants
    outputTokens: 8192,
    multimodal: true, // Text + image capabilities
    thinkingMode: false,
    reasoningChains: true,
    codeOptimized: true,
    languages: ['python', 'javascript', 'typescript', 'go', 'rust'],
    pricing: { inputPerMToken: 0, outputPerMToken: 0 }
  };
  
  private async fetchFromLocalServer(endpoint: string, body: object): Promise<any> {
    const response = await fetch(`http://localhost:8082/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Gemma 3 QAT local server error: ${response.statusText}`);
    }
    return response.json();
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const startTime = Date.now();
    try {
      const data = await this.fetchFromLocalServer('completion', {
        prompt,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4096
      });

      return {
        text: data.content,
        tokens: { input: data.usage.prompt_tokens, output: data.usage.completion_tokens, total: data.usage.total_tokens },
        cost: 0,
        latency: Date.now() - startTime,
        model: this.id,
        confidence: 0.87,
        metadata: { finishReason: data.stop_reason, modelSize: '12B' }
      };
    } catch (error: any) {
      throw new Error(`Gemma 3 QAT completion failed: ${error?.message || 'Unknown error'}`);
    }
  }

  async *stream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<CompletionChunk> {
     const response = await fetch('http://localhost:8082/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, stream: true, temperature: options.temperature ?? 0.7 })
    });
    if (!response.body) throw new Error("No response body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        yield { delta: JSON.parse(chunk).delta, tokens: 1, done: false };
    }
  }

  async embeddings(text: string): Promise<number[]> {
    const data = await this.fetchFromLocalServer('embeddings', { input: text });
    return data.embedding;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:8082/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const start = Date.now();
    await this.healthCheck();
    return Date.now() - start;
  }

  getCost(tokens: number): number { return 0; }
}

// 4. Mistral Devstral Adapter - Long context SWE agents (24B)
class MistralDevstralAdapter implements ModelAdapter {
  id = 'mistral-devstral-small';
  name = 'Mistral Devstral Small';
  provider = 'Mistral/Local';
  capabilities: ModelCapabilities = {
    contextWindow: 262144, // 256K context
    outputTokens: 8192,
    multimodal: false,
    thinkingMode: false,
    reasoningChains: true,
    codeOptimized: true,
    languages: ['python', 'javascript', 'typescript', 'rust', 'go', 'cpp', 'java', 'swift'],
    pricing: { inputPerMToken: 0, outputPerMToken: 0 }
  };

  private async fetchFromLocalServer(endpoint: string, body: object): Promise<any> {
    const response = await fetch(`http://localhost:8083/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Mistral Devstral local server error: ${response.statusText}`);
    }
    return response.json();
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const startTime = Date.now();
    try {
      const data = await this.fetchFromLocalServer('completion', {
        prompt,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 4096
      });

      return {
        text: data.content,
        tokens: { input: data.usage.prompt_tokens, output: data.usage.completion_tokens, total: data.usage.total_tokens },
        cost: 0,
        latency: Date.now() - startTime,
        model: this.id,
        confidence: 0.91,
        metadata: { finishReason: data.stop_reason, contextWindow: '256K' }
      };
    } catch (error: any) {
      throw new Error(`Mistral Devstral completion failed: ${error?.message || 'Unknown error'}`);
    }
  }

  async *stream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<CompletionChunk> {
    const response = await fetch('http://localhost:8083/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, stream: true, temperature: options.temperature ?? 0.2 })
    });
    if (!response.body) throw new Error("No response body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield { delta: JSON.parse(decoder.decode(value)).delta, tokens: 1, done: false };
    }
  }

  async embeddings(text: string): Promise<number[]> {
    const data = await this.fetchFromLocalServer('embeddings', { input: text });
    return data.embedding;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:8083/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const start = Date.now();
    await this.healthCheck();
    return Date.now() - start;
  }

  getCost(tokens: number): number { return 0; }
}

// 5. Llama 3.3 Adapter - General reasoning for workstations (70B)
class Llama33Adapter implements ModelAdapter {
  id = 'llama-3.3-70b';
  name = 'Llama 3.3 70B';
  provider = 'Meta/Local';
  capabilities: ModelCapabilities = {
    contextWindow: 131072,
    outputTokens: 8192,
    multimodal: false,
    thinkingMode: false,
    reasoningChains: true,
    codeOptimized: true,
    languages: ['python', 'javascript', 'typescript', 'cpp', 'rust', 'go', 'java'],
    pricing: { inputPerMToken: 0, outputPerMToken: 0 }
  };

  private async fetchFromLocalServer(endpoint: string, body: object): Promise<any> {
    const response = await fetch(`http://localhost:8084/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Llama 3.3 local server error: ${response.statusText}`);
    }
    return response.json();
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const startTime = Date.now();
    try {
      const data = await this.fetchFromLocalServer('completion', {
        prompt,
        temperature: options.temperature ?? 0.6,
        max_tokens: options.maxTokens ?? 4096
      });

      return {
        text: data.content,
        tokens: { input: data.usage.prompt_tokens, output: data.usage.completion_tokens, total: data.usage.total_tokens },
        cost: 0,
        latency: Date.now() - startTime,
        model: this.id,
        confidence: 0.93,
        metadata: { finishReason: data.stop_reason, modelSize: '70B' }
      };
    } catch (error: any) {
      throw new Error(`Llama 3.3 completion failed: ${error?.message || 'Unknown error'}`);
    }
  }

  async *stream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<CompletionChunk> {
    const response = await fetch('http://localhost:8084/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, stream: true, temperature: options.temperature ?? 0.6 })
    });
    if (!response.body) throw new Error("No response body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield { delta: JSON.parse(decoder.decode(value)).delta, tokens: 1, done: false };
    }
  }

  async embeddings(text: string): Promise<number[]> {
    const data = await this.fetchFromLocalServer('embeddings', { input: text });
    return data.embedding;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:8084/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const start = Date.now();
    await this.healthCheck();
    return Date.now() - start;
  }

  getCost(tokens: number): number { return 0; }
}

// 6. Starcoder2 Adapter - Polyglot programming (15B)
class Starcoder2Adapter implements ModelAdapter {
  id = 'starcoder2-15b';
  name = 'Starcoder2 15B';
  provider = 'Hugging Face/Local';
  capabilities: ModelCapabilities = {
    contextWindow: 16384,
    outputTokens: 4096,
    multimodal: false,
    thinkingMode: false,
    reasoningChains: false,
    codeOptimized: true,
    languages: ['python', 'javascript', 'typescript', 'rust', 'go', 'cpp', 'java', 'kotlin', 'swift', 'php', 'ruby'],
    pricing: { inputPerMToken: 0, outputPerMToken: 0 }
  };

  private async fetchFromLocalServer(endpoint: string, body: object): Promise<any> {
    const response = await fetch(`http://localhost:8085/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Starcoder2 local server error: ${response.statusText}`);
    }
    return response.json();
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const startTime = Date.now();
    try {
      const data = await this.fetchFromLocalServer('completion', {
        prompt,
        temperature: options.temperature ?? 0.1,
        max_tokens: options.maxTokens ?? 2048
      });

      return {
        text: data.content,
        tokens: { input: data.usage.prompt_tokens, output: data.usage.completion_tokens, total: data.usage.total_tokens },
        cost: 0,
        latency: Date.now() - startTime,
        model: this.id,
        confidence: 0.88,
        metadata: { finishReason: data.stop_reason, specialization: 'polyglot' }
      };
    } catch (error: any) {
      throw new Error(`Starcoder2 completion failed: ${error?.message || 'Unknown error'}`);
    }
  }

  async *stream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<CompletionChunk> {
     const response = await fetch('http://localhost:8085/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, stream: true, temperature: options.temperature ?? 0.1 })
    });
    if (!response.body) throw new Error("No response body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield { delta: JSON.parse(decoder.decode(value)).delta, tokens: 1, done: false };
    }
  }

  async embeddings(text: string): Promise<number[]> {
    const data = await this.fetchFromLocalServer('embeddings', { input: text });
    return data.embedding;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:8085/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const start = Date.now();
    await this.healthCheck();
    return Date.now() - start;
  }

  getCost(tokens: number): number { return 0; }
}

// 7. DeepSeek-Coder V2 Lite Adapter - Efficient MoE architecture (16B)
class DeepSeekCoderV2Adapter implements ModelAdapter {
  id = 'deepseek-coder-v2-lite';
  name = 'DeepSeek-Coder V2 Lite';
  provider = 'DeepSeek/Local';
  capabilities: ModelCapabilities = {
    contextWindow: 163840,
    outputTokens: 8192,
    multimodal: false,
    thinkingMode: false,
    reasoningChains: true,
    codeOptimized: true,
    languages: ['python', 'javascript', 'typescript', 'rust', 'go', 'cpp', 'java'],
    pricing: { inputPerMToken: 0, outputPerMToken: 0 }
  };

  private async fetchFromLocalServer(endpoint: string, body: object): Promise<any> {
    const response = await fetch(`http://localhost:8086/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`DeepSeek-Coder V2 local server error: ${response.statusText}`);
    }
    return response.json();
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const startTime = Date.now();
    try {
      const data = await this.fetchFromLocalServer('completion', {
        prompt,
        temperature: options.temperature ?? 0.1,
        max_tokens: options.maxTokens ?? 4096
      });

      return {
        text: data.content,
        tokens: { input: data.usage.prompt_tokens, output: data.usage.completion_tokens, total: data.usage.total_tokens },
        cost: 0,
        latency: Date.now() - startTime,
        model: this.id,
        confidence: 0.90,
        metadata: { finishReason: data.stop_reason, architecture: 'MoE' }
      };
    } catch (error: any) {
      throw new Error(`DeepSeek-Coder V2 completion failed: ${error?.message || 'Unknown error'}`);
    }
  }

  async *stream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<CompletionChunk> {
    const response = await fetch('http://localhost:8086/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, stream: true, temperature: options.temperature ?? 0.1 })
    });
    if (!response.body) throw new Error("No response body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield { delta: JSON.parse(decoder.decode(value)).delta, tokens: 1, done: false };
    }
  }

  async embeddings(text: string): Promise<number[]> {
    const data = await this.fetchFromLocalServer('embeddings', { input: text });
    return data.embedding;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:8086/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const start = Date.now();
    await this.healthCheck();
    return Date.now() - start;
  }

  getCost(tokens: number): number { return 0; }
}

// CLOUD API ADAPTERS (2 models for complex tasks)

// 8. Kimi K2 Adapter - Cloud agentic workflows
class KimiK2Adapter implements ModelAdapter {
  id = 'kimi-k2';
  name = 'Kimi K2';
  provider = 'Moonshot AI';
  capabilities: ModelCapabilities = {
    contextWindow: 32768,
    outputTokens: 8192,
    multimodal: false,
    thinkingMode: true,
    reasoningChains: true,
    codeOptimized: true,
    languages: ['python', 'javascript', 'typescript', 'rust', 'go'],
    pricing: { inputPerMToken: 0.60, outputPerMToken: 2.50 }
  };

  private async fetchFromLocalServer(endpoint: string, body: object): Promise<any> {
    const response = await fetch(`http://localhost:8080/${endpoint}`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${process.env.KIMI_API_KEY}`,
          'Content-Type': 'application/json'
        },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Kimi K2 local server error: ${response.statusText}`);
    }
    return response.json();
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const startTime = Date.now();
    try {
      const data = await this.fetchFromLocalServer('completion', {
        prompt,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 4096
      });

      return {
        text: data.choices[0].message.content,
        tokens: { input: data.usage.prompt_tokens, output: data.usage.completion_tokens, total: data.usage.total_tokens },
        cost: this.getCost(data.usage.total_tokens),
        latency: Date.now() - startTime,
        model: this.id,
        confidence: 0.94,
        metadata: { finishReason: data.choices[0].finish_reason, provider: 'Moonshot AI' }
      };
    } catch (error: any) {
      throw new Error(`Kimi K2 completion failed: ${error?.message || 'Unknown error'}`);
    }
  }

  async *stream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<CompletionChunk> {
    const response = await fetch('http://localhost:8080/completion', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.KIMI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          temperature: options.temperature ?? 0.3,
          max_tokens: options.maxTokens ?? 4096
        })
    });

    if (!response.body) throw new Error("No response body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        yield { delta: chunk, tokens: 1, done: false };
    }
  }

  async embeddings(text: string): Promise<number[]> {
    const data = await this.fetchFromLocalServer('embeddings', { input: text });
    return data.embedding;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:8080/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const start = Date.now();
    await this.healthCheck();
    return Date.now() - start;
  }

  getCost(tokens: number): number {
    const inputTokens = tokens * 0.6;
    const outputTokens = tokens * 0.4;
    return (inputTokens * this.capabilities.pricing.inputPerMToken / 1000000) +
           (outputTokens * this.capabilities.pricing.outputPerMToken / 1000000);
  }
}

// 9. DeepSeek R1 Adapter - Cloud complex reasoning
class DeepSeekR1Adapter implements ModelAdapter {
  id = 'deepseek-r1';
  name = 'DeepSeek R1';
  provider = 'DeepSeek';
  capabilities: ModelCapabilities = {
    contextWindow: 131072,
    outputTokens: 8192,
    multimodal: false,
    thinkingMode: true,
    reasoningChains: true,
    codeOptimized: true,
    languages: ['python', 'javascript', 'typescript', 'rust', 'go', 'cpp', 'java'],
    pricing: { inputPerMToken: 1.33, outputPerMToken: 2.67 }
  };

  private async fetchFromLocalServer(endpoint: string, body: object): Promise<any> {
    const response = await fetch(`http://localhost:8080/${endpoint}`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`DeepSeek R1 local server error: ${response.statusText}`);
    }
    return response.json();
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const startTime = Date.now();
    try {
      const data = await this.fetchFromLocalServer('completion', {
        prompt,
        temperature: options.temperature ?? 0.1,
        max_tokens: options.maxTokens ?? 4096
      });

      return {
        text: data.choices[0].message.content,
        tokens: { input: data.usage.prompt_tokens, output: data.usage.completion_tokens, total: data.usage.total_tokens },
        cost: this.getCost(data.usage.total_tokens),
        latency: Date.now() - startTime,
        model: this.id,
        confidence: 0.96,
        metadata: { finishReason: data.choices[0].finish_reason, provider: 'DeepSeek' }
      };
    } catch (error: any) {
      throw new Error(`DeepSeek R1 completion failed: ${error?.message || 'Unknown error'}`);
    }
  }

  async *stream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<CompletionChunk> {
    const response = await fetch('http://localhost:8080/completion', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          temperature: options.temperature ?? 0.1,
          max_tokens: options.maxTokens ?? 4096
        })
    });

    if (!response.body) throw new Error("No response body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield { delta: JSON.parse(decoder.decode(value)).delta, tokens: 1, done: false };
    }
  }

  async embeddings(text: string): Promise<number[]> {
    const data = await this.fetchFromLocalServer('embeddings', { input: text });
    return data.embedding;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:8080/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  async getLatency(): Promise<number> {
    const start = Date.now();
    await this.healthCheck();
    return Date.now() - start;
  }

  getCost(tokens: number): number {
    const inputTokens = tokens * 0.6;
    const outputTokens = tokens * 0.4;
    return (inputTokens * this.capabilities.pricing.inputPerMToken / 1000000) +
           (outputTokens * this.capabilities.pricing.outputPerMToken / 1000000);
  }
}

// Model Router and Management
export interface RouteRequest {
  task: 'completion' | 'analysis' | 'refactor' | 'test' | 'security' | 'docs';
  prompt: string;
  context?: {
    codebase?: string;
    language?: string;
    complexity?: 'low' | 'medium' | 'high';
    latencyRequirement?: 'realtime' | 'interactive' | 'batch';
  };
  preferences?: {
    cost?: 'minimize' | 'balanced' | 'performance';
    privacy?: 'local' | 'cloud' | 'flexible';
    quality?: 'fast' | 'balanced' | 'best';
  };
}

export class ModelRouter extends EventEmitter {
  private adapters: Map<string, ModelAdapter> = new Map();
  private metrics: Map<string, { latency: number[]; cost: number[]; success: number }> = new Map();
  
  constructor() {
    super();
    this.initializeAdapters();
  }

  private initializeAdapters() {
    // Register all 2025 model adapters
    const adapters = [
      new OpenAIGPT41Adapter(),
      new OpenAIO3Adapter(),
      new Claude4SonnetAdapter(),
      new Claude4OpusAdapter(),
      new Gemini25ProAdapter(),
      // Local Model Adapters (7 models)
      new Qwen3CoderAdapter(),
      new Phi4MiniAdapter(),
      new Gemma3Adapter(),
      new MistralDevstralAdapter(),
      new Llama33Adapter(),
      new Starcoder2Adapter(),
      new DeepSeekCoderV2Adapter(),
      // Cloud API Adapters (2 models)
      new KimiK2Adapter(),
      new DeepSeekR1Adapter()
    ];

    for (const adapter of adapters) {
      this.adapters.set(adapter.id, adapter);
      this.metrics.set(adapter.id, { latency: [], cost: [], success: 0 });
    }
  }

  async route(request: RouteRequest, options: CompletionOptions = {}): Promise<CompletionResult> {
    const candidateModels = this.rankModels(request);
    
    for (const modelId of candidateModels) {
      try {
        const adapter = this.adapters.get(modelId);
        if (!adapter) continue;

        // Health check
        const isHealthy = await adapter.healthCheck();
        if (!isHealthy) continue;

        // Execute request
        const result = await adapter.complete(request.prompt, options);
        
        // Update metrics
        this.updateMetrics(modelId, result);
        
        // Emit telemetry
        this.emit('completion', {
          modelId,
          success: true,
          latency: result.latency,
          cost: result.cost,
          tokens: result.tokens.total
        });

        return result;
      } catch (error) {
        this.emit('completion', {
          modelId,
          success: false,
          error: (error as Error).message
        });
        
        // Try next model in fallback chain
        continue;
      }
    }

    throw new Error('All model adapters failed');
  }

  private rankModels(request: RouteRequest): string[] {
    const { task, context, preferences } = request;
    const scores: Array<{ id: string; score: number }> = [];

    for (const [id, adapter] of this.adapters) {
      let score = 0;
      
      // Task-specific scoring
      switch (task) {
        case 'completion':
          score += adapter.capabilities.codeOptimized ? 20 : 0;
          break;
        case 'analysis':
          score += adapter.capabilities.contextWindow > 100000 ? 20 : 10;
          break;
        case 'refactor':
          score += adapter.capabilities.reasoningChains ? 25 : 0;
          break;
        case 'security':
          score += adapter.capabilities.thinkingMode ? 20 : 0;
          break;
      }

      // Context-based scoring
      if (context?.complexity === 'high') {
        score += adapter.capabilities.thinkingMode ? 15 : 0;
        score += adapter.capabilities.contextWindow > 500000 ? 10 : 0;
      }

      // Preference-based scoring
      if (preferences?.cost === 'minimize') {
        score += adapter.capabilities.pricing.inputPerMToken < 10 ? 15 : 0;
      }
      
      if (preferences?.quality === 'best') {
        if (id.includes('opus') || id.includes('o3')) score += 20;
      }

      // Performance history scoring
      const metrics = this.metrics.get(id);
      if (metrics && metrics.latency.length > 0) {
        const avgLatency = metrics.latency.reduce((a, b) => a + b, 0) / metrics.latency.length;
        score += avgLatency < 2000 ? 10 : avgLatency < 5000 ? 5 : 0;
      }

      scores.push({ id, score });
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);
    
    return scores.map(s => s.id);
  }

  private updateMetrics(modelId: string, result: CompletionResult) {
    const metrics = this.metrics.get(modelId);
    if (!metrics) return;

    metrics.latency.push(result.latency);
    metrics.cost.push(result.cost);
    metrics.success++;

    // Keep only last 100 measurements
    if (metrics.latency.length > 100) {
      metrics.latency.shift();
      metrics.cost.shift();
    }

    this.metrics.set(modelId, metrics);
  }

  getAvailableModels(): ModelAdapter[] {
    return Array.from(this.adapters.values());
  }

  getModelMetrics(modelId: string) {
    return this.metrics.get(modelId);
  }

  async testAllModels(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [id, adapter] of this.adapters) {
      try {
        results[id] = await adapter.healthCheck();
      } catch (error) {
        results[id] = false;
        console.error(`Health check failed for ${adapter.name}:`, (error as Error).message);
      }
    }

    return results;
  }
}

// Export all adapters and main router
export const modelRouter = new ModelRouter();

export {
  // Additional adapters will be added here
  // XAIGrok3Adapter,
  // DeepSeekV3Adapter,  
  // Qwen3Adapter,
  // Llama4ScoutAdapter,
  // etc.
}; 