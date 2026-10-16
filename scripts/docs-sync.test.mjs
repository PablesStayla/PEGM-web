import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { replaceBlock, syncFile } from "./docs-sync.mjs";

let dirs = [];
const makeDoc = (text) => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "docs-sync-"));
  dirs.push(dir);
  const filePath = path.join(dir, "DOC.md");
  writeFileSync(filePath, text, "utf8");
  return filePath;
};
afterEach(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  dirs = [];
});

const DOC = [
  "# Doc",
  "",
  "<!-- BEGIN:docs-sync:commands -->",
  "viejo",
  "<!-- END:docs-sync:commands -->",
  "",
  "prosa intacta",
  "",
].join("\n");

describe("replaceBlock", () => {
  it("reemplaza solo el contenido entre marcadores", () => {
    const out = replaceBlock(DOC, "commands", "nuevo");
    expect(out).toBe(
      [
        "# Doc",
        "",
        "<!-- BEGIN:docs-sync:commands -->",
        "nuevo",
        "<!-- END:docs-sync:commands -->",
        "",
        "prosa intacta",
        "",
      ].join("\n"),
    );
  });

  it("lanza si el bloque no existe", () => {
    expect(() => replaceBlock(DOC, "env", "x")).toThrow(/env/);
  });

  it("lanza si el bloque está duplicado", () => {
    const dup = DOC + "<!-- BEGIN:docs-sync:commands -->\nx\n<!-- END:docs-sync:commands -->\n";
    expect(() => replaceBlock(dup, "commands", "y")).toThrow(/duplicado/i);
  });

  it("lanza si los marcadores están invertidos", () => {
    const inverted = [
      "# Doc",
      "",
      "<!-- END:docs-sync:commands -->",
      "contenido",
      "<!-- BEGIN:docs-sync:commands -->",
      "",
      "prosa intacta",
      "",
    ].join("\n");
    expect(() => replaceBlock(inverted, "commands", "x")).toThrow(/invertidos/i);
  });

  it("preserva el CRLF del documento en todo el bloque reemplazado", () => {
    const crlf = [
      "# Doc",
      "",
      "<!-- BEGIN:docs-sync:commands -->",
      "viejo",
      "<!-- END:docs-sync:commands -->",
      "",
      "prosa intacta",
      "",
    ].join("\r\n");
    const out = replaceBlock(crlf, "commands", "linea 1\nlinea 2");
    expect(out).toBe(
      [
        "# Doc",
        "",
        "<!-- BEGIN:docs-sync:commands -->",
        "linea 1",
        "linea 2",
        "<!-- END:docs-sync:commands -->",
        "",
        "prosa intacta",
        "",
      ].join("\r\n"),
    );
    const begin = "<!-- BEGIN:docs-sync:commands -->";
    const end = "<!-- END:docs-sync:commands -->";
    const region = out.slice(out.indexOf(begin), out.indexOf(end) + end.length);
    expect(region.replace(/\r\n/g, "")).not.toContain("\n");
  });
});

describe("syncFile", () => {
  it("es idempotente y no escribe en modo check", () => {
    const filePath = makeDoc(DOC);
    const blocks = [{ name: "commands", content: "nuevo" }];
    const first = syncFile({ filePath, blocks, write: true });
    expect(first.changed).toBe(true);
    const afterWrite = readFileSync(filePath, "utf8");
    expect(afterWrite).toContain("nuevo");
    const second = syncFile({ filePath, blocks, write: true });
    expect(second.changed).toBe(false);
    const check = syncFile({
      filePath,
      blocks: [{ name: "commands", content: "otra cosa" }],
      write: false,
    });
    expect(check.changed).toBe(true);
    expect(readFileSync(filePath, "utf8")).toBe(afterWrite);
  });

  it("reporta problemas sin lanzar", () => {
    const filePath = makeDoc("# Doc sin bloques\n");
    const result = syncFile({
      filePath,
      blocks: [{ name: "commands", content: "x" }],
      write: false,
    });
    expect(result.problems.length).toBe(1);
    expect(result.problems[0]).toMatch(/commands/);
  });
});

import { mkdirSync } from "node:fs";
import pathAlias from "node:path";
import {
  ENV_INTERNAL,
  readSources,
  renderCommands,
  renderEnv,
  renderStack,
  SCRIPT_DOCS,
  STACK,
} from "./docs-sync.mjs";

const makeRepo = () => {
  const root = mkdtempSync(pathAlias.join(os.tmpdir(), "docs-repo-"));
  dirs.push(root);
  const write = (rel, text) => {
    const file = pathAlias.join(root, rel);
    mkdirSync(pathAlias.dirname(file), { recursive: true });
    writeFileSync(file, text, "utf8");
  };
  write(
    "package.json",
    JSON.stringify({
      scripts: { dev: "next dev", test: "vitest run", "docs:sync": "x", "docs:check": "y" },
      dependencies: { next: "^16.3.8" },
      devDependencies: { vitest: "^5.0.3" },
    }),
  );
  write(".env.example", 'AUTH_SECRET="s"\nTURSO_DATABASE_URL=""\n');
  write("src/db/index.ts", "const a = process.env.AUTH_SECRET; const b = process.env.CI;");
  write("src/app/(site)/page.tsx", "export default function P() { return null; }");
  write("src/app/(site)/cv/page.tsx", "export default function C() { return null; }");
  write("src/app/llms.txt/route.ts", "export const GET = () => new Response('x');");
  return root;
};

describe("readSources", () => {
  it("lee scripts, env y rutas reales (grupos y route.ts)", () => {
    const root = makeRepo();
    const s = readSources(root);
    expect(s.scriptNames).toContain("dev");
    expect(s.envDeclared).toEqual(["AUTH_SECRET", "TURSO_DATABASE_URL"]);
    expect(s.envUsage).toContain("AUTH_SECRET");
    expect(s.routes.map((r) => r.path)).toEqual(["/", "/cv", "/llms.txt"]);
    expect(s.routes.map((r) => r.kind)).toEqual(["Página", "Página", "API"]);
  });
});

describe("renderCommands", () => {
  it("genera filas para todos los scripts y falla si falta descripción", () => {
    const ok = renderCommands({
      scripts: Object.fromEntries(Object.keys(SCRIPT_DOCS).map((name) => [name, "x"])),
    });
    expect(ok.problems).toEqual([]);
    expect(ok.content).toContain("| `pnpm dev` |");
    const bad = renderCommands({ scripts: { "script-nuevo": "x" } });
    expect(bad.problems[0]).toMatch(/SCRIPT_DOCS.*script-nuevo/);
  });
});

describe("renderEnv", () => {
  it("genera tabla y falla si falta ENV_DOCS", () => {
    const ok = renderEnv(["AUTH_SECRET"]);
    expect(ok.problems).toEqual([]);
    expect(ok.content).toContain("| `AUTH_SECRET` |");
    const bad = renderEnv(["NUEVA_VAR"]);
    expect(bad.problems[0]).toMatch(/ENV_DOCS.*NUEVA_VAR/);
  });
});

describe("checkEnvCoverage", () => {
  it("detecta huérfanos en ambas direcciones", async () => {
    const { checkEnvCoverage } = await import("./docs-sync.mjs");
    const problems = checkEnvCoverage(["AUTH_SECRET", "VIEJA"], ["AUTH_SECRET", "NUEVA", "CI"]);
    expect(problems).toEqual([
      'env: "NUEVA" se usa en el código pero no está en .env.example (o en ENV_INTERNAL)',
      'env: "VIEJA" está en .env.example pero no se usa en el código',
    ]);
  });
});

describe("renderStack", () => {
  it("renderiza versiones sin ^ y falla si falta el paquete", () => {
    const all = Object.fromEntries(STACK.filter((e) => e.pkg).map((e) => [e.pkg, "^1.0.0"]));
    const { content, problems } = renderStack({ dependencies: { ...all, next: "^16.3.8" } });
    expect(problems).toEqual([]);
    expect(content).toContain("| 16.3.8 |");
    expect(content).toContain("scrypt");
    const missing = renderStack({ dependencies: {}, devDependencies: {} });
    expect(missing.problems.length).toBeGreaterThan(0);
  });
});

describe("ENV_INTERNAL", () => {
  it("cubre las variables internas detectadas en el repo real", () => {
    for (const v of ["CI", "NODE_ENV", "VERCEL", "PLAYWRIGHT_CHROMIUM_EXECUTABLE"]) {
      expect(ENV_INTERNAL.has(v)).toBe(true);
    }
  });
});
