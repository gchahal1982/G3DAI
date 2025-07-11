'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  HeartIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  BeakerIcon,
  CubeIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../../shared/components/ui';
import Link from 'next/link';

interface MedicalStats {
  totalStudies: number;
  pendingReports: number;
  criticalFindings: number;
  aiAccuracy: number;
  averageReadTime: number;
  totalPatients: number;
  todayStudies: number;
  radiologists: number;
}

interface MedicalStudy {
  id: string;
  patientId: string;
  patientName: string;
  studyDate: number;
  modality: string;
  bodyPart: string;
  description: string;
  priority: string;
  status: string;
  findings: string[];
  radiologist: string;
  aiConfidence: number;
  readTime: number;
}

interface MedicalDashboardClientProps {
  initialStats: MedicalStats;
  initialStudies: MedicalStudy[];
}

export function MedicalDashboardClient({ initialStats, initialStudies }: MedicalDashboardClientProps) {
  const [showCreateStudy, setShowCreateStudy] = useState(false);
  const [selectedModality, setSelectedModality] = useState('all');

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed': return 'bg-green-100 text-green-800 border-green-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'stat': return 'text-red-400';
      case 'urgent': return 'text-orange-400';
      case 'routine': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getTimeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'CT': return ComputerDesktopIcon;
      case 'MRI': return CubeIcon;
      case 'X-Ray': return DocumentTextIcon;
      case 'Mammography': return BeakerIcon;
      case 'Ultrasound': return HeartIcon;
      default: return EyeIcon;
    }
  };

  return (
    <div className="min-h-screen bg-medical-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <HeartIcon className="h-8 w-8 text-accent-teal mr-3" />
              G3D MedSight Pro
            </h1>
            <p className="text-gray-400 mt-1">Medical Imaging AI Platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              className="glass-input text-white"
            >
              <option value="all">All Modalities</option>
              <option value="CT">CT</option>
              <option value="MRI">MRI</option>
              <option value="X-Ray">X-Ray</option>
              <option value="Mammography">Mammography</option>
              <option value="Ultrasound">Ultrasound</option>
            </select>
            <Button
              onClick={() => setShowCreateStudy(true)}
              className="bg-accent-teal hover:bg-teal-600 text-white px-6 py-2 rounded-lg flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Study
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MedicalStatCard
            title="Total Studies"
            value={initialStats.totalStudies}
            subtitle={`Today: ${initialStats.todayStudies}`}
            icon={DocumentTextIcon}
            iconColor="text-accent-blue"
            bgColor="bg-blue-500/10"
          />
          <MedicalStatCard
            title="Critical Findings"
            value={initialStats.criticalFindings}
            subtitle="Require attention"
            icon={ExclamationTriangleIcon}
            iconColor="text-accent-red"
            bgColor="bg-red-500/10"
          />
          <MedicalStatCard
            title="AI Accuracy"
            value={`${initialStats.aiAccuracy}%`}
            subtitle="Diagnostic confidence"
            icon={BeakerIcon}
            iconColor="text-accent-green"
            bgColor="bg-green-500/10"
          />
          <MedicalStatCard
            title="Avg Read Time"
            value={`${initialStats.averageReadTime}m`}
            subtitle="Per study"
            icon={ClockIcon}
            iconColor="text-accent-orange"
            bgColor="bg-orange-500/10"
          />
        </div>

        {/* Quick Stats Bar */}
        <div className="medsight-glass rounded-xl p-4 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{initialStats.pendingReports}</div>
              <div className="text-sm text-gray-400">Pending Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{initialStats.totalPatients}</div>
              <div className="text-sm text-gray-400">Total Patients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{initialStats.radiologists}</div>
              <div className="text-sm text-gray-400">Radiologists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{initialStats.todayStudies}</div>
              <div className="text-sm text-gray-400">Today's Studies</div>
            </div>
          </div>
        </div>

        {/* Recent Studies */}
        <div className="medsight-glass rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Studies</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Sort by:</span>
              <select className="glass-input text-sm">
                <option>Date</option>
                <option>Priority</option>
                <option>Status</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            {initialStudies.map((study) => (
              <MedicalStudyCard key={study.id} study={study} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MedicalActionCard
            title="DICOM Viewer"
            description="View and analyze medical images"
            icon={ComputerDesktopIcon}
            href="/viewer"
          />
          <MedicalActionCard
            title="AI Diagnostics"
            description="AI-powered medical image analysis"
            icon={BeakerIcon}
            href="/ai-diagnostics"
          />
          <MedicalActionCard
            title="Reports"
            description="Generate and manage medical reports"
            icon={DocumentTextIcon}
            href="/reports"
          />
        </div>
      </div>

      {/* Create Study Modal */}
      {showCreateStudy && (
        <CreateStudyModal onClose={() => setShowCreateStudy(false)} />
      )}
    </div>
  );
}

// Component definitions
function MedicalStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  bgColor
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card p-6 rounded-xl medical-hover"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <CogIcon className="h-4 w-4 text-gray-500" />
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {typeof value === 'number' ? formatNumber(value) : value}
      </div>
      <div className="text-sm text-gray-400">{subtitle}</div>
    </motion.div>
  );
}

function MedicalStudyCard({ study }: { study: MedicalStudy }) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'stat': return 'text-red-400';
      case 'urgent': return 'text-orange-400';
      case 'routine': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getTimeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Recently';
  };

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'CT': return ComputerDesktopIcon;
      case 'MRI': return CubeIcon;
      case 'X-Ray': return DocumentTextIcon;
      case 'Mammography': return BeakerIcon;
      case 'Ultrasound': return HeartIcon;
      default: return EyeIcon;
    }
  };

  const ModalityIcon = getModalityIcon(study.modality);

  return (
    <Link href={`/studies/${study.id}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="border border-gray-700 rounded-lg p-4 hover:border-accent-teal/50 transition-colors cursor-pointer medical-hover"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-accent-teal/20 rounded-lg">
              <ModalityIcon className="h-5 w-5 text-accent-teal" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{study.description}</h3>
              <p className="text-gray-400 text-sm">{study.patientName} • {study.patientId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(study.status)}`}>
              {study.status}
            </span>
            <span className={`text-xs font-medium ${getPriorityColor(study.priority)}`}>
              {study.priority}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
          <div className="flex items-center space-x-4">
            <span>{study.modality}</span>
            <span>{study.bodyPart}</span>
            <span>AI: {study.aiConfidence}%</span>
          </div>
          <span>{getTimeAgo(study.studyDate)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Dr. {study.radiologist}</span>
            <span className="text-gray-600">•</span>
            <span className="text-sm text-gray-400">{study.readTime}m read</span>
          </div>
          <div className="flex items-center space-x-1">
            {study.findings.slice(0, 2).map((finding, index) => (
              <div key={index} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                {finding.substring(0, 20)}...
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function MedicalActionCard({
  title,
  description,
  icon: Icon,
  href
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-accent-teal/50 transition-colors cursor-pointer medical-hover"
      >
        <Icon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </motion.div>
    </Link>
  );
}

function CreateStudyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-modal rounded-xl p-6 w-full max-w-md mx-4"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Create New Study</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Patient ID</label>
            <input
              type="text"
              className="glass-input w-full text-white placeholder-gray-400"
              placeholder="Enter patient ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Modality</label>
            <select className="glass-input w-full text-white">
              <option>CT</option>
              <option>MRI</option>
              <option>X-Ray</option>
              <option>Mammography</option>
              <option>Ultrasound</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Body Part</label>
            <select className="glass-input w-full text-white">
              <option>Chest</option>
              <option>Brain</option>
              <option>Abdomen</option>
              <option>Pelvis</option>
              <option>Spine</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
            <select className="glass-input w-full text-white">
              <option>Routine</option>
              <option>Urgent</option>
              <option>STAT</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button className="flex-1 bg-accent-teal hover:bg-teal-600">
            Create Study
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
} 