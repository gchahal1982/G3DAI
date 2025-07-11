import { AnnotationWorkbench } from '../../../components/AnnotationWorkbench';

interface ProjectPageProps {
  params: { id: string };
}

async function getProjectData(id: string) {
  // In production, this would fetch project details from the database
  return {
    id,
    name: `Project ${id}`,
    type: 'image', // Default to image annotation
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProjectData(params.id);
  
  return (
    <div className="min-h-screen bg-gray-900">
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

export function generateMetadata({ params }: ProjectPageProps) {
  return {
    title: `Project ${params.id} - AnnotateAI Workbench`,
    description: 'AI-powered annotation workbench for computer vision data labeling',
  };
} 