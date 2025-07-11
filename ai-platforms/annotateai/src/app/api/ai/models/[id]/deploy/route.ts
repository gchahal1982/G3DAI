import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { db } from '@/lib/db/queries';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const { id } = params;
    const body = await request.json();
    const { action, deployment_config } = body;

    // Get the model
    const model = await db.getAIModelById(id);
    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Check if user has access to the project
    const hasAccess = await db.checkUserProjectAccess(payload.userId, model.projectId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (action === 'deploy') {
      // Validate model is ready for deployment
      if (model.status !== 'ready') {
        return NextResponse.json({
          error: 'Model must be in "ready" status to deploy'
        }, { status: 400 });
      }

      // Generate deployment URL
      const deploymentUrl = `https://api.annotateai.com/models/${model.id}/inference`;

      // Update model status to deployed
      const updatedModel = await db.updateAIModel(id, {
        status: 'deployed',
        deploymentUrl,
        deploymentConfig: deployment_config || {
          instances: 1,
          gpuType: 'nvidia-t4',
          autoScaling: true,
          maxInstances: 3
        }
      });

      // In production, this would:
      // 1. Deploy to Kubernetes cluster
      // 2. Set up load balancer
      // 3. Configure auto-scaling
      // 4. Set up monitoring and logging
      // 5. Run health checks

      console.log('Model deployed successfully:', {
        modelId: id,
        deploymentUrl,
        config: deployment_config
      });

      return NextResponse.json({
        message: 'Model deployed successfully',
        model: updatedModel,
        deploymentUrl
      });

    } else if (action === 'stop') {
      // Validate model is currently deployed
      if (model.status !== 'deployed') {
        return NextResponse.json({
          error: 'Model is not currently deployed'
        }, { status: 400 });
      }

      // Update model status to ready (stopped deployment)
      const updatedModel = await db.updateAIModel(id, {
        status: 'ready',
        deploymentUrl: undefined
      });

      // In production, this would:
      // 1. Remove from Kubernetes cluster
      // 2. Clean up load balancer
      // 3. Stop monitoring
      // 4. Archive logs

      console.log('Model deployment stopped:', {
        modelId: id
      });

      return NextResponse.json({
        message: 'Model deployment stopped successfully',
        model: updatedModel
      });

    } else {
      return NextResponse.json({
        error: 'Invalid action. Use "deploy" or "stop"'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error managing model deployment:', error);
    return NextResponse.json(
      { error: 'Failed to manage model deployment' },
      { status: 500 }
    );
  }
} 