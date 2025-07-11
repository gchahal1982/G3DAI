'use client';

import { useEffect, useState } from 'react';
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
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

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

    loadProject();
  }, [params.id]);

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950">
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

 