/**
 * Preparación global de la suite E2E.
 *
 * La base de datos de pruebas se limpia en el propio comando del `webServer`
 * (ver playwright.config.ts), antes de que Next arranque, para evitar carreras
 * con el health-check de Playwright.
 *
 * Aquí solo se "calientan" las rutas: con Turbopack la primera visita compila
 * la ruta bajo demanda; hacerlo secuencialmente aquí evita que esa compilación
 * ocurra a mitad de un test con varios workers navegando a la vez. El primer
 * arranque también aplica migraciones y siembra el contenido inicial.
 */

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3100";

const RUTAS = [
  "/",
  "/cv",
  "/proyectos",
  "/proyectos/optimizacion-circuito-flotacion-colectiva",
  "/laboratorio",
  "/admin/login",
];

async function calentar(url: string, intentos = 60): Promise<void> {
  for (let i = 1; i <= intentos; i++) {
    try {
      const respuesta = await fetch(url, { redirect: "follow" });
      // 5xx = la ruta todavía compila; reintentar
      if (respuesta.ok) return;
    } catch {
      // servidor aún levantando (o reiniciando): reintentar
    }
    await new Promise((resolver) => setTimeout(resolver, 1000));
  }
  throw new Error(`La ruta ${url} no respondió correctamente tras ${intentos} intentos`);
}

export default async function globalSetup(): Promise<void> {
  for (const ruta of RUTAS) {
    await calentar(`${BASE_URL}${ruta}`);
  }
}
