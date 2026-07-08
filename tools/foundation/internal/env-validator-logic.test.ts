import { describe, expect, it } from 'vitest';

// Legacy re-export file — verify exports exist
describe('env-validator-logic', () => {
  it('should re-export from lib/', async () => {
    const mod = await import('./env-validator-logic.js');
    expect(mod).toBeDefined();
  });
});
