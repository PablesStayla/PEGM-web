---
title: "ADR-0010: RESTful API Design Standards & Problem Details"
adr_number: "0010"
version: "4.0-AbsoluteZero"
status: "ACCEPTED"
classification: "Internal Use Only"
last_updated: "2026-04-28"
decision_date: "2026-04-27"
owner: "@PablesStayla"
stakeholders:
  - "@api-consumers"
  - "@frontend-team"
reviewers:
  - "@staff-engineer"
---

# ADR-0010: RESTful API Design Standards & Problem Details

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

To ensure a consistent and predictable interface for our internal and external developers, we have decided to standardize all API communication on **RESTful principles** and the **RFC 7807 (Problem Details for HTTP APIs)** specification for error handling.

**Decision:** Adopt plural resource naming, canonical HTTP status codes, and a uniform error response structure.

**Consequences:** Improved developer experience and easier integration with client-side libraries, but requires strict validation of all new endpoints against these standards.

---

## Context

### Problem Statement

Inconsistent API design leads to:
1. **Confusion:** Is it `/api/product` or `/api/products`?
2. **Brittle Error Handling:** Different endpoints returning errors in different formats (some strings, some objects).
3. **Debugging Difficulty:** Lack of unique request identifiers in responses makes log correlation nearly impossible.

---

## Decision Drivers

| Priority | Driver | Description |
|:--------:|:-------|:------------|
| **P0** | **Consistency** | The API must feel like it was built by a single person. |
| **P0** | **Discoverability** | Familiarity with REST conventions should allow engineers to "guess" endpoints. |
| **P1** | **Observability** | Every response must be traceable back to server-side logs. |

---

## Considered Options

### Option 1: Ad-hoc API Design

**Pros:**
- ✅ Faster to implement for unique, single-purpose endpoints.

**Cons:**
- ❌ High cognitive load for consumers.
- ❌ Inconsistent error handling.
- ❌ Hard to automate (e.g., generating SDKs).

---

### Option 2: Strictly Standardized REST - SELECTED

**Pros:**
- ✅ **Predictability:** Consistent use of GET, POST, PUT, DELETE.
- ✅ **Standardized Errors:** Use of [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807) ensures all errors have a `type`, `title`, and `detail`.
- ✅ **Traceability:** Mandatory `X-Request-ID` in all headers.
- ✅ **Contract-First:** Usage of OpenAPI (Swagger) to document and validate contracts.

**Cons:**
- ❌ Slightly more verbose error responses.
- ❌ Requires refactoring of legacy "style" routes.

---

## Decision

**Chosen Option:** **Standardized REST + RFC 7807**.

Rules:
1. **Resources:** Always plural (e.g., `/api/carts`).
2. **Versioning:** Header-based versioning preferred, URI-based (`/v1/`) accepted as fallback.
3. **Errors:** Must include `code`, `message`, `status`, and `requestId`.
4. **Idempotency:** All `POST` operations on critical resources (Orders, Payments) must support idempotency keys.

---

## Rationale

1. **Enterprise Grade:** REST is the industry standard for interoperability.
2. **Client Reliability:** Using standardized status codes (400, 401, 403, 404, 409, 422) allows frontend libraries (like TanStack Query) to handle common scenarios automatically.
3. **Operational Maturity:** Problem Details provide enough context for automated monitoring systems to categorize and alert on specific error types.

---

## Consequences

### Positive Consequences

| Area | Impact | Description |
|:-----|:-------|:------------|
| **Integrations** | Easier | Standardized contracts reduce the need for constant communication between teams. |
| **Monitoring** | Better | Errors are categorized by type, improving alert accuracy. |

### Negative Consequences

| Area | Impact | Mitigation |
|:-----|:-------|:-----------|
| **Boilerplate** | Medium | Use a shared `createApiResponse` utility in `packages/core-domain`. |

---

## Implementation

### Standard Error Response Format (JSON)

```json
{
  "type": "https://api.pranakaia.com/errors/insufficient-stock",
  "title": "Insufficient Stock",
  "status": 409,
  "detail": "Product variant 'PK-123' only has 2 items left.",
  "instance": "/api/carts/item/add",
  "requestId": "req_88723kjn"
}
```

---

## References

- [RFC 7807: Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [Stripe API Reference (Idempotency)](https://stripe.com/docs/api/idempotency)

---

> **Document Control**
>
> - **Status:** ACCEPTED
> - **Last Reviewed:** 2026-04-28
> - **Next Review:** 2027-04-28
> - **Reviewed By:** API Governance Group
