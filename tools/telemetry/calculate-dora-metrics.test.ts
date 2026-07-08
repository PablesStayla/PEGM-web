import { describe, expect, it } from 'vitest';
import { calculateDailyAvg, classifyPerformance } from './internal/dora-logic.js';

describe('calculate-dora-metrics (shell + core)', () => {
  it('should calculate daily average', () => {
    const result = calculateDailyAvg([3, 4, 5, 6, 7, 8, 9]);
    expect(result).toBeCloseTo(6, 0);
  });

  it('should classify performance levels', () => {
    expect(classifyPerformance(10)).toBe('elite');
    expect(classifyPerformance(0.01)).toBe('low');
  });
});
