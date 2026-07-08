import { describe, expect, it } from 'vitest';

// If secret-types only re-exports, import from lib
describe('scan-secrets-patterns (shell + core)', () => {
  it('should have secret patterns defined', async () => {
    const mod = await import('../lib/secret-patterns-logic.js');
    expect(mod.SECRET_PATTERNS.length).toBeGreaterThan(0);
  });

  it('should have ignore patterns defined', async () => {
    const mod = await import('../lib/secret-patterns-logic.js');
    expect(mod.IGNORE_PATTERNS.length).toBeGreaterThan(0);
  });

  it('should ignore common non-secret files', async () => {
    const mod = await import('../lib/secret-patterns-logic.js');
    expect(mod.shouldIgnoreFile('package-lock.json')).toBe(true);
  });
});
