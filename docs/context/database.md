---
title: Database Design & Persistence Standard
version: 5.0.0
status: Stable
last_updated: 2026-04-28
owner: Data Engineering
tags: [database, postgresql, supabase, drizzle, persistence]
---

# Database Design & Persistence Standard

> **🏆 ABSOLUTE ZERO - Persistence Sovereignty**
> 
> *The authoritative guide to our data architecture, schema governance, and ORM integration.*

---

 
## 📋 Persistence Philosophy
 
We treat our database as a **reliable event store and relational projection** of our domain model. We prioritize data integrity, type safety, and transactional consistency above all else.
 
---
 
## 🛠️ Technology Stack
 
- **Engine**: PostgreSQL (Supabase).
- **ORM**: Drizzle ORM (TypeScript-first).
- **Migrations**: Drizzle Kit (Declarative SQL).
- **Caching**: Upstash Redis (Global).
 
---
 
## 📐 Schema Governance
 
### 1. Naming Conventions
- **Tables**: Plural snake_case (e.g., `products`, `order_items`).
- **Columns**: snake_case (e.g., `created_at`, `sku_id`).
- **Indexes**: `idx_[table]_[columns]` (e.g., `idx_products_sku`).
- **Constraints**: `chk_[table]_[column]` for check constraints.
 
### 2. Mandatory Columns (The "Audit Trail")
Every table must include:
- `id`: UUID v7 (Time-sortable).
- `created_at`: Timestamp with time zone (default now).
- `updated_at`: Timestamp with time zone (auto-updated).
- `version`: Integer (for Optimistic Locking).
 
---
 
## 🧩 Multi-Tenant & Domain Isolation
 
Although we use a shared database instance, we enforce logical isolation between Bounded Contexts.
 
| Rule | Implementation |
|------|----------------|
| **Schema per Context** | Use PostgreSQL schemas (e.g., `identity.*`, `catalog.*`, `sales.*`) if the module grows large. |
| **Strict Foreign Keys** | FKs are allowed across schemas but must be documented in `DOMAIN-MODEL.md`. |
| **Row Level Security (RLS)** | Mandatory for all user-facing data in Supabase. |
 
---
 
## ⚡ Performance Optimization
 
### 1. Indexing Strategy
- **Primary Keys**: Always use UUID v7 to prevent B-tree fragmentation.
- **Foreign Keys**: Must always be indexed.
- **Search**: Use GIN indexes for JSONB columns or Full-Text Search for catalogs.
 
### 2. Querying Standards
- **Zero `SELECT *`**: Always project only the required columns.
- **N+1 Prevention**: Use `with` relations in Drizzle or optimized joins.
- **Transaction Depth**: Keep transactions short to minimize lock contention.
 
---
 
## 🛡️ Migration Protocol
 
1. **Local Shadow**: Run migrations against a local shadow database first.
2. **Review**: All `.sql` migration files must be reviewed by the **Database Lead**.
3. **No Destructive Changes**: Renaming or deleting columns requires a two-step "Expand-Contract" migration to ensure zero-downtime.
 
---
 
## 📊 Scalability & High Availability
 
- **Connection Pooling**: Use Supabase Transaction Pooler (Session mode) for all Edge functions.
- **Read Replicas**: Configure read-only connections for heavy reporting queries.
- **PITR**: Point-in-Time Recovery is enabled with a 30-day retention window.
 
---
 
## 📝 Document Control
 
| Role | Responsibility |
| :--- | :--- |
| **Owner** | Data Engineering / Platform |
| **Last Audit** | 2026-04-28 |
| **Next Review** | 2026-08-28 |
