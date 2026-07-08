#!/usr/bin/env pwsh

# Validate All Packages Script
# Validates all packages in the monorepo for enterprise standards

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PranaKaia Monorepo Package Validator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$packages = @(
  "domain",
  "infrastructure",
  "identity",
  "communications",
  "config",
  "testkit",
  "ui"
)

$results = @()

foreach ($pkg in $packages) {
  Write-Host "Validating @pranakaia/$pkg..." -ForegroundColor Yellow
  
  $result = [PSCustomObject]@{
    Package = $pkg
    Test = "❌"
    TypeCheck = "❌"
    Build = "❌"
    ATTW = "❌"
    Publint = "❌"
    Status = "Failed"
  }
  
  # Test
  Write-Host "  Testing..." -NoNewline
  $testResult = pnpm --filter "@pranakaia/$pkg" test 2>&1 | Out-String
  if ($testResult -match "passed|No test files found") {
    $result.Test = "✅"
    Write-Host " ✅" -NoNewline -ForegroundColor Green
  } else {
    Write-Host " ❌" -NoNewline -ForegroundColor Red
  }
  
  # Type Check
  Write-Host "  Type Check..." -NoNewline
  $typeResult = pnpm --filter "@pranakaia/$pkg" type-check 2>&1 | Out-String
  if ($typeResult -match "0 errors|success") {
    $result.TypeCheck = "✅"
    Write-Host " ✅" -NoNewline -ForegroundColor Green
  } else {
    Write-Host " ❌" -NoNewline -ForegroundColor Red
  }
  
  # Build
  Write-Host "  Build..." -NoNewline
  $buildResult = pnpm --filter "@pranakaia/$pkg" build 2>&1 | Out-String
  if ($buildResult -match "success|Build success") {
    $result.Build = "✅"
    Write-Host " ✅" -NoNewline -ForegroundColor Green
  } else {
    Write-Host " ❌" -NoNewline -ForegroundColor Red
  }
  
  # ATTW
  Write-Host "  ATTW..." -NoNewline
  $attwResult = pnpm --filter "@pranakaia/$pkg" attw 2>&1 | Out-String
  if ($attwResult -match "No problems|All good") {
    $result.ATTW = "✅"
    Write-Host " ✅" -NoNewline -ForegroundColor Green
  } else {
    Write-Host " ❌" -NoNewline -ForegroundColor Red
  }
  
  # Publint
  Write-Host "  Publint..." -NoNewline
  $publintResult = pnpm --filter "@pranakaia/$pkg" publint 2>&1 | Out-String
  if ($publintResult -match "All good|no problems") {
    $result.Publint = "✅"
    Write-Host " ✅" -NoNewline -ForegroundColor Green
  } else {
    Write-Host " ❌" -NoNewline -ForegroundColor Red
  }
  
  # Status
  $passCount = ($result.Test, $result.TypeCheck, $result.Build, $result.ATTW, $result.Publint | Where-Object { $_ -eq "✅" }).Count
  if ($passCount -eq 5) {
    $result.Status = "✅ PASS"
  } elseif ($passCount -ge 3) {
    $result.Status = "⚠️ PARTIAL"
  } else {
    $result.Status = "❌ FAIL"
  }
  
  $results += $result
  Write-Host ""
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$results | Format-Table -AutoSize

$passed = ($results | Where-Object { $_.Status -eq "✅ PASS" }).Count
$total = $results.Count

Write-Host ""
Write-Host "Passed: $passed/$total" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

if ($passed -ne $total) {
  Write-Host "Some packages failed validation. Review the results above." -ForegroundColor Red
  exit 1
} else {
  Write-Host "All packages validated successfully!" -ForegroundColor Green
  exit 0
}
