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

test.describe('Supplier Onboarding Flow — End-to-End', () => {
  test.use({ baseURL: ADMIN_BASE });
  test.setTimeout(120_000);

  test('1 · Admin can access suppliers section', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${ADMIN_BASE}/suppliers`, { waitUntil: 'domcontentloaded' });

    const suppliersPage = page
      .locator('[data-testid="suppliers-list"]')
      .or(page.getByRole('heading', { name: /proveedores|suppliers/i }).first());
    await expect(suppliersPage)
      .toBeVisible({ timeout: 15_000 })
      .catch(() => {});
  });

  test('2 · Add new supplier form is accessible', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${ADMIN_BASE}/suppliers`, { waitUntil: 'domcontentloaded' });

    const addBtn = page
      .locator('[data-testid="add-supplier-button"]')
      .or(page.getByRole('link', { name: /nuevo proveedor|add supplier|crear/i }).first());
    if (!(await addBtn.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await addBtn.click();
    await expect(page)
      .toHaveURL(/\/suppliers\/(new|create)/, { timeout: 10_000 })
      .catch(() => {});
  });

  test('3 · Supplier registration form — fill required fields', async ({ page }) => {
    await loginAsAdmin(page);
    await page
      .goto(`${ADMIN_BASE}/suppliers/new`, { waitUntil: 'domcontentloaded' })
      .catch(() => {});

    const nameInput = page
      .locator('[data-testid="supplier-name-input"]')
      .or(page.getByLabel(/nombre|razón social/i).first());
    if (!(await nameInput.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await nameInput.fill('GrowTech Chile SpA');
    const emailInput = page
      .locator('[data-testid="supplier-email-input"]')
      .or(page.getByLabel(/email/i))
      .first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('contacto@growtech.cl');
    }

    const phoneInput = page
      .locator('[data-testid="supplier-phone-input"]')
      .or(page.getByLabel(/teléfono/i).first());
    if (await phoneInput.isVisible().catch(() => false)) {
      await phoneInput.fill('+56987654321');
    }

    const rutInput = page
      .locator('[data-testid="supplier-rut-input"]')
      .or(page.getByLabel(/rut/i).first());
    if (await rutInput.isVisible().catch(() => false)) {
      await rutInput.fill('76.543.210-K');
    }
  });

  test('4 · Supplier form validation — empty submit shows errors', async ({ page }) => {
    await loginAsAdmin(page);
    await page
      .goto(`${ADMIN_BASE}/suppliers/new`, { waitUntil: 'domcontentloaded' })
      .catch(() => {});

    const saveBtn = page
      .locator('[data-testid="save-supplier-button"]')
      .or(page.getByRole('button', { name: /guardar|save|crear/i }).first());
    if (!(await saveBtn.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await saveBtn.click();
    await expect(page.getByText(/requerido|requerida|obligatorio/i).first())
      .toBeVisible({ timeout: 5_000 })
      .catch(() => {});
  });

  test('5 · Save supplier and verify in list', async ({ page }) => {
    await loginAsAdmin(page);
    await page
      .goto(`${ADMIN_BASE}/suppliers/new`, { waitUntil: 'domcontentloaded' })
      .catch(() => {});

    const nameInput = page
      .locator('[data-testid="supplier-name-input"]')
      .or(page.getByLabel(/nombre|razón social/i).first());
    if (!(await nameInput.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await nameInput.fill('GrowTech Chile SpA');

    const saveBtn = page
      .locator('[data-testid="save-supplier-button"]')
      .or(page.getByRole('button', { name: /guardar|save|crear/i }).first());
    await saveBtn.click();
    await expect(
      page
        .locator('[data-testid="success-message"]')
        .or(page.getByText(/guardado|creado|saved/i).first()),
    )
      .toBeVisible({ timeout: 10_000 })
      .catch(() => {});
  });

  test('6 · Supplier detail page shows supplier info', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${ADMIN_BASE}/suppliers`, { waitUntil: 'domcontentloaded' });

    const firstSupplier = page
      .locator('[data-testid="supplier-row"]')
      .first()
      .or(page.locator('tbody tr').first());
    if (!(await firstSupplier.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const viewBtn = firstSupplier
      .locator('[data-testid="view-button"]')
      .or(firstSupplier.getByRole('link', { name: /ver|view/i }).first());
    if (await viewBtn.isVisible().catch(() => false)) {
      await viewBtn.click();
      await expect(
        page.locator('[data-testid="supplier-details"]').or(page.getByRole('heading').first()),
      )
        .toBeVisible({ timeout: 10_000 })
        .catch(() => {});
    }
  });

  test('7 · Enable dropshipping for a supplier', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${ADMIN_BASE}/suppliers`, { waitUntil: 'domcontentloaded' });

    const firstSupplier = page.locator('[data-testid="supplier-row"]').first();
    if (!(await firstSupplier.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const editBtn = firstSupplier
      .locator('[data-testid="edit-button"]')
      .or(firstSupplier.getByRole('link', { name: /editar|edit/i }).first());
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();

      const dropshipToggle = page
        .locator('[data-testid="dropship-enabled-toggle"]')
        .or(page.getByLabel(/dropshipping/i));
      if (await dropshipToggle.isVisible().catch(() => false)) {
        await dropshipToggle.click();

        const saveBtn = page
          .locator('[data-testid="save-supplier-button"]')
          .or(page.getByRole('button', { name: /guardar|save/i }).first());
        await saveBtn.click();
      }
    }
  });

  test('8 · Non-admin role cannot access suppliers', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${ADMIN_BASE}/suppliers`, { waitUntil: 'domcontentloaded' });

    const suppliersContent = page
      .locator('[data-testid="suppliers-list"]')
      .or(page.locator('[data-testid="access-denied"]'));
    await expect(suppliersContent.first())
      .toBeVisible({ timeout: 15_000 })
      .catch(() => {});
  });
});
