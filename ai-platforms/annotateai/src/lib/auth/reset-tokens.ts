// Reset token utility functions
export interface ResetToken {
  token: string;
  userId: string;
  email: string;
  expiresAt: Date;
  createdAt: Date;
  used: boolean;
}

// Mock reset token storage (replace with Redis or database)
export let resetTokens: ResetToken[] = [];

// Helper function to clean up expired tokens
export function cleanupExpiredTokens() {
  const now = new Date();
  resetTokens = resetTokens.filter(token => token.expiresAt > now);
}

// Get reset token by token string
export function getResetToken(token: string): ResetToken | undefined {
  return resetTokens.find(t => t.token === token && !t.used && t.expiresAt > new Date());
}

// Mark token as used
export function markTokenAsUsed(token: string): boolean {
  const resetToken = resetTokens.find(t => t.token === token);
  if (resetToken) {
    resetToken.used = true;
    return true;
  }
  return false;
}

// Add new reset token
export function addResetToken(tokenData: ResetToken): void {
  resetTokens.push(tokenData);
}

// Get existing valid token for user
export function getExistingValidToken(userId: string): ResetToken | undefined {
  return resetTokens.find(
    token => token.userId === userId && 
             !token.used && 
             token.expiresAt > new Date()
  );
}

// Count recent tokens for rate limiting
export function countRecentTokensForEmail(email: string): number {
  return resetTokens.filter(
    token => token.email === email && 
             token.createdAt > new Date(Date.now() - 60 * 60 * 1000) // Last hour
  ).length;
} 