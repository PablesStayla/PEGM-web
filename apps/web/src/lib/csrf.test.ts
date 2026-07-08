import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Unit tests for CSRF token generation and verification.
 */

const mockCookies = new Map<string, string>();
const mockHeadersMap = new Map<string, string>();

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockImplementation(async () => ({
    get: (key: string) => (mockCookies.has(key) ? { value: mockCookies.get(key)! } : undefined),
    set: (key: string, value: string) => mockCookies.set(key, value),
    has: (key: string) => mockCookies.has(key),
  })),
  headers: vi.fn().mockImplementation(async () => ({
    get: (key: string) => mockHeadersMap.get(key.toLowerCase()) ?? null,
  })),
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

describe('CSRF utilities', () => {
  beforeEach(() => {
    process.env['CSRF_SECRET'] = 'a'.repeat(64); // 64-char test secret
    mockCookies.clear();
    mockHeadersMap.clear();
    vi.resetModules();
  });

  afterEach(() => {
    process.env['CSRF_SECRET'] = undefined;
  });

  describe('generateCsrfToken()', () => {
    it('returns a non-empty hex string', async () => {
      const { generateCsrfToken } = await import('./security/csrf');
      const token = await generateCsrfToken();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });

    it('stores a signed cookie', async () => {
      const { generateCsrfToken } = await import('./security/csrf');
      await generateCsrfToken();
      expect(mockCookies.has('pk_csrf_token')).toBe(true);
      const cookie = mockCookies.get('pk_csrf_token')!;
      // Cookie value should be base64.hexSignature
      expect(cookie).toContain('.');
    });

    it('generates different tokens on each call', async () => {
      const { generateCsrfToken } = await import('./security/csrf');
      const a = await generateCsrfToken();
      const b = await generateCsrfToken();
      expect(a).not.toBe(b);
    });
  });

  describe('verifyCsrfToken()', () => {
    it('returns true for a valid token', async () => {
      const { generateCsrfToken, verifyCsrfToken } = await import('./security/csrf');
      const token = await generateCsrfToken();
      expect(await verifyCsrfToken(token)).toBe(true);
    });

    it('returns false for a tampered token', async () => {
      const { generateCsrfToken, verifyCsrfToken } = await import('./security/csrf');
      await generateCsrfToken();
      expect(await verifyCsrfToken('tampered-value')).toBe(false);
    });

    it('returns false when no cookie is present', async () => {
      const { verifyCsrfToken } = await import('./security/csrf');
      expect(await verifyCsrfToken('any-token')).toBe(false);
    });

    it('returns false for a token with a tampered cookie signature', async () => {
      const { generateCsrfToken, verifyCsrfToken } = await import('./security/csrf');
      const token = await generateCsrfToken();
      // Corrupt the signature in the cookie
      const original = mockCookies.get('pk_csrf_token')!;
      const parts = original.split('.');
      parts[1] = 'deadbeef'.repeat(8); // replace signature
      mockCookies.set('pk_csrf_token', parts.join('.'));
      expect(await verifyCsrfToken(token)).toBe(false);
    });
  });

  describe('getCsrfSecret() â€” no default fallback', () => {
    it('throws when CSRF_SECRET is missing', async () => {
      process.env['CSRF_SECRET'] = undefined;
      vi.resetModules();
      const { generateCsrfToken, _resetCsrfSecretCache } = await import('./security/csrf');
      _resetCsrfSecretCache();
      await expect(generateCsrfToken()).rejects.toThrow('CSRF_SECRET');
    });

    it('throws when CSRF_SECRET is too short', async () => {
      process.env['CSRF_SECRET'] = 'short';
      vi.resetModules();
      const { generateCsrfToken, _resetCsrfSecretCache } = await import('./security/csrf');
      _resetCsrfSecretCache();
      await expect(generateCsrfToken()).rejects.toThrow('32 characters');
    });
  });
});
