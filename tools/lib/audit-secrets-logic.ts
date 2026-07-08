/**
 * Audit Secrets — Functional Core
 *
 * Pure functions for secrets scanning.
 * All I/O injected via SecretScanPort.
 */
import type { ScanResult, SecretFinding, SecretScanPort } from './audit-secrets-types.js';
import { sortBySeverity } from './secret-patterns-logic.js';

/** Scan a single file for secrets */
export async function scanFile(port: SecretScanPort, filePath: string): Promise<SecretFinding[]> {
  try {
    const content = await port.readFile(filePath);
    return port.scanContent(content, filePath);
  } catch {
    return [];
  }
}

/** Recursively scan a directory */
export async function scanDirectory(port: SecretScanPort, dirPath: string): Promise<ScanResult> {
  const findings: SecretFinding[] = [];
  let filesScanned = 0;

  try {
    const entries = await port.readDir(dirPath);
    for (const entry of entries) {
      const fullPath = `${dirPath}/${entry}`;
      if (await port.isDirectory(fullPath)) {
        if (!port.shouldIgnore(fullPath)) {
          const result = await scanDirectory(port, fullPath);
          findings.push(...result.findings);
          filesScanned += result.filesScanned;
        }
      } else if (!port.shouldIgnore(fullPath)) {
        filesScanned++;
        findings.push(...(await scanFile(port, fullPath)));
      }
    }
  } catch {
    /* ignore read errors */
  }

  return { findings, filesScanned };
}

/** Get critical/high findings count */
export function countCriticalOrHigh(findings: readonly SecretFinding[]): number {
  return findings.filter((f) => f.severity === 'critical' || f.severity === 'high').length;
}

/** Prepare sorted findings for output */
export function prepareResults(findings: readonly SecretFinding[]): SecretFinding[] {
  return sortBySeverity([...findings]);
}
