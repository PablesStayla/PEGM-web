/**
 * @file Auth Helper
 * @description Helper functions for authentication in tests
 */

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

/**
 * Generate a mock JWT token for testing
 */
export function generateMockToken(payload: JWTPayload): string {
  // Simple base64 token for testing (in real scenarios, use jsonwebtoken)
  const tokenData = JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  return Buffer.from(tokenData, 'utf-8').toString('base64');
}

/**
 * Generate auth token from user
 */
export function generateTokenFromUser(user: Partial<TestUser>): string {
  return generateMockToken({
    userId: user.id!,
    email: user.email!,
    role: user.role || 'user',
    tenantId: user.tenantId!,
  });
}

/**
 * Create auth headers for API requests
 */
export function createAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Create auth headers from user
 */
export function createAuthHeadersFromUser(user: Partial<TestUser>): Record<string, string> {
  const token = generateTokenFromUser(user);
  return createAuthHeaders(token);
}

/**
 * Create a Bearer token header
 */
export function createBearerToken(token: string): string {
  return `Bearer ${token}`;
}

/**
 * Validate JWT token format
 */
export function validateTokenFormat(token: string): boolean {
  try {
    const parts = token.split('.');
    return parts.length >= 2;
  } catch {
    return false;
  }
}

/**
 * Decode JWT token (without verification)
 */
export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2 || !parts[1]) {
      return null;
    }
    const decoded = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
