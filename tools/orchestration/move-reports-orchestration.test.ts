import { describe, expect, it } from 'vitest';

describe('move-reports-orchestration (CLI shell)', () => {
  it('should export a CLI entry point', async () => {
    const mod = await import('./move-reports-orchestration.js');
    expect(mod).toBeDefined();
  });
});
