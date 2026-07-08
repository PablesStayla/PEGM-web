---
title: "ADR-0006: System-wide Type Safety Hardening"
adr_number: "0006"
version: "4.0-AbsoluteZero"
status: "ACCEPTED"
classification: "Internal Use Only"
last_updated: "2026-04-28"
decision_date: "2026-03-31"
owner: "@PablesStayla"
stakeholders:
  - "@engineering-teams"
reviewers:
  - "@staff-engineer"
---

# ADR-0006: System-wide Type Safety Hardening

> **Architecture Decision Record**
>
> *Status: ACCEPTED | Version: 4.0-AbsoluteZero | Decision Date: 2026-03-31*
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
9. [References](#references)

---

## Summary

To achieve "Absolute Zero" engineering quality, we must eliminate ambiguity in our codebase. We have decided to enforce **system-wide strict type safety**, mandate the removal of all `any` types, and implement **Branded Types** for critical identifiers and **Result Patterns** for error handling.

**Decision:** Enforce `strict: true` in all `tsconfig.json` files, ban `any`, and use specialized type patterns for domain logic.

**Consequences:** Increased initial development time for complex types, but zero runtime type-related crashes and significantly improved maintainability.

---

## Context

### Problem Statement

Legacy code contained several instances of `any`, `unknown` without narrowing, and "loose" types for IDs (e.g., `string` for all IDs). This led to:
1. **Logic Errors:** Passing a `productId` to a function expecting a `cartId`.
2. **Runtime Crashes:** Unhandled `undefined` or incorrect property access.
3. **Weak Contracts:** API responses that didn't match their TypeScript definitions.

### Background

Type safety is the foundation of our stability. A single `any` can propagate through the system, creating a "black hole" in our compiler's knowledge.

---

## Decision Drivers

| Priority | Driver | Description |
|:--------:|:-------|:------------|
| **P0** | **Stability** | Eliminate runtime "undefined is not a function" errors. |
| **P0** | **Correctness** | Prevent logical errors at compile time (e.g., ID swapping). |
| **P1** | **Documentation** | Types should serve as the living documentation of the code. |
| **P1** | **Refactorability** | High confidence when changing core domain logic. |

---

## Considered Options

### Option 1: Standard TypeScript (Loose Strictness)

**Pros:**
- ✅ Lower barrier to entry for new developers.
- ✅ Faster prototyping.

**Cons:**
- ❌ High risk of runtime regressions.
- ❌ Harder to maintain as the team grows.

---

### Option 2: Absolute Zero Type Hardening - SELECTED

**Pros:**
- ✅ **Branded Types:** Unique types for `ProductId`, `OrderId`, etc., preventing ID mix-ups.
- ✅ **Result Pattern:** Explicit error handling (Railway Oriented Programming).
- ✅ **No Any Policy:** Zero tolerance for `any` in the entire repository.
- ✅ **Zod Validation:** Runtime validation at the boundaries (API, DB) ensures type truth.

**Cons:**
- ❌ Steeper learning curve for junior engineers.
- ❌ More boilerplate for simple operations.

---

## Decision

**Chosen Option:** **Absolute Zero Type Hardening**.

Mandatory Patterns:
1. **Branded Types:** Use `Brand<string, 'ID_TYPE'>` for all domain identifiers.
2. **Result Pattern:** Functions with multiple failure modes must return `Result<T, E>`.
3. **Strict Linting:** `eslint-plugin-typescript` must enforce `@typescript-eslint/no-explicit-any`.
4. **Zod:** Mandatory schema validation for all external data.

---

## Rationale

1. **Mission Critical:** An e-commerce platform manages money and inventory; errors are expensive.
2. **Scalability:** Strong types are essential for a monorepo with multiple teams.
3. **Engineering Excellence:** Aligns with the standards of top-tier engineering organizations (Stripe, Google).

---

## Consequences

### Positive Consequences

| Area | Impact | Description |
|:-----|:-------|:------------|
| **Bug Rate** | -80% | Significant reduction in post-release regressions. |
| **Code Quality** | High | Clearer contracts and better IDE support. |

### Negative Consequences

| Area | Impact | Mitigation |
|:-----|:-------|:-----------|
| **Dev Friction** | Medium | Provide utility types and shared `Result` patterns in `packages/core-domain`. |

---

## Implementation

### Standard Configurations

All `tsconfig.json` must include:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Result Pattern Example

```typescript
type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E };
```

---

## References

- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)
- [TypeScript Branded Types](https://medium.com/@ivonotsosmart/branded-types-in-typescript-the-what-and-the-how-71d5300455f0)

---

> **Document Control**
>
> - **Status:** ACCEPTED
> - **Last Reviewed:** 2026-04-28
> - **Next Review:** 2026-10-28
> - **Reviewed By:** Architecture Review Board
