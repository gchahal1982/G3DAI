'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArchiveBoxIcon,
  PhotoIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Bars3Icon,
  Squares2X2Icon,
  ClockIcon,
  BeakerIcon,
  CpuChipIcon,
  TagIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ScaleIcon,
  CubeIcon,
  BoltIcon,
  StarIcon,
  HeartIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

import type { DICOMSeries, DICOMImage } from '@/lib/medical/dicom-integration';
import { dicomIntegration } from '@/lib/medical/dicom-integration';

interface DICOMSeriesProps {
  studyUID: string;
  className?: string;
}

interface SeriesWithThumbnail extends DICOMSeries {
  thumbnail?: string;
  status: 'loading' | 'ready' | 'error';
  progress?: number;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'seriesNumber' | 'seriesDescription' | 'modality' | 'imageCount' | 'acquisitionDate';

const MODALITY_COLORS: Record<string, string> = {
  'CT': 'bg-blue-100 text-blue-800',
  'MR': 'bg-green-100 text-green-800',
  'US': 'bg-purple-100 text-purple-800',
  'XA': 'bg-red-100 text-red-800',
  'DX': 'bg-yellow-100 text-yellow-800',
  'CR': 'bg-indigo-100 text-indigo-800',
  'MG': 'bg-pink-100 text-pink-800',
  'PT': 'bg-orange-100 text-orange-800',
  'NM': 'bg-cyan-100 text-cyan-800',
  'RF': 'bg-teal-100 text-teal-800',
  'SC': 'bg-gray-100 text-gray-800',
  'OT': 'bg-slate-100 text-slate-800'
};

const MODALITY_NAMES: Record<string, string> = {
  'CT': 'Computed Tomography',
  'MR': 'Magnetic Resonance',
  'US': 'Ultrasound',
  'XA': 'X-Ray Angiography',
  'DX': 'Digital Radiography',
  'CR': 'Computed Radiography',
  'MG': 'Mammography',
  'PT': 'Positron Emission Tomography',
  'NM': 'Nuclear Medicine',
  'RF': 'Radio Fluoroscopy',
  'SC': 'Secondary Capture',
  'OT': 'Other'
};

export default function DICOMSeries({ studyUID, className = '' }: DICOMSeriesProps) {
  const [seriesList, setSeriesList] = useState<SeriesWithThumbnail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModality, setSelectedModality] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('seriesNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedSeries, setSelectedSeries] = useState<Set<string>>(new Set());
  const [previewSeries, setPreviewSeries] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    loadSeries();
  }, [studyUID]);

  const loadSeries = async () => {
    try {
      setLoading(true);
      setError(null);

      const series = await dicomIntegration.getSeriesList(studyUID);
      
      if (series) {
        const seriesWithThumbnails = series.map(s => ({
          ...s,
          status: 'loading' as const,
          progress: 0
        }));
        
        setSeriesList(seriesWithThumbnails);
        
        // Generate thumbnails asynchronously
        generateThumbnails(seriesWithThumbnails);
      } else {
        setError('Failed to load DICOM series');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnails = async (series: SeriesWithThumbnail[]) => {
    for (const s of series) {
      try {
        // Get first image for thumbnail
        const images = await dicomIntegration.getImageList(studyUID, s.seriesUID);
        if (images.length > 0) {
          const thumbnail = await generateThumbnailFromImage(images[0]);
          
          setSeriesList(prev => prev.map(series => 
            series.seriesUID === s.seriesUID 
              ? { ...series, thumbnail, status: 'ready' }
              : series
          ));
        } else {
          setSeriesList(prev => prev.map(series => 
            series.seriesUID === s.seriesUID 
              ? { ...series, status: 'error' }
              : series
          ));
        }
      } catch (err) {
        console.error(`Error generating thumbnail for series ${s.seriesUID}:`, err);
        setSeriesList(prev => prev.map(series => 
          series.seriesUID === s.seriesUID 
            ? { ...series, status: 'error' }
            : series
        ));
      }
    }
  };

  const generateThumbnailFromImage = async (image: DICOMImage): Promise<string> => {
    // Create a canvas for thumbnail generation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    // Set thumbnail size
    const thumbnailSize = 150;
    canvas.width = thumbnailSize;
    canvas.height = thumbnailSize;

    // Create image data from pixel data
    const imageData = ctx.createImageData(image.columns, image.rows);
    
    // Convert DICOM pixel data to canvas image data
    const pixelData = new Uint16Array(image.pixelData);
    const windowCenter = image.windowCenter || 0;
    const windowWidth = image.windowWidth || 4096;
    
    for (let i = 0; i < pixelData.length; i++) {
      const value = pixelData[i];
      const normalizedValue = Math.max(0, Math.min(255, 
        ((value - windowCenter + windowWidth / 2) / windowWidth) * 255
      ));
      
      const pixelIndex = i * 4;
      imageData.data[pixelIndex] = normalizedValue;     // R
      imageData.data[pixelIndex + 1] = normalizedValue; // G
      imageData.data[pixelIndex + 2] = normalizedValue; // B
      imageData.data[pixelIndex + 3] = 255;             // A
    }

    // Create temporary canvas for the original image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) throw new Error('Failed to get temp canvas context');

    tempCanvas.width = image.columns;
    tempCanvas.height = image.rows;
    tempCtx.putImageData(imageData, 0, 0);

    // Scale down to thumbnail size
    const scale = Math.min(thumbnailSize / image.columns, thumbnailSize / image.rows);
    const scaledWidth = image.columns * scale;
    const scaledHeight = image.rows * scale;
    const offsetX = (thumbnailSize - scaledWidth) / 2;
    const offsetY = (thumbnailSize - scaledHeight) / 2;

    // Fill with black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, thumbnailSize, thumbnailSize);

    // Draw scaled image
    ctx.drawImage(tempCanvas, 0, 0, image.columns, image.rows, 
                  offsetX, offsetY, scaledWidth, scaledHeight);

    return canvas.toDataURL('image/png');
  };

  const filteredAndSortedSeries = seriesList
    .filter(series => {
      const matchesSearch = searchTerm === '' || 
        series.seriesDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        series.modality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        series.bodyPart.toLowerCase().includes(searchTerm.toLowerCase()) ||
        series.protocolName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesModality = selectedModality === 'all' || series.modality === selectedModality;
      
      return matchesSearch && matchesModality;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'seriesNumber':
          aValue = parseInt(a.seriesNumber) || 0;
          bValue = parseInt(b.seriesNumber) || 0;
          break;
        case 'seriesDescription':
          aValue = a.seriesDescription;
          bValue = b.seriesDescription;
          break;
        case 'modality':
          aValue = a.modality;
          bValue = b.modality;
          break;
        case 'imageCount':
          aValue = a.imageCount;
          bValue = b.imageCount;
          break;
        case 'acquisitionDate':
          aValue = new Date(a.acquisitionDate);
          bValue = new Date(b.acquisitionDate);
          break;
        default:
          aValue = a.seriesNumber;
          bValue = b.seriesNumber;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSeriesSelect = (seriesUID: string) => {
    const newSelected = new Set(selectedSeries);
    if (newSelected.has(seriesUID)) {
      newSelected.delete(seriesUID);
    } else {
      newSelected.add(seriesUID);
    }
    setSelectedSeries(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSeries.size === filteredAndSortedSeries.length) {
      setSelectedSeries(new Set());
    } else {
      setSelectedSeries(new Set(filteredAndSortedSeries.map(s => s.seriesUID)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSeries.size === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedSeries.size} selected series?`
    );
    
    if (confirmed) {
      // TODO: Implement batch delete
      console.log('Deleting series:', Array.from(selectedSeries));
      setSelectedSeries(new Set());
    }
  };

  const handleExportSelected = async () => {
    if (selectedSeries.size === 0) return;
    
    // TODO: Implement batch export
    console.log('Exporting series:', Array.from(selectedSeries));
  };

  const handleViewSeries = (seriesUID: string) => {
    // TODO: Navigate to series viewer
    console.log('Viewing series:', seriesUID);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return 'Unknown';
    
    try {
      const time = new Date(`1970-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return timeString;
    }
  };

  const getModalityColor = (modality: string): string => {
    return MODALITY_COLORS[modality] || 'bg-gray-100 text-gray-800';
  };

  const getModalityName = (modality: string): string => {
    return MODALITY_NAMES[modality] || modality;
  };

  const uniqueModalities = [...new Set(seriesList.map(s => s.modality))];

  if (loading) {
    return (
      <div className={`medsight-glass p-6 rounded-xl ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medsight-primary"></div>
            <span className="text-medsight-primary font-medium">Loading DICOM series...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`medsight-glass p-6 rounded-xl ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Series</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadSeries}
              className="btn-medsight"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`medsight-glass p-6 rounded-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <ArchiveBoxIcon className="w-6 h-6 text-medsight-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">DICOM Series</h2>
            <p className="text-sm text-gray-600">
              {seriesList.length} series • {filteredAndSortedSeries.length} visible
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="btn-medsight"
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? (
              <Bars3Icon className="w-4 h-4" />
            ) : (
              <Squares2X2Icon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="btn-medsight"
            title="Toggle details"
          >
            <InformationCircleIcon className="w-4 h-4" />
          </button>
          <button
            onClick={loadSeries}
            className="btn-medsight"
            title="Refresh series"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search series by description, modality, body part, or protocol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-medsight pl-10 w-full"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <select
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              className="input-medsight"
            >
              <option value="all">All Modalities</option>
              {uniqueModalities.map(modality => (
                <option key={modality} value={modality}>
                  {getModalityName(modality)} ({modality})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="input-medsight"
            >
              <option value="seriesNumber">Series Number</option>
              <option value="seriesDescription">Description</option>
              <option value="modality">Modality</option>
              <option value="imageCount">Image Count</option>
              <option value="acquisitionDate">Acquisition Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn-medsight"
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedSeries.size > 0 && (
          <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-900">
              {selectedSeries.size} series selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportSelected}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={handleDeleteSelected}
                className="text-sm text-red-600 hover:text-red-800 flex items-center space-x-1"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Series List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedSeries.map((series) => (
            <div
              key={series.seriesUID}
              className={`medsight-control-glass p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedSeries.has(series.seriesUID) ? 'ring-2 ring-medsight-primary' : ''
              }`}
              onClick={() => handleSeriesSelect(series.seriesUID)}
            >
              {/* Thumbnail */}
              <div className="relative mb-3">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {series.status === 'loading' ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medsight-primary"></div>
                    </div>
                  ) : series.status === 'error' ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <XCircleIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  ) : series.thumbnail ? (
                    <img
                      src={series.thumbnail}
                      alt={series.seriesDescription}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getModalityColor(series.modality)}`}>
                    {series.modality}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className="px-2 py-1 text-xs bg-black/50 text-white rounded">
                    {series.imageCount} images
                  </span>
                </div>
              </div>

              {/* Series Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    Series {series.seriesNumber}
                  </span>
                  {selectedSeries.has(series.seriesUID) && (
                    <CheckCircleIcon className="w-4 h-4 text-medsight-primary" />
                  )}
                </div>
                <h3 className="font-medium text-gray-900 truncate" title={series.seriesDescription}>
                  {series.seriesDescription}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center space-x-1">
                    <BeakerIcon className="w-3 h-3" />
                    <span>{series.bodyPart}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{formatDate(series.acquisitionDate)}</span>
                  </div>
                  {showDetails && (
                    <>
                      <div className="flex items-center space-x-1">
                        <ScaleIcon className="w-3 h-3" />
                        <span>{series.sliceThickness}mm</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CubeIcon className="w-3 h-3" />
                        <span>{series.pixelSpacing.join('x')}mm</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UserIcon className="w-3 h-3" />
                        <span>{series.operatorName}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewSeries(series.seriesUID);
                  }}
                  className="flex-1 btn-medsight text-sm"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Show series details
                  }}
                  className="btn-medsight text-sm"
                >
                  <InformationCircleIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {/* List Header */}
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
            <div className="w-8">
              <input
                type="checkbox"
                checked={selectedSeries.size === filteredAndSortedSeries.length && filteredAndSortedSeries.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
            </div>
            <div className="flex-1">Series</div>
            <div className="w-24">Modality</div>
            <div className="w-32">Images</div>
            <div className="w-32">Date</div>
            <div className="w-24">Actions</div>
          </div>

          {/* List Items */}
          {filteredAndSortedSeries.map((series) => (
            <div
              key={series.seriesUID}
              className={`flex items-center space-x-4 p-3 medsight-control-glass rounded-lg hover:bg-gray-50 ${
                selectedSeries.has(series.seriesUID) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="w-8">
                <input
                  type="checkbox"
                  checked={selectedSeries.has(series.seriesUID)}
                  onChange={() => handleSeriesSelect(series.seriesUID)}
                  className="rounded border-gray-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {series.thumbnail ? (
                      <img
                        src={series.thumbnail}
                        alt={series.seriesDescription}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        Series {series.seriesNumber}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 truncate">
                      {series.seriesDescription}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {series.bodyPart} • {series.protocolName}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-24">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getModalityColor(series.modality)}`}>
                  {series.modality}
                </span>
              </div>
              <div className="w-32 text-sm text-gray-600">
                {series.imageCount} images
              </div>
              <div className="w-32 text-sm text-gray-600">
                {formatDate(series.acquisitionDate)}
              </div>
              <div className="w-24 flex items-center space-x-1">
                <button
                  onClick={() => handleViewSeries(series.seriesUID)}
                  className="btn-medsight text-sm p-1"
                  title="View series"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button
                  className="btn-medsight text-sm p-1"
                  title="Series details"
                >
                  <InformationCircleIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredAndSortedSeries.length === 0 && (
        <div className="text-center py-12">
          <ArchiveBoxIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No series found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filter settings.
          </p>
        </div>
      )}
    </div>
  );
} 