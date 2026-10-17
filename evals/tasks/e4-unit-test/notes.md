# e4-unit-test — notas de diseño

## Por qué es una tarea real

`src/lib/validation.ts` (línea 28 en la base) define:

```ts
const nonEmptyString = (campo: string) =>
  z.string().trim().min(1, `El campo ${campo} es obligatorio.`);
```

Su semántica (recortar y luego exigir no-vacío) no está cubierta por ninguna
prueba: `validation.test.ts` solo prueba casos de campos vacíos exactos y otras
validaciones. Quitar el `.trim()` o invertir el orden deja la suite en verde
pero cambia el comportamiento del panel (aceptaría `"   "` y guardaría valores
con espacios).

## Cómo mide la aceptación (sensible a mutaciones)

1. Detecta por `git status --porcelain` los archivos `src/**/*.test.ts` nuevos
   o modificados (los clones del motor conservan `.git`), exige al menos uno y
   lo ejecuta con Vitest: debe pasar.
2. **Muta** el ancla única
   `z.string().trim().min(1, \`El campo ${campo} es obligatorio.\`)` a
   `z.string().min(1, …)` (quirúrgico, sobre bytes del archivo), re-ejecuta
   solo esos tests y exige que **fallen**: un test que no detecta la ruptura
   no vale.
3. Restaura el archivo original en `finally` (nunca deja el árbol mutado).

Si el ayudante cambió de forma (el agente lo tocó pese a la regla), la
aceptación falla con un mensaje claro en vez de mutar a ciegas.

## Validación en rojo (PR-3)

La aceptación **no** se corre en rojo en PR-3 (por spec: solo e1). En la base
falla en el paso 1 (no hay ningún test nuevo/modificado). Se verificó en PR-3
con un dry-run local: test temporal correcto → verde (muta, detecta, restaura);
test temporal débil → ROJO; revertido después.

## Límites

- El clon parte de `abb4947` (post-PR-2): el motor de evals es visible, los
  archivos de esta tarea no.
- Un test que solo compruebe `""` exacto no detecta la mutación (`min(1)`
  sigue rechazándolo) y por eso la aceptación lo considera insuficiente: exige
  el caso de solo espacios o el de recorte, como pide el prompt.
