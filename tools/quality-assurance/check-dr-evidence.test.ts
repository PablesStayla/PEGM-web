import { describe, expect, it } from 'vitest';
import { failure, success } from '../libraries/types.js';
import type { ContentReader, FileExistenceChecker } from './check-qa-gates.js';
import {
  checkFileContains,
  checkFileExists,
  compileQaReport,
  formatQaReport,
} from './check-qa-gates.js';

const DR_REPORT_PATH = 'docs/reports/DR_DRILL_EVIDENCE_APR_2026.md';

function runDrDrillEvidenceChecks(fileExists: FileExistenceChecker, readContent: ContentReader) {
  return [
    checkFileExists('docs/operations/runbooks/DISASTER_RECOVERY_DRILL.md', fileExists),
    checkFileExists('docs/operations/runbooks/ROLLBACK_PLAYBOOK.md', fileExists),
    checkFileExists(DR_REPORT_PATH, fileExists),
    checkFileContains(DR_REPORT_PATH, 'RTO observado', 'dr:evidence-rto', fileExists, readContent),
    checkFileContains(DR_REPORT_PATH, 'RPO observado', 'dr:evidence-rpo', fileExists, readContent),
    checkFileContains(
      DR_REPORT_PATH,
      'Resultado del check: PASS',
      'dr:evidence-pass',
      fileExists,
      readContent,
    ),
  ];
}

describe('dr-drill-evidence-check', () => {
  const allExist: FileExistenceChecker = () => true;
  const noneExist: FileExistenceChecker = () => false;
  const fullContent: ContentReader = () =>
    success('RTO observado: 15min\nRPO observado: 5min\nResultado del check: PASS');
  const emptyContent: ContentReader = () => success('');
  const failedRead: ContentReader = () => failure('read error');

  describe('runDrDrillEvidenceChecks', () => {
    it('should pass all checks with complete DR evidence', () => {
      const results = runDrDrillEvidenceChecks(allExist, fullContent);
      const failures = results.filter((r) => !r.passed);
      expect(failures).toHaveLength(0);
    });

    it('should fail when required files missing', () => {
      const results = runDrDrillEvidenceChecks(noneExist, fullContent);
      const fileFailures = results.filter((r) => !r.passed && !r.name.startsWith('dr:evidence'));
      expect(fileFailures.length).toBeGreaterThan(0);
    });

    it('should fail when RTO evidence missing', () => {
      const results = runDrDrillEvidenceChecks(allExist, emptyContent);
      expect(results.some((r) => r.name === 'dr:evidence-rto' && !r.passed)).toBe(true);
    });

    it('should fail when RPO evidence missing', () => {
      const results = runDrDrillEvidenceChecks(allExist, emptyContent);
      expect(results.some((r) => r.name === 'dr:evidence-rpo' && !r.passed)).toBe(true);
    });

    it('should fail when pass result missing', () => {
      const results = runDrDrillEvidenceChecks(allExist, emptyContent);
      expect(results.some((r) => r.name === 'dr:evidence-pass' && !r.passed)).toBe(true);
    });

    it('should handle failed content reads', () => {
      const results = runDrDrillEvidenceChecks(allExist, failedRead);
      const contentChecks = results.filter((r) => r.name.startsWith('dr:evidence'));
      expect(contentChecks.every((r) => !r.passed)).toBe(true);
    });

    it('should compile passing report', () => {
      const results = runDrDrillEvidenceChecks(allExist, fullContent);
      const report = compileQaReport(results);
      expect(report.failed).toBe(0);
    });

    it('should format report with title', () => {
      const results = runDrDrillEvidenceChecks(allExist, fullContent);
      const report = compileQaReport(results);
      const output = formatQaReport(report, 'DR drill evidence');
      expect(output).toContain('DR drill evidence');
    });
  });

  describe('dropshipping scenarios', () => {
    it('should validate vendor fulfillment DR readiness', () => {
      const content: ContentReader = () =>
        success('RTO observado: 30min\nRPO observado: 10min\nResultado del check: PASS');
      const results = runDrDrillEvidenceChecks(allExist, content);
      const failures = results.filter((r) => !r.passed);
      expect(failures).toHaveLength(0);
    });
  });
});
