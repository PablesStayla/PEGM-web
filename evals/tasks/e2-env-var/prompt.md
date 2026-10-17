# Tarea de evaluación e2 — Variable de entorno para el límite de contacto

Hola. Soy Pablo, ingeniero civil metalúrgico y mantengo mi sitio personal (Next.js + TypeScript + Tailwind + Drizzle/libSQL). Estoy midiendo la capacidad de asistentes de código para resolver tareas reales de este repositorio, así que necesito que trabajes de forma autónoma: sin preguntarme nada, sin ayuda externa.

Tienes el repositorio completo en tu directorio de trabajo, con `AGENTS.md` (léelo antes de tocar nada) y todas las herramientas ya instaladas. Usa `pnpm` exclusivamente.

## El problema

El formulario público de contacto limita los envíos a **5 por hora por IP**, pero el número está fijo en el código (`sendMessage`, en `src/lib/actions/messages.ts`). Quiero poder ajustarlo por entorno sin tocar código: **`CONTACT_RATE_LIMIT_PER_HOUR`**.

## Qué se espera (observable)

1. `sendMessage` lee el límite desde `process.env.CONTACT_RATE_LIMIT_PER_HOUR`. Si la variable no está definida, no es un número entero o es menor que 1, debe usarse **5** (comportamiento actual). El resto de la lógica de rate limiting no cambia (misma clave por IP, misma ventana de una hora).
2. La variable queda declarada en `.env.example` con un comentario breve (es la fuente de verdad del contrato de entorno) y se documenta donde corresponde en `scripts/docs-sync.mjs`.
3. La documentación viva queda regenerada: corre `pnpm docs:sync`.
4. `pnpm docs:check` y `pnpm check:agents` quedan en verde (el candado exige que una variable declarada esté realmente usada en el código, en ambas direcciones).

## Reglas

- Sigue las convenciones que describe `AGENTS.md` (comentarios y texto en español, no cambiar el tooling, `pnpm` siempre).
- No toques la interfaz del formulario público ni el honeypot.
- No hagas `git commit` ni `git push`: entrega los cambios en el árbol de trabajo.
- Antes de terminar, deja en verde, en este orden: `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm docs:check`, `pnpm check:agents`, `pnpm build` y `pnpm test:e2e`.

Cuando termines, resume qué cambiaste y cómo lo verificaste.
