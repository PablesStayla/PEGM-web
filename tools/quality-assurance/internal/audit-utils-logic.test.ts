import { describe, expect, it } from 'vitest';
import { getAllFiles, getRelativePath } from './audit-utils-logic.js';
import type { FileWalkerPort } from './audit-utils-types.js';
import { DEFAULT_WALK_CONFIG } from './audit-utils-types.js';

const mockPort: FileWalkerPort = {
  readdirSync: () => ['src', 'package.json', 'readme.md'],
  statSync: (p: string) => ({
    isDirectory: () => p.endsWith('src'),
    size: 100,
  }),
  resolve: (...paths: string[]) => paths.join('/'),
  extname: (p: string) => {
    const dot = p.lastIndexOf('.');
    return dot >= 0 ? p.slice(dot) : '';
  },
  basename: (p: string) => p.split('/').pop() ?? '',
  cwd: () => '/project',
  relative: (_from: string, to: string) => to,
};

describe('audit-utils-logic', () => {
  describe('getAllFiles', () => {
    it('should walk a flat directory', () => {
      const flatPort: FileWalkerPort = {
        ...mockPort,
        statSync: () => ({ isDirectory: () => false, size: 100 }),
      };
      const result = getAllFiles('/project', flatPort);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should respect excludeDirs', () => {
      const result = getAllFiles('/project', mockPort, {
        ...DEFAULT_WALK_CONFIG,
        excludeDirs: ['src'],
      });
      expect(result.every((f) => !f.includes('/src/'))).toBe(true);
    });

    it('should respect excludeExtensions', () => {
      const result = getAllFiles('/project', mockPort, {
        ...DEFAULT_WALK_CONFIG,
        excludeExtensions: ['.md'],
      });
      expect(result.every((f) => !f.endsWith('.md'))).toBe(true);
    });

    it('should respect maxFileSizeBytes', () => {
      const bigPort: FileWalkerPort = {
        ...mockPort,
        statSync: (p: string) => ({
          isDirectory: () => p.endsWith('src'),
          size: p.includes('big') ? 999999 : 100,
        }),
        readdirSync: () => ['small.ts', 'big.ts'],
      };
      const result = getAllFiles('/project', bigPort, {
        ...DEFAULT_WALK_CONFIG,
        maxFileSizeBytes: 500,
      });
      expect(result.every((f) => !f.includes('big'))).toBe(true);
    });
  });

  describe('getRelativePath', () => {
    it('should return relative path', () => {
      const result = getRelativePath('/project/src/index.ts', mockPort);
      expect(result).toBe('/project/src/index.ts');
    });

    it('should normalize backslashes', () => {
      const winPort: FileWalkerPort = {
        ...mockPort,
        relative: () => 'src\\index.ts',
      };
      const result = getRelativePath('/project/src/index.ts', winPort);
      expect(result).toBe('src/index.ts');
    });
  });
});
