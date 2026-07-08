import { z } from 'zod';

export interface SastPattern {
  readonly name: string;
  readonly pattern: RegExp;
  readonly message: string;
  readonly severity: 'critical' | 'high' | 'medium';
}

export const SAST_PATTERNS: readonly SastPattern[] = [
  {
    name: 'eval',
    pattern: /\beval\s*\(/g,
    message: 'Use of eval() detected - code injection risk',
    severity: 'critical',
  },
  {
    name: 'innerHTML',
    pattern: /\.innerHTML\s*=/g,
    message: 'Use of innerHTML - possible XSS risk',
    severity: 'high',
  },
  {
    name: 'dangerouslySetInnerHTML',
    pattern: /dangerouslySetInnerHTML/g,
    message: 'React dangerouslySetInnerHTML detected',
    severity: 'high',
  },
  {
    name: 'env-secret',
    pattern: /process\.env\.[A-Z0-9_]*SECRET/g,
    message: 'Possible secret exposure in code',
    severity: 'critical',
  },
  {
    name: 'localStorage',
    pattern: /localStorage\.setItem/g,
    message: 'localStorage usage - verify if encryption needed',
    severity: 'medium',
  },
] as const;

export const SastPatternConfigSchema = z.object({
  name: z.string().min(1),
  pattern: z.instanceof(RegExp),
  message: z.string().min(1),
  severity: z.enum(['critical', 'high', 'medium']),
});

export interface SastFinding {
  readonly file: string;
  readonly line: number;
  readonly patternName: string;
  readonly message: string;
  readonly severity: 'critical' | 'high' | 'medium';
}

export function scanLine(line: string, patterns: readonly SastPattern[]): SastFinding[] {
  const findings: SastFinding[] = [];
  for (const p of patterns) {
    p.pattern.lastIndex = 0;
    if (p.pattern.test(line)) {
      findings.push({
        file: '',
        line: 0,
        patternName: p.name,
        message: p.message,
        severity: p.severity,
      });
    }
  }
  return findings;
}

export function scanContent(
  content: string,
  filePath: string,
  patterns: readonly SastPattern[],
): SastFinding[] {
  const lines = content.split('\n');
  const findings: SastFinding[] = [];

  for (const [index, line] of lines.entries()) {
    const lineFindings = scanLine(line, patterns);
    for (const f of lineFindings) {
      findings.push({ ...f, file: filePath, line: index + 1 });
    }
  }

  return findings;
}

export function formatSastReport(findings: readonly SastFinding[]): string {
  if (findings.length === 0) {
    return 'No insecure code patterns detected.';
  }

  const lines = findings.map(
    (f) => `[SAST] ${f.file}:${f.line} -> [${f.severity}] ${f.message} (${f.patternName})`,
  );

  lines.push(`\nFound ${findings.length} potential security violations.`);
  return lines.join('\n');
}
