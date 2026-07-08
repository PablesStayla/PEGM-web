/**
 * Tests for deploy-vercel.ts
 * Tests deployment orchestration
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./deploy-stages.js', () => ({
  checkBranch: vi.fn(),
  checkGitStatus: vi.fn(),
  runTests: vi.fn(),
  runLint: vi.fn(),
  runTypeCheck: vi.fn(),
  runBuild: vi.fn(),
  runSecurityAudit: vi.fn(),
  deployToVercel: vi.fn(),
  createReleaseTag: vi.fn(),
}));

describe('deploy-vercel (orchestrator)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should run all stages successfully', async () => {
    const stages = await import('./deploy-stages.js');
    vi.mocked(stages.checkBranch).mockResolvedValue({ success: true, message: 'OK' });
    vi.mocked(stages.checkGitStatus).mockResolvedValue({ success: true, message: 'OK' });
    vi.mocked(stages.runTests).mockResolvedValue({ success: true, message: 'OK' });
    vi.mocked(stages.runLint).mockResolvedValue({ success: true, message: 'OK' });
    vi.mocked(stages.runTypeCheck).mockResolvedValue({ success: true, message: 'OK' });
    vi.mocked(stages.runBuild).mockResolvedValue({ success: true, message: 'OK' });
    vi.mocked(stages.runSecurityAudit).mockResolvedValue({ success: true, message: 'OK' });
    vi.mocked(stages.deployToVercel).mockResolvedValue({ success: true, message: 'OK' });
    vi.mocked(stages.createReleaseTag).mockResolvedValue({ success: true, message: 'OK' });

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);

    try {
      const { main } = await import('./deploy-vercel.js');
      await main({ dryRun: false, verbose: false, json: false });

      expect(exitSpy).toHaveBeenCalledWith(0);
    } finally {
      exitSpy.mockRestore();
    }
  });

  it('should exit on first failure', async () => {
    const stages = await import('./deploy-stages.js');
    vi.mocked(stages.checkBranch).mockResolvedValue({ success: false, error: 'Failed' });

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);

    try {
      const { main } = await import('./deploy-vercel.js');
      await main({ dryRun: false, verbose: false, json: false });

      expect(exitSpy).toHaveBeenCalledWith(1);
    } finally {
      exitSpy.mockRestore();
    }
  });
});
