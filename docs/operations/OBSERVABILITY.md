# Observabilidad, Telemetría y Distributed Tracing

## 1. OpenTelemetry — Distributed Tracing

**Estado:** OBJETIVO (no implementado completamente)

### Flujo de trazas

```
Browser (RUM) → Next.js (Server Components) → Server Actions → DB / Vendor API
     │                    │                         │
     └── OTel SDK ────────┴───── OTel Collector ────┴──→ Grafana Tempo
```

### Stack propuesto

| Componente | Herramienta | Rol |
|-----------|------------|-----|
| Trazas | OpenTelemetry SDK (JS) | Span creation y propagación de contexto |
| Colector | OpenTelemetry Collector | Buffer, batch, filtrado de trazas antes de enviar a backend |
| Backend | Grafana Tempo (docker-compose) | Almacenamiento y consulta de trazas |
| Visualización | Grafana | Dashboards de trazas y correlación con métricas |

### Context Propagation

- `trace_id` inmutable desde el Edge (primer punto de entrada de la request).
- Viaja en headers HTTP: `traceparent` (formato W3C Trace Context).
- Server Actions propagan el trace_id a queries de Supabase y llamadas a vendor APIs.

### Instrumentación prioritaria

1. **HTTP requests entrantes** (Next.js Edge + API).
2. **Server Actions** (autenticación, carrito, checkout).
3. **Queries a Supabase** (tiempo de respuesta, rows afectadas).
4. **LLM calls** (prompt size, tokens, latency).
5. **Pagos y webhooks** (eventos idempotentes, reprocesos).

---

## 2. Sentry — Error Tracking

**Estado:** Implementado (`@sentry/nextjs` v10 instalada)

### Configuración actual

- `@sentry/nextjs` v10 integrado en Next.js App Router.
- Captura de errores no manejados en client y server.
- Source maps subidos automáticamente en deploys (Vercel integration).

### Buenas prácticas

- **Performance tracing:** habilitado con sampling rate 0.1 (10%) para reducir overhead.
- **Replay (Session Replay):** deshabilitado para usuarios no autenticados. Habilitado con `maskAllText=true` para usuarios logueados.
- **Breadcrumbs:** personalizados para eventos clave (checkout, login, add-to-cart).
- **Alertas:** reglas en Sentry para P0/P1 con notificaciones a Slack.

### Implementación pendiente

- **beforeSend:** filtrar PII de eventos (emails, tokens, cookies) antes de enviar a Sentry (ver SECURITY.md sección 8).

---

## 3. Logger — Pino

**Estado:** OBJETIVO (reemplazar `console.log`)

### Stack

| Herramienta | Rol |
|------------|-----|
| **Pino** | Logger principal (niveles: trace, debug, info, warn, error, fatal) |
| **pino-pretty** | Formateo legible en desarrollo |
| **pino-loki** | Transporte para Grafana Loki (logs centralizados) |

### Niveles estrictos

| Nivel | Uso |
|-------|-----|
| `info` | Eventos de negocio: order_created, payment_succeeded, user_registered |
| `warn` | Comportamiento anómalo no crítico: rate_limit_exceeded, retry_attempt |
| `error` | Fallos operativos: db_query_failed, payment_declined, vendor_timeout |
| `fatal` | Caídas catastróficas: service_unavailable, out_of_memory |

### Prohibiciones

- No usar `console.log`, `console.error`, `console.warn`. CI bloquea con ESLint rule (`no-console`).
- No loguear PII (ver filtro en SECURITY.md sección 4).

### Estructura de log

```typescript
logger.info({
  event: 'order.created',
  orderId: 'ord_abc123',
  userId: 'usr_xyz789',       // ID interno, no PII
  total: 45000,                // en centavos
  paymentMethod: 'flow',
  traceId: '0x...'             // trace_id de OpenTelemetry
}, 'Orden creada exitosamente');
```

---

## 4. Context Propagation

**Estado:** OBJETIVO.

- `trace_id` se genera en el Edge (middleware de Next.js) y se propaga a través de:
  - Server Actions: header `traceparent`.
  - Supabase queries: comentario SQL `/* trace_id: '...' */`.
  - Logs de Pino: campo obligatorio `traceId`.
  - Sentry events: `event.tags.trace_id`.
- **Middleware de propagación:** script de instrumentación que inyecta el trace_id en el contexto de async_hooks.

---

## 5. Server-Side Tracking

**Estado:** OBJETIVO (no implementado completamente).

### Problema

Google Analytics / GTM / Facebook Pixel en el main thread bloquean el renderizado y afectan Core Web Vitals.

### Solución: Partytown

**Estado:** En evaluación.

- **Partytown** ejecuta scripts de tracking en un Web Worker, fuera del main thread.
- Configuración: registrar los scripts de GTM y Meta Pixel como type="text/partytown" en el layout de Next.js.
- Beneficios: CWV no penalizados, FID/INP mejorados.

### Alternativa

Server-Side Google Tag Manager (sGTM) para eventos críticos del servidor (checkout, registro de usuario, pago).

---

## 6. Web Vitals — Core Web Vitals

**Estado:** Objetivos definidos, monitoreo implementado (web-vitals library + analytics).

| Métrica | Objetivo | Umbral aceptable | Estrategia |
|---------|----------|-----------------|------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | < 4.0s | Image optimization (WebP/AVIF), lazy loading, CDN |
| **INP** (Interaction to Next Paint) | < 100ms | < 200ms | Code splitting, bundle size < 150kb, Partytown |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.25 | Dimensiones explícitas en imágenes, skeleton screens |
| **TTFB** (Time to First Byte) | < 50ms (Edge) | < 200ms | Edge Functions, cache headers, cold start optimizations |

### Monitoreo

- `web-vitals` library reporta métricas a analytics interno.
- Alertas en Sentry si CWV degradan por más de 24h.
- Presupuesto de performance en CI: bloquea deploy si LCP > 3.0s en Lighthouse audit.

---

## 7. Dashboards — SRE Golden Signals

**Estado:** Implementado (Grafana + Prometheus vía docker-compose).

### Dashboards definidos

#### API Golden Signals

| Señal | Métrica | Panel |
|-------|---------|-------|
| **Latency** | HTTP request duration (p50, p95, p99) | Latency Heatmap + Percentiles |
| **Traffic** | Requests per second (RPS) | Throughput por endpoint + total |
| **Errors** | HTTP error rate (4xx, 5xx) | Error rate % + errores por endpoint |
| **Saturation** | CPU / Memory / DB connections | Resource utilization |

#### Business Dashboards

| Métrica | Fuente |
|---------|--------|
| Ordenes por minuto | DB query (Postgres exporter) |
| Revenue en tiempo real | API (checkout_completed event) |
| Usuarios activos | better-auth + Supabase |

#### Web Vitals Dashboard

| Métrica | Fuente |
|---------|--------|
| LCP, INP, CLS, TTFB | web-vitals library → analytics → Prometheus |
| Page load time | RUM data (OpenTelemetry) |

### Stack de Infraestructura

```yaml
# docker-compose.observability.yml
services:
  prometheus:
    image: prom/prometheus:latest
  grafana:
    image: grafana/grafana:latest
  tempo:
    image: grafana/tempo:latest
  loki:
    image: grafana/loki:latest
```

Todos los servicios corren localmente para desarrollo y tienen réplicas reducidas en staging. En producción, evaluar Grafana Cloud o Grafana Faro para RUM.

---

## 8. Alertas

**Estado:** Implementado parcialmente.

| Alerta | Condición | Canal |
|--------|-----------|-------|
| Error rate > 1% | Últimos 5 min | Slack + Email |
| P99 latency > 1s | Últimos 5 min | Slack |
| Web Vitals alert | CWV degradado 24h | Slack + Sentry |
| DB connections > 80% | Pool casi agotado | Slack + Phone (PagerDuty en evaluación) |
| SSL cert expira < 7d | Cert-manager alert | Email |
| Deploy failure | CI/CD falla | Slack + GitHub notification |

### Rutas de escalamiento

- **Horario laboral (09-20 CLT):** Slack → llamada al equipo (P0/P1).
- **Fuera de horario:** Slack + PagerDuty (en implementación) si P0. Slack-only si P1.