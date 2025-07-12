export const medicalPermissions = [
  // Patient Data Permissions
  { id: 'patient:data:read', category: 'Patient Data', description: 'View patient demographic data' },
  { id: 'patient:data:write', category: 'Patient Data', description: 'Edit patient demographic data' },
  { id: 'patient:data:delete', category: 'Patient Data', description: 'Delete patient records' },
  { id: 'patient:data:share', category: 'Patient Data', description: 'Share patient records' },

  // Medical Imaging Permissions
  { id: 'imaging:study:read', category: 'Medical Imaging', description: 'View medical imaging studies' },
  { id: 'imaging:study:upload', category: 'Medical Imaging', description: 'Upload new medical imaging studies' },
  { id: 'imaging:study:delete', category: 'Medical Imaging', description: 'Delete medical imaging studies' },
  { id: 'imaging:study:download', category: 'Medical Imaging', description: 'Download medical imaging studies' },
  { id: 'imaging:annotation:create', category: 'Medical Imaging', description: 'Create annotations on studies' },
  { id: 'imaging:annotation:edit', category: 'Medical Imaging', description: 'Edit annotations on studies' },
  { id: 'imaging:annotation:delete', category: 'Medical Imaging', description: 'Delete annotations on studies' },
  { id: 'imaging:viewer:3d', category: 'Medical Imaging', description: 'Access 3D rendering viewer' },
  
  // AI Analysis Permissions
  { id: 'ai:analysis:run', category: 'AI Analysis', description: 'Run AI analysis on studies' },
  { id: 'ai:analysis:read', category: 'AI Analysis', description: 'View AI analysis results' },
  { id: 'ai:model:manage', category: 'AI Analysis', description: 'Manage AI model versions' },
  { id: 'ai:model:train', category: 'AI Analysis', description: 'Train new AI models' },

  // Reporting Permissions
  { id: 'reporting:generate', category: 'Reporting', description: 'Generate medical reports' },
  { id: 'reporting:read', category: 'Reporting', description: 'View medical reports' },
  { id: 'reporting:share', category: 'Reporting', description: 'Share medical reports' },
  { id: 'reporting:template:manage', category: 'Reporting', description: 'Manage report templates' },

  // Collaboration Permissions
  { id: 'collaboration:session:create', category: 'Collaboration', description: 'Start a collaboration session' },
  { id: 'collaboration:chat:send', category: 'Collaboration', description: 'Send messages in chat' },
  { id: 'collaboration:review:request', category: 'Collaboration', description: 'Request a peer review' },
  { id: 'collaboration:review:perform', category: 'Collaboration', description: 'Perform a peer review' },

  // User Management Permissions
  { id: 'user:manage:create', category: 'User Management', description: 'Create new user accounts' },
  { id: 'user:manage:edit', category: 'User Management', description: 'Edit user accounts' },
  { id: 'user:manage:delete', category: 'User Management', description: 'Delete user accounts' },
  { id: 'user:role:assign', category: 'User Management', description: 'Assign roles to users' },

  // System Administration Permissions
  { id: 'system:admin:settings', category: 'System Administration', description: 'Access system settings' },
  { id: 'system:admin:audit', category: 'System Administration', description: 'View system audit logs' },
  { id: 'system:admin:billing', category: 'System Administration', description: 'Manage billing and subscriptions' },
  { id: 'system:admin:security', category: 'System Administration', description: 'Manage security settings' },
  
  // Emergency Access Permissions
  { id: 'emergency:access:override', category: 'Emergency Access', description: 'Override access restrictions in emergencies' },
];

export const permissionCategories = [
  'Patient Data',
  'Medical Imaging',
  'AI Analysis',
  'Reporting',
  'Collaboration',
  'User Management',
  'System Administration',
  'Emergency Access',
]; 