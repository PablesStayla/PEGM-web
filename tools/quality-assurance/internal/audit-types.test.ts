import { describe, expect, it } from 'vitest';

describe('audit-types', () => {
  it('should export types and interfaces', async () => {
    const mod = await import('./audit-types.js');
    expect(mod).toBeDefined();
  });
});
