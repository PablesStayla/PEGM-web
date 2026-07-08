import { describe, expect, it } from 'vitest';
import { validateAccessibility } from './internal/accessibility-logic.js';

describe('accessibility-budget', () => {
  describe('validateAccessibility', () => {
    it('should pass when no critical violations and score meets threshold', () => {
      const report = {
        violations: [],
        passes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
        incomplete: [],
        inapplicable: [],
      };

      const result = validateAccessibility(report, 95);

      expect(result.valid).toBe(true);
      expect(result.score).toBe(100);
      expect(result.criticalCount).toBe(0);
    });

    it('should fail when critical violations exist', () => {
      const report = {
        violations: [
          {
            id: 'color-contrast',
            impact: 'critical' as const,
            description: 'Color contrast issue',
            nodes: 5,
          },
        ],
        passes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
        incomplete: [],
        inapplicable: [],
      };

      const result = validateAccessibility(report, 95);

      expect(result.valid).toBe(false);
      expect(result.criticalCount).toBe(1);
    });

    it('should fail when score below threshold', () => {
      const report = {
        violations: [
          { id: 'a', impact: 'minor' as const, description: 'a', nodes: 1 },
          { id: 'b', impact: 'minor' as const, description: 'b', nodes: 1 },
        ],
        passes: [{ id: 'c' }],
        incomplete: [],
        inapplicable: [],
      };

      const result = validateAccessibility(report, 95);

      expect(result.valid).toBe(false);
      expect(result.score).toBeLessThan(95);
    });

    it('should calculate score correctly', () => {
      const report = {
        violations: [
          { id: 'a', impact: 'minor' as const, description: 'a', nodes: 1 },
          { id: 'b', impact: 'minor' as const, description: 'b', nodes: 1 },
        ],
        passes: [{ id: 'c' }, { id: 'd' }, { id: 'e' }, { id: 'f' }],
        incomplete: [],
        inapplicable: [],
      };

      const result = validateAccessibility(report, 50);

      expect(result.score).toBe(67);
    });

    it('should handle empty report', () => {
      const report = {
        violations: [],
        passes: [],
        incomplete: [],
        inapplicable: [],
      };

      const result = validateAccessibility(report, 95);

      expect(result.valid).toBe(true);
      expect(result.score).toBe(100);
    });

    it('should count critical violations only', () => {
      const report = {
        violations: [
          { id: 'a', impact: 'critical' as const, description: 'a', nodes: 1 },
          { id: 'b', impact: 'serious' as const, description: 'b', nodes: 1 },
          { id: 'c', impact: 'moderate' as const, description: 'c', nodes: 1 },
        ],
        passes: [],
        incomplete: [],
        inapplicable: [],
      };

      const result = validateAccessibility(report, 0);

      expect(result.criticalCount).toBe(1);
      expect(result.valid).toBe(false);
    });

    it('should pass with non-critical violations if score meets threshold', () => {
      const report = {
        violations: [
          { id: 'a', impact: 'minor' as const, description: 'a', nodes: 1 },
          { id: 'b', impact: 'moderate' as const, description: 'b', nodes: 1 },
        ],
        passes: [
          { id: 'c' },
          { id: 'd' },
          { id: 'e' },
          { id: 'f' },
          { id: 'g' },
          { id: 'h' },
          { id: 'i' },
          { id: 'j' },
        ],
        incomplete: [],
        inapplicable: [],
      };

      const result = validateAccessibility(report, 80);

      expect(result.valid).toBe(true);
      expect(result.criticalCount).toBe(0);
    });

    it('should use custom threshold', () => {
      const report = {
        violations: [],
        passes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
        incomplete: [],
        inapplicable: [],
      };

      const result = validateAccessibility(report, 90);

      expect(result.valid).toBe(true);
      expect(result.score).toBe(100);
    });

    it('should pass when score equals threshold', () => {
      const report = {
        violations: [
          { id: 'a', impact: 'minor' as const, description: 'a', nodes: 1 },
          { id: 'b', impact: 'minor' as const, description: 'b', nodes: 1 },
        ],
        passes: [{ id: 'c' }, { id: 'd' }, { id: 'e' }, { id: 'f' }, { id: 'g' }],
        incomplete: [],
        inapplicable: [],
      };

      const result = validateAccessibility(report, 71);

      expect(result.score).toBe(71);
      expect(result.valid).toBe(true);
    });
  });

  describe('dropshipping scenarios', () => {
    it('should validate e-commerce checkout a11y', () => {
      const report = {
        violations: [],
        passes: [{ id: 'checkout-form' }, { id: 'payment-aria' }, { id: 'keyboard-nav' }],
        incomplete: [],
        inapplicable: [],
      };
      const result = validateAccessibility(report, 95);
      expect(result.valid).toBe(true);
    });
  });
});
