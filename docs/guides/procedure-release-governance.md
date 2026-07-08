# Release Governance & Lifecycle

> **Standard Operating Procedure for Safe and Reliable Deployments**
> 
> *Version: 2.0 | Status: ACTIVE | Classification: Internal*

---

## 🛤️ The Path to Production

All code follows a strict lifecycle to ensure that only high-quality, tested, and secure features reach our customers.

### 1. Development (Feature Branch)
- **Local Validation**: Pass all unit tests and linting.
- **Peer Review**: At least 2 approvals from domain owners.
- **Staff Audit**: Automated check for S+ standards (Complexity, Line count, Result pattern).

### 2. Integration (Staging)
- **Automatic Deployment**: Merging to `develop` triggers a deploy to the Staging environment.
- **E2E Testing**: Full Playwright suite runs against Staging.
- **Security Triage**: Static and dynamic analysis must pass with zero critical findings.

### 3. Verification (Pre-Production)
- **QA Sign-off**: Manual verification of complex UI/UX features.
- **Performance Baseline**: Check that Core Web Vitals and API latency are within SLOs.

### 4. Release (Production)
- **Canary Rollout**: 5% -> 25% -> 50% -> 100% traffic allocation.
- **Automated Rollback**: If error rates exceed 1% during rollout, the system reverts automatically.

---

## 🚦 Quality Gates (Hard Limits)

Code will be blocked from merging if any of the following criteria are not met:

| Gate | Requirement | Tool |
|------|-------------|------|
| **Type Integrity** | 0 TypeScript Errors | `tsc` |
| **Test Coverage** | 100% (Critical Paths) | `vitest` |
| **Linting** | 0 Warnings | `eslint` / `prettier` |
| **Security** | 0 Critical Vulnerabilities | `snyk` / `gitleaks` |
| **Size** | Files < 200 lines | `staff-audit` |

---

## 🗓️ Release Windows

- **Standard Releases**: Tuesday to Thursday (10:00 AM - 4:00 PM UTC).
- **No-Deploy Friday**: Strictly enforced to avoid weekend incidents, except for critical security hotfixes.
- **Freeze Periods**: No non-critical releases during peak sales events (e.g., Black Friday).

---

## 🚑 Hotfix Procedure

In the event of a production critical bug:
1. Create a `hotfix/` branch from `main`.
2. Implement the fix and include a regression test.
3. Obtain accelerated approval from a Senior Engineer.
4. Deploy to Production immediately after CI passes.
5. Create a [Post-Mortem](../runbooks/incident-response-execution.md) within 24 hours.

---

> **Governance**
> This process is audited quarterly by the Engineering Review Board to ensure adherence to our [Engineering Principles](../policies/engineering-principles.md).
