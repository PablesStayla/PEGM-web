# Agent Evals — Especificación mínima de evaluación del Harness

**Repositorio:** PablesStayla/PEGM-web
**Fecha:** 2026-10-16
**Estado:** Borrador inicial (línea base)
**Autor:** OpenCode (agente autónomo)

## 1. Propósito

Este documento especifica la metodología para evaluar el **harness multiagente** del repositorio
mediante tareas reales. El objetivo es medir, de forma repetible y con evidencia, cuán bien
los agentes (incluido OpenCode) pueden trabajar sobre este repositorio siguiendo
`AGENTS.md` como fuente de verdad, sin adaptadores ni duplicación de instrucciones.

No es un benchmark genérico de código: es una evaluación **específica del repositorio** que
mide si un agente puede leer, entender, modificar y verificar cambios en PEGM-web siguiendo
las reglas establecidas.

## 2. Métricas

Cada tarea evaluada registra las siguientes métricas:

| Métrica | Definición | Cómo se mide |
| --- | --- | --- |
| **Éxito funcional** | La tarea cumple su objetivo definido | Revisión manual del diff + pruebas que pasan |
| **Pruebas aprobadas** | `%` de pruebas unitarias/E2E que pasan tras el cambio | `pnpm test`, `pnpm test:e2e` |
| **Defectos introducidos** | Nuevos fallos o regresiones causados por el cambio | Diferencia de gates antes/después |
| **Cumplimiento de instrucciones** | El agente sigue `AGENTS.md` (no crea adaptadores, usa skills existentes, no duplica instrucciones) | Revisión del diff + `pnpm run check:agents` |
| **Intervenciones humanas** | Número de veces que un humano debió intervenir para corregir o guiar | Registro del evaluador |
| **Costo y tokens** | Tokens de entrada/salida y coste aproximado | Registro del entorno de ejecución (si el proveedor lo expone) |
| **Calidad de transferencia** | Las notas de transferencia (task-handoff) permiten a otro agente continuar sin pérdida de información | Revisión de la skill `task-handoff` y del documento entregado |

## 3. Conjunto inicial de tareas (línea base)

Cada tarea tiene: descripción, entrada, criterio de éxito, pruebas que deben pasar, y tiempo estimado.

### Tarea E-1: Añadir una variable de entorno

**Descripción:** Añadir una nueva variable de entorno a `.env.example`, registrarla en `ENV_DOCS` de `src/lib/scripts/agents-check.mjs` (o el archivo equivalente de docs-sync), y sincronizar la documentación viva con `pnpm docs:sync`.

**Entrada:** Nombre de variable, descripción, valor por defecto.

**Criterio de éxito:**
- `pnpm docs:check` pasa sin errores.
- La variable aparece en el bloque `env` de `AGENTS.md`, `README.md` y `DEPLOY.md`.
- `pnpm run check:agents` pasa (no hay contradicción entre `packageManager` y `AGENTS.md`).

**Pruebas que deben pasar:** `pnpm lint`, `pnpm test`, `pnpm run type-check`, `pnpm docs:check`, `pnpm run check:agents`.

**Tiempo estimado:** 10-15 minutos.

### Tarea E-2: Añadir una skill compartida

**Descripción:** Crear una nueva skill en `.agents/skills/<nombre>/SKILL.md` siguiendo el formato con frontmatter `name` y `description`, y registrarla en `docs/agentes.md`.

**Entrada:** Nombre de la skill, descripción, contenido.

**Criterio de éxito:**
- `pnpm run check:agents` pasa (la skill tiene frontmatter válido).
- `docs/agentes.md` lista la skill en la sección de skills compartidas.

**Pruebas que deben pasar:** `pnpm lint`, `pnpm run check:agents`.

**Tiempo estimado:** 10 minutos.

### Tarea E-3: Añadir una prueba unitaria

**Descripción:** Añadir una prueba unitaria a un módulo existente (ej. `src/lib/seed-credentials.test.ts` o `src/lib/validation.test.ts`) que cubra un caso límite.

**Entrada:** Nombre de la prueba, entrada, salida esperada.

**Criterio de éxito:**
- La prueba pasa.
- `pnpm test` pasa en su totalidad.

**Pruebas que deben pasar:** `pnpm test`, `pnpm run type-check`, `pnpm lint`.

**Tiempo estimado:** 15-20 minutos.

### Tarea E-4: Corregir un error de finales de línea (EOL)

**Descripción:** Introducir intencionalmente un archivo con finales de línea CRLF en una ubicación no binaria, verificar que `pnpm lint` falla, corregir a LF y verificar que pasa.

**Entrada:** Archivo con finales de línea CRLF.

**Criterio de éxito:**
- `pnpm lint` falla con el archivo CRLF.
- Tras convertir a LF, `pnpm lint` pasa.

**Pruebas que deben pasar:** `pnpm lint`.

**Tiempo estimado:** 5-10 minutos.

### Tarea E-5: Añadir una validación Zod a una Server Action

**Descripción:** Añadir un esquema Zod para una entidad nueva en `src/lib/validation.ts` y usarlo en la Server Action correspondiente de `src/lib/actions/content.ts`.

**Entrada:** Nombre de la entidad, campos y reglas de validación.

**Criterio de éxito:**
- El esquema existe y se usa en la acción.
- `pnpm test` pasa (incluye pruebas del esquema).
- `pnpm run type-check` pasa.

**Pruebas que deben pasar:** `pnpm test`, `pnpm run type-check`, `pnpm lint`.

**Tiempo estimado:** 20-30 minutos.

## 4. Línea base

La línea base se mide ejecutando cada tarea sobre `main` (o la rama base estable) antes de cualquier cambio:

| Métrica | Valor base | Cómo se mide |
| --- | --- | --- |
| Pruebas unitarias | XX/YZ pasadas | `pnpm test` |
| Pruebas E2E | AB/CD pasadas | `pnpm test:e2e` |
| Lint | 0 errores (N info preexistentes) | `pnpm lint` |
| Type-check | 0 errores | `pnpm run type-check` |
| Docs check | documento en orden | `pnpm docs:check` |
| Check agents | consistente | `pnpm run check:agents` |
| Build | OK | `pnpm build` |

## 5. Cómo ejecutar una evaluación

1. Crear una rama desde `main`: `git checkout -b feat/eval-<tarea> origin/main`.
2. Ejecutar la tarea tal como se describe.
3. Ejecutar todos los Quality Gates.
4. Registrar: tiempo empleado, intervenciones humanas, tokens (si el proveedor los expone), resultado de cada métrica.
5. Crear un PR con el resumen de la evaluación.
6. Si la tarea falla, documentar el motivo y el remedio.

## 6. Reglas de ejecución

- No se permiten atajos que omitan los Quality Gates.
- Cada tarea debe ejecutarse en una rama independiente.
- Los resultados deben ser reproducibles: otro agente debe poder ejecutar la misma tarea y obtener el mismo resultado.
- No se permite `git commit --no-verify` ni saltarse `docs:check`.

## 7. Riesgos y limitaciones

- El coste y los tokens dependen del proveedor de LLM y no siempre están disponibles.
- Algunas tareas requieren acceso a la base de datos (pruebas de integración) y pueden no ser ejecutables en entornos sin Turso/SQLite local.
- La evaluación de "calidad de transferencia" es subjetiva y depende del revisor humano.
