import { describe, expect, it } from 'vitest';
import { loadEnvFile, mergeEnv, parseEnvContent } from './parse-env-file.js';

describe('parse-env-file', () => {
  describe('parseEnvContent', () => {
    it('should parse valid .env content', () => {
      const result = parseEnvContent('DATABASE_URL=postgres://localhost\nNODE_ENV=development');
      expect(result.DATABASE_URL).toBe('postgres://localhost');
      expect(result.NODE_ENV).toBe('development');
    });
    it('should ignore comments', () => {
      const result = parseEnvContent('# comment\nKEY=value');
      expect(result.KEY).toBe('value');
      expect(Object.keys(result)).toHaveLength(1);
    });
    it('should ignore blank lines', () => {
      const result = parseEnvContent('\n\nKEY=value\n\n');
      expect(Object.keys(result)).toHaveLength(1);
    });
    it('should strip quotes from values', () => {
      const result = parseEnvContent('KEY="quoted value"');
      expect(result.KEY).toBe('quoted value');
    });
  });

  describe('mergeEnv', () => {
    it('should merge multiple sources', () => {
      const result = mergeEnv({ A: '1' }, { B: '2' });
      expect(result.A).toBe('1');
      expect(result.B).toBe('2');
    });
    it('should prefer later sources', () => {
      const result = mergeEnv({ A: 'old' }, { A: 'new' });
      expect(result.A).toBe('new');
    });
    it('should skip undefined values', () => {
      const result = mergeEnv({ A: undefined }, { B: '2' });
      expect(result.A).toBeUndefined();
      expect(result.B).toBe('2');
    });
  });

  describe('loadEnvFile', () => {
    it('should return error for missing file', async () => {
      const result = await loadEnvFile('/nonexistent/.env');
      expect(result.success).toBe(false);
    });
  });
});
