# Tarea de evaluación e4 — Pruebas unitarias del recorte de espacios

Hola. Soy Pablo, ingeniero civil metalúrgico y mantengo mi sitio personal (Next.js + TypeScript + Tailwind + Drizzle/libSQL). Estoy midiendo la capacidad de asistentes de código para resolver tareas reales de este repositorio, así que necesito que trabajes de forma autónoma: sin preguntarme nada, sin ayuda externa.

Tienes el repositorio completo en tu directorio de trabajo, con `AGENTS.md` (léelo antes de tocar nada) y todas las herramientas ya instaladas. Usa `pnpm` exclusivamente.

## El problema

Los esquemas de administración de `src/lib/validation.ts` usan un ayudante interno `nonEmptyString` que recorta los espacios de los campos de texto (`trim`) antes de exigir que no queden vacíos. Ese comportamiento **no tiene ninguna prueba**: si alguien quitara el `trim()` o cambiara el orden, la suite actual seguiría en verde, aunque el panel empezara a aceptar campos en blanco (`"   "`) o a guardar valores con espacios sobrantes.

## Qué se espera (observable)

1. **Pruebas unitarias nuevas** (en `src/lib/validation.test.ts` o en un archivo nuevo `src/**/*.test.ts`, siguiendo el estilo y las herramientas de las pruebas que ya existen con Vitest) que cubran, a través de esquemas públicos (por ejemplo `experienceSchema` con datos base válidos):
   - un campo de texto en blanco (`"   "`, solo espacios) es **rechazado**;
   - un campo con espacios sobrantes (`"  Rol  "`) se **acepta** y el valor resultante queda **recortado** (`"Rol"`).
2. Las pruebas deben pasar con el código actual y **fallar si se rompe el comportamiento** que describen (p. ej. si `nonEmptyString` dejara de recortar).

## Reglas

- **No modifiques `src/lib/validation.ts`**: esta tarea es solo de pruebas. El código actual ya es correcto.
- No cambies el tooling ni la configuración; usa Vitest como las pruebas existentes.
- Sigue las convenciones que describe `AGENTS.md` (nombres y textos en español).
- No hagas `git commit` ni `git push`: entrega los cambios en el árbol de trabajo.
- Antes de terminar, deja en verde, en este orden: `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm docs:check`, `pnpm check:agents`, `pnpm build` y `pnpm test:e2e`.

Cuando termines, resume qué cambiaste y cómo lo verificaste.
