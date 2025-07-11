'use client';

import React, { useState, useCallback, useRef } from 'react';

interface FileUploaderProps {
  onFilesUploaded: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesUploaded,
  acceptedFileTypes = ['image/*', '.zip', '.json'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileRejections, setFileRejections] = useState<Array<{file: File, errors: string[]}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string[] => {
    const errors: string[] = [];
    
    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`File size exceeds ${Math.round(maxFileSize / (1024 * 1024))}MB`);
    }
    
    // Check file type
    const isValidType = acceptedFileTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.type === type || file.name.toLowerCase().endsWith(type);
    });
    
    if (!isValidType) {
      errors.push('File type not supported');
    }
    
    return errors;
  };

  const processFiles = useCallback(async (files: File[]) => {
    setUploading(true);
    setUploadProgress(0);
    setFileRejections([]);

    const rejectedFiles: Array<{file: File, errors: string[]}> = [];
    const acceptedFiles: File[] = [];

    // Validate files
    files.forEach(file => {
      const errors = validateFile(file);
      if (errors.length > 0) {
        rejectedFiles.push({ file, errors });
      } else {
        acceptedFiles.push(file);
      }
    });

    setFileRejections(rejectedFiles);

    if (acceptedFiles.length > 0) {
      try {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        onFilesUploaded(acceptedFiles);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    setUploading(false);
    setUploadProgress(0);
  }, [onFilesUploaded, acceptedFileTypes, maxFileSize]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      processFiles(Array.from(selectedFiles));
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin mx-auto h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Uploading files...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            {isDragActive ? (
              <p className="text-lg text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg text-gray-900">
                  Drag and drop files here, or{' '}
                  <span className="text-blue-600 font-medium">browse</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports images, ZIP archives, and JSON files
                </p>
              </div>
            )}
            
            <div className="text-xs text-gray-400">
              <p>Maximum file size: {Math.round(maxFileSize / (1024 * 1024))}MB</p>
              <p>Accepted formats: {acceptedFileTypes.join(', ')}</p>
            </div>
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">Some files were rejected:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {fileRejections.map(({ file, errors }, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="font-medium">{file.name}</span>
                <span>-</span>
                <span>{errors[0]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader; 