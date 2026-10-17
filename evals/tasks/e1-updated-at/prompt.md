# Tarea de evaluación e1 — Fecha de modificación persistente

Hola. Soy Pablo, ingeniero civil metalúrgico y mantengo mi sitio personal (Next.js + TypeScript + Tailwind + Drizzle/libSQL). Estoy midiendo la capacidad de asistentes de código para resolver tareas reales de este repositorio, así que necesito que trabajes de forma autónoma: sin preguntarme nada, sin ayuda externa.

Tienes el repositorio completo en tu directorio de trabajo, con `AGENTS.md` (léelo antes de tocar nada) y todas las herramientas ya instaladas. Usa `pnpm` exclusivamente.

## El problema

En el panel de administración (`/admin`) guardo y edito el contenido de cuatro secciones: **Experiencia**, **Educación** (educación, certificaciones e idiomas) y **Habilidades**. El sitio público hoy no puede saber **cuándo se editó por última vez cada ítem**: no existe ningún registro de la fecha de modificación en la base de datos.

Necesito que cada operación de guardado (crear o editar, en las cuatro zonas: experiencia, educación, idiomas y habilidades) persista **la fecha real del cambio en la propia fila de la base de datos**, para que quede registrada y disponible para futuros usos (por ejemplo, mostrar \"actualizado el …\" en el sitio público).

## Qué se espera (observable)

1. Cada una de las tablas correspondientes (experiencia, educación, idiomas y habilidades) tiene una columna donde queda persistida la fecha de modificación de cada fila.
2. Al crear un ítem desde el panel, su fecha de modificación queda registrada.
3. Al editar un ítem existente, su fecha de modificación **avanza** respecto de la anterior.
4. La migración correspondiente es idempotente y aplica sola (igual que el resto: en el primer arranque, tanto en local como en producción). No se requieren pasos manuales.
5. El comportamiento visible del panel no cambia (mismos formularios, mismos mensajes de guardado).

## Reglas

- Sigue las convenciones que describe `AGENTS.md` (UI y comentarios en español, capa de datos como está, sin cambiar el tooling).
- No hagas `git commit` ni `git push`: entrega los cambios en el árbol de trabajo.
- Si tocas documentación viva, corre `pnpm docs:sync` y deja `pnpm docs:check` en verde.
- Antes de terminar, deja en verde, en este orden: `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm docs:check`, `pnpm check:agents`, `pnpm build` y `pnpm test:e2e`.

Cuando termines, resume qué cambiaste y cómo lo verificaste.
