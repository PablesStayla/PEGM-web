---
title: Production Deployment Runbook
version: 5.1.0
status: Stable
last_updated: 2026-04-28
owner: Site Reliability Engineering
tags: [deployment, ops, infrastructure, vercel, production]
---

# Runbook: Production Deployment

> **🚀 ABSOLUTE ZERO - Deployment Excellence**
> 
> *The definitive procedure for high-availability production releases.*

---

 
## 📋 Overview
 
This runbook serves as the definitive source of truth for provisioning and deploying the PranaKaia E-Commerce ecosystem. It mandates a zero-downtime, security-first approach to production releases.
 
## 🏗️ Infrastructure dependencies
 
The ecosystem relies on high-availability SaaS integrations. Verification of these services is a hard prerequisite for any deployment.
 
| Service | Purpose | Resilience Strategy |
| :--- | :--- | :--- |
| **Vercel** | Edge Computing | Multi-region Serverless |
| **Supabase** | Primary Persistence | Point-in-Time Recovery (PITR) |
| **Upstash** | Global Latency | Multi-zone Replication |
| **Resend** | Transactional Comms | SMTP Fallback |
| **Stripe** | Payment Gateway | Idempotency Keys |
| **Inngest** | Event Orchestration | Persistent Event Store |
| **Cloudflare** | Edge Security | Turnstile + WAF |
 
---
 
## 🚧 Pre-Deployment Protocol
 
### 1. Quality Gates (Non-Negotiable)
The deployment pipeline will automatically abort if these gates are not satisfied:
 
- **Type Sovereignty**: `pnpm -w type-check` (Zero errors)
- **Unit Integrity**: `pnpm test:unit` (100% coverage)
- **Security Audit**: `pnpm security:audit` (Zero High/Critical)
- **Staff Readiness**: `pnpm staff:ready:extended`
 
### 2. Environment Alignment
Secrets must be synchronized across environments using the Platform CLI or Vercel Dashboard.
 
> [!CAUTION]
> **Database Connection Pooling**: Production URLs MUST use session-mode pooling (e.g., Transaction Pooling in Supabase) to prevent socket exhaustion in serverless environments.
 
---
 
## 🚀 Execution Sequence
 
### Step 1: Preview & Smoke Test
Deploy to a preview environment to validate integration integrity.
```bash
vercel --prebuilt
```
**Verification Points**:
- `GET /api/health` returns `HTTP 200 OK`.
- Webhook signature validation passes in sandbox mode.
 
### Step 2: Production Promotion
Promote the validated build to the production edge.
```bash
vercel --prod
```
 
---
 
## 📋 Post-Deployment Verification (PDV)
 
| Gate | Validation Task | Success Metric |
| :--- | :--- | :--- |
| **E2E Flow** | Full Checkout simulation (Stripe Test) | `order.created` event fired |
| **Observability** | Real-time Sentry/Vercel Log stream | Error rate < 0.1% |
| **Event Loop** | Inngest function execution check | 100% job success rate |
| **Performance** | Core Web Vitals (CWV) audit | Lighthouse score > 90 |
 
---
 
## 🔄 Rollback & Recovery
 
In the event of a P0 regression (Critical failure), execute one of the following immediately:
 
### A. Edge Promotion (Fastest)
Promote the last known stable deployment ID.
```bash
vercel list --limit 5
vercel promote <STABLE_DEPLOYMENT_ID> --scope pranakaia
```
 
### B. Git Restoration
Revert the offending commit and trigger the automated pipeline.
```bash
git revert -m 1 <commit-hash>
git push origin main
```
 
---
 
## 📚 Consolidation Reference
This document supersedes and consolidates the following legacy assets:
- `deployment-api-service.md`
- `deployment-general-procedure.md`
- `deployment-production-checklist.md`
- `deployment-production-release.md`
- `procedure-deployment-onboarding.md`
 
> [!IMPORTANT]
> **Adherence Policy**: Any deviation from this runbook during a production rollout is considered a major incident and requires a Post-Mortem.
