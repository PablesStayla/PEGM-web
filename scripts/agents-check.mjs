/**
 * Verifica la consistencia de la configuración multiagente del repositorio:
 * AGENTS.md como fuente de verdad, adaptadores que delegan (no duplican),
 * packageManager pnpm y formato de las skills en .agents/skills/.
 *
 * Uso: node scripts/agents-check.mjs   (sale 1 si hay errores)
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export function checkAgentsConfig(root = process.cwd()) {
  const hallazgos = [];
  const ok = (mensaje) => hallazgos.push({ nivel: "ok", mensaje });
  const error = (mensaje) => hallazgos.push({ nivel: "error", mensaje });

  const agentsPath = join(root, "AGENTS.md");
  const agents = existsSync(agentsPath) ? readFileSync(agentsPath, "utf8") : "";
  if (agents.trim().length === 0) {
    error("Falta AGENTS.md o está vacío: es la fuente de verdad de instrucciones.");
  } else {
    ok("AGENTS.md presente (fuente de verdad).");
  }

  const claudePath = join(root, "CLAUDE.md");
  if (existsSync(claudePath)) {
    const claude = readFileSync(claudePath, "utf8");
    if (claude.includes("@AGENTS.md")) {
      ok("CLAUDE.md delega en AGENTS.md (@AGENTS.md).");
    } else {
      error(
        "CLAUDE.md existe pero no importa AGENTS.md (@AGENTS.md): Claude Code lo leería en lugar de la fuente de verdad.",
      );
    }
  }

  if (existsSync(join(root, "GEMINI.md"))) {
    error("GEMINI.md en la raíz: usa AGENTS.md como fuente de verdad (Antigravity lee ambos).");
  }

  let packageManager = "";
  try {
    packageManager =
      JSON.parse(readFileSync(join(root, "package.json"), "utf8")).packageManager ?? "";
  } catch {
    error("No se pudo leer package.json.");
  }
  if (packageManager.startsWith("pnpm@")) {
    ok(`packageManager = ${packageManager}.`);
  } else {
    error("package.json debe fijar packageManager con pnpm (p. ej. pnpm@11.7.0).");
  }

  const skillsDir = join(root, ".agents", "skills");
  if (existsSync(skillsDir)) {
    for (const entrada of readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entrada.isDirectory()) continue;
      const skillPath = join(skillsDir, entrada.name, "SKILL.md");
      if (!existsSync(skillPath)) {
        error(`Skill ${entrada.name}: falta SKILL.md.`);
        continue;
      }
      const contenido = readFileSync(skillPath, "utf8");
      const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(contenido)?.[1] ?? "";
      const tieneNombre = /^name:\s*\S+/m.test(frontmatter);
      const tieneDescripcion = /^description:\s*\S+/m.test(frontmatter);
      if (tieneNombre && tieneDescripcion) {
        ok(`Skill ${entrada.name}: frontmatter válido.`);
      } else {
        error(`Skill ${entrada.name}: frontmatter sin name/description válidos.`);
      }
    }
  }

  return hallazgos;
}

const esEjecucionDirecta =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (esEjecucionDirecta) {
  const hallazgos = checkAgentsConfig();
  for (const { nivel, mensaje } of hallazgos) {
    console.log(`${nivel === "ok" ? "✓" : "✗"} ${mensaje}`);
  }
  const errores = hallazgos.filter((hallazgo) => hallazgo.nivel === "error").length;
  if (errores > 0) {
    console.error(`\n${errores} problema(s) de configuración multiagente.`);
    process.exit(1);
  }
  console.log("\nConfiguración multiagente consistente.");
}
