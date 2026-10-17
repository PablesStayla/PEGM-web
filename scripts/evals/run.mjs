/**
 * @file run.mjs
 * @description Ejecutor de tareas para el harness de evaluación de agentes.
 * Ejecuta una tarea aislada, corre los quality gates y devuelve un resultado
 * estructurado que puede ser consumido por el informe.
 */

import { execSync } from "node:child_process";

/**
 * Ejecuta un comando de shell y captura su salida.
 *
 * @param {string} cmd - Comando a ejecutar.
 * @param {string} cwd - Directorio de trabajo.
 * @returns {Promise<{stdout: string, stderr: string, code: number}>}
 */
function exec(cmd, cwd) {
  try {
    const result = execSync(cmd, {
      cwd,
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024, // 10 MB
    });
    return { stdout: result.stdout, stderr: result.stderr, code: 0 };
  } catch (error) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || error.message,
      code: error.code ?? 1,
    };
  }
}

/**
 * Ejecuta una tarea de evaluación.
 *
 * @param {Object} params - Parámetros de ejecución.
 * @param {string} params.taskId - Identificador de la tarea (ej. "E1").
 * @param {string} params.taskName - Nombre descriptivo de la tarea.
 * @param {string} params.command - Comando a ejecutar.
 * @param {string} params.cwd - Directorio de trabajo (por defecto process.cwd()).
 * @param {Object} params.options - Opciones adicionales.
 * @param {number} params.options.timeoutMs - Tiempo límite en ms (por defecto 300000 = 5 min).
 * @returns {Promise<Object>}
 */
export async function runTask({ taskId, taskName, command, cwd = process.cwd() }) {
  const startedAt = new Date().toISOString();
  const startTime = Date.now();

  // Ejecutar el comando
  const result = exec(command, cwd);

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Ejecutar quality gates si el comando terminó
  let gatesPassed = 0;
  let gatesTotal = 0;
  const testsPassed = 0;
  const testsTotal = 0;

  if (result.code === 0) {
    // Ejecutar gates de calidad
    const lintResult = exec("pnpm lint", cwd);
    if (lintResult.code === 0) gatesPassed++;
    gatesTotal++;

    const testResult = exec("pnpm test", cwd);
    if (testResult.code === 0) gatesPassed++;
    gatesTotal++;

    const typeCheckResult = exec("pnpm run type-check", cwd);
    if (typeCheckResult.code === 0) gatesPassed++;
    gatesTotal++;
  }

  return {
    taskId,
    taskName,
    status: result.code === 0 ? "success" : "failure",
    startedAt,
    completedAt: new Date().toISOString(),
    durationMs,
    message:
      result.code === 0 ? "Tarea completada exitosamente" : `Tarea falló con código ${result.code}`,
    throw: result.code !== 0 ? new Error(`Tarea falló con código ${result.code}`) : undefined,
    filesChanged: [], // Se podría llenar con git diff
    testsPassed,
    testsTotal,
    gatesPassed,
    gatesTotal,
  };
}

export { runTask as run };
