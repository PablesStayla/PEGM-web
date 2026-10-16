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
