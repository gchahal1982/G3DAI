'use client';

import { useState } from 'react';
import { 
  BeakerIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  UserIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  TagIcon,
  CpuChipIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

interface MedicalStudy {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientSex: 'M' | 'F';
  accessionNumber: string;
  studyDate: string;
  studyTime: string;
  studyType: string;
  modality: string;
  bodyPart: string;
  studyDescription: string;
  radiologist: string;
  status: 'completed' | 'in-progress' | 'pending' | 'reviewed' | 'archived';
  priority: 'routine' | 'urgent' | 'stat' | 'critical';
  seriesCount: number;
  imageCount: number;
  studySize: string;
  findings: string;
  impression: string;
  aiAnalysis?: {
    confidence: number;
    findings: string[];
    abnormalityDetected: boolean;
    criticalFindings: string[];
  };
  reportStatus: 'draft' | 'preliminary' | 'final' | 'amended';
  reportDate?: string;
  lastAccessed: string;
  isFavorite: boolean;
  tags: string[];
  collaborators: string[];
  priorStudies: string[];
}

export function RecentStudies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [expandedStudy, setExpandedStudy] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Mock data for recent studies
  const recentStudies: MedicalStudy[] = [
    {
      id: 'STU-2024-001',
      patientId: 'PT-789234',
      patientName: 'John Smith',
      patientAge: 65,
      patientSex: 'M',
      accessionNumber: 'ACC-2024-001',
      studyDate: '2024-01-15',
      studyTime: '14:30',
      studyType: 'CT Chest with Contrast',
      modality: 'CT',
      bodyPart: 'Chest',
      studyDescription: 'CT chest with IV contrast for pulmonary embolism evaluation',
      radiologist: 'Dr. Sarah Johnson',
      status: 'completed',
      priority: 'critical',
      seriesCount: 4,
      imageCount: 342,
      studySize: '245 MB',
      findings: 'Bilateral pulmonary emboli identified in segmental branches',
      impression: 'Acute bilateral pulmonary embolism. Recommend immediate anticoagulation.',
      aiAnalysis: {
        confidence: 95,
        findings: ['Pulmonary embolism detected', 'Bilateral involvement', 'Segmental branches affected'],
        abnormalityDetected: true,
        criticalFindings: ['Pulmonary Embolism']
      },
      reportStatus: 'final',
      reportDate: '2024-01-15T15:45:00Z',
      lastAccessed: '2 hours ago',
      isFavorite: true,
      tags: ['PE', 'Critical', 'Emergency'],
      collaborators: ['Dr. Mike Chen', 'Dr. Lisa Wang'],
      priorStudies: ['STU-2023-156', 'STU-2023-098']
    },
    {
      id: 'STU-2024-002',
      patientId: 'PT-567890',
      patientName: 'Emily Davis',
      patientAge: 42,
      patientSex: 'F',
      accessionNumber: 'ACC-2024-002',
      studyDate: '2024-01-15',
      studyTime: '13:15',
      studyType: 'MRI Brain with Gadolinium',
      modality: 'MRI',
      bodyPart: 'Brain',
      studyDescription: 'MRI brain with gadolinium for multiple sclerosis monitoring',
      radiologist: 'Dr. Robert Kim',
      status: 'reviewed',
      priority: 'routine',
      seriesCount: 8,
      imageCount: 528,
      studySize: '412 MB',
      findings: 'Multiple T2 hyperintense lesions consistent with demyelinating disease',
      impression: 'Stable multiple sclerosis with no new lesions compared to prior study.',
      aiAnalysis: {
        confidence: 87,
        findings: ['Multiple white matter lesions', 'Stable appearance', 'No new enhancement'],
        abnormalityDetected: true,
        criticalFindings: []
      },
      reportStatus: 'final',
      reportDate: '2024-01-15T16:20:00Z',
      lastAccessed: '4 hours ago',
      isFavorite: false,
      tags: ['MS', 'Follow-up', 'Stable'],
      collaborators: ['Dr. Jennifer Liu'],
      priorStudies: ['STU-2023-234', 'STU-2023-189', 'STU-2023-145']
    },
    {
      id: 'STU-2024-003',
      patientId: 'PT-123456',
      patientName: 'Michael Johnson',
      patientAge: 28,
      patientSex: 'M',
      accessionNumber: 'ACC-2024-003',
      studyDate: '2024-01-15',
      studyTime: '11:45',
      studyType: 'CT Abdomen and Pelvis',
      modality: 'CT',
      bodyPart: 'Abdomen',
      studyDescription: 'CT abdomen and pelvis with oral contrast for abdominal pain',
      radiologist: 'Dr. Amanda Rodriguez',
      status: 'in-progress',
      priority: 'urgent',
      seriesCount: 3,
      imageCount: 298,
      studySize: '189 MB',
      findings: 'Acute appendicitis with inflammatory changes',
      impression: 'Acute appendicitis. Recommend surgical consultation.',
      aiAnalysis: {
        confidence: 92,
        findings: ['Appendiceal wall thickening', 'Periappendiceal fat stranding', 'Appendicolith present'],
        abnormalityDetected: true,
        criticalFindings: ['Acute Appendicitis']
      },
      reportStatus: 'preliminary',
      reportDate: '2024-01-15T12:30:00Z',
      lastAccessed: '6 hours ago',
      isFavorite: false,
      tags: ['Appendicitis', 'Urgent', 'Surgery'],
      collaborators: ['Dr. James Wilson'],
      priorStudies: []
    },
    {
      id: 'STU-2024-004',
      patientId: 'PT-345678',
      patientName: 'Sarah Wilson',
      patientAge: 55,
      patientSex: 'F',
      accessionNumber: 'ACC-2024-004',
      studyDate: '2024-01-15',
      studyTime: '09:30',
      studyType: 'Screening Mammography',
      modality: 'MG',
      bodyPart: 'Breast',
      studyDescription: 'Bilateral screening mammography',
      radiologist: 'Dr. David Brown',
      status: 'completed',
      priority: 'routine',
      seriesCount: 4,
      imageCount: 8,
      studySize: '32 MB',
      findings: 'BI-RADS 4 lesion in left breast upper outer quadrant',
      impression: 'Suspicious finding requiring tissue sampling. Recommend biopsy.',
      aiAnalysis: {
        confidence: 78,
        findings: ['Irregular mass detected', 'Architectural distortion', 'Requires further evaluation'],
        abnormalityDetected: true,
        criticalFindings: ['Suspicious Mass']
      },
      reportStatus: 'final',
      reportDate: '2024-01-15T10:15:00Z',
      lastAccessed: '8 hours ago',
      isFavorite: true,
      tags: ['BI-RADS 4', 'Callback', 'Biopsy'],
      collaborators: ['Dr. Patricia Lee'],
      priorStudies: ['STU-2023-267', 'STU-2022-423']
    },
    {
      id: 'STU-2024-005',
      patientId: 'PT-456789',
      patientName: 'David Miller',
      patientAge: 73,
      patientSex: 'M',
      accessionNumber: 'ACC-2024-005',
      studyDate: '2024-01-14',
      studyTime: '16:20',
      studyType: 'Chest X-Ray',
      modality: 'XR',
      bodyPart: 'Chest',
      studyDescription: 'Chest X-ray for pneumonia evaluation',
      radiologist: 'Dr. Nancy Clark',
      status: 'completed',
      priority: 'routine',
      seriesCount: 2,
      imageCount: 2,
      studySize: '4 MB',
      findings: 'No acute cardiopulmonary process',
      impression: 'Normal chest X-ray. No evidence of pneumonia.',
      aiAnalysis: {
        confidence: 94,
        findings: ['Clear lung fields', 'Normal cardiac silhouette', 'No infiltrates'],
        abnormalityDetected: false,
        criticalFindings: []
      },
      reportStatus: 'final',
      reportDate: '2024-01-14T17:05:00Z',
      lastAccessed: '1 day ago',
      isFavorite: false,
      tags: ['Normal', 'Chest'],
      collaborators: [],
      priorStudies: ['STU-2023-345']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'medsight-normal';
      case 'in-progress':
        return 'medsight-pending';
      case 'pending':
        return 'medsight-primary';
      case 'reviewed':
        return 'medsight-ai-high';
      case 'archived':
        return 'medsight-primary/50';
      default:
        return 'medsight-primary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'stat':
        return 'medsight-critical';
      case 'urgent':
        return 'medsight-pending';
      case 'routine':
        return 'medsight-normal';
      default:
        return 'medsight-primary';
    }
  };

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'CT':
        return <BeakerIcon className="w-5 h-5" />;
      case 'MRI':
        return <CpuChipIcon className="w-5 h-5" />;
      case 'XR':
        return <PhotoIcon className="w-5 h-5" />;
      case 'MG':
        return <PhotoIcon className="w-5 h-5" />;
      default:
        return <BeakerIcon className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'in-progress':
        return <ClockIcon className="w-4 h-4" />;
      case 'pending':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'reviewed':
        return <EyeIcon className="w-4 h-4" />;
      case 'archived':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const filteredStudies = recentStudies.filter(study => {
    const matchesSearch = study.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.accessionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.studyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.findings.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || study.status === statusFilter;
    const matchesModality = modalityFilter === 'all' || study.modality === modalityFilter;
    
    return matchesSearch && matchesStatus && matchesModality;
  });

  const handleStudyAction = (studyId: string, action: string) => {
    console.log(`Study ${studyId}: ${action}`);
    // In production, this would trigger appropriate medical workflow actions
  };

  const toggleFavorite = (studyId: string) => {
    console.log(`Toggle favorite for study ${studyId}`);
    // In production, this would update the favorite status
  };

  const toggleExpanded = (studyId: string) => {
    setExpandedStudy(expandedStudy === studyId ? null : studyId);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-medsight-accent/10 rounded-full flex items-center justify-center">
              <BeakerIcon className="w-4 h-4 text-medsight-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-medsight-primary">
                Recent Studies
              </h3>
              <p className="text-sm text-medsight-primary/70">
                {filteredStudies.length} of {recentStudies.length} studies
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="btn-medsight px-3 py-1 text-sm"
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </button>
            <div className="text-sm text-medsight-primary/70">
              Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medsight-primary/50" />
              <input
                type="text"
                placeholder="Search studies, patients, or findings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-medsight pl-10 w-full"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-medsight min-w-32"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="archived">Archived</option>
          </select>

          {/* Modality Filter */}
          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
            className="input-medsight min-w-32"
          >
            <option value="all">All Modalities</option>
            <option value="CT">CT</option>
            <option value="MRI">MRI</option>
            <option value="XR">X-Ray</option>
            <option value="MG">Mammography</option>
            <option value="US">Ultrasound</option>
            <option value="PET">PET/CT</option>
          </select>
        </div>
      </div>

      {/* Studies List */}
      <div className="space-y-3">
        {filteredStudies.map((study) => (
          <div key={study.id} className="medsight-glass p-4 rounded-xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-4">
                {/* Modality Icon */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${getStatusColor(study.status)}/10`}>
                  <div className={`text-${getStatusColor(study.status)}`}>
                    {getModalityIcon(study.modality)}
                  </div>
                </div>

                {/* Study Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="font-medium text-medsight-primary">
                      {study.patientName}
                    </h4>
                    <span className="text-sm text-medsight-primary/70">
                      {study.patientAge}yr {study.patientSex}
                    </span>
                    <span className="text-sm text-medsight-primary/70">
                      {study.patientId}
                    </span>
                    {study.isFavorite && (
                      <StarIcon className="w-4 h-4 text-medsight-accent fill-current" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-medsight-primary/70 mb-2">
                    <span>{study.studyType}</span>
                    <span>{study.modality}</span>
                    <span>{study.accessionNumber}</span>
                    <span>{new Date(study.studyDate).toLocaleDateString()} {study.studyTime}</span>
                  </div>
                  
                  <div className="text-sm text-medsight-primary mb-2">
                    {study.studyDescription}
                  </div>
                  
                  {/* Study Stats */}
                  <div className="flex items-center space-x-4 text-xs text-medsight-primary/60">
                    <span>{study.seriesCount} series</span>
                    <span>{study.imageCount} images</span>
                    <span>{study.studySize}</span>
                    <span>Dr. {study.radiologist}</span>
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center space-x-2">
                {/* AI Analysis */}
                {study.aiAnalysis && (
                  <div className={`medsight-ai-glass px-2 py-1 rounded-full text-xs ${
                    study.aiAnalysis.confidence >= 90 ? 'text-medsight-ai-high' :
                    study.aiAnalysis.confidence >= 70 ? 'text-medsight-ai-medium' :
                    'text-medsight-ai-low'
                  }`}>
                    AI: {study.aiAnalysis.confidence}%
                  </div>
                )}

                {/* Priority */}
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-${getPriorityColor(study.priority)}/10 text-${getPriorityColor(study.priority)}`}>
                  <FlagIcon className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    {study.priority.toUpperCase()}
                  </span>
                </div>

                {/* Status */}
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-${getStatusColor(study.status)}/10 text-${getStatusColor(study.status)}`}>
                  {getStatusIcon(study.status)}
                  <span className="text-xs font-medium">
                    {study.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Report Status */}
                <div className="text-xs px-2 py-1 bg-medsight-primary/10 text-medsight-primary rounded-full">
                  {study.reportStatus.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Critical Findings */}
            {study.aiAnalysis?.criticalFindings && study.aiAnalysis.criticalFindings.length > 0 && (
              <div className="mb-3 p-3 bg-medsight-critical/5 border border-medsight-critical/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-medsight-critical" />
                  <span className="text-sm font-medium text-medsight-critical">Critical Findings</span>
                </div>
                <div className="flex space-x-2">
                  {study.aiAnalysis.criticalFindings.map((finding, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-medsight-critical/10 text-medsight-critical rounded-full">
                      {finding}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {study.tags.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center space-x-2">
                  <TagIcon className="w-4 h-4 text-medsight-primary/50" />
                  <div className="flex space-x-2">
                    {study.tags.map((tag, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-medsight-primary/10 text-medsight-primary rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Findings Summary */}
            <div className="mb-3 p-3 medsight-control-glass rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-medium text-medsight-primary mb-1">Findings:</div>
                  <div className="text-medsight-primary/80">{study.findings}</div>
                </div>
                <div>
                  <div className="font-medium text-medsight-primary mb-1">Impression:</div>
                  <div className="text-medsight-primary/80">{study.impression}</div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedStudy === study.id && (
              <div className="mb-3 p-3 medsight-control-glass rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* AI Analysis Details */}
                  {study.aiAnalysis && (
                    <div>
                      <div className="font-medium text-medsight-ai-high mb-2">AI Analysis:</div>
                      <div className="space-y-1">
                        {study.aiAnalysis.findings.map((finding, index) => (
                          <div key={index} className="text-medsight-ai-high/80">• {finding}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Study Details */}
                  <div>
                    <div className="font-medium text-medsight-primary mb-2">Study Details:</div>
                    <div className="space-y-1 text-medsight-primary/70">
                      <div>Report: {study.reportStatus}</div>
                      {study.reportDate && (
                        <div>Report Date: {new Date(study.reportDate).toLocaleString()}</div>
                      )}
                      <div>Last Accessed: {study.lastAccessed}</div>
                      {study.priorStudies.length > 0 && (
                        <div>Prior Studies: {study.priorStudies.length}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleStudyAction(study.id, 'view')}
                  className="btn-medsight px-3 py-1 text-sm"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View
                </button>
                
                <button
                  onClick={() => handleStudyAction(study.id, 'download')}
                  className="btn-medsight px-3 py-1 text-sm"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                  Download
                </button>
                
                <button
                  onClick={() => handleStudyAction(study.id, 'report')}
                  className="btn-medsight px-3 py-1 text-sm"
                >
                  <DocumentTextIcon className="w-4 h-4 mr-1" />
                  Report
                </button>
                
                <button
                  onClick={() => handleStudyAction(study.id, 'share')}
                  className="btn-medsight px-3 py-1 text-sm"
                >
                  <ShareIcon className="w-4 h-4 mr-1" />
                  Share
                </button>
                
                <button
                  onClick={() => toggleFavorite(study.id)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    study.isFavorite 
                      ? 'bg-medsight-accent/20 text-medsight-accent' 
                      : 'bg-medsight-primary/10 text-medsight-primary hover:bg-medsight-primary/20'
                  }`}
                >
                  <StarIcon className={`w-4 h-4 ${study.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <button
                onClick={() => toggleExpanded(study.id)}
                className="btn-medsight px-3 py-1 text-sm"
              >
                {expandedStudy === study.id ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStudies.length === 0 && (
        <div className="medsight-glass p-8 rounded-xl text-center">
          <BeakerIcon className="w-12 h-12 text-medsight-primary/50 mx-auto mb-4" />
          <div className="text-lg font-medium text-medsight-primary mb-2">
            No Studies Found
          </div>
          <div className="text-sm text-medsight-primary/70">
            {searchTerm || statusFilter !== 'all' || modalityFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No recent studies available'
            }
          </div>
        </div>
      )}
    </div>
  );
} 