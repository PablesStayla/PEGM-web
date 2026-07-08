---
title: Engineering Coding Standard
version: 4.0.0
status: Mandatory
last_updated: 2026-04-28
owner: Technical Steering Committee
tags: [typescript, quality, patterns, clean-code]
---

# Coding Standard

> **🏆 ABSOLUTE ZERO - Technical Excellence**
> 
> *The platinum standards for code quality, safety, and maintainability.*

---

 
## 🎯 Objectives
 
To ensure a high-performance, type-safe, and maintainable codebase that allows for rapid iteration without regressions.
 
---
 
## 🛠️ General Rules
 
### 1. Type Safety
- **No `any`**: The use of `any` is a merge-blocking offense. Use `unknown` with type guards if necessary.
- **Branded Types**: Use branded types for IDs (e.g., `UserId`, `OrderId`) to prevent accidental mixing.
- **Strict Mode**: `strict: true` must be enabled in all `tsconfig.json` files.
 
### 2. Error Handling
- **Railway-Oriented**: Prefer `Result<T, E>` patterns for domain logic.
- **No Global Exceptions**: Only use `throw` for truly exceptional system failures (e.g., DB connection lost). Business errors must be explicit.
 
### 3. File & Module Structure
- **File Length**: Max 200 lines (Google standard). If a file exceeds this, split by responsibility.
- **Test Files**: Max 250 lines. Split by domain concept (creation, operations, state, events).
- **Parameters**: Max 2 parameters per function. Use object patterns (DTOs) for more.
- **Nesting**: Max 2 levels of nesting. Use guard clauses to flatten logic.
- **Cyclomatic Complexity**: ≤ 5 per function (High-performance standard).
 
### 4. Naming Conventions
- **Files**: `kebab-case.ts`
- **Components**: `PascalCase.tsx`
- **Variables/Functions**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
 
---
 
## 🏗️ Domain-Driven Design (DDD)
 
- **Entities**: Must be immutable (`Object.freeze`).
- **Value Objects**: Must validate invariants in the constructor.
- **Bounded Contexts**: Strictly enforced via folder structure in `packages/core-domain`.
 
---
 
## 🧪 Testing Requirements
 
- **Coverage**: 100% statement and branch coverage for domain logic.
- **Colocation**: Tests must be in the same directory as the code (e.g., `user.entity.ts` and `user.entity.test.ts`).
 
---
 
## 🚦 Automation
 
Every PR must pass:
- `pnpm lint` (Biome/Eslint)
- `pnpm type-check` (tsc)
- `pnpm test` (Vitest/Playwright)
- `pnpm check-unused` (Knip)
 
---
 
## 📝 Document Control
 
| Role | Responsibility |
| :--- | :--- |
| **Owner** | Platform Engineering |
| **Last Audit** | 2026-04-28 |
| **Next Review** | 2026-10-28 |
