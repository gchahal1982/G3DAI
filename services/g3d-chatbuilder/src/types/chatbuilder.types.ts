/**
 * G3D ChatBuilder - Conversational AI TypeScript Definitions
 */

export interface ChatBot {
    id: string;
    name: string;
    description: string;
    status: 'draft' | 'training' | 'deployed' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}

export interface Conversation {
    id: string;
    botId: string;
    messages: Message[];
    status: 'active' | 'completed' | 'escalated';
    createdAt: Date;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface ChatBuilderConfig {
    maxTokens: number;
    temperature: number;
    model: string;
    systemPrompt: string;
}

export interface Intent {
    id: string;
    name: string;
    description: string;
    examples: string[];
    responses: string[];
}

export interface Entity {
    id: string;
    name: string;
    type: 'text' | 'number' | 'date' | 'email';
    values: string[];
}

export interface TrainingData {
    intents: Intent[];
    entities: Entity[];
    conversations: Conversation[];
}

export interface ChatMetrics {
    totalConversations: number;
    averageSessionLength: number;
    userSatisfaction: number;
    responseAccuracy: number;
    escalationRate: number;
}