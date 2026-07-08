# System Models: C4 Visualization
 
> **🏆 ABSOLUTE ZERO - Architectural Transparency**
>
> *Version: 5.0 | Status: 🔒 Stable | Notation: C4 Model*
 
---
 
## 📋 Context Diagram (Level 1)
 
Visualizes how the PranaKaia system interacts with external actors and services.
 
```mermaid
graph TD
    User((Customer)) --> WebApp[PranaKaia Web App]
    Admin((Staff)) --> AdminApp[Admin Dashboard]
    
    WebApp --> Payment[Stripe Gateway]
    WebApp --> Identity[Clerk/Supabase Auth]
    WebApp --> Media[Cloudinary]
    
    WebApp --> Core[PranaKaia Core System]
    Core --> Database[(PostgreSQL)]
    Core --> Redis[(Redis Cache)]
    Core --> Events[Inngest Event Bus]
```
 
---
 
## 🏗️ Container Diagram (Level 2)
 
Breakdown of the system into high-level technical containers.
 
```mermaid
graph LR
    subgraph Vercel_Edge
        Action[Server Actions]
        RSC[Server Components]
        API[Route Handlers]
    end
    
    subgraph Turborepo_Packages
        Domain[core-domain]
        Infra[infrastructure]
    end
    
    subgraph Data_Services
        DB[(Supabase DB)]
        Cache[(Upstash Redis)]
    end
    
    RSC --> Domain
    Action --> Domain
    API --> Domain
    Domain --> Infra
    Infra --> DB
    Infra --> Cache
```
 
---
 
## 🧩 Component Diagram (Level 3)
 
Detailed view of a single bounded context (e.g., Orders).
 
```mermaid
graph TD
    Cmd[CreateOrderCommand] --> Handler[CreateOrderHandler]
    Handler --> Entity[Order Entity]
    Handler --> Port[OrderRepository Port]
    Port --> Adapter[DrizzleOrderRepository]
    Adapter --> SQL[(PostgreSQL)]
    
    Entity --> Event[OrderCreatedEvent]
    Event --> Bus[Inngest Bus]
```
 
---
 
## 🚦 Modeling Governance
 
1. **Consistency**: Any change to `ARCHITECTURE-STANDARD.md` must be reflected in these diagrams.
2. **Clarity**: Use standard C4 notation (Context, Containers, Components, Code).
3. **Living Docs**: Diagrams are embedded as Mermaid code to ensure they stay up-to-date with the codebase.
 
---
 
## 📝 Document Control
 
| Role | Responsibility |
| :--- | :--- |
| **Owner** | Architecture Guild |
| **Last Audit** | 2026-04-28 |
| **Next Review** | 2026-10-28 |
