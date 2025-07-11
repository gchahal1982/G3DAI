'use client';

import React, { useState, useEffect } from 'react';
import { FolderIcon, DocumentIcon, ClockIcon, UserIcon, EyeIcon, TrashIcon, ArrowDownTrayIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CloudArrowUpIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import FileUploader from '@/components/upload/FileUploader';

interface Dataset {
  id: string;
  name: string;
  description?: string;
  type: 'images' | 'videos' | 'point_clouds' | 'medical' | 'custom';
  totalFiles: number;
  totalSize: number;
  fileFormats: string[];
  uploadStatus: 'pending' | 'processing' | 'completed' | 'failed';
  uploadProgress: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  createdBy: string;
  projectId: string;
}

interface DataFile {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  annotationStatus: 'pending' | 'in_progress' | 'completed' | 'reviewed' | 'rejected';
  annotationCount: number;
  createdAt: string;
  thumbnailPath?: string;
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [dataFiles, setDataFiles] = useState<DataFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadDatasets();
  }, []);

  useEffect(() => {
    if (selectedDataset) {
      loadDatasetFiles(selectedDataset.id);
    }
  }, [selectedDataset]);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockDatasets: Dataset[] = [
        {
          id: 'dataset-1',
          name: 'Medical Images Dataset',
          description: 'Collection of X-ray and MRI images for diagnostic annotation',
          type: 'medical',
          totalFiles: 1250,
          totalSize: 2.4 * 1024 * 1024 * 1024, // 2.4GB
          fileFormats: ['dcm', 'png', 'jpg'],
          uploadStatus: 'completed',
          uploadProgress: 100,
          processingStatus: 'completed',
          createdAt: '2024-01-15T10:30:00Z',
          createdBy: 'Dr. Sarah Johnson',
          projectId: 'proj-medical-1'
        },
        {
          id: 'dataset-2',
          name: 'Traffic Video Dataset',
          description: 'Street surveillance videos for vehicle and pedestrian detection',
          type: 'videos',
          totalFiles: 480,
          totalSize: 12.8 * 1024 * 1024 * 1024, // 12.8GB
          fileFormats: ['mp4', 'avi'],
          uploadStatus: 'completed',
          uploadProgress: 100,
          processingStatus: 'processing',
          createdAt: '2024-01-12T09:15:00Z',
          createdBy: 'Alex Chen',
          projectId: 'proj-traffic-1'
        },
        {
          id: 'dataset-3',
          name: 'Product Images',
          description: 'E-commerce product photos for classification and tagging',
          type: 'images',
          totalFiles: 3200,
          totalSize: 850 * 1024 * 1024, // 850MB
          fileFormats: ['jpg', 'png', 'webp'],
          uploadStatus: 'processing',
          uploadProgress: 75,
          processingStatus: 'pending',
          createdAt: '2024-01-18T14:20:00Z',
          createdBy: 'Maria Rodriguez',
          projectId: 'proj-ecommerce-1'
        }
      ];
      setDatasets(mockDatasets);
    } catch (error) {
      console.error('Failed to load datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDatasetFiles = async (datasetId: string) => {
    try {
      // Mock data - replace with actual API call
      const mockFiles: DataFile[] = Array.from({ length: 20 }, (_, i) => ({
        id: `file-${datasetId}-${i + 1}`,
        filename: `image_${String(i + 1).padStart(4, '0')}.jpg`,
        fileType: 'image',
        fileSize: Math.floor(Math.random() * 5000000) + 500000, // 0.5-5MB
        annotationStatus: ['pending', 'in_progress', 'completed', 'reviewed'][Math.floor(Math.random() * 4)] as any,
        annotationCount: Math.floor(Math.random() * 10),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnailPath: `https://picsum.photos/200/200?random=${i + 1}`
      }));
      setDataFiles(mockFiles);
    } catch (error) {
      console.error('Failed to load dataset files:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
      case 'reviewed':
        return 'text-green-400';
      case 'processing':
      case 'in_progress':
        return 'text-orange-400';
      case 'pending':
        return 'text-gray-400';
      case 'failed':
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'images':
        return '📸';
      case 'videos':
        return '🎬';
      case 'medical':
        return '🏥';
      case 'point_clouds':
        return '🔬';
      default:
        return '📁';
    }
  };

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dataset.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || dataset.type === filterType;
    const matchesStatus = filterStatus === 'all' || dataset.uploadStatus === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredFiles = dataFiles.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleUploadComplete = (files: any[]) => {
    setShowUploader(false);
    // Refresh the dataset files
    if (selectedDataset) {
      loadDatasetFiles(selectedDataset.id);
    }
    // Show success message
    console.log('Files uploaded successfully:', files);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // Show error message to user
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"></div>
          <p className="text-white/70 mt-4 text-center">Loading datasets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dataset Management</h1>
              <p className="text-white/70">Manage your training data and annotation files</p>
            </div>
            <button
              onClick={() => setShowUploader(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Upload Files
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-white/40" />
              <input
                type="text"
                placeholder="Search datasets and files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
            >
              <option value="all">All Types</option>
              <option value="images">Images</option>
              <option value="videos">Videos</option>
              <option value="medical">Medical</option>
              <option value="point_clouds">Point Clouds</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Datasets List */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Datasets ({filteredDatasets.length})</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredDatasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    onClick={() => setSelectedDataset(dataset)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedDataset?.id === dataset.id
                        ? 'bg-indigo-600/20 border border-indigo-500/40'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-indigo-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getTypeIcon(dataset.type)}</span>
                        <h3 className="font-medium text-white truncate">{dataset.name}</h3>
                      </div>
                      <span className={`text-xs font-medium ${getStatusColor(dataset.uploadStatus)}`}>
                        {dataset.uploadStatus}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mb-3 line-clamp-2">{dataset.description}</p>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>{dataset.totalFiles} files</span>
                      <span>{formatFileSize(dataset.totalSize)}</span>
                    </div>
                    {dataset.uploadStatus === 'processing' && (
                      <div className="mt-2">
                        <div className="w-full bg-white/10 rounded-full h-1">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${dataset.uploadProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/60 mt-1">{dataset.uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dataset Files */}
          <div className="lg:col-span-2">
            {selectedDataset ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <span className="text-xl">{getTypeIcon(selectedDataset.type)}</span>
                      {selectedDataset.name}
                    </h2>
                    <p className="text-white/70 mt-1">{selectedDataset.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                      <span>{selectedDataset.totalFiles} files</span>
                      <span>{formatFileSize(selectedDataset.totalSize)}</span>
                      <span>Created {formatDate(selectedDataset.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="p-2 text-white/60 hover:text-white transition-colors"
                    >
                      {viewMode === 'grid' ? '📋' : '⊞'}
                    </button>
                    <button className="p-2 text-white/60 hover:text-white transition-colors">
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Files Grid/List */}
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4' 
                    : 'space-y-2'
                } max-h-[500px] overflow-y-auto`}>
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`group relative bg-white/5 hover:bg-white/10 hover:border-indigo-500/30 border border-transparent rounded-xl transition-all duration-200 ${
                        viewMode === 'grid' ? 'aspect-square p-3' : 'flex items-center p-3'
                      }`}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          {file.thumbnailPath ? (
                            <img
                              src={file.thumbnailPath}
                              alt={file.filename}
                              className="w-full h-20 object-cover rounded-lg mb-2"
                            />
                          ) : (
                            <div className="w-full h-20 bg-white/10 rounded-lg flex items-center justify-center mb-2">
                              <DocumentIcon className="w-8 h-8 text-white/40" />
                            </div>
                          )}
                          <p className="text-xs text-white truncate mb-1">{file.filename}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className={getStatusColor(file.annotationStatus)}>
                              {file.annotationStatus}
                            </span>
                            <span className="text-white/60">{formatFileSize(file.fileSize)}</span>
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <button className="p-1 bg-black/50 backdrop-blur-sm rounded text-white hover:bg-black/70">
                                <EyeIcon className="w-3 h-3" />
                              </button>
                              <button className="p-1 bg-black/50 backdrop-blur-sm rounded text-white hover:bg-black/70">
                                <TrashIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center flex-1 gap-3">
                            {file.thumbnailPath ? (
                              <img
                                src={file.thumbnailPath}
                                alt={file.filename}
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                                <DocumentIcon className="w-5 h-5 text-white/40" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{file.filename}</p>
                              <div className="flex items-center gap-4 text-xs text-white/60">
                                <span>{formatFileSize(file.fileSize)}</span>
                                <span className={getStatusColor(file.annotationStatus)}>
                                  {file.annotationStatus}
                                </span>
                                <span>{file.annotationCount} annotations</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button className="p-2 text-white/60 hover:text-white transition-colors">
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-white/60 hover:text-white transition-colors">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
                <FolderIcon className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Select a Dataset</h3>
                <p className="text-white/70">Choose a dataset from the left panel to view its files</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploader && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-white">Upload Files</h3>
                <button
                  onClick={() => setShowUploader(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <FileUploader
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                projectId={selectedDataset?.projectId}
                datasetId={selectedDataset?.id}
                maxFiles={50}
                maxFileSize={100 * 1024 * 1024} // 100MB
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 