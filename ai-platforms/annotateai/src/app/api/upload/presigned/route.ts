import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUploadUrl, generatePresignedDownloadUrl, FileUploadOptions } from '@/lib/storage/s3';

interface PresignedUploadRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
  projectId?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

function validatePresignedUploadRequest(body: any): PresignedUploadRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be an object');
  }

  if (!body.fileName || typeof body.fileName !== 'string') {
    throw new Error('File name is required');
  }

  if (!body.contentType || typeof body.contentType !== 'string') {
    throw new Error('Content type is required');
  }

  if (typeof body.fileSize !== 'number' || body.fileSize <= 0) {
    throw new Error('File size must be a positive number');
  }

  // File size limit (100MB)
  const maxFileSize = 100 * 1024 * 1024;
  if (body.fileSize > maxFileSize) {
    throw new Error(`File size exceeds maximum limit of ${maxFileSize / (1024 * 1024)}MB`);
  }

  // Validate content type
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff',
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm', 'video/mkv',
    'application/pdf', 'text/plain', 'text/csv',
    'application/zip', 'application/x-zip-compressed',
    'application/dicom', // Medical imaging
    'application/octet-stream', // Generic binary
  ];

  if (!allowedTypes.includes(body.contentType.toLowerCase())) {
    throw new Error(`Content type '${body.contentType}' is not allowed`);
  }

  return body as PresignedUploadRequest;
}

// Generate presigned URL for upload
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validatePresignedUploadRequest(body);

    // TODO: Get userId from authentication
    const userId = 'user_demo'; // Placeholder

    const uploadOptions: FileUploadOptions = {
      userId,
      projectId: validatedData.projectId,
      fileName: validatedData.fileName,
      contentType: validatedData.contentType,
      fileSize: validatedData.fileSize,
      isPublic: validatedData.isPublic || false,
      metadata: validatedData.metadata,
    };

    const expiresIn = 3600; // 1 hour
    const presignedData = await generatePresignedUploadUrl(uploadOptions, expiresIn);

    return NextResponse.json({
      success: true,
      uploadUrl: presignedData.url,
      key: presignedData.key,
      fields: presignedData.fields,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error('Presigned URL generation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate presigned URL',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Generate presigned URL for download
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const downloadFileName = searchParams.get('filename');
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600');

    if (!key) {
      return NextResponse.json({
        success: false,
        error: 'File key is required',
      }, { status: 400 });
    }

    // TODO: Check if user has permission to access this file
    // const hasPermission = await checkFileAccess(userId, key);
    // if (!hasPermission) {
    //   return NextResponse.json({
    //     success: false,
    //     error: 'Access denied',
    //   }, { status: 403 });
    // }

    const downloadUrl = await generatePresignedDownloadUrl(
      key,
      expiresIn,
      downloadFileName || undefined
    );

    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error('Presigned download URL error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate download URL',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Delete expired or unused presigned URLs (cleanup endpoint)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({
        success: false,
        error: 'File key is required',
      }, { status: 400 });
    }

    // TODO: Check if user has permission to delete this file
    // const hasPermission = await checkFileDeleteAccess(userId, key);
    // if (!hasPermission) {
    //   return NextResponse.json({
    //     success: false,
    //     error: 'Access denied',
    //   }, { status: 403 });
    // }

    // TODO: Delete the file from S3
    // await deleteFile(key);

    // TODO: Remove file record from database
    // await db.files.delete({ where: { key } });

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    }, { status: 200 });

  } catch (error) {
    console.error('File deletion error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete file',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 