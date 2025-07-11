import { NextRequest, NextResponse } from 'next/server';
import { S3Client, CompleteMultipartUploadCommand, ListPartsCommand } from '@aws-sdk/client-s3';
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
const CDN_DOMAIN = process.env.CDN_DOMAIN || `https://${BUCKET_NAME}.s3.amazonaws.com`;

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
    const { uploadId, fileName, projectId, datasetId } = body;

    // Validate required fields
    if (!uploadId || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate file key (same as in init endpoint)
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `uploads/${payload.userId}/${projectId || 'unassigned'}/${timestamp}-${cleanFileName}`;

    try {
      // List all parts that were uploaded
      const listPartsCommand = new ListPartsCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        UploadId: uploadId,
      });

      const listPartsResult = await s3Client.send(listPartsCommand);
      const parts = listPartsResult.Parts || [];

      if (parts.length === 0) {
        return NextResponse.json({ error: 'No parts found for upload' }, { status: 400 });
      }

      // Complete the multipart upload
      const completeMultipartUploadCommand = new CompleteMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map(part => ({
            ETag: part.ETag,
            PartNumber: part.PartNumber,
          })),
        },
      });

      const result = await s3Client.send(completeMultipartUploadCommand);
      
      if (!result.Location) {
        return NextResponse.json({ error: 'Failed to complete upload' }, { status: 500 });
      }

      // Generate CDN URL
      const fileUrl = `${CDN_DOMAIN}/${fileKey}`;

      // Create data file record in database
      const fileSize = parts.reduce((total, part) => total + (part.Size || 0), 0);
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      
      let fileType = 'other';
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
        fileType = 'image';
      } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(fileExtension)) {
        fileType = 'video';
      } else if (['dcm', 'dicom'].includes(fileExtension)) {
        fileType = 'medical';
      }

      const dataFileRecord = {
        datasetId: datasetId || `dataset-${Date.now()}`,
        projectId: projectId || '',
        filename: fileName,
        originalFilename: fileName,
        fileType: fileType,
        fileSize: fileSize,
        filePath: fileUrl,
        thumbnailPath: undefined,
        metadata: {
          uploadId,
          width: undefined,
          height: undefined,
          duration: undefined,
          fps: undefined,
          colorSpace: undefined,
          exif: {},
          custom: {
            s3Key: fileKey,
            originalSize: fileSize,
            compressionRatio: 1,
            checksum: '',
            previewUrl: fileUrl
          }
        },
        annotationStatus: 'pending' as const,
        annotationCount: 0,
        reviewStatus: 'pending' as const,
        assignedTo: undefined,
        assignedAt: undefined,
        reviewedBy: undefined,
        reviewedAt: undefined,
        qualityScore: undefined,
        difficultyLevel: undefined,
        aiPredictions: undefined,
        aiConfidence: undefined,
        lastAnnotatedAt: undefined
      };

      const dataFile = await db.createDataFile(dataFileRecord);

      // Update upload record status
      console.log('Upload completed successfully:', {
        uploadId,
        fileKey,
        fileUrl,
        dataFileId: dataFile.id,
      });

      return NextResponse.json({
        success: true,
        fileUrl,
        fileKey,
        dataFileId: dataFile.id,
        size: fileSize,
        type: fileType,
      });

    } catch (s3Error) {
      console.error('S3 error:', s3Error);
      return NextResponse.json(
        { error: 'Failed to complete S3 upload' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Upload completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete upload' },
      { status: 500 }
    );
  }
} 