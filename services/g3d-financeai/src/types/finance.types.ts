/**
 * G3D FinanceAI - Financial Analysis TypeScript Definitions
 */

export interface Portfolio {
    id: string;
    name: string;
    totalValue: number;
    assets: Asset[];
    performance: PerformanceMetrics;
    riskProfile: RiskProfile;
    createdAt: Date;
}

export interface Asset {
    id: string;
    symbol: string;
    name: string;
    type: 'stock' | 'bond' | 'crypto' | 'commodity' | 'etf';
    quantity: number;
    currentPrice: number;
    purchasePrice: number;
    marketValue: number;
    gainLoss: number;
    gainLossPercent: number;
}

export interface PerformanceMetrics {
    totalReturn: number;
    annualizedReturn: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    beta: number;
}

export interface RiskProfile {
    riskScore: number;
    riskLevel: 'conservative' | 'moderate' | 'aggressive';
    diversificationScore: number;
    concentrationRisk: number;
}

export interface MarketData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap: number;
    timestamp: Date;
}

export interface TradingSignal {
    id: string;
    symbol: string;
    type: 'buy' | 'sell' | 'hold';
    confidence: number;
    targetPrice: number;
    stopLoss: number;
    reasoning: string;
    createdAt: Date;
}

export interface FinancialAnalysis {
    id: string;
    type: 'fundamental' | 'technical' | 'sentiment';
    symbol: string;
    score: number;
    insights: string[];
    recommendations: string[];
    timestamp: Date;
}