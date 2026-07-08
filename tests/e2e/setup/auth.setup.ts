import { type BrowserContext, test as base, expect } from '@playwright/test';

const WEB_BASE = process.env.WEB_BASE_URL ?? 'http://localhost:3000';

export async function bypassAgeGate(context: BrowserContext, baseUrl = WEB_BASE) {
  await context.addCookies([{ name: 'pk_age_ok', value: 'true', url: baseUrl, sameSite: 'Lax' }]);
}

export async function authenticateUser(
  page: import('@playwright/test').Page,
  email = 'test@example.com',
  password = 'Test@12345!',
) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: /identificarse|sign in|login/i }).click();
  await expect(page).toHaveURL(/\/(dashboard|account|products)/, { timeout: 15_000 });
}

export async function authenticateAdmin(
  page: import('@playwright/test').Page,
  email = 'admin@pranakaia.com',
  password = 'Admin@12345!',
) {
  const ADMIN_BASE = process.env.ADMIN_BASE_URL ?? 'http://localhost:3001';
  await bypassAgeGate(page.context(), ADMIN_BASE);
  await page.goto(`${ADMIN_BASE}/login?email=${encodeURIComponent(email)}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: /identificarse|sign in/i }).click();
  await expect(page).toHaveURL(/\/(dashboard|orders|products)/, { timeout: 15_000 });
}

export const test = base.extend<{ authenticatedPage: import('@playwright/test').Page }>({
  authenticatedPage: async ({ page, context }, use) => {
    await bypassAgeGate(context);
    await authenticateUser(page);
    await use(page);
  },
});

export { expect };
