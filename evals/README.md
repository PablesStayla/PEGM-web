# Evals de agentes

Harness reproducible para medir agentes de código (Claude Code headless) contra
tareas reales del repositorio. Cada corrida trabaja sobre un clon temporal
aislado, deja evidencia estructurada en `evals/results/` y se resume en un
informe Markdown.

Diseño completo: `docs/superpowers/specs/2026-10-17-agent-evals-design.md`.

## Estructura

```
evals/
  tasks/<id>/            tarea: task.json, prompt.md, acceptance/, notes.md
  results/<experimento>/ baseline.json (1 por experimento) + run-<n>/result.json
  reports/<experimento>.md
```

Los clones, el `.env` de prueba y las bases de datos de cada corrida viven en
la carpeta temporal del sistema (`%TEMP%\pegm-evals\…` o `/tmp/pegm-evals/…`),
fuera del repositorio. `result.json` guarda la ruta del clon como evidencia.

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm evals:run run --task <id> --run <n>` | Corrida completa: clon → agente → diff → gates → aceptación → `result.json` |
| `pnpm evals:run validate --task <id>` | Confirma en rojo: la aceptación debe fallar sobre la base pristine (exit 0 = rojo; exit 1 = no discrimina) |
| `pnpm evals:run baseline --task <id>` | Gates sobre la base sin agente (una vez por experimento) |
| `pnpm evals:report` | Genera/actualiza `evals/reports/*.md` desde `evals/results/` |

Banderas: `--experimento <nombre>` (por defecto el id de la tarea), `--resume
<session-id>` (reanudación neutral), `--usd-restante <monto>`, `--reanudaciones
<n>`, `--intervencion "tipo:nota"` (repetible), `--incidencia "nota"`
(repetible), `--repo <ruta>`.

## Niveles

- **A — autónomo:** aceptación verde + todos los gates verdes, sin reanudaciones ni intervenciones.
- **B — autónomo con reanudación:** igual que A con 1 reanudación neutral (mismo prompt, sin pistas).
- **C — asistido:** hubo intervención humana correctiva (no permitido en E1).
- **D — fallo:** aceptación roja o cualquier gate fallido.

## Aislamiento y secretos

- Clon con `git clone --shared` + `git checkout <base_commit>` + `remote remove origin`.
- `.env` de prueba: `AUTH_SECRET` efímero por corrida y admin `admin@pablo.cl` /
  `admin1234`. Nunca se copian credenciales reales de Turso/Vercel: el entorno
  de todos los procesos se sanea (ver `sanitizeEnv` en `scripts/evals/run.mjs`).
- La aceptación se copia al clon **después** de la corrida y de los gates; el
  agente nunca ve los verificadores. Esto solo está garantizado mientras la
  base de la tarea no contenga los archivos de `acceptance/` (verificar por tarea).
- Al agotarse el tiempo se mata el árbol de procesos completo (Windows:
  `taskkill /t /f`; POSIX: grupo de procesos).

## Limitaciones

- Pocas corridas son evidencia ilustrativa de un escenario, no un nivel general
  del agente ni del proveedor.
- El comportamiento depende de la versión del CLI y del modelo registrados.
- El costo proviene de la salida del CLI y puede diferir de la facturación real.
- En corridas reanudadas el diff es acumulativo (incluye el trabajo previo del clon).
- Los campos que el proveedor no exponga quedan en `null` con la razón en
  `notas`; no se inventan mediciones.

## Tests del motor

`pnpm test` cubre esquemas, formateo de informes, rutas seguras (`assertInside`),
saneamiento de entorno, parseo de la salida del CLI y cálculo de niveles, sin
gastar tokens (`scripts/evals/*.test.mjs`).
