/**
 * Validate Agent Metadata — Types & Zod Schemas
 *
 * Pure type definitions for agent metadata validation.
 */
import { z } from 'zod';

/** Zod schema for frontmatter validation */
export const FrontmatterSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1),
  })
  .passthrough();

/** Agent frontmatter type */
export interface Frontmatter {
  name: string;
  description: string;
  tools?: string;
  'argument-hint'?: string;
  agent?: string;
  model?: string;
  [key: string]: string | undefined;
}

/** Validation result for a single file */
export interface ValidationResult {
  readonly file: string;
  readonly valid: boolean;
  readonly missing?: readonly string[];
  readonly reason?: string;
}

/** Required fields by file type */
export const REQUIRED_FIELDS = {
  agent: ['name', 'description', 'tools'] as const,
  prompt: ['name', 'description', 'argument-hint', 'agent', 'model'] as const,
} as const;

/** CLI input schema */
export const AgentValidateOptionsSchema = z.object({
  verbose: z.boolean().default(false),
  json: z.boolean().default(false),
  dryRun: z.boolean().default(false),
});

export type AgentValidateOptions = z.infer<typeof AgentValidateOptionsSchema>;

/** Dependency injection boundary for filesystem */
export interface AgentFsPort {
  readFile(path: string): string;
  glob(patterns: string[]): Promise<string[]>;
  cwd(): string;
}
