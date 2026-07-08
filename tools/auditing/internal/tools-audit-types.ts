import { z } from 'zod';

export const AuditStatusSchema = z.enum(['pass', 'warn', 'fail']);
export type AuditStatus = z.infer<typeof AuditStatusSchema>;

export interface AuditResult {
  readonly category: string;
  readonly status: AuditStatus;
  readonly message: string;
  readonly details?: readonly string[];
}

export interface AuditSummary {
  readonly total: number;
  readonly passed: number;
  readonly warned: number;
  readonly failed: number;
  readonly results: readonly AuditResult[];
  readonly hasFailures: boolean;
}

export const MCPConfigSchema = z.object({
  servers: z.record(z.string(), z.unknown()).optional(),
});

export const RequiredMCPs = [
  'filesystem',
  'commands',
  'supabase',
  'postgres',
  'redis',
  'playwright',
  'github',
] as const;

export const RequiredCLIs = [
  { name: 'turbo', purpose: 'Monorepo orchestration' },
  { name: '@biomejs/biome', purpose: 'Lint + Format' },
  { name: 'lefthook', purpose: 'Git hooks' },
  { name: 'vitest', purpose: 'Testing' },
  { name: 'supabase', purpose: 'Supabase CLI' },
  { name: 'knip', purpose: 'Dead code detection' },
] as const;

export const EssentialExtensions = [
  'biomejs.biome',
  'yoavbls.pretty-ts-errors',
  'usernamehw.errorlens',
  'vitest.explorer',
  'ms-playwright.playwright',
] as const;

export const RequiredDocSections = ['MCPs', 'Comandos', 'Arquitectura', 'Stack'] as const;
