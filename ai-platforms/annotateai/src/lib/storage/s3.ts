import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Configuration
const S3_CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  bucket: process.env.AWS_S3_BUCKET || 'annotateai-storage',
  cdnDomain: process.env.AWS_CLOUDFRONT_DOMAIN || '',
};

// Initialize S3 Client
const s3Client = new S3Client({
  region: S3_CONFIG.region,
  credentials: {
    accessKeyId: S3_CONFIG.accessKeyId,
    secretAccessKey: S3_CONFIG.secretAccessKey,
  },
});

// File upload interface
export interface FileUploadOptions {
  userId: string;
  projectId?: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  isPublic?: boolean;
  metadata?: Record<string, string>;
  tags?: Record<string, string>;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileMetadata {
  key: string;
  fileName: string;
  contentType: string;
  size: number;
  lastModified: Date;
  etag: string;
  url: string;
  cdnUrl?: string;
  metadata?: Record<string, string>;
  tags?: Record<string, string>;
}

// Generate S3 key for file organization
export function generateS3Key(options: FileUploadOptions): string {
  const { userId, projectId, fileName } = options;
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const randomId = Math.random().toString(36).substring(2, 15);
  
  if (projectId) {
    return `projects/${projectId}/uploads/${timestamp}/${randomId}-${fileName}`;
  } else {
    return `users/${userId}/uploads/${timestamp}/${randomId}-${fileName}`;
  }
}

// Upload file to S3
export async function uploadFile(
  file: Buffer | Uint8Array | Blob,
  options: FileUploadOptions,
  onProgress?: (progress: UploadProgress) => void
): Promise<FileMetadata> {
  try {
    const key = generateS3Key(options);
    
    // Prepare metadata
    const metadata = {
      'user-id': options.userId,
      'original-name': options.fileName,
      'upload-timestamp': new Date().toISOString(),
      ...options.metadata,
    };

    // Prepare tags
    const tags = {
      'Environment': process.env.NODE_ENV || 'development',
      'Service': 'AnnotateAI',
      'UserId': options.userId,
      ...options.tags,
    };

    const tagsString = Object.entries(tags)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
      Body: file,
      ContentType: options.contentType,
      Metadata: metadata,
      Tagging: tagsString,
      ACL: options.isPublic ? 'public-read' : 'private',
      ServerSideEncryption: 'AES256',
      StorageClass: 'STANDARD',
    });

    // Simulate progress tracking for large files
    if (onProgress && options.fileSize > 1024 * 1024) { // Files > 1MB
      const progressInterval = setInterval(() => {
        const progress = Math.min(Math.random() * 100, 95);
        onProgress({
          loaded: Math.round((progress / 100) * options.fileSize),
          total: options.fileSize,
          percentage: Math.round(progress),
        });
      }, 500);

      try {
        const result = await s3Client.send(command);
        clearInterval(progressInterval);
        
        // Final progress update
        onProgress({
          loaded: options.fileSize,
          total: options.fileSize,
          percentage: 100,
        });

        return await getFileMetadata(key);
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    } else {
      await s3Client.send(command);
      return await getFileMetadata(key);
    }
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

// Get file metadata
export async function getFileMetadata(key: string): Promise<FileMetadata> {
  try {
    const command = new HeadObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
    });

    const result = await s3Client.send(command);

    const url = `https://${S3_CONFIG.bucket}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`;
    const cdnUrl = S3_CONFIG.cdnDomain ? `https://${S3_CONFIG.cdnDomain}/${key}` : undefined;

    return {
      key,
      fileName: result.Metadata?.['original-name'] || key.split('/').pop() || 'unknown',
      contentType: result.ContentType || 'application/octet-stream',
      size: result.ContentLength || 0,
      lastModified: result.LastModified || new Date(),
      etag: result.ETag?.replace(/"/g, '') || '',
      url,
      cdnUrl,
      metadata: result.Metadata,
      tags: {}, // Tags would need to be fetched separately
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw new Error(`Failed to get file metadata: ${error.message}`);
  }
}

// Generate presigned URL for direct client upload
export async function generatePresignedUploadUrl(
  options: FileUploadOptions,
  expiresIn: number = 3600 // 1 hour
): Promise<{ url: string; key: string; fields: Record<string, string> }> {
  try {
    const key = generateS3Key(options);
    
    const metadata = {
      'user-id': options.userId,
      'original-name': options.fileName,
      'upload-timestamp': new Date().toISOString(),
      ...options.metadata,
    };

    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
      ContentType: options.contentType,
      Metadata: metadata,
      ACL: options.isPublic ? 'public-read' : 'private',
      ServerSideEncryption: 'AES256',
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    return {
      url,
      key,
      fields: {
        'Content-Type': options.contentType,
        'x-amz-server-side-encryption': 'AES256',
        'x-amz-acl': options.isPublic ? 'public-read' : 'private',
      },
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
}

// Generate presigned URL for file download
export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600, // 1 hour
  downloadFileName?: string
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
      ResponseContentDisposition: downloadFileName 
        ? `attachment; filename="${downloadFileName}"` 
        : undefined,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating presigned download URL:', error);
    throw new Error(`Failed to generate presigned download URL: ${error.message}`);
  }
}

// Delete file from S3
export async function deleteFile(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

// Copy file within S3
export async function copyFile(
  sourceKey: string,
  destinationKey: string,
  metadata?: Record<string, string>
): Promise<FileMetadata> {
  try {
    const command = new CopyObjectCommand({
      Bucket: S3_CONFIG.bucket,
      CopySource: `${S3_CONFIG.bucket}/${sourceKey}`,
      Key: destinationKey,
      MetadataDirective: metadata ? 'REPLACE' : 'COPY',
      Metadata: metadata,
      ServerSideEncryption: 'AES256',
    });

    await s3Client.send(command);
    return await getFileMetadata(destinationKey);
  } catch (error) {
    console.error('Error copying file in S3:', error);
    throw new Error(`Failed to copy file: ${error.message}`);
  }
}

// List files in a directory/prefix
export async function listFiles(
  prefix: string,
  maxKeys: number = 1000,
  continuationToken?: string
): Promise<{
  files: FileMetadata[];
  nextContinuationToken?: string;
  isTruncated: boolean;
}> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: S3_CONFIG.bucket,
      Prefix: prefix,
      MaxKeys: maxKeys,
      ContinuationToken: continuationToken,
    });

    const result = await s3Client.send(command);

    const files: FileMetadata[] = [];
    
    if (result.Contents) {
      for (const object of result.Contents) {
        if (object.Key) {
          try {
            const metadata = await getFileMetadata(object.Key);
            files.push(metadata);
          } catch (error) {
            // Skip files that can't be accessed
            console.warn(`Could not get metadata for ${object.Key}:`, error.message);
          }
        }
      }
    }

    return {
      files,
      nextContinuationToken: result.NextContinuationToken,
      isTruncated: result.IsTruncated || false,
    };
  } catch (error) {
    console.error('Error listing files from S3:', error);
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

// Get files for a specific user
export async function getUserFiles(
  userId: string,
  maxKeys: number = 100
): Promise<FileMetadata[]> {
  const prefix = `users/${userId}/uploads/`;
  const result = await listFiles(prefix, maxKeys);
  return result.files;
}

// Get files for a specific project
export async function getProjectFiles(
  projectId: string,
  maxKeys: number = 100
): Promise<FileMetadata[]> {
  const prefix = `projects/${projectId}/uploads/`;
  const result = await listFiles(prefix, maxKeys);
  return result.files;
}

// Batch delete files
export async function deleteFiles(keys: string[]): Promise<{
  deleted: string[];
  failed: { key: string; error: string }[];
}> {
  const deleted: string[] = [];
  const failed: { key: string; error: string }[] = [];

  // Process in batches of 10 to avoid overwhelming S3
  const batchSize = 10;
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    
    const deletePromises = batch.map(async (key) => {
      try {
        await deleteFile(key);
        deleted.push(key);
      } catch (error) {
        failed.push({ key, error: error.message });
      }
    });

    await Promise.all(deletePromises);
  }

  return { deleted, failed };
}

// Get storage usage for a user or project
export async function getStorageUsage(
  prefix: string
): Promise<{
  totalFiles: number;
  totalSize: number;
  sizeByType: Record<string, { count: number; size: number }>;
}> {
  try {
    const result = await listFiles(prefix, 1000);
    
    let totalFiles = 0;
    let totalSize = 0;
    const sizeByType: Record<string, { count: number; size: number }> = {};

    for (const file of result.files) {
      totalFiles++;
      totalSize += file.size;

      const extension = file.fileName.split('.').pop()?.toLowerCase() || 'unknown';
      if (!sizeByType[extension]) {
        sizeByType[extension] = { count: 0, size: 0 };
      }
      sizeByType[extension].count++;
      sizeByType[extension].size += file.size;
    }

    return {
      totalFiles,
      totalSize,
      sizeByType,
    };
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    throw new Error(`Failed to calculate storage usage: ${error.message}`);
  }
}

// Generate CDN URL for a file
export function getCDNUrl(key: string): string {
  if (S3_CONFIG.cdnDomain) {
    return `https://${S3_CONFIG.cdnDomain}/${key}`;
  } else {
    return `https://${S3_CONFIG.bucket}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`;
  }
}

// Check if file exists
export async function fileExists(key: string): Promise<boolean> {
  try {
    await getFileMetadata(key);
    return true;
  } catch (error) {
    return false;
  }
}

// Compress and optimize image
export async function optimizeImage(
  key: string,
  quality: number = 80,
  maxWidth?: number,
  maxHeight?: number
): Promise<FileMetadata> {
  // This would typically use a service like AWS Lambda with Sharp
  // For now, we'll simulate the optimization process
  try {
    const originalMetadata = await getFileMetadata(key);
    const optimizedKey = key.replace(/(\.[^.]+)$/, '-optimized$1');
    
    // In a real implementation, you would:
    // 1. Download the original image
    // 2. Process it with Sharp or similar
    // 3. Upload the optimized version
    // 4. Return the new metadata
    
    // For now, just copy the file with new metadata
    const optimizedMetadata = await copyFile(key, optimizedKey, {
      ...originalMetadata.metadata,
      'optimized': 'true',
      'quality': quality.toString(),
      'max-width': maxWidth?.toString() || '',
      'max-height': maxHeight?.toString() || '',
    });

    return optimizedMetadata;
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw new Error(`Failed to optimize image: ${error.message}`);
  }
}

// Generate multiple image sizes (thumbnails, etc.)
export async function generateImageVariants(
  key: string,
  variants: { name: string; width: number; height: number; quality?: number }[]
): Promise<Record<string, FileMetadata>> {
  const results: Record<string, FileMetadata> = {};
  
  for (const variant of variants) {
    try {
      const variantKey = key.replace(/(\.[^.]+)$/, `-${variant.name}$1`);
      
      // In a real implementation, you would process the image
      // For now, just copy with metadata indicating the variant
      const variantMetadata = await copyFile(key, variantKey, {
        'variant': variant.name,
        'width': variant.width.toString(),
        'height': variant.height.toString(),
        'quality': (variant.quality || 80).toString(),
      });
      
      results[variant.name] = variantMetadata;
    } catch (error) {
      console.error(`Error generating variant ${variant.name}:`, error);
    }
  }
  
  return results;
}

// Cleanup old files (for maintenance)
export async function cleanupOldFiles(
  prefix: string,
  olderThanDays: number
): Promise<{
  deleted: string[];
  failed: { key: string; error: string }[];
}> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  const result = await listFiles(prefix, 1000);
  const oldFiles = result.files.filter(file => file.lastModified < cutoffDate);
  const oldKeys = oldFiles.map(file => file.key);
  
  return await deleteFiles(oldKeys);
}

// Export S3 client for advanced operations
export { s3Client, S3_CONFIG }; 