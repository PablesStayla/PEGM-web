import type { FullConfig } from '@playwright/test';

const ADMIN_BASE = process.env.ADMIN_BASE_URL ?? 'http://localhost:3001';

async function globalTeardown(_config: FullConfig) {
  const adminToken = process.env.ADMIN_SEED_TOKEN ?? 'test-admin-token';
  const headers: Record<string, string> = {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  };

  const cleanupEndpoints = [`${ADMIN_BASE}/api/test/cleanup`, `${ADMIN_BASE}/api/test/reset`];

  for (const endpoint of cleanupEndpoints) {
    try {
      await fetch(endpoint, { method: 'POST', headers });
    } catch {}
  }
}

export default globalTeardown;
