# Notas de implementación - E1

## Decisiones de diseño

- Usar `timestamp_ms` para `updated_at` para consistencia con `created_at` en otras tablas
- Usar `$defaultFn(() => new Date())` para que el valor se establezca automáticamente en inserción
- El `updated_at` se actualiza automáticamente en Drizzle cuando se usa `.update()` con `set({...})` que incluya el campo

## Consideraciones

- La tabla `users` ya tiene `updatedAt` (campo `session_epoch` no es `updated_at`, es un campo diferente para revocación de sesiones)
- Las tablas `projects` y `settings` ya tienen `updated_at`
- Las tablas `experience`, `education`, `certifications`, `skills`, `languages` NO tienen `updated_at`

## Pruebas necesarias

Se necesita una prueba de integración que:
1. Inserte un registro en cada tabla con `updated_at`
2. Verifique que el `updated_at` se haya establecido correctamente
3. Actualice el registro
4. Verifique que el `updated_at` se haya actualizado
