/**
 * Logging silencioso. En producción no escribe nada: los catch de
 * degradación elegante no deben inundar los logs de Vercel.
 */
export function quiet(error: unknown, context: string): void {
  if (process.env.NODE_ENV !== "development") return;
  console.warn(`[pegm] ${context}:`, error);
}
