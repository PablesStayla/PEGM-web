// Warmup de compilación de rutas: `next dev` compila on-demand; sin esto,
// la primera interacción de cada zona puede agotar tiempos de espera.
const PUERTO = Number(process.env.ACEPTACION_PORT ?? 3200);
const BASE = `http://localhost:${PUERTO}`;

const RUTAS = [
  "/",
  "/admin/login",
  "/experiencia",
  "/admin",
  "/admin/experiencia",
  "/admin/educacion",
  "/admin/habilidades",
  "/admin/mensajes",
];

export default async function warmup(): Promise<void> {
  for (const ruta of RUTAS) {
    try {
      await fetch(`${BASE}${ruta}`, {
        redirect: "manual",
        signal: AbortSignal.timeout(120_000),
      });
    } catch {
      // Best-effort: el objetivo es calentar compilación, no fallar aquí.
      console.log(`[warmup] sin respuesta aún para ${ruta}`);
    }
  }
}
