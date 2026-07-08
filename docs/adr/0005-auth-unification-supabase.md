---
title: "ADR-0005: Unified Authentication via Supabase Auth"
adr_number: "0005"
version: "4.0-AbsoluteZero"
status: "ACCEPTED"
classification: "Internal Use Only"
last_updated: "2026-04-28"
decision_date: "2026-03-31"
owner: "@PablesStayla"
stakeholders:
  - "@security-team"
  - "@frontend-team"
reviewers:
  - "@staff-engineer"
---

# ADR-0005: Unified Authentication via Supabase Auth

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

The PranaKaia platform previously had fragmented authentication systems (Next-Auth and Supabase Auth). We have decided to unify all authentication and authorization logic under **Supabase Auth** to provide a single source of truth for user identity and security across the entire ecosystem.

**Decision:** Unify all authentication (Web, Admin, API) into Supabase Auth. Remove Next-Auth.

**Consequences:** Streamlined security management and unified user sessions, but required a migration of existing sessions and adaptation of application middleware.

---

## Context

### Problem Statement

Maintaining multiple authentication providers (Next-Auth for Web, Supabase for DB interactions) led to:
1. **Session Fragmentation:** Users could be logged into one app but not the other.
2. **Security Complexity:** Diverse token validation logic and different middleware implementations.
3. **Redundant Dependencies:** Extra bundle size and maintenance overhead.

### Background

Supabase Auth provides robust, production-ready features including MFA, Social Logins, and seamless integration with our PostgreSQL Row Level Security (RLS).

---

## Decision Drivers

| Priority | Driver | Description |
|:--------:|:-------|:------------|
| **P0** | **Identity Unity** | Single user record across all applications. |
| **P0** | **Security Integration** | Native integration with Database RLS policies. |
| **P1** | **Reduced Complexity** | Eliminate redundant libraries (Next-Auth). |
| **P1** | **Scalability** | Support for global enterprise-grade auth features. |

---

## Considered Options

### Option 1: Dual Stack (Next-Auth + Supabase)

**Pros:**
- ✅ Flexibility to use different adapters.

**Cons:**
- ❌ High maintenance overhead.
- ❌ JWT synchronization issues.
- ❌ Complex middleware logic.

---

### Option 2: Unified Supabase Auth - SELECTED

**Pros:**
- ✅ **Native RLS:** Direct path for secure database access.
- ✅ **Unified Session:** One cookie/token for all subdomains.
- ✅ **Feature Rich:** Built-in email/password, magic links, social, and MFA.
- ✅ **Simplified Code:** Removal of complex Next-Auth configurations.

**Cons:**
- ❌ Vendor lock-in (Supabase).
- ❌ Migration effort for existing Next-Auth users.

---

## Decision

**Chosen Option:** **Unified Supabase Auth**.

All authentication flows (Sign up, Log in, Password Reset) must use the `@supabase/ssr` or `@supabase/auth-helpers` packages. Authorization logic (RBAC) will be enforced at the API level and Database level (RLS).

---

## Rationale

1. **Security Excellence:** Supabase Auth is audited and provides enterprise-grade security features out of the box.
2. **Architecture Alignment:** Fits perfectly with our Modular Monolith and Supabase DB choice.
3. **Developer Experience:** Simplifies the developer mental model for authentication.

---

## Consequences

### Positive Consequences

| Area | Impact | Description |
|:-----|:-------|:------------|
| **Security** | High | Native RLS enforcement reduces data leak risks. |
| **Bundle Size** | -150KB | Removal of Next-Auth and its dependencies. |
| **Maintenance** | Low | Single configuration point for all auth features. |

### Negative Consequences

| Area | Impact | Mitigation |
|:-----|:-------|:-----------|
| **User Migration** | High | Plan for mandatory password reset or session re-validation for existing users. |

---

## Implementation

### Key Steps

1. Uninstall `next-auth`.
2. Configure `@supabase/ssr` in the monorepo `packages/auth`.
3. Standardize middleware to validate Supabase sessions.
4. Implement Row Level Security (RLS) policies on all tables.

---

## References

- [Supabase Auth SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

> **Document Control**
>
> - **Status:** ACCEPTED
> - **Last Reviewed:** 2026-04-28
> - **Next Review:** 2027-04-28
> - **Reviewed By:** Security Board
