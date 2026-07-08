# PranaKaia Enterprise Tools

> **Enterprise-grade tooling — Functional Core, Imperative Shell architecture**
>
> Version 3.0 · Based on practices from Google, Stripe, and Microsoft

## 🏛️ Architecture

All tools follow the **5 Enterprise Pillars**:

| # | Pillar | Rule |
|---|--------|------|
| 1 | **Naming & Shebang** | `verb-target-purpose.ts` · Executables: `#!/usr/bin/env tsx` |
| 2 | **Functional Core / Imperative Shell** | Pure functions in `internal/` or `lib/` · I/O only in CLI shell |
| 3 | **Type-Safety & Zod** | Zero `any` · Zod for all CLI inputs, env vars, JSON reads |
| 4 | **≤150 lines · Complexity ≤3** | No file >150 lines · No nested if/else |
| 5 | **Testing with Vitest** | Every core function has a `.test.ts` with mocked I/O |

### Dependency Direction

```
  Shell ──→ internal/ ──→ lib/ ──→ libraries/
  (CLI)      (core)      (kernel)  (framework)
    │           │            │          │
    ▼           ▼            ▼          ▼
  argv/env   pure fn    shared fn   Result<T>
  console     DI ports   Zod        createCli
  process     no I/O     no I/O     no I/O

  ←── IMPORTS FLOW RIGHT ──→
  ←── NEVER LEFT ──→
  ←── NEVER CROSS-CATEGORY ──→
```

---

## 📁 Directory Structure

```
tools/
├── lib/                              # Shared Kernel (cross-category pure functions)
│   ├── audit-secrets-logic.ts       # Core: secret scanning
│   ├── audit-secrets-types.ts       # Types + SecretScanPort
│   ├── clean-artifacts-data.ts      # Pure data: cleanup targets
│   ├── clean-artifacts-logic.ts     # Core: artifact cleanup
│   ├── clean-artifacts-types.ts     # Types + FileSystemPort + Zod
│   ├── clean-repository-logic.ts    # Core: repo cleanup + FsPort
│   ├── deploy-stages-logic.ts       # Core: deployment pipeline
│   ├── deploy-stages-types.ts       # Types + ShellPort
│   ├── env-validator-logic.ts       # Core: env validation
│   ├── env-validator-types.ts       # Types + Zod + ALL_ENV_SCHEMAS
│   ├── move-reports-logic.ts        # Core: report moving + MovePort
│   ├── secret-patterns-logic.ts     # Core: patterns + shouldIgnore
│   ├── validate-agent-metadata-logic.ts  # Core: frontmatter validation
│   ├── validate-agent-metadata-types.ts  # Types + AgentFsPort
│   ├── validate-all-logic.ts        # Core: validation orchestration
│   ├── validate-all-types.ts        # Types + ExecPort
│   ├── validate-env-logic.ts        # Core: env validation (commandline)
│   ├── validate-env-types.ts        # Types + Zod + ENV_RULES
│   └── validate-packages-exports-logic.ts  # Core: export validation
│
├── libraries/                        # Framework utilities
│   ├── create-cli.ts                # CLI builder (commander + kleur)
│   └── types.ts                     # Result<T,E>, success(), failure()
│
├── tests/                            # Centralized tests for lib/ functions
│   ├── clean-artifacts-logic.test.ts
│   ├── deploy-stages-logic.test.ts
│   ├── env-validator-logic.test.ts
│   ├── validate-agent-metadata-logic.test.ts
│   └── validate-env-logic.test.ts
│
├── auditing/                         # Audit & analysis tools
│   ├── internal/                    # Private functional core
│   │   ├── coverage-analyzer-logic.ts
│   │   ├── coverage-types.ts
│   │   ├── mcp-health-logic.ts
│   │   ├── mcp-health-types.ts
│   │   ├── service-updater-logic.ts
│   │   ├── service-updater-types.ts
│   │   ├── tools-audit-logic.ts
│   │   └── tools-audit-types.ts
│   ├── analyze-coverage-gaps.ts     # Analyze test coverage gaps
│   ├── audit-tools-registry.ts      # Audit all registered tools
│   ├── check-mcp-health.ts          # Check MCP server health
│   └── update-service-references.ts # Update audit service refs
│
├── authentication/                   # Auth & credential tools
│   ├── internal/
│   │   ├── admin-logic.ts
│   │   └── admin-types.ts
│   └── setup-admin-credentials.ts   # Setup admin credentials
│
├── automation/                       # Automation tools
│   ├── internal/
│   │   ├── level-logic.ts
│   │   └── level-types.ts
│   ├── assign-levels-automation.ts   # Assign automation levels
│   └── validate-agent-metadata.ts    # Validate agent metadata
│
├── commandline/                      # CLI utilities
│   ├── internal/
│   │   └── validation-types.ts
│   ├── audit-service-references.ts   # Audit service references
│   ├── check-validation-rules.ts     # Check validation rules
│   ├── move-reports-batch.ts         # Move reports (batch)
│   ├── move-reports-docs.ts          # Move reports to docs/
│   ├── validate-all-combined.ts      # Validate everything
│   ├── validate-env-cli.ts           # Validate env (CLI)
│   └── validate-env-quick.ts         # Validate env (quick)
│
├── development/                      # Developer experience
│   ├── internal/
│   │   ├── doctor-logic.ts
│   │   ├── doctor-types.ts
│   │   ├── screenshot-logic.ts
│   │   └── screenshot-types.ts
│   ├── capture-screenshots-visual.ts # Capture visual screenshots
│   └── check-environment-doctor.ts   # Check dev environment
│
├── foundation/                       # Foundation & env
│   ├── internal/
│   │   └── env-validator-logic.ts
│   ├── define-env-schemas.ts         # Define env var schemas
│   ├── parse-env-file.ts             # Parse .env files
│   ├── validate-env-foundation.ts    # Validate env (foundation)
│   ├── validate-env-orchestrator.ts  # Validate env (orchestrator)
│   └── validate-env-schema.ts        # Validate env (schema-based)
│
├── infrastructure/                   # Infra & platform
│   ├── internal/
│   │   ├── k8s-logic.ts
│   │   └── k8s-types.ts
│   └── check-k8s-gitops.ts           # Check K8s GitOps compliance
│
├── internal-platform/                # Internal platform utils
│   └── format-fs-paths.ts            # Format filesystem paths
│
├── operations/                       # Operations & maintenance
│   ├── define-cleanup-tasks.ts       # Define cleanup task config
│   ├── check-dependencies-compat.ts  # Check dependency compatibility
│   ├── clean-artifacts-build.ts      # Clean build artifacts
│   ├── clean-repository-files.ts     # Clean repository temp files
│   └── clean-workspace-full.ts       # Full workspace cleanup
│
├── orchestration/                    # Orchestration & deployment
│   ├── deploy-stages-pipeline.ts     # Deploy stages pipeline
│   ├── deploy-vercel-production.ts   # Deploy to Vercel production
│   ├── move-reports-orchestration.ts # Orchestrate report moving
│   └── setup-chile-dropshipping.ts   # Setup Chile dropshipping
│
├── quality-assurance/                # Quality gates
│   ├── internal/
│   │   ├── accessibility-logic.ts
│   │   ├── architecture-logic.ts
│   │   ├── audit-packages-logic.ts
│   │   ├── budget-logic.ts
│   │   ├── coverage-logic.ts
│   │   ├── docs-lint-logic.ts
│   │   ├── dr-drill-logic.ts
│   │   ├── foundation-logic.ts
│   │   ├── sast-logic.ts
│   │   ├── security-triage-logic.ts
│   │   ├── security-workflows-logic.ts
│   │   ├── staff-audit-logic.ts
│   │   └── validate-packages-logic.ts
│   ├── audit-foundation-health.ts    # Audit foundation health
│   ├── audit-packages-structure.ts   # Audit package structure
│   ├── audit-staff-readiness.ts      # Audit staff readiness
│   ├── check-accessibility-budget.ts # Check accessibility budget
│   ├── check-bug-bounty-ops.ts       # Check bug bounty operations
│   ├── check-bundle-budget.ts        # Check bundle size budget
│   ├── check-coverage-critical.ts    # Check critical coverage
│   ├── check-coverage-critical-apps.ts # Check critical app coverage
│   ├── check-dr-evidence.ts          # Check DR evidence
│   ├── check-dr-readiness.ts         # Check DR readiness
│   ├── check-qa-gates.ts             # Check QA gates
│   ├── check-roadmap-m6-closure.ts   # Check M6 roadmap closure
│   ├── check-security-automation.ts  # Check security automation
│   ├── lint-docs-style.ts            # Lint documentation style
│   ├── scan-sast-vulnerabilities.ts  # SAST vulnerability scan
│   ├── triage-security-vulnerabilities.ts # Triage security vulns
│   ├── validate-architecture-shield.ts  # Validate architecture
│   ├── validate-packages-exports.ts   # Validate package exports
│   ├── validate-packages-structure.ts # Validate package structure
│   ├── validate-project-files.ts      # Validate project files
│   └── validate-security-workflows.ts # Validate security workflows
│
├── security-audit/                   # Security auditing
│   ├── internal/
│   │   ├── audit-dependency-logic.ts
│   │   ├── audit-dependency-types.ts
│   │   ├── lodash-upstream-logic.ts
│   │   ├── lodash-upstream-types.ts
│   │   └── secret-types.ts
│   ├── audit-dependencies.ts         # Audit dependencies
│   ├── check-lodash-upstream.ts      # Check lodash upstream
│   ├── define-secret-patterns.ts     # Define secret patterns
│   ├── scan-secrets-exposed.ts       # Scan for exposed secrets
│   └── scan-secrets-patterns.ts      # Scan secrets by pattern
│
├── telemetry/                        # Metrics & DORA
│   ├── internal/
│   │   ├── dora-logic.ts
│   │   └── dora-types.ts
│   ├── calculate-dora-metrics.ts     # Calculate DORA metrics
│   └── calculate-dora-report.ts      # Calculate DORA report
│
└── package.json
```

---

## 🚀 Quick Start

```bash
# Install
pnpm install

# Run all quality checks
pnpm validate-all-combined

# Security audit
pnpm scan-secrets-exposed

# Clean build artifacts
pnpm clean-artifacts-build --dry-run

# Check dev environment
pnpm check-environment-doctor
```

---

## 🛠️ Available Commands

### Quality Assurance

| Command | Script | Description |
|---------|--------|-------------|
| `pnpm audit-packages-structure` | `audit-packages-structure.ts` | Audit package structure |
| `pnpm validate-packages-exports` | `validate-packages-exports.ts` | Validate package exports |
| `pnpm validate-architecture-shield` | `validate-architecture-shield.ts` | Architecture validation |
| `pnpm check-bundle-budget` | `check-bundle-budget.ts` | Bundle size check |
| `pnpm check-accessibility-budget` | `check-accessibility-budget.ts` | Accessibility audit |
| `pnpm lint-docs-style` | `lint-docs-style.ts` | Documentation lint |
| `pnpm scan-sast-vulnerabilities` | `scan-sast-vulnerabilities.ts` | SAST scanning |
| `pnpm triage-security-vulnerabilities` | `triage-security-vulnerabilities.ts` | Vulnerability triage |
| `pnpm audit-staff-readiness` | `audit-staff-readiness.ts` | Staff readiness audit |

### Security

| Command | Script | Description |
|---------|--------|-------------|
| `pnpm scan-secrets-exposed` | `scan-secrets-exposed.ts` | Scan for exposed secrets |
| `pnpm audit-dependencies` | `audit-dependencies.ts` | Dependency audit |
| `pnpm check-lodash-upstream` | `check-lodash-upstream.ts` | Lodash upstream check |
| `pnpm scan-secrets-patterns` | `scan-secrets-patterns.ts` | Pattern-based scan |

### Operations

| Command | Script | Description |
|---------|--------|-------------|
| `pnpm clean-artifacts-build` | `clean-artifacts-build.ts` | Clean build artifacts |
| `pnpm clean-repository-files` | `clean-repository-files.ts` | Clean temp files |
| `pnpm check-dependencies-compat` | `check-dependencies-compat.ts` | Dependency check |
| `pnpm deploy-stages-pipeline` | `deploy-stages-pipeline.ts` | Deploy pipeline |
| `pnpm deploy-vercel-production` | `deploy-vercel-production.ts` | Vercel deploy |

### Development

| Command | Script | Description |
|---------|--------|-------------|
| `pnpm check-environment-doctor` | `check-environment-doctor.ts` | Environment diagnostics |
| `pnpm capture-screenshots-visual` | `capture-screenshots-visual.ts` | Screenshot capture |

### Foundation

| Command | Script | Description |
|---------|--------|-------------|
| `pnpm validate-env-schema` | `validate-env-schema.ts` | Env validation (schema) |
| `pnpm validate-env-quick` | `validate-env-quick.ts` | Env validation (quick) |
| `pnpm validate-all-combined` | `validate-all-combined.ts` | Validate everything |

---

## 🔧 API Reference

### Creating a New Tool

Follow the **Functional Core, Imperative Shell** pattern:

**1. Define types + DI port** (`category/internal/X-types.ts`):
```typescript
import { z } from 'zod';
import type { Result } from '../../libraries/types.js';

export const OptionsSchema = z.object({
  path: z.string(),
  verbose: z.boolean().default(false),
});

export type Options = z.infer<typeof OptionsSchema>;

export interface FsPort {
  readFile(path: string): string;
  exists(path: string): boolean;
}

export interface AnalysisResult extends Result<{ found: number }> {
  details: string[];
}
```

**2. Write pure logic** (`category/internal/X-logic.ts`):
```typescript
import type { FsPort, Options, AnalysisResult } from './X-types.js';
import { success, failure } from '../../libraries/types.js';

export function analyze(fs: FsPort, options: Options): AnalysisResult {
  if (!fs.exists(options.path)) {
    return failure(`Path not found: ${options.path}`);
  }
  const content = fs.readFile(options.path);
  return success({ found: content.split('\n').length, details: [] });
}
```

**3. Create thin CLI shell** (`category/verb-target-purpose.ts`):
```typescript
#!/usr/bin/env tsx
import { readFileSync, existsSync } from 'node:fs';
import { createCli, logger } from '../libraries/create-cli.js';
import { OptionsSchema } from './internal/X-types.js';
import { analyze } from './internal/X-logic.js';
import type { FsPort } from './internal/X-types.js';

const realFs: FsPort = {
  readFile: (p) => readFileSync(p, 'utf-8'),
  exists: (p) => existsSync(p),
};

const cli = createCli({
  name: 'verb-target-purpose',
  version: '1.0.0',
  description: 'What this tool does',
  action: async (options) => {
    const parsed = OptionsSchema.safeParse(options);
    if (!parsed.success) { logger.error(parsed.error.message); process.exit(1); }
    const result = analyze(realFs, parsed.data);
    if (options.json) { logger.json(result); }
    else { logger.success(result.message); }
    if (!result.success) process.exit(1);
    process.exit(0);
  },
});
```

**4. Write tests** (`category/verb-target-purpose.test.ts`):
```typescript
import { describe, it, expect } from 'vitest';
import { analyze } from './internal/X-logic.js';
import type { FsPort } from './internal/X-types.js';

const mockFs: FsPort = {
  readFile: () => 'line1\nline2\nline3',
  exists: () => true,
};

describe('analyze', () => {
  it('should count lines', () => {
    const result = analyze(mockFs, { path: '/test', verbose: false });
    expect(result.data.found).toBe(3);
  });
});
```

### Logger API

```typescript
logger.success('Operation completed');   // ✓ green
logger.error('Error occurred');           // ✗ red
logger.warning('Warning');                // ⚠ yellow
logger.info('Information');               // ℹ blue
logger.step('Starting step');             // › bold
logger.json({ data });                    // JSON output
```

---

## 🧪 Testing

```bash
# Run all tool tests
pnpm test

# With coverage
pnpm test:coverage

# Specific test
pnpm vitest run tools/quality-assurance/audit-packages-structure.test.ts
```

### Testing Rules

- **Every `internal/*-logic.ts` and `lib/*-logic.ts`** must have a `.test.ts`
- **100% mocked I/O** — no real filesystem, network, or process access
- **DI ports** — pass mock implementations to pure functions
- **No `any`** — all mocks fully typed

---

## 📊 Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Validation failure |
| 2 | Configuration error |
| 3 | Network error |

---

## 🔒 Security

- **No secrets in logs** — `maskSecret()` mandatory for all token/key output
- **Zero `any`** — Zod validates all external inputs
- **DI ports** — no direct `fs.*` or `process.env` in core logic
- **Dry-run by default** — destructive operations require `--force`

---

## 📄 License

MIT — See [LICENSE](../LICENSE) for details.
