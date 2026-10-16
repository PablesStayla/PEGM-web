# AGENTS.md — Guía para agentes de IA

Instrucciones para cualquier agente (Claude, Codex, Cursor, Gemini…) que trabaje
en este repositorio. Léela completa antes de tocar código.

## El proyecto

Sitio personal de **Pablo — Ingeniero Civil Metalúrgico** (español, estética
minimalista clara: papel cálido, serif Fraunces, acento cobre) con panel de
administración propio y laboratorio interactivo de metalurgia.

## Stack (no cambiar de tooling)

- **Next.js 16** (App Router, Turbopack, Server Actions, `proxy.ts`) · **React 19** · **TypeScript 7**
- **Tailwind CSS 4** — el tema vive en `src/app/globals.css` (`@theme` + `.dark`, variables CSS)
- **Drizzle ORM** + **libSQL/Turso** · **Biome** (lint + format) · **Vitest** · **Playwright**
- **pnpm** — nunca npm/yarn (gestor fijado en `packageManager`). Sin monorepo ni turbo.

## Comandos

```bash
pnpm dev          # desarrollo en :3000
pnpm lint         # biome (src scripts tests) — debe pasar siempre
pnpm test         # vitest (pruebas unitarias)
pnpm test:e2e     # playwright (pruebas E2E)
pnpm type-check   # tsc --noEmit
pnpm build        # build de producción
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
- Biome: comillas dobles, punto y coma, 100 columnas → `pnpm lint:fix`
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

## Harness multiagente

- **`AGENTS.md` es la fuente de verdad** para cualquier agente (Codex, Claude Code, Antigravity y OpenCode leen este archivo). No crear adaptadores; si hiciera falta uno, debe delegar (`@AGENTS.md`) — `pnpm run check:agents` lo verifica en CI.
- Contrato de ingeniería, flujo multiagente y reglas de contexto completos: **[docs/agentes.md](./docs/agentes.md)**.
- **Una sesión por worktree**: si otra sesión trabaja en el repo, usar `git worktree` con rama propia; nunca dos escritores en el mismo árbol.
- Transferencias entre modelos/sesiones: skill `task-handoff` (`.agents/skills/task-handoff/SKILL.md`).
- Finales de línea: **LF** en todo el repo (`.gitattributes` + Biome). No cambiar esa política.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
