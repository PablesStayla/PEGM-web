/**
 * =============================================================================
 * 🔍 PRANAKAIA E-COMMERCE - DEAD CODE GUARDIAN (KNIP)
 * =============================================================================
 * Role: Unused Dependency & Export Audit
 * Tier: Absolute Zero (S+)
 * Compliance: SOTA Catalog Integrity
 * Last Updated: 2026-05-05
 * =============================================================================
 */

import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Ignore YAML files and GitHub workflows
  ignore: ['**/*.yml', '**/*.yaml', '.github/**'],

  // Project-wide inclusion
  project: ['**/*.{ts,tsx}'],

  // Workspace-specific entry points for SOTA verification
  workspaces: {
    'apps/web': {
      entry: [
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
        'src/app/**/route.ts',
        'src/middleware.ts',
        'next.config.mjs',
      ],
    },
    'apps/admin': {
      entry: [
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
        'src/app/**/route.ts',
        'src/middleware.ts',
        'next.config.mjs',
      ],
    },
    'packages/db': {
      entry: ['index.ts', 'schema.ts'],
    },
    'packages/auth': {
      entry: ['index.ts', 'server.ts', 'client.ts', 'middleware.ts', 'next-env.d.ts'],
    },
    'packages/core-domain': {
      entry: ['src/index.ts'],
    },
    'packages/ui': {
      entry: ['src/index.ts'],
    },
  },
};

export default config;
