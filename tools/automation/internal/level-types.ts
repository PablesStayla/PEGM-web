import { z } from 'zod';

export const LevelConfigSchema = z.object({
  level: z.string().min(1),
  lastReviewed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type LevelConfig = z.infer<typeof LevelConfigSchema>;

export interface FrontmatterResult {
  readonly updated: boolean;
  readonly error?: string;
}

export interface FileProcessInput {
  readonly content: string;
  readonly filePath: string;
  readonly level: string;
  readonly date: string;
}
