import { NextRequest, NextResponse } from 'next/server';
import { getFileMetadata, fileExists } from '@/lib/storage/s3';

interface FileValidationRequest {
  key: string;
  fileName?: string;
  expectedContentType?: string;
  expectedSize?: number;
  checksumType?: 'md5' | 'sha256';
  expectedChecksum?: string;
}

interface FileValidationResult {
  isValid: boolean;
  file: {
    key: string;
    fileName: string;
    contentType: string;
    size: number;
    lastModified: string;
    etag: string;
    url: string;
    cdnUrl?: string;
    metadata?: Record<string, string>;
  };
  validation: {
    exists: boolean;
    sizeMatch: boolean;
    typeMatch: boolean;
    checksumMatch?: boolean;
    isSafeContent: boolean;
    hasValidExtension: boolean;
  };
  errors: string[];
  warnings: string[];
}

function validateFileValidationRequest(body: any): FileValidationRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be an object');
  }

  if (!body.key || typeof body.key !== 'string') {
    throw new Error('File key is required');
  }

  return body as FileValidationRequest;
}

function isValidFileExtension(fileName: string, contentType: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (!extension) return false;

  const validExtensions: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'image/bmp': ['bmp'],
    'image/tiff': ['tiff', 'tif'],
    'video/mp4': ['mp4'],
    'video/avi': ['avi'],
    'video/mov': ['mov'],
    'video/wmv': ['wmv'],
    'video/webm': ['webm'],
    'video/mkv': ['mkv'],
    'application/pdf': ['pdf'],
    'text/plain': ['txt'],
    'text/csv': ['csv'],
    'application/zip': ['zip'],
    'application/dicom': ['dcm', 'dicom'],
  };

  const expectedExtensions = validExtensions[contentType.toLowerCase()];
  return expectedExtensions ? expectedExtensions.includes(extension) : true;
}

function detectDangerousContent(fileName: string, contentType: string): string[] {
  const warnings: string[] = [];
  const extension = fileName.split('.').pop()?.toLowerCase();

  // Check for executable files
  const executableExtensions = ['exe', 'bat', 'cmd', 'scr', 'jar', 'app', 'deb', 'rpm'];
  if (extension && executableExtensions.includes(extension)) {
    warnings.push('File appears to be executable');
  }

  // Check for script files
  const scriptExtensions = ['js', 'php', 'py', 'rb', 'sh', 'ps1'];
  if (extension && scriptExtensions.includes(extension)) {
    warnings.push('File appears to be a script');
  }

  // Check for suspicious content types
  const dangerousTypes = [
    'application/x-executable',
    'application/x-msdownload',
    'application/x-shockwave-flash',
  ];
  if (dangerousTypes.includes(contentType.toLowerCase())) {
    warnings.push('Content type may contain executable code');
  }

  return warnings;
}

function extractMetadataFromFile(fileMetadata: any): Record<string, any> {
  const extracted: Record<string, any> = {};

  // Extract common metadata
  if (fileMetadata.contentType) {
    extracted.contentType = fileMetadata.contentType;
    
    // Check if it's an image
    if (fileMetadata.contentType.startsWith('image/')) {
      extracted.mediaType = 'image';
      // TODO: Extract image dimensions, color space, etc.
      // This would require downloading and analyzing the file
    }
    
    // Check if it's a video
    if (fileMetadata.contentType.startsWith('video/')) {
      extracted.mediaType = 'video';
      // TODO: Extract video duration, resolution, codec, etc.
    }
    
    // Check if it's a document
    if (fileMetadata.contentType === 'application/pdf') {
      extracted.mediaType = 'document';
      // TODO: Extract page count, text content, etc.
    }
  }

  // Extract file extension and format
  const fileName = fileMetadata.fileName || '';
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension) {
    extracted.extension = extension;
    extracted.format = extension;
  }

  // File size categories
  const sizeCategories = {
    tiny: 1024, // 1KB
    small: 1024 * 1024, // 1MB
    medium: 10 * 1024 * 1024, // 10MB
    large: 100 * 1024 * 1024, // 100MB
    huge: 1024 * 1024 * 1024, // 1GB
  };

  let sizeCategory = 'huge';
  for (const [category, threshold] of Object.entries(sizeCategories)) {
    if (fileMetadata.size <= threshold) {
      sizeCategory = category;
      break;
    }
  }
  extracted.sizeCategory = sizeCategory;

  return extracted;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateFileValidationRequest(body);

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if file exists
    const exists = await fileExists(validatedData.key);
    if (!exists) {
      return NextResponse.json({
        success: false,
        error: 'File not found',
        validation: { exists: false }
      }, { status: 404 });
    }

    // Get file metadata
    const fileMetadata = await getFileMetadata(validatedData.key);

    // Validate file size
    let sizeMatch = true;
    if (validatedData.expectedSize && fileMetadata.size !== validatedData.expectedSize) {
      sizeMatch = false;
      errors.push(`Size mismatch: expected ${validatedData.expectedSize}, got ${fileMetadata.size}`);
    }

    // Validate content type
    let typeMatch = true;
    if (validatedData.expectedContentType && fileMetadata.contentType !== validatedData.expectedContentType) {
      typeMatch = false;
      errors.push(`Content type mismatch: expected ${validatedData.expectedContentType}, got ${fileMetadata.contentType}`);
    }

    // Validate file extension
    const hasValidExtension = isValidFileExtension(fileMetadata.fileName, fileMetadata.contentType);
    if (!hasValidExtension) {
      warnings.push('File extension does not match content type');
    }

    // Check for dangerous content
    const contentWarnings = detectDangerousContent(fileMetadata.fileName, fileMetadata.contentType);
    warnings.push(...contentWarnings);

    // Extract additional metadata
    const extractedMetadata = extractMetadataFromFile(fileMetadata);

    // TODO: Validate checksum if provided
    let checksumMatch: boolean | undefined = undefined;
    if (validatedData.expectedChecksum && validatedData.checksumType) {
      // This would require downloading the file and computing the checksum
      // For now, we'll skip this validation
      checksumMatch = undefined;
      warnings.push('Checksum validation not implemented');
    }

    const validation = {
      exists: true,
      sizeMatch,
      typeMatch,
      checksumMatch,
      isSafeContent: contentWarnings.length === 0,
      hasValidExtension,
    };

    const isValid = validation.exists && 
                   validation.sizeMatch && 
                   validation.typeMatch && 
                   validation.isSafeContent &&
                   (validation.checksumMatch !== false);

    const result: FileValidationResult = {
      isValid,
      file: {
        key: fileMetadata.key,
        fileName: fileMetadata.fileName,
        contentType: fileMetadata.contentType,
        size: fileMetadata.size,
        lastModified: fileMetadata.lastModified.toISOString(),
        etag: fileMetadata.etag,
        url: fileMetadata.url,
        cdnUrl: fileMetadata.cdnUrl,
        metadata: {
          ...fileMetadata.metadata,
          ...extractedMetadata,
        },
      },
      validation,
      errors,
      warnings,
    };

    return NextResponse.json({
      success: true,
      result,
    }, { status: 200 });

  } catch (error) {
    console.error('File validation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to validate file',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Batch validation endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!Array.isArray(body.files)) {
      return NextResponse.json({
        success: false,
        error: 'Files array is required',
      }, { status: 400 });
    }

    const results = await Promise.all(
      body.files.map(async (fileData: any) => {
        try {
          const validatedData = validateFileValidationRequest(fileData);
          
          // Simplified validation for batch processing
          const exists = await fileExists(validatedData.key);
          if (!exists) {
            return {
              key: validatedData.key,
              isValid: false,
              error: 'File not found',
            };
          }

          const fileMetadata = await getFileMetadata(validatedData.key);
          const hasValidExtension = isValidFileExtension(fileMetadata.fileName, fileMetadata.contentType);
          const contentWarnings = detectDangerousContent(fileMetadata.fileName, fileMetadata.contentType);

          return {
            key: validatedData.key,
            isValid: hasValidExtension && contentWarnings.length === 0,
            file: {
              fileName: fileMetadata.fileName,
              contentType: fileMetadata.contentType,
              size: fileMetadata.size,
            },
            warnings: contentWarnings,
          };

        } catch (error) {
          return {
            key: fileData.key || 'unknown',
            isValid: false,
            error: error instanceof Error ? error.message : 'Validation failed',
          };
        }
      })
    );

    const validFiles = results.filter(r => r.isValid);
    const invalidFiles = results.filter(r => !r.isValid);

    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        valid: validFiles.length,
        invalid: invalidFiles.length,
      },
      results,
    }, { status: 200 });

  } catch (error) {
    console.error('Batch validation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to validate files',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 