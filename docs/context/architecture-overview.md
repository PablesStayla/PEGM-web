---
title: System Architecture Overview
version: 5.0.0
status: Stable
last_updated: 2026-04-28
owner: Platform Engineering
tags: [architecture, design, c4, absolute-zero]
---

# Architecture Overview

> **🏆 ABSOLUTE ZERO - Structural Sovereignty**
> 
> *Strategic blueprint for high-availability e-commerce operations.*

---

 
## 📋 System Blueprint
 
PranaKaia is a **Modular Monolith** built on the Next.js 15 App Router. It integrates high-availability SaaS providers to deliver a globally distributed, edge-optimized e-commerce experience.
 
---
 
## 🏛️ Component Architecture
 
### 1. The Edge (Vercel)
- **Functions**: UI Rendering (RSC), API Handlers, Edge Middleware.
- **Protocol**: HTTPS / HTTP/3.
 
### 2. The Core (Turborepo)
- **Bounded Context Packages**:
  - `@pranakaia/cart`: Cart lifecycle and command handling.
  - `@pranakaia/catalog`: Product management and indexing.
  - `@pranakaia/checkout`: Transactional workflows and order creation.
  - `@pranakaia/identity`: User authentication and authorization.
  - `@pranakaia/inventory`: Stock tracking and reservation.
  - `@pranakaia/logistics`: Fulfillment orchestration and tracking.
  - `@pranakaia/supplier`: Vendor operations and dropshipping.
  - `@pranakaia/shipping`: Rate calculation and carrier integration.
  - `@pranakaia/payments`: Gateway abstraction and transaction security.
- **Foundation Packages**:
  - `@pranakaia/shared-kernel`: Shared value objects, domain primitives, and event bus.
  - `@pranakaia/infrastructure`: Cross-cutting persistence adapters and clients.
  - `@pranakaia/config`: Shared tool configurations (Biome, Vitest, Turbo).
  - `@pranakaia/ui`: Platinum design system and component library.
 
### 3. The Persistence Layer
- **Relational**: Supabase (PostgreSQL).
- **In-Memory**: Upstash (Redis).
- **Media**: Cloudinary.
 
### 4. The Event Loop (Inngest)
- **Pattern**: Event-Driven Workflows.
- **Jobs**: Fulfillment, Email dispatch, Analytics, Stock reconciliation.
 
---
 
## 📡 Communication Patterns
 
| Type | Strategy | Technology |
| :--- | :--- | :--- |
| **Sync (Request/Response)** | Direct Module Invocation | TypeScript Internal Imports |
| **Async (Eventual)** | Domain Events | Inngest / Redis |
| **External (Integration)** | REST / Webhooks | Route Handlers (Problem Details) |
 
---
 
## 🔒 Security Posture
 
- **Identity**: Identity-as-a-Service (IDaaS) with Clerk/Supabase Auth.
- **Perimeter**: Cloudflare Turnstile + WAF.
- **Encryption**: TLS 1.3 in transit; AES-256 at rest (Supabase).
- **Data Privacy**: RLS (Row Level Security) enforced at the DB layer.
 
---
 
## ⚡ Performance Optimization
 
- **RSC Streaming**: Progressive loading for complex product pages.
- **PPR (Partial Prerendering)**: Static headers/footers with dynamic checkout components.
- **Edge Caching**: Stale-While-Revalidate (SWR) for product catalogs.
 
---
 
## 🚦 Resilience & Reliability
 
- **Retry Logic**: Exponential backoff for all external API calls.
- **Circuit Breaker**: Implemented in the `Infrastructure` layer for Payments.
- **Zero-Downtime**: Blue/Green deployments via Vercel.
 
---
 
## 📝 Document Control
 
| Role | Responsibility |
| :--- | :--- |
| **Owner** | Principal Architect |
| **Last Audit** | 2026-04-28 |
| **Next Review** | 2026-10-28 |
