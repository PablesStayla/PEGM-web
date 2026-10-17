// Aceptación e3: la skill compartida `admin-zone` debe existir con el formato
// del harness (frontmatter name + description) y estar registrada en
// docs/agentes.md, con `pnpm check:agents` en verde.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUTA_SKILL = ".agents/skills/admin-zone/SKILL.md";
const fallos = [];

function leer(ruta) {
  return fs.readFileSync(path.join(RAIZ, ruta), "utf8");
}

// 1) La skill existe con el frontmatter mínimo del harness.
let contenidoSkill = null;
try {
  contenidoSkill = leer(RUTA_SKILL);
} catch {
  fallos.push(`falta ${RUTA_SKILL}`);
}

if (contenidoSkill !== null) {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(contenidoSkill);
  if (!frontmatter) {
    fallos.push(`${RUTA_SKILL} debe comenzar con un bloque de frontmatter (---)`);
  } else {
    const cuerpo = frontmatter[1];
    const nombre = /^name:\s*(.+)$/m.exec(cuerpo)?.[1]?.trim() ?? "";
    const descripcion = /^description:\s*(.+)$/m.exec(cuerpo)?.[1]?.trim() ?? "";
    if (nombre !== "admin-zone") {
      fallos.push(`${RUTA_SKILL}: el frontmatter debe declarar name: admin-zone (visto: "${nombre}")`);
    }
    if (descripcion.length < 20) {
      fallos.push(`${RUTA_SKILL}: la description del frontmatter debe tener al menos 20 caracteres`);
    }
  }
}

// 2) Registro en docs/agentes.md, sección «Skills compartidas».
try {
  const agentes = leer("docs/agentes.md");
  if (!/^-\s*`admin-zone`\s*[-—:]/m.test(agentes)) {
    fallos.push(
      "docs/agentes.md debe registrar la skill con una viñeta del estilo - `admin-zone` - descripción.",
    );
  }
} catch {
  fallos.push("docs/agentes.md no se puede leer");
}

// 3) Candado del harness en verde.
const resultado = spawnSync("pnpm", ["check:agents"], {
  cwd: RAIZ,
  shell: true,
  encoding: "utf8",
  timeout: 300_000,
});
if (resultado.status !== 0) {
  const salida = `${resultado.stdout ?? ""}${resultado.stderr ?? ""}`;
  fallos.push(`pnpm check:agents debe quedar en verde:\n${salida.slice(-2000)}`);
}

if (fallos.length > 0) {
  console.error(`[e3] ROJO:\n${fallos.map((fallo) => `- ${fallo}`).join("\n")}`);
  process.exit(1);
}
console.log("[e3] OK — skill admin-zone creada, registrada y con check:agents en verde.");
