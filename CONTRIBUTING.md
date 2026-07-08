---
# 🤝 PranaKaia Contribution Protocol
# Role: Engineering Standards & Peer Review Governance
# Tier: Absolute Zero (S+)
# Compliance: SOTA Absolute Zero Taxonomy
# Last Updated: 2026-05-05
---

# 🤝 Contributing to PranaKaia (S-Grade Standard)

> **"Code is read much more often than it is written."** This guide ensures that every contribution maintains our S-Grade quality, performance, and security standards.

---

## 📖 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Environment Setup](#-environment-setup)
3. [Git Workflow](#-git-workflow)
4. [Commit Conventions](#-commit-conventions)
5. [Coding Standards](#-coding-standards)
6. [Testing Strategy](#-testing-strategy)
7. [Pull Request Protocol](#-pull-request-protocol)
8. [Code Review Principles](#-code-review-principles)
9. [Monorepo Architecture](#-monorepo-architecture)

---

## 🛠 Prerequisites

| Tool | Minimum Version |
| :--- | :--- |
| **Node.js** | 24.x |
| **pnpm** | 9.x |
| **Git** | 2.40+ |
| **Docker** | Latest Desktop/Engine |

---

## 🏗 Environment Setup

```bash
# 1. Clone & Initialize
git clone https://github.com/PablesStayla/PranaKaia-Ecommerce.git
cd PranaKaia-Ecommerce

# 2. Install Dependencies (Enterprise Lockfile)
pnpm install --frozen-lockfile

# 3. Environment Configuration
cp .env.example .env.local
# Fill required values as per ENVIRONMENTS.md

# 4. Spin up Infrastructure
make docker:up

# 5. Start Development
pnpm dev
```

---

## 🌿 Git Workflow

We utilize **Trunk-Based Development** with short-lived feature branches:

- **`main`**: Protected production branch. Requires passing CI and Staff approval.
- **`feat/*`**: New capabilities.
- **`fix/*`**: Bug resolutions.
- **`chore/*`**: Maintenance & dependencies.

**CRITICAL:** Never push directly to `main`. Always use Pull Requests.

---

## 📝 Commit Conventions

We strictly enforce **Conventional Commits** via `commitlint`:

```text
<type>(<scope>): <short description in imperative>

[optional body]
[optional footer]
```

### Approved Types
- `feat`: New feature
- `fix`: Bug fix
- `perf`: Performance improvement
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `docs`: Documentation only changes
- `chore`: Infrastructure/Maintenance (e.g., updating pnpm-lock)

---

## 💻 Coding Standards

### 1. Defensive Programming
- **Zod Validation:** All I/O must be validated at the boundary.
- **Result Pattern:** Use `Result<T, E>` for domain operations. No "silent" failures.
- **Immutability:** Favor `const` and immutable data structures.

### 2. Performance
- **RSC First:** Use React Server Components by default.
- **Latency Budget:** Keep API responses < 200ms (P95).
- **Bundle Size:** UI components must be treeshakeable and minimal.

### 3. Security
- **No Secrets:** Secrets must only exist in `.env.local` or environment variables.
- **AuthZ:** Authorization checks must happen at the service level, not just the UI.

---

## 🧪 Testing Strategy

| Level | Tool | Coverage Goal |
| :--- | :--- | :--- |
| **Unit** | Vitest | 90%+ (Core Logic) |
| **E2E** | Playwright | Critical Paths Only |
| **Mutation** | Stryker | 80%+ (Domain Layer) |

```bash
pnpm test:unit     # Run unit tests
pnpm test:e2e      # Run Playwright tests
pnpm test:coverage # Generate coverage report
```

---

## 📤 Pull Request Protocol

1.  **Small PRs:** Aim for < 400 lines of code changes.
2.  **Self-Audit:** Run `pnpm staff:audit` before opening a PR.
3.  **Documentation:** Update relevant `.md` files if you change architecture or environments.
4.  **Tests:** New features must have unit tests. Bug fixes must have regression tests.

---

## 🧐 Code Review Principles

We approach code reviews as a collaborative learning process:
- **Be Respectful:** Critique the code, not the person.
- **Context is King:** Explain *why* a change is requested.
- **Blocking vs. Suggestions:** Clearly mark critical fixes vs. "nice-to-have" improvements.
- **Atomic Commits:** Ensure the PR history is clean and readable.

---

## 🏛 Monorepo Architecture

```text
packages/
├── core-domain/    # 🎯 Domain Logic (Entities, Value Objects)
├── db/             # 🗄️ Drizzle ORM Schema & Migrations
├── auth/           # 🔒 Supabase Auth Integration
├── ui/             # 🎨 Shared UI Components (shadcn/ui)
├── infra/          # 🏗️ Infrastructure & 3rd Party Wrappers
├── api/            # 🌐 Shared API Contracts (OpenAPI)
├── ...             # 25+ Specialized Packages
apps/
├── web/            # 🛒 Consumer Storefront (Next.js)
├── admin/          # 🛡️ Staff Control Panel (Next.js)
```

---

*Last Updated: 2026-04-27*  
*Standard Level: **S-Grade / Staff Approved***
