import { NextRequest, NextResponse } from 'next/server';
import { S3Client, CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadPartCommand } from '@aws-sdk/client-s3';
import { verifyToken } from '@/lib/auth/jwt';
import { db } from '@/lib/db/queries';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'annotateai-uploads';

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
    const { fileName, fileSize, fileType, projectId, datasetId, totalChunks } = body;

    // Validate required fields
    if (!fileName || !fileSize || !fileType || !totalChunks) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file size (max 5GB)
    if (fileSize > 5 * 1024 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large' }, { status: 400 });
    }

    // Validate project access if projectId is provided
    if (projectId) {
      const project = await db.getProject(projectId);
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      
      // Check if user has access to the project
      const hasAccess = await db.checkUserProjectAccess(payload.userId, projectId);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Generate unique file key
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `uploads/${payload.userId}/${projectId || 'unassigned'}/${timestamp}-${cleanFileName}`;

    // Create multipart upload
    const createMultipartUploadCommand = new CreateMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
      Metadata: {
        'user-id': payload.userId,
        'project-id': projectId || '',
        'dataset-id': datasetId || '',
        'original-filename': fileName,
        'file-size': fileSize.toString(),
      },
    });

    const multipartUpload = await s3Client.send(createMultipartUploadCommand);
    const uploadId = multipartUpload.UploadId;

    if (!uploadId) {
      return NextResponse.json({ error: 'Failed to create multipart upload' }, { status: 500 });
    }

    // Generate presigned URLs for each chunk
    const uploadUrls: string[] = [];
    for (let i = 1; i <= totalChunks; i++) {
      const uploadPartCommand = new UploadPartCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        UploadId: uploadId,
        PartNumber: i,
      });

      const presignedUrl = await getSignedUrl(s3Client, uploadPartCommand, {
        expiresIn: 3600, // 1 hour
      });

      uploadUrls.push(presignedUrl);
    }

    // Store upload record in database
    const uploadRecord = {
      id: `upload_${timestamp}`,
      uploadId,
      fileKey,
      fileName,
      fileSize,
      fileType,
      userId: payload.userId,
      projectId,
      datasetId,
      totalChunks,
      status: 'initialized',
      createdAt: new Date().toISOString(),
    };

    await db.createUploadRecord(uploadRecord);

    return NextResponse.json({
      uploadId,
      fileKey,
      uploadUrls,
      totalChunks,
    });
  } catch (error) {
    console.error('Upload initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize upload' },
      { status: 500 }
    );
  }
} 