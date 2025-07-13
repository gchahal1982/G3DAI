'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, 
  Download, 
  Share2, 
  Printer as Print, 
  FileText, 
  Mail, 
  Phone, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  Shield,
  Settings,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Copy,
  Edit,
  Trash2,
  Archive,
  Star,
  MessageSquare,
  Paperclip,
  Send,
  X,
  Plus,
  Check,
  Info,
  Bookmark,
  Flag,
  History,
  FileDown,
  Globe,
  Lock,
  Unlock,
  UserCheck,
  Clock3,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

import { MedicalReport, Finding, Impression, Recommendation } from '@/lib/reporting/medical-reports';
import { ReportTemplate } from '@/lib/reporting/report-templates';

// Component Props
interface ReportViewerProps {
  report: MedicalReport;
  template?: ReportTemplate;
  onEdit?: (report: MedicalReport) => void;
  onShare?: (report: MedicalReport, recipients: ShareRecipient[]) => void;
  onExport?: (report: MedicalReport, format: string) => void;
  onDistribute?: (report: MedicalReport, distribution: DistributionConfig) => void;
  onSign?: (report: MedicalReport, signature: DigitalSignature) => void;
  onComment?: (report: MedicalReport, comment: ReportComment) => void;
  readonly?: boolean;
  className?: string;
}

// Types
interface ShareRecipient {
  id: string;
  name: string;
  email: string;
  role: string;
  permission: 'view' | 'edit' | 'comment';
  notificationMethod: 'email' | 'sms' | 'portal';
}

interface DistributionConfig {
  recipients: ShareRecipient[];
  formats: string[];
  urgent: boolean;
  scheduledDate?: Date;
  expirationDate?: Date;
  accessRestrictions: AccessRestriction[];
  auditTrail: boolean;
}

interface AccessRestriction {
  type: 'ip' | 'location' | 'device' | 'time';
  value: string;
  description: string;
}

interface DigitalSignature {
  signerName: string;
  signerRole: string;
  signatureDate: Date;
  signatureType: 'electronic' | 'digital';
  signatureData: string;
  verified: boolean;
  certificate?: CertificateInfo;
}

interface CertificateInfo {
  issuer: string;
  subject: string;
  serialNumber: string;
  validFrom: Date;
  validTo: Date;
  thumbprint: string;
}

interface ReportComment {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  timestamp: Date;
  section?: string;
  isPrivate: boolean;
  attachments: CommentAttachment[];
  replies: ReportComment[];
}

interface CommentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface ViewerState {
  viewMode: 'standard' | 'compact' | 'detailed' | 'print';
  zoom: number;
  fullscreen: boolean;
  showComments: boolean;
  showSignatures: boolean;
  showAuditTrail: boolean;
  showMetadata: boolean;
  activeSection: string | null;
  searchQuery: string;
  comments: ReportComment[];
  distributionHistory: DistributionEntry[];
  selectedText: string;
  highlightedFindings: string[];
  bookmarks: Bookmark[];
  printSettings: PrintSettings;
  shareDialog: boolean;
  distributionDialog: boolean;
  signatureDialog: boolean;
  commentDialog: boolean;
  exportDialog: boolean;
}

interface DistributionEntry {
  id: string;
  timestamp: Date;
  recipients: ShareRecipient[];
  format: string;
  status: 'pending' | 'delivered' | 'failed';
  deliveredAt?: Date;
  viewedAt?: Date;
  downloadedAt?: Date;
}

interface Bookmark {
  id: string;
  name: string;
  section: string;
  position: number;
  timestamp: Date;
  note?: string;
}

interface PrintSettings {
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: 'normal' | 'narrow' | 'wide';
  includeCover: boolean;
  includeSignatures: boolean;
  includeComments: boolean;
  includeAuditTrail: boolean;
  watermark?: string;
  headerFooter: boolean;
}

// Header Component
const ReportHeader: React.FC<{
  report: MedicalReport;
  template?: ReportTemplate;
  onEdit?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  readonly: boolean;
  viewMode: ViewerState['viewMode'];
  onViewModeChange: (mode: ViewerState['viewMode']) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  fullscreen: boolean;
  onFullscreenToggle: () => void;
}> = ({ 
  report, 
  template, 
  onEdit, 
  onShare, 
  onExport, 
  onPrint, 
  readonly, 
  viewMode, 
  onViewModeChange, 
  zoom, 
  onZoomChange, 
  fullscreen, 
  onFullscreenToggle 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'preliminary': return 'bg-yellow-100 text-yellow-700';
      case 'final': return 'bg-green-100 text-green-700';
      case 'amended': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return Clock;
      case 'preliminary': return AlertTriangle;
      case 'final': return CheckCircle;
      case 'amended': return Edit;
      case 'cancelled': return X;
      default: return Info;
    }
  };

  const StatusIcon = getStatusIcon(report.status);

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">Medical Report</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <StatusIcon className="w-4 h-4" />
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </span>
        </div>
        
        {template && (
          <div className="text-sm text-gray-600">
            Template: {template.displayName}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {/* View Mode */}
        <select
          value={viewMode}
          onChange={(e) => onViewModeChange(e.target.value as ViewerState['viewMode'])}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="standard">Standard</option>
          <option value="compact">Compact</option>
          <option value="detailed">Detailed</option>
          <option value="print">Print View</option>
        </select>
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 border border-gray-300 rounded-md">
          <button
            onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
            className="p-2 hover:bg-gray-100 rounded-l-md"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 text-sm min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}
            className="p-2 hover:bg-gray-100 rounded-r-md"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        
        {/* Fullscreen */}
        <button
          onClick={onFullscreenToggle}
          className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
          title={fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
        
        <div className="w-px h-6 bg-gray-300" />
        
        {/* Actions */}
        {onEdit && !readonly && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
          >
            <Edit className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Edit</span>
          </button>
        )}
        
        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
          >
            <Share2 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Share</span>
          </button>
        )}
        
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Export</span>
          </button>
        )}
        
        {onPrint && (
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Print className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Print</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Report Content Component
const ReportContent: React.FC<{
  report: MedicalReport;
  template?: ReportTemplate;
  viewMode: ViewerState['viewMode'];
  zoom: number;
  searchQuery: string;
  highlightedFindings: string[];
  onSectionClick: (section: string) => void;
  onTextSelect: (text: string) => void;
}> = ({ 
  report, 
  template, 
  viewMode, 
  zoom, 
  searchQuery, 
  highlightedFindings, 
  onSectionClick, 
  onTextSelect 
}) => {
  const highlightSearchTerm = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      onTextSelect(selection.toString().trim());
    }
  };

  const contentStyle = {
    transform: `scale(${zoom})`,
    transformOrigin: 'top left',
    width: `${100 / zoom}%`
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" style={contentStyle}>
      {/* Patient Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">
          Patient Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Patient Name</label>
            <p className="mt-1 text-sm text-gray-900">
              {report.patientInfo.name.first} {report.patientInfo.name.last}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">MRN</label>
            <p className="mt-1 text-sm text-gray-900">{report.patientInfo.mrn}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <p className="mt-1 text-sm text-gray-900">
              {report.patientInfo.dateOfBirth.toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <p className="mt-1 text-sm text-gray-900">
              {report.patientInfo.gender === 'M' ? 'Male' : 'Female'}
            </p>
          </div>
        </div>
      </div>

      {/* Study Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">
          Study Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Study Date</label>
            <p className="mt-1 text-sm text-gray-900">
              {report.studyInfo.studyDate.toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Accession Number</label>
            <p className="mt-1 text-sm text-gray-900">{report.studyInfo.accessionNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Modality</label>
            <p className="mt-1 text-sm text-gray-900">{report.studyInfo.modality}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Body Part</label>
            <p className="mt-1 text-sm text-gray-900">{report.studyInfo.bodyPart}</p>
          </div>
        </div>
      </div>

      {/* Clinical Context */}
      <div className="mb-8">
        <h2 
          className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2 cursor-pointer hover:text-blue-600"
          onClick={() => onSectionClick('clinical-context')}
        >
          Clinical History
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Clinical Indication</label>
            <p 
              className="mt-1 text-sm text-gray-900 select-text"
              onMouseUp={handleTextSelection}
              dangerouslySetInnerHTML={{ 
                __html: highlightSearchTerm(report.clinicalContext.clinicalIndication, searchQuery)
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Clinical History</label>
            <p 
              className="mt-1 text-sm text-gray-900 select-text"
              onMouseUp={handleTextSelection}
              dangerouslySetInnerHTML={{ 
                __html: highlightSearchTerm(report.clinicalContext.clinicalHistory, searchQuery)
              }}
            />
          </div>
        </div>
      </div>

      {/* Findings */}
      <div className="mb-8">
        <h2 
          className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2 cursor-pointer hover:text-blue-600"
          onClick={() => onSectionClick('findings')}
        >
          Findings
        </h2>
        {report.findings.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No findings documented</p>
        ) : (
          <div className="space-y-4">
            {report.findings.map((finding, index) => (
              <div 
                key={finding.id}
                className={`p-4 border rounded-lg ${
                  highlightedFindings.includes(finding.id) 
                    ? 'border-yellow-400 bg-yellow-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Finding {index + 1}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      finding.category === 'normal' 
                        ? 'bg-green-100 text-green-700'
                        : finding.category === 'abnormal'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {finding.category}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      finding.severity === 'mild' 
                        ? 'bg-yellow-100 text-yellow-700'
                        : finding.severity === 'moderate'
                        ? 'bg-orange-100 text-orange-700'
                        : finding.severity === 'severe'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {finding.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {Math.round(finding.confidence * 100)}% confidence
                    </span>
                    {finding.aiGenerated && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        AI Generated
                      </span>
                    )}
                  </div>
                </div>
                <p 
                  className="text-sm text-gray-900 select-text"
                  onMouseUp={handleTextSelection}
                  dangerouslySetInnerHTML={{ 
                    __html: highlightSearchTerm(finding.description, searchQuery)
                  }}
                />
                {finding.anatomicalLocation && (
                  <div className="mt-2 text-xs text-gray-600">
                    Location: {finding.anatomicalLocation.region}
                    {finding.anatomicalLocation.side && ` (${finding.anatomicalLocation.side})`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Impressions */}
      <div className="mb-8">
        <h2 
          className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2 cursor-pointer hover:text-blue-600"
          onClick={() => onSectionClick('impressions')}
        >
          Impression
        </h2>
        {report.impressions.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No impressions documented</p>
        ) : (
          <div className="space-y-4">
            {report.impressions.map((impression, index) => (
              <div key={impression.id} className="p-4 border border-gray-200 rounded-lg bg-blue-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Impression {index + 1}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      impression.category === 'primary' 
                        ? 'bg-blue-100 text-blue-700'
                        : impression.category === 'secondary'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {impression.category}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      impression.certainty === 'definitive' 
                        ? 'bg-green-100 text-green-700'
                        : impression.certainty === 'probable'
                        ? 'bg-blue-100 text-blue-700'
                        : impression.certainty === 'possible'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {impression.certainty}
                    </span>
                  </div>
                </div>
                <p 
                  className="text-sm text-gray-900 font-medium select-text"
                  onMouseUp={handleTextSelection}
                  dangerouslySetInnerHTML={{ 
                    __html: highlightSearchTerm(impression.diagnosis, searchQuery)
                  }}
                />
                {impression.description && (
                  <p 
                    className="mt-2 text-sm text-gray-700 select-text"
                    onMouseUp={handleTextSelection}
                    dangerouslySetInnerHTML={{ 
                      __html: highlightSearchTerm(impression.description, searchQuery)
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <h2 
          className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2 cursor-pointer hover:text-blue-600"
          onClick={() => onSectionClick('recommendations')}
        >
          Recommendations
        </h2>
        {report.recommendations.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No recommendations provided</p>
        ) : (
          <div className="space-y-4">
            {report.recommendations.map((recommendation, index) => (
              <div key={recommendation.id} className="p-4 border border-gray-200 rounded-lg bg-green-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Recommendation {index + 1}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      recommendation.type === 'follow_up' 
                        ? 'bg-blue-100 text-blue-700'
                        : recommendation.type === 'additional_imaging'
                        ? 'bg-purple-100 text-purple-700'
                        : recommendation.type === 'consultation'
                        ? 'bg-green-100 text-green-700'
                        : recommendation.type === 'treatment'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {recommendation.type.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      recommendation.priority === 'immediate' 
                        ? 'bg-red-100 text-red-700'
                        : recommendation.priority === 'urgent'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {recommendation.priority}
                    </span>
                  </div>
                </div>
                <p 
                  className="text-sm text-gray-900 select-text"
                  onMouseUp={handleTextSelection}
                  dangerouslySetInnerHTML={{ 
                    __html: highlightSearchTerm(recommendation.description, searchQuery)
                  }}
                />
                {recommendation.timeframe && (
                  <div className="mt-2 text-xs text-gray-600">
                    Timeframe: {recommendation.timeframe}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signatures */}
      {report.signatures.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">
            Digital Signatures
          </h2>
          <div className="space-y-4">
            {report.signatures.map((signature, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{signature.signerName}</p>
                      <p className="text-sm text-gray-600">{signature.signerRole}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {signature.signatureDate.toLocaleDateString()} at {signature.signatureDate.toLocaleTimeString()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        signature.verified 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {signature.verified ? 'Verified' : 'Unverified'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {signature.signatureType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {report.aiAnalysis && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">
            AI Analysis
          </h2>
          <div className="p-4 border border-gray-200 rounded-lg bg-purple-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">AI Analysis Results</span>
              </div>
              <div className="text-sm text-purple-700">
                Model: {report.aiAnalysis.modelVersion} | 
                Confidence: {Math.round(report.aiAnalysis.confidence * 100)}%
              </div>
            </div>
            
            {report.aiAnalysis.detectedFindings.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-purple-900 mb-2">Detected Findings</h4>
                <div className="space-y-2">
                  {report.aiAnalysis.detectedFindings.map((finding, index) => (
                    <div key={index} className="p-2 bg-white rounded border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">{finding.description}</span>
                        <span className="text-xs text-purple-600">
                          {Math.round(finding.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {report.aiAnalysis.suggestedDiagnoses.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-purple-900 mb-2">Suggested Diagnoses</h4>
                <div className="space-y-2">
                  {report.aiAnalysis.suggestedDiagnoses.map((diagnosis, index) => (
                    <div key={index} className="p-2 bg-white rounded border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">{diagnosis.diagnosis}</span>
                        <span className="text-xs text-purple-600">
                          {Math.round(diagnosis.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Metadata */}
      <div className="border-t border-gray-200 pt-8">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p><strong>Report ID:</strong> {report.id}</p>
            <p><strong>Created:</strong> {report.createdAt.toLocaleDateString()}</p>
            <p><strong>Created by:</strong> {report.createdBy}</p>
          </div>
          <div>
            <p><strong>Last Updated:</strong> {report.updatedAt.toLocaleDateString()}</p>
            <p><strong>Updated by:</strong> {report.lastModifiedBy}</p>
            <p><strong>Version:</strong> {report.metadata.version}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Share Dialog Component
const ShareDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onShare: (recipients: ShareRecipient[]) => void;
  report: MedicalReport;
}> = ({ isOpen, onClose, onShare, report }) => {
  const [recipients, setRecipients] = useState<ShareRecipient[]>([]);
  const [newRecipient, setNewRecipient] = useState<Partial<ShareRecipient>>({
    name: '',
    email: '',
    role: '',
    permission: 'view',
    notificationMethod: 'email'
  });

  const handleAddRecipient = () => {
    if (newRecipient.name && newRecipient.email && newRecipient.role) {
      const recipient: ShareRecipient = {
        id: Date.now().toString(),
        name: newRecipient.name!,
        email: newRecipient.email!,
        role: newRecipient.role!,
        permission: newRecipient.permission || 'view',
        notificationMethod: newRecipient.notificationMethod || 'email'
      };
      setRecipients([...recipients, recipient]);
      setNewRecipient({
        name: '',
        email: '',
        role: '',
        permission: 'view',
        notificationMethod: 'email'
      });
    }
  };

  const handleRemoveRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
  };

  const handleShare = () => {
    onShare(recipients);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Share Report</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Add Recipients</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newRecipient.name || ''}
                  onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter recipient name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newRecipient.email || ''}
                  onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={newRecipient.role || ''}
                  onChange={(e) => setNewRecipient({ ...newRecipient, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Radiologist, Physician"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission
                </label>
                <select
                  value={newRecipient.permission || 'view'}
                  onChange={(e) => setNewRecipient({ ...newRecipient, permission: e.target.value as ShareRecipient['permission'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="view">View Only</option>
                  <option value="comment">View & Comment</option>
                  <option value="edit">Edit</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAddRecipient}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Recipient
              </button>
            </div>
          </div>
          
          {recipients.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Recipients</h3>
              <div className="space-y-2">
                {recipients.map((recipient) => (
                  <div key={recipient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{recipient.name}</p>
                          <p className="text-xs text-gray-600">{recipient.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">{recipient.role}</p>
                          <p className="text-xs text-gray-600">{recipient.permission}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveRecipient(recipient.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={recipients.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Share Report
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Report Viewer Component
export const ReportViewer: React.FC<ReportViewerProps> = ({
  report,
  template,
  onEdit,
  onShare,
  onExport,
  onDistribute,
  onSign,
  onComment,
  readonly = false,
  className = ''
}) => {
  const [viewerState, setViewerState] = useState<ViewerState>({
    viewMode: 'standard',
    zoom: 1,
    fullscreen: false,
    showComments: false,
    showSignatures: false,
    showAuditTrail: false,
    showMetadata: false,
    activeSection: null,
    searchQuery: '',
    comments: [],
    distributionHistory: [],
    selectedText: '',
    highlightedFindings: [],
    bookmarks: [],
    printSettings: {
      pageSize: 'A4',
      orientation: 'portrait',
      margins: 'normal',
      includeCover: true,
      includeSignatures: true,
      includeComments: false,
      includeAuditTrail: false,
      headerFooter: true
    },
    shareDialog: false,
    distributionDialog: false,
    signatureDialog: false,
    commentDialog: false,
    exportDialog: false
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Handle fullscreen
  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setViewerState(prev => ({ ...prev, fullscreen: !prev.fullscreen }));
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle export
  const handleExport = () => {
    setViewerState(prev => ({ ...prev, exportDialog: true }));
  };

  // Handle share
  const handleShare = (recipients: ShareRecipient[]) => {
    if (onShare) {
      onShare(report, recipients);
    }
  };

  // Handle section click
  const handleSectionClick = (section: string) => {
    setViewerState(prev => ({ ...prev, activeSection: section }));
  };

  // Handle text selection
  const handleTextSelect = (text: string) => {
    setViewerState(prev => ({ ...prev, selectedText: text }));
  };

  return (
    <div 
      ref={containerRef}
      className={`medical-report-viewer ${viewerState.fullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}
    >
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <ReportHeader
          report={report}
          template={template}
          onEdit={onEdit ? () => onEdit(report) : undefined}
          onShare={() => setViewerState(prev => ({ ...prev, shareDialog: true }))}
          onExport={handleExport}
          onPrint={handlePrint}
          readonly={readonly}
          viewMode={viewerState.viewMode}
          onViewModeChange={(mode) => setViewerState(prev => ({ ...prev, viewMode: mode }))}
          zoom={viewerState.zoom}
          onZoomChange={(zoom) => setViewerState(prev => ({ ...prev, zoom }))}
          fullscreen={viewerState.fullscreen}
          onFullscreenToggle={handleFullscreenToggle}
        />

        {/* Search Bar */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search report content..."
                value={viewerState.searchQuery}
                onChange={(e) => setViewerState(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewerState(prev => ({ ...prev, showComments: !prev.showComments }))}
                className={`p-2 rounded-md transition-colors ${
                  viewerState.showComments ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
                title="Toggle Comments"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewerState(prev => ({ ...prev, showSignatures: !prev.showSignatures }))}
                className={`p-2 rounded-md transition-colors ${
                  viewerState.showSignatures ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
                title="Toggle Signatures"
              >
                <Shield className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewerState(prev => ({ ...prev, showAuditTrail: !prev.showAuditTrail }))}
                className={`p-2 rounded-md transition-colors ${
                  viewerState.showAuditTrail ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
                title="Toggle Audit Trail"
              >
                <History className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <ReportContent
            report={report}
            template={template}
            viewMode={viewerState.viewMode}
            zoom={viewerState.zoom}
            searchQuery={viewerState.searchQuery}
            highlightedFindings={viewerState.highlightedFindings}
            onSectionClick={handleSectionClick}
            onTextSelect={handleTextSelect}
          />
        </div>

        {/* Share Dialog */}
        <ShareDialog
          isOpen={viewerState.shareDialog}
          onClose={() => setViewerState(prev => ({ ...prev, shareDialog: false }))}
          onShare={handleShare}
          report={report}
        />
      </div>
    </div>
  );
}; 