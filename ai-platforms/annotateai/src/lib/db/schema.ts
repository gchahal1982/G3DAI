/**
 * Database Schema Definitions for AnnotateAI Platform
 * 
 * This file defines the database schemas for all core entities.
 * In production, these would be used with an ORM like Prisma, Drizzle, or similar.
 */

export interface User {
  id: string;
  email: string;
  password_hash: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  company?: string;
  role: 'admin' | 'manager' | 'annotator' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  
  // Authentication
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLoginAt?: Date;
  
  // Subscription & Billing
  subscriptionId?: string;
  subscriptionStatus: 'active' | 'cancelled' | 'past_due' | 'incomplete' | 'trialing';
  subscriptionPlan: 'free' | 'starter' | 'pro' | 'enterprise';
  subscriptionPeriodStart?: Date;
  subscriptionPeriodEnd?: Date;
  
  // Usage Tracking
  usageQuota: {
    annotations: number;
    storage: number; // in MB
    apiCalls: number;
    users: number; // team members
  };
  usageCurrent: {
    annotations: number;
    storage: number;
    apiCalls: number;
    users: number;
  };
  
  // Preferences
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
      projectUpdates: boolean;
      annotationAlerts: boolean;
    };
    shortcuts: Record<string, string>;
  };
  
  // Security
  permissions: string[];
  mfaEnabled: boolean;
  mfaSecret?: string;
  mfaBackupCodes?: string[];
  sessionTokens: string[];
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastActivityAt?: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  
  // Billing
  stripeCustomerId?: string;
  billingEmail?: string;
  taxId?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
  };
  
  // Settings
  settings: {
    allowPublicProjects: boolean;
    requireEmailVerification: boolean;
    enforceStrongPasswords: boolean;
    sessionTimeout: number; // in minutes
    maxFileSize: number; // in MB
    allowedFileTypes: string[];
    defaultProjectVisibility: 'private' | 'team' | 'public';
    annotationGuidelines?: string;
  };
  
  // Subscription
  subscriptionId?: string;
  subscriptionPlan: 'free' | 'team' | 'business' | 'enterprise';
  subscriptionStatus: 'active' | 'cancelled' | 'past_due' | 'incomplete';
  usageQuota: {
    projects: number;
    storage: number;
    users: number;
    annotations: number;
  };
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  slug: string;
  
  // Project Configuration
  type: 'image_classification' | 'object_detection' | 'semantic_segmentation' | 'instance_segmentation' | 'keypoint_detection' | 'video_tracking' | 'point_cloud' | 'medical_imaging';
  status: 'active' | 'completed' | 'archived' | 'paused';
  visibility: 'private' | 'team' | 'public';
  
  // Annotation Settings
  annotationConfig: {
    classes: AnnotationClass[];
    annotationTypes: string[];
    qualityControl: {
      requireReview: boolean;
      minAgreement: number; // 0-1
      reviewerCount: number;
    };
    guidelines?: string;
    shortcuts: Record<string, string>;
  };
  
  // Data
  datasetsCount: number;
  totalFiles: number;
  totalSize: number; // in bytes
  annotatedFiles: number;
  reviewedFiles: number;
  
  // AI/ML Integration
  modelConfig?: {
    pretrainedModel?: string;
    customModelUrl?: string;
    inferenceEnabled: boolean;
    activeLearningSampling: boolean;
    autoAnnotationThreshold: number; // 0-1
  };
  
  // Export Settings
  exportFormats: string[]; // ['coco', 'yolo', 'pascal_voc', 'custom']
  lastExportAt?: Date;
  
  // Collaboration
  teamMembers: ProjectMember[];
  
  // Metrics
  metrics: {
    annotationSpeed: number; // annotations per hour
    qualityScore: number; // 0-1
    interAnnotatorAgreement: number; // 0-1
    completionRate: number; // 0-1
  };
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastActivityAt: Date;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'owner' | 'manager' | 'annotator' | 'reviewer' | 'viewer';
  permissions: string[];
  joinedAt: Date;
  lastActivityAt?: Date;
  statistics: {
    annotationsCreated: number;
    annotationsReviewed: number;
    timeSpent: number; // in minutes
    qualityScore: number; // 0-1
  };
}

export interface Dataset {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  type: 'images' | 'videos' | 'point_clouds' | 'medical' | 'custom';
  
  // File Information
  totalFiles: number;
  totalSize: number; // in bytes
  fileFormats: string[];
  
  // Upload Information
  uploadMethod: 'web' | 'api' | 'bulk' | 'sync';
  uploadSource?: string; // S3 bucket, URL, etc.
  uploadStatus: 'pending' | 'processing' | 'completed' | 'failed';
  uploadProgress: number; // 0-100
  
  // Processing
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingLogs?: string[];
  extractedMetadata?: Record<string, any>;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface DataFile {
  id: string;
  datasetId: string;
  projectId: string;
  
  // File Information
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number; // in bytes
  filePath: string; // S3 path or local path
  thumbnailPath?: string;
  
  // File Metadata
  metadata: {
    width?: number;
    height?: number;
    duration?: number; // for videos
    fps?: number; // for videos
    colorSpace?: string;
    exif?: Record<string, any>;
    custom?: Record<string, any>;
  };
  
  // Annotation Status
  annotationStatus: 'pending' | 'in_progress' | 'completed' | 'reviewed' | 'rejected';
  annotationCount: number;
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  
  // Assignment
  assignedTo?: string; // user ID
  assignedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  
  // Quality
  qualityScore?: number; // 0-1
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  
  // AI Predictions
  aiPredictions?: string[]; // annotation IDs
  aiConfidence?: number; // 0-1
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  lastAnnotatedAt?: Date;
}

export interface Annotation {
  id: string;
  fileId: string;
  projectId: string;
  
  // Annotation Data
  type: 'bbox' | 'polygon' | 'keypoint' | 'mask' | 'point' | 'line' | 'classification';
  classId: string;
  className: string;
  
  // Geometric Data (varies by type)
  geometry: {
    // Bounding Box
    bbox?: { x: number; y: number; width: number; height: number };
    
    // Polygon/Polyline
    points?: { x: number; y: number }[];
    
    // Keypoints
    keypoints?: { id: string; x: number; y: number; visible: boolean }[];
    
    // Mask (for semantic/instance segmentation)
    mask?: string; // base64 encoded or path to mask file
    
    // 3D coordinates (for point clouds)
    coordinates3d?: { x: number; y: number; z: number }[];
    
    // Video tracking
    track?: {
      frameStart: number;
      frameEnd: number;
      keyframes: { frame: number; geometry: any }[];
    };
  };
  
  // Attributes
  attributes: Record<string, any>;
  
  // Annotation Metadata
  annotationType: 'manual' | 'ai_generated' | 'ai_assisted';
  confidence?: number; // 0-1 for AI annotations
  
  // Review Information
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  reviewComments?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  
  // Quality Control
  qualityFlags: string[];
  difficultyRating?: number; // 1-5
  timeSpent?: number; // in seconds
  
  // Collaboration
  annotatedBy: string; // user ID
  lockedBy?: string; // for real-time collaboration
  lockedAt?: Date;
  
  // Version Control
  version: number;
  parentAnnotationId?: string; // for annotation history
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnotationClass {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  color: string; // hex color
  category?: string;
  
  // Class Configuration
  annotationType: string[]; // which annotation types this class supports
  attributes: ClassAttribute[];
  
  // Hierarchy
  parentClassId?: string;
  childClassIds: string[];
  
  // Statistics
  instanceCount: number;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ClassAttribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multi_select' | 'color';
  required: boolean;
  defaultValue?: any;
  options?: string[]; // for select types
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface AnnotationSession {
  id: string;
  userId: string;
  projectId: string;
  fileIds: string[];
  
  // Session Information
  status: 'active' | 'paused' | 'completed' | 'aborted';
  startedAt: Date;
  endedAt?: Date;
  duration?: number; // in seconds
  
  // Progress
  totalFiles: number;
  completedFiles: number;
  annotationsCreated: number;
  annotationsModified: number;
  
  // Quality Metrics
  averageTimePerFile?: number;
  qualityScore?: number;
  
  // Session Data
  keyboardShortcuts: Record<string, string>;
  toolSettings: Record<string, any>;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportJob {
  id: string;
  projectId: string;
  userId: string;
  
  // Export Configuration
  format: 'coco' | 'yolo' | 'pascal_voc' | 'csv' | 'json' | 'custom';
  filters: {
    classIds?: string[];
    annotationTypes?: string[];
    reviewStatus?: string[];
    dateRange?: { start: Date; end: Date };
    userIds?: string[];
  };
  
  // Export Options
  options: {
    includeImages: boolean;
    includeMetadata: boolean;
    splitRatio?: { train: number; val: number; test: number };
    augmentations?: string[];
  };
  
  // Job Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  
  // Results
  downloadUrl?: string;
  downloadExpires?: Date;
  fileSize?: number;
  fileCount?: number;
  
  // Error Information
  errorMessage?: string;
  errorDetails?: Record<string, any>;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface AIModel {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  type: 'classification' | 'detection' | 'segmentation' | 'keypoint' | 'tracking';
  
  // Model Information
  framework: 'tensorflow' | 'pytorch' | 'onnx' | 'custom';
  modelPath: string;
  configPath?: string;
  weightsPath?: string;
  
  // Performance Metrics
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    mAP?: number; // mean Average Precision
    customMetrics?: Record<string, number>;
  };
  
  // Deployment
  status: 'training' | 'ready' | 'deployed' | 'failed' | 'deprecated';
  version: string;
  deploymentUrl?: string;
  
  // Training Information
  trainingDatasetId?: string;
  trainingConfig?: Record<string, any>;
  trainingLogs?: string[];
  
  // Usage
  inferenceCount: number;
  lastUsedAt?: Date;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Database Indexes (for optimization)
export const DatabaseIndexes = {
  users: [
    'email',
    'organizationId',
    'status',
    'subscriptionStatus',
    'createdAt'
  ],
  projects: [
    'organizationId',
    'status',
    'type',
    'createdBy',
    'lastActivityAt'
  ],
  dataFiles: [
    'datasetId',
    'projectId',
    'annotationStatus',
    'assignedTo',
    'createdAt'
  ],
  annotations: [
    'fileId',
    'projectId',
    'classId',
    'annotatedBy',
    'reviewStatus',
    'createdAt'
  ],
  annotationSessions: [
    'userId',
    'projectId',
    'status',
    'startedAt'
  ]
};

// Database Constraints
export const DatabaseConstraints = {
  users: {
    email: 'UNIQUE',
    organizationId: 'FOREIGN KEY REFERENCES organizations(id)'
  },
  projects: {
    'organizationId, slug': 'UNIQUE',
    organizationId: 'FOREIGN KEY REFERENCES organizations(id)',
    createdBy: 'FOREIGN KEY REFERENCES users(id)'
  },
  annotations: {
    fileId: 'FOREIGN KEY REFERENCES data_files(id)',
    projectId: 'FOREIGN KEY REFERENCES projects(id)',
    annotatedBy: 'FOREIGN KEY REFERENCES users(id)'
  }
}; 