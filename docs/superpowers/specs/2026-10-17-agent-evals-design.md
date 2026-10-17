# Especificación: Agent Evals — sistema de evaluación de agentes (Fase 5)

> **Fecha:** 17 de octubre, 2026
> **Autor:** Pablo (Ingeniero Civil Metalúrgico) & agente opencode
> **Versión:** 1.0
> **Estado:** Propuesto (pendiente de revisión)
> **Baseline:** `623d517163e01400f029002cd565201cd9da4b3a` (`origin/main`, merge del PR #12)
> **Documento base:** `docs/superpowers/plans/2026-10-16-agent-evals.md` (su línea base se
> corrige en este mismo PR; esta especificación operacionaliza su §5 para las tareas nuevas)

---

## 1. Contexto y objetivo

La Fase 4 dejó una especificación mínima (`docs/superpowers/plans/2026-10-16-agent-evals.md`):
métricas, cinco escenarios y reglas. Faltaba el sistema reproducible: tareas con verificación
oculta e inmanipulable, aislamiento de cada corrida, registro estructurado de resultados y un
primer experimento real.

La Fase 5 construye ese sistema y ejecuta **una** comparación controlada — escenario
`e1-updated-at`, 3 corridas de Claude Code headless — con evidencia verificable, PRs pequeños
y sin afirmaciones de nivel general. El objetivo es medir con evidencia cuándo un agente
autónomo resuelve una tarea real del repositorio (y cuándo no): éxito funcional, regresiones,
tiempo, tokens/costo e intervenciones.

## 2. Decisiones aprobadas

| Tema | Decisión | Descartado |
|---|---|---|
| Aislamiento | Clon efímero por corrida: `git clone --shared` al SHA exacto, sin remoto, `.env` saneado, descartable | Worktree + rama scratch (comparte estado con el repo vivo); Docker (fricción Windows, infra pesada) |
| Motor | Node ESM en `scripts/evals/` (sin dependencias nuevas); resultados JSON validados con Zod (ya en el repo) | Plataforma externa de evaluación; base de datos para resultados |
| Verificación | Aceptación oculta, autocontenida e inmanipulable; se inyecta **después** de que el agente termina; validada en rojo sobre la base | Pruebas visibles en el clon; revisión manual del diff como único criterio |
| Primer experimento | 3 corridas Claude Code headless, mismo clon/SHA/configuración; presupuesto fijado de antemano | Comparación multi-proveedor (fuera de alcance) |
| Niveles A–D | Definición operativa (§3) y regla de declaración: solo lo demostrado en el escenario | Declarar un «nivel del agente» sin evidencia |
| Presupuestos | $5 y 25 min por corrida; $15 y 90 min por experimento; al tope se corta y se registra | Sin límites; límites fijados a posteriori |

## 3. Niveles de autonomía (A–D)

| Nivel | Definición operativa (verificable) |
|---|---|
| **A — Autónomo** | Aceptación oculta verde y todos los gates verdes, sin reanudación ni intervención humana. |
| **B — Autónomo con reanudación** | Igual que A, pero requirió exactamente **1 reanudación neutral** («continúa y termina», sin pistas ni correcciones). |
| **C — Asistido** | Logró el verde solo tras una intervención correctiva humana (edición de código o pista). En el experimento E1 no se permitirá: si fuera necesaria, la corrida se marca como no concluida. |
| **D — Fallo** | No logró aceptación verde dentro del presupuesto, o quedó en rojo algún gate esencial. |

Reglas de declaración: (1) el nivel se declara por corrida y por escenario; (2) con 3 corridas
la evidencia es ilustrativa de ese escenario, **no** un nivel general del agente ni del
proveedor; (3) toda discontinuidad de plataforma (runner, red, cupo del proveedor) se registra
como incidencia, no como intervención al agente.

## 4. Arquitectura

### 4.1 Estructura en el repositorio

```
evals/
  README.md
  tasks/<id>/
    task.json          # metadatos y presupuesto (fuente de verdad de la corrida)
    prompt.md          # instrucciones exactas que recibe el agente (única entrada)
    acceptance/        # verificadores ocultos: nunca visibles para el agente
    notes.md           # análisis de referencia (solo humano): defecto, trampas, solución de referencia
  results/<experimento>/
    baseline.json      # gates de referencia (clon pristine, sin agente)
    run-<n>/result.json
  reports/<experimento>.md
```

`evals/` es versionado. Clones, bases de datos de prueba y artefactos temporales viven fuera
del repositorio (carpeta temporal del sistema) y se descartan al terminar.

### 4.2 Motor (`scripts/evals/`)

- `run.mjs` — orquesta una corrida completa: clona → ejecuta el agente → captura el diff →
  gates → inyecta y ejecuta la aceptación → escribe `result.json` validado.
- `report.mjs` — agrega los `result.json` de un experimento en
  `evals/reports/<experimento>.md` (tabla comparativa, narrativa y limitaciones).
- `schema.mjs` — esquemas Zod de `task.json` y `result.json`.
- Modos: `run` (corrida completa con agente), `validate` (solo aceptación, sin agente: valida
  el rojo sobre la base), `report` (informe).
- Pruebas Vitest del motor (esquemas, informe, saneo de rutas) — PR-2.
- Comandos `pnpm evals:run` y `pnpm evals:report`; al tocar `package.json` se ejecuta
  `pnpm docs:sync` para los bloques de documentación viva (PR-2).

Reglas del runner: trabaja **siempre** sobre un clon, nunca sobre el repo de trabajo; valida
rutas (`path.resolve` + guardas) antes de copiar o borrar; en Windows termina el árbol de
procesos completo al agotar el tiempo; registra la línea de comandos efectiva y el entorno
(sin secretos) como evidencia. Presupuesto en el CLI: `--max-budget-usd` (solo con `--print`)
acota el costo; no existe `--max-turns` en 2.1.291, así que el tope de tiempo queda
enteramente del lado del runner.

### 4.3 Aislamiento de la corrida

1. `git clone --shared <repo> <temp>/<experimento>/run-<n>` y `git checkout <base_commit>`
   (SHA completo). Se elimina el remoto del clon.
2. `.env` saneado: sin `TURSO_*` reales ni credenciales de producción; `AUTH_SECRET` local
   efímero; credenciales E2E de prueba (`admin@pablo.cl` / `admin1234`).
3. `pnpm install --frozen-lockfile` (store global, rápido) y navegadores Playwright de la
   caché global.
4. Identidad git local del clon fijada; sin push ni remoto; sin red saliente más allá del
   proveedor del LLM.
5. Puertos: gates E2E en 3100; aceptación en 3200. Corridas estrictamente secuenciales.
6. El clon se conserva como evidencia (su ruta queda en `result.json`) y puede descartarse
   sin afectar nada. Riesgo documentado: `--shared` referencia objetos del repo padre.

### 4.4 Tareas (`task.json`)

Campos: `id`, `titulo`, `base_commit`, `agente` (`tool`, `model` explícito, `flags`),
`presupuesto` (`usd`, `minutos`), `gates` (lista de comandos), `aceptacion` (`archivos` a
inyectar, `comandos`, `timeout_min`), `reanudaciones_neutrales_max` (0 | 1) y `notas`.

### 4.5 Resultados (`result.json`)

Esquema Zod con: `experimento`, `run`, `task_id`, `base_commit`,
`agente` (`tool`, `version`, `model`, `flags`), `inicio`/`fin` (ISO), `duracion_min`,
`presupuesto`, `agente_resultado` (`exit_code`, `tokens_entrada`, `tokens_salida`,
`costo_usd`, `detenido_por` | `completion`, `session_json`), `gates` (por gate:
`pass` | `fail` | `skip` + detalle), `aceptacion` (`pass` + detalles), `diff` (`archivos`,
`inserciones`, `eliminaciones`, `parche`), `intervenciones` (tipo, minuto, nota),
`incidencias_plataforma`, `nivel` (A–D) y `notas`.

Regla de datos faltantes: si el proveedor no expone tokens o costo, el campo queda `null` y
se anota la razón (coherente con §2 del documento base).

### 4.6 Informes

`report.mjs` genera `evals/reports/<experimento>.md`: tabla por corrida (aceptación, 7 gates,
nivel, tiempo, tokens entrada/salida, costo, tamaño del diff) + narrativa por corrida (qué
tocó el agente y cómo diagnosticó) + comparación + limitaciones. El PR-4 añade además un
resumen humano en `docs/reports/` (convención del repo) que enlaza al informe completo.

## 5. Verificación oculta (reglas de diseño)

1. Vive solo en `evals/tasks/<id>/acceptance/`; se copia al clon **después** de que el agente
   termina y después de los gates.
2. Autocontenida: trae su propia configuración de Playwright, su propio arranque de servidor
   (puerto 3200, BD `data/acceptance.db`) y sus propios asserts. No importa helpers del repo
   evaluado (inmanipulable).
3. Verifica el **resultado observable** (base de datos o página), nunca la implementación.
4. Validada en rojo: sobre un clon pristine de la base, sin agente, debe fallar. La evidencia
   queda en `notes.md` (PR-3) y puede reproducirse con el modo `validate`.
5. Timeout propio (por defecto 8 min) y salida legible volcada a `result.json`.

Gates por corrida (sobre el clon, tras el agente): `lint`, `type-check`, `test`, `docs:check`,
`check:agents`, `build`, `test:e2e`. Gates de referencia: se ejecutan una vez por experimento
sobre un clon pristine (sin agente) → `results/<experimento>/baseline.json`; permiten
distinguir regresiones introducidas de flakiness preexistente.

## 6. Tareas

### 6.1 `e1-updated-at` — primer experimento

**Base:** `623d517163e01400f029002cd565201cd9da4b3a`.

**Objetivo (resultado exigido):** al crear y editar contenido en las zonas Experiencia,
Educación, Idiomas y Habilidades desde el panel, la fecha de modificación **persiste** en la
base de datos. Hoy `saveExperience`, `saveEducation`, `saveLanguage` y `saveSkill`
(`src/lib/actions/content.ts`) entregan `updatedAt` a tablas sin esa columna
(`src/db/schema.ts`), y Drizzle 0.45.3 descarta las claves desconocidas en silencio. Ajustes
y Proyectos sí persisten su fecha.

**Prompt (borrador, se ajusta en PR-3):**

```
Soy Pablo, dueño del sitio. Detecté un problema en el panel de administración:

- Cuando edito Proyectos o Ajustes del sitio, todo bien.
- Cuando edito Experiencia, Educación, Idiomas o Habilidades, el cambio se guarda,
  pero la fecha de modificación de esa zona nunca queda registrada: al volver a mirar,
  no hay rastro de cuándo se editó (a diferencia de las otras zonas).

Necesito que esas cuatro zonas registren su fecha de modificación igual que las demás.

Contexto y reglas del repo:
- Lee AGENTS.md (es la fuente de verdad del repositorio).
- Usa pnpm. Antes de terminar deja verdes: pnpm lint, pnpm type-check, pnpm test,
  pnpm docs:check, pnpm check:agents y pnpm build.
- La base de datos de producción ya tiene filas: la actualización del esquema no puede
  romper ni perder datos existentes.
- Trabaja de forma autónoma. No hagas commit ni push.

Al terminar, resume qué cambiaste, cómo lo verificaste y qué quedó fuera.
```

**Aceptación oculta:** Playwright propio (login → crear una fila nueva en cada una de las
cuatro zonas → editar una experiencia existente) más un assert directo sobre la base
(`data/acceptance.db`, cliente libsql): `updated_at` no nulo y cercano al momento de la
corrida en la fila nueva de las cuatro tablas, y avance de `updated_at` en la fila editada.
Sobre la base sin agente debe fallar (sin columna / valor nulo).

**Trampas documentadas (`notes.md`):** la migración `ADD COLUMN ... NOT NULL` falla en SQLite
si la tabla ya tiene filas (requiere default o reconstrucción; la aceptación corre en BD
fresca, así que este borde queda documentado como límite); el `$defaultFn` de Drizzle es del
cliente, no un default de la base; `contentLastModified` no incluye esas zonas (queda fuera
del resultado exigido; ajustarlo es opcional).

**Solución de referencia:** cuatro columnas `updated_at` en `src/db/schema.ts` + migración
generada con `pnpm db:generate` + verificación E2E; los writes ya existen en las acciones.

### 6.2 `e2-env-var` (documento base, tarea E-1)

Añadir una variable de entorno punta a punta: `.env.example`, `ENV_DOCS` de
`scripts/docs-sync.mjs` y sincronización de la documentación viva. Aceptación: `docs:check`
verde, variable presente en los bloques generados de los cuatro documentos y
`check:agents` verde.

### 6.3 `e3-skill` (documento base, tarea E-2)

Crear una skill compartida en `.agents/skills/<nombre>/SKILL.md` con frontmatter válido y
registrarla en `docs/agentes.md`. Aceptación: validación propia del frontmatter (no solo el
gate) y skill listada en `docs/agentes.md`.

### 6.4 `e4-unit-test` (documento base, tarea E-3)

Añadir una prueba unitaria de un caso límite concreto (candidatos reales: bordes de
`src/lib/validation.ts`, como cadenas vacías o límites de campos; el caso exacto se fija en
PR-3 contra el código y se documenta con su justificación). Aceptación: la prueba nueva pasa,
la suite completa sigue verde y **detecta una mutación** mínima del comportamiento cubierto
(el verificador aplica la mutación, exige que la prueba nueva falle y revierte).

### 6.5 `e5-zod-action` (documento base, tarea E-5)

Añadir validación Zod a acciones que hoy no la tienen: `toggleMessageRead` y `deleteMessage`
(`src/lib/actions/messages.ts`) hoy usan `Number(formData.get("id"))` sin esquema. Aceptación:
entrada inválida (id no entero positivo, enviada por HTTP y saltando la validación nativa del
navegador) es rechazada sin tocar la base y con la redirección de error de la acción
(`?error=invalid`); entrada válida sigue funcionando; prueba unitaria del esquema.

La tarea E-4 del documento base (finales de línea) se descarta por artificial: no representa
trabajo real del repositorio.

## 7. Primer experimento — protocolo

1. Gates de referencia sobre clon pristine (una vez) → `baseline.json`.
2. Verificación en rojo de la aceptación de `e1-updated-at` (una vez, modo `validate`).
3. Corridas secuenciales `n = 1..3` completas (§4.2), con monitoreo pasivo del operador.
   Reanudación neutral permitida: máximo 1 por corrida (`--resume <session-id>`, verificado
   en Claude Code 2.1.291). No se permiten pistas ni correcciones humanas.
4. Criterio de parada: al acumular $15 o 90 minutos de agente se detiene el experimento y se
   reporta parcial; cualquier incidencia grave (runner, red, cupo) también detiene y se
   registra.
5. Informe (`report.mjs`) + revisión humana antes del PR de solución.

Modelo: se ancla explícito en `task.json` y se registra la versión de la CLI como evidencia
(medida el 2026-10-17: Claude Code 2.1.291, headless con salida JSON; banderas del motor
verificadas en esa versión: `--print`, `--output-format json`, `--max-budget-usd`,
`--session-id`, `--resume`, `--permission-mode`, `--permission-prompts none`,
`--allowedTools`, `--settings`, `--model`).

## 8. Plan de PRs

| # | Rama | Contenido | Depende de |
|---|---|---|---|
| 1 | `feat/agent-evals` | Este spec + corrección de línea base del documento Fase 4 | — |
| 2 | `feat/agent-evals-engine` | Motor `scripts/evals/`, comandos, pruebas del motor, `docs:sync` | 1 |
| 3 | `feat/agent-evals-tasks` | Tareas `e1`–`e5` (fixtures + aceptaciones) y validación en rojo de `e1` | 2 |
| 4 | `feat/agent-evals-experimento-e1` | 3 corridas reales, `results/`, informe y resumen en `docs/reports/` | 3 |
| 5 | `feat/agent-evals-solucion-e1` | PR de solución con el diff ganador, coordinado con el fix de la sesión paralela del usuario | 4 |

Cada PR parte de `main` actualizado, es pequeño y deja los gates verdes; el ruleset de `main`
exige los checks de CI al merge.

## 9. Riesgos y limitaciones

- 3 corridas dan evidencia ilustrativa del escenario, no concluyente. Se declara así.
- Costo y tokens dependen del proveedor; si no se exponen quedan `null` y anotados.
- La aceptación corre sobre una BD fresca: no cubre la seguridad de la migración sobre datos
  existentes (documentado; el prompt sí lo menciona como restricción).
- El clon de la base no reproduce el entorno de producción (Turso, Vercel); los gates son
  locales.
- `next dev` (Turbopack) puede ser lento en la primera compilación del clon; los presupuestos
  lo contemplan.
- Flakiness E2E preexistente podría marcar regresiones falsas: los gates de referencia
  permiten distinguirlas.
- Fuera de alcance: comparación multi-proveedor, ejecución de evals en CI con claves de API y
  cualquier generalización de niveles más allá del escenario medido.

## 10. Corrección de línea base (documento Fase 4)

En `docs/superpowers/plans/2026-10-16-agent-evals.md` (mismo PR): `XX/YZ` → `95/95`,
`AB/CD` → `24/24`, `N info preexistentes` → `1 info preexistente` (medido en CI, run
`38988490127`, 2026-10-16) y la ruta obsoleta `src/lib/scripts/agents-check.mjs` →
`scripts/docs-sync.mjs` (ahí vive `ENV_DOCS`), con una nota fechada del cambio.
