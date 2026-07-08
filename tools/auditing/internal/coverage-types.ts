import { z } from 'zod';

export const PrioritySchema = z.enum(['critical', 'high', 'medium', 'low']);
export type Priority = z.infer<typeof PrioritySchema>;

export interface CoverageGap {
  readonly file: string;
  readonly priority: Priority;
  readonly reason: string;
}

export interface CoverageSummary {
  readonly total: number;
  readonly critical: number;
  readonly high: number;
  readonly medium: number;
  readonly low: number;
  readonly gaps: readonly CoverageGap[];
}

export const PRIORITY_KEYWORDS: Record<Priority, readonly string[]> = {
  critical: [
    'service',
    'domain',
    'entity',
    'aggregate',
    'repository',
    'payment',
    'checkout',
    'order',
  ],
  high: ['application', 'usecase', 'handler', 'middleware'],
  medium: ['infrastructure', 'adapter', 'gateway'],
  low: [],
} as const;

export const CONTEXT_REASONS: Record<string, string> = {
  'core-domain': 'Core business logic - critical for mutation testing',
  auth: 'Authentication logic - security critical',
  lib: 'Shared utilities - used across application',
} as const;
