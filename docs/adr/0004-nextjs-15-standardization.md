---
title: "ADR-0004: Standardizing on Next.js 15 & React 19"
adr_number: "0004"
version: "4.0-AbsoluteZero"
status: "ACCEPTED"
classification: "Internal Use Only"
last_updated: "2026-04-28"
decision_date: "2026-04-27"
owner: "@PablesStayla"
stakeholders:
  - "@frontend-team"
  - "@platform-team"
reviewers:
  - "@staff-engineer"
supersedes: "ADR-0004-LEGACY (Downgrade to Next 14)"
---

# ADR-0004: Standardizing on Next.js 15 & React 19

> **Architecture Decision Record**
>
> *Status: ACCEPTED | Version: 4.0-AbsoluteZero | Decision Date: 2026-04-27*
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

After a brief period of instability using early canary versions, we have decided to standardize the platform on **Next.js 15.x** and **React 19.x**. These versions offer critical performance improvements (React Compiler, optimized hydration) and features (Server Actions, enhanced Metadata API) essential for our e-commerce performance targets.

**Decision:** We will use Next.js 15 and React 19 across all applications (Web, Admin) and packages.

**Consequences:** Access to the latest streaming and compilation features, but requires staying vigilant with third-party library compatibility.

---

## Context

### Problem Statement

The PranaKaia platform requires the highest possible performance for SEO and user experience. Initial attempts to use Next.js 16 canary were unstable, leading to a temporary downgrade to v14. However, Next.js 15 has reached a stable maturity level that satisfies our production-grade requirements.

### Background

Our "Absolute Zero" philosophy demands high performance. React 19's features like `use` and the React Compiler are game-changers for reducing client-side bundle size and improving core web vitals.

---

## Decision Drivers

| Priority | Driver | Description |
|:--------:|:-------|:------------|
| **P0** | **Performance** | Core Web Vitals (LCP, INP) optimization. |
| **P0** | **Stability** | Predictable production behavior. |
| **P1** | **Future Proofing** | Avoid legacy technical debt from v14 patterns. |

---

## Considered Options

### Option 1: Stay on Next.js 14 LTS

**Pros:**
- ✅ Highly stable.
- ✅ Wide ecosystem support.

**Cons:**
- ❌ Missing modern Server Action features.
- ❌ Slower compilation and hydration.
- ❌ Legacy patterns (e.g., old metadata API).

---

### Option 2: Next.js 15 & React 19 - SELECTED

**Pros:**
- ✅ **React Compiler:** Significant reduction in manual `memo`/`useMemo`.
- ✅ **Improved Hydration:** Better handling of mismatch errors.
- ✅ **Server Actions:** First-class support for data mutations.
- ✅ **Async Request APIs:** Better control over headers and cookies.

**Cons:**
- ❌ Minor breaking changes in caching defaults.
- ❌ Requires Node.js 18.17+.

---

## Decision

**Chosen Option:** **Next.js 15 & React 19**.

We will maintain these versions as the baseline for the entire monorepo. Any package in `packages/*` must target React 19 peer dependencies.

---

## Rationale

1. **Performance at Scale:** React 19's optimizations are critical for the scale of our product catalog.
2. **Modern DX:** Next.js 15's improved error overlays and dev server performance significantly boost productivity.
3. **Alignment:** Aligns with our "Absolute Zero" goal of using state-of-the-art but stable engineering tools.

---

## Consequences

### Positive Consequences

| Area | Impact | Description |
|:-----|:-------|:------------|
| **TBT (Total Blocking Time)** | -30% | Thanks to improved React 19 scheduling. |
| **Dev Velocity** | High | Less boiler plate for state management. |

### Negative Consequences

| Area | Impact | Mitigation |
|:-----|:-------|:-----------|
| **Breaking Changes** | Medium | Follow the official [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15). |

---

## Implementation

### Update Sequence

1. Update root `package.json` overrides.
2. Update `apps/web` and `apps/admin` dependencies.
3. Verify `packages/ui` compatibility with React 19.
4. Run `pnpm staff:ready` to validate full system integrity.

---

## References

- [Next.js 15 Blog Post](https://nextjs.org/blog/next-15)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)

---

> **Document Control**
>
> - **Status:** ACCEPTED
> - **Last Reviewed:** 2026-04-28
> - **Next Review:** 2026-10-28
> - **Reviewed By:** Architecture Review Board
