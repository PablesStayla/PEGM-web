# Evaluación de Agentes (Agent Evals)

Directorio para la evaluación del harness multiagente de PEGM-web.

## Estructura

```
scripts/evals/
├── tasks/
│   ├── e1-updated-at/          # E1: Persistencia de fechas de modificación
│   │   ├── task.json           # Metadatos de la tarea
    │   │   prompt.md           # Instrucciones para el agente
    │   │   acceptance/         # Criterios de aceptación
    │   │   └── updated_at_columns.md
    │   │   notes.md            # Notas de implementación
    │   e2-feature/             # E2: Implementación de una funcionalidad pequeña
    │   e3-security/            # E3: Corrección de seguridad
    │   e4-docs-tests/          # E4: Pruebas y documentación
    │   e5-refactor/            # E5: Refactorización sin regresiones
    results/                    # Resultados de las ejecuciones (se genera al correr)
    reports/                    # Informes generados (se genera al correr)
```

## Cómo ejecutar una evaluación

1. Crear una rama desde `main`: `git checkout -b feat/eval-<tarea> origin/main`
2. Ejecutar la tarea tal como se describe en `tasks/e1-updated-at/prompt.md`
3. Ejecutar todos los Quality Gates:
   - `pnpm lint`
   - `pnpm test`
   - `pnpm run type-check`
   - `pnpm docs:check`
   - `pnpm run check:agents`
   - `pnpm build`
   - `pnpm run test:e2e`
4. Registrar: tiempo empleado, intervenciones humanas, tokens, resultado de cada métrica
5. Crear un PR con el resumen de la evaluación

## Reglas de ejecución

- No se permiten atajos que omitan los Quality Gates.
- Cada tarea debe ejecutarse en una rama independiente.
- Los resultados deben ser reproducibles: otro agente debe poder ejecutar la misma tarea y obtener el mismo resultado.
- No se permite `git commit --no-verify` ni saltarse `docs:check`.

## Riesgos y limitaciones

- El costo y los tokens dependen del proveedor de LLM y no siempre están disponibles.
- Algunas tareas requieren acceso a la base de datos (pruebas de integración) y pueden no ser ejecutables en entornos sin Turso/SQLite local.
- La evaluación de "calidad de transferencia" es subjetiva y depende del revisor humano.
