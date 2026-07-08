---
applyTo: "packages/core-domain/**/*"
---

# 🏗️ Core Domain Instructions (DDD)

When working in this directory, you MUST adhere to the following strict principles:

## 1. Zero Dependencies
- No external libraries except for `zod` (for validation) and shared domain primitives.
- No framework-specific code (Next.js, Express, etc.).

## 2. Inmutable Entities
- Every entity must be a class with `readonly` properties.
- Use `Object.freeze(this)` in the constructor.
- Business methods must return a **new instance** of the entity inside a `Result`.

## 3. Result Pattern
- All domain operations must return `Result<Entity, DomainError>`.
- Use the `Result` utility from `@pranakaia/shared`.

## 4. Branded Types
- All IDs must be branded.
  ```typescript
  type OrderId = string & { readonly __brand: 'OrderId' };
  ```

## 5. Invariants
- Use the constructor or a factory method `create()` to enforce business invariants.
- If properties are invalid, return a `Failure`.
