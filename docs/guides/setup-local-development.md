# Guide: Local Environment Setup
 
> **🏆 ABSOLUTE ZERO - Deterministic Provisioning**
>
> *Version: 5.0 | Status: 🔒 Stable | Scope: Local Development Environment*
 
---
 
## 📋 Prerequisites
 
Ensure your machine meets the following baseline requirements before proceeding:
- **Node.js**: `v22.0.0+` (LTS recommended)
- **pnpm**: `v9.0.0+`
- **Docker Desktop**: Required for local database and Redis services.
- **Git**: `v2.40+`
- **Operating System**: Windows 11 (WSL2 recommended), macOS, or Linux.
 
---
 
## 🚀 Initial Provisioning
 
### 1. Repository Acquisition
```bash
git clone https://github.com/pranakaia/e-commerce.git
cd e-commerce
```
 
### 2. Dependency Resolution
We use `pnpm` for deterministic dependency trees. Do not use `npm` or `yarn`.
```bash
corepack enable pnpm
pnpm install
```
 
### 3. Environment Configuration
Copy the global template to your local environment file.
```bash
cp .env.example .env
```
> [!IMPORTANT]
> Reach out to the **Platform Team** to obtain your personal Supabase, Stripe, and Inngest development keys.
 
---
 
## 🏗️ Services & Persistence
 
### 1. Database Initialization (Supabase)
We use the Supabase CLI for local PostgreSQL development.
```bash
pnpm db:start     # Starts local Supabase stack
pnpm db:push      # Pushes latest schema to local DB
```
 
### 2. Event Orchestration (Inngest)
Start the Inngest dev server to handle background workflows locally.
```bash
pnpm inngest:dev
```
 
---
 
## 🧪 Sanity Check (The "Staff" Test)
 
Before starting development, verify that your environment satisfies the **Absolute Zero** quality gates.
 
```bash
pnpm staff:ready
```
 
**Expected Output**:
- ✅ Lint & Format: Success
- ✅ Type Check: Success
- ✅ Unit Tests: Success
- ✅ Build: Success
 
---
 
## 🛠️ Daily Workflow
 
Start the development servers for the entire monorepo:
```bash
pnpm dev
```
 
| Application | URL |
| :--- | :--- |
| **B2C Web App** | `http://localhost:3000` |
| **Admin Dashboard** | `http://localhost:3001` |
| **Inngest Portal** | `http://localhost:8288` |
| **Supabase Studio** | `http://localhost:54321` |
 
---
 
## 🆘 Troubleshooting
 
- **Dependency Conflicts**: Run `pnpm doctor` to fix workspace inconsistencies.
- **DB Desync**: Run `pnpm db:reset` to purge and re-initialize the local database.
- **Caching Issues**: Clear the Turbo cache with `rm -rf .turbo`.
 
---
 
## 📝 Document Control
 
| Role | Responsibility |
| :--- | :--- |
| **Owner** | Developer Experience (DX) Team |
| **Last Audit** | 2026-04-28 |
| **Next Review** | 2026-10-28 |
