import { describe, expect, it } from 'vitest';

describe('validation-types', () => {
  it('should export types and interfaces', async () => {
    const mod = await import('./validation-types.js');
    expect(mod).toBeDefined();
  });
});
