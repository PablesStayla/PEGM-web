# Arquitectura de Eventos y Mensajería

> Versión: 1.0
> Broker principal: Inngest (evaluando BullMQ como migración OSS)

---

## Principios

1. **Eventos como fuente de verdad** — toda mutación de estado relevante se emite como Domain Event inmutable. No hay side effects invisibles entre servicios.
2. **Desacoplamiento estricto** — los servicios solo se comunican mediante eventos. No hay llamadas síncronas entre servicios de negocio.
3. **Idempotencia nativa** — todo consumidor de eventos debe ser idempotente por diseño. Un mismo evento puede entregarse más de una vez.

## Formato de Eventos

```json
{
  "type": "order.placed",
  "version": 1,
  "traceId": "trac_01J...",
  "timestamp": "2026-05-01T13:30:00.000Z",
  "payload": { },
  "metadata": {
    "source": "order-service",
    "correlationId": "ord_01J...",
    "userId": "usr_01J..."
  }
}
```

- `type`: nombre del evento en notación `domain.aggregate.action`.
- `version`: número entero para schema evolution.
- `traceId`: tracing distribuido (OpenTelemetry), propagado a todos los eventos hijos.
- `timestamp`: ISO 8601 UTC.
- `payload`: datos del evento, evolucionables por versión.
- `metadata`: contexto del emisor.

## Schema Evolution

- **Forward compatibility:** consumidores viejos ignoran campos nuevos en el payload.
- **Backward compatibility:** consumidores nuevos toleran la ausencia de campos recién agregados (valores default).
- Todo cambio de schema se registra en un **Schema Registry** (JSON Schema o Confluent Schema Registry).
- Eventos con `version` superior a la soportada por un consumidor se derivan a una cola de migración.

## Schema Registry

- Repositorio central de schemas por tipo de evento y versión.
- Validación automática en publicación: si el evento no cumple el schema registrado, se rechaza.
- Histórico de versiones para debugging y reprocesamiento.

## Outbox Pattern

- Estado: ✅ **Implementado** en `core-domain/infrastructure/outbox/`.
- Las órdenes y eventos transaccionales se escriben primero en la tabla `outbox` dentro de la misma transacción de base de datos.
- Un worker separado (OutboxPublisher) lee la tabla y publica los eventos en Inngest.
- Garantiza *exactly-once delivery* eventual sin depender de transacciones distribuidas.
- Los eventos fallidos tras N reintentos pasan a la Dead Letter Queue.

## Dead Letter Queue (DLQ)

- Eventos que superan el máximo de reintentos (configurable por tipo, default 5).
- Almacenamiento: tabla `dead_letter_queue` con payload original, error, stack trace y timestamp.
- Alerta automática al equipo al insertar en DLQ.
- Consola de administración para reencolar eventos corregidos o descartarlos definitivamente.

## Colas de Prioridad

- **Alta:** sincronización de inventario (cada 15 minutos, no debe bloquearse tras colas lentas).
- **Media:** confirmación de órdenes, webhooks de pago.
- **Baja:** notificaciones por email, actualización de catálogo secundario.

## Eventos del Dominio (Catálogo Inicial)

| Tipo | Versión | Emisor | Consumidores |
|---|---|---|---|
| `order.placed` | 1 | OrderService | PaymentService, InventoryService, NotificationService |
| `order.confirmed` | 1 | PaymentService | FulfillmentService, AccountingService |
| `payment.captured` | 1 | PaymentService | OrderService, AccountingService |
| `payment.refunded` | 1 | PaymentService | OrderService, AccountingService |
| `inventory.synced` | 1 | InventoryService | ProductService |
| `shipment.created` | 1 | FulfillmentService | OrderService, NotificationService |
| `fraud.alert` | 1 | RiskScorer | PaymentService, AdminPanel |
| `tax.calculated` | 1 | TaxCalculator | OrderService |

## Monitoreo

- Dashboard Grafana con métricas: eventos publicados/consumidos por minuto, latencia p99, tasa de fallos, tamaño de DLQ.
- Alertas: DLQ no vacía por más de 15 minutos, tasa de fallo > 2%, eventos duplicados detectados.

---

*Última actualización: 2026-05-01*