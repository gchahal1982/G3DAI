import jwt from 'jsonwebtoken';

// In production, you'd want to maintain a blacklist of tokens in Redis or database
const tokenBlacklist = new Set<string>();

// Utility function to check if a token is blacklisted
export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

// Add token to blacklist
export function addTokenToBlacklist(token: string): void {
  tokenBlacklist.add(token);
}

// Utility function to clean expired tokens from blacklist
// In production, this would be handled by Redis TTL
export function cleanExpiredTokens() {
  // This is a simple implementation
  // In production, you'd use Redis with automatic expiration
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  
  for (const token of tokenBlacklist) {
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // Token is expired or invalid, remove from blacklist
      tokenBlacklist.delete(token);
    }
  }
}

// Clean expired tokens periodically (in production, use a cron job)
if (typeof window === 'undefined') {
  setInterval(cleanExpiredTokens, 60 * 60 * 1000); // Every hour
} 