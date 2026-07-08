import { describe, expect, it } from 'vitest';
import { failure, success } from '../libraries/types.js';
import type { ContentReader, FileExistenceChecker } from './check-qa-gates.js';
import {
  checkFileContains,
  checkFileExists,
  compileQaReport,
  formatQaReport,
} from './check-qa-gates.js';

function runBugBountyChecks(fileExists: FileExistenceChecker, readContent: ContentReader) {
  return [
    checkFileExists('docs/operations/BUG_BOUNTY_POLICY.md', fileExists),
    checkFileExists('docs/operations/BUG_BOUNTY_OPERATIONS.md', fileExists),
    checkFileExists('docs/reports/SECURITY_BUG_BOUNTY_MONTHLY.md', fileExists),
    checkFileExists('.github/ISSUE_TEMPLATE/security-report.yml', fileExists),
    checkFileContains(
      'SECURITY.md',
      'security@pranakaia.cl',
      'security:contact-email',
      fileExists,
      readContent,
    ),
    checkFileContains(
      'SECURITY.md',
      'BUG_BOUNTY_POLICY',
      'security:policy-link',
      fileExists,
      readContent,
    ),
    checkFileContains(
      'docs/operations/BUG_BOUNTY_OPERATIONS.md',
      'Ack: <= 48h',
      'operations:sla-ack',
      fileExists,
      readContent,
    ),
  ];
}

describe('bug-bounty-operational-check', () => {
  const allExist: FileExistenceChecker = () => true;
  const noneExist: FileExistenceChecker = () => false;
  const fullContent: ContentReader = (p) => {
    if (p === 'SECURITY.md') {
      return success('Contact: security@pranakaia.cl\nSee BUG_BOUNTY_POLICY for details');
    }
    if (p.includes('BUG_BOUNTY_OPERATIONS')) {
      return success('SLA: Ack: <= 48h');
    }
    return success('');
  };
  const emptyContent: ContentReader = () => success('');
  const failedRead: ContentReader = () => failure('read error');

  describe('runBugBountyChecks', () => {
    it('should pass all checks with complete bug bounty setup', () => {
      const results = runBugBountyChecks(allExist, fullContent);
      const failures = results.filter((r) => !r.passed);
      expect(failures).toHaveLength(0);
    });

    it('should fail when policy file missing', () => {
      const results = runBugBountyChecks(noneExist, fullContent);
      expect(results.some((r) => r.name.includes('BUG_BOUNTY_POLICY') && !r.passed)).toBe(true);
    });

    it('should fail when contact email missing from SECURITY.md', () => {
      const results = runBugBountyChecks(allExist, emptyContent);
      expect(results.some((r) => r.name === 'security:contact-email' && !r.passed)).toBe(true);
    });

    it('should fail when policy link missing from SECURITY.md', () => {
      const results = runBugBountyChecks(allExist, emptyContent);
      expect(results.some((r) => r.name === 'security:policy-link' && !r.passed)).toBe(true);
    });

    it('should fail when SLA ack missing from operations doc', () => {
      const results = runBugBountyChecks(allExist, emptyContent);
      expect(results.some((r) => r.name === 'operations:sla-ack' && !r.passed)).toBe(true);
    });

    it('should handle failed content reads', () => {
      const results = runBugBountyChecks(allExist, failedRead);
      const contentCheckNames = [
        'security:contact-email',
        'security:policy-link',
        'operations:sla-ack',
      ];
      const contentChecks = results.filter((r) => contentCheckNames.includes(r.name));
      expect(contentChecks.every((r) => !r.passed)).toBe(true);
    });

    it('should compile passing report', () => {
      const results = runBugBountyChecks(allExist, fullContent);
      const report = compileQaReport(results);
      expect(report.failed).toBe(0);
    });

    it('should format report with title', () => {
      const results = runBugBountyChecks(allExist, fullContent);
      const report = compileQaReport(results);
      const output = formatQaReport(report, 'Bug bounty operational');
      expect(output).toContain('Bug bounty operational');
    });
  });

  describe('dropshipping scenarios', () => {
    it('should validate payment security bug bounty coverage', () => {
      const results = runBugBountyChecks(allExist, fullContent);
      const failures = results.filter((r) => !r.passed);
      expect(failures).toHaveLength(0);
    });
  });
});
