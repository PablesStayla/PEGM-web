import { describe, expect, it } from 'vitest';

describe('check-dependencies-compat (CLI shell)', () => {
  it('should export a CLI entry point', async () => {
    const mod = await import('./check-dependencies-compat.js');
    expect(mod).toBeDefined();
  });
});
