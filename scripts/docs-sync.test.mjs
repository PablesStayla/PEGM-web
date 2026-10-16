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
