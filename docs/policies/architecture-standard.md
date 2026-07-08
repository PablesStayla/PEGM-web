---
title: Architecture Standard
version: 5.0.0
status: Active
last_updated: 2026-04-28
owner: Architecture Review Board
tags: [governance, ddd, architecture, patterns]
---

# Architecture Standard: Modular Monolith (DDD)

> **🏆 ABSOLUTE ZERO - Structural Governance**
> 
> *The mandatory architectural patterns and constraints for all PranaKaia services.*

---

 
## 📋 Architectural Vision
 
PranaKaia is architected as a **Modular Monolith** using **Domain-Driven Design (DDD)** principles. This ensures high cohesion within modules and low coupling between them, allowing for independent evolution and eventual microservices extraction if required.
 
---
 
## 🏗️ Layered Architecture (The Onion)
 
The system is divided into four distinct layers, following the Dependency Inversion Principle.
 
### 1. Domain Layer (The Core)
- **Content**: Entities, Value Objects, Domain Events, Domain Services, Repositories (Ports).
- **Rules**: Zero dependencies on outer layers. Must be pure TypeScript.
- **Enforcement**: Strict immutability and Result pattern.
 
### 2. Application Layer (Use Cases)
- **Content**: Command Handlers, Query Handlers, DTOs, Application Services.
- **Rules**: Orchestrates domain objects to fulfill a specific business task.
- **Enforcement**: Transactional boundaries start here.
 
### 3. Infrastructure Layer (Adapters)
- **Content**: Database implementations (Drizzle), External API clients (Stripe), Message Bus (Redis/Upstash).
- **Rules**: Implements the Ports defined in the Domain layer.
 
### 4. Interface Layer (The Edge)
- **Content**: Next.js Pages (RSC), API Routes, Webhooks, CLI.
- **Rules**: Converts external requests into Application Commands/Queries.
 
---
 
## 🧩 Module Isolation (Bounded Contexts)
 
Each module (e.g., `Catalog`, `Orders`, `Payments`) must be isolated.
 
| Rule | Description |
|------|-------------|
| **No Direct DB Joins** | Modules cannot perform SQL joins across different domain tables. |
| **Event-Driven Communication** | Cross-module communication must happen via Domain Events or Integration Events. |
| **ACL (Anti-Corruption Layer)** | When consuming data from another module, use an ACL to map it to the local domain model. |
 
---
 
## 📦 Monorepo Structure (Turborepo)
 
```bash
apps/
  ├── web/                 # B2C Next.js Application
  └── admin/               # Internal Management Dashboard
packages/
  ├── core-domain/         # Shared DDD logic (The Core)
  ├── infrastructure/      # Database and external adapters
  ├── design-system/       # Platinum UI components (Tailwind v4)
  └── config/              # Shared TS, ESLint, and Build config
```
 
---
 
## 🛡️ Strategic Design Decisions
 
1. **Persistence Sovereignty**: Each module "owns" its table schema.
2. **Synchronous vs Asynchronous**: Mutations return `Result` immediately; side effects (emails, analytics) are handled asynchronously via **Inngest**.
3. **Idempotency**: All background jobs and mutations must be idempotent using Redis-backed locks.
 
---
 
## 🚦 Compliance & Enforcement
 
- **Linter (Arch-Lint)**: Automated checks to ensure `core-domain` does not import from `infrastructure`.
- **Review Requirement**: Any change to the core architecture requires approval from the **Principal Architect**.
