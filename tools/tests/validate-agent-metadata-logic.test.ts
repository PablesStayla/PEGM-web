/**
 * Validate Agent Metadata Logic — Unit Tests
 */
import { describe, expect, it, vi } from 'vitest';
import {
  getFileType,
  getRequiredFields,
  hasField,
  parseFrontmatter,
  validateAllFiles,
  validateFile,
  validateFrontmatter,
} from '../lib/validate-agent-metadata-logic.js';
import type { AgentFsPort } from '../lib/validate-agent-metadata-types.js';

const mockFs: AgentFsPort = {
  readFile: vi.fn().mockReturnValue('---\nname: test\ndescription: desc\ntools: bash\n---'),
  glob: vi.fn().mockResolvedValue(['agent.md']),
  cwd: vi.fn().mockReturnValue('/root'),
};

describe('parseFrontmatter', () => {
  it('should parse valid frontmatter', () => {
    expect(parseFrontmatter('---\nname: test\n---')).toBe('name: test');
  });
  it('should return null for missing frontmatter', () => {
    expect(parseFrontmatter('# Hello')).toBeNull();
  });
  it('should return empty string for empty frontmatter', () => {
    expect(parseFrontmatter('---\n---')).toBe('');
  });
});

describe('hasField', () => {
  it('should detect present field', () => {
    expect(hasField('name: test', 'name')).toBe(true);
  });
  it('should not detect absent field', () => {
    expect(hasField('name: test', 'tools')).toBe(false);
  });
});

describe('validateFrontmatter', () => {
  it('should fail for null frontmatter', () => {
    const r = validateFrontmatter(null, ['name']);
    expect(r.valid).toBe(false);
  });
  it('should detect missing fields', () => {
    const r = validateFrontmatter('name: test', ['name', 'description', 'tools']);
    expect(r.valid).toBe(false);
    expect(r.missing).toContain('description');
  });
  it('should pass when all fields present', () => {
    const r = validateFrontmatter('name: x\ndescription: y\ntools: z', [
      'name',
      'description',
      'tools',
    ]);
    expect(r.valid).toBe(true);
  });
});

describe('getFileType', () => {
  it('should detect prompt files', () => {
    expect(getFileType('/.github/prompts/test.md')).toBe('prompt');
  });
  it('should default to agent', () => {
    expect(getFileType('/.github/agents/test.md')).toBe('agent');
  });
});

describe('getRequiredFields', () => {
  it('should return agent fields', () => {
    expect(getRequiredFields('agent')).toContain('tools');
  });
  it('should return prompt fields', () => {
    expect(getRequiredFields('prompt')).toContain('model');
  });
});

describe('validateFile', () => {
  it('should validate a complete agent file', () => {
    const content = '---\nname: test\ndescription: desc\ntools: bash\n---\nBody';
    const r = validateFile('agent.md', content);
    expect(r.valid).toBe(true);
  });
  it('should detect missing frontmatter', () => {
    const r = validateFile('agent.md', '# No frontmatter');
    expect(r.valid).toBe(false);
    expect(r.reason).toBe('missing frontmatter');
  });
});

describe('validateAllFiles', () => {
  it('should validate all files via FS port', async () => {
    const results = await validateAllFiles(mockFs, '/root');
    expect(results).toHaveLength(1);
  });
});
