# Especificación: Documentación viva sincronizada (docs-sync)

> **Fecha:** 16 de Octubre, 2026
> **Autor:** Pablo (Ingeniero Civil Metalúrgico) & agente opencode
> **Versión:** 1.0
> **Estado:** Aprobado (diseño; revisión final pendiente)
> **Baseline:** `b982767` (email de contacto) sobre `3e4d7e5` (ADR 0001)

---

## 1. Contexto y objetivo

Directiva: mientras la IA construye el sitio, la documentación viva no debe quedar
obsoleta; la IA del repo debe operar a nivel senior (skills + automatización).

El drift ya es real y verificable: `AGENTS.md` declara "npm — nunca pnpm/yarn" mientras
la decisión vigente es migrar a **pnpm**; `README.md` cita conteos obsoletos ("23 y 19
pruebas" — hoy 28 unit y 24 e2e) y comandos npm; `AGENTS.md:46` recomienda
`npx biome check --write .` (peligroso: sin alcance, alcanza `.next`); `DEPLOY.md:16`,
`.env.example:19` y el aviso de `/admin/ajustes` siguen en npm.

Objetivo: que los cuatro documentos vivos —`AGENTS.md`, `README.md`, `DEPLOY.md` y
`.env.example`— se mantengan correctos de forma estructural, no por disciplina ni
memoria:

1. **Bloques mecánicos autogenerados** desde fuentes del propio código.
2. **Verificación fail-closed** en hook `pre-commit` y en CI.
3. **Skill** que obliga a la IA a mantener la prosa semántica.

Límite declarado: el sistema verifica *hechos citados* (comandos, variables, rutas,
estructura), no semántica libre; esa parte queda cubierta por la skill y la regla de DoD.

## 2. Decisiones aprobadas

| Tema | Decisión | Descartado |
|---|---|---|
| Garantía | Híbrido: bloques autogenerados + `check` fail-closed + skill para prosa | Solo checklist para IA (se degrada); solo generación (la prosa se estanca) |
| Alcance | Núcleo vivo: `AGENTS.md`, `README.md`, `DEPLOY.md`, `.env.example` | Textos de UI, `docs/adr`, specs/plans históricos |
| Momento | En cada commit: hook `pre-commit` regenera y stagea; CI bloquea el drift que se cuele | Watcher continuo en dev; solo CI |
| Motor | Único (`scripts/docs-sync.mjs`), Node puro, generación amplia | Motor config-driven genérico (overkill); motor mínimo (drift en rutas/versiones) |

## 3. Arquitectura

Piezas:

- `scripts/docs-sync.mjs` — motor único, Node puro, sin dependencias. Modos: `sync` | `check`.
- Marcadores en los documentos: `<!-- BEGIN:docs-sync:<bloque> -->` …
  `<!-- END:docs-sync:<bloque> -->`, mismo estilo que el bloque `nextjs-agent-rules`
  que `next dev` reescribe en `AGENTS.md`. Fuera de marcadores: prosa de IA/humano.
- `package.json`: `docs:sync`, `docs:check`, devDependency `lefthook`,
  `"prepare": "lefthook install"`.
- `.lefthook.yml`: hook `pre-commit`.
- `.github/workflows/ci.yml`: paso `docs:check` en el job de lint.
- `.agents/skills/docs-sync/SKILL.md`: checklist de prosa (formato como
  `modern-web-guidance`).
- `AGENTS.md`: sección "Documentación viva" (contrato + DoD).

Matriz de bloques generados:

| Documento | Bloques |
|---|---|
| `AGENTS.md` | `commands`, `env`, `stack` |
| `README.md` | `commands`, `routes`, `stack` |
| `DEPLOY.md` | `env` |
| `.env.example` | — (es fuente del bloque `env`, no destino) |

Flujos:

1. **Mecánico**: cambia `package.json` / `.env.example` / las rutas → el hook regenera
   los bloques en el commit. Determinista e idempotente (orden estable, sin timestamps).
2. **Semántico**: un cambio de tooling toca prosa → el hook regenera lo que puede
   máquina; si queda una cita muerta (`pnpm foo` inexistente, ruta borrada, árbol
   desactualizado), `check` aborta el commit con el detalle.
3. **IA**: una sesión lee `AGENTS.md` → regla "Documentación viva" → si su cambio toca
   comandos, env, rutas, estructura o tooling, invoca la skill antes de commitear.

## 4. Motor (`scripts/docs-sync.mjs`)

Interfaz: `node scripts/docs-sync.mjs <sync|check>`, envuelto como `pnpm docs:sync` y
`pnpm docs:check`.

Responsabilidades:

- `readSources()` — `package.json` (scripts y versiones), `.env.example` (identificadores
  de variables), uso real de `process.env.*` (escaneo de `src/`, `scripts/`, `tests/` y
  archivos `*.config.*`; excluye lockfiles, `node_modules`, `.next`, `data`, `docs`),
  `src/app/**` (rutas reales desde `page.tsx`/`route.ts`), disco (estructura).
- Render por bloque:
  - `commands` — tabla `pnpm <script>` + descripción desde el mapa curado `SCRIPT_DOCS`
    (dentro del motor). Script sin entrada ⇒ `check` falla pidiendo documentarlo.
  - `env` — tabla de variables desde `.env.example` (nombre + comentario). Verificación
    cruzada en ambas direcciones: variable usada en código y ausente de `.env.example`
    ⇒ falla; variable declarada y jamás usada ⇒ falla (salvo lista blanca explícita).
  - `routes` — tabla generada de rutas reales (página/API + path).
  - `stack` — versiones de una lista fija de paquetes clave (`next`, `react`,
    `typescript`, `tailwindcss`, `drizzle-orm`, `@libsql/client`, `lefthook`, `vitest`,
    `@playwright/test`). Paquete desaparecido de `package.json` ⇒ falla (señal directa
    de tooling cambiado sin docs).
- `updateFiles(write)` — localiza cada bloque por sus marcadores y reemplaza solo su
  contenido; `sync` escribe, `check` compara y reporta diff por archivo + bloque.
  Marcadores faltantes o desordenados ⇒ error (nunca inventa ubicaciones).
- `verifyReferences()` — en los 4 documentos:
  - todo `pnpm <x>` citado existe como script (lista blanca de subcomandos pnpm:
    `install`, `add`, `remove`, `exec`, `dlx`, `import`, `update`, `why`, `audit`,
    `link`, `store`, `ff`);
  - toda ruta en backticks (`src/…`, `scripts/…`, `tests/…`, `docs/…`, `drizzle/…`)
    existe en disco;
  - el árbol de estructura del README se contrasta con disco: cada directorio directo
    de `src/` debe aparecer y cada ruta citada debe existir (verifica, no regenera).
- `main()` — dispatch de modos y exit codes. El motor **no invoca git**; el hook
  (capa externa) se encarga del staging.

Criterios de aceptación del motor:

- **Determinista**: misma revisión ⇒ misma salida.
- **Idempotente**: `sync` dos veces seguidas ⇒ el segundo run no modifica nada.
- **No invasivo**: solo escribe contenido entre marcadores.

## 5. Integración

1. **Hook** (`.lefthook.yml`, `pre-commit`): corre `pnpm docs:sync`; re-stagea
   **solo los archivos que sync reescribió** (el motor reporta la lista de escritura;
   así nunca arrastra ediciones pendientes del usuario); luego `pnpm docs:check`. Si
   `check` falla, aborta el commit con el detalle y los bloques regenerados quedan
   staged para el siguiente intento.
2. **CI**: paso `docs:check` en el job de lint (fail-closed).
3. **Skill** (`.agents/skills/docs-sync/SKILL.md`): dispara con "cambios en comandos,
   variables de entorno, rutas, estructura o tooling". Pasos: regenerar → revisar prosa
   por documento (qué mirar en cada uno) → si se añadió un script, agregar su descripción
   a `SCRIPT_DOCS` → `pnpm docs:check` → commit que incluye los docs.
4. **Contrato** ("Documentación viva" en `AGENTS.md`): regla de actualización; DoD de
   agentes: `docs:check` verde antes de cerrar; CI lo exige; `--no-verify` no es salida.
5. **`package.json`**: scripts y `prepare` indicados en §3.

## 6. Errores y salida

- Exit codes: `0` ok; `1` drift o referencias rotas; `2` uso incorrecto o fuente
  ilegible (marcadores faltantes, JSON inválido, etc.).
- Mensajes accionables con archivo + bloque + remedio. Ejemplos:
  `README.md [routes]: la ruta "/cv/europea" citada no existe → corrígela o créala`;
  `SCRIPT_DOCS: falta la descripción del script "e2e"`.
- `check` nunca escribe; `sync` nunca toca contenido fuera de marcadores.

## 7. Pruebas

- **Unit (Vitest)** con fixtures en directorio temporal: idempotencia, determinismo y
  detección de cada fallo: script sin descripción, variable huérfana en ambas
  direcciones (código ↔ `.env.example`), cita `pnpm <x>` muerta, ruta citada ausente,
  directorio de `src/` ausente del árbol, marcadores ausentes, y `check` que no escribe.
- **Integración viva**: el propio CI corriendo `docs:check` sobre el repositorio real.
- **E2E**: no aplica (el motor no toca UI); no se añade ruido a Playwright.

## 8. Piloto: migración npm → pnpm

Orden de implementación (el sistema se estrena resolviendo el problema que lo motivó):

1. **Restaurar el entorno con pnpm** (prerrequisito: sin `node_modules` no hay Vitest
   ni lefthook): `pnpm import` desde `package-lock.json`, borrar el lock npm,
   `pnpm install`, resolver WARN de build scripts (`onlyBuiltDependencies`) y añadir
   `packageManager` a `package.json`.
2. Motor + tests + marcadores sobre los 4 documentos (contenido aún npm).
3. Hook + CI + skill + contrato en `AGENTS.md`. Nota: mientras CI siga en npm, el paso
   usa `npm run docs:check`; en el paso 4 pasa a `pnpm docs:check`.
4. Prosa corregida a mano con la skill: regla pnpm de `AGENTS.md`, comandos del README,
   `DEPLOY.md`, `.env.example`, aviso de `/admin/ajustes`; se eliminan los conteos de
   pruebas del README (se cita `pnpm test`) y el consejo peligroso
   `npx biome check --write .` de `AGENTS.md:46`.
5. Verificación global: lint, type-check, test, build, e2e y `docs:check` verdes.

## 9. Operativa y riesgos

- La implementación requiere **pausar la sesión Codex concurrente**: tiene un
  `pnpm install` interrumpido y `scripts/start-e2e.mjs` modificado sin commitear
  (**preservar** ese cambio, no revertirlo).
- Los `docs/superpowers/plans|specs` históricos no se tocan; el stash ajeno
  (`codex-pre-update-2026-10-16`, de otro proyecto) se ignora.
- Coste por commit: ~1–2 s del hook; beneficio: drift mecánico imposible localmente y
  candado en CI.
- El motor usa el `node` del sistema (v24 disponible) y no importa `node_modules`.
- `prepare`/`lefthook install` en entornos sin git o CI: mitigación `LEFTHOOK=0`
  (desactiva hooks sin romper `pnpm install`).
- Estado actual de la migración: sin `node_modules` y sin `pnpm-lock.yaml`;
  `package-lock.json` existe y coincide con HEAD — el paso 1 de §8 parte de ahí.

## 10. Criterios de éxito

1. `docs:check` verde sobre el repo migrado y fallando ante cada caso de §7.
2. Segundo `sync` sin cambios (idempotencia) demostrado en unit tests.
3. Un commit real con cambio de `package.json` muestra al hook regenerando y stageando
   solo lo que corresponde.
4. Migración pnpm completa ejecutada como piloto, con los 4 documentos correctos y sin
   citas npm vivas (fuera de histórico).
5. Cualquier sesión de IA nueva puede operar leyendo `AGENTS.md` + skill, sin
   correcciones humanas de documentación.

## 11. Fuera de alcance

- Generación de prosa libre (solo verificación de hechos citados).
- Textos de UI fuera de la migración (el aviso de ajustes se corrige una vez, no se
  verifica por el sistema).
- ADRs nuevos, `docs/superpowers` históricos, watcher continuo, hooks de
  pre-push/commit-msg.
