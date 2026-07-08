# Infrastructure: Redis & Global State
 
> **🏆 ABSOLUTE ZERO - Infrastructure Sovereignty**
>
> *Version: 5.0 | Status: 🔒 Stable | Platform: Upstash Redis (Global)*
 
---
 
## 📋 Overview
 
PranaKaia leverages **Upstash Redis** as a high-performance, global state store. It is used for operations requiring sub-millisecond latency, distributed locking, and ephemeral session management.
 
---
 
## 🛠️ Core Use Cases
 
### 1. Distributed Rate Limiting
Prevents API abuse and brute-force attacks across the Edge.
- **Implementation**: `@upstash/ratelimit`
- **Logic**: Slidling window per IP or UserID.
 
### 2. Idempotency Control
Ensures that critical mutations (e.g., `payment.process`, `order.create`) are executed exactly once.
- **Key Pattern**: `idempotency:[key_hash]`
- **TTL**: 24 Hours.
 
### 3. Ephemeral Cart Storage
Stores user carts before they are converted into persistent `Orders` in PostgreSQL.
- **Benefit**: Reduces DB load for guest browsing.
- **Pattern**: `cart:[user_id]`
 
### 4. Distributed Locking
Prevents race conditions in inventory reservation.
- **Pattern**: `lock:stock:[variant_id]`
- **Strategy**: Redlock algorithm.
 
---
 
## 📐 Key & Namespace Design
 
To ensure zero collisions, we use a strict hierarchical namespace:
`[env]:[context]:[subject]:[identifier]`
 
**Examples**:
- `prod:sales:cart:usr_123`
- `prod:infra:ratelimit:ip_1.1.1.1`
- `prod:payments:idempotency:pay_abc`
 
---
 
## ⚡ Performance Mandates
 
- **Connection Strategy**: Use the REST-based `@upstash/redis` client for Serverless/Edge compatibility to avoid connection pooling overhead.
- **TTL Enforcement**: Every key must have an explicit `EXPIRE` time to prevent "Redis Bloat."
- **Payload Size**: Keep values under 10KB. Large objects belong in PostgreSQL or S3.
 
---
 
## 🛡️ Reliability & Failover
 
- **Global Replication**: Read-replicas are enabled in `us-east-1`, `eu-central-1`, and `ap-southeast-1`.
- **Fallthrough Logic**: If Redis is unavailable, critical paths must fall back to PostgreSQL or fail gracefully with a 503 error (Railway Oriented Error Handling).
 
---
 
## 🚦 Monitoring & Governance
 
- **Metrics**: Monitor `Max Daily Commands` and `Storage Usage` in the Upstash Console.
- **Alerting**: P99 latency > 50ms triggers a P2 incident.
 
---
 
## 📝 Document Control
 
| Role | Responsibility |
| :--- | :--- |
| **Owner** | Infrastructure Engineering |
| **Last Audit** | 2026-04-28 |
| **Next Review** | 2026-10-28 |
