import { describe, expect, it } from 'vitest';
import { formatSastReport, SAST_PATTERNS, scanContent, scanLine } from './internal/sast-logic.js';

describe('sast-logic', () => {
  describe('scanLine', () => {
    it('should detect eval() usage', () => {
      const findings = scanLine('const result = eval(userInput);', SAST_PATTERNS);
      expect(findings.some((f) => f.patternName === 'eval')).toBe(true);
    });

    it('should detect innerHTML assignment', () => {
      const findings = scanLine('el.innerHTML = userInput;', SAST_PATTERNS);
      expect(findings.some((f) => f.patternName === 'innerHTML')).toBe(true);
    });

    it('should detect dangerouslySetInnerHTML', () => {
      const findings = scanLine('<div dangerouslySetInnerHTML={{ __html }} />', SAST_PATTERNS);
      expect(findings.some((f) => f.patternName === 'dangerouslySetInnerHTML')).toBe(true);
    });

    it('should detect env secret exposure', () => {
      const findings = scanLine('process.env.MY_SECRET_KEY', SAST_PATTERNS);
      expect(findings.some((f) => f.patternName === 'env-secret')).toBe(true);
    });

    it('should detect localStorage.setItem', () => {
      const findings = scanLine('localStorage.setItem("token", token);', SAST_PATTERNS);
      expect(findings.some((f) => f.patternName === 'localStorage')).toBe(true);
    });

    it('should return empty for clean line', () => {
      const findings = scanLine('const x = safeFunction();', SAST_PATTERNS);
      expect(findings).toHaveLength(0);
    });
  });

  describe('scanContent', () => {
    it('should find findings across multiple lines', () => {
      const content = 'const a = eval(x);\nconst b = safe();\nel.innerHTML = y;';
      const findings = scanContent(content, 'test.ts', SAST_PATTERNS);
      expect(findings.length).toBeGreaterThanOrEqual(2);
    });

    it('should set correct line numbers', () => {
      const content = 'safe\nunsafe: eval(x)';
      const findings = scanContent(content, 'test.ts', SAST_PATTERNS);
      expect(findings[0].line).toBe(2);
    });

    it('should return empty for clean content', () => {
      const findings = scanContent('const x = 1;\nconst y = 2;', 'clean.ts', SAST_PATTERNS);
      expect(findings).toHaveLength(0);
    });
  });

  describe('formatSastReport', () => {
    it('should show pass message for no findings', () => {
      expect(formatSastReport([])).toContain('No insecure');
    });

    it('should include findings in output', () => {
      const findings = [
        {
          file: 'test.ts',
          line: 1,
          patternName: 'eval',
          message: 'eval detected',
          severity: 'critical' as const,
        },
      ];
      const output = formatSastReport(findings);
      expect(output).toContain('test.ts');
      expect(output).toContain('1 potential');
    });
  });

  describe('dropshipping scenarios', () => {
    it('should handle vendor code with eval', () => {
      const findings = scanLine('vendorSDK.evaluate = eval(config);', SAST_PATTERNS);
      expect(findings.some((f) => f.patternName === 'eval')).toBe(true);
    });

    it('should not flag safe process.env access', () => {
      const findings = scanLine('const url = process.env.NEXT_PUBLIC_URL;', SAST_PATTERNS);
      expect(findings.some((f) => f.patternName === 'env-secret')).toBe(false);
    });
  });
});
