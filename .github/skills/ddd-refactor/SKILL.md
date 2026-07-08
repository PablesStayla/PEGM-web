---
name: ddd-refactor
description: Ayuda a refactorizar código de "procedural" o "anémico" a un diseño de dominio rico (DDD) con el Result Pattern.
---

# 🏗️ DDD Refactor Skill

## When to Use This Skill
- When a service class contains too much business logic.
- When you find `throw new Error` used for business validations.
- When an entity is being mutated directly.

## Instructions
1. **Identify the Aggregate**: Define the root entity and its invariants.
2. **Apply Inmutability**: Convert the class to use `readonly` and `Object.freeze()`.
3. **Migrate Logic**: Move validation and state changes from services to methods within the Entity/Value Object.
4. **Implement Result Pattern**: 
   - Wrap return types in `Result<T, E>`.
   - Replace `try/catch` blocks with railway-oriented chains (`map`, `flatMap`).
5. **Use Branded Types**: Refactor all IDs to use nominal types.

## Output Standard
- The resulting code must be **S+ Grade**.
- Complexity must be reduced.
- All tests must pass (or be generated if missing).
