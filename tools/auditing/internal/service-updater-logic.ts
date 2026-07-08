import { readFileSync, writeFileSync } from 'node:fs';
import type { Result } from '../../libraries/types.js';
import { failure, success } from '../../libraries/types.js';
import type { RewriteResult, RewriteSummary } from './service-updater-types.js';
import { RENAMES } from './service-updater-types.js';

export function hasAuditServiceRef(content: string): boolean {
  return content.includes('AuditService');
}

export function applyRenames(content: string): string {
  let result = content;
  for (const rename of RENAMES) {
    result = result.replace(rename.from, rename.to);
  }
  return result;
}

export function rewriteFileContent(content: string): Result<string, string> {
  if (!hasAuditServiceRef(content)) {
    return failure('No AuditService references found');
  }
  const rewritten = applyRenames(content);
  if (rewritten === content) {
    return failure('No changes after rewrite');
  }
  return success(rewritten);
}

export function processFile(file: string, dryRun: boolean): RewriteResult {
  try {
    const content = readFileSync(file, 'utf-8');
    const result = rewriteFileContent(content);

    if (!result.success) {
      return { file, changed: false };
    }

    if (!dryRun) {
      writeFileSync(file, result.data);
    }
    return { file, changed: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { file, changed: false, error: message };
  }
}

export function processFileList(files: readonly string[], dryRun: boolean): RewriteSummary {
  const results = files.map((file) => processFile(file, dryRun));
  const updated = results.filter((r) => r.changed).length;
  const errors = results.filter((r) => r.error).length;
  return { updated, errors, total: results.length, results };
}
