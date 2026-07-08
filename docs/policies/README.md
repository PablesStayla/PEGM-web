# Governance, Policies & Standards

> **Enterprise Engineering Governance**
>
> *Version: 4.0-AbsoluteZero | Status: ACTIVE | Last Updated: 2026-04-28*
> *Classification: INTERNAL*

---

## 📖 Overview

The `policies/` directory contains the authoritative standards and policies that define our engineering culture and operational excellence. Adherence to these documents is mandatory for all contributors.

## 🛡️ Engineering Standards (The "How")

| Standard | Description |
| :--- | :--- |
| [**architecture-standard.md**](./architecture-standard.md) | Modular Monolith principles, DDD patterns, and Layered Architecture. |
| [**coding-standard.md**](./coding-standard.md) | TypeScript strictness, Result patterns, and file organization rules. |
| [**testing-standard.md**](./testing-standard.md) | 100% Coverage targets, Mutation testing, and Property-Based Testing (PBT). |
| [**security-standard.md**](./security-standard.md) | OAuth2/OIDC, Encryption-at-rest, and OWASP Top 10 mitigation. |
| [**performance-standard.md**](./performance-standard.md) | Core Web Vitals targets, p99 latency limits, and bundle size budgets. |
| [**operations-reliability-standard.md**](./operations-reliability-standard.md) | Service Level Objectives (SLOs), SLIs, and Error Budgets. |

## 📜 Operational Policies (The "What")

| Policy | Description |
| :--- | :--- |
| [**incident-management-policy.md**](./incident-management-policy.md) | Critical response protocols and blameless post-mortem standards. |
| [**data-privacy-policy.md**](./data-privacy-policy.md) | GDPR/CCPA compliance, data residency, and anonymization rules. |
| [**disaster-recovery-policy.md**](./disaster-recovery-policy.md) | RTO/RPO targets and business continuity strategies. |
| [**engineering-principles.md**](./engineering-principles.md) | Core philosophy: "Ship Small, Measure Everything, Zero Trust." |
| [**communication-standard.md**](./communication-standard.md) | Asynchronous communication, documentation-first, and RFC processes. |

---

## ⚖️ Compliance & Enforcement

1. **Automation First**: Whenever possible, these standards are enforced via CI/CD linting, custom ESLint rules, and Git hooks.
2. **Review Cycles**: Policies are reviewed semi-annually by the Architecture Review Board (ARB).
3. **Exceptions**: Any deviation must be justified via an **ADR** and approved by a Tech Lead.

---

> **Document Control**
> - **Owner:** Engineering Leadership Team
> - **Authority:** Architecture Review Board (ARB)
