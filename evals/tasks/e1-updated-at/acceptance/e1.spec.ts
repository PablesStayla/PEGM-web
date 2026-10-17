// Aceptación e1: la fecha de modificación debe persistir por fila en las
// cuatro zonas del panel (experiencia, educación, idiomas y habilidades).
//
// Estrategia: descubrir la columna de fecha por PRAGMA (falla si no existe en
// la base), ejercer alta y edición desde la UI y verificar los timestamps
// directamente contra la BD del servidor de aceptación.
import { createClient } from "@libsql/client";
import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@pablo.cl";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin1234";
const MARGEN_RECIENTE_MS = 30 * 60 * 1000;
const MARGEN_ARRASTRE_MS = 120_000;

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

async function columnasDe(tabla: string): Promise<string[]> {
  const info = await filas(`PRAGMA table_info(${tabla})`);
  return info.map((columna) => String(columna.name));
}

function columnaDeFecha(columnas: string[]): string | null {
  if (columnas.includes("updated_at")) return "updated_at";
  return columnas.find((columna) => /updated|modified|fecha/i.test(columna)) ?? null;
}

function aMs(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  if (typeof valor === "number") return valor < 1e12 ? valor * 1000 : valor;
  if (typeof valor === "string") {
    const numerico = Number(valor);
    if (Number.isFinite(numerico)) return aMs(numerico);
    const parseado = Date.parse(valor);
    return Number.isFinite(parseado) ? parseado : null;
  }
  return null;
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

test("e1: la fecha de modificación persiste en experiencia, educación, idiomas y habilidades", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const t0 = Date.now();
  const stamp = Date.now().toString(36);

  try {
    await login(page);

    const tablas = ["experience", "education", "languages", "skills"] as const;
    const columnas: Record<string, string> = {};
    const faltantes: string[] = [];
    for (const tabla of tablas) {
      const disponibles = await columnasDe(tabla);
      const columna = columnaDeFecha(disponibles);
      if (columna) columnas[tabla] = columna;
      else faltantes.push(`${tabla} (columnas vistas: ${disponibles.join(", ")})`);
    }
    if (faltantes.length > 0) {
      throw new Error(
        `Estas tablas no tienen ninguna columna de fecha de modificación: ${faltantes.join("; ")}`,
      );
    }

    const semilla = await filas("SELECT id, role FROM experience ORDER BY id LIMIT 1");
    expect(semilla.length, "la BD de aceptación debe traer la semilla de experiencia").toBeGreaterThan(0);
    const idSemilla = Number(semilla[0].id);
    const rolSemilla = String(semilla[0].role);
    const previa = await filas(
      `SELECT ${columnas.experience} AS ts FROM experience WHERE id = ?`,
      [idSemilla],
    );
    const antes = aMs(previa[0]?.ts);

    const nombreExp = `EVAL-E1-EXP-${stamp}`;
    const nombreEdu = `EVAL-E1-EDU-${stamp}`;
    const nombreIdioma = `EVAL-E1-IDIOMA-${stamp}`;
    const nombreSkill = `EVAL-E1-SKILL-${stamp}`;
    const periodoEditado = `EVAL-E1-PERIODO-${stamp}`;

    // Alta: experiencia
    await appReady(page, "/admin/experiencia");
    const detalleExp = page.locator("details").filter({ hasText: "+ Añadir nueva entrada" });
    await detalleExp.locator("summary").click();
    await detalleExp.locator('input[name="period"]').fill("2026");
    await detalleExp.locator('input[name="role"]').fill(nombreExp);
    await detalleExp.locator('input[name="company"]').fill("EVAL E1");
    await detalleExp.getByRole("button", { name: "Crear entrada" }).click();
    await expect(page.getByText(nombreExp)).toBeVisible();

    // Alta: educación e idiomas (misma página)
    await appReady(page, "/admin/educacion");
    const detalleEdu = page.locator("details").filter({ hasText: "+ Añadir educación" });
    await detalleEdu.locator("summary").click();
    await detalleEdu.locator('input[name="period"]').fill("2026");
    await detalleEdu.locator('input[name="degree"]').fill(nombreEdu);
    await detalleEdu.locator('input[name="school"]').fill("EVAL E1");
    await detalleEdu.getByRole("button", { name: "Crear entrada" }).click();
    await expect(page.getByText(nombreEdu)).toBeVisible();

    const detalleIdioma = page.locator("details").filter({ hasText: "+ Añadir idioma" });
    await detalleIdioma.locator("summary").click();
    await detalleIdioma.locator('input[name="name"]').fill(nombreIdioma);
    await detalleIdioma.locator('input[name="level"]').fill("A1");
    await detalleIdioma.getByRole("button", { name: "Crear" }).click();
    await expect(page.getByText(nombreIdioma)).toBeVisible();

    // Alta: habilidades (sección software)
    await appReady(page, "/admin/habilidades");
    const seccionSoftware = page.locator("section").filter({ hasText: "Software y herramientas" });
    const formSkill = seccionSoftware.locator("form").filter({ hasText: "+ Añadir" });
    await formSkill.locator('input[name="name"]').fill(nombreSkill);
    await formSkill.getByRole("button", { name: "+ Añadir" }).click();
    await expect(page.getByText(nombreSkill)).toBeVisible();

    // Edición de la fila semilla de experiencia
    await appReady(page, "/admin/experiencia");
    const articuloSemilla = page.locator("article").filter({ hasText: rolSemilla });
    await articuloSemilla.locator("details").filter({ hasText: "Editar" }).locator("summary").click();
    const formEditar = articuloSemilla.locator("form").filter({ hasText: "Guardar cambios" });
    await formEditar.locator('input[name="period"]').fill(periodoEditado);
    await formEditar.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByText(periodoEditado)).toBeVisible();

    // Verificación en base de datos
    const evidencias: string[] = [];
    const creadas = [
      { tabla: "experience", campo: "role", valor: nombreExp },
      { tabla: "education", campo: "degree", valor: nombreEdu },
      { tabla: "languages", campo: "name", valor: nombreIdioma },
      { tabla: "skills", campo: "name", valor: nombreSkill },
    ] as const;

    for (const { tabla, campo, valor } of creadas) {
      const fila = await filas(`SELECT ${columnas[tabla]} AS ts FROM ${tabla} WHERE ${campo} = ?`, [
        valor,
      ]);
      expect(fila.length, `debe existir la fila creada en ${tabla} (${campo} = ${valor})`).toBe(1);
      const ts = aMs(fila[0].ts);
      expect(ts, `la fecha de la fila nueva en ${tabla} no puede ser nula`).not.toBeNull();
      expect(
        ts as number,
        `la fecha de la fila nueva en ${tabla} debe ser del momento de la prueba`,
      ).toBeGreaterThanOrEqual(t0 - MARGEN_ARRASTRE_MS);
      expect(
        Date.now() - (ts as number),
        `la fecha de la fila nueva en ${tabla} debe ser reciente`,
      ).toBeLessThan(MARGEN_RECIENTE_MS);
      evidencias.push(`${tabla}: alta -> ${new Date(ts as number).toISOString()}`);
    }

    const editada = await filas(
      `SELECT ${columnas.experience} AS ts, period FROM experience WHERE id = ?`,
      [idSemilla],
    );
    expect(editada.length).toBe(1);
    expect(editada[0].period, "el período editado debe quedar guardado").toBe(periodoEditado);
    const despues = aMs(editada[0].ts);
    expect(despues, "la fecha de la fila editada no puede ser nula").not.toBeNull();
    expect(
      Date.now() - (despues as number),
      "la fecha de la fila editada debe ser reciente",
    ).toBeLessThan(MARGEN_RECIENTE_MS);
    if (antes === null) {
      expect(
        despues as number,
        "sin fecha previa, la de la edición debe ser del momento de la prueba",
      ).toBeGreaterThanOrEqual(t0 - MARGEN_ARRASTRE_MS);
    } else {
      expect(
        despues as number,
        `la edición debe avanzar la fecha (antes ${antes}, después ${despues})`,
      ).toBeGreaterThan(antes);
    }
    evidencias.push(`experience (fila ${idSemilla} editada): antes=${antes}, después=${despues}`);

    console.log(`[e1] OK — ${evidencias.join(" | ")}`);
  } finally {
    await client.close();
  }
});
