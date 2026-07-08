---
title: Scripts Standardization & Automation
version: 1.1.0
status: Active
last_updated: 2026-05-20
owner: Devops & Platform Engineering
tags: [scripts, automation, powershell, bash, monorepo]
---

# Scripts Standardization & Automation

> **Multi-Platform Automation Standards & Validation Infrastructure**
> 
> *The developer guidelines for writing, configuring, and executing local development and CI/CD shell scripts.*

---

## 🎯 Vision

Automation at PranaKaia must remain highly reliable, fast, multi-platform (compatible with macOS, Linux, and Windows), and secure. Scripts are considered primary source code; they must follow consistent naming, explicit error checking, and verbose logging paradigms.

---

## 📂 Standardized Script Directory

All repository-wide scripts must be stored in the root `scripts/` folder:

```
scripts/
├── validate-packages.ps1    # Validates all package packaging configurations
├── quick-validate.ps1       # Rapid testing & lint verification runner
├── rename-kebab-case.mjs    # File naming system enforcement utility
├── env-validate.ps1         # Validates local .env structures against schema
└── db-migrate.sh            # Production database migration orchestrator
```

---

## 🏗️ Multi-Platform Requirements

All automated scripts must be executable by developers working on macOS, Linux, and Windows.

1. **PowerShell Core (`pwsh`):** Use PowerShell Core (`.ps1`) for complex scripting tasks requiring rich object pipelines, structured output parsing, or extensive file systems operations.
2. **Bash (`.sh`):** Use standard POSIX Bash (`.sh`) for lightweight scripts, entry points, or docker orchestrations. Avoid advanced bash-isms that break on older versions of macOS.
3. **Node.js (`.mjs` / `.ts`):** Use TypeScript or ES Modules for tasks closely integrated with codebase packages (e.g. workspace parsing, TS file operations).

---

## 🚦 Script Conventions & Rules

Every script inside the repository must strictly follow these rules:

### 1. Zero Hardcoded Secrets
- Never store API tokens, keys, passwords, or database credentials inside script files.
- Always retrieve secrets from environment variables (`process.env` or `$env:KEY`) with explicit validation.
- Include a fallback check that outputs a clear instructions message if a required variable is missing:
```powershell
if (-not $env:DATABASE_URL) {
    Write-Error "CRITICAL: DATABASE_URL environment variable is not defined."
    exit 1
}
```

### 2. Robust Error Handling (Fail-Fast)
- **PowerShell:** Always include `$ErrorActionPreference = 'Stop'` at the top of every `.ps1` script to halt execution immediately on the first error.
- **Bash:** Always include `set -euo pipefail` to ensure scripts stop immediately if a command fails, an unassigned variable is expanded, or a piped command encounters an error.

### 3. Clear Output & Logs
- Print progress markers during execution.
- Use distinct colors (green for success, yellow for warnings, red for errors) when terminal capabilities allow.
- Avoid printing credentials or PII in plain text logs.

---

## 🛠️ Main Standardized Workflows

Here are the primary commands for executing common tasks:

### 1. Package Validation
Ensures every package matches publish-ready criteria (`build`, `attw`, `publint`):
```bash
pnpm exec pwsh scripts/validate-packages.ps1
```

### 2. Local Environment Setup
Verifies system dependencies (node version, pnpm version) and confirms local `.env` variables:
```bash
pnpm exec pwsh scripts/env-validate.ps1
```

### 3. Database Recovery & Migration Drills
Simulates disaster recovery procedures to ensure backups are fully restorable:
```bash
pnpm db:verify
pnpm dr:drill:check
```

---
> **Document Control**
> - **Revision:** 1.1.0
> - **Audit Cycle:** Bi-annual
