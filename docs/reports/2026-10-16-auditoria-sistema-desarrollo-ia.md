# Auditoría del sistema de desarrollo asistido por IA — PEGM-web

> **Fecha:** 16 de octubre de 2026
> **Autor:** agente opencode (auditoría de solo lectura — sin cambios de código)
> **Baseline:** commit `9297253` (`chore: migrar la gestión de paquetes a pnpm`)
> **Encargo:** auditar el repositorio conforme a la metodología «AI-Native Development SOTA» y
> entregar hallazgos, riesgos, prioridades y plan de implementación incremental.
> **Etiquetas:** **[Hecho]** verificado en repo/comando · **[Propuesta]** recomendación · **[Supuesto]** no verificado

> **Addendum (16:18).** Durante la redacción de este informe, la sesión concurrente de IA
> (ver riesgo #1) completó y commiteó la **Task 2** del plan docs-sync (`6249402`) y su ronda
> de correcciones (`b25974a` y `9e68443`, 16:15). Consecuencias sobre este informe: la P1
> avanza en esa sesión (quedan Tasks 3–9) y **P0.3 quedó resuelto** por ella (el fix de
> `scripts/start-e2e.mjs` está commiteado con sus valores por defecto, verificado en el blob).
> **P0.1–P0.2** (reinstalación limpia de `node_modules`) se posponen hasta que exista una
> única sesión escribiendo en el repositorio.

---

## 1. Resumen ejecutivo

**[Hecho]** El repositorio ya implementa, en su mayor parte, la metodología objetivo. No parte de
cero: existe una especificación aprobada y un plan de implementación de 9 tareas («docs-sync —
documentación viva sincronizada», commits `26af2ea` y `99f1aa4`) cuyo objetivo es exactamente el
que plantea la metodología: bloques de documentación autogenerados desde fuentes del código,
verificación fail-closed en hook `pre-commit` y en CI, y una skill para la prosa que ninguna
máquina puede verificar.

| Área | Estado | Veredicto |
|---|---|---|
| AGENTS.md como fuente única | Existe, sólido y en español | Mantener; añadir 2 reglas (concurrencia y revisión) |
| ADRs | `docs/adr/0001` aceptado | Añadir ADR 0002 (migración pnpm) |
| Documentación generada + detección de drift | Especificado (docs-sync); Task 1/9 hecha | Continuar Tasks 2–9 |
| CI con quality gates | Existe (lint, tests, tipos, build, E2E) ya en pnpm | Añadir `docs:check` (Task 6) |
| Contratos de API | No aplica (sin API pública) | Descartar OpenAPI/API.md |
| Tests | 28 unit + 24 e2e (según spec) corriendo en CI | Suficiente; opcionales en P3 |
| Seguridad | Nivel alto (JWT, scrypt, rate limit, epoch, auditoría, CSP) | Vigilar dependencias (P2) |
| Automatización | CI activa; deploy Vercel+Turso $0 documentado | Dependabot/CodeQL (P2) |

**Riesgo material activo [Hecho]:** `node_modules` quedó en estado **híbrido npm+pnpm** (coexisten
`node_modules/.pnpm/` y `node_modules/.package-lock.json`) por la concurrencia de dos sesiones de
IA durante la migración. Funciona (sitio HTTP 200) pero **no es reproducible**; requiere
reinstalación limpia con pnpm (P0).

**Prioridades:** P0 higiene inmediata · P1 ejecutar Tasks 2–9 del plan docs-sync · P2 vigilancia de
dependencias y análisis estático · P3 opcionales con beneficio medible.

---

## 2. Método, alcance y limitaciones

**[Hecho]** Verificación directa sobre el repositorio: lectura de archivos
(`package.json`, `AGENTS.md`, `README.md`, `next.config.ts`, `playwright.config.ts`,
`.github/workflows/ci.yml`, spec y plan docs-sync, ADR 0001), `git log/status/diff`, inspección de
procesos y peticiones HTTP locales. Auditoría de solo lectura: no se modificó código ni se
ejecutaron suites de prueba.

Limitaciones declaradas:

1. `gh` sin sesión autenticada → **visibilidad del repositorio GitHub no verificada** (afecta la
   elegibilidad de CodeQL, que es gratuito solo en repos públicos). **[Supuesto]**
2. No se re-ejecutaron lint/test/type-check/E2E en esta auditoría: los conteos de pruebas (28 unit,
   24 e2e) provienen del spec docs-sync §1. **[Supuesto]**
3. Con `node_modules` híbrido, las «versiones realmente instaladas» no son garantizables; se citan
   los rangos de `package.json` y el lockfile pnpm commiteado. **[Hecho]**
4. El servidor MCP local del grafo de código (codebase-memory) no respondió durante la sesión
   (`Connection closed`); la exploración se hizo por lectura directa. **[Hecho]**

---

## 3. Análisis por área (los 8 puntos del encargo)

### 3.1 Stack y versiones

**[Hecho]** Versiones declaradas en `package.json` (dependencias y devDependencies):

| Paquete | Rango | Rol |
|---|---|---|
| next | ^16.3.8 | App Router, Server Actions, Turbopack |
| react / react-dom | ^19.3.0 | UI |
| typescript | ^7.0.2 | Compilador nativo, tipado estricto |
| tailwindcss | ^4.3.3 | Tema en `src/app/globals.css` |
| drizzle-orm | ^0.45.3 | libSQL tipado + migraciones |
| @libsql/client | ^0.18.0 | Turso (prod) o SQLite local |
| zod | ^4.6.5 | Validación de entradas |
| jose | ^6.2.12 | JWT HS256 de sesiones |
| @biomejs/biome | ^2.5.15 | Lint + formato |
| vitest | ^5.0.3 | Tests unitarios |
| @playwright/test | ^1.63.0 | Tests E2E |

**[Hecho]** `engines: node >=20.9.0`; CI usa Node 22; local corre Node v24.16.0.
**[Hecho]** `packageManager: pnpm@11.7.0` fijado (commit `9297253`), `pnpm-lock.yaml` commiteado
(3070 líneas), `package-lock.json` eliminado. Tooling npm→pnpm coherente y fijado.
**Sin hallazgos negativos** en esta área más allá del híbrido de `node_modules` (ver §1 y §5).

### 3.2 Arquitectura y dependencias entre módulos

**[Hecho]** Estructura verificada:

- `src/app/` — sitio público (`(site)`: portada `/`, `/cv`, `/proyectos`, `/laboratorio`), panel
  (`admin/(auth)/login`, `admin/(panel)`), portada en inglés (`/en`), `robots.ts`, `sitemap.ts`,
  ruta `llms.txt`, imagen OG.
- `src/lib/` — capa de datos (`data.ts`, degradación elegante sin DB), `actions/` (Server Actions),
  `auth.ts`, `password.ts` (scrypt), `slug.ts`, `content.ts` (semilla).
- `src/db/` — esquema Drizzle, conexión libSQL (3 modos), semilla idempotente; `drizzle/` con 3
  migraciones.
- `src/components/` — UI pública + admin + `lab/` (4 herramientas).
- `src/proxy.ts` — protección de `/admin` (runtime Edge).

**[Hecho]** Límites arquitectónicos documentados en `docs/adr/0001-mantener-next-turso.md`
(decisión: mantener Next + Turso; costo $0; seguridad propia como contrapartida). Sin monorepo.

**[Propuesta]** No se detecta necesidad de enforcement automático de límites entre capas (p. ej.
reglas de imports) a esta escala (~80 archivos de código). Revisar solo si el proyecto crece.

### 3.3 Instrucciones existentes para agentes

**[Hecho]** `AGENTS.md` (raíz): reglas operativas concretas y en español — modos de BD, comandos,
convenciones, notas E2E (2 workers, puerto 3100, helper `appReady`), requisitos de producción
(`AUTH_SECRET` fail-hard, `NEXT_PUBLIC_SITE_URL`), reglas satori/OG y de hidratación SSR. Incluye
el bloque autogestionado `nextjs-agent-rules` que reescribe `next dev`.
Mecanismo de reglas especializadas ya existente: `.agents/skills/` (p. ej. `modern-web-guidance`).

**[Hecho]** Drift conocido y ya inventariado en el spec docs-sync §1: la regla «**npm** — nunca
pnpm/yarn» de `AGENTS.md` quedó obsoleta con la decisión de migrar a pnpm (pendiente de corregir en
la Task 8 del plan); consejo peligroso `npx biome check --write .` (sin alcance, toca `.next`).

**[Propuesta]** Dos reglas nuevas para `AGENTS.md`, sin crear documentos redundantes:

1. **Concurrencia:** «Una sola sesión de IA escribe el repositorio a la vez». Hoy dos sesiones
   concurrentes causaron exactamente el estado híbrido de `node_modules` que hay que reparar.
2. **Revisión independiente:** para cambios significativos (migraciones, auth, CI, BD), una
   pasada de revisión por un agente distinto del implementador, sin asumir que el implementador
   tiene razón (el flujo superpowers ya lo soporta: `requesting-code-review`).

### 3.4 Documentación Markdown y riesgo de obsolescencia

**[Hecho]** Inventario: `AGENTS.md`, `README.md`, `DEPLOY.md`, `.env.example` (núcleo vivo);
`docs/adr/` (1 ADR); `docs/superpowers/specs|plans` (6 documentos, histórico); `docs/reports/`
(vacío hasta hoy).

**[Hecho]** El drift es real y está documentado (spec `26af2ea` §1): README cita comandos npm y
conteos obsoletos («23 y 19 pruebas» — hoy 28 y 24), `DEPLOY.md:16` y `.env.example:19` usan npm,
aviso de `/admin/ajustes` en npm. Spot-check propio: `README.md:13` (`npm run cv:pdf`),
`README.md:71-72` (conteos), `README.md:111` (`npm install` + nota de `better-sqlite3`, dependencia
que ya no existe), `.env.example:19` (`npm i -g @turso/cli`). **[Hecho]**

**[Hecho]** Solución ya especificada: motor `scripts/docs-sync.mjs` con bloques entre marcadores
(`<!-- BEGIN:docs-sync:* -->`) en AGENTS.md/README.md/DEPLOY.md, verificación de referencias
(comandos `pnpm <x>`, rutas en backticks, estructura, env bidireccional) y `check` fail-closed en
hook + CI. Es una implementación a medida **más estricta** que las alternativas genéricas
(Typedoc/OpenAPI) para este repo.

**[Propuesta]** Al cerrar la Task 1 quedó una decisión sin ADR: la **migración npm→pnpm** es la
decisión técnica más grande del día y merece `docs/adr/0002-migracion-a-pnpm.md` (contexto,
decisión, consecuencias — incluye `packageManager`, lockfile único, CI). Coherente con la práctica
ADR ya iniciada.
**[Propuesta]** CHANGELOG.md: **aplazar**. Los conventional commits + `git log` cubren la
trazabilidad de un proyecto personal sin releases versionados; si algún día hay releases, evaluar
`git-cliff` (P3).

### 3.5 Contratos de API, esquemas y fuentes de verdad

**[Hecho]** No hay API pública (REST/GraphQL): la interacción es Server Actions tipadas con
validación Zod, más rutas de contenido (`sitemap`, `robots`, `llms.txt`, OG). Por tanto:

- **OpenAPI / API.md: no aplican** — generarlos sería complejidad sin beneficio. **[Propuesta: descartar]**
- Fuentes de verdad del proyecto: esquema Drizzle (`src/db/`), esquemas Zod, `src/lib/content.ts`
  (semilla), `.env.example` (variables), `package.json` (scripts/versiones).
- El motor docs-sync deriva rutas/env/comandos/stack **desde esas fuentes**, no desde prosa.

### 3.6 Cobertura de tests y validaciones

**[Hecho]** Unit (Vitest, `src/**/*.test.ts`): 5 archivos — `auth`, `lab`, `password`, `rate-limit`,
`slug`. E2E (Playwright, `tests/e2e/`): 5 specs — `public`, `portfolio`, `panel`, `contacto`,
`auth`, con `helpers.ts` y `global-setup.ts`. Config E2E: puerto 3100, BD aislada `data/e2e.db`,
2 workers, `webServer` con `scripts/start-e2e.mjs`. **[Hecho]** La CI ejecuta lint, unit tests,
type-check, build y la suite E2E completa con reporte como artefacto.

**[Supuesto]** Conteos 28 unit / 24 e2e (spec §1); no re-ejecutados en esta auditoría.

**[Propuesta]** Huecos menores, todos opcionales (P3): medición de cobertura numérica (solo si se
quiere dirigir refactors), y verificación de accesibilidad automatizada (P3). No se propone añadir
tests de contrato de Server Actions: la suite E2E ya los ejercita end-to-end.

### 3.7 Seguridad, rendimiento y accesibilidad

**[Hecho]** Seguridad por encima de la media para un sitio personal: JWT HS256 en cookie
`HttpOnly`/`SameSite`/`Secure` (prod), contraseñas scrypt con salt y comparación en tiempo
constante, rate limiting en Turso, epoch de sesión (revocación), auditoría de acciones con IP
hasheada, anti-CSRF por Server Actions, honeypot en el formulario, headers de seguridad +
CSP en producción (`next.config.ts`), `AUTH_SECRET` obligatoria fail-hard, `.env*` y
`data/*.db` gitignored.

**[Hecho]** Puntos abiertos ya reconocidos: CSP con `script-src 'unsafe-inline'` (ADR 0001 lo
registra como posible migración a nonce estricto — diferido consciente).

**[Propuesta]** P2 — vigilar dependencias: el panel usa auth propio sobre `jose`, `next` y `zod`;
sin Dependabot/Renovate no hay alerta temprana de vulnerabilidades. Elemento barato y medible.

**[Propuesta]** Rendimiento: ya existe disciplina (cache por request, fuentes autoalojadas, web-vitals
como dependencia). Presupuestos formales de rendimiento (p. ej. Lighthouse CI) quedan en P3:
beneficio medible solo si se define un objetivo (p. ej. «no bajar de X en LCP»).

**[Propuesta]** Accesibilidad: no hay verificación automática. Opción P3 de bajo costo: `axe-core`
integrado en Playwright sobre las páginas principales.

### 3.8 Automatización CI/CD y despliegue

**[Hecho]** `.github/workflows/ci.yml` (ahora en pnpm, commit `9297253`): job `build` (install
frozen, lint, tests, type-check, build con `AUTH_SECRET` de CI) y job `e2e` (Chromium con deps,
suite completa, reporte como artefacto). Triggers: push y PR a `main`.

**[Hecho]** Despliegue: Vercel + Turso documentado en `DEPLOY.md` (~15 min, $0), con
`scripts/verify-deploy.mjs` para verificación post-deploy. **[Hecho]** No existe
`.github/dependabot.yml`; **[Supuesto]** no hay branch protection (no verificable sin acceso).

**[Propuesta]** P2: Dependabot (ecosistema npm, actualizaciones agrupadas semanales) y, si el
repositorio es público, CodeQL (gratuito). `docs:check` en CI llega con la Task 6 del plan.

---

## 4. Evaluación de la metodología propuesta (elemento por elemento)

| Elemento pedido | Estado en PEGM-web | Veredicto |
|---|---|---|
| `AGENTS.md` único y conciso | **[Hecho]** Existe y funciona | Mantener; +2 reglas (§3.3) |
| `ARCHITECTURE.md` | **[Hecho]** No existe; sí ADR + README + AGENTS | **[Propuesta: aplazar]**: cubierto a esta escala (ADR 0001 + estructura del README mantenida por docs-sync). Crearlo solo si el sistema crece a varios módulos desplegables |
| `docs/adr/*.md` | **[Hecho]** ADR 0001 aceptado | Añadir ADR 0002 (pnpm) |
| `README.md` validado en CI | Parcial | El `docs:check` de docs-sync lo cierra (Tasks 4–5) |
| `API.md` desde OpenAPI | No aplica | **[Propuesta: descartar]** (sin API pública) |
| `CHANGELOG.md` | No existe | **[Propuesta: aplazar]**; conventional commits cubren; `git-cliff` solo si hay releases (P3) |
| Documentación generada desde fuente | Especificado (docs-sync, motor propio) | Continuar; encaja mejor que TypeDoc aquí |
| Detección de drift (falla CI) | Especificado (`docs:check` en hook + CI) | Continuar (Tasks 4–6) |
| Quality gates en CI | **[Hecho]** Existen (lint/tests/tipos/build/E2E) | Añadir `docs:check`; P2 Dependabot/CodeQL |
| Revisión independiente | No formalizada | **[Propuesta]** Regla en AGENTS.md + flujo superpowers |
| Hoja de ruta priorizada | — | §6 de este informe |

### Enfoques evaluados para el sistema de documentación

1. **Continuar el plan docs-sync existente (elegido).** Motor propio determinista + check
   fail-closed + skill. Encaja exacto con el repositorio, ya tiene spec aprobada y Task 1 hecha.
2. Construir un sistema nuevo desde cero. **Descartado:** duplicaría trabajo ya especificado y
   validado; el diseño existente es más estricto que las alternativas genéricas.
3. Mínimo (solo prosa manual + revisión humana). **Descartado:** no cumple el requisito de barrera
   técnica verificable; el drift de hoy (post-migración) es la prueba.

---

## 5. Riesgos

| # | Riesgo | Evidencia | Mitigación |
|---|---|---|---|
| 1 | **Concurrencia de sesiones de IA escritoras** sobre el mismo repo | **[Hecho]** Hoy: rescate npm vs Task 1 pnpm simultáneas → `node_modules` híbrido | Regla «una sesión escritora a la vez» en AGENTS.md; árbol git limpio entre tareas; el propio plan docs-sync exige pausar la otra sesión |
| 2 | **`node_modules` híbrido npm+pnpm** (no reproducible) | **[Hecho]** `node_modules/.pnpm/` y `node_modules/.package-lock.json` coexisten | P0: reinstalación limpia (`node_modules` fuera + `pnpm install`) + re-verificación de suites |
| 3 | **Drift documental activo mientras no llegue la Task 8** (AGENTS.md aún dice «npm — nunca pnpm/yarn») | **[Hecho]** Regla vigente en el archivo; migración ya commiteada | Priorizar Tasks 2–9; mientras tanto, cualquier IA que lea AGENTS.md recibe una regla obsoleta |
| 4 | **Dependencias sin vigilancia** (auth propio sobre jose/next/zod) | **[Hecho]** No existe `.github/dependabot.yml` | P2: Dependabot semanal agrupado |
| 5 | **CSP con `unsafe-inline`** | **[Hecho]** `next.config.ts`; ADR 0001 lo lista como futuro | Aceptado y diferido conscientemente; revisar solo si se prioriza nonce |
| 6 | **` M scripts/start-e2e.mjs` sin commitear** (fix legítimo de credenciales E2E) | **[Hecho]** `git status` actual; el plan pide no revertirlo | P0: commit propio y explícito |
| 7 | Migración pnpm sin ADR | **[Hecho]** Commit `9297253` sin documento de decisión | P0: ADR 0002 |
| 8 | Verificación post-migración posiblemente incompleta | **[Supuesto]** Task 1 Step 7 (pnpm test/lint/type-check) no re-verificado tras el híbrido | P0: re-ejecutar suites tras la reinstalación limpia |

---

## 6. Prioridades y plan de implementación incremental

> Ejecutor aprobado: esta sesión (única escritora). Requisito previo: confirmar que la otra sesión
> está pausada y el árbol limpio.

### P0 — Higiene inmediata (horas, sin dependencias)

| # | Acción | Evidencia de cierre |
|---|---|---|
| P0.1 | Detener el servidor local → eliminar `node_modules` → `pnpm install` limpio → reiniciar servidor (actualizar el launcher local a `pnpm dev` si aplica) | `node_modules/.package-lock.json` ausente; `node_modules/.pnpm` presente; sitio HTTP 200 |
| P0.2 | Re-verificar con pnpm: `pnpm lint`, `pnpm test`, `pnpm run type-check` (y `pnpm run build` si se desea cobertura total) | Salidas verdes |
| P0.3 | Commit del fix `scripts/start-e2e.mjs` (p. ej. `test(e2e): fija credenciales semilla y no depende de .env local`) | `git status` limpio |
| P0.4 | ADR 0002: migración npm→pnpm | `docs/adr/0002-migracion-a-pnpm.md` |

### P1 — Núcleo del sistema (el plan ya existe: `docs/superpowers/plans/2026-10-16-docs-sync.md`)

| # | Tareas 2–9 del plan docs-sync | Gate humano |
|---|---|---|
| P1.1 | Tasks 2–4: motor `scripts/docs-sync.mjs` (marcadores, generadores, verificación de referencias, CLI) con TDD | — |
| P1.2 | Task 5: marcadores y primera generación real en AGENTS.md/README.md/DEPLOY.md | — |
| P1.3 | Task 6: hook `pre-commit` (lefthook) + `docs:check` en CI | **Sí**: probar el hook real antes de commitear |
| P1.4 | Task 7: skill `.agents/skills/docs-sync/` + contrato «Documentación viva» en AGENTS.md (incluye las 2 reglas nuevas de §3.3) | — |
| P1.5 | Task 8: prosa a pnpm y poda de referencias obsoletas (cierra el riesgo #3) | — |
| P1.6 | Task 9: verificación final global (lint, tipos, tests, docs:check, build, E2E) | — |

### P2 — Vigilancia de dependencias y análisis estático (1 sesión corta)

- `.github/dependabot.yml`: ecosistema npm, agrupado, semanal.
- CodeQL: **condicionado** a verificar la visibilidad del repositorio (gratuito solo si es público).
- (El paso `docs:check` en CI ya llega con P1.3.)

### P3 — Opcionales con beneficio medible (solo si se materializa el interés)

- `axe-core` en Playwright para accesibilidad automatizada.
- Presupuestos de rendimiento (Lighthouse CI) — requiere definir umbral objetivo primero.
- CHANGELOG automatizado (`git-cliff`) — solo si aparecen releases versionados.
- Verificación de enlaces externos (Lychee) en CI.

### Descartados explícitamente (complejidad sin beneficio medible hoy)

TypeDoc · OpenAPI/API.md · `ARCHITECTURE.md` extenso · monorepo/turbo · gate de cobertura ·
Sentry (los logs de Vercel + la auditoría en BD bastan para este proyecto, costo $0).

---

## 7. Supuestos y decisiones pendientes del usuario

1. **[Supuesto]** Visibilidad del repositorio GitHub (público/privado) — condiciona CodeQL.
2. **[Supuesto]** Conteos de pruebas (28/24) según spec, no re-ejecutados en esta auditoría.
3. Decisión: commitear este informe (`docs: informe de auditoría del sistema de desarrollo IA`)
   o dejarlo como borrador local.
4. Decisión: ¿commit propio para `scripts/start-e2e.mjs` (P0.3) — recomendado — o mantenerlo
   fuera de los commits como espera el plan docs-sync Task 9?

---

## 8. Anexo — Evidencia principal

**Commits relevantes (16 de octubre de 2026):**

| Commit | Hora | Contenido |
|---|---|---|
| `9297253` | 16:06 | Migración npm→pnpm completa (lockfile, packageManager, CI) |
| `99f1aa4` | 15:49 | Plan de implementación docs-sync (9 tareas) |
| `26af2ea` | 15:37 | Spec: documentación viva sincronizada |
| `b982767` | 14:56 | Correo de contacto actualizado |
| `3e4d7e5` | 14:17 | ADR 0001 (stack Next+Turso) + nota superseded |
| `2c6d527` | 14:16 | i18n por diccionarios tipados es/en |
| `2be35ae` | 13:55 | Command palette (dialog nativo) |
| `0a74d1b` | — | Cache por request, degradación silenciosa |
| `074fc3c` | — | Auditoría con eventos, IP hasheada, paginación |
| `3b64d26` | — | Rate limiting Turso, epoch de sesión, scrypt asíncrono, CSP |

**Archivos clave citados:** `package.json` · `pnpm-lock.yaml` · `.github/workflows/ci.yml` ·
`AGENTS.md` · `README.md` · `DEPLOY.md` · `.env.example` · `next.config.ts` ·
`playwright.config.ts` · `vitest.config.ts` · `docs/adr/0001-mantener-next-turso.md` ·
`docs/superpowers/specs/2026-10-16-docs-sync-design.md` ·
`docs/superpowers/plans/2026-10-16-docs-sync.md` · `.superpowers/sdd/2026-10-16-docs-sync/` ·
`scripts/start-e2e.mjs` · `tests/e2e/` · `src/lib/*.test.ts` · `drizzle/` (3 migraciones).

---

*Informe en modo lectura; ninguna verificación de este documento modificó el repositorio.*
