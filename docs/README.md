# PranaKaia E-Commerce Documentation Portal

> **The Authoritative Single Source of Truth for Engineering, Operations, and Brand Standards**
> 
> *Current Version: 2.1.0 (Enterprise Refactor) | Compliance: SOTA Grade*

---

## 🧭 System Architecture & Context

The `docs/` directory is treated with the same architectural rigor, linting, and validation as our production TypeScript codebase. All documents follow the [Documentation Standards & Governance](./DOCUMENTATION_STANDARDS.md) and must maintain active status fields, owners, and version tags.

```
docs/
├── adr/                 # Architecture Decision Records (Historical Log)
├── architecture/        # In-depth system diagrams and sequence models
├── context/             # Living system design (Domain model, DB schema, API design)
├── domain/              # Domain-Driven Design (DDD) Rules and Bounded Contexts
├── guides/              # Actionable onboarding and setup tutorials
├── operations/          # Monitoring, Observability, and Threat Modeling
├── policies/            # Engineering policies, standards, and compliance rules
├── portal/              # Web interfaces and documentation portal views
├── quality/             # Testing strategies and validation checklists
├── reports/             # System reviews and automated audit logs
├── rules/               # Machine-readable validation schemas and CLI rules
├── runbooks/            # Actionable operations and emergency procedures
└── specs/               # Domain-specific RFCs and technical specifications
```

---

## 🗺️ Navigation Map

### 🏗️ [Core Architecture & Domain Design](./context/README.md)
The biological blueprint of the PranaKaia monorepo. Captures active schema structures, DDD rules, and service layers.
- **[System Architecture](./context/architecture-overview.md):** Overall service topology, networking boundaries, and message brokers.
- **[Domain Model](./context/domain.md):** Ubiquitous language, aggregate boundaries, value objects, and invariant rules.
- **[Database Design](./context/database.md):** PostgreSQL schemas, index strategies, migrations, and Drizzle configurations.
- **[API Standards](./context/api-design.md):** REST, tRPC, and webhook specs, contract guarantees, and versioning.

### 🛡️ [Policies & Engineering Standards](./policies/README.md)
The strict rules and quality gates governing every line of code committed to this repository.
- **[Coding Standard](./policies/coding-standard.md):** strict TypeScript rules, module sizing guidelines, and naming conventions.
- **[Security Standard](./policies/security-standard.md):** PII handling, secrets management, threat models, and token encryption.
- **[Testing Strategy](./policies/testing-standard.md):** Code coverage requirements, local vitest conventions, and end-to-end playwright criteria.
- **[Operations & Reliability Policy](./policies/operations-reliability-standard.md):** SLA/SLO expectations, retry limits, and system resiliency targets.

### 🚨 [Operations & Emergency Runbooks](./runbooks/README.md)
Step-by-step instructions designed to be executed under high-pressure scenarios, on-call shifts, or production releases.
- **[Incident Response](./runbooks/incident-response.md):** Threat level categorization, escalation paths, and communication patterns.
- **[Disaster Recovery](./runbooks/recovery-disaster.md):** Point-in-time recovery, failovers, and backup verification protocols.
- **[Rollback Strategy](./runbooks/recovery-rollback.md):** Safe migration downgrades, deployment rollbacks, and circuit breaks.
- **[Production Deployment](./runbooks/deployment-production.md):** CI/CD manual triggers, validation tests, and zero-downtime rollouts.

### 🎨 [Stitch & Brand Systems (DESIGN.md)](../DESIGN.md)
The machine-readable visual specification file located in the root of the repository, used by **Google Stitch** and other AI compilers.
- **[Design Spec (DESIGN.md)](../DESIGN.md):** Color schemes, HSL tokens, Outfit/Inter typography, layout grids, spacing scales, and premium micro-animations (floating, glassmorphism card designs).

---

## 📑 SOTA Document Standards & Lifecycle

Every document in this folder must adhere to our documentation lifecycle and include the standard YAML frontmatter block to ensure deep compatibility with indexing engines.

### Metadata Schema
```yaml
---
title: Official Document Title
version: 1.0.0
status: [Draft | Review | Active | Deprecated]
last_updated: YYYY-MM-DD
owner: [Domain Area, e.g., Brand Engineering]
tags: [keywords, to, facilitate, search]
---
```

### Writing Rationale
1. **Always Actionable:** Avoid vague advice. Provide exact commands, CLI operations, or code snippets.
2. **Deterministic Layouts:** Use tables for schemas, list hierarchies for parameters, and raw Mermaid blocks for charts.
3. **No Dead Content:** If a design pattern or database schema shifts, the corresponding document must be updated in the same Pull Request (Documentation-as-Code).

---

## ⚡ Contributing & Building

To compile the documentation into a static HTML search portal locally:
1. Run the local build command:
   ```bash
   pnpm docs:build
   ```
2. View the local static build using standard tools:
   ```bash
   pnpm docs:serve
   ```

---
> **Document Control**
> - **Primary Maintenance:** Technical Steering Board (TSB)
> - **Security Tier:** Internal & Proprietary Confidentiality
