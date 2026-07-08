# Guía de Scripts y Utilidades

PranaKaia incluye una suite de scripts en PowerShell para automatizar el ciclo de desarrollo y mantenimiento en Windows.

## Scripts de Inicio Rápido 🚀

### `quick-start.ps1`

**Ubicación**: `scripts/quick-start.ps1`
Script "Todo en Uno". Realiza:

1. Verificación de entorno (Node, Docker, pnpm).
2. Setup de `.env`.
3. Instalación de dependencias.
4. Inicio de servicios Docker.
5. Migraciones y Seed de base de datos.
6. Inicio de aplicaciones.

### `setup.ps1`

**Ubicación**: `scripts/setup.ps1`
Enfocado en la configuración inicial del entorno de desarrollo. Útil para el primer onboarding.

## Mantenimiento y Operaciones 🛠️

### `health-check.ps1`

Verifica el estado de todos los servicios (Base de datos, API, Web, Redis).

```powershell
.\scripts\health-check.ps1
```

### `clean-all.ps1`

Limpieza profunda del proyecto. Borra `node_modules`, builds y cachés.

- Uso estándar: `.\scripts\clean-all.ps1`
- Limpieza profunda (Docker vols): `.\scripts\clean-all.ps1 -Deep`

### `backup-db.ps1` / `restore-db.ps1`

Gestión de backups de PostgreSQL.

- **Backup**: `.\scripts\backup-db.ps1` (Crea zip en `./backups`)
- **Restore**: `.\scripts\restore-db.ps1 -BackupFile "path/to/backup.zip"`

## Scripts de Actualización (SOTA) 📈

### `upgrade-dependencies.ps1`

Herramienta automatizada para mantener el stack al día (TypeScript, React, etc.).

- Uso: `.\scripts\upgrade-dependencies.ps1`
- Dry Run: `.\scripts\upgrade-dependencies.ps1 -DryRun`

## Validación y Auditoría (Staff Level) 🛡️

El monorepo utiliza un sistema de validación autónoma para garantizar el estado de **Zero-Violation**.

### `pnpm staff:audit` (Orquestador Maestro)

Ejecuta secuencialmente todos los módulos de auditoría:
1. **Security Triage**: Escaneo de vulnerabilidades y secretos.
2. **Foundation Audit**: Verificación de cimientos técnicos y aislamiento de `.env`.
3. **Architecture Shield**: Reglas de Gigantismo (<1000 líneas) y Aislamiento de Capas.

### `pnpm staff:audit:strict`

Versión estricta diseñada para el pipeline de CI/CD. Retorna un código de error si se detecta cualquier violación, bloqueando el merge del Pull Request.

### `pnpm quality:strict`

Comando de calidad total que ejecuta:
- `pnpm lint` (Biome)
- `pnpm type-check` (TypeScript)
- `pnpm turbo test` (Vitest)
- `pnpm staff:audit:strict`

## Automatización con Git Hooks 🪝

Utilizamos `Lefthook` para ejecutar validaciones automáticas:

- **Pre-Commit**: Linting y formateo rápido vía Biome.
- **Pre-Push**: Ejecución de `pnpm staff:audit:strict`. No se permite subir código que degrade la arquitectura del monorepo.
