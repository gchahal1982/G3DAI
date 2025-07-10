import { User } from './auth';

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  endedAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  metadata: SubscriptionMetadata;
  items: SubscriptionItem[];
  usage: UsageData;
  billing: BillingInfo;
  createdAt: Date;
  updatedAt: Date;
}

export enum SubscriptionStatus {
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
  PAUSED = 'paused',
}

export interface SubscriptionMetadata {
  organizationId?: string;
  source?: string;
  campaignId?: string;
  salesRepId?: string;
  customFields: Record<string, any>;
}

export interface SubscriptionItem {
  id: string;
  planId: string;
  priceId: string;
  quantity: number;
  usageRecord?: UsageRecord;
  metadata: Record<string, any>;
}

export interface UsageRecord {
  quantity: number;
  timestamp: Date;
  action: UsageAction;
  recordId: string;
}

export enum UsageAction {
  INCREMENT = 'increment',
  SET = 'set',
}

export interface UsageData {
  period: BillingPeriod;
  metrics: UsageMetric[];
  limits: UsageLimit[];
  alerts: UsageAlert[];
  history: UsageHistory[];
}

export interface BillingPeriod {
  start: Date;
  end: Date;
  status: PeriodStatus;
}

export enum PeriodStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  UPCOMING = 'upcoming',
}

export interface UsageMetric {
  name: string;
  value: number;
  unit: string;
  limit?: number;
  percentage: number;
  trend: TrendDirection;
  lastUpdated: Date;
}

export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable',
}

export interface UsageLimit {
  metric: string;
  softLimit: number;
  hardLimit: number;
  unit: string;
  resetPeriod: ResetPeriod;
  overage: OverageConfig;
}

export enum ResetPeriod {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface OverageConfig {
  allowed: boolean;
  price: number;
  unit: string;
  freeUnits?: number;
}

export interface UsageAlert {
  id: string;
  metric: string;
  threshold: number;
  type: AlertType;
  enabled: boolean;
  triggered: boolean;
  lastTriggered?: Date;
  recipients: string[];
}

export enum AlertType {
  WARNING = 'warning',
  CRITICAL = 'critical',
  OVERAGE = 'overage',
}

export interface UsageHistory {
  date: Date;
  metrics: Record<string, number>;
  billingAmount: number;
  details: UsageDetail[];
}

export interface UsageDetail {
  metric: string;
  value: number;
  unit: string;
  cost: number;
  breakdown: UsageBreakdown[];
}

export interface UsageBreakdown {
  category: string;
  value: number;
  cost: number;
  description?: string;
}

export interface BillingInfo {
  currency: string;
  taxRate: number;
  discounts: Discount[];
  nextInvoiceDate: Date;
  paymentMethod: PaymentMethod;
  billingAddress: Address;
  taxExempt: boolean;
  taxIds: TaxId[];
}

export interface Discount {
  id: string;
  type: DiscountType;
  value: number;
  duration: DiscountDuration;
  maxRedemptions?: number;
  redemptions: number;
  validFrom: Date;
  validTo?: Date;
  restrictions: DiscountRestriction[];
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_TRIAL = 'free_trial',
}

export enum DiscountDuration {
  ONCE = 'once',
  REPEATING = 'repeating',
  FOREVER = 'forever',
}

export interface DiscountRestriction {
  type: RestrictionType;
  value: string;
}

export enum RestrictionType {
  PLAN = 'plan',
  CUSTOMER = 'customer',
  COUNTRY = 'country',
  FIRST_TIME_ONLY = 'first_time_only',
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  type: PlanType;
  status: PlanStatus;
  pricing: PlanPricing;
  features: PlanFeature[];
  limits: PlanLimit[];
  trial: TrialConfig;
  metadata: PlanMetadata;
  popular: boolean;
  recommended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum PlanType {
  FREE = 'free',
  PAID = 'paid',
  CUSTOM = 'custom',
  ENTERPRISE = 'enterprise',
}

export enum PlanStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export interface PlanPricing {
  currency: string;
  interval: BillingInterval;
  intervalCount: number;
  amount: number;
  tieredPricing?: TieredPrice[];
  usageBased?: UsageBasedPricing;
  setupFee?: number;
}

export enum BillingInterval {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export interface TieredPrice {
  upTo: number;
  price: number;
  flatFee?: number;
}

export interface UsageBasedPricing {
  metric: string;
  tieredPrices: TieredPrice[];
  transform: UsageTransform;
}

export interface UsageTransform {
  divideBy: number;
  round: 'up' | 'down' | 'nearest';
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  unit?: string;
  category: FeatureCategory;
  priority: number;
}

export enum FeatureCategory {
  CORE = 'core',
  ANNOTATION = 'annotation',
  AI = 'ai',
  COLLABORATION = 'collaboration',
  ANALYTICS = 'analytics',
  SECURITY = 'security',
  SUPPORT = 'support',
  INTEGRATION = 'integration',
}

export interface PlanLimit {
  metric: string;
  value: number;
  unit: string;
  enforced: boolean;
  overage: OverageConfig;
}

export interface TrialConfig {
  enabled: boolean;
  duration: number;
  unit: TrialUnit;
  requirePaymentMethod: boolean;
  autoUpgrade: boolean;
}

export enum TrialUnit {
  DAYS = 'days',
  WEEKS = 'weeks',
  MONTHS = 'months',
}

export interface PlanMetadata {
  targetAudience: string[];
  salesSegment: string;
  competitorComparison: Record<string, any>;
  marketingCampaigns: string[];
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  card?: CardInfo;
  bankAccount?: BankAccountInfo;
  wallet?: WalletInfo;
  isDefault: boolean;
  status: PaymentMethodStatus;
  lastUsed?: Date;
  expiresAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
}

export enum PaymentMethodType {
  CARD = 'card',
  BANK_ACCOUNT = 'bank_account',
  DIGITAL_WALLET = 'digital_wallet',
  CRYPTOCURRENCY = 'cryptocurrency',
}

export interface CardInfo {
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  fingerprint: string;
  country: string;
  funding: CardFunding;
  threeDSecure?: ThreeDSecureStatus;
}

export enum CardBrand {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  AMEX = 'amex',
  DISCOVER = 'discover',
  DINERS = 'diners',
  JCB = 'jcb',
  UNIONPAY = 'unionpay',
  UNKNOWN = 'unknown',
}

export enum CardFunding {
  CREDIT = 'credit',
  DEBIT = 'debit',
  PREPAID = 'prepaid',
  UNKNOWN = 'unknown',
}

export enum ThreeDSecureStatus {
  REQUIRED = 'required',
  RECOMMENDED = 'recommended',
  OPTIONAL = 'optional',
  NOT_SUPPORTED = 'not_supported',
}

export interface BankAccountInfo {
  routingNumber: string;
  last4: string;
  accountType: BankAccountType;
  bankName: string;
  country: string;
  currency: string;
  status: BankAccountStatus;
}

export enum BankAccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
}

export enum BankAccountStatus {
  NEW = 'new',
  VALIDATED = 'validated',
  VERIFIED = 'verified',
  VERIFICATION_FAILED = 'verification_failed',
  ERRORED = 'errored',
}

export interface WalletInfo {
  provider: WalletProvider;
  email?: string;
  country: string;
}

export enum WalletProvider {
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  AMAZON_PAY = 'amazon_pay',
}

export enum PaymentMethodStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REQUIRES_AUTHENTICATION = 'requires_authentication',
  FAILED = 'failed',
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  subscriptionId?: string;
  status: InvoiceStatus;
  description?: string;
  currency: string;
  amount: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  amountRemaining: number;
  lines: InvoiceLine[];
  payments: Payment[];
  discounts: InvoiceDiscount[];
  taxes: InvoiceTax[];
  billing: InvoiceBilling;
  dueDate: Date;
  paidAt?: Date;
  voidedAt?: Date;
  forgiven: boolean;
  attemptCount: number;
  nextPaymentAttempt?: Date;
  webhookDelivered: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  PAID = 'paid',
  VOID = 'void',
  UNCOLLECTIBLE = 'uncollectible',
}

export interface InvoiceLine {
  id: string;
  type: LineItemType;
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
  currency: string;
  period?: Period;
  proration: boolean;
  metadata: Record<string, any>;
}

export enum LineItemType {
  SUBSCRIPTION = 'subscription',
  INVOICE_ITEM = 'invoice_item',
}

export interface Period {
  start: Date;
  end: Date;
}

export interface InvoiceDiscount {
  couponId: string;
  amount: number;
  type: DiscountType;
}

export interface InvoiceTax {
  rate: number;
  amount: number;
  jurisdiction: string;
  type: TaxType;
}

export enum TaxType {
  VAT = 'vat',
  GST = 'gst',
  SALES_TAX = 'sales_tax',
  CUSTOM = 'custom',
}

export interface InvoiceBilling {
  name: string;
  email: string;
  address: Address;
  phone?: string;
  taxId?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  description?: string;
  failureCode?: PaymentFailureCode;
  failureMessage?: string;
  receiptUrl?: string;
  refunded: boolean;
  refunds: Refund[];
  dispute?: Dispute;
  metadata: Record<string, any>;
  processedAt?: Date;
  createdAt: Date;
}

export enum PaymentStatus {
  PENDING = 'pending',
  REQUIRES_ACTION = 'requires_action',
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  REQUIRES_CONFIRMATION = 'requires_confirmation',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  CANCELED = 'canceled',
  FAILED = 'failed',
}

export enum PaymentFailureCode {
  CARD_DECLINED = 'card_declined',
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  INVALID_ACCOUNT = 'invalid_account',
  PAYMENT_METHOD_UNACTIVATED = 'payment_method_unactivated',
  PROCESSING_ERROR = 'processing_error',
  AUTHENTICATION_REQUIRED = 'authentication_required',
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  reason: RefundReason;
  description?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export enum RefundStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

export enum RefundReason {
  DUPLICATE = 'duplicate',
  FRAUDULENT = 'fraudulent',
  REQUESTED_BY_CUSTOMER = 'requested_by_customer',
  EXPIRED_UNCAPTURED_CHARGE = 'expired_uncaptured_charge',
}

export interface Dispute {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: DisputeStatus;
  reason: DisputeReason;
  evidence: DisputeEvidence;
  dueBy: Date;
  createdAt: Date;
}

export enum DisputeStatus {
  WARNING_NEEDS_RESPONSE = 'warning_needs_response',
  WARNING_UNDER_REVIEW = 'warning_under_review',
  WARNING_CLOSED = 'warning_closed',
  NEEDS_RESPONSE = 'needs_response',
  UNDER_REVIEW = 'under_review',
  CHARGE_REFUNDED = 'charge_refunded',
  WON = 'won',
  LOST = 'lost',
}

export enum DisputeReason {
  DUPLICATE = 'duplicate',
  FRAUDULENT = 'fraudulent',
  SUBSCRIPTION_CANCELED = 'subscription_canceled',
  PRODUCT_UNACCEPTABLE = 'product_unacceptable',
  PRODUCT_NOT_RECEIVED = 'product_not_received',
  UNRECOGNIZED = 'unrecognized',
  CREDIT_NOT_PROCESSED = 'credit_not_processed',
  GENERAL = 'general',
}

export interface DisputeEvidence {
  accessActivityLog?: string;
  billingAddress?: string;
  cancellationPolicy?: string;
  cancellationPolicyDisclosure?: string;
  cancellationRebuttal?: string;
  customerCommunication?: string;
  customerEmailAddress?: string;
  customerName?: string;
  customerPurchaseIp?: string;
  customerSignature?: string;
  duplicateChargeDocumentation?: string;
  duplicateChargeExplanation?: string;
  duplicateChargeId?: string;
  productDescription?: string;
  receipt?: string;
  refundPolicy?: string;
  refundPolicyDisclosure?: string;
  refundRefusalExplanation?: string;
  serviceDate?: string;
  serviceDocumentation?: string;
  shippingAddress?: string;
  shippingCarrier?: string;
  shippingDate?: string;
  shippingDocumentation?: string;
  shippingTrackingNumber?: string;
  uncategorizedFile?: string;
  uncategorizedText?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface TaxId {
  type: TaxIdType;
  value: string;
  country: string;
  verified: boolean;
}

export enum TaxIdType {
  EU_VAT = 'eu_vat',
  US_EIN = 'us_ein',
  GB_VAT = 'gb_vat',
  AU_ABN = 'au_abn',
  CA_BN = 'ca_bn',
  IN_GST = 'in_gst',
  NO_VAT = 'no_vat',
  UNKNOWN = 'unknown',
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  description?: string;
  phone?: string;
  address?: Address;
  shipping?: Address;
  taxExempt: boolean;
  taxIds: TaxId[];
  defaultSource?: string;
  invoicePrefix?: string;
  preferredLocales: string[];
  currency: string;
  balance: number;
  delinquent: boolean;
  subscriptions: Subscription[];
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingPortalSession {
  id: string;
  customerId: string;
  url: string;
  returnUrl: string;
  configuration: PortalConfiguration;
  expiresAt: Date;
  createdAt: Date;
}

export interface PortalConfiguration {
  businessProfile: BusinessProfile;
  features: PortalFeatures;
  defaultReturnUrl?: string;
}

export interface BusinessProfile {
  icon?: string;
  logo?: string;
  primaryButtonColor?: string;
  secondaryButtonColor?: string;
  headline?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}

export interface PortalFeatures {
  customerUpdate: CustomerUpdateFeature;
  invoiceHistory: InvoiceHistoryFeature;
  paymentMethodUpdate: PaymentMethodUpdateFeature;
  subscriptionCancel: SubscriptionCancelFeature;
  subscriptionPause: SubscriptionPauseFeature;
  subscriptionUpdate: SubscriptionUpdateFeature;
}

export interface CustomerUpdateFeature {
  enabled: boolean;
  allowedUpdates: CustomerUpdateType[];
}

export enum CustomerUpdateType {
  EMAIL = 'email',
  NAME = 'name',
  PHONE = 'phone',
  ADDRESS = 'address',
  SHIPPING = 'shipping',
  TAX_ID = 'tax_id',
}

export interface InvoiceHistoryFeature {
  enabled: boolean;
}

export interface PaymentMethodUpdateFeature {
  enabled: boolean;
}

export interface SubscriptionCancelFeature {
  enabled: boolean;
  mode: CancelMode;
  prorationBehavior: ProrationBehavior;
  cancellationReason: CancellationReasonConfig;
}

export enum CancelMode {
  IMMEDIATELY = 'immediately',
  AT_PERIOD_END = 'at_period_end',
}

export enum ProrationBehavior {
  NONE = 'none',
  CREATE_PRORATIONS = 'create_prorations',
  ALWAYS_INVOICE = 'always_invoice',
}

export interface CancellationReasonConfig {
  enabled: boolean;
  options: string[];
}

export interface SubscriptionPauseFeature {
  enabled: boolean;
}

export interface SubscriptionUpdateFeature {
  enabled: boolean;
  defaultAllowedUpdates: SubscriptionUpdateType[];
  products: ProductUpdateConfig[];
}

export enum SubscriptionUpdateType {
  PRICE = 'price',
  QUANTITY = 'quantity',
  PROMOTION_CODE = 'promotion_code',
}

export interface ProductUpdateConfig {
  productId: string;
  prices: string[];
}

export interface CheckoutSession {
  id: string;
  mode: CheckoutMode;
  successUrl: string;
  cancelUrl: string;
  url: string;
  customerId?: string;
  customerEmail?: string;
  clientReferenceId?: string;
  lineItems: CheckoutLineItem[];
  discounts: CheckoutDiscount[];
  allowPromotionCodes: boolean;
  billingAddressCollection: AddressCollection;
  shippingAddressCollection?: ShippingAddressCollection;
  submitType: SubmitType;
  expiresAt: Date;
  metadata: Record<string, any>;
  createdAt: Date;
}

export enum CheckoutMode {
  PAYMENT = 'payment',
  SETUP = 'setup',
  SUBSCRIPTION = 'subscription',
}

export interface CheckoutLineItem {
  priceId: string;
  quantity: number;
  adjustableQuantity?: boolean;
  dynamicTaxRates?: string[];
}

export interface CheckoutDiscount {
  couponId?: string;
  promotionCodeId?: string;
}

export enum AddressCollection {
  AUTO = 'auto',
  REQUIRED = 'required',
}

export interface ShippingAddressCollection {
  allowedCountries: string[];
}

export enum SubmitType {
  AUTO = 'auto',
  BOOK = 'book',
  DONATE = 'donate',
  PAY = 'pay',
}

export interface BillingDashboard {
  overview: BillingOverview;
  usage: UsageData;
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
  subscription: Subscription;
  upcomingInvoice?: Invoice;
}

export interface BillingOverview {
  currentBalance: number;
  nextInvoiceAmount: number;
  nextInvoiceDate: Date;
  paymentStatus: PaymentStatus;
  subscriptionStatus: SubscriptionStatus;
  daysUntilRenewal: number;
}

export interface PricingCalculator {
  plans: Plan[];
  selectedPlan?: Plan;
  estimatedUsage: EstimatedUsage;
  calculation: PriceCalculation;
}

export interface EstimatedUsage {
  annotations: number;
  storage: number;
  aiInference: number;
  collaborators: number;
  apiCalls: number;
}

export interface PriceCalculation {
  basePrice: number;
  usagePrice: number;
  discountAmount: number;
  taxAmount: number;
  totalPrice: number;
  breakdown: PriceBreakdown[];
}

export interface PriceBreakdown {
  item: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description: string;
}