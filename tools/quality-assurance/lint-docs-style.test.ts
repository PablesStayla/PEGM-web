import { describe, expect, it } from 'vitest';
import {
  checkEmptySections,
  checkIncompleteMarkers,
  checkNaming,
  checkRequiredSections,
  compileLintResults,
  isStrictDoc,
  lintContent,
} from './internal/docs-lint-logic.js';

describe('docs-lint-logic', () => {
  describe('isStrictDoc', () => {
    it('should identify strict doc patterns', () => {
      expect(isStrictDoc('docs/audits/AUDITORIA_MASTER_2026.md')).toBe(true);
    });

    it('should identify portal docs', () => {
      expect(isStrictDoc('docs/portal/guide.md')).toBe(true);
    });

    it('should identify bug bounty docs', () => {
      expect(isStrictDoc('docs/operations/BUG_BOUNTY_2026.md')).toBe(true);
    });

    it('should identify bundle reduction plan', () => {
      expect(isStrictDoc('docs/operations/BUNDLE_REDUCTION_PLAN_M2.md')).toBe(true);
    });

    it('should identify SLO/SLI targets', () => {
      expect(isStrictDoc('docs/operations/SLO_SLI_TARGETS_2026.md')).toBe(true);
    });

    it('should identify disaster recovery drill', () => {
      expect(isStrictDoc('docs/operations/runbooks/DISASTER_RECOVERY_DRILL.md')).toBe(true);
    });

    it('should identify security reports', () => {
      expect(isStrictDoc('docs/reports/SECURITY_BUG_BOUNTY_MONTHLY.md')).toBe(true);
      expect(isStrictDoc('docs/reports/DR_DRILL_EVIDENCE_APR_2026.md')).toBe(true);
    });

    it('should not identify non-strict docs', () => {
      expect(isStrictDoc('docs/random-note.md')).toBe(false);
    });
  });

  describe('checkNaming', () => {
    it('should pass uppercase naming', () => {
      expect(checkNaming('MY_DOC.md')).toBeNull();
    });

    it('should flag lowercase naming', () => {
      const result = checkNaming('my-doc.md');
      expect(result).not.toBeNull();
      expect(result!.severity).toBe('error');
    });

    it('should allow readme files', () => {
      expect(checkNaming('README.md')).toBeNull();
    });
  });

  describe('checkRequiredSections', () => {
    it('should pass when all sections present', () => {
      const content = '# Overview\n## Purpose\n## Prerequisites\n## Instructions';
      expect(checkRequiredSections(content)).toHaveLength(0);
    });

    it('should fail when missing Overview', () => {
      const content = '## Purpose\n## Prerequisites\n## Instructions';
      const results = checkRequiredSections(content);
      expect(results.some((r) => r.message.includes('Overview'))).toBe(true);
    });

    it('should fail when missing Purpose', () => {
      const content = '# Overview\n## Prerequisites\n## Instructions';
      const results = checkRequiredSections(content);
      expect(results.some((r) => r.message.includes('Purpose'))).toBe(true);
    });

    it('should fail when missing Prerequisites', () => {
      const content = '# Overview\n## Purpose\n## Instructions';
      const results = checkRequiredSections(content);
      expect(results.some((r) => r.message.includes('Prerequisites'))).toBe(true);
    });

    it('should fail when missing Instructions', () => {
      const content = '# Overview\n## Purpose\n## Prerequisites';
      const results = checkRequiredSections(content);
      expect(results.some((r) => r.message.includes('Instructions'))).toBe(true);
    });
  });

  describe('checkEmptySections', () => {
    it('should warn about empty sections', () => {
      const content = '## Empty\n\n## Next';
      expect(checkEmptySections(content)).toHaveLength(1);
    });

    it('should not warn about sections with content', () => {
      const content = '# Overview\n## Purpose\nThis has content.\n\n## Next';
      expect(checkEmptySections(content)).toHaveLength(0);
    });
  });

  describe('checkIncompleteMarkers', () => {
    it('should warn about TODO markers', () => {
      const results = checkIncompleteMarkers('# Overview\nTODO: Add more content');
      expect(results.some((r) => r.message.includes('TODO'))).toBe(true);
    });

    it('should warn about FIXME markers', () => {
      const results = checkIncompleteMarkers('# Overview\nFIXME: Fix this later');
      expect(results.some((r) => r.message.includes('FIXME'))).toBe(true);
    });

    it('should warn about WIP markers', () => {
      const results = checkIncompleteMarkers('# Overview\nWIP - Work in progress');
      expect(results.some((r) => r.message.includes('WIP'))).toBe(true);
    });

    it('should deduplicate markers', () => {
      const results = checkIncompleteMarkers('# Overview\nTODO: This TODO and that TODO');
      expect(results).toHaveLength(1);
    });
  });

  describe('lintContent', () => {
    it('should skip non-strict docs', () => {
      expect(lintContent('# Hello', 'docs/random-note.md')).toHaveLength(0);
    });

    it('should combine all checks for strict docs', () => {
      const results = lintContent('my-doc content', 'docs/operations/BUG_BOUNTY_TEST.md');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should pass clean strict docs', () => {
      const content = '# Overview\n## Purpose\n## Prerequisites\n## Instructions';
      const results = lintContent(content, 'docs/operations/TEST.md');
      expect(results).toHaveLength(0);
    });
  });

  describe('compileLintResults', () => {
    it('should separate errors and warnings', () => {
      const results = [
        { file: 'a.md', message: 'err', severity: 'error' as const },
        { file: 'b.md', message: 'warn', severity: 'warning' as const },
      ];
      const compiled = compileLintResults(results);
      expect(compiled.errors).toHaveLength(1);
      expect(compiled.warnings).toHaveLength(1);
    });

    it('should count unique files', () => {
      const results = [
        { file: 'a.md', message: 'x', severity: 'error' as const },
        { file: 'a.md', message: 'y', severity: 'warning' as const },
      ];
      expect(compileLintResults(results).fileCount).toBe(1);
    });
  });

  describe('dropshipping scenarios', () => {
    it('should lint vendor onboarding docs', () => {
      const content = '# Overview\nTODO: add vendor requirements';
      const results = lintContent(content, 'docs/operations/BUG_BOUNTY_VENDOR.md');
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
