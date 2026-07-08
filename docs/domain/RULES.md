# Reglas de Negocio — Dropshipping E-Commerce

> Versión: 2.0 — Corregida y aumentada  
> Alcance: Reglas irrenunciables del dominio de venta por dropshipping

---

## Regla 1 — Strict Margin Safeguards (Margen Mínimo Garantizado)

**Descripción:** Ninguna orden puede finalizar si el margen neto (precio venta − costo producto − costo envío − comisión pasarela − IVA/impuestos) es inferior al 5%. El sistema recalcula el margen en tiempo real antes de confirmar la orden, considerando el costo real del proveedor al momento de la compra, no el precio de catálogo.

**Implementación esperada:**
- Cálculo en el `OrderService` antes de la confirmación del pago, usando datos frescos del proveedor y tasas de la pasarela.
- `MarginCalculator` con acceso a costos actualizados, tarifas de envío dinámicas (Enviame/Starken/Shipit) y tasas de cambio (CLP/USD).
- Cola de anomalías (`MarginAnomalyQueue`) que registra toda orden rechazada por margen para revisión manual.
- Alerta automática al equipo de operaciones cuando 3+ órdenes consecutivas fallen por margen.
- Modo override manual (requiere aprobación de dos personas) para órdenes estratégicas con margen inferior.

**Estado:** 🟡 Pendiente — esqueleto en `OrderService`, falta integración con costos reales de proveedores chilenos.

---

## Regla 2 — Out-of-Order Webhook Handling (Manejo de Webhooks Fuera de Orden)

**Descripción:** Los webhooks de pasarelas de pago (Flow, Webpay, Mercado Pago, Stripe) pueden llegar en cualquier orden. El sistema debe mantener una máquina de estados finita (FSM) por orden que rechace transiciones ilegales (ej: "reembolsado" → "completado").

**Implementación esperada:**
- FSM estricta por `orderId`: estados permitidos son `pending → approved → captured → completed`, con bifurcaciones a `failed` y `refunded` desde cualquier estado intermedio.
- Cada webhook incluye un `sequenceId` o timestamp; se descarta cualquier transición con sequenceId menor al último procesado.
- `WebhookIngestor` que valida firma HMAC, extrae tipo de evento, y delega a la FSM.
- Log inmutable de todas las transiciones en `OrderEventLog`.
- Notificación P1 ante 3+ transiciones ilegales en menos de 5 minutos.

**Estado:** 🟡 Pendiente — FSM definida conceptualmente, no implementada.

---

## Regla 3 — Distributed Sagas & Ghost Order Prevention (Sagas Distribuidas y Prevención de Órdenes Fantasma)

**Descripción:** Toda orden que cruza múltiples servicios (pago, proveedor, envío, contabilidad) debe ejecutarse como una saga distribuida con compensación automática. Si una etapa falla, todas las anteriores deben revertirse. Prohibido dejar órdenes "fantasma" (pagadas sin envío, o envío sin pago confirmado).

**Implementación esperada:**
- Coreografía de eventos entre servicios usando Inngest (BullMQ como alternativa OSS evaluada).
- Paso a paso: (1) reservar pago → (2) enviar orden al proveedor → (3) esperar confirmación → (4) capturar pago → (5) generar guía de envío → (6) cerrar orden.
- Compensaciones: fallo en (2) → liberar reserva de pago. Fallo en (3) con pago ya capturado → reembolso automático parcial o total.
- Dead Letter Queue (DLQ) para órdenes que superan el tiempo máximo de espera sin resolución.
- Auditoría: toda compensación queda registrada con traceId completo.

**Estado:** 🟡 Pendiente — diseño de saga en borrador, sin compensaciones implementadas.

---

## Regla 4 — Double-Entry Ledger (Contabilidad de Partida Doble Inmutable)

**Descripción:** Toda transacción financiera (venta, reembolso, comisión, impuesto) se registra como asiento contable de partida doble. Cada asiento es inmutable y referenciable por hash. Cualquier desviación entre el ledger y el sistema transaccional genera alerta P1 inmediata.

**Implementación esperada:**
- Ledger con estructura `{ debit, credit, account, orderId, amount, currency, timestamp, hash, previousHash }` (blockchain-like).
- Verificador periódico que reconcilia ledger vs órdenes reales cada 15 minutos.
- Cuentas estándar: Caja, Ventas, Costo de Ventas, IVA Débito, IVA Crédito, Cuentas por Cobrar (Flow/Mercado Pago), Proveedores.
- Exportación contable directa al SII (Libro de Compra/Venta) formato XML/TXT.
- Alerta P1 por Slack/email si el verificador encuentra discrepancia ≥ $1.000 CLP.

**Estado:** ❌ No implementado — ledger digital no existe, contabilidad externa provisional.

---

## Regla 5 — Intelligent API Rate Siphoning (Gestión Inteligente de Rate Limits)

**Descripción:** El sistema debe respetar los rate limits de proveedores y pasarelas sin perder throughput. Implementar colas de prioridad con exponential backoff y jitter para maximizar el rendimiento dentro de los límites impuestos.

**Implementación esperada:**
- `RateLimiter` por endpoint externo con configuración de límite, ventana y cuota.
- Colas de prioridad: sincronización de inventario (alta), consultas de precio (media), consultas de historial (baja).
- Exponential backoff con jitter (base 1s, factor 2, máximo 60s) para respuestas HTTP 429.
- Circuit breaker: si un proveedor falla 5+ veces consecutivas, se desactiva durante 30s y se notifica.
- Monitoreo de cuota consumida vs restante para alertar antes de alcanzar el límite.

**Estado:** 🟡 Pendiente — `RateLimiter` implementado en `core-domain/infrastructure/rate-limiting/`, falta integración con proveedores específicos.

---

## Regla 6 — Idempotencia Transaccional (Idempotency Key)

**Descripción:** Ningún request HTTP a proveedores o pasarelas puede duplicarse por reintento. Cada request debe llevar un `Idempotency-Key` UUIDv7 (ordenado temporalmente) antes de enviarse. El proveedor receptor debe retornar la misma respuesta para requests con la misma key dentro de su ventana de idempotencia.

**Implementación esperada:**
- `IdempotencyMiddleware` que genera y adjunta la key a cada request saliente.
- Almacenamiento local de keys usadas con TTL (mínimo 24h) para detectar colisiones.
- Cache de respuestas idempotentes (Redis recomendado) para evitar re-envíos.
- Validación de respuesta: si la respuesta entrante indica key duplicada pero el resultado difiere, alerta inmediata.
- Soporte en todas las integraciones: Flow API, Stripe API, Webpay REST, proveedores dropshipping.

**Estado:** 🟡 Pendiente — middleware definido en `core-domain/infrastructure/http/`, sin implementar en providers ni cache.

---

## Regla 7 — Cross-Border Tax Compliance (Cumplimiento Tributario Transfronterizo)

**Descripción:** El motor fiscal debe calcular IVA/impuestos dinámicamente según la ubicación del comprador, tipo de producto y régimen tributario chileno. Prohibido hardcodear tasas; usar Stripe Tax o TaxJar como fuente de verdad actualizada.

**Implementación esperada:**
- `TaxCalculator` que consulta Stripe Tax API (o TaxJar) con datos de producto, origen (Chile) y destino del comprador.
- Cobertura: IVA chileno (19%), impuesto de productos importados según Aduanas, tasas regionales si aplica.
- Cálculo en tiempo real al agregar al carrito, no solo al checkout.
- Cache de tasas con TTL (1 día) para reducir llamadas a la API externa.
- Reporte trimestral de impuestos recaudados para SII, exportable a CSV/XML.

**Estado:** 🟡 Pendiente — Lógica de cálculo modernizada en `CheckoutService` usando `@pranakaia/pricing` (extracción de IVA 19% desde el subtotal), pero falta integración con API fiscal externa para tasas dinámicas.

---

## Regla 8 — Anti-Fraud & Chargeback Shield (Protección Antifraude y Contracargos)

**Descripción:** Toda orden debe pasar por un scoring de riesgo antes de capturar el pago. Órdenes con riesgo elevado se mantienen en auth-only (no capturadas) hasta verificación manual. Integración con 3D Secure (Flow 3DS, Stripe Radar) para autenticación reforzada del comprador.

**Implementación esperada:**
- `RiskScorer` que evalúa: monto, velocidad (X órdenes en N minutos), dirección IP (proxy/VPN?), historial del email, BIN/tarjeta, país de origen.
- Integración con Flow 3DS y Stripe Radar para autenticación fuerte.
- Modos: riesgo bajo → captura inmediata. Riesgo medio → auth-only + revisión en 30 min. Riesgo alto → rechazo automático.
- Blacklist de IPs/BINs/emails con TTL configurable y moderación manual.
- Registro de chargebacks recibidos para retroalimentar el modelo de scoring.

**Estado:** ❌ No implementado — sin scoring, sin 3DS, sin blacklist.

---

## Regla 9 — Anti-Corruption Layer & PIM Sanitization (Capa Anticorrupción y Sanitización de Catálogo)

**Descripción:** Los datos de productos recibidos de proveedores (nombres, descripciones, precios, inventario) son de calidad variable. El sistema debe normalizarlos, sanitizarlos y validarlos antes de exponerlos al frontend. La capa anticorrupción (ACL) protege al dominio de la heterogeneidad de los proveedores.

**Implementación esperada:**
- `SupplierACL` que transforma el modelo de datos de cada proveedor al modelo canónico del sistema.
- Sanitización: limpieza de HTML malicioso, normalización de descripciones (minúsculas, tildes), truncamiento de campos sobre el límite.
- Validación de precios: si el precio del proveedor varía +20% respecto al último conocido, se pone en cuarentena.
- Sincronización de inventario cada 15 minutos con cola prioritaria (Regla 5).
- `PIMSanitizer` que rechaza productos con datos insuficientes (sin nombre, sin SKU, sin precio).
- Log de todas las transformaciones y rechazos para auditoría.

**Estado:** 🟡 Pendiente — `SupplierACL` definido en `core-domain/infrastructure/suppliers/`, sanitización básica implementada, falta validación de precios y cuarentena.

---

## Regla 10 — Protección de Datos PII Chilena (Cumplimiento Ley 19.628)

**Descripción:** Toda información personal del comprador (nombre, RUT, dirección, email, teléfono, IP) debe tratarse según la Ley 19.628 de Protección de Datos Personales (Chile) y su Ley Marco 21.719 (2024). Datos sensibles deben cifrarse en reposo y en tránsito, con acceso restringido por roles.

**Implementación esperada:**
- Cifrado AES-256-GCM de PII en reposo (base de datos), con rotación de claves cada 90 días.
- Datos en tránsito: TLS 1.3 obligatorio en todas las APIs internas y externas.
- Acceso por roles: solo el equipo de fulfillments ve direcciones completas; solo contabilidad ve RUT; ventas solo ve primeras 3 cifras del RUT.
- Consentimiento explícito del comprador al registrar sus datos, almacenado como evento inmutable.
- Política de retención: datos de órdenes retenidos 5 años (exigencia SII), datos de carritos abandonados eliminados tras 30 días.
- Dump de datos completo exportable en 72h (derecho ARCO del titular).
- Notificación a la Agencia de Protección de Datos ante cualquier breach en ≤ 72h.

**Estado:** ❌ No implementado — sin cifrado PII, sin roles, sin consent tracking.

---

## Referencias Internas

- [Shipping Providers: Enviame / Starken / Shipit](../../packages/core-domain/src/infrastructure/shipping/)
- [Rate Limiting](../../packages/core-domain/src/infrastructure/rate-limiting/)
- [Outbox Pattern](../../packages/core-domain/src/infrastructure/outbox/)
- [Idempotency Middleware](../../packages/core-domain/src/infrastructure/http/)
- [Supplier ACL](../../packages/core-domain/src/infrastructure/suppliers/)
---

*Última actualización: 2026-05-01*