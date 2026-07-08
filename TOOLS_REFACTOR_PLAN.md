# Tools/ Refactor Plan - Enterprise Grade Standards

## Executive Summary

**Audit Date:** 2026-05-06  
**Total Files:** 52  
**Files with Issues:** 31 (60%)  
**Files Meeting Standards:** 21 (40%)  

**Goal:** Elevate all tools to FAANG/Big Tech enterprise standards with strict type safety, comprehensive error handling, professional documentation, and test coverage.

---

## Standards Reference

### 1. File Header Standard (Google/Microsoft)
```typescript
#!/usr/bin/env node
/**
 * Tool Name - Professional Description
 * 
 * Detailed description of what this tool does,
 * why it exists, and how it should be used.
 * 
 * @packageDocumentation
 * @example
 * ```bash
 * pnpm tsx tools/category/tool-name.ts --flag
 * ```
 */
```

### 2. Type Safety Standard (TypeScript Strict)
- No `any` types allowed
- Use branded types for IDs
- Result/Either pattern for error handling
- Zod validation for external inputs
- Explicit return types

### 3. Error Handling Standard (12-Factor Apps)
- All async operations wrapped in try/catch
- Error messages are actionable and specific
- Graceful degradation on failures
- Logging with appropriate severity levels
- Recovery procedures documented

### 4. Testing Standard (Vitest)
- Co-located `.test.ts` files
- Minimum 3 test cases per tool
- Mock external dependencies
- Test success and failure paths
- Coverage threshold: 80%+

### 5. Naming Convention (Microsoft PowerShell Verb-Noun)
- Use full words (no abbreviations except std)
- Format: `action-target-purpose.ts`
- Examples: `validate-agents-metadata.ts`, `audit-security-secrets.ts`

---

## Phase 1: Critical Fixes (Priority: HIGH)

### 1.1 Files Missing Shebang (24 files)
**Impact:** Cannot execute as CLI tools  
**Files:**
- `tools/quality-assurance/security-triage.ts`
- `tools/quality-assurance/security-automation-check.ts`
- `tools/quality-assurance/dr-drill-evidence-check.ts`
- `tools/quality-assurance/sast-scanner.ts`
- `tools/quality-assurance/bug-bounty-operational-check.ts`
- `tools/quality-assurance/critical-coverage-check.ts`
- `tools/quality-assurance/roadmap-m6-closure-check.ts`
- `tools/quality-assurance/apps-critical-coverage-check.ts`
- `tools/infrastructure/k8s-gitops-check.ts`
- `tools/development/take-screenshots.ts`
- `tools/security-audit/lodash-upstream-check.ts`
- `tools/quality-assurance/architecture-shield.ts`
- `tools/libraries/create-cli.ts`
- `tools/quality-assurance/bundle-budget.ts`
- `tools/telemetry/dora-calculator.ts`
- `tools/security-audit/audit-dependencies.ts`
- `tools/quality-assurance/lib/types.ts`
- `tools/quality-assurance/lib/utils.ts`
- `tools/libraries/types.ts`
- `tools/internal-platform/fs-utils.ts`
- `tools/quality-assurance/validate-packages-exports.ts`
- `tools/automation/agent-level-adder.ts`

**Action:** Add `#!/usr/bin/env node` header to all executable tools

### 1.2 Files Missing JSDoc (15 files)
**Impact:** No documentation, poor IDE support  
**Action:** Add comprehensive JSDoc with:
- Description
- @packageDocumentation
- @example
- @throws
- @returns

### 1.3 Files Missing Error Handling (14 files)
**Impact:** Silent failures, poor reliability  
**Action:** Wrap in try/catch, return Result<T> pattern

---

## Phase 2: Type Safety Improvements (Priority: MEDIUM)

### 2.1 Add Explicit Types (6 files)
**Files:**
- `tools/development/take-screenshots.ts`
- `tools/telemetry/dora-calculator.ts`
- `tools/commandline/audit-service-update.ts`
- `tools/auditing/service-updater.ts`

**Action:** Add explicit type annotations for all functions

### 2.2 Remove `any` Types (audit required)
**Action:** Replace with unknown or proper types

---

## Phase 3: Test Coverage Gaps (Priority: MEDIUM)

### 3.1 Missing Test Files (6 source files)
**Files without co-located tests:**
- `tools/orchestration/reports-mover.ts` → needs `reports-mover.test.ts`
- `tools/orchestration/chile-dropshipping-setup.ts` → needs test
- `tools/quality-assurance/lib/types.ts` → no test needed (types only)
- `tools/quality-assurance/lib/utils.ts` → needs `utils.test.ts`

**Action:** Create test files with 3+ test cases each

---

## Phase 4: Naming Standardization (Priority: LOW)

### 4.1 Rename for Clarity
Current → Proposed:
- `tools/commandline/env-validate.ts` → `tools/commandline/validate-environment.ts`
- `tools/foundation/env-validate.ts` → `tools/foundation/validate-environment.ts`
- `tools/foundation/env-validator.ts` → `tools/foundation/environment-validator.ts`
- `tools/quality-assurance/bundle-budget.ts` → `tools/quality-assurance/check-bundle-budget.ts`
- `tools/quality-assurance/docs-lint.ts` → `tools/quality-assurance/lint-documents.ts`
- `tools/quality-assurance/sast-scanner.ts` → `tools/quality-assurance/scan-security.ts`

**Action:** Rename files for clarity, update package.json scripts

---

## Phase 5: Documentation (Priority: HIGH)

### 5.1 Add README per Directory
Each tools subdirectory needs:
- Purpose statement
- Available tools list
- Usage examples
- Configuration options

### 5.2 Add Inline Comments
- Complex logic explained
- Edge cases documented
- Performance considerations noted

---

## Execution Checklist

### Phase 1: Critical (Week 1)
- [ ] Add shebang to 22 files
- [ ] Add JSDoc to 15 files
- [ ] Add error handling to 14 files
- [ ] Create missing test files (6 files)

### Phase 2: Type Safety (Week 2)
- [ ] Add explicit types to 6 files
- [ ] Audit and remove `any` types
- [ ] Add Zod schemas for validation

### Phase 3: Test Coverage (Week 3)
- [ ] Create test files for remaining tools
- [ ] Ensure 3+ test cases per tool
- [ ] Reach 90%+ coverage

### Phase 4: Naming (Week 4)
- [ ] Rename files for clarity
- [ ] Update package.json scripts
- [ ] Update documentation

### Phase 5: Documentation (Week 4)
- [ ] Add README to each directory
- [ ] Add inline comments
- [ ] Create usage examples

---

## Success Metrics

| Metric | Before | Target | After |
|--------|--------|--------|-------|
| Files with shebang | 28/52 (54%) | 52/52 (100%) | - |
| Files with JSDoc | 37/52 (71%) | 52/52 (100%) | - |
| Files with error handling | 38/52 (73%) | 52/52 (100%) | - |
| Test coverage | 46/52 (88%) | 52/52 (100%) | - |
| Type safety issues | 6 files | 0 files | - |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes | Scripts fail | Update package.json before commit |
| Test failures | CI blocked | Run tests after each file |
| Type errors | Build fails | Strict type checking |
| Missing imports | Runtime errors | Verify all imports |

---

## Rollback Plan

If issues arise:
1. `git stash` current changes
2. `git checkout main~1` to revert
3. Run `pnpm test:unit` to verify
4. Re-apply fixes incrementally

---

## Approval Required

Before proceeding:
- [ ] Review audit report (TOOLS_AUDIT.md)
- [ ] Approve execution plan
- [ ] Confirm backup exists
- [ ] Schedule maintenance window

**Status:** ⏳ Pending approval to execute
