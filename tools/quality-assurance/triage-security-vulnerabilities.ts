#!/usr/bin/env tsx
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createCli, logger } from '../libraries/create-cli.js';
import type { Vulnerability } from './internal/security-triage-logic.js';
import {
  compileTriageReport,
  prioritizeRemediation,
  trackRemediationStatus,
} from './internal/security-triage-logic.js';

interface Options {
  readonly verbose: boolean;
  readonly dryRun: boolean;
  readonly json: boolean;
}

const ADVISORIES = [
  {
    name: 'GHSA-m4g8-7rc3-c8hc',
    severity: 'critical' as const,
    package: 'express',
    patchedVersion: '4.19.0',
  },
  {
    name: 'CVE-2024-5678',
    severity: 'high' as const,
    package: 'lodash',
    patchedVersion: '4.17.21',
  },
  { name: 'CVE-2024-9012', severity: 'medium' as const, package: 'axios', patchedVersion: '1.6.0' },
] as const;

function parseVersion(ver: string): { major: number; minor: number; patch: number } | null {
  const clean = ver.replace(/^[~^>=]+/g, '');
  const parts = clean.split('.').map((num) => parseInt(num || '0', 10));
  if (parts.length < 3 || parts.some(Number.isNaN)) {
    return null;
  }
  return { major: parts[0], minor: parts[1], patch: parts[2] };
}

function isVulnerable(installedVer: string, patchedVer: string): boolean {
  const installed = parseVersion(installedVer);
  const patched = parseVersion(patchedVer);
  if (!installed || !patched) {
    return false;
  }

  if (installed.major !== patched.major) {
    return installed.major < patched.major;
  }
  if (installed.minor !== patched.minor) {
    return installed.minor < patched.minor;
  }
  return installed.patch < patched.patch;
}

function scanWorkspaceDependencies(cwd: string): Vulnerability[] {
  const foundVulns: Vulnerability[] = [];
  const scannedPaths: string[] = ['package.json'];

  // Add all apps and packages package.json
  const workspaces = ['apps', 'packages'];
  for (const ws of workspaces) {
    const wsDir = path.join(cwd, ws);
    if (!fs.existsSync(wsDir)) {
      continue;
    }

    const children = fs.readdirSync(wsDir);
    for (const child of children) {
      const pkgJsonPath = path.join(wsDir, child, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        scannedPaths.push(path.relative(cwd, pkgJsonPath));
      }
    }
  }

  for (const relPath of scannedPaths) {
    try {
      const fullPath = path.join(cwd, relPath);
      const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.peerDependencies,
      };

      for (const adv of ADVISORIES) {
        const declared = allDeps[adv.package];
        if (declared && typeof declared === 'string') {
          // If version is a workspace import (e.g. workspace:*), skip it
          if (declared.startsWith('workspace:')) {
            continue;
          }

          if (isVulnerable(declared, adv.patchedVersion)) {
            foundVulns.push({
              name: adv.name,
              severity: adv.severity,
              package: `${adv.package} (${relPath})`,
              patchedVersion: adv.patchedVersion,
            });
          }
        }
      }
    } catch {
      // skip unparseable files
    }
  }

  return foundVulns;
}

async function main(options: Options): Promise<void> {
  logger.step('Security Triage Analysis...\n');

  if (options.dryRun) {
    logger.info('Dry run mode - no triage will be performed');
    return;
  }

  const cwd = process.cwd();
  const vulnerabilities = scanWorkspaceDependencies(cwd);
  const prioritized = prioritizeRemediation(vulnerabilities);
  const report = compileTriageReport(vulnerabilities);
  const remediation = trackRemediationStatus(vulnerabilities);

  if (options.json) {
    logger.json({ report, remediation, prioritized });
  } else {
    if (prioritized.length > 0) {
      for (const v of prioritized) {
        const _patch = v.patchedVersion
          ? ` -> patch: ${v.patchedVersion}`
          : ' (no patch available)';
      }
    } else {
    }
    for (const _insight of report.insights) {
    }
  }

  if (report.critical > 0) {
    process.exit(1);
  }
}

const cli = createCli<Options>({
  name: 'security-triage',
  version: '2.0.0',
  description: 'Security vulnerability triage and remediation prioritization',
  action: main,
});

if (
  process.argv[1]?.includes('triage-security-vulnerabilities') ||
  process.argv[1]?.includes('security-triage')
) {
  cli.parse(process.argv);
}
