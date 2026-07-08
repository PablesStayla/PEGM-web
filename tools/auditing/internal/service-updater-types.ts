import { z } from 'zod';

export const RENAMES = [
  { from: /AuditService\.log\(/g, to: 'logAuditEntry(' },
  { from: /AuditService\.configureWriter/g, to: 'configureAuditWriter' },
] as const;

export interface RewriteResult {
  readonly file: string;
  readonly changed: boolean;
  readonly error?: string;
}

export interface RewriteSummary {
  readonly updated: number;
  readonly errors: number;
  readonly total: number;
  readonly results: readonly RewriteResult[];
}

export const GlobPatternSchema = z.string().min(1);
