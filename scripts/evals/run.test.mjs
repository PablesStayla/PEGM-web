import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  assertInside,
  buildAgentCommand,
  cargarTarea,
  computeLevel,
  inyectarAceptacion,
  parseClaudeOutput,
  parseFlags,
  parseNumstat,
  resumenEntorno,
  sanitizeEnv,
} from "./run.mjs";

const temporales = [];

afterEach(() => {
  while (temporales.length > 0) {
    fs.rmSync(temporales.pop(), { recursive: true, force: true });
  }
});

const crearTemporal = (prefijo) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefijo));
  temporales.push(dir);
  return dir;
};

describe("assertInside", () => {
  const base = path.join(os.tmpdir(), "pegm-evals-test");

  it("acepta rutas dentro del directorio (incluido el propio directorio)", () => {
    expect(assertInside(base, path.join(base, "run-1"), "clon")).toBe(path.join(base, "run-1"));
    expect(assertInside(base, base, "clon")).toBe(base);
    expect(assertInside(base, path.join(base, "a", "b", "c"), "clon")).toBe(
      path.join(base, "a", "b", "c"),
    );
  });

  it("rechaza rutas fuera del directorio", () => {
    expect(() => assertInside(base, path.join(os.tmpdir(), "otro"), "clon")).toThrow(/fuera de/);
    expect(() => assertInside(base, path.join(base, "..", "hermano"), "clon")).toThrow(/fuera de/);
  });

  it("no confunde prefijos de hermanos (eval vs eval-otro)", () => {
    expect(() => assertInside(base, `${base}-otro${path.sep}x`, "clon")).toThrow(/fuera de/);
  });
});

describe("sanitizeEnv", () => {
  it("elimina variables sensibles y usa credenciales de prueba", () => {
    const original = {
      PATH: "/bin",
      TURSO_DATABASE_URL: "libsql://real",
      TURSO_AUTH_TOKEN: "token-real",
      AUTH_SECRET: "secreto-real",
      ADMIN_EMAIL: "pablo@real.cl",
      ADMIN_PASSWORD: "clave-real",
      NEXT_PUBLIC_SITE_URL: "https://real.cl",
    };
    const env = sanitizeEnv(original, "secreto-efimero");
    expect(env.PATH).toBe("/bin");
    expect(env.AUTH_SECRET).toBe("secreto-efimero");
    expect(env.ADMIN_EMAIL).toBe("admin@pablo.cl");
    expect(env.ADMIN_PASSWORD).toBe("admin1234");
    expect(env.TURSO_DATABASE_URL).toBeUndefined();
    expect(env.TURSO_AUTH_TOKEN).toBeUndefined();
    expect(env.NEXT_PUBLIC_SITE_URL).toBeUndefined();
    expect(original.TURSO_DATABASE_URL).toBe("libsql://real");
  });

  it("genera un AUTH_SECRET efímero de 64 hex por defecto", () => {
    const env = sanitizeEnv({});
    expect(env.AUTH_SECRET).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("resumenEntorno", () => {
  it("no contiene secretos reales y documenta la ausencia de Turso", () => {
    const resumen = resumenEntorno();
    expect(Object.keys(resumen).sort()).toEqual(
      [
        "ADMIN_EMAIL",
        "ADMIN_PASSWORD",
        "AUTH_SECRET",
        "TURSO_AUTH_TOKEN",
        "TURSO_DATABASE_URL",
      ].sort(),
    );
    expect(resumen.TURSO_DATABASE_URL).toMatch(/ausente/);
    expect(resumen.AUTH_SECRET).not.toMatch(/[0-9a-f]{64}/);
  });
});

describe("buildAgentCommand", () => {
  const task = {
    agente: {
      tool: "claude",
      model: "claude-sonnet-4-5",
      flags: ["--permission-mode", "bypassPermissions", "--permission-prompts", "none"],
    },
    presupuesto: { usd: 5, minutos: 30 },
  };

  it("arma la corrida nueva con sesión, presupuesto y banderas de la tarea al final", () => {
    const { tool, args } = buildAgentCommand({ task, sessionId: "sid-123" });
    expect(tool).toBe("claude");
    expect(args).toContain("--print");
    expect(args).toEqual(expect.arrayContaining(["--output-format", "json"]));
    expect(args).toEqual(expect.arrayContaining(["--model", "claude-sonnet-4-5"]));
    expect(args).toEqual(expect.arrayContaining(["--max-budget-usd", "5"]));
    expect(args).toEqual(expect.arrayContaining(["--session-id", "sid-123"]));
    expect(args.slice(-4)).toEqual(task.agente.flags);
    expect(args).not.toContain("--resume");
  });

  it("reanuda con --resume y sin --session-id, respetando el presupuesto restante", () => {
    const { args } = buildAgentCommand({
      task,
      sessionId: "sid-nueva",
      resume: "sid-vieja",
      usdRestante: 2.5,
    });
    expect(args).toEqual(expect.arrayContaining(["--resume", "sid-vieja"]));
    expect(args).not.toContain("--session-id");
    expect(args).toEqual(expect.arrayContaining(["--max-budget-usd", "2.5"]));
  });
});

describe("parseClaudeOutput", () => {
  const valido = JSON.stringify({
    subtype: "success",
    is_error: false,
    session_id: "abc",
    total_cost_usd: 0.42,
    usage: { input_tokens: 1000, output_tokens: 500 },
  });

  it("extrae sesión, tokens, costo y completion del JSON", () => {
    const salida = parseClaudeOutput(valido);
    expect(salida.sessionId).toBe("abc");
    expect(salida.tokensEntrada).toBe(1000);
    expect(salida.tokensSalida).toBe(500);
    expect(salida.costoUsd).toBe(0.42);
    expect(salida.detenidoPor).toBeNull();
    expect(salida.completion).toBe(true);
  });

  it("detecta corte por presupuesto y por error", () => {
    const presupuesto = parseClaudeOutput(JSON.stringify({ subtype: "error_max_budget_usd" }));
    expect(presupuesto.detenidoPor).toBe("presupuesto");
    expect(presupuesto.completion).toBe(false);
    const error = parseClaudeOutput(JSON.stringify({ is_error: true }));
    expect(error.detenidoPor).toBe("error");
  });

  it("tolera líneas de aviso antes del JSON y JSON multilínea", () => {
    const multilinea = `Aviso: algo\n${JSON.stringify(
      { subtype: "success", session_id: "x", usage: { input_tokens: 1 }, total_cost_usd: 0.1 },
      null,
      2,
    )}`;
    const salida = parseClaudeOutput(multilinea);
    expect(salida.sessionId).toBe("x");
    expect(salida.tokensEntrada).toBe(1);
    expect(salida.tokensSalida).toBeNull();
    expect(salida.costoUsd).toBe(0.1);
  });

  it("degrada a null con salida vacía o no interpretable", () => {
    for (const entrada of ["", "   ", "hola mundo", "42", "[1,2]"]) {
      const salida = parseClaudeOutput(entrada);
      expect(salida.json).toBeNull();
      expect(salida.sessionId).toBeNull();
      expect(salida.completion).toBe(false);
    }
    expect(parseClaudeOutput(null).json).toBeNull();
  });
});

describe("parseNumstat", () => {
  it("suma archivos y líneas", () => {
    expect(parseNumstat("10\t2\tsrc/a.ts\n5\t0\tsrc/b.ts\n")).toEqual({
      archivos: 2,
      inserciones: 15,
      eliminaciones: 2,
    });
  });

  it("trata binarios como 0 y vacío como cero", () => {
    expect(parseNumstat("-\t-\tpublic/img.png")).toEqual({
      archivos: 1,
      inserciones: 0,
      eliminaciones: 0,
    });
    expect(parseNumstat("")).toEqual({ archivos: 0, inserciones: 0, eliminaciones: 0 });
  });
});

describe("computeLevel", () => {
  const gatesOk = [{ resultado: "pass" }];
  const gatesFail = [{ resultado: "pass" }, { resultado: "fail" }];

  it("A: aceptación verde, gates verdes, sin reanudaciones ni intervenciones", () => {
    expect(
      computeLevel({ aceptacionPass: true, gates: gatesOk, reanudaciones: 0, intervenciones: [] }),
    ).toBe("A");
  });

  it("B: exactamente una reanudación neutral", () => {
    expect(
      computeLevel({ aceptacionPass: true, gates: gatesOk, reanudaciones: 1, intervenciones: [] }),
    ).toBe("B");
  });

  it("C: intervención humana aunque todo lo demás esté verde", () => {
    expect(
      computeLevel({
        aceptacionPass: true,
        gates: gatesOk,
        reanudaciones: 1,
        intervenciones: [{ tipo: "correccion", minuto: null, nota: "arreglé el where" }],
      }),
    ).toBe("C");
  });

  it("D: aceptación roja o cualquier gate fallido", () => {
    expect(
      computeLevel({ aceptacionPass: false, gates: gatesOk, reanudaciones: 0, intervenciones: [] }),
    ).toBe("D");
    expect(
      computeLevel({
        aceptacionPass: true,
        gates: gatesFail,
        reanudaciones: 0,
        intervenciones: [],
      }),
    ).toBe("D");
  });
});

describe("parseFlags", () => {
  it("parsea banderas simples y repetibles", () => {
    const flags = parseFlags([
      "--task",
      "e1-updated-at",
      "--run",
      "2",
      "--resume",
      "sid-vieja",
      "--usd-restante",
      "3.5",
      "--reanudaciones",
      "1",
      "--intervencion",
      "correccion:arreglé el join",
      "--incidencia",
      "caída de red",
    ]);
    expect(flags.task).toBe("e1-updated-at");
    expect(flags.run).toBe(2);
    expect(flags.resume).toBe("sid-vieja");
    expect(flags.usdRestante).toBe(3.5);
    expect(flags.reanudaciones).toBe(1);
    expect(flags.intervenciones).toEqual([
      { tipo: "correccion", minuto: null, nota: "arreglé el join" },
    ]);
    expect(flags.incidencias).toEqual(["caída de red"]);
  });

  it("sin banderas devuelve listas vacías", () => {
    expect(parseFlags([])).toEqual({ intervenciones: [], incidencias: [] });
  });

  it("falla con bandera desconocida o valor faltante", () => {
    expect(() => parseFlags(["--nope"])).toThrow(/bandera desconocida/);
    expect(() => parseFlags(["--task"])).toThrow(/falta el valor/);
  });
});

describe("cargarTarea", () => {
  it("exige --task y falla si la tarea no existe", () => {
    expect(() => cargarTarea(os.tmpdir(), "")).toThrow(/falta --task/);
    expect(() => cargarTarea(os.tmpdir(), "no-existe")).toThrow(/no existe la tarea/);
  });
});

describe("inyectarAceptacion", () => {
  function preparar() {
    const base = crearTemporal("pegm-acept-");
    const tareaDir = path.join(base, "tasks", "e1-updated-at");
    fs.mkdirSync(path.join(tareaDir, "acceptance"), { recursive: true });
    fs.writeFileSync(path.join(tareaDir, "acceptance", "spec.mjs"), "// spec", "utf8");
    const clonDir = path.join(base, "clon");
    fs.mkdirSync(clonDir, { recursive: true });
    return { base, tareaDir, clonDir };
  }

  it("copia archivos relativos preservando la ruta", () => {
    const { tareaDir, clonDir } = preparar();
    const inyectados = inyectarAceptacion({
      tareaDir,
      clonDir,
      archivos: ["acceptance/spec.mjs"],
    });
    expect(inyectados).toEqual(["acceptance/spec.mjs"]);
    expect(fs.readFileSync(path.join(clonDir, "acceptance", "spec.mjs"), "utf8")).toBe("// spec");
  });

  it("rechaza rutas absolutas, escapes fuera de la tarea y archivos inexistentes", () => {
    const { tareaDir, clonDir } = preparar();
    expect(() =>
      inyectarAceptacion({ tareaDir, clonDir, archivos: [path.resolve("/evil.mjs")] }),
    ).toThrow(/absoluta/);
    expect(() => inyectarAceptacion({ tareaDir, clonDir, archivos: ["../evil.mjs"] })).toThrow(
      /fuera de/,
    );
    expect(() =>
      inyectarAceptacion({ tareaDir, clonDir, archivos: ["acceptance/nope.mjs"] }),
    ).toThrow(/no existe el archivo/);
  });
});
