export interface RetailData {
  sales: SalesData[];
  inventory: InventoryData[];
  customers: CustomerData[];
  transactions: TransactionData[];
  behavior: BehaviorData[];
  products: ProductData[];
  seasonality: SeasonalityData;
  externalFactors: ExternalFactor[];
  promotions: PromotionData[];
  supplierData: SupplierData[];
  constraints: OperationalConstraints;
  competitorData: CompetitorData[];
}

export interface SalesData {
  date: Date;
  productId: string;
  quantity: number;
  revenue: number;
  channel: 'online' | 'store' | 'mobile';
  location?: string;
}

export interface InventoryData {
  productId: string;
  currentStock: number;
  reservedStock: number;
  inTransit: number;
  safetyStock: number;
  reorderPoint: number;
}

export interface CustomerData {
  id: string;
  segment: string;
  lifetime_value: number;
  acquisition_date: Date;
  demographics: CustomerDemographics;
}

export interface CustomerDemographics {
  age: number;
  gender: string;
  location: string;
  income_level: string;
}

export interface RetailAnalysisConfig {
  forecastHorizon: number; // days
  segmentation: SegmentationCriteria;
  pricingObjectives: PricingObjective[];
}

export interface RetailInsights {
  demandForecast: DemandForecast;
  inventoryOptimization: InventoryOptimization;
  priceOptimization: PriceOptimization;
  customerInsights: CustomerInsights;
  recommendations: RetailRecommendation[];
  alerts: RetailAlert[];
}

export interface DemandForecast {
  forecasts: ProductForecast[];
  accuracy: number;
  confidence: number;
  elasticity: PriceElasticity[];
}

export interface ProductForecast {
  productId: string;
  predictedDemand: number[];
  seasonalFactors: number[];
  trendFactors: number[];
}

export interface InventoryOptimization {
  recommendations: InventoryRecommendation[];
  stockouts: StockoutRisk[];
  overstock: OverstockRisk[];
}

export interface PriceOptimization {
  recommendations: PriceRecommendation[];
  elasticity: PriceElasticity[];
  competitivePosition: CompetitivePosition[];
}

export interface CustomerInsights {
  segments: CustomerSegment[];
  churnRisk: ChurnRisk[];
  lifetimeValue: CLVAnalysis[];
  behaviorPatterns: BehaviorPattern[];
}

// Supporting types
export interface TransactionData {
  id: string;
  customerId: string;
  items: TransactionItem[];
  total: number;
  timestamp: Date;
  channel: string;
}

export interface TransactionItem {
  productId: string;
  quantity: number;
  price: number;
  discount?: number;
}

export interface BehaviorData {
  customerId: string;
  pageViews: PageView[];
  searchQueries: string[];
  cartAbandonment: boolean;
  returnHistory: Return[];
}

export interface PageView {
  page: string;
  duration: number;
  timestamp: Date;
}

export interface Return {
  transactionId: string;
  reason: string;
  timestamp: Date;
}

export interface ProductData {
  id: string;
  name: string;
  category: string;
  cost: number;
  price: number;
  margin: number;
  attributes: Record<string, any>;
}

export interface SeasonalityData {
  patterns: SeasonalPattern[];
  holidays: Holiday[];
  events: Event[];
}

export interface SeasonalPattern {
  period: 'weekly' | 'monthly' | 'yearly';
  pattern: number[];
  strength: number;
}

export interface Holiday {
  name: string;
  date: Date;
  impact: number;
}

export interface Event {
  name: string;
  startDate: Date;
  endDate: Date;
  impact: number;
}

export interface ExternalFactor {
  name: string;
  value: number;
  impact: number;
  correlation: number;
}

export interface PromotionData {
  id: string;
  type: 'discount' | 'bogo' | 'bundle';
  startDate: Date;
  endDate: Date;
  products: string[];
  discount: number;
  effectiveness: number;
}

export interface SupplierData {
  supplierId: string;
  leadTime: number;
  reliability: number;
  cost: number;
  capacity: number;
}

export interface OperationalConstraints {
  storageCapacity: number;
  budgetConstraints: number;
  staffingLimits: number;
  shelfSpace: Record<string, number>;
}

export interface CompetitorData {
  competitor: string;
  products: CompetitorProduct[];
  marketShare: number;
}

export interface CompetitorProduct {
  productId: string;
  price: number;
  availability: boolean;
  promotion?: string;
}

export interface SegmentationCriteria {
  demographic: boolean;
  behavioral: boolean;
  transactional: boolean;
  geographic: boolean;
}

export interface PricingObjective {
  type: 'profit_maximization' | 'market_share' | 'inventory_clearance';
  weight: number;
}

export interface PriceElasticity {
  productId: string;
  elasticity: number;
  confidence: number;
}

export interface InventoryRecommendation {
  productId: string;
  action: 'reorder' | 'reduce' | 'discontinue';
  quantity: number;
  reasoning: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface StockoutRisk {
  productId: string;
  probability: number;
  daysUntilStockout: number;
  revenueImpact: number;
}

export interface OverstockRisk {
  productId: string;
  excessQuantity: number;
  carryingCost: number;
  recommendedAction: string;
}

export interface PriceRecommendation {
  productId: string;
  currentPrice: number;
  recommendedPrice: number;
  expectedImpact: PriceImpact;
  reasoning: string;
}

export interface PriceImpact {
  demandChange: number;
  revenueChange: number;
  profitChange: number;
}

export interface CompetitivePosition {
  productId: string;
  position: 'premium' | 'competitive' | 'discount';
  priceGap: number;
  recommendation: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  size: number;
  characteristics: Record<string, any>;
  value: number;
  growth: number;
}

export interface ChurnRisk {
  customerId: string;
  probability: number;
  reasons: string[];
  retention_actions: string[];
}

export interface CLVAnalysis {
  segment: string;
  averageCLV: number;
  factors: CLVFactor[];
}

export interface CLVFactor {
  factor: string;
  impact: number;
  actionable: boolean;
}

export interface BehaviorPattern {
  pattern: string;
  frequency: number;
  value: number;
  triggers: string[];
}

export interface RetailRecommendation {
  type: 'inventory' | 'pricing' | 'promotion' | 'customer';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  priority: number;
}

export interface RetailAlert {
  type: 'stockout' | 'overstock' | 'price_gap' | 'churn';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  affectedItems: string[];
  actionRequired: boolean;
}
