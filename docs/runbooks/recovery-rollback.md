# Rollback Playbook

Ultima actualizacion: 2026-04-04

## Escenario

Aplicar rollback rapido cuando un release introduce errores en checkout, auth o pagos.

## Condiciones de activacion

- Error rate P0 en rutas criticas.
- Falla repetida de webhooks con impacto en ordenes.
- Degradacion severa de latencia o disponibilidad.

## Procedimiento

1. Congelar despliegues nuevos.
2. Identificar ultimo deploy sano.
3. Promover deploy estable inmediatamente.
4. Verificar salud minima:
   - auth login
   - checkout happy path
   - webhook smoke
5. Comunicar estado en canal de incidentes.
6. Abrir postmortem con causa raiz y plan de prevencion.

## Verificacion post-rollback

- staff:audit:strict en rama de fix.
- test:e2e:critical antes de reintentar release.
- Confirmar metricas en SLO durante 30 minutos.
