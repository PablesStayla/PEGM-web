import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  assertInside,
  buildAgentCommand,
  cargarTarea,
  computeEstado,
  computeLevel,
  construirLanzamiento,
  inyectarAceptacion,
  parseClaudeOutput,
  parseComando,
  parseFlags,
  parseNumstat,
  resumenEntorno,
  sanitizeEnv,
  validarToken,
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

function escribirTarea(raiz, id, sobre = {}) {
  const base = {
    id,
    titulo: "tarea de prueba",
    base_commit: "623d517163e01400f029002cd565201cd9da4b3a",
    agente: {
      tool: "claude",
      model: "claude-sonnet-4-5",
      flags: ["--permission-mode", "bypassPermissions"],
    },
    presupuesto: { usd: 5, minutos: 30 },
    gates: ["pnpm lint"],
    aceptacion: { archivos: ["acceptance/spec.mjs"], comandos: ["node acceptance/spec.mjs"] },
    reanudaciones_neutrales_max: 1,
    ...sobre,
  };
  const dir = path.join(raiz, "evals", "tasks", id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "task.json"), JSON.stringify(base), "utf8");
}

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

  it("rechaza un --resume con caracteres no permitidos", () => {
    expect(() => buildAgentCommand({ task, sessionId: "sid-123", resume: "sid;rm -rf /" })).toThrow(
      /no permitido/,
    );
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

describe("computeEstado", () => {
  const gateOk = () => ({ resultado: "pass", motivo: "exit" });
  const gateFallido = (motivo = "exit") => ({ resultado: "fail", motivo });
  const comandoOk = () => ({ exit_code: 0, motivo: "exit" });
  const base = () => ({
    corrida: { error: null, timedOut: false },
    salida: { detenidoPor: null, completion: true },
    gates: [gateOk()],
    aceptacion: { pass: true, comandos: [comandoOk()] },
  });

  it("passed: todo verde y agente completo", () => {
    expect(computeEstado(base())).toBe("passed");
  });

  it("failed: gate rojo o aceptación roja con comandos ejecutados", () => {
    expect(computeEstado({ ...base(), gates: [gateOk(), gateFallido()] })).toBe("failed");
    expect(
      computeEstado({
        ...base(),
        aceptacion: { pass: false, comandos: [{ exit_code: 1, motivo: "exit" }] },
      }),
    ).toBe("failed");
  });

  it("timeout: lo marca el runner o un comando individual", () => {
    expect(computeEstado({ ...base(), corrida: { error: null, timedOut: true } })).toBe("timeout");
    expect(computeEstado({ ...base(), gates: [gateFallido("timeout")] })).toBe("timeout");
  });

  it("budget_exceeded: el CLI se detuvo por presupuesto", () => {
    expect(
      computeEstado({ ...base(), salida: { detenidoPor: "presupuesto", completion: false } }),
    ).toBe("budget_exceeded");
  });

  it("incomplete: el agente no completó sin otra causa de mayor jerarquía", () => {
    expect(computeEstado({ ...base(), salida: { detenidoPor: null, completion: false } })).toBe(
      "incomplete",
    );
  });

  it("not_executed: gates o aceptación vacíos", () => {
    expect(computeEstado({ ...base(), gates: [] })).toBe("not_executed");
    expect(computeEstado({ ...base(), aceptacion: { pass: false, comandos: [] } })).toBe(
      "not_executed",
    );
  });

  it("infrastructure_error: error de spawn o señal en cualquier comando", () => {
    expect(computeEstado({ ...base(), corrida: { error: "ENOENT", timedOut: false } })).toBe(
      "infrastructure_error",
    );
    expect(computeEstado({ ...base(), gates: [gateFallido("spawn")] })).toBe(
      "infrastructure_error",
    );
    expect(
      computeEstado({
        ...base(),
        aceptacion: { pass: false, comandos: [{ exit_code: null, motivo: "signal" }] },
      }),
    ).toBe("infrastructure_error");
  });

  it("precedencia: infraestructura > timeout > presupuesto", () => {
    expect(
      computeEstado({
        ...base(),
        corrida: { error: "ENOENT", timedOut: true },
        salida: { detenidoPor: "presupuesto", completion: false },
      }),
    ).toBe("infrastructure_error");
    expect(
      computeEstado({
        ...base(),
        corrida: { error: null, timedOut: true },
        salida: { detenidoPor: "presupuesto", completion: false },
      }),
    ).toBe("timeout");
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

describe("validarToken", () => {
  it("acepta tokens del dominio real (modelo, rutas del repo, banderas)", () => {
    const tokens = ["claude-sonnet-4-5", "acceptance/spec.mjs", "--config=a/b.ts", "test:e2e"];
    for (const token of tokens) expect(validarToken(token)).toBe(token);
  });

  it("rechaza metacaracteres de shell, rutas absolutas y traversal", () => {
    expect(() => validarToken("con espacio")).toThrow(/no permitido/);
    expect(() => validarToken("a&&b")).toThrow(/no permitido/);
    expect(() => validarToken("/etc/passwd")).toThrow(/ruta absoluta o traversal/);
    expect(() => validarToken("C:/windows")).toThrow(/ruta absoluta o traversal/);
    expect(() => validarToken("../fuera.mjs")).toThrow(/ruta absoluta o traversal/);
  });
});

describe("parseComando", () => {
  it("convierte comandos del repo en ejecutable + args", () => {
    expect(parseComando("pnpm test:e2e")).toEqual({ exe: "pnpm", args: ["test:e2e"] });
    expect(parseComando("node acceptance/check.mjs")).toEqual({
      exe: "node",
      args: ["acceptance/check.mjs"],
    });
  });

  it("rechaza ejecutables fuera de la allowlist y comandos vacíos", () => {
    expect(() => parseComando("npm install")).toThrow(/ejecutable no permitido "npm"/);
    expect(() => parseComando("rm -rf /")).toThrow(/ejecutable no permitido/);
    expect(() => parseComando("   ")).toThrow(/comando vacío/);
  });

  it("rechaza concatenación de shell, rutas absolutas y traversal", () => {
    expect(() => parseComando("pnpm lint && rm -rf /")).toThrow(/no permitido/);
    expect(() => parseComando('pnpm lint "x"')).toThrow(/no permitido/);
    expect(() => parseComando("node /evil.mjs")).toThrow(/ruta absoluta o traversal/);
    expect(() => parseComando("node ../evil.mjs")).toThrow(/ruta absoluta o traversal/);
  });
});

describe("construirLanzamiento", () => {
  it("en POSIX lanza el ejecutable directo", () => {
    expect(construirLanzamiento("pnpm", ["lint"], "linux")).toEqual({
      comando: "pnpm",
      args: ["lint"],
    });
  });

  it("en Windows envuelve en ComSpec con /d /s /c (pnpm.cmd no es ejecutable directo)", () => {
    expect(construirLanzamiento("pnpm", ["lint"], "win32", "cmd.exe")).toEqual({
      comando: "cmd.exe",
      args: ["/d", "/s", "/c", "pnpm", "lint"],
    });
    expect(construirLanzamiento("claude", [], "win32", null)).toEqual({
      comando: "cmd.exe",
      args: ["/d", "/s", "/c", "claude"],
    });
  });
});

describe("cargarTarea", () => {
  it("exige --task y falla si la tarea no existe", () => {
    expect(() => cargarTarea(os.tmpdir(), "")).toThrow(/falta --task/);
    expect(() => cargarTarea(os.tmpdir(), "no-existe")).toThrow(/no existe la tarea/);
  });

  it("acepta una tarea válida", () => {
    const raiz = crearTemporal("pegm-tarea-");
    escribirTarea(raiz, "t1");
    expect(cargarTarea(raiz, "t1").tarea.id).toBe("t1");
  });

  it("rechaza gates con concatenación de shell o ejecutable no permitido", () => {
    const raiz = crearTemporal("pegm-tarea-");
    escribirTarea(raiz, "t2", { gates: ["pnpm lint && rm -rf /"] });
    expect(() => cargarTarea(raiz, "t2")).toThrow(/no permitido/);
    escribirTarea(raiz, "t3", { gates: ["npm install"] });
    expect(() => cargarTarea(raiz, "t3")).toThrow(/ejecutable no permitido "npm"/);
  });

  it("rechaza comandos de aceptación con traversal", () => {
    const raiz = crearTemporal("pegm-tarea-");
    escribirTarea(raiz, "t4", {
      aceptacion: { archivos: ["acceptance/spec.mjs"], comandos: ["node ../evil.mjs"] },
    });
    expect(() => cargarTarea(raiz, "t4")).toThrow(/ruta absoluta o traversal/);
  });

  it("rechaza tool o flags del agente con caracteres prohibidos", () => {
    const raiz = crearTemporal("pegm-tarea-");
    escribirTarea(raiz, "t5", {
      agente: { tool: "claude;rm -rf /", model: "claude-sonnet-4-5", flags: [] },
    });
    expect(() => cargarTarea(raiz, "t5")).toThrow(/no permitido/);
    escribirTarea(raiz, "t6", {
      agente: { tool: "claude", model: "claude-sonnet-4-5", flags: ["--ok", "mal flag"] },
    });
    expect(() => cargarTarea(raiz, "t6")).toThrow(/no permitido/);
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
