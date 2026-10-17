# Tarea de evaluación e5 — Validación Zod en las acciones de mensajes

Hola. Soy Pablo, ingeniero civil metalúrgico y mantengo mi sitio personal (Next.js + TypeScript + Tailwind + Drizzle/libSQL). Estoy midiendo la capacidad de asistentes de código para resolver tareas reales de este repositorio, así que necesito que trabajes de forma autónoma: sin preguntarme nada, sin ayuda externa.

Tienes el repositorio completo en tu directorio de trabajo, con `AGENTS.md` (léelo antes de tocar nada) y todas las herramientas ya instaladas. Usa `pnpm` exclusivamente.

## El problema

La bandeja de mensajes del panel (`/admin/mensajes`) tiene dos acciones que reciben un `id` desde el formulario: **marcar como leído/no leído** (`toggleMessageRead`) y **eliminar** (`deleteMessage`), ambas en `src/lib/actions/messages.ts`. Hoy interpretan el id con `Number(formData.get("id"))` sin validarlo:

- Si el id viene vacío, no numérico o con valor `0`, las acciones **fingen haber funcionado**: redirigen sin error, no tocan la base de datos y el panel no avisa nada. Es un fallo silencioso, tanto si un formulario llega dañado como si alguien manipula el HTML.

## Qué se espera (observable)

1. Añadir un **esquema Zod** para ese id en `src/lib/validation.ts`, siguiendo las convenciones del archivo (coerción desde `FormData`, entero, positivo).
2. Usar el esquema en **`toggleMessageRead` y `deleteMessage`**: si el id es inválido (no numérico, vacío, cero o negativo), la acción **no debe tocar la base de datos** y debe redirigir a `/admin/mensajes?error=invalid`.
3. El comportamiento con un id válido no cambia: marcar leído/no leído alterna el estado y redirige a `/admin/mensajes`; eliminar borra el mensaje (con su registro de auditoría) y redirige a `/admin/mensajes`.
4. Añadir **pruebas unitarias** del esquema (por ejemplo en `src/lib/validation.test.ts`, siguiendo el estilo de las que ya existen): un id válido pasa; `""`, `"abc"`, `"0"` y `"-3"` fallan.

## Reglas

- Sigue las convenciones que describe `AGENTS.md` (comentarios y UI en español, no cambiar el tooling).
- No toques `sendMessage` ni el formulario público de contacto.
- No hagas `git commit` ni `git push`: entrega los cambios en el árbol de trabajo.
- Antes de terminar, deja en verde, en este orden: `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm docs:check`, `pnpm check:agents`, `pnpm build` y `pnpm test:e2e`.

Cuando termines, resume qué cambiaste y cómo lo verificaste.
