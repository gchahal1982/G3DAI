import { User, AnnotationTool } from './auth';

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  settings: ProjectSettings;
  metadata: ProjectMetadata;
  statistics: ProjectStatistics;
  deadline?: Date;
  createdBy: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
  datasets: Dataset[];
  collaborators: ProjectCollaborator[];
  annotations: Annotation[];
  aiModels: AIModel[];
  exports: ProjectExport[];
}

export enum ProjectType {
  IMAGE_CLASSIFICATION = 'image_classification',
  OBJECT_DETECTION = 'object_detection',
  SEMANTIC_SEGMENTATION = 'semantic_segmentation',
  INSTANCE_SEGMENTATION = 'instance_segmentation',
  KEYPOINT_DETECTION = 'keypoint_detection',
  VIDEO_TRACKING = 'video_tracking',
  POINT_CLOUD = 'point_cloud',
  THREE_D_OBJECT = '3d_object',
  MEDICAL_IMAGING = 'medical_imaging',
  CUSTOM = 'custom',
}

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum ProjectVisibility {
  PRIVATE = 'private',
  ORGANIZATION = 'organization',
  PUBLIC = 'public',
}

export interface ProjectSettings {
  annotationTools: AnnotationTool[];
  qualityControl: QualityControlSettings;
  aiAssistance: AIAssistanceSettings;
  collaboration: CollaborationSettings;
  export: ExportSettings;
  automation: AutomationSettings;
}

export interface QualityControlSettings {
  enabled: boolean;
  requireReview: boolean;
  minimumReviewers: number;
  consensusThreshold: number;
  qualityScoreThreshold: number;
  allowSelfReview: boolean;
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  condition: string;
  action: string;
  assignedTo?: string;
}

export interface AIAssistanceSettings {
  enabled: boolean;
  autoPreAnnotation: boolean;
  suggestionThreshold: number;
  modelIds: string[];
  activeModels: string[];
  confidenceDisplay: boolean;
  autoAcceptHighConfidence: boolean;
}

export interface CollaborationSettings {
  realTimeEditing: boolean;
  conflictResolution: ConflictResolutionStrategy;
  notifications: NotificationSettings;
  permissions: PermissionSettings;
}

export enum ConflictResolutionStrategy {
  LAST_WRITER_WINS = 'last_writer_wins',
  REVIEWER_DECISION = 'reviewer_decision',
  CONSENSUS = 'consensus',
  PRIORITY_BASED = 'priority_based',
}

export interface NotificationSettings {
  onNewAssignment: boolean;
  onReviewRequest: boolean;
  onApproval: boolean;
  onRejection: boolean;
  onCompletion: boolean;
  onDeadlineApproach: boolean;
}

export interface PermissionSettings {
  allowViewers: boolean;
  allowContributors: boolean;
  allowReviewers: boolean;
  allowManagers: boolean;
}

export interface ExportSettings {
  allowedFormats: ExportFormat[];
  defaultFormat: ExportFormat;
  includeMetadata: boolean;
  includeOriginalFiles: boolean;
  compressionLevel: number;
}

export interface AutomationSettings {
  autoAssignment: boolean;
  smartDistribution: boolean;
  deadlineTracking: boolean;
  progressReports: boolean;
  qualityAlerts: boolean;
}

export interface ProjectMetadata {
  tags: string[];
  category: string;
  version: string;
  annotationSchema?: AnnotationSchema;
  customFields: Record<string, any>;
  instructions?: string;
  guidelines?: string;
  examples?: ProjectExample[];
}

export interface ProjectExample {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  annotationUrl?: string;
  type: 'good' | 'bad' | 'reference';
}

export interface AnnotationSchema {
  classes: AnnotationClass[];
  attributes: AnnotationAttribute[];
  relationships?: AnnotationRelationship[];
}

export interface AnnotationClass {
  id: string;
  name: string;
  color: string;
  description?: string;
  parentId?: string;
  children?: AnnotationClass[];
  attributes?: string[];
}

export interface AnnotationAttribute {
  id: string;
  name: string;
  type: AttributeType;
  required: boolean;
  options?: AttributeOption[];
  defaultValue?: any;
  validation?: AttributeValidation;
}

export enum AttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  DATE = 'date',
  COORDINATES = 'coordinates',
}

export interface AttributeOption {
  value: string;
  label: string;
  color?: string;
}

export interface AttributeValidation {
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
}

export interface AnnotationRelationship {
  id: string;
  name: string;
  fromClass: string;
  toClass: string;
  type: RelationshipType;
}

export enum RelationshipType {
  ONE_TO_ONE = 'one_to_one',
  ONE_TO_MANY = 'one_to_many',
  MANY_TO_MANY = 'many_to_many',
}

export interface ProjectStatistics {
  totalFiles: number;
  annotatedFiles: number;
  reviewedFiles: number;
  approvedFiles: number;
  rejectedFiles: number;
  pendingFiles: number;
  totalAnnotations: number;
  averageAnnotationsPerFile: number;
  qualityScore: number;
  progressPercentage: number;
  estimatedCompletion?: Date;
  timeSpent: number; // in minutes
  collaboratorsActive: number;
  lastActivity: Date;
}

export interface ProjectCollaborator {
  id: string;
  userId: string;
  projectId: string;
  role: ProjectRole;
  permissions: ProjectPermission[];
  assignedFiles: number;
  completedFiles: number;
  qualityScore: number;
  joinedAt: Date;
  lastActiveAt: Date;
  user: User;
}

export enum ProjectRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  REVIEWER = 'reviewer',
  ANNOTATOR = 'annotator',
  VIEWER = 'viewer',
}

export enum ProjectPermission {
  VIEW = 'view',
  ANNOTATE = 'annotate',
  REVIEW = 'review',
  APPROVE = 'approve',
  EXPORT = 'export',
  MANAGE_COLLABORATORS = 'manage_collaborators',
  EDIT_SETTINGS = 'edit_settings',
  DELETE = 'delete',
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  type: DatasetType;
  format: DatasetFormat;
  status: DatasetStatus;
  metadata: DatasetMetadata;
  statistics: DatasetStatistics;
  files: DatasetFile[];
  createdAt: Date;
  updatedAt: Date;
}

export enum DatasetType {
  IMAGES = 'images',
  VIDEOS = 'videos',
  POINT_CLOUDS = 'point_clouds',
  DICOM = 'dicom',
  THREE_D_MODELS = '3d_models',
  MIXED = 'mixed',
}

export enum DatasetFormat {
  COCO = 'coco',
  PASCAL_VOC = 'pascal_voc',
  YOLO = 'yolo',
  CITYSCAPES = 'cityscapes',
  IMAGENET = 'imagenet',
  CUSTOM = 'custom',
}

export enum DatasetStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error',
}

export interface DatasetMetadata {
  totalSize: number;
  fileCount: number;
  averageFileSize: number;
  resolution?: ImageResolution;
  duration?: number; // for videos
  fps?: number; // for videos
  colorSpace?: string;
  compressionFormat?: string;
  customProperties: Record<string, any>;
}

export interface ImageResolution {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface DatasetStatistics {
  annotationProgress: number;
  qualityMetrics: QualityMetrics;
  distributionStats: DistributionStats;
  performanceMetrics: PerformanceMetrics;
}

export interface QualityMetrics {
  averageScore: number;
  scoreDistribution: Record<string, number>;
  interAnnotatorAgreement: number;
  flaggedAnnotations: number;
}

export interface DistributionStats {
  classDistribution: Record<string, number>;
  annotatorDistribution: Record<string, number>;
  timeDistribution: Record<string, number>;
}

export interface PerformanceMetrics {
  averageAnnotationTime: number;
  averageReviewTime: number;
  throughputPerDay: number;
  accuracyTrend: number[];
}

export interface DatasetFile {
  id: string;
  name: string;
  originalName: string;
  path: string;
  url: string;
  thumbnailUrl?: string;
  type: FileType;
  size: number;
  metadata: FileMetadata;
  status: FileStatus;
  uploadedBy: string;
  uploadedAt: Date;
  annotations: Annotation[];
}

export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  POINT_CLOUD = 'point_cloud',
  THREE_D_MODEL = '3d_model',
  DICOM = 'dicom',
  DOCUMENT = 'document',
}

export enum FileStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  READY = 'ready',
  ANNOTATED = 'annotated',
  REVIEWED = 'reviewed',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ERROR = 'error',
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  fps?: number;
  colorSpace?: string;
  channels?: number;
  bitDepth?: number;
  compressionFormat?: string;
  fileFormat: string;
  checksum: string;
  exifData?: Record<string, any>;
  customMetadata: Record<string, any>;
}

export interface Annotation {
  id: string;
  fileId: string;
  projectId: string;
  classId: string;
  className: string;
  type: AnnotationType;
  geometry: AnnotationGeometry;
  attributes: Record<string, any>;
  confidence?: number;
  source: AnnotationSource;
  status: AnnotationStatus;
  quality: AnnotationQuality;
  createdBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  comments: AnnotationComment[];
  history: AnnotationHistory[];
}

export enum AnnotationType {
  BOUNDING_BOX = 'bounding_box',
  POLYGON = 'polygon',
  KEYPOINT = 'keypoint',
  POLYLINE = 'polyline',
  CIRCLE = 'circle',
  ELLIPSE = 'ellipse',
  POINT = 'point',
  MASK = 'mask',
  THREE_D_BOX = '3d_box',
  THREE_D_MESH = '3d_mesh',
}

export interface AnnotationGeometry {
  coordinates: number[] | number[][] | number[][][];
  bbox?: BoundingBox;
  area?: number;
  length?: number;
  center?: Point;
  rotation?: number;
  scale?: Point;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
  z?: number;
}

export enum AnnotationSource {
  MANUAL = 'manual',
  AI_ASSISTED = 'ai_assisted',
  IMPORTED = 'imported',
  AUTO_GENERATED = 'auto_generated',
}

export enum AnnotationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

export interface AnnotationQuality {
  score: number;
  metrics: QualityScore[];
  flags: QualityFlag[];
  reviewerNotes?: string;
}

export interface QualityScore {
  metric: string;
  value: number;
  threshold: number;
  passed: boolean;
}

export interface QualityFlag {
  type: FlagType;
  severity: FlagSeverity;
  description: string;
  autoGenerated: boolean;
}

export enum FlagType {
  ACCURACY = 'accuracy',
  COMPLETENESS = 'completeness',
  CONSISTENCY = 'consistency',
  DUPLICATION = 'duplication',
  BOUNDARY = 'boundary',
  CLASSIFICATION = 'classification',
}

export enum FlagSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface AnnotationComment {
  id: string;
  annotationId: string;
  content: string;
  type: CommentType;
  createdBy: string;
  createdAt: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  replies: AnnotationComment[];
}

export enum CommentType {
  GENERAL = 'general',
  QUESTION = 'question',
  SUGGESTION = 'suggestion',
  ISSUE = 'issue',
  APPROVAL = 'approval',
  REJECTION = 'rejection',
}

export interface AnnotationHistory {
  id: string;
  annotationId: string;
  action: HistoryAction;
  changes: Record<string, any>;
  performedBy: string;
  performedAt: Date;
  reason?: string;
}

export enum HistoryAction {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  SUBMITTED = 'submitted',
  REVIEWED = 'reviewed',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RESTORED = 'restored',
}

export interface AIModel {
  id: string;
  name: string;
  description?: string;
  type: ModelType;
  framework: ModelFramework;
  version: string;
  status: ModelStatus;
  performance: ModelPerformance;
  configuration: ModelConfiguration;
  training: ModelTraining;
  deployment: ModelDeployment;
  usage: ModelUsage;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ModelType {
  CLASSIFICATION = 'classification',
  DETECTION = 'detection',
  SEGMENTATION = 'segmentation',
  TRACKING = 'tracking',
  KEYPOINT = 'keypoint',
  CUSTOM = 'custom',
}

export enum ModelFramework {
  TENSORFLOW = 'tensorflow',
  PYTORCH = 'pytorch',
  ONNX = 'onnx',
  OPENCV = 'opencv',
  CUSTOM = 'custom',
}

export enum ModelStatus {
  TRAINING = 'training',
  READY = 'ready',
  DEPLOYED = 'deployed',
  DEPRECATED = 'deprecated',
  ERROR = 'error',
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mAP?: number;
  iou?: number;
  inferenceTime: number;
  memoryUsage: number;
  benchmarkResults: BenchmarkResult[];
}

export interface BenchmarkResult {
  dataset: string;
  metric: string;
  value: number;
  timestamp: Date;
}

export interface ModelConfiguration {
  classes: string[];
  inputSize: ImageResolution;
  outputSize?: ImageResolution;
  batchSize: number;
  confidence: number;
  nms?: number;
  parameters: Record<string, any>;
  preprocessing: PreprocessingStep[];
  postprocessing: PostprocessingStep[];
}

export interface PreprocessingStep {
  type: string;
  parameters: Record<string, any>;
  order: number;
}

export interface PostprocessingStep {
  type: string;
  parameters: Record<string, any>;
  order: number;
}

export interface ModelTraining {
  datasetId?: string;
  epochs: number;
  batchSize: number;
  learningRate: number;
  optimizer: string;
  lossFunction: string;
  metrics: string[];
  augmentations: DataAugmentation[];
  hyperparameters: Record<string, any>;
  trainingSplit: number;
  validationSplit: number;
  testSplit: number;
  trainingLog: TrainingLog[];
}

export interface DataAugmentation {
  type: string;
  probability: number;
  parameters: Record<string, any>;
}

export interface TrainingLog {
  epoch: number;
  loss: number;
  accuracy: number;
  validationLoss: number;
  validationAccuracy: number;
  timestamp: Date;
}

export interface ModelDeployment {
  endpoint?: string;
  status: DeploymentStatus;
  instances: number;
  autoScaling: boolean;
  resource: ResourceConfiguration;
  environment: string;
  deployedAt?: Date;
  lastUpdatedAt?: Date;
}

export enum DeploymentStatus {
  PENDING = 'pending',
  DEPLOYING = 'deploying',
  RUNNING = 'running',
  STOPPED = 'stopped',
  FAILED = 'failed',
}

export interface ResourceConfiguration {
  cpu: string;
  memory: string;
  gpu?: string;
  storage: string;
  replicas: number;
}

export interface ModelUsage {
  totalInferences: number;
  averageInferenceTime: number;
  errorRate: number;
  lastUsedAt: Date;
  popularClasses: string[];
  usageByProject: Record<string, number>;
  costMetrics: CostMetrics;
}

export interface CostMetrics {
  inferencesCost: number;
  storageCost: number;
  computeCost: number;
  totalCost: number;
  costPerInference: number;
}

export interface ProjectExport {
  id: string;
  projectId: string;
  format: ExportFormat;
  status: ExportStatus;
  progress: number;
  url?: string;
  size?: number;
  configuration: ExportConfiguration;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
}

export enum ExportFormat {
  COCO = 'coco',
  PASCAL_VOC = 'pascal_voc',
  YOLO = 'yolo',
  CSV = 'csv',
  JSON = 'json',
  XML = 'xml',
  TENSORFLOW_RECORD = 'tensorflow_record',
  PYTORCH = 'pytorch',
  HUGGINGFACE = 'huggingface',
  CUSTOM = 'custom',
}

export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

export interface ExportConfiguration {
  includeImages: boolean;
  includeAnnotations: boolean;
  includeMetadata: boolean;
  filterByStatus: AnnotationStatus[];
  filterByClass: string[];
  filterByAnnotator: string[];
  dateRange?: DateRange;
  qualityThreshold?: number;
  compression: string;
  splitRatio?: DataSplit;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DataSplit {
  train: number;
  validation: number;
  test: number;
}