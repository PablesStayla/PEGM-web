---
title: "ADR-0007: TODO Triage & Technical Debt Governance"
adr_number: "0007"
version: "4.0-AbsoluteZero"
status: "ACCEPTED"
classification: "Internal Use Only"
last_updated: "2026-04-28"
decision_date: "2026-04-27"
owner: "@PablesStayla"
stakeholders:
  - "@engineering-leads"
  - "@product-owners"
reviewers:
  - "@staff-engineer"
---

# ADR-0007: TODO Triage & Technical Debt Governance

> **Architecture Decision Record**
>
> *Status: ACCEPTED | Version: 4.0-AbsoluteZero | Decision Date: 2026-04-27*
> *Owner: @PablesStayla | Classification: Internal Use Only*

---

## Table of Contents

1. [Summary](#summary)
2. [Context](#context)
3. [Decision Drivers](#decision-drivers)
4. [The Triage Process](#the-triage-process)
5. [Decision](#decision)
6. [Rationale](#rationale)
7. [Consequences](#consequences)
8. [Implementation](#implementation)
9. [References](#references)

---

## Summary

Technical debt is an inevitable part of high-velocity development. However, "invisible" debt is toxic. We have decided to implement a formal **TODO Triage and Debt Governance** process to ensure every technical trade-off is documented, prioritized, and eventually resolved.

**Decision:** All `// TODO` comments must be categorized, assigned an owner, and tracked via a central "Debt Registry".

**Consequences:** Higher visibility into system health, but requires consistent discipline from all engineers.

---

## Context

### Problem Statement

Before this decision, the codebase was cluttered with hundreds of `// TODO` comments without context, priority, or ownership. This led to:
1. **Broken Promises:** Features half-implemented and forgotten.
2. **Hidden Risks:** Security or performance trade-offs that were never reviewed.
3. **Audit Complexity:** Impossible to determine the true state of readiness for major releases.

---

## Decision Drivers

| Priority | Driver | Description |
|:--------:|:-------|:------------|
| **P0** | **Visibility** | Every bit of technical debt must be measurable. |
| **P1** | **Ownership** | Every trade-off must have a person responsible for it. |
| **P1** | **Prioritization** | Distinguish between "Nice-to-have" and "Critical-before-launch". |

---

## The Triage Process

We classify technical debt into four categories:

1. **[LINTER]:** Small code quality improvements (auto-fixable).
2. **[DOMAIN]:** Incomplete business logic or edge cases.
3. **[INFRA]:** Performance or scalability improvements.
4. **[SECURITY]:** Non-critical security hardening (Critical ones must be fixed immediately).

---

## Decision

**Chosen Option:** **Categorized & Tracked Debt Registry**.

Mandatory Format:
`// TODO: [CATEGORY] [PRIORITY] (OWNER) - Clear description and GitHub Issue link.`
Example: `// TODO: [DOMAIN] [P1] (@PablesStayla) - Implement tax calculation for international orders. Ref: #123`

Any PR with unformatted or unassigned TODOs will be **blocked**.

---

## Rationale

1. **Radical Transparency:** We cannot manage what we cannot see.
2. **Accountability:** Assigning an owner ensures that "everyone's problem" doesn't become "no one's problem".
3. **Strategic Alignment:** Allows Product and Engineering to negotiate debt repayment during sprint planning.

---

## Consequences

### Positive Consequences

| Area | Impact | Description |
|:-----|:-------|:------------|
| **Planning** | High | Clear list of technical tasks for upcoming sprints. |
| **Readiness** | High | Instant audit of what is blocking a production release. |

### Negative Consequences

| Area | Impact | Mitigation |
|:-----|:-------|:-----------|
| **PR Friction** | Low | Automated linting for TODO formatting. |

---

## Implementation

### Linting Rule

A custom eslint rule or script will be used to validate TODO formatting:
```javascript
// Valid
// TODO: [SECURITY] [P0] (@security-agent) - Fix JWT secret rotation. #89

// Invalid
// TODO: fix this later
```

### Monthly Triage

Every last Friday of the month, the Tech Leads will review the "Debt Registry" and prioritize items for the next cycle.

---

## References

- [Technical Debt Quadrant (Martin Fowler)](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html)
- [The Todo Myth](https://blog.codinghorror.com/the-todo-myth/)

---

> **Document Control**
>
> - **Status:** ACCEPTED
> - **Last Reviewed:** 2026-04-28
> - **Next Review:** 2026-07-28
> - **Reviewed By:** Engineering Governance Board
