'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  PhotoIcon,
  DocumentTextIcon,
  FilmIcon,
  ArchiveBoxIcon,
  CogIcon,
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  BeakerIcon,
  TagIcon,
  FolderArrowDownIcon,
  CloudArrowDownIcon,
  ServerIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  LinkIcon,
  KeyIcon,
  LockClosedIcon,
  UserGroupIcon,
  ShareIcon,
  ClipboardDocumentIcon,
  QrCodeIcon,
  BoltIcon,
  SparklesIcon,
  ChartBarIcon,
  CubeIcon,
  PlayIcon,
  Square2StackIcon,
  RectangleGroupIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  StopIcon
} from '@heroicons/react/24/outline';

import type { DICOMExportOptions } from '@/lib/medical/dicom-integration';
import { dicomIntegration } from '@/lib/medical/dicom-integration';

interface DICOMExportProps {
  studyUID: string;
  seriesUIDs?: string[];
  imageUIDs?: string[];
  onExportComplete?: (exportData: ExportResult) => void;
  onExportError?: (error: string) => void;
  className?: string;
}

interface ExportResult {
  id: string;
  format: string;
  size: number;
  url: string;
  filename: string;
  exportedAt: Date;
  settings: DICOMExportOptions;
}

interface ExportJob {
  id: string;
  studyUID: string;
  seriesUIDs: string[];
  imageUIDs: string[];
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  estimatedTime: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  result?: ExportResult;
}

const EXPORT_FORMATS = [
  {
    id: 'dicom',
    name: 'DICOM',
    description: 'Original DICOM format with full metadata',
    extension: '.dcm',
    icon: <ArchiveBoxIcon className="w-5 h-5" />,
    supports: {
      metadata: true,
      annotations: true,
      measurements: true,
      multiFrame: true,
      compression: true
    }
  },
  {
    id: 'nifti',
    name: 'NIfTI',
    description: 'Neuroimaging Informatics Technology Initiative format',
    extension: '.nii',
    icon: <CubeIcon className="w-5 h-5" />,
    supports: {
      metadata: true,
      annotations: false,
      measurements: false,
      multiFrame: true,
      compression: true
    }
  },
  {
    id: 'jpeg',
    name: 'JPEG',
    description: 'JPEG images with optional metadata',
    extension: '.jpg',
    icon: <PhotoIcon className="w-5 h-5" />,
    supports: {
      metadata: false,
      annotations: true,
      measurements: true,
      multiFrame: false,
      compression: true
    }
  },
  {
    id: 'png',
    name: 'PNG',
    description: 'PNG images with optional metadata',
    extension: '.png',
    icon: <PhotoIcon className="w-5 h-5" />,
    supports: {
      metadata: false,
      annotations: true,
      measurements: true,
      multiFrame: false,
      compression: false
    }
  },
  {
    id: 'pdf',
    name: 'PDF Report',
    description: 'PDF report with images and metadata',
    extension: '.pdf',
    icon: <DocumentTextIcon className="w-5 h-5" />,
    supports: {
      metadata: true,
      annotations: true,
      measurements: true,
      multiFrame: true,
      compression: false
    }
  }
];

const COMPRESSION_TYPES = [
  { id: 'none', name: 'No Compression', description: 'Uncompressed data' },
  { id: 'lossless', name: 'Lossless', description: 'No quality loss' },
  { id: 'lossy', name: 'Lossy', description: 'Smaller file size, some quality loss' }
];

const QUALITY_LEVELS = [
  { value: 100, label: 'Maximum Quality' },
  { value: 95, label: 'High Quality' },
  { value: 85, label: 'Good Quality' },
  { value: 75, label: 'Medium Quality' },
  { value: 60, label: 'Low Quality' }
];

export default function DICOMExport({ 
  studyUID, 
  seriesUIDs = [], 
  imageUIDs = [], 
  onExportComplete,
  onExportError,
  className = '' 
}: DICOMExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<DICOMExportOptions>({
    format: 'dicom',
    quality: 95,
    includeMetadata: true,
    includeAnnotations: true,
    includeMeasurements: true,
    anonymize: false,
    compressionType: 'lossless',
    outputPath: ''
  });
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [currentJob, setCurrentJob] = useState<ExportJob | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [anonymizationSettings, setAnonymizationSettings] = useState({
    keepStudyDate: false,
    keepPatientAge: false,
    replacePatientName: true,
    replacePatientID: true,
    removePrivateTags: true,
    removeComments: true
  });

  useEffect(() => {
    // Update export jobs periodically
    const interval = setInterval(() => {
      updateExportJobs();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateExportJobs = async () => {
    // Update progress for active jobs
    setExportJobs(prev => prev.map(job => {
      if (job.status === 'processing') {
        const elapsed = Date.now() - job.startedAt.getTime();
        const progress = Math.min(95, (elapsed / job.estimatedTime) * 100);
        return { ...job, progress };
      }
      return job;
    }));
  };

  const handleExport = async () => {
    try {
      const jobId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const job: ExportJob = {
        id: jobId,
        studyUID,
        seriesUIDs,
        imageUIDs,
        format: exportOptions.format,
        status: 'pending',
        progress: 0,
        estimatedTime: estimateExportTime(),
        startedAt: new Date()
      };

      setExportJobs(prev => [job, ...prev]);
      setCurrentJob(job);

      // Start export process
      await startExport(job);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      onExportError?.(errorMessage);
    }
  };

  const startExport = async (job: ExportJob) => {
    try {
      // Update job status
      setExportJobs(prev => prev.map(j => 
        j.id === job.id ? { ...j, status: 'processing' } : j
      ));

      // Call the export API
      const exportData = await dicomIntegration.exportStudy(studyUID, exportOptions);
      
      // Create download URL
      const url = URL.createObjectURL(exportData);
      const filename = generateFilename(job);
      
      const result: ExportResult = {
        id: job.id,
        format: job.format,
        size: exportData.size,
        url,
        filename,
        exportedAt: new Date(),
        settings: exportOptions
      };

      // Update job with result
      setExportJobs(prev => prev.map(j => 
        j.id === job.id ? { 
          ...j, 
          status: 'completed', 
          progress: 100,
          completedAt: new Date(),
          result 
        } : j
      ));

      onExportComplete?.(result);
      
      // Auto-download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      
      setExportJobs(prev => prev.map(j => 
        j.id === job.id ? { 
          ...j, 
          status: 'error', 
          error: errorMessage,
          completedAt: new Date()
        } : j
      ));
      
      onExportError?.(errorMessage);
    }
  };

  const estimateExportTime = (): number => {
    const baseTime = 5000; // 5 seconds base
    const seriesCount = seriesUIDs.length || 1;
    const imageCount = imageUIDs.length || 10;
    
    let multiplier = 1;
    switch (exportOptions.format) {
      case 'dicom': multiplier = 1; break;
      case 'nifti': multiplier = 1.5; break;
      case 'jpeg': multiplier = 0.8; break;
      case 'png': multiplier = 1.2; break;
      case 'pdf': multiplier = 2; break;
    }

    return baseTime + (seriesCount * 2000) + (imageCount * 500) * multiplier;
  };

  const generateFilename = (job: ExportJob): string => {
    const format = EXPORT_FORMATS.find(f => f.id === job.format);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const extension = format?.extension || '.zip';
    
    if (job.seriesUIDs.length === 1) {
      return `series_${job.seriesUIDs[0]}_${timestamp}${extension}`;
    } else if (job.imageUIDs.length === 1) {
      return `image_${job.imageUIDs[0]}_${timestamp}${extension}`;
    } else {
      return `study_${job.studyUID}_${timestamp}${extension}`;
    }
  };

  const cancelJob = (jobId: string) => {
    setExportJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'error', error: 'Cancelled by user' } : job
    ));
  };

  const clearJob = (jobId: string) => {
    setExportJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const selectedFormat = EXPORT_FORMATS.find(f => f.id === exportOptions.format);
  const hasActiveJobs = exportJobs.some(job => job.status === 'processing');

  return (
    <div className={className}>
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn-medsight flex items-center space-x-2"
        disabled={hasActiveJobs}
      >
        <ArrowDownTrayIcon className="w-4 h-4" />
        <span>Export</span>
        {hasActiveJobs && (
          <div className="w-2 h-2 bg-medsight-pending rounded-full animate-pulse" />
        )}
      </button>

      {/* Export Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="medsight-ai-glass p-2 rounded-lg">
                  <DocumentArrowDownIcon className="w-6 h-6 text-medsight-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Export DICOM Data</h2>
                  <p className="text-sm text-gray-600">
                    {imageUIDs.length > 0 ? `${imageUIDs.length} images` :
                     seriesUIDs.length > 0 ? `${seriesUIDs.length} series` : 
                     'Complete study'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Format Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Export Format</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXPORT_FORMATS.map((format) => (
                  <div
                    key={format.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      exportOptions.format === format.id
                        ? 'border-medsight-primary bg-medsight-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setExportOptions({ ...exportOptions, format: format.id as any })}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        exportOptions.format === format.id
                          ? 'bg-medsight-primary/10 text-medsight-primary'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {format.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">{format.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {format.supports.metadata && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              Metadata
                            </span>
                          )}
                          {format.supports.annotations && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              Annotations
                            </span>
                          )}
                          {format.supports.measurements && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                              Measurements
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
              <div className="space-y-4">
                {/* Quality Settings */}
                {(['jpeg', 'png'].includes(exportOptions.format)) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Quality
                    </label>
                    <select
                      value={exportOptions.quality}
                      onChange={(e) => setExportOptions({ 
                        ...exportOptions, 
                        quality: parseInt(e.target.value) 
                      })}
                      className="input-medsight"
                    >
                      {QUALITY_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label} ({level.value}%)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Compression Settings */}
                {selectedFormat?.supports.compression && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compression
                    </label>
                    <select
                      value={exportOptions.compressionType}
                      onChange={(e) => setExportOptions({ 
                        ...exportOptions, 
                        compressionType: e.target.value as any 
                      })}
                      className="input-medsight"
                    >
                      {COMPRESSION_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} - {type.description}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Include Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedFormat?.supports.metadata && (
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeMetadata}
                        onChange={(e) => setExportOptions({ 
                          ...exportOptions, 
                          includeMetadata: e.target.checked 
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Include metadata</span>
                    </label>
                  )}

                  {selectedFormat?.supports.annotations && (
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeAnnotations}
                        onChange={(e) => setExportOptions({ 
                          ...exportOptions, 
                          includeAnnotations: e.target.checked 
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Include annotations</span>
                    </label>
                  )}

                  {selectedFormat?.supports.measurements && (
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeMeasurements}
                        onChange={(e) => setExportOptions({ 
                          ...exportOptions, 
                          includeMeasurements: e.target.checked 
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Include measurements</span>
                    </label>
                  )}

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.anonymize}
                      onChange={(e) => setExportOptions({ 
                        ...exportOptions, 
                        anonymize: e.target.checked 
                      })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Anonymize data</span>
                  </label>
                </div>

                {/* Anonymization Settings */}
                {exportOptions.anonymize && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <EyeSlashIcon className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-900">Anonymization Settings</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(anonymizationSettings).map(([key, value]) => (
                        <label key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setAnonymizationSettings({ 
                              ...anonymizationSettings, 
                              [key]: e.target.checked 
                            })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-yellow-900">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Export Jobs */}
            {exportJobs.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Export History</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {exportJobs.map((job) => (
                    <div key={job.id} className="medsight-control-glass p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            job.status === 'completed' ? 'bg-green-500' :
                            job.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                            job.status === 'error' ? 'bg-red-500' :
                            'bg-gray-400'
                          }`} />
                          <span className="text-sm font-medium text-gray-900">
                            {job.format.toUpperCase()} Export
                          </span>
                          <span className="text-xs text-gray-500">
                            {job.startedAt.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {job.status === 'processing' && (
                            <button
                              onClick={() => cancelJob(job.id)}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              <StopIcon className="w-4 h-4" />
                            </button>
                          )}
                          {job.status !== 'processing' && (
                            <button
                              onClick={() => clearJob(job.id)}
                              className="text-sm text-gray-400 hover:text-gray-600"
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {job.status === 'processing' && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{Math.round(job.progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-medsight-primary h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {job.status === 'completed' && job.result && (
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            {(job.result.size / 1024 / 1024).toFixed(1)} MB
                          </div>
                          <button
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = job.result!.url;
                              a.download = job.result!.filename;
                              a.click();
                            }}
                            className="text-sm text-medsight-primary hover:text-medsight-primary/80 flex items-center space-x-1"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      )}

                      {job.status === 'error' && (
                        <div className="text-sm text-red-600">
                          Error: {job.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
              </button>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={hasActiveJobs}
                  className="btn-medsight flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Start Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 