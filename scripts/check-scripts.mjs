/**
 * @file check-scripts.mjs
 * @description Candado de scripts (hallazgo C de la auditoría): valida la
 * sintaxis de todos los `.mjs` del repositorio (`scripts/**`, `evals/**` y
 * raíz) y hace un smoke de importación de los módulos curados que deben poder
 * importarse sin efectos secundarios.
 *
 * Por qué existe: `pnpm lint` no cubre esto — Biome acepta sintaxis TypeScript
 * dentro de `.mjs`, así que un archivo inejecutable puede pasar lint, tests,
 * type-check y build (así entró el defecto `export type` del PR #15). Este
 * candado lo detecta en CI (job `guards`) y en el hook de pre-commit.
 *
 * uso: node scripts/check-scripts.mjs [raiz]   (raíz por defecto: cwd)
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIRECTORIOS = ["scripts", "evals"];

/** Módulos diseñados para importarse (sin efectos secundarios al importar). */
export const IMPORTABLES = [
  "scripts/evals/schema.mjs",
  "scripts/evals/report.mjs",
  "scripts/evals/run.mjs",
];

/** Recolecta recursivamente los `.mjs` de un directorio (vacío si no existe). */
function recolectarMjs(absoluto, encontrados) {
  if (!fs.existsSync(absoluto)) return;
  for (const entrada of fs.readdirSync(absoluto, { withFileTypes: true })) {
    const hijo = path.join(absoluto, entrada.name);
    if (entrada.isDirectory()) recolectarMjs(hijo, encontrados);
    else if (entrada.isFile() && entrada.name.endsWith(".mjs")) encontrados.push(hijo);
  }
}

/** Rutas relativas (con "/") de todos los módulos a verificar. */
export function recolectarModulos(raiz) {
  const archivos = [];
  for (const dir of DIRECTORIOS) recolectarMjs(path.join(raiz, dir), archivos);
  for (const entrada of fs.readdirSync(raiz, { withFileTypes: true })) {
    if (entrada.isFile() && entrada.name.endsWith(".mjs")) {
      archivos.push(path.join(raiz, entrada.name));
    }
  }
  return archivos.sort().map((absoluto) => path.relative(raiz, absoluto).split(path.sep).join("/"));
}

/** Primera línea con "Error" (o la primera útil) de la salida de Node. */
function detalleError(salida) {
  const lineas = (salida ?? "")
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter(Boolean);
  return lineas.find((linea) => /Error/.test(linea)) ?? lineas[0] ?? "sin detalle";
}

/**
 * Verifica sintaxis de todos los `.mjs` y la importación de `importables`.
 * Devuelve `{ revisados, problemas }`; problema = `{ archivo, tipo, detalle }`.
 */
export function verificar({ raiz, importables = IMPORTABLES }) {
  const revisados = recolectarModulos(raiz);
  const problemas = [];
  for (const relativo of revisados) {
    const chequeo = spawnSync(process.execPath, ["--check", path.join(raiz, relativo)], {
      encoding: "utf8",
      windowsHide: true,
    });
    if (chequeo.status !== 0) {
      problemas.push({
        archivo: relativo,
        tipo: "sintaxis",
        detalle: detalleError(chequeo.stderr),
      });
    }
  }
  for (const relativo of importables) {
    const absoluto = path.join(raiz, relativo);
    if (!fs.existsSync(absoluto)) {
      problemas.push({ archivo: relativo, tipo: "importacion", detalle: "no existe el módulo" });
      continue;
    }
    const url = pathToFileURL(absoluto).href;
    const smoke = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", `await import(${JSON.stringify(url)});`],
      { cwd: raiz, encoding: "utf8", windowsHide: true, timeout: 30000 },
    );
    if (smoke.status !== 0) {
      problemas.push({
        archivo: relativo,
        tipo: "importacion",
        detalle: detalleError(smoke.stderr) || smoke.error?.message || "sin detalle",
      });
    }
  }
  return { revisados: revisados.length, problemas };
}

export function main(argv = process.argv.slice(2)) {
  const raiz = path.resolve(argv[0] ?? process.cwd());
  if (!fs.existsSync(raiz)) {
    console.error(`[scripts] la raíz no existe: ${raiz}`);
    return 2;
  }
  const { revisados, problemas } = verificar({ raiz });
  if (problemas.length > 0) {
    for (const problema of problemas) {
      console.error(`[scripts] ${problema.archivo}: ${problema.tipo}: ${problema.detalle}`);
    }
    console.error(`[scripts] ${problemas.length} problema(s) en ${revisados} módulos`);
    return 1;
  }
  console.log(
    `[scripts] OK: ${revisados} módulos con sintaxis válida · ${IMPORTABLES.length} importables sin errores`,
  );
  return 0;
}

const esPrincipal =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (esPrincipal) process.exitCode = main();
