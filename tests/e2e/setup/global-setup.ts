import { chromium, type FullConfig } from '@playwright/test';
import { testDataFactories } from '@pranakaia/testkit';

const WEB_BASE = process.env.WEB_BASE_URL ?? 'http://localhost:3000';
const ADMIN_BASE = process.env.ADMIN_BASE_URL ?? 'http://localhost:3001';

async function globalSetup(_config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(`${WEB_BASE}/api/health`, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.goto(`${ADMIN_BASE}/api/health`, { waitUntil: 'networkidle', timeout: 30_000 });
  } finally {
    await browser.close();
  }

  await seedTestData();
}

async function seedTestData() {
  const user = testDataFactories.user();
  const product1 = testDataFactories.product();
  const product2 = testDataFactories.product();

  const adminToken = process.env.ADMIN_SEED_TOKEN ?? 'test-admin-token';

  const endpoints = [
    { url: `${WEB_BASE}/api/auth/register`, data: user },
    { url: `${ADMIN_BASE}/api/products`, data: product1, token: adminToken },
    { url: `${ADMIN_BASE}/api/products`, data: product2, token: adminToken },
  ];

  for (const ep of endpoints) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (ep.token) {
        headers['Authorization'] = `Bearer ${ep.token}`;
      }
      await fetch(ep.url, { method: 'POST', headers, body: JSON.stringify(ep.data) });
    } catch {}
  }
}

export default globalSetup;
