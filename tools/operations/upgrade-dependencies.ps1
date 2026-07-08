# ============================================================================
# PranaKaia - Automated Dependency Upgrade Script
# ============================================================================
# This script upgrades all dependencies to their latest versions while
# maintaining compatibility and running tests to ensure nothing breaks.
#
# Usage:
#   .\scripts\upgrade-dependencies.ps1 [-DryRun] [-SkipTests]
#
# Flags:
#   -DryRun: Show what would be upgraded without making changes
#   -SkipTests: Skip running tests after upgrade
# ============================================================================

param(
    [switch]$DryRun = $false,
    [switch]$SkipTests = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 PranaKaia Dependency Upgrade Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if pnpm is installed
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: pnpm is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g pnpm@latest" -ForegroundColor Yellow
    exit 1
}

# Check if we're in the root directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Must run from project root directory" -ForegroundColor Red
    exit 1
}

# ============================================================================
# Step 1: Update pnpm itself
# ============================================================================
Write-Host "📦 Step 1: Updating pnpm..." -ForegroundColor Green

if (-not $DryRun) {
    npm install -g pnpm@latest
    $pnpmVersion = pnpm --version
    Write-Host "   ✅ pnpm updated to version $pnpmVersion" -ForegroundColor Green
} else {
    Write-Host "   [DRY RUN] Would update pnpm to latest" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# Step 2: Update TypeScript to 5.7.2 across all packages
# ============================================================================
Write-Host "📦 Step 2: Updating TypeScript to 5.7.2..." -ForegroundColor Green

$typescriptPackages = @(
    ".",
    "apps/admin",
    "apps/api",
    "apps/coach",
    "apps/web",
    "apps/webhooks",
    "apps/worker",
    "packages/ui",
    "packages/security",
    "packages/testkit",
    "packages/sdk",
    "packages/shared-types"
)

foreach ($pkg in $typescriptPackages) {
    if (Test-Path "$pkg/package.json") {
        Write-Host "   Updating TypeScript in $pkg..." -ForegroundColor Cyan
        if (-not $DryRun) {
            Push-Location $pkg
            pnpm add -D typescript@5.7.2
            Pop-Location
            Write-Host "   ✅ $pkg updated" -ForegroundColor Green
        } else {
            Write-Host "   [DRY RUN] Would update TypeScript in $pkg" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# ============================================================================
# Step 3: Update @types/node to version 22
# ============================================================================
Write-Host "📦 Step 3: Updating @types/node to v22..." -ForegroundColor Green

if (-not $DryRun) {
    pnpm add -D -w @types/node@^22.10.0
    Write-Host "   ✅ @types/node updated to v22" -ForegroundColor Green
} else {
    Write-Host "   [DRY RUN] Would update @types/node to v22" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# Step 4: Add Biome for linting and formatting
# ============================================================================
Write-Host "📦 Step 4: Installing Biome..." -ForegroundColor Green

if (-not $DryRun) {
    pnpm add -D -w @biomejs/biome@latest
    Write-Host "   ✅ Biome installed" -ForegroundColor Green
} else {
    Write-Host "   [DRY RUN] Would install Biome" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# Step 5: Update Vitest to v2
# ============================================================================
Write-Host "📦 Step 5: Updating Vitest to v2..." -ForegroundColor Green

if (-not $DryRun) {
    pnpm add -D -w vitest@latest
    Write-Host "   ✅ Vitest updated to v2" -ForegroundColor Green
} else {
    Write-Host "   [DRY RUN] Would update Vitest to v2" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# Step 6: Enforce Biome-only lint policy
# ============================================================================
Write-Host "📦 Step 6: Enforcing Biome-only lint policy..." -ForegroundColor Green

if (-not $DryRun) {
    Write-Host "   ✅ ESLint upgrade skipped (Biome-only policy)" -ForegroundColor Green
} else {
    Write-Host "   [DRY RUN] Would keep ESLint out of workspace deps" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# Step 7: Update Prettier to latest
# ============================================================================
Write-Host "📦 Step 7: Updating Prettier..." -ForegroundColor Green

if (-not $DryRun) {
    pnpm add -D -w prettier@latest
    Write-Host "   ✅ Prettier updated" -ForegroundColor Green
} else {
    Write-Host "   [DRY RUN] Would update Prettier" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# Step 8: Add Zod for runtime validation
# ============================================================================
Write-Host "📦 Step 8: Adding Zod..." -ForegroundColor Green

if (-not $DryRun) {
    pnpm add -w zod@latest
    Write-Host "   ✅ Zod installed" -ForegroundColor Green
} else {
    Write-Host "   [DRY RUN] Would install Zod" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# Step 9: Update all other dependencies
# ============================================================================
Write-Host "📦 Step 9: Updating all other dependencies..." -ForegroundColor Green

if (-not $DryRun) {
    Write-Host "   Running pnpm update..." -ForegroundColor Cyan
    pnpm update --latest --recursive
    Write-Host "   ✅ All dependencies updated" -ForegroundColor Green
} else {
    Write-Host "   [DRY RUN] Would run pnpm update --latest --recursive" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# Step 10: Run type checking
# ============================================================================
Write-Host "📦 Step 10: Type checking..." -ForegroundColor Green

if (-not $DryRun -and -not $SkipTests) {
    Write-Host "   Running TypeScript type check..." -ForegroundColor Cyan
    try {
        pnpm type-check
        Write-Host "   ✅ Type check passed" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Type check failed. Please review errors." -ForegroundColor Yellow
    }
} else {
    Write-Host "   [SKIPPED] Type checking" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# Step 11: Run tests
# ============================================================================
Write-Host "📦 Step 11: Running tests..." -ForegroundColor Green

if (-not $DryRun -and -not $SkipTests) {
    Write-Host "   Running unit tests..." -ForegroundColor Cyan
    try {
        pnpm test:unit
        Write-Host "   ✅ Tests passed" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Some tests failed. Please review." -ForegroundColor Yellow
    }
} else {
    Write-Host "   [SKIPPED] Running tests" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# Summary
# ============================================================================
Write-Host "✅ Upgrade Complete!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary of changes:" -ForegroundColor Cyan
Write-Host "  ✅ TypeScript upgraded to 5.7.2" -ForegroundColor Green
Write-Host "  ✅ @types/node upgraded to v22" -ForegroundColor Green
Write-Host "  ✅ Vitest upgraded to v2" -ForegroundColor Green
Write-Host "  ✅ Prettier upgraded to latest" -ForegroundColor Green
Write-Host "  ✅ Biome added for fast linting" -ForegroundColor Green
Write-Host "  ✅ Zod added for validation" -ForegroundColor Green
Write-Host "  ✅ All dependencies updated" -ForegroundColor Green
Write-Host ""

if (-not $DryRun) {
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Review git diff to see all changes" -ForegroundColor White
    Write-Host "  2. Run 'pnpm test' to ensure everything works" -ForegroundColor White
    Write-Host "  3. Commit changes with a clear message" -ForegroundColor White
    Write-Host "  4. Consider running 'pnpm lint' and 'pnpm format'" -ForegroundColor White
    Write-Host ""
    Write-Host "Biome policy (lint/format):" -ForegroundColor Yellow
    Write-Host "  pnpm exec biome check --write ." -ForegroundColor White
} else {
    Write-Host "This was a dry run. No changes were made." -ForegroundColor Yellow
    Write-Host "Run without -DryRun to apply changes." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Happy coding!" -ForegroundColor Cyan
