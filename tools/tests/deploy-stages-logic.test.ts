/**
 * Deploy Stages Logic — Unit Tests
 */
import { describe, expect, it, vi } from 'vitest';
import {
  checkBranch,
  checkGitStatus,
  runCommandStage,
  runPipeline,
  runSecurityAudit,
  verifyDeployment,
} from '../lib/deploy-stages-logic.js';
import type { ShellPort } from '../lib/deploy-stages-types.js';

const mockShell: ShellPort = {
  exec: vi.fn().mockReturnValue({ output: 'main', success: true }),
  fetch: vi.fn().mockResolvedValue({ status: 200 }),
};

describe('checkBranch', () => {
  it('should pass on main branch', () => {
    const r = checkBranch(mockShell);
    expect(r.success).toBe(true);
  });
  it('should fail on non-main branch', () => {
    const shell = {
      ...mockShell,
      exec: vi.fn().mockReturnValue({ output: 'develop', success: true }),
    };
    const r = checkBranch(shell);
    expect(r.success).toBe(false);
  });
});

describe('checkGitStatus', () => {
  it('should pass with clean status', () => {
    const r = checkGitStatus(mockShell);
    expect(r.success).toBe(true);
  });
  it('should fail with uncommitted changes', () => {
    const shell = { ...mockShell, exec: vi.fn().mockReturnValue({ output: '', success: false }) };
    const r = checkGitStatus(shell);
    expect(r.success).toBe(false);
  });
});

describe('runCommandStage', () => {
  it('should pass on success', () => {
    const r = runCommandStage(mockShell, 'echo hi', 'Test');
    expect(r.success).toBe(true);
  });
  it('should fail on error', () => {
    const shell = {
      ...mockShell,
      exec: vi.fn().mockReturnValue({ output: 'err', success: false }),
    };
    const r = runCommandStage(shell, 'fail', 'Test');
    expect(r.success).toBe(false);
  });
});

describe('runSecurityAudit', () => {
  it('should pass even with warnings', () => {
    const shell = { ...mockShell, exec: vi.fn().mockReturnValue({ output: '', success: false }) };
    const r = runSecurityAudit(shell);
    expect(r.success).toBe(true);
  });
});

describe('verifyDeployment', () => {
  it('should pass on HTTP 200', async () => {
    const r = await verifyDeployment(mockShell, 'https://example.com');
    expect(r.success).toBe(true);
  });
  it('should fail on non-200 status', async () => {
    const shell = { ...mockShell, fetch: vi.fn().mockResolvedValue({ status: 500 }) };
    const r = await verifyDeployment(shell, 'https://example.com');
    expect(r.success).toBe(false);
  });
});

describe('runPipeline', () => {
  it('should stop on critical failure', async () => {
    const shell = {
      ...mockShell,
      exec: vi.fn().mockReturnValueOnce({ output: 'develop', success: true }), // branch check fails
    };
    const stages = await runPipeline(shell);
    expect(stages).toHaveLength(1);
    expect(stages[0].success).toBe(false);
  });
});
