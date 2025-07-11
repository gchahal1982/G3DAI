'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface FileItem {
  key: string;
  fileName: string;
  contentType: string;
  size: number;
  lastModified: string;
  url: string;
  cdnUrl?: string;
  metadata?: Record<string, any>;
  annotationStatus?: 'not_started' | 'in_progress' | 'completed' | 'reviewed';
  thumbnailUrl?: string;
}

interface DatasetViewerProps {
  datasetId?: string;
  projectId?: string;
  files?: FileItem[];
  onFileSelect?: (files: FileItem[]) => void;
  onFileAction?: (action: string, files: FileItem[]) => void;
  viewMode?: 'grid' | 'list' | 'table';
  allowSelection?: boolean;
  allowUpload?: boolean;
}

const ANNOTATION_STATUS_COLORS = {
  not_started: 'bg-gray-500',
  in_progress: 'bg-yellow-500',
  completed: 'bg-green-500',
  reviewed: 'bg-blue-500',
};

const ANNOTATION_STATUS_LABELS = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  reviewed: 'Reviewed',
};

export default function DatasetViewer({
  datasetId,
  projectId,
  files = [],
  onFileSelect,
  onFileAction,
  viewMode = 'grid',
  allowSelection = true,
  allowUpload = true,
}: DatasetViewerProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>(files);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<{
    contentType: string;
    annotationStatus: string;
    search: string;
  }>({
    contentType: 'all',
    annotationStatus: 'all',
    search: '',
  });
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);

  // File filtering and sorting
  useEffect(() => {
    let filtered = [...files];

    // Apply search filter
    if (filterBy.search) {
      const searchLower = filterBy.search.toLowerCase();
      filtered = filtered.filter(file =>
        file.fileName.toLowerCase().includes(searchLower) ||
        file.contentType.toLowerCase().includes(searchLower)
      );
    }

    // Apply content type filter
    if (filterBy.contentType !== 'all') {
      filtered = filtered.filter(file => {
        if (filterBy.contentType === 'images') {
          return file.contentType.startsWith('image/');
        } else if (filterBy.contentType === 'videos') {
          return file.contentType.startsWith('video/');
        } else if (filterBy.contentType === 'documents') {
          return file.contentType.includes('pdf') || file.contentType.includes('text');
        }
        return file.contentType === filterBy.contentType;
      });
    }

    // Apply annotation status filter
    if (filterBy.annotationStatus !== 'all') {
      filtered = filtered.filter(file => file.annotationStatus === filterBy.annotationStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.fileName.localeCompare(b.fileName);
          break;
        case 'date':
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.contentType.localeCompare(b.contentType);
          break;
        case 'status':
          const statusOrder = { not_started: 0, in_progress: 1, completed: 2, reviewed: 3 };
          comparison = (statusOrder[a.annotationStatus || 'not_started'] || 0) - 
                      (statusOrder[b.annotationStatus || 'not_started'] || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredFiles(filtered);
  }, [files, filterBy, sortBy, sortOrder]);

  const handleFileSelection = useCallback((file: FileItem, isSelected: boolean) => {
    if (!allowSelection) return;

    let newSelectedFiles: FileItem[];
    if (isSelected) {
      newSelectedFiles = [...selectedFiles, file];
    } else {
      newSelectedFiles = selectedFiles.filter(f => f.key !== file.key);
    }
    
    setSelectedFiles(newSelectedFiles);
    onFileSelect?.(newSelectedFiles);
  }, [selectedFiles, allowSelection, onFileSelect]);

  const handleSelectAll = useCallback(() => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
      onFileSelect?.([]);
    } else {
      setSelectedFiles([...filteredFiles]);
      onFileSelect?.(filteredFiles);
    }
  }, [selectedFiles, filteredFiles, onFileSelect]);

  const handleBulkAction = useCallback((action: string) => {
    if (selectedFiles.length === 0) return;
    onFileAction?.(action, selectedFiles);
  }, [selectedFiles, onFileAction]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (contentType.startsWith('video/')) {
      return (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    } else if (contentType === 'application/pdf') {
      return (
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {filteredFiles.map((file) => {
        const isSelected = selectedFiles.some(f => f.key === file.key);
        return (
          <div
            key={file.key}
            className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300 cursor-pointer ${
              isSelected ? 'border-indigo-500 bg-indigo-500/10' : ''
            }`}
            onClick={() => handleFileSelection(file, !isSelected)}
          >
            {/* File preview */}
            <div className="aspect-square bg-white/5 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
              {file.contentType.startsWith('image/') && file.thumbnailUrl ? (
                <Image
                  src={file.thumbnailUrl || file.url}
                  alt={file.fileName}
                  width={150}
                  height={150}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="text-4xl">
                  {getFileIcon(file.contentType)}
                </div>
              )}
            </div>

            {/* File info */}
            <div className="space-y-2">
              <h3 className="text-white text-sm font-medium truncate" title={file.fileName}>
                {file.fileName}
              </h3>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">{formatFileSize(file.size)}</span>
                {file.annotationStatus && (
                  <div className={`w-2 h-2 rounded-full ${ANNOTATION_STATUS_COLORS[file.annotationStatus]}`} 
                       title={ANNOTATION_STATUS_LABELS[file.annotationStatus]} />
                )}
              </div>

              {allowSelection && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleFileSelection(file, e.target.checked)}
                    className="w-4 h-4 text-indigo-600 bg-white/10 border-white/20 rounded focus:ring-indigo-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {filteredFiles.map((file) => {
        const isSelected = selectedFiles.some(f => f.key === file.key);
        return (
          <div
            key={file.key}
            className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300 cursor-pointer ${
              isSelected ? 'border-indigo-500 bg-indigo-500/10' : ''
            }`}
            onClick={() => handleFileSelection(file, !isSelected)}
          >
            <div className="flex items-center space-x-4">
              {allowSelection && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleFileSelection(file, e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-white/10 border-white/20 rounded focus:ring-indigo-500"
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              <div className="flex-shrink-0">
                {getFileIcon(file.contentType)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{file.fileName}</p>
                <p className="text-white/70 text-sm">{file.contentType}</p>
              </div>

              <div className="flex items-center space-x-4 text-sm text-white/70">
                <span>{formatFileSize(file.size)}</span>
                <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                {file.annotationStatus && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${ANNOTATION_STATUS_COLORS[file.annotationStatus]}`} />
                    <span>{ANNOTATION_STATUS_LABELS[file.annotationStatus]}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTableView = () => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              {allowSelection && (
                <th className="text-left py-4 px-6">
                  <input
                    type="checkbox"
                    checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-indigo-600 bg-white/10 border-white/20 rounded focus:ring-indigo-500"
                  />
                </th>
              )}
              <th className="text-left py-4 px-6 text-white/80 font-medium">Name</th>
              <th className="text-left py-4 px-6 text-white/80 font-medium">Type</th>
              <th className="text-left py-4 px-6 text-white/80 font-medium">Size</th>
              <th className="text-left py-4 px-6 text-white/80 font-medium">Modified</th>
              <th className="text-left py-4 px-6 text-white/80 font-medium">Status</th>
              <th className="text-left py-4 px-6 text-white/80 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {filteredFiles.map((file) => {
              const isSelected = selectedFiles.some(f => f.key === file.key);
              return (
                <tr key={file.key} className="border-t border-white/10 hover:bg-white/5">
                  {allowSelection && (
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleFileSelection(file, e.target.checked)}
                        className="w-4 h-4 text-indigo-600 bg-white/10 border-white/20 rounded focus:ring-indigo-500"
                      />
                    </td>
                  )}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.contentType)}
                      <span className="font-medium">{file.fileName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white/70">{file.contentType}</td>
                  <td className="py-4 px-6 text-white/70">{formatFileSize(file.size)}</td>
                  <td className="py-4 px-6 text-white/70">{new Date(file.lastModified).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    {file.annotationStatus && (
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${ANNOTATION_STATUS_COLORS[file.annotationStatus]}`} />
                        <span className="text-white/70 text-sm">{ANNOTATION_STATUS_LABELS[file.annotationStatus]}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button className="text-indigo-400 hover:text-indigo-300 text-sm">View</button>
                      <button className="text-green-400 hover:text-green-300 text-sm">Annotate</button>
                      <button className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-sm">Search:</span>
            <input
              type="text"
              placeholder="Search files..."
              value={filterBy.search}
              onChange={(e) => setFilterBy(prev => ({ ...prev, search: e.target.value }))}
              className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
            />
          </div>

          {/* Content type filter */}
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-sm">Type:</span>
            <select
              value={filterBy.contentType}
              onChange={(e) => setFilterBy(prev => ({ ...prev, contentType: e.target.value }))}
              className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
            >
              <option value="all">All Types</option>
              <option value="images">Images</option>
              <option value="videos">Videos</option>
              <option value="documents">Documents</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-sm">Status:</span>
            <select
              value={filterBy.annotationStatus}
              onChange={(e) => setFilterBy(prev => ({ ...prev, annotationStatus: e.target.value }))}
              className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-sm">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="type">Type</option>
              <option value="status">Status</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 text-sm border border-white/10 hover:border-indigo-500/50"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setCurrentViewMode('grid')}
              className={`p-3 rounded-xl transition-all duration-200 ${
                currentViewMode === 'grid' 
                  ? 'bg-indigo-600 border-indigo-500' 
                  : 'bg-white/10 hover:bg-white/20 border-white/10 hover:border-indigo-500/50'
              } text-white border`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentViewMode('list')}
              className={`p-3 rounded-xl transition-all duration-200 ${
                currentViewMode === 'list' 
                  ? 'bg-indigo-600 border-indigo-500' 
                  : 'bg-white/10 hover:bg-white/20 border-white/10 hover:border-indigo-500/50'
              } text-white border`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentViewMode('table')}
              className={`p-3 rounded-xl transition-all duration-200 ${
                currentViewMode === 'table' 
                  ? 'bg-indigo-600 border-indigo-500' 
                  : 'bg-white/10 hover:bg-white/20 border-white/10 hover:border-indigo-500/50'
              } text-white border`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M7 4v16M17 4v16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedFiles.length > 0 && (
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <span className="text-white/80 text-sm">{selectedFiles.length} selected</span>
            <button
              onClick={() => handleBulkAction('annotate')}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              Start Annotation
            </button>
            <button
              onClick={() => handleBulkAction('download')}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              Download
            </button>
            <button
              onClick={() => handleBulkAction('export')}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
            >
              Export
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* File count and status */}
      <div className="flex items-center justify-between text-white/70 text-sm">
        <span>{filteredFiles.length} files</span>
        {filteredFiles.length !== files.length && (
          <span>({files.length - filteredFiles.length} filtered out)</span>
        )}
      </div>

      {/* File display */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <div className="text-white/40 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-2">No files found</h3>
          <p className="text-white/70 mb-4">
            {files.length === 0 
              ? 'Upload some files to get started' 
              : 'Try adjusting your filters to see more files'
            }
          </p>
          {allowUpload && files.length === 0 && (
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-medium">
              Upload Files
            </button>
          )}
        </div>
      ) : (
        <>
          {currentViewMode === 'grid' && renderGridView()}
          {currentViewMode === 'list' && renderListView()}
          {currentViewMode === 'table' && renderTableView()}
        </>
      )}
    </div>
  );
} 