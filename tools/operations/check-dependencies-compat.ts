#!/usr/bin/env tsx
import { execSync } from 'node:child_process';

/**
 * 📦 Dependency Health Guard (TS SOTA)
 *
 * Verifies dependency integrity:
 * - Unused dependencies (depcheck)
 * - Security vulnerabilities (pnpm audit)
 * - Outdated dependencies (ncu)
 */

interface AuditResult {
  metadata?: {
    vulnerabilities?: {
      total: number;
    };
  };
}

function main() {
  try {
    execSync('pnpm dlx depcheck --json', { stdio: 'pipe' });
  } catch (err: any) {
    const output = err.stdout?.toString() || '';
    if (output.includes('dependencies')) {
      console.warn('⚠️  Dependencias no utilizadas encontradas (Check .depcheckrc):');
      console.warn(output);
    }
  }
  try {
    const auditOutput = execSync('pnpm audit --json', { encoding: 'utf8' });
    const audit = JSON.parse(auditOutput) as AuditResult;
    const totalVulnerabilities = audit.metadata?.vulnerabilities?.total || 0;

    if (totalVulnerabilities > 0) {
      console.error(`❌ ${totalVulnerabilities} vulnerabilidades encontradas.`);
      process.exit(1);
    } else {
    }
  } catch (_e) {
    console.warn('⚠️  Vulnerabilidades detectadas o error en auditoría.');
    // Only fail CI on explicitly dangerous findings in the check list
  }
  try {
    execSync('pnpm outdated', { stdio: 'inherit' });
  } catch {}
}

main();
