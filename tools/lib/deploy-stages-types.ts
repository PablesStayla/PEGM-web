/**
 * Deploy Stages — Types
 */
import { z } from 'zod';

/** Stage result type */
export type StageResult = { success: true; message: string } | { success: false; error: string };

/** Command execution result */
export interface CommandResult {
  output: string;
  success: boolean;
}

/** Dependency injection boundary for shell commands */
export interface ShellPort {
  exec(command: string, opts?: { silent?: boolean }): CommandResult;
  fetch(url: string): Promise<{ status: number }>;
}

/** Deploy stages configuration */
export const DEPLOY_STAGES = {
  branch: { command: 'git branch --show-current', expected: 'main', label: 'Check branch' },
  gitStatus: { command: 'git diff-index --quiet HEAD --', label: 'Check git status' },
  tests: { command: 'pnpm test:ci', label: 'Run tests' },
  lint: { command: 'pnpm lint', label: 'Run lint' },
  typeCheck: { command: 'pnpm type-check', label: 'Type check' },
  build: { command: 'pnpm build', label: 'Build' },
  security: { command: 'pnpm audit --audit-level=high', silent: true, label: 'Security audit' },
  deploy: { command: 'vercel --prod --yes', label: 'Deploy to Vercel' },
} as const;

export const DeployOptionsSchema = z.object({
  verbose: z.boolean().default(false),
  json: z.boolean().default(false),
  skipTests: z.boolean().default(false),
});

export type DeployOptions = z.infer<typeof DeployOptionsSchema>;
