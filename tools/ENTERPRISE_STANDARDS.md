# Enterprise Tooling Standards
> **PranaKaia Engineering Standards**
>
> Version: 3.0.0 (Functional Core, Imperative Shell)
>
> Based on practices from Google, Stripe, Shopify, and Microsoft

## 🎯 Overview

This document defines the enterprise-grade standards for all tooling in the PranaKaia monorepo.
Every script follows the **Functional Core, Imperative Shell** architecture with enforced
dependency direction and professional naming.

## 🏛️ The 5 Enterprise Pillars

| # | Pillar | Rule |
|---|--------|------|
| 1 | **Naming & Shebang** | `verb-target-purpose.ts` · Executables: `#!/usr/bin/env tsx` · Libs: no shebang |
| 2 | **Functional Core / Imperative Shell** | Pure functions in `internal/` or `lib/` · I/O only in CLI shell |
| 3 | **Type-Safety & Zod** | Zero `any` · Zod for all CLI inputs, env vars, JSON reads |
| 4 | **≤150 lines · Complexity ≤3** | No file >150 lines · No function >complexity 3 · No nested if/else |
| 5 | **Testing with Vitest** | Every `internal/` and `lib/` function has a `.test.ts` with mocked I/O |

---

## 📐 Pillar 1: Naming & Shebang

### Verb-Target-Purpose Convention

Every executable script follows `verb-target-purpose.ts`:

```
verb-target-purpose.ts
 │     │      │
 │     │      └─ Specific variant (optional)
 │     └──────── Domain/object being acted upon
 └────────────── Action: validate | check | audit | scan | clean | deploy | setup | lint | move | calculate | triage | capture | assign
```

**Examples:**

| ❌ Bad | ✅ Good | Why |
|--------|---------|-----|
| `doctor.ts` | `check-environment-doctor.ts` | Missing verb |
| `take-screenshots.ts` | `capture-screenshots-visual.ts` | Vague verb |
| `setup-admin.ts` | `setup-admin-credentials.ts` | Missing purpose |
| `clean.ts` | `clean-workspace-full.ts` | Too vague |
| `accessibility-budget.ts` | `check-accessibility-budget.ts` | Noun-first |
| `bundle-budget.ts` | `check-bundle-budget.ts` | Noun-first |

### Shebang Rules

```typescript
// ✅ Executable CLI script — MUST have shebang
#!/usr/bin/env tsx

// ❌ Library file — MUST NOT have shebang
// (no shebang line)
```

---

## 📐 Pillar 2: Functional Core / Imperative Shell

### Architecture (Google-style dependency direction)

```
┌──────────────────────────────────────────────────────┐
│                    CLI Shell                         │
│  (reads argv, env, calls core, prints, process.exit) │
│  category/verb-target-purpose.ts                     │
└────────────────┬─────────────────────────────────────┘
                 │ imports from ↓ (NEVER upward)
┌────────────────▼─────────────────────────────────────┐
│               Functional Core                         │
│  (pure functions, no I/O, no console.log)            │
│                                                       │
│  ┌─ category/internal/*-logic.ts  (category-private) │
│  │  category/internal/*-types.ts                      │
│  │                                                    │
│  └─ tools/lib/*-logic.ts         (shared kernel)     │
│     tools/lib/*-types.ts                              │
│     tools/lib/*-data.ts                               │
└──────────────────────────────────────────────────────┘
```

### Dependency Rules (ENFORCED)

1. **Shell → Core**: ✅ CLI scripts import from `internal/` and `lib/`
2. **Core → Core**: ✅ `internal/` files import from `lib/`
3. **Core → Shell**: ❌ **FORBIDDEN** — `internal/` and `lib/` CANNOT import CLI shells
4. **Category → Category**: ❌ **FORBIDDEN** — categories CANNOT import each other's `internal/`
5. **lib → category**: ❌ **FORBIDDEN** — `lib/` is the shared kernel, it depends on nothing

### File Templates

**Imperative Shell** (`category/verb-target-purpose.ts`):
```typescript
#!/usr/bin/env tsx
import { createCli, logger } from '../libraries/create-cli.js';
import { OptionsSchema } from './internal/options-types.js';
import { coreFunction } from './internal/core-logic.js';
import type { FsPort } from './internal/core-types.js';

const realFs: FsPort = {
  read: (p) => fs.readFileSync(p, 'utf-8'),
  write: (p, c) => fs.writeFileSync(p, c),
};

const cli = createCli({
  name: 'verb-target-purpose',
  version: '1.0.0',
  description: 'What this tool does',
  action: async (options) => {
    const parsed = OptionsSchema.safeParse(options);
    if (!parsed.success) { logger.error(parsed.error.message); process.exit(1); }
    const result = coreFunction(realFs, parsed.data);
    if (options.json) { logger.json(result); }
    else { logger.success(result.message); }
    if (!result.ok) process.exit(1);
    process.exit(0);
  },
});
```

**Functional Core** (`category/internal/core-logic.ts`):
```typescript
// NO shebang. NO console.log. NO process.env. NO fs.*
// Pure functions only. All I/O via dependency injection ports.

export interface FsPort {
  read(path: string): string;
  write(path: string, content: string): void;
}

export function coreFunction(fs: FsPort, input: CoreInput): CoreResult {
  // Pure logic — same input always produces same output
  const data = fs.read(input.path);
  return { ok: true, message: `Processed ${data.length} chars` };
}
```

---

## 📐 Pillar 3: Type-Safety & Zod

### Zero `any` Policy

```typescript
// ❌ NEVER
const data: any = JSON.parse(content);

// ✅ ALWAYS
const DataSchema = z.object({ name: z.string(), count: z.number() });
const data = DataSchema.parse(JSON.parse(content));
```

### DI Port Pattern (for testability)

Every external side-effect is abstracted behind a port interface:

```typescript
export interface FsPort {
  readFile(path: string): string;
  writeFile(path: string, content: string): void;
  exists(path: string): boolean;
  glob(pattern: string, cwd: string): string[];
}

export interface ShellPort {
  exec(command: string): { stdout: string; exitCode: number };
  cwd(): string;
}

export interface EnvPort {
  get(key: string): string | undefined;
}
```

### Secret Masking

```typescript
// ❌ NEVER log raw secrets
console.log(`API key: ${process.env.API_KEY}`);

// ✅ ALWAYS mask
function maskSecret(value: string): string {
  return value.slice(0, 4) + '****' + value.slice(-4);
}
```

---

## 📐 Pillar 4: ≤150 Lines · Complexity ≤3

### File Size Limit

- **Max 150 lines** per file (non-test)
- **Split strategy**: Extract types → `*-types.ts`, data → `*-data.ts`, logic → `*-logic.ts`
- Shell scripts should be **≤80 lines** (thin shell)

### Cyclomatic Complexity

- **Max complexity 3** per function
- **No nested if/else** — use early returns, guard clauses, and lookup tables
- **No switch** — use `Record<string, Handler>` pattern

```typescript
// ❌ Nested if/else
function validate(x: X) {
  if (x.a) {
    if (x.b) { return 'ab'; }
    else { return 'a'; }
  } else {
    return 'none';
  }
}

// ✅ Flat guards
function validate(x: X): string {
  if (!x.a) return 'none';
  if (!x.b) return 'a';
  return 'ab';
}
```

---

## 📐 Pillar 5: Testing with Vitest

### Test Requirements

- **Every `internal/*-logic.ts` and `lib/*-logic.ts`** must have a corresponding `.test.ts`
- **100% mocked I/O** — no real filesystem, network, or process access
- **Dependency injection** — pass mock ports to pure functions

### Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { coreFunction } from './core-logic.js';
import type { FsPort } from './core-types.js';

const mockFs: FsPort = {
  read: () => 'mock content',
  write: () => {},
  exists: () => true,
  glob: () => ['file1.ts'],
};

describe('coreFunction', () => {
  it('should process valid input', () => {
    const result = coreFunction(mockFs, { path: '/test' });
    expect(result.ok).toBe(true);
  });

  it('should handle missing file', () => {
    const fs: FsPort = { ...mockFs, exists: () => false };
    const result = coreFunction(fs, { path: '/missing' });
    expect(result.ok).toBe(false);
  });
});
```

### Test Location

| Core file | Test file |
|-----------|-----------|
| `category/internal/X-logic.ts` | `category/X-logic.test.ts` (co-located) |
| `tools/lib/X-logic.ts` | `tools/tests/X-logic.test.ts` (centralized) |

---

## 📁 Directory Structure

```
tools/
├── lib/                              # Shared Kernel (cross-category pure functions)
│   ├── X-logic.ts                   # Pure logic (NO shebang, NO I/O)
│   ├── X-types.ts                   # Zod schemas + DI ports + types
│   └── X-data.ts                    # Pure data constants
│
├── libraries/                        # Framework (create-cli, shared types)
│   ├── create-cli.ts                # CLI builder (commander + kleur)
│   └── types.ts                     # Result<T,E>, success(), failure()
│
├── tests/                            # Centralized tests for lib/ functions
│   └── X-logic.test.ts
│
├── category/                         # Each domain has its own folder
│   ├── internal/                     # Private functional core (enforced boundary)
│   │   ├── X-logic.ts               # Category-specific pure functions
│   │   └── X-types.ts               # Category-specific types + Zod + ports
│   ├── verb-target-purpose.ts       # Imperative Shell (CLI executable)
│   └── verb-target-purpose.test.ts  # Tests (co-located with shell)
│
└── package.json
```

### Dependency Direction Diagram

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

## 📊 Quality Gates

### Pre-commit
```bash
pnpm lint && pnpm typecheck && pnpm test:unit
```

### Pre-merge
```bash
pnpm validate-all-combined
pnpm scan-secrets-exposed
pnpm audit-packages-structure
```

### Pre-release
```bash
pnpm audit-staff-readiness --strict
pnpm check-dr-readiness
pnpm check-environment-doctor
```

---

## 🔒 Security

| Rule | Details |
|------|---------|
| No `any` | Zod validates everything |
| Secret masking | `maskSecret()` in all log output |
| DI ports | No direct `fs.*` or `process.env` in core |
| Exit codes | 0=success, 1=failure, 2=config error, 3=network |

---

## 📝 Changelog

### [3.0.0] - 2026-05-09
- **BREAKING**: Adopted Functional Core / Imperative Shell architecture
- **BREAKING**: All scripts renamed to `verb-target-purpose` convention
- **BREAKING**: Logic/types moved to `category/internal/` with enforced boundaries
- Added DI port pattern (FsPort, ShellPort, EnvPort)
- Added centralized `/lib/` shared kernel
- Added Zod validation for all CLI inputs
- Added 100% mocked testing requirement
- Enforced ≤150 lines and complexity ≤3

### [2.0.0] - 2026-05-05
- Initial enterprise standards

---

**Last Updated**: May 9, 2026
**Version**: 3.0.0
**Maintained By**: PranaKaia Engineering Team
