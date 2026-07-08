# AGENTS.md - PranaKaia E-Commerce Platform

> Open-format instructions for coding agents.
> Version: 1.00 - open-format baseline.
> Domain: enterprise e-commerce, dropshipping, catalog integrity, payments, fulfillment, vendor operations, and customer trust.

## Project Overview

- Monorepo managed with `pnpm` and `turbo`.
- Apps live in `apps/` (`web`, `admin`, `api`).
- Shared domain and platform code lives in `packages/`.
- Source of truth lives in `docs/`.
- If a closer `AGENTS.md` exists in a subdirectory, it takes precedence.

## Setup Commands

- Install deps: `pnpm install`
- Validate environment: `pnpm env:validate`
- Start all dev services: `pnpm dev`
- Start web: `pnpm dev:web`
- Start admin: `pnpm dev:admin`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Format: `pnpm format`
- Type check: `pnpm type-check`
- Full quality gate: `pnpm quality:strict`
- World-class audit: `pnpm world-class:audit`
- Validate packages: `pnpm packages:validate`
- Validate exports: `pnpm packages:exports:validate`
- Check architecture boundaries: `pnpm archi:check`
- Verify backups and recovery: `pnpm db:verify`
- Run disaster recovery drill checks: `pnpm dr:drill:check`

## Code Style

- TypeScript strict mode only.
- Match existing repo conventions in the touched package.
- Prefer small, focused changes.
- Use Biome for formatting and linting.
- Do not introduce `any` or hidden mutable shared state.
- Prefer immutable domain objects, explicit result/error handling, and branded identifiers where the codebase already uses them.
- Keep pricing, taxes, shipping, and checkout calculations server-side.
- Avoid broad refactors unless the task requires them.

## Testing Instructions

- Run the smallest relevant test set first.
- Use package-local scripts or `pnpm turbo run test --filter <package-name>` for targeted work.
- Critical flows:
  - Checkout: `pnpm test:e2e:checkout`
  - Admin inventory: `pnpm test:e2e:admin`
  - Supplier onboarding: `pnpm test:e2e:supplier`
  - Combined critical path: `pnpm test:e2e:critical`
- For broader changes, run `pnpm test`, `pnpm test:coverage`, and any affected integration or Playwright suites.
- Add or update tests for every behavior change.
- Mock external APIs and vendors at the boundary.
- Keep tests deterministic.
- For security-sensitive changes, run `pnpm security:audit` and `pnpm security:secrets:check`.

## Commerce and Dropshipping Rules

- Never oversell.
- Treat vendor inventory as eventual and untrusted until verified.
- Quarantine suppliers that drift from schema or freshness expectations.
- Maintain idempotency for payment, order, and vendor write paths.
- Reconcile payment state against provider webhooks before state transitions.
- Source customer-facing ETA and shipping promises from fulfillment data only.
- Require canonical product data, compliance review, and media rights validation before publication.
- Enforce vendor circuit isolation so one failing supplier does not break the rest of the catalog.
- Never log PII.

## Security and Compliance

- Use `docs/context`, `docs/architecture`, `docs/domain`, `docs/quality`, `docs/operations`, `docs/policies`, and `docs/runbooks` as the source of truth for sensitive flows.
- Treat breaking API, schema, or contract changes as release-sensitive.
- Keep secrets in approved secret stores only.
- Prefer explicit rollback and recovery steps for risky changes.
- For persistence or schema work, validate recovery assumptions with `pnpm db:verify` and `pnpm dr:drill:check`.
- For threat modeling and incident response, consult `docs/operations/SECURITY.md` and `docs/runbooks/incident-response.md` before changing sensitive flows.

## Release Governance

- Use changesets for published package changes.
- Prefer staged or canary rollouts for user-facing changes with financial, inventory, or fulfillment impact.
- Document rollback criteria before merge for payment, checkout, inventory, and vendor integration work.
- Treat contract, schema, and public API changes as release-blocking until validation passes.

## PR and Release Instructions

- Keep pull requests small and focused.
- Include what changed, why, and what was tested.
- Document risk, rollout, and rollback considerations for high-impact changes.
- For published packages, add a Changeset with `pnpm changeset` when required.
- If you change shared contracts or package exports, rerun `pnpm packages:validate` and `pnpm packages:exports:validate`.
- For broader changes, prefer `pnpm staff:ready` or `pnpm staff:ready:extended` before asking for review.

## Reference Docs

- `README.md`
- `docs/README.md`
- `docs/context/README.md`
- `docs/context/architecture-overview.md`
- `docs/context/domain.md`
- `docs/context/database.md`
- `docs/context/api-design.md`
- `docs/adr/README.md`
- `docs/architecture/OVERVIEW.md`
- `docs/architecture/PATTERNS.md`
- `docs/domain/RULES.md`
- `docs/domain/EVENTS.md`
- `docs/quality/TESTING.md`
- `docs/quality/CHECKLISTS.md`
- `docs/operations/OBSERVABILITY.md`
- `docs/operations/SECURITY.md`
- `docs/policies/README.md`
- `docs/policies/coding-standard.md`
- `docs/policies/security-standard.md`
- `docs/policies/testing-standard.md`
- `docs/policies/performance-standard.md`
- `docs/policies/operations-reliability-standard.md`
- `docs/runbooks/README.md`
- `docs/runbooks/incident-response.md`
- `docs/runbooks/deployment-production.md`
- `docs/runbooks/recovery-rollback.md`
- `docs/runbooks/recovery-disaster.md`
- `tests/README.md`

## MCP Tools Usage

- When you need to search docs, use `context7` tools.
- If you are unsure how to do something, use `gh_grep` to search code examples from GitHub.
