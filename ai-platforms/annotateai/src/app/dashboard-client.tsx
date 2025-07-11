'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  FolderIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  EyeIcon,
  VideoCameraIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../../shared/components/ui';
import Link from 'next/link';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalImages: number;
  annotatedImages: number;
  totalVideos: number;
  annotatedVideos: number;
  totalAnnotations: number;
  qualityScore: number;
  aiAssistanceUsage: number;
  collaborators: number;
}

interface RecentProject {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  progress: number;
  totalImages: number;
  annotatedImages: number;
  collaborators: string[];
  lastActivity: number;
  createdAt: number;
  dueDate: number;
}

interface DashboardClientProps {
  initialStats: DashboardStats;
  initialProjects: RecentProject[];
}

export function DashboardClient({ initialStats, initialProjects }: DashboardClientProps) {
  const [showCreateProject, setShowCreateProject] = useState(false);

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
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <SparklesIcon className="h-8 w-8 text-indigo-400 mr-3" />
              G3D AnnotateAI
            </h1>
            <p className="text-gray-400 mt-1">Computer Vision Data Labeling Platform</p>
          </div>
          <Button
            onClick={() => setShowCreateProject(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Project
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Projects"
            value={initialStats.totalProjects}
            subtitle="8 active"
            icon={FolderIcon}
            iconColor="text-blue-400"
            bgColor="bg-blue-500/10"
          />
          <StatCard
            title="Annotations"
            value={initialStats.totalAnnotations}
            subtitle="AI assisted"
            icon={EyeIcon}
            iconColor="text-green-400"
            bgColor="bg-green-500/10"
          />
          <StatCard
            title="Quality Score"
            value={`${initialStats.qualityScore}%`}
            subtitle="High quality"
            icon={ChartBarIcon}
            iconColor="text-purple-400"
            bgColor="bg-purple-500/10"
          />
          <StatCard
            title="Collaborators"
            value={initialStats.collaborators}
            subtitle="Online now"
            icon={UsersIcon}
            iconColor="text-orange-400"
            bgColor="bg-orange-500/10"
          />
        </div>

        {/* Recent Projects */}
        <div className="annotate-glass rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Projects</h2>
          <div className="space-y-4">
            {initialProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Import Dataset"
            description="Upload images or videos for annotation"
            icon={CloudArrowUpIcon}
            href="/import"
          />
          <QuickActionCard
            title="AI Models"
            description="Manage and configure AI assistance models"
            icon={SparklesIcon}
            href="/models"
          />
          <QuickActionCard
            title="Analytics"
            description="View detailed project analytics and insights"
            icon={ChartBarIcon}
            href="/analytics"
          />
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <CreateProjectModal onClose={() => setShowCreateProject(false)} />
      )}
    </div>
  );
}

// Component definitions
function StatCard({
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
      className="glass-card p-6 rounded-xl"
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

function ProjectCard({ project }: { project: RecentProject }) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <Link href={`/projects/${project.id}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="border border-gray-700 rounded-lg p-4 hover:border-indigo-500/50 transition-colors cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-white">{project.name}</h3>
            <p className="text-gray-400 text-sm">{project.description}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
          <span>{project.annotatedImages.toLocaleString()} / {project.totalImages.toLocaleString()} images</span>
          <span>{project.progress}% complete</span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
          <div 
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${project.progress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {project.collaborators.slice(0, 3).map((collaborator, index) => (
              <div
                key={index}
                className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs text-white font-medium"
                title={collaborator}
              >
                {collaborator.charAt(0)}
              </div>
            ))}
            {project.collaborators.length > 3 && (
              <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs text-gray-300">
                +{project.collaborators.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500">{getTimeAgo(project.lastActivity)}</span>
        </div>
      </motion.div>
    </Link>
  );
}

function QuickActionCard({
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
        className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors cursor-pointer"
      >
        <Icon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </motion.div>
    </Link>
  );
}

function CreateProjectModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-modal rounded-xl p-6 w-full max-w-md mx-4"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Create New Project</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 glass-input text-white placeholder-gray-400 focus:outline-none"
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Project Type</label>
            <select className="w-full px-3 py-2 glass-input text-white focus:outline-none">
              <option>Object Detection</option>
              <option>Image Classification</option>
              <option>Semantic Segmentation</option>
              <option>Video Annotation</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
            Create Project
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