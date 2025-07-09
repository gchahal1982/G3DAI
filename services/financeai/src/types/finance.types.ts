export interface FinancialData {
  securities: Security[];
  portfolio: Portfolio;
  marketData: MarketData;
  newsData: NewsData[];
  socialSentiment: SentimentData;
  transactions: Transaction[];
  constraints: InvestmentConstraints;
  objectives: InvestmentObjectives;
  riskProfile: RiskProfile;
}

export interface Security {
  symbol: string;
  name: string;
  type: 'stock' | 'bond' | 'etf' | 'option' | 'crypto';
  price: number;
  volume: number;
  marketCap?: number;
}

export interface Portfolio {
  id: string;
  totalValue: number;
  holdings: Holding[];
  performance: PerformanceMetrics;
}

export interface Holding {
  symbol: string;
  quantity: number;
  averageCost: number;
  currentValue: number;
  weight: number;
}

export interface MarketData {
  indices: IndexData[];
  sectors: SectorData[];
  volatility: VolatilityData;
}

export interface IndexData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface AnalysisConfig {
  timeframe: 'intraday' | 'daily' | 'weekly' | 'monthly';
  stressScenarios: StressScenario[];
  regulations: string[];
  jurisdiction: string;
}

export interface FinancialInsights {
  marketAnalysis: MarketAnalysis;
  riskAnalysis: RiskAnalysis;
  optimization: PortfolioOptimization;
  compliance: ComplianceCheck;
  alerts: Alert[];
  recommendations: Recommendation[];
}

export interface MarketAnalysis {
  sentiment: number;
  trends: MarketTrend[];
  volatility: number;
  correlations: Correlation[];
}

export interface RiskAnalysis {
  var: number; // Value at Risk
  expectedShortfall: number;
  beta: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface PortfolioOptimization {
  suggestedAllocations: Allocation[];
  expectedReturn: number;
  expectedRisk: number;
  rebalanceActions: RebalanceAction[];
}

export interface ComplianceCheck {
  violations: ComplianceViolation[];
  warnings: ComplianceWarning[];
  score: number;
}

export interface Alert {
  type: 'risk' | 'opportunity' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionRequired: boolean;
}

export interface Recommendation {
  type: 'buy' | 'sell' | 'hold' | 'rebalance';
  symbol?: string;
  rationale: string;
  confidence: number;
  timeframe: string;
}

// Additional supporting types
export interface NewsData {
  headline: string;
  content: string;
  sentiment: number;
  relevance: number;
  timestamp: Date;
}

export interface SentimentData {
  overall: number;
  sources: SentimentSource[];
}

export interface SentimentSource {
  platform: string;
  sentiment: number;
  volume: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  quantity: number;
  price: number;
  timestamp: Date;
}

export interface InvestmentConstraints {
  maxPositionSize: number;
  sectorLimits: Record<string, number>;
  liquidityRequirements: number;
}

export interface InvestmentObjectives {
  targetReturn: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: number;
}

export interface RiskProfile {
  tolerance: 'low' | 'medium' | 'high';
  capacity: number;
  preferences: string[];
}

export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface SectorData {
  name: string;
  performance: number;
  weight: number;
}

export interface VolatilityData {
  current: number;
  historical: number[];
  implied: number;
}

export interface StressScenario {
  name: string;
  parameters: Record<string, number>;
  probability: number;
}

export interface MarketTrend {
  indicator: string;
  direction: 'up' | 'down' | 'sideways';
  strength: number;
  timeframe: string;
}

export interface Correlation {
  asset1: string;
  asset2: string;
  coefficient: number;
}

export interface Allocation {
  symbol: string;
  currentWeight: number;
  targetWeight: number;
  rationale: string;
}

export interface RebalanceAction {
  type: 'buy' | 'sell';
  symbol: string;
  amount: number;
  reason: string;
}

export interface ComplianceViolation {
  rule: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
}

export interface ComplianceWarning {
  rule: string;
  description: string;
  recommendation: string;
}
