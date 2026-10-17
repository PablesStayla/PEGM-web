// Aceptación e2: el límite del formulario de contacto debe salir de una
// variable de entorno documentada en todo el contrato del repo.
//
// No se inspecciona el código de la acción: los candados del repo
// (docs:check con cobertura bidireccional declarada ⇔ usada, check:agents)
// fuerzan que la variable esté declarada, usada y documentada a la vez.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VARIABLE = "CONTACT_RATE_LIMIT_PER_HOUR";
const fallos = [];

function leer(ruta) {
  return fs.readFileSync(path.join(RAIZ, ruta), "utf8");
}

// 1) Declaración en .env.example (fuente de verdad del contrato de entorno).
try {
  const envExample = leer(".env.example");
  if (!new RegExp(`^${VARIABLE}=`, "m").test(envExample)) {
    fallos.push(`.env.example debe declarar ${VARIABLE}=…`);
  }
} catch {
  fallos.push(".env.example no se puede leer");
}

// 2) Bloques generados docs-sync:env de los documentos del contrato.
const DOCUMENTOS = ["AGENTS.md", "README.md", "DEPLOY.md"];
const bloques = DOCUMENTOS.map((archivo) => {
  let contenido = "";
  try {
    contenido = leer(archivo);
  } catch {
    // Si no existe, se reporta como sin bloque abajo.
  }
  const match = /<!-- BEGIN:docs-sync:env -->([\s\S]*?)<!-- END:docs-sync:env -->/.exec(contenido);
  return { archivo, bloque: match ? match[1] : null };
});
const conBloque = bloques.filter((entrada) => entrada.bloque !== null);
if (conBloque.length < 2) {
  fallos.push(
    `se esperaban al menos 2 bloques docs-sync:env (AGENTS.md y DEPLOY.md); encontrados: ${conBloque.length}`,
  );
}
for (const { archivo, bloque } of conBloque) {
  if (!bloque.includes(`\`${VARIABLE}\``)) {
    fallos.push(`${archivo} (bloque docs-sync:env) no incluye \`${VARIABLE}\``);
  }
}

// 3) Descripción en ENV_DOCS del motor de documentación viva.
try {
  const modulo = await import(pathToFileURL(path.join(RAIZ, "scripts", "docs-sync.mjs")).href);
  if (!modulo.ENV_DOCS || !modulo.ENV_DOCS[VARIABLE]) {
    fallos.push(`scripts/docs-sync.mjs (ENV_DOCS) debe describir ${VARIABLE}`);
  }
} catch (error) {
  fallos.push(`no se pudo importar scripts/docs-sync.mjs: ${error}`);
}

// 4) Candados del repo en verde.
for (const args of [["docs:check"], ["check:agents"]]) {
  const nombre = `pnpm ${args.join(" ")}`;
  const resultado = spawnSync("pnpm", args, {
    cwd: RAIZ,
    shell: true,
    encoding: "utf8",
    timeout: 300_000,
  });
  if (resultado.status !== 0) {
    const salida = `${resultado.stdout ?? ""}${resultado.stderr ?? ""}`;
    fallos.push(`${nombre} debe quedar en verde:\n${salida.slice(-2000)}`);
  }
}

if (fallos.length > 0) {
  console.error(`[e2] ROJO:\n${fallos.map((fallo) => `- ${fallo}`).join("\n")}`);
  process.exit(1);
}
console.log(`[e2] OK — ${VARIABLE} declarada, documentada y con los candados en verde.`);
