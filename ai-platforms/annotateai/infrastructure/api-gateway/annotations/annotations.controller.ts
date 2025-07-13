/**
 * AnnotateAI Annotations Controller
 * Phase 3 Production AI Deployment - Real Annotation API
 * 
 * Replaces mock endpoints in src/app/api/projects/[id]/annotations/route.ts
 * with production annotation management, AI-assisted labeling, and real-time collaboration.
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  HttpStatus,
  Logger,
  ParseUUIDPipe,
  ParseIntPipe,
  ValidationPipe,
  Request,
  Response,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { AnnotationsService } from './annotations.service';
import { AIAssistantService } from '../ai-models/ai-assistant.service';
import { CollaborationService } from '../collaboration/collaboration.service';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';
import { AnnotationQueryDto } from './dto/annotation-query.dto';
import { BulkAnnotationDto } from './dto/bulk-annotation.dto';
import { AnnotationExportDto } from './dto/annotation-export.dto';
import { AIAssistanceDto } from './dto/ai-assistance.dto';
import { User } from '../users/entities/user.entity';
import { Annotation } from './entities/annotation.entity';
import { AnnotationSession } from './entities/annotation-session.entity';
import { UserRole } from '../auth/enums/user-role.enum';
import { AnnotationType } from './enums/annotation-type.enum';
import { AnnotationStatus } from './enums/annotation-status.enum';

@ApiTags('Annotations')
@Controller('projects/:projectId/annotations')
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@ApiBearerAuth()
export class AnnotationsController {
  private readonly logger = new Logger(AnnotationsController.name);

  constructor(
    private readonly annotationsService: AnnotationsService,
    private readonly aiAssistantService: AIAssistantService,
    private readonly collaborationService: CollaborationService,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get project annotations with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Annotations retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @Roles(UserRole.VIEWER, UserRole.ANNOTATOR, UserRole.MANAGER, UserRole.ADMIN)
  async getAnnotations(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query(ValidationPipe) query: AnnotationQueryDto,
    @CurrentUser() user: User,
    @Request() req,
    @Response() res,
  ) {
    try {
      // Check cache first
      const cacheKey = `annotations:${projectId}:${JSON.stringify(query)}`;
      const cachedResult = await this.cacheService.get(cacheKey);
      if (cachedResult) {
        return res.status(HttpStatus.OK).json(cachedResult);
      }

      // Get annotations from database
      const result = await this.annotationsService.getAnnotations(
        projectId,
        query,
        user.organizationId,
        user.id,
      );

      // Cache the result
      await this.cacheService.set(cacheKey, result, 300); // 5 minutes

      // Audit log
      await this.auditService.log({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'annotations.list',
        resourceType: 'project',
        resourceId: projectId,
        metadata: { query, resultCount: result.total },
      });

      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.logger.error(`Failed to get annotations for project ${projectId}`, error);
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create new annotation' })
  @ApiResponse({ status: 201, description: 'Annotation created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid annotation data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @Roles(UserRole.ANNOTATOR, UserRole.MANAGER, UserRole.ADMIN)
  async createAnnotation(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body(ValidationPipe) createAnnotationDto: CreateAnnotationDto,
    @CurrentUser() user: User,
    @Request() req,
    @Response() res,
  ) {
    try {
      // Validate project access
      await this.annotationsService.validateProjectAccess(projectId, user.organizationId);

      // Create annotation
      const annotation = await this.annotationsService.createAnnotation(
        projectId,
        createAnnotationDto,
        user.id,
        user.organizationId,
      );

      // Real-time collaboration update
      await this.collaborationService.broadcastAnnotationUpdate(
        projectId,
        annotation.fileId,
        'annotation:created',
        {
          annotation,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
        },
      );

      // Invalidate cache
      await this.cacheService.invalidatePattern(`annotations:${projectId}:*`);

      // Audit log
      await this.auditService.log({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'annotations.create',
        resourceType: 'annotation',
        resourceId: annotation.id,
        metadata: { 
          projectId, 
          fileId: annotation.fileId,
          type: annotation.type,
          className: annotation.className,
        },
      });

      return res.status(HttpStatus.CREATED).json({
        success: true,
        data: annotation,
        message: 'Annotation created successfully',
      });
    } catch (error) {
      this.logger.error(`Failed to create annotation for project ${projectId}`, error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get annotation by ID' })
  @ApiResponse({ status: 200, description: 'Annotation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Annotation not found' })
  @Roles(UserRole.VIEWER, UserRole.ANNOTATOR, UserRole.MANAGER, UserRole.ADMIN)
  async getAnnotation(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) annotationId: string,
    @CurrentUser() user: User,
    @Response() res,
  ) {
    try {
      const annotation = await this.annotationsService.getAnnotation(
        annotationId,
        projectId,
        user.organizationId,
      );

      if (!annotation) {
        throw new NotFoundException('Annotation not found');
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        data: annotation,
      });
    } catch (error) {
      this.logger.error(`Failed to get annotation ${annotationId}`, error);
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update annotation' })
  @ApiResponse({ status: 200, description: 'Annotation updated successfully' })
  @ApiResponse({ status: 404, description: 'Annotation not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @Roles(UserRole.ANNOTATOR, UserRole.MANAGER, UserRole.ADMIN)
  async updateAnnotation(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) annotationId: string,
    @Body(ValidationPipe) updateAnnotationDto: UpdateAnnotationDto,
    @CurrentUser() user: User,
    @Response() res,
  ) {
    try {
      // Get existing annotation
      const existingAnnotation = await this.annotationsService.getAnnotation(
        annotationId,
        projectId,
        user.organizationId,
      );

      if (!existingAnnotation) {
        throw new NotFoundException('Annotation not found');
      }

      // Check if user can edit this annotation
      if (existingAnnotation.annotatedBy !== user.id && !user.role.includes('ADMIN')) {
        throw new ForbiddenException('You can only edit your own annotations');
      }

      // Update annotation
      const updatedAnnotation = await this.annotationsService.updateAnnotation(
        annotationId,
        updateAnnotationDto,
        user.id,
      );

      // Real-time collaboration update
      await this.collaborationService.broadcastAnnotationUpdate(
        projectId,
        updatedAnnotation.fileId,
        'annotation:updated',
        {
          annotation: updatedAnnotation,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          changes: updateAnnotationDto,
        },
      );

      // Invalidate cache
      await this.cacheService.invalidatePattern(`annotations:${projectId}:*`);

      // Audit log
      await this.auditService.log({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'annotations.update',
        resourceType: 'annotation',
        resourceId: annotationId,
        oldValues: existingAnnotation,
        newValues: updatedAnnotation,
        metadata: { projectId },
      });

      return res.status(HttpStatus.OK).json({
        success: true,
        data: updatedAnnotation,
        message: 'Annotation updated successfully',
      });
    } catch (error) {
      this.logger.error(`Failed to update annotation ${annotationId}`, error);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete annotation' })
  @ApiResponse({ status: 200, description: 'Annotation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Annotation not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @Roles(UserRole.ANNOTATOR, UserRole.MANAGER, UserRole.ADMIN)
  async deleteAnnotation(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) annotationId: string,
    @CurrentUser() user: User,
    @Response() res,
  ) {
    try {
      // Get existing annotation
      const existingAnnotation = await this.annotationsService.getAnnotation(
        annotationId,
        projectId,
        user.organizationId,
      );

      if (!existingAnnotation) {
        throw new NotFoundException('Annotation not found');
      }

      // Check if user can delete this annotation
      if (existingAnnotation.annotatedBy !== user.id && !user.role.includes('ADMIN')) {
        throw new ForbiddenException('You can only delete your own annotations');
      }

      // Delete annotation
      await this.annotationsService.deleteAnnotation(annotationId, user.id);

      // Real-time collaboration update
      await this.collaborationService.broadcastAnnotationUpdate(
        projectId,
        existingAnnotation.fileId,
        'annotation:deleted',
        {
          annotationId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
        },
      );

      // Invalidate cache
      await this.cacheService.invalidatePattern(`annotations:${projectId}:*`);

      // Audit log
      await this.auditService.log({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'annotations.delete',
        resourceType: 'annotation',
        resourceId: annotationId,
        oldValues: existingAnnotation,
        metadata: { projectId },
      });

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Annotation deleted successfully',
      });
    } catch (error) {
      this.logger.error(`Failed to delete annotation ${annotationId}`, error);
      throw error;
    }
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create/update annotations' })
  @ApiResponse({ status: 200, description: 'Bulk operation completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid bulk operation data' })
  @Roles(UserRole.ANNOTATOR, UserRole.MANAGER, UserRole.ADMIN)
  async bulkAnnotations(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body(ValidationPipe) bulkAnnotationDto: BulkAnnotationDto,
    @CurrentUser() user: User,
    @Response() res,
  ) {
    try {
      // Validate project access
      await this.annotationsService.validateProjectAccess(projectId, user.organizationId);

      // Process bulk operations
      const result = await this.annotationsService.bulkAnnotations(
        projectId,
        bulkAnnotationDto,
        user.id,
        user.organizationId,
      );

      // Real-time collaboration update
      await this.collaborationService.broadcastAnnotationUpdate(
        projectId,
        null, // Multiple files
        'annotations:bulk_update',
        {
          result,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
        },
      );

      // Invalidate cache
      await this.cacheService.invalidatePattern(`annotations:${projectId}:*`);

      // Audit log
      await this.auditService.log({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'annotations.bulk_update',
        resourceType: 'project',
        resourceId: projectId,
        metadata: { 
          operationType: bulkAnnotationDto.operation,
          affectedCount: result.processedCount,
        },
      });

      return res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: 'Bulk operation completed successfully',
      });
    } catch (error) {
      this.logger.error(`Failed to process bulk annotations for project ${projectId}`, error);
      throw error;
    }
  }

  @Post('ai-assist')
  @ApiOperation({ summary: 'Get AI assistance for annotation' })
  @ApiResponse({ status: 200, description: 'AI assistance generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid AI assistance request' })
  @Roles(UserRole.ANNOTATOR, UserRole.MANAGER, UserRole.ADMIN)
  async getAIAssistance(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body(ValidationPipe) aiAssistanceDto: AIAssistanceDto,
    @CurrentUser() user: User,
    @Response() res,
  ) {
    try {
      // Validate project access
      await this.annotationsService.validateProjectAccess(projectId, user.organizationId);

      // Get AI assistance
      const aiSuggestions = await this.aiAssistantService.getAnnotationSuggestions(
        projectId,
        aiAssistanceDto,
        user.organizationId,
      );

      // Audit log
      await this.auditService.log({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'ai.assistance_requested',
        resourceType: 'project',
        resourceId: projectId,
        metadata: { 
          fileId: aiAssistanceDto.fileId,
          modelType: aiAssistanceDto.modelType,
          suggestionsCount: aiSuggestions.length,
        },
      });

      return res.status(HttpStatus.OK).json({
        success: true,
        data: aiSuggestions,
        message: 'AI assistance generated successfully',
      });
    } catch (error) {
      this.logger.error(`Failed to get AI assistance for project ${projectId}`, error);
      throw error;
    }
  }

  @Get('export/:format')
  @ApiOperation({ summary: 'Export annotations in specified format' })
  @ApiResponse({ status: 200, description: 'Annotations exported successfully' })
  @ApiResponse({ status: 400, description: 'Invalid export format' })
  @Roles(UserRole.VIEWER, UserRole.ANNOTATOR, UserRole.MANAGER, UserRole.ADMIN)
  async exportAnnotations(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('format') format: string,
    @Query(ValidationPipe) exportDto: AnnotationExportDto,
    @CurrentUser() user: User,
    @Response() res,
  ) {
    try {
      // Validate project access
      await this.annotationsService.validateProjectAccess(projectId, user.organizationId);

      // Export annotations
      const exportResult = await this.annotationsService.exportAnnotations(
        projectId,
        format,
        exportDto,
        user.organizationId,
      );

      // Audit log
      await this.auditService.log({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'annotations.export',
        resourceType: 'project',
        resourceId: projectId,
        metadata: { 
          format,
          exportOptions: exportDto,
          exportedCount: exportResult.count,
        },
      });

      // Set appropriate headers for file download
      res.setHeader('Content-Type', exportResult.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
      res.setHeader('Content-Length', exportResult.size);

      return res.status(HttpStatus.OK).send(exportResult.data);
    } catch (error) {
      this.logger.error(`Failed to export annotations for project ${projectId}`, error);
      throw error;
    }
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get annotation statistics summary' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @Roles(UserRole.VIEWER, UserRole.ANNOTATOR, UserRole.MANAGER, UserRole.ADMIN)
  async getAnnotationStats(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: User,
    @Response() res,
  ) {
    try {
      // Check cache first
      const cacheKey = `annotation_stats:${projectId}`;
      const cachedStats = await this.cacheService.get(cacheKey);
      if (cachedStats) {
        return res.status(HttpStatus.OK).json(cachedStats);
      }

      // Get statistics
      const stats = await this.annotationsService.getAnnotationStats(
        projectId,
        user.organizationId,
      );

      // Cache the result
      await this.cacheService.set(cacheKey, stats, 600); // 10 minutes

      return res.status(HttpStatus.OK).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      this.logger.error(`Failed to get annotation stats for project ${projectId}`, error);
      throw error;
    }
  }
} 