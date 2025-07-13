'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

interface Project {
  id: string;
  name: string;
  description: string;
  type: 'image' | 'video' | 'medical' | '3d';
  status: 'active' | 'completed' | 'archived' | 'draft';
  progress: number;
  annotationsCount: number;
  collaboratorsCount: number;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  collaborators: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  tags: string[];
  isStarred: boolean;
}

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  archived: number;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"></div>
          <p className="text-white/70 mt-4 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <ProjectsPageContent />;
}

// Separate component for the actual page content
function ProjectsPageContent() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'archived' | 'draft'>('all');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'medical' | '3d'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'progress' | 'activity'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  useEffect(() => {
    loadProjects();
  }, [filterStatus, filterType, sortBy, sortOrder]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      // Mock data for testing - replace with actual API call
      const mockProjects: Project[] = [
        {
          id: '1',
          name: '3D Point Cloud Analysis',
          description: 'LiDAR point cloud segmentation for autonomous vehicle computer vision systems',
          type: 'image',
          status: 'active',
          progress: 12,
          annotationsCount: 156,
          collaboratorsCount: 4,
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: '2024-01-16T00:00:00Z',
          owner: { id: '1', name: 'John Doe' },
          collaborators: [
            { id: '1', name: 'Alice Johnson' },
            { id: '2', name: 'Bob Smith' },
            { id: '3', name: 'Carol Davis' },
            { id: '4', name: 'David Wilson' }
          ],
          tags: ['3d', 'lidar', 'construction'],
          isStarred: false
        },
        {
          id: '2',
          name: 'Medical Image Segmentation',
          description: 'Segmentation of brain tumors in MRI scans for deep learning model training',
          type: 'medical',
          status: 'active',
          progress: 67,
          annotationsCount: 1250,
          collaboratorsCount: 3,
          createdAt: '2024-01-20T00:00:00Z',
          updatedAt: '2024-01-20T00:00:00Z',
          owner: { id: '2', name: 'Dr. Sarah Chen' },
          collaborators: [
            { id: '5', name: 'Michael Lee' },
            { id: '6', name: 'Lisa Zhang' },
            { id: '7', name: 'Tom Anderson' }
          ],
          tags: ['medical', 'segmentation', 'brain'],
          isStarred: true
        },
        {
          id: '3',
          name: 'Autonomous Vehicle Dataset',
          description: 'Object detection and tracking for self-driving car computer vision systems',
          type: 'video',
          status: 'active',
          progress: 45,
          annotationsCount: 3420,
          collaboratorsCount: 5,
          createdAt: '2024-01-19T00:00:00Z',
          updatedAt: '2024-01-19T00:00:00Z',
          owner: { id: '3', name: 'Emma Rodriguez' },
          collaborators: [
            { id: '8', name: 'James Brown' },
            { id: '9', name: 'Maria Garcia' },
            { id: '10', name: 'Kevin Park' },
            { id: '11', name: 'Jennifer Taylor' },
            { id: '12', name: 'Chris Johnson' }
          ],
          tags: ['automotive', 'object-detection', 'video'],
          isStarred: false
        },
        {
          id: '4',
          name: 'Retail Product Recognition',
          description: 'Image classification for retail inventory management and checkout automation',
          type: 'image',
          status: 'completed',
          progress: 100,
          annotationsCount: 8750,
          collaboratorsCount: 2,
          createdAt: '2024-01-06T00:00:00Z',
          updatedAt: '2024-01-06T00:00:00Z',
          owner: { id: '4', name: 'Rachel Green' },
          collaborators: [
            { id: '13', name: 'Daniel Kim' },
            { id: '14', name: 'Sophie White' }
          ],
          tags: ['retail', 'classification', 'products'],
          isStarred: true
        },
        {
          id: '5',
          name: 'Wildlife Conservation Dataset',
          description: 'Animal detection and counting from camera trap images for conservation research',
          type: 'image',
          status: 'archived',
          progress: 100,
          annotationsCount: 5600,
          collaboratorsCount: 4,
          createdAt: '2023-12-01T00:00:00Z',
          updatedAt: '2023-12-15T00:00:00Z',
          owner: { id: '5', name: 'Dr. Mark Thompson' },
          collaborators: [
            { id: '15', name: 'Anna Martinez' },
            { id: '16', name: 'Paul Wilson' },
            { id: '17', name: 'Helen Davis' },
            { id: '18', name: 'Ryan Miller' }
          ],
          tags: ['wildlife', 'conservation', 'detection'],
          isStarred: false
        }
      ];

      const mockStats: ProjectStats = {
        total: 5,
        active: 2,
        completed: 1,
        archived: 1
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setProjects(mockProjects);
      setStats(mockStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    router.push('/projects/new');
  };

  const handleStarProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/star`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to star project');
      
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, isStarred: !p.isStarred } : p
      ));
    } catch (err) {
      setError('Failed to update project');
    }
  };

  const handleBulkAction = async (action: 'archive' | 'delete' | 'export') => {
    if (selectedProjects.length === 0) return;

    try {
      const response = await fetch('/api/projects/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          projectIds: selectedProjects,
        }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} projects`);

      if (action === 'delete' || action === 'archive') {
        await loadProjects();
        setSelectedProjects([]);
      }
    } catch (err) {
      setError(`Failed to ${action} projects`);
    }
  };

  const getFilteredProjects = () => {
    let filtered = projects;
    
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'completed': return 'bg-blue-600';
      case 'archived': return 'bg-gray-600';
      case 'draft': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'video':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'medical':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case '3d':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const filteredProjects = getFilteredProjects();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"></div>
          <p className="text-white/70 mt-4 text-center">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white font-semibold">Error loading projects</p>
          <p className="text-white/70 mt-2">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-white/70">Manage your annotation projects and datasets</p>
          </div>
          <button
            onClick={handleCreateProject}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium"
          >
            New Project
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Total Projects</span>
                <div className="text-indigo-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-green-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Active</span>
                <div className="text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.active}</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Completed</span>
                <div className="text-blue-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.completed}</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-gray-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Archived</span>
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.archived}</div>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-sm">Search:</span>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/80 text-sm">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/80 text-sm">Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
              >
                <option value="all">All Types</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="medical">Medical</option>
                <option value="3d">3D</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/80 text-sm">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="progress">Progress</option>
                <option value="activity">Activity</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 text-sm border border-white/10 hover:border-indigo-500/50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>

            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all duration-200 ${viewMode === 'grid' ? 'bg-indigo-600 border-indigo-500' : 'bg-white/10 hover:bg-white/20 border-white/10 hover:border-indigo-500/50'} text-white border`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all duration-200 ${viewMode === 'list' ? 'bg-indigo-600 border-indigo-500' : 'bg-white/10 hover:bg-white/20 border-white/10 hover:border-indigo-500/50'} text-white border`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {selectedProjects.length > 0 && (
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <span className="text-white/80 text-sm">{selectedProjects.length} selected</span>
              <button
                onClick={() => handleBulkAction('archive')}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
              >
                Archive
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
              >
                Export
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Projects Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6 hover:bg-white/10 hover:border-indigo-500/30 hover:scale-105 transition-all duration-300">
                <div className="flex items-start justify-between mb-3 lg:mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProjects([...selectedProjects, project.id]);
                        } else {
                          setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                        }
                      }}
                      className="rounded border-white/20"
                    />
                    <div className="text-indigo-400 flex-shrink-0">
                      {getTypeIcon(project.type)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleStarProject(project.id)}
                    className={`p-1 rounded flex-shrink-0 ${project.isStarred ? 'text-yellow-400' : 'text-white/40 hover:text-white/70'} transition-colors`}
                  >
                    <svg className="w-4 h-4" fill={project.isStarred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                </div>

                <Link href={`/projects/${project.id}`} className="block">
                  <h3 className="text-white font-semibold mb-2 hover:text-indigo-400 transition-colors text-sm lg:text-base line-clamp-2">{project.name}</h3>
                  <p className="text-white/70 text-xs lg:text-sm mb-3 lg:mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(project.status)}`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs whitespace-nowrap">
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-1 bg-white/5 text-white/50 rounded text-xs">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs lg:text-sm text-white/70 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 lg:h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 lg:h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs lg:text-sm text-white/70">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0 flex-1">
                      <span className="whitespace-nowrap">{project.annotationsCount} annotations</span>
                      <span className="whitespace-nowrap">{project.collaboratorsCount} collaborators</span>
                    </div>
                    <div className="flex -space-x-1 ml-2 flex-shrink-0">
                      {project.collaborators.slice(0, 3).map((collaborator, index) => (
                        <div 
                          key={index} 
                          className="w-5 h-5 lg:w-6 lg:h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white/20 relative"
                          title={collaborator.name}
                        >
                          <span className="text-white text-[9px] lg:text-[10px] leading-none">
                            {collaborator.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      ))}
                      {project.collaborators.length > 3 && (
                        <div 
                          className="w-5 h-5 lg:w-6 lg:h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white/20 relative"
                          title={`+${project.collaborators.length - 3} more collaborators`}
                        >
                          <span className="text-white text-[9px] lg:text-[10px] leading-none">
                            +{project.collaborators.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-white/50 mt-2 lg:mt-3">
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left py-4 px-6 text-white/80 font-medium">
                      <input
                        type="checkbox"
                        checked={selectedProjects.length === filteredProjects.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProjects(filteredProjects.map(p => p.id));
                          } else {
                            setSelectedProjects([]);
                          }
                        }}
                        className="rounded border-white/20"
                      />
                    </th>
                    <th className="text-left py-4 px-6 text-white/80 font-medium">Name</th>
                    <th className="text-left py-4 px-6 text-white/80 font-medium">Type</th>
                    <th className="text-left py-4 px-6 text-white/80 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-white/80 font-medium">Progress</th>
                    <th className="text-left py-4 px-6 text-white/80 font-medium">Annotations</th>
                    <th className="text-left py-4 px-6 text-white/80 font-medium">Collaborators</th>
                    <th className="text-left py-4 px-6 text-white/80 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProjects([...selectedProjects, project.id]);
                            } else {
                              setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                            }
                          }}
                          className="rounded border-white/20"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <Link href={`/projects/${project.id}`} className="text-white/90 hover:text-indigo-400 font-medium">
                          {project.name}
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-white/80">
                          {getTypeIcon(project.type)}
                          <span className="capitalize">{project.type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(project.status)}`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-white/70 text-sm">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-white/90">{project.annotationsCount}</td>
                      <td className="py-4 px-6">
                        <div className="flex -space-x-1">
                          {project.collaborators.slice(0, 3).map((collaborator, index) => (
                            <div 
                              key={index} 
                              className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-medium border border-white/20 relative"
                              title={collaborator.name}
                            >
                              <span className="text-white text-[10px] leading-none">
                                {collaborator.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          ))}
                          {project.collaborators.length > 3 && (
                            <div 
                              className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-medium border border-white/20 relative"
                              title={`+${project.collaborators.length - 3} more collaborators`}
                            >
                              <span className="text-white text-[10px] leading-none">
                                +{project.collaborators.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-white/70 text-sm">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="annotate-glass rounded-xl p-12 text-center">
            <div className="text-white/40 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
            <p className="text-white/70 mb-6">Create your first annotation project to get started</p>
            <button
              onClick={handleCreateProject}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium"
            >
              Create New Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 