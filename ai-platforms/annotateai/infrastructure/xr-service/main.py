#!/usr/bin/env python3
"""
AnnotateAI XR/AR Service
Advanced Extended Reality integration for immersive annotation experiences
"""

import asyncio
import logging
import os
import time
import json
import uuid
import math
from pathlib import Path
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from dataclasses import dataclass, asdict
from enum import Enum
import base64

import numpy as np
from scipy.spatial.transform import Rotation as R
from scipy.spatial.distance import cdist
import cv2
from PIL import Image

# FastAPI and web framework
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# WebRTC and real-time communication
import aiortc
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCDataChannel
from aiortc.contrib.media import MediaBlackhole, MediaPlayer, MediaRecorder

# Audio processing for voice commands
import speech_recognition as sr
import pyttsx3
import soundfile as sf
import librosa
import whisper

# Computer vision for hand tracking
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# Machine learning
import torch
import torch.nn as nn
import torch.nn.functional as F
import transformers
from transformers import pipeline, AutoProcessor, AutoModel

# 3D mathematics and spatial computing
import quaternion
import trimesh
import open3d as o3d

# Database and storage
import redis
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float, Boolean, LargeBinary, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import UUID, JSONB

# Monitoring
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import psutil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment configuration
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/annotateai")
MODEL_CACHE_DIR = os.getenv("MODEL_CACHE_DIR", "/app/xr_models")
SPATIAL_ANCHOR_STORAGE = os.getenv("SPATIAL_ANCHOR_STORAGE", "/app/spatial_anchors")
AUDIO_TEMP_DIR = os.getenv("AUDIO_TEMP_DIR", "/tmp/xr_audio")

# Prometheus metrics
XR_SESSIONS_TOTAL = Counter('xr_sessions_total', 'Total XR sessions', ['session_type'])
XR_SESSION_DURATION = Histogram('xr_session_duration_seconds', 'XR session duration')
ACTIVE_XR_SESSIONS = Gauge('active_xr_sessions', 'Active XR sessions')
SPATIAL_ANCHORS_CREATED = Counter('spatial_anchors_created_total', 'Total spatial anchors created')
HAND_GESTURES_RECOGNIZED = Counter('hand_gestures_recognized_total', 'Hand gestures recognized', ['gesture'])
VOICE_COMMANDS_PROCESSED = Counter('voice_commands_processed_total', 'Voice commands processed', ['command'])

class XRSessionType(str, Enum):
    """XR session types"""
    VR_IMMERSIVE = "vr_immersive"
    AR_OVERLAY = "ar_overlay"
    MIXED_REALITY = "mixed_reality"
    DESKTOP_3D = "desktop_3d"
    MOBILE_AR = "mobile_ar"

class XRDeviceType(str, Enum):
    """XR device types"""
    OCULUS_QUEST = "oculus_quest"
    HOLOLENS = "hololens"
    MAGIC_LEAP = "magic_leap"
    VARJO_AERO = "varjo_aero"
    HTCVIVE = "htc_vive"
    IPHONE_AR = "iphone_ar"
    ANDROID_AR = "android_ar"
    DESKTOP_BROWSER = "desktop_browser"

class GestureType(str, Enum):
    """Hand gesture types"""
    POINT = "point"
    GRAB = "grab"
    PINCH = "pinch"
    OPEN_PALM = "open_palm"
    FIST = "fist"
    THUMBS_UP = "thumbs_up"
    PEACE_SIGN = "peace_sign"
    OK_SIGN = "ok_sign"
    SWIPE_LEFT = "swipe_left"
    SWIPE_RIGHT = "swipe_right"
    DRAW = "draw"
    DELETE = "delete"

class VoiceCommand(str, Enum):
    """Voice command types"""
    START_ANNOTATION = "start_annotation"
    STOP_ANNOTATION = "stop_annotation"
    SAVE_ANNOTATION = "save_annotation"
    DELETE_ANNOTATION = "delete_annotation"
    SWITCH_TOOL = "switch_tool"
    ZOOM_IN = "zoom_in"
    ZOOM_OUT = "zoom_out"
    RESET_VIEW = "reset_view"
    SHARE_SESSION = "share_session"
    RECORD_SESSION = "record_session"

class HapticFeedbackType(str, Enum):
    """Haptic feedback patterns"""
    LIGHT_TAP = "light_tap"
    DOUBLE_TAP = "double_tap"
    LONG_PRESS = "long_press"
    VIBRATION_SHORT = "vibration_short"
    VIBRATION_LONG = "vibration_long"
    PULSE_PATTERN = "pulse_pattern"
    SUCCESS_FEEDBACK = "success_feedback"
    ERROR_FEEDBACK = "error_feedback"

# Database models
Base = declarative_base()

class XRSession(Base):
    __tablename__ = "xr_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    session_type = Column(String(50), nullable=False)
    device_type = Column(String(50), nullable=False)
    device_capabilities = Column(JSONB, nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    session_data = Column(JSONB, nullable=True)
    spatial_anchors = Column(JSONB, nullable=True)
    participants = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SpatialAnchor(Base):
    __tablename__ = "spatial_anchors"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), nullable=False)
    anchor_id = Column(String(100), nullable=False, unique=True)
    position = Column(JSONB, nullable=False)  # [x, y, z]
    rotation = Column(JSONB, nullable=False)  # [x, y, z, w] quaternion
    scale = Column(JSONB, nullable=False)     # [x, y, z]
    anchor_type = Column(String(50), nullable=False)
    annotation_data = Column(JSONB, nullable=True)
    persistence_duration = Column(Integer, default=86400)  # 24 hours
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

class XRAnnotation(Base):
    __tablename__ = "xr_annotations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), nullable=False)
    anchor_id = Column(UUID(as_uuid=True), nullable=True)
    annotation_type = Column(String(50), nullable=False)
    spatial_data = Column(JSONB, nullable=False)
    content = Column(Text, nullable=True)
    author_id = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic models
class Vector3(BaseModel):
    """3D vector representation"""
    x: float = Field(..., description="X coordinate")
    y: float = Field(..., description="Y coordinate") 
    z: float = Field(..., description="Z coordinate")

class Quaternion(BaseModel):
    """Quaternion rotation representation"""
    x: float = Field(..., description="X component")
    y: float = Field(..., description="Y component")
    z: float = Field(..., description="Z component")
    w: float = Field(..., description="W component")

class Transform(BaseModel):
    """3D transformation"""
    position: Vector3 = Field(..., description="Position")
    rotation: Quaternion = Field(..., description="Rotation")
    scale: Vector3 = Field(default=Vector3(x=1, y=1, z=1), description="Scale")

class XRDeviceCapabilities(BaseModel):
    """XR device capabilities"""
    has_6dof_tracking: bool = Field(..., description="6DOF head tracking")
    has_hand_tracking: bool = Field(..., description="Hand tracking support")
    has_eye_tracking: bool = Field(..., description="Eye tracking support")
    has_haptic_feedback: bool = Field(..., description="Haptic feedback support")
    has_spatial_audio: bool = Field(..., description="Spatial audio support")
    has_voice_input: bool = Field(..., description="Voice input support")
    display_resolution: Tuple[int, int] = Field(..., description="Display resolution")
    field_of_view: float = Field(..., description="Field of view in degrees")
    refresh_rate: float = Field(..., description="Display refresh rate")
    tracking_area_size: Vector3 = Field(..., description="Tracking area dimensions")

class HandPose(BaseModel):
    """Hand pose data"""
    landmarks: List[Vector3] = Field(..., description="Hand landmark positions")
    gesture: GestureType = Field(..., description="Recognized gesture")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Gesture confidence")
    hand_type: str = Field(..., description="Left or right hand")

class XRSessionConfig(BaseModel):
    """XR session configuration"""
    session_type: XRSessionType = Field(..., description="Session type")
    device_type: XRDeviceType = Field(..., description="Device type")
    enable_hand_tracking: bool = Field(default=True, description="Enable hand tracking")
    enable_voice_commands: bool = Field(default=True, description="Enable voice commands")
    enable_haptic_feedback: bool = Field(default=True, description="Enable haptic feedback")
    enable_spatial_audio: bool = Field(default=True, description="Enable spatial audio")
    collaborative_mode: bool = Field(default=False, description="Enable collaborative mode")
    max_participants: int = Field(default=8, ge=1, le=50, description="Maximum participants")
    spatial_anchor_persistence: bool = Field(default=True, description="Persist spatial anchors")
    recording_enabled: bool = Field(default=False, description="Enable session recording")

class XRSessionRequest(BaseModel):
    """XR session creation request"""
    user_id: str = Field(..., description="User ID")
    config: XRSessionConfig = Field(..., description="Session configuration")
    device_capabilities: XRDeviceCapabilities = Field(..., description="Device capabilities")
    project_id: Optional[str] = Field(default=None, description="Project ID for collaboration")

class SpatialAnchorData(BaseModel):
    """Spatial anchor data"""
    anchor_id: str = Field(..., description="Unique anchor ID")
    transform: Transform = Field(..., description="Anchor transformation")
    anchor_type: str = Field(..., description="Anchor type")
    annotation_data: Optional[Dict[str, Any]] = Field(default=None, description="Associated annotation data")
    persistence_duration: int = Field(default=86400, description="Persistence duration in seconds")

class VoiceCommandData(BaseModel):
    """Voice command data"""
    command: VoiceCommand = Field(..., description="Voice command type")
    parameters: Optional[Dict[str, Any]] = Field(default=None, description="Command parameters")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Recognition confidence")
    language: str = Field(default="en-US", description="Language code")

class HapticFeedbackData(BaseModel):
    """Haptic feedback data"""
    feedback_type: HapticFeedbackType = Field(..., description="Feedback type")
    intensity: float = Field(default=1.0, ge=0.0, le=1.0, description="Feedback intensity")
    duration: float = Field(default=0.1, ge=0.01, le=5.0, description="Duration in seconds")
    position: Optional[Vector3] = Field(default=None, description="Spatial position for feedback")

class HandGestureRecognizer:
    """Hand gesture recognition using MediaPipe"""
    
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Gesture recognition model
        self.gesture_classifier = self._load_gesture_classifier()
    
    def _load_gesture_classifier(self):
        """Load gesture classification model"""
        # In production, this would load a trained gesture recognition model
        # For now, we'll use a simple heuristic-based classifier
        return None
    
    def process_frame(self, frame: np.ndarray) -> List[HandPose]:
        """Process video frame for hand detection and gesture recognition"""
        
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_frame)
        
        hand_poses = []
        
        if results.multi_hand_landmarks:
            for i, hand_landmarks in enumerate(results.multi_hand_landmarks):
                # Extract landmark positions
                landmarks = []
                for landmark in hand_landmarks.landmark:
                    landmarks.append(Vector3(
                        x=landmark.x,
                        y=landmark.y,
                        z=landmark.z
                    ))
                
                # Recognize gesture
                gesture, confidence = self._recognize_gesture(landmarks)
                
                # Determine hand type
                hand_type = "left" if i == 0 else "right"
                if results.multi_handedness:
                    hand_type = results.multi_handedness[i].classification[0].label.lower()
                
                hand_pose = HandPose(
                    landmarks=landmarks,
                    gesture=gesture,
                    confidence=confidence,
                    hand_type=hand_type
                )
                
                hand_poses.append(hand_pose)
                
                HAND_GESTURES_RECOGNIZED.labels(gesture=gesture.value).inc()
        
        return hand_poses
    
    def _recognize_gesture(self, landmarks: List[Vector3]) -> Tuple[GestureType, float]:
        """Recognize gesture from hand landmarks"""
        
        if len(landmarks) < 21:  # MediaPipe uses 21 landmarks
            return GestureType.OPEN_PALM, 0.0
        
        # Simple heuristic-based gesture recognition
        # In production, this would use a trained neural network
        
        # Get key landmark positions
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]
        
        index_mcp = landmarks[5]
        middle_mcp = landmarks[9]
        ring_mcp = landmarks[13]
        pinky_mcp = landmarks[17]
        
        # Calculate finger extensions
        fingers_extended = []
        
        # Thumb (different calculation due to orientation)
        if thumb_tip.x > landmarks[3].x:  # Thumb tip beyond thumb IP
            fingers_extended.append(True)
        else:
            fingers_extended.append(False)
        
        # Other fingers
        for tip, mcp in [(index_tip, index_mcp), (middle_tip, middle_mcp), 
                        (ring_tip, ring_mcp), (pinky_tip, pinky_mcp)]:
            if tip.y < mcp.y:  # Tip above MCP (extended)
                fingers_extended.append(True)
            else:
                fingers_extended.append(False)
        
        # Gesture classification
        extended_count = sum(fingers_extended)
        
        if extended_count == 0:
            return GestureType.FIST, 0.9
        elif extended_count == 5:
            return GestureType.OPEN_PALM, 0.9
        elif extended_count == 1 and fingers_extended[1]:  # Only index
            return GestureType.POINT, 0.8
        elif extended_count == 2 and fingers_extended[0] and fingers_extended[1]:  # Thumb and index
            return GestureType.PINCH, 0.8
        elif extended_count == 1 and fingers_extended[0]:  # Only thumb
            return GestureType.THUMBS_UP, 0.8
        elif extended_count == 2 and fingers_extended[1] and fingers_extended[2]:  # Index and middle
            return GestureType.PEACE_SIGN, 0.8
        elif (extended_count == 3 and fingers_extended[0] and 
              fingers_extended[1] and fingers_extended[2]):  # Thumb, index, middle
            return GestureType.OK_SIGN, 0.7
        else:
            return GestureType.OPEN_PALM, 0.5

class VoiceCommandProcessor:
    """Voice command processing using speech recognition"""
    
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        
        # Load Whisper model for better accuracy
        self.whisper_model = whisper.load_model("base")
        
        # Text-to-speech for feedback
        self.tts_engine = pyttsx3.init()
        self.tts_engine.setProperty('rate', 150)
        
        # Command patterns
        self.command_patterns = {
            VoiceCommand.START_ANNOTATION: ["start annotation", "begin annotation", "start annotating"],
            VoiceCommand.STOP_ANNOTATION: ["stop annotation", "end annotation", "finish annotation"],
            VoiceCommand.SAVE_ANNOTATION: ["save annotation", "save this", "confirm annotation"],
            VoiceCommand.DELETE_ANNOTATION: ["delete annotation", "remove annotation", "cancel annotation"],
            VoiceCommand.SWITCH_TOOL: ["switch tool", "change tool", "select tool"],
            VoiceCommand.ZOOM_IN: ["zoom in", "zoom closer", "magnify"],
            VoiceCommand.ZOOM_OUT: ["zoom out", "zoom back", "shrink"],
            VoiceCommand.RESET_VIEW: ["reset view", "reset camera", "center view"],
            VoiceCommand.SHARE_SESSION: ["share session", "invite user", "collaborate"],
            VoiceCommand.RECORD_SESSION: ["start recording", "record session", "begin recording"]
        }
    
    def process_audio(self, audio_data: bytes) -> Optional[VoiceCommandData]:
        """Process audio data for voice command recognition"""
        
        try:
            # Save audio to temporary file
            audio_path = Path(AUDIO_TEMP_DIR) / f"audio_{uuid.uuid4().hex}.wav"
            audio_path.parent.mkdir(exist_ok=True)
            
            with open(audio_path, "wb") as f:
                f.write(audio_data)
            
            # Transcribe using Whisper
            result = self.whisper_model.transcribe(str(audio_path))
            transcription = result["text"].lower().strip()
            
            # Clean up temporary file
            audio_path.unlink()
            
            # Match command patterns
            command, confidence = self._match_command(transcription)
            
            if command:
                VOICE_COMMANDS_PROCESSED.labels(command=command.value).inc()
                
                return VoiceCommandData(
                    command=command,
                    confidence=confidence,
                    parameters=self._extract_parameters(transcription, command)
                )
            
            return None
            
        except Exception as e:
            logger.error(f"Voice command processing failed: {e}")
            return None
    
    def _match_command(self, transcription: str) -> Tuple[Optional[VoiceCommand], float]:
        """Match transcription to command patterns"""
        
        best_match = None
        best_confidence = 0.0
        
        for command, patterns in self.command_patterns.items():
            for pattern in patterns:
                # Simple substring matching
                if pattern in transcription:
                    confidence = len(pattern) / len(transcription)
                    if confidence > best_confidence:
                        best_match = command
                        best_confidence = confidence
        
        return best_match, best_confidence
    
    def _extract_parameters(self, transcription: str, command: VoiceCommand) -> Dict[str, Any]:
        """Extract parameters from transcription based on command"""
        
        parameters = {}
        
        if command == VoiceCommand.SWITCH_TOOL:
            # Extract tool name
            tools = ["brush", "eraser", "select", "zoom", "pan", "measure"]
            for tool in tools:
                if tool in transcription:
                    parameters["tool"] = tool
                    break
        
        elif command == VoiceCommand.ZOOM_IN or command == VoiceCommand.ZOOM_OUT:
            # Extract zoom factor
            import re
            numbers = re.findall(r'\d+', transcription)
            if numbers:
                parameters["factor"] = int(numbers[0])
        
        return parameters
    
    def speak_feedback(self, message: str):
        """Provide voice feedback"""
        try:
            self.tts_engine.say(message)
            self.tts_engine.runAndWait()
        except Exception as e:
            logger.error(f"TTS feedback failed: {e}")

class SpatialAnchorManager:
    """Manage spatial anchors and persistence"""
    
    def __init__(self, storage_path: str):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(exist_ok=True)
        self.active_anchors = {}
    
    def create_anchor(
        self,
        session_id: str,
        transform: Transform,
        anchor_type: str,
        annotation_data: Optional[Dict[str, Any]] = None,
        persistence_duration: int = 86400
    ) -> str:
        """Create a new spatial anchor"""
        
        anchor_id = str(uuid.uuid4())
        
        anchor_data = {
            'id': anchor_id,
            'session_id': session_id,
            'transform': asdict(transform),
            'anchor_type': anchor_type,
            'annotation_data': annotation_data,
            'created_at': datetime.utcnow().isoformat(),
            'expires_at': (datetime.utcnow() + timedelta(seconds=persistence_duration)).isoformat()
        }
        
        # Save to file system
        anchor_file = self.storage_path / f"{anchor_id}.json"
        with open(anchor_file, 'w') as f:
            json.dump(anchor_data, f, indent=2)
        
        # Keep in memory for quick access
        self.active_anchors[anchor_id] = anchor_data
        
        SPATIAL_ANCHORS_CREATED.inc()
        
        logger.info(f"Created spatial anchor {anchor_id} for session {session_id}")
        
        return anchor_id
    
    def get_anchor(self, anchor_id: str) -> Optional[Dict[str, Any]]:
        """Get spatial anchor data"""
        
        # Check memory first
        if anchor_id in self.active_anchors:
            return self.active_anchors[anchor_id]
        
        # Load from file system
        anchor_file = self.storage_path / f"{anchor_id}.json"
        if anchor_file.exists():
            with open(anchor_file, 'r') as f:
                anchor_data = json.load(f)
            
            # Check if expired
            expires_at = datetime.fromisoformat(anchor_data['expires_at'])
            if expires_at < datetime.utcnow():
                self.delete_anchor(anchor_id)
                return None
            
            self.active_anchors[anchor_id] = anchor_data
            return anchor_data
        
        return None
    
    def update_anchor(
        self,
        anchor_id: str,
        transform: Optional[Transform] = None,
        annotation_data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Update spatial anchor"""
        
        anchor_data = self.get_anchor(anchor_id)
        if not anchor_data:
            return False
        
        if transform:
            anchor_data['transform'] = asdict(transform)
        
        if annotation_data is not None:
            anchor_data['annotation_data'] = annotation_data
        
        # Save updates
        anchor_file = self.storage_path / f"{anchor_id}.json"
        with open(anchor_file, 'w') as f:
            json.dump(anchor_data, f, indent=2)
        
        self.active_anchors[anchor_id] = anchor_data
        
        return True
    
    def delete_anchor(self, anchor_id: str) -> bool:
        """Delete spatial anchor"""
        
        # Remove from memory
        if anchor_id in self.active_anchors:
            del self.active_anchors[anchor_id]
        
        # Remove from file system
        anchor_file = self.storage_path / f"{anchor_id}.json"
        if anchor_file.exists():
            anchor_file.unlink()
            return True
        
        return False
    
    def get_session_anchors(self, session_id: str) -> List[Dict[str, Any]]:
        """Get all anchors for a session"""
        
        session_anchors = []
        
        # Check all anchor files
        for anchor_file in self.storage_path.glob("*.json"):
            with open(anchor_file, 'r') as f:
                anchor_data = json.load(f)
            
            if anchor_data.get('session_id') == session_id:
                # Check if expired
                expires_at = datetime.fromisoformat(anchor_data['expires_at'])
                if expires_at < datetime.utcnow():
                    self.delete_anchor(anchor_data['id'])
                    continue
                
                session_anchors.append(anchor_data)
        
        return session_anchors
    
    def cleanup_expired_anchors(self):
        """Clean up expired anchors"""
        
        now = datetime.utcnow()
        expired_anchors = []
        
        for anchor_file in self.storage_path.glob("*.json"):
            with open(anchor_file, 'r') as f:
                anchor_data = json.load(f)
            
            expires_at = datetime.fromisoformat(anchor_data['expires_at'])
            if expires_at < now:
                expired_anchors.append(anchor_data['id'])
        
        for anchor_id in expired_anchors:
            self.delete_anchor(anchor_id)
        
        logger.info(f"Cleaned up {len(expired_anchors)} expired spatial anchors")

class XRCollaborationManager:
    """Manage collaborative XR sessions"""
    
    def __init__(self):
        self.active_sessions = {}
        self.session_participants = {}
        self.webrtc_connections = {}
    
    def create_collaborative_session(
        self,
        session_id: str,
        host_user_id: str,
        max_participants: int = 8
    ) -> Dict[str, Any]:
        """Create a collaborative XR session"""
        
        session_data = {
            'session_id': session_id,
            'host_user_id': host_user_id,
            'participants': [host_user_id],
            'max_participants': max_participants,
            'created_at': datetime.utcnow().isoformat(),
            'shared_state': {},
            'spatial_anchors': {},
            'voice_chat_enabled': True,
            'spatial_audio_enabled': True
        }
        
        self.active_sessions[session_id] = session_data
        self.session_participants[session_id] = {host_user_id: {'role': 'host', 'joined_at': datetime.utcnow()}}
        
        return session_data
    
    def join_session(self, session_id: str, user_id: str) -> bool:
        """Join a collaborative session"""
        
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        
        if len(session['participants']) >= session['max_participants']:
            return False
        
        if user_id not in session['participants']:
            session['participants'].append(user_id)
            self.session_participants[session_id][user_id] = {
                'role': 'participant',
                'joined_at': datetime.utcnow()
            }
        
        return True
    
    def leave_session(self, session_id: str, user_id: str) -> bool:
        """Leave a collaborative session"""
        
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        
        if user_id in session['participants']:
            session['participants'].remove(user_id)
            
            if user_id in self.session_participants[session_id]:
                del self.session_participants[session_id][user_id]
            
            # If host leaves, promote another participant
            if user_id == session['host_user_id'] and session['participants']:
                session['host_user_id'] = session['participants'][0]
                self.session_participants[session_id][session['participants'][0]]['role'] = 'host'
            
            # Clean up empty session
            if not session['participants']:
                del self.active_sessions[session_id]
                del self.session_participants[session_id]
        
        return True
    
    def update_shared_state(
        self,
        session_id: str,
        user_id: str,
        state_update: Dict[str, Any]
    ) -> bool:
        """Update shared session state"""
        
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        
        if user_id not in session['participants']:
            return False
        
        # Merge state update
        session['shared_state'].update(state_update)
        
        return True
    
    def broadcast_to_session(
        self,
        session_id: str,
        message: Dict[str, Any],
        exclude_user: Optional[str] = None
    ) -> int:
        """Broadcast message to session participants"""
        
        if session_id not in self.active_sessions:
            return 0
        
        session = self.active_sessions[session_id]
        broadcast_count = 0
        
        for participant_id in session['participants']:
            if exclude_user and participant_id == exclude_user:
                continue
            
            # Send message to participant (would use WebSocket in practice)
            # self.send_to_user(participant_id, message)
            broadcast_count += 1
        
        return broadcast_count

class XRService:
    """Main XR service"""
    
    def __init__(self):
        self.redis_client = redis.from_url(REDIS_URL)
        self.active_sessions = {}
        
        # Initialize components
        self.hand_tracker = HandGestureRecognizer()
        self.voice_processor = VoiceCommandProcessor()
        self.spatial_anchor_manager = SpatialAnchorManager(SPATIAL_ANCHOR_STORAGE)
        self.collaboration_manager = XRCollaborationManager()
        
        # Create directories
        Path(MODEL_CACHE_DIR).mkdir(parents=True, exist_ok=True)
        Path(SPATIAL_ANCHOR_STORAGE).mkdir(parents=True, exist_ok=True)
        Path(AUDIO_TEMP_DIR).mkdir(parents=True, exist_ok=True)
        
        # Initialize database
        self.engine = create_engine(DATABASE_URL)
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        
        # Start background tasks
        asyncio.create_task(self._cleanup_expired_anchors())
    
    async def _cleanup_expired_anchors(self):
        """Background task to cleanup expired anchors"""
        while True:
            try:
                self.spatial_anchor_manager.cleanup_expired_anchors()
                await asyncio.sleep(3600)  # Run every hour
            except Exception as e:
                logger.error(f"Anchor cleanup failed: {e}")
                await asyncio.sleep(300)  # Retry in 5 minutes
    
    async def create_xr_session(self, request: XRSessionRequest) -> Dict[str, Any]:
        """Create a new XR session"""
        
        session_id = str(uuid.uuid4())
        
        XR_SESSIONS_TOTAL.labels(session_type=request.config.session_type.value).inc()
        ACTIVE_XR_SESSIONS.inc()
        
        # Create database record
        with self.SessionLocal() as db:
            db_session = XRSession(
                id=session_id,
                user_id=request.user_id,
                session_type=request.config.session_type.value,
                device_type=request.config.device_type.value,
                device_capabilities=asdict(request.device_capabilities),
                session_data={
                    'config': asdict(request.config),
                    'project_id': request.project_id
                }
            )
            db.add(db_session)
            db.commit()
        
        # Initialize session data
        session_data = {
            'session_id': session_id,
            'user_id': request.user_id,
            'config': request.config,
            'device_capabilities': request.device_capabilities,
            'start_time': datetime.utcnow(),
            'status': 'active',
            'spatial_anchors': {},
            'participants': [request.user_id] if request.config.collaborative_mode else [],
            'shared_objects': {}
        }
        
        self.active_sessions[session_id] = session_data
        
        # Set up collaborative session if requested
        if request.config.collaborative_mode:
            self.collaboration_manager.create_collaborative_session(
                session_id,
                request.user_id,
                request.config.max_participants
            )
        
        logger.info(f"Created XR session {session_id} for user {request.user_id}")
        
        return {
            'session_id': session_id,
            'status': 'created',
            'webrtc_config': self._get_webrtc_config(),
            'spatial_anchors': [],
            'collaborative_features': request.config.collaborative_mode
        }
    
    def _get_webrtc_config(self) -> Dict[str, Any]:
        """Get WebRTC configuration for real-time communication"""
        return {
            'iceServers': [
                {'urls': 'stun:stun.l.google.com:19302'},
                {'urls': 'stun:stun1.l.google.com:19302'}
            ],
            'iceCandidatePoolSize': 10
        }
    
    async def process_hand_tracking(
        self,
        session_id: str,
        frame_data: str
    ) -> List[HandPose]:
        """Process hand tracking data"""
        
        if session_id not in self.active_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Decode base64 frame
        frame_bytes = base64.b64decode(frame_data)
        frame_array = np.frombuffer(frame_bytes, dtype=np.uint8)
        frame = cv2.imdecode(frame_array, cv2.IMREAD_COLOR)
        
        # Process hand tracking
        hand_poses = self.hand_tracker.process_frame(frame)
        
        # Update session data
        session = self.active_sessions[session_id]
        session['last_hand_poses'] = hand_poses
        session['last_hand_update'] = datetime.utcnow()
        
        return hand_poses
    
    async def process_voice_command(
        self,
        session_id: str,
        audio_data: bytes
    ) -> Optional[VoiceCommandData]:
        """Process voice command"""
        
        if session_id not in self.active_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        command_data = self.voice_processor.process_audio(audio_data)
        
        if command_data:
            # Execute command
            await self._execute_voice_command(session_id, command_data)
        
        return command_data
    
    async def _execute_voice_command(
        self,
        session_id: str,
        command_data: VoiceCommandData
    ):
        """Execute voice command"""
        
        session = self.active_sessions[session_id]
        command = command_data.command
        
        if command == VoiceCommand.START_ANNOTATION:
            session['annotation_mode'] = True
            self.voice_processor.speak_feedback("Annotation mode started")
        
        elif command == VoiceCommand.STOP_ANNOTATION:
            session['annotation_mode'] = False
            self.voice_processor.speak_feedback("Annotation mode stopped")
        
        elif command == VoiceCommand.SAVE_ANNOTATION:
            # Save current annotation
            self.voice_processor.speak_feedback("Annotation saved")
        
        elif command == VoiceCommand.DELETE_ANNOTATION:
            # Delete current annotation
            self.voice_processor.speak_feedback("Annotation deleted")
        
        elif command == VoiceCommand.RESET_VIEW:
            session['camera_reset_requested'] = True
            self.voice_processor.speak_feedback("View reset")
        
        # Add more command implementations as needed
    
    async def create_spatial_anchor(
        self,
        session_id: str,
        anchor_data: SpatialAnchorData
    ) -> str:
        """Create a spatial anchor"""
        
        if session_id not in self.active_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        anchor_id = self.spatial_anchor_manager.create_anchor(
            session_id=session_id,
            transform=anchor_data.transform,
            anchor_type=anchor_data.anchor_type,
            annotation_data=anchor_data.annotation_data,
            persistence_duration=anchor_data.persistence_duration
        )
        
        # Update session
        session = self.active_sessions[session_id]
        session['spatial_anchors'][anchor_id] = anchor_data
        
        # Broadcast to collaborative session
        if session.get('collaborative_mode'):
            self.collaboration_manager.broadcast_to_session(
                session_id,
                {
                    'type': 'spatial_anchor_created',
                    'anchor_id': anchor_id,
                    'anchor_data': asdict(anchor_data)
                }
            )
        
        return anchor_id
    
    async def send_haptic_feedback(
        self,
        session_id: str,
        feedback_data: HapticFeedbackData
    ) -> bool:
        """Send haptic feedback"""
        
        if session_id not in self.active_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = self.active_sessions[session_id]
        
        # Check device capabilities
        if not session['device_capabilities'].has_haptic_feedback:
            return False
        
        # Queue haptic feedback (would be sent to device via WebRTC)
        haptic_command = {
            'type': 'haptic_feedback',
            'feedback_type': feedback_data.feedback_type.value,
            'intensity': feedback_data.intensity,
            'duration': feedback_data.duration,
            'position': asdict(feedback_data.position) if feedback_data.position else None,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Add to session queue
        if 'haptic_queue' not in session:
            session['haptic_queue'] = []
        
        session['haptic_queue'].append(haptic_command)
        
        return True
    
    async def join_collaborative_session(
        self,
        session_id: str,
        user_id: str
    ) -> bool:
        """Join collaborative session"""
        
        if session_id not in self.active_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        success = self.collaboration_manager.join_session(session_id, user_id)
        
        if success:
            # Update session participants
            session = self.active_sessions[session_id]
            if user_id not in session['participants']:
                session['participants'].append(user_id)
            
            # Broadcast join event
            self.collaboration_manager.broadcast_to_session(
                session_id,
                {
                    'type': 'user_joined',
                    'user_id': user_id,
                    'timestamp': datetime.utcnow().isoformat()
                },
                exclude_user=user_id
            )
        
        return success
    
    async def get_session_info(self, session_id: str) -> Dict[str, Any]:
        """Get session information"""
        
        if session_id not in self.active_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = self.active_sessions[session_id]
        
        # Get spatial anchors
        spatial_anchors = self.spatial_anchor_manager.get_session_anchors(session_id)
        
        return {
            'session_id': session_id,
            'user_id': session['user_id'],
            'status': session['status'],
            'start_time': session['start_time'].isoformat(),
            'participants': session.get('participants', []),
            'spatial_anchors': spatial_anchors,
            'device_capabilities': asdict(session['device_capabilities']),
            'collaborative_mode': len(session.get('participants', [])) > 1
        }
    
    async def end_session(self, session_id: str) -> bool:
        """End XR session"""
        
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        
        # Update database
        with self.SessionLocal() as db:
            db_session = db.query(XRSession).filter(XRSession.id == session_id).first()
            if db_session:
                db_session.end_time = datetime.utcnow()
                db_session.session_data = session.get('session_data', {})
                db.commit()
        
        # Clean up collaborative session
        if session.get('collaborative_mode'):
            self.collaboration_manager.leave_session(session_id, session['user_id'])
        
        # Record session duration
        duration = (datetime.utcnow() - session['start_time']).total_seconds()
        XR_SESSION_DURATION.observe(duration)
        
        # Remove from active sessions
        del self.active_sessions[session_id]
        
        ACTIVE_XR_SESSIONS.dec()
        
        logger.info(f"Ended XR session {session_id}")
        
        return True
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Get system statistics"""
        
        return {
            "active_sessions": len(self.active_sessions),
            "active_spatial_anchors": len(self.spatial_anchor_manager.active_anchors),
            "active_collaborative_sessions": len(self.collaboration_manager.active_sessions),
            "cpu_usage": psutil.cpu_percent(),
            "memory_usage": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent,
            "gpu_available": torch.cuda.is_available(),
            "mediapipe_available": True,
            "whisper_available": True
        }

# Initialize service
service = XRService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting AnnotateAI XR Service")
    yield
    logger.info("Shutting down AnnotateAI XR Service")

# Create FastAPI app
app = FastAPI(
    title="AnnotateAI XR Service",
    description="Advanced Extended Reality integration for immersive annotation experiences",
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

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "device": DEVICE,
        "mediapipe_available": True,
        "whisper_available": True
    }

@app.post("/xr/sessions")
async def create_xr_session(request: XRSessionRequest):
    """Create a new XR session"""
    return await service.create_xr_session(request)

@app.get("/xr/sessions/{session_id}")
async def get_xr_session(session_id: str):
    """Get XR session information"""
    return await service.get_session_info(session_id)

@app.delete("/xr/sessions/{session_id}")
async def end_xr_session(session_id: str):
    """End XR session"""
    success = await service.end_session(session_id)
    return {"success": success}

@app.post("/xr/sessions/{session_id}/hand-tracking")
async def process_hand_tracking(session_id: str, frame_data: dict):
    """Process hand tracking data"""
    hand_poses = await service.process_hand_tracking(session_id, frame_data["frame"])
    return {"hand_poses": [asdict(pose) for pose in hand_poses]}

@app.post("/xr/sessions/{session_id}/voice-command")
async def process_voice_command(session_id: str, audio_data: dict):
    """Process voice command"""
    audio_bytes = base64.b64decode(audio_data["audio"])
    command = await service.process_voice_command(session_id, audio_bytes)
    return {"command": asdict(command) if command else None}

@app.post("/xr/sessions/{session_id}/spatial-anchors")
async def create_spatial_anchor(session_id: str, anchor_data: SpatialAnchorData):
    """Create spatial anchor"""
    anchor_id = await service.create_spatial_anchor(session_id, anchor_data)
    return {"anchor_id": anchor_id}

@app.post("/xr/sessions/{session_id}/haptic-feedback")
async def send_haptic_feedback(session_id: str, feedback_data: HapticFeedbackData):
    """Send haptic feedback"""
    success = await service.send_haptic_feedback(session_id, feedback_data)
    return {"success": success}

@app.post("/xr/sessions/{session_id}/join")
async def join_collaborative_session(session_id: str, user_data: dict):
    """Join collaborative session"""
    success = await service.join_collaborative_session(session_id, user_data["user_id"])
    return {"success": success}

@app.get("/system/stats")
async def get_system_stats():
    """Get system statistics"""
    return service.get_system_stats()

@app.get("/metrics")
async def get_metrics():
    """Get Prometheus metrics"""
    from fastapi.responses import Response
    return Response(generate_latest(), media_type="text/plain")

@app.websocket("/xr/sessions/{session_id}/realtime")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time XR communication"""
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_json()
            
            message_type = data.get("type")
            
            if message_type == "hand_pose_update":
                # Handle real-time hand pose updates
                hand_poses = await service.process_hand_tracking(session_id, data["frame"])
                await websocket.send_json({
                    "type": "hand_poses",
                    "data": [asdict(pose) for pose in hand_poses]
                })
            
            elif message_type == "spatial_state_update":
                # Handle spatial state updates
                session = service.active_sessions.get(session_id)
                if session:
                    # Broadcast to other participants
                    service.collaboration_manager.broadcast_to_session(
                        session_id,
                        {
                            "type": "spatial_state_update",
                            "data": data["spatial_data"]
                        }
                    )
            
            elif message_type == "annotation_update":
                # Handle real-time annotation updates
                session = service.active_sessions.get(session_id)
                if session:
                    # Broadcast annotation updates
                    service.collaboration_manager.broadcast_to_session(
                        session_id,
                        {
                            "type": "annotation_update",
                            "data": data["annotation_data"]
                        }
                    )
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 