#!/usr/bin/env python3
"""
AnnotateAI Real-time Collaboration Service
WebSocket-based collaboration with operational transformation, conflict resolution, and session management
"""

import asyncio
import json
import logging
import time
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set
from contextlib import asynccontextmanager
from dataclasses import dataclass, asdict
from enum import Enum

import socketio
import redis.asyncio as redis
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
class Config:
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")
    MAX_ROOM_SIZE = int(os.getenv("MAX_ROOM_SIZE", "100"))
    SESSION_TIMEOUT = int(os.getenv("SESSION_TIMEOUT", "3600"))  # 1 hour
    OPERATION_HISTORY_SIZE = int(os.getenv("OPERATION_HISTORY_SIZE", "1000"))

config = Config()

# Global clients
redis_client = None
sio = socketio.AsyncServer(
    cors_allowed_origins=config.CORS_ORIGINS,
    logger=True,
    engineio_logger=True
)

# Data Models
class OperationType(str, Enum):
    INSERT = "insert"
    DELETE = "delete"
    RETAIN = "retain"
    ANNOTATION_CREATE = "annotation_create"
    ANNOTATION_UPDATE = "annotation_update"
    ANNOTATION_DELETE = "annotation_delete"
    CURSOR_MOVE = "cursor_move"
    SELECTION_CHANGE = "selection_change"

class UserRole(str, Enum):
    VIEWER = "viewer"
    ANNOTATOR = "annotator"
    REVIEWER = "reviewer"
    ADMIN = "admin"

@dataclass
class Operation:
    """Represents a single operation in the operational transformation system"""
    id: str
    type: OperationType
    user_id: str
    timestamp: float
    data: Dict[str, Any]
    position: Optional[int] = None
    length: Optional[int] = None
    content: Optional[str] = None

@dataclass
class User:
    """Represents a connected user"""
    id: str
    name: str
    email: str
    role: UserRole
    avatar_url: Optional[str] = None
    cursor_position: Optional[Dict[str, Any]] = None
    selection: Optional[Dict[str, Any]] = None
    last_seen: float = None

@dataclass
class AnnotationLock:
    """Represents a lock on an annotation"""
    annotation_id: str
    user_id: str
    locked_at: float
    expires_at: float

@dataclass
class CollaborationSession:
    """Represents a collaboration session"""
    id: str
    project_id: str
    dataset_id: str
    created_at: float
    users: Dict[str, User]
    operations: List[Operation]
    locks: Dict[str, AnnotationLock]
    document_state: Dict[str, Any]

# In-memory session storage (in production, use Redis or database)
active_sessions: Dict[str, CollaborationSession] = {}
user_sessions: Dict[str, str] = {}  # user_id -> session_id

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    global redis_client
    
    # Startup
    logger.info("Starting Collaboration Service...")
    redis_client = redis.from_url(config.REDIS_URL)
    
    yield
    
    # Shutdown
    logger.info("Shutting down Collaboration Service...")
    if redis_client:
        await redis_client.close()

# FastAPI app
app = FastAPI(
    title="AnnotateAI Collaboration Service",
    description="Real-time collaboration with operational transformation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Socket.IO
socket_app = socketio.ASGIApp(sio, app)

# Operational Transformation Functions
def transform_operation(op1: Operation, op2: Operation) -> tuple[Operation, Operation]:
    """
    Transform two concurrent operations for conflict resolution
    Implements basic operational transformation for text operations
    """
    # Handle annotation operations
    if op1.type in [OperationType.ANNOTATION_CREATE, OperationType.ANNOTATION_UPDATE, OperationType.ANNOTATION_DELETE]:
        if op2.type in [OperationType.ANNOTATION_CREATE, OperationType.ANNOTATION_UPDATE, OperationType.ANNOTATION_DELETE]:
            # Annotation operations are independent unless they affect the same annotation
            if op1.data.get('annotation_id') == op2.data.get('annotation_id'):
                # Same annotation - later timestamp wins
                if op1.timestamp > op2.timestamp:
                    return op1, None
                else:
                    return None, op2
            else:
                # Different annotations - both operations can proceed
                return op1, op2
    
    # Handle text operations (insert/delete/retain)
    if op1.type == OperationType.INSERT and op2.type == OperationType.INSERT:
        if op1.position <= op2.position:
            # op2 position needs to be adjusted
            op2_transformed = Operation(
                id=op2.id,
                type=op2.type,
                user_id=op2.user_id,
                timestamp=op2.timestamp,
                data=op2.data,
                position=op2.position + len(op1.content or ""),
                content=op2.content
            )
            return op1, op2_transformed
        else:
            # op1 position needs to be adjusted
            op1_transformed = Operation(
                id=op1.id,
                type=op1.type,
                user_id=op1.user_id,
                timestamp=op1.timestamp,
                data=op1.data,
                position=op1.position + len(op2.content or ""),
                content=op1.content
            )
            return op1_transformed, op2
    
    elif op1.type == OperationType.DELETE and op2.type == OperationType.DELETE:
        # Handle concurrent deletes
        if op1.position < op2.position:
            if op1.position + op1.length <= op2.position:
                # Non-overlapping deletes
                op2_transformed = Operation(
                    id=op2.id,
                    type=op2.type,
                    user_id=op2.user_id,
                    timestamp=op2.timestamp,
                    data=op2.data,
                    position=op2.position - op1.length,
                    length=op2.length
                )
                return op1, op2_transformed
            else:
                # Overlapping deletes - merge them
                new_length = max(op1.position + op1.length, op2.position + op2.length) - op1.position
                merged_op = Operation(
                    id=op1.id,
                    type=op1.type,
                    user_id=op1.user_id,
                    timestamp=min(op1.timestamp, op2.timestamp),
                    data=op1.data,
                    position=op1.position,
                    length=new_length
                )
                return merged_op, None
        else:
            # Similar logic but positions reversed
            return transform_operation(op2, op1)[::-1]
    
    elif op1.type == OperationType.INSERT and op2.type == OperationType.DELETE:
        if op1.position <= op2.position:
            op2_transformed = Operation(
                id=op2.id,
                type=op2.type,
                user_id=op2.user_id,
                timestamp=op2.timestamp,
                data=op2.data,
                position=op2.position + len(op1.content or ""),
                length=op2.length
            )
            return op1, op2_transformed
        elif op1.position >= op2.position + op2.length:
            op1_transformed = Operation(
                id=op1.id,
                type=op1.type,
                user_id=op1.user_id,
                timestamp=op1.timestamp,
                data=op1.data,
                position=op1.position - op2.length,
                content=op1.content
            )
            return op1_transformed, op2
        else:
            # Insert position is within delete range - adjust insert position
            op1_transformed = Operation(
                id=op1.id,
                type=op1.type,
                user_id=op1.user_id,
                timestamp=op1.timestamp,
                data=op1.data,
                position=op2.position,
                content=op1.content
            )
            return op1_transformed, op2
    
    elif op1.type == OperationType.DELETE and op2.type == OperationType.INSERT:
        return transform_operation(op2, op1)[::-1]
    
    # Default case - no transformation needed
    return op1, op2

def apply_operation(document_state: Dict[str, Any], operation: Operation) -> Dict[str, Any]:
    """Apply an operation to the document state"""
    new_state = document_state.copy()
    
    if operation.type == OperationType.ANNOTATION_CREATE:
        if 'annotations' not in new_state:
            new_state['annotations'] = {}
        new_state['annotations'][operation.data['annotation_id']] = operation.data
    
    elif operation.type == OperationType.ANNOTATION_UPDATE:
        if 'annotations' in new_state and operation.data['annotation_id'] in new_state['annotations']:
            new_state['annotations'][operation.data['annotation_id']].update(operation.data)
    
    elif operation.type == OperationType.ANNOTATION_DELETE:
        if 'annotations' in new_state and operation.data['annotation_id'] in new_state['annotations']:
            del new_state['annotations'][operation.data['annotation_id']]
    
    elif operation.type == OperationType.INSERT:
        # Handle text insertion (simplified)
        if 'text' not in new_state:
            new_state['text'] = ""
        pos = operation.position or 0
        content = operation.content or ""
        new_state['text'] = new_state['text'][:pos] + content + new_state['text'][pos:]
    
    elif operation.type == OperationType.DELETE:
        # Handle text deletion (simplified)
        if 'text' in new_state:
            pos = operation.position or 0
            length = operation.length or 0
            new_state['text'] = new_state['text'][:pos] + new_state['text'][pos + length:]
    
    return new_state

# Session management functions
async def create_session(project_id: str, dataset_id: str, user: User) -> str:
    """Create a new collaboration session"""
    session_id = str(uuid.uuid4())
    
    session = CollaborationSession(
        id=session_id,
        project_id=project_id,
        dataset_id=dataset_id,
        created_at=time.time(),
        users={user.id: user},
        operations=[],
        locks={},
        document_state={}
    )
    
    active_sessions[session_id] = session
    user_sessions[user.id] = session_id
    
    # Store in Redis for persistence
    await redis_client.setex(
        f"session:{session_id}",
        config.SESSION_TIMEOUT,
        json.dumps(asdict(session), default=str)
    )
    
    logger.info(f"Created session {session_id} for project {project_id}")
    return session_id

async def join_session(session_id: str, user: User) -> bool:
    """Add user to existing session"""
    if session_id not in active_sessions:
        return False
    
    session = active_sessions[session_id]
    
    if len(session.users) >= config.MAX_ROOM_SIZE:
        return False
    
    session.users[user.id] = user
    user_sessions[user.id] = session_id
    
    # Update Redis
    await redis_client.setex(
        f"session:{session_id}",
        config.SESSION_TIMEOUT,
        json.dumps(asdict(session), default=str)
    )
    
    logger.info(f"User {user.id} joined session {session_id}")
    return True

async def leave_session(user_id: str):
    """Remove user from session"""
    if user_id not in user_sessions:
        return
    
    session_id = user_sessions[user_id]
    session = active_sessions.get(session_id)
    
    if session and user_id in session.users:
        del session.users[user_id]
        del user_sessions[user_id]
        
        # Release any locks held by this user
        locks_to_remove = [lock_id for lock_id, lock in session.locks.items() if lock.user_id == user_id]
        for lock_id in locks_to_remove:
            del session.locks[lock_id]
        
        # Update Redis
        await redis_client.setex(
            f"session:{session_id}",
            config.SESSION_TIMEOUT,
            json.dumps(asdict(session), default=str)
        )
        
        logger.info(f"User {user_id} left session {session_id}")

async def broadcast_operation(session_id: str, operation: Operation, exclude_user: Optional[str] = None):
    """Broadcast operation to all users in session"""
    session = active_sessions.get(session_id)
    if not session:
        return
    
    # Add operation to session history
    session.operations.append(operation)
    
    # Keep only recent operations
    if len(session.operations) > config.OPERATION_HISTORY_SIZE:
        session.operations = session.operations[-config.OPERATION_HISTORY_SIZE:]
    
    # Apply operation to document state
    session.document_state = apply_operation(session.document_state, operation)
    
    # Broadcast to all users except sender
    for user_id in session.users:
        if user_id != exclude_user:
            await sio.emit('operation', asdict(operation), room=f"user_{user_id}")
    
    # Update Redis
    await redis_client.setex(
        f"session:{session_id}",
        config.SESSION_TIMEOUT,
        json.dumps(asdict(session), default=str)
    )

# Socket.IO event handlers
@sio.event
async def connect(sid, environ, auth):
    """Handle client connection"""
    logger.info(f"Client {sid} connected")
    
    # In production, validate auth token here
    user_id = auth.get('user_id') if auth else None
    if not user_id:
        logger.warning(f"Client {sid} connected without user_id")
        await sio.disconnect(sid)
        return False
    
    # Store user session mapping
    await sio.save_session(sid, {'user_id': user_id})
    logger.info(f"Client {sid} authenticated as user {user_id}")

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    session = await sio.get_session(sid)
    user_id = session.get('user_id')
    
    if user_id:
        await leave_session(user_id)
        logger.info(f"Client {sid} (user {user_id}) disconnected")

@sio.event
async def join_collaboration(sid, data):
    """Handle user joining a collaboration session"""
    session = await sio.get_session(sid)
    user_id = session.get('user_id')
    
    if not user_id:
        await sio.emit('error', {'message': 'Not authenticated'}, room=sid)
        return
    
    project_id = data.get('project_id')
    dataset_id = data.get('dataset_id')
    user_data = data.get('user', {})
    
    if not project_id or not dataset_id:
        await sio.emit('error', {'message': 'Missing project_id or dataset_id'}, room=sid)
        return
    
    # Create user object
    user = User(
        id=user_id,
        name=user_data.get('name', 'Anonymous'),
        email=user_data.get('email', ''),
        role=UserRole(user_data.get('role', 'annotator')),
        avatar_url=user_data.get('avatar_url'),
        last_seen=time.time()
    )
    
    # Find existing session or create new one
    session_id = data.get('session_id')
    if session_id and session_id in active_sessions:
        success = await join_session(session_id, user)
        if not success:
            await sio.emit('error', {'message': 'Failed to join session'}, room=sid)
            return
    else:
        session_id = await create_session(project_id, dataset_id, user)
    
    # Join socket room
    await sio.enter_room(sid, f"session_{session_id}")
    await sio.enter_room(sid, f"user_{user_id}")
    
    # Send session state to user
    collaboration_session = active_sessions[session_id]
    await sio.emit('session_joined', {
        'session_id': session_id,
        'users': {uid: asdict(u) for uid, u in collaboration_session.users.items()},
        'document_state': collaboration_session.document_state,
        'operations': [asdict(op) for op in collaboration_session.operations[-50:]]  # Last 50 ops
    }, room=sid)
    
    # Notify other users
    await sio.emit('user_joined', asdict(user), room=f"session_{session_id}", skip_sid=sid)

@sio.event
async def operation(sid, data):
    """Handle incoming operation from client"""
    session = await sio.get_session(sid)
    user_id = session.get('user_id')
    session_id = user_sessions.get(user_id)
    
    if not session_id or session_id not in active_sessions:
        await sio.emit('error', {'message': 'Not in a collaboration session'}, room=sid)
        return
    
    # Create operation object
    op = Operation(
        id=data.get('id', str(uuid.uuid4())),
        type=OperationType(data['type']),
        user_id=user_id,
        timestamp=time.time(),
        data=data.get('data', {}),
        position=data.get('position'),
        length=data.get('length'),
        content=data.get('content')
    )
    
    # Apply operational transformation if needed
    collaboration_session = active_sessions[session_id]
    
    # Transform against recent operations
    for existing_op in reversed(collaboration_session.operations[-10:]):  # Check last 10 ops
        if existing_op.user_id != user_id and existing_op.timestamp > op.timestamp - 5:  # 5 second window
            op, transformed_existing = transform_operation(op, existing_op)
            if op is None:
                # Operation was cancelled due to conflict
                await sio.emit('operation_cancelled', {'operation_id': data.get('id')}, room=sid)
                return
    
    # Broadcast transformed operation
    await broadcast_operation(session_id, op, exclude_user=user_id)

@sio.event
async def cursor_move(sid, data):
    """Handle cursor movement"""
    session = await sio.get_session(sid)
    user_id = session.get('user_id')
    session_id = user_sessions.get(user_id)
    
    if not session_id or session_id not in active_sessions:
        return
    
    # Update user cursor position
    collaboration_session = active_sessions[session_id]
    if user_id in collaboration_session.users:
        collaboration_session.users[user_id].cursor_position = data
        collaboration_session.users[user_id].last_seen = time.time()
    
    # Broadcast cursor position
    await sio.emit('cursor_moved', {
        'user_id': user_id,
        'position': data
    }, room=f"session_{session_id}", skip_sid=sid)

@sio.event
async def lock_annotation(sid, data):
    """Handle annotation locking"""
    session = await sio.get_session(sid)
    user_id = session.get('user_id')
    session_id = user_sessions.get(user_id)
    
    if not session_id or session_id not in active_sessions:
        await sio.emit('error', {'message': 'Not in a collaboration session'}, room=sid)
        return
    
    annotation_id = data.get('annotation_id')
    if not annotation_id:
        await sio.emit('error', {'message': 'Missing annotation_id'}, room=sid)
        return
    
    collaboration_session = active_sessions[session_id]
    
    # Check if annotation is already locked
    if annotation_id in collaboration_session.locks:
        existing_lock = collaboration_session.locks[annotation_id]
        if existing_lock.user_id != user_id and existing_lock.expires_at > time.time():
            await sio.emit('lock_failed', {
                'annotation_id': annotation_id,
                'locked_by': existing_lock.user_id
            }, room=sid)
            return
    
    # Create new lock
    lock = AnnotationLock(
        annotation_id=annotation_id,
        user_id=user_id,
        locked_at=time.time(),
        expires_at=time.time() + 300  # 5 minute lock
    )
    
    collaboration_session.locks[annotation_id] = lock
    
    # Broadcast lock
    await sio.emit('annotation_locked', asdict(lock), room=f"session_{session_id}")

@sio.event
async def unlock_annotation(sid, data):
    """Handle annotation unlocking"""
    session = await sio.get_session(sid)
    user_id = session.get('user_id')
    session_id = user_sessions.get(user_id)
    
    if not session_id or session_id not in active_sessions:
        return
    
    annotation_id = data.get('annotation_id')
    collaboration_session = active_sessions[session_id]
    
    if annotation_id in collaboration_session.locks:
        lock = collaboration_session.locks[annotation_id]
        if lock.user_id == user_id:
            del collaboration_session.locks[annotation_id]
            await sio.emit('annotation_unlocked', {
                'annotation_id': annotation_id,
                'user_id': user_id
            }, room=f"session_{session_id}")

# REST API endpoints
@app.get("/sessions/{session_id}")
async def get_session_info(session_id: str):
    """Get collaboration session information"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    return {
        "id": session.id,
        "project_id": session.project_id,
        "dataset_id": session.dataset_id,
        "created_at": session.created_at,
        "user_count": len(session.users),
        "operation_count": len(session.operations),
        "active_locks": len(session.locks)
    }

@app.get("/sessions")
async def list_sessions():
    """List all active collaboration sessions"""
    return [
        {
            "id": session.id,
            "project_id": session.project_id,
            "dataset_id": session.dataset_id,
            "user_count": len(session.users),
            "created_at": session.created_at
        }
        for session in active_sessions.values()
    ]

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "collaboration-service",
        "active_sessions": len(active_sessions),
        "total_users": sum(len(s.users) for s in active_sessions.values())
    }

if __name__ == "__main__":
    uvicorn.run(socket_app, host="0.0.0.0", port=8011) 