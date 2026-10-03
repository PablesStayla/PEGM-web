import { expect, test } from "@playwright/test";
import { ADMIN_EMAIL, appReady, login, submitBypassingNativeValidation } from "./helpers";

test.describe("Autenticación del panel", () => {
  test("/admin redirige al login sin sesión", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/admin/login**");
    await expect(page.getByText("Panel.", { exact: true })).toBeVisible();
  });

  test("rechaza credenciales inválidas", async ({ page }) => {
    await appReady(page, "/admin/login");
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', "contraseña-incorrecta");
    await page.click('button[type="submit"]');
    await expect(page.getByText("Credenciales inválidas.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("validación del servidor (Zod) rechaza correos mal formados", async ({ page }) => {
    await appReady(page, "/admin/login");
    await page.fill('input[name="email"]', "correo-invalido");
    await page.fill('input[name="password"]', "lo-que-sea");
    // salta la validación nativa del navegador para ejercer la validación del servidor
    await submitBypassingNativeValidation(page.locator("form"));
    await expect(page.getByText("Ingresa un correo válido.")).toBeVisible();
  });

  test("limita intentos repetidos por cuenta e IP", async ({ page }, testInfo) => {
    await appReady(page, "/admin/login");
    const email = `bloqueo-${testInfo.retry}-${Date.now()}@example.com`;
    const submit = page.getByRole("button", { name: "Entrar" });

    for (let attempt = 0; attempt < 5; attempt++) {
      // React limpia los campos no controlados después de resolver una action.
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill("incorrecta");
      await submit.click();
      await expect(page.getByText("Credenciales inválidas.", { exact: true })).toBeVisible();
      await expect(submit).toBeEnabled();
    }

    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill("incorrecta");
    await submit.click();
    await expect(page.getByText(/Demasiados intentos/)).toBeVisible();
  });

  test("login correcto lleva al dashboard", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Últimos mensajes")).toBeVisible();
  });

  test("cerrar sesión vuelve al login y bloquea el panel", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await page.waitForURL("**/admin/login");
    // tras cerrar sesión, el panel vuelve a estar protegido
    await page.goto("/admin/proyectos");
    await page.waitForURL("**/admin/login**");
  });
});
