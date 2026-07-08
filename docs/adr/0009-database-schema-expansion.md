---
title: "ADR-0009: Extensible Database Schema for Product Variants"
adr_number: "0009"
version: "4.0-AbsoluteZero"
status: "ACCEPTED"
classification: "Internal Use Only"
last_updated: "2026-04-28"
decision_date: "2026-04-27"
owner: "@PablesStayla"
stakeholders:
  - "@product-team"
  - "@database-admin"
reviewers:
  - "@staff-engineer"
---

# ADR-0009: Extensible Database Schema for Product Variants

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

E-commerce products often come in multiple variations (size, color, material). To support this complexity without compromising performance or schema clarity, we have decided to adopt a **Relational Variant Model** using a `Product` -> `ProductVariant` hierarchy with JSONB support for dynamic attributes.

**Decision:** Use a structured table for core variant data (SKU, Price, Stock) and a JSONB field for extensible metadata.

**Consequences:** Clear relational integrity for business-critical data, while maintaining the flexibility to add new product attributes without frequent migrations.

---

## Context

### Problem Statement

Our initial schema only supported flat products. This was insufficient for items like "PranaKaia Grow Tent" which comes in multiple sizes (120x120, 240x240, etc.). We needed a model that:
1. **Prevents Duplication:** Shared data (Title, Brand) should reside in one place.
2. **Enables Inventory Precision:** Stock must be tracked at the variant level.
3. **Supports Diverse Attributes:** Different products have different attributes (e.g., Watts for lights, Liters for pots).

---

## Decision Drivers

| Priority | Driver | Description |
|:--------:|:-------|:------------|
| **P0** | **Inventory Accuracy** | Stock must be tied to a specific, purchasable SKU. |
| **P0** | **Search Performance** | Ability to filter products by variant attributes (Size, Color). |
| **P1** | **Flexibility** | Support for unknown future product types. |

---

## Considered Options

### Option 1: EAV (Entity-Attribute-Value) Pattern

**Pros:**
- ✅ Infinite flexibility.

**Cons:**
- ❌ Extremely poor query performance for reporting.
- ❌ Complex SQL joins.
- ❌ Loss of database-level type safety.

---

### Option 2: Pure JSONB Schema

**Pros:**
- ✅ Simple schema (one table).
- ✅ Easy to store any shape of data.

**Cons:**
- ❌ No relational integrity for critical fields (Price, SKU).
- ❌ Difficult to enforce non-null constraints on variant fields.

---

### Option 3: Structured Variants with JSONB Metadata - SELECTED

**Pros:**
- ✅ **Relational Integrity:** SKU, Price, and Stock are in strictly typed columns.
- ✅ **Extensibility:** Specialized attributes (Color, Size) are stored in a `metadata` JSONB field.
- ✅ **Performance:** Core filters use indexed columns; specialized filters use JSONB indexes (GIN).
- ✅ **Clean Domain Model:** Clear parent-child relationship in the code.

**Cons:**
- ❌ Slightly more complex writes (multi-table transactions).

---

## Decision

**Chosen Option:** **Structured Variants with JSONB Metadata**.

Schema Outline:
- `products`: Core identity (Slug, Title, Brand, CategoryId).
- `product_variants`: Transactional identity (ProductId, SKU, Price, CompareAtPrice, Stock, Metadata).

---

## Rationale

1. **Business Logic Integrity:** Price and Stock are too important to be buried in a generic JSON blob.
2. **Developer Experience:** Drizzle ORM handles relational joins cleanly, providing full type safety for both the table and the JSONB field.
3. **Optimized for Reading:** 99% of our traffic is reading product data; this model is optimized for fast joins and indexed filtering.

---

## Consequences

### Positive Consequences

| Area | Impact | Description |
|:-----|:-------|:------------|
| **Inventory** | Precise | Eliminates "overselling" due to ambiguous stock tracking. |
| **UX** | Richer | Support for color swatches and size pickers on the PDP. |

### Negative Consequences

| Area | Impact | Mitigation |
|:-----|:-------|:-----------|
| **Migration** | Medium | Requires a careful data migration from the old flat model. |

---

## Implementation

### Drizzle Schema Example

```typescript
export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id),
  sku: varchar('sku').unique().notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').default(0).notNull(),
  metadata: jsonb('metadata').$type<{ size?: string; color?: string }>(),
});
```

---

## References

- [Database Design for E-commerce Product Catalogs](https://vladmihalcea.com/database-design-ecommerce-product-catalog/)
- [PostgreSQL JSONB Performance](https://www.postgresql.org/docs/current/datatype-json.html)

---

> **Document Control**
>
> - **Status:** ACCEPTED
> - **Last Reviewed:** 2026-04-28
> - **Next Review:** 2027-04-28
> - **Reviewed By:** Architecture Review Board
