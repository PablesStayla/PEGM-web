/**
 * Deploy Stages — Functional Core
 *
 * Pure functions for deployment pipeline stages.
 * All side effects injected via ShellPort.
 */
import type { CommandResult, ShellPort, StageResult } from './deploy-stages-types.js';
import { DEPLOY_STAGES } from './deploy-stages-types.js';

/** Execute a command and return a StageResult */
export function runStageCommand(shell: ShellPort, command: string, silent = false): CommandResult {
  return shell.exec(command, { silent });
}

/** Check current branch is main */
export function checkBranch(shell: ShellPort): StageResult {
  const result = runStageCommand(shell, DEPLOY_STAGES.branch.command, true);
  if (!result.success) {
    return { success: false, error: 'Failed to get current branch' };
  }
  if (result.output.trim() !== 'main') {
    return { success: false, error: `Must be on main (current: ${result.output.trim()})` };
  }
  return { success: true, message: 'On main branch' };
}

/** Check for uncommitted changes */
export function checkGitStatus(shell: ShellPort): StageResult {
  const result = runStageCommand(shell, DEPLOY_STAGES.gitStatus.command, true);
  if (!result.success) {
    return { success: false, error: 'You have uncommitted changes' };
  }
  return { success: true, message: 'Git status clean' };
}

/** Run a generic command stage */
export function runCommandStage(
  shell: ShellPort,
  command: string,
  label: string,
  silent = false,
): StageResult {
  const result = runStageCommand(shell, command, silent);
  if (!result.success) {
    return { success: false, error: `${label} failed` };
  }
  return { success: true, message: `${label} passed` };
}

/** Security audit (warnings are OK) */
export function runSecurityAudit(shell: ShellPort): StageResult {
  const result = runStageCommand(shell, DEPLOY_STAGES.security.command, true);
  if (!result.success) {
    return { success: true, message: 'Security audit complete (warnings found)' };
  }
  return { success: true, message: 'Security check passed' };
}

/** Create release tag */
export function createReleaseTag(shell: ShellPort): StageResult {
  try {
    const version = new Date()
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 14);
    const tagName = `v${version}`;
    shell.exec(`git tag -a "${tagName}" -m "Production deployment ${version}"`, { silent: true });
    shell.exec(`git push origin "${tagName}"`, { silent: true });
    return { success: true, message: `Release tagged: ${tagName}` };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create tag' };
  }
}

/** Post-deployment verification */
export async function verifyDeployment(shell: ShellPort, url: string): Promise<StageResult> {
  try {
    const response = await shell.fetch(url);
    if (response.status !== 200) {
      return { success: false, error: `Site returned HTTP ${response.status}` };
    }
    return { success: true, message: 'Site is accessible' };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Verification failed' };
  }
}

/** Run the full deployment pipeline */
export async function runPipeline(shell: ShellPort, skipTests = false): Promise<StageResult[]> {
  const stages: StageResult[] = [];
  const checks: Array<{ run: () => StageResult | Promise<StageResult>; critical: boolean }> = [
    { run: () => checkBranch(shell), critical: true },
    { run: () => checkGitStatus(shell), critical: true },
    ...(skipTests
      ? []
      : [
          {
            run: () => runCommandStage(shell, DEPLOY_STAGES.tests.command, 'Tests'),
            critical: true,
          },
        ]),
    { run: () => runCommandStage(shell, DEPLOY_STAGES.lint.command, 'Lint'), critical: true },
    {
      run: () => runCommandStage(shell, DEPLOY_STAGES.typeCheck.command, 'Type check'),
      critical: false,
    },
    { run: () => runCommandStage(shell, DEPLOY_STAGES.build.command, 'Build'), critical: true },
    { run: () => runSecurityAudit(shell), critical: false },
    { run: () => runCommandStage(shell, DEPLOY_STAGES.deploy.command, 'Deploy'), critical: true },
  ];

  for (const { run, critical } of checks) {
    const result = await run();
    stages.push(result);
    if (!result.success && critical) {
      break;
    }
  }

  return stages;
}
