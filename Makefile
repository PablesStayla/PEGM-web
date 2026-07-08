# =============================================================================
# PranaKaia E-Commerce - Makefile (S-Grade)
# =============================================================================

.PHONY: help install dev build test lint format clean \
        docker\:up docker\:down docker\:logs \
        db\:generate db\:migrate db\:studio db\:seed \
        staff\:audit staff\:ready quality\:strict

# Default target
help: ## Show available commands with professional formatting
	@echo ""
	@echo "  PranaKaia Ecosystem - Development Control Center"
	@echo "  ==============================================="
	@echo ""
	@grep -E '^[a-zA-Z_\:\-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-24s\033[0m %s\n", $$1, $$2}'
	@echo ""

# =============================================================================
# 🚀 Development & DX
# =============================================================================

install: ## Install dependencies with frozen lockfile (High-Standard)
	pnpm install --frozen-lockfile

dev: ## Start full stack development environment
	pnpm dev

dev\:web: ## Start only the web storefront (Next.js 15)
	pnpm dev:web

dev\:admin: ## Start only the admin panel (Next.js 15)
	pnpm dev:admin

dx\:doctor: ## Comprehensive local diagnostic (Standard Check)
	pnpm dx:doctor

# =============================================================================
# 🛡️ Quality & Security
# =============================================================================

build: ## Concurrent build of all packages (Turbo)
	pnpm build

test: ## Run unit tests (Vitest)
	pnpm test:unit

test\:e2e: ## Run critical E2E tests (Playwright)
	pnpm test:e2e:critical

lint: ## Fast linting across monorepo (Biome)
	pnpm lint

format: ## Auto-format code (Biome)
	pnpm format

quality\:strict: ## Strict verification (Lint + Types + Tests)
	pnpm quality:strict

staff\:audit: ## Full platform security & architecture audit
	pnpm staff:audit

staff\:ready: ## Final check before production deployment
	pnpm staff:ready

# =============================================================================
# 🗄️ Database (Drizzle ORM)
# =============================================================================

db\:generate: ## Generate Drizzle migrations from schema
	pnpm db:generate

db\:migrate: ## Push migrations to Supabase
	pnpm db:migrate

db\:studio: ## Open Drizzle Studio (Browser GUI)
	pnpm db:studio

db\:seed: ## Seed database with enterprise-grade sample data
	pnpm db:seed

db\:backup: ## Automated database backup to secure storage
	pnpm db:backup

# =============================================================================
# 🏗️ Infrastructure (Docker)
# =============================================================================

docker\:up: ## Spin up local infrastructure (DB, Redis, S3 Mock)
	pnpm docker:up

docker\:down: ## Graceful shutdown of local infrastructure
	pnpm docker:down

docker\:logs: ## Stream logs from infrastructure containers
	pnpm docker:logs

# =============================================================================
# 🚀 Deployment
# =============================================================================

deploy\:preview: ## Deploy preview instance (Vercel)
	pnpm --filter @pranakaia/web vercel

deploy\:production: ## Deploy to production (Staff Approval Required)
	pnpm --filter @pranakaia/web vercel --prod

---

# Metadata
# Last Updated: 2026-04-27
# Standard: Enterprise / Staff Level
