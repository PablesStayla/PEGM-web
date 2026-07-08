import type { Result } from '../../libraries/types.js';
import { failure, success } from '../../libraries/types.js';
import type { FileProcessInput, LevelConfig } from './level-types.js';
import { LevelConfigSchema } from './level-types.js';

export function readFrontmatter(content: string): string | null {
  const match = content.match(/^\s*---[\r\n]+([\s\S]*?)[\r\n]+---/);
  if (!match) {
    const singleLine = content.match(/^\s*---[\r\n]+---/);
    return singleLine ? '' : null;
  }
  return match[1];
}

export function hasLevelField(frontmatter: string): boolean {
  return /^\s*level\s*:/m.test(frontmatter);
}

export function replaceFrontmatter(content: string, newFrontmatter: string): string {
  if (/^\s*---/.test(content)) {
    return content.replace(/^\s*---\s*[\r\n]+([\s\S]*?)[\r\n]+---/, `---\n${newFrontmatter}\n---`);
  }
  return `---\n${newFrontmatter}\n---\n\n${content}`;
}

export function validateLevelConfig(level: string, date: string): Result<LevelConfig, string> {
  const parsed = LevelConfigSchema.safeParse({ level, lastReviewed: date });
  if (!parsed.success) {
    return failure(`Invalid level config: ${parsed.error.message}`);
  }
  return success(parsed.data);
}

export function processFileContent(input: FileProcessInput): Result<string, string> {
  const configResult = validateLevelConfig(input.level, input.date);
  if (!configResult.success) {
    return configResult;
  }

  const frontmatter = readFrontmatter(input.content);
  if (!frontmatter) {
    return failure('No frontmatter found');
  }

  if (hasLevelField(frontmatter)) {
    return success(input.content);
  }

  const newFrontmatter = `${frontmatter.trim()}\nlevel: ${input.level}\nlast_reviewed: ${input.date}`;
  const updated = replaceFrontmatter(input.content, newFrontmatter);
  return success(updated);
}

export function shouldProcessFile(frontmatter: string | null): boolean {
  if (!frontmatter) {
    return false;
  }
  return !hasLevelField(frontmatter);
}
