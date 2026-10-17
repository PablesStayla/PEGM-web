# Plan — PR 1 · Agent Evals: recuperación del núcleo (feat/evals-core-recovery)

Fecha: 2026-10-17 · Rama: `feat/evals-core-recovery` (base `e3814f6` = merge de PR #17)
Misión: remediación mayor sobre la auditoría de `50dbf07` (Fases 0–1 del mandato).

## 1. Matriz de hallazgos (Fase 0)

| # | Hallazgo de la auditoría | Estado | Evidencia |
|---|---|---|---|
| A | `scripts/evals/schema.mjs` con `export type` (TS) y `SeedCredentialsSchema` inexistente → módulo inejecutable | Reproducido en `4502a85`; **corregido en HEAD** por PR #16 | `git show 4502a85:scripts/evals/schema.mjs` + `node --check` → `SyntaxError: Unexpected token 'export'` (exit 1). En HEAD: `node --check` OK e import OK |
| B | `scripts/evals/verify.mjs` con export duplicado (`export function verifySkillsExist` + `export { verifySkillsExist }`) | Reproducido en `4502a85`; **corregido en HEAD** (archivo eliminado en `b10b30b`, PR #16) | `git show 4502a85:scripts/evals/verify.mjs` + `node --check` → SyntaxError en el bloque final `export { … }` |
| C | CI no valida sintaxis ni importación de scripts; PR #15 pasó lint/tests/type-check/build con módulos inejecutables | **Abierto → este PR lo cierra** | Biome 2.5.15 acepta sintaxis TS en `.mjs` (exit 0 sobre el archivo defectuoso); `ci.yml` no ejecutaba `node --check` ni import |
| D | Éxito falso por exit 0 del CLI (runner antiguo) | Motor actual aplica gates+aceptación, pero sin `estado` explícito | `4502a85:run.mjs` usaba `status = code === 0 ? "success" : "failure"` |
| E | Comandos por concatenación + `shell:true` (install, gates, aceptación) | **Abierto → este PR lo cierra** | `run.mjs:273` `ejecutar = … runChild({ shell: true })`, usado en install y gates |
| F | Spawn del agente asume ejecutable directo (en Windows `claude` puede ser `.cmd` → EINVAL) | **Abierto → este PR lo cierra** | Experimentos locales: `pnpm`→ENOENT, `pnpm.cmd`→EINVAL, `cmd /d /s /c pnpm`→OK (11.7.0); stdin a través del wrapper→OK |

## 2. Entregables del PR 1 (Fase 1 del mandato: núcleo del motor)

1. **Candado C** — `scripts/check-scripts.mjs` (+ tests):
   - sintaxis `node --check` para TODOS los `.mjs` (`scripts/**`, `evals/**`, raíz);
   - smoke de importación de allowlist curada (`scripts/evals/{schema,report,run}.mjs`);
   - CLI `[raiz]` (cwd por defecto), exit 0/1/2; tests con fixtures que reproducen A (`export type` en `.mjs`) y el export inexistente;
   - integración: script `check:scripts` en `package.json`, paso en CI `guards`, comando en `.lefthook.yml` (pre-commit) y entrada en `SCRIPT_DOCS` + `pnpm docs:sync`.
2. **Estados explícitos** — `estado` (`passed|failed|timeout|budget_exceeded|infrastructure_error|incomplete|not_executed`) en `ResultadoSchema`; `motivo` (`exit|spawn|timeout|signal`) en cada gate y comando de aceptación; `computeEstado()` con precedencia documentada; el informe gana columna y narrativa de estados.
3. **Sin shell** — `parseComando()` (allowlist `pnpm|node`, charset `[A-Za-z0-9@._:/-]`, rechaza rutas absolutas y `..`) y `construirLanzamiento()` (win32 → `ComSpec /d /s /c exe …`; posix directo) aplicados a install, gates, aceptación, `--version` y spawn del agente.
4. **Fail-fast** — `cargarTarea()` valida gates, comandos de aceptación y agente (tool/model/flags); `buildAgentCommand()` valida `--resume`.
5. **Documentación viva** — script nuevo documentado (`SCRIPT_DOCS`) y regeneración con `pnpm docs:sync`. Sin cambios de variables de entorno.

## 3. Precedencia de `computeEstado` (documentada y testeada)

infraestructura (error de spawn/signal) → timeout (runner o comando) → presupuesto → incomplete (agente sin completion) → not_executed (gates o aceptación vacíos) → failed → passed.
`nivel` A–D no cambia (compatibilidad con la spec §3).

## 4. Fuera de alcance (PR 2+)

- Aislamiento verificable end-to-end (hook real en el clon, sin red) → PR 2.
- Aceptación e1 con migración sobre BD **con filas** (pérdida de datos) → Fase 2.
- Evaluador artifact/seed del benchmark → Fase 2.
- Verificación de que `skip` se produzca, env por gate, retención/limpieza de clones.

## 5. Pruebas y gates

- Unit: `run.test.mjs` (parseComando, construirLanzamiento, computeEstado con precedencias, cargarTarea fail-fast, resume inválido), `schema.test.mjs` (estado/motivo fuera de enum), `report.test.mjs` (columna y narrativa), `check-scripts.test.mjs` (fixtures A/B + CLI).
- Integración: `node scripts/evals/run.mjs validate --task e1-updated-at` → **ROJO CONFIRMADO** (ejercita parseComando + wrapper de ComSpec + gates reales).
- Gates completos: lint, type-check, test, docs:check, check:agents, check:scripts, build, test:e2e.
- Sin corridas facturables (no autorizadas).

## 6. Riesgos y rollback

- `result.json` antiguos sin `estado`/`motivo` dejarían de parsear; no hay resultados committeados en `evals/results/` y el bloqueo es deliberado (fail-closed).
- En Windows el proceso hijo directo pasa a ser `ComSpec`; `taskkill /t` sigue matando el árbol completo y el paso de stdin fue verificado.
- Rollback: revertir la rama/PR; sin migraciones de datos ni cambios de contrato público.
