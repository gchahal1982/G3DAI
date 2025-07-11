'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  EyeIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  PauseIcon,
  ArrowsPointingOutIcon,
  PhotoIcon,
  DocumentArrowUpIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BeakerIcon,
  ShareIcon,
  PrinterIcon,
  BookmarkIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function ImagingWorkspacePage() {
  const router = useRouter();
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterModality, setFilterModality] = useState('all');

  const mockStudies = [
    {
      id: 'ST001',
      patientName: 'John Smith',
      patientId: 'P001234',
      studyDate: '2024-01-15',
      modality: 'CT',
      bodyPart: 'Chest',
      seriesCount: 3,
      imageCount: 156,
      status: 'pending',
      priority: 'routine',
      description: 'CT Chest W/O Contrast'
    },
    {
      id: 'ST002',
      patientName: 'Sarah Johnson',
      patientId: 'P001235',
      studyDate: '2024-01-15',
      modality: 'MRI',
      bodyPart: 'Brain',
      seriesCount: 5,
      imageCount: 234,
      status: 'reviewed',
      priority: 'urgent',
      description: 'MRI Brain W/ and W/O Contrast'
    },
    {
      id: 'ST003',
      patientName: 'Robert Wilson',
      patientId: 'P001236',
      studyDate: '2024-01-15',
      modality: 'X-Ray',
      bodyPart: 'Chest',
      seriesCount: 2,
      imageCount: 2,
      status: 'critical',
      priority: 'stat',
      description: 'Chest X-Ray PA and Lateral'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500/20 text-red-700 border-red-200/50';
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 border-yellow-200/50';
      case 'reviewed': return 'bg-green-500/20 text-green-700 border-green-200/50';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-200/50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat': return 'text-red-600 font-bold';
      case 'urgent': return 'text-orange-600 font-semibold';
      case 'routine': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <EyeIcon className="w-8 h-8 text-blue-600 mr-3" />
              Medical Imaging Workspace
            </h1>
            <p className="text-gray-700 mt-1">DICOM Image Viewing and Analysis Platform</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-blue-500/20 text-blue-700 rounded-xl border border-blue-200/50 hover:bg-blue-500/30 transition-colors flex items-center space-x-2">
              <DocumentArrowUpIcon className="w-5 h-5" />
              <span>Upload DICOM</span>
            </button>
            <button className="px-4 py-2 bg-green-500/20 text-green-700 rounded-xl border border-green-200/50 hover:bg-green-500/30 transition-colors flex items-center space-x-2">
              <BeakerIcon className="w-5 h-5" />
              <span>AI Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search studies, patients..."
                className="pl-10 pr-4 py-2 rounded-xl bg-white/50 border border-white/30 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300"
              />
            </div>
            <select 
              value={filterModality}
              onChange={(e) => setFilterModality(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/50 border border-white/30 text-gray-900"
            >
              <option value="all">All Modalities</option>
              <option value="CT">CT</option>
              <option value="MRI">MRI</option>
              <option value="X-Ray">X-Ray</option>
              <option value="Mammography">Mammography</option>
              <option value="Ultrasound">Ultrasound</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-500/20 text-blue-700' : 'text-gray-500 hover:bg-white/50'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-500/20 text-blue-700' : 'text-gray-500 hover:bg-white/50'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Studies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockStudies.map((study) => (
          <div
            key={study.id}
            className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:bg-white/70 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedStudy(study)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{study.patientName}</h3>
                <p className="text-sm text-gray-600">{study.patientId}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-medium border backdrop-blur-sm ${getStatusColor(study.status)}`}>
                  {study.status.toUpperCase()}
                </span>
                <span className={`text-xs ${getPriorityColor(study.priority)}`}>
                  {study.priority.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Study Date</span>
                <span className="text-sm font-medium text-gray-900">{study.studyDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Modality</span>
                <span className="text-sm font-medium text-gray-900">{study.modality}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Body Part</span>
                <span className="text-sm font-medium text-gray-900">{study.bodyPart}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Images</span>
                <span className="text-sm font-medium text-gray-900">{study.imageCount}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/30">
              <p className="text-sm text-gray-700 mb-3">{study.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-blue-500/20 text-blue-700 rounded-lg hover:bg-blue-500/30 transition-colors">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-purple-500/20 text-purple-700 rounded-lg hover:bg-purple-500/30 transition-colors">
                    <BeakerIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-green-500/20 text-green-700 rounded-lg hover:bg-green-500/30 transition-colors">
                    <ShareIcon className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/workspace/imaging/viewer/${study.id}`);
                  }}
                >
                  Open Viewer →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">156</div>
          <div className="text-sm text-gray-600">Total Studies</div>
        </div>
        <div className="bg-white/60 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">23</div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        <div className="bg-white/60 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">8</div>
          <div className="text-sm text-gray-600">Critical Findings</div>
        </div>
        <div className="bg-white/60 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">97.3%</div>
          <div className="text-sm text-gray-600">AI Accuracy</div>
        </div>
      </div>
    </div>
  );
} 