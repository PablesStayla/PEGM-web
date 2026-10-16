# Especificación: Endurecimiento y pulido de PEGM-web (bloques 1–7)

> **Fecha:** 16 de Octubre, 2026
> **Autor:** Pablo (Ingeniero Civil Metalúrgico) & agente opencode
> **Versión:** 1.0
> **Estado:** Aprobado
> **Baseline:** `6a64d55` (analítica first-party) sobre `d616a03` (rediseño portafolio + /en)

---

## 1. Contexto y objetivo

Un análisis senior del sitio identificó 8 bloques de mejora. Se aprueba implementar
los bloques **1–7**; el bloque 8 (asistente IA) queda para fase 2 por requerir API key
de un proveedor externo. El stack se mantiene: **Next 16 + React 19 + Turso/libSQL +
auth propia + Drizzle** — un ADR registra el descarte del spec monorepo/Supabase del
14-08-2026.

Objetivo: corregir bugs de contenido, endurecer seguridad, completar SEO/IA, mejorar
trazabilidad (auditoría), rendimiento/logging, accesibilidad del command palette e
internacionalización, con verificación verde por bloque.

## 2. Decisiones aprobadas

| Tema | Decisión | Descartado |
|---|---|---|
| Rate limiting | Tabla `rate_limits` en Turso (compartida entre instancias serverless), mismo patrón que la analítica ya implementada | Contador en memoria por instancia (débil en Vercel) |
| i18n | Diccionarios tipados `es`/`en` + componentes de sección compartidos | Mantener la duplicación de `/en` y solo pulirla |

El resto de bloques no tiene bifurcaciones relevantes; se implementa la vía indicada.

## 3. Bloque 1 — Corrección de bugs de contenido

1. **`src/components/portfolio.tsx`** (hero ~línea 26; sección "Sobre mí" ~líneas
   100-121): textos fijos. Debe renderizar desde `settings`: `title`,
   `aboutHeading` y `aboutP1..aboutP3`, con **fallback a los textos actuales** si el
   campo estuviera vacío. `aboutHeading`/`aboutP*` ya son editables en `/admin/ajustes`
   y hoy no se reflejan en el sitio.
2. **JSON-LD duplicado y contradictorio:** eliminar el bloque de
   `src/app/(site)/layout.tsx:54-73` (usa `settings.linkedin` como `url`, inválido si
   vacío). Conservar y completar `src/app/layout.tsx:46-72` como un único grafo
   **Person + WebSite** alimentado por `settings` y `src/lib/site.ts`.
3. **`src/app/(site)/cv/page.tsx:50`:** URL de GitHub hardcodeada → `settings.github`.
4. **`src/app/sitemap.ts:7`:** `lastModified: new Date()` es falso. Para páginas de
   contenido usar el máximo `updatedAt` de su tabla (`projects`, `experience`,
   `education`, `skills`; `/` usa `settings.updatedAt`); para estáticas omitir
   `lastModified`. Añadir `alternates.languages` (es/en) coherente con las páginas.
5. Ajustar pruebas E2E si asumen los textos fijos actuales.

## 4. Bloque 2 — Seguridad

1. **Migración `0002`** (generada con `npm run db:generate`), única para todo el
   endurecimiento:
   - `rate_limits(key text pk, window_start integer, count integer)` + índice por
     `window_start` para purga perezosa.
   - `users.session_epoch integer not null default 0`.
   - `audit_log` + columnas `event text` (clave máquina estable para filtrar:
     `auth.login_failure`, `content.update`, …; las actuales `action`/`entity`/
     `detail` se conservan como texto humano), `ip_hash text`, `user_agent text`,
     `diff text` (JSON serializado); índices (`created_at`) y
     (`action`, `created_at`).
2. **`src/lib/rate-limit.ts`:** `consume(key, limit, windowMs)` con upsert atómico
   (`INSERT … ON CONFLICT DO UPDATE`, reset por ventana) y purga perezosa de ventanas
   vencidas. La clave usa HMAC(AUTH_SECRET) sobre IP+ámbito: **nunca IPs en claro**.
   - Login: 5 intentos / 15 min por (IP+email normalizado).
   - Contacto: 5 envíos / hora por IP.
   - `/api/analytics` conserva su límite propio ya implementado.
3. **CSP** en `next.config.ts` (solo build de producción, junto a los headers
   existentes): `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src
   'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';
   object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`.
   CSP con nonce estricto queda documentada como mejora futura (requiere proxy +
   render dinámico).
4. **Sesión:** JWT se mantiene a 7 días; se añade claim `sessionEpoch`; el layout de
   `(panel)` (que ya consulta BD) verifica epoch contra `users` → cambiar la
   contraseña incrementa el epoch y revoca todas las sesiones emitidas. `proxy.ts`
   sigue verificando solo el JWT (edge, sin BD). Logout actual (borrado de cookie) no
   cambia.
5. **`src/lib/password.ts`:** `scryptSync` → `scrypt` promisificado (no bloquea el
   event loop). Los tests de password se mantienen verdes.

## 5. Bloque 3 — SEO/IA

1. **`src/app/llms.txt/route.ts`** estático (`force-static`): resumen del sitio,
   páginas principales (`/`, `/en`, `/cv`, `/proyectos`, `/laboratorio`) y contacto,
   desde `src/lib/site.ts`.
2. **`scripts/verify-deploy.mjs`:** añadir `/en` y `/llms.txt` al smoke post-deploy.

## 6. Bloque 4 — Trazabilidad (auditoría)

1. **Helper de auditoría** extendido (ubicación actual en `src/lib/data.ts` o
   `src/lib/audit.ts`): acepta `before`/`after` (se serializa diff acotado),
   `ipHash` y `userAgent`. **Nunca** registrar contraseñas ni tokens.
2. **Auditar:** `toggleMessageRead` (hoy sin auditar); eventos auth `login_success`,
   `login_failure` (con IP hasheada) y `logout`; repasar que el resto de mutaciones
   de contenido ya auditadas conserven su cobertura.
3. **Retención 365 días:** purga perezosa (aprovecha el flujo de login o la lectura
   de auditoría), mismo patrón que la retención de analítica.
4. **`src/app/admin/(panel)/auditoria/page.tsx`:** paginación de 25 por página vía
   `searchParams` + filtro por acción; `adminAuditLog(200)` fijo → contrato
   `adminAuditLog({ page, action })`.

## 7. Bloque 5 — Rendimiento y logging

1. **`React.cache()`** para `getSettings` (se lee 3+ veces por request entre layout,
   footer y páginas) y demás lecturas repetidas por request en `src/lib/data.ts`.
2. **`adminDashboardStats`** (`src/lib/data.ts:227-229`): awaits secuenciales →
   `Promise.all`.
3. **`catch {}` silenciosos** de `src/lib/data.ts`: helper `quiet(error, context)` →
   `console.warn` **solo en desarrollo**; la degradación elegante se mantiene intacta.

## 8. Bloque 6 — Command palette accesible

1. Migrar `src/components/command-palette.tsx` a **`<dialog>` nativo** con
   `showModal()`: focus trap, ESC, backdrop, scroll lock y restauración de foco
   gratis; overlay con `::backdrop`.
2. Mantener Ctrl+K, búsqueda por ítems, navegación y estética actual.
3. Cargar la skill `modern-web-guidance` antes de implementar.
4. E2E: abrir con Ctrl+K, ESC cierra y devuelve el foco al disparador.

## 9. Bloque 7 — i18n por diccionarios tipados

1. **`src/lib/i18n/{es,en}.ts`** + tipo `Dictionary` (las claves de `es` son la
   fuente de verdad). Sin dependencias nuevas.
2. Extraer las secciones de `(site)/page.tsx` y `(site)/en/page.tsx` a componentes
   compartidos que reciben `dict`; ambas páginas quedan como wrappers delgados.
3. **`src/components/site-header.tsx:43-50`** (lookup EN inline) y `process-story`
   usan el diccionario.
4. `alternates.languages` en ambas páginas; sitemap con `languages`; los E2E del
   portafolio EN (`tests/e2e/portfolio.spec.ts`) se mantienen verdes.

## 10. Extra

1. **ADR `docs/adr/0001-mantener-next-turso.md`:** registra el descarte del stack
   monorepo/pnpm/Supabase/Better Auth del spec del 14-08-2026 y la decisión de
   mantener Next + Turso + auth propia.
2. Nota **"superseded"** al inicio del spec
   `docs/superpowers/specs/2026-08-14-pegm-metallurgical-platform-design.md`
   apuntando al ADR.

## 11. Verificación y commits

- Por bloque: `npm run lint`, `npm run type-check`, `npm test`; `npm run test:e2e`
  cuando el bloque toque UI pública o flujos de navegador.
- Un commit por bloque en orden 1→7 + ADR. Mensajes con el estilo del repo
  (`feat:`, `fix:`, `chore:`, `docs:`).
- La migración `0002` se genera con `npm run db:generate` (journal + snapshot).
- Criterio de cierre: todo verde + `git status` limpio.

## 12. Fuera de alcance

- Bloque 8 (asistente IA metalúrgico) — fase 2, requiere API key.
- CSP con nonce estricto (documentado como mejora futura).
- Rediseño visual del panel admin.
