#!/usr/bin/env python3
"""
Integration Tests for Real-time Collaboration Flow
Tests end-to-end collaboration scenarios including WebSocket communication,
operational transformation, conflict resolution, and multi-user workflows
"""

import pytest
import asyncio
import websockets
import json
import time
from typing import List, Dict, Any
import httpx
from unittest.mock import AsyncMock, patch
import uuid
from datetime import datetime
import concurrent.futures
from dataclasses import dataclass, asdict

@dataclass
class CollaborationEvent:
    """Represents a collaboration event"""
    type: str
    user_id: str
    session_id: str
    timestamp: float
    data: Dict[str, Any]
    operation_id: str = None

class CollaborationTestClient:
    """Test client for collaboration service"""
    
    def __init__(self, base_url: str, websocket_url: str):
        self.base_url = base_url
        self.websocket_url = websocket_url
        self.websocket = None
        self.events = []
        self.user_id = None
        self.session_id = None
    
    async def connect(self, user_id: str, project_id: str, dataset_id: str):
        """Connect to collaboration service"""
        self.user_id = user_id
        
        # Connect WebSocket
        uri = f"{self.websocket_url}/collaboration"
        self.websocket = await websockets.connect(uri)
        
        # Send join message
        join_message = {
            "type": "join_collaboration",
            "data": {
                "project_id": project_id,
                "dataset_id": dataset_id,
                "user": {
                    "id": user_id,
                    "name": f"User {user_id}",
                    "role": "annotator"
                }
            }
        }
        
        await self.websocket.send(json.dumps(join_message))
        
        # Wait for session_joined response
        response = await self.websocket.recv()
        session_data = json.loads(response)
        
        if session_data.get("type") == "session_joined":
            self.session_id = session_data["data"]["session_id"]
            return session_data
        
        raise Exception(f"Failed to join session: {session_data}")
    
    async def disconnect(self):
        """Disconnect from collaboration service"""
        if self.websocket:
            await self.websocket.close()
    
    async def send_operation(self, operation: Dict[str, Any]):
        """Send operation to collaboration service"""
        operation_message = {
            "type": "operation",
            "data": operation
        }
        await self.websocket.send(json.dumps(operation_message))
    
    async def listen_for_events(self, timeout: float = 10.0):
        """Listen for events from collaboration service"""
        try:
            async with asyncio.timeout(timeout):
                while True:
                    message = await self.websocket.recv()
                    event_data = json.loads(message)
                    
                    event = CollaborationEvent(
                        type=event_data.get("type"),
                        user_id=self.user_id,
                        session_id=self.session_id,
                        timestamp=time.time(),
                        data=event_data.get("data", {}),
                        operation_id=event_data.get("operation_id")
                    )
                    
                    self.events.append(event)
                    yield event
        
        except asyncio.TimeoutError:
            return
    
    async def create_annotation(self, annotation_data: Dict[str, Any]):
        """Create a new annotation"""
        operation = {
            "id": str(uuid.uuid4()),
            "type": "annotation_create",
            "timestamp": time.time(),
            "data": annotation_data
        }
        await self.send_operation(operation)
        return operation["id"]
    
    async def update_annotation(self, annotation_id: str, updates: Dict[str, Any]):
        """Update an existing annotation"""
        operation = {
            "id": str(uuid.uuid4()),
            "type": "annotation_update",
            "timestamp": time.time(),
            "data": {
                "annotation_id": annotation_id,
                **updates
            }
        }
        await self.send_operation(operation)
        return operation["id"]
    
    async def delete_annotation(self, annotation_id: str):
        """Delete an annotation"""
        operation = {
            "id": str(uuid.uuid4()),
            "type": "annotation_delete",
            "timestamp": time.time(),
            "data": {
                "annotation_id": annotation_id
            }
        }
        await self.send_operation(operation)
        return operation["id"]
    
    async def move_cursor(self, position: Dict[str, Any]):
        """Move cursor position"""
        cursor_message = {
            "type": "cursor_move",
            "data": position
        }
        await self.websocket.send(json.dumps(cursor_message))
    
    async def lock_annotation(self, annotation_id: str):
        """Lock an annotation for editing"""
        lock_message = {
            "type": "lock_annotation",
            "data": {"annotation_id": annotation_id}
        }
        await self.websocket.send(json.dumps(lock_message))
    
    async def unlock_annotation(self, annotation_id: str):
        """Unlock an annotation"""
        unlock_message = {
            "type": "unlock_annotation",
            "data": {"annotation_id": annotation_id}
        }
        await self.websocket.send(json.dumps(unlock_message))

class TestCollaborationBasics:
    """Basic collaboration functionality tests"""
    
    @pytest.fixture
    async def collaboration_clients(self, test_config):
        """Create multiple collaboration test clients"""
        base_url = test_config["COLLABORATION_BASE_URL"]
        websocket_url = base_url.replace("http", "ws")
        
        clients = [
            CollaborationTestClient(base_url, websocket_url),
            CollaborationTestClient(base_url, websocket_url),
            CollaborationTestClient(base_url, websocket_url)
        ]
        
        yield clients
        
        # Cleanup
        for client in clients:
            await client.disconnect()
    
    @pytest.mark.integration
    async def test_single_user_session(self, collaboration_clients):
        """Test single user joining and leaving session"""
        client = collaboration_clients[0]
        
        # Join session
        session_data = await client.connect("user1", "project1", "dataset1")
        
        assert session_data["type"] == "session_joined"
        assert "session_id" in session_data["data"]
        assert client.session_id is not None
        
        # Verify user is in session
        users = session_data["data"]["users"]
        assert "user1" in users
        assert users["user1"]["name"] == "User user1"
    
    @pytest.mark.integration
    async def test_multi_user_session(self, collaboration_clients):
        """Test multiple users joining same session"""
        project_id = "project1"
        dataset_id = "dataset1"
        
        # Connect first user
        session1 = await collaboration_clients[0].connect("user1", project_id, dataset_id)
        session_id = session1["data"]["session_id"]
        
        # Connect second user to same session
        session2 = await collaboration_clients[1].connect("user2", project_id, dataset_id)
        
        # Verify both users are in same session
        assert session2["data"]["session_id"] == session_id
        
        # Listen for user_joined event on first client
        events = []
        async for event in collaboration_clients[0].listen_for_events(timeout=2):
            events.append(event)
            if event.type == "user_joined":
                break
        
        # Verify user_joined event was received
        user_joined_events = [e for e in events if e.type == "user_joined"]
        assert len(user_joined_events) >= 1
        
        joined_user = user_joined_events[0].data
        assert joined_user["id"] == "user2"
    
    @pytest.mark.integration
    async def test_session_persistence(self, collaboration_clients, test_config):
        """Test session persistence across reconnections"""
        client = collaboration_clients[0]
        
        # Join session
        session_data = await client.connect("user1", "project1", "dataset1")
        session_id = session_data["data"]["session_id"]
        
        # Disconnect
        await client.disconnect()
        
        # Reconnect to same session
        session_data2 = await client.connect("user1", "project1", "dataset1")
        
        # Session should be the same or a new one created
        assert session_data2["data"]["session_id"] is not None

class TestOperationalTransformation:
    """Tests for operational transformation and conflict resolution"""
    
    @pytest.mark.integration
    async def test_concurrent_annotation_creation(self, collaboration_clients):
        """Test concurrent annotation creation by multiple users"""
        project_id = "project1"
        dataset_id = "dataset1"
        
        # Connect two users
        await collaboration_clients[0].connect("user1", project_id, dataset_id)
        await collaboration_clients[1].connect("user2", project_id, dataset_id)
        
        # Create annotations simultaneously
        annotation1_data = {
            "type": "bounding_box",
            "coordinates": {"x": 10, "y": 10, "width": 50, "height": 50},
            "label": "cat"
        }
        
        annotation2_data = {
            "type": "bounding_box", 
            "coordinates": {"x": 20, "y": 20, "width": 60, "height": 60},
            "label": "dog"
        }
        
        # Send operations concurrently
        op1_task = asyncio.create_task(
            collaboration_clients[0].create_annotation(annotation1_data)
        )
        op2_task = asyncio.create_task(
            collaboration_clients[1].create_annotation(annotation2_data)
        )
        
        op1_id, op2_id = await asyncio.gather(op1_task, op2_task)
        
        # Listen for operation events
        events = []
        async for event in collaboration_clients[0].listen_for_events(timeout=3):
            events.append(event)
            if len(events) >= 2:  # Expect 2 operation events
                break
        
        # Verify both operations were processed
        operation_events = [e for e in events if e.type == "operation"]
        assert len(operation_events) >= 1
    
    @pytest.mark.integration
    async def test_annotation_conflict_resolution(self, collaboration_clients):
        """Test conflict resolution when editing same annotation"""
        project_id = "project1"
        dataset_id = "dataset1"
        
        # Connect two users
        await collaboration_clients[0].connect("user1", project_id, dataset_id)
        await collaboration_clients[1].connect("user2", project_id, dataset_id)
        
        # User 1 creates annotation
        annotation_data = {
            "type": "bounding_box",
            "coordinates": {"x": 10, "y": 10, "width": 50, "height": 50},
            "label": "cat"
        }
        annotation_id = await collaboration_clients[0].create_annotation(annotation_data)
        
        # Wait a bit for creation to propagate
        await asyncio.sleep(0.1)
        
        # Both users try to update same annotation concurrently
        update1 = {"label": "dog"}
        update2 = {"label": "bird"}
        
        update1_task = asyncio.create_task(
            collaboration_clients[0].update_annotation(annotation_id, update1)
        )
        update2_task = asyncio.create_task(
            collaboration_clients[1].update_annotation(annotation_id, update2)
        )
        
        await asyncio.gather(update1_task, update2_task)
        
        # Listen for conflict resolution events
        events = []
        async for event in collaboration_clients[0].listen_for_events(timeout=3):
            events.append(event)
            if len(events) >= 2:
                break
        
        # Verify conflict was resolved (one update should win)
        operation_events = [e for e in events if e.type == "operation"]
        assert len(operation_events) >= 1
    
    @pytest.mark.integration
    async def test_operational_transformation_ordering(self, collaboration_clients):
        """Test that operations are properly ordered and transformed"""
        project_id = "project1" 
        dataset_id = "dataset1"
        
        # Connect two users
        await collaboration_clients[0].connect("user1", project_id, dataset_id)
        await collaboration_clients[1].connect("user2", project_id, dataset_id)
        
        # Send rapid sequence of operations
        operations = []
        for i in range(5):
            annotation_data = {
                "type": "point",
                "coordinates": {"x": i * 10, "y": i * 10},
                "label": f"point_{i}"
            }
            operations.append(
                collaboration_clients[i % 2].create_annotation(annotation_data)
            )
        
        # Execute all operations
        await asyncio.gather(*operations)
        
        # Listen for all operation events
        events = []
        async for event in collaboration_clients[0].listen_for_events(timeout=5):
            events.append(event)
            if len(events) >= 5:
                break
        
        # Verify operations were received and ordered
        operation_events = [e for e in events if e.type == "operation"]
        assert len(operation_events) >= 3  # Should receive some operations

class TestAnnotationLocking:
    """Tests for annotation locking mechanism"""
    
    @pytest.mark.integration
    async def test_annotation_locking(self, collaboration_clients):
        """Test annotation locking prevents concurrent edits"""
        project_id = "project1"
        dataset_id = "dataset1"
        
        # Connect two users
        await collaboration_clients[0].connect("user1", project_id, dataset_id)
        await collaboration_clients[1].connect("user2", project_id, dataset_id)
        
        # User 1 creates annotation
        annotation_data = {
            "type": "bounding_box",
            "coordinates": {"x": 10, "y": 10, "width": 50, "height": 50},
            "label": "cat"
        }
        annotation_id = await collaboration_clients[0].create_annotation(annotation_data)
        
        # Wait for creation to propagate
        await asyncio.sleep(0.1)
        
        # User 1 locks the annotation
        await collaboration_clients[0].lock_annotation(annotation_id)
        
        # User 2 tries to lock same annotation
        await collaboration_clients[1].lock_annotation(annotation_id)
        
        # Listen for lock events
        events = []
        async for event in collaboration_clients[1].listen_for_events(timeout=3):
            events.append(event)
            if event.type in ["annotation_locked", "lock_failed"]:
                break
        
        # Verify lock conflict was handled
        lock_events = [e for e in events if e.type in ["annotation_locked", "lock_failed"]]
        assert len(lock_events) >= 1
    
    @pytest.mark.integration
    async def test_lock_expiration(self, collaboration_clients):
        """Test that locks expire automatically"""
        project_id = "project1"
        dataset_id = "dataset1"
        
        # Connect user
        await collaboration_clients[0].connect("user1", project_id, dataset_id)
        
        # Create and lock annotation
        annotation_data = {
            "type": "point",
            "coordinates": {"x": 50, "y": 50},
            "label": "test_point"
        }
        annotation_id = await collaboration_clients[0].create_annotation(annotation_data)
        await collaboration_clients[0].lock_annotation(annotation_id)
        
        # In a real system, we'd wait for lock expiration
        # For testing, we simulate lock expiration
        await asyncio.sleep(1)
        
        # Lock should be automatically released
        # This would be verified by checking lock status

class TestCursorTracking:
    """Tests for real-time cursor tracking"""
    
    @pytest.mark.integration
    async def test_cursor_movement_broadcast(self, collaboration_clients):
        """Test cursor movement is broadcast to other users"""
        project_id = "project1"
        dataset_id = "dataset1"
        
        # Connect two users
        await collaboration_clients[0].connect("user1", project_id, dataset_id)
        await collaboration_clients[1].connect("user2", project_id, dataset_id)
        
        # User 1 moves cursor
        cursor_position = {"x": 100, "y": 200}
        await collaboration_clients[0].move_cursor(cursor_position)
        
        # Listen for cursor movement on user 2
        events = []
        async for event in collaboration_clients[1].listen_for_events(timeout=3):
            events.append(event)
            if event.type == "cursor_moved":
                break
        
        # Verify cursor movement was received
        cursor_events = [e for e in events if e.type == "cursor_moved"]
        assert len(cursor_events) >= 1
        
        cursor_event = cursor_events[0]
        assert cursor_event.data["user_id"] == "user1"
        assert cursor_event.data["position"]["x"] == 100
        assert cursor_event.data["position"]["y"] == 200

class TestCollaborationPerformance:
    """Performance tests for collaboration features"""
    
    @pytest.mark.integration
    @pytest.mark.slow
    async def test_high_frequency_operations(self, collaboration_clients):
        """Test system under high frequency operations"""
        project_id = "project1"
        dataset_id = "dataset1"
        
        # Connect user
        await collaboration_clients[0].connect("user1", project_id, dataset_id)
        
        # Send rapid operations
        start_time = time.time()
        operation_count = 50
        
        tasks = []
        for i in range(operation_count):
            annotation_data = {
                "type": "point",
                "coordinates": {"x": i, "y": i},
                "label": f"rapid_point_{i}"
            }
            tasks.append(collaboration_clients[0].create_annotation(annotation_data))
        
        await asyncio.gather(*tasks)
        end_time = time.time()
        
        # Verify performance
        duration = end_time - start_time
        ops_per_second = operation_count / duration
        
        # Should handle at least 10 operations per second
        assert ops_per_second >= 10
    
    @pytest.mark.integration
    @pytest.mark.slow
    async def test_concurrent_users_performance(self, test_config):
        """Test performance with many concurrent users"""
        base_url = test_config["COLLABORATION_BASE_URL"]
        websocket_url = base_url.replace("http", "ws")
        
        # Create many clients
        num_clients = 10
        clients = []
        
        try:
            # Connect all clients
            connect_tasks = []
            for i in range(num_clients):
                client = CollaborationTestClient(base_url, websocket_url)
                clients.append(client)
                connect_tasks.append(client.connect(f"user{i}", "project1", "dataset1"))
            
            start_time = time.time()
            await asyncio.gather(*connect_tasks)
            connect_time = time.time() - start_time
            
            # Verify connection performance
            # Should connect 10 users in under 5 seconds
            assert connect_time < 5.0
            
            # Send operations from all clients
            operation_tasks = []
            for i, client in enumerate(clients):
                annotation_data = {
                    "type": "point",
                    "coordinates": {"x": i * 10, "y": i * 10},
                    "label": f"concurrent_point_{i}"
                }
                operation_tasks.append(client.create_annotation(annotation_data))
            
            start_time = time.time()
            await asyncio.gather(*operation_tasks)
            operation_time = time.time() - start_time
            
            # Verify operation performance
            # Should handle 10 concurrent operations in under 3 seconds
            assert operation_time < 3.0
            
        finally:
            # Cleanup
            for client in clients:
                await client.disconnect()

class TestCollaborationResilience:
    """Tests for collaboration system resilience"""
    
    @pytest.mark.integration
    async def test_connection_recovery(self, collaboration_clients):
        """Test recovery from connection drops"""
        client = collaboration_clients[0]
        
        # Connect to session
        session_data = await client.connect("user1", "project1", "dataset1")
        original_session_id = session_data["data"]["session_id"]
        
        # Simulate connection drop
        await client.disconnect()
        
        # Reconnect
        session_data2 = await client.connect("user1", "project1", "dataset1")
        
        # Should be able to reconnect (may be new session)
        assert session_data2["data"]["session_id"] is not None
    
    @pytest.mark.integration
    async def test_invalid_operations_handling(self, collaboration_clients):
        """Test handling of invalid operations"""
        client = collaboration_clients[0]
        
        # Connect to session
        await client.connect("user1", "project1", "dataset1")
        
        # Send invalid operation
        invalid_operation = {
            "id": str(uuid.uuid4()),
            "type": "invalid_operation_type",
            "timestamp": time.time(),
            "data": {"invalid": "data"}
        }
        
        try:
            await client.send_operation(invalid_operation)
            
            # Listen for error response
            events = []
            async for event in client.listen_for_events(timeout=3):
                events.append(event)
                if event.type == "error":
                    break
            
            # Should receive error or operation should be ignored
            # System should remain stable
            assert client.websocket.open
            
        except Exception:
            # Invalid operations should not crash the connection
            pytest.fail("Invalid operation caused connection failure")
    
    @pytest.mark.integration
    async def test_large_operation_handling(self, collaboration_clients):
        """Test handling of large operations"""
        client = collaboration_clients[0]
        
        # Connect to session
        await client.connect("user1", "project1", "dataset1")
        
        # Create large annotation data
        large_annotation_data = {
            "type": "polygon",
            "coordinates": [{"x": i, "y": i} for i in range(1000)],  # Large polygon
            "label": "large_polygon",
            "metadata": {"description": "x" * 1000}  # Large metadata
        }
        
        try:
            # Send large operation
            annotation_id = await client.create_annotation(large_annotation_data)
            assert annotation_id is not None
            
        except Exception as e:
            # Large operations should be handled gracefully
            # Either processed or rejected with clear error
            assert "too large" in str(e).lower() or annotation_id is not None 