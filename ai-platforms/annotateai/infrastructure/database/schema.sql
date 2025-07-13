-- AnnotateAI Platform - Production PostgreSQL Database Schema
-- Phase 3 Production AI Deployment - Database Foundation
-- 
-- This schema supports:
-- - Multi-tenant organizations with data isolation
-- - Complete annotation workflow (projects, datasets, files, annotations)
-- - AI model management and inference tracking
-- - Real-time collaboration with version control
-- - Enterprise features (SSO, audit logging, compliance)
-- - Performance optimization with proper indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ORGANIZATIONS & USERS
-- ============================================================================

-- Organizations table (multi-tenant support)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    team_size INTEGER DEFAULT 1,
    subscription_tier VARCHAR(50) DEFAULT 'starter',
    subscription_status VARCHAR(20) DEFAULT 'active',
    subscription_period_start TIMESTAMP,
    subscription_period_end TIMESTAMP,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_subscription_tier CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
    CONSTRAINT valid_subscription_status CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due', 'trialing'))
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar VARCHAR(500),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'annotator',
    status VARCHAR(20) DEFAULT 'active',
    
    -- Authentication
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login_at TIMESTAMP,
    
    -- MFA
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(100),
    mfa_backup_codes TEXT[],
    
    -- Preferences
    preferences JSONB DEFAULT '{}',
    
    -- Usage tracking
    usage_quota JSONB DEFAULT '{}',
    usage_current JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    last_activity_at TIMESTAMP,
    
    CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'manager', 'annotator', 'viewer')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'suspended', 'deleted'))
);

-- User sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- ============================================================================
-- PROJECTS & DATASETS
-- ============================================================================

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    visibility VARCHAR(20) DEFAULT 'private',
    
    -- Configuration
    annotation_config JSONB DEFAULT '{}',
    model_config JSONB DEFAULT '{}',
    export_formats TEXT[] DEFAULT ARRAY['coco', 'yolo'],
    
    -- Statistics
    datasets_count INTEGER DEFAULT 0,
    total_files INTEGER DEFAULT 0,
    total_size BIGINT DEFAULT 0,
    annotated_files INTEGER DEFAULT 0,
    reviewed_files INTEGER DEFAULT 0,
    
    -- Metrics
    metrics JSONB DEFAULT '{}',
    
    -- Collaboration
    team_members JSONB DEFAULT '[]',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    last_activity_at TIMESTAMP,
    
    CONSTRAINT valid_project_type CHECK (type IN ('image_classification', 'object_detection', 'semantic_segmentation', 'instance_segmentation', 'keypoint_detection', 'video_tracking', 'point_cloud', 'medical_imaging')),
    CONSTRAINT valid_project_status CHECK (status IN ('active', 'completed', 'archived', 'paused', 'draft')),
    CONSTRAINT valid_visibility CHECK (visibility IN ('private', 'team', 'organization', 'public')),
    CONSTRAINT unique_project_slug_per_org UNIQUE (organization_id, slug)
);

-- Datasets table
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    
    -- File information
    total_files INTEGER DEFAULT 0,
    total_size BIGINT DEFAULT 0,
    file_formats TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Upload information
    upload_method VARCHAR(20) DEFAULT 'web',
    upload_source VARCHAR(500),
    upload_status VARCHAR(20) DEFAULT 'pending',
    upload_progress INTEGER DEFAULT 0,
    
    -- Processing
    processing_status VARCHAR(20) DEFAULT 'pending',
    processing_logs TEXT[],
    extracted_metadata JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    
    CONSTRAINT valid_dataset_type CHECK (type IN ('images', 'videos', 'point_clouds', 'medical', 'custom')),
    CONSTRAINT valid_upload_method CHECK (upload_method IN ('web', 'api', 'bulk', 'sync')),
    CONSTRAINT valid_upload_status CHECK (upload_status IN ('pending', 'processing', 'completed', 'failed')),
    CONSTRAINT valid_processing_status CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    CONSTRAINT valid_upload_progress CHECK (upload_progress >= 0 AND upload_progress <= 100)
);

-- Data files table
CREATE TABLE data_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- File information
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    thumbnail_path VARCHAR(1000),
    
    -- File metadata
    metadata JSONB DEFAULT '{}',
    
    -- Annotation status
    annotation_status VARCHAR(20) DEFAULT 'pending',
    annotation_count INTEGER DEFAULT 0,
    review_status VARCHAR(20) DEFAULT 'pending',
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    
    -- Quality
    quality_score DECIMAL(3,2),
    difficulty_level VARCHAR(10),
    
    -- AI predictions
    ai_predictions JSONB DEFAULT '[]',
    ai_confidence DECIMAL(3,2),
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_annotated_at TIMESTAMP,
    
    CONSTRAINT valid_annotation_status CHECK (annotation_status IN ('pending', 'in_progress', 'completed', 'reviewed', 'rejected')),
    CONSTRAINT valid_review_status CHECK (review_status IN ('pending', 'approved', 'rejected', 'needs_revision')),
    CONSTRAINT valid_difficulty_level CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    CONSTRAINT valid_quality_score CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 1)),
    CONSTRAINT valid_ai_confidence CHECK (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 1))
);

-- ============================================================================
-- ANNOTATIONS
-- ============================================================================

-- Annotation classes
CREATE TABLE annotation_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL, -- hex color
    category VARCHAR(100),
    
    -- Class configuration
    annotation_types TEXT[] DEFAULT ARRAY[]::TEXT[],
    attributes JSONB DEFAULT '[]',
    
    -- Hierarchy
    parent_class_id UUID REFERENCES annotation_classes(id),
    child_class_ids UUID[] DEFAULT ARRAY[]::UUID[],
    
    -- Statistics
    instance_count INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    
    CONSTRAINT unique_class_name_per_project UNIQUE (project_id, name),
    CONSTRAINT valid_hex_color CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Annotations table
CREATE TABLE annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES data_files(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES annotation_classes(id) ON DELETE CASCADE,
    
    -- Annotation data
    type VARCHAR(50) NOT NULL,
    class_name VARCHAR(255) NOT NULL,
    
    -- Geometric data
    geometry JSONB NOT NULL,
    
    -- Attributes
    attributes JSONB DEFAULT '{}',
    
    -- Annotation metadata
    annotation_type VARCHAR(20) DEFAULT 'manual',
    confidence DECIMAL(3,2),
    
    -- Review information
    review_status VARCHAR(20) DEFAULT 'pending',
    review_comments TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    
    -- Quality control
    quality_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
    difficulty_rating INTEGER,
    time_spent INTEGER, -- in seconds
    
    -- Collaboration
    annotated_by UUID NOT NULL REFERENCES users(id),
    locked_by UUID REFERENCES users(id),
    locked_at TIMESTAMP,
    
    -- Version control
    version INTEGER DEFAULT 1,
    parent_annotation_id UUID REFERENCES annotations(id),
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_annotation_type CHECK (type IN ('bbox', 'polygon', 'keypoint', 'mask', 'point', 'line', 'classification')),
    CONSTRAINT valid_annotation_method CHECK (annotation_type IN ('manual', 'ai_generated', 'ai_assisted')),
    CONSTRAINT valid_review_status CHECK (review_status IN ('pending', 'approved', 'rejected', 'needs_revision')),
    CONSTRAINT valid_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
    CONSTRAINT valid_difficulty_rating CHECK (difficulty_rating IS NULL OR (difficulty_rating >= 1 AND difficulty_rating <= 5))
);

-- Annotation sessions
CREATE TABLE annotation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_ids UUID[] NOT NULL,
    
    -- Session information
    status VARCHAR(20) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    duration INTEGER, -- in seconds
    
    -- Progress
    total_files INTEGER NOT NULL,
    completed_files INTEGER DEFAULT 0,
    annotations_created INTEGER DEFAULT 0,
    annotations_modified INTEGER DEFAULT 0,
    
    -- Quality metrics
    average_time_per_file DECIMAL(10,2),
    quality_score DECIMAL(3,2),
    
    -- Session data
    keyboard_shortcuts JSONB DEFAULT '{}',
    tool_settings JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_session_status CHECK (status IN ('active', 'paused', 'completed', 'aborted')),
    CONSTRAINT valid_session_quality_score CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 1))
);

-- ============================================================================
-- AI MODELS & INFERENCE
-- ============================================================================

-- AI models table
CREATE TABLE ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    
    -- Model information
    framework VARCHAR(50) NOT NULL,
    model_path VARCHAR(1000) NOT NULL,
    config_path VARCHAR(1000),
    weights_path VARCHAR(1000),
    
    -- Performance metrics
    metrics JSONB DEFAULT '{}',
    
    -- Deployment
    status VARCHAR(20) DEFAULT 'training',
    version VARCHAR(50) NOT NULL,
    deployment_url VARCHAR(500),
    
    -- Training information
    training_dataset_id UUID REFERENCES datasets(id),
    training_config JSONB DEFAULT '{}',
    training_logs TEXT[],
    
    -- Usage
    inference_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    
    CONSTRAINT valid_model_type CHECK (type IN ('classification', 'detection', 'segmentation', 'keypoint', 'tracking', 'custom')),
    CONSTRAINT valid_framework CHECK (framework IN ('tensorflow', 'pytorch', 'onnx', 'custom')),
    CONSTRAINT valid_model_status CHECK (status IN ('training', 'ready', 'deployed', 'failed', 'deprecated'))
);

-- Model inference jobs
CREATE TABLE model_inference_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES data_files(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Job information
    status VARCHAR(20) DEFAULT 'pending',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    processing_time INTEGER, -- in milliseconds
    
    -- Input/Output
    input_data JSONB,
    output_data JSONB,
    confidence_threshold DECIMAL(3,2),
    
    -- Results
    predictions_count INTEGER DEFAULT 0,
    error_message TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_inference_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'canceled')),
    CONSTRAINT valid_confidence_threshold CHECK (confidence_threshold IS NULL OR (confidence_threshold >= 0 AND confidence_threshold <= 1))
);

-- ============================================================================
-- COLLABORATION & REAL-TIME
-- ============================================================================

-- Collaboration sessions
CREATE TABLE collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES data_files(id) ON DELETE CASCADE,
    participants UUID[] NOT NULL,
    
    -- Session information
    status VARCHAR(20) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    
    -- Operational Transform data
    operations JSONB DEFAULT '[]',
    version INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_collab_status CHECK (status IN ('active', 'paused', 'ended'))
);

-- Real-time operations (for Operational Transform)
CREATE TABLE real_time_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collaboration_session_id UUID NOT NULL REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Operation data
    operation_type VARCHAR(50) NOT NULL,
    operation_data JSONB NOT NULL,
    vector_clock JSONB NOT NULL,
    sequence_number INTEGER NOT NULL,
    
    -- Transformation
    transformed BOOLEAN DEFAULT FALSE,
    conflicts JSONB DEFAULT '[]',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_operation_type CHECK (operation_type IN ('insert', 'delete', 'update', 'move', 'transform'))
);

-- ============================================================================
-- AUDIT & COMPLIANCE
-- ============================================================================

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Event information
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    event_description TEXT NOT NULL,
    
    -- Context
    resource_type VARCHAR(50),
    resource_id UUID,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Request data
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(255),
    
    -- Event data
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_event_category CHECK (event_category IN ('auth', 'project', 'annotation', 'model', 'collaboration', 'admin', 'system'))
);

-- Compliance reports
CREATE TABLE compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Report information
    report_type VARCHAR(50) NOT NULL,
    report_period_start TIMESTAMP NOT NULL,
    report_period_end TIMESTAMP NOT NULL,
    
    -- Report data
    report_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    
    CONSTRAINT valid_report_type CHECK (report_type IN ('gdpr', 'hipaa', 'soc2', 'iso27001', 'custom')),
    CONSTRAINT valid_report_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- ============================================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- ============================================================================

-- Organizations indexes
CREATE INDEX idx_organizations_subscription_tier ON organizations(subscription_tier);
CREATE INDEX idx_organizations_created_at ON organizations(created_at);

-- Users indexes
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_last_activity ON users(last_activity_at);

-- User sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Projects indexes
CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_last_activity ON projects(last_activity_at);

-- Datasets indexes
CREATE INDEX idx_datasets_project_id ON datasets(project_id);
CREATE INDEX idx_datasets_created_by ON datasets(created_by);
CREATE INDEX idx_datasets_type ON datasets(type);
CREATE INDEX idx_datasets_processing_status ON datasets(processing_status);

-- Data files indexes
CREATE INDEX idx_data_files_dataset_id ON data_files(dataset_id);
CREATE INDEX idx_data_files_project_id ON data_files(project_id);
CREATE INDEX idx_data_files_annotation_status ON data_files(annotation_status);
CREATE INDEX idx_data_files_assigned_to ON data_files(assigned_to);
CREATE INDEX idx_data_files_file_type ON data_files(file_type);

-- Annotation classes indexes
CREATE INDEX idx_annotation_classes_project_id ON annotation_classes(project_id);
CREATE INDEX idx_annotation_classes_name ON annotation_classes(name);

-- Annotations indexes
CREATE INDEX idx_annotations_file_id ON annotations(file_id);
CREATE INDEX idx_annotations_project_id ON annotations(project_id);
CREATE INDEX idx_annotations_class_id ON annotations(class_id);
CREATE INDEX idx_annotations_annotated_by ON annotations(annotated_by);
CREATE INDEX idx_annotations_type ON annotations(type);
CREATE INDEX idx_annotations_review_status ON annotations(review_status);
CREATE INDEX idx_annotations_created_at ON annotations(created_at);

-- Annotation sessions indexes
CREATE INDEX idx_annotation_sessions_user_id ON annotation_sessions(user_id);
CREATE INDEX idx_annotation_sessions_project_id ON annotation_sessions(project_id);
CREATE INDEX idx_annotation_sessions_status ON annotation_sessions(status);

-- AI models indexes
CREATE INDEX idx_ai_models_project_id ON ai_models(project_id);
CREATE INDEX idx_ai_models_type ON ai_models(type);
CREATE INDEX idx_ai_models_status ON ai_models(status);
CREATE INDEX idx_ai_models_created_by ON ai_models(created_by);

-- Model inference jobs indexes
CREATE INDEX idx_model_inference_jobs_model_id ON model_inference_jobs(model_id);
CREATE INDEX idx_model_inference_jobs_file_id ON model_inference_jobs(file_id);
CREATE INDEX idx_model_inference_jobs_project_id ON model_inference_jobs(project_id);
CREATE INDEX idx_model_inference_jobs_user_id ON model_inference_jobs(user_id);
CREATE INDEX idx_model_inference_jobs_status ON model_inference_jobs(status);

-- Collaboration sessions indexes
CREATE INDEX idx_collaboration_sessions_project_id ON collaboration_sessions(project_id);
CREATE INDEX idx_collaboration_sessions_file_id ON collaboration_sessions(file_id);
CREATE INDEX idx_collaboration_sessions_status ON collaboration_sessions(status);

-- Real-time operations indexes
CREATE INDEX idx_real_time_operations_session_id ON real_time_operations(collaboration_session_id);
CREATE INDEX idx_real_time_operations_user_id ON real_time_operations(user_id);
CREATE INDEX idx_real_time_operations_sequence ON real_time_operations(sequence_number);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_project_id ON audit_logs(project_id);

-- Compliance reports indexes
CREATE INDEX idx_compliance_reports_organization_id ON compliance_reports(organization_id);
CREATE INDEX idx_compliance_reports_type ON compliance_reports(report_type);
CREATE INDEX idx_compliance_reports_status ON compliance_reports(status);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON datasets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_files_updated_at BEFORE UPDATE ON data_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_annotation_classes_updated_at BEFORE UPDATE ON annotation_classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_annotations_updated_at BEFORE UPDATE ON annotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_annotation_sessions_updated_at BEFORE UPDATE ON annotation_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_models_updated_at BEFORE UPDATE ON ai_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_model_inference_jobs_updated_at BEFORE UPDATE ON model_inference_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collaboration_sessions_updated_at BEFORE UPDATE ON collaboration_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_reports_updated_at BEFORE UPDATE ON compliance_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECURITY & ACCESS CONTROL
-- ============================================================================

-- Row Level Security (RLS) policies will be added here
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for multi-tenant data isolation
CREATE POLICY organization_isolation_policy ON users
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY project_organization_policy ON projects
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id')::UUID);

-- ============================================================================
-- INITIAL DATA SEEDING
-- ============================================================================

-- Insert default organization for development
INSERT INTO organizations (id, name, slug, subscription_tier) 
VALUES ('00000000-0000-0000-0000-000000000001', 'AnnotateAI Demo', 'annotateai-demo', 'enterprise')
ON CONFLICT (id) DO NOTHING;

-- Insert default admin user
INSERT INTO users (
    id, email, password_hash, first_name, last_name, 
    organization_id, role, status, is_email_verified
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@annotateai.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewJJzQNJ3VVzIJzW', -- password: admin123
    'AnnotateAI',
    'Admin',
    '00000000-0000-0000-0000-000000000001',
    'owner',
    'active',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE organizations IS 'Multi-tenant organizations with subscription management';
COMMENT ON TABLE users IS 'Platform users with authentication and authorization';
COMMENT ON TABLE projects IS 'Annotation projects with configuration and team management';
COMMENT ON TABLE datasets IS 'File collections within projects';
COMMENT ON TABLE data_files IS 'Individual files with metadata and annotation status';
COMMENT ON TABLE annotations IS 'Annotation instances with geometry and metadata';
COMMENT ON TABLE ai_models IS 'AI/ML models for automated annotation and inference';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for compliance and security';
COMMENT ON TABLE collaboration_sessions IS 'Real-time collaboration sessions with operational transform'; 