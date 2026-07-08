---
title: Strategic Domain Model
version: 5.0.0
status: Living Document
last_updated: 2026-04-28
owner: Product & Engineering
tags: [domain, ddd, strategic-design, ubiquitous-language]
---

# Domain Model: PranaKaia E-Commerce

> **🏆 ABSOLUTE ZERO - Strategic Domain Modeling**
> 
> *The heart of the business logic and tactical design patterns.*

---

 
## 📋 Strategic Vision
 
PranaKaia is a high-performance, event-driven e-commerce platform. Our domain model focuses on **User Experience**, **Transactional Integrity**, and **Operational Transparency**.
 
---
 
## 🗺️ Bounded Contexts (Strategic Design)
 
We divide the system into high-cohesion contexts. Each context owns its logic and data sovereignty.
 
### 1. Identity Context
- **Ownership**: User profiles, Authentication, RBAC (Roles), Permissions.
- **Key Entities**: `User`, `Account`, `Session`.
- **Integrations**: Clerk / Supabase Auth.
 
### 2. Catalog Context
- **Ownership**: Products, Variants, Categories, Inventory levels.
- **Key Entities**: `Product`, `Variant`, `Category`, `Attribute`.
- **Integrations**: Sanity (CMS) / Cloudinary (Media).
 
### 3. Sales & Cart Context
- **Ownership**: Pricing logic, Discounts, Cart management.
- **Key Entities**: `Cart`, `CartItem`, `Coupon`.
- **Integrations**: Upstash (Redis) for ephemeral state.
 
### 4. Checkout & Orders Context
- **Ownership**: Order lifecycle, State machine, Fulfillment tracking.
- **Key Entities**: `Order`, `OrderItem`, `Shipment`.
- **Integrations**: Stripe (Metadata) / Inngest (Workflows).
 
### 5. Payments Context
- **Ownership**: Transactions, Refunds, Idempotency.
- **Key Entities**: `Payment`, `Transaction`, `Refund`.
- **Integrations**: Stripe / PayPal.
 
---
 
## 🗣️ Ubiquitous Language (The Glossary)
 
| Term | Domain Definition | Tech Representation |
| :--- | :--- | :--- |
| **Sku** | Unique Stock Keeping Unit for a variant. | `Sku` (Branded String) |
| **Abandoned Cart** | A cart with no activity for > 24 hours. | `Cart` with `isAbandoned` logic |
| **Ready for Shipment** | Order has been paid and stock is reserved. | `OrderStatus.Paid` + `InventoryEvent` |
| **Price Point** | The exact price of a variant including VAT. | `Money` Value Object |
 
---
 
## 🛠️ Tactical Domain Patterns
 
### 1. Value Objects
Used for attributes with no identity but business logic.
- `Email`, `Money`, `Sku`, `Address`.
- **Rule**: Must be immutable and validated on creation.
 
### 2. Entities
Objects with unique IDs and a defined lifecycle.
- `Product`, `Order`, `User`.
- **Rule**: Must be reconstituted via Factories to ensure invariants.
 
### 3. Aggregates
Clusters of domain objects treated as a single unit for data changes.
- `Order` (Root) + `OrderItems` + `ShippingAddress`.
- **Rule**: Changes must be made through the Aggregate Root to preserve invariants.
 
---
 
## 📡 Domain Events (The Pulse)
 
| Event | Trigger | Consumer |
| :--- | :--- | :--- |
| `order.created` | New order finalized in checkout. | Inventory (Reserve), Analytics. |
| `payment.succeeded` | Stripe webhook confirmation. | Order (Mark Paid), Email Service. |
| `stock.depleted` | Variant quantity hits 0. | Catalog (Hide/Notify). |
 
---
 
## 🚦 Domain Governance
 
- **Language Purity**: All code naming must match the Ubiquitous Language.
- **Invariant Enforcement**: Domain objects cannot exist in an invalid state.
- **Update Frequency**: This document must be reviewed after every Bounded Context refactor.