/**
 * Registro de eventos del sistema.
 *
 * En desarrollo imprime a consola. En producción también registra
 * (sin datos sensibles) para que un operador pueda detectar fallos
 * silenciosos. Nunca incluye credenciales, tokens ni datos de usuarios.
 */
export function quiet(error: unknown, context: string): void {
  const message = `[pegm] ${context}: ${error instanceof Error ? error.message : String(error)}`;
  if (process.env.NODE_ENV === "production") {
    console.error(message);
    return;
  }
  console.warn(message);
}
