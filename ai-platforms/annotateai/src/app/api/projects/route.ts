import { NextRequest, NextResponse } from 'next/server';

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

// Mock data for development - replace with actual database queries
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Medical Image Segmentation',
    description: 'Segmentation of brain tumors in MRI scans for deep learning model training',
    type: 'medical',
    status: 'active',
    progress: 67,
    annotationsCount: 1250,
    collaboratorsCount: 3,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    owner: { id: 'user1', name: 'Dr. Sarah Chen' },
    collaborators: [
      { id: 'user1', name: 'Dr. Sarah Chen' },
      { id: 'user2', name: 'Mark Johnson' },
      { id: 'user3', name: 'Lisa Wang' }
    ],
    tags: ['medical', 'segmentation', 'brain'],
    isStarred: true
  },
  {
    id: '2',
    name: 'Autonomous Vehicle Dataset',
    description: 'Object detection and tracking for self-driving car computer vision systems',
    type: 'video',
    status: 'active',
    progress: 45,
    annotationsCount: 3420,
    collaboratorsCount: 5,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-19T11:45:00Z',
    owner: { id: 'user4', name: 'Alex Rodriguez' },
    collaborators: [
      { id: 'user4', name: 'Alex Rodriguez' },
      { id: 'user5', name: 'Emma Thompson' },
      { id: 'user6', name: 'David Kim' },
      { id: 'user7', name: 'Rachel Green' },
      { id: 'user8', name: 'Tom Wilson' }
    ],
    tags: ['automotive', 'object-detection', 'video'],
    isStarred: false
  },
  {
    id: '3',
    name: 'Retail Product Recognition',
    description: 'Image classification for retail inventory management and checkout automation',
    type: 'image',
    status: 'completed',
    progress: 100,
    annotationsCount: 8750,
    collaboratorsCount: 2,
    createdAt: '2023-12-01T14:00:00Z',
    updatedAt: '2024-01-05T16:20:00Z',
    owner: { id: 'user9', name: 'Jennifer Martinez' },
    collaborators: [
      { id: 'user9', name: 'Jennifer Martinez' },
      { id: 'user10', name: 'Michael Brown' }
    ],
    tags: ['retail', 'classification', 'products'],
    isStarred: true
  },
  {
    id: '4',
    name: '3D Point Cloud Analysis',
    description: 'LiDAR point cloud segmentation for construction site monitoring',
    type: '3d',
    status: 'draft',
    progress: 12,
    annotationsCount: 156,
    collaboratorsCount: 1,
    createdAt: '2024-01-18T08:30:00Z',
    updatedAt: '2024-01-18T08:30:00Z',
    owner: { id: 'user11', name: 'Chris Anderson' },
    collaborators: [
      { id: 'user11', name: 'Chris Anderson' }
    ],
    tags: ['3d', 'lidar', 'construction'],
    isStarred: false
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
    createdAt: '2023-10-15T12:00:00Z',
    updatedAt: '2023-12-20T10:15:00Z',
    owner: { id: 'user12', name: 'Dr. Maria Silva' },
    collaborators: [
      { id: 'user12', name: 'Dr. Maria Silva' },
      { id: 'user13', name: 'James Park' },
      { id: 'user14', name: 'Sophie Laurent' },
      { id: 'user15', name: 'Robert Taylor' }
    ],
    tags: ['wildlife', 'conservation', 'detection'],
    isStarred: false
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search') || '';

    // TODO: Replace with actual database query
    // const userId = getUserFromSession(request);
    // const projects = await db.projects.findMany({
    //   where: {
    //     OR: [
    //       { ownerId: userId },
    //       { collaborators: { some: { userId } } }
    //     ]
    //   },
    //   include: {
    //     owner: true,
    //     collaborators: { include: { user: true } },
    //     annotations: true
    //   }
    // });

    let filteredProjects = [...mockProjects];

    // Apply filters
    if (status !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.status === status);
    }

    if (type !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.type === type);
    }

    if (search) {
      filteredProjects = filteredProjects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply sorting
    filteredProjects.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'activity':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'date':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Calculate statistics
    const stats = {
      total: mockProjects.length,
      active: mockProjects.filter(p => p.status === 'active').length,
      completed: mockProjects.filter(p => p.status === 'completed').length,
      archived: mockProjects.filter(p => p.status === 'archived').length,
    };

    return NextResponse.json({
      projects: filteredProjects,
      stats,
      total: filteredProjects.length
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, settings } = body;

    // TODO: Replace with actual database operation
    // const userId = getUserFromSession(request);
    // const project = await db.projects.create({
    //   data: {
    //     name,
    //     description,
    //     type,
    //     ownerId: userId,
    //     settings,
    //     status: 'draft'
    //   },
    //   include: {
    //     owner: true,
    //     collaborators: { include: { user: true } }
    //   }
    // });

    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      type,
      status: 'draft',
      progress: 0,
      annotationsCount: 0,
      collaboratorsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: { id: 'user1', name: 'Current User' },
      collaborators: [{ id: 'user1', name: 'Current User' }],
      tags: [],
      isStarred: false
    };

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectIds, action } = body;

    // TODO: Replace with actual database operations
    // const userId = getUserFromSession(request);
    
    switch (action) {
      case 'archive':
        // await db.projects.updateMany({
        //   where: {
        //     id: { in: projectIds },
        //     ownerId: userId
        //   },
        //   data: { status: 'archived' }
        // });
        break;
      
      case 'delete':
        // await db.projects.deleteMany({
        //   where: {
        //     id: { in: projectIds },
        //     ownerId: userId
        //   }
        // });
        break;
      
      case 'export':
        // Handle export logic
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}

// Helper function to get annotation types based on project type
function getAnnotationTypesForProjectType(type: string): string[] {
  const typeMap: Record<string, string[]> = {
    'image_classification': ['classification'],
    'object_detection': ['bbox'],
    'semantic_segmentation': ['mask'],
    'instance_segmentation': ['mask', 'bbox'],
    'keypoint_detection': ['keypoint', 'bbox'],
    'video_tracking': ['bbox', 'polygon'],
    'point_cloud': ['point', 'bbox'],
    'medical_imaging': ['mask', 'bbox', 'point']
  };

  return typeMap[type] || ['bbox'];
} 