# Overview

Runbook de simulacro de recuperacion ante desastre (DR drill) para PranaKaia.

## Purpose

1. Validar que la plataforma puede recuperarse dentro del objetivo operativo.
2. Medir RTO/RPO reales con evidencia ejecutable.
3. Detectar brechas de automatizacion y observabilidad en crisis.

## Prerequisites

1. Backups funcionales con scripts de base de datos.
2. Rollback playbook actualizado.
3. Equipo de respuesta con roles definidos.

## Instructions

1. Preparacion:
   - confirmar estado base con `pnpm staff:audit:strict`.
   - confirmar backups recientes con `pnpm db:list`.
2. Simulacro:
   - declarar incidente DR simulado.
   - ejecutar restauracion en entorno de recuperacion con `pnpm db:restore`.
   - validar endpoints criticos (auth, checkout, webhooks).
3. Medicion:
   - registrar tiempo inicio incidente.
   - registrar tiempo de recuperacion funcional (RTO).
   - registrar antiguedad de datos restaurados (RPO).
4. Cierre:
   - documentar resultados y brechas.
   - crear acciones correctivas con owner y fecha.

## Targets

1. RTO objetivo: menor o igual a 15 minutos.
2. RPO objetivo: menor o igual a 5 minutos.
