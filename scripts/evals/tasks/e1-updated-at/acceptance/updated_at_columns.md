# Criterios de aceptación: E1 - Persistencia de fechas de modificación

## Criterio 1: Todas las tablas tienen columna `updated_at`

Las siguientes tablas deben tener una columna `updated_at` con tipo `timestamp_ms`:

- `projects` ✓ (ya existe)
- `experience` ❌ (falta)
- `education` ❌ (falta)
- `certifications` ❌ (falta)
- `skills` ❌ (falta)
- `languages` ❌ (falta)

## Criterio 2: Las migraciones se aplican correctamente

Después de ejecutar `pnpm db:generate` y aplicar las migraciones, todas las tablas deben tener la columna `updated_at` con valores no nulos para registros existentes.

## Criterio 3: Inserción de registros con updated_at

Al insertar un registro en cualquiera de las tablas, el campo `updated_at` debe tener un valor válido (no null, fecha razonable).

## Criterio 4: Actualización automática de updated_at

Al actualizar un registro existente en cualquiera de las tablas, el campo `updated_at` debe actualizarse automáticamente a la fecha/hora actual.

## Criterio de éxito global

- `pnpm lint` pasa sin errores
- `pnpm run type-check` pasa sin errores
- `pnpm test` pasa (95/95 pruebas)
- `pnpm docs:check` pasa
- `pnpm run check:agents` pasa
- `pnpm build` pasa
- Las pruebas de integración para `updated_at` en cada tabla pasan
