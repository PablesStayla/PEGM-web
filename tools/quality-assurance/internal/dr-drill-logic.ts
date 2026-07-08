import type { QaCheckResult } from '../check-qa-gates.js';

export interface PackageScriptChecker {
  readonly existsSync: (p: string) => boolean;
  readonly readFileSync: (p: string) => string;
  readonly cwd: string;
}

export const REQUIRED_DR_FILES: readonly string[] = [
  'docs/operations/runbooks/DISASTER_RECOVERY_DRILL.md',
  'docs/operations/runbooks/ROLLBACK_PLAYBOOK.md',
  'tools/ops/database/backup-restore.ts',
] as const;

export const REQUIRED_DR_SCRIPTS: readonly string[] = [
  'db:backup',
  'db:restore',
  'dr:drill:check',
] as const;

export function checkScript(scriptName: string, ctx: PackageScriptChecker): QaCheckResult {
  const packageJsonPath = `${ctx.cwd}/package.json`;
  if (!ctx.existsSync(packageJsonPath)) {
    return { name: `script:${scriptName}`, passed: false, detail: 'package.json missing' };
  }
  try {
    const packageJson = JSON.parse(ctx.readFileSync(packageJsonPath)) as {
      scripts?: Record<string, string>;
    };
    const ok = Boolean(packageJson.scripts?.[scriptName]);
    return { name: `script:${scriptName}`, passed: ok, detail: ok ? 'configured' : 'missing' };
  } catch {
    return { name: `script:${scriptName}`, passed: false, detail: 'invalid package.json' };
  }
}
