import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * Unit tests for the env module.
 * We reset the module cache between tests to test different env configurations.
 */

const BASE_ENV: Record<string, string> = {
  NODE_ENV: 'test',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
};

describe('env module', () => {
  beforeEach(() => {
    // Set safe defaults
    for (const [k, v] of Object.entries(BASE_ENV)) {
      vi.stubEnv(k, v);
    }
  });

  afterEach(() => {
    // Reset module between tests so the lazy singleton is re-created
    vi.resetModules();
    for (const _k of Object.keys(BASE_ENV)) {
      vi.unstubAllEnvs();
    }
  });

  it('returns validated env values via Proxy', async () => {
    const { env } = await import('./env');
    expect(env.NODE_ENV).toBe('test');
    expect(env.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3000');
  });

  it('isProd() returns false in test environment', async () => {
    const { isProd } = await import('./env');
    expect(isProd()).toBe(false);
  });

  it('isDev() returns false in test environment', async () => {
    const { isDev } = await import('./env');
    expect(isDev()).toBe(false);
  });

  it('isTest() returns true in test environment', async () => {
    const { isTest } = await import('./env');
    expect(isTest()).toBe(true);
  });

  it('ENABLE_ADMIN_PANEL defaults to false (boolean)', async () => {
    const { env } = await import('./env');
    expect(env.ENABLE_ADMIN_PANEL).toBe(false);
  });

  it('ENABLE_ANALYTICS defaults to true (boolean)', async () => {
    const { env } = await import('./env');
    expect(env.ENABLE_ANALYTICS).toBe(true);
  });

  it('ENABLE_ADMIN_PANEL transforms to boolean true when set to "true"', async () => {
    vi.stubEnv('ENABLE_ADMIN_PANEL', 'true');
    const { env, resetEnvCache } = await import('./env');
    resetEnvCache();
    expect(env.ENABLE_ADMIN_PANEL).toBe(true);
  });

  it('resetEnvCache() forces re-evaluation on next access', async () => {
    const { env, resetEnvCache } = await import('./env');
    const first = env.NODE_ENV;

    vi.stubEnv('NODE_ENV', 'development');
    resetEnvCache();

    const { env: env2 } = await import('./env');
    expect(env2.NODE_ENV).toBe('development');
    // Restore
    vi.stubEnv('NODE_ENV', 'test');
    resetEnvCache();
    expect(first).toBe('test');
  });
});

import { vi } from 'vitest';
