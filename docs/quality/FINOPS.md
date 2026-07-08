# FinOps, Costos Cloud & Green Computing — PranaKaia E-Commerce

## 1. Algorithmic Budgeting

Cada PR debe declarar la complejidad algorítmica de los cambios introducidos.

| Complejidad | Acción |
|-------------|--------|
| O(1) / O(log n) | Aprobación automática |
| O(n) | Revisión estándar |
| O(n log n) | Requiere justificación escrita |
| O(n²) o superior | **Rechazo de PR**. Refactorizar o escalar horizontalmente |

**ESTADO ACTUAL**: Sin enforcement en CI. No se revisa complejidad algorítmica.

**OBJETIVO**: CI con `eslint-plugin-complexity` + revisión manual de O grande en PRs de backend/search.

---

## 2. Vercel Edge vs Serverless Functions

| Aspecto | Edge Function | Serverless Function |
|---------|--------------|-------------------|
| Latencia | ~50ms cold start | ~250ms+ cold start |
| Costo | $0.30/MM requests | $2.00/MM requests |
| Runtime | Web APIs, no Node.js completo | Node.js completo |
| Duration | ≤ 30s | ≤ 900s |

**Regla**: Preferir **Edge Functions** para todo endpoint público (productos, catálogo, búsqueda). Serverless solo para operaciones que requieren Node.js completo (procesamiento de imágenes, PDFs).

**ESTADO ACTUAL**: Sin distinción clara. Algunas rutas públicas en Serverless.

**OBJETIVO**: 80% de las rutas en Edge para Q3 2026.

---

## 3. Image CDN — Cloudinary

- **Formatos**: AVIF → WebP → JPEG en ese orden de preferencia. `f_auto` delega la decisión.
- **Lazy loading**: `loading="lazy"` en imágenes below the fold. Solo hero images tienen `loading="eager"`.
- **Blur-up skeletons**: Placeholder de baja calidad (blur) mientras carga la imagen completa.
- **Responsive images**: `srcSet` con breakpoints predefinidos (320w, 640w, 1024w, 1920w).
- **Caché**: TTL de 30 días en CDN con purge on demand tras cambios de producto.

---

## 4. Database — Supabase (PostgreSQL)

- **Connection pooling**: Usar Supavisor (pooler de Supabase) — máximo 10 conexiones simultáneas por aplicación.
- **Read replicas**: Queries de reportes y búsqueda pesada contra read replica, no contra primary.
- **Índices**: `EXPLAIN ANALYZE` obligatorio en queries nuevas. Sin full table scans.
- **Query plan review**: Las migrations nuevas deben incluir el plan de ejecución en el PR.

---

## 5. Redis — Upstash (Pay-per-request)

- **TTLs agresivos**: Catálogo: 5 min, sesiones: 1 hora, rate limits: 10 segundos.
- **Cache de catálogo**: `GET products:{id}` con TTL 5 min. Invalidación vía tag, no esperar expiración.
- **Sesiones**: Solo sesiones activas en Redis. `SETEX` para expiración automática.
- **Rate limiting**: `INCR + EXPIRE` con ventana deslizante de 10 segundos.

---

## 6. Cache Invalidation Estratégica

Usar **tag-based cache invalidation** sobre TTLs fijos:

```typescript
// Next.js App Router
revalidateTag(`product:${productId}`);
revalidateTag(`category:${categorySlug}`);
revalidateTag(`search:${query}`);
```

**ESTADO ACTUAL**: Cache basado en TTLs. Sin revalidation tags ni purge on demand.

**OBJETIVO**: Sistema de tags completo para Q2 2026. Invalidación inmediata tras cambios de precio/stock.

---

## 7. Soft Deletes

| Tipo de borrado | Cuándo usarlo | Mecanismo |
|-----------------|---------------|-----------|
| Soft delete | Default: todos los registros de negocio | `deleted_at TIMESTAMP NULL` |
| Hard delete | Solo por GDPR / Ley 19.628 (Chile) | `DELETE FROM` + backup previo |

**Regla**: El soft delete es el default. El hard delete requiere aprobación del DPO y se ejecuta con script one-off auditado.

---

## 8. Concurrencia — Distributed Locks

Para operaciones críticas bajo concurrencia (stock, pagos):

- **PostgreSQL**: `SELECT ... FOR UPDATE` dentro de transacción. Simple, efectivo, consistente.
- **Redis**: Redlock solo cuando el lock abarca múltiples servicios.
- **Evitar**: Optimistic locking sin retry lógico. En inventario bajo, la probabilidad de conflicto es alta.

---

## 9. Search — Meilisearch

- **Prohibido `LIKE`** en PostgreSQL para búsqueda de catálogo. Meilisearch es el motor oficial.
- **Faceted search**: Sub-milisegundo en Meilisearch para filtros combinados (categoría + precio + rating).
- **Sync**: Webhook en PostgreSQL → Meilisearch. Latencia de indexación < 1 segundo.
- **Costos**: Self-hosted en VPS mínimo o Managed Cloud ($0.30/GB RAM/día).

---

## 10. Green Computing

| Práctica | Impacto | Prioridad |
|----------|---------|-----------|
| Lazy loading de imágenes | -40% transfer size | Alta |
| Edge Functions (vs serverless) | -80% energy per request | Alta |
| Caché agresiva (Redis + CDN) | -95% DB queries repetidos | Alta |
| Compresión Brotli | -20% bandwidth | Media |
| Code splitting dinámico | -60% JS bundle inicial | Media |
| Sin polling | WebSockets > polling HTTP | Baja |

**ESTADO ACTUAL**: Lazy loading implementado parcialmente. Sin Brotli. Polling HTTP en legacy.

**OBJETIVO**: Carbon-aware deployment (regiones con energía renovable en horario pico) para 2027.