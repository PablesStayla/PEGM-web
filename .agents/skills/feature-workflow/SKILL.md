---
name: feature-workflow
description: Flujo end-to-end para desarrollar una funcionalidad o corrección en PEGM-web (reconocimiento, plan, TDD, gates, documentación y commits). Úsala al iniciar cualquier cambio no trivial.
---

# Flujo de funcionalidad (PEGM-web)

## Cuándo usarla
Cualquier cambio no trivial: feature, refactor o corrección con impacto.

## Pasos
1. Reconocimiento dirigido (grafo/grep/lecturas): archivos, contratos, riesgos.
2. Plan si toca ≥3 archivos o hay decisiones: `docs/superpowers/plans/` (skill
   writing-plans), con tareas bite-sized y commits temáticos.
3. Impacto arquitectónico: capa de datos (`src/lib/data.ts`), rutas, BD
   (migración + seed), revalidación (`revalidatePath`).
4. Aislamiento: rama `feat/*`/`fix/*`; worktree si hay otra sesión activa.
5. TDD: test que falla → implementación mínima → verde (`pnpm test`).
6. Gates: `pnpm lint` · `pnpm test` · `pnpm run type-check` (siempre);
   `pnpm build` y `pnpm run test:e2e` si toca rutas, BD o render.
7. Documentación viva: si cambian comandos/env/rutas, sincronizar en el mismo cambio.
8. Commit temático en español (acentos: archivo UTF-8 + `git commit -F`).
9. Cierre: informe breve con evidencia y riesgos; PR si aplica.

## Prohibido
- Commitear en `main`; npm/yarn; dependencias sin justificar; secretos;
  romper hidratación SSR; `Math.random()`/`Date.now()` en primer render cliente.
