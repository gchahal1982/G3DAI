export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  meta?: ResponseMeta;
}

export interface ResponseMeta {
  pagination?: Pagination;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  requestId?: string;
  timestamp?: string;
  version?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
  statusCode?: number;
  timestamp?: string;
  requestId?: string;
  stack?: string;
}

export interface ListRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  filter?: Record<string, any>;
  sort?: SortOption[];
  cursor?: string;
  include?: string[];
  exclude?: string[];
}

export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
}

export interface CreateRequest<T> {
  data: T;
  options?: RequestOptions;
}

export interface UpdateRequest<T> {
  id: string;
  data: Partial<T>;
  options?: RequestOptions;
}

export interface DeleteRequest {
  id: string;
  options?: RequestOptions;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  validateBeforeSend?: boolean;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export interface BulkOperation<T> {
  operation: BulkOperationType;
  data: T[];
  options?: BulkOptions;
}

export enum BulkOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  UPSERT = 'upsert',
}

export interface BulkOptions {
  batchSize?: number;
  continueOnError?: boolean;
  validateBeforeSend?: boolean;
  timeout?: number;
}

export interface BulkResult<T> {
  success: T[];
  failed: BulkError[];
  total: number;
  successCount: number;
  failedCount: number;
}

export interface BulkError {
  index: number;
  error: ApiError;
  data?: any;
}

export interface FileUploadRequest {
  files: File[];
  metadata?: Record<string, any>;
  options?: UploadOptions;
}

export interface UploadOptions {
  chunkSize?: number;
  maxConcurrent?: number;
  generateThumbnails?: boolean;
  extractMetadata?: boolean;
  validateFileType?: boolean;
  onProgress?: (progress: UploadProgress) => void;
  onFileComplete?: (file: UploadedFile) => void;
}

export interface UploadProgress {
  fileIndex: number;
  fileName: string;
  progress: number;
  bytesUploaded: number;
  totalBytes: number;
  speed: number;
  eta: number;
  status: UploadStatus;
}

export enum UploadStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface UploadedFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  metadata: FileMetadata;
  checksum: string;
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  fps?: number;
  bitRate?: number;
  colorSpace?: string;
  format: string;
  exifData?: Record<string, any>;
}

export interface SearchRequest {
  query: string;
  filters?: SearchFilter[];
  sort?: SortOption[];
  facets?: string[];
  highlight?: boolean;
  page?: number;
  pageSize?: number;
  options?: SearchOptions;
}

export interface SearchFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  logic?: LogicOperator;
}

export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  IN = 'in',
  NOT_IN = 'nin',
  CONTAINS = 'contains',
  STARTS_WITH = 'startswith',
  ENDS_WITH = 'endswith',
  REGEX = 'regex',
  IS_NULL = 'isnull',
  IS_NOT_NULL = 'isnotnull',
}

export enum LogicOperator {
  AND = 'and',
  OR = 'or',
  NOT = 'not',
}

export interface SearchOptions {
  fuzzy?: boolean;
  boost?: Record<string, number>;
  timeout?: number;
  trackScores?: boolean;
  trackTotalHits?: boolean;
}

export interface SearchResponse<T> {
  results: SearchResult<T>[];
  total: number;
  maxScore?: number;
  facets?: SearchFacet[];
  suggestions?: SearchSuggestion[];
  took: number;
  timedOut: boolean;
}

export interface SearchResult<T> {
  item: T;
  score?: number;
  highlights?: Record<string, string[]>;
  explanation?: string;
}

export interface SearchFacet {
  field: string;
  buckets: FacetBucket[];
}

export interface FacetBucket {
  key: string;
  count: number;
  selected?: boolean;
}

export interface SearchSuggestion {
  text: string;
  highlighted: string;
  score: number;
}

export interface WebSocketMessage<T = any> {
  id: string;
  type: WebSocketMessageType;
  channel?: string;
  data: T;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

export enum WebSocketMessageType {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  MESSAGE = 'message',
  NOTIFICATION = 'notification',
  PRESENCE_UPDATE = 'presence_update',
  TYPING = 'typing',
  ERROR = 'error',
  HEARTBEAT = 'heartbeat',
}

export interface WebSocketSubscription {
  channel: string;
  filters?: Record<string, any>;
  callback: (message: WebSocketMessage) => void;
}

export interface NotificationRequest {
  recipients: string[];
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  scheduledAt?: Date;
  expiresAt?: Date;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system',
  REMINDER = 'reminder',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBHOOK = 'webhook',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface InvitationRequest {
  emails: string[];
  role: string;
  message?: string;
  expiresIn?: number;
  permissions?: string[];
  customData?: Record<string, any>;
}

export interface InvitationResponse {
  invitations: Invitation[];
  successful: string[];
  failed: InvitationError[];
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: Date;
  invitedBy: string;
  status: InvitationStatus;
  createdAt: Date;
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export interface InvitationError {
  email: string;
  error: string;
  code: string;
}

export interface AuditLogRequest {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: string;
  resource?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  outcome: AuditOutcome;
}

export enum AuditOutcome {
  SUCCESS = 'success',
  FAILURE = 'failure',
  ERROR = 'error',
}

export interface ExportRequest {
  format: string;
  filters?: Record<string, any>;
  options?: ExportOptions;
  includedFields?: string[];
  excludedFields?: string[];
}

export interface ExportOptions {
  compression?: string;
  filename?: string;
  splitFiles?: boolean;
  maxFileSize?: number;
  includeMetadata?: boolean;
  customTransform?: string;
}

export interface ExportResponse {
  id: string;
  status: ExportStatus;
  progress: number;
  url?: string;
  filename?: string;
  size?: number;
  recordCount?: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

export interface ImportRequest {
  source: ImportSource;
  format: string;
  options?: ImportOptions;
  mappings?: FieldMapping[];
  validation?: ValidationRule[];
}

export interface ImportSource {
  type: ImportSourceType;
  url?: string;
  data?: any;
  fileId?: string;
}

export enum ImportSourceType {
  FILE = 'file',
  URL = 'url',
  DATABASE = 'database',
  API = 'api',
  CLIPBOARD = 'clipboard',
}

export interface ImportOptions {
  skipHeaders?: boolean;
  delimiter?: string;
  encoding?: string;
  batchSize?: number;
  continueOnError?: boolean;
  updateExisting?: boolean;
  createMissing?: boolean;
}

export interface FieldMapping {
  source: string;
  target: string;
  transform?: string;
  required?: boolean;
  defaultValue?: any;
}

export interface ValidationRule {
  field: string;
  type: ValidationType;
  parameters?: Record<string, any>;
  message?: string;
}

export enum ValidationType {
  REQUIRED = 'required',
  TYPE = 'type',
  FORMAT = 'format',
  RANGE = 'range',
  UNIQUE = 'unique',
  CUSTOM = 'custom',
}

export interface ImportResponse {
  id: string;
  status: ImportStatus;
  progress: number;
  processed: number;
  successful: number;
  failed: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  startedAt: Date;
  completedAt?: Date;
}

export enum ImportStatus {
  PENDING = 'pending',
  VALIDATING = 'validating',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface ImportError {
  row: number;
  field?: string;
  value?: any;
  error: string;
  code: string;
}

export interface ImportWarning {
  row: number;
  field?: string;
  value?: any;
  warning: string;
  code: string;
}

export interface HealthCheckResponse {
  status: HealthStatus;
  version: string;
  timestamp: string;
  uptime: number;
  services: ServiceHealth[];
  metrics: HealthMetrics;
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  responseTime?: number;
  error?: string;
  lastCheck: string;
}

export interface HealthMetrics {
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  activeConnections: number;
  requestsPerSecond: number;
  errorRate: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

export interface ApiConfiguration {
  baseUrl: string;
  version: string;
  timeout: number;
  retries: number;
  rateLimit: RateLimitConfig;
  authentication: AuthConfig;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface AuthConfig {
  type: 'bearer' | 'api-key' | 'basic' | 'oauth';
  tokenHeader?: string;
  refreshThreshold?: number;
  autoRefresh?: boolean;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface RequestConfig {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  retries?: number;
  validateStatus?: (status: number) => boolean;
}

export interface ResponseInterceptor {
  onFulfilled?: (response: any) => any;
  onRejected?: (error: any) => any;
}

export interface RequestInterceptor {
  onFulfilled?: (config: RequestConfig) => RequestConfig;
  onRejected?: (error: any) => any;
}