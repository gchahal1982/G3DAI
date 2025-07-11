// Shared authentication types for G3DAI platforms

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer'
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  allowInvites: boolean;
  requireApproval: boolean;
  defaultRole: UserRole;
  ssoEnabled: boolean;
  auditLogging: boolean;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}