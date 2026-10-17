/**
 * @file schema.mjs
 * @description Esquemas Zod del sistema de evals (spec §4.4 y §4.5).
 *
 * Son la fuente de verdad de la corrida: un campo faltante o inválido invalida
 * la corrida entera en lugar de producir evidencia silenciosamente incorrecta.
 * Regla de datos faltantes (spec §4.5): si el proveedor no expone tokens o
 * costo, el campo queda `null` y la razón se anota en `notas`.
 */

import { z } from "zod";

const shaCompleto = z
  .string()
  .regex(/^[0-9a-f]{40}$/, "debe ser un SHA completo de 40 caracteres hexadecimales");

export const AgenteSchema = z.object({
  tool: z.string().min(1),
  model: z.string().min(1),
  flags: z.array(z.string()).default([]),
});

export const PresupuestoSchema = z.object({
  usd: z.number().positive(),
  minutos: z.number().positive(),
});

export const AceptacionTareaSchema = z.object({
  // Rutas relativas a la carpeta de la tarea (p. ej. "acceptance/spec.ts");
  // se copian al clon después del agente y de los gates (spec §5).
  archivos: z.array(z.string().min(1)).min(1),
  comandos: z.array(z.string().min(1)).min(1),
  timeout_min: z.number().positive().default(8),
});

export const TareaSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  base_commit: shaCompleto,
  agente: AgenteSchema,
  presupuesto: PresupuestoSchema,
  gates: z.array(z.string().min(1)).min(1),
  aceptacion: AceptacionTareaSchema,
  reanudaciones_neutrales_max: z.union([z.literal(0), z.literal(1)]),
  notas: z.string().default(""),
});

/** Estados explícitos de una corrida (auditoría: fallo real vs ruido operativo). */
export const ESTADOS_CORRIDA = [
  "passed",
  "failed",
  "timeout",
  "budget_exceeded",
  "infrastructure_error",
  "incomplete",
  "not_executed",
];

/** Por qué terminó un comando: salida normal, spawn fallido, timeout o señal. */
export const MOTIVOS_COMANDO = ["exit", "spawn", "timeout", "signal"];

export const GateResultadoSchema = z.object({
  comando: z.string(),
  resultado: z.enum(["pass", "fail", "skip"]),
  exit_code: z.number().int().nullable(),
  duracion_s: z.number().nonnegative().nullable(),
  motivo: z.enum(MOTIVOS_COMANDO),
  detalle: z.string(),
});

export const AceptacionResultadoSchema = z.object({
  pass: z.boolean(),
  detalle: z.string(),
  comandos: z.array(
    z.object({
      comando: z.string(),
      exit_code: z.number().int().nullable(),
      duracion_s: z.number().nonnegative().nullable(),
      motivo: z.enum(MOTIVOS_COMANDO),
      salida_tail: z.string(),
    }),
  ),
});

export const ResultadoSchema = z.object({
  experimento: z.string().min(1),
  run: z.number().int().positive(),
  task_id: z.string().min(1),
  base_commit: z.string().min(1),
  agente: z.object({
    tool: z.string(),
    version: z.string().nullable(),
    model: z.string(),
    flags: z.array(z.string()),
  }),
  inicio: z.string(),
  fin: z.string(),
  duracion_min: z.number().nonnegative().nullable(),
  presupuesto: PresupuestoSchema,
  clon: z.string(),
  comando_efectivo: z.string(),
  entorno_resumen: z.record(z.string(), z.string()),
  agente_resultado: z.object({
    exit_code: z.number().int().nullable(),
    tokens_entrada: z.number().int().nullable(),
    tokens_salida: z.number().int().nullable(),
    costo_usd: z.number().nullable(),
    detenido_por: z.enum(["tiempo", "presupuesto", "error", "interrupcion"]).nullable(),
    completion: z.boolean(),
    session_json: z.record(z.string(), z.unknown()).nullable(),
  }),
  gates: z.array(GateResultadoSchema),
  aceptacion: AceptacionResultadoSchema,
  diff: z.object({
    archivos: z.number().int().nonnegative(),
    inserciones: z.number().int().nonnegative(),
    eliminaciones: z.number().int().nonnegative(),
    parche: z.string(),
  }),
  intervenciones: z.array(
    z.object({
      tipo: z.string(),
      minuto: z.number().nullable(),
      nota: z.string(),
    }),
  ),
  incidencias_plataforma: z.array(z.string()),
  reanudaciones: z.number().int().nonnegative(),
  nivel: z.enum(["A", "B", "C", "D"]),
  estado: z.enum(ESTADOS_CORRIDA),
  notas: z.string(),
});

export const BaselineSchema = z.object({
  experimento: z.string().min(1),
  base_commit: z.string().min(1),
  inicio: z.string(),
  fin: z.string(),
  gates: z.array(GateResultadoSchema),
  notas: z.string(),
});
