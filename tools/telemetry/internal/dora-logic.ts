import { failure, success } from '../../libraries/types.js';
import type { DoraCalculationResult, DoraPerformanceLevel, DoraReport } from './dora-types.js';
import { DoraMetricsSchema } from './dora-types.js';

export function calculateDailyAvg(last7Days: number): number {
  return last7Days / 7;
}

export function classifyPerformance(dailyAvg: number): DoraPerformanceLevel {
  if (dailyAvg > 2) {
    return 'elite';
  }
  if (dailyAvg > 1) {
    return 'high';
  }
  if (dailyAvg > 0.5) {
    return 'medium';
  }
  return 'low';
}

export function computeDoraReport(raw: unknown): DoraCalculationResult {
  const parsed = DoraMetricsSchema.safeParse(raw);
  if (!parsed.success) {
    return failure(`Invalid DORA metrics input: ${parsed.error.message}`);
  }

  const { totalCommits, last7Days, leadTimeHours, changeFailureRate, mttrMinutes } = parsed.data;
  const dailyAvg = calculateDailyAvg(last7Days);
  const performanceLevel = classifyPerformance(dailyAvg);

  const metrics = {
    deploymentFrequency: totalCommits,
    dailyAvg,
    leadTimeHours,
    changeFailureRate,
    mttrMinutes,
  } as const;

  const report: DoraReport = { metrics, performanceLevel };
  return success(report);
}

export function formatDoraReport(report: DoraReport): string {
  const { metrics, performanceLevel } = report;
  const lines = [
    '-------------------------------------------',
    `\x1b[36m\x1b[1mDORA Metrics Report\x1b[0m`,
    '-------------------------------------------',
    `  Deployment Frequency: ${metrics.dailyAvg.toFixed(2)} / day`,
    `  Lead Time for Changes: ${metrics.leadTimeHours}h`,
    `  Change Failure Rate: ${metrics.changeFailureRate.toFixed(1)}%`,
    `  Time to Restore: < ${metrics.mttrMinutes} min`,
    '-------------------------------------------',
    `  Team Rating: ${performanceLevel.toUpperCase()} PERFORMER`,
    '-------------------------------------------',
  ];
  return lines.join('\n');
}
