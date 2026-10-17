/**
 * @file schemas.mjs
 * @description Esquemas de validación para el motor de evaluación de agentes (Agent Evals).
 * Define las estructuras de datos para resultados, tareas, y verificaciones independientes.
 * Todos los esquemas son puros (sin dependencias de Node.js específicas del entorno).
 */

import { z } from "zod";

/**
 * Resultado de una tarea individual ejecutada por un agente.
 */
export const TaskResultSchema = z.object({
  /** Identificador único de la tarea (ej. "E1", "E2") */
  taskId: z.string(),
  /** Nombre descriptivo de la tarea */
  taskName: z.string(),
  /** Estado final de la tarea */
  status: z.enum(["success", "failure", "skipped", "error"]),
  /** Hora de inicio (ISO 8601) */
  startedAt: z.string().datetime(),
  /** Hora de finalización (ISO 8601) */
  completedAt: z.string().datetime(),
  /** Duración en milisegundos */
  durationMs: z.number().int().nonnegative(),
  /** Mensaje descriptivo del resultado */
  message: z.string(),
  /** Evidencia de archivos modificados (rutas relativas al repo) */
  filesChanged: z.array(z.string()).default([]),
  /** Pruebas que pasaron / total */
  testsPassed: z.number().int().nonnegative().default(0),
  testsTotal: z.number().int().nonnegative().default(0),
  /** Puertas de calidad que pasaron / total */
  gatesPassed: z.number().int().nonnegative().default(0),
  gatesTotal: z.number().int().nonnegative().default(0),
  /** Error si la tarea falló */
  error: z.string().optional(),
  /** Tiempo de intervención humana en minutos (opcional) */
  humanInterventionMinutes: z.number().int().nonnegative().optional(),
  /** Tokens consumidos (si el proveedor los expone) */
  tokensUsed: z.number().int().nonnegative().optional(),
  /** Costo en USD (si el proveedor lo expone) */
  costUsd: z.number().nonnegative().optional(),
});

/**
 * Resultado completo de una ejecución de evaluación.
 */
export const EvaluationResultSchema = z.object({
  /** Identificador único de la ejecución */
  runId: z.string(),
  /** Identificador de la tarea */
  taskId: z.string(),
  /** Nombre de la tarea */
  taskName: z.string(),
  /** Commit base sobre el cual se ejecutó */
  baseCommit: z.string(),
  /** Versión del agente utilizado */
  agentVersion: z.string(),
  /** Modelo utilizado */
  model: z.string(),
  /** Fecha y hora de inicio (ISO 8601) */
  startedAt: z.string().datetime(),
  /** Fecha y hora de finalización (ISO 8601) */
  completedAt: z.string().datetime(),
  /** Duración total en milisegundos */
  durationMs: z.number().int().nonnegative(),
  /** Resultado general */
  status: z.enum(["success", "failure", "error"]),
  /** Resultado detallado de la tarea */
  taskResult: TaskResultSchema,
  /** Error si la ejecución falló */
  error: z.string().optional(),
  /** Presupuesto configurado en USD */
  budgetUsd: z.number().nonnegative().optional(),
  /** Costo real en USD */
  costUsd: z.number().nonnegative().optional(),
  /** Tokens de entrada */
  tokensInput: z.number().int().nonnegative().optional(),
  /** Tokens de salida */
  tokensOutput: z.number().int().nonnegative().optional(),
  /** Número de intervenciones humanas */
  humanInterventions: z.number().int().nonnegative().default(0),
  /** Detalles de intervenciones humanas */
  humanInterventionNotes: z.array(z.string()).default([]),
  /** Limites de tiempo y costo */
  limits: z
    .object({
      maxTimeMinutes: z.number().int().positive(),
      maxCostUsd: z.number().nonnegative(),
    })
    .optional(),
  /** Si se excedió algún límite */
  limitsExceeded: z.boolean().default(false),
});

/**
 * Resultado de una verificación independiente.
 */
export const VerificationResultSchema = z.object({
  /** Nombre de la verificación */
  name: z.string(),
  /** Resultado */
  passed: z.boolean(),
  /** Mensaje descriptivo */
  message: z.string(),
  /** Evidencia (rutas de archivos, capturas, etc.) */
  evidence: z.array(z.string()).default([]),
  /** Detalles adicionales */
  details: z.record(z.string(), z.unknown()).default({}),
});

/**
 * Resultado completo de una evaluación completa.
 */
export const EvaluationSummarySchema = z.object({
  runId: z.string(),
  taskId: z.string(),
  taskName: z.string(),
  success: z.boolean(),
  gatesPassed: z.number().int().nonnegative(),
  gatesTotal: z.number().int().nonnegative(),
  testsPassed: z.number().int().nonnegative(),
  testsTotal: z.number().int().nonnegative(),
  defectsIntroduced: z.number().int().nonnegative().default(0),
  humanInterventions: z.number().int().nonnegative().default(0),
  costUsd: z.number().nonnegative().optional(),
  durationMs: z.number().int().nonnegative(),
  verifications: z.array(VerificationResultSchema).default([]),
  errors: z.array(z.string()).default([]),
});

export type SeedCredentialsError = z.infer<typeof SeedCredentialsSchema>;
export type TaskResult = z.infer<typeof TaskResultSchema>;
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;
export type VerificationResult = z.infer<typeof VerificationResultSchema>;
export type EvaluationSummary = z.infer<typeof EvaluationSummarySchema>;
