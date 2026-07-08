import { describe, expect, it } from 'vitest';
import { DEPLOY_STAGES, StageResultSchema } from '../lib/deploy-stages-types.js';

describe('deploy-stages-types', () => {
  describe('DEPLOY_STAGES', () => {
    it('should have stages defined', () => {
      expect(DEPLOY_STAGES.length).toBeGreaterThan(0);
    });
    it('should each have name and command', () => {
      for (const stage of DEPLOY_STAGES) {
        expect(stage.name).toBeTruthy();
        expect(stage.command).toBeTruthy();
      }
    });
  });

  describe('StageResultSchema', () => {
    it('should validate successful stage result', () => {
      const result = StageResultSchema.safeParse({
        stage: 'build',
        success: true,
        output: 'OK',
      });
      expect(result.success).toBe(true);
    });
    it('should validate failed stage result', () => {
      const result = StageResultSchema.safeParse({
        stage: 'build',
        success: false,
        output: 'Error',
      });
      expect(result.success).toBe(true);
    });
  });
});
