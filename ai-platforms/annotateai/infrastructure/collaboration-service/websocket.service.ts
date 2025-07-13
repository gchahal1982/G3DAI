/**
 * AnnotateAI Real-time Collaboration Service
 * Phase 3 Production AI Deployment - WebSocket & Operational Transformation
 * 
 * Replaces: ai-platforms/annotateai/src/core/CollaborationEngine.ts (mock implementation)
 * 
 * Features:
 * - Stateful WebSocket service with Socket.IO clustering
 * - Operational Transformation (OT) for conflict-free annotation merging
 * - Redis Pub/Sub for multi-instance message broadcasting
 * - Real-time cursor tracking and user presence
 * - Annotation locking and conflict resolution
 * - Session recording and playback capabilities
 * - Live collaboration analytics and monitoring
 * - Automatic reconnection and state synchronization
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AuditService } from '../audit/audit.service';
import { SecurityService } from '../security/security.service';
import { OperationalTransformService } from './operational-transform.service';
import { PresenceService } from './presence.service';
import { SessionRecordingService } from './session-recording.service';
import { CollaborationSessionDto } from './dto/collaboration-session.dto';
import { AnnotationOperationDto } from './dto/annotation-operation.dto';
import { CursorPositionDto } from './dto/cursor-position.dto';
import { UserPresenceDto } from './dto/user-presence.dto';
import { CommentDto } from './dto/comment.dto';
import { User } from '../users/entities/user.entity';
import { CollaborationSession } from './entities/collaboration-session.entity';
import { Operation } from './interfaces/operation.interface';
import { OperationType } from './enums/operation-type.enum';
import { CollaborationEvent } from './enums/collaboration-event.enum';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/collaboration',
  transports: ['websocket'],
})
export class WebSocketService implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  private readonly logger = new Logger(WebSocketService.name);
  private redisAdapter: any;
  private readonly connectedUsers = new Map<string, UserConnection>();
  private readonly projectSessions = new Map<string, Set<string>>();
  private readonly operationQueues = new Map<string, Operation[]>();

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
    private readonly securityService: SecurityService,
    private readonly operationalTransformService: OperationalTransformService,
    private readonly presenceService: PresenceService,
    private readonly sessionRecordingService: SessionRecordingService,
  ) {}

  async onModuleInit() {
    await this.setupRedisAdapter();
    await this.setupOperationalTransform();
    await this.setupPresenceTracking();
    await this.setupSessionRecording();
    this.logger.log('WebSocket Collaboration Service initialized');
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket server initialized with Redis adapter');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      // Authenticate user
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        client.disconnect(true);
        return;
      }

      const user = await this.authenticateUser(token);
      if (!user) {
        client.disconnect(true);
        return;
      }

      // Store user connection
      const userConnection: UserConnection = {
        userId: user.id,
        socketId: client.id,
        user,
        connectedAt: new Date(),
        lastActivity: new Date(),
        currentProject: null,
        currentFile: null,
        cursor: null,
        isActive: true,
      };

      this.connectedUsers.set(client.id, userConnection);
      client.data.user = user;

      // Join user to their personal room
      await client.join(`user:${user.id}`);

      // Notify about connection
      await this.auditService.log({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'collaboration.connected',
        resourceType: 'websocket',
        resourceId: client.id,
        metadata: {
          socketId: client.id,
          ipAddress: client.handshake.address,
          userAgent: client.handshake.headers['user-agent'],
        },
      });

      this.logger.log(`User ${user.email} connected via WebSocket (${client.id})`);

      // Send connection confirmation
      client.emit('connection:confirmed', {
        userId: user.id,
        socketId: client.id,
        serverTime: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error('WebSocket connection failed', error);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const userConnection = this.connectedUsers.get(client.id);
      if (!userConnection) {
        return;
      }

      // Remove user from all project sessions
      if (userConnection.currentProject) {
        await this.leaveProject(client, userConnection.currentProject);
      }

      // Update presence
      await this.presenceService.setUserOffline(userConnection.userId);

      // Remove from connected users
      this.connectedUsers.delete(client.id);

      // Audit log
      await this.auditService.log({
        userId: userConnection.userId,
        organizationId: userConnection.user.organizationId,
        action: 'collaboration.disconnected',
        resourceType: 'websocket',
        resourceId: client.id,
        metadata: {
          socketId: client.id,
          sessionDuration: Date.now() - userConnection.connectedAt.getTime(),
        },
      });

      this.logger.log(`User ${userConnection.user.email} disconnected (${client.id})`);

    } catch (error) {
      this.logger.error('WebSocket disconnection handling failed', error);
    }
  }

  @SubscribeMessage('project:join')
  async handleJoinProject(
    @MessageBody() data: { projectId: string; fileId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userConnection = this.connectedUsers.get(client.id);
      if (!userConnection) {
        return;
      }

      const { projectId, fileId } = data;

      // Validate project access
      const hasAccess = await this.securityService.checkProjectAccess(
        projectId,
        userConnection.userId,
        'read',
      );

      if (!hasAccess) {
        client.emit('error', { message: 'Access denied to project' });
        return;
      }

      // Leave current project if any
      if (userConnection.currentProject) {
        await this.leaveProject(client, userConnection.currentProject);
      }

      // Join project room
      await client.join(`project:${projectId}`);
      userConnection.currentProject = projectId;
      userConnection.currentFile = fileId || null;

      // Add to project sessions
      if (!this.projectSessions.has(projectId)) {
        this.projectSessions.set(projectId, new Set());
      }
      this.projectSessions.get(projectId).add(client.id);

      // Get or create collaboration session
      const session = await this.getOrCreateCollaborationSession(projectId, fileId);

      // Update user presence
      await this.presenceService.setUserOnline(userConnection.userId, {
        projectId,
        fileId,
        lastActivity: new Date(),
      });

      // Notify others in the project
      client.to(`project:${projectId}`).emit('user:joined', {
        userId: userConnection.userId,
        userName: `${userConnection.user.firstName} ${userConnection.user.lastName}`,
        avatar: userConnection.user.avatar,
        joinedAt: new Date().toISOString(),
      });

      // Send current session state to joining user
      const sessionState = await this.getSessionState(session.id);
      client.emit('session:state', sessionState);

      // Get active users in project
      const activeUsers = await this.getActiveUsersInProject(projectId);
      client.emit('users:active', activeUsers);

      // Audit log
      await this.auditService.log({
        userId: userConnection.userId,
        organizationId: userConnection.user.organizationId,
        action: 'collaboration.project_joined',
        resourceType: 'project',
        resourceId: projectId,
        metadata: {
          fileId,
          sessionId: session.id,
        },
      });

      this.logger.log(`User ${userConnection.user.email} joined project ${projectId}`);

    } catch (error) {
      this.logger.error('Failed to join project', error);
      client.emit('error', { message: 'Failed to join project' });
    }
  }

  @SubscribeMessage('project:leave')
  async handleLeaveProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userConnection = this.connectedUsers.get(client.id);
      if (!userConnection) {
        return;
      }

      await this.leaveProject(client, data.projectId);

    } catch (error) {
      this.logger.error('Failed to leave project', error);
      client.emit('error', { message: 'Failed to leave project' });
    }
  }

  @SubscribeMessage('annotation:operation')
  async handleAnnotationOperation(
    @MessageBody() data: AnnotationOperationDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userConnection = this.connectedUsers.get(client.id);
      if (!userConnection) {
        return;
      }

      const { projectId, fileId, operation } = data;

      // Validate operation
      if (!this.isValidOperation(operation)) {
        client.emit('error', { message: 'Invalid operation' });
        return;
      }

      // Get collaboration session
      const session = await this.getOrCreateCollaborationSession(projectId, fileId);

      // Apply operational transformation
      const transformedOperation = await this.operationalTransformService.transformOperation(
        operation,
        session.id,
        userConnection.userId,
      );

      // Apply operation to session state
      await this.applyOperationToSession(session.id, transformedOperation);

      // Broadcast to all users in the project
      client.to(`project:${projectId}`).emit('annotation:operation:applied', {
        operation: transformedOperation,
        userId: userConnection.userId,
        userName: `${userConnection.user.firstName} ${userConnection.user.lastName}`,
        timestamp: new Date().toISOString(),
      });

      // Record operation for session playback
      await this.sessionRecordingService.recordOperation(session.id, {
        ...transformedOperation,
        userId: userConnection.userId,
        timestamp: new Date(),
      });

      // Update user activity
      userConnection.lastActivity = new Date();
      await this.presenceService.updateUserActivity(userConnection.userId);

      // Audit log
      await this.auditService.log({
        userId: userConnection.userId,
        organizationId: userConnection.user.organizationId,
        action: 'collaboration.annotation_operation',
        resourceType: 'annotation',
        resourceId: transformedOperation.annotationId,
        metadata: {
          projectId,
          fileId,
          operationType: transformedOperation.type,
          sessionId: session.id,
        },
      });

    } catch (error) {
      this.logger.error('Failed to handle annotation operation', error);
      client.emit('error', { message: 'Failed to process annotation operation' });
    }
  }

  @SubscribeMessage('cursor:position')
  async handleCursorPosition(
    @MessageBody() data: CursorPositionDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userConnection = this.connectedUsers.get(client.id);
      if (!userConnection) {
        return;
      }

      const { projectId, fileId, position } = data;

      // Update user cursor position
      userConnection.cursor = position;
      userConnection.lastActivity = new Date();

      // Broadcast cursor position to others in the project
      client.to(`project:${projectId}`).emit('cursor:position:update', {
        userId: userConnection.userId,
        userName: `${userConnection.user.firstName} ${userConnection.user.lastName}`,
        position,
        timestamp: new Date().toISOString(),
      });

      // Update presence service
      await this.presenceService.updateUserCursor(userConnection.userId, position);

    } catch (error) {
      this.logger.error('Failed to handle cursor position', error);
    }
  }

  @SubscribeMessage('comment:add')
  async handleAddComment(
    @MessageBody() data: CommentDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userConnection = this.connectedUsers.get(client.id);
      if (!userConnection) {
        return;
      }

      const { projectId, fileId, annotationId, content, position } = data;

      // Create comment in database
      const comment = await this.prismaService.comment.create({
        data: {
          content,
          position,
          annotationId,
          fileId,
          projectId,
          userId: userConnection.userId,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      // Broadcast comment to project members
      this.server.to(`project:${projectId}`).emit('comment:added', {
        comment,
        timestamp: new Date().toISOString(),
      });

      // Audit log
      await this.auditService.log({
        userId: userConnection.userId,
        organizationId: userConnection.user.organizationId,
        action: 'collaboration.comment_added',
        resourceType: 'comment',
        resourceId: comment.id,
        metadata: {
          projectId,
          fileId,
          annotationId,
          content: content.substring(0, 100), // Truncate for audit
        },
      });

    } catch (error) {
      this.logger.error('Failed to handle comment addition', error);
      client.emit('error', { message: 'Failed to add comment' });
    }
  }

  @SubscribeMessage('annotation:lock')
  async handleLockAnnotation(
    @MessageBody() data: { projectId: string; annotationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userConnection = this.connectedUsers.get(client.id);
      if (!userConnection) {
        return;
      }

      const { projectId, annotationId } = data;

      // Lock annotation in database
      const lockResult = await this.prismaService.annotation.updateMany({
        where: {
          id: annotationId,
          projectId,
          OR: [
            { lockedBy: null },
            { lockedBy: userConnection.userId },
          ],
        },
        data: {
          lockedBy: userConnection.userId,
          lockedAt: new Date(),
        },
      });

      if (lockResult.count === 0) {
        client.emit('annotation:lock:failed', { annotationId, reason: 'Already locked by another user' });
        return;
      }

      // Broadcast lock to project members
      client.to(`project:${projectId}`).emit('annotation:locked', {
        annotationId,
        lockedBy: userConnection.userId,
        lockedByName: `${userConnection.user.firstName} ${userConnection.user.lastName}`,
        timestamp: new Date().toISOString(),
      });

      client.emit('annotation:lock:success', { annotationId });

    } catch (error) {
      this.logger.error('Failed to lock annotation', error);
      client.emit('error', { message: 'Failed to lock annotation' });
    }
  }

  @SubscribeMessage('annotation:unlock')
  async handleUnlockAnnotation(
    @MessageBody() data: { projectId: string; annotationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userConnection = this.connectedUsers.get(client.id);
      if (!userConnection) {
        return;
      }

      const { projectId, annotationId } = data;

      // Unlock annotation in database
      await this.prismaService.annotation.updateMany({
        where: {
          id: annotationId,
          projectId,
          lockedBy: userConnection.userId,
        },
        data: {
          lockedBy: null,
          lockedAt: null,
        },
      });

      // Broadcast unlock to project members
      client.to(`project:${projectId}`).emit('annotation:unlocked', {
        annotationId,
        unlockedBy: userConnection.userId,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error('Failed to unlock annotation', error);
      client.emit('error', { message: 'Failed to unlock annotation' });
    }
  }

  // Public method for broadcasting annotation updates from other services
  async broadcastAnnotationUpdate(
    projectId: string,
    fileId: string,
    event: string,
    data: any,
  ): Promise<void> {
    try {
      this.server.to(`project:${projectId}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Failed to broadcast annotation update', error);
    }
  }

  // Private helper methods

  private async setupRedisAdapter(): Promise<void> {
    try {
      const redisUrl = this.configService.get<string>('REDIS_URL');
      if (!redisUrl) {
        this.logger.warn('Redis URL not configured, running in single-instance mode');
        return;
      }

      const pubClient = createClient({ url: redisUrl });
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      this.redisAdapter = createAdapter(pubClient, subClient);
      this.server.adapter(this.redisAdapter);

      this.logger.log('Redis adapter configured for WebSocket clustering');
    } catch (error) {
      this.logger.error('Failed to setup Redis adapter', error);
    }
  }

  private async setupOperationalTransform(): Promise<void> {
    await this.operationalTransformService.initialize();
    this.logger.log('Operational Transform system initialized');
  }

  private async setupPresenceTracking(): Promise<void> {
    await this.presenceService.initialize();
    this.logger.log('Presence tracking system initialized');
  }

  private async setupSessionRecording(): Promise<void> {
    await this.sessionRecordingService.initialize();
    this.logger.log('Session recording system initialized');
  }

  private async authenticateUser(token: string): Promise<User | null> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.prismaService.user.findUnique({
        where: { id: decoded.sub },
        include: { organization: true },
      });

      return user && user.status === 'active' ? user : null;
    } catch (error) {
      this.logger.error('User authentication failed', error);
      return null;
    }
  }

  private async leaveProject(client: Socket, projectId: string): Promise<void> {
    const userConnection = this.connectedUsers.get(client.id);
    if (!userConnection) {
      return;
    }

    // Leave project room
    await client.leave(`project:${projectId}`);

    // Remove from project sessions
    const projectSession = this.projectSessions.get(projectId);
    if (projectSession) {
      projectSession.delete(client.id);
      if (projectSession.size === 0) {
        this.projectSessions.delete(projectId);
      }
    }

    // Unlock any locked annotations
    await this.prismaService.annotation.updateMany({
      where: {
        projectId,
        lockedBy: userConnection.userId,
      },
      data: {
        lockedBy: null,
        lockedAt: null,
      },
    });

    // Update presence
    await this.presenceService.setUserOffline(userConnection.userId);

    // Notify others in the project
    client.to(`project:${projectId}`).emit('user:left', {
      userId: userConnection.userId,
      userName: `${userConnection.user.firstName} ${userConnection.user.lastName}`,
      leftAt: new Date().toISOString(),
    });

    // Clear current project
    userConnection.currentProject = null;
    userConnection.currentFile = null;

    // Audit log
    await this.auditService.log({
      userId: userConnection.userId,
      organizationId: userConnection.user.organizationId,
      action: 'collaboration.project_left',
      resourceType: 'project',
      resourceId: projectId,
    });
  }

  private async getOrCreateCollaborationSession(
    projectId: string,
    fileId: string | null,
  ): Promise<CollaborationSession> {
    const whereClause = fileId ? { projectId, fileId } : { projectId, fileId: null };
    
    let session = await this.prismaService.collaborationSession.findFirst({
      where: whereClause,
    });

    if (!session) {
      session = await this.prismaService.collaborationSession.create({
        data: {
          projectId,
          fileId,
          participants: [],
          status: 'active',
          operations: [],
          version: 0,
        },
      });
    }

    return session;
  }

  private async getSessionState(sessionId: string): Promise<any> {
    const session = await this.prismaService.collaborationSession.findUnique({
      where: { id: sessionId },
    });

    return {
      sessionId,
      version: session?.version || 0,
      operations: session?.operations || [],
      participants: session?.participants || [],
    };
  }

  private async getActiveUsersInProject(projectId: string): Promise<any[]> {
    const activeUsers = [];
    
    for (const [socketId, userConnection] of this.connectedUsers) {
      if (userConnection.currentProject === projectId) {
        activeUsers.push({
          userId: userConnection.userId,
          userName: `${userConnection.user.firstName} ${userConnection.user.lastName}`,
          avatar: userConnection.user.avatar,
          cursor: userConnection.cursor,
          lastActivity: userConnection.lastActivity,
        });
      }
    }

    return activeUsers;
  }

  private async applyOperationToSession(sessionId: string, operation: Operation): Promise<void> {
    await this.prismaService.collaborationSession.update({
      where: { id: sessionId },
      data: {
        operations: {
          push: operation,
        },
        version: {
          increment: 1,
        },
      },
    });
  }

  private isValidOperation(operation: any): boolean {
    return (
      operation &&
      typeof operation === 'object' &&
      operation.type &&
      operation.data &&
      operation.annotationId
    );
  }
}

// Interface for user connection tracking
interface UserConnection {
  userId: string;
  socketId: string;
  user: User;
  connectedAt: Date;
  lastActivity: Date;
  currentProject: string | null;
  currentFile: string | null;
  cursor: { x: number; y: number } | null;
  isActive: boolean;
} 