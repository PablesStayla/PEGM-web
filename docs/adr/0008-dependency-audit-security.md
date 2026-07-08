---
title: "ADR-0008: Dependency Security Hardening & Automated Auditing"
adr_number: "0008"
version: "4.0-AbsoluteZero"
status: "ACCEPTED"
classification: "Internal Use Only"
last_updated: "2026-04-28"
decision_date: "2026-04-27"
owner: "@PablesStayla"
stakeholders:
  - "@security-team"
  - "@devops-team"
reviewers:
  - "@staff-engineer"
---

# ADR-0008: Dependency Security Hardening & Automated Auditing

> **Architecture Decision Record**
>
> *Status: ACCEPTED | Version: 4.0-AbsoluteZero | Decision Date: 2026-04-27*
> *Owner: @PablesStayla | Classification: Internal Use Only*

---

## Table of Contents

1. [Summary](#summary)
2. [Context](#context)
3. [Decision Drivers](#decision-drivers)
4. [The Security Stack](#the-security-stack)
5. [Decision](#decision)
6. [Rationale](#rationale)
7. [Consequences](#consequences)
8. [Implementation](#implementation)
9. [References](#references)

---

## Summary

Third-party dependencies represent the largest attack surface for our e-commerce platform. We have decided to implement a strict **Dependency Governance** policy, including mandatory vulnerability scanning, automated audit reports, and a "Secure by Default" versioning strategy.

**Decision:** Implement `pnpm audit`, `Snyk`, and GitHub Security Alerts as blocking gates in our CI/CD pipeline.

**Consequences:** Safer supply chain, but requires ongoing maintenance to resolve reported vulnerabilities.

---

## Context

### Problem Statement

The PranaKaia monorepo has 200+ direct and transitive dependencies. Without automated auditing, we were exposed to:
1. **Known Vulnerabilities (CVEs):** Outdated packages with high-severity exploits.
2. **Malicious Packages:** Supply chain attacks through unpinned dependencies.
3. **Bloated Bundles:** Unnecessary dependencies increasing the attack surface and slow deployments.

### Background

As an e-commerce platform handling sensitive payment data, security is not optional. A single vulnerable package could lead to a massive data breach.

---

## Decision Drivers

| Priority | Driver | Description |
|:--------:|:-------|:------------|
| **P0** | **Trust** | Customers must trust us with their credit card and personal info. |
| **P0** | **Compliance** | Meeting PCI-DSS and GDPR requirements. |
| **P1** | **Automation** | Security shouldn't slow down development; it should be integrated. |

---

## The Security Stack

1. **pnpm audit:** Fast, local audit during development.
2. **GitHub Dependabot:** Automated PRs for security updates.
3. **Knip:** Identification and removal of unused dependencies.
4. **Secret Scanning:** Prevention of API keys/secrets leakage in git.

---

## Decision

**Chosen Option:** **Automated Dependency Governance**.

Policies:
1. **Critical/High CVEs:** Must be fixed **immediately** (Merge blocker).
2. **Moderate CVEs:** Must be resolved within **14 days**.
3. **Unused Dependencies:** Removed monthly using `pnpm knip`.
4. **Pinning:** Use exact versions for critical infrastructure packages.

---

## Rationale

1. **Defense in Depth:** Multiple layers of scanning (local, CI, Cloud).
2. **Proactive Maintenance:** Don't wait for a breach; patch proactively.
3. **Efficiency:** Automated PRs reduce the manual labor of keeping packages up to date.

---

## Consequences

### Positive Consequences

| Area | Impact | Description |
|:-----|:-------|:------------|
| **Risk Reduction** | High | Minimizes exposure to supply chain attacks. |
| **Compliance** | High | Provides an audit trail for security certifications. |

### Negative Consequences

| Area | Impact | Mitigation |
|:-----|:-------|:-----------|
| **Build Overhead** | Low | Scans are parallelized in CI. |
| **Breaking Changes** | Medium | Updates must pass the full test suite before merge. |

---

## Implementation

### CI Configuration (GitHub Actions)

```yaml
- name: Security Audit
  run: pnpm audit --audit-level high
- name: Unused Deps Check
  run: pnpm knip
```

### Emergency Patching

If a critical vulnerability is found without an immediate fix:
1. Audit the impact (is the vulnerable code used?).
2. If yes, apply a patch using `pnpm patch` or replace the library.

---

## References

- [OWASP Top 10: Vulnerable and Outdated Components](https://owasp.org/www-project-top-ten/2017/A9_2017-Using_Components_with_Known_Vulnerabilities)
- [pnpm audit documentation](https://pnpm.io/cli/audit)

---

> **Document Control**
>
> - **Status:** ACCEPTED
> - **Last Reviewed:** 2026-04-28
> - **Next Review:** 2026-07-28
> - **Reviewed By:** Security Review Board
