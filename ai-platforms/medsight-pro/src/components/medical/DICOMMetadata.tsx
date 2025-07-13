'use client';

import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  CpuChipIcon,
  PhotoIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  BeakerIcon,
  ClockIcon,
  HashtagIcon,
  ArchiveBoxIcon,
  LinkIcon,
  GlobeAltIcon,
  SparklesIcon,
  ShieldCheckIcon,
  KeyIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';

import { type DICOMMetadata, DICOMValidationResult } from '@/lib/medical/dicom-integration';
import { dicomIntegration } from '@/lib/medical/dicom-integration';

interface DICOMMetadataProps {
  studyUID: string;
  seriesUID: string;
  imageUID: string;
  className?: string;
}

interface DICOMTag {
  group: string;
  element: string;
  tag: string;
  name: string;
  vr: string;
  value: any;
  category: string;
  description: string;
  isPrivate: boolean;
  isRetired: boolean;
  isRequired: boolean;
}

interface TagCategory {
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const TAG_CATEGORIES: Record<string, TagCategory> = {
  patient: {
    name: 'Patient Information',
    icon: <UserIcon className="w-5 h-5" />,
    color: 'text-blue-600',
    description: 'Patient demographic and identification data'
  },
  study: {
    name: 'Study Information',
    icon: <DocumentTextIcon className="w-5 h-5" />,
    color: 'text-green-600',
    description: 'Study-level metadata and identifiers'
  },
  series: {
    name: 'Series Information',
    icon: <ArchiveBoxIcon className="w-5 h-5" />,
    color: 'text-purple-600',
    description: 'Series-level acquisition parameters'
  },
  image: {
    name: 'Image Information',
    icon: <PhotoIcon className="w-5 h-5" />,
    color: 'text-orange-600',
    description: 'Image-specific parameters and pixel data'
  },
  acquisition: {
    name: 'Acquisition Parameters',
    icon: <BeakerIcon className="w-5 h-5" />,
    color: 'text-indigo-600',
    description: 'Imaging acquisition and protocol settings'
  },
  equipment: {
    name: 'Equipment Information',
    icon: <CpuChipIcon className="w-5 h-5" />,
    color: 'text-gray-600',
    description: 'Scanner and equipment specifications'
  },
  institution: {
    name: 'Institution Information',
    icon: <BuildingOfficeIcon className="w-5 h-5" />,
    color: 'text-cyan-600',
    description: 'Hospital and institutional data'
  },
  presentation: {
    name: 'Presentation State',
    icon: <EyeIcon className="w-5 h-5" />,
    color: 'text-pink-600',
    description: 'Display and presentation parameters'
  },
  overlay: {
    name: 'Overlay Information',
    icon: <SparklesIcon className="w-5 h-5" />,
    color: 'text-yellow-600',
    description: 'Overlay and annotation data'
  },
  private: {
    name: 'Private Tags',
    icon: <KeyIcon className="w-5 h-5" />,
    color: 'text-red-600',
    description: 'Vendor-specific private tags'
  },
  security: {
    name: 'Security & Privacy',
    icon: <ShieldCheckIcon className="w-5 h-5" />,
    color: 'text-emerald-600',
    description: 'Security and privacy-related tags'
  },
  other: {
    name: 'Other',
    icon: <TagIcon className="w-5 h-5" />,
    color: 'text-slate-600',
    description: 'Miscellaneous DICOM tags'
  }
};

export default function DICOMMetadata({ studyUID, seriesUID, imageUID, className = '' }: DICOMMetadataProps) {
  const [metadata, setMetadata] = useState<DICOMMetadata | null>(null);
  const [validation, setValidation] = useState<DICOMValidationResult | null>(null);
  const [tags, setTags] = useState<DICOMTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPrivateTags, setShowPrivateTags] = useState(false);
  const [showRetiredTags, setShowRetiredTags] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['patient', 'study', 'image']));
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  useEffect(() => {
    loadMetadata();
  }, [studyUID, seriesUID, imageUID]);

  const loadMetadata = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metadataResult, validationResult] = await Promise.all([
        dicomIntegration.getMetadata(studyUID, seriesUID, imageUID),
        dicomIntegration.validateDICOM(studyUID, seriesUID, imageUID)
      ]);

      if (metadataResult) {
        setMetadata(metadataResult);
        setValidation(validationResult);
        setTags(parseMetadataToTags(metadataResult));
      } else {
        setError('Failed to load DICOM metadata');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const parseMetadataToTags = (metadata: DICOMMetadata): DICOMTag[] => {
    const parsedTags: DICOMTag[] = [];
    
    for (const [tagKey, value] of metadata.tags) {
      const tag = parseTag(tagKey, value);
      if (tag) {
        parsedTags.push(tag);
      }
    }
    
    return parsedTags.sort((a, b) => a.tag.localeCompare(b.tag));
  };

  const parseTag = (tagKey: string, value: any): DICOMTag | null => {
    const match = tagKey.match(/^\(([0-9A-Fa-f]{4}),([0-9A-Fa-f]{4})\)$/);
    if (!match) return null;

    const [, group, element] = match;
    const groupInt = parseInt(group, 16);
    const elementInt = parseInt(element, 16);

    return {
      group,
      element,
      tag: tagKey,
      name: getTagName(groupInt, elementInt),
      vr: getVR(groupInt, elementInt),
      value,
      category: getTagCategory(groupInt, elementInt),
      description: getTagDescription(groupInt, elementInt),
      isPrivate: isPrivateTag(groupInt, elementInt),
      isRetired: isRetiredTag(groupInt, elementInt),
      isRequired: isRequiredTag(groupInt, elementInt)
    };
  };

  const getTagName = (group: number, element: number): string => {
    const tag = `${group.toString(16).padStart(4, '0').toUpperCase()}${element.toString(16).padStart(4, '0').toUpperCase()}`;
    
    // Common DICOM tags
    const tagNames: Record<string, string> = {
      '00100010': 'Patient Name',
      '00100020': 'Patient ID',
      '00100030': 'Patient Birth Date',
      '00100040': 'Patient Sex',
      '0020000D': 'Study Instance UID',
      '0020000E': 'Series Instance UID',
      '00080018': 'SOP Instance UID',
      '00080020': 'Study Date',
      '00080030': 'Study Time',
      '00080050': 'Accession Number',
      '00080060': 'Modality',
      '00080070': 'Manufacturer',
      '00081030': 'Study Description',
      '0008103E': 'Series Description',
      '00200011': 'Series Number',
      '00200013': 'Instance Number',
      '00280010': 'Rows',
      '00280011': 'Columns',
      '00280100': 'Bits Allocated',
      '00281050': 'Window Center',
      '00281051': 'Window Width',
      '00281052': 'Rescale Intercept',
      '00281053': 'Rescale Slope',
      '7FE00010': 'Pixel Data'
    };

    return tagNames[tag] || `Tag ${tag}`;
  };

  const getVR = (group: number, element: number): string => {
    // Simplified VR determination
    if (group === 0x7FE0 && element === 0x0010) return 'OW';
    if (group === 0x0010 && element === 0x0010) return 'PN';
    if (group === 0x0020 && (element === 0x000D || element === 0x000E)) return 'UI';
    if (group === 0x0008 && (element === 0x0020 || element === 0x0030)) return 'DA';
    return 'UN';
  };

  const getTagCategory = (group: number, element: number): string => {
    if (group === 0x0010) return 'patient';
    if (group === 0x0020) return 'study';
    if (group === 0x0008) return 'study';
    if (group === 0x0028) return 'image';
    if (group === 0x0018) return 'acquisition';
    if (group === 0x0002) return 'equipment';
    if (group === 0x7FE0) return 'image';
    if (isPrivateTag(group, element)) return 'private';
    return 'other';
  };

  const getTagDescription = (group: number, element: number): string => {
    const descriptions: Record<string, string> = {
      '00100010': 'The name of the patient',
      '00100020': 'Primary identifier for the patient',
      '00100030': 'Birth date of the patient',
      '00100040': 'Sex of the patient',
      '0020000D': 'Unique identifier for the study',
      '0020000E': 'Unique identifier for the series',
      '00080018': 'Unique identifier for the SOP instance',
      '00080020': 'Date the study was performed',
      '00080030': 'Time the study was started',
      '00080050': 'RIS generated number identifying the order',
      '00080060': 'Type of equipment that acquired the data',
      '00080070': 'Manufacturer of the equipment',
      '00281050': 'Window center for display',
      '00281051': 'Window width for display',
      '7FE00010': 'Pixel data for the image'
    };

    const tag = `${group.toString(16).padStart(4, '0').toUpperCase()}${element.toString(16).padStart(4, '0').toUpperCase()}`;
    return descriptions[tag] || 'DICOM tag';
  };

  const isPrivateTag = (group: number, element: number): boolean => {
    return (group % 2 === 1) || (group >= 0x0010 && element >= 0x0010 && element <= 0x00FF);
  };

  const isRetiredTag = (group: number, element: number): boolean => {
    // Simplified retired tag detection
    return group === 0x0000 || (group === 0x0008 && element === 0x0001);
  };

  const isRequiredTag = (group: number, element: number): boolean => {
    const requiredTags = [
      0x00080018, // SOP Instance UID
      0x0020000D, // Study Instance UID
      0x0020000E, // Series Instance UID
      0x00080016, // SOP Class UID
      0x00080060, // Modality
      0x00100010, // Patient Name
      0x00100020  // Patient ID
    ];
    
    const tagInt = (group << 16) | element;
    return requiredTags.includes(tagInt);
  };

  const filteredTags = tags.filter(tag => {
    const matchesSearch = searchTerm === '' || 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(tag.value).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || tag.category === selectedCategory;
    const matchesPrivate = showPrivateTags || !tag.isPrivate;
    const matchesRetired = showRetiredTags || !tag.isRetired;
    
    return matchesSearch && matchesCategory && matchesPrivate && matchesRetired;
  });

  const groupedTags = filteredTags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, DICOMTag[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const copyToClipboard = async (text: string, tagId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTag(tagId);
      setTimeout(() => setCopiedTag(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const exportMetadata = async () => {
    if (!metadata) return;

    const exportData = {
      studyUID,
      seriesUID,
      imageUID,
      metadata: Object.fromEntries(metadata.tags),
      validation,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dicom-metadata-${imageUID}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatValue = (value: any, vr: string): string => {
    if (value === null || value === undefined) return '';
    
    if (vr === 'DA') {
      // Date format
      const dateStr = String(value);
      if (dateStr.length === 8) {
        return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
      }
    } else if (vr === 'TM') {
      // Time format
      const timeStr = String(value);
      if (timeStr.length >= 6) {
        return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(4, 6)}`;
      }
    } else if (vr === 'UI') {
      // UID format
      return String(value);
    } else if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    return String(value);
  };

  if (loading) {
    return (
      <div className={`medsight-glass p-6 rounded-xl ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medsight-primary"></div>
            <span className="text-medsight-primary font-medium">Loading DICOM metadata...</span>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Metadata</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadMetadata}
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
            <DocumentMagnifyingGlassIcon className="w-6 h-6 text-medsight-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">DICOM Metadata</h2>
            <p className="text-sm text-gray-600">
              {tags.length} tags • {filteredTags.length} visible
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportMetadata}
            className="btn-medsight"
            title="Export metadata"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </button>
          <button
            onClick={loadMetadata}
            className="btn-medsight"
            title="Refresh metadata"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Validation Status */}
      {validation && (
        <div className="mb-6 p-4 medsight-control-glass rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center space-x-2">
              {validation.isValid ? (
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              ) : (
                <XCircleIcon className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium text-gray-900">
                DICOM Validation: {validation.isValid ? 'Valid' : 'Invalid'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Compliance:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                validation.complianceLevel === 'full' ? 'bg-green-100 text-green-800' :
                validation.complianceLevel === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {validation.complianceLevel}
              </span>
            </div>
          </div>
          {validation.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-red-600 mb-1">Errors:</p>
              <ul className="text-sm text-red-600 space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span>•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-yellow-600 mb-1">Warnings:</p>
              <ul className="text-sm text-yellow-600 space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span>•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tags by name, value, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-medsight pl-10 w-full"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-medsight"
            >
              <option value="all">All Categories</option>
              {Object.entries(TAG_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>{category.name}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showPrivateTags}
              onChange={(e) => setShowPrivateTags(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Show private tags</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showRetiredTags}
              onChange={(e) => setShowRetiredTags(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Show retired tags</span>
          </label>
        </div>
      </div>

      {/* Tags by Category */}
      <div className="space-y-4">
        {Object.entries(groupedTags).map(([categoryKey, categoryTags]) => {
          const category = TAG_CATEGORIES[categoryKey];
          if (!category || categoryTags.length === 0) return null;

          const isExpanded = expandedCategories.has(categoryKey);

          return (
            <div key={categoryKey} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={category.color}>
                    {category.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{categoryTags.length} tags</span>
                  {isExpanded ? (
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="divide-y divide-gray-200">
                  {categoryTags.map((tag) => (
                    <div key={tag.tag} className="px-4 py-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-mono text-sm font-medium text-gray-900">
                              {tag.tag}
                            </span>
                            <span className="text-sm text-gray-500">({tag.vr})</span>
                            {tag.isRequired && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                Required
                              </span>
                            )}
                            {tag.isPrivate && (
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                Private
                              </span>
                            )}
                            {tag.isRetired && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                                Retired
                              </span>
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">{tag.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{tag.description}</p>
                          <div className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            {formatValue(tag.value, tag.vr)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-4">
                          <button
                            onClick={() => copyToClipboard(String(tag.value), tag.tag)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            title="Copy value"
                          >
                            {copiedTag === tag.tag ? (
                              <CheckCircleIcon className="w-4 h-4 text-green-600" />
                            ) : (
                              <ClipboardDocumentIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTags.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tags found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filter settings.
          </p>
        </div>
      )}
    </div>
  );
} 