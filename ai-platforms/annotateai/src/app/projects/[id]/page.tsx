'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { AnnotationWorkbench } from '../../../components/AnnotationWorkbench';

interface ProjectPageProps {
  params: { id: string };
}

interface ProjectData {
  id: string;
  name: string;
  type: string;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const getProjectData = async (id: string) => {
      // In production, this would fetch project details from the database
      return {
        id,
        name: `Project ${id}`,
        type: 'image', // Default to image annotation
      };
    };

    const loadProject = async () => {
      try {
        const projectData = await getProjectData(params.id);
        setProject(projectData);
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadProject();
    }
  }, [params.id, isAuthenticated]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 flex items-center justify-center">
        <div className="text-white">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 flex items-center justify-center">
        <div className="text-white">Project not found</div>
      </div>
    );
  }
  
  return (
    <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950">
      <AnnotationWorkbench
        projectId={params.id}
        mode="image" // Start with image mode
        collaborative={true}
        onSave={(session) => {
          console.log('Session saved:', session);
          // In production, this would save to the backend
        }}
        onExport={(format) => {
          console.log('Export format:', format);
          // In production, this would trigger export
        }}
      />
    </div>
  );
}

 