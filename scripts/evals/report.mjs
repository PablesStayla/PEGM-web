/**
 * @file report.mjs
 * @description Generador de informes para el motor de evaluación de agentes.
 * Toma los resultados de una ejecución y produce un informe Markdown listo
 * para incluir en un Pull Request.
 */

/**
 * Formatea una fecha ISO 8601 de forma legible.
 */
function formatDate(isoString) {
  if (!isoString) return "N/A";
  try {
    const d = new Date(isoString);
    return d.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return isoString;
  }
}

/**
 * Genera un informe de evaluación en formato Markdown.
 *
 * @param {Object} result - Resultado de la evaluación (según schema.mjs)
 * @returns {string} Informe en formato Markdown
 */
export function generateReport(result) {
  const lines = [];

  lines.push(`# Informe de Evaluación: ${result.taskName}`);
  lines.push("");
  lines.push(`- **ID de tarea:** \`${result.taskId}\``);
  lines.push(`- **Estado:** ${result.status === "success" ? "✅ Éxito" : "❌ Falló"}`);
  lines.push(`- **Inicio:** ${formatDate(result.startedAt)}`);
  lines.push(`- **Finalización:** ${formatDate(result.completedAt)}`);
  lines.push(`- **Duración:** ${result.durationMs} ms`);
  lines.push("");

  lines.push("## Resultado");
  lines.push(`- Mensaje: ${result.message}`);

  if (result.error) {
    lines.push(`- Error: ${result.error.message}`);
  }

  lines.push("");
  lines.push("## Pruebas");
  lines.push(`- Aprobadas: ${result.testsPassed} / ${result.testsTotal}`);

  lines.push("");
  lines.push("## Puertas de Calidad");
  lines.push(`- Aprobadas: ${result.gatesPassed} / ${result.gatesTotal}`);

  if (result.filesChanged && result.filesChanged.length > 0) {
    lines.push("");
    lines.push("## Archivos Cambiados");
    for (const file of result.filesChanged) {
      lines.push(`- \`${file}\``);
    }
  }

  lines.push("");
  lines.push("---");
  lines.push(`Generado el ${new Date().toISOString()}`);

  return lines.join("\n");
}

export { generateReport as report };
