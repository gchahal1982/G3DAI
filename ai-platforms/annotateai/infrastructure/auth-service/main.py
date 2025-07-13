#!/usr/bin/env python3
"""
AnnotateAI Authentication Service
Provides JWT-based authentication, RBAC, and multi-tenant support
"""

from fastapi import FastAPI, HTTPException, Depends, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import jwt
import bcrypt
import asyncpg
import redis.asyncio as redis
from contextlib import asynccontextmanager
import os
import logging
from uuid import UUID, uuid4
import json
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
class Config:
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://annotateai:password@localhost:5432/annotateai")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    JWT_ALGORITHM = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS = 30
    BCRYPT_ROUNDS = 12

config = Config()

# Database connection
db_pool: Optional[asyncpg.Pool] = None
redis_client: Optional[redis.Redis] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    global db_pool, redis_client
    
    # Startup
    logger.info("Starting Authentication Service...")
    db_pool = await asyncpg.create_pool(config.DATABASE_URL)
    redis_client = redis.from_url(config.REDIS_URL)
    
    yield
    
    # Shutdown
    logger.info("Shutting down Authentication Service...")
    if db_pool:
        await db_pool.close()
    if redis_client:
        await redis_client.close()

# FastAPI app
app = FastAPI(
    title="AnnotateAI Authentication Service",
    description="JWT-based authentication with RBAC and multi-tenant support",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Models
class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ORG_ADMIN = "org_admin"
    PROJECT_MANAGER = "project_manager"
    ANNOTATOR = "annotator"
    VIEWER = "viewer"

class Permission(str, Enum):
    # Organization permissions
    CREATE_ORGANIZATION = "create_organization"
    MANAGE_ORGANIZATION = "manage_organization"
    DELETE_ORGANIZATION = "delete_organization"
    
    # Project permissions
    CREATE_PROJECT = "create_project"
    MANAGE_PROJECT = "manage_project"
    DELETE_PROJECT = "delete_project"
    VIEW_PROJECT = "view_project"
    
    # Annotation permissions
    CREATE_ANNOTATION = "create_annotation"
    EDIT_ANNOTATION = "edit_annotation"
    DELETE_ANNOTATION = "delete_annotation"
    VIEW_ANNOTATION = "view_annotation"
    
    # User management
    INVITE_USER = "invite_user"
    MANAGE_USER = "manage_user"
    DELETE_USER = "delete_user"
    
    # System permissions
    MANAGE_SYSTEM = "manage_system"
    VIEW_ANALYTICS = "view_analytics"

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    organization_id: Optional[UUID] = None
    role: UserRole = UserRole.ANNOTATOR

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: UUID
    username: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    is_active: bool
    is_superuser: bool
    created_at: datetime
    organization_id: Optional[UUID]
    role: UserRole

class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    domain: Optional[str] = None

class OrganizationResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    domain: Optional[str]
    created_at: datetime
    is_active: bool

# Role-based permissions mapping
ROLE_PERMISSIONS = {
    UserRole.SUPER_ADMIN: [p.value for p in Permission],
    UserRole.ORG_ADMIN: [
        Permission.MANAGE_ORGANIZATION,
        Permission.CREATE_PROJECT,
        Permission.MANAGE_PROJECT,
        Permission.DELETE_PROJECT,
        Permission.VIEW_PROJECT,
        Permission.CREATE_ANNOTATION,
        Permission.EDIT_ANNOTATION,
        Permission.DELETE_ANNOTATION,
        Permission.VIEW_ANNOTATION,
        Permission.INVITE_USER,
        Permission.MANAGE_USER,
        Permission.VIEW_ANALYTICS,
    ],
    UserRole.PROJECT_MANAGER: [
        Permission.CREATE_PROJECT,
        Permission.MANAGE_PROJECT,
        Permission.VIEW_PROJECT,
        Permission.CREATE_ANNOTATION,
        Permission.EDIT_ANNOTATION,
        Permission.DELETE_ANNOTATION,
        Permission.VIEW_ANNOTATION,
        Permission.INVITE_USER,
        Permission.VIEW_ANALYTICS,
    ],
    UserRole.ANNOTATOR: [
        Permission.VIEW_PROJECT,
        Permission.CREATE_ANNOTATION,
        Permission.EDIT_ANNOTATION,
        Permission.VIEW_ANNOTATION,
    ],
    UserRole.VIEWER: [
        Permission.VIEW_PROJECT,
        Permission.VIEW_ANNOTATION,
    ],
}

# Utility functions
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=config.BCRYPT_ROUNDS)).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=config.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, config.JWT_SECRET_KEY, algorithm=config.JWT_ALGORITHM)

def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=config.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, config.JWT_SECRET_KEY, algorithm=config.JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, config.JWT_SECRET_KEY, algorithms=[config.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Database functions
async def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    """Get user by username"""
    async with db_pool.acquire() as conn:
        query = """
            SELECT u.*, up.first_name, up.last_name, up.organization_id, up.role
            FROM auth.users u
            LEFT JOIN auth.user_profiles up ON u.id = up.user_id
            WHERE u.username = $1
        """
        row = await conn.fetchrow(query, username)
        return dict(row) if row else None

async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email"""
    async with db_pool.acquire() as conn:
        query = """
            SELECT u.*, up.first_name, up.last_name, up.organization_id, up.role
            FROM auth.users u
            LEFT JOIN auth.user_profiles up ON u.id = up.user_id
            WHERE u.email = $1
        """
        row = await conn.fetchrow(query, email)
        return dict(row) if row else None

async def get_user_by_id(user_id: UUID) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    async with db_pool.acquire() as conn:
        query = """
            SELECT u.*, up.first_name, up.last_name, up.organization_id, up.role
            FROM auth.users u
            LEFT JOIN auth.user_profiles up ON u.id = up.user_id
            WHERE u.id = $1
        """
        row = await conn.fetchrow(query, user_id)
        return dict(row) if row else None

async def create_user(user_data: UserCreate) -> Dict[str, Any]:
    """Create new user with profile"""
    async with db_pool.acquire() as conn:
        async with conn.transaction():
            # Create user
            user_id = uuid4()
            hashed_password = hash_password(user_data.password)
            
            user_query = """
                INSERT INTO auth.users (id, username, email, hashed_password, is_active, is_superuser)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            """
            user_row = await conn.fetchrow(
                user_query, user_id, user_data.username, user_data.email, 
                hashed_password, True, user_data.role == UserRole.SUPER_ADMIN
            )
            
            # Create user profile
            profile_query = """
                INSERT INTO auth.user_profiles (user_id, first_name, last_name, organization_id, role)
                VALUES ($1, $2, $3, $4, $5)
            """
            await conn.execute(
                profile_query, user_id, user_data.first_name, user_data.last_name,
                user_data.organization_id, user_data.role.value
            )
            
            # Get complete user data
            return await get_user_by_id(user_id)

async def create_organization(org_data: OrganizationCreate, owner_id: UUID) -> Dict[str, Any]:
    """Create new organization"""
    async with db_pool.acquire() as conn:
        org_id = uuid4()
        query = """
            INSERT INTO auth.organizations (id, name, description, domain, owner_id, is_active)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        """
        row = await conn.fetchrow(
            query, org_id, org_data.name, org_data.description, 
            org_data.domain, owner_id, True
        )
        return dict(row)

# Authentication dependencies
async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict[str, Any]:
    """Get current authenticated user"""
    payload = decode_token(credentials.credentials)
    
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await get_user_by_id(UUID(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

def require_permission(permission: Permission):
    """Decorator to require specific permission"""
    def permission_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        user_role = current_user.get("role")
        if not user_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User role not found"
            )
        
        user_permissions = ROLE_PERMISSIONS.get(UserRole(user_role), [])
        if permission.value not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission.value}"
            )
        
        return current_user
    
    return permission_checker

# API Routes
@app.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    """Register new user"""
    # Check if user already exists
    existing_user = await get_user_by_username(user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    existing_email = await get_user_by_email(user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = await create_user(user_data)
    
    # Create tokens
    access_token = create_access_token({"sub": str(user["id"])})
    refresh_token = create_refresh_token({"sub": str(user["id"])})
    
    # Cache user session
    await redis_client.setex(
        f"user_session:{user['id']}", 
        config.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        json.dumps(user, default=str)
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=config.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "organization_id": user["organization_id"]
        }
    )

@app.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    """Authenticate user and return tokens"""
    # Get user by username or email
    user = await get_user_by_username(login_data.username_or_email)
    if not user:
        user = await get_user_by_email(login_data.username_or_email)
    
    if not user or not verify_password(login_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create tokens
    access_token = create_access_token({"sub": str(user["id"])})
    refresh_token = create_refresh_token({"sub": str(user["id"])})
    
    # Cache user session
    await redis_client.setex(
        f"user_session:{user['id']}", 
        config.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        json.dumps(user, default=str)
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=config.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "organization_id": user["organization_id"]
        }
    )

@app.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    """Refresh access token"""
    payload = decode_token(refresh_token)
    
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await get_user_by_id(UUID(user_id))
    if not user or not user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or disabled",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create new access token
    new_access_token = create_access_token({"sub": str(user["id"])})
    
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=refresh_token,  # Keep same refresh token
        expires_in=config.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "organization_id": user["organization_id"]
        }
    )

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user["id"],
        username=current_user["username"],
        email=current_user["email"],
        first_name=current_user.get("first_name"),
        last_name=current_user.get("last_name"),
        is_active=current_user["is_active"],
        is_superuser=current_user["is_superuser"],
        created_at=current_user["created_at"],
        organization_id=current_user.get("organization_id"),
        role=UserRole(current_user["role"]) if current_user.get("role") else UserRole.VIEWER
    )

@app.post("/auth/logout")
async def logout(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Logout user (invalidate session)"""
    await redis_client.delete(f"user_session:{current_user['id']}")
    return {"message": "Successfully logged out"}

@app.post("/organizations", response_model=OrganizationResponse)
async def create_organization_endpoint(
    org_data: OrganizationCreate,
    current_user: Dict[str, Any] = Depends(require_permission(Permission.CREATE_ORGANIZATION))
):
    """Create new organization"""
    organization = await create_organization(org_data, current_user["id"])
    return OrganizationResponse(**organization)

@app.get("/users/permissions")
async def get_user_permissions(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user's permissions"""
    user_role = current_user.get("role")
    if not user_role:
        return {"permissions": []}
    
    permissions = ROLE_PERMISSIONS.get(UserRole(user_role), [])
    return {"permissions": permissions}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "auth-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 