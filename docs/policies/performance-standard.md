# Performance Standard: Sub-Second Commerce
 
> **🏆 ABSOLUTE ZERO - Performance Sovereignty**
>
> *Version: 5.0 | Status: 🔒 Institutional Governance | Metric: LCP < 1.2s*
 
---
 
## 📋 Performance Philosophy
 
Speed is a feature. We believe that every millisecond of latency directly impacts conversion and user satisfaction. We design for the **Edge** and optimize for the **P99** user.
 
---
 
## 📐 Core Web Vitals (CWV) Targets
 
We strictly enforce the following targets for all production pages:
 
| Metric | Threshold | Success Logic |
| :--- | :--- | :--- |
| **LCP (Largest Contentful Paint)** | **< 1.2s** | Fast visual feedback |
| **INP (Interaction to Next Paint)** | **< 100ms** | Tactile responsiveness |
| **CLS (Cumulative Layout Shift)** | **< 0.05** | Visual stability |
| **TTFB (Time to First Byte)** | **< 200ms** | Edge-rendered or static |
 
---
 
## 🏗️ Architectural Optimizations
 
### 1. RSC & Streaming
- Use React Server Components (RSC) to fetch data on the server and stream it to the client.
- Skeleton loaders must be implemented for all dynamic zones to maintain CLS.
 
### 2. Edge Caching (SWR)
- Product catalogs and static content must be cached at the Vercel Edge.
- Use `stale-while-revalidate` headers to ensure instant delivery while updating in the background.
 
### 3. Image & Media Optimization
- **Format**: All images must be served as WebP or AVIF via Cloudinary.
- **Lazy Loading**: Mandatory for all images below the fold.
- **Priority**: Use the `priority` attribute for the LCP image.
 
---
 
## ⚡ Code-Level Standards
 
- **Bundle Size**: Individual client bundles must not exceed 50KB (Gzipped).
- **Tree Shaking**: Ensure all internal packages are ES-module compatible.
- **JavaScript Execution**: Minimize the use of heavy client-side libraries. If a task can be done on the server, it must be done on the server.
 
---
 
## 📊 Monitoring & Regression Testing
 
- **Lighthouse CI**: Runs on every PR. Any score drop > 5 points blocks the merge.
- **Real User Monitoring (RUM)**: Vercel Speed Insights enabled in Production.
- **Load Testing**: Mandatory load testing via `runbook-monitoring-load-testing.md` before major sales events (Black Friday).
 
---
 
## 🚀 Optimization Checklist
 
- [ ] Images served with correct width/height to prevent layout shift.
- [ ] Font sub-setting used to minimize weight.
- [ ] Critical CSS inlined by Next.js.
- [ ] API responses Gzipped/Brotli compressed.
 
---
 
## 📝 Document Control
 
| Role | Responsibility |
| :--- | :--- |
| **Owner** | Frontend Guild / Performance Lead |
| **Last Audit** | 2026-04-28 |
| **Next Review** | 2026-10-28 |
