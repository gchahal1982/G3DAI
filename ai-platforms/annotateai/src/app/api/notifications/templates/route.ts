import { NextRequest, NextResponse } from 'next/server';

// Notification template interface
interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'project' | 'annotation' | 'billing' | 'system' | 'collaboration';
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  variables: string[]; // Available template variables
  isActive: boolean;
  isSystem: boolean; // System templates cannot be deleted
  channels: ('inApp' | 'email' | 'push')[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Mock notification templates
let templates: NotificationTemplate[] = [
  {
    id: 'template-1',
    name: 'Project Created',
    description: 'Notification sent when a new project is created',
    category: 'project',
    type: 'success',
    priority: 'medium',
    title: 'Project "{{projectName}}" Created Successfully',
    message: 'Your new project "{{projectName}}" has been created and is ready for annotation. You can start uploading datasets and configuring annotation workflows.',
    actionText: 'View Project',
    actionUrl: '/projects/{{projectId}}',
    variables: ['projectName', 'projectId', 'createdBy', 'teamSize'],
    isActive: true,
    isSystem: true,
    channels: ['inApp', 'email'],
    createdBy: 'system',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-2',
    name: 'Team Member Added',
    description: 'Notification sent when a new team member is added to a project',
    category: 'collaboration',
    type: 'info',
    priority: 'low',
    title: 'New Team Member Added',
    message: '{{memberName}} has been added to your project "{{projectName}}" as {{role}}.',
    actionText: 'View Team',
    actionUrl: '/projects/{{projectId}}/team',
    variables: ['memberName', 'memberEmail', 'role', 'projectName', 'projectId'],
    isActive: true,
    isSystem: true,
    channels: ['inApp', 'email'],
    createdBy: 'system',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-3',
    name: 'Annotation Review Required',
    description: 'Notification sent when annotations need quality review',
    category: 'annotation',
    type: 'warning',
    priority: 'high',
    title: 'Annotation Quality Review Required',
    message: '{{pendingCount}} annotations in project "{{projectName}}" require quality review before export.',
    actionText: 'Review Annotations',
    actionUrl: '/projects/{{projectId}}/review',
    variables: ['pendingCount', 'projectName', 'projectId', 'reviewer'],
    isActive: true,
    isSystem: true,
    channels: ['inApp', 'email'],
    createdBy: 'system',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-4',
    name: 'Payment Method Expired',
    description: 'Notification sent when payment method expires',
    category: 'billing',
    type: 'error',
    priority: 'urgent',
    title: 'Payment Method Expired',
    message: 'Your credit card ending in {{lastFour}} has expired. Please update your payment method to continue using AnnotateAI.',
    actionText: 'Update Payment',
    actionUrl: '/settings/billing',
    variables: ['lastFour', 'expiryDate', 'cardBrand'],
    isActive: true,
    isSystem: true,
    channels: ['inApp', 'email', 'push'],
    createdBy: 'system',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-5',
    name: 'Scheduled Maintenance',
    description: 'Notification sent for scheduled system maintenance',
    category: 'system',
    type: 'system',
    priority: 'medium',
    title: 'Scheduled Maintenance',
    message: 'AnnotateAI will undergo scheduled maintenance on {{maintenanceDate}} from {{startTime}} to {{endTime}} UTC. Some features may be temporarily unavailable.',
    variables: ['maintenanceDate', 'startTime', 'endTime', 'affectedServices'],
    isActive: true,
    isSystem: true,
    channels: ['inApp', 'email'],
    createdBy: 'system',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-6',
    name: 'Custom Project Milestone',
    description: 'Custom template for project milestone notifications',
    category: 'project',
    type: 'success',
    priority: 'medium',
    title: 'Project Milestone: {{milestoneName}}',
    message: 'Congratulations! Your project "{{projectName}}" has reached the {{milestoneName}} milestone. {{description}}',
    actionText: 'View Progress',
    actionUrl: '/projects/{{projectId}}/analytics',
    variables: ['milestoneName', 'projectName', 'projectId', 'description', 'progress'],
    isActive: true,
    isSystem: false,
    channels: ['inApp'],
    createdBy: 'user-1',
    createdAt: new Date('2024-12-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET /api/notifications/templates - Get notification templates with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');
    const isSystem = searchParams.get('isSystem');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Filter templates
    let filteredTemplates = [...templates];

    if (category) {
      filteredTemplates = filteredTemplates.filter(template => template.category === category);
    }

    if (type) {
      filteredTemplates = filteredTemplates.filter(template => template.type === type);
    }

    if (isActive !== null) {
      const activeFilter = isActive === 'true';
      filteredTemplates = filteredTemplates.filter(template => template.isActive === activeFilter);
    }

    if (isSystem !== null) {
      const systemFilter = isSystem === 'true';
      filteredTemplates = filteredTemplates.filter(template => template.isSystem === systemFilter);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.title.toLowerCase().includes(searchLower) ||
        template.message.toLowerCase().includes(searchLower)
      );
    }

    // Sort by name
    filteredTemplates.sort((a, b) => a.name.localeCompare(b.name));

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

    // Calculate statistics
    const stats = {
      total: filteredTemplates.length,
      active: filteredTemplates.filter(t => t.isActive).length,
      system: filteredTemplates.filter(t => t.isSystem).length,
      custom: filteredTemplates.filter(t => !t.isSystem).length,
      byCategory: {
        project: filteredTemplates.filter(t => t.category === 'project').length,
        annotation: filteredTemplates.filter(t => t.category === 'annotation').length,
        billing: filteredTemplates.filter(t => t.category === 'billing').length,
        system: filteredTemplates.filter(t => t.category === 'system').length,
        collaboration: filteredTemplates.filter(t => t.category === 'collaboration').length,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        templates: paginatedTemplates,
        pagination: {
          page,
          limit,
          total: filteredTemplates.length,
          totalPages: Math.ceil(filteredTemplates.length / limit),
          hasNext: endIndex < filteredTemplates.length,
          hasPrev: page > 1,
        },
        stats,
      },
    });

  } catch (error) {
    console.error('Error fetching notification templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notification templates' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/templates - Create new notification template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, description, category, type, priority, title, message } = body;
    
    if (!name || !description || !category || !type || !priority || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, description, category, type, priority, title, message' },
        { status: 400 }
      );
    }

    // Validate enum values
    const validCategories = ['project', 'annotation', 'billing', 'system', 'collaboration'];
    const validTypes = ['info', 'success', 'warning', 'error', 'system'];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    const validChannels = ['inApp', 'email', 'push'];

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { success: false, error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate channels if provided
    const channels = body.channels || ['inApp'];
    const invalidChannels = channels.filter((channel: string) => !validChannels.includes(channel));
    if (invalidChannels.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid channels: ${invalidChannels.join(', ')}. Must be one of: ${validChannels.join(', ')}` },
        { status: 400 }
      );
    }

    // Check for duplicate names
    const existingTemplate = templates.find(template => template.name.toLowerCase() === name.toLowerCase());
    if (existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template with this name already exists' },
        { status: 409 }
      );
    }

    // Extract variables from title and message
    const variableRegex = /\{\{(\w+)\}\}/g;
    const titleVariables = [...title.matchAll(variableRegex)].map(match => match[1]);
    const messageVariables = [...message.matchAll(variableRegex)].map(match => match[1]);
    const actionUrlVariables = body.actionUrl ? [...(body.actionUrl.matchAll(variableRegex))].map(match => match[1]) : [];
    
    const allVariables = [...new Set([...titleVariables, ...messageVariables, ...actionUrlVariables])];

    // Create new template
    const newTemplate: NotificationTemplate = {
      id: `template-${Date.now()}`,
      name,
      description,
      category,
      type,
      priority,
      title,
      message,
      actionText: body.actionText,
      actionUrl: body.actionUrl,
      variables: allVariables,
      isActive: body.isActive !== undefined ? body.isActive : true,
      isSystem: false, // Custom templates are never system templates
      channels,
      createdBy: 'user-1', // TODO: Replace with actual user ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to templates array
    templates.push(newTemplate);

    return NextResponse.json({
      success: true,
      data: { template: newTemplate },
      message: 'Notification template created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating notification template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification template' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/templates - Update notification template
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const templateIndex = templates.findIndex(template => template.id === id);
    if (templateIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    const existingTemplate = templates[templateIndex];

    // Check if template is system template and user is trying to modify restricted fields
    if (existingTemplate.isSystem) {
      const restrictedFields = ['name', 'category', 'type', 'isSystem'];
      const hasRestrictedChanges = restrictedFields.some(field => 
        body[field] !== undefined && body[field] !== existingTemplate[field as keyof NotificationTemplate]
      );

      if (hasRestrictedChanges) {
        return NextResponse.json(
          { success: false, error: 'System templates cannot modify name, category, type, or isSystem fields' },
          { status: 403 }
        );
      }
    }

    // Validate enum values if provided
    if (body.category) {
      const validCategories = ['project', 'annotation', 'billing', 'system', 'collaboration'];
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { success: false, error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }
    }

    if (body.type) {
      const validTypes = ['info', 'success', 'warning', 'error', 'system'];
      if (!validTypes.includes(body.type)) {
        return NextResponse.json(
          { success: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    if (body.priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { success: false, error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Check for duplicate names (excluding current template)
    if (body.name && body.name !== existingTemplate.name) {
      const duplicateTemplate = templates.find(template => 
        template.id !== id && template.name.toLowerCase() === body.name.toLowerCase()
      );
      if (duplicateTemplate) {
        return NextResponse.json(
          { success: false, error: 'Template with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Update variables if title, message, or actionUrl changed
    let variables = existingTemplate.variables;
    if (body.title || body.message || body.actionUrl) {
      const title = body.title || existingTemplate.title;
      const message = body.message || existingTemplate.message;
      const actionUrl = body.actionUrl || existingTemplate.actionUrl;

      const variableRegex = /\{\{(\w+)\}\}/g;
      const titleVariables = [...title.matchAll(variableRegex)].map(match => match[1]);
      const messageVariables = [...message.matchAll(variableRegex)].map(match => match[1]);
      const actionUrlVariables = actionUrl ? [...(actionUrl.matchAll(variableRegex))].map(match => match[1]) : [];
      
      variables = [...new Set([...titleVariables, ...messageVariables, ...actionUrlVariables])];
    }

    // Update template
    const updatedTemplate = {
      ...existingTemplate,
      ...body,
      id, // Ensure ID cannot be changed
      variables,
      isSystem: existingTemplate.isSystem, // Ensure isSystem cannot be changed for existing templates
      updatedAt: new Date().toISOString(),
    };

    templates[templateIndex] = updatedTemplate;

    return NextResponse.json({
      success: true,
      data: { template: updatedTemplate },
      message: 'Notification template updated successfully',
    });

  } catch (error) {
    console.error('Error updating notification template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification template' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/templates - Delete notification template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const templateIndex = templates.findIndex(template => template.id === id);
    if (templateIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    const template = templates[templateIndex];

    // Check if template is system template
    if (template.isSystem) {
      return NextResponse.json(
        { success: false, error: 'System templates cannot be deleted' },
        { status: 403 }
      );
    }

    // Remove template
    templates.splice(templateIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Notification template deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting notification template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification template' },
      { status: 500 }
    );
  }
} 