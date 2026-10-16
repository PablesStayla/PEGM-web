# Agentes y herramientas — guía del harness multiagente

Fuente de verdad de instrucciones: [AGENTS.md](../AGENTS.md). Este documento la
complementa con: compatibilidad por herramienta, contrato de ingeniería, flujo
multiagente y reglas de contexto. Mantenerlo corto y sincronizado.

## Cómo lee las instrucciones cada herramienta (verificado)

| Herramienta | Lee | Notas |
| --- | --- | --- |
| OpenAI Codex | `AGENTS.md` (raíz y ancestros) y `~/.codex/AGENTS.md` | Soporta `AGENTS.override.md`; rutas alternativas configurables. |
| Claude Code | `AGENTS.md` **solo si no existe** `CLAUDE.md` | Si existe `CLAUDE.md`, ese manda (v2.1.277+); puede delegar con `@AGENTS.md`. `CLAUDE.local.md` también lo suprime; el guard solo vigila `CLAUDE.md`. |
| Antigravity | `AGENTS.md` o `GEMINI.md` (ancestros) | Además `.agents/rules/*.md` con frontmatter; global `~/.gemini/AGENTS.md`. |
| OpenCode | `AGENTS.md` (raíz y `~/.config/opencode/AGENTS.md`) | Carga skills nativas desde `.agents/skills/` (verificado en esta máquina). |

**Consecuencia:** no se crean adaptadores. Si algún día hace falta uno
(p. ej. `CLAUDE.md`), debe **delegar** (`@AGENTS.md`) y nunca duplicar
instrucciones; `pnpm run check:agents` (job `guards` del CI) lo verifica.

Sin verificar aún (no asumir): lectura de `.agents/skills/` por Claude Code,
Codex y Antigravity; reglas `.agents/rules/` fuera de Antigravity.

## Skills compartidas

Formato: `.agents/skills/<nombre>/SKILL.md` con frontmatter `name` y `description`.

- `modern-web-guidance` — guía web moderna (frontend).
- `feature-workflow` — flujo end-to-end de funcionalidad (este repo).
- `security-review` — checklist de revisión de seguridad (este repo).
- `task-handoff` — empaquetar estado para transferir una tarea a otro modelo.

## Contrato de ingeniería (resumen operativo)

1. Reconocimiento antes de tocar código: entender archivos, contratos y datos reales.
2. Análisis de impacto arquitectónico (capa de datos, rutas, BD, render).
3. Decisiones explícitas: verificado vs. propuesto vs. supuesto.
4. Plan escrito para cambios no triviales (`docs/superpowers/plans/`).
5. Prueba que falla primero (TDD); implementación mínima después.
6. Cambios pequeños, un commit temático por intención.
7. Gates obligatorios: `pnpm lint` · `pnpm test` · `pnpm run type-check`.
8. `pnpm build` y `pnpm run test:e2e` cuando el cambio toca rutas, BD o render.
9. Documentación viva sincronizada en el mismo cambio (comandos, env, rutas).
10. Seguridad: sin secretos, guards de producción intactos, inputs validados con Zod.
11. Rendimiento/UX: no romper hidratación SSR ni añadir polling innecesario.
12. Revisión: PR con evidencia (salidas de gates) y riesgos; revisión independiente.
13. Iterar sobre la revisión hasta cerrar hallazgos; registrar lo diferido y por qué.
14. Sin deploy ni cambios destructivos sin autorización explícita.
15. Al cerrar: informe breve (qué, por qué, evidencia, pendientes).

## Flujo multiagente

- **Una sesión por worktree.** Si otra sesión trabaja en el repo, crear
  `git worktree add ../<repo>-<tema> -b <rama>` y trabajar ahí.
- Ramas: `feat/*`, `fix/*`, `docs/*`; `main` solo por PR con CI en verde.
- No sobrescribir trabajo concurrente: si un archivo lo está editando otra
  sesión (p. ej. documentación viva), coordinar por PR y resolver el merge
  en la rama, no en el árbol del otro.
- Transferencias entre modelos: skill `task-handoff` (formato de estado cerrado).
- El patrón SDD (`.superpowers/sdd/<tema>/progress.md`) sirve como bitácora
  local de tareas; es local (gitignored), no un entregable.

## Git y finales de línea

- **LF en todo**: `.gitattributes` (`* text=auto eol=lf`) + Biome
  (`lineEnding: "lf"`). Los binarios van marcados `binary`.
- Motivo verificado: el CI (Ubuntu) hace checkout LF; con Biome en CRLF el
  lint fallaba en GitHub. No cambiar esta política.
- Mensajes de commit en español; con acentos, usar archivo UTF-8 + `git commit -F`.

## Hooks y CI

- Hooks locales (cuando existan; `lefthook.yml` llega con el sistema de
  documentación viva): lint y type-check antes de commit — los mismos gates
  que CI.
- CI (`.github/workflows/ci.yml`): jobs `build` (lint/tests/type-check/build),
  `e2e` (Playwright) y `guards` (consistencia multiagente + auditoría de
  dependencias de producción).
- Dependabot semanal (`.github/dependabot.yml`); los majors llegan como PR
  individual.
- Protección de rama recomendada para `main` (GitHub → Settings → Rules):
  PR obligatorio, checks requeridos `build` + `e2e` + `guards`, sin force-push.

## Reglas de contexto (economía de tokens)

- Preferir búsqueda dirigida (grafo/grep) sobre leer archivos completos.
- No pegar salidas gigantes: resumir con rutas + líneas.
- Cargar solo la skill relevante; no expandir docs enteras.
- MCP: el repositorio no define servidores MCP propios (la máquina puede
  tener MCPs personales del usuario). A nivel de repo se evalúa caso a caso
  (seguridad, mantenimiento y ruido de contexto) — no conectar por inercia.
- Este documento y `AGENTS.md` son el contexto externo canónico: mantenerlos
  cortos vale más que agregar detalle.
