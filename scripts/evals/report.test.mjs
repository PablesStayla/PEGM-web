import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildInforme, fmtNum, fmtUsd, generarInformes, resumenGates } from "./report.mjs";

const SHA = "623d517163e01400f029002cd565201cd9da4b3a";
const temporales = [];

afterEach(() => {
  while (temporales.length > 0) {
    fs.rmSync(temporales.pop(), { recursive: true, force: true });
  }
});

function crearRaiz() {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), "pegm-report-"));
  temporales.push(raiz);
  return raiz;
}

function gate(resultado = "pass") {
  return { comando: "pnpm lint", resultado, exit_code: 0, duracion_s: 12.5, detalle: "" };
}

function resultado(run = 1) {
  return {
    experimento: "e1-updated-at",
    run,
    task_id: "e1-updated-at",
    base_commit: SHA,
    agente: { tool: "claude", version: "2.1.291", model: "claude-sonnet-4-5", flags: [] },
    inicio: "2026-10-17T10:00:00.000Z",
    fin: "2026-10-17T10:20:00.000Z",
    duracion_min: 20.5,
    presupuesto: { usd: 5, minutos: 30 },
    clon: "/tmp/pegm-evals/e1-updated-at/run-1",
    comando_efectivo: "claude --print --output-format json",
    entorno_resumen: {},
    agente_resultado: {
      exit_code: 0,
      tokens_entrada: 12000,
      tokens_salida: 3000,
      costo_usd: 0.42,
      detenido_por: null,
      completion: true,
      session_json: null,
    },
    gates: [gate()],
    aceptacion: { pass: true, detalle: "ok", comandos: [] },
    diff: { archivos: 3, inserciones: 40, eliminaciones: 2, parche: "" },
    intervenciones: [],
    incidencias_plataforma: [],
    reanudaciones: 0,
    nivel: "A",
    notas: "",
  };
}

function baseline() {
  return {
    experimento: "e1-updated-at",
    base_commit: SHA,
    inicio: "2026-10-17T09:00:00.000Z",
    fin: "2026-10-17T09:30:00.000Z",
    gates: [gate()],
    notas: "",
  };
}

function escribirEvidencia(raiz, nombre, corridas = [resultado()], conBaseline = true) {
  const dir = path.join(raiz, "evals", "results", nombre);
  fs.mkdirSync(dir, { recursive: true });
  if (conBaseline) {
    fs.writeFileSync(
      path.join(dir, "baseline.json"),
      JSON.stringify({ ...baseline(), experimento: nombre }),
      "utf8",
    );
  }
  for (const corrida of corridas) {
    const runDir = path.join(dir, `run-${corrida.run}`);
    fs.mkdirSync(runDir, { recursive: true });
    fs.writeFileSync(
      path.join(runDir, "result.json"),
      JSON.stringify({ ...corrida, experimento: nombre }),
      "utf8",
    );
  }
}

describe("formateadores", () => {
  it("fmtNum usa decimales fijos y '—' sin dato", () => {
    expect(fmtNum(12.34)).toBe("12.3");
    expect(fmtNum(0)).toBe("0.0");
    expect(fmtNum(null)).toBe("—");
    expect(fmtNum(undefined)).toBe("—");
  });

  it("fmtUsd recorta ceros y garantiza dos decimales", () => {
    expect(fmtUsd(0.42)).toBe("$0.42");
    expect(fmtUsd(1)).toBe("$1.00");
    expect(fmtUsd(0.123456)).toBe("$0.1235");
    expect(fmtUsd(null)).toBe("—");
  });

  it("resumenGates cuenta verdes sobre total", () => {
    expect(resumenGates([])).toBe("—");
    expect(resumenGates([gate("pass"), gate("fail"), gate("pass")])).toBe("2/3");
  });
});

describe("buildInforme", () => {
  it("incluye encabezado, tabla de corridas, baseline, comparación y limitaciones", () => {
    const informe = buildInforme({
      experimento: "e1-updated-at",
      baseline: baseline(),
      corridas: [resultado()],
    });
    expect(informe).toContain("# Informe del experimento `e1-updated-at`");
    expect(informe).toContain(
      "| run-1 | pass | 1/1 | A | 20.5 | 12000 / 3000 | $0.42 | +40/−2 (3 arch.) |",
    );
    expect(informe).toContain("## Baseline (sin agente)");
    expect(informe).toContain("| `pnpm lint` | pass | 12.5 |");
    expect(informe).toContain("- Duración: 20.5 min.");
    expect(informe).toContain("- Costo: $0.42.");
    expect(informe).toContain("## Limitaciones");
    expect(informe).toContain("- Evidencia ilustrativa del escenario");
  });

  it("degrada a guiones sin corridas ni baseline", () => {
    const informe = buildInforme({ experimento: "vacio" });
    expect(informe).toContain("Sin corridas registradas todavía.");
    expect(informe).toContain("Sin baseline registrado.");
    expect(informe).toContain("- Corridas registradas: 0");
  });

  it("cuenta niveles, reanudaciones e incidencias en la narrativa", () => {
    const uno = resultado(1);
    const dos = { ...resultado(2), nivel: "B", reanudaciones: 1 };
    dos.incidencias_plataforma = ["caída de red"];
    const informe = buildInforme({ experimento: "e1", baseline: null, corridas: [uno, dos] });
    expect(informe).toContain("- Niveles: A: 1 · B: 1 · C: 0 · D: 0.");
    expect(informe).toContain("- Reanudaciones neutrales: 1 · intervenciones humanas: 0.");
    expect(informe).toContain("- Incidencia de plataforma run-2: caída de red");
  });
});

describe("generarInformes", () => {
  it("escribe evals/reports/<experimento>.md con el mismo contenido que buildInforme", () => {
    const raiz = crearRaiz();
    escribirEvidencia(raiz, "e1-updated-at", [resultado()], true);
    const escritos = generarInformes({ root: raiz });
    expect(escritos).toHaveLength(1);
    const destino = path.join(raiz, "evals", "reports", "e1-updated-at.md");
    expect(escritos[0]).toBe(destino);
    const md = fs.readFileSync(destino, "utf8");
    expect(md).toBe(
      buildInforme({ experimento: "e1-updated-at", baseline: baseline(), corridas: [resultado()] }),
    );
  });

  it("ordena las corridas por número", () => {
    const raiz = crearRaiz();
    escribirEvidencia(raiz, "e1-updated-at", [resultado(2), resultado(1)], false);
    const [destino] = generarInformes({ root: raiz, experimento: "e1-updated-at" });
    const md = fs.readFileSync(destino, "utf8");
    expect(md.indexOf("| run-1 |")).toBeLessThan(md.indexOf("| run-2 |"));
  });

  it("devuelve vacío si no existe evals/results", () => {
    const raiz = crearRaiz();
    expect(generarInformes({ root: raiz })).toEqual([]);
  });

  it("omite experimentos sin baseline ni corridas", () => {
    const raiz = crearRaiz();
    fs.mkdirSync(path.join(raiz, "evals", "results", "huerfano"), { recursive: true });
    expect(generarInformes({ root: raiz })).toEqual([]);
  });

  it("falla si el experimento pedido no existe", () => {
    const raiz = crearRaiz();
    fs.mkdirSync(path.join(raiz, "evals", "results"), { recursive: true });
    expect(() => generarInformes({ root: raiz, experimento: "no-existe" })).toThrow(
      /no existe evals\/results/,
    );
  });

  it("falla si un result.json declara otro experimento", () => {
    const raiz = crearRaiz();
    escribirEvidencia(raiz, "e1-updated-at", [resultado()], false);
    const archivo = path.join(raiz, "evals", "results", "e1-updated-at", "run-1", "result.json");
    fs.writeFileSync(archivo, JSON.stringify({ ...resultado(), experimento: "otro" }), "utf8");
    expect(() => generarInformes({ root: raiz })).toThrow(/declara experimento "otro"/);
  });
});
