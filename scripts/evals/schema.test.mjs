import { describe, expect, it } from "vitest";
import { BaselineSchema, ResultadoSchema, TareaSchema } from "./schema.mjs";

const SHA = "623d517163e01400f029002cd565201cd9da4b3a";

function tareaBase() {
  return {
    id: "e1-updated-at",
    titulo: "Persistir updatedAt por sección",
    base_commit: SHA,
    agente: {
      tool: "claude",
      model: "claude-sonnet-4-5",
      flags: ["--permission-mode", "bypassPermissions"],
    },
    presupuesto: { usd: 5, minutos: 30 },
    gates: ["pnpm lint"],
    aceptacion: { archivos: ["acceptance/spec.mjs"], comandos: ["node acceptance/spec.mjs"] },
    reanudaciones_neutrales_max: 1,
  };
}

function resultadoBase() {
  return {
    experimento: "e1-updated-at",
    run: 1,
    task_id: "e1-updated-at",
    base_commit: SHA,
    agente: { tool: "claude", version: "2.1.291", model: "claude-sonnet-4-5", flags: [] },
    inicio: "2026-10-17T10:00:00.000Z",
    fin: "2026-10-17T10:20:00.000Z",
    duracion_min: 20.5,
    presupuesto: { usd: 5, minutos: 30 },
    clon: "/tmp/pegm-evals/e1-updated-at/run-1",
    comando_efectivo: "claude --print --output-format json",
    entorno_resumen: { TURSO_DATABASE_URL: "<ausente a propósito>" },
    agente_resultado: {
      exit_code: 0,
      tokens_entrada: 12000,
      tokens_salida: 3000,
      costo_usd: 0.42,
      detenido_por: null,
      completion: true,
      session_json: { subtype: "success" },
    },
    gates: [
      { comando: "pnpm lint", resultado: "pass", exit_code: 0, duracion_s: 12.5, detalle: "" },
    ],
    aceptacion: {
      pass: true,
      detalle: "todos los comandos terminaron en 0",
      comandos: [
        { comando: "node acceptance/spec.mjs", exit_code: 0, duracion_s: 8, salida_tail: "" },
      ],
    },
    diff: { archivos: 3, inserciones: 40, eliminaciones: 2, parche: "diff --git a b" },
    intervenciones: [],
    incidencias_plataforma: [],
    reanudaciones: 0,
    nivel: "A",
    notas: "",
  };
}

describe("TareaSchema", () => {
  it("acepta una tarea mínima y aplica defaults", () => {
    const tarea = TareaSchema.parse(tareaBase());
    expect(tarea.id).toBe("e1-updated-at");
    expect(tarea.aceptacion.timeout_min).toBe(8);
    expect(tarea.notas).toBe("");
    expect(tarea.agente.flags).toEqual(["--permission-mode", "bypassPermissions"]);
  });

  it("rechaza base_commit que no es SHA completo de 40 hex", () => {
    expect(() => TareaSchema.parse({ ...tareaBase(), base_commit: "abc123" })).toThrow();
    expect(() => TareaSchema.parse({ ...tareaBase(), base_commit: SHA.toUpperCase() })).toThrow();
  });

  it("rechaza reanudaciones_neutrales_max fuera de 0|1", () => {
    expect(() => TareaSchema.parse({ ...tareaBase(), reanudaciones_neutrales_max: 2 })).toThrow();
  });

  it("exige gates y aceptación no vacíos", () => {
    expect(() => TareaSchema.parse({ ...tareaBase(), gates: [] })).toThrow();
    const base = tareaBase();
    expect(() =>
      TareaSchema.parse({ ...base, aceptacion: { ...base.aceptacion, archivos: [] } }),
    ).toThrow();
    expect(() =>
      TareaSchema.parse({ ...base, aceptacion: { ...base.aceptacion, comandos: [] } }),
    ).toThrow();
  });

  it("exige presupuesto positivo", () => {
    expect(() =>
      TareaSchema.parse({ ...tareaBase(), presupuesto: { usd: 0, minutos: 30 } }),
    ).toThrow();
    expect(() =>
      TareaSchema.parse({ ...tareaBase(), presupuesto: { usd: 5, minutos: -1 } }),
    ).toThrow();
  });
});

describe("ResultadoSchema", () => {
  it("acepta un resultado completo", () => {
    const resultado = ResultadoSchema.parse(resultadoBase());
    expect(resultado.nivel).toBe("A");
    expect(resultado.agente_resultado.tokens_entrada).toBe(12000);
    expect(resultado.diff.inserciones).toBe(40);
  });

  it("admite null en tokens, costo y detenido_por", () => {
    const base = resultadoBase();
    base.agente_resultado.tokens_entrada = null;
    base.agente_resultado.tokens_salida = null;
    base.agente_resultado.costo_usd = null;
    base.agente_resultado.detenido_por = "presupuesto";
    const resultado = ResultadoSchema.parse(base);
    expect(resultado.agente_resultado.costo_usd).toBeNull();
    expect(resultado.agente_resultado.detenido_por).toBe("presupuesto");
  });

  it("rechaza nivel o detenido_por fuera del enum", () => {
    expect(() => ResultadoSchema.parse({ ...resultadoBase(), nivel: "E" })).toThrow();
    const base = resultadoBase();
    base.agente_resultado.detenido_por = "otro";
    expect(() => ResultadoSchema.parse(base)).toThrow();
  });

  it("rechaza campos faltantes o mal tipados", () => {
    const base = resultadoBase();
    delete base.gates;
    expect(() => ResultadoSchema.parse(base)).toThrow();
    const otra = resultadoBase();
    otra.agente_resultado.tokens_salida = 1.5;
    expect(() => ResultadoSchema.parse(otra)).toThrow();
  });
});

describe("BaselineSchema", () => {
  it("acepta un baseline válido", () => {
    const baseline = BaselineSchema.parse({
      experimento: "e1-updated-at",
      base_commit: SHA,
      inicio: "2026-10-17T09:00:00.000Z",
      fin: "2026-10-17T09:30:00.000Z",
      gates: [
        { comando: "pnpm build", resultado: "pass", exit_code: 0, duracion_s: 95, detalle: "" },
      ],
      notas: "",
    });
    expect(baseline.gates).toHaveLength(1);
  });
});
