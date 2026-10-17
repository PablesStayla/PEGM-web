# Tarea de evaluación e3 — Crear una skill compartida para el harness multiagente

Hola. Soy Pablo, ingeniero civil metalúrgico y mantengo mi sitio personal (Next.js + TypeScript + Tailwind + Drizzle/libSQL). Estoy midiendo la capacidad de asistentes de código para resolver tareas reales de este repositorio, así que necesito que trabajes de forma autónoma: sin preguntarme nada, sin ayuda externa.

Tienes el repositorio completo en tu directorio de trabajo, con `AGENTS.md` (léelo antes de tocar nada) y todas las herramientas ya instaladas. Usa `pnpm` exclusivamente.

## El contexto

Este repo tiene un **harness multiagente**: `AGENTS.md` es la fuente de verdad y las skills compartidas viven en `.agents/skills/<nombre>/SKILL.md` con frontmatter (`name` + `description`). Todo eso está documentado en `docs/agentes.md` y lo verifica `pnpm check:agents`.

## Qué se espera (observable)

1. Crear la skill **`admin-zone`** en `.agents/skills/admin-zone/SKILL.md` (el nombre de la carpeta y del frontmatter debe ser exactamente ese).
2. La skill debe enseñar el proceso de **añadir una zona CRUD nueva al panel de administración** de este proyecto, siguiendo el patrón real que ya existe (Experiencia, Educación, Habilidades, Mensajes): tabla en `src/db/schema.ts`, esquema Zod en `src/lib/validation.ts`, server actions con `redirect` y mensajes `?saved=1` / `?deleted=1` / `?error=invalid`, consultas en `src/lib/data.ts`, página del panel con `Section`/formularios/`SubmitButton`/`ConfirmButton`, revalidación con `revalidatePath` y pruebas. Sigue el formato y el tono de las skills existentes (`.agents/skills/`).
3. Registrarla en `docs/agentes.md`, en la sección **«Skills compartidas»**, con una viñeta del estilo `- \`admin-zone\` - descripción.` (como las demás).
4. `pnpm check:agents` queda en verde.

## Reglas

- Sigue las convenciones que describe `AGENTS.md` (documentación y comentarios en español, no cambiar el tooling).
- No toques el código de la aplicación: esta tarea es de harness/documentación.
- No hagas `git commit` ni `git push`: entrega los cambios en el árbol de trabajo.
- Antes de terminar, deja en verde, en este orden: `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm docs:check`, `pnpm check:agents`, `pnpm build` y `pnpm test:e2e`.

Cuando termines, resume qué cambiaste y cómo lo verificaste.
