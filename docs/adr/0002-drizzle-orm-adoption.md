---
title: "ADR-0002: Supabase & Drizzle ORM Persistence Layer"
adr_number: "0002"
version: "4.0-AbsoluteZero"
status: "ACCEPTED"
classification: "Internal Use Only"
last_updated: "2026-04-28"
decision_date: "2026-04-01"
owner: "@PablesStayla"
stakeholders:
  - "@platform-team"
  - "@database-admin"
reviewers:
  - "@staff-engineer"
---

# ADR-0002: Supabase & Drizzle ORM Persistence Layer

> **Architecture Decision Record**
>
> *Status: ACCEPTED | Version: 4.0-AbsoluteZero | Decision Date: 2026-04-01*
> *Owner: @PablesStayla | Classification: Internal Use Only*

---

## Table of Contents

1. [Summary](#summary)
2. [Context](#context)
3. [Decision Drivers](#decision-drivers)
4. [Considered Options](#considered-options)
5. [Decision](#decision)
6. [Rationale](#rationale)
7. [Consequences](#consequences)
8. [Implementation](#implementation)
9. [Related Decisions](#related-decisions)
10. [References](#references)

---

## Summary

The PranaKaia platform requires a robust, type-safe, and high-performance data persistence layer. We have selected **Supabase** (PostgreSQL) as our managed infrastructure provider and **Drizzle ORM** as our primary database toolkit to achieve end-to-end type safety and deterministic schema governance.

**Decision:** Adopt Supabase for managed PostgreSQL/Auth/Storage and Drizzle ORM for schema-first data access and migrations.

**Consequences:** Complete type safety from DB to UI, zero cold-start overhead, but requires manual migration discipline and strict schema ownership.

---

## Context

### Problem Statement

Our e-commerce domain demands ACID compliance for order processing and high-performance read access for the product catalog. We need:
1. **Type Safety:** 100% TypeScript inference for all database operations.
2. **Serverless Compatibility:** Connection pooling and low-latency startup.
3. **Operational Efficiency:** Integrated Auth and Storage to reduce architectural surface area.
4. **Relational Power:** Native PostgreSQL features (JSONB, Full-text search, RLS).

---

## Decision Drivers

| Priority | Driver | Description |
|:--------:|:-------|:------------|
| **P0** | **Type Integrity** | Full schema inference without manual interface duplication. |
| **P0** | **Performance** | Minimal overhead and no cold-start penalties in Vercel functions. |
| **P1** | **Developer Experience** | SQL-like syntax with modern TypeScript power. |
| **P1** | **Integration** | Seamless binding with Supabase Auth for Row Level Security (RLS). |

---

## Considered Options

### Option 1: Prisma + PostgreSQL (Standard)

**Pros:**
- ✅ Massive community and mature tooling.
- ✅ Excellent migration engine.

**Cons:**
- ❌ High cold-start latency due to Rust binary overhead.
- ❌ Opaque query engine (hard to optimize complex SQL).
- ❌ Large bundle size.

---

### Option 2: Supabase + Drizzle ORM - SELECTED

**Pros:**
- ✅ **Performance:** Native JS driver with zero cold-start overhead.
- ✅ **Type Safety:** Best-in-class TypeScript inference (Zod integration).
- ✅ **SQL Transparency:** "What you see is what you get" SQL builder.
- ✅ **Unified Platform:** Supabase provides Auth, Storage, and DB in one ecosystem.

**Cons:**
- ❌ **Manual Kit:** Drizzle Kit requires more manual oversight than Prisma's auto-magic.
- ❌ **Evolving Ecosystem:** Younger community compared to Prisma.

---

## Decision

**Chosen Solution:** **Supabase PostgreSQL** + **Drizzle ORM**.

**Infrastructure Details:**
1. **Provider:** Supabase (PostgreSQL 15+).
2. **Access Layer:** Drizzle ORM (using `postgres-js` or `pg` driver).
3. **Governance:** Drizzle Kit for declarative migrations.
4. **Security:** PostgreSQL Row Level Security (RLS) managed via migrations.

---

## Rationale

1. **Absolute Performance:** Drizzle's runtime overhead is effectively zero, which is critical for e-commerce conversion rates.
2. **Strict Type Hardening:** By using Drizzle, we achieve "Absolute Zero" type drift. The database schema *is* the source of truth for our TypeScript types.
3. **Modular Monolith Fit:** A single `packages/db` package can export schemas and clients to all applications in the monorepo.
4. **Edge Readiness:** Drizzle works flawlessly in Edge Runtimes (Vercel/Cloudflare).

---

## Consequences

### Positive Consequences

| Area | Impact | Description |
|:-----|:-------|:------------|
| **Type Safety** | S+ Grade | End-to-end inference from DB columns to React props. |
| **Operational** | Simplified | Integrated Auth/DB/Storage reduces vendor count. |
| **Performance** | +40% Speed | Faster cold starts compared to Prisma-based systems. |

### Negative Consequences

| Area | Impact | Mitigation |
|:-----|:-------|:-----------|
| **Migrations** | Medium Risk | Automated CI/CD checks for migration validity. |
| **Complexity** | Manual | Requires engineers to understand underlying SQL better. |

---

## Implementation

### Package Structure

```text
/packages/db
  /src
    /schema      # Table definitions (users, orders, etc.)
    /relations   # Drizzle relational mappings
    /client.ts   # Singleton client configuration
  /migrations    # SQL files generated by Drizzle Kit
  /drizzle.config.ts
```

### Success Metrics

- **Schema Drift:** 0% (Verified via `drizzle-kit check`).
- **Query Latency:** < 15ms P95 for catalog reads.
- **Type Coverage:** 100% on database access objects.

---

## Related Decisions

- [ADR-0001](./0001-modular-monolith-architecture.md) - Context for the monorepo structure.
- [ADR-0005](./0005-auth-unification-supabase.md) - Integration with Supabase Auth.
- [ADR-0009](./0009-database-schema-expansion.md) - Specific schema design for products.

---

## References

- [Drizzle ORM Best Practices](https://orm.drizzle.team/docs/performance)
- [Supabase Performance Hardening](https://supabase.com/docs/guides/database/performance)
- [PostgreSQL Row Level Security Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

> **Document Control**
>
> - **Status:** ACCEPTED
> - **Last Reviewed:** 2026-04-28
> - **Next Review:** 2026-10-28
> - **Reviewed By:** PablesStayla
ccepted (Implemented)
>
> For questions, contact: @platform-team