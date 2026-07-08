# Standard: Testing & Quality Assurance
 
> **🏆 ABSOLUTE ZERO - Quality Sovereignty**
>
> *Version: 5.0 | Status: 🔒 Institutional Governance | Compliance: 100% Coverage Mandatory*
 
---
 
## 📋 Testing Philosophy
 
We do not ship code without automated verification. Testing is the primary mechanism through which we achieve the **Absolute Zero** goal. A failing test is a blocking event for the entire pipeline.
 
---
 
## 📐 Quality Metrics (The S+ Grade)
 
| Metric | Requirement | Enforcement |
| :--- | :--- | :--- |
| **Branch Coverage** | **100%** | `vitest --coverage` |
| **Mutation Score** | **> 90%** | `stryker run` |
| **Type Errors** | **0** | `tsc --noEmit` |
| **Lint Violations** | **0** | `eslint .` |
| **Complexity (Cyclomatic)** | **< 8** | ESLint `complexity` rule |
 
---
 
## 🧪 Mandatory Test Categories
 
### 1. Domain Unit Tests
Mandatory for all files in `packages/core-domain`.
- Focus on business rules, invariants, and edge cases.
- **Rule**: No mocks allowed for Entities or Value Objects.
 
### 2. Integration Tests
Mandatory for all `Infrastructure` adapters.
- Must verify database interactions, API integrations, and message bus behavior.
- **Rule**: Use real service instances via Testcontainers or Dev-Tiers.
 
### 3. Smoke E2E Tests
Mandatory for all P0 flows in the UI.
- Login, Checkout, and Order Confirmation.
- **Rule**: Must run on every PR in a preview environment.
 
---
 
## 🛡️ Testing Rituals
 
- **TDD (Test-Driven Development)**: Prefer writing tests before implementation.
- **Peer Test Review**: PR reviewers must verify the quality and exhaustiveness of the tests as much as the implementation.
- **Property-Based Testing (PBT)**: Required for all financial and mathematical algorithms.
 
---
 
## 🚦 Failure Response
 
- **CI Failure**: Any test failure in the pipeline blocks the merge. No exceptions.
- **Flaky Tests**: If a test fails inconsistently, it must be fixed or removed immediately. A flaky test is worse than no test.
 
---
 
## 📝 Document Control
 
| Role | Responsibility |
| :--- | :--- |
| **Owner** | QA Lead / Architecture Guild |
| **Last Audit** | 2026-04-28 |
| **Next Review** | 2026-07-28 |
