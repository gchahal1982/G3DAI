import jwt from 'jsonwebtoken';
import { JWTPayload, RefreshTokenPayload, User } from '@/types/auth';

// JWT Configuration
export const JWT_CONFIG = {
  accessTokenSecret: process.env.JWT_SECRET || 'your-access-token-secret',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret',
  accessTokenExpiresIn: '15m' as const,
  refreshTokenExpiresIn: '7d' as const,
  issuer: 'annotateai',
  audience: 'annotateai-users'
};

// Generate access token
export const generateAccessToken = (user: User): string => {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organization?.id
  };

  return jwt.sign(payload, JWT_CONFIG.accessTokenSecret, {
    expiresIn: JWT_CONFIG.accessTokenExpiresIn
  });
};

// Generate refresh token
export const generateRefreshToken = (userId: string, sessionId: string): string => {
  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    userId,
    sessionId
  };

  return jwt.sign(payload, JWT_CONFIG.refreshTokenSecret, {
    expiresIn: JWT_CONFIG.refreshTokenExpiresIn
  });
};

// Verify access token
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.accessTokenSecret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.refreshTokenSecret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    }) as RefreshTokenPayload;
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Extract token from request headers
export const extractTokenFromHeader = (authHeader: string | undefined): string => {
  if (!authHeader) {
    throw new Error('No authorization header provided');
  }

  const [bearer, token] = authHeader.split(' ');
  
  if (bearer !== 'Bearer' || !token) {
    throw new Error('Invalid authorization header format');
  }

  return token;
};

// Verify token middleware helper
export const verifyToken = async (authHeader: string | undefined): Promise<JWTPayload> => {
  const token = extractTokenFromHeader(authHeader);
  return verifyAccessToken(token);
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) return true;
    
    return decoded.exp < Math.floor(Date.now() / 1000);
  } catch (error) {
    return true;
  }
};

// Get token expiration time
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
}; 