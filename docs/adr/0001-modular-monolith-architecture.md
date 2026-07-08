---
title: "ADR-0001: Modular Monolith Architecture & Technical Stack"
adr_number: "0001"
version: "4.0-AbsoluteZero"
status: "ACCEPTED"
classification: "Internal Use Only"
last_updated: "2026-04-28"
decision_date: "2026-04-01"
owner: "@PablesStayla"
stakeholders:
  - "@platform-team"
  - "@backend-team"
reviewers:
  - "@staff-engineer"
---

# ADR-0001: Modular Monolith Architecture & Technical Stack

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

The PranaKaia platform requires a scalable architecture that balances development velocity with structural integrity. We have decided to adopt a **Modular Monolith** architecture using **Domain-Driven Design (DDD)** principles, orchestrated via a **Turborepo/pnpm monorepo** and powered by **Next.js 15**.

**Decision:** We will use a Modular Monolith with strictly bounded contexts instead of a distributed microservices architecture or a monolithic "ball of mud".

**Consequences:** High development speed and simplified deployments, but requires strict enforcement of module boundaries to prevent tight coupling.

---

## Context

### Problem Statement

We need an architecture that allows for:
1. **Shared Logic:** Domain rules (Cart, Pricing, Inventory) must be shared between the B2C Web app and the Admin dashboard.
2. **Developer Velocity:** Small teams need to move fast without the overhead of managing 10+ separate microservices.
3. **Type Safety:** Total end-to-end type integrity across all packages.
4. **Performance:** Fast build times and efficient deployments.

### Background

Existing e-commerce platforms often suffer from either over-engineered microservices (operational complexity) or tightly coupled monoliths (unmaintainability). We seek the "Golden Middle".

---

## Decision Drivers

| Priority | Driver | Description |
|:--------:|:-------|:------------|
| **P0** | **Maintainability** | Ability to refactor domain logic without breaking distant systems. |
| **P0** | **Type Integrity** | 100% TypeScript coverage across package boundaries. |
| **P1** | **Operational Simplicity** | Single deployment pipeline for the core platform. |
| **P1** | **Shared Components** | Reusable UI and Domain logic via monorepo packages. |

---

## Considered Options

### Option 1: Distributed Microservices (Vercel Functions + Separate Repos)

**Pros:**
- ✅ Independent scaling per service.
- ✅ Technological freedom per team.

**Cons:**
- ❌ High operational overhead (Service Discovery, Distributed Tracing).
- ❌ Fragmented type safety (requires complex RPC/Schema registries).
- ❌ Slow "cross-cutting" features development.

---

### Option 2: Modular Monolith (Turborepo + Next.js) - SELECTED

**Pros:**
- ✅ **Single Source of Truth:** Unified domain models in `packages/core-domain`.
- ✅ **Zero-Overhead Sharing:** Logic shared via local pnpm workspaces.
- ✅ **Simplified Operations:** One CI/CD pipeline, one database, clear boundaries.
- ✅ **Incremental Migration:** Can be split into microservices later if a module grows too large.

**Cons:**
- ❌ **Shared Fate:** A deployment failure in one module can affect the whole app.
- ❌ **Dependency Discipline:** Requires strict linting to prevent cyclic dependencies.

---

## Decision

**Chosen Option:** **Modular Monolith** via Turborepo/pnpm.

**Technical Stack:**
1. **Framework:** Next.js 15 (App Router, Server Actions).
2. **Orchestrator:** Turborepo for task caching and orchestration.
3. **Package Manager:** pnpm for strict dependency management.
4. **Language:** TypeScript (Strict Mode).

---

## Rationale

1. **Strategic Simplicity:** We are a high-growth startup; we need speed. Modular Monolith provides the best DX/UX balance.
2. **DDD Alignment:** The structure of `packages/*` directly maps to Bounded Contexts (Cart, Order, Catalog).
3. **Future Proofing:** By enforcing boundaries now, we can extract any module into a separate microservice in < 48 hours if scale requires it.

---

## Consequences

### Positive Consequences

| Area | Impact | Description |
|:-----|:-------|:------------|
| **Build Time** | -60% | Turborepo cache ensures only changed packages are built. |
| **Type Safety** | 100% | Changes in `core-domain` immediately propagate to all apps. |
| **Deployment** | Simple | Atomic deployments of the entire platform state. |

### Negative Consequences

| Area | Impact | Mitigation |
|:-----|:-------|:-----------|
| **Build Artifacts** | Large | Optimized via Next.js output standalone mode. |
| **Coupling Risk** | High | Strict `eslint-plugin-import` and `dependency-graph` audits. |

---

## Implementation

### Directory Structure

```text
/apps
  /web           # B2C Frontend (Next.js)
  /admin         # Internal Dashboard (Next.js)
/packages
  /core-domain   # Entities, VOs, Domain Services (Pure TS)
  /ui            # Shared Component Library (React/Vanilla CSS)
  /db            # Drizzle Schema & Migrations
  /config        # Shared Eslint, Prettier, Tailwind
```

### Readiness Gates

- **pnpm install**: Strict dependency lock.
- **pnpm build**: Parallelized across workspaces.
- **pnpm test**: Mandatory 100% coverage before merge.

---

## Related Decisions

- [ADR-0002](./0002-drizzle-orm-adoption.md) - Persistence layer implementation.
- [ADR-0003](./0003-observability-and-roadmap-governance.md) - Monitoring for the monolith.

---

## References

- [Shopify Hydrogen Architecture](https://hydrogen.shopify.dev/)
- [Vercel Monorepo Patterns](https://vercel.com/docs/monorepos)
- [Domain-Driven Design (Evans)](https://www.domainlanguage.com/ddd/)

---

> **Document Control**
>
> - **Status:** ACCEPTED
> - **Last Reviewed:** 2026-04-28
> - **Next Review:** 2026-10-28
> - **Reviewed By:** PablesStayla
