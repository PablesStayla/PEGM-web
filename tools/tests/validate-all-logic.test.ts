import { describe, expect, it } from 'vitest';
import { buildSummary, runChecksSequential } from '../lib/validate-all-logic.js';
import type { ExecPort, ValidationCheck } from '../lib/validate-all-types.js';

const mockExec: ExecPort = {
  run: (_cmd: string) => ({ stdout: 'OK', exitCode: 0 }),
  cwd: () => '/project',
};

describe('validate-all-logic', () => {
  describe('runChecksSequential', () => {
    it('should run all checks and return results', async () => {
      const checks: ValidationCheck[] = [
        { name: 'lint', command: 'pnpm lint', required: true },
        { name: 'typecheck', command: 'pnpm typecheck', required: true },
      ];
      const results = await runChecksSequential(mockExec, checks);
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.passed)).toBe(true);
    });
    it('should handle failed checks', async () => {
      const failExec: ExecPort = {
        run: () => ({ stdout: 'error', exitCode: 1 }),
        cwd: () => '/project',
      };
      const checks: ValidationCheck[] = [{ name: 'lint', command: 'pnpm lint', required: true }];
      const results = await runChecksSequential(failExec, checks);
      expect(results[0].passed).toBe(false);
    });
  });

  describe('buildSummary', () => {
    it('should build summary from results', () => {
      const results = [
        { name: 'lint', passed: true, required: true, output: '' },
        { name: 'test', passed: false, required: true, output: 'fail' },
      ];
      const summary = buildSummary(results as any);
      expect(summary.total).toBe(2);
      expect(summary.passed).toBe(1);
      expect(summary.failed).toBe(1);
    });
  });
});
