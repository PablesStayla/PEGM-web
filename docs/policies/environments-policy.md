# Policy: Environment Governance
 
> **🏆 ABSOLUTE ZERO - Infrastructure Determinism**
>
> *Version: 5.0 | Status: 🔒 Institutional Governance | Scope: SDLC Environments*
 
---
 
## 📋 Policy Statement
 
To ensure a reliable and predictable delivery pipeline, PranaKaia strictly enforces isolation and configuration parity across all environments. Every environment must be defined as code and satisfy the security requirements of its tier.
 
---
 
## 🏗️ Tiered Environment Model
 
| Tier | Name | Target | Sovereignty |
| :--- | :--- | :--- | :--- |
| **Tier 1** | Local | Developer Machine | Individual Engineer |
| **Tier 2** | Preview | Vercel Preview | Feature Branch (Ephemeral) |
| **Tier 3** | Staging | `stg.pranakaia.com` | `develop` Branch |
| **Tier 4** | Production | `pranakaia.com` | `main` Branch |
 
---
 
## 🔒 Data Isolation & Privacy
 
### 1. Zero Production Data in Lower Tiers
It is strictly forbidden to use production databases or real customer data in Tier 1-3 environments.
- **Remediation**: Use anonymized snapshots or synthetic data generators for testing.
 
### 2. Secret Management
- **Local**: Managed via `.env.local` (Never committed to Git).
- **Staging/Prod**: Managed via Vercel Secrets or Supabase Vault.
- **Rotation**: Keys must be rotated every 90 days.
 
---
 
## 🚀 Environment Parity Mandates
 
- **Platform Versions**: Node.js, pnpm, and Docker versions must be identical across all tiers (enforced via `engines` in `package.json`).
- **Middleware**: Security headers and WAF rules applied in Production must also be enabled in Staging.
- **Service Mocking**: External services (Stripe, Resend) must use their respective "Sandbox" or "Test" modes in Tier 1-3.
 
---
 
## 🚦 Environment Access Control
 
- **Tier 1-2**: Open to all engineers.
- **Tier 3**: Restricted to Senior Engineers and DevOps.
- **Tier 4**: Restricted to the **Release Manager** and **CTO**. All changes require an approved Pull Request and successful CI/CD gate passage.
 
---
 
## 🛡️ Incident & Drift Management
 
- **Drift Detection**: Automated scripts run weekly to compare Staging and Production configurations.
- **Emergency Access**: Break-glass access to Production is logged and requires a post-incident audit.
 
---
 
## 📝 Document Control
 
| Role | Responsibility |
| :--- | :--- |
| **Owner** | DevOps / Security Team |
| **Last Audit** | 2026-04-28 |
| **Next Review** | 2026-10-28 |
