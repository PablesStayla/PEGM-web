# Database Migrations Runbook

Last Updated: 2026-04-02

## Overview

Runbook operativo para ejecutar migraciones de base de datos sin afectar
checkout, ordenes y sincronizacion de inventario en dropshipping.

## Purpose

Garantizar cambios de esquema trazables, reversibles y compatibles con el
trafico productivo.

## Prerequisites

- Backup reciente disponible (`pnpm db:backup ...`).
- Ventana de cambio aprobada.
- Build y type-check en verde.
- Archivo de migracion revisado por al menos 1 reviewer.

## Instructions

1. Verificar estado local:
	- `pnpm --filter=@pranakaia/db type-check`
	- `pnpm --filter=@pranakaia/db db:generate`
2. Validar migracion en entorno staging:
	- `pnpm --filter=@pranakaia/db db:push`
	- Ejecutar pruebas de humo de ordenes y pagos.
3. Ejecutar migracion en produccion:
	- `pnpm --filter=@pranakaia/db db:migrate`
4. Confirmar integridad:
	- Verificar tablas e indices esperados.
	- Revisar errores de app y logs DB por 15 minutos.

## Verification

- No hay errores de conexion o query en APIs criticas.
- Esquema nuevo disponible en lecturas y escrituras.
- Tiempo de respuesta dentro de umbrales normales.

## Rollback

1. Restaurar backup validado mas reciente.
2. Revertir despliegue de app a version compatible con esquema anterior.
3. Registrar impacto y plan de correccion en postmortem.

