# AGENTS.md — Guía para agentes de IA

Instrucciones para cualquier agente (Claude, Codex, Cursor, Gemini…) que trabaje
en este repositorio. Léela completa antes de tocar código.

## El proyecto

Sitio personal de **Pablo — Ingeniero Civil Metalúrgico** (español, estética
minimalista clara: papel cálido, serif Fraunces, acento cobre) con panel de
administración propio y laboratorio interactivo de metalurgia.

## Stack (no cambiar de tooling)

Versiones vigentes (generadas desde `package.json`):

<!-- BEGIN:docs-sync:stack -->
| Herramienta | Versión | Rol |
|---|---|---|
| Next.js | 16.4.0 | Framework App Router, Server Actions, ISR, proxy (Turbopack) |
| React | 19.3.0 | UI |
| TypeScript | 7.0.2 | Tipado estricto (compilador nativo) |
| Tailwind CSS | 4.3.3 | Estilos con tema claro/oscuro (variables CSS) |
| Drizzle ORM | 0.45.4 | libSQL tipado + migraciones + semilla automática |
| Turso / libSQL | 0.18.0 | SQLite en la nube (producción) o archivo local (desarrollo) |
| Biome | 2.5.15 | Linter + formatter (un solo binario, sin Babel) |
| lefthook | 2.2.2 | Hook de pre-commit (docs:check) |
| Vitest | 5.0.4 | Tests unitarios |
| Playwright | 1.64.0 | Tests E2E |
| Zod | 4.6.7 | Validación de entradas en server actions |
| jose | 6.2.12 | JWT HS256 de sesiones (compatible con proxy runtime) |
| scrypt | — | Hash de contraseñas sin dependencias (Node crypto) |
<!-- END:docs-sync:stack -->

- El tema vive en `src/app/globals.css` (`@theme` + `.dark`, variables CSS).
- **pnpm** — nunca npm/yarn (gestor fijado en `packageManager`). Sin monorepo ni turbo.

## Comandos

<!-- BEGIN:docs-sync:commands -->
| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo en :3000 (Turbopack) |
| `pnpm build` | Build de producción (Next.js) |
| `pnpm start` | Servidor de producción en :3000 |
| `pnpm type-check` | TypeScript estricto (tsc --noEmit) |
| `pnpm test` | Pruebas unitarias (Vitest) |
| `pnpm test:watch` | Pruebas unitarias en modo watch |
| `pnpm lint` | Biome: lint + formato (src, scripts, tests) |
| `pnpm lint:fix` | Biome con corrección automática |
| `pnpm format` | Biome: solo formato |
| `pnpm check:agents` | Verificación multiagente (AGENTS.md, adaptadores, skills, packageManager pnpm) |
| `pnpm docs:sync` | Regenerar los bloques de documentación viva |
| `pnpm docs:check` | Verificar la documentación viva (candado de CI) |
| `pnpm db:generate` | Generar migración Drizzle |
| `pnpm db:studio` | Drizzle Studio (explorar la BD) |
| `pnpm db:reset` | Regenerar la DB local con datos semilla |
| `pnpm test:e2e` | Suite E2E (Playwright, puerto 3100, BD aislada) |
| `pnpm cv:pdf` | Regenerar el PDF público del CV (requiere dev activo) |
| `pnpm prepare` | Instalar el hook de pre-commit (lefthook) |
<!-- END:docs-sync:commands -->

Antes de commitear deben quedar en verde: `lint`, `type-check`, `test` y `docs:check`.

## Base de datos — tres modos (`src/db/index.ts`)

1. `TURSO_DATABASE_URL=libsql://…` + `TURSO_AUTH_TOKEN` → **Turso** (producción).
2. `TURSO_DATABASE_URL=file:ruta` → SQLite en ruta explícita (así corre la suite E2E).
3. Sin variables → `data/site.db` local (se crea, migra y siembra sola).

- Migraciones (`drizzle/`) y semilla (`src/db/seed.ts`) son idempotentes: se aplican en el primer arranque, no requieren pasos manuales.
- **Nunca editar ni commitear** `data/*.db` (está en .gitignore). La suite E2E borra `data/e2e.db` en cada corrida — lo hace el comando del `webServer` en `playwright.config.ts`; no mover esa limpieza a `globalSetup` (crea una carrera con el health-check de Playwright que corrompe la BD).
- SQLite local corre con `journal_mode=WAL` + `busy_timeout` (necesario bajo la concurrencia del dev server). Turso remoto no lleva PRAGMAs.

## Variables de entorno

Las variables configurables viven en `.env.example` (fuente de verdad); las internas o de plataforma (CI, Vercel, analítica, E2E) quedan como excepción en `ENV_INTERNAL` del motor:

<!-- BEGIN:docs-sync:env -->
| Variable | Detalle |
|---|---|
| `AUTH_SECRET` | Secreto para firmar sesiones del panel (`openssl rand -hex 32`); **obligatoria en producción** |
| `ADMIN_EMAIL` | Correo del administrador; solo al sembrar la DB por primera vez |
| `ADMIN_PASSWORD` | Contraseña del administrador; solo al sembrar la DB por primera vez |
| `TURSO_DATABASE_URL` | URL de Turso (`libsql://…`); sin ella se usa SQLite local (`data/site.db`) |
| `TURSO_AUTH_TOKEN` | Token de Turso (acompaña a `TURSO_DATABASE_URL`) |
| `NEXT_PUBLIC_SITE_URL` | URL pública (sitemap, canonical, JSON-LD); solo producción |
<!-- END:docs-sync:env -->

## Convenciones de código

- UI 100 % en **español** (es-CL), tono profesional.
- Comentarios de código en español.
- Biome: comillas dobles, punto y coma, 100 columnas → `pnpm lint:fix`
- La capa de datos (`src/lib/data.ts`) es **async en todo el contrato**; primero `const db = await getDb()`, luego las consultas.
- Nada de `Math.random()`/`Date.now()` en el primer render de componentes cliente: rompe la hidratación SSR (referencia: `src/components/lab/live-dashboard.tsx`).

## Documentación viva

- `AGENTS.md`, `README.md`, `DEPLOY.md` y `.env.example` son parte del contrato del repo: no deben quedar obsoletos.
- Los bloques entre `<!-- BEGIN:docs-sync:* -->` y `<!-- END:docs-sync:* -->` son **generados**: se regeneran con `pnpm docs:sync` (el hook pre-commit lo hace solo). No editarlos a mano.
- Si tu cambio toca comandos, variables de entorno, rutas, estructura o tooling: sigue la skill `.agents/skills/docs-sync/SKILL.md` y revisa la prosa de los 4 documentos.
- Definición de terminado: `pnpm docs:check` en verde (el hook lo corre localmente; CI lo exige al merge). `git commit --no-verify` no es una salida.

## Pruebas E2E (`tests/e2e/`)

- Servidor propio en el puerto **3100** con BD aislada. `globalSetup` pre-compila rutas — no quitarlo (evita carreras de Turbopack).
- **2 workers** máximo: más workers hacen inestable `next dev` (compilación on-demand a mitad de test).
- Entornos sin acceso al CDN de Playwright (sandboxes): definir `PLAYWRIGHT_CHROMIUM_EXECUTABLE` con la ruta de un binario Chromium compatible (misma versión mayor) — el config lo inyecta como `executablePath`.
- Tras `page.goto` en dev, esperar hidratación antes de interactuar: helper `appReady()` (`networkidle`).
- Para ejercer la validación Zod del **servidor**, saltar la nativa del navegador: helper `submitBypassingNativeValidation()`.
- Cambios en la BD que deban verse en páginas públicas: confiar en la revalidación on-demand (`revalidatePath` en las server actions) — no añadir polling.

## Harness multiagente

- **`AGENTS.md` es la fuente de verdad** para cualquier agente (Codex, Claude Code, Antigravity y OpenCode leen este archivo). No crear adaptadores; si hiciera falta uno, debe delegar (`@AGENTS.md`) — `pnpm run check:agents` lo verifica en CI.
- Contrato de ingeniería, flujo multiagente y reglas de contexto completos: **[docs/agentes.md](./docs/agentes.md)**.
- **Una sesión por worktree**: si otra sesión trabaja en el repo, usar `git worktree` con rama propia; nunca dos escritores en el mismo árbol.
- Transferencias entre modelos/sesiones: skill `task-handoff` (`.agents/skills/task-handoff/SKILL.md`).
- Finales de línea: **LF** en todo el repo (`.gitattributes` + Biome). No cambiar esa política.

## Producción

- Guía completa de despliegue: **[DEPLOY.md](./DEPLOY.md)** (Vercel + Turso, ~15 min, $0).
- `AUTH_SECRET` es **obligatoria** en producción: `src/lib/auth.ts` lanza a propósito si falta. No suavizar ese guard.
- `NEXT_PUBLIC_SITE_URL` alimenta sitemap, robots, canonical, OG y JSON-LD (`src/lib/site.ts`). En local tiene default; en Vercel debe definirse.
- Imagen OG (`src/app/opengraph-image.tsx`): satori **no soporta woff2** — Fraunces va embebida en base64 (`src/app/og-font.ts`). Regla de satori: todo `<div>` con más de un hijo necesita `display` explícito.
- Headers de seguridad HTTP solo se activan en build de producción (`next.config.ts`) — no esperarlos en `next dev`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
