-- AnnotateAI Database Initialization Script
-- This script sets up the initial database schema for the AnnotateAI platform

-- Create MLflow database
CREATE DATABASE mlflow;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS annotation;
CREATE SCHEMA IF NOT EXISTS ai_models;
CREATE SCHEMA IF NOT EXISTS training;
CREATE SCHEMA IF NOT EXISTS data_pipeline;
CREATE SCHEMA IF NOT EXISTS xr;
CREATE SCHEMA IF NOT EXISTS monitoring;

-- Users and authentication
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    organization VARCHAR(100),
    role VARCHAR(50),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects and datasets
CREATE TABLE IF NOT EXISTS annotation.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS annotation.datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES annotation.projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    data_type VARCHAR(50) NOT NULL, -- 'image', 'video', '3d', 'audio', 'text'
    storage_path VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Annotations
CREATE TABLE IF NOT EXISTS annotation.annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES annotation.datasets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    data_item_id VARCHAR(200) NOT NULL,
    annotation_type VARCHAR(50) NOT NULL, -- 'bbox', 'polygon', 'mask', 'keypoints', 'text'
    annotation_data JSONB NOT NULL,
    confidence FLOAT DEFAULT 1.0,
    is_validated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Models
CREATE TABLE IF NOT EXISTS ai_models.models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    model_type VARCHAR(50) NOT NULL, -- 'classification', 'detection', 'segmentation', 'generation'
    framework VARCHAR(50) NOT NULL, -- 'pytorch', 'tensorflow', 'onnx'
    version VARCHAR(50) NOT NULL,
    storage_path VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_models.model_deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES ai_models.models(id) ON DELETE CASCADE,
    deployment_name VARCHAR(100) NOT NULL,
    endpoint_url VARCHAR(200),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'stopped', 'error'
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Training jobs
CREATE TABLE IF NOT EXISTS training.training_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES annotation.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    dataset_id UUID REFERENCES annotation.datasets(id) ON DELETE CASCADE,
    configuration JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    progress FLOAT DEFAULT 0.0,
    metrics JSONB DEFAULT '{}',
    logs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data pipeline
CREATE TABLE IF NOT EXISTS data_pipeline.pipeline_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_type VARCHAR(50) NOT NULL, -- 'data_ingestion', 'preprocessing', 'augmentation', 'quality_check'
    source_path VARCHAR(500),
    target_path VARCHAR(500),
    configuration JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    progress FLOAT DEFAULT 0.0,
    logs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- XR sessions
CREATE TABLE IF NOT EXISTS xr.xr_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES annotation.projects(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL, -- 'ar', 'vr', 'mixed'
    device_info JSONB DEFAULT '{}',
    session_data JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER
);

-- Monitoring and metrics
CREATE TABLE IF NOT EXISTS monitoring.system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(50) NOT NULL, -- 'cpu', 'memory', 'disk', 'gpu', 'network'
    service_name VARCHAR(100) NOT NULL,
    metric_value FLOAT NOT NULL,
    unit VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS monitoring.api_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint VARCHAR(200) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON auth.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON annotation.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_datasets_project ON annotation.datasets(project_id);
CREATE INDEX IF NOT EXISTS idx_annotations_dataset ON annotation.annotations(dataset_id);
CREATE INDEX IF NOT EXISTS idx_annotations_user ON annotation.annotations(user_id);
CREATE INDEX IF NOT EXISTS idx_annotations_data_item ON annotation.annotations(data_item_id);
CREATE INDEX IF NOT EXISTS idx_models_type ON ai_models.models(model_type);
CREATE INDEX IF NOT EXISTS idx_training_jobs_project ON training.training_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_status ON training.training_jobs(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_jobs_status ON data_pipeline.pipeline_jobs(status);
CREATE INDEX IF NOT EXISTS idx_xr_sessions_user ON xr.xr_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_system_metrics_service ON monitoring.system_metrics(service_name);
CREATE INDEX IF NOT EXISTS idx_api_metrics_endpoint ON monitoring.api_metrics(endpoint);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON auth.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON annotation.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON annotation.datasets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annotations_updated_at BEFORE UPDATE ON annotation.annotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON ai_models.models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deployments_updated_at BEFORE UPDATE ON ai_models.model_deployments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_jobs_updated_at BEFORE UPDATE ON training.training_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipeline_jobs_updated_at BEFORE UPDATE ON data_pipeline.pipeline_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO auth.users (username, email, hashed_password, is_superuser) 
VALUES ('admin', 'admin@annotateai.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewCcXtLdh3z3c/1S', TRUE)
ON CONFLICT (username) DO NOTHING;

-- Insert default project
INSERT INTO annotation.projects (name, description, owner_id) 
SELECT 'Default Project', 'Default project for getting started', id 
FROM auth.users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO annotateai;
GRANT USAGE ON SCHEMA annotation TO annotateai;
GRANT USAGE ON SCHEMA ai_models TO annotateai;
GRANT USAGE ON SCHEMA training TO annotateai;
GRANT USAGE ON SCHEMA data_pipeline TO annotateai;
GRANT USAGE ON SCHEMA xr TO annotateai;
GRANT USAGE ON SCHEMA monitoring TO annotateai;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO annotateai;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA annotation TO annotateai;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ai_models TO annotateai;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA training TO annotateai;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA data_pipeline TO annotateai;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA xr TO annotateai;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA monitoring TO annotateai;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO annotateai;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA annotation TO annotateai;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ai_models TO annotateai;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA training TO annotateai;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA data_pipeline TO annotateai;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA xr TO annotateai;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA monitoring TO annotateai; 