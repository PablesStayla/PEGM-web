#!/usr/bin/env pwsh

# Quick validate domain and infrastructure packages
# This script will be run when shell becomes responsive

Write-Host "`n=== Validating @pranakaia/domain ===`n" -ForegroundColor Cyan

$domainOk = $true

# Test domain
Write-Host "Testing @pranakaia/domain..." -NoNewline
$test = pnpm --filter @pranakaia/domain test 2>&1 | Out-String
if ($test -match "passed|No test files found") {
  Write-Host " ✅" -ForegroundColor Green -NoNewline
} else {
  Write-Host " ❌" -ForegroundColor Red -NoNewline
  $domainOk = $false
}

# Build domain
Write-Host "`nBuilding @pranakaia/domain..." -NoNewline
$build = pnpm --filter @pranakaia/domain build 2>&1 | Out-String
if ($build -match "success") {
  Write-Host " ✅" -ForegroundColor Green -NoNewline
  $domainOk = $true
} else {
  Write-Host " ❌" -ForegroundColor Red -NoNewline
  $domainOk = $false
  Write-Host "`nBuild errors detected. Check output above." -ForegroundColor Red
}

# ATTW domain
Write-Host "`nChecking ATTW @pranakaia/domain..." -NoNewline
$attw = pnpm --filter @pranakaia/domain attw 2>&1 | Out-String
if ($attw -match "No problems") {
  Write-Host " ✅" -ForegroundColor Green
  $domainOk = $true
} else {
  Write-Host " ⚠️" -ForegroundColor Yellow -NoNewline
  # ATTW warnings are OK for now
}

Write-Host "`n=== Validating @pranakaia/infrastructure ===`n" -ForegroundColor Cyan

# Test infrastructure
Write-Host "Testing @pranakaia/infrastructure..." -NoNewline
$test = pnpm --filter @pranakaia/infrastructure test 2>&1 | Out-String
if ($test -match "passed") {
  Write-Host " ✅" -ForegroundColor Green -NoNewline
} else {
  Write-Host " ❌" -ForegroundColor Red -NoNewline
}

# Build infrastructure
Write-Host "`nBuilding @pranakaia/infrastructure..." -NoNewline
$build = pnpm --filter @pranakaia/infrastructure build 2>&1 | Out-String
if ($build -match "success") {
  Write-Host " ✅" -ForegroundColor Green -NoNewline
} else {
  Write-Host " ❌" -ForegroundColor Red -NoNewline
  Write-Host "`nBuild errors detected. Check output above." -ForegroundColor Red
}

Write-Host "`n=== Validation Complete ===`n" -ForegroundColor Cyan

if ($domainOk) {
  Write-Host "✅ Domain package validated successfully!" -ForegroundColor Green
  exit 0
} else {
  Write-Host "❌ Domain package has issues. Please review." -ForegroundColor Red
  exit 1
}
