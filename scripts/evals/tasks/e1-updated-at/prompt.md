# Tarea E-1: Persistencia de fechas de modificación (updated_at)

## Descripción

Las tablas de base de datos `experience`, `education`, `certifications`, `skills` y `languages` no tienen columna `updated_at`, mientras que `projects` y `settings` sí la tienen. Cuando se actualiza un registro en estas tablas, no hay forma de saber cuándo fue modificado por última vez.

Además, la función `resolveInitialAdminCredentials` en `src/lib/seed-credentials.ts` comprueba `ADMIN_PASSWORD === DEFAULT_ADMIN_PASSWORD` en producción, pero no comprueba si `ADMIN_EMAIL` está vacía o contiene solo espacios.

## Objetivo

Implementar las columnas `updated_at` en las tablas que las faltan y asegurar que se actualicen automáticamente al modificar un registro.

## Tareas específicas

### 1. Añadir columna `updated_at` a las tablas que no la tienen

Las tablas que necesitan `updated_at` son:
- `experience`
- `education`
- `certifications`
- `skills`
- `languages`

Cada tabla debe tener:
- `updated_at: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date())`

### 2. Crear migraciones Drizzle

Crear migraciones Drizzle para agregar las columnas `updated_at` a las tablas correspondientes.

### 3. Verificar que las inserciones y actualizaciones funcionan

Escribir una prueba de integración que:
1. Cree un registro en cada tabla con `updated_at`
2. Verifique que el `updated_at` se haya establecido correctamente
3. Actualice el registro
4. Verifique que el `updated_at` se haya actualizado

## Requisitos de aceptación

- Todas las tablas (`projects`, `experience`, `education`, `certifications`, `skills`, `languages`) tienen columna `updated_at`
- Las migraciones se aplican correctamente
- Los datos se pueden insertar y actualizar correctamente
- El `updated_at` se actualiza automáticamente al modificar un registro
- No hay regresiones en las pruebas existentes

## Criterios de éxito

- `pnpm lint` pasa sin errores
- `pnpm run type-check` pasa sin errores
- `pnpm test` pasa (todas las pruebas)
- `pnpm docs:check` pasa
- `pnpm run check:agents` pasa
- `pnpm build` pasa
- Las pruebas de integración para `updated_at` pasan

## Tiempo estimado

30-45 minutos