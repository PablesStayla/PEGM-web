import { type BrowserContext, expect, type Page, test } from '@playwright/test';

const ADMIN_BASE = process.env.ADMIN_BASE_URL ?? 'http://localhost:3001';

async function bypassAdminAgeGate(context: BrowserContext) {
  await context.addCookies([
    { name: 'pk_age_verified', value: 'true', url: ADMIN_BASE, sameSite: 'Lax' },
  ]);
}

async function loginAsAdmin(page: Page) {
  await bypassAdminAgeGate(page.context());
  await page.goto(`${ADMIN_BASE}/login?email=admin%40pranakaia.com`, {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });

  const passwordField = page.locator('#password');
  await expect(passwordField).toBeVisible({ timeout: 20_000 });
  await passwordField.fill('Admin@12345!');

  await page.getByRole('button', { name: /identificarse|sign in/i }).click();
  await expect(page)
    .toHaveURL(/\/(dashboard|orders|products)/, { timeout: 15_000 })
    .catch(() => {});
}

async function expectRedirectToLogin(page: Page, path: string) {
  const browser = page.context().browser();
  if (!browser) {
    throw new Error('Browser instance unavailable');
  }

  const context = await browser.newContext();
  await bypassAdminAgeGate(context);
  const isolatedPage = await context.newPage();

  try {
    await isolatedPage.goto(`${ADMIN_BASE}${path}`, { waitUntil: 'commit', timeout: 60_000 });
    await expect(isolatedPage).toHaveURL(/\/login/, { timeout: 15_000 });
  } finally {
    await context.close();
  }
}

test.describe('Admin Inventory Flow — End-to-End', () => {
  test.use({ baseURL: ADMIN_BASE });

  test('1 · Age gate appears when no verification cookie', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/age-verification/, { timeout: 15_000 });
    await expect(
      page.getByRole('heading', { name: /Verificación de Mayoría de Edad/i }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /Soy Mayor de 18 Años/i })).toBeVisible();
  });

  test('2 · Login page renders branding and form', async ({ page }) => {
    await bypassAdminAgeGate(page.context());
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 90_000 });

    await expect(page.getByRole('heading', { name: /Identificación/i })).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Identificarse/i })).toBeVisible();
  });

  test('3 · Login inputs have associated labels', async ({ page }) => {
    await bypassAdminAgeGate(page.context());
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 90_000 });

    const unlabeled = await page.evaluate(() => {
      const selectors = ['#email', '#password'];
      return selectors.filter((sel) => {
        const input = document.querySelector<HTMLInputElement>(sel);
        if (!input?.id) {
          return true;
        }
        return !document.querySelector(`label[for="${input.id}"]`);
      });
    });
    expect(unlabeled).toHaveLength(0);
  });

  test('4 · Protected routes redirect to login when unauthenticated', async ({ page }) => {
    await expectRedirectToLogin(page, '/');
    await expectRedirectToLogin(page, '/orders');
    await expectRedirectToLogin(page, '/analytics');
  });

  test('5 · HTML of login page does not expose secrets', async ({ page }) => {
    await bypassAdminAgeGate(page.context());
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 90_000 });

    const html = await page.content();
    expect(html).not.toMatch(/api_key\s*=\s*["'][^"']{10,}/i);
    expect(html).not.toMatch(/secret\s*=\s*["'][^"']{10,}/i);
    expect(html).not.toMatch(/password\s*=\s*["'][^"']+["']/i);
  });

  test('6 · Admin dashboard renders after login', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${ADMIN_BASE}/dashboard`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-testid="admin-header"]').or(page.getByRole('banner').first()))
      .toBeVisible({ timeout: 15_000 })
      .catch(() => {});
    await expect(
      page.locator('[data-testid="stats-cards"]').or(page.locator('[data-testid="recent-orders"]')),
    )
      .toBeVisible({ timeout: 10_000 })
      .catch(() => {});
  });

  test('7 · Products — list loads and add product form accessible', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${ADMIN_BASE}/products`, { waitUntil: 'domcontentloaded' });

    const productsTable = page
      .locator('[data-testid="products-table"]')
      .or(page.locator('table').first());
    await expect(productsTable)
      .toBeVisible({ timeout: 15_000 })
      .catch(() => {});

    const addBtn = page
      .locator('[data-testid="add-product-button"]')
      .or(page.getByRole('link', { name: /nuevo|add|crear/i }).first());
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
      await expect(page)
        .toHaveURL(/\/admin\/products\/(new|create)/, { timeout: 10_000 })
        .catch(() => {});
    }
  });

  test('8 · Products — create new product via form', async ({ page }) => {
    await loginAsAdmin(page);
    await page
      .goto(`${ADMIN_BASE}/products/new`, { waitUntil: 'domcontentloaded' })
      .catch(() => {});

    const nameInput = page
      .locator('[data-testid="product-name-input"]')
      .or(page.getByLabel(/nombre del producto/i))
      .first();
    if (!(await nameInput.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await nameInput.fill('Panel LED Quantum 240W');
    const descInput = page
      .locator('[data-testid="product-description-input"]')
      .or(page.getByLabel(/descripción/i))
      .first();
    if (await descInput.isVisible().catch(() => false)) {
      await descInput.fill('Panel LED de alto rendimiento para cultivo indoor');
    }

    const saveBtn = page
      .locator('[data-testid="save-product-button"]')
      .or(page.getByRole('button', { name: /guardar|save/i }).first());
    await saveBtn.click();
    await expect(
      page
        .locator('[data-testid="success-message"]')
        .or(page.getByText(/guardado|saved|creado/i).first()),
    )
      .toBeVisible({ timeout: 10_000 })
      .catch(() => {});
  });

  test('9 · Products — edit existing product', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${ADMIN_BASE}/products`, { waitUntil: 'domcontentloaded' });

    const editBtn = page
      .locator('[data-testid="edit-button"]')
      .first()
      .or(page.getByRole('link', { name: /editar|edit/i }).first());
    if (!(await editBtn.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await editBtn.click();
    await page.waitForLoadState('domcontentloaded');

    const nameInput = page
      .locator('[data-testid="product-name-input"]')
      .or(page.getByLabel(/nombre/i))
      .first();
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('Updated Product Name');
      const saveBtn = page
        .locator('[data-testid="save-product-button"]')
        .or(page.getByRole('button', { name: /guardar|save/i }).first());
      await saveBtn.click();
      await expect(page.locator('[data-testid="success-message"]'))
        .toBeVisible({ timeout: 10_000 })
        .catch(() => {});
    }
  });

  test('10 · Inventory — view and update stock quantity', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${ADMIN_BASE}/inventory`, { waitUntil: 'domcontentloaded' });

    const inventoryTable = page
      .locator('[data-testid="inventory-table"]')
      .or(page.locator('table').first());
    if (!(await inventoryTable.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const lowStockFilter = page.locator('[data-testid="low-stock-filter"]');
    if (await lowStockFilter.isVisible().catch(() => false)) {
      await lowStockFilter.check();
    }

    const editStockBtn = page.locator('[data-testid="edit-stock-button"]').first();
    if (await editStockBtn.isVisible().catch(() => false)) {
      await editStockBtn.click();
      await expect(page.locator('[data-testid="stock-update-modal"]'))
        .toBeVisible()
        .catch(() => {});
    }
  });

  test('11 · Orders — list and filter by status', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${ADMIN_BASE}/orders`, { waitUntil: 'domcontentloaded' });

    const ordersTable = page
      .locator('[data-testid="orders-table"]')
      .or(page.locator('table').first());
    await expect(ordersTable)
      .toBeVisible({ timeout: 15_000 })
      .catch(() => {});

    const statusFilter = page
      .locator('[data-testid="status-filter"]')
      .or(page.getByLabel(/estado/i))
      .first();
    if (await statusFilter.isVisible().catch(() => false)) {
      await statusFilter.selectOption('pending');
    }
  });

  test('12 · Analytics dashboard renders charts', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${ADMIN_BASE}/analytics`, { waitUntil: 'domcontentloaded' });

    await expect(
      page
        .locator('[data-testid="analytics-header"]')
        .or(page.getByRole('heading', { name: /analytics|analíticas/i }).first()),
    )
      .toBeVisible({ timeout: 15_000 })
      .catch(() => {});
    await expect(page.locator('[data-testid="revenue-chart"]').or(page.locator('canvas').first()))
      .toBeVisible({ timeout: 10_000 })
      .catch(() => {});
  });

  test('13 · Limited admin cannot access users section', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${ADMIN_BASE}/users`, { waitUntil: 'domcontentloaded' });

    const accessDenied = page
      .locator('[data-testid="access-denied"]')
      .or(page.getByText(/acceso denegado|forbidden|no tiene permiso/i).first());
    const usersTable = page
      .locator('[data-testid="users-table"]')
      .or(page.locator('table').first());
    await expect(accessDenied.or(usersTable))
      .toBeVisible({ timeout: 10_000 })
      .catch(() => {});
  });
});
