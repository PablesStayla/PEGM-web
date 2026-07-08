# Developer Portal

> **Central Hub for Engineering, Architecture, and Operations**
>
> *Version: 3.0-Enterprise | Status: ACTIVE | Last Updated: 2026-04-28*

---

## 🎯 Purpose

1. **Centralize Access**: Provide a single point of entry for API contracts, architecture maps, and operational runbooks.
2. **Accelerate Onboarding**: Reduce time-to-productivity for new engineers.
3. **Operational Alignment**: Sync technical validations with the product roadmap and engineering standards.

## 🛠️ Getting Started

1. **Local Setup**:
   - `pnpm install`
2. **Development Servers**:
   - `pnpm dev:web` (B2C Storefront)
   - `pnpm dev:admin` (Internal Dashboard)
3. **Quality Gates**:
   - `pnpm type-check` (Strict TS validation)
   - `pnpm test:e2e:critical` (Playwright smoke tests)
   - `pnpm coverage:apps:critical:check` (100% coverage enforcement)

---

## 🔌 API & Contracts

1. **Platform Specification**:
   - [api.yaml](../../contracts/openapi/api.yaml)
2. **Critical Web Endpoints**:
   - [web-critical.yaml](../../contracts/openapi/web-critical.yaml)
3. **Interactive Tools**:
   - [api-playground.md](./api-playground.md)

## 🏛️ Architecture & Context

1. **System Map**:
   - [architecture.md](../context/architecture.md)
2. **Domain Model**:
   - [domain.md](../context/domain.md)
3. **Decision Log**:
   - [ADR Index](../adr/README.md)

## 🏎️ Operations & Quality

1. **Performance Standards**:
   - [performance-standard.md](../policies/performance-standard.md)
2. **SLO/SLI Targets**:
   - [operations-slo-sli-standard.md](../policies/operations-slo-sli-standard.md)
3. **Incident Response**:
   - [incident-response-execution.md](../runbooks/incident-response-execution.md)
4. **Disaster Recovery**:
   - [recovery-rollback-procedure.md](../runbooks/recovery-rollback-procedure.md)

---

> **Document Control**
> - **Owner:** Platform Engineering
> - **Contact:** #eng-docs-portal (Slack)
