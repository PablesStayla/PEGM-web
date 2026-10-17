import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { main, verificar } from "./check-scripts.mjs";

const RUTA_CLI = fileURLToPath(new URL("./check-scripts.mjs", import.meta.url));
const temporales = [];

afterEach(() => {
  while (temporales.length > 0) {
    fs.rmSync(temporales.pop(), { recursive: true, force: true });
  }
});

function crearRaiz() {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), "pegm-check-"));
  temporales.push(raiz);
  return raiz;
}

function escribir(raiz, relativo, contenido) {
  const destino = path.join(raiz, relativo);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, contenido, "utf8");
}

describe("verificar", () => {
  it("da verde con módulos válidos y cuenta los .mjs (incluida la raíz)", () => {
    const raiz = crearRaiz();
    escribir(raiz, "scripts/util.mjs", "export const uno = 1;\n");
    escribir(raiz, "evals/tasks/e1/acceptance/check.mjs", "console.log('check');\n");
    escribir(raiz, "postcss.config.mjs", "export default {};\n");
    escribir(raiz, "scripts/notas.md", "# no es un módulo\n");
    const { revisados, problemas } = verificar({ raiz, importables: [] });
    expect(problemas).toEqual([]);
    expect(revisados).toBe(3);
  });

  it("detecta sintaxis inválida (regresión de la auditoría: `export type` dentro de .mjs)", () => {
    const raiz = crearRaiz();
    escribir(
      raiz,
      "scripts/evals/schema.mjs",
      'import { z } from "zod";\n\nexport type SeedCredentialsError = z.infer<typeof SeedCredentialsSchema>;\n',
    );
    const { problemas } = verificar({ raiz, importables: [] });
    expect(problemas).toHaveLength(1);
    expect(problemas[0].archivo).toBe("scripts/evals/schema.mjs");
    expect(problemas[0].tipo).toBe("sintaxis");
  });

  it("detecta una importación de un export inexistente", () => {
    const raiz = crearRaiz();
    escribir(raiz, "scripts/dep.mjs", "export const x = 1;\n");
    escribir(raiz, "scripts/usa.mjs", 'import { y } from "./dep.mjs";\nconsole.log(y);\n');
    const { problemas } = verificar({ raiz, importables: ["scripts/usa.mjs"] });
    expect(problemas).toHaveLength(1);
    expect(problemas[0].archivo).toBe("scripts/usa.mjs");
    expect(problemas[0].tipo).toBe("importacion");
  });

  it("verifica que un módulo importable cargue sin efectos al importarlo", () => {
    const raiz = crearRaiz();
    escribir(raiz, "scripts/ok.mjs", "export const valor = 42;\n");
    const { problemas } = verificar({ raiz, importables: ["scripts/ok.mjs"] });
    expect(problemas).toEqual([]);
  });

  it("reporta como problema un importable inexistente", () => {
    const raiz = crearRaiz();
    const { problemas } = verificar({ raiz, importables: ["scripts/fantasma.mjs"] });
    expect(problemas).toHaveLength(1);
    expect(problemas[0].tipo).toBe("importacion");
    expect(problemas[0].detalle).toMatch(/no existe/);
  });
});

describe("CLI", () => {
  it("devuelve 1 con un .mjs roto y 0 sobre este repositorio", () => {
    const roto = crearRaiz();
    escribir(roto, "scripts/malo.mjs", "export type X = number;\n");
    const fallo = spawnSync(process.execPath, [RUTA_CLI, roto], { encoding: "utf8" });
    expect(fallo.status).toBe(1);
    expect(fallo.stderr).toMatch(/scripts\/malo\.mjs/);

    const raizRepo = path.resolve(path.dirname(RUTA_CLI), "..");
    const bien = spawnSync(process.execPath, [RUTA_CLI, raizRepo], {
      encoding: "utf8",
      timeout: 120000,
    });
    expect(bien.status).toBe(0);
    expect(bien.stdout).toMatch(/OK/);
  });

  it("main devuelve 2 si la raíz no existe", () => {
    const inexistente = path.join(os.tmpdir(), "pegm-check-no-existe-jamas");
    expect(main([inexistente])).toBe(2);
  });
});
