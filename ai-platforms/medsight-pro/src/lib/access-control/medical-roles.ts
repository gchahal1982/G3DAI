export const medicalRoles = [
  {
    name: 'System Administrator',
    description: 'Full access to all system features and settings.',
    userCount: 5,
    permissionCount: 147,
    permissions: ['*']
  },
  {
    name: 'Clinical Administrator',
    description: 'Manages clinical workflows, user access, and reporting.',
    userCount: 12,
    permissionCount: 89,
    permissions: [
      'user:manage:*', 
      'reporting:*:*', 
      'collaboration:*:*',
      'patient:data:read',
      'imaging:study:read',
    ]
  },
  {
    name: 'Radiologist',
    description: 'Specializes in interpreting medical images.',
    userCount: 45,
    permissionCount: 25,
    permissions: [
      'patient:data:read',
      'imaging:study:*',
      'imaging:annotation:*',
      'ai:analysis:run',
      'ai:analysis:read',
      'reporting:generate',
      'reporting:read',
      'collaboration:session:create',
      'collaboration:chat:send',
      'collaboration:review:*'
    ]
  },
  {
    name: 'Cardiologist',
    description: 'Specializes in heart-related conditions and imaging.',
    userCount: 32,
    permissionCount: 22,
    permissions: [
      'patient:data:read',
      'imaging:study:read',
      'imaging:annotation:create',
      'ai:analysis:run',
      'ai:analysis:read',
      'reporting:generate',
      'reporting:read',
      'collaboration:session:create',
      'collaboration:chat:send',
    ]
  },
  {
    name: 'Surgeon',
    description: 'Performs surgical procedures, uses imaging for planning.',
    userCount: 28,
    permissionCount: 18,
    permissions: [
      'patient:data:read',
      'imaging:study:read',
      'imaging:viewer:3d',
      'ai:analysis:read',
      'collaboration:session:create',
      'collaboration:chat:send',
    ]
  },
  {
    name: 'Attending Physician',
    description: 'Supervises residents and provides patient care.',
    userCount: 78,
    permissionCount: 15,
    permissions: [
      'patient:data:read',
      'imaging:study:read',
      'ai:analysis:read',
      'reporting:read',
      'collaboration:chat:send',
    ]
  },
  {
    name: 'Resident Physician',
    description: 'Physician in training, works under supervision.',
    userCount: 124,
    permissionCount: 10,
    permissions: [
      'patient:data:read',
      'imaging:study:read',
      'ai:analysis:read',
    ]
  },
  {
    name: 'Radiology Technician',
    description: 'Operates imaging equipment and uploads studies.',
    userCount: 67,
    permissionCount: 5,
    permissions: [
      'imaging:study:upload',
    ]
  },
  {
    name: 'Researcher',
    description: 'Access to anonymized data for research purposes.',
    userCount: 15,
    permissionCount: 8,
    permissions: [
      'patient:data:read:anonymized',
      'imaging:study:read:anonymized',
      'ai:analysis:read',
    ]
  },
  {
    name: 'Viewer',
    description: 'Read-only access to specific assigned cases.',
    userCount: 247,
    permissionCount: 2,
    permissions: [
      'patient:data:read:assigned',
      'imaging:study:read:assigned',
    ]
  }
]; 