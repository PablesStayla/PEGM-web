import { z } from 'zod';
import type { Result } from '../../libraries/types.js';

export type DoraPerformanceLevel = 'elite' | 'high' | 'medium' | 'low';

export interface DoraMetrics {
  readonly deploymentFrequency: number;
  readonly dailyAvg: number;
  readonly leadTimeHours: number;
  readonly changeFailureRate: number;
  readonly mttrMinutes: number;
}

export interface DoraReport {
  readonly metrics: DoraMetrics;
  readonly performanceLevel: DoraPerformanceLevel;
}

export const DoraMetricsSchema = z.object({
  totalCommits: z.number().int().min(0),
  last7Days: z.number().int().min(0),
  leadTimeHours: z.number().min(0),
  changeFailureRate: z.number().min(0).max(100),
  mttrMinutes: z.number().min(0),
});

export type DoraMetricsInput = z.infer<typeof DoraMetricsSchema>;

export type DoraCalculationResult = Result<DoraReport, string>;
