# Protección de Rama `main` — Instrucciones de Configuración

**Estado:** No se pudo configurar automáticamente (API de GitHub devuelve 401 — sin token de autenticación).  
**Acción requerida:** Un usuario con permisos de administrador en el repositorio debe completar estos pasos manualmente.

## Reglas deseadas para `main`

| Regla | Valor | Justificación |
| --- | --- | --- |
| Requerir pull request antes de merge | **Sí** | Evitar pushes directos a `main` |
| Requerir revisión de código | **Sí** (1 revisor mínimo) | Doble verificación de cambios |
| Requerir checks de estado antes de mergear | **Sí** | `build`, `e2e`, `guards`, `docs:check` |
| Rama debe estar actualizada antes de mergear | **Sí** | Evitar conflictos y builds rotos |
| Bloquear force-push | **Sí** | Preservar historial de commits |
| Bloquear eliminación de rama | **Sí** | Prevenir pérdida accidental de historial |
| Permitir bypass de reglas | **No** | Sin excepciones, ni para administradores |
| Restringir quién puede hacer push | Mantenedores solamente | Evitar cambios no revisados |

## Pasos para configurar en GitHub

1. Ir a **Settings → Branches** del repositorio
2. Hacer clic en **Add branch protection rule**
3. En **Branch name pattern** escribir: `main`
4. Marcar las siguientes opciones:
   - [x] **Require a pull request before merging**
   - [x] **Require approvals** → 1
   - [x] **Require status checks to pass before merging**
   - [x] **Require branches to be up to date before merging**
   - [x] **Restrict pushes that create files** (opcional, recomendado)
   - [x] **Do not allow bypassing the above settings**
   - [x] **Lock branch** (opcional, solo si no se esperan cambios urgentes)
5. En **Status checks that are required**, agregar:
   - `build`
   - `e2e`
   - `guards`
   - `docs:check` (si existe como check separado)
6. Hacer clic en **Create**

## Verificación

Después de configurar, crear un PR de prueba y verificar que:
- No se puede hacer push directo a `main`
- No se puede hacer merge sin que todos los checks estén verdes
- No se puede hacer merge sin al menos una aprobación
- No se puede hacer force-push a `main`

## Nota

El archivo `.github/workflows/ci.yml` ya define los jobs `build`, `e2e` y `guards`. El job `guards` ejecuta `pnpm run check:agents` y `pnpm audit --prod --audit-level=high`. El paso `docs:check` está incluido dentro del job `build`.

## Evidencia

- URL de configuración: `https://github.com/PablesStayla/PEGM-web/settings/branches`
- Repositorio: `PablesStayla/PEGM-web`
- Rama protegida: `main`
