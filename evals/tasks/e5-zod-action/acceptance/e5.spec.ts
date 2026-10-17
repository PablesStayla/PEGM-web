// Aceptación e5: las acciones de la bandeja de mensajes deben validar el id
// (Zod) y rechazar entradas dañadas sin tocar la base de datos, con la
// convención de error `?error=invalid`; el camino feliz no debe cambiar.
//
// Además: la solución debe traer pruebas unitarias del esquema (se detectan
// como archivos src/**/*.test.ts nuevos o modificados y se ejecutan).
import { createClient } from "@libsql/client";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@pablo.cl";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin1234";

const raiz = process.cwd();
if (!fs.existsSync(path.join(raiz, "data"))) {
  throw new Error(
    `El cwd de la aceptación debe ser la raíz del clon; no existe ${path.join(raiz, "data")}.`,
  );
}

type ValorSql = string | number | null;

const client = createClient({ url: "file:./data/acceptance.db" });

async function filas(sql: string, args: ValorSql[] = []): Promise<Record<string, unknown>[]> {
  let ultimo: unknown = null;
  for (let intento = 1; intento <= 5; intento += 1) {
    try {
      const resultado = await client.execute({ sql, args });
      return resultado.rows as unknown as Record<string, unknown>[];
    } catch (error) {
      ultimo = error;
      await new Promise((resolver) => setTimeout(resolver, 400 * intento));
    }
  }
  throw ultimo;
}

async function appReady(page: Page, ruta: string): Promise<void> {
  await page.goto(ruta);
  await page.waitForLoadState("networkidle");
}

async function login(page: Page): Promise<void> {
  await appReady(page, "/admin/login");
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await Promise.all([page.waitForURL("**/admin"), page.click('button[type="submit"]')]);
}

async function manipularId(form: Locator, valor: string): Promise<void> {
  await form.locator('input[name="id"]').evaluate((elemento, dato) => {
    (elemento as HTMLInputElement).value = dato;
  }, valor);
}

test("e5: id inválido se rechaza sin tocar la BD y el camino feliz sigue intacto", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const stamp = Date.now().toString(36);
  const nombre = `EVAL-E5-${stamp}`;

  try {
    await login(page);

    await filas(
      "INSERT INTO messages (name, email, body, read, created_at) VALUES (?, ?, ?, 0, ?)",
      [nombre, "eval@example.com", "Mensaje insertado por la aceptación e5.", Date.now()],
    );
    const insertado = await filas("SELECT id FROM messages WHERE name = ?", [nombre]);
    expect(insertado.length, "la fila de prueba debe quedar insertada").toBe(1);
    const idMensaje = Number(insertado[0].id);

    const leerRead = async (): Promise<number> => {
      const fila = await filas("SELECT read FROM messages WHERE id = ?", [idMensaje]);
      return Number(fila[0]?.read ?? -1);
    };

    await appReady(page, "/admin/mensajes");
    const articulo = page.locator("article").filter({ hasText: nombre });
    await expect(articulo, "el mensaje de prueba debe aparecer en la bandeja").toBeVisible();

    // 1) Toggle con id no numérico: debe rechazarse con ?error=invalid.
    const formToggle = articulo.locator("form").filter({ hasText: "Marcar como leído" });
    await manipularId(formToggle, "abc");
    await formToggle.locator('button[type="submit"]').click();
    await page.waitForURL(/[?&]error=invalid/, { timeout: 20_000 });
    await expect(articulo).toBeVisible();
    expect(await leerRead(), 'con id inválido "abc" la acción no debe tocar la BD').toBe(0);

    // 2) Toggle con id cero: también inválido.
    await manipularId(formToggle, "0");
    await formToggle.locator('button[type="submit"]').click();
    await page.waitForURL(/[?&]error=invalid/, { timeout: 20_000 });
    expect(await leerRead(), 'con id inválido "0" la acción no debe tocar la BD').toBe(0);

    // 3) Camino feliz del toggle: alterna el estado.
    await manipularId(formToggle, String(idMensaje));
    await formToggle.locator('button[type="submit"]').click();
    await expect(articulo.getByRole("button", { name: "Marcar como no leído" })).toBeVisible();
    expect(new URL(page.url()).search, "el camino feliz redirige a /admin/mensajes sin query").toBe(
      "",
    );
    expect(await leerRead(), "con id válido el mensaje queda marcado como leído").toBe(1);

    // 4) Delete con id inválido: no debe borrar nada.
    await page.evaluate(() => {
      window.confirm = () => true;
    });
    const formEliminar = articulo.locator("form").filter({ hasText: "Eliminar" });
    await manipularId(formEliminar, "abc");
    await formEliminar.locator('button[type="submit"]').click();
    await page.waitForURL(/[?&]error=invalid/, { timeout: 20_000 });
    const trasInvalido = await filas("SELECT COUNT(*) AS n FROM messages WHERE id = ?", [
      idMensaje,
    ]);
    expect(Number(trasInvalido[0].n), "con id inválido la acción no debe eliminar").toBe(1);

    // 5) Delete válido: borra el mensaje.
    await page.evaluate(() => {
      window.confirm = () => true;
    });
    await manipularId(formEliminar, String(idMensaje));
    await formEliminar.locator('button[type="submit"]').click();
    await expect(articulo, "el mensaje eliminado debe desaparecer de la bandeja").toHaveCount(0);
    const restantes = await filas("SELECT COUNT(*) AS n FROM messages WHERE id = ?", [idMensaje]);
    expect(Number(restantes[0].n), "con id válido el mensaje debe eliminarse").toBe(0);

    // 6) La solución debe traer pruebas unitarias del esquema, en verde.
    const porcelain = execFileSync("git", ["status", "--porcelain"], {
      cwd: raiz,
      encoding: "utf8",
    });
    const archivos = porcelain
      .split("\n")
      .filter(Boolean)
      .map((linea) => {
        const crudo = linea
          .slice(3)
          .trim()
          .replace(/^"|"$/g, "");
        const ruta = crudo.includes(" -> ") ? crudo.split(" -> ")[1] : crudo;
        return ruta.replaceAll("\\", "/");
      })
      .filter((ruta) => /^src\/.+\.test\.ts$/.test(ruta));
    expect(
      archivos.length,
      "la solución debe añadir o modificar pruebas unitarias en src/**/*.test.ts",
    ).toBeGreaterThan(0);

    const pruebas = spawnSync("pnpm", ["exec", "vitest", "run", ...archivos], {
      cwd: raiz,
      shell: true,
      encoding: "utf8",
      timeout: 300_000,
    });
    const salida = `${pruebas.stdout ?? ""}${pruebas.stderr ?? ""}`;
    expect(
      pruebas.status,
      `los tests unitarios de la solución deben pasar (${archivos.join(", ")}):\n${salida.slice(-2000)}`,
    ).toBe(0);

    console.log(`[e5] OK — mensaje ${idMensaje} (${nombre}); tests: ${archivos.join(", ")}`);
  } finally {
    await client.close();
  }
});
