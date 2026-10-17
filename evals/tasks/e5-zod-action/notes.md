# e5-zod-action — notas de diseño

## Defecto (por qué es una tarea real)

En la base `abb4947`, `toggleMessageRead` hace `Number(formData.get("id"))` y
`if (!id) redirect("/admin/mensajes")`: un id dañado (`"abc"` → `NaN`, o `0`)
produce una redirección **idéntica a la del camino feliz**, sin error y sin
tocar la BD — fallo silencioso. `deleteMessage` tiene el mismo patrón con
`if (id) { ...borrar... }`; con id inválido no borra nada y redirige igual que
si hubiera borrado. Ninguna de las dos valida la entrada (a diferencia del
resto del archivo, donde `sendMessage` sí usa `contactSchema`). Verificado en
`src/lib/actions/messages.ts` (líneas 63–109 en esa base).

## Solución de referencia (PR-5)

1. `src/lib/validation.ts`: esquema del id (`z.coerce.number().int().positive()`
   o equivalente idiomático del archivo) con mensaje en español.
2. En ambas acciones: parsear; si falla → `redirect("/admin/mensajes?error=invalid")`
   antes de tocar la BD; si pasa, comportamiento actual intacto.
3. Tests unitarios del esquema en `src/lib/validation.test.ts`.

## Qué mide la aceptación

- Manipula el `input[type=hidden][name=id]` del formulario (vía DOM, como lo
  haría un atacante o un formulario dañado) y comprueba que la acción
  **rechaza sin tocar la BD** y que la URL lleva `?error=invalid`
  (convención fijada por el spec para distinguir el rechazo).
- Con id inválido `"abc"` y `"0"`; después repite con el id real y verifica el
  camino feliz (toggle alterna `read`; delete borra la fila).
- Detección del test unitario: busca en `git status --porcelain` archivos
  `src/**/*.test.ts` nuevos o modificados (los clones del motor conservan
  `.git`) y ejecuta `pnpm exec vitest run` solo sobre ellos; deben pasar.

La página de mensajes no muestra el parámetro `error` en UI (no usa `Flash`),
por eso la aserción es sobre la URL y el estado de la BD, no sobre un mensaje.

## Validación en rojo (PR-3)

La aceptación **no** se corre en rojo en PR-3 (por spec: solo e1). En la base,
el primer `waitForURL(/error=invalid/)` expira porque el camino inválido
redirige sin parámetro → rojo esperado. Se confirmó leyendo la acción y el
comportamiento del formulario.

## Límites

- El clon parte de `abb4947` (post-PR-2): el motor de evals es visible para el
  agente, pero los archivos de `evals/tasks/` de PR-3 no existen en esa base,
  así que la aceptación permanece oculta.
- La detección del test unitario exige al menos un `src/**/*.test.ts`
  nuevo/modificado; no juzga su calidad (solo que pase junto al resto).
