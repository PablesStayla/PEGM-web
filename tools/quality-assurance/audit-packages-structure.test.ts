import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { PackageJson } from '../libraries/types.js';
import {
  calculateScore,
  checkFiles,
  checkPackageStructure,
  checkScripts,
} from './internal/audit-packages-logic.js';

describe('audit-packages', () => {
  describe('checkPackageStructure', () => {
    it('should pass package with all required fields', () => {
      const pkg: PackageJson = {
        name: '@test/package',
        version: '1.0.0',
        main: './dist/index.js',
        module: './dist/index.mjs',
        types: './dist/index.d.ts',
        exports: { '.': './dist/index.js' },
      };

      const checks = checkPackageStructure(pkg);
      const allPassed = checks.every((c) => c.passed);

      expect(allPassed).toBe(true);
      expect(checks.length).toBe(4);
    });

    it('should fail when missing exports', () => {
      const pkg: PackageJson = {
        name: '@test/package',
        version: '1.0.0',
        main: './dist/index.js',
        module: './dist/index.mjs',
        types: './dist/index.d.ts',
      };

      const checks = checkPackageStructure(pkg);
      const exportsCheck = checks.find((c) => c.name === 'exports');

      expect(exportsCheck?.passed).toBe(false);
      expect(exportsCheck?.critical).toBe(true);
    });

    it('should mark all core fields as critical', () => {
      const pkg: PackageJson = {
        name: '@test/package',
        version: '1.0.0',
      };

      const checks = checkPackageStructure(pkg);
      const allCritical = checks.every((c) => c.critical);

      expect(allCritical).toBe(true);
    });

    it('should check for main field', () => {
      const pkg: PackageJson = {
        name: '@test/package',
        version: '1.0.0',
        module: './dist/index.mjs',
        types: './dist/index.d.ts',
        exports: { '.': './dist/index.mjs' },
      };

      const checks = checkPackageStructure(pkg);
      const mainCheck = checks.find((c) => c.name === 'main');

      expect(mainCheck?.passed).toBe(false);
    });

    it('should check for module field', () => {
      const pkg: PackageJson = {
        name: '@test/package',
        version: '1.0.0',
        main: './dist/index.js',
        types: './dist/index.d.ts',
        exports: { '.': './dist/index.js' },
      };

      const checks = checkPackageStructure(pkg);
      const moduleCheck = checks.find((c) => c.name === 'module');

      expect(moduleCheck?.passed).toBe(false);
    });

    it('should check for types field', () => {
      const pkg: PackageJson = {
        name: '@test/package',
        version: '1.0.0',
        main: './dist/index.js',
        module: './dist/index.mjs',
        exports: { '.': './dist/index.js' },
      };

      const checks = checkPackageStructure(pkg);
      const typesCheck = checks.find((c) => c.name === 'types');

      expect(typesCheck?.passed).toBe(false);
    });
  });

  describe('checkScripts', () => {
    it('should check for all required scripts', () => {
      const pkg: PackageJson = {
        name: '@test/package',
        version: '1.0.0',
        scripts: {
          build: 'tsup',
          dev: 'tsup --watch',
          'type-check': 'tsc',
          test: 'vitest',
          lint: 'biome check',
          clean: 'rm -rf dist',
        },
      };

      const checks = checkScripts(pkg);
      const allPassed = checks.every((c) => c.passed);

      expect(allPassed).toBe(true);
    });

    it('should fail when missing required scripts', () => {
      const pkg: PackageJson = {
        name: '@test/package',
        version: '1.0.0',
        scripts: {
          build: 'tsup',
        },
      };

      const checks = checkScripts(pkg);
      const passedCount = checks.filter((c) => c.passed).length;

      expect(passedCount).toBe(1);
      expect(checks.length).toBeGreaterThan(1);
    });

    it('should not mark scripts as critical', () => {
      const pkg: PackageJson = {
        name: '@test/package',
        version: '1.0.0',
      };

      const checks = checkScripts(pkg);
      const allNotCritical = checks.every((c) => !c.critical);

      expect(allNotCritical).toBe(true);
    });
  });

  describe('checkFiles', () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await mkdtemp(join(tmpdir(), 'audit-test-'));
    });

    afterEach(async () => {
      await rm(tempDir, { recursive: true, force: true });
    });

    it('should check for required files', async () => {
      await writeFile(join(tempDir, 'README.md'), '# Test', 'utf-8');
      await writeFile(join(tempDir, 'CHANGELOG.md'), '# Changelog', 'utf-8');

      const checks = checkFiles(tempDir, (p) => {
        const fs = require('node:fs');
        return fs.existsSync(p);
      });
      const allPassed = checks.every((c) => c.passed);

      expect(allPassed).toBe(true);
    });

    it('should fail when missing README', () => {
      const checks = checkFiles('/nonexistent', () => false);
      const readmeCheck = checks.find((c) => c.name.includes('README.md'));

      expect(readmeCheck?.passed).toBe(false);
    });

    it('should fail when missing CHANGELOG', () => {
      const checks = checkFiles('/nonexistent', () => false);
      const changelogCheck = checks.find((c) => c.name.includes('CHANGELOG.md'));

      expect(changelogCheck?.passed).toBe(false);
    });

    it('should not mark files as critical', () => {
      const checks = checkFiles('/nonexistent', () => false);
      const allNotCritical = checks.every((c) => !c.critical);

      expect(allNotCritical).toBe(true);
    });
  });

  describe('calculateScore', () => {
    it('should calculate score correctly', () => {
      const checks = [
        { name: 'a', passed: true, critical: false, message: '' },
        { name: 'b', passed: true, critical: false, message: '' },
        { name: 'c', passed: false, critical: false, message: '' },
        { name: 'd', passed: true, critical: false, message: '' },
      ];

      const score = calculateScore(checks);
      expect(score).toBe(75);
    });

    it('should return 100 for all passing', () => {
      const checks = [
        { name: 'a', passed: true, critical: false, message: '' },
        { name: 'b', passed: true, critical: false, message: '' },
      ];

      const score = calculateScore(checks);
      expect(score).toBe(100);
    });

    it('should return 0 for all failing', () => {
      const checks = [
        { name: 'a', passed: false, critical: false, message: '' },
        { name: 'b', passed: false, critical: false, message: '' },
      ];

      const score = calculateScore(checks);
      expect(score).toBe(0);
    });

    it('should handle empty checks', () => {
      const score = calculateScore([]);
      expect(score).toBe(0);
    });
  });
});
