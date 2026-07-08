/**
 * Clean Artifacts — Target Definitions
 *
 * Pure data: cleanup target configurations and dangerous patterns.
 * Zero logic, zero I/O.
 */
import type { CleanupTarget } from './clean-artifacts-types.js';

/** Predefined cleanup targets with safety flags */
export const CLEANUP_TARGETS: readonly CleanupTarget[] = [
  {
    name: 'Build Artifacts',
    patterns: ['dist', 'build', 'out'],
    description: 'Compiled output directories',
    safeToDelete: true,
  },
  {
    name: 'Dependencies',
    patterns: ['node_modules'],
    description: 'Installed dependencies',
    safeToDelete: true,
  },
  {
    name: 'Cache Directories',
    patterns: ['.cache', '.turbo', '.vite', '.next/cache'],
    description: 'Build and tooling cache',
    safeToDelete: true,
  },
  {
    name: 'Test Coverage',
    patterns: ['coverage', '.nyc_output'],
    description: 'Test coverage reports',
    safeToDelete: true,
  },
  {
    name: 'TypeScript',
    patterns: ['*.tsbuildinfo', 'tsconfig.tsbuildinfo'],
    description: 'TypeScript build info',
    safeToDelete: true,
  },
  {
    name: 'Logs',
    patterns: ['*.log', 'logs', '.logs'],
    description: 'Log files',
    safeToDelete: true,
  },
  {
    name: 'Temporary Files',
    patterns: ['tmp', 'temp', '*.tmp', '*.temp'],
    description: 'Temporary files and directories',
    safeToDelete: true,
  },
  {
    name: 'IDE Settings',
    patterns: ['.vscode', '.idea', '*.swp', '*.swo'],
    description: 'IDE configuration and swap files',
    safeToDelete: false,
  },
  {
    name: 'Environment Files',
    patterns: ['.env.*', '*.local'],
    description: 'Local environment files',
    safeToDelete: false,
  },
] as const;

/** Patterns that must never be deleted at root level */
export const DANGEROUS_PATTERNS = ['node_modules', '.git', 'src', 'app', 'lib'] as const;
