# Entrega — Harness multiagente y estabilidad de CI (2026-10-16)

- **Rama:** `feat/ai-native-harness` (base `b571a39`, 13 commits) — empujada a `origin`.
- **Plan:** `docs/superpowers/plans/2026-10-16-harness-multiagente.md`.
- **PR:** pendiente de creación manual (el `gh` local no tiene credenciales); la rama ya
  está en GitHub y el formulario de PR viene prellenado desde el entorno de trabajo.

## 1. Resumen

1. **CI rojo en `main` diagnosticado y corregido**: el job `build` fallaba en el step
   "Lint (Biome)" por finales de línea mixtos (blobs LF, Biome en CRLF). Política nueva:
   **LF en todo el repo** (`.gitattributes` + Biome).
2. **Guard de credenciales de semilla (P0)**: `ADMIN_EMAIL`/`ADMIN_PASSWORD` son
   obligatorias en producción; el error es fatal de verdad (fail-fast), no un log.
3. **Skills y guard multiagente (P2)**: `.agents/skills/` con tres skills del repo,
   verificación `pnpm run check:agents` en CI, y `docs/agentes.md` como guía del harness.
4. **Dependabot** semanal (npm agrupado minor/patch; github-actions).
5. **Gates locales en verde**: lint 0 errores, 59/59 tests, type-check 0, build OK,
   auditoría de producción sin vulnerabilidades.

## 2. Diagnóstico del CI (evidencia)

- Run `38954571615` (main, `1c3cc7e`): job `e2e` ✅, job `build` ❌ en step "Lint (Biome)".
- Causa raíz: los blobs están en **LF** (257 archivos `i/lf w/crlf`), pero `biome.json`
  exigía `lineEnding: "crlf"`; en Ubuntu (checkout LF) el lint falla.
- Experimento local: archivo en LF → `biome check` exit 1; en CRLF → exit 0.
- Corrección: `.gitattributes` (`* text=auto eol=lf`; binarios marcados), Biome
  `lineEnding: "lf"`, renormalización completa del árbol (`w/lf` en los 257).

## 3. Commits de la rama

| Commit | Tema |
| --- | --- |
| `af32e20` | Plan de implementación (8 tareas) |
| `060e138` | Fix CI: finales de línea LF (`.gitattributes` + Biome) |
| `2c05eea` | Guard de credenciales de semilla en producción (base) |
| `26a13c9` | Dependabot semanal |
| `d39e499` | Guard multiagente (`check:agents`) + job `guards` en CI |
| `4999228` | `docs/agentes.md` |
| `512b6a7` | Skills compartidas (feature-workflow, security-review, task-handoff) |
| `112407c` | Sección del harness en `AGENTS.md` |
| `14c51ba` | Fail-fast real de credenciales (revisión) |
| `356ff9d` | Endurecimiento del guard multiagente (revisión) |
| `fd55f88` | Precisión en docs + horario de Dependabot (revisión) |
| (este) | Informe de entrega |

## 4. Decisiones de diseño

- **Fail-fast**: `SeedCredentialsError` se propaga desde `initDb`; el resto de errores
  de semilla (carreras/locks) siguen degradándose a log, como antes.
- **Firma de `resolveInitialAdminCredentials`**: `Record<string, string | undefined>`
  en vez de `NodeJS.ProcessEnv` (los tipos de Node 24 exigen `NODE_ENV`, lo que impedía
  tipar el caso "sin NODE_ENV").
- **Guard multiagente**: vigila `AGENTS.md`/`CLAUDE.md`/`GEMINI.md`, `packageManager`
  pnpm y frontmatter de skills; no sanciona lo no verificado (lectura de
  `.agents/skills/` por Claude Code/Codex/Antigravity queda declarada como pendiente).
- **Sin dependencias nuevas**; sin ADR nuevo (la numeración queda reservada para la
  línea de trabajo de documentación viva); decisiones registradas aquí y en
  `docs/agentes.md`.

## 5. Verificación ejecutada (local, esta rama)

- `pnpm lint` → 0 errores (1 info preexistente en `scripts/docs-sync.test.mjs`, ajeno a esta rama).
- `pnpm test` → **59/59** (8 tests nuevos de credenciales, 10 del guard).
- `pnpm run type-check` → 0 errores.
- `pnpm run check:agents` → consistente (AGENTS.md, pnpm, 4 skills válidas).
- `pnpm build` → OK (con `AUTH_SECRET` local de build).
- `pnpm audit --prod` → sin vulnerabilidades conocidas.
- CI del PR: se dispara al crear el PR (el workflow solo corre en `main` o en PRs).

## 6. Riesgos y pendientes

- **Conflictos de merge esperados** (leves) en `AGENTS.md`, `ci.yml` y `package.json`
  con el trabajo de documentación viva ya presente en `main`; resolver conservando ambos.
- **Pendiente P0 en `main`** (tras el merge): reinstalación limpia (`node_modules` fuera
  + `pnpm install`) y re-verificación de gates, para cubrir `.npmrc`/corepack.
- **Protección de rama**: propuesta en el PR (PR obligatorio + checks `build`, `e2e`,
  `guards`); requiere permisos de administración, no configurable desde el entorno local.
- **Sin verificar** (no asumir): lectura de `.agents/skills/` por Claude Code, Codex y
  Antigravity; reglas `.agents/rules/` fuera de Antigravity.
- **Toolchain Windows nativo**: verificación de paridad Node/pnpm entre Windows y el
  runner Ubuntu pendiente de confirmación en el propio CI.

## 7. Operación tras el merge

```powershell
# Árbol local aún en CRLF: refrescar a LF una vez mergeado
git switch main
git pull --ff-only
git rm -r --cached . --quiet
git reset --hard

# P0 de la línea principal: reinstalación limpia y re-verificación
Remove-Item -Recurse -Force node_modules
pnpm install
pnpm lint; pnpm test; pnpm run type-check; pnpm run check:agents
```

**Rollback:** los commits son temáticos e independientes; revertir la rama completa
(`git revert`) o commits sueltos sin tocar los demás cambios.
