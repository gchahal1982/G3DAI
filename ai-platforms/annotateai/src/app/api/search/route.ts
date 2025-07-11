import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  id: string;
  type: 'project' | 'dataset' | 'file' | 'annotation' | 'user' | 'help';
  title: string;
  description: string;
  url: string;
  metadata?: Record<string, any>;
  score?: number;
  highlighted?: {
    title?: string;
    description?: string;
  };
}

// Mock data for demonstration - in production, this would come from a search index
const MOCK_PROJECTS = [
  {
    id: 'proj1',
    name: 'Medical Imaging Dataset',
    description: 'Large-scale medical imaging dataset for training diagnostic AI models',
    type: 'medical',
    status: 'active',
    tags: ['medical', 'imaging', 'radiology', 'ai'],
  },
  {
    id: 'proj2',
    name: 'Autonomous Vehicle Detection',
    description: 'Object detection dataset for self-driving car perception systems',
    type: 'automotive',
    status: 'completed',
    tags: ['automotive', 'detection', 'autonomous', 'computer vision'],
  },
  {
    id: 'proj3',
    name: 'Retail Product Recognition',
    description: 'Product identification and classification for retail automation',
    type: 'retail',
    status: 'active',
    tags: ['retail', 'products', 'classification', 'ecommerce'],
  },
];

const MOCK_FILES = [
  {
    id: 'file1',
    name: 'chest_xray_dataset.zip',
    description: 'Chest X-ray images with pneumonia annotations',
    type: 'image',
    projectId: 'proj1',
    size: '2.3 GB',
  },
  {
    id: 'file2',
    name: 'traffic_video_annotations.json',
    description: 'Annotated traffic video sequences for object tracking',
    type: 'annotation',
    projectId: 'proj2',
    size: '156 MB',
  },
];

const MOCK_HELP_ARTICLES = [
  {
    id: 'help1',
    title: 'How to Export Annotations',
    description: 'Step-by-step guide to export your annotations in various formats including COCO, YOLO, and Pascal VOC',
    category: 'export',
    tags: ['export', 'annotations', 'formats', 'coco', 'yolo'],
  },
  {
    id: 'help2',
    title: 'Setting Up Team Collaboration',
    description: 'Learn how to invite team members, set permissions, and collaborate on annotation projects',
    category: 'collaboration',
    tags: ['team', 'collaboration', 'permissions', 'sharing'],
  },
  {
    id: 'help3',
    title: 'AI Model Integration Guide',
    description: 'Complete guide to integrating your custom AI models with the annotation platform',
    category: 'ai',
    tags: ['ai', 'models', 'integration', 'custom', 'api'],
  },
];

const MOCK_USERS = [
  {
    id: 'user1',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@hospital.com',
    role: 'Medical Annotator',
    department: 'Radiology',
  },
  {
    id: 'user2',
    name: 'Alex Rodriguez',
    email: 'alex@autotech.com',
    role: 'ML Engineer',
    department: 'Computer Vision',
  },
];

function calculateScore(item: any, query: string, category: string): number {
  const lowerQuery = query.toLowerCase();
  let score = 0;

  // Exact matches get highest score
  if (item.name?.toLowerCase().includes(lowerQuery) || 
      item.title?.toLowerCase().includes(lowerQuery)) {
    score += 100;
  }

  // Description matches
  if (item.description?.toLowerCase().includes(lowerQuery)) {
    score += 50;
  }

  // Tag matches
  if (item.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery))) {
    score += 30;
  }

  // Category matches
  if (item.type?.toLowerCase().includes(lowerQuery) || 
      item.category?.toLowerCase().includes(lowerQuery)) {
    score += 20;
  }

  // Metadata matches
  if (item.metadata) {
    const metadataString = JSON.stringify(item.metadata).toLowerCase();
    if (metadataString.includes(lowerQuery)) {
      score += 10;
    }
  }

  return score;
}

function highlightText(text: string, query: string): string {
  if (!text || !query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark class="bg-indigo-500/30 text-indigo-200 rounded px-1">$1</mark>');
}

function searchProjects(query: string): SearchResult[] {
  return MOCK_PROJECTS
    .map(project => ({
      ...project,
      score: calculateScore(project, query, 'project'),
    }))
    .filter(project => project.score > 0)
    .map(project => ({
      id: project.id,
      type: 'project' as const,
      title: project.name,
      description: project.description,
      url: `/projects/${project.id}`,
      metadata: {
        type: project.type,
        status: project.status,
        tags: project.tags,
      },
      score: project.score / 100,
      highlighted: {
        title: highlightText(project.name, query),
        description: highlightText(project.description, query),
      },
    }));
}

function searchFiles(query: string): SearchResult[] {
  return MOCK_FILES
    .map(file => ({
      ...file,
      score: calculateScore(file, query, 'file'),
    }))
    .filter(file => file.score > 0)
    .map(file => ({
      id: file.id,
      type: 'file' as const,
      title: file.name,
      description: file.description,
      url: `/projects/${file.projectId}/files/${file.id}`,
      metadata: {
        type: file.type,
        size: file.size,
        projectId: file.projectId,
      },
      score: file.score / 100,
      highlighted: {
        title: highlightText(file.name, query),
        description: highlightText(file.description, query),
      },
    }));
}

function searchHelp(query: string): SearchResult[] {
  return MOCK_HELP_ARTICLES
    .map(article => ({
      ...article,
      score: calculateScore(article, query, 'help'),
    }))
    .filter(article => article.score > 0)
    .map(article => ({
      id: article.id,
      type: 'help' as const,
      title: article.title,
      description: article.description,
      url: `/help/articles/${article.id}`,
      metadata: {
        category: article.category,
        tags: article.tags,
      },
      score: article.score / 100,
      highlighted: {
        title: highlightText(article.title, query),
        description: highlightText(article.description, query),
      },
    }));
}

function searchUsers(query: string): SearchResult[] {
  return MOCK_USERS
    .map(user => ({
      ...user,
      score: calculateScore(user, query, 'user'),
    }))
    .filter(user => user.score > 0)
    .map(user => ({
      id: user.id,
      type: 'user' as const,
      title: user.name,
      description: `${user.role} in ${user.department}`,
      url: `/users/${user.id}`,
      metadata: {
        email: user.email,
        role: user.role,
        department: user.department,
      },
      score: user.score / 100,
      highlighted: {
        title: highlightText(user.name, query),
        description: highlightText(`${user.role} in ${user.department}`, query),
      },
    }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Query must be at least 2 characters long',
      }, { status: 400 });
    }

    let allResults: SearchResult[] = [];

    // Search in different categories based on selection
    if (category === 'all' || category === 'projects') {
      allResults.push(...searchProjects(query));
    }

    if (category === 'all' || category === 'files') {
      allResults.push(...searchFiles(query));
    }

    if (category === 'all' || category === 'help') {
      allResults.push(...searchHelp(query));
    }

    if (category === 'all' || category === 'users') {
      allResults.push(...searchUsers(query));
    }

    // Sort by score (descending)
    allResults.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Limit results
    const limitedResults = allResults.slice(0, limit);

    // TODO: Log search analytics
    // await logSearchAnalytics({
    //   query,
    //   category,
    //   resultsCount: limitedResults.length,
    //   timestamp: new Date(),
    //   userId: 'user_demo', // Get from auth
    // });

    return NextResponse.json({
      success: true,
      query,
      category,
      resultsCount: limitedResults.length,
      totalResults: allResults.length,
      results: limitedResults,
      executionTime: Date.now() % 100, // Mock execution time
    }, { status: 200 });

  } catch (error) {
    console.error('Search error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Search suggestions endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 5 } = body;

    if (!query || query.length < 1) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      }, { status: 200 });
    }

    // Generate suggestions based on query
    const suggestions = [];

    // Add matching project names
    for (const project of MOCK_PROJECTS) {
      if (project.name.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push({
          id: `proj-${project.id}`,
          text: project.name,
          type: 'project',
          description: project.description,
        });
      }
    }

    // Add matching help articles
    for (const article of MOCK_HELP_ARTICLES) {
      if (article.title.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push({
          id: `help-${article.id}`,
          text: article.title,
          type: 'help',
          description: article.description,
        });
      }
    }

    // Add common search terms
    const commonTerms = [
      'object detection',
      'semantic segmentation',
      'annotation export',
      'team collaboration',
      'quality metrics',
      'AI model training',
      'dataset management',
      'project settings',
    ];

    for (const term of commonTerms) {
      if (term.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push({
          id: `term-${term.replace(/\s+/g, '-')}`,
          text: term,
          type: 'suggestion',
          description: `Search for "${term}"`,
        });
      }
    }

    // Limit and deduplicate
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text === suggestion.text)
      )
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      query,
      suggestions: uniqueSuggestions,
    }, { status: 200 });

  } catch (error) {
    console.error('Search suggestions error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get suggestions',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 