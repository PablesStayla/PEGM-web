# e2-env-var — notas de diseño

## Defecto (por qué es una tarea real)

El límite del formulario de contacto está fijo en código:
`consumeRateLimit(rateLimitKey("contact", clientIp(headerList)), 5, 60 * 60 * 1000)`
en `src/lib/actions/messages.ts` (línea 42 en la base `abb4947`). No hay
variable de entorno para ajustarlo por entorno.

## Qué exige la aceptación

1. `.env.example` declara `CONTACT_RATE_LIMIT_PER_HOUR=…`.
2. Los bloques generados `docs-sync:env` de los documentos del contrato
   (AGENTS.md y DEPLOY.md — README no tiene bloque de entorno) incluyen la
   variable entre backticks.
3. `scripts/docs-sync.mjs` la describe en `ENV_DOCS` (lo verifica importando
   el módulo).
4. `pnpm docs:check` y `pnpm check:agents` en verde.

La regla **bidireccional** de `checkEnvCoverage` (declarada ⇔ usada) es la que
impide atajos: declarar sin usar rompe `docs:check`, y usar sin declarar
también. Por eso no hace falta que la aceptación inspeccione el código de la
acción: los candados del repo ya lo fuerzan.

## Validación en rojo (PR-3)

La aceptación **no** se corre en rojo en PR-3 (por spec: solo e1). En la base
falla en el paso 1 (la variable no existe en `.env.example`). Se verificó en
PR-3 con un dry-run local sobre el clon (sin la variable → ROJO; con un parche
temporal correcto → verde, revertido después).

## Límites

- El clon parte de `abb4947` (post-PR-2): el motor de evals es visible, los
  archivos de esta tarea no.
- No se valida el *runtime* del límite (habría exigir 6 envíos por HTTP);
  eso cubriría una rebanada demasiado lenta para el presupuesto y no es el
  contrato de la tarea, que es el contrato de entorno y su documentación viva.
