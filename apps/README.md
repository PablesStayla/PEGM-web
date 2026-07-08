
# `apps` Directory Overview

This directory contains the various user-facing applications and backend services that make up the Pranakaia e-commerce platform.

---

## Applications & Services

### 🌐 `web`

- **Purpose:** The main customer-facing e-commerce storefront.
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI, custom components
- **Data Fetching:** tRPC, React Query (for client-side), Server Actions (for server-side)
- **State Management:** Zustand
- **Testing:** Playwright (E2E), Vitest (Unit/Integration)

### ⚙️ `admin`

- **Purpose:** The back-office application for managing products, orders, and customers.
- **Framework:** Next.js 15 (App Router)
- **UI Components:** Radix UI, Recharts (for dashboards)
- **Data Fetching:** Server Actions
- **Testing:** Vitest (Unit/Integration)

### 🔌 `api`

- **Purpose:** A backend-for-frontend (BFF) API providing data to the `web` and `admin` applications.
- **Framework:** NestJS
- **Authentication:** Passport.js (JWT, Local strategies)
- **Database ORM:** Prisma (Assumed, based on other apps)

### 🪝 `webhooks`

- **Purpose:** A dedicated service to handle incoming webhooks from third-party services, primarily Stripe.
- **Framework:** Fastify
- **Key Features:**
  - Handles various Stripe events (payments, subscriptions, etc.).
  - Includes Redis-based idempotency checks to prevent duplicate event processing.
- **Testing:** Vitest (Unit)

### 👷 `worker`

- **Purpose:** A service for processing background jobs and running scheduled tasks (ETL, notifications, etc.).
- **Framework:** Node.js with Bull
- **Key Features:**
  - Manages multiple job queues (`health-data`, `analytics`, `notifications`, `etl`).
  - Runs scheduled cron jobs.
  - Includes a Bull-Board monitoring UI at `http://localhost:9999/ui`.

### 엣지 `edge`

- **Purpose:** Likely contains Edge Functions for platforms like Vercel or Cloudflare. Used for performance-critical middleware (e.g., redirects, personalization).
- **Status:** Not yet analyzed.

### 📖 `docs-portal`

- **Purpose:** A documentation portal, likely for internal or public developer documentation.
- **Status:** Not yet analyzed.

### 🧑‍🏫 `coach`

- **Purpose:** A specialized application, potentially for a coaching or customer support interface.
- **Status:** Not yet analyzed.

