'use client';

import React, { useState } from 'react';
import { 
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  SparklesIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  PhotoIcon,
  CameraIcon,
  PlayIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
  DocumentTextIcon as DocumentTextIconSolid,
  CalendarIcon as CalendarIconSolid,
  UserIcon as UserIconSolid,
  SparklesIcon as SparklesIconSolid,
  EyeIcon as EyeIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  PhotoIcon as PhotoIconSolid,
  CameraIcon as CameraIconSolid,
  PlayIcon as PlayIconSolid
} from '@heroicons/react/24/solid';

interface MedicalStudy {
  id: string;
  patientId: string;
  patientName: string;
  studyType: string;
  modality: string;
  bodyPart: string;
  acquisitionDate: Date;
  completionDate?: Date;
  status: 'acquired' | 'processing' | 'reviewed' | 'reported' | 'archived';
  radiologist?: string;
  findings?: string;
  aiAnalysis?: {
    completed: boolean;
    confidence: number;
    findings: string[];
  };
  images: number;
  size: string;
}

interface RecentStudiesProps {
  studies: MedicalStudy[];
  onStudyClick: (studyId: string) => void;
  onStudyUpdate: () => void;
}

export function RecentStudies({ studies, onStudyClick, onStudyUpdate }: RecentStudiesProps) {
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'modality'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'acquired' | 'processing' | 'reviewed' | 'reported' | 'archived'>('all');
  const [filterModality, setFilterModality] = useState<'all' | 'CT' | 'MRI' | 'XR' | 'US' | 'NM'>('all');

  const statusColors = {
    acquired: { bg: 'bg-blue-50', text: 'text-blue-700', icon: DocumentTextIconSolid },
    processing: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: ClockIconSolid },
    reviewed: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircleIconSolid },
    reported: { bg: 'bg-purple-50', text: 'text-purple-700', icon: EyeIconSolid },
    archived: { bg: 'bg-gray-50', text: 'text-gray-700', icon: DocumentTextIconSolid }
  };

  const modalityColors = {
    CT: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CameraIconSolid },
    MRI: { bg: 'bg-purple-100', text: 'text-purple-800', icon: PhotoIconSolid },
    XR: { bg: 'bg-green-100', text: 'text-green-800', icon: PhotoIconSolid },
    US: { bg: 'bg-teal-100', text: 'text-teal-800', icon: PlayIconSolid },
    NM: { bg: 'bg-orange-100', text: 'text-orange-800', icon: SparklesIconSolid }
  };

  // Filter and sort studies
  const filteredStudies = studies
    .filter(study => {
      const matchesStatus = filterStatus === 'all' || study.status === filterStatus;
      const matchesModality = filterModality === 'all' || study.modality === filterModality;
      return matchesStatus && matchesModality;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.acquisitionDate).getTime() - new Date(a.acquisitionDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'modality':
          return a.modality.localeCompare(b.modality);
        default:
          return 0;
      }
    });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const handleStudyAction = (studyId: string, action: 'view' | 'review' | 'archive') => {
    console.log(`Study ${studyId} - ${action}`);
    if (action === 'view') {
      onStudyClick(studyId);
    } else {
      onStudyUpdate();
    }
  };

  return (
    <div className="medsight-glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 
            className="text-xl font-semibold text-slate-800"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            Recent Studies
          </h2>
          <p 
            className="text-sm text-slate-600 mt-1"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            {filteredStudies.length} recent medical studies
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Filter by Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-white/70 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-medsight-primary-500"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            <option value="all">All Status</option>
            <option value="acquired">Acquired</option>
            <option value="processing">Processing</option>
            <option value="reviewed">Reviewed</option>
            <option value="reported">Reported</option>
            <option value="archived">Archived</option>
          </select>

          {/* Filter by Modality */}
          <select
            value={filterModality}
            onChange={(e) => setFilterModality(e.target.value as any)}
            className="px-3 py-2 bg-white/70 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-medsight-primary-500"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            <option value="all">All Modalities</option>
            <option value="CT">CT</option>
            <option value="MRI">MRI</option>
            <option value="XR">X-Ray</option>
            <option value="US">Ultrasound</option>
            <option value="NM">Nuclear Medicine</option>
          </select>

          {/* Sort by */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white/70 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-medsight-primary-500"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            <option value="date">Date</option>
            <option value="status">Status</option>
            <option value="modality">Modality</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredStudies.map((study) => {
          const statusStyle = statusColors[study.status];
          const modalityStyle = modalityColors[study.modality as keyof typeof modalityColors] || modalityColors.CT;

          return (
            <div
              key={study.id}
              className="p-4 rounded-lg bg-white/50 border border-white/20 hover:bg-white/70 transition-all duration-200 cursor-pointer"
              onClick={() => onStudyClick(study.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {/* Modality Icon */}
                    <div className={`w-8 h-8 ${modalityStyle.bg} rounded-lg flex items-center justify-center`}>
                      <modalityStyle.icon className={`w-4 h-4 ${modalityStyle.text}`} />
                    </div>

                    {/* Study Info */}
                    <div className="flex-1">
                      <h3 
                        className="font-semibold text-slate-800 text-sm"
                        style={{ 
                          fontFamily: 'var(--font-primary)',
                          letterSpacing: '0.01em'
                        }}
                      >
                        {study.studyType} - {study.patientName}
                      </h3>
                      <p 
                        className="text-xs text-slate-600"
                        style={{ 
                          fontFamily: 'var(--font-primary)',
                          letterSpacing: '0.01em'
                        }}
                      >
                        {study.bodyPart} • {study.modality} • ID: {study.patientId}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center space-x-1 px-2 py-1 ${statusStyle.bg} rounded-full`}>
                      <statusStyle.icon className={`w-3 h-3 ${statusStyle.text}`} />
                      <span 
                        className={`text-xs font-medium ${statusStyle.text} capitalize`}
                        style={{ 
                          fontFamily: 'var(--font-primary)',
                          letterSpacing: '0.01em'
                        }}
                      >
                        {study.status}
                      </span>
                    </div>
                  </div>

                  {/* Study Metadata */}
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-1">
                      <CalendarIconSolid className="w-3 h-3 text-slate-400" />
                      <span 
                        className="text-xs text-slate-600"
                        style={{ 
                          fontFamily: 'var(--font-primary)',
                          letterSpacing: '0.01em'
                        }}
                      >
                        {formatDate(study.acquisitionDate)} ({formatTimeAgo(study.acquisitionDate)})
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <PhotoIconSolid className="w-3 h-3 text-slate-400" />
                      <span 
                        className="text-xs text-slate-600"
                        style={{ 
                          fontFamily: 'var(--font-primary)',
                          letterSpacing: '0.01em'
                        }}
                      >
                        {study.images} images • {study.size}
                      </span>
                    </div>
                    {study.radiologist && (
                      <div className="flex items-center space-x-1">
                        <UserIconSolid className="w-3 h-3 text-slate-400" />
                        <span 
                          className="text-xs text-slate-600"
                          style={{ 
                            fontFamily: 'var(--font-primary)',
                            letterSpacing: '0.01em'
                          }}
                        >
                          {study.radiologist}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* AI Analysis */}
                  {study.aiAnalysis && (
                    <div className="mb-3 p-3 bg-white/60 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <SparklesIconSolid className="w-4 h-4 text-purple-500" />
                        <span 
                          className="text-xs font-medium text-purple-700"
                          style={{ 
                            fontFamily: 'var(--font-primary)',
                            letterSpacing: '0.01em'
                          }}
                        >
                          AI Analysis
                        </span>
                        {study.aiAnalysis.completed ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Complete ({Math.round(study.aiAnalysis.confidence * 100)}% confidence)
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                            Processing...
                          </span>
                        )}
                      </div>
                      {study.aiAnalysis.completed && study.aiAnalysis.findings.length > 0 && (
                        <div className="space-y-1">
                          {study.aiAnalysis.findings.map((finding, index) => (
                            <div 
                              key={index}
                              className="text-xs text-slate-700"
                              style={{ 
                                fontFamily: 'var(--font-primary)',
                                letterSpacing: '0.01em'
                              }}
                            >
                              • {finding}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Findings */}
                  {study.findings && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <EyeIconSolid className="w-4 h-4 text-blue-500" />
                        <span 
                          className="text-xs font-medium text-blue-700"
                          style={{ 
                            fontFamily: 'var(--font-primary)',
                            letterSpacing: '0.01em'
                          }}
                        >
                          Radiologist Findings
                        </span>
                      </div>
                      <p 
                        className="text-xs text-blue-700"
                        style={{ 
                          fontFamily: 'var(--font-primary)',
                          letterSpacing: '0.01em'
                        }}
                      >
                        {study.findings}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {study.completionDate && (
                        <div className="flex items-center space-x-1">
                          <CheckCircleIconSolid className="w-3 h-3 text-green-500" />
                          <span 
                            className="text-xs text-green-600"
                            style={{ 
                              fontFamily: 'var(--font-primary)',
                              letterSpacing: '0.01em'
                            }}
                          >
                            Completed {formatDate(study.completionDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStudyAction(study.id, 'view');
                        }}
                        className="px-3 py-1 bg-medsight-primary-500 text-white text-xs rounded-lg hover:bg-medsight-primary-600 transition-colors"
                      >
                        View Study
                      </button>
                      {study.status === 'acquired' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStudyAction(study.id, 'review');
                          }}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Start Review
                        </button>
                      )}
                      {study.status === 'reported' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStudyAction(study.id, 'archive');
                          }}
                          className="px-3 py-1 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Archive
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStudyClick(study.id);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <ArrowRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudies.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <DocumentTextIconSolid className="w-8 h-8 text-slate-400" />
          </div>
          <h3 
            className="text-lg font-medium text-slate-600 mb-2"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            No Recent Studies
          </h3>
          <p 
            className="text-sm text-slate-500"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            No studies found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
} 