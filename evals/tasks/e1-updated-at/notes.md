# e1-updated-at — notas de diseño

## Defecto (por qué es una tarea real)

En la base `623d517`, las cuatro server actions de contenido
(`src/lib/actions/content.ts`) ya construyen los valores de escritura con
`{ ...parsed.data, updatedAt: new Date() }` (líneas 248, 319, 460 y 529 en esa
base), pero ninguna de las tablas `experience`, `education`, `languages` ni
`skills` tiene una columna para ese dato: Drizzle 0.45.3 **descarta en
silencio** las claves que no existen en el esquema. Resultado: los writes se
pierden sin error y el sitio no puede saber cuándo se editó cada ítem.
Verificado con `git show 623d517:src/lib/actions/content.ts`.

El spread `{ ...parsed.data, updatedAt: new Date() }` no dispara
excess-property checks de TypeScript (el exceso viene de un spread, no de un
literal), por eso el repo compila con el bug.

Nota de historia: en la main actual (post-PR-2, `abb4947`) un commit de
auditoría anterior eliminó esos `updatedAt` de las 4 acciones al considerarlos
código muerto. Por eso el prompt exige el **comportamiento** (persistir al
crear y avanzar al editar) y no describe los escritos existentes; si e1 algún
día se rebasa a main, la solución de referencia además deberá volver a
estampar `updatedAt` en las 4 actions (el dry-run local de PR-3 se hizo así y
quedó verde).

## Solución de referencia (PR-5)

1. Añadir la columna a las 4 tablas en `src/db/schema.ts` con el mismo patrón
   que ya usan `users`/`settings`/`projects`:
   `updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date())`.
2. `pnpm db:generate` para la migración.
3. **Editar la migración generada** al patrón recreate (tabla nueva + copia +
   `DROP` + `RENAME`), porque el `ALTER TABLE … ADD … NOT NULL` que emite
   drizzle-kit rompe contra una BD **con filas** (ver Trampas). Con la columna
   creada por recreate y el `$defaultFn`, la semilla y las escrituras del
   panel quedan cubiertas.
4. Las actions de `623d517` no necesitan cambios (ya pasan `updatedAt`); con
   la columna presente, el spread persiste tanto en creación como en edición,
   y la edición avanza respecto de la anterior.

## Trampas conocidas

- Con filas, SQLite rechaza `ADD COLUMN … NOT NULL` sin default
  (`Cannot add a NOT NULL column with default value NULL`) **y también** con
  default de expresión (`DEFAULT (unixepoch() * 1000)` →
  `Cannot add a column with non-constant default`). Verificado empíricamente
  con libsql 0.18 en esta máquina. La vía limpia es el recreate con
  `INSERT … SELECT (unixepoch() * 1000)` (conserva filas; el esquema no tiene
  FKs, así que no hacen falta los PRAGMAs de foreign_keys).
- En tabla **vacía** ambos `ALTER` pasan: la aceptación corre sobre una BD
  fresca (`data/acceptance.db`) y no distingue la trampa; importa para la BD
  real de producción, ya con filas. La solución de referencia lo resuelve con
  el recreate.
- `contentLastModified` (clave `settings`) NO cuenta: la fórmula de éxito
  exige persistencia por fila en las 4 tablas.
- El panel no muestra `updatedAt` en ningún listado; la observabilidad de esta
  tarea es exclusivamente la BD (por eso la aceptación lee por SQL).

## Validación en rojo (PR-3)

`node scripts/evals/run.mjs validate --task e1-updated-at` (clon de la base
`623d517…`):

<!-- BEGIN:evidencia-validacion -->
```
[evals] clonando (git clone --shared) en …\pegm-evals\e1-updated-at\validate
[evals] instalando dependencias (pnpm install --frozen-lockfile)…
[evals] aceptación inyectada en el clon: acceptance/playwright.config.ts, acceptance/global-setup.ts, acceptance/start-server.mjs, acceptance/e1.spec.ts
[evals] ejecutando: pnpm exec playwright test --config acceptance/playwright.config.ts
[evals]   → fail (10.2 s)
[evals] ROJO CONFIRMADO: la aceptación falla en la base pristine
```

Re-validado con el motor sin shell (2026-10-17, PR de recuperación): ROJO CONFIRMADO (16.0 s).

Error observado (test-results del clon):

```
Error: Estas tablas no tienen ninguna columna de fecha de modificación: experience (columnas vistas: id, period, role, company, highlights, sort_order); education (columnas vistas: id, period, degree, school, note, sort_order); languages (columnas vistas: id, name, level, sort_order); skills (columnas vistas: id, kind, name, sort_order)
```

La aceptación descubre por `PRAGMA table_info` que no existe columna de fecha
en las 4 tablas y aborta con mensaje claro (rojo de comportamiento, sin
ninguna pista del arreglo en el mensaje).
<!-- END:evidencia-validacion -->

## Dry-run verde (local, PR-3)

En el worktree (base `abb4947`; actions sin estampar, equivalente a aplicar la
solución de referencia sobre `623d517`): esquema con las 4 columnas
`$defaultFn` + migración recreate (editada a mano) + `updatedAt: new Date()`
en las 4 actions → aceptación verde en 7.8 s:

```
[e1] OK — experience: alta -> 2026-10-17T17:39:37.633Z | education: alta -> … |
languages: alta -> … | skills: alta -> … |
experience (fila 1 editada): antes=1792258773434, después=1792258782306
```

## Límites

- El clon de e2–e5 usa la base `abb4947…` (post-PR-2): el motor de evals es
  visible para el agente; los archivos de `evals/tasks/` de PR-3 no están en
  esa base, así que la aceptación permanece oculta.
- e1 sí parte de `623d517` (pre-motor): árbol idéntico al problema original.
