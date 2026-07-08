import { z } from 'zod';

export const AdvisorySchema = z.object({
  id: z.number(),
  title: z.string(),
  module_name: z.string(),
  severity: z.string(),
  url: z.string(),
});

export const AuditReportSchema = z.object({
  advisories: z.record(z.string(), AdvisorySchema).optional(),
});

export type Advisory = z.infer<typeof AdvisorySchema>;
export type AuditReport = z.infer<typeof AuditReportSchema>;

export interface AuditResult {
  readonly blocking: readonly Advisory[];
  readonly tolerated: readonly Advisory[];
  readonly clean: boolean;
}

export const TEMPORARY_ALLOWLIST: ReadonlyMap<number, string> = new Map<number, string>([]);
