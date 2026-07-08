import { describe, expect, it } from 'vitest';
import {
  checkNodeVersion,
  checkNoSecrets,
  checkPnpmVersion,
  compileDoctorReport,
  formatDoctorReport,
  getExitCode,
  parseNodeVersion,
  parsePnpmVersion,
} from './internal/doctor-logic.js';

describe('doctor-logic', () => {
  describe('parseNodeVersion', () => {
    it('should parse valid Node.js version', () => {
      const result = parseNodeVersion('v24.1.0');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.major).toBe(24);
      }
    });

    it('should fail for version without v prefix', () => {
      const result = parseNodeVersion('24.1.0');
      expect(result.success).toBe(false);
    });

    it('should parse version with just major', () => {
      const result = parseNodeVersion('v20');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.major).toBe(20);
      }
    });
  });

  describe('parsePnpmVersion', () => {
    it('should parse valid pnpm version', () => {
      const result = parsePnpmVersion('9.12.0\n');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.major).toBe(9);
      }
    });

    it('should fail for empty string', () => {
      const result = parsePnpmVersion('');
      expect(result.success).toBe(false);
    });
  });

  describe('checkNodeVersion', () => {
    it('should pass for version >= minimum', () => {
      const result = checkNodeVersion('v24.0.0', 24);
      expect(result.passed).toBe(true);
    });

    it('should fail for version < minimum', () => {
      const result = checkNodeVersion('v20.0.0', 24);
      expect(result.passed).toBe(false);
      expect(result.fix).toBeDefined();
    });

    it('should fail for invalid version', () => {
      const result = checkNodeVersion('invalid', 24);
      expect(result.passed).toBe(false);
    });
  });

  describe('checkPnpmVersion', () => {
    it('should pass for version >= minimum', () => {
      const result = checkPnpmVersion('9.12.0', 9);
      expect(result.passed).toBe(true);
    });

    it('should fail for version < minimum', () => {
      const result = checkPnpmVersion('8.0.0', 9);
      expect(result.passed).toBe(false);
    });
  });

  describe('checkNoSecrets', () => {
    it('should pass for clean config', () => {
      const result = checkNoSecrets('{"mcpServers": {}}');
      expect(result.passed).toBe(true);
    });

    it('should fail for config with password', () => {
      const result = checkNoSecrets('password=admin123');
      expect(result.passed).toBe(false);
    });

    it('should fail for connection string with credentials', () => {
      const result = checkNoSecrets('postgres://user:pass@host:5432/db');
      expect(result.passed).toBe(false);
    });
  });

  describe('compileDoctorReport', () => {
    it('should count passed, failed, warnings', () => {
      const results = [
        { name: 'a', passed: true, severity: 'required' as const },
        { name: 'b', passed: false, severity: 'required' as const },
        { name: 'c', passed: false, severity: 'optional' as const },
      ];

      const report = compileDoctorReport(results);
      expect(report.passed).toBe(1);
      expect(report.failed).toBe(1);
      expect(report.warnings).toBe(1);
    });

    it('should handle all passing', () => {
      const report = compileDoctorReport([
        { name: 'a', passed: true, severity: 'required' as const },
      ]);
      expect(report.failed).toBe(0);
      expect(report.warnings).toBe(0);
    });
  });

  describe('formatDoctorReport', () => {
    it('should include results summary', () => {
      const report = compileDoctorReport([
        { name: 'Node.js', passed: true, severity: 'required' as const },
      ]);
      const output = formatDoctorReport(report);
      expect(output).toContain('1 passed');
    });
  });

  describe('getExitCode', () => {
    it('should return 1 for failed checks', () => {
      const report = compileDoctorReport([
        { name: 'a', passed: false, severity: 'required' as const },
      ]);
      expect(getExitCode(report)).toBe(1);
    });

    it('should return 0 when all pass', () => {
      const report = compileDoctorReport([
        { name: 'a', passed: true, severity: 'required' as const },
      ]);
      expect(getExitCode(report)).toBe(0);
    });
  });

  describe('dropshipping scenarios', () => {
    it('should handle node version parse edge cases', () => {
      const result = checkNodeVersion('v0.12.0', 24);
      expect(result.passed).toBe(false);
    });

    it('should not expose secrets in doctor output', () => {
      const result = checkNoSecrets('token=sk_live_secret_key_here');
      expect(result.passed).toBe(false);
      expect(JSON.stringify(result)).not.toContain('sk_live');
    });

    it('should handle empty config file', () => {
      const result = checkNoSecrets('');
      expect(result.passed).toBe(true);
    });
  });
});
