# PranaKaia Strategic Roadmap 2025-2026

Este documento detalla la visión técnica y de negocio para la evolución de la plataforma **PranaKaia**. La prioridad es la resiliencia operativa, la automatización del dropshipping y una experiencia de usuario hiper-personalizada.

## 📍 M1: Cimientos SOTA (Q1 2025) — ✅ Completado
*   **Infraestructura**: Migración a Monorepo con TurboRepo + pnpm.
*   **Arquitectura**: Implementación de Domain-Driven Design (DDD) y Railway Oriented Programming.
*   **DX**: Setup de Agentes AI (`.agents`), Biome, y Auditoría Staff-Level.
*   **Core**: Integración base de Stripe y Flow Chile.

## 🚀 M2: Optimización y Escala (Q2 2025) — 🏗 En Progreso
*   **Performance**: Migración total a Tailwind CSS v4 y React Compiler.
*   **Frontend**: Storefront PWA con offline capabilities para catálogo.
*   **Backend**: Refactorización de Server Actions a patrones de "Safe Actions".
*   **Observabilidad**: Integración profunda con OpenTelemetry y Axiom.

## 📦 M3: Dropshipping Automation (Q3 2025)
*   **Logística**: Integración con APIs de Shipit y Starken (Chile).
*   **Fulfillment**: Sistema automatizado de órdenes hacia proveedores externos.
*   **Inventario**: Sincronización en tiempo real multi-almacén y stock virtual.
*   **Wholesale**: Portal B2B para distribuidores.

## 🧠 M4: Inteligencia y Personalización (Q4 2025)
*   **AI Agent**: Implementación de un asistente de compra embebido con RAG sobre el catálogo.
*   **Recomendaciones**: Motor de sugerencias basado en comportamiento de usuario.
*   **Precios Dinámicos**: Ajuste automático de márgenes basado en costos de dropshipping.

## 📱 M5: Ecosistema Mobile (Q1 2026)
*   **App Nativa**: Lanzamiento de PranaKaia App (React Native/Expo) compartiendo lógica de `@pranakaia/core-domain`.
*   **Notificaciones**: Sistema de Push Notifications para seguimiento de pedidos y ofertas.

---

## 🛠 Backlog Técnico (Continuo)
- [ ] Cobertura de tests unitarios > 90% en `packages/*`.
- [ ] Implementación de Chaos Engineering en flujos de pago.
- [ ] Optimización de Bundle Size < 150KB (main entry).
- [ ] Auditoría de seguridad OWASP trimestral.

---

> **Nota**: El Roadmap es un documento vivo y está sujeto a cambios basados en el mercado y feedback de usuarios.
