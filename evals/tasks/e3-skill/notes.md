# e3-skill — notas de diseño

## Por qué es una tarea real

El repo mantiene skills compartidas en `.agents/skills/` (hoy:
feature-workflow, modern-web-guidance, security-review, task-handoff) y las
documenta en `docs/agentes.md`. Añadir una skill nueva toca tres contratos a
la vez: el formato del frontmatter, el registro en la documentación y el
candado `pnpm check:agents` (que valida presencia y formato). La skill pedida
—`admin-zone`— es útil de verdad: codifica el patrón CRUD del panel que hoy
solo existe implícito en cuatro zonas.

## Qué exige la aceptación

1. `.agents/skills/admin-zone/SKILL.md` existe y su frontmatter declara
   `name: admin-zone` y una `description` no vacía (≥ 20 caracteres).
2. `docs/agentes.md` contiene la viñeta de registro `- \`admin-zone\` …`.
3. `pnpm check:agents` en verde.

No se juzga la calidad del contenido de la skill (eso requeriría un revisor);
solo que exista con el formato y el registro correctos, que es lo que el
harness puede verificar de forma determinista.

## Validación en rojo (PR-3)

La aceptación **no** se corre en rojo en PR-3 (por spec: solo e1). En la base
falla en el paso 1 (la skill no existe). Se verificó en PR-3 con un dry-run
local sobre el clon (sin skill → ROJO; con skill + registro temporales →
verde, revertidos después).

## Límites

- El clon parte de `abb4947` (post-PR-2): el motor de evals es visible, los
  archivos de esta tarea no.
- Una skill con contenido pobre pero frontmatter/registro correctos pasaría;
  se acepta a cambio de un chequeo 100 % determinista y barato.
