/**
 * Repository Cleanup Tasks Configuration
 * Declarative configuration of cleanup patterns
 */

/**
 * Cleanup task definition
 */
export interface CleanupTask {
  readonly id: string;
  readonly pattern: string;
  readonly description: string;
}

/**
 * All cleanup tasks - declarative configuration
 */
export const CLEANUP_TASKS = [
  {
    id: 'tsbuildinfo',
    pattern: '**/*.tsbuildinfo',
    description: 'TypeScript build info',
  },
  {
    id: 'turbo',
    pattern: '**/.turbo',
    description: 'Turbo cache',
  },
  {
    id: 'dist',
    pattern: '**/dist',
    description: 'Distribution folders',
  },
  {
    id: 'build',
    pattern: '**/build',
    description: 'Build folders',
  },
  {
    id: 'coverage',
    pattern: '**/coverage',
    description: 'Test coverage',
  },
  {
    id: 'test-outputs',
    pattern: '**/*test-output*.txt',
    description: 'Test output files',
  },
  {
    id: 'temp-files',
    pattern: '**/*.tmp',
    description: 'Temporary files',
  },
  {
    id: 'log-files',
    pattern: '**/*.log',
    description: 'Log files',
  },
  {
    id: 'pnpm-backups',
    pattern: '**/pnpm-lock.yaml.bak',
    description: 'PNPM lock backups',
  },
] as const;

/**
 * Get task by ID
 */
export function getTaskById(id: string): CleanupTask | undefined {
  return CLEANUP_TASKS.find((task) => task.id === id);
}

/**
 * Get all task IDs
 */
export function getTaskIds(): readonly string[] {
  return CLEANUP_TASKS.map((task) => task.id);
}
