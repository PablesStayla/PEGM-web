import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkAgentsConfig } from "./agents-check.mjs";

let root;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "agents-check-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function escribir(relativa, contenido) {
  const ruta = join(root, relativa);
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, contenido, "utf8");
}

function errores() {
  return checkAgentsConfig(root)
    .filter((hallazgo) => hallazgo.nivel === "error")
    .map((hallazgo) => hallazgo.mensaje);
}

const PKG_VALIDO = JSON.stringify({ packageManager: "pnpm@11.7.0" });

describe("checkAgentsConfig", () => {
  it("acepta una configuración sana", () => {
    escribir("AGENTS.md", "# Guía\n");
    escribir("package.json", PKG_VALIDO);
    escribir(
      ".agents/skills/ejemplo/SKILL.md",
      "---\nname: ejemplo\ndescription: Skill de ejemplo.\n---\n\n# Ejemplo\n",
    );
    expect(errores()).toEqual([]);
  });

  it("falla si falta AGENTS.md", () => {
    escribir("package.json", PKG_VALIDO);
    expect(errores().join("\n")).toMatch(/AGENTS\.md/);
  });

  it("falla si CLAUDE.md no importa AGENTS.md", () => {
    escribir("AGENTS.md", "# Guía\n");
    escribir("package.json", PKG_VALIDO);
    escribir("CLAUDE.md", "# Solo Claude\n");
    expect(errores().join("\n")).toMatch(/@AGENTS\.md/);
  });

  it("acepta CLAUDE.md que delega en AGENTS.md", () => {
    escribir("AGENTS.md", "# Guía\n");
    escribir("package.json", PKG_VALIDO);
    escribir("CLAUDE.md", "@AGENTS.md\n");
    expect(errores()).toEqual([]);
  });

  it("prohíbe GEMINI.md en la raíz", () => {
    escribir("AGENTS.md", "# Guía\n");
    escribir("package.json", PKG_VALIDO);
    escribir("GEMINI.md", "# Gemini\n");
    expect(errores().join("\n")).toMatch(/GEMINI\.md/);
  });

  it("exige packageManager con pnpm", () => {
    escribir("AGENTS.md", "# Guía\n");
    escribir("package.json", "{}");
    expect(errores().join("\n")).toMatch(/pnpm/);
  });

  it("valida el frontmatter de las skills", () => {
    escribir("AGENTS.md", "# Guía\n");
    escribir("package.json", PKG_VALIDO);
    escribir(".agents/skills/rota/SKILL.md", "# Sin frontmatter\n");
    expect(errores().join("\n")).toMatch(/frontmatter/);
  });
});
