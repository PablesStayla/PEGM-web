import { z } from 'zod';

export interface BudgetThreshold {
  readonly maxTotalSizeKB: number;
  readonly maxFirstLoadKB: number;
}

export interface BudgetCheckResult {
  readonly app: string;
  readonly withinBudget: boolean;
  readonly totalSizeKB: number;
  readonly firstLoadKB: number;
}

export const BudgetThresholdSchema = z.object({
  maxTotalSizeKB: z.number().int().min(0),
  maxFirstLoadKB: z.number().int().min(0),
});

export const DEFAULT_BUDGETS: Record<string, BudgetThreshold> = {
  web: { maxTotalSizeKB: 500, maxFirstLoadKB: 150 },
  admin: { maxTotalSizeKB: 1000, maxFirstLoadKB: 250 },
};

export function checkBudget(
  totalSizeKB: number,
  firstLoadKB: number,
  threshold: BudgetThreshold,
): BudgetCheckResult {
  const withinBudget =
    totalSizeKB <= threshold.maxTotalSizeKB && firstLoadKB <= threshold.maxFirstLoadKB;
  return { app: '', withinBudget, totalSizeKB, firstLoadKB };
}

export function validateBudgets(
  appSizes: Record<string, { totalSizeKB: number; firstLoadKB: number }>,
  budgets: Record<string, BudgetThreshold>,
): BudgetCheckResult[] {
  const results: BudgetCheckResult[] = [];
  for (const [app, sizes] of Object.entries(appSizes)) {
    const threshold = budgets[app];
    if (!threshold) {
      continue;
    }
    const result = checkBudget(sizes.totalSizeKB, sizes.firstLoadKB, threshold);
    results.push({ ...result, app });
  }
  return results;
}

export function formatBudgetReport(results: readonly BudgetCheckResult[]): string {
  const lines = results.map((r) => {
    const mark = r.withinBudget ? 'OK' : 'FAIL';
    return `${mark} ${r.app}: total=${r.totalSizeKB}KB, firstLoad=${r.firstLoadKB}KB`;
  });

  const allPass = results.every((r) => r.withinBudget);
  if (allPass) {
    lines.push('', 'All apps within performance budget.');
  } else {
    lines.push('', 'Performance budget exceeded.');
  }

  return lines.join('\n');
}
