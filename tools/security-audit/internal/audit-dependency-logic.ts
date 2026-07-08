import type { Result } from '../../libraries/types.js';
import { failure, success } from '../../libraries/types.js';
import type { Advisory, AuditResult } from './audit-dependency-types.js';
import { AuditReportSchema, TEMPORARY_ALLOWLIST } from './audit-dependency-types.js';

export function extractJson(raw: string): Result<string, string> {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return failure('Could not extract JSON from audit output');
  }
  return success(raw.slice(start, end + 1));
}

export function parseAuditReport(raw: string): Result<AuditResult, string> {
  const jsonResult = extractJson(raw);
  if (!jsonResult.success) {
    return jsonResult;
  }

  let json: unknown;
  try {
    json = JSON.parse(jsonResult.data);
  } catch {
    return failure('Invalid JSON in audit output');
  }

  const parsed = AuditReportSchema.safeParse(json);
  if (!parsed.success) {
    return failure(`Invalid audit report: ${parsed.error.message}`);
  }

  const advisories = Object.values(parsed.data.advisories ?? {});
  const blocking = advisories.filter((a) => !TEMPORARY_ALLOWLIST.has(a.id));
  const tolerated = advisories.filter((a) => TEMPORARY_ALLOWLIST.has(a.id));

  return success({
    blocking,
    tolerated,
    clean: blocking.length === 0,
  });
}

export function formatAdvisory(advisory: Advisory, reason?: string): string {
  const suffix = reason ? ` | ${reason}` : ` (${advisory.url})`;
  return `- [${advisory.severity}] ${advisory.module_name} (${advisory.id}): ${advisory.title}${suffix}`;
}
