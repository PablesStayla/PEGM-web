import type { Result } from '../libraries/types.js';

export interface QaCheckResult {
  readonly name: string;
  readonly passed: boolean;
  readonly detail: string;
}

export interface QaCheckReport {
  readonly total: number;
  readonly passed: number;
  readonly failed: number;
  readonly results: readonly QaCheckResult[];
}

export type FileExistenceChecker = (filePath: string) => boolean;
export type ContentReader = (filePath: string) => Result<string, string>;

export function checkFileExists(filePath: string, fileExists: FileExistenceChecker): QaCheckResult {
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
  fileExists: FileExistenceChecker,
  readContent: ContentReader,
): QaCheckResult {
  if (!fileExists(filePath)) {
    return { name: checkName, passed: false, detail: 'file missing' };
  }

  const content = readContent(filePath);
  if (!content.success) {
    return { name: checkName, passed: false, detail: content.error };
  }

  const ok = content.data.includes(expected);
  return {
    name: checkName,
    passed: ok,
    detail: ok ? `contains ${expected}` : `missing ${expected}`,
  };
}

export function checkContentContains(
  content: string,
  token: string,
  checkName: string,
): QaCheckResult {
  const ok = content.includes(token);
  return {
    name: checkName,
    passed: ok,
    detail: ok ? `contains ${token}` : `missing ${token}`,
  };
}

export function compileQaReport(results: readonly QaCheckResult[]): QaCheckReport {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  return { total: results.length, passed, failed, results };
}

export function formatQaReport(report: QaCheckReport, label: string): string {
  const lines = report.results.map((r) => {
    const mark = r.passed ? 'OK' : 'FAIL';
    return `${mark} ${r.name} (${r.detail})`;
  });

  if (report.failed > 0) {
    lines.push('', `${label} check failed.`);
  } else {
    lines.push('', `${label} check passed.`);
  }

  return lines.join('\n');
}
