import type { K8sCheckReport, K8sCheckResult } from './k8s-types.js';
import { CONTENT_CHECKS, REQUIRED_K8S_FILES } from './k8s-types.js';

export type FileChecker = (path: string) => boolean;
export type FileReader = (path: string) => string | null;

export function checkFileExists(filePath: string, fileExists: FileChecker): K8sCheckResult {
  const ok = fileExists(filePath);
  return {
    name: `file:${filePath}`,
    passed: ok,
    detail: ok ? 'present' : 'missing',
  };
}

export function checkFileContains(
  filePath: string,
  expected: string,
  checkName: string,
  fileExists: FileChecker,
  readFile: FileReader,
): K8sCheckResult {
  if (!fileExists(filePath)) {
    return { name: checkName, passed: false, detail: 'file missing' };
  }

  const content = readFile(filePath);
  if (content === null) {
    return { name: checkName, passed: false, detail: 'read error' };
  }

  const ok = content.includes(expected);
  return {
    name: checkName,
    passed: ok,
    detail: ok ? `contains ${expected}` : `missing ${expected}`,
  };
}

export function runAllChecks(fileExists: FileChecker, readFile: FileReader): K8sCheckResult[] {
  const results: K8sCheckResult[] = REQUIRED_K8S_FILES.map((filePath) =>
    checkFileExists(filePath, fileExists),
  );

  for (const check of CONTENT_CHECKS) {
    results.push(checkFileContains(check.path, check.expected, check.name, fileExists, readFile));
  }

  return results;
}

export function compileK8sReport(results: readonly K8sCheckResult[]): K8sCheckReport {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  return { total: results.length, passed, failed, results };
}

export function formatK8sReport(report: K8sCheckReport): string {
  const lines = report.results.map((r) => {
    const mark = r.passed ? 'OK' : 'FAIL';
    return `${mark} ${r.name} (${r.detail})`;
  });

  if (report.failed > 0) {
    lines.push('', 'K8s/GitOps baseline check failed.');
  } else {
    lines.push('', 'K8s/GitOps baseline check passed.');
  }

  return lines.join('\n');
}
