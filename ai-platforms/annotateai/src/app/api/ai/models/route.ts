import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { db } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get models based on filters
    let models;
    if (projectId) {
      models = await db.getProjectModels(projectId);
    } else {
      // For now, return all models the user has access to
      // In production, implement proper user-based filtering
      models = await db.getAllModels();
    }

    // Apply filters
    if (type) {
      models = models.filter(model => model.type === type);
    }
    if (status) {
      models = models.filter(model => model.status === status);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedModels = models.slice(startIndex, endIndex);

    return NextResponse.json({
      models: paginatedModels,
      total: models.length,
      page,
      limit,
      totalPages: Math.ceil(models.length / limit)
    });

  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      type,
      framework,
      projectId,
      templateId,
      trainingConfig,
      datasetId
    } = body;

    // Validate required fields
    if (!name || !type || !framework || !projectId) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, type, framework, projectId' 
      }, { status: 400 });
    }

    // Validate project access
    const hasAccess = await db.checkUserProjectAccess(payload.userId, projectId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to project' }, { status: 403 });
    }

    // Create model record
    const modelData = {
      name,
      description: description || '',
      type,
      framework,
      projectId,
      status: 'training' as const,
      version: 'v1.0.0',
      modelPath: '', // Will be set after training completes
      configPath: undefined,
      weightsPath: undefined,
      trainingConfig: trainingConfig || {},
      trainingDatasetId: datasetId,
      trainingLogs: [],
      deploymentUrl: undefined,
      lastUsedAt: undefined,
      createdBy: payload.userId,
      metrics: {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0
      }
    };

    const model = await db.createAIModel(modelData);

    // In production, this would trigger the actual training job
    // For now, simulate training start
    console.log('Starting model training for:', model.id);

    // TODO: Integrate with actual ML training pipeline
    // - Prepare training data
    // - Submit training job to compute cluster
    // - Set up monitoring and logging
    // - Handle training completion callbacks

    return NextResponse.json({
      model,
      message: 'Model training started successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating model:', error);
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    );
  }
} 