/**
 * AnnotateAI WebSocket Server
 * Real-time collaboration and live updates
 */

const WebSocket = require('ws');
const http = require('http');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.WS_PORT || 3001;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const HEARTBEAT_INTERVAL = parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000');
const MAX_CONNECTIONS = parseInt(process.env.WS_MAX_CONNECTIONS || '1000');

class AnnotateAIWebSocketServer {
  constructor() {
    this.clients = new Map();
    this.rooms = new Map();
    this.redis = new Redis(REDIS_URL);
    this.server = http.createServer();
    this.wss = new WebSocket.Server({ server: this.server });
    
    this.setupRedisSubscriptions();
    this.setupWebSocketHandlers();
    this.setupHealthEndpoint();
    this.startHeartbeat();
  }

  setupRedisSubscriptions() {
    const subscriber = new Redis(REDIS_URL);
    
    // Subscribe to annotation updates
    subscriber.subscribe('annotation:update', 'annotation:create', 'annotation:delete');
    subscriber.subscribe('collaboration:cursor', 'collaboration:presence');
    subscriber.subscribe('project:update', 'comment:create');
    
    subscriber.on('message', (channel, message) => {
      try {
        const data = JSON.parse(message);
        this.broadcastToRoom(data.projectId, {
          type: channel,
          data: data
        });
      } catch (error) {
        console.error('Error processing Redis message:', error);
      }
    });
    
    console.log('Redis subscriptions established');
  }

  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, request) => {
      if (this.clients.size >= MAX_CONNECTIONS) {
        ws.close(1008, 'Server at capacity');
        return;
      }
      
      const clientId = uuidv4();
      const client = {
        id: clientId,
        ws: ws,
        authenticated: false,
        userId: null,
        projectId: null,
        lastSeen: Date.now()
      };
      
      this.clients.set(clientId, client);
      
      ws.on('message', (message) => {
        this.handleMessage(clientId, message);
      });
      
      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });
      
      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.handleDisconnect(clientId);
      });
      
      // Send connection acknowledgment
      ws.send(JSON.stringify({
        type: 'connection',
        clientId: clientId,
        timestamp: Date.now()
      }));
      
      console.log(`Client ${clientId} connected`);
    });
    
    console.log('WebSocket handlers configured');
  }

  async handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    try {
      const data = JSON.parse(message);
      client.lastSeen = Date.now();
      
      switch (data.type) {
        case 'authenticate':
          await this.handleAuthentication(clientId, data);
          break;
          
        case 'join_project':
          await this.handleJoinProject(clientId, data);
          break;
          
        case 'leave_project':
          await this.handleLeaveProject(clientId, data);
          break;
          
        case 'cursor_update':
          await this.handleCursorUpdate(clientId, data);
          break;
          
        case 'annotation_update':
          await this.handleAnnotationUpdate(clientId, data);
          break;
          
        case 'comment_create':
          await this.handleCommentCreate(clientId, data);
          break;
          
        case 'presence_update':
          await this.handlePresenceUpdate(clientId, data);
          break;
          
        case 'ping':
          client.ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
          
        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error(`Error handling message from client ${clientId}:`, error);
      client.ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  }

  async handleAuthentication(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    try {
      const decoded = jwt.verify(data.token, JWT_SECRET);
      client.authenticated = true;
      client.userId = decoded.userId;
      client.username = decoded.username;
      
      client.ws.send(JSON.stringify({
        type: 'authenticated',
        userId: decoded.userId,
        username: decoded.username
      }));
      
      console.log(`Client ${clientId} authenticated as user ${decoded.userId}`);
    } catch (error) {
      client.ws.send(JSON.stringify({
        type: 'authentication_failed',
        message: 'Invalid token'
      }));
    }
  }

  async handleJoinProject(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || !client.authenticated) return;
    
    const { projectId } = data;
    
    // Leave previous project if any
    if (client.projectId) {
      this.removeFromRoom(client.projectId, clientId);
    }
    
    // Join new project
    client.projectId = projectId;
    this.addToRoom(projectId, clientId);
    
    // Notify others in the room
    this.broadcastToRoom(projectId, {
      type: 'user_joined',
      userId: client.userId,
      username: client.username,
      timestamp: Date.now()
    }, clientId);
    
    client.ws.send(JSON.stringify({
      type: 'project_joined',
      projectId: projectId,
      activeUsers: this.getActiveUsersInRoom(projectId)
    }));
    
    console.log(`Client ${clientId} joined project ${projectId}`);
  }

  async handleLeaveProject(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || !client.projectId) return;
    
    const projectId = client.projectId;
    this.removeFromRoom(projectId, clientId);
    
    // Notify others in the room
    this.broadcastToRoom(projectId, {
      type: 'user_left',
      userId: client.userId,
      username: client.username,
      timestamp: Date.now()
    });
    
    client.projectId = null;
    client.ws.send(JSON.stringify({
      type: 'project_left',
      projectId: projectId
    }));
  }

  async handleCursorUpdate(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || !client.projectId) return;
    
    // Broadcast cursor position to other users in the project
    this.broadcastToRoom(client.projectId, {
      type: 'cursor_update',
      userId: client.userId,
      username: client.username,
      x: data.x,
      y: data.y,
      timestamp: Date.now()
    }, clientId);
  }

  async handleAnnotationUpdate(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || !client.projectId) return;
    
    // Publish to Redis for persistence
    await this.redis.publish('annotation:update', JSON.stringify({
      projectId: client.projectId,
      userId: client.userId,
      annotation: data.annotation,
      timestamp: Date.now()
    }));
  }

  async handleCommentCreate(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || !client.projectId) return;
    
    // Publish to Redis for persistence
    await this.redis.publish('comment:create', JSON.stringify({
      projectId: client.projectId,
      userId: client.userId,
      username: client.username,
      comment: data.comment,
      timestamp: Date.now()
    }));
  }

  async handlePresenceUpdate(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || !client.projectId) return;
    
    // Broadcast presence update
    this.broadcastToRoom(client.projectId, {
      type: 'presence_update',
      userId: client.userId,
      username: client.username,
      status: data.status,
      timestamp: Date.now()
    }, clientId);
  }

  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      if (client.projectId) {
        this.removeFromRoom(client.projectId, clientId);
        
        // Notify others in the room
        this.broadcastToRoom(client.projectId, {
          type: 'user_disconnected',
          userId: client.userId,
          username: client.username,
          timestamp: Date.now()
        });
      }
      
      this.clients.delete(clientId);
      console.log(`Client ${clientId} disconnected`);
    }
  }

  addToRoom(projectId, clientId) {
    if (!this.rooms.has(projectId)) {
      this.rooms.set(projectId, new Set());
    }
    this.rooms.get(projectId).add(clientId);
  }

  removeFromRoom(projectId, clientId) {
    if (this.rooms.has(projectId)) {
      this.rooms.get(projectId).delete(clientId);
      if (this.rooms.get(projectId).size === 0) {
        this.rooms.delete(projectId);
      }
    }
  }

  broadcastToRoom(projectId, message, excludeClientId = null) {
    const room = this.rooms.get(projectId);
    if (!room) return;
    
    const messageStr = JSON.stringify(message);
    
    room.forEach(clientId => {
      if (clientId !== excludeClientId) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(messageStr);
        }
      }
    });
  }

  getActiveUsersInRoom(projectId) {
    const room = this.rooms.get(projectId);
    if (!room) return [];
    
    const activeUsers = [];
    room.forEach(clientId => {
      const client = this.clients.get(clientId);
      if (client && client.authenticated) {
        activeUsers.push({
          userId: client.userId,
          username: client.username,
          lastSeen: client.lastSeen
        });
      }
    });
    
    return activeUsers;
  }

  setupHealthEndpoint() {
    this.server.on('request', (req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          uptime: process.uptime(),
          connections: this.clients.size,
          rooms: this.rooms.size,
          timestamp: new Date().toISOString()
        }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });
  }

  startHeartbeat() {
    setInterval(() => {
      const now = Date.now();
      const staleClients = [];
      
      this.clients.forEach((client, clientId) => {
        if (now - client.lastSeen > HEARTBEAT_INTERVAL * 2) {
          staleClients.push(clientId);
        }
      });
      
      staleClients.forEach(clientId => {
        console.log(`Removing stale client ${clientId}`);
        this.handleDisconnect(clientId);
      });
    }, HEARTBEAT_INTERVAL);
  }

  start() {
    this.server.listen(PORT, () => {
      console.log(`AnnotateAI WebSocket Server listening on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Max connections: ${MAX_CONNECTIONS}`);
      console.log(`Heartbeat interval: ${HEARTBEAT_INTERVAL}ms`);
    });
  }
}

// Start the server
const server = new AnnotateAIWebSocketServer();
server.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.wss.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.wss.close(() => {
    process.exit(0);
  });
}); 