import crypto from 'crypto';

// Token store in memory with expiration
interface Session {
  token: string;
  userId: string;
  createdAt: number;
}

const activeSessions: Map<string, Session> = new Map();

export const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(`focusflow_salt_${password}`).digest('hex');
};

export const generateSessionToken = (userId: string): string => {
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, {
    token,
    userId,
    createdAt: Date.now()
  });
  return token;
};

export const getUserIdFromToken = (token: string): string | null => {
  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;
  // Expire session after 30 days
  if (Date.now() - session.createdAt > 30 * 24 * 3600 * 1000) {
    activeSessions.delete(token);
    return null;
  }
  return session.userId;
};

export const invalidateSessionToken = (token: string): void => {
  activeSessions.delete(token);
};
