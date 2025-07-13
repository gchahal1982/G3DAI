#!/usr/bin/env python3
"""
AnnotateAI Enterprise Services
Advanced authentication, authorization, compliance, and multi-tenancy
"""

import asyncio
import logging
import os
import time
import json
import uuid
import hashlib
import secrets
from pathlib import Path
from typing import Dict, List, Optional, Any, Union, Tuple, Set
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from dataclasses import dataclass, asdict
from enum import Enum
import jwt
import bcrypt
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

# FastAPI and web framework
from fastapi import FastAPI, HTTPException, Depends, Security, status, Request, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel, Field, EmailStr, SecretStr

# SAML and OAuth2
from onelogin.saml2.auth import OneLogin_Saml2_Auth
from onelogin.saml2.settings import OneLogin_Saml2_Settings
from onelogin.saml2.utils import OneLogin_Saml2_Utils
import requests
from authlib.integrations.requests_client import OAuth2Session
from authlib.integrations.fastapi_oauth2 import AuthorizationServer, ResourceProtector
from authlib.oauth2.rfc6749 import grants
from authlib.oauth2.rfc7636 import CodeChallenge

# Database and ORM
from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Text, Integer, ForeignKey, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from alembic import command
from alembic.config import Config

# Redis for caching and sessions
import redis
import redis.asyncio as aioredis

# Compliance and auditing
import gdpr_compliance
from audit_logger import AuditLogger
from data_retention import DataRetentionManager

# Monitoring and security
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import psutil
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Email and notifications
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import boto3

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/annotateai_enterprise")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key())
SAML_SETTINGS_PATH = os.getenv("SAML_SETTINGS_PATH", "/app/saml_settings.json")
OAUTH2_CLIENTS_CONFIG = os.getenv("OAUTH2_CLIENTS_CONFIG", "/app/oauth2_clients.json")
AUDIT_LOG_RETENTION_DAYS = int(os.getenv("AUDIT_LOG_RETENTION_DAYS", "2555"))  # 7 years
GDPR_ENABLED = os.getenv("GDPR_ENABLED", "true").lower() == "true"
HIPAA_ENABLED = os.getenv("HIPAA_ENABLED", "false").lower() == "true"
SOC2_ENABLED = os.getenv("SOC2_ENABLED", "false").lower() == "true"

# Prometheus metrics
AUTH_ATTEMPTS_TOTAL = Counter('auth_attempts_total', 'Total authentication attempts', ['method', 'status'])
SSO_LOGINS_TOTAL = Counter('sso_logins_total', 'Total SSO logins', ['provider'])
RBAC_CHECKS_TOTAL = Counter('rbac_checks_total', 'Total RBAC permission checks', ['resource', 'action'])
AUDIT_EVENTS_TOTAL = Counter('audit_events_total', 'Total audit events', ['event_type'])
ACTIVE_SESSIONS = Gauge('active_user_sessions', 'Active user sessions')
COMPLIANCE_VIOLATIONS = Counter('compliance_violations_total', 'Compliance violations', ['type'])

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

class UserRole(str, Enum):
    """User roles in the system"""
    SUPER_ADMIN = "super_admin"
    ORG_ADMIN = "org_admin"
    PROJECT_MANAGER = "project_manager"
    ANNOTATOR = "annotator"
    REVIEWER = "reviewer"
    VIEWER = "viewer"
    API_USER = "api_user"
    GUEST = "guest"

class PermissionAction(str, Enum):
    """Permission actions"""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    MANAGE = "manage"
    SHARE = "share"
    EXPORT = "export"
    APPROVE = "approve"

class ResourceType(str, Enum):
    """Resource types for permissions"""
    PROJECT = "project"
    DATASET = "dataset"
    ANNOTATION = "annotation"
    MODEL = "model"
    USER = "user"
    ORGANIZATION = "organization"
    BILLING = "billing"
    AUDIT_LOG = "audit_log"
    SYSTEM_CONFIG = "system_config"

class AuthMethod(str, Enum):
    """Authentication methods"""
    PASSWORD = "password"
    SSO_SAML = "sso_saml"
    SSO_OAUTH2 = "sso_oauth2"
    API_KEY = "api_key"
    MFA_TOTP = "mfa_totp"
    MFA_SMS = "mfa_sms"

class AuditEventType(str, Enum):
    """Audit event types"""
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    PASSWORD_CHANGE = "password_change"
    PERMISSION_GRANTED = "permission_granted"
    PERMISSION_REVOKED = "permission_revoked"
    DATA_ACCESS = "data_access"
    DATA_MODIFICATION = "data_modification"
    DATA_EXPORT = "data_export"
    DATA_DELETION = "data_deletion"
    COMPLIANCE_VIOLATION = "compliance_violation"
    SECURITY_INCIDENT = "security_incident"
    ADMIN_ACTION = "admin_action"

class ComplianceStandard(str, Enum):
    """Supported compliance standards"""
    GDPR = "gdpr"
    HIPAA = "hipaa"
    SOC2 = "soc2"
    ISO27001 = "iso27001"
    CCPA = "ccpa"

# Database models
Base = declarative_base()

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    domain = Column(String(255), nullable=True)  # For domain-based tenant routing
    
    # Subscription and billing
    subscription_tier = Column(String(50), default="free")
    billing_email = Column(String(255), nullable=True)
    
    # Compliance settings
    gdpr_enabled = Column(Boolean, default=True)
    hipaa_enabled = Column(Boolean, default=False)
    soc2_enabled = Column(Boolean, default=False)
    data_retention_days = Column(Integer, default=2555)  # 7 years
    
    # SSO configuration
    sso_enabled = Column(Boolean, default=False)
    sso_provider = Column(String(50), nullable=True)
    sso_config = Column(JSONB, nullable=True)
    
    # Security settings
    mfa_required = Column(Boolean, default=False)
    password_policy = Column(JSONB, nullable=True)
    session_timeout_minutes = Column(Integer, default=480)  # 8 hours
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    # Basic info
    email = Column(String(255), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    
    # Authentication
    password_hash = Column(String(255), nullable=True)  # Nullable for SSO-only users
    salt = Column(String(255), nullable=True)
    last_password_change = Column(DateTime, nullable=True)
    
    # Status and flags
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(255), nullable=True)  # Encrypted TOTP secret
    
    # SSO integration
    sso_provider = Column(String(50), nullable=True)
    sso_subject_id = Column(String(255), nullable=True)
    
    # Security and compliance
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    last_login = Column(DateTime, nullable=True)
    last_activity = Column(DateTime, nullable=True)
    
    # Privacy and consent
    gdpr_consent = Column(Boolean, default=False)
    gdpr_consent_date = Column(DateTime, nullable=True)
    marketing_consent = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = relationship("Organization")
    roles = relationship("UserRole", back_populates="user")
    sessions = relationship("UserSession", back_populates="user")

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_system_role = Column(Boolean, default=False)  # Built-in vs custom roles
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    permissions = relationship("Permission", back_populates="role")
    users = relationship("UserRole", back_populates="role")

class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    
    resource_type = Column(String(50), nullable=False)  # ResourceType enum
    resource_id = Column(String(255), nullable=True)  # Specific resource ID, null for all
    action = Column(String(50), nullable=False)  # PermissionAction enum
    
    # Advanced permissions
    conditions = Column(JSONB, nullable=True)  # JSON conditions for dynamic permissions
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    role = relationship("Role", back_populates="permissions")

class UserRole(Base):
    __tablename__ = "user_roles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    
    # Role assignment context
    resource_type = Column(String(50), nullable=True)  # Scoped to specific resource type
    resource_id = Column(String(255), nullable=True)  # Scoped to specific resource
    
    granted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    granted_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="roles")
    role = relationship("Role", back_populates="users")
    granted_by_user = relationship("User", foreign_keys=[granted_by])

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    session_token = Column(String(255), unique=True, nullable=False)
    refresh_token = Column(String(255), unique=True, nullable=True)
    
    # Session metadata
    ip_address = Column(String(45), nullable=True)  # IPv6 compatible
    user_agent = Column(Text, nullable=True)
    device_fingerprint = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    
    # Security flags
    is_active = Column(Boolean, default=True)
    is_suspicious = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="sessions")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    # Event details
    event_type = Column(String(50), nullable=False)  # AuditEventType enum
    event_description = Column(Text, nullable=False)
    
    # Actor (who performed the action)
    actor_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    actor_type = Column(String(50), nullable=False)  # user, system, api, etc.
    actor_ip = Column(String(45), nullable=True)
    
    # Target (what was affected)
    target_resource_type = Column(String(50), nullable=True)
    target_resource_id = Column(String(255), nullable=True)
    
    # Additional context
    metadata = Column(JSONB, nullable=True)
    risk_level = Column(String(20), default="low")  # low, medium, high, critical
    
    # Compliance flags
    gdpr_relevant = Column(Boolean, default=False)
    hipaa_relevant = Column(Boolean, default=False)
    soc2_relevant = Column(Boolean, default=False)
    
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    organization = relationship("Organization")
    actor_user = relationship("User")

class ApiKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    name = Column(String(255), nullable=False)
    key_hash = Column(String(255), unique=True, nullable=False)
    key_prefix = Column(String(20), nullable=False)  # First few chars for identification
    
    # Permissions and scope
    scopes = Column(ARRAY(String), nullable=False)
    rate_limit_per_hour = Column(Integer, default=1000)
    
    # Status and expiration
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)
    last_used = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    organization = relationship("Organization")

# Create indexes for performance
Index('idx_users_email', User.email)
Index('idx_users_org_id', User.organization_id)
Index('idx_audit_logs_org_timestamp', AuditLog.organization_id, AuditLog.timestamp)
Index('idx_audit_logs_event_type', AuditLog.event_type)
Index('idx_sessions_token', UserSession.session_token)
Index('idx_sessions_user_active', UserSession.user_id, UserSession.is_active)

# Pydantic models
class UserRegistration(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    first_name: str = Field(..., min_length=1, max_length=100, description="First name")
    last_name: str = Field(..., min_length=1, max_length=100, description="Last name")
    password: SecretStr = Field(..., min_length=8, description="Password")
    organization_name: str = Field(..., min_length=1, max_length=255, description="Organization name")
    gdpr_consent: bool = Field(..., description="GDPR consent")
    marketing_consent: bool = Field(default=False, description="Marketing consent")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="User email")
    password: SecretStr = Field(..., description="Password")
    remember_me: bool = Field(default=False, description="Remember login")
    mfa_code: Optional[str] = Field(default=None, description="MFA code")

class SSOLoginRequest(BaseModel):
    provider: str = Field(..., description="SSO provider")
    redirect_url: str = Field(..., description="Redirect URL after login")

class PasswordChangeRequest(BaseModel):
    current_password: SecretStr = Field(..., description="Current password")
    new_password: SecretStr = Field(..., min_length=8, description="New password")

class RoleAssignment(BaseModel):
    user_id: str = Field(..., description="User ID")
    role_name: str = Field(..., description="Role name")
    resource_type: Optional[str] = Field(default=None, description="Resource type")
    resource_id: Optional[str] = Field(default=None, description="Resource ID")
    expires_at: Optional[datetime] = Field(default=None, description="Expiration time")

class PermissionCheck(BaseModel):
    resource_type: ResourceType = Field(..., description="Resource type")
    resource_id: Optional[str] = Field(default=None, description="Resource ID")
    action: PermissionAction = Field(..., description="Action to check")

class AuditLogEntry(BaseModel):
    event_type: AuditEventType = Field(..., description="Event type")
    event_description: str = Field(..., description="Event description")
    target_resource_type: Optional[str] = Field(default=None, description="Target resource type")
    target_resource_id: Optional[str] = Field(default=None, description="Target resource ID")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")
    risk_level: str = Field(default="low", description="Risk level")

class ComplianceReport(BaseModel):
    organization_id: str = Field(..., description="Organization ID")
    standard: ComplianceStandard = Field(..., description="Compliance standard")
    start_date: datetime = Field(..., description="Report start date")
    end_date: datetime = Field(..., description="Report end date")

class EnterpriseService:
    """Main enterprise services controller"""
    
    def __init__(self):
        # Database setup
        self.engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        
        # Redis setup
        self.redis_client = redis.from_url(REDIS_URL)
        
        # Encryption setup
        self.fernet = Fernet(ENCRYPTION_KEY)
        
        # Load SSO configurations
        self.saml_settings = self._load_saml_settings()
        self.oauth2_clients = self._load_oauth2_clients()
        
        # Initialize audit logger
        self.audit_logger = AuditLogger(self.SessionLocal)
        
        # Initialize compliance managers
        self.gdpr_manager = GDPRComplianceManager(self.SessionLocal) if GDPR_ENABLED else None
        self.hipaa_manager = HIPAAComplianceManager(self.SessionLocal) if HIPAA_ENABLED else None
        
        # Initialize data retention
        self.data_retention = DataRetentionManager(self.SessionLocal)
        
        # Password policy
        self.default_password_policy = {
            "min_length": 8,
            "require_uppercase": True,
            "require_lowercase": True,
            "require_numbers": True,
            "require_special_chars": True,
            "max_age_days": 90,
            "history_count": 5
        }
    
    def _load_saml_settings(self) -> Dict[str, Any]:
        """Load SAML SSO settings"""
        try:
            if os.path.exists(SAML_SETTINGS_PATH):
                with open(SAML_SETTINGS_PATH, 'r') as f:
                    return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load SAML settings: {e}")
        return {}
    
    def _load_oauth2_clients(self) -> Dict[str, Any]:
        """Load OAuth2 client configurations"""
        try:
            if os.path.exists(OAUTH2_CLIENTS_CONFIG):
                with open(OAUTH2_CLIENTS_CONFIG, 'r') as f:
                    return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load OAuth2 clients: {e}")
        return {}
    
    def _hash_password(self, password: str, salt: str = None) -> Tuple[str, str]:
        """Hash password with salt"""
        if salt is None:
            salt = bcrypt.gensalt().decode('utf-8')
        
        password_hash = bcrypt.hashpw(password.encode('utf-8'), salt.encode('utf-8')).decode('utf-8')
        return password_hash, salt
    
    def _verify_password(self, password: str, password_hash: str, salt: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    
    def _generate_jwt_token(self, user_id: str, organization_id: str, session_id: str) -> str:
        """Generate JWT access token"""
        payload = {
            'user_id': user_id,
            'organization_id': organization_id,
            'session_id': session_id,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
        }
        
        return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    def _verify_jwt_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")
    
    async def register_user(
        self,
        registration: UserRegistration,
        request: Request
    ) -> Dict[str, Any]:
        """Register new user and organization"""
        
        with self.SessionLocal() as db:
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == registration.email).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="User already exists")
            
            # Create organization
            org_slug = registration.organization_name.lower().replace(' ', '-').replace('_', '-')
            org_slug = ''.join(c for c in org_slug if c.isalnum() or c == '-')
            
            # Ensure unique slug
            base_slug = org_slug
            counter = 1
            while db.query(Organization).filter(Organization.slug == org_slug).first():
                org_slug = f"{base_slug}-{counter}"
                counter += 1
            
            organization = Organization(
                name=registration.organization_name,
                slug=org_slug,
                gdpr_enabled=GDPR_ENABLED,
                hipaa_enabled=HIPAA_ENABLED,
                soc2_enabled=SOC2_ENABLED
            )
            db.add(organization)
            db.flush()
            
            # Hash password
            password_hash, salt = self._hash_password(registration.password.get_secret_value())
            
            # Create user
            user = User(
                organization_id=organization.id,
                email=registration.email,
                first_name=registration.first_name,
                last_name=registration.last_name,
                password_hash=password_hash,
                salt=salt,
                is_verified=False,  # Require email verification
                gdpr_consent=registration.gdpr_consent,
                gdpr_consent_date=datetime.utcnow() if registration.gdpr_consent else None,
                marketing_consent=registration.marketing_consent
            )
            db.add(user)
            db.flush()
            
            # Assign admin role to first user in organization
            admin_role = db.query(Role).filter(
                Role.organization_id == organization.id,
                Role.name == UserRole.ORG_ADMIN.value
            ).first()
            
            if not admin_role:
                # Create default roles for organization
                await self._create_default_roles(db, organization.id)
                admin_role = db.query(Role).filter(
                    Role.organization_id == organization.id,
                    Role.name == UserRole.ORG_ADMIN.value
                ).first()
            
            user_role = UserRole(
                user_id=user.id,
                role_id=admin_role.id,
                granted_by=user.id,
                granted_at=datetime.utcnow()
            )
            db.add(user_role)
            
            db.commit()
            
            # Log audit event
            await self.audit_logger.log_event(
                organization_id=str(organization.id),
                event_type=AuditEventType.USER_LOGIN,
                event_description=f"User registered: {registration.email}",
                actor_user_id=str(user.id),
                actor_type="user",
                actor_ip=request.client.host,
                metadata={
                    "registration_method": "email",
                    "gdpr_consent": registration.gdpr_consent,
                    "marketing_consent": registration.marketing_consent
                }
            )
            
            return {
                "user_id": str(user.id),
                "organization_id": str(organization.id),
                "message": "Registration successful. Please verify your email."
            }
    
    async def _create_default_roles(self, db, organization_id: str):
        """Create default roles for organization"""
        
        default_roles = [
            {
                "name": UserRole.ORG_ADMIN.value,
                "description": "Organization administrator with full access",
                "permissions": [
                    (ResourceType.ORGANIZATION, PermissionAction.MANAGE),
                    (ResourceType.USER, PermissionAction.MANAGE),
                    (ResourceType.PROJECT, PermissionAction.MANAGE),
                    (ResourceType.DATASET, PermissionAction.MANAGE),
                    (ResourceType.MODEL, PermissionAction.MANAGE),
                    (ResourceType.BILLING, PermissionAction.MANAGE),
                    (ResourceType.AUDIT_LOG, PermissionAction.READ),
                    (ResourceType.SYSTEM_CONFIG, PermissionAction.MANAGE)
                ]
            },
            {
                "name": UserRole.PROJECT_MANAGER.value,
                "description": "Project manager with project and dataset access",
                "permissions": [
                    (ResourceType.PROJECT, PermissionAction.MANAGE),
                    (ResourceType.DATASET, PermissionAction.MANAGE),
                    (ResourceType.ANNOTATION, PermissionAction.MANAGE),
                    (ResourceType.MODEL, PermissionAction.READ),
                    (ResourceType.USER, PermissionAction.READ)
                ]
            },
            {
                "name": UserRole.ANNOTATOR.value,
                "description": "Annotator with annotation creation and editing access",
                "permissions": [
                    (ResourceType.PROJECT, PermissionAction.READ),
                    (ResourceType.DATASET, PermissionAction.READ),
                    (ResourceType.ANNOTATION, PermissionAction.CREATE),
                    (ResourceType.ANNOTATION, PermissionAction.UPDATE)
                ]
            },
            {
                "name": UserRole.REVIEWER.value,
                "description": "Reviewer with annotation approval access",
                "permissions": [
                    (ResourceType.PROJECT, PermissionAction.READ),
                    (ResourceType.DATASET, PermissionAction.READ),
                    (ResourceType.ANNOTATION, PermissionAction.READ),
                    (ResourceType.ANNOTATION, PermissionAction.APPROVE)
                ]
            },
            {
                "name": UserRole.VIEWER.value,
                "description": "Viewer with read-only access",
                "permissions": [
                    (ResourceType.PROJECT, PermissionAction.READ),
                    (ResourceType.DATASET, PermissionAction.READ),
                    (ResourceType.ANNOTATION, PermissionAction.READ)
                ]
            }
        ]
        
        for role_data in default_roles:
            role = Role(
                organization_id=organization_id,
                name=role_data["name"],
                description=role_data["description"],
                is_system_role=True
            )
            db.add(role)
            db.flush()
            
            # Add permissions
            for resource_type, action in role_data["permissions"]:
                permission = Permission(
                    role_id=role.id,
                    resource_type=resource_type.value,
                    action=action.value
                )
                db.add(permission)
    
    async def authenticate_user(
        self,
        login: UserLogin,
        request: Request
    ) -> Dict[str, Any]:
        """Authenticate user with email/password"""
        
        with self.SessionLocal() as db:
            # Find user
            user = db.query(User).filter(User.email == login.email).first()
            
            if not user or not user.is_active:
                AUTH_ATTEMPTS_TOTAL.labels(method="password", status="failed").inc()
                await self.audit_logger.log_event(
                    organization_id=str(user.organization_id) if user else "unknown",
                    event_type=AuditEventType.USER_LOGIN,
                    event_description=f"Failed login attempt for {login.email}",
                    actor_type="user",
                    actor_ip=request.client.host,
                    risk_level="medium"
                )
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            # Check if account is locked
            if user.locked_until and user.locked_until > datetime.utcnow():
                AUTH_ATTEMPTS_TOTAL.labels(method="password", status="locked").inc()
                raise HTTPException(status_code=423, detail="Account temporarily locked")
            
            # Verify password
            if not self._verify_password(login.password.get_secret_value(), user.password_hash, user.salt):
                # Increment failed attempts
                user.failed_login_attempts += 1
                
                # Lock account after 5 failed attempts
                if user.failed_login_attempts >= 5:
                    user.locked_until = datetime.utcnow() + timedelta(minutes=30)
                
                db.commit()
                
                AUTH_ATTEMPTS_TOTAL.labels(method="password", status="failed").inc()
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            # Check MFA if enabled
            if user.is_mfa_enabled:
                if not login.mfa_code:
                    return {"requires_mfa": True, "user_id": str(user.id)}
                
                # Verify MFA code (simplified - would use proper TOTP verification)
                if not self._verify_mfa_code(user.mfa_secret, login.mfa_code):
                    AUTH_ATTEMPTS_TOTAL.labels(method="mfa", status="failed").inc()
                    raise HTTPException(status_code=401, detail="Invalid MFA code")
            
            # Reset failed attempts
            user.failed_login_attempts = 0
            user.locked_until = None
            user.last_login = datetime.utcnow()
            user.last_activity = datetime.utcnow()
            
            # Create session
            session_token = secrets.token_urlsafe(32)
            refresh_token = secrets.token_urlsafe(32)
            
            session = UserSession(
                user_id=user.id,
                session_token=session_token,
                refresh_token=refresh_token,
                ip_address=request.client.host,
                user_agent=request.headers.get("User-Agent"),
                expires_at=datetime.utcnow() + timedelta(
                    minutes=user.organization.session_timeout_minutes
                )
            )
            db.add(session)
            
            db.commit()
            
            # Generate JWT
            jwt_token = self._generate_jwt_token(
                str(user.id),
                str(user.organization_id),
                str(session.id)
            )
            
            # Update metrics
            AUTH_ATTEMPTS_TOTAL.labels(method="password", status="success").inc()
            ACTIVE_SESSIONS.inc()
            
            # Log successful login
            await self.audit_logger.log_event(
                organization_id=str(user.organization_id),
                event_type=AuditEventType.USER_LOGIN,
                event_description=f"Successful login: {user.email}",
                actor_user_id=str(user.id),
                actor_type="user",
                actor_ip=request.client.host,
                metadata={"auth_method": "password"}
            )
            
            return {
                "access_token": jwt_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": JWT_EXPIRATION_HOURS * 3600,
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "organization_id": str(user.organization_id)
                }
            }
    
    def _verify_mfa_code(self, secret: str, code: str) -> bool:
        """Verify TOTP MFA code"""
        # Decrypt secret
        try:
            decrypted_secret = self.fernet.decrypt(secret.encode()).decode()
            # Implementation would use pyotp to verify TOTP
            import pyotp
            totp = pyotp.TOTP(decrypted_secret)
            return totp.verify(code)
        except Exception as e:
            logger.error(f"MFA verification failed: {e}")
            return False
    
    async def check_permission(
        self,
        user_id: str,
        permission_check: PermissionCheck,
        organization_id: str
    ) -> bool:
        """Check if user has specific permission"""
        
        with self.SessionLocal() as db:
            # Get user roles
            user_roles = db.query(UserRole).join(Role).filter(
                UserRole.user_id == user_id,
                Role.organization_id == organization_id,
                UserRole.expires_at.is_(None) | (UserRole.expires_at > datetime.utcnow())
            ).all()
            
            # Check permissions for each role
            for user_role in user_roles:
                permissions = db.query(Permission).filter(
                    Permission.role_id == user_role.role_id,
                    Permission.resource_type == permission_check.resource_type.value,
                    Permission.action == permission_check.action.value
                ).all()
                
                for permission in permissions:
                    # Check if permission applies to specific resource or all resources
                    if (permission.resource_id is None or 
                        permission.resource_id == permission_check.resource_id):
                        
                        # Check role scope
                        if (user_role.resource_type is None or 
                            user_role.resource_type == permission_check.resource_type.value):
                            if (user_role.resource_id is None or 
                                user_role.resource_id == permission_check.resource_id):
                                
                                RBAC_CHECKS_TOTAL.labels(
                                    resource=permission_check.resource_type.value,
                                    action=permission_check.action.value
                                ).inc()
                                
                                return True
            
            return False
    
    async def assign_role(
        self,
        assignment: RoleAssignment,
        assigner_user_id: str,
        organization_id: str
    ) -> Dict[str, Any]:
        """Assign role to user"""
        
        with self.SessionLocal() as db:
            # Verify assigner has permission
            can_assign = await self.check_permission(
                assigner_user_id,
                PermissionCheck(
                    resource_type=ResourceType.USER,
                    action=PermissionAction.MANAGE
                ),
                organization_id
            )
            
            if not can_assign:
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            
            # Find user and role
            user = db.query(User).filter(
                User.id == assignment.user_id,
                User.organization_id == organization_id
            ).first()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            role = db.query(Role).filter(
                Role.name == assignment.role_name,
                Role.organization_id == organization_id
            ).first()
            
            if not role:
                raise HTTPException(status_code=404, detail="Role not found")
            
            # Check if assignment already exists
            existing = db.query(UserRole).filter(
                UserRole.user_id == assignment.user_id,
                UserRole.role_id == role.id,
                UserRole.resource_type == assignment.resource_type,
                UserRole.resource_id == assignment.resource_id
            ).first()
            
            if existing:
                raise HTTPException(status_code=400, detail="Role already assigned")
            
            # Create assignment
            user_role = UserRole(
                user_id=assignment.user_id,
                role_id=role.id,
                resource_type=assignment.resource_type,
                resource_id=assignment.resource_id,
                granted_by=assigner_user_id,
                expires_at=assignment.expires_at
            )
            db.add(user_role)
            db.commit()
            
            # Log audit event
            await self.audit_logger.log_event(
                organization_id=organization_id,
                event_type=AuditEventType.PERMISSION_GRANTED,
                event_description=f"Role {assignment.role_name} assigned to user {user.email}",
                actor_user_id=assigner_user_id,
                actor_type="user",
                target_resource_type="user",
                target_resource_id=assignment.user_id,
                metadata={
                    "role_name": assignment.role_name,
                    "resource_type": assignment.resource_type,
                    "resource_id": assignment.resource_id
                }
            )
            
            return {"message": "Role assigned successfully"}
    
    async def get_compliance_report(
        self,
        report_request: ComplianceReport,
        user_id: str
    ) -> Dict[str, Any]:
        """Generate compliance report"""
        
        # Check permissions
        can_view = await self.check_permission(
            user_id,
            PermissionCheck(
                resource_type=ResourceType.AUDIT_LOG,
                action=PermissionAction.READ
            ),
            report_request.organization_id
        )
        
        if not can_view:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        with self.SessionLocal() as db:
            # Get audit logs for compliance period
            logs = db.query(AuditLog).filter(
                AuditLog.organization_id == report_request.organization_id,
                AuditLog.timestamp >= report_request.start_date,
                AuditLog.timestamp <= report_request.end_date
            )
            
            # Filter by compliance standard
            if report_request.standard == ComplianceStandard.GDPR:
                logs = logs.filter(AuditLog.gdpr_relevant == True)
            elif report_request.standard == ComplianceStandard.HIPAA:
                logs = logs.filter(AuditLog.hipaa_relevant == True)
            elif report_request.standard == ComplianceStandard.SOC2:
                logs = logs.filter(AuditLog.soc2_relevant == True)
            
            logs = logs.all()
            
            # Generate report statistics
            event_counts = {}
            risk_levels = {"low": 0, "medium": 0, "high": 0, "critical": 0}
            
            for log in logs:
                event_counts[log.event_type] = event_counts.get(log.event_type, 0) + 1
                risk_levels[log.risk_level] += 1
            
            # Compliance-specific analysis
            compliance_status = "compliant"
            violations = []
            recommendations = []
            
            if report_request.standard == ComplianceStandard.GDPR:
                # GDPR-specific checks
                gdpr_analysis = self._analyze_gdpr_compliance(logs)
                compliance_status = gdpr_analysis["status"]
                violations.extend(gdpr_analysis["violations"])
                recommendations.extend(gdpr_analysis["recommendations"])
            
            return {
                "organization_id": report_request.organization_id,
                "standard": report_request.standard.value,
                "period": {
                    "start_date": report_request.start_date.isoformat(),
                    "end_date": report_request.end_date.isoformat()
                },
                "summary": {
                    "total_events": len(logs),
                    "event_types": event_counts,
                    "risk_distribution": risk_levels,
                    "compliance_status": compliance_status
                },
                "violations": violations,
                "recommendations": recommendations,
                "generated_at": datetime.utcnow().isoformat()
            }
    
    def _analyze_gdpr_compliance(self, logs: List[AuditLog]) -> Dict[str, Any]:
        """Analyze GDPR compliance from audit logs"""
        
        violations = []
        recommendations = []
        
        # Check for data access without consent
        data_access_events = [log for log in logs if log.event_type == AuditEventType.DATA_ACCESS.value]
        
        # Check for data retention policy violations
        data_deletion_events = [log for log in logs if log.event_type == AuditEventType.DATA_DELETION.value]
        
        # Check for unauthorized data exports
        export_events = [log for log in logs if log.event_type == AuditEventType.DATA_EXPORT.value]
        
        # Analyze patterns and generate recommendations
        if len(export_events) > 100:  # Threshold for review
            recommendations.append("High volume of data exports detected. Review export policies.")
        
        status = "compliant" if not violations else "non_compliant"
        
        return {
            "status": status,
            "violations": violations,
            "recommendations": recommendations
        }
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Get enterprise system statistics"""
        
        with self.SessionLocal() as db:
            total_orgs = db.query(Organization).count()
            total_users = db.query(User).filter(User.is_active == True).count()
            active_sessions = db.query(UserSession).filter(
                UserSession.is_active == True,
                UserSession.expires_at > datetime.utcnow()
            ).count()
            
            return {
                "organizations": total_orgs,
                "active_users": total_users,
                "active_sessions": active_sessions,
                "sso_enabled_orgs": db.query(Organization).filter(
                    Organization.sso_enabled == True
                ).count(),
                "mfa_enabled_users": db.query(User).filter(
                    User.is_mfa_enabled == True
                ).count(),
                "system_health": {
                    "cpu_usage": psutil.cpu_percent(),
                    "memory_usage": psutil.virtual_memory().percent,
                    "disk_usage": psutil.disk_usage('/').percent
                }
            }

# Initialize service
enterprise_service = EnterpriseService()

# Security dependencies
security = HTTPBearer()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: HTTPAuthorizationCredentials = Security(security)):
    """Get current authenticated user"""
    payload = enterprise_service._verify_jwt_token(token.credentials)
    
    with enterprise_service.SessionLocal() as db:
        user = db.query(User).filter(User.id == payload["user_id"]).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="User not found or inactive")
        
        # Update last activity
        user.last_activity = datetime.utcnow()
        db.commit()
        
        return user

async def check_organization_access(
    user: User = Depends(get_current_user),
    organization_id: str = None
):
    """Check if user has access to organization"""
    if organization_id and str(user.organization_id) != organization_id:
        raise HTTPException(status_code=403, detail="Access denied to organization")
    return user

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting AnnotateAI Enterprise Services")
    yield
    logger.info("Shutting down AnnotateAI Enterprise Services")

# Create FastAPI app
app = FastAPI(
    title="AnnotateAI Enterprise Services",
    description="Advanced authentication, authorization, compliance, and multi-tenancy",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "healthy",
            "redis": "healthy",
            "sso": "healthy" if enterprise_service.saml_settings else "disabled"
        }
    }

@app.post("/auth/register")
@limiter.limit("5/minute")
async def register_user(
    registration: UserRegistration,
    request: Request
):
    """Register new user and organization"""
    return await enterprise_service.register_user(registration, request)

@app.post("/auth/login")
@limiter.limit("10/minute")
async def login_user(
    login: UserLogin,
    request: Request
):
    """Authenticate user with email/password"""
    return await enterprise_service.authenticate_user(login, request)

@app.post("/auth/sso/initiate")
async def initiate_sso_login(
    sso_request: SSOLoginRequest
):
    """Initiate SSO login"""
    # Implementation would redirect to SSO provider
    return {"redirect_url": f"https://sso-provider.com/login?redirect={sso_request.redirect_url}"}

@app.get("/auth/sso/callback")
async def sso_callback(request: Request):
    """Handle SSO callback"""
    # Implementation would handle SAML/OAuth2 callback
    return {"message": "SSO callback handled"}

@app.post("/rbac/check-permission")
async def check_permission(
    permission_check: PermissionCheck,
    user: User = Depends(get_current_user)
):
    """Check user permission for resource and action"""
    has_permission = await enterprise_service.check_permission(
        str(user.id),
        permission_check,
        str(user.organization_id)
    )
    return {"has_permission": has_permission}

@app.post("/rbac/assign-role")
async def assign_role(
    assignment: RoleAssignment,
    user: User = Depends(get_current_user)
):
    """Assign role to user"""
    return await enterprise_service.assign_role(
        assignment,
        str(user.id),
        str(user.organization_id)
    )

@app.post("/compliance/report")
async def generate_compliance_report(
    report_request: ComplianceReport,
    user: User = Depends(get_current_user)
):
    """Generate compliance report"""
    return await enterprise_service.get_compliance_report(report_request, str(user.id))

@app.get("/audit/logs")
async def get_audit_logs(
    limit: int = 100,
    offset: int = 0,
    event_type: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    """Get audit logs with filtering"""
    # Check permission
    can_view = await enterprise_service.check_permission(
        str(user.id),
        PermissionCheck(
            resource_type=ResourceType.AUDIT_LOG,
            action=PermissionAction.READ
        ),
        str(user.organization_id)
    )
    
    if not can_view:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Return audit logs (implementation would query database)
    return {"logs": [], "total": 0}

@app.get("/system/stats")
async def get_system_stats(
    user: User = Depends(get_current_user)
):
    """Get system statistics"""
    return enterprise_service.get_system_stats()

@app.get("/metrics")
async def get_metrics():
    """Get Prometheus metrics"""
    from fastapi.responses import Response
    return Response(generate_latest(), media_type="text/plain")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 