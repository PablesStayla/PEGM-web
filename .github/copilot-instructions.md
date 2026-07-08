# 🛡️ PranaKaia E-Commerce - Copilot Instructions

> **Standard: Absolute Zero (S+ Grade)**
> This repository follows the highest engineering standards (Netflix, Google, Stripe).

## 🏗️ Core Architecture
- **Framework**: Next.js 15 (App Router).
- **Paradigm**: Domain-Driven Design (DDD).
- **Patterns**: Railway-Oriented Programming (Result Pattern), Inmutable Entities, Branded Types for IDs.
- **Monorepo**: Managed with PNPM Workspaces and Turborepo.

## 🛠️ Coding Standards
- **Result Pattern**: NEVER use `try/catch` or throw exceptions for business logic. ALWAYS use the `Result<T, E>` pattern.
- **Inmutability**: All domain entities MUST be inmutable. Use `readonly` and `Object.freeze()`.
- **Branded Types**: Use nominal typing for all IDs (e.g., `UserId`, `OrderId`) to prevent primitive obsession.
- **Logic Placement**: Business rules belong in **Entities** and **Value Objects**, NOT in services or handlers.
- **Strict Typing**: `any` is strictly prohibited. Use `unknown` or specific interfaces.
- **Complejidad**: Mantener Complejidad Cognitiva ≤ 3 y Ciclomática ≤ 5.

## 📦 Project Structure
- `/apps/web`: Customer-facing Next.js application.
- `/apps/admin`: Internal administration dashboard.
- `/packages/core-domain`: Pure business logic (No external dependencies).
- `/packages/db`: Drizzle ORM schemas and repositories.
- `/packages/ui`: Shared component library (Platinum Design System).

## 🧪 Testing Strategy
- **Target**: 100% Test and Branch coverage.
- **Framework**: Vitest for units, Playwright for E2E.
- **Patterns**: Use test factories and property-based testing where applicable.

## 🎨 UI/UX (Platinum Design)
- Use Vanilla CSS or Tailwind (as requested).
- Prioritize visual excellence, smooth transitions (Framer Motion), and accessibility.
- Never use placeholders; always use high-quality assets.

## 🚀 Commands
- `pnpm install`: Install dependencies.
- `pnpm dev`: Start development servers.
- `pnpm build`: Build all packages.
- `pnpm test`: Run all test suites.
- `pnpm type-check`: Validate TypeScript across the monorepo.
