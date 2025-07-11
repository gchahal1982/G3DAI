import { User, Organization, Session } from '@/types/auth';

// Mock database - in production, this would be replaced with actual database queries
class MockDatabase {
  private users: User[] = [];
  private organizations: Organization[] = [];
  private sessions: Session[] = [];

  // User operations
  async findUserById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.push(user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date()
    };

    return this.users[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }

  // Organization operations
  async findOrganizationById(id: string): Promise<Organization | null> {
    return this.organizations.find(org => org.id === id) || null;
  }

  async findOrganizationByDomain(domain: string): Promise<Organization | null> {
    return this.organizations.find(org => org.domain === domain) || null;
  }

  async createOrganization(orgData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    const organization: Organization = {
      ...orgData,
      id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.organizations.push(organization);
    return organization;
  }

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | null> {
    const orgIndex = this.organizations.findIndex(org => org.id === id);
    if (orgIndex === -1) return null;

    this.organizations[orgIndex] = {
      ...this.organizations[orgIndex],
      ...updates,
      updatedAt: new Date()
    };

    return this.organizations[orgIndex];
  }

  // Session operations
  async createSession(sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> {
    const session: Session = {
      ...sessionData,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.sessions.push(session);
    return session;
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    return this.sessions.find(session => session.token === token) || null;
  }

  async findSessionsByUserId(userId: string): Promise<Session[]> {
    return this.sessions.filter(session => session.userId === userId);
  }

  async deleteSession(id: string): Promise<boolean> {
    const sessionIndex = this.sessions.findIndex(session => session.id === id);
    if (sessionIndex === -1) return false;

    this.sessions.splice(sessionIndex, 1);
    return true;
  }

  async deleteExpiredSessions(): Promise<number> {
    const now = new Date();
    const initialCount = this.sessions.length;
    
    this.sessions = this.sessions.filter(session => session.expiresAt > now);
    
    return initialCount - this.sessions.length;
  }

  // Project operations (basic structure for annotateai)
  async getUserProjects(userId: string): Promise<any[]> {
    // Mock implementation - would integrate with actual project schema
    return [];
  }

  async createProject(projectData: any): Promise<any> {
    // Mock implementation - would integrate with actual project schema
    return {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Annotation operations (basic structure for annotateai)
  async getProjectAnnotations(projectId: string): Promise<any[]> {
    // Mock implementation - would integrate with actual annotation schema
    return [];
  }

  async createAnnotation(annotationData: any): Promise<any> {
    // Mock implementation - would integrate with actual annotation schema
    return {
      id: `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...annotationData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // AI Model operations
  async getAIModelById(id: string): Promise<any | null> {
    // Mock implementation - would integrate with actual AI model schema
    return {
      id,
      name: 'Mock AI Model',
      projectId: 'project_123',
      status: 'ready',
      modelType: 'classification',
      accuracy: 0.85,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async getAllModels(): Promise<any[]> {
    // Mock implementation - would return all AI models
    return [
      {
        id: 'model_1',
        name: 'Classification Model',
        projectId: 'project_123',
        status: 'ready',
        modelType: 'classification',
        accuracy: 0.85,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async getProjectModels(projectId: string): Promise<any[]> {
    // Mock implementation - would return models for a specific project
    return [
      {
        id: 'model_1',
        name: 'Project Model',
        projectId,
        status: 'ready',
        modelType: 'classification',
        accuracy: 0.85,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async createAIModel(modelData: any): Promise<any> {
    // Mock implementation - would create a new AI model
    return {
      id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...modelData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateAIModel(id: string, updates: any): Promise<any | null> {
    // Mock implementation - would update an AI model
    return {
      id,
      ...updates,
      updatedAt: new Date()
    };
  }

  // Project access control
  async checkUserProjectAccess(userId: string, projectId: string): Promise<boolean> {
    // Mock implementation - would check if user has access to project
    return true; // Allow access for all users in mock
  }

  async getProject(projectId: string): Promise<any | null> {
    // Mock implementation - would return project details
    return {
      id: projectId,
      name: 'Mock Project',
      description: 'A mock project for testing',
      ownerId: 'user_123',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // User operations (additional methods)
  async getUserById(id: string): Promise<User | null> {
    return this.findUserById(id);
  }

  // File operations
  async createDataFile(fileData: any): Promise<any> {
    // Mock implementation - would create a data file record
    return {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...fileData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async createUploadRecord(uploadData: any): Promise<any> {
    // Mock implementation - would create an upload record
    return {
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...uploadData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

// Export singleton instance
export const db = new MockDatabase();

// Helper functions for common queries
export const userQueries = {
  findById: (id: string) => db.findUserById(id),
  findByEmail: (email: string) => db.findUserByEmail(email),
  create: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => db.createUser(userData),
  update: (id: string, updates: Partial<User>) => db.updateUser(id, updates),
  delete: (id: string) => db.deleteUser(id)
};

export const organizationQueries = {
  findById: (id: string) => db.findOrganizationById(id),
  findByDomain: (domain: string) => db.findOrganizationByDomain(domain),
  create: (orgData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => db.createOrganization(orgData),
  update: (id: string, updates: Partial<Organization>) => db.updateOrganization(id, updates)
};

export const sessionQueries = {
  create: (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => db.createSession(sessionData),
  findByToken: (token: string) => db.findSessionByToken(token),
  findByUserId: (userId: string) => db.findSessionsByUserId(userId),
  delete: (id: string) => db.deleteSession(id),
  deleteExpired: () => db.deleteExpiredSessions()
}; 