# 🏗️ API Design & Contracts: PranaKaia SOTA Standard
> **Absolute Zero - Deterministic Interface Governance**
>
> *Our API is the bridge between our domain sovereignty and the external world. We design for consistency, safety, and performance.*
>
> *Version: 5.0-AbsoluteZero | Status: 🔒 Single Source of Truth | Last Updated: 2026-04-28*
> *Classification: INTERNAL / PROPRIETARY*

---

## 🏛️ Hybrid API Architecture
PranaKaia implements a dual-mode API strategy optimized for the Next.js ecosystem.

| Mode | Technology | Primary Use Case | Governance |
| :--- | :--- | :--- | :--- |
| **Internal Mutations** | Next.js Server Actions | UI Form submissions, interactive state changes. | `@pranakaia/actions` |
| **External/Integration** | Next.js Route Handlers | Webhooks (Stripe/Flow), Mobile Apps, B2B. | `@pranakaia/api-v1` |
| **Query Layer** | React Server Components | Data fetching, SEO rendering. | `@pranakaia/rsc` |

---

## 🛡️ The "Absolute Zero" API Mandates

### 1. Deterministic Responses (RFC 7807)
All error responses MUST follow the Problem Details standard. No raw stack traces. No vague messages.

```typescript
interface ProblemDetails {
  type: string;        // URI link to error documentation
  title: string;       // Short human-readable summary
  status: number;      // HTTP status code
  detail: string;      // Explanation specific to this instance
  instance: string;    // URI of the resource where the error occurred
  traceId: string;     // Correlation ID for log hunting
}
```

### 2. Payload Sovereignty
- **Casing**: All JSON keys MUST be `camelCase`.
- **Envelopes**: Success responses are wrapped in a `data` object.
- **Strict Typing**: Every API endpoint must have a corresponding Zod schema for input AND output.

### 3. Idempotency by Default
Mutations that can be safely retried must support an `Idempotency-Key` header, especially in the `Payments` and `Orders` contexts.

---

## 🛰️ Interface Contracts

### Standard Success Envelope
```json
{
  "success": true,
  "data": {
    "id": "ord_12345",
    "status": "confirmed"
  },
  "meta": {
    "timestamp": "2026-04-28T10:00:00Z",
    "version": "v1.2.0"
  }
}
```

### Collection Pattern (Pagination)
We prioritize **Cursor-Based Pagination** for all high-volume collections (Products, Orders).
```typescript
GET /api/v1/products?cursor=abc_123&limit=50
```

---

## 🔒 Security & Traffic Control

### 1. Authentication
- **External**: Bearer Token (`Authorization: Bearer <sk_...>`).
- **Internal**: JWT-based Session (NextAuth v5).

### 2. Rate Limiting (Tiered)
| Tier | Limit | Logic |
| :--- | :--- | :--- |
| **Public** | 60 req/min | Per IP (Redis-backed) |
| **Authenticated** | 600 req/min | Per UserID |
| **B2B Partners** | 5000 req/min | Per API Key |

---

## 📝 Implementation Workflow
1. **Spec First**: Update `docs/specs/api-design-guidelines.md` or this document before coding.
2. **Schema Definition**: Create the Zod schema in `packages/shared-kernel`.
3. **Handler Implementation**: Implement in the appropriate bounded context.
4. **Integration Test**: Write an E2E test in `playwright` simulating the contract.

---

## 📝 Document Control

| Role | Responsibility |
| :--- | :--- |
| **Owner** | API Architecture Guild |
| **Last Audit** | 2026-04-28 |
| **Next Review** | 2026-10-28 |