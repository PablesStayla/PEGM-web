---
title: Architecture Context Index
version: 4.0.0
status: Active
last_updated: 2026-04-28
owner: Architecture Review Board
tags: [index, architecture, context, living-docs]
---

# Architecture Context

> **Living System Design & Domain Documentation**
> 
> *The authoritative source of truth for the current state of PranaKaia.*

---


## 📖 Overview

The `context/` directory serves as the **Single Source of Truth** for the current system architecture. Unlike ADRs, which record the "Why" at a point in time, these documents describe the "What" and "How" of our current production environment.

## 🏛️ System Core

| Component | Description |
| :--- | :--- |
| [**architecture-overview.md**](./architecture-overview.md) | High-level system design, service topology, and component interactions. |
| [**domain.md**](./domain.md) | Domain-Driven Design (DDD) model, Bounded Contexts, and Ubiquitous Language. |
| [**database.md**](./database.md) | PostgreSQL schema design, indexing strategies, and Drizzle ORM patterns. |
| [**api-design.md**](./api-design.md) | REST/tRPC contract standards, versioning, and integration patterns. |

## 📡 Specialized Contexts

- [**deployment.md**](./deployment.md): Infrastructure-as-Code (IaC), Edge deployment, and CI/CD architecture.
- [**testing.md**](./testing.md): The testing pyramid, mutation testing, and E2E strategy.
- [**upstash-redis-integration.md**](./upstash-redis-integration.md): Distributed caching, rate-limiting, and global state management.

## 🗺️ Visualizations & Models

- [**product-roadmap.md**](./product-roadmap.md): Strategic evolution and feature prioritization.
- [**c4-model.md**](./c4-model.md): System hierarchy using the C4 modeling framework (Context, Container, Component).

---

> **Document Control**
> - **Owner:** Architecture Review Board (ARB)
> - **Maintenance:** Real-time updates required for all architectural changes.
