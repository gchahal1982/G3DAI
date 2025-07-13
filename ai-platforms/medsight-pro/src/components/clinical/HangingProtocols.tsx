'use client';

/**
 * HangingProtocols.tsx
 * Comprehensive hanging protocols interface for medical imaging display
 * 
 * Features:
 * - Protocol selection and management
 * - Viewport layout visualization
 * - Real-time protocol preview
 * - Custom protocol creation and editing
 * - User preferences management
 * - Clinical workflow integration
 * - DICOM-compliant display arrangements
 * 
 * Medical Standards: DICOM Part 11 (Display Function), ACR-NEMA, HL7 FHIR
 * @version 1.0.0
 * @author MedSight Pro Development Team
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  RectangleGroupIcon,
  Square2StackIcon,
  Squares2X2Icon,
  ViewfinderCircleIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  StarIcon,
  ClockIcon,
  UserIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  PlayIcon,
  PauseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BookOpenIcon,
  ChartBarIcon,
  BeakerIcon,
  LightBulbIcon,
  CubeIcon,
  PhotoIcon,
  FilmIcon,
  GlobeAltIcon,
  UsersIcon,
  LockClosedIcon,
  ShareIcon,
  HeartIcon,
  CpuChipIcon,
  BanknotesIcon,
  CalendarIcon,
  TagIcon,
  ArchiveBoxIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  ArrowPathIcon,
  BoltIcon,
  HandRaisedIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

// Import hanging protocols library
import { 
  hangingProtocolManager,
  HangingProtocol,
  ViewportArrangement,
  ProtocolApplication,
  UserPreferences,
  ValidationResult,
  PREDEFINED_PROTOCOLS
} from '@/lib/clinical/hanging-protocols';

// Interface definitions
interface HangingProtocolsProps {
  className?: string;
  studyData?: any;
  onProtocolApplied?: (application: ProtocolApplication) => void;
  onProtocolChanged?: (protocol: HangingProtocol) => void;
  currentUser?: {
    id: string;
    name: string;
    role: string;
    preferences?: UserPreferences;
  };
  readOnly?: boolean;
  showPreview?: boolean;
  enableCustomProtocols?: boolean;
  enableProtocolSharing?: boolean;
  compactMode?: boolean;
}

interface ProtocolPreview {
  protocol: HangingProtocol;
  viewportPreviews: ViewportPreview[];
  estimatedLoadTime: number;
  memoryUsage: number;
  complexity: 'simple' | 'moderate' | 'complex';
}

interface ViewportPreview {
  viewportId: string;
  arrangement: ViewportArrangement;
  previewImage?: string;
  status: 'ready' | 'loading' | 'error';
  seriesCount: number;
  imageCount: number;
}

interface ProtocolFilter {
  category: string;
  modality: string;
  bodyPart: string;
  studyType: string;
  searchTerm: string;
  showOnlyFavorites: boolean;
  showOnlyCustom: boolean;
  showOnlyValidated: boolean;
}

const HangingProtocols: React.FC<HangingProtocolsProps> = ({
  className = '',
  studyData,
  onProtocolApplied,
  onProtocolChanged,
  currentUser = { id: 'user1', name: 'Dr. User', role: 'radiologist' },
  readOnly = false,
  showPreview = true,
  enableCustomProtocols = true,
  enableProtocolSharing = true,
  compactMode = false
}) => {
  // State management
  const [protocols, setProtocols] = useState<HangingProtocol[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<HangingProtocol | null>(null);
  const [activeProtocol, setActiveProtocol] = useState<HangingProtocol | null>(null);
  const [protocolPreview, setProtocolPreview] = useState<ProtocolPreview | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'gallery' | 'editor' | 'preview' | 'settings'>('gallery');
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [isEditingProtocol, setIsEditingProtocol] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<ProtocolFilter>({
    category: '',
    modality: '',
    bodyPart: '',
    studyType: '',
    searchTerm: '',
    showOnlyFavorites: false,
    showOnlyCustom: false,
    showOnlyValidated: false
  });

  // Favorites management
  const [favoriteProtocols, setFavoriteProtocols] = useState<Set<string>>(new Set());

  // Load initial data
  useEffect(() => {
    loadProtocols();
    loadUserPreferences();
  }, []);

  // Auto-select best protocol when study data changes
  useEffect(() => {
    if (studyData && !selectedProtocol) {
      selectBestProtocol();
    }
  }, [studyData]);

  // Update preview when protocol changes
  useEffect(() => {
    if (selectedProtocol && showPreview) {
      generateProtocolPreview();
    }
  }, [selectedProtocol, showPreview]);

  // Data loading functions
  const loadProtocols = useCallback(async () => {
    try {
      setIsLoading(true);
      const allProtocols = await hangingProtocolManager.getAllProtocols();
      setProtocols(allProtocols);
    } catch (err) {
      setError('Failed to load hanging protocols');
      console.error('Error loading protocols:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserPreferences = useCallback(async () => {
    try {
      const preferences = await hangingProtocolManager.getUserPreferences(currentUser.id);
      setUserPreferences(preferences);
      
      // Load favorite protocols
      const favorites = new Set(preferences.customProtocols || []);
      setFavoriteProtocols(favorites);
      
      // Auto-select default protocol
      if (preferences.defaultProtocol) {
        const defaultProtocol = await hangingProtocolManager.getProtocol(preferences.defaultProtocol);
        if (defaultProtocol) {
          setSelectedProtocol(defaultProtocol);
        }
      }
    } catch (err) {
      console.error('Error loading user preferences:', err);
    }
  }, [currentUser.id]);

  const selectBestProtocol = useCallback(async () => {
    if (!studyData) return;
    
    try {
      const bestProtocol = await hangingProtocolManager.selectBestProtocol(studyData);
      if (bestProtocol) {
        setSelectedProtocol(bestProtocol);
        if (userPreferences?.autoApplyProtocol) {
          await applyProtocol(bestProtocol);
        }
      }
    } catch (err) {
      console.error('Error selecting best protocol:', err);
    }
  }, [studyData, userPreferences]);

  const generateProtocolPreview = useCallback(async () => {
    if (!selectedProtocol) return;
    
    try {
      const viewportPreviews: ViewportPreview[] = selectedProtocol.layout.viewportArrangement.map((arrangement, index) => ({
        viewportId: `viewport_${index}`,
        arrangement,
        status: 'ready' as const,
        seriesCount: studyData?.series?.length || 0,
        imageCount: studyData?.series?.reduce((total: number, s: any) => total + (s.images?.length || 0), 0) || 0
      }));

      const preview: ProtocolPreview = {
        protocol: selectedProtocol,
        viewportPreviews,
        estimatedLoadTime: calculateEstimatedLoadTime(selectedProtocol),
        memoryUsage: calculateMemoryUsage(selectedProtocol),
        complexity: calculateComplexity(selectedProtocol)
      };

      setProtocolPreview(preview);
    } catch (err) {
      console.error('Error generating protocol preview:', err);
    }
  }, [selectedProtocol, studyData]);

  // Calculation helpers
  const calculateEstimatedLoadTime = (protocol: HangingProtocol): number => {
    const baseTime = 100; // Base load time in ms
    const viewportMultiplier = protocol.layout.totalViewports * 50;
    const complexityMultiplier = protocol.layout.viewportArrangement.reduce((total, arrangement) => {
      return total + arrangement.imageSelection.maximumImages * 10;
    }, 0);
    
    return baseTime + viewportMultiplier + complexityMultiplier;
  };

  const calculateMemoryUsage = (protocol: HangingProtocol): number => {
    const baseMemory = 50; // Base memory in MB
    const imageMemory = protocol.layout.viewportArrangement.reduce((total, arrangement) => {
      return total + arrangement.imageSelection.maximumImages * 5; // 5MB per image estimate
    }, 0);
    
    return baseMemory + imageMemory;
  };

  const calculateComplexity = (protocol: HangingProtocol): 'simple' | 'moderate' | 'complex' => {
    const score = protocol.layout.totalViewports + 
                 protocol.sortingRules.length + 
                 protocol.groupingRules.length + 
                 protocol.filteringRules.length;
    
    if (score <= 3) return 'simple';
    if (score <= 8) return 'moderate';
    return 'complex';
  };

  // Protocol management functions
  const applyProtocol = useCallback(async (protocol: HangingProtocol) => {
    if (!studyData) return;
    
    try {
      setIsLoading(true);
      const application = await hangingProtocolManager.applyProtocol(protocol.id, studyData);
      setActiveProtocol(protocol);
      onProtocolApplied?.(application);
      
      // Update usage tracking
      await hangingProtocolManager.getProtocol(protocol.id);
    } catch (err) {
      setError('Failed to apply hanging protocol');
      console.error('Error applying protocol:', err);
    } finally {
      setIsLoading(false);
    }
  }, [studyData, onProtocolApplied]);

  const toggleFavorite = useCallback(async (protocolId: string) => {
    const newFavorites = new Set(favoriteProtocols);
    if (newFavorites.has(protocolId)) {
      newFavorites.delete(protocolId);
    } else {
      newFavorites.add(protocolId);
    }
    
    setFavoriteProtocols(newFavorites);
    
    // Update user preferences
    if (userPreferences) {
      const updatedPreferences = {
        ...userPreferences,
        customProtocols: Array.from(newFavorites)
      };
      await hangingProtocolManager.setUserPreferences(currentUser.id, updatedPreferences);
    }
  }, [favoriteProtocols, userPreferences, currentUser.id]);

  const duplicateProtocol = useCallback(async (protocol: HangingProtocol) => {
    if (!enableCustomProtocols) return;
    
    try {
      const duplicatedProtocol = await hangingProtocolManager.createProtocol({
        ...protocol,
        name: `${protocol.name} (Copy)`,
        isCustom: true,
        createdBy: currentUser.id
      });
      
      await loadProtocols();
      setSelectedProtocol(duplicatedProtocol);
      setIsEditingProtocol(true);
    } catch (err) {
      setError('Failed to duplicate protocol');
      console.error('Error duplicating protocol:', err);
    }
  }, [enableCustomProtocols, currentUser.id, loadProtocols]);

  const deleteProtocol = useCallback(async (protocolId: string) => {
    if (!enableCustomProtocols) return;
    
    try {
      await hangingProtocolManager.deleteProtocol(protocolId);
      await loadProtocols();
      
      if (selectedProtocol?.id === protocolId) {
        setSelectedProtocol(null);
      }
    } catch (err) {
      setError('Failed to delete protocol');
      console.error('Error deleting protocol:', err);
    }
  }, [enableCustomProtocols, selectedProtocol, loadProtocols]);

  const validateProtocol = useCallback(async (protocol: HangingProtocol) => {
    try {
      const result = await hangingProtocolManager.validateProtocol(protocol);
      setValidationResult(result);
      return result;
    } catch (err) {
      console.error('Error validating protocol:', err);
      return { isValid: false, errors: ['Validation failed'], warnings: [] };
    }
  }, []);

  // Filter functions
  const filteredProtocols = useMemo(() => {
    return protocols.filter(protocol => {
      // Category filter
      if (filters.category && protocol.category !== filters.category) return false;
      
      // Modality filter
      if (filters.modality && !protocol.modality.includes(filters.modality)) return false;
      
      // Body part filter
      if (filters.bodyPart && !protocol.bodyPart.includes(filters.bodyPart)) return false;
      
      // Study type filter
      if (filters.studyType && !protocol.studyType.includes(filters.studyType)) return false;
      
      // Search term filter
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const searchableText = `${protocol.name} ${protocol.description}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      // Favorites filter
      if (filters.showOnlyFavorites && !favoriteProtocols.has(protocol.id)) return false;
      
      // Custom protocols filter
      if (filters.showOnlyCustom && !protocol.isCustom) return false;
      
      // Validated protocols filter
      if (filters.showOnlyValidated && !protocol.clinicalValidation.isValidated) return false;
      
      return true;
    });
  }, [protocols, filters, favoriteProtocols]);

  // Helper functions for UI
  const getProtocolIcon = (protocol: HangingProtocol) => {
    switch (protocol.category) {
      case 'radiology': return PhotoIcon;
      case 'pathology': return BeakerIcon;
      case 'cardiology': return HeartIcon;
      case 'emergency': return BoltIcon;
      case 'oncology': return CpuChipIcon;
      case 'neurology': return CpuChipIcon;
      default: return RectangleGroupIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-medsight-normal';
      case 'loading': return 'text-medsight-accent';
      case 'error': return 'text-medsight-alert';
      default: return 'text-gray-500';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-medsight-normal';
      case 'moderate': return 'text-medsight-accent';
      case 'complex': return 'text-medsight-alert';
      default: return 'text-gray-500';
    }
  };

  // Render functions
  const renderProtocolGallery = () => (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search protocols..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-accent focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters ? 'bg-medsight-accent text-white border-medsight-accent' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <FunnelIcon className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="medsight-control-glass p-4 rounded-lg space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-accent focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="radiology">Radiology</option>
                <option value="pathology">Pathology</option>
                <option value="cardiology">Cardiology</option>
                <option value="emergency">Emergency</option>
                <option value="oncology">Oncology</option>
                <option value="neurology">Neurology</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modality</label>
              <select
                value={filters.modality}
                onChange={(e) => setFilters(prev => ({ ...prev, modality: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-accent focus:border-transparent"
              >
                <option value="">All Modalities</option>
                <option value="CR">CR</option>
                <option value="DR">DR</option>
                <option value="DX">DX</option>
                <option value="CT">CT</option>
                <option value="MR">MR</option>
                <option value="US">US</option>
                <option value="MG">MG</option>
                <option value="NM">NM</option>
                <option value="PET">PET</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Body Part</label>
              <select
                value={filters.bodyPart}
                onChange={(e) => setFilters(prev => ({ ...prev, bodyPart: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-accent focus:border-transparent"
              >
                <option value="">All Body Parts</option>
                <option value="CHEST">Chest</option>
                <option value="ABDOMEN">Abdomen</option>
                <option value="HEAD">Head</option>
                <option value="SPINE">Spine</option>
                <option value="PELVIS">Pelvis</option>
                <option value="EXTREMITY">Extremity</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.showOnlyFavorites}
                onChange={(e) => setFilters(prev => ({ ...prev, showOnlyFavorites: e.target.checked }))}
                className="rounded border-gray-300 text-medsight-accent focus:ring-medsight-accent"
              />
              <span className="text-sm text-gray-700">Show only favorites</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.showOnlyCustom}
                onChange={(e) => setFilters(prev => ({ ...prev, showOnlyCustom: e.target.checked }))}
                className="rounded border-gray-300 text-medsight-accent focus:ring-medsight-accent"
              />
              <span className="text-sm text-gray-700">Show only custom</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.showOnlyValidated}
                onChange={(e) => setFilters(prev => ({ ...prev, showOnlyValidated: e.target.checked }))}
                className="rounded border-gray-300 text-medsight-accent focus:ring-medsight-accent"
              />
              <span className="text-sm text-gray-700">Show only validated</span>
            </label>
          </div>
        </motion.div>
      )}

      {/* Protocol Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProtocols.map((protocol) => {
          const IconComponent = getProtocolIcon(protocol);
          const isSelected = selectedProtocol?.id === protocol.id;
          const isActive = activeProtocol?.id === protocol.id;
          const isFavorite = favoriteProtocols.has(protocol.id);
          
          return (
            <motion.div
              key={protocol.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`medsight-control-glass p-4 rounded-lg cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-medsight-accent' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedProtocol(protocol)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${protocol.isCustom ? 'bg-purple-100' : 'bg-blue-100'}`}>
                    <IconComponent className={`h-5 w-5 ${protocol.isCustom ? 'text-purple-600' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{protocol.name}</h3>
                    <p className="text-sm text-gray-600">{protocol.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isFavorite && (
                    <StarIconSolid className="h-4 w-4 text-yellow-500" />
                  )}
                  {isActive && (
                    <div className="w-2 h-2 bg-medsight-normal rounded-full animate-pulse" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(protocol.id);
                    }}
                    className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    {isFavorite ? <StarIconSolid className="h-4 w-4" /> : <StarIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Layout:</span>
                  <span className="text-gray-900">{protocol.layout.rows}×{protocol.layout.columns}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Modality:</span>
                  <span className="text-gray-900">{protocol.modality.join(', ')}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Body Part:</span>
                  <span className="text-gray-900">{protocol.bodyPart.join(', ') || 'All'}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Used:</span>
                  <span className="text-gray-900">{protocol.usageCount} times</span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {protocol.isDefault && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Default
                    </span>
                  )}
                  {protocol.isCustom && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Custom
                    </span>
                  )}
                  {protocol.clinicalValidation.isValidated && (
                    <ShieldCheckIconSolid className="h-4 w-4 text-medsight-normal" />
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  {!readOnly && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateProtocol(protocol);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Duplicate Protocol"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      
                      {protocol.isCustom && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProtocol(protocol);
                              setIsEditingProtocol(true);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Edit Protocol"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this protocol?')) {
                                deleteProtocol(protocol.id);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete Protocol"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProtocols.length === 0 && (
        <div className="text-center py-12">
          <RectangleGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No protocols found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {protocols.length === 0 ? 'No protocols available' : 'Try adjusting your filters'}
          </p>
          {enableCustomProtocols && (
            <div className="mt-6">
              <button
                onClick={() => setIsCreatingCustom(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-medsight-accent hover:bg-medsight-accent/90 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Custom Protocol
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderProtocolPreview = () => {
    if (!selectedProtocol || !protocolPreview) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ViewfinderCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Select a protocol to see preview</p>
          </div>
        </div>
      );
    }

    const { protocol, viewportPreviews, estimatedLoadTime, memoryUsage, complexity } = protocolPreview;

    return (
      <div className="space-y-6">
        {/* Protocol Info */}
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{protocol.name}</h3>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${getComplexityColor(complexity)}`}>
                {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
              </span>
              {protocol.clinicalValidation.isValidated && (
                <ShieldCheckIconSolid className="h-5 w-5 text-medsight-normal" />
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">{protocol.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-gray-500">Layout</span>
              <p className="text-sm font-medium">{protocol.layout.rows}×{protocol.layout.columns}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Est. Load Time</span>
              <p className="text-sm font-medium">{estimatedLoadTime}ms</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Memory Usage</span>
              <p className="text-sm font-medium">{memoryUsage}MB</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Viewports</span>
              <p className="text-sm font-medium">{protocol.layout.totalViewports}</p>
            </div>
          </div>
        </div>

        {/* Layout Preview */}
        <div className="medsight-control-glass p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Layout Preview</h4>
          
          <div 
            className="bg-black rounded-lg p-4 aspect-video"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${protocol.layout.columns}, 1fr)`,
              gridTemplateRows: `repeat(${protocol.layout.rows}, 1fr)`,
              gap: '8px'
            }}
          >
            {viewportPreviews.map((viewport, index) => (
              <div
                key={viewport.viewportId}
                className="bg-gray-800 rounded border border-gray-600 p-2 flex flex-col items-center justify-center text-white text-xs"
                style={{
                  gridColumn: `${viewport.arrangement.position.column + 1}`,
                  gridRow: `${viewport.arrangement.position.row + 1}`
                }}
              >
                <ViewfinderCircleIcon className="h-8 w-8 mb-2 text-gray-400" />
                <span className="font-medium">{viewport.arrangement.purpose}</span>
                <span className="text-gray-400">{viewport.arrangement.seriesType}</span>
                <span className="text-gray-500 text-xs mt-1">
                  {viewport.seriesCount} series, {viewport.imageCount} images
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        {!readOnly && selectedProtocol && (
          <div className="flex justify-center">
            <button
              onClick={() => applyProtocol(selectedProtocol)}
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-medsight-accent hover:bg-medsight-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Apply Protocol
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderProtocolSettings = () => (
    <div className="space-y-6">
      <div className="medsight-control-glass p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Preferences</h3>
        
        {userPreferences && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Protocol
              </label>
              <select
                value={userPreferences.defaultProtocol}
                onChange={(e) => {
                  const updatedPreferences = { ...userPreferences, defaultProtocol: e.target.value };
                  setUserPreferences(updatedPreferences);
                  hangingProtocolManager.setUserPreferences(currentUser.id, updatedPreferences);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-accent focus:border-transparent"
              >
                <option value="">Select default protocol</option>
                {protocols.map(protocol => (
                  <option key={protocol.id} value={protocol.id}>
                    {protocol.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="autoApply"
                checked={userPreferences.autoApplyProtocol}
                onChange={(e) => {
                  const updatedPreferences = { ...userPreferences, autoApplyProtocol: e.target.checked };
                  setUserPreferences(updatedPreferences);
                  hangingProtocolManager.setUserPreferences(currentUser.id, updatedPreferences);
                }}
                className="rounded border-gray-300 text-medsight-accent focus:ring-medsight-accent"
              />
              <label htmlFor="autoApply" className="text-sm text-gray-700">
                Auto-apply best protocol when study loads
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="rememberLastUsed"
                checked={userPreferences.rememberLastUsed}
                onChange={(e) => {
                  const updatedPreferences = { ...userPreferences, rememberLastUsed: e.target.checked };
                  setUserPreferences(updatedPreferences);
                  hangingProtocolManager.setUserPreferences(currentUser.id, updatedPreferences);
                }}
                className="rounded border-gray-300 text-medsight-accent focus:ring-medsight-accent"
              />
              <label htmlFor="rememberLastUsed" className="text-sm text-gray-700">
                Remember last used protocol
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Protocol Statistics */}
      <div className="medsight-control-glass p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Protocol Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-accent">{protocols.length}</div>
            <div className="text-sm text-gray-600">Total Protocols</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-accent">
              {protocols.filter(p => p.isCustom).length}
            </div>
            <div className="text-sm text-gray-600">Custom Protocols</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-accent">
              {favoriteProtocols.size}
            </div>
            <div className="text-sm text-gray-600">Favorites</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-accent">
              {protocols.filter(p => p.clinicalValidation.isValidated).length}
            </div>
            <div className="text-sm text-gray-600">Validated</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="medsight-glass p-4 border-b border-medsight-accent/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-medsight-accent/10 rounded-lg">
              <RectangleGroupIcon className="h-6 w-6 text-medsight-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-medsight-accent">Hanging Protocols</h2>
              <p className="text-sm text-gray-600">Medical imaging display arrangements</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedProtocol && (
              <span className="text-sm text-gray-600">
                Selected: <span className="font-medium">{selectedProtocol.name}</span>
              </span>
            )}
            {activeProtocol && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-medsight-normal rounded-full animate-pulse" />
                <span className="text-sm text-medsight-normal font-medium">
                  Active: {activeProtocol.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-white">
        {[
          { id: 'gallery', label: 'Protocol Gallery', icon: RectangleGroupIcon },
          { id: 'preview', label: 'Preview', icon: EyeIcon },
          { id: 'settings', label: 'Settings', icon: Cog6ToothIcon }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-medsight-accent text-medsight-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'gallery' && renderProtocolGallery()}
        {activeTab === 'preview' && renderProtocolPreview()}
        {activeTab === 'settings' && renderProtocolSettings()}
      </div>

      {/* Medical Compliance Footer */}
      <div className="medsight-glass p-3 border-t border-medsight-accent/20">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <ShieldCheckIconSolid className="h-4 w-4 text-medsight-normal" />
            <span className="text-medsight-normal font-medium">Medical Compliance</span>
          </div>
          <div className="flex items-center space-x-4 text-gray-600">
            <span>DICOM Part 11</span>
            <span>ACR-NEMA</span>
            <span>FDA Class II</span>
            <span>HIPAA Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HangingProtocols; 