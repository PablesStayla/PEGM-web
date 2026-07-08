/**
 * Validate Agent Metadata — Functional Core
 *
 * Pure functions for agent/prompt frontmatter validation.
 * Zero I/O — no console.log, no process.env, no filesystem.
 */
import type { AgentFsPort, ValidationResult } from './validate-agent-metadata-types.js';
import { REQUIRED_FIELDS } from './validate-agent-metadata-types.js';

// ============================================================================
// Pure Functions
// ============================================================================

/** Parse frontmatter from markdown content */
export function parseFrontmatter(content: string): string | null {
  const match = content.match(/^\s*---[\r\n]+([\s\S]*?)[\r\n]+---/);
  if (!match) {
    const singleLine = content.match(/^\s*---[\r\n]+---/);
    return singleLine ? '' : null;
  }
  return match[1];
}

/** Check if frontmatter has a specific field */
export function hasField(frontmatter: string, field: string): boolean {
  return new RegExp(`(^|\n)${field}\\s*:`, 'm').test(frontmatter);
}

/** Validate frontmatter has all required fields */
export function validateFrontmatter(
  frontmatter: string | null,
  required: readonly string[],
): { valid: boolean; missing: string[] } {
  if (!frontmatter) {
    return { valid: false, missing: [] };
  }
  const missing = required.filter((field) => !hasField(frontmatter, field));
  return { valid: missing.length === 0, missing };
}

/** Determine file type from path */
export function getFileType(filePath: string): 'agent' | 'prompt' {
  return filePath.replace(/\\/g, '/').includes('/.github/prompts/') ? 'prompt' : 'agent';
}

/** Get required fields for a file type */
export function getRequiredFields(fileType: 'agent' | 'prompt'): readonly string[] {
  return REQUIRED_FIELDS[fileType];
}

/** Validate a single file's content */
export function validateFile(filePath: string, content: string): ValidationResult {
  const fileType = getFileType(filePath);
  const required = getRequiredFields(fileType);
  const frontmatter = parseFrontmatter(content);
  const { valid, missing } = validateFrontmatter(frontmatter, required);
  return {
    file: filePath,
    valid,
    missing,
    reason: !frontmatter ? 'missing frontmatter' : undefined,
  };
}

/** Validate all files using injected FS port */
export async function validateAllFiles(fs: AgentFsPort, root: string): Promise<ValidationResult[]> {
  const agentPattern = `${root}/.github/agents/*.md`;
  const promptPattern = `${root}/.github/prompts/**/*.md`;
  const [agentFiles, promptFiles] = await Promise.all([
    fs.glob([agentPattern]),
    fs.glob([promptPattern, '!**/README.md']),
  ]);

  const allFiles = [...agentFiles, ...promptFiles];
  const results: ValidationResult[] = [];

  for (const file of allFiles) {
    try {
      const content = fs.readFile(file);
      results.push(validateFile(file, content));
    } catch (err) {
      results.push({
        file,
        valid: false,
        reason: err instanceof Error ? err.message : 'Failed to read file',
      });
    }
  }

  return results;
}
