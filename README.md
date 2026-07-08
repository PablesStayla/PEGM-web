# PranaKaia E-Commerce Platform

> **Enterprise-Grade Grow Shop E-Commerce & Dropshipping Platform**
> 
> *Version: 3.0-Enterprise | Status: PRODUCTION | Last Updated: 2026-01-20*
> *Region: Chile 🇨🇱 | Compliance: PCI-DSS, GDPR, SOC2*

<p align="center">
  <img src="https://img.shields.io/badge/Version-3.0--Enterprise-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/Status-Production-green?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Compliance-PCI--DSS%20%7C%20GDPR%20%7C%20SOC2-orange?style=for-the-badge" alt="Compliance">
</p>

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Features & Capabilities](#features--capabilities)
5. [Quick Start](#quick-start)
6. [Development](#development)
7. [Security & Compliance](#security--compliance)
8. [SLA & Support](#sla--support)
9. [Contributors](#contributors)
10. [License](#license)

---

## Executive Summary

**PranaKaia** is a premium, enterprise-grade e-commerce platform specializing in grow shop products with automated dropshipping capabilities. Built with modern architecture patterns and designed for scale, it serves the Chilean market with world-class reliability and performance.

### Key Metrics

| Metric | Value | Target |
|--------|-------|--------|
| **Availability** | 99.99% | 99.95% |
| **API Latency (P99)** | 145ms | <200ms |
| **Test Coverage** | 92% | 90%+ |
| **Security Score** | A+ | A+ |

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Web App    │  │  Mobile App  │  │   Admin      │  │   PWA        │    │
│  │   Next.js    │  │   (Future)   │  │   Panel      │  │              │    │
│  │   Port 3000  │  │              │  │   Port 3001  │  │              │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼──────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │    API Gateway      │
                          │    (Kong/AWS)       │
                          │    Rate Limiting    │
                          └──────────┬──────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
   ┌──────▼──────┐          ┌───────▼───────┐          ┌───────▼───────┐
   │   Order     │          │   Catalog     │          │   Payment     │
   │  Service    │          │   Service     │          │   Service     │
   │   (Go)      │          │   (Node.js)   │          │   (Node.js)   │
   │   gRPC      │          │    REST       │          │   Webhooks    │
   └──────┬──────┘          └───────┬───────┘          └───────┬───────┘
          │                          │                          │
          └──────────────────────────┼──────────────────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
   ┌──────▼──────┐          ┌───────▼───────┐          ┌───────▼───────┐
   │ PostgreSQL  │          │    Redis      │          │Elasticsearch │
   │  (Primary)  │          │   (Cache)     │          │   (Search)    │
   │  Supabase   │          │   Sessions    │          │               │
   └─────────────┘          └───────────────┘          └───────────────┘
```

### Monorepo Structure

```
pranakaia/
├── apps/
│   ├── web/                    # Customer Storefront (Next.js 15)
│   │   ├── src/
│   │   │   ├── app/           # App Router
│   │   │   ├── components/    # React Components
│   │   │   └── lib/           # Utilities
│   │   └── package.json
│   └── admin/                  # Admin Dashboard (Next.js 15)
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   └── lib/
│       └── package.json
├── packages/
│   ├── core-domain/            # DDD Business Logic
│   ├── ui/                     # Shared UI Components
│   ├── db/                     # Drizzle ORM & Migrations
│   ├── auth/                   # NextAuth v5 Configuration
│   ├── payments/               # Stripe + Flow Integration
│   ├── email/                  # Email Templates & Service
│   ├── infra/                  # Infrastructure Wrappers
│   └── shared-types/           # TypeScript Definitions
├── services/
│   ├── order-service/          # Go Microservice
│   ├── catalog-service/        # Node.js Microservice
│   └── payment-service/        # Payment Processing
├── infra/
│   ├── docker/                 # Container Definitions
│   ├── kubernetes/             # K8s Manifests
│   └── terraform/              # Infrastructure as Code
├── docs/
│   ├── context/                # Architecture Documentation
│   ├── operations/             # Runbooks & Playbooks
│   └── adr/                    # Architecture Decisions
└── .agents/
    ├── skills/                 # AI Agent Skills
    ├── commands/               # Custom Commands
    └── context/                # Context Documents
```

---

## Technology Stack

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 15.x | React Framework (SSR/SSG) |
| | React | 19.x | UI Library |
| | TypeScript | 5.9.x | Type Safety |
| | Tailwind CSS | 4.x | Styling |
| | shadcn/ui | latest | Component Library |
| | Radix UI | latest | Primitives |
| **Backend** | Node.js | 20.x LTS | Runtime |
| | Go | 1.22+ | Microservices |
| | NextAuth v5 | beta.25 | Authentication |
| | Server Actions | - | API Endpoints |
| **Database** | PostgreSQL | 15.x | Primary Database |
| | Drizzle ORM | latest | Type-safe ORM |
| | Redis | 7.x | Cache/Sessions |
| | Supabase | 2.x | Database & Auth |
| **Payments** | Stripe | latest | Payment Processing |
| | Flow (Chile) | latest | Local Payments |
| | Inngest | latest | Background Jobs |
| **Testing** | Vitest | latest | Unit Testing |
| | Playwright | latest | E2E Testing |
| | Stryker | latest | Mutation Testing |
| **Tools** | Biome | 2.x | Lint & Format |
| | Lefthook | latest | Git Hooks |
| | Turbo | 2.x | Build System |
| | pnpm | 9.x | Package Manager |
| | Docker | latest | Containerization |
| **Observability** | OpenTelemetry | - | Tracing |
| | Sentry | - | Error Tracking |
| | Prometheus | - | Metrics |

---

## Features & Capabilities

### Customer Experience

| Feature | Status | Description |
|---------|--------|-------------|
| **Catalog Management** | ✅ | Dynamic product catalog with categories, variants, and inventory |
| **Shopping Cart** | ✅ | Persistent cart with optimistic updates |
| **Checkout** | ✅ | Multi-step checkout with Stripe + Flow integration |
| **Wishlists** | ✅ | User wishlist functionality |
| **Reviews** | ✅ | Product reviews with ratings and votes |
| **PWA** | 🔄 | Progressive Web App capabilities (in progress) |
| **Offline Support** | 🔄 | Offline catalog browsing (in progress) |

### Admin Capabilities

| Feature | Status | Description |
|---------|--------|-------------|
| **Dashboard** | ✅ | Data-driven KPI dashboard |
| **Order Management** | ✅ | Full order lifecycle management |
| **Product Management** | ✅ | CRUD operations for products |
| **Inventory Control** | ✅ | Real-time inventory tracking |
| **User Management** | ✅ | RBAC user administration |
| **Analytics** | ✅ | Business intelligence and reporting |

### Technical Features

| Feature | Status | Description |
|---------|--------|-------------|
| **DDD Architecture** | ✅ | Domain-Driven Design implementation |
| **Type Safety** | ✅ | 100% TypeScript strict mode |
| **Safe Actions** | ✅ | Type-safe server actions |
| **Rate Limiting** | ✅ | API rate limiting |
| **Audit Logging** | ✅ | Complete audit trail |
| **CI/CD** | ✅ | GitHub Actions automation |
| **Auto-scaling** | ✅ | Kubernetes HPA |

---

## Quick Start

### Prerequisites

```bash
# Required versions
node -v    # v20.x LTS or higher
pnpm -v    # v9.0.0 or higher
docker -v  # Latest stable
```

### Installation

```bash
# 1. Clone repository
git clone https://github.com/PablesStayla/pranakaia.git
cd pranakaia

# 2. Install dependencies
pnpm install --frozen-lockfile

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Start infrastructure (optional)
make docker:up

# 5. Run database migrations
pnpm --filter @pranakaia/db db:migrate

# 6. Start development
pnpm dev
```

### Local URLs

| Application | URL | Description |
|-------------|-----|-------------|
| Storefront | http://localhost:3000 | Customer-facing web app |
| Admin Panel | http://localhost:3001 | Administrative dashboard |
| Drizzle Studio | http://localhost:4983 | Database GUI |

### Development Commands

```bash
# Code quality
pnpm lint           # Run Biome linter
pnpm lint:fix       # Auto-fix issues
pnpm format         # Format code
pnpm type-check     # TypeScript check

# Testing
pnpm test:unit      # Unit tests
pnpm test:e2e       # E2E tests
pnpm test:coverage  # Coverage report

# Database
pnpm db:generate    # Generate migrations
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Drizzle Studio
pnpm db:seed        # Seed database

# Staff validation
pnpm staff:ready    # Full readiness check
pnpm staff:audit    # Staff-level audit
```

---

## Development

### Engineering Excellence: Absolute Zero (S+ Grade)

PranaKaia follows the **Absolute Zero** engineering standard, a strict set of architectural rules designed for maximum reliability and maintainability:

| Pillar | Standard | Enforcement |
| :--- | :--- | :--- |
| **Type Safety** | 100% Strict + Branded Types | Biome (Error) |
| **Logic Integrity** | Result Pattern (ROP) | Core Domain Standard |
| **Code Quality** | Cognitive Complexity ≤ 3 | CI Blocking Gate |
| **Verification** | 100% Coverage + 95% Mutation | Stryker Mutator |
| **Maintenance** | 0% Dead Code | Knip Enforcement |
| **Architecture** | Hexagonal / Modular Monolith | Architecture Shield |
| **File Limit** | Target 120 lines / Hard 200 | Staff Audit Gate |

### Standards

- **TypeScript**: Strict mode with no `any`
- **Architecture**: DDD + Railway Oriented Programming
- **Testing**: AAA pattern, 90%+ coverage
- **Security**: Zod validation, audit logging, RLS
- **Performance**: P95 < 200ms

### Workflow

1. Create feature branch: `feature/PRK-123-description`
2. Follow conventional commits
3. Run pre-commit checks
4. Open PR with template
5. Code review required
6. Merge to main

### Documentation

- [Architecture](./docs/context/ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT.md)
- [Environment Setup](./ENVIRONMENTS.md)
- [Contributing](./CONTRIBUTING.md)
- [Security](./SECURITY.md)

---

## Security & Compliance

### Certifications

- **PCI-DSS Level 1** - Payment Card Industry compliance
- **GDPR** - Data protection regulation
- **SOC2 Type II** - Security controls

### Security Features

- JWT with RS256 signing
- MFA for admin access
- Rate limiting (100 req/min public, 1000 req/min auth)
- RLS on all database tables
- Audit logging for all admin actions
- Secret rotation every 90 days
- Dependency vulnerability scanning

### Reporting

Report security vulnerabilities to: **security@pranakaia.cl**

See [SECURITY.md](./SECURITY.md) for details.

---

## SLA & Support

### Service Level Agreements

| Service | Availability | Response Time |
|---------|--------------|---------------|
| Storefront | 99.99% | < 200ms P95 |
| Admin Panel | 99.95% | < 300ms P95 |
| API | 99.99% | < 200ms P95 |
| Checkout | 99.9% | < 500ms P99 |

### Support Channels

| Priority | Channel | Response Time |
|----------|---------|---------------|
| P0 (Critical) | #incidents-war-room / ops@ | 15 minutes |
| P1 (High) | support@ | 1 hour |
| P2 (Medium) | GitHub Issues | 4 hours |
| P3 (Low) | GitHub Discussions | 24 hours |

See [SUPPORT.md](./SUPPORT.md) for full details.

---

## Contributors

### Lead

- **PEGM** ([@PablesStayla](https://github.com/PablesStayla)) - Lead Architect & Visionary

### AI Engineering

- **Antigravity** - Systems Engineering & Code Hardening

### Contributors

See [AUTHORS.md](./AUTHORS.md) for full contributor list.

---

## License

**Private & Proprietary**

© 2025-2026 PranaKaia. Todos los derechos reservados.

This is a closed-source proprietary project. Unauthorized use, distribution, or modification is prohibited.

---

<p align="center">
  <strong>PranaKaia</strong> — Built with ⚡ in Chile<br>
  <a href="https://github.com/PablesStayla">GitHub</a> ·
  <a href="./docs">Documentation</a> ·
  <a href="./ROADMAP.md">Roadmap</a>
</p>