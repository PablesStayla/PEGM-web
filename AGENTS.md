# AGENTS.md — Guía para agentes de IA

Instrucciones para cualquier agente (Claude, Codex, Cursor, Gemini…) que trabaje
en este repositorio. Léela completa antes de tocar código.

## El proyecto

Sitio personal de **Pablo Garrido — Ingeniero Civil Metalúrgico** (español, estética
minimalista clara: papel cálido, serif Fraunces, acento cobre) con panel de
administración propio y laboratorio interactivo de metalurgia.

## Stack (no cambiar de tooling)

- **Next.js 16** (App Router, Turbopack, Server Actions, `proxy.ts`) · **React 19** · **TypeScript 7**
- **Tailwind CSS 4** — el tema vive en `src/app/globals.css` (`@theme` + `.dark`, variables CSS)
- **Drizzle ORM** + **libSQL/Turso** · **Biome** (lint + format) · **Vitest** · **Playwright**
- **npm** — nunca pnpm/yarn. Sin monorepo ni turbo.

## Comandos

```bash
npm run dev          # desarrollo en :3000
npm run lint         # biome (src scripts tests) — debe pasar siempre
npm test             # vitest (pruebas unitarias)
npm run test:e2e     # playwright (pruebas E2E)
npm run type-check   # tsc --noEmit
npm run build        # build de producción
```

Todo lo anterior debe quedar en verde antes de commitear.

## Base de datos — tres modos (`src/db/index.ts`)

1. `TURSO_DATABASE_URL=libsql://…` + `TURSO_AUTH_TOKEN` → **Turso** (producción).
2. `TURSO_DATABASE_URL=file:ruta` → SQLite en ruta explícita (así corre la suite E2E).
3. Sin variables → `data/site.db` local (se crea, migra y siembra sola).

- Migraciones (`drizzle/`) y semilla (`src/db/seed.ts`) son idempotentes: se aplican en el primer arranque, no requieren pasos manuales.
- **Nunca editar ni commitear** `data/*.db` (está en .gitignore). La suite E2E borra `data/e2e.db` en cada corrida — lo hace el comando del `webServer` en `playwright.config.ts`; no mover esa limpieza a `globalSetup` (crea una carrera con el health-check de Playwright que corrompe la BD).
- SQLite local corre con `journal_mode=WAL` + `busy_timeout` (necesario bajo la concurrencia del dev server). Turso remoto no lleva PRAGMAs.

## Convenciones de código

- UI 100 % en **español** (es-CL), tono profesional.
- Comentarios de código en español.
- Biome: comillas dobles, punto y coma, 100 columnas → `npx biome check --write .`
- La capa de datos (`src/lib/data.ts`) es **async en todo el contrato**; primero `const db = await getDb()`, luego las consultas.
- Nada de `Math.random()`/`Date.now()` en el primer render de componentes cliente: rompe la hidratación SSR (referencia: `src/components/lab/live-dashboard.tsx`).

## Pruebas E2E (`tests/e2e/`)

- Servidor propio en el puerto **3100** con BD aislada. `globalSetup` pre-compila rutas — no quitarlo (evita carreras de Turbopack).
- **2 workers** máximo: más workers hacen inestable `next dev` (compilación on-demand a mitad de test).
- Entornos sin acceso al CDN de Playwright (sandboxes): definir `PLAYWRIGHT_CHROMIUM_EXECUTABLE` con la ruta de un binario Chromium compatible (misma versión mayor) — el config lo inyecta como `executablePath`.
- Tras `page.goto` en dev, esperar hidratación antes de interactuar: helper `appReady()` (`networkidle`).
- Para ejercer la validación Zod del **servidor**, saltar la nativa del navegador: helper `submitBypassingNativeValidation()`.
- Cambios en la BD que deban verse en páginas públicas: confiar en la revalidación on-demand (`revalidatePath` en las server actions) — no añadir polling.

## Producción

- Guía completa de despliegue: **[DEPLOY.md](./DEPLOY.md)** (Vercel + Turso, ~15 min, $0).
- `AUTH_SECRET` es **obligatoria** en producción: `src/lib/auth.ts` lanza a propósito si falta. No suavizar ese guard.
- `NEXT_PUBLIC_SITE_URL` alimenta sitemap, robots, canonical, OG y JSON-LD (`src/lib/site.ts`). En local tiene default; en Vercel debe definirse.
- Imagen OG (`src/app/opengraph-image.tsx`): satori **no soporta woff2** — Fraunces va embebida en base64 (`src/app/og-font.ts`). Regla de satori: todo `<div>` con más de un hijo necesita `display` explícito.
- Headers de seguridad HTTP solo se activan en build de producción (`next.config.ts`) — no esperarlos en `next dev`.
