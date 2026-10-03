import { expect, test } from "@playwright/test";
import { appReady, login, submitBypassingNativeValidation } from "./helpers";

test.describe("Formulario de contacto → bandeja del panel", () => {
  const suffix = Date.now();
  const name = `E2E Tester ${suffix}`;

  test("un mensaje del sitio llega al panel y se puede marcar como leído", async ({ page }) => {
    // 1) enviar el formulario público
    await appReady(page, "/#contacto");
    const form = page.locator("#contacto form");
    await form.locator('input[name="name"]').fill(name);
    await form.locator('input[name="email"]').fill("e2e@test.cl");
    await form
      .locator('textarea[name="body"]')
      .fill("Mensaje generado por la prueba automatizada.");
    await form.getByRole("button", { name: "Enviar mensaje" }).click();
    await expect(page.getByText("¡Mensaje enviado!")).toBeVisible();

    // 2) el mensaje llega a la bandeja del panel
    await login(page);
    await appReady(page, "/admin/mensajes");
    const mensaje = page.locator("article", { hasText: name });
    await expect(mensaje).toBeVisible();
    await expect(mensaje.getByText("e2e@test.cl")).toBeVisible();
    await expect(mensaje.getByText("nuevo", { exact: true })).toBeVisible();

    // 3) marcar como leído: el botón cambia y el badge "nuevo" desaparece
    await mensaje.getByRole("button", { name: "Marcar como leído" }).click();
    const actualizado = page.locator("article", { hasText: name });
    await expect(actualizado.getByRole("button", { name: "Marcar como no leído" })).toBeVisible();
    await expect(actualizado.getByText("nuevo", { exact: true })).toHaveCount(0);
  });

  test("validación del servidor (Zod) exige un mensaje de al menos 10 caracteres", async ({
    page,
  }) => {
    await appReady(page, "/#contacto");
    const form = page.locator("#contacto form");
    await form.locator('input[name="name"]').fill("Tester");
    await form.locator('input[name="email"]').fill("e2e@test.cl");
    await form.locator('textarea[name="body"]').fill("corto");
    // salta la validación nativa (minLength) para ejercer la validación del servidor
    await submitBypassingNativeValidation(form);
    await expect(page.getByText("El mensaje debe tener al menos 10 caracteres.")).toBeVisible();
  });
});
