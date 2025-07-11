import { DashboardClient } from './dashboard-client';

// Server Component - can fetch data directly
async function getProjectsData() {
  try {
    // In development, return mock data. In production, this would fetch from database
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3021'}/api/projects`, {
      cache: 'no-store', // Always fetch fresh data
    });
    
    if (!response.ok) {
      // Return mock data as fallback
      return getMockData();
    }
    
    return await response.json();
  } catch (error) {
    console.log('Using mock data in development mode');
    return getMockData();
  }
}

function getMockData() {
  return {
    stats: {
      totalProjects: 8,
      activeProjects: 3,
      totalImages: 156780,
      annotatedImages: 148421,
      totalVideos: 24,
      annotatedVideos: 18,
      totalAnnotations: 156780,
      qualityScore: 94.7,
      aiAssistanceUsage: 78.3,
      collaborators: 12
    },
    recentProjects: [
      {
        id: 'proj_001',
        name: 'Autonomous Vehicle Dataset',
        description: 'Traffic scene annotation for self-driving cars',
        type: 'object_detection',
        status: 'active',
        progress: 73,
        totalImages: 15420,
        annotatedImages: 11256,
        collaborators: ['Alice Johnson', 'Bob Chen', 'Carol Smith'],
        lastActivity: Date.now() - 1000 * 60 * 30,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
        dueDate: Date.now() + 1000 * 60 * 60 * 24 * 7
      },
      {
        id: 'proj_002',
        name: 'Medical Imaging Analysis',
        description: 'X-ray and CT scan annotation for diagnostic AI',
        type: 'medical_imaging',
        status: 'active',
        progress: 45,
        totalImages: 8750,
        annotatedImages: 3938,
        collaborators: ['Dr. Williams', 'Sarah Davis'],
        lastActivity: Date.now() - 1000 * 60 * 45,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
        dueDate: Date.now() + 1000 * 60 * 60 * 24 * 14
      },
      {
        id: 'proj_003',
        name: 'Retail Product Recognition',
        description: 'E-commerce product catalog annotation',
        type: 'classification',
        status: 'completed',
        progress: 100,
        totalImages: 5200,
        annotatedImages: 5200,
        collaborators: ['Mike Johnson'],
        lastActivity: Date.now() - 1000 * 60 * 60 * 2,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
        dueDate: Date.now() - 1000 * 60 * 60 * 24 * 3
      }
    ]
  };
}

export default async function HomePage() {
  const data = await getProjectsData();
  
  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardClient 
        initialStats={data.stats}
        initialProjects={data.recentProjects}
      />
    </div>
  );
} 