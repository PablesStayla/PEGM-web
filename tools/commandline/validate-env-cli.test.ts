import { describe, expect, it } from 'vitest';

describe('validate-env', () => {
  describe('parseEnvContent', () => {
    it('should parse valid .env content', async () => {
      const { parseEnvContent } = await import('./validate-env.js');
      const content =
        'DATABASE_URL=postgresql://localhost:5432/db\nSUPABASE_URL=https://abc.supabase.co\nSTRIPE_SECRET_KEY=sk_test_123';

      const result = parseEnvContent(content);

      expect(result.DATABASE_URL).toBe('postgresql://localhost:5432/db');
      expect(result.SUPABASE_URL).toBe('https://abc.supabase.co');
      expect(result.STRIPE_SECRET_KEY).toBe('sk_test_123');
    });

    it('should skip comments', async () => {
      const { parseEnvContent } = await import('./validate-env.js');
      const content = '# Comment\nDATABASE_URL=postgresql://localhost:5432/db\n# Another comment';

      const result = parseEnvContent(content);

      expect(result.DATABASE_URL).toBe('postgresql://localhost:5432/db');
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should handle empty content', async () => {
      const { parseEnvContent } = await import('./validate-env.js');
      const result = parseEnvContent('');
      expect(result).toEqual({});
    });

    it('should handle malformed lines', async () => {
      const { parseEnvContent } = await import('./validate-env.js');
      const content =
        'DATABASE_URL=postgresql://localhost:5432/db\nMALFORMED_LINE\nSTRIPE_SECRET_KEY=sk_test_123';

      const result = parseEnvContent(content);

      expect(result.DATABASE_URL).toBe('postgresql://localhost:5432/db');
      expect(result.STRIPE_SECRET_KEY).toBe('sk_test_123');
      expect(Object.keys(result)).toHaveLength(2);
    });
  });

  describe('validateEnvVar', () => {
    it('should validate required variable that is present', async () => {
      const { validateEnvVar } = await import('./validate-env.js');
      const def = {
        name: 'DATABASE_URL',
        required: true,
        schema: { parse: (v: string) => v } as any,
        description: 'Database URL',
      };
      const env = { DATABASE_URL: 'postgresql://localhost' };

      const result = validateEnvVar(def, env);

      expect(result.valid).toBe(true);
    });

    it('should fail when required variable is missing', async () => {
      const { validateEnvVar } = await import('./validate-env.js');
      const def = {
        name: 'DATABASE_URL',
        required: true,
        schema: { parse: () => {} } as any,
        description: 'Database URL',
      };
      const env = {};

      const result = validateEnvVar(def, env);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('missing');
    });

    it('should pass when optional variable is missing', async () => {
      const { validateEnvVar } = await import('./validate-env.js');
      const def = {
        name: 'REDIS_URL',
        required: false,
        schema: { parse: () => {} } as any,
        description: 'Redis URL',
      };
      const env = {};

      const result = validateEnvVar(def, env);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateAll', () => {
    it('should detect missing required variables', async () => {
      const { validateAll } = await import('./validate-env.js');
      const env = {};

      const result = validateAll(env, 'local');

      expect(result.failed).toBeGreaterThan(0);
    });
  });
});
