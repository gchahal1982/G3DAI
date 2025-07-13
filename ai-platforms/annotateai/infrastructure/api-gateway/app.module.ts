/**
 * AnnotateAI API Gateway - Main Application Module
 * Phase 3 Production AI Deployment - Root Module Configuration
 * 
 * This module coordinates all API gateway services and controllers.
 * Replaces all mock API endpoints with real production services.
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ProjectsModule } from './projects/projects.module';
import { DatasetsModule } from './datasets/datasets.module';
import { AnnotationsModule } from './annotations/annotations.module';
import { AIModelsModule } from './ai-models/ai-models.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { FilesModule } from './files/files.module';
import { WebSocketModule } from './websocket/websocket.module';
import { RedisModule } from './redis/redis.module';
import { StorageModule } from './storage/storage.module';
import { LoggerModule } from './logger/logger.module';
import { validationSchema } from './config/validation.schema';
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('THROTTLE_TTL', 60),
        limit: configService.get<number>('THROTTLE_LIMIT', 100),
      }),
    }),

    // Core infrastructure
    PrismaModule,
    RedisModule,
    StorageModule,
    LoggerModule,
    WebSocketModule,

    // Authentication & Authorization
    AuthModule,

    // Business logic modules
    OrganizationsModule,
    ProjectsModule,
    DatasetsModule,
    AnnotationsModule,
    AIModelsModule,
    CollaborationModule,
    AnalyticsModule,
    EnterpriseModule,
    FilesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    // Log configuration on startup
    console.log('🔧 API Gateway Configuration:');
    console.log(`   Database: ${this.configService.get('DATABASE_URL') ? 'Configured' : 'Not configured'}`);
    console.log(`   Redis: ${this.configService.get('REDIS_URL') ? 'Configured' : 'Not configured'}`);
    console.log(`   S3: ${this.configService.get('AWS_S3_BUCKET') ? 'Configured' : 'Not configured'}`);
    console.log(`   AI Service: ${this.configService.get('AI_SERVICE_URL') ? 'Configured' : 'Not configured'}`);
    console.log(`   Environment: ${this.configService.get('NODE_ENV', 'development')}`);
  }
} 