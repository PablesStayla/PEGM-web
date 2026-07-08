# Overview

Procedimiento operativo de bug bounty para recepcion, triage, remediacion y cierre de hallazgos de seguridad.

## Purpose

1. Convertir la politica de bug bounty en un flujo operativo trazable.
2. Asegurar ownership, SLA y evidencia de cierre por hallazgo.
3. Medir salud del programa de forma mensual.

## Prerequisites

1. Canal de reporte activo en SECURITY.md.
2. Plantilla de reporte de seguridad activa en .github/ISSUE_TEMPLATE/security-report.yml.
3. On-call de seguridad y owner de plataforma definidos.

## Instructions

1. Recepcion y acuse:
   - Canal primario: security@pranakaia.cl.
   - Acuse de recibo en <= 48h.
   - Confirmar si el hallazgo esta in-scope y solicitar evidencia faltante.
2. Triage inicial:
   - Clasificar severidad (Critical, High, Medium, Low).
   - Abrir ticket interno con label security y owner explicito.
   - Definir ETA de contencion o fix.
3. Remediacion:
   - Aplicar fix con PR y evidencia de validacion (tests, logs, repro).
   - Ejecutar retest del escenario reportado.
   - Registrar impacto real y riesgo residual.
4. Cierre:
   - Comunicar resolucion al reportante.
   - Publicar resumen sanitizado en changelog interno de seguridad.
   - Actualizar metricas del programa.

## Ownership y SLA

1. Security Triage Owner: Team Security.
2. Technical Remediation Owner: Team dueña del modulo afectado.
3. SLA operativo:
   - Ack: <= 48h.
   - Triage: <= 5 dias habiles.
   - Plan de remediacion High/Critical: <= 7 dias.
   - Retest y cierre: <= 14 dias desde fix en produccion.

## Metricas Minimas

1. Tiempo de acuse (median y p95).
2. Tiempo de triage (median y p95).
3. Tiempo a fix por severidad.
4. Hallazgos abiertos por severidad.
5. Tasa de re-apertura post retest.

## Artefactos de Evidencia

1. SECURITY.md (canal y SLA publicados).
2. docs/operations/BUG_BOUNTY_POLICY.md (politica).
3. .github/ISSUE_TEMPLATE/security-report.yml (captura estructurada).
4. docs/reports/SECURITY_BUG_BOUNTY_MONTHLY.md (resumen operativo mensual).
