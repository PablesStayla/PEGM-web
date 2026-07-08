import { describe, expect, it } from 'vitest';

describe('validate-agent-metadata', () => {
  describe('parseFrontmatter', () => {
    it('should parse valid frontmatter', async () => {
      const { parseFrontmatter } = await import('./validate-agent-metadata.js');
      const content = `---
name: Test Agent
description: A test agent
---
Content here`;

      const result = parseFrontmatter(content);

      expect(result).toContain('name: Test Agent');
      expect(result).toContain('description: A test agent');
    });

    it('should return null for missing frontmatter', async () => {
      const { parseFrontmatter } = await import('./validate-agent-metadata.js');
      const content = 'No frontmatter here';

      const result = parseFrontmatter(content);

      expect(result).toBeNull();
    });

    it('should handle empty frontmatter', async () => {
      const { parseFrontmatter } = await import('./validate-agent-metadata.js');
      const content = `---
---
Content`;

      const result = parseFrontmatter(content);

      expect(result).toBe('');
    });
  });

  describe('hasField', () => {
    it('should detect existing field', async () => {
      const { hasField } = await import('./validate-agent-metadata.js');
      const frontmatter = 'name: Test\ndescription: Test desc';

      const result = hasField(frontmatter, 'name');

      expect(result).toBe(true);
    });

    it('should return false for missing field', async () => {
      const { hasField } = await import('./validate-agent-metadata.js');
      const frontmatter = 'name: Test';

      const result = hasField(frontmatter, 'description');

      expect(result).toBe(false);
    });
  });

  describe('validateFrontmatter', () => {
    it('should validate when all required fields present', async () => {
      const { validateFrontmatter } = await import('./validate-agent-metadata.js');
      const frontmatter = 'name: Test\ndescription: Desc\ntools: []';

      const result = validateFrontmatter(frontmatter, ['name', 'description', 'tools']);

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should return missing fields', async () => {
      const { validateFrontmatter } = await import('./validate-agent-metadata.js');
      const frontmatter = 'name: Test';

      const result = validateFrontmatter(frontmatter, ['name', 'description']);

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('description');
    });

    it('should handle null frontmatter', async () => {
      const { validateFrontmatter } = await import('./validate-agent-metadata.js');

      const result = validateFrontmatter(null, ['name']);

      expect(result.valid).toBe(false);
      expect(result.missing).toHaveLength(0);
    });
  });

  describe('getFileType', () => {
    it('should identify agent files', async () => {
      const { getFileType } = await import('./validate-agent-metadata.js');

      const result = getFileType('/repo/.github/agents/test.md');

      expect(result).toBe('agent');
    });

    it('should identify prompt files', async () => {
      const { getFileType } = await import('./validate-agent-metadata.js');

      const result = getFileType('/repo/.github/prompts/test.md');

      expect(result).toBe('prompt');
    });
  });

  describe('getRequiredFields', () => {
    it('should return agent fields', async () => {
      const { getRequiredFields } = await import('./validate-agent-metadata.js');

      const result = getRequiredFields('agent');

      expect(result).toContain('name');
      expect(result).toContain('description');
      expect(result).toContain('tools');
    });

    it('should return prompt fields', async () => {
      const { getRequiredFields } = await import('./validate-agent-metadata.js');

      const result = getRequiredFields('prompt');

      expect(result).toContain('name');
      expect(result).toContain('description');
      expect(result).toContain('argument-hint');
      expect(result).toContain('agent');
      expect(result).toContain('model');
    });
  });

  describe('validateFile', () => {
    it('should validate agent file', async () => {
      const { validateFile } = await import('./validate-agent-metadata.js');
      const content = `---
name: Test Agent
description: A test
tools: []
---
Content`;

      const result = validateFile('/repo/.github/agents/test.md', content);

      expect(result.valid).toBe(true);
      expect(result.file).toContain('test.md');
    });

    it('should validate prompt file', async () => {
      const { validateFile } = await import('./validate-agent-metadata.js');
      const content = `---
name: Test Prompt
description: A test prompt
argument-hint: hint
agent: agent1
model: gpt-4
---
Content`;

      const result = validateFile('/repo/.github/prompts/test.md', content);

      expect(result.valid).toBe(true);
    });

    it('should detect missing frontmatter', async () => {
      const { validateFile } = await import('./validate-agent-metadata.js');
      const content = 'No frontmatter';

      const result = validateFile('/repo/.github/agents/test.md', content);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('missing');
    });

    it('should detect missing required fields', async () => {
      const { validateFile } = await import('./validate-agent-metadata.js');
      const content = `---
name: Incomplete
---
Content`;

      const result = validateFile('/repo/.github/agents/test.md', content);

      expect(result.valid).toBe(false);
      expect(result.missing).toBeDefined();
    });
  });

  describe('edge cases - dropshipping scenarios', () => {
    it('should handle vendor agent files', async () => {
      const { validateFile } = await import('./validate-agent-metadata.js');
      const content = `---
name: Vendor Sync Agent
description: Syncs vendor inventory
tools: [inventory-api]
---
Content`;

      const result = validateFile('/repo/.github/agents/vendor-sync.md', content);

      expect(result.valid).toBe(true);
    });

    it('should handle supplier validation files', async () => {
      const { validateFile } = await import('./validate-agent-metadata.js');
      const content = `---
name: Supplier Validator
description: Validates supplier data
tools: [validation]
---
Content`;

      const result = validateFile('/repo/.github/agents/supplier-validator.md', content);

      expect(result.valid).toBe(true);
    });

    it('should handle rate limit monitoring agents', async () => {
      const { validateFile } = await import('./validate-agent-metadata.js');
      const content = `---
name: Rate Limit Monitor
description: Monitors API rate limits
tools: [monitoring]
---
Content`;

      const result = validateFile('/repo/.github/agents/rate-limit-monitor.md', content);

      expect(result.valid).toBe(true);
    });
  });
});
